-- ==============================================================================
-- VIXY DELIVERY - SCHEMA DE ALMACENAMIENTO DE IMÁGENES Y CONSULTAS SQL
-- ==============================================================================
USE vixy_platform_db;

-- ------------------------------------------------------------------------------
-- 1. TABLA: productos_catalogo
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos_catalogo (
    id VARCHAR(50) PRIMARY KEY,
    comercio_id VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_usd DECIMAL(10, 2) NOT NULL,
    precio_bs DECIMAL(12, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    imagen_url VARCHAR(255) NOT NULL DEFAULT '/uploads/productos/default.jpg',
    disponible BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (comercio_id) REFERENCES comercios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLA: confirmaciones_entrega (FOTO DE ENTREGA Y COMPROBANTE GPS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS confirmaciones_entrega (
    id VARCHAR(50) PRIMARY KEY,
    pedido_id VARCHAR(50) NOT NULL UNIQUE,
    conductor_id VARCHAR(50) NOT NULL,
    cliente_id VARCHAR(50) NOT NULL,
    foto_entrega_url VARCHAR(255) NOT NULL,
    latitud_entrega DECIMAL(10, 8) NOT NULL,
    longitud_entrega DECIMAL(11, 8) NOT NULL,
    precision_gps_metros DECIMAL(6, 2) DEFAULT 0.00,
    receptor_nombre VARCHAR(100) NOT NULL,
    receptor_cedula VARCHAR(30),
    notas_entrega TEXT,
    
    -- Calificaciones cliente
    calificado BOOLEAN DEFAULT FALSE,
    rating_comercio INT DEFAULT 5,
    rating_conductor INT DEFAULT 5,
    comentario_cliente TEXT,
    peticion_cerrada BOOLEAN DEFAULT FALSE,
    cerrada_en TIMESTAMP NULL,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLA: reclamos_incidencias & reclamos_evidencias (FOTOS DE RECLAMOS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reclamos_incidencias (
    id VARCHAR(50) PRIMARY KEY,
    pedido_id VARCHAR(50) NOT NULL,
    cliente_id VARCHAR(50) NOT NULL,
    comercio_id VARCHAR(50) NOT NULL,
    conductor_id VARCHAR(50) NULL,
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    estado ENUM('abierto', 'en_revision', 'resuelta_reembolso', 'resuelta_reposicion', 'rechazado') NOT NULL DEFAULT 'abierto',
    resolucion_admin TEXT,
    resuelto_por VARCHAR(50),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reclamos_evidencias (
    id VARCHAR(50) PRIMARY KEY,
    reclamo_id VARCHAR(50) NOT NULL,
    imagen_url VARCHAR(255) NOT NULL,
    descripcion_evidencia VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reclamo_id) REFERENCES reclamos_incidencias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLA: comprobantes_pago (PAGOS MÓVIL, ZELLE, BINANCE, RECARGAS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comprobantes_pago (
    id VARCHAR(50) PRIMARY KEY,
    tipo_operacion ENUM('pago_pedido', 'recarga_billetera_conductor', 'recarga_billetera_comercio', 'recarga_billetera_cliente') NOT NULL,
    referencia_id VARCHAR(50) NOT NULL, -- pedido_id o recarga_id
    usuario_id VARCHAR(50) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    numero_referencia VARCHAR(100) NOT NULL,
    monto_usd DECIMAL(10, 2) NOT NULL,
    monto_bs DECIMAL(12, 2) NOT NULL,
    comprobante_imagen_url VARCHAR(255) NOT NULL,
    estado ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente',
    verificado_por VARCHAR(50),
    verificado_en TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLA: ubicaciones_gps_conductores (HISTORIAL Y TRACKING EN TIEMPO REAL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ubicaciones_gps_conductores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conductor_id VARCHAR(50) NOT NULL,
    pedido_id VARCHAR(50) NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    precision_metros DECIMAL(6, 2) DEFAULT 0.00,
    velocidad_kmh DECIMAL(5, 2) DEFAULT 0.00,
    rumbo_grados DECIMAL(5, 2) DEFAULT 0.00,
    registrado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conductor_reciente (conductor_id, registrado_en DESC),
    FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
