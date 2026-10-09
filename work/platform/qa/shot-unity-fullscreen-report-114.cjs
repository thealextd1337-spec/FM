'use strict';
// Release 114: real Unity fullscreen through the final whistle in a fresh QA
// career (isolated browser profile, never a user career). Plays the unchanged
// D6QAScenario helper to 88', opens fullscreen with a real click on #v99-expand,
// plays to the final whistle, then measures main-thread responsiveness and
// records what is shown (fullscreen state, dialogs, report) with screenshots.
// Bounded: every page call has a timeout, the match runs in limited chunks with
// progress lines, and the whole check has a deadline (D6_DEADLINE_MS, 20 min).
// usage: node shot-unity-fullscreen-report-114.cjs [base] [config=large-6] [gpu=0|1] [tag]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const base=process.argv[2]||'http://127.0.0.1:4521/native-build.html',[fieldSize,players]=(process.argv[3]||'large-6').split('-'),gpu=process.argv[4]==='1';
const deadline=Date.now()+(Number(process.env.D6_DEADLINE_MS)||1200000),out='outputs/release-114/unity-fullscreen-report'+(process.argv[5]?'-'+process.argv[5]:''),helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');fs.mkdirSync(out,{recursive:true});
const config={fieldSize,fieldPlayers:Number(players)},log=[],note=(k,v)=>{log.push({k,v,at:Date.now()});console.log(k,JSON.stringify(v))};
const bounded=(promise,ms,what)=>{let timer;return Promise.race([promise,new Promise((_,j)=>{timer=setTimeout(()=>j(Error(what+' timed out after '+ms+' ms')),Math.min(ms,Math.max(1,deadline-Date.now())))})]).finally(()=>clearTimeout(timer))};
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:!gpu,args:gpu?['--enable-webgl','--ignore-gpu-blocklist']:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],consoleErrors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text().slice(0,300))});
 let ok=false;
 try{
  await p.goto(base+'?engine=unity');await p.evaluate(helper);
  note('storage',await p.evaluate(()=>Object.keys(localStorage)));
  note('setup',await p.evaluate(async c=>{const r=await D6QA160.setup({config:c,unity:true,replays:true});return {unityReady:r.unityReady,people:r.people,ack:r.ack}},config));
  // Chunked play: each call is limited in ticks and wall time; progress is logged.
  const chunk=(args)=>bounded(p.evaluate(async a=>{const r=await D6QA160.run(a);return {minute:r.minute,phase:r.phase,score:r.score,finished:r.finished,ticks:r.ticks,unityError:r.unityError,held:D6UnityMatch.clockHeld}},args),120000,'run '+JSON.stringify(args));
  let last;for(let m=8;m<=88;m+=8){last=await chunk({minute:Math.min(m,88),sampleEvery:6,limit:4000});console.log('progress',JSON.stringify(last));if(last.unityError)throw Error('Unity error '+last.unityError)}
  while(last.minute<88){last=await chunk({minute:88,sampleEvery:6,limit:4000});console.log('progress',JSON.stringify(last))}
  note('at88',last);
  await p.evaluate(()=>{v132RevealControls();document.querySelector('#v99-expand').parentElement.scrollIntoView({block:'center'});v132RevealControls()});
  await p.click('#v99-expand');await p.waitForTimeout(800);
  note('fullscreen',await p.evaluate(()=>({layout:document.body.classList.contains('v132-fullscreen'),element:document.fullscreenElement?.id||null,unityReady:D6UnityMatch.ready})));
  await p.screenshot({path:out+'/at88-fullscreen.png'});
  const t0=Date.now();
  await p.evaluate(()=>{window.QALong=[];new PerformanceObserver(l=>{for(const e of l.getEntries())QALong.push(Math.round(e.duration))}).observe({type:'longtask',buffered:false})});
  for(let i=0;i<40&&!last.finished;i++){last=await chunk({finished:true,sampleEvery:3,limit:300});console.log('progress',JSON.stringify(last));if(last.unityError)break}
  note('end',last);if(!last.finished)throw Error('final whistle not reached within chunk limit');
  note('endMs',Date.now()-t0);
  // Responsiveness after the whistle: a trivial evaluate must return quickly, repeatedly.
  const pings=[];for(let i=0;i<6;i++){const s=Date.now();await Promise.race([p.evaluate(()=>1),new Promise((_,j)=>setTimeout(()=>j(Error('ping timeout')),15000))]);pings.push(Date.now()-s);await p.waitForTimeout(500)}
  note('pingsMs',pings);
  note('rafPer2s',await bounded(p.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;performance.now()-t0<2000?requestAnimationFrame(f):r(n)};requestAnimationFrame(f)})),15000,'raf'));
  note('viewport',await p.evaluate(()=>({w:innerWidth,h:innerHeight,canvas:(()=>{const c=document.querySelector('#d6-unity-frame,iframe[src*=unity],#v98-canvas');const b=c?.getBoundingClientRect();return c&&{id:c.id,tag:c.tagName,w:Math.round(b.width),h:Math.round(b.height)}})()})));
  const view=()=>p.evaluate(()=>{const vis=e=>e&&(e.open||e.offsetParent!==null||getComputedStyle(e).position==='fixed'&&getComputedStyle(e).display!=='none');return {layout:document.body.classList.contains('v132-fullscreen'),element:document.fullscreenElement?.id||null,phase:v65Context()?.state.phase??null,finished:Boolean(match?.finished),score:D6QA160.state?.score,unity:{ready:D6UnityMatch.ready,lastError:D6UnityMatch.lastError,clockHeld:D6UnityMatch.clockHeld,lastFailure:D6UnityMatch.lastFailure},tv:document.querySelector('#v132-tv')?.innerText.replace(/\s+/g,' ').slice(0,200)??null,dialogs:[...document.querySelectorAll('dialog,[role=dialog],[aria-modal=true]')].filter(vis).map(d=>({id:d.id,cls:String(d.className).slice(0,80),text:d.innerText.replace(/\s+/g,' ').slice(0,500)})),report:Boolean(D6QA160.state?.postMatchReport),title:document.title}});
  note('afterWhistle',await bounded(view(),15000,'view'));await p.screenshot({path:out+'/after-whistle.png'});
  await p.waitForTimeout(6000);note('after6s',await bounded(view(),15000,'view'));note('longTasksMs',await p.evaluate(()=>QALong));await p.screenshot({path:out+'/after-whistle-6s.png'});
  const longs=log.find(x=>x.k==='longTasksMs')?.v||[];ok=!errors.length&&pings.every(x=>x<1000)&&!longs.some(x=>x>5000);
 }catch(e){note('error',String(e.stack||e).slice(0,800));try{await bounded(p.screenshot({path:out+'/error.png',timeout:10000}),12000,'screenshot')}catch{}}
 finally{
  fs.writeFileSync(out+'/result.json',JSON.stringify({base,config,gpu,ok,pageErrors:errors,consoleErrors:consoleErrors.slice(0,30),log},null,2)+'\n');
  await bounded(browser.close(),30000,'close').catch(()=>{});console.log(ok?'DONE ok':'DONE with problems');process.exitCode=ok?0:1;
 }
})();
