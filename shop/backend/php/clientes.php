<?php
/**
 * Listado público limitado de clientes para las vistas de operación Vixy.
 * Nunca expone hashes de contraseña ni información privada de autenticación.
 */

require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Database::jsonResponse(['error' => true, 'mensaje' => 'Método no soportado'], 405);
}

$pdo = Database::getConnection();
$columns = array_column($pdo->query('SHOW COLUMNS FROM clientes')->fetchAll(), 'Field');
$colCartera = in_array('saldo_cartera_usd', $columns, true) ? 'COALESCE(saldo_cartera_usd, 0.00)' : '0.00';
$colBilletera = in_array('saldo_billetera_usd', $columns, true) ? 'COALESCE(saldo_billetera_usd, 0.00)' : '0.00';
$saldoUsd = "GREATEST({$colCartera}, {$colBilletera})";
$saldoBs = in_array('saldo_cartera_bs', $columns, true) ? 'saldo_cartera_bs' : '0.00';
$activo = in_array('activo', $columns, true) ? 'activo' : '1';
$direccion = in_array('direccion_habitual', $columns, true) ? 'direccion_habitual' : 'NULL';
$lat = in_array('latitud', $columns, true) ? 'latitud' : 'NULL';
$lng = in_array('longitud', $columns, true) ? 'longitud' : 'NULL';
$id = trim((string)($_GET['id'] ?? ''));
$sql = "SELECT id, nombre, apellido, cedula, telefono, email, {$direccion} AS direccion_habitual, {$lat} AS latitud, {$lng} AS longitud, {$saldoUsd} AS saldo_cartera_usd, {$saldoUsd} AS saldo_billetera_usd, {$saldoBs} AS saldo_cartera_bs, {$activo} AS activo FROM clientes";
if ($id !== '') {
    $stmt = $pdo->prepare($sql . ' WHERE id = :id OR cedula = :cedula OR telefono = :telefono LIMIT 1');
    $stmt->execute(['id' => $id, 'cedula' => $id, 'telefono' => $id]);
    $cliente = $stmt->fetch();
    if (!$cliente) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Cliente no encontrado'], 404);
    }
    $cliente['activo'] = (bool)($cliente['activo'] ?? true);
    $realSaldo = (float)($cliente['saldo_cartera_usd'] ?? $cliente['saldo_billetera_usd'] ?? 0);
    $cliente['saldo_cartera_usd'] = $realSaldo;
    $cliente['saldo_billetera_usd'] = $realSaldo;
    $cliente['saldoBilletera'] = $realSaldo;
    $cliente['saldo_cartera_bs'] = (float)($cliente['saldo_cartera_bs'] ?? 0);
    if (isset($cliente['latitud']) && $cliente['latitud'] !== null) $cliente['latitud'] = (float)$cliente['latitud'];
    if (isset($cliente['longitud']) && $cliente['longitud'] !== null) $cliente['longitud'] = (float)$cliente['longitud'];
    Database::jsonResponse(['success' => true, 'cliente' => $cliente]);
}
$stmt = $pdo->query($sql . ' ORDER BY nombre ASC, apellido ASC');

$clientes = array_map(static function ($cliente) {
    $cliente['activo'] = (bool)($cliente['activo'] ?? true);
    $realSaldo = (float)($cliente['saldo_cartera_usd'] ?? $cliente['saldo_billetera_usd'] ?? 0);
    $cliente['saldo_cartera_usd'] = $realSaldo;
    $cliente['saldo_billetera_usd'] = $realSaldo;
    $cliente['saldoBilletera'] = $realSaldo;
    $cliente['saldo_cartera_bs'] = (float)($cliente['saldo_cartera_bs'] ?? 0);
    if (isset($cliente['latitud']) && $cliente['latitud'] !== null) $cliente['latitud'] = (float)$cliente['latitud'];
    if (isset($cliente['longitud']) && $cliente['longitud'] !== null) $cliente['longitud'] = (float)$cliente['longitud'];
    return $cliente;
}, $stmt->fetchAll());

Database::jsonResponse([
    'success' => true,
    'total' => count($clientes),
    'clientes' => $clientes
]);