'use strict';
// SI 183 package SI-4 (defence, radii, fouls): the actual dist controllers in the
// native VM harness. Old path: matches without package defence replay unchanged;
// new path: one contact path, fouls only inside contact events, roles (presser,
// safety defender, counter-pressing), pressure radii in metres, pace parameters,
// v183Clearance and block direction, B03 scenes with the package on, restore.
// Usage: node work/test-si-defence-v183.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs'),{root}=require('./native130-harness.cjs');
const checks=[],measurements={};const check=(name,fn)=>{fn();checks.push(name);};
const h=create({view:false}),ev=text=>h.evaluate(text),copy=value=>h.copy(value);

// Scenes in the frame of the defending team d: depth in metres from its goal line,
// lateral across (mirrored for team 1). The carrier belongs to team 1-d.
h.run(require('./si-defence-scenes-v183.cjs').source,'native-defence-scenes');
const scene=cfg=>{ev(`NativeDef.build(${JSON.stringify(cfg)})`);};
const metres=(p,q)=>ev(`v122Metres(match.people.find(x=>x.pid==='${p}'),match.people.find(x=>x.pid==='${q}'))`);

// ----- registration and switch -----
check('defaults are plain JSON, the switch is on by default and stored with each new match',()=>{
 const defaults=copy(ev('v183Registry.defaults.defence'));
 for(const key of ['passPressureRadius','crossPressureRadius','shotPressureRadius','decisionPressureRadius','contactWindow','slideInterval','slideForecast','standingFoulScale','pressPace','coverPace','coverZone','coverRange','coverDepth','coverLeash','counterWindow','counterWindowPress','counterZone','counterRange','counterPressers','counterWide','counterCutters','counterLane','counterContactWindow','clearOutBase','clearOutPressure','clearOutBox','clearOutMax','clearCalm','blockOutBase','blockOutBox','blockBias','blockSpread','blockSkill'])assert(Number.isFinite(defaults[key]),key);
 assert.equal(ev('v183Registry.enabled.defence'),true);
 h.call('Native183.constructed',{});
 assert.equal(ev("v183Active(match,'defence')"),true);assert.deepEqual(copy(ev('match.si.params.defence')),defaults);
 h.call('Native183.constructed',{si:{packages:{defence:false}}});assert.equal(ev("v183Active(match,'defence')"),false);
 h.call('Native183.constructed',{si:{params:{defence:{contactWindow:.4}}}});assert.equal(ev("v183Param(match,'defence.contactWindow')"),.4);
 assert.throws(()=>h.call('Native183.constructed',{si:{params:{defence:{contactWindows:.4}}}}),/Unknown SI parameter/);
 assert.throws(()=>h.call('Native183.constructed',{si:{params:{defence:{contactWindow:'x'}}}}),/number expected/);
});

// ----- old path: package off or no marker -----
check('v50Foul keeps its own contact gate; with the package every awarded foul is traced, outside the contact functions with contact:false',()=>{
 const foul=on=>{scene({on,defs:[{depth:29.25,lateral:.3}],carrier:{vy:4}});return copy(ev(`(()=>{const m=match,v=m.owner,o=m.people.find(x=>x.pid==='def0'),result=v50Foul(v,o);return {result,fouls:m.setPieceStats.fouls.slice(),sp:m.setPiece?.type||null,trace:v183TraceEntries(m).map(e=>e.type)};})()`));};
 const legacy=foul(false),marked=foul(true);
 assert.equal(legacy.sp,'freeKick');assert.equal(legacy.fouls[0]+legacy.fouls[1],1);
 assert.equal(marked.sp,'freeKick');assert.equal(marked.fouls[0]+marked.fouls[1],1);assert(marked.trace.includes('foul'),'traced');assert(!marked.trace.includes('foul-refused'));
 // Beyond body contact (43/32 m) no foul is awarded, with or without the package.
 for(const on of [false,true]){scene({on,defs:[{depth:26,lateral:3}],carrier:{vy:4}});assert.equal(copy(ev(`(()=>{const m=match;v50Foul(m.owner,m.people.find(x=>x.pid==='def0'));return m.setPiece?.type||null;})()`)),null);}
 // No marker at all (rules 182): the wrapper is inert.
 scene({on:null,defs:[{depth:29.25,lateral:.3}],carrier:{vy:4}});
 assert.equal(copy(ev("(()=>{const m=match;v50Foul(m.owner,m.people.find(x=>x.pid==='def0'));return m.setPiece?.type||null;})()")),'freeKick');
});
// Packages of other owners may be on by default (SI-0 clock etc.): the legacy comparison switches every package off.
const allOff=Object.fromEntries(copy(ev('[...V183_PACKAGES]')).map(p=>[p,false]));
check('package off replays a constructed match exactly like the 182 constructor (digest without match.si)',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes')).filter((s,i)=>i%4===1)){
  const off=h.call("Native183.constructedDigest",scene,{si:{packages:allOff},ball:false,withoutSi:true,segments:[250,250]}),legacy=h.call('Native183.constructedDigest',scene,{si:false,segments:[250,250]});
  assert.equal(off,legacy,scene.id);
 }
});
check('pressure radius: legacy ellipse without the package, metres with it (same result on both pitch sizes)',()=>{
 const r=copy(ev(`(()=>{
  const out={};
  for(const size of ['standard','large'])for(const on of [false,true]){
   NativeDef.build({size,on,defs:[{depth:26,lateral:0}]});const m=match,{s}=NativeDef.frame(size,0),a=m.owner,probe=(depthM,lateralM)=>{const q={x:a.x+lateralM/s.x,y:a.y+depthM/s.y};return v183Radius(m,'defence.passPressureRadius',.15)(a,q);};
   out[size+on]={y8:probe(8,0),y10:probe(10,0),x8:probe(0,8),x6:probe(0,6)};
  }
  return out;})()`));
 // Legacy: .15 = 7.3 m wide / 11.0 m deep on the standard pitch, 20 % more on the large one.
 assert.deepEqual(r.standardfalse,{y8:true,y10:true,x8:false,x6:true});assert.deepEqual(r.largefalse,{y8:true,y10:true,x8:true,x6:true});
 assert.deepEqual(r.standardtrue,{y8:true,y10:false,x8:true,x6:true});assert.deepEqual(r.largetrue,r.standardtrue);
 // The weiche sits in pitch-v55.js (ground pass) and set-pieces-v50.js (block direction).
 const pitch=fs.readFileSync(path.join(root,'dist/pitch-v55.js'),'latin1'),block=fs.readFileSync(path.join(root,'dist/set-pieces-v50.js'),'latin1');
 assert(pitch.includes("v183Radius(m,'defence.passPressureRadius',.15)(player,passer):distance(player,passer)<.15"));assert(block.includes('v183BlockAim(match,defender)'));
});

// ----- one contact path -----
check('the decision path no longer opens duels; the tick check does (legacy: both)',()=>{
 const run=on=>{scene({on,defs:[{depth:29.25,lateral:.3}],carrier:{vy:4}});return copy(ev(`(()=>{const p=match.people.find(x=>x.pid==='def0'),c=match.owner;Math.random=()=>.99;const attempts=()=>p.stats.tackleAttempts||0,r1=v56MaybeChallenge(c),a1=attempts();match.attackFlow.challengeAt=null;v182ContactCheck(match);return {a1,a2:attempts()};})()`));};
 assert.deepEqual(run(true),{a1:0,a2:1});assert.deepEqual(run(false),{a1:1,a2:1});
});
check('contact window is a stored parameter: a second try inside the window is refused',()=>{
 const tries=window=>{scene({on:true,si:{params:{defence:{contactWindow:window}}},defs:[{depth:29.25,lateral:.3}],carrier:{vy:0}});return ev(`(()=>{const p=match.people.find(x=>x.pid==='def0'),c=match.owner;Math.random=()=>.99;let n=0;for(let i=0;i<20;i++){p.recoverUntil=0;v182ContactCheck(match);n=p.stats.tackleAttempts||0;match.elapsed+=.05*MATCH_SPEED;const state=v102State(match);state.clock+=.05;}return n;})()`);};
 const short=tries(.25),long=tries(.5);measurements.attemptsPerSecondWindow={'.25':short,'.5':long};
 assert(short>long&&long>=1&&short>=3);
});
check('a foul is awarded only inside a contact event (standing tackle) and leaves a trace with the gap',()=>{
 scene({on:true,defs:[{depth:29.25,lateral:.3}],carrier:{vy:4}});
 const r=copy(ev(`(()=>{const m=match,p=m.people.find(x=>x.pid==='def0');Math.random=()=>0;v182ContactCheck(m);return {fouls:m.setPieceStats.fouls.slice(),sp:m.setPiece?.type||null,trace:v183TraceEntries(m).filter(e=>e.type==='foul')};})()`));
 assert.equal(r.fouls[0]+r.fouls[1],1);assert.equal(r.sp,'freeKick');assert.equal(r.trace.length,1);assert(r.trace[0].gap<=43,String(r.trace[0].gap));
 // Foul chance scale 0: no foul from a standing tackle in many attempts.
 scene({on:true,si:{params:{defence:{standingFoulScale:0}}},defs:[{depth:29.25,lateral:.3}],carrier:{vy:0}});
 const none=ev(`(()=>{const m=match,p=m.people.find(x=>x.pid==='def0');let fouls=0;Math.random=()=>.0001;for(let i=0;i<30&&!m.setPiece;i++){match.attackFlow.challengeAt=null;p.recoverUntil=0;m.elapsed+=.05;v182ContactCheck(m);v102State(m).clock+=1;}return m.setPieceStats.fouls[0]+m.setPieceStats.fouls[1]+(m.setPiece?1:0);})()`);
 assert.equal(none,0);
});
check('B03 with the package on: a slide from behind with body contact is always a foul',()=>{
 for(const d of [0,1]){
  scene({on:true,d,defs:[{depth:30.7,lateral:.2}],carrier:{vy:5}});
  const r=copy(ev(`(()=>{const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0');t.slideActive=true;m.slide={tackler:t,victim:c,from:{x:t.x,y:t.y},target:{x:c.x,y:c.y},progress:0,behind:true};const f0=m.setPieceStats.fouls[0]+m.setPieceStats.fouls[1];Math.random=()=>.5;v56AdvanceSlide(.05*MATCH_SPEED);return {fouls:m.setPieceStats.fouls[0]+m.setPieceStats.fouls[1]-f0,sp:m.setPiece?.type||null,trace:v183TraceEntries(m).filter(e=>e.type==='foul').length};})()`));
  assert.equal(r.fouls,1,'team '+d);assert.equal(r.sp,'freeKick');assert.equal(r.trace,1);
 }
});
check('slide forecast: reaches the ball, runs past, or hits the body first',()=>{
 const forecast=(carrier,sliderDepth,sliderLateral,ballShift)=>{scene({on:true,defs:[{depth:sliderDepth,lateral:sliderLateral}],carrier});return ev(`(()=>{const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0'),s=v150Scale(m);m.ball={x:c.x+(t.x-c.x)*${ballShift},y:c.y+(t.y-c.y)*${ballShift}};return v183DefSlideForecast(m,t,c);})()`);};
 // Standing carrier with the ball between him and the slider: the ball comes first.
 assert.equal(forecast({vy:0},28.4,.4,.6),'ball');
 // Carrier running away from a slider behind him: no ball.
 assert.notEqual(forecast({vy:6},31.5,.2,0),'ball');
 // From behind with the body in reach: a foul (B03), never a ball win.
 assert.equal(forecast({vy:1},30.7,.1,0),'foul');
});

// ----- roles: presser, safety defender, rest -----
const ROLE_BASE={carrier:{depth:30,lateral:0,vy:3},defs:[{depth:26.5,lateral:1,line:'def'},{depth:24,lateral:6,line:'mid'},{depth:17,lateral:-10,line:'def'}]};
const targets=(cfg,ticks=1)=>{scene(cfg);return copy(ev(`(()=>{const m=match;for(let i=0;i<${ticks};i++)Native182.advance();const owner=m.owner,out={};
  for(const p of m.people.filter(x=>x.pid.startsWith('def'))){v159DefensiveTarget(m,p);out[p.pid]={tx:p.tx,ty:p.ty,kind:m.attackFlow.defenseReads?.[p.pid]?.kind||null,gap:v122Metres(p,owner)};}
  out.owner={x:owner.x,y:owner.y};out.state=m.attackFlow.defence;return out;})()`));};
check('safety defender: the second nearest stands behind the presser on the carrier-goal line',()=>{
 const on=targets({...ROLE_BASE,on:true}),off=targets({...ROLE_BASE,on:false});
 assert.equal(on.def1.kind,'cover');assert.equal(on.def0.kind,null);assert.equal(on.def2.kind,null);assert.equal(off.def1.kind,null);
 const s=copy(ev('NativeDef.frame("standard",0).s')),goalY=copy(ev('v55Field.bottom')),dx=(on.def1.tx-on.owner.x)*s.x,dy=(on.def1.ty-on.owner.y)*s.y,gx=(.5-on.owner.x)*s.x,gy=(goalY-on.owner.y)*s.y;
 const along=(dx*gx+dy*gy)/Math.hypot(gx,gy),across=Math.abs(dx*gy-dy*gx)/Math.hypot(gx,gy);
 measurements.coverSpotMetres={along:+along.toFixed(2),across:+across.toFixed(2)};
 assert(along>4.4&&along<12.1,String(along));assert(across<1,String(across));
 assert(on.def1.tx!==off.def1.tx||on.def1.ty!==off.def1.ty);
 // The presser is untouched: same target with and without the package.
 assert.equal(on.def0.tx,off.def0.tx);assert.equal(on.def0.ty,off.def0.ty);
 assert.deepEqual(on.state.cover,['def1',null]);
});
check('safety defender needs a dangerous situation (carrier inside the cover zone, defender within range)',()=>{
 assert.equal(targets({...ROLE_BASE,on:true,carrier:{depth:52,lateral:0,vy:3},defs:[{depth:48.5,lateral:1},{depth:46,lateral:6},{depth:40,lateral:-10}]}).def1.kind,null,'beyond the cover zone');
 assert.equal(targets({...ROLE_BASE,on:true,defs:[{depth:26.5,lateral:1},{depth:12,lateral:6},{depth:17,lateral:-10}]}).def1.kind,null,'beyond the cover range');
});
check('safety defender: the choice is sticky within 1.5 m, a clearly nearer player takes over',()=>{
 scene({...ROLE_BASE,on:true});
 const r=copy(ev(`(()=>{
  const m=match,owner=m.owner,s=v150Scale(m),[d0,d1,d2]=['def0','def1','def2'].map(id=>m.people.find(x=>x.pid===id)),out=[];
  const put=(p,dist,angle)=>{p.x=owner.x+Math.sin(angle)*dist/s.x;p.y=owner.y+Math.cos(angle)*dist/s.y;};
  const tick=()=>{v102State(m).clock+=.05;for(const p of [d0,d1,d2])v159DefensiveTarget(m,p);return m.attackFlow.defence.cover[0];};
  put(d0,3,.2);put(d1,8,-1);put(d2,12,1);out.push(tick());put(d2,7.2,1);out.push(tick());put(d2,5,1);out.push(tick());return out;})()`));
 assert.deepEqual(r,['def1','def1','def2']);
});
// ----- ball line (B23): no defensive target upfield of the ball -----
const lineTargets=cfg=>{scene(cfg);return copy(ev(`(()=>{const m=match,s=v150Scale(m),out={};Native182.advance();
  for(const p of m.people.filter(x=>x.pid.startsWith('def'))){v159DefensiveTarget(m,p);const read=m.attackFlow.defenseReads?.[p.pid];out[p.pid]={purpose:read?.purpose||null,kind:read?.kind||null,goalSideM:+((p.ty-m.ball.y)*s.y).toFixed(2),readGoalSideM:read?+((read.target.y-m.ball.y)*s.y).toFixed(2):null};}
  return out;})()`));};
check('ball line: the third defender marking a receiver behind the ball stops 1 m goal-side of the ball (base: 6 m upfield)',()=>{
 // Team 0 defends the bottom goal: goal-side = larger y. The carrier advances; att0 offers 8 m behind the ball, 10 m from def2 (within the 12 m leash of the def anchor).
 const cfg={carrier:{depth:24,lateral:0,vy:3},defs:[{depth:20.5,lateral:1,line:'def'},{depth:18,lateral:5,line:'mid'},{depth:22,lateral:-9,line:'def'}],atts:[{depth:32,lateral:-11}]};
 const off=lineTargets({...cfg,on:false}),on=lineTargets({...cfg,on:true});
 assert.equal(off.def2.purpose,'receiver');assert(off.def2.goalSideM<-3,'base target upfield of the ball: '+off.def2.goalSideM);
 assert.equal(on.def2.purpose,'receiver');assert.equal(on.def2.kind,null);assert.equal(on.def2.goalSideM,1);assert.equal(on.def2.readGoalSideM,1);
 assert.equal(on.def0.purpose,'press');assert.equal(on.def1.kind,'cover');
});
check('ball line: a safety defender leashed to a far anchor stays at the ball line instead of running back toward his anchor',()=>{
 const cfg={on:true,carrier:{depth:30,lateral:0,vy:3},defs:[{depth:26.5,lateral:1,line:'def'},{depth:24,lateral:5,line:'att',anchorDepth:58,anchorLateral:5},{depth:17,lateral:-10,line:'def'}]};
 const on=lineTargets(cfg),loose=lineTargets({...cfg,si:{params:{defence:{coverLeash:60}}}});
 assert.equal(on.def1.kind,'cover');assert.equal(on.def1.goalSideM,1);
 // Without the leash the cover spot itself lies goal-side of the ball and is not touched.
 assert.equal(loose.def1.kind,'cover');assert(loose.def1.goalSideM>4,String(loose.def1.goalSideM));
 // Pressing targets are never clamped: the presser's point may lie wherever the pursuit puts it.
 assert.equal(on.def0.purpose,'press');
});
check('the package off leaves every defensive target to the previous function (same targets as without marker)',()=>{
 const unmarked=targets({...ROLE_BASE,on:null}),off=targets({...ROLE_BASE,on:false});
 for(const id of ['def0','def1','def2']){assert.equal(unmarked[id].tx,off[id].tx);assert.equal(unmarked[id].ty,off[id].ty);}
});

// ----- counter-pressing -----
const COUNTER={carrier:{depth:54,lateral:0,vy:2},defs:[{depth:52.2,lateral:1.5,line:'att'},{depth:50.5,lateral:-6,line:'mid'},{depth:41,lateral:10,line:'def'}],atts:[{depth:30,lateral:5}]};
// A turnover: team 0 (the defending frame d=0) had the ball, then the carrier of team 1 has it.
// SI-K switched the window off by default (counterWindow 0); the mechanism scenes set the former 2/3 s explicitly.
const withWindow=cfg=>({...cfg,si:{...(cfg.si||{}),params:{...(cfg.si?.params||{}),defence:{counterWindow:2,counterWindowPress:3,...(cfg.si?.params?.defence||{})}}}});
const turnover=(cfg,after=``)=>{scene(withWindow({...COUNTER,...cfg}));return copy(ev(`(()=>{const m=match,carrier=m.owner,mine=m.people.find(x=>x.pid==='def0'),probe=m.people.find(x=>x.pid==='att0'),out={};
  m.owner=mine;m.ball={x:mine.x,y:mine.y};v102State(m).clock+=.05;v159DefensiveTarget(m,probe);out.before=m.attackFlow.defence?.poss??null;
  m.owner=carrier;m.ball={x:carrier.x,y:carrier.y};v102State(m).clock+=.05;
  const loop=()=>{v159DefensiveTarget(m,probe);for(const p of m.people.filter(x=>x.pid.startsWith('def')))v159DefensiveTarget(m,p);};loop();
  ${after}
  v102State(m).clock+=.05;v159DefensiveTarget(m,probe);
  for(const p of m.people.filter(x=>x.pid.startsWith('def'))){v159DefensiveTarget(m,p);out[p.pid]={tx:p.tx,ty:p.ty,kind:m.attackFlow.defenseReads?.[p.pid]?.kind||null,gap:v122Metres(p,carrier)};}
  out.counter=m.attackFlow.defence?.counter??null;out.clock=v102Clock(m);return out;})()`));};
check('counter-pressing: a turnover in the loser\'s final third opens a window for the two nearest willing players',()=>{
 const on=turnover({on:true}),off=turnover({on:false});
 assert.equal(on.before,0);assert.deepEqual({team:on.counter.team},{team:0});assert(Math.abs(on.counter.until-on.counter.at-2)<1e-9);
 assert.equal(on.def0.kind,'counter');assert.equal(on.def1.kind,'counter');assert.equal(on.def2.kind,null,'beyond counterRange');
 // The press targets are goal-side points close to the carrier, not the formation anchors.
 for(const id of ['def0','def1'])assert(Math.hypot((on[id].tx-.5)*0+(on[id].ty-on[id].ty),0)===0);
 const s=copy(ev('NativeDef.frame("standard",0).s'));
 for(const id of ['def0','def1']){const p=copy(ev(`(()=>{const p=match.people.find(x=>x.pid==='${id}'),c=match.owner;return {x:p.x,y:p.y,bx:p.bx,by:p.by,cx:c.x,cy:c.y};})()`)),d=Math.hypot((on[id].tx-p.cx)*s.x,(on[id].ty-p.cy)*s.y),anchor=Math.hypot((on[id].tx-p.bx)*s.x,(on[id].ty-p.by)*s.y);assert(d<4,id+' '+d);}
 assert.equal(off.counter,null);
 // The second presser is shifted sideways (counterWide) against the first press point.
 const a=Math.hypot((on.def1.tx-on.def0.tx)*s.x,(on.def1.ty-on.def0.ty)*s.y);assert(a>.5,String(a));
});
check('counter-pressing: window length follows early pressing, regaining or time ends it, far turnovers open none, roles can refuse',()=>{
 assert(Math.abs(turnover({on:true,press:1}).counter.until-turnover({on:true,press:1}).counter.at-3)<1e-9);
 assert.equal(turnover({on:true,carrier:{depth:30,lateral:0,vy:2},defs:[{depth:28.2,lateral:1.5},{depth:26.5,lateral:-6},{depth:20,lateral:10}]}).counter,null,'outside counterZone');
 assert.equal(turnover({on:true},'v102State(m).clock+=2.5;').counter,null,'expired');
 assert.equal(turnover({on:true},'m.owner=m.people.find(x=>x.pid===\'def1\');m.ball={x:m.owner.x,y:m.owner.y};').counter,null,'regained');
 const refused=turnover({on:true,defs:[{depth:52.2,lateral:1.5,line:'def',role:'line-keeper'},{depth:50.5,lateral:-6,line:'mid'},{depth:49,lateral:8,line:'mid'}]});
 assert.equal(refused.def0.kind,null);assert.equal(refused.def1.kind,'counter');assert.equal(refused.def2.kind,'counter');
 const onePresser=turnover({on:true,si:{params:{defence:{counterPressers:1,counterCutters:0}}}});assert.equal(onePresser.def0.kind,'counter');assert.equal(onePresser.def1.kind,null);
});
check('counter-pressing (SI-K default): counterWindow 0 opens no window',()=>{
 const r=copy(ev(`(()=>{NativeDef.build(${JSON.stringify({...COUNTER,on:true})});const m=match;return {window:v183Param(m,'defence.counterWindow'),press:v183Param(m,'defence.counterWindowPress')};})()`));
 assert.deepEqual(r,{window:0,press:0});

 const off=(()=>{scene({...COUNTER,on:true});return copy(ev(`(()=>{const m=match,carrier=m.owner,mine=m.people.find(x=>x.pid==='def0'),probe=m.people.find(x=>x.pid==='att0');m.owner=mine;m.ball={x:mine.x,y:mine.y};v102State(m).clock+=.05;v159DefensiveTarget(m,probe);m.owner=carrier;m.ball={x:carrier.x,y:carrier.y};v102State(m).clock+=.05;for(const p of m.people)v159DefensiveTarget(m,p);v102State(m).clock+=.05;for(const p of m.people)v159DefensiveTarget(m,p);const c=m.attackFlow.defence?.counter;return {active:Boolean(c&&c.until>v102Clock(m)),kinds:m.people.filter(x=>x.pid.startsWith('def')).map(p=>m.attackFlow.defenseReads?.[p.pid]?.kind||null)};})()`));})();
 assert.equal(off.active,false);assert(!off.kinds.includes('counter'),JSON.stringify(off.kinds));
});
check('counter-pressing: further willing players cut the lane from the carrier to his nearest team-mate',()=>{
 scene(withWindow({...COUNTER,on:true,si:{params:{defence:{counterPressers:1,counterCutters:1}}}}));
 const r=copy(ev(`(()=>{const m=match,carrier=m.owner,mine=m.people.find(x=>x.pid==='def0'),probe=m.people.find(x=>x.pid==='att0'),cutter=m.people.find(x=>x.pid==='def1');
  m.owner=mine;m.ball={x:mine.x,y:mine.y};v102State(m).clock+=.05;v159DefensiveTarget(m,probe);m.owner=carrier;m.ball={x:carrier.x,y:carrier.y};v102State(m).clock+=.05;
  for(const p of m.people.filter(x=>x.pid.startsWith('def')))v159DefensiveTarget(m,p);
  const s=v150Scale(m),lane=v183Param(m,'defence.counterLane'),mate=probe,expected={x:mate.x+(carrier.x-mate.x)*lane,y:mate.y+(carrier.y-mate.y)*lane};
  return {kind:m.attackFlow.defenseReads.def1.kind,dx:Math.abs((cutter.tx-expected.x)*s.x),dy:Math.abs((cutter.ty-expected.y)*s.y),press:m.attackFlow.defenseReads.def0.kind};})()`));
 assert.equal(r.kind,'counter');assert.equal(r.press,'counter');assert(r.dx<.6&&r.dy<.6,JSON.stringify(r));
});
check('pace: pressing and the safety defender use the stored factors; other purposes keep the previous owner (SI-2 off, it owns carrier pace)',()=>{
 const r=copy(ev(`(()=>{
  NativeDef.build({on:true,si:{packages:{offball:false},params:{defence:{pressPace:1.3,coverPace:1.2}}}});const m=match,p=m.people.find(x=>x.pid==='def0'),now=v152Seconds(m),read=kind=>({nextAt:now+1,purpose:kind==='cover'?'cover':'press',kind});
  m.attackFlow.defenseReads={def0:read('press')};const press=v183PaceFactor(m,p,'purposeful',{factor:1.58,read:m.attackFlow.defenseReads.def0,now});
  m.attackFlow.defenseReads={def0:read('cover')};const cover=v183PaceFactor(m,p,'base',{factor:1.15,read:m.attackFlow.defenseReads.def0,now});
  const carrier=v183PaceFactor(m,p,'carrier',{factor:1.4}),support=v183PaceFactor(m,p,'support',{factor:1.35}),expired=v183PaceFactor(m,p,'base',{factor:1.15,read:{nextAt:now-1,kind:'cover'},now});
  NativeDef.build({on:false});const q=match.people.find(x=>x.pid==='def0');const legacy=v183PaceFactor(match,q,'purposeful',{factor:1.58,read:{nextAt:now+1,purpose:'press'},now});
  return {press,cover,carrier,support,expired,legacy};})()`));
 assert.deepEqual(r,{press:1.3,cover:1.2,carrier:1.4,support:1.35,expired:1.15,legacy:1.58});
});

// ----- clearance under pressure and block direction -----
const OWNBOX={carrier:{depth:12,lateral:2,vy:1},defs:[{depth:7,lateral:3,line:'def'},{depth:20,lateral:-6}]};
check('v183Clearance: evaluate mode is deterministic and reports the chance; the chance follows pressure, box and calm',()=>{
 const r=copy(ev(`(()=>{
  NativeDef.build({on:true,...${JSON.stringify(OWNBOX)}});const m=match,def=m.people.find(x=>x.pid==='def0'),point={x:def.x,y:def.y},out={};def.calm=10;
  Math.random=()=>{throw Error('evaluate drew a random number');};
  const ask=ctx=>v183Clearance(m,def,point,{evaluate:true,...ctx});
  out.plain=ask({pressure:0,ownBox:false});out.pressed=ask({pressure:2,ownBox:true});out.three=ask({pressure:5,ownBox:true});
  def.calm=20;out.calm=ask({pressure:2,ownBox:true});def.calm=1;out.nervous=ask({pressure:2,ownBox:true});def.calm=10;
  out.block=ask({kind:'block',ownBox:false});out.blockBox=ask({kind:'block',ownBox:true});
  out.again=ask({pressure:2,ownBox:true});
  NativeDef.build({on:false});const q=match.people.find(x=>x.pid==='def0');out.stub=v183Clearance(match,q,{x:q.x,y:q.y},{evaluate:true,pressure:2,ownBox:true});
  return out;})()`));
 const near=(a,b)=>Math.abs(a-b)<1e-9;
 assert(near(r.plain.outChance,.08));assert(near(r.pressed.outChance,.08+.24+.12));assert(near(r.three.outChance,.08+.24+.12),'pressure counts up to two rivals');
 assert(near(r.calm.outChance,.44*(1-.25)));assert(near(r.nervous.outChance,.5),'cap clearOutMax');
 assert(near(r.block.outChance,.35)&&near(r.blockBox.outChance,.5));
 assert.equal(r.pressed.out,false);assert.deepEqual(r.again,r.pressed);
 assert.equal(r.stub.outChance,undefined);assert.equal(r.stub.out,false);
});
check('v183Clearance: named draws only; an out clearance leaves over the own goal line beside the post or over the touchline',()=>{
 const run=(draws,ctx)=>copy(ev(`(()=>{
  NativeDef.build({on:true,...${JSON.stringify(OWNBOX)}});const m=match,def=m.people.find(x=>x.pid==='def0'),point={x:def.x,y:def.y},s=v150Scale(m),queue=${JSON.stringify(draws)};let used=0;
  Math.random=()=>{if(used>=queue.length)throw Error('more draws than named');return queue[used++];};
  const result=v183Clearance(m,def,point,${JSON.stringify(ctx)});
  return {result,used,bottom:v55Field.bottom,top:v55Field.top,left:v55Field.left,right:v55Field.right,half:m.geometry.goalWidth/2,s,point};})()`));
 // Not out: one draw (clearance.out) after the caller's lateral draw.
 const keep=run([.9],{lateralDraw:.75,pressure:2,ownBox:true});assert.equal(keep.used,1);assert.equal(keep.result.out,false);
 // Without a caller draw the lateral draw comes first (the SI-F name "clearance.lateral").
 const own=run([.75,.9],{pressure:2,ownBox:true});assert.equal(own.used,2);
 // Out over the goal line: draws out, kind.
 const byline=run([.1,.5],{lateralDraw:.75,pressure:2,ownBox:true});assert.equal(byline.used,2);assert.equal(byline.result.out,true);
 assert(byline.result.target.y>byline.bottom,'beyond the own goal line (team 0 defends the bottom)');
 assert(Math.abs(byline.result.target.x-.5)*byline.s.x>=byline.half+2.99,'beside the post');
 const touch=run([.1,.9],{lateralDraw:.25,pressure:2,ownBox:true});assert.equal(touch.used,2);assert.equal(touch.result.out,true);assert(touch.result.target.x<touch.left,'over the left touchline');
 // Outside the own box: the touchline without a second draw.
 const wide=run([.05],{lateralDraw:.75,pressure:2,ownBox:false});assert.equal(wide.used,1);assert.equal(wide.result.out,true);assert(wide.result.target.x>wide.right);
 // A caller that supplies no context still works (stub signature).
 assert.doesNotThrow(()=>run([.9,.9],{}));
});
check('an out clearance becomes a corner (goal line) or a throw-in (touchline) through the native loose-ball path',()=>{
 const chain=(draws,team)=>copy(ev(`(()=>{
  NativeDef.build({on:true,d:${team},...${JSON.stringify(OWNBOX)}});const m=match,def=m.people.find(x=>x.pid==='def0'),end={x:def.x,y:def.y},queue=${JSON.stringify(draws)};let used=0;const real=Math.random;
  Math.random=()=>used<queue.length?queue[used++]:real();
  const r=v183Clearance(m,def,end,{lateralDraw:.75,pressure:2,ownBox:true});m.owner=def;m.lastTouch=def.t;
  v102AirClear(def,end,r.target);v50LooseBall(r.target,'clear');
  let kind=null,teamOut=null;for(let i=0;i<120&&!kind;i++){Native182.advance();if(m.setPiece){kind=m.setPiece.type;teamOut=m.setPiece.team;}else if(m.throwIn){kind='throw-in';teamOut=m.throwIn.team;}}
  return {kind,teamOut,out:r.out};})()`));
 for(const team of [0,1]){
  const corner=chain([.1,.5],team);assert.equal(corner.out,true);assert.equal(corner.kind,'corner','team '+team);assert.equal(corner.teamOut,1-team);
  const throwIn=chain([.1,.9],team);assert.equal(throwIn.kind,'throw-in','team '+team);assert.equal(throwIn.teamOut,1-team);
 }
});
check('block direction: legacy constants without the package, stored offset with it (better pos steers away from the goal line)',()=>{
 const aim=copy(ev(`(()=>{
  NativeDef.build({on:false});const off=v183BlockAim(match,match.people.find(x=>x.pid==='def0'));
  const out={off},aimFor=pos=>{NativeDef.build({on:true,defs:[{depth:20,lateral:0,skills:{pos}}]});return v183BlockAim(match,match.people.find(x=>x.pid==='def0'));};out.neutral=aimFor(10);out.skilled=aimFor(18);out.poor=aimFor(4);
  NativeDef.build({on:null});out.unmarked=v183BlockAim(match,match.people.find(x=>x.pid==='def0'));return out;})()`));
 assert.deepEqual(aim.off,{bias:.3,spread:.3});assert.deepEqual(aim.unmarked,{bias:.3,spread:.3});
 assert.equal(aim.neutral.bias,.2);assert(aim.skilled.bias>aim.neutral.bias&&aim.poor.bias<aim.neutral.bias);assert.equal(aim.neutral.spread,.3);
 // v50Deflect: a block 6 m from the goal line with draw .5 stays in play at bias .3 and crosses the line at bias .2.
 const target=on=>copy(ev(`(()=>{NativeDef.build({on:${on},d:0,defs:[{depth:6,lateral:1,line:'def'}],carrier:{depth:12,lateral:0,vy:1}});const m=match,def=m.people.find(x=>x.pid==='def0'),shooter=1,point={x:def.x,y:v55Field.bottom-6/v150Scale(m).y};
  const real=Math.random;Math.random=()=>.5;def.pos=10;v50Deflect(point,shooter,def,'Block von X');Math.random=real;return {target:m.flight.target,bottom:v55Field.bottom};})()`));
 const legacy=target(false),marked=target(true);assert(legacy.target.y<legacy.bottom,'stays in play');assert(marked.target.y>=marked.bottom-1e-9,'reaches the goal line');
});

// ----- no stray random draws -----
check('planners, forecasts, tracking and the pace weiche draw no random number',()=>{
 const calls=copy(ev(`(()=>{
  NativeDef.build({on:true,carrier:{depth:30,lateral:0,vy:3}});const m=match,real=Math.random;Math.random=()=>{throw Error('drew a random number');};let calls=0;
  try{for(let i=0;i<40;i++){v102State(m).clock+=.05;for(const p of m.people){if(!p.keeper){v159DefensiveTarget(m,p);calls++;}}
   const t=m.people.find(x=>x.pid==='def0');v183DefSlideForecast(m,t,m.owner);v183PaceFactor(m,t,'purposeful',{factor:1.58,read:m.attackFlow.defenseReads?.[t.pid],now:v152Seconds(m)});v183BlockAim(m,t);calls++;}}finally{Math.random=real;}
  return calls;})()`));
 assert(calls>=200);
});

// ----- slide cadence -----
check('the tick check uses the same contact candidates and slide kinematics as pitch-v56.js (kept in step by this test)',()=>{
 const v56=fs.readFileSync(path.join(root,'dist/pitch-v56.js'),'latin1'),own=fs.readFileSync(path.join(root,'dist/match-si-defence-v183.js'),'latin1');
 // Standing: ball < 30.4, body < 40 (world). Slider: ball 25..83.2, body < 105, behind or ball nearer than body.
 assert(v56.includes('info.ball<(world?30.4:39)&&info.body<(world?40:43)'));assert(own.includes('info.ball<30.4&&info.body<40'));
 assert(v56.includes('info.ball>=25&&info.ball<(world?83.2:100)&&info.body<105&&(info.behind||info.ball<info.body)'));assert(own.includes('info.ball>=25&&info.ball<83.2&&info.body<105&&(info.behind||info.ball<info.body)'));
 // Slide: duration .65 * MATCH_SPEED clock units, reach .25/.18 m, contact thresholds 27 (body) and 24/23 (ball).
 assert(v56.includes('delta/(world?.65*'));assert(own.includes('V183_DEF_SLIDE_SECONDS=.65'));assert(!own.includes('MATCH_SPEED'),'no clock-unit conversion in the module');
 assert(v56.includes('const lead=behind?.04:.016,reach=behind?.25:.18'));assert(own.includes('reach=behind?.25:.18'));
 assert(v56.includes('bodyGap<27&&(ballGap>23||slide.behind')&&v56.includes('if(ballGap<24){'));assert(own.includes('bodyGap<27&&(ballGap>23||behind||v183DefBehindAt(m,run,tackler,carrier))')&&own.includes('ballGap<24'));
});
check('slides are considered at the slide cadence only; with forecast level 2 a miss skips the slide, a good one starts it',()=>{
 const run=(carrier,slider,shift,steps)=>{scene({on:true,si:{params:{defence:{slideForecast:2}}},defs:[slider],carrier});return copy(ev(`(()=>{const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0');m.ball={x:c.x+(t.x-c.x)*${shift},y:c.y+(t.y-c.y)*${shift}};Math.random=()=>0;
  const out=[];for(const dt of ${JSON.stringify(steps)}){v102State(m).clock+=dt;v182ContactCheck(m);out.push({skipped:v183TraceEntries(m).filter(e=>e.type==='slide-skipped').length,slide:!!m.slide,slideAt:m.attackFlow.defence?.slideAt??null});}return out;})()`));};
 // Carrier running past at speed: skipped; two more checks inside the interval add nothing; after the interval one more.
 const miss=run({vy:6},{depth:30.6,lateral:1.9,line:'def'},.5,[.1,.1,.1,.6]);
 assert.deepEqual(miss.map(x=>x.skipped),[1,1,1,2]);assert(miss.every(x=>!x.slide));
 // Standing carrier, ball on the slider's side: forecast 'ball' -> the base slide chance decides (draw 0 starts it).
 const good=run({vy:0},{depth:28.4,lateral:.4,line:'def'},.45,[.1]);
 assert.equal(good[0].slide,true);assert(Number.isFinite(good[0].slideAt));
 // Forecast off (the default): the slide is tried even if it runs past.
 assert.equal(copy(ev('v183Registry.defaults.defence.slideForecast')),0);
 scene({on:true,si:{params:{defence:{slideForecast:0}}},defs:[{depth:30.6,lateral:1.9,line:'def'}],carrier:{vy:6}});
 const free=ev(`(()=>{const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0');m.ball={x:c.x+(t.x-c.x)*.5,y:c.y+(t.y-c.y)*.5};Math.random=()=>0;v102State(m).clock+=.1;v182ContactCheck(m);return !!m.slide;})()`);
 assert.equal(free,true);
});

check('forecast: the per-step "from behind" test is the metres test of v182Behind (fast, slow and standing carriers)',()=>{
 const r=copy(ev(`(()=>{
  let bad=0,n=0;
  for(const vy of [0,.2,.45,.6,2,6])for(const dx of [-1.5,-.6,-.3,0,.4,1.2])for(const dy of [-2,-.8,-.4,0,.4,2]){
   NativeDef.build({on:true,defs:[{depth:28,lateral:1,line:'def'}],carrier:{vy,vx:vy?0:0}});
   const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0'),s=v150Scale(m);c.motionX=vy?0:.01;c.motionY=vy?vy/s.y*.05:0;
   t.x=c.x+dx/s.x;t.y=c.y+dy/s.y;n++;
   if(v183DefBehindAt(m,v183DefRunDirection(m,c),t,c)!==v182Behind(t,c))bad++;
  }
  return {bad,n};})()`));
 assert.equal(r.bad,0);assert(r.n>=200);
});
check('slide filter: level 2 also tries a slide that runs past from the front; level 1 and a slide from behind never do',()=>{
 // Find a frontal geometry whose forecast is a plain miss.
 let found=null;
 for(const lateral of [3.1,2.8,2.5,2.2])for(const depth of [29.4,29,28.6,28.2]){
  if(found)break;
  scene({on:true,defs:[{depth,lateral,line:'def'}],carrier:{vy:6}});
  const r=copy(ev(`(()=>{const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0');m.ball={x:c.x+(t.x-c.x)*.5,y:c.y+(t.y-c.y)*.5};const i=v56ApproachInfo(t,c);return {outcome:v183DefSlideForecast(m,t,c),behind:i.behind,candidate:i.ball>=25&&i.ball<83.2&&i.body<105&&(i.behind||i.ball<i.body)&&!(i.ball<30.4&&i.body<40)};})()`));
  if(r.outcome==='miss'&&!r.behind&&r.candidate)found={depth,lateral};
 }
 assert(found,'a frontal miss geometry exists');
 const tries=filter=>{scene({on:true,si:{params:{defence:{slideForecast:filter}}},defs:[{...found,line:'def'}],carrier:{vy:6}});return ev(`(()=>{const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0');m.ball={x:c.x+(t.x-c.x)*.5,y:c.y+(t.y-c.y)*.5};Math.random=()=>0;v102State(m).clock+=.1;v182ContactCheck(m);return !!m.slide;})()`);};
 assert.equal(tries(1),false);assert.equal(tries(2),true);assert.equal(tries(0),true);
});

// ----- clock package: real seconds only -----
check('with packages.clock and clockRate .42 the slide forecast is the same as at .78 and matches the engine\'s slide speed once SI-0 is in',()=>{
 const grid=[];for(const lateral of [3.1,2.4,1.9,.6])for(const depth of [29.4,28.6,28,30.6])for(const vy of [0,3,6])grid.push({lateral,depth,vy});
 const outcomes=rate=>grid.map(g=>{scene({on:true,si:{packages:{clock:true,defence:true},clockRate:rate},defs:[{depth:g.depth,lateral:g.lateral,line:'def'}],carrier:{vy:g.vy}});
  return ev(`(()=>{const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0');m.ball={x:c.x+(t.x-c.x)*.5,y:c.y+(t.y-c.y)*.5};return v183DefSlideForecast(m,t,c);})()`);});
 const fast=outcomes(.78),slow=outcomes(.42);
 assert.deepEqual(slow,fast,'forecast depends on real seconds only');
 assert(new Set(fast).size>=2,'the grid covers more than one outcome');
 // Real slide: progress per real second of the engine at both rates.
 const progress=rate=>{scene({on:true,si:{packages:{clock:true,defence:true},clockRate:rate},defs:[{depth:27.7,lateral:.4,line:'def'}],carrier:{vy:0}});
  return ev(`(()=>{const m=match,c=m.owner,t=m.people.find(x=>x.pid==='def0');t.tx=t.x;t.ty=t.y;m.ball={x:c.x+(t.x-c.x)*.45,y:c.y+(t.y-c.y)*.45};Math.random=()=>0;
   v56StartSlide(t,c);if(!m.slide)return null;const slide=m.slide,rate=v183Rate(m);let seconds=0;
   for(let i=0;i<2&&m.slide===slide;i++){step(.05*rate,.05);seconds+=.05;}
   return m.slide===slide?slide.progress/seconds:null;})()`);};
 const per=[progress(.78),progress(.42)];measurements.slideProgressPerRealSecond={'.78':per[0],'.42':per[1]};
 const v56=fs.readFileSync(path.join(root,'dist/pitch-v56.js'),'latin1'),realTime=v56.includes('.65*(m.si?v183Rate(m):MATCH_SPEED)');
 measurements.engineSlideIsRealTime=realTime;
 // At the legacy rate both forms agree; the real-time form (SI-0) also holds at .42.
 assert(Math.abs(per[0]-1/.65)<.05,String(per[0]));
 if(realTime)assert(Math.abs(per[1]-1/.65)<.05,String(per[1]));
});

// ----- restore -----
check('restore: counter window, roles and cadence are plain data and survive a JSON checkpoint',()=>{
 scene(withWindow({...COUNTER,on:true}));
 const r=copy(ev(`(()=>{
  const m0=match,carrier=m0.owner,mine=m0.people.find(x=>x.pid==='def0'),probe=m0.people.find(x=>x.pid==='att0'),kinds=m=>Object.fromEntries(m.people.filter(x=>x.pid.startsWith('def')).map(p=>[p.pid,(v159DefensiveTarget(m,p),m.attackFlow.defenseReads?.[p.pid]?.kind||null)]));
  m0.owner=mine;m0.ball={x:mine.x,y:mine.y};v102State(m0).clock+=.05;v159DefensiveTarget(m0,probe);
  m0.owner=carrier;m0.ball={x:carrier.x,y:carrier.y};v102State(m0).clock+=.05;v159DefensiveTarget(m0,probe);const live=kinds(m0);
  const before=JSON.parse(JSON.stringify(m0.attackFlow.defence)),clock=v102Clock(m0);
  Native182.checkpoint();const m=match;
  const out={live,before,after:JSON.parse(JSON.stringify(m.attackFlow.defence)),clockBefore:clock,clockAfter:v102Clock(m),active:v183Active(m,'defence'),frozen:Object.isFrozen(m.si),sameObject:m!==m0};
  v102State(m).clock+=.05;const p2=m.people.find(x=>x.pid==='att0');v159DefensiveTarget(m,p2);out.resumed=kinds(m);out.counter=m.attackFlow.defence.counter;
  v102State(m).clock+=2.5;kinds(m);out.expired=m.attackFlow.defence.counter;return out;})()`));
 assert.equal(r.sameObject,true);assert.deepEqual(r.after,r.before);assert.equal(r.clockAfter,r.clockBefore);assert.equal(r.active,true);assert.equal(r.frozen,true);
 assert.equal(r.live.def0,'counter');assert.deepEqual(r.resumed,r.live);assert.equal(r.counter.team,0);assert.equal(r.expired,null);
 JSON.stringify(r.before);assert.deepEqual(Object.keys(r.before).sort(),['counter','cover','poss','slideAt','tick']);
});
check('restore: a whole constructed match keeps the package state at five checkpoints and plays on',()=>{
 for(const [club,seed,size] of [['GER-2','rs1','standard'],['ENG-4','rs2','large']]){
  h.call('Native183.constructed',{club,seed,size,roles:true});
  let done=0;
  for(let segment=0;segment<5;segment++){
   h.call('Native183.run',250);
   for(let tries=0;tries<60;tries++){
    // No checkpoint in a goal pause (the scene harness has no goal overlay) or after the end.
    if(ev('match.goalPause>0||match.finished||match.postBanner')){h.call('Native183.run',5);continue;}
    const r=copy(ev(`(()=>{const before=JSON.stringify(match.attackFlow.defence??null),clock=v102Clock(match),ok=Native183.checkpoint();return {ok,before,after:JSON.stringify(match.attackFlow.defence??null),clock,clockAfter:v102Clock(match),active:v183Active(match,'defence'),params:JSON.stringify(match.si.params.defence).length};})()`));
    if(!r.ok){h.call('Native183.run',2);continue;}
    assert.equal(r.after,r.before,`${club} segment ${segment}`);assert.equal(r.clockAfter,r.clock);assert.equal(r.active,true);assert(r.params>100);done++;break;
   }
  }
  assert.equal(done,5,club+' checkpoints');
  // The scene harness has no season save behind finishMatch: play on for the remaining first-half-plus ticks only.
  const before=ev('match.elapsed');h.call('Native183.run',300);assert(ev('match.elapsed')>before&&ev('match.elapsed')<70,club+' plays on');
  assert.equal(ev('v183Active(match,"defence")'),true);
 }
});

console.log(JSON.stringify({pass:true,suite:'si-defence-v183',checks:checks.length,cases:checks,measurements}));
