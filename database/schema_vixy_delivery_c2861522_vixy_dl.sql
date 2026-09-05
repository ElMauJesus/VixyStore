-- ==============================================================================
-- SISTEMA VIXY DELIVERY PLATFORM - SCHEMA MAESTRO UNIFICADO (PRODUCCIÓN CPANEL)
-- Base de Datos de Destino: c2861522_vixy_dl
-- Motor: MySQL 5.7+ / 8.0+ / MariaDB 10.3+
--
-- INSTRUCCIONES PARA phpMyAdmin:
-- 1. Entra a cPanel -> phpMyAdmin.
-- 2. Selecciona la base de datos `c2861522_vixy_dl` en el menú izquierdo.
-- 3. Ve a la pestaña "SQL" arriba.
-- 4. Pega TODO este archivo y haz clic en "Continuar" (Go).
-- 
-- Incluye TODO: Tablas base, despacho inteligente 15s, telemetría GPS en vivo,
-- métodos de pago, conciliación financiera de pedidos y superusuario 'vixydely'.
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "-04:00"; -- Hora legal de Venezuela (GMT-4)

-- ------------------------------------------------------------------------------
-- 1. TABLA: usuarios_administracion_web (SUPERUSUARIO & RBAC MODERNO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios_administracion_web` (
  `id` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL UNIQUE,
  `nivel_acceso` enum('super_admin','operador','finanzas','soporte','auditor') NOT NULL DEFAULT 'operador',
  `departamento` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `debe_cambiar_clave` tinyint(1) DEFAULT 0,
  `fecha_ultimo_cambio_clave` date DEFAULT NULL,
  `fecha_vencimiento_clave` date DEFAULT NULL,
  `dias_vigencia_maximo` int(11) DEFAULT 90,
  `pestanas_permitidas` json NOT NULL,
  `avatar_url` varchar(255) DEFAULT '/uploads/admin/avatares/default.jpg',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Credenciales: vixydely / 123456
INSERT INTO `usuarios_administracion_web` (
  `id`, `username`, `password_hash`, `nombre`, `email`, `nivel_acceso`, `departamento`, 
  `activo`, `debe_cambiar_clave`, `fecha_ultimo_cambio_clave`, `fecha_vencimiento_clave`, 
  `dias_vigencia_maximo`, `pestanas_permitidas`
) VALUES (
  'usr-root-vixydely',
  'vixydely',
  '123456',
  'Superusuario Central Vixy',
  'vixydely@vixy.com',
  'super_admin',
  'Dirección General Vixy Express',
  1,
  0,
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 90 DAY),
  90,
  '["dashboard", "mapa_conductores", "mapa_flota", "recargas", "custodia", "reclamos", "pedidos", "conductores", "comercios", "incidencias", "soporte", "verificaciones", "pagos", "usuarios_web", "logs", "backend"]'
) ON DUPLICATE KEY UPDATE 
  `password_hash` = VALUES(`password_hash`),
  `pestanas_permitidas` = VALUES(`pestanas_permitidas`);

-- ------------------------------------------------------------------------------
-- 2. TABLA: usuarios_admin (TABLA DE RESPALDO ADMINISTRATIVO)
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
-- 3. TABLA: clientes (APP DELIVERY CLIENTE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `apellido` varchar(120) DEFAULT '',
  `cedula` varchar(30) DEFAULT NULL,
  `email` varchar(120) NOT NULL UNIQUE,
  `telefono` varchar(30) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `direccion_habitual` text,
  `latitud` decimal(10,8) DEFAULT 10.48060000,
  `longitud` decimal(11,8) DEFAULT -66.90360000,
  `saldo_billetera_usd` decimal(10,2) DEFAULT 0.00,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLA: categorias_comercio
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias_comercio` (
  `id` varchar(50) NOT NULL,
  `codigo` varchar(50) NOT NULL UNIQUE,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `icono` varchar(50) DEFAULT 'store',
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categorias_comercio` (`id`, `codigo`, `nombre`, `descripcion`, `icono`, `orden`) VALUES
('cat-1', 'hogar', 'Hogar', 'Muebles, cocina, decoración y lencería', 'home', 1),
('cat-2', 'ferreteria', 'Ferretería', 'Materiales, herramientas eléctricas y manuales', 'wrench', 2),
('cat-3', 'restaurantes', 'Restaurantes', 'Almuerzos, comida gourmet y ejecutiva', 'utensils', 3),
('cat-4', 'comida_rapida', 'Comida Rápida', 'Hamburguesas, pizzas, pollo frito y sushi', 'zap', 4),
('cat-5', 'supermercados', 'Supermercados', 'Víveres, charcutería, carnes y bebidas', 'shopping-cart', 5)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- ------------------------------------------------------------------------------
-- 5. TABLA: comercios (APP COMERCIO / STORE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comercios` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `rif` varchar(30) NOT NULL UNIQUE,
  `categoria_principal` enum('hogar','ferreteria','restaurantes','comida_rapida','supermercados') NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `portada_url` varchar(255) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `direccion` text NOT NULL,
  `latitud` decimal(10,8) NOT NULL DEFAULT 10.48801100,
  `longitud` decimal(11,8) NOT NULL DEFAULT -66.85334100,
  `telefono` varchar(30) NOT NULL,
  `email` varchar(120) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL DEFAULT '123456',
  `hora_apertura` time NOT NULL DEFAULT '08:00:00',
  `hora_cierre` time NOT NULL DEFAULT '22:00:00',
  `activo` tinyint(1) DEFAULT 1,
  `abierto_manual` tinyint(1) DEFAULT 1,
  `tiempo_estimado_min` int(11) DEFAULT 20,
  `tiempo_estimado_max` int(11) DEFAULT 40,
  `calificacion` decimal(3,2) DEFAULT 4.90,
  `total_calificaciones` int(11) DEFAULT 120,
  `saldo_billetera_usd` decimal(12,2) DEFAULT 0.00,
  `saldo_billetera_bs` decimal(14,2) DEFAULT 0.00,
  `total_ventas_usd` decimal(14,2) DEFAULT 0.00,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLA: productos (INVENTARIO DE COMERCIOS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `productos` (
  `id` varchar(50) NOT NULL,
  `comercio_id` varchar(50) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `precio_usd` decimal(10,2) NOT NULL,
  `precio_bs` decimal(12,2) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  `stock` int(11) DEFAULT 50,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_prod_comercio` (`comercio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABLA: conductores (MOTORIZADOS VIXY & TELEMETRÍA GPS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conductores` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(30) NOT NULL UNIQUE,
  `telefono` varchar(30) NOT NULL UNIQUE,
  `email` varchar(120) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL DEFAULT '123456',
  `foto_url` varchar(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  `disponible` tinyint(1) DEFAULT 1,
  `en_carrera` tinyint(1) DEFAULT 0,
  `latitud_actual` decimal(10,8) NOT NULL DEFAULT 10.49100000,
  `longitud_actual` decimal(11,8) NOT NULL DEFAULT -66.86200000,
  `placa_moto` varchar(20) NOT NULL,
  `marca_moto` varchar(50) NOT NULL,
  `modelo_moto` varchar(50) NOT NULL,
  `ano_moto` varchar(10) NOT NULL,
  `licencia_grado` varchar(10) DEFAULT '2',
  `saldo_billetera_usd` decimal(10,2) DEFAULT 0.00,
  `limite_saldo_negativo` decimal(10,2) DEFAULT -0.50,
  `bloqueado_por_saldo` tinyint(1) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 5.00,
  `total_carreras` int(11) DEFAULT 0,
  `ultima_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cercania_gps` (`disponible`, `bloqueado_por_saldo`, `latitud_actual`, `longitud_actual`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABLA: pedidos (ÓRDENES CON DESPACHO 15s Y DESGLOSE FINANCIERO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` varchar(50) NOT NULL,
  `codigo_seguimiento` varchar(50) NOT NULL UNIQUE,
  `cliente_id` varchar(50) NOT NULL,
  `comercio_id` varchar(50) NOT NULL,
  `conductor_id` varchar(50) DEFAULT NULL,
  `estado` enum(
    'solicitud_enviada',
    'pago_verificado',
    'en_preparacion',
    'esperando_repartidor',
    'en_camino_al_cliente',
    'entregado',
    'cerrado_calificado',
    'cancelado'
  ) NOT NULL DEFAULT 'solicitud_enviada',
  `monto_subtotal_usd` decimal(10,2) NOT NULL,
  `costo_producto_usd` decimal(10,2) NOT NULL DEFAULT 0.00,
  `costo_envio_usd` decimal(10,2) NOT NULL DEFAULT 2.00,
  `costo_delivery_usd` decimal(10,2) NOT NULL DEFAULT 2.00,
  `ganancia_conductor_usd` decimal(10,2) NOT NULL DEFAULT 1.70,
  `ganancia_app_usd` decimal(10,2) NOT NULL DEFAULT 0.30,
  `tasa_bcv_bs` decimal(10,4) NOT NULL DEFAULT 48.5000,
  `monto_total_usd` decimal(10,2) NOT NULL,
  `monto_total_bs` decimal(12,2) NOT NULL,
  `conductor_oferta_id` varchar(50) DEFAULT NULL,
  `tiempo_inicio_oferta` timestamp NULL DEFAULT NULL,
  `tiempo_limite_oferta` timestamp NULL DEFAULT NULL,
  `segundos_restantes_oferta` int(11) DEFAULT 15,
  `conductores_rechazados` text DEFAULT NULL,
  `estado_despacho` enum(
    'buscando_conductor',
    'ofrecido_a_conductor',
    'aceptado',
    'en_camino_comercio',
    'en_camino_cliente',
    'completado',
    'sin_conductores_disponibles'
  ) NOT NULL DEFAULT 'buscando_conductor',
  `comision_descontada` tinyint(1) DEFAULT 0,
  `detalles_liquidacion` json DEFAULT NULL,
  `metodo_pago` varchar(50) NOT NULL DEFAULT 'pago_movil',
  `referencia_pago` varchar(100) DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `origen_lat` decimal(10,8) DEFAULT NULL,
  `origen_lng` decimal(11,8) DEFAULT NULL,
  `origen_direccion` text,
  `destino_lat` decimal(10,8) DEFAULT NULL,
  `destino_lng` decimal(11,8) DEFAULT NULL,
  `destino_direccion` text NOT NULL,
  `distancia_km` decimal(6,2) DEFAULT 2.50,
  `entregado_en` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ped_cliente` (`cliente_id`),
  KEY `fk_ped_comercio` (`comercio_id`),
  KEY `fk_ped_conductor` (`conductor_id`),
  KEY `idx_despacho_oferta` (`conductor_oferta_id`, `estado_despacho`),
  KEY `idx_oferta_timer` (`conductor_oferta_id`, `estado_despacho`, `tiempo_limite_oferta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. TABLA: detalles_pedido (PRODUCTOS DENTRO DEL PEDIDO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `detalles_pedido` (
  `id` varchar(50) NOT NULL,
  `pedido_id` varchar(50) NOT NULL,
  `producto_id` varchar(50) NOT NULL,
  `nombre_producto` varchar(150) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario_usd` decimal(10,2) NOT NULL,
  `subtotal_usd` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_det_pedido` (`pedido_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. TABLA: entregas_carreras (DESPACHO Y CÁLCULO DE TARIFAS DE CONDUCTOR)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `entregas_carreras` (
  `id` varchar(50) NOT NULL,
  `pedido_id` varchar(50) NOT NULL UNIQUE,
  `conductor_id` varchar(50) NOT NULL,
  `costo_producto_usd` decimal(10,2) NOT NULL DEFAULT 0.00,
  `distancia_total_km` decimal(6,2) NOT NULL DEFAULT 2.00,
  `distancia_excedente_km` decimal(6,2) NOT NULL DEFAULT 0.00,
  `tarifa_base_usd` decimal(10,2) NOT NULL DEFAULT 2.00,
  `tarifa_adicional_usd` decimal(10,2) NOT NULL DEFAULT 0.00,
  `costo_envio_total_usd` decimal(10,2) NOT NULL DEFAULT 2.00,
  `monto_total_servicio_usd` decimal(10,2) NOT NULL DEFAULT 0.00,
  `comision_plataforma_usd` decimal(10,2) NOT NULL DEFAULT 0.30,
  `ganancia_neta_conductor_usd` decimal(10,2) NOT NULL DEFAULT 1.70,
  `estado` enum('asignada','en_camino_retiro','en_comercio','en_ruta_entrega','completada','cancelada') NOT NULL DEFAULT 'asignada',
  `inicio_en` timestamp NULL DEFAULT NULL,
  `completado_en` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ent_conductor` (`conductor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. TABLA: confirmaciones_entrega (EVIDENCIA FOTOGRÁFICA Y FIRMA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `confirmaciones_entrega` (
  `id` varchar(50) NOT NULL,
  `pedido_id` varchar(50) NOT NULL UNIQUE,
  `conductor_id` varchar(50) NOT NULL,
  `foto_entrega_url` varchar(255) DEFAULT NULL,
  `codigo_confirmacion` varchar(20) DEFAULT NULL,
  `firma_digital` text DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `entregado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_conf_pedido` (`pedido_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. TABLA: recargas_billetera (PAGO MÓVIL / BINANCE PAY PARA RECARGAS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `recargas_billetera` (
  `id` varchar(50) NOT NULL,
  `usuario_id` varchar(50) NOT NULL,
  `tipo_usuario` enum('conductor','comercio','cliente') NOT NULL,
  `monto_usd` decimal(10,2) NOT NULL,
  `monto_bs` decimal(12,2) NOT NULL,
  `tasa_bcv` decimal(10,4) NOT NULL,
  `metodo` enum('pago_movil','binance','transferencia') NOT NULL,
  `banco_emisor` varchar(50) DEFAULT NULL,
  `telefono_origen` varchar(30) DEFAULT NULL,
  `referencia` varchar(100) NOT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  `revisado_por` varchar(50) DEFAULT NULL,
  `motivo_rechazo` text,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. TABLA: transacciones_billetera (LIBRO MAYOR DE SALDOS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transacciones_billetera` (
  `id` varchar(50) NOT NULL,
  `usuario_id` varchar(50) NOT NULL,
  `tipo_usuario` enum('conductor','comercio','cliente') NOT NULL,
  `tipo_movimiento` enum('ingreso','egreso') NOT NULL,
  `concepto` varchar(255) NOT NULL,
  `monto_usd` decimal(10,2) NOT NULL,
  `saldo_anterior_usd` decimal(10,2) NOT NULL,
  `saldo_nuevo_usd` decimal(10,2) NOT NULL,
  `referencia_id` varchar(50) DEFAULT NULL,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. TABLA: reclamos_incidencias (SOPORTE Y DISPUTAS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reclamos_incidencias` (
  `id` varchar(50) NOT NULL,
  `codigo_ticket` varchar(50) NOT NULL UNIQUE,
  `pedido_id` varchar(50) NOT NULL,
  `reportado_por_id` varchar(50) NOT NULL,
  `tipo_reportante` enum('cliente','comercio','conductor') NOT NULL,
  `motivo` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `evidencia_url` varchar(255) DEFAULT NULL,
  `estado` enum('abierto','en_revision','resuelto_favor_cliente','resuelto_favor_comercio','desestimado') NOT NULL DEFAULT 'abierto',
  `resolucion` text,
  `reembolso_usd` decimal(10,2) DEFAULT 0.00,
  `atendido_por` varchar(50) DEFAULT NULL,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 15. TABLA: configuracion_sistema (VALORES DINÁMICOS CENTRALES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuracion_sistema` (
  `clave` varchar(50) NOT NULL,
  `valor` text NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion_sistema` (`clave`, `valor`, `descripcion`) VALUES
('tasa_bcv', '48.50', 'Tasa oficial del Banco Central de Venezuela (Bs./USD)'),
('tarifa_base_usd', '2.00', 'Tarifa mínima de despacho en USD hasta 3 km'),
('km_base', '3.0', 'Distancia base en kilómetros incluida en tarifa mínima'),
('precio_km_adicional_usd', '0.50', 'Monto adicional en USD por cada kilómetro adicional'),
('limite_saldo_negativo_conductor_usd', '-0.50', 'Límite máximo de saldo negativo antes de pausar asignación'),
('comision_plataforma_porcentaje', '15.00', 'Porcentaje de comisión administrativa sobre el envío')
ON DUPLICATE KEY UPDATE `valor` = VALUES(`valor`);

-- ------------------------------------------------------------------------------
-- 16. TABLA: telemetria_dispositivos (KEEP-ALIVE GPS Y LATIDOS DE LA APP)
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
-- 17. TABLA: configuracion_metodos_pago
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
-- 18. TABLA: auditoria_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `auditoria_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` varchar(50) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `detalles` text,
  `ip_origen` varchar(45) DEFAULT NULL,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 19. VISTA CONSOLIDADA: `vista_pedidos_desglose_financiero`
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

SELECT 'Base de datos c2861522_vixy_dl inicializada y actualizada con éxito.' AS `resultado`;
