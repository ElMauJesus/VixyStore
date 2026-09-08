<?php
/**
 * Vixy Delivery Platform - API de Confirmaciones de Entrega
 * Subida de Foto de Entrega, Georreferenciación GPS y Datos de Recepción
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$pedidoId = $_GET['pedido_id'] ?? null;

// -----------------------------------------------------------------------------
// GET: CONSULTAR CONFIRMACIÓN DE ENTREGA
// -----------------------------------------------------------------------------
if ($method === 'GET' && $pedidoId) {
    $stmt = $pdo->prepare("SELECT * FROM confirmaciones_entrega WHERE pedido_id = :pid LIMIT 1");
    $stmt->execute(['pid' => $pedidoId]);
    $conf = $stmt->fetch();

    if (!$conf) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'No existe confirmación de entrega para este pedido'], 404);
    }

    $conf['calificado'] = (bool)$conf['calificado'];
    $conf['peticion_cerrada'] = (bool)$conf['peticion_cerrada'];
    Database::jsonResponse(['success' => true, 'confirmacion' => $conf]);
}

// -----------------------------------------------------------------------------
// POST: REGISTRAR ENTREGA CON FOTO Y GPS
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $authUser = AuthMiddleware::requireAuth(['conductor', 'super_admin']);
    $data = Database::getJsonInput();

    if (empty($data['pedido_id']) || empty($data['foto_entrega_url']) || empty($data['receptor_nombre'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Se requiere foto_entrega_url, receptor_nombre y pedido_id'], 400);
    }

    $newId = 'conf-' . uniqid();
    $pid = $data['pedido_id'];
    $fotoUrl = $data['foto_entrega_url'];
    $lat = (float)($data['latitud_entrega'] ?? 0);
    $lng = (float)($data['longitud_entrega'] ?? 0);
    $precision = (float)($data['precision_gps_metros'] ?? 0);
    $receptor = trim($data['receptor_nombre']);
    $cedula = trim($data['receptor_cedula'] ?? '');
    $notas = trim($data['notas_entrega'] ?? '');

    // 1. Obtener cliente y conductor del pedido
    $stmtPed = $pdo->prepare("SELECT cliente_id, conductor_id FROM pedidos WHERE id = :id");
    $stmtPed->execute(['id' => $pid]);
    $ped = $stmtPed->fetch();

    if (!$ped) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no existe'], 404);
    }

    // 2. Insertar confirmación
    $stmtIns = $pdo->prepare("
        INSERT INTO confirmaciones_entrega (
            id, pedido_id, conductor_id, cliente_id, foto_entrega_url,
            latitud_entrega, longitud_entrega, precision_gps_metros,
            receptor_nombre, receptor_cedula, notas_entrega
        ) VALUES (
            :id, :pid, :drid, :clid, :foto,
            :lat, :lng, :prec,
            :rec, :ced, :notas
        )
    ");

    $stmtIns->execute([
        'id' => $newId,
        'pid' => $pid,
        'drid' => $ped['conductor_id'] ?: $authUser['id'],
        'clid' => $ped['cliente_id'],
        'foto' => $fotoUrl,
        'lat' => $lat,
        'lng' => $lng,
        'prec' => $precision,
        'rec' => $receptor,
        'ced' => $cedula,
        'notas' => $notas
    ]);

    // 3. Actualizar estado del pedido a 'entregado'
    $stmtUpd = $pdo->prepare("UPDATE pedidos SET estado = 'entregado', entregado_en = NOW() WHERE id = :id");
    $stmtUpd->execute(['id' => $pid]);

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Entrega confirmada con éxito. Foto y coordenadas guardadas.',
        'confirmacion_id' => $newId
    ], 201);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Método no soportado'], 405);
