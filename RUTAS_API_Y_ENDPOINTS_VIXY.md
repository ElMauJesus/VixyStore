# VIXY DELIVERY & STORE — GUÍA OFICIAL DE RUTAS Y ENDPOINTS DE LA API (2026)

Este documento contiene la especificación técnica completa de las rutas (endpoints), métodos HTTP, parámetros requeridos y respuestas que utilizan las aplicaciones móviles (APKs de Cliente, Conductor y Comercio) y la plataforma web de **Vixy**.

---

## 1. URL Base del Servidor

- **Producción (cPanel / Servidor Principal)**:
  ```text
  https://vixy.uno/api
  ```
  *(Nota: La ruta hermana `https://vixy.uno/shop/backend/php` contiene el mismo backend sincronizado).*

- **Encabezados HTTP Generales (Headers)**:
  ```http
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer <TOKEN_DE_SESION>   (Requerido para rutas protegidas)
  ```
  *(Para subida de archivos se utiliza `multipart/form-data` sin forzar Content-Type en el cliente).*

---

## 2. Módulo de Autenticación y Cuentas

### 2.1. Iniciar Sesión (Login Universal)
- **Ruta**: `POST https://vixy.uno/api/auth.php?action=login`
- **Permite ingresar por**: Cédula, correo, teléfono, código de conductor (`DRV-...`), código de comercio o usuario.
- **Payload (JSON)**:
  ```json
  {
    "identifier": "V-12345678",
    "password": "mi_password_segura",
    "app_role": "conductor" // Opciones: "conductor", "cliente", "comercio", "admin"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJ0eXAi...",
    "tipo": "conductor",
    "usuario": {
      "id": "DRV-001",
      "nombre": "Carlos",
      "apellido": "Pérez",
      "cedula": "V-12345678",
      "telefono": "04121234567",
      "email": "carlos@ejemplo.com",
      "foto_url": "/shop/imgs-c-d/deliverys/DRV-001/perfil.jpg",
      "saldo_billetera_usd": 15.50,
      "disponible": 1
    }
  }
  ```

### 2.2. Registro de Clientes
- **Ruta**: `POST https://vixy.uno/api/auth.php?action=register_client`
- **Payload (JSON)**:
  ```json
  {
    "nombre": "María",
    "apellido": "Gómez",
    "cedula": "V-20123456",
    "telefono": "04149876543",
    "email": "maria@ejemplo.com",
    "password": "clave123Client*",
    "direccion_habitual": "Av. Principal Los Dos Caminos",
    "latitud": 10.48060000,
    "longitud": -66.90360000
  }
  ```

### 2.3. Consultar Perfil del Usuario Autenticado
- **Ruta**: `GET https://vixy.uno/api/auth.php?action=me`
- **Headers**: `Authorization: Bearer <TOKEN>`

### 2.4. Cambio de Contraseña
- **Ruta**: `POST https://vixy.uno/api/auth.php?action=change_password`
- **Payload (JSON)**:
  ```json
  {
    "clave_actual": "clave_vieja",
    "nueva_clave": "clave_nueva_segura"
  }
  ```

---

## 3. Telemetría GPS y Control de Radar (Conductor y Cliente)

### 3.1. Enviar Coordenadas GPS en Tiempo Real
Permite que el conductor aparezca en el mapa/radar en vivo. Si el ID corresponde a un cliente con pedido activo, también actualiza la posición de destino del cliente.
- **Ruta**: `POST https://vixy.uno/api/conductores.php?action=gps` *(o también `POST https://vixy.uno/api/gps.php`)*
- **Headers**: `Authorization: Bearer <TOKEN>` (opcional si se envía `conductor_id`)
- **Payload (JSON)**:
  ```json
  {
    "conductor_id": "DRV-001", // ID, cédula o código de conductor
    "latitud": 10.49100000,
    "longitud": -66.86200000,
    "velocidad_kmh": 35.5,     // Opcional
    "precision_metros": 4.2,   // Opcional
    "pedido_id": "ped-A1B2C3"   // Opcional si está realizando una entrega
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "mensaje": "Ubicación GPS actualizada exitosamente",
    "latitud": 10.491,
    "longitud": -66.862,
    "disponible": true
  }
  ```

### 3.2. Cambiar Estado de Disponibilidad (Conectar / Desconectar)
- **Ruta**: `PUT https://vixy.uno/api/conductores.php?action=disponibilidad`
- **Payload (JSON)**:
  ```json
  {
    "conductor_id": "DRV-001",
    "disponible": 1 // 1 = Conectado / Activo en Radar, 0 = Pausa / Desconectado
  }
  ```

### 3.3. Limpiar GPS al Cerrar Sesión
- **Ruta**: `POST https://vixy.uno/api/conductores.php?action=gps_clear`
- **Payload (JSON)**:
  ```json
  {
    "conductor_id": "DRV-001"
  }
  ```

### 3.4. Consultar Conductores Activos en el Radar
- **Ruta**: `GET https://vixy.uno/api/conductores.php?disponibles=1`
- **Respuesta**: Lista de conductores con coordenadas `latitud_actual`, `longitud_actual`, vehículo, teléfono y estado.

---

## 4. Flujo Operativo de Pedidos y Despacho

### 4.1. Crear Pedido (App Clientes)
- **Ruta**: `POST https://vixy.uno/api/pedidos.php`
- **Payload (JSON)**:
  ```json
  {
    "cliente_id": "cli-001",
    "comercio_id": "com-001",
    "destino_direccion": "Calle 4, Edf. Rosalía, Apto 3B",
    "destino_lat": 10.48060000,
    "destino_lng": -66.90360000,
    "origen_direccion": "Comercio Aliado Los Palos Grandes",
    "origen_lat": 10.48800000,
    "origen_lng": -66.85330000,
    "distancia_km": 3.5,
    "metodo_pago": "pago_movil", // Opciones: "pago_movil", "saldo_cartera", "efectivo_usd", "binance", "zinli"
    "referencia_pago": "0102123456",
    "comprobante_url": "/api/uploads/comprobantes/rec_123.jpg",
    "items": [
      {
        "producto_id": "prod-101",
        "nombre": "Hamburguesa Doble Queso",
        "cantidad": 2,
        "precio_unitario_usd": 6.50
      },
      {
        "producto_id": "prod-102",
        "nombre": "Refresco 1.5L",
        "cantidad": 1,
        "precio_unitario_usd": 2.00
      }
    ]
  }
  ```
- **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "success": true,
    "mensaje": "Pedido registrado exitosamente en Vixy (Tiempo comercio: 60s)",
    "pedido_id": "ped-ABC123",
    "codigo_seguimiento": "VXY-789456",
    "costo_envio_usd": 2.50,
    "total_usd": 17.50,
    "total_bs": 700.00
  }
  ```

### 4.2. Listar Pedidos con Filtros
- **Ruta**: `GET https://vixy.uno/api/pedidos.php`
- **Filtros por Query Params**:
  - `?cliente_id=cli-001` (Historial de un cliente)
  - `?comercio_id=com-001` (Pedidos recibidos por una tienda)
  - `?conductor_id=DRV-001` (Carreras asignadas a un conductor)
  - `?estado=en_camino_al_cliente` (Filtrar por estado)

### 4.3. Consultar Detalle y Rastreo de un Pedido
- **Ruta**: `GET https://vixy.uno/api/pedidos.php?id=ped-ABC123` *(o con el código `?id=VXY-789456`)*
- **Respuesta**: Datos completos del pedido, renglones (`items`), datos del comercio, coordenadas del cliente y posición del delivery en tiempo real.

### 4.4. Aceptar o Rechazar Pedido por el Conductor
- **Aceptar carrera dentro de los 15s**:
  - `PUT https://vixy.uno/api/pedidos.php?id=ped-ABC123&action=aceptar_conductor`
  - Body: `{"conductor_id": "DRV-001"}`
- **Rechazar carrera (reasigna automáticamente al siguiente más cercano)**:
  - `PUT https://vixy.uno/api/pedidos.php?id=ped-ABC123&action=rechazar_conductor`
  - Body: `{"conductor_id": "DRV-001"}`

### 4.5. Actualizar Estado del Pedido
- **Ruta**: `PUT https://vixy.uno/api/pedidos.php?id=ped-ABC123`
- **Payload (JSON)**:
  ```json
  {
    "estado": "en_preparacion" // Estados: "solicitud_enviada", "pago_verificado", "en_preparacion", "esperando_repartidor", "en_camino_al_cliente", "entregado", "cancelado"
  }
  ```

---

## 5. Billeteras, Saldos y Recargas

### 5.1. Consultar Saldo de Cliente / Conductor
- **Ruta**: `GET https://vixy.uno/api/clientes.php?id=cli-001`
- **Respuesta Exitosa**:
  ```json
  {
    "success": true,
    "cliente": {
      "id": "cli-001",
      "nombre": "María Gómez",
      "saldo_cartera_usd": 25.00,
      "saldo_billetera_usd": 25.00,
      "latitud": 10.4806,
      "longitud": -66.9036
    }
  }
  ```

### 5.2. Reportar Recarga de Billetera (Pago Móvil / Transferencia)
- **Ruta**: `POST https://vixy.uno/api/recargas.php`
- **Payload (JSON)**:
  ```json
  {
    "usuario_id": "DRV-001",
    "tipo_usuario": "conductor", // "conductor", "comercio" o "cliente"
    "monto_usd": 10.00,
    "metodo": "pago_movil",
    "banco_emisor": "Banesco",
    "referencia": "12345678",
    "comprobante_url": "/api/uploads/comprobantes/rec_123.jpg"
  }
  ```

### 5.3. Solicitar Retiro / Liquidación de Fondos
- **Ruta**: `POST https://vixy.uno/api/solicitar-liquidacion.php`
- **Payload (JSON)**:
  ```json
  {
    "usuario_id": "DRV-001",
    "tipo_usuario": "conductor",
    "monto_solicitado_usd": 50.00,
    "metodo_pago": "pago_movil",
    "banco_destino": "Banco de Venezuela",
    "cuenta_telefono_destino": "04121234567",
    "titular_destino": "Carlos Pérez",
    "cedula_rif_destino": "V-12345678"
  }
  ```

---

## 6. Subida de Archivos y Fotos (Multipart)

### 6.1. Subida Centralizada de Imágenes
- **Ruta**: `POST https://vixy.uno/api/upload.php`
- **Formato**: `multipart/form-data`
- **Campos del Formulario**:
  - `imagen`: Archivo binario (JPG, PNG o WebP, máx 5MB).
  - `tipo`: Categoría de destino:
    - `'conductores'`: Foto de perfil o documentos de moto/licencia.
    - `'comercios'`: Logo o banner de tienda.
    - `'productos'`: Foto de artículo de menú o repuesto.
    - `'entregas'`: Foto de confirmación de entrega del delivery.
    - `'comprobantes'`: Recibo de Pago Móvil / depósito.
    - `'reclamos'`: Foto de evidencia en disputa.
  - `entity_id`: ID o cédula de la entidad (`DRV-001`, `com-001`, `ped-ABC`, etc.).
  - `campo`: *(Opcional)* `'perfil'`, `'cedula'`, `'licencia'`, `'carnet'`, `'logo'`, `'banner'`.
  - `comercio_id`: *(Opcional)* Requerido si el tipo es `productos`.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "mensaje": "Imagen almacenada exitosamente",
    "url": "/shop/imgs-c-d/deliverys/DRV-001/art_20260919_123456.png",
    "tipo": "conductores",
    "entity_id": "DRV-001"
  }
  ```

---

## 7. Configuración General y Tasa de Cambio BCV

### 7.1. Obtener Tasa Oficial y Parámetros del Sistema
- **Ruta**: `GET https://vixy.uno/api/configuracion.php`
- **Respuesta Exitosa**:
  ```json
  {
    "success": true,
    "config": {
      "tasa_bcv": 40.25,
      "tarifa_base_usd": 2.00,
      "km_base": 3.0,
      "precio_km_adicional_usd": 0.50,
      "limite_saldo_negativo_conductor_usd": -0.50,
      "comision_plataforma_porcentaje": 15
    }
  }
  ```

---

## 8. Catálogo de Comercios y Productos

### 8.1. Listar Comercios Aliados
- **Ruta**: `GET https://vixy.uno/api/comercios.php?solo_activos=1`

### 8.2. Listar Productos de un Comercio
- **Ruta**: `GET https://vixy.uno/api/productos.php?comercio_id=com-001`
