<?php
/**
 * Módulo de Seguridad y Sanitización
 * Vixy Store Backend API
 */

// Evitar acceso directo a este archivo
if (basename($_SERVER['PHP_SELF']) === 'security.php') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

/**
 * Sanitiza una entrada de texto contra HTML/XSS
 */
function sanitize_input($data) {
    if (is_array($data)) {
        return array_map('sanitize_input', $data);
    }
    if ($data === null) return '';
    $data = trim($data);
    $data = strip_tags($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Valida si un email tiene un formato correcto
 */
function validate_email($email) {
    $cleanEmail = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    return filter_var($cleanEmail, FILTER_VALIDATE_EMAIL) ? $cleanEmail : false;
}

/**
 * Valida un archivo subido
 */
function validate_file_upload($file, $maxSizeMB = 5) {
    if (!isset($file['error']) || is_array($file['error'])) {
        return ["valid" => false, "message" => "Parámetros de archivo no válidos"];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ["valid" => false, "message" => "Error en la subida del archivo"];
    }

    if ($file['size'] > $maxSizeMB * 1024 * 1024) {
        return ["valid" => false, "message" => "El archivo supera el tamaño máximo de {$maxSizeMB}MB"];
    }

    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($extension, $allowedExtensions)) {
        return ["valid" => false, "message" => "Formato no permitido. Extensión: .$extension"];
    }

    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimeTypes)) {
            return ["valid" => false, "message" => "Tipo MIME no válido: $mimeType"];
        }
    }

    return ["valid" => true];
}

/**
 * Genera un token seguro
 */
function generate_token($length = 64) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Devuelve la IP del cliente
 */
function get_client_ip() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Devuelve los datos de la petición (JSON o Form Data)
 */
function get_request_data() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    
    // Si viene en JSON
    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        return is_array($json) ? $json : [];
    }
    
    // Si es PUT / PATCH / DELETE sin form-data multipart
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (in_array($method, ['PUT', 'PATCH', 'DELETE'])) {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (is_array($json)) {
            return $json;
        }
        parse_str($raw, $parsed);
        if (is_array($parsed) && !empty($parsed)) {
            return $parsed;
        }
    }
    
    return !empty($_POST) ? $_POST : [];
}

/**
 * Devuelve el header Authorization de forma compatible con múltiples servidores
 */
function get_bearer_token() {
    $authHeader = null;
    
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }
        
        // Header de respaldo si Apache suprimio Authorization
        if (!$authHeader) {
            if (isset($headers['X-Auth-Token'])) {
                return sanitize_input($headers['X-Auth-Token']);
            } elseif (isset($headers['x-auth-token'])) {
                return sanitize_input($headers['x-auth-token']);
            }
        }
    }
    
    if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }
    
    // Si viene en variable de entorno HTTP_X_AUTH_TOKEN
    if (isset($_SERVER['HTTP_X_AUTH_TOKEN']) && !empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        return sanitize_input($_SERVER['HTTP_X_AUTH_TOKEN']);
    }
    
    // Soporte para token por query param como respaldo para descargas seguras
    if (isset($_GET['token']) && !empty($_GET['token'])) {
        return sanitize_input($_GET['token']);
    }
    
    return null;
}

/**
 * Configura encabezados de seguridad estándar y CORS
 */
function apply_security_headers() {
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: SAMEORIGIN");
    header("X-XSS-Protection: 1; mode=block");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token");
    
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
?>