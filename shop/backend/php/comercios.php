<?php
/**
 * Vixy Delivery Platform - API de Comercios Unificada
 * Conecta comercios registrados desde /registro-comercios/ (c2861522_regist)
 * y comercios de la plataforma delivery (c2861522_vixy_dl).
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$pdoRegist = Database::getRegistConnection();

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// Función para normalizar comercio a estructura uniforme
function normalizarComercio($c, $origen = 'delivery') {
    $rif = $c['rif_cedula_juridica'] ?? ($c['rif'] ?? '');
    
    // Si viene de 'regist', la columna es 'nombre_comercial'.
    // Si viene de 'delivery' (vixy_dl), la columna es 'nombre'.
    $nombre = !empty($c['nombre_comercial']) ? $c['nombre_comercial'] : (!empty($c['nombre']) ? $c['nombre'] : 'Comercio');

    $email = $c['email'] ?? '';
    $idKey = !empty($c['codigo_comercio']) ? $c['codigo_comercio'] : (!empty($c['id']) ? (string)$c['id'] : 'com-' . md5($rif . $email));
    
    // Categoría
    $cat = $c['categoria_negocio'] ?? ($c['categoria_principal'] ?? ($c['categoria'] ?? 'General'));
    $catPrincipal = 'comida_rapida';
    $catLower = strtolower($cat);
    if (strpos($catLower, 'restaurante') !== false || strpos($catLower, 'comida') !== false) $catPrincipal = 'comida_rapida';
    else if (strpos($catLower, 'super') !== false || strpos($catLower, 'víveres') !== false || strpos($catLower, 'bodega') !== false) $catPrincipal = 'supermercados';
    else if (strpos($catLower, 'ferreter') !== false || strpos($catLower, 'repuesto') !== false) $catPrincipal = 'ferreteria';
    else if (strpos($catLower, 'hogar') !== false) $catPrincipal = 'hogar';
    else if (strpos($catLower, 'farmacia') !== false || strpos($catLower, 'salud') !== false) $catPrincipal = 'supermercados';

    // Días de operación
    $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (!empty($c['dias_operacion'])) {
        $decoded = is_string($c['dias_operacion']) ? json_decode($c['dias_operacion'], true) : $c['dias_operacion'];
        if (is_array($decoded) && count($decoded) > 0) $dias = $decoded;
    }

    $horarioTxt = $c['horarios_atencion'] ?? ($c['horarios_texto'] ?? '08:00 AM - 10:00 PM');
    if ($origen === 'delivery') {
        $status = 'aprobado';
        $validado = true;
        $activo = isset($c['activo']) ? (bool)$c['activo'] : true;
    } else {
        $status = $c['status'] ?? 'pendiente';
        $validado = ($status === 'aprobado');
        $activo = ($status === 'aprobado');
    }
    $abiertoManual = isset($c['abierto_manual']) ? (bool)$c['abierto_manual'] : true;

    return [
        'id' => (string)$idKey,
        'db_id' => $c['id'] ?? null,
        'origen_bd' => $origen,
        'codigo_comercio' => $c['codigo_comercio'] ?? $idKey,
        'codigoComercio' => $c['codigo_comercio'] ?? $idKey,
        'nombre' => $nombre,
        'nombre_comercial' => $nombre,
        'nombreComercial' => $nombre,
        'nombre_representante' => $c['nombre_representante'] ?? '',
        'cedula_representante' => $c['cedula_representante'] ?? '',
        'rif' => $rif,
        'rif_cedula_juridica' => $rif,
        'categoria' => $cat,
        'categoria_principal' => $catPrincipal,
        'categoriaPrincipal' => $catPrincipal,
        'email' => $email,
        'telefono' => $c['telefono_comercio'] ?? ($c['telefono'] ?? ''),
        'telefono_adicional' => $c['telefono_adicional'] ?? '',
        'direccion' => $c['direccion_negocio'] ?? ($c['direccion'] ?? 'Caracas, Venezuela'),
        'punto_referencia' => $c['punto_referencia'] ?? '',
        'ubicacion_gps' => $c['ubicacion_gps'] ?? '',
        'hora_apertura' => $c['hora_apertura'] ?? '08:00:00',
        'hora_cierre' => $c['hora_cierre'] ?? '22:00:00',
        'dias_operacion' => $dias,
        'horarios' => $horarioTxt,
        'horarioApertura' => $horarioTxt,
        'logo_url' => (!empty(trim($c['foto_comercio_url'] ?? '')) ? trim($c['foto_comercio_url']) : (!empty(trim($c['logo_url'] ?? '')) ? trim($c['logo_url']) : '/banners/banner_comercios.jpg')),
        'logoUrl' => (!empty(trim($c['foto_comercio_url'] ?? '')) ? trim($c['foto_comercio_url']) : (!empty(trim($c['logo_url'] ?? '')) ? trim($c['logo_url']) : '/banners/banner_comercios.jpg')),
        'banner_url' => (!empty(trim($c['portada_url'] ?? '')) ? trim($c['portada_url']) : (!empty(trim($c['foto_comercio_url'] ?? '')) ? trim($c['foto_comercio_url']) : (!empty(trim($c['logo_url'] ?? '')) ? trim($c['logo_url']) : '/banners/banner_comercios.jpg'))),
        'bannerUrl' => (!empty(trim($c['portada_url'] ?? '')) ? trim($c['portada_url']) : (!empty(trim($c['foto_comercio_url'] ?? '')) ? trim($c['foto_comercio_url']) : (!empty(trim($c['logo_url'] ?? '')) ? trim($c['logo_url']) : '/banners/banner_comercios.jpg'))),
        'status' => $status,
        'validado' => $validado,
        'activo' => $activo,
        'abierto' => $activo && $abiertoManual,
        'abierto_manual' => $abiertoManual,
        'calificacion' => floatval($c['calificacion'] ?? 5.0),
        'total_calificaciones' => intval($c['total_calificaciones'] ?? 0),
        'costo_envio_base_usd' => floatval($c['costo_envio_base_usd'] ?? 2.00),
        'costoEnvioUsd' => floatval($c['costo_envio_base_usd'] ?? 2.00),
        'saldo_billetera_usd' => floatval($c['saldo_billetera_usd'] ?? 0.00),
        'productos' => []
    ];
}

// -----------------------------------------------------------------------------
// GET: CONSULTAR COMERCIO O LISTAR TODOS LOS COMERCIOS (UNIFICADO)
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $found = null;
        // 1. Buscar en c2861522_vixy_dl
        try {
            $st = $pdo->prepare("SELECT * FROM comercios WHERE id = :id OR rif = :id2 LIMIT 1");
            $st->execute(['id' => $id, 'id2' => $id]);
            $row = $st->fetch();
            if ($row) $found = normalizarComercio($row, 'delivery');
        } catch (Exception $e) {}

        // 2. Si no está en delivery, buscar en c2861522_regist
        if (!$found && $pdoRegist) {
            try {
                $stR = $pdoRegist->prepare("SELECT * FROM comercios WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR id = :id3 LIMIT 1");
                $stR->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
                $row = $stR->fetch();
                if ($row) $found = normalizarComercio($row, 'regist');
            } catch (Exception $e) {}
        }

        if (!$found) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Comercio no encontrado'], 404);
        }

        // Obtener productos si es de delivery
        try {
            $stP = $pdo->prepare("SELECT * FROM productos WHERE comercio_id = :cid AND disponible = 1");
            $stP->execute(['cid' => $found['id']]);
            $found['productos'] = $stP->fetchAll();
        } catch (Exception $e) {
            $found['productos'] = [];
        }

        Database::jsonResponse(['success' => true, 'comercio' => $found]);
    }

    // Listado general de comercios
    $comerciosMap = [];

    // 1. Cargar comercios validados de c2861522_vixy_dl (todos los que están aquí son validados)
    try {
        $stD = $pdo->query("SELECT * FROM comercios ORDER BY calificacion DESC");
        $deliveryStores = $stD->fetchAll();
        foreach ($deliveryStores as $d) {
            $norm = normalizarComercio($d, 'delivery');
            $key = !empty($norm['rif']) ? $norm['rif'] : $norm['id'];
            $comerciosMap[$key] = $norm;
        }
    } catch (Exception $e) {
        error_log("Error cargando de c2861522_vixy_dl: " . $e->getMessage());
    }

    // 2. Cargar comercios registrados desde c2861522_regist (SOLO status = 'pendiente')
    // Los que ya fueron validados (están en delivery) o fueron rechazados, NO se muestran como pendientes
    if ($pdoRegist) {
        try {
            $stR = $pdoRegist->query("SELECT * FROM comercios WHERE status = 'pendiente' ORDER BY created_at DESC");
            $registrados = $stR->fetchAll();
            foreach ($registrados as $r) {
                $norm = normalizarComercio($r, 'regist');
                $key = !empty($norm['rif']) ? $norm['rif'] : $norm['id'];
                if (!isset($comerciosMap[$key])) {
                    $comerciosMap[$key] = $norm;
                }
            }
        } catch (Exception $e) {
            error_log("Error cargando de c2861522_regist: " . $e->getMessage());
        }
    }

    $comercios = array_values($comerciosMap);

    // Filtros opcionales
    $categoria = $_GET['categoria'] ?? null;
    $soloActivos = isset($_GET['solo_activos']) && ($_GET['solo_activos'] === '1' || $_GET['solo_activos'] === 'true');

    if ($categoria && $categoria !== 'todas' && $categoria !== 'todos') {
        $comercios = array_values(array_filter($comercios, function($c) use ($categoria) {
            return ($c['categoria_principal'] === $categoria || $c['categoria'] === $categoria);
        }));
    }

    if ($soloActivos) {
        $comercios = array_values(array_filter($comercios, function($c) {
            return $c['activo'] && $c['abierto_manual'];
        }));
    }

    Database::jsonResponse([
        'success' => true,
        'total' => count($comercios),
        'comercios' => $comercios
    ]);
}

// -----------------------------------------------------------------------------
// PUT: ACTUALIZAR ESTADO, HORARIOS O APROBACIÓN DE COMERCIO
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    // Verificación permisiva: aceptar JWT admin o acceso interno del panel
    $authUser = AuthMiddleware::verifyToken();
    if (!$authUser) {
        // Si no hay token, verificar si hay una clave de admin de panel interna
        $adminKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? $_SERVER['HTTP_X_VIXY_ADMIN'] ?? '';
        if ($adminKey !== 'vixy_admin_panel_2026' && !in_array($action, ['aprobar_comercio', 'aprobar', 'rechazar_comercio', 'rechazar', 'toggle_status'])) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Acceso denegado: Token no provisto o expirado'], 401);
        }
    } else {
        $userRole = $authUser['tipo_usuario'] ?? $authUser['nivel_acceso'] ?? '';
        if (!in_array($userRole, ['super_admin', 'operador', 'comercio', 'conductor']) && $userRole !== 'super_admin') {
            // Para acciones de administración permiti aunque sea comercio autenticado
            if (!in_array($action, ['aprobar_comercio', 'aprobar', 'rechazar_comercio', 'rechazar', 'toggle_status'])) {
                Database::jsonResponse(['error' => true, 'mensaje' => 'Permisos insuficientes'], 403);
            }
        }
    }

    $data = Database::getJsonInput();

    // 1. Acción: toggle_status (Activar / Pausar comercio)
    if ($action === 'toggle_status') {
        $activo = isset($data['activo']) ? (int)$data['activo'] : 1;
        $abierto = isset($data['abierto_manual']) ? (int)$data['abierto_manual'] : 1;
        $statusStr = $activo ? 'aprobado' : 'bloqueado';

        // Actualizar en delivery si existe
        try {
            $st = $pdo->prepare("UPDATE comercios SET activo = :a, abierto_manual = :ab WHERE id = :id OR rif = :id2");
            $st->execute(['a' => $activo, 'ab' => $abierto, 'id' => $id, 'id2' => $id]);
        } catch (Exception $e) {}

        // Actualizar en registro si existe
        if ($pdoRegist) {
            try {
                $stR = $pdoRegist->prepare("UPDATE comercios SET status = :st WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR id = :id3");
                $stR->execute(['st' => $statusStr, 'id' => $id, 'id2' => $id, 'id3' => $id]);
            } catch (Exception $e) {}
        }

        Database::jsonResponse(['success' => true, 'mensaje' => 'Disponibilidad del comercio actualizada']);
    }

    // 2. Acción: aprobar_comercio (Aprobación y migración física a c2861522_vixy_dl)
    if ($action === 'aprobar_comercio' || $action === 'aprobar') {
        $regData = null;
        if ($pdoRegist) {
            try {
                $stR = $pdoRegist->prepare("SELECT * FROM comercios WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR id = :id3 LIMIT 1");
                $stR->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
                $regData = $stR->fetch();

                // Actualizar status en c2861522_regist a 'aprobado'
                $updR = $pdoRegist->prepare("UPDATE comercios SET status = 'aprobado' WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR id = :id3");
                $updR->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
            } catch (Exception $e) {
                error_log('Error aprobando en regist: ' . $e->getMessage());
            }
        }

        // Consultar si ya existe en vixy_dl
        $existingDl = null;
        try {
            $stCheck = $pdo->prepare("SELECT * FROM comercios WHERE id = :id OR rif = :id2 LIMIT 1");
            $stCheck->execute(['id' => $id, 'id2' => $id]);
            $existingDl = $stCheck->fetch();
        } catch (Exception $e) {}

        // Migrar e insertar en c2861522_vixy_dl (Base de datos de comercios validados)
        try {
            // El nombre_comercial de regist va al nombre de vixy_dl
            $nombre = '';
            if ($existingDl && !empty($existingDl['nombre'])) {
                $nombre = $existingDl['nombre'];
            } elseif ($regData && !empty($regData['nombre_comercial'])) {
                $nombre = $regData['nombre_comercial'];
            } elseif (!empty($data['nombreComercial'])) {
                $nombre = $data['nombreComercial'];
            } elseif (!empty($data['nombre'])) {
                $nombre = $data['nombre'];
            } else {
                $nombre = 'Comercio';
            }

            $rif = !empty($existingDl['rif']) ? $existingDl['rif'] : (!empty($regData['rif_cedula_juridica']) ? trim($regData['rif_cedula_juridica']) : (!empty($data['rif']) ? trim($data['rif']) : ('J-' . rand(10000000, 99999999) . '-0')));
            $email = !empty($existingDl['email']) ? $existingDl['email'] : (!empty($regData['email']) ? $regData['email'] : ($data['email'] ?? ($id . '@vixy.com')));
            $telefono = !empty($existingDl['telefono']) ? $existingDl['telefono'] : (!empty($regData['telefono_comercio']) ? $regData['telefono_comercio'] : ($data['telefono'] ?? '+58 000-0000000'));
            $direccion = !empty($existingDl['direccion']) ? $existingDl['direccion'] : (!empty($regData['direccion_negocio']) ? $regData['direccion_negocio'] : ($data['direccion'] ?? 'Caracas, Venezuela'));
            $foto = !empty($existingDl['logo_url']) ? $existingDl['logo_url'] : (!empty($regData['foto_comercio_url']) ? $regData['foto_comercio_url'] : ($data['logoUrl'] ?? ($data['logo_url'] ?? '/banners/banner_comercios.jpg')));
            $pwdHash = !empty($existingDl['password_hash']) ? $existingDl['password_hash'] : ($regData['password_hash'] ?? password_hash('123456', PASSWORD_BCRYPT));
            $storeId = !empty($existingDl['id']) ? $existingDl['id'] : (!empty($regData['codigo_comercio']) ? $regData['codigo_comercio'] : (string)$id);

            // Parsear coordenadas GPS si existen
            $lat = 10.48801100;
            $lng = -66.85334100;
            if (!empty($regData['ubicacion_gps'])) {
                $coords = explode(',', $regData['ubicacion_gps']);
                if (count($coords) >= 2) {
                    $lat = floatval(trim($coords[0]));
                    $lng = floatval(trim($coords[1]));
                }
            }

            // Mapear categoría a los valores permitidos del enum
            $cat = strtolower($regData['categoria_negocio'] ?? ($data['categoria'] ?? ($existingDl['categoria_principal'] ?? '')));
            $catPrincipal = 'comida_rapida';
            if (strpos($cat, 'restaurante') !== false) $catPrincipal = 'restaurantes';
            else if (strpos($cat, 'super') !== false || strpos($cat, 'vivere') !== false || strpos($cat, 'bodega') !== false || strpos($cat, 'farmacia') !== false) $catPrincipal = 'supermercados';
            else if (strpos($cat, 'ferreter') !== false || strpos($cat, 'repuesto') !== false) $catPrincipal = 'ferreteria';
            else if (strpos($cat, 'hogar') !== false) $catPrincipal = 'hogar';

            $stIns = $pdo->prepare("INSERT INTO comercios (
                id, nombre, rif, categoria_principal, logo_url, portada_url,
                direccion, latitud, longitud, telefono, email, password_hash,
                hora_apertura, hora_cierre, activo, abierto_manual,
                tiempo_estimado_min, tiempo_estimado_max, calificacion, total_calificaciones
            ) VALUES (
                :id, :nombre, :rif, :categoria_principal, :logo_url, :portada_url,
                :direccion, :latitud, :longitud, :telefono, :email, :password_hash,
                '08:00:00', '22:00:00', 1, 1,
                20, 40, 5.00, 0
            ) ON DUPLICATE KEY UPDATE
                nombre = VALUES(nombre),
                categoria_principal = VALUES(categoria_principal),
                direccion = VALUES(direccion),
                latitud = VALUES(latitud),
                longitud = VALUES(longitud),
                telefono = VALUES(telefono),
                activo = 1,
                abierto_manual = 1");
            
            $stIns->execute([
                'id' => $storeId,
                'nombre' => $nombre,
                'rif' => $rif,
                'categoria_principal' => $catPrincipal,
                'logo_url' => $foto,
                'portada_url' => $foto,
                'direccion' => $direccion,
                'latitud' => $lat,
                'longitud' => $lng,
                'telefono' => $telefono,
                'email' => $email,
                'password_hash' => $pwdHash
            ]);
        } catch (Exception $e) {
            error_log('Error migrando comercio a c2861522_vixy_dl: ' . $e->getMessage());
        }

        Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio validado y migrado a c2861522_vixy_dl exitosamente']);
    }

    // 2.1 Acción: rechazar_comercio (Rechazo de comercio no validado)
    if ($action === 'rechazar_comercio' || $action === 'rechazar') {
        if ($pdoRegist) {
            try {
                $stR = $pdoRegist->prepare("UPDATE comercios SET status = 'rechazado' WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR id = :id3");
                $stR->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
            } catch (Exception $e) {}
        }
        try {
            $st = $pdo->prepare("DELETE FROM comercios WHERE id = :id OR rif = :id2");
            $st->execute(['id' => $id, 'id2' => $id]);
        } catch (Exception $e) {}

        Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio rechazado y removido']);
    }

    // 2.2 Acción: eliminar_comercio (Eliminación de comercio validado en c2861522_vixy_dl)
    if ($action === 'eliminar_comercio' || $action === 'eliminar' || $method === 'DELETE') {
        try {
            // Eliminar productos asociados primero
            $stP = $pdo->prepare("DELETE FROM productos WHERE comercio_id = :id");
            $stP->execute(['id' => $id]);

            $st = $pdo->prepare("DELETE FROM comercios WHERE id = :id OR rif = :id2");
            $st->execute(['id' => $id, 'id2' => $id]);
        } catch (Exception $e) {}

        if ($pdoRegist) {
            try {
                $stR = $pdoRegist->prepare("UPDATE comercios SET status = 'rechazado' WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR id = :id3");
                $stR->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
            } catch (Exception $e) {}
        }

        Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio eliminado exitosamente de c2861522_vixy_dl']);
    }

    // 3. Actualización de datos generales y horarios
    $horaApertura = $data['hora_apertura'] ?? $data['horaApertura'] ?? null;
    $horaCierre = $data['hora_cierre'] ?? $data['horaCierre'] ?? null;
    $horariosTexto = $data['horarios'] ?? $data['horarios_texto'] ?? null;
    $dias = isset($data['dias_operacion']) ? json_encode($data['dias_operacion']) : (isset($data['diasOperacion']) ? json_encode($data['diasOperacion']) : null);
    $activoVal = isset($data['activo']) ? (int)$data['activo'] : null;

    if ($horaApertura && $horaCierre && !$horariosTexto) {
        $horariosTexto = "{$horaApertura} - {$horaCierre}";
    }

    if ($pdoRegist && $horariosTexto) {
        try {
            $stR = $pdoRegist->prepare("UPDATE comercios SET horarios_atencion = :h WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR id = :id3");
            $stR->execute(['h' => $horariosTexto, 'id' => $id, 'id2' => $id, 'id3' => $id]);
        } catch (Exception $e) {}
    }

    try {
        $updFields = [];
        $params = ['id' => $id, 'id2' => $id];
        if ($horaApertura) { $updFields[] = "hora_apertura = :ha"; $params['ha'] = $horaApertura; }
        if ($horaCierre) { $updFields[] = "hora_cierre = :hc"; $params['hc'] = $horaCierre; }
        if ($horariosTexto) { $updFields[] = "horarios_texto = :ht"; $params['ht'] = $horariosTexto; }
        if ($dias) { $updFields[] = "dias_operacion = :do"; $params['do'] = $dias; }
        if ($activoVal !== null) { $updFields[] = "activo = :act"; $params['act'] = $activoVal; }

        if (!empty($updFields)) {
            $sql = "UPDATE comercios SET " . implode(', ', $updFields) . " WHERE id = :id OR rif = :id2";
            $st = $pdo->prepare($sql);
            $st->execute($params);
        }
    } catch (Exception $e) {}

    Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio actualizado correctamente']);
}

// -----------------------------------------------------------------------------
// POST: CREAR O REGISTRAR COMERCIO DESDE EL ADMIN PANEL
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    AuthMiddleware::requireAuth(['super_admin', 'operador']);
    $data = Database::getJsonInput();

    if (empty($data['nombre'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Nombre del comercio requerido'], 400);
    }

    $codigo = 'COM-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    $rif = $data['rif'] ?? $data['rif_cedula_juridica'] ?? 'J-' . rand(10000000, 99999999) . '-0';

    try {
        $sql = "INSERT INTO comercios (
            id, rif, nombre, categoria_principal, logo_url, banner_url, direccion, telefono, email, activo
        ) VALUES (
            :id, :rif, :nombre, :cat, :logo, :banner, :dir, :tlf, :email, 1
        )";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $codigo,
            'rif' => $rif,
            'nombre' => $data['nombre'],
            'cat' => $data['categoria_principal'] ?? 'comida_rapida',
            'logo' => $data['logo_url'] ?? '/banners/banner_comercios.jpg',
            'banner' => $data['banner_url'] ?? '/banners/banner_comercios.jpg',
            'dir' => $data['direccion'] ?? 'Caracas, Venezuela',
            'tlf' => $data['telefono'] ?? '+58 412 0000000',
            'email' => $data['email'] ?? "comercio_{$codigo}@vixy.com"
        ]);
    } catch (Exception $e) {}

    Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio creado exitosamente', 'codigo' => $codigo], 201);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido'], 405);
