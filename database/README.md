# 🗄️ Bases de Datos del Ecosistema Vixy

Este directorio contiene los esquemas SQL oficiales para las dos bases de datos del proyecto:

| Archivo | Base de datos | Plataforma |
|---|---|---|
| `schema_vixy_store_c2861522_vixy_st.sql` | `c2861522_vixy_st` | VixyStore (Tienda de repuestos para conductores) |
| `schema_vixy_delivery_c2861522_vixy_dl.sql` | `c2861522_vixy_dl` | VixyDelivery (Sistema de entregas para comercios) |

---

## ⚡ Opción A — Copiar y Pegar en phpMyAdmin (más rápido)

1. Ingrese a **cPanel** → **phpMyAdmin**.
2. En la columna izquierda, seleccione la base de datos correspondiente (ej: `c2861522_vixy_st`).
3. Haga clic en la pestaña **SQL** en el menú superior.
4. Abra el archivo `.sql` de esta carpeta con un editor de texto (Notepad++, VS Code, etc.).
5. **Copie todo el contenido** (Ctrl+A → Ctrl+C).
6. **Pegue** el código en el cuadro de texto de phpMyAdmin y haga clic en **Continuar** (o **Go**).
7. Verá la confirmación de que todas las tablas y datos iniciales se crearon correctamente. ✅

---

## 📥 Opción B — Importar el Archivo .sql directamente

1. Ingrese a **cPanel** → **phpMyAdmin**.
2. En la columna izquierda, seleccione la base de datos correspondiente.
3. Haga clic en la pestaña **Importar** en el menú superior.
4. En **"Archivo a importar"**, haga clic en **"Seleccionar archivo"** y elija el `.sql` de esta carpeta.
5. Asegúrese de que el conjunto de caracteres sea **`utf-8`**.
6. Haga clic en **Importar** (o **Continuar**). ✅

---

## 🔐 Datos de acceso iniciales

### VixyStore (`c2861522_vixy_st`)
- **Admin por defecto:**
  - Email: `admin@vixystore.com`
  - Contraseña: `Admin12345*`
- Los conductores inician sesión con los datos de su registro en la landing de VixyRider (sincronización por UUID).

### VixyDelivery (`c2861522_vixy_dl`)
- **Superusuario del panel web:**
  - Usuario: `vixydely`
  - Contraseña: `123456`
  - Correo: `vixydely@vixy.com`

---

## 🛠️ Configurar las credenciales en el backend

### VixyStore → `api/config.php`
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'c2861522_vixy_st');
define('DB_USER', 'c2861522_VixySD');
define('DB_PASS', 'SuContraseñaAqui');
```

### VixyDelivery → `vixy-delivery-&-management-suite/backend/php/config/config.php`
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'c2861522_vixy_dl');
define('DB_USER', 'c2861522_VixySD');
define('DB_PASS', 'SuContraseñaAqui');
```

---

> ℹ️ Si cambia los nombres de las bases de datos o del usuario, recuerde actualizar los archivos `config.php` correspondientes.
