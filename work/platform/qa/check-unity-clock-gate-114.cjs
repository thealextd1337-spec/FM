'use strict';
// Release 114: native clock waits for the first acknowledged Unity picture.
// Real page reloads, real native setInterval loop, delayed Unity download via
// request routing. Isolated headless Edge profile; no user data touched.
// usage: node check-unity-clock-gate-114.cjs [base=http://127.0.0.1:4521/source/index.html] [scenarios=all]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const base=process.argv[2]||'http://127.0.0.1:4521/source/index.html',only=(process.argv[3]||'all').split(',');
const DELAY=9000;
const results=[];let failures=0,CURRENT='';
const check=(scenario,name,ok,detail)=>{results.push({scenario,name,ok:Boolean(ok),detail});if(!ok)failures++;console.log((ok?'PASS ':'FAIL ')+scenario+' · '+name+(ok?'':' · '+JSON.stringify(detail)));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function page(browser,{delay=0,breakUnity=false}={}){
 const ctx=await browser.newContext({viewport:{width:1280,height:800}}),p=await ctx.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
 p.delay=delay;p.breakUnity=breakUnity;
 await ctx.route(/\/unity\/Build\/.*\.data/,async route=>{if(p.breakUnity)return route.abort();if(p.delay)await wait(p.delay);return route.continue();});
 return {ctx,p};
}
const S=p=>p.evaluate(()=>{const c=v65Context();return{phase:c?.state.phase,minute:c?.state.minute,elapsed:match?.elapsed??null,running,halftime:match?.halftimePause>0,held:window.D6UnityMatch?.clockHeld??null,ready:window.D6UnityMatch?.ready??null,error:window.D6UnityMatch?.lastError??null,view:v98View,failed:v98Failed,ackPlayers:window.D6UnityMatch?.lastAck?.players??null,people:match?.people.length??null,sig:match?[match.elapsed,match.countdown,match.kickoff?.phase,match.postBanner?.wait,match.setPiece?.wait,match.halftimePause,match.people.reduce((t,q)=>t+q.x*7+q.y*13,0).toFixed(6)].join('|'):null}});
// Waits until native steps change the signature, then until the clock itself moves.
async function progressed(p,from,ms=25000){const end=Date.now()+ms;let s;do{await wait(500);s=await S(p);}while(Date.now()<end&&!(s.elapsed>from.elapsed+.3));return s;}
async function newCareer(p,url){
 await p.goto(url);
 await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
 const setup=await p.evaluate(u=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:u,replays:true}),url.includes('engine=unity'));
 const id=await p.evaluate(async()=>{await v61StoreNewCareer(D6QA160.career);await v61WaitForStorage();return v61CurrentCareer.id});
 return {setup,id};
}
async function reopen(p,id){
 await p.reload();await p.evaluate(()=>v61WaitForStorage()).catch(()=>{});
 await p.locator('[data-v61-open="'+id+'"]').first().click();
}
async function waitReady(p,ms=120000){await p.waitForFunction(()=>window.D6UnityMatch?.ready||window.D6UnityMatch?.lastError,null,{timeout:ms,polling:100});}
// Holds while loading: elapsed frozen over a window, then advances after the first ack.
async function heldThenRuns(scenario,p,{expectPhase='live'}={}){
 const a=await S(p);await wait(2500);const b=await S(p);
 check(scenario,'Unity still loading during the hold window',!b.ready&&b.held===true,{a,b});
 check(scenario,'native state frozen while Unity loads (clock, countdowns, positions)',a.sig===b.sig&&a.minute===b.minute,{a,b});
 check(scenario,'phase unchanged while held',a.phase===expectPhase&&b.phase===expectPhase,{a,b});
 await waitReady(p);const c=await S(p);
 check(scenario,'first ack carries all players',c.ready&&!c.error&&c.ackPlayers===c.people,c);
 check(scenario,'clock had not advanced before the ack',Math.abs(c.elapsed-b.elapsed)<.2,{b,c});
 const d=expectPhase==='live'?await progressed(p,c):(await wait(4000),await S(p));
 if(expectPhase==='live')check(scenario,'native match continues after the ack',d.elapsed>c.elapsed+.3&&d.phase==='live'&&!d.held,{c,d});
 else check(scenario,'genuine pause is not resumed by the ack',d.phase===expectPhase&&d.sig===c.sig&&!d.running,{c,d});
 return d;
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const run=name=>only.includes('all')||only.includes(name);
 try{
  if(run('reload-live-18'))try{CURRENT='reload-live-18';
   const sc='reload-live-18',{ctx,p}=await page(browser);
   const {id}=await newCareer(p,base+'?engine=unity');
   await p.evaluate(()=>v65StartLoop());await p.waitForFunction(()=>v65Context()?.state.minute>=18,null,{timeout:180000,polling:100});
   await p.evaluate(()=>v61WaitForStorage());p.delay=DELAY;await reopen(p,id);
   const s=await S(p);check(sc,'reopened live at the saved minute',s.phase==='live'&&s.minute>=15,s);
   await heldThenRuns(sc,p);
   // the rest of the match with the real loop, then fast native steps to the end
   await wait(8000);const mid=await S(p);check(sc,'real loop continues with Unity',mid.phase==='live'&&mid.ready&&!mid.error,mid);
   const end=await p.evaluate(async()=>{clearInterval(v65WorldFrame);let t=0;while(!match.finished&&t++<8000){const c=v65Context();if(c.state.phase==='paused')v65Resume(),clearInterval(v65WorldFrame);step(.05*MATCH_SPEED,.05);if(c.state.phase==='live'&&!match.finished)v65AfterStep(c);if(t%40===0)await new Promise(r=>requestAnimationFrame(r))}return{finished:match.finished,phase:v65Context().state.phase,error:D6UnityMatch.lastError}});
   check(sc,'complete remaining match finishes',end.finished&&['finished','penalties'].includes(end.phase)&&!end.error,end);
   check(sc,'no page errors',!p.errors.length,p.errors);await ctx.close();
  }catch(error){check(CURRENT,'scenario completed',false,String(error).split('\n')[0]);}
  if(run('reload-paused'))try{CURRENT='reload-paused';
   const sc='reload-paused',{ctx,p}=await page(browser);
   const {id}=await newCareer(p,base+'?engine=unity');
   await p.evaluate(()=>D6QA160.run({minute:12,sampleEvery:40}));await p.evaluate(()=>D6QA160.pause());await p.evaluate(()=>v61WaitForStorage());
   p.delay=DELAY;await reopen(p,id);
   await heldThenRuns(sc,p,{expectPhase:'paused'});
   await p.locator('#v65-quick-nav [data-v65-quick]').first().click();await wait(3000);const r=await S(p);
   check(sc,'user resume continues after load',r.phase==='live'&&r.running&&r.elapsed>0&&!r.held,r);
   check(sc,'no page errors',!p.errors.length,p.errors);await ctx.close();
  }catch(error){check(CURRENT,'scenario completed',false,String(error).split('\n')[0]);}
  if(run('reload-halftime'))try{CURRENT='reload-halftime';
   const sc='reload-halftime',{ctx,p}=await page(browser);
   const {id}=await newCareer(p,base+'?engine=unity');
   const h=await p.evaluate(()=>D6QA160.run({stopAtHalftime:true,sampleEvery:60}));await p.evaluate(()=>v61WaitForStorage());
   check(sc,'reached halftime',h.stopped==='halftime',h);
   p.delay=DELAY;await reopen(p,id);
   // The halftime tactics view hides the pitch, so Unity intentionally waits
   // (suspended) until the user starts the second half; nothing runs meanwhile.
   const a=await S(p);await wait(4000);const b=await S(p);
   check(sc,'halftime pause kept after reload',a.phase==='paused'&&a.halftime&&b.phase==='paused'&&a.elapsed===b.elapsed&&!b.running,{a,b});
   await p.evaluate(()=>v58Button.click());
   await heldThenRuns(sc+' second half',p);
   check(sc,'no page errors',!p.errors.length,p.errors);await ctx.close();
  }catch(error){check(CURRENT,'scenario completed',false,String(error).split('\n')[0]);}
  if(run('fresh-start'))try{CURRENT='fresh-start';
   const sc='fresh-start',{ctx,p}=await page(browser,{delay:DELAY});
   await p.goto(base+'?engine=unity');await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
   // a new match shown live before Unity is ready: native start itself must wait
   await p.evaluate(async()=>{
    const c=v61CreateCareer('GER-2','gate-fresh','Gate QA',undefined,{fieldSize:'standard',fieldPlayers:5}),club=v66Own(c);
    v66ChooseSponsor(c,club.id,club.sponsors[0].id);while(c.world.market.phase==='open')await v66NextMarketDay(c);
    const f=v62Fixtures(c).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0],s=v64MakeState(c,f);
    c.world.activeMatch={fixtureId:f.id,state:s};v61CurrentCareer=c;s.phase='live';match=null;v65WorldActive=null;v98View='3d';v65Show(v65Context());
   });
   await heldThenRuns(sc,p);check(sc,'no page errors',!p.errors.length,p.errors);await ctx.close();
  }catch(error){check(CURRENT,'scenario completed',false,String(error).split('\n')[0]);}
  if(run('failure-2d'))try{CURRENT='failure-2d';
   const sc='failure-2d',{ctx,p}=await page(browser);
   const {id}=await newCareer(p,base+'?engine=unity');
   await p.evaluate(()=>{v65Resume()});await wait(1500);await p.evaluate(()=>v61WaitForStorage());
   p.breakUnity=true;await reopen(p,id);
   await p.waitForFunction(()=>window.D6UnityMatch?.lastError,null,{timeout:150000,polling:200});
   const a=await S(p);const b=await progressed(p,a);
   check(sc,'Unity failure falls back to 2D',a.error&&a.view==='2d'&&a.failed,a);
   check(sc,'native clock runs in 2D after the failure',b.phase==='live'&&b.elapsed>a.elapsed+.3&&!b.held,{a,b});
   // The aborted .data download makes Unity's own loader throw; that error is the simulated failure.
   check(sc,'no page errors besides the simulated loader failure',p.errors.every(e=>/subarray/.test(e)),p.errors);await ctx.close();
  }catch(error){check(CURRENT,'scenario completed',false,String(error).split('\n')[0]);}
  if(run('switch-2d'))try{CURRENT='switch-2d';
   const sc='switch-2d',{ctx,p}=await page(browser);
   const {id}=await newCareer(p,base+'?engine=unity');
   await p.evaluate(()=>{v65Resume()});await wait(1500);await p.evaluate(()=>v61WaitForStorage());
   p.delay=60000;await reopen(p,id);
   const a=await S(p);await wait(2000);const b=await S(p);check(sc,'held while Unity loads',a.held&&a.sig===b.sig,{a,b});
   await p.evaluate(()=>document.querySelector('[data-v98-view="2d"]').click());const c=await progressed(p,b);
   check(sc,'choosing 2D releases the clock at once',c.view==='2d'&&!c.held&&c.elapsed>b.elapsed+.3&&c.phase==='live',{b,c});
   check(sc,'no page errors',!p.errors.length,p.errors);await ctx.close();
  }catch(error){check(CURRENT,'scenario completed',false,String(error).split('\n')[0]);}
  if(run('browser-engine'))try{CURRENT='browser-engine';
   const sc='browser-engine',{ctx,p}=await page(browser);
   const {id}=await newCareer(p,base+'?engine=browser');
   await p.evaluate(()=>{v98View='2d';v65Resume()});await wait(1500);await p.evaluate(()=>v61WaitForStorage());
   await reopen(p,id);const a=await S(p);const b=await progressed(p,a);
   check(sc,'2D-only page never holds',b.phase==='live'&&b.elapsed>a.elapsed+.3&&b.held===null,{a,b});
   check(sc,'no page errors',!p.errors.length,p.errors);await ctx.close();
  }catch(error){check(CURRENT,'scenario completed',false,String(error).split('\n')[0]);}
 }finally{
  await browser.close();
  const out={base,delayMs:DELAY,failures,results};fs.mkdirSync('outputs/release-114',{recursive:true});
  fs.writeFileSync('outputs/release-114/unity-clock-gate.json',JSON.stringify(out,null,2)+'\n');
  console.log(failures?`${failures} FAILED of ${results.length}`:`ALL ${results.length} PASSED`);process.exitCode=failures?1:0;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
