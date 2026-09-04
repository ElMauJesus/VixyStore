# VIXY STORE - DOCUMENTACIÓN TÉCNICA DEL BACKEND Y BASE DE DATOS

Este documento detalla todas las mejoras, correcciones de arquitectura, seguridad y nuevos endpoints implementados en el backend PHP y la base de datos MySQL (`vixy_store_db.sql`) para el ecosistema integrado **Vixy Store** (E-Commerce + Gestión Empresarial ERP).

---

## 1. Modificaciones a la Base de Datos (`vixy_store_db.sql`)

### 1.1. Tabla `users`
- **Agregados los campos**:
  - `auth_token VARCHAR(255) NULL`: Token portador de sesión (Bearer).
  - `token_expires_at TIMESTAMP NULL`: Fecha de expiración de sesión (por defecto a 30 días con rotación en login).
- **Nuevo índice**:
  ```sql
  CREATE INDEX idx_users_auth_token ON users(auth_token);
  ```

### 1.2. Tabla `orders`
- **Agregado el campo**:
  - `payment_reference VARCHAR(100) NULL`: Permite almacenar el número de referencia bancaria, código de confirmación Pago Móvil o TXID en Binance/Zinli.
- **Nuevo índice**:
  ```sql
  CREATE INDEX idx_orders_reference ON orders(payment_reference);
  ```

### 1.3. Seeding Inicial (Datos Maestros y Demo)
Se agregaron inserciones iniciales seguras con cláusula `ON DUPLICATE KEY UPDATE`:
- **Roles**:
  1. `administrator`
  2. `secretary`
  3. `customer`
- **Usuario Administrador**:
  - Email: `admin@vixystore.com`
  - Contraseña demo: `Admin12345*`
  - Hash Bcrypt: `$2y$10$vO8fG0s5uW5dGlnzG1Lg6OFZzQc3mCvywB.wXmN6.n5n2bA5rFw32`
- **Usuario Cliente Demo**:
  - Email: `cliente@vixystore.com`
  - Contraseña demo: `Admin12345*`
- **Proveedores iniciales**:
  - `Distribuidora Global Auto C.A.`
  - `Lubricantes y Filtros de Venezuela`
  - `Importadora ElectroPartes Vixy`
- **Categorías maestras**:
  - `Repuestos Automotrices` (`repuestos-automotrices`)
  - `Lubricantes y Fluidos` (`lubricantes-fluidos`)
  - `Baterías y Electricidad` (`baterias-electricidad`)
  - `Herramientas y Accesorios` (`herramientas-accesorios`)
- **6 Productos con inventario, stock mínimo, precio y costo**.

---

## 2. Mejoras de Seguridad y Procesamiento (`api/security.php`)

1. **Parser Universal de Peticiones (`get_request_data()`)**:
   - Detecta automáticamente si la solicitud entrante es `application/json` (`php://input`) o `multipart/form-data` / `application/x-www-form-urlencoded` (`$_POST`).
   - Resuelve el problema donde llamadas `fetch()` modernas enviaban JSON y los scripts PHP recibían arrays vacíos.
2. **Extracción Robusta de Token (`get_bearer_token()`)**:
   - Soporta entornos Apache, Nginx, LiteSpeed, PHP-FPM leyendo `Authorization`, `HTTP_AUTHORIZATION`, `REDIRECT_HTTP_AUTHORIZATION` o respaldo vía query param.
3. **Encabezados de Seguridad y CORS (`apply_security_headers()`)**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-XSS-Protection: 1; mode=block`
   - Soporte automático a pre-flight requests `OPTIONS` (HTTP 200 OK).

---

## 3. Catálogo de Endpoints de la API

### 3.1. Autenticación y Cuentas
| Endpoint | Método | Headers | Parámetros (JSON) | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `api/login.php` | `POST` | `Content-Type: application/json` | `email`, `password` | Inicia sesión, genera `auth_token` con expiración a 30 días y devuelve datos del usuario y rol. |
| `api/register.php` | `POST` | `Content-Type: application/json` | `first_name`, `last_name`, `email`, `password`, `phone` | Registra usuario cliente y retorna token para login automático. |
| `api/logout.php` | `POST` | `Authorization: Bearer <token>` | - | Invalida el token en base de datos. |
| `api/perfil.php` | `GET` | `Authorization: Bearer <token>` | `?action=profile` o `?action=orders` | Retorna información del usuario y su historial de pedidos con detalle de productos. |
| `api/perfil.php` | `PUT/POST` | `Authorization: Bearer <token>` | `first_name`, `last_name`, `phone`, `occupation`, `equipment_info`, `password` | Actualiza datos de perfil y vehículo/equipo. |
| `api/direcciones.php` | `GET` | `Authorization: Bearer <token>` | - | Lista direcciones del usuario. |
| `api/direcciones.php` | `POST` | `Authorization: Bearer <token>` | `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `is_default` | Crea nueva dirección de entrega. |
| `api/direcciones.php` | `DELETE` | `Authorization: Bearer <token>` | `?id=<address_id>` | Elimina una dirección de entrega. |

### 3.2. Tienda Pública (E-Commerce)
| Endpoint | Método | Parámetros | Descripción |
| :--- | :--- | :--- | :--- |
| `api/productos.php` | `GET` | `?categoria_id=X&busqueda=X&pagina=1` | Catálogo de productos activos con imágenes primarias. |
| `api/producto-detalle.php` | `GET` | `?id=X` o `?slug=X` | Ficha técnica de producto con galería de imágenes y stock disponible. |
| `api/categorias.php` | `GET` | - | Lista de categorías activas con total de productos asociados. |
| `api/carrito.php` | `GET` | `Authorization: Bearer <token>` | Lista ítems del carrito con cálculo de subtotales. |
| `api/carrito.php` | `POST` | `product_id`, `quantity` | Agrega o incrementa ítem al carrito. |
| `api/carrito.php` | `PUT` | `item_id`, `quantity` | Modifica cantidad o elimina si cantidad es 0. |
| `api/carrito.php` | `DELETE` | `?item_id=X` | Elimina producto del carrito. |
| `api/checkout.php` | `POST` | `shipping_address_id`, `payment_method`, `payment_reference`, `notes` | Convierte carrito en orden de compra, descuenta stock y registra en `inventory_logs`. |

### 3.3. Administración y ERP (`api/admin/`)
> Requiere rol `administrator` o `secretary` vía `Authorization: Bearer <token>`.

| Endpoint | Método | Parámetros / Payload | Descripción |
| :--- | :--- | :--- | :--- |
| `api/admin/productos.php` | `GET` | `?search=X&category_id=X&supplier_id=X&low_stock=true` | Catálogo ERP con margen de ganancia calculado (`profit_margin_percent`), costo de adquisición y alertas. |
| `api/admin/productos.php` | `POST` | `category_id`, `supplier_id`, `sku`, `name`, `price`, `cost_price`, `stock_quantity`, `min_stock_alert`, `image_url` | Crea producto y movimiento inicial de inventario. |
| `api/admin/productos.php` | `PUT` | `id`, campos a actualizar | Modifica datos comerciales, costos y umbrales de alerta. |
| `api/admin/productos.php` | `DELETE` | `?id=X` | Alterna estado activo/inactivo (`is_active`). |
| `api/admin/proveedores.php` | `GET` | `?search=X&status=X` | Lista proveedores con conteo de productos vinculados y stock total. |
| `api/admin/proveedores.php` | `POST` | `name`, `contact_person`, `phone`, `email`, `notes`, `status` | Registra un nuevo proveedor aliado. |
| `api/admin/proveedores.php` | `PUT` | `id`, campos a actualizar | Actualiza información del proveedor. |
| `api/admin/proveedores.php` | `DELETE` | `?id=X&status=blacklisted` | Modifica el estado del proveedor. |
| `api/admin/inventario.php` | `GET` | `?action=summary` o `?action=logs` | Resumen financiero del inventario (valor a costo vs venta), alertas de bajo stock y bitácora de movimientos. |
| `api/admin/inventario.php` | `POST` | `product_id`, `type` (`IN`/`OUT`/`ADJUSTMENT`), `quantity_changed`, `reason` | Registro transaccional de reposición o ajuste con auditoría. |
| `api/admin/pedidos.php` | `GET` | `?status=X&pagina=1` o `?id=X` | Lista de ventas o detalle completo con comprobante y productos. |
| `api/admin/pedidos.php` | `PUT` | `id`, `status`, `payment_status` | Actualización de estado de envío o confirmación de pago. |
| `api/admin/usuarios.php` | `GET` | - | Lista de usuarios del sistema con roles y estado. |
| `api/admin/usuarios.php` | `PUT` | `id`, `status`, `role_id` | Gestión de accesos y permisos. |
| `api/fichas-garantia.php` | `GET` / `POST` | Filtros o datos de calidad/RMA | Control de rendimiento, averías y garantías de repuestos. |

---

## 4. Pruebas y Despliegue

1. **Importación SQL**:
   ```bash
   mysql -u usuario -p vixy_store < vixy_store_db.sql
   ```
2. **Configuración de Conexión**:
   Editar `api/config.php` con credenciales de base de datos (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`).
3. **CORS en Producción**:
   Si el frontend Next.js corre bajo el mismo dominio (por ejemplo `/api/` en el mismo servidor web o proxy inverso), las cabeceras CORS predeterminadas permitirán comunicación fluida sin bloqueos.
