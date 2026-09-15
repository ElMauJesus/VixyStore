# Despliegue Finanzas en Tres Niveles - 2026-09-13

## Objetivo

Separar de forma permanente cada pedido cobrado en:

1. Cartera neta del comercio.
2. Cartera neta del conductor.
3. Cartera de comisiones Vixy.

La conciliacion obligatoria por pedido es:

`total cobrado = neto comercio + neto conductor + ingreso Vixy`

Las liquidaciones descuentan saldo neto ya acreditado. No calculan una segunda comision ni devuelven comisiones previamente separadas.

## Respaldo obligatorio

Antes de instalar, exportar desde phpMyAdmin la base `c2861522_vixy_dl` completa con estructura, datos, triggers y vistas.

## Orden de instalacion

1. En phpMyAdmin, seleccionar `c2861522_vixy_dl`.
2. Importar el archivo completo `sql/08_SEPARACION_FINANCIERA_TRES_NIVELES.sql`.
    La migracion es reejecutable: puede importarse de nuevo si un intento anterior quedo incompleto.
3. Subir `public_html/api/reporte_financiero.php` a `/public_html/api/reporte_financiero.php`.
4. Subir `public_html/api/liquidaciones_seguras.php` a `/public_html/api/liquidaciones_seguras.php`.
5. Reemplazar el contenido de `/public_html/admin/` por el contenido de `public_html/admin/`, incluyendo `.htaccess` y `assets/`.
6. Limpiar la cache del navegador e iniciar sesion de nuevo en el panel.

## Que hace la migracion

- Crea `distribuciones_pedido`, con una fila unica por pedido.
- Conserva o crea `movimientos_wallet` sin borrar movimientos existentes.
- Recupera pedidos historicos entregados usando primero los importes ya guardados en el libro mayor.
- Usa sentencias compatibles con MySQL 5.7+, MySQL 8.0+ y MariaDB 10.3+.
- Congela los porcentajes y montos cuando se verifica el pago.
- Acredita comercio, conductor y Vixy una sola vez al entregar.
- Sustituye los triggers anteriores de acreditacion para evitar duplicados.
- Crea `vista_conciliacion_pedidos`.

## Validaciones posteriores

Ejecutar en phpMyAdmin:

```sql
SELECT pedido_id, codigo_seguimiento, total_cobrado_usd,
       total_distribuido_usd, diferencia_usd
FROM vista_conciliacion_pedidos
WHERE ABS(diferencia_usd) > 0.01;
```

El resultado debe estar vacio. Luego comprobar:

```sql
SELECT tipo_usuario, ROUND(SUM(monto_neto_usd), 2) AS saldo_usd
FROM movimientos_wallet
GROUP BY tipo_usuario;
```

En el panel, abrir **Finanzas > Transacciones Globales** y verificar:

- Cartera de comercios.
- Cartera de repartidores.
- Cartera de comision Vixy.
- Custodia pendiente.
- Conciliacion por pedido con diferencia `$0.00`.
- Libro mayor global.

## Archivos del paquete

- `public_html/admin/`: build Vite con base `/admin/`.
- `public_html/api/reporte_financiero.php`: reporte contable de lectura.
- `public_html/api/liquidaciones_seguras.php`: liquidacion transaccional sobre saldo neto.
- `sql/08_SEPARACION_FINANCIERA_TRES_NIVELES.sql`: migracion no destructiva.

## Permisos

- Reportes: `super_admin`, `operador`, `finanzas`, `auditor`.
- Liquidaciones: `super_admin`, `finanzas`.
