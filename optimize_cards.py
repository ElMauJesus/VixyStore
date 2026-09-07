"""
Optimiza las vixycard*.png:
 - Las toma de public/vixycard*.png (ignorando la raíz)
 - Las guarda como WebP en public/cards/ (más ligeras, misma calidad visual)
 - También genera versión .png optimizada como fallback
"""
from PIL import Image
import os, shutil

SRC_DIR = "public"
DST_DIR = os.path.join("public", "cards")
os.makedirs(DST_DIR, exist_ok=True)

cards = [f for f in os.listdir(SRC_DIR) if f.startswith("vixycard") and f.endswith(".png")]

print("=" * 52)
print("  OPTIMIZADOR DE VIXY CARDS")
print("=" * 52)

for fname in sorted(cards):
    src = os.path.join(SRC_DIR, fname)
    name_noext = os.path.splitext(fname)[0]

    img = Image.open(src).convert("RGBA")
    w, h = img.size

    # Redimensionar si es muy grande (max 600px de ancho, manteniendo proporción)
    if w > 600:
        ratio = 600 / w
        img = img.resize((600, int(h * ratio)), Image.LANCZOS)
        w, h = img.size

    # Guardar como WebP (mucho más ligero, soporte universal en navegadores modernos)
    webp_path = os.path.join(DST_DIR, name_noext + ".webp")
    img.save(webp_path, "WEBP", quality=82, method=6)

    # Guardar como PNG optimizado (fallback para navegadores muy viejos)
    png_path = os.path.join(DST_DIR, fname)
    img.save(png_path, "PNG", optimize=True)

    orig_kb = os.path.getsize(src) // 1024
    webp_kb = os.path.getsize(webp_path) // 1024
    png_kb  = os.path.getsize(png_path) // 1024

    print(f"[OK] {fname} ({w}x{h}px)")
    print(f"     Original PNG : {orig_kb} KB")
    print(f"     WebP         : {webp_kb} KB  ({int((1 - webp_kb/orig_kb)*100)}% más liviana)")
    print(f"     PNG optim    : {png_kb} KB")
    print()

print("Imagenes guardadas en public/cards/")
print("=" * 52)
