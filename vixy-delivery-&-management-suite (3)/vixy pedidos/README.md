# Vixy Pedidos - Aplicación Móvil para Clientes

Aplicación web y móvil (Android APK con Capacitor) para clientes finales.

## Funcionalidades
- Catálogo interactivo de tiendas y productos con búsqueda y filtros por rubro.
- Cartera digital de cliente con sincronización de estado (se activa/pausa según configuración del Panel Web).
- **Pago Móvil Fijo Oficial:** Modal emergente rápido con código QR oficial para escanear, datos bancarios editados desde el Panel Web y validación de referencia.
- Métodos de pago alternativos: Zinli, Binance Pay, PayPal, Zelle, Efectivo USD.
- Seguimiento de pedidos en tiempo real con geolocalización y notificaciones.
- Sistema de reclamos y soporte directo.

## Despliegue Móvil (Capacitor / Android Studio)
```bash
npm install
npm run build
npx cap sync android
npx cap open android
```
Genera el APK para distribución en Google Play o instalación directa.
