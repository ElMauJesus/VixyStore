<?php
require_once __DIR__ . '/../api/config/db.php';
$pdo = Database::getConnection();
$stmt = $pdo->query("SELECT id, codigo_conductor, cedula, nombre, latitud_actual, longitud_actual, disponible, ultima_actualizacion, status FROM conductores WHERE cedula LIKE '%32437593%' OR nombre LIKE '%Jesus%'");
echo "--- vixy_dl ---\n";
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n";

$pdoRegist = Database::getRegistConnection();
if ($pdoRegist) {
    echo "--- regist ---\n";
    $stmt2 = $pdoRegist->query("SELECT id, cedula, nombre, estado, created_at FROM conductores WHERE cedula LIKE '%32437593%' OR nombre LIKE '%Jesus%'");
    echo json_encode($stmt2->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n";
}
