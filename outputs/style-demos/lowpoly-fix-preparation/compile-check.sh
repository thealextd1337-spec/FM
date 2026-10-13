#!/usr/bin/env bash
# Static C# compile check of prototypes/match-engine-unity with Unity's bundled
# Roslyn against the Unity 6000.6.4f1 reference assemblies and the URP/Core
# script assemblies of the Low-Poly project (read only). No Unity Editor, no
# project write. Editor assembly: every source, UNITY_EDITOR. Player assembly:
# runtime sources only (sync-unity.cjs rule), UNITY_WEBGL.
#   compile-check.sh <source folder> <output folder>
set -u
src="$1"; out="$2"; mkdir -p "$out"
U="/c/Program Files/Unity/Hub/Editor/6000.6.4f1/Editor/Data"
LIB="G:/unity/Doppel6-LowPoly-Demo/Library/ScriptAssemblies"
dotnet="$U/DotNetSdk/dotnet.exe"; csc="$U/DotNetSdk/sdk/8.0.318/Roslyn/bincore/csc.dll"
w(){ cygpath -w "$1"; }
refs=(); for f in "$U"/Managed/UnityEngine/*.dll; do refs+=("-r:$(w "$f")"); done
refs+=("-r:$(w "$U/NetStandard/ref/2.1.0/netstandard.dll")")
for n in Unity.RenderPipelines.Universal.Runtime Unity.RenderPipelines.Core.Runtime; do refs+=("-r:$(w "$LIB/$n.dll")"); done
all=(); runtime=()
for f in "$src"/*.cs; do b=$(basename "$f"); all+=("$(w "$f")"); [[ "$b" =~ (Tests|Setup|Cli|WebBuild|Diagnostics)\.cs$ ]] || runtime+=("$(w "$f")"); done
common=(-nologo -noconfig -nostdlib -target:library -langversion:9.0 -nowarn:CS0649,CS0169,CS0414,CS0162,CS0219,CS0168,CS8321 -warnaserror- "${refs[@]}")
"$dotnet" "$csc" "${common[@]}" -define:UNITY_EDITOR -out:"$(w "$out/editor.dll")" "${all[@]}" > "$out/editor.log" 2>&1; e=$?
"$dotnet" "$csc" "${common[@]}" -define:UNITY_WEBGL -out:"$(w "$out/player.dll")" "${runtime[@]}" > "$out/player.log" 2>&1; p=$?
echo "editor exit=$e errors=$(grep -c ' error ' "$out/editor.log") files=${#all[@]}; player exit=$p errors=$(grep -c ' error ' "$out/player.log") files=${#runtime[@]}"
