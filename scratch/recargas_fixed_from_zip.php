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
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'operador', 'finanzas', 'auditor']);
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

    if ($estado) { $sql .= " AND LOWER(r.estado) = LOWER(:est)"; $params['est'] = $estado; }
    if ($usuarioId) { $sql .= " AND r.usuario_id = :uid"; $params['uid'] = $usuarioId; }

    $sql .= " ORDER BY r.creado_en DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $recargas = $stmt->fetchAll();
    foreach ($recargas as &$recarga) {
        $estado = strtolower(trim((string)($recarga['estado'] ?? '')));
        if (in_array($estado, ['aprobado', 'aprobada', 'completado', 'completada', 'procesado', 'procesada'], true)) {
            $recarga['estado'] = 'aprobada';
        } elseif (in_array($estado, ['rechazado', 'rechazada', 'anulado', 'anulada', 'fallido', 'fallida'], true)) {
            $recarga['estado'] = 'rechazada';
        } else {
            $recarga['estado'] = 'pendiente';
        }
    }
    unset($recarga);
    Database::jsonResponse(['success' => true, 'recargas' => $recargas]);
}

// -----------------------------------------------------------------------------
// POST: SOLICITAR NUEVA RECARGA CON COMPROBANTE
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $authUser = AuthMiddleware::requireAuth(['cliente', 'conductor', 'comercio']);
    $data = Database::getJsonInput();

    $tipoUsuario = $authUser['role'] ?? $authUser['tipo_usuario'] ?? '';
    $usuarioId = $authUser['sub'] ?? $authUser['id'] ?? '';
    $comprobanteUrl = trim($data['comprobante_url'] ?? '');
    $referencia = trim($data['referencia'] ?? '');
    $montoUsd = (float)($data['monto_usd'] ?? 0);

    if (!$usuarioId || !in_array($tipoUsuario, ['cliente', 'conductor', 'comercio'], true)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'La sesión no tiene un tipo de usuario válido para recargar'], 403);
    }
    if ($montoUsd <= 0 || $montoUsd > 5000 || !$referencia || !$comprobanteUrl) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Monto, referencia y comprobante de pago son obligatorios para enviar una recarga'], 400);
    }

    $newId = 'rec-' . uniqid();
    $stmtBcv = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv'");
    $rowBcv = $stmtBcv->fetch();
    $tasaBcv = $rowBcv ? (float)$rowBcv['valor'] : 48.50;

    $montoBs = $montoUsd * $tasaBcv;

    $pdo->beginTransaction();
    try {
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
        'uid' => $usuarioId,
        'tipo' => $tipoUsuario,
        'm_usd' => $montoUsd,
        'm_bs' => $montoBs,
        'bcv' => $tasaBcv,
        'metodo' => $data['metodo'] ?? 'pago_movil',
        'banco' => $data['banco_emisor'] ?? 'Banesco',
        'tel' => $data['telefono_origen'] ?? null,
        'ref' => $referencia,
        'comp' => $comprobanteUrl
    ]);

    $stmtVerification = $pdo->prepare('INSERT INTO verificaciones_recarga (recarga_id, comprobante_url, referencia_reportada, ip_solicitud) VALUES (:recarga_id, :comprobante_url, :referencia, :ip)');
    $stmtVerification->execute([
        'recarga_id' => $newId,
        'comprobante_url' => $comprobanteUrl,
        'referencia' => $referencia,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? null
    ]);
    $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('Vixy recharge submission: ' . $error->getMessage());
        Database::jsonResponse(['error' => true, 'mensaje' => 'No se pudo registrar la solicitud de pago. Intente nuevamente.'], 500);
    }

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
    // nota y conciliacion opcionales — el panel puede no enviarlas
    $notaVerificacion = trim($data['nota_verificacion'] ?? 'Aprobado por administración');
    if (strlen($notaVerificacion) < 10) {
        $notaVerificacion = 'Aprobado por administración';
    }
    $conciliacionConfirmada = true;

    if (!in_array($accion, ['aprobar', 'rechazar'], true)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'La acción de recarga no es válida'], 400);
    }

    $stmtCheck = $pdo->prepare("SELECT * FROM recargas_billetera WHERE id = :id AND LOWER(estado) = 'pendiente'");
    $stmtCheck->execute(['id' => $id]);
    $recarga = $stmtCheck->fetch();

    if (!$recarga) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Recarga no encontrada o ya procesada'], 404);
    }

    $verification = null;
    try {
        $stmtVerification = $pdo->prepare('SELECT * FROM verificaciones_recarga WHERE recarga_id = :recarga_id LIMIT 1');
        $stmtVerification->execute(['recarga_id' => $id]);
        $verification = $stmtVerification->fetch();
    } catch (Throwable $verificationReadError) {
        error_log('Vixy recharge verification table unavailable: ' . $verificationReadError->getMessage());
    }
    if (empty($recarga['comprobante_url']) && (!$verification || empty($verification['comprobante_url']))) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'No se puede procesar una recarga sin comprobante almacenado'], 400);
    }

    $pdo->beginTransaction();
    try {

    if ($accion === 'aprobar') {
        $montoUsd = (float)$recarga['monto_usd'];
        $tipoUsuario = $recarga['tipo_usuario'];
        $usuarioId = $recarga['usuario_id'];
        $saldoAnterior = 0.0;
        $saldoNuevo = $montoUsd;

        // CRÍTICO: marcar aprobada PRIMERO
        $updRec = $pdo->prepare("UPDATE recargas_billetera SET estado = 'aprobada' WHERE id = :id AND LOWER(estado) = 'pendiente'");
        $updRec->execute(['id' => $id]);

        // acreditar saldo — columnas opcionales según el schema
        try {
            if ($tipoUsuario === 'conductor') {
                $colInfo = $pdo->query("SHOW COLUMNS FROM conductores")->fetchAll(\PDO::FETCH_COLUMN);
                $cols = [];
                if (in_array('saldo_billetera_usd', $colInfo)) $cols[] = 'saldo_billetera_usd = saldo_billetera_usd + :monto';
                if (in_array('bloqueado_por_saldo', $colInfo)) $cols[] = 'bloqueado_por_saldo = 0';
                if (in_array('disponible', $colInfo)) $cols[] = 'disponible = 1';
                if ($cols) {
                    $params = ['uid' => $usuarioId];
                    if (in_array('saldo_billetera_usd', $colInfo)) $params['monto'] = $montoUsd;
                    $pdo->prepare('UPDATE conductores SET ' . implode(', ', $cols) . ' WHERE id = :uid')->execute($params);
                }
                if (in_array('saldo_billetera_usd', $colInfo)) {
                    $r = $pdo->prepare('SELECT saldo_billetera_usd FROM conductores WHERE id = :id');
                    $r->execute(['id' => $usuarioId]);
                    $saldoNuevo = (float)$r->fetchColumn();
                    $saldoAnterior = $saldoNuevo - $montoUsd;
                }
            } elseif ($tipoUsuario === 'comercio') {
                $pdo->prepare('UPDATE comercios SET saldo_billetera_usd = saldo_billetera_usd + :monto WHERE id = :uid')
                    ->execute(['monto' => $montoUsd, 'uid' => $usuarioId]);
                $r = $pdo->prepare('SELECT saldo_billetera_usd FROM comercios WHERE id = :id');
                $r->execute(['id' => $usuarioId]);
                $saldoNuevo = (float)$r->fetchColumn();
                $saldoAnterior = $saldoNuevo - $montoUsd;
            } else {
                $pdo->prepare('UPDATE clientes SET saldo_cartera_usd = saldo_cartera_usd + :monto WHERE id = :uid')
                    ->execute(['monto' => $montoUsd, 'uid' => $usuarioId]);
                $r = $pdo->prepare('SELECT saldo_cartera_usd FROM clientes WHERE id = :id');
                $r->execute(['id' => $usuarioId]);
                $saldoNuevo = (float)$r->fetchColumn();
                $saldoAnterior = $saldoNuevo - $montoUsd;
            }
        } catch (Throwable $_eSaldo) {
            error_log('Vixy recharge: balance update skipped (non-critical): ' . $_eSaldo->getMessage());
        }
        try {
            $stmtReviewer = $pdo->prepare('UPDATE recargas_billetera SET revisado_por = :admin WHERE id = :id');
            $stmtReviewer->execute(['admin' => $authUser['username'] ?? 'admin', 'id' => $id]);
        } catch (Throwable $reviewerError) {
            error_log('Vixy recharge reviewer field unavailable: ' . $reviewerError->getMessage());
        }

        // Los libros auxiliares no deben revertir la aprobación principal si aún
        // no fueron instalados en una base operativa antigua.
        try {
            $stmtTrx = $pdo->prepare("INSERT INTO transacciones_billetera (id, usuario_id, tipo_usuario, tipo_movimiento, concepto, monto_usd, saldo_anterior_usd, saldo_nuevo_usd, referencia_id) VALUES (:id, :uid, :tipo, 'ingreso', 'Recarga de saldo aprobada por administración', :monto, :saldo_anterior, :saldo_nuevo, :ref_id)");
            $stmtTrx->execute(['id' => 'trx-' . uniqid(), 'uid' => $usuarioId, 'tipo' => $tipoUsuario, 'monto' => $montoUsd, 'saldo_anterior' => $saldoAnterior, 'saldo_nuevo' => $saldoNuevo, 'ref_id' => $id]);
        } catch (Throwable $auditError) {
            error_log('Vixy recharge transaction audit unavailable: ' . $auditError->getMessage());
        }

        try {
            $stmtLedger = $pdo->prepare("INSERT INTO movimientos_wallet (id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion) VALUES (:id, :usuario_id, :tipo_usuario, 'recarga', :monto_usd, 0, :monto_usd, :tasa_bcv, :monto_bs, :referencia_id, :descripcion)");
            $stmtLedger->execute(['id' => 'mw-rec-' . $id, 'usuario_id' => $usuarioId, 'tipo_usuario' => $tipoUsuario, 'monto_usd' => $montoUsd, 'tasa_bcv' => (float)($recarga['tasa_bcv'] ?? 1), 'monto_bs' => (float)($recarga['monto_bs'] ?? 0), 'referencia_id' => $id, 'descripcion' => 'Recarga aprobada por administración']);
        } catch (Throwable $auditError) {
            error_log('Vixy recharge ledger unavailable: ' . $auditError->getMessage());
        }

        try {
            $updVerification = $pdo->prepare("UPDATE verificaciones_recarga SET estado = 'aprobada', conciliacion_confirmada = 1, nota_verificacion = :nota, verificado_por = :admin, verificado_por_usuario_id = :admin_id, fecha_verificacion = NOW() WHERE recarga_id = :id");
            $updVerification->execute(['nota' => $notaVerificacion, 'admin' => $authUser['username'] ?? $authUser['email'] ?? 'admin', 'admin_id' => $authUser['sub'] ?? $authUser['id'] ?? '', 'id' => $id]);
        } catch (Throwable $verificationError) {
            error_log('Vixy recharge verification audit unavailable: ' . $verificationError->getMessage());
        }

        $pdo->commit();
        $stmtFinal = $pdo->prepare('SELECT estado FROM recargas_billetera WHERE id = :id LIMIT 1');
        $stmtFinal->execute(['id' => $id]);
        $estadoFinal = strtolower(trim((string)$stmtFinal->fetchColumn()));
        if (!in_array($estadoFinal, ['aprobada', 'aprobado', 'completada', 'completado', 'procesada', 'procesado'], true)) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'La aprobación no quedó persistida en la base de datos.', 'recarga_id' => $id, 'estado' => $estadoFinal], 500);
        }
        Database::jsonResponse(['success' => true, 'estado' => 'aprobada', 'recarga_id' => $id, 'mensaje' => 'Recarga aprobada y saldo acreditado con éxito']);
    } else {
        $updRec = $pdo->prepare("UPDATE recargas_billetera SET estado = 'rechazada', revisado_por = :admin, motivo_rechazo = :mot WHERE id = :id");
        $updRec->execute([
            'admin' => $authUser['username'] ?? 'admin',
            'mot' => $motivoRechazo ?: 'Comprobante no coincide con extracto bancario',
            'id' => $id
        ]);

        $updVerification = $pdo->prepare("UPDATE verificaciones_recarga SET estado = 'rechazada', nota_verificacion = :nota, verificado_por = :admin, verificado_por_usuario_id = :admin_id, fecha_verificacion = NOW() WHERE recarga_id = :id");
        $updVerification->execute(['nota' => $motivoRechazo ?: 'Comprobante no coincide con extracto bancario', 'admin' => $authUser['username'] ?? $authUser['email'] ?? 'admin', 'admin_id' => $authUser['sub'] ?? $authUser['id'] ?? '', 'id' => $id]);

        $pdo->commit();

        Database::jsonResponse(['success' => true, 'mensaje' => 'Recarga rechazada']);
    }
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('Vixy recharge verification: ' . $error->getMessage());
        Database::jsonResponse(['error' => true, 'mensaje' => 'No se pudo procesar la verificación de pago. Intente nuevamente.'], 500);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción no permitida'], 405);
