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
 * Devuelve el header Authorization
 */
function get_bearer_token() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}
?>