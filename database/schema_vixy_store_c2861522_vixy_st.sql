-- =============================================================================
-- VIXY STORE - ESQUEMA DE TABLAS OFICIAL PARA phpMyAdmin (cPanel / Donweb)
-- Base de Datos de Destino: c2861522_vixy_st
-- Motor: MySQL 5.7+ / 8.0+ / MariaDB
-- NOTA: Importe o copie y pegue este código directamente dentro de c2861522_vixy_st.
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "-04:00";

-- -----------------------------------------------------------------------------
-- 1. TABLA: roles (RBAC - Roles de Sistema)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,          -- 'administrator', 'secretary', 'customer'
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABLA: users (Usuarios, Administradores y Conductores VixyRider Sincronizados)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_id` INT NOT NULL,
    `driver_uuid` VARCHAR(40) NULL UNIQUE,         -- ID/UUID de la tabla drivers en vixyhgtk_vixy_driver_prereg
    `rider_code` VARCHAR(50) NULL,                 -- Código identificador (Ej: VIXY-042)
    `driver_category` VARCHAR(50) NULL,            -- 'taxi', 'mototaxi', 'delivery'
    `vehicle_info` VARCHAR(255) NULL,              -- Marca, modelo, año, placa del conductor
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,        -- Argon2id o BCRYPT generado por PHP
    `phone` VARCHAR(30) NULL,
    `auth_token` VARCHAR(255) NULL,
    `token_expires_at` TIMESTAMP NULL,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. TABLA: user_addresses (Direcciones de Envío)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_addresses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `address_line1` VARCHAR(255) NOT NULL,
    `address_line2` VARCHAR(255) NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'Venezuela',
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_addresses_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABLA: customer_profiles (Perfil Extendido y Vehículos del Conductor)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `occupation` VARCHAR(100) NULL,
    `equipment_info` VARCHAR(150) NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_profiles_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABLA: suppliers (Proveedores de Repuestos y Autopartes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suppliers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `contact_person` VARCHAR(100) NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(150) NULL,
    `status` ENUM('active', 'under_review', 'blacklisted') DEFAULT 'active',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. TABLA: categories (Categorías de Repuestos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` INT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. TABLA: products (Catálogo de Repuestos & Autopartes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `supplier_id` INT NULL,
    `sku` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(170) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `cost_price` DECIMAL(10, 2) NOT NULL,
    `stock_quantity` INT NOT NULL DEFAULT 0,
    `min_stock_alert` INT NOT NULL DEFAULT 5,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_products_categories` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_products_suppliers` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. TABLA: product_images (Galería de Imágenes de Repuestos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `is_primary` BOOLEAN DEFAULT FALSE,
    `display_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_images_products` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TABLA: inventory_logs (Kárdex y Movimientos de Inventario)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `user_id` INT NULL,
    `type` ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL, 
    `quantity_changed` INT NOT NULL,
    `previous_stock` INT NOT NULL,
    `new_stock` INT NOT NULL,
    `reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_inv_products` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_inv_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. TABLA: orders (Ventas y Pedidos de Repuestos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `user_id` INT NOT NULL,
    `shipping_address_id` INT NOT NULL,
    `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    `payment_status` ENUM('unpaid', 'paid', 'refunded', 'failed') DEFAULT 'unpaid',
    `payment_method` VARCHAR(50) NOT NULL,       -- 'pago_movil', 'zelle', 'transfer', 'binance', 'zinli', 'card'
    `payment_reference` VARCHAR(100) NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `shipping_cost` DECIMAL(10, 2) DEFAULT 0.00,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_orders_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_orders_addresses` FOREIGN KEY (`shipping_address_id`) REFERENCES `user_addresses`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. TABLA: order_items (Ítems Facturados)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `product_name` VARCHAR(150) NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `quantity` INT NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    CONSTRAINT `fk_items_orders` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_products` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. TABLA: carts & cart_items (Carrito de Compras Persistente)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `carts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_carts_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cart_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cart_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cartitems_carts` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cartitems_products` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. TABLA: audit_logs (Auditoría Administrativa ERP)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` INT NOT NULL,
    `details` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. TABLA: warranty_performance_logs (Control de Calidad & Fichas de Garantía)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `warranty_performance_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `log_number` VARCHAR(50) NOT NULL UNIQUE,
    `order_id` INT NULL,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `supplier_id` INT NOT NULL,
    `user_occupation` VARCHAR(100) NULL,
    `usage_context` VARCHAR(150) NULL,
    `purchase_date` DATE NOT NULL,
    `durability_value` DECIMAL(10, 2) NULL,
    `durability_unit` VARCHAR(50) NULL,
    `status` ENUM('in_use', 'warranty_claimed', 'failed_out_of_warranty', 'resolved_replacement', 'resolved_refund') DEFAULT 'warranty_claimed',
    `observation` TEXT NOT NULL,
    `registered_by_user_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_wpl_orders` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_wpl_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_wpl_products` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_wpl_suppliers` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_wpl_staff` FOREIGN KEY (`registered_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. ÍNDICES DE OPTIMIZACIÓN
-- -----------------------------------------------------------------------------
CREATE INDEX `idx_users_auth_token` ON `users`(`auth_token`);
CREATE INDEX `idx_users_driver_uuid` ON `users`(`driver_uuid`);
CREATE INDEX `idx_users_rider_code` ON `users`(`rider_code`);
CREATE INDEX `idx_products_sku` ON `products`(`sku`);
CREATE INDEX `idx_products_slug` ON `products`(`slug`);
CREATE INDEX `idx_products_category` ON `products`(`category_id`);
CREATE INDEX `idx_products_supplier` ON `products`(`supplier_id`);
CREATE INDEX `idx_orders_user` ON `orders`(`user_id`);
CREATE INDEX `idx_orders_status` ON `orders`(`status`);
CREATE INDEX `idx_orders_reference` ON `orders`(`payment_reference`);
CREATE INDEX `idx_inventory_product` ON `inventory_logs`(`product_id`);
CREATE INDEX `idx_suppliers_status` ON `suppliers`(`status`);
CREATE INDEX `idx_wpl_product` ON `warranty_performance_logs`(`product_id`);
CREATE INDEX `idx_wpl_supplier` ON `warranty_performance_logs`(`supplier_id`);
CREATE INDEX `idx_wpl_user` ON `warranty_performance_logs`(`user_id`);

-- -----------------------------------------------------------------------------
-- 16. DATOS INICIALES ESENCIALES (SEEDING)
-- -----------------------------------------------------------------------------

-- Roles base
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'administrator', 'Acceso total a la configuración del sistema, gestión de usuarios, inventario y reportes financieros.'),
(2, 'secretary', 'Gestión de órdenes de compra, actualización de inventario, consulta de clientes y atención al cliente.'),
(3, 'customer', 'Conductor registrado en VixyRider con acceso exclusivo a catálogo de repuestos y compras.')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Usuario Administrador por defecto
-- Email: admin@vixystore.com | Contraseña: Admin2024!
INSERT INTO `users` (`id`, `role_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `status`) VALUES
(1, 1, 'Administrador', 'Vixy', 'admin@vixystore.com', '$2y$10$Y1lhCrrYcELI9fgKwz5gt..CMi/n548jfV/Tm.q7ZM3iDULA0Ssle', '+584121112233', 'active')
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`), `password_hash`=VALUES(`password_hash`), `status`=VALUES(`status`);

-- Proveedores iniciales
INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `email`, `status`, `notes`) VALUES
(1, 'Distribuidora Global Auto C.A.', 'Carlos Mendoza', '+58 412 1234567', 'ventas@globalauto.com', 'active', 'Distribuidor mayorista de tren delantero y rodamientos'),
(2, 'Lubricantes y Filtros de Venezuela', 'Mariana Gómez', '+58 414 7654321', 'contacto@lubrifiltros.ve', 'active', 'Proveedor mayorista de aceites y aditivos automotrices'),
(3, 'Importadora ElectroPartes Vixy', 'Pedro Sánchez', '+58 424 9988776', 'pedro@electropartes.com', 'active', 'Componentes eléctricos automotrices, luces LED y baterías')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Categorías iniciales
INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `is_active`) VALUES
(1, NULL, 'Repuestos Automotrices', 'repuestos-automotrices', 'Repuestos mecánicos, suspensión, tren delantero y piezas de motor.', TRUE),
(2, NULL, 'Lubricantes y Fluidos', 'lubricantes-fluidos', 'Aceites de motor sintéticos, semisintéticos, refrigerantes y valvulina.', TRUE),
(3, NULL, 'Baterías y Electricidad', 'baterias-electricidad', 'Baterías selladas, alternadores, iluminación LED y componentes eléctricos.', TRUE),
(4, NULL, 'Herramientas y Accesorios', 'herramientas-accesorios', 'Kits de herramientas mecánicas, gatos hidráulicos, compresores y auxilio vial.', TRUE)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Catálogo de productos inicial (vacio por defecto)
-- Los productos se cargan desde el panel administrativo ERP o via API

SET FOREIGN_KEY_CHECKS = 1;
