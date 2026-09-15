"""
Optimiza todos los favicon.png del proyecto a max 512x512 con compresión PNG eficiente.
"""
import os
from PIL import Image

base = r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore"

# Buscar todos los favicon.png dentro de carpetas de deploy y out/
favicon_targets = []
for root, dirs, files in os.walk(base):
    # Excluir node_modules y .git
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'scratch']]
    for f in files:
        if f == 'favicon.png':
            favicon_targets.append(os.path.join(root, f))

print(f"Encontrados {len(favicon_targets)} favicon.png\n")

for path in favicon_targets:
    size_before = os.path.getsize(path) / 1024
    try:
        img = Image.open(path)
        w, h = img.size
        # Solo optimizar si es más grande de lo necesario o pesa mucho
        if w > 512 or h > 512:
            img = img.resize((512, 512), Image.LANCZOS)
        # Guardar con compresión máxima
        img.save(path, 'PNG', optimize=True, compress_level=9)
        size_after = os.path.getsize(path) / 1024
        print(f"  [OK] {os.path.relpath(path, base)}")
        print(f"    {size_before:.0f} KB -> {size_after:.0f} KB  ({w}x{h}px)")
    except Exception as e:
        print(f"  [ERROR] {path}: {e}")

print("\nOptimización completada.")
