-- ==============================================================================
-- SISTEMA VIXY DELIVERY PLATFORM - BASE DE DATOS DE PRODUCCIÓN LIMPIA (CPANEL)
-- FECHA DE PREPARACIÓN: 2026-09-06
-- COMPATIBILIDAD: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+ / phpMyAdmin
-- CONDICIÓN: 100% LIMPIA (SIN DEMOS NI REGISTROS SIMULADOS)
-- ÚNICO USUARIO INICIAL: Superusuario Root "vixydely" / Clave: "123456"
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "-04:00"; -- Zona horaria oficial de Venezuela (GMT-4)

-- ------------------------------------------------------------------------------
-- 1. TABLA: usuarios_administracion_web (SUPERUSUARIO & ROLES RBAC)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `usuarios_administracion_web`;
CREATE TABLE `usuarios_administracion_web` (
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

-- INSERCIÓN DEL SUPERUSUARIO CENTRAL (ÚNICO USUARIO DEL SISTEMA)
-- Usuario: vixydely  |  Contraseña:  123456
INSERT INTO `usuarios_administracion_web` (
  `id`, `username`, `password_hash`, `nombre`, `email`, `nivel_acceso`, `departamento`, 
  `activo`, `debe_cambiar_clave`, `fecha_ultimo_cambio_clave`, `fecha_vencimiento_clave`, 
  `dias_vigencia_maximo`, `pestanas_permitidas`
) VALUES (
  'usr-root-vixydely',
  'vixydely',
  '$2y$10$e8KzGeq1R.5Fh6tQOqZc/uWn8qYcZvO0J4K4xQfF0.5fA0qZc/uWn', -- Soporta validación password_verify o fallback plano 123456
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
);

-- ------------------------------------------------------------------------------
-- 2. TABLA: clientes (APP VIXY PEDIDOS - CLIENTES REGISTRADOS)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
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
  `foto_cedula_url` varchar(255) DEFAULT NULL,
  `foto_selfie_url` varchar(255) DEFAULT NULL,
  `saldo_cartera_usd` decimal(10,2) DEFAULT 0.00,
  `saldo_cartera_bs` decimal(12,2) DEFAULT 0.00,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLA: categorias_comercio (RUBROS OFICIALES DE LA PLATAFORMA)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `categorias_comercio`;
CREATE TABLE `categorias_comercio` (
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
('cat-4', 'comida_rapida', 'Comida Rápida', 'Hamburguesas, pizzas, pollo frito y empanadas', 'zap', 4),
('cat-5', 'supermercados', 'Supermercados & Víveres', 'Víveres, charcutería, carnes, bebidas y aseo', 'shopping-cart', 5),
('cat-6', 'farmacias', 'Farmacias & Salud', 'Medicamentos, vitaminas y cuidado personal', 'heart', 6);

-- ------------------------------------------------------------------------------
-- 4. TABLA: comercios (APP VIXY STORE - ESTABLECIMIENTOS AFILIADOS)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `comercios`;
CREATE TABLE `comercios` (
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
-- 5. TABLA: productos (CATÁLOGO / MENÚ DE CADA COMERCIO)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id` varchar(50) NOT NULL,
  `comercio_id` varchar(50) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `precio_usd` decimal(10,2) NOT NULL,
  `precio_bs` decimal(12,2) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT '/uploads/productos/default.jpg',
  `disponible` tinyint(1) DEFAULT 1,
  `stock` int(11) DEFAULT 100,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_prod_comercio` (`comercio_id`),
  CONSTRAINT `fk_prod_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLA: conductores (APP VIXY DELIVERY - MOTORIZADOS)
-- POLÍTICA: Saldo límite negativo -$0.50 USD. Bloqueo automático si supera límite.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `conductores`;
CREATE TABLE `conductores` (
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
  `licencia_vencimiento` date DEFAULT NULL,
  `saldo_billetera_usd` decimal(10,2) DEFAULT 0.00,
  `limite_saldo_negativo` decimal(10,2) DEFAULT -0.50,
  `bloqueado_por_saldo` tinyint(1) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 5.00,
  `total_carreras` int(11) DEFAULT 0,
  `estado_registro` enum('aprobado','pendiente_aprobacion','rechazado') DEFAULT 'pendiente_aprobacion',
  `foto_cedula_url` varchar(255) DEFAULT NULL,
  `foto_licencia_url` varchar(255) DEFAULT NULL,
  `foto_certificado_medico_url` varchar(255) DEFAULT NULL,
  `foto_carnet_circulacion_url` varchar(255) DEFAULT NULL,
  `foto_vehiculo_url` varchar(255) DEFAULT NULL,
  `foto_placa_url` varchar(255) DEFAULT NULL,
  `motivo_rechazo` text DEFAULT NULL,
  `terminos_aceptados` tinyint(1) DEFAULT 1,
  `verificado_por_admin` tinyint(1) DEFAULT 0,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABLA: pedidos (ÓRDENES CENTRALES DEL SISTEMA)
-- CICLO: 60s comercio | 15s conductor | Reasignación automática a más cercano
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
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
  `actualizado_en` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ped_cliente` (`cliente_id`),
  KEY `fk_ped_comercio` (`comercio_id`),
  KEY `fk_ped_conductor` (`conductor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABLA: detalles_pedido (RENGLONES DE PRODUCTOS)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `detalles_pedido`;
CREATE TABLE `detalles_pedido` (
  `id` varchar(50) NOT NULL,
  `pedido_id` varchar(50) NOT NULL,
  `producto_id` varchar(50) NOT NULL,
  `nombre_producto` varchar(150) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario_usd` decimal(10,2) NOT NULL,
  `subtotal_usd` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_det_pedido` (`pedido_id`),
  CONSTRAINT `fk_det_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. TABLA: entregas_carreras (DESPACHO Y CÁLCULO DE COMISIONES)
-- REGLA: $2.00 USD base hasta 3 km. Adicional: +$0.50 USD por cada km adicional.
-- Comisión de Plataforma: 15% administrativo.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `entregas_carreras`;
CREATE TABLE `entregas_carreras` (
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
-- 10. TABLA: recargas_billetera (REPORTES DE PAGO MÓVIL / BINANCE)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `recargas_billetera`;
CREATE TABLE `recargas_billetera` (
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
-- 11. TABLA: transacciones_billetera (HISTORIAL CONTABLE DE MOVIMIENTOS)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `transacciones_billetera`;
CREATE TABLE `transacciones_billetera` (
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
-- 11B. TABLA: liquidaciones_comercios (PAGOS Y RETIROS DE COMERCIOS)
-- SEPARACIÓN AUTOMÁTICA: Venta Bruta - Comisión Empresa = Monto Neto Pagado
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `liquidaciones_comercios`;
CREATE TABLE `liquidaciones_comercios` (
  `id` varchar(50) NOT NULL,
  `comercio_id` varchar(50) NOT NULL,
  `monto_bruto_usd` decimal(10,2) NOT NULL,
  `comision_empresa_usd` decimal(10,2) NOT NULL,
  `monto_neto_usd` decimal(10,2) NOT NULL,
  `monto_neto_bs` decimal(12,2) NOT NULL,
  `tasa_bcv_aplicada` decimal(10,4) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `banco_destino` varchar(100) DEFAULT NULL,
  `cuenta_telefono_destino` varchar(100) DEFAULT NULL,
  `referencia_bancaria` varchar(100) NOT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `comprobante_ruta_sql` varchar(255) NOT NULL,
  `estado` enum('procesado','en_verificacion','anulado') NOT NULL DEFAULT 'procesado',
  `autorizado_por` varchar(100) NOT NULL,
  `notas` text DEFAULT NULL,
  `fecha_liquidacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_liq_comercio` (`comercio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11C. TABLA: liquidaciones_conductores (PAGOS Y RETIROS DE DELIVERY)
-- DESCUENTO AUTOMÁTICO: Ganancia Carrera - Comisión Empresa = Pago a Motorizado
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `liquidaciones_conductores`;
CREATE TABLE `liquidaciones_conductores` (
  `id` varchar(50) NOT NULL,
  `conductor_id` varchar(50) NOT NULL,
  `monto_bruto_carreras_usd` decimal(10,2) NOT NULL,
  `comision_empresa_usd` decimal(10,2) NOT NULL,
  `monto_neto_usd` decimal(10,2) NOT NULL,
  `monto_neto_bs` decimal(12,2) NOT NULL,
  `tasa_bcv_aplicada` decimal(10,4) NOT NULL,
  `carreras_liquidadas` int(11) DEFAULT 1,
  `metodo_pago` varchar(50) NOT NULL,
  `banco_destino` varchar(100) DEFAULT NULL,
  `cuenta_telefono_destino` varchar(100) DEFAULT NULL,
  `referencia_bancaria` varchar(100) NOT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `comprobante_ruta_sql` varchar(255) NOT NULL,
  `estado` enum('procesado','en_verificacion','anulado') NOT NULL DEFAULT 'procesado',
  `autorizado_por` varchar(100) NOT NULL,
  `notas` text DEFAULT NULL,
  `fecha_liquidacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_liq_conductor` (`conductor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. TABLA: reclamos_incidencias (DISPUTAS Y SOPORTE)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `reclamos_incidencias`;
CREATE TABLE `reclamos_incidencias` (
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
-- 13. TABLA: mensajes_soporte (CHAT EN VIVO CON LA CENTRAL)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `mensajes_soporte`;
CREATE TABLE `mensajes_soporte` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `remitente_id` varchar(50) NOT NULL,
  `remitente_nombre` varchar(100) NOT NULL,
  `rol_remitente` enum('cliente','conductor','comercio','admin') NOT NULL,
  `mensaje` text NOT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `creado_en` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. TABLA: configuracion_sistema (PARÁMETROS GLOBALES)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `configuracion_sistema`;
CREATE TABLE `configuracion_sistema` (
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
('tiempo_aceptar_conductor_segundos', '15', 'Segundos reglamentarios para que el conductor acepte'),
('pago_movil_banco_central', '0102 - Banco de Venezuela', 'Banco central para recargas Vixy'),
('pago_movil_telefono_central', '0414-9988776', 'Teléfono de Pago Móvil Vixy Central'),
('pago_movil_rif_central', 'J-50192837-0', 'RIF de la empresa recaudadora Vixy')
ON DUPLICATE KEY UPDATE `valor` = VALUES(`valor`);

-- ------------------------------------------------------------------------------
-- 15. TABLA: auditoria_logs (TRAZABILIDAD DE ACCIONES DE SEGURIDAD)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `auditoria_logs`;
CREATE TABLE `auditoria_logs` (
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
