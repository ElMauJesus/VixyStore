<?php
/**
 * Gestión de productos (Admin/Secretaria)
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
        createProduct($pdo, $user);
        break;
    case 'PUT':
        updateProduct($pdo, $user);
        break;
    case 'DELETE':
        deleteProduct($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function createProduct($pdo, $user) {
    $categoryId = isset($_POST['category_id']) ? (int)$_POST['category_id'] : 0;
    $supplierId = isset($_POST['supplier_id']) ? (int)$_POST['supplier_id'] : null;
    $sku = isset($_POST['sku']) ? sanitize_input($_POST['sku']) : '';
    $name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
    $slug = isset($_POST['slug']) ? sanitize_input($_POST['slug']) : '';
    $description = isset($_POST['description']) ? sanitize_input($_POST['description']) : '';
    $price = isset($_POST['price']) ? (float)$_POST['price'] : 0;
    $costPrice = isset($_POST['cost_price']) ? (float)$_POST['cost_price'] : 0;
    $stockQuantity = isset($_POST['stock_quantity']) ? (int)$_POST['stock_quantity'] : 0;
    $minStockAlert = isset($_POST['min_stock_alert']) ? (int)$_POST['min_stock_alert'] : 5;
    
    // Validar
    if (empty($sku) || empty($name) || empty($slug) || $price <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
        return;
    }
    
    // Si no hay slug, generarlo desde el nombre
    if (empty($slug)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
    }
    
    // Verificar SKU único
    $sql = "SELECT id FROM products WHERE sku = :sku";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['sku' => $sku]);
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "El SKU ya existe"]);
        return;
    }
    
    $sql = "INSERT INTO products (
                category_id, supplier_id, sku, name, slug, description,
                price, cost_price, stock_quantity, min_stock_alert
            ) VALUES (
                :category_id, :supplier_id, :sku, :name, :slug, :description,
                :price, :cost_price, :stock_quantity, :min_stock_alert
            )";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'category_id' => $categoryId,
            'supplier_id' => $supplierId,
            'sku' => $sku,
            'name' => $name,
            'slug' => $slug,
            'description' => !empty($description) ? $description : null,
            'price' => $price,
            'cost_price' => $costPrice,
            'stock_quantity' => $stockQuantity,
            'min_stock_alert' => $minStockAlert
        ]);
        
        $productId = $pdo->lastInsertId();
        
        // Registrar auditoría
        log_audit($user['id'], 'CREATE_PRODUCT', 'products', $productId, [
            'sku' => $sku,
            'name' => $name
        ]);
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Producto creado",
            "product_id" => $productId
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al crear producto"]);
    }
}

function updateProduct($pdo, $user) {
    parse_str(file_get_contents("php://input"), $putData);
    
    $productId = isset($putData['id']) ? (int)$putData['id'] : 0;
    
    if ($productId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del producto"]);
        return;
    }
    
    // Construir update dinámico
    $fields = [];
    $params = ['id' => $productId];
    
    $allowedFields = [
        'category_id', 'supplier_id', 'name', 'slug', 'description',
        'price', 'cost_price', 'stock_quantity', 'min_stock_alert', 'is_active'
    ];
    
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
    
    $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        // Registrar auditoría
        log_audit($user['id'], 'UPDATE_PRODUCT', 'products', $productId, $putData);
        
        echo json_encode(["success" => true, "message" => "Producto actualizado"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}

function deleteProduct($pdo, $user) {
    $productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($productId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del producto"]);
        return;
    }
    
    // Soft delete
    $sql = "UPDATE products SET is_active = 0 WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $productId]);
        
        // Registrar auditoría
        log_audit($user['id'], 'DELETE_PRODUCT', 'products', $productId);
        
        echo json_encode(["success" => true, "message" => "Producto desactivado"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al desactivar"]);
    }
}
?>