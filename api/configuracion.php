<?php
/**
 * Gestión de Configuración Global del Sistema (Admin)
 * Vixy Platform Backend API - api/admin/configuracion.php
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Validar token JWT y verificar permisos administrativos
$user = AuthMiddleware::requireAuth(['administrator', 'admin', 'secretary', 'super_admin']);

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT clave, valor, descripcion FROM configuracion_sistema ORDER BY clave ASC");
        $rows = $stmt->fetchAll();

        $configMap = [];
        foreach ($rows as $row) {
            $configMap[$row['clave']] = [
                'valor' => $row['valor'],
                'descripcion' => $row['descripcion']
            ];
        }

        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Configuraciones obtenidas correctamente',
            'data' => [
                'configuraciones' => $rows,
                'mapa' => $configMap
            ]
        ]);
    } catch (PDOException $e) {
        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'Error al obtener la configuración'
        ], 500);
    }
}

if ($method === 'POST' || $method === 'PUT') {
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
        $stmt = $pdo->prepare("UPDATE configuracion_sistema SET valor = :valor WHERE clave = :clave");
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

            if ($stmt->rowCount() > 0) {
                $actualizados++;
            }
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