<?php
/**
 * Listado de productos
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

// Parámetros opcionales
$categoria = isset($_GET['categoria']) ? (int)$_GET['categoria'] : null;
$busqueda = isset($_GET['busqueda']) ? sanitize_input($_GET['busqueda']) : '';
$pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
$orden = isset($_GET['orden']) ? sanitize_input($_GET['orden']) : 'recientes';

// Validar página
if ($pagina < 1) $pagina = 1;

// Límite por página
$porPagina = 12;
$offset = ($pagina - 1) * $porPagina;

// Construir query base
$sql = "SELECT 
            p.id, p.sku, p.name, p.slug, p.description,
            p.price, p.stock_quantity,
            c.name as categoria_nombre, c.slug as categoria_slug,
            pi.image_url as imagen_principal
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
        WHERE p.is_active = 1";

$params = [];

// Filtrar por categoría
if ($categoria) {
    $sql .= " AND p.category_id = :categoria";
    $params['categoria'] = $categoria;
}

// Búsqueda
if (!empty($busqueda)) {
    $sql .= " AND (p.name LIKE :busqueda OR p.sku LIKE :busqueda OR p.description LIKE :busqueda)";
    $params['busqueda'] = "%$busqueda%";
}

// Ordenar
switch ($orden) {
    case 'precio_asc':
        $sql .= " ORDER BY p.price ASC";
        break;
    case 'precio_desc':
        $sql .= " ORDER BY p.price DESC";
        break;
    case 'nombre':
        $sql .= " ORDER BY p.name ASC";
        break;
    case 'stock':
        $sql .= " ORDER BY p.stock_quantity DESC";
        break;
    default:
        $sql .= " ORDER BY p.created_at DESC";
}

// Paginación
$sql .= " LIMIT :limit OFFSET :offset";

try {
    $stmt = $pdo->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    
    $stmt->bindValue(':limit', $porPagina, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $productos = $stmt->fetchAll();
    
    // Contar total de productos para paginación
    $countSql = "SELECT COUNT(*) as total FROM products p WHERE p.is_active = 1";
    $countParams = [];
    
    if ($categoria) {
        $countSql .= " AND p.category_id = :categoria";
        $countParams['categoria'] = $categoria;
    }
    
    if (!empty($busqueda)) {
        $countSql .= " AND (p.name LIKE :busqueda OR p.sku LIKE :busqueda)";
        $countParams['busqueda'] = "%$busqueda%";
    }
    
    $stmtCount = $pdo->prepare($countSql);
    foreach ($countParams as $key => $value) {
        $stmtCount->bindValue(":$key", $value);
    }
    $stmtCount->execute();
    $total = (int)$stmtCount->fetch()['total'];
    
    echo json_encode([
        "success" => true,
        "message" => "Productos obtenidos",
        "data" => $productos,
        "paginacion" => [
            "pagina_actual" => $pagina,
            "por_pagina" => $porPagina,
            "total_productos" => $total,
            "total_paginas" => ceil($total / $porPagina)
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al obtener productos"]);
}
?>