<?php
/**
 * Vixy Delivery Platform - API de Reclamos e Incidencias con Fotos de Evidencias
 * Consultas SQL Individuales por Reclamo y Resolución Administrativa
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// -----------------------------------------------------------------------------
// GET: CONSULTAR RECLAMOS
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("SELECT r.*, p.codigo_seguimiento, c.nombre as comercio_nombre FROM reclamos_incidencias r JOIN pedidos p ON r.pedido_id = p.id JOIN comercios c ON r.comercio_id = c.id WHERE r.id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $reclamo = $stmt->fetch();

        if (!$reclamo) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Reclamo no encontrado'], 404);
        }

        // Obtener fotos de evidencias
        $stmtEv = $pdo->prepare("SELECT imagen_url, descripcion_evidencia FROM reclamos_evidencias WHERE reclamo_id = :rid");
        $stmtEv->execute(['rid' => $id]);
        $reclamo['evidencias'] = $stmtEv->fetchAll();

        Database::jsonResponse(['success' => true, 'reclamo' => $reclamo]);
    }

    $comercioId = $_GET['comercio_id'] ?? null;
    $clienteId = $_GET['cliente_id'] ?? null;
    $estado = $_GET['estado'] ?? null;

    $sql = "SELECT r.*, p.codigo_seguimiento, c.nombre as comercio_nombre 
            FROM reclamos_incidencias r 
            JOIN pedidos p ON r.pedido_id = p.id 
            JOIN comercios c ON r.comercio_id = c.id 
            WHERE 1=1";
    $params = [];

    if ($comercioId) { $sql .= " AND r.comercio_id = :cid"; $params['cid'] = $comercioId; }
    if ($clienteId) { $sql .= " AND r.cliente_id = :clid"; $params['clid'] = $clienteId; }
    if ($estado) { $sql .= " AND r.estado = :est"; $params['est'] = $estado; }

    $sql .= " ORDER BY r.creado_en DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $reclamos = $stmt->fetchAll();

    foreach ($reclamos as &$r) {
        $stmtEv = $pdo->prepare("SELECT imagen_url FROM reclamos_evidencias WHERE reclamo_id = :rid");
        $stmtEv->execute(['rid' => $r['id']]);
        $r['imagenes'] = array_column($stmtEv->fetchAll(), 'imagen_url');
    }

    Database::jsonResponse(['success' => true, 'reclamos' => $reclamos]);
}

// -----------------------------------------------------------------------------
// POST: CREAR RECLAMO CON FOTOS DE EVIDENCIA
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $data = Database::getJsonInput();

    if (empty($data['pedido_id']) || empty($data['motivo']) || empty($data['descripcion'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Se requiere pedido_id, motivo y descripcion'], 400);
    }

    // Obtener datos del pedido
    $stmtPed = $pdo->prepare("SELECT cliente_id, comercio_id, conductor_id FROM pedidos WHERE id = :id");
    $stmtPed->execute(['id' => $data['pedido_id']]);
    $ped = $stmtPed->fetch();

    if (!$ped) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El pedido especificado no existe'], 404);
    }

    $newId = 'rec-' . uniqid();

    $stmtIns = $pdo->prepare("
        INSERT INTO reclamos_incidencias (
            id, pedido_id, cliente_id, comercio_id, conductor_id, motivo, descripcion, estado
        ) VALUES (
            :id, :pid, :clid, :cid, :drid, :motivo, :desc, 'abierto'
        )
    ");

    $stmtIns->execute([
        'id' => $newId,
        'pid' => $data['pedido_id'],
        'clid' => $ped['cliente_id'],
        'cid' => $ped['comercio_id'],
        'drid' => $ped['conductor_id'],
        'motivo' => $data['motivo'],
        'desc' => $data['descripcion']
    ]);

    // Insertar fotos de evidencias
    if (!empty($data['imagenes']) && is_array($data['imagenes'])) {
        $stmtImg = $pdo->prepare("INSERT INTO reclamos_evidencias (id, reclamo_id, imagen_url, descripcion_evidencia) VALUES (:id, :rid, :url, :desc)");
        foreach ($data['imagenes'] as $idx => $imgUrl) {
            $stmtImg->execute([
                'id' => 'ev-' . uniqid(),
                'rid' => $newId,
                'url' => $imgUrl,
                'desc' => 'Evidencia fotográfica #' . ($idx + 1)
            ]);
        }
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Reclamo generado con éxito. Un agente de Vixy atenderá su caso a la brevedad.',
        'reclamo_id' => $newId
    ], 201);
}

// -----------------------------------------------------------------------------
// PUT: RESOLVER RECLAMO (ADMINISTRACIÓN O COMERCIO)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'operador', 'soporte']);
    $data = Database::getJsonInput();

    $nuevoEstado = $data['estado'] ?? 'resuelta_reembolso';
    $resolucion = $data['resolucion_admin'] ?? 'Caso evaluado y cerrado satisfactoriamente.';

    $stmt = $pdo->prepare("
        UPDATE reclamos_incidencias 
        SET estado = :est, 
            resolucion_admin = :res, 
            resuelto_por = :admin_id 
        WHERE id = :id
    ");

    $stmt->execute([
        'est' => $nuevoEstado,
        'res' => $resolucion,
        'admin_id' => $authUser['id'],
        'id' => $id
    ]);

    Database::jsonResponse(['success' => true, 'mensaje' => 'Reclamo resuelto satisfactoriamente']);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Método no soportado'], 405);
