import os
import shutil
import re

def check_html_assets(html_path):
    print(f"=== Checking {html_path} ===")
    if not os.path.exists(html_path):
        print("  FILE NOT FOUND!")
        return
    with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # find all href, src
    refs = re.findall(r'(?:href|src)=["\']([^"\']+)["\']', content)
    missing = []
    found = 0
    for r in refs:
        if r.startswith(('http://', 'https://', '//', 'data:', '#', 'mailto:', 'tel:')):
            continue
        clean_r = r.split('?')[0].split('#')[0]
        if clean_r.startswith('/'):
            target = os.path.join('out', clean_r.lstrip('/'))
        else:
            target = os.path.join(os.path.dirname(html_path), clean_r)
        
        target = os.path.normpath(target)
        if not os.path.exists(target):
            missing.append((r, target))
        else:
            found += 1
    
    print(f"  Total local assets checked: {found + len(missing)}")
    print(f"  Found: {found}")
    print(f"  Missing: {len(missing)}")
    for original, target in missing[:15]:
        print(f"    MISSING: {original} -> {target}")

if __name__ == "__main__":
    check_html_assets('out/registro-delivery/index.html')
    check_html_assets('out/registro-comercios/index.html')
    check_html_assets('out/store/index.html')
    check_html_assets('out/shop/index.html')
