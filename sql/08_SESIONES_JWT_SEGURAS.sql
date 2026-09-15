-- Ejecutar una vez en phpMyAdmin sobre c2861522_vixy_dl antes de publicar
-- php/config/auth_middleware.php y php/auth.php.
-- Gestiona sesiones JWT revocables sin almacenar el token completo.

CREATE TABLE IF NOT EXISTS sesiones_usuario (
  id CHAR(36) NOT NULL,
  usuario_id VARCHAR(50) NOT NULL,
  tipo_usuario VARCHAR(30) NOT NULL,
  token_jti_hash CHAR(64) NOT NULL,
  expira_en DATETIME NOT NULL,
  revocado_en DATETIME NULL DEFAULT NULL,
  dispositivo VARCHAR(255) NULL DEFAULT NULL,
  ip_origen VARCHAR(45) NULL DEFAULT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_uso_en TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sesiones_token_jti_hash (token_jti_hash),
  KEY idx_sesiones_usuario (usuario_id, tipo_usuario),
  KEY idx_sesiones_expira (expira_en),
  KEY idx_sesiones_revocada (revocado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Elimina sesiones vencidas. Puede ejecutarse desde cron diariamente.
DELETE FROM sesiones_usuario
WHERE expira_en < NOW() OR revocado_en IS NOT NULL;
