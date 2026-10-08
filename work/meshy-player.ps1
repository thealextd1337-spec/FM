param([switch]$Submit,[int]$MaxCredits=30)
$ErrorActionPreference='Stop'
$taskRoot=Split-Path $PSScriptRoot -Parent
$taskPlan=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'meshy-player-plan.json') -Raw | ConvertFrom-Json
function Invoke-MeshyJson([string[]]$ArgsList){
 $taskText=& (Join-Path $PSScriptRoot 'meshy.ps1') -CommandArgs $ArgsList
 if($LASTEXITCODE -ne 0){throw ($taskText -join "`n")}
 $taskResult=($taskText -join "`n") | ConvertFrom-Json
 if(-not $taskResult.ok){throw 'Meshy command was not successful.'}
 return $taskResult.result
}
$taskFlags=@('--output-schema','v1','--format','json','--no-update-check')
$taskEstimate=Invoke-MeshyJson (@('make',$taskPlan.prompt,'--dry-run')+$taskFlags)
if(-not $Submit){$taskEstimate | ConvertTo-Json -Depth 8;exit 0}
if($MaxCredits -lt $taskEstimate.estimated_credits){throw 'Credit budget is below the current estimate.'}
$taskBalance=Invoke-MeshyJson (@('balance')+$taskFlags)
if($taskBalance.balance -lt $taskEstimate.estimated_credits){throw 'Meshy-Guthaben reicht für den Plan nicht aus.'}
$taskWorkspace=Join-Path $taskRoot $taskPlan.workspace
New-Item -ItemType Directory -Force -Path $taskWorkspace | Out-Null
$taskJobPath=Join-Path $taskWorkspace 'footballer-job.json'
if(Test-Path -LiteralPath $taskJobPath){throw 'Eine Jobdatei existiert bereits. Vorhandene Task-IDs fortsetzen; nicht erneut generieren.'}
$taskOperation=[guid]::NewGuid().ToString()
$taskJob=@{operationId=$taskOperation;prompt=$taskPlan.prompt;maxCredits=$MaxCredits;status='submitting'}
$taskJob | ConvertTo-Json | Set-Content -LiteralPath $taskJobPath -Encoding UTF8
$taskSubmitted=Invoke-MeshyJson (@('text-to-3d','create','--mode','preview','--prompt',$taskPlan.prompt,'--pose-mode','a-pose','--target-formats','glb','--async','--operation-id',$taskOperation,'--workspace',$taskWorkspace)+$taskFlags)
$taskId=$taskSubmitted.submission.task_id
$taskJob.previewTask=$taskId;$taskJob.status='preview';$taskJob | ConvertTo-Json | Set-Content -LiteralPath $taskJobPath -Encoding UTF8
if(-not $taskId){throw 'Submission outcome is unknown; do not submit again. Inspect the CLI operation journal.'}
$taskInit=Invoke-MeshyJson (@('project','init','--root',$taskWorkspace,'--name',$taskPlan.name,'--task-id',$taskId,'--task-type','text-to-3d','--workspace',$taskWorkspace)+$taskFlags)
$taskProject=$taskInit.project_dir
$taskJob.project=$taskProject;$taskJob | ConvertTo-Json | Set-Content -LiteralPath $taskJobPath -Encoding UTF8
Write-Host "Preview task $taskId is running; model generation takes minutes."
$taskPreview=Invoke-MeshyJson (@('text-to-3d','wait',$taskId,'--timeout','600','--project',$taskProject,'--stage','preview','--workspace',$taskWorkspace)+$taskFlags)
$taskRefined=Invoke-MeshyJson (@('text-to-3d','create','--mode','refine','--preview-task-id',$taskId,'--enable-pbr','false','--texture-resolution','2k','--target-formats','glb','--async','--operation-id',($taskOperation+'-refine'),'--project',$taskProject,'--stage','refine','--workspace',$taskWorkspace)+$taskFlags)
$taskRefineId=$taskRefined.submission.task_id
$taskJob.refineTask=$taskRefineId;$taskJob.status='refine';$taskJob | ConvertTo-Json | Set-Content -LiteralPath $taskJobPath -Encoding UTF8
if(-not $taskRefineId){throw 'Refine outcome is unknown; do not submit again.'}
Write-Host "Texture task $taskRefineId is running."
$taskTextured=Invoke-MeshyJson (@('text-to-3d','wait',$taskRefineId,'--timeout','600','--project',$taskProject,'--stage','refine','--workspace',$taskWorkspace)+$taskFlags)
$taskDownloaded=Invoke-MeshyJson (@('download','--resource','text-to-3d','--task-id',$taskRefineId,'--model-format','glb','--output',(Join-Path $taskProject 'footballer.glb'),'--project',$taskProject,'--stage','refine','--workspace',$taskWorkspace)+$taskFlags)
$taskJob.status='downloaded';$taskJob.model=Join-Path $taskProject 'footballer.glb';$taskJob | ConvertTo-Json | Set-Content -LiteralPath $taskJobPath -Encoding UTF8
@{project=$taskProject;previewTask=$taskId;refineTask=$taskRefineId;model=$taskJob.model} | ConvertTo-Json
