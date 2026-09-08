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

    $soloDisponibles = isset($_GET['disponibles']) ? (bool)$_GET['disponibles'] : true;
    $sql = "SELECT id, nombre, apellido, telefono, disponible, en_carrera, latitud_actual, longitud_actual, saldo_billetera_usd, bloqueado_por_saldo, rating FROM conductores WHERE 1=1";
    
    if ($soloDisponibles) {
        $sql .= " AND disponible = 1 AND bloqueado_por_saldo = 0";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    Database::jsonResponse(['success' => true, 'conductores' => $stmt->fetchAll()]);
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

    $stmtUpdate = $pdo->prepare("UPDATE conductores SET latitud_actual = :lat, longitud_actual = :lng WHERE id = :id");
    $stmtUpdate->execute(['lat' => $lat, 'lng' => $lng, 'id' => $driverId]);

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

    Database::jsonResponse([
        'success' => true,
        'disponible' => (bool)$disponible,
        'mensaje' => $disponible ? 'Conductor en línea para recibir viajes' : 'Conductor desconectado'
    ]);
}

// -----------------------------------------------------------------------------
// POST: PRE-REGISTRO DE NUEVO REPARTIDOR (FORMULARIO WEB COMPLETO)
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
    $marcaVehiculo = trim($_POST['marca_vehiculo'] ?? '');
    $modeloVehiculo = trim($_POST['modelo_vehiculo'] ?? '');
    $colorVehiculo = trim($_POST['color_vehiculo'] ?? '');
    $metodoPago = trim($_POST['metodo_pago'] ?? '');
    $referenciaPago = trim($_POST['referencia_pago'] ?? '');

    if (empty($nombre) || empty($apellido) || empty($cedula) || empty($fechaNacimiento) || 
        empty($telefono) || empty($email) || empty($direccion)) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'Faltan campos obligatorios'], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'Email inválido'], 400);
    }

    if (!isset($_FILES['foto_perfil']) || $_FILES['foto_perfil']['error'] === UPLOAD_ERR_NO_FILE) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'La foto de perfil es obligatoria'], 400);
    }

    if (!isset($_FILES['licencia']) || $_FILES['licencia']['error'] === UPLOAD_ERR_NO_FILE) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'La licencia es obligatoria'], 400);
    }

    if (!isset($_FILES['rcv']) || $_FILES['rcv']['error'] === UPLOAD_ERR_NO_FILE) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'El RCV es obligatorio'], 400);
    }

    if (!isset($_FILES['cert_medico']) || $_FILES['cert_medico']['error'] === UPLOAD_ERR_NO_FILE) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'El certificado médico es obligatorio'], 400);
    }

    if (!isset($_FILES['carnet_circulacion']) || $_FILES['carnet_circulacion']['error'] === UPLOAD_ERR_NO_FILE) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'El carnet de circulación es obligatorio'], 400);
    }

    if (!isset($_FILES['foto_vehiculo']) || $_FILES['foto_vehiculo']['error'] === UPLOAD_ERR_NO_FILE) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'La foto del vehículo es obligatoria'], 400);
    }

    if (!isset($_FILES['foto_placa']) || $_FILES['foto_placa']['error'] === UPLOAD_ERR_NO_FILE) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'La foto de la placa es obligatoria'], 400);
    }

    if (empty($metodoPago) || empty($referenciaPago)) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'Método de pago y referencia son obligatorios'], 400);
    }

    $stmtCheck = $pdo->prepare("SELECT id FROM conductores WHERE cedula = :cedula OR email = :email");
    $stmtCheck->execute(['cedula' => $cedula, 'email' => $email]);

    if ($stmtCheck->rowCount() > 0) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'La cédula o email ya están registrados'], 409);
    }

    $codigo = 'REP-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    $id = 'rep-' . uniqid();

    function generateTemporaryPassword($length = 10) {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $password;
    }
    $temporaryPassword = generateTemporaryPassword();
    $passwordHash = password_hash($temporaryPassword, PASSWORD_BCRYPT);

    $uploadDir = __DIR__ . '/../uploads/repartidores/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extPerfil = strtolower(pathinfo($_FILES['foto_perfil']['name'], PATHINFO_EXTENSION));
    $fotoPerfilUrl = "/delivery/backend/uploads/repartidores/{$codigo}.{$extPerfil}";
    move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $uploadDir . basename($fotoPerfilUrl));

    $uploadDirDocs = __DIR__ . '/../uploads/documentos/';
    if (!file_exists($uploadDirDocs)) {
        mkdir($uploadDirDocs, 0777, true);
    }

    $extLicencia = strtolower(pathinfo($_FILES['licencia']['name'], PATHINFO_EXTENSION));
    $licenciaUrl = "/delivery/backend/uploads/documentos/{$codigo}-licencia.{$extLicencia}";
    move_uploaded_file($_FILES['licencia']['tmp_name'], $uploadDirDocs . basename($licenciaUrl));

    $extRcv = strtolower(pathinfo($_FILES['rcv']['name'], PATHINFO_EXTENSION));
    $rcvUrl = "/delivery/backend/uploads/documentos/{$codigo}-rcv.{$extRcv}";
    move_uploaded_file($_FILES['rcv']['tmp_name'], $uploadDirDocs . basename($rcvUrl));

    $extCert = strtolower(pathinfo($_FILES['cert_medico']['name'], PATHINFO_EXTENSION));
    $certMedicoUrl = "/delivery/backend/uploads/documentos/{$codigo}-certificado.{$extCert}";
    move_uploaded_file($_FILES['cert_medico']['tmp_name'], $uploadDirDocs . basename($certMedicoUrl));

    $extCarnet = strtolower(pathinfo($_FILES['carnet_circulacion']['name'], PATHINFO_EXTENSION));
    $carnetUrl = "/delivery/backend/uploads/documentos/{$codigo}-carnet.{$extCarnet}";
    move_uploaded_file($_FILES['carnet_circulacion']['tmp_name'], $uploadDirDocs . basename($carnetUrl));

    $extVehiculo = strtolower(pathinfo($_FILES['foto_vehiculo']['name'], PATHINFO_EXTENSION));
    $fotoVehiculoUrl = "/delivery/backend/uploads/repartidores/{$codigo}-vehiculo.{$extVehiculo}";
    move_uploaded_file($_FILES['foto_vehiculo']['tmp_name'], $uploadDir . basename($fotoVehiculoUrl));

    $extPlaca = strtolower(pathinfo($_FILES['foto_placa']['name'], PATHINFO_EXTENSION));
    $fotoPlacaUrl = "/delivery/backend/uploads/repartidores/{$codigo}-placa.{$extPlaca}";
    move_uploaded_file($_FILES['foto_placa']['tmp_name'], $uploadDir . basename($fotoPlacaUrl));

    $lat = 10.49100000;
    $lng = -66.86200000;
    if (!empty($ubicacionGps)) {
        $parts = explode(',', $ubicacionGps);
        if (count($parts) >= 2) {
            $lat = (float)trim($parts[0]);
            $lng = (float)trim($parts[1]);
        }
    }

    $sql = "INSERT INTO conductores (
                id, nombre, apellido, cedula, fecha_nacimiento,
                telefono, telefono_adicional, email, password_hash,
                foto_url, direccion, punto_referencia,
                latitud_actual, longitud_actual,
                placa_moto, marca_moto, modelo_moto, color_moto,
                foto_licencia_url, foto_certificado_medico_url,
                foto_carnet_circulacion_url, foto_vehiculo_url, foto_placa_url,
                disponible, en_carrera, saldo_billetera_usd, bloqueado_por_saldo
            ) VALUES (
                :id, :nombre, :apellido, :cedula, :fecha_nacimiento,
                :telefono, :telefono_adicional, :email, :password_hash,
                :foto, :direccion, :referencia,
                :lat, :lng,
                :placa, :marca, :modelo, :color,
                :foto_licencia, :foto_certificado,
                :foto_carnet, :foto_vehiculo, :foto_placa,
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
            'password_hash' => $passwordHash,
            'foto' => $fotoPerfilUrl,
            'direccion' => $direccion,
            'referencia' => !empty($puntoReferencia) ? $puntoReferencia : null,
            'lat' => $lat,
            'lng' => $lng,
            'placa' => $placaVehiculo,
            'marca' => $marcaVehiculo,
            'modelo' => $modeloVehiculo,
            'color' => !empty($colorVehiculo) ? $colorVehiculo : 'Negro',
            'foto_licencia' => $licenciaUrl,
            'foto_certificado' => $certMedicoUrl,
            'foto_carnet' => $carnetUrl,
            'foto_vehiculo' => $fotoVehiculoUrl,
            'foto_placa' => $fotoPlacaUrl
        ]);

        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Registro de repartidor exitoso',
            'codigo_conductor' => $codigo,
            'password_temporal' => $temporaryPassword,
            'repartidor_id' => $id
        ], 201);

    } catch (PDOException $e) {
        Database::jsonResponse(['success' => false, 'mensaje' => 'Error al registrar: ' . $e->getMessage()], 500);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción o método no soportado'], 405);