<?php
/**
 * Gestión de Configuración Global del Sistema (Admin)
 * Vixy Platform Backend API - api/admin/configuracion.php
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Manejo de métodos HTTP
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT clave, valor, descripcion FROM configuracion_sistema ORDER BY clave ASC");
        $rows = $stmt->fetchAll();

        $configs = [];
        $configMap = [];
        foreach ($rows as $row) {
            $configs[$row['clave']] = is_numeric($row['valor']) ? (float)$row['valor'] : $row['valor'];
            $configMap[$row['clave']] = [
                'valor' => $row['valor'],
                'descripcion' => $row['descripcion']
            ];
        }

        // Fallbacks si la tabla estuviese vacía
        if (empty($configs['tasa_bcv'])) $configs['tasa_bcv'] = 48.50;
        if (empty($configs['tarifa_base_usd'])) $configs['tarifa_base_usd'] = 2.00;
        if (empty($configs['km_base'])) $configs['km_base'] = 3.0;
        if (empty($configs['precio_km_adicional_usd'])) $configs['precio_km_adicional_usd'] = 0.50;
        if (empty($configs['limite_saldo_negativo_conductor_usd'])) $configs['limite_saldo_negativo_conductor_usd'] = -0.50;
        if (empty($configs['comision_plataforma_porcentaje'])) $configs['comision_plataforma_porcentaje'] = 15.0;
        // Comisiones escalonadas por antigüedad (delivery y comercio)
        if (!isset($configs['comision_delivery_antes_3m'])) $configs['comision_delivery_antes_3m'] = 5.0;
        if (!isset($configs['comision_delivery_despues_3m'])) $configs['comision_delivery_despues_3m'] = 10.0;
        if (!isset($configs['comision_comercio_antes_anio'])) $configs['comision_comercio_antes_anio'] = 0.0;
        if (!isset($configs['comision_comercio_despues_anio'])) $configs['comision_comercio_despues_anio'] = 3.0;

        Database::jsonResponse([
            'success' => true,
            'config' => $configs,
            'mensaje' => 'Configuraciones obtenidas correctamente',
            'data' => [
                'configuraciones' => $rows,
                'mapa' => $configMap
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } catch (PDOException $e) {
        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'Error al obtener la configuración: ' . $e->getMessage()
        ], 500);
    }
}

if ($method === 'POST' || $method === 'PUT') {
    // Validar token JWT y verificar permisos administrativos para guardar cambios
    $user = AuthMiddleware::requireAuth(['administrator', 'admin', 'secretary', 'super_admin', 'finanzas']);

    $data = Database::getJsonInput();
    $configuraciones = $data['configuraciones'] ?? $data;

    if (empty($configuraciones) || !is_array($configuraciones)) {
        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'Datos de configuración no válidos'
        ], 400);
    }

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("
            INSERT INTO configuracion_sistema (clave, valor) 
            VALUES (:clave, :valor) 
            ON DUPLICATE KEY UPDATE valor = VALUES(valor)
        ");
        $actualizados = 0;

        foreach ($configuraciones as $clave => $val) {
            // Soporta tanto array asociativo {"tasa_bcv": "48.5"} como array de objetos [{"clave": "...", "valor": "..."}]
            if (is_array($val) && isset($val['clave'], $val['valor'])) {
                $claveParam = trim((string)$val['clave']);
                $valorParam = trim((string)$val['valor']);
            } else {
                $claveParam = trim((string)$clave);
                $valorParam = trim((string)$val);
            }

            if ($claveParam === '') {
                continue;
            }

            $stmt->execute([
                'valor' => $valorParam,
                'clave' => $claveParam
            ]);

            $actualizados++;
        }

        $pdo->commit();

        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Configuración actualizada exitosamente',
            'registros_modificados' => $actualizados
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'Error al guardar cambios: ' . $e->getMessage()
        ], 500);
    }
}

Database::jsonResponse([
    'error' => true,
    'mensaje' => 'Método no permitido'
], 405);