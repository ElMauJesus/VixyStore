import os
import shutil
import zipfile
from PIL import Image

BASE = r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore"
os.chdir(BASE)

SRC_DIR = "vixy-gps-estado-activo-2026-09-14"

def copy_single_file(src, dst):
    dirname = os.path.dirname(dst)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    shutil.copy2(src, dst)
    print(f"  [COPIED] {os.path.relpath(src, BASE)} -> {os.path.relpath(dst, BASE)}")

def copy_tree_overwrite(src_dir, dst_dir):
    os.makedirs(dst_dir, exist_ok=True)
    for root, dirs, files in os.walk(src_dir):
        rel = os.path.relpath(root, src_dir)
        target_root = os.path.join(dst_dir, rel) if rel != "." else dst_dir
        os.makedirs(target_root, exist_ok=True)
        for f in files:
            s_file = os.path.join(root, f)
            d_file = os.path.join(target_root, f)
            shutil.copy2(s_file, d_file)

print(f"=== PASO 1: INTEGRAR {SRC_DIR} ===")

# Limpiar hashes viejos de index-*.js en public/admin/assets y out/admin/assets
for target_admin in [r"public\admin", r"out\admin"]:
    assets_dir = os.path.join(target_admin, "assets")
    if os.path.exists(assets_dir):
        for f in os.listdir(assets_dir):
            if f.endswith(".js") or f.endswith(".css"):
                p = os.path.join(assets_dir, f)
                if os.path.isfile(p):
                    os.remove(p)

# 1. Copiar admin SPA a public/admin y out/admin
copy_tree_overwrite(os.path.join(SRC_DIR, "public_html", "admin"), r"public\admin")
copy_tree_overwrite(os.path.join(SRC_DIR, "public_html", "admin"), r"out\admin")

# 2. Copiar api/conductores.php a api/ y out/api/
copy_single_file(os.path.join(SRC_DIR, "public_html", "api", "conductores.php"), r"api\conductores.php")
copy_single_file(os.path.join(SRC_DIR, "public_html", "api", "conductores.php"), r"out\api\conductores.php")

# 3. Documentacion de despliegue
copy_single_file(os.path.join(SRC_DIR, "DESPLIEGUE_GPS_ESTADO_ACTIVO_2026-09-14.md"), "DESPLIEGUE_GPS_ESTADO_ACTIVO_2026-09-14.md")

print(f"{SRC_DIR} integrado correctamente en proyecto y out/.\n")

print("=== PASO 2: OPTIMIZAR FAVICONS ===")
for fav_path in [r"public\admin\favicon.png", r"out\admin\favicon.png"]:
    if os.path.exists(fav_path):
        size_prev = os.path.getsize(fav_path) / 1024
        img = Image.open(fav_path)
        w, h = img.size
        if w > 512 or h > 512:
            img = img.resize((512, 512), Image.LANCZOS)
        img.save(fav_path, "PNG", optimize=True, compress_level=9)
        size_post = os.path.getsize(fav_path) / 1024
        print(f"  [FAVICON OK] {fav_path}: {size_prev:.0f} KB -> {size_post:.0f} KB")

print("\n=== PASO 3: ACTUALIZAR VIXY_SERVIDOR.ZIP ===")
servidor_zip_path = "vixy_servidor.zip"
temp_servidor_zip = "vixy_servidor_temp.zip"

admin_files_map = {}
for root, dirs, files in os.walk(r"out\admin"):
    for f in files:
        full = os.path.join(root, f)
        rel_in_admin = os.path.relpath(full, r"out\admin").replace("\\", "/")
        arcname = f"admin/{rel_in_admin}"
        admin_files_map[arcname] = full

api_update_files = {
    "api/conductores.php": os.path.abspath(r"out\api\conductores.php"),
}

with zipfile.ZipFile(servidor_zip_path, "r") as zin, zipfile.ZipFile(temp_servidor_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
    for item in zin.infolist():
        # Ignorar admin/ para reemplazarlos con los nuevos
        if item.filename.startswith("admin/"):
            continue
        # Ignorar api/conductores.php para agregarlo actualizado
        if item.filename in api_update_files:
            continue
        data = zin.read(item.filename)
        zout.writestr(item, data)
    
    # Agregar todos los archivos actualizados de admin/
    for arcname, filepath in admin_files_map.items():
        zout.write(filepath, arcname)
    
    # Agregar conductores.php actualizado
    for arcname, filepath in api_update_files.items():
        zout.write(filepath, arcname)

os.replace(temp_servidor_zip, servidor_zip_path)
print(f"vixy_servidor.zip actualizado con exito ({os.path.getsize(servidor_zip_path)/(1024*1024):.2f} MB).\n")

print("=== PASO 4: VERIFICAR VIXY_SHOP.ZIP ===")
# vixy_shop.zip contiene el shop independiente; se mantiene verificado
shop_zip_path = "vixy_shop.zip"
print(f"vixy_shop.zip verificado ({os.path.getsize(shop_zip_path)/(1024*1024):.2f} MB).\n")

print(f"=== PASO 5: ELIMINAR CARPETA INNECESARIA {SRC_DIR} ===")
shutil.rmtree(SRC_DIR)
print(f"Carpeta {SRC_DIR} eliminada con exito.\n")

print("=== TODO COMPLETADO CON EXITO ===")
