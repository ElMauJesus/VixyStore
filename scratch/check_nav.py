import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

with open('panel-admin/assets/index-DETfJraS.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Buscar elementos del menú lateral, tabs o rutas de navegación
print("--- Posibles elementos del Menú de Navegación / Sidebar / Pestañas ---")
sidebar_matches = re.findall(r'label:\s*["\']([^"\']+)["\']|title:\s*["\']([^"\']+)["\']|name:\s*["\']([^"\']+)["\']', text)
for m in sidebar_matches:
    val = [v for v in m if v]
    if val:
        v = val[0]
        if any(k in v.lower() for k in ['motor', 'conduct', 'deliver', 'flota', 'repart', 'solicitud', 'carnet', 'comerc', 'pedido', 'panel', 'inicio', 'dashboard', 'billetera']):
            print(" •", v)

# Buscar rutas o tabs tipo tab === '...'
print("\n--- Tabs o Vistas condicionales (tipo activeTab / view / activeSection) ---")
tabs = set(re.findall(r'tab\s*===?\s*["\']([^"\']+)["\']|activeTab\s*===?\s*["\']([^"\']+)["\']|view\s*===?\s*["\']([^"\']+)["\']|section\s*===?\s*["\']([^"\']+)["\']', text))
for t in tabs:
    val = [v for v in t if v]
    if val:
        print(" • Vista:", val[0])
