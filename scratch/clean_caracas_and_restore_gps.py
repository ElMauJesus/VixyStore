import os
import re

def clean_conductores_file(filepath):
    if not os.path.exists(filepath):
        print(f"[SKIP] {filepath} does not exist")
        return
    print(f"[PROCESSING] {filepath}...")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        code = f.read()

    # 1. Remove Caracas fallback in normalizarConductor
    caracas_block = re.compile(
        r"// Si sigue en 0 y está aprobado, ubicar en centro de operaciones Caracas.*?"
        r"if\s*\(\(\$latVal\s*==\s*0\.0\s*\|\|\s*\$lngVal\s*==\s*0\.0\)\s*&&\s*\$isApproved\)\s*\{.*?"
        r"\$latVal\s*=\s*10\.49100000;.*?"
        r"\$lngVal\s*=\s*-66\.86200000;.*?"
        r"\}",
        re.DOTALL
    )
    code = caracas_block.sub("// Coordenadas reales exclusivamente (sin valores de prueba / demo)", code)

    # Also clean any inline $latVal = 10.49100000
    inline_caracas = re.compile(
        r"if\s*\(\(\$latVal\s*==\s*0\.0\s*\|\|\s*\$lngVal\s*==\s*0\.0\)\s*&&\s*\$isApproved\)\s*\{[^}]*\}",
        re.DOTALL
    )
    code = inline_caracas.sub("", code)

    # 2. Restore 60 seconds timeout in normalizarConductor (revert 43200)
    code = code.replace("if ($segInactivo > 43200 && empty($c['en_carrera']))", "if ($segInactivo > 60 && empty($c['en_carrera']))")
    code = code.replace("if ($timestamp && (time() - $timestamp) > 43200 && empty($c['en_carrera']))", "if ($timestamp && (time() - $timestamp) > 60 && empty($c['en_carrera']))")

    # 3. Clean Caracas from aprobar_conductor
    upd_caracas = re.compile(
        r"if\s*\(in_array\('latitud_actual',\s*\$dlColumns,\s*true\)\)\s*\{\s*\$updSets\[\]\s*=\s*\"latitud_actual\s*=\s*IF\(latitud_actual\s*IS\s*NULL\s*OR\s*latitud_actual\s*=\s*0,\s*10\.49100000,\s*latitud_actual\)\";\s*\}\s*"
        r"if\s*\(in_array\('longitud_actual',\s*\$dlColumns,\s*true\)\)\s*\{\s*\$updSets\[\]\s*=\s*\"longitud_actual\s*=\s*IF\(longitud_actual\s*IS\s*NULL\s*OR\s*longitud_actual\s*=\s*0,\s*-66\.86200000,\s*longitud_actual\)\";\s*\}",
        re.DOTALL
    )
    code = upd_caracas.sub("// Coordenadas GPS se mantienen intactas hasta que la app las actualice", code)

    # 4. Clean Caracas from pre_registro $latInit / $lngInit
    code = code.replace("$latInit = 10.49100000;", "$latInit = null;")
    code = code.replace("$lngInit = -66.86200000;", "$lngInit = null;")
    code = code.replace("'ubicacion_actual'               => 'Caracas',", "'ubicacion_actual'               => $ubicacionGps ?: null,")

    # 5. Make sure if $existingDl is null in aprobar_conductor, it copies from $pdoRegist
    copy_dl_block = """    if ($existingDl) {
        // Actualizar aprobación en c2861522_vixy_dl
        try {
            $updSets = ["disponible = 1", "bloqueado_por_saldo = 0", "ultima_actualizacion = NOW()"];
            $updVals = ['id' => $existingDl['id']];

            if (in_array('estado_registro', $dlColumns, true))      $updSets[] = "estado_registro = 'aprobado'";
            if (in_array('verificado_por_admin', $dlColumns, true)) $updSets[] = "verificado_por_admin = 1";
            if (in_array('status', $dlColumns, true))               $updSets[] = "status = 'aprobado'";
            if (in_array('fecha_aprobacion', $dlColumns, true))     $updSets[] = "fecha_aprobacion = NOW()";

            $sqlUpd = "UPDATE conductores SET " . implode(', ', $updSets) . " WHERE id = :id";
            $pdo->prepare($sqlUpd)->execute($updVals);
        } catch (Exception $e) {
            error_log('Error actualizando aprobación en vixy_dl: ' . $e->getMessage());
        }
    } else if ($pdoRegist) {
        // Si no estaba aún en vixy_dl pero está en regist, crearlo en vixy_dl ya aprobado
        try {
            $stRFind = $pdoRegist->prepare("SELECT * FROM conductores WHERE codigo_conductor = :id OR cedula = :id2 OR id = :id3 LIMIT 1");
            $stRFind->execute(['id' => $driverId, 'id2' => $driverId, 'id3' => $driverId]);
            $rRow = $stRFind->fetch();
            if ($rRow) {
                $code = !empty($rRow['codigo_conductor']) ? $rRow['codigo_conductor'] : ('DRV-' . $rRow['id']);
                $insDl = [
                    'id'                   => $code,
                    'codigo_conductor'     => $code,
                    'nombre'               => $rRow['nombre'] ?? '',
                    'apellido'             => $rRow['apellido'] ?? '',
                    'cedula'               => $rRow['cedula'] ?? '',
                    'telefono'             => $rRow['telefono'] ?? '',
                    'email'                => $rRow['email'] ?? '',
                    'foto_url'             => $rRow['foto_url'] ?? ($rRow['foto_perfil_url'] ?? null),
                    'placa_moto'           => strtoupper($rRow['moto_placa'] ?? ''),
                    'marca_moto'           => $rRow['moto_marca'] ?? '',
                    'modelo_moto'          => $rRow['moto_modelo'] ?? '',
                    'ano_moto'             => $rRow['moto_ano'] ?? '',
                    'color_moto'           => $rRow['moto_color'] ?? '',
                    'licencia_grado'       => $rRow['licencia_grado'] ?? '2da',
                    'licencia_conducir'    => $rRow['licencia_conducir'] ?? '2da',
                    'disponible'           => 1,
                    'en_carrera'           => 0,
                    'saldo_billetera_usd'  => 0.00,
                    'limite_saldo_negativo'=> -0.50,
                    'bloqueado_por_saldo'  => 0,
                    'status'               => 'aprobado',
                    'estado_registro'      => 'aprobado',
                    'verificado_por_admin' => 1,
                    'ultima_actualizacion' => date('Y-m-d H:i:s')
                ];
                $insDl = array_intersect_key($insDl, array_flip($dlColumns));
                $colNamesDl = array_keys($insDl);
                $pdo->prepare("INSERT INTO conductores (`" . implode('`, `', $colNamesDl) . "`) VALUES (:" . implode(', :', $colNamesDl) . ")")->execute($insDl);
            }
        } catch (Throwable $eSyncDl) {
            error_log('Error copiando conductor aprobado a vixy_dl: ' . $eSyncDl->getMessage());
        }
    }"""

    # Check if we can safely replace the if ($existingDl) block
    existing_pattern = re.compile(
        r"if\s*\(\$existingDl\)\s*\{\s*// Actualizar aprobación en c2861522_vixy_dl.*?error_log\('Error actualizando aprobación en vixy_dl: ' \. \$e->getMessage\(\)\);\s*\}\s*\}",
        re.DOTALL
    )
    if existing_pattern.search(code):
        code = existing_pattern.sub(copy_dl_block, code)
        print("  [OK] Enhanced approval sync between regist and vixy_dl")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)
    print("  [DONE]")

files_to_clean = [
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\shop\backend\php\conductores.php",
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\out\shop\backend\php\conductores.php",
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\api\conductores.php",
    r"c:\Users\Jull Home\Documents\Jesus_D\GitHub\Repositories\VixyStore\delivery\backend\php\conductores.php",
]

for f in files_to_clean:
    clean_conductores_file(f)
