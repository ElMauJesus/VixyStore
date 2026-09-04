<?php
/**
 * Configuración de Base de Datos
 * Vixy Store Backend API
 */

// Evitar acceso directo a este archivo
if (basename($_SERVER['PHP_SELF']) === 'config.php') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Zona horaria
date_default_timezone_set('America/Caracas');

// -----------------------------------------------------------------------------
// 1. Configuración de la base de datos principal de Vixy Store
// -----------------------------------------------------------------------------
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'vixy_store');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');

// -----------------------------------------------------------------------------
// 2. Configuración de la base de datos de Conductores VixyRider (cPanel)
// -----------------------------------------------------------------------------
define('DRIVER_DB_HOST', getenv('DRIVER_DB_HOST') ?: (getenv('DB_HOST') ?: '127.0.0.1'));
define('DRIVER_DB_PORT', getenv('DRIVER_DB_PORT') ?: (getenv('DB_PORT') ?: '3306'));
define('DRIVER_DB_NAME', getenv('DRIVER_DB_NAME') ?: 'vixyhgtk_vixy_driver_prereg');
define('DRIVER_DB_USER', getenv('DRIVER_DB_USER') ?: 'vixyhgtk_vixy_dba');
define('DRIVER_DB_PASS', getenv('DRIVER_DB_PASS') ?: 'K2e+U@#U*7HtYC~b');
define('DRIVER_TABLE', getenv('DRIVER_TABLE') ?: 'drivers');

/**
 * Retorna la conexión PDO configurada a MySQL para Vixy Store
 */
function getDbConnection() {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión a la Base de Datos de Vixy Store: " . $e->getMessage());
        return null;
    }
}

/**
 * Retorna la conexión PDO a la Base de Datos de Conductores VixyRider
 */
function getDriverDbConnection() {
    $dsn = "mysql:host=" . DRIVER_DB_HOST . ";port=" . DRIVER_DB_PORT . ";dbname=" . DRIVER_DB_NAME . ";charset=utf8mb4";
    
    try {
        $pdo = new PDO($dsn, DRIVER_DB_USER, DRIVER_DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 4,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión a la Base de Datos de Conductores (VixyRider): " . $e->getMessage());
        return null;
    }
}
?>