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

// 0. Autenticación y control de acceso
$authUser = null;
if (AuthMiddleware::hasAdminKey()) {
    $authUser = ['tipo_usuario' => 'super_admin', 'id' => 'admin', 'nivel_acceso' => 'super_admin'];
} else {
    $authUser = AuthMiddleware::verifyToken();
}

$tipoPeticion = $_POST['tipo'] ?? 'general';
$entityIdPeticion = trim((string)($_POST['entity_id'] ?? ''));

// Subidas públicas permitidas solo para comprobantes de pago previo o pre-registro sin reemplazar entidades existentes
$esSubidaPublicaPermitida = in_array($tipoPeticion, ['comprobantes', 'conductores', 'comercios', 'general'], true) && empty($entityIdPeticion);

if (!$authUser && !$esSubidaPublicaPermitida) {
    Database::jsonResponse([
        'error' => true,
        'mensaje' => 'Acceso no autorizado: Se requiere token de sesión o credenciales válidas para subir archivos'
    ], 401);
}

// Si se intenta modificar una entidad existente, verificar que sea el usuario propietario o administrador
if ($authUser && !empty($entityIdPeticion)) {
    $userRole = strtolower(trim((string)($authUser['role'] ?? $authUser['tipo_usuario'] ?? '')));
    $isAdmin = in_array($userRole, ['super_admin', 'admin', 'administrador', 'operador', 'finanzas'], true);
    $userId = $authUser['id'] ?? ($authUser['sub'] ?? '');
    if (!$isAdmin && $userId !== '' && $userId !== $entityIdPeticion) {
        if (in_array($tipoPeticion, ['comercios', 'conductores'], true)) {
            Database::jsonResponse([
                'error' => true,
                'mensaje' => 'No tiene permisos para modificar la información de esta entidad'
            ], 403);
        }
    }
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
$comercioId = $_POST['comercio_id'] ?? $_POST['comercioId'] ?? null;
$campoEspecifico = $_POST['campo'] ?? null; // ej: 'logo', 'banner'

$validTypes = ['comercios', 'productos', 'articulos', 'entregas', 'reclamos', 'comprobantes', 'admin'];
if (!in_array($tipo, $validTypes)) {
    $tipo = 'general';
}

// Si es producto pero no se pasó comercio_id, verificar si entity_id es un comercio o buscar el producto
if (($tipo === 'productos' || $tipo === 'articulos') && !$comercioId) {
    if ($entityId && !str_starts_with($entityId, 'prod-')) {
        $comercioId = $entityId;
    } elseif ($entityId && str_starts_with($entityId, 'prod-')) {
        try {
            $stCp = $pdo->prepare("SELECT comercio_id FROM productos WHERE id = :id LIMIT 1");
            $stCp->execute(['id' => $entityId]);
            $comercioId = $stCp->fetchColumn();
        } catch (Exception $e) {}
    }
}

// Generar nombre de archivo único
$filename = ($tipo === 'productos' || $tipo === 'articulos')
    ? ('art_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext)
    : ($tipo . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $ext);

if (($tipo === 'productos' || $tipo === 'articulos') && !empty($comercioId)) {
    // Almacenar en la carpeta individual del comercio respectivo
    $dirShop    = dirname(dirname(__DIR__)) . "/shop/imgs-c-d/comercios/{$comercioId}/articulos/";
    $dirRoot    = dirname(dirname(__DIR__)) . "/imgs-c-d/comercios/{$comercioId}/articulos/";
    $dirUploads = __DIR__ . "/uploads/comercios/{$comercioId}/articulos/";

    foreach ([$dirShop, $dirRoot, $dirUploads] as $d) {
        if (!is_dir($d)) @mkdir($d, 0755, true);
    }

    $targetPath = is_dir($dirShop) ? ($dirShop . $filename) : ($dirUploads . $filename);
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Error al guardar la foto del artículo en el comercio'], 500);
    }

    // Replicar en las rutas hermanas para disponibilidad inmediata
    if (file_exists($targetPath)) {
        @copy($targetPath, $dirShop . $filename);
        @copy($targetPath, $dirRoot . $filename);
        @copy($targetPath, $dirUploads . $filename);
    }

    $publicUrl = "/shop/imgs-c-d/comercios/{$comercioId}/articulos/" . $filename;
} else {
    $uploadDir = __DIR__ . "/uploads/{$tipo}/";
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }
    $targetPath = $uploadDir . $filename;
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Error al mover el archivo al disco de almacenamiento'], 500);
    }

    $baseUrl = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
    $publicUrl = "{$baseUrl}/uploads/{$tipo}/" . $filename;
}

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
        case 'articulos':
            if (str_starts_with($entityId, 'prod-')) {
                try {
                    $stmt = $pdo->prepare("UPDATE productos SET imagen_url = :url WHERE id = :id");
                    $stmt->execute(['url' => $publicUrl, 'id' => $entityId]);
                } catch (Exception $e) {
                    $stmt = $pdo->prepare("UPDATE productos_catalogo SET imagen_url = :url WHERE id = :id");
                    $stmt->execute(['url' => $publicUrl, 'id' => $entityId]);
                }
                $sqlExecuted = true;
                $sqlMessage = "Producto [{$entityId}]: Imagen de catálogo vinculada.";
            }
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
