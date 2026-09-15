import zipfile
import os

def create_zip(source_dir, output_zip):
    if os.path.exists(output_zip):
        os.remove(output_zip)
        print(f"[-] Eliminado ZIP previo: {output_zip}")

    count = 0
    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, dirs, files in os.walk(source_dir):
            for file in sorted(files):
                if file in ['.DS_Store', 'Thumbs.db', 'desktop.ini']:
                    continue
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, source_dir).replace("\\", "/")
                zf.write(full_path, arcname)
                count += 1

    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"[OK] {output_zip}")
    print(f"     Archivos: {count} | Peso: {size_mb:.2f} MB\n")

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

folders = [
    (
        os.path.join(base, "vixy-admin-gps-ubicacion-real-2026-09-13", "public_html"),
        os.path.join(base, "vixy-admin-gps-ubicacion-real-2026-09-13", "vixy-admin-gps-ubicacion-real-2026-09-13.zip")
    ),
    (
        os.path.join(base, "vixy-admin-aprobacion-pagos-2026-09-13", "public_html"),
        os.path.join(base, "vixy-admin-aprobacion-pagos-2026-09-13", "vixy-admin-aprobacion-pagos-2026-09-13.zip")
    ),
]

for src, out in folders:
    print(f"-> Empaquetando: {os.path.basename(out)}")
    create_zip(src, out)

print("ZIPs generados:")
for _, out in folders:
    print(f"  {os.path.basename(out)}")
