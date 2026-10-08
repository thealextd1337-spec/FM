'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const native=require('./native-adapter.cjs'),{installObserver}=require('./observer.cjs'),{manifest}=require('./collect.cjs');
const ROOT=path.resolve(__dirname,'../../..'),digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
(async()=>{
 const out=path.join(ROOT,'outputs/platform/performance',`${new Date().toISOString().replaceAll(':','-').replaceAll('.','-')}-invariants`);fs.mkdirSync(out,{recursive:true});
 const server=require('../../ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.D6_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,ignoreDefaultArgs:['--enable-unsafe-swiftshader']});
 const source=manifest(path.join(ROOT,'dist')),report={schema:1,sourceSha256:source.sha256,cases:[],errors:[],limitations:['240 fixed simulation steps per case, not a full match','Render cadence is deterministic manual draw frequency, not monitor refresh rate','This is state/random-stream parity, not a benchmark of instrumentation overhead']};
 try{
  let reference;
  for(const view of ['2d','3d'])for(const mode of [{observer:false,drawEvery:1},{observer:true,drawEvery:1},{observer:true,drawEvery:3}]){
   const context=await browser.newContext({viewport:{width:1440,height:950}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
   await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html`);await native.prepare(page,{view});
   if(mode.observer)await page.evaluate(installObserver,{native:true,detailed:true});
   const result=await page.evaluate(({drawEvery})=>{
    const timeline=[];
    for(let i=0;i<240;i++){
     step(.04*MATCH_SPEED,.04);if(v65Context().state.phase==='live'&&!match.finished)v65AfterStep(v65Context());
     if(i%drawEvery===0)draw();
     if(i%30===0||i===239)timeline.push({elapsed:match.elapsed,score:match.score.slice(),random:window.__d6Seed,ball:{x:match.ball.x,y:match.ball.y},owner:match.owner?.n??null,people:match.people.map(p=>({n:p.n,t:p.t,x:p.x,y:p.y,fresh:p.fresh})),goals:JSON.parse(JSON.stringify(match.goals)),events:JSON.parse(JSON.stringify(v65Context().state.events)),stats:JSON.parse(JSON.stringify(v65Context().state.stats))});
    }
    return timeline;
   },mode);
   const before=await page.evaluate(()=>JSON.stringify({match,state:v65Context().state,random:window.__d6Seed}));for(let i=0;i<3;i++)await native.snapshot(page);
   const after=await page.evaluate(()=>JSON.stringify({match,state:v65Context().state,random:window.__d6Seed}));assert.equal(after,before,'Reading metrics must preserve complete match/state/random stream');
   const metrics=mode.observer?await page.evaluate(()=>window.__D6Measure.finish()):null;
   if(!reference)reference=result;assert.deepEqual(result,reference,`Parity ${view} observer=${mode.observer} drawEvery=${mode.drawEvery}`);
   report.cases.push({view,...mode,digest:digest(result),readOnly:true,simulationCalls:metrics?.cpuMs.simulationStepInclusive.length??null});
   await context.close();console.log(JSON.stringify(report.cases.at(-1)));
  }
  assert.deepEqual(report.errors,[]);report.sourceUnchanged=manifest(path.join(ROOT,'dist')).sha256===source.sha256;assert(report.sourceUnchanged);report.pass=true;
 }catch(e){report.pass=false;report.failure=e.stack;process.exitCode=1}finally{await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(`Report: ${path.relative(ROOT,out)}`)}
})().catch(e=>{console.error(e);process.exitCode=1});
