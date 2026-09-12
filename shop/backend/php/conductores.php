<?php
/**
 * Vixy Delivery Platform - API de Conductores y GPS en Tiempo Real
 * Actualización periódica de coordenadas, disponibilidad y control de billetera (-$0.50)
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// -----------------------------------------------------------------------------
// FUNCIÓN NORMALIZADORA — igual patrón que normalizarComercio()
// vixy_dl  → operativos (status vacío/legacy se asume 'aprobado')
// regist   → pre-registros (penden del status del registro)
// -----------------------------------------------------------------------------
function normalizarConductor($c, $origen = 'delivery') {
        $ced  = strtoupper(trim($c['cedula'] ?? ''));
        $code = !empty($c['codigo_conductor'])
            ? $c['codigo_conductor']
            : (string)($c['id'] ?? ('DRV-' . md5($ced . ($c['telefono'] ?? ''))));

        $folderPath = "/shop/imgs-c-d/deliverys/{$code}";
        $avatar     = trim($c['avatar_url'] ?? $c['foto_url'] ?? '');
        if (empty($avatar)) $avatar = "{$folderPath}/foto_perfil.jpg";

        if ($origen === 'delivery') {
            // vixy_dl = operativo, PERO el control real de aprobación vive en
            // verificado_por_admin / estado_registro. Los que se registran desde
            // la app entran como pendiente_aprobacion + verificado=0 hasta que el
            // admin los aprueba desde el panel. Solo 'rechazado'/'suspendido'/
            // 'inactivo' no operan; 'pendiente_aprobacion' = pendiente.
            $storedStatus = strtolower(trim((string)($c['status'] ?? '')));
            $estadoReg    = strtolower(trim((string)($c['estado_registro'] ?? '')));
            $verifAdmin   = (int)($c['verificado_por_admin'] ?? 0);

            if ($storedStatus === 'rechazado') {
                $status = 'rechazado';
            } elseif ($storedStatus === 'suspendido') {
                $status = 'suspendido';
            } elseif ($storedStatus === 'inactivo') {
                $status = 'inactivo';
            } elseif ($estadoReg === 'rechazado' || $estadoReg === 'suspendido' || $estadoReg === 'inactivo') {
                $status = $estadoReg;
            } elseif ($verifAdmin === 1 && ($estadoReg === 'aprobado' || $estadoReg === '')) {
                $status = 'aprobado'; // verificado por administración
            } elseif ($estadoReg === 'pendiente_aprobacion' || $estadoReg === 'pendiente' || $verifAdmin === 0) {
                $status = 'pendiente'; // registrado desde la app, a la espera de aprobación
            } else {
                $status = 'aprobado'; // legacy histórico sin estado_registro ni verificación
            }
            $estadoVerif = $status;
            $disponible  = ($status === 'aprobado') ? (bool)($c['disponible'] ?? false) : false;
        } else {
            // Solo en regist = pre-registro sin verificar
            $status      = $c['status'] ?? 'pendiente';
            $estadoVerif = $c['status'] ?? 'pendiente';
            $disponible  = false;
        }

        return [
            'id'                    => $code,
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
            'en_carrera'            => (bool)($c['en_carrera'] ?? false),
            // GPS REAL: si no hay coordenada (NULL/0), se devuelve null para que el
            // mapa/radar NO invente una posición hardcodeada (antes: 10.49, -66.86).
            'latitud_actual'        => (($c['latitud_actual'] ?? null) !== null && (float)$c['latitud_actual'] != 0) ? (float)$c['latitud_actual'] : null,
            'longitud_actual'       => (($c['longitud_actual'] ?? null) !== null && (float)$c['longitud_actual'] != 0) ? (float)$c['longitud_actual'] : null,
            'lat'                   => (($c['latitud_actual'] ?? null) !== null && (float)$c['latitud_actual'] != 0) ? (float)$c['latitud_actual'] : null,
            'lng'                   => (($c['longitud_actual'] ?? null) !== null && (float)$c['longitud_actual'] != 0) ? (float)$c['longitud_actual'] : null,
            'saldo_billetera_usd'   => (float)($c['saldo_billetera_usd'] ?? 0.00),
            'limite_saldo_negativo' => (float)($c['limite_saldo_negativo'] ?? -0.50),
            'bloqueado_por_saldo'   => (bool)($c['bloqueado_por_saldo'] ?? false),
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
                'ano'          => $c['ano_moto'] ?? $c['moto_ano'] ?? 0,
                'anio'         => $c['ano_moto'] ?? $c['moto_ano'] ?? 0,
                'color'        => $c['color_moto'] ?? $c['moto_color'] ?? '',
                'serialMotor'  => $c['serial_motor'] ?? $c['moto_serial_motor'] ?? '',
                'serialChasis' => $c['serial_chasis'] ?? $c['moto_serial_chasis'] ?? ''
            ],
            'licencia_grado'        => $c['licencia_grado'] ?: ($c['licencia_conducir'] ?? '2da'),
            'status'                => $status,
            'estado_verificacion'   => $estadoVerif,
            'estadoVerificacion'    => $estadoVerif,
            'validado'              => ($status === 'aprobado'),
            'carpeta_imagenes'      => !empty($c['carpeta_imagenes']) ? $c['carpeta_imagenes'] : $folderPath,
            // Ruta REAL de cada documento cuando el conductor subió el archivo al
            // servidor (uploads/conductores/{codigo}/). null = aún no adjuntado.
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
// GET: PERFIL DEL CONDUCTOR O LISTA DE CONDUCTORES - DUAL DB (vixy_dl + regist)
// vixy_dl  → operativos aprobados (status vacío/legacy se asume 'aprobado')
// regist   → pendientes/aprobados sin migrar; los rechazados NO aparecen
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        // 1. Buscar en c2861522_vixy_dl (conductores operativos)
        $driver = null;
        try {
            $stmt = $pdo->prepare("SELECT id, nombre, apellido, cedula, telefono, email, foto_url, disponible, en_carrera, latitud_actual, longitud_actual, saldo_billetera_usd, limite_saldo_negativo, bloqueado_por_saldo, rating, total_carreras, placa_moto, marca_moto, modelo_moto, ano_moto, licencia_grado, status, carpeta_imagenes, fecha_aprobacion, estado_registro, verificado_por_admin, foto_cedula_url, foto_cedula_reverso_url, foto_licencia_url, foto_certificado_medico_url, foto_carnet_circulacion_url, foto_carnet_url, foto_rcv_url, foto_antecedentes_url, foto_perfil_url, foto_vehiculo_url, foto_placa_url FROM conductores WHERE id = :id OR cedula = :id2 LIMIT 1");
            $stmt->execute(['id' => $id, 'id2' => $id]);
            $row = $stmt->fetch();
            if ($row) $driver = normalizarConductor($row, 'delivery');
        } catch (Exception $e) {}

        // 2. Fallback: buscar en c2861522_regist (pre-registros)
        if (!$driver) {
            $pdoRegist = Database::getRegistConnection();
            if ($pdoRegist) {
                try {
                    $stmtR = $pdoRegist->prepare("SELECT * FROM conductores WHERE codigo_conductor = :id OR cedula = :id2 OR id = :id3 LIMIT 1");
                    $stmtR->execute(['id' => $id, 'id2' => $id, 'id3' => $id]);
                    $row = $stmtR->fetch();
                    if ($row) {
                        $code = !empty($row['codigo_conductor']) ? $row['codigo_conductor'] : ('DRV-' . $row['id']);
                        $row['codigo_conductor'] = $code;
                        $row['avatar_url']       = $row['foto_url'] ?? '';
                        $row['placa_moto']       = $row['moto_placa'] ?? '';
                        $row['marca_moto']       = $row['moto_marca'] ?? '';
                        $row['modelo_moto']      = $row['moto_modelo'] ?? '';
                        $row['ano_moto']         = $row['moto_ano'] ?? '';
                        $row['color_moto']       = $row['moto_color'] ?? '';
                        $row['licencia_grado']   = $row['licencia_grado'] ?: ($row['licencia_conducir'] ?? '2da');
                        $driver = normalizarConductor($row, 'regist');
                    }
                } catch (Exception $e) {}
            }
        }

        if (!$driver) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Conductor no encontrado'], 404);
        }

        Database::jsonResponse(['success' => true, 'conductor' => $driver]);
    }

    // Paso 1: vixy_dl — operativos aprobados (status vacío/legacy = aprobado)
    $soloDisponibles = isset($_GET['disponibles']) && $_GET['disponibles'] !== 'false' && $_GET['disponibles'] !== '0';
    $conductoresMap = [];
    try {
        $sql = "SELECT id, nombre, apellido, cedula, telefono, email, foto_url, disponible, en_carrera, latitud_actual, longitud_actual, saldo_billetera_usd, limite_saldo_negativo, bloqueado_por_saldo, rating, total_carreras, placa_moto, marca_moto, modelo_moto, ano_moto, licencia_grado, status, carpeta_imagenes, fecha_aprobacion, estado_registro, verificado_por_admin, foto_cedula_url, foto_cedula_reverso_url, foto_licencia_url, foto_certificado_medico_url, foto_carnet_circulacion_url, foto_carnet_url, foto_rcv_url, foto_antecedentes_url, foto_perfil_url, foto_vehiculo_url, foto_placa_url FROM conductores WHERE status IS NULL OR status NOT IN ('rechazado','suspendido','inactivo')";
        if ($soloDisponibles) {
            $sql .= " AND disponible = 1 AND bloqueado_por_saldo = 0 AND verificado_por_admin = 1";
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $conductoresDl = $stmt->fetchAll();

        foreach ($conductoresDl as $d) {
            $normalized = normalizarConductor($d, 'delivery');
            $key = $normalized['cedula'] ?: $normalized['id'];
            $conductoresMap[$key] = $normalized;
        }
    } catch (Exception $e) {
        error_log('Error cargando conductores de vixy_dl: ' . $e->getMessage());
    }

    // Paso 2: regist — solo pendientes/aprobados sin migrar; los rechazados NO aparecen
    // Si la cédula ya existe en vixy_dl → mantener el de vixy_dl (aprobado), NO sobreescribir
    $pdoRegist = Database::getRegistConnection();
    if ($pdoRegist) {
        try {
            $stmtR = $pdoRegist->prepare("SELECT * FROM conductores WHERE status != 'rechazado' ORDER BY id DESC");
            $stmtR->execute();
            $conductoresRegist = $stmtR->fetchAll();

            foreach ($conductoresRegist as $r) {
                $ced  = strtoupper(trim($r['cedula'] ?? ''));
                $code = !empty($r['codigo_conductor']) ? $r['codigo_conductor'] : ('DRV-' . $r['id']);

                if (isset($conductoresMap[$ced])) {
                    // Ya existe en vixy_dl (aprobado) — solo completar codigo si falta
                    if (empty($conductoresMap[$ced]['codigo_conductor'])) {
                        $conductoresMap[$ced]['codigo_conductor'] = $code;
                        $conductoresMap[$ced]['codigoConductor']  = $code;
                    }
                    // status 'aprobado' de vixy_dl se mantiene — NO se sobreescribe con regist
                } else {
                    // Solo en regist → normalizar con el status del registro
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
                    $key = $normalized['cedula'] ?: $normalized['id'];
                    $conductoresMap[$key] = $normalized;
                }
            }
        } catch (Exception $e) {
            error_log('Error cargando conductores de regist: ' . $e->getMessage());
        }
    }

    Database::jsonResponse(['success' => true, 'total' => count($conductoresMap), 'conductores' => array_values($conductoresMap)]);
}

// -----------------------------------------------------------------------------
// POST: PRE-REGISTRO / REGISTRO PÚBLICO DE CONDUCTOR (DESDE WEB O APP)
// -----------------------------------------------------------------------------
if ($method === 'POST' && ($action === 'pre_registro' || $action === 'registro')) {
    $data = !empty($_POST) ? $_POST : Database::getJsonInput();

    $nombre   = trim($data['nombre'] ?? '');
    $apellido = trim($data['apellido'] ?? '');
    $cedula   = trim($data['cedula'] ?? '');
    $telefono = trim($data['telefono'] ?? '');
    $email    = trim($data['email'] ?? '');
    $fnac     = trim($data['fecha_nacimiento'] ?? '');
    $dir      = trim($data['direccion'] ?? '');
    $placa    = trim($data['placa_vehiculo'] ?? $data['moto_placa'] ?? '');
    $modelo   = trim($data['modelo_vehiculo'] ?? $data['moto_modelo'] ?? '');
    $marca    = trim($data['marca_vehiculo'] ?? $data['moto_marca'] ?? '');
    $color    = trim($data['color_vehiculo'] ?? $data['moto_color'] ?? '');
    $ano      = trim($data['moto_ano'] ?? date('Y'));
    $licencia = trim($data['licencia_conducir'] ?? '');

    if (empty($nombre) || empty($apellido) || empty($cedula) || empty($telefono)) {
        Database::jsonResponse(['error' => true, 'message' => 'Nombre, apellido, cédula y teléfono son obligatorios.'], 400);
    }

    $pdoRegist = Database::getRegistConnection();
    if (!$pdoRegist) {
        Database::jsonResponse(['error' => true, 'message' => 'No se puede conectar a la base de datos de registro.'], 500);
    }

    // Verificar duplicados
    $dupCheck = $pdoRegist->prepare("SELECT id FROM conductores WHERE cedula = :c OR telefono = :t LIMIT 1");
    $dupCheck->execute(['c' => $cedula, 't' => $telefono]);
    if ($dupCheck->fetch()) {
        Database::jsonResponse(['error' => true, 'message' => 'Ya existe un conductor registrado con esa cédula o teléfono.'], 409);
    }

    // Generar código y contraseña temporal
    $codigoConductor = 'DRV-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    $passwordTemporal = '';
    for ($i = 0; $i < 8; $i++) {
        $passwordTemporal .= $chars[random_int(0, strlen($chars) - 1)];
    }
    $passwordHash = password_hash($passwordTemporal, PASSWORD_BCRYPT);

    // ─── Almacenamiento de fotos/documentos en el servidor (como comercios) ──────
    // Carpeta individual por conductor: /uploads/conductores/{codigo}/
    $baseUrl   = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
    $uploadDir = __DIR__ . '/uploads/conductores/' . $codigoConductor . '/';
    $carpetaImagenes = "{$baseUrl}/uploads/conductores/{$codigoConductor}/";

    $fotoUrls = [
        'foto_perfil_url'             => null,
        'foto_cedula_url'             => null,
        'foto_cedula_reverso_url'     => null,
        'foto_licencia_url'           => null,
        'foto_carnet_url'             => null,
        'foto_certificado_medico_url' => null,
        'foto_rcv_url'                => null,
        'foto_antecedentes_url'       => null,
        'foto_vehiculo_url'           => null,
        'foto_placa_url'              => null,
        'record_policial_url'         => null,
    ];

    // Mapeo: campo del formulario → archivo canónico + columna SQL
    $fileMap = [
        'foto_perfil'        => ['foto_perfil.jpg',            'foto_perfil_url'],
        'cedula_anverso'     => ['cedula_identidad.jpg',       'foto_cedula_url'],
        'cedula_reverso'     => ['cedula_reverso.jpg',         'foto_cedula_reverso_url'],
        'licencia'           => ['licencia_conducir.jpg',      'foto_licencia_url'],
        'rcv'                => ['poliza_rcv.jpg',             'foto_rcv_url'],
        'cert_medico'        => ['certificado_medico.jpg',     'foto_certificado_medico_url'],
        'carnet_circulacion' => ['carnet_circulacion.jpg',     'foto_carnet_url'],
        'antecedentes'       => ['antecedentes.jpg',           'foto_antecedentes_url'],
        'record_policial'    => ['record_policial.jpg',        'record_policial_url'],
        'foto_vehiculo'      => ['foto_vehiculo.jpg',          'foto_vehiculo_url'],
        'foto_placa'         => ['foto_placa.jpg',             'foto_placa_url'],
    ];

    $fotoUrl = null;
    $archivosAceptados = 0;
    if (!empty($_FILES)) {
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }
        foreach ($fileMap as $campo => [$nombreArchivo, $columna]) {
            if (!isset($_FILES[$campo]) || $_FILES[$campo]['error'] !== UPLOAD_ERR_OK) {
                continue;
            }
            if ($_FILES[$campo]['size'] > 5 * 1024 * 1024) {
                continue;
            }
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime  = $finfo->file($_FILES[$campo]['tmp_name']);
            if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
                continue;
            }
            if (move_uploaded_file($_FILES[$campo]['tmp_name'], $uploadDir . $nombreArchivo)) {
                $fotoUrls[$columna] = $carpetaImagenes . $nombreArchivo;
                $archivosAceptados++;
            }
        }
        // La foto de perfil también se usa como avatar (foto_url)
        if (!empty($fotoUrls['foto_perfil_url'])) {
            $fotoUrl = $fotoUrls['foto_perfil_url'];
        }
    }
    if ($archivosAceptados === 0) {
        $carpetaImagenes = null;
    }

    try {
        $stmtIns = $pdoRegist->prepare("
            INSERT INTO conductores (
                codigo_conductor, password_hash, nombre, apellido, cedula, telefono, email,
                fecha_nacimiento, direccion, moto_marca, moto_modelo, moto_color, moto_placa, moto_ano,
                licencia_conducir, foto_url, status, created_at,
                carpeta_imagenes,
                foto_perfil_url, foto_cedula_url, foto_cedula_reverso_url,
                foto_licencia_url, foto_carnet_url, foto_certificado_medico_url,
                foto_rcv_url, foto_antecedentes_url,
                foto_vehiculo_url, foto_placa_url, record_policial_url
            ) VALUES (
                :codigo, :phash, :nombre, :apellido, :cedula, :telefono, :email,
                :fnac, :dir, :marca, :modelo, :color, :placa, :ano,
                :licencia, :foto, 'pendiente', NOW(),
                :carpeta,
                :fperfil, :fcedula, :fcedreverso,
                :flicencia, :fcarnet, :fcertmed,
                :frcv, :fantec,
                :fvehiculo, :fplaca, :frecord
            )
        ");
        $stmtIns->execute([
            'codigo'     => $codigoConductor,
            'phash'      => $passwordHash,
            'nombre'     => $nombre,
            'apellido'   => $apellido,
            'cedula'     => $cedula,
            'telefono'   => $telefono,
            'email'      => $email ?: null,
            'fnac'       => $fnac ?: null,
            'dir'        => $dir ?: null,
            'marca'      => $marca,
            'modelo'     => $modelo,
            'color'      => $color,
            'placa'      => strtoupper($placa),
            'ano'        => $ano,
            'licencia'   => $licencia ?: null,
            'foto'       => $fotoUrl,
            'carpeta'    => $carpetaImagenes,
            'fperfil'    => $fotoUrls['foto_perfil_url'],
            'fcedula'    => $fotoUrls['foto_cedula_url'],
            'fcedreverso'=> $fotoUrls['foto_cedula_reverso_url'],
            'flicencia'  => $fotoUrls['foto_licencia_url'],
            'fcarnet'    => $fotoUrls['foto_carnet_url'],
            'fcertmed'   => $fotoUrls['foto_certificado_medico_url'],
            'frcv'       => $fotoUrls['foto_rcv_url'],
            'fantec'     => $fotoUrls['foto_antecedentes_url'],
            'fvehiculo'  => $fotoUrls['foto_vehiculo_url'],
            'fplaca'     => $fotoUrls['foto_placa_url'],
            'frecord'    => $fotoUrls['record_policial_url'],
        ]);
    } catch (Exception $e) {
        Database::jsonResponse(['error' => true, 'message' => 'Error al guardar en base de datos: ' . $e->getMessage()], 500);
    }

    Database::jsonResponse([
        'success'           => true,
        'message'           => 'Postulación de conductor registrada exitosamente',
        'codigo_conductor'  => $codigoConductor,
        'password_temporal' => $passwordTemporal,
        'cedula'            => $cedula
    ], 201);
}

// -----------------------------------------------------------------------------
// POST / PUT: ACTUALIZAR UBICACIÓN GPS EN TIEMPO REAL
// -----------------------------------------------------------------------------
if (($method === 'POST' || $method === 'PUT') && $action === 'gps') {
    $authUser = AuthMiddleware::requireAuth(['conductor', 'super_admin']);
    $data = Database::getJsonInput();

    $driverId = $data['conductor_id'] ?? $authUser['id'];
    $lat = (float)($data['latitud'] ?? 0);
    $lng = (float)($data['longitud'] ?? 0);
    $precision = (float)($data['precision_metros'] ?? 0);
    $velocidad = (float)($data['velocidad_kmh'] ?? 0);
    $pedidoId = $data['pedido_id'] ?? null;

    if ($lat == 0 || $lng == 0) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Coordenadas GPS inválidas'], 400);
    }

    // 1. Actualizar última ubicación en tabla conductores
    $stmtUpdate = $pdo->prepare("UPDATE conductores SET latitud_actual = :lat, longitud_actual = :lng WHERE id = :id");
    $stmtUpdate->execute(['lat' => $lat, 'lng' => $lng, 'id' => $driverId]);

    // 2. Registrar en historial de tracking GPS
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

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Coordenadas GPS registradas en tiempo real',
        'gps' => [
            'latitud' => $lat,
            'longitud' => $lng,
            'precision_metros' => $precision,
            'velocidad_kmh' => $velocidad,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}

// -----------------------------------------------------------------------------
// PUT: CAMBIAR DISPONIBILIDAD (ON/OFF)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $action === 'disponibilidad') {
    $authUser = AuthMiddleware::requireAuth(['conductor', 'super_admin']);
    $data = Database::getJsonInput();
    $driverId = $data['conductor_id'] ?? $authUser['id'];
    $disponible = isset($data['disponible']) ? (int)$data['disponible'] : 1;

    // Verificar si está bloqueado por saldo negativo (< -0.50)
    $stmtCheck = $pdo->prepare("SELECT saldo_billetera_usd, limite_saldo_negativo, bloqueado_por_saldo FROM conductores WHERE id = :id");
    $stmtCheck->execute(['id' => $driverId]);
    $driver = $stmtCheck->fetch();

    if ($driver && $driver['saldo_billetera_usd'] < -0.50) {
        $stmtBlock = $pdo->prepare("UPDATE conductores SET bloqueado_por_saldo = 1, disponible = 0 WHERE id = :id");
        $stmtBlock->execute(['id' => $driverId]);

        Database::jsonResponse([
            'error' => true,
            'bloqueado' => true,
            'mensaje' => 'No puedes conectarte. Tu saldo es de $' . number_format($driver['saldo_billetera_usd'], 2) . ' USD (límite superado: -$0.50 USD). Recarga tu billetera para activarte.'
        ], 403);
    }

    $stmt = $pdo->prepare("UPDATE conductores SET disponible = :disp WHERE id = :id");
    $stmt->execute(['disp' => $disponible, 'id' => $driverId]);

    // Si el conductor se desconecta (disponible = 0), liberar cualquier carrera asignada y reasignar a conductor cercano
    $carrerasLiberadas = 0;
    if ($disponible == 0) {
        $stmtPeds = $pdo->prepare("
            SELECT id FROM pedidos 
            WHERE (conductor_id = :cid OR conductor_oferta_id = :cid2)
              AND estado NOT IN ('entregado', 'cerrado_calificado', 'cancelado')
        ");
        $stmtPeds->execute(['cid' => $driverId, 'cid2' => $driverId]);
        $afectados = $stmtPeds->fetchAll();

        if (!empty($afectados)) {
            require_once __DIR__ . '/despacho.php';
            foreach ($afectados as $p) {
                $pdo->prepare("
                    UPDATE pedidos 
                    SET conductor_id = NULL, conductor_oferta_id = NULL, 
                        estado = 'esperando_repartidor', estado_despacho = 'buscando_conductor'
                    WHERE id = :pid
                ")->execute(['pid' => $p['id']]);

                if (function_exists('asignarSiguienteConductorCercano')) {
                    asignarSiguienteConductorCercano($pdo, $p['id']);
                }
                $carrerasLiberadas++;
            }
        }
    }

    Database::jsonResponse([
        'success' => true,
        'disponible' => (bool)$disponible,
        'carreras_reasignadas' => $carrerasLiberadas,
        'mensaje' => $disponible ? 'Conductor en línea para recibir viajes' : 'Conductor desconectado. Pedidos reasignados a conductores cercanos disponibles.'
    ]);
}

// -----------------------------------------------------------------------------
// PUT: APROBAR / VERIFICAR CONDUCTOR DESDE EL ADMIN PANEL
// (Marca aprobado en c2861522_regist Y migra/actualiza el conductor en c2861522_vixy_dl)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && ($action === 'aprobar_conductor' || $action === 'aprobar')) {
    AuthMiddleware::requireAdmin(['super_admin', 'operador']);
    $driverId = $_GET['id'] ?? null;
    if (!$driverId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'ID de conductor requerido'], 400);
    }

    // 1. Marcar aprobado en c2861522_regist
    $regData = null;
    $pdoRegist = Database::getRegistConnection();
    if ($pdoRegist) {
        try {
            $stR = $pdoRegist->prepare("SELECT * FROM conductores WHERE codigo_conductor = :id OR cedula = :id2 OR id = :id3 LIMIT 1");
            $stR->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId]);
            $regData = $stR->fetch();

            $updR = $pdoRegist->prepare("UPDATE conductores SET status = 'aprobado', fecha_aprobacion = NOW() WHERE codigo_conductor = :id OR cedula = :id2 OR id = :id3");
            $updR->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId]);
        } catch (Exception $e) {
            error_log('Error aprobando conductor en regist: ' . $e->getMessage());
        }
    }

    // 2. Verificar si ya existe en c2861522_vixy_dl (por id, cédula o teléfono)
    $existingDl = null;
    try {
        $stCheck = $pdo->prepare("SELECT * FROM conductores WHERE id = :id OR cedula = :c OR telefono = :t LIMIT 1");
        $stCheck->execute(['id' => $driverId, 'c' => $regData['cedula'] ?? $driverId, 't' => $regData['telefono'] ?? $driverId]);
        $existingDl = $stCheck->fetch();
    } catch (Exception $e) {}

    if (!$regData && !$existingDl) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Conductor no encontrado en ninguna base de datos'], 404);
    }

    // 3. Extraer datos del conductor (desde vixy_dl existente o regist)
    $cedula       = !empty($existingDl['cedula']) ? $existingDl['cedula'] : trim($regData['cedula'] ?? '');
    $telefono     = !empty($existingDl['telefono']) ? $existingDl['telefono'] : ($regData['telefono'] ?? $driverId);
    $email        = !empty($existingDl['email']) ? $existingDl['email'] : ($regData['email'] ?? ('driver_' . preg_replace('/[^0-9]/', '', $cedula) . '@vixy.com'));
    $nombre       = !empty($existingDl['nombre']) ? $existingDl['nombre'] : ($regData['nombre'] ?? 'Conductor');
    $apellido     = !empty($existingDl['apellido']) ? $existingDl['apellido'] : ($regData['apellido'] ?? '');
    $pwdHash      = !empty($existingDl['password_hash']) ? $existingDl['password_hash'] : ($regData['password_hash'] ?? password_hash('123456', PASSWORD_BCRYPT));
    $foto         = !empty($existingDl['foto_url']) ? $existingDl['foto_url'] : ($regData['foto_url'] ?? '');
    $direccion    = !empty($existingDl['direccion']) ? $existingDl['direccion'] : ($regData['direccion'] ?? '');
    $conductorId  = !empty($existingDl['id']) ? $existingDl['id'] : (!empty($regData['codigo_conductor']) ? $regData['codigo_conductor'] : ('DRV-' . preg_replace('/[^A-Za-z0-9]/', '', $cedula)));
    $placa        = strtoupper(!empty($existingDl['placa_moto']) ? $existingDl['placa_moto'] : ($regData['moto_placa'] ?? ''));
    $marca        = !empty($existingDl['marca_moto']) ? $existingDl['marca_moto'] : ($regData['moto_marca'] ?? 'Bera');
    $modelo       = !empty($existingDl['modelo_moto']) ? $existingDl['modelo_moto'] : ($regData['moto_modelo'] ?? 'SBR 150');
    $ano          = !empty($existingDl['ano_moto']) ? $existingDl['ano_moto'] : ($regData['moto_ano'] ?? date('Y'));
    $licencia     = !empty($existingDl['licencia_grado']) ? $existingDl['licencia_grado'] : ($regData['licencia_conducir'] ?? '2da');
    $carpetaImgs  = !empty($existingDl['carpeta_imagenes']) ? $existingDl['carpeta_imagenes'] : ($regData['carpeta_imagenes'] ?? "/shop/imgs-c-d/deliverys/{$conductorId}");

    // 3.1 Conocer las columnas físicas REALES de vixy_dl.conductores (evita errores
    //    por columnas que aún no existen: telefono_adicional, punto_referencia,
    //    tipo_vehiculo, etc.)
    $dlColumns = [];
    try {
        $dlColumns = array_column($pdo->query('SHOW COLUMNS FROM conductores')->fetchAll(), 'Field');
    } catch (Exception $e) {}

    // 3a. Si el conductor YA existe en vixy_dl (registrado desde la app), basta
    //     con actualizar los campos de aprobación y los datos migrables presentes.
    if ($existingDl) {
        try {
            $updSets = ["estado_registro = 'aprobado'", 'verificado_por_admin = 1', "status = 'aprobado'", 'disponible = 1', 'bloqueado_por_saldo = 0', 'fecha_aprobacion = NOW()'];
            $updVals = ['id' => $existingDl['id']];

            $mapSet = [
                'nombre'             => $nombre,
                'apellido'           => $apellido,
                'telefono'           => $telefono,
                'email'              => $email,
                'password_hash'      => $pwdHash,
                'foto_url'           => $foto,
                'direccion'          => $direccion,
                'placa_moto'         => $placa,
                'marca_moto'         => $marca,
                'modelo_moto'        => $modelo,
                'ano_moto'           => $ano,
                'licencia_grado'     => $licencia,
                'carpeta_imagenes'   => $carpetaImgs,
            ];
            if (in_array('telefono_adicional', $dlColumns, true)) {
                $mapSet['telefono_adicional'] = $existingDl['telefono_adicional'] ?? ($regData['telefono_adicional'] ?? null);
            }
            if (in_array('punto_referencia', $dlColumns, true)) {
                $mapSet['punto_referencia']   = $existingDl['punto_referencia'] ?? ($regData['punto_referencia'] ?? null);
            }
            if (in_array('tipo_vehiculo', $dlColumns, true)) {
                $mapSet['tipo_vehiculo']      = $existingDl['tipo_vehiculo'] ?? 'moto';
            }

            foreach ($mapSet as $col => $val) {
                if (!in_array($col, $dlColumns, true)) continue;
                $updSets[] = "`{$col}` = :c_" . preg_replace('/[^a-z0-9_]/i', '', $col);
                $updVals['c_' . preg_replace('/[^a-z0-9_]/i', '', $col)] = $val;
            }

            $sqlUpd = "UPDATE conductores SET " . implode(', ', $updSets) . " WHERE id = :id";
            $pdo->prepare($sqlUpd)->execute($updVals);
        } catch (Exception $e) {
            error_log('Error actualizando conductor existente en vixy_dl: ' . $e->getMessage());
        }
    } else {
        // 3b. No existe en vixy_dl → migrar desde regist con INSERT de columnas existentes.
        try {
            $mapIns = [
                'id'                   => $conductorId,
                'nombre'               => $nombre,
                'apellido'             => $apellido,
                'cedula'               => $cedula,
                'telefono'             => $telefono,
                'telefono_adicional'   => $regData['telefono_adicional'] ?? null,
                'email'                => $email,
                'password_hash'        => $pwdHash,
                'foto_url'             => $foto,
                'direccion'            => $direccion,
                'punto_referencia'     => $regData['punto_referencia'] ?? null,
                'tipo_vehiculo'        => $regData['tipo_vehiculo'] ?? 'moto',
                'disponible'           => 1,
                'en_carrera'           => 0,
                // GPS: 0 = sin coordenada real (el app la manda por action=gps/keep_alive).
                // NUNCA escribir Caracas (10.49, -66.86) como posición inventada.
                'latitud_actual'       => 0.00000000,
                'longitud_actual'      => 0.00000000,
                'placa_moto'           => $placa,
                'marca_moto'           => $marca,
                'modelo_moto'          => $modelo,
                'ano_moto'             => $ano,
                'licencia_grado'       => $licencia,
                'saldo_billetera_usd'  => 0.00,
                'limite_saldo_negativo'=> 0.00,
                'bloqueado_por_saldo'  => 0,
                'rating'               => 5.00,
                'total_carreras'       => 0,
                'status'               => 'aprobado',
                'carpeta_imagenes'     => $carpetaImgs,
                'fecha_aprobacion'     => date('Y-m-d H:i:s'),
                'estado_registro'      => 'aprobado',
                'verificado_por_admin' => 1,
                'motivo_rechazo'       => null,
                'terminos_aceptados'   => 1,
            ];
            $mapIns = array_intersect_key($mapIns, array_flip($dlColumns));
            $colsIns = array_keys($mapIns);
            $sqlIns = "INSERT INTO conductores (`" . implode('`, `', $colsIns) . "`) VALUES (:" . implode(', :', $colsIns) . ")";
            $pdo->prepare($sqlIns)->execute($mapIns);
        } catch (Exception $e) {
            error_log('Error migrando conductor a c2861522_vixy_dl: ' . $e->getMessage());
        }
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Conductor aprobado, verificado y migrado a la base operativa (vixy_dl). Ahora puede iniciar sesión y recibir viajes.'
    ]);
}

// -----------------------------------------------------------------------------
// PUT: RECHAZAR CONDUCTOR DESDE EL ADMIN PANEL
// (Marca rechazado en c2861522_regist y desactiva en c2861522_vixy_dl si existiera)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && ($action === 'rechazar_conductor' || $action === 'rechazar')) {
    AuthMiddleware::requireAdmin(['super_admin', 'operador']);
    $driverId = $_GET['id'] ?? null;
    if (!$driverId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'ID de conductor requerido'], 400);
    }

    $pdoRegist = Database::getRegistConnection();
    if ($pdoRegist) {
        try {
            $stR = $pdoRegist->prepare("UPDATE conductores SET status = 'rechazado' WHERE codigo_conductor = :id OR cedula = :id2 OR id = :id3");
            $stR->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId]);
        } catch (Exception $e) {}
    }

    try {
        $st = $pdo->prepare("UPDATE conductores SET status = 'rechazado', estado_registro = 'rechazado', verificado_por_admin = 0, disponible = 0 WHERE id = :id OR cedula = :id2");
        $st->execute(['id' => $driverId, 'id2' => $driverId]);
    } catch (Exception $e) {}

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Conductor rechazado. Ya no aparecerá en la lista de repartidores.'
    ]);
}

// -----------------------------------------------------------------------------
// POST: PRE-REGISTRO DE NUEVO REPARTIDOR (FORMULARIO WEB)
// -----------------------------------------------------------------------------
if ($method === 'POST' && $action === 'pre_registro') {
    $nombre = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $cedula = trim($_POST['cedula'] ?? '');
    $fechaNacimiento = trim($_POST['fecha_nacimiento'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $telefonoAdicional = trim($_POST['telefono_adicional'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $direccion = trim($_POST['direccion'] ?? '');
    $puntoReferencia = trim($_POST['punto_referencia'] ?? '');
    $ubicacionGps = trim($_POST['ubicacion_gps'] ?? '');
    $tipoVehiculo = trim($_POST['tipo_vehiculo'] ?? 'moto');
    $placaVehiculo = trim($_POST['placa_vehiculo'] ?? '');
    $modeloVehiculo = trim($_POST['modelo_vehiculo'] ?? '');

    // Validar obligatorios
    if (empty($nombre) || empty($apellido) || empty($cedula) || empty($fechaNacimiento) || 
        empty($telefono) || empty($email) || empty($direccion)) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'Faltan campos obligatorios'], 400);
    }

    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'Email inválido'], 400);
    }

    // Validar foto
    if (!isset($_FILES['foto_perfil']) || $_FILES['foto_perfil']['error'] === UPLOAD_ERR_NO_FILE) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'La foto de perfil es obligatoria'], 400);
    }

    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    $extension = strtolower(pathinfo($_FILES['foto_perfil']['name'], PATHINFO_EXTENSION));

    if (!in_array($extension, $allowedExtensions)) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'Formato de imagen no permitido'], 400);
    }

    if ($_FILES['foto_perfil']['size'] > 5 * 1024 * 1024) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'La foto supera los 5MB'], 400);
    }

    // Verificar duplicados
    $stmtCheck = $pdo->prepare("SELECT id FROM conductores WHERE cedula = :cedula OR email = :email");
    $stmtCheck->execute(['cedula' => $cedula, 'email' => $email]);

    if ($stmtCheck->rowCount() > 0) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'La cédula o email ya están registrados'], 409);
    }

    // Generar código e ID
    $codigo = 'REP-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    $id = 'rep-' . uniqid();

    // Guardar foto
    $uploadDir = __DIR__ . '/../uploads/repartidores/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $filename = $codigo . '.' . $extension;
    $destination = $uploadDir . $filename;

    if (!move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $destination)) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'Error al guardar la foto'], 500);
    }

    $fotoUrl = "/shop/backend/uploads/repartidores/$filename";

    // Parsear GPS (0,0 = sin coordenada real; NO inventar Caracas)
    $lat = 0.00000000;
    $lng = 0.00000000;
    if (!empty($ubicacionGps)) {
        $parts = explode(',', $ubicacionGps);
        if (count($parts) >= 2) {
            $lat = (float)trim($parts[0]);
            $lng = (float)trim($parts[1]);
        }
    }

    // Separar marca/modelo/año
    $marca = '';
    $modelo = '';
    $ano = '';
    if (!empty($modeloVehiculo)) {
        $parts = explode(' ', $modeloVehiculo);
        $marca = $parts[0] ?? '';
        $modelo = $parts[1] ?? '';
        $ano = $parts[2] ?? '';
    }

    // Insertar
    $sql = "INSERT INTO conductores (
                id, nombre, apellido, cedula, fecha_nacimiento,
                telefono, telefono_adicional, email, password_hash,
                foto_url, direccion, punto_referencia,
                latitud_actual, longitud_actual,
                tipo_vehiculo, placa_moto, marca_moto, modelo_moto, ano_moto,
                disponible, en_carrera, saldo_billetera_usd, bloqueado_por_saldo
            ) VALUES (
                :id, :nombre, :apellido, :cedula, :fecha_nacimiento,
                :telefono, :telefono_adicional, :email, '123456',
                :foto, :direccion, :referencia,
                :lat, :lng,
                :tipo_vehiculo, :placa, :marca, :modelo, :ano,
                0, 0, 0.00, 0
            )";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'nombre' => $nombre,
            'apellido' => $apellido,
            'cedula' => $cedula,
            'fecha_nacimiento' => $fechaNacimiento,
            'telefono' => $telefono,
            'telefono_adicional' => !empty($telefonoAdicional) ? $telefonoAdicional : null,
            'email' => $email,
            'foto' => $fotoUrl,
            'direccion' => $direccion,
            'referencia' => !empty($puntoReferencia) ? $puntoReferencia : null,
            'lat' => $lat,
            'lng' => $lng,
            'tipo_vehiculo' => $tipoVehiculo,
            'placa' => $placaVehiculo,
            'marca' => $marca,
            'modelo' => $modelo,
            'ano' => $ano
        ]);
        
        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Registro de repartidor exitoso',
            'codigo_conductor' => $codigo,
            'repartidor_id' => $id
        ], 201);
        
    } catch (PDOException $e) {
        if (file_exists($destination)) {
            unlink($destination);
        }
        
        Database::jsonResponse(['success' => false, 'mensaje' => 'Error al registrar: ' . $e->getMessage()], 500);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción o método no soportado'], 405);