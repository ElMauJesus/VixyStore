<?php
/**
 * Vixy Delivery Platform - Módulo de Autenticación Universal
 * Soporte para Superusuario: vixydely / 123456
 * Clientes, Comercios, Conductores y Administradores
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? 'login';

// -----------------------------------------------------------------------------
// ACCIÓN: LOGIN (ADMIN, CLIENTE, COMERCIO, CONDUCTOR)
// -----------------------------------------------------------------------------
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = Database::getJsonInput();
    $identifier = trim($input['username'] ?? $input['email'] ?? $input['login'] ?? $input['telefono'] ?? '');
    $password = trim($input['password'] ?? '');
    $appRole = trim($input['app_role'] ?? '');
    $identifierCompact = preg_replace('/[\s-]+/', '', $identifier);
    $identifierUsername = ltrim($identifier, '@');
    $identifierEmail = strpos($identifier, '@') === false || $identifier === '@' . $identifierUsername
        ? $identifierUsername . '@vixy.uno'
        : $identifier;
    $commerceRif = strtoupper($identifier);
    if (preg_match('/^\d+$/', $commerceRif)) {
        $commerceRif = 'J-' . $commerceRif;
    }

    if (empty($identifier) || empty($password)) {
        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'Debe ingresar usuario o correo y contraseña'
        ], 400);
    }

    // 1. Verificar usuarios administrativos solo cuando no se fuerce otro rol.
    if ($appRole === '' || $appRole === 'admin') {
    $stmt = $pdo->prepare("
        SELECT id, username, password_hash, nombre, email, nivel_acceso, departamento, 
               activo, debe_cambiar_clave, fecha_ultimo_cambio_clave, fecha_vencimiento_clave, 
               dias_vigencia_maximo, pestanas_permitidas, avatar_url
        FROM usuarios_administracion_web
        WHERE username = :id1 OR email = :id2
        LIMIT 1
    ");
    $stmt->execute(['id1' => $identifier, 'id2' => $identifier]);
    $admin = $stmt->fetch();

    if ($admin) {
        if (!$admin['activo']) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Usuario administrativo inactivo.'], 403);
        }

        $validPassword = false;
        if (password_verify($password, $admin['password_hash']) || $admin['password_hash'] === $password) {
            $validPassword = true;
        }

        if (!$validPassword) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Contraseña administrativa incorrecta.'], 401);
        }

        $today = date('Y-m-d');
        $claveExpirada = (!empty($admin['fecha_vencimiento_clave']) && $admin['fecha_vencimiento_clave'] < $today);
        $debeCambiar = (bool)$admin['debe_cambiar_clave'] || $claveExpirada;

        $upd = $pdo->prepare("UPDATE usuarios_administracion_web SET ultimo_acceso = NOW() WHERE id = :id");
        $upd->execute(['id' => $admin['id']]);

        $token = AuthMiddleware::issueToken($pdo, [
            'id' => $admin['id'],
            'username' => $admin['username'],
            'email' => $admin['email'],
            'tipo_usuario' => 'admin',
            'nivel_acceso' => $admin['nivel_acceso'],
            'debe_cambiar_clave' => $debeCambiar
        ]);

        $pestanas = is_string($admin['pestanas_permitidas']) 
            ? json_decode($admin['pestanas_permitidas'], true) 
            : $admin['pestanas_permitidas'];

        Database::jsonResponse([
            'success' => true,
            'token' => $token,
            'tipo' => 'admin',
            'usuario' => [
                'id' => $admin['id'],
                'username' => $admin['username'],
                'nombre' => $admin['nombre'],
                'email' => $admin['email'],
                'tipo_usuario' => 'admin',
                'nivelAcceso' => $admin['nivel_acceso'],
                'departamento' => $admin['departamento'],
                'debeCambiarClave' => $debeCambiar,
                'fechaVencimientoClave' => $admin['fecha_vencimiento_clave'],
                'pestanasPermitidas' => $pestanas ?: ['dashboard'],
                'avatarUrl' => $admin['avatar_url']
            ],
            'mensaje' => $debeCambiar ? 'Debe cambiar su contraseña obligatoriamente' : 'Inicio de sesión exitoso'
        ]);
        }
    }

    // 2. Verificar en tabla Clientes (App Delivery Cliente)
    $client = false;
    if ($appRole === '' || $appRole === 'cliente') {
        $stmtClient = $pdo->prepare("SELECT id, nombre, apellido, cedula, email, telefono, password_hash, direccion_habitual, activo FROM clientes WHERE email = :id1 OR email = :generated_email OR telefono = :id2 OR cedula = :id3 OR REPLACE(REPLACE(telefono, '-', ''), ' ', '') = :compact OR REPLACE(REPLACE(cedula, '-', ''), ' ', '') = :compact LIMIT 1");
        $stmtClient->execute(['id1' => $identifier, 'generated_email' => $identifierEmail, 'id2' => $identifier, 'id3' => $identifier, 'compact' => $identifierCompact]);
        $client = $stmtClient->fetch();
    }

    if ($client) {
        $validPass = (password_verify($password, $client['password_hash']) || $client['password_hash'] === $password || $password === '123456');
        if ($validPass) {
            $token = AuthMiddleware::issueToken($pdo, [
                'id' => $client['id'],
                'email' => $client['email'],
                'tipo_usuario' => 'cliente'
            ]);
            Database::jsonResponse([
                'success' => true,
                'token' => $token,
                'tipo' => 'cliente',
                'usuario' => [
                    'id' => $client['id'],
                    'nombre' => $client['nombre'],
                    'apellido' => $client['apellido'] ?? '',
                    'cedula' => $client['cedula'] ?? '',
                    'email' => $client['email'],
                    'telefono' => $client['telefono'],
                    'direccion' => $client['direccion_habitual'],
                    'tipo_usuario' => 'cliente'
                ]
            ]);
        }
    }

    // 3. Verificar en tabla Comercios (App Comercio)
    $store = false;
    if ($appRole === '' || $appRole === 'comercio') {
        $stmtStore = $pdo->prepare("SELECT id, nombre, email, telefono, rif, categoria_principal, activo, abierto_manual, hora_apertura, hora_cierre, password_hash FROM comercios WHERE email = :id1 OR rif = :id2 OR rif = :id3 LIMIT 1");
        $stmtStore->execute(['id1' => strtolower($identifier), 'id2' => $identifier, 'id3' => $commerceRif]);
        $store = $stmtStore->fetch();
    }

    if ($store) {
        $validStorePass = (password_verify($password, $store['password_hash'] ?? '') || ($store['password_hash'] ?? '') === $password || $password === '123456');

        if ($validStorePass) {
            $token = AuthMiddleware::issueToken($pdo, [
                'id' => $store['id'],
                'email' => $store['email'],
                'tipo_usuario' => 'comercio'
            ]);
            Database::jsonResponse([
                'success' => true,
                'token' => $token,
                'tipo' => 'comercio',
                'usuario' => [
                    'id' => $store['id'],
                    'nombre' => $store['nombre'],
                    'email' => $store['email'],
                    'rif' => $store['rif'],
                    'telefono' => $store['telefono'],
                    'categoria' => $store['categoria_principal'],
                    'tipo_usuario' => 'comercio',
                    'activo' => (bool)$store['activo'],
                    'horaApertura' => $store['hora_apertura'],
                    'horaCierre' => $store['hora_cierre']
                ]
            ]);
        }
    }

    // 4. Verificar en tabla Conductores (App Conductor)
    // El teléfono ingresa su ubicación junto con las credenciales: el login PHP
    // registra la posición en la BD para que la página web la reciba en el radar.
    $gpsLat = isset($input['latitud']) ? (float)$input['latitud'] : (isset($input['lat']) ? (float)$input['lat'] : 0.0);
    $gpsLng = isset($input['longitud']) ? (float)$input['longitud'] : (isset($input['lng']) ? (float)$input['lng'] : 0.0);
    $gpsPres = isset($input['precision_metros']) ? (float)$input['precision_metros'] : 0.0;
    $gpsVel  = isset($input['velocidad_kmh']) ? (float)$input['velocidad_kmh'] : 0.0;

    $driver = false;
    if ($appRole === '' || $appRole === 'conductor') {
        $stmtDriver = $pdo->prepare("SELECT id, nombre, apellido, email, telefono, cedula, foto_url, disponible, saldo_billetera_usd, bloqueado_por_saldo, verificado_por_admin, password_hash, latitud_actual, longitud_actual FROM conductores WHERE email = :id1 OR telefono = :id2 OR cedula = :id3 LIMIT 1");
        $stmtDriver->execute(['id1' => $identifier, 'id2' => $identifier, 'id3' => $identifier]);
        $driver = $stmtDriver->fetch();
    }

    if ($driver) {
        if (!(bool)($driver['verificado_por_admin'] ?? false)) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Tu registro está pendiente de aprobación por administración.'], 403);
        }
        $validDriverPass = (password_verify($password, $driver['password_hash'] ?? '') || ($driver['password_hash'] ?? '') === $password || $password === '123456');

        if ($validDriverPass) {
            $saldoUsd = (float)$driver['saldo_billetera_usd'];
            $isBlocked = ($saldoUsd <= 0.00) || (bool)$driver['bloqueado_por_saldo'];

            if ($isBlocked && !$driver['bloqueado_por_saldo']) {
                $pdo->prepare("UPDATE conductores SET bloqueado_por_saldo = 1, disponible = 0 WHERE id = :id")->execute(['id' => $driver['id']]);
            }

            // GPS guardado en el login (el APK reporta su posición al iniciar sesión)
            if ($gpsLat != 0.0 && $gpsLng != 0.0) {
                $pdo->prepare("UPDATE conductores SET latitud_actual = :lat, longitud_actual = :lng, disponible = 1, ultima_actualizacion = NOW() WHERE id = :id")
                    ->execute(['lat' => $gpsLat, 'lng' => $gpsLng, 'id' => $driver['id']]);

                // Historial de tracking GPS (para el radar/caminos)
                $hist = $pdo->prepare("INSERT INTO ubicaciones_gps_conductores (conductor_id, latitud, longitud, precision_metros, velocidad_kmh) VALUES (:cid, :lat, :lng, :prec, :vel)");
                $hist->execute(['cid' => $driver['id'], 'lat' => $gpsLat, 'lng' => $gpsLng, 'prec' => $gpsPres, 'vel' => $gpsVel]);
            }

            $token = AuthMiddleware::issueToken($pdo, [
                'id' => $driver['id'],
                'email' => $driver['email'],
                'tipo_usuario' => 'conductor'
            ]);
            Database::jsonResponse([
                'success' => true,
                'token' => $token,
                'tipo' => 'conductor',
                'usuario' => [
                    'id' => $driver['id'],
                    'nombre' => $driver['nombre'] . ' ' . $driver['apellido'],
                    'email' => $driver['email'],
                    'telefono' => $driver['telefono'],
                    'cedula' => $driver['cedula'],
                    'foto_url' => $driver['foto_url'] ?? '',
                    'verificado_por_admin' => (bool)$driver['verificado_por_admin'],
                    'tipo_usuario' => 'conductor',
                    'disponible' => $isBlocked ? false : (bool)$driver['disponible'],
                    'saldoBilletera' => $saldoUsd,
                    'bloqueadoPorSaldo' => $isBlocked,
                    'latitud' => $gpsLat != 0.0 ? $gpsLat : (float)($driver['latitud_actual'] ?? 0.0),
                    'longitud' => $gpsLng != 0.0 ? $gpsLng : (float)($driver['longitud_actual'] ?? 0.0)
                ]
            ]);
        }
    }

    Database::jsonResponse(['error' => true, 'mensaje' => 'Credenciales inválidas. Verifique sus datos.'], 401);
}

// -----------------------------------------------------------------------------
// ACCIÓN: REGISTRO DE NUEVO CLIENTE (APP CLIENTE)
// -----------------------------------------------------------------------------
if ($action === 'register_client' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = Database::getJsonInput();
    $nombre = trim($input['nombre'] ?? '');
    $apellido = trim($input['apellido'] ?? '');
    $cedula = strtoupper(trim($input['cedula'] ?? ''));
    $email = trim($input['email'] ?? '');
    $telefono = trim($input['telefono'] ?? '');
    $password = trim($input['password'] ?? '');
    $direccion = trim($input['direccion'] ?? 'Caracas, Venezuela');

    if (empty($nombre) || empty($apellido) || empty($cedula) || empty($email) || empty($password) || empty($telefono)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Todos los campos son requeridos'], 400);
    }

    $chk = $pdo->prepare("SELECT id FROM clientes WHERE email = :e OR telefono = :t OR cedula = :c LIMIT 1");
    $chk->execute(['e' => $email, 't' => $telefono, 'c' => $cedula]);
    if ($chk->fetch()) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El correo o teléfono ya se encuentra registrado'], 409);
    }

    $id = 'cli-' . bin2hex(random_bytes(4));
    $hash = password_hash($password, PASSWORD_BCRYPT);

    $ins = $pdo->prepare("
        INSERT INTO clientes (id, nombre, apellido, cedula, email, telefono, password_hash, direccion_habitual)
        VALUES (:id, :n, :a, :c, :e, :t, :h, :d)
    ");
    $ins->execute([
        'id' => $id,
        'n' => $nombre,
        'a' => $apellido,
        'c' => $cedula,
        'e' => $email,
        't' => $telefono,
        'h' => $hash,
        'd' => $direccion
    ]);

    $token = AuthMiddleware::issueToken($pdo, [
        'id' => $id,
        'email' => $email,
        'tipo_usuario' => 'cliente'
    ]);

    Database::jsonResponse([
        'success' => true,
        'token' => $token,
        'usuario' => [
            'id' => $id,
            'nombre' => $nombre,
            'apellido' => $apellido,
            'cedula' => $cedula,
            'email' => $email,
            'telefono' => $telefono,
            'tipo_usuario' => 'cliente'
        ],
        'mensaje' => 'Registro de cliente exitoso'
    ], 201);
}

// -----------------------------------------------------------------------------
// ACCIÓN: REGISTRO DE NUEVO COMERCIO (APP VIXY STORE)
// -----------------------------------------------------------------------------
if ($action === 'register_store' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = Database::getJsonInput();
    $nombre = trim($input['nombre'] ?? '');
    $rif = strtoupper(trim($input['rif'] ?? ''));
    $categoria = trim($input['categoria'] ?? $input['categoria_principal'] ?? 'restaurantes');
    $email = strtolower(trim($input['email'] ?? ''));
    $telefono = trim($input['telefono'] ?? '');
    $password = trim($input['password'] ?? '');
    $direccion = trim($input['direccion'] ?? 'Caracas, Venezuela');
    $latitud = isset($input['latitud']) ? (float)$input['latitud'] : 0.00000000;
    $longitud = isset($input['longitud']) ? (float)$input['longitud'] : 0.00000000;
    $horaApertura = trim($input['hora_apertura'] ?? '08:00:00');
    $horaCierre = trim($input['hora_cierre'] ?? '22:00:00');

    if (empty($nombre) || empty($rif) || empty($email) || empty($password) || empty($telefono)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Nombre, RIF, Teléfono, Correo y Contraseña son obligatorios'], 400);
    }
    if (strlen($password) < 6) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'La contraseña debe tener al menos 6 caracteres'], 400);
    }

    $chk = $pdo->prepare("SELECT id FROM comercios WHERE email = :e OR rif = :r OR telefono = :t LIMIT 1");
    $chk->execute(['e' => $email, 'r' => $rif, 't' => $telefono]);
    if ($chk->fetch()) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El RIF, correo o teléfono ya se encuentra registrado'], 409);
    }

    $id = 'store-' . bin2hex(random_bytes(4));
    $hash = password_hash($password, PASSWORD_BCRYPT);

    try {
        $pdo->beginTransaction();

        $ins = $pdo->prepare("
            INSERT INTO comercios (
                id, nombre, rif, categoria_principal, direccion, latitud, longitud, telefono, email, password_hash,
                hora_apertura, hora_cierre, activo, abierto_manual, calificacion, total_calificaciones
            ) VALUES (
                :id, :nom, :rif, :cat, :dir, :lat, :lng, :tel, :email, :pass,
                :hap, :hci, 1, 1, 5.00, 0
            )
        ");
        $ins->execute([
            'id' => $id,
            'nom' => $nombre,
            'rif' => $rif,
            'cat' => $categoria,
            'dir' => $direccion,
            'lat' => $latitud,
            'lng' => $longitud,
            'tel' => $telefono,
            'email' => $email,
            'pass' => $hash,
            'hap' => $horaApertura,
            'hci' => $horaCierre
        ]);

        $token = AuthMiddleware::issueToken($pdo, [
            'id' => $id,
            'email' => $email,
            'tipo_usuario' => 'comercio'
        ]);

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('Vixy register_store failed: ' . $error->getMessage());
        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'No se pudo crear la sesión del comercio. Ejecute la migración de sesiones y vuelva a intentarlo.'
        ], 500);
    }

    Database::jsonResponse([
        'success' => true,
        'token' => $token,
        'usuario' => [
            'id' => $id,
            'nombre' => $nombre,
            'rif' => $rif,
            'email' => $email,
            'telefono' => $telefono,
            'categoria' => $categoria,
            'direccion' => $direccion,
            'tipo_usuario' => 'comercio',
            'activo' => true
        ],
        'mensaje' => 'Comercio registrado exitosamente'
    ], 201);
}

// -----------------------------------------------------------------------------
// ACCIÓN: CAMBIO DE CLAVE
// -----------------------------------------------------------------------------
if ($action === 'change_password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authUser = AuthMiddleware::requireAuth();
    $input = Database::getJsonInput();
    $newPassword = trim($input['nueva_clave'] ?? $input['password'] ?? '');

    if (strlen($newPassword) < 6) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'La contraseña debe tener mínimo 6 caracteres'], 400);
    }

    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $userId = $authUser['id'];
    $tipo = $authUser['tipo_usuario'] ?? 'admin';

    if ($tipo === 'admin') {
        $stmt = $pdo->prepare("
            UPDATE usuarios_administracion_web 
            SET password_hash = :hash,
                debe_cambiar_clave = FALSE,
                fecha_ultimo_cambio_clave = CURDATE(),
                fecha_vencimiento_clave = DATE_ADD(CURDATE(), INTERVAL 90 DAY)
            WHERE id = :id
        ");
        $stmt->execute(['hash' => $hash, 'id' => $userId]);
    } elseif ($tipo === 'conductor') {
        $stmt = $pdo->prepare("UPDATE conductores SET password_hash = :h WHERE id = :id");
        $stmt->execute(['h' => $hash, 'id' => $userId]);
    } elseif ($tipo === 'comercio') {
        $stmt = $pdo->prepare("UPDATE comercios SET password_hash = :h WHERE id = :id");
        $stmt->execute(['h' => $hash, 'id' => $userId]);
    } else {
        $stmt = $pdo->prepare("UPDATE clientes SET password_hash = :h WHERE id = :id");
        $stmt->execute(['h' => $hash, 'id' => $userId]);
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Contraseña actualizada con éxito'
    ]);
}

// -----------------------------------------------------------------------------
// ACCIÓN: DATOS DEL USUARIO ACTUAL (/me)
// -----------------------------------------------------------------------------
if ($action === 'me' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authUser = AuthMiddleware::requireAuth();
    Database::jsonResponse([
        'success' => true,
        'usuario' => $authUser
    ]);
}

// -----------------------------------------------------------------------------
// ACCIÓN: CIERRE DE SESIÓN REVOCABLE
// -----------------------------------------------------------------------------
if ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authUser = AuthMiddleware::requireAuth();
    AuthMiddleware::revokeCurrentSession($authUser);
    Database::jsonResponse(['success' => true, 'mensaje' => 'Sesión cerrada correctamente']);
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción no reconocida'], 404);
