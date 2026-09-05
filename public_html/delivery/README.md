# 📦 Vixy Delivery — Portal Web de Comercios & Logística

Esta carpeta contiene la plataforma web oficial de **Vixy Delivery**, diseñada exclusivamente para los **comercios aliados** y la administración logística de pedidos.

---

## 📂 Estructura de la Carpeta

```
public_html/delivery/
│
├── index.html          ← Página web principal (Single Page Application SPA)
├── .htaccess           ← Reglas de enrutamiento Apache, caché y compresión GZIP
├── README.md           ← Este documento explicativo
│
├── assets/             ← Paquete compilado de frontend (React + TailwindCSS + Lucide Icons)
│   ├── index-*.js      ← Lógica del cliente web, panel de comercio, catálogo y mapas
│   └── index-*.css     ← Estilos visuales optimizados
│
└── backend/            ← Backend PHP aislado de Vixy Delivery
    └── php/
        ├── auth.php            ← Autenticación JWT para comercios y administradores
        ├── pedidos.php         ← CRUD y estados de pedidos en tiempo real
        ├── productos.php       ← Catálogo de productos y precios en USD/Bs
        ├── comercios.php       ← Gestión de perfil y configuración de locales
        ├── conductores.php     ← Asignación y métricas de motorizados
        ├── recargas.php        ← Gestión de billeteras y saldo comercial
        ├── reclamos.php        ← Incidencias y soporte
        ├── configuracion.php   ← Tarifas por km y parámetros operativos
        ├── upload.php          ← Subida de imágenes de productos y comprobantes
        └── config/
            ├── config.php      ← Credenciales de la BD MySQL c2861522_vixy_dl
            └── db.php          ← Conexión PDO optimizada
```

---

## 💻 Módulos de la Plataforma Web

Al ingresar a `https://tudominio.com/delivery/`, la web ofrece tres vistas especializadas accesibles desde la barra superior:

1. **🏪 Mi Comercio (`StoreApp`)**:
   - **Pedidos & Comandas**: Visualización en vivo de solicitudes entrantes, aceptación, preparación en cocina y solicitud de motorizado.
   - **Menú & Artículos**: Catálogo interactivo para añadir, modificar fotos, precios en USD/Bs y activar/desactivar disponibilidad de platos o productos.
   - **Despacho Manual**: Formulario para despachar ventas generadas fuera de la app (por WhatsApp o en el local), con cálculo de kilometraje y tarifa ($2.00 base + $0.50/km adicional).
   - **Cartera Comercial**: Control de ingresos, pagos recibidos (Pago Móvil, Zelle, Zinli, Binance) y balance.
   - **Datos del Local**: RIF, nombre del local, dirección, horarios de atención y teléfono.
   - **Reclamos**: Atención de dudas o quejas de clientes reportadas por la plataforma.

2. **🗺️ Radares en Vivo (`LiveFleetMapView`)**:
   - Mapa satelital interactivo en pantalla completa para monitoreo de la red de repartidores y rutas de entrega activas.

3. **🛡️ Administración (`AdminPanel`)**:
   - Acceso con credenciales de superadministrador (`vixydely` / `123456`) para supervisión global de todos los comercios afiliados y métricas del sistema.

---

## 🔗 Conexión con Vixy Store

Desde el encabezado superior se incluye un acceso directo a **🚗 Vixy Store** (`/store/`), manteniendo ambas plataformas interconectadas para el usuario pero completamente aisladas a nivel de código, bases de datos y sesiones.
