<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/error-liquidacion.log');

/**
 * Vixy Delivery Platform - Solicitud de Liquidación (Delivery/Comercio)
 * Permite al conductor o comercio solicitar el retiro de su saldo disponible
 * El saldo se lee directamente de conductores.saldo_billetera_usd o comercios.saldo_billetera_usd
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Database::jsonResponse(['success' => false, 'mensaje' => 'Método no permitido'], 405);
}

// Autenticación: conductor o comercio
// TEMPORAL PARA PRUEBAS - QUITAR ANTES DE SUBIR
$authUser = [
    'id' => 'cond-3870be629fa25ff2',
    'tipo_usuario' => 'conductor'
];

// $authUser = AuthMiddleware::requireAuth(['conductor', 'comercio']);

$data = Database::getJsonInput();

$usuarioId = $authUser['id'] ?? '';
$tipoUsuario = $authUser['tipo_usuario'] ?? '';

$montoSolicitado = round((float)($data['monto_solicitado_usd'] ?? 0), 2);
$metodoPago = trim((string)($data['metodo_pago'] ?? ''));
$bancoDestino = trim((string)($data['banco_destino'] ?? ''));
$cuentaTelefonoDestino = trim((string)($data['cuenta_telefono_destino'] ?? ''));
$titularDestino = trim((string)($data['titular_destino'] ?? ''));
$cedulaRifDestino = trim((string)($data['cedula_rif_destino'] ?? ''));

// =============================================================================
// VALIDACIONES
// =============================================================================

// 1. Tipo de usuario válido
if (!in_array($tipoUsuario, ['conductor', 'comercio'], true)) {
    Database::jsonResponse(['success' => false, 'mensaje' => 'Tipo de usuario no válido para liquidación'], 403);
}

// 2. Monto mínimo $10
if ($montoSolicitado < 10) {
    Database::jsonResponse(['success' => false, 'mensaje' => 'El monto mínimo de retiro es $10'], 400);
}

// 3. Método de pago válido
if (!in_array($metodoPago, ['transferencia', 'pago_movil'], true)) {
    Database::jsonResponse(['success' => false, 'mensaje' => 'Método de pago no válido. Use transferencia o pago_movil'], 400);
}

// 4. Datos bancarios requeridos
if ($bancoDestino === '' || $cuentaTelefonoDestino === '' || $titularDestino === '' || $cedulaRifDestino === '') {
    Database::jsonResponse(['success' => false, 'mensaje' => 'Banco, cuenta/teléfono, titular y cédula/RIF son obligatorios'], 400);
}

// 5. Horario permitido: 11am - 7pm
$horaActual = (int)date('G');
if ($horaActual < 11 || $horaActual >= 19) {
    Database::jsonResponse(['success' => false, 'mensaje' => 'Solo puede solicitar retiros entre 11:00 AM y 7:00 PM'], 400);
}

try {
    $pdo->beginTransaction();

    // 6. Verificar saldo disponible (directo de la tabla del usuario)
    if ($tipoUsuario === 'conductor') {
        $stmtSaldo = $pdo->prepare("SELECT saldo_billetera_usd AS saldo FROM conductores WHERE id = :usuario_id");
    } else {
        $stmtSaldo = $pdo->prepare("SELECT saldo_billetera_usd AS saldo FROM comercios WHERE id = :usuario_id");
    }
    $stmtSaldo->execute(['usuario_id' => $usuarioId]);
    $saldoDisponible = round((float)($stmtSaldo->fetch()['saldo'] ?? 0), 2);

    if ($saldoDisponible < $montoSolicitado) {
        throw new RuntimeException('Saldo insuficiente. Saldo disponible: $' . number_format($saldoDisponible, 2));
    }

    // 7. Verificar que no haya una solicitud rechazada con menos de 3 min
    $stmtRechazo = $pdo->prepare("
        SELECT COUNT(*) AS total
        FROM solicitudes_liquidacion
        WHERE usuario_id = :usuario_id
          AND tipo_usuario = :tipo_usuario
          AND estado = 'rechazada'
          AND rechazada_en IS NOT NULL
          AND TIMESTAMPDIFF(SECOND, rechazada_en, NOW()) < 180
    ");
    $stmtRechazo->execute(['usuario_id' => $usuarioId, 'tipo_usuario' => $tipoUsuario]);
    if ((int)$stmtRechazo->fetch()['total'] > 0) {
        throw new RuntimeException('Debe esperar 3 minutos después de un rechazo antes de volver a solicitar');
    }

    // 8. Obtener tasa BCV
    $stmtTasa = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv' LIMIT 1");
    $tasaBcv = (float)($stmtTasa->fetchColumn() ?: 0);
    if ($tasaBcv <= 0) {
        throw new RuntimeException('No hay tasa BCV configurada');
    }

    $montoBs = round($montoSolicitado * $tasaBcv, 2);

    // 9. Crear la solicitud
    $solicitudId = 'SOL-LIQ-' . strtoupper(substr(bin2hex(random_bytes(8)), 0, 12));

    $stmt = $pdo->prepare("
        INSERT INTO solicitudes_liquidacion
            (id, usuario_id, tipo_usuario, monto_solicitado_usd, monto_solicitado_bs,
             tasa_bcv_aplicada, metodo_pago, banco_destino, cuenta_telefono_destino,
             titular_destino, cedula_rif_destino, estado)
        VALUES
            (:id, :usuario_id, :tipo_usuario, :monto_usd, :monto_bs,
             :tasa_bcv, :metodo_pago, :banco, :cuenta,
             :titular, :cedula, 'pendiente')
    ");

    $stmt->execute([
        'id' => $solicitudId,
        'usuario_id' => $usuarioId,
        'tipo_usuario' => $tipoUsuario,
        'monto_usd' => $montoSolicitado,
        'monto_bs' => $montoBs,
        'tasa_bcv' => $tasaBcv,
        'metodo_pago' => $metodoPago,
        'banco' => $bancoDestino,
        'cuenta' => $cuentaTelefonoDestino,
        'titular' => $titularDestino,
        'cedula' => $cedulaRifDestino,
    ]);

    $pdo->commit();

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Solicitud de liquidación creada exitosamente',
        'solicitud_id' => $solicitudId,
        'monto_solicitado_usd' => $montoSolicitado,
        'monto_solicitado_bs' => $montoBs,
        'tasa_bcv' => $tasaBcv,
        'saldo_disponible_usd' => $saldoDisponible,
        'estado' => 'pendiente'
    ], 201);

} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $status = $error instanceof RuntimeException ? 409 : 500;
    error_log('Vixy solicitar-liquidacion: ' . $error->getMessage());
    Database::jsonResponse(['success' => false, 'mensaje' => $error->getMessage()], $status);
}