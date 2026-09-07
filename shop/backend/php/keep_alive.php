<?php
/**
 * Vixy Delivery Platform - API de Keep-Alive & Telemetría GPS en Tiempo Real
 * Recibe latidos periódicos (heartbeat) de las aplicaciones (Conductor, Comercio, Cliente)
 * Actualiza coordenadas GPS, batería, estado online y última actividad en MySQL.
 * Marca automáticamente fuera de línea a dispositivos sin ping en más de 2 minutos.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

// 1. GET: Consultar telemetría activa de todos los dispositivos (para el Panel Web Admin)
if ($method === 'GET' && $action === 'listar') {
    $stmt = $pdo->query("
        SELECT * FROM telemetria_dispositivos 
        WHERE TIMESTAMPDIFF(MINUTE, ultima_actualizacion, NOW()) <= 15
        ORDER BY ultima_actualizacion DESC
    ");
    $dispositivos = $stmt->fetchAll();
    Database::jsonResponse(['success' => true, 'total' => count($dispositivos), 'dispositivos' => $dispositivos]);
}

// 2. GET: Limpiar / marcar offline dispositivos inactivos (llamado por cron o frontend)
if ($method === 'GET' && $action === 'limpiar_inactivos') {
    // Desconectar conductores sin ping en los últimos 3 minutos
    $stmtCond = $pdo->query("
        UPDATE conductores 
        SET disponible = 0 
        WHERE disponible = 1 
          AND TIMESTAMPDIFF(MINUTE, ultima_actualizacion, NOW()) >= 3
    ");
    
    Database::jsonResponse(['success' => true, 'mensaje' => 'Dispositivos inactivos actualizados']);
}

// 3. POST: Recibir heartbeat de la app
if ($method !== 'POST') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Use POST para emitir heartbeat'], 405);
}

$data = Database::getJsonInput();

$usuarioId = $data['usuario_id'] ?? null;
$tipoUsuario = $data['tipo_usuario'] ?? 'cliente'; // 'conductor', 'comercio', 'cliente'
$nombre = $data['nombre'] ?? 'Usuario Vixy';
$latitud = isset($data['latitud']) ? (float)$data['latitud'] : 0.0;
$longitud = isset($data['longitud']) ? (float)$data['longitud'] : 0.0;
$bateria = isset($data['bateria']) ? (int)$data['bateria'] : null;
$online = isset($data['online']) ? (int)$data['online'] : 1;
$appVersion = $data['app_version'] ?? '2.0.0-debug';

if (!$usuarioId) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'usuario_id es requerido'], 400);
}

try {
    // 1. Asegurar existencia de tabla de telemetría
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS telemetria_dispositivos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id VARCHAR(50) NOT NULL,
            tipo_usuario ENUM('conductor', 'comercio', 'cliente') NOT NULL,
            nombre VARCHAR(120) NOT NULL,
            latitud DECIMAL(10, 7) NOT NULL DEFAULT 0.0,
            longitud DECIMAL(10, 7) NOT NULL DEFAULT 0.0,
            bateria INT NULL,
            online TINYINT(1) NOT NULL DEFAULT 1,
            app_version VARCHAR(30) NULL,
            ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_usuario (usuario_id, tipo_usuario),
            INDEX idx_gps (latitud, longitud),
            INDEX idx_actualizacion (ultima_actualizacion)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 2. Insertar o actualizar registro de telemetría
    $stmtUpsert = $pdo->prepare("
        INSERT INTO telemetria_dispositivos 
            (usuario_id, tipo_usuario, nombre, latitud, longitud, bateria, online, app_version, ultima_actualizacion)
        VALUES 
            (:uid, :tipo, :nombre, :lat, :lng, :bat, :online, :ver, NOW())
        ON DUPLICATE KEY UPDATE
            nombre = VALUES(nombre),
            latitud = VALUES(latitud),
            longitud = VALUES(longitud),
            bateria = VALUES(bateria),
            online = VALUES(online),
            app_version = VALUES(app_version),
            ultima_actualizacion = NOW()
    ");

    $stmtUpsert->execute([
        'uid' => $usuarioId,
        'tipo' => $tipoUsuario,
        'nombre' => $nombre,
        'lat' => $latitud,
        'lng' => $longitud,
        'bat' => $bateria,
        'online' => $online,
        'ver' => $appVersion
    ]);

    // 3. Sincronizar tabla correspondiente según el rol
    if ($tipoUsuario === 'conductor' && $latitud != 0 && $longitud != 0) {
        $stmtSyncCond = $pdo->prepare("
            UPDATE conductores 
            SET latitud_actual = :lat,
                longitud_actual = :lng,
                disponible = :online,
                ultima_actualizacion = NOW()
            WHERE id = :uid
        ");
        $stmtSyncCond->execute([
            'lat' => $latitud,
            'lng' => $longitud,
            'online' => $online,
            'uid' => $usuarioId
        ]);
    } else if ($tipoUsuario === 'comercio') {
        $stmtSyncCom = $pdo->prepare("
            UPDATE comercios 
            SET abierto = :online
            WHERE id = :uid
        ");
        $stmtSyncCom->execute([
            'online' => $online,
            'uid' => $usuarioId
        ]);
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Keep-alive recibido y registrado',
        'timestamp' => date('Y-m-d H:i:s'),
        'latitud' => $latitud,
        'longitud' => $longitud
    ]);

} catch (PDOException $e) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Error al procesar keep-alive: ' . $e->getMessage()], 500);
}
