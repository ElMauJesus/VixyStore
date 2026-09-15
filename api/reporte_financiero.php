<?php
/**
 * Reporte contable de custodia, comercios, conductores y comisiones Vixy.
 * Todos los importes históricos provienen del libro mayor inmutable.
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
AuthMiddleware::requireAuth(['super_admin', 'operador', 'finanzas', 'auditor']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no permitido.'], 405);
}

$periodo = $_GET['periodo'] ?? 'dia';
$tipo = $_GET['tipo'] ?? 'todas';
$usuarioId = trim((string)($_GET['usuario_id'] ?? ''));
$pedidoId = trim((string)($_GET['pedido_id'] ?? ''));
$limite = max(1, min(1000, (int)($_GET['limite'] ?? 250)));

$periodos = [
    'dia' => 'm.creado_en >= CURDATE()',
    'semana' => 'm.creado_en >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
    'mes' => 'm.creado_en >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
    'historico' => '1=1',
];
if (!isset($periodos[$periodo])) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Período inválido.'], 400);
}
if (!in_array($tipo, ['todas', 'comercio', 'conductor', 'plataforma'], true)) {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Tipo de cartera inválido.'], 400);
}

$where = [$periodos[$periodo]];
$params = [];
if ($tipo !== 'todas') {
    $where[] = 'm.tipo_usuario = :tipo';
    $params['tipo'] = $tipo;
}
if ($usuarioId !== '') {
    $where[] = 'm.usuario_id = :usuario_id';
    $params['usuario_id'] = $usuarioId;
}
if ($pedidoId !== '') {
    $where[] = 'm.pedido_id = :pedido_id';
    $params['pedido_id'] = $pedidoId;
}
$filtro = implode(' AND ', $where);

$whereSaldo = ['1=1'];
if ($tipo !== 'todas') {
    $whereSaldo[] = 'm.tipo_usuario = :tipo';
}
if ($usuarioId !== '') {
    $whereSaldo[] = 'm.usuario_id = :usuario_id';
}
if ($pedidoId !== '') {
    $whereSaldo[] = 'm.pedido_id = :pedido_id';
}
$filtroSaldo = implode(' AND ', $whereSaldo);

try {
    $resumen = $pdo->prepare("SELECT
        ROUND(COALESCE(SUM(CASE WHEN m.tipo_usuario = 'comercio' THEN m.monto_neto_usd ELSE 0 END), 0), 2) AS saldo_comercios_usd,
        ROUND(COALESCE(SUM(CASE WHEN m.tipo_usuario = 'conductor' THEN m.monto_neto_usd ELSE 0 END), 0), 2) AS saldo_conductores_usd,
        ROUND(COALESCE(SUM(CASE WHEN m.tipo_usuario = 'plataforma' THEN m.monto_neto_usd ELSE 0 END), 0), 2) AS ingresos_vixy_usd,
        ROUND(COALESCE(SUM(CASE WHEN m.tipo_usuario = 'plataforma' AND m.tipo_movimiento = 'comision_plataforma' THEN m.comision_usd ELSE 0 END), 0), 2) AS comisiones_vixy_usd,
        ROUND(COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'liquidacion' AND m.tipo_usuario IN ('comercio','conductor') THEN ABS(m.monto_neto_usd) ELSE 0 END), 0), 2) AS total_liquidado_usd,
        COUNT(DISTINCT CASE WHEN m.tipo_movimiento = 'acreditacion_pedido' THEN m.pedido_id END) AS pedidos_distribuidos
    FROM movimientos_wallet m WHERE {$filtroSaldo}");
    $resumen->execute($params);
    $resumenData = $resumen->fetch() ?: [];

    $custodia = $pdo->query("SELECT
        ROUND(COALESCE(SUM(total_cobrado_usd), 0), 2) AS custodia_usd,
        COUNT(*) AS pedidos_custodia
      FROM distribuciones_pedido WHERE estado = 'custodia'")->fetch();

    $totalesDistribucion = $pdo->prepare("SELECT
        COUNT(*) AS pedidos_distribuidos,
        ROUND(COALESCE(SUM(d.total_cobrado_usd), 0), 2) AS total_cobrado_usd,
        ROUND(COALESCE(SUM(d.neto_comercio_usd), 0), 2) AS neto_comercios_usd,
        ROUND(COALESCE(SUM(d.neto_conductor_usd), 0), 2) AS neto_conductores_usd,
        ROUND(COALESCE(SUM(d.comision_comercio_usd), 0), 2) AS comision_comercios_usd,
        ROUND(COALESCE(SUM(d.comision_delivery_usd), 0), 2) AS comision_delivery_usd,
        ROUND(COALESCE(SUM(d.ingreso_vixy_usd), 0), 2) AS ingreso_vixy_usd,
        ROUND(COALESCE(SUM(d.total_cobrado_usd - d.neto_comercio_usd - d.neto_conductor_usd - d.ingreso_vixy_usd), 0), 2) AS diferencia_usd
      FROM distribuciones_pedido d
      WHERE d.estado = 'distribuido' AND " . str_replace('m.creado_en', 'd.fecha_distribucion', $periodos[$periodo]));
    $totalesDistribucion->execute();

    $carteras = $pdo->prepare("SELECT
        m.tipo_usuario, m.usuario_id,
        COALESCE(MAX(CASE WHEN m.tipo_usuario = 'comercio' THEN c.nombre END), MAX(CASE WHEN m.tipo_usuario = 'conductor' THEN CONCAT_WS(' ', co.nombre, co.apellido) END), 'Vixy Plataforma') AS nombre,
        ROUND(SUM(CASE WHEN m.tipo_movimiento = 'acreditacion_pedido' OR m.tipo_movimiento = 'comision_plataforma' THEN m.monto_bruto_usd ELSE 0 END), 2) AS bruto_usd,
        ROUND(SUM(m.comision_usd), 2) AS comision_vixy_usd,
        ROUND(SUM(CASE WHEN m.tipo_movimiento = 'liquidacion' THEN ABS(m.monto_neto_usd) ELSE 0 END), 2) AS liquidado_usd,
        ROUND(SUM(m.monto_neto_usd), 2) AS saldo_disponible_usd,
        COUNT(DISTINCT m.pedido_id) AS pedidos
      FROM movimientos_wallet m
      LEFT JOIN comercios c ON m.tipo_usuario = 'comercio' AND c.id = m.usuario_id
      LEFT JOIN conductores co ON m.tipo_usuario = 'conductor' AND co.id = m.usuario_id
    WHERE {$filtroSaldo} AND m.tipo_usuario IN ('comercio','conductor','plataforma')
      GROUP BY m.tipo_usuario, m.usuario_id
      ORDER BY m.tipo_usuario, nombre");
    $carteras->execute($params);

    $movimientos = $pdo->prepare("SELECT
        m.id, m.pedido_id, m.usuario_id, m.tipo_usuario, m.tipo_movimiento,
        m.monto_bruto_usd, m.comision_usd, m.monto_neto_usd, m.tasa_bcv,
        m.monto_neto_bs, m.referencia_id, m.descripcion, m.creado_en,
        COALESCE(c.nombre, CONCAT_WS(' ', co.nombre, co.apellido), 'Vixy Plataforma') AS entidad_nombre,
        p.codigo_seguimiento
      FROM movimientos_wallet m
      LEFT JOIN comercios c ON m.tipo_usuario = 'comercio' AND c.id = m.usuario_id
      LEFT JOIN conductores co ON m.tipo_usuario = 'conductor' AND co.id = m.usuario_id
      LEFT JOIN pedidos p ON p.id = m.pedido_id
      WHERE {$filtro}
      ORDER BY m.creado_en DESC LIMIT {$limite}");
    $movimientos->execute($params);

    $distribuciones = $pdo->prepare("SELECT
        d.*, c.nombre AS comercio_nombre,
        CONCAT_WS(' ', co.nombre, co.apellido) AS conductor_nombre,
        CONCAT_WS(' ', cl.nombre, cl.apellido) AS cliente_nombre,
        ROUND(d.neto_comercio_usd + d.neto_conductor_usd + d.ingreso_vixy_usd, 2) AS total_distribuido_usd,
        ROUND(d.total_cobrado_usd - d.neto_comercio_usd - d.neto_conductor_usd - d.ingreso_vixy_usd, 2) AS diferencia_usd
      FROM distribuciones_pedido d
      LEFT JOIN comercios c ON c.id = d.comercio_id
      LEFT JOIN conductores co ON co.id = d.conductor_id
      LEFT JOIN clientes cl ON cl.id = d.cliente_id
      WHERE " . str_replace('m.creado_en', 'COALESCE(d.fecha_distribucion, d.fecha_pago, d.creado_en)', $periodos[$periodo]) . "
      ORDER BY d.creado_en DESC LIMIT {$limite}");
    $distribuciones->execute();

    Database::jsonResponse([
        'success' => true,
        'periodo' => $periodo,
        'resumen' => array_merge($resumenData, $custodia ?: []),
        'distribucion' => $totalesDistribucion->fetch() ?: [],
        'carteras' => $carteras->fetchAll(),
        'movimientos' => $movimientos->fetchAll(),
        'pedidos' => $distribuciones->fetchAll(),
        'timestamp' => date('Y-m-d H:i:s'),
    ]);
} catch (Throwable $error) {
    error_log('Vixy reporte financiero: ' . $error->getMessage());
    Database::jsonResponse(['error' => true, 'mensaje' => 'No se pudo consultar el reporte financiero. Verifique la migración 08.'], 500);
}
