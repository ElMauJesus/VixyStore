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
    `nombre_comercial` VARCHAR(150) NOT NULL,
    `nombre_representante` VARCHAR(150) NOT NULL,
    `rif_cedula_juridica` VARCHAR(50) NOT NULL,
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
    INDEX `idx_rif` (`rif_cedula_juridica`),
    INDEX `idx_email` (`email`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLA VACÍA LISTA PARA REGISTROS REALES DE COMERCIOS
-- ------------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 1;
