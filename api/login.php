<?php
/**
 * Inicio de sesión
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

// Recibir datos
$email = validate_email($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email y contraseña son obligatorios"]);
    exit;
}

// Buscar usuario con su rol
$sql = "SELECT u.*, r.name as role_name 
        FROM users u 
        INNER JOIN roles r ON u.role_id = r.id 
        WHERE u.email = :email";

$stmt = $pdo->prepare($sql);
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Credenciales inválidas"]);
    exit;
}

// Verificar contraseña
if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Credenciales inválidas"]);
    exit;
}

// Verificar estado
if ($user['status'] !== 'active') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Cuenta inactiva o suspendida"]);
    exit;
}

// Generar token
$token = generate_token(64);

// Guardar token en la BD
$sql = "UPDATE users SET auth_token = :token WHERE id = :id";
$stmt = $pdo->prepare($sql);
$stmt->execute(['token' => $token, 'id' => $user['id']]);

// Respuesta exitosa
echo json_encode([
    "success" => true,
    "message" => "Inicio de sesión exitoso",
    "token" => $token,
    "user" => [
        "id" => $user['id'],
        "first_name" => $user['first_name'],
        "last_name" => $user['last_name'],
        "email" => $user['email'],
        "phone" => $user['phone'],
        "role" => $user['role_name']
    ]
]);
?>