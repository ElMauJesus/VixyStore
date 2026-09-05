<?php
/**
 * ==============================================================================
 * VIXY DELIVERY PLATFORM - ARCHIVO DE CONFIGURACIÓN PRINCIPAL (cPanel & Production)
 * ==============================================================================
 * Edite este archivo con las credenciales de su base de datos creadas en cPanel.
 */

// 1. CREDENCIALES DE BASE DE DATOS (Donweb / Ferozo / cPanel)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'c2861522_vixy_dl');
define('DB_USER', getenv('DB_USER') ?: 'c2861522_VixySD');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'LnsdEjc@st6f4fY');

// 2. SEGURIDAD Y JWT SECRET (Cambie esta clave en producción)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'VIXY_SECRET_KEY_SUPER_SECURE_2026_PROD_JWT_AUTH_TOKEN');
define('JWT_EXPIRY_SECONDS', 60 * 60 * 24 * 7); // 7 días de sesión

// 3. RUTAS Y SUBIDAS DE ARCHIVOS (UPLOADS)
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', '/api/uploads/');

// 4. POLÍTICAS OPERATIVAS DE TARIFAS Y BILLETERA
define('TARIFA_BASE_USD', 2.00);            // Tarifa mínima hasta 3 km
define('KM_BASE', 3.0);                     // Cobertura base de 3 kilómetros
define('PRECIO_KM_ADICIONAL_USD', 0.50);     // $0.50 por cada km adicional
define('LIMITE_SALDO_NEGATIVO_USD', -0.50);  // Bloqueo de asignación si saldo < -$0.50
define('COMISION_PLATAFORMA_PCT', 15.0);    // 15% de comisión de servicio
