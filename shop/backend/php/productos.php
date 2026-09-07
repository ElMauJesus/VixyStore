<?php
/**
 * Vixy Delivery Platform - API de Productos y Catálogos por Comercio
 * Consultas SQL Individuales por Item y Almacenamiento de Imágenes
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$comercioId = $_GET['comercio_id'] ?? null;

// -----------------------------------------------------------------------------
// GET: CONSULTAR PRODUCTOS POR COMERCIO O ITEM INDIVIDUAL
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("SELECT p.*, c.nombre as comercio_nombre FROM productos_catalogo p JOIN comercios c ON p.comercio_id = c.id WHERE p.id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $producto = $stmt->fetch();

        if (!$producto) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Producto no encontrado'], 404);
        }
        $producto['disponible'] = (bool)$producto['disponible'];
        Database::jsonResponse(['success' => true, 'producto' => $producto]);
    }

    if ($comercioId) {
        $stmt = $pdo->prepare("SELECT * FROM productos_catalogo WHERE comercio_id = :cid ORDER BY categoria ASC, nombre ASC");
        $stmt->execute(['cid' => $comercioId]);
        $productos = $stmt->fetchAll();
        foreach ($productos as &$p) {
            $p['disponible'] = (bool)$p['disponible'];
        }
        Database::jsonResponse(['success' => true, 'total' => count($productos), 'productos' => $productos]);
    }

    // Listar todos con búsqueda opcional
    $query = $_GET['q'] ?? '';
    if ($query) {
        $stmt = $pdo->prepare("SELECT p.*, c.nombre as comercio_nombre FROM productos_catalogo p JOIN comercios c ON p.comercio_id = c.id WHERE p.nombre LIKE :q OR p.descripcion LIKE :q2 LIMIT 50");
        $stmt->execute(['q' => "%$query%", 'q2' => "%$query%"]);
        Database::jsonResponse(['success' => true, 'productos' => $stmt->fetchAll()]);
    }

    Database::jsonResponse(['error' => true, 'mensaje' => 'Debe especificar id o comercio_id'], 400);
}

// -----------------------------------------------------------------------------
// POST: CREAR PRODUCTO CON IMAGEN
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    AuthMiddleware::requireAuth(['super_admin', 'operador', 'comercio']);
    $data = Database::getJsonInput();

    if (empty($data['comercio_id']) || empty($data['nombre']) || !isset($data['precio_usd'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Faltan campos obligatorios: comercio_id, nombre, precio_usd'], 400);
    }

    $newId = 'prod-' . uniqid();
    $tasaBcv = 68.50; // Tasa referencial o parámetro
    $precioUsd = (float)$data['precio_usd'];
    $precioBs = $precioUsd * $tasaBcv;

    $stmt = $pdo->prepare("
        INSERT INTO productos_catalogo (
            id, comercio_id, nombre, descripcion, precio_usd, precio_bs, 
            categoria, imagen_url, disponible
        ) VALUES (
            :id, :cid, :nombre, :desc, :pusd, :pbs, 
            :cat, :img, :disp
        )
    ");

    $stmt->execute([
        'id' => $newId,
        'cid' => $data['comercio_id'],
        'nombre' => $data['nombre'],
        'desc' => $data['descripcion'] ?? '',
        'pusd' => $precioUsd,
        'pbs' => $precioBs,
        'cat' => $data['categoria'] ?? 'General',
        'img' => $data['imagen_url'] ?? '/uploads/productos/default.jpg',
        'disp' => isset($data['disponible']) ? (int)$data['disponible'] : 1
    ]);

    Database::jsonResponse(['success' => true, 'mensaje' => 'Producto agregado con éxito', 'id' => $newId], 201);
}

// -----------------------------------------------------------------------------
// PUT: ACTUALIZAR PRODUCTO (PRECIO, IMAGEN, DISPONIBILIDAD)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    AuthMiddleware::requireAuth(['super_admin', 'operador', 'comercio']);
    $data = Database::getJsonInput();

    $fields = [];
    $params = ['id' => $id];

    if (isset($data['nombre'])) { $fields[] = "nombre = :nombre"; $params['nombre'] = $data['nombre']; }
    if (isset($data['descripcion'])) { $fields[] = "descripcion = :desc"; $params['desc'] = $data['descripcion']; }
    if (isset($data['precio_usd'])) { 
        $fields[] = "precio_usd = :pusd, precio_bs = :pbs"; 
        $params['pusd'] = (float)$data['precio_usd'];
        $params['pbs'] = (float)$data['precio_usd'] * 68.50;
    }
    if (isset($data['categoria'])) { $fields[] = "categoria = :cat"; $params['cat'] = $data['categoria']; }
    if (isset($data['imagen_url'])) { $fields[] = "imagen_url = :img"; $params['img'] = $data['imagen_url']; }
    if (isset($data['disponible'])) { $fields[] = "disponible = :disp"; $params['disp'] = (int)$data['disponible']; }

    if (empty($fields)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Sin campos a modificar'], 400);
    }

    $sql = "UPDATE productos_catalogo SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    Database::jsonResponse(['success' => true, 'mensaje' => 'Producto actualizado']);
}

// -----------------------------------------------------------------------------
// DELETE: ELIMINAR PRODUCTO
// -----------------------------------------------------------------------------
if ($method === 'DELETE' && $id) {
    AuthMiddleware::requireAuth(['super_admin', 'operador', 'comercio']);
    $stmt = $pdo->prepare("DELETE FROM productos_catalogo WHERE id = :id");
    $stmt->execute(['id' => $id]);
    Database::jsonResponse(['success' => true, 'mensaje' => 'Producto eliminado']);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Método no soportado'], 405);
