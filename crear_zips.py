import zipfile
import os

def create_zip(source_dir, output_zip):
    if os.path.exists(output_zip):
        os.remove(output_zip)
        print(f"[-] Eliminado ZIP previo: {output_zip}")

    count = 0
    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, source_dir).replace("\\", "/")
                zf.write(full_path, arcname)
                count += 1

    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"[OK] {output_zip} generado exitosamente:")
    print(f"     Archivos: {count} | Peso: {size_mb:.2f} MB\n")

if __name__ == "__main__":
    print("==================================================")
    print("EMPAQUETADOR OFICIAL VIXY STORE & DELIVERY")
    print("==================================================")

    # 1. vixy_delivery.zip: Solo lo que pertenece a /delivery/
    create_zip("out/delivery", "vixy_delivery.zip")

    # 2. vixy_completo.zip: TODO el portal y subsistemas
    create_zip("out", "vixy_completo.zip")
