<?php
/**
 * Vixy Delivery Platform - API de Productos y Catálogos por Comercio
 * Consultas SQL Individuales por Item y Almacenamiento de Imágenes
 */

require_once __DIR__ . '/config/db.php';

// Diagnostico temporal: debe ejecutarse antes de abrir MySQL.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && ($_GET['diagnostico'] ?? '') === '1') {
    $logPath = dirname(__DIR__) . '/error-php.log';
    error_log('VIXY_DIAGNOSTICO_PHP_OK ' . date('c') . ' log_path=' . $logPath);
    Database::jsonResponse([
        'success' => true,
        'codigo' => 'PHP_OK_BEFORE_DB',
        'mensaje' => 'PHP responde antes de intentar conectar a MySQL.',
        'ruta_configurada' => $logPath,
        'escribible' => is_writable($logPath) || is_writable(dirname($logPath))
    ]);
}

require_once __DIR__ . '/config/auth_middleware.php';
$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$comercioId = $_GET['comercio_id'] ?? null;

function cargarProductosCatalogo(PDO $pdo, ?string $comercioId = null, bool $soloDisponibles = false): array {
    $where = $comercioId ? ' WHERE comercio_id = :comercio_id' : '';
    $where .= $soloDisponibles ? ($where ? ' AND' : ' WHERE') . ' disponible = 1' : '';
    $params = $comercioId ? ['comercio_id' => $comercioId] : [];

    try {
        $stmt = $pdo->prepare("SELECT id, comercio_id, categoria, nombre, descripcion, precio_usd, precio_bs, imagen_url, disponible, stock FROM productos{$where} ORDER BY categoria ASC, nombre ASC");
        $stmt->execute($params);
    } catch (Throwable $error) {
        try {
            $catalogWhere = $comercioId ? ' WHERE comercio_id = :comercio_id' : '';
            $catalogWhere .= $soloDisponibles ? ($catalogWhere ? ' AND' : ' WHERE') . ' disponible = 1' : '';
            $stmt = $pdo->prepare("SELECT id, comercio_id, categoria_interna AS categoria, nombre, descripcion, precio_usd, NULL AS precio_bs, imagen_url, disponible, NULL AS stock FROM productos_catalogo{$catalogWhere} ORDER BY categoria_interna ASC, nombre ASC");
            $stmt->execute($params);
        } catch (Throwable $catalogError) {
            Database::jsonResponse(['error' => true, 'codigo' => 'CATALOG_READ', 'mensaje' => 'No se pudo consultar ninguna tabla de catálogo. Verifique productos o productos_catalogo.'], 500);
        }
    }

    $products = $stmt->fetchAll();
    foreach ($products as &$product) {
        $product['disponible'] = (bool)$product['disponible'];
    }
    return $products;
}

// -----------------------------------------------------------------------------
// GET: CONSULTAR PRODUCTOS POR COMERCIO O ITEM INDIVIDUAL
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("SELECT p.*, c.nombre as comercio_nombre FROM productos p JOIN comercios c ON p.comercio_id = c.id WHERE p.id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $producto = $stmt->fetch();

        if (!$producto) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Producto no encontrado'], 404);
        }
        $producto['disponible'] = (bool)$producto['disponible'];
        Database::jsonResponse(['success' => true, 'producto' => $producto]);
    }

    if ($comercioId) {
        $productos = cargarProductosCatalogo($pdo, $comercioId);
        Database::jsonResponse(['success' => true, 'total' => count($productos), 'productos' => $productos]);
    }

    // Listar todos con búsqueda opcional
    $query = $_GET['q'] ?? '';
    if ($query) {
        $stmt = $pdo->prepare("SELECT p.*, c.nombre as comercio_nombre FROM productos p JOIN comercios c ON p.comercio_id = c.id WHERE p.nombre LIKE :q OR p.descripcion LIKE :q2 LIMIT 50");
        $stmt->execute(['q' => "%$query%", 'q2' => "%$query%"]);
        Database::jsonResponse(['success' => true, 'productos' => $stmt->fetchAll()]);
    }

    Database::jsonResponse(['error' => true, 'mensaje' => 'Debe especificar id o comercio_id'], 400);
}

function procesarYGuardarImagenArticulo($imgInput, string $comercioId, string $nombreArticulo = 'articulo'): string {
    $fallbackUrl = "/shop/imgs-c-d/comercios/{$comercioId}/logo.svg";

    if (empty($imgInput)) {
        return $fallbackUrl;
    }

    // Si ya es una URL relativa limpia en imgs-c-d o uploads o URL externa https://
    if (is_string($imgInput) && !str_starts_with($imgInput, 'data:image')) {
        return $imgInput;
    }

    // Si viene como base64 data URI (ej: data:image/jpeg;base64,....)
    if (is_string($imgInput) && preg_match('/^data:image\/(\w+);base64,(.+)$/s', $imgInput, $matches)) {
        $rawExt = strtolower($matches[1]);
        $ext = ($rawExt === 'jpeg' || $rawExt === 'jpg') ? 'jpg' : (($rawExt === 'png') ? 'png' : 'webp');
        $binaryData = base64_decode($matches[2]);
        if ($binaryData === false) {
            return $fallbackUrl;
        }

        $slug = preg_replace('/[^a-z0-9]/', '_', strtolower(trim($nombreArticulo)));
        if (empty($slug)) $slug = 'item';
        $filename = "art_{$slug}_" . time() . '_' . bin2hex(random_bytes(3)) . '.' . $ext;

        $dirs = [
            dirname(dirname(__DIR__)) . "/shop/imgs-c-d/comercios/{$comercioId}/articulos/",
            dirname(dirname(__DIR__)) . "/imgs-c-d/comercios/{$comercioId}/articulos/",
            __DIR__ . "/uploads/comercios/{$comercioId}/articulos/"
        ];

        foreach ($dirs as $dir) {
            try {
                if (!is_dir($dir)) {
                    @mkdir($dir, 0755, true);
                }
                @file_put_contents($dir . $filename, $binaryData);
            } catch (Exception $e) {}
        }

        return "/shop/imgs-c-d/comercios/{$comercioId}/articulos/{$filename}";
    }

    return $fallbackUrl;
}

// -----------------------------------------------------------------------------
// POST: CREAR PRODUCTO CON IMAGEN EN CARPETA DEL COMERCIO
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    AuthMiddleware::requireAuth(['super_admin', 'operador', 'comercio']);
    $data = Database::getJsonInput();
    if (empty($data) && !empty($_POST)) {
        $data = $_POST;
    }

    if (empty($data['comercio_id']) || empty($data['nombre']) || !isset($data['precio_usd'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Faltan campos obligatorios: comercio_id, nombre, precio_usd'], 400);
    }

    $comId = trim((string)$data['comercio_id']);
    $newId = 'prod-' . bin2hex(random_bytes(6));
    
    // Consultar tasa BCV actual de la configuración si existe
    $tasaBcv = 78.50;
    try {
        $stRate = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv' LIMIT 1");
        if ($rowRate = $stRate->fetch()) {
            $tasaBcv = (float)$rowRate['valor'];
        }
    } catch (Exception $e) {}

    $precioUsd = (float)$data['precio_usd'];
    $precioBs = $precioUsd * $tasaBcv;

    // Procesar imagen (archivo multipart o base64 o URL)
    $rawImg = $data['imagen_url'] ?? $data['imagen_base64'] ?? $data['imagenPath'] ?? $data['foto'] ?? '';
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['imagen'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
        $slug = preg_replace('/[^a-z0-9]/', '_', strtolower(trim($data['nombre'])));
        $fn = "art_{$slug}_" . time() . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
        $d1 = dirname(dirname(__DIR__)) . "/shop/imgs-c-d/comercios/{$comId}/articulos/";
        $d2 = dirname(dirname(__DIR__)) . "/imgs-c-d/comercios/{$comId}/articulos/";
        $d3 = __DIR__ . "/uploads/comercios/{$comId}/articulos/";
        foreach ([$d1, $d2, $d3] as $d) {
            if (!is_dir($d)) @mkdir($d, 0755, true);
        }
        $target = is_dir($d1) ? ($d1 . $fn) : ($d3 . $fn);
        if (move_uploaded_file($file['tmp_name'], $target)) {
            @copy($target, $d1 . $fn);
            @copy($target, $d2 . $fn);
            @copy($target, $d3 . $fn);
            $rawImg = "/shop/imgs-c-d/comercios/{$comId}/articulos/{$fn}";
        }
    }

    $finalImg = procesarYGuardarImagenArticulo($rawImg, $comId, $data['nombre']);

    $params = [
        'id' => $newId,
        'cid' => $comId,
        'cat' => $data['categoria'] ?? 'General',
        'nombre' => $data['nombre'],
        'desc' => $data['descripcion'] ?? '',
        'pusd' => $precioUsd,
        'pbs' => $precioBs,
        'img' => $finalImg,
        'disp' => isset($data['disponible']) ? (int)$data['disponible'] : 1,
        'stock' => isset($data['stock']) ? (int)$data['stock'] : 50
    ];

    try {
        $pdo->prepare("INSERT INTO productos (id, comercio_id, categoria, nombre, descripcion, precio_usd, precio_bs, imagen_url, disponible, stock) VALUES (:id, :cid, :cat, :nombre, :desc, :pusd, :pbs, :img, :disp, :stock)")->execute($params);
    } catch (Throwable $error) {
        $catalogParams = [
            'id' => $params['id'], 'cid' => $params['cid'], 'cat' => $params['cat'],
            'nombre' => $params['nombre'], 'desc' => $params['desc'],
            'pusd' => $params['pusd'], 'img' => $params['img'], 'disp' => $params['disp']
        ];
        try {
            $pdo->prepare("INSERT INTO productos_catalogo (id, comercio_id, categoria_interna, nombre, descripcion, precio_usd, imagen_url, disponible) VALUES (:id, :cid, :cat, :nombre, :desc, :pusd, :img, :disp)")->execute($catalogParams);
        } catch (Throwable $catalogError) {
            Database::jsonResponse(['error' => true, 'codigo' => 'CATALOG_WRITE', 'mensaje' => 'No se pudo guardar el artículo en productos ni productos_catalogo.'], 500);
        }
    }

    Database::jsonResponse([
        'success' => true, 
        'mensaje' => 'Producto agregado con éxito', 
        'id' => $newId,
        'imagen_url' => $finalImg,
        'producto' => [
            'id' => $newId,
            'comercio_id' => $comId,
            'nombre' => $params['nombre'],
            'imagen_url' => $finalImg
        ]
    ], 201);
}

// -----------------------------------------------------------------------------
// PUT: ACTUALIZAR PRODUCTO (PRECIO, IMAGEN, DISPONIBILIDAD)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    AuthMiddleware::requireAuth(['super_admin', 'operador', 'comercio']);
    $data = Database::getJsonInput();

    // Obtener comercio_id del producto si no viene en el payload
    $comId = $data['comercio_id'] ?? null;
    if (!$comId) {
        try {
            $stCp = $pdo->prepare("SELECT comercio_id FROM productos WHERE id = :id LIMIT 1");
            $stCp->execute(['id' => $id]);
            $comId = $stCp->fetchColumn();
            if (!$comId) {
                $stCp = $pdo->prepare("SELECT comercio_id FROM productos_catalogo WHERE id = :id LIMIT 1");
                $stCp->execute(['id' => $id]);
                $comId = $stCp->fetchColumn();
            }
        } catch (Exception $e) {}
    }
    if (!$comId) $comId = 'general';

    $fields = [];
    $params = ['id' => $id];

    if (isset($data['nombre'])) { $fields[] = "nombre = :nombre"; $params['nombre'] = $data['nombre']; }
    if (isset($data['descripcion'])) { $fields[] = "descripcion = :desc"; $params['desc'] = $data['descripcion']; }
    if (isset($data['precio_usd'])) { 
        $pusd = (float)$data['precio_usd'];
        $tasaBcv = 78.50;
        try {
            $stRate = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv' LIMIT 1");
            if ($rowRate = $stRate->fetch()) $tasaBcv = (float)$rowRate['valor'];
        } catch (Throwable $error) {}
        $fields[] = "precio_usd = :pusd, precio_bs = :pbs"; 
        $params['pusd'] = $pusd;
        $params['pbs'] = $pusd * $tasaBcv;
    }
    if (isset($data['categoria'])) { $fields[] = "categoria = :cat"; $params['cat'] = $data['categoria']; }
    
    $finalImg = null;
    if (isset($data['imagen_url']) || isset($data['imagen_base64']) || isset($data['foto'])) {
        $rawImg = $data['imagen_url'] ?? $data['imagen_base64'] ?? $data['foto'] ?? '';
        $prodName = $data['nombre'] ?? 'articulo';
        $finalImg = procesarYGuardarImagenArticulo($rawImg, $comId, $prodName);
        $fields[] = "imagen_url = :img";
        $params['img'] = $finalImg;
    }
    if (isset($data['disponible'])) { $fields[] = "disponible = :disp"; $params['disp'] = (int)$data['disponible']; }
    if (isset($data['stock'])) { $fields[] = "stock = :stock"; $params['stock'] = (int)$data['stock']; }

    if (empty($fields)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Sin campos a modificar'], 400);
    }

    try {
        $sql = "UPDATE productos SET " . implode(', ', $fields) . " WHERE id = :id";
        $pdo->prepare($sql)->execute($params);
    } catch (Throwable $error) {
        $catalogFields = [];
        $catalogParams = ['id' => $id];
        foreach ($data as $field => $value) {
            $column = ['categoria' => 'categoria_interna', 'imagen_url' => 'imagen_url', 'nombre' => 'nombre', 'descripcion' => 'descripcion', 'precio_usd' => 'precio_usd', 'disponible' => 'disponible'][$field] ?? null;
            if ($column) { 
                $catalogFields[] = "{$column} = :{$field}"; 
                $catalogParams[$field] = ($field === 'imagen_url' && $finalImg) ? $finalImg : $value; 
            }
        }
        if (!empty($catalogFields)) {
            $pdo->prepare('UPDATE productos_catalogo SET ' . implode(', ', $catalogFields) . ' WHERE id = :id')->execute($catalogParams);
        }
    }

    Database::jsonResponse([
        'success' => true, 
        'mensaje' => 'Producto actualizado',
        'id' => $id,
        'imagen_url' => $finalImg
    ]);
}

// -----------------------------------------------------------------------------
// DELETE: ELIMINAR PRODUCTO
// -----------------------------------------------------------------------------
if ($method === 'DELETE' && $id) {
    AuthMiddleware::requireAuth(['super_admin', 'operador', 'comercio']);
    try {
        $stmt = $pdo->prepare("DELETE FROM productos WHERE id = :id");
        $stmt->execute(['id' => $id]);
    } catch (Throwable $error) {
        $stmt = $pdo->prepare("DELETE FROM productos_catalogo WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
    Database::jsonResponse(['success' => true, 'mensaje' => 'Producto eliminado']);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Método no soportado'], 405);
