<?php
/**
 * Vixy Delivery Platform - API de Despacho Inteligente y Asignación con Temporizador de 15 Segundos
 * Gestiona la búsqueda por cercanía GPS, oferta de 15s, aceptación, rechazo inmediato,
 * reasignación automática al expirar y desvinculación por indisponibilidad de motorizado.
 * Compatible con cPanel, MySQL / MariaDB y phpMyAdmin.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

/**
 * Cálculo de distancia geodésica mediante fórmula Haversine (en kilómetros)
 */
function calcularDistanciaHaversine($lat1, $lon1, $lat2, $lon2) {
    $radioTierraKm = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) * sin($dLon / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return round($radioTierraKm * $c, 2);
}

/**
 * Función central: Buscar y ofertar al conductor disponible más cercano
 */
function asignarSiguienteConductorCercano($pdo, $pedidoId) {
    // 1. Obtener datos de origen del pedido y comercio
    $stmtPed = $pdo->prepare("
        SELECT p.id, p.codigo_seguimiento, p.comercio_id, p.origen_lat, p.origen_lng,
               p.conductores_rechazados, p.costo_delivery_usd, p.ganancia_conductor_usd,
               c.latitud AS com_lat, c.longitud AS com_lng, c.nombre AS comercio_nombre
        FROM pedidos p
        LEFT JOIN comercios c ON p.comercio_id = c.id
        WHERE p.id = :id LIMIT 1
    ");
    $stmtPed->execute(['id' => $pedidoId]);
    $ped = $stmtPed->fetch();

    if (!$ped) {
        return ['error' => true, 'mensaje' => 'Pedido no encontrado'];
    }

    $origenLat = !empty($ped['origen_lat']) ? (float)$ped['origen_lat'] : (float)$ped['com_lat'];
    $origenLng = !empty($ped['origen_lng']) ? (float)$ped['origen_lng'] : (float)$ped['com_lng'];

    // Decodificar conductores que ya rechazaron o dejaron expirar la solicitud
    $rechazados = [];
    if (!empty($ped['conductores_rechazados'])) {
        $decoded = json_decode($ped['conductores_rechazados'], true);
        $rechazados = is_array($decoded) ? $decoded : explode(',', $ped['conductores_rechazados']);
    }

    // 2. Obtener conductores disponibles, conectados y con saldo operativo (saldo >= -$0.50)
    $stmtCond = $pdo->query("
        SELECT id, nombre, apellido, telefono, latitud_actual, longitud_actual, 
               saldo_billetera_usd, placa_moto, marca_moto, rating
        FROM conductores 
        WHERE disponible = 1 
          AND bloqueado_por_saldo = 0 
          AND en_carrera = 0
    ");
    $conductoresLibres = $stmtCond->fetchAll();

    // 3. Filtrar conductores excluidos y calcular distancia
    $candidatos = [];
    foreach ($conductoresLibres as $cond) {
        if (in_array($cond['id'], $rechazados)) {
            continue; // Ya rechazó o expiró este pedido
        }

        $condLat = (float)$cond['latitud_actual'];
        $condLng = (float)$cond['longitud_actual'];

        // Sin GPS real (NULL/0): no se inventa Caracas; ese conductor no puede
        // calcularse distancia real y se excluye del despacho por radar.
        if ($condLat == 0 && $condLng == 0) {
            continue;
        }

        $distanciaKm = calcularDistanciaHaversine($origenLat, $origenLng, $condLat, $condLng);

        $candidatos[] = [
            'id' => $cond['id'],
            'nombre' => $cond['nombre'] . ' ' . $cond['apellido'],
            'telefono' => $cond['telefono'],
            'placa' => $cond['placa_moto'],
            'distancia_km' => $distanciaKm,
            'rating' => $cond['rating']
        ];
    }

    // Ordenar candidatos por menor distancia al punto de origen (más cercano primero)
    usort($candidatos, function($a, $b) {
        return $a['distancia_km'] <=> $b['distancia_km'];
    });

    if (empty($candidatos)) {
        // No hay conductores disponibles cercanos en este momento
        $updSin = $pdo->prepare("
            UPDATE pedidos 
            SET estado_despacho = 'sin_conductores_disponibles',
                conductor_oferta_id = NULL,
                segundos_restantes_oferta = 0
            WHERE id = :id
        ");
        $updSin->execute(['id' => $pedidoId]);

        return [
            'success' => false,
            'sin_conductores' => true,
            'mensaje' => 'No hay más conductores disponibles en el radio de entrega en este momento.'
        ];
    }

    // 4. Asignar la oferta de 15 segundos al conductor más cercano
    $primerCandidato = $candidatos[0];
    $upd = $pdo->prepare("
        UPDATE pedidos 
        SET conductor_oferta_id = :drid,
            tiempo_inicio_oferta = NOW(),
            tiempo_limite_oferta = DATE_ADD(NOW(), INTERVAL 15 SECOND),
            segundos_restantes_oferta = 15,
            estado_despacho = 'ofrecido_a_conductor'
        WHERE id = :id
    ");
    $upd->execute([
        'drid' => $primerCandidato['id'],
        'id' => $pedidoId
    ]);

    return [
        'success' => true,
        'mensaje' => "Solicitud ofertada al conductor más cercano: {$primerCandidato['nombre']} ({$primerCandidato['distancia_km']} km)",
        'conductor_oferta' => $primerCandidato,
        'segundos_limite' => 15,
        'candidatos_restantes' => count($candidatos) - 1
    ];
}

// =============================================================================
// ROUTER DE ACCIONES DEL MOTOR DE DESPACHO
// =============================================================================

// 1. POST: SOLICITAR OFERTA A CONDUCTOR CERCANO
if ($method === 'POST' && $action === 'ofertar_cercano') {
    $data = Database::getJsonInput();
    $pedidoId = $data['pedido_id'] ?? null;

    if (!$pedidoId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Falta pedido_id'], 400);
    }

    $res = asignarSiguienteConductorCercano($pdo, $pedidoId);
    Database::jsonResponse($res, $res['success'] ? 200 : 404);
}

// 2. POST: CONDUCTOR ACEPTA EL VIAJE DENTRO DE LOS 15 SEGUNDOS
if ($method === 'POST' && $action === 'aceptar') {
    $data = Database::getJsonInput();
    $pedidoId = $data['pedido_id'] ?? null;
    $conductorId = $data['conductor_id'] ?? null;

    if (!$pedidoId || !$conductorId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Falta pedido_id o conductor_id'], 400);
    }

    // Verificar si la oferta sigue vigente para este conductor
    $stmtCheck = $pdo->prepare("
        SELECT id, conductor_oferta_id, tiempo_limite_oferta, estado_despacho, costo_delivery_usd
        FROM pedidos 
        WHERE id = :id LIMIT 1
    ");
    $stmtCheck->execute(['id' => $pedidoId]);
    $ped = $stmtCheck->fetch();

    if (!$ped) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no encontrado'], 404);
    }

    // Verificar si la oferta correspondía a este conductor
    if ($ped['conductor_oferta_id'] !== $conductorId) {
        Database::jsonResponse([
            'error' => true,
            'expirado' => true,
            'mensaje' => 'La solicitud expiró o ya fue reasignada a otro conductor.'
        ], 409);
    }

    // Confirmar asignación definitiva
    $updAcept = $pdo->prepare("
        UPDATE pedidos 
        SET conductor_id = :cid,
            conductor_oferta_id = NULL,
            estado_despacho = 'aceptado',
            estado = 'en_camino_al_cliente',
            segundos_restantes_oferta = 0
        WHERE id = :id
    ");
    $updAcept->execute(['cid' => $conductorId, 'id' => $pedidoId]);

    // Marcar conductor como en carrera
    $pdo->prepare("UPDATE conductores SET en_carrera = 1, disponible = 0 WHERE id = :cid")->execute(['cid' => $conductorId]);

    Database::jsonResponse([
        'success' => true,
        'mensaje' => '¡Viaje aceptado exitosamente! Dirígete al comercio para el retiro.',
        'pedido_id' => $pedidoId
    ]);
}

// 3. POST: CONDUCTOR RECHAZA EL VIAJE -> DESAPARECE DE SU PANTALLA Y BUSCA AL SIGUIENTE CERCANO
if ($method === 'POST' && $action === 'rechazar') {
    $data = Database::getJsonInput();
    $pedidoId = $data['pedido_id'] ?? null;
    $conductorId = $data['conductor_id'] ?? null;
    $motivo = $data['motivo'] ?? 'Rechazado por conductor';

    if (!$pedidoId || !$conductorId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Falta pedido_id o conductor_id'], 400);
    }

    // Obtener lista actual de rechazados
    $stmt = $pdo->prepare("SELECT conductores_rechazados FROM pedidos WHERE id = :id");
    $stmt->execute(['id' => $pedidoId]);
    $ped = $stmt->fetch();

    $rechazados = [];
    if (!empty($ped['conductores_rechazados'])) {
        $decoded = json_decode($ped['conductores_rechazados'], true);
        $rechazados = is_array($decoded) ? $decoded : explode(',', $ped['conductores_rechazados']);
    }

    if (!in_array($conductorId, $rechazados)) {
        $rechazados[] = $conductorId;
    }

    // Actualizar lista negra temporal y remover de la pantalla del conductor
    $updRech = $pdo->prepare("
        UPDATE pedidos 
        SET conductores_rechazados = :rech,
            conductor_oferta_id = NULL,
            segundos_restantes_oferta = 0
        WHERE id = :id
    ");
    $updRech->execute([
        'rech' => json_encode(array_values($rechazados)),
        'id' => $pedidoId
    ]);

    // Reasignar de inmediato al siguiente conductor más cercano disponible
    $siguienteRes = asignarSiguienteConductorCercano($pdo, $pedidoId);

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Viaje rechazado. La solicitud desaparece de tu pantalla y busca al siguiente conductor más cercano.',
        'reasignacion' => $siguienteRes
    ]);
}

// 4. GET: VERIFICAR TIMEOUT DE 15 SEGUNDOS (CRON O POLLING)
if ($method === 'GET' && $action === 'verificar_timeout') {
    // Buscar pedidos cuya oferta activa haya sobrepasado los 15 segundos
    $stmtExpirados = $pdo->query("
        SELECT id, conductor_oferta_id, conductores_rechazados 
        FROM pedidos 
        WHERE estado_despacho = 'ofrecido_a_conductor' 
          AND tiempo_limite_oferta IS NOT NULL 
          AND NOW() > tiempo_limite_oferta
    ");
    $expirados = $stmtExpirados->fetchAll();
    $reasignados = [];

    foreach ($expirados as $exp) {
        $rech = [];
        if (!empty($exp['conductores_rechazados'])) {
            $dec = json_decode($exp['conductores_rechazados'], true);
            $rech = is_array($dec) ? $dec : explode(',', $exp['conductores_rechazados']);
        }
        if (!empty($exp['conductor_oferta_id']) && !in_array($exp['conductor_oferta_id'], $rech)) {
            $rech[] = $exp['conductor_oferta_id'];
        }

        // Marcar expirado y rotar al siguiente conductor cercano
        $pdo->prepare("UPDATE pedidos SET conductores_rechazados = :r WHERE id = :id")->execute([
            'r' => json_encode(array_values($rech)),
            'id' => $exp['id']
        ]);

        $res = asignarSiguienteConductorCercano($pdo, $exp['id']);
        $reasignados[] = [
            'pedido_id' => $exp['id'],
            'conductor_previo_expirado' => $exp['conductor_oferta_id'],
            'resultado_siguiente' => $res
        ];
    }

    Database::jsonResponse([
        'success' => true,
        'total_expirados' => count($expirados),
        'reasignaciones' => $reasignados
    ]);
}

// 5. POST: DETECCIÓN DE INDISPONIBILIDAD DE CONDUCTOR ASIGNADO
if ($method === 'POST' && $action === 'verificar_disponibilidad') {
    $data = Database::getJsonInput();
    $conductorId = $data['conductor_id'] ?? null;

    if (!$conductorId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Falta conductor_id'], 400);
    }

    // Verificar si el conductor está marcado como no disponible
    $stmtCond = $pdo->prepare("SELECT disponible FROM conductores WHERE id = :cid");
    $stmtCond->execute(['cid' => $conductorId]);
    $cond = $stmtCond->fetch();

    if ($cond && !$cond['disponible']) {
        // Buscar pedidos asignados o en oferta con este conductor que aún no hayan sido entregados
        $stmtPeds = $pdo->prepare("
            SELECT id FROM pedidos 
            WHERE (conductor_id = :cid OR conductor_oferta_id = :cid2)
              AND estado NOT IN ('entregado', 'cerrado_calificado', 'cancelado')
        ");
        $stmtPeds->execute(['cid' => $conductorId, 'cid2' => $conductorId]);
        $pedidosAfectados = $stmtPeds->fetchAll();

        $liberados = [];
        foreach ($pedidosAfectados as $p) {
            $pdo->prepare("
                UPDATE pedidos 
                SET conductor_id = NULL,
                    conductor_oferta_id = NULL,
                    estado = 'esperando_repartidor',
                    estado_despacho = 'buscando_conductor'
                WHERE id = :pid
            ")->execute(['pid' => $p['id']]);

            // Reasignar inmediatamente al conductor disponible más cercano
            $re = asignarSiguienteConductorCercano($pdo, $p['id']);
            $liberados[] = ['pedido_id' => $p['id'], 'reasignacion' => $re];
        }

        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Conductor no disponible detectado. Pedidos desvinculados y reasignados a conductores cercanos.',
            'pedidos_reasignados' => $liberados
        ]);
    }

    Database::jsonResponse(['success' => true, 'mensaje' => 'Conductor sigue disponible']);
}

// 6. GET: CONSULTAR OFERTA ACTIVA PARA UN CONDUCTOR (INCLUYE SEGUNDOS RESTANTES)
if ($method === 'GET' && $action === 'oferta_activa') {
    $conductorId = $_GET['conductor_id'] ?? null;

    if (!$conductorId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Falta conductor_id'], 400);
    }

    $stmt = $pdo->prepare("
        SELECT p.id, p.codigo_seguimiento, p.monto_total_usd, p.costo_producto_usd, 
               p.costo_delivery_usd, p.ganancia_conductor_usd, p.ganancia_app_usd,
               p.origen_direccion, p.destino_direccion, p.distancia_km,
               c.nombre AS comercio_nombre, c.latitud AS com_lat, c.longitud AS com_lng,
               GREATEST(0, 15 - TIMESTAMPDIFF(SECOND, p.tiempo_inicio_oferta, NOW())) AS segundos_restantes
        FROM pedidos p
        LEFT JOIN comercios c ON p.comercio_id = c.id
        WHERE p.conductor_oferta_id = :cid
          AND p.estado_despacho = 'ofrecido_a_conductor'
          AND p.tiempo_limite_oferta > NOW()
        LIMIT 1
    ");
    $stmt->execute(['cid' => $conductorId]);
    $oferta = $stmt->fetch();

    if (!$oferta) {
        Database::jsonResponse(['success' => true, 'tiene_oferta' => false]);
    }

    $oferta['segundos_restantes'] = (int)$oferta['segundos_restantes'];
    $oferta['costo_producto_usd'] = (float)$oferta['costo_producto_usd'];
    $oferta['costo_delivery_usd'] = (float)$oferta['costo_delivery_usd'];
    $oferta['ganancia_conductor_usd'] = (float)$oferta['ganancia_conductor_usd'];
    $oferta['ganancia_app_usd'] = (float)$oferta['ganancia_app_usd'];

    Database::jsonResponse([
        'success' => true,
        'tiene_oferta' => true,
        'oferta' => $oferta
    ]);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción no válida en despacho.php'], 400);
