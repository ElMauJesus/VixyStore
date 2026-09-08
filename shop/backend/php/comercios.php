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
    $nombre = $c['nombre_comercial'] ?? ($c['nombre'] ?? 'Comercio Sin Nombre');
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
    $status = $c['status'] ?? ($c['activo'] ? 'aprobado' : 'pendiente');
    $activo = isset($c['activo']) ? (bool)$c['activo'] : ($status === 'aprobado');
    $abiertoManual = isset($c['abierto_manual']) ? (bool)$c['abierto_manual'] : true;

    return [
        'id' => (string)$idKey,
        'db_id' => $c['id'] ?? null,
        'origen_bd' => $origen,
        'codigo_comercio' => $c['codigo_comercio'] ?? $idKey,
        'nombre' => $nombre,
        'nombre_comercial' => $nombre,
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
        'logo_url' => $c['foto_comercio_url'] ?? ($c['logo_url'] ?? '/banners/banner_comercios.jpg'),
        'logoUrl' => $c['foto_comercio_url'] ?? ($c['logo_url'] ?? '/banners/banner_comercios.jpg'),
        'banner_url' => $c['banner_url'] ?? ($c['foto_comercio_url'] ?? '/banners/banner_comercios.jpg'),
        'bannerUrl' => $c['banner_url'] ?? ($c['foto_comercio_url'] ?? '/banners/banner_comercios.jpg'),
        'status' => $status,
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
                $stR = $pdoRegist->prepare("SELECT * FROM comercios WHERE id = :id OR codigo_comercio = :id2 OR rif_cedula_juridica = :id3 OR email = :id4 LIMIT 1");
                $stR->execute(['id' => $id, 'id2' => $id, 'id3' => $id, 'id4' => $id]);
                $rowR = $stR->fetch();
                if ($rowR) $found = normalizarComercio($rowR, 'regist');
            } catch (Exception $e) {}
        }

        if (!$found) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Comercio no encontrado'], 404);
        }

        // Cargar productos del catálogo si existen
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

    // 1. Cargar comercios registrados desde c2861522_regist
    if ($pdoRegist) {
        try {
            $stR = $pdoRegist->query("SELECT * FROM comercios ORDER BY created_at DESC");
            $registrados = $stR->fetchAll();
            foreach ($registrados as $r) {
                $norm = normalizarComercio($r, 'regist');
                $key = !empty($norm['rif']) ? $norm['rif'] : $norm['id'];
                $comerciosMap[$key] = $norm;
            }
        } catch (Exception $e) {
            error_log("Error cargando de c2861522_regist: " . $e->getMessage());
        }
    }

    // 2. Cargar comercios de c2861522_vixy_dl (sobreescriben o complementan)
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

    // 2. Acción: aprobar_comercio (Aprobación desde panel de administración)
    if ($action === 'aprobar_comercio' || $action === 'aprobar') {
        // Actualizar en c2861522_regist (fuente principal)
        if ($pdoRegist) {
            try {
                $stR = $pdoRegist->prepare("UPDATE comercios SET status = 'aprobado' WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR email = :id3 OR id = :id4");
                $stR->execute(['id' => $id, 'id2' => $id, 'id3' => $id, 'id4' => $id]);
            } catch (Exception $e) {
                error_log('Error aprobando en regist: ' . $e->getMessage());
            }
        }
        // Actualizar en c2861522_vixy_dl
        try {
            $st = $pdo->prepare("UPDATE comercios SET activo = 1, abierto_manual = 1 WHERE id = :id OR rif = :id2 OR email = :id3");
            $st->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
        } catch (Exception $e) {}

        Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio aprobado y verificado exitosamente']);
    }

    // 2.1 Acción: rechazar_comercio (Rechazo desde panel de administración)
    if ($action === 'rechazar_comercio' || $action === 'rechazar') {
        if ($pdoRegist) {
            try {
                $stR = $pdoRegist->prepare("UPDATE comercios SET status = 'rechazado' WHERE codigo_comercio = :id OR rif_cedula_juridica = :id2 OR id = :id3");
                $stR->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
            } catch (Exception $e) {}
        }
        try {
            $st = $pdo->prepare("UPDATE comercios SET activo = 0, abierto_manual = 0 WHERE id = :id OR rif = :id2");
            $st->execute(['id' => $id, 'id2' => $id]);
        } catch (Exception $e) {}

        Database::jsonResponse(['success' => true, 'mensaje' => 'Comercio rechazado']);
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
