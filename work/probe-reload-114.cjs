'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const report={};
 try{
  await p.goto('http://127.0.0.1:4521/source/index.html?engine=unity');
  await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
  report.setup=await p.evaluate(()=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true,replays:true}));
  report.id=await p.evaluate(async()=>{await v61StoreNewCareer(D6QA160.career);await D6QA160.run({minute:18,sampleEvery:30});while(match.flight||match.slide){step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context())}v65Snapshot(v65Context());await v61WaitForStorage();return v61CurrentCareer.id});
  const state=()=>({phase:v65Context()?.state.phase,elapsed:match?.elapsed,minute:v65Context()?.state.minute,running,active:!!v65WorldActive,flight:!!match?.flight,error:document.querySelector('#v65-error')?.textContent,storage:v61StorageError,unity:window.D6UnityMatch&&{ready:D6UnityMatch.ready,error:D6UnityMatch.lastError,ack:D6UnityMatch.lastAck?.players},snapshot:v61CurrentCareer?.world.activeMatch?.state.physicalSnapshot?.match.elapsed});
  report.before=await p.evaluate(state);console.log('before',report.before);
  await p.reload();await p.evaluate(()=>{window.stepErrors=[];const base=step;step=function(...args){try{return base(...args)}catch(e){stepErrors.push(e.stack);throw e}}});await p.evaluate(()=>v61WaitForStorage());
  await p.locator('[data-v61-open="'+report.id+'"]').click();
  report.after=await p.evaluate(state);console.log('after',report.after);
  await p.waitForTimeout(2500);report.later=await p.evaluate(state);console.log('later',report.later);
  if(report.later.phase==='paused'){await p.evaluate(()=>v65Resume());await p.waitForTimeout(2000);report.resume=await p.evaluate(state);console.log('resume',report.resume);}
  await p.waitForTimeout(12000);report.final=await p.evaluate(state);report.errors=errors;report.stepErrors=await p.evaluate(()=>stepErrors);report.continued=await p.evaluate(async()=>{clearInterval(v65WorldFrame);let ticks=0;while(!match.finished&&ticks++<6000){if(v65Context().state.phase==='paused')v65Resume();clearInterval(v65WorldFrame);step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context());if(ticks%40===0){draw();await new Promise(r=>requestAnimationFrame(r))}}return {ticks,finished:match.finished,phase:v65Context().state.phase,elapsed:match.elapsed,score:match.score}});
  fs.mkdirSync('outputs/release-114',{recursive:true});fs.writeFileSync('outputs/release-114/reload-probe.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.final));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
