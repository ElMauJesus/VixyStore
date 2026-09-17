<?php
/**
 * Vixy Delivery Platform — Registro de Conductores (Repartidores)
 * Endpoint: POST /backend/php/registro_conductor.php
 *
 * Acepta dos formatos:
 *   1. application/json  → solo campos de texto (compatibilidad previa).
 *   2. multipart/form-data → campos de texto + fotos/documentos (foto_perfil,
 *      cedula_identidad, cedula_reverso, licencia_conducir, carnet_circulacion,
 *      certificado_medico, poliza_rcv, antecedentes). Los archivos se guardan en
 *      el SERVIDOR dentro de /uploads/conductores/{codigo_conductor}/ y en la base
 *      de datos solo se almacenan las RUTAS públicas (mismo esquema que los
 *      comercios). Igual soporta drag & drop del formulario web.
 *
 * Respuesta exitosa:
 *  {
 *    "success": true,
 *    "codigo_conductor": "DRV-20260906-A3F9BC",
 *    "password_temporal": "Mx4nW7qR",
 *    "cedula": "V-24891023"
 *  }
 */

require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method !== 'POST') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Metodo no permitido'], 405);
}

// Datos: si llegan por multipart (formulario con archivos) leer $_POST; si no, JSON.
$isMultipart = !empty($_FILES) || !empty($_POST);
$data        = $isMultipart ? $_POST : Database::getJsonInput();

// ─── Campos Obligatorios ──────────────────────────────────────────────────────
$nombre          = trim($data['nombre'] ?? '');
$apellido        = trim($data['apellido'] ?? '');
$cedula          = trim($data['cedula'] ?? '');
$telefono        = trim($data['telefono'] ?? '');
$email           = trim($data['email'] ?? '');
$fechaNacimiento = trim($data['fecha_nacimiento'] ?? '');
$direccion       = trim($data['direccion'] ?? '');
$ubicacionGps    = trim($data['ubicacion_gps'] ?? ($data['ubicacion'] ?? ''));
$latInit = null;
$lngInit = null;
if (!empty($ubicacionGps)) {
    $uParts = explode(',', $ubicacionGps);
    if (count($uParts) >= 2) {
        $pLat = (float)trim($uParts[0]);
        $pLng = (float)trim($uParts[1]);
        if ($pLat != 0.0 && $pLng != 0.0) {
            $latInit = $pLat;
            $lngInit = $pLng;
        }
    }
}

// Datos de Moto
$motoMarca  = trim($data['moto_marca'] ?? '');
$motoModelo = trim($data['moto_modelo'] ?? '');
$motoColor  = trim($data['moto_color'] ?? '');
$motoPlaca  = trim($data['moto_placa'] ?? '');
$motoAno    = trim($data['moto_ano'] ?? '');
$motoSerialMotor  = trim($data['moto_serial_motor'] ?? '');
$motoSerialChasis = trim($data['moto_serial_chasis'] ?? '');

// Datos personales / permisología
$tipoSangre          = trim($data['tipo_sangre'] ?? '');
$licencia            = trim($data['licencia_conducir'] ?? '');
$licenciaGrado       = trim($data['licencia_grado'] ?? '');
$licenciaVencimiento = trim($data['licencia_vencimiento'] ?? '');
$certMedicoNro       = trim($data['certificado_medico_nro'] ?? '');
$certMedicoVenc      = trim($data['certificado_medico_vencimiento'] ?? '');
$rcvAseguradora      = trim($data['rcv_aseguradora'] ?? '');
$rcvPolizaNro        = trim($data['rcv_poliza_nro'] ?? '');
$rcvVencimiento      = trim($data['rcv_vencimiento'] ?? '');
$fotoUrl             = trim($data['foto_url'] ?? '');

if (empty($nombre) || empty($apellido) || empty($cedula) || empty($telefono)) {
    Database::jsonResponse([
        'error'   => true,
        'mensaje' => 'Los campos nombre, apellido, cedula y telefono son obligatorios.'
    ], 400);
}

if (empty($motoPlaca)) {
    Database::jsonResponse([
        'error'   => true,
        'mensaje' => 'La placa de la moto es obligatoria para el registro de conductores.'
    ], 400);
}

// ─── Conexion a c2861522_regist ───────────────────────────────────────────────
$pdoRegist = Database::getRegistConnection();
if (!$pdoRegist) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'No se puede conectar a la base de datos de registro.'], 500);
}

// ─── Verificar duplicados (cedula, telefono, placa) ──────────────────────────
$dupEmail = ($email !== '') ? $email : 'NO_EMAIL_' . uniqid();

$dupCheck = $pdoRegist->prepare(
    "SELECT id FROM conductores
     WHERE cedula = :cedula
        OR telefono = :tel
        OR moto_placa = :placa
        OR email = :email
     LIMIT 1"
);
$dupCheck->execute([
    'cedula' => $cedula,
    'tel'    => $telefono,
    'placa'  => $motoPlaca,
    'email'  => $dupEmail
]);
$existingCond = $dupCheck->fetch();
if ($existingCond) {
    $existingId = $existingCond['id'];
    $stCod = $pdoRegist->prepare("SELECT codigo_conductor FROM conductores WHERE id = :id LIMIT 1");
    $stCod->execute(['id' => $existingId]);
    $rowCod = $stCod->fetch();
    $codigoConductor = !empty($rowCod['codigo_conductor']) ? $rowCod['codigo_conductor'] : ('DRV-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)));
    $passwordTemporal = '123456';
    $passwordHash = password_hash($passwordTemporal, PASSWORD_BCRYPT);

    $updCond = $pdoRegist->prepare("
        UPDATE conductores 
        SET password_hash = :h,
            codigo_conductor = :c,
            nombre = :n,
            apellido = :a,
            telefono = :t,
            moto_placa = :p,
            estado_registro = 'pendiente_aprobacion',
            verificado_por_admin = 0
        WHERE id = :id
    ");
    $updCond->execute([
        'h' => $passwordHash,
        'c' => $codigoConductor,
        'n' => $nombre,
        'a' => $apellido,
        't' => $telefono,
        'p' => $motoPlaca,
        'id' => $existingId
    ]);

    // Replicar en vixy_dl
    try {
        $pdoDl = Database::getConnection();
        if ($pdoDl) {
            $pdoDl->prepare("
                UPDATE conductores 
                SET password_hash = :h,
                    codigo_conductor = :c,
                    nombre = :n,
                    apellido = :a,
                    telefono = :t,
                    status = 'pendiente',
                    estado_registro = 'pendiente_aprobacion',
                    verificado_por_admin = 0,
                    disponible = 0
                WHERE cedula = :ced OR id = :id OR codigo_conductor = :c
            ")->execute([
                'h' => $passwordHash,
                'c' => $codigoConductor,
                'n' => $nombre,
                'a' => $apellido,
                't' => $telefono,
                'ced' => $cedula,
                'id' => $existingId
            ]);
        }
    } catch (Throwable $eSync) {}

    Database::jsonResponse([
        'success'           => true,
        'id'                => $existingId,
        'codigo_conductor'  => $codigoConductor,
        'password_temporal' => $passwordTemporal,
        'cedula'            => $cedula,
        'mensaje'           => '¡Registro de conductor verificado y actualizado con éxito! Tu contraseña temporal es 123456.'
    ], 200);
}

// ─── Generar codigo unico de conductor ───────────────────────────────────────
function generarCodigoConductor(PDO $pdo): string {
    $intentos = 0;
    do {
        $codigo = 'DRV-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $st = $pdo->prepare("SELECT id FROM conductores WHERE codigo_conductor = :c LIMIT 1");
        $st->execute(['c' => $codigo]);
        $intentos++;
    } while ($st->fetch() && $intentos < 10);
    return $codigo;
}

$codigoConductor = generarCodigoConductor($pdoRegist);

// ─── Generar contrasena temporal ──────────────────────────────────────────────
function generarPasswordTemporal(int $longitud = 8): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    $pass = '';
    for ($i = 0; $i < $longitud; $i++) {
        $pass .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $pass;
}

$passwordTemporal = generarPasswordTemporal(8);
$passwordHash     = password_hash($passwordTemporal, PASSWORD_BCRYPT);

// ─── Almacenamiento de fotos/documentos en el servidor (como comercios) ──────
// Carpeta individual por conductor: /uploads/conductores/{codigo}/
$baseUrl   = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$uploadDir = __DIR__ . '/uploads/conductores/' . $codigoConductor . '/';
$carpetaImagenes = "{$baseUrl}/uploads/conductores/{$codigoConductor}/";

$fotoUrls = [
    'foto_perfil_url'           => null,
    'foto_cedula_url'           => null,
    'foto_cedula_reverso_url'   => null,
    'foto_licencia_url'         => null,
    'foto_carnet_url'           => null,
    'foto_certificado_medico_url' => null,
    'foto_rcv_url'              => null,
    'foto_antecedentes_url'     => null,
];

// Mapeo: nombre del campo en el form → nombre canonico del archivo + columna SQL
$fileMap = [
    'foto_perfil'          => ['foto_perfil.jpg',                 'foto_perfil_url'],
    'cedula_identidad'     => ['cedula_identidad.jpg',            'foto_cedula_url'],
    'cedula_reverso'       => ['cedula_reverso.jpg',              'foto_cedula_reverso_url'],
    'licencia_conducir'    => ['licencia_conducir.jpg',           'foto_licencia_url'],
    'carnet_circulacion'   => ['carnet_circulacion.jpg',          'foto_carnet_url'],
    'certificado_medico'   => ['certificado_medico.jpg',          'foto_certificado_medico_url'],
    'poliza_rcv'           => ['poliza_rcv.jpg',                  'foto_rcv_url'],
    'antecedentes'         => ['antecedentes.jpg',                'foto_antecedentes_url'],
];

function moverArchivoConductor(array $file, string $targetPath): bool {
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    if ($file['size'] > 5 * 1024 * 1024) { // 5 MB
        return false;
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($file['tmp_name']);
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        return false;
    }
    return move_uploaded_file($file['tmp_name'], $targetPath);
}

$archivosAceptados = 0;
if (!empty($_FILES)) {
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }
    foreach ($fileMap as $campo => [$nombreArchivo, $columna]) {
        if (isset($_FILES[$campo]) && $_FILES[$campo]['error'] === UPLOAD_ERR_OK) {
            if (moverArchivoConductor($_FILES[$campo], $uploadDir . $nombreArchivo)) {
                $fotoUrls[$columna] = $carpetaImagenes . $nombreArchivo;
                $archivosAceptados++;
            }
        }
    }
    // Si se subió la foto de perfil, también se usa como foto_url (avatar)
    if (!empty($fotoUrls['foto_perfil_url'])) {
        $fotoUrl = $fotoUrls['foto_perfil_url'];
    }
    if ($archivosAceptados === 0 && !empty($_FILES)) {
        Database::jsonResponse([
            'error'   => true,
            'mensaje' => 'No se pudo guardar ninguno de los archivos. Verifique que sean imágenes JPG, PNG o WebP de máximo 5MB.'
        ], 400);
    }
}

// Garantizar carpeta_imagenes solo si al menos se guardó un archivo
if ($archivosAceptados === 0) {
    $carpetaImagenes = null;
}

// ─── Insertar en base de datos ────────────────────────────────────────────────
try {
    $sql = "
        INSERT INTO conductores (
            codigo_conductor, password_hash,
            nombre, apellido, cedula, telefono, email,
            fecha_nacimiento, direccion,
            moto_marca, moto_modelo, moto_color, moto_placa, moto_ano,
            moto_serial_motor, moto_serial_chasis,
            licencia_conducir, foto_url,
            tipo_sangre, licencia_grado, licencia_vencimiento,
            certificado_medico_nro, certificado_medico_vencimiento,
            rcv_aseguradora, rcv_poliza_nro, rcv_vencimiento,
            carpeta_imagenes,
            foto_perfil_url, foto_cedula_url, foto_cedula_reverso_url,
            foto_licencia_url, foto_carnet_url, foto_certificado_medico_url,
            foto_rcv_url, foto_antecedentes_url,
            status, created_at
        ) VALUES (
            :codigo, :phash,
            :nombre, :apellido, :cedula, :tel, :email,
            :fnac, :dir,
            :mmarca, :mmodelo, :mcolor, :mplaca, :mano,
            :mserialmotor, :mserialchasis,
            :licencia, :foto,
            :tsangre, :lgrado, :lvenc,
            :cmnro, :cmvenc,
            :rcvaseg, :rcvnro, :rcvvenc,
            :carpeta,
            :fperfil, :fcedula, :fcedreverso,
            :flicencia, :fcarnet, :fcertmed,
            :frcv, :fantec,
            'pendiente', NOW()
        )
    ";
    $stmt = $pdoRegist->prepare($sql);
    $stmt->execute([
        'codigo'        => $codigoConductor,
        'phash'         => $passwordHash,
        'nombre'        => $nombre,
        'apellido'      => $apellido,
        'cedula'        => $cedula,
        'tel'           => $telefono,
        'email'         => $email,
        'fnac'          => $fechaNacimiento ?: null,
        'dir'           => $direccion,
        'mmarca'        => $motoMarca,
        'mmodelo'       => $motoModelo,
        'mcolor'        => $motoColor,
        'mplaca'        => strtoupper($motoPlaca),
        'mano'          => $motoAno,
        'mserialmotor'  => $motoSerialMotor ?: null,
        'mserialchasis' => $motoSerialChasis ?: null,
        'licencia'      => $licencia,
        'foto'          => $fotoUrl ?: null,
        'tsangre'       => $tipoSangre ?: null,
        'lgrado'        => $licenciaGrado ?: null,
        'lvenc'         => $licenciaVencimiento ?: null,
        'cmnro'         => $certMedicoNro ?: null,
        'cmvenc'        => $certMedicoVenc ?: null,
        'rcvaseg'       => $rcvAseguradora ?: null,
        'rcvnro'        => $rcvPolizaNro ?: null,
        'rcvvenc'       => $rcvVencimiento ?: null,
        'carpeta'       => $carpetaImagenes,
        'fperfil'       => $fotoUrls['foto_perfil_url'],
        'fcedula'       => $fotoUrls['foto_cedula_url'],
        'fcedreverso'   => $fotoUrls['foto_cedula_reverso_url'],
        'flicencia'     => $fotoUrls['foto_licencia_url'],
        'fcarnet'       => $fotoUrls['foto_carnet_url'],
        'fcertmed'      => $fotoUrls['foto_certificado_medico_url'],
        'frcv'          => $fotoUrls['foto_rcv_url'],
        'fantec'        => $fotoUrls['foto_antecedentes_url'],
    ]);
} catch (PDOException $e) {
    error_log('Error registro conductor: ' . $e->getMessage());
    Database::jsonResponse([
        'error'   => true,
        'mensaje' => 'Error al registrar el conductor. Por favor intente de nuevo.',
        'detalle' => $e->getMessage()
    ], 500);
}

// ─── Replicar en c2861522_vixy_dl (Base Operativa Delivery) ────────────────────
try {
    $pdoDl = Database::getConnection();
    if ($pdoDl) {
        $colsDl = array_column($pdoDl->query('SHOW COLUMNS FROM conductores')->fetchAll(), 'Field');
        $stCheckDl = $pdoDl->prepare("SELECT id FROM conductores WHERE cedula = :c OR telefono = :t OR id = :id2 LIMIT 1");
        $stCheckDl->execute(['c' => $cedula, 't' => $telefono, 'id2' => $codigoConductor]);
        if (!$stCheckDl->fetch()) {
            $insDl = [
                'id'                             => $codigoConductor,
                'codigo_conductor'               => $codigoConductor,
                'nombre'                         => $nombre,
                'apellido'                       => $apellido,
                'cedula'                         => $cedula,
                'telefono'                       => $telefono,
                'email'                          => $email,
                'password_hash'                  => $passwordHash,
                'foto_url'                       => $fotoUrls['foto_perfil_url'] ?: ($fotoUrls['foto_cedula_url'] ?: null),
                'placa_moto'                     => strtoupper($motoPlaca),
                'marca_moto'                     => $motoMarca,
                'modelo_moto'                    => $motoModelo,
                'ano_moto'                       => $motoAno,
                'color_moto'                     => $motoColor,
                'latitud_actual'                 => $latInit,
                'longitud_actual'                => $lngInit,
                'ubicacion_actual'               => $ubicacionGps ?: null,
                'moto_serial_motor'              => $motoSerialMotor ?: null,
                'moto_serial_chasis'             => $motoSerialChasis ?: null,
                'licencia_grado'                 => $licenciaGrado ?: null,
                'licencia_conducir'              => $licencia,
                'disponible'                     => 0,
                'en_carrera'                     => 0,
                'saldo_billetera_usd'            => 0.00,
                'limite_saldo_negativo'          => -0.50,
                'bloqueado_por_saldo'            => 0,
                'status'                         => 'pendiente',
                'estado_registro'                => 'pendiente_aprobacion',
                'verificado_por_admin'           => 0,
                'carpeta_imagenes'               => $carpetaImagenes,
                'foto_perfil_url'                => $fotoUrls['foto_perfil_url'],
                'foto_cedula_url'                => $fotoUrls['foto_cedula_url'],
                'foto_cedula_reverso_url'        => $fotoUrls['foto_cedula_reverso_url'],
                'foto_licencia_url'              => $fotoUrls['foto_licencia_url'],
                'foto_carnet_url'                => $fotoUrls['foto_carnet_url'],
                'foto_carnet_circulacion_url'    => $fotoUrls['foto_carnet_url'],
                'foto_certificado_medico_url'    => $fotoUrls['foto_certificado_medico_url'],
                'foto_rcv_url'                   => $fotoUrls['foto_rcv_url'],
                'foto_antecedentes_url'          => $fotoUrls['foto_antecedentes_url'],
                'ultima_actualizacion'           => date('Y-m-d H:i:s')
            ];
            $insDl = array_intersect_key($insDl, array_flip($colsDl));
            $colNamesDl = array_keys($insDl);
            $pdoDl->prepare("INSERT INTO conductores (`" . implode('`, `', $colNamesDl) . "`) VALUES (:" . implode(', :', $colNamesDl) . ")")->execute($insDl);
        }
    }
} catch (Throwable $eDl) {
    error_log('Error replicando conductor en vixy_dl: ' . $eDl->getMessage());
}

// ─── Respuesta exitosa ────────────────────────────────────────────────────────
Database::jsonResponse([
    'success'           => true,
    'mensaje'           => 'Solicitud de conductor enviada exitosamente. Un operador revisara tu documentacion y aprobara tu cuenta.',
    'codigo_conductor'  => $codigoConductor,
    'password_temporal' => $passwordTemporal,
    'cedula'            => $cedula,
    'archivos_guardados'=> $archivosAceptados,
    'carpeta_imagenes'  => $carpetaImagenes,
    'instrucciones'     => 'Guarda estos datos. Una vez aprobado, usaras tu cedula (o telefono) + Codigo de Conductor + contrasena para iniciar sesion en la App Vixy Conductor. Podras cambiarla desde tu perfil.'
], 201);