<?php
/**
 * Registro de nuevos clientes
 * Vixy Store Backend API
 */

// Permitir CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Si es OPTIONS, terminar
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

// Obtener conexión
$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
    exit;
}

// Recibir y sanitizar datos JSON o Form Data
$reqData = get_request_data();
$firstName = sanitize_input($reqData['first_name'] ?? '');
$lastName = sanitize_input($reqData['last_name'] ?? '');
$email = validate_email($reqData['email'] ?? '');
$password = $reqData['password'] ?? '';
$phone = sanitize_input($reqData['phone'] ?? '');

// Validar campos requeridos
if (empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
    exit;
}

// Validar longitud de contraseña
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "La contraseña debe tener al menos 8 caracteres"]);
    exit;
}

// Verificar si el email ya existe
$sql = "SELECT id FROM users WHERE email = :email";
$stmt = $pdo->prepare($sql);
$stmt->execute(['email' => $email]);

if ($stmt->rowCount() > 0) {
    http_response_code(409);
    echo json_encode(["success" => false, "message" => "El email ya está registrado"]);
    exit;
}

// Buscar el rol de cliente
$sql = "SELECT id FROM roles WHERE name = 'customer'";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$role = $stmt->fetch();

if (!$role) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Rol de cliente no configurado"]);
    exit;
}

// Encriptar contraseña y generar token
$passwordHash = password_hash($password, PASSWORD_BCRYPT);
$token = generate_token(64);
$expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

// Insertar usuario
$sql = "INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, auth_token, token_expires_at, status) 
        VALUES (:role_id, :first_name, :last_name, :email, :password_hash, :phone, :token, :expires_at, 'active')";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'role_id' => $role['id'],
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => $email,
        'password_hash' => $passwordHash,
        'phone' => !empty($phone) ? $phone : null,
        'token' => $token,
        'expires_at' => $expiresAt
    ]);
    
    $userId = $pdo->lastInsertId();
    
    // Crear perfil de cliente vacío
    $sql = "INSERT INTO customer_profiles (user_id) VALUES (:user_id)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $userId]);
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registro exitoso",
        "token" => $token,
        "expires_at" => $expiresAt,
        "user" => [
            "id" => (int)$userId,
            "first_name" => $firstName,
            "last_name" => $lastName,
            "email" => $email,
            "phone" => $phone,
            "role" => "customer"
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al registrar: " . $e->getMessage()]);
}
?>