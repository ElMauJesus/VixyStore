-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 19-09-2026 a las 01:25:26
-- Versión del servidor: 8.0.45-36
-- Versión de PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `c2861522_vixy_dl`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_logs`
--

CREATE TABLE `auditoria_logs` (
  `id` bigint NOT NULL,
  `usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalles` text COLLATE utf8mb4_unicode_ci,
  `ip_origen` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `billeteras_financieras`
--

CREATE TABLE `billeteras_financieras` (
  `id` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` enum('admin','comercio','conductor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saldo_usd` decimal(14,2) NOT NULL DEFAULT '0.00',
  `saldo_bs` decimal(16,2) NOT NULL DEFAULT '0.00',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `billeteras_financieras`
--

INSERT INTO `billeteras_financieras` (`id`, `tipo_usuario`, `usuario_id`, `saldo_usd`, `saldo_bs`, `creado_en`, `actualizado_en`) VALUES
('wallet-admin-global', 'admin', 'vixy-plataforma', 0.00, 0.00, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-com-COM-20260912-4418EF', 'comercio', 'COM-20260912-4418EF', 0.00, 0.00, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-com-COM-20260912-EC20FC', 'comercio', 'COM-20260912-EC20FC', 0.00, 0.00, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-com-COM-20260913-FF650A', 'comercio', 'COM-20260913-FF650A', 0.00, 0.00, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-cond-cond-102a6e5a4a414e3c', 'conductor', 'cond-102a6e5a4a414e3c', 5.00, 242.50, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-cond-cond-3870be629fa25ff2', 'conductor', 'cond-3870be629fa25ff2', 5.00, 242.50, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-cond-cond-472bf20099ea9374', 'conductor', 'cond-472bf20099ea9374', 0.00, 0.00, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-cond-cond-756eb7ac1ffb03f8', 'conductor', 'cond-756eb7ac1ffb03f8', 0.00, 0.00, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-cond-cond-7f7a379c8535562a', 'conductor', 'cond-7f7a379c8535562a', 0.00, 0.00, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-cond-cond-bb1ef328bd24382f', 'conductor', 'cond-bb1ef328bd24382f', 0.00, 0.00, '2026-09-15 05:18:02', '2026-09-15 05:18:02'),
('wallet-cond-cond-e5bbad2399ba930a', 'conductor', 'cond-e5bbad2399ba930a', 5.00, 242.50, '2026-09-15 05:18:02', '2026-09-15 05:18:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_comercio`
--

CREATE TABLE `categorias_comercio` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'store',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias_comercio`
--

INSERT INTO `categorias_comercio` (`id`, `codigo`, `nombre`, `descripcion`, `icono`, `orden`, `activo`) VALUES
('cat-1', 'hogar', 'Hogar', 'Muebles, cocina, decoración y lencería', 'home', 1, 1),
('cat-2', 'ferreteria', 'Ferretería', 'Materiales, herramientas eléctricas y manuales', 'wrench', 2, 1),
('cat-3', 'restaurantes', 'Restaurantes', 'Almuerzos, comida gourmet y ejecutiva', 'utensils', 3, 1),
('cat-4', 'comida_rapida', 'Comida Rápida', 'Hamburguesas, pizzas, pollo frito y sushi', 'zap', 4, 1),
('cat-5', 'supermercados', 'Supermercados', 'Víveres, charcutería, carnes y bebidas', 'shopping-cart', 5, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `cedula` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion_habitual` text COLLATE utf8mb4_unicode_ci,
  `latitud` decimal(10,8) DEFAULT '10.48060000',
  `longitud` decimal(11,8) DEFAULT '-66.90360000',
  `saldo_billetera_usd` decimal(10,2) DEFAULT '0.00',
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `saldo_cartera_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `saldo_cartera_bs` decimal(12,2) NOT NULL DEFAULT '0.00',
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '/uploads/clientes/avatar-default.jpg',
  `foto_cedula_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_selfie_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `apellido`, `cedula`, `email`, `telefono`, `password_hash`, `direccion_habitual`, `latitud`, `longitud`, `saldo_billetera_usd`, `activo`, `creado_en`, `saldo_cartera_usd`, `saldo_cartera_bs`, `avatar_url`, `foto_cedula_url`, `foto_selfie_url`) VALUES
('cli-001', 'Alejandro', 'Ramos', 'V-21.456.789', 'cliente@vixy.com', '+58 412 111 2233', '123456', 'Las Mercedes, Av. Principal, Caracas', 10.48060000, -66.90360000, 0.00, 1, '2026-09-05 08:01:00', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-1450edba', '__diagnostico_vixy__', '', NULL, 'diagnostico-vixy@example.invalid', '0000000000', '$2y$12$ZaoUNUk1YG4.J4se1c.FtOvpYXTyajOz.aemtmY8jhMJhXjmUDmd6', 'Prueba', 10.48060000, -66.90360000, 0.00, 1, '2026-09-10 07:24:35', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-1bc26fc9', 'enrico', 'gonzalini', 'V-26724338', 'enrico@vixy.uno', '0414-9158261', '$2y$12$cYSn/3uiiJzBtdvxcRP8QexgJq2nXsyEVv7vNsTmg2mObj89O/iaK', 'calle santa isabel', 10.48060000, -66.90360000, 0.00, 1, '2026-09-11 20:29:36', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-1d905efa', 'Prueba', 'Reingreso', 'V-88035918', 'prueba035918@vixy.uno', '0414-800035918', '$2y$12$X/iuUdJntQGSu1rQJgLN6.5Gst370Cxuep/5Co3Mx9F.WQ9glCjRi', 'Prueba', 10.48060000, -66.90360000, 0.00, 1, '2026-09-10 07:59:19', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-20680b25', 'henry', 'seleznov', 'V-11223344', 'henri@vixy.uno', '0414-11223344', '$2y$12$SvUNMB1Acjt2T6lsZ5Vtf.EkH9u8kHk8aUMmUFvnm92nFZYSr48YW', 'Lat: 9.90514, Lng: -67.35824 (Ubicación GPS actual)', 10.48060000, -66.90360000, 0.00, 1, '2026-09-13 18:04:27', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-2329d58b', 'enrico', 'fussile', 'V-2577893', 'enrique@vixy.uno', '0414-43076533', '$2y$12$LmvGtcU4E1/BgPYAIwy.8ur9SRpf0tniJDm.BAduklA4a5U2sYJty', 'av bolivar', 10.48060000, -66.90360000, 0.00, 1, '2026-09-11 21:11:07', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-446af724', 'Usuario', 'Nuevo', 'V-77040242', 'usuario040242@vixy.uno', '0414-700040242', '$2y$12$2byX5ocYYZFqnPnIDc1bpeajASf/U4odqDWktqLz/fFXJ89vo77eC', 'Prueba', 10.48060000, -66.90360000, 0.00, 1, '2026-09-10 08:02:43', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-51e3723b', 'pedro', 'el cuadrado', 'V-1234567', 'pcuadrado@vixy.uno', '0414-1234567', '$2y$12$vqSbAPr26vzBJhOHNd7A2ODmFLrJSAJmtravBuAPwlAxehFp9pnJq', 'Lat: 10.52333, Lng: -66.92107 (Ubicación GPS actual)', 10.48060000, -66.90360000, 0.00, 1, '2026-09-10 08:01:22', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-5498e877', 'ricci', 'matti', 'V-28995627', 'ricci@vixy.uno', '0414-2234568', '$2y$12$bSB.IdpcK2njKw580ZDbQugEQ654Ye2pd1e8B5lZcZmgBwDkRCbKG', 'av roma', 10.48060000, -66.90360000, 0.00, 1, '2026-09-11 20:50:30', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-64b91d5d', 'charlie', 'king', 'V-12345677', 'charizard@vixy.uno', '0414-12345677', '$2y$12$oRrm9/ykbKmJnb3UVAB/fOKsOcZr4PaxFO.gvUO9YdVq0Yn6weAVy', 'cslle vahrlo', 10.52341680, -66.92109030, 0.00, 1, '2026-09-11 21:00:39', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-67a94724', 'Jesus', 'Perez', 'V-32437593', 'elmauJesus@vixy.uno', '0416-1267409', '$2y$12$i6TsDf1DpmXEH4uS2oitCuPiB4.cx.oxfrMRbAGjWR7YuXPyZlpFW', 'Lat: 9.92639, Lng: -69.62804 (Ubicación GPS actual)', 10.48060000, -66.90360000, 130.00, 1, '2026-09-18 05:18:50', 130.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-70557aa0', 'henry', 'Cliente', 'V-9892566', 'henry@vixy.uno', '0412-9158261', '$2y$12$t.iBF25W60d0HwRFZtBXheV3YvyhEWTt6XG.KpQ8jLmeXeuESrcli', 'av calle', 10.48060000, -66.90360000, 0.00, 1, '2026-09-13 13:16:54', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-782bffc0', 'enrique', 'gonzalez', 'V-9987643', 'enrique22@vixy.uno', '0414-5567894', '$2y$12$T/Z7HQAlNrd7is3HQQ76X.vFedhWG0tXw9CWYjqJgHgNp1THwg8vy', 'av calle', 10.48060000, -66.90360000, 0.00, 1, '2026-09-11 21:15:11', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-86900f57', 'lio', 'messi', 'V-23886554', 'messi@vixy.uno', '0414-9345678', '$2y$12$icLNeFYehcxThRhjWmx/pudIugznUu3my8qy8ZSxYzRvsfmsRjo2q', 'Av Miranda', 10.48060000, -66.90360000, 0.00, 1, '2026-09-11 21:05:04', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-ac66557d', 'pedro', 'el amarillo', 'V-23456789', 'pamarillo@vixy.uno', '0414-23456789', '$2y$12$ulMQQGM.6nIpYylx5Z.XF.pEZUr9CslQfGOn0jrGWjymBRMUnClVm', 'Lat: 10.52319, Lng: -66.92115 (Ubicación GPS actual)', 10.48060000, -66.90360000, 40.00, 1, '2026-09-18 05:50:02', 40.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-b2588fd3', 'Cliente', 'Prueba', 'V-99035458', 'cliente-prueba-035458@example.invalid', '0414-900035458', '$2y$12$eb5PHGMy10uQwttHB50CiOomazsEdi.18hyShNU0QIvFUQzt.sCa6', 'Prueba', 10.48060000, -66.90360000, 0.00, 1, '2026-09-10 07:54:59', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-b8c7da1e', 'pedro', 'el rojo', 'V-11234555', 'projo@vixy.uno', '0414-1122333', '$2y$12$clgRqvsfEDL/vcglUMgZDOMFhEP4G/xoCCy1/ogbYCiED2OaQYmT2', 'Lat: 10.52321, Lng: -66.92118 (Ubicación GPS actual)', 10.48060000, -66.90360000, 0.00, 1, '2026-09-18 05:38:14', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL),
('cli-d7cf174e', 'namir', 'salim', 'V-4456677', 'bubalu@vixy.uno', '0414-5763434', '$2y$12$Dfn13nl65HyYsIxaQQbRa.IatJUGGj68jJgeZXOvwX1Nj.K2M8Xfm', 'calle uno', 10.48060000, -66.90360000, 0.00, 1, '2026-09-11 21:20:55', 0.00, 0.00, '/uploads/clientes/avatar-default.jpg', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comercios`
--

CREATE TABLE `comercios` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rif` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria_principal` enum('hogar','ferreteria','restaurantes','comida_rapida','supermercados') COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portada_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitud` decimal(10,8) NOT NULL DEFAULT '10.48801100',
  `longitud` decimal(11,8) NOT NULL DEFAULT '-66.85334100',
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '123456',
  `hora_apertura` time NOT NULL DEFAULT '08:00:00',
  `hora_cierre` time NOT NULL DEFAULT '22:00:00',
  `activo` tinyint(1) DEFAULT '1',
  `status` enum('pendiente','aprobado','rechazado','suspendido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `carpeta_imagenes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documentos_comercio` text COLLATE utf8mb4_unicode_ci,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `abierto_manual` tinyint(1) DEFAULT '1',
  `tiempo_estimado_min` int DEFAULT '20',
  `tiempo_estimado_max` int DEFAULT '40',
  `calificacion` decimal(3,2) DEFAULT '4.90',
  `total_calificaciones` int DEFAULT '120',
  `saldo_billetera_usd` decimal(12,2) DEFAULT '0.00',
  `saldo_billetera_bs` decimal(14,2) DEFAULT '0.00',
  `total_ventas_usd` decimal(14,2) DEFAULT '0.00',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `comercios`
--

INSERT INTO `comercios` (`id`, `nombre`, `rif`, `categoria_principal`, `logo_url`, `portada_url`, `banner_url`, `direccion`, `latitud`, `longitud`, `telefono`, `email`, `password_hash`, `hora_apertura`, `hora_cierre`, `activo`, `status`, `carpeta_imagenes`, `documentos_comercio`, `fecha_aprobacion`, `abierto_manual`, `tiempo_estimado_min`, `tiempo_estimado_max`, `calificacion`, `total_calificaciones`, `saldo_billetera_usd`, `saldo_billetera_bs`, `total_ventas_usd`, `creado_en`) VALUES
('COM-20260912-4418EF', 'Panificadora El Imperio', 'V17356923', 'comida_rapida', '/uploads/comercios/COM-20260912-4418EF.jpg', '/uploads/comercios/COM-20260912-4418EF.jpg', NULL, 'Calle 12, Av 1, El calvario Quibor-Lara', 9.91847200, -69.61851000, '+584122830987', 'panelimperio77@gmail.com', '$2y$12$eCFQChOlSyCe6FmD8V6/CeXuPNQfVJEMWON2cNKT9zfUpT.MR1e5K', '08:00:00', '22:00:00', 1, 'pendiente', NULL, NULL, NULL, 1, 20, 40, 5.00, 0, 0.00, 0.00, 0.00, '2026-09-12 20:11:22'),
('COM-20260912-EC20FC', 'El &quot;Ya tu sabe&quot;', '32437593', 'restaurantes', '/uploads/comercios/COM-20260912-EC20FC.jpeg', '/uploads/comercios/COM-20260912-EC20FC.jpeg', NULL, 'La casa de la cultira Quibor Estado Lara, ahí afuera en la acera', 10.49466000, -66.84709000, '04161267409', 'jesus23perezbaldan@gmail.com', '$2y$12$q8fpGAZ35PaFtAiGqAL5n.2iarwPoi5wC6DATbuS78a/5sZOdy5gK', '08:00:00', '22:00:00', 1, 'pendiente', NULL, NULL, NULL, 1, 20, 40, 5.00, 0, 0.00, 0.00, 0.00, '2026-09-12 19:50:54'),
('COM-20260913-FF650A', 'La trampita de mickey', 'J-347652863-7', 'supermercados', '/uploads/comercios/COM-20260913-FF650A.png', '/uploads/comercios/COM-20260913-FF650A.png', NULL, 'Avenida Miranda', 0.00000000, 0.00000000, '04123556347', 'latrampitademickey@gmail.com', '$2y$12$lOW/SEd87CrLHRfPZ4T4nuteZ4nJ3afwKk6mK5Z2w4o2BSwzLmbEi', '08:00:00', '22:00:00', 1, 'pendiente', NULL, NULL, NULL, 1, 20, 40, 5.00, 0, 0.00, 0.00, 0.00, '2026-09-13 17:50:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conductores`
--

CREATE TABLE `conductores` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_conductor` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código único tipo DRV-XXXXXXXXXXXXXX de regist',
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cedula` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL COMMENT 'Fecha de nacimiento del conductor',
  `tipo_sangre` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipo de sangre (opcional)',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '123456',
  `foto_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Foto de perfil del conductor (NULL = sin foto, ya no apunta a Unsplash)',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'Dirección de residencia del conductor',
  `disponible` tinyint(1) DEFAULT '1',
  `status` enum('pendiente','aprobado','rechazado','suspendido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `carpeta_imagenes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_perfil_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL de la foto de perfil del conductor',
  `documentos_conductor` text COLLATE utf8mb4_unicode_ci,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `aprobado_por` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Admin que aprobó la solicitud (username)',
  `en_carrera` tinyint(1) DEFAULT '0',
  `latitud_actual` decimal(10,8) DEFAULT NULL COMMENT 'Latitud GPS actual del conductor (NULL = sin coordenada)',
  `longitud_actual` decimal(11,8) DEFAULT NULL COMMENT 'Longitud GPS actual del conductor (NULL = sin coordenada)',
  `placa_moto` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marca_moto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modelo_moto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ano_moto` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moto_serial_motor` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Serial del motor INTT',
  `moto_serial_chasis` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Serial de chasis / NIV INTT',
  `color_moto` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'No especificado',
  `licencia_grado` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '2',
  `licencia_conducir` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Número de licencia de conducir',
  `saldo_billetera_usd` decimal(10,2) DEFAULT '0.00',
  `limite_saldo_negativo` decimal(10,2) DEFAULT '-0.50',
  `bloqueado_por_saldo` tinyint(1) DEFAULT '0',
  `rating` decimal(3,2) DEFAULT '5.00',
  `total_carreras` int DEFAULT '0',
  `ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado_registro` enum('aprobado','pendiente_aprobacion','rechazado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente_aprobacion',
  `licencia_vencimiento` date DEFAULT NULL,
  `certificado_medico_nro` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Número del certificado médico',
  `certificado_medico_vencimiento` date DEFAULT NULL,
  `rcv_aseguradora` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rcv_poliza_nro` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rcv_vencimiento` date DEFAULT NULL,
  `foto_cedula_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_cedula_reverso_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_licencia_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_carnet_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Foto carnet de conducir (regist usa este nombre)',
  `foto_certificado_medico_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_rcv_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_antecedentes_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_carnet_circulacion_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_vehiculo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_placa_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_policial_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_rechazo` text COLLATE utf8mb4_unicode_ci,
  `terminos_aceptados` tinyint(1) NOT NULL DEFAULT '0',
  `verificado_por_admin` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Alias de creado_en para compatibilidad con regist',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `conductores`
--

INSERT INTO `conductores` (`id`, `codigo_conductor`, `nombre`, `apellido`, `cedula`, `telefono`, `email`, `fecha_nacimiento`, `tipo_sangre`, `password_hash`, `foto_url`, `direccion`, `disponible`, `status`, `carpeta_imagenes`, `foto_perfil_url`, `documentos_conductor`, `fecha_aprobacion`, `aprobado_por`, `en_carrera`, `latitud_actual`, `longitud_actual`, `placa_moto`, `marca_moto`, `modelo_moto`, `ano_moto`, `moto_serial_motor`, `moto_serial_chasis`, `color_moto`, `licencia_grado`, `licencia_conducir`, `saldo_billetera_usd`, `limite_saldo_negativo`, `bloqueado_por_saldo`, `rating`, `total_carreras`, `ultima_actualizacion`, `creado_en`, `estado_registro`, `licencia_vencimiento`, `certificado_medico_nro`, `certificado_medico_vencimiento`, `rcv_aseguradora`, `rcv_poliza_nro`, `rcv_vencimiento`, `foto_cedula_url`, `foto_cedula_reverso_url`, `foto_licencia_url`, `foto_carnet_url`, `foto_certificado_medico_url`, `foto_rcv_url`, `foto_antecedentes_url`, `foto_carnet_circulacion_url`, `foto_vehiculo_url`, `foto_placa_url`, `record_policial_url`, `motivo_rechazo`, `terminos_aceptados`, `verificado_por_admin`, `created_at`, `updated_at`, `actualizado_en`) VALUES
('cond-102a6e5a4a414e3c', NULL, 'enrico', 'gonzalez', 'V-27262724', '04249158261', 'conductor-bae691f92b7cbb1d@vixydelivery.com', NULL, NULL, '$2y$12$rY7LfiPCzD8GB.6wN4kjcOpVHgVH7a1pw0DjyTsLUe.hp9CWW1bAG', 'https://www.vixy.uno/api/uploads/conductores/conductores_20260913_195727_c8e50a50cb3aa1a7.jpg', '', 0, 'aprobado', '/shop/imgs-c-d/deliverys/cond-102a6e5a4a414e3c', NULL, NULL, '2026-09-12 20:27:20', NULL, 0, NULL, NULL, 'AJ95FG', 'bera', 'sbr', '2022', NULL, NULL, 'Blanco', '2da', NULL, 5.00, -0.50, 0, 5.00, 0, '2026-09-19 01:30:52', '2026-09-12 23:27:05', 'aprobado', NULL, NULL, NULL, NULL, NULL, NULL, '/api/uploads/conductores/conductores_20260912_202702_d548a1d1f7fd3dfb.jpg', NULL, '/api/uploads/conductores/conductores_20260912_202703_57b88bb23070eda7.jpg', NULL, '/api/uploads/conductores/conductores_20260912_202703_81acf704a5fec522.jpg', NULL, NULL, '/api/uploads/conductores/conductores_20260912_202704_ff977f0b4ba6b585.jpg', '/api/uploads/conductores/conductores_20260912_202704_8985a5e8e0a86911.jpg', '/api/uploads/conductores/conductores_20260912_202705_c4bd059b28a5720b.jpg', NULL, NULL, 1, 1, '2026-09-12 23:27:05', '2026-09-19 01:30:52', '2026-09-19 01:30:52'),
('cond-3870be629fa25ff2', NULL, 'pedro', 'el morado', 'V-12345677', '041412345677', 'conductor-7bca77ec09098fb9@vixydelivery.com', NULL, NULL, '$2y$12$5E23964tuCRx.cNr6km6s.UYF.dWTxsUegQF2B8k6UgdOg9.IsatW', 'https://www.vixy.uno/api/uploads/conductores/conductores_20260913_182227_5eae57c739d7ee48.jpg', '', 0, 'aprobado', '/shop/imgs-c-d/deliverys/cond-3870be629fa25ff2', NULL, NULL, '2026-09-13 02:27:29', NULL, 0, 10.52336790, -66.92105890, 'AA123AM', 'bera', '124', '1010', NULL, NULL, 'Negro', '2da', NULL, 5.00, -0.50, 0, 5.00, 0, '2026-09-16 06:30:19', '2026-09-13 05:26:44', 'aprobado', NULL, NULL, NULL, NULL, NULL, NULL, '/api/uploads/conductores/conductores_20260913_022641_11f4cc59b0ea7078.jpg', NULL, '/api/uploads/conductores/conductores_20260913_022641_0313a148d6a0e70f.jpg', NULL, '/api/uploads/conductores/conductores_20260913_022642_d61db9af024af017.jpg', NULL, NULL, '/api/uploads/conductores/conductores_20260913_022642_c796b42108abf55d.jpg', '/api/uploads/conductores/conductores_20260913_022643_799bfaa2f87f6d48.jpg', '/api/uploads/conductores/conductores_20260913_022643_41af1fd80b480fe7.jpg', NULL, NULL, 1, 1, '2026-09-13 05:26:44', '2026-09-16 06:30:19', '2026-09-16 06:30:19'),
('cond-daad69e2e282b313', NULL, 'pedro', 'el blanco', 'V-12345699', '041412345699', 'conductor-91a24eb0519a3544@vixydelivery.com', NULL, NULL, '$2y$12$e21n4zOktyBIYPgl795Bu.VJ8QV.vYUnKXYm2wWE87qxKTQoS1/Oq', NULL, NULL, 0, 'pendiente', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'AAA1111', 'bera', '150', '1000', NULL, NULL, 'Negro', '2da', NULL, 0.00, -0.50, 0, 5.00, 0, '2026-09-18 04:58:11', '2026-09-18 04:58:11', 'pendiente_aprobacion', NULL, NULL, NULL, NULL, NULL, NULL, 'https://www.vixy.uno/backend/php/uploads/general/general_20260918_015806_0cccf495eb84d6b4.jpg', NULL, 'https://www.vixy.uno/backend/php/uploads/general/general_20260918_015807_480cc6e7ae8f0267.jpg', NULL, 'https://www.vixy.uno/backend/php/uploads/general/general_20260918_015808_d978256a9a6a85d8.jpg', NULL, NULL, 'https://www.vixy.uno/backend/php/uploads/general/general_20260918_015809_75a4d99367407713.jpg', 'https://www.vixy.uno/backend/php/uploads/general/general_20260918_015810_0124721416113ffa.jpg', 'https://www.vixy.uno/backend/php/uploads/general/general_20260918_015811_a6985467926f5e92.jpg', NULL, NULL, 1, 0, '2026-09-18 04:58:11', '2026-09-18 04:58:11', '2026-09-18 04:58:11'),
('DRV-20260916-646A7F', 'DRV-20260916-646A7F', 'Jesús', 'Pérez', 'V-32437593', '04161267409', 'jesus23perezbaldan@gmail.com', NULL, NULL, '$2y$12$bBXc3uuLNTmUuh8d5hDu1O9qUfbTW610VmXtWbTK256km8uoJSWdu', '/api/uploads/conductores/DRV-20260916-646A7F/foto_perfil_1789598238.jpg', NULL, 0, 'aprobado', '/home/c2861522/public_html/shop/backend/php/uploads/conductores/DRV-20260916-646A7F/', '/api/uploads/conductores/DRV-20260916-646A7F/foto_perfil_1789598238.jpg', NULL, '2026-09-16 19:38:07', NULL, 0, NULL, NULL, '', '', '', '2026', NULL, NULL, '', '2da', '2da', 10.00, -0.50, 0, 5.00, 0, '2026-09-17 22:33:22', '2026-09-16 22:37:18', 'aprobado', NULL, NULL, NULL, NULL, NULL, NULL, '/api/uploads/conductores/DRV-20260916-646A7F/cedula_anverso_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/cedula_reverso_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/licencia_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/carnet_circulacion_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/cert_medico_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/rcv_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/antecedentes_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/carnet_circulacion_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/foto_vehiculo_1789598238.jpg', '/api/uploads/conductores/DRV-20260916-646A7F/foto_placa_1789598238.jpg', NULL, NULL, 0, 1, '2026-09-16 22:37:18', '2026-09-17 22:33:22', '2026-09-17 22:33:22');

--
-- Disparadores `conductores`
--
DELIMITER $$
CREATE TRIGGER `trg_bloqueo_automatico_saldo_conductor_bi` BEFORE INSERT ON `conductores` FOR EACH ROW BEGIN
    IF NEW.saldo_billetera_usd <= -0.50 THEN
        SET NEW.bloqueado_por_saldo = 1;
        SET NEW.disponible = 0;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_bloqueo_automatico_saldo_conductor_bu` BEFORE UPDATE ON `conductores` FOR EACH ROW BEGIN
    -- Si el saldo es menor o igual al limite de -$0.50 USD, bloquear y desactivar
    IF NEW.saldo_billetera_usd <= -0.50 THEN
        SET NEW.bloqueado_por_saldo = 1;
        SET NEW.disponible = 0;
    -- Si el saldo se recupera por encima de -$0.50 USD, desbloquear automaticamente
    ELSEIF NEW.saldo_billetera_usd > -0.50 AND OLD.bloqueado_por_saldo = 1 THEN
        SET NEW.bloqueado_por_saldo = 0;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_metodos_pago`
--

CREATE TABLE `configuracion_metodos_pago` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_obligatorio` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `requiere_comprobante` tinyint(1) NOT NULL DEFAULT '0',
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuracion_metodos_pago`
--

INSERT INTO `configuracion_metodos_pago` (`id`, `nombre`, `es_obligatorio`, `activo`, `descripcion`, `requiere_comprobante`, `actualizado_en`) VALUES
('binance', 'Binance Pay (USDT)', 0, 1, 'Criptopagos inmediatos vía Binance Pay ID / QR.', 1, '2026-09-05 08:01:01'),
('efectivo', 'Efectivo Divisas / Bolívares', 1, 1, 'Cobro en mano en la entrega. Comisión descontada de billetera del motorizado.', 0, '2026-09-05 08:01:01'),
('pago_movil', 'Pago Móvil (Directo a Negocio)', 1, 1, 'Pago directo en Bs al comercio a tasa BCV. Obligatorio por normativa.', 1, '2026-09-05 08:01:01'),
('paypal', 'PayPal (USD)', 0, 0, 'Pagos internacionales en línea.', 1, '2026-09-05 08:01:01'),
('punto_venta', 'Punto de Venta Móvil', 0, 0, 'Cobro con tarjeta de débito al momento de la entrega.', 0, '2026-09-05 08:01:01'),
('saldo_cartera', 'Cartera Digital Vixy (Wallet)', 1, 1, 'Saldo de billetera prepagada. Comprobantes auditados por administración.', 1, '2026-09-05 08:01:01'),
('zelle', 'Zelle (USD)', 0, 1, 'Transferencias directas en USD.', 1, '2026-09-05 08:01:01'),
('zinli', 'Zinli Wallet (USD)', 0, 1, 'Billetera digital prepagada internacional.', 1, '2026-09-05 08:01:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_sistema`
--

CREATE TABLE `configuracion_sistema` (
  `clave` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuracion_sistema`
--

INSERT INTO `configuracion_sistema` (`clave`, `valor`, `descripcion`) VALUES
('carteras_habilitadas_global', '1', 'Habilita el motor financiero de billeteras'),
('comision_comercio_antes_anio', '0', NULL),
('comision_comercio_despues_anio', '3', NULL),
('comision_comercio_despues_primer_ano', '3.00', 'Comercio: 3% desde el mes 13'),
('comision_conductor_despues_3_meses', '10.00', 'Delivery: 10% desde el mes 4 y durante diciembre'),
('comision_delivery_antes_3m', '5', NULL),
('comision_delivery_despues_3m', '10', NULL),
('comision_plataforma_porcentaje', '10', 'Porcentaje de comisión administrativa sobre el envío'),
('km_base', '3', 'Distancia base en kilómetros incluida en tarifa mínima'),
('limite_saldo_negativo_conductor_usd', '-0.50', 'Límite máximo de saldo negativo antes de pausar asignación'),
('monto_activacion_conductor_usd', '5.00', 'Monto mínimo en USD requerido para que un conductor nuevo o solvente active su turno de reparto'),
('porcentaje_comision_comercio', '0.00', 'Comercio: 0% durante los meses 1 a 12'),
('porcentaje_comision_delivery', '5.00', 'Delivery: 5% durante los meses 1 a 3'),
('precio_km_adicional_usd', '0.5', 'Monto adicional en USD por cada kilómetro adicional'),
('tarifa_base_usd', '2', 'Tarifa mínima de despacho en USD hasta 3 km'),
('tasa_bcv', '800', 'Tasa BCV usada para registrar el equivalente en bolivares');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `confirmaciones_entrega`
--

CREATE TABLE `confirmaciones_entrega` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pedido_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conductor_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto_entrega_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_confirmacion` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firma_digital` text COLLATE utf8mb4_unicode_ci,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `entregado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_pedido`
--

CREATE TABLE `detalles_pedido` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pedido_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_producto` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_unitario_usd` decimal(10,2) NOT NULL,
  `subtotal_usd` decimal(10,2) NOT NULL,
  `opciones_seleccionadas_json` json DEFAULT NULL,
  `cantidad_decimal` decimal(10,3) DEFAULT NULL,
  `notas_item` text COLLATE utf8mb4_unicode_ci,
  `precio_adicional_usd` decimal(10,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entregas_carreras`
--

CREATE TABLE `entregas_carreras` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pedido_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conductor_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo_producto_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `distancia_total_km` decimal(6,2) NOT NULL DEFAULT '2.00',
  `distancia_excedente_km` decimal(6,2) NOT NULL DEFAULT '0.00',
  `tarifa_base_usd` decimal(10,2) NOT NULL DEFAULT '2.00',
  `tarifa_adicional_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `costo_envio_total_usd` decimal(10,2) NOT NULL DEFAULT '2.00',
  `monto_total_servicio_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `comision_plataforma_usd` decimal(10,2) NOT NULL DEFAULT '0.30',
  `ganancia_neta_conductor_usd` decimal(10,2) NOT NULL DEFAULT '1.70',
  `estado` enum('asignada','en_camino_retiro','en_comercio','en_ruta_entrega','completada','cancelada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'asignada',
  `inicio_en` timestamp NULL DEFAULT NULL,
  `completado_en` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `liquidaciones_comercios`
--

CREATE TABLE `liquidaciones_comercios` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comercio_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_bruto_usd` decimal(10,2) NOT NULL,
  `comision_empresa_usd` decimal(10,2) NOT NULL,
  `monto_neto_usd` decimal(10,2) NOT NULL,
  `monto_neto_bs` decimal(12,2) NOT NULL,
  `tasa_bcv_aplicada` decimal(10,4) NOT NULL,
  `metodo_pago` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `banco_destino` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuenta_telefono_destino` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_bancaria` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comprobante_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comprobante_ruta_sql` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `estado` enum('procesado','en_verificacion','anulado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'procesado',
  `autorizado_por` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha_liquidacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `liquidaciones_conductores`
--

CREATE TABLE `liquidaciones_conductores` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conductor_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_bruto_carreras_usd` decimal(10,2) NOT NULL,
  `comision_empresa_usd` decimal(10,2) NOT NULL,
  `monto_neto_usd` decimal(10,2) NOT NULL,
  `monto_neto_bs` decimal(12,2) NOT NULL,
  `tasa_bcv_aplicada` decimal(10,4) NOT NULL,
  `carreras_liquidadas` int NOT NULL DEFAULT '1',
  `metodo_pago` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `banco_destino` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuenta_telefono_destino` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_bancaria` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comprobante_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comprobante_ruta_sql` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `estado` enum('procesado','en_verificacion','anulado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'procesado',
  `autorizado_por` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha_liquidacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_seguimiento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comercio_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conductor_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('solicitud_enviada','pago_verificado','en_preparacion','esperando_repartidor','en_camino_al_cliente','entregado','cerrado_calificado','cancelado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'solicitud_enviada',
  `monto_subtotal_usd` decimal(10,2) NOT NULL,
  `costo_producto_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `costo_envio_usd` decimal(10,2) NOT NULL DEFAULT '2.00',
  `costo_delivery_usd` decimal(10,2) NOT NULL DEFAULT '2.00',
  `ganancia_conductor_usd` decimal(10,2) NOT NULL DEFAULT '1.70',
  `ganancia_app_usd` decimal(10,2) NOT NULL DEFAULT '0.30',
  `tasa_bcv_bs` decimal(10,4) NOT NULL DEFAULT '48.5000',
  `monto_total_usd` decimal(10,2) NOT NULL,
  `monto_total_bs` decimal(12,2) NOT NULL,
  `conductor_oferta_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiempo_inicio_oferta` timestamp NULL DEFAULT NULL,
  `tiempo_limite_oferta` timestamp NULL DEFAULT NULL,
  `segundos_restantes_oferta` int DEFAULT '15',
  `conductores_rechazados` text COLLATE utf8mb4_unicode_ci,
  `estado_despacho` enum('buscando_conductor','ofrecido_a_conductor','aceptado','en_camino_comercio','en_camino_cliente','completado','sin_conductores_disponibles') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'buscando_conductor',
  `comision_descontada` tinyint(1) DEFAULT '0',
  `detalles_liquidacion` json DEFAULT NULL,
  `metodo_pago` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pago_movil',
  `referencia_pago` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comprobante_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `origen_lat` decimal(10,8) DEFAULT NULL,
  `origen_lng` decimal(11,8) DEFAULT NULL,
  `origen_direccion` text COLLATE utf8mb4_unicode_ci,
  `destino_lat` decimal(10,8) DEFAULT NULL,
  `destino_lng` decimal(11,8) DEFAULT NULL,
  `destino_direccion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `distancia_km` decimal(6,2) DEFAULT '2.50',
  `entregado_en` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `pedidos`
--
DELIMITER $$
CREATE TRIGGER `trg_pedido_distribucion_tres_niveles` AFTER UPDATE ON `pedidos` FOR EACH ROW BEGIN 
    -- Variables de configuración
    DECLARE v_pct_comercio_base DECIMAL(5,2) DEFAULT 0.00; 
    DECLARE v_pct_comercio_antiguo DECIMAL(5,2) DEFAULT 3.00; 
    DECLARE v_pct_delivery_base DECIMAL(5,2) DEFAULT 5.00; 
    DECLARE v_pct_delivery_antiguo DECIMAL(5,2) DEFAULT 10.00; 
    
    -- Variables de cálculo
    DECLARE v_pct_comercio DECIMAL(5,2) DEFAULT 0.00; 
    DECLARE v_pct_delivery DECIMAL(5,2) DEFAULT 5.00; 
    DECLARE v_com_comercio DECIMAL(12,2) DEFAULT 0.00; 
    DECLARE v_com_delivery DECIMAL(12,2) DEFAULT 0.00; 
    DECLARE v_neto_comercio DECIMAL(12,2) DEFAULT 0.00; 
    DECLARE v_neto_conductor DECIMAL(12,2) DEFAULT 0.00; 
    
    -- Variables de antigüedad
    DECLARE v_conductor_antiguedad_meses INT DEFAULT 0; 
    DECLARE v_comercio_antiguedad_dias INT DEFAULT 0; 

    -- Variables para auditoría de saldos
    DECLARE v_saldo_com_ant DECIMAL(12,2) DEFAULT 0.00; 
    DECLARE v_saldo_cond_ant DECIMAL(10,2) DEFAULT 0.00;

    -- Solo actuar si pasa a entregado
    IF NEW.estado = 'entregado' AND OLD.estado <> 'entregado' THEN 
        
        -- CORREGIDO: Mapeo exacto de claves a variables correctas
        SELECT 
            COALESCE(MAX(CASE WHEN clave = 'porcentaje_comision_comercio' THEN CAST(valor AS DECIMAL(5,2)) END), 0.00),
            COALESCE(MAX(CASE WHEN clave = 'comision_comercio_despues_primer_ano' THEN CAST(valor AS DECIMAL(5,2)) END), 3.00),
            COALESCE(MAX(CASE WHEN clave = 'porcentaje_comision_delivery' THEN CAST(valor AS DECIMAL(5,2)) END), 5.00),
            COALESCE(MAX(CASE WHEN clave = 'comision_conductor_despues_3_meses' THEN CAST(valor AS DECIMAL(5,2)) END), 10.00)
        INTO 
            v_pct_comercio_base, 
            v_pct_comercio_antiguo, 
            v_pct_delivery_base, 
            v_pct_delivery_antiguo
        FROM configuracion_sistema 
        WHERE clave IN (
            'porcentaje_comision_comercio', 
            'porcentaje_comision_delivery', 
            'comision_comercio_despues_primer_ano', 
            'comision_conductor_despues_3_meses'
        );

        -- Calcular antigüedad comercio
        SELECT TIMESTAMPDIFF(DAY, creado_en, NOW()) INTO v_comercio_antiguedad_dias 
        FROM comercios WHERE id = NEW.comercio_id;

        IF v_comercio_antiguedad_dias >= 365 THEN 
            SET v_pct_comercio = v_pct_comercio_antiguo; 
        ELSE 
            SET v_pct_comercio = v_pct_comercio_base; 
        END IF;

        -- Calcular comisiones del comercio
        SET v_com_comercio = ROUND(COALESCE(NEW.monto_subtotal_usd, 0) * v_pct_comercio / 100, 2); 
        SET v_neto_comercio = COALESCE(NEW.monto_subtotal_usd, 0) - v_com_comercio; 

        -- PROCESAR COMERCIO (Se lee el saldo actual justo antes de actualizar para la auditoría)
        SELECT saldo_billetera_usd INTO v_saldo_com_ant FROM comercios WHERE id = NEW.comercio_id;
        
        UPDATE comercios 
        SET saldo_billetera_usd = saldo_billetera_usd + v_neto_comercio, 
            total_ventas_usd = total_ventas_usd + COALESCE(NEW.monto_subtotal_usd, 0) 
        WHERE id = NEW.comercio_id; 

        INSERT INTO transacciones_billetera (id, usuario_id, tipo_usuario, tipo_movimiento, concepto, monto_usd, saldo_anterior_usd, saldo_nuevo_usd, referencia_id) 
        VALUES ( 
            CONCAT('trx-com-', NEW.id), 
            NEW.comercio_id, 
            'comercio', 
            'ingreso', 
            CONCAT('Pago por pedido ', NEW.codigo_seguimiento, ' (comisión ', v_pct_comercio, '%)'), 
            v_neto_comercio, 
            v_saldo_com_ant, 
            (v_saldo_com_ant + v_neto_comercio), 
            NEW.id 
        ); 

        -- PROCESAR CONDUCTOR (Si aplica)
        IF NEW.conductor_id IS NOT NULL THEN 
            SELECT TIMESTAMPDIFF(MONTH, creado_en, NOW()) INTO v_conductor_antiguedad_meses 
            FROM conductores WHERE id = NEW.conductor_id; 

            IF v_conductor_antiguedad_meses >= 3 THEN 
                SET v_pct_delivery = v_pct_delivery_antiguo; 
            ELSE 
                SET v_pct_delivery = v_pct_delivery_base; 
            END IF; 

            SET v_com_delivery = ROUND(COALESCE(NEW.costo_envio_usd, 0) * v_pct_delivery / 100, 2); 
            SET v_neto_conductor = COALESCE(NEW.costo_envio_usd, 0) - v_com_delivery; 

            SELECT saldo_billetera_usd INTO v_saldo_cond_ant FROM conductores WHERE id = NEW.conductor_id;

            UPDATE conductores 
            SET saldo_billetera_usd = saldo_billetera_usd + v_neto_conductor, 
                total_carreras = total_carreras + 1 
            WHERE id = NEW.conductor_id; 

            INSERT INTO transacciones_billetera (id, usuario_id, tipo_usuario, tipo_movimiento, concepto, monto_usd, saldo_anterior_usd, saldo_nuevo_usd, referencia_id) 
            VALUES ( 
                CONCAT('trx-cond-', NEW.id), 
                NEW.conductor_id, 
                'conductor', 
                'ingreso', 
                CONCAT('Pago por servicio ', NEW.codigo_seguimiento, ' (comisión ', v_pct_delivery, '%)'), 
                v_neto_conductor, 
                v_saldo_cond_ant, 
                (v_saldo_cond_ant + v_neto_conductor), 
                NEW.id 
            ); 
        END IF; 

    END IF; 
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_vixy_fin_pedido_entregado` AFTER UPDATE ON `pedidos` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comercio_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_usd` decimal(10,2) NOT NULL,
  `precio_bs` decimal(12,2) DEFAULT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT '1',
  `stock` int DEFAULT '50',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `unidad_venta` enum('unidad','kg','g','litro','ml') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unidad',
  `incremento_venta` decimal(10,3) NOT NULL DEFAULT '1.000',
  `opciones_json` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `comercio_id`, `categoria`, `nombre`, `descripcion`, `precio_usd`, `precio_bs`, `imagen_url`, `disponible`, `stock`, `creado_en`, `unidad_venta`, `incremento_venta`, `opciones_json`) VALUES
('prod-001', 'com-001', 'Hamburguesas', 'Burger Doble Queso Tocino', 'Doble carne de res 200g, queso cheddar fundido, tocineta crujiente y salsa especial', 6.50, NULL, NULL, 1, 100, '2026-09-05 08:01:01', 'unidad', 1.000, NULL),
('prod-002', 'com-001', 'Papas', 'Papas Rústicas Trufadas', 'Papas con aceite de trufa, queso parmesano y hierbas finas', 3.00, NULL, NULL, 1, 80, '2026-09-05 08:01:01', 'unidad', 1.000, NULL),
('prod-003', 'com-002', 'Bebidas', 'Refresco 2L Sabor Cola', 'Botella familiar 2 Litros bien fría', 2.00, NULL, NULL, 1, 150, '2026-09-05 08:01:01', 'unidad', 1.000, NULL),
('prod-051767e7b8bf', 'COM-20260912-EC20FC', 'General', 'Hamburguesa Triple', 'Hamburguesa triple carne', 5.00, 242.50, '/shop/imgs-c-d/comercios/COM-20260912-EC20FC/articulos/art_20260918_005139_616c4a46.jpg', 1, 50, '2026-09-12 21:59:14', 'unidad', 1.000, NULL),
('prod-83eb796b12dd', 'COM-20260912-4418EF', 'Panes', 'Pan de perro', '10 unidades de pan de perro grande', 1.20, 58.20, '/shop/imgs-c-d/comercios/COM-20260912-4418EF/articulos/art_20260912_192826_7c41e1a8.jpg', 1, 50, '2026-09-12 22:28:27', 'unidad', 1.000, NULL),
('prod-e13a55b631ca', 'COM-20260913-FF650A', 'General', 'Pizza básica', '', 6.00, 291.00, '/shop/imgs-c-d/comercios/COM-20260913-FF650A/articulos/art_20260913_150217_cd77d36e.jpg', 1, 50, '2026-09-13 18:02:18', 'unidad', 1.000, NULL),
('prod-e17ad94129a6', 'COM-20260912-EC20FC', 'General', 'Perro Caliente FULL', 'Perro Caliente Con Todo', 1.20, 58.20, '/shop/imgs-c-d/comercios/COM-20260912-EC20FC/articulos/art_20260918_005147_1f294c11.jpg', 1, 50, '2026-09-12 21:55:24', 'unidad', 1.000, NULL),
('prod-f83b90875438', 'COM-20260912-4418EF', 'Panes', 'Hamburguesas con molde', '10 unidades de hamburguesas con semillas de a', 1.40, 67.90, '/shop/imgs-c-d/comercios/COM-20260912-4418EF/articulos/art_20260912_192624_03d7c000.jpg', 1, 50, '2026-09-12 22:26:24', 'unidad', 1.000, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recargas_billetera`
--

CREATE TABLE `recargas_billetera` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` enum('conductor','comercio','cliente') COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_usd` decimal(10,2) NOT NULL,
  `monto_bs` decimal(12,2) NOT NULL,
  `tasa_bcv` decimal(10,4) NOT NULL,
  `metodo` enum('pago_movil','binance','transferencia') COLLATE utf8mb4_unicode_ci NOT NULL,
  `banco_emisor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono_origen` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comprobante_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `revisado_por` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_rechazo` text COLLATE utf8mb4_unicode_ci,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `recargas_billetera`
--

INSERT INTO `recargas_billetera` (`id`, `usuario_id`, `tipo_usuario`, `monto_usd`, `monto_bs`, `tasa_bcv`, `metodo`, `banco_emisor`, `telefono_origen`, `referencia`, `comprobante_url`, `estado`, `revisado_por`, `motivo_rechazo`, `creado_en`, `actualizado_en`) VALUES
('rec-069c0a4424d9e164', 'cli-ac66557d', 'cliente', 10.00, 8000.00, 800.0000, 'pago_movil', 'Banesco', NULL, 'ttyyu', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_115726_4859613d2e7a01d2.jpg', 'aprobada', 'admin', NULL, '2026-09-18 14:57:26', '2026-09-18 14:57:43'),
('rec-2ab6b937e1bcff25', 'cli-67a94724', 'cliente', 50.00, 2425.00, 48.5000, 'binance', 'Banesco', NULL, '73827288', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_025140_9675707d50e80be8.jpg', 'aprobada', 'admin', NULL, '2026-09-18 05:51:40', '2026-09-18 06:18:05'),
('rec-3c5fe721a82f2f86', 'cli-ac66557d', 'cliente', 10.00, 485.00, 48.5000, 'pago_movil', 'Banesco', NULL, '44455', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_112314_6c2e266f1e1268b6.jpg', 'aprobada', 'admin', NULL, '2026-09-18 14:23:14', '2026-09-18 14:24:13'),
('rec-6372ad744572ea03', 'cli-ac66557d', 'cliente', 10.00, 485.00, 48.5000, 'pago_movil', 'Banesco', NULL, '3333', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_025018_69124ce337bbe11b.jpg', 'aprobada', 'admin', NULL, '2026-09-18 05:50:18', '2026-09-18 06:18:06'),
('rec-63c563bd5ba1e4ed', 'cond-7f7a379c8535562a', 'conductor', 5.00, 242.50, 48.5000, 'binance', 'Banesco', NULL, '11111', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260915_134128_9a8a48d9a621ce3c.jpg', 'aprobada', 'admin', NULL, '2026-09-15 16:41:28', '2026-09-16 03:08:48'),
('rec-6aa0f6ae1b814', 'cli-a3d6e0c0', 'cliente', 10.00, 485.00, 48.5000, 'pago_movil', 'Banesco', NULL, '444344', '/backend/php/uploads/comprobantes/comprobantes_20260909_030325_22ff5b565bb314c1.jpg', 'rechazada', 'admin', 'Comprobante no coincide con extracto bancario.', '2026-09-09 06:03:26', '2026-09-13 18:20:21'),
('rec-6aa0fb002987e', 'cli-a3d6e0c0', 'cliente', 10.00, 485.00, 48.5000, 'pago_movil', 'Banesco', NULL, '443rr', '/backend/php/uploads/comprobantes/comprobantes_20260909_032151_3f2c7d6b972414d0.jpg', 'rechazada', 'admin', 'Comprobante no coincide con extracto bancario.', '2026-09-09 06:21:52', '2026-09-13 18:20:19'),
('rec-6aa64b9db7d58', 'cond-e5bbad2399ba930a', 'conductor', 5.00, 242.50, 48.5000, 'pago_movil', 'Banesco', NULL, '111111', '/api/uploads/comprobantes/comprobantes_20260913_040709_e38e6dc59aa8d690.jpg', 'aprobada', 'admin', NULL, '2026-09-13 07:07:09', '2026-09-13 18:20:24'),
('rec-7b13389f20006909', 'cli-c25be149', 'cliente', 10.00, 485.00, 48.5000, 'pago_movil', 'Banesco', NULL, '6381627', '/backend/php/uploads/comprobantes/comprobantes_20260916_035732_df69e35c185eddd4.jpg', 'aprobada', 'admin', NULL, '2026-09-16 06:57:32', '2026-09-16 06:58:28'),
('rec-938fd9469962063c', 'DRV-20260916-646A7F', 'conductor', 10.00, 485.00, 48.5000, 'binance', 'Banesco', NULL, '8291729', '/api/uploads/comprobantes/comprobantes_20260916_193909_4552fc33a3c1ee95.jpg', 'aprobada', 'admin', NULL, '2026-09-16 22:39:09', '2026-09-16 22:39:16'),
('rec-9e3c388d02af5687', 'cli-67a94724', 'cliente', 20.00, 970.00, 48.5000, 'pago_movil', 'Banesco', NULL, '6726272', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_054319_dfe058e4c625b9c5.jpg', 'aprobada', 'admin', NULL, '2026-09-18 08:43:19', '2026-09-18 08:43:25'),
('rec-a6ee8af1e4e9a325', 'cli-67a94724', 'cliente', 50.00, 2425.00, 48.5000, 'binance', 'Banesco', NULL, '7382761', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_040659_36c1b14b1e6a3880.jpg', 'aprobada', 'admin', NULL, '2026-09-18 07:06:59', '2026-09-18 07:07:17'),
('rec-af56ba0d4ccc9b1b', 'cond-3870be629fa25ff2', 'conductor', 5.00, 242.50, 48.5000, 'pago_movil', 'Banesco', NULL, '11111', '/api/uploads/comprobantes/comprobantes_20260913_151903_cf31c9f05c46eb27.jpg', 'aprobada', 'admin', NULL, '2026-09-13 18:19:03', '2026-09-13 18:20:27'),
('rec-cb5ee62389dd5aff', 'cond-102a6e5a4a414e3c', 'conductor', 5.00, 242.50, 48.5000, 'pago_movil', 'Banesco', NULL, '176342', '/api/uploads/comprobantes/comprobantes_20260913_163511_ce920131b14cf347.jpg', 'aprobada', 'admin', NULL, '2026-09-13 19:35:11', '2026-09-13 19:36:02'),
('rec-d1be98276e13525a', 'DRV-20260916-3266ED', 'conductor', 10.00, 485.00, 48.5000, 'pago_movil', 'Banesco', NULL, '7382278', '/api/uploads/comprobantes/comprobantes_20260916_173500_870c46a4164bfdb2.jpg', 'aprobada', 'admin', NULL, '2026-09-16 20:35:04', '2026-09-16 20:35:28'),
('rec-debb5ab3842f6591', 'DRV-20260916-3266ED', 'conductor', 10.00, 485.00, 48.5000, 'pago_movil', 'Banesco', NULL, '7382278', '/api/uploads/comprobantes/comprobantes_20260916_173458_3d606d70f21148e5.jpg', 'aprobada', 'admin', NULL, '2026-09-16 20:34:58', '2026-09-16 20:35:15'),
('rec-f8844351e313aaf9', 'cli-67a94724', 'cliente', 10.00, 485.00, 48.5000, 'pago_movil', 'Banesco', NULL, '627162', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_050515_51489017502af67f.jpg', 'aprobada', 'admin', NULL, '2026-09-18 08:05:15', '2026-09-18 08:05:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reclamos_evidencias`
--

CREATE TABLE `reclamos_evidencias` (
  `id` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reclamo_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_evidencia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_evidencia` enum('recepcion','producto','empaque','otro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'producto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reclamos_financieros`
--

CREATE TABLE `reclamos_financieros` (
  `id` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reclamo_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pedido_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `liquidacion_id` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_usuario` enum('comercio','conductor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_reclamo` enum('saldo_no_acreditado','liquidacion_no_pagada','pago_no_recibido','comision_incorrecta','reembolso','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_reclamado_usd` decimal(12,2) NOT NULL DEFAULT '0.00',
  `monto_resuelto_usd` decimal(12,2) NOT NULL DEFAULT '0.00',
  `estado` enum('abierto','en_revision','aprobado','rechazado','resuelto','desestimado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'abierto',
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolucion` text COLLATE utf8mb4_unicode_ci,
  `atendido_por` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reclamos_incidencias`
--

CREATE TABLE `reclamos_incidencias` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_ticket` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pedido_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reportado_por_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_reportante` enum('cliente','comercio','conductor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `evidencia_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('abierto','en_revision','resuelto_favor_cliente','resuelto_favor_comercio','desestimado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'abierto',
  `resolucion` text COLLATE utf8mb4_unicode_ci,
  `reembolso_usd` decimal(10,2) DEFAULT '0.00',
  `atendido_por` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cliente_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comercio_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conductor_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolucion_admin` text COLLATE utf8mb4_unicode_ci,
  `resuelto_por` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monto_reclamado_usd` decimal(12,2) DEFAULT '0.00',
  `monto_resuelto_usd` decimal(12,2) DEFAULT '0.00',
  `ventana_reclamo_horas` int NOT NULL DEFAULT '72',
  `fecha_entrega_referencia` timestamp NULL DEFAULT NULL,
  `monto_reembolso_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reembolso_estado` enum('no_aplica','pendiente_ejecucion','ejecutado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'no_aplica',
  `motivo_decision` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones_usuario`
--

CREATE TABLE `sesiones_usuario` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_jti_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expira_en` datetime NOT NULL,
  `revocado_en` datetime DEFAULT NULL,
  `dispositivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_origen` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_uso_en` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sesiones_usuario`
--

INSERT INTO `sesiones_usuario` (`id`, `usuario_id`, `tipo_usuario`, `token_jti_hash`, `expira_en`, `revocado_en`, `dispositivo`, `ip_origen`, `creado_en`, `ultimo_uso_en`) VALUES
('00ebd6b8-32a4-83e2-5d17-ac2a574ad1b9', 'cond-102a6e5a4a414e3c', 'conductor', 'b9955eb71fd2a4039e23f166c02e548ef792042a556a0951179c2f5fd83831e9', '2026-09-25 22:15:23', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '161.140.82.77', '2026-09-19 01:15:23', NULL),
('018d3fec-10ae-197b-a2ad-e7d57e5ebd92', 'cond-3870be629fa25ff2', 'conductor', 'a1b9852cee2527f67ab8f2cc18b1d1553484e506b1007fa1e7e59671ac60f8db', '2026-09-20 19:56:42', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '186.165.104.172', '2026-09-13 22:56:42', NULL),
('01dd8ae8-ef48-8f27-6430-3dac77a9b0df', 'cond-bb1ef328bd24382f', 'conductor', 'dfa054f68ade08a63c9ffe2a0d7805bc010825d8da1c3c40a598d33a78bdade3', '2026-09-18 17:36:55', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-11 20:36:55', NULL),
('04149e9f-6eb6-f23d-496e-496941bf3bd6', 'DRV-20260916-646A7F', 'conductor', '184edc5ef0470e551458f008e4207728f2f4c91fde1101d545609890035cae00', '2026-09-23 20:31:59', '2026-09-16 20:33:52', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-16 23:31:59', NULL),
('066f41e8-07a8-b4c0-7cf8-38787d6ca0fe', 'DRV-20260916-646A7F', 'conductor', '9634ca0362103c9624a119b89c703f55e48c4214590d384cf2de9d709cffac0f', '2026-09-24 00:30:08', '2026-09-17 00:41:51', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-17 03:30:08', NULL),
('06867578-5b10-ae11-3c71-fdb515f79015', 'DRV-20260916-646A7F', 'conductor', 'efaf6585d72954aef9f6b6980cdfd8e74f3f85b156117bed96bb855c0af5120c', '2026-09-24 01:53:12', '2026-09-17 01:56:59', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-17 04:53:12', NULL),
('0b56dfb3-447f-06ec-c2c9-ada16520b3aa', 'cli-b8c7da1e', 'cliente', '69cc76f75c2491dce285278f1e06f151f369c3b337f84c971a22436f63be2305', '2026-09-25 02:38:14', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-18 05:38:14', NULL),
('0d7357f5-7629-14fb-1ec4-f4e7e9abc949', 'cli-446af724', 'cliente', '01e6feb658341ac7ca8fe7142dd03ced6c519e7c233f9dec058ae77ebb53a637', '2026-09-17 05:08:39', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 08:08:39', NULL),
('0dbc2061-d559-983a-9302-5b251028d5e3', 'cli-64b91d5d', 'cliente', '3944c9439e817a29fc7be2226d047095d86968c5c243b8372641f89203df41ce', '2026-09-20 18:12:11', '2026-09-18 01:59:14', 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 21:12:11', NULL),
('0de82452-fca3-307b-19a3-76425e3f8eb4', 'store-1b233369', 'comercio', '478aa105f37ae9410967d487e493b716f7991d0b383c171c0e4d3deb58aa098b', '2026-09-17 13:58:17', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 16:58:17', NULL),
('0f559717-cbd5-3130-4cbe-cc6f94a49a8e', 'cond-102a6e5a4a414e3c', 'conductor', '7bbeee461496c6239938b61c4c99b43751ff8c2ba1db20aad50a5f198f5b075f', '2026-09-23 17:37:07', '2026-09-16 17:37:17', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-16 20:37:07', NULL),
('12270655-b05e-0c75-0ba9-e2bb566aadbf', 'cli-67a94724', 'cliente', '036d90ef5f68659ff759ee06786f9fa395968bb5569399b913db8577e4eede48', '2026-09-25 02:18:50', NULL, 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-18 05:18:50', NULL),
('1acc5dcb-a0f9-700b-490b-367dd2aba172', 'cond-3870be629fa25ff2', 'conductor', '7a67c8bc7e10ffb48cbf2de0e246e9b25e3e27f8dd0ad334a1a23ea17588d4b4', '2026-09-20 14:37:36', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 17:37:36', NULL),
('20997581-49ae-a97c-772a-00c7afcaef55', 'cli-86900f57', 'cliente', '6b9ecda8cef47e6b84b0a4bb2cb70e0031f5f87c8bca07f252607aab0acc440e', '2026-09-18 18:05:04', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-11 21:05:04', NULL),
('218ee609-fd1c-2f94-0ea4-f002f1126492', 'cond-102a6e5a4a414e3c', 'conductor', 'f313229ace78cc1e3f6ebf20595facae6aee4ca7f3426769be212ed8ce57336a', '2026-09-23 03:35:32', '2026-09-16 03:42:02', 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '190.97.229.61', '2026-09-16 06:35:32', NULL),
('2191af7f-7906-4640-3e7d-98c3f7171f28', 'cli-51e3723b', 'cliente', '457da3f2f08135321f5b02dfa19d922598bca7271e857d2a989428f127812c62', '2026-09-17 13:28:07', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 16:28:07', NULL),
('2316e45e-0490-b1aa-ceee-2520358a52f7', 'cli-51e3723b', 'cliente', '82106783ea9bfe73bc26e4b6f950cc6b5efd286e6f48d3831eb3f885e46d1132', '2026-09-17 05:20:09', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-10 08:20:09', NULL),
('238373ad-7773-fd16-fba2-267978cb40d1', 'cli-1d905efa', 'cliente', '83ed53d47acb31710c0c17dc71e1f84ac93b52a4046b3cb116b68652febe39b1', '2026-09-17 04:59:21', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:59:21', NULL),
('262cd2ed-6445-111e-9539-127a69fcebcf', 'cli-1bc26fc9', 'cliente', 'c042ffc311d53523dd61a35956a7c1fd0c27f0a2a5183a87ebf3d385aab74eea', '2026-09-18 17:29:36', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-11 20:29:36', NULL),
('285bcf84-edb6-7b6d-0e0d-93969951e824', 'store-1b233369', 'comercio', 'e34528486753817e8e0519f55a23e6b1cde20c187f7fe95d4c8c206a1467d1ca', '2026-09-17 17:20:39', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 20:20:39', NULL),
('2a9d5872-a5bb-acd2-18cf-4bce7835fc7f', 'cli-51e3723b', 'cliente', '9efdc58393e3e74412e1fbc89bb43f7de8b07211bf90016bb34b1e496481ec03', '2026-09-17 05:11:36', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-10 08:11:36', NULL),
('2c042db8-0054-e5c4-1680-77ff18ad4cdf', 'cond-102a6e5a4a414e3c', 'conductor', '5dbfead63a047b1b80fd52c41e18224a39a77087cca05cbc4c347173d3c98130', '2026-09-25 22:25:50', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.241', '2026-09-19 01:25:50', NULL),
('2c1853f8-2a90-05a0-1456-2a7ee6330a7a', 'cond-102a6e5a4a414e3c', 'conductor', 'b34aa1430ec1efe4af05a14917c854d2c57887953fd5dd316e0cf6beb06d6f39', '2026-09-20 15:28:33', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-13 18:28:33', NULL),
('2d026d1d-f429-4470-c9c5-e59f8fec0930', 'cli-b2588fd3', 'cliente', '5d8d37697cd7dd930d51b3cdd894486b54b88b4281c6afd78d820e533aff7fa4', '2026-09-17 04:55:00', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:55:00', NULL),
('2ec632de-0392-1eab-7489-3a868f478276', 'cond-102a6e5a4a414e3c', 'conductor', 'dbe5a950d0d90ff952a11e7b231f2d87aec8ce2b4a755dc94d6d2c3886c9423d', '2026-09-23 00:32:27', NULL, 'Dalvik/2.1.0 (Linux; U; Android 14; moto g14 Build/UTLBS34.102-91-5)', '38.137.176.175', '2026-09-16 03:32:27', NULL),
('2f39d78d-869a-3bcd-30d9-cf4e6036712d', 'cli-446af724', 'cliente', 'ae217ef93a51cfe0e5940123810f174cf00ddeb09eb539a49fcb09927009798b', '2026-09-17 05:02:43', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 08:02:43', NULL),
('351a05d1-0bf3-dc35-484d-58059ff08fda', 'DRV-20260916-3266ED', 'conductor', '57e7f671ca213d93fbf817e6cfffc02870a6493f483e6b3415e7cc8619396d32', '2026-09-23 17:36:04', '2026-09-16 17:36:48', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-16 20:36:04', NULL),
('3a1b05b9-604b-4a39-7040-c0babcb77304', 'cond-102a6e5a4a414e3c', 'conductor', '52c0ecd78c10eb0b58bc3ad5eba23fbbdb4f9e426bb9902bd725ca0829ece188', '2026-09-23 18:03:23', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-16 21:03:23', NULL),
('3b3ad0f7-b1ed-8f7b-789f-2c42a3485aff', 'DRV-20260916-3266ED', 'conductor', '5d6f8ed2e553955062e8aa020a27f9b32078a3873645297bfdded632ff454351', '2026-09-23 18:44:01', NULL, 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '190.97.229.61', '2026-09-16 21:44:01', NULL),
('3ceb8871-685d-995d-2d62-5274ab9002df', 'cond-3870be629fa25ff2', 'conductor', '8facc9a24b2b15b143d662d812af5e998b1253f10639e035f261f1c7d17361a3', '2026-09-21 01:44:17', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-14 04:44:17', NULL),
('3d6ddf03-7c98-af61-5794-3f1b13434528', 'store-1b233369', 'comercio', 'f8d7cdcd3d1275e5a7c3f8f76786f918b7bdbdcea84ff3829ac763ef684a85b6', '2026-09-17 04:46:45', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-10 07:46:45', NULL),
('3e681dd4-0f24-ca98-6333-641afd589875', 'cli-b2588fd3', 'cliente', '6337ed9316ba1954182af501c46702d20ce37a71d77af9bad9316423a2f1acf1', '2026-09-17 04:54:59', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:54:59', NULL),
('3ec73755-26e4-316e-d1a8-bb706fd90c2e', 'cond-3870be629fa25ff2', 'conductor', 'ecdb6fc36f6d2bffedf1130c0b12bdbc7dbb1e72515f8cdc9d7a4d77cbc5ac43', '2026-09-21 01:08:31', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-14 04:08:31', NULL),
('4022608e-06a9-1498-717d-1edf17d4a485', 'cli-67a94724', 'cliente', '2a9f14d4eebfacf2ebdf637c3ae08000112da82dc5f1ab154a7bd3a4c82b1b35', '2026-09-25 05:05:49', '2026-09-18 05:08:03', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-18 08:05:49', NULL),
('42225525-6867-f120-3753-8819d3c7af38', 'store-1b233369', 'comercio', '17f851ecce662efcfdbd005f9494852fbee0f4a087d70036a6295c5656fc2201', '2026-09-17 05:19:24', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-10 08:19:24', NULL),
('47f5e5dd-7f6c-d561-fa10-147964a4f976', 'cond-102a6e5a4a414e3c', 'conductor', '209b907fad5922bae1e7ccc23e106714d5cdc907a8420e7f1bbb1475efa05f34', '2026-09-23 09:44:52', '2026-09-16 09:51:02', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-16 12:44:52', NULL),
('48e6234d-3758-8042-70cc-3cfa93f1f48a', 'cond-102a6e5a4a414e3c', 'conductor', '77119683713f38f0dc4c4d751e956445a90b3444d6aaeee9f6314ac8e9d786ae', '2026-09-20 16:34:49', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-13 19:34:49', NULL),
('4d33755b-0cac-c216-c86c-aa9f75de41ed', 'cli-67a94724', 'cliente', '8bdf36cc2a01bd689163de91842316ead5bcc6407f35133646c547e63c5407a8', '2026-09-25 02:50:55', '2026-09-18 03:18:48', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-18 05:50:55', NULL),
('4e9f8302-9634-5a97-5914-a3efab176794', 'cli-20680b25', 'cliente', '99fb503ba46071719ddd2ec00b7bc72ff875b7cad71fc99ff8edf20904ae2f44', '2026-09-20 15:12:47', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-13 18:12:47', NULL),
('52f797ac-0b4f-d5a6-93e7-2d41bb46d5b0', 'cli-ac66557d', 'cliente', '7aa75c0f214a7467d9441411439a56fe56e2ba1502ca71541a8bf0c55938b5b7', '2026-09-25 02:56:44', '2026-09-18 22:39:07', 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-18 05:56:44', NULL),
('53047cab-8646-17ad-a160-37983a6927b1', 'cond-102a6e5a4a414e3c', 'conductor', 'acfa2275b2468dcf434a80fd06094e523e566563e1f98e5f0c9c05cec150d3b0', '2026-09-25 22:19:16', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.241', '2026-09-19 01:19:16', NULL),
('582f74a4-1a49-ed87-8f37-3053995cc90b', 'cond-3870be629fa25ff2', 'conductor', '43907065a3e18c2919f0a2e39084e1f6c0f6826f59ad9f7575682244d06eb317', '2026-09-20 15:21:27', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 18:21:27', NULL),
('58c267c1-e083-47ec-8d99-daabca9e079e', 'cond-102a6e5a4a414e3c', 'conductor', 'ea4ca2d49c9d4fa58f35effabc9a82f53865624da94683ebfaa8ce60a650fbb1', '2026-09-20 10:07:26', NULL, 'Dalvik/2.1.0 (Linux; U; Android 15; 23073RPBFG Build/AQ3A.240829.003)', '200.8.34.245', '2026-09-13 13:07:26', NULL),
('59604d7f-cbd8-6150-88ae-c9ea8fa730cf', 'DRV-20260916-3266ED', 'conductor', '352a33e42749b02a62f99c709941e2c0e7fcbc27c851d5886b42cd4088b4e468', '2026-09-23 17:34:06', NULL, 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-16 20:34:06', NULL),
('60369085-7dc9-92a1-2cc2-5f624f9080c1', 'cli-67a94724', 'cliente', '8e17e7dc9882a82a5e6ad20010ebaf15fe5d1dee04c380e20b7dc3be51d20d18', '2026-09-25 04:07:28', '2026-09-18 05:02:25', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-18 07:07:28', NULL),
('6074fc70-a76a-d4bd-b9b1-9bc36b273969', 'usr-root-vixydely', 'super_admin', '33adb079b003926fbad2ace83501d17d4045cbe5ca4b273bbc6ece25dee20be8', '2026-09-20 15:14:33', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-13 18:14:33', NULL),
('62a3dfaf-721e-70f5-4122-008950c41364', 'cli-d7cf174e', 'cliente', 'a7a00e32785131b9bd34ecf8deeabfea0283bc4837851d763977797ad0fe510b', '2026-09-18 18:20:55', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.241', '2026-09-11 21:20:55', NULL),
('65303cc8-f349-26d2-76e3-5247a2a60ad6', 'cli-5498e877', 'cliente', '39bad9c5287e7a816973a70989b1a776722744fb4bdc65f8d9d8b3fa8edd5292', '2026-09-18 17:50:30', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.243', '2026-09-11 20:50:30', NULL),
('6649b37b-3023-2033-4af6-518bc031992c', 'cond-102a6e5a4a414e3c', 'conductor', '391f7b7edd0959aae6c70a3b9f2127132cda1d596a1c8fced58d737ee22e178c', '2026-09-23 17:50:57', '2026-09-16 17:51:21', 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '181.208.252.202', '2026-09-16 20:50:57', NULL),
('66d13abb-6aa9-7552-e7bd-393052d5bcfd', 'DRV-20260916-646A7F', 'conductor', '010ecbe3553bf303c74bc6b47e0c770ca7fe802e419d057c30e14aa8f59485a4', '2026-09-23 19:39:46', '2026-09-16 19:41:16', 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '181.208.252.202', '2026-09-16 22:39:46', NULL),
('671f272d-4100-c542-d8c5-c803c29b4668', 'cli-67a94724', 'cliente', '4463f4421a57aaaff81b90925646b46eae315b9fc5ad213098cd0ccc3cbfdd1c', '2026-09-25 05:03:44', '2026-09-18 05:05:36', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-18 08:03:44', NULL),
('68a839ab-c410-8cf1-6c02-289c2fd34134', 'cond-102a6e5a4a414e3c', 'conductor', '85ded1175994f535a3cc621975608c0894eaf1c2647917531eb3a7bb303c8912', '2026-09-23 18:51:32', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.243', '2026-09-16 21:51:32', NULL),
('69060785-541e-660d-b995-4d1cddf58198', 'cli-20680b25', 'cliente', '5fb864560386d19d3b25b5ed0677ae32bb9778c590a8750968a11f5d01bef211', '2026-09-20 15:04:27', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.242', '2026-09-13 18:04:27', NULL),
('696c64a4-c728-72d1-933f-ff42ac4a6904', 'cli-b2588fd3', 'cliente', 'e51bcc227687a1ab3ca0cb106f426b5e02cfab35f9a04695c280e3dd2fd87087', '2026-09-17 04:55:01', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:55:01', NULL),
('6a2310b7-be6d-66f8-9c95-4bc4d59d9258', 'cond-102a6e5a4a414e3c', 'conductor', '3f28c7b6487e766bb8b0dad6e374d5414a2de15b04d5c5b252803451da840d48', '2026-09-20 19:53:29', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.242', '2026-09-13 22:53:29', NULL),
('6c38de78-4c7d-48da-ec97-3d973b6b7671', 'store-1b233369', 'comercio', 'ae698a06a2a32d1aee95ed2ec813027d2717223afa55a96c463238628da57309', '2026-09-17 14:09:55', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 17:09:55', NULL),
('71abb318-ebd5-6f78-6a70-8b7b4252685e', 'cond-102a6e5a4a414e3c', 'conductor', 'c1e69b255f6de950a8176605821824e85ed9e335aef414ad69b3b3670fc5f32a', '2026-09-20 16:39:40', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.246', '2026-09-13 19:39:40', NULL),
('72ece10e-f274-694b-e828-4e411614b449', 'cli-64b91d5d', 'cliente', 'efded2f858ba7daad960763af7cd0880b1be3ecadb646bd4d86289721d065598', '2026-09-18 18:00:39', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-11 21:00:39', NULL),
('78a134cf-1d06-c8b3-d753-c9b85311a6c6', 'cond-3870be629fa25ff2', 'conductor', 'e17ffa982a1a145f10d07f7a195156e23a2f67fd4b77b98b255947a973dea510', '2026-09-20 14:37:32', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 17:37:32', NULL),
('7b1e82b1-dfb2-75f6-c685-edf1150dcd68', 'cli-67a94724', 'cliente', '5fc7d173bc65389fec57ead4f38a99950f23d40aca20b701ca0d1d3ff4a6c74c', '2026-09-25 05:43:31', '2026-09-18 05:43:34', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-18 08:43:31', NULL),
('7d6454d1-3c97-5279-bc9b-2d608b5940ad', 'cond-3870be629fa25ff2', 'conductor', '98b94529565f9cca461355d062a5b910b8edd7b80fdec4f88226aa41138f62b7', '2026-09-20 04:43:09', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 07:43:09', NULL),
('80893717-b5ec-c6fa-fa02-6c4260eaba78', 'store-1b233369', 'comercio', '6422526038a20b8b3c54f0cca43c6f4f0310838f80c788b88ac72ac1f9bd2a7a', '2026-09-17 17:02:03', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 20:02:03', NULL),
('817bd374-7b05-a6e4-6cb4-e301d0d1cda3', 'store-1b233369', 'comercio', '88ee1e36ec790c92b868fc8e6fbcd7c795fa7fd59796cbaf09ff0369627779c9', '2026-09-17 14:57:18', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 17:57:18', NULL),
('82e06fa3-a524-4e88-606d-a3ec9417e841', 'cond-3870be629fa25ff2', 'conductor', 'ec91f3f7c164ff802720b84f47aed8a7976d570897e2ab0eff3b2502f1a1c9f5', '2026-09-20 14:37:09', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 17:37:09', NULL),
('82f209b8-4aeb-40f5-b4be-cb0630c55684', 'cli-3a44a9e3', 'cliente', 'edbe08e7357898abdd51e82b5dc06afbb3b6e84e37399268e1d8719b9e5d793b', '2026-09-16 02:24:25', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-09 05:24:25', NULL),
('86608eea-1401-d396-2cd4-6ccad369eba4', 'cli-1d905efa', 'cliente', 'cfc4ff5cd53fe915d00582517ab388b408327a264a4e7c37074d1bc61a723f83', '2026-09-17 04:59:19', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:59:19', NULL),
('86a57974-a54b-8a70-4276-b64c332f5c21', 'cond-102a6e5a4a414e3c', 'conductor', '84a9c5a56730c7ab4272bc0766252acfbb57b4297eac7b38136a60f4f13c8a1d', '2026-09-25 22:19:17', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.243', '2026-09-19 01:19:17', NULL),
('8a12e596-2126-f2b8-6389-389340cb04d5', 'cond-102a6e5a4a414e3c', 'conductor', 'b1898601dec3e49dc22a7b5dbf02760e01f20d78e9883fcbe9dc8adbce456a05', '2026-09-22 13:32:39', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-15 16:32:39', NULL),
('8a43298c-8e72-3cd3-d04a-2f35cade6e19', 'DRV-20260916-646A7F', 'conductor', '66ae52e56f96838c7ca7a74aaaed98708deca2da9e9b62ee8e8b2a9816a4d5ee', '2026-09-23 23:13:13', NULL, 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-17 02:13:13', NULL),
('8b8b1559-171f-ac7e-c02a-897fc8f8621f', 'cond-3870be629fa25ff2', 'conductor', '76716c51863ad0d462b933fcdca813d4f61675d0e71b48d997f07c12ece61baf', '2026-09-20 05:02:54', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 08:02:54', NULL),
('8f003ed2-bdd8-8438-2eb5-c8e91cdba48b', 'cli-51e3723b', 'cliente', '9ab19c72ebd775d5ff4635c8bc2bf895adda1d0409df68ba1f9ac852f08b5b89', '2026-09-17 05:01:22', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-10 08:01:22', NULL),
('934ce1af-b45e-f191-9177-0f418e3635cb', 'DRV-20260916-646A7F', 'conductor', '28d0c1d83d0404ee645c944247459bb003a949ee689150896d75ab96ee0b3136', '2026-09-23 19:38:23', '2026-09-16 19:39:44', 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '181.208.252.202', '2026-09-16 22:38:23', NULL),
('94dd7422-a2e8-fed2-13f9-4d1d524b6219', 'cond-3870be629fa25ff2', 'conductor', '3ee7a62d71d3473004eb8d9430ca5cdb702970cb63e0232bcc84dc5032089697', '2026-09-20 15:18:51', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 18:18:51', NULL),
('95e3198a-06df-2061-9d3e-351c4b4ee819', 'cli-b2588fd3', 'cliente', '43367f654fe4977605e02bec645ea33d6a9ed46a99249e8ca4643fac13f31e11', '2026-09-17 04:55:00', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:55:00', NULL),
('976b472a-cda9-c743-f94f-bd324657a298', 'store-1b233369', 'comercio', '9df3d05ee686e80b694419e1d4b28a04ad5ae1961a219b449311ee703977b907', '2026-09-17 14:46:08', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 17:46:08', NULL),
('9795d66a-1def-2ef9-dd36-fbe973dd9d48', 'cond-102a6e5a4a414e3c', 'conductor', 'f7b9a6b52f7547e444af482bd96062bdb8380d9037d6a20bed1cc96773b4aa77', '2026-09-23 02:19:07', '2026-09-16 02:19:21', 'Dalvik/2.1.0 (Linux; U; Android 14; moto g14 Build/UTLBS34.102-91-5)', '38.137.176.175', '2026-09-16 05:19:07', NULL),
('98087aa8-2abb-2d50-753a-403dfac28dd1', 'cond-102a6e5a4a414e3c', 'conductor', '5477bdce30ee90db507f291dbba735eb4cd72566da133338895ed7a4531ae9db', '2026-09-20 14:59:08', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-13 17:59:08', NULL),
('982a29e2-b88c-e6e9-3506-e19768e8bebc', 'DRV-20260916-646A7F', 'conductor', '2c1bf38753f06b242dc1480d9c142c35874242c5d5a868fa04729f15979d8cc6', '2026-09-23 19:37:50', NULL, 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '181.208.252.202', '2026-09-16 22:37:50', NULL),
('985e7815-fd21-c35f-0bef-8ea5859f04d1', 'cli-1d905efa', 'cliente', '71266b9251b997656558086e89471f727fe1760e1e697834c5ef9a4d70d5f049', '2026-09-17 04:59:20', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:59:20', NULL),
('9896b089-e719-2baa-27be-dd44db85b5a7', 'cli-51e3723b', 'cliente', '874e29f79c2753b23109d434475e772bef9235b70c548778a95873bd987f9f8a', '2026-09-17 13:21:30', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 16:21:30', NULL),
('9a96a070-1898-7559-faf6-9a771d454d9d', 'cli-446af724', 'cliente', 'f884641b808aa234467d1097ff88dacd62a74ed89d581923f2c04137fb5cb3b7', '2026-09-17 05:02:45', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 08:02:45', NULL),
('9ba8f930-11f9-e605-f467-54e6534d4215', 'cond-3870be629fa25ff2', 'conductor', '720f6ca38f79dc2092a74f06299d6362b85f82d8b2baa3178cc62c5cb0276ab1', '2026-09-20 17:28:16', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 20:28:16', NULL),
('9bf03bd3-1a7b-e0b3-2e73-7e8fee167ad2', 'cond-102a6e5a4a414e3c', 'conductor', '0a0e8d425d05916a9943a0ad7a2a921564ebadafdac02e436cd2062bd64cb0ab', '2026-09-20 14:41:58', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-13 17:41:58', NULL),
('9e3758cc-f1f8-9a7e-4d77-028759ad0488', 'cli-70557aa0', 'cliente', '3cb78c7d6059399492b84329ae300d0e1afb2b2e0c63102f278cb7518b08fd21', '2026-09-20 10:16:54', NULL, 'Dalvik/2.1.0 (Linux; U; Android 15; 23073RPBFG Build/AQ3A.240829.003)', '200.8.34.246', '2026-09-13 13:16:54', NULL),
('9f6552fd-98fa-afc4-3680-0f5027ba802f', 'cond-102a6e5a4a414e3c', 'conductor', 'eec1ee9520d6ee88bfe9200458c5eb8f07765d04e87bd2beb9a9b80cdc627746', '2026-09-20 14:39:35', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.245', '2026-09-13 17:39:35', NULL),
('9fc58d34-c7f9-2c5a-f7b4-322273f258fa', 'cli-ac66557d', 'cliente', 'bbacebd2defec7a3af015b831b2572ff1015c29ae85899ac7859a21296b9c791', '2026-09-25 02:50:02', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-18 05:50:02', NULL),
('a12827cf-0e41-4a5a-437f-ab5e108b633d', 'cli-67a94724', 'cliente', '79cb08db1764e1a8051b58547738462c499d7f3378435efb0d77be9278a5af5c', '2026-09-25 05:42:42', '2026-09-18 05:43:30', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-18 08:42:42', NULL),
('a1cee0c0-6370-2960-24e3-ae170bc52a98', 'cli-2329d58b', 'cliente', '440939f91c693edbea4942c2731ae0150b1a2d2f1466017b51841120961a3180', '2026-09-18 18:11:07', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.246', '2026-09-11 21:11:07', NULL),
('a53dfe86-4f59-b278-471e-bf2f155c8431', 'usr-root-vixydely', 'super_admin', '12e670d1ec9444ba73b5886664e1319944c57c5c2e92bbb27e1d13e3798e83d1', '2026-09-20 17:28:04', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-13 20:28:04', NULL),
('a5e06f3c-8f24-42c9-f475-e67c8f7401a2', 'cli-413887b7', 'cliente', '7de1e2fc76f6760fd4ab0277cce4b566289bb153e69874f9f825b912094ef458', '2026-09-17 04:54:03', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-10 07:54:03', NULL),
('a7149e2d-e670-b6bb-11df-17a8f22b4d85', 'DRV-20260916-646A7F', 'conductor', 'f5bbbf9ddabadd1e31e7f38e3baa25f1bbebc7d6754b3af261da1f776cb88990', '2026-09-24 01:01:45', '2026-09-17 01:06:42', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-17 04:01:45', NULL),
('aa62b748-a831-a4eb-a479-e2517dc0cf69', 'cli-1450edba', 'cliente', '385ca92f2052b29e0bb449854cebc04585d34764f1d6f1d7ae8ff5bb1151489d', '2026-09-17 04:51:14', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:51:14', NULL),
('acac448b-c29f-4cff-2b60-2d96fbff301e', 'store-1b233369', 'comercio', '54fc34e1c32e74fe42a619fa0c15360d9a3aaf21ecd8a9590b5b88d505de4f1b', '2026-09-17 17:13:39', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 20:13:39', NULL),
('ade93955-6477-b0de-a145-5bde31529357', 'DRV-20260916-3266ED', 'conductor', '7981dfe4bda1a862e9ab687cfd7774a115fbdd5ae7150477ddd41228cde935fd', '2026-09-23 17:34:07', '2026-09-16 17:36:01', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-16 20:34:07', NULL),
('b17ca7c4-6209-3d55-faf4-5c4f843d0242', 'DRV-20260916-646A7F', 'conductor', 'a1fae53ca46a1c99c446e69784acf8924e45a199141e2b1e6ac94ea773ff56e0', '2026-09-24 19:28:18', '2026-09-17 19:29:04', 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '181.208.252.202', '2026-09-17 22:28:18', NULL),
('b33c6587-fe42-b3ea-9690-eeed5490ac69', 'cond-102a6e5a4a414e3c', 'conductor', '85accd5475def85c781039e3389d818f858ab0a3c44cfc55b539b3f302fc1d72', '2026-09-25 22:09:07', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.241', '2026-09-19 01:09:07', NULL),
('b487257b-a8ab-5d1c-ad91-4380bcc59831', 'DRV-20260916-646A7F', 'conductor', '08b15516fd0cb0b6ab8260aa7db41e651fe9246c69dcf4b990a90c44f2d36647', '2026-09-24 01:40:13', '2026-09-17 01:52:32', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-17 04:40:13', NULL),
('b6661fb0-61e8-bdfe-c87c-5c2a27915004', 'DRV-20260916-646A7F', 'conductor', 'ae5fd53b98b6f1cfc3350af781414c7968e38728fa9194774e9ca9dceec4e3b9', '2026-09-23 21:24:33', '2026-09-16 21:25:07', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-17 00:24:33', NULL),
('b6ce9573-440f-824b-cf13-27958a5dc819', 'DRV-20260916-646A7F', 'conductor', '95b40354b7b2056e917650918cc9d88bd4e9d50b25a6e7ca4d8ccef5b432fb6a', '2026-09-23 20:59:02', '2026-09-16 21:03:47', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-16 23:59:02', NULL),
('b768decd-d507-5f48-741f-280fadc0b4dd', 'cli-c25be149', 'cliente', 'b23b89c4bd369d6a96f42ab04cd790ea0de9e6026ae6c72c38777aee9895cf0a', '2026-09-23 03:50:13', '2026-09-16 03:56:00', 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '181.208.252.202', '2026-09-16 06:50:13', NULL),
('b7df24a6-773f-43a4-698e-344a15cf4dce', 'cli-51e3723b', 'cliente', 'f3bd37f072a0eebe669612ca95649205e598a40580d49aa6a3a97aeca95f4073', '2026-09-17 05:11:40', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-10 08:11:40', NULL),
('b9016357-da2a-8dcf-378e-42467eacb001', 'cli-51e3723b', 'cliente', '53fae346f690b2408ebeee28e8ce9eda5253364cf10ea6994f2a505dbabd0705', '2026-09-17 13:26:55', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 16:26:55', NULL),
('c030b9bf-09ac-8ff8-829d-1e3e96218de6', 'cli-67a94724', 'cliente', 'ffd71cd65717b166736987ef9a0df32ccb11ca6648bec61a1a0b2659519df3db', '2026-09-25 05:43:34', '2026-09-18 05:44:39', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-18 08:43:34', NULL),
('c0b9b606-9e5e-3dbe-e84e-bb7cb89f4a3f', 'DRV-20260916-646A7F', 'conductor', '4dbbf2f5a8ba810c594ee6bc2cc9e3becee262af06b913658b123240c4548b16', '2026-09-24 00:17:03', '2026-09-17 00:18:39', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-17 03:17:03', NULL),
('c1242e2a-2515-28f6-f2bc-3102003d0786', 'DRV-20260916-646A7F', 'conductor', 'ed14f1d287b6e195b9315d3bf2fbae8df7d8dada625df3788364f1c22221b365', '2026-09-23 19:39:46', NULL, 'Dalvik/2.1.0 (Linux; U; Android 12; TECNO KI5k Build/SP1A.210812.016)', '181.208.252.202', '2026-09-16 22:39:46', NULL),
('c4541fb6-30a4-ecaa-20c0-914982e05f59', 'cond-7f7a379c8535562a', 'conductor', '8c62539a92ff47caff663046b39114e765ea5ba920061e3d746d90b182819ebd', '2026-09-22 13:40:42', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:c30a:312b:105b:b0c0', '2026-09-15 16:40:42', NULL),
('c6c632ab-7837-4008-f5a7-4a2119062358', 'COM-20260912-EC20FC', 'comercio', 'd18d41622b032d3fd9311eb55297b6481347e52d34de1a452da5509ec61f9dc8', '2026-09-24 20:34:49', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '181.208.252.202', '2026-09-17 23:34:49', NULL),
('c7e682f3-d140-d0db-698a-fae1da477aa2', 'DRV-20260916-646A7F', 'conductor', '9e96fa7f7868583af4c383a7538f8161857f63a1a77e98ea30ac91fd5ac2026d', '2026-09-24 00:49:39', '2026-09-17 00:59:21', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-17 03:49:39', NULL),
('cac88e5b-bdc7-b806-9ee8-f69537d56a24', 'cli-446af724', 'cliente', '0b9d10a633ee9ca0b91b45e1e0bcc3b17814da81c408f3b71b280b018b91a7e5', '2026-09-17 05:02:46', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 08:02:46', NULL),
('cbe7772f-2739-2ab9-dba3-9509483d6d33', 'DRV-20260916-646A7F', 'conductor', 'ebda38cd8d02e839c098d3af1d5356a8dd0bd2600cd3d65edf8e756849284865', '2026-09-23 23:39:52', '2026-09-16 23:42:18', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-17 02:39:52', NULL),
('cd487fc3-08d8-8152-27cb-654a10501223', 'cond-102a6e5a4a414e3c', 'conductor', 'ce3a0f3b27ddc151f6ab0b5691a19b9cf8f569a9d3a53b3122277a75e64c288b', '2026-09-20 15:37:08', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.241', '2026-09-13 18:37:08', NULL),
('ceee5d81-64c2-b3d7-bac8-83111711020d', 'store-1b233369', 'comercio', '9c8080d1b19c8fba5edbb5f656ca255ae6f7f6bd68cf6f075fbfb56f10b39e7d', '2026-09-17 05:19:25', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-10 08:19:25', NULL),
('d0e446fa-5280-3407-6d03-07be95971870', 'DRV-20260916-646A7F', 'conductor', '11f1643ad998739fa94757d77ff31524645cbf69401c3bef40ba5f2f7d4cbedb', '2026-09-24 01:29:14', '2026-09-17 01:39:15', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-17 04:29:14', NULL),
('d88184e0-9f91-6d7c-3b49-b0c99ded26ca', 'DRV-20260916-646A7F', 'conductor', '6bf1040660ded632cfc23cb7f6f2b0243be723d3a8c312996dab9dcdc3e26065', '2026-09-24 01:13:43', '2026-09-17 01:19:04', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-17 04:13:43', NULL),
('d897097d-5d2d-68eb-bad0-fffaef7dc2a9', 'DRV-20260916-646A7F', 'conductor', 'b0a6efdc22990aa271c9ab7439e6b2b72728721bc477b03359ae9c337a66277a', '2026-09-24 00:27:47', '2026-09-17 00:29:15', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-17 03:27:47', NULL),
('dacde11f-2a12-7e52-ba08-3e141425658d', 'cli-446af724', 'cliente', 'e02a7cbf9149a442a764a44c6a02db0fa414c707b07d6203489c86e451d6db46', '2026-09-17 05:02:45', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 08:02:45', NULL),
('df2671fa-02bb-817a-8665-9558895a9abc', 'cond-3870be629fa25ff2', 'conductor', 'c807b91393f4d73f36df96e304c1a4d9af648c2f20ed9895133161ba48ebffaa', '2026-09-20 18:21:40', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 21:21:40', NULL),
('df8edc02-1b5c-bd82-4f31-557da056bc20', 'DRV-20260916-646A7F', 'conductor', '3f47ea2d0f47a936172caa342eec518bb16093e621317ebb1d764ed88913e1c6', '2026-09-24 00:08:58', '2026-09-17 00:10:44', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-17 03:08:58', NULL),
('dfb336fc-9265-caac-d615-d34cf0bc1a6d', 'store-1b233369', 'comercio', 'ea3d871b9fb23d70b4afdfe5e4e633dd9ebdfed171bcef1c526049a88b91d9ac', '2026-09-17 14:14:06', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 17:14:06', NULL),
('e0be9ea5-8376-0784-8a5d-26ea60a309e2', 'cond-e5bbad2399ba930a', 'conductor', '4086845f8785247990f0e6343e9897b2bb29abca496b44461d7d182c7cf27c8a', '2026-09-20 04:03:58', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 07:03:58', NULL),
('e2107a4e-683e-c066-0dbc-8a69447f0821', 'DRV-20260916-646A7F', 'conductor', 'b149ec204dda729e7a1e612e9393007a384028ec36f7e79a0a7ab8ceece15026', '2026-09-23 23:55:21', NULL, 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-17 02:55:21', NULL),
('e3f495a0-5edf-788f-4e38-528f77a6e324', 'cond-102a6e5a4a414e3c', 'conductor', 'aae880ef113a629465aee6169b0084290a6230a88387e0e30c20cbd010af0d3a', '2026-09-23 18:08:17', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.241', '2026-09-16 21:08:17', NULL),
('e49ce9c4-3eb7-2edb-f36e-409b5e864f65', 'cli-67a94724', 'cliente', 'd4a4011d30e762e620422fec0dd22fc15c2d6203afcaecb10b1f66788dee4c6d', '2026-09-25 04:06:18', '2026-09-18 04:07:25', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '181.208.252.202', '2026-09-18 07:06:18', NULL),
('e61d34a6-ec14-0ac8-91d4-c6216252716e', 'cond-3870be629fa25ff2', 'conductor', '741cfc040343ab37c112e2e6e63d00c27ff09a423e9b000557a671eea8e71d78', '2026-09-20 15:11:38', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 18:11:38', NULL),
('ecfc15ba-337a-a758-5c82-2c268fa92b5b', 'DRV-20260916-646A7F', 'conductor', 'e254f6a6aea26f33e8f8d32d2536b5686cef547d2d848a1f034d8cd3afe667fe', '2026-09-24 02:04:50', '2026-09-17 02:07:11', 'Dalvik/2.1.0 (Linux; U; Android 11; Redmi Note 8 Build/RKQ1.201004.002)', '190.97.229.61', '2026-09-17 05:04:50', NULL),
('f600f256-5d51-ee48-24d3-c56c6ed5dde4', 'cli-1d905efa', 'cliente', 'b31bdcf3db66ba4cf4e5661c332044f336e36666c1f35933e35659c5e54cbfdc', '2026-09-17 04:59:21', NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-ES) WindowsPowerShell/5.1.26100.9444', '190.89.30.149', '2026-09-10 07:59:21', NULL),
('f784d23f-47b6-f68a-c579-c91a6de4f60b', 'cond-3870be629fa25ff2', 'conductor', '54fb4df5e2eee7e1563db90566263515b3a526b07a3ce42058dccee9b94d593b', '2026-09-20 16:40:21', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '190.89.30.149', '2026-09-13 19:40:21', NULL),
('fa0bf463-9cfe-3516-b164-32cb0d4c2611', 'cli-782bffc0', 'cliente', '9707586b2b4687f88e7a18ae8f31da717779e58f6933b97ebf72cd222193eae8', '2026-09-18 18:15:11', NULL, 'Dalvik/2.1.0 (Linux; U; Android 13; 2209116AG Build/TKQ1.221114.001)', '200.8.34.244', '2026-09-11 21:15:11', NULL),
('fb2e61d0-59dd-f4e8-db60-5bdd8c02c22e', 'cli-51e3723b', 'cliente', 'fa38792f801ba98db513fbd858abb921dd02fd9119dfe693670ac70f5bd7e32b', '2026-09-17 13:53:04', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 16:53:04', NULL),
('fbf251b4-fd01-e4f2-1eac-758250cadf2e', 'cond-3870be629fa25ff2', 'conductor', 'dfe44d00f08c0ebe62101c560a4b38f0292809a9e173a4e248ec865f44230873', '2026-09-20 19:56:53', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '186.164.51.226', '2026-09-13 22:56:53', NULL),
('fc106e63-0130-dfac-ed88-928da94b2a36', 'cli-51e3723b', 'cliente', '8dc1a0325a890480c6a12a41d0804965cd0e70a27c1b99d8e5604242836c7c48', '2026-09-17 13:42:54', NULL, 'Dalvik/2.1.0 (Linux; U; Android 16; Infinix X6873 Build/BP2A.250605.031.A3)', '2803:c000:8:4c23:52ad:a096:2d88:6e79', '2026-09-10 16:42:54', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_liquidacion`
--

CREATE TABLE `solicitudes_liquidacion` (
  `id` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` enum('comercio','conductor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_solicitado_usd` decimal(12,2) NOT NULL,
  `monto_solicitado_bs` decimal(14,2) NOT NULL,
  `tasa_bcv_aplicada` decimal(10,4) NOT NULL,
  `metodo_pago` enum('transferencia','pago_movil') COLLATE utf8mb4_unicode_ci NOT NULL,
  `banco_destino` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuenta_telefono_destino` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titular_destino` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cedula_rif_destino` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada','pagada','expirada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `motivo_rechazo` text COLLATE utf8mb4_unicode_ci,
  `revisado_por` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revisado_en` timestamp NULL DEFAULT NULL,
  `pagado_en` timestamp NULL DEFAULT NULL,
  `referencia_bancaria` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comprobante_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monto_pagado_usd` decimal(12,2) DEFAULT NULL,
  `movimiento_wallet_id` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `liquidacion_financiera_id` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `solicitudes_liquidacion`
--
DELIMITER $$
CREATE TRIGGER `trg_vixy_fin_liquidacion_pagada` AFTER UPDATE ON `solicitudes_liquidacion` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `telemetria_dispositivos`
--

CREATE TABLE `telemetria_dispositivos` (
  `id` int NOT NULL,
  `usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` enum('conductor','comercio','cliente') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitud` decimal(10,7) NOT NULL DEFAULT '0.0000000',
  `longitud` decimal(10,7) NOT NULL DEFAULT '0.0000000',
  `bateria` int DEFAULT NULL,
  `online` tinyint(1) NOT NULL DEFAULT '1',
  `app_version` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `telemetria_dispositivos`
--

INSERT INTO `telemetria_dispositivos` (`id`, `usuario_id`, `tipo_usuario`, `nombre`, `latitud`, `longitud`, `bateria`, `online`, `app_version`, `ultima_actualizacion`) VALUES
(1, 'COM-20260906-E76425', 'comercio', 'Perros REPO', 10.4910000, -66.8530000, 100, 1, '2.0.0-shop', '2026-09-07 20:14:51'),
(232, 'COM-20260910-E71CCC', 'comercio', 'Perros REPO2', 10.4910000, -66.8530000, 100, 1, '2.0.0-shop', '2026-09-10 05:39:32'),
(233, 'COM-20260912-EC20FC', 'comercio', 'El &quot;Ya tu sabe&quot;', 10.4946600, -66.8470900, 100, 1, '2.0.0-shop', '2026-09-18 08:44:44'),
(401, 'COM-20260912-4418EF', 'comercio', 'Panificadora El Imperio', 9.9184720, -69.6185100, 54, 1, '2.0.0-shop', '2026-09-13 22:03:06'),
(5141, 'COM-20260913-FF650A', 'comercio', 'La trampita de mickey', 9.9051610, -67.3581953, 85, 1, '2.0.0-shop', '2026-09-13 23:03:26'),
(9608, 'gps-test-20260916', 'conductor', 'GPS Test', 10.5001230, -66.9004560, NULL, 1, 'diagnostico', '2026-09-17 04:14:47'),
(9629, 'gps-test-api-20260917', 'conductor', 'GPS API Test', 10.5012340, -66.9012340, NULL, 1, 'diagnostico-api', '2026-09-17 04:20:28'),
(9632, 'DRV-20260916-646A7F', 'conductor', 'Jesus', 0.0000000, 0.0000000, NULL, 0, 'cleanup', '2026-09-17 04:43:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transacciones_billetera`
--

CREATE TABLE `transacciones_billetera` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` enum('conductor','comercio','cliente') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_movimiento` enum('ingreso','egreso') COLLATE utf8mb4_unicode_ci NOT NULL,
  `concepto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_usd` decimal(10,2) NOT NULL,
  `saldo_anterior_usd` decimal(10,2) NOT NULL,
  `saldo_nuevo_usd` decimal(10,2) NOT NULL,
  `referencia_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `transacciones_billetera`
--

INSERT INTO `transacciones_billetera` (`id`, `usuario_id`, `tipo_usuario`, `tipo_movimiento`, `concepto`, `monto_usd`, `saldo_anterior_usd`, `saldo_nuevo_usd`, `referencia_id`, `creado_en`) VALUES
('trx-074c23d86ade5c11', 'cond-3870be629fa25ff2', 'conductor', 'ingreso', 'Recarga de saldo aprobada por administración', 5.00, 0.00, 5.00, 'rec-af56ba0d4ccc9b1b', '2026-09-13 18:20:27'),
('trx-1b4ccc0bc11e36f3', 'cli-ac66557d', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 10.00, 20.00, 'rec-3c5fe721a82f2f86', '2026-09-18 14:24:13'),
('trx-2f4d3e65af72083d', 'cli-67a94724', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 50.00, 0.00, 50.00, 'rec-2ab6b937e1bcff25', '2026-09-18 06:18:05'),
('trx-392229a1788d95ae', 'cond-102a6e5a4a414e3c', 'conductor', 'ingreso', 'Recarga de saldo aprobada por administración', 5.00, 0.00, 5.00, 'rec-cb5ee62389dd5aff', '2026-09-13 19:36:02'),
('trx-3a590f97302e12a1', 'cli-ac66557d', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 0.00, 10.00, 'rec-6372ad744572ea03', '2026-09-18 06:18:06'),
('trx-5003734aa0daa5d3', 'DRV-20260916-3266ED', 'conductor', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 10.00, 20.00, 'rec-d1be98276e13525a', '2026-09-16 20:35:28'),
('trx-7cbe6545fd42ed75', 'cli-67a94724', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 20.00, 110.00, 130.00, 'rec-9e3c388d02af5687', '2026-09-18 08:43:25'),
('trx-96a3711e4f3f9521', 'cli-67a94724', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 50.00, 50.00, 100.00, 'rec-a6ee8af1e4e9a325', '2026-09-18 07:07:17'),
('trx-9bb428bf2eead229', 'cli-ac66557d', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 20.00, 30.00, 'rec-069c0a4424d9e164', '2026-09-18 14:57:43'),
('trx-a51aa3db13d24083', 'DRV-20260916-646A7F', 'conductor', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 0.00, 10.00, 'rec-938fd9469962063c', '2026-09-16 22:39:16'),
('trx-a8a9fe461cbc0696', 'cond-7f7a379c8535562a', 'conductor', 'ingreso', 'Recarga de saldo aprobada por administración', 5.00, 0.00, 5.00, 'rec-63c563bd5ba1e4ed', '2026-09-16 03:08:48'),
('trx-aaab19e93143a763', 'cli-c25be149', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 0.00, 10.00, 'rec-7b13389f20006909', '2026-09-16 06:58:28'),
('trx-b24fc9c743fca39e', 'cli-ac66557d', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 30.00, 40.00, 'rec-069c0a4424d9e164', '2026-09-18 14:57:43'),
('trx-b568939dbe4ce728', 'DRV-20260916-3266ED', 'conductor', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 0.00, 10.00, 'rec-debb5ab3842f6591', '2026-09-16 20:35:15'),
('trx-d2b746ae7e22e7e6', 'cli-67a94724', 'cliente', 'ingreso', 'Recarga de saldo aprobada por administración', 10.00, 100.00, 110.00, 'rec-f8844351e313aaf9', '2026-09-18 08:05:24'),
('trx-fb27ca77821cfdcf', 'cond-e5bbad2399ba930a', 'conductor', 'ingreso', 'Recarga de saldo aprobada por administración', 5.00, 0.00, 5.00, 'rec-6aa64b9db7d58', '2026-09-13 18:20:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones_gps_conductores`
--

CREATE TABLE `ubicaciones_gps_conductores` (
  `id` bigint NOT NULL,
  `conductor_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pedido_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `precision_metros` decimal(8,2) DEFAULT NULL,
  `velocidad_kmh` decimal(8,2) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ubicaciones_gps_conductores`
--

INSERT INTO `ubicaciones_gps_conductores` (`id`, `conductor_id`, `pedido_id`, `latitud`, `longitud`, `precision_metros`, `velocidad_kmh`, `creado_en`) VALUES
(2, 'cond-3870be629fa25ff2', NULL, 10.52325270, -66.92118080, 20.20, 0.00, '2026-09-13 21:21:45'),
(5, 'cond-3870be629fa25ff2', NULL, 10.52325270, -66.92118080, 20.20, 0.00, '2026-09-13 21:22:16'),
(8, 'cond-3870be629fa25ff2', NULL, 10.52341670, -66.92109130, 3.00, 0.00, '2026-09-13 21:22:20'),
(11, 'cond-3870be629fa25ff2', NULL, 10.52338890, -66.92105310, 6.30, 1.00, '2026-09-13 21:22:25'),
(14, 'cond-3870be629fa25ff2', NULL, 10.52338900, -66.92105110, 6.90, 0.00, '2026-09-13 21:22:30'),
(17, 'cond-3870be629fa25ff2', NULL, 10.52338420, -66.92105200, 5.40, 0.00, '2026-09-13 21:22:35'),
(20, 'cond-102a6e5a4a414e3c', NULL, 9.90514450, -67.35824370, 26.70, 0.00, '2026-09-13 22:53:29'),
(23, 'cond-102a6e5a4a414e3c', NULL, 9.90513930, -67.35824620, 9.80, 0.00, '2026-09-13 22:53:34'),
(26, 'cond-102a6e5a4a414e3c', NULL, 9.90514080, -67.35824350, 9.10, 3.00, '2026-09-13 22:53:39'),
(29, 'cond-102a6e5a4a414e3c', NULL, 9.90513720, -67.35825830, 12.90, 2.00, '2026-09-13 22:53:44'),
(32, 'cond-102a6e5a4a414e3c', NULL, 9.90514460, -67.35825930, 9.00, 0.00, '2026-09-13 22:53:49'),
(35, 'cond-102a6e5a4a414e3c', NULL, 9.90514950, -67.35826420, 7.80, 0.00, '2026-09-13 22:53:54'),
(38, 'cond-102a6e5a4a414e3c', NULL, 9.90515380, -67.35825970, 7.90, 0.00, '2026-09-13 22:53:59'),
(41, 'cond-102a6e5a4a414e3c', NULL, 9.90516800, -67.35826900, 10.00, 7.00, '2026-09-13 22:54:04'),
(44, 'cond-102a6e5a4a414e3c', NULL, 9.90516950, -67.35819150, 17.80, 3.00, '2026-09-13 22:54:10'),
(47, 'cond-102a6e5a4a414e3c', NULL, 9.90516950, -67.35819150, 17.80, 3.00, '2026-09-13 22:54:21'),
(50, 'cond-102a6e5a4a414e3c', NULL, 9.90516950, -67.35819150, 17.80, 3.00, '2026-09-13 22:54:24'),
(53, 'cond-102a6e5a4a414e3c', NULL, 9.90513110, -67.35821800, 16.10, 2.00, '2026-09-13 22:54:30'),
(56, 'cond-102a6e5a4a414e3c', NULL, 9.90513110, -67.35821800, 16.10, 2.00, '2026-09-13 22:54:35'),
(59, 'cond-102a6e5a4a414e3c', NULL, 9.90513110, -67.35821800, 16.10, 2.00, '2026-09-13 22:54:40'),
(62, 'cond-102a6e5a4a414e3c', NULL, 9.90513110, -67.35821800, 16.10, 2.00, '2026-09-13 22:54:45'),
(65, 'cond-102a6e5a4a414e3c', NULL, 9.90513110, -67.35821800, 16.10, 2.00, '2026-09-13 22:54:56'),
(68, 'cond-102a6e5a4a414e3c', NULL, 9.90517480, -67.35820320, 16.20, 0.00, '2026-09-13 22:54:59'),
(71, 'cond-102a6e5a4a414e3c', NULL, 9.90517480, -67.35820320, 16.20, 0.00, '2026-09-13 22:55:04'),
(74, 'cond-102a6e5a4a414e3c', NULL, 9.90517510, -67.35820400, 27.50, 0.00, '2026-09-13 22:55:09'),
(77, 'cond-102a6e5a4a414e3c', NULL, 9.90509940, -67.35808940, 59.00, 5.00, '2026-09-13 22:55:14'),
(80, 'cond-102a6e5a4a414e3c', NULL, 9.90511460, -67.35814240, 37.80, 0.00, '2026-09-13 22:55:19'),
(83, 'cond-102a6e5a4a414e3c', NULL, 9.90513100, -67.35821570, 12.00, 0.00, '2026-09-13 22:55:24'),
(86, 'cond-102a6e5a4a414e3c', NULL, 9.90513500, -67.35822390, 10.10, 0.00, '2026-09-13 22:55:29'),
(89, 'cond-102a6e5a4a414e3c', NULL, 9.90513920, -67.35822370, 8.30, 0.00, '2026-09-13 22:55:34'),
(92, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:55:40'),
(95, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:55:45'),
(98, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:55:50'),
(101, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:55:55'),
(104, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:00'),
(107, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:05'),
(110, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:10'),
(113, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:15'),
(116, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:20'),
(119, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:25'),
(122, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:30'),
(125, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:35'),
(128, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35823320, 8.10, 0.00, '2026-09-13 22:56:39'),
(131, 'cond-102a6e5a4a414e3c', NULL, 9.90515480, -67.35822450, 17.60, 0.00, '2026-09-13 22:56:44'),
(134, 'cond-102a6e5a4a414e3c', NULL, 9.90514140, -67.35822480, 29.30, 0.00, '2026-09-13 22:56:49'),
(137, 'cond-3870be629fa25ff2', NULL, 10.51294530, -66.91617850, 3.00, 0.00, '2026-09-13 22:56:53'),
(140, 'cond-102a6e5a4a414e3c', NULL, 9.90514690, -67.35822260, 12.80, 1.00, '2026-09-13 22:56:54'),
(143, 'cond-3870be629fa25ff2', NULL, 10.51294660, -66.91618480, 3.10, 1.00, '2026-09-13 22:56:58'),
(146, 'cond-102a6e5a4a414e3c', NULL, 9.90515050, -67.35821110, 11.80, 0.00, '2026-09-13 22:57:00'),
(149, 'cond-3870be629fa25ff2', NULL, 10.51294600, -66.91618930, 3.70, 0.00, '2026-09-13 22:57:04'),
(152, 'cond-102a6e5a4a414e3c', NULL, 9.90515050, -67.35821110, 11.80, 0.00, '2026-09-13 22:57:05'),
(155, 'cond-3870be629fa25ff2', NULL, 10.51294600, -66.91618930, 3.70, 0.00, '2026-09-13 22:57:09'),
(158, 'cond-102a6e5a4a414e3c', NULL, 9.90515050, -67.35821110, 11.80, 0.00, '2026-09-13 22:57:10'),
(161, 'cond-102a6e5a4a414e3c', NULL, 9.90515050, -67.35821110, 11.80, 0.00, '2026-09-13 22:57:15'),
(164, 'cond-102a6e5a4a414e3c', NULL, 9.90515050, -67.35821110, 11.80, 0.00, '2026-09-13 22:57:20'),
(167, 'cond-102a6e5a4a414e3c', NULL, 9.90515050, -67.35821110, 11.80, 0.00, '2026-09-13 22:57:25'),
(170, 'cond-102a6e5a4a414e3c', NULL, 9.90510090, -67.35819180, 31.90, 5.00, '2026-09-13 22:57:29'),
(173, 'cond-102a6e5a4a414e3c', NULL, 9.90513670, -67.35820370, 36.50, 2.00, '2026-09-13 22:57:34'),
(176, 'cond-102a6e5a4a414e3c', NULL, 9.90513760, -67.35819600, 21.00, 3.00, '2026-09-13 22:57:40'),
(179, 'cond-102a6e5a4a414e3c', NULL, 9.90513760, -67.35819600, 21.00, 3.00, '2026-09-13 22:57:45'),
(182, 'cond-102a6e5a4a414e3c', NULL, 9.90513760, -67.35819600, 21.00, 3.00, '2026-09-13 22:57:50'),
(185, 'cond-102a6e5a4a414e3c', NULL, 9.90513760, -67.35819600, 21.00, 3.00, '2026-09-13 22:57:55'),
(188, 'cond-102a6e5a4a414e3c', NULL, 9.90513760, -67.35819600, 21.00, 3.00, '2026-09-13 22:58:00'),
(191, 'cond-102a6e5a4a414e3c', NULL, 9.90513760, -67.35819600, 21.00, 3.00, '2026-09-13 22:58:14'),
(194, 'cond-102a6e5a4a414e3c', NULL, 9.90513760, -67.35819600, 21.00, 3.00, '2026-09-13 22:58:15'),
(197, 'cond-102a6e5a4a414e3c', NULL, 9.90513760, -67.35819600, 21.00, 3.00, '2026-09-13 22:58:25'),
(200, 'cond-102a6e5a4a414e3c', NULL, 9.90513350, -67.35823310, 16.50, 0.00, '2026-09-13 22:58:29'),
(203, 'cond-102a6e5a4a414e3c', NULL, 9.90513350, -67.35823310, 16.50, 0.00, '2026-09-13 22:58:34'),
(206, 'cond-102a6e5a4a414e3c', NULL, 9.90513030, -67.35822540, 19.70, 1.00, '2026-09-13 22:58:40'),
(209, 'cond-102a6e5a4a414e3c', NULL, 9.90512970, -67.35822490, 10.10, 0.00, '2026-09-13 22:58:44'),
(212, 'cond-102a6e5a4a414e3c', NULL, 9.90512910, -67.35822300, 8.90, 2.00, '2026-09-13 22:58:49'),
(215, 'cond-102a6e5a4a414e3c', NULL, 9.90512980, -67.35821600, 10.20, 3.00, '2026-09-13 22:58:54'),
(218, 'cond-102a6e5a4a414e3c', NULL, 9.90515460, -67.35820470, 15.10, 2.00, '2026-09-13 22:58:59'),
(221, 'cond-102a6e5a4a414e3c', NULL, 9.90515460, -67.35820470, 15.10, 2.00, '2026-09-13 22:59:05'),
(224, 'cond-3870be629fa25ff2', NULL, 10.52325370, -66.92124400, 15.80, 1.00, '2026-09-14 04:08:32'),
(227, 'cond-3870be629fa25ff2', NULL, 10.52324910, -66.92121740, 12.10, 1.00, '2026-09-14 04:08:37'),
(230, 'cond-3870be629fa25ff2', NULL, 10.52331590, -66.92123090, 9.40, 1.00, '2026-09-14 04:08:42'),
(233, 'cond-3870be629fa25ff2', NULL, 10.52336490, -66.92120480, 5.90, 0.00, '2026-09-14 04:08:47'),
(236, 'cond-3870be629fa25ff2', NULL, 10.52338720, -66.92118340, 5.00, 0.00, '2026-09-14 04:08:52'),
(239, 'cond-3870be629fa25ff2', NULL, 10.52338840, -66.92117650, 3.60, 0.00, '2026-09-14 04:08:57'),
(242, 'cond-3870be629fa25ff2', NULL, 10.52339790, -66.92116530, 3.20, 0.00, '2026-09-14 04:09:02'),
(245, 'cond-3870be629fa25ff2', NULL, 10.52340700, -66.92115400, 3.90, 0.00, '2026-09-14 04:09:07'),
(248, 'cond-3870be629fa25ff2', NULL, 10.52340840, -66.92115060, 3.70, 0.00, '2026-09-14 04:09:12'),
(251, 'cond-3870be629fa25ff2', NULL, 10.52340590, -66.92114800, 3.40, 0.00, '2026-09-14 04:09:17'),
(254, 'cond-3870be629fa25ff2', NULL, 10.52340340, -66.92114640, 3.00, 0.00, '2026-09-14 04:09:22'),
(257, 'cond-3870be629fa25ff2', NULL, 10.52339460, -66.92114530, 3.00, 0.00, '2026-09-14 04:09:27'),
(260, 'cond-3870be629fa25ff2', NULL, 10.52339580, -66.92114230, 3.00, 0.00, '2026-09-14 04:09:32'),
(263, 'cond-3870be629fa25ff2', NULL, 10.52339550, -66.92114020, 3.00, 0.00, '2026-09-14 04:09:37'),
(266, 'cond-3870be629fa25ff2', NULL, 10.52339610, -66.92113760, 3.00, 0.00, '2026-09-14 04:09:42'),
(269, 'cond-3870be629fa25ff2', NULL, 10.52339310, -66.92113520, 3.00, 0.00, '2026-09-14 04:09:47'),
(272, 'cond-3870be629fa25ff2', NULL, 10.52339290, -66.92113310, 3.00, 0.00, '2026-09-14 04:09:52'),
(275, 'cond-3870be629fa25ff2', NULL, 10.52339340, -66.92113250, 3.00, 0.00, '2026-09-14 04:09:57'),
(278, 'cond-3870be629fa25ff2', NULL, 10.52339190, -66.92113170, 3.00, 0.00, '2026-09-14 04:10:02'),
(281, 'cond-3870be629fa25ff2', NULL, 10.52338970, -66.92112590, 3.00, 0.00, '2026-09-14 04:10:07'),
(284, 'cond-3870be629fa25ff2', NULL, 10.52338130, -66.92111940, 3.00, 0.00, '2026-09-14 04:10:12'),
(287, 'cond-3870be629fa25ff2', NULL, 10.52337720, -66.92111350, 3.00, 0.00, '2026-09-14 04:10:17'),
(290, 'cond-3870be629fa25ff2', NULL, 10.52337760, -66.92111050, 3.00, 0.00, '2026-09-14 04:10:22'),
(293, 'cond-3870be629fa25ff2', NULL, 10.52337760, -66.92111050, 3.00, 0.00, '2026-09-14 04:10:27'),
(296, 'cond-3870be629fa25ff2', NULL, 10.52336950, -66.92107610, 9.80, 2.00, '2026-09-14 04:10:32'),
(299, 'cond-3870be629fa25ff2', NULL, 10.52337800, -66.92107640, 13.80, 1.00, '2026-09-14 04:10:37'),
(302, 'cond-3870be629fa25ff2', NULL, 10.52338110, -66.92108000, 5.00, 0.00, '2026-09-14 04:10:42'),
(305, 'cond-3870be629fa25ff2', NULL, 10.52338680, -66.92108160, 4.70, 0.00, '2026-09-14 04:10:47'),
(308, 'cond-3870be629fa25ff2', NULL, 10.52338930, -66.92108530, 4.30, 0.00, '2026-09-14 04:10:52'),
(311, 'cond-3870be629fa25ff2', NULL, 10.52339030, -66.92108840, 4.10, 0.00, '2026-09-14 04:10:57'),
(314, 'cond-3870be629fa25ff2', NULL, 10.52338960, -66.92108370, 4.00, 0.00, '2026-09-14 04:11:02'),
(317, 'cond-3870be629fa25ff2', NULL, 10.52337900, -66.92107500, 3.40, 0.00, '2026-09-14 04:11:07'),
(320, 'cond-3870be629fa25ff2', NULL, 10.52337620, -66.92107160, 3.00, 0.00, '2026-09-14 04:11:12'),
(323, 'cond-3870be629fa25ff2', NULL, 10.52337410, -66.92106900, 3.00, 0.00, '2026-09-14 04:11:17'),
(326, 'cond-3870be629fa25ff2', NULL, 10.52337350, -66.92106670, 3.00, 0.00, '2026-09-14 04:11:22'),
(329, 'cond-3870be629fa25ff2', NULL, 10.52337230, -66.92106550, 3.00, 0.00, '2026-09-14 04:11:27'),
(332, 'cond-3870be629fa25ff2', NULL, 10.52337200, -66.92106260, 3.00, 0.00, '2026-09-14 04:11:32'),
(335, 'cond-3870be629fa25ff2', NULL, 10.52337190, -66.92106090, 3.00, 0.00, '2026-09-14 04:11:37'),
(338, 'cond-3870be629fa25ff2', NULL, 10.52337110, -66.92105950, 3.00, 0.00, '2026-09-14 04:11:42'),
(341, 'cond-3870be629fa25ff2', NULL, 10.52337130, -66.92106000, 3.00, 0.00, '2026-09-14 04:11:47'),
(344, 'cond-3870be629fa25ff2', NULL, 10.52337160, -66.92105910, 3.00, 0.00, '2026-09-14 04:11:52'),
(347, 'cond-3870be629fa25ff2', NULL, 10.52337020, -66.92105810, 3.00, 0.00, '2026-09-14 04:11:57'),
(350, 'cond-3870be629fa25ff2', NULL, 10.52336920, -66.92105880, 3.00, 0.00, '2026-09-14 04:12:02'),
(353, 'cond-3870be629fa25ff2', NULL, 10.52336800, -66.92105890, 3.00, 0.00, '2026-09-14 04:12:07'),
(356, 'cond-3870be629fa25ff2', NULL, 10.52336900, -66.92105880, 3.00, 0.00, '2026-09-14 04:12:12'),
(359, 'cond-3870be629fa25ff2', NULL, 10.52337000, -66.92105780, 3.00, 0.00, '2026-09-14 04:12:17'),
(362, 'cond-3870be629fa25ff2', NULL, 10.52336890, -66.92105850, 3.00, 0.00, '2026-09-14 04:12:22'),
(365, 'cond-3870be629fa25ff2', NULL, 10.52337030, -66.92105780, 3.00, 0.00, '2026-09-14 04:12:27'),
(368, 'cond-3870be629fa25ff2', NULL, 10.52336790, -66.92105890, 3.00, 0.00, '2026-09-14 04:12:32'),
(371, 'cond-102a6e5a4a414e3c', NULL, 9.91844890, -69.61837530, 16.50, 0.00, '2026-09-16 03:32:43'),
(374, 'cond-102a6e5a4a414e3c', NULL, 9.91844920, -69.61837270, 28.90, 0.00, '2026-09-16 03:32:51'),
(377, 'cond-102a6e5a4a414e3c', NULL, 9.91844710, -69.61837720, 11.80, 0.00, '2026-09-16 03:32:58'),
(380, 'cond-102a6e5a4a414e3c', NULL, 9.91845170, -69.61837720, 16.00, 0.00, '2026-09-16 03:33:22'),
(383, 'cond-102a6e5a4a414e3c', NULL, 9.91845030, -69.61837030, 26.70, 0.00, '2026-09-16 03:33:29'),
(386, 'cond-102a6e5a4a414e3c', NULL, 9.91845080, -69.61837730, 12.50, 0.00, '2026-09-16 03:33:36'),
(389, 'cond-102a6e5a4a414e3c', NULL, 9.91845170, -69.61837530, 8.50, 0.00, '2026-09-16 03:33:43'),
(392, 'cond-102a6e5a4a414e3c', NULL, 9.91845220, -69.61837620, 7.00, 0.00, '2026-09-16 03:33:51'),
(395, 'cond-102a6e5a4a414e3c', NULL, 9.91845200, -69.61837580, 6.60, 0.00, '2026-09-16 03:34:00'),
(398, 'cond-102a6e5a4a414e3c', NULL, 9.91845180, -69.61837580, 5.80, 0.00, '2026-09-16 03:34:10'),
(401, 'cond-102a6e5a4a414e3c', NULL, 9.91845200, -69.61837580, 5.40, 0.00, '2026-09-16 03:34:16'),
(404, 'cond-102a6e5a4a414e3c', NULL, 9.91845190, -69.61837610, 5.10, 0.00, '2026-09-16 03:34:24'),
(407, 'cond-102a6e5a4a414e3c', NULL, 9.91845200, -69.61837680, 4.80, 0.00, '2026-09-16 03:34:32'),
(410, 'cond-102a6e5a4a414e3c', NULL, 9.91845200, -69.61837670, 4.60, 0.00, '2026-09-16 03:34:39'),
(413, 'cond-102a6e5a4a414e3c', NULL, 9.91845210, -69.61837650, 4.40, 0.00, '2026-09-16 03:34:47'),
(416, 'cond-102a6e5a4a414e3c', NULL, 9.91845190, -69.61837610, 4.80, 0.00, '2026-09-16 03:34:52'),
(419, 'cond-102a6e5a4a414e3c', NULL, 9.91844810, -69.61837920, 8.90, 0.00, '2026-09-16 05:19:09'),
(422, 'cond-102a6e5a4a414e3c', NULL, 9.91844860, -69.61837850, 8.00, 0.00, '2026-09-16 05:19:14'),
(425, 'cond-102a6e5a4a414e3c', NULL, 9.92634110, -69.62794700, 11.40, 1.00, '2026-09-16 12:44:53'),
(428, 'cond-102a6e5a4a414e3c', NULL, 9.92634390, -69.62795430, 9.70, 2.00, '2026-09-16 12:44:59'),
(431, 'cond-102a6e5a4a414e3c', NULL, 9.92635060, -69.62793760, 12.10, 4.00, '2026-09-16 12:45:05'),
(434, 'cond-102a6e5a4a414e3c', NULL, 9.92635080, -69.62788350, 35.70, 4.00, '2026-09-16 12:45:17'),
(437, 'cond-102a6e5a4a414e3c', NULL, 9.92636290, -69.62790050, 39.10, 5.00, '2026-09-16 12:45:22'),
(440, 'cond-102a6e5a4a414e3c', NULL, 9.92636860, -69.62796130, 22.30, 3.00, '2026-09-16 12:45:28'),
(443, 'cond-102a6e5a4a414e3c', NULL, 9.92636710, -69.62795940, 15.50, 1.00, '2026-09-16 12:45:33'),
(446, 'cond-102a6e5a4a414e3c', NULL, 9.92637200, -69.62796900, 12.50, 1.00, '2026-09-16 12:45:38'),
(449, 'cond-102a6e5a4a414e3c', NULL, 9.92633230, -69.62803200, 12.90, 0.00, '2026-09-16 12:45:44'),
(452, 'cond-102a6e5a4a414e3c', NULL, 9.92633360, -69.62803130, 13.20, 0.00, '2026-09-16 12:45:50'),
(455, 'cond-102a6e5a4a414e3c', NULL, 9.92633950, -69.62804560, 12.60, 0.00, '2026-09-16 12:45:55'),
(458, 'cond-102a6e5a4a414e3c', NULL, 9.92633790, -69.62804430, 12.50, 0.00, '2026-09-16 12:46:00'),
(461, 'cond-102a6e5a4a414e3c', NULL, 9.92633800, -69.62803930, 13.20, 0.00, '2026-09-16 12:46:06'),
(464, 'cond-102a6e5a4a414e3c', NULL, 9.92634190, -69.62804480, 13.20, 1.00, '2026-09-16 12:46:11'),
(467, 'cond-102a6e5a4a414e3c', NULL, 9.92632180, -69.62811020, 12.20, 3.00, '2026-09-16 12:46:18'),
(470, 'cond-102a6e5a4a414e3c', NULL, 9.92632620, -69.62813040, 16.80, 3.00, '2026-09-16 12:46:23'),
(473, 'cond-102a6e5a4a414e3c', NULL, 9.92630740, -69.62811070, 13.00, 0.00, '2026-09-16 12:46:29'),
(476, 'cond-102a6e5a4a414e3c', NULL, 9.92630590, -69.62810700, 11.80, 0.00, '2026-09-16 12:46:34'),
(479, 'cond-102a6e5a4a414e3c', NULL, 9.92630700, -69.62810290, 11.30, 0.00, '2026-09-16 12:46:39'),
(482, 'cond-102a6e5a4a414e3c', NULL, 9.92630630, -69.62809800, 10.10, 0.00, '2026-09-16 12:46:44'),
(485, 'cond-102a6e5a4a414e3c', NULL, 9.92630430, -69.62809670, 10.20, 0.00, '2026-09-16 12:46:49'),
(488, 'cond-102a6e5a4a414e3c', NULL, 9.92628280, -69.62811260, 9.00, 0.00, '2026-09-16 12:46:56'),
(491, 'cond-102a6e5a4a414e3c', NULL, 9.92628670, -69.62811550, 9.00, 0.00, '2026-09-16 12:47:02'),
(494, 'cond-102a6e5a4a414e3c', NULL, 9.92628460, -69.62811460, 9.30, 0.00, '2026-09-16 12:47:08'),
(497, 'cond-102a6e5a4a414e3c', NULL, 9.92628590, -69.62811660, 9.60, 0.00, '2026-09-16 12:47:14'),
(500, 'cond-102a6e5a4a414e3c', NULL, 9.92629650, -69.62811400, 9.70, 0.00, '2026-09-16 12:47:19'),
(503, 'cond-102a6e5a4a414e3c', NULL, 9.92628610, -69.62812630, 9.40, 1.00, '2026-09-16 12:47:24'),
(506, 'cond-102a6e5a4a414e3c', NULL, 9.92629240, -69.62812290, 11.10, 2.00, '2026-09-16 12:47:29'),
(509, 'cond-102a6e5a4a414e3c', NULL, 9.92630060, -69.62813090, 15.40, 2.00, '2026-09-16 12:47:34'),
(512, 'cond-102a6e5a4a414e3c', NULL, 9.92631220, -69.62812920, 18.90, 3.00, '2026-09-16 12:47:39'),
(515, 'cond-102a6e5a4a414e3c', NULL, 9.92632850, -69.62809730, 17.60, 2.00, '2026-09-16 12:47:44'),
(518, 'cond-102a6e5a4a414e3c', NULL, 9.92634030, -69.62805850, 13.80, 2.00, '2026-09-16 12:47:49'),
(521, 'cond-102a6e5a4a414e3c', NULL, 9.92634580, -69.62804640, 15.70, 2.00, '2026-09-16 12:47:55'),
(524, 'cond-102a6e5a4a414e3c', NULL, 9.92636310, -69.62788460, 34.40, 0.00, '2026-09-16 12:50:58'),
(527, 'DRV-20260916-646A7F', NULL, 9.90560000, -67.35920000, 10.00, 0.00, '2026-09-16 22:58:24'),
(530, 'DRV-20260916-646A7F', NULL, 9.92653520, -69.62803080, 35.40, 5.00, '2026-09-16 23:32:01'),
(533, 'DRV-20260916-646A7F', NULL, 9.92642530, -69.62793650, 23.30, 2.00, '2026-09-16 23:32:06'),
(536, 'DRV-20260916-646A7F', NULL, 9.92640630, -69.62791410, 21.80, 4.00, '2026-09-16 23:32:12'),
(539, 'DRV-20260916-646A7F', NULL, 9.92641500, -69.62793590, 25.20, 4.00, '2026-09-16 23:32:17'),
(542, 'DRV-20260916-646A7F', NULL, 9.92639760, -69.62794250, 23.20, 5.00, '2026-09-16 23:32:22'),
(545, 'DRV-20260916-646A7F', NULL, 9.92624870, -69.62813570, 26.20, 7.00, '2026-09-16 23:32:27'),
(548, 'DRV-20260916-646A7F', NULL, 9.92633470, -69.62803560, 18.40, 0.00, '2026-09-16 23:32:33'),
(551, 'DRV-20260916-646A7F', NULL, 9.92634400, -69.62803300, 15.50, 0.00, '2026-09-16 23:32:39'),
(554, 'DRV-20260916-646A7F', NULL, 9.92634380, -69.62803880, 14.70, 0.00, '2026-09-16 23:32:44'),
(557, 'DRV-20260916-646A7F', NULL, 9.92634130, -69.62804520, 14.60, 0.00, '2026-09-16 23:32:49'),
(560, 'DRV-20260916-646A7F', NULL, 9.92635740, -69.62807750, 12.70, 2.00, '2026-09-16 23:32:54'),
(563, 'DRV-20260916-646A7F', NULL, 9.92634770, -69.62808220, 15.70, 3.00, '2026-09-16 23:33:00'),
(566, 'DRV-20260916-646A7F', NULL, 9.92635760, -69.62805830, 20.70, 1.00, '2026-09-16 23:33:06'),
(569, 'DRV-20260916-646A7F', NULL, 9.92636920, -69.62806310, 15.90, 0.00, '2026-09-16 23:33:11'),
(572, 'DRV-20260916-646A7F', NULL, 9.92636900, -69.62806900, 16.20, 0.00, '2026-09-16 23:33:16'),
(575, 'DRV-20260916-646A7F', NULL, 9.92631070, -69.62809600, 11.00, 0.00, '2026-09-16 23:33:22'),
(578, 'DRV-20260916-646A7F', NULL, 9.92631250, -69.62808370, 10.20, 0.00, '2026-09-16 23:33:27'),
(581, 'DRV-20260916-646A7F', NULL, 9.92631380, -69.62808450, 10.70, 0.00, '2026-09-16 23:33:32'),
(584, 'DRV-20260916-646A7F', NULL, 9.92631870, -69.62809060, 11.10, 0.00, '2026-09-16 23:33:39'),
(587, 'DRV-20260916-646A7F', NULL, 9.92632110, -69.62808870, 10.90, 0.00, '2026-09-16 23:33:44'),
(590, 'DRV-20260916-646A7F', NULL, 9.92638910, -69.62814230, 27.00, 1.00, '2026-09-16 23:33:50'),
(593, 'DRV-20260916-646A7F', NULL, 9.92636170, -69.62788290, 48.80, 0.00, '2026-09-17 04:40:17'),
(596, 'DRV-20260916-646A7F', NULL, 9.92636160, -69.62788420, 48.90, 0.00, '2026-09-17 04:40:28'),
(599, 'DRV-20260916-646A7F', NULL, 9.92636250, -69.62788480, 45.60, 0.00, '2026-09-17 04:40:35'),
(602, 'DRV-20260916-646A7F', NULL, 9.92636280, -69.62788470, 42.50, 0.00, '2026-09-17 04:40:42'),
(605, 'DRV-20260916-646A7F', NULL, 9.92636250, -69.62788480, 45.60, 0.00, '2026-09-17 04:40:49'),
(608, 'DRV-20260916-646A7F', NULL, 9.92636250, -69.62788480, 45.60, 0.00, '2026-09-17 04:40:56'),
(611, 'DRV-20260916-646A7F', NULL, 9.92637880, -69.62792880, 112.70, 2.00, '2026-09-17 04:41:02'),
(614, 'DRV-20260916-646A7F', NULL, 9.92637210, -69.62791890, 113.20, 1.00, '2026-09-17 04:41:08'),
(617, 'DRV-20260916-646A7F', NULL, 9.92634710, -69.62789890, 101.70, 0.00, '2026-09-17 04:41:17'),
(620, 'DRV-20260916-646A7F', NULL, 9.92635570, -69.62789430, 82.50, 0.00, '2026-09-17 04:41:24'),
(623, 'DRV-20260916-646A7F', NULL, 9.92636200, -69.62788520, 48.90, 1.00, '2026-09-17 04:41:31'),
(626, 'DRV-20260916-646A7F', NULL, 9.92636270, -69.62788450, 45.60, 0.00, '2026-09-17 04:41:38'),
(629, 'DRV-20260916-646A7F', NULL, 9.92636260, -69.62788470, 45.60, 0.00, '2026-09-17 04:41:45'),
(632, 'DRV-20260916-646A7F', NULL, 9.92636280, -69.62788470, 42.50, 0.00, '2026-09-17 04:41:52'),
(635, 'DRV-20260916-646A7F', NULL, 9.92636250, -69.62788480, 45.60, 0.00, '2026-09-17 04:41:59'),
(638, 'DRV-20260916-646A7F', NULL, 9.92637350, -69.62787890, 66.20, 0.00, '2026-09-17 04:42:06'),
(641, 'DRV-20260916-646A7F', NULL, 9.92637440, -69.62787810, 66.20, 0.00, '2026-09-17 04:42:13'),
(644, 'DRV-20260916-646A7F', NULL, 9.92637020, -69.62788180, 82.50, 0.00, '2026-09-17 04:42:20'),
(647, 'DRV-20260916-646A7F', NULL, 9.92636310, -69.62788460, 42.50, 0.00, '2026-09-17 04:42:27'),
(650, 'DRV-20260916-646A7F', NULL, 9.92635930, -69.62788090, 55.30, 0.00, '2026-09-17 04:42:34'),
(653, 'DRV-20260916-646A7F', NULL, 9.92635920, -69.62788050, 55.30, 0.00, '2026-09-17 04:42:42'),
(656, 'DRV-20260916-646A7F', NULL, 9.92636200, -69.62788070, 25.60, 0.00, '2026-09-17 04:42:49'),
(659, 'DRV-20260916-646A7F', NULL, 9.92636280, -69.62787820, 19.20, 1.00, '2026-09-17 04:42:54'),
(662, 'DRV-20260916-646A7F', NULL, 9.92636440, -69.62787330, 17.70, 3.00, '2026-09-17 04:42:59'),
(665, 'DRV-20260916-646A7F', NULL, 9.92636620, -69.62786390, 20.70, 4.00, '2026-09-17 04:43:04'),
(668, 'DRV-20260916-646A7F', NULL, 9.92636880, -69.62786350, 25.10, 4.00, '2026-09-17 04:43:09'),
(671, 'DRV-20260916-646A7F', NULL, 9.92636880, -69.62786550, 27.10, 4.00, '2026-09-17 04:43:14'),
(674, 'DRV-20260916-646A7F', NULL, 9.92637020, -69.62786030, 30.60, 4.00, '2026-09-17 04:43:19'),
(677, 'DRV-20260916-646A7F', NULL, 9.92636840, -69.62786340, 32.80, 5.00, '2026-09-17 04:43:24'),
(680, 'DRV-20260916-646A7F', NULL, 9.92637340, -69.62786810, 87.60, 4.00, '2026-09-17 04:53:21'),
(683, 'DRV-20260916-646A7F', NULL, 9.92620880, -69.62816560, 33.30, 15.00, '2026-09-17 04:53:28'),
(686, 'DRV-20260916-646A7F', NULL, 9.92620320, -69.62817570, 33.30, 1.00, '2026-09-17 04:53:36'),
(689, 'DRV-20260916-646A7F', NULL, 9.92620760, -69.62816180, 32.80, 2.00, '2026-09-17 04:53:41'),
(692, 'DRV-20260916-646A7F', NULL, 9.92626420, -69.62805680, 28.20, 3.00, '2026-09-17 04:53:46'),
(695, 'DRV-20260916-646A7F', NULL, 9.92630610, -69.62796650, 27.00, 3.00, '2026-09-17 04:53:52'),
(698, 'DRV-20260916-646A7F', NULL, 9.92631240, -69.62795360, 26.10, 4.00, '2026-09-17 04:53:57'),
(701, 'DRV-20260916-646A7F', NULL, 9.92633530, -69.62791830, 24.40, 4.00, '2026-09-17 04:54:03'),
(704, 'DRV-20260916-646A7F', NULL, 9.92635010, -69.62791110, 23.40, 3.00, '2026-09-17 04:54:08'),
(707, 'DRV-20260916-646A7F', NULL, 9.92634870, -69.62790920, 24.40, 3.00, '2026-09-17 04:54:14'),
(710, 'DRV-20260916-646A7F', NULL, 9.92634360, -69.62791670, 24.60, 3.00, '2026-09-17 04:54:19'),
(713, 'DRV-20260916-646A7F', NULL, 9.92633360, -69.62794190, 23.00, 4.00, '2026-09-17 04:54:25'),
(716, 'DRV-20260916-646A7F', NULL, 9.92634050, -69.62792570, 22.00, 3.00, '2026-09-17 04:54:30'),
(719, 'DRV-20260916-646A7F', NULL, 9.92634440, -69.62791860, 23.90, 3.00, '2026-09-17 04:54:35'),
(722, 'DRV-20260916-646A7F', NULL, 9.92634560, -69.62791220, 24.10, 2.00, '2026-09-17 04:54:40'),
(725, 'DRV-20260916-646A7F', NULL, 9.92634030, -69.62791000, 23.80, 3.00, '2026-09-17 04:54:46'),
(728, 'DRV-20260916-646A7F', NULL, 9.92633510, -69.62790170, 21.30, 3.00, '2026-09-17 04:54:51'),
(731, 'DRV-20260916-646A7F', NULL, 9.92633320, -69.62789240, 21.90, 2.00, '2026-09-17 04:54:57'),
(734, 'DRV-20260916-646A7F', NULL, 9.92633180, -69.62789060, 23.00, 2.00, '2026-09-17 04:55:03'),
(737, 'DRV-20260916-646A7F', NULL, 9.92633270, -69.62787610, 24.90, 2.00, '2026-09-17 04:55:15'),
(740, 'DRV-20260916-646A7F', NULL, 9.92633990, -69.62788440, 20.00, 2.00, '2026-09-17 04:55:20'),
(743, 'DRV-20260916-646A7F', NULL, 9.92634000, -69.62788790, 20.50, 2.00, '2026-09-17 04:55:25'),
(746, 'DRV-20260916-646A7F', NULL, 9.92632210, -69.62790050, 21.60, 2.00, '2026-09-17 04:55:30'),
(749, 'DRV-20260916-646A7F', NULL, 9.92632620, -69.62789980, 22.60, 3.00, '2026-09-17 04:55:36'),
(752, 'DRV-20260916-646A7F', NULL, 9.92633430, -69.62789610, 22.30, 2.00, '2026-09-17 04:55:41'),
(755, 'DRV-20260916-646A7F', NULL, 9.92632890, -69.62789690, 28.10, 2.00, '2026-09-17 04:55:48'),
(758, 'DRV-20260916-646A7F', NULL, 9.92633610, -69.62788940, 29.70, 2.00, '2026-09-17 04:55:53'),
(761, 'DRV-20260916-646A7F', NULL, 9.92634060, -69.62791190, 20.50, 0.00, '2026-09-17 04:56:04'),
(764, 'DRV-20260916-646A7F', NULL, 9.92624700, -69.62810300, 20.10, 0.00, '2026-09-17 04:56:11'),
(767, 'DRV-20260916-646A7F', NULL, 9.92621730, -69.62817880, 34.10, 0.00, '2026-09-17 04:56:18'),
(770, 'DRV-20260916-646A7F', NULL, 9.92627150, -69.62806830, 56.10, 0.00, '2026-09-17 04:56:25'),
(773, 'DRV-20260916-646A7F', NULL, 9.92622420, -69.62817350, 34.90, 0.00, '2026-09-17 04:56:32'),
(776, 'DRV-20260916-646A7F', NULL, 9.92622270, -69.62817670, 34.90, 0.00, '2026-09-17 04:56:39'),
(779, 'DRV-20260916-646A7F', NULL, 9.92625360, -69.62811160, 72.90, 0.00, '2026-09-17 04:56:46'),
(782, 'DRV-20260916-646A7F', NULL, 9.92635480, -69.62789940, 56.10, 13.00, '2026-09-17 04:56:53'),
(785, 'DRV-20260916-646A7F', NULL, 9.92621060, -69.62817650, 35.20, 0.00, '2026-09-17 05:04:51'),
(788, 'DRV-20260916-646A7F', NULL, 9.92620560, -69.62815670, 22.30, 5.00, '2026-09-17 05:04:56'),
(791, 'DRV-20260916-646A7F', NULL, 9.92619530, -69.62814130, 19.50, 6.00, '2026-09-17 05:05:02'),
(794, 'DRV-20260916-646A7F', NULL, 9.92619440, -69.62820250, 27.10, 4.00, '2026-09-17 05:05:07'),
(797, 'DRV-20260916-646A7F', NULL, 9.92623600, -69.62824680, 25.30, 6.00, '2026-09-17 05:05:12'),
(800, 'DRV-20260916-646A7F', NULL, 9.92622890, -69.62820680, 21.20, 1.00, '2026-09-17 05:05:18'),
(803, 'DRV-20260916-646A7F', NULL, 9.92623010, -69.62818570, 15.70, 0.00, '2026-09-17 05:05:23'),
(806, 'DRV-20260916-646A7F', NULL, 9.92622870, -69.62818330, 14.00, 0.00, '2026-09-17 05:05:29'),
(809, 'DRV-20260916-646A7F', NULL, 9.92624830, -69.62820200, 12.50, 1.00, '2026-09-17 05:05:34'),
(812, 'DRV-20260916-646A7F', NULL, 9.92626720, -69.62827690, 10.10, 1.00, '2026-09-17 05:05:39'),
(815, 'DRV-20260916-646A7F', NULL, 9.92626630, -69.62829080, 8.00, 1.00, '2026-09-17 05:05:45'),
(818, 'DRV-20260916-646A7F', NULL, 9.92626150, -69.62828970, 7.50, 1.00, '2026-09-17 05:05:50'),
(821, 'DRV-20260916-646A7F', NULL, 9.92626220, -69.62829000, 7.50, 0.00, '2026-09-17 05:05:55'),
(824, 'DRV-20260916-646A7F', NULL, 9.92625280, -69.62827710, 7.30, 1.00, '2026-09-17 05:06:00'),
(827, 'DRV-20260916-646A7F', NULL, 9.92624550, -69.62829020, 7.90, 4.00, '2026-09-17 05:06:06'),
(830, 'DRV-20260916-646A7F', NULL, 9.92625610, -69.62832050, 10.80, 2.00, '2026-09-17 05:06:11'),
(833, 'DRV-20260916-646A7F', NULL, 9.92626870, -69.62829040, 9.50, 3.00, '2026-09-17 05:06:16'),
(836, 'DRV-20260916-646A7F', NULL, 9.92628140, -69.62825200, 10.30, 3.00, '2026-09-17 05:06:21'),
(839, 'DRV-20260916-646A7F', NULL, 9.92627610, -69.62819790, 11.40, 4.00, '2026-09-17 05:06:27'),
(842, 'DRV-20260916-646A7F', NULL, 9.92625820, -69.62820300, 12.20, 0.00, '2026-09-17 05:06:33'),
(845, 'DRV-20260916-646A7F', NULL, 9.92626840, -69.62819290, 13.10, 0.00, '2026-09-17 05:06:38'),
(848, 'DRV-20260916-646A7F', NULL, 9.92626990, -69.62819660, 12.90, 0.00, '2026-09-17 05:06:44'),
(851, 'DRV-20260916-646A7F', NULL, 9.92626860, -69.62820400, 11.90, 0.00, '2026-09-17 05:06:49'),
(854, 'DRV-20260916-646A7F', NULL, 9.92625370, -69.62821290, 11.60, 2.00, '2026-09-17 05:06:54'),
(857, 'DRV-20260916-646A7F', NULL, 9.92624090, -69.62820480, 13.10, 3.00, '2026-09-17 05:06:59'),
(860, 'DRV-20260916-646A7F', NULL, 9.92622680, -69.62817530, 17.80, 4.00, '2026-09-17 05:07:04'),
(863, 'DRV-20260916-646A7F', NULL, 9.92622540, -69.62814670, 22.30, 4.00, '2026-09-17 05:07:10'),
(866, 'cond-102a6e5a4a414e3c', NULL, 9.90516990, -67.35821000, 16.70, 0.00, '2026-09-19 01:09:13'),
(869, 'cond-102a6e5a4a414e3c', NULL, 9.90517080, -67.35820960, 26.80, 1.00, '2026-09-19 01:09:18'),
(872, 'cond-102a6e5a4a414e3c', NULL, 9.90516010, -67.35821190, 13.00, 2.00, '2026-09-19 01:09:23'),
(875, 'cond-102a6e5a4a414e3c', NULL, 9.90514500, -67.35822250, 12.40, 1.00, '2026-09-19 01:09:28'),
(878, 'cond-102a6e5a4a414e3c', NULL, 9.90513890, -67.35822230, 11.10, 1.00, '2026-09-19 01:09:33'),
(881, 'cond-102a6e5a4a414e3c', NULL, 9.90512380, -67.35822810, 11.20, 2.00, '2026-09-19 01:09:38'),
(884, 'cond-102a6e5a4a414e3c', NULL, 9.90511260, -67.35822850, 11.80, 2.00, '2026-09-19 01:09:43'),
(887, 'cond-102a6e5a4a414e3c', NULL, 9.90510670, -67.35824220, 10.70, 1.00, '2026-09-19 01:09:48'),
(890, 'cond-102a6e5a4a414e3c', NULL, 9.90509950, -67.35824930, 9.40, 1.00, '2026-09-19 01:09:53'),
(893, 'cond-102a6e5a4a414e3c', NULL, 9.90510680, -67.35823990, 8.80, 2.00, '2026-09-19 01:09:58'),
(896, 'cond-102a6e5a4a414e3c', NULL, 9.90509860, -67.35824210, 12.50, 2.00, '2026-09-19 01:10:03'),
(899, 'cond-102a6e5a4a414e3c', NULL, 9.90511110, -67.35824030, 9.60, 0.00, '2026-09-19 01:10:08'),
(902, 'cond-102a6e5a4a414e3c', NULL, 9.90511100, -67.35824410, 7.90, 0.00, '2026-09-19 01:10:13'),
(905, 'cond-102a6e5a4a414e3c', NULL, 9.90511810, -67.35824480, 7.50, 1.00, '2026-09-19 01:10:18'),
(908, 'cond-102a6e5a4a414e3c', NULL, 9.90511900, -67.35824250, 8.20, 2.00, '2026-09-19 01:10:23'),
(911, 'cond-102a6e5a4a414e3c', NULL, 9.90511270, -67.35824420, 10.30, 2.00, '2026-09-19 01:10:28'),
(914, 'cond-102a6e5a4a414e3c', NULL, 9.90512040, -67.35823530, 10.00, 1.00, '2026-09-19 01:10:33'),
(917, 'cond-102a6e5a4a414e3c', NULL, 9.90511880, -67.35824110, 7.70, 0.00, '2026-09-19 01:10:38'),
(920, 'cond-102a6e5a4a414e3c', NULL, 9.90511920, -67.35824140, 7.60, 0.00, '2026-09-19 01:10:43'),
(923, 'cond-102a6e5a4a414e3c', NULL, 9.90511860, -67.35823880, 7.40, 0.00, '2026-09-19 01:10:48'),
(926, 'cond-102a6e5a4a414e3c', NULL, 9.90511960, -67.35824410, 7.30, 1.00, '2026-09-19 01:10:53'),
(929, 'cond-102a6e5a4a414e3c', NULL, 9.90511850, -67.35824560, 7.50, 1.00, '2026-09-19 01:10:58'),
(932, 'cond-102a6e5a4a414e3c', NULL, 9.90511720, -67.35824330, 8.40, 1.00, '2026-09-19 01:11:03'),
(935, 'cond-102a6e5a4a414e3c', NULL, 9.90511400, -67.35824870, 9.30, 0.00, '2026-09-19 01:11:08'),
(938, 'cond-102a6e5a4a414e3c', NULL, 9.90511940, -67.35825360, 8.70, 0.00, '2026-09-19 01:11:13'),
(941, 'cond-102a6e5a4a414e3c', NULL, 9.90512870, -67.35825440, 8.40, 0.00, '2026-09-19 01:11:18'),
(944, 'cond-102a6e5a4a414e3c', NULL, 9.90513130, -67.35825640, 8.50, 0.00, '2026-09-19 01:11:23'),
(947, 'cond-102a6e5a4a414e3c', NULL, 9.90513330, -67.35824970, 8.50, 1.00, '2026-09-19 01:11:28'),
(950, 'cond-102a6e5a4a414e3c', NULL, 9.90513230, -67.35825290, 8.50, 1.00, '2026-09-19 01:11:33'),
(953, 'cond-102a6e5a4a414e3c', NULL, 9.90513100, -67.35825240, 9.20, 1.00, '2026-09-19 01:11:38'),
(956, 'cond-102a6e5a4a414e3c', NULL, 9.90512660, -67.35825000, 9.90, 1.00, '2026-09-19 01:11:43'),
(959, 'cond-102a6e5a4a414e3c', NULL, 9.90512320, -67.35825520, 9.80, 1.00, '2026-09-19 01:11:48'),
(962, 'cond-102a6e5a4a414e3c', NULL, 9.90512900, -67.35824730, 10.60, 1.00, '2026-09-19 01:11:53'),
(965, 'cond-102a6e5a4a414e3c', NULL, 9.90512950, -67.35824490, 11.40, 1.00, '2026-09-19 01:11:58'),
(968, 'cond-102a6e5a4a414e3c', NULL, 9.90512640, -67.35824970, 11.40, 0.00, '2026-09-19 01:12:03'),
(971, 'cond-102a6e5a4a414e3c', NULL, 9.90513470, -67.35824580, 9.00, 0.00, '2026-09-19 01:12:08'),
(974, 'cond-102a6e5a4a414e3c', NULL, 9.90513070, -67.35824190, 8.20, 0.00, '2026-09-19 01:12:13'),
(977, 'cond-102a6e5a4a414e3c', NULL, 9.90513320, -67.35824160, 7.80, 0.00, '2026-09-19 01:12:18'),
(980, 'cond-102a6e5a4a414e3c', NULL, 9.90513380, -67.35823880, 7.40, 0.00, '2026-09-19 01:12:23'),
(983, 'cond-102a6e5a4a414e3c', NULL, 9.90513580, -67.35823550, 7.00, 0.00, '2026-09-19 01:12:28'),
(986, 'cond-102a6e5a4a414e3c', NULL, 9.90513260, -67.35824140, 7.10, 0.00, '2026-09-19 01:12:33'),
(989, 'cond-102a6e5a4a414e3c', NULL, 9.90513600, -67.35824690, 6.70, 0.00, '2026-09-19 01:12:38'),
(992, 'cond-102a6e5a4a414e3c', NULL, 9.90513580, -67.35824850, 6.60, 0.00, '2026-09-19 01:12:43'),
(995, 'cond-102a6e5a4a414e3c', NULL, 9.90514290, -67.35824970, 7.00, 0.00, '2026-09-19 01:12:48'),
(998, 'cond-102a6e5a4a414e3c', NULL, 9.90514320, -67.35824860, 6.60, 0.00, '2026-09-19 01:12:53'),
(1001, 'cond-102a6e5a4a414e3c', NULL, 9.90513780, -67.35824490, 7.00, 0.00, '2026-09-19 01:12:58'),
(1004, 'cond-102a6e5a4a414e3c', NULL, 9.90514140, -67.35824140, 7.20, 0.00, '2026-09-19 01:13:03'),
(1007, 'cond-102a6e5a4a414e3c', NULL, 9.90514420, -67.35824280, 7.50, 0.00, '2026-09-19 01:13:08'),
(1010, 'cond-102a6e5a4a414e3c', NULL, 9.90514290, -67.35823930, 7.30, 0.00, '2026-09-19 01:13:13'),
(1013, 'cond-102a6e5a4a414e3c', NULL, 9.90513960, -67.35823640, 7.90, 0.00, '2026-09-19 01:13:18'),
(1016, 'cond-102a6e5a4a414e3c', NULL, 9.90513960, -67.35823640, 7.90, 0.00, '2026-09-19 01:13:23'),
(1019, 'cond-102a6e5a4a414e3c', NULL, 9.90513960, -67.35823640, 7.90, 0.00, '2026-09-19 01:13:29'),
(1022, 'cond-102a6e5a4a414e3c', NULL, 9.90513960, -67.35823640, 7.90, 0.00, '2026-09-19 01:13:33'),
(1025, 'cond-102a6e5a4a414e3c', NULL, 9.90513960, -67.35823640, 7.90, 0.00, '2026-09-19 01:13:38'),
(1028, 'cond-102a6e5a4a414e3c', NULL, 9.90513960, -67.35823640, 7.90, 0.00, '2026-09-19 01:13:43'),
(1031, 'cond-102a6e5a4a414e3c', NULL, 9.90513960, -67.35823640, 7.90, 0.00, '2026-09-19 01:13:48'),
(1034, 'cond-102a6e5a4a414e3c', NULL, 9.90513960, -67.35823640, 7.90, 0.00, '2026-09-19 01:13:54'),
(1037, 'cond-102a6e5a4a414e3c', NULL, 9.90513880, -67.35824750, 17.10, 0.00, '2026-09-19 01:13:58'),
(1040, 'cond-102a6e5a4a414e3c', NULL, 9.90513880, -67.35824750, 17.10, 0.00, '2026-09-19 01:14:03'),
(1043, 'cond-102a6e5a4a414e3c', NULL, 9.90513150, -67.35824840, 12.00, 0.00, '2026-09-19 01:14:08'),
(1046, 'cond-102a6e5a4a414e3c', NULL, 9.90512750, -67.35825210, 10.10, 0.00, '2026-09-19 01:14:13'),
(1049, 'cond-102a6e5a4a414e3c', NULL, 9.90513050, -67.35825370, 8.60, 0.00, '2026-09-19 01:14:18'),
(1052, 'cond-102a6e5a4a414e3c', NULL, 9.90512460, -67.35826150, 7.20, 0.00, '2026-09-19 01:14:23'),
(1055, 'cond-102a6e5a4a414e3c', NULL, 9.90511030, -67.35827300, 6.70, 0.00, '2026-09-19 01:14:28'),
(1058, 'cond-102a6e5a4a414e3c', NULL, 9.90510380, -67.35828240, 6.40, 0.00, '2026-09-19 01:14:33'),
(1061, 'cond-102a6e5a4a414e3c', NULL, 9.90509070, -67.35828590, 6.30, 0.00, '2026-09-19 01:14:38'),
(1064, 'cond-102a6e5a4a414e3c', NULL, 9.90509600, -67.35828010, 5.90, 1.00, '2026-09-19 01:14:43'),
(1067, 'cond-102a6e5a4a414e3c', NULL, 9.90509070, -67.35828150, 6.00, 1.00, '2026-09-19 01:14:48'),
(1070, 'cond-102a6e5a4a414e3c', NULL, 9.90509530, -67.35827170, 5.90, 1.00, '2026-09-19 01:14:53'),
(1073, 'cond-102a6e5a4a414e3c', NULL, 9.90509510, -67.35826380, 6.70, 1.00, '2026-09-19 01:15:04'),
(1076, 'cond-102a6e5a4a414e3c', NULL, 9.90509530, -67.35826160, 7.90, 1.00, '2026-09-19 01:15:08'),
(1079, 'cond-102a6e5a4a414e3c', NULL, 9.90508780, -67.35823690, 31.60, 1.00, '2026-09-19 01:15:29'),
(1082, 'cond-102a6e5a4a414e3c', NULL, 9.90512170, -67.35822180, 26.10, 1.00, '2026-09-19 01:15:34'),
(1085, 'cond-102a6e5a4a414e3c', NULL, 9.90511960, -67.35822240, 11.20, 1.00, '2026-09-19 01:15:39'),
(1088, 'cond-102a6e5a4a414e3c', NULL, 9.90511960, -67.35822240, 11.20, 1.00, '2026-09-19 01:15:45'),
(1091, 'cond-102a6e5a4a414e3c', NULL, 9.90511960, -67.35822240, 11.20, 1.00, '2026-09-19 01:15:50'),
(1094, 'cond-102a6e5a4a414e3c', NULL, 9.90511960, -67.35822240, 11.20, 1.00, '2026-09-19 01:15:54'),
(1097, 'cond-102a6e5a4a414e3c', NULL, 9.90510760, -67.35818270, 32.90, 6.00, '2026-09-19 01:19:31'),
(1100, 'cond-102a6e5a4a414e3c', NULL, 9.90509550, -67.35819650, 18.50, 1.00, '2026-09-19 01:19:36'),
(1103, 'cond-102a6e5a4a414e3c', NULL, 9.90510140, -67.35821400, 10.20, 1.00, '2026-09-19 01:19:41'),
(1106, 'cond-102a6e5a4a414e3c', NULL, 9.90509590, -67.35822140, 8.30, 1.00, '2026-09-19 01:19:46'),
(1109, 'cond-102a6e5a4a414e3c', NULL, 9.90508760, -67.35821960, 7.40, 1.00, '2026-09-19 01:19:51'),
(1112, 'cond-102a6e5a4a414e3c', NULL, 9.90508790, -67.35821950, 6.60, 1.00, '2026-09-19 01:19:56'),
(1115, 'cond-102a6e5a4a414e3c', NULL, 9.90508680, -67.35821950, 6.30, 1.00, '2026-09-19 01:20:01'),
(1118, 'cond-102a6e5a4a414e3c', NULL, 9.90508010, -67.35821830, 6.10, 1.00, '2026-09-19 01:20:06'),
(1121, 'cond-102a6e5a4a414e3c', NULL, 9.90507740, -67.35821630, 6.00, 1.00, '2026-09-19 01:20:11'),
(1124, 'cond-102a6e5a4a414e3c', NULL, 9.90508250, -67.35821540, 5.90, 1.00, '2026-09-19 01:20:16'),
(1127, 'cond-102a6e5a4a414e3c', NULL, 9.90507480, -67.35821760, 5.80, 1.00, '2026-09-19 01:20:22'),
(1130, 'cond-102a6e5a4a414e3c', NULL, 9.90507000, -67.35821950, 6.20, 1.00, '2026-09-19 01:20:26'),
(1133, 'cond-102a6e5a4a414e3c', NULL, 9.90508640, -67.35821280, 7.30, 1.00, '2026-09-19 01:20:31'),
(1136, 'cond-102a6e5a4a414e3c', NULL, 9.90509710, -67.35821790, 7.90, 1.00, '2026-09-19 01:20:36'),
(1139, 'cond-102a6e5a4a414e3c', NULL, 9.90510250, -67.35822330, 8.20, 1.00, '2026-09-19 01:20:42'),
(1142, 'cond-102a6e5a4a414e3c', NULL, 9.90510060, -67.35822210, 8.60, 1.00, '2026-09-19 01:20:46'),
(1145, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:20:52'),
(1148, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:01'),
(1151, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:06'),
(1154, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:11'),
(1157, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:16'),
(1160, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:21'),
(1163, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:27'),
(1166, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:31'),
(1169, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:41'),
(1172, 'cond-102a6e5a4a414e3c', NULL, 9.90509850, -67.35821950, 8.70, 1.00, '2026-09-19 01:21:46'),
(1175, 'cond-102a6e5a4a414e3c', NULL, 9.90515560, -67.35806690, 33.40, 3.00, '2026-09-19 01:25:55'),
(1178, 'cond-102a6e5a4a414e3c', NULL, 9.90514870, -67.35817040, 28.10, 4.00, '2026-09-19 01:26:00'),
(1181, 'cond-102a6e5a4a414e3c', NULL, 9.90515290, -67.35818510, 10.90, 3.00, '2026-09-19 01:26:05'),
(1184, 'cond-102a6e5a4a414e3c', NULL, 9.90513880, -67.35818980, 10.10, 1.00, '2026-09-19 01:26:10'),
(1187, 'cond-102a6e5a4a414e3c', NULL, 9.90512080, -67.35818880, 9.00, 1.00, '2026-09-19 01:26:16'),
(1190, 'cond-102a6e5a4a414e3c', NULL, 9.90510840, -67.35819690, 7.90, 1.00, '2026-09-19 01:26:20'),
(1193, 'cond-102a6e5a4a414e3c', NULL, 9.90510640, -67.35820510, 7.70, 1.00, '2026-09-19 01:26:25'),
(1196, 'cond-102a6e5a4a414e3c', NULL, 9.90510450, -67.35821080, 7.70, 1.00, '2026-09-19 01:26:30'),
(1199, 'cond-102a6e5a4a414e3c', NULL, 9.90509570, -67.35821490, 8.30, 1.00, '2026-09-19 01:26:35'),
(1202, 'cond-102a6e5a4a414e3c', NULL, 9.90509780, -67.35821710, 8.40, 1.00, '2026-09-19 01:26:40'),
(1205, 'cond-102a6e5a4a414e3c', NULL, 9.90509650, -67.35822780, 8.20, 1.00, '2026-09-19 01:26:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_admin`
--

CREATE TABLE `usuarios_admin` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('super_admin','operador','finanzas','soporte') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'super_admin',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios_admin`
--

INSERT INTO `usuarios_admin` (`id`, `username`, `password_hash`, `nombre`, `email`, `rol`, `activo`, `creado_en`) VALUES
('adm-super-001', 'vixydely', '123456', 'Super Administrador Vixy', 'vixydely@vixy.com', 'super_admin', 1, '2026-09-05 08:01:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_administracion_web`
--

CREATE TABLE `usuarios_administracion_web` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel_acceso` enum('super_admin','operador','finanzas','soporte','auditor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'operador',
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `debe_cambiar_clave` tinyint(1) DEFAULT '0',
  `fecha_ultimo_cambio_clave` date DEFAULT NULL,
  `fecha_vencimiento_clave` date DEFAULT NULL,
  `dias_vigencia_maximo` int DEFAULT '90',
  `pestanas_permitidas` json NOT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '/uploads/admin/avatares/default.jpg',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios_administracion_web`
--

INSERT INTO `usuarios_administracion_web` (`id`, `username`, `password_hash`, `nombre`, `email`, `nivel_acceso`, `departamento`, `activo`, `debe_cambiar_clave`, `fecha_ultimo_cambio_clave`, `fecha_vencimiento_clave`, `dias_vigencia_maximo`, `pestanas_permitidas`, `avatar_url`, `ultimo_acceso`, `creado_en`, `actualizado_en`) VALUES
('usr-root-vixydely', 'vixydely', '123456', 'Superusuario Central Vixy', 'vixydely@vixy.com', 'super_admin', 'Dirección General Vixy Express', 1, 0, '2026-09-05', '2026-12-04', 90, '[\"dashboard\", \"mapa_conductores\", \"mapa_flota\", \"recargas\", \"custodia\", \"reclamos\", \"pedidos\", \"conductores\", \"comercios\", \"incidencias\", \"soporte\", \"verificaciones\", \"pagos\", \"usuarios_web\", \"logs\", \"backend\"]', '/uploads/admin/avatares/default.jpg', '2026-09-16 04:07:59', '2026-09-05 08:01:00', '2026-09-16 04:07:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `verificaciones_recarga`
--

CREATE TABLE `verificaciones_recarga` (
  `id` bigint NOT NULL,
  `recarga_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comprobante_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referencia_reportada` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `conciliacion_confirmada` tinyint(1) NOT NULL DEFAULT '0',
  `nota_verificacion` text COLLATE utf8mb4_unicode_ci,
  `verificado_por` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verificado_por_usuario_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_verificacion` datetime DEFAULT NULL,
  `ip_solicitud` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `verificaciones_recarga`
--

INSERT INTO `verificaciones_recarga` (`id`, `recarga_id`, `comprobante_url`, `referencia_reportada`, `estado`, `conciliacion_confirmada`, `nota_verificacion`, `verificado_por`, `verificado_por_usuario_id`, `fecha_verificacion`, `ip_solicitud`, `creado_en`) VALUES
(2, 'rec-af56ba0d4ccc9b1b', '/api/uploads/comprobantes/comprobantes_20260913_151903_cf31c9f05c46eb27.jpg', '11111', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', '', '2026-09-13 15:20:27', '190.89.30.149', '2026-09-13 18:19:03'),
(5, 'rec-cb5ee62389dd5aff', '/api/uploads/comprobantes/comprobantes_20260913_163511_ce920131b14cf347.jpg', '176342', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', '', '2026-09-13 16:36:02', '200.8.34.245', '2026-09-13 19:35:11'),
(8, 'rec-63c563bd5ba1e4ed', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260915_134128_9a8a48d9a621ce3c.jpg', '11111', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-16 00:08:48', '2803:c000:8:4c23:c30a:312b:105b:b0c0', '2026-09-15 16:41:28'),
(11, 'rec-7b13389f20006909', '/backend/php/uploads/comprobantes/comprobantes_20260916_035732_df69e35c185eddd4.jpg', '6381627', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-16 03:58:28', '190.97.229.61', '2026-09-16 06:57:32'),
(14, 'rec-debb5ab3842f6591', '/api/uploads/comprobantes/comprobantes_20260916_173458_3d606d70f21148e5.jpg', '7382278', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-16 17:35:15', '181.208.252.202', '2026-09-16 20:34:58'),
(17, 'rec-d1be98276e13525a', '/api/uploads/comprobantes/comprobantes_20260916_173500_870c46a4164bfdb2.jpg', '7382278', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-16 17:35:28', '190.97.229.61', '2026-09-16 20:35:04'),
(20, 'rec-938fd9469962063c', '/api/uploads/comprobantes/comprobantes_20260916_193909_4552fc33a3c1ee95.jpg', '8291729', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-16 19:39:16', '181.208.252.202', '2026-09-16 22:39:09'),
(23, 'rec-6372ad744572ea03', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_025018_69124ce337bbe11b.jpg', '3333', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-18 03:18:06', '190.89.30.149', '2026-09-18 05:50:18'),
(26, 'rec-2ab6b937e1bcff25', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_025140_9675707d50e80be8.jpg', '73827288', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-18 03:18:05', '190.97.229.61', '2026-09-18 05:51:40'),
(29, 'rec-a6ee8af1e4e9a325', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_040659_36c1b14b1e6a3880.jpg', '7382761', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-18 04:07:17', '190.97.229.61', '2026-09-18 07:06:59'),
(32, 'rec-f8844351e313aaf9', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_050515_51489017502af67f.jpg', '627162', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-18 05:05:24', '190.97.229.61', '2026-09-18 08:05:15'),
(35, 'rec-9e3c388d02af5687', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_054319_dfe058e4c625b9c5.jpg', '6726272', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-18 05:43:25', '190.97.229.61', '2026-09-18 08:43:19'),
(38, 'rec-3c5fe721a82f2f86', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_112314_6c2e266f1e1268b6.jpg', '44455', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-18 11:24:13', '190.89.30.149', '2026-09-18 14:23:14'),
(41, 'rec-069c0a4424d9e164', 'https://www.vixy.uno/api/uploads/comprobantes/comprobantes_20260918_115726_4859613d2e7a01d2.jpg', 'ttyyu', 'aprobada', 1, 'Comprobante verificado con conciliación bancaria exitosa.', 'admin', 'admin-master', '2026-09-18 11:57:43', '190.89.30.149', '2026-09-18 14:57:26');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_comisiones_plataforma`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_comisiones_plataforma` (
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_pedidos_desglose_financiero`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_pedidos_desglose_financiero` (
`codigo_seguimiento` varchar(50)
,`costo_delivery_usd` decimal(10,2)
,`costo_producto_usd` decimal(10,2)
,`estado` enum('solicitud_enviada','pago_verificado','en_preparacion','esperando_repartidor','en_camino_al_cliente','entregado','cerrado_calificado','cancelado')
,`estado_despacho` enum('buscando_conductor','ofrecido_a_conductor','aceptado','en_camino_comercio','en_camino_cliente','completado','sin_conductores_disponibles')
,`fecha_pedido` timestamp
,`ganancia_app_usd` decimal(10,2)
,`ganancia_conductor_usd` decimal(10,2)
,`metodo_pago` varchar(50)
,`monto_total_bs` decimal(12,2)
,`monto_total_usd` decimal(10,2)
,`nombre_cliente` varchar(241)
,`nombre_comercio` varchar(150)
,`nombre_conductor` varchar(201)
,`pedido_id` varchar(50)
,`referencia_pago` varchar(100)
,`segundos_restantes_oferta` int
,`tasa_bcv_bs` decimal(10,4)
,`telefono_conductor` varchar(30)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_reclamos_financieros_pendientes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_reclamos_financieros_pendientes` (
`actualizado_en` timestamp
,`atendido_por` varchar(50)
,`creado_en` timestamp
,`descripcion` text
,`estado` enum('abierto','en_revision','aprobado','rechazado','resuelto','desestimado')
,`estado_reclamo_general` enum('abierto','en_revision','resuelto_favor_cliente','resuelto_favor_comercio','desestimado')
,`id` varchar(60)
,`liquidacion_id` varchar(60)
,`monto_reclamado_usd` decimal(12,2)
,`monto_resuelto_usd` decimal(12,2)
,`motivo_general` varchar(150)
,`pedido_id` varchar(50)
,`reclamo_id` varchar(50)
,`resolucion` text
,`tipo_reclamo` enum('saldo_no_acreditado','liquidacion_no_pagada','pago_no_recibido','comision_incorrecta','reembolso','otro')
,`tipo_usuario` enum('comercio','conductor')
,`usuario_id` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_saldos_billeteras`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_saldos_billeteras` (
`actualizado_en` timestamp
,`saldo_bs` decimal(16,2)
,`saldo_usd` decimal(14,2)
,`tipo_usuario` enum('admin','comercio','conductor')
,`usuario_id` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_wallets_comercios`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_wallets_comercios` (
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_wallets_conductores`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_wallets_conductores` (
);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditoria_logs`
--
ALTER TABLE `auditoria_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `billeteras_financieras`
--
ALTER TABLE `billeteras_financieras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_billetera_entidad` (`tipo_usuario`,`usuario_id`),
  ADD KEY `idx_billetera_usuario` (`usuario_id`,`tipo_usuario`);

--
-- Indices de la tabla `categorias_comercio`
--
ALTER TABLE `categorias_comercio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `telefono` (`telefono`);

--
-- Indices de la tabla `comercios`
--
ALTER TABLE `comercios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rif` (`rif`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `conductores`
--
ALTER TABLE `conductores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `telefono` (`telefono`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_cercania_gps` (`disponible`,`bloqueado_por_saldo`,`latitud_actual`,`longitud_actual`),
  ADD KEY `idx_conductor_codigo` (`codigo_conductor`),
  ADD KEY `idx_conductor_aprobado` (`verificado_por_admin`,`estado_registro`);

--
-- Indices de la tabla `configuracion_metodos_pago`
--
ALTER TABLE `configuracion_metodos_pago`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuracion_sistema`
--
ALTER TABLE `configuracion_sistema`
  ADD PRIMARY KEY (`clave`);

--
-- Indices de la tabla `confirmaciones_entrega`
--
ALTER TABLE `confirmaciones_entrega`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pedido_id` (`pedido_id`),
  ADD KEY `fk_conf_pedido` (`pedido_id`);

--
-- Indices de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_pedido` (`pedido_id`);

--
-- Indices de la tabla `entregas_carreras`
--
ALTER TABLE `entregas_carreras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pedido_id` (`pedido_id`),
  ADD KEY `fk_ent_conductor` (`conductor_id`);

--
-- Indices de la tabla `liquidaciones_comercios`
--
ALTER TABLE `liquidaciones_comercios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_liq_comercio` (`comercio_id`);

--
-- Indices de la tabla `liquidaciones_conductores`
--
ALTER TABLE `liquidaciones_conductores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_liq_conductor` (`conductor_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_seguimiento` (`codigo_seguimiento`),
  ADD KEY `fk_ped_cliente` (`cliente_id`),
  ADD KEY `fk_ped_comercio` (`comercio_id`),
  ADD KEY `fk_ped_conductor` (`conductor_id`),
  ADD KEY `idx_despacho_oferta` (`conductor_oferta_id`,`estado_despacho`),
  ADD KEY `idx_oferta_timer` (`conductor_oferta_id`,`estado_despacho`,`tiempo_limite_oferta`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_prod_comercio` (`comercio_id`);

--
-- Indices de la tabla `recargas_billetera`
--
ALTER TABLE `recargas_billetera`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `reclamos_evidencias`
--
ALTER TABLE `reclamos_evidencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_evidencia_reclamo` (`reclamo_id`);

--
-- Indices de la tabla `reclamos_financieros`
--
ALTER TABLE `reclamos_financieros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reclamo_fin_usuario` (`tipo_usuario`,`usuario_id`,`estado`),
  ADD KEY `idx_reclamo_fin_liquidacion` (`liquidacion_id`,`estado`),
  ADD KEY `idx_reclamo_fin_pedido` (`pedido_id`,`estado`);

--
-- Indices de la tabla `reclamos_incidencias`
--
ALTER TABLE `reclamos_incidencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_ticket` (`codigo_ticket`),
  ADD KEY `idx_reclamos_pedido_estado` (`pedido_id`,`estado`),
  ADD KEY `idx_reclamos_cliente_fecha` (`cliente_id`,`creado_en`);

--
-- Indices de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_sesiones_token_jti_hash` (`token_jti_hash`),
  ADD KEY `idx_sesiones_usuario` (`usuario_id`,`tipo_usuario`),
  ADD KEY `idx_sesiones_expira` (`expira_en`),
  ADD KEY `idx_sesiones_revocada` (`revocado_en`);

--
-- Indices de la tabla `solicitudes_liquidacion`
--
ALTER TABLE `solicitudes_liquidacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_liquidacion_usuario_estado` (`usuario_id`,`tipo_usuario`,`estado`),
  ADD KEY `idx_liquidacion_estado_fecha` (`estado`,`creado_en`);

--
-- Indices de la tabla `telemetria_dispositivos`
--
ALTER TABLE `telemetria_dispositivos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario` (`usuario_id`,`tipo_usuario`),
  ADD KEY `idx_gps` (`latitud`,`longitud`),
  ADD KEY `idx_actualizacion` (`ultima_actualizacion`);

--
-- Indices de la tabla `transacciones_billetera`
--
ALTER TABLE `transacciones_billetera`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ubicaciones_gps_conductores`
--
ALTER TABLE `ubicaciones_gps_conductores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_gps_conductor_fecha` (`conductor_id`,`creado_en`),
  ADD KEY `idx_gps_pedido_fecha` (`pedido_id`,`creado_en`);

--
-- Indices de la tabla `usuarios_admin`
--
ALTER TABLE `usuarios_admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `usuarios_administracion_web`
--
ALTER TABLE `usuarios_administracion_web`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `verificaciones_recarga`
--
ALTER TABLE `verificaciones_recarga`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_verificacion_recarga` (`recarga_id`),
  ADD KEY `idx_verificacion_estado_fecha` (`estado`,`creado_en`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditoria_logs`
--
ALTER TABLE `auditoria_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `telemetria_dispositivos`
--
ALTER TABLE `telemetria_dispositivos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12999;

--
-- AUTO_INCREMENT de la tabla `ubicaciones_gps_conductores`
--
ALTER TABLE `ubicaciones_gps_conductores`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1208;

--
-- AUTO_INCREMENT de la tabla `verificaciones_recarga`
--
ALTER TABLE `verificaciones_recarga`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_comisiones_plataforma`
--
DROP TABLE IF EXISTS `vista_comisiones_plataforma`;

CREATE ALGORITHM=UNDEFINED DEFINER=`c2861522`@`%` SQL SECURITY DEFINER VIEW `vista_comisiones_plataforma`  AS SELECT cast(`movimientos_wallet`.`creado_en` as date) AS `dia`, count(0) AS `pedidos_entregados`, round(sum(`movimientos_wallet`.`monto_neto_usd`),2) AS `comisiones_usd`, round(sum(`movimientos_wallet`.`monto_neto_bs`),2) AS `comisiones_bs` FROM `movimientos_wallet` WHERE ((`movimientos_wallet`.`tipo_usuario` = 'plataforma') AND (`movimientos_wallet`.`tipo_movimiento` = 'comision_plataforma')) GROUP BY cast(`movimientos_wallet`.`creado_en` as date) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos_desglose_financiero`
--
DROP TABLE IF EXISTS `vista_pedidos_desglose_financiero`;

CREATE ALGORITHM=UNDEFINED DEFINER=`c2861522`@`%` SQL SECURITY DEFINER VIEW `vista_pedidos_desglose_financiero`  AS SELECT `p`.`id` AS `pedido_id`, `p`.`codigo_seguimiento` AS `codigo_seguimiento`, `p`.`creado_en` AS `fecha_pedido`, `c`.`nombre` AS `nombre_comercio`, trim(concat(ifnull(`cli`.`nombre`,''),' ',ifnull(`cli`.`apellido`,''))) AS `nombre_cliente`, ifnull(concat(`d`.`nombre`,' ',`d`.`apellido`),'Sin Asignar') AS `nombre_conductor`, ifnull(`d`.`telefono`,'N/A') AS `telefono_conductor`, `p`.`metodo_pago` AS `metodo_pago`, `p`.`referencia_pago` AS `referencia_pago`, `p`.`costo_producto_usd` AS `costo_producto_usd`, `p`.`costo_delivery_usd` AS `costo_delivery_usd`, `p`.`monto_total_usd` AS `monto_total_usd`, `p`.`ganancia_conductor_usd` AS `ganancia_conductor_usd`, `p`.`ganancia_app_usd` AS `ganancia_app_usd`, `p`.`tasa_bcv_bs` AS `tasa_bcv_bs`, `p`.`monto_total_bs` AS `monto_total_bs`, `p`.`estado` AS `estado`, `p`.`estado_despacho` AS `estado_despacho`, `p`.`segundos_restantes_oferta` AS `segundos_restantes_oferta` FROM (((`pedidos` `p` left join `comercios` `c` on((`p`.`comercio_id` = `c`.`id`))) left join `clientes` `cli` on((`p`.`cliente_id` = `cli`.`id`))) left join `conductores` `d` on((`p`.`conductor_id` = `d`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_reclamos_financieros_pendientes`
--
DROP TABLE IF EXISTS `vista_reclamos_financieros_pendientes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`c2861522`@`%` SQL SECURITY DEFINER VIEW `vista_reclamos_financieros_pendientes`  AS SELECT `rf`.`id` AS `id`, `rf`.`reclamo_id` AS `reclamo_id`, `rf`.`pedido_id` AS `pedido_id`, `rf`.`liquidacion_id` AS `liquidacion_id`, `rf`.`tipo_usuario` AS `tipo_usuario`, `rf`.`usuario_id` AS `usuario_id`, `rf`.`tipo_reclamo` AS `tipo_reclamo`, `rf`.`monto_reclamado_usd` AS `monto_reclamado_usd`, `rf`.`monto_resuelto_usd` AS `monto_resuelto_usd`, `rf`.`estado` AS `estado`, `rf`.`descripcion` AS `descripcion`, `rf`.`resolucion` AS `resolucion`, `rf`.`atendido_por` AS `atendido_por`, `rf`.`creado_en` AS `creado_en`, `rf`.`actualizado_en` AS `actualizado_en`, `r`.`estado` AS `estado_reclamo_general`, `r`.`motivo` AS `motivo_general` FROM (`reclamos_financieros` `rf` left join `reclamos_incidencias` `r` on((`r`.`id` = `rf`.`reclamo_id`))) WHERE (`rf`.`estado` in ('abierto','en_revision','aprobado')) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_saldos_billeteras`
--
DROP TABLE IF EXISTS `vista_saldos_billeteras`;

CREATE ALGORITHM=UNDEFINED DEFINER=`c2861522`@`%` SQL SECURITY DEFINER VIEW `vista_saldos_billeteras`  AS SELECT `billeteras_financieras`.`tipo_usuario` AS `tipo_usuario`, `billeteras_financieras`.`usuario_id` AS `usuario_id`, `billeteras_financieras`.`saldo_usd` AS `saldo_usd`, `billeteras_financieras`.`saldo_bs` AS `saldo_bs`, `billeteras_financieras`.`actualizado_en` AS `actualizado_en` FROM `billeteras_financieras` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_wallets_comercios`
--
DROP TABLE IF EXISTS `vista_wallets_comercios`;

CREATE ALGORITHM=UNDEFINED DEFINER=`c2861522`@`%` SQL SECURITY DEFINER VIEW `vista_wallets_comercios`  AS SELECT `movimientos_wallet`.`usuario_id` AS `comercio_id`, cast(`movimientos_wallet`.`creado_en` as date) AS `dia`, count(0) AS `movimientos`, round(sum(`movimientos_wallet`.`monto_bruto_usd`),2) AS `ventas_brutas_usd`, round(sum(`movimientos_wallet`.`comision_usd`),2) AS `deducciones_usd`, round(sum(`movimientos_wallet`.`monto_neto_usd`),2) AS `saldo_neto_usd` FROM `movimientos_wallet` WHERE (`movimientos_wallet`.`tipo_usuario` = 'comercio') GROUP BY `movimientos_wallet`.`usuario_id`, cast(`movimientos_wallet`.`creado_en` as date) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_wallets_conductores`
--
DROP TABLE IF EXISTS `vista_wallets_conductores`;

CREATE ALGORITHM=UNDEFINED DEFINER=`c2861522`@`%` SQL SECURITY DEFINER VIEW `vista_wallets_conductores`  AS SELECT `movimientos_wallet`.`usuario_id` AS `conductor_id`, cast(`movimientos_wallet`.`creado_en` as date) AS `dia`, count(0) AS `movimientos`, round(sum(`movimientos_wallet`.`monto_bruto_usd`),2) AS `ingresos_brutos_usd`, round(sum(`movimientos_wallet`.`comision_usd`),2) AS `deducciones_usd`, round(sum(`movimientos_wallet`.`monto_neto_usd`),2) AS `saldo_neto_usd` FROM `movimientos_wallet` WHERE (`movimientos_wallet`.`tipo_usuario` = 'conductor') GROUP BY `movimientos_wallet`.`usuario_id`, cast(`movimientos_wallet`.`creado_en` as date) ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
