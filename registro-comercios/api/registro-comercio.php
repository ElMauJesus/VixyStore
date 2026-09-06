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

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Función para guardar archivos de comercio
function saveComercioFile($file, $codigo) {
    $uploadDir = __DIR__ . "/../uploads/comercios/";
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = $codigo . '.' . $extension;
    $destination = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $destination)) {
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

// Validar archivo de foto
if (!isset($_FILES['foto_comercio']) || $_FILES['foto_comercio']['error'] === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "La foto del comercio es obligatoria"]);
    exit;
}

$check = validate_file_upload($_FILES['foto_comercio']);
if (!$check['valid']) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $check['message']]);
    exit;
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

// Generar código
$codigoComercio = generateComercioCode();

// Guardar foto
$fotoUrl = saveComercioFile($_FILES['foto_comercio'], $codigoComercio);

if (!$fotoUrl) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al guardar la foto"]);
    exit;
}

// Insertar en BD
$sql = "INSERT INTO comercios (
            codigo_comercio, tipo_registro, nombre_comercial, nombre_representante,
            rif_cedula_juridica, cedula_representante, email,
            telefono_comercio, telefono_adicional, horarios_atencion,
            ubicacion_gps, punto_referencia, cantidad_sucursales,
            direccion_negocio, categoria_negocio, descripcion_negocio,
            redes_sociales, foto_comercio_url
        ) VALUES (
            :codigo, :tipo_registro, :nombre_comercial, :nombre_representante,
            :rif, :cedula, :email,
            :telefono, :telefono_adicional, :horarios,
            :gps, :referencia, :sucursales,
            :direccion, :categoria, :descripcion,
            :redes, :foto
        )";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'codigo' => $codigoComercio,
        'tipo_registro' => $tipoRegistro,
        'nombre_comercial' => $nombreComercial,
        'nombre_representante' => $nombreRepresentante,
        'rif' => $tipoRegistro === 'rif' ? $rifCedulaJuridica : null,
        'cedula' => $cedulaRepresentante,
        'email' => $email,
        'telefono' => $telefonoComercio,
        'telefono_adicional' => !empty($telefonoAdicional) ? $telefonoAdicional : null,
        'horarios' => !empty($horariosAtencion) ? $horariosAtencion : null,
        'gps' => !empty($ubicacionGps) ? $ubicacionGps : null,
        'referencia' => !empty($puntoReferencia) ? $puntoReferencia : null,
        'sucursales' => $cantidadSucursales,
        'direccion' => $direccionNegocio,
        'categoria' => !empty($categoriaNegocio) ? $categoriaNegocio : null,
        'descripcion' => !empty($descripcionNegocio) ? $descripcionNegocio : null,
        'redes' => !empty($redesSociales) ? $redesSociales : null,
        'foto' => $fotoUrl
    ]);
    
    $comercioId = $pdo->lastInsertId();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Comercio registrado exitosamente",
        "comercio_id" => $comercioId,
        "codigo_comercio" => $codigoComercio,
        "tipo_registro" => $tipoRegistro
    ]);
    
} catch (PDOException $e) {
    // Si falla, borrar la foto subida
    $filePath = __DIR__ . "/.." . $fotoUrl;
    if (file_exists($filePath)) {
        unlink($filePath);
    }
    
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al registrar comercio"]);
}
?>