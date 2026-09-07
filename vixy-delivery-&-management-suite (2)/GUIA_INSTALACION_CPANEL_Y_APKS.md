# 🚀 GUÍA OFICIAL DE PRODUCCIÓN - VIXY DELIVERY PLATFORM
### Despliegue en cPanel, phpMyAdmin, Administrador de Archivos y Compilación de APKs Independientes (Android Studio / Antigravity)

---

## 🔑 1. CREDENCIALES DEL SUPERUSUARIO (ACCESO MAESTRO)

La base de datos y el sistema han sido **100% depurados de datos demo**. Únicamente existe el superusuario maestro:

* **Usuario:** `vixydely`
* **Contraseña:** `123456`
* **Email:** `vixydely@vixy.com`
* **Rol:** `super_admin` (Acceso total a: finanzas, conciliación de pagos, aprobación de recargas, comercios, motorizados, pedidos en vivo, mapa satelital y auditoría).

---

## 🗄️ 2. MONTAJE DE LA BASE DE DATOS EN PHPMYADMIN (CPANEL)

### Paso 2.1: Crear la Base de Datos y el Usuario MySQL
1. Inicie sesión en su panel **cPanel** (`https://tudominio.com:2083`).
2. En la sección **Bases de datos**, haga clic en **Bases de datos MySQL**.
3. Cree una nueva base de datos. Ejemplo: `tudominio_vixydb`.
4. En **Usuarios MySQL**, cree un nuevo usuario. Ejemplo: `tudominio_vixyuser` y genere una contraseña segura.
5. En la sección **Añadir usuario a la base de datos**, seleccione el usuario y la base de datos recién creados, haga clic en **Añadir**, marque la casilla **TODOS LOS PRIVILEGIOS (ALL PRIVILEGES)** y haga clic en **Hacer cambios**.

### Paso 2.2: Importar el Script SQL Limpio
1. Vuelva al inicio de cPanel y abra **phpMyAdmin**.
2. En la barra lateral izquierda, seleccione la base de datos `tudominio_vixydb`.
3. Haga clic en la pestaña superior **Importar** (Import).
4. En **Seleccionar archivo**, elija el archivo oficial de producción ubicado en:
   ```
   /sql/vixy_database_produccion_limpia.sql
   ```
   *(O alternativamente `/sql/schema_completo_vixy.sql`, ambos son 100% limpios sin demos)*.
5. Verifique que el juego de caracteres esté en **utf-8**.
6. Haga clic en el botón **Importar** (o **Continuar**).
7. Aparecerá el mensaje en verde confirmando la creación exitosa de las 15 tablas normalizadas con sus claves foráneas, índices de proximidad, parámetros de tarifa ($2.00 hasta 3 km, +$0.50/km adicional, límite -$0.50 USD) y el superusuario `vixydely`.

---

## 📂 3. ESTRUCTURA EN EL ADMINISTRADOR DE ARCHIVOS DE CPANEL

Para que el servidor web Apache/Nginx sirva tanto la API PHP como las aplicaciones de forma ordenada, organice la carpeta `public_html/` de la siguiente forma:

```
public_html/
│
├── api/                                <--- BACKEND PHP CENTRAL
│   ├── config/
│   │   ├── config.php                  <--- Credenciales de base de datos
│   │   ├── db.php                      <--- Conexión PDO Singleton y respuestas JSON
│   │   └── auth_middleware.php         <--- Validación de tokens JWT
│   │
│   ├── uploads/                        <--- PERMISOS 755 (Almacenamiento)
│   │   ├── comprobantes/               <--- Capturas de Pago Móvil y Binance
│   │   ├── entregas/                   <--- Fotos de entrega tomadas por motorizados
│   │   └── comercios/                  <--- Logos y fotos de menú
│   │
│   ├── auth.php                        <--- Login y Registro de usuarios
│   ├── pedidos.php                     <--- Temporizador 60s/15s y salto a conductor cercano
│   ├── conductores.php                 <--- Radar GPS y control de saldo límite (-$0.50)
│   ├── comercios.php                   <--- Directorio y menú de tiendas
│   ├── productos.php                   <--- Inventario y precios
│   ├── entregas.php                    <--- Liquidación y comisiones (15% plataforma)
│   ├── recargas.php                    <--- Aprobación de saldos en billetera
│   ├── reclamos.php                    <--- Tickets de incidencias
│   ├── upload.php                      <--- Carga multipart de imágenes
│   ├── configuracion.php               <--- Tasa BCV y tarifas operativas
│   └── .htaccess                       <--- Reglas CORS y bloqueo de seguridad
│
├── admin/                              <--- PANEL WEB CENTRAL SUPERUSUARIO
│   ├── index.html                      <--- Compilado de la Web Administrativa
│   └── assets/
│
├── web/                                <--- PORTAL WEB CLIENTE (Vixy Pedidos Web)
│   ├── index.html
│   └── assets/
│
└── .htaccess                           <--- Redirección raíz y certificados SSL
```

### Paso 3.1: Subir los Archivos PHP
1. En cPanel, abra el **Administrador de Archivos** (File Manager).
2. Entre a la carpeta `public_html/` y cree una subcarpeta llamada `api/`.
3. Suba todos los archivos ubicados en `/backend/php/` dentro de `public_html/api/`.
4. Entre en `public_html/api/config/` y edite `config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_PORT', '3306');
   define('DB_NAME', 'tudominio_vixydb');      // Base de datos de cPanel
   define('DB_USER', 'tudominio_vixyuser');    // Usuario MySQL de cPanel
   define('DB_PASS', 'TuClaveSegura123');     // Contraseña del usuario MySQL
   define('JWT_SECRET', 'VIXY_CLAVE_MAESTRA_PROD_2026');
   ```
5. En `public_html/api/`, verifique que la carpeta `uploads/` tenga permisos **755** (o 775) para permitir que los motorizados suban fotos de entrega y comprobantes.

---

## 📱 4. CÓMO SEPARAR Y COMPILAR LAS 3 APLICACIONES INDEPENDIENTES (APK)

Cada aplicación dispone de su paquete, configuración de Capacitor, permisos Android y punto de entrada dedicado para compilarse como una APK completamente individual:

| Aplicación | Paquete Android (App ID) | Nombre en Teléfono | Directorio en el Proyecto |
| :--- | :--- | :--- | :--- |
| **Vixy Pedidos** (Clientes) | `com.vixy.pedidos` | Vixy Pedidos | `/apps/vixy-pedidos/` |
| **Vixy Delivery** (Conductores) | `com.vixy.delivery` | Vixy Conductor | `/apps/vixy-delivery/` |
| **Vixy Store** (Comercios) | `com.vixy.store` | Vixy Store | `/apps/vixy-store/` |
| **Panel Web Admin** (Superusuario) | Web Responsive | Vixy Suite Web | `/apps/vixy-admin/` |

---

### 📲 OPCIÓN A: Compilación en Android Studio

#### Paso 1: Configurar la URL de tu Servidor
En cada aplicación, configure la variable de entorno o archivo de configuración con la dirección de su cPanel:
```env
VITE_API_BASE_URL=https://tudominio.com/api
```

#### Paso 2: Generar el proyecto Android para cada APK

##### Para compilar **Vixy Pedidos (Cliente)**:
```bash
# 1. Entrar a la carpeta
cd apps/vixy-pedidos

# 2. Instalar dependencias
npm install

# 3. Compilar los assets web optimizados
npm run build

# 4. Crear el proyecto nativo Android
npx cap add android

# 5. Sincronizar archivos y permisos
npx cap sync android

# 6. Abrir en Android Studio
npx cap open android
```

##### Para compilar **Vixy Delivery (Conductor / Repartidor)**:
```bash
cd apps/vixy-delivery
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

##### Para compilar **Vixy Store (Comercio / Restaurante)**:
```bash
cd apps/vixy-store
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

#### Paso 3: Generar la APK Firmada en Android Studio
1. En Android Studio, espere que Gradle termine de sincronizar (**Gradle Build Model**).
2. En el menú superior, haga clic en:
   ```
   Build > Generate Signed Bundle / APK...
   ```
3. Seleccione **APK** y haga clic en **Next**.
4. Seleccione o cree su archivo de firma digital (**Key store path**), ingrese la contraseña y alias.
5. Seleccione la variante de compilación **release**.
6. Marque las casillas de firma **V1 (Jar Signature)** y **V2 (Full APK Signature)**.
7. Haga clic en **Finish**.
8. En 1-2 minutos, Android Studio le mostrará el enlace a su archivo APK listo para instalar:
   ```
   app/release/app-release.apk
   ```

---

### ☁️ OPCIÓN B: Compilación mediante Antigravity o CLI en Servidor

Si compila usando el motor Antigravity o línea de comandos con el SDK de Android instalado:

```bash
# Ejemplo para Vixy Delivery:
cd apps/vixy-delivery
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```
El archivo generado se ubicará en:
`android/app/build/outputs/apk/release/app-release-unsigned.apk` (o firmado con `jarsigner`).

---

## ⚡ 5. REGLAS DE NEGOCIO CODIFICADAS EN LA PLATAFORMA

1. **Tarifas de Despacho**:
   - Tarifa Base Mínima: **$2.00 USD** hasta **3.0 km**.
   - Tarifa Adicional: **+$0.50 USD** por cada kilómetro adicional a partir del km 3.
2. **Comisión de Plataforma**:
   - **15%** administrativo sobre el costo del envío.
3. **Límite de Saldo Negativo para Conductores**:
   - Límite permitido: **-$0.50 USD**.
   - Si un conductor tiene saldo inferior a -$0.50 USD, el sistema bloquea automáticamente la recepción de nuevos viajes hasta que registre una recarga vía Pago Móvil o Binance y sea aprobada por el superusuario `vixydely`.
4. **Temporizador de Aceptación para Comercios (Vixy Store)**:
   - **60 segundos (1 minuto)** continuos con alerta sonora de campana de comanda.
   - Si el comercio no lo acepta dentro del minuto, el pedido se cancela automáticamente por inactividad de cocina.
5. **Temporizador de Aceptación para Conductores (Vixy Delivery)**:
   - **15 segundos** continuos por motorizado con campana de aviso.
   - Si el conductor presiona **Rechazar** o se agotan los 15 segundos:
     - El pedido desaparece de su pantalla.
     - Su ID se excluye de la solicitud.
     - El sistema calcula geográficamente las coordenadas del comercio contra la flota activa y salta automáticamente al **conductor libre más cercano**.
   - Los conductores que ya se encuentren en carrera activa son omitidos automáticamente por el algoritmo.

---

## 📊 6. MOTOR DE ACREDITACIONES DE CUSTODIA, REPORTES ($ Y BS) Y SINCRONIZACIÓN EN VIVO (5s)

### 6.1. Sincronización Continua de 5 Segundos
* El panel web y las aplicaciones móviles sincronizan automáticamente cada **5 segundos** a través de:
  - Polling periódico a `GET /api/liquidaciones.php?accion=reporte_custodia_periodo`
  - Canal `BroadcastChannel('vixy_global_sync')` entre pestañas del navegador
  - Eventos de almacenamiento `localStorage` para actualización instantánea sin recarga de página.
* Indicador visual en el panel superior con temporizador regresivo de 5 a 0 segundos y botón manual de sincronización forzada.

### 6.2. Acreditación Automática de Custodia a la Wallet
* Cuando un pedido pasa al estado **`entregado`**, los fondos retenidos en custodia se acreditan inmediatamente a las respectivas wallets:
  1. **Conductor (Vixy Delivery)**:
     - Recibe el flete de envío bruto en $ USD y en Bs calculados con la tasa BCV del momento.
     - Se aplica el descuento de comisión de empresa (15% por defecto).
     - Se le acredita el **neto al conductor** a su balance de billetera.
  2. **Comercio (Vixy Store)**:
     - Se registran las ventas brutas de productos en $ USD y Bs.
     - Se deduce el porcentaje de comisión configurado en el panel web (comienza en **0%** sin alterar precios de venta).
     - Se acredita el **neto al comercio** para su posterior liquidación por Pago Móvil o transferencia bancaria.
  3. **Empresa (Vixy Suite)**:
     - Se consolida la ganancia neta de la plataforma (comisión de comercio + comisión de delivery) tanto en $ como en Bs.

### 6.3. Filtros Temporales (Día / Semana / Mes / Histórico)
* En el Panel Web -> **Carteras SQL & Finanzas** -> Pestaña **Acreditaciones Custodia & Ganancias ($ / Bs)**:
  - **Por Día**: Ventas, carreras y ganancias generadas en las últimas 24 horas (fecha actual).
  - **Por Semana**: Métricas acumuladas de los últimos 7 días.
  - **Por Mes**: Consolidado del mes calendario (últimos 30 días).
  - **Histórico**: Auditoría global de todas las operaciones registradas.

### 6.4. Activación/Desactivación de Carteras y Pago Móvil Fijo
* **Interruptor de Carteras**: Permite pausar depósitos/retiros de comercios o conductores global o individualmente. Las aplicaciones detectan el estado y muestran advertencia amigable si la cartera está pausada por mantenimiento contable.
* **Pago Móvil Centralizado**:
  - Banco receptor, número de teléfono, Cédula/RIF y nombre del titular modificables desde el Panel Web.
  - Imagen o Código QR escaneable fijado desde el panel web que se proyecta dinámicamente en el modal de pago de todas las aplicaciones.

---

## 📦 7. PACKS INDEPENDIENTES PARA INSTALACIÓN POR SEPARADO

El proyecto contiene las 4 suites empaquetadas de forma desacoplada para distribuir en servidores o dispositivos distintos:

| Carpeta de Paquete | Destino de Instalación | Tipo de Despliegue |
| :--- | :--- | :--- |
| `panel web/` | `admin.tudominio.com` o `public_html/admin/` | Web SPA (Vite / React / Tailwind) |
| `vixy pedidos/` | Teléfonos de Clientes / Play Store | APK Android nativa vía Capacitor |
| `vixy store/` | Tablets o teléfonos en cocinas de comercios | APK Android nativa vía Capacitor |
| `vixy delivery/` | Teléfonos de repartidores / motorizados | APK Android nativa vía Capacitor |
| `backend/php/` | `api.tudominio.com` o `public_html/api/` | Servidor PHP 8.1+ con Apache / Nginx |
| `sql/` | phpMyAdmin / Servidor MySQL 8.0+ | Base de datos relacional InnoDB |
