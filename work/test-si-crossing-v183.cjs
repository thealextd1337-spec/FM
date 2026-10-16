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
 function kick({seed=0,size='standard',runnerBeyond=0,markerGap=1.5,spot='spot'}={}){
  const S=build({seed,size,runnerBeyond,markerGap}),m=match,team=S.team,runner=S.runner,crosser=S.crosser,s=v160PitchScale(m),point=spot==='near'?S.near:S.spot;
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
 return {params,estimates,options,kick,signal,play,blocked};
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
  assert.ok(sg.trace.some(e=>e.kind==='pattern')&&sg.trace.some(e=>e.kick===true),JSON.stringify(sg.trace));assert.equal(sg.runAfter,null);}
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

console.log(JSON.stringify({pass:failures.length===0,suite:'si-crossing-v183',checks:checks.length,failures}));
if(failures.length)process.exitCode=1;
