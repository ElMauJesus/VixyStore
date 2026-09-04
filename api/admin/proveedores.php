<?php
/**
 * Gestión de proveedores (Admin/Secretaria)
 * Vixy Store Backend API
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS");
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

// Solo admin y secretaria
$user = require_role(['administrator', 'secretary']);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        createSupplier($pdo, $user);
        break;
    case 'PUT':
        updateSupplier($pdo, $user);
        break;
    case 'DELETE':
        updateSupplierStatus($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function createSupplier($pdo, $user) {
    $name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
    $contactPerson = isset($_POST['contact_person']) ? sanitize_input($_POST['contact_person']) : '';
    $phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';
    $email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
    $notes = isset($_POST['notes']) ? sanitize_input($_POST['notes']) : '';
    
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "El nombre es obligatorio"]);
        return;
    }
    
    $sql = "INSERT INTO suppliers (name, contact_person, phone, email, notes) 
            VALUES (:name, :contact_person, :phone, :email, :notes)";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'name' => $name,
            'contact_person' => !empty($contactPerson) ? $contactPerson : null,
            'phone' => !empty($phone) ? $phone : null,
            'email' => !empty($email) ? $email : null,
            'notes' => !empty($notes) ? $notes : null
        ]);
        
        $supplierId = $pdo->lastInsertId();
        
        log_audit($user['id'], 'CREATE_SUPPLIER', 'suppliers', $supplierId, ['name' => $name]);
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Proveedor creado",
            "supplier_id" => $supplierId
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al crear proveedor"]);
    }
}

function updateSupplier($pdo, $user) {
    parse_str(file_get_contents("php://input"), $putData);
    
    $supplierId = isset($putData['id']) ? (int)$putData['id'] : 0;
    
    if ($supplierId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del proveedor"]);
        return;
    }
    
    $fields = [];
    $params = ['id' => $supplierId];
    
    $allowedFields = ['name', 'contact_person', 'phone', 'email', 'notes'];
    
    foreach ($allowedFields as $field) {
        if (isset($putData[$field])) {
            $fields[] = "$field = :$field";
            $params[$field] = sanitize_input($putData[$field]);
        }
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No hay campos para actualizar"]);
        return;
    }
    
    $sql = "UPDATE suppliers SET " . implode(', ', $fields) . " WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        log_audit($user['id'], 'UPDATE_SUPPLIER', 'suppliers', $supplierId, $putData);
        
        echo json_encode(["success" => true, "message" => "Proveedor actualizado"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}

function updateSupplierStatus($pdo, $user) {
    $supplierId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $status = isset($_GET['status']) ? sanitize_input($_GET['status']) : '';
    
    if ($supplierId === 0 || empty($status)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id y status"]);
        return;
    }
    
    $allowedStatus = ['active', 'under_review', 'blacklisted'];
    if (!in_array($status, $allowedStatus)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Status inválido"]);
        return;
    }
    
    $sql = "UPDATE suppliers SET status = :status WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['status' => $status, 'id' => $supplierId]);
        
        log_audit($user['id'], 'UPDATE_SUPPLIER_STATUS', 'suppliers', $supplierId, ['status' => $status]);
        
        echo json_encode(["success" => true, "message" => "Estado actualizado"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}
?>