-- ==============================================================================
-- SISTEMA VIXY DELIVERY - MÓDULO DE COMISIONES, PAGO MÓVIL CENTRAL Y CARTERAS SQL
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABLA: datos_pago_movil (Datos Oficiales Fijos Editables desde Panel Web)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `datos_pago_movil` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `banco` varchar(100) NOT NULL DEFAULT '0102 - Banco de Venezuela',
  `telefono` varchar(30) NOT NULL DEFAULT '0412-9876543',
  `cedula_rif` varchar(30) NOT NULL DEFAULT 'J-50123456-7',
  `nombre_titular` varchar(150) NOT NULL DEFAULT 'Vixy Inversiones C.A.',
  `qr_imagen_url` varchar(255) DEFAULT 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAGOMOVIL_0102_04129876543_J501234567',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `instrucciones` text DEFAULT NULL,
  `actualizado_por` varchar(50) DEFAULT 'usr-root-vixydely',
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración inicial de Pago Móvil de la empresa
INSERT INTO `datos_pago_movil` (`id`, `banco`, `telefono`, `cedula_rif`, `nombre_titular`, `qr_imagen_url`, `activo`, `instrucciones`)
VALUES (
  1, 
  '0102 - Banco de Venezuela', 
  '0412-9876543', 
  'J-50123456-7', 
  'Vixy Inversiones C.A.', 
  'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAGOMOVIL_0102_04129876543_J501234567', 
  1, 
  'Por favor transferir el monto exacto en Bolívares e ingresar los dígitos del comprobante.'
)
ON DUPLICATE KEY UPDATE 
  `banco` = VALUES(`banco`),
  `telefono` = VALUES(`telefono`),
  `cedula_rif` = VALUES(`cedula_rif`),
  `nombre_titular` = VALUES(`nombre_titular`);

-- ------------------------------------------------------------------------------
-- 2. TABLA: configuracion_sistema (Parámetros Globales de Comisiones y Carteras)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuracion_sistema` (
  `clave` varchar(60) NOT NULL,
  `valor` text NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parámetros del Modificador de Comisión (Comienza en 0% para Comercios)
INSERT INTO `configuracion_sistema` (`clave`, `valor`, `descripcion`) VALUES
('porcentaje_comision_comercio', '0.00', 'Comisión sobre ventas de catálogo para comercios (inicia en 0%, precios no afectados)'),
('porcentaje_comision_delivery', '15.00', 'Comisión porcentual deducida por cada carrera a repartidores'),
('carteras_habilitadas_global', '1', 'Interruptor maestro de operatividad de carteras (1: activa, 0: pausada)'),
('carteras_clientes_habilitada', '1', 'Permite pagar con saldo de cartera a los clientes de Vixy Pedidos'),
('carteras_comercios_habilitada', '1', 'Permite retiros y movimientos de cartera a tiendas Vixy Store'),
('carteras_repartidores_habilitada', '1', 'Permite recargas y retiros a conductores Vixy Delivery'),
('carteras_mensaje_mantenimiento', 'Módulo de cartera en pausa operativa temporal por mantenimiento.', 'Mensaje mostrado cuando se desactiva cartera'),
('tasa_bcv', '48.50', 'Tasa oficial BCV en Bolívares por Dólar'),
('limite_saldo_negativo_conductor_usd', '-0.50', 'Límite de deuda antes de bloqueo preventivo de conductor')
ON DUPLICATE KEY UPDATE `valor` = VALUES(`valor`);

-- ------------------------------------------------------------------------------
-- 3. TABLA: liquidaciones_comercios (Detalle de Ingresos, Retiros y Comprobantes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `liquidaciones_comercios` (
  `id` varchar(50) NOT NULL,
  `comercio_id` varchar(50) NOT NULL,
  `monto_bruto_usd` decimal(10,2) NOT NULL,
  `porcentaje_comision` decimal(5,2) NOT NULL DEFAULT 0.00,
  `comision_empresa_usd` decimal(10,2) NOT NULL DEFAULT 0.00,
  `monto_neto_usd` decimal(10,2) NOT NULL,
  `monto_neto_bs` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tasa_bcv_aplicada` decimal(10,2) NOT NULL DEFAULT 48.50,
  `metodo_pago` varchar(50) NOT NULL DEFAULT 'pago_movil',
  `referencia_bancaria` varchar(100) NOT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','procesando','pagado','anulado') NOT NULL DEFAULT 'pagado',
  `notas` text DEFAULT NULL,
  `fecha_liquidacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_liq_comercio` (`comercio_id`),
  KEY `idx_liq_fecha` (`fecha_liquidacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLA: liquidaciones_conductores (Detalle Individual de Conductores)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `liquidaciones_conductores` (
  `id` varchar(50) NOT NULL,
  `conductor_id` varchar(50) NOT NULL,
  `monto_bruto_usd` decimal(10,2) NOT NULL,
  `porcentaje_comision` decimal(5,2) NOT NULL DEFAULT 15.00,
  `comision_empresa_usd` decimal(10,2) NOT NULL DEFAULT 0.00,
  `monto_neto_usd` decimal(10,2) NOT NULL,
  `monto_neto_bs` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tasa_bcv_aplicada` decimal(10,2) NOT NULL DEFAULT 48.50,
  `metodo_pago` varchar(50) NOT NULL DEFAULT 'pago_movil',
  `referencia_bancaria` varchar(100) NOT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','procesando','pagado','anulado') NOT NULL DEFAULT 'pagado',
  `notas` text DEFAULT NULL,
  `fecha_liquidacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_liq_cond` (`conductor_id`),
  KEY `idx_liq_cond_fecha` (`fecha_liquidacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLA: comprobantes_pago (Archivo Digital de Comprobantes para Auditoría)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comprobantes_pago` (
  `id` varchar(50) NOT NULL,
  `transaccion_tipo` enum('recarga_cliente','recarga_conductor','liquidacion_comercio','liquidacion_conductor','pago_pedido_pago_movil') NOT NULL,
  `entidad_id` varchar(50) NOT NULL,
  `monto_usd` decimal(10,2) NOT NULL,
  `monto_bs` decimal(12,2) NOT NULL,
  `banco_origen` varchar(100) DEFAULT NULL,
  `banco_destino` varchar(100) DEFAULT NULL,
  `referencia` varchar(100) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `estado` enum('pendiente','verificado','rechazado') NOT NULL DEFAULT 'verificado',
  `verificado_por` varchar(50) DEFAULT 'sistema',
  `fecha_subida` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comp_entidad` (`entidad_id`),
  KEY `idx_comp_ref` (`referencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
