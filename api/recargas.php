<?php
/**
 * Vixy Delivery Platform - API de Recargas de Billeteras y Comprobantes
 * Compatible con cPanel y phpMyAdmin
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// -----------------------------------------------------------------------------
// GET: CONSULTAR RECARGAS
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    $estado = $_GET['estado'] ?? null;
    $usuarioId = $_GET['usuario_id'] ?? null;

    $sql = "SELECT r.*, 
            CASE 
                WHEN r.tipo_usuario = 'conductor' THEN (SELECT CONCAT(nombre, ' ', apellido) FROM conductores WHERE id = r.usuario_id)
                WHEN r.tipo_usuario = 'comercio' THEN (SELECT nombre FROM comercios WHERE id = r.usuario_id)
                ELSE (SELECT nombre FROM clientes WHERE id = r.usuario_id)
            END as nombre_titular
            FROM recargas_billetera r 
            WHERE 1=1";
    $params = [];

    if ($estado) { $sql .= " AND r.estado = :est"; $params['est'] = $estado; }
    if ($usuarioId) { $sql .= " AND r.usuario_id = :uid"; $params['uid'] = $usuarioId; }

    $sql .= " ORDER BY r.creado_en DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    Database::jsonResponse(['success' => true, 'recargas' => $stmt->fetchAll()]);
}

// -----------------------------------------------------------------------------
// POST: SOLICITAR NUEVA RECARGA CON COMPROBANTE
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $data = Database::getJsonInput();

    if (empty($data['usuario_id']) || empty($data['monto_usd']) || empty($data['referencia'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Se requiere usuario_id, monto_usd y referencia'], 400);
    }

    $newId = 'rec-' . uniqid();
    $stmtBcv = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv'");
    $rowBcv = $stmtBcv->fetch();
    $tasaBcv = $rowBcv ? (float)$rowBcv['valor'] : 48.50;

    $montoUsd = (float)$data['monto_usd'];
    $montoBs = $montoUsd * $tasaBcv;

    $stmt = $pdo->prepare("
        INSERT INTO recargas_billetera (
            id, usuario_id, tipo_usuario, monto_usd, monto_bs, tasa_bcv,
            metodo, banco_emisor, telefono_origen, referencia, comprobante_url, estado
        ) VALUES (
            :id, :uid, :tipo, :m_usd, :m_bs, :bcv,
            :metodo, :banco, :tel, :ref, :comp, 'pendiente'
        )
    ");

    $stmt->execute([
        'id' => $newId,
        'uid' => $data['usuario_id'],
        'tipo' => $data['tipo_usuario'] ?? 'conductor',
        'm_usd' => $montoUsd,
        'm_bs' => $montoBs,
        'bcv' => $tasaBcv,
        'metodo' => $data['metodo'] ?? 'pago_movil',
        'banco' => $data['banco_emisor'] ?? 'Banesco',
        'tel' => $data['telefono_origen'] ?? null,
        'ref' => $data['referencia'],
        'comp' => $data['comprobante_url'] ?? null
    ]);

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Comprobante de recarga recibido. El saldo se acreditará en cuanto sea auditado.',
        'recarga_id' => $newId
    ], 201);
}

// -----------------------------------------------------------------------------
// PUT: APROBAR O RECHAZAR RECARGA (ADMINISTRACIÓN)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'finanzas', 'operador']);
    $data = Database::getJsonInput();
    $accion = $data['accion'] ?? 'aprobar'; // 'aprobar' o 'rechazar'
    $motivoRechazo = $data['motivo_rechazo'] ?? null;

    $stmtCheck = $pdo->prepare("SELECT * FROM recargas_billetera WHERE id = :id AND estado = 'pendiente'");
    $stmtCheck->execute(['id' => $id]);
    $recarga = $stmtCheck->fetch();

    if (!$recarga) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Recarga no encontrada o ya procesada'], 404);
    }

    if ($accion === 'aprobar') {
        $montoUsd = (float)$recarga['monto_usd'];
        $tipoUsuario = $recarga['tipo_usuario'];
        $usuarioId = $recarga['usuario_id'];

        if ($tipoUsuario === 'conductor') {
            $stmtUpd = $pdo->prepare("
                UPDATE conductores 
                SET saldo_billetera_usd = saldo_billetera_usd + :monto,
                    bloqueado_por_saldo = 0,
                    disponible = 1
                WHERE id = :uid
            ");
            $stmtUpd->execute(['monto' => $montoUsd, 'uid' => $usuarioId]);
        } elseif ($tipoUsuario === 'comercio') {
            $stmtUpd = $pdo->prepare("UPDATE comercios SET saldo_billetera_usd = saldo_billetera_usd + :monto WHERE id = :uid");
            $stmtUpd->execute(['monto' => $montoUsd, 'uid' => $usuarioId]);
        } else {
            $stmtUpd = $pdo->prepare("UPDATE clientes SET saldo_billetera_usd = saldo_billetera_usd + :monto WHERE id = :uid");
            $stmtUpd->execute(['monto' => $montoUsd, 'uid' => $usuarioId]);
        }

        // Registrar en transacciones_billetera
        $stmtTrx = $pdo->prepare("
            INSERT INTO transacciones_billetera (
                id, usuario_id, tipo_usuario, tipo_movimiento, concepto, monto_usd, referencia_id
            ) VALUES (
                :id, :uid, :tipo, 'ingreso', 'Recarga de saldo aprobada por administración', :monto, :ref_id
            )
        ");
        $stmtTrx->execute([
            'id' => 'trx-' . uniqid(),
            'uid' => $usuarioId,
            'tipo' => $tipoUsuario,
            'monto' => $montoUsd,
            'ref_id' => $id
        ]);

        $updRec = $pdo->prepare("UPDATE recargas_billetera SET estado = 'aprobada', revisado_por = :admin WHERE id = :id");
        $updRec->execute(['admin' => $authUser['username'] ?? 'admin', 'id' => $id]);

        Database::jsonResponse(['success' => true, 'mensaje' => 'Recarga aprobada y saldo acreditado con éxito']);
    } else {
        $updRec = $pdo->prepare("UPDATE recargas_billetera SET estado = 'rechazada', revisado_por = :admin, motivo_rechazo = :mot WHERE id = :id");
        $updRec->execute([
            'admin' => $authUser['username'] ?? 'admin',
            'mot' => $motivoRechazo ?: 'Comprobante no coincide con extracto bancario',
            'id' => $id
        ]);

        Database::jsonResponse(['success' => true, 'mensaje' => 'Recarga rechazada']);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción no permitida'], 405);
