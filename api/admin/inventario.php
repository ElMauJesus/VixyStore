<?php
/**
 * Gestión de inventario (Admin/Secretaria)
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

// Recibir datos
$productId = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
$type = isset($_POST['type']) ? sanitize_input($_POST['type']) : '';
$quantityChanged = isset($_POST['quantity_changed']) ? (int)$_POST['quantity_changed'] : 0;
$reason = isset($_POST['reason']) ? sanitize_input($_POST['reason']) : '';

// Validar
if ($productId === 0 || empty($type) || $quantityChanged === 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
    exit;
}

// Validar tipo
$allowedTypes = ['IN', 'OUT', 'ADJUSTMENT'];
if (!in_array($type, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Tipo inválido. Debe ser IN, OUT o ADJUSTMENT"]);
    exit;
}

// Obtener stock actual
$sql = "SELECT id, stock_quantity FROM products WHERE id = :id";
$stmt = $pdo->prepare($sql);
$stmt->execute(['id' => $productId]);
$product = $stmt->fetch();

if (!$product) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Producto no encontrado"]);
    exit;
}

$previousStock = (int)$product['stock_quantity'];

// Calcular nuevo stock
switch ($type) {
    case 'IN':
        $newStock = $previousStock + $quantityChanged;
        break;
    case 'OUT':
        $newStock = $previousStock - $quantityChanged;
        if ($newStock < 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Stock insuficiente"]);
            exit;
        }
        break;
    case 'ADJUSTMENT':
        $newStock = $quantityChanged;
        $quantityChanged = $newStock - $previousStock;
        break;
}

try {
    $pdo->beginTransaction();
    
    // Actualizar stock
    $sql = "UPDATE products SET stock_quantity = :new_stock WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['new_stock' => $newStock, 'id' => $productId]);
    
    // Registrar en inventory_logs
    $sql = "INSERT INTO inventory_logs (
                product_id, user_id, type, quantity_changed,
                previous_stock, new_stock, reason
            ) VALUES (
                :product_id, :user_id, :type, :quantity_changed,
                :previous_stock, :new_stock, :reason
            )";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'product_id' => $productId,
        'user_id' => $user['id'],
        'type' => $type,
        'quantity_changed' => $quantityChanged,
        'previous_stock' => $previousStock,
        'new_stock' => $newStock,
        'reason' => !empty($reason) ? $reason : null
    ]);
    
    // Registrar auditoría
    log_audit($user['id'], 'INVENTORY_' . $type, 'products', $productId, [
        'previous_stock' => $previousStock,
        'new_stock' => $newStock,
        'reason' => $reason
    ]);
    
    $pdo->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Inventario actualizado",
        "previous_stock" => $previousStock,
        "new_stock" => $newStock
    ]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al actualizar inventario"]);
}
?>