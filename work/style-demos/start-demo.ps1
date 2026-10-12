# Starts a style-demo tool with Node 24 (never the PATH Node 18). Default action: serve the packaged demo.
# usage: powershell -File work/style-demos/start-demo.ps1 -Style nighttime [-Action serve|package|verify]
#        [-Repo DIR] [-Out DIR] [-Port N] [-Extra '--build --require-clean']   (-Extra: space-separated flags without paths)
param(
  [Parameter(Mandatory=$true)][ValidateSet('baseline','nighttime','lowpoly')][string]$Style,
  [ValidateSet('serve','package','verify')][string]$Action = 'serve',
  [string]$Repo,
  [string]$Out,
  [int]$Port = -1,
  [string]$Extra = ''
)
$node = if ($env:D6_NODE24) { $env:D6_NODE24 } else { 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
if (-not (Test-Path $node)) { Write-Error "Node 24 nicht gefunden: $node (D6_NODE24 setzen)"; exit 1 }
$script = @{ serve = 'serve-demo.cjs'; package = 'package-demo.cjs'; verify = 'verify-package.cjs' }[$Action]
$arguments = @((Join-Path $PSScriptRoot $script), '--style', $Style)
if ($Repo) { $arguments += @('--repo', $Repo) }
if ($Out) { $arguments += @('--out', $Out) }
if ($Port -ge 0 -and $Action -eq 'serve') { $arguments += @('--port', "$Port") }
if ($Extra.Trim()) { $arguments += ($Extra.Trim() -split '\s+') }
& $node @arguments
exit $LASTEXITCODE
