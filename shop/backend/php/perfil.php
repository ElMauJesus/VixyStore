<?php
/**
 * Perfil de usuario y pedidos personales
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

$user = require_login();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $action = isset($_GET['action']) ? sanitize_input($_GET['action']) : 'profile';
        if ($action === 'orders') {
            getUserOrders($pdo, $user);
        } else {
            getUserProfile($pdo, $user);
        }
        break;
    case 'PUT':
    case 'POST':
        updateUserProfile($pdo, $user);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

function getUserProfile($pdo, $user) {
    $sql = "SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.created_at,
                   u.driver_uuid, u.rider_code, u.driver_category, u.vehicle_info,
                   r.name as role_name,
                   cp.occupation, cp.equipment_info, cp.notes
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            LEFT JOIN customer_profiles cp ON cp.user_id = u.id
            WHERE u.id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $user['id']]);
    $profile = $stmt->fetch();
    
    if ($profile) {
        $profile['role'] = $profile['role_name'];
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Perfil obtenido",
        "data" => $profile
    ]);
}

function getUserOrders($pdo, $user) {
    $sql = "SELECT o.id, o.order_number, o.status, o.payment_status, o.payment_method, 
                   o.payment_reference, o.subtotal, o.shipping_cost, o.total_amount, o.created_at
            FROM orders o
            WHERE o.user_id = :user_id
            ORDER BY o.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $user['id']]);
    $orders = $stmt->fetchAll();
    
    // Obtener items por orden
    foreach ($orders as &$order) {
        $stmtItems = $pdo->prepare("SELECT oi.*, pi.image_url as imagen 
                                   FROM order_items oi 
                                   LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = 1
                                   WHERE oi.order_id = :order_id");
        $stmtItems->execute(['order_id' => $order['id']]);
        $order['items'] = $stmtItems->fetchAll();
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Historial de pedidos obtenido",
        "data" => $orders
    ]);
}

function updateUserProfile($pdo, $user) {
    $data = get_request_data();
    
    $firstName = isset($data['first_name']) ? sanitize_input($data['first_name']) : '';
    $lastName = isset($data['last_name']) ? sanitize_input($data['last_name']) : '';
    $phone = isset($data['phone']) ? sanitize_input($data['phone']) : '';
    $occupation = isset($data['occupation']) ? sanitize_input($data['occupation']) : null;
    $equipmentInfo = isset($data['equipment_info']) ? sanitize_input($data['equipment_info']) : null;
    $password = isset($data['password']) && !empty($data['password']) ? $data['password'] : null;
    
    try {
        $pdo->beginTransaction();
        
        $userUpdates = [];
        $userParams = ['id' => $user['id']];
        
        if (!empty($firstName)) {
            $userUpdates[] = "first_name = :first_name";
            $userParams['first_name'] = $firstName;
        }
        if (!empty($lastName)) {
            $userUpdates[] = "last_name = :last_name";
            $userParams['last_name'] = $lastName;
        }
        if (!empty($phone)) {
            $userUpdates[] = "phone = :phone";
            $userParams['phone'] = $phone;
        }
        if (!empty($password)) {
            if (strlen($password) < 8) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "La contraseña debe tener al menos 8 caracteres"]);
                return;
            }
            $userUpdates[] = "password_hash = :hash";
            $userParams['hash'] = password_hash($password, PASSWORD_BCRYPT);
        }
        
        if (!empty($userUpdates)) {
            $sql = "UPDATE users SET " . implode(', ', $userUpdates) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($userParams);
        }
        
        // Actualizar o insertar customer_profile
        $stmtCp = $pdo->prepare("SELECT id FROM customer_profiles WHERE user_id = :id");
        $stmtCp->execute(['id' => $user['id']]);
        if ($stmtCp->rowCount() > 0) {
            $sqlCp = "UPDATE customer_profiles SET occupation = :occ, equipment_info = :equip WHERE user_id = :id";
            $stmtUpd = $pdo->prepare($sqlCp);
            $stmtUpd->execute(['occ' => $occupation, 'equip' => $equipmentInfo, 'id' => $user['id']]);
        } else {
            $sqlCp = "INSERT INTO customer_profiles (user_id, occupation, equipment_info) VALUES (:id, :occ, :equip)";
            $stmtIns = $pdo->prepare($sqlCp);
            $stmtIns->execute(['id' => $user['id'], 'occ' => $occupation, 'equip' => $equipmentInfo]);
        }
        
        $pdo->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Perfil actualizado exitosamente"
        ]);
        
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar perfil: " . $e->getMessage()]);
    }
}
?>
