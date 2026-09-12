-- ==============================================================================
-- CORRECCIÓN DE LOGIN PARA CONDUCTORES YA APROBADOS (vixy_dl / c2861522_vixy_dl)
-- ------------------------------------------------------------------------------
-- El login de la app (api/auth.php) exige verificado_por_admin = 1.
-- Los conductores aprobados ANTES de esta corrección quedaron con
-- verificado_por_admin = 0 (o NULL) aunque su status/estado_registro sea
-- 'aprobado', por lo que la app les responde 403 "pendiente de aprobación".
--
-- Este script marca como verificados todos los que ya estaban aprobados
-- (estado_registro = 'aprobado' OR status = 'aprobado' OR sin estado).
-- ==============================================================================

USE `c2861522_vixy_dl`;

UPDATE `conductores`
SET `verificado_por_admin` = 1,
    `estado_registro`      = 'aprobado'
WHERE `verificado_por_admin` <> 1
  AND (
      `estado_registro` = 'aprobado'
   OR `estado_registro` IS NULL
   OR `estado_registro` = ''
   OR `status` = 'aprobado'
  );

-- Verificación (debe devolver 0 filas):
-- SELECT COUNT(*) AS pendientes_sin_corregir
-- FROM `conductores`
-- WHERE `verificado_por_admin` <> 1
--   AND (`estado_registro` = 'aprobado' OR `estado_registro` IS NULL OR `status` = 'aprobado');