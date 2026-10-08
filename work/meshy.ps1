param([Parameter(ValueFromRemainingArguments=$true)][string[]]$CommandArgs)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path $PSScriptRoot -Parent
$taskNode=$env:D6_NODE
if(-not $taskNode){$taskNode=(Get-Command node -ErrorAction SilentlyContinue).Source}
if(-not $taskNode -or [version]((& $taskNode --version).TrimStart('v')) -lt [version]'22.12.0'){
 $taskBundled=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
 if(Test-Path -LiteralPath $taskBundled){$taskNode=$taskBundled}else{throw 'Meshy benötigt Node.js 22.12 oder neuer. D6_NODE kann den Pfad vorgeben.'}
}
if([version]((& $taskNode --version).TrimStart('v')) -lt [version]'22.12.0'){throw 'Node.js 22.12 oder neuer benötigt.'}
$taskNpmCommand=Get-Command npm.cmd -ErrorAction Stop
$taskNpmCli=Join-Path (Split-Path $taskNpmCommand.Source -Parent) 'node_modules/npm/bin/npm-cli.js'
if(-not(Test-Path -LiteralPath $taskNpmCli)){throw 'npm CLI wurde nicht gefunden.'}
$taskOldPath=$env:PATH;$taskOldCache=$env:npm_config_cache
try{
 $env:PATH=(Split-Path $taskNode -Parent)+';'+$env:PATH
 $env:npm_config_cache=Join-Path $taskRoot 'outputs/npm-cache-node24'
 & $taskNode $taskNpmCli exec --yes --package=meshy-cli@0.4.0 -- meshy @CommandArgs
 $taskExit=$LASTEXITCODE
}finally{$env:PATH=$taskOldPath;$env:npm_config_cache=$taskOldCache}
exit $taskExit
