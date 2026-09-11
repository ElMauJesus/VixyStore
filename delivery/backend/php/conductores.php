<?php
/**
 * Vixy Delivery Platform - API de Conductores y GPS en Tiempo Real
 * Actualización periódica de coordenadas, disponibilidad y control de billetera (saldo > $0.00 para recibir viajes)
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// -----------------------------------------------------------------------------
// POST: REGISTRO DE NUEVO CONDUCTOR
// -----------------------------------------------------------------------------
if ($method === 'POST' && $action === 'register') {
    $data = Database::getJsonInput();
    $nombre = trim($data['nombre'] ?? '');
    $apellido = trim($data['apellido'] ?? '');
    $cedula = strtoupper(trim($data['cedula'] ?? ''));
    $telefono = trim($data['telefono'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));
    // El correo es opcional para conductores; nunca lo derives del nombre.
    if ($email === '' || (str_ends_with($email, '@vixydelivery.com') && !str_starts_with($email, 'conductor-'))) {
        $email = 'conductor-' . bin2hex(random_bytes(8)) . '@vixydelivery.com';
    }
    $password = (string)($data['password'] ?? '');
    $placa = strtoupper(trim($data['placaMoto'] ?? ''));
    $marca = trim($data['marcaMoto'] ?? '');
    $modelo = trim($data['modeloMoto'] ?? '');
    $ano = trim($data['anoMoto'] ?? '');

    if (!$nombre || !$apellido || !$cedula || !$telefono || !$email || !$placa || !$marca || !$modelo || !$ano) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Complete todos los datos personales y del vehículo requeridos.'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El correo electrónico no es válido.'], 400);
    }
    if (strlen($password) < 8) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'La contraseña debe tener al menos 8 caracteres.'], 400);
    }

    try {
        $exists = $pdo->prepare('SELECT id FROM conductores WHERE cedula = :cedula OR telefono = :telefono OR email = :email OR placa_moto = :placa LIMIT 1');
        $exists->execute(['cedula' => $cedula, 'telefono' => $telefono, 'email' => $email, 'placa' => $placa]);
        if ($exists->fetch()) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'La cédula, teléfono, correo o placa ya está registrada.'], 409);
        }

        $driverId = 'cond-' . bin2hex(random_bytes(8));
        $availableColumns = array_column($pdo->query('SHOW COLUMNS FROM conductores')->fetchAll(), 'Field');
        $values = [
            'id' => $driverId,
            'nombre' => $nombre,
            'apellido' => $apellido,
            'cedula' => $cedula,
            'telefono' => $telefono,
            'email' => $email,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'disponible' => 0,
            'placa_moto' => $placa,
            'marca_moto' => $marca,
            'modelo_moto' => $modelo,
            'ano_moto' => $ano,
            'color_moto' => trim($data['colorMoto'] ?? '') ?: 'No especificado',
            'licencia_grado' => trim($data['licenciaGrado'] ?? '') ?: '2',
            'licencia_vencimiento' => trim($data['licenciaVencimiento'] ?? '') ?: null,
            'foto_cedula_url' => trim($data['fotoCedulaUrl'] ?? '') ?: null,
            'foto_licencia_url' => trim($data['fotoLicenciaUrl'] ?? '') ?: null,
            'foto_certificado_medico_url' => trim($data['fotoCertificadoMedicoUrl'] ?? '') ?: null,
            'foto_carnet_circulacion_url' => trim($data['fotoCarnetCirculacionUrl'] ?? '') ?: null,
            'foto_vehiculo_url' => trim($data['fotoVehiculoUrl'] ?? '') ?: null,
            'foto_placa_url' => trim($data['fotoPlacaUrl'] ?? '') ?: null,
            'terminos_aceptados' => 1,
            'estado_registro' => 'pendiente_aprobacion',
            'verificado_por_admin' => 0,
        ];
        $missingRequired = array_diff(['id', 'nombre', 'apellido', 'cedula', 'telefono', 'email', 'password_hash', 'placa_moto', 'marca_moto', 'modelo_moto', 'ano_moto'], $availableColumns);
        if ($missingRequired) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'La tabla conductores no tiene las columnas requeridas: ' . implode(', ', $missingRequired)], 500);
        }
        $values = array_intersect_key($values, array_flip($availableColumns));
        $columns = array_keys($values);
        $statement = 'INSERT INTO conductores (`' . implode('`, `', $columns) . '`) VALUES (:' . implode(', :', $columns) . ')';
        $pdo->prepare($statement)->execute($values);

        Database::jsonResponse([
            'success' => true,
            'conductor_id' => $driverId,
            'estado' => 'pendiente_aprobacion',
            'mensaje' => 'Registro recibido. La cuenta estará disponible cuando sea aprobada por administración.'
        ], 201);
    } catch (Throwable $error) {
        error_log('Vixy registro de conductor: ' . $error->getMessage());
        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'No se pudo guardar el registro. Verifique la estructura de la tabla conductores.'
        ], 500);
    }
}

// -----------------------------------------------------------------------------
// PUT: APROBAR O RECHAZAR REGISTRO DE CONDUCTOR (ADMINISTRACIÓN)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && in_array($action, ['approve', 'reject'], true)) {
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'operador']);
    $data = Database::getJsonInput();
    $driverId = trim((string)($data['conductor_id'] ?? $id ?? ''));

    if ($driverId === '') {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Debe indicar el conductor a actualizar.'], 400);
    }

    if ($action === 'approve') {
        $stmt = $pdo->prepare("UPDATE conductores SET verificado_por_admin = 1, estado_registro = 'aprobado', disponible = 0 WHERE id = :id");
        $stmt->execute(['id' => $driverId]);
        Database::jsonResponse(['success' => true, 'estado' => 'aprobado', 'mensaje' => 'Conductor aprobado correctamente.']);
    }

    $stmt = $pdo->prepare("UPDATE conductores SET verificado_por_admin = 0, estado_registro = 'rechazado', disponible = 0 WHERE id = :id");
    $stmt->execute(['id' => $driverId]);
    Database::jsonResponse(['success' => true, 'estado' => 'rechazado', 'mensaje' => 'Conductor rechazado correctamente.']);
}

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

    // Listar conductores disponibles para mapa de administración o asignación
    $soloDisponibles = isset($_GET['disponibles']) ? (bool)$_GET['disponibles'] : true;
    $sql = "SELECT id, nombre, apellido, cedula, telefono, email, foto_url, disponible, en_carrera, latitud_actual, longitud_actual, saldo_billetera_usd, bloqueado_por_saldo, rating, total_carreras, placa_moto, marca_moto, modelo_moto, ano_moto, licencia_grado, verificado_por_admin, estado_registro, foto_cedula_url, foto_licencia_url, foto_certificado_medico_url, foto_carnet_circulacion_url, foto_vehiculo_url, foto_placa_url FROM conductores WHERE 1=1";
    
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

    $isSuperAdmin = ($authUser['nivel_acceso'] ?? '') === 'super_admin' || ($authUser['tipo_usuario'] ?? '') === 'super_admin';
    $driverId = $isSuperAdmin && !empty($data['conductor_id']) ? $data['conductor_id'] : $authUser['id'];
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
// PUT: ACTUALIZAR FOTO DE PERFIL
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $action === 'perfil') {
    $authUser = AuthMiddleware::requireAuth(['conductor', 'super_admin']);
    $data = Database::getJsonInput();
    $isSuperAdmin = ($authUser['nivel_acceso'] ?? '') === 'super_admin' || ($authUser['tipo_usuario'] ?? '') === 'super_admin';
    $driverId = $isSuperAdmin && !empty($data['conductor_id']) ? $data['conductor_id'] : $authUser['id'];
    $fotoUrl = trim((string)($data['foto_url'] ?? ''));

    if ($fotoUrl === '' || strlen($fotoUrl) > 255) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'La URL de la foto no es válida.'], 400);
    }

    $stmt = $pdo->prepare('UPDATE conductores SET foto_url = :foto_url WHERE id = :id');
    $stmt->execute(['foto_url' => $fotoUrl, 'id' => $driverId]);
    Database::jsonResponse(['success' => true, 'foto_url' => $fotoUrl, 'mensaje' => 'Foto de perfil actualizada.']);
}

// -----------------------------------------------------------------------------
// PUT: CAMBIAR DISPONIBILIDAD (ON/OFF)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $action === 'disponibilidad') {
    $authUser = AuthMiddleware::requireAuth(['conductor', 'super_admin']);
    $data = Database::getJsonInput();
    $isSuperAdmin = ($authUser['nivel_acceso'] ?? '') === 'super_admin' || ($authUser['tipo_usuario'] ?? '') === 'super_admin';
    $driverId = $isSuperAdmin && !empty($data['conductor_id']) ? $data['conductor_id'] : $authUser['id'];
    $disponible = isset($data['disponible']) ? (int)$data['disponible'] : 1;

    if ($disponible !== 0 && $disponible !== 1) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El valor de disponibilidad no es válido'], 400);
    }

    // Verificar si está bloqueado por falta de verificación (debe estar aprobado por administración)
    $stmtVerif = $pdo->prepare("SELECT verificado_por_admin FROM conductores WHERE id = :id");
    $stmtVerif->execute(['id' => $driverId]);
    $verifRow = $stmtVerif->fetch();

    if (!$verifRow || !(int)($verifRow['verificado_por_admin'] ?? 0)) {
        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'Tu cuenta aún está pendiente de verificación por administración. No puedes conectarte para recibir viajes hasta ser aprobado.'
        ], 403);
    }

    // Verificar si está bloqueado por saldo (debe tener saldo POSITIVO: recargar para recibir viajes)
    $stmtCheck = $pdo->prepare("SELECT saldo_billetera_usd, limite_saldo_negativo, bloqueado_por_saldo FROM conductores WHERE id = :id");
    $stmtCheck->execute(['id' => $driverId]);
    $driver = $stmtCheck->fetch();

    if ($driver && $driver['saldo_billetera_usd'] <= 0.00) {
        $stmtBlock = $pdo->prepare("UPDATE conductores SET bloqueado_por_saldo = 1, disponible = 0 WHERE id = :id");
        $stmtBlock->execute(['id' => $driverId]);

        Database::jsonResponse([
            'error' => true,
            'bloqueado' => true,
            'mensaje' => 'Debes recargar tu billetera para recibir viajes. Tu saldo actual es: $' . number_format($driver['saldo_billetera_usd'], 2) . ' USD (mínimo requerido: $0.01 USD).'
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

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción o método no soportado'], 405);
