<?php
/**
 * Checkout - Crear pedido desde el carrito
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
require_once __DIR__ . '/auth.php';

apply_security_headers();

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Verificar autenticación
$user = require_login();

// Recibir datos JSON o POST
$reqData = get_request_data();
$shippingAddressId = isset($reqData['shipping_address_id']) ? (int)$reqData['shipping_address_id'] : 0;
$paymentMethod = isset($reqData['payment_method']) ? sanitize_input($reqData['payment_method']) : '';
$paymentReference = isset($reqData['payment_reference']) ? sanitize_input($reqData['payment_reference']) : null;
$notes = isset($reqData['notes']) ? sanitize_input($reqData['notes']) : '';

// Validar
if ($shippingAddressId === 0) {
    // Si no viene shipping_address_id, buscar la dirección por defecto del usuario
    $stmtAddr = $pdo->prepare("SELECT id FROM user_addresses WHERE user_id = :user_id ORDER BY is_default DESC, id DESC LIMIT 1");
    $stmtAddr->execute(['user_id' => $user['id']]);
    $defaultAddr = $stmtAddr->fetch();
    if ($defaultAddr) {
        $shippingAddressId = (int)$defaultAddr['id'];
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere una dirección de envío. Registra una dirección primero."]);
        exit;
    }
}

if (empty($paymentMethod)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Se requiere método de pago"]);
    exit;
}

// Verificar que la dirección pertenezca al usuario
$sql = "SELECT id FROM user_addresses WHERE id = :id AND user_id = :user_id";
$stmt = $pdo->prepare($sql);
$stmt->execute(['id' => $shippingAddressId, 'user_id' => $user['id']]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Dirección no encontrada"]);
    exit;
}

// Obtener carrito
$sql = "SELECT id FROM carts WHERE user_id = :user_id";
$stmt = $pdo->prepare($sql);
$stmt->execute(['user_id' => $user['id']]);
$cart = $stmt->fetch();

if (!$cart) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "El carrito está vacío"]);
    exit;
}

// Obtener items del carrito
$sql = "SELECT 
            ci.product_id, ci.quantity,
            p.name, p.price, p.stock_quantity
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = :cart_id";
$stmt = $pdo->prepare($sql);
$stmt->execute(['cart_id' => $cart['id']]);
$items = $stmt->fetchAll();

if (empty($items)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "El carrito está vacío"]);
    exit;
}

// Calcular totales
$subtotal = 0;
foreach ($items as $item) {
    // Verificar stock
    if ($item['quantity'] > $item['stock_quantity']) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Stock insuficiente para: " . $item['name'],
            "stock_disponible" => $item['stock_quantity']
        ]);
        exit;
    }
    $subtotal += $item['price'] * $item['quantity'];
}

$shippingCost = 0.00; // Por ahora envío gratis
$totalAmount = $subtotal + $shippingCost;

// Generar número de orden
$year = date('Y');
$sql = "SELECT COUNT(*) as total FROM orders WHERE order_number LIKE :prefix";
$stmt = $pdo->prepare($sql);
$stmt->execute(['prefix' => "VIX-$year-%"]);
$orderCount = (int)$stmt->fetch()['total'] + 1;
$orderNumber = "VIX-$year-" . str_pad($orderCount, 4, '0', STR_PAD_LEFT);

// Iniciar transacción
try {
    $pdo->beginTransaction();
    
    // Crear orden
    $sql = "INSERT INTO orders (
                order_number, user_id, shipping_address_id, 
                payment_method, payment_reference, subtotal, shipping_cost, total_amount, notes
            ) VALUES (
                :order_number, :user_id, :shipping_address_id,
                :payment_method, :payment_reference, :subtotal, :shipping_cost, :total_amount, :notes
            )";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'order_number' => $orderNumber,
        'user_id' => $user['id'],
        'shipping_address_id' => $shippingAddressId,
        'payment_method' => $paymentMethod,
        'payment_reference' => !empty($paymentReference) ? $paymentReference : null,
        'subtotal' => $subtotal,
        'shipping_cost' => $shippingCost,
        'total_amount' => $totalAmount,
        'notes' => !empty($notes) ? $notes : null
    ]);
    
    $orderId = $pdo->lastInsertId();
    
    // Crear order_items
    $sql = "INSERT INTO order_items (
                order_id, product_id, product_name, unit_price, quantity, subtotal
            ) VALUES (
                :order_id, :product_id, :product_name, :unit_price, :quantity, :subtotal
            )";
    
    $stmtItems = $pdo->prepare($sql);
    
    foreach ($items as $item) {
        $itemSubtotal = $item['price'] * $item['quantity'];
        
        $stmtItems->execute([
            'order_id' => $orderId,
            'product_id' => $item['product_id'],
            'product_name' => $item['name'],
            'unit_price' => $item['price'],
            'quantity' => $item['quantity'],
            'subtotal' => $itemSubtotal
        ]);
        
        // Actualizar stock
        $newStock = $item['stock_quantity'] - $item['quantity'];
        
        $sql = "UPDATE products SET stock_quantity = :new_stock WHERE id = :product_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'new_stock' => $newStock,
            'product_id' => $item['product_id']
        ]);
        
        // Registrar en inventory_logs
        $sql = "INSERT INTO inventory_logs (
                    product_id, user_id, type, quantity_changed, 
                    previous_stock, new_stock, reason
                ) VALUES (
                    :product_id, :user_id, 'OUT', :quantity_changed,
                    :previous_stock, :new_stock, :reason
                )";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'product_id' => $item['product_id'],
            'user_id' => $user['id'],
            'quantity_changed' => $item['quantity'],
            'previous_stock' => $item['stock_quantity'],
            'new_stock' => $newStock,
            'reason' => "Venta $orderNumber"
        ]);
    }
    
    // Vaciar carrito
    $sql = "DELETE FROM cart_items WHERE cart_id = :cart_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['cart_id' => $cart['id']]);
    
    // Confirmar transacción
    $pdo->commit();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Pedido creado exitosamente",
        "order_id" => $orderId,
        "order_number" => $orderNumber,
        "total" => $totalAmount
    ]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al crear el pedido"]);
}
?>