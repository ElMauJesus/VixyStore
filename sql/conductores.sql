-- ==============================================================================
-- SISTEMA VIXY DELIVERY & STORE - ESQUEMA DE BASE DE DATOS MYSQL / MARIADB
-- ARCHIVO: sql/conductores.sql
-- TABLAS: conductores, conductores_legal, billeteras_conductor, transacciones_conductor
-- RUTAS WEB API ASOCIADAS:
--   POST /api/v1/conductores/registro
--   POST /api/v1/conductores/login
--   GET  /api/v1/conductores/{id}/perfil
--   PUT  /api/v1/conductores/{id}/disponibilidad
--   PUT  /api/v1/conductores/{id}/ubicacion-gps
--   GET  /api/v1/conductores/disponibles-cercanos?lat={lat}&lng={lng}
--   POST /api/v1/conductores/{id}/recarga
-- ==============================================================================

USE vixy_platform_db;

-- 1. Tabla Principal de Conductores / Motorizados (Vixy Delivery)
CREATE TABLE IF NOT EXISTS conductores (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(30) NOT NULL UNIQUE,
    fecha_nacimiento DATE DEFAULT NULL,
    telefono VARCHAR(30) NOT NULL UNIQUE,
    telefono_adicional VARCHAR(30) DEFAULT NULL,
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    foto_url VARCHAR(255) DEFAULT '/uploads/conductores/default.jpg',
    direccion TEXT DEFAULT NULL,
    punto_referencia VARCHAR(255) DEFAULT NULL,
    
    -- Estatus Operativo
    disponible BOOLEAN DEFAULT TRUE COMMENT 'Indica si está conectado y listo para recibir carreras',
    en_carrera BOOLEAN DEFAULT FALSE,
    pedido_activo_id VARCHAR(50) NULL,
    
    -- Coordenadas GPS en Tiempo Real
    latitud_actual DECIMAL(10, 8) NOT NULL DEFAULT 10.49100000,
    longitud_actual DECIMAL(11, 8) NOT NULL DEFAULT -66.86200000,
    ultima_actualizacion_gps TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Datos del Vehículo
    tipo_vehiculo ENUM('moto', 'auto') DEFAULT 'moto',
    placa_moto VARCHAR(20) DEFAULT NULL,
    marca_moto VARCHAR(50) DEFAULT NULL,
    modelo_moto VARCHAR(50) DEFAULT NULL,
    color_moto VARCHAR(30) DEFAULT 'Negro',
    
    -- Documentos
    foto_licencia_url VARCHAR(255) DEFAULT NULL,
    foto_rcv_url VARCHAR(255) DEFAULT NULL,
    foto_certificado_medico_url VARCHAR(255) DEFAULT NULL,
    foto_vehiculo_url VARCHAR(255) DEFAULT NULL,
    
    -- Pago del Registro
    metodo_pago VARCHAR(50) DEFAULT NULL,
    referencia_pago VARCHAR(100) DEFAULT NULL,
    
    -- Métricas de Desempeño
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_carreras_completadas INT DEFAULT 0,
    total_entregas_fallidas INT DEFAULT 0,
    estado_verificacion ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido') DEFAULT 'pendiente',
    
    saldo_billetera_usd DECIMAL(10, 2) DEFAULT 0.00,
    limite_saldo_negativo DECIMAL(10, 2) DEFAULT -0.50,
    bloqueado_por_saldo BOOLEAN DEFAULT FALSE,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_disponible_gps (disponible, en_carrera, latitud_actual, longitud_actual),
    INDEX idx_cedula (cedula),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Documentación Legal y Datos del Vehículo (INTT Venezuela)
CREATE TABLE IF NOT EXISTS conductores_legal (
    id VARCHAR(50) PRIMARY KEY,
    conductor_id VARCHAR(50) NOT NULL UNIQUE,
    licencia_intt_numero VARCHAR(50) DEFAULT NULL,
    licencia_grado ENUM('2da', '3ra', '4ta') DEFAULT '2da',
    licencia_vencimiento DATE DEFAULT NULL,
    certificado_medico_vencimiento DATE DEFAULT NULL,
    rcv_poliza_numero VARCHAR(80) DEFAULT NULL,
    rcv_aseguradora VARCHAR(100) DEFAULT NULL,
    rcv_vencimiento DATE DEFAULT NULL,
    
    -- Datos del Vehículo
    marca_moto VARCHAR(80) DEFAULT NULL,
    modelo_moto VARCHAR(80) DEFAULT NULL,
    anio_moto INT DEFAULT NULL,
    color_moto VARCHAR(50) DEFAULT NULL,
    placa_vehiculo VARCHAR(30) DEFAULT NULL,
    serial_carroceria VARCHAR(80),
    
    -- Fotos de Documentos y Verificación
    foto_cedula_url VARCHAR(255),
    foto_licencia_url VARCHAR(255),
    foto_rcv_url VARCHAR(255),
    foto_carnet_circulacion_url VARCHAR(255),
    
    FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Billetera y Regla de Saldo Negativo (-$0.50 USD)
CREATE TABLE IF NOT EXISTS billeteras_conductor (
    id VARCHAR(50) PRIMARY KEY,
    conductor_id VARCHAR(50) NOT NULL UNIQUE,
    saldo_usd DECIMAL(10, 2) DEFAULT 0.00,
    saldo_bs DECIMAL(12, 2) DEFAULT 0.00,
    limite_saldo_negativo DECIMAL(10, 2) DEFAULT -0.50 COMMENT 'Si saldo_usd <= -0.50, se bloquea recepción de carreras',
    bloqueado_por_saldo BOOLEAN DEFAULT FALSE,
    total_ganado_usd DECIMAL(12, 2) DEFAULT 0.00,
    total_comisiones_pagadas_usd DECIMAL(12, 2) DEFAULT 0.00,
    carpeta_comprobantes VARCHAR(255) DEFAULT '/uploads/comprobantes/',
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Historial de Transacciones de Billetera Conductor
CREATE TABLE IF NOT EXISTS transacciones_conductor (
    id VARCHAR(50) PRIMARY KEY,
    conductor_id VARCHAR(50) NOT NULL,
    tipo ENUM('comision_carrera', 'ganancia_carrera', 'recarga_saldo', 'penalizacion', 'ajuste') NOT NULL,
    monto_usd DECIMAL(10, 2) NOT NULL,
    saldo_resultante_usd DECIMAL(10, 2) NOT NULL,
    pedido_id VARCHAR(50) NULL,
    codigo_seguimiento VARCHAR(50) NULL,
    metodo_pago ENUM('pago_movil', 'zelle', 'efectivo', 'saldo_cartera', 'zinli', 'binance') NULL,
    referencia VARCHAR(100) NULL,
    descripcion TEXT NOT NULL,
    estado ENUM('pendiente', 'completado', 'fallido', 'reversado') DEFAULT 'completado',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE CASCADE,
    INDEX idx_conductor_fecha (conductor_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;