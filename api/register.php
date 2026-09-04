<?php
/**
 * Registro de Clientes / Conductores
 * Vixy Store Backend API
 * 
 * NOTA: El registro de usuarios está restringido exclusivamente a conductores 
 * registrados a través de la plataforma VixyRider. Los conductores registrados
 * ingresan directamente a la tienda mediante /api/login.php con sus credenciales de VixyRider.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

apply_security_headers();

// Informar que el registro se realiza exclusivamente a través de VixyRider
http_response_code(403);
echo json_encode([
    "success" => false,
    "restricted" => true,
    "message" => "El registro en Vixy Store es exclusivo para conductores de la red Vixy. Si ya completaste tu preregistro en VixyRider, puedes iniciar sesión directamente con tu correo y contraseña.",
    "registration_url" => "https://vixyrider.com/#registro",
    "support_contact" => "soporte@vixystore.com"
]);
exit;
?>