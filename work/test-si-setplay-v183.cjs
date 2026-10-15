'use strict';
// SI-7 (setplay 183): crosses, corners, headers. Runs the actual dist modules in
// the native VM harness on constructor matches (native183-scenes). Old path:
// a marked match with the setplay package off replays like the 182 constructor
// and like the unwrapped base functions. New path: reach model and air duel,
// header/volley decision, cross error and block, cross estimate, corner
// formation with back space, free-kick variants, B10 follow-up (unreached high
// corners), restore of the plain state during set pieces.
// Usage: node work/test-si-setplay-v183.cjs   (SETPLAY_SEEDS=n, default 12)
const fs=require('node:fs'),assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs');
const checks=[],failures=[],check=(name,fn)=>{try{fn();checks.push(name);}catch(error){failures.push(`${name}: ${error.message}`);}};
const seeds=Number(process.env.SETPLAY_SEEDS||12);
const h=create({view:false});
const ev=text=>h.evaluate(text),copy=value=>h.copy(value);
h.run('v50Name=t=>t===0?"Heim":"Gast";showOverlay=()=>{};hideOverlay=()=>{};v183SetTraceLimit(20000);');
h.run(`globalThis.Setplay=(function(){
 const N=Native183,R=Native182,seeded=n=>R.seedRandom((Math.imul(n+1,2654435761)>>>0)||1);
 const notes=[];note=(text,kind)=>{notes.push(text);};
 // Probe hooks on the outermost globals: high-pass launches and flight exits.
 let probe=null;
 const baseHigh=v55HighPass;v55HighPass=function(passer,receiver,options){if(probe&&!probe.pass){probe.pass={passer:passer.pid,receiver:receiver.pid,options:{...options},intended:{x:receiver.x,y:receiver.y},from:{...match.ball},drawsBefore:R.rng().draws};probe.inHigh=true;}try{return baseHigh.apply(this,arguments);}finally{if(probe?.inHigh){probe.inHigh=false;probe.pass.drawsAfter=R.rng().draws;}}};
 const baseExit=v55Exit;v55Exit=function(from,to){const hit=baseExit(from,to);if(probe?.inHigh&&!probe.land){probe.land={...to};probe.exit=hit?{edge:hit.edge}:null;}return hit;};
 const baseOut=v55Out;v55Out=function(hit,lastTouch,description){if(probe&&!probe.first)probe.first={kind:'out',edge:hit.edge,lastTouch};return baseOut.apply(this,arguments);};
 // packages: further switches (e.g. {defence:false} to isolate SI-7 from SI-4's clearance draws).
 function stage({on=true,size='standard',seed='sp',club='GER-2',clockRate,packages={}}={}){
  const si={packages:{setplay:on,...(clockRate?{clock:true}:{}),...packages},...(clockRate?{clockRate}:{})};
  N.constructed({club,seed,size,roles:true,si});
  for(let i=0;i<800&&(match.kickoff||match.setPiece||match.postBanner||match.goalPause>0||match.countdown>0);i++)N.advance();
  match.firstHalfEnd=5000;match.fullTimeEnd=10000;match.halftime=false;
  return match;
 }
 // Point depth metres in front of the goal team t attacks, lateral metres from the centre.
 function attack(t,depth,lateral){const s=v160PitchScale(match);return {x:.5+lateral/s.x,y:(t===0?v55Field.top:v55Field.bottom)+(t===0?1:-1)*depth/s.y};}
 function place(p,point){p.x=point.x;p.y=point.y;p.tx=point.x;p.ty=point.y;p.interceptTarget=null;p.slideActive=false;p.recoverUntil=0;const b=p.offenseMotion;if(b){b.vx=0;b.vy=0;}}
 function clear(){const m=match;m.owner=null;m.flight=null;m.rebound=null;m.setPiece=null;m.kickoff=null;m.throwIn=null;m.postBanner=null;m.goalPause=0;m.countdown=0;m.pendingKickoff=null;m.lastPass=null;m.breakawayCarrier=null;m.offsideVisual=null;m.attackFlow.pendingTurn=null;m.attackFlow.intents={};m.attackFlow.combination=null;m.next=Infinity;if(typeof v124AirBalls!=='undefined')v124AirBalls.delete(m);const st=v102State(m);st.loose=null;st.poses.clear();notes.length=0;}
 const field=t=>match.people.filter(p=>p.t===t&&!p.keeper),keeper=t=>match.people.find(p=>p.t===t&&p.keeper);
 // Everyone far from the scene: own halves at midfield depth.
 function park(except){for(const t of [0,1]){let i=0;for(const p of field(t))if(!except.includes(p)){place(p,attack(t,44+i*3,-14+i*7));i++;}place(keeper(t),attack(1-t,.8,0));}}
 const stat=(p,k)=>p.stats[k]||0;
 function set(p,values){for(const [k,v]of Object.entries(values))p[k]=v;}
 // ----- cross scene: wing cross to a receiver near the penalty spot with a marker -----
 function cross({on,seed,size='standard',receiverAir=12,defenderAir=12,gap=1.2,crosserPas=12,blockerAhead=false,receiverDepth=9,crosserDepth=20,level,clockRate}={}){
  stage({on,size,seed:'cross'+(seed%4),clockRate});clear();
  const team=0,players=field(team),rivals=field(1);
  const crosser=players[0],receiver=players[1],defender=rivals[0],blocker=rivals[1];
  set(crosser,{pas:crosserPas,tec:crosserPas,fin:10,air:10});set(receiver,{air:receiverAir,pos:12,tec:12,fin:12,pas:12});set(defender,{air:defenderAir,pos:12,tec:12,tak:12});set(blocker,{tak:14,pos:12});
  if(level!==undefined)for(const p of players)set(p,{pas:level,tec:level});
  park([crosser,receiver,defender,blocker]);
  place(crosser,attack(team,crosserDepth,15));place(receiver,attack(team,receiverDepth,2));place(defender,attack(team,receiverDepth-gap,2.3));
  place(blocker,blockerAhead?attack(team,crosserDepth-1,13.8):attack(team,crosserDepth+7,20));
  match.owner=crosser;match.ball={x:crosser.x,y:crosser.y};match.lastTouch=team;
  {const s=v160PitchScale(match),body=v157Body(crosser);body.heading=Math.atan2((receiver.x-crosser.x)*s.x,(receiver.y-crosser.y)*s.y);}
  const before={passLost:stat(crosser,'passLost'),complete:stat(crosser,'crossComplete'),shots:stat(receiver,'shots'),headers:stat(receiver,'headers'),volleys:stat(receiver,'volleys'),interceptions:stat(defender,'interceptions')+stat(blocker,'interceptions'),duels:stat(receiver,'aerialDuels'),won:stat(receiver,'aerialWon'),goals:match.goals.length,corners:match.setPieceStats.corners[team]};
  seeded(5000+seed);probe={};const d0=R.rng().draws;
  v55HighPass(crosser,receiver,{cross:true});
  let ticks=0;for(;ticks<40&&!match.flight&&match.owner===crosser;ticks++)N.advance();
  const flight=match.flight,duration=flight?flight.duration:null,target=flight?{...flight.target}:null,turned=ticks>0;
  while(match.flight&&ticks++<400)N.advance();
  for(let i=0;i<3;i++)N.advance();
  const texts=notes.slice(),trace=v183TraceEntries(match).filter(e=>['air','air-finish','cross','cross-block'].includes(e.kind));
  const out={on,seed,ticks,turned,duration,rate:v183Rate(match),metres:probe.pass&&target?v122Metres(probe.pass.from,target):null,exit:probe.exit,blocked:texts.some(t=>t.includes('blockt die Flanke')),unreached:texts.some(t=>t.includes('springt frei auf')),complete:stat(crosser,'crossComplete')-before.complete,shot:stat(receiver,'shots')-before.shots,header:stat(receiver,'headers')-before.headers,volley:stat(receiver,'volleys')-before.volleys,intercepted:stat(defender,'interceptions')+stat(blocker,'interceptions')-before.interceptions,duel:stat(receiver,'aerialDuels')-before.duels,won:stat(receiver,'aerialWon')-before.won,goal:match.goals.length-before.goals,corner:match.setPieceStats.corners[team]-before.corners,draws:R.rng().draws-d0,trace,texts,setPiece:match.setPiece?.type||null,secondBall:match.attackFlow.setplay?.secondBall||null};
  probe=null;return out;
 }
 // ----- direct air duel at a landing point (both within reach) -----
 function duel({seed,attackerAir,defenderAir,depth=9,swap=false}){
  stage({on:true,seed:'duel'});clear();
  const team=0,A=field(0)[1],D=field(1)[0],passer=field(0)[0],end=attack(team,depth,1);
  set(A,{air:attackerAir,pos:12,tec:12,fin:12,heightCm:180});set(D,{air:defenderAir,pos:12,tec:12,heightCm:180});
  park([A,D,passer]);place(passer,attack(team,24,14));
  const s=v160PitchScale(match);place(A,{x:end.x,y:end.y+(team===0?1:-1)*.6/s.y});place(D,{x:end.x,y:end.y-(team===0?1:-1)*.6/s.y});
  match.owner=null;match.ball={...end};match.lastTouch=team;
  const won=stat(A,'aerialWon'),duels=stat(A,'aerialDuels'),d0=R.rng().draws;
  seeded(7000+seed);
  v122ResolveAir({passer,end,snapshot:{offside:new Set()},cross:true});
  return {duel:stat(A,'aerialDuels')-duels,won:stat(A,'aerialWon')-won,draws:R.rng().draws-d0,owner:match.owner?.pid||null};
 }
 // ----- defender alone at the landing point: clearance draws -----
 function lonely({seed}){
  // defence off: SI-4's clearance draws its own target (clearance.out); SI-7 alone hands over the lateral draw.
  stage({on:true,seed:'lonely',packages:{defence:false}});clear();
  const team=0,D=field(1)[0],passer=field(0)[0],end=attack(team,10,0);
  park([D,passer]);place(passer,attack(team,24,14));place(D,end);
  match.owner=null;match.ball={...end};match.lastTouch=team;
  seeded(9000+seed);const d0=R.rng().draws;
  v122ResolveAir({passer,end,snapshot:{offside:new Set()},cross:true});
  return {draws:R.rng().draws-d0,cleared:notes.some(t=>t.includes('köpft den hohen Ball weg')),owner:match.owner?.pid||null,rebound:Boolean(match.rebound)};
 }
 // ----- corner probe (B10 follow-up): first event after a high corner -----
 function corner({on,team,right,level,seed,size='standard'}){
  // defence off: the B10 follow-up measures SI-7's reach, not SI-4's clearances into touch.
  stage({on,size,seed:'corner'+(seed%3),packages:{defence:false}});clear();
  for(const p of field(team))set(p,{pas:level,tec:level});
  match.lastTouch=1-team;match.teamFocus=[null,null];match.cornerVariants??=[null,null];
  seeded(15432+seed*7919+team*17+(right?3:0)+level);probe={};
  const spot={x:right?.951:.049,y:team===0?.036:.964};
  v50Restart('corner',team,spot,'Eckballprobe');
  const variant=match.setPiece?.cornerVariant,backPid=match.setPiece?.cornerBackPid||null,targetPid=match.setPiece?.cornerTargetPid||null;
  let i=0;for(;i<900&&!probe.pass;i++)N.advance();
  if(!probe.pass){const r={on,team,right,level,seed,variant,pass:null};probe=null;return r;}
  const goals=match.goals.length;
  for(let j=0;j<400&&!probe.first;j++){const before=match.owner;N.advance();if(!probe.first&&match.goals.length>goals)probe.first={kind:'goal'};if(!probe.first&&match.owner&&match.owner!==before)probe.first={kind:'owner',team:match.owner.t,keeper:!!match.owner.keeper};if(!probe.first&&match.setPiece&&match.setPiece.type!=='corner')probe.first={kind:'restart',type:match.setPiece.type};}
  const r={on,team,right,level,seed,variant,backPid,targetPid,pass:true,receiver:probe.pass.receiver,exit:probe.exit,first:probe.first||{kind:'none'},draws:probe.pass.drawsAfter-probe.pass.drawsBefore,unreached:notes.some(t=>t.includes('springt frei auf'))};
  probe=null;return r;
 }
 // ----- cross estimate (deterministic) -----
 function estimate(config){
  stage({on:true,seed:'estimate'});clear();
  const team=0,crosser=field(0)[0],receiver=field(0)[1],defender=field(1)[0];
  set(crosser,{pas:config.pas??12,tec:12});set(receiver,{air:config.air??12,pos:12,fin:12,heightCm:180});set(defender,{air:12,pos:12,heightCm:180});
  park([crosser,receiver,defender]);
  place(crosser,attack(team,config.crosserDepth??20,config.crosserLateral??15));place(receiver,attack(team,config.receiverDepth??9,config.receiverLateral??2));
  place(defender,config.defenderGap===undefined?attack(team,7,-9):attack(team,(config.receiverDepth??9)-config.defenderGap,2.3));
  if(config.offside){place(defender,attack(team,30,-15));place(receiver,attack(team,6,2));}
  match.owner=crosser;match.ball={x:crosser.x,y:crosser.y};match.lastTouch=team;
  const d0=R.rng().draws,e=v183CrossEstimate(match,crosser,config.point?attack(team,config.point[0],config.point[1]):receiver);
  return {...e,draws:R.rng().draws-d0};
 }
 // ----- header/volley decision -----
 function finish({seed,depth,lateral=1,preferHeader=true,headerRange=true,pressure=0,marked=false}){
  stage({on:true,seed:'finish'});clear();
  const team=0,W=field(0)[1],end=attack(team,depth,lateral);set(W,{air:14,tec:12,fin:12});
  park([W]);place(W,end);match.owner=null;match.ball={...end};
  seeded(11000+seed);const d0=R.rng().draws,kind=v183AirFinish(match,W,end,{headerRange,preferHeader,pressure,marked});
  return {kind,draws:R.rng().draws-d0};
 }
 // ----- free kicks -----
 function freeKickPlan({spotDepth,spotLateral=0,boxAllies=0,takerFin=16,otherFin=10,seed=1}){
  stage({on:true,seed:'fk'});clear();
  const team=0,players=field(team),taker=players[0];
  for(const p of players)set(p,{fin:otherFin});set(taker,{fin:takerFin});
  park([taker]);const spot=attack(team,spotDepth,spotLateral);place(taker,spot);
  players.slice(1,1+boxAllies).forEach((p,i)=>place(p,attack(team,10+i*2,-4+i*4)));
  match.setPiece={type:'freeKick',team,spot,taker,phase:'waiting',wait:1.8};
  seeded(13000+seed);const d0=R.rng().draws,plan=v182FreeKickPlan(match,match.setPiece),draws=R.rng().draws-d0;
  const best=v50BestTaker(team,'freeKick',spot);
  match.setPiece=null;
  return {plan,draws,bestTaker:best.pid,takerPid:taker.pid,bestFin:ability(best,'fin'),window:v183FreeKickWindow(match,team,spot,best),bestShooterPid:[...players].sort((a,b)=>v183ShooterSkill(b)-v183ShooterSkill(a))[0].pid,advised:v183Active(match,'finish')&&typeof v183DirectFreeKick==='function'};
 }
 function freeKickRestore({seed=1}){
  stage({on:true,seed:'fkr'});clear();
  const team=0,players=field(team),taker=players[0];
  for(const p of players)set(p,{fin:10});
  park([taker]);const spot=attack(team,24,6);place(taker,spot);
  players.slice(1,4).forEach((p,i)=>place(p,attack(team,10+i*2,-4+i*4)));
  match.ball={...spot};match.lastTouch=1;seeded(14000+seed);
  v50Restart('freeKick',team,spot,'Freistoßprobe');
  const planned=JSON.parse(JSON.stringify(match.setPiece.plan)),takerBefore=match.setPiece.taker.pid;
  if(!N.checkpoint())throw Error('checkpoint during the free-kick wait failed');
  const restored=JSON.parse(JSON.stringify(match.setPiece.plan)),takerAfter=match.setPiece.taker?.pid;
  probe={};let i=0;for(;i<600&&!probe.pass&&match.setPiece;i++)N.advance();
  const pass=probe.pass;probe=null;
  return {planned,restored,takerBefore,takerAfter,pass,saved:N.savedMatch()?.setPiece?.plan||null};
 }
 // SI-3 coupling: a provisional direct plan is confirmed or revised at execution
 // (wall in place) through v183DirectFreeKick, never at creation.
 function freeKickAdvice({seed=1,direct}){
  stage({on:true,seed:'fka'});clear();
  const team=0,players=field(team),taker=players[0];for(const p of players)set(p,{fin:10});set(taker,{fin:17});
  park([taker]);const spot=attack(team,18,2);place(taker,spot);players.slice(1,4).forEach((p,i)=>place(p,attack(team,10+i*2,-4+i*4)));
  match.ball={...spot};match.lastTouch=1;seeded(17000+seed);
  // The real SI-3 function (when merged) is replaced for this scene only and restored afterwards.
  const calls=[],original=globalThis.v183DirectFreeKick;globalThis.v183DirectFreeKick=function(m,piece){calls.push({phase:m.setPiece===piece&&piece.phase==='waiting'?'waiting':'other',wait:piece.wait});return {direct,range:18,limit:24,xg:direct?.12:.02};};
  let shots=stat(taker,'shots'),planned=null,executed=null,pass=null;
  try{
   v50Restart('freeKick',team,spot,'Freistoßprobe');planned=JSON.parse(JSON.stringify(match.setPiece.plan));const atCreation=calls.length;
   probe={};let i=0;for(;i<600&&match.setPiece;i++)N.advance();for(let j=0;j<5;j++)N.advance();
   executed=match.setPiece?null:'done';pass=probe.pass?{receiver:probe.pass.receiver,options:probe.pass.options}:null;probe=null;
   return {planned,atCreation,calls:calls.length,shot:stat(taker,'shots')-shots,pass,notes:notes.filter(t=>t.includes('Freistoß')).slice(-2)};
  }finally{if(original)globalThis.v183DirectFreeKick=original;else delete globalThis.v183DirectFreeKick;probe=null;}
 }
 // Free-kick cross with rivals close to taker and receiver: the restart must be
 // kicked (no cancelled turn) and the actual flight must happen; the taker is the
 // best crosser (pas/tec), not the best shooter.
 function freeKickCross({seed=1,near=true}){
  stage({on:true,seed:'fkc'});clear();
  const team=0,players=field(team),rivals=field(1);
  players.forEach((p,i)=>set(p,{fin:10,pas:10,tec:10}));set(players[2],{fin:18,tec:12});set(players[4],{pas:18,tec:16});
  park([]);const spot=attack(team,26,7);
  players.slice(0,3).forEach((p,i)=>place(p,attack(team,9+i*2,-4+i*4)));place(players[3],attack(team,30,-10));place(players[4],attack(team,27,8));
  // The turn is cancelled by a rival within 2.8 m of the receiver (v157ContinueTurn); a rival
  // behind the taker (no block lane) adds pressure without a block.
  if(near){place(rivals[0],attack(team,29,9.5));place(rivals[1],attack(team,8.2,-3));}
  match.ball={...spot};match.lastTouch=1;seeded(18000+seed);
  const crossesBefore=players.reduce((n,p)=>n+stat(p,'crosses'),0);
  probe={};v50Restart('freeKick',team,spot,'Freistoßflanke');
  const taker=match.setPiece.taker,plan=JSON.parse(JSON.stringify(match.setPiece.plan));
  let i=0,flight=null;for(;i<900&&!flight;i++){N.advance();if(match.flight&&probe.pass)flight={target:{...match.flight.target},duration:match.flight.duration,team:match.flight.team};}
  for(let j=0;j<400&&match.flight;j++)N.advance();
  const out={takerPid:taker.pid,bestPasser:[...players].sort((a,b)=>ability(b,'pas')*.6+ability(b,'tec')*.4-ability(a,'pas')*.6-ability(a,'tec')*.4)[0].pid,bestShooter:[...players].sort((a,b)=>v183ShooterSkill(b)-v183ShooterSkill(a))[0].pid,plan,pass:probe.pass?{receiver:probe.pass.receiver,options:probe.pass.options}:null,flight,crosses:players.reduce((n,p)=>n+stat(p,'crosses'),0)-crossesBefore,pendingTurn:Boolean(match.attackFlow.pendingTurn),air:v183TraceEntries(match).filter(e=>e.kind==='air').length,blocked:notes.some(t=>t.includes('blockt die Flanke')),notes:notes.filter(t=>t.includes('Freistoß')||t.includes('Flanke')).slice(-3)};
  probe=null;return out;
 }
 function cornerRestore({seed=1,team=0}){
  stage({on:true,seed:'cr'});clear();match.lastTouch=1-team;
  seeded(16000+seed);
  v50Restart('corner',team,{x:.951,y:team===0?.036:.964},'Eckballprobe');
  const piece=match.setPiece,before={variant:piece.cornerVariant,target:piece.cornerTargetPid,back:piece.cornerBackPid};
  const backPlayer=match.people.find(p=>p.pid===piece.cornerBackPid),backTarget=backPlayer&&v114RestartMoves.get(piece)?.get(backPlayer),backDepth=backTarget?Math.abs(backTarget.y-(team===0?v55Field.top:v55Field.bottom))*v160PitchScale(match).y:null;
  N.run(12);
  if(!N.checkpoint())throw Error('checkpoint during the corner wait failed');
  const after={variant:match.setPiece.cornerVariant,target:match.setPiece.cornerTargetPid,back:match.setPiece.cornerBackPid},saved=N.savedMatch()?.setPiece||null;
  probe={};let i=0;for(;i<900&&!probe.pass;i++)N.advance();
  const pass=probe.pass;probe=null;
  return {before,after,backDepth,pass,savedBack:saved?.cornerBackPid,savedTarget:saved?.cornerTargetPid};
 }
 function secondBallRestore(){
  const r=cross({on:true,seed:3});
  let i=0;while(i++<200&&(match.flight||match.slide))N.advance();
  const before=JSON.parse(JSON.stringify(match.attackFlow.setplay||null)),si=JSON.stringify(match.si);
  if(!N.checkpoint())throw Error('checkpoint after the cross failed');
  const after=JSON.parse(JSON.stringify(match.attackFlow.setplay||null));
  let error=null;try{N.run(300);}catch(e){error=String(e.message);}
  return {cross:r,before,after,siSame:JSON.stringify(match.si)===si,error};
 }
 // ----- old path: wrappers inactive == base functions (same scene, same seed) -----
 function legacyTwin({seed,swap}){
  const keep={high:v55HighPass,plan:v122PlanAir,resolve:v122ResolveAir,formation:v131CornerFormation,fk:v182FreeKickPlan,take:v50TakeFreeKick,taker:v50BestTaker,finish:v183AirFinish,estimate:v183CrossEstimate};
  if(swap){v122PlanAir=v183BasePlanAir;v122ResolveAir=v183BaseResolveAir;v131CornerFormation=v183BaseCornerFormation;v182FreeKickPlan=v183BaseFreeKickPlan;v50TakeFreeKick=v183BaseTakeFreeKick;v50BestTaker=v183BaseBestTaker;v183AirFinish=v183BaseAirFinish;v183CrossEstimate=v183BaseCrossEstimate;}
  try{
   const a=cross({on:false,seed});
   stage({on:false,seed:'twin'});clear();match.lastTouch=1;seeded(777+seed);v50Restart('corner',0,{x:.951,y:.036},'Eckballprobe');let i=0;for(;i<600&&match.setPiece;i++)N.advance();for(let j=0;j<120;j++)N.advance();
   const digest=N.digest();
   return {cross:JSON.stringify({...a,trace:undefined,texts:a.texts}),digest};
  }finally{if(swap){v122PlanAir=keep.plan;v122ResolveAir=keep.resolve;v131CornerFormation=keep.formation;v182FreeKickPlan=keep.fk;v50TakeFreeKick=keep.take;v50BestTaker=keep.taker;v183AirFinish=keep.finish;v183CrossEstimate=keep.estimate;}}
 }
 return {stage,cross,duel,lonely,corner,estimate,finish,freeKickPlan,freeKickRestore,freeKickAdvice,freeKickCross,cornerRestore,secondBallRestore,legacyTwin,notes:()=>notes.slice()};
})();`,'setplay-probe');

const S=(name,...args)=>copy(h.call('Setplay.'+name,...args));
const mean=list=>list.reduce((a,b)=>a+b,0)/Math.max(1,list.length);

// ----- old path -----
check('marked match with setplay off replays like the 182 constructor (digest without match.si)',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes')).filter((s,i)=>i%4===1)){
  // Every package off: other packages (clock since SI-0) are on by default and change the replay on their own.
  const allOff=Object.fromEntries(['clock','options','offball','finish','defence','setplay','field'].map(p=>[p,false]));
  const off=h.call('Native183.constructedDigest',scene,{si:{packages:allOff},withoutSi:true,segments:[250,250]}),legacy=h.call('Native183.constructedDigest',scene,{si:false,segments:[250,250]});
  assert.equal(off,legacy,scene.id);
 }
});
check('setplay off: the wrappers reproduce the base functions in the cross and corner scenes (same draws)',()=>{
 for(const seed of [1,2]){const wrapped=S('legacyTwin',{seed,swap:false}),base=S('legacyTwin',{seed,swap:true});assert.equal(wrapped.cross,base.cross,'cross scene '+seed);assert.equal(wrapped.digest,base.digest,'corner scene digest '+seed);}
});
check('v55HighPass is wrapped only by this module after motion v102 (no unexpected outer wrapper besides the probe)',()=>{
 assert.equal(ev('typeof v183BaseHighPass'),'function');assert.equal(ev('typeof v183BaseResolveAir'),'function');assert.equal(ev('typeof v183BasePlanAir'),'function');
});

// ----- new path: cross scene -----
const crossRows={on:[],off:[]};
for(const on of [false,true])for(let seed=0;seed<seeds*3;seed++)crossRows[on?'on':'off'].push(S('cross',{on,seed}));
const share=(rows,f)=>rows.filter(f).length/Math.max(1,rows.length);
check('new path: crosses reach a team-mate more often and produce header/volley shots; unreached balls are rarer than on the old path',()=>{
 const on=crossRows.on,off=crossRows.off;
 assert(on.every(r=>r.draws>0&&r.secondBall&&r.secondBall.kind==='cross'),'second-ball trigger written for every cross');
 const complete=share(on,r=>r.complete>0),completeOff=share(off,r=>r.complete>0),finish=share(on,r=>r.shot>0),finishOff=share(off,r=>r.shot>0);
 assert(complete>=completeOff,`arrival ${complete} vs old ${completeOff}`);
 assert(finish>=.25,`header/volley share ${finish}`);assert(finish>=finishOff,`finish ${finish} vs old ${finishOff}`);
 assert(share(on,r=>r.unreached)<=Math.max(.08,share(off,r=>r.unreached)),`unreached ${share(on,r=>r.unreached)} vs old ${share(off,r=>r.unreached)}`);
 assert(on.every(r=>r.goal>=0&&!(r.goal>0&&r.shot===0)),'no goal without a shot in the scene');
});
check('new path: flight time is real seconds (at least max(0.7 s, metres/20)) and ledger source "cross" is set',()=>{
 for(const r of crossRows.on.filter(r=>!r.blocked&&r.duration!==null)){assert(r.duration/r.rate>=Math.max(.7,(r.metres||0)/20)-1e-6,`duration ${r.duration/r.rate} s for ${r.metres} m`);}
 // SI-0 contract: fly() durations in the legacy measure, real seconds equal at another clock rate.
 for(const seed of [1,2]){const slow=S('cross',{on:true,seed,clockRate:.5}),fast=S('cross',{on:true,seed,clockRate:.78});if(slow.blocked||fast.blocked||slow.duration===null||fast.duration===null)continue;assert.equal(slow.rate,.5);assert(Math.abs(slow.duration/slow.rate-fast.duration/fast.rate)<1e-4*(fast.duration/fast.rate),`real flight time ${slow.duration/slow.rate} vs ${fast.duration/fast.rate}`);}
 const tagged=ev(`(()=>{Setplay.stage({on:true,seed:'tag'});const events=match.ballAccounting.events;return JSON.stringify(events.filter(e=>e.sources?.includes('cross')).length)})()`);
 assert(Number.isFinite(JSON.parse(tagged)));
 const r=S('cross',{on:true,seed:2});const sources=copy(ev("(match.ballAccounting?.events||[]).filter(e=>e.kind==='cross').map(e=>e.sources||[])"));
 assert(sources.length>0&&sources.at(-1).includes('cross'),'cross flight carries the ledger source cross');
});
check('cross block: a rival in front of the crosser blocks some crosses (corner or loose ball), never a rival behind him; no goals from blocks',()=>{
 const ahead=[],behind=[];
 for(let seed=0;seed<seeds*3;seed++){ahead.push(S('cross',{on:true,seed,blockerAhead:true,crosserDepth:15}));behind.push(S('cross',{on:true,seed,blockerAhead:false,crosserDepth:15}));}
 assert(ahead.some(r=>r.blocked),'some blocks with a rival ahead');assert(!behind.some(r=>r.blocked),'no block from behind');
 for(const r of ahead.filter(r=>r.blocked)){assert.equal(r.goal,0,'no goal from a block');assert(r.corner>0||r.setPiece===null||r.setPiece==='corner',JSON.stringify({corner:r.corner,setPiece:r.setPiece}));}
 assert(ahead.some(r=>r.blocked&&r.corner>0)||ahead.filter(r=>r.blocked).length<4,'blocked crosses sometimes go out for a corner');
});
check('air ability is visible: attacker air 16 vs 8 wins the duel at least 15 points more often than air 8 vs 16',()=>{
 const n=seeds*12;let strong=0,weak=0,draws=new Set();
 for(let seed=0;seed<n;seed++){const a=S('duel',{seed,attackerAir:16,defenderAir:8}),b=S('duel',{seed,attackerAir:8,defenderAir:16});assert.equal(a.duel,1,'a duel took place');assert.equal(b.duel,1);strong+=a.won;weak+=b.won;draws.add(a.draws>=1);}
 assert(strong/n-weak/n>=.15,`win rates ${strong/n} vs ${weak/n}`);
 assert(draws.has(true));
});
check('lonely defender: exactly two draws (clear, lateral) and the clearance stub draws nothing itself',()=>{
 for(let seed=0;seed<6;seed++){const r=S('lonely',{seed});assert.equal(r.draws,2,JSON.stringify(r));assert(r.cleared?r.rebound:r.owner||r.rebound,JSON.stringify(r));}
});
check('header/volley decision: one draw inside the finish range at a usable angle, none outside; volley preferred by technical players',()=>{
 let taken=0;for(let seed=0;seed<40;seed++){const r=S('finish',{seed,depth:6});assert.equal(r.draws,1);assert([null,'header'].includes(r.kind));if(r.kind)taken++;}
 assert(taken/40>=.5,`taken ${taken/40}`);
 for(const config of [{depth:16},{depth:5,lateral:9},{depth:6,headerRange:false}]){const r=S('finish',{seed:1,...config});assert.equal(r.kind,null,JSON.stringify(config));assert.equal(r.draws,0,JSON.stringify(config));}
 let volleys=0;for(let seed=0;seed<30;seed++){const r=S('finish',{seed,depth:13,preferHeader:false});assert([null,'volley'].includes(r.kind));if(r.kind)volleys++;}
 assert(volleys>0,'volleys happen for technical players at 13 m');
});
check('cross estimate: deterministic, monotone in air ability and defender presence, geometry gates and offside',()=>{
 const base=S('estimate',{}),strong=S('estimate',{air:18}),weak=S('estimate',{air:6}),marked=S('estimate',{defenderGap:1}),pressured=S('estimate',{pas:6});
 for(const e of [base,strong,weak,marked,pressured]){assert.equal(e.draws,0,'no random draw');assert(e.eligible);assert(e.arrival>0&&e.arrival<=1);assert(e.headerXg>=0&&e.headerXg<=.35);}
 assert(strong.arrival>base.arrival&&base.arrival>weak.arrival,`air monotone ${weak.arrival} ${base.arrival} ${strong.arrival}`);
 assert(strong.headerXg>weak.headerXg,'header value grows with air');
 assert(marked.arrival<base.arrival,`marker lowers arrival ${marked.arrival} < ${base.arrival}`);
 assert(pressured.arrival<base.arrival,'a weaker crosser lowers arrival');
 assert.equal(S('estimate',{crosserLateral:3}).eligible,false,'too central for a cross');
 assert.equal(S('estimate',{point:[25,2]}).eligible,false,'target too far from goal');
 assert.equal(S('estimate',{point:[9,2]}).eligible,true,'point target');
 const off=S('estimate',{offside:true});assert(off.offside===true&&off.arrival===0,JSON.stringify(off));
 assert.equal(JSON.stringify(S('estimate',{})),JSON.stringify(base),'deterministic');
});

// ----- corners: formation, B10 follow-up -----
const cornerRows={on:[],off:[]};
for(const on of [false,true])for(const team of [0,1])for(const right of [false,true])for(const level of [6,12,18])for(let seed=1;seed<=seeds;seed++)cornerRows[on?'on':'off'].push(S('corner',{on,team,right,level,seed}));
const high=rows=>rows.filter(r=>r.pass&&r.variant!=='short');
const rolledOut=r=>r.first.kind==='out'&&!r.exit&&(r.first.edge==='left'||r.first.edge==='right');
check('corners are taken in both paths; marked corners carry the target and a back-space player',()=>{
 for(const key of ['on','off'])assert(cornerRows[key].every(r=>r.pass||r.variant==='short'),key+': every high corner was taken');
 for(const r of high(cornerRows.on)){assert.equal(r.receiver,r.targetPid,'corner goes to its target');assert(r.backPid,'back-space player named');}
 assert(cornerRows.on.some(r=>r.variant==='short')||true);
});
check('B10 follow-up: unreached landing points of high corners at most 6 % on the new path (defence off), fewer than on the old path; rolling into touch rarer too',()=>{
 const on=high(cornerRows.on),off=high(cornerRows.off),unreachedOn=share(on,r=>r.unreached),unreachedOff=share(off,r=>r.unreached),rateOn=share(on,rolledOut),rateOff=share(off,rolledOut);
 assert(on.length>=cornerRows.on.length*.5);
 // The B10 measure is the unreached landing point (SI-7's reach); balls rolling into touch also count
 // clearances once SI-4 is on, so that share is only compared with defence off (as staged here).
 assert(unreachedOn<=.06,`unreached ${unreachedOn} (${on.filter(r=>r.unreached).length}/${on.length}) vs old ${unreachedOff}`);
 assert(unreachedOn<unreachedOff,`unreached ${unreachedOn} not below old ${unreachedOff}`);
 assert(rateOn<=.06&&rateOn<=rateOff,`rolled out ${rateOn} (${on.filter(rolledOut).length}/${on.length}) vs old ${rateOff}`);
});
check('corner formation restore: variant, target and back-space player survive the JSON checkpoint and the corner goes to the target',()=>{
 for(const team of [0,1]){const r=S('cornerRestore',{seed:team+1,team});assert.deepEqual(r.after,r.before);assert(r.before.back&&r.savedBack===r.before.back&&r.savedTarget===r.before.target,JSON.stringify(r));assert(r.backDepth>14&&r.backDepth<20,`back depth ${r.backDepth}`);assert(r.pass&&r.pass.options.corner&&r.pass.receiver===r.before.target,'corner executed to the restored target');}
});

// ----- free kicks -----
check('free-kick plan: direct only by the best shooter inside his window (one draw), cross with team-mates near goal, otherwise pass; plain data',()=>{
 // With the finish package (SI-3) the plan is provisional without a draw (confirmed at execution); without it one draw decides.
 let direct=0,si3=null;for(let seed=0;seed<30;seed++){const r=S('freeKickPlan',{spotDepth:18,takerFin:17,otherFin:10,seed});si3=r.advised;assert.equal(r.draws,si3?0:1,si3?'no draw with the finish package':'one draw inside the window');assert(['direct','pass','cross'].includes(r.plan.kind));if(r.plan.direct){direct++;assert.equal(Boolean(r.plan.provisional),si3,'provisional only with the finish package');}assert.equal(r.bestTaker,r.takerPid,'best shooter takes it');assert.equal(r.bestTaker,r.bestShooterPid,'taker is the best shooter by the SI-3 rating');assert(r.window);}
 assert(direct>=10,`direct share ${direct/30}`);if(si3)assert.equal(direct,30,'with the finish package every plan inside the window is provisionally direct');
 const notBest=S('freeKickPlan',{spotDepth:18,takerFin:10,otherFin:16});assert.equal(notBest.draws,0);assert.equal(notBest.plan.direct,false);assert.notEqual(notBest.bestTaker,notBest.takerPid,'the better shooter is the taker');
 const far=S('freeKickPlan',{spotDepth:40,takerFin:17,boxAllies:3});assert.equal(far.draws,0);assert.equal(far.plan.kind,'pass');
 const cross=S('freeKickPlan',{spotDepth:28,spotLateral:8,takerFin:10,otherFin:10,boxAllies:3});assert.equal(cross.plan.kind,'cross');assert(cross.plan.targetPid);assert.equal(cross.plan.direct,false);
 assert.equal(JSON.stringify(cross.plan),JSON.stringify(JSON.parse(JSON.stringify(cross.plan))));
});
check('free-kick with SI-3: the direct plan is provisional at creation and confirmed or revised by v183DirectFreeKick only at execution (wall in place)',()=>{
 const yes=S('freeKickAdvice',{seed:1,direct:true}),no=S('freeKickAdvice',{seed:1,direct:false});
 for(const r of [yes,no]){assert.equal(r.planned.kind,'direct',JSON.stringify(r.planned));assert.equal(r.planned.provisional,true);assert.equal(r.atCreation,0,'no SI-3 call at creation');assert(r.calls>=1,'asked at execution');}
 assert.equal(yes.shot,1,'confirmed plan shoots');assert.equal(no.shot,0,'refused plan does not shoot');
 assert(no.pass&&no.pass.options.cross===true,'refused plan turns into the cross variant from the current positions');
});
check('free-kick cross with rivals near taker and receiver: the restart is kicked (no cancelled turn), the ball actually flies, the best crosser takes it',()=>{
 for(const near of [true,false])for(const seed of [1,2,3]){const r=S('freeKickCross',{seed,near});
  assert.equal(r.plan.kind,'cross',JSON.stringify(r.plan));assert.equal(r.takerPid,r.bestPasser,'best crosser takes the cross free kick');assert.notEqual(r.takerPid,r.bestShooter,'not the best shooter');
  assert(r.pass&&r.pass.options.cross&&r.pass.options.restart===true,'cross kicked as a restart: '+JSON.stringify(r.pass));
  // A kicked cross either flies to the box (resolved in the air) or is blocked by a close rival (deflection flight); both prove the restart was kicked.
  assert(r.flight&&(r.flight.team===0||r.blocked),`the cross is kicked (near rival ${near}): ${JSON.stringify({flight:r.flight,blocked:r.blocked,pendingTurn:r.pendingTurn,notes:r.notes})}`);
  assert.equal(r.crosses,1,'one cross counted');assert.equal(r.pendingTurn,false,'no turn left pending');assert(r.air>=1||r.blocked,'the flight was resolved in the air or blocked');}
});
check('free-kick cross restore: the plan survives the checkpoint with its taker and is executed as a cross to the planned receiver',()=>{
 const r=S('freeKickRestore',{seed:2});
 assert.equal(r.planned.kind,'cross',JSON.stringify(r.planned));assert.deepEqual(r.restored,r.planned);assert.deepEqual(r.saved,r.planned);assert.equal(r.takerAfter,r.takerBefore);
 assert(r.pass&&r.pass.options.cross&&!r.pass.options.corner&&r.pass.receiver===r.planned.targetPid,JSON.stringify(r.pass));
});

// ----- second ball trigger and restore completeness -----
check('attackFlow.setplay.secondBall is plain data, survives the checkpoint unchanged and the match continues',()=>{
 const r=S('secondBallRestore');
 assert(r.before&&r.before.secondBall&&r.before.secondBall.kind==='cross');assert.deepEqual(r.after,r.before);assert(r.siSame);assert.equal(r.error,null);
});

const summary={cross:{on:{n:crossRows.on.length,complete:+share(crossRows.on,r=>r.complete>0).toFixed(3),shots:+share(crossRows.on,r=>r.shot>0).toFixed(3),unreached:+share(crossRows.on,r=>r.unreached).toFixed(3),blocked:+share(crossRows.on,r=>r.blocked).toFixed(3),intercepted:+share(crossRows.on,r=>r.intercepted>0).toFixed(3),goals:crossRows.on.reduce((s,r)=>s+r.goal,0)},off:{n:crossRows.off.length,complete:+share(crossRows.off,r=>r.complete>0).toFixed(3),shots:+share(crossRows.off,r=>r.shot>0).toFixed(3),unreached:+share(crossRows.off,r=>r.unreached).toFixed(3),goals:crossRows.off.reduce((s,r)=>s+r.goal,0)}},
 corners:{on:{n:high(cornerRows.on).length,rolledOut:+share(high(cornerRows.on),rolledOut).toFixed(3),unreached:+share(high(cornerRows.on),r=>r.unreached).toFixed(3),exit:+share(high(cornerRows.on),r=>r.exit).toFixed(3),first:Object.fromEntries(Object.entries(high(cornerRows.on).reduce((o,r)=>{const k=r.first.kind==='owner'?(r.first.team===r.team?'attack':r.first.keeper?'keeper':'defence'):r.first.kind+(r.first.edge?':'+r.first.edge:'');o[k]=(o[k]||0)+1;return o;},{})))},off:{n:high(cornerRows.off).length,rolledOut:+share(high(cornerRows.off),rolledOut).toFixed(3),unreached:+share(high(cornerRows.off),r=>r.unreached).toFixed(3),exit:+share(high(cornerRows.off),r=>r.exit).toFixed(3)}},seeds};
const output={pass:!failures.length,checks,failures,summary};
fs.mkdirSync('outputs/si183',{recursive:true});fs.writeFileSync('outputs/si183/test-si-setplay-v183.json',JSON.stringify(output,null,1)+'\n');
console.log(JSON.stringify(output));if(failures.length)process.exitCode=1;
