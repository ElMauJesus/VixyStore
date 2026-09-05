<?php
/**
 * Gestión de proveedores (Admin/Secretaria)
 * Vixy Store Backend API
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../security.php';
require_once __DIR__ . '/../auth.php';

apply_security_headers();

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Solo admin y secretaria
$user = require_role(['administrator', 'secretary']);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        listSuppliers($pdo);
        break;
    case 'POST':
        createSupplier($pdo, $user);
        break;
    case 'PUT':
        updateSupplier($pdo, $user);
        break;
    case 'DELETE':
        deleteSupplier($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function listSuppliers($pdo) {
    $search = isset($_GET['search']) ? sanitize_input($_GET['search']) : '';
    $status = isset($_GET['status']) ? sanitize_input($_GET['status']) : '';
    
    $sql = "SELECT s.*, 
                   COUNT(p.id) as total_products,
                   COALESCE(SUM(p.stock_quantity), 0) as total_stock
            FROM suppliers s
            LEFT JOIN products p ON p.supplier_id = s.id
            WHERE 1=1";
    
    $params = [];
    if (!empty($search)) {
        $sql .= " AND (s.name LIKE :search OR s.contact_person LIKE :search OR s.email LIKE :search)";
        $params['search'] = "%$search%";
    }
    if (!empty($status)) {
        $sql .= " AND s.status = :status";
        $params['status'] = $status;
    }
    
    $sql .= " GROUP BY s.id ORDER BY s.name ASC";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $suppliers = $stmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "message" => "Proveedores obtenidos",
            "data" => $suppliers
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener proveedores"]);
    }
}

function createSupplier($pdo, $user) {
    $data = get_request_data();
    $name = isset($data['name']) ? sanitize_input($data['name']) : '';
    $contactPerson = isset($data['contact_person']) ? sanitize_input($data['contact_person']) : '';
    $phone = isset($data['phone']) ? sanitize_input($data['phone']) : '';
    $email = isset($data['email']) ? sanitize_input($data['email']) : '';
    $notes = isset($data['notes']) ? sanitize_input($data['notes']) : '';
    $status = isset($data['status']) && in_array($data['status'], ['active', 'under_review', 'blacklisted']) ? $data['status'] : 'active';
    
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "El nombre es obligatorio"]);
        return;
    }
    
    $sql = "INSERT INTO suppliers (name, contact_person, phone, email, status, notes) 
            VALUES (:name, :contact_person, :phone, :email, :status, :notes)";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'name' => $name,
            'contact_person' => !empty($contactPerson) ? $contactPerson : null,
            'phone' => !empty($phone) ? $phone : null,
            'email' => !empty($email) ? $email : null,
            'status' => $status,
            'notes' => !empty($notes) ? $notes : null
        ]);
        
        $supplierId = $pdo->lastInsertId();
        
        log_audit($user['id'], 'CREATE_SUPPLIER', 'suppliers', $supplierId, ['name' => $name]);
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Proveedor creado con éxito",
            "supplier_id" => (int)$supplierId
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al crear proveedor: " . $e->getMessage()]);
    }
}

function updateSupplier($pdo, $user) {
    $putData = get_request_data();
    $supplierId = isset($putData['id']) ? (int)$putData['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
    
    if ($supplierId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del proveedor"]);
        return;
    }
    
    $fields = [];
    $params = ['id' => $supplierId];
    $allowedFields = ['name', 'contact_person', 'phone', 'email', 'status', 'notes'];
    
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
        
        echo json_encode(["success" => true, "message" => "Proveedor actualizado con éxito"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}

function updateSupplierStatus($pdo, $user) {
    $data = get_request_data();
    $supplierId = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    $status = isset($_GET['status']) ? sanitize_input($_GET['status']) : (isset($data['status']) ? sanitize_input($data['status']) : 'blacklisted');
    
    if ($supplierId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id"]);
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
        
        echo json_encode(["success" => true, "message" => "Estado de proveedor actualizado a $status"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}

function deleteSupplier($pdo, $user) {
    $data = get_request_data();
    $supplierId = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    
    if ($supplierId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del proveedor"]);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // 1. Desvincular productos asociados (poner supplier_id = NULL)
        $stmtProd = $pdo->prepare("UPDATE products SET supplier_id = NULL WHERE supplier_id = :id");
        $stmtProd->execute(['id' => $supplierId]);
        
        // 2. Desvincular fichas de garantía asociadas
        $stmtWpl = $pdo->prepare("UPDATE warranty_performance_logs SET supplier_id = NULL WHERE supplier_id = :id");
        $stmtWpl->execute(['id' => $supplierId]);
        
        // 3. Eliminar proveedor
        $stmtDel = $pdo->prepare("DELETE FROM suppliers WHERE id = :id");
        $stmtDel->execute(['id' => $supplierId]);
        
        log_audit($user['id'], 'DELETE_SUPPLIER', 'suppliers', $supplierId, []);
        $pdo->commit();
        
        echo json_encode(["success" => true, "message" => "Proveedor eliminado definitivamente con éxito"]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al eliminar proveedor: " . $e->getMessage()]);
    }
}
?>