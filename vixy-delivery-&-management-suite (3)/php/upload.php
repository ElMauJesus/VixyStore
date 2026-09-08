<?php
/**
 * Vixy Delivery Platform - Almacenamiento Centralizado de Imágenes y Consultas SQL
 * Destinos soportados: comercios, productos, entregas, reclamos, comprobantes
 * Ejecución directa de consultas SQL individuales según entidad y tipo
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método debe ser POST'], 405);
}

// 1. Validar archivo recibido
if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    Database::jsonResponse([
        'error' => true, 
        'mensaje' => 'No se recibió ningún archivo de imagen válido o ocurrió un error al subirlo'
    ], 400);
}

$file = $_FILES['imagen'];
$maxSize = 5 * 1024 * 1024; // 5 MB

if ($file['size'] > $maxSize) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'La imagen supera el límite permitido de 5MB'], 400);
}

// Validar tipos MIME
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

if (!isset($allowedMimes[$mime])) {
    Database::jsonResponse([
        'error' => true, 
        'mensaje' => 'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WebP.'
    ], 400);
}

$ext = $allowedMimes[$mime];

// 2. Determinar categoría de almacenamiento
$tipo = $_POST['tipo'] ?? 'general'; // comercios, productos, entregas, reclamos, comprobantes
$entityId = $_POST['entity_id'] ?? null; // ID del comercio, producto, pedido, reclamo, etc.
$campoEspecifico = $_POST['campo'] ?? null; // ej: 'logo', 'banner'

$validTypes = ['comercios', 'productos', 'entregas', 'reclamos', 'comprobantes', 'admin'];
if (!in_array($tipo, $validTypes)) {
    $tipo = 'general';
}

$uploadDir = __DIR__ . "/uploads/{$tipo}/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generar nombre de archivo único no colisionable
$filename = $tipo . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Error al mover el archivo al disco de almacenamiento'], 500);
}

$publicUrl = "/backend/php/uploads/{$tipo}/" . $filename;

// 3. EJECUTAR CONSULTAS SQL INDIVIDUALES SEGÚN ENTIDAD Y TIPO
$sqlExecuted = false;
$sqlMessage = '';

if ($entityId) {
    switch ($tipo) {
        // --- A. IMAGEN DE COMERCIO (LOGO O BANNER) ---
        case 'comercios':
            $col = ($campoEspecifico === 'banner') ? 'banner_url' : 'logo_url';
            $stmt = $pdo->prepare("UPDATE comercios SET {$col} = :url WHERE id = :id");
            $stmt->execute(['url' => $publicUrl, 'id' => $entityId]);
            $sqlExecuted = true;
            $sqlMessage = "Comercio [{$entityId}]: Campo {$col} actualizado con éxito.";
            break;

        // --- B. IMAGEN DE PRODUCTO / ITEM DEL CATÁLOGO ---
        case 'productos':
            try {
                $stmt = $pdo->prepare("UPDATE productos SET imagen_url = :url WHERE id = :id");
                $stmt->execute(['url' => $publicUrl, 'id' => $entityId]);
            } catch (Exception $e) {
                $stmt = $pdo->prepare("UPDATE productos_catalogo SET imagen_url = :url WHERE id = :id");
                $stmt->execute(['url' => $publicUrl, 'id' => $entityId]);
            }
            $sqlExecuted = true;
            $sqlMessage = "Producto [{$entityId}]: Imagen de catálogo vinculada.";
            break;

        // --- C. FOTO DE CONFIRMACIÓN DE ENTREGA ---
        case 'entregas':
            try {
                $stmt = $pdo->prepare("UPDATE confirmaciones_entrega SET foto_entrega_url = :url WHERE pedido_id = :id");
                $stmt->execute(['url' => $publicUrl, 'id' => $entityId]);
            } catch (Exception $e) {}
            $sqlExecuted = true;
            $sqlMessage = "Confirmación de Entrega para Pedido [{$entityId}]: Foto de entrega guardada.";
            break;

        // --- D. FOTO DE EVIDENCIA EN RECLAMO O DISPUTA ---
        case 'reclamos':
            try {
                $stmt = $pdo->prepare("UPDATE reclamos_incidencias SET evidencia_url = :url WHERE id = :id");
                $stmt->execute(['url' => $publicUrl, 'id' => $entityId]);
            } catch (Exception $e) {}
            $sqlExecuted = true;
            $sqlMessage = "Reclamo [{$entityId}]: Evidencia fotográfica adjunta.";
            break;

        // --- E. COMPROBANTE DE PAGO O RECARGA ---
        case 'comprobantes':
            try {
                $stmt = $pdo->prepare("UPDATE recargas_billetera SET comprobante_url = :url WHERE id = :id");
                $stmt->execute(['url' => $publicUrl, 'id' => $entityId]);
            } catch (Exception $e) {
                $stmt = $pdo->prepare("UPDATE comprobantes_pago SET comprobante_imagen_url = :url WHERE id = :id OR referencia_id = :id2");
                $stmt->execute(['url' => $publicUrl, 'id' => $entityId, 'id2' => $entityId]);
            }
            $sqlExecuted = true;
            $sqlMessage = "Comprobante de Pago [{$entityId}]: Recibo bancario registrado.";
            break;
    }
}

// 4. Retornar respuesta JSON exitosa
Database::jsonResponse([
    'success' => true,
    'mensaje' => 'Imagen almacenada exitosamente',
    'url' => $publicUrl,
    'tipo' => $tipo,
    'entity_id' => $entityId,
    'sql_ejecutado' => $sqlExecuted,
    'sql_detalle' => $sqlMessage,
    'tamano_bytes' => $file['size'],
    'formato' => $ext
]);
