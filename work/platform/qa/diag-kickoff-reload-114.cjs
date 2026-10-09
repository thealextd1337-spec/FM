'use strict';
// Why a kickoff does not roll after reload: v115KickoffReady components,
// reload vs. in-place pause/resume (control). Same seed and steps up to the pause.
// usage: node diag-kickoff-reload-114.cjs [reload|control] [config=large6|legacy]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const mode=process.argv[2]||'reload',cfg=process.argv[3]||'large6';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const p=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],report={mode,cfg,trace:[]};p.on('pageerror',e=>errors.push(e.message));
 const diag=()=>p.evaluate(()=>{const m=match,r=m?.kickoff;if(!r)return{kickoff:null,elapsed:m?.elapsed,phase:v65Context()?.state.phase};const targets=v114RestartMoves.get(r),W=v160PitchWidth()/(v55Field.right-v55Field.left),L=v160PitchLength()/(v55Field.bottom-v55Field.top);
  const wrong=m.people.filter(q=>q.t===0?q.y<.5-.00001:q.y>.5+.00001).map(q=>({pid:q.pid.split(':').at(-1),t:q.t,y:+q.y.toFixed(4),keeper:q.keeper}));
  const far=targets?[...targets].map(([q,t])=>({pid:q.pid.split(':').at(-1),d:+Math.hypot((q.x-t.x)*W,(q.y-t.y)*L).toFixed(3)})).filter(x=>x.d>.12):'NO TARGETS';
  return{phase:v65Context()?.state.phase,elapsed:+m.elapsed.toFixed(3),kickoffPhase:r.phase,countdown:+(m.countdown||0).toFixed(3),postBanner:m.postBanner,kickerCentre:+Math.hypot((r.kicker.x-.5)*W,(r.kicker.y-.5)*L).toFixed(3),wrongHalf:wrong,farFromTarget:far,targetCount:targets?targets.size:0,ready:v115KickoffReady(m),overlay:$('#match-overlay').hidden?null:$('#overlay-title').textContent};});
 try{
  await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');
  await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
  await p.evaluate(c=>D6QA160.setup({config:c,unity:false,replays:true}),cfg==='legacy'?null:{fieldSize:'large',fieldPlayers:6});
  const id=await p.evaluate(async()=>{await v61StoreNewCareer(D6QA160.career);await v61WaitForStorage();return v61CurrentCareer.id});
  await p.evaluate(async()=>{const c=v65Context(),tick=()=>{step(.05*MATCH_SPEED,.05);v65AfterStep(c)};for(let i=0;i<300;i++)tick();while(match.flight||match.slide||match.kickoff||match.setPiece||match.throwIn||match.postBanner||match.goalPause>0)tick();kickoff(1);tick();v65PauseTargetTab='lineup';v65Pause();clearInterval(v65WorldFrame);await v61WaitForStorage();});
  report.atPause=await diag();
  report.savedContinuation=await p.evaluate(()=>{const n=v65Context().state.physicalSnapshot.match.nativeContinuation;return n?{keys:Object.keys(n),restart:n.restart?.length??null}:null});
  if(mode==='reload'){await p.reload();await p.evaluate(()=>v61WaitForStorage()).catch(()=>{});await p.locator('[data-v61-open="'+id+'"]').first().click();}
  report.afterOpen=await diag();
  await p.evaluate(()=>v65Resume());
  for(let i=0;i<14;i++){await wait(1500);report.trace.push(await diag());}
 }finally{report.errors=errors;fs.writeFileSync(`outputs/release-114/diag-kickoff-${mode}-${cfg}.json`,JSON.stringify(report,null,1)+'\n');console.log(JSON.stringify({atPause:report.atPause,saved:report.savedContinuation,afterOpen:report.afterOpen}));for(const t of report.trace)console.log(JSON.stringify(t));console.log('errors',errors);await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
