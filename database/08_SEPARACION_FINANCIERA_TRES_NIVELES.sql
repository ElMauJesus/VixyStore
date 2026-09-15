DELIMITER $$

DROP TRIGGER IF EXISTS trg_pedido_distribucion_tres_niveles$$

CREATE TRIGGER trg_pedido_distribucion_tres_niveles
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
  DECLARE v_pct_comercio DECIMAL(5,2) DEFAULT 0.00;
  DECLARE v_pct_delivery DECIMAL(5,2) DEFAULT 5.00;
  DECLARE v_com_comercio DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_com_delivery DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_neto_comercio DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_neto_conductor DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_conductor_antiguedad_meses INT DEFAULT 0;
  DECLARE v_comercio_antiguedad_dias INT DEFAULT 0;
  DECLARE v_pct_conductor_3m DECIMAL(5,2) DEFAULT 5.00;
  DECLARE v_pct_conductor_10m DECIMAL(5,2) DEFAULT 10.00;
  DECLARE v_pct_comercio_1a DECIMAL(5,2) DEFAULT 0.00;
  DECLARE v_pct_comercio_3a DECIMAL(5,2) DEFAULT 3.00;
  DECLARE v_saldo_com_ant DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_saldo_com_nuevo DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_saldo_cond_ant DECIMAL(10,2) DEFAULT 0.00;
  DECLARE v_saldo_cond_nuevo DECIMAL(10,2) DEFAULT 0.00;

  IF NEW.estado = 'entregado' AND OLD.estado <> 'entregado' THEN

    SELECT
      COALESCE(MAX(CASE WHEN clave = 'porcentaje_comision_comercio' THEN CAST(valor AS DECIMAL(5,2)) END), 0.00),
      COALESCE(MAX(CASE WHEN clave = 'porcentaje_comision_delivery' THEN CAST(valor AS DECIMAL(5,2)) END), 5.00),
      COALESCE(MAX(CASE WHEN clave = 'comision_comercio_despues_primer_ano' THEN CAST(valor AS DECIMAL(5,2)) END), 3.00),
      COALESCE(MAX(CASE WHEN clave = 'comision_conductor_despues_3_meses' THEN CAST(valor AS DECIMAL(5,2)) END), 10.00)
    INTO v_pct_comercio_1a, v_pct_conductor_3m, v_pct_comercio_3a, v_pct_conductor_10m
    FROM configuracion_sistema
    WHERE clave IN (
      'porcentaje_comision_comercio',
      'porcentaje_comision_delivery',
      'comision_comercio_despues_primer_ano',
      'comision_conductor_despues_3_meses'
    );

    IF NEW.conductor_id IS NOT NULL THEN
      SELECT TIMESTAMPDIFF(MONTH, creado_en, NOW())
      INTO v_conductor_antiguedad_meses
      FROM conductores
      WHERE id = NEW.conductor_id;
    END IF;

    SELECT TIMESTAMPDIFF(DAY, creado_en, NOW())
    INTO v_comercio_antiguedad_dias
    FROM comercios
    WHERE id = NEW.comercio_id;

    IF v_conductor_antiguedad_meses >= 3 THEN
      SET v_pct_delivery = v_pct_conductor_10m;
    ELSE
      SET v_pct_delivery = v_pct_conductor_3m;
    END IF;

    IF v_comercio_antiguedad_dias >= 365 THEN
      SET v_pct_comercio = v_pct_comercio_3a;
    ELSE
      SET v_pct_comercio = v_pct_comercio_1a;
    END IF;

    SET v_com_comercio = ROUND(COALESCE(NEW.monto_subtotal_usd, 0) * v_pct_comercio / 100, 2);
    SET v_com_delivery = ROUND(COALESCE(NEW.costo_envio_usd, 0) * v_pct_delivery / 100, 2);
    SET v_neto_comercio = COALESCE(NEW.monto_subtotal_usd, 0) - v_com_comercio;
    SET v_neto_conductor = COALESCE(NEW.costo_envio_usd, 0) - v_com_delivery;

    -- COMERCIO
    SELECT saldo_billetera_usd INTO v_saldo_com_ant FROM comercios WHERE id = NEW.comercio_id;
    SET v_saldo_com_nuevo = v_saldo_com_ant + v_neto_comercio;

    UPDATE comercios
    SET saldo_billetera_usd = v_saldo_com_nuevo,
        total_ventas_usd = total_ventas_usd + COALESCE(NEW.monto_subtotal_usd, 0)
    WHERE id = NEW.comercio_id;

    INSERT INTO transacciones_billetera
      (id, usuario_id, tipo_usuario, tipo_movimiento, concepto, monto_usd,
       saldo_anterior_usd, saldo_nuevo_usd, referencia_id)
    VALUES (
      CONCAT('trx-com-', NEW.id),
      NEW.comercio_id,
      'comercio',
      'ingreso',
      CONCAT('Pago por pedido ', NEW.codigo_seguimiento, ' (comisión ', v_pct_comercio, '%)'),
      v_neto_comercio,
      v_saldo_com_ant,
      v_saldo_com_nuevo,
      NEW.id
    );

    -- CONDUCTOR
    IF NEW.conductor_id IS NOT NULL THEN
      SELECT saldo_billetera_usd INTO v_saldo_cond_ant FROM conductores WHERE id = NEW.conductor_id;
      SET v_saldo_cond_nuevo = v_saldo_cond_ant + v_neto_conductor;

      UPDATE conductores
      SET saldo_billetera_usd = v_saldo_cond_nuevo,
          total_carreras = total_carreras + 1
      WHERE id = NEW.conductor_id;

      INSERT INTO transacciones_billetera
        (id, usuario_id, tipo_usuario, tipo_movimiento, concepto, monto_usd,
         saldo_anterior_usd, saldo_nuevo_usd, referencia_id)
      VALUES (
        CONCAT('trx-cond-', NEW.id),
        NEW.conductor_id,
        'conductor',
        'ingreso',
        CONCAT('Pago por servicio ', NEW.codigo_seguimiento, ' (comisión ', v_pct_delivery, '%)'),
        v_neto_conductor,
        v_saldo_cond_ant,
        v_saldo_cond_nuevo,
        NEW.id
      );
    END IF;

  END IF;
END$$

DELIMITER ;