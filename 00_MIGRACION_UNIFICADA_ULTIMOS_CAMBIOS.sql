-- VIXY DELIVERY - MIGRACION UNIFICADA NO DESTRUCTIVA
-- Base operativa: c2861522_vixy_dl
-- Ejecutar una sola vez en phpMyAdmin.
-- No elimina tablas ni registros existentes.

USE c2861522_vixy_dl;

DELIMITER $$

DROP PROCEDURE IF EXISTS vixy_agregar_columna_si_falta$$
CREATE PROCEDURE vixy_agregar_columna_si_falta(
  IN p_tabla VARCHAR(64),
  IN p_columna VARCHAR(64),
  IN p_definicion TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_tabla
      AND COLUMN_NAME = p_columna
  ) THEN
    SET @vixy_sql = CONCAT('ALTER TABLE `', p_tabla, '` ADD COLUMN `', p_columna, '` ', p_definicion);
    PREPARE vixy_stmt FROM @vixy_sql;
    EXECUTE vixy_stmt;
    DEALLOCATE PREPARE vixy_stmt;
  END IF;
END$$

CALL vixy_agregar_columna_si_falta('conductores', 'codigo_conductor', 'VARCHAR(50) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'licencia_vencimiento', 'DATE NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'foto_url', "VARCHAR(255) NULL DEFAULT '/uploads/conductores/default.jpg'")$$
CALL vixy_agregar_columna_si_falta('conductores', 'disponible', 'TINYINT(1) NOT NULL DEFAULT 0')$$
CALL vixy_agregar_columna_si_falta('conductores', 'en_carrera', 'TINYINT(1) NOT NULL DEFAULT 0')$$
CALL vixy_agregar_columna_si_falta('conductores', 'latitud_actual', 'DECIMAL(10,8) NULL DEFAULT 10.49100000')$$
CALL vixy_agregar_columna_si_falta('conductores', 'longitud_actual', 'DECIMAL(11,8) NULL DEFAULT -66.86200000')$$
CALL vixy_agregar_columna_si_falta('conductores', 'saldo_billetera_usd', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00')$$
CALL vixy_agregar_columna_si_falta('conductores', 'limite_saldo_negativo', 'DECIMAL(10,2) NOT NULL DEFAULT -0.50')$$
CALL vixy_agregar_columna_si_falta('conductores', 'bloqueado_por_saldo', 'TINYINT(1) NOT NULL DEFAULT 0')$$
CALL vixy_agregar_columna_si_falta('conductores', 'rating', 'DECIMAL(3,2) NOT NULL DEFAULT 5.00')$$
CALL vixy_agregar_columna_si_falta('conductores', 'total_carreras', 'INT NOT NULL DEFAULT 0')$$
CALL vixy_agregar_columna_si_falta('conductores', 'placa_moto', 'VARCHAR(20) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'marca_moto', 'VARCHAR(50) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'modelo_moto', 'VARCHAR(50) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'ano_moto', 'VARCHAR(10) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'color_moto', "VARCHAR(30) NULL DEFAULT 'No especificado'")$$
CALL vixy_agregar_columna_si_falta('conductores', 'licencia_grado', "VARCHAR(10) NULL DEFAULT '2'")$$
CALL vixy_agregar_columna_si_falta('conductores', 'estado_registro', "ENUM('aprobado','pendiente_aprobacion','rechazado') NOT NULL DEFAULT 'pendiente_aprobacion'")$$
CALL vixy_agregar_columna_si_falta('conductores', 'foto_cedula_url', 'VARCHAR(255) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'foto_licencia_url', 'VARCHAR(255) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'foto_certificado_medico_url', 'VARCHAR(255) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'foto_carnet_circulacion_url', 'VARCHAR(255) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'foto_vehiculo_url', 'VARCHAR(255) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'foto_placa_url', 'VARCHAR(255) NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'motivo_rechazo', 'TEXT NULL')$$
CALL vixy_agregar_columna_si_falta('conductores', 'terminos_aceptados', 'TINYINT(1) NOT NULL DEFAULT 0')$$
CALL vixy_agregar_columna_si_falta('conductores', 'verificado_por_admin', 'TINYINT(1) NOT NULL DEFAULT 0')$$
CALL vixy_agregar_columna_si_falta('conductores', 'actualizado_en', 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')$$

UPDATE conductores
SET disponible = COALESCE(disponible, 0),
    en_carrera = COALESCE(en_carrera, 0),
    saldo_billetera_usd = COALESCE(saldo_billetera_usd, 0),
    limite_saldo_negativo = COALESCE(limite_saldo_negativo, -0.50),
    bloqueado_por_saldo = COALESCE(bloqueado_por_saldo, 0),
    rating = COALESCE(rating, 5.00),
    total_carreras = COALESCE(total_carreras, 0),
    estado_registro = CASE
      WHEN COALESCE(verificado_por_admin, 0) = 1 THEN 'aprobado'
      WHEN estado_registro IS NULL OR estado_registro = '' THEN 'pendiente_aprobacion'
      ELSE estado_registro
    END$$

DROP PROCEDURE IF EXISTS vixy_agregar_columna_si_falta$$

CREATE TABLE IF NOT EXISTS sesiones_usuario (
  id CHAR(36) NOT NULL,
  usuario_id VARCHAR(50) NOT NULL,
  tipo_usuario VARCHAR(30) NOT NULL,
  token_jti_hash CHAR(64) NOT NULL,
  expira_en DATETIME NOT NULL,
  revocado_en DATETIME NULL DEFAULT NULL,
  dispositivo VARCHAR(255) NULL,
  ip_origen VARCHAR(45) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_uso_en TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sesiones_token_jti_hash (token_jti_hash),
  KEY idx_sesiones_usuario (usuario_id, tipo_usuario),
  KEY idx_sesiones_expira (expira_en),
  KEY idx_sesiones_revocada (revocado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- La tabla de productos ya pertenece al esquema operativo. Estas columnas son
-- las que usa la APK Comercio y la app Pedidos para el catálogo compartido.
CREATE TABLE IF NOT EXISTS productos (
  id VARCHAR(50) NOT NULL,
  comercio_id VARCHAR(50) NOT NULL,
  categoria VARCHAR(50) NOT NULL DEFAULT 'General',
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  precio_usd DECIMAL(10,2) NOT NULL,
  precio_bs DECIMAL(12,2) NULL,
  imagen_url VARCHAR(255) NULL DEFAULT '/api/uploads/productos/default.jpg',
  disponible TINYINT(1) NOT NULL DEFAULT 1,
  stock INT NOT NULL DEFAULT 50,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_productos_comercio (comercio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Limpieza opcional de sesiones expiradas.
DELETE FROM sesiones_usuario WHERE expira_en < NOW() OR revocado_en IS NOT NULL;

DELIMITER ;

SELECT 'Migracion Vixy completada sin eliminar datos.' AS resultado;
