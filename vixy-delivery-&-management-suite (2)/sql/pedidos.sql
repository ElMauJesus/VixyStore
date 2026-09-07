-- ==============================================================================
-- SISTEMA VIXY DELIVERY & STORE - ESQUEMA DE BASE DE DATOS MYSQL / MARIADB
-- ARCHIVO: sql/pedidos.sql
-- TABLAS: clientes, pedidos, pedido_items, pedido_historial, confirmaciones_entrega
-- RUTAS WEB API ASOCIADAS:
--   POST /api/v1/pedidos/crear
--   GET  /api/v1/pedidos/{id}
--   PUT  /api/v1/pedidos/{id}/aceptar-comercio
--   PUT  /api/v1/pedidos/{id}/rechazar-comercio
--   PUT  /api/v1/pedidos/{id}/asignar-conductor
--   PUT  /api/v1/pedidos/{id}/en-camino
--   PUT  /api/v1/pedidos/{id}/entregar-conductor
--   POST /api/v1/pedidos/{id}/calificar-y-cerrar  <-- Cierre definitivo de petición
-- ==============================================================================

USE vixy_platform_db;

-- 1. Tabla de Clientes (Vixy Pedidos)
CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(30) NOT NULL UNIQUE,
    username VARCHAR(80) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(120),
    direccion_principal TEXT NOT NULL,
    punto_referencia TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    avatar_url VARCHAR(255) DEFAULT '/uploads/clientes/avatares/default.jpg',
    saldo_cartera_usd DECIMAL(10, 2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla Principal de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id VARCHAR(50) PRIMARY KEY,
    codigo_seguimiento VARCHAR(50) NOT NULL UNIQUE,
    cliente_id VARCHAR(50) NOT NULL,
    comercio_id VARCHAR(50) NOT NULL,
    conductor_id VARCHAR(50) NULL,
    
    -- Estados del Flujo Logístico
    estado ENUM(
        'solicitud_enviada',
        'pago_verificado',
        'en_preparacion',
        'esperando_repartidor',
        'en_camino_al_cliente',
        'entregado',
        'cerrado_calificado',
        'cancelado'
    ) NOT NULL DEFAULT 'solicitud_enviada',
    
    -- Desglose Financiero
    monto_subtotal_usd DECIMAL(10, 2) NOT NULL,
    costo_envio_usd DECIMAL(10, 2) NOT NULL,
    tasa_bcv_bs DECIMAL(10, 4) NOT NULL,
    monto_total_usd DECIMAL(10, 2) NOT NULL,
    monto_total_bs DECIMAL(12, 2) NOT NULL,
    
    -- Métodos de Pago y Comprobantes
    metodo_pago ENUM('saldo_cartera', 'pago_movil', 'zelle', 'efectivo', 'zinli', 'binance') NOT NULL,
    referencia_pago VARCHAR(100),
    comprobante_pago_url VARCHAR(255),
    
    -- Coordenadas y Tiempos
    origen_lat DECIMAL(10, 8),
    origen_lng DECIMAL(11, 8),
    destino_lat DECIMAL(10, 8),
    destino_lng DECIMAL(11, 8),
    destino_direccion TEXT NOT NULL,
    destino_punto_referencia TEXT,
    distancia_km DECIMAL(6, 2) DEFAULT 3.5,
    tiempo_estimado_segundos INT DEFAULT 1800,
    
    -- Control de Entrega y Calificación
    entregado_en TIMESTAMP NULL,
    cerrado_en TIMESTAMP NULL,
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (comercio_id) REFERENCES comercios(id),
    FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE SET NULL,
    INDEX idx_estado_cliente (cliente_id, estado),
    INDEX idx_estado_comercio (comercio_id, estado),
    INDEX idx_estado_conductor (conductor_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Artículos por Pedido
CREATE TABLE IF NOT EXISTS pedido_items (
    id VARCHAR(50) PRIMARY KEY,
    pedido_id VARCHAR(50) NOT NULL,
    producto_id VARCHAR(50) NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario_usd DECIMAL(10, 2) NOT NULL,
    subtotal_usd DECIMAL(10, 2) NOT NULL,
    notas_item TEXT,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Confirmación de Entrega y Calificación (Cierre de Petición)
CREATE TABLE IF NOT EXISTS confirmaciones_entrega (
    id VARCHAR(50) PRIMARY KEY,
    pedido_id VARCHAR(50) NOT NULL UNIQUE,
    cliente_id VARCHAR(50) NOT NULL,
    comercio_id VARCHAR(50) NOT NULL,
    conductor_id VARCHAR(50) NULL,
    
    calificacion_comercio INT NOT NULL CHECK (calificacion_comercio BETWEEN 1 AND 5),
    calificacion_conductor INT NOT NULL CHECK (calificacion_conductor BETWEEN 1 AND 5),
    comentario TEXT,
    
    foto_entrega_url VARCHAR(255),
    fecha_confirmacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    peticion_cerrada BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (comercio_id) REFERENCES comercios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Historial y Trazabilidad Operacional del Pedido
CREATE TABLE IF NOT EXISTS pedido_historial (
    id VARCHAR(50) PRIMARY KEY,
    pedido_id VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    actor ENUM('cliente', 'comercio', 'conductor', 'backend', 'sistema') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
