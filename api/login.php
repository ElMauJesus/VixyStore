<?php
/**
 * Inicio de sesión - Vixy Store & VixyRider Conductores
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

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

apply_security_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos de la tienda"]);
    exit;
}

// Recibir datos desde JSON o POST
$reqData = get_request_data();
$emailOrIdentifier = trim($reqData['email'] ?? '');
$password = $reqData['password'] ?? '';

if (empty($emailOrIdentifier) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Correo y contraseña son obligatorios"]);
    exit;
}

// -----------------------------------------------------------------------------
// PASO 1: Verificar si es Administrador o Personal de Secretaría en Vixy Store
// -----------------------------------------------------------------------------
$sqlAdmin = "SELECT u.*, r.name as role_name 
             FROM users u 
             INNER JOIN roles r ON u.role_id = r.id 
             WHERE (u.email = :email OR u.phone = :phone)
               AND r.name IN ('administrator', 'secretary')
             LIMIT 1";

$stmtAdmin = $pdo->prepare($sqlAdmin);
$stmtAdmin->execute([
    'email' => $emailOrIdentifier,
    'phone' => $emailOrIdentifier
]);
$adminUser = $stmtAdmin->fetch();

if ($adminUser && password_verify($password, $adminUser['password_hash'])) {
    if ($adminUser['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Cuenta de personal inactiva o suspendida"]);
        exit;
    }

    $token = generate_token(64);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

    $sqlUpd = "UPDATE users SET auth_token = :token, token_expires_at = :expires_at WHERE id = :id";
    $stmtUpd = $pdo->prepare($sqlUpd);
    $stmtUpd->execute([
        'token' => $token,
        'expires_at' => $expiresAt,
        'id' => $adminUser['id']
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Inicio de sesión exitoso (Panel Administrativo)",
        "token" => $token,
        "expires_at" => $expiresAt,
        "user" => [
            "id" => (int)$adminUser['id'],
            "first_name" => $adminUser['first_name'],
            "last_name" => $adminUser['last_name'],
            "email" => $adminUser['email'],
            "phone" => $adminUser['phone'],
            "role" => $adminUser['role_name'],
            "status" => $adminUser['status']
        ]
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// PASO 2: Autenticación de Conductores en la BD de VixyRider
// -----------------------------------------------------------------------------
$pdoDriver = getDriverDbConnection();
$driverFound = null;

if ($pdoDriver) {
    try {
        $table = preg_replace('/[^a-zA-Z0-9_]/', '', DRIVER_TABLE);
        $sqlDriver = "SELECT * FROM {$table} 
                      WHERE email = :email OR username = :username OR phone = :phone
                      LIMIT 1";
        $stmtDriver = $pdoDriver->prepare($sqlDriver);
        $stmtDriver->execute([
            'email' => $emailOrIdentifier,
            'username' => $emailOrIdentifier,
            'phone' => $emailOrIdentifier
        ]);
        $driverFound = $stmtDriver->fetch();
    } catch (PDOException $e) {
        error_log("Error al consultar la tabla de conductores: " . $e->getMessage());
    }
}

// Si se encontró en la BD de conductores
if ($driverFound) {
    // Validar estado del conductor
    $driverStatus = strtolower(trim($driverFound['status'] ?? 'activo'));
    if ($driverStatus === 'bloqueado') {
        http_response_code(403);
        echo json_encode([
            "success" => false, 
            "message" => "Tu cuenta de conductor Vixy está bloqueada. Comunícate con soporte."
        ]);
        exit;
    }
    if ($driverStatus === 'rechazado') {
        http_response_code(403);
        echo json_encode([
            "success" => false, 
            "message" => "Tu solicitud de conductor Vixy no fue aprobada."
        ]);
        exit;
    }

    // Verificar contraseña del conductor
    $driverPassHash = $driverFound['password_hash'] ?? '';
    if (empty($driverPassHash) || !password_verify($password, $driverPassHash)) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
        exit;
    }

    // Extraer datos del conductor y vehículo
    $driverId = $driverFound['id']; // varchar(40) UUID
    $driverEmail = $driverFound['email'];
    $driverPhone = $driverFound['phone'] ?? null;
    $riderCode = $driverFound['rider_code'] ?? null;
    $driverCategory = $driverFound['category'] ?? 'conductor'; // 'taxi', 'mototaxi', 'delivery'

    // Formatear información del vehículo
    $docMarca = trim($driverFound['doc_vehiculo_marca'] ?? '');
    $docModelo = trim($driverFound['doc_vehicle_model'] ?? '');
    $docAnio = trim($driverFound['doc_vehicle_year'] ?? '');
    $docPlaca = trim($driverFound['doc_plate_number'] ?? '');
    $docColor = trim($driverFound['doc_vehicle_color'] ?? '');

    $vehicleParts = array_filter([$docMarca, $docModelo, $docAnio, $docColor]);
    $vehicleInfo = implode(' ', $vehicleParts);
    if (!empty($docPlaca)) {
        $vehicleInfo .= " [Placa: {$docPlaca}]";
    }
    if (empty($vehicleInfo)) {
        $vehicleInfo = "Vehículo registrado en VixyRider (" . ucfirst($driverCategory) . ")";
    }

    // Separar nombre y apellido
    $fullName = trim($driverFound['name'] ?? '');
    $nameParts = explode(' ', $fullName);
    $firstName = !empty($nameParts[0]) ? $nameParts[0] : 'Conductor';
    $lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : 'Vixy';

    // Buscar o sincronizar en vixy_store.users
    $sqlStoreUser = "SELECT u.*, r.name as role_name 
                     FROM users u 
                     INNER JOIN roles r ON u.role_id = r.id 
                     WHERE u.driver_uuid = :driver_uuid OR u.email = :email 
                     LIMIT 1";
    $stmtStoreUser = $pdo->prepare($sqlStoreUser);
    $stmtStoreUser->execute([
        'driver_uuid' => $driverId,
        'email' => $driverEmail
    ]);
    $storeUser = $stmtStoreUser->fetch();

    $token = generate_token(64);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

    if ($storeUser) {
        $userId = $storeUser['id'];
        // Actualizar datos del conductor en la tienda
        $sqlUpd = "UPDATE users SET 
                    driver_uuid = :driver_uuid,
                    rider_code = :rider_code,
                    driver_category = :driver_category,
                    vehicle_info = :vehicle_info,
                    first_name = :first_name,
                    last_name = :last_name,
                    phone = :phone,
                    password_hash = :password_hash,
                    auth_token = :token,
                    token_expires_at = :expires_at,
                    status = 'active'
                   WHERE id = :id";
        $stmtUpd = $pdo->prepare($sqlUpd);
        $stmtUpd->execute([
            'driver_uuid' => $driverId,
            'rider_code' => $riderCode,
            'driver_category' => $driverCategory,
            'vehicle_info' => $vehicleInfo,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $driverPhone,
            'password_hash' => $driverPassHash,
            'token' => $token,
            'expires_at' => $expiresAt,
            'id' => $userId
        ]);
    } else {
        // Obtener rol 'customer' (rol de conductor en la tienda)
        $stmtRole = $pdo->query("SELECT id FROM roles WHERE name = 'customer' LIMIT 1");
        $roleRow = $stmtRole->fetch();
        $roleId = $roleRow ? $roleRow['id'] : 3;

        $sqlIns = "INSERT INTO users (
                    role_id, driver_uuid, rider_code, driver_category, vehicle_info,
                    first_name, last_name, email, password_hash, phone,
                    auth_token, token_expires_at, status
                   ) VALUES (
                    :role_id, :driver_uuid, :rider_code, :driver_category, :vehicle_info,
                    :first_name, :last_name, :email, :password_hash, :phone,
                    :token, :expires_at, 'active'
                   )";
        $stmtIns = $pdo->prepare($sqlIns);
        $stmtIns->execute([
            'role_id' => $roleId,
            'driver_uuid' => $driverId,
            'rider_code' => $riderCode,
            'driver_category' => $driverCategory,
            'vehicle_info' => $vehicleInfo,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $driverEmail,
            'password_hash' => $driverPassHash,
            'phone' => $driverPhone,
            'token' => $token,
            'expires_at' => $expiresAt
        ]);
        $userId = $pdo->lastInsertId();
    }

    // Actualizar o crear perfil extendido (customer_profiles)
    $occupation = "Conductor Vixy " . ucfirst($driverCategory);
    if (!empty($riderCode)) {
        $occupation .= " ({$riderCode})";
    }

    $sqlCp = "INSERT INTO customer_profiles (user_id, occupation, equipment_info)
              VALUES (:user_id, :occupation, :equipment_info)
              ON DUPLICATE KEY UPDATE 
                occupation = VALUES(occupation),
                equipment_info = VALUES(equipment_info)";
    $stmtCp = $pdo->prepare($sqlCp);
    $stmtCp->execute([
        'user_id' => $userId,
        'occupation' => $occupation,
        'equipment_info' => $vehicleInfo
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Bienvenido a Vixy Store, Conductor " . htmlspecialchars($firstName),
        "token" => $token,
        "expires_at" => $expiresAt,
        "user" => [
            "id" => (int)$userId,
            "first_name" => $firstName,
            "last_name" => $lastName,
            "email" => $driverEmail,
            "phone" => $driverPhone,
            "role" => "customer",
            "driver_uuid" => $driverId,
            "rider_code" => $riderCode,
            "driver_category" => $driverCategory,
            "vehicle_info" => $vehicleInfo,
            "occupation" => $occupation,
            "equipment_info" => $vehicleInfo
        ]
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// PASO 3: Si la BD de conductores no estaba disponible o el usuario ya estaba en tienda
// -----------------------------------------------------------------------------
$sqlStoreFallback = "SELECT u.*, r.name as role_name 
                     FROM users u 
                     INNER JOIN roles r ON u.role_id = r.id 
                     WHERE u.email = :email OR u.phone = :phone
                     LIMIT 1";
$stmtFallback = $pdo->prepare($sqlStoreFallback);
$stmtFallback->execute([
    'email' => $emailOrIdentifier,
    'phone' => $emailOrIdentifier
]);
$fallbackUser = $stmtFallback->fetch();

if ($fallbackUser && password_verify($password, $fallbackUser['password_hash'])) {
    if ($fallbackUser['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Cuenta inactiva o suspendida"]);
        exit;
    }

    $token = generate_token(64);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

    $sqlUpd = "UPDATE users SET auth_token = :token, token_expires_at = :expires_at WHERE id = :id";
    $stmtUpd = $pdo->prepare($sqlUpd);
    $stmtUpd->execute([
        'token' => $token,
        'expires_at' => $expiresAt,
        'id' => $fallbackUser['id']
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Inicio de sesión exitoso",
        "token" => $token,
        "expires_at" => $expiresAt,
        "user" => [
            "id" => (int)$fallbackUser['id'],
            "first_name" => $fallbackUser['first_name'],
            "last_name" => $fallbackUser['last_name'],
            "email" => $fallbackUser['email'],
            "phone" => $fallbackUser['phone'],
            "role" => $fallbackUser['role_name'],
            "rider_code" => $fallbackUser['rider_code'] ?? null,
            "driver_category" => $fallbackUser['driver_category'] ?? null,
            "vehicle_info" => $fallbackUser['vehicle_info'] ?? null
        ]
    ]);
    exit;
}

// Si no fue encontrado en ninguna base de datos
http_response_code(401);
echo json_encode([
    "success" => false,
    "message" => "Acceso exclusivo para conductores registrados en VixyRider. Si aún no eres conductor, regístrate en la app o plataforma VixyRider."
]);
?>