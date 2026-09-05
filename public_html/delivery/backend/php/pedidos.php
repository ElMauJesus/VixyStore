<?php
/**
 * Vixy Delivery Platform - API de Pedidos y Ciclo de Vida Completo
 * Compatible con cPanel, App Cliente, App Comercio y App Conductor
 * Regla de Despacho: $2.00 USD hasta 3 km + $0.50/km adicional
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// -----------------------------------------------------------------------------
// GET: CONSULTAR PEDIDO O LISTAR POR CLIENTE / COMERCIO / CONDUCTOR / ADMIN
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT p.*, c.nombre as comercio_nombre, c.telefono as comercio_telefono,
                   d.nombre as conductor_nombre, d.apellido as conductor_apellido, d.telefono as conductor_telefono,
                   d.placa_moto as conductor_placa, d.latitud_actual as conductor_lat, d.longitud_actual as conductor_lng
            FROM pedidos p
            LEFT JOIN comercios c ON p.comercio_id = c.id
            LEFT JOIN conductores d ON p.conductor_id = d.id
            WHERE p.id = :id OR p.codigo_seguimiento = :id2
            LIMIT 1
        ");
        $stmt->execute(['id' => $id, 'id2' => $id]);
        $pedido = $stmt->fetch();

        if (!$pedido) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no encontrado'], 404);
        }

        // Obtener items desde detalles_pedido
        $stmtItems = $pdo->prepare("SELECT * FROM detalles_pedido WHERE pedido_id = :pid");
        $stmtItems->execute(['pid' => $pedido['id']]);
        $pedido['items'] = $stmtItems->fetchAll();

        // Obtener datos de despacho si existen
        $stmtEntrega = $pdo->prepare("SELECT * FROM entregas_carreras WHERE pedido_id = :pid LIMIT 1");
        $stmtEntrega->execute(['pid' => $pedido['id']]);
        $pedido['entrega'] = $stmtEntrega->fetch() ?: null;

        Database::jsonResponse(['success' => true, 'pedido' => $pedido]);
    }

    $comercioId = $_GET['comercio_id'] ?? null;
    $clienteId = $_GET['cliente_id'] ?? null;
    $conductorId = $_GET['conductor_id'] ?? null;
    $estado = $_GET['estado'] ?? null;

    $sql = "SELECT p.*, c.nombre as comercio_nombre, 
                   CONCAT(d.nombre, ' ', d.apellido) as conductor_nombre,
                   d.telefono as conductor_telefono, d.placa_moto as conductor_placa
            FROM pedidos p 
            LEFT JOIN comercios c ON p.comercio_id = c.id
            LEFT JOIN conductores d ON p.conductor_id = d.id
            WHERE 1=1";
    $params = [];

    if ($comercioId) { $sql .= " AND p.comercio_id = :cid"; $params['cid'] = $comercioId; }
    if ($clienteId) { $sql .= " AND p.cliente_id = :clid"; $params['clid'] = $clienteId; }
    if ($conductorId) { $sql .= " AND p.conductor_id = :drid"; $params['drid'] = $conductorId; }
    if ($estado) { $sql .= " AND p.estado = :est"; $params['est'] = $estado; }

    $sql .= " ORDER BY p.creado_en DESC LIMIT 100";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    Database::jsonResponse(['success' => true, 'pedidos' => $stmt->fetchAll()]);
}

// -----------------------------------------------------------------------------
// POST: CREAR NUEVO PEDIDO
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $data = Database::getJsonInput();

    if (empty($data['comercio_id']) || empty($data['items']) || empty($data['destino_direccion'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Faltan datos obligatorios del pedido'], 400);
    }

    // Verificar si el comercio está activo
    $stmtStore = $pdo->prepare("SELECT id, activo, abierto_manual FROM comercios WHERE id = :id");
    $stmtStore->execute(['id' => $data['comercio_id']]);
    $store = $stmtStore->fetch();

    if (!$store || !$store['activo'] || !$store['abierto_manual']) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El comercio seleccionado se encuentra cerrado temporalmente'], 400);
    }

    $newId = 'ped-' . strtoupper(substr(uniqid(), -6));
    $codigoSeguimiento = 'VXY-' . rand(100000, 999999);

    // Obtener tasa BCV desde la configuración
    $stmtBcv = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv'");
    $tasaRow = $stmtBcv->fetch();
    $tasaBcv = $tasaRow ? (float)$tasaRow['valor'] : 48.50;

    // Cálculo de tarifa por distancia: $2.00 hasta 3 km + $0.50/km adicional
    $distanciaKm = (float)($data['distancia_km'] ?? 2.5);
    $kmBase = 3.0;
    $tarifaBase = 2.00;
    $precioKmAdicional = 0.50;
    $excedenteKm = max(0, $distanciaKm - $kmBase);
    $costoEnvio = $tarifaBase + ($excedenteKm * $precioKmAdicional);

    $subtotal = (float)$data['monto_subtotal_usd'];
    $totalUsd = $subtotal + $costoEnvio;
    $totalBs = $totalUsd * $tasaBcv;

    $stmt = $pdo->prepare("
        INSERT INTO pedidos (
            id, codigo_seguimiento, cliente_id, comercio_id, estado,
            monto_subtotal_usd, costo_envio_usd, tasa_bcv_bs, monto_total_usd, monto_total_bs,
            metodo_pago, referencia_pago, comprobante_url, origen_direccion, destino_direccion, distancia_km
        ) VALUES (
            :id, :code, :client, :store, 'solicitud_enviada',
            :sub, :env, :bcv, :tot_usd, :tot_bs,
            :metodo, :ref, :comp, :origen, :destino, :dist
        )
    ");

    $stmt->execute([
        'id' => $newId,
        'code' => $codigoSeguimiento,
        'client' => $data['cliente_id'] ?? 'cli-001',
        'store' => $data['comercio_id'],
        'sub' => $subtotal,
        'env' => $costoEnvio,
        'bcv' => $tasaBcv,
        'tot_usd' => $totalUsd,
        'tot_bs' => $totalBs,
        'metodo' => $data['metodo_pago'] ?? 'pago_movil',
        'ref' => $data['referencia_pago'] ?? null,
        'comp' => $data['comprobante_url'] ?? null,
        'origen' => $data['origen_direccion'] ?? 'Comercio Aliado',
        'destino' => $data['destino_direccion'],
        'dist' => $distanciaKm
    ]);

    // Insertar items en detalles_pedido
    $stmtItem = $pdo->prepare("
        INSERT INTO detalles_pedido (id, pedido_id, producto_id, nombre_producto, cantidad, precio_unitario_usd, subtotal_usd) 
        VALUES (:id, :pid, :prod_id, :nombre, :cant, :punit, :sub)
    ");

    foreach ($data['items'] as $it) {
        $stmtItem->execute([
            'id' => 'det-' . uniqid(),
            'pid' => $newId,
            'prod_id' => $it['producto_id'] ?? 'prod-custom',
            'nombre' => $it['nombre'] ?? $it['nombre_producto'] ?? 'Producto',
            'cant' => $it['cantidad'] ?? 1,
            'punit' => $it['precio_unitario_usd'] ?? $it['precio_usd'] ?? 0,
            'sub' => ($it['cantidad'] ?? 1) * ($it['precio_unitario_usd'] ?? $it['precio_usd'] ?? 0)
        ]);
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Pedido registrado exitosamente en Vixy',
        'pedido_id' => $newId,
        'codigo_seguimiento' => $codigoSeguimiento,
        'costo_envio_usd' => $costoEnvio,
        'total_usd' => $totalUsd,
        'total_bs' => $totalBs
    ], 201);
}

// -----------------------------------------------------------------------------
// PUT: CAMBIO DE ESTADO O ASIGNACIÓN DE CONDUCTOR
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    $data = Database::getJsonInput();
    $nuevoEstado = $data['estado'] ?? null;
    $conductorId = $data['conductor_id'] ?? null;

    if ($nuevoEstado) {
        $fields = ["estado = :est"];
        $params = ['est' => $nuevoEstado, 'id' => $id];

        if ($conductorId) {
            // Verificar si el conductor está bloqueado por saldo negativo (< -$0.50)
            $stmtCond = $pdo->prepare("SELECT disponible, saldo_billetera_usd, bloqueado_por_saldo FROM conductores WHERE id = :cid");
            $stmtCond->execute(['cid' => $conductorId]);
            $cond = $stmtCond->fetch();

            if ($cond && ($cond['saldo_billetera_usd'] < -0.50 || $cond['bloqueado_por_saldo'])) {
                Database::jsonResponse([
                    'error' => true,
                    'mensaje' => 'El conductor no puede tomar nuevas carreras porque su saldo es inferior a -$0.50 USD. Debe recargar su billetera.'
                ], 403);
            }

            $fields[] = "conductor_id = :cid";
            $params['cid'] = $conductorId;

            // Crear o actualizar registro en entregas_carreras
            $stmtPed = $pdo->prepare("SELECT distancia_km, costo_envio_usd FROM pedidos WHERE id = :id");
            $stmtPed->execute(['id' => $id]);
            $ped = $stmtPed->fetch();

            $distKm = $ped ? (float)$ped['distancia_km'] : 2.5;
            $excedente = max(0, $distKm - 3.0);
            $costoTotal = $ped ? (float)$ped['costo_envio_usd'] : 2.00;
            $comision = round($costoTotal * 0.15, 2);
            $gananciaNeta = round($costoTotal - $comision, 2);

            $stmtCarrera = $pdo->prepare("
                INSERT INTO entregas_carreras (
                    id, pedido_id, conductor_id, distancia_total_km, distancia_excedente_km,
                    tarifa_base_usd, tarifa_adicional_usd, costo_envio_total_usd,
                    comision_plataforma_usd, ganancia_neta_conductor_usd, estado, inicio_en
                ) VALUES (
                    :id, :pid, :cid, :dist, :exc, 2.00, :tar_adic, :tot, :com, :neto, 'asignada', NOW()
                ) ON DUPLICATE KEY UPDATE 
                    conductor_id = VALUES(conductor_id),
                    estado = VALUES(estado)
            ");
            $stmtCarrera->execute([
                'id' => 'ent-' . uniqid(),
                'pid' => $id,
                'cid' => $conductorId,
                'dist' => $distKm,
                'exc' => $excedente,
                'tar_adic' => $excedente * 0.50,
                'tot' => $costoTotal,
                'com' => $comision,
                'neto' => $gananciaNeta
            ]);
        }

        if ($nuevoEstado === 'entregado') {
            $fields[] = "entregado_en = NOW()";

            // Marcar entrega completada y abonar ganancias al conductor
            $stmtFin = $pdo->prepare("
                UPDATE entregas_carreras 
                SET estado = 'completada', completado_en = NOW() 
                WHERE pedido_id = :id
            ");
            $stmtFin->execute(['id' => $id]);

            // Obtener ganancia neta para actualizar saldo de conductor
            $stmtGetEnt = $pdo->prepare("SELECT conductor_id, ganancia_neta_conductor_usd FROM entregas_carreras WHERE pedido_id = :id");
            $stmtGetEnt->execute(['id' => $id]);
            $entData = $stmtGetEnt->fetch();

            if ($entData && !empty($entData['conductor_id'])) {
                $updSaldo = $pdo->prepare("
                    UPDATE conductores 
                    SET saldo_billetera_usd = saldo_billetera_usd + :neto,
                        total_carreras = total_carreras + 1,
                        en_carrera = 0,
                        disponible = 1
                    WHERE id = :cid
                ");
                $updSaldo->execute([
                    'neto' => (float)$entData['ganancia_neta_conductor_usd'],
                    'cid' => $entData['conductor_id']
                ]);
            }
        }

        $sql = "UPDATE pedidos SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        Database::jsonResponse([
            'success' => true,
            'mensaje' => "Estado del pedido actualizado a {$nuevoEstado}"
        ]);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción no permitida'], 405);
