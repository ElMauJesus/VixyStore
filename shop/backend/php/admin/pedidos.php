<?php
/**
 * Gestión de pedidos (Admin/Secretaria)
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
        if (isset($_GET['id']) && (int)$_GET['id'] > 0) {
            getOrderDetail($pdo, (int)$_GET['id']);
        } else {
            listOrders($pdo);
        }
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
    $porPagina = 25;
    $offset = ($pagina - 1) * $porPagina;
    
    $sql = "SELECT 
                o.id, o.order_number, o.status, o.payment_status,
                o.payment_method, o.payment_reference, o.subtotal, o.shipping_cost,
                o.total_amount, o.notes, o.created_at,
                u.first_name, u.last_name, u.email, u.phone,
                ua.address_line1, ua.city, ua.state
            FROM orders o
            INNER JOIN users u ON o.user_id = u.id
            LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.id";
    
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
        echo json_encode(["success" => false, "message" => "Error al obtener pedidos: " . $e->getMessage()]);
    }
}

function getOrderDetail($pdo, $orderId) {
    $sql = "SELECT 
                o.*,
                u.first_name, u.last_name, u.email, u.phone,
                ua.address_line1, ua.address_line2, ua.city, ua.state, ua.postal_code
            FROM orders o
            INNER JOIN users u ON o.user_id = u.id
            LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.id
            WHERE o.id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $orderId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Pedido no encontrado"]);
        return;
    }
    
    $sqlItems = "SELECT oi.*, p.sku 
                 FROM order_items oi 
                 LEFT JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = :order_id";
    $stmtItems = $pdo->prepare($sqlItems);
    $stmtItems->execute(['order_id' => $orderId]);
    $order['items'] = $stmtItems->fetchAll();
    
    echo json_encode([
        "success" => true,
        "message" => "Detalle de pedido obtenido",
        "data" => $order
    ]);
}

function updateOrderStatus($pdo, $user) {
    $putData = get_request_data();
    
    $orderId = isset($putData['id']) ? (int)$putData['id'] : 0;
    $status = isset($putData['status']) ? sanitize_input($putData['status']) : null;
    $paymentStatus = isset($putData['payment_status']) ? sanitize_input($putData['payment_status']) : null;
    
    if ($orderId === 0 || (empty($status) && empty($paymentStatus))) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id y al menos un estado a modificar"]);
        return;
    }
    
    // Obtener estado anterior
    $sql = "SELECT status, payment_status FROM orders WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $orderId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Pedido no encontrado"]);
        return;
    }
    
    $updates = [];
    $params = ['id' => $orderId];
    
    if (!empty($status)) {
        $allowedStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($status, $allowedStatus)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Status de pedido inválido"]);
            return;
        }
        $updates[] = "status = :status";
        $params['status'] = $status;
    }
    
    if (!empty($paymentStatus)) {
        $allowedPaymentStatus = ['unpaid', 'paid', 'refunded', 'failed'];
        if (!in_array($paymentStatus, $allowedPaymentStatus)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Status de pago inválido"]);
            return;
        }
        $updates[] = "payment_status = :payment_status";
        $params['payment_status'] = $paymentStatus;
    }
    
    $sql = "UPDATE orders SET " . implode(', ', $updates) . " WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        log_audit($user['id'], 'UPDATE_ORDER_STATUS', 'orders', $orderId, [
            'previous' => $order,
            'new_status' => $status,
            'new_payment_status' => $paymentStatus
        ]);
        
        echo json_encode(["success" => true, "message" => "Estado de pedido actualizado exitosamente"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar estado"]);
    }
}
?>