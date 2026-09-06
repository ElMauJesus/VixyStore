# ==============================================================================
# SCRIPT DE ENSAMBLADO MAESTRO PARA CARPETA OUT (DONWEB / CPANEL / FEROZO)
# ==============================================================================

$root = Get-Location

# 1. Crear directorios base en out si no existen
$dirs = @(
    "out/store",
    "out/store/api",
    "out/store/_next",
    "out/store/banners",
    "out/store/logo",
    "out/store/payment-icons",
    "out/store/qr",
    "out/delivery",
    "out/delivery/backend",
    "out/registro-comercios",
    "out/registro-comercios/api",
    "out/registro-delivery",
    "out/api",
    "out/banners",
    "out/logo",
    "out/payment-icons",
    "out/qr"
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

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
Write-Host "[OK] Backend PHP sincronizado en out/api y out/store/api"

# 7. Copiar frontend y backend de Delivery
if (Test-Path "out/delivery/assets") {
    Remove-Item -Path "out/delivery/assets" -Recurse -Force
}
Copy-Item -Path "delivery/dist/*" -Destination "out/delivery" -Recurse -Force
Copy-Item -Path "delivery/backend/*" -Destination "out/delivery/backend" -Recurse -Force

if (Test-Path "out/delivery/assets/aistudio") {
    Remove-Item -Path "out/delivery/assets/aistudio" -Recurse -Force
}

# 8. Copiar backend de Registro de Comercios a out/registro-comercios/api
Copy-Item -Path "registro-comercios/api/*" -Destination "out/registro-comercios/api" -Recurse -Force

# 9. Copiar assets multimedia compartidos a raíz Y a out/store/ para evitar 404
Copy-Item -Path "public/banners/*" -Destination "out/banners" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/logo/*" -Destination "out/logo" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/payment-icons/*" -Destination "out/payment-icons" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/qr/*" -Destination "out/qr" -Recurse -Force -ErrorAction SilentlyContinue

Copy-Item -Path "public/banners/*" -Destination "out/store/banners" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/logo/*" -Destination "out/store/logo" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/payment-icons/*" -Destination "out/store/payment-icons" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public/qr/*" -Destination "out/store/qr" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "[OK] Assets multimedia instalados en raiz y /store/"

# 10. COPIAR .HTACCESS MAESTRO (LIMPIO SIN BOM PARA CPANEL/APACHE)
if (Test-Path "public/.htaccess") {
    Copy-Item -Path "public/.htaccess" -Destination "out/.htaccess" -Force
    Write-Host "[OK] Master .htaccess instalado en out/.htaccess desde public/.htaccess"
}

# 11. Crear .nojekyll en out
New-Item -ItemType File -Path "out/.nojekyll" -Force | Out-Null

Write-Host "Ensamblado de carpetas completado con exito."
