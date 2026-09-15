# Despliegue GPS y Estado Activo - 2026-09-14

## Correccion

- El interruptor Activo/Pausa de Vixy Delivery ahora guarda `conductores.disponible` en el servidor.
- Si el servidor rechaza el cambio, la app revierte el interruptor y muestra el error.
- Un conductor con `disponible = 0` y `en_carrera = 0` desaparece del mapa y permanece identificado como Inactivo en la lista de flota.
- Un conductor con `en_carrera = 1` permanece visible como En Ruta aunque no este disponible para nuevos pedidos.
- El mapa encuadra automaticamente los conductores activos que tienen coordenadas GPS validas, incluso si estan fuera de la vista inicial de Caracas.
- Al cerrar sesion, la app intenta marcar al conductor como inactivo antes de cerrar la sesion.
- La app deja de enviar coordenadas periodicas cuando esta en pausa y no tiene un pedido activo.

## Tiempos reales

- Cambio Activo/Pausa: solicitud inmediata al servidor.
- Envio GPS de la app: cada 5 segundos mientras esta activo o tiene un pedido en curso.
- Refresco automatico del panel administrativo: cada 5 segundos.
- Desaparicion esperada del mapa: en el siguiente refresco, normalmente entre 0 y 5 segundos mas el tiempo de red.

## Archivos web

Subir reemplazando:

- `public_html/admin/` a `/public_html/admin/`.
- `public_html/api/conductores.php` a `/public_html/api/conductores.php`.

Conservar el archivo `.htaccess` incluido dentro de `public_html/admin/`.

## Prueba

1. Abrir el mapa de conductores en el panel administrativo.
2. Activar el conductor desde Vixy Delivery y esperar hasta 5 segundos.
3. Confirmar que aparece como Disponible.
4. Pulsar Pausa en Vixy Delivery.
5. Confirmar que desaparece del mapa y cambia a Inactivo en la lista en un maximo aproximado de 5 segundos.
6. Si tiene un pedido en curso, debe permanecer visible como En Ruta.
