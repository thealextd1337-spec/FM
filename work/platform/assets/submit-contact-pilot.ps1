param([ValidateSet('pass','receive')][string]$Clip)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$taskWorkspace=Join-Path $taskRoot 'meshy_output/contact-pilot-2026-10-08'
New-Item -ItemType Directory -Path $taskWorkspace -Force | Out-Null
$taskMarker=Join-Path $taskWorkspace ($Clip+'-request.json')
$taskResult=Join-Path $taskWorkspace ($Clip+'-submission.json')
if(Test-Path -LiteralPath $taskResult){throw 'Submission already saved; resume the owning task instead.'}
$taskPrompt=if($Clip -eq 'pass'){'Soccer player performs one short right-foot inside-foot pass. Left foot planted, small backswing, right foot contacts an imaginary ground ball in front, natural follow-through, returns to ready stance. Full body, in place, no root travel, no celebration.'}else{'Soccer player controls an incoming imaginary ground ball with the inside of the right foot. Balanced stance, soft touch in front of the body, short follow-through, returns to ready stance. Full body, in place, no root travel, no kick or celebration.'}
$taskOperation='d6-contact-pilot-2026-10-08-'+$Clip
if(-not(Test-Path -LiteralPath $taskMarker)){
 @{clip=$Clip;prompt=$taskPrompt;mode='prime';duration=2;operationId=$taskOperation;estimatedCredits=10;priceSource='https://docs.meshy.ai/en/api/pricing';priceRead='2026-10-08';budgetTotal=20} | ConvertTo-Json | Set-Content -LiteralPath $taskMarker -Encoding UTF8
}
& (Join-Path $taskRoot 'work/meshy.ps1') text-to-motion create --prompt $taskPrompt --mode prime --duration 2 --async --operation-id $taskOperation --save-json $taskResult --workspace $taskWorkspace --output-schema v1 --format json --no-update-check
exit $LASTEXITCODE
