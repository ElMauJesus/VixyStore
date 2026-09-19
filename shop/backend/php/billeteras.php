<?php
/**
 * Vixy Delivery Platform - API de Billeteras y Balances de Comercios y Conductores
 * Filtro por cartera individual, cálculos de ingresos brutos, comisiones deducidas y saldo en wallet.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $entidad = $_GET['entidad'] ?? 'todas'; // 'comercios', 'conductores', 'clientes', 'todas'
    $idFiltro = $_GET['id'] ?? null; // Filtrar por comercio o conductor individual

    try {
        // Obtener configuración de comisiones actual
        $stmtCfg = $pdo->query("SELECT clave, valor FROM configuracion_sistema WHERE clave IN ('porcentaje_comision_comercio', 'porcentaje_comision_delivery', 'tasa_bcv')");
        $configs = $stmtCfg->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $pctComercio = floatval($configs['porcentaje_comision_comercio'] ?? 0);
        $pctDelivery = floatval($configs['porcentaje_comision_delivery'] ?? 15);
        $tasaBcv = floatval($configs['tasa_bcv'] ?? 48.50);

        $resultado = [];

        // 1. CARTERAS DE COMERCIOS (Cálculo individual y global)
        if ($entidad === 'comercios' || $entidad === 'todas') {
            $sqlComercios = "
                SELECT 
                    c.id as comercio_id,
                    c.nombre as comercio_nombre,
                    c.rif,
                    c.telefono,
                    COALESCE(SUM(p.subtotal), 0) as total_ventas_brutas_usd,
                    COUNT(p.id) as total_pedidos
                FROM comercios c
                LEFT JOIN pedidos p ON c.id = p.comercio_id AND p.estado = 'entregado'
            ";

            if ($idFiltro && $entidad === 'comercios') {
                $sqlComercios .= " WHERE c.id = :cid";
            }
            $sqlComercios .= " GROUP BY c.id, c.nombre, c.rif, c.telefono ORDER BY total_ventas_brutas_usd DESC";

            $stmtC = $pdo->prepare($sqlComercios);
            if ($idFiltro && $entidad === 'comercios') {
                $stmtC->execute(['cid' => $idFiltro]);
            } else {
                $stmtC->execute();
            }
            $comerciosData = $stmtC->fetchAll();

            $comerciosFinal = [];
            $totalGlobalVentas = 0;
            $totalGlobalComisionEmpresa = 0;
            $totalGlobalRetirado = 0;
            $totalGlobalEnWallet = 0;

            foreach ($comerciosData as $com) {
                $ventasBrutas = floatval($com['total_ventas_brutas_usd']);
                // Deducción de comisión de empresa
                $comisionEmpresa = round(($ventasBrutas * $pctComercio) / 100, 2);
                $ingresoNeto = round($ventasBrutas - $comisionEmpresa, 2);

                // Consultar cuánto ha retirado
                $stmtLiq = $pdo->prepare("SELECT COALESCE(SUM(monto_neto_usd), 0) FROM liquidaciones_comercios WHERE comercio_id = :cid AND estado = 'pagado'");
                $stmtLiq->execute(['cid' => $com['comercio_id']]);
                $totalRetirado = floatval($stmtLiq->fetchColumn() ?: 0);

                // Saldo restante en wallet
                $saldoEnWallet = max(0, round($ingresoNeto - $totalRetirado, 2));

                $item = [
                    'comercioId' => $com['comercio_id'],
                    'comercioNombre' => $com['comercio_nombre'],
                    'rif' => $com['rif'],
                    'ventasBrutasUsd' => $ventasBrutas,
                    'porcentajeComisionEmpresa' => $pctComercio,
                    'comisionEmpresaUsd' => $comisionEmpresa,
                    'ingresoNetoComercioUsd' => $ingresoNeto,
                    'totalRetiradoUsd' => $totalRetirado,
                    'saldoEnWalletUsd' => $saldoEnWallet,
                    'saldoEnWalletBs' => round($saldoEnWallet * $tasaBcv, 2),
                    'estadoRetiro' => $saldoEnWallet > 0 ? 'fondos_disponibles' : ($totalRetirado > 0 ? 'retirado_completamente' : 'sin_movimiento')
                ];

                $comerciosFinal[] = $item;
                $totalGlobalVentas += $ventasBrutas;
                $totalGlobalComisionEmpresa += $comisionEmpresa;
                $totalGlobalRetirado += $totalRetirado;
                $totalGlobalEnWallet += $saldoEnWallet;
            }

            $resultado['comercios'] = [
                'resumenGlobal' => [
                    'totalVentasBrutasUsd' => round($totalGlobalVentas, 2),
                    'comisionTotalEmpresaUsd' => round($totalGlobalComisionEmpresa, 2),
                    'totalRetiradoComerciosUsd' => round($totalGlobalRetirado, 2),
                    'totalDisponibleEnWalletsUsd' => round($totalGlobalEnWallet, 2)
                ],
                'listaPorComercio' => $comerciosFinal
            ];
        }

        // 2. CARTERAS DE CONDUCTORES
        if ($entidad === 'conductores' || $entidad === 'todas') {
            $sqlConductores = "
                SELECT 
                    cond.id as conductor_id,
                    cond.nombre as conductor_nombre,
                    cond.cedula,
                    cond.telefono,
                    cond.vehiculo,
                    COALESCE(SUM(p.costo_envio), 0) as total_delivery_bruto_usd,
                    COUNT(p.id) as total_carreras
                FROM conductores cond
                LEFT JOIN pedidos p ON cond.id = p.conductor_id AND p.estado = 'entregado'
            ";

            if ($idFiltro && $entidad === 'conductores') {
                $sqlConductores .= " WHERE cond.id = :drid";
            }
            $sqlConductores .= " GROUP BY cond.id, cond.nombre, cond.cedula, cond.telefono, cond.vehiculo";

            $stmtD = $pdo->prepare($sqlConductores);
            if ($idFiltro && $entidad === 'conductores') {
                $stmtD->execute(['drid' => $idFiltro]);
            } else {
                $stmtD->execute();
            }
            $conductoresData = $stmtD->fetchAll();

            $conductoresFinal = [];
            foreach ($conductoresData as $drv) {
                $bruto = floatval($drv['total_delivery_bruto_usd']);
                $comisionEmpresa = round(($bruto * $pctDelivery) / 100, 2);
                $neto = round($bruto - $comisionEmpresa, 2);

                $stmtLiqD = $pdo->prepare("SELECT COALESCE(SUM(monto_neto_usd), 0) FROM liquidaciones_conductores WHERE conductor_id = :did AND estado = 'pagado'");
                $stmtLiqD->execute(['did' => $drv['conductor_id']]);
                $totalRetirado = floatval($stmtLiqD->fetchColumn() ?: 0);
                $saldoEnWallet = max(0, round($neto - $totalRetirado, 2));

                $conductoresFinal[] = [
                    'conductorId' => $drv['conductor_id'],
                    'conductorNombre' => $drv['conductor_nombre'],
                    'cedula' => $drv['cedula'],
                    'vehiculo' => $drv['vehiculo'],
                    'ingresosDeliveryBrutoUsd' => $bruto,
                    'porcentajeComisionEmpresa' => $pctDelivery,
                    'comisionEmpresaDeducidaUsd' => $comisionEmpresa,
                    'gananciaNetaConductorUsd' => $neto,
                    'totalRetiradoUsd' => $totalRetirado,
                    'saldoEnWalletUsd' => $saldoEnWallet,
                    'saldoEnWalletBs' => round($saldoEnWallet * $tasaBcv, 2)
                ];
            }

            $resultado['conductores'] = [
                'listaPorConductor' => $conductoresFinal
            ];
        }

        Database::jsonResponse([
            'success' => true,
            'data' => $resultado,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        Database::jsonResponse(['error' => true, 'mensaje' => $e->getMessage()], 500);
    }
} else {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido'], 405);
}
