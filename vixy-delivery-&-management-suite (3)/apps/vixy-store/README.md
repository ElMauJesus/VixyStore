# Vixy Store - Aplicación para Comercios y Restaurantes

Aplicación web y móvil (Android APK con Capacitor) para tiendas y aliados comerciales de Vixy.

## Funcionalidades
- Administración de catálogo, precios en USD/Bs y estados de disponibilidad.
- Protección total de precios: el modificador de comisiones de empresa (inicia en 0%) no altera los precios al consumidor.
- Cartera comercial con acreditación inmediata de ventas y sincronización con tabla SQL `comercio_billeteras`.
- Consulta de estado de cartera sincronizada con el Panel Web (activación/desactivación remota con mensajes informativos).
- Recepción de pedidos, despacho a conductores y consulta de comprobantes de pago.

## Despliegue Móvil (Capacitor / Android Studio)
```bash
npm install
npm run build
npx cap sync android
npx cap open android
```
