<?php
/**
 * Detalle de un producto
 * Vixy Store Backend API
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Obtener parámetro
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$slug = isset($_GET['slug']) ? sanitize_input($_GET['slug']) : '';

if ($id === 0 && empty($slug)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Se requiere id o slug"]);
    exit;
}

// Construir condición
$condition = $id > 0 ? "p.id = :id" : "p.slug = :slug";
$param = $id > 0 ? [':id' => $id] : [':slug' => $slug];

// Obtener producto
$sql = "SELECT 
            p.*,
            c.name as categoria_nombre, c.slug as categoria_slug,
            s.name as proveedor_nombre
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE $condition AND p.is_active = 1";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($param);
    $producto = $stmt->fetch();
    
    if (!$producto) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Producto no encontrado"]);
        exit;
    }
    
    // Obtener galería de imágenes
    $sql = "SELECT image_url, is_primary, display_order 
            FROM product_images 
            WHERE product_id = :product_id 
            ORDER BY display_order ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['product_id' => $producto['id']]);
    $imagenes = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "message" => "Producto encontrado",
        "data" => [
            "producto" => $producto,
            "imagenes" => $imagenes
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al obtener el producto"]);
}
?>