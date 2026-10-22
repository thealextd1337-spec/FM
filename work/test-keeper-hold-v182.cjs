'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict'),Module=require('node:module');
const base='f2458c1fb981a68d13c50df6d4356c9fdb30a957',reviewBase='cfb8b5e7071daa1e1eb1fcab34c9fe285c168a9f',root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/keeper-hold-v182');
// Load the exact pre-fix producers into an independent VM, without touching a
// checkout or replacing movement, contact, random decisions or action clocks.
function load(baseline=false){
 const overrides={},revision=baseline===true?base:typeof baseline==='string'?baseline:null;if(revision)for(const file of ['world-physical-v65.js','world-pitch-actions-v99.js','pitch-v55.js'])overrides[file]=cp.execFileSync('git',['show',`${revision}:dist/${file}`],{cwd:root,encoding:'utf8',maxBuffer:4e6});
 const file=path.join(__dirname,'native130-harness.cjs'),source=fs.readFileSync(file,'utf8').replace("const read=file=>fs.readFileSync(path.join(root,'dist',file),'utf8');","const read=file=>overrides[file]??fs.readFileSync(path.join(root,'dist',file),'utf8');"),m={exports:{}};
 Function('require','module','exports','__dirname','overrides',source)(Module.createRequire(file),m,m.exports,__dirname,overrides);
 const h=m.exports.harness();h.ctx.KeeperPicture=h.contract.picture;
 h.run("v50Name=t=>'Team '+t;globalThis.THREE={Matrix4:class{makeScale(){return this;}},Vector3:class{}};");
 h.run(fs.readFileSync(path.join(root,'dist/player-user-ball-actions-v111.js'),'utf8'),'keeper-browser-plan');
 h.run("const keeperBrowserPlan=D6UserBallActions.create({visual:{root:{rotation:{y:0}},locomotion:{}},state:{},mesh:{},skeleton:{bones:[]},locomotion:{},actions:{}}).plan;");h.run(fixture);return h;
}
const fixture=String.raw`
globalThis.Hold182={run(seed,path,marked=false,restoreAt=-1,high=false,distant=false){
 let {k,s,dir}=Native130.reset({team:seed%2,spd:distant?1:6+seed%15,fresh:distant?20:100,diagonal:seed%3===0});
 if(marked)match.attackFlow.keeperHoldRevision=182;
 let rng=Math.imul(seed+1,2654435761)>>>0,draws=0;Math.random=()=>{draws++;rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const attacker=match.people.find(p=>p.pid==='remote'),outlet=structuredClone(attacker);Object.assign(outlet,{pid:'outlet',name:'outlet',t:k.t,x:.5+(seed%2?1:-1)*5/s.x,y:k.y+dir*(high?35:12)/s.y,bx:.5,by:high?.5:k.y+dir*12/s.y,assignedLine:high?'mid':'def',line:high?'mid':'def',stats:emptyStats()});delete outlet.offenseMotion;match.people.push(outlet);
 if(high){outlet.initialBy=k.t===0?.15:.85;outlet.bx=k.t===0?.2:.8;}
 const state=Native130.context().state;state.fresh[outlet.pid]=100;state.playerLoad.startFresh[outlet.pid]=100;state.playerLoad.players[outlet.pid]=D6Freshness.createState(outlet.pid,100);state.playerLoad.meta[outlet.pid]={stamina:12,keeper:false};
 match.setPieceStats={corners:[0,0],fouls:[0,0],freeKicks:[0,0],penalties:[0,0]};match.rebound=null;match.next=Infinity;attacker.spd=1;attacker.tec=4;attacker.gk=12;
 if(distant){match.owner=null;match.ball={x:k.x+3.7/s.x,y:k.y};}
 else if(path==='smother'){
  attacker.x=k.x+(seed%2?1:-1)*.3/s.x;attacker.y=k.y+dir*1.1/s.y;attacker.bx=attacker.x;attacker.by=attacker.y;match.owner=attacker;match.ball=v101KickPoint(attacker,k);
 }else if(path==='run-out'){
  const passer=match.people.find(p=>p.pid==='passer');passer.x=k.x+(seed%2?1:-1)*6/s.x;passer.y=k.y+dir*7/s.y;match.owner=passer;match.ball={x:passer.x,y:passer.y};match.attackFlow.releaseGuard=passer.pid;v150SpacePass(passer,{target:{x:k.x+(seed%3-1)*.5/s.x,y:k.y+dir*.25/s.y}});delete match.attackFlow.releaseGuard;
 }else{
  // Real shot decision, execution and contact: lateral trajectories distinguish
  // diving saves from the centrally positioned regular save.
  k.gk=20;k.pos=20;k.y=(k.t===0?v55Field.bottom:v55Field.top)+dir*.65/s.y;k.by=k.y;k.ty=k.y;attacker.fin=8+seed%10;attacker.tec=12;attacker.x=.5+(path==='dive'?(seed%2?1:-1)*5:0)/s.x;attacker.y=k.y+dir*(path==='save'?26:12)/s.y;match.owner=attacker;match.ball={x:attacker.x,y:attacker.y};match.attackFlow.releaseGuard=attacker.pid;v55Shoot(attacker);delete match.attackFlow.releaseGuard;
 }
 const sample=()=>{const a=v99PlayerAction(match,k),frame=v98PitchFrame(match),person=frame.players.find(p=>p.id===k.pid),plan=keeperBrowserPlan(person,frame),bridge=KeeperPicture(frame,'keeper-hold-qa',1,{position:{x:0,z:25},target:{x:0,z:0},fov:42},'paused',[0,0]).players.find(p=>p.id===k.pid);return {at:v102Clock(match),elapsed:match.elapsed,pace:v157Pace(match,k),keeper:{x:k.x,y:k.y},native:{...match.ball},view:{...(v99BallView(match)||match.ball)},phase:v99Actions.get(match)?.kicks.get(k.pid)?.phase||null,owner:match.owner?.pid||null,flight:!!match.flight,high:!!(match.flight&&v102Flights.get(match.flight)?.high),releaseOrigin:match.flight?{x:match.flight.x,y:match.flight.y,view:v99Flights.get(match.flight)?.start}:null,action:a&&{...a,target:a.target&&{x:a.target.x,y:a.target.y}},browser:plan&&{mode:plan.mode,hold:!!plan.hold,transfer:plan.transfer},bridge:{action:bridge.action,holding:bridge.holding,progress:bridge.progress,recovery:bridge.recovery}};};
 let heldAt=null,contact=null,holdBefore=null,holdAfter=null;const original=v50GoalKick;
 v50GoalKick=function(...args){const incoming=v109IncomingFlight?.current===match?v109IncomingFlight.flight:match.flight,release=incoming&&v99Flights.get(incoming),challenge=v115KeeperChallenges.get(match);const held=Boolean(args[2]?.held||release?.onTarget);if(held&&heldAt===null){heldAt=v102Clock(match);contact=challenge?.caught?{...challenge.contact}:release?v101ShotPoint(release,1):{...match.ball};holdBefore=sample();}const result=original(...args);if(held&&holdAfter===null)holdAfter=sample();return result;};
 const trace=[];let restored=false;
 try{if(distant){v115KeeperChallenges.set(match,{keeper:k,attacker:null,start:{x:k.x,y:k.y},end:{x:k.x,y:k.y},contact:{...match.ball},at:v102Clock(match),duration:.55,caught:true,checked:true,pickup:false});v50GoalKick(k,'already confirmed distant-contact boundary',{held:true});}for(let tick=0;tick<280;tick++){
   Native130.advance(.025);if(match.goalPause>0||match.pendingKickoff!=null||match.setPiece||match.throwIn)break;if(heldAt===null){if(['dive','save'].includes(path)&&!match.flight)break;continue;}trace.push(sample());
   if(restoreAt>=0&&!restored&&v102Clock(match)-heldAt>=restoreAt&&!match.flight){v65Snapshot(Native130.context());Native130.context().state.physicalSnapshot=JSON.parse(JSON.stringify(Native130.context().state.physicalSnapshot));v65Restore(Native130.context());k=match.people.find(p=>p.pid==='keeper');restored=true;}
   if(trace.at(-1).phase==='follow'||match.flight||match.owner!==k)break;
 }}finally{v50GoalKick=original;}
 return {seed,path,marked,held:heldAt!==null,heldAt,contact,holdBefore,holdAfter,trace,restored,releaseAt:trace.at(-1)?.phase==='follow'?trace.at(-1).at:null,pace:v157Pace(match,k),scale:s,rng,draws,state:Native130.state()};
}};`;
function measure(rows){
 const summary={};for(const key of ['smother','run-out','dive','save'])summary[key]={attempts:0,held:0,keeper:{count:0,min:null,max:0},native:{count:0,min:null,max:0},view:{count:0,min:null,max:0},view3d:{count:0,min:null,max:0},release:{count:0,min:null,max:0}};
 for(const r of rows){const q=summary[r.path];q.attempts++;if(!r.held)continue;q.held++;const metres=(a,b)=>Math.hypot((a.x-b.x)*r.scale.x,(a.y-b.y)*r.scale.y),jump=(kind,d,limit)=>{if(d>limit+1e-8){q[kind].count++;q[kind].min=Math.min(q[kind].min??Infinity,d);q[kind].max=Math.max(q[kind].max,d);}};
  const samples=[r.holdAfter,...r.trace];for(let i=1;i<samples.length;i++){const a=samples[i-1],b=samples[i];if(b.phase!=='waiting')continue;const limit=Math.min(a.pace,b.pace)*(b.at-a.at);for(const kind of ['keeper','native','view'])jump(kind,metres(a[kind],b[kind]),limit);jump('view3d',Math.hypot(metres(a.view,b.view),(a.view.elevation??.29)-(b.view.elevation??.29)),limit);}
  const release=r.trace.at(-1);if(release?.phase==='follow'){const previous=r.trace.at(-2)||r.holdAfter; // Flight travel is physical; compare the release origin itself, separately.
   jump('release',metres(previous.view,release.releaseOrigin.view||release.releaseOrigin),r.pace*(release.at-previous.at));
  }
 }return summary;
}
const seeds=Number(process.env.D6_HOLD_SEEDS||128),before=load(true),after=load(false),rows={before:[],after:[]},checks=[];
for(const seed of Array.from({length:seeds},(_,i)=>i))for(const kind of ['smother','run-out','dive','save']){
 const old=before.copy(before.call('Hold182.run',seed,kind,false)),fresh=after.copy(after.call('Hold182.run',seed,kind,true));rows.before.push(old);rows.after.push(fresh);
 if(!process.argv.includes('--measure-only')){const legacy=after.copy(after.call('Hold182.run',seed,kind,false));assert.deepEqual(legacy,old,`Unmarked match byte-identical: ${seed}/${kind}`);}
}
const report={base,seeds,scenarios:seeds*4,dt:.025,threshold:'actual keeper pace * dt; horizontal metres (view3d includes elevation)',before:measure(rows.before),after:measure(rows.after)};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'traces.json'),JSON.stringify(rows)+'\n');
if(!process.argv.includes('--measure-only')){
 for(const q of Object.values(report.after))for(const kind of ['keeper','native','view','view3d','release'])assert.equal(q[kind].count,0,`${kind} has no held-ball discontinuities`);
 checks.push('Every unmarked scenario byte-identical to exact pre-fix native state, RNG and projection');
 for(let i=0;i<rows.after.length;i++){const old=rows.before[i],fresh=rows.after[i];assert.equal(fresh.held,old.held,'No earlier or additional catches');assert.equal(fresh.heldAt,old.heldAt,'Identical catch-confirmation tick');assert.equal(fresh.releaseAt,old.releaseAt,'Unchanged goal-kick tick');assert.equal(fresh.draws,old.draws,'No new random decision');}
 checks.push('Catch facts, random draws and 2.4-second release schedule preserved');
 const poseChecks={recoveryFrames:0,holdingFrames:0,transferFrames:0};
 for(let i=0;i<rows.after.length;i++){
  const fresh=rows.after[i],old=rows.before[i];if(!fresh.held)continue;
  for(let j=0;j<fresh.trace.length;j++){
   const sample=fresh.trace[j],previous=old.trace[j];
   if(previous?.action?.kind==='save'&&previous.phase==='waiting'&&previous.owner==='keeper'){
    assert.equal(sample.action?.kind,'save',`Catch/recovery retained ${fresh.seed}/${fresh.path}/${j}`);
    for(const key of ['id','progress','recovery','target','origin','height','available','saved','parry','goal','smother'])assert.deepEqual(sample.action[key],previous.action[key],`Original save fact ${key}`);
    assert.equal(sample.action.holding,true,'Confirmed recovering keeper keeps the ball in his gloves');assert(sample.browser.hold,'Real browser recovery plan retains the grip');poseChecks.recoveryFrames++;
   }
   if(sample.action?.kind==='goalKick'&&sample.phase==='waiting'){
    assert.equal(sample.action.holding,sample.browser.hold||sample.browser.transfer===0,'Hand grip changes at the real browser hand-to-foot transfer');
    if(sample.action.holding)poseChecks.holdingFrames++;else poseChecks.transferFrames++;
   }
   // WorldViewContract.Validate accepts holding only on a throw-in; any other carrier made Unity fall back to 2D (R133).
   assert.equal(sample.bridge.holding,sample.action.kind==='throw'?sample.action.holding:undefined,'Production Unity bridge sends holding only for a throw-in (WorldViewContract)');
   assert.equal(sample.bridge.action,sample.action.kind,'Production Unity bridge preserves the same pose');
   if(sample.phase==='waiting'){assert.deepEqual(sample.native,sample.view,'Ball authority and projected position stay together during recovery/placement');}
   if(sample.phase==='follow')assert.equal(sample.action.holding,false,'Hand grip released on actual outgoing flight');
  }
 }
 assert(poseChecks.recoveryFrames>0&&poseChecks.holdingFrames>0&&poseChecks.transferFrames>0);report.poseChecks=poseChecks;
 checks.push('Original catch/recovery actions retained; explicit holding agrees with the hand-to-foot phase; the Unity picture carries it only for a throw-in');
 const reviewed=load(reviewBase);report.reviewRound1={base:reviewBase,cases:[]};
 for(const kind of ['smother','run-out','dive','save','distant-recovery']){
  const distant=kind==='distant-recovery',path=distant?'smother':kind,fresh=distant?after.copy(after.call('Hold182.run',0,path,true,-1,false,true)):rows.after.find(r=>r.path===path&&r.held&&r.releaseAt),prior=reviewed.copy(reviewed.call('Hold182.run',fresh.seed,path,true,-1,false,distant));
  assert.equal(prior.state,fresh.state,'Review fixes preserve complete native state, RNG and saved clocks');
  assert.equal(prior.heldAt,fresh.heldAt);assert.equal(prior.releaseAt,fresh.releaseAt);
  const original=distant?before.copy(before.call('Hold182.run',fresh.seed,path,false,-1,false,true)):rows.before.find(r=>r.seed===fresh.seed&&r.path===path);
  let premature=0,wrongHolding=0;for(let j=0;j<fresh.trace.length;j++){
   const a=prior.trace[j],b=fresh.trace[j];for(const key of ['at','elapsed','native','view','keeper','releaseOrigin'])assert.deepEqual(a[key],b[key],`Review fixes preserve ball/body fact ${key}`);
   if(original.trace[j]?.action?.kind==='save'&&original.trace[j].phase==='waiting')assert.equal(b.action.kind,'save','Distant boundary also retains the original recovery');
   assert.equal(b.action.holding,b.browser.hold||b.browser.transfer===0,'Review boundary grip agrees with the real browser pose');assert.equal(b.bridge.holding,b.action.kind==='throw'?b.action.holding:undefined);
   if(a.action?.kind==='goalKick'&&b.action?.kind==='save')premature++;
   if(a.action?.holding===false&&(a.browser?.hold||a.browser?.transfer===0))wrongHolding++;
  }
  report.reviewRound1.cases.push({path:kind,seed:fresh.seed,prematureGoalKickBefore:premature,prematureGoalKickAfter:0,handFlagMismatchBefore:wrongHolding,handFlagMismatchAfter:0});
 }
 assert(report.reviewRound1.cases.some(r=>r.prematureGoalKickBefore>0));assert(report.reviewRound1.cases.some(r=>r.handFlagMismatchBefore>0));
 checks.push('Both review findings reproduced against the reviewed commit; corrected without changing any ball/body step or native state');
 for(const kind of ['smother','run-out','dive','save']){
  const r=rows.after.find(r=>r.path===kind&&r.held&&r.releaseAt);assert(r,`Confirmed ${kind} path reaches release`);
  for(const at of [.1,1.9]){const restored=after.copy(after.call('Hold182.run',r.seed,kind,true,at));assert(restored.restored);assert.equal(restored.state,r.state,`${kind} JSON checkpoint continuation at ${at}`);assert.deepEqual(restored.trace,r.trace,`${kind} JSON position/projection continuity at ${at}`);}
 }
 checks.push('Eight JSON checkpoints during holding/placement preserve native state, clock, projection and RNG');
 const flags=after.copy(after.evaluate(`(()=>{let marker;const create=v65CreateMatch;v65CreateMatch=function(...args){const r=create(...args);marker=match.attackFlow.keeperHoldRevision;return r;};const result=Native130.createAndRestoreFlag();v65CreateMatch=create;return {...result,hold:marker,restoredHoldAbsent:!Object.hasOwn(match.attackFlow,'keeperHoldRevision')};})()`));
 assert.equal(flags.hold,182);assert.equal(flags.created.keeper,180);assert.equal(flags.created.pace,119);assert(flags.restoredHoldAbsent);checks.push('Constructor sets only new hold marker; old JSON restore adds no marker; keeper180/pace119 retained');
 for(const kind of ['smother','run-out']){
  const r=rows.after.find(r=>r.path===kind&&r.held&&r.releaseAt),high=after.copy(after.call('Hold182.run',r.seed,kind,true,-1,true));assert(high.trace.at(-1)?.high,'Real high outlet chosen');assert(high.releaseAt);for(const value of Object.values(measure([high])))for(const key of ['keeper','native','view','view3d','release'])assert.equal(value[key].count,0,`High goal kick ${key}`);
  const legacy=after.copy(after.call('Hold182.run',r.seed,kind,false,-1,true)),old=before.copy(before.call('Hold182.run',r.seed,kind,false,-1,true));assert.deepEqual(legacy,old,'Unmarked high outlet byte-identical');
 }
 checks.push('Short and high outlets have continuous actual release origins; unmarked high path byte-identical');
 const guards=after.copy(after.evaluate(`(()=>{const {k}=Native130.reset();match.attackFlow.keeperHoldRevision=182;match.rebound=null;v50GoalKick(k,'unconfirmed fixture');const empty=v182KeeperHold(match);v50GoalKick(k,'confirmed fixture',{held:true});const held=v182KeeperHold(match);match.owner=match.people.find(p=>!p.keeper);const lost=v182KeeperHold(match);return {empty,held:!!held,lost};})()`));assert.equal(guards.empty,null);assert(guards.held);assert.equal(guards.lost,null);checks.push('Unconfirmed goal kick/possession loss cannot create or retain a hand hold');
 report.extremePlacement=after.copy(after.evaluate(`(()=>{const rows=[];for(const team of [0,1])for(const size of ['standard','large']){const {k,s}=Native130.reset({team,size,spd:1,fresh:20});match.rebound=null;match.attackFlow.keeperHoldRevision=182;const start={x:k.x,y:k.y},contact={x:k.x+3.7/s.x,y:k.y};v115KeeperChallenges.set(match,{keeper:k,attacker:null,start:{x:k.x,y:k.y},end:{x:k.x,y:k.y},contact,at:v102Clock(match),duration:.55,caught:true,checked:true,pickup:false});v50GoalKick(k,'already confirmed distant-contact boundary',{held:true});const kick=v99Actions.get(match).kicks.get(k.pid),duration=(match.next-match.elapsed)/MATCH_SPEED;let before={...v182KeeperHold(match)},maxSpeed=0,minPace=Infinity;for(let i=0;i<Math.ceil(duration/.025);i++){Native130.advance(.025);const point=v182KeeperHold(match);if(!point)break;const speed=Math.hypot(v122Metres(before,point),(before.elevation??.29)-(point.elevation??.29))/.025;maxSpeed=Math.max(maxSpeed,speed);minPace=Math.min(minPace,v157Pace(match,k));before=point;}rows.push({team,size,duration,maxSpeed,minPace,keeperTravel:v122Metres(start,k),remaining:v122Metres(before,kick.kickPoint)});}return rows;})()`));
 for(const r of report.extremePlacement){assert(r.duration>2.4);assert(r.maxSpeed<=r.minPace+1e-7);assert(r.remaining<1e-7);assert.equal(r.keeperTravel,0);}
 checks.push('Four tired-keeper/distant confirmed-contact boundaries extend only physical placement time, never exceed keeper pace');
 const contact=after.copy(after.evaluate(`(()=>{const {k,s}=Native130.reset();match.rebound=null;match.attackFlow.keeperHoldRevision=182;const old={x:k.x+3/s.x,y:k.y},point={x:k.x-.5/s.x,y:k.y},f={x:k.x,y:k.y-.1,duration:MATCH_SPEED,progress:1,target:point};v115KeeperChallenges.set(match,{keeper:k,caught:true,contact:old});v99Flights.set(f,{kind:'shot',keeper:k,onTarget:true,flight:f,target:point,keeperStart:{x:k.x,y:k.y},startHeight:.29,endHeight:1.35});v109IncomingFlight={current:match,flight:f};try{match.flight=null;v50GoalKick(k,'confirmed shot after old pickup');return {actual:v99Actions.get(match).kicks.get(k.pid).holdPoint,point};}finally{v109IncomingFlight=null;}})()`));assert.equal(contact.actual.x,contact.point.x);assert.equal(contact.actual.y,contact.point.y);assert(Math.abs(contact.actual.elevation-1.35)<1e-9);checks.push('A fresh shot catch uses its own contact even after a previous pickup/smother');
 const loose=after.copy(after.evaluate(`(()=>{const {k}=Native130.reset();match.rebound=null;match.attackFlow.keeperHoldRevision=182;v102State(match).loose={at:0,start:{x:.8,y:.5},target:{x:.7,y:.6},duration:1,drop:true,startHeight:2.65,owner:null};v50GoalKick(k,'already confirmed keeper pickup',{held:true});return {oldLoose:v102State(match).loose,actual:v99BallView(match),held:v182KeeperHold(match)};})()`));assert.equal(loose.oldLoose,null);assert.deepEqual(loose.actual,loose.held);checks.push('A confirmed hold cancels the previous loose/control projection immediately');
}
Object.assign(report,{pass:!process.argv.includes('--measure-only'),checks,sourceHashes:Object.fromEntries(['dist/world-physical-v65.js','dist/world-pitch-actions-v99.js','dist/player-user-ball-actions-v111.js','dist/world-unity-v151.js','work/test-keeper-hold-v182.cjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]))});
fs.writeFileSync(path.join(out,'measurement.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
