import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

with open('panel-admin/assets/index-DETfJraS.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Buscar bloques de código cercanos a "Conductores (Carnet Vixy)" o "Padrón Motorizados"
pos = text.find("Conductores (Carnet Vixy)")
if pos != -1:
    print("--- Fragmento alrededor de Conductores (Carnet Vixy) ---")
    print(text[max(0, pos-400):pos+600])

pos2 = text.find("Padrón Motorizados")
if pos2 != -1:
    print("\n--- Fragmento alrededor de Padrón Motorizados ---")
    print(text[max(0, pos2-300):pos2+600])
