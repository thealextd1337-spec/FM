'use strict';
// Cross into space (B22, add-on to SI-1/SI-2/SI-7 of player intelligence 183).
// Runs the actual dist modules in the native VM harness on constructor matches
// (native183-scenes). Checks: parameters registered; no space option with
// options.crossSpace 0 or the setplay package off; the estimate values a
// runner's path (arrival above the standing receiver, 0 beyond his cover);
// the carrier's option list carries a cross into space to a box spot; the
// execution floats the ball to the spot, the runner is contender, enters the
// box only after the kick and the plain record attackFlow.crossRun lives
// exactly during the flight; offside is judged at the kick; the signal with
// crossLead holds the runner at the line until the kick, releases him during
// the flight and aborts when he is offside at kickAt; restore of the signal;
// no random draw in the planning; both pitch sizes.
// Usage: node work/test-si-crossing-v183.cjs   (CROSSING_SEEDS=n, default 12)
const assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs');
const checks=[],failures=[],check=(name,fn)=>{try{fn();checks.push(name);console.log('ok   '+name);}catch(error){failures.push(`${name}: ${error.message}`);console.log('FAIL '+name+'\n     '+String(error.stack||error).split('\n').slice(0,4).join('\n     '));}};
const seeds=Number(process.env.CROSSING_SEEDS||12);
const h=create({view:false}),ev=text=>h.evaluate(text),copy=value=>h.copy(value);
h.run('v50Name=t=>t===0?"Heim":"Gast";showOverlay=()=>{};hideOverlay=()=>{};v183SetTraceLimit(20000);');
h.run(`globalThis.Crossing=(function(){
 const N=Native183,R=Native182,seeded=n=>R.seedRandom((Math.imul(n+1,2654435761)>>>0)||1);
 const notes=[];note=(text,kind)=>{notes.push(text);};
 function stage({size='standard',seed='b22',club='GER-2',packages={},params={}}={}){
  N.constructed({club,seed,size,roles:true,si:{packages,params}});
  for(let i=0;i<800&&(match.kickoff||match.setPiece||match.postBanner||match.goalPause>0||match.countdown>0);i++)N.advance();
  match.firstHalfEnd=5000;match.fullTimeEnd=10000;match.halftime=false;return match;
 }
 // Point depth metres in front of the goal team t attacks, lateral metres from the centre.
 function attack(t,depth,lateral){const s=v160PitchScale(match);return {x:.5+lateral/s.x,y:(t===0?v55Field.top:v55Field.bottom)+(t===0?1:-1)*depth/s.y};}
 function depthOf(t,y){const s=v160PitchScale(match);return (y-(t===0?v55Field.top:v55Field.bottom))*(t===0?1:-1)*s.y;}
 function place(p,point){p.x=point.x;p.y=point.y;p.tx=point.x;p.ty=point.y;p.interceptTarget=null;p.slideActive=false;p.recoverUntil=0;const b=p.offenseMotion;if(b){b.vx=0;b.vy=0;}}
 function clear(){const m=match;m.owner=null;m.flight=null;m.rebound=null;m.setPiece=null;m.kickoff=null;m.throwIn=null;m.postBanner=null;m.goalPause=0;m.countdown=0;m.pendingKickoff=null;m.lastPass=null;m.breakawayCarrier=null;m.offsideVisual=null;m.attackFlow.pendingTurn=null;m.attackFlow.intents={};m.attackFlow.combination=null;delete m.attackFlow.crossRun;delete m.attackFlow.decision;m.next=Infinity;if(typeof v124AirBalls!=='undefined')v124AirBalls.delete(m);const st=v102State(m);st.loose=null;st.poses.clear();notes.length=0;}
 const field=t=>match.people.filter(p=>p.t===t&&!p.keeper),keeper=t=>match.people.find(p=>p.t===t&&p.keeper);
 function park(except){for(const t of [0,1]){let i=0;for(const p of field(t))if(!except.includes(p)){place(p,attack(t,44+i*3,-14+i*7));i++;}place(keeper(t),attack(1-t,.8,0));}}
 const stat=(p,k)=>p.stats[k]||0,set=(p,v)=>{for(const [k,x]of Object.entries(v))p[k]=x;};
 // Scene: crosser wide at crosserDepth, runner (poacher) at lineDepth near the
 // centre, a marker goal-side of him, two more defenders forming the line; a
 // lane blocker between crosser and runner when "closed".
 function build({seed=0,size='standard',crosserDepth=23,crosserWide=17,lineDepth=15.5,runnerLateral=1,markerGap=1.5,runnerAir=12,markerAir=12,spd=12,params={},packages={},closed=false,runnerBeyond=0}={}){
  stage({size,seed:'b22-'+(seed%5),packages,params});clear();
  const team=0,players=field(0),rivals=field(1),line=p=>p.assignedLine||p.line,front=[...players].sort((a,b)=>(line(b)==='att'?2:line(b)==='mid'?1:0)-(line(a)==='att'?2:line(a)==='mid'?1:0)||a.n-b.n),runner=front[0],crosser=front[1],marker=rivals[0],d2=rivals[1],d3=rivals[2],lane=rivals[3];
  set(crosser,{pas:13,tec:13,spd,tacticalRole:'winger'});set(runner,{air:runnerAir,pos:12,tec:12,fin:12,spd,tacticalRole:'poacher'});set(marker,{air:markerAir,pos:12,tak:12,spd});
  park([crosser,runner,marker,d2,d3,...(closed?[lane]:[])]);
  place(crosser,attack(team,crosserDepth,crosserWide));place(runner,attack(team,lineDepth-runnerBeyond,runnerLateral));place(marker,attack(team,lineDepth-markerGap,runnerLateral+.6));
  place(d2,attack(team,lineDepth-2,-8));place(d3,attack(team,lineDepth-.5,8));
  if(closed)place(lane,attack(team,(crosserDepth+lineDepth)/2,(crosserWide+runnerLateral)/2));
  match.owner=crosser;match.ball={x:crosser.x,y:crosser.y};match.lastTouch=team;
  {const s=v160PitchScale(match),body=v157Body(crosser);body.heading=Math.atan2((.5-crosser.x)*s.x,(runner.y-crosser.y)*s.y);}
  N.advance();
  return {team,crosser,runner,marker,spot:attack(team,11,0),near:attack(team,6,4*(crosser.x<.5?-1:1))};
 }
 function params(){return {si:JSON.parse(JSON.stringify(match.si))};}
 function estimates({seed=0,size='standard'}={}){
  const S=build({seed,size}),m=match,d0=R.rng().draws;
  const space=v183CrossEstimate(m,S.crosser,S.spot,{runner:S.runner,space:true}),standing=v183CrossEstimate(m,S.crosser,S.runner),far=v183CrossEstimate(m,S.crosser,attack(S.team,6,-13),{runner:S.runner,space:true,adapt:false}),farAdapted=v183CrossEstimate(m,S.crosser,attack(S.team,6,-13),{runner:S.runner,space:true});
  const point=v183CrossEstimate(m,S.crosser,S.spot);
  return {draws:R.rng().draws-d0,space:{arrival:space.arrival,land:space.land,duel:space.duel,cover:space.cover,gap:space.gap,reachable:space.reachable,flight:space.flight,headerXg:space.headerXg,runner:space.receiverPid===S.runner.pid},standing:{arrival:standing.arrival,land:standing.land,headerXg:standing.headerXg},far:{arrival:far.arrival,reachable:far.reachable,cover:far.cover,gap:far.gap},farAdapted:{adapted:farAdapted.adapted,reachable:farAdapted.reachable,arrival:farAdapted.arrival,gap:farAdapted.gap,cover:farAdapted.cover,closer:v122Metres(S.runner,farAdapted.landing)<v122Metres(S.runner,attack(S.team,6,-13))},point:{arrival:point.arrival,space:point.space,flight:point.flight}};
 }
 function options({seed=0,size='standard',params={},packages={},closed=true}={}){
  const S=build({seed,size,params,packages,closed}),m=match,P=v183OptParams(m),allies=m.people.filter(p=>p.t===S.team&&!p.keeper&&p!==S.crosser&&!p.slideActive),rivals=m.people.filter(p=>p.t!==S.team&&!p.keeper),d0=R.rng().draws;
  const list=v183OptCached(()=>v183OptOptions(m,S.crosser,allies,rivals,P)).list.sort((a,b)=>b.u-a.u);
  const s=v160PitchScale(m),spots=P.crossSpots.map(([lat,depth])=>attack(S.team,depth,lat*(S.crosser.x<.5?-1:1)));
  return {draws:R.rng().draws-d0,top:list.slice(0,5).map(o=>({kind:o.kind,ref:o.ref,space:Boolean(o.space),u:+o.u.toFixed(4)})),space:list.filter(o=>o.kind==='cross'&&o.space).map(o=>({ref:o.ref,runner:o.ref===S.runner.pid,arrival:+o.arrival.toFixed(3),header:+o.header.toFixed(4),u:+o.u.toFixed(4),atSpot:spots.some(sp=>v122Metres(sp,o.target)<.01),rank:list.indexOf(o)})),n:list.length};
 }
 // Kick a cross into space at the penalty spot; observe flight, runner and landing.
 function kick({seed=0,size='standard',runnerBeyond=0,markerGap=1.5,spot='spot',params={}}={}){
  const S=build({seed,size,runnerBeyond,markerGap,params}),m=match,team=S.team,runner=S.runner,crosser=S.crosser,s=v160PitchScale(m),point=spot==='near'?S.near:S.spot;
  const line=v55OffsideLine(team,m.ball),before={crosses:stat(crosser,'crosses'),complete:stat(crosser,'crossComplete'),shots:stat(runner,'shots'),headers:stat(runner,'headers'),volleys:stat(runner,'volleys'),goals:m.goals.length,fk:m.setPieceStats.freeKicks[1-team]};
  seeded(9000+seed);const d0=R.rng().draws;
  v55HighPass(crosser,runner,{cross:true,space:{x:point.x,y:point.y}});
  let ticks=0;for(;ticks<60&&!m.flight&&m.owner===crosser;ticks++)N.advance();
  const flight=m.flight,meta=flight&&typeof v102Flights!=='undefined'?v102Flights.get(flight):null,ledger=flight&&typeof v117Flights!=='undefined'?v117Flights.get(flight):null;
  const run=m.attackFlow.crossRun?JSON.parse(JSON.stringify(m.attackFlow.crossRun)):null;
  const target=flight?{...flight.target}:null;let beyond=-99,contender=false,clamped=false;
  while(m.flight&&ticks++<400){N.advance();if(runner.interceptTarget)contender=true;beyond=Math.max(beyond,(line-runner.y)*(team===0?1:-1)*s.y);const i=m.attackFlow.intents[runner.pid];if(i&&i.pattern==='cross-run'&&m.attackFlow.crossRun?.kicked){const limit=v121PositioningPlans.get(m)?.get(runner)?.limit;if(limit!=null&&(team===0?i.y>limit+1e-9:i.y<limit-1e-9))clamped=true;}}
  for(let i=0;i<3;i++)N.advance();
  const trace=v183TraceEntries(m).filter(e=>['air','cross','cross-block','air-finish'].includes(e.kind)).map(e=>{const {seq,at,...r}=e;return r;});
  return {ticks,flight:Boolean(flight),kind:meta?.kind||null,ledgerKind:ledger?.kind||null,sources:ledger?.sources?[...ledger.sources]:[],seconds:flight?+(flight.duration/v183Rate(m)).toFixed(2):null,error:target?+v122Metres(target,point).toFixed(2):null,run,runAfter:m.attackFlow.crossRun||null,contender,beyond:+beyond.toFixed(2),clamped,
   crosses:stat(crosser,'crosses')-before.crosses,complete:stat(crosser,'crossComplete')-before.complete,shots:stat(runner,'shots')-before.shots+stat(runner,'headers')-before.headers,airShots:stat(runner,'headers')-before.headers+stat(runner,'volleys')-before.volleys,goals:m.goals.length-before.goals,offside:m.setPiece?.type==='offside'||m.setPieceStats.freeKicks[1-team]>before.fk,draws:R.rng().draws-d0,trace,notes:notes.slice(0,4)};
 }
 // Signal with crossLead: the decision writes attackFlow.crossRun, SI-2 points
 // the runner, the clamp holds him until the kick, the carrier kicks at kickAt.
 function signal({seed=0,lead=.5,offsideAtKick=false,restore=false}={}){
  const S=build({seed,params:{options:{crossLead:lead}}}),m=match,team=S.team,runner=S.runner,crosser=S.crosser,s=v160PitchScale(m),P=v183OptParams(m);
  const allies=m.people.filter(p=>p.t===team&&!p.keeper&&p!==crosser&&!p.slideActive),rivals=m.people.filter(p=>p.t!==team&&!p.keeper);
  const o={kind:'cross',ref:runner.pid,q:runner,target:{x:S.spot.x,y:S.spot.y},space:true,arrival:.4,gain:.05,loss:.01,u:.04};
  seeded(9100+seed);const d0=R.rng().draws;
  v183OptRecord(m,crosser,o,P);const fallback=v183OptExecute(m,crosser,o,allies,rivals,P);
  const run0=JSON.parse(JSON.stringify(m.attackFlow.crossRun)),carry=m.attackFlow.carry?{...m.attackFlow.carry}:null;
  let restored=false;
  if(restore){restored=N.checkpoint();}
  const r=()=>match.people.find(p=>p.pid===runner.pid),c=()=>match.people.find(p=>p.pid===crosser.pid);
  const samples=[];let kickedAt=null,ticks=0;
  for(;ticks<80&&!match.flight&&!kickedAt;ticks++){
   N.advance();
   const i=match.attackFlow.intents[runner.pid],limit=v121PositioningPlans.get(match)?.get(r())?.limit,beyond=limit==null?null:+((limit-r().y)*(team===0?1:-1)*s.y).toFixed(3);
   samples.push({pattern:i?.pattern||null,atSpot:i?Math.abs(i.x-S.spot.x)<1e-9:false,clampedToLimit:i&&limit!=null?(team===0?i.y>=limit-1e-9:i.y<=limit+1e-9):null,beyond,owner:match.owner?.pid||null});
   if(offsideAtKick&&ticks===3){const rr=r();place(rr,attack(team,depthOf(team,v55OffsideLine(team,match.ball))-2.5,1));}
   if(match.attackFlow.crossRun?.kicked)kickedAt=v183Seconds(match);
  }
  const run1=match.attackFlow.crossRun?JSON.parse(JSON.stringify(match.attackFlow.crossRun)):null,flight=match.flight,meta=flight&&typeof v102Flights!=='undefined'?v102Flights.get(flight):null;
  let released=false,moved=false;const y0=r().y;
  while(match.flight&&ticks++<400){N.advance();const i=match.attackFlow.intents[runner.pid],limit=v121PositioningPlans.get(match)?.get(r())?.limit;if(i?.pattern==='cross-run'&&limit!=null&&(team===0?i.y<limit-1e-9:i.y>limit+1e-9))released=true;}
  moved=(y0-r().y)*(team===0?1:-1)*s.y>1;
  const trace=v183TraceEntries(match).filter(e=>e.kind==='cross-run'||e.kind==='pattern'&&e.pattern==='cross-run').map(e=>{const {seq,at,...x}=e;return x;});
  return {fallback,run0,carry,restored,saved:restore?N.savedMatch()?.attackFlow?.crossRun||null:null,samples,kickedAt:kickedAt==null?null:+(kickedAt-run0.at).toFixed(2),run1,flight:Boolean(flight),kind:meta?.kind||null,released,moved,draws:R.rng().draws-d0,trace,runAfter:match.attackFlow.crossRun||null,owner:match.owner?.pid||null};
 }
 // Full constructor match: count crosses into space and check the plain state.
 function play({seed='b22-play',size='standard',ticks=6000,params={}}={}){
  stage({size,seed,params});const m=match;let runs=0,plain=true,flights=0;const seen=new Set();
  for(let i=0;i<ticks&&!m.finished;i++){N.advance();const run=m.attackFlow.crossRun;if(run&&!seen.has(run)){seen.add(run);runs++;try{plain=plain&&JSON.stringify(run)===JSON.stringify(JSON.parse(JSON.stringify(run)));}catch{plain=false;}}}
  const crosses=m.people.reduce((n,p)=>n+(p.stats.crosses||0),0),tr=v183TraceEntries(m).filter(e=>e.kind==='cross'&&e.space).length;
  return {runs,plain,crosses,spaceCrosses:tr,ticks:ticks};
 }
 // A blocked cross into space ends its signal: the crosser regaining the ball
 // must not kick again from the stale record (forced block next to the crosser).
 function blocked({seed=0}={}){
  const S=build({seed}),m=match,team=S.team,crosser=S.crosser,runner=S.runner,s=v160PitchScale(m),blocker=field(1-team).find(p=>![S.marker].includes(p)&&Math.abs(depthOf(team,p.y))>30)||field(1-team)[4];
  const dx=(S.spot.x-crosser.x)*s.x,dy=(S.spot.y-crosser.y)*s.y,d=Math.hypot(dx,dy);place(blocker,{x:crosser.x+dx/d*1.2/s.x,y:crosser.y+dy/d*1.2/s.y});
  {const body=v157Body(crosser);body.heading=Math.atan2(dx,dy);}
  m.attackFlow.crossRun={crosserId:crosser.pid,runnerId:runner.pid,x:S.spot.x,y:S.spot.y,at:v183Seconds(m),kickAt:v183Seconds(m),until:v183Seconds(m)+2.5,kicked:false};
  const chance=v183BlockChance;v183BlockChance=()=>1;let trace;
  try{seeded(9200+seed);v55HighPass(crosser,runner,{cross:true,space:{x:S.spot.x,y:S.spot.y}});trace=v183TraceEntries(m).filter(e=>e.kind==='cross-block').length;}finally{v183BlockChance=chance;}
  return {blocks:trace,run:m.attackFlow.crossRun||null,pending:Boolean(m.attackFlow.pendingTurn)};
 }
 // SI-K2: keeper offset from the landing-goal line at the last flight tick, the
 // marker of the signal and his gap to the runner at the kick (lead > 0: signal first).
 function keeperFlight({seed=0,size='standard',params={},spot='spot',lead=0,markerGap=1.5}={}){
  const S=build({seed,size,params,markerGap}),m=match,team=S.team,runner=S.runner,crosser=S.crosser,s=v160PitchScale(m),point=spot==='near'?S.near:S.spot,gk=keeper(1-team),goalY=team===0?v55Field.top:v55Field.bottom;
  seeded(9300+seed);
  if(lead>0){const P=v183OptParams(m),allies=m.people.filter(p=>p.t===team&&!p.keeper&&p!==crosser),rivals=m.people.filter(p=>p.t!==team&&!p.keeper);const o={kind:'cross',ref:runner.pid,q:runner,target:{x:point.x,y:point.y},space:true,arrival:.4,gain:.05,loss:.01,u:.04,lead};v183OptRecord(m,crosser,o,P);v183OptExecute(m,crosser,o,allies,rivals,P);}
  else v55HighPass(crosser,runner,{cross:true,space:{x:point.x,y:point.y}});
  let ticks=0;for(;ticks<120&&!m.flight;ticks++)N.advance();
  const flight=m.flight,plan=flight&&v122AerialPlans.get(flight);if(!plan)return {flight:false};
  const end={...plan.end},mark=m.attackFlow.defence?.mark?{...m.attackFlow.defence.mark}:null,marker=mark&&m.people.find(p=>p.pid===mark.markerId),kickGap=marker?v122Metres(marker,runner):null;
  const d0=R.rng().draws,pure=JSON.stringify(v183KeeperFlightTarget(m,gk))===JSON.stringify(v183KeeperFlightTarget(m,gk))&&R.rng().draws===d0;
  let off=null,nearest=null;
  while(m.flight===flight&&ticks++<400){const depthK=Math.abs(gk.y-goalY)*s.y,dE=Math.abs(end.y-goalY)*s.y;off=Math.abs((gk.x-.5)*s.x-(end.x-.5)*s.x*depthK/Math.max(.1,dE));nearest=Math.min(...m.people.filter(p=>p.t!==team&&!p.keeper).map(p=>v122Metres(p,end)));N.advance();}
  return {flight:true,off,nearest,mark,kickGap,pure,plain:mark?JSON.stringify(mark)===JSON.stringify(JSON.parse(JSON.stringify(mark))):true};
 }
 // SI-K2: estimate with and without the wait; options with and without the shared offside set.
 function leadEstimate({seed=0,size='standard'}={}){
  const S=build({seed,size,markerGap:-4}),m=match,d=lead=>v183CrossEstimate(m,S.crosser,S.spot,{runner:S.runner,space:true,lead});
  return {zero:d(0).duel,wait:d(1.5).duel,arrival0:d(0).arrival,arrival15:d(1.5).arrival};
 }
 function spreadEstimate({seed=0,size='standard'}={}){
  const est=v=>{const S=build({seed,size,params:{setplay:{spaceSpread:v}}});return v183CrossEstimate(match,S.crosser,S.spot,{runner:S.runner,space:true});};
  const a=est(.6),b=est(1);return {narrow:a.spread,wide:b.spread,landNarrow:a.land,landWide:b.land};
 }
 function sharedOffside({seed=0,size='standard'}={}){
  const S=build({seed,size}),m=match,P=v183OptParams(m),allies=m.people.filter(p=>p.t===S.team&&!p.keeper&&p!==S.crosser),rivals=m.people.filter(p=>p.t!==S.team&&!p.keeper);
  const run=()=>v183OptCached(()=>v183OptOptions(m,S.crosser,allies,rivals,P)).list.map(o=>[o.kind,o.ref,o.u]);
  const base=v55OffsideSnapshot;let calls=0;v55OffsideSnapshot=function(){calls++;return base.apply(this,arguments);};
  try{const A=run(),shared=calls;calls=0;const est=v183CrossEstimate;v183CrossEstimate=function(mm,p,t,detail={}){const {offside,...rest}=detail;return est.call(this,mm,p,t,rest);};
   try{const B=run();return {same:JSON.stringify(A)===JSON.stringify(B),shared,separate:calls,crosses:A.filter(x=>x[0]==='cross').length};}finally{v183CrossEstimate=est;}}
  finally{v55OffsideSnapshot=base;}
 }
 return {params,estimates,options,kick,signal,play,blocked,keeperFlight,leadEstimate,sharedOffside,spreadEstimate};
})();`);
const call=(fn,arg)=>copy(ev(`Crossing.${fn}(${JSON.stringify(arg||{})})`));

check('parameters: the add-on registers its keys in options and setplay and stores them with the match',()=>{
 ev('Crossing.estimates({})');const si=call('params').si;
 for(const key of ['crossSpace','crossSpots','crossRunnerRange','crossRunnerWide','crossRunnerBack','crossLead','crossSpaceGain'])assert.ok(Object.hasOwn(si.params.options,key),'options.'+key);
 for(const key of ['spaceCrossSpeed','spaceReaction','spaceSlackMax'])assert.ok(Object.hasOwn(si.params.setplay,key),'setplay.'+key);
 assert.equal(si.params.options.crossLead,2);assert.equal(si.params.options.crossLeadTau,3);assert.equal(si.params.setplay.spaceCrossSpeed,14);assert.deepEqual(si.params.options.crossSpots,[[4,6],[0,11],[-4,7]]);
});
check('estimate: a runner\'s path raises the arrival above the standing receiver; a spot beyond his cover is unreachable; the point estimate without a runner is unchanged in kind',()=>{
 for(const size of ['standard','large']){const e=call('estimates',{size});
  assert.equal(e.draws,0,'no random draw');assert.ok(e.space.runner,'runner is the receiver');
  assert.ok(e.space.arrival>e.standing.arrival*2&&e.space.arrival>=.2,`space ${e.space.arrival} vs standing ${e.standing.arrival}`);
  assert.ok(e.space.cover>e.space.gap&&e.space.reachable===1,`cover ${e.space.cover} gap ${e.space.gap}`);
  assert.ok(e.far.reachable===0&&e.far.arrival<.15,`far ${JSON.stringify(e.far)}`);
  assert.ok(e.farAdapted.adapted&&e.farAdapted.closer&&e.farAdapted.reachable>=.5&&e.farAdapted.arrival>e.far.arrival,`adapted ${JSON.stringify(e.farAdapted)}`);
  assert.ok(e.space.flight>e.point.flight,'floated cross flies longer');assert.ok(!e.point.space);}
});
check('options: the carrier gets one cross into space per runner at a box spot (closed ground pass), none with crossSpace 0 or the setplay package off',()=>{
 const on=call('options',{});assert.equal(on.draws,0);
 const mine=on.space.find(o=>o.runner);assert.ok(mine,'space cross to the runner: '+JSON.stringify(on.top));
 assert.ok(mine.atSpot&&mine.arrival>.2&&mine.rank<=3,JSON.stringify(mine));
 assert.ok(on.space.every(o=>o.atSpot),'every space cross targets a box spot');
 assert.ok(new Set(on.space.map(o=>o.ref)).size===on.space.length,'one option per runner');
 const off=call('options',{params:{options:{crossSpace:0}}});assert.equal(off.space.length,0,'crossSpace 0');
 const noSetplay=call('options',{packages:{setplay:false}});assert.equal(noSetplay.space.length,0,'setplay off');
});
check('execution: the ball floats to the spot, the runner is contender, enters the box after the kick, the signal lives during the flight; arrivals and air shots over the seeds',()=>{
 let complete=0,shots=0,beyond=0,errors=0;
 for(let seed=0;seed<seeds;seed++){const k=call('kick',{seed});
  assert.ok(k.flight&&k.kind==='cross'&&k.ledgerKind==='cross'&&k.sources.includes('cross'),'cross flight: '+JSON.stringify({kind:k.kind,ledger:k.ledgerKind}));
  assert.ok(k.run&&k.run.kicked===true&&k.run.runnerId&&Number.isFinite(k.run.x),'crossRun during the flight: '+JSON.stringify(k.run));
  assert.equal(k.runAfter,null,'crossRun removed after the landing');
  assert.ok(k.contender,'runner is contender');assert.ok(k.error<=7,'landing error '+k.error);assert.ok(!k.clamped,'cross-run intent not clamped during the flight');
  assert.ok(k.seconds>=.9,'floated flight '+k.seconds);assert.equal(k.crosses,1);
  complete+=k.complete;shots+=k.airShots;beyond+=k.beyond;errors+=k.error;}
 assert.ok(beyond/seeds>1,'runner crosses the kick-time line on average by '+(beyond/seeds).toFixed(2)+' m');
 assert.ok(complete>=Math.ceil(seeds*.2),`arrivals ${complete} of ${seeds}`);assert.ok(shots>=1,'air shots '+shots);assert.ok(errors/seeds<=3.5,'mean landing error '+(errors/seeds).toFixed(2));
});
check('execution large pitch: same mechanism',()=>{
 let complete=0;for(let seed=0;seed<Math.min(seeds,6);seed++){const k=call('kick',{seed,size:'large'});assert.ok(k.flight&&k.kind==='cross'&&k.contender&&k.run?.kicked&&k.runAfter===null,JSON.stringify({f:k.flight,kind:k.kind,c:k.contender}));complete+=k.complete;}
 assert.ok(complete>=1,'arrivals large '+complete);
});
check('offside is judged at the kick: a runner beyond the line when the ball leaves is whistled, not one who enters during the flight',()=>{
 let whistled=0;for(let seed=0;seed<6;seed++){const k=call('kick',{seed,runnerBeyond:2.5,markerGap:-4});if(k.offside)whistled++;assert.equal(k.complete,0,'no completion from an offside position');}
 assert.ok(whistled>=4,'whistled '+whistled+' of 6');
});
check('signal (crossLead): the runner follows the signal at the line until the kick, the carrier kicks at kickAt, the clamp releases in the air',()=>{
 for(const seed of [0,1,2]){const sg=call('signal',{seed,lead:.5});
  assert.equal(sg.fallback,null);assert.ok(sg.run0&&sg.run0.kicked===false&&Math.abs(sg.run0.kickAt-sg.run0.at-.5)<1e-9,JSON.stringify(sg.run0));assert.ok(sg.carry,'carrier keeps the ball');
  const pre=sg.samples.filter(x=>x.pattern==='cross-run');assert.ok(pre.length>=5&&pre.every(x=>x.atSpot&&x.clampedToLimit!==false),'runner intent at the spot, clamped: '+JSON.stringify(sg.samples.slice(0,4)));
  assert.ok(sg.kickedAt!==null&&sg.kickedAt>=.5&&sg.kickedAt<=1,'kick at '+sg.kickedAt);assert.ok(sg.flight&&sg.kind==='cross','cross flight');
  assert.ok(sg.released&&sg.moved,'released in the air: '+JSON.stringify({released:sg.released,moved:sg.moved}));
  // The kickAt record is written after the attempt (SI-K2): kick:true, or queued:true when the kick waits for a body turn.
  assert.ok(sg.trace.some(e=>e.kind==='pattern')&&sg.trace.some(e=>e.kind==='cross-run'&&(e.kick===true||e.queued===true)),JSON.stringify(sg.trace));assert.equal(sg.runAfter,null);}
});
check('signal aborted: a runner offside at kickAt gets no cross; the carrier decides anew',()=>{
 const sg=call('signal',{seed:3,lead:.5,offsideAtKick:true});
 // The first signal aborts; a later kick can only come from a new decision with its own signal.
 const abort=sg.trace.findIndex(e=>e.abort==='offside');assert.ok(abort>=0,JSON.stringify(sg.trace));
 assert.ok(sg.kickedAt===null||sg.kickedAt>=1&&sg.trace.filter(e=>e.kind==='pattern').length>=2,JSON.stringify({kickedAt:sg.kickedAt,trace:sg.trace}));assert.equal(sg.runAfter,null);
});
check('restore during the signal keeps attackFlow.crossRun as plain data and the match kicks after the restore',()=>{
 const sg=call('signal',{seed:4,lead:.6,restore:true});
 assert.ok(sg.restored,'checkpoint taken');assert.deepEqual(sg.saved,sg.run0);assert.ok(sg.kickedAt!==null&&sg.flight,'kicked after restore '+JSON.stringify({k:sg.kickedAt,f:sg.flight}));
});
check('a blocked cross into space removes attackFlow.crossRun (no re-kick from a stale signal)',()=>{
 for(const seed of [0,1]){const b=call('blocked',{seed});assert.equal(b.pending,false,'no queued turn');assert.ok(b.blocks>=1,'blocked: '+JSON.stringify(b));assert.equal(b.run,null,'crossRun after the block');}
});
check('full constructor matches: crosses into space occur, their state is plain JSON (both sizes)',()=>{
 for(const size of ['standard','large']){const r=call('play',{size});assert.ok(r.plain,'plain');assert.ok(r.spaceCrosses>=1,size+' space crosses '+r.spaceCrosses);assert.ok(r.runs>=1,'signals '+r.runs);}
 const off=call('play',{params:{options:{crossSpace:0}}});assert.equal(off.spaceCrosses,0);assert.equal(off.runs,0);
});

// ----- SI-K2 (calibration round 2): keeper, marker, estimate, offside snapshot -----
check('SI-K2 keeper: during a cross into space he steps onto the landing-goal line (keeperShiftOpen 1, the default since the Torjäger round), part of the way at .4, not with 0; pure target, both sizes',()=>{
 for(const size of ['standard','large']){let on=0,part=0,off=0,n=0;
  for(let seed=0;seed<6;seed++)for(const spot of ['spot','near']){
   const a=call('keeperFlight',{seed,size,spot}),d=call('keeperFlight',{seed,size,spot,params:{setplay:{keeperShiftOpen:.4}}}),b=call('keeperFlight',{seed,size,spot,params:{setplay:{keeperShiftOpen:0}}});
   assert.ok(a.flight&&b.flight&&d.flight,'flights');assert.ok(a.pure&&d.pure,'no draw, same target twice');on+=a.off;part+=d.off;off+=b.off;n++;}
  console.log(`     ${size}: keeper offset at the landing ${(on/n).toFixed(2)} m (share 1, default) / ${(part/n).toFixed(2)} m (.4) / ${(off/n).toFixed(2)} m (0)`);
  assert.ok(on/n<.6,size+' keeper on the line: mean offset '+(on/n).toFixed(2));assert.ok(off/n>on/n+.5,size+' offset without the shift '+(off/n).toFixed(2)+' vs '+(on/n).toFixed(2));
  assert.ok(part/n<off/n&&part/n>on/n,size+' share .4 between: '+(part/n).toFixed(2));}
});
check('SI-K2 spaceSpread: the landing error of a cross into space scales with setplay.spaceSpread (estimate and execution)',()=>{
 for(const size of ['standard','large']){const e=call('spreadEstimate',{size});assert.ok(Math.abs(e.narrow/e.wide-.6)<.02,JSON.stringify(e));assert.ok(e.landNarrow>=e.landWide,JSON.stringify(e));}
 let narrow=0,wide=0;for(let seed=0;seed<6;seed++){narrow+=call('kick',{seed,params:{setplay:{spaceSpread:.6}}}).error;wide+=call('kick',{seed,params:{setplay:{spaceSpread:1}}}).error;}
 assert.ok(narrow<wide,`mean landing error ${(narrow/6).toFixed(2)} vs ${(wide/6).toFixed(2)} m`);
});
// Score-state pace of the Torjäger round off in the marker scenes: the 1.5 s wait is sensitive to tiny pace changes (with it
// 5 of 10 scenes still kick, nearest defender 1.16 vs 2.20 m); test-si-scorer-v183 covers the state factor.
const NO_STATE={leadPace:0,levelPace:0,leashLead:0};
check('SI-K2 marker: a signalled run gets one marker (plain record), who is closer to the landing than without crossMark',()=>{
 // The defender starts 3 m behind the runner (upfield), so only a reaction to the run brings him back into the duel.
 let withMark=0,without=0,n=0,defaults=0;
 for(const size of ['standard','large'])for(let seed=0;seed<5;seed++){
  // Mechanism at crossMarkGap 0 (level with the runner); the default -1 trails him by a metre (arrival trade-off, SI-K2 doc) and is checked for the record and his tracking only.
  const a=call('keeperFlight',{seed,size,lead:1.5,markerGap:-3,params:{defence:{crossMarkGap:0},offball:NO_STATE}}),b=call('keeperFlight',{seed,size,lead:1.5,markerGap:-3,params:{defence:{crossMark:0},offball:NO_STATE}}),d=call('keeperFlight',{seed,size,lead:1.5,markerGap:-3,params:{offball:NO_STATE}});
  if(d.flight){defaults++;assert.ok(d.mark&&d.mark.markerId&&d.plain&&d.kickGap<=3,'default marker '+JSON.stringify({mark:d.mark,gap:d.kickGap}));}
  if(!a.flight||!b.flight)continue;
  assert.ok(a.mark&&a.mark.markerId&&a.mark.runnerId,'mark record '+JSON.stringify(a.mark));assert.ok(a.plain,'plain mark');assert.equal(b.mark,null,'no mark with crossMark 0');
  assert.ok(a.kickGap<=3,'marker near the runner at the kick: '+a.kickGap);withMark+=a.nearest;without+=b.nearest;n++;}
 console.log(`     nearest defender at the landing ${(withMark/n).toFixed(2)} m (crossMark 0: ${(without/n).toFixed(2)} m), n=${n}`);assert.ok(n>=6&&defaults>=5,"flights "+n+" default flights "+defaults);assert.ok(withMark/n<without/n,'nearest defender at the landing '+(withMark/n).toFixed(2)+' vs '+(without/n).toFixed(2));
});
check('SI-K2 estimate: the nearest defender moves during the wait (lead) as well, so the duel value falls below the uncontested .92',()=>{
 for(const size of ['standard','large']){const e=call('leadEstimate',{size});assert.ok(e.wait<e.zero||e.wait<.92,JSON.stringify(e));assert.ok(e.wait<.92,'duel with lead '+e.wait);}
});
check('SI-K2 offside snapshot: one shared set per evaluation gives the same option list with fewer snapshots',()=>{
 for(const size of ['standard','large'])for(const seed of [0,1]){const r=call('sharedOffside',{seed,size});assert.ok(r.same,'identical options');assert.ok(r.crosses>=1&&r.shared<r.separate,JSON.stringify(r));}
});

console.log(JSON.stringify({pass:failures.length===0,suite:'si-crossing-v183',checks:checks.length,failures}));
if(failures.length)process.exitCode=1;
