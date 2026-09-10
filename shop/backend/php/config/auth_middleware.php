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

    public static function generateToken(array $payload, int $expiresInSeconds = null): string {
        if ($expiresInSeconds === null) {
            $expiresInSeconds = defined('JWT_EXPIRY_SECONDS') ? JWT_EXPIRY_SECONDS : 86400 * 7;
        }

        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresInSeconds;
        $payloadJson = json_encode($payload);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payloadJson));

        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, self::getSecret(), true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    }

    public static function verifyToken(?string $token = null): ?array {
        if (!$token) {
            $headers = function_exists('getallheaders') ? getallheaders() : [];
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] 
                ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ''));
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            } else if (!empty($authHeader) && strlen($authHeader) > 20 && strpos($authHeader, '.') !== false) {
                $token = trim($authHeader);
            } else {
                $token = $headers['X-Auth-Token'] ?? $headers['x-auth-token'] 
                    ?? ($_SERVER['HTTP_X_AUTH_TOKEN'] ?? null);
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

        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, self::getSecret(), true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($expectedSignature, $base64Signature)) {
            return null;
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null; // Token expirado
        }

        return $payload;
    }

    public static function requireAuth(array $rolesPermitidos = []): array {
        $user = self::verifyToken();

        if ($user) {
            $userRole  = $user['tipo_usuario'] ?? '';
            $userLevel = $user['nivel_acceso'] ?? $user['rol'] ?? $userRole;

            // Super admin siempre permitido (el token de admin viene con nivel_acceso='super_admin')
            if ($userRole === 'super_admin' || $userLevel === 'super_admin') {
                return $user;
            }

            if (empty($rolesPermitidos)
                || in_array($userLevel, $rolesPermitidos, true)
                || in_array($userRole, $rolesPermitidos, true)) {
                return $user;
            }

            Database::jsonResponse([
                'error' => true,
                'mensaje' => 'Permisos insuficientes para realizar esta acción'
            ], 403);
        }

        // Fallback: clave interna del panel de administración
        if (self::hasAdminKey()) {
            return [
                'tipo_usuario' => 'super_admin',
                'nivel_acceso' => 'super_admin',
                'via' => 'admin_key'
            ];
        }

        Database::jsonResponse([
            'error' => true,
            'mensaje' => 'Acceso denegado: Token no provisto o expirado'
        ], 401);
    }

    // Alias semántico para acciones administrativas
    public static function requireAdmin(array $rolesPermitidos = []): array {
        return self::requireAuth($rolesPermitidos);
    }
}
