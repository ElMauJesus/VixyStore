import os
import re

def patch_approval_and_pre_registro(filepath):
    if not os.path.exists(filepath):
        return
    print(f"Enhancing {filepath}...")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        code = f.read()

    # 1. In pre_registro, extract GPS coordinates from ubicacion_gps:
    old_target = "$codigoConductor = !empty($data['codigo_conductor'])"
    new_code_fragment = """$ubicacionGps = trim($data['ubicacion_gps'] ?? ($data['ubicacion'] ?? ''));
    $latInit = 10.49100000;
    $lngInit = -66.86200000;
    if (!empty($ubicacionGps)) {
        $uParts = explode(',', $ubicacionGps);
        if (count($uParts) >= 2) {
            $pLat = (float)trim($uParts[0]);
            $pLng = (float)trim($uParts[1]);
            if ($pLat != 0.0 && $pLng != 0.0) {
                $latInit = $pLat;
                $lngInit = $pLng;
            }
        }
    }
    $codigoConductor = !empty($data['codigo_conductor'])"""
    
    if old_target in code and "$latInit = 10.49100000" not in code:
        code = code.replace(old_target, new_code_fragment)
        print("  [OK] Parsed GPS coordinates in pre_registro")

    # Ensure latitud_actual and longitud_actual are in $insDl
    if "'latitud_actual'" not in code and "'ano_moto'" in code:
        code = code.replace(
            "'ano_moto'                       => $motoAno,",
            "'ano_moto'                       => $motoAno,\n                'latitud_actual'                 => $latInit,\n                'longitud_actual'                => $lngInit,\n                'ubicacion_actual'               => 'Caracas',\n                'ubicacion_gps'                  => $ubicacionGps,"
        )
        print("  [OK] Added latitud_actual and longitud_actual to insDl")

    # 2. In aprobar_conductor: ensure coordinates and insertion into vixy_dl if missing
    old_upd_sets = '$updSets = ["disponible = 1", "bloqueado_por_saldo = 0"];'
    new_upd_sets = """$updSets = ["disponible = 1", "bloqueado_por_saldo = 0", "ultima_actualizacion = NOW()"];
            if (in_array('latitud_actual', $dlColumns, true)) {
                $updSets[] = "latitud_actual = IF(latitud_actual IS NULL OR latitud_actual = 0, 10.49100000, latitud_actual)";
            }
            if (in_array('longitud_actual', $dlColumns, true)) {
                $updSets[] = "longitud_actual = IF(longitud_actual IS NULL OR longitud_actual = 0, -66.86200000, longitud_actual)";
            }"""

    if old_upd_sets in code and "latitud_actual = IF" not in code:
        code = code.replace(old_upd_sets, new_upd_sets)
        print("  [OK] Enhanced aprobar_conductor with GPS fallback and NOW()")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)
    print("  Done.")

targets = [
    'out/shop/backend/php/conductores.php',
    'shop/backend/php/conductores.php',
    'out/api/conductores.php',
    'api/conductores.php',
    'delivery/backend/php/conductores.php'
]

for t in targets:
    patch_approval_and_pre_registro(t)

print("All targets processed successfully!")
