# Correccion de rutas del mapa GPS administrativo - 2026-09-13

## Problema confirmado

La API de produccion devuelve conductores con coordenadas GPS reales, pero el HTML de
`https://www.vixy.uno/admin/` intenta cargar JavaScript y CSS desde `/assets/`.
Esas rutas responden 404, por lo que el panel publicado no ejecuta el sincronizador GPS.

## Publicacion

1. Subir `vixy-admin-gps-rutas-2026-09-13.zip` a la raiz de la cuenta cPanel, un nivel por encima de `public_html`.
2. Extraer el ZIP y aceptar la sobrescritura de `public_html/admin/`.
3. Confirmar que no quede una ruta duplicada como `public_html/public_html/admin/`.
4. Abrir `https://www.vixy.uno/admin/` en ventana privada o recargar con Ctrl+F5.

No requiere ejecutar SQL ni reemplazar el API PHP. La API de produccion ya devuelve
`latitud_actual` y `longitud_actual` reales.

## Verificacion

El HTML publicado debe referenciar recursos con este prefijo:

```text
/admin/assets/
```

No debe referenciarlos como `/assets/`.

La API de control es:

```text
https://www.vixy.uno/api/conductores.php?disponibles=0
```
