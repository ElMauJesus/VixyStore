<?php
/**
 * Gestión de productos (Admin/Secretaria)
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
        listAdminProducts($pdo);
        break;
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

function listAdminProducts($pdo) {
    $search = isset($_GET['search']) ? sanitize_input($_GET['search']) : '';
    $categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
    $supplierId = isset($_GET['supplier_id']) ? (int)$_GET['supplier_id'] : 0;
    $lowStockOnly = isset($_GET['low_stock']) && $_GET['low_stock'] === 'true';
    
    $sql = "SELECT 
                p.id, p.category_id, p.supplier_id, p.sku, p.name, p.slug, 
                p.description, p.price, p.cost_price, p.stock_quantity, 
                p.min_stock_alert, p.is_active, p.created_at, p.updated_at,
                c.name as category_name,
                s.name as supplier_name,
                pi.image_url as primary_image,
                ROUND(((p.price - p.cost_price) / NULLIF(p.price, 0)) * 100, 1) as profit_margin_percent
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE 1=1";
    
    $params = [];
    if (!empty($search)) {
        $sql .= " AND (p.name LIKE :search OR p.sku LIKE :search OR p.description LIKE :search)";
        $params['search'] = "%$search%";
    }
    if ($categoryId > 0) {
        $sql .= " AND p.category_id = :category_id";
        $params['category_id'] = $categoryId;
    }
    if ($supplierId > 0) {
        $sql .= " AND p.supplier_id = :supplier_id";
        $params['supplier_id'] = $supplierId;
    }
    if ($lowStockOnly) {
        $sql .= " AND p.stock_quantity <= p.min_stock_alert";
    }
    
    $sql .= " ORDER BY p.id DESC";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "message" => "Catálogo de administración obtenido",
            "data" => $products,
            "total" => count($products)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener productos: " . $e->getMessage()]);
    }
}

function createProduct($pdo, $user) {
    $data = get_request_data();
    
    $categoryId = isset($data['category_id']) ? (int)$data['category_id'] : 0;
    $supplierId = isset($data['supplier_id']) && !empty($data['supplier_id']) ? (int)$data['supplier_id'] : null;
    $sku = isset($data['sku']) ? sanitize_input($data['sku']) : '';
    $name = isset($data['name']) ? sanitize_input($data['name']) : '';
    $slug = isset($data['slug']) && !empty($data['slug']) 
        ? sanitize_input($data['slug']) 
        : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
    $description = isset($data['description']) ? sanitize_input($data['description']) : '';
    $price = isset($data['price']) ? (float)$data['price'] : 0;
    $costPrice = isset($data['cost_price']) ? (float)$data['cost_price'] : 0;
    $stockQuantity = isset($data['stock_quantity']) ? (int)$data['stock_quantity'] : 0;
    $minStockAlert = isset($data['min_stock_alert']) ? (int)$data['min_stock_alert'] : 5;
    $imageUrl = isset($data['image_url']) ? sanitize_input($data['image_url']) : '';
    
    if (empty($sku) || empty($name) || empty($slug) || $price <= 0 || $categoryId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "SKU, Nombre, Categoría y Precio válido (>0) son obligatorios"]);
        return;
    }
    
    // Verificar si sku ya existe
    $stmtCheck = $pdo->prepare("SELECT id FROM products WHERE sku = :sku OR slug = :slug");
    $stmtCheck->execute(['sku' => $sku, 'slug' => $slug]);
    if ($stmtCheck->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "El SKU o Slug ya se encuentra registrado"]);
        return;
    }
    
    $sql = "INSERT INTO products (
                category_id, supplier_id, sku, name, slug, 
                description, price, cost_price, stock_quantity, min_stock_alert
            ) VALUES (
                :category_id, :supplier_id, :sku, :name, :slug,
                :description, :price, :cost_price, :stock_quantity, :min_stock_alert
            )";
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'category_id' => $categoryId,
            'supplier_id' => $supplierId,
            'sku' => $sku,
            'name' => $name,
            'slug' => $slug,
            'description' => $description,
            'price' => $price,
            'cost_price' => $costPrice,
            'stock_quantity' => $stockQuantity,
            'min_stock_alert' => $minStockAlert
        ]);
        
        $productId = $pdo->lastInsertId();
        
        // Si se envió imagen, registrarla
        if (!empty($imageUrl)) {
            $sqlImg = "INSERT INTO product_images (product_id, image_url, is_primary) VALUES (:product_id, :image_url, 1)";
            $stmtImg = $pdo->prepare($sqlImg);
            $stmtImg->execute(['product_id' => $productId, 'image_url' => $imageUrl]);
        }
        
        // Registro en inventory_logs si tiene stock inicial
        if ($stockQuantity > 0) {
            $sqlLog = "INSERT INTO inventory_logs (product_id, user_id, type, quantity_changed, previous_stock, new_stock, reason) 
                       VALUES (:product_id, :user_id, 'IN', :quantity, 0, :quantity, 'Stock inicial de alta')";
            $stmtLog = $pdo->prepare($sqlLog);
            $stmtLog->execute([
                'product_id' => $productId,
                'user_id' => $user['id'],
                'quantity' => $stockQuantity
            ]);
        }
        
        log_audit($user['id'], 'CREATE_PRODUCT', 'products', $productId, ['name' => $name, 'sku' => $sku, 'price' => $price]);
        
        $pdo->commit();
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Producto creado con éxito",
            "product_id" => (int)$productId
        ]);
        
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al crear producto: " . $e->getMessage()]);
    }
}

function updateProduct($pdo, $user) {
    $putData = get_request_data();
    $productId = isset($putData['id']) ? (int)$putData['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
    
    if ($productId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del producto"]);
        return;
    }
    
    $fields = [];
    $params = ['id' => $productId];
    $allowedFields = ['category_id', 'supplier_id', 'sku', 'name', 'slug', 'description', 'price', 'cost_price', 'min_stock_alert', 'is_active'];
    
    foreach ($allowedFields as $field) {
        if (isset($putData[$field])) {
            $fields[] = "$field = :$field";
            if ($field === 'supplier_id' && ($putData[$field] === '' || $putData[$field] === null)) {
                $params[$field] = null;
            } else {
                $params[$field] = sanitize_input($putData[$field]);
            }
        }
    }
    
    // Si viene image_url para actualizar o agregar imagen primaria
    if (isset($putData['image_url']) && !empty($putData['image_url'])) {
        $imageUrl = sanitize_input($putData['image_url']);
        // Verificar si ya tiene imagen primaria
        $stmtImgCheck = $pdo->prepare("SELECT id FROM product_images WHERE product_id = :p_id AND is_primary = 1");
        $stmtImgCheck->execute(['p_id' => $productId]);
        if ($stmtImgCheck->rowCount() > 0) {
            $stmtUpdImg = $pdo->prepare("UPDATE product_images SET image_url = :url WHERE product_id = :p_id AND is_primary = 1");
            $stmtUpdImg->execute(['url' => $imageUrl, 'p_id' => $productId]);
        } else {
            $stmtInsImg = $pdo->prepare("INSERT INTO product_images (product_id, image_url, is_primary) VALUES (:p_id, :url, 1)");
            $stmtInsImg->execute(['p_id' => $productId, 'url' => $imageUrl]);
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
        
        log_audit($user['id'], 'UPDATE_PRODUCT', 'products', $productId, $putData);
        
        echo json_encode(["success" => true, "message" => "Producto actualizado con éxito"]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar producto: " . $e->getMessage()]);
    }
}

function deleteProduct($pdo, $user) {
    $data = get_request_data();
    $productId = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    
    if ($productId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del producto"]);
        return;
    }
    
    // Soft delete cambiando is_active
    $sql = "UPDATE products SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $productId]);
        
        log_audit($user['id'], 'TOGGLE_PRODUCT_STATUS', 'products', $productId, []);
        
        echo json_encode(["success" => true, "message" => "Estado del producto alternado con éxito"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar estado del producto"]);
    }
}
?>