<?php
/**
 * Gestión de banners del carrusel de la tienda
 * Vixy Store Backend API
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth_middleware.php';

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['publico'])) {
    listBanners($pdo, true);
} else {
    // Para el resto, validar token (opcional por ahora para probar)
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            listBanners($pdo, false);
            break;
        case 'POST':
            createBanner($pdo);
            break;
        case 'PUT':
            updateBanner($pdo);
            break;
        case 'DELETE':
            deleteBanner($pdo);
            break;
        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido"]);
    }
}

function listBanners($pdo, $publico = false) {
    try {
        $sql = "SELECT * FROM banners_store";
        if ($publico) {
            $sql .= " WHERE activo = 1";
        }
        $sql .= " ORDER BY orden ASC, id DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $banners = $stmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "message" => "Banners obtenidos",
            "data" => $banners
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener banners: " . $e->getMessage()]);
    }
}

function createBanner($pdo) {
    $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $imagenUrl = isset($data['imagen_url']) ? trim($data['imagen_url']) : '';
    $titulo = isset($data['titulo']) ? trim($data['titulo']) : '';
    $subtitulo = isset($data['subtitulo']) ? trim($data['subtitulo']) : '';
    $textoBoton = isset($data['texto_boton']) ? trim($data['texto_boton']) : '';
    $enlaceBoton = isset($data['enlace_boton']) ? trim($data['enlace_boton']) : '';
    $orden = isset($data['orden']) ? (int)$data['orden'] : 0;
    $activo = isset($data['activo']) ? (int)$data['activo'] : 1;
    
    if (empty($imagenUrl)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "La imagen es obligatoria"]);
        return;
    }
    
    try {
        $sql = "INSERT INTO banners_store 
                (imagen_url, titulo, subtitulo, texto_boton, enlace_boton, orden, activo) 
                VALUES (:imagen_url, :titulo, :subtitulo, :texto_boton, :enlace_boton, :orden, :activo)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'imagen_url' => $imagenUrl,
            'titulo' => !empty($titulo) ? $titulo : null,
            'subtitulo' => !empty($subtitulo) ? $subtitulo : null,
            'texto_boton' => !empty($textoBoton) ? $textoBoton : null,
            'enlace_boton' => !empty($enlaceBoton) ? $enlaceBoton : null,
            'orden' => $orden,
            'activo' => $activo
        ]);
        
        $bannerId = $pdo->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Banner creado exitosamente",
            "banner_id" => (int)$bannerId
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al crear banner: " . $e->getMessage()]);
    }
}

function updateBanner($pdo) {
    $putData = json_decode(file_get_contents('php://input'), true) ?? [];
    $bannerId = isset($putData['id']) ? (int)$putData['id'] : 0;
    
    if ($bannerId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del banner"]);
        return;
    }
    
    $fields = [];
    $params = ['id' => $bannerId];
    $allowedFields = ['imagen_url', 'titulo', 'subtitulo', 'texto_boton', 'enlace_boton', 'orden', 'activo'];
    
    foreach ($allowedFields as $field) {
        if (isset($putData[$field])) {
            $fields[] = "$field = :$field";
            $params[$field] = trim((string)$putData[$field]);
        }
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No hay campos para actualizar"]);
        return;
    }
    
    $sql = "UPDATE banners_store SET " . implode(', ', $fields) . " WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(["success" => true, "message" => "Banner actualizado"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar banner"]);
    }
}

function deleteBanner($pdo) {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $bannerId = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    
    if ($bannerId === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere id del banner"]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM banners_store WHERE id = :id");
        $stmt->execute(['id' => $bannerId]);
        
        echo json_encode(["success" => true, "message" => "Banner eliminado"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al eliminar banner"]);
    }
}
?>