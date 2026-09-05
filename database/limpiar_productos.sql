-- ==============================================================================
-- VIXY STORE - SCRIPT DE LIMPIEZA TOTAL DE PRODUCTOS DE PRUEBA
-- ==============================================================================
-- Ejecuta este script en phpMyAdmin en la base de datos de Vixy Store (c2861522_vixy_st)
-- Eliminará todos los productos e imágenes de prueba, dejando la tienda limpia.
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Vaciar imágenes asociadas a productos
TRUNCATE TABLE `product_images`;

-- 2. Vaciar movimientos de inventario asociados
TRUNCATE TABLE `inventory_logs`;

-- 3. Vaciar items de carrito asociados
TRUNCATE TABLE `cart_items`;

-- 4. Vaciar items de pedidos de prueba
TRUNCATE TABLE `order_items`;

-- 5. Vaciar fichas de garantía de prueba
TRUNCATE TABLE `warranty_performance_logs`;

-- 6. Vaciar tabla de productos
TRUNCATE TABLE `products`;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación final: debe devolver 0
SELECT COUNT(*) AS total_productos FROM `products`;
