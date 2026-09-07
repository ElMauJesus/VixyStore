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

        // Consultar datos oficiales de Pago Móvil
        $pagoMovil = null;
        try {
            $stmtPm = $pdo->query("SELECT banco, telefono, cedula_rif, nombre_titular, qr_imagen_url, instrucciones FROM datos_pago_movil WHERE id = 1 LIMIT 1");
            $pagoMovil = $stmtPm->fetch();
        } catch (Exception $ex) {}

        if (!$pagoMovil) {
            $pagoMovil = [
                'banco' => '0102 - Banco de Venezuela',
                'telefono' => '0412-9876543',
                'cedula_rif' => 'J-50123456-7',
                'nombre_titular' => 'Vixy Inversiones C.A.',
                'qr_imagen_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAGOMOVIL_0102_04129876543_J501234567',
                'instrucciones' => 'Por favor transferir el monto exacto en Bolívares e ingresar la referencia bancaria.'
            ];
        }

        Database::jsonResponse([
            'success' => true,
            'config' => $configs,
            'pago_movil' => $pagoMovil,
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
                'comision_plataforma_porcentaje' => 15.0,
                'porcentaje_comision_comercio' => 0.00,
                'carteras_habilitadas_global' => 1,
                'carteras_clientes_habilitada' => 1,
                'carteras_comercios_habilitada' => 1,
                'carteras_repartidores_habilitada' => 1
            ],
            'pago_movil' => [
                'banco' => '0102 - Banco de Venezuela',
                'telefono' => '0412-9876543',
                'cedula_rif' => 'J-50123456-7',
                'nombre_titular' => 'Vixy Inversiones C.A.',
                'qr_imagen_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAGOMOVIL_0102_04129876543_J501234567'
            ]
        ]);
    }
} elseif ($method === 'POST' || $method === 'PUT') {
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'finanzas']);
    $input = Database::getJsonInput();

    // Actualizar datos de Pago Móvil si vienen en el payload
    if (isset($input['pago_movil']) && is_array($input['pago_movil'])) {
        $pm = $input['pago_movil'];
        $stmtPm = $pdo->prepare("
            INSERT INTO datos_pago_movil (id, banco, telefono, cedula_rif, nombre_titular, qr_imagen_url, instrucciones)
            VALUES (1, :banco, :telefono, :rif, :titular, :qr, :instrucciones)
            ON DUPLICATE KEY UPDATE 
                banco = VALUES(banco),
                telefono = VALUES(telefono),
                cedula_rif = VALUES(cedula_rif),
                nombre_titular = VALUES(nombre_titular),
                qr_imagen_url = VALUES(qr_imagen_url),
                instrucciones = VALUES(instrucciones)
        ");
        $stmtPm->execute([
            'banco' => $pm['banco'] ?? '0102 - Banco de Venezuela',
            'telefono' => $pm['telefono'] ?? '0412-9876543',
            'rif' => $pm['cedulaRif'] ?? ($pm['cedula_rif'] ?? 'J-50123456-7'),
            'titular' => $pm['nombreTitular'] ?? ($pm['nombre_titular'] ?? 'Vixy Inversiones C.A.'),
            'qr' => $pm['qrImagenUrl'] ?? ($pm['qr_imagen_url'] ?? ''),
            'instrucciones' => $pm['instrucciones'] ?? ''
        ]);
        unset($input['pago_movil']);
    }

    foreach ($input as $key => $val) {
        if (is_array($val)) $val = json_encode($val);
        $stmt = $pdo->prepare("
            INSERT INTO configuracion_sistema (clave, valor) 
            VALUES (:k, :v)
            ON DUPLICATE KEY UPDATE valor = :v2
        ");
        $stmt->execute(['k' => $key, 'v' => (string)$val, 'v2' => (string)$val]);
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Configuración y datos de Pago Móvil actualizados correctamente'
    ]);
} else {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido'], 405);
}
