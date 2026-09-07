-- ==============================================================================
-- VIXY RIDER - ESQUEMA DE REGISTRO DE COMERCIOS (cPanel / Donweb / Ferozo)
-- Base de Datos de Destino: c2861522_regist
-- Motor: MySQL 5.7+ / 8.0+ / MariaDB 10.3+
-- NOTA: Importe o copie y pegue este código directamente dentro de c2861522_regist.
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "-04:00"; -- Hora de Venezuela (GMT-4)

-- ------------------------------------------------------------------------------
-- 1. TABLA: comercios (Solicitudes y Comercios Aliados Registrados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comercios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo_comercio` VARCHAR(30) NOT NULL UNIQUE,          -- Ej: COM-20260905-A7B2C1
    `tipo_comercio` ENUM('con_rif', 'independiente') NOT NULL DEFAULT 'con_rif',
    `tipo_registro` ENUM('con_rif', 'rif', 'independiente') DEFAULT 'con_rif',
    `password_hash` VARCHAR(255) DEFAULT NULL,               -- Hash bcrypt para login en Vixy Delivery
    `nombre_comercial` VARCHAR(150) NOT NULL,
    `nombre_representante` VARCHAR(150) NOT NULL,
    `rif_cedula_juridica` VARCHAR(50) DEFAULT NULL,
    `cedula_representante` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `telefono_comercio` VARCHAR(30) NOT NULL,
    `telefono_adicional` VARCHAR(30) DEFAULT NULL,
    `horarios_atencion` VARCHAR(255) DEFAULT NULL,
    `ubicacion_gps` VARCHAR(100) DEFAULT NULL,
    `punto_referencia` VARCHAR(255) DEFAULT NULL,
    `cantidad_sucursales` INT DEFAULT 1,
    `direccion_negocio` VARCHAR(255) NOT NULL,
    `categoria_negocio` VARCHAR(100) DEFAULT NULL,
    `descripcion_negocio` TEXT DEFAULT NULL,
    `redes_sociales` VARCHAR(255) DEFAULT NULL,
    `foto_comercio_url` VARCHAR(500) DEFAULT NULL,
    `status` ENUM('pendiente', 'aprobado', 'rechazado', 'bloqueado') DEFAULT 'pendiente',
    `notas_auditoria` TEXT DEFAULT NULL,
    `ip_registro` VARCHAR(45) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_tipo` (`tipo_comercio`),
    INDEX `idx_rif` (`rif_cedula_juridica`),
    INDEX `idx_cedula_rep` (`cedula_representante`),
    INDEX `idx_email` (`email`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLA: conductores (Solicitudes y Conductor/Repartidores Afiliados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conductores` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo_conductor` VARCHAR(30) NOT NULL UNIQUE,          -- Ej: DRV-20260906-A3F9BC
    `password_hash` VARCHAR(255) NOT NULL,                   -- Hash bcrypt para login en Vixy Delivery
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `cedula` VARCHAR(30) NOT NULL UNIQUE,                    -- Identificador principal login (V-XXXXXXXX)
    `telefono` VARCHAR(30) NOT NULL UNIQUE,
    `email` VARCHAR(150) DEFAULT NULL,
    `fecha_nacimiento` DATE DEFAULT NULL,
    `direccion` TEXT DEFAULT NULL,
    -- Datos de la Motocicleta
    `moto_marca` VARCHAR(80) DEFAULT NULL,
    `moto_modelo` VARCHAR(80) DEFAULT NULL,
    `moto_color` VARCHAR(50) DEFAULT NULL,
    `moto_placa` VARCHAR(20) NOT NULL,                      -- Placa INTT
    `moto_ano` VARCHAR(10) DEFAULT NULL,
    -- Documentos y Permisología
    `licencia_conducir` VARCHAR(50) DEFAULT NULL,
    `foto_url` VARCHAR(500) DEFAULT NULL,
    -- Estado en la Plataforma
    `status` ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido') DEFAULT 'pendiente',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_conductor_cedula` (`cedula`),
    INDEX `idx_conductor_telefono` (`telefono`),
    INDEX `idx_conductor_placa` (`moto_placa`),
    INDEX `idx_conductor_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
