-- ==============================================================================
-- VIXY DELIVERY - ALINEAR TABLA `conductores` DE c2861522_vixy_dl CON c2861522_regist
-- =================================================================--
-- Base de datos destino: c2861522_vixy_dl
-- Tabla: conductores
--
-- Propósito: Agregar TODAS las columnas que existen en regist.conductores y
-- que aún no están en vixy_dl.conductores, incluyendo datos legales, seriales
-- de moto, certificados médicos, rutas de fotos, y campos de auditoría.
-- También se eliminan los defaults incorrectos (foto_url con link, lat/lng con
-- coordenadas por defecto) para que nuevos registros entren limpios.
--
-- INSTRUCCIONES:
--   1) phpMyAdmin → base c2861522_vixy_dl → pestaña SQL.
--   2) Pegar TODO el contenido y ejecutar.
--   3) Si alguna columna ya existe → ignorar el error "Duplicate column" (MySQL 5.7).
--   4) Verificar con: DESCRIBE c2861522_vixy_dl.conductores;
-- ==============================================================================

USE `c2861522_vixy_dl`;

-- ============================================================================
-- A) COLUMNAS NUEVAS FÍSICAS / LEGALES (no existen actualmente en vixy_dl)
-- ============================================================================

-- A.1 Código único de conductor (regist usa este identificador)
ALTER TABLE `conductores`
    ADD COLUMN `codigo_conductor` VARCHAR(30) NULL DEFAULT NULL COMMENT 'Código único tipo DRV-XXXXXXXXXXXXXX de regist' AFTER `id`;

-- A.2 Datos personales complementarios
ALTER TABLE `conductores`
    ADD COLUMN `fecha_nacimiento` DATE NULL DEFAULT NULL COMMENT 'Fecha de nacimiento del conductor' AFTER `email`;
ALTER TABLE `conductores`
    ADD COLUMN `tipo_sangre` VARCHAR(10) NULL DEFAULT NULL COMMENT 'Tipo de sangre (opcional)' AFTER `fecha_nacimiento`;

-- A.3 Dirección / residencia
ALTER TABLE `conductores`
    ADD COLUMN `direccion` TEXT NULL DEFAULT NULL COMMENT 'Dirección de residencia del conductor' AFTER `foto_url`;

-- A.4 Seriales INTT de la motocicleta (regist usa moto_serial_motor / moto_serial_chasis)
ALTER TABLE `conductores`
    ADD COLUMN `moto_serial_motor` VARCHAR(80) NULL DEFAULT NULL COMMENT 'Serial del motor INTT' AFTER `ano_moto`;
ALTER TABLE `conductores`
    ADD COLUMN `moto_serial_chasis` VARCHAR(80) NULL DEFAULT NULL COMMENT 'Serial de chasis / NIV INTT' AFTER `moto_serial_motor`;

-- A.5 Licencia de conducir (registro / número)
ALTER TABLE `conductores`
    ADD COLUMN `licencia_conducir` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Número de licencia de conducir' AFTER `licencia_grado`;

-- A.6 Certificado médico
ALTER TABLE `conductores`
    ADD COLUMN `certificado_medico_nro` VARCHAR(60) NULL DEFAULT NULL COMMENT 'Número del certificado médico' AFTER `licencia_vencimiento`;
ALTER TABLE `conductores`
    ADD COLUMN `certificado_medico_vencimiento` DATE NULL DEFAULT NULL AFTER `certificado_medico_nro`;

-- A.7 RCV (seguro obligatorio)
ALTER TABLE `conductores`
    ADD COLUMN `rcv_aseguradora` VARCHAR(100) NULL DEFAULT NULL AFTER `certificado_medico_vencimiento`;
ALTER TABLE `conductores`
    ADD COLUMN `rcv_poliza_nro` VARCHAR(80) NULL DEFAULT NULL AFTER `rcv_aseguradora`;
ALTER TABLE `conductores`
    ADD COLUMN `rcv_vencimiento` DATE NULL DEFAULT NULL AFTER `rcv_poliza_nro`;

-- ============================================================================
-- B) COLUMNAS DE FOTOS/DOCUMENTOS ADICIONALES (regist usa estas rutas)
-- ============================================================================
-- Nota: vixy_dl ya tiene foto_cedula_url, foto_licencia_url,
--       foto_certificado_medico_url, foto_carnet_circulacion_url,
--       foto_vehiculo_url, foto_placa_url.
--       Aquí se agregan las que faltan por nombre de regist.

ALTER TABLE `conductores`
    ADD COLUMN `foto_perfil_url` VARCHAR(500) NULL DEFAULT NULL COMMENT 'URL de la foto de perfil del conductor' AFTER `carpeta_imagenes`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_cedula_reverso_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_cedula_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_carnet_url` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Foto carnet de conducir (regist usa este nombre)' AFTER `foto_licencia_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_rcv_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_certificado_medico_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_antecedentes_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_rcv_url`;
ALTER TABLE `conductores`
    ADD COLUMN `record_policial_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_placa_url`;

-- ============================================================================
-- C) CAMPOS DE AUDITORÍA / METADATOS (regist usa created_at / updated_at)
-- ============================================================================

ALTER TABLE `conductores`
    ADD COLUMN `aprobado_por` VARCHAR(80) NULL DEFAULT NULL COMMENT 'Admin que aprobó la solicitud (username)' AFTER `fecha_aprobacion`;
ALTER TABLE `conductores`
    ADD COLUMN `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Alias de creado_en para compatibilidad con regist' AFTER `verificado_por_admin`;
ALTER TABLE `conductores`
    ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- ============================================================================
-- D) MODIFICACIONES: ELIMINAR DEFAULTS INDESEADOS
-- ============================================================================
-- D.1 foto_url: eliminar el link de Unsplash por defecto
ALTER TABLE `conductores`
    MODIFY `foto_url` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Foto de perfil del conductor (NULL = sin foto, ya no apunta a Unsplash)';

-- D.2 latitud_actual: eliminar default geográfico (Caracas)
ALTER TABLE `conductores`
    MODIFY `latitud_actual` DECIMAL(10,8) NULL DEFAULT NULL COMMENT 'Latitud GPS actual del conductor (NULL = sin coordenada)';

-- D.3 longitud_actual: eliminar default geográfico (Caracas)
ALTER TABLE `conductores`
    MODIFY `longitud_actual` DECIMAL(11,8) NULL DEFAULT NULL COMMENT 'Longitud GPS actual del conductor (NULL = sin coordenada)';

-- ============================================================================
-- E) ÍNDICES DE APOYO
-- ============================================================================

ALTER TABLE `conductores`
    ADD INDEX `idx_conductor_codigo` (`codigo_conductor`);
ALTER TABLE `conductores`
    ADD INDEX `idx_conductor_aprobado` (`verificado_por_admin`, `estado_registro`);

-- ============================================================================
-- FIN.
-- Resultado esperado: la tabla conductores de vixy_dl debe tener todas las
-- columnas de regist más las propias (documentos_conductor, motivo_rechazo,
-- terminos_aceptados, estado_registro, verificado_por_admin, etc.)
-- Verificar con: DESCRIBE c2861522_vixy_dl.conductores;
-- ============================================================================
