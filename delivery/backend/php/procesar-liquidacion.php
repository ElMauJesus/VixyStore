<?php
/**
 * Vixy Platform - Procesamiento de Liquidaciones (Solo Admin)
 * Permite al administrador ver solicitudes pendientes, rechazarlas (activando bloqueo de 3 min) 
 * o aprobarlas (descontando saldo al usuario y a la billetera global del admin).
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Solo super_admin o finanzas pueden acceder aquí
$authUser = AuthMiddleware::requireAuth(['super_admin', 'finanzas']);

// =========================================================================
// GET: OBTENER BANDEJA DE SOLICITUDES PENDIENTES
// =========================================================================
if ($method === 'GET') {
    try {
        // Obtenemos las solicitudes pendientes y cruzamos con las tablas para saber quién es
        $sql = "
            SELECT 
                sl.*,
                COALESCE(c.nombre, cond.nombre) AS nombre_usuario,
                COALESCE(c.rif, cond.cedula) AS documento_usuario
            FROM solicitudes_liquidacion sl
            LEFT JOIN comercios c ON sl.tipo_usuario = 'comercio' AND sl.usuario_id = c.id
            LEFT JOIN conductores cond ON sl.tipo_usuario = 'conductor' AND sl.usuario_id = cond.id
            WHERE sl.estado = 'pendiente'
            ORDER BY sl.creado_en ASC
        ";
        $stmt = $pdo->query($sql);
        $solicitudes = $stmt->fetchAll();

        Database::jsonResponse([
            'success' => true,
            'data' => $solicitudes
        ]);
    } catch (Exception $e) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Error al obtener solicitudes: ' . $e->getMessage()], 500);
    }
} 

// =========================================================================
// POST: APROBAR O RECHAZAR UNA SOLICITUD
// =========================================================================
elseif ($method === 'POST') {
    $data = Database::getJsonInput();
    
    $solicitudId = trim($data['solicitud_id'] ?? '');
    $accion = trim($data['accion'] ?? ''); // 'aprobar' o 'rechazar'
    $referencia = trim($data['referencia_bancaria'] ?? '');
    $notas = trim($data['notas'] ?? '');
    
    if (empty($solicitudId) || !in_array($accion, ['aprobar', 'rechazar'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Falta el ID de solicitud o la acción no es válida.'], 400);
    }

    try {
        $pdo->beginTransaction();

        // 1. Bloqueamos la solicitud específica para que nadie más la modifique al mismo tiempo
        $stmtSol = $pdo->prepare("SELECT * FROM solicitudes_liquidacion WHERE id = :id FOR UPDATE");
        $stmtSol->execute(['id' => $solicitudId]);
        $solicitud = $stmtSol->fetch();

        if (!$solicitud) {
            throw new RuntimeException('La solicitud no existe.');
        }
        if ($solicitud['estado'] !== 'pendiente') {
            throw new RuntimeException('La solicitud ya fue procesada (Estado: ' . $solicitud['estado'] . ').');
        }

        $usuarioId = $solicitud['usuario_id'];
        $tipoUsuario = $solicitud['tipo_usuario'];
        $montoUsd = (float)$solicitud['monto_solicitado_usd'];
        $montoBs = (float)$solicitud['monto_solicitado_bs'];

        // =========================================
        // FLUJO A: RECHAZAR
        // =========================================
        if ($accion === 'rechazar') {
            // Se actualiza a rechazada y se marca la hora exacta para activar el bloqueo de 3 min en la app
            $stmtRechazar = $pdo->prepare("
                UPDATE solicitudes_liquidacion 
                SET estado = 'rechazada', rechazada_en = NOW(), notas = :notas 
                WHERE id = :id
            ");
            $stmtRechazar->execute(['id' => $solicitudId, 'notas' => $notas]);
            
            $pdo->commit();
            Database::jsonResponse(['success' => true, 'mensaje' => 'Solicitud rechazada. El usuario deberá esperar 3 min.']);
            exit;
        }

        // =========================================
        // FLUJO B: APROBAR (Movimiento de dinero)
        // =========================================
        if ($accion === 'aprobar') {
            if (empty($referencia)) {
                throw new RuntimeException('Debe proporcionar la referencia bancaria para aprobar el pago.');
            }

            // 2. Bloquear y consultar saldo del usuario (Comercio o Conductor)
            $tablaUsuario = ($tipoUsuario === 'comercio') ? 'comercios' : 'conductores';
            $stmtUser = $pdo->prepare("SELECT saldo_billetera_usd FROM {$tablaUsuario} WHERE id = :id FOR UPDATE");
            $stmtUser->execute(['id' => $usuarioId]);
            $saldoUsuario = (float)($stmtUser->fetch()['saldo_billetera_usd'] ?? 0);

            if ($saldoUsuario < $montoUsd) {
                throw new RuntimeException('El usuario ya no tiene saldo suficiente para esta liquidación.');
            }

            // 3. Descontar saldo al usuario
            $stmtUpdateUser = $pdo->prepare("UPDATE {$tablaUsuario} SET saldo_billetera_usd = saldo_billetera_usd - :monto WHERE id = :id");
            $stmtUpdateUser->execute(['monto' => $montoUsd, 'id' => $usuarioId]);

            // 4. Descontar saldo de la caja principal del ADMIN (Tabla: configuracion_sistema)
            // Se bloquea el registro primero
            $stmtAdmin = $pdo->prepare("SELECT valor FROM configuracion_sistema WHERE clave = 'saldo_billetera_admin_usd' FOR UPDATE");
            $stmtAdmin->execute();
            
            // Se actualiza el saldo global restando lo que le pagamos al usuario
            $stmtUpdateAdmin = $pdo->prepare("
                UPDATE configuracion_sistema 
                SET valor = valor - :monto 
                WHERE clave = 'saldo_billetera_admin_usd'
            ");
            $stmtUpdateAdmin->execute(['monto' => $montoUsd]);

            // 5. Registrar en el historial de Movimientos de la Billetera para que el usuario lo vea
            $stmtLedger = $pdo->prepare("
                INSERT INTO movimientos_wallet 
                (id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion)
                VALUES 
                (:id, :uid, :tipo, 'retiro_liquidacion', 0, 0, :neto, :tasa, :neto_bs, :ref_id, :desc)
            ");
            $stmtLedger->execute([
                'id' => 'mw-liq-' . strtoupper(substr(uniqid(), -6)),
                'uid' => $usuarioId,
                'tipo' => $tipoUsuario,
                'neto' => -$montoUsd, // Negativo porque sale de su cuenta virtual
                'tasa' => $solicitud['tasa_bcv_aplicada'],
                'neto_bs' => -$montoBs,
                'ref_id' => $solicitudId,
                'desc' => "Liquidación procesada y pagada. Ref: " . $referencia
            ]);

            // 6. Cambiar estado de la solicitud a 'aprobada'
            $autorizadoPor = $authUser['username'] ?? 'admin';
            $stmtAprobar = $pdo->prepare("
                UPDATE solicitudes_liquidacion 
                SET estado = 'aprobada', referencia_bancaria = :ref, notas = :notas 
                WHERE id = :id
            ");
            $stmtAprobar->execute([
                'ref' => $referencia,
                'notas' => trim("Aprobado por: $autorizadoPor. " . $notas),
                'id' => $solicitudId
            ]);

            $pdo->commit();
            Database::jsonResponse([
                'success' => true, 
                'mensaje' => "Liquidación aprobada por $$montoUsd. Saldos del usuario y del administrador actualizados con éxito."
            ]);
            exit;
        }

    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack(); // Si algo falla (saldo insuficiente, falta de internet), no se cobra nada
        }
        $status = $error instanceof RuntimeException ? 409 : 500;
        Database::jsonResponse(['error' => true, 'mensaje' => $error->getMessage()], $status);
    }
} else {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido'], 405);
}