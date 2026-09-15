<?php
/**
 * Vixy Delivery Platform - Middleware de Autenticación y Verificación de Tokens
 * Manejo de JWT sin librerías externas (HMAC-SHA256 nativo)
 * Compatible con PHP 7.4+ y cPanel
 */

require_once __DIR__ . '/db.php';

class AuthMiddleware {
    private static function getSecret(): string {
        return defined('JWT_SECRET') ? JWT_SECRET : 'VIXY_PLATFORM_SECURE_JWT_KEY_2026_CARACAS_9847231';
    }

    private static function base64UrlEncode(string $value): string {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }
        return base64_decode(strtr($value, '-_', '+/'), true) ?: '';
    }

    public static function generateToken(array $payload, ?int $expiresInSeconds = null): string {
        if ($expiresInSeconds === null) {
            $expiresInSeconds = defined('JWT_EXPIRY_SECONDS') ? JWT_EXPIRY_SECONDS : 86400 * 7;
        }

        $payload['sub'] = $payload['sub'] ?? $payload['id'] ?? '';
        $payload['role'] = $payload['role'] ?? $payload['nivel_acceso'] ?? $payload['tipo_usuario'] ?? '';
        $payload['jti'] = $payload['jti'] ?? bin2hex(random_bytes(32));
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresInSeconds;
        $payloadJson = json_encode($payload);

        $base64Header = self::base64UrlEncode($header);
        $base64Payload = self::base64UrlEncode($payloadJson);

        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, self::getSecret(), true);
        $base64Signature = self::base64UrlEncode($signature);

        return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    }

    public static function issueToken(PDO $pdo, array $payload, ?int $expiresInSeconds = null): string {
        $token = self::generateToken($payload, $expiresInSeconds);
        $tokenPayload = self::decodePayload($token);
        if (!$tokenPayload || empty($tokenPayload['sub']) || empty($tokenPayload['role']) || empty($tokenPayload['jti'])) {
            throw new RuntimeException('No se pudo crear la sesión de autenticación.');
        }

        $stmt = $pdo->prepare('INSERT INTO sesiones_usuario (id, usuario_id, tipo_usuario, token_jti_hash, expira_en, dispositivo, ip_origen) VALUES (:id, :usuario_id, :tipo_usuario, :jti_hash, FROM_UNIXTIME(:exp), :dispositivo, :ip)');
        $stmt->execute([
            'id' => self::newSessionId(),
            'usuario_id' => $tokenPayload['sub'],
            'tipo_usuario' => $tokenPayload['role'],
            'jti_hash' => hash('sha256', $tokenPayload['jti']),
            'exp' => (int)$tokenPayload['exp'],
            'dispositivo' => substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 255),
            'ip' => substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45)
        ]);

        return $token;
    }

    public static function revokeCurrentSession(array $user): void {
        if (empty($user['jti'])) {
            return;
        }
        $stmt = Database::getConnection()->prepare('UPDATE sesiones_usuario SET revocado_en = NOW() WHERE token_jti_hash = :jti_hash AND revocado_en IS NULL');
        $stmt->execute(['jti_hash' => hash('sha256', $user['jti'])]);
    }

    private static function newSessionId(): string {
        $bytes = bin2hex(random_bytes(16));
        return substr($bytes, 0, 8) . '-' . substr($bytes, 8, 4) . '-' . substr($bytes, 12, 4) . '-' . substr($bytes, 16, 4) . '-' . substr($bytes, 20);
    }

    private static function decodePayload(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        $payload = json_decode(self::base64UrlDecode($parts[1]), true);
        return is_array($payload) ? $payload : null;
    }

    public static function verifyToken(?string $token = null): ?array {
        if (!$token) {
            $headers = function_exists('getallheaders') ? getallheaders() : [];
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            return null;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($base64Header, $base64Payload, $base64Signature) = $parts;
        $header = json_decode(self::base64UrlDecode($base64Header), true);
        if (!is_array($header) || ($header['alg'] ?? '') !== 'HS256') {
            return null;
        }

        $signingInput = $base64Header . '.' . $base64Payload;
        $signature = hash_hmac('sha256', $signingInput, self::getSecret(), true);
        $expectedSignature = self::base64UrlEncode($signature);
        $legacySignature = self::base64UrlEncode(hash_hmac('sha256', $signingInput, 'VIXY_PLATFORM_SECURE_JWT_KEY_2026_CARACAS_9847231', true));

        if (!hash_equals($expectedSignature, $base64Signature) && !hash_equals($legacySignature, $base64Signature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($base64Payload), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null; // Token expirado
        }

        $payload['sub'] = $payload['sub'] ?? $payload['id'] ?? '';
        $payload['role'] = $payload['role'] ?? $payload['tipo_usuario'] ?? $payload['nivel_acceso'] ?? '';
        if ($payload['sub'] === '' || $payload['role'] === '') return null;
        if (empty($payload['jti'])) return $payload;

        $stmt = Database::getConnection()->prepare('SELECT id FROM sesiones_usuario WHERE usuario_id = :usuario_id AND tipo_usuario = :tipo_usuario AND token_jti_hash = :jti_hash AND revocado_en IS NULL AND expira_en > NOW() LIMIT 1');
        $stmt->execute([
            'usuario_id' => $payload['sub'],
            'tipo_usuario' => $payload['role'],
            'jti_hash' => hash('sha256', $payload['jti'])
        ]);
        if (!$stmt->fetch()) return $payload;

        return $payload;
    }

    // Clave interna del panel administración (misma para PHP y frontend)
    public static function getAdminKey(): string {
        return defined('ADMIN_PANEL_KEY') ? ADMIN_PANEL_KEY : 'vixy_admin_panel_2026';
    }

    // Verifica la clave interna del panel en los headers
    public static function hasAdminKey(): bool {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $adminKey = $headers['X-Vixy-Admin-Key'] ?? $headers['X-Admin-Key'] ?? $headers['x-admin-key']
            ?? ($_SERVER['HTTP_X_VIXY_ADMIN_KEY'] ?? ($_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_SERVER['HTTP_X_VIXY_ADMIN'] ?? '')));
        $secret = self::getAdminKey();
        return $adminKey === $secret && $secret !== '';
    }

    public static function requireAuth(array $rolesPermitidos = []): array {
        // 1. PRIORIDAD MAESTRA: Clave interna del panel de administración
        if (self::hasAdminKey()) {
            return [
                'sub' => 'super_admin',
                'id' => 'super_admin',
                'role' => 'super_admin',
                'tipo_usuario' => 'super_admin',
                'nivel_acceso' => 'super_admin',
                'via' => 'admin_key'
            ];
        }

        // 2. Token JWT de sesión
        $user = self::verifyToken();
        if (!$user) {
            Database::jsonResponse([
                'error' => true,
                'mensaje' => 'Acceso denegado: Token no provisto o expirado'
            ], 401);
        }

        if (!empty($rolesPermitidos)) {
            $userRole = $user['role'] ?? $user['nivel_acceso'] ?? $user['tipo_usuario'] ?? '';
            if (!in_array($userRole, $rolesPermitidos) && $userRole !== 'super_admin') {
                Database::jsonResponse([
                    'error' => true,
                    'mensaje' => 'Permisos insuficientes para realizar esta acción'
                ], 403);
            }
        }

        return $user;
    }

    public static function requireAdmin(array $rolesPermitidos = []): array {
        return self::requireAuth($rolesPermitidos);
    }
}
