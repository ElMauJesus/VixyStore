-- ==============================================================================
-- VIXY DELIVERY PLATFORM - SCRIPT DE ACTUALIZACIÓN & MIGRACIÓN SQL
-- Base de Datos: c2861522_vixy_dl (Donweb / Ferozo / cPanel / phpMyAdmin)
-- Motor: MySQL 5.7+ / 8.0+ / MariaDB 10.3+
-- 
-- INSTRUCCIONES PARA phpMyAdmin:
-- 1. Inicia sesión en tu cPanel -> phpMyAdmin.
-- 2. En la columna izquierda, haz clic en la base de datos: c2861522_vixy_dl
-- 3. Ve a la pestaña "SQL" arriba.
-- 4. Pega todo el contenido de este archivo y haz clic en "Continuar" (Go).
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. AGREGAR COLUMNAS DE DESGLOSE FINANCIERO Y DESPACHO INTELIGENTE A `pedidos`
-- ------------------------------------------------------------------------------

-- Costo neto de los productos (Subtotal de artículos vendidos por el comercio)
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `costo_producto_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00 
COMMENT 'Costo de los productos sin flete' AFTER `monto_subtotal_usd`;

-- Costo de delivery (Tarifa del viaje del motorizado)
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `costo_delivery_usd` DECIMAL(10,2) NOT NULL DEFAULT 2.00 
COMMENT 'Tarifa de despacho/carrera pagada por el cliente' AFTER `costo_envio_usd`;

-- Ganancia neta del conductor (85% del flete o tarifa calculada de carrera)
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `ganancia_conductor_usd` DECIMAL(10,2) NOT NULL DEFAULT 1.70 
COMMENT 'Ganancia líquida asignada al motorizado por el servicio' AFTER `costo_delivery_usd`;

-- Ganancia o comisión de la aplicación Vixy (15% sobre el flete)
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `ganancia_app_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.30 
COMMENT 'Comisión administrativa de Vixy retenida o descontada' AFTER `ganancia_conductor_usd`;

-- Conductor al que se le está ofreciendo la carrera actualmente con el timer de 15s
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `conductor_oferta_id` VARCHAR(50) NULL 
COMMENT 'ID del conductor evaluando la oferta en curso' AFTER `conductor_id`;

-- Marcas temporales para el control del temporizador de 15 segundos
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `tiempo_inicio_oferta` TIMESTAMP NULL DEFAULT NULL 
COMMENT 'Hora exacta en que se disparó la oferta al conductor' AFTER `conductor_oferta_id`;

ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `tiempo_limite_oferta` TIMESTAMP NULL DEFAULT NULL 
COMMENT 'Hora en que expira la oferta (inicio + 15 segundos)' AFTER `tiempo_inicio_oferta`;

ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `segundos_restantes_oferta` INT DEFAULT 15 
COMMENT 'Segundos restantes del contador regresivo' AFTER `tiempo_limite_oferta`;

-- Lista de conductores que han rechazado o dejado expirar los 15 segundos
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `conductores_rechazados` TEXT NULL 
COMMENT 'Arreglo JSON o lista de IDs de motorizados que rechazaron o expiraron' AFTER `segundos_restantes_oferta`;

-- Estado detallado del proceso de despacho
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `estado_despacho` ENUM(
    'buscando_conductor',
    'ofrecido_a_conductor',
    'aceptado',
    'en_camino_comercio',
    'en_camino_cliente',
    'completado',
    'sin_conductores_disponibles'
) NOT NULL DEFAULT 'buscando_conductor' 
COMMENT 'Fase específica del algoritmo de asignación' AFTER `conductores_rechazados`;

-- Bandera de control de liquidación de comisión en la billetera
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `comision_descontada` TINYINT(1) DEFAULT 0 
COMMENT 'Indica si ya se debitó la comisión de la billetera del conductor' AFTER `estado_despacho`;

-- Detalles extendidos de la liquidación en formato JSON
ALTER TABLE `pedidos` 
ADD COLUMN IF NOT EXISTS `detalles_liquidacion` JSON NULL 
COMMENT 'Resumen estructurado con breakdown de costos, comisión y retenciones' AFTER `comision_descontada`;

-- Sincronizar datos históricos para que no queden campos en cero
UPDATE `pedidos` 
SET `costo_producto_usd` = `monto_subtotal_usd`,
    `costo_delivery_usd` = `costo_envio_usd`,
    `ganancia_conductor_usd` = ROUND(`costo_envio_usd` * 0.85, 2),
    `ganancia_app_usd` = ROUND(`costo_envio_usd` * 0.15, 2)
WHERE `costo_producto_usd` = 0.00;

-- ------------------------------------------------------------------------------
-- 2. ACTUALIZAR TABLA `entregas_carreras`
-- ------------------------------------------------------------------------------
ALTER TABLE `entregas_carreras`
ADD COLUMN IF NOT EXISTS `costo_producto_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00 
COMMENT 'Costo de los productos transportados' AFTER `pedido_id`;

ALTER TABLE `entregas_carreras`
ADD COLUMN IF NOT EXISTS `monto_total_servicio_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00 
COMMENT 'Total cobrado (Productos + Delivery)' AFTER `costo_envio_total_usd`;

-- ------------------------------------------------------------------------------
-- 3. CREAR TABLA DE TELEMETRÍA GPS Y KEEP-ALIVE (USADA POR keep_alive.php)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `telemetria_dispositivos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` VARCHAR(50) NOT NULL,
    `tipo_usuario` ENUM('conductor', 'comercio', 'cliente') NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `latitud` DECIMAL(10, 7) NOT NULL DEFAULT 0.0,
    `longitud` DECIMAL(10, 7) NOT NULL DEFAULT 0.0,
    `bateria` INT NULL,
    `online` TINYINT(1) NOT NULL DEFAULT 1,
    `app_version` VARCHAR(30) NULL,
    `ultima_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_usuario` (`usuario_id`, `tipo_usuario`),
    INDEX `idx_gps` (`latitud`, `longitud`),
    INDEX `idx_actualizacion` (`ultima_actualizacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. CREAR TABLA DE MÉTODOS DE PAGO (USADA POR pagos.php)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuracion_metodos_pago` (
    `id` VARCHAR(50) PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `es_obligatorio` TINYINT(1) NOT NULL DEFAULT 0,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    `descripcion` TEXT NULL,
    `requiere_comprobante` TINYINT(1) NOT NULL DEFAULT 0,
    `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion_metodos_pago` (`id`, `nombre`, `es_obligatorio`, `activo`, `descripcion`, `requiere_comprobante`)
VALUES 
    ('pago_movil', 'Pago Móvil (Directo a Negocio)', 1, 1, 'Pago directo en Bs al comercio a tasa BCV. Obligatorio por normativa.', 1),
    ('saldo_cartera', 'Cartera Digital Vixy (Wallet)', 1, 1, 'Saldo de billetera prepagada. Comprobantes auditados por administración.', 1),
    ('efectivo', 'Efectivo Divisas / Bolívares', 1, 1, 'Cobro en mano en la entrega. Comisión descontada de billetera del motorizado.', 0),
    ('zelle', 'Zelle (USD)', 0, 1, 'Transferencias directas en USD.', 1),
    ('zinli', 'Zinli Wallet (USD)', 0, 1, 'Billetera digital prepagada internacional.', 1),
    ('binance', 'Binance Pay (USDT)', 0, 1, 'Criptopagos inmediatos vía Binance Pay ID / QR.', 1),
    ('paypal', 'PayPal (USD)', 0, 0, 'Pagos internacionales en línea.', 1),
    ('punto_venta', 'Punto de Venta Móvil', 0, 0, 'Cobro con tarjeta de débito al momento de la entrega.', 0)
ON DUPLICATE KEY UPDATE 
    `nombre` = VALUES(`nombre`),
    `es_obligatorio` = VALUES(`es_obligatorio`),
    `descripcion` = VALUES(`descripcion`);

-- ------------------------------------------------------------------------------
-- 5. CREAR TABLA `usuarios_admin` DE RESPALDO SI NO EXISTE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios_admin` (
    `id` VARCHAR(50) PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `rol` ENUM('super_admin', 'operador', 'finanzas', 'soporte') NOT NULL DEFAULT 'super_admin',
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `usuarios_admin` (`id`, `username`, `password_hash`, `nombre`, `email`, `rol`, `activo`)
VALUES ('adm-super-001', 'vixydely', '123456', 'Super Administrador Vixy', 'vixydely@vixy.com', 'super_admin', 1)
ON DUPLICATE KEY UPDATE 
    `nombre` = VALUES(`nombre`),
    `email` = VALUES(`email`),
    `rol` = 'super_admin',
    `activo` = 1;

-- ------------------------------------------------------------------------------
-- 6. ÍNDICES DE RENDIMIENTO PARA ASIGNACIÓN RÁPIDA (15s)
-- ------------------------------------------------------------------------------
ALTER TABLE `conductores` 
ADD INDEX IF NOT EXISTS `idx_cercania_gps` (`disponible`, `bloqueado_por_saldo`, `latitud_actual`, `longitud_actual`);

ALTER TABLE `pedidos` 
ADD INDEX IF NOT EXISTS `idx_oferta_timer` (`conductor_oferta_id`, `estado_despacho`, `tiempo_limite_oferta`);

-- ------------------------------------------------------------------------------
-- 7. VISTA CONSOLIDADA: `vista_pedidos_desglose_financiero`
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vista_pedidos_desglose_financiero` AS
SELECT 
    p.id AS pedido_id,
    p.codigo_seguimiento,
    p.creado_en AS fecha_pedido,
    c.nombre AS nombre_comercio,
    TRIM(CONCAT(IFNULL(cli.nombre, ''), ' ', IFNULL(cli.apellido, ''))) AS nombre_cliente,
    IFNULL(CONCAT(d.nombre, ' ', d.apellido), 'Sin Asignar') AS nombre_conductor,
    IFNULL(d.telefono, 'N/A') AS telefono_conductor,
    p.metodo_pago,
    p.referencia_pago,
    p.costo_producto_usd,
    p.costo_delivery_usd,
    p.monto_total_usd,
    p.ganancia_conductor_usd,
    p.ganancia_app_usd,
    p.tasa_bcv_bs,
    p.monto_total_bs,
    p.estado,
    p.estado_despacho,
    p.segundos_restantes_oferta
FROM pedidos p
LEFT JOIN comercios c ON p.comercio_id = c.id
LEFT JOIN clientes cli ON p.cliente_id = cli.id
LEFT JOIN conductores d ON p.conductor_id = d.id;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Actualización de Vixy Delivery completada con éxito en c2861522_vixy_dl.' AS `resultado`;
