'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline'),expanded=process.argv.includes('--expanded'),holdHalf=process.argv.includes('--hold-half'),out=path.resolve('outputs/platform/world-render',(baseline?'baseline':'fixed')+(expanded?'-expanded':'')+(holdHalf?'-deferred':''));fs.mkdirSync(out,{recursive:true});
const report={baseline,checks:[],errors:[],sourceId:JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json','utf8')).sourceId};
function check(name,value){if(!baseline)assert(value,name);report.checks.push({name,passed:Boolean(value)});console.log(name+': '+value);}
async function prepare(page,url){
 await page.goto(url+'?engine=unity');await page.waitForFunction(()=>window.userMeshyMatchReady&&window.D6UnityMatch,{},{timeout:45000});
 await page.evaluate(async()=>{const c=v61CreateCareer('GER-2','render-iteration'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);const f=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);});
 await page.waitForFunction(()=>D6UnityMatch.ready,{},{timeout:120000});
}
(async()=>{
 const server=require('../../ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}});page.on('pageerror',e=>report.errors.push(e.message));
  if(holdHalf)await page.addInitScript(()=>{window.D6Held=[];window.addEventListener('message',e=>{if(window.D6Hold&&e.data?.channel==='d6-world-view-1'&&e.data.kind==='ack'){D6Held.push(e);e.stopImmediatePropagation();}},true);});
  await prepare(page,`http://127.0.0.1:${server.address().port}/source/index.html`);
  await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);for(let i=0;i<240;i++){step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context());}hideOverlay();draw();});await page.waitForTimeout(200);
  await page.screenshot({path:path.join(out,'live.png')});
  if(expanded){await page.evaluate(()=>v133ToggleEnlarge());await page.waitForTimeout(150);}
  report.picture=await page.evaluate(()=>D6UnityMatch.picture);
  async function labelsMatch(){return page.evaluate(()=>{const projection=D6UnityMatch.projection,host=document.querySelector('#d6-unity-host').getBoundingClientRect();return projection?.markers.every(p=>{const button=document.querySelector(`#d6-unity-labels [data-player="${p.id}"]`);if(!button||button.hidden===p.visible)return false;const rect=button.getBoundingClientRect();return !p.visible||Math.abs((rect.left+rect.width/2-host.left)/host.width-p.x)<.004&&Math.abs((rect.bottom-host.top)/host.height-p.y)<.004;});});}
  if(!baseline){
   await page.waitForFunction(()=>D6UnityMatch.projection?.markers?.length===match.people.length);await page.waitForTimeout(150);check('labels originate from the actual rendered Unity frame',await labelsMatch());
   check('all player names remain visible in compact labels',await page.evaluate(()=>match.people.every(p=>{const label=document.querySelector(`#d6-unity-labels [data-player="${p.pid}"]`),name=label?.querySelector('span');return name?.textContent.trim()===p.name.split(' ').at(-1)&&getComputedStyle(name).display!=='none'&&parseFloat(getComputedStyle(label).fontSize)<=10;})));
   await page.screenshot({path:path.join(out,'labels.png')});
   await page.setViewportSize({width:1100,height:850});await page.waitForTimeout(350);check('Unity labels stay attached after viewport resizing',await labelsMatch());await page.setViewportSize({width:1440,height:950});await page.waitForTimeout(350);
   await page.evaluate(()=>{if(!v65Pause())v65StartLoop();draw();});await page.waitForFunction(()=>v65Context().state.phase==='paused');await page.evaluate(()=>clearInterval(v65WorldFrame));
   report.frozen=await page.evaluate(()=>({clock:match.elapsed,ball:JSON.stringify(match.ball),score:JSON.stringify(match.score)}));await page.waitForTimeout(350);const a=await page.evaluate(()=>D6UnityMatch.projection);await page.waitForTimeout(400);const b=await page.evaluate(()=>D6UnityMatch.projection);report.pausedProjection={a,b};
   check('paused Unity poses and labels freeze with the authoritative match',JSON.stringify(a.markers)===JSON.stringify(b.markers)&&await page.evaluate(saved=>saved.clock===match.elapsed&&saved.ball===JSON.stringify(match.ball)&&saved.score===JSON.stringify(match.score),report.frozen));
   await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);});
  }
  // Native first half, actual pause/controller/UI, then enough time to expose
  // the old transport watchdog while its iframe is hidden by the tactical view.
  if(holdHalf){await page.evaluate(()=>{window.D6Hold=true;draw();});await page.waitForTimeout(120);}
  report.halftime=await page.evaluate(()=>{v103CanReplay=()=>false;let ticks=0;while(!match.halftimeBreakDone&&ticks++<10000){step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context());}clearInterval(v65WorldFrame);draw();return {ticks,phase:v65Context().state.phase,pauseView:v65PauseView,clock:match.elapsed};});
  await page.waitForTimeout(11000);report.duringHalf=await page.evaluate(()=>({view:v98View,error:D6UnityMatch.lastError,failure:D6UnityMatch.lastFailure,ready:D6UnityMatch.ready,ack:D6UnityMatch.lastAck,picture:D6UnityMatch.picture}));
  check('long native halftime keeps Unity available',report.duringHalf.view==='3d'&&!report.duringHalf.error);
  if(holdHalf)await page.evaluate(()=>{window.D6Hold=false;for(const e of D6Held)window.dispatchEvent(new MessageEvent('message',{data:e.data,origin:e.origin,source:e.source}));window.D6Held=[];});
  await page.locator('#career-progress-action').click();await page.evaluate(()=>clearInterval(v65WorldFrame));
  for(let i=0;i<50;i++){await page.evaluate(()=>{step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context());draw();});await page.waitForTimeout(20);}
  report.afterHalf=await page.evaluate(()=>({view:v98View,error:D6UnityMatch.lastError,failure:D6UnityMatch.lastFailure,ready:D6UnityMatch.ready,half:match.halftime,halfPause:match.halftimePause,clock:match.elapsed}));
  check('second half remains in Unity with its real lineup',report.afterHalf.view==='3d'&&report.afterHalf.ready&&!report.afterHalf.error&&report.afterHalf.halfPause===0);
  if(!baseline){await page.waitForTimeout(250);check('second-half labels follow the turned Unity camera',await labelsMatch());
   const before=await page.evaluate(()=>match.elapsed);await page.evaluate(()=>v65StartLoop());let attached=true;for(let i=0;i<20;i++){await page.waitForTimeout(200);attached=attached&&await labelsMatch();}await page.evaluate(()=>clearInterval(v65WorldFrame));
   check('names stay attached throughout real-time second-half movement',attached&&await page.evaluate(clock=>match.elapsed>clock,before));
  }
  await page.screenshot({path:path.join(out,'second-half.png')});
  if(!baseline&&holdHalf){
   await page.evaluate(()=>{window.D6Hold=true;draw();});await page.waitForTimeout(120);await page.evaluate(()=>{v98View='2d';draw();});await page.waitForTimeout(11000);await page.evaluate(()=>{v98View='3d';draw();window.D6Hold=false;for(const e of D6Held)window.dispatchEvent(new MessageEvent('message',{data:e.data,origin:e.origin,source:e.source}));window.D6Held=[];});await page.waitForTimeout(200);
   check('a long intentional 2D view can return to the same Unity session',await page.evaluate(()=>v98View==='3d'&&D6UnityMatch.ready&&!D6UnityMatch.lastError));
   const saved=await page.evaluate(()=>{window.D6Hold=true;return JSON.stringify({clock:match.elapsed,score:match.score,events:v65Context().state.events,ball:match.ball});});await page.waitForTimeout(11000);
   report.visibleFailure=await page.evaluate(before=>({view:v98View,error:D6UnityMatch.lastError,failure:D6UnityMatch.lastFailure,unchanged:before===JSON.stringify({clock:match.elapsed,score:match.score,events:v65Context().state.events,ball:match.ball}),saved:JSON.parse(before),after:{clock:match.elapsed,score:match.score,events:v65Context().state.events,ball:match.ball}}),saved);
   check('a genuinely visible unresponsive renderer still falls back without changing the match',report.visibleFailure.view==='2d'&&Boolean(report.visibleFailure.error)&&report.visibleFailure.unchanged);
  }
  check('no uncaught page errors',report.errors.length===0);
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
})().catch(error=>{console.error(error);process.exitCode=1;});
