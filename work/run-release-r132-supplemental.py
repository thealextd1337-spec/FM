"""Build and verify the final local package; do not deploy or access the live site."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

root = Path(__file__).resolve().parents[1]
node = Path('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
env = dict(os.environ, PATH=str(node.parent)+os.pathsep+os.environ['PATH'])
out = root / 'outputs/release-r132-final/supplemental'
out.mkdir(parents=True, exist_ok=True)
commands = ['node work/build.cjs', 'node work/ui-redesign/shared/verify-build.cjs',
            'node work/test-club-crests.cjs', 'node work/test-expansion-crests.cjs',
            'node work/test-completed-crests.cjs', 'node work/test-expansion-sponsors.cjs',
            'node work/test-no-player-images.cjs', 'py -3 work/test_deploy_unity_assets.py',
            'py -3 work/check-release-r132-publication.py', 'node work/test-release-version.cjs']
results = []
for index, command in enumerate(commands, 1):
    parts = command.split()
    if parts[0] == 'node':
        parts[0] = str(node)
    else:
        parts[:2] = [sys.executable]
    print(f'[{index}/{len(commands)}] {command}', flush=True)
    start = time.monotonic()
    with (out / f'{index:02d}.log').open('wb') as log:
        run = subprocess.run(parts, cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT)
    results.append(dict(index=index, command=command, exit=run.returncode,
                        seconds=round(time.monotonic()-start, 3), log=f'{index:02d}.log'))
    (out / 'results.json').write_text(json.dumps(dict(
        root=str(root), node=str(node), python=sys.executable,
        timestamp=datetime.datetime.now().isoformat(), results=results),
        ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(f'  exit={run.returncode}, {results[-1]["seconds"]}s', flush=True)

builds = ['outputs/index.html', 'outputs/Doppel-6-Fussballmanager.html']
assert (root / builds[0]).read_bytes() == (root / builds[1]).read_bytes()
versions = {
    'dist/index.html': 'Doppel 6 / PROTOTYP 132',
    'work/build.cjs': 'runtime.html?v=132',
    'dist/unity-match/runtime.js': "productVersion:'132'",
    'work/generate-3d-documentation.cjs': 'const docs={version:132}',
    'dist/world-3d-documentation-data-v134.js': '"version":132'}
for name, binding in versions.items():
    assert binding in (root / name).read_text(encoding='utf-8'), name
for name in builds:
    html = (root / name).read_text(encoding='utf-8')
    assert 'Doppel 6 / PROTOTYP 132' in html and 'runtime.html?v=132' in html
names = subprocess.check_output(['git', 'ls-files', 'dist', 'work/*.cjs',
    'work/deploy_unity_assets.py', 'work/test_deploy_unity_assets.py',
    '.github/workflows/deploy.yml'], cwd=root).decode('utf-8').splitlines()
hashes = {name: hashlib.sha256((root / name).read_bytes()).hexdigest()
          for name in names+builds if (root / name).is_file()}
(out.parent / 'package-verification.json').write_text(json.dumps(dict(
    status='passed', base='3085ab55', versions=versions, buildsIdentical=True,
    sha256=hashes), ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
raise SystemExit(any(row['exit'] for row in results))
