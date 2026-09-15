-- VIXY DELIVERY - SEPARACION FINANCIERA EN TRES NIVELES
-- Migracion no destructiva. Seleccione primero la base c2861522_vixy_dl
-- en phpMyAdmin y luego importe este archivo completo.
-- Congela por pedido: neto comercio + neto conductor + ingreso Vixy = total cobrado.
-- Compatible con MySQL 5.7+, MySQL 8.0+ y MariaDB 10.3+.

CREATE TABLE IF NOT EXISTS distribuciones_pedido (
  id VARCHAR(60) NOT NULL,
  pedido_id VARCHAR(50) NOT NULL,
  codigo_seguimiento VARCHAR(50) NOT NULL,
  cliente_id VARCHAR(50) NOT NULL,
  comercio_id VARCHAR(50) NOT NULL,
  conductor_id VARCHAR(50) DEFAULT NULL,
  subtotal_productos_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tarifa_delivery_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_cobrado_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  porcentaje_comercio DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  comision_comercio_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  neto_comercio_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  porcentaje_delivery DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  comision_delivery_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  neto_conductor_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ingreso_vixy_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tasa_bcv DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  total_cobrado_bs DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  estado ENUM('custodia','distribuido','reversado') NOT NULL DEFAULT 'custodia',
  fecha_pago DATETIME DEFAULT NULL,
  fecha_distribucion DATETIME DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_distribucion_pedido (pedido_id),
  KEY idx_distribucion_comercio (comercio_id, estado),
  KEY idx_distribucion_conductor (conductor_id, estado),
  KEY idx_distribucion_fecha (fecha_distribucion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS movimientos_wallet (
  id VARCHAR(60) NOT NULL,
  pedido_id VARCHAR(50) DEFAULT NULL,
  usuario_id VARCHAR(50) NOT NULL,
  tipo_usuario ENUM('conductor','comercio','cliente','plataforma') NOT NULL,
  tipo_movimiento ENUM('acreditacion_pedido','comision_plataforma','recarga','liquidacion','reembolso','ajuste') NOT NULL,
  monto_bruto_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  comision_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  monto_neto_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tasa_bcv DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  monto_neto_bs DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  referencia_id VARCHAR(100) DEFAULT NULL,
  descripcion VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_wallet_usuario_fecha (tipo_usuario, usuario_id, creado_en),
  KEY idx_wallet_pedido (pedido_id),
  KEY idx_wallet_movimiento_fecha (tipo_movimiento, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recupera pedidos entregados anteriormente. Esta carga solo crea el desglose;
-- no vuelve a acreditar movimientos ni modifica saldos existentes.
INSERT IGNORE INTO distribuciones_pedido (
  id, pedido_id, codigo_seguimiento, cliente_id, comercio_id, conductor_id,
  subtotal_productos_usd, tarifa_delivery_usd, total_cobrado_usd,
  porcentaje_comercio, comision_comercio_usd, neto_comercio_usd,
  porcentaje_delivery, comision_delivery_usd, neto_conductor_usd,
  ingreso_vixy_usd, tasa_bcv, total_cobrado_bs, estado, fecha_pago, fecha_distribucion
)
SELECT
  CONCAT('dist-', p.id), p.id, p.codigo_seguimiento, p.cliente_id, p.comercio_id, p.conductor_id,
  p.monto_subtotal_usd, p.costo_envio_usd, p.monto_total_usd,
  0.00,
  0.00,
  p.monto_subtotal_usd,
  15.00,
  ROUND(p.costo_envio_usd * 15.00 / 100, 2),
  p.costo_envio_usd - ROUND(p.costo_envio_usd * 15.00 / 100, 2),
  ROUND(p.costo_envio_usd * 15.00 / 100, 2),
  p.tasa_bcv_bs, p.monto_total_bs, 'distribuido', COALESCE(p.entregado_en, NOW()), COALESCE(p.entregado_en, NOW())
FROM pedidos p
WHERE p.estado IN ('entregado', 'cerrado_calificado');

-- Si el libro mayor anterior ya tenia importes, estos prevalecen sobre los
-- valores de respaldo anteriores y conservan la historia realmente acreditada.
UPDATE distribuciones_pedido d
INNER JOIN movimientos_wallet m
  ON m.pedido_id = d.pedido_id
  AND m.tipo_usuario = 'comercio'
  AND m.tipo_movimiento = 'acreditacion_pedido'
SET d.porcentaje_comercio = CASE
      WHEN d.subtotal_productos_usd > 0 THEN ROUND(m.comision_usd * 100 / d.subtotal_productos_usd, 2)
      ELSE 0.00
    END,
    d.comision_comercio_usd = m.comision_usd,
    d.neto_comercio_usd = m.monto_neto_usd;

UPDATE distribuciones_pedido d
INNER JOIN movimientos_wallet m
  ON m.pedido_id = d.pedido_id
  AND m.tipo_usuario = 'conductor'
  AND m.tipo_movimiento = 'acreditacion_pedido'
SET d.porcentaje_delivery = CASE
      WHEN d.tarifa_delivery_usd > 0 THEN ROUND(m.comision_usd * 100 / d.tarifa_delivery_usd, 2)
      ELSE 0.00
    END,
    d.comision_delivery_usd = m.comision_usd,
    d.neto_conductor_usd = m.monto_neto_usd;

UPDATE distribuciones_pedido d
LEFT JOIN movimientos_wallet m
  ON m.pedido_id = d.pedido_id
  AND m.tipo_usuario = 'plataforma'
  AND m.tipo_movimiento = 'comision_plataforma'
SET d.ingreso_vixy_usd = COALESCE(m.monto_neto_usd, d.comision_comercio_usd + d.comision_delivery_usd)
WHERE d.estado = 'distribuido';

DELIMITER $$

DROP TRIGGER IF EXISTS trg_pedido_entregado_libro_mayor$$
DROP TRIGGER IF EXISTS trg_pedido_entregado_acreditar_wallet$$
DROP TRIGGER IF EXISTS trg_pedido_distribucion_tres_niveles$$

CREATE TRIGGER trg_pedido_distribucion_tres_niveles
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
  DECLARE v_pct_comercio DECIMAL(5,2) DEFAULT 0.00;
  DECLARE v_pct_delivery DECIMAL(5,2) DEFAULT 15.00;
  DECLARE v_com_comercio DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_com_delivery DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_neto_comercio DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_neto_conductor DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_tasa DECIMAL(10,4) DEFAULT 0.0000;

  IF NEW.estado = 'pago_verificado' AND OLD.estado <> 'pago_verificado' THEN
    SELECT
      COALESCE(MAX(CASE WHEN clave = 'porcentaje_comision_comercio' THEN CAST(valor AS DECIMAL(5,2)) END), 0.00),
      COALESCE(MAX(CASE WHEN clave = 'porcentaje_comision_delivery' THEN CAST(valor AS DECIMAL(5,2)) END), 15.00)
    INTO v_pct_comercio, v_pct_delivery
    FROM configuracion_sistema
    WHERE clave IN ('porcentaje_comision_comercio', 'porcentaje_comision_delivery');

    SET v_tasa = COALESCE(NEW.tasa_bcv_bs, 0.0000);
    SET v_com_comercio = ROUND(COALESCE(NEW.monto_subtotal_usd, 0) * v_pct_comercio / 100, 2);
    SET v_com_delivery = ROUND(COALESCE(NEW.costo_envio_usd, 0) * v_pct_delivery / 100, 2);
    SET v_neto_comercio = COALESCE(NEW.monto_subtotal_usd, 0) - v_com_comercio;
    SET v_neto_conductor = COALESCE(NEW.costo_envio_usd, 0) - v_com_delivery;

    INSERT INTO distribuciones_pedido (
      id, pedido_id, codigo_seguimiento, cliente_id, comercio_id, conductor_id,
      subtotal_productos_usd, tarifa_delivery_usd, total_cobrado_usd,
      porcentaje_comercio, comision_comercio_usd, neto_comercio_usd,
      porcentaje_delivery, comision_delivery_usd, neto_conductor_usd,
      ingreso_vixy_usd, tasa_bcv, total_cobrado_bs, estado, fecha_pago
    ) VALUES (
      CONCAT('dist-', NEW.id), NEW.id, NEW.codigo_seguimiento, NEW.cliente_id, NEW.comercio_id, NEW.conductor_id,
      NEW.monto_subtotal_usd, NEW.costo_envio_usd, NEW.monto_total_usd,
      v_pct_comercio, v_com_comercio, v_neto_comercio,
      v_pct_delivery, v_com_delivery, v_neto_conductor,
      v_com_comercio + v_com_delivery, v_tasa, NEW.monto_total_bs, 'custodia', NOW()
    ) ON DUPLICATE KEY UPDATE pedido_id = NEW.id;
  END IF;

  IF NEW.estado = 'entregado' AND OLD.estado <> 'entregado' THEN
    SELECT
      COALESCE(MAX(CASE WHEN clave = 'porcentaje_comision_comercio' THEN CAST(valor AS DECIMAL(5,2)) END), 0.00),
      COALESCE(MAX(CASE WHEN clave = 'porcentaje_comision_delivery' THEN CAST(valor AS DECIMAL(5,2)) END), 15.00)
    INTO v_pct_comercio, v_pct_delivery
    FROM configuracion_sistema
    WHERE clave IN ('porcentaje_comision_comercio', 'porcentaje_comision_delivery');

    INSERT INTO distribuciones_pedido (
      id, pedido_id, codigo_seguimiento, cliente_id, comercio_id, conductor_id,
      subtotal_productos_usd, tarifa_delivery_usd, total_cobrado_usd,
      porcentaje_comercio, porcentaje_delivery, tasa_bcv, total_cobrado_bs, estado, fecha_pago
    ) VALUES (
      CONCAT('dist-', NEW.id), NEW.id, NEW.codigo_seguimiento, NEW.cliente_id, NEW.comercio_id, NEW.conductor_id,
      NEW.monto_subtotal_usd, NEW.costo_envio_usd, NEW.monto_total_usd,
      v_pct_comercio, v_pct_delivery, NEW.tasa_bcv_bs, NEW.monto_total_bs, 'custodia', NOW()
    ) ON DUPLICATE KEY UPDATE conductor_id = NEW.conductor_id;

    UPDATE distribuciones_pedido
    SET conductor_id = NEW.conductor_id,
        comision_comercio_usd = ROUND(subtotal_productos_usd * porcentaje_comercio / 100, 2),
        neto_comercio_usd = subtotal_productos_usd - ROUND(subtotal_productos_usd * porcentaje_comercio / 100, 2),
        comision_delivery_usd = ROUND(tarifa_delivery_usd * porcentaje_delivery / 100, 2),
        neto_conductor_usd = tarifa_delivery_usd - ROUND(tarifa_delivery_usd * porcentaje_delivery / 100, 2),
        ingreso_vixy_usd = ROUND(subtotal_productos_usd * porcentaje_comercio / 100, 2) + ROUND(tarifa_delivery_usd * porcentaje_delivery / 100, 2),
        estado = 'distribuido', fecha_distribucion = NOW()
    WHERE pedido_id = NEW.id;

    INSERT IGNORE INTO movimientos_wallet
      (id, pedido_id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion)
    SELECT CONCAT('mw-com-', pedido_id), pedido_id, comercio_id, 'comercio', 'acreditacion_pedido', subtotal_productos_usd, comision_comercio_usd, neto_comercio_usd, tasa_bcv, ROUND(neto_comercio_usd * tasa_bcv, 2), codigo_seguimiento, 'Neto del comercio por pedido entregado'
    FROM distribuciones_pedido WHERE pedido_id = NEW.id;

    IF NEW.conductor_id IS NOT NULL THEN
      INSERT IGNORE INTO movimientos_wallet
        (id, pedido_id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion)
      SELECT CONCAT('mw-cond-', pedido_id), pedido_id, conductor_id, 'conductor', 'acreditacion_pedido', tarifa_delivery_usd, comision_delivery_usd, neto_conductor_usd, tasa_bcv, ROUND(neto_conductor_usd * tasa_bcv, 2), codigo_seguimiento, 'Neto del conductor por servicio completado'
      FROM distribuciones_pedido WHERE pedido_id = NEW.id;
    END IF;

    INSERT IGNORE INTO movimientos_wallet
      (id, pedido_id, usuario_id, tipo_usuario, tipo_movimiento, monto_bruto_usd, comision_usd, monto_neto_usd, tasa_bcv, monto_neto_bs, referencia_id, descripcion)
    SELECT CONCAT('mw-vixy-', pedido_id), pedido_id, 'vixy-plataforma', 'plataforma', 'comision_plataforma', total_cobrado_usd, ingreso_vixy_usd, ingreso_vixy_usd, tasa_bcv, ROUND(ingreso_vixy_usd * tasa_bcv, 2), codigo_seguimiento, 'Ingreso definitivo Vixy: comisión comercio más comisión delivery'
    FROM distribuciones_pedido WHERE pedido_id = NEW.id;
  END IF;
END$$

DELIMITER ;

-- Control: toda distribucion debe conciliar exactamente con el total pagado.
DROP VIEW IF EXISTS vista_conciliacion_pedidos;
CREATE VIEW vista_conciliacion_pedidos AS
SELECT d.*,
  ROUND(d.neto_comercio_usd + d.neto_conductor_usd + d.ingreso_vixy_usd, 2) AS total_distribuido_usd,
  ROUND(d.total_cobrado_usd - (d.neto_comercio_usd + d.neto_conductor_usd + d.ingreso_vixy_usd), 2) AS diferencia_usd
FROM distribuciones_pedido d;
