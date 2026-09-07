-- ==============================================================================
-- ACTUALIZACIÓN DE BD PARA COMERCIOS INDEPENDIENTES (c2861522_regist)
-- ==============================================================================
-- Instrucciones:
-- 1. Inicia sesión en tu cPanel / Ferozo de Donweb.
-- 2. Entra en phpMyAdmin y selecciona la base de datos `c2861522_regist`.
-- 3. Ve a la pestaña "SQL", pega este bloque de código y dale clic a "Continuar".
-- ==============================================================================

USE `c2861522_regist`;

-- 1. Permitir que rif_cedula_juridica sea NULL para comercios independientes
ALTER TABLE `comercios` MODIFY `rif_cedula_juridica` VARCHAR(50) NULL DEFAULT NULL;

-- 2. Asegurar que tipo_comercio admita 'con_rif' e 'independiente'
ALTER TABLE `comercios` MODIFY `tipo_comercio` ENUM('con_rif', 'independiente') NOT NULL DEFAULT 'con_rif';

-- 3. Asegurar que los campos opcionales permitan valores nulos
ALTER TABLE `comercios` MODIFY `telefono_adicional` VARCHAR(30) NULL DEFAULT NULL;
ALTER TABLE `comercios` MODIFY `horarios_atencion` VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE `comercios` MODIFY `ubicacion_gps` VARCHAR(100) NULL DEFAULT NULL;
ALTER TABLE `comercios` MODIFY `punto_referencia` VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE `comercios` MODIFY `categoria_negocio` VARCHAR(100) NULL DEFAULT NULL;
ALTER TABLE `comercios` MODIFY `descripcion_negocio` TEXT NULL DEFAULT NULL;
ALTER TABLE `comercios` MODIFY `redes_sociales` VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE `comercios` MODIFY `foto_comercio_url` VARCHAR(500) NULL DEFAULT NULL;
