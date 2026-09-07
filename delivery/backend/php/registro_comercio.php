<?php
/**
 * Vixy Delivery Platform — Registro de Comercios
 * Endpoint: POST /backend/php/registro_comercio.php
 *
 * Tipos de comercio:
 *  - con_rif        → Comercio con RIF Jurídico (J-XXXXXXXX-X)
 *  - independiente  → Comercio independiente (usa C.I. del representante)
 *
 * Respuesta exitosa:
 *  {
 *    "success": true,
 *    "codigo_comercio": "COM-20260906-A3F9BC",
 *    "password_temporal": "Vx7mK2pQ",
 *    "identificador": "J-12345678-9"
 *  }
 */

require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method !== 'POST') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido'], 405);
}

$data = Database::getJsonInput();

// ─── Tipo de Comercio ────────────────────────────────────────────────────────
$tipo = trim($data['tipo_comercio'] ?? 'con_rif');
if (!in_array($tipo, ['con_rif', 'independiente'])) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'tipo_comercio invalido. Use: con_rif o independiente'], 400);
}

// ─── Validacion campos comunes ────────────────────────────────────────────────
$nombreComercial   = trim($data['nombre_comercial'] ?? '');
$nombreRepres      = trim($data['nombre_representante'] ?? '');
$cedulaRepres      = trim($data['cedula_representante'] ?? '');
$telefonoComercio  = trim($data['telefono_comercio'] ?? '');
$email             = trim($data['email'] ?? '');
$categoriaNegocio  = trim($data['categoria_negocio'] ?? 'General');
$direccionNegocio  = trim($data['direccion_negocio'] ?? '');
$puntoReferencia   = trim($data['punto_referencia'] ?? '');
$horariosAtencion  = trim($data['horarios_atencion'] ?? '08:00 AM - 10:00 PM');
$ubicacionGps      = trim($data['ubicacion_gps'] ?? '');
$telefonoAdicional = trim($data['telefono_adicional'] ?? '');

if (empty($nombreComercial) || empty($nombreRepres) || empty($cedulaRepres) || empty($telefonoComercio)) {
    Database::jsonResponse([
        'error'   => true,
        'mensaje' => 'Los campos nombre_comercial, nombre_representante, cedula_representante y telefono_comercio son obligatorios.'
    ], 400);
}

// ─── RIF (solo para tipo con_rif) ────────────────────────────────────────────
$rif = '';
if ($tipo === 'con_rif') {
    $rif = trim($data['rif_cedula_juridica'] ?? $data['rif'] ?? '');
    if (empty($rif)) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El RIF es obligatorio para comercios con RIF juridico.'], 400);
    }
}

// Identificador principal para el login
$identificadorPrincipal = ($tipo === 'con_rif') ? $rif : $cedulaRepres;

// ─── Conexion a c2861522_regist ───────────────────────────────────────────────
$pdoRegist = Database::getRegistConnection();
if (!$pdoRegist) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'No se puede conectar a la base de datos de registro.'], 500);
}

// ─── Verificar duplicados ────────────────────────────────────────────────────
$dupRif = ($rif !== '') ? $rif : 'NO_RIF_' . uniqid();
$dupEmail = ($email !== '') ? $email : 'NO_EMAIL_' . uniqid();

$dupCheck = $pdoRegist->prepare(
    "SELECT id FROM comercios
     WHERE telefono_comercio = :tel
        OR rif_cedula_juridica = :rif
        OR email = :email
     LIMIT 1"
);
$dupCheck->execute(['tel' => $telefonoComercio, 'rif' => $dupRif, 'email' => $dupEmail]);
if ($dupCheck->fetch()) {
    Database::jsonResponse([
        'error'   => true,
        'mensaje' => 'Ya existe un comercio registrado con ese telefono, RIF o correo electronico.'
    ], 409);
}

// ─── Generar codigo unico de comercio ─────────────────────────────────────────
function generarCodigoComercio(PDO $pdo): string {
    $intentos = 0;
    do {
        $codigo = 'COM-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $st = $pdo->prepare("SELECT id FROM comercios WHERE codigo_comercio = :c LIMIT 1");
        $st->execute(['c' => $codigo]);
        $intentos++;
    } while ($st->fetch() && $intentos < 10);
    return $codigo;
}

$codigoComercio = generarCodigoComercio($pdoRegist);

// ─── Generar contrasena temporal ──────────────────────────────────────────────
function generarPasswordTemporal(int $longitud = 8): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    $password = '';
    for ($i = 0; $i < $longitud; $i++) {
        $password .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $password;
}

$passwordTemporal = generarPasswordTemporal(8);
$passwordHash     = password_hash($passwordTemporal, PASSWORD_BCRYPT);

// ─── Insertar en base de datos ────────────────────────────────────────────────
try {
    $sql = "
        INSERT INTO comercios (
            tipo_comercio, codigo_comercio, password_hash,
            nombre_comercial, nombre_representante, cedula_representante, rif_cedula_juridica,
            telefono_comercio, telefono_adicional, email,
            categoria_negocio, direccion_negocio, punto_referencia,
            ubicacion_gps, horarios_atencion, status, created_at
        ) VALUES (
            :tipo, :codigo, :phash,
            :nombre, :nombre_rep, :cedula_rep, :rif,
            :tel, :tel_adic, :email,
            :cat, :dir, :ref,
            :gps, :horario, 'pendiente', NOW()
        )
    ";
    $stmt = $pdoRegist->prepare($sql);
    $stmt->execute([
        'tipo'       => $tipo,
        'codigo'     => $codigoComercio,
        'phash'      => $passwordHash,
        'nombre'     => $nombreComercial,
        'nombre_rep' => $nombreRepres,
        'cedula_rep' => $cedulaRepres,
        'rif'        => $rif,
        'tel'        => $telefonoComercio,
        'tel_adic'   => $telefonoAdicional,
        'email'      => $email,
        'cat'        => $categoriaNegocio,
        'dir'        => $direccionNegocio,
        'ref'        => $puntoReferencia,
        'gps'        => $ubicacionGps,
        'horario'    => $horariosAtencion,
    ]);
} catch (PDOException $e) {
    error_log('Error registro comercio: ' . $e->getMessage());
    Database::jsonResponse([
        'error'   => true,
        'mensaje' => 'Error al registrar el comercio. Por favor intente de nuevo.',
        'detalle' => $e->getMessage()
    ], 500);
}

// ─── Respuesta exitosa ────────────────────────────────────────────────────────
Database::jsonResponse([
    'success'           => true,
    'mensaje'           => 'Comercio registrado exitosamente en Vixy Delivery.',
    'tipo_comercio'     => $tipo,
    'codigo_comercio'   => $codigoComercio,
    'password_temporal' => $passwordTemporal,
    'identificador'     => $identificadorPrincipal,
    'instrucciones'     => 'Guarda estos datos. Usaras el identificador (RIF o Cedula) + tu Codigo de Comercio + esta contrasena para iniciar sesion en Vixy Delivery. Puedes cambiarla desde la configuracion de tu cuenta.'
], 201);
