<?php
/**
 * Gestión de inventario (Admin/Secretaria)
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
        getInventoryData($pdo);
        break;
    case 'POST':
        adjustInventory($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function getInventoryData($pdo) {
    $action = isset($_GET['action']) ? sanitize_input($_GET['action']) : 'summary';
    
    if ($action === 'logs') {
        $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
        $porPagina = 50;
        $offset = ($pagina - 1) * $porPagina;
        
        $sql = "SELECT 
                    il.*,
                    p.name as product_name,
                    p.sku as product_sku,
                    u.first_name, u.last_name
                FROM inventory_logs il
                INNER JOIN products p ON il.product_id = p.id
                LEFT JOIN users u ON il.user_id = u.id
                ORDER BY il.created_at DESC
                LIMIT :limit OFFSET :offset";
        
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':limit', $porPagina, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $logs = $stmt->fetchAll();
            
            echo json_encode([
                "success" => true,
                "message" => "Historial de movimientos obtenido",
                "data" => $logs
            ]);
            return;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al obtener historial"]);
            return;
        }
    }
    
    // Summary & Alerts
    try {
        // Alertas de stock bajo
        $sqlAlerts = "SELECT 
                        p.id, p.sku, p.name, p.stock_quantity, p.min_stock_alert, 
                        p.price, p.cost_price, c.name as category_name, s.name as supplier_name
                      FROM products p
                      LEFT JOIN categories c ON p.category_id = c.id
                      LEFT JOIN suppliers s ON p.supplier_id = s.id
                      WHERE p.is_active = 1 AND p.stock_quantity <= p.min_stock_alert
                      ORDER BY p.stock_quantity ASC";
        $stmtAlerts = $pdo->query($sqlAlerts);
        $alerts = $stmtAlerts->fetchAll();
        
        // Métricas globales de inventario
        $sqlMetrics = "SELECT 
                        COUNT(id) as total_products,
                        COALESCE(SUM(stock_quantity), 0) as total_units,
                        COALESCE(SUM(stock_quantity * cost_price), 0) as total_cost_value,
                        COALESCE(SUM(stock_quantity * price), 0) as total_sale_value
                       FROM products WHERE is_active = 1";
        $stmtMetrics = $pdo->query($sqlMetrics);
        $metrics = $stmtMetrics->fetch();
        
        echo json_encode([
            "success" => true,
            "message" => "Resumen de inventario obtenido",
            "data" => [
                "metrics" => $metrics,
                "low_stock_alerts" => $alerts,
                "total_alerts" => count($alerts)
            ]
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al calcular métricas de inventario"]);
    }
}

function adjustInventory($pdo, $user) {
    $data = get_request_data();
    
    $productId = isset($data['product_id']) ? (int)$data['product_id'] : 0;
    $type = isset($data['type']) ? sanitize_input($data['type']) : '';
    $quantityChanged = isset($data['quantity_changed']) ? (int)$data['quantity_changed'] : 0;
    $reason = isset($data['reason']) ? sanitize_input($data['reason']) : '';
    
    if ($productId === 0 || empty($type) || $quantityChanged === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
        return;
    }
    
    $allowedTypes = ['IN', 'OUT', 'ADJUSTMENT'];
    if (!in_array($type, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Tipo inválido. Debe ser IN, OUT o ADJUSTMENT"]);
        return;
    }
    
    // Obtener stock actual
    $sql = "SELECT id, name, stock_quantity FROM products WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $productId]);
    $product = $stmt->fetch();
    
    if (!$product) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Producto no encontrado"]);
        return;
    }
    
    $currentStock = (int)$product['stock_quantity'];
    
    switch ($type) {
        case 'IN':
            if ($quantityChanged <= 0) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Para entrada la cantidad debe ser positiva"]);
                return;
            }
            $newStock = $currentStock + $quantityChanged;
            break;
            
        case 'OUT':
            if ($quantityChanged <= 0) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Para salida la cantidad debe ser positiva"]);
                return;
            }
            if ($quantityChanged > $currentStock) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Stock insuficiente. Disponible: $currentStock"]);
                return;
            }
            $newStock = $currentStock - $quantityChanged;
            break;
            
        case 'ADJUSTMENT':
            $newStock = $quantityChanged;
            if ($newStock < 0) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El stock no puede ser negativo"]);
                return;
            }
            $quantityChanged = abs($newStock - $currentStock);
            break;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Actualizar stock
        $sql = "UPDATE products SET stock_quantity = :new_stock WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'new_stock' => $newStock,
            'id' => $productId
        ]);
        
        // Registrar en logs
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
            'previous_stock' => $currentStock,
            'new_stock' => $newStock,
            'reason' => !empty($reason) ? $reason : "Ajuste manual por " . $user['first_name']
        ]);
        
        log_audit($user['id'], 'INVENTORY_ADJUSTMENT', 'products', $productId, [
            'type' => $type,
            'previous_stock' => $currentStock,
            'new_stock' => $newStock,
            'reason' => $reason
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Inventario actualizado exitosamente",
            "previous_stock" => $currentStock,
            "new_stock" => $newStock
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar inventario: " . $e->getMessage()]);
    }
}
?>