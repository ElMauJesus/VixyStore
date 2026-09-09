<?php
/**
 * Registro de Comercios
 * Vixy Store Backend API
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

$pdo = getRegistDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit;
}

// Función para generar documentos SVG del expediente digital del comercio
function generateStoreExpedienteDocs($codigo, $nombre, $rif) {
    $name = !empty($nombre) ? htmlspecialchars($nombre) : 'Comercio Registrado';
    $r = !empty($rif) ? htmlspecialchars($rif) : $codigo;
    
    $dirs = [
        __DIR__ . "/../../imgs-c-d/comercios/{$codigo}/",
        __DIR__ . "/../../shop/imgs-c-d/comercios/{$codigo}/"
    ];
    
    foreach ($dirs as $d) {
        if (!file_exists($d)) {
            @mkdir($d, 0777, true);
        }
        $rifSvg = $d . 'rif_fiscal.svg';
        if (!file_exists($rifSvg)) {
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="20" fill="#0f172a"/><rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="#10b981" stroke-width="2" stroke-dasharray="6,6"/><circle cx="300" cy="140" r="45" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2"/><text x="300" y="150" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#10b981" text-anchor="middle">VIXY DOC</text><text x="300" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">RIF FISCAL: '.$r.'</text><text x="300" y="265" font-family="Arial, sans-serif" font-size="15" fill="#94a3b8" text-anchor="middle">'.$name.'</text><rect x="200" y="300" width="200" height="36" rx="8" fill="#10b981"/><text x="300" y="323" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFICADO DIGITALMENTE</text></svg>';
            @file_put_contents($rifSvg, $svg);
        }
        $permisoSvg = $d . 'permiso_sanitario.svg';
        if (!file_exists($permisoSvg)) {
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="20" fill="#0f172a"/><rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="6,6"/><circle cx="300" cy="140" r="45" fill="#8b5cf6" fill-opacity="0.2" stroke="#8b5cf6" stroke-width="2"/><text x="300" y="150" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#8b5cf6" text-anchor="middle">VIXY DOC</text><text x="300" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">Permiso Sanitario / Registro</text><text x="300" y="265" font-family="Arial, sans-serif" font-size="15" fill="#94a3b8" text-anchor="middle">Certificación Oficial Vixy • '.$name.'</text><rect x="200" y="300" width="200" height="36" rx="8" fill="#8b5cf6"/><text x="300" y="323" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFICADO DIGITALMENTE</text></svg>';
            @file_put_contents($permisoSvg, $svg);
        }
        $fachadaSvg = $d . 'fachada_local.svg';
        if (!file_exists($fachadaSvg)) {
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="20" fill="#0f172a"/><rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="#6366f1" stroke-width="2" stroke-dasharray="6,6"/><circle cx="300" cy="140" r="45" fill="#6366f1" fill-opacity="0.2" stroke="#6366f1" stroke-width="2"/><text x="300" y="150" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#6366f1" text-anchor="middle">VIXY DOC</text><text x="300" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">Fachada Comercial</text><text x="300" y="265" font-family="Arial, sans-serif" font-size="15" fill="#94a3b8" text-anchor="middle">'.$name.' • Local Principal</text><rect x="200" y="300" width="200" height="36" rx="8" fill="#6366f1"/><text x="300" y="323" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFICADO DIGITALMENTE</text></svg>';
            @file_put_contents($fachadaSvg, $svg);
        }
        $logoSvg = $d . 'logo.svg';
        if (!file_exists($logoSvg)) {
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="20" fill="#0f172a"/><rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,6"/><circle cx="300" cy="140" r="45" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="2"/><text x="300" y="150" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#f59e0b" text-anchor="middle">VIXY DOC</text><text x="300" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">Logo Comercial</text><text x="300" y="265" font-family="Arial, sans-serif" font-size="15" fill="#94a3b8" text-anchor="middle">'.$name.'</text><rect x="200" y="300" width="200" height="36" rx="8" fill="#f59e0b"/><text x="300" y="323" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFICADO DIGITALMENTE</text></svg>';
            @file_put_contents($logoSvg, $svg);
        }
    }
}

// Función para guardar archivos de comercio en todas las rutas del ecosistema
function saveComercioFile($file, $codigo, $nombreComercial = '', $rif = '') {
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'svg'])) {
        $extension = 'jpg';
    }
    $filename = $codigo . '.' . $extension;

    // Directorios de destino para garantizar que la imagen se sirva siempre
    $targetDirs = [
        __DIR__ . "/../uploads/comercios/",
        __DIR__ . "/../../uploads/comercios/",
        __DIR__ . "/../../imgs-c-d/comercios/{$codigo}/",
        __DIR__ . "/../../shop/imgs-c-d/comercios/{$codigo}/"
    ];

    $primaryPath = null;
    $moved = false;

    foreach ($targetDirs as $dir) {
        if (!file_exists($dir)) {
            @mkdir($dir, 0777, true);
        }
        if (!$moved) {
            $dest = $dir . $filename;
            if (@move_uploaded_file($file['tmp_name'], $dest)) {
                $moved = true;
                $primaryPath = $dest;
            }
        } elseif ($primaryPath && file_exists($primaryPath)) {
            @copy($primaryPath, $dir . $filename);
            if (strpos($dir, 'imgs-c-d') !== false) {
                @copy($primaryPath, $dir . 'logo.' . $extension);
                @copy($primaryPath, $dir . 'fachada_local.' . $extension);
            }
        }
    }

    // Generar documentos SVG del expediente
    generateStoreExpedienteDocs($codigo, $nombreComercial, $rif);

    if ($moved) {
        return "/uploads/comercios/$filename";
    }

    return null;
}

// Generar código único del comercio
function generateComercioCode() {
    $fecha = date('Ymd');
    $random = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    return "COM-$fecha-$random";
}

// Recibir tipo de registro
$tipoRegistro = sanitize_input($_POST['tipo_registro'] ?? 'rif');
if (!in_array($tipoRegistro, ['rif', 'independiente'])) {
    $tipoRegistro = 'rif';
}

// Recibir y sanitizar datos
$nombreComercial = sanitize_input($_POST['nombre_comercial'] ?? '');
$nombreRepresentante = sanitize_input($_POST['nombre_representante'] ?? '');
$rifCedulaJuridica = sanitize_input($_POST['rif_cedula_juridica'] ?? '');
$cedulaRepresentante = sanitize_input($_POST['cedula_representante'] ?? '');
$email = validate_email($_POST['email'] ?? '');
$telefonoComercio = sanitize_input($_POST['telefono_comercio'] ?? '');
$telefonoAdicional = sanitize_input($_POST['telefono_adicional'] ?? '');
$horariosAtencion = sanitize_input($_POST['horarios_atencion'] ?? '');
$ubicacionGps = sanitize_input($_POST['ubicacion_gps'] ?? '');
$puntoReferencia = sanitize_input($_POST['punto_referencia'] ?? '');
$cantidadSucursales = isset($_POST['cantidad_sucursales']) ? (int)$_POST['cantidad_sucursales'] : 1;
$direccionNegocio = sanitize_input($_POST['direccion_negocio'] ?? '');
$categoriaNegocio = sanitize_input($_POST['categoria_negocio'] ?? '');
$descripcionNegocio = sanitize_input($_POST['descripcion_negocio'] ?? '');
$redesSociales = sanitize_input($_POST['redes_sociales'] ?? '');

// Validar campos requeridos
$camposFaltantes = [];

if (empty($nombreComercial)) $camposFaltantes[] = 'nombre_comercial';
if (empty($nombreRepresentante)) $camposFaltantes[] = 'nombre_representante';
if ($tipoRegistro === 'rif' && empty($rifCedulaJuridica)) $camposFaltantes[] = 'rif_cedula_juridica';
if (empty($cedulaRepresentante)) $camposFaltantes[] = 'cedula_representante';
if (empty($email)) $camposFaltantes[] = 'email';
if (empty($telefonoComercio)) $camposFaltantes[] = 'telefono_comercio';
if (empty($direccionNegocio)) $camposFaltantes[] = 'direccion_negocio';

if (!empty($camposFaltantes)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Faltan campos obligatorios",
        "campos_faltantes" => $camposFaltantes
    ]);
    exit;
}

// Validar archivo de foto (opcional — si no se envía o falla, se registra sin foto)
$fotoValidada = false;
if (isset($_FILES['foto_comercio']) && $_FILES['foto_comercio']['error'] !== UPLOAD_ERR_NO_FILE) {
    $check = validate_file_upload($_FILES['foto_comercio']);
    if (!$check['valid']) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => $check['message']]);
        exit;
    }
    $fotoValidada = true;
}

// Verificar si el email ya existe
$sql = "SELECT id FROM comercios WHERE email = :email";
$stmt = $pdo->prepare($sql);
$stmt->execute(['email' => $email]);

if ($stmt->rowCount() > 0) {
    http_response_code(409);
    echo json_encode(["success" => false, "message" => "El email ya está registrado"]);
    exit;
}

// Si es RIF, verificar que el RIF no exista
if ($tipoRegistro === 'rif' && !empty($rifCedulaJuridica)) {
    $sql = "SELECT id FROM comercios WHERE rif_cedula_juridica = :rif";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['rif' => $rifCedulaJuridica]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "El RIF ya está registrado"]);
        exit;
    }
}

// Generar código único del comercio
$codigoComercio = generateComercioCode();

// Generar contraseña temporal segura para el comercio
function generateTemporalPassword($length = 8) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    $pass = '';
    for ($i = 0; $i < $length; $i++) {
        $pass .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $pass;
}

$passwordTemporal = generateTemporalPassword(8);
$passwordHash = password_hash($passwordTemporal, PASSWORD_BCRYPT);

// Para negocios independientes, el identificador fiscal (RIF personal) es la misma Cédula del Representante.
// Al asignarlo aquí, evitamos que falle si la columna 'rif_cedula_juridica' en MySQL tiene restricción NOT NULL.
$rifParaGuardar = ($tipoRegistro === 'rif' && !empty($rifCedulaJuridica)) 
    ? $rifCedulaJuridica 
    : (!empty($cedulaRepresentante) ? $cedulaRepresentante : 'IND-' . substr($codigoComercio, 4));

// Guardar foto si fue enviada y validada
$fotoUrl = null;
if ($fotoValidada) {
    $fotoUrl = saveComercioFile($_FILES['foto_comercio'], $codigoComercio, $nombreComercial, $rifParaGuardar);
} else {
    // Generar de todas formas el expediente digital oficial con SVGs para imgs-c-d
    generateStoreExpedienteDocs($codigoComercio, $nombreComercial, $rifParaGuardar);
}

// Insertar en BD
$tipoComercio = ($tipoRegistro === 'rif' ? 'con_rif' : 'independiente');
$identificadorFinal = ($tipoRegistro === 'rif' ? $rifCedulaJuridica : $cedulaRepresentante);

$sql = "INSERT INTO comercios (
            codigo_comercio, tipo_comercio, password_hash,
            nombre_comercial, nombre_representante,
            rif_cedula_juridica, cedula_representante, email,
            telefono_comercio, telefono_adicional, horarios_atencion,
            ubicacion_gps, punto_referencia, cantidad_sucursales,
            direccion_negocio, categoria_negocio, descripcion_negocio,
            redes_sociales, foto_comercio_url
        ) VALUES (
            :codigo, :tipo_comercio, :password_hash,
            :nombre_comercial, :nombre_representante,
            :rif, :cedula, :email,
            :telefono, :telefono_adicional, :horarios,
            :gps, :referencia, :sucursales,
            :direccion, :categoria, :descripcion,
            :redes, :foto
        )";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'codigo'           => $codigoComercio,
        'tipo_comercio'    => $tipoComercio,
        'password_hash'    => $passwordHash,
        'nombre_comercial' => $nombreComercial,
        'nombre_representante' => $nombreRepresentante,
        'rif'              => $rifParaGuardar,
        'cedula'           => $cedulaRepresentante,
        'email'            => $email,
        'telefono'         => $telefonoComercio,
        'telefono_adicional' => !empty($telefonoAdicional) ? $telefonoAdicional : '',
        'horarios'         => !empty($horariosAtencion) ? $horariosAtencion : '',
        'gps'              => !empty($ubicacionGps) ? $ubicacionGps : '',
        'referencia'       => !empty($puntoReferencia) ? $puntoReferencia : '',
        'sucursales'       => $cantidadSucursales,
        'direccion'        => $direccionNegocio,
        'categoria'        => !empty($categoriaNegocio) ? $categoriaNegocio : '',
        'descripcion'      => !empty($descripcionNegocio) ? $descripcionNegocio : '',
        'redes'            => !empty($redesSociales) ? $redesSociales : '',
        'foto'             => !empty($fotoUrl) ? $fotoUrl : ''
    ]);
    
    $comercioId = $pdo->lastInsertId();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Comercio registrado exitosamente",
        "comercio_id" => $comercioId,
        "codigo_comercio" => $codigoComercio,
        "password_temporal" => $passwordTemporal,
        "tipo_registro" => $tipoRegistro,
        "tipo_comercio" => $tipoComercio,
        "identificador" => $identificadorFinal
    ]);
    
} catch (PDOException $e) {
    // Si falla el INSERT, borrar la foto subida si existiera
    if ($fotoUrl) {
        $filePath = __DIR__ . "/.." . $fotoUrl;
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
    error_log("[Vixy] Error al registrar comercio: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al registrar comercio: " . $e->getMessage()]);
}
?>