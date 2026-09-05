<?php
/**
 * ==============================================================================
 * VIXY RIDER - REGISTRO DE COMERCIOS - MÓDULO DE SEGURIDAD Y VALIDACIÓN
 * ==============================================================================
 */

if (basename($_SERVER['PHP_SELF']) === 'security.php') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

/**
 * Sanitizar texto plano evitando XSS y carácteres de control
 */
function sanitize_input($data) {
    if ($data === null) return '';
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return $data;
}

/**
 * Validar y sanitizar formato de correo electrónico
 */
function validate_email($email) {
    $email = trim($email);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    return strtolower($email);
}

/**
 * Validar subida segura de fotos
 * - Tamaño máximo: 5 MB
 * - Tipos MIME estrictos: JPEG, PNG, WebP
 * - Verificación binaria de cabecera con finfo
 */
function validate_file_upload($file) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return [
            'valid' => false,
            'message' => 'Error al transferir el archivo al servidor (Código: ' . ($file['error'] ?? 'desconocido') . ')'
        ];
    }

    $maxBytes = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxBytes) {
        return [
            'valid' => false,
            'message' => 'El archivo supera el tamaño máximo permitido de 5 MB.'
        ];
    }

    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];

    if (!class_exists('finfo')) {
        // Fallback si la extensión fileinfo no estuviera activa
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
            return ['valid' => false, 'message' => 'Formato no permitido. Solo imágenes JPG, PNG o WebP.'];
        }
        return ['valid' => true, 'extension' => $ext === 'jpeg' ? 'jpg' : $ext];
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (!array_key_exists($mimeType, $allowedMimes)) {
        return [
            'valid' => false,
            'message' => 'Formato no válido. Solo se admiten archivos de imagen (JPG, PNG o WebP).'
        ];
    }

    return [
        'valid' => true,
        'extension' => $allowedMimes[$mimeType]
    ];
}

/**
 * Obtener la dirección IP real del solicitante
 */
function get_client_ip() {
    $keys = [
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_FORWARDED',
        'HTTP_X_CLUSTER_CLIENT_IP',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'
    ];

    foreach ($keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}
