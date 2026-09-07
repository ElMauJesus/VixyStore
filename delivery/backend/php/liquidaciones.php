<?php
/**
 * Vixy Delivery Platform - API de Liquidaciones de Comercios y Conductores
 * Registra comisiones de empresa, pagos netos, referencias bancarias y comprobantes.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'todos'; // 'comercio', 'conductor', o 'todos'
    $entidadId = isset($_GET['id']) ? $_GET['id'] : null;

    try {
        $response = [];

        if ($tipo === 'comercio' || $tipo === 'todos') {
            $sql = "SELECT lc.*, c.nombre as comercio_nombre 
                    FROM liquidaciones_comercios lc 
                    LEFT JOIN comercios c ON lc.comercio_id = c.id";
            if ($entidadId && $tipo === 'comercio') {
                $sql .= " WHERE lc.comercio_id = :id";
            }
            $sql .= " ORDER BY lc.fecha_liquidacion DESC LIMIT 100";
            
            $stmt = $pdo->prepare($sql);
            if ($entidadId && $tipo === 'comercio') {
                $stmt->execute(['id' => $entidadId]);
            } else {
                $stmt->execute();
            }
            $response['liquidaciones_comercios'] = $stmt->fetchAll();
        }

        if ($tipo === 'conductor' || $tipo === 'todos') {
            $sql = "SELECT ld.*, cond.nombre as conductor_nombre, cond.vehiculo 
                    FROM liquidaciones_conductores ld 
                    LEFT JOIN conductores cond ON ld.conductor_id = cond.id";
            if ($entidadId && $tipo === 'conductor') {
                $sql .= " WHERE ld.conductor_id = :id";
            }
            $sql .= " ORDER BY ld.fecha_liquidacion DESC LIMIT 100";

            $stmt = $pdo->prepare($sql);
            if ($entidadId && $tipo === 'conductor') {
                $stmt->execute(['id' => $entidadId]);
            } else {
                $stmt->execute();
            }
            $response['liquidaciones_conductores'] = $stmt->fetchAll();
        }

        Database::jsonResponse([
            'success' => true,
            'data' => $response
        ]);
    } catch (Exception $e) {
        Database::jsonResponse(['error' => true, 'mensaje' => $e->getMessage()], 500);
    }
} elseif ($method === 'POST') {
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'finanzas']);
    $data = Database::getJsonInput();

    $tipo = isset($data['tipo']) ? $data['tipo'] : ''; // 'comercio' o 'conductor'

    if ($tipo === 'comercio') {
        $comercioId = $data['comercioId'] ?? '';
        $montoBruto = floatval($data['montoBrutoUsd'] ?? 0);
        $porcentajeComision = floatval($data['porcentajeComision'] ?? 0);
        $referencia = trim($data['referenciaBancaria'] ?? '');
        $metodoPago = $data['metodoPago'] ?? 'pago_movil';
        $comprobanteUrl = $data['comprobanteUrl'] ?? null;
        $notas = $data['notas'] ?? '';

        if (empty($comercioId) || $montoBruto <= 0 || empty($referencia)) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Datos incompletos: comercio, monto y referencia son requeridos.'], 400);
        }

        // Cálculo exacto: comision de empresa y neto pagado al comercio
        $comisionEmpresa = round(($montoBruto * $porcentajeComision) / 100, 2);
        $montoNeto = round($montoBruto - $comisionEmpresa, 2);

        $stmtTasa = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv'");
        $tasaBcv = floatval($stmtTasa->fetchColumn() ?: 48.50);
        $montoNetoBs = round($montoNeto * $tasaBcv, 2);

        $liqId = 'LIQ-COM-' . strtoupper(substr(uniqid(), -6));

        $stmt = $pdo->prepare("
            INSERT INTO liquidaciones_comercios 
            (id, comercio_id, monto_bruto_usd, porcentaje_comision, comision_empresa_usd, monto_neto_usd, monto_neto_bs, tasa_bcv_aplicada, metodo_pago, referencia_bancaria, comprobante_url, estado, notas)
            VALUES 
            (:id, :cid, :mbruto, :pct, :comision, :mneto, :mbs, :tasa, :metodo, :ref, :comp, 'pagado', :notas)
        ");

        $stmt->execute([
            'id' => $liqId,
            'cid' => $comercioId,
            'mbruto' => $montoBruto,
            'pct' => $porcentajeComision,
            'comision' => $comisionEmpresa,
            'mneto' => $montoNeto,
            'mbs' => $montoNetoBs,
            'tasa' => $tasaBcv,
            'metodo' => $metodoPago,
            'ref' => $referencia,
            'comp' => $comprobanteUrl,
            'notas' => $notas
        ]);

        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Liquidación de comercio registrada exitosamente',
            'id' => $liqId,
            'montoNetoUsd' => $montoNeto,
            'comisionEmpresaUsd' => $comisionEmpresa
        ]);

    } elseif ($tipo === 'conductor') {
        $conductorId = $data['conductorId'] ?? '';
        $montoBruto = floatval($data['montoBrutoUsd'] ?? 0);
        $porcentajeComision = floatval($data['porcentajeComision'] ?? 15);
        $referencia = trim($data['referenciaBancaria'] ?? '');
        $metodoPago = $data['metodoPago'] ?? 'pago_movil';
        $comprobanteUrl = $data['comprobanteUrl'] ?? null;
        $notas = $data['notas'] ?? '';

        if (empty($conductorId) || $montoBruto <= 0 || empty($referencia)) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Datos incompletos: conductor, monto y referencia son requeridos.'], 400);
        }

        // Deducción de comisión de empresa para entrega
        $comisionEmpresa = round(($montoBruto * $porcentajeComision) / 100, 2);
        $montoNeto = round($montoBruto - $comisionEmpresa, 2);

        $stmtTasa = $pdo->query("SELECT valor FROM configuracion_sistema WHERE clave = 'tasa_bcv'");
        $tasaBcv = floatval($stmtTasa->fetchColumn() ?: 48.50);
        $montoNetoBs = round($montoNeto * $tasaBcv, 2);

        $liqId = 'LIQ-DRV-' . strtoupper(substr(uniqid(), -6));

        $stmt = $pdo->prepare("
            INSERT INTO liquidaciones_conductores 
            (id, conductor_id, monto_bruto_usd, porcentaje_comision, comision_empresa_usd, monto_neto_usd, monto_neto_bs, tasa_bcv_aplicada, metodo_pago, referencia_bancaria, comprobante_url, estado, notas)
            VALUES 
            (:id, :cid, :mbruto, :pct, :comision, :mneto, :mbs, :tasa, :metodo, :ref, :comp, 'pagado', :notas)
        ");

        $stmt->execute([
            'id' => $liqId,
            'cid' => $conductorId,
            'mbruto' => $montoBruto,
            'pct' => $porcentajeComision,
            'comision' => $comisionEmpresa,
            'mneto' => $montoNeto,
            'mbs' => $montoNetoBs,
            'tasa' => $tasaBcv,
            'metodo' => $metodoPago,
            'ref' => $referencia,
            'comp' => $comprobanteUrl,
            'notas' => $notas
        ]);

        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Liquidación de conductor registrada exitosamente',
            'id' => $liqId,
            'montoNetoUsd' => $montoNeto,
            'comisionEmpresaUsd' => $comisionEmpresa
        ]);
    } else {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Tipo no válido: debe ser comercio o conductor'], 400);
    }
} else {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido'], 405);
}
