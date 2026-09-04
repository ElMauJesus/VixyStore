-- =============================================================================
-- BASE DE DATOS: VIXY STORE (VERSIÓN OPTIMIZADA Y ACTUALIZADA)
-- Motores compatibles: MySQL 8.0+ / MariaDB / PostgreSQL (sintaxis adaptable)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS vixy_store
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE vixy_store;

-- -----------------------------------------------------------------------------
-- 1. MÓDULO DE USUARIOS Y ROLES (RBAC)
-- -----------------------------------------------------------------------------

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,          -- 'administrator', 'secretary', 'customer'
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    driver_uuid VARCHAR(40) NULL UNIQUE,         -- ID/UUID de la tabla drivers en vixyhgtk_vixy_driver_prereg
    rider_code VARCHAR(50) NULL,                 -- Código de conductor (Ej: VIXY-042)
    driver_category VARCHAR(50) NULL,            -- 'taxi', 'mototaxi', 'delivery'
    vehicle_info VARCHAR(255) NULL,              -- Información sincronizada del vehículo (marca, modelo, año, placa)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,        -- Argon2id o BCRYPT generado por PHP
    phone VARCHAR(20) NULL,
    auth_token VARCHAR(255) NULL,
    token_expires_at TIMESTAMP NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Venezuela',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_addresses_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE customer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    occupation VARCHAR(100) NULL,              -- Ej: 'Mecánico', 'Diseñador', 'Conductor Taxi', 'Particular'
    equipment_info VARCHAR(150) NULL,          -- Ej: 'Chevrolet Aveo 2008', 'PC Gamer Workstation', 'Línea de producción'
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. MÓDULO DE PROVEEDORES, CATÁLOGO E INVENTARIO
-- -----------------------------------------------------------------------------

CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,               -- Ej: 'Distribuidora Global Auto' / 'Papá de Matilda'
    contact_person VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(150) NULL,
    status ENUM('active', 'under_review', 'blacklisted') DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NULL,                        -- Permite subcategorías jerárquicas
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    supplier_id INT NULL,                      -- Proveedor directo del repuesto
    sku VARCHAR(50) NOT NULL UNIQUE,           -- Código único de inventario
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(170) NOT NULL UNIQUE,         -- URL amigable para Next.js
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,             -- Precio de venta al público
    cost_price DECIMAL(10, 2) NOT NULL,        -- Costo de adquisición (para cálculo de margen)
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 5,    -- Umbral para alertas en Secretaría/Admin
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_categories FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_products_suppliers FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_images_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE inventory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NULL,                          -- Usuario (Admin/Secretaría) que hizo la modificación
    type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL, 
    quantity_changed INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_inv_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. MÓDULO DE VENTAS Y PEDIDOS
-- -----------------------------------------------------------------------------

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,  -- Ej: VIX-2026-0001
    user_id INT NOT NULL,
    shipping_address_id INT NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded', 'failed') DEFAULT 'unpaid',
    payment_method VARCHAR(50) NOT NULL,       -- 'pago_movil', 'zelle', 'transfer', 'binance', 'zinli', 'card'
    payment_reference VARCHAR(100) NULL,      -- Referencia bancaria, TXID o comprobante
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_addresses FOREIGN KEY (shipping_address_id) REFERENCES user_addresses(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,        -- Copia estática por si cambia el producto
    unit_price DECIMAL(10, 2) NOT NULL,        -- Copia del precio al momento de la compra
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_items_orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_items_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. CARRITO DE COMPRAS Y AUDITORÍA
-- -----------------------------------------------------------------------------

CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,               -- Un carrito por usuario registrado
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cartitems_carts FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cartitems_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,             -- Ej: 'UPDATE_ORDER_STATUS', 'BLACK_LIST_SUPPLIER'
    entity_type VARCHAR(50) NOT NULL,         -- 'products', 'orders', 'suppliers'
    entity_id INT NOT NULL,
    details JSON NULL,                         -- Captura del estado anterior/nuevo
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. MÓDULO DE CONTROL DE CALIDAD Y FICHAS DE GARANTÍA
-- -----------------------------------------------------------------------------

CREATE TABLE warranty_performance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_number VARCHAR(50) NOT NULL UNIQUE,    -- Ej: FICHA-2026-0001
    order_id INT NULL,                         -- Relación opcional con la venta
    user_id INT NOT NULL,                      -- Comprador
    product_id INT NOT NULL,                   -- Artículo / Producto
    supplier_id INT NOT NULL,                  -- Proveedor de la pieza/artículo
    user_occupation VARCHAR(100) NULL,          -- Ocupación/Rol al momento del fallo o reporte
    usage_context VARCHAR(150) NULL,           -- Contexto de uso (Ej: 'Instalado en Aveo 2008', 'Uso continuo 24/7')
    purchase_date DATE NOT NULL,               -- Fecha de compra
    durability_value DECIMAL(10, 2) NULL,      -- Valor numérico de rendimiento (Ej: 2000, 15, 500)
    durability_unit VARCHAR(50) NULL,          -- Unidad de medida (Ej: 'km', 'días', 'horas', 'ciclos', 'meses')
    status ENUM('in_use', 'warranty_claimed', 'failed_out_of_warranty', 'resolved_replacement', 'resolved_refund') DEFAULT 'warranty_claimed',
    observation TEXT NOT NULL,                 -- Descripción detallada de la calidad o fallo
    registered_by_user_id INT NOT NULL,        -- Personal de Secretaría/Admin que registró la ficha
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wpl_orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_wpl_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wpl_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wpl_suppliers FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wpl_staff FOREIGN KEY (registered_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. ÍNDICES DE OPTIMIZACIÓN Y BÚSQUEDA RÁPIDA
-- -----------------------------------------------------------------------------

CREATE INDEX idx_users_auth_token ON users(auth_token);
CREATE INDEX idx_users_driver_uuid ON users(driver_uuid);
CREATE INDEX idx_users_rider_code ON users(rider_code);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_reference ON orders(payment_reference);
CREATE INDEX idx_inventory_product ON inventory_logs(product_id);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_wpl_product ON warranty_performance_logs(product_id);
CREATE INDEX idx_wpl_supplier ON warranty_performance_logs(supplier_id);
CREATE INDEX idx_wpl_user ON warranty_performance_logs(user_id);

-- -----------------------------------------------------------------------------
-- 7. DATOS INICIALES ESENCIALES (SEEDING)
-- -----------------------------------------------------------------------------

INSERT INTO roles (id, name, description) VALUES
(1, 'administrator', 'Acceso total a la configuración del sistema, gestión de usuarios, inventario y reportes financieros.'),
(2, 'secretary', 'Gestión de órdenes de compra, actualización de inventario, consulta de clientes y atención al cliente.'),
(3, 'customer', 'Conductor registrado en VixyRider con acceso exclusivo a catálogo de repuestos y compras.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Usuario Administrador por defecto (Contraseña: Admin12345*)
INSERT INTO users (id, role_id, first_name, last_name, email, password_hash, phone, status) VALUES
(1, 1, 'Administrador', 'Vixy', 'admin@vixystore.com', '$2y$10$vO8fG0s5uW5dGlnzG1Lg6OFZzQc3mCvywB.wXmN6.n5n2bA5rFw32', '+584121112233', 'active')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- NOTA: Los conductores no requieren inserción manual en esta base de datos.
-- Se autentican y aprovisionan automáticamente contra la base de datos de VixyRider al iniciar sesión.

-- Proveedores iniciales
INSERT INTO suppliers (id, name, contact_person, phone, email, status, notes) VALUES
(1, 'Distribuidora Global Auto C.A.', 'Carlos Mendoza', '+58 412 1234567', 'ventas@globalauto.com', 'active', 'Distribuidor mayorista de tren delantero y rodamientos'),
(2, 'Lubricantes y Filtros de Venezuela', 'Mariana Gómez', '+58 414 7654321', 'contacto@lubrifiltros.ve', 'active', 'Proveedor mayorista de aceites y aditivos automotrices'),
(3, 'Importadora ElectroPartes Vixy', 'Pedro Sánchez', '+58 424 9988776', 'pedro@electropartes.com', 'active', 'Componentes eléctricos automotrices, luces LED y baterías')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Categorías iniciales
INSERT INTO categories (id, parent_id, name, slug, description, is_active) VALUES
(1, NULL, 'Repuestos Automotrices', 'repuestos-automotrices', 'Repuestos mecánicos, suspensión, tren delantero y piezas de motor.', TRUE),
(2, NULL, 'Lubricantes y Fluidos', 'lubricantes-fluidos', 'Aceites de motor sintéticos, semisintéticos, refrigerantes y valvulina.', TRUE),
(3, NULL, 'Baterías y Electricidad', 'baterias-electricidad', 'Baterías selladas, alternadores, iluminación LED y componentes eléctricos.', TRUE),
(4, NULL, 'Herramientas y Accesorios', 'herramientas-accesorios', 'Kits de herramientas mecánicas, gatos hidráulicos, compresores y auxilio vial.', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Catálogo de productos inicial
INSERT INTO products (id, category_id, supplier_id, sku, name, slug, description, price, cost_price, stock_quantity, min_stock_alert, is_active) VALUES
(1, 1, 1, 'REP-001', 'Pastillas de Freno Delanteras Cerámicas', 'pastillas-freno-delanteras-ceramicas', 'Pastillas de freno de compuesto cerámico de alta duración. Frenado progresivo, silencioso y con mínimo desprendimiento de polvo. Compatibles con sedanes y compactos.', 28.50, 16.00, 35, 8, TRUE),
(2, 2, 2, 'LUB-001', 'Aceite de Motor Sintético 5W-30 (1 Galón)', 'aceite-motor-sintetico-5w30-galon', 'Lubricante 100% sintético con aditivos antidesgaste avanzados. Protección térmica superior en climas cálidos y prolongación de intervalos de cambio.', 34.00, 22.00, 48, 10, TRUE),
(3, 3, 3, 'BAT-001', 'Batería Libre de Mantenimiento 800 AMP', 'bateria-libre-mantenimiento-800-amp', 'Batería de aleación calcio-plata con alta corriente de arranque en frío. 12 meses de garantía directa.', 85.00, 58.00, 14, 5, TRUE),
(4, 1, 1, 'REP-002', 'Amortiguadores Traseros a Gas Reforzados (Par)', 'amortiguadores-traseros-gas-reforzados', 'Juego de dos amortiguadores presurizados a gas con pistón de cromo templado. Estabilidad insuperable sobre pavimento irregular.', 62.00, 40.00, 18, 6, TRUE),
(5, 2, 2, 'LUB-002', 'Refrigerante / Coolant Orgánico 50/50 1 Galón', 'refrigerante-coolant-organico-50-50', 'Fórmula pre-diluida con tecnología OAT de larga duración. Evita corrosión y sobrecalentamiento del bloque motor.', 14.50, 8.50, 50, 12, TRUE),
(6, 4, 3, 'HER-001', 'Kit de Herramientas Mecánicas 82 Piezas Cromo Vanadio', 'kit-herramientas-mecanicas-82-piezas', 'Estuche rígido profesional con llaves combinadas, rachet 1/2 y 1/4, extensiones y dados milimétricos resistentes al torque severo.', 75.00, 48.00, 12, 4, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Imágenes de productos iniciales
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
(1, '/banners/vixybanner1.png', TRUE, 1),
(2, '/banners/vixybanner2.png', TRUE, 1),
(3, '/banners/vixybanner1.png', TRUE, 1),
(4, '/banners/vixybanner2.png', TRUE, 1),
(5, '/banners/vixybanner1.png', TRUE, 1),
(6, '/banners/vixybanner2.png', TRUE, 1);