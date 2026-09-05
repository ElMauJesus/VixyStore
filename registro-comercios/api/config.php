<?php
/**
 * ==============================================================================
 * VIXY RIDER - REGISTRO DE COMERCIOS - CONFIGURACIÓN DE BASE DE DATOS
 * Base de Datos: c2861522_regist
 * ==============================================================================
 */

// Evitar acceso directo
if (basename($_SERVER['PHP_SELF']) === 'config.php') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Zona horaria
date_default_timezone_set('America/Caracas');

// Credenciales para la base de datos de registro de comercios (Donweb / cPanel / Ferozo)
define('REGIST_DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('REGIST_DB_PORT', getenv('DB_PORT') ?: '3306');
define('REGIST_DB_NAME', getenv('REGIST_DB_NAME') ?: 'c2861522_regist');
define('REGIST_DB_USER', getenv('REGIST_DB_USER') ?: 'c2861522_VixySD');
define('REGIST_DB_PASS', getenv('REGIST_DB_PASS') !== false ? getenv('REGIST_DB_PASS') : 'LnsdEjc@st6f4fY');

/**
 * Conexión PDO segura a c2861522_regist
 */
function getRegistDbConnection() {
    $dsn = "mysql:host=" . REGIST_DB_HOST . ";port=" . REGIST_DB_PORT . ";dbname=" . REGIST_DB_NAME . ";charset=utf8mb4";
    
    try {
        $pdo = new PDO($dsn, REGIST_DB_USER, REGIST_DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión a c2861522_regist: " . $e->getMessage());
        return null;
    }
}
