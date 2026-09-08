-- ==============================================================================
-- SISTEMA VIXY DELIVERY & STORE - ESQUEMA DE BASE DE DATOS MYSQL / MARIADB
-- ARCHIVO: sql/comercios.sql
-- TABLAS: comercios, productos_catalogo, categorias_comercio, cuentas_pago_comercio
-- RUTAS WEB API ASOCIADAS:
--   POST /api/v1/comercios/registro
--   GET  /api/v1/comercios/listado?categoria={hogar|ferreteria|restaurantes|comida_rapida|supermercados}
--   GET  /api/v1/comercios/{id}/catalogo
--   PUT  /api/v1/comercios/{id}/horarios-estatus
--   POST /api/v1/comercios/{id}/productos
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS vixy_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vixy_platform_db;

-- 1. Tabla de Categorías Principales de Comercios
CREATE TABLE IF NOT EXISTS categorias_comercio (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'store',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categorias_comercio (id, codigo, nombre, descripcion, icono, orden) VALUES
('cat-hogar', 'hogar', 'Hogar', 'Muebles, decoración, electrodomésticos, lencería y artículos del hogar', 'home', 1),
('cat-ferreteria', 'ferreteria', 'Ferretería', 'Herramientas, tornillería, pinturas, plomería y materiales eléctricos', 'wrench', 2),
('cat-restaurantes', 'restaurantes', 'Restaurantes', 'Gastronomía variada, comida criolla, internacional, pastas y cortes', 'utensils', 3),
('cat-comida-rapida', 'comida_rapida', 'Comida Rápida', 'Hamburguesas, pizzas, pollo frito, empanadas, tequeños y snacks', 'zap', 4),
('cat-supermercados', 'supermercados', 'Supermercados', 'Víveres, charcutería, carnicería, lácteos, bebidas y abarrotes', 'shopping-cart', 5)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 2. Tabla Principal de Comercios Afiliados (Vixy Store)
CREATE TABLE IF NOT EXISTS comercios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    rif VARCHAR(30) NOT NULL UNIQUE,
    categoria_principal ENUM('hogar', 'ferreteria', 'restaurantes', 'comida_rapida', 'supermercados') NOT NULL DEFAULT 'restaurantes',
    categoria_nombre VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255) DEFAULT '/uploads/comercios/logos/default.jpg',
    portada_url VARCHAR(255) DEFAULT '/uploads/comercios/portadas/default.jpg',
    descripcion TEXT,
    direccion TEXT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL,
    
    -- Control de Horarios y Disponibilidad en Tiempo Real
    hora_apertura TIME NOT NULL DEFAULT '08:00:00',
    hora_cierre TIME NOT NULL DEFAULT '22:00:00',
    dias_operacion JSON NOT NULL COMMENT 'Array de días activos: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]',
    horarios_texto VARCHAR(100) DEFAULT 'Lunes a Domingo 08:00 AM - 10:00 PM',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Si es FALSE, el cliente no puede ordenar ni ver servicio disponible',
    abierto_manual BOOLEAN DEFAULT TRUE COMMENT 'Permite al dueño cerrar de emergencia el local',
    
    -- Parámetros de Operación y Delivery
    tiempo_estimado_min INT DEFAULT 20,
    tiempo_estimado_max INT DEFAULT 45,
    costo_envio_base_usd DECIMAL(10, 2) DEFAULT 2.50,
    calificacion DECIMAL(3, 2) DEFAULT 5.00,
    total_calificaciones INT DEFAULT 0,
    
    -- Cuentas de Cobro Directo al Comercio
    pago_movil_banco VARCHAR(80),
    pago_movil_telefono VARCHAR(30),
    pago_movil_cedula_rif VARCHAR(30),
    zelle_email VARCHAR(120),
    zelle_titular VARCHAR(150),
    zinli_email VARCHAR(120),
    binance_pay_id VARCHAR(50),
    
    -- Billetera Comercial / Saldo Acreditado
    saldo_billetera_usd DECIMAL(12, 2) DEFAULT 0.00,
    saldo_billetera_bs DECIMAL(14, 2) DEFAULT 0.00,
    total_ventas_usd DECIMAL(14, 2) DEFAULT 0.00,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categoria_principal (categoria_principal),
    INDEX idx_activo_abierto (activo, abierto_manual),
    INDEX idx_coordenadas (latitud, longitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Catálogo de Productos y Artículos
CREATE TABLE IF NOT EXISTS productos_catalogo (
    id VARCHAR(50) PRIMARY KEY,
    comercio_id VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_usd DECIMAL(10, 2) NOT NULL,
    categoria_interna VARCHAR(80) NOT NULL,
    imagen_url VARCHAR(255) NOT NULL,
    imagen_path VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    tiempo_preparacion_min INT DEFAULT 15,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (comercio_id) REFERENCES comercios(id) ON DELETE CASCADE,
    INDEX idx_comercio_disponible (comercio_id, disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Triggers y Funciones de Verificación de Horario
DELIMITER //
CREATE FUNCTION fn_comercio_esta_disponible(comercio_id_param VARCHAR(50))
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_activo BOOLEAN;
    DECLARE v_abierto_manual BOOLEAN;
    DECLARE v_hora_apertura TIME;
    DECLARE v_hora_cierre TIME;
    DECLARE v_hora_actual TIME;
    
    SELECT activo, abierto_manual, hora_apertura, hora_cierre 
    INTO v_activo, v_abierto_manual, v_hora_apertura, v_hora_cierre
    FROM comercios 
    WHERE id = comercio_id_param;
    
    IF v_activo IS FALSE OR v_abierto_manual IS FALSE THEN
        RETURN FALSE;
    END IF;
    
    SET v_hora_actual = CURTIME();
    
    IF v_hora_apertura <= v_hora_cierre THEN
        IF v_hora_actual >= v_hora_apertura AND v_hora_actual <= v_hora_cierre THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
        END IF;
    ELSE
        -- Horario nocturno que pasa de medianoche (ej: 18:00 a 02:00)
        IF v_hora_actual >= v_hora_apertura OR v_hora_actual <= v_hora_cierre THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
        END IF;
    END IF;
END //
DELIMITER ;
