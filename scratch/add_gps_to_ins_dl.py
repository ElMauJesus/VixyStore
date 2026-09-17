import os

def update_ins_dl_conductores(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    # In conductores.php:
    old_snippet = "'color_moto'                     => $motoColor,"
    new_snippet = """'color_moto'                     => $motoColor,
                'latitud_actual'                 => $latInit,
                'longitud_actual'                => $lngInit,
                'ubicacion_actual'               => $ubicacionGps ?: null,"""
    if old_snippet in code and "'latitud_actual'                 => $latInit" not in code:
        code = code.replace(old_snippet, new_snippet, 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"[UPDATED insDl in {filepath}]")

def update_registro_conductor(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    # Add GPS extraction in registro_conductor.php
    target_pos = "$direccion       = trim($data['direccion'] ?? '');"
    gps_extract = """$direccion       = trim($data['direccion'] ?? '');
$ubicacionGps    = trim($data['ubicacion_gps'] ?? ($data['ubicacion'] ?? ''));
$latInit = null;
$lngInit = null;
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
}"""
    if target_pos in code and "$ubicacionGps" not in code:
        code = code.replace(target_pos, gps_extract, 1)

    # Add to $insDl
    old_ins = "'color_moto'                     => $motoColor,"
    new_ins = """'color_moto'                     => $motoColor,
                'latitud_actual'                 => $latInit,
                'longitud_actual'                => $lngInit,
                'ubicacion_actual'               => $ubicacionGps ?: null,"""
    if old_ins in code and "'latitud_actual'                 => $latInit" not in code:
        code = code.replace(old_ins, new_ins, 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"[UPDATED registro_conductor in {filepath}]")

conductores_files = [
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\shop\backend\php\conductores.php",
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\out\shop\backend\php\conductores.php",
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\api\conductores.php",
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\delivery\backend\php\conductores.php",
]

registro_files = [
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\shop\backend\php\registro_conductor.php",
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\out\shop\backend\php\registro_conductor.php",
]

for cf in conductores_files:
    update_ins_dl_conductores(cf)

for rf in registro_files:
    update_registro_conductor(rf)
