import zipfile
import os

def create_zip(source_dir, output_zip, exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = []
    
    if os.path.exists(output_zip):
        os.remove(output_zip)
        print(f"[-] Eliminado ZIP previo: {output_zip}")

    count = 0
    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, dirs, files in os.walk(source_dir):
            # Excluir directorios no deseados
            rel_root = os.path.relpath(root, source_dir).replace("\\", "/")
            if rel_root != "." and any(rel_root == exc or rel_root.startswith(exc + "/") for exc in exclude_dirs):
                continue

            for file in sorted(files):
                if file in ['.DS_Store', 'Thumbs.db', 'desktop.ini']:
                    continue
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, source_dir).replace("\\", "/")
                zf.write(full_path, arcname)
                count += 1

    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"[OK] {output_zip} generado exitosamente:")
    print(f"     Archivos incluidos: {count} | Peso: {size_mb:.2f} MB\n")

if __name__ == "__main__":
    print("==================================================")
    print("EMPAQUETADOR OFICIAL VIXY STORE & DELIVERY")
    print("==================================================")

    # 1. vixy_servidor.zip: EL ARCHIVO COMPLETO DE TODO PUBLIC_HTML (como en la captura del cPanel)
    print("-> Generando vixy_servidor.zip (COMPLETO: Tienda + Portal + Delivery + Registros)...")
    create_zip("out", "vixy_servidor.zip")

    # 2. vixy_delivery.zip: Solo lo que pertenece a /delivery/
    print("-> Generando vixy_delivery.zip (Frontend + Backend + SQL para /delivery/)...")
    create_zip("out/delivery", "vixy_delivery.zip")

    # 3. vixy_comercio.zip: Portal raíz y tienda Vixy (excluyendo la carpeta /delivery/)
    print("-> Generando vixy_comercio.zip (Tienda, Portal, Registros, APIs excluyendo /delivery/)...")
    create_zip("out", "vixy_comercio.zip", exclude_dirs=["delivery"])

    print("Proceso finalizado con éxito.")
