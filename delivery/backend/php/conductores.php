<?php
/**
 * Vixy Delivery Platform - API Unificada de Conductores, GPS y Aprobaciones
 * Conexión Dual a Base de Datos de Operaciones (c2861522_vixy_dl) y Registro (c2861522_regist)
 * Soporte en tiempo real para Radar, Admin Panel (/shop/ y /admin/) y App Móvil
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$pdoRegist = Database::getRegistConnection();

$method = $_SERVER['REQUEST_METHOD'];
$inputData = Database::getJsonInput();
$id = $_GET['id'] ?? ($inputData['id'] ?? ($inputData['conductor_id'] ?? ($inputData['usuario_id'] ?? null)));
$action = $_GET['action'] ?? ($inputData['action'] ?? null);

/**
 * Normaliza los campos del conductor para garantizar compatibilidad total
 * con el Frontend React, Admin Panel JS compilado (index-BlGu1N_i.js), Radar Map y App móvil.
 */
function normalizarConductor($c, $origen = 'delivery') {
    $ced = strtoupper(trim($c['cedula'] ?? ''));
    $code = !empty($c['codigo_conductor'])
        ? $c['codigo_conductor']
        : (string)($c['id'] ?? ('DRV-' . md5($ced . ($c['telefono'] ?? ''))));

    $folderPath = "/shop/imgs-c-d/deliverys/{$code}";
    $avatar = trim($c['avatar_url'] ?? $c['foto_url'] ?? $c['foto_cedula_url'] ?? '');
    if (empty($avatar)) {
        $avatar = "{$folderPath}/foto_perfil.jpg";
    }

    $storedStatus = strtolower(trim((string)($c['status'] ?? '')));
    $estadoReg    = strtolower(trim((string)($c['estado_registro'] ?? '')));
    $verifAdmin   = isset($c['verificado_por_admin']) ? (int)$c['verificado_por_admin'] : null;

    // Determinar estado de aprobación de forma robusta
    if ($storedStatus === 'rechazado' || $estadoReg === 'rechazado') {
        $status = 'rechazado';
    } elseif ($storedStatus === 'suspendido' || $estadoReg === 'suspendido') {
        $status = 'suspendido';
    } elseif ($storedStatus === 'inactivo' || $estadoReg === 'inactivo') {
        $status = 'inactivo';
    } elseif ($storedStatus === 'pendiente' || $estadoReg === 'pendiente' || $estadoReg === 'pendiente_aprobacion' || $verifAdmin === 0) {
        $status = 'pendiente';
    } elseif (($storedStatus === 'aprobado' || $estadoReg === 'aprobado') || $verifAdmin === 1) {
        $status = 'aprobado';
    } else {
        $status = 'pendiente';
    }

    $isApproved = ($status === 'aprobado');
    $verificadoPorAdmin = $isApproved ? 1 : 0;
    $estadoRegistroFinal = ($status === 'rechazado') ? 'rechazado' : ($isApproved ? 'aprobado' : 'pendiente_aprobacion');

    // Telemetría GPS en tiempo real
    $latVal = isset($c['latitud_actual']) ? (float)$c['latitud_actual'] : (isset($c['lat']) ? (float)$c['lat'] : 0.0);
    $lngVal = isset($c['longitud_actual']) ? (float)$c['longitud_actual'] : (isset($c['lng']) ? (float)$c['lng'] : 0.0);

    // Si no tiene lat/lng pero tiene ubicacion_gps string (formato lat,lng)
    if (($latVal == 0.0 || $lngVal == 0.0) && !empty($c['ubicacion_gps'])) {
        $ubiParts = explode(',', (string)$c['ubicacion_gps']);
        if (count($ubiParts) >= 2) {
            $pLat = (float)trim($ubiParts[0]);
            $pLng = (float)trim($ubiParts[1]);
            if ($pLat != 0.0 && $pLng != 0.0) {
                $latVal = $pLat;
                $lngVal = $pLng;
            }
        }
    }

    // Coordenadas reales exclusivamente (sin valores de prueba / demo)
    $hasRealGps = ($latVal != 0.0 && $lngVal != 0.0);
    $rawLat = $hasRealGps ? $latVal : null;
    $rawLng = $hasRealGps ? $lngVal : null;
    $ubiSector = $hasRealGps
        ? (!empty($c['ubicacion_actual']) ? $c['ubicacion_actual'] : 'Ubicación GPS en vivo')
        : 'GPS Pendiente (Sin conexión)';

    // Billetera y saldos
    $saldoUsd = (float)($c['saldo_billetera_usd'] ?? $c['saldoUsd'] ?? 0.00);
    $limiteNegativo = (float)($c['limite_saldo_negativo'] ?? -0.50);
    $bloqueadoPorSaldo = (bool)($c['bloqueado_por_saldo'] ?? ($saldoUsd <= $limiteNegativo));

    // Disponibilidad operativa y estado en carrera
    $enCarrera = (bool)($c['en_carrera'] ?? false);
    // Un conductor aprobado, sin saldo bloqueado y con switch activo en BD es conductor disponible
    $isDispDb = !empty($c['disponible']);
    // Desconexión automática tras 5 minutos (300 segundos) sin señal GPS ni heartbeat (app cerrada o teléfono sin red)
    $segSinSenal = isset($c['seg_sin_senal']) && $c['seg_sin_senal'] !== null ? (int)$c['seg_sin_senal'] : null;
    $expiradoPorInactividad = ($segSinSenal !== null && $segSinSenal > 300 && !$enCarrera);
    $disponible = ($isApproved && !$bloqueadoPorSaldo && $isDispDb && !$expiradoPorInactividad);
    $enLinea = ($disponible || $enCarrera);

    return [
        'id'                    => $code,
        'has_real_gps'          => $hasRealGps,
        'hasRealGps'            => $hasRealGps,
        'tiene_gps_real'        => $hasRealGps,
        'db_id'                 => $c['id'] ?? null,
        'origen_bd'             => $origen,
        'codigo_conductor'      => $code,
        'codigoConductor'       => $code,
        'nombre'                => $c['nombre'] ?? 'Conductor',
        'apellido'              => $c['apellido'] ?? '',
        'cedula'                => $ced,
        'telefono'              => $c['telefono'] ?? '',
        'email'                 => $c['email'] ?? '',
        'avatar_url'            => $avatar,
        'foto_url'              => $avatar,
        'fotoUrl'               => $avatar,
        'disponible'            => $disponible,
        'en_carrera'            => $enCarrera,
        'enCarrera'             => $enCarrera,
        'en_linea'              => $enLinea,
        'enLinea'               => $enLinea,
        'latitud_actual'        => $rawLat,
        'longitud_actual'       => $rawLng,
        'ultima_actualizacion'  => $c['ultima_actualizacion'] ?? null,
        'lat'                   => $rawLat,
        'lng'                   => $rawLng,
        'latitud'               => $rawLat,
        'longitud'              => $rawLng,
        'ubicacion_actual'      => $ubiSector,
        'ubicacionActual'       => $ubiSector,
        'saldo_billetera_usd'   => $saldoUsd,
        'saldoUsd'              => $saldoUsd,
        'billetera'             => [
            'saldoUsd'            => $saldoUsd,
            'bloqueadoPorSaldo'   => $bloqueadoPorSaldo,
            'limiteSaldoNegativo' => $limiteNegativo
        ],
        'limite_saldo_negativo' => $limiteNegativo,
        'bloqueado_por_saldo'   => $bloqueadoPorSaldo,
        'rating'                => (float)($c['rating'] ?? 5.00),
        'calificacion'          => (float)($c['rating'] ?? 5.00),
        'total_carreras'        => (int)($c['total_carreras'] ?? 0),
        'totalViajes'           => (int)($c['total_carreras'] ?? 0),
        'placa_moto'            => strtoupper($c['placa_moto'] ?? $c['moto_placa'] ?? ''),
        'marca_moto'            => $c['marca_moto'] ?? $c['moto_marca'] ?? '',
        'modelo_moto'           => $c['modelo_moto'] ?? $c['moto_modelo'] ?? '',
        'ano_moto'              => $c['ano_moto'] ?? $c['moto_ano'] ?? '',
        'color_moto'            => $c['color_moto'] ?? $c['moto_color'] ?? '',
        'serial_motor'          => $c['serial_motor'] ?? $c['moto_serial_motor'] ?? '',
        'serial_chasis'         => $c['serial_chasis'] ?? $c['moto_serial_chasis'] ?? '',
        'moto'                  => [
            'marca'        => $c['marca_moto'] ?? $c['moto_marca'] ?? '',
            'modelo'       => $c['modelo_moto'] ?? $c['moto_modelo'] ?? '',
            'placa'        => strtoupper($c['placa_moto'] ?? $c['moto_placa'] ?? ''),
            'ano'          => (int)($c['ano_moto'] ?? $c['moto_ano'] ?? 0),
            'anio'         => (int)($c['ano_moto'] ?? $c['moto_ano'] ?? 0),
            'color'        => $c['color_moto'] ?? $c['moto_color'] ?? '',
            'serialMotor'  => $c['serial_motor'] ?? $c['moto_serial_motor'] ?? '',
            'serialChasis' => $c['serial_chasis'] ?? $c['moto_serial_chasis'] ?? ''
        ],
        'licencia_grado'        => $c['licencia_grado'] ?: ($c['licencia_conducir'] ?? '2da'),
        'status'                => $status,
        'estado_registro'       => $estadoRegistroFinal,
        'estado_verificacion'   => $status,
        'estadoVerificacion'    => $status,
        'verificado_por_admin'  => $verificadoPorAdmin,
        'validado'              => $isApproved,
        'carpeta_imagenes'      => !empty($c['carpeta_imagenes']) ? $c['carpeta_imagenes'] : $folderPath,
        'documentos'            => [
            'cedula'             => trim($c['foto_cedula_url'] ?? '') ?: null,
            'cedula_reverso'     => trim($c['foto_cedula_reverso_url'] ?? '') ?: null,
            'licencia'           => trim($c['foto_licencia_url'] ?? '') ?: null,
            'certificado_medico' => trim($c['foto_certificado_medico_url'] ?? '') ?: null,
            'carnet_circulacion' => trim($c['foto_carnet_circulacion_url'] ?? $c['foto_carnet_url'] ?? '') ?: null,
            'rcv'                => trim($c['foto_rcv_url'] ?? '') ?: null,
            'antecedentes'       => trim($c['foto_antecedentes_url'] ?? '') ?: null,
            'foto_perfil'        => trim($c['foto_perfil_url'] ?? '') ?: $avatar
        ]
    ];
}

// -----------------------------------------------------------------------------
// PUT / POST: APROBAR CONDUCTOR DESDE EL ADMIN PANEL
// -----------------------------------------------------------------------------
if (($method === 'PUT' || $method === 'POST') && in_array($action, ['aprobar_conductor', 'aprobar', 'approve'], true)) {
    AuthMiddleware::requireAdmin(['super_admin', 'operador', 'admin']);
    $data = Database::getJsonInput();
    $driverId = trim((string)($_GET['id'] ?? $_POST['id'] ?? $data['conductor_id'] ?? $data['id'] ?? $data['cedula'] ?? $id ?? ''));

    if (!$driverId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'ID de conductor requerido'], 400);
    }

    $idDigits = preg_replace('/[^0-9]/', '', $driverId);

    // 1. Si existe en c2861522_regist, marcar como aprobado
    if ($pdoRegist) {
        try {
            $stR = $pdoRegist->prepare("
                UPDATE conductores 
                SET status = 'aprobado' 
                WHERE codigo_conductor = :id 
                   OR id = :id2 
                   OR cedula = :id3
                   OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
            ");
            $stR->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId, 'digits' => $idDigits]);
        } catch (Exception $e) {
            error_log('Error aprobando en regist: ' . $e->getMessage());
        }
    }

    // 2. Columnas disponibles en c2861522_vixy_dl
    $dlColumns = [];
    try {
        $colsStmt = $pdo->query('SHOW COLUMNS FROM conductores');
        $dlColumns = array_column($colsStmt->fetchAll(), 'Field');
    } catch (Exception $e) {}

    // 3. Buscar si ya existe en c2861522_vixy_dl
    try {
        $stCheck = $pdo->prepare("
            SELECT * FROM conductores 
            WHERE id = :id 
               OR cedula = :id2
               OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
            LIMIT 1
        ");
        $stCheck->execute(['id' => $driverId, 'id2' => $driverId, 'digits' => $idDigits]);
        $existingDl = $stCheck->fetch();
    } catch (Exception $e) {
        $existingDl = null;
    }

        if ($existingDl) {
        // Actualizar aprobación en c2861522_vixy_dl
        try {
            $updSets = ["disponible = 1", "bloqueado_por_saldo = 0", "ultima_actualizacion = NOW()"];
            $updVals = ['id' => $existingDl['id']];

            if (in_array('estado_registro', $dlColumns, true))      $updSets[] = "estado_registro = 'aprobado'";
            if (in_array('verificado_por_admin', $dlColumns, true)) $updSets[] = "verificado_por_admin = 1";
            if (in_array('status', $dlColumns, true))               $updSets[] = "status = 'aprobado'";
            if (in_array('fecha_aprobacion', $dlColumns, true))     $updSets[] = "fecha_aprobacion = NOW()";

            $sqlUpd = "UPDATE conductores SET " . implode(', ', $updSets) . " WHERE id = :id";
            $pdo->prepare($sqlUpd)->execute($updVals);
        } catch (Exception $e) {
            error_log('Error actualizando aprobación en vixy_dl: ' . $e->getMessage());
        }
    } else if ($pdoRegist) {
        // Si no estaba aún en vixy_dl pero está en regist, crearlo en vixy_dl ya aprobado
        try {
            $stRFind = $pdoRegist->prepare("SELECT * FROM conductores WHERE codigo_conductor = :id OR cedula = :id2 OR id = :id3 LIMIT 1");
            $stRFind->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId]);
            $rRow = $stRFind->fetch();
            if ($rRow) {
                $code = !empty($rRow['codigo_conductor']) ? $rRow['codigo_conductor'] : ('DRV-' . $rRow['id']);
                $insDl = [
                    'id'                   => $code,
                    'codigo_conductor'     => $code,
                    'nombre'               => $rRow['nombre'] ?? '',
                    'apellido'             => $rRow['apellido'] ?? '',
                    'cedula'               => $rRow['cedula'] ?? '',
                    'telefono'             => $rRow['telefono'] ?? '',
                    'email'                => $rRow['email'] ?? '',
                    'foto_url'             => $rRow['foto_url'] ?? ($rRow['foto_perfil_url'] ?? null),
                    'placa_moto'           => strtoupper($rRow['moto_placa'] ?? ''),
                    'marca_moto'           => $rRow['moto_marca'] ?? '',
                    'modelo_moto'          => $rRow['moto_modelo'] ?? '',
                    'ano_moto'             => $rRow['moto_ano'] ?? '',
                    'color_moto'           => $rRow['moto_color'] ?? '',
                    'licencia_grado'       => $rRow['licencia_grado'] ?? '2da',
                    'licencia_conducir'    => $rRow['licencia_conducir'] ?? '2da',
                    'disponible'           => 1,
                    'en_carrera'           => 0,
                    'saldo_billetera_usd'  => 0.00,
                    'limite_saldo_negativo'=> -0.50,
                    'bloqueado_por_saldo'  => 0,
                    'status'               => 'aprobado',
                    'estado_registro'      => 'aprobado',
                    'verificado_por_admin' => 1,
                    'ultima_actualizacion' => date('Y-m-d H:i:s')
                ];
                $insDl = array_intersect_key($insDl, array_flip($dlColumns));
                $colNamesDl = array_keys($insDl);
                $pdo->prepare("INSERT INTO conductores (`" . implode('`, `', $colNamesDl) . "`) VALUES (:" . implode(', :', $colNamesDl) . ")")->execute($insDl);
            }
        } catch (Throwable $eSyncDl) {
            error_log('Error copiando conductor aprobado a vixy_dl: ' . $eSyncDl->getMessage());
        }
    }

    Database::jsonResponse([
        'success' => true,
        'estado' => 'aprobado',
        'mensaje' => 'Conductor aprobado y verificado exitosamente.'
    ]);
}

// -----------------------------------------------------------------------------
// PUT / POST: RECHAZAR CONDUCTOR DESDE EL ADMIN PANEL
// -----------------------------------------------------------------------------
if (($method === 'PUT' || $method === 'POST') && in_array($action, ['rechazar_conductor', 'rechazar', 'reject'], true)) {
    AuthMiddleware::requireAdmin(['super_admin', 'operador', 'admin']);
    $data = Database::getJsonInput();
    $driverId = trim((string)($_GET['id'] ?? $_POST['id'] ?? $data['conductor_id'] ?? $data['id'] ?? $data['cedula'] ?? $id ?? ''));

    if (!$driverId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'ID de conductor requerido'], 400);
    }

    $idDigits = preg_replace('/[^0-9]/', '', $driverId);

    if ($pdoRegist) {
        try {
            $stR = $pdoRegist->prepare("
                UPDATE conductores 
                SET status = 'rechazado' 
                WHERE codigo_conductor = :id 
                   OR id = :id2 
                   OR cedula = :id3
                   OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
            ");
            $stR->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId, 'digits' => $idDigits]);
        } catch (Exception $e) {}
    }

    try {
        $stD = $pdo->prepare("
            UPDATE conductores 
            SET verificado_por_admin = 0, estado_registro = 'rechazado', disponible = 0 
            WHERE id = :id 
               OR cedula = :id2
               OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
        ");
        $stD->execute(['id' => $driverId, 'id2' => $driverId, 'digits' => $idDigits]);
    } catch (Exception $e) {}

    Database::jsonResponse(['success' => true, 'estado' => 'rechazado', 'mensaje' => 'Conductor rechazado correctamente.']);
}

// -----------------------------------------------------------------------------
// POST: PRE-REGISTRO / REGISTRO DE CONDUCTORES (WEB Y APP) -> DUAL DATABASE
// -----------------------------------------------------------------------------
if ($method === 'POST' && in_array($action, ['pre_registro', 'registro', 'register_driver'], true)) {
    $isMultipart = !empty($_FILES) || !empty($_POST);
    $data = $isMultipart ? $_POST : Database::getJsonInput();

    $nombre    = trim($data['nombre'] ?? '');
    $apellido  = trim($data['apellido'] ?? '');
    $cedula    = strtoupper(trim($data['cedula'] ?? ''));
    $telefono  = trim($data['telefono'] ?? '');
    $email     = trim($data['email'] ?? '');
    $direccion = trim($data['direccion'] ?? ($data['direccion_habitual'] ?? ''));
    $fnac      = trim($data['fecha_nacimiento'] ?? '');

    $motoMarca        = trim($data['moto_marca'] ?? ($data['marca_moto'] ?? ''));
    $motoModelo       = trim($data['moto_modelo'] ?? ($data['modelo_moto'] ?? ''));
    $motoColor        = trim($data['moto_color'] ?? ($data['color_moto'] ?? ''));
    $motoPlaca        = strtoupper(trim($data['moto_placa'] ?? ($data['placa_moto'] ?? '')));
    $motoAno          = trim($data['moto_ano'] ?? ($data['ano_moto'] ?? date('Y')));
    $motoSerialMotor  = trim($data['moto_serial_motor'] ?? '');
    $motoSerialChasis = trim($data['moto_serial_chasis'] ?? '');

    $licencia       = trim($data['licencia_conducir'] ?? ($data['licencia'] ?? '2da'));
    $licenciaGrado  = trim($data['licencia_grado'] ?? '2da');
    $licenciaVenc   = trim($data['licencia_vencimiento'] ?? '');
    $tipoSangre     = trim($data['tipo_sangre'] ?? '');
    $certMedNro     = trim($data['certificado_medico_nro'] ?? '');
    $certMedVenc    = trim($data['certificado_medico_vencimiento'] ?? '');
    $rcvAseg        = trim($data['rcv_aseguradora'] ?? '');
    $rcvPoliza      = trim($data['rcv_poliza_nro'] ?? '');
    $rcvVenc        = trim($data['rcv_vencimiento'] ?? '');
    $passwordInput  = trim($data['password'] ?? ($data['clave'] ?? ''));

    if (empty($nombre) || empty($cedula) || empty($telefono)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Nombre, cédula y teléfono son obligatorios'], 400);
    }

    $idDigits = preg_replace('/[^0-9]/', '', $cedula);
    $ubicacionGps = trim($data['ubicacion_gps'] ?? ($data['ubicacion'] ?? ''));
    $latInit = null;
    $lngInit = null;
    if (!empty($ubicacionGps)) {
        $uParts = explode(',', $ubicacionGps);
        if (count($uParts) >= 2) {
            $pLat = (float)trim($uParts[0]);
            $pLng = (float)trim($uParts[1]);
            if ($pLat != 0.0 && $pLng != 0.0) {
                $latInit = $pLat;
                $lngInit = $pLng;
            }
        }
    }
    $codigoConductor = !empty($data['codigo_conductor']) 
        ? trim($data['codigo_conductor'])
        : ('DRV-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)));

    $passwordTemporal = !empty($passwordInput) ? $passwordInput : substr(bin2hex(random_bytes(4)), 0, 8);
    $passwordHash = password_hash($passwordTemporal, PASSWORD_BCRYPT);

    // Guardar archivos si vienen adjuntos
    $uploadSubDir = '/uploads/conductores/' . $codigoConductor . '/';
    $targetDir = __DIR__ . $uploadSubDir;
    if (!is_dir($targetDir)) {
        @mkdir($targetDir, 0777, true);
    }

    $docUrls = [
        'foto_perfil'        => null,
        'cedula_anverso'     => null,
        'cedula_reverso'     => null,
        'licencia'           => null,
        'rcv'                => null,
        'cert_medico'        => null,
        'carnet_circulacion' => null,
        'antecedentes'       => null,
        'foto_vehiculo'      => null,
        'foto_placa'         => null
    ];

    $docMapping = [
        'foto_perfil'           => ['foto_perfil', 'foto_perfil_url', 'avatar'],
        'cedula_anverso'        => ['cedula_anverso', 'foto_cedula', 'cedula_identidad', 'foto_cedula_url'],
        'cedula_reverso'        => ['cedula_reverso', 'foto_cedula_reverso', 'foto_cedula_reverso_url'],
        'licencia'              => ['licencia', 'licencia_conducir', 'foto_licencia_url'],
        'rcv'                   => ['rcv', 'poliza_rcv', 'foto_rcv_url'],
        'cert_medico'           => ['cert_medico', 'certificado_medico', 'foto_certificado_medico_url'],
        'carnet_circulacion'    => ['carnet_circulacion', 'foto_carnet_url', 'foto_carnet_circulacion_url'],
        'antecedentes'          => ['antecedentes', 'foto_antecedentes_url'],
        'foto_vehiculo'         => ['foto_vehiculo', 'foto_vehiculo_url'],
        'foto_placa'            => ['foto_placa', 'foto_placa_url']
    ];

    if (!empty($_FILES)) {
        foreach ($docMapping as $targetKey => $aliases) {
            foreach ($aliases as $alias) {
                if (!empty($_FILES[$alias]['tmp_name']) && is_uploaded_file($_FILES[$alias]['tmp_name'])) {
                    $ext = strtolower(pathinfo($_FILES[$alias]['name'], PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'pdf'], true)) {
                        $filename = $targetKey . '_' . time() . '.' . $ext;
                        if (@move_uploaded_file($_FILES[$alias]['tmp_name'], $targetDir . $filename)) {
                            $docUrls[$targetKey] = '/api' . $uploadSubDir . $filename;
                            break;
                        }
                    }
                }
            }
        }
    }

    $avatarUrl = $docUrls['foto_perfil'] ?: ($docUrls['cedula_anverso'] ?: '');

    // 1. INSERTAR O ACTUALIZAR EN c2861522_regist (Pre-registros)
    if ($pdoRegist) {
        try {
            $colsReg = array_column($pdoRegist->query('SHOW COLUMNS FROM conductores')->fetchAll(), 'Field');
            $stCheckR = $pdoRegist->prepare("SELECT id FROM conductores WHERE cedula = :c OR telefono = :t OR codigo_conductor = :cod LIMIT 1");
            $stCheckR->execute(['c' => $cedula, 't' => $telefono, 'cod' => $codigoConductor]);
            $existingR = $stCheckR->fetch();

            if (!$existingR) {
                $insR = [
                    'codigo_conductor'              => $codigoConductor,
                    'password_hash'                 => $passwordHash,
                    'nombre'                        => $nombre,
                    'apellido'                      => $apellido,
                    'cedula'                        => $cedula,
                    'telefono'                      => $telefono,
                    'email'                         => $email,
                    'fecha_nacimiento'              => $fnac ?: null,
                    'direccion'                     => $direccion,
                    'moto_marca'                    => $motoMarca,
                    'moto_modelo'                   => $motoModelo,
                    'moto_color'                    => $motoColor,
                    'moto_placa'                    => $motoPlaca,
                    'moto_ano'                      => $motoAno,
                    'moto_serial_motor'             => $motoSerialMotor ?: null,
                    'moto_serial_chasis'            => $motoSerialChasis ?: null,
                    'licencia_conducir'             => $licencia,
                    'foto_url'                      => $avatarUrl ?: null,
                    'tipo_sangre'                   => $tipoSangre ?: null,
                    'licencia_grado'                => $licenciaGrado ?: null,
                    'licencia_vencimiento'          => $licenciaVenc ?: null,
                    'certificado_medico_nro'        => $certMedNro ?: null,
                    'certificado_medico_vencimiento'=> $certMedVenc ?: null,
                    'rcv_aseguradora'               => $rcvAseg ?: null,
                    'rcv_poliza_nro'                => $rcvPoliza ?: null,
                    'rcv_vencimiento'               => $rcvVenc ?: null,
                    'carpeta_imagenes'              => $targetDir,
                    'foto_perfil_url'               => $docUrls['foto_perfil'],
                    'foto_cedula_url'               => $docUrls['cedula_anverso'],
                    'foto_cedula_reverso_url'       => $docUrls['cedula_reverso'],
                    'foto_licencia_url'             => $docUrls['licencia'],
                    'foto_carnet_url'               => $docUrls['carnet_circulacion'],
                    'foto_certificado_medico_url'   => $docUrls['cert_medico'],
                    'foto_rcv_url'                  => $docUrls['rcv'],
                    'foto_antecedentes_url'         => $docUrls['antecedentes'],
                    'status'                        => 'pendiente'
                ];
                $insR = array_intersect_key($insR, array_flip($colsReg));
                $colNamesR = array_keys($insR);
                $pdoRegist->prepare("INSERT INTO conductores (`" . implode('`, `', $colNamesR) . "`) VALUES (:" . implode(', :', $colNamesR) . ")")->execute($insR);
            } else {
                $updR = $pdoRegist->prepare("UPDATE conductores SET password_hash = :phash, status = 'pendiente', verificado_por_admin = 0 WHERE id = :id");
                $updR->execute(['phash' => $passwordHash, 'id' => $existingR['id']]);
                $codigoConductor = !empty($existingR['codigo_conductor']) ? $existingR['codigo_conductor'] : $codigoConductor;
            }
        } catch (Throwable $eR) {
            error_log('Error guardando en c2861522_regist: ' . $eR->getMessage());
        }
    }

    // 2. INSERTAR O ACTUALIZAR EN c2861522_vixy_dl (Operaciones y Radar)
    try {
        $colsDl = array_column($pdo->query('SHOW COLUMNS FROM conductores')->fetchAll(), 'Field');
        $stCheckDl = $pdo->prepare("SELECT id FROM conductores WHERE cedula = :c OR telefono = :t OR id = :id2 OR codigo_conductor = :cod LIMIT 1");
        $stCheckDl->execute(['c' => $cedula, 't' => $telefono, 'id2' => $codigoConductor, 'cod' => $codigoConductor]);
        $existingDl = $stCheckDl->fetch();

        if (!$existingDl) {
            $insDl = [
                'id'                             => $codigoConductor,
                'codigo_conductor'               => $codigoConductor,
                'nombre'                         => $nombre,
                'apellido'                       => $apellido,
                'cedula'                         => $cedula,
                'telefono'                       => $telefono,
                'email'                          => $email,
                'password_hash'                  => $passwordHash,
                'foto_url'                       => $avatarUrl ?: null,
                'placa_moto'                     => $motoPlaca,
                'marca_moto'                     => $motoMarca,
                'modelo_moto'                    => $motoModelo,
                'ano_moto'                       => $motoAno,
                'color_moto'                     => $motoColor,
                'latitud_actual'                 => $latInit,
                'longitud_actual'                => $lngInit,
                'ubicacion_actual'               => $ubicacionGps ?: null,
                'moto_serial_motor'              => $motoSerialMotor ?: null,
                'moto_serial_chasis'             => $motoSerialChasis ?: null,
                'licencia_grado'                 => $licenciaGrado,
                'licencia_conducir'              => $licencia,
                'disponible'                     => 0,
                'en_carrera'                     => 0,
                'saldo_billetera_usd'            => 0.00,
                'limite_saldo_negativo'          => -0.50,
                'bloqueado_por_saldo'            => 0,
                'status'                         => 'pendiente',
                'estado_registro'                => 'pendiente_aprobacion',
                'verificado_por_admin'           => 0,
                'carpeta_imagenes'               => $targetDir,
                'foto_perfil_url'                => $docUrls['foto_perfil'],
                'foto_cedula_url'                => $docUrls['cedula_anverso'],
                'foto_cedula_reverso_url'        => $docUrls['cedula_reverso'],
                'foto_licencia_url'              => $docUrls['licencia'],
                'foto_carnet_url'                => $docUrls['carnet_circulacion'],
                'foto_carnet_circulacion_url'    => $docUrls['carnet_circulacion'],
                'foto_certificado_medico_url'    => $docUrls['cert_medico'],
                'foto_rcv_url'                   => $docUrls['rcv'],
                'foto_antecedentes_url'          => $docUrls['antecedentes'],
                'foto_vehiculo_url'              => $docUrls['foto_vehiculo'],
                'foto_placa_url'                 => $docUrls['foto_placa'],
                'ultima_actualizacion'           => date('Y-m-d H:i:s')
            ];
            $insDl = array_intersect_key($insDl, array_flip($colsDl));
            $colNamesDl = array_keys($insDl);
            $pdo->prepare("INSERT INTO conductores (`" . implode('`, `', $colNamesDl) . "`) VALUES (:" . implode(', :', $colNamesDl) . ")")->execute($insDl);
        } else {
            $pdo->prepare("UPDATE conductores SET password_hash = :phash, status = 'pendiente', estado_registro = 'pendiente_aprobacion', verificado_por_admin = 0, disponible = 0 WHERE id = :id")
                ->execute(['phash' => $passwordHash, 'id' => $existingDl['id']]);
        }
    } catch (Throwable $eDl) {
        error_log('Error guardando en c2861522_vixy_dl: ' . $eDl->getMessage());
    }

    Database::jsonResponse([
        'success'           => true,
        'mensaje'           => 'Registro de conductor recibido exitosamente. Un administrador revisará tu documentación para su aprobación.',
        'codigo_conductor'  => $codigoConductor,
        'codigoConductor'   => $codigoConductor,
        'password_temporal' => $passwordTemporal,
        'cedula'            => $cedula
    ], 201);
}

// -----------------------------------------------------------------------------
// POST / PUT: ACTUALIZAR DISPONIBILIDAD (EN LÍNEA / DESCONECTADO)
// -----------------------------------------------------------------------------
if (($method === 'POST' || $method === 'PUT') && $action === 'disponibilidad') {
    $authUser = AuthMiddleware::verifyToken();
    $data = Database::getJsonInput();
    $driverId = trim((string)($data['conductor_id'] ?? $data['id'] ?? ($data['usuario_id'] ?? ($data['driver_id'] ?? ($data['codigo_conductor'] ?? ($data['cedula'] ?? ($authUser['id'] ?? ($authUser['sub'] ?? ''))))))));
    $disponible = isset($data['disponible']) ? (int)(bool)$data['disponible'] : (isset($data['online']) ? (int)(bool)$data['online'] : (isset($data['is_online']) ? (int)(bool)$data['is_online'] : (isset($data['activo']) ? (int)(bool)$data['activo'] : 1)));
    $idDigits = preg_replace('/[^0-9]/', '', $driverId);

    if (!empty($driverId)) {
        // 1. Actualizar en vixy_dl
        try {
            $stmt = $pdo->prepare("
                UPDATE conductores 
                SET disponible = :disp, ultima_actualizacion = NOW() 
                WHERE id = :id 
                   OR cedula = :id2 
                   OR codigo_conductor = :id3
                   OR telefono = :id4
                   OR email = :id5
                   OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
            ");
            $stmt->execute([
                'disp' => $disponible, 
                'id' => $driverId, 
                'id2' => $driverId, 
                'id3' => $driverId, 
                'id4' => $driverId, 
                'id5' => $driverId, 
                'digits' => $idDigits
            ]);
            $updatedRows = $stmt->rowCount();

            // Si no se encontró por ID directo pero existe en regist, buscar su cédula y actualizar en vixy_dl
            if ($updatedRows === 0 && $pdoRegist) {
                $stR = $pdoRegist->prepare("SELECT cedula FROM conductores WHERE id = :id OR codigo_conductor = :cod LIMIT 1");
                $stR->execute(['id' => $driverId, 'cod' => $driverId]);
                $rCed = $stR->fetchColumn();
                if ($rCed) {
                    $rDigits = preg_replace('/[^0-9]/', '', $rCed);
                    $pdo->prepare("
                        UPDATE conductores 
                        SET disponible = :disp, ultima_actualizacion = NOW() 
                        WHERE cedula = :c OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
                    ")->execute(['disp' => $disponible, 'c' => $rCed, 'digits' => $rDigits]);
                }
            }
        } catch (Exception $e) {
            error_log('Error actualizando disponibilidad en vixy_dl: ' . $e->getMessage());
        }

        // 2. Actualizar en regist si la columna existe
        if ($pdoRegist) {
            try {
                $regCols = array_column($pdoRegist->query('SHOW COLUMNS FROM conductores')->fetchAll(), 'Field');
                if (in_array('disponible', $regCols, true)) {
                    $stmtR = $pdoRegist->prepare("
                        UPDATE conductores 
                        SET disponible = :disp, updated_at = NOW() 
                        WHERE id = :id 
                           OR cedula = :id2 
                           OR codigo_conductor = :id3
                           OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
                    ");
                    $stmtR->execute(['disp' => $disponible, 'id' => $driverId, 'id2' => $driverId, 'id3' => $driverId, 'digits' => $idDigits]);
                }
            } catch (Throwable $_tR) {}
        }
    }

    Database::jsonResponse([
        'success' => true,
        'disponible' => (bool)$disponible,
        'mensaje' => $disponible ? 'Conductor en línea para recibir viajes' : 'Conductor desconectado'
    ]);
}

// -----------------------------------------------------------------------------
// POST / PUT: BORRAR GPS AL CERRAR SESIÓN O PAUSAR (QUITAR MARCADOR DEL RADAR)
// -----------------------------------------------------------------------------
if (($method === 'POST' || $method === 'PUT') && $action === 'gps_clear') {
    $authUser = AuthMiddleware::verifyToken();
    $data = Database::getJsonInput();
    $driverId = trim((string)($data['conductor_id'] ?? $data['id'] ?? ($data['usuario_id'] ?? ($data['driver_id'] ?? ($data['codigo_conductor'] ?? ($data['cedula'] ?? ($authUser['id'] ?? ($authUser['sub'] ?? ''))))))));
    $idDigits = preg_replace('/[^0-9]/', '', $driverId);

    if (!empty($driverId)) {
        try {
            $pdo->prepare("
                UPDATE conductores 
                SET latitud_actual = NULL,
                    longitud_actual = NULL,
                    disponible = 0,
                    ultima_actualizacion = NOW()
                WHERE id = :id 
                   OR cedula = :id2 
                   OR codigo_conductor = :id3
                   OR telefono = :id4
                   OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
            ")->execute([
                'id' => $driverId, 'id2' => $driverId,
                'id3' => $driverId, 'id4' => $driverId,
                'digits' => $idDigits
            ]);
        } catch (Exception $e) {
            error_log('Error limpiando GPS en vixy_dl: ' . $e->getMessage());
        }
    }

    Database::jsonResponse(['success' => true, 'mensaje' => 'GPS y disponibilidad limpiados del radar']);
}

// -----------------------------------------------------------------------------
// POST / PUT: ACTUALIZAR UBICACIÓN GPS EN TIEMPO REAL (TELEMETRÍA PARA RADAR)
// -----------------------------------------------------------------------------
if (($method === 'POST' || $method === 'PUT') && $action === 'gps') {
    $authUser = AuthMiddleware::verifyToken();
    $data = Database::getJsonInput();

    $driverId = trim((string)($data['conductor_id'] ?? $data['id'] ?? ($data['usuario_id'] ?? ($data['driver_id'] ?? ($data['codigo_conductor'] ?? ($data['cedula'] ?? ($authUser['id'] ?? ($authUser['sub'] ?? ''))))))));
    $lat = (float)($data['latitud'] ?? ($data['lat'] ?? ($data['latitude'] ?? 0)));
    $lng = (float)($data['longitud'] ?? ($data['lng'] ?? ($data['longitude'] ?? 0)));
    $precision = (float)($data['precision_metros'] ?? ($data['precision'] ?? ($data['accuracy'] ?? 5)));
    $velocidad = (float)($data['velocidad_kmh'] ?? ($data['velocidad'] ?? ($data['speed'] ?? 0)));
    $pedidoId = $data['pedido_id'] ?? null;

    if ($lat == 0.0 || $lng == 0.0) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Coordenadas GPS inválidas'], 400);
    }

    $idDigits = preg_replace('/[^0-9]/', '', $driverId);
    if (!empty($driverId)) {
        $updatedRows = 0;
        try {
            // Si el conductor envía coordenadas GPS está claramente en línea → siempre activar disponible = 1.
            // Esto resuelve el problema donde el cleanup de la BD borraba al conductor y el GPS
            // no lo volvía a activar por el CASE condicional anterior.
            $stmtUpdate = $pdo->prepare("
                UPDATE conductores 
                SET latitud_actual = :lat, 
                    longitud_actual = :lng, 
                    ultima_actualizacion = NOW(),
                    disponible = 1
                WHERE id = :id 
                   OR cedula = :id2 
                   OR codigo_conductor = :id3
                   OR telefono = :id4
                   OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
            ");
            $stmtUpdate->execute([
                'lat' => $lat, 
                'lng' => $lng, 
                'id' => $driverId, 
                'id2' => $driverId, 
                'id3' => $driverId, 
                'id4' => $driverId, 
                'digits' => $idDigits
            ]);
            $updatedRows = $stmtUpdate->rowCount();
        } catch (Exception $e) {
            error_log('Error actualizando GPS en vixy_dl: ' . $e->getMessage());
        }

        // Si no se encontró por ID directo, buscar en regist y sincronizar/actualizar en vixy_dl
        if ($updatedRows === 0 && $pdoRegist) {
            try {
                $stRFind = $pdoRegist->prepare("
                    SELECT * FROM conductores 
                    WHERE id = :id OR cedula = :id2 OR codigo_conductor = :id3 
                       OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
                    LIMIT 1
                ");
                $stRFind->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId, 'digits' => $idDigits]);
                $rRow = $stRFind->fetch();
                if ($rRow && !empty($rRow['cedula'])) {
                    $rCed = $rRow['cedula'];
                    $rDigits = preg_replace('/[^0-9]/', '', $rCed);
                    $stUpdByCed = $pdo->prepare("
                        UPDATE conductores 
                        SET latitud_actual = :lat, longitud_actual = :lng, disponible = 1, ultima_actualizacion = NOW() 
                        WHERE cedula = :c OR (:digits != '' AND REPLACE(REPLACE(REPLACE(cedula, 'V-', ''), '-', ''), ' ', '') = :digits)
                    ");
                    $stUpdByCed->execute(['lat' => $lat, 'lng' => $lng, 'c' => $rCed, 'digits' => $rDigits]);
                    $updatedRows = $stUpdByCed->rowCount();
                }

                if ($updatedRows === 0 && $rRow) {
                    $dlCols = array_column($pdo->query('SHOW COLUMNS FROM conductores')->fetchAll(), 'Field');
                    $code = !empty($rRow['codigo_conductor']) ? $rRow['codigo_conductor'] : ('DRV-' . $rRow['id']);
                    $insDl = [
                        'id'                   => $code,
                        'codigo_conductor'     => $code,
                        'nombre'               => $rRow['nombre'] ?? 'Conductor',
                        'apellido'             => $rRow['apellido'] ?? '',
                        'cedula'               => $rRow['cedula'] ?? '',
                        'telefono'             => $rRow['telefono'] ?? '',
                        'email'                => $rRow['email'] ?? '',
                        'foto_url'             => $rRow['foto_url'] ?? null,
                        'placa_moto'           => strtoupper($rRow['moto_placa'] ?? ''),
                        'marca_moto'           => $rRow['moto_marca'] ?? '',
                        'modelo_moto'          => $rRow['moto_modelo'] ?? '',
                        'ano_moto'             => $rRow['moto_ano'] ?? '',
                        'color_moto'           => $rRow['moto_color'] ?? '',
                        'latitud_actual'       => $lat,
                        'longitud_actual'      => $lng,
                        'disponible'           => 1,
                        'en_carrera'           => 0,
                        'saldo_billetera_usd'  => 0.00,
                        'limite_saldo_negativo'=> -0.50,
                        'bloqueado_por_saldo'  => 0,
                        'status'               => 'aprobado',
                        'estado_registro'      => 'aprobado',
                        'verificado_por_admin' => 1,
                        'ultima_actualizacion' => date('Y-m-d H:i:s')
                    ];
                    $insDl = array_intersect_key($insDl, array_flip($dlCols));
                    $colNamesDl = array_keys($insDl);
                    $pdo->prepare("INSERT INTO conductores (`" . implode('`, `', $colNamesDl) . "`) VALUES (:" . implode(', :', $colNamesDl) . ")")->execute($insDl);
                }
            } catch (Throwable $_tSync) {
                error_log('Error auto-sincronizando conductor con GPS a vixy_dl: ' . $_tSync->getMessage());
            }
        }

        // Registrar en historial de telemetría GPS
        try {
            $stmtHist = $pdo->prepare("
                INSERT INTO ubicaciones_gps_conductores (
                    conductor_id, pedido_id, latitud, longitud, precision_metros, velocidad_kmh
                ) VALUES (
                    :cid, :pid, :lat, :lng, :prec, :vel
                )
            ");
            $stmtHist->execute([
                'cid' => $driverId,
                'pid' => $pedidoId,
                'lat' => $lat,
                'lng' => $lng,
                'prec' => $precision,
                'vel' => $velocidad
            ]);
        } catch (Throwable $_t) {}
        // Si el usuario es un cliente o tiene un pedido activo, actualizar su ubicación en tiempo real
        try {
            $cliCols = array_column($pdo->query('SHOW COLUMNS FROM clientes')->fetchAll(), 'Field');
            if (in_array('latitud', $cliCols) && in_array('longitud', $cliCols)) {
                $stUpdCli = $pdo->prepare("
                    UPDATE clientes 
                    SET latitud = :lat, longitud = :lng 
                    WHERE id = :uid OR cedula = :c OR telefono = :t
                ");
                $stUpdCli->execute(['lat' => $lat, 'lng' => $lng, 'uid' => $driverId, 'c' => $driverId, 't' => $driverId]);
            }

            $stUpdPed = $pdo->prepare("
                UPDATE pedidos 
                SET destino_lat = :lat, destino_lng = :lng 
                WHERE (cliente_id = :cid OR cliente_id = :c2 OR cliente_id = :c3)
                  AND estado IN ('solicitud_enviada', 'pago_verificado', 'en_preparacion', 'esperando_repartidor', 'en_camino_al_cliente')
            ");
            $stUpdPed->execute(['lat' => $lat, 'lng' => $lng, 'cid' => $driverId, 'c2' => $driverId, 'c3' => $driverId]);
        } catch (Throwable $_eCliGps) {}
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Ubicación GPS actualizada exitosamente',
        'latitud' => $lat,
        'longitud' => $lng,
        'disponible' => true
    ]);
}

// -----------------------------------------------------------------------------
// GET: PERFIL INDIVIDUAL O LISTA COMPLETA DE CONDUCTORES (DUAL DATABASE)
// -----------------------------------------------------------------------------
if ($method === 'GET') {

    if ($id) {
        // 1. Buscar en c2861522_vixy_dl
        $driver = null;
        try {
            $stmt = $pdo->prepare("
                SELECT c.*, TIMESTAMPDIFF(SECOND, c.ultima_actualizacion, NOW()) AS seg_sin_senal 
                FROM conductores c 
                WHERE c.id = :id OR c.cedula = :id2 
                LIMIT 1
            ");
            $stmt->execute(['id' => $id, 'id2' => $id]);
            $row = $stmt->fetch();
            if ($row) {
                $driver = normalizarConductor($row, 'delivery');
            }
        } catch (Exception $e) {}

        // 2. Fallback a c2861522_regist
        if (!$driver && $pdoRegist) {
            try {
                $stmtR = $pdoRegist->prepare("
                    SELECT c.*, TIMESTAMPDIFF(SECOND, c.ultima_actualizacion, NOW()) AS seg_sin_senal 
                    FROM conductores c 
                    WHERE c.codigo_conductor = :id OR c.cedula = :id2 OR c.id = :id3 
                    LIMIT 1
                ");
                $stmtR->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
                $row = $stmtR->fetch();
                if ($row) {
                    $driver = normalizarConductor($row, 'regist');
                }
            } catch (Exception $e) {}
        }

        if (!$driver) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Conductor no encontrado'], 404);
        }

        Database::jsonResponse(['success' => true, 'conductor' => $driver]);
    }

    // Limpieza pasiva para sesiones inactivas por más de 8 minutos (app cerrada o sin señal).
    // IMPORTANTE: Solo corre ~5% de las veces para evitar race conditions con el GPS polling
    // del frontend (cada 5s), que de otra forma borraba conductores activos en cada ciclo.
    if (rand(1, 20) === 1) {
        try {
            $pdo->exec("
                UPDATE conductores 
                SET disponible = 0,
                    latitud_actual = NULL,
                    longitud_actual = NULL
                WHERE disponible = 1 
                  AND (en_carrera = 0 OR en_carrera IS NULL) 
                  AND ultima_actualizacion IS NOT NULL 
                  AND ultima_actualizacion < (NOW() - INTERVAL 8 MINUTE)
            ");
        } catch (Throwable $_t) {}
    }

    // LISTADO GENERAL DE CONDUCTORES:
    // ?disponibles=1 -> Solo conductores disponibles
    // ?en_linea=1    -> Conductores en línea (disponible o en carrera)
    // ?disponibles=0 -> TODOS los conductores (para Admin Panel / Padron)
    $soloDisponibles = isset($_GET['disponibles']) && $_GET['disponibles'] === '1';
    $soloEnLinea     = isset($_GET['en_linea']) && $_GET['en_linea'] === '1';

    $conductoresMap = [];

    // Paso 1: Cargar de c2861522_vixy_dl (Base operativa principal)
    try {
        $stmt = $pdo->prepare("
            SELECT c.*, TIMESTAMPDIFF(SECOND, c.ultima_actualizacion, NOW()) AS seg_sin_senal 
            FROM conductores c 
            WHERE 1=1
        ");
        $stmt->execute();
        $conductoresDl = $stmt->fetchAll();

        foreach ($conductoresDl as $d) {
            $normalized = normalizarConductor($d, 'delivery');

            if ($soloDisponibles && empty($normalized['disponible'])) {
                continue;
            }
            if ($soloEnLinea && empty($normalized['en_linea'])) {
                continue;
            }

            $cedDigits = preg_replace('/[^0-9]/', '', $d['cedula'] ?? '');
            $key = !empty($cedDigits) ? $cedDigits : ($normalized['codigo_conductor'] ?: $normalized['id']);
            $conductoresMap[$key] = $normalized;
        }
    } catch (Exception $e) {
        error_log('Error cargando conductores de vixy_dl: ' . $e->getMessage());
    }

    // Paso 2: Cargar de c2861522_regist (Pre-registros y postulaciones)
    if ($pdoRegist) {
        try {
            $stmtR = $pdoRegist->prepare("SELECT * FROM conductores WHERE 1=1 ORDER BY id DESC");
            $stmtR->execute();
            $conductoresRegist = $stmtR->fetchAll();

            foreach ($conductoresRegist as $r) {
                $code = !empty($r['codigo_conductor']) ? $r['codigo_conductor'] : ('DRV-' . $r['id']);
                $rCedDigits = preg_replace('/[^0-9]/', '', $r['cedula'] ?? '');
                $rKey = !empty($rCedDigits) ? $rCedDigits : ($code ?: (string)$r['id']);

                if (isset($conductoresMap[$rKey])) {
                    // Ya existe en vixy_dl: completar datos si faltan
                    if (empty($conductoresMap[$rKey]['codigo_conductor'])) {
                        $conductoresMap[$rKey]['codigo_conductor'] = $code;
                        $conductoresMap[$rKey]['codigoConductor']  = $code;
                    }
                    if (empty($conductoresMap[$rKey]['foto_url']) && !empty($r['foto_url'])) {
                        $conductoresMap[$rKey]['foto_url'] = $r['foto_url'];
                        $conductoresMap[$rKey]['fotoUrl']  = $r['foto_url'];
                    }
                } else {
                    $st = strtolower(trim((string)($r['status'] ?? '')));

                    $normalized = normalizarConductor(array_merge($r, [
                        'codigo_conductor' => $code,
                        'avatar_url'       => $r['foto_url'] ?? '',
                        'placa_moto'       => $r['moto_placa'] ?? '',
                        'marca_moto'       => $r['moto_marca'] ?? '',
                        'modelo_moto'      => $r['moto_modelo'] ?? '',
                        'ano_moto'         => $r['moto_ano'] ?? '',
                        'color_moto'       => $r['moto_color'] ?? '',
                        'licencia_grado'   => $r['licencia_grado'] ?: ($r['licencia_conducir'] ?? '2da'),
                    ]), 'regist');

                    if ($soloDisponibles && empty($normalized['disponible'])) {
                        continue;
                    }
                    if ($soloEnLinea && empty($normalized['en_linea'])) {
                        continue;
                    }

                    $conductoresMap[$rKey] = $normalized;
                }
            }
        } catch (Exception $e) {
            error_log('Error cargando conductores de regist: ' . $e->getMessage());
        }
    }

    $conductoresList = array_values($conductoresMap);

    Database::jsonResponse([
        'success' => true,
        'total' => count($conductoresList),
        'conductores' => $conductoresList
    ]);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Método o acción no soportada'], 400);
