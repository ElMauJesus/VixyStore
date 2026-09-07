# 🚀 GUÍA PASO A PASO: INSTALACIÓN Y COMPILACIÓN COMPLETA - PLATAFORMA VIXY DELIVERY

Esta guía detalla el procedimiento exacto y secuencial para poner en marcha toda la infraestructura de **Vixy**: Base de Datos MySQL, Backend API en PHP para cPanel/VPS, Panel Web Administrativo, y la compilación individual de las 3 aplicaciones móviles a formato nativo Android (.APK).

---

## 🛠️ RESUMEN DE LA CORRECCIÓN APLICADA (VENTANA DE PEDIDOS DEL CONDUCTOR)

Se corrigió la ventana flotante de alerta de viaje entrante en **Vixy Delivery** (`DriverApp.tsx`):
1. **Límite de Altura Seguro (`max-h-[92dvh]`):** La ventana ya no se sale de la pantalla en teléfonos móviles ni navegadores con pantallas reducidas.
2. **Cuerpo Desplazable (`overflow-y-auto`):** La información del pedido (ganancia neta en $ y Bs, tasa BCV, retiro en comercio y entrega a cliente) cuenta con scroll fluido interno.
3. **Botonera Fija Pinned al Pie:** Los botones **"Rechazar"** y **"Aceptar Viaje"** permanecen siempre anclados y 100% visibles en la parte inferior de la pantalla sin ser empujados fuera del viewport.
4. **Protección Multicapa en Modales:** Se aplicó el mismo criterio de contención a los modales de Recarga de Saldo, Evidencia Fotográfica de Entrega e Incidencias en Ruta.

---

## 📁 MAPA DE CARPETAS DEL PROYECTO

| Carpeta | Descripción | Destino de Instalación |
| :--- | :--- | :--- |
| **`/sql/`** | Scripts SQL relacionales normalizados y limpios (sin datos demo ficticios). | phpMyAdmin / Servidor MySQL o MariaDB |
| **`/php/`** (y `/backend/php/`) | API REST completa en PHP (Auth JWT, Pedidos, Conductores, Comercios, Wallets, Fotos). | `public_html/api/` en cPanel o Nginx/Apache |
| **`/panel web/`** (y `/apps/panel-web/`) | Panel de Control Central para el Superusuario Administrador. | `public_html/admin/` o subdominio `admin.tudominio.com` |
| **`/vixy pedidos/`** (y `/apps/vixy-pedidos/`) | App de Clientes (Catálogo de Comercios, Carrito, Pagos, Tracking GPS). | Android APK (`com.vixy.pedidos`) / Web |
| **`/vixy delivery/`** (y `/apps/vixy-delivery/`) | App de Repartidores (Radar de Viajes 15s, GPS, Cobros, Foto de Entrega). | Android APK (`com.vixy.delivery`) |
| **`/vixy store/`** (y `/apps/vixy-store/`) | App de Comercios (Comandas 60s, Menú, Despachos, Cartera). | Android APK (`com.vixy.store`) / Web Tablet |
| **`/dist/`** | Compilados web de producción listos para subir directamente a hosting. | Servidor Web de Producción |

---

## 📋 PASO 1: INSTALACIÓN DE LA BASE DE DATOS (MYSQL / PHPMYADMIN)

### Credenciales Maestras del Superusuario
* **Usuario:** `vixydely`
* **Contraseña:** `123456`
* **Email:** `vixydely@vixy.com`
* **Rol:** `super_admin` (Acceso total al panel de administración).

### Procedimiento en cPanel:
1. Acceda a su panel **cPanel** (`https://tudominio.com:2083`).
2. Diríjase a **Bases de Datos MySQL**:
   * Cree una nueva base de datos (ejemplo: `tudominio_vixydb`).
   * Cree un usuario de base de datos (ejemplo: `tudominio_vixyuser`) con una contraseña segura.
   * Asocie el usuario a la base de datos marcando la casilla **TODOS LOS PRIVILEGIOS**.
3. Abra **phpMyAdmin** desde cPanel.
4. Seleccione en la columna izquierda la base de datos creada (`tudominio_vixydb`).
5. Haga clic en la pestaña superior **Importar**.
6. En **Seleccionar archivo**, elija:
   ```
   /sql/01_INSTALACION_COMPLETA_PRODUCCION.sql
   ```
   *(También puede usar `/sql/vixy_database_produccion_limpia.sql`)*.
7. Verifique el juego de caracteres en `utf-8` y haga clic en **Continuar** o **Importar**.
8. Se generarán todas las tablas relacionales (usuarios, comercios, conductores, productos, pedidos, billeteras, recargas pago móvil, comisiones e incidencias).

---

## 🌐 PASO 2: INSTALACIÓN DEL BACKEND PHP (CPANEL / APACHE)

1. En cPanel, abra el **Administrador de Archivos** (File Manager).
2. Dentro de `public_html/`, cree una carpeta llamada `api/` (o use un subdominio como `api.tudominio.com`).
3. Suba y descomprima todo el contenido de la carpeta `/php/` (o `/backend/php/`) dentro de `public_html/api/`.
4. Edite el archivo `public_html/api/config/config.php`:
   ```php
   <?php
   define('DB_HOST', 'localhost');
   define('DB_PORT', '3306');
   define('DB_NAME', 'tudominio_vixydb');     // Nombre de su base de datos
   define('DB_USER', 'tudominio_vixyuser');   // Usuario de MySQL
   define('DB_PASS', 'SuClaveSegura123');    // Contraseña de MySQL
   define('JWT_SECRET', 'VIXY_CLAVE_MAESTRA_PROD_2026');
   ```
5. Establezca los permisos de la carpeta de subidas:
   * La carpeta `public_html/api/uploads/` (y sus subcarpetas `entregas`, `comprobantes`, `comercios`) debe tener permisos **755** (o 775) para permitir que los motorizados y usuarios carguen comprobantes e imágenes.
6. Verifique la API abriendo en su navegador:
   `https://tudominio.com/api/configuracion.php`
   Debe devolver un JSON con la tasa BCV y tarifas operativas activas.

---

## 🖥️ PASO 3: DESPLIEGUE DEL PANEL WEB ADMINISTRATIVO

El panel administrativo puede compilarse y subirse a su hosting de 2 formas:

### Forma Rápida (Usando los archivos ya compilados):
1. En su cPanel, cree una carpeta en `public_html/admin/` (o configure el subdominio `admin.tudominio.com`).
2. Suba directamente el contenido de la carpeta:
   ```
   /dist/panel-web/
   ```
   (Contiene `index.html` y la carpeta `assets/`).
3. Abra en el navegador `https://tudominio.com/admin/`.
4. Inicie sesión con el superusuario:
   * **Usuario:** `vixydely`
   * **Contraseña:** `123456`

### Compilación desde código fuente:
```bash
# Compilar únicamente el panel web
npm run build:panel
# Los archivos generados quedarán en /dist/panel-web/ listos para subir
```

---

## 📱 PASO 4: COMPILACIÓN DE LAS 3 APPS ANDROID INDEPENDIENTES (.APK)

Cada aplicación móvil está configurada con su propio identificador (Package ID), manifiesto de permisos nativos y configuración de Capacitor.

### Identificadores de las Aplicaciones:
1. **Vixy Pedidos (Clientes):** `com.vixy.pedidos`
2. **Vixy Delivery (Conductores):** `com.vixy.delivery`
3. **Vixy Store (Comercios):** `com.vixy.store`

---

### Procedimiento de Compilación de las Apps:

#### 1. Compilar los paquetes web de las 3 apps
Ejecute en la raíz del proyecto el comando unificado:
```bash
npm run build:apps
```
Este comando compilará en segundos:
* `dist/panel-web/`
* `dist/vixy-pedidos/`
* `dist/vixy-delivery/`
* `dist/vixy-store/`

---

### Compilación a APK Nativo con Android Studio:

#### A) Compilar Vixy Delivery (Conductor / Repartidor):
```bash
# 1. Ingrese a la carpeta del motorizado
cd "vixy delivery"

# 2. Instale dependencias (si lo hace de forma aislada)
npm install

# 3. Compile el frontend
npm run build

# 4. Agregue la plataforma Android nativa
npx cap add android

# 5. Sincronice el código web, iconos y permisos con Android Studio
npx cap sync android

# 6. Abra el proyecto en Android Studio
npx cap open android
```
En Android Studio:
1. Vaya a **Build** > **Generate Signed Bundle / APK...**
2. Seleccione **APK** > **Next**.
3. Elija su archivo Keystore de firma (o cree uno nuevo en un clic).
4. Seleccione **release**, marque las casillas **V1** y **V2**.
5. Haga clic en **Finish**. Su archivo APK estará listo en `android/app/release/app-release.apk`.

#### B) Compilar Vixy Pedidos (Cliente):
```bash
cd "vixy pedidos"
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
Repita los pasos en Android Studio para generar el archivo APK `vixy-pedidos.apk`.

#### C) Compilar Vixy Store (Comercios / Restaurantes):
```bash
cd "vixy store"
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
Genere el APK firmado `vixy-store.apk`.

---

## ⚙️ PASO 5: TAREA CRON PARA ACTUALIZACIÓN AUTOMÁTICA DE TASA BCV

Para mantener la tasa oficial del Banco Central de Venezuela actualizada todos los días hábiles a las 9:00 AM y 5:00 PM:
1. En cPanel, diríjase a la herramienta **Tareas de Cron** (Cron Jobs).
2. Agregue una nueva tarea programada:
   * **Horario:** Dos veces al día (`0 9,17 * * 1-5`)
   * **Comando:**
     ```bash
     curl -s https://tudominio.com/api/configuracion.php?accion=actualizar_tasa_bcv > /dev/null 2>&1
     ```

---

## ✅ VERIFICACIÓN FINAL DEL SISTEMA
1. Inicie sesión en `https://tudominio.com/admin/` con `vixydely` / `123456`.
2. Verifique la pestaña **Carteras SQL & Finanzas** y **Acreditaciones Custodia**.
3. Abra **Vixy Store** e ingrese un pedido de prueba.
4. Observe la comanda en cocina (60s). Al despachar, el pedido salta en tiempo real a **Vixy Delivery**.
5. La ventana de asignación de 15s aparecerá en **Vixy Delivery** perfectamente contenida en pantalla con botones de acción rápida, ganancia neta en $ y Bs, y navegación fluida.
