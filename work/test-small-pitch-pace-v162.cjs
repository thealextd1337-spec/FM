'use strict';
// Actual native controllers in isolated browser contexts. The fixed prior
// source remains the before comparison after commits; new scores have no golden.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/3d-quality/mobile-readability/native-pace-v162.json');
process.chdir(root);
const owned=['world-offensive-quality-v157.js','world-football-flow-v159.js'],hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const baselineCommit='95db60a11c5803ac3dcbcf1487800e96ea1730a4';
const before=Object.fromEntries(owned.map(f=>[f,cp.execFileSync('git',['show',baselineCommit+':dist/'+f],{cwd:root,encoding:'utf8'})]));
const report={scope:'Summary of bounded deterministic native before/after; actual formation, roles, P02 and pass/contact controllers. Full measured P02 ledgers are validated before summarizing freshness and retaining their hashes. No hardware/FPS claim.',baselineCommit,sourceHashes:Object.fromEntries(owned.map(f=>[f,hash(fs.readFileSync('dist/'+f))])),baselineHashes:Object.fromEntries(owned.map(f=>[f,hash(before[f])])),errors:[],matches:[],components:[]};
function summarizeLoad(load){return {evidence:'summary',version:load.version,parameterId:load.parameterId,day:load.day,sequence:load.sequence,playerCount:Object.keys(load.players).length,finiteFreshnessValidated:true,players:Object.fromEntries(Object.entries(load.players).map(([id,p])=>[id,{freshness:p.freshness}])),fullLedgerSha256:hash(JSON.stringify(load))};}
async function main(){
 const server=require('./ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
 async function page(baseline){
  const context=await browser.newContext(),p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  if(baseline)for(const f of owned)await p.route('**/'+f+'*',r=>r.fulfill({body:before[f],contentType:'text/javascript'}));
  await p.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser&players=wave3`);await p.waitForFunction(()=>window.userMeshyMatchReady&&typeof v159Active==='function',null,{timeout:60000});
  return{p,close:()=>context.close()};
 }
 try{
  for(const baseline of [true,false]){
   const {p,close}=await page(baseline);
   const components=await p.evaluate(baseline=>{
    const rows=[];updateTeamStats=()=>{};draw=()=>{};v65WorldActive={state:{},career:{world:{}},fixture:{id:'controlled'}};let draws=0;Math.random=()=>{draws++;return .5;};
    const person=(pid,t,x,y,line='mid',role=0)=>({pid,t,n:pid.length,x,y,bx:x,by:y,tx:x,ty:y,assignedLine:line,line,role,positionRoutine:1,tacticalRole:line==='def'?'ball-playing-defender':line==='att'?'striker':'playmaker',instructions:[],spd:16,tec:16,pos:16,pas:16,fin:16,air:16,str:14,sta:16,gk:16,heightCm:178,fresh:100,stats:emptyStats()});
    for(const t of [0,1]){
     const dir=t===0?-1:1,y=v=>t===0?v:1-v,p=person('carrier',t,.45,y(.65)),q=person('receiver',t,.7,y(.42),'att',1),d=person('cover',t,.2,y(.78),'def',-1),r=person('blocker',1-t,.575,y(.535),'def'),k=person('keeper',1-t,.5,y(.06),'gk');k.keeper=true;const far=person('far-cover',1-t,.88,y(.30),'def');
     const m={people:[p,q,d,r,k,far],owner:p,ball:{x:p.x,y:p.y},elapsed:0,next:2,lastTouch:t,attackFlow:{version:152,qualityVersion:157,flowVersion:159,paceVersion:162,intents:{}},geometry:{version:1,fieldSize:'standard',fieldPlayers:5,width:44,length:68},teamDirect:[0,0],defenseLines:[0,0],score:[0,0],shots:[0,0],possession:[0,0],aggression:[0,0],setPieceStats:{corners:[0,0],fouls:[0,0],freeKicks:[0,0],penalties:[0,0]},goals:[],exitedPeople:[]};match=m;
     const s=v150Scale(),row={baseline,t};
     const runner=person('pace-runner',t,.4,y(.7),'att',1);m.people.push(runner);runner.tx=runner.x;runner.ty=runner.y+dir*15/s.y;m.attackFlow.intents[runner.pid]={x:runner.tx,y:runner.ty,team:t,type:'depth',until:5};
     v157Body(runner).heading=t===0?Math.PI:0;const origin={x:runner.x,y:runner.y};for(let i=0;i<10;i++){v157Move(m,runner,.05);m.elapsed+=.05*MATCH_SPEED;}row.firstHalfSecondMetres=v122Metres(runner,origin);row.speed=Math.hypot(runner.offenseMotion.vx,runner.offenseMotion.vy);
     runner.tx=runner.x;runner.ty=runner.y;for(let i=0;i<20;i++)v157Move(m,runner,.025);row.stoppedSpeed=Math.hypot(runner.offenseMotion.vx,runner.offenseMotion.vy);
     runner.offenseMotion.vx=0;runner.offenseMotion.vy=dir*5;m.attackFlow.pendingTurn={playerId:runner.pid,receiverId:q.pid,kind:'ground',until:20};m.owner=runner;let braking=0;while(Math.hypot(runner.offenseMotion.vx,runner.offenseMotion.vy)>.05&&braking++<100)v157Move(m,runner,.01);row.brakingSeconds=braking*.01;delete m.attackFlow.pendingTurn;m.owner=p;
     const passive=person('passive',t,.2,y(.8),'mid',-1);m.people.push(passive);passive.x=.75;passive.y=y(.48);const home={x:passive.bx,y:passive.by};row.recoveryStart=v122Metres(passive,home);
     for(let i=0;i<100;i++){passive.tx=m.ball.x;passive.ty=m.ball.y;v157Target(m,passive,.05);v157Move(m,passive,.05);m.elapsed+=.05*MATCH_SPEED;}row.recoveryEnd=v122Metres(passive,home);
     if(!baseline){
      m.elapsed=0;m.people=[p,q,d,r,k,far];m.attackFlow.intents={};const rngBefore=draws;
      row.highOption=v162HighOption(m,p,[q,d],[r,k,far])?.q.pid||null;row.planningDraws=draws-rngBefore;
      r.x=.88;row.openLaneHigh=v162HighOption(m,p,[q,d],[r,k,far])?.q.pid||null;r.x=.575;
      q.y=y(.02);row.offsideHigh=v162HighOption(m,p,[q,d],[r,k,far])?.q.pid||null;q.y=y(.42);
      // Face away from the available aerial outlet: the real turn-and-brake
      // guard must retain the chosen loft over the obstructed ground lane.
      v157Body(p).heading=(t===0?Math.PI:0)+Math.PI;v157Body(p).vx=1;v157Body(p).vy=dir*2;
      row.actualHighChosen=v162TryHighPass(m,p,[q,d],[r,k,far]);row.highTurnQueued=m.attackFlow.pendingTurn?.kind==='high';let turnTicks=0;while(m.attackFlow.pendingTurn&&turnTicks++<160){p.tx=p.x;p.ty=p.y;v157Move(m,p,.025);m.elapsed+=.025*MATCH_SPEED;if(!v157ContinueTurn(m,p,[r,k,far]))break;}row.highTurnTicks=turnTicks;row.actualHighFlight=!!m.flight?.aerial;row.actualHighPasses=p.stats.highPasses;let ticks=0;while(m.flight&&ticks++<160)step(.025*MATCH_SPEED,.025);row.aerialResolution={ticks,owner:m.owner?.pid||null,completed:p.stats.highComplete,lost:p.stats.passLost,free:!!m.rebound};
      m.flight=null;m.owner=p;m.ball={x:p.x,y:p.y};m.elapsed=0;m.attackFlow.intents={};v152PrepareAttack(m);row.firstOffers=Object.entries(m.attackFlow.intents).map(([id,i])=>({id,type:i.type}));m.elapsed=2*MATCH_SPEED;v152PrepareAttack(m);row.nextOffers=Object.entries(m.attackFlow.intents).map(([id,i])=>({id,type:i.type}));row.recovering=Object.keys(m.attackFlow.paceRecovery||{});
      const outlet=person('target-player',t,.18,y(.86),'att',0);outlet.tacticalRole='target-player';m.people.push(outlet);m.attackFlow.intents={};m.owner=p;m.ball={x:p.x,y:p.y};
      row.targetPlayer=[];
      for(const keeperBuild of [false,true]){
       p.keeper=keeperBuild;delete outlet.roleCoordTarget;delete outlet.offenseCoord;outlet.tx=outlet.bx;outlet.ty=outlet.by;
       const limit=p.y+dir*2/s.y;v121PositioningPlans.set(m,new Map([[outlet,{limit}]]));
       v154RoleTarget(m,outlet,.05);const activeTarget={x:outlet.tx,y:outlet.ty};v157Target(m,outlet,.05);
       row.targetPlayer.push({keeperBuild,preservedGap:v122Metres(activeTarget,{x:outlet.tx,y:outlet.ty}),offsideSafe:t===0?outlet.ty>=limit:outlet.ty<=limit,hasIntent:!!m.attackFlow.intents[outlet.pid]});
      }
      p.keeper=false;m.owner=null;m.flight=null;m.rebound=null;m.lastTouch=t;v121PositioningPlans.delete(m);delete outlet.roleCoordTarget;delete outlet.offenseCoord;outlet.tx=p.x;outlet.ty=p.y;
      const inactiveTarget={x:outlet.tx,y:outlet.ty};v154RoleTarget(m,outlet,.05);v157Target(m,outlet,.05);row.targetPlayerRecoveryGap=v122Metres(inactiveTarget,{x:outlet.tx,y:outlet.ty});row.targetPlayerRecoveryCloser=v122Metres(v162Zone(m,outlet),{x:outlet.tx,y:outlet.ty})<v122Metres(v162Zone(m,outlet),inactiveTarget);
      const old={x:d.tx,y:d.ty};m.goalPause=1;v157Target(m,d,.05);row.pausedInert=d.tx===old.x&&d.ty===old.y;
     }
     rows.push(row);
    }
    return rows;
   },baseline);report.components.push(...components);await close();
  }
  for(const config of [{seed:'pace-162-a',size:'standard',count:5},{seed:'pace-162-b',size:'standard',count:6},{seed:'pace-162-c',size:'large',count:5}])for(const baseline of [true,false]){
   const {p,close}=await page(baseline);
   const row=await p.evaluate(async({config,baseline})=>{
    let rng=12345,draws=0;Math.random=()=>{draws++;rng=(rng*1664525+1013904223)>>>0;return rng/4294967296;};Date.now=()=>1791540000000;
    const career=v61CreateCareer('GER-2',config.seed,null,{...structuredClone(D6PlayerFoundationPreviewOptions),matchConfig:{version:1,fieldSize:config.size,fieldPlayers:config.count}}),club=v66Own(career);career.world.matchConfig={version:1,fieldSize:config.size,fieldPlayers:config.count};v66ChooseSponsor(career,club.id,club.sponsors[0].id);v124SetYouthBudget(career,0);while(career.world.market.phase==='open')await v66NextMarketDay(career);
    const fixture=v62Fixtures(career).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0],state=v64MakeState(career,fixture);career.world.activeMatch={fixtureId:fixture.id,state};v61CurrentCareer=career;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);draw=()=>{};
    if(baseline)delete match.attackFlow.paceVersion;
    const d={ticks:0,path:0,burstPath:0,carryPath:0,passiveZoneSum:0,passiveSamples:0,crowdSum:0,crowdSamples:0,passTypes:{},passes:[],maxSpeed:0,half:false,actions:0,activeSeconds:0,ownerDwells:[],completedPasses:0,completedForwardPasses:0,restored:false};let ownerId=null,ownerSince=0;const releases=new Map();
    const baseAction=action;action=function(...args){d.actions++;return baseAction.apply(this,args);};
    const baseFly=fly;fly=function(target,duration,done){const a=v102Release,p=a?.person;if(p){d.passTypes[a.kind]=(d.passTypes[a.kind]||0)+1;if(['pass','highPass','cross','spacePass','header'].includes(a.kind)){const row={kind:a.kind,range:v122Metres(match.ball,target),gain:(target.y-match.ball.y)*(p.t===0?-1:1)*v150Scale().y};d.passes.push(row);releases.set(p.pid,row);}}return baseFly.call(this,target,duration,done);};
    const formations=match.people.map(p=>({pid:p.pid,cell:p.cell,line:p.assignedLine,role:p.role,tacticalRole:p.tacticalRole,bx:p.bx,by:p.by}));
    while(!match.finished&&d.ticks++<18000){const context=v65Context();if(context.state.phase==='paused'){d.half||=match.halftimePause>0;v65Resume();clearInterval(v65WorldFrame);}const positions=new Map(match.people.map(p=>[p.pid,{x:p.x,y:p.y}])),completions=new Map(match.people.map(p=>[p.pid,p.stats.passComplete])),carry=match.attackFlow.carry?.playerId;step(.05*MATCH_SPEED,.05);if(context.state.phase==='live'&&!match.finished)v65AfterStep(context);if(v65PauseRequested&&!match.flight&&!match.slide&&context.state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame);}
     for(const p of match.people)if(!p.keeper){const count=p.stats.passComplete-(completions.get(p.pid)||0);if(count>0){d.completedPasses+=count;if(releases.get(p.pid)?.gain>=3)d.completedForwardPasses+=count;}}
     const seconds=match.elapsed/MATCH_SPEED,current=match.owner&&!match.owner.keeper&&!v121PositioningPaused(match)?match.owner.pid:null;if(current!==ownerId){if(ownerId)d.ownerDwells.push(seconds-ownerSince);ownerId=current;ownerSince=seconds;}
     if(!baseline&&!d.restored&&match.elapsed>10&&!match.flight&&!match.slide&&!v121PositioningPaused(match)){const originalLive=match,flow=JSON.stringify(match.attackFlow),snapshotRandom=rng;v65Snapshot(context);if(!context.state.physicalSnapshot)throw Error('Native safe snapshot missing');context.state.physicalSnapshot=JSON.parse(JSON.stringify(context.state.physicalSnapshot));v65Restore(context);if(JSON.stringify(match.attackFlow)!==flow||rng!==snapshotRandom||match.attackFlow.paceVersion!==162)throw Error('New pace intentions do not restore exactly');match=originalLive;d.restored=true;}
     if(!v121PositioningPaused(match)){d.activeSeconds+=.05;let crowd=0;for(const p of match.people){const travelled=v122Metres(p,positions.get(p.pid)||p),speed=Math.hypot(p.offenseMotion?.vx||0,p.offenseMotion?.vy||0);d.path+=travelled;d.maxSpeed=Math.max(d.maxSpeed,speed);if(match.attackFlow.intents[p.pid]?.type==='depth'||match.attackFlow.intents[p.pid]?.type==='follow')d.burstPath+=travelled;if(p.pid===carry)d.carryPath+=travelled;if(!p.keeper&&v122Metres(p,match.ball)<4)crowd++;if(!p.keeper&&p!==match.owner&&!match.attackFlow.intents[p.pid]&&!p.interceptTarget){d.passiveZoneSum+=v122Metres(p,{x:p.bx,y:p.by});d.passiveSamples++;}}d.crowdSum+=crowd;d.crowdSamples++;}
    }
    d.ownerDwells.sort((a,b)=>a-b);const result={config,baseline,finished:match.finished,half:d.half,geometry:match.geometry,fieldCounts:[0,1].map(t=>match.people.filter(p=>p.t===t&&!p.keeper).length),formations,metrics:{...d,actionsPerMinute:d.actions*60/Math.max(1,d.activeSeconds),ownerDwellMedian:d.ownerDwells[Math.floor(d.ownerDwells.length/2)]||0,ownerDwellMean:d.ownerDwells.reduce((s,n)=>s+n,0)/Math.max(1,d.ownerDwells.length),passiveMeanMetres:d.passiveZoneSum/Math.max(1,d.passiveSamples),crowdMean:d.crowdSum/Math.max(1,d.crowdSamples)},score:[...match.score],stats:match.people.map(p=>({pid:p.pid,...p.stats})),rng,draws,load:structuredClone(state.playerLoad),checkpoint:JSON.stringify({match,continuation:v160SnapshotContinuation(match),clock:v102Clock(match)})};running=false;clearInterval(v65WorldFrame);v65WorldActive=null;match=null;return result;
   },{config,baseline});report.matches.push(row);console.log(JSON.stringify({config,baseline,finished:row.finished,score:row.score,passes:row.metrics.passTypes}));await close();
  }
  // An unmarked running match under both source versions must be byte/RNG equal.
  // The baseline native run already uses the same new creation seam with marker removed.
  for(const baseline of [true,false]){const {p,close}=await page(baseline);const result=await p.evaluate(async()=>{
   let rng=4242,draws=0;Math.random=()=>{draws++;rng=(rng*1664525+1013904223)>>>0;return rng/4294967296;};Date.now=()=>1791540000000;
   const career=v61CreateCareer('GER-2','pace-legacy-162',null,structuredClone(D6PlayerFoundationPreviewOptions)),club=v66Own(career);v66ChooseSponsor(career,club.id,club.sponsors[0].id);v124SetYouthBudget(career,0);while(career.world.market.phase==='open')await v66NextMarketDay(career);const fixture=v62Fixtures(career).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0],state=v64MakeState(career,fixture);career.world.activeMatch={fixtureId:fixture.id,state};v61CurrentCareer=career;state.phase='paused';v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);delete match.attackFlow.paceVersion;draw=()=>{};v65Resume();clearInterval(v65WorldFrame);for(let i=0;i<900;i++)step(.05*MATCH_SPEED,.05);const r={rng,draws,snapshot:JSON.stringify({match,continuation:v160SnapshotContinuation(match),clock:v102Clock(match)})};let settling=0;while((match.flight||match.slide)&&settling++<200)step(.05*MATCH_SPEED,.05);const context=v65Context();v65Snapshot(context);if(!state.physicalSnapshot)throw Error('Legacy safe snapshot missing');state.physicalSnapshot=JSON.parse(JSON.stringify(state.physicalSnapshot));v65Restore(context);r.legacyRestoreUnmarked=!Object.hasOwn(match.attackFlow,'paceVersion');if(!r.legacyRestoreUnmarked)throw Error('Restored legacy match was relabelled');running=false;clearInterval(v65WorldFrame);v65WorldActive=null;match=null;return r;
  });(report.legacy||(report.legacy=[])).push({baseline,...result});await close();}
  assert.equal(report.legacy[0].snapshot,report.legacy[1].snapshot,'Unmarked running snapshot state unchanged');assert.equal(report.legacy[0].rng,report.legacy[1].rng);assert.equal(report.legacy[0].draws,report.legacy[1].draws);
  report.legacy=report.legacy.map(({snapshot,...r})=>({...r,snapshotHash:hash(snapshot)}));report.legacyParity=true;
  for(const row of report.matches){assert(row.finished&&row.half);assert(row.fieldCounts.every(n=>n===row.config.count));assert(row.load&&Object.values(row.load.players).every(p=>Number.isFinite(p.freshness)&&p.freshness>=0&&p.freshness<=100),'Existing P02 stays authoritative');row.load=summarizeLoad(row.load);if(!row.baseline)assert(row.metrics.restored,'New intention snapshot roundtrip checked');delete row.checkpoint;}
  for(const row of report.components.filter(r=>!r.baseline)){const prior=report.components.find(r=>r.baseline&&r.t===row.t);assert(row.firstHalfSecondMetres>prior.firstHalfSecondMetres);assert(row.brakingSeconds<prior.brakingSeconds);assert(row.recoveryEnd<row.recoveryStart*.7);assert.equal(row.highOption,'receiver');assert.equal(row.openLaneHigh,null);assert.equal(row.offsideHigh,null);assert.equal(row.planningDraws,0);assert(row.highTurnQueued&&row.highTurnTicks>0&&row.actualHighChosen&&row.actualHighFlight&&row.actualHighPasses===1);assert(row.targetPlayer.every(r=>r.preservedGap<1e-9&&r.offsideSafe&&!r.hasIntent),'Actual target-player outlet survives generic recovery with and without keeper build-up');assert(row.targetPlayerRecoveryGap>0&&row.targetPlayerRecoveryCloser,'Inactive target-player returns toward its tactical zone');assert(row.pausedInert);}
  assert.deepEqual(report.errors,[]);report.pass=true;
 }catch(e){report.pass=false;report.failure=e.stack;throw e;}
 finally{await browser.close();await new Promise(r=>server.close(r));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
