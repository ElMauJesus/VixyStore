<?php
/**
 * Vixy Delivery Platform - Endpoint de Configuración Global y Tasas
 * Devuelve tasa BCV, tarifas oficiales ($2.00 base, +$0.50/km), límite de saldo (-$0.50), etc.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT clave, valor, descripcion FROM configuracion_sistema");
        $rows = $stmt->fetchAll();
        $configs = [];
        foreach ($rows as $r) {
            $configs[$r['clave']] = is_numeric($r['valor']) ? (float)$r['valor'] : $r['valor'];
        }

        // Fallbacks si la tabla estuviese vacía
        if (empty($configs['tasa_bcv'])) $configs['tasa_bcv'] = 48.50;
        if (empty($configs['tarifa_base_usd'])) $configs['tarifa_base_usd'] = TARIFA_BASE_USD;
        if (empty($configs['km_base'])) $configs['km_base'] = KM_BASE;
        if (empty($configs['precio_km_adicional_usd'])) $configs['precio_km_adicional_usd'] = PRECIO_KM_ADICIONAL_USD;
        if (empty($configs['limite_saldo_negativo_conductor_usd'])) $configs['limite_saldo_negativo_conductor_usd'] = LIMITE_SALDO_NEGATIVO_USD;
        if (empty($configs['comision_plataforma_porcentaje'])) $configs['comision_plataforma_porcentaje'] = COMISION_PLATAFORMA_PCT;

        Database::jsonResponse([
            'success' => true,
            'config' => $configs,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        Database::jsonResponse([
            'success' => true,
            'config' => [
                'tasa_bcv' => 48.50,
                'tarifa_base_usd' => 2.00,
                'km_base' => 3.0,
                'precio_km_adicional_usd' => 0.50,
                'limite_saldo_negativo_conductor_usd' => -0.50,
                'comision_plataforma_porcentaje' => 15.0
            ]
        ]);
    }
} elseif ($method === 'POST' || $method === 'PUT') {
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'finanzas']);
    $input = Database::getJsonInput();

    foreach ($input as $key => $val) {
        $stmt = $pdo->prepare("
            INSERT INTO configuracion_sistema (clave, valor) 
            VALUES (:k, :v)
            ON DUPLICATE KEY UPDATE valor = :v2
        ");
        $stmt->execute(['k' => $key, 'v' => (string)$val, 'v2' => (string)$val]);
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Configuración actualizada correctamente'
    ]);
} else {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido'], 405);
}
