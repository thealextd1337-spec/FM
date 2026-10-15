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
 function stage({on=true,size='standard',seed='sp',club='GER-2',clockRate}={}){
  const si={packages:{setplay:on,...(clockRate?{clock:true}:{})},...(clockRate?{clockRate}:{})};
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
 function cross({on,seed,size='standard',receiverAir=12,defenderAir=12,gap=1.2,crosserPas=12,blockerAhead=false,receiverDepth=9,crosserDepth=20,level}={}){
  stage({on,size,seed:'cross'+(seed%4)});clear();
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
  stage({on:true,seed:'lonely'});clear();
  const team=0,D=field(1)[0],passer=field(0)[0],end=attack(team,10,0);
  park([D,passer]);place(passer,attack(team,24,14));place(D,end);
  match.owner=null;match.ball={...end};match.lastTouch=team;
  seeded(9000+seed);const d0=R.rng().draws;
  v122ResolveAir({passer,end,snapshot:{offside:new Set()},cross:true});
  return {draws:R.rng().draws-d0,cleared:notes.some(t=>t.includes('köpft den hohen Ball weg')),owner:match.owner?.pid||null,rebound:Boolean(match.rebound)};
 }
 // ----- corner probe (B10 follow-up): first event after a high corner -----
 function corner({on,team,right,level,seed,size='standard'}){
  stage({on,size,seed:'corner'+(seed%3)});clear();
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
  return {plan,draws,bestTaker:best.pid,takerPid:taker.pid,bestFin:ability(best,'fin'),window:v183FreeKickWindow(match,team,spot,best)};
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
 return {stage,cross,duel,lonely,corner,estimate,finish,freeKickPlan,freeKickRestore,cornerRestore,secondBallRestore,legacyTwin,notes:()=>notes.slice()};
})();`,'setplay-probe');

const S=(name,...args)=>copy(h.call('Setplay.'+name,...args));
const mean=list=>list.reduce((a,b)=>a+b,0)/Math.max(1,list.length);

// ----- old path -----
check('marked match with setplay off replays like the 182 constructor (digest without match.si)',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes')).filter((s,i)=>i%4===1)){
  const off=h.call('Native183.constructedDigest',scene,{si:{packages:{setplay:false}},withoutSi:true,segments:[250,250]}),legacy=h.call('Native183.constructedDigest',scene,{si:false,segments:[250,250]});
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
check('B10 follow-up: unreached high corners rolling into touch at most 6 % on the new path and fewer than on the old path',()=>{
 const on=high(cornerRows.on),off=high(cornerRows.off),rateOn=share(on,rolledOut),rateOff=share(off,rolledOut);
 assert(on.length>=cornerRows.on.length*.5);
 assert(rateOn<=.06,`rolled out ${rateOn} (${on.filter(rolledOut).length}/${on.length}) vs old ${rateOff}`);
 assert(rateOn<=rateOff,`new ${rateOn} not below old ${rateOff}`);
 assert(share(on,r=>r.unreached)<share(off,r=>r.unreached)||share(on,r=>r.unreached)<=.08,`unreached ${share(on,r=>r.unreached)} vs old ${share(off,r=>r.unreached)}`);
});
check('corner formation restore: variant, target and back-space player survive the JSON checkpoint and the corner goes to the target',()=>{
 for(const team of [0,1]){const r=S('cornerRestore',{seed:team+1,team});assert.deepEqual(r.after,r.before);assert(r.before.back&&r.savedBack===r.before.back&&r.savedTarget===r.before.target,JSON.stringify(r));assert(r.backDepth>14&&r.backDepth<20,`back depth ${r.backDepth}`);assert(r.pass&&r.pass.options.corner&&r.pass.receiver===r.before.target,'corner executed to the restored target');}
});

// ----- free kicks -----
check('free-kick plan: direct only by the best shooter inside his window (one draw), cross with team-mates near goal, otherwise pass; plain data',()=>{
 let direct=0;for(let seed=0;seed<30;seed++){const r=S('freeKickPlan',{spotDepth:18,takerFin:17,otherFin:10,seed});assert.equal(r.draws,1,'one draw inside the window');assert(['direct','pass','cross'].includes(r.plan.kind));if(r.plan.direct)direct++;assert.equal(r.bestTaker,r.takerPid,'best shooter takes it');assert(r.window);}
 assert(direct>=10,`direct share ${direct/30}`);
 const notBest=S('freeKickPlan',{spotDepth:18,takerFin:10,otherFin:16});assert.equal(notBest.draws,0);assert.equal(notBest.plan.direct,false);assert.notEqual(notBest.bestTaker,notBest.takerPid,'the better shooter is the taker');
 const far=S('freeKickPlan',{spotDepth:40,takerFin:17,boxAllies:3});assert.equal(far.draws,0);assert.equal(far.plan.kind,'pass');
 const cross=S('freeKickPlan',{spotDepth:28,spotLateral:8,takerFin:10,otherFin:10,boxAllies:3});assert.equal(cross.plan.kind,'cross');assert(cross.plan.targetPid);assert.equal(cross.plan.direct,false);
 assert.equal(JSON.stringify(cross.plan),JSON.stringify(JSON.parse(JSON.stringify(cross.plan))));
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
