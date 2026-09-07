-- ==============================================================================
-- SCRIPT DE ACTUALIZACION: VERIFICACION DE CUENTAS (COMERCIOS Y CONDUCTORES)
-- SISTEMA VIXY DELIVERY & VIXY STORE 2026
-- Compatible con todas las versiones de MySQL / MariaDB en phpMyAdmin (cPanel)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PARTE 1: BASE DE DATOS OPERATIVA: c2861522_vixy_dl
-- (Si ya ejecutaste esta parte con éxito previamente, puedes omitirla)
-- ------------------------------------------------------------------------------
USE `c2861522_vixy_dl`;

-- Tabla: comercios en vixy_dl
ALTER TABLE `comercios` 
  ADD `status` ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido') NOT NULL DEFAULT 'pendiente' AFTER `activo`,
  ADD `carpeta_imagenes` VARCHAR(255) NULL AFTER `status`,
  ADD `documentos_comercio` TEXT NULL AFTER `carpeta_imagenes`,
  ADD `fecha_aprobacion` DATETIME NULL AFTER `documentos_comercio`;

-- Asegurar que los comercios base del sistema queden aprobados por defecto
UPDATE `comercios` 
SET `status` = 'aprobado', `activo` = 1, `fecha_aprobacion` = NOW() 
WHERE `status` = 'pendiente' AND (`id` LIKE 'COM-%' OR `id` IN ('com_1', 'com_2', 'com_3', 'com_4', 'com_5'));

-- Tabla: conductores en vixy_dl
ALTER TABLE `conductores` 
  ADD `status` ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido') NOT NULL DEFAULT 'pendiente' AFTER `disponible`,
  ADD `carpeta_imagenes` VARCHAR(255) NULL AFTER `status`,
  ADD `documentos_conductor` TEXT NULL AFTER `carpeta_imagenes`,
  ADD `fecha_aprobacion` DATETIME NULL AFTER `documentos_conductor`;

-- Asegurar que los conductores base del sistema queden aprobados por defecto
UPDATE `conductores` 
SET `status` = 'aprobado', `disponible` = 1, `fecha_aprobacion` = NOW() 
WHERE `status` = 'pendiente' AND (`id` LIKE 'DRV-%' OR `id` IN ('cond_1', 'cond_2', 'cond_3', 'cond_4', 'cond_5'));


-- ------------------------------------------------------------------------------
-- PARTE 2: BASE DE DATOS DE REGISTRO: c2861522_regist
-- NOTA: En esta base de datos la columna 'status' YA EXISTE originalmente.
-- Por eso daba error #1060 (columna duplicada). Solo se añaden las columnas faltantes.
-- ------------------------------------------------------------------------------
USE `c2861522_regist`;

-- Tabla: comercios en regist (la columna 'status' ya existe)
ALTER TABLE `comercios` 
  ADD `carpeta_imagenes` VARCHAR(255) NULL,
  ADD `fecha_aprobacion` DATETIME NULL;

-- Tabla: conductores en regist (la columna 'status' ya existe)
ALTER TABLE `conductores` 
  ADD `carpeta_imagenes` VARCHAR(255) NULL,
  ADD `fecha_aprobacion` DATETIME NULL;

-- ==============================================================================
-- FIN DEL SCRIPT
-- ==============================================================================
