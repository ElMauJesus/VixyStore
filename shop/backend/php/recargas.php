<?php
/**
 * Vixy Delivery Platform - API de Recargas de Billeteras y Comprobantes
 * Compatible con cPanel, phpMyAdmin y Panel /shop/
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

    if (!$usuarioId) {
        $authUser = AuthMiddleware::requireAuth(['super_admin', 'operador', 'finanzas', 'auditor', 'admin', 'administrador']);
    }

    $sql = "SELECT r.*, 
            CASE 
                WHEN r.tipo_usuario = 'conductor' THEN (SELECT CONCAT(nombre, ' ', apellido) FROM conductores WHERE id = r.usuario_id)
                WHEN r.tipo_usuario = 'comercio' THEN (SELECT nombre FROM comercios WHERE id = r.usuario_id)
                ELSE (SELECT nombre FROM clientes WHERE id = r.usuario_id)
            END as nombre_titular
            FROM recargas_billetera r 
            WHERE 1=1";
    $params = [];

    if ($estado) { $sql .= " AND LOWER(TRIM(r.estado)) = LOWER(TRIM(:est))"; $params['est'] = $estado; }
    if ($usuarioId) { $sql .= " AND r.usuario_id = :uid"; $params['uid'] = $usuarioId; }

    $sql .= " ORDER BY r.creado_en DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $recargas = $stmt->fetchAll();
    foreach ($recargas as &$recarga) {
        $est = strtolower(trim((string)($recarga['estado'] ?? '')));
        if (in_array($est, ['aprobado', 'aprobada', 'completado', 'completada', 'procesado', 'procesada'], true)) {
            $recarga['estado'] = 'aprobada';
        } elseif (in_array($est, ['rechazado', 'rechazada', 'anulado', 'anulada', 'fallido', 'fallida'], true)) {
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
    $data = Database::getJsonInput();

    if (empty($data['usuario_id']) || empty($data['monto_usd']) || empty($data['referencia'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Se requiere usuario_id, monto_usd y referencia'], 400);
    }

    $newId = 'rec-' . bin2hex(random_bytes(8));
    $stmtBcv = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv'");
    $rowBcv = $stmtBcv ? $stmtBcv->fetch() : null;
    $tasaBcv = $rowBcv ? (float)$rowBcv['valor'] : 48.50;

    $montoUsd = (float)$data['monto_usd'];
    $montoBs = $montoUsd * $tasaBcv;
    $referencia = trim((string)$data['referencia']);
    $comprobanteUrl = trim((string)($data['comprobante_url'] ?? ''));
    if ($comprobanteUrl === '') {
        $comprobanteUrl = '/uploads/comprobantes/recargas/comprobante_default.png';
    }
    $tipoUsuario = trim((string)($data['tipo_usuario'] ?? 'conductor'));
    $usuarioId = trim((string)$data['usuario_id']);

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

        try {
            $stmtVerification = $pdo->prepare('INSERT INTO verificaciones_recarga (recarga_id, comprobante_url, referencia_reportada, ip_solicitud) VALUES (:recarga_id, :comprobante_url, :referencia, :ip)');
            $stmtVerification->execute([
                'recarga_id' => $newId,
                'comprobante_url' => $comprobanteUrl,
                'referencia' => $referencia,
                'ip' => $_SERVER['REMOTE_ADDR'] ?? null
            ]);
        } catch (Throwable $eVerif) {
            error_log('Vixy verification table skipped on insert: ' . $eVerif->getMessage());
        }

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
// PUT / POST: APROBAR O RECHAZAR RECARGA (ADMINISTRACIÓN)
// -----------------------------------------------------------------------------
$data = Database::getJsonInput();
$effectiveId = $id ?? ($data['id'] ?? ($data['recarga_id'] ?? ($data['solicitud_id'] ?? null)));

if (($method === 'PUT' || ($method === 'POST' && isset($data['accion']))) && $effectiveId) {
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'finanzas', 'operador', 'admin', 'administrador']);
    $accion = strtolower(trim((string)($data['accion'] ?? 'aprobar'))); // 'aprobar' o 'rechazar'
    $motivoRechazo = $data['motivo_rechazo'] ?? null;
    $notaVerificacion = trim($data['nota_verificacion'] ?? $motivoRechazo ?? 'Aprobado por administración');
    if (strlen($notaVerificacion) < 5) {
        $notaVerificacion = 'Aprobado por administración';
    }

    if (!in_array($accion, ['aprobar', 'rechazar'], true)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'La acción de recarga no es válida'], 400);
    }

    $stmtCheck = $pdo->prepare("SELECT * FROM recargas_billetera WHERE (LOWER(TRIM(id)) = LOWER(TRIM(:id)) OR LOWER(TRIM(referencia)) = LOWER(TRIM(:id2))) AND LOWER(TRIM(estado)) = 'pendiente' LIMIT 1");
    $stmtCheck->execute(['id' => $effectiveId, 'id2' => $effectiveId]);
    $recarga = $stmtCheck->fetch();

    if (!$recarga) {
        // Buscar si existe pero ya no está pendiente
        $stmtAny = $pdo->prepare("SELECT estado FROM recargas_billetera WHERE (LOWER(TRIM(id)) = LOWER(TRIM(:id)) OR LOWER(TRIM(referencia)) = LOWER(TRIM(:id2))) LIMIT 1");
        $stmtAny->execute(['id' => $effectiveId, 'id2' => $effectiveId]);
        $existing = $stmtAny->fetch();
        if ($existing) {
            Database::jsonResponse(['success' => true, 'estado' => $existing['estado'], 'mensaje' => 'La recarga ya fue procesada anteriormente: ' . $existing['estado']]);
        }
        Database::jsonResponse(['error' => true, 'mensaje' => 'Recarga no encontrada en el sistema'], 404);
    }

    $realId = $recarga['id'];
    $pdo->beginTransaction();
    try {

    if ($accion === 'aprobar') {
        $montoUsd = (float)$recarga['monto_usd'];
        $tipoUsuario = $recarga['tipo_usuario'];
        $usuarioId = $recarga['usuario_id'];
        $saldoAnterior = 0.0;
        $saldoNuevo = $montoUsd;

        // 1. CRÍTICO: marcar aprobada PRIMERO
        $updRec = $pdo->prepare("UPDATE recargas_billetera SET estado = 'aprobada', revisado_por = :admin WHERE id = :id");
        $updRec->execute(['admin' => $authUser['username'] ?? $authUser['email'] ?? 'admin', 'id' => $realId]);

        // 2. Acreditar saldo según el tipo de usuario (a prueba de fallos de columnas)
        try {
            if ($tipoUsuario === 'conductor') {
                $colInfo = $pdo->query("SHOW COLUMNS FROM conductores")->fetchAll(\PDO::FETCH_COLUMN);
                $cols = [];
                if (in_array('saldo_billetera_usd', $colInfo)) $cols[] = 'saldo_billetera_usd = saldo_billetera_usd + :monto';
                if (in_array('bloqueado_por_saldo', $colInfo)) $cols[] = 'bloqueado_por_saldo = 0';
                if (in_array('disponible', $colInfo)) $cols[] = 'disponible = 1';
                if (in_array('ultima_actualizacion', $colInfo)) $cols[] = 'ultima_actualizacion = NOW()';

                $idDigits = preg_replace('/[^0-9]/', '', $usuarioId);
                $whereCond = 'WHERE id = :uid OR codigo_conductor = :uid2 OR cedula = :uid3';
                if (!empty($idDigits)) {
                    $whereCond .= " OR REPLACE(REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), 'E-', ''), '-', ''), ' ', '') = :digits";
                }

                if ($cols) {
                    $params = ['uid' => $usuarioId, 'uid2' => $usuarioId, 'uid3' => $usuarioId];
                    if (!empty($idDigits)) $params['digits'] = $idDigits;
                    if (in_array('saldo_billetera_usd', $colInfo)) $params['monto'] = $montoUsd;
                    $pdo->prepare('UPDATE conductores SET ' . implode(', ', $cols) . " {$whereCond}")->execute($params);
                }

                // También acreditar en c2861522_regist si existe
                $pdoReg = Database::getRegistConnection();
                if ($pdoReg) {
                    try {
                        $paramsR = ['uid' => $usuarioId, 'uid2' => $usuarioId, 'uid3' => $usuarioId, 'monto' => $montoUsd];
                        $whereCondR = 'WHERE id = :uid OR codigo_conductor = :uid2 OR cedula = :uid3';
                        if (!empty($idDigits)) {
                            $whereCondR .= " OR REPLACE(REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), 'E-', ''), '-', ''), ' ', '') = :digits";
                            $paramsR['digits'] = $idDigits;
                        }
                        $pdoReg->prepare("UPDATE conductores SET saldo_billetera_usd = saldo_billetera_usd + :monto {$whereCondR}")->execute($paramsR);
                    } catch (Throwable $_tR) {}
                }

                if (in_array('saldo_billetera_usd', $colInfo)) {
                    $paramsQ = ['uid' => $usuarioId, 'uid2' => $usuarioId, 'uid3' => $usuarioId];
                    if (!empty($idDigits)) $paramsQ['digits'] = $idDigits;
                    $r = $pdo->prepare("SELECT saldo_billetera_usd FROM conductores {$whereCond} LIMIT 1");
                    $r->execute($paramsQ);
                    $val = $r->fetchColumn();
                    if ($val !== false) {
                        $saldoNuevo = (float)$val;
                        $saldoAnterior = $saldoNuevo - $montoUsd;
                    }
                }
            } elseif ($tipoUsuario === 'comercio') {
                $pdo->prepare('UPDATE comercios SET saldo_billetera_usd = saldo_billetera_usd + :monto WHERE id = :uid OR rif = :uid2 OR email = :uid3')
                    ->execute(['monto' => $montoUsd, 'uid' => $usuarioId, 'uid2' => $usuarioId, 'uid3' => $usuarioId]);
                $r = $pdo->prepare('SELECT saldo_billetera_usd FROM comercios WHERE id = :id OR rif = :id2 LIMIT 1');
                $r->execute(['id' => $usuarioId, 'id2' => $usuarioId]);
                $val = $r->fetchColumn();
                if ($val !== false) {
                    $saldoNuevo = (float)$val;
                    $saldoAnterior = $saldoNuevo - $montoUsd;
                }
            } else {
                // Para clientes: actualizar ambas columnas para total consistencia
                $colClientes = $pdo->query("SHOW COLUMNS FROM clientes")->fetchAll(\PDO::FETCH_COLUMN);
                $updParts = [];
                $pParams = ['uid' => $usuarioId, 'uid2' => $usuarioId, 'uid3' => $usuarioId];
                if (in_array('saldo_cartera_usd', $colClientes)) {
                    $updParts[] = 'saldo_cartera_usd = saldo_cartera_usd + :monto1';
                    $pParams['monto1'] = $montoUsd;
                }
                if (in_array('saldo_billetera_usd', $colClientes)) {
                    $updParts[] = 'saldo_billetera_usd = saldo_billetera_usd + :monto2';
                    $pParams['monto2'] = $montoUsd;
                }
                
                if (!empty($updParts)) {
                    $sqlUpdCli = "UPDATE clientes SET " . implode(', ', $updParts) . " WHERE id = :uid OR cedula = :uid2 OR telefono = :uid3";
                    $pdo->prepare($sqlUpdCli)->execute($pParams);
                }

                // Sincronizar columnas si una estaba desfasada en 0.00
                if (in_array('saldo_cartera_usd', $colClientes) && in_array('saldo_billetera_usd', $colClientes)) {
                    try {
                        $pdo->prepare("UPDATE clientes SET saldo_billetera_usd = saldo_cartera_usd WHERE (id = :uid OR cedula = :uid2 OR telefono = :uid3) AND (saldo_billetera_usd = 0 OR saldo_billetera_usd IS NULL) AND saldo_cartera_usd > 0")->execute(['uid' => $usuarioId, 'uid2' => $usuarioId, 'uid3' => $usuarioId]);
                        $pdo->prepare("UPDATE clientes SET saldo_cartera_usd = saldo_billetera_usd WHERE (id = :uid OR cedula = :uid2 OR telefono = :uid3) AND (saldo_cartera_usd = 0 OR saldo_cartera_usd IS NULL) AND saldo_billetera_usd > 0")->execute(['uid' => $usuarioId, 'uid2' => $usuarioId, 'uid3' => $usuarioId]);
                    } catch (Throwable $_eSyncCol) {}
                }

                $r = $pdo->prepare("SELECT GREATEST(COALESCE(saldo_cartera_usd, 0.00), COALESCE(saldo_billetera_usd, 0.00)) FROM clientes WHERE id = :id OR cedula = :id2 LIMIT 1");
                $r->execute(['id' => $usuarioId, 'id2' => $usuarioId]);
                $val = $r->fetchColumn();
                if ($val !== false) {
                    $saldoNuevo = (float)$val;
                    $saldoAnterior = $saldoNuevo - $montoUsd;
                }
            }
        } catch (Throwable $_eSaldo) {
            error_log('Vixy recharge: balance update warning: ' . $_eSaldo->getMessage());
        }

        // 3. Tablas de auditoría auxiliares (en bloques try-catch independientes)
        try {
            $stmtTrx = $pdo->prepare("INSERT INTO transacciones_billetera (id, usuario_id, tipo_usuario, tipo_movimiento, concepto, monto_usd, saldo_anterior_usd, saldo_nuevo_usd, referencia_id) VALUES (:id, :uid, :tipo, 'ingreso', 'Recarga de saldo aprobada por administración', :monto, :saldo_anterior, :saldo_nuevo, :ref_id)");
            $stmtTrx->execute([
                'id' => 'trx-' . bin2hex(random_bytes(8)),
                'uid' => $usuarioId,
                'tipo' => $tipoUsuario,
                'monto' => $montoUsd,
                'saldo_anterior' => $saldoAnterior,
                'saldo_nuevo' => $saldoNuevo,
                'ref_id' => $realId
            ]);
        } catch (Throwable $auditError) {
            error_log('Vixy recharge transaction audit skipped: ' . $auditError->getMessage());
        }

        try {
            $stmtLedger = $pdo->prepare("INSERT INTO movimientos_wallet (id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion) VALUES (:id, :usuario_id, :tipo_usuario, 'recarga', :monto_usd, 0, :monto_usd, :tasa_bcv, :monto_bs, :referencia_id, :descripcion)");
            $stmtLedger->execute([
                'id' => 'mw-rec-' . $realId,
                'usuario_id' => $usuarioId,
                'tipo_usuario' => $tipoUsuario,
                'monto_usd' => $montoUsd,
                'tasa_bcv' => (float)($recarga['tasa_bcv'] ?? 1),
                'monto_bs' => (float)($recarga['monto_bs'] ?? 0),
                'referencia_id' => $realId,
                'descripcion' => 'Recarga aprobada por administración'
            ]);
        } catch (Throwable $auditError) {
            error_log('Vixy recharge ledger skipped: ' . $auditError->getMessage());
        }

        try {
            $updVerification = $pdo->prepare("UPDATE verificaciones_recarga SET estado = 'aprobada', conciliacion_confirmada = 1, nota_verificacion = :nota, verificado_por = :admin, verificado_por_usuario_id = :admin_id, fecha_verificacion = NOW() WHERE recarga_id = :id");
            $updVerification->execute([
                'nota' => $notaVerificacion,
                'admin' => $authUser['username'] ?? $authUser['email'] ?? 'admin',
                'admin_id' => $authUser['sub'] ?? $authUser['id'] ?? '',
                'id' => $realId
            ]);
        } catch (Throwable $verificationError) {
            error_log('Vixy recharge verification audit skipped: ' . $verificationError->getMessage());
        }

        $pdo->commit();

        Database::jsonResponse([
            'success' => true,
            'estado' => 'aprobada',
            'recarga_id' => $realId,
            'mensaje' => 'Recarga aprobada y saldo acreditado con éxito'
        ]);
    } else {
        // ACCIÓN: RECHAZAR
        $updRec = $pdo->prepare("UPDATE recargas_billetera SET estado = 'rechazada', revisado_por = :admin, motivo_rechazo = :mot WHERE id = :id");
        $updRec->execute([
            'admin' => $authUser['username'] ?? 'admin',
            'mot' => $motivoRechazo ?: 'Comprobante no coincide con extracto bancario',
            'id' => $realId
        ]);

        try {
            $updVerification = $pdo->prepare("UPDATE verificaciones_recarga SET estado = 'rechazada', nota_verificacion = :nota, verificado_por = :admin, verificado_por_usuario_id = :admin_id, fecha_verificacion = NOW() WHERE recarga_id = :id");
            $updVerification->execute([
                'nota' => $motivoRechazo ?: 'Comprobante no coincide con extracto bancario',
                'admin' => $authUser['username'] ?? $authUser['email'] ?? 'admin',
                'admin_id' => $authUser['sub'] ?? $authUser['id'] ?? '',
                'id' => $realId
            ]);
        } catch (Throwable $verificationError) {
            error_log('Vixy recharge reject verification audit skipped: ' . $verificationError->getMessage());
        }

        $pdo->commit();

        Database::jsonResponse(['success' => true, 'estado' => 'rechazada', 'recarga_id' => $realId, 'mensaje' => 'Recarga rechazada con éxito']);
    }
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('Vixy recharge verification error: ' . $error->getMessage());
        Database::jsonResponse(['error' => true, 'mensaje' => 'No se pudo procesar la verificación de pago: ' . $error->getMessage()], 500);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción no permitida'], 405);
