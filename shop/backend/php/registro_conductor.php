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
if ($dupCheck->fetch()) {
    Database::jsonResponse([
        'error'   => true,
        'mensaje' => 'Ya existe un conductor registrado con esa cedula, telefono, placa o correo electronico.'
    ], 409);
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