#!/usr/bin/env bash
# Serial Unity batch call (own project only, no sync: sources already synced and verified).
#   run-unity.sh <log name> <D6Cli method> [extra args...]
set -u
here="F:/Neuer Ordner (2)/ChatGPT/Fussballmanager/work/demo-low-poly-fix"
project="G:/unity/Doppel6-LowPoly-Demo"
unity="/c/Program Files/Unity/Hub/Editor/6000.6.4f1/Editor/Unity.exe"
log="$here/outputs/style-demos/lowpoly-fix/validation-r6/logs/$1.log"; method="$2"; shift 2
if [ -e "$project/Temp/UnityLockfile" ]; then echo "lock present"; exit 3; fi
start=$(date +%s)
"$unity" -batchmode -nographics -projectPath "$project" -executeMethod "D6Cli.$method" -d6repo "$here" "$@" -logFile "$log"
code=$?
echo "exit=$code seconds=$(( $(date +%s) - start )) log=$log"
grep -n "\[D6Cli\]\|error CS\|Shader error\|Exception:" "$log" | head -40
if grep -qE "Shader error|error CS" "$log"; then echo "compile or shader errors in log"; [ $code -eq 0 ] && code=4; fi
exit $code
