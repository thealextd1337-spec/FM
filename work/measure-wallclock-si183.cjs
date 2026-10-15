'use strict';
// SI-K wall clock: complete browser matches in real time with the existing Unity
// WebGL view (outputs/platform/unity-web, no new build), all-inclusive (goal
// scenes, banners, restarts), without tactic pauses (the half-time pause is
// resumed at once, as in the measurement harness). The match runs on the
// production loop (v65StartLoop: setInterval 40 ms, steps capped at 50 ms), so
// a slow page loses match time and the wall clock grows; that is what is
// measured. New matches take the constructor defaults (match.si incl. clockRate).
// Usage: node work/measure-wallclock-si183.cjs [--matches=10] [--parallel=2] [--port=4251] [--engine=unity] [--out=path]
// Ports 4250-4269 (SI lanes); dist and the Unity build are hashed before and after.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('./ui-redesign/serve.cjs');
const root=path.resolve(__dirname,'..'),arg=(n,f)=>{const h=process.argv.find(a=>a.startsWith('--'+n+'='));return h?h.slice(n.length+3):f;};
const matches=+arg('matches','10'),parallel=+arg('parallel','2'),port=+arg('port','4251'),engine=arg('engine','unity'),out=arg('out',path.join(root,'outputs/si183/wallclock.json')),headful=process.argv.includes('--headful'),gpu=process.argv.includes('--gpu');
assert(port>=4250&&port<=4269&&parallel>=1&&parallel<=6);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);
const hashAll=()=>Object.fromEntries([...files(path.join(root,'dist')),...files(path.join(root,'outputs/platform/unity-web'))].map(f=>[path.relative(root,f).split(path.sep).join('/'),sha(fs.readFileSync(f))]));
const clubs=['ENG-1','ESP-1','GER-1','ITA-1','FRA-1','NED-1','POR-1','ENG-2','ESP-2','GER-2','ITA-2','FRA-2'];
const sizes=['standard','large'];
async function one(browser,i){
 const page=await (await browser.newContext({viewport:{width:900,height:430}})).newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${port}/source/index.html?engine=${engine}`,{timeout:180000});
 await page.waitForFunction(()=>typeof D6Expansion?.createCareer==='function'&&typeof v65Show==='function',null,{timeout:180000});
 const clubId=clubs[i%clubs.length],size=sizes[i%2];
 const setup=await page.evaluate(({clubId,size,i})=>{
  const c=D6Expansion.createCareer(clubId,'sik-wall-'+i,'SI-K Wanduhr',{fieldSize:size,fieldPlayers:size==='standard'?5:6});
  const own=v66Own(c);v66ChooseSponsor(c,own.id,own.sponsors[0].id);v124SetYouthBudget(c,0);
  for(let k=0;k<40&&['open','deadline'].includes(c.world.market?.phase);k++)v66NextMarketDay(c);
  const fixture=v64AdvanceToOwnMatch(c);if(!fixture)throw Error('no own fixture');
  v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';match=null;v65WorldActive=null;v65Show(v65Context());
  return{fixture:fixture.id,si:match.si?{revision:match.si.revision,clockRate:match.si.clockRate,packages:match.si.packages}:null};
 },{clubId,size,i});
 // Wait for the Unity view (if selected) before kick-off, then start the real-time loop.
 if(engine==='unity')await page.waitForFunction(()=>window.D6UnityMatch?.ready===true,null,{timeout:300000}).catch(()=>{});
 const unityReady=await page.evaluate(()=>window.D6UnityMatch?.ready===true);
 const result=await page.evaluate(async()=>{
  // Real seconds actually stepped by the production loop (the Node harness counts these); the rest of the wall clock is lost to stalled frames (steps are capped at 50 ms).
  let stepped=0,steps=0;const baseStep=step;step=function(delta,real){stepped+=real||0;steps++;return baseStep.apply(this,arguments);};
  const t0=performance.now();let halftimeWall=null,resumes=0,maxGap=0,last=t0,frames=0;
  v65Resume();
  while(!match.finished){
   await new Promise(r=>setTimeout(r,100));const now=performance.now();maxGap=Math.max(maxGap,now-last);last=now;frames++;
   const ctx=v65Context();
   if(ctx?.state.phase==='paused'&&!match.finished){if(match.halftimePause>0&&halftimeWall===null)halftimeWall=(now-t0)/1000;v65Resume();resumes++;}
   if(now-t0>20*60*1000)throw Error('match exceeded 20 min wall clock');
  }
  const wall=(performance.now()-t0)/1000;step=baseStep;
  return{wallSeconds:+wall.toFixed(2),steppedSeconds:+stepped.toFixed(2),steps,halftimeWall,resumes,score:[...match.score],elapsed:+match.elapsed.toFixed(3),clockRate:match.si?.clockRate??null,shots:match.people.reduce((s,p)=>s+(p.stats.shots||0),0),maxPollGapMs:Math.round(maxGap),fallbacks:window.D6ViewFramePump?.fallbacks??null};
 });
 await page.context().close();
 return{i,clubId,size,...setup,unityReady,...result,errors:errors.slice(0,5)};
}
(async()=>{
 const before=hashAll(),server=createServer();await new Promise(r=>server.listen(port,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:!headful,args:gpu?['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--enable-gpu-rasterization']:headful?[]:['--enable-unsafe-swiftshader']});
 const rows=[];let next=0;
 try{await Promise.all(Array.from({length:parallel},async()=>{while(next<matches){const i=next++;const row=await one(browser,i).catch(e=>({i,error:String(e.message||e)}));rows.push(row);console.log(JSON.stringify(row));}}));}
 finally{await browser.close();server.close();}
 const after=hashAll();assert.deepEqual(after,before,'dist and Unity build unchanged');
 const ok=rows.filter(r=>!r.error),mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
 const report={date:new Date().toISOString(),engine,parallel,headless:!headful,gpu,matches:rows.sort((a,b)=>a.i-b.i),wallMinutesMean:ok.length?+(mean(ok.map(r=>r.wallSeconds))/60).toFixed(3):null,wallMinutesMin:ok.length?+(Math.min(...ok.map(r=>r.wallSeconds))/60).toFixed(3):null,wallMinutesMax:ok.length?+(Math.max(...ok.map(r=>r.wallSeconds))/60).toFixed(3):null,unityReady:ok.filter(r=>r.unityReady).length,steppedMinutesMean:ok.length?+(mean(ok.map(r=>r.steppedSeconds??NaN))/60).toFixed(3):null,distUnchanged:true};
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
 console.log(JSON.stringify({out,n:ok.length,failures:rows.length-ok.length,wallMinutesMean:report.wallMinutesMean,min:report.wallMinutesMin,max:report.wallMinutesMax,unityReady:report.unityReady}));
})().catch(e=>{console.error(e);process.exitCode=1;});
