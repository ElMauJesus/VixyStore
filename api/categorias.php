<?php
/**
 * Listado de categorías
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

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Obtener categorías activas con sus subcategorías
$sql = "SELECT 
            c.id, c.name, c.slug, c.description, c.parent_id,
            (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as total_productos
        FROM categories c 
        WHERE c.is_active = 1 
        ORDER BY c.parent_id ASC, c.name ASC";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $categorias = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "message" => "Categorías obtenidas",
        "data" => $categorias
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al obtener categorías"]);
}
?>