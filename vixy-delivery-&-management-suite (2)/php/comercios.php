<?php
/**
 * Vixy Delivery Platform - API de Comercios (Vixy Store & Vixy Web)
 * Control de Horarios, Disponibilidad Inmediata, Categorías e Imágenes
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// -----------------------------------------------------------------------------
// GET: LISTAR COMERCIOS O VER UNO ESPECÍFICO
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM comercios WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $comercio = $stmt->fetch();

        if (!$comercio) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Comercio no encontrado'], 404);
        }

        // Obtener productos del catálogo
        $stmtProd = $pdo->prepare("SELECT * FROM productos_catalogo WHERE comercio_id = :id AND disponible = 1");
        $stmtProd->execute(['id' => $id]);
        $comercio['productos'] = $stmtProd->fetchAll();
        $comercio['dias_operacion'] = json_decode($comercio['dias_operacion'] ?? '[]', true);

        Database::jsonResponse(['success' => true, 'comercio' => $comercio]);
    }

    // Listar todos los comercios con filtros opcionales
    $categoria = $_GET['categoria'] ?? null;
    $soloActivos = isset($_GET['solo_activos']) ? (bool)$_GET['solo_activos'] : false;

    $sql = "SELECT id, rif, nombre, categoria, logo_url, banner_url, direccion, zona_caracas, telefono, email,
                   hora_apertura, hora_cierre, dias_operacion, horarios_texto, activo, abierto_manual,
                   costo_envio_base_usd, calificacion, total_calificaciones
            FROM comercios WHERE 1=1";
    $params = [];

    if ($categoria && $categoria !== 'todas') {
        $sql .= " AND categoria = :cat";
        $params['cat'] = $categoria;
    }

    if ($soloActivos) {
        $sql .= " AND activo = 1 AND abierto_manual = 1";
    }

    $sql .= " ORDER BY calificacion DESC, nombre ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $comercios = $stmt->fetchAll();

    foreach ($comercios as &$c) {
        $c['dias_operacion'] = json_decode($c['dias_operacion'] ?? '[]', true);
        $c['activo'] = (bool)$c['activo'];
        $c['abierto_manual'] = (bool)$c['abierto_manual'];
    }

    Database::jsonResponse(['success' => true, 'total' => count($comercios), 'comercios' => $comercios]);
}

// -----------------------------------------------------------------------------
// POST: CREAR COMERCIO
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    AuthMiddleware::requireAuth(['super_admin', 'operador']);
    $data = Database::getJsonInput();

    $newId = 'store-' . uniqid();
    $sql = "INSERT INTO comercios (
        id, rif, nombre, categoria, logo_url, banner_url, direccion, zona_caracas, 
        latitud, longitud, telefono, email, hora_apertura, hora_cierre, dias_operacion, 
        horarios_texto, activo, abierto_manual, costo_envio_base_usd
    ) VALUES (
        :id, :rif, :nombre, :categoria, :logo_url, :banner_url, :direccion, :zona_caracas,
        :latitud, :longitud, :telefono, :email, :hora_apertura, :hora_cierre, :dias_operacion,
        :horarios_texto, :activo, :abierto_manual, :costo_envio
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'id' => $newId,
        'rif' => $data['rif'] ?? 'J-' . rand(10000000, 99999999) . '-0',
        'nombre' => $data['nombre'],
        'categoria' => $data['categoria'] ?? 'restaurantes',
        'logo_url' => $data['logo_url'] ?? '/uploads/comercios/default-logo.jpg',
        'banner_url' => $data['banner_url'] ?? '/uploads/comercios/default-banner.jpg',
        'direccion' => $data['direccion'] ?? 'Caracas, Venezuela',
        'zona_caracas' => $data['zona_caracas'] ?? 'Chacao',
        'latitud' => $data['latitud'] ?? 10.4910,
        'longitud' => $data['longitud'] ?? -66.8530,
        'telefono' => $data['telefono'] ?? '+58 212-0000000',
        'email' => $data['email'],
        'hora_apertura' => $data['hora_apertura'] ?? '08:00:00',
        'hora_cierre' => $data['hora_cierre'] ?? '22:00:00',
        'dias_operacion' => json_encode($data['dias_operacion'] ?? ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']),
        'horarios_texto' => $data['horarios_texto'] ?? '08:00 AM - 10:00 PM',
        'activo' => isset($data['activo']) ? (int)$data['activo'] : 1,
        'abierto_manual' => isset($data['abierto_manual']) ? (int)$data['abierto_manual'] : 1,
        'costo_envio' => $data['costo_envio_base_usd'] ?? 2.50
    ]);

    Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio registrado con éxito', 'id' => $newId], 201);
}

// -----------------------------------------------------------------------------
// PUT: ACTUALIZAR COMERCIO O HORARIOS / DISPONIBILIDAD
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    AuthMiddleware::requireAuth(['super_admin', 'operador', 'comercio']);
    $data = Database::getJsonInput();

    if ($action === 'toggle_status') {
        $stmt = $pdo->prepare("UPDATE comercios SET activo = :activo, abierto_manual = :abierto WHERE id = :id");
        $stmt->execute([
            'activo' => isset($data['activo']) ? (int)$data['activo'] : 1,
            'abierto' => isset($data['abierto_manual']) ? (int)$data['abierto_manual'] : 1,
            'id' => $id
        ]);
        Database::jsonResponse(['success' => true, 'mensaje' => 'Disponibilidad del comercio actualizada']);
    }

    $fields = [];
    $params = ['id' => $id];

    if (isset($data['nombre'])) { $fields[] = "nombre = :nombre"; $params['nombre'] = $data['nombre']; }
    if (isset($data['categoria'])) { $fields[] = "categoria = :categoria"; $params['categoria'] = $data['categoria']; }
    if (isset($data['hora_apertura'])) { $fields[] = "hora_apertura = :hora_apertura"; $params['hora_apertura'] = $data['hora_apertura']; }
    if (isset($data['hora_cierre'])) { $fields[] = "hora_cierre = :hora_cierre"; $params['hora_cierre'] = $data['hora_cierre']; }
    if (isset($data['dias_operacion'])) { $fields[] = "dias_operacion = :dias_operacion"; $params['dias_operacion'] = json_encode($data['dias_operacion']); }
    if (isset($data['activo'])) { $fields[] = "activo = :activo"; $params['activo'] = (int)$data['activo']; }
    if (isset($data['abierto_manual'])) { $fields[] = "abierto_manual = :abierto_manual"; $params['abierto_manual'] = (int)$data['abierto_manual']; }
    if (isset($data['costo_envio_base_usd'])) { $fields[] = "costo_envio_base_usd = :costo_envio"; $params['costo_envio'] = $data['costo_envio_base_usd']; }
    if (isset($data['logo_url'])) { $fields[] = "logo_url = :logo_url"; $params['logo_url'] = $data['logo_url']; }
    if (isset($data['banner_url'])) { $fields[] = "banner_url = :banner_url"; $params['banner_url'] = $data['banner_url']; }

    if (empty($fields)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'No hay datos para actualizar'], 400);
    }

    $sql = "UPDATE comercios SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio actualizado correctamente']);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Método no soportado'], 405);
