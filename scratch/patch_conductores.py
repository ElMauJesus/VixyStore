import os
import re

def update_conductores_file(filepath):
    if not os.path.exists(filepath):
        return
    print(f"Updating {filepath}...")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. Update normalizarConductor
    old_norm_pattern = r"function normalizarConductor\(\$c,\s*\$origen\s*=\s*'delivery'\)\s*\{.*?(?=\$isApproved\s*=)"
    
    # Let's inspect how normalizarConductor is written
    # We want to replace the status resolution and the coordinates / stale logic:
    
    # Replace lines in pre_registro where approved was hardcoded:
    content = re.sub(
        r"('disponible'\s*=>\s*)1,\s*\n(\s*'en_carrera'\s*=>\s*0,.*?'status'\s*=>\s*)'aprobado',\s*\n(\s*'estado_registro'\s*=>\s*)'aprobado',\s*\n(\s*'verificado_por_admin'\s*=>\s*)1,",
        r"\g<1>0,\n\g<2>'pendiente',\n\g<3>'pendiente_aprobacion',\n\g<4>0,",
        content,
        flags=re.DOTALL
    )

    # Replace update on duplicate in pre_registro
    content = re.sub(
        r"UPDATE conductores SET password_hash = :phash, status = 'aprobado', estado_registro = 'aprobado', verificado_por_admin = 1, disponible = 1 WHERE id = :id",
        r"UPDATE conductores SET password_hash = :phash, status = 'pendiente', estado_registro = 'pendiente_aprobacion', verificado_por_admin = 0, disponible = 0 WHERE id = :id",
        content
    )
    content = re.sub(
        r"UPDATE conductores SET password_hash = :phash, status = 'aprobado', verificado_por_admin = 1 WHERE id = :id",
        r"UPDATE conductores SET password_hash = :phash, status = 'pendiente', verificado_por_admin = 0 WHERE id = :id",
        content
    )

    # In normalizarConductor, make sure stale timeout is 43200 (12h) instead of 60 seconds
    content = re.sub(r'(\$segInactivo\s*>\s*)60(\s*&&)', r'\g<1>43200\g<2>', content)
    content = re.sub(r'(\(time\(\)\s*-\s*\$timestamp\)\s*>\s*)60(\s*&&)', r'\g<1>43200\g<2>', content)

    # In normalizarConductor, fix status resolution order
    old_status_logic = """    // Determinar estado de aprobación de forma robusta
    if ($storedStatus === 'rechazado' || $estadoReg === 'rechazado') {
        $status = 'rechazado';
    } elseif ($storedStatus === 'suspendido' || $estadoReg === 'suspendido') {
        $status = 'suspendido';
    } elseif ($storedStatus === 'inactivo' || $estadoReg === 'inactivo') {
        $status = 'inactivo';
    } elseif ($storedStatus === 'aprobado' || $estadoReg === 'aprobado' || $verifAdmin === 1) {
        $status = 'aprobado';
    } elseif ($estadoReg === 'pendiente_aprobacion' || $estadoReg === 'pendiente' || $storedStatus === 'pendiente') {
        $status = 'pendiente';
    } else {
        // En delivery, conductores existentes sin marca de rechazo se consideran aprobados
        $status = ($origen === 'delivery') ? 'aprobado' : 'pendiente';
    }"""

    new_status_logic = """    // Determinar estado de aprobación de forma robusta
    if ($storedStatus === 'rechazado' || $estadoReg === 'rechazado') {
        $status = 'rechazado';
    } elseif ($storedStatus === 'suspendido' || $estadoReg === 'suspendido') {
        $status = 'suspendido';
    } elseif ($storedStatus === 'inactivo' || $estadoReg === 'inactivo') {
        $status = 'inactivo';
    } elseif ($storedStatus === 'pendiente' || $estadoReg === 'pendiente' || $estadoReg === 'pendiente_aprobacion' || $verifAdmin === 0) {
        $status = 'pendiente';
    } elseif (($storedStatus === 'aprobado' || $estadoReg === 'aprobado') || $verifAdmin === 1) {
        $status = 'aprobado';
    } else {
        $status = 'pendiente';
    }"""

    if old_status_logic in content:
        content = content.replace(old_status_logic, new_status_logic)
        print("  [OK] Status logic replaced")

    # In normalizarConductor, make sure coordinates fallback is present so approved drivers have coordinates
    old_gps_logic = """    // Telemetría GPS en tiempo real
    $latVal = isset($c['latitud_actual']) ? (float)$c['latitud_actual'] : (isset($c['lat']) ? (float)$c['lat'] : 0.0);
    $lngVal = isset($c['longitud_actual']) ? (float)$c['longitud_actual'] : (isset($c['lng']) ? (float)$c['lng'] : 0.0);
    $hasRealGps = ($latVal != 0.0 && $lngVal != 0.0);"""

    new_gps_logic = """    // Telemetría GPS en tiempo real
    $latVal = isset($c['latitud_actual']) ? (float)$c['latitud_actual'] : (isset($c['lat']) ? (float)$c['lat'] : 0.0);
    $lngVal = isset($c['longitud_actual']) ? (float)$c['longitud_actual'] : (isset($c['lng']) ? (float)$c['lng'] : 0.0);

    // Si no tiene lat/lng pero tiene ubicacion_gps string (formato lat,lng)
    if (($latVal == 0.0 || $lngVal == 0.0) && !empty($c['ubicacion_gps'])) {
        $ubiParts = explode(',', (string)$c['ubicacion_gps']);
        if (count($ubiParts) >= 2) {
            $pLat = (float)trim($ubiParts[0]);
            $pLng = (float)trim($ubiParts[1]);
            if ($pLat != 0.0 && $pLng != 0.0) {
                $latVal = $pLat;
                $lngVal = $pLng;
            }
        }
    }
    // Si sigue en 0 y está aprobado, ubicar en centro de operaciones Caracas para visualización en radar
    if (($latVal == 0.0 || $lngVal == 0.0) && $isApproved) {
        $latVal = 10.49100000;
        $lngVal = -66.86200000;
    }

    $hasRealGps = ($latVal != 0.0 && $lngVal != 0.0);"""

    if old_gps_logic in content:
        content = content.replace(old_gps_logic, new_gps_logic)
        print("  [OK] GPS fallback logic replaced")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("  Done.")

def update_registro_conductor_file(filepath):
    if not os.path.exists(filepath):
        return
    print(f"Updating {filepath}...")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    content = content.replace("estado_registro = 'aprobado',\n            verificado_por_admin = 1", "estado_registro = 'pendiente_aprobacion',\n            verificado_por_admin = 0")
    content = content.replace("status = 'aprobado',\n                    estado_registro = 'aprobado',\n                    verificado_por_admin = 1,\n                    disponible = 1", "status = 'pendiente',\n                    estado_registro = 'pendiente_aprobacion',\n                    verificado_por_admin = 0,\n                    disponible = 0")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("  Done.")

files_conductores = [
    'out/shop/backend/php/conductores.php',
    'shop/backend/php/conductores.php',
    'out/api/conductores.php',
    'api/conductores.php',
    'delivery/backend/php/conductores.php'
]

files_registro = [
    'out/shop/backend/php/registro_conductor.php',
    'shop/backend/php/registro_conductor.php',
    'out/api/registro_conductor.php',
    'api/registro_conductor.php',
    'delivery/backend/php/registro_conductor.php',
    'out/store/api/registro_conductor.php'
]

for fp in files_conductores:
    update_conductores_file(fp)

for fp in files_registro:
    update_registro_conductor_file(fp)

print("\nAll files successfully updated!")
