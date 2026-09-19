-- =============================================================================
-- VIXY DIGITAL ECOSYSTEM - ACTUALIZACIÓN ESTRUCTURAL DIRECTA (SIN DATOS DEMO)
-- Tu base de datos (c2861522_vixy_dl) ya contiene los clientes, comercios,
-- conductores y configuración reales. Este archivo SOLO añade las dos columnas
-- estructurales faltantes en la tabla pedidos y sincroniza los saldos existentes.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Añadir columnas estructurales en pedidos (solo estructura de tabla, sin datos ficticios)
ALTER TABLE `pedidos` ADD COLUMN `conductor_ofrecido_id` varchar(50) DEFAULT NULL AFTER `conductor_oferta_id`;
ALTER TABLE `pedidos` ADD COLUMN `conductores_rechazaron` text DEFAULT NULL AFTER `conductores_rechazados`;

-- 2. Sincronizar saldos de los clientes reales de la base de datos
-- (Garantiza que el saldo real cargado por recargas bancarias o saldo de cartera se refleje de manera idéntica)
UPDATE `clientes` 
SET `saldo_billetera_usd` = `saldo_cartera_usd` 
WHERE (`saldo_billetera_usd` = 0 OR `saldo_billetera_usd` IS NULL) AND `saldo_cartera_usd` > 0;

UPDATE `clientes` 
SET `saldo_cartera_usd` = `saldo_billetera_usd` 
WHERE (`saldo_cartera_usd` = 0 OR `saldo_cartera_usd` IS NULL) AND `saldo_billetera_usd` > 0;

SET FOREIGN_KEY_CHECKS = 1;
