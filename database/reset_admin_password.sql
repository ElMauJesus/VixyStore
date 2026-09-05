-- =============================================================================
-- RESET / RECUPERAR CONTRASEÑA DEL ADMINISTRADOR - Vixy Store
-- Base de datos: c2861522_vixy_st
-- =============================================================================
-- INSTRUCCIONES:
--   1. Abre phpMyAdmin
--   2. Selecciona la base de datos: c2861522_vixy_st
--   3. Ve a la pestaña "SQL"
--   4. Copia y pega TODO este contenido y haz clic en "Ejecutar"
-- =============================================================================

-- ✅ CONTRASEÑA DEL ADMIN: Admin2024!
-- Email: admin@vixystore.com

-- Paso 1: Asegurarse de que el rol administrator existe
INSERT INTO `roles` (`id`, `name`, `description`)
VALUES (1, 'administrator', 'Acceso total al panel administrativo')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Paso 2: Actualizar o crear el usuario administrador
-- Hash de bcrypt generado para la contraseña: Admin2024!
INSERT INTO `users` (`id`, `role_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `status`)
VALUES (
    1,
    1,
    'Administrador',
    'Vixy',
    'admin@vixystore.com',
    '$2y$10$Y1lhCrrYcELI9fgKwz5gt..CMi/n548jfV/Tm.q7ZM3iDULA0Ssle',
    '+584121112233',
    'active'
)
ON DUPLICATE KEY UPDATE
    `role_id`       = 1,
    `password_hash` = '$2y$10$Y1lhCrrYcELI9fgKwz5gt..CMi/n548jfV/Tm.q7ZM3iDULA0Ssle',
    `status`        = 'active',
    `auth_token`    = NULL,
    `token_expires_at` = NULL;

-- Verificación: ejecuta esto para ver el usuario creado
SELECT id, role_id, email, first_name, last_name, status, created_at
FROM `users`
WHERE email = 'admin@vixystore.com';
