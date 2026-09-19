-- =============================================================================
-- VIXY DIGITAL ECOSYSTEM - ACTUALIZACIÓN ESTRUCTURAL COMPATIBLE MYSQL 5.7 / 8.0+
-- Sin datos demo. Solo verifica columnas estructurales mediante information_schema.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- Procedimiento temporal para agregar columnas solo si no existen previamente
-- -----------------------------------------------------------------------------
DELIMITER $$

DROP PROCEDURE IF EXISTS `vixy_safe_add_column`$$
CREATE PROCEDURE `vixy_safe_add_column`(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table
      AND COLUMN_NAME = p_column;
      
    IF v_count = 0 THEN
        SET @ddl_query = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
        PREPARE stmt FROM @ddl_query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------------------------------
-- 1. TABLA: clientes (Asegurar campos técnicos)
-- -----------------------------------------------------------------------------
CALL vixy_safe_add_column('clientes', 'latitud', "DECIMAL(10,8) DEFAULT '10.48060000'");
CALL vixy_safe_add_column('clientes', 'longitud', "DECIMAL(11,8) DEFAULT '-66.90360000'");
CALL vixy_safe_add_column('clientes', 'saldo_billetera_usd', "DECIMAL(10,2) DEFAULT '0.00'");
CALL vixy_safe_add_column('clientes', 'saldo_cartera_usd', "DECIMAL(10,2) NOT NULL DEFAULT '0.00'");
CALL vixy_safe_add_column('clientes', 'saldo_cartera_bs', "DECIMAL(12,2) NOT NULL DEFAULT '0.00'");
CALL vixy_safe_add_column('clientes', 'foto_cedula_url', "VARCHAR(255) DEFAULT NULL");
CALL vixy_safe_add_column('clientes', 'foto_selfie_url', "VARCHAR(255) DEFAULT NULL");

-- -----------------------------------------------------------------------------
-- 2. TABLA: pedidos (Asegurar campos técnicos de asignación de despacho)
-- -----------------------------------------------------------------------------
CALL vixy_safe_add_column('pedidos', 'origen_lat', "DECIMAL(10,8) DEFAULT NULL");
CALL vixy_safe_add_column('pedidos', 'origen_lng', "DECIMAL(11,8) DEFAULT NULL");
CALL vixy_safe_add_column('pedidos', 'destino_lat', "DECIMAL(10,8) DEFAULT NULL");
CALL vixy_safe_add_column('pedidos', 'destino_lng', "DECIMAL(11,8) DEFAULT NULL");
CALL vixy_safe_add_column('pedidos', 'conductor_oferta_id', "VARCHAR(50) DEFAULT NULL");
CALL vixy_safe_add_column('pedidos', 'conductor_ofrecido_id', "VARCHAR(50) DEFAULT NULL");
CALL vixy_safe_add_column('pedidos', 'segundos_restantes_oferta', "INT DEFAULT '15'");
CALL vixy_safe_add_column('pedidos', 'conductores_rechazados', "TEXT DEFAULT NULL");
CALL vixy_safe_add_column('pedidos', 'conductores_rechazaron', "TEXT DEFAULT NULL");
CALL vixy_safe_add_column('pedidos', 'costo_producto_usd', "DECIMAL(10,2) NOT NULL DEFAULT '0.00'");
CALL vixy_safe_add_column('pedidos', 'costo_delivery_usd', "DECIMAL(10,2) NOT NULL DEFAULT '2.00'");
CALL vixy_safe_add_column('pedidos', 'ganancia_conductor_usd', "DECIMAL(10,2) NOT NULL DEFAULT '1.70'");
CALL vixy_safe_add_column('pedidos', 'ganancia_app_usd', "DECIMAL(10,2) NOT NULL DEFAULT '0.30'");
CALL vixy_safe_add_column('pedidos', 'estado_despacho', "ENUM('buscando_conductor','ofrecido_a_conductor','aceptado','en_camino_comercio','en_camino_cliente','completado','sin_conductores_disponibles') NOT NULL DEFAULT 'buscando_conductor'");

-- -----------------------------------------------------------------------------
-- 3. TABLA: conductores (Asegurar campos de telemetría GPS y saldo)
-- -----------------------------------------------------------------------------
CALL vixy_safe_add_column('conductores', 'latitud_actual', "DECIMAL(10,8) DEFAULT '10.49100000'");
CALL vixy_safe_add_column('conductores', 'longitud_actual', "DECIMAL(11,8) DEFAULT '-66.86200000'");
CALL vixy_safe_add_column('conductores', 'saldo_billetera_usd', "DECIMAL(10,2) DEFAULT '0.00'");
CALL vixy_safe_add_column('conductores', 'limite_saldo_negativo', "DECIMAL(10,2) DEFAULT '-0.50'");
CALL vixy_safe_add_column('conductores', 'ultima_actualizacion', "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

-- -----------------------------------------------------------------------------
-- 4. TABLA: detalles_pedido (Campos técnicos de opciones y notas)
-- -----------------------------------------------------------------------------
CALL vixy_safe_add_column('detalles_pedido', 'opciones_seleccionadas_json', "JSON DEFAULT NULL");
CALL vixy_safe_add_column('detalles_pedido', 'cantidad_decimal', "DECIMAL(10,3) DEFAULT NULL");
CALL vixy_safe_add_column('detalles_pedido', 'notas_item', "TEXT DEFAULT NULL");
CALL vixy_safe_add_column('detalles_pedido', 'precio_adicional_usd', "DECIMAL(10,2) NOT NULL DEFAULT '0.00'");

-- Limpieza: Eliminar el procedimiento temporal
DROP PROCEDURE IF EXISTS `vixy_safe_add_column`;

-- -----------------------------------------------------------------------------
-- 5. Sincronizar saldos de los clientes reales
-- -----------------------------------------------------------------------------
UPDATE `clientes` 
SET `saldo_billetera_usd` = `saldo_cartera_usd` 
WHERE (`saldo_billetera_usd` = 0 OR `saldo_billetera_usd` IS NULL) AND `saldo_cartera_usd` > 0;

UPDATE `clientes` 
SET `saldo_cartera_usd` = `saldo_billetera_usd` 
WHERE (`saldo_cartera_usd` = 0 OR `saldo_cartera_usd` IS NULL) AND `saldo_billetera_usd` > 0;

SET FOREIGN_KEY_CHECKS = 1;
