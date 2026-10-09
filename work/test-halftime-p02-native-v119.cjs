'use strict';
// Real native fixture/clock/load QA. No changes to product sources or P02 facts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),output=path.join(root,'outputs/3d-quality/shot-volume-v119/halftime-p02-native.json'),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const frozen=new Map([['index.html',fs.readFileSync(path.join(root,'dist/index.html'))]]);
for(const item of frozen.get('index.html').toString().matchAll(/(?:src|href)="([^"#]+)"/g)){
 const rel=item[1].split('?')[0];if(/^(?:https?:|data:|\/)/.test(rel)||!/\.(js|css)$/.test(rel))continue;
 frozen.set(rel.replaceAll('\\','/'),fs.readFileSync(path.join(root,'dist',rel)));
}
// Evaluate only the agent's existing local candidate-byte construction.
const candidatePath=path.join(root,'work/diagnose-shot-p02-v119.cjs'),candidateScript=fs.readFileSync(candidatePath,'utf8');
const prefix=candidateScript.slice(candidateScript.indexOf('const files='),candidateScript.indexOf('const report='));
const candidate=new Function('fs','path','assert','root',prefix+'\nreturn candidate;')(fs,path,assert,root);
const report={scope:'Current production and separately labeled private stage2, actual native std5 shot119-5 fixture, complete P02 facts, JSON around halftime. No wall-clock override, shortened intervals, forced outcomes, production edits or Unity/build operations.',sourceHashes:Object.fromEntries([...frozen].map(([f,b])=>['dist/'+f,hash(b)])),candidateScriptSha256:hash(candidateScript),candidateHashes:Object.fromEntries(Object.entries(candidate).map(([f,s])=>[f,hash(s)])),rows:[],errors:[]};
async function main(){
 const server=require('./ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
  for(const route of ['production','private-stage2'])for(const marked of [true,false])for(const json of marked?[false,true]:[false]){
   const context=await browser.newContext(),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
   await page.route('**/source/**',r=>{const rel=decodeURIComponent(new URL(r.request().url()).pathname.slice(8)),bytes=route==='private-stage2'&&candidate[rel]?Buffer.from(candidate[rel]):frozen.get(rel);return bytes?r.fulfill({body:bytes,contentType:rel.endsWith('.js')?'text/javascript':rel.endsWith('.css')?'text/css':'text/html'}):r.continue();});
   await page.goto('http://127.0.0.1:'+server.address().port+'/source/index.html?engine=browser&players=wave3');await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
   const row=await page.evaluate(async({route,marked,json})=>{
    const check=(v,m)=>{if(!v)throw Error(m);};
    const originalRandom=Math.random,originalCommit=v158Commit,originalDraw=draw,originalReplay=v103CanReplay;
    let rng=169032,draws=0;Math.random=()=>{draws++;rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
    let c,state,fixture,ticks=0;const checkpoints=[],boundaries=[],commits=[],clockClamps=[],queued=new Map();let lastElapsed=0,firstBreak=false,rewinds=0;
    const facts=ctx=>Object.entries(ctx.state.playerLoad.pending).map(([pid,p])=>({pid,intervals:structuredClone(p.intervals),events:structuredClone(p.events),running:structuredClone(p.running),playedRanges:structuredClone(ctx.state.playerLoad.players[pid].ledger.fixtures.find(f=>f.id===ctx.fixture.id)?.minuteRanges||[])}));
    const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
    const runtime=m=>{const{people,exitedPeople,owner,lastPass,breakawayCarrier,nativeContactClock,...rest}=m;const player=p=>{const{playerModel,history,honours,...physical}=p;return physical;};return{...rest,people:people.map(player),exitedPeople:(exitedPeople||[]).map(player),ownerPid:owner?.pid||null,lastPass:lastPass?{passerPid:lastPass.passer?.pid,receiverPid:lastPass.receiver?.pid,at:lastPass.at}:null,breakawayCarrierPid:breakawayCarrier?.pid||null};};
    try{
     c=v61CreateCareer('GER-2','shot119-5','Shot experiment',undefined,{fieldSize:'standard',fieldPlayers:5});const club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
     fixture=v62Fixtures(c).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0];state=v64MakeState(c,fixture);c.world.activeMatch={fixtureId:fixture.id,state};v61CurrentCareer=c;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);v103CanReplay=()=>false;draw=()=>{};
     if(!marked)delete match.attackFlow.paceRevision;check(Boolean(v119PaceActive(match))===marked,'actual pace marker branch');check(state.playerLoad&&state.playerPerformance,'actual P02/P03 active');
     v158Commit=function(ctx){
      if(ctx.fixture.id!==fixture.id)return originalCommit(ctx);
      const near=Math.abs(match.elapsed-(match.firstHalfEnd||37.5))<.5||match.halftimePause>0;
      const pending=facts(ctx);for(const p of pending)for(const event of p.events)queued.set(p.pid+'|'+event.id,{pid:p.pid,event});
      if(near||match.elapsed>70)commits.push({elapsed:match.elapsed,minute:ctx.state.minute,firstHalfEnd:match.firstHalfEnd,fullTimeEnd:match.fullTimeEnd,facts:pending});
      try{return originalCommit(ctx);}catch(e){window.nativeP02Failure={elapsed:match.elapsed,minute:ctx.state.minute,facts:facts(ctx),message:e.message};throw e;}
     };
     function snapshot(label){
      const ctx=v65Context(),before={elapsed:match.elapsed,firstHalfEnd:match.firstHalfEnd,minute:state.minute,phase:state.phase,paceRevision:match.attackFlow.paceRevision??null,pending:facts(ctx)};
      check(!match.flight&&!match.slide,'native snapshot safety');check(v65Snapshot(ctx)!==false,'native snapshot saved');
      c=JSON.parse(JSON.stringify(c));v61CurrentCareer=c;state=c.world.activeMatch.state;fixture=v64ActiveFixture(c);const restored=v65Context();match=null;v65WorldActive=restored;check(v65Restore(restored),'native restore succeeds');
      check(match.elapsed===before.elapsed&&match.firstHalfEnd===before.firstHalfEnd&&state.minute===before.minute,'JSON preserves actual half clock');
      check((match.attackFlow.paceRevision??null)===before.paceRevision,'JSON preserves actual pace marker');
      check(JSON.stringify(facts(restored))===JSON.stringify(before.pending),'JSON preserves entire pending P02 intervals/events');
      checkpoints.push({...before,label});
     }
     while(!match.finished&&ticks++<10000){
      if(json&&!checkpoints.some(x=>x.label==='before-half')&&!match.halftime&&!match.halftimePending&&match.elapsed>=(match.firstHalfEnd||37.5)-5&&!match.flight&&!match.slide&&!match.setPiece&&!match.kickoff&&!match.throwIn&&!match.rebound&&!match.goalPause&&!match.halftimePause)snapshot('before-half');
      if(match.halftimePause>0&&!firstBreak){firstBreak=true;boundaries.push({elapsed:match.elapsed,firstHalfEnd:match.firstHalfEnd,minute:state.minute,pending:facts(v65Context())});if(json)snapshot('half-break');}
      if(state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}
      const ctx=v65Context(),before=match.elapsed,halfAlreadyDone=match.halftimeBreakDone,beforeFacts=match.elapsed>(match.fullTimeEnd||75)-.1?facts(ctx):null;step(.05*MATCH_SPEED,.05);
      if(match.elapsed+1e-10<before){rewinds++;clockClamps.push({before,after:match.elapsed,halfAlreadyDone:Boolean(halfAlreadyDone),finished:match.finished,fullTimeEnd:match.fullTimeEnd,fulltimePending:match.fulltimePending,flight:Boolean(match.flight),pendingBefore:beforeFacts,pendingAfter:facts(ctx)});if(marked&&!halfAlreadyDone)throw Error('Marked actual first-half clock rewound');}
      lastElapsed=match.elapsed;if(state.phase==='live'&&!match.finished)v65AfterStep(ctx);
      if(v65PauseRequested&&!match.flight&&!match.slide&&state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame);}
     }
     check(match.finished,'real full match finished');check(firstBreak,'real halftime observed');if(json)check(checkpoints.length===2,'both around-half checkpoints observed');
     const stats=Object.fromEntries(['shots','onTarget','passes','passComplete','goals','saves','interceptions'].map(k=>[k,[...match.people,...match.exitedPeople].reduce((n,p)=>n+(p.stats[k]||0),0)]));
     const eventAudit={queued:queued.size,verified:0,missing:[],outOfRanges:[],nearFinal:[]};
     for(const {pid,event}of queued.values()){
      const ledger=state.playerLoad.players[pid].ledger.fixtures.find(f=>f.id===fixture.id),recorded=ledger?.events.find(e=>e.id===event.id);
      if(!recorded){eventAudit.missing.push({pid,event});continue;}
      check(JSON.stringify(canonical(JSON.parse(recorded.signature)))===JSON.stringify(canonical(event)),'actual queued P02 event unchanged after consume');eventAudit.verified++;
      if(!ledger.minuteRanges.some(r=>event.minute>=r.startMinute-1e-7&&event.minute<=r.endMinute+1e-7))eventAudit.outOfRanges.push({pid,event,ranges:ledger.minuteRanges});
      if(event.minute>95)eventAudit.nearFinal.push({pid,event,ranges:ledger.minuteRanges});
     }
     check(eventAudit.queued>0&&eventAudit.missing.length===0&&eventAudit.outOfRanges.length===0,'all actual queued contacts/actions retained inside complete played P02 ranges');
     const digest=JSON.stringify(canonical({rng,draws,score:state.score,stats:state.stats,events:state.events,load:state.playerLoad,match:runtime(match),continuation:v160SnapshotContinuation(match)}));
     return{route,marked,json,fixtureId:fixture.id,finished:true,ticks,stats,score:[...state.score],rng,draws,lastElapsed,rewinds,clockClamps,checkpoints,boundaries,commits,eventAudit,digest};
    }catch(e){return{route,marked,json,fixtureId:fixture?.id,finished:false,ticks,failure:e.stack,p02Failure:window.nativeP02Failure,checkpoints,boundaries,commits};}
    finally{Math.random=originalRandom;v158Commit=originalCommit;draw=originalDraw;v103CanReplay=originalReplay;running=false;clearInterval(v65WorldFrame);}
   },{route,marked,json});
   row.digestSha256=row.digest?hash(row.digest):null;delete row.digest;report.rows.push(row);console.log(JSON.stringify({route,marked,json,finished:row.finished,shots:row.stats?.shots,checkpoints:row.checkpoints.length,failure:row.failure}));await context.close();
  }
  for(const row of report.rows)assert(row.finished,row.failure);
  for(const route of ['production','private-stage2']){const live=report.rows.find(r=>r.route===route&&r.marked&&!r.json),json=report.rows.find(r=>r.route===route&&r.json);assert.equal(json.digestSha256,live.digestSha256,'exact actual halftime JSON continuation: '+route);}
  const old=report.rows.filter(r=>!r.marked);assert.equal(old[0].digestSha256,old[1].digestSha256,'unmarked current production equals private-stage2 old branches');
  for(const [f,b]of frozen)assert.equal(hash(fs.readFileSync(path.join(root,'dist',f))),hash(b),'source unchanged '+f);
  assert.deepEqual(report.errors,[]);report.pass=true;
 }catch(e){report.pass=false;report.failure=e.stack;process.exitCode=1;}
 finally{if(browser)await browser.close();await new Promise(r=>server.close(r));report.runnerSha256=hash(fs.readFileSync(__filename));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:report.pass,rows:report.rows.length,failure:report.failure}));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
