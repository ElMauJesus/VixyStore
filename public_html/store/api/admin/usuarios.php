<?php
/**
 * Gestión de usuarios (Solo Admin)
 * Vixy Store Backend API
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../security.php';
require_once __DIR__ . '/../auth.php';

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Solo admin
$user = require_role(['administrator']);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        listUsers($pdo);
        break;
    case 'PUT':
        updateUser($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function listUsers($pdo) {
    $sql = "SELECT 
                u.id, u.first_name, u.last_name, u.email, u.phone,
                u.status, u.created_at,
                r.name as role_name
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "message" => "Usuarios obtenidos",
            "data" => $users
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener usuarios"]);
    }
}

function updateUser($pdo, $user) {
    parse_str(file_get_contents("php://input"), $putData);
    
    $userId = isset($putData['id']) ? (int)$putData['id'] : 0;
    
    if ($userId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del usuario"]);
        return;
    }
    
    // Obtener datos anteriores
    $sql = "SELECT status, role_id FROM users WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $userId]);
    $previous = $stmt->fetch();
    
    if (!$previous) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        return;
    }
    
    $fields = [];
    $params = ['id' => $userId];
    
    // Cambiar status
    if (isset($putData['status'])) {
        $status = sanitize_input($putData['status']);
        $allowedStatus = ['active', 'inactive', 'suspended'];
        if (!in_array($status, $allowedStatus)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Status inválido"]);
            return;
        }
        $fields[] = "status = :status";
        $params['status'] = $status;
    }
    
    // Cambiar rol
    if (isset($putData['role_id'])) {
        $roleId = (int)$putData['role_id'];
        
        // Verificar que el rol exista
        $sql = "SELECT id FROM roles WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $roleId]);
        if ($stmt->rowCount() === 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Rol inválido"]);
            return;
        }
        
        $fields[] = "role_id = :role_id";
        $params['role_id'] = $roleId;
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No hay campos para actualizar"]);
        return;
    }
    
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        log_audit($user['id'], 'UPDATE_USER', 'users', $userId, [
            'previous' => $previous,
            'changes' => $putData
        ]);
        
        echo json_encode(["success" => true, "message" => "Usuario actualizado"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}
?>