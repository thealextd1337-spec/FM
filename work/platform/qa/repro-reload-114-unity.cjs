'use strict';
// Real-loop reload repro: native setInterval loop (not QA stepping) to a target
// minute with Unity, real page reload (visibilitychange/pagehide included), open
// the stored career, observe, press the visible resume control.
// usage: node repro-reload-114-unity.cjs [minute=18] [url=/source/index.html?engine=unity] [mode=live|pausedFirst]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const minute=Number(process.argv[2]||18),url='http://127.0.0.1:4521'+(process.argv[3]||'/source/index.html?engine=unity'),mode=process.argv[4]||'live';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await browser.newContext({viewport:{width:1280,height:800}}),p=await ctx.newPage(),errors=[],consoleErr=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErr.push(m.text().slice(0,300))});
 const report={minute,url,mode};
 const state=()=>p.evaluate(()=>{const c=v65Context();return{phase:c?.state.phase,minute:c?.state.minute,elapsed:match?.elapsed,running,frame:!!v65WorldFrame,active:!!v65WorldActive,gameHidden:document.querySelector('#game-screen')?.hidden,overlay:document.querySelector('#match-overlay')?.hidden?null:document.querySelector('#overlay-title')?.textContent+' | '+document.querySelector('#overlay-copy')?.textContent,event:document.querySelector('#event')?.textContent,v65error:document.querySelector('#v65-error')?.textContent??'(missing)',kick:match?.kickoff?{phase:match.kickoff.phase,kicker:!!match.kickoff.kicker}:null,countdown:match?.countdown,postBanner:match?.postBanner||null,goalPause:match?.goalPause,setPiece:match?.setPiece?{type:match.setPiece.type,phase:match.setPiece.phase,taker:!!match.setPiece.taker}:null,owner:match?.owner?.pid||null,flight:!!match?.flight,unity:window.D6UnityMatch&&{ready:D6UnityMatch.ready,active:D6UnityMatch.active,error:D6UnityMatch.lastError,loads:D6UnityMatch.loads},view:typeof v98View!=='undefined'?v98View:null,v58:v58State?.(),tickErrors:window.__tickErrors||[]}});
 try{
  await p.goto(url);
  await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
  report.setup=await p.evaluate(()=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true,replays:true}));
  report.id=await p.evaluate(async()=>{await v61StoreNewCareer(D6QA160.career);await v61WaitForStorage();return v61CurrentCareer.id});
  // real native loop
  await p.evaluate(()=>{v65StartLoop()});
  await p.waitForFunction(m=>v65Context()?.state.minute>=m,minute,{timeout:180000,polling:100});
  if(mode==='pausedFirst'){await p.evaluate(()=>{v65PauseTargetTab='lineup';v65Pause()});await p.waitForTimeout(1500);}
  report.before=await state();
  report.storedBefore=await p.evaluate(()=>{const s=v61StorageConfirmed?.find(c=>c.id===v61CurrentCareer.id)?.world.activeMatch?.state;return s&&{phase:s.phase,minute:s.minute,snapElapsed:s.physicalSnapshot?.match.elapsed}});
  await p.reload();
  await p.evaluate(()=>v61WaitForStorage()).catch(()=>{});
  report.storedAfterReload=await p.evaluate(id=>{const s=v61ReadCareers().find(c=>c.id===id)?.world.activeMatch?.state;const m=s?.physicalSnapshot?.match;return s&&{phase:s.phase,minute:s.minute,snapElapsed:m?.elapsed,kickoff:m?.kickoff?.phase??null,postBanner:m?.postBanner??null,setPiece:m?.setPiece?.type??null,goalPause:m?.goalPause,countdown:m?.countdown}},report.id);
  await p.evaluate(()=>{window.__tickErrors=[];const base=step;step=function(...a){try{return base.apply(this,a)}catch(e){__tickErrors.push(String(e.stack).split('\n').slice(0,5).join(' | '));throw e}}});
  const open=p.locator('[data-v61-open="'+report.id+'"]');
  if(await open.count())await open.first().click();else report.openMissing=true;
  report.afterOpen=await state();
  await p.waitForTimeout(3000);report.after3s=await state();
  await p.screenshot({path:'outputs/release-114/unity-reload-'+mode+'-'+minute+'-after3s.png'});
  // press visible resume control like a user
  const quick=p.locator('#v65-quick-nav [data-v65-quick]');
  if(report.after3s.phase==='paused'){
   if(await quick.count()&&await quick.first().isVisible()){await quick.first().click();report.resumeVia='quick-nav'}
   else{await p.evaluate(()=>v58Button.click());report.resumeVia='v58'}
   await p.waitForTimeout(3000);report.afterResume=await state();
  }
  await p.waitForTimeout(25000);report.later=await state();
  await p.screenshot({path:'outputs/release-114/unity-reload-'+mode+'-'+minute+'-later.png'});
 }finally{report.errors=errors;report.consoleErrors=consoleErr.slice(0,20);fs.mkdirSync('outputs/release-114',{recursive:true});fs.writeFileSync('outputs/release-114/unity-reload-repro-'+mode+'-'+minute+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,1));await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
