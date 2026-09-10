import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

with open('panel-admin/assets/index-DETfJraS.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

matches = re.findall(r'["\']([^"\']{4,80})["\']', text)
vistas = [m for m in matches if any(w in m.lower() for w in ['conductor', 'solicitud', 'aprobar', 'rechazar', 'expediente', 'repartidor', 'flota', 'licencia', 'carnet', 'vehículo', 'moto', 'rider'])]

print("SECCIONES Y ELEMENTOS DEL MÓDULO DE CONDUCTORES/DELIVERYS EN EL PANEL:")
seen = set()
for v in vistas:
    v_clean = v.strip()
    if v_clean not in seen and not v_clean.startswith('http') and not v_clean.startswith('data:'):
        seen.add(v_clean)
        print("  •", v_clean)
