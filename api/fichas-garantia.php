<?php
/**
 * Fichas de garantía y control de calidad
 * Vixy Store Backend API
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';
require_once __DIR__ . '/auth.php';

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Solo admin y secretaria para crear/actualizar
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        listFichas($pdo);
        break;
    case 'POST':
        createFicha($pdo);
        break;
    case 'PUT':
        updateFicha($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function listFichas($pdo) {
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $porPagina = 20;
    $offset = ($pagina - 1) * $porPagina;
    
    $sql = "SELECT 
                wpl.*,
                u.first_name, u.last_name,
                p.name as product_name,
                s.name as supplier_name
            FROM warranty_performance_logs wpl
            INNER JOIN users u ON wpl.user_id = u.id
            INNER JOIN products p ON wpl.product_id = p.id
            INNER JOIN suppliers s ON wpl.supplier_id = s.id
            ORDER BY wpl.created_at DESC
            LIMIT :limit OFFSET :offset";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':limit', $porPagina, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $fichas = $stmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "message" => "Fichas obtenidas",
            "data" => $fichas
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener fichas"]);
    }
}

function createFicha($pdo) {
    $user = require_role(['administrator', 'secretary']);
    
    $orderId = isset($_POST['order_id']) ? (int)$_POST['order_id'] : null;
    $userId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
    $productId = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
    $supplierId = isset($_POST['supplier_id']) ? (int)$_POST['supplier_id'] : 0;
    $userOccupation = isset($_POST['user_occupation']) ? sanitize_input($_POST['user_occupation']) : '';
    $usageContext = isset($_POST['usage_context']) ? sanitize_input($_POST['usage_context']) : '';
    $purchaseDate = isset($_POST['purchase_date']) ? sanitize_input($_POST['purchase_date']) : '';
    $durabilityValue = isset($_POST['durability_value']) ? (float)$_POST['durability_value'] : null;
    $durabilityUnit = isset($_POST['durability_unit']) ? sanitize_input($_POST['durability_unit']) : '';
    $observation = isset($_POST['observation']) ? sanitize_input($_POST['observation']) : '';
    
    if ($userId === 0 || $productId === 0 || $supplierId === 0 || empty($observation)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
        return;
    }
    
    // Generar número de ficha
    $year = date('Y');
    $sql = "SELECT COUNT(*) as total FROM warranty_performance_logs WHERE log_number LIKE :prefix";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['prefix' => "FICHA-$year-%"]);
    $fichaCount = (int)$stmt->fetch()['total'] + 1;
    $logNumber = "FICHA-$year-" . str_pad($fichaCount, 4, '0', STR_PAD_LEFT);
    
    $sql = "INSERT INTO warranty_performance_logs (
                log_number, order_id, user_id, product_id, supplier_id,
                user_occupation, usage_context, purchase_date,
                durability_value, durability_unit, observation, registered_by_user_id
            ) VALUES (
                :log_number, :order_id, :user_id, :product_id, :supplier_id,
                :user_occupation, :usage_context, :purchase_date,
                :durability_value, :durability_unit, :observation, :registered_by
            )";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'log_number' => $logNumber,
            'order_id' => $orderId,
            'user_id' => $userId,
            'product_id' => $productId,
            'supplier_id' => $supplierId,
            'user_occupation' => !empty($userOccupation) ? $userOccupation : null,
            'usage_context' => !empty($usageContext) ? $usageContext : null,
            'purchase_date' => $purchaseDate,
            'durability_value' => $durabilityValue,
            'durability_unit' => !empty($durabilityUnit) ? $durabilityUnit : null,
            'observation' => $observation,
            'registered_by' => $user['id']
        ]);
        
        $fichaId = $pdo->lastInsertId();
        
        log_audit($user['id'], 'CREATE_FICHA_GARANTIA', 'warranty_performance_logs', $fichaId, [
            'log_number' => $logNumber
        ]);
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Ficha creada",
            "ficha_id" => $fichaId,
            "log_number" => $logNumber
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al crear ficha"]);
    }
}

function updateFicha($pdo) {
    $user = require_role(['administrator', 'secretary']);
    
    parse_str(file_get_contents("php://input"), $putData);
    
    $fichaId = isset($putData['id']) ? (int)$putData['id'] : 0;
    $status = isset($putData['status']) ? sanitize_input($putData['status']) : '';
    
    if ($fichaId === 0 || empty($status)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id y status"]);
        return;
    }
    
    $allowedStatus = [
        'in_use', 'warranty_claimed', 'failed_out_of_warranty',
        'resolved_replacement', 'resolved_refund'
    ];
    
    if (!in_array($status, $allowedStatus)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Status inválido"]);
        return;
    }
    
    $sql = "UPDATE warranty_performance_logs SET status = :status WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['status' => $status, 'id' => $fichaId]);
        
        log_audit($user['id'], 'UPDATE_FICHA_STATUS', 'warranty_performance_logs', $fichaId, [
            'new_status' => $status
        ]);
        
        echo json_encode(["success" => true, "message" => "Estado actualizado"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}
?>