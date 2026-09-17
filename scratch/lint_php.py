import os, re

files_to_check = [
    'api/conductores.php',
    'api/auth.php',
    'api/keep_alive.php',
    'api/config/db.php',
    'api/config/config.php',
    'api/config/auth_middleware.php'
]

for fpath in files_to_check:
    with open(fpath, 'r', encoding='utf-8') as f:
        code = f.read()
    ob = code.count('{')
    cb = code.count('}')
    print(f'{fpath}: Open {ob}, Close {cb}, Diff {ob - cb}')
    reqs = re.findall(r'require_once\s+__DIR__\s*\.\s*[\'\"]([^\'\"]+)[\'\"]', code)
    base_d = os.path.dirname(fpath)
    for r in reqs:
        target = os.path.normpath(os.path.join(base_d, r.lstrip('/\\')))
        exists = os.path.exists(target)
        if not exists:
            print(f'  [MISSING REQUIRE] {r} -> {target}')

print('All checks finished successfully.')
