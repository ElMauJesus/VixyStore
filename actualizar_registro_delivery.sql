-- ==============================================================================
-- VIXY DELIVERY - ACTUALIZACIÓN TABLA `conductores` DE c2861522_regist
-- ==============================================================================
-- Base de datos destino: c2861522_regist
-- Tabla: conductores (Solicitudes / Registro de Deliverys)
--
-- Generado según la estructura ACTUAL de la tabla (phpMyAdmin):
-- Ya existen: id, codigo_conductor, password_hash, nombre, apellido, cedula,
--   telefono, email, fecha_nacimiento, direccion, moto_marca, moto_modelo,
--   moto_color, moto_placa, moto_ano, licencia_conducir, foto_url, status,
--   created_at, updated_at, carpeta_imagenes, fecha_aprobacion.
--
-- Este archivo SOLO agrega lo que falta (sin duplicar columnas), modifica el
-- status para permitir 'inactivo' y actualiza índices. Ejecutándolo completo
-- en c2861522_regist no deja errores de columna duplicada.
--
-- INSTRUCCIONES:
--   1) phpMyAdmin → base c2861522_regist → pestaña SQL.
--   2) Pegar TODO el contenido y ejecutar.
--   3) Verificar con: DESCRIBE c2861522_regist.conductores;
-- ==============================================================================

USE c2861522_regist;

-- ------------------------------------------------------------------------------
-- A) COLUMNAS NUEVAS (no existen actualmente)
-- ------------------------------------------------------------------------------

-- A.1 Dato físico adicional
ALTER TABLE `conductores`
    ADD COLUMN `tipo_sangre` VARCHAR(10) NULL DEFAULT NULL COMMENT 'Tipo de sangre (opcional)' AFTER `fecha_nacimiento`;

-- A.2 Seriales INTT de la motocicleta
ALTER TABLE `conductores`
    ADD COLUMN `moto_serial_motor` VARCHAR(80) NULL DEFAULT NULL COMMENT 'Serial del motor' AFTER `moto_ano`;
ALTER TABLE `conductores`
    ADD COLUMN `moto_serial_chasis` VARCHAR(80) NULL DEFAULT NULL COMMENT 'Serial de chasis / NIV' AFTER `moto_serial_motor`;

-- A.3 Permisología y legalidad (números y vencimientos)
ALTER TABLE `conductores`
    ADD COLUMN `licencia_grado` VARCHAR(10) NULL DEFAULT '2da' COMMENT 'Grado de licencia INTT (2da, 3ra, 4ta)' AFTER `licencia_conducir`;
ALTER TABLE `conductores`
    ADD COLUMN `licencia_vencimiento` DATE NULL DEFAULT NULL AFTER `licencia_grado`;
ALTER TABLE `conductores`
    ADD COLUMN `certificado_medico_nro` VARCHAR(60) NULL DEFAULT NULL AFTER `licencia_vencimiento`;
ALTER TABLE `conductores`
    ADD COLUMN `certificado_medico_vencimiento` DATE NULL DEFAULT NULL AFTER `certificado_medico_nro`;
ALTER TABLE `conductores`
    ADD COLUMN `rcv_aseguradora` VARCHAR(100) NULL DEFAULT NULL AFTER `certificado_medico_vencimiento`;
ALTER TABLE `conductores`
    ADD COLUMN `rcv_poliza_nro` VARCHAR(80) NULL DEFAULT NULL AFTER `rcv_aseguradora`;
ALTER TABLE `conductores`
    ADD COLUMN `rcv_vencimiento` DATE NULL DEFAULT NULL AFTER `rcv_poliza_nro`;

-- A.4 Rutas de las FOTOS/documentos subidos por el conductor
--     (carpeta_imagenes YA EXISTE como columna 21; aquí solo se agregan las
--     rutas por documento. Los archivos se guardan SIEMPRE en el servidor en
--     /uploads/conductores/{codigo_conductor}/ y en la BD solo la ruta pública).
ALTER TABLE `conductores`
    ADD COLUMN `foto_perfil_url` VARCHAR(500) NULL DEFAULT NULL AFTER `carpeta_imagenes`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_cedula_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_perfil_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_cedula_reverso_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_cedula_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_licencia_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_cedula_reverso_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_carnet_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_licencia_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_certificado_medico_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_carnet_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_rcv_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_certificado_medico_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_antecedentes_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_rcv_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_vehiculo_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_antecedentes_url`;
ALTER TABLE `conductores`
    ADD COLUMN `foto_placa_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_vehiculo_url`;
ALTER TABLE `conductores`
    ADD COLUMN `record_policial_url` VARCHAR(500) NULL DEFAULT NULL AFTER `foto_placa_url`;

-- A.5 Auditoría de aprobación (fecha_aprobacion YA EXISTE como columna 22)
ALTER TABLE `conductores`
    ADD COLUMN `aprobado_por` VARCHAR(80) NULL DEFAULT NULL COMMENT 'Admin que aprobó la solicitud' AFTER `fecha_aprobacion`;

-- A.6 Estado operativo y billetera (espejo del perfil de conductor operativo)
ALTER TABLE `conductores`
    ADD COLUMN `disponible` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Conectado y listo para recibir carreras' AFTER `aprobado_por`;
ALTER TABLE `conductores`
    ADD COLUMN `en_carrera` TINYINT(1) NOT NULL DEFAULT 0 AFTER `disponible`;
ALTER TABLE `conductores`
    ADD COLUMN `latitud_actual` DECIMAL(10,8) NULL DEFAULT NULL AFTER `en_carrera`;
ALTER TABLE `conductores`
    ADD COLUMN `longitud_actual` DECIMAL(11,8) NULL DEFAULT NULL AFTER `latitud_actual`;
ALTER TABLE `conductores`
    ADD COLUMN `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00 AFTER `longitud_actual`;
ALTER TABLE `conductores`
    ADD COLUMN `total_carreras` INT NOT NULL DEFAULT 0 AFTER `rating`;
ALTER TABLE `conductores`
    ADD COLUMN `saldo_billetera_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `total_carreras`;
ALTER TABLE `conductores`
    ADD COLUMN `limite_saldo_negativo` DECIMAL(10,2) NOT NULL DEFAULT -0.50 COMMENT 'Bloqueo si el saldo baja de -$0.50' AFTER `saldo_billetera_usd`;
ALTER TABLE `conductores`
    ADD COLUMN `bloqueado_por_saldo` TINYINT(1) NOT NULL DEFAULT 0 AFTER `limite_saldo_negativo`;

-- ------------------------------------------------------------------------------
-- B) MODIFICACIONES A COLUMNAS EXISTENTES
-- ------------------------------------------------------------------------------

-- B.1 Permitir estado 'inactivo' (baja voluntaria / suspensión suave)
--     Se conservan los valores actuales: pendiente, aprobado, rechazado, suspendido
ALTER TABLE `conductores`
    MODIFY `status` ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido', 'inactivo') NOT NULL DEFAULT 'pendiente';

-- B.2 Permitir registros aún sin placa asignada (NULL mientras no se verifica la moto)
ALTER TABLE `conductores`
    MODIFY `moto_placa` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Placa INTT';

-- ------------------------------------------------------------------------------
-- C) ÍNDICES DE APOYO
-- ------------------------------------------------------------------------------

ALTER TABLE `conductores`
    ADD INDEX `idx_conductor_carpeta` (`carpeta_imagenes`);
ALTER TABLE `conductores`
    ADD INDEX `idx_conductor_status_disponible` (`status`, `disponible`);

-- ==============================================================================
-- FIN. Resultado esperado: 50 columnas.
--   DESCRIBE c2861522_regist.conductores;
-- ==============================================================================