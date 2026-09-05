<?php
/**
 * ==============================================================================
 * VIXY RIDER - REGISTRO DE COMERCIOS - ENDPOINT PRINCIPAL
 * Base de Datos Destino: c2861522_regist
 * ==============================================================================
 */

// Cabeceras CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

// Conexión a la base de datos de registro
$pdo = getRegistDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Error de conexión con la base de datos de registro (c2861522_regist)"
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// GET: Verificación de estado del servicio o consulta rápida de RIF
// -----------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['check_rif'])) {
        $rif = sanitize_input($_GET['check_rif']);
        $stmt = $pdo->prepare("SELECT id, nombre_comercial, status FROM comercios WHERE rif_cedula_juridica = :rif LIMIT 1");
        $stmt->execute(['rif' => $rif]);
        $row = $stmt->fetch();
        if ($row) {
            echo json_encode(["success" => true, "exists" => true, "status" => $row['status']]);
        } else {
            echo json_encode(["success" => true, "exists" => false]);
        }
        exit;
    }

    echo json_encode([
        "success" => true,
        "service" => "Vixy Rider API Registro Comercios",
        "database" => REGIST_DB_NAME,
        "status" => "online",
        "timestamp" => date('Y-m-d H:i:s')
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// POST: Procesar Formulario de Registro
// -----------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

// 1. Sanitizar y normalizar datos recibidos
$nombreComercial    = sanitize_input($_POST['nombre_comercial'] ?? '');
$nombreRepresentante= sanitize_input($_POST['nombre_representante'] ?? '');
$rifCedulaJuridica  = strtoupper(trim(sanitize_input($_POST['rif_cedula_juridica'] ?? '')));
$cedulaRepresentante= strtoupper(trim(sanitize_input($_POST['cedula_representante'] ?? '')));
$emailRaw           = $_POST['email'] ?? '';
$email              = validate_email($emailRaw);
$telefonoComercio   = sanitize_input($_POST['telefono_comercio'] ?? '');
$telefonoAdicional  = sanitize_input($_POST['telefono_adicional'] ?? '');
$horariosAtencion   = sanitize_input($_POST['horarios_atencion'] ?? '');
$ubicacionGps       = sanitize_input($_POST['ubicacion_gps'] ?? '');
$puntoReferencia    = sanitize_input($_POST['punto_referencia'] ?? '');
$cantidadSucursales = isset($_POST['cantidad_sucursales']) && (int)$_POST['cantidad_sucursales'] > 0 
    ? (int)$_POST['cantidad_sucursales'] 
    : 1;
$direccionNegocio   = sanitize_input($_POST['direccion_negocio'] ?? '');
$categoriaNegocio   = sanitize_input($_POST['categoria_negocio'] ?? '');
$descripcionNegocio = sanitize_input($_POST['descripcion_negocio'] ?? '');
$redesSociales      = sanitize_input($_POST['redes_sociales'] ?? '');
$clientIp           = get_client_ip();

// 2. Validar campos obligatorios
$errores = [];
if (empty($nombreComercial))     $errores[] = "El nombre comercial es obligatorio.";
if (empty($nombreRepresentante)) $errores[] = "El nombre del representante legal es obligatorio.";
if (empty($rifCedulaJuridica))   $errores[] = "El RIF o documento jurídico es obligatorio.";
if (empty($cedulaRepresentante)) $errores[] = "La cédula del representante es obligatoria.";
if (!$email)                     $errores[] = "El correo electrónico no es válido o está vacío.";
if (empty($telefonoComercio))   $errores[] = "El teléfono principal del comercio es obligatorio.";
if (empty($direccionNegocio))   $errores[] = "La dirección física del negocio es obligatoria.";

if (!empty($errores)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => implode(" ", $errores), "errors" => $errores]);
    exit;
}

// 3. Validar duplicidad de RIF o Email
try {
    $stmtCheck = $pdo->prepare("SELECT id, rif_cedula_juridica, email FROM comercios WHERE rif_cedula_juridica = :rif OR email = :email LIMIT 1");
    $stmtCheck->execute(['rif' => $rifCedulaJuridica, 'email' => $email]);
    $existente = $stmtCheck->fetch();

    if ($existente) {
        http_response_code(409);
        $motivo = ($existente['rif_cedula_juridica'] === $rifCedulaJuridica) 
            ? "El RIF ya se encuentra registrado." 
            : "El correo electrónico ya fue registrado previamente.";
        echo json_encode(["success" => false, "message" => $motivo]);
        exit;
    }
} catch (PDOException $e) {
    error_log("Error en validación de duplicados: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al verificar registros previos"]);
    exit;
}

// 4. Generar código único de seguimiento de comercio (Ej: COM-20260905-E8F1A2)
$fechaCod = date('Ymd');
$hexRand  = strtoupper(bin2hex(random_bytes(3)));
$codigoComercio = "COM-{$fechaCod}-{$hexRand}";

// 5. Gestión y subida segura de foto del comercio
$fotoUrl = null;
if (isset($_FILES['foto_comercio']) && $_FILES['foto_comercio']['error'] !== UPLOAD_ERR_NO_FILE) {
    $fileCheck = validate_file_upload($_FILES['foto_comercio']);
    if (!$fileCheck['valid']) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => $fileCheck['message']]);
        exit;
    }

    // Carpeta de almacenamiento
    $uploadDir = __DIR__ . "/uploads/comercios/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        // Crear .htaccess de seguridad en la carpeta de uploads para impedir ejecución de scripts
        file_put_contents($uploadDir . ".htaccess", "<FilesMatch \"\.(php|phtml|php5|pl|py|jsp|asp|sh|cgi)$\">\nOrder Deny,Allow\nDeny from all\n</FilesMatch>\nOptions -Indexes\n");
    }

    $ext = $fileCheck['extension'];
    $uniqueFilename = "comercio_" . date('Ymd_His') . "_" . bin2hex(random_bytes(6)) . "." . $ext;
    $targetPath = $uploadDir . $uniqueFilename;

    if (move_uploaded_file($_FILES['foto_comercio']['tmp_name'], $targetPath)) {
        // Generar URL pública relativa
        $baseUrl = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
        $fotoUrl = "{$baseUrl}/uploads/comercios/{$uniqueFilename}";
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "No se pudo guardar la foto del comercio en el servidor."]);
        exit;
    }
}

// 6. Insertar registro en la base de datos c2861522_regist
$sql = "INSERT INTO comercios (
            codigo_comercio, nombre_comercial, nombre_representante,
            rif_cedula_juridica, cedula_representante, email,
            telefono_comercio, telefono_adicional, horarios_atencion,
            ubicacion_gps, punto_referencia, cantidad_sucursales,
            direccion_negocio, categoria_negocio, descripcion_negocio,
            redes_sociales, foto_comercio_url, ip_registro, status
        ) VALUES (
            :codigo, :nombre_comercial, :nombre_representante,
            :rif, :cedula, :email,
            :telefono, :telefono_adicional, :horarios,
            :gps, :referencia, :sucursales,
            :direccion, :categoria, :descripcion,
            :redes, :foto, :ip, 'pendiente'
        )";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'codigo'                => $codigoComercio,
        'nombre_comercial'      => $nombreComercial,
        'nombre_representante'  => $nombreRepresentante,
        'rif'                   => $rifCedulaJuridica,
        'cedula'                => $cedulaRepresentante,
        'email'                 => $email,
        'telefono'              => $telefonoComercio,
        'telefono_adicional'    => !empty($telefonoAdicional) ? $telefonoAdicional : null,
        'horarios'              => !empty($horariosAtencion) ? $horariosAtencion : null,
        'gps'                   => !empty($ubicacionGps) ? $ubicacionGps : null,
        'referencia'            => !empty($puntoReferencia) ? $puntoReferencia : null,
        'sucursales'            => $cantidadSucursales,
        'direccion'             => $direccionNegocio,
        'categoria'             => !empty($categoriaNegocio) ? $categoriaNegocio : null,
        'descripcion'           => !empty($descripcionNegocio) ? $descripcionNegocio : null,
        'redes'                 => !empty($redesSociales) ? $redesSociales : null,
        'foto'                  => $fotoUrl,
        'ip'                    => $clientIp
    ]);

    $comercioId = $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        "success"          => true,
        "message"          => "¡Comercio registrado con éxito!",
        "comercio_id"      => $comercioId,
        "codigo_comercio"  => $codigoComercio,
        "nombre_comercial" => $nombreComercial
    ]);

} catch (PDOException $e) {
    // Si la consulta falla, eliminar la imagen subida para no dejar basura
    if ($fotoUrl && isset($targetPath) && file_exists($targetPath)) {
        @unlink($targetPath);
    }

    error_log("Error al insertar comercio: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Error interno al registrar el comercio en la base de datos."
    ]);
}
?>
