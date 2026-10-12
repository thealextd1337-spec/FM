#!/usr/bin/env bash
# Serial Unity batch call for the Nighttime demo project only.
#   work/platform/qa/nighttime-unity.sh <log name> <D6Cli method> [extra D6Cli args...]
# Refuses to run while the project is open elsewhere (Temp/UnityLockfile) and
# never targets the original project. Syncs sources with the explicit path first.
set -u
here="$(cd "$(dirname "$0")/../../.." && pwd -W 2>/dev/null || pwd)"
project="G:/unity/Doppel6-Nighttime-Demo"
unity="/c/Program Files/Unity/Hub/Editor/6000.6.4f1/Editor/Unity.exe"
node="C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
log="$here/outputs/style-demos/nighttime/logs/$1.log"; method="$2"; shift 2
mkdir -p "$(dirname "$log")"
if [ -e "$project/Temp/UnityLockfile" ] && ! rm -f "$project/Temp/UnityLockfile" 2>/dev/null; then echo "Unity project is open (lock held): $project"; exit 3; fi
# D6_BASELINE_REF=<commit>: unchanged renderer of that commit with the current evidence tooling.
if [ -n "${D6_BASELINE_REF:-}" ]; then "$node" "$here/work/platform/qa/nighttime-baseline-sources.cjs" "$D6_BASELINE_REF" "$project" || exit 2
else "$node" "$here/prototypes/match-engine-unity/sync-unity.cjs" "$project" || exit 2; fi
start=$(date +%s)
"$unity" -batchmode -projectPath "$project" -executeMethod "D6Cli.$method" -d6repo "$here" "$@" -logFile "$log"
code=$?
echo "exit=$code seconds=$(( $(date +%s) - start )) log=$log"
grep -n "\[D6Cli\]\|error CS\|Shader error\|Exception:" "$log" | head -20
if grep -qE "Shader error|error CS" "$log"; then echo "compile or shader errors in log"; [ $code -eq 0 ] && code=4; fi
exit $code
