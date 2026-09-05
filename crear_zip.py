import zipfile
import os

source_dir = "out"
output_zip = "vixy_servidor.zip"

if os.path.exists(output_zip):
    os.remove(output_zip)
    print(f"ZIP anterior eliminado.")

count = 0
with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for root, dirs, files in os.walk(source_dir):
        # Incluir TODOS los archivos, incluyendo dotfiles (.htaccess, .nojekyll, etc.)
        for file in files:
            full_path = os.path.join(root, file)
            # Ruta dentro del zip: relativa a source_dir
            arcname = os.path.relpath(full_path, source_dir)
            # Normalizar separadores a /
            arcname = arcname.replace("\\", "/")
            zf.write(full_path, arcname)
            count += 1
            print(f"  + {arcname}")

size_mb = os.path.getsize(output_zip) / (1024 * 1024)
print(f"\nZIP creado: {output_zip}")
print(f"Archivos incluidos: {count}")
print(f"Tamaño: {size_mb:.2f} MB")
