<?php
/**
 * Carrito de compras - CRUD completo
 * Vixy Store Backend API
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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

// Verificar autenticación
$user = require_login();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getCart($pdo, $user);
        break;
    case 'POST':
        addToCart($pdo, $user);
        break;
    case 'PUT':
        updateCartItem($pdo, $user);
        break;
    case 'DELETE':
        removeFromCart($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

/**
 * Ver el carrito del usuario
 */
function getCart($pdo, $user) {
    // Obtener o crear carrito
    $cartId = getOrCreateCart($pdo, $user['id']);
    
    $sql = "SELECT 
                ci.id, ci.product_id, ci.quantity,
                p.name as product_name, p.price, p.sku,
                pi.image_url as imagen
            FROM cart_items ci
            INNER JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE ci.cart_id = :cart_id
            ORDER BY ci.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['cart_id' => $cartId]);
    $items = $stmt->fetchAll();
    
    // Calcular totales
    $subtotal = 0;
    foreach ($items as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Carrito obtenido",
        "data" => [
            "items" => $items,
            "total_items" => count($items),
            "subtotal" => $subtotal
        ]
    ]);
}

/**
 * Agregar producto al carrito
 */
function addToCart($pdo, $user) {
    $productId = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
    $quantity = isset($_POST['quantity']) ? (int)$_POST['quantity'] : 1;
    
    if ($productId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere product_id"]);
        return;
    }
    
    if ($quantity < 1) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "La cantidad debe ser mayor a 0"]);
        return;
    }
    
    // Verificar que el producto exista
    $sql = "SELECT id, stock_quantity FROM products WHERE id = :id AND is_active = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $productId]);
    $product = $stmt->fetch();
    
    if (!$product) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Producto no encontrado"]);
        return;
    }
    
    // Obtener o crear carrito
    $cartId = getOrCreateCart($pdo, $user['id']);
    
    // Verificar si el producto ya está en el carrito
    $sql = "SELECT id, quantity FROM cart_items WHERE cart_id = :cart_id AND product_id = :product_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['cart_id' => $cartId, 'product_id' => $productId]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Actualizar cantidad
        $newQuantity = $existing['quantity'] + $quantity;
        
        // Verificar stock
        if ($newQuantity > $product['stock_quantity']) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Stock insuficiente. Disponible: " . $product['stock_quantity']]);
            return;
        }
        
        $sql = "UPDATE cart_items SET quantity = :quantity WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['quantity' => $newQuantity, 'id' => $existing['id']]);
    } else {
        // Verificar stock
        if ($quantity > $product['stock_quantity']) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Stock insuficiente. Disponible: " . $product['stock_quantity']]);
            return;
        }
        
        // Insertar nuevo item
        $sql = "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (:cart_id, :product_id, :quantity)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'cart_id' => $cartId,
            'product_id' => $productId,
            'quantity' => $quantity
        ]);
    }
    
    echo json_encode(["success" => true, "message" => "Producto agregado al carrito"]);
}

/**
 * Actualizar cantidad de un item del carrito
 */
function updateCartItem($pdo, $user) {
    // Leer PUT data
    parse_str(file_get_contents("php://input"), $putData);
    
    $itemId = isset($putData['item_id']) ? (int)$putData['item_id'] : 0;
    $quantity = isset($putData['quantity']) ? (int)$putData['quantity'] : 0;
    
    if ($itemId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere item_id"]);
        return;
    }
    
    $cartId = getOrCreateCart($pdo, $user['id']);
    
    // Verificar que el item pertenezca al usuario
    $sql = "SELECT ci.*, p.stock_quantity 
            FROM cart_items ci 
            INNER JOIN products p ON ci.product_id = p.id 
            WHERE ci.id = :item_id AND ci.cart_id = :cart_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['item_id' => $itemId, 'cart_id' => $cartId]);
    $item = $stmt->fetch();
    
    if (!$item) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Item no encontrado en el carrito"]);
        return;
    }
    
    if ($quantity < 1) {
        // Eliminar item
        $sql = "DELETE FROM cart_items WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $itemId]);
        
        echo json_encode(["success" => true, "message" => "Item eliminado del carrito"]);
        return;
    }
    
    if ($quantity > $item['stock_quantity']) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Stock insuficiente. Disponible: " . $item['stock_quantity']]);
        return;
    }
    
    $sql = "UPDATE cart_items SET quantity = :quantity WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['quantity' => $quantity, 'id' => $itemId]);
    
    echo json_encode(["success" => true, "message" => "Cantidad actualizada"]);
}

/**
 * Eliminar item del carrito
 */
function removeFromCart($pdo, $user) {
    $itemId = isset($_GET['item_id']) ? (int)$_GET['item_id'] : 0;
    
    if ($itemId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere item_id"]);
        return;
    }
    
    $cartId = getOrCreateCart($pdo, $user['id']);
    
    $sql = "DELETE FROM cart_items WHERE id = :item_id AND cart_id = :cart_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['item_id' => $itemId, 'cart_id' => $cartId]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Item eliminado del carrito"]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Item no encontrado"]);
    }
}

/**
 * Obtener o crear carrito del usuario
 */
function getOrCreateCart($pdo, $userId) {
    $sql = "SELECT id FROM carts WHERE user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $userId]);
    $cart = $stmt->fetch();
    
    if ($cart) {
        return $cart['id'];
    }
    
    $sql = "INSERT INTO carts (user_id) VALUES (:user_id)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $userId]);
    
    return $pdo->lastInsertId();
}
?>