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
    telefono VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT '/uploads/conductores/avatares/default.jpg',
    password_hash VARCHAR(255) NOT NULL,
    
    -- Estatus Operativo
    disponible BOOLEAN DEFAULT TRUE COMMENT 'Indica si está conectado y listo para recibir carreras',
    en_carrera BOOLEAN DEFAULT FALSE,
    pedido_activo_id VARCHAR(50) NULL,
    
    -- Coordenadas GPS en Tiempo Real
    latitud_actual DECIMAL(10, 8) NOT NULL,
    longitud_actual DECIMAL(11, 8) NOT NULL,
    ultima_actualizacion_gps TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Métricas de Desempeño
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_carreras_completadas INT DEFAULT 0,
    total_entregas_fallidas INT DEFAULT 0,
    estado_verificacion ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido') DEFAULT 'aprobado',
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_disponible_gps (disponible, en_carrera, latitud_actual, longitud_actual)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Documentación Legal y Datos del Vehículo (INTT Venezuela)
CREATE TABLE IF NOT EXISTS conductores_legal (
    id VARCHAR(50) PRIMARY KEY,
    conductor_id VARCHAR(50) NOT NULL UNIQUE,
    licencia_intt_numero VARCHAR(50) NOT NULL,
    licencia_grado ENUM('2da', '3ra', '4ta') DEFAULT '2da',
    licencia_vencimiento DATE NOT NULL,
    certificado_medico_vencimiento DATE NOT NULL,
    rcv_poliza_numero VARCHAR(80) NOT NULL,
    rcv_aseguradora VARCHAR(100) NOT NULL,
    rcv_vencimiento DATE NOT NULL,
    
    -- Datos de la Moto
    marca_moto VARCHAR(80) NOT NULL,
    modelo_moto VARCHAR(80) NOT NULL,
    anio_moto INT NOT NULL,
    color_moto VARCHAR(50) NOT NULL,
    placa_vehiculo VARCHAR(30) NOT NULL UNIQUE,
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
    carpeta_comprobantes VARCHAR(255) NOT NULL,
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
