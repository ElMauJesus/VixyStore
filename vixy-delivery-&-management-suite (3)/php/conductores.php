<?php
/**
 * Vixy Delivery Platform - API de Conductores y GPS en Tiempo Real
 * Actualización periódica de coordenadas, disponibilidad y control de billetera (-$0.50)
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// -----------------------------------------------------------------------------
// GET: PERFIL DEL CONDUCTOR O LISTA DE CONDUCTORES CERCANOS
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("SELECT id, nombre, apellido, cedula, telefono, email, avatar_url, disponible, en_carrera, latitud_actual, longitud_actual, saldo_billetera_usd, limite_saldo_negativo, bloqueado_por_saldo, rating, total_carreras FROM conductores WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $driver = $stmt->fetch();

        if (!$driver) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Conductor no encontrado'], 404);
        }

        $driver['disponible'] = (bool)$driver['disponible'];
        $driver['en_carrera'] = (bool)$driver['en_carrera'];
        $driver['bloqueado_por_saldo'] = (bool)$driver['bloqueado_por_saldo'];
        $driver['saldo_billetera_usd'] = (float)$driver['saldo_billetera_usd'];

        Database::jsonResponse(['success' => true, 'conductor' => $driver]);
    }

    // Listar conductores disponibles para mapa de administración o asignación
    $soloDisponibles = isset($_GET['disponibles']) ? (bool)$_GET['disponibles'] : true;
    $sql = "SELECT id, nombre, apellido, telefono, disponible, en_carrera, latitud_actual, longitud_actual, saldo_billetera_usd, bloqueado_por_saldo, rating FROM conductores WHERE 1=1";
    
    if ($soloDisponibles) {
        $sql .= " AND disponible = 1 AND bloqueado_por_saldo = 0";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    Database::jsonResponse(['success' => true, 'conductores' => $stmt->fetchAll()]);
}

// -----------------------------------------------------------------------------
// POST / PUT: ACTUALIZAR UBICACIÓN GPS EN TIEMPO REAL
// -----------------------------------------------------------------------------
if (($method === 'POST' || $method === 'PUT') && $action === 'gps') {
    $authUser = AuthMiddleware::requireAuth(['conductor', 'super_admin']);
    $data = Database::getJsonInput();

    $driverId = $data['conductor_id'] ?? $authUser['id'];
    $lat = (float)($data['latitud'] ?? 0);
    $lng = (float)($data['longitud'] ?? 0);
    $precision = (float)($data['precision_metros'] ?? 0);
    $velocidad = (float)($data['velocidad_kmh'] ?? 0);
    $pedidoId = $data['pedido_id'] ?? null;

    if ($lat == 0 || $lng == 0) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Coordenadas GPS inválidas'], 400);
    }

    // 1. Actualizar última ubicación en tabla conductores
    $stmtUpdate = $pdo->prepare("UPDATE conductores SET latitud_actual = :lat, longitud_actual = :lng WHERE id = :id");
    $stmtUpdate->execute(['lat' => $lat, 'lng' => $lng, 'id' => $driverId]);

    // 2. Registrar en historial de tracking GPS
    $stmtHist = $pdo->prepare("
        INSERT INTO ubicaciones_gps_conductores (
            conductor_id, pedido_id, latitud, longitud, precision_metros, velocidad_kmh
        ) VALUES (
            :cid, :pid, :lat, :lng, :prec, :vel
        )
    ");
    $stmtHist->execute([
        'cid' => $driverId,
        'pid' => $pedidoId,
        'lat' => $lat,
        'lng' => $lng,
        'prec' => $precision,
        'vel' => $velocidad
    ]);

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Coordenadas GPS registradas en tiempo real',
        'gps' => [
            'latitud' => $lat,
            'longitud' => $lng,
            'precision_metros' => $precision,
            'velocidad_kmh' => $velocidad,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}

// -----------------------------------------------------------------------------
// PUT: CAMBIAR DISPONIBILIDAD (ON/OFF)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $action === 'disponibilidad') {
    $authUser = AuthMiddleware::requireAuth(['conductor', 'super_admin']);
    $data = Database::getJsonInput();
    $driverId = $data['conductor_id'] ?? $authUser['id'];
    $disponible = isset($data['disponible']) ? (int)$data['disponible'] : 1;

    // Verificar si está bloqueado por saldo negativo (< -0.50)
    $stmtCheck = $pdo->prepare("SELECT saldo_billetera_usd, limite_saldo_negativo, bloqueado_por_saldo FROM conductores WHERE id = :id");
    $stmtCheck->execute(['id' => $driverId]);
    $driver = $stmtCheck->fetch();

    if ($driver && $driver['saldo_billetera_usd'] < -0.50) {
        $stmtBlock = $pdo->prepare("UPDATE conductores SET bloqueado_por_saldo = 1, disponible = 0 WHERE id = :id");
        $stmtBlock->execute(['id' => $driverId]);

        Database::jsonResponse([
            'error' => true,
            'bloqueado' => true,
            'mensaje' => 'No puedes conectarte. Tu saldo es de $' . number_format($driver['saldo_billetera_usd'], 2) . ' USD (límite superado: -$0.50 USD). Recarga tu billetera para activarte.'
        ], 403);
    }

    $stmt = $pdo->prepare("UPDATE conductores SET disponible = :disp WHERE id = :id");
    $stmt->execute(['disp' => $disponible, 'id' => $driverId]);

    Database::jsonResponse([
        'success' => true,
        'disponible' => (bool)$disponible,
        'mensaje' => $disponible ? 'Conductor en línea para recibir viajes' : 'Conductor desconectado'
    ]);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción o método no soportado'], 405);
