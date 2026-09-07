-- ==============================================================================
-- VIXY DELIVERY - MIGRACIÓN PARA CONTRASEÑAS Y REGISTRO DE CONDUCTORES
-- Ejecutar en phpMyAdmin en la base de datos: c2861522_regist
-- Compatible con MySQL 5.7, 8.0 y MariaDB (sin comando IF NOT EXISTS)
-- ==============================================================================

USE `c2861522_regist`;

-- 1. Agregar columnas en tabla comercios para contraseñas y tipo de comercio
-- (Si alguna columna ya existiera y da error 'Duplicate column', puedes omitirla)
ALTER TABLE `comercios`
  ADD `tipo_comercio` ENUM('con_rif', 'independiente') NOT NULL DEFAULT 'con_rif' AFTER `codigo_comercio`,
  ADD `password_hash` VARCHAR(255) DEFAULT NULL AFTER `tipo_comercio`;

-- 2. Crear tabla de conductores / repartidores de moto
CREATE TABLE `conductores` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo_conductor` VARCHAR(30) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `cedula` VARCHAR(30) NOT NULL UNIQUE,
    `telefono` VARCHAR(30) NOT NULL UNIQUE,
    `email` VARCHAR(150) DEFAULT NULL,
    `fecha_nacimiento` DATE DEFAULT NULL,
    `direccion` TEXT DEFAULT NULL,
    `moto_marca` VARCHAR(80) DEFAULT NULL,
    `moto_modelo` VARCHAR(80) DEFAULT NULL,
    `moto_color` VARCHAR(50) DEFAULT NULL,
    `moto_placa` VARCHAR(20) NOT NULL,
    `moto_ano` VARCHAR(10) DEFAULT NULL,
    `licencia_conducir` VARCHAR(50) DEFAULT NULL,
    `foto_url` VARCHAR(500) DEFAULT NULL,
    `status` ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido') DEFAULT 'pendiente',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_conductor_cedula` (`cedula`),
    INDEX `idx_conductor_telefono` (`telefono`),
    INDEX `idx_conductor_placa` (`moto_placa`),
    INDEX `idx_conductor_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
