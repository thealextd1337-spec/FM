param(
 [Parameter(Mandatory=$true)][string]$Resource,
 [Parameter(Mandatory=$true)][string]$Stage,
 [string]$Project,
 [string[]]$StageArgs
)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path $PSScriptRoot -Parent
$taskWorkspace=Join-Path $taskRoot 'meshy_output'
$taskMarker=Join-Path $taskWorkspace ('soccer-b-'+$Stage+'.json')
if(Test-Path -LiteralPath $taskMarker){throw 'Stage already has a marker. Resume its task or inspect its operation; do not resubmit.'}
$taskOperation=[guid]::NewGuid().ToString()
$taskRecord=@{resource=$Resource;stage=$Stage;operationId=$taskOperation;status='submitting';project=$Project}
$taskRecord | ConvertTo-Json | Set-Content -LiteralPath $taskMarker -Encoding UTF8
$taskFlags=@('--output-schema','v1','--format','json','--no-update-check')
$taskArgs=@($Resource,'create')+$StageArgs+@('--async','--operation-id',$taskOperation,'--workspace',$taskWorkspace)
if($Project){$taskArgs+=@('--project',$Project,'--stage',$Stage)}
$taskText=& (Join-Path $PSScriptRoot 'meshy.ps1') -CommandArgs ($taskArgs+$taskFlags)
$taskExit=$LASTEXITCODE
try{$taskResponse=($taskText -join "`n") | ConvertFrom-Json}catch{throw 'Unknown submission. Preserve marker and inspect the CLI journal; do not resubmit.'}
$taskId=$taskResponse.result.submission.task_id
if(-not $taskResponse.ok -or -not $taskId){throw 'Unknown submission. Preserve marker; inspect journal before further action.'}
$taskRecord.taskId=$taskId;$taskRecord.status='accepted'
$taskRecord.cliExit=$taskExit
$taskRecord | ConvertTo-Json | Set-Content -LiteralPath $taskMarker -Encoding UTF8
@{resource=$Resource;taskId=$taskId;marker=$taskMarker} | ConvertTo-Json
