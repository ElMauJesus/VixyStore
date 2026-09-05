# GUÍA OFICIAL DE INSTALACIÓN Y DESPLIEGUE - VIXY DELIVERY PLATFORM

---

## 🔑 1. CREDENCIALES DEL SUPERUSUARIO (ACCESO TOTAL)

* **Usuario:** `vixydely`
* **Contraseña:** `123456`
* **Correo:** `vixydely@vixy.com`
* **Nivel de Acceso:** `super_admin` (Acceso irrestricto a todas las pestañas, custodias, finanzas, comercios, motorizados y auditoría)

---

## 🗄️ 2. PASO A PASO: INSTALACIÓN EN CPANEL CON PHPMYADMIN

### Paso 2.1: Crear la Base de Datos y Usuario en cPanel
1. Inicie sesión en su panel **cPanel** (`https://tudominio.com:2083`).
2. Diríjase a la sección **Bases de Datos** y haga clic en **Asistente de bases de datos MySQL** (o **Bases de datos MySQL**).
3. Cree una nueva base de datos. Por ejemplo: `tudominio_vixy`.
4. Cree un nuevo usuario de base de datos. Por ejemplo: `tudominio_vixyuser` y asigne una contraseña segura.
5. En **Añadir usuario a la base de datos**, marque la casilla **TODOS LOS PRIVILEGIOS** (ALL PRIVILEGES) y guarde los cambios.

### Paso 2.2: Importar la Base de Datos en phpMyAdmin
1. Vuelva al inicio de cPanel y abra **phpMyAdmin**.
2. En la columna izquierda, seleccione la base de datos que acaba de crear (`tudominio_vixy`).
3. En el menú superior, haga clic en la pestaña **Importar** (Import).
4. Haga clic en **Seleccionar archivo** (Choose File) y elija el archivo:
   ```
   /sql/schema_completo_vixy.sql
   ```
5. Deje el juego de caracteres en `utf-8` y haga clic en **Importar** (o **Continuar**).
6. Verá un mensaje verde confirmando que todas las tablas y datos iniciales (incluido el superusuario `vixydely`) se importaron con éxito.

### Paso 2.3: Subir los Archivos del Backend PHP
1. En cPanel, abra el **Administrador de Archivos** (File Manager).
2. Vaya a la carpeta `public_html/`.
3. Cree una carpeta llamada `api/` (o suba directamente el contenido de `/backend/php/`).
4. Suba todos los archivos de `/backend/php/`:
   - `auth.php`
   - `pedidos.php`
   - `conductores.php`
   - `comercios.php`
   - `productos.php`
   - `entregas.php`
   - `recargas.php`
   - `reclamos.php`
   - `configuracion.php`
   - `upload.php`
   - `.htaccess`
   - Carpeta `config/` (`db.php`, `config.php`, `auth_middleware.php`)
   - Carpeta `uploads/`
5. Edite el archivo `config/config.php` con las credenciales que creó en el Paso 2.1:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_PORT', '3306');
   define('DB_NAME', 'tudominio_vixy');      // Su base de datos en cPanel
   define('DB_USER', 'tudominio_vixyuser');  // Su usuario de MySQL en cPanel
   define('DB_PASS', 'SuContraseñaSegura');  // Su contraseña de MySQL
   ```
6. En el Administrador de Archivos, haga clic derecho sobre la carpeta `uploads/` y seleccione **Change Permissions** (Permisos). Asegúrese de que tenga permisos `755` o `775` para permitir la subida de comprobantes y fotos de entrega.

### Paso 2.4: Subir los Archivos de la Web (Frontend)
1. Los archivos estáticos optimizados para producción se encuentran en la carpeta `/dist/`:
   - `index.html`
   - `.htaccess` (maneja el enrutamiento SPA sin errores 404)
   - Carpeta `assets/` (CSS y JS minificados)
2. Comprima el contenido de `/dist/` en un archivo `.zip`.
3. Súbalo a `public_html/` (o al subdominio que elija, ej: `admin.tudominio.com`).
4. Extraiga el archivo zip en el directorio raíz correspondiente.

---

## 📱 3. PASO A PASO: CÓMO SEPARAR LAS APLICACIONES EN 3 APKS INDEPENDIENTES

Para que cada aplicación sea un archivo `.apk` independiente que se instale por separado en dispositivos distintos:
* **APK 1: Vixy Conductor** (Solo para los motorizados/conductores)
* **APK 2: Vixy Delivery** (Solo para los clientes que piden comida/productos)
* **APK 3: Vixy Comercio** (Solo para los dueños de tiendas/restaurantes)

### Método Recomendado: Capacitor de Ionic (Nativo Android)

El proyecto ya está preparado con detección de modo de aplicación autónomo. Cada app se aísla automáticamente en pantalla completa sin menús compartidos ni vistas cruzadas.

#### 1. Estructura de Paquetes de cada APK
* **Conductor:**
  - Nombre en el teléfono: **Vixy Conductor**
  - Package ID: `com.vixy.conductor`
  - Entrada web: `https://tudominio.com/?app=conductor`
* **Cliente:**
  - Nombre en el teléfono: **Vixy Delivery**
  - Package ID: `com.vixy.cliente`
  - Entrada web: `https://tudominio.com/?app=cliente`
* **Comercio:**
  - Nombre en el teléfono: **Vixy Comercio**
  - Package ID: `com.vixy.comercio`
  - Entrada web: `https://tudominio.com/?app=comercio`

#### 2. Pasos para Generar cada APK

##### Para la APK del Conductor:
1. Instale las herramientas de Capacitor en su computadora:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. Inicialice la aplicación del conductor:
   ```bash
   npx cap init "Vixy Conductor" "com.vixy.conductor" --web-dir dist
   ```
3. En el archivo generado `capacitor.config.json` (o `capacitor.config.ts`), configure la URL del servidor o la vista específica:
   ```json
   {
     "appId": "com.vixy.conductor",
     "appName": "Vixy Conductor",
     "webDir": "dist",
     "server": {
       "url": "https://tudominio.com/?app=conductor",
       "cleartext": true
     }
   }
   ```
4. Agregue la plataforma Android:
   ```bash
   npx cap add android
   ```
5. Abra el proyecto en Android Studio:
   ```bash
   npx cap open android
   ```
6. En Android Studio, vaya a **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
7. ¡Listo! Obtendrá el archivo `app-debug.apk` o `app-release.apk` para instalarlo en los teléfonos de los conductores.

##### Para la APK del Cliente (Delivery):
1. Configure `capacitor.config.json`:
   ```json
   {
     "appId": "com.vixy.cliente",
     "appName": "Vixy Delivery",
     "webDir": "dist",
     "server": {
       "url": "https://tudominio.com/?app=cliente",
       "cleartext": true
     }
   }
   ```
2. Sincronice y compile el APK:
   ```bash
   npx cap sync android
   npx cap open android
   ```

##### Para la APK del Comercio (Store):
1. Configure `capacitor.config.json`:
   ```json
   {
     "appId": "com.vixy.comercio",
     "appName": "Vixy Comercio",
     "webDir": "dist",
     "server": {
       "url": "https://tudominio.com/?app=comercio",
       "cleartext": true
     }
   }
   ```
2. Sincronice y compile el APK:
   ```bash
   npx cap sync android
   npx cap open android
   ```

---

## 💰 4. REGLAS OFICIALES DE TARIFAS VIXY IMPLEMENTADAS

* **Tarifa Mínima Base:** **$2.00 USD** (cubre hasta 3.0 kilómetros de recorrido).
* **Kilómetros Adicionales:** **+$0.50 USD** por cada kilómetro después de los 3 km iniciales.
  - Ejemplo 1: Carrera de 2.5 km = $2.00 USD.
  - Ejemplo 2: Carrera de 4.2 km = $2.00 + (1.2 km * $0.50) = $2.60 USD.
* **Límite de Saldo Negativo para Conductores:** **-$0.50 USD**.
  - Si el saldo de la billetera del conductor cae por debajo de -$0.50 USD, el sistema bloquea automáticamente la asignación de nuevas carreras hasta que el conductor reporte una recarga vía Pago Móvil / Binance y sea aprobada.
* **Comisión de la Plataforma:** **15%** sobre el costo del envío.
* **Llamadas y Contacto:** Canal telefónico directo vía celular GSM (`tel:...`) y botón directo de WhatsApp (`wa.me/...`) en lugar de simuladores.
