<?php
/**
 * ==============================================================================
 * VIXY DELIVERY PLATFORM - CONTROLADOR PRINCIPAL DE PEDIDOS (PHP 8.0+ / cPanel)
 * ==============================================================================
 * Maneja el ciclo completo del pedido con comisiones dinámicas por antigüedad
 * y sincronización con el trigger contable de la base de datos.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// Helper: Cargar la configuración global del sistema en un arreglo asociativo
function obtenerConfiguracionesSistema($pdo) {
    $stmt = $pdo->query("SELECT clave, valor FROM configuracion_sistema");
    $config = [];
    while ($row = $stmt->fetch()) {
        $config[$row['clave']] = (float)$row['valor'];
    }
    return $config;
}

// Helper: Buscar el conductor libre más cercano al comercio que no haya rechazado
function buscarConductorMasCercano($pdo, $comercioId, $excluidos = []) {
    $stmtC = $pdo->prepare("SELECT latitud, longitud FROM comercios WHERE id = :id LIMIT 1");
    $stmtC->execute(['id' => $comercioId]);
    $com = $stmtC->fetch();
    $lat = $com ? (float)$com['latitud'] : 10.4880;
    $lng = $com ? (float)$com['longitud'] : -66.8533;

    $stmt = $pdo->prepare("
        SELECT id, nombre, apellido, telefono, placa_moto, latitud_actual, longitud_actual, saldo_billetera_usd,
               (6371 * acos(
                   cos(radians(:lat_cos)) * cos(radians(latitud_actual)) * cos(radians(longitud_actual) - radians(:lng)) + 
                   sin(radians(:lat_sin)) * sin(radians(latitud_actual))
               )) AS distancia_km
        FROM conductores
        WHERE disponible = 1 
          AND en_carrera = 0 
          AND bloqueado_por_saldo = 0 
          AND saldo_billetera_usd > -0.50
        ORDER BY distancia_km ASC
    ");
    $stmt->execute(['lat_cos' => $lat, 'lat_sin' => $lat, 'lng' => $lng]);
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
    $pedCols = array_column($pdo->query('SHOW COLUMNS FROM pedidos')->fetchAll(PDO::FETCH_ASSOC), 'Field');
    $hasOferta = in_array('conductor_oferta_id', $pedCols, true);
    $hasOfrecido = in_array('conductor_ofrecido_id', $pedCols, true);

    if ($id) {
        $stmt = $pdo->prepare("
            SELECT p.*, c.nombre as comercio_nombre, c.telefono as comercio_telefono, c.direccion as comercio_direccion,
                   c.latitud as comercio_lat, c.longitud as comercio_lng,
                   d.nombre as conductor_nombre, d.apellido as conductor_apellido, d.telefono as conductor_telefono,
                   d.placa_moto as conductor_placa, d.latitud_actual as conductor_lat, d.longitud_actual as conductor_lng,
                   cl.nombre as cliente_nombre, cl.telefono as cliente_telefono,
                   cl.latitud as cliente_lat, cl.longitud as cliente_lng
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

        $ofrecidoVal = $pedido['conductor_oferta_id'] ?? ($pedido['conductor_ofrecido_id'] ?? null);
        $pedido['conductor_oferta_id'] = $ofrecidoVal;
        $pedido['conductor_ofrecido_id'] = $ofrecidoVal;

        $rechJson = $pedido['conductores_rechazados'] ?? ($pedido['conductores_rechazaron'] ?? '[]');
        $pedido['conductores_rechazaron'] = !empty($rechJson) ? json_decode($rechJson, true) : [];
        $pedido['conductores_rechazados'] = $pedido['conductores_rechazaron'];

        Database::jsonResponse(['success' => true, 'pedido' => $pedido]);
    }

    $comercioId = $_GET['comercio_id'] ?? null;
    $clienteId = $_GET['cliente_id'] ?? null;
    $conductorId = $_GET['conductor_id'] ?? null;
    $conductorOfrecido = $_GET['conductor_ofrecido_id'] ?? ($_GET['conductor_oferta_id'] ?? null);
    $estado = $_GET['estado'] ?? null;

    $sql = "SELECT p.*, c.nombre as comercio_nombre, 
                   CONCAT(d.nombre, ' ', d.apellido) as conductor_nombre,
                   d.telefono as conductor_telefono, d.placa_moto as conductor_placa,
                   cl.nombre as cliente_nombre, cl.telefono as cliente_telefono
            FROM pedidos p 
            LEFT JOIN comercios c ON p.comercio_id = c.id
            LEFT JOIN conductores d ON p.conductor_id = d.id
            LEFT JOIN clientes cl ON p.cliente_id = cl.id
            WHERE 1=1";
    $params = [];

    if ($comercioId) { $sql .= " AND p.comercio_id = :cid"; $params['cid'] = $comercioId; }
    if ($clienteId) { $sql .= " AND p.cliente_id = :clid"; $params['clid'] = $clienteId; }
    if ($conductorId) { $sql .= " AND p.conductor_id = :drid"; $params['drid'] = $conductorId; }
    if ($conductorOfrecido) {
        $ofertaField = $hasOferta ? 'p.conductor_oferta_id' : ($hasOfrecido ? 'p.conductor_ofrecido_id' : 'p.conductor_id');
        $sql .= " AND ({$ofertaField} = :ofrid OR p.conductor_id = :ofrid2)";
        $params['ofrid'] = $conductorOfrecido;
        $params['ofrid2'] = $conductorOfrecido;
    }
    if ($estado) { $sql .= " AND p.estado = :est"; $params['est'] = $estado; }

    $sql .= " ORDER BY p.creado_en DESC LIMIT 100";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $pedidos = $stmt->fetchAll();

    foreach ($pedidos as &$p) {
        $ofrecidoVal = $p['conductor_oferta_id'] ?? ($p['conductor_ofrecido_id'] ?? null);
        $p['conductor_oferta_id'] = $ofrecidoVal;
        $p['conductor_ofrecido_id'] = $ofrecidoVal;
    }
    unset($p);

    Database::jsonResponse(['success' => true, 'pedidos' => $pedidos]);
}

// -----------------------------------------------------------------------------
// POST: CREAR NUEVO PEDIDO (VIXY PEDIDOS / APP CLIENTE)
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $data = Database::getJsonInput();

    if (empty($data['comercio_id']) || empty($data['items']) || empty($data['destino_direccion'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Faltan datos obligatorios del pedido'], 400);
    }

    // Cargar parámetros dinámicos del sistema
    $config = obtenerConfiguracionesSistema($pdo);

    // Consultar comercio y antigüedad en meses desde 'creado_en'
    $stmtStore = $pdo->prepare("
        SELECT id, activo, abierto_manual, 
               TIMESTAMPDIFF(MONTH, creado_en, NOW()) AS meses_antiguedad 
        FROM comercios WHERE id = :id
    ");
    $stmtStore->execute(['id' => $data['comercio_id']]);
    $store = $stmtStore->fetch();

    if (!$store || !$store['activo'] || !$store['abierto_manual']) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El comercio seleccionado se encuentra cerrado temporalmente'], 400);
    }

    $newId = 'ped-' . strtoupper(substr(uniqid(), -6));
    $codigoSeguimiento = 'VXY-' . rand(100000, 999999);

    // Parámetros de tarifas dinámicas
    $tasaBcv = $config['tasa_bcv'] ?? 48.50;
    $kmBase = $config['km_base'] ?? 3.0;
    $tarifaBase = $config['tarifa_base_usd'] ?? 2.00;
    $precioKmAdicional = $config['precio_km_adicional_usd'] ?? 0.50;

    $distanciaKm = (float)($data['distancia_km'] ?? 2.5);
    $excedenteKm = max(0, $distanciaKm - $kmBase);
    $costoEnvio = $tarifaBase + ($excedenteKm * $precioKmAdicional);

    // Regla de comisión dinámicas de Comercio (< 12 meses vs >= 12 meses)
    $mesesComercio = (int)($store['meses_antiguedad'] ?? 0);
    $pctComisionComercio = ($mesesComercio >= 12) 
        ? ($config['comision_comercio_despues_primer_ano'] ?? 3.00)
        : ($config['porcentaje_comision_comercio'] ?? 0.00);

    // Descuento de comisión al subtotal para acreditar el monto neto al comercio
    $subtotalBruto = (float)$data['monto_subtotal_usd'];
    $subtotalNetoComercio = $subtotalBruto * (1 - ($pctComisionComercio / 100));

    $totalUsd = $subtotalBruto + $costoEnvio;
    $totalBs = $totalUsd * $tasaBcv;

    $authUser = AuthMiddleware::getUser();
    $clienteId = $authUser['sub'] ?? $authUser['id'] ?? ($data['cliente_id'] ?? 'cli-001');

    // Parsear o extraer coordenadas GPS exactas para origen y destino
    $destinoLat = isset($data['destino_lat']) ? (float)$data['destino_lat'] : (isset($data['latitud']) ? (float)$data['latitud'] : 0.0);
    $destinoLng = isset($data['destino_lng']) ? (float)$data['destino_lng'] : (isset($data['longitud']) ? (float)$data['longitud'] : 0.0);
    if ($destinoLat == 0.0 && $destinoLng == 0.0 && preg_match('/Lat:\s*([0-9.-]+).*?Lng:\s*([0-9.-]+)/i', (string)($data['destino_direccion'] ?? ''), $mDestGps)) {
        $destinoLat = (float)$mDestGps[1];
        $destinoLng = (float)$mDestGps[2];
    }
    if ($destinoLat == 0.0 && $destinoLng == 0.0 && !empty($clienteId)) {
        try {
            $stmtCliLoc = $pdo->prepare("SELECT latitud, longitud FROM clientes WHERE id = :cid LIMIT 1");
            $stmtCliLoc->execute(['cid' => $clienteId]);
            $cliLoc = $stmtCliLoc->fetch();
            if ($cliLoc) {
                $destinoLat = (float)$cliLoc['latitud'];
                $destinoLng = (float)$cliLoc['longitud'];
            }
        } catch (Throwable $_eCliLoc) {}
    }
    $origenLat = isset($data['origen_lat']) ? (float)$data['origen_lat'] : (isset($store['latitud']) ? (float)$store['latitud'] : 10.4880);
    $origenLng = isset($data['origen_lng']) ? (float)$data['origen_lng'] : (isset($store['longitud']) ? (float)$store['longitud'] : -66.8533);

    $pedCols = array_column($pdo->query('SHOW COLUMNS FROM pedidos')->fetchAll(PDO::FETCH_ASSOC), 'Field');

    $estadoInicial = ($data['metodo_pago'] ?? '') === 'saldo_cartera' ? 'pago_verificado' : 'solicitud_enviada';

    $insertData = [
        'id' => $newId,
        'codigo_seguimiento' => $codigoSeguimiento,
        'cliente_id' => $clienteId,
        'comercio_id' => $data['comercio_id'],
        'estado' => $estadoInicial,
        'monto_subtotal_usd' => $subtotalNetoComercio,
        'costo_envio_usd' => $costoEnvio,
        'tasa_bcv_bs' => $tasaBcv,
        'monto_total_usd' => $totalUsd,
        'monto_total_bs' => $totalBs,
        'metodo_pago' => $data['metodo_pago'] ?? 'pago_movil',
        'referencia_pago' => $data['referencia_pago'] ?? null,
        'comprobante_url' => $data['comprobante_url'] ?? null,
        'origen_direccion' => $data['origen_direccion'] ?? ($store['direccion'] ?? 'Comercio Aliado'),
        'destino_direccion' => $data['destino_direccion'],
        'distancia_km' => $distanciaKm
    ];

    if (in_array('costo_producto_usd', $pedCols, true)) $insertData['costo_producto_usd'] = $subtotalBruto;
    if (in_array('costo_delivery_usd', $pedCols, true)) $insertData['costo_delivery_usd'] = $costoEnvio;
    if (in_array('ganancia_conductor_usd', $pedCols, true)) $insertData['ganancia_conductor_usd'] = round($costoEnvio * 0.85, 2);
    if (in_array('ganancia_app_usd', $pedCols, true)) $insertData['ganancia_app_usd'] = round($costoEnvio * 0.15, 2);
    if (in_array('origen_lat', $pedCols, true)) $insertData['origen_lat'] = $origenLat;
    if (in_array('origen_lng', $pedCols, true)) $insertData['origen_lng'] = $origenLng;
    if (in_array('destino_lat', $pedCols, true)) $insertData['destino_lat'] = ($destinoLat != 0.0) ? $destinoLat : 10.4806;
    if (in_array('destino_lng', $pedCols, true)) $insertData['destino_lng'] = ($destinoLng != 0.0) ? $destinoLng : -66.9036;
    if (in_array('segundos_restantes_oferta', $pedCols, true)) $insertData['segundos_restantes_oferta'] = 15;
    if (in_array('tiempo_restante_comercio', $pedCols, true)) $insertData['tiempo_restante_comercio'] = 60;
    if (in_array('tiempo_restante_conductor', $pedCols, true)) $insertData['tiempo_restante_conductor'] = 15;
    if (in_array('conductores_rechazados', $pedCols, true)) $insertData['conductores_rechazados'] = '[]';
    if (in_array('conductores_rechazaron', $pedCols, true)) $insertData['conductores_rechazaron'] = '[]';
    if (in_array('estado_despacho', $pedCols, true)) $insertData['estado_despacho'] = 'buscando_conductor';

    $colList = array_keys($insertData);
    $ins = $pdo->prepare("INSERT INTO pedidos (`" . implode('`, `', $colList) . "`) VALUES (:" . implode(', :', $colList) . ")");
    $ins->execute($insertData);

    // Registrar renglones con soporte a columnas extendidas
    $detailColumns = array_column($pdo->query('SHOW COLUMNS FROM detalles_pedido')->fetchAll(), 'Field');
    $insertColumns = ['id', 'pedido_id', 'producto_id', 'nombre_producto', 'cantidad', 'precio_unitario_usd', 'subtotal_usd'];
    foreach (['opciones_seleccionadas_json', 'unidad_venta', 'cantidad_decimal', 'notas_item', 'precio_adicional_usd'] as $optionalColumn) {
        if (in_array($optionalColumn, $detailColumns, true)) $insertColumns[] = $optionalColumn;
    }
    $stmtItem = $pdo->prepare(
        'INSERT INTO detalles_pedido (`' . implode('`, `', $insertColumns) . '`) VALUES (' . implode(', ', array_fill(0, count($insertColumns), '?')) . ')'
    );

    foreach ($data['items'] as $it) {
        $itemValues = [
            'det-' . uniqid(),
            $newId,
            $it['producto_id'] ?? 'prod-custom',
            $it['nombre'] ?? $it['nombre_producto'] ?? 'Producto',
            $it['cantidad'] ?? 1,
            $it['precio_unitario_usd'] ?? $it['precio_usd'] ?? 0,
            ($it['cantidad'] ?? 1) * ($it['precio_unitario_usd'] ?? $it['precio_usd'] ?? 0)
        ];
        $optionalValues = [
            'opciones_seleccionadas_json' => isset($it['opciones_seleccionadas']) ? json_encode($it['opciones_seleccionadas'], JSON_UNESCAPED_UNICODE) : null,
            'unidad_venta' => $it['unidad_venta'] ?? 'unidad',
            'cantidad_decimal' => $it['cantidad_decimal'] ?? ($it['cantidad'] ?? 1),
            'notas_item' => $it['notas'] ?? null,
            'precio_adicional_usd' => $it['precio_adicional_usd'] ?? 0
        ];
        foreach (array_slice($insertColumns, 7) as $optionalColumn) $itemValues[] = $optionalValues[$optionalColumn];
        $stmtItem->execute($itemValues);
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

    $pedCols = array_column($pdo->query('SHOW COLUMNS FROM pedidos')->fetchAll(PDO::FETCH_ASSOC), 'Field');
    $hasOferta = in_array('conductor_oferta_id', $pedCols, true);
    $hasOfrecido = in_array('conductor_ofrecido_id', $pedCols, true);
    $hasRechazados = in_array('conductores_rechazados', $pedCols, true);
    $hasRechazaron = in_array('conductores_rechazaron', $pedCols, true);

    if (($data['estado'] ?? null) === 'cancelado') {
        $authUser = AuthMiddleware::getUser();
        $clienteId = $authUser['sub'] ?? $authUser['id'] ?? ($data['cliente_id'] ?? null);
        $stmtCheck = $pdo->prepare("SELECT estado, cliente_id FROM pedidos WHERE id = :id LIMIT 1");
        $stmtCheck->execute(['id' => $id]);
        $pedido = $stmtCheck->fetch();
        if (!$pedido || ($clienteId && $pedido['cliente_id'] !== $clienteId && !in_array(($authUser['role'] ?? ''), ['admin', 'super_admin']))) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no encontrado o sin permisos para cancelarlo'], 404);
        }
        if (!in_array($pedido['estado'], ['solicitud_enviada', 'pendiente_pago', 'pago_verificado', 'en_preparacion'], true)) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'El pedido ya no puede cancelarse en este estado'], 409);
        }
        $stmtCancel = $pdo->prepare("UPDATE pedidos SET estado = 'cancelado' WHERE id = :id");
        $stmtCancel->execute(['id' => $id]);
        Database::jsonResponse(['success' => true, 'mensaje' => 'Pedido cancelado correctamente']);
    }

    // 1. RECHAZAR PEDIDO POR CONDUCTOR -> Salto automático al más cercano
    if ($subAction === 'rechazar_conductor') {
        $authUser = AuthMiddleware::getUser();
        $conductorId = $data['conductor_id'] ?? ($authUser['sub'] ?? ($authUser['id'] ?? null));
        if (!$conductorId) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'conductor_id es requerido'], 400);
        }

        $stmt = $pdo->prepare("SELECT comercio_id, " . ($hasRechazados ? "conductores_rechazados" : "conductores_rechazaron") . " AS rech FROM pedidos WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $ped = $stmt->fetch();

        if (!$ped) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no encontrado'], 404);
        }

        $rechazaron = !empty($ped['rech']) ? json_decode($ped['rech'], true) : [];
        if (!in_array($conductorId, $rechazaron)) {
            $rechazaron[] = $conductorId;
        }

        $proximo = buscarConductorMasCercano($pdo, $ped['comercio_id'], $rechazaron);

        $updFields = [];
        $updParams = ['rech' => json_encode($rechazaron), 'next_id' => $proximo ? $proximo['id'] : null, 'id' => $id];
        if ($hasRechazados) $updFields[] = 'conductores_rechazados = :rech';
        if ($hasRechazaron) $updFields[] = 'conductores_rechazaron = :rech';
        if ($hasOferta) $updFields[] = 'conductor_oferta_id = :next_id';
        if ($hasOfrecido) $updFields[] = 'conductor_ofrecido_id = :next_id';
        if (in_array('segundos_restantes_oferta', $pedCols, true)) $updFields[] = 'segundos_restantes_oferta = 15';
        if (in_array('tiempo_restante_conductor', $pedCols, true)) $updFields[] = 'tiempo_restante_conductor = 15';

        $pdo->prepare("UPDATE pedidos SET " . implode(', ', $updFields) . " WHERE id = :id")->execute($updParams);

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
        $authUser = AuthMiddleware::getUser();
        $conductorId = $data['conductor_id'] ?? ($authUser['sub'] ?? ($authUser['id'] ?? null));

        $config = obtenerConfiguracionesSistema($pdo);

        $stmtCond = $pdo->prepare("
            SELECT disponible, saldo_billetera_usd, bloqueado_por_saldo,
                   TIMESTAMPDIFF(MONTH, creado_en, NOW()) AS meses_antiguedad 
            FROM conductores 
            WHERE id = :cid
        ");
        $stmtCond->execute(['cid' => $conductorId]);
        $cond = $stmtCond->fetch();

        if ($cond && ($cond['saldo_billetera_usd'] <= -0.50 || $cond['bloqueado_por_saldo'])) {
            $pdo->prepare("UPDATE conductores SET bloqueado_por_saldo = 1, disponible = 0 WHERE id = :cid")->execute(['cid' => $conductorId]);
            Database::jsonResponse([
                'error' => true,
                'bloqueado' => true,
                'mensaje' => 'No puedes aceptar carreras: Tu cuenta está bloqueada automáticamente por saldo deudor (límite: -$0.50 USD). Recarga tu billetera.'
            ], 403);
        }

        $stmtPed = $pdo->prepare("SELECT costo_envio_usd FROM pedidos WHERE id = :id");
        $stmtPed->execute(['id' => $id]);
        $pedInfo = $stmtPed->fetch();
        $costoEnvio = $pedInfo ? (float)$pedInfo['costo_envio_usd'] : 0.00;

        $mesesCond = (int)($cond['meses_antiguedad'] ?? 0);
        $pctComisionConductor = ($mesesCond >= 3) 
            ? ($config['comision_conductor_despues_3_meses'] ?? 10.00)
            : ($config['porcentaje_comision_delivery'] ?? 5.00);

        $gananciaConductor = $costoEnvio * (1 - ($pctComisionConductor / 100));

        $updFields = [
            'conductor_id = :cid',
            'ganancia_conductor_usd = :ganancia',
            'estado = :est'
        ];
        $updParams = [
            'cid' => $conductorId,
            'ganancia' => $gananciaConductor,
            'est' => 'en_camino_al_cliente',
            'id' => $id
        ];
        if ($hasOferta) $updFields[] = 'conductor_oferta_id = NULL';
        if ($hasOfrecido) $updFields[] = 'conductor_ofrecido_id = NULL';
        if (in_array('estado_despacho', $pedCols, true)) $updFields[] = "estado_despacho = 'aceptado'";

        $pdo->prepare("UPDATE pedidos SET " . implode(', ', $updFields) . " WHERE id = :id")->execute($updParams);

        $pdo->prepare("UPDATE conductores SET en_carrera = 1, disponible = 0 WHERE id = :cid")
            ->execute(['cid' => $conductorId]);

        Database::jsonResponse(['success' => true, 'mensaje' => 'Carrera aceptada por el conductor']);
    }

    // 3. ACEPTAR PEDIDO POR COMERCIO (dentro de los 60 segundos)
    if ($subAction === 'aceptar_comercio') {
        $stmtPed = $pdo->prepare("SELECT comercio_id FROM pedidos WHERE id = :id");
        $stmtPed->execute(['id' => $id]);
        $ped = $stmtPed->fetch();

        $proximo = buscarConductorMasCercano($pdo, $ped['comercio_id'], []);

        $updFields = ['estado = :est'];
        $updParams = ['est' => 'en_preparacion', 'drid' => $proximo ? $proximo['id'] : null, 'id' => $id];
        if ($hasOferta) $updFields[] = 'conductor_oferta_id = :drid';
        if ($hasOfrecido) $updFields[] = 'conductor_ofrecido_id = :drid';
        if (in_array('segundos_restantes_oferta', $pedCols, true)) $updFields[] = 'segundos_restantes_oferta = 15';
        if (in_array('tiempo_restante_conductor', $pedCols, true)) $updFields[] = 'tiempo_restante_conductor = 15';
        if (in_array('estado_despacho', $pedCols, true)) $updFields[] = "estado_despacho = 'ofrecido_a_conductor'";

        $pdo->prepare("UPDATE pedidos SET " . implode(', ', $updFields) . " WHERE id = :id")->execute($updParams);

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
            if (in_array('estado_despacho', $pedCols, true)) {
                $fields[] = "estado_despacho = 'completado'";
            }
            if (!empty($data['foto_entrega_url']) && in_array('foto_entrega_url', $pedCols, true)) {
                $fields[] = "foto_entrega_url = :foto";
                $params['foto'] = $data['foto_entrega_url'];
            }

            // Liberar disponibilidad del repartidor y asegurar cierre de carrera
            $stmtEnt = $pdo->prepare("SELECT conductor_id, costo_envio_usd, ganancia_conductor_usd FROM pedidos WHERE id = :id");
            $stmtEnt->execute(['id' => $id]);
            $pData = $stmtEnt->fetch();

            if ($pData && !empty($pData['conductor_id'])) {
                $costoEnvio = (float)$pData['costo_envio_usd'];
                $gananciaNeta = isset($pData['ganancia_conductor_usd']) && (float)$pData['ganancia_conductor_usd'] > 0
                    ? (float)$pData['ganancia_conductor_usd']
                    : round($costoEnvio * 0.85, 2);

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