# Vixy Delivery - Aplicación Móvil para Repartidores

Aplicación web y móvil (Android APK con Capacitor) para conductores y repartidores en moto/vehículo.

## Funcionalidades
- Recepción de viajes y pedidos en tiempo real con cálculo de distancias y ganancias.
- Cartera digital individual con regla estricta de límite de saldo negativo (-$0.50 USD).
- Sincronización de estado de cartera según disponibilidad fijada por el Panel Web.
- Recargas de saldo con Pago Móvil oficial fijo (con modal emergente de código QR oficial y datos bancarios de la empresa).
- Liquidaciones individuales con deducción automática de comisión de empresa y registro de comprobantes de pago.
- Registro autónomo de nuevos conductores con validación de documentos (cédula, licencia, carnet de circulación).

## Despliegue Móvil (Capacitor / Android Studio)
```bash
npm install
npm run build
npx cap sync android
npx cap open android
```
