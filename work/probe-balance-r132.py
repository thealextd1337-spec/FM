"""Temporary differential probes; the production sources stay unchanged."""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
audit = subprocess.check_output(["git", "show", "864fe441:work/audit-world-balance-v68.cjs"], cwd=root, encoding="utf-8")
mode = sys.argv[1]
if mode == "legacy-shootout":
    needle = "const call=(name,...args)=>"
    audit = audit.replace(needle, "vm.runInContext('v182SimulateShootout=v119SimulateShootout',context);\n" + needle, 1)
elif mode == "legacy-transfers":
    needle = "for(const file of ['world-economy-v66.js','world-transfer-list-v72.js','world-youth-manager-v67.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);"
    replacement = "for(const file of ['world-economy-v66.js','world-transfer-list-v72.js','world-youth-manager-v67.js'])vm.runInContext(file==='world-youth-manager-v67.js'?fs.readFileSync(`dist/${file}`,'utf8'):require('node:child_process').execFileSync('git',['show',`57f7e939:dist/${file}`],{encoding:'utf8'}),context);"
    assert needle in audit
    audit = audit.replace(needle, replacement, 1)
elif mode == "correct-median":
    needle = "medianOf=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)]"
    replacement = "medianOf=values=>{const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2}"
    assert needle in audit
    audit = audit.replace(needle, replacement, 1)
    needle = "if(seedCount>=6&&seasons>=10)assert"
    diagnostic = "console.log('MEDIAN_DIAGNOSTIC',JSON.stringify(Object.fromEntries([...metrics.seasonRatios].map(([season,values])=>{const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);return [season,{count:sorted.length,lower:sorted[middle-1],upper:sorted[middle],median:medianOf(values)}]}))));\n"
    audit = audit.replace(needle, diagnostic + needle, 1)
else:
    raise ValueError(mode)
temp = root / f"work/probe-balance-{mode}.cjs"
out = root / "outputs/release-r132-ci/probes"
out.mkdir(parents=True, exist_ok=True)
temp.write_text(audit, encoding="utf-8")
try:
    with (out / f"{mode}.log").open("wb") as log:
        result = subprocess.run(["C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe", str(temp)], cwd=root, stdout=log, stderr=subprocess.STDOUT)
    print(f"{mode}: exit={result.returncode}", flush=True)
finally:
    temp.unlink()
sys.exit(result.returncode)
