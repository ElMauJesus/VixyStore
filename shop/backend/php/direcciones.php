<?php
/**
 * Gestión de direcciones de envío del usuario
 * Vixy Store Backend API
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';
require_once __DIR__ . '/auth.php';

apply_security_headers();

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Requiere login de cliente o cualquier usuario activo
$user = require_login();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        listAddresses($pdo, $user);
        break;
    case 'POST':
        createAddress($pdo, $user);
        break;
    case 'PUT':
        updateAddress($pdo, $user);
        break;
    case 'DELETE':
        deleteAddress($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function listAddresses($pdo, $user) {
    $sql = "SELECT * FROM user_addresses WHERE user_id = :user_id ORDER BY is_default DESC, id DESC";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $user['id']]);
        $addresses = $stmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "message" => "Direcciones obtenidas",
            "data" => $addresses
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener direcciones"]);
    }
}

function createAddress($pdo, $user) {
    $data = get_request_data();
    
    $line1 = isset($data['address_line1']) ? sanitize_input($data['address_line1']) : '';
    $line2 = isset($data['address_line2']) ? sanitize_input($data['address_line2']) : null;
    $city = isset($data['city']) ? sanitize_input($data['city']) : '';
    $state = isset($data['state']) ? sanitize_input($data['state']) : '';
    $postalCode = isset($data['postal_code']) ? sanitize_input($data['postal_code']) : '1010';
    $country = isset($data['country']) ? sanitize_input($data['country']) : 'Venezuela';
    $isDefault = !empty($data['is_default']) ? 1 : 0;
    
    if (empty($line1) || empty($city) || empty($state)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dirección, Ciudad y Estado son obligatorios"]);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Si es default o es la primera dirección, marcar default
        $countStmt = $pdo->prepare("SELECT COUNT(*) as c FROM user_addresses WHERE user_id = :user_id");
        $countStmt->execute(['user_id' => $user['id']]);
        $hasAny = (int)$countStmt->fetch()['c'] > 0;
        
        if (!$hasAny) {
            $isDefault = 1;
        } elseif ($isDefault) {
            $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = :user_id")->execute(['user_id' => $user['id']]);
        }
        
        $sql = "INSERT INTO user_addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default)
                VALUES (:user_id, :line1, :line2, :city, :state, :postal_code, :country, :is_default)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $user['id'],
            'line1' => $line1,
            'line2' => $line2,
            'city' => $city,
            'state' => $state,
            'postal_code' => $postalCode,
            'country' => $country,
            'is_default' => $isDefault
        ]);
        
        $addressId = $pdo->lastInsertId();
        $pdo->commit();
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Dirección guardada exitosamente",
            "address_id" => (int)$addressId
        ]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al guardar dirección"]);
    }
}

function updateAddress($pdo, $user) {
    $data = get_request_data();
    $id = isset($data['id']) ? (int)$data['id'] : 0;
    
    if ($id === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere ID de dirección"]);
        return;
    }
    
    // Verificar que pertenezca al usuario
    $stmtCheck = $pdo->prepare("SELECT id FROM user_addresses WHERE id = :id AND user_id = :user_id");
    $stmtCheck->execute(['id' => $id, 'user_id' => $user['id']]);
    if ($stmtCheck->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Dirección no encontrada"]);
        return;
    }
    
    $fields = [];
    $params = ['id' => $id, 'user_id' => $user['id']];
    $allowed = ['address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country'];
    
    foreach ($allowed as $f) {
        if (isset($data[$f])) {
            $fields[] = "$f = :$f";
            $params[$f] = sanitize_input($data[$f]);
        }
    }
    
    if (isset($data['is_default']) && $data['is_default']) {
        $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = :user_id")->execute(['user_id' => $user['id']]);
        $fields[] = "is_default = 1";
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No hay campos para actualizar"]);
        return;
    }
    
    $sql = "UPDATE user_addresses SET " . implode(', ', $fields) . " WHERE id = :id AND user_id = :user_id";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["success" => true, "message" => "Dirección actualizada"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar dirección"]);
    }
}

function deleteAddress($pdo, $user) {
    $data = get_request_data();
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    
    if ($id === 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Se requiere ID de dirección"]);
        return;
    }
    
    $sql = "DELETE FROM user_addresses WHERE id = :id AND user_id = :user_id";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id, 'user_id' => $user['id']]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Dirección eliminada"]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Dirección no encontrada"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al eliminar dirección"]);
    }
}
?>
