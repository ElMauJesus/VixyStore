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
// GET: PERFIL DEL CONDUCTOR O LISTA DE CONDUCTORES CERCANOS
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("SELECT id, nombre, apellido, cedula, telefono, email, avatar_url, disponible, en_carrera, latitud_actual, longitud_actual, saldo_billetera_usd, limite_saldo_negativo, bloqueado_por_saldo, rating, total_carreras FROM conductores WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $driver = $stmt->fetch();

        if (!$driver) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Conductor no encontrado'], 404);
        }

        $driver['disponible'] = (bool)$driver['disponible'];
        $driver['en_carrera'] = (bool)$driver['en_carrera'];
        $driver['bloqueado_por_saldo'] = (bool)$driver['bloqueado_por_saldo'];
        $driver['saldo_billetera_usd'] = (float)$driver['saldo_billetera_usd'];

        Database::jsonResponse(['success' => true, 'conductor' => $driver]);
    }

    // Listar conductores para mapa de administración, verificación o asignación
    $soloDisponibles = isset($_GET['disponibles']) && $_GET['disponibles'] !== 'false' && $_GET['disponibles'] !== '0';
    $sql = "SELECT id, nombre, apellido, cedula, telefono, email, avatar_url, foto_url, disponible, en_carrera, latitud_actual, longitud_actual, saldo_billetera_usd, limite_saldo_negativo, bloqueado_por_saldo, rating, total_carreras, placa_moto, marca_moto, modelo_moto, ano_moto, licencia_grado, status, estado_verificacion, carpeta_imagenes FROM conductores WHERE 1=1";
    
    if ($soloDisponibles) {
        $sql .= " AND disponible = 1 AND bloqueado_por_saldo = 0";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $conductoresDl = $stmt->fetchAll();

    // Mapear por cédula para unificar con regist
    $conductoresMap = [];
    foreach ($conductoresDl as $d) {
        $ced = strtoupper(trim($d['cedula'] ?? ''));
        $code = $d['id'];
        $folderPath = "/shop/imgs-c-d/deliverys/{$code}";
        $d['carpeta_imagenes'] = $d['carpeta_imagenes'] ?: $folderPath;
        $d['documentos'] = [
            'cedula' => "{$folderPath}/cedula_identidad.svg",
            'licencia' => "{$folderPath}/licencia_conducir.svg",
            'certificado_medico' => "{$folderPath}/certificado_medico.svg",
            'carnet_circulacion' => "{$folderPath}/carnet_circulacion.svg",
            'rcv' => "{$folderPath}/poliza_rcv.svg",
            'foto_perfil' => "{$folderPath}/foto_perfil.svg"
        ];
        $conductoresMap[$ced ?: $code] = $d;
    }

    // Consultar también c2861522_regist.conductores
    $pdoRegist = Database::getRegistConnection();
    if ($pdoRegist) {
        try {
            $stmtR = $pdoRegist->prepare("SELECT * FROM conductores ORDER BY id DESC");
            $stmtR->execute();
            $conductoresRegist = $stmtR->fetchAll();

            foreach ($conductoresRegist as $r) {
                $ced = strtoupper(trim($r['cedula'] ?? ''));
                $code = $r['codigo_conductor'] ?? ('DRV-' . $r['id']);
                $folderPath = "/shop/imgs-c-d/deliverys/{$code}";

                if (isset($conductoresMap[$ced])) {
                    // Actualizar status desde regist si es más reciente
                    $conductoresMap[$ced]['status'] = $r['status'] ?? $conductoresMap[$ced]['status'];
                    $conductoresMap[$ced]['codigo_conductor'] = $code;
                } else {
                    $conductoresMap[$ced ?: $code] = [
                        'id' => $code,
                        'codigo_conductor' => $code,
                        'nombre' => $r['nombre'] ?? 'Conductor',
                        'apellido' => $r['apellido'] ?? '',
                        'cedula' => $r['cedula'] ?? '',
                        'telefono' => $r['telefono'] ?? '',
                        'email' => $r['email'] ?? '',
                        'avatar_url' => $r['foto_url'] ?: "{$folderPath}/foto_perfil.svg",
                        'foto_url' => $r['foto_url'] ?: "{$folderPath}/foto_perfil.svg",
                        'disponible' => false,
                        'en_carrera' => false,
                        'latitud_actual' => 10.49100000,
                        'longitud_actual' => -66.86200000,
                        'saldo_billetera_usd' => 0.00,
                        'limite_saldo_negativo' => -0.50,
                        'bloqueado_por_saldo' => 0,
                        'rating' => 5.00,
                        'total_carreras' => 0,
                        'placa_moto' => $r['moto_placa'] ?? '',
                        'marca_moto' => $r['moto_marca'] ?? 'Bera',
                        'modelo_moto' => $r['moto_modelo'] ?? 'SBR 150',
                        'ano_moto' => $r['moto_ano'] ?? '2024',
                        'licencia_grado' => $r['licencia_conducir'] ?? '2da',
                        'status' => $r['status'] ?? 'pendiente',
                        'estado_verificacion' => $r['status'] ?? 'pendiente',
                        'carpeta_imagenes' => $folderPath,
                        'documentos' => [
                            'cedula' => "{$folderPath}/cedula_identidad.svg",
                            'licencia' => "{$folderPath}/licencia_conducir.svg",
                            'certificado_medico' => "{$folderPath}/certificado_medico.svg",
                            'carnet_circulacion' => "{$folderPath}/carnet_circulacion.svg",
                            'rcv' => "{$folderPath}/poliza_rcv.svg",
                            'foto_perfil' => "{$folderPath}/foto_perfil.svg"
                        ]
                    ];
                }
            }
        } catch (Exception $e) {}
    }

    Database::jsonResponse(['success' => true, 'conductores' => array_values($conductoresMap)]);
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
    $marca    = trim($data['moto_marca'] ?? 'Bera');
    $color    = trim($data['moto_color'] ?? 'Negro');
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

    // Guardar foto si vino en el formulario multipart
    $fotoUrl = null;
    if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] === UPLOAD_ERR_OK) {
        $upDir = __DIR__ . '/uploads/conductores/';
        if (!file_exists($upDir)) @mkdir($upDir, 0777, true);
        $ext = strtolower(pathinfo($_FILES['foto_perfil']['name'], PATHINFO_EXTENSION));
        $fName = $codigoConductor . '.' . $ext;
        if (move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $upDir . $fName)) {
            $fotoUrl = '/uploads/conductores/' . $fName;
        }
    }

    try {
        $stmtIns = $pdoRegist->prepare("
            INSERT INTO conductores (
                codigo_conductor, password_hash, nombre, apellido, cedula, telefono, email,
                fecha_nacimiento, direccion, moto_marca, moto_modelo, moto_color, moto_placa, moto_ano,
                licencia_conducir, foto_url, status, created_at
            ) VALUES (
                :codigo, :phash, :nombre, :apellido, :cedula, :telefono, :email,
                :fnac, :dir, :marca, :modelo, :color, :placa, :ano,
                :licencia, :foto, 'pendiente', NOW()
            )
        ");
        $stmtIns->execute([
            'codigo'   => $codigoConductor,
            'phash'    => $passwordHash,
            'nombre'   => $nombre,
            'apellido' => $apellido,
            'cedula'   => $cedula,
            'telefono' => $telefono,
            'email'    => $email ?: null,
            'fnac'     => $fnac ?: null,
            'dir'      => $dir ?: null,
            'marca'    => $marca,
            'modelo'   => $modelo,
            'color'    => $color,
            'placa'    => strtoupper($placa),
            'ano'      => $ano,
            'licencia' => $licencia ?: null,
            'foto'     => $fotoUrl
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
// -----------------------------------------------------------------------------
if ($method === 'PUT' && ($action === 'aprobar_conductor' || $action === 'aprobar')) {
    AuthMiddleware::requireAuth(['super_admin', 'operador']);
    $driverId = $_GET['id'] ?? null;
    if (!$driverId) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'ID de conductor requerido'], 400);
    }

    $pdoRegist = Database::getRegistConnection();
    if ($pdoRegist) {
        try {
            $stR = $pdoRegist->prepare("UPDATE conductores SET status = 'aprobado' WHERE codigo_conductor = :id OR cedula = :id2 OR id = :id3");
            $stR->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId]);
        } catch (Exception $e) {}
    }

    try {
        $st = $pdo->prepare("UPDATE conductores SET status = 'aprobado', estado_verificacion = 'aprobado', disponible = 1 WHERE id = :id OR cedula = :id2");
        $st->execute(['id' => $driverId, 'id2' => $driverId]);
    } catch (Exception $e) {}

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Conductor aprobado y verificado exitosamente. Ahora puede iniciar sesión y recibir viajes.'
    ]);
}

// -----------------------------------------------------------------------------
// PUT: RECHAZAR CONDUCTOR DESDE EL ADMIN PANEL
// -----------------------------------------------------------------------------
if ($method === 'PUT' && ($action === 'rechazar_conductor' || $action === 'rechazar')) {
    AuthMiddleware::requireAuth(['super_admin', 'operador']);
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
        $st = $pdo->prepare("UPDATE conductores SET status = 'rechazado', estado_verificacion = 'rechazado', disponible = 0 WHERE id = :id OR cedula = :id2");
        $st->execute(['id' => $driverId, 'id2' => $driverId]);
    } catch (Exception $e) {}

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Conductor rechazado.'
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

    // Parsear GPS
    $lat = 10.49100000;
    $lng = -66.86200000;
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