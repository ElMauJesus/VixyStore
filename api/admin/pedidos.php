<?php
/**
 * Gestión de pedidos (Admin/Secretaria)
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

// Solo admin y secretaria
$user = require_role(['administrator', 'secretary']);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        listOrders($pdo);
        break;
    case 'PUT':
        updateOrderStatus($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function listOrders($pdo) {
    $status = isset($_GET['status']) ? sanitize_input($_GET['status']) : '';
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $porPagina = 20;
    $offset = ($pagina - 1) * $porPagina;
    
    $sql = "SELECT 
                o.id, o.order_number, o.status, o.payment_status,
                o.payment_method, o.total_amount, o.created_at,
                u.first_name, u.last_name, u.email
            FROM orders o
            INNER JOIN users u ON o.user_id = u.id";
    
    $params = [];
    
    if (!empty($status)) {
        $sql .= " WHERE o.status = :status";
        $params['status'] = $status;
    }
    
    $sql .= " ORDER BY o.created_at DESC LIMIT :limit OFFSET :offset";
    
    try {
        $stmt = $pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->bindValue(':limit', $porPagina, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $orders = $stmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "message" => "Pedidos obtenidos",
            "data" => $orders
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener pedidos"]);
    }
}

function updateOrderStatus($pdo, $user) {
    parse_str(file_get_contents("php://input"), $putData);
    
    $orderId = isset($putData['id']) ? (int)$putData['id'] : 0;
    $status = isset($putData['status']) ? sanitize_input($putData['status']) : '';
    
    if ($orderId === 0 || empty($status)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id y status"]);
        return;
    }
    
    $allowedStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($status, $allowedStatus)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Status inválido"]);
        return;
    }
    
    // Obtener estado anterior
    $sql = "SELECT status FROM orders WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $orderId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Pedido no encontrado"]);
        return;
    }
    
    $sql = "UPDATE orders SET status = :status WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['status' => $status, 'id' => $orderId]);
        
        log_audit($user['id'], 'UPDATE_ORDER_STATUS', 'orders', $orderId, [
            'previous_status' => $order['status'],
            'new_status' => $status
        ]);
        
        echo json_encode(["success" => true, "message" => "Estado actualizado"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}
?>