import zipfile
import os
import shutil

base = r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore"
zip_path = os.path.join(base, "vixy_servidor.zip")
tmp_zip = zip_path + ".tmp"

# Archivos a inyectar desde las carpetas de deploy
# Clave: ruta dentro del ZIP (relativa al public_html)
# Valor: ruta local del archivo
patches = {}

deploy_folders = [
    os.path.join(base, "vixy-admin-gps-ubicacion-real-2026-09-13", "public_html"),
    os.path.join(base, "vixy-admin-aprobacion-pagos-2026-09-13", "public_html"),
    os.path.join(base, "vixy-suite-web-redesign-2026-09-13", "public_html"),
    os.path.join(base, "vixy-aprobaciones-pago-movil-fix-2026-09-13", "public_html"),
    os.path.join(base, "vixy-admin-mapa-comercios-deliverys-2026-09-13", "public_html"),
    os.path.join(base, "vixy-delivery-login-bd-produccion-2026-09-13", "public_html"),
]

for deploy_root in deploy_folders:
    folder_name = os.path.basename(os.path.dirname(deploy_root))
    for root, dirs, files in os.walk(deploy_root):
        for fname in files:
            if fname in ['.DS_Store', 'Thumbs.db', 'desktop.ini']:
                continue
            full_path = os.path.join(root, fname)
            arcname = os.path.relpath(full_path, deploy_root).replace("\\", "/")
            patches[arcname] = full_path
            print(f"  [PATCH] {arcname}  <- {folder_name}")

print(f"\nTotal archivos a sobreescribir/agregar: {len(patches)}\n")

# Leer ZIP original y reescribirlo aplicando los parches
with zipfile.ZipFile(zip_path, "r") as zin:
    with zipfile.ZipFile(tmp_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
        replaced = set()
        kept = 0
        for item in zin.infolist():
            arc = item.filename.replace("\\", "/")
            if arc in patches:
                # Reemplazar con la version nueva
                zout.write(patches[arc], arc)
                replaced.add(arc)
                print(f"  [REEMPLAZADO] {arc}")
            else:
                # Mantener archivo original
                data = zin.read(item.filename)
                zout.writestr(item, data)
                kept += 1

        # Agregar archivos nuevos que no estaban en el ZIP original
        for arc, src in patches.items():
            if arc not in replaced:
                zout.write(src, arc)
                print(f"  [AGREGADO] {arc}")

os.replace(tmp_zip, zip_path)
size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"\n[OK] vixy_servidor.zip actualizado exitosamente")
print(f"     Archivos originales mantenidos: {kept}")
print(f"     Archivos del deploy aplicados: {len(patches)}")
print(f"     Peso final: {size_mb:.2f} MB")
