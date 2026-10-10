from pathlib import Path
import json, os, re, subprocess, time, sys

root = Path(__file__).resolve().parents[1]
out = root / 'outputs/release-122'
out.mkdir(exist_ok=True)
node = 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
python = 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
commands = []
for line in (root / '.github/workflows/deploy.yml').read_text().splitlines():
    command = line.strip()
    if re.match(r'(?:(?:[A-Z_]+=[^ ]+) )*(?:node|python3) work/(?:.*/)?(?:test|audit|build)', command):
        commands.append(command)
results = json.loads((out/'local-checks.json').read_text())['results'] if '--remaining' in sys.argv else []
failures=[r for r in results if r['exitCode']!=0]
if failures:(out/'initial-failures.json').write_text(json.dumps(failures,indent=2))
results=[r for r in results if r['exitCode']==0]
for i, command in enumerate(commands,1):
    if any(r['command']==command and r['exitCode']==0 for r in results):continue
    parts = command.split()
    env = os.environ.copy()
    while '=' in parts[0]:
        key,value=parts.pop(0).split('=',1)
        env[key]=value
    parts[0] = node if parts[0]=='node' else python
    started=time.time()
    completed=subprocess.run(parts,cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    (out / ('check-%03d.log'%i)).write_bytes(completed.stdout)
    results.append({'command':command,'exitCode':completed.returncode,'seconds':round(time.time()-started,2)})
    (out/'local-checks.json').write_text(json.dumps({'pass':all(r['exitCode']==0 for r in results),'completed':len(results),'total':len(commands),'results':results},indent=2))
    print('%d/%d %s %s'%(i,len(commands),'PASS' if completed.returncode==0 else 'FAIL',command),flush=True)
    if completed.returncode:
        print(completed.stdout.decode('utf-8',errors='replace')[-4500:],flush=True)
        raise SystemExit(completed.returncode)
(out/'local-checks.json').write_text(json.dumps({'pass':len(results)==len(commands) and all(r['exitCode']==0 for r in results),'completed':len(results),'total':len(commands),'results':results},indent=2))
