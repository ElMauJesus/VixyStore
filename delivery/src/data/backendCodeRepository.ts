export interface BackendFile {
  path: string;
  name: string;
  folder: string;
  language: 'php' | 'sql' | 'dockerfile' | 'yaml' | 'htaccess' | 'json' | 'bash';
  description: string;
  content: string;
}

export const BACKEND_FILES: BackendFile[] = [
  {
    path: 'config/database.php',
    name: 'database.php',
    folder: 'config',
    language: 'php',
    description: 'Archivo de configuración centralizado y clase Singleton PDO para MySQL (Namecheap cPanel / Docker)',
    content: `<?php
/**
 * VIXY DELIVERY & MANAGEMENT SUITE
 * Archivo Centralizado de Conexión a Base de Datos MySQL
 * Compatible con Namecheap cPanel Shared Hosting y Entorno Docker
 */

class Database {
    // Credenciales para Namecheap cPanel o Variables de Entorno en Docker
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $charset;
    private $conn = null;

    public function __construct() {
        // Carga variables de entorno si existen (Docker), sino toma configuración Namecheap
        $this->host     = getenv('DB_HOST') ?: 'localhost'; // En Namecheap cPanel suele ser 'localhost'
        $this->db_name  = getenv('DB_NAME') ?: 'vixy_delivery_db';
        $this->username = getenv('DB_USER') ?: 'vixy_db_user';
        $this->password = getenv('DB_PASS') ?: 'SecretPass_Vixy2026!#';
        $this->port     = getenv('DB_PORT') ?: '3306';
        $this->charset  = 'utf8mb4';
    }

    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            return $this->conn;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Error de conexión con la base de datos MySQL.',
                'details' => $e->getMessage()
            ]);
            exit;
        }
    }
}
`
  },
  {
    path: 'config/jwt.php',
    name: 'jwt.php',
    folder: 'config',
    language: 'php',
    description: 'Implementación nativa de generación y validación de tokens JWT sin dependencias externas',
    content: `<?php
/**
 * VIXY DELIVERY - JWT AUTHENTICATION ENGINE (PHP Puro)
 * Provee codificación, decodificación y verificación de tokens Bearer JWT
 */

class JWT {
    private static $secret = 'VIXY_SECRET_SUPER_KEY_2026_VENEZUELA_JWT_NAMECHEAP';
    private static $algo = 'HS256';

    public static function generate($payload, $expirySeconds = 86400) {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algo]);
        $payload['iat'] = time();
        $payload['exp'] = time() + $expirySeconds;
        $payloadEncoded = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payloadEncoded);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function validate($jwt) {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            return false;
        }

        list($header, $payload, $signature) = $tokenParts;

        $validSignature = hash_hmac('sha256', $header . "." . $payload, self::$secret, true);
        $base64UrlValidSignature = self::base64UrlEncode($validSignature);

        if (!hash_equals($base64UrlValidSignature, $signature)) {
            return false;
        }

        $decodedPayload = json_decode(self::base64UrlDecode($payload), true);
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return false; // Token expirado
        }

        return $decodedPayload;
    }

    public static function getBearerToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (preg_match('/Bearer\\s(\\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
        return null;
    }

    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data) {
        $b64 = str_replace(['-', '_'], ['+', '/'], $data);
        return base64_decode($b64);
    }
}
`
  },
  {
    path: 'database/schema.sql',
    name: 'schema.sql',
    folder: 'database',
    language: 'sql',
    description: 'Esquema completo MySQL con tablas relacionales, llaves foráneas, tablas de leyes venezolanas y seeds demo',
    content: `-- ==========================================================
-- VIXY DELIVERY & MANAGEMENT SUITE - MYSQL DATABASE SCHEMA
-- Compatible con MySQL 5.7+ / 8.0 / MariaDB (Namecheap cPanel & Docker)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS ` + '`historial_operaciones`' + `;
DROP TABLE IF EXISTS ` + '`fotos_verificacion`' + `;
DROP TABLE IF EXISTS ` + '`incidencias`' + `;
DROP TABLE IF EXISTS ` + '`mensajes_chat`' + `;
DROP TABLE IF EXISTS ` + '`items_pedido`' + `;
DROP TABLE IF EXISTS ` + '`pedidos`' + `;
DROP TABLE IF EXISTS ` + '`productos`' + `;
DROP TABLE IF EXISTS ` + '`transacciones_cartera_conductor`' + `;
DROP TABLE IF EXISTS ` + '`conductores_cartera`' + `;
DROP TABLE IF EXISTS ` + '`conductores_leyes_ve`' + `;
DROP TABLE IF EXISTS ` + '`conductores`' + `;
DROP TABLE IF EXISTS ` + '`comercios`' + `;
DROP TABLE IF EXISTS ` + '`clientes`' + `;
DROP TABLE IF EXISTS ` + '`usuarios_administracion_web`' + `;
DROP TABLE IF EXISTS ` + '`usuarios_backend`' + `;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. TABLA: usuarios_administracion_web (Control de acceso por roles RBAC y pestañas permitidas)
CREATE TABLE ` + '`usuarios_administracion_web`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`nombre`' + ` VARCHAR(120) NOT NULL,
    ` + '`email`' + ` VARCHAR(150) UNIQUE NOT NULL,
    ` + '`password_hash`' + ` VARCHAR(255) NOT NULL,
    ` + '`nivel_acceso`' + ` ENUM('super_admin', 'operador', 'finanzas', 'soporte', 'auditor') NOT NULL DEFAULT 'operador',
    ` + '`departamento`' + ` VARCHAR(100) NOT NULL,
    ` + '`pestanas_permitidas`' + ` JSON NOT NULL COMMENT 'Array JSON con slugs de pestañas autorizadas ej: ["dashboard","pedidos","conductores"]',
    ` + '`activo`' + ` TINYINT(1) DEFAULT 1,
    ` + '`ultimo_acceso`' + ` DATETIME NULL,
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: clientes (Módulo Vixy Pedidos)
CREATE TABLE ` + '`clientes`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`nombre`' + ` VARCHAR(80) NOT NULL,
    ` + '`apellido`' + ` VARCHAR(80) NOT NULL,
    ` + '`cedula`' + ` VARCHAR(20) NOT NULL,
    ` + '`telefono`' + ` VARCHAR(30) NOT NULL,
    ` + '`email`' + ` VARCHAR(150) UNIQUE NOT NULL,
    ` + '`password_hash`' + ` VARCHAR(255) NOT NULL,
    ` + '`direccion`' + ` TEXT NOT NULL,
    ` + '`punto_referencia`' + ` VARCHAR(255),
    ` + '`lat`' + ` DECIMAL(10, 8),
    ` + '`lng`' + ` DECIMAL(11, 8),
    ` + '`avatar_url`' + ` VARCHAR(255),
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: comercios (Módulo Vixy Store - Datos de negocio y métodos de cobro directo)
CREATE TABLE ` + '`comercios`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`nombre`' + ` VARCHAR(150) NOT NULL,
    ` + '`categoria`' + ` VARCHAR(80) NOT NULL,
    ` + '`rif`' + ` VARCHAR(30) UNIQUE NOT NULL,
    ` + '`direccion`' + ` TEXT NOT NULL,
    ` + '`telefono`' + ` VARCHAR(30) NOT NULL,
    ` + '`email`' + ` VARCHAR(150) UNIQUE NOT NULL,
    ` + '`password_hash`' + ` VARCHAR(255) NOT NULL,
    ` + '`logo_url`' + ` VARCHAR(255),
    ` + '`portada_url`' + ` VARCHAR(255),
    ` + '`calificacion`' + ` DECIMAL(3, 2) DEFAULT 5.00,
    ` + '`costo_envio_usd`' + ` DECIMAL(6, 2) DEFAULT 2.50,
    ` + '`abierto`' + ` TINYINT(1) DEFAULT 1,
    ` + '`pago_movil_banco`' + ` VARCHAR(80),
    ` + '`pago_movil_telefono`' + ` VARCHAR(30),
    ` + '`pago_movil_cedula`' + ` VARCHAR(30),
    ` + '`zelle_email`' + ` VARCHAR(150),
    ` + '`zelle_titular`' + ` VARCHAR(150),
    ` + '`zinli_email`' + ` VARCHAR(150),
    ` + '`binance_pay_id`' + ` VARCHAR(50),
    ` + '`binance_nickname`' + ` VARCHAR(100),
    ` + '`paypal_email`' + ` VARCHAR(150),
    ` + '`efectivo_instrucciones`' + ` TEXT,
    ` + '`lat`' + ` DECIMAL(10, 8),
    ` + '`lng`' + ` DECIMAL(11, 8),
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: productos (Catálogo con imágenes en carpeta individual /uploads/comercios/{id}/articulos/)
CREATE TABLE ` + '`productos`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`comercio_id`' + ` INT NOT NULL,
    ` + '`nombre`' + ` VARCHAR(120) NOT NULL,
    ` + '`descripcion`' + ` TEXT,
    ` + '`precio_usd`' + ` DECIMAL(10, 2) NOT NULL,
    ` + '`categoria`' + ` VARCHAR(60),
    ` + '`imagen_url`' + ` VARCHAR(255),
    ` + '`imagen_ruta`' + ` VARCHAR(255) NOT NULL COMMENT 'Ruta individual en servidor ej: /uploads/comercios/{id}/articulos/{nombre}.jpg',
    ` + '`disponible`' + ` TINYINT(1) DEFAULT 1,
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (` + '`comercio_id`' + `) REFERENCES ` + '`comercios`' + `(` + '`id`' + `) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: conductores (Módulo Vixy Delivery)
CREATE TABLE ` + '`conductores`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`nombre`' + ` VARCHAR(80) NOT NULL,
    ` + '`apellido`' + ` VARCHAR(80) NOT NULL,
    ` + '`telefono`' + ` VARCHAR(30) NOT NULL,
    ` + '`email`' + ` VARCHAR(150) UNIQUE NOT NULL,
    ` + '`password_hash`' + ` VARCHAR(255) NOT NULL,
    ` + '`foto_url`' + ` VARCHAR(255),
    ` + '`disponible`' + ` TINYINT(1) DEFAULT 1,
    ` + '`activo`' + ` TINYINT(1) DEFAULT 1,
    ` + '`rating`' + ` DECIMAL(3, 2) DEFAULT 5.00,
    ` + '`total_entregas`' + ` INT DEFAULT 0,
    ` + '`lat_actual`' + ` DECIMAL(10, 8),
    ` + '`lng_actual`' + ` DECIMAL(11, 8),
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA: conductores_cartera (Cartera individual de cada conductor con saldo y límite negativo de $0.50)
CREATE TABLE ` + '`conductores_cartera`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`conductor_id`' + ` INT UNIQUE NOT NULL,
    ` + '`saldo_usd`' + ` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ` + '`limite_saldo_negativo`' + ` DECIMAL(5, 2) NOT NULL DEFAULT -0.50 COMMENT 'Límite máximo negativo estricto de -0.50$ USD',
    ` + '`servicios_realizados`' + ` INT NOT NULL DEFAULT 0,
    ` + '`total_comisiones_pagadas`' + ` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ` + '`bloqueado_por_saldo`' + ` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 si saldo_usd <= limite_saldo_negativo',
    ` + '`actualizado_en`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (` + '`conductor_id`' + `) REFERENCES ` + '`conductores`' + `(` + '`id`' + `) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLA: transacciones_cartera_conductor (Historial de recargas y comisiones de cada conductor)
CREATE TABLE ` + '`transacciones_cartera_conductor`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`conductor_id`' + ` INT NOT NULL,
    ` + '`tipo`' + ` ENUM('recarga', 'comision_carrera', 'ajuste', 'bono') NOT NULL,
    ` + '`monto`' + ` DECIMAL(10, 2) NOT NULL COMMENT 'Positivo para recargas, negativo para comisiones',
    ` + '`saldo_resultante`' + ` DECIMAL(10, 2) NOT NULL,
    ` + '`metodo_pago`' + ` ENUM('pago_movil', 'zelle', 'zinli', 'binance', 'paypal', 'efectivo') NULL,
    ` + '`referencia_bancaria`' + ` VARCHAR(100) NULL,
    ` + '`descripcion`' + ` VARCHAR(255) NOT NULL,
    ` + '`estado`' + ` ENUM('completado', 'pendiente_aprobacion') DEFAULT 'completado',
    ` + '`fecha_transaccion`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (` + '`conductor_id`' + `) REFERENCES ` + '`conductores`' + `(` + '`id`' + `) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABLA: conductores_leyes_ve (Cumplimiento de Ley de Transporte Terrestre Venezolana)
CREATE TABLE ` + '`conductores_leyes_ve`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`conductor_id`' + ` INT UNIQUE NOT NULL,
    ` + '`cedula_ve`' + ` VARCHAR(25) NOT NULL COMMENT 'Cédula con formato V- o E-',
    ` + '`licencia_grado`' + ` ENUM('2da', '3ra', '4ta', '5ta') NOT NULL DEFAULT '2da' COMMENT 'Grado 2da exigido para motocicletas',
    ` + '`licencia_numero`' + ` VARCHAR(50) NOT NULL,
    ` + '`licencia_vencimiento`' + ` DATE NOT NULL,
    ` + '`licencia_validada`' + ` TINYINT(1) DEFAULT 1,
    ` + '`certificado_medico_nro`' + ` VARCHAR(60) NOT NULL COMMENT 'Certificado Médico Vial MPPS/Colegio Médicos',
    ` + '`certificado_medico_vencimiento`' + ` DATE NOT NULL,
    ` + '`certificado_medico_validado`' + ` TINYINT(1) DEFAULT 1,
    ` + '`rcv_aseguradora`' + ` VARCHAR(100) NOT NULL COMMENT 'Póliza de Responsabilidad Civil de Vehículos',
    ` + '`rcv_poliza_nro`' + ` VARCHAR(80) NOT NULL,
    ` + '`rcv_vencimiento`' + ` DATE NOT NULL,
    ` + '`moto_marca`' + ` VARCHAR(60) NOT NULL COMMENT 'Empire, Bera, Suzuki, Honda, etc.',
    ` + '`moto_modelo`' + ` VARCHAR(60) NOT NULL COMMENT 'Horse 150, SBR 150, etc.',
    ` + '`moto_ano`' + ` SMALLINT NOT NULL,
    ` + '`moto_color`' + ` VARCHAR(30) NOT NULL,
    ` + '`moto_placa`' + ` VARCHAR(20) NOT NULL COMMENT 'Placa INTT',
    ` + '`moto_serial_motor`' + ` VARCHAR(60) NOT NULL,
    ` + '`moto_serial_chasis`' + ` VARCHAR(60) NOT NULL,
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (` + '`conductor_id`' + `) REFERENCES ` + '`conductores`' + `(` + '`id`' + `) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLA: pedidos (Con soporte ampliado de Zinli, Binance, PayPal, Efectivo, Pago Móvil y Zelle)
CREATE TABLE ` + '`pedidos`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`codigo_seguimiento`' + ` VARCHAR(20) UNIQUE NOT NULL,
    ` + '`cliente_id`' + ` INT NOT NULL,
    ` + '`comercio_id`' + ` INT NOT NULL,
    ` + '`conductor_id`' + ` INT NULL,
    ` + '`monto_subtotal_usd`' + ` DECIMAL(10, 2) NOT NULL,
    ` + '`costo_envio_usd`' + ` DECIMAL(6, 2) NOT NULL,
    ` + '`monto_total_usd`' + ` DECIMAL(10, 2) NOT NULL,
    ` + '`tasa_bcv_bs`' + ` DECIMAL(10, 4) NOT NULL,
    ` + '`monto_total_bs`' + ` DECIMAL(14, 2) NOT NULL,
    ` + '`metodo_pago`' + ` ENUM('pago_movil', 'zelle', 'zinli', 'binance', 'paypal', 'efectivo', 'efectivo_usd', 'punto_venta') NOT NULL,
    ` + '`referencia_pago`' + ` VARCHAR(100),
    ` + '`comprobante_pago_url`' + ` VARCHAR(255),
    ` + '`estado`' + ` ENUM('pendiente_pago', 'pago_verificado', 'en_preparacion', 'esperando_repartidor', 'en_camino_al_comercio', 'en_camino_al_cliente', 'entregado', 'cancelado') DEFAULT 'pendiente_pago',
    ` + '`tiempo_estimado_segundos`' + ` INT DEFAULT 1800,
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ` + '`updated_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (` + '`cliente_id`' + `) REFERENCES ` + '`clientes`' + `(` + '`id`' + `),
    FOREIGN KEY (` + '`comercio_id`' + `) REFERENCES ` + '`comercios`' + `(` + '`id`' + `),
    FOREIGN KEY (` + '`conductor_id`' + `) REFERENCES ` + '`conductores`' + `(` + '`id`' + `)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABLA: items_pedido
CREATE TABLE ` + '`items_pedido`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`pedido_id`' + ` INT NOT NULL,
    ` + '`producto_id`' + ` INT NOT NULL,
    ` + '`cantidad`' + ` INT NOT NULL,
    ` + '`precio_unitario_usd`' + ` DECIMAL(10, 2) NOT NULL,
    ` + '`subtotal_usd`' + ` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (` + '`pedido_id`' + `) REFERENCES ` + '`pedidos`' + `(` + '`id`' + `) ON DELETE CASCADE,
    FOREIGN KEY (` + '`producto_id`' + `) REFERENCES ` + '`productos`' + `(` + '`id`' + `)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLA: historial_operaciones (Auditoría de pasos logísticos)
CREATE TABLE ` + '`historial_operaciones`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`pedido_id`' + ` INT NOT NULL,
    ` + '`estado`' + ` VARCHAR(50) NOT NULL,
    ` + '`descripcion`' + ` TEXT NOT NULL,
    ` + '`actor`' + ` ENUM('cliente', 'comercio', 'conductor', 'sistema', 'administrador') NOT NULL,
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (` + '`pedido_id`' + `) REFERENCES ` + '`pedidos`' + `(` + '`id`' + `) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABLA: fotos_verificacion (Carpeta uploads/verificaciones/)
CREATE TABLE ` + '`fotos_verificacion`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`pedido_id`' + ` INT NOT NULL,
    ` + '`conductor_id`' + ` INT NOT NULL,
    ` + '`archivo_path`' + ` VARCHAR(255) NOT NULL,
    ` + '`coordenadas_gps`' + ` VARCHAR(80),
    ` + '`comentario`' + ` TEXT,
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (` + '`pedido_id`' + `) REFERENCES ` + '`pedidos`' + `(` + '`id`' + `) ON DELETE CASCADE,
    FOREIGN KEY (` + '`conductor_id`' + `) REFERENCES ` + '`conductores`' + `(` + '`id`' + `)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. TABLA: incidencias (Reportes en tiempo real)
CREATE TABLE ` + '`incidencias`' + ` (
    ` + '`id`' + ` INT AUTO_INCREMENT PRIMARY KEY,
    ` + '`codigo_incidencia`' + ` VARCHAR(30) UNIQUE NOT NULL,
    ` + '`pedido_id`' + ` INT NULL,
    ` + '`reportado_por`' + ` ENUM('cliente', 'comercio', 'conductor', 'operador') NOT NULL,
    ` + '`reportante_nombre`' + ` VARCHAR(100) NOT NULL,
    ` + '`tipo`' + ` ENUM('retraso', 'pedido_incompleto', 'accidente_moto', 'problema_pago', 'cliente_ausente', 'otro') NOT NULL,
    ` + '`prioridad`' + ` ENUM('alta', 'media', 'baja') DEFAULT 'media',
    ` + '`descripcion`' + ` TEXT NOT NULL,
    ` + '`estado`' + ` ENUM('abierta', 'en_revision', 'resuelta') DEFAULT 'abierta',
    ` + '`resolucion`' + ` TEXT NULL,
    ` + '`created_at`' + ` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (` + '`pedido_id`' + `) REFERENCES ` + '`pedidos`' + `(` + '`id`' + `) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA DE DEMOSTRACIÓN (1 Cliente, 1 Conductor, 1 Comercio)
-- ==========================================================
INSERT INTO ` + '`clientes`' + ` (` + '`id`' + `, ` + '`nombre`' + `, ` + '`apellido`' + `, ` + '`cedula`' + `, ` + '`telefono`' + `, ` + '`email`' + `, ` + '`password_hash`' + `, ` + '`direccion`' + `, ` + '`punto_referencia`' + `, ` + '`lat`' + `, ` + '`lng`' + `) VALUES
(1, 'Carlos', 'Mendoza', 'V-26.415.892', '+58 412 998 1234', 'carlos.mendoza@email.com', '$2y$10$e8w.DemoHashCustomer123', 'Av. Francisco de Miranda, Edif. Parque Cristal, Torre Este, Apto 72, Chacao', 'Frente a la estación Parque del Este', 10.4965, -66.8523);

INSERT INTO ` + '`conductores`' + ` (` + '`id`' + `, ` + '`nombre`' + `, ` + '`apellido`' + `, ` + '`telefono`' + `, ` + '`email`' + `, ` + '`password_hash`' + `, ` + '`rating`' + `, ` + '`total_entregas`' + `, ` + '`lat_actual`' + `, ` + '`lng_actual`' + `) VALUES
(1, 'Yeferson', 'Ramírez', '+58 414 332 9081', 'yeferson.delivery@vixy.com', '$2y$10$e8w.DemoHashDriver123', 4.90, 184, 10.4912, -66.8580);

INSERT INTO ` + '`conductores_leyes_ve`' + ` (` + '`conductor_id`' + `, ` + '`cedula_ve`' + `, ` + '`licencia_grado`' + `, ` + '`licencia_numero`' + `, ` + '`licencia_vencimiento`' + `, ` + '`certificado_medico_nro`' + `, ` + '`certificado_medico_vencimiento`' + `, ` + '`rcv_aseguradora`' + `, ` + '`rcv_poliza_nro`' + `, ` + '`rcv_vencimiento`' + `, ` + '`moto_marca`' + `, ` + '`moto_modelo`' + `, ` + '`moto_ano`' + `, ` + '`moto_color`' + `, ` + '`moto_placa`' + `, ` + '`moto_serial_motor`' + `, ` + '`moto_serial_chasis`' + `) VALUES
(1, 'V-24.892.110', '2da', 'LIC-2da-24892110', '2027-08-15', 'CMV-MPPS-481902-MIRANDA', '2027-03-20', 'Seguros Pirámide C.A.', 'RCV-MOTO-99210-2026', '2027-01-10', 'Empire Keeway', 'Horse 150cc', 2023, 'Rojo Carmesí', 'AA1B23C', 'EK162FMJ-982109', '8X3B4109823190283');

INSERT INTO ` + '`comercios`' + ` (` + '`id`' + `, ` + '`nombre`' + `, ` + '`categoria`' + `, ` + '`rif`' + `, ` + '`direccion`' + `, ` + '`telefono`' + `, ` + '`email`' + `, ` + '`password_hash`' + `, ` + '`costo_envio_usd`' + `, ` + '`pago_movil_banco`' + `, ` + '`pago_movil_telefono`' + `, ` + '`pago_movil_cedula`' + `, ` + '`zelle_email`' + `, ` + '`zelle_titular`' + `) VALUES
(1, 'Burger House Caracas', 'Hamburguesas & Grill', 'J-40192837-1', 'Calle Los Palos Grandes con 2da Transversal, Qta. La Gracia', '+58 212 285 4410', 'pedidos@burgerhouseccs.com', '$2y$10$e8w.DemoHashStore123', 2.50, 'Banco de Venezuela (0102)', '0412-9988112', 'J-40192837-1', 'pagos@burgerhouseccs.com', 'Burger House Gourmet LLC');

INSERT INTO ` + '`productos`' + ` (` + '`comercio_id`' + `, ` + '`nombre`' + `, ` + '`descripcion`' + `, ` + '`precio_usd`' + `, ` + '`categoria`' + `) VALUES
(1, 'Vixy Burger Doble Carne', 'Doble carne angus 150g, cheddar fundido, tocineta crujiente y cebolla caramelizada.', 8.50, 'Hamburguesas'),
(1, 'Crispy Chicken Supreme', 'Pechuga empanizada crujiente con ensalada coleslaw fresca.', 7.00, 'Hamburguesas'),
(1, 'Papas Rústicas con Trufa & Parmesano', 'Papas rústicas con aceite de trufa blanca y queso parmesano.', 3.50, 'Acompañantes');
`
  },
  {
    path: 'api/index.php',
    name: 'index.php (API Gateway)',
    folder: 'api',
    language: 'php',
    description: 'API Gateway central con enrutamiento REST, CORS habilitado y validación de endpoints',
    content: `<?php
/**
 * VIXY API GATEWAY - Enrutador Principal
 * Subdominio de producción: api.vixy.com
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Parse URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', trim($uri, '/'));

// Ejemplo: /api/pedidos/crear
$endpoint = $uri[1] ?? '';
$action   = $uri[2] ?? '';

$db = (new Database())->getConnection();

switch ($endpoint) {
    case 'auth':
        require_once __DIR__ . '/controllers/AuthController.php';
        $controller = new AuthController($db);
        $controller->handle($action);
        break;

    case 'pedidos':
        require_once __DIR__ . '/controllers/PedidosController.php';
        $controller = new PedidosController($db);
        $controller->handle($action);
        break;

    case 'conductores':
        require_once __DIR__ . '/controllers/ConductoresController.php';
        $controller = new ConductoresController($db);
        $controller->handle($action);
        break;

    case 'comercios':
        require_once __DIR__ . '/controllers/ComerciosController.php';
        $controller = new ComerciosController($db);
        $controller->handle($action);
        break;

    case 'verificaciones':
        require_once __DIR__ . '/controllers/VerificacionesController.php';
        $controller = new VerificacionesController($db);
        $controller->handle($action);
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Endpoint no encontrado en Vixy API Gateway',
            'service' => 'Vixy Microservices Gateway v2.4'
        ]);
        break;
}
`
  },
  {
    path: 'api/controllers/VerificacionesController.php',
    name: 'VerificacionesController.php',
    folder: 'api/controllers',
    language: 'php',
    description: 'Controlador para subida y almacenamiento seguro de fotos de comprobante en uploads/verificaciones/',
    content: `<?php
/**
 * Controlador de Imágenes de Verificación de Entrega
 * Almacena archivos en la carpeta del servidor /uploads/verificaciones/
 */

class VerificacionesController {
    private $db;
    private $uploadDir;

    public function __construct($db) {
        $this->db = $db;
        $this->uploadDir = __DIR__ . '/../../uploads/verificaciones/';
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function handle($action) {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($action === 'subir' && $method === 'POST') {
            $this->subirComprobante();
        } elseif ($action === 'listar' && $method === 'GET') {
            $this->listarVerificaciones();
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Acción no permitida']);
        }
    }

    private function subirComprobante() {
        // Validar token de conductor
        $token = JWT::getBearerToken();
        $auth = JWT::validate($token);
        if (!$auth || $auth['rol'] !== 'conductor') {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'No autorizado']);
            return;
        }

        $pedidoId = $_POST['pedido_id'] ?? null;
        $comentario = $_POST['comentario'] ?? 'Entrega completada exitosamente';
        $coordenadas = $_POST['coordenadas'] ?? '10.4912, -66.8580';

        if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Archivo de imagen inválido']);
            return;
        }

        $file = $_FILES['foto'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($ext, $allowed)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Formato no permitido']);
            return;
        }

        $nuevoNombre = 'entrega_' . $pedidoId . '_' . time() . '.' . $ext;
        $destino = $this->uploadDir . $nuevoNombre;

        if (move_uploaded_file($file['tmp_name'], $destino)) {
            // Guardar en MySQL
            $relPath = 'uploads/verificaciones/' . $nuevoNombre;
            $stmt = $this->db->prepare("INSERT INTO fotos_verificacion (pedido_id, conductor_id, archivo_path, coordenadas_gps, comentario) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$pedidoId, $auth['user_id'], $relPath, $coordenadas, $comentario]);

            // Actualizar estado del pedido a entregado
            $upd = $this->db->prepare("UPDATE pedidos SET estado = 'entregado' WHERE id = ?");
            $upd->execute([$pedidoId]);

            // Registrar en historial de operaciones
            $hist = $this->db->prepare("INSERT INTO historial_operaciones (pedido_id, estado, descripcion, actor) VALUES (?, 'entregado', 'Repartidor subió comprobante fotográfico y finalizó la entrega.', 'conductor')");
            $hist->execute([$pedidoId]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Comprobante de entrega registrado correctamente',
                'foto_url' => $relPath
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Fallo al mover el archivo subido']);
        }
    }

    private function listarVerificaciones() {
        $stmt = $this->db->query("
            SELECT f.*, p.codigo_seguimiento, c.nombre as conductor_nombre, cli.nombre as cliente_nombre
            FROM fotos_verificacion f
            JOIN pedidos p ON f.pedido_id = p.id
            JOIN conductores c ON f.conductor_id = c.id
            JOIN clientes cli ON p.cliente_id = cli.id
            ORDER BY f.created_at DESC
        ");
        echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
    }
}
`
  },
  {
    path: 'api/controllers/ArticulosComercioController.php',
    name: 'ArticulosComercioController.php',
    folder: 'api/controllers',
    language: 'php',
    description: 'Gestión de catálogo para Vixy Store: registra artículos y almacena fotos en carpeta individual /uploads/comercios/{id}/articulos/',
    content: `<?php
/**
 * VIXY STORE - Controlador de Artículos y Almacenamiento de Fotos
 * Las imágenes se guardan en la carpeta individual del comercio:
 * /uploads/comercios/{comercio_id}/articulos/{nombre_slug}.jpg
 * y se recuperan mediante consulta SQL a traves del campo imagen_ruta.
 */

class ArticulosComercioController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function handle($action) {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($action === 'listar' && $method === 'GET') {
            $this->listarArticulos();
        } elseif ($action === 'crear' && $method === 'POST') {
            $this->crearArticulo();
        } elseif ($action === 'actualizar' && $method === 'PUT') {
            $this->actualizarArticulo();
        } elseif ($action === 'eliminar' && $method === 'DELETE') {
            $this->eliminarArticulo();
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Acción no soportada']);
        }
    }

    private function listarArticulos() {
        $comercioId = $_GET['comercio_id'] ?? null;
        if (!$comercioId) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Falta comercio_id']);
            return;
        }

        $stmt = $this->db->prepare("
            SELECT id, comercio_id, nombre, descripcion, precio_usd, categoria, imagen_url, imagen_ruta, disponible, created_at
            FROM productos
            WHERE comercio_id = ?
            ORDER BY id DESC
        ");
        $stmt->execute([$comercioId]);
        echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
    }

    private function crearArticulo() {
        $token = JWT::getBearerToken();
        $auth = JWT::validate($token);
        if (!$auth || ($auth['rol'] !== 'comercio' && $auth['rol'] !== 'super_admin')) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'No autorizado']);
            return;
        }

        $comercioId = $auth['user_id'];
        $nombre = $_POST['nombre'] ?? '';
        $descripcion = $_POST['descripcion'] ?? '';
        $precioUsd = (float)($_POST['precio_usd'] ?? 0);
        $categoria = $_POST['categoria'] ?? 'General';
        $disponible = isset($_POST['disponible']) ? (int)$_POST['disponible'] : 1;

        if (empty($nombre) || $precioUsd <= 0) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Nombre y precio válidos requeridos']);
            return;
        }

        // Carpeta individual del comercio en Namecheap Shared Hosting
        $carpetaComercio = __DIR__ . "/../../uploads/comercios/{$comercioId}/articulos/";
        if (!file_exists($carpetaComercio)) {
            mkdir($carpetaComercio, 0755, true);
        }

        $slug = preg_replace('/[^a-z0-9]/', '_', strtolower($nombre));
        $imagenRuta = "/uploads/comercios/{$comercioId}/articulos/{$slug}_" . time() . ".jpg";
        $imagenUrl = $imagenRuta;

        if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
            $ext = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
            $nombreArchivo = "{$slug}_" . time() . ".{$ext}";
            $destino = $carpetaComercio . $nombreArchivo;
            if (move_uploaded_file($_FILES['foto']['tmp_name'], $destino)) {
                $imagenRuta = "/uploads/comercios/{$comercioId}/articulos/{$nombreArchivo}";
                $imagenUrl = $imagenRuta;
            }
        } elseif (!empty($_POST['imagen_url'])) {
            $imagenUrl = $_POST['imagen_url'];
        }

        $stmt = $this->db->prepare("
            INSERT INTO productos (comercio_id, nombre, descripcion, precio_usd, categoria, imagen_url, imagen_ruta, disponible)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$comercioId, $nombre, $descripcion, $precioUsd, $categoria, $imagenUrl, $imagenRuta, $disponible]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Artículo registrado exitosamente en la base de datos',
            'articulo_id' => $this->db->lastInsertId(),
            'imagen_ruta' => $imagenRuta
        ]);
    }

    private function actualizarArticulo() {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID de artículo requerido']);
            return;
        }

        $stmt = $this->db->prepare("
            UPDATE productos 
            SET nombre = COALESCE(?, nombre),
                descripcion = COALESCE(?, descripcion),
                precio_usd = COALESCE(?, precio_usd),
                categoria = COALESCE(?, categoria),
                disponible = COALESCE(?, disponible)
            WHERE id = ?
        ");
        $stmt->execute([
            $input['nombre'] ?? null,
            $input['descripcion'] ?? null,
            $input['precio_usd'] ?? null,
            $input['categoria'] ?? null,
            $input['disponible'] ?? null,
            $id
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Artículo actualizado']);
    }

    private function eliminarArticulo() {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID de artículo requerido']);
            return;
        }

        $stmt = $this->db->prepare("DELETE FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Artículo eliminado']);
    }
}
`
  },
  {
    path: 'api/controllers/CarteraConductorController.php',
    name: 'CarteraConductorController.php',
    folder: 'api/controllers',
    language: 'php',
    description: 'Gestión financiera de motorizados: límite de saldo deudor -$0.50 USD, recargas Binance/Zinli/PagoMóvil/PayPal',
    content: `<?php
/**
 * VIXY DELIVERY - Cartera Individual del Conductor y Límite de Saldo Negativo (-$0.50 USD)
 */

class CarteraConductorController {
    private $db;
    const LIMITE_NEGATIVO = -0.50; // Límite estricto de saldo deudor

    public function __construct($db) {
        $this->db = $db;
    }

    public function handle($action) {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($action === 'saldo' && $method === 'GET') {
            $this->consultarSaldo();
        } elseif ($action === 'recargar' && $method === 'POST') {
            $this->recargarCartera();
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Acción no válida']);
        }
    }

    private function consultarSaldo() {
        $token = JWT::getBearerToken();
        $auth = JWT::validate($token);
        if (!$auth || $auth['rol'] !== 'conductor') {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'No autorizado']);
            return;
        }

        $conductorId = $auth['user_id'];

        $stmt = $this->db->prepare("SELECT * FROM conductores_cartera WHERE conductor_id = ?");
        $stmt->execute([$conductorId]);
        $cartera = $stmt->fetch();

        if (!$cartera) {
            // Inicializar cartera si no existe
            $init = $this->db->prepare("INSERT INTO conductores_cartera (conductor_id, saldo_usd) VALUES (?, 0.00)");
            $init->execute([$conductorId]);
            $cartera = ['saldo_usd' => 0.00, 'total_ingresos_usd' => 0.00, 'bloqueado_por_saldo' => 0];
        }

        $estaBloqueado = ((float)$cartera['saldo_usd'] <= self::LIMITE_NEGATIVO) ? 1 : 0;

        // Obtener historial de transacciones
        $tx = $this->db->prepare("SELECT * FROM transacciones_cartera_conductor WHERE conductor_id = ? ORDER BY created_at DESC LIMIT 20");
        $tx->execute([$conductorId]);
        $transacciones = $tx->fetchAll();

        echo json_encode([
            'status' => 'success',
            'data' => [
                'saldo_usd' => (float)$cartera['saldo_usd'],
                'limite_saldo_negativo' => self::LIMITE_NEGATIVO,
                'bloqueado_por_saldo' => (bool)$estaBloqueado,
                'transacciones' => $transacciones
            ]
        ]);
    }

    private function recargarCartera() {
        $token = JWT::getBearerToken();
        $auth = JWT::validate($token);
        if (!$auth || $auth['rol'] !== 'conductor') {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'No autorizado']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $conductorId = $auth['user_id'];
        $monto = (float)($input['monto_usd'] ?? 0);
        $metodo = $input['metodo_pago'] ?? 'pago_movil'; // binance, zinli, paypal, pago_movil
        $referencia = $input['referencia'] ?? ('REC-' . rand(100000, 999999));

        if ($monto <= 0) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Monto de recarga inválido']);
            return;
        }

        $this->db->beginTransaction();
        try {
            // Actualizar saldo de cartera
            $upd = $this->db->prepare("
                UPDATE conductores_cartera 
                SET saldo_usd = saldo_usd + ?,
                    bloqueado_por_saldo = IF((saldo_usd + ?) <= -0.50, 1, 0)
                WHERE conductor_id = ?
            ");
            $upd->execute([$monto, $monto, $conductorId]);

            // Registrar transacción
            $ins = $this->db->prepare("
                INSERT INTO transacciones_cartera_conductor 
                (conductor_id, tipo, monto_usd, descripcion, metodo_pago, referencia, estado)
                VALUES (?, 'recarga', ?, 'Recarga de saldo a través de backend', ?, ?, 'completado')
            ");
            $ins->execute([$conductorId, $monto, $metodo, $referencia]);

            $this->db->commit();

            echo json_encode([
                'status' => 'success',
                'message' => 'Recarga procesada exitosamente en la base de datos MySQL',
                'nuevo_saldo_usd' => $monto
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error al procesar recarga: ' . $e->getMessage()]);
        }
    }
}
`
  },
  {
    path: '.htaccess',
    name: '.htaccess (Apache / Namecheap Rewrite)',
    folder: 'public_html',
    language: 'htaccess',
    description: 'Reglas de reescritura para Namecheap Shared Hosting cPanel',
    content: `# =========================================================
# VIXY DELIVERY SUITE - NAMECHEAP CPANEL .HTACCESS REWRITE
# =========================================================
RewriteEngine On
RewriteBase /

# Redirigir siempre a HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirección de llamadas API al gateway
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/index.php [QSA,L]

# Proteger archivos sensibles
<FilesMatch "(\\.env|database\\.php|jwt\\.php|composer\\.json|Dockerfile)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Permitir visualización de imágenes de verificación
<Directory "uploads/verificaciones">
    Options -Indexes
    AllowOverride None
    Order allow,deny
    Allow from all
</Directory>
`
  },
  {
    path: 'docker-compose.yml',
    name: 'docker-compose.yml',
    folder: 'docker',
    language: 'yaml',
    description: 'Configuración multi-contenedor para producción local o VPS: PHP 8.2 + Apache + MySQL 8.0',
    content: `version: '3.8'

services:
  # Servidor Web & API Gateway PHP 8.2
  vixy-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: vixy_backend_api
    restart: always
    ports:
      - "8080:80"
    environment:
      DB_HOST: vixy-mysql
      DB_NAME: vixy_delivery_db
      DB_USER: vixy_db_user
      DB_PASS: SecretPass_Vixy2026!#
      DB_PORT: 3306
      JWT_SECRET: VIXY_SECRET_SUPER_KEY_2026_VENEZUELA_JWT_NAMECHEAP
    volumes:
      - ./:/var/www/html
      - vixy_uploads:/var/www/html/uploads/verificaciones
    depends_on:
      - vixy-mysql

  # Base de Datos Relacional MySQL 8.0
  vixy-mysql:
    image: mysql:8.0
    container_name: vixy_mysql_database
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: RootPasswordVixy2026!
      MYSQL_DATABASE: vixy_delivery_db
      MYSQL_USER: vixy_db_user
      MYSQL_PASSWORD: SecretPass_Vixy2026!#
    ports:
      - "3306:3306"
    volumes:
      - vixy_mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  vixy_mysql_data:
  vixy_uploads:
`
  },
  {
    path: 'Dockerfile',
    name: 'Dockerfile',
    folder: 'docker',
    language: 'dockerfile',
    description: 'Imagen optimizada de PHP 8.2 con extensiones PDO MySQL, GD para fotos de comprobante y mod_rewrite',
    content: `FROM php:8.2-apache

# Instalar dependencias del sistema y módulos requeridos (PDO MySQL, GD para imágenes)
RUN apt-get update && apt-get install -y \\
    libpng-dev \\
    libjpeg-dev \\
    libfreetype6-dev \\
    zip \\
    unzip \\
    && docker-php-ext-configure gd --with-freetype --with-jpeg \\
    && docker-php-ext-install gd pdo pdo_mysql \\
    && a2enmod rewrite headers

# Configurar permisos para la carpeta de verificación de imágenes
RUN mkdir -p /var/www/html/uploads/verificaciones \\
    && chown -R www-data:www-data /var/www/html/uploads/verificaciones \\
    && chmod -R 755 /var/www/html/uploads/verificaciones

WORKDIR /var/www/html
EXPOSE 80
`
  },
  {
    path: 'namecheap/SUBDOMAINS_SETUP.md',
    name: 'SUBDOMAINS_SETUP.md',
    folder: 'namecheap',
    language: 'bash',
    description: 'Guía paso a paso para configurar los 4 subdominios en cPanel de Namecheap Shared Hosting',
    content: `# GUÍA DE CONFIGURACIÓN EN NAMECHEAP SHARED HOSTING (cPanel)

Para separar los módulos en Namecheap con dominios independientes:

1. Ingresar a cPanel de Namecheap -> "Domains" -> "Subdomains".
2. Crear los 5 subdominios apuntando a sus respectivas carpetas en public_html:
   - api.vixy.com        -> /public_html/api_gateway
   - admin.vixy.com      -> /public_html/vixy_management_web
   - pedidos.vixy.com    -> /public_html/vixy_pedidos_client
   - store.vixy.com      -> /public_html/vixy_store_commerce
   - delivery.vixy.com   -> /public_html/vixy_delivery_driver

3. Base de Datos MySQL:
   - cPanel -> "MySQL Databases":
     * Crear Base de Datos: 'vixy_delivery_db'
     * Crear Usuario: 'vixy_db_user' con contraseña segura
     * Asignar todos los privilegios al usuario sobre la BD
   - cPanel -> "phpMyAdmin":
     * Seleccionar 'vixy_delivery_db' e importar el archivo 'database/schema.sql'

4. Crear carpeta de comprobantes fotográficos:
   - Ruta: /public_html/uploads/verificaciones/
   - Asignar permisos chmod 755
`
  }
];
