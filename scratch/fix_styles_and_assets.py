import os
import shutil

def merge_folders(src, dst):
    if not os.path.exists(src):
        return
    for root, dirs, files in os.walk(src):
        rel = os.path.relpath(root, src)
        dest_dir = os.path.join(dst, rel) if rel != '.' else dst
        os.makedirs(dest_dir, exist_ok=True)
        for f in files:
            s_file = os.path.join(root, f)
            d_file = os.path.join(dest_dir, f)
            shutil.copy2(s_file, d_file)

def fix_everything():
    print("1. Arreglando anidamiento de out/_next/_next...")
    nested_next = os.path.join("out", "_next", "_next")
    target_next = os.path.join("out", "_next")
    if os.path.exists(nested_next):
        print(f"  Moviendo contenido de {nested_next} a {target_next}...")
        merge_folders(nested_next, target_next)
        shutil.rmtree(nested_next)
        print("  [OK] out/_next/_next eliminado y contenido fusionado en out/_next")

    print("\n2. Arreglando anidamiento de out/store/_next/_next...")
    nested_store_next = os.path.join("out", "store", "_next", "_next")
    target_store_next = os.path.join("out", "store", "_next")
    if os.path.exists(nested_store_next):
        print(f"  Moviendo contenido de {nested_store_next} a {target_store_next}...")
        merge_folders(nested_store_next, target_store_next)
        shutil.rmtree(nested_store_next)
        print("  [OK] out/store/_next/_next eliminado y contenido fusionado")

    print("\n3. Copiando carpeta icons a out/icons...")
    if os.path.exists("icons"):
        merge_folders("icons", os.path.join("out", "icons"))
        print("  [OK] out/icons actualizado")

    print("\n4. Asegurando logo/logostore.png...")
    vixylogo = os.path.join("out", "logo", "vixylogo.png")
    logostore = os.path.join("out", "logo", "logostore.png")
    if os.path.exists(vixylogo) and not os.path.exists(logostore):
        shutil.copy2(vixylogo, logostore)
        print("  [OK] out/logo/logostore.png creado")

    # Verificar existencia de archivos CSS clave
    css_84 = os.path.join("out", "_next", "static", "css", "84d8ad1538896ebb.css")
    css_62 = os.path.join("out", "_next", "static", "css", "62c587f698a37e80.css")
    print("\n5. Verificando archivos CSS en out/_next/static/css:")
    print(f"  84d8ad1538896ebb.css existe: {os.path.exists(css_84)} ({os.path.getsize(css_84) if os.path.exists(css_84) else 0} bytes)")
    print(f"  62c587f698a37e80.css existe: {os.path.exists(css_62)} ({os.path.getsize(css_62) if os.path.exists(css_62) else 0} bytes)")

if __name__ == "__main__":
    fix_everything()
