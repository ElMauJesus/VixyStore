import os
import re

print("=== HTML ASSET REFERENCES ===")
for root, dirs, files in os.walk('out'):
    for f in files:
        if f.endswith('.html'):
            fp = os.path.join(root, f)
            try:
                txt = open(fp, 'r', encoding='utf-8', errors='ignore').read()
                js = re.findall(r'src=["\']([^"\']+\.js)["\']', txt)
                css = re.findall(r'href=["\']([^"\']+\.css)["\']', txt)
                if any('/assets/' in s or 'assets/' in s for s in js + css):
                    print(f"\n{fp}:")
                    print("  JS :", js)
                    print("  CSS:", css)
            except Exception as e:
                pass

print("\n=== TOP 25 LARGEST FILES IN OUT/ ===")
all_files = []
for root, dirs, files in os.walk('out'):
    for f in files:
        fp = os.path.join(root, f)
        try:
            sz = os.path.getsize(fp)
            all_files.append((sz, fp))
        except:
            pass

all_files.sort(reverse=True)
for sz, fp in all_files[:25]:
    print(f"{sz / (1024*1024):6.2f} MB  {fp}")
