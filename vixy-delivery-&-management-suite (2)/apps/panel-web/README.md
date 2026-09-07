# Panel Web Administrativo y Financiero - Vixy Global

Módulo web central para la administración de la plataforma Vixy.

## Funcionalidades Principales
- **Manejo de Porcentajes de Comisión de Empresa:** Control del modificador de comisiones sobre ventas de comercios (inicia en 0%, no afecta precios de catálogo) y comisión de delivery.
- **Configuración de Carteras Centralizada:** Activación y desactivación global e individual de carteras de clientes, comercios y repartidores con sincronización instantánea y mensaje de mantenimiento personalizable.
- **Método de Pago Fijo Pago Móvil:** Configuración y edición en tiempo real del banco, número telefónico, RIF, nombre del titular, instrucciones y código QR para escanear.
- **Gestión de Carteras y Liquidaciones con Comprobantes:** Separación contable automática entre comisiones de la empresa y montos a pagar a los comercios o repartidores, con registro de referencia bancaria y comprobante digital.
- **Auditoría y Gestión de Comercios y Repartidores:** Vista global y filtrada por comercio o conductor para verificar si el dinero ya fue retirado o permanece en la billetera.

## Despliegue y Ejecución
```bash
npm install
npm run dev     # Inicia en modo desarrollo
npm run build   # Compila para producción en dist/
```
