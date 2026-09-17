import os
import shutil
import subprocess

BASE = r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore"

def copy_file(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    print(f"[SYNC] {os.path.relpath(src, BASE)} -> {os.path.relpath(dst, BASE)}")

def main():
    print("=== SINCRONIZANDO ARCHIVOS ACTUALIZADOS ===")

    # 1. conductores.php (Origen principal: api/conductores.php)
    src_cond = os.path.join(BASE, "api", "conductores.php")
    targets_cond = [
        os.path.join(BASE, "shop", "backend", "php", "conductores.php"),
        os.path.join(BASE, "out", "shop", "backend", "php", "conductores.php"),
        os.path.join(BASE, "out", "api", "conductores.php"),
        os.path.join(BASE, "delivery", "backend", "php", "conductores.php"),
    ]
    for dst in targets_cond:
        copy_file(src_cond, dst)

    # 2. auth.php (Origen: api/auth.php)
    src_auth = os.path.join(BASE, "api", "auth.php")
    targets_auth = [
        os.path.join(BASE, "shop", "backend", "php", "auth.php"),
        os.path.join(BASE, "out", "shop", "backend", "php", "auth.php"),
        os.path.join(BASE, "out", "api", "auth.php"),
        os.path.join(BASE, "delivery", "backend", "php", "auth.php"),
    ]
    for dst in targets_auth:
        copy_file(src_auth, dst)

    # 3. keep_alive.php (Origen: api/keep_alive.php)
    src_keep = os.path.join(BASE, "api", "keep_alive.php")
    targets_keep = [
        os.path.join(BASE, "shop", "backend", "php", "keep_alive.php"),
        os.path.join(BASE, "out", "shop", "backend", "php", "keep_alive.php"),
        os.path.join(BASE, "out", "api", "keep_alive.php"),
        os.path.join(BASE, "delivery", "backend", "php", "keep_alive.php"),
    ]
    for dst in targets_keep:
        copy_file(src_keep, dst)

    # 4. Configs (db.php, config.php, auth_middleware.php)
    for cfg in ["db.php", "config.php", "auth_middleware.php"]:
        src_cfg = os.path.join(BASE, "api", "config", cfg)
        targets_cfg = [
            os.path.join(BASE, "out", "api", "config", cfg),
            os.path.join(BASE, "shop", "backend", "php", "config", cfg),
            os.path.join(BASE, "out", "shop", "backend", "php", "config", cfg),
            os.path.join(BASE, "delivery", "backend", "php", "config", cfg),
        ]
        for dst in targets_cfg:
            copy_file(src_cfg, dst)

    # 5. delivery app en out/delivery
    pub_del = os.path.join(BASE, "public", "delivery")
    out_del = os.path.join(BASE, "out", "delivery")
    if os.path.exists(pub_del):
        shutil.copytree(pub_del, out_del, dirs_exist_ok=True)
        print(f"[SYNC] public/delivery -> out/delivery")

    # 6. Copiar shop/dist a out/shop
    print("\n=== COPIANDO SHOP DIST A OUT/SHOP ===")
    dist_dir = os.path.join(BASE, "shop", "dist")
    out_shop_dir = os.path.join(BASE, "out", "shop")
    
    # Limpiar assets viejos de out/shop/assets
    out_shop_assets = os.path.join(out_shop_dir, "assets")
    if os.path.exists(out_shop_assets):
        shutil.rmtree(out_shop_assets)
        print("[-] Limpiado out/shop/assets previo")

    for item in os.listdir(dist_dir):
        s = os.path.join(dist_dir, item)
        d = os.path.join(out_shop_dir, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)
    print("[OK] shop/dist copiado a out/shop")

    # 7. Generar ZIPs oficiales
    print("\n=== GENERANDO ZIPS OFICIALES ===")
    res = subprocess.run(["python", "crear_zips.py"], cwd=BASE, capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print("STDERR:", res.stderr)

    # 8. Comprobar tamaños
    servidor_zip = os.path.join(BASE, "vixy_servidor.zip")
    shop_zip = os.path.join(BASE, "vixy_shop.zip")
    if os.path.exists(servidor_zip):
        size_mb = os.path.getsize(servidor_zip) / (1024 * 1024)
        print(f"VERIFICACIÓN: vixy_servidor.zip = {size_mb:.2f} MB (< 50 MB: {size_mb < 50.0})")
    if os.path.exists(shop_zip):
        size_mb = os.path.getsize(shop_zip) / (1024 * 1024)
        print(f"VERIFICACIÓN: vixy_shop.zip = {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
