-- =============================================================================
-- VIXY DELIVERY PLATFORM - MOTOR DE ACREDITACIONES DE CUSTODIA Y REPORTES FINANCIEROS
-- Tablas, Vistas de Agrupación Temporal (Día, Semana, Mes) y Triggers de Liquidación
-- Moneda Dual: Montos en $ USD y en Bs calculados con la Tasa Oficial BCV
-- Sincronización continua de ~5 segundos entre aplicaciones móviles y panel web
-- =============================================================================

USE `tudominio_vixydb`;

-- -----------------------------------------------------------------------------
-- 1. TABLA DE ACREDITACIONES DE CUSTODIA EN WALLET
-- Registra cada acreditación instantánea cuando el saldo en custodia se libera
-- a la wallet al entregarse el pedido, aplicando los descuentos de comisión.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `acreditaciones_custodia_wallet` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `pedido_id` VARCHAR(50) NOT NULL,
    `codigo_seguimiento` VARCHAR(20) NOT NULL,
    `comercio_id` VARCHAR(50) NOT NULL,
    `conductor_id` VARCHAR(50) DEFAULT NULL,
    `cliente_id` VARCHAR(50) NOT NULL,
    
    -- Tasa oficial aplicada en el momento del cierre contable
    `tasa_bcv` DECIMAL(10, 4) NOT NULL DEFAULT 48.5000,
    
    -- Totales del Pedido
    `monto_total_usd` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `monto_total_bs` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    
    -- Desglose Conductor / Repartidor (Delivery)
    `flete_bruto_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `flete_bruto_bs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `porcentaje_comision_delivery` DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
    `descuento_delivery_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descuento_delivery_bs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `dinero_enviado_conductor_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `dinero_enviado_conductor_bs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Desglose Comercio (Ventas de Alimentos / Productos)
    `venta_bruta_comercio_usd` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `venta_bruta_comercio_bs` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `porcentaje_comision_comercio` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `descuento_comercio_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descuento_comercio_bs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `dinero_enviado_comercio_usd` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `dinero_enviado_comercio_bs` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    
    -- Ganancias Totales de la Empresa (Plataforma Vixy)
    `ganancia_comercio_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `ganancia_comercio_bs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `ganancia_delivery_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `ganancia_delivery_bs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `ganancia_total_empresa_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `ganancia_total_empresa_bs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Estado de la acreditación en la wallet
    `estado_wallet` ENUM('acreditado', 'retenido_custodia', 'liquidado_banco', 'reversado') NOT NULL DEFAULT 'acreditado',
    `referencia_pago_movil` VARCHAR(50) DEFAULT NULL,
    `fecha_acreditacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_acred_pedido` (`pedido_id`),
    INDEX `idx_acred_comercio` (`comercio_id`),
    INDEX `idx_acred_conductor` (`conductor_id`),
    INDEX `idx_acred_fecha` (`fecha_acreditacion`),
    CONSTRAINT `fk_acred_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. VISTA REPORTE FINANCIERO: POR DÍA
-- Sumatoria de deliverys, ventas, descuentos y ganancias agrupados diariamente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vista_reporte_financiero_dia` AS
SELECT 
    DATE(`fecha_acreditacion`) AS `dia`,
    COUNT(`id`) AS `cantidad_deliverys_realizados`,
    
    -- Deliverys Flete Bruto
    ROUND(SUM(`flete_bruto_usd`), 2) AS `flete_deliverys_bruto_usd`,
    ROUND(SUM(`flete_bruto_bs`), 2) AS `flete_deliverys_bruto_bs`,
    
    -- Descuentos en Delivery
    ROUND(SUM(`descuento_delivery_usd`), 2) AS `descuento_delivery_usd`,
    ROUND(SUM(`descuento_delivery_bs`), 2) AS `descuento_delivery_bs`,
    
    -- Dinero Neto Conductor
    ROUND(SUM(`dinero_enviado_conductor_usd`), 2) AS `dinero_enviado_conductor_usd`,
    ROUND(SUM(`dinero_enviado_conductor_bs`), 2) AS `dinero_enviado_conductor_bs`,
    
    -- Ventas Brutas Comercio
    ROUND(SUM(`venta_bruta_comercio_usd`), 2) AS `ventas_comercios_bruto_usd`,
    ROUND(SUM(`venta_bruta_comercio_bs`), 2) AS `ventas_comercios_bruto_bs`,
    
    -- Descuentos a Comercios
    ROUND(SUM(`descuento_comercio_usd`), 2) AS `descuento_comercio_usd`,
    ROUND(SUM(`descuento_comercio_bs`), 2) AS `descuento_comercio_bs`,
    
    -- Dinero Neto Comercio
    ROUND(SUM(`dinero_enviado_comercio_usd`), 2) AS `dinero_enviado_comercio_usd`,
    ROUND(SUM(`dinero_enviado_comercio_bs`), 2) AS `dinero_enviado_comercio_bs`,
    
    -- Ganancias Empresa
    ROUND(SUM(`ganancia_comercio_usd`), 2) AS `ganancia_comercio_usd`,
    ROUND(SUM(`ganancia_comercio_bs`), 2) AS `ganancia_comercio_bs`,
    ROUND(SUM(`ganancia_delivery_usd`), 2) AS `ganancia_delivery_usd`,
    ROUND(SUM(`ganancia_delivery_bs`), 2) AS `ganancia_delivery_bs`,
    ROUND(SUM(`ganancia_total_empresa_usd`), 2) AS `ganancia_total_empresa_usd`,
    ROUND(SUM(`ganancia_total_empresa_bs`), 2) AS `ganancia_total_empresa_bs`
FROM `acreditaciones_custodia_wallet`
WHERE `estado_wallet` IN ('acreditado', 'liquidado_banco')
GROUP BY DATE(`fecha_acreditacion`)
ORDER BY `dia` DESC;

-- -----------------------------------------------------------------------------
-- 3. VISTA REPORTE FINANCIERO: POR SEMANA
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vista_reporte_financiero_semana` AS
SELECT 
    YEARWEEK(`fecha_acreditacion`, 1) AS `semana_codigo`,
    MIN(DATE(`fecha_acreditacion`)) AS `fecha_inicio_semana`,
    MAX(DATE(`fecha_acreditacion`)) AS `fecha_fin_semana`,
    COUNT(`id`) AS `cantidad_deliverys_realizados`,
    
    ROUND(SUM(`flete_bruto_usd`), 2) AS `flete_deliverys_bruto_usd`,
    ROUND(SUM(`flete_bruto_bs`), 2) AS `flete_deliverys_bruto_bs`,
    ROUND(SUM(`descuento_delivery_usd`), 2) AS `descuento_delivery_usd`,
    ROUND(SUM(`descuento_delivery_bs`), 2) AS `descuento_delivery_bs`,
    ROUND(SUM(`dinero_enviado_conductor_usd`), 2) AS `dinero_enviado_conductor_usd`,
    ROUND(SUM(`dinero_enviado_conductor_bs`), 2) AS `dinero_enviado_conductor_bs`,
    
    ROUND(SUM(`venta_bruta_comercio_usd`), 2) AS `ventas_comercios_bruto_usd`,
    ROUND(SUM(`venta_bruta_comercio_bs`), 2) AS `ventas_comercios_bruto_bs`,
    ROUND(SUM(`descuento_comercio_usd`), 2) AS `descuento_comercio_usd`,
    ROUND(SUM(`descuento_comercio_bs`), 2) AS `descuento_comercio_bs`,
    ROUND(SUM(`dinero_enviado_comercio_usd`), 2) AS `dinero_enviado_comercio_usd`,
    ROUND(SUM(`dinero_enviado_comercio_bs`), 2) AS `dinero_enviado_comercio_bs`,
    
    ROUND(SUM(`ganancia_total_empresa_usd`), 2) AS `ganancia_total_empresa_usd`,
    ROUND(SUM(`ganancia_total_empresa_bs`), 2) AS `ganancia_total_empresa_bs`
FROM `acreditaciones_custodia_wallet`
WHERE `estado_wallet` IN ('acreditado', 'liquidado_banco')
GROUP BY YEARWEEK(`fecha_acreditacion`, 1)
ORDER BY `semana_codigo` DESC;

-- -----------------------------------------------------------------------------
-- 4. VISTA REPORTE FINANCIERO: POR MES
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vista_reporte_financiero_mes` AS
SELECT 
    DATE_FORMAT(`fecha_acreditacion`, '%Y-%m') AS `mes_periodo`,
    COUNT(`id`) AS `cantidad_deliverys_realizados`,
    
    ROUND(SUM(`flete_bruto_usd`), 2) AS `flete_deliverys_bruto_usd`,
    ROUND(SUM(`flete_bruto_bs`), 2) AS `flete_deliverys_bruto_bs`,
    ROUND(SUM(`descuento_delivery_usd`), 2) AS `descuento_delivery_usd`,
    ROUND(SUM(`descuento_delivery_bs`), 2) AS `descuento_delivery_bs`,
    ROUND(SUM(`dinero_enviado_conductor_usd`), 2) AS `dinero_enviado_conductor_usd`,
    ROUND(SUM(`dinero_enviado_conductor_bs`), 2) AS `dinero_enviado_conductor_bs`,
    
    ROUND(SUM(`venta_bruta_comercio_usd`), 2) AS `ventas_comercios_bruto_usd`,
    ROUND(SUM(`venta_bruta_comercio_bs`), 2) AS `ventas_comercios_bruto_bs`,
    ROUND(SUM(`descuento_comercio_usd`), 2) AS `descuento_comercio_usd`,
    ROUND(SUM(`descuento_comercio_bs`), 2) AS `descuento_comercio_bs`,
    ROUND(SUM(`dinero_enviado_comercio_usd`), 2) AS `dinero_enviado_comercio_usd`,
    ROUND(SUM(`dinero_enviado_comercio_bs`), 2) AS `dinero_enviado_comercio_bs`,
    
    ROUND(SUM(`ganancia_total_empresa_usd`), 2) AS `ganancia_total_empresa_usd`,
    ROUND(SUM(`ganancia_total_empresa_bs`), 2) AS `ganancia_total_empresa_bs`
FROM `acreditaciones_custodia_wallet`
WHERE `estado_wallet` IN ('acreditado', 'liquidado_banco')
GROUP BY DATE_FORMAT(`fecha_acreditacion`, '%Y-%m')
ORDER BY `mes_periodo` DESC;

-- -----------------------------------------------------------------------------
-- 5. TRIGGER DE ACREDITACIÓN AUTOMÁTICA AL ENTREGAR PEDIDO
-- Se ejecuta cuando el pedido cambia su estado a 'entregado'.
-- Calcula montos duales ($ y Bs), aplica comisiones configuradas y acredita
-- inmediatamente en la tabla `acreditaciones_custodia_wallet`.
-- -----------------------------------------------------------------------------
DELIMITER $$

DROP TRIGGER IF EXISTS `trg_pedido_entregado_acreditar_wallet`$$

CREATE TRIGGER `trg_pedido_entregado_acreditar_wallet`
AFTER UPDATE ON `pedidos`
FOR EACH ROW
BEGIN
    DECLARE v_tasa_bcv DECIMAL(10, 4);
    DECLARE v_pct_comercio DECIMAL(5, 2);
    DECLARE v_pct_delivery DECIMAL(5, 2);
    
    DECLARE v_flete_usd DECIMAL(10, 2);
    DECLARE v_flete_bs DECIMAL(12, 2);
    DECLARE v_desc_deliv_usd DECIMAL(10, 2);
    DECLARE v_desc_deliv_bs DECIMAL(12, 2);
    DECLARE v_neto_deliv_usd DECIMAL(10, 2);
    DECLARE v_neto_deliv_bs DECIMAL(12, 2);
    
    DECLARE v_venta_usd DECIMAL(12, 2);
    DECLARE v_venta_bs DECIMAL(14, 2);
    DECLARE v_desc_com_usd DECIMAL(10, 2);
    DECLARE v_desc_com_bs DECIMAL(12, 2);
    DECLARE v_neto_com_usd DECIMAL(12, 2);
    DECLARE v_neto_com_bs DECIMAL(14, 2);
    
    DECLARE v_ganancia_total_usd DECIMAL(10, 2);
    DECLARE v_ganancia_total_bs DECIMAL(12, 2);

    -- Solo procesar en la transición exacta a 'entregado'
    IF NEW.estado = 'entregado' AND OLD.estado != 'entregado' THEN
        
        -- Obtener parámetros actuales de configuración
        SELECT CAST(valor AS DECIMAL(10, 4)) INTO v_tasa_bcv 
        FROM `configuracion_sistema` WHERE clave = 'tasa_bcv' LIMIT 1;
        IF v_tasa_bcv IS NULL OR v_tasa_bcv <= 0 THEN SET v_tasa_bcv = 48.5000; END IF;
        
        SELECT CAST(valor AS DECIMAL(5, 2)) INTO v_pct_comercio 
        FROM `configuracion_sistema` WHERE clave = 'porcentaje_comision_comercio' LIMIT 1;
        IF v_pct_comercio IS NULL THEN SET v_pct_comercio = 0.00; END IF;
        
        SELECT CAST(valor AS DECIMAL(5, 2)) INTO v_pct_delivery 
        FROM `configuracion_sistema` WHERE clave = 'porcentaje_comision_delivery' LIMIT 1;
        IF v_pct_delivery IS NULL THEN SET v_pct_delivery = 15.00; END IF;

        -- Cálculos Conductor / Delivery
        SET v_flete_usd = COALESCE(NEW.costo_envio, 0.00);
        SET v_flete_bs = ROUND(v_flete_usd * v_tasa_bcv, 2);
        SET v_desc_deliv_usd = ROUND((v_flete_usd * v_pct_delivery) / 100, 2);
        SET v_desc_deliv_bs = ROUND(v_desc_deliv_usd * v_tasa_bcv, 2);
        SET v_neto_deliv_usd = v_flete_usd - v_desc_deliv_usd;
        SET v_neto_deliv_bs = ROUND(v_neto_deliv_usd * v_tasa_bcv, 2);

        -- Cálculos Comercio / Tienda
        SET v_venta_usd = COALESCE(NEW.subtotal, 0.00);
        SET v_venta_bs = ROUND(v_venta_usd * v_tasa_bcv, 2);
        SET v_desc_com_usd = ROUND((v_venta_usd * v_pct_comercio) / 100, 2);
        SET v_desc_com_bs = ROUND(v_desc_com_usd * v_tasa_bcv, 2);
        SET v_neto_com_usd = v_venta_usd - v_desc_com_usd;
        SET v_neto_com_bs = ROUND(v_neto_com_usd * v_tasa_bcv, 2);

        -- Ganancias de la Empresa
        SET v_ganancia_total_usd = v_desc_deliv_usd + v_desc_com_usd;
        SET v_ganancia_total_bs = ROUND(v_ganancia_total_usd * v_tasa_bcv, 2);

        -- Registrar en la tabla de auditoría contable
        INSERT INTO `acreditaciones_custodia_wallet` (
            `id`, `pedido_id`, `codigo_seguimiento`, `comercio_id`, `conductor_id`, `cliente_id`,
            `tasa_bcv`, `monto_total_usd`, `monto_total_bs`,
            `flete_bruto_usd`, `flete_bruto_bs`, `porcentaje_comision_delivery`,
            `descuento_delivery_usd`, `descuento_delivery_bs`, `dinero_enviado_conductor_usd`, `dinero_enviado_conductor_bs`,
            `venta_bruta_comercio_usd`, `venta_bruta_comercio_bs`, `porcentaje_comision_comercio`,
            `descuento_comercio_usd`, `descuento_comercio_bs`, `dinero_enviado_comercio_usd`, `dinero_enviado_comercio_bs`,
            `ganancia_comercio_usd`, `ganancia_comercio_bs`, `ganancia_delivery_usd`, `ganancia_delivery_bs`,
            `ganancia_total_empresa_usd`, `ganancia_total_empresa_bs`, `estado_wallet`, `fecha_acreditacion`
        ) VALUES (
            CONCAT('ACRED-', UUID_SHORT()),
            NEW.id,
            COALESCE(NEW.codigo_seguimiento, NEW.id),
            NEW.comercio_id,
            NEW.conductor_id,
            NEW.cliente_id,
            v_tasa_bcv,
            NEW.total,
            ROUND(NEW.total * v_tasa_bcv, 2),
            v_flete_usd,
            v_flete_bs,
            v_pct_delivery,
            v_desc_deliv_usd,
            v_desc_deliv_bs,
            v_neto_deliv_usd,
            v_neto_deliv_bs,
            v_venta_usd,
            v_venta_bs,
            v_pct_comercio,
            v_desc_com_usd,
            v_desc_com_bs,
            v_neto_com_usd,
            v_neto_com_bs,
            v_desc_com_usd,
            v_desc_com_bs,
            v_desc_deliv_usd,
            v_desc_deliv_bs,
            v_ganancia_total_usd,
            v_ganancia_total_bs,
            'acreditado',
            NOW()
        );

        -- Actualizar saldo de wallet del conductor (si existe)
        IF NEW.conductor_id IS NOT NULL THEN
            UPDATE `conductores`
            SET `saldo_billetera` = `saldo_billetera` + v_neto_deliv_usd
            WHERE `id` = NEW.conductor_id;
        END IF;

    END IF;
END$$

DELIMITER ;
