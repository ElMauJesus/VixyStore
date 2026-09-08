-- ==============================================================================
-- SISTEMA VIXY DELIVERY PLATFORM - SCHEMA COMPLETO UNIFICADO (PRODUCCIÓN CPANEL)
-- BASE DE DATOS: MySQL 5.7+ / 8.0+ / MariaDB 10.3+
-- COMPATIBLE CON: phpMyAdmin, cPanel, Web Admin, APK Conductor, APK Comercio, APK Cliente
-- CONDICIÓN: 100% LIMPIA (SIN DEMOS NI REGISTROS SIMULADOS)
-- ÚNICO USUARIO INICIAL: Superusuario Root "vixydely" / Clave: "123456"
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "-04:00"; -- Hora de Venezuela (GMT-4)

-- ------------------------------------------------------------------------------
-- 1. TABLA: usuarios_administracion_web (SUPERUSUARIO & RBAC)
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

-- INSERCIÓN DEL SUPERUSUARIO OFICIAL VIXY
-- Usuario: vixydely  |  Contraseña:  123456
INSERT INTO `usuarios_administracion_web` (
  `id`, `username`, `password_hash`, `nombre`, `email`, `nivel_acceso`, `departamento`, 
  `activo`, `debe_cambiar_clave`, `fecha_ultimo_cambio_clave`, `fecha_vencimiento_clave`, 
  `dias_vigencia_maximo`, `pestanas_permitidas`
) VALUES (
  'usr-root-vixydely',
  'vixydely',
  '123456', -- Soporta validación directa y password_verify en PHP
  'Superusuario Central Vixy',
  'vixydely@vixy.com',
  'super_admin',
  'Dirección General Vixy Express',
  1,
  0,
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 90 DAY),
  90,
  '["dashboard", "recargas", "custodia", "reclamos", "pedidos", "conductores", "comercios", "incidencias", "soporte", "verificaciones", "pagos", "usuarios_web", "logs", "backend"]'
) ON DUPLICATE KEY UPDATE 
  `password_hash` = VALUES(`password_hash`),
  `pestanas_permitidas` = VALUES(`pestanas_permitidas`);

-- ------------------------------------------------------------------------------
-- 2. TABLA: clientes (APP VIXY PEDIDOS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `apellido` varchar(120) NOT NULL,
  `cedula` varchar(30) NOT NULL UNIQUE,
  `email` varchar(120) NOT NULL UNIQUE,
  `telefono` varchar(30) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `direccion_habitual` text,
  `latitud` decimal(10,8) DEFAULT 10.48060000,
  `longitud` decimal(11,8) DEFAULT -66.90360000,
  `avatar_url` varchar(255) DEFAULT '/uploads/clientes/avatar-default.jpg',
  `saldo_cartera_usd` decimal(10,2) DEFAULT 0.00,
  `saldo_cartera_bs` decimal(12,2) DEFAULT 0.00,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLA: categorias_comercio (RUBROS DEL SISTEMA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias_comercio` (
  `id` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL UNIQUE,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `icono` varchar(50) NOT NULL,
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categorias_comercio` (`id`, `slug`, `nombre`, `descripcion`, `icono`, `orden`) VALUES
('cat-1', 'hogar', 'Hogar & Decoración', 'Muebles, sábanas, vajillas y artículos para el hogar', 'home', 1),
('cat-2', 'ferreteria', 'Ferretería & Construcción', 'Herramientas, tornillería, plomería y electricidad', 'wrench', 2),
('cat-3', 'restaurantes', 'Restaurantes & Gastronomía', 'Comida gourmet, platos ejecutivos y especialidades', 'utensils', 3),
('cat-4', 'comida_rapida', 'Comida Rápida', 'Hamburguesas, pizzas, pollo frito y sushi', 'zap', 4),
('cat-5', 'supermercados', 'Supermercados & Víveres', 'Víveres, charcutería, carnes y bebidas', 'shopping-cart', 5),
('cat-6', 'farmacias', 'Farmacias & Salud', 'Medicamentos, vitaminas y cuidado personal', 'heart', 6)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- ------------------------------------------------------------------------------
-- 4. TABLA: comercios (APP VIXY STORE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comercios` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `rif` varchar(30) NOT NULL UNIQUE,
  `categoria_principal` varchar(50) NOT NULL DEFAULT 'restaurantes',
  `logo_url` varchar(255) DEFAULT '/uploads/comercios/logos/default.jpg',
  `portada_url` varchar(255) DEFAULT '/uploads/comercios/portadas/default.jpg',
  `direccion` text NOT NULL,
  `latitud` decimal(10,8) NOT NULL DEFAULT 10.48801100,
  `longitud` decimal(11,8) NOT NULL DEFAULT -66.85334100,
  `telefono` varchar(30) NOT NULL,
  `email` varchar(120) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `hora_apertura` time NOT NULL DEFAULT '08:00:00',
  `hora_cierre` time NOT NULL DEFAULT '22:00:00',
  `activo` tinyint(1) DEFAULT 1,
  `abierto_manual` tinyint(1) DEFAULT 1,
  `tiempo_estimado_min` int(11) DEFAULT 20,
  `tiempo_estimado_max` int(11) DEFAULT 40,
  `calificacion` decimal(3,2) DEFAULT 5.00,
  `total_calificaciones` int(11) DEFAULT 0,
  `saldo_billetera_usd` decimal(12,2) DEFAULT 0.00,
  `saldo_billetera_bs` decimal(14,2) DEFAULT 0.00,
  `total_ventas_usd` decimal(14,2) DEFAULT 0.00,
  `pago_movil_banco` varchar(50) DEFAULT NULL,
  `pago_movil_telefono` varchar(30) DEFAULT NULL,
  `pago_movil_cedula` varchar(30) DEFAULT NULL,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLA: productos (INVENTARIO DE COMERCIOS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `productos` (
  `id` varchar(50) NOT NULL,
  `comercio_id` varchar(50) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `precio_usd` decimal(10,2) NOT NULL,
  `precio_bs` decimal(12,2) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT '/uploads/productos/default.jpg',
  `disponible` tinyint(1) DEFAULT 1,
  `stock` int(11) DEFAULT 50,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_prod_comercio` (`comercio_id`),
  CONSTRAINT `fk_prod_comercio_rel` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLA: conductores (APP VIXY DELIVERY - MOTORIZADOS)
-- POLÍTICA: Saldo límite negativo -$0.50 USD
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conductores` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(30) NOT NULL UNIQUE,
  `telefono` varchar(30) NOT NULL UNIQUE,
  `email` varchar(120) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `foto_url` varchar(255) DEFAULT '/uploads/conductores/default.jpg',
  `disponible` tinyint(1) DEFAULT 1,
  `en_carrera` tinyint(1) DEFAULT 0,
  `latitud_actual` decimal(10,8) NOT NULL DEFAULT 10.49100000,
  `longitud_actual` decimal(11,8) NOT NULL DEFAULT -66.86200000,
  `placa_moto` varchar(20) NOT NULL,
  `marca_moto` varchar(50) NOT NULL,
  `modelo_moto` varchar(50) NOT NULL,
  `ano_moto` varchar(10) NOT NULL,
  `color_moto` varchar(30) DEFAULT 'Negro',
  `licencia_grado` varchar(10) DEFAULT '2',
  `saldo_billetera_usd` decimal(10,2) DEFAULT 0.00,
  `limite_saldo_negativo` decimal(10,2) DEFAULT -0.50,
  `bloqueado_por_saldo` tinyint(1) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 5.00,
  `total_carreras` int(11) DEFAULT 0,
  `verificado_por_admin` tinyint(1) DEFAULT 1,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABLA: pedidos (ÓRDENES CENTRALES DEL SISTEMA)
-- CICLO: 60s comercio | 15s conductor | Reasignación automática a más cercano
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` varchar(50) NOT NULL,
  `codigo_seguimiento` varchar(50) NOT NULL UNIQUE,
  `cliente_id` varchar(50) NOT NULL,
  `comercio_id` varchar(50) NOT NULL,
  `conductor_id` varchar(50) DEFAULT NULL,
  `conductor_ofrecido_id` varchar(50) DEFAULT NULL,
  `tiempo_restante_comercio` int(11) DEFAULT 60,
  `tiempo_restante_conductor` int(11) DEFAULT 15,
  `conductores_rechazaron` json DEFAULT NULL,
  `estado` enum(
    'solicitud_enviada',
    'pago_verificado',
    'en_preparacion',
    'esperando_repartidor',
    'en_camino_al_comercio',
    'en_camino_al_cliente',
    'entregado',
    'cerrado_calificado',
    'cancelado'
  ) NOT NULL DEFAULT 'solicitud_enviada',
  `monto_subtotal_usd` decimal(10,2) NOT NULL,
  `costo_envio_usd` decimal(10,2) NOT NULL DEFAULT 2.00,
  `tasa_bcv_bs` decimal(10,4) NOT NULL DEFAULT 48.5000,
  `monto_total_usd` decimal(10,2) NOT NULL,
  `monto_total_bs` decimal(12,2) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL DEFAULT 'pago_movil',
  `referencia_pago` varchar(100) DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `foto_entrega_url` varchar(255) DEFAULT NULL,
  `origen_direccion` text,
  `destino_direccion` text NOT NULL,
  `distancia_km` decimal(6,2) DEFAULT 2.50,
  `es_pedido_tienda` tinyint(1) DEFAULT 0,
  `notas_cliente` text,
  `entregado_en` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ped_cliente` (`cliente_id`),
  KEY `fk_ped_comercio` (`comercio_id`),
  KEY `fk_ped_conductor` (`conductor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABLA: detalles_pedido (PRODUCTOS DENTRO DEL PEDIDO)
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
  KEY `fk_det_pedido` (`pedido_id`),
  CONSTRAINT `fk_det_pedido_rel` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. TABLA: entregas_carreras (DESPACHO Y CÁLCULO DE TARIFAS DE CONDUCTOR)
-- REGLA: $2.00 USD hasta 3 km. Adicional: +$0.50 por cada km excedente.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `entregas_carreras` (
  `id` varchar(50) NOT NULL,
  `pedido_id` varchar(50) NOT NULL UNIQUE,
  `conductor_id` varchar(50) NOT NULL,
  `distancia_total_km` decimal(6,2) NOT NULL DEFAULT 2.00,
  `distancia_excedente_km` decimal(6,2) NOT NULL DEFAULT 0.00,
  `tarifa_base_usd` decimal(10,2) NOT NULL DEFAULT 2.00,
  `tarifa_adicional_usd` decimal(10,2) NOT NULL DEFAULT 0.00,
  `costo_envio_total_usd` decimal(10,2) NOT NULL DEFAULT 2.00,
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
-- 10. TABLA: recargas_billetera (PAGO MÓVIL / BINANCE PAY PARA RECARGAS)
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
-- 11. TABLA: transacciones_billetera (LIBRO MAYOR DE SALDOS)
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
-- 12. TABLA: reclamos_incidencias (SOPORTE Y DISPUTAS)
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
-- 13. TABLA: configuracion_sistema (VALORES DINÁMICOS CENTRALES)
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
('comision_plataforma_porcentaje', '15.00', 'Porcentaje de comisión administrativa sobre el envío'),
('tiempo_aceptar_comercio_segundos', '60', 'Segundos reglamentarios para que el comercio acepte'),
('tiempo_aceptar_conductor_segundos', '15', 'Segundos reglamentarios para que el conductor acepte')
ON DUPLICATE KEY UPDATE `valor` = VALUES(`valor`);

-- ------------------------------------------------------------------------------
-- 14. TABLA: auditoria_logs (TRAZA DE OPERACIONES ADMINISTRATIVAS)
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

SET FOREIGN_KEY_CHECKS = 1;
