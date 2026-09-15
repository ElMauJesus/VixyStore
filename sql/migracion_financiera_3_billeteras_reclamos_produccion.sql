-- ============================================================================
-- VIXY DELIVERY - MIGRACION FINANCIERA DE PRODUCCION
-- 3 billeteras: comercio, delivery y admin
-- Comisiones por antiguedad, liquidaciones, reclamos financieros y auditoria
-- Base objetivo: c2861522_vixy_dl
-- Compatible con MySQL 5.7+/8.0+ y MariaDB 10.3+
--
-- Esta migracion es incremental y no elimina datos existentes.
-- Ejecutar una sola vez en phpMyAdmin sobre c2861522_vixy_dl.
-- ============================================================================

USE `c2861522_vixy_dl`;

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 1. Configuracion de comisiones y parametros financieros
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuracion_sistema` (
  `clave` varchar(60) NOT NULL,
  `valor` text NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion_sistema` (`clave`, `valor`, `descripcion`) VALUES
('porcentaje_comision_comercio', '0.00', 'Comercio: 0% durante los meses 1 a 12'),
('porcentaje_comision_delivery', '5.00', 'Delivery: 5% durante los meses 1 a 3'),
('comision_comercio_despues_primer_ano', '3.00', 'Comercio: 3% desde el mes 13'),
('comision_conductor_despues_3_meses', '10.00', 'Delivery: 10% desde el mes 4 y durante diciembre'),
('carteras_habilitadas_global', '1', 'Habilita el motor financiero de billeteras'),
('tasa_bcv', '48.50', 'Tasa BCV usada para registrar el equivalente en bolivares')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`);

-- ---------------------------------------------------------------------------
-- 2. Procedimiento auxiliar para agregar columnas sin destruir instalaciones
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `vixy_fin_add_column`;
DELIMITER $$
CREATE PROCEDURE `vixy_fin_add_column`(
  IN p_table varchar(64),
  IN p_column varchar(64),
  IN p_definition text
)
BEGIN
  IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table
  ) AND NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column
  ) THEN
    SET @vixy_fin_sql = CONCAT(
      'ALTER TABLE `', REPLACE(p_table, '`', ''),
      '` ADD COLUMN `', REPLACE(p_column, '`', ''), '` ', p_definition
    );
    PREPARE vixy_fin_stmt FROM @vixy_fin_sql;
    EXECUTE vixy_fin_stmt;
    DEALLOCATE PREPARE vixy_fin_stmt;
  END IF;
END$$
DELIMITER ;

-- Campos que el backend y los reclamos financieros necesitan.
CALL `vixy_fin_add_column`('solicitudes_liquidacion', 'monto_pagado_usd', 'decimal(12,2) DEFAULT NULL');
CALL `vixy_fin_add_column`('solicitudes_liquidacion', 'movimiento_wallet_id', 'varchar(60) DEFAULT NULL');
CALL `vixy_fin_add_column`('solicitudes_liquidacion', 'liquidacion_financiera_id', 'varchar(60) DEFAULT NULL');
CALL `vixy_fin_add_column`('reclamos_incidencias', 'cliente_id', 'varchar(50) DEFAULT NULL');
CALL `vixy_fin_add_column`('reclamos_incidencias', 'comercio_id', 'varchar(50) DEFAULT NULL');
CALL `vixy_fin_add_column`('reclamos_incidencias', 'conductor_id', 'varchar(50) DEFAULT NULL');
CALL `vixy_fin_add_column`('reclamos_incidencias', 'resolucion_admin', 'text DEFAULT NULL');
CALL `vixy_fin_add_column`('reclamos_incidencias', 'resuelto_por', 'varchar(50) DEFAULT NULL');
CALL `vixy_fin_add_column`('reclamos_incidencias', 'monto_reclamado_usd', 'decimal(12,2) DEFAULT 0.00');
CALL `vixy_fin_add_column`('reclamos_incidencias', 'monto_resuelto_usd', 'decimal(12,2) DEFAULT 0.00');

-- ---------------------------------------------------------------------------
-- 3. Billetera canonica de comercio, delivery y admin
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `billeteras_financieras` (
  `id` varchar(80) NOT NULL,
  `tipo_usuario` enum('admin','comercio','conductor') NOT NULL,
  `usuario_id` varchar(50) NOT NULL,
  `saldo_usd` decimal(14,2) NOT NULL DEFAULT 0.00,
  `saldo_bs` decimal(16,2) NOT NULL DEFAULT 0.00,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_billetera_entidad` (`tipo_usuario`, `usuario_id`),
  KEY `idx_billetera_usuario` (`usuario_id`, `tipo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear el admin global y migrar saldos existentes sin sobreescribir cuentas ya usadas.
INSERT INTO `billeteras_financieras` (`id`, `tipo_usuario`, `usuario_id`, `saldo_usd`, `saldo_bs`)
VALUES ('wallet-admin-global', 'admin', 'vixy-plataforma', 0.00, 0.00)
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `billeteras_financieras` (`id`, `tipo_usuario`, `usuario_id`, `saldo_usd`, `saldo_bs`)
SELECT CONCAT('wallet-com-', c.id), 'comercio', c.id,
       COALESCE(c.saldo_billetera_usd, 0.00),
       COALESCE(c.saldo_billetera_bs, 0.00)
FROM `comercios` c
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `billeteras_financieras` (`id`, `tipo_usuario`, `usuario_id`, `saldo_usd`, `saldo_bs`)
SELECT CONCAT('wallet-cond-', d.id), 'conductor', d.id,
       COALESCE(d.saldo_billetera_usd, 0.00),
       ROUND(COALESCE(d.saldo_billetera_usd, 0.00) * COALESCE((
         SELECT CAST(valor AS DECIMAL(10,4)) FROM configuracion_sistema WHERE clave = 'tasa_bcv' LIMIT 1
       ), 48.50), 2)
FROM `conductores` d
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

CREATE TABLE IF NOT EXISTS `movimientos_wallet` (
  `id` varchar(60) NOT NULL,
  `pedido_id` varchar(50) DEFAULT NULL,
  `usuario_id` varchar(50) NOT NULL,
  `tipo_usuario` enum('admin','conductor','comercio','cliente') NOT NULL,
  `tipo_movimiento` enum('acreditacion_pedido','comision_plataforma','recarga','liquidacion','reembolso','ajuste') NOT NULL,
  `monto_bruto_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `comision_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `monto_neto_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tasa_bcv` decimal(10,4) NOT NULL DEFAULT 0.0000,
  `monto_neto_bs` decimal(14,2) NOT NULL DEFAULT 0.00,
  `referencia_id` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_usuario_fecha` (`tipo_usuario`, `usuario_id`, `creado_en`),
  KEY `idx_wallet_pedido` (`pedido_id`),
  KEY `idx_wallet_referencia` (`referencia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Instalaciones anteriores usaban plataforma en vez de admin. Se conservan ambos.
ALTER TABLE `movimientos_wallet`
  MODIFY COLUMN `tipo_usuario` ENUM('admin','conductor','comercio','cliente','plataforma') NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. Distribucion contable por pedido
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `distribuciones_pedido` (
  `id` varchar(60) NOT NULL,
  `pedido_id` varchar(50) NOT NULL,
  `codigo_seguimiento` varchar(50) NOT NULL,
  `cliente_id` varchar(50) NOT NULL,
  `comercio_id` varchar(50) NOT NULL,
  `conductor_id` varchar(50) DEFAULT NULL,
  `subtotal_productos_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tarifa_delivery_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_cobrado_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `porcentaje_comercio` decimal(5,2) NOT NULL DEFAULT 0.00,
  `comision_comercio_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `neto_comercio_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `porcentaje_delivery` decimal(5,2) NOT NULL DEFAULT 5.00,
  `comision_delivery_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `neto_conductor_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `ingreso_vixy_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tasa_bcv` decimal(10,4) NOT NULL DEFAULT 0.0000,
  `total_cobrado_bs` decimal(14,2) NOT NULL DEFAULT 0.00,
  `estado` enum('custodia','distribuido','reversado') NOT NULL DEFAULT 'custodia',
  `fecha_pago` datetime DEFAULT NULL,
  `fecha_distribucion` datetime DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_distribucion_pedido` (`pedido_id`),
  KEY `idx_distribucion_comercio` (`comercio_id`, `estado`),
  KEY `idx_distribucion_conductor` (`conductor_id`, `estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. Liquidaciones y reclamos financieros
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `solicitudes_liquidacion` (
  `id` varchar(60) NOT NULL,
  `usuario_id` varchar(50) NOT NULL,
  `tipo_usuario` enum('comercio','conductor') NOT NULL,
  `monto_solicitado_usd` decimal(12,2) NOT NULL,
  `monto_solicitado_bs` decimal(14,2) NOT NULL,
  `tasa_bcv_aplicada` decimal(10,4) NOT NULL,
  `metodo_pago` enum('transferencia','pago_movil') NOT NULL,
  `banco_destino` varchar(100) DEFAULT NULL,
  `cuenta_telefono_destino` varchar(100) DEFAULT NULL,
  `titular_destino` varchar(150) DEFAULT NULL,
  `cedula_rif_destino` varchar(30) DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada','pagada','expirada') NOT NULL DEFAULT 'pendiente',
  `motivo_rechazo` text DEFAULT NULL,
  `revisado_por` varchar(50) DEFAULT NULL,
  `revisado_en` timestamp NULL DEFAULT NULL,
  `pagado_en` timestamp NULL DEFAULT NULL,
  `referencia_bancaria` varchar(100) DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `monto_pagado_usd` decimal(12,2) DEFAULT NULL,
  `movimiento_wallet_id` varchar(60) DEFAULT NULL,
  `liquidacion_financiera_id` varchar(60) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_liquidacion_usuario_estado` (`usuario_id`, `tipo_usuario`, `estado`),
  KEY `idx_liquidacion_estado_fecha` (`estado`, `creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reclamos_evidencias` (
  `id` varchar(60) NOT NULL,
  `reclamo_id` varchar(50) NOT NULL,
  `imagen_url` varchar(255) NOT NULL,
  `descripcion_evidencia` varchar(255) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_evidencia_reclamo` (`reclamo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reclamos_incidencias` (
  `id` varchar(60) NOT NULL,
  `pedido_id` varchar(50) DEFAULT NULL,
  `cliente_id` varchar(50) DEFAULT NULL,
  `comercio_id` varchar(50) DEFAULT NULL,
  `conductor_id` varchar(50) DEFAULT NULL,
  `motivo` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `estado` varchar(40) NOT NULL DEFAULT 'abierto',
  `resolucion_admin` text DEFAULT NULL,
  `resuelto_por` varchar(50) DEFAULT NULL,
  `monto_reclamado_usd` decimal(12,2) DEFAULT 0.00,
  `monto_resuelto_usd` decimal(12,2) DEFAULT 0.00,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reclamo_pedido` (`pedido_id`),
  KEY `idx_reclamo_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reclamos_financieros` (
  `id` varchar(60) NOT NULL,
  `reclamo_id` varchar(50) DEFAULT NULL,
  `pedido_id` varchar(50) DEFAULT NULL,
  `liquidacion_id` varchar(60) DEFAULT NULL,
  `tipo_usuario` enum('comercio','conductor') NOT NULL,
  `usuario_id` varchar(50) NOT NULL,
  `tipo_reclamo` enum('saldo_no_acreditado','liquidacion_no_pagada','pago_no_recibido','comision_incorrecta','reembolso','otro') NOT NULL,
  `monto_reclamado_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `monto_resuelto_usd` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` enum('abierto','en_revision','aprobado','rechazado','resuelto','desestimado') NOT NULL DEFAULT 'abierto',
  `descripcion` text NOT NULL,
  `resolucion` text DEFAULT NULL,
  `atendido_por` varchar(50) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reclamo_fin_usuario` (`tipo_usuario`, `usuario_id`, `estado`),
  KEY `idx_reclamo_fin_liquidacion` (`liquidacion_id`, `estado`),
  KEY `idx_reclamo_fin_pedido` (`pedido_id`, `estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. Trigger: distribucion unica al finalizar un pedido
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_pedido_distribucion_tres_niveles`;
DROP TRIGGER IF EXISTS `trg_pedido_entregado_acreditar_wallet`;
DROP TRIGGER IF EXISTS `trg_pedido_entregado_libro_mayor`;
DROP TRIGGER IF EXISTS `trg_vixy_fin_pedido_entregado`;
DELIMITER $$
CREATE TRIGGER `trg_vixy_fin_pedido_entregado`
AFTER UPDATE ON `pedidos`
FOR EACH ROW
BEGIN
  DECLARE v_tasa DECIMAL(10,4) DEFAULT 48.5000;
  DECLARE v_pct_com DECIMAL(5,2) DEFAULT 0.00;
  DECLARE v_pct_drv DECIMAL(5,2) DEFAULT 5.00;
  DECLARE v_comercio_meses INT DEFAULT 0;
  DECLARE v_conductor_meses INT DEFAULT 0;
  DECLARE v_venta DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_flete DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_com_com DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_com_drv DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_neto_com DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_neto_drv DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_fecha DATETIME;

  IF NEW.estado = 'entregado' AND OLD.estado <> 'entregado' THEN
    SET v_fecha = COALESCE(NEW.entregado_en, NOW());

    SELECT COALESCE(MAX(CASE WHEN clave = 'tasa_bcv' THEN CAST(valor AS DECIMAL(10,4)) END), 48.5000),
           COALESCE(MAX(CASE WHEN clave = 'comision_comercio_despues_primer_ano' THEN CAST(valor AS DECIMAL(5,2)) END), 3.00),
           COALESCE(MAX(CASE WHEN clave = 'comision_conductor_despues_3_meses' THEN CAST(valor AS DECIMAL(5,2)) END), 10.00)
    INTO v_tasa, v_pct_com, v_pct_drv
    FROM configuracion_sistema;

    SELECT COALESCE(TIMESTAMPDIFF(MONTH, creado_en, v_fecha), 0)
      INTO v_comercio_meses FROM comercios WHERE id = NEW.comercio_id LIMIT 1;
    SELECT COALESCE(TIMESTAMPDIFF(MONTH, creado_en, v_fecha), 0)
      INTO v_conductor_meses FROM conductores WHERE id = NEW.conductor_id LIMIT 1;

    IF v_comercio_meses < 12 THEN SET v_pct_com = 0.00; END IF;
    IF v_conductor_meses < 3 THEN SET v_pct_drv = 5.00; ELSE SET v_pct_drv = 10.00; END IF;
    IF MONTH(v_fecha) = 12 THEN SET v_pct_drv = 10.00; END IF;

    SET v_venta = ROUND(COALESCE(NEW.monto_subtotal_usd, 0.00), 2);
    SET v_flete = ROUND(COALESCE(NEW.costo_envio_usd, 0.00), 2);
    SET v_com_com = ROUND(v_venta * v_pct_com / 100, 2);
    SET v_com_drv = ROUND(v_flete * v_pct_drv / 100, 2);
    SET v_neto_com = ROUND(v_venta - v_com_com, 2);
    SET v_neto_drv = ROUND(v_flete - v_com_drv, 2);

    -- El movimiento admin funciona como llave idempotente del pedido.
    IF NOT EXISTS (SELECT 1 FROM movimientos_wallet WHERE id = CONCAT('mw-admin-', NEW.id)) THEN
    INSERT INTO distribuciones_pedido (
      id, pedido_id, codigo_seguimiento, cliente_id, comercio_id, conductor_id,
      subtotal_productos_usd, tarifa_delivery_usd, total_cobrado_usd,
      porcentaje_comercio, comision_comercio_usd, neto_comercio_usd,
      porcentaje_delivery, comision_delivery_usd, neto_conductor_usd,
      ingreso_vixy_usd, tasa_bcv, total_cobrado_bs, estado, fecha_pago, fecha_distribucion
    ) VALUES (
      CONCAT('dist-', NEW.id), NEW.id, COALESCE(NEW.codigo_seguimiento, NEW.id), NEW.cliente_id, NEW.comercio_id, NEW.conductor_id,
      v_venta, v_flete, COALESCE(NEW.monto_total_usd, v_venta + v_flete),
      v_pct_com, v_com_com, v_neto_com,
      v_pct_drv, v_com_drv, v_neto_drv,
      v_com_com + v_com_drv, v_tasa, ROUND(COALESCE(NEW.monto_total_usd, v_venta + v_flete) * v_tasa, 2),
      'distribuido', NOW(), NOW()
    ) ON DUPLICATE KEY UPDATE
      `estado` = VALUES(`estado`), `conductor_id` = VALUES(`conductor_id`),
      `fecha_distribucion` = VALUES(`fecha_distribucion`);

    INSERT IGNORE INTO billeteras_financieras (id, tipo_usuario, usuario_id) VALUES
      (CONCAT('wallet-com-', NEW.comercio_id), 'comercio', NEW.comercio_id),
      ('wallet-admin-global', 'admin', 'vixy-plataforma');
    IF NEW.conductor_id IS NOT NULL THEN
      INSERT IGNORE INTO billeteras_financieras (id, tipo_usuario, usuario_id)
      VALUES (CONCAT('wallet-cond-', NEW.conductor_id), 'conductor', NEW.conductor_id);
    END IF;

    INSERT IGNORE INTO movimientos_wallet
      (id, pedido_id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion)
    VALUES
      (CONCAT('mw-com-', NEW.id), NEW.id, NEW.comercio_id, 'comercio', 'acreditacion_pedido', v_venta, v_com_com, v_neto_com, v_tasa, ROUND(v_neto_com * v_tasa, 2), NEW.codigo_seguimiento, 'Neto de venta acreditado al comercio'),
      (CONCAT('mw-admin-', NEW.id), NEW.id, 'vixy-plataforma', 'admin', 'comision_plataforma', v_com_com + v_com_drv, 0, v_com_com + v_com_drv, v_tasa, ROUND((v_com_com + v_com_drv) * v_tasa, 2), NEW.codigo_seguimiento, 'Comisiones de comercio y delivery para admin');

    IF NEW.conductor_id IS NOT NULL THEN
      INSERT IGNORE INTO movimientos_wallet
        (id, pedido_id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion)
      VALUES
        (CONCAT('mw-cond-', NEW.id), NEW.id, NEW.conductor_id, 'conductor', 'acreditacion_pedido', v_flete, v_com_drv, v_neto_drv, v_tasa, ROUND(v_neto_drv * v_tasa, 2), NEW.codigo_seguimiento, 'Neto de servicio acreditado al delivery');
    END IF;

    UPDATE billeteras_financieras SET saldo_usd = saldo_usd + v_neto_com, saldo_bs = saldo_bs + ROUND(v_neto_com * v_tasa, 2) WHERE tipo_usuario = 'comercio' AND usuario_id = NEW.comercio_id;
    UPDATE billeteras_financieras SET saldo_usd = saldo_usd + v_com_com + v_com_drv, saldo_bs = saldo_bs + ROUND((v_com_com + v_com_drv) * v_tasa, 2) WHERE tipo_usuario = 'admin' AND usuario_id = 'vixy-plataforma';
    IF NEW.conductor_id IS NOT NULL THEN
      UPDATE billeteras_financieras SET saldo_usd = saldo_usd + v_neto_drv, saldo_bs = saldo_bs + ROUND(v_neto_drv * v_tasa, 2) WHERE tipo_usuario = 'conductor' AND usuario_id = NEW.conductor_id;
      UPDATE conductores SET saldo_billetera_usd = saldo_billetera_usd + v_neto_drv WHERE id = NEW.conductor_id;
    END IF;
    UPDATE comercios SET saldo_billetera_usd = saldo_billetera_usd + v_neto_com, saldo_billetera_bs = saldo_billetera_bs + ROUND(v_neto_com * v_tasa, 2) WHERE id = NEW.comercio_id;
    END IF;
  END IF;
END$$
DELIMITER ;

-- ---------------------------------------------------------------------------
-- 7. Trigger: pago efectivo de una liquidacion descuenta una sola vez
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_vixy_fin_liquidacion_pagada`;
DELIMITER $$
CREATE TRIGGER `trg_vixy_fin_liquidacion_pagada`
AFTER UPDATE ON `solicitudes_liquidacion`
FOR EACH ROW
BEGIN
  DECLARE v_saldo DECIMAL(14,2) DEFAULT 0.00;
  DECLARE v_monto DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_tasa DECIMAL(10,4) DEFAULT 48.5000;
  DECLARE v_wallet_tipo varchar(20);

  IF NEW.estado = 'pagada' AND OLD.estado <> 'pagada' THEN
    SET v_wallet_tipo = NEW.tipo_usuario;
    SET v_monto = ROUND(COALESCE(NEW.monto_pagado_usd, NEW.monto_solicitado_usd), 2);
    SELECT saldo_usd INTO v_saldo FROM billeteras_financieras
      WHERE tipo_usuario = v_wallet_tipo AND usuario_id = NEW.usuario_id;
    IF v_saldo IS NULL OR v_monto <= 0 OR v_monto > v_saldo THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente para marcar la liquidacion como pagada';
    END IF;
    SELECT COALESCE(CAST(valor AS DECIMAL(10,4)), 48.5000) INTO v_tasa FROM configuracion_sistema WHERE clave = 'tasa_bcv' LIMIT 1;
    INSERT IGNORE INTO movimientos_wallet
      (id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion)
    VALUES
      (CONCAT('mw-liq-', NEW.id), NEW.usuario_id, v_wallet_tipo, 'liquidacion', 0, -v_monto, v_tasa, -ROUND(v_monto * v_tasa, 2), NEW.id, 'Desembolso de liquidacion pagada');
    UPDATE billeteras_financieras SET saldo_usd = saldo_usd - v_monto, saldo_bs = saldo_bs - ROUND(v_monto * v_tasa, 2) WHERE tipo_usuario = v_wallet_tipo AND usuario_id = NEW.usuario_id;
    IF v_wallet_tipo = 'conductor' THEN UPDATE conductores SET saldo_billetera_usd = saldo_billetera_usd - v_monto WHERE id = NEW.usuario_id; END IF;
    IF v_wallet_tipo = 'comercio' THEN UPDATE comercios SET saldo_billetera_usd = saldo_billetera_usd - v_monto, saldo_billetera_bs = saldo_billetera_bs - ROUND(v_monto * v_tasa, 2) WHERE id = NEW.usuario_id; END IF;
  END IF;
END$$
DELIMITER ;

-- ---------------------------------------------------------------------------
-- 8. Reclamos financieros: saldo, comision, liquidacion y pagos no recibidos
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vista_reclamos_financieros_pendientes` AS
SELECT rf.*, r.estado AS estado_reclamo_general, r.motivo AS motivo_general
FROM reclamos_financieros rf
LEFT JOIN reclamos_incidencias r ON r.id = rf.reclamo_id
WHERE rf.estado IN ('abierto', 'en_revision', 'aprobado');

CREATE OR REPLACE VIEW `vista_saldos_billeteras` AS
SELECT tipo_usuario, usuario_id, saldo_usd, saldo_bs, actualizado_en
FROM billeteras_financieras;

-- ---------------------------------------------------------------------------
-- 9. Limpieza
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `vixy_fin_add_column`;
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Migracion financiera completada: 3 billeteras, comisiones, liquidaciones y reclamos financieros.' AS resultado;
