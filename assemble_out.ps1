# ==============================================================================
# SCRIPT DE ENSAMBLADO MAESTRO PARA CARPETA OUT (DONWEB / CPANEL / FEROZO)
# ==============================================================================

$root = Get-Location

# 1. Crear directorios base en out si no existen
$dirs = @(
    "out/store",
    "out/store/api",
    "out/store/_next",
    "out/shop",
    "out/shop/backend",
    "out/registro-comercios",
    "out/registro-comercios/api",
    "out/registro-delivery",
    "out/api",
    "out/banners",
    "out/logo",
    "out/payment-icons",
    "out/qr",
    "out/cards"
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

# Limpiar rutas obsoletas de /delivery/ para mantener exclusivamente /shop/
if (Test-Path "out/delivery") {
    Remove-Item -Path "out/delivery" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Directorio obsoleto out/delivery eliminado (exclusividad /shop/)"
}

# Limpiar imagenes vixycard sueltas que hayan quedado en la raiz de out o en out/store
Remove-Item -Path "out/vixycard*.png" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "out/store/vixycard*.png" -Force -ErrorAction SilentlyContinue

# 2. Rutas que pertenecen a la tienda: replicar en out/store/ Y mantener en out/
#    Esto garantiza que el usuario pueda acceder tanto por /auth/login como por /store/auth/login
$storeSubDirs = @("admin", "auth", "carrito", "checkout", "cuenta", "producto", "404")
foreach ($sub in $storeSubDirs) {
    if (Test-Path "out/$sub") {
        if (Test-Path "out/store/$sub") { Remove-Item -Path "out/store/$sub" -Recurse -Force }
        Copy-Item -Path "out/$sub" -Destination "out/store/$sub" -Recurse -Force
        Write-Host "[OK] Ruta '$sub' sincronizada en out/$sub y out/store/$sub"
    } elseif (Test-Path "out/store/$sub") {
        if (-not (Test-Path "out/$sub")) {
            Copy-Item -Path "out/store/$sub" -Destination "out/$sub" -Recurse -Force
            Write-Host "[OK] Ruta '$sub' restaurada en out/$sub desde out/store/$sub"
        }
    }
}

if (Test-Path "out/404.html") {
    Copy-Item -Path "out/404.html" -Destination "out/store/404.html" -Force
}

# 3. Restaurar el index.html original de la tienda (catálogo repuestos) en out/store/index.html
if (Test-Path ".next/server/app/index.html") {
    Copy-Item -Path ".next/server/app/index.html" -Destination "out/store/index.html" -Force
    Write-Host "[OK] Catalogo de Vixy Store restaurado en out/store/index.html"
}

# 4. INSTALAR EL PORTAL SELECTOR COMO ROOT INDEX.HTML
if (Test-Path "portal_index.html") {
    Copy-Item -Path "portal_index.html" -Destination "out/index.html" -Force
    Write-Host "[OK] Portal Selector instalado como out/index.html"
}

# 5. CRÍTICO PARA CSS/JS: _next debe existir en la RAÍZ (out/_next) Y en (out/store/_next)
if (Test-Path "out/_next") {
    Copy-Item -Path "out/_next/*" -Destination "out/store/_next" -Recurse -Force
    Write-Host "[OK] Assets _next sincronizados en out/store/_next y out/_next"
} elseif (Test-Path "out/store/_next") {
    Copy-Item -Path "out/store/_next/*" -Destination "out/_next" -Recurse -Force
    Write-Host "[OK] Assets _next restaurados en out/_next desde out/store/_next"
}

# 6. Copiar backend de VixyStore a out/store/api y out/api
Copy-Item -Path "api/*" -Destination "out/store/api" -Recurse -Force
Copy-Item -Path "api/*" -Destination "out/api" -Recurse -Force
Write-Host "[OK] Backend PHP VixyStore sincronizado en out/api y out/store/api"

# 6b. Copiar backend de Delivery a out/api/ (endpoints para la APK de conductores/comercios)
#     Se hace DESPUÉS del store API para que los archivos de delivery tengan prioridad
#     La APK se conecta a: https://vixy.uno/api/auth.php, /api/conductores.php, etc.
if (-not (Test-Path "out/api/config")) {
    New-Item -ItemType Directory -Path "out/api/config" -Force | Out-Null
}
Copy-Item -Path "delivery/backend/php/*.php" -Destination "out/api" -Recurse -Force
Copy-Item -Path "delivery/backend/php/.htaccess" -Destination "out/api" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "delivery/backend/php/config/*" -Destination "out/api/config" -Recurse -Force
if (-not (Test-Path "out/api/uploads")) {
    New-Item -ItemType Directory -Path "out/api/uploads" -Force | Out-Null
}
$uploadDirs = @("admin","comercios","comprobantes","entregas","productos","reclamos")
foreach ($ud in $uploadDirs) {
    if (-not (Test-Path "out/api/uploads/$ud")) {
        New-Item -ItemType Directory -Path "out/api/uploads/$ud" -Force | Out-Null
    }
}
Write-Host "[OK] Backend PHP Delivery (APK endpoints) sincronizado en out/api"


# 7. Copiar frontend y backend de Shop (Vixy Shop)
if (Test-Path "out/shop/assets") {
    Remove-Item -Path "out/shop/assets" -Recurse -Force
}
Copy-Item -Path "shop/dist/*" -Destination "out/shop" -Recurse -Force
Copy-Item -Path "shop/backend/*" -Destination "out/shop/backend" -Recurse -Force
if (Test-Path "out/shop/imgs-c-d") { Remove-Item -Path "out/shop/imgs-c-d" -Recurse -Force }
New-Item -ItemType Directory -Path "out/shop/imgs-c-d" -Force | Out-Null
Copy-Item -Path "shop/imgs-c-d/*" -Destination "out/shop/imgs-c-d" -Recurse -Force

if (Test-Path "out/imgs-c-d") { Remove-Item -Path "out/imgs-c-d" -Recurse -Force }
New-Item -ItemType Directory -Path "out/imgs-c-d" -Force | Out-Null
Copy-Item -Path "shop/imgs-c-d/*" -Destination "out/imgs-c-d" -Recurse -Force

if (-not (Test-Path "out/uploads/comercios")) {
    New-Item -ItemType Directory -Path "out/uploads/comercios" -Force | Out-Null
}

Copy-Item -Path "database/actualizar_verificacion_cuentas.sql" -Destination "out/shop" -Force
Copy-Item -Path "database/migracion_claves_y_conductores.sql" -Destination "out/shop" -Force

if (Test-Path "out/shop/assets/aistudio") {
    Remove-Item -Path "out/shop/assets/aistudio" -Recurse -Force
}

# 7b. Eliminar /panel/ del output - los deliverys se manejan en el admin panel de /shop/
#     NO existe URL separada /panel/ - todo se gestiona desde vixy.uno/shop/
if (Test-Path "out/panel-admin") {
    Remove-Item -Path "out/panel-admin" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "out/panel") {
    Remove-Item -Path "out/panel" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] out/panel eliminado - conductores se gestionan dentro de /shop/ admin panel"
}

# 8. Copiar backend de Registro de Comercios a out/registro-comercios/api
Copy-Item -Path "registro-comercios/api/*" -Destination "out/registro-comercios/api" -Recurse -Force
Copy-Item -Path "database/actualizar_comercios_independientes.sql" -Destination "out/registro-comercios" -Force -ErrorAction SilentlyContinue

# 9. Copiar assets multimedia a la raiz
#    (la regla en .htaccess reescribe /store/(banners|logo|payment-icons|qr|cards)/ a /(banners|...)/ sin duplicar 15MB)
Copy-Item -Path "public/banners/*" -Destination "out/banners" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/logo/*" -Destination "out/logo" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/payment-icons/*" -Destination "out/payment-icons" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/qr/*" -Destination "out/qr" -Recurse -Force -ErrorAction SilentlyContinue

# Limpiar carpetas multimedia duplicadas en out/store si existen de ensamblados anteriores
$storeDups = @("banners", "logo", "payment-icons", "qr", "cards")
foreach ($sd in $storeDups) {
    if (Test-Path "out/store/$sd") {
        Remove-Item -Path "out/store/$sd" -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# 9b. Copiar carpeta de cards optimizadas (WebP + PNG) a out/cards/
Copy-Item -Path "public/cards/*" -Destination "out/cards" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "[OK] Carpeta /cards/ (WebP optimizadas) instalada en out/cards/"

# 10. COPIAR .HTACCESS MAESTRO (LIMPIO SIN BOM PARA CPANEL/APACHE)
if (Test-Path "public/.htaccess") {
    Copy-Item -Path "public/.htaccess" -Destination "out/.htaccess" -Force
    Write-Host "[OK] Master .htaccess instalado en out/.htaccess desde public/.htaccess"
}

# 11. Crear .nojekyll en out
New-Item -ItemType File -Path "out/.nojekyll" -Force | Out-Null

Write-Host "Ensamblado de carpetas completado con exito."
