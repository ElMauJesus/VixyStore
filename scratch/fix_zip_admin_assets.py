"""
fix_zip_admin_assets.py
Correcciones al vixy_servidor.zip:

1. El index.html del admin referencia /admin/assets/index-CKwTNErC.js y /admin/assets/index-BWTBQP9j.css
   pero en el zip los JS/CSS del admin están en assets/ (raíz, compartidos).
   Necesitamos agregarlos también bajo admin/assets/ para que Apache los sirva correctamente.

2. Sincronizar api/conductores.php corregido (GPS fix) dentro del zip.

3. Sincronizar shop/backend/php/conductores.php con el fix de GPS.
"""

import zipfile
import os
import shutil

ZIP_SERVER = 'vixy_servidor.zip'
ZIP_TMP    = 'vixy_servidor_fixed.zip'

# ── Archivos del admin SPA (vienen de out/admin)
ADMIN_HTML  = 'out/admin/index.html'
ADMIN_INDEX_CONTENT = open(ADMIN_HTML, 'rb').read()

# Leer el index.html para saber qué hashes usa el admin SPA
import re
html_text = ADMIN_INDEX_CONTENT.decode('utf-8')
admin_js_refs  = re.findall(r'src=["\']([^"\']+\.js)["\']', html_text)
admin_css_refs = re.findall(r'href=["\']([^"\']+\.css)["\']', html_text)
print("Admin JS refs:", admin_js_refs)
print("Admin CSS refs:", admin_css_refs)

# Los refs son del tipo /admin/assets/index-XXXX.js → basename
admin_asset_files = set()
for ref in admin_js_refs + admin_css_refs:
    basename = os.path.basename(ref)
    if basename:
        admin_asset_files.add(basename)

print("Admin asset filenames needed:", admin_asset_files)

# Estos archivos están en out/assets/ (o deben estar en admin/assets/ en el zip)
# Verifiquemos cuáles existen en out/assets
found_in_out_assets = {}
for fname in admin_asset_files:
    # Buscar en out/assets y out/ recursivamente
    for root, dirs, files in os.walk('out/assets'):
        if fname in files:
            found_in_out_assets[fname] = os.path.join(root, fname)
    # También buscar en el directorio de branding admin
    for root, dirs, files in os.walk('out'):
        if fname in files:
            if fname not in found_in_out_assets:
                found_in_out_assets[fname] = os.path.join(root, fname)

print("Found admin asset files on disk:", list(found_in_out_assets.keys()))

# ── Archivos PHP a sincronizar en el zip
php_updates = {
    'api/conductores.php': 'api/conductores.php',
}
# Sincronizar shop backend si existe
shop_conductores = 'shop/backend/php/conductores.php'
if os.path.exists(shop_conductores):
    php_updates[shop_conductores] = shop_conductores

print("\nPHP files to sync:", list(php_updates.keys()))

# ── Reconstruir el zip
with zipfile.ZipFile(ZIP_SERVER, 'r') as zin:
    with zipfile.ZipFile(ZIP_TMP, 'w', compression=zipfile.ZIP_DEFLATED, allowZip64=True) as zout:
        existing_names = set(zin.namelist())

        # Copiar todos los archivos existentes EXCEPTO los que vamos a actualizar
        skip_entries = set()
        # Convertir los path updates a zip-path keys
        for disk_path, zip_path in php_updates.items():
            zip_path_normalized = zip_path.replace('\\', '/')
            skip_entries.add(zip_path_normalized)

        for item in zin.infolist():
            item_name = item.filename.replace('\\', '/')
            if item_name not in skip_entries:
                data = zin.read(item.filename)
                zout.writestr(item, data)
            else:
                print(f"  [SKIP existing] {item_name} (will be updated)")

        # Agregar/actualizar archivos PHP corregidos
        for disk_path, zip_path in php_updates.items():
            if os.path.exists(disk_path):
                zip_path_normalized = zip_path.replace('\\', '/')
                zout.write(disk_path, zip_path_normalized)
                print(f"  [UPDATE PHP] {zip_path_normalized}")
            else:
                print(f"  [WARN] PHP not found on disk: {disk_path}")

        # Agregar admin/assets/ con los archivos del SPA de admin
        for fname, disk_path in found_in_out_assets.items():
            zip_entry = f'admin/assets/{fname}'
            if zip_entry not in existing_names:
                zout.write(disk_path, zip_entry)
                print(f"  [ADD admin/assets] {zip_entry}")
            else:
                print(f"  [ALREADY EXISTS] {zip_entry}")

        # Actualizar admin/index.html (siempre refrescar)
        if os.path.exists(ADMIN_HTML):
            zout.write(ADMIN_HTML, 'admin/index.html')
            print("  [UPDATE] admin/index.html")

print(f"\n✅ ZIP corregido guardado en: {ZIP_TMP}")

# Reemplazar el original
os.replace(ZIP_TMP, ZIP_SERVER)
print(f"✅ {ZIP_SERVER} actualizado con éxito")

# Verificar
print("\n=== Verificación post-fix ===")
with zipfile.ZipFile(ZIP_SERVER, 'r') as z:
    admin_entries = sorted([n for n in z.namelist() if n.startswith('admin/')])
    for e in admin_entries:
        info = z.getinfo(e)
        print(f"  {e}  ({info.file_size / 1024:.0f} KB)")
