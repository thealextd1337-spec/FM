'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('outputs/platform/attack-flow');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=require('../../ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const report={checks:[],errors:[],sourceHashes:Object.fromEntries(['dist/game.js','dist/pitch-v55.js','dist/world-attack-flow-v152.js','dist/world-physical-v65.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))};
 try{
  const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser`);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  report.scenarios=await page.evaluate(()=>{
   v65WorldActive={};const rows=[];
   const person=(pid,t,x,y,line,role=0)=>({pid,t,n:pid.length,x,y,bx:x,by:y,tx:x,ty:y,line,assignedLine:line,role,keeper:line==='gk',instructions:[],pos:16,tec:16,pas:16,spd:16,fin:16,sta:16,tak:16,air:16,gk:16,form:0,fresh:100,stats:emptyStats()});
   for(const t of [0,1]){
    const y=n=>t===0?n:1-n,p=person('carrier',t,.45,y(.62),'mid'),a=person('striker',t,.3,y(.52),'att',1),b=person('runner',t,.7,y(.56),'mid',1),c=person('support',t,.6,y(.7),'mid'),d=person('cover',t,.2,y(.74),'def',-1),r=person('rival',1-t,.85,y(.3),'def'),k=person('keeper',1-t,.5,y(.06),'gk');
    const m={people:[p,a,b,c,d,r,k],owner:p,ball:{x:p.x,y:p.y},lastTouch:t,elapsed:10,next:11,attackFlow:{version:152,intents:{},team:null,ownerPid:null},teamDirect:[0,0]};match=m;
    let randomCalls=0;const previousRandom=Math.random;Math.random=()=>{randomCalls++;return .5;};v121PreparePositioning(m);v152PrepareAttack(m);
    const intents=structuredClone(m.attackFlow.intents);for(const q of [a,b,c,d])v152AttackTarget(m,q);
    const initial={team:t,depth:Object.values(intents).filter(i=>i.type==='depth').length,support:Object.values(intents).filter(i=>i.type==='support').length,coverRetained:!intents[d.pid],separation:v122Metres(intents[a.pid],intents[b.pid]),beforeReleaseOnside:[a,b].every(q=>{const limit=v121PositioningPlans.get(m).get(q)?.limit;return t===0?q.ty>=limit:q.ty<=limit;}),decisionSeconds:(m.next-m.elapsed)/MATCH_SPEED,randomCalls};
    const unchanged=JSON.stringify(m.attackFlow.intents);m.elapsed+=.05*MATCH_SPEED;p.y+=t===0?-.001:.001;v152PrepareAttack(m);initial.stablePlan=unchanged===JSON.stringify(m.attackFlow.intents);
    v152AfterPass(m,p,a);initial.follow=m.attackFlow.intents[p.pid]?.type==='follow';const checkpoint=JSON.parse(JSON.stringify(m));checkpoint.owner=checkpoint.people.find(q=>q.pid==='carrier');match=checkpoint;v121PreparePositioning(checkpoint);v152AttackTarget(checkpoint,checkpoint.people.find(q=>q.pid==='striker'));initial.checkpointSameTarget=checkpoint.people.find(q=>q.pid==='striker').ty===a.ty;
    match=m;m.owner=null;m.flight={team:t};v152AttackTarget(m,a);initial.afterReleaseContinues=t===0?a.ty<=intents[a.pid].y:a.ty>=intents[a.pid].y;
    m.flight=null;m.owner=r;m.lastTouch=1-t;v121PreparePositioning(m);v152PrepareAttack(m);initial.turnoverClears=Object.values(m.attackFlow.intents).every(i=>i.team===1-t);
    m.kickoff={};v152PrepareAttack(m);initial.restartClears=Object.keys(m.attackFlow.intents).length===0;
    delete m.attackFlow;const old=JSON.stringify(m);v152PrepareAttack(m);v152AttackTarget(m,p);initial.oldStateUnchanged=old===JSON.stringify(m);Math.random=previousRandom;rows.push(initial);
   }v65WorldActive=null;match=null;return rows;
  });
  for(const row of report.scenarios){assert.equal(row.depth,2);assert.equal(row.support,1);assert(row.coverRetained&&row.beforeReleaseOnside&&row.stablePlan&&row.follow&&row.checkpointSameTarget&&row.afterReleaseContinues&&row.turnoverClears&&row.restartClears&&row.oldStateUnchanged);assert(row.separation>3);assert(row.decisionSeconds<.5);assert.equal(row.randomCalls,0);}
  report.checks.push('Both attack directions: early separated runs, diagonal support, cover, onside release, follow-up, stable plans and turnover');
  report.checks.push('Plain checkpoint intent survives JSON restore; unmarked old matches are untouched; planning uses no RNG');
  report.matches=[];
  for(const seed of ['attack-a','attack-b','attack-c'])for(const active of [false,true]){
   const row=await page.evaluate(async ({seed,active})=>{
    let rng=12345;Math.random=()=>{rng=(rng*1664525+1013904223)>>>0;return rng/4294967296;};
    const c=v61CreateCareer('GER-2',seed),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
    const fixture=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);c.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(c,fixture)};match=null;v65WorldActive=null;v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);if(!active)delete match.attackFlow;v103CanReplay=()=>false;v65Resume();clearInterval(v65WorldFrame);
    let ticks=0,half=false,depthMetres=0,followMetres=0,quickChains=0,completedBefore=0,receivedAt=null;
    while(!match.finished&&ticks++<16000){
     if(v65Context().state.phase==='paused'){half||=match.halftimePause>0;v65Resume();clearInterval(v65WorldFrame);}
     const before=new Map(match.people.map(p=>[p.pid,{x:p.x,y:p.y}])),oldPasses=match.people.reduce((sum,p)=>sum+p.stats.passes,0);
     step(.05*MATCH_SPEED,.05);if(v65Context().state.phase==='live'&&!match.finished)v65AfterStep(v65Context());
     for(const p of match.people){const mode=match.attackFlow?.intents[p.pid]?.type,gap=v122Metres(p,before.get(p.pid)||p);if(mode==='depth')depthMetres+=gap;if(mode==='follow')followMetres+=gap;}
     const completed=match.people.reduce((sum,p)=>sum+p.stats.passComplete,0),passes=match.people.reduce((sum,p)=>sum+p.stats.passes,0);
     if(completed>completedBefore){receivedAt=match.elapsed/MATCH_SPEED;completedBefore=completed;}if(passes>oldPasses&&receivedAt!==null){if(match.elapsed/MATCH_SPEED-receivedAt<.5)quickChains++;receivedAt=null;}
    }
    if(!match.finished)throw Error('Incomplete match');const total=key=>[...match.people,...match.exitedPeople].reduce((sum,p)=>sum+(p.stats[key]||0),0);
    return {seed,active,ticks,half,minutes:v65Context().state.minute,simulationSeconds:match.elapsed/MATCH_SPEED,score:match.score,passes:total('passes'),complete:total('passComplete'),progressive:total('progressive'),shots:total('shots'),depthMetres,followMetres,quickChains,result:v65Context().fixture.result};
   },{seed,active});report.matches.push(row);console.log(JSON.stringify(row));
  }
  assert(report.matches.every(m=>m.half&&m.minutes>=90&&m.simulationSeconds<210));const newMatches=report.matches.filter(m=>m.active),oldMatches=report.matches.filter(m=>!m.active);
  const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0);assert(sum(newMatches,'quickChains')>sum(oldMatches,'quickChains'));assert(sum(newMatches,'depthMetres')>200&&sum(newMatches,'followMetres')>50);
  report.checks.push('Six full seeded matches finish with halftime; faster pass chains and actual offensive/follow-up movement measured');assert.deepEqual(report.errors,[]);report.pass=true;
 }catch(e){report.pass=false;report.failure=e.stack;throw e;}
 finally{await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'native-tests.json'),JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
