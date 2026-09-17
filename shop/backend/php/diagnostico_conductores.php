<?php
/**
 * DIAGNÓSTICO COMPLETO DE CONDUCTORES Y BASES DE DATOS - VIXY
 * Acceder en: https://www.vixy.uno/api/diagnostico_conductores.php
 */

require_once __DIR__ . '/config/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$reporte = [
    'timestamp' => date('Y-m-d H:i:s'),
    'vixy_dl' => [],
    'regist' => [],
    'vixy_st' => [],
    'unificado_admin_panel' => [],
    'radar_en_linea' => []
];

// 1. BASE DE DATOS DELIVERY (c2861522_vixy_dl)
try {
    $pdoDl = Database::getConnection();
    $colsDl = $pdoDl->query('SHOW COLUMNS FROM conductores')->fetchAll(PDO::FETCH_ASSOC);
    $reporte['vixy_dl']['conexion'] = 'OK';
    $reporte['vixy_dl']['mysql_now'] = $pdoDl->query('SELECT NOW()')->fetchColumn();
    $reporte['vixy_dl']['total'] = (int)$pdoDl->query('SELECT COUNT(*) FROM conductores')->fetchColumn();
    $reporte['vixy_dl']['muestra'] = $pdoDl->query("
        SELECT id, nombre, apellido, cedula, disponible, en_carrera, saldo_billetera_usd, 
               bloqueado_por_saldo, status, verificado_por_admin, latitud_actual, longitud_actual, 
               ultima_actualizacion,
               TIMESTAMPDIFF(SECOND, ultima_actualizacion, NOW()) AS seg_inactivo
        FROM conductores
    ")->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    $reporte['vixy_dl']['error'] = $e->getMessage();
}

// 2. BASE DE DATOS REGISTRO (c2861522_regist)
try {
    $pdoReg = Database::getRegistConnection();
    if ($pdoReg) {
        $colsReg = $pdoReg->query('SHOW COLUMNS FROM conductores')->fetchAll(PDO::FETCH_ASSOC);
        $reporte['regist']['conexion'] = 'OK';
        $reporte['regist']['columnas'] = array_column($colsReg, 'Field');
        $reporte['regist']['total'] = (int)$pdoReg->query('SELECT COUNT(*) FROM conductores')->fetchColumn();
        $reporte['regist']['muestra'] = $pdoReg->query('SELECT * FROM conductores LIMIT 15')->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $reporte['regist']['error'] = 'No se pudo obtener conexion a c2861522_regist';
    }
} catch (Throwable $e) {
    $reporte['regist']['error'] = $e->getMessage();
}

// 3. BASE DE DATOS TIENDA (c2861522_vixy_st)
try {
    $pdoSt = Database::getStoreConnection();
    if ($pdoSt) {
        $tables = $pdoSt->query("SHOW TABLES LIKE 'conductores'")->fetchAll();
        $reporte['vixy_st']['conexion'] = 'OK';
        $reporte['vixy_st']['tiene_tabla_conductores'] = !empty($tables);
        if (!empty($tables)) {
            $reporte['vixy_st']['total'] = (int)$pdoSt->query('SELECT COUNT(*) FROM conductores')->fetchColumn();
        }
    }
} catch (Throwable $e) {
    $reporte['vixy_st']['error'] = $e->getMessage();
}

// 3.5. DIAGNÓSTICO DE TABLA CLIENTES (Vixy Pedidos)
try {
    if (isset($pdoDl)) {
        $reporte['clientes'] = [];
        $colsCli = $pdoDl->query("SHOW COLUMNS FROM clientes")->fetchAll(PDO::FETCH_ASSOC);
        $reporte['clientes']['columnas'] = array_column($colsCli, 'Field');
        $reporte['clientes']['total'] = (int)$pdoDl->query("SELECT COUNT(*) FROM clientes")->fetchColumn();
        $reporte['clientes']['muestra'] = $pdoDl->query("SELECT id, nombre, apellido, cedula, email, telefono, activo, COALESCE(saldo_billetera_usd, saldo_cartera_usd, 0.00) as saldo FROM clientes LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
    }
} catch (Throwable $eCli) {
    $reporte['clientes']['error'] = $eCli->getMessage();
}

// 4. TEST DEL ENDPOINT CONDUCTORES UNIFICADO
try {
    $mapa = [];

    // vixy_dl
    if (!empty($reporte['vixy_dl']['muestra'])) {
        foreach ($reporte['vixy_dl']['muestra'] as $d) {
            $id = $d['id'] ?? $d['codigo_conductor'] ?? '';
            $ced = preg_replace('/[^0-9]/', '', $d['cedula'] ?? '');
            $key = $ced ?: $id;
            $mapa[$key] = [
                'origen' => 'vixy_dl',
                'id' => $id,
                'nombre' => trim(($d['nombre'] ?? '') . ' ' . ($d['apellido'] ?? '')),
                'cedula' => $d['cedula'] ?? '',
                'disponible' => (bool)($d['disponible'] ?? false),
                'en_carrera' => (bool)($d['en_carrera'] ?? false),
                'saldo' => (float)($d['saldo_billetera_usd'] ?? 0),
                'lat' => $d['latitud_actual'] ?? null,
                'lng' => $d['longitud_actual'] ?? null,
                'verificado_por_admin' => $d['verificado_por_admin'] ?? null,
                'estado_registro' => $d['estado_registro'] ?? ($d['status'] ?? null)
            ];
        }
    }

    // regist
    if (!empty($reporte['regist']['muestra'])) {
        foreach ($reporte['regist']['muestra'] as $r) {
            $id = $r['codigo_conductor'] ?? $r['id'] ?? '';
            $ced = preg_replace('/[^0-9]/', '', $r['cedula'] ?? '');
            $key = $ced ?: $id;
            if (!isset($mapa[$key])) {
                $mapa[$key] = [
                    'origen' => 'regist',
                    'id' => $id,
                    'nombre' => trim(($r['nombre'] ?? '') . ' ' . ($r['apellido'] ?? '')),
                    'cedula' => $r['cedula'] ?? '',
                    'disponible' => ($r['status'] ?? '') === 'aprobado',
                    'en_carrera' => false,
                    'saldo' => (float)($r['saldo_billetera_usd'] ?? 0),
                    'lat' => $r['latitud_actual'] ?? null,
                    'lng' => $r['longitud_actual'] ?? null,
                    'verificado_por_admin' => ($r['status'] ?? '') === 'aprobado' ? 1 : 0,
                    'estado_registro' => $r['status'] ?? 'pendiente'
                ];
            }
        }
    }

    $reporte['unificado_admin_panel']['total_conductores_encontrados'] = count($mapa);
    $reporte['unificado_admin_panel']['conductores'] = array_values($mapa);

    // Conductores aptos para radar (en línea y con coordenadas válidas)
    $radar = [];
    foreach ($mapa as $c) {
        $enLinea = $c['disponible'] || $c['en_carrera'];
        $lat = (float)($c['lat'] ?? 0);
        $lng = (float)($c['lng'] ?? 0);
        $tieneGps = ($lat != 0.0 && $lng != 0.0);
        if ($enLinea) {
            $radar[] = [
                'id' => $c['id'],
                'nombre' => $c['nombre'],
                'en_linea' => true,
                'tiene_gps' => $tieneGps,
                'lat' => $lat,
                'lng' => $lng,
                'visible_en_radar' => $tieneGps
            ];
        }
    }
    $reporte['radar_en_linea'] = [
        'total_en_linea' => count($radar),
        'conductores' => $radar
    ];

} catch (Throwable $e) {
    $reporte['unificado_admin_panel']['error'] = $e->getMessage();
}

echo json_encode($reporte, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
