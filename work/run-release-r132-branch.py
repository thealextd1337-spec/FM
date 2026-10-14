"""Run the requested merged-branch checks with Node >=20 and local port 4240."""
import datetime
import json
import os
from pathlib import Path
import subprocess
import time
from urllib.request import urlopen

root = Path(__file__).resolve().parents[1]
node = Path('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
out = root / 'outputs/release-r132-final/branch'
out.mkdir(parents=True, exist_ok=True)
env = dict(os.environ, PATH=str(node.parent)+os.pathsep+os.environ['PATH'],
           SECHSER_PORT='4240', D6_TEST_URL='http://127.0.0.1:4240/')
names = ['test-freekick-plan-r132', 'test-restart-facing-v130',
         'test-observed-facing-r132', 'test-penalty-quality-v182',
         'test-corner-quality-v182', 'test-keeper-hold-v182',
         'test-loose-ball-v182', 'test-defensive-pursuit-v182',
         'test-review-fixes-v182', 'check-old-matches-v182',
         'test-whistle-offside-v119', 'test-world-offer-withdraw-reply-r132',
         'check-audit-median-r132', 'check-finance-guide-r132',
         'check-tactics-pointer-r132', 'check-offer-withdraw-reply-browser-r132']
results = []
with (out / 'server.log').open('wb') as server_log:
    server = subprocess.Popen([str(node), 'work/server.cjs'], cwd=root,
                              env=env, stdout=server_log, stderr=subprocess.STDOUT)
    try:
        for attempt in range(50):
            try:
                with urlopen(env['D6_TEST_URL'], timeout=2) as response:
                    assert response.status == 200
                break
            except OSError:
                if server.poll() is not None:
                    raise RuntimeError('Local test server exited')
                time.sleep(.2)
        else:
            raise RuntimeError('Local test server unavailable')
        for index, name in enumerate(names, 1):
            args = [str(node), f'work/{name}.cjs']
            if name == 'check-old-matches-v182':
                args.append('work/tmp-base182')
            print(f'[{index}/{len(names)}] {name}', flush=True)
            started = time.monotonic()
            with (out / f'{index:02d}-{name}.log').open('wb') as log:
                run = subprocess.run(args, cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT)
            results.append(dict(index=index, command='node '+' '.join(args[1:]),
                                exit=run.returncode, seconds=round(time.monotonic()-started, 3),
                                log=f'{index:02d}-{name}.log'))
            (out / 'results.json').write_text(json.dumps(dict(
                root=str(root), base='f2458c1f', node=str(node), port=4240,
                timestamp=datetime.datetime.now().isoformat(), results=results),
                ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
            print(f'  exit={run.returncode}, {results[-1]["seconds"]}s', flush=True)
    finally:
        server.terminate()
        server.wait(timeout=10)
raise SystemExit(any(row['exit'] for row in results))
