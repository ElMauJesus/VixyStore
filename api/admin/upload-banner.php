<?php
/**
 * Subida de imágenes de banners
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No se recibió ninguna imagen"]);
    exit;
}

$file = $_FILES['imagen'];

if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "La imagen supera los 5MB"]);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

if (!isset($allowedMimes[$mime])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Formato no permitido"]);
    exit;
}

$ext = $allowedMimes[$mime];
$uploadDir = __DIR__ . "/../../public/banners/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = 'banner_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al guardar"]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Imagen subida",
    "url" => "/banners/" . $filename
]);
?>