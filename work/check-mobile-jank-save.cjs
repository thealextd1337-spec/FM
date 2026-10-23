'use strict';
// B01 (fix/mobile-jank): the live autosave runs at most every 15 s. Checks in an isolated Edge context on the real build
// with a stored QA career that (1) the live loop saves on that cadence, (2) hiding the page saves at once and the match
// continues after returning and after a reload from exactly that state, (3) a crash without pagehide loses at most the
// last save window, (4) Unity: hiding pauses with a snapshot and the reload resumes it.
//   node work/check-mobile-jank-save.cjs [--root <tree>] [--port 4251]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const arg=(n,f)=>{const i=process.argv.indexOf('--'+n);return i<0?f:process.argv[i+1];};
const root=path.resolve(arg('root',path.join(__dirname,'..'))),port=Number(arg('port',4251));
if(port<4250||port>4269)throw Error('Port outside 4250-4269');
const helper=fs.readFileSync(path.join(__dirname,'platform/qa/unity-integration-v160.js'),'utf8');
const out=path.join(__dirname,'..','outputs','diag-mobile-jank');fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function serve(){
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.wasm':'application/wasm','.data':'application/octet-stream','.json':'application/json'};
 return require('node:http').createServer((req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file;
  if(rel==='/native-build.html')file=path.join(root,'outputs/index.html');
  else if(rel.startsWith('/unity/'))file=path.join(root,'outputs/platform/unity-web',rel.slice(7));
  else if(rel.startsWith('/unity-match/'))file=path.join(root,'dist',rel.slice(1));
  else{res.writeHead(404);res.end();return;}
  file=path.resolve(file);if(!file.startsWith(root)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');fs.createReadStream(file).pipe(res);
 });
}
const url=`http://127.0.0.1:${port}/native-build.html?engine=unity`;
// Live-state probe: native match clock and the last stored snapshot (read from the storage layer, not memory).
const probe=page=>page.evaluate(async()=>{const c=v65Context(),stored=JSON.parse(JSON.stringify(v61StorageConfirmed||[])).find(x=>x.id===v61CurrentCareer.id);const snap=stored?.world?.activeMatch?.state?.physicalSnapshot?.match;
 return {phase:c?.state.phase??null,elapsed:match?.elapsed??null,minute:c?.state.minute??null,score:match?[...match.score]:null,flight:Boolean(match?.flight||match?.slide),stored:snap?{elapsed:snap.elapsed,score:snap.score}:null,storedPhase:stored?.world?.activeMatch?.state?.phase??null,saves:window.__saves?.length??0,hidden:document.hidden};});
async function open(context,unity){
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&typeof v61CreateCareer==='function'&&v61StorageReady,{},{timeout:120000});
 return {page,errors};
}
async function start(context,unity){
 const {page,errors}=await open(context,unity);
 for(let i=0;i<3;i++){await page.evaluate(helper);if(await page.evaluate(()=>typeof D6QA160==='object'))break;await wait(1000);}
 await page.evaluate(u=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:u,replays:true}),unity);
 const id=await page.evaluate(async()=>{await v61StoreNewCareer(D6QA160.career);await v61WaitForStorage();return v61CurrentCareer.id;});
 await page.evaluate(()=>{window.__saves=[];const base=v64UiSave;v64UiSave=function(...a){window.__saves.push(performance.now());return base.apply(this,a);};v65Pause();v65Resume();if(typeof hideOverlay==='function')hideOverlay();window.__saves=[];});
 return {page,errors,id};
}
// App switch, simulated in the page: Playwright/Edge keep test pages visible, so document.hidden/visibilityState are
// overridden and a real visibilitychange event runs the product handlers (match, Unity bridge, frame pump, wake lock).
async function minimize(browser,page,state){await page.evaluate(hide=>{if(hide){Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});}else{delete document.hidden;delete document.visibilityState;}document.dispatchEvent(new Event('visibilitychange'));},state==='minimized');}
// After a resume the clock may legitimately stand still for a moment (kickoff countdown, goal pause, set piece):
// poll up to 20 s and report the match state if it never moves.
async function advances(page,from){for(let i=0;i<40;i++){const p=await probe(page);if(p.phase==='live'&&p.elapsed>from)return p;await wait(500);}const p=await probe(page);const extra=await page.evaluate(()=>({kickoff:match?.kickoff?.phase??null,countdown:match?.countdown??null,goalPause:match?.goalPause??null,setPiece:match?.setPiece?.type??null,halftimePause:match?.halftimePause??null,running}));throw Error('clock did not advance from '+from+': '+JSON.stringify({...p,...extra}));}
async function reopen(context,id){
 const {page,errors}=await open(context);
 await page.locator(`[data-v61-open="${id}"]`).first().click();
 await page.waitForFunction(()=>typeof match==='object'&&match&&v65Context(),{},{timeout:60000});
 return {page,errors};
}
(async()=>{
 const server=serve();await new Promise(r=>server.listen(port,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:false,args:['--window-size=1000,560']});
 const report={root,at:new Date().toISOString(),checks:[]};const pass=(name,data)=>{report.checks.push({name,...data});console.log('PASS '+name+' '+JSON.stringify(data));};
 try{
  const from=Number(arg('from',1));
  // 1+2: cadence, hide, return, reload (2D).
  if(from<=2){const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:3,isMobile:true,hasTouch:true});
   const {page,errors,id}=await start(context,false);
   const t0=Date.now();await wait(32000);const live=await probe(page);
   const gaps=await page.evaluate(()=>window.__saves.slice(1).map((t,i)=>t-window.__saves[i]));
   assert.equal(live.phase,'live');assert(live.saves>=1&&live.saves<=3,'saves in 32 s: '+live.saves);assert(gaps.every(g=>g>=15000-50),'gaps '+gaps);
   pass('live autosave at most every 15 s',{seconds:(Date.now()-t0)/1000,saves:live.saves,gapsMs:gaps.map(Math.round)});
   await minimize(browser,page,'minimized');await wait(2500);
   const hidden=await probe(page);assert.equal(hidden.hidden,true);
   // The Unity bridge pauses a hidden live match (snapshot); 2D-only builds keep running and v65SaveLive saves.
   assert(hidden.stored,'no stored snapshot');
   if(hidden.phase==='paused')assert.equal(hidden.stored.elapsed,hidden.elapsed,'paused snapshot equals match');
   pass('hiding the page saves at once',{phase:hidden.phase,elapsed:hidden.elapsed,storedElapsed:hidden.stored.elapsed,storedPhase:hidden.storedPhase});
   await minimize(browser,page,'normal');await page.bringToFront();await wait(800);await page.evaluate(()=>{if(v65Context().state.phase==='paused')v65Resume();});await wait(6000);
   const back=await probe(page);assert.equal(back.phase,'live');assert(back.elapsed>hidden.elapsed,'continues after return');
   pass('match continues after returning',{elapsedBefore:hidden.elapsed,elapsedAfter:back.elapsed});
   await page.evaluate(()=>v65Pause());await wait(1500);const paused=await probe(page);assert.equal(paused.phase,'paused');assert.equal(paused.stored.elapsed,paused.elapsed);
   await page.close();
   const re=await reopen(context,id);const restored=await probe(re.page);
   assert.equal(restored.elapsed,paused.elapsed,'restored clock');assert.deepEqual(restored.score,paused.score);
   await re.page.evaluate(()=>v65Resume());const after=await advances(re.page,restored.elapsed);
   pass('reload resumes the paused match from its snapshot',{elapsed:restored.elapsed,score:restored.score,continuedTo:after.elapsed});
   assert.deepEqual([...errors,...re.errors],[]);await context.close();}
  // 3: crash without pagehide loses at most the last save window.
  if(from<=3){const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:3,isMobile:true,hasTouch:true});
   const {page,errors,id}=await start(context,false);await wait(24000);
   const before=await page.evaluate(()=>({elapsed:match.elapsed,lastSave:window.__saves.at(-1)??null,now:performance.now()}));
   const cdp=await context.newCDPSession(page);cdp.send('Page.crash').catch(()=>{});await wait(2500);
   const re=await reopen(context,id);const restored=await probe(re.page);
   assert(restored.elapsed<=before.elapsed&&restored.elapsed>0,'restored '+restored.elapsed+' live '+before.elapsed);
   const lostRealSeconds=before.lastSave===null?null:(before.now-before.lastSave)/1000;assert(lostRealSeconds!==null&&lostRealSeconds<=15.5,'window '+lostRealSeconds);
   await re.page.evaluate(()=>v65Resume());const after=await advances(re.page,restored.elapsed);
   pass('crash without pagehide loses only the last save window',{liveElapsed:before.elapsed,restoredElapsed:restored.elapsed,realSecondsSinceLastSave:+lostRealSeconds.toFixed(2),continuedTo:after.elapsed});
   assert.deepEqual(re.errors,[]);await context.close();}
  // 4: Unity view: hiding pauses with a snapshot; reload resumes.
  {const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:3,isMobile:true,hasTouch:true});
   const {page,errors,id}=await start(context,true);await wait(8000);
   await minimize(browser,page,'minimized');await wait(3000);
   const hidden=await probe(page);assert.equal(hidden.phase,'paused');assert.equal(hidden.stored.elapsed,hidden.elapsed);
   await page.close();const re=await reopen(context,id);const restored=await probe(re.page);assert.equal(restored.elapsed,hidden.elapsed);
   await re.page.evaluate(()=>v65Resume());const after=await advances(re.page,restored.elapsed);
   const unity=await re.page.evaluate(()=>({ready:D6UnityMatch.ready,error:D6UnityMatch.lastError}));
   pass('Unity: hidden page pauses with snapshot, reload resumes',{elapsed:hidden.elapsed,continuedTo:after.elapsed,unity});
   assert.deepEqual([...errors,...re.errors],[]);await context.close();}
  report.passed=report.checks.length;
 }catch(e){report.error=String(e.stack||e);process.exitCode=1;console.error(report.error);}
 finally{fs.writeFileSync(path.join(out,'check-save'+(arg('root')?'-base':'')+'.json'),JSON.stringify(report,null,1));await browser.close();server.close();}
})();
