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
$saldoUsd = in_array('saldo_cartera_usd', $columns, true) ? 'saldo_cartera_usd' : '0';
$saldoBs = in_array('saldo_cartera_bs', $columns, true) ? 'saldo_cartera_bs' : '0';
$activo = in_array('activo', $columns, true) ? 'activo' : '1';
$direccion = in_array('direccion_habitual', $columns, true) ? 'direccion_habitual' : 'NULL';
$stmt = $pdo->query("SELECT id, nombre, apellido, cedula, telefono, email, {$direccion} AS direccion_habitual, {$saldoUsd} AS saldo_cartera_usd, {$saldoBs} AS saldo_cartera_bs, {$activo} AS activo FROM clientes ORDER BY nombre ASC, apellido ASC");

$clientes = array_map(static function ($cliente) {
    $cliente['activo'] = (bool)($cliente['activo'] ?? true);
    $cliente['saldo_cartera_usd'] = (float)($cliente['saldo_cartera_usd'] ?? 0);
    $cliente['saldo_cartera_bs'] = (float)($cliente['saldo_cartera_bs'] ?? 0);
    return $cliente;
}, $stmt->fetchAll());

Database::jsonResponse([
    'success' => true,
    'total' => count($clientes),
    'clientes' => $clientes
]);