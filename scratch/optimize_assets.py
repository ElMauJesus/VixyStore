import os, io, base64
from PIL import Image

# 1. Optimize favicon.png to 128x128
fav_path = 'panel-admin/favicon.png'
if os.path.exists(fav_path):
    im = Image.open(fav_path)
    im_fav = im.resize((128, 128), Image.Resampling.LANCZOS)
    im_fav.save(fav_path, 'PNG', optimize=True)

    # 2. Optimize vixy-logo.svg
    buf = io.BytesIO()
    im_fav.save(buf, format='PNG', optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 128 128"
     width="128" height="128">
  <title>Vixy Rider Delivery</title>
  <image x="0" y="0" width="128" height="128"
         preserveAspectRatio="xMidYMid meet"
         href="data:image/png;base64,{b64}"/>
</svg>'''

    svg_path = 'panel-admin/assets/branding/vixy-logo.svg'
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)

    print('Favicon size:', os.path.getsize(fav_path))
    print('SVG size:', os.path.getsize(svg_path))

# 3. Remove unused design drafts in panel-admin/assets/branding/
unused_branding = [
    'panel-admin/assets/branding/vixy-business.png',
    'panel-admin/assets/branding/vixy-business.svg',
    'panel-admin/assets/branding/vixy-delivery.svg',
    'panel-admin/assets/branding/vixy-pedidos.png',
    'panel-admin/assets/branding/vixy-pedidos.svg'
]
for p in unused_branding:
    if os.path.exists(p):
        os.remove(p)
        print(f'Removed unused design asset: {p}')

print('Optimization completed.')
