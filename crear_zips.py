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

    # Eliminar ZIPs innecesarios si existen
    zips_a_eliminar = [
        "vixy_delivery.zip",
        "vixy_delivery_api.zip",
        "vixy_comercio.zip",
        "vixy_completo.zip",
    ]
    for z in zips_a_eliminar:
        if os.path.exists(z):
            os.remove(z)
            print(f"[-] Eliminado ZIP innecesario: {z}")

    # 1. vixy_servidor.zip: TODO el public_html (Tienda + Portal + Shop + Delivery API)
    print("-> Generando vixy_servidor.zip (COMPLETO: Tienda + Portal + Shop + Delivery API)...")
    create_zip("out", "vixy_servidor.zip")

    # 2. vixy_shop.zip: Solo lo que pertenece a /shop/ (frontend + backend tienda)
    print("-> Generando vixy_shop.zip (Frontend + Backend para /shop/)...")
    create_zip("out/shop", "vixy_shop.zip")

    print("Proceso finalizado con exito.")
    print("")
    print("ZIPs generados:")
    print("  vixy_servidor.zip -> Sube a public_html/ (contiene TODO)")
    print("  vixy_shop.zip     -> Sube a public_html/shop/ (solo tienda)")
