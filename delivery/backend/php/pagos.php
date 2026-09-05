<?php
/**
 * Vixy Delivery Platform - API de Procesamiento de Pagos y Liquidación de Comisiones
 * Recibe información de pagos (Pago Móvil, Zelle, Zinli, Binance, Efectivo, Cartera)
 * Desglosa: Costo de Producto, Costo de Viaje, Ganancia del Conductor y Ganancia de la App
 * Ejecuta el descuento de la comisión del servicio en la billetera del conductor (-$0.50 límite)
 * Compatible con cPanel, phpMyAdmin y MySQL 5.7+ / 8.0+.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido. Use POST.'], 405);
}

$data = Database::getJsonInput();

// Validaciones requeridas
$pedidoId = $data['pedido_id'] ?? null;
$metodoPago = $data['metodo_pago'] ?? 'pago_movil';
$referencia = $data['referencia_pago'] ?? $data['referencia'] ?? null;
$comprobanteUrl = $data['comprobante_url'] ?? null;

if (!$pedidoId) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Se requiere pedido_id'], 400);
}

// 1. Obtener la orden central y sus montos
$stmtPed = $pdo->prepare("
    SELECT p.*, c.nombre AS comercio_nombre, cli.nombre AS cliente_nombre,
           d.id AS cond_id, d.nombre AS conductor_nombre, d.apellido AS conductor_apellido,
           d.saldo_billetera_usd, d.limite_saldo_negativo
    FROM pedidos p
    LEFT JOIN comercios c ON p.comercio_id = c.id
    LEFT JOIN clientes cli ON p.cliente_id = cli.id
    LEFT JOIN conductores d ON p.conductor_id = d.id
    WHERE p.id = :id OR p.codigo_seguimiento = :id2
    LIMIT 1
");
$stmtPed->execute(['id' => $pedidoId, 'id2' => $pedidoId]);
$order = $stmtPed->fetch();

if (!$order) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no encontrado'], 404);
}

// 2. Tasa oficial BCV
$tasaBcv = (float)($order['tasa_bcv_bs'] ?: 48.50);

// 3. Desglose Financiero Obligatorio (4 Pilares)
// - Costo de los productos (Subtotal)
$costoProductoUsd = (float)($order['costo_producto_usd'] > 0 ? $order['costo_producto_usd'] : $order['monto_subtotal_usd']);

// - Costo del delivery / viaje
$costoDeliveryUsd = (float)($order['costo_delivery_usd'] > 0 ? $order['costo_delivery_usd'] : $order['costo_envio_usd']);

// - Total general de la operación
$montoTotalUsd = $costoProductoUsd + $costoDeliveryUsd;
$montoTotalBs = round($montoTotalUsd * $tasaBcv, 2);

// - Porcentaje de comisión de la plataforma (15%)
$porcentajeComision = 0.15;
$porcentajeConductor = 0.85;

// - Ganancia de la aplicación (Comisión retenida o descontada sobre el delivery)
$gananciaAppUsd = round($costoDeliveryUsd * $porcentajeComision, 2);

// - Ganancia neta del conductor por el servicio
$gananciaConductorUsd = round($costoDeliveryUsd - $gananciaAppUsd, 2);

$conductorId = $order['conductor_id'] ?: ($data['conductor_id'] ?? null);

// 4. Procesamiento según el método de pago y liquidación de comisión al conductor
$comisionDescontada = false;
$detalleOperacion = '';
$esPagoEfectivo = in_array($metodoPago, ['efectivo', 'efectivo_usd']);

if ($conductorId) {
    // Si el pago es en efectivo (el cliente paga en mano al motorizado):
    // El motorizado retiene el dinero en efectivo, por lo que la plataforma le debita
    // la comisión administrativa (15% del flete) de su billetera virtual.
    if ($esPagoEfectivo) {
        $detalleOperacion = "Débito automático de comisión (15% sobre flete de $" . number_format($costoDeliveryUsd, 2) . ") por cobro en efectivo del pedido #{$order['codigo_seguimiento']}";

        // Debitar comisión de la billetera del conductor
        $stmtDebito = $pdo->prepare("
            UPDATE conductores 
            SET saldo_billetera_usd = saldo_billetera_usd - :comision
            WHERE id = :cid
        ");
        $stmtDebito->execute([
            'comision' => $gananciaAppUsd,
            'cid' => $conductorId
        ]);

        // Registrar en historial de transacciones del conductor
        $stmtTx = $pdo->prepare("
            INSERT INTO transacciones_conductor (
                id, conductor_id, tipo, monto_usd, saldo_resultante_usd, pedido_id, 
                codigo_seguimiento, metodo_pago, referencia, descripcion, estado
            ) VALUES (
                :id, :cid, 'comision_carrera', :monto, 
                (SELECT saldo_billetera_usd FROM conductores WHERE id = :cid2),
                :pid, :cod, :metodo, :ref, :desc, 'completado'
            )
        ");
        $stmtTx->execute([
            'id' => 'tx-cond-' . uniqid(),
            'cid' => $conductorId,
            'cid2' => $conductorId,
            'monto' => -$gananciaAppUsd,
            'pid' => $order['id'],
            'cod' => $order['codigo_seguimiento'],
            'metodo' => $metodoPago,
            'ref' => $referencia,
            'desc' => $detalleOperacion
        ]);

        $comisionDescontada = true;

    } else {
        // Pagos electrónicos (Pago Móvil, Zelle, Zinli, Binance, Cartera Vixy):
        // La plataforma recauda el total. Acredita la ganancia neta al conductor (+85%)
        // o retiene la comisión directamente.
        $detalleOperacion = "Ganancia neta abonada por pedido #{$order['codigo_seguimiento']} pagado vía {$metodoPago}";

        $stmtAbono = $pdo->prepare("
            UPDATE conductores 
            SET saldo_billetera_usd = saldo_billetera_usd + :neto
            WHERE id = :cid
        ");
        $stmtAbono->execute([
            'neto' => $gananciaConductorUsd,
            'cid' => $conductorId
        ]);

        $stmtTx = $pdo->prepare("
            INSERT INTO transacciones_conductor (
                id, conductor_id, tipo, monto_usd, saldo_resultante_usd, pedido_id, 
                codigo_seguimiento, metodo_pago, referencia, descripcion, estado
            ) VALUES (
                :id, :cid, 'ganancia_carrera', :monto, 
                (SELECT saldo_billetera_usd FROM conductores WHERE id = :cid2),
                :pid, :cod, :metodo, :ref, :desc, 'completado'
            )
        ");
        $stmtTx->execute([
            'id' => 'tx-cond-' . uniqid(),
            'cid' => $conductorId,
            'cid2' => $conductorId,
            'monto' => $gananciaConductorUsd,
            'pid' => $order['id'],
            'cod' => $order['codigo_seguimiento'],
            'metodo' => $metodoPago,
            'ref' => $referencia,
            'desc' => $detalleOperacion
        ]);

        $comisionDescontada = true;
    }

    // 5. Verificación estricta de la regla de saldo negativo (-$0.50 USD)
    $stmtVerif = $pdo->prepare("SELECT saldo_billetera_usd, limite_saldo_negativo FROM conductores WHERE id = :cid");
    $stmtVerif->execute(['cid' => $conductorId]);
    $condData = $stmtVerif->fetch();

    if ($condData && (float)$condData['saldo_billetera_usd'] < -0.50) {
        $pdo->prepare("
            UPDATE conductores 
            SET bloqueado_por_saldo = 1, disponible = 0 
            WHERE id = :cid
        ")->execute(['cid' => $conductorId]);
    }
}

// 6. Actualizar la comanda central en la tabla `pedidos`
$desgloseJson = json_encode([
    'costo_producto_usd' => $costoProductoUsd,
    'costo_delivery_usd' => $costoDeliveryUsd,
    'ganancia_conductor_usd' => $gananciaConductorUsd,
    'ganancia_app_usd' => $gananciaAppUsd,
    'comision_porcentaje' => 15,
    'monto_total_usd' => $montoTotalUsd,
    'monto_total_bs' => $montoTotalBs,
    'tasa_bcv' => $tasaBcv,
    'metodo_pago' => $metodoPago,
    'referencia' => $referencia,
    'fecha_procesado' => date('Y-m-d H:i:s')
]);

$stmtUpdOrder = $pdo->prepare("
    UPDATE pedidos 
    SET costo_producto_usd = :costo_prod,
        costo_delivery_usd = :costo_deliv,
        monto_total_usd = :tot_usd,
        monto_total_bs = :tot_bs,
        ganancia_conductor_usd = :gan_cond,
        ganancia_app_usd = :gan_app,
        metodo_pago = :metodo,
        referencia_pago = :ref,
        comprobante_url = COALESCE(:comp, comprobante_url),
        comision_descontada = :com_desc,
        detalles_liquidacion = :detalles,
        estado = CASE WHEN estado = 'solicitud_enviada' THEN 'pago_verificado' ELSE estado END
    WHERE id = :id
");

$stmtUpdOrder->execute([
    'costo_prod' => $costoProductoUsd,
    'costo_deliv' => $costoDeliveryUsd,
    'tot_usd' => $montoTotalUsd,
    'tot_bs' => $montoTotalBs,
    'gan_cond' => $gananciaConductorUsd,
    'gan_app' => $gananciaAppUsd,
    'metodo' => $metodoPago,
    'ref' => $referencia,
    'comp' => $comprobanteUrl,
    'com_desc' => $comisionDescontada ? 1 : 0,
    'detalles' => $desgloseJson,
    'id' => $order['id']
]);

// 7. Respuesta estructurada completa para las 4 aplicaciones y el panel web
Database::jsonResponse([
    'success' => true,
    'mensaje' => 'Pago recibido y procesado con éxito. Liquidación de comisiones ejecutada.',
    'pedido_id' => $order['id'],
    'codigo_seguimiento' => $order['codigo_seguimiento'],
    'desglose_financiero' => [
        'costo_producto_usd' => $costoProductoUsd,
        'costo_delivery_usd' => $costoDeliveryUsd,
        'ganancia_conductor_usd' => $gananciaConductorUsd,
        'ganancia_app_usd' => $gananciaAppUsd,
        'monto_total_usd' => $montoTotalUsd,
        'monto_total_bs' => $montoTotalBs,
        'tasa_bcv_bs' => $tasaBcv
    ],
    'informacion_pago' => [
        'metodo_pago' => $metodoPago,
        'referencia' => $referencia,
        'comision_descontada' => $comisionDescontada,
        'detalle_operacion' => $detalleOperacion
    ]
], 200);
