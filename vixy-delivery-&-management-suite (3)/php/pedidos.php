<?php
/**
 * ==============================================================================
 * VIXY DELIVERY PLATFORM - CONTROLADOR PRINCIPAL DE PEDIDOS (PHP 8.0+ / cPanel)
 * ==============================================================================
 * Maneja el ciclo completo del pedido:
 * 1. Creación por cliente con cálculo de tarifa: $2.00 USD hasta 3 km + $0.50/km adicional
 * 2. Temporizador de Comercio (60 segundos) y Aceptación/Rechazo
 * 3. Temporizador de Conductor (15 segundos) y Aceptación/Rechazo
 * 4. Reasignación automática inmediata al conductor libre más cercano al comercio
 * 5. Bloqueo de conductores con saldo inferior a -$0.50 USD
 * 6. Finalización con foto de entrega y acreditación de ganancias netas
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// Helper: Buscar el conductor libre más cercano al comercio que no haya rechazado
function buscarConductorMasCercano($pdo, $comercioId, $excluidos = []) {
    // Coordenadas del comercio
    $stmtC = $pdo->prepare("SELECT latitud, longitud FROM comercios WHERE id = :id LIMIT 1");
    $stmtC->execute(['id' => $comercioId]);
    $com = $stmtC->fetch();
    $lat = $com ? (float)$com['latitud'] : 10.4880;
    $lng = $com ? (float)$com['longitud'] : -66.8533;

    // Buscar conductores activos, solventes y disponibles (NO en carrera)
    $stmt = $pdo->prepare("
        SELECT id, nombre, apellido, telefono, placa_moto, latitud_actual, longitud_actual, saldo_billetera_usd,
               (6371 * acos(
                   cos(radians(:lat)) * cos(radians(latitud_actual)) * cos(radians(longitud_actual) - radians(:lng)) + 
                   sin(radians(:lat)) * sin(radians(latitud_actual))
               )) AS distancia_km
        FROM conductores
        WHERE disponible = 1 
          AND en_carrera = 0 
          AND bloqueado_por_saldo = 0 
          AND saldo_billetera_usd > -0.50
        ORDER BY distancia_km ASC
    ");
    $stmt->execute(['lat' => $lat, 'lng' => $lng]);
    $conductores = $stmt->fetchAll();

    foreach ($conductores as $c) {
        if (!in_array($c['id'], $excluidos)) {
            return $c;
        }
    }
    return null;
}

// -----------------------------------------------------------------------------
// GET: CONSULTAR PEDIDO ESPECÍFICO O LISTAR CON FILTROS
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT p.*, c.nombre as comercio_nombre, c.telefono as comercio_telefono, c.direccion as comercio_direccion,
                   c.latitud as comercio_lat, c.longitud as comercio_lng,
                   d.nombre as conductor_nombre, d.apellido as conductor_apellido, d.telefono as conductor_telefono,
                   d.placa_moto as conductor_placa, d.latitud_actual as conductor_lat, d.longitud_actual as conductor_lng,
                   cl.nombre as cliente_nombre, cl.telefono as cliente_telefono
            FROM pedidos p
            LEFT JOIN comercios c ON p.comercio_id = c.id
            LEFT JOIN conductores d ON p.conductor_id = d.id
            LEFT JOIN clientes cl ON p.cliente_id = cl.id
            WHERE p.id = :id OR p.codigo_seguimiento = :id2
            LIMIT 1
        ");
        $stmt->execute(['id' => $id, 'id2' => $id]);
        $pedido = $stmt->fetch();

        if (!$pedido) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no encontrado'], 404);
        }

        $stmtItems = $pdo->prepare("SELECT * FROM detalles_pedido WHERE pedido_id = :pid");
        $stmtItems->execute(['pid' => $pedido['id']]);
        $pedido['items'] = $stmtItems->fetchAll();

        $stmtEntrega = $pdo->prepare("SELECT * FROM entregas_carreras WHERE pedido_id = :pid LIMIT 1");
        $stmtEntrega->execute(['pid' => $pedido['id']]);
        $pedido['entrega'] = $stmtEntrega->fetch() ?: null;

        $pedido['conductores_rechazaron'] = !empty($pedido['conductores_rechazaron']) 
            ? json_decode($pedido['conductores_rechazaron'], true) 
            : [];

        Database::jsonResponse(['success' => true, 'pedido' => $pedido]);
    }

    $comercioId = $_GET['comercio_id'] ?? null;
    $clienteId = $_GET['cliente_id'] ?? null;
    $conductorId = $_GET['conductor_id'] ?? null;
    $conductorOfrecido = $_GET['conductor_ofrecido_id'] ?? null;
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
    if ($conductorOfrecido) { $sql .= " AND p.conductor_ofrecido_id = :ofrid"; $params['ofrid'] = $conductorOfrecido; }
    if ($estado) { $sql .= " AND p.estado = :est"; $params['est'] = $estado; }

    $sql .= " ORDER BY p.creado_en DESC LIMIT 100";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    Database::jsonResponse(['success' => true, 'pedidos' => $stmt->fetchAll()]);
}

// -----------------------------------------------------------------------------
// POST: CREAR NUEVO PEDIDO (VIXY PEDIDOS / APP CLIENTE)
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $data = Database::getJsonInput();

    if (empty($data['comercio_id']) || empty($data['items']) || empty($data['destino_direccion'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Faltan datos obligatorios del pedido'], 400);
    }

    $stmtStore = $pdo->prepare("SELECT id, activo, abierto_manual FROM comercios WHERE id = :id");
    $stmtStore->execute(['id' => $data['comercio_id']]);
    $store = $stmtStore->fetch();

    if (!$store || !$store['activo'] || !$store['abierto_manual']) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El comercio seleccionado se encuentra cerrado temporalmente'], 400);
    }

    $newId = 'ped-' . strtoupper(substr(uniqid(), -6));
    $codigoSeguimiento = 'VXY-' . rand(100000, 999999);

    $stmtBcv = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv'");
    $tasaRow = $stmtBcv->fetch();
    $tasaBcv = $tasaRow ? (float)$tasaRow['valor'] : 48.50;

    // Regla de despacho: $2.00 USD base hasta 3 km + $0.50 por km adicional
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
            metodo_pago, referencia_pago, comprobante_url, origen_direccion, destino_direccion,
            distancia_km, tiempo_restante_comercio, tiempo_restante_conductor, conductores_rechazaron
        ) VALUES (
            :id, :code, :client, :store, 'solicitud_enviada',
            :sub, :env, :bcv, :tot_usd, :tot_bs,
            :metodo, :ref, :comp, :origen, :destino,
            :dist, 60, 15, '[]'
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

    // Registrar renglones
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
        'mensaje' => 'Pedido registrado exitosamente en Vixy (Tiempo comercio: 60s)',
        'pedido_id' => $newId,
        'codigo_seguimiento' => $codigoSeguimiento,
        'costo_envio_usd' => $costoEnvio,
        'total_usd' => $totalUsd,
        'total_bs' => $totalBs
    ], 201);
}

// -----------------------------------------------------------------------------
// PUT: ACCIONES DE ACEPTACIÓN, RECHAZO Y REASIGNACIÓN
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    $data = Database::getJsonInput();
    $subAction = $action ?: ($data['action'] ?? null);

    // 1. RECHAZAR PEDIDO POR CONDUCTOR -> Salto automático al más cercano
    if ($subAction === 'rechazar_conductor') {
        $conductorId = $data['conductor_id'] ?? null;
        if (!$conductorId) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'conductor_id es requerido'], 400);
        }

        $stmt = $pdo->prepare("SELECT comercio_id, conductores_rechazaron FROM pedidos WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $ped = $stmt->fetch();

        if (!$ped) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no encontrado'], 404);
        }

        $rechazaron = !empty($ped['conductores_rechazaron']) ? json_decode($ped['conductores_rechazaron'], true) : [];
        if (!in_array($conductorId, $rechazaron)) {
            $rechazaron[] = $conductorId;
        }

        // Buscar próximo conductor más cercano
        $proximo = buscarConductorMasCercano($pdo, $ped['comercio_id'], $rechazaron);

        $upd = $pdo->prepare("
            UPDATE pedidos 
            SET conductores_rechazaron = :rech,
                conductor_ofrecido_id = :next_id,
                tiempo_restante_conductor = 15
            WHERE id = :id
        ");
        $upd->execute([
            'rech' => json_encode($rechazaron),
            'next_id' => $proximo ? $proximo['id'] : null,
            'id' => $id
        ]);

        Database::jsonResponse([
            'success' => true,
            'mensaje' => $proximo 
                ? "Servicio rechazado. Asignado a siguiente conductor cercano: {$proximo['nombre']} {$proximo['apellido']} ({$proximo['placa_moto']})"
                : "Servicio rechazado. No hay más conductores disponibles en el radio en este momento.",
            'nuevo_conductor_ofrecido' => $proximo
        ]);
    }

    // 2. ACEPTAR PEDIDO POR CONDUCTOR (dentro de los 15 segundos)
    if ($subAction === 'aceptar_conductor') {
        $conductorId = $data['conductor_id'] ?? null;

        // Validar saldo
        $stmtCond = $pdo->prepare("SELECT disponible, saldo_billetera_usd, bloqueado_por_saldo FROM conductores WHERE id = :cid");
        $stmtCond->execute(['cid' => $conductorId]);
        $cond = $stmtCond->fetch();

        if ($cond && ($cond['saldo_billetera_usd'] < -0.50 || $cond['bloqueado_por_saldo'])) {
            Database::jsonResponse([
                'error' => true,
                'mensaje' => 'No puedes aceptar carreras porque tu saldo es inferior a -$0.50 USD. Recarga tu billetera.'
            ], 403);
        }

        $upd = $pdo->prepare("
            UPDATE pedidos 
            SET conductor_id = :cid,
                conductor_ofrecido_id = NULL,
                estado = 'en_camino_al_comercio'
            WHERE id = :id
        ");
        $upd->execute(['cid' => $conductorId, 'id' => $id]);

        $pdo->prepare("UPDATE conductores SET en_carrera = 1, disponible = 0 WHERE id = :cid")
            ->execute(['cid' => $conductorId]);

        Database::jsonResponse(['success' => true, 'mensaje' => 'Carrera aceptada por el conductor']);
    }

    // 3. ACEPTAR PEDIDO POR COMERCIO (dentro de 60 segundos)
    if ($subAction === 'aceptar_comercio') {
        $stmtPed = $pdo->prepare("SELECT comercio_id FROM pedidos WHERE id = :id");
        $stmtPed->execute(['id' => $id]);
        $ped = $stmtPed->fetch();

        // Buscar conductor más cercano al comercio
        $proximo = buscarConductorMasCercano($pdo, $ped['comercio_id'], []);

        $upd = $pdo->prepare("
            UPDATE pedidos 
            SET estado = 'en_preparacion',
                conductor_ofrecido_id = :drid,
                tiempo_restante_conductor = 15
            WHERE id = :id
        ");
        $upd->execute(['drid' => $proximo ? $proximo['id'] : null, 'id' => $id]);

        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Comanda aceptada por el comercio. Buscando repartidor más cercano.',
            'conductor_notificado' => $proximo
        ]);
    }

    // 4. CAMBIO GENÉRICO DE ESTADO
    $nuevoEstado = $data['estado'] ?? null;
    if ($nuevoEstado) {
        $fields = ["estado = :est"];
        $params = ['est' => $nuevoEstado, 'id' => $id];

        if ($nuevoEstado === 'entregado') {
            $fields[] = "entregado_en = NOW()";
            if (!empty($data['foto_entrega_url'])) {
                $fields[] = "foto_entrega_url = :foto";
                $params['foto'] = $data['foto_entrega_url'];
            }

            // Liberar conductor y sumar ganancias netas
            $stmtEnt = $pdo->prepare("SELECT conductor_id, costo_envio_usd FROM pedidos WHERE id = :id");
            $stmtEnt->execute(['id' => $id]);
            $pData = $stmtEnt->fetch();

            if ($pData && !empty($pData['conductor_id'])) {
                $costoEnvio = (float)$pData['costo_envio_usd'];
                $comision = round($costoEnvio * 0.15, 2);
                $gananciaNeta = round($costoEnvio - $comision, 2);

                $pdo->prepare("
                    UPDATE conductores 
                    SET saldo_billetera_usd = saldo_billetera_usd + :neto,
                        total_carreras = total_carreras + 1,
                        en_carrera = 0,
                        disponible = 1
                    WHERE id = :cid
                ")->execute(['neto' => $gananciaNeta, 'cid' => $pData['conductor_id']]);
            }
        }

        $sql = "UPDATE pedidos SET " . implode(', ', $fields) . " WHERE id = :id";
        $pdo->prepare($sql)->execute($params);

        Database::jsonResponse(['success' => true, 'mensaje' => "Estado actualizado a {$nuevoEstado}"]);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción no permitida'], 405);
