<?php
/**
 * Módulo de Autenticación y Roles
 * Vixy Store Backend API
 */

// Evitar acceso directo a este archivo
if (basename($_SERVER['PHP_SELF']) === 'auth.php') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

/**
 * Verifica si el usuario está autenticado
 * Devuelve los datos del usuario o null
 */
function require_login() {
    $token = get_bearer_token();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "No autenticado"]);
        exit;
    }
    
    $pdo = getDbConnection();
    if (!$pdo) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error de conexión"]);
        exit;
    }
    
    $sql = "SELECT u.*, r.name as role_name 
            FROM users u 
            INNER JOIN roles r ON u.role_id = r.id 
            WHERE u.auth_token = :token 
              AND u.status = 'active'
              AND (u.token_expires_at IS NULL OR u.token_expires_at > NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['token' => $token]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Sesión inválida o expirada"]);
        exit;
    }
    
    // Proteger hash de contraseña
    unset($user['password_hash']);
    
    return $user;
}

/**
 * Verifica que el usuario tenga el rol requerido
 */
function require_role($allowedRoles) {
    $user = require_login();
    
    if (!in_array($user['role_name'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No tiene permisos para esta acción"]);
        exit;
    }
    
    return $user;
}

/**
 * Registra una acción en audit_logs
 */
function log_audit($userId, $action, $entityType, $entityId, $details = null) {
    $pdo = getDbConnection();
    if (!$pdo) return false;
    
    $sql = "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) 
            VALUES (:user_id, :action, :entity_type, :entity_id, :details, :ip_address)";
    
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([
        'user_id' => $userId,
        'action' => $action,
        'entity_type' => $entityType,
        'entity_id' => $entityId,
        'details' => $details ? json_encode($details) : null,
        'ip_address' => get_client_ip()
    ]);
}
?>