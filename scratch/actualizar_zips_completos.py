import zipfile
import os

base = r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore"

# -------------------------------------------------------------
# 1. ACTUALIZAR vixy_shop.zip (directo para public_html/shop/)
# -------------------------------------------------------------
shop_zip = os.path.join(base, "vixy_shop.zip")
tmp_shop = shop_zip + ".tmp"

shop_patches = {
    "index.html": os.path.join(base, "shop", "dist", "index.html"),
    "assets/index-wldueJKP.js": os.path.join(base, "shop", "dist", "assets", "index-wldueJKP.js"),
    "assets/index-oFAWvUQ9.css": os.path.join(base, "shop", "dist", "assets", "index-oFAWvUQ9.css"),
    "backend/php/recargas.php": os.path.join(base, "shop", "backend", "php", "recargas.php"),
    "backend/php/conductores.php": os.path.join(base, "shop", "backend", "php", "conductores.php"),
}

with zipfile.ZipFile(shop_zip, "r") as zin:
    with zipfile.ZipFile(tmp_shop, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
        replaced = set()
        for item in zin.infolist():
            arc = item.filename.replace("\\", "/")
            # Limpiar versiones viejas de bundles de assets
            if arc.startswith("assets/index-") and (arc.endswith(".js") or arc.endswith(".css")):
                continue
            if arc in shop_patches:
                zout.write(shop_patches[arc], arc)
                replaced.add(arc)
                print(f"  [SHOP PATCH] {arc}")
            else:
                data = zin.read(item.filename)
                zout.writestr(item, data)

        for arc, src in shop_patches.items():
            if arc not in replaced:
                zout.write(src, arc)
                print(f"  [SHOP ADD] {arc}")

os.replace(tmp_shop, shop_zip)
print(f"[OK] vixy_shop.zip actualizado ({os.path.getsize(shop_zip)/(1024*1024):.2f} MB)")

# -------------------------------------------------------------
# 2. ACTUALIZAR vixy_servidor.zip (servidor completo)
# -------------------------------------------------------------
server_zip = os.path.join(base, "vixy_servidor.zip")
tmp_server = server_zip + ".tmp"

server_patches = {
    "shop/index.html": os.path.join(base, "shop", "dist", "index.html"),
    "shop/assets/index-wldueJKP.js": os.path.join(base, "shop", "dist", "assets", "index-wldueJKP.js"),
    "shop/assets/index-oFAWvUQ9.css": os.path.join(base, "shop", "dist", "assets", "index-oFAWvUQ9.css"),
    "shop/backend/php/recargas.php": os.path.join(base, "shop", "backend", "php", "recargas.php"),
    "shop/backend/php/conductores.php": os.path.join(base, "shop", "backend", "php", "conductores.php"),
    "api/recargas.php": os.path.join(base, "api", "recargas.php"),
    "api/conductores.php": os.path.join(base, "api", "conductores.php"),
    "api/auth.php": os.path.join(base, "api", "auth.php"),
    "store/api/recargas.php": os.path.join(base, "api", "recargas.php"),
    "store/api/conductores.php": os.path.join(base, "api", "conductores.php"),
}

with zipfile.ZipFile(server_zip, "r") as zin:
    with zipfile.ZipFile(tmp_server, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
        replaced = set()
        for item in zin.infolist():
            arc = item.filename.replace("\\", "/")
            # Quitar bundles viejos de shop/assets
            if arc.startswith("shop/assets/index-") and (arc.endswith(".js") or arc.endswith(".css")):
                continue
            if arc in server_patches:
                zout.write(server_patches[arc], arc)
                replaced.add(arc)
                print(f"  [SERVER PATCH] {arc}")
            else:
                data = zin.read(item.filename)
                zout.writestr(item, data)

        for arc, src in server_patches.items():
            if arc not in replaced:
                zout.write(src, arc)
                print(f"  [SERVER ADD] {arc}")

os.replace(tmp_server, server_zip)
print(f"[OK] vixy_servidor.zip actualizado ({os.path.getsize(server_zip)/(1024*1024):.2f} MB)")
