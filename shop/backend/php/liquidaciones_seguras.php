<?php
/**
 * Liquidaciones sobre saldo neto ya acreditado.
 * La comisión Vixy se separó al entregar el pedido y nunca se recalcula aquí.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$authUser = AuthMiddleware::requireAuth(['super_admin', 'finanzas']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido.'], 405);
}

$data = Database::getJsonInput();
$tipo = trim((string)($data['tipo'] ?? ''));
$entidadId = trim((string)($data['entidadId'] ?? $data['comercioId'] ?? $data['conductorId'] ?? ''));
$montoSolicitado = round((float)($data['montoNetoUsd'] ?? $data['montoBrutoUsd'] ?? 0), 2);
$referencia = trim((string)($data['referenciaBancaria'] ?? ''));
$metodoPago = trim((string)($data['metodoPago'] ?? 'pago_movil'));
$comprobanteUrl = trim((string)($data['comprobanteUrl'] ?? ''));
$notas = trim((string)($data['notas'] ?? ''));

if (!in_array($tipo, ['comercio', 'conductor'], true) || $entidadId === '' || $montoSolicitado <= 0 || $referencia === '') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Tipo, entidad, monto neto y referencia son obligatorios.'], 400);
}

try {
    $pdo->beginTransaction();

    // Bloquea los movimientos de la entidad para evitar dos liquidaciones simultáneas.
    $stmtMovimientos = $pdo->prepare("SELECT id, monto_neto_usd
        FROM movimientos_wallet
        WHERE tipo_usuario = :tipo AND usuario_id = :usuario_id
        FOR UPDATE");
    $stmtMovimientos->execute(['tipo' => $tipo, 'usuario_id' => $entidadId]);
    $saldoDisponible = round(array_sum(array_map(static function ($row) {
        return (float)$row['monto_neto_usd'];
    }, $stmtMovimientos->fetchAll())), 2);

    if ($saldoDisponible <= 0) {
        throw new RuntimeException('La cartera no tiene saldo disponible para liquidar.');
    }
    if ($montoSolicitado > $saldoDisponible) {
        throw new RuntimeException('El monto solicitado supera el saldo neto disponible de $' . number_format($saldoDisponible, 2) . '.');
    }

    $stmtDuplicadaComercio = $pdo->prepare('SELECT id FROM liquidaciones_comercios WHERE referencia_bancaria = :referencia LIMIT 1');
    $stmtDuplicadaComercio->execute(['referencia' => $referencia]);
    $stmtDuplicadaConductor = $pdo->prepare('SELECT id FROM liquidaciones_conductores WHERE referencia_bancaria = :referencia LIMIT 1');
    $stmtDuplicadaConductor->execute(['referencia' => $referencia]);
    if ($stmtDuplicadaComercio->fetch() || $stmtDuplicadaConductor->fetch()) {
        throw new RuntimeException('La referencia bancaria ya fue utilizada en otra liquidación.');
    }

    $stmtTasa = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv' LIMIT 1");
    $tasaBcv = (float)($stmtTasa->fetchColumn() ?: 0);
    $montoBs = round($montoSolicitado * $tasaBcv, 2);
    $liquidacionId = ($tipo === 'comercio' ? 'LIQ-COM-' : 'LIQ-DRV-') . strtoupper(substr(bin2hex(random_bytes(8)), 0, 12));
    $autorizado = $authUser['username'] ?? $authUser['email'] ?? $authUser['sub'] ?? 'administracion';

    if ($tipo === 'comercio') {
        $stmt = $pdo->prepare("INSERT INTO liquidaciones_comercios
            (id, comercio_id, monto_bruto_usd, comision_empresa_usd, monto_neto_usd, monto_neto_bs,
             tasa_bcv_aplicada, metodo_pago, referencia_bancaria, comprobante_url, comprobante_ruta_sql,
             estado, autorizado_por, notas)
            VALUES (:id, :entidad, :monto, 0, :neto, :bs, :tasa, :metodo, :referencia, :comprobante,
                    :ruta, 'procesado', :autorizado, :notas)");
    } else {
        $stmt = $pdo->prepare("INSERT INTO liquidaciones_conductores
            (id, conductor_id, monto_bruto_carreras_usd, comision_empresa_usd, monto_neto_usd, monto_neto_bs,
             tasa_bcv_aplicada, metodo_pago, referencia_bancaria, comprobante_url, comprobante_ruta_sql,
             estado, autorizado_por, notas)
            VALUES (:id, :entidad, :monto, 0, :neto, :bs, :tasa, :metodo, :referencia, :comprobante,
                    :ruta, 'procesado', :autorizado, :notas)");
    }
    $stmt->execute([
        'id' => $liquidacionId,
        'entidad' => $entidadId,
        'monto' => $montoSolicitado,
        'neto' => $montoSolicitado,
        'bs' => $montoBs,
        'tasa' => $tasaBcv,
        'metodo' => $metodoPago,
        'referencia' => $referencia,
        'comprobante' => $comprobanteUrl ?: null,
        'ruta' => $comprobanteUrl,
        'autorizado' => $autorizado,
        'notas' => trim('Comisión Vixy separada previamente al acreditar cada pedido. ' . $notas),
    ]);

    $stmtLedger = $pdo->prepare("INSERT INTO movimientos_wallet
        (id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd,
         monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion)
        VALUES (:id, :usuario_id, :tipo, 'liquidacion', 0, 0, :neto, :tasa, :neto_bs, :referencia,
                :descripcion)");
    $stmtLedger->execute([
        'id' => 'mw-liq-' . $liquidacionId,
        'usuario_id' => $entidadId,
        'tipo' => $tipo,
        'neto' => -$montoSolicitado,
        'tasa' => $tasaBcv,
        'neto_bs' => -$montoBs,
        'referencia' => $liquidacionId,
        'descripcion' => 'Liquidación de saldo neto disponible. Ref. bancaria: ' . $referencia,
    ]);

    $pdo->commit();
    Database::jsonResponse([
        'success' => true,
        'id' => $liquidacionId,
        'tipo' => $tipo,
        'montoNetoUsd' => $montoSolicitado,
        'montoNetoBs' => $montoBs,
        'saldoAnteriorUsd' => $saldoDisponible,
        'saldoRestanteUsd' => round($saldoDisponible - $montoSolicitado, 2),
        'comisionRecalculadaUsd' => 0,
        'mensaje' => 'Liquidación registrada sobre saldo neto; la comisión Vixy permanece separada.',
    ]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $status = $error instanceof RuntimeException ? 409 : 500;
    error_log('Vixy liquidación segura: ' . $error->getMessage());
    Database::jsonResponse(['error' => true, 'mensaje' => $error->getMessage()], $status);
}
