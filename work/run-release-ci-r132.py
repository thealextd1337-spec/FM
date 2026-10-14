"""Run every deploy game-test command locally, preserving individual evidence."""
import argparse
import datetime
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

parser = argparse.ArgumentParser()
parser.add_argument("--phase", default="before")
parser.add_argument("--only", nargs="*", type=int)
parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
args = parser.parse_args()
root = args.root.resolve()
node = Path("C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe")
workflow = (root / ".github/workflows/deploy.yml").read_text(encoding="utf-8")
block = workflow.split("- name: Spieltests ausführen", 1)[1].split("run: |", 1)[1].split("\n      - name:", 1)[0]
commands = [line.strip() for line in block.splitlines() if line.strip()]
out = Path(__file__).resolve().parents[1] / "outputs/release-r132-ci" / args.phase
out.mkdir(parents=True, exist_ok=True)
env = dict(os.environ, PATH=str(node.parent) + os.pathsep + os.environ["PATH"])
results = []
for index, command in enumerate(commands, 1):
    if args.only is not None and index not in args.only:
        continue
    parts = command.split()
    local_env = dict(env)
    while re.match(r"^\w+=", parts[0]):
        key, value = parts.pop(0).split("=", 1)
        local_env[key] = value
    if parts[0] == "node":
        parts[0] = str(node)
    elif parts[0] == "python3":
        parts[:1] = [sys.executable]
    print(f"[{index}/{len(commands)}] {command}", flush=True)
    start = time.monotonic()
    log = out / f"{index:03d}.log"
    with log.open("wb") as handle:
        completed = subprocess.run(parts, cwd=root, env=local_env, stdout=handle, stderr=subprocess.STDOUT)
    result = {"index": index, "command": command, "exit": completed.returncode,
              "seconds": round(time.monotonic() - start, 3), "log": log.name}
    results.append(result)
    (out / "results.json").write_text(json.dumps({"root": str(root), "node": str(node),
        "python": sys.executable, "timestamp": datetime.datetime.now().isoformat(),
        "results": results}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  exit={completed.returncode}, {result['seconds']}s", flush=True)
print(f"Finished: {len(results)} commands, {sum(r['exit'] != 0 for r in results)} failures", flush=True)
sys.exit(any(r["exit"] != 0 for r in results))
