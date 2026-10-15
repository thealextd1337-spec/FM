'use strict';
// SI-3 finishing and goalkeeper (package finish, dist/match-si-finish-v183.js).
// Legacy path: unmarked matches and finish-off matches run the previous
// functions with the same draws. New path: placement model (unreachable corner =
// goal, reachable centre = save, height and width misses, no ball through the
// keeper), keeper gradation, skill steepness, calm under pressure, decisions,
// parry direction, direct free kicks, interfaces, ledger tag and a restore
// round trip (state completeness). Runs the actual dist modules in the native VM.
// Usage: node work/test-si-finish-v183.cjs
const assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs');
// SI3_ONLY=<text> runs only the checks whose name contains <text> (development).
const only=process.env.SI3_ONLY,checks=[];const check=(name,fn)=>{if(only&&!name.includes(only))return;fn();checks.push(name);};
const h=create({view:false}),ev=text=>h.evaluate(text),copy=value=>h.copy(value);
const PACKAGES=['clock','options','offball','finish','defence','setplay','field'];
const OFF={packages:Object.fromEntries(PACKAGES.map(p=>[p,false]))},ON={packages:{...OFF.packages,finish:true}};
const examples={};

// Scene helpers in the VM: a constructed match, a clean live shot situation in
// metres in front of team 0's attacking goal (top), and plain model situations.
h.run(`globalThis.SI3={
 live(si,{club='GER-2',seed='si3',size='standard',ticks=160}={}){Native183.constructed({club,seed,size,si});Native183.run(ticks);return match;},
 // Shooter of team 0 at (lateral, depth) metres; keeper of team 1 at (kLat, kDepth);
 // all other rivals far away (no block, no pressure) unless keep is set.
 shotScene({lat=0,depth=12,kLat=0,kDepth=2,fin=12,tec=12,gk=12,keep=false}={}){
  const m=match,s=v150Scale(m),top=v55Field.top,p=m.people.find(q=>q.t===0&&!q.keeper),k=m.people.find(q=>q.t===1&&q.keeper);
  Object.assign(m,{setPiece:null,throwIn:null,kickoff:null,flight:null,rebound:null,goalPause:0,postBanner:null,slide:null,next:Infinity});
  p.x=.5+lat/s.x;p.y=top+depth/s.y;p.fin=fin;p.tec=tec;k.x=.5+kLat/s.x;k.y=top+kDepth/s.y;k.gk=gk;
  if(!keep)for(const r of m.people)if(r.t===1&&!r.keeper){r.x=.5+(r.n%3-1)*.2;r.y=top+40/s.y;r.tx=r.x;r.ty=r.y;}
  for(const q of m.people){q.tx=q.x;q.ty=q.y;}
  m.owner=p;m.ball={x:p.x,y:p.y};return {p:p.pid,k:k.pid};
 },
 person(pid){return match.people.find(q=>q.pid===pid);},
 sit(over={}){const goal=v183FinishGoal(match);return {kind:'shot',oneTouch:false,from:{lat:2,depth:10},range:Math.hypot(2,10),h0:.29,skill:12,calm:10,dec:10,pressure:0,turn:0,speed:27,keeper:{lat:.3,depth:2,gk:12,spd:10,hands:true},goal,...over};},
 params(){return v183FinishParams(match);},
 // A plan that always takes the aim (lat fraction, height).
 forced(sit,frac,h){const P=v183FinishParams(match),plan=v183FinishPlan(P,sit),lat=frac*sit.goal.half,aim=plan.aims.find(a=>Math.abs(a.lat-lat)<1e-9&&a.h===h);for(const a of plan.aims)a.w=a===aim?1:0;return plan;},
 draws(){return Native182.rng().draws;},
 untilLanded(limit=400){let n=0;while(match.flight&&n++<limit)Native183.advance();return n;}
};`,'si3-scenes');
const live=(si,options)=>h.call('SI3.live',si,options);

// ----- configuration -----
check('module registers its parameters and switches the package on for new matches; keeper hold 1.6 s',()=>{
 const defaults=copy(ev("v183RegisterDefaults('finish',{})"));
 for(const key of ['keeperHold','spreadBase','spreadSkill','reachBase','reactionBase','lateralGk','parryBase','outBase','fkSpread','aimTemp'])assert(Number.isFinite(defaults[key]),key);
 assert.equal(defaults.keeperHold,1.6);
 live(undefined,{ticks:10});
 assert.equal(ev("v183Active(match,'finish')"),true);assert.deepEqual(copy(ev('match.si.params.finish')),defaults);
 live(false,{ticks:10});assert.equal(ev("v183Active(match,'finish')"),false);
 live(OFF,{ticks:10});assert.equal(ev("v183Active(match,'finish')"),false);
});

check('keeper hold in real seconds for marked matches: 2.4 s without the package, finish.keeperHold with it, legacy units unmarked',()=>{
 // world-pitch-actions-v99.js switch; held:true also covers the 182 placement path.
 const hold=(si,held)=>{live(si,{ticks:120});return copy(ev(`(()=>{const k=v50Keeper(0);match.rebound=null;match.flight=null;v50GoalKick(k,'hold fixture',{held:${held}});const kick=v99ActionState(match).kicks.get(k.pid);return {gap:match.next-match.elapsed,rate:v183Rate(match),speed:MATCH_SPEED,placement:kick.holdPlacement??0};})()`));};
 const close=(a,b,msg)=>assert(Math.abs(a-b)<1e-9,`${msg}: ${a} vs ${b}`);
 for(const held of [false,true]){
  const clockOnly=hold({packages:{...OFF.packages,clock:true},clockRate:.42},held);close(clockOnly.gap,Math.max(2.4,clockOnly.placement)*.42,`clock 0.42 without finish, held ${held}`);
  const both=hold({packages:{...ON.packages,clock:true},clockRate:.42},held);close(both.gap,Math.max(1.6,both.placement)*.42,`clock 0.42 with finish, held ${held}`);
  const unmarked=hold(false,held);close(unmarked.gap,Math.max(2.4,unmarked.placement)*unmarked.speed,`unmarked, held ${held}`);
 }
});

// ----- legacy path -----
check('finish off and unmarked matches replay identically (digest without match.si, shots included)',()=>{
 let shots=0;
 for(const config of [{club:'GER-2',seed:'a',size:'standard'},{club:'ENG-4',seed:'b',size:'large'},{club:'ESP-1',seed:'c',size:'standard'}]){
  const scene={id:config.club,config:{...config,roles:false}},segments=[600,600,600];
  const off=h.call('Native183.constructedDigest',scene,{si:OFF,withoutSi:true,segments});shots+=ev('match.shots[0]+match.shots[1]');
  const legacy=h.call('Native183.constructedDigest',scene,{si:false,segments});
  assert.equal(off,legacy,config.club);
 }
 assert(shots>0,'the replayed segments contain shots');
});
check('wrapped functions delegate to the previous ones without the package (same values, no extra draw)',()=>{
 for(const si of [false,OFF]){
  live(si);const r=copy(ev(`(()=>{const m=match,p=m.people.find(q=>q.t===0&&!q.keeper),k=m.people.find(q=>q.t===1&&q.keeper),rivals=m.people.filter(q=>q.t!==p.t),d0=SI3.draws();
   const est=v183ShotEstimate(m,p),reach=v183KeeperReach(m,k,12,{x:k.x,y:k.y},{site:'shot-lane',reach:1.234}),spot={x:.5,y:v55Field.top+.2},taker=v50BestTaker(0,'freeKick',spot),base=v183FinishBaseTaker(0,'freeKick',spot),fk=v183DirectFreeKick(m,{taker:p,spot}),d1=SI3.draws();
   return {xg:est.xg,expected:v157ShotQuality(p,rivals),speed:est.speed,stub:est.stub,reach,taker:taker.pid,base:base.pid,fk,draws:d1-d0};})()`));
  assert.equal(r.xg,r.expected);assert.equal(r.speed,null);assert.equal(r.stub,true,'SI-F stub marker');assert.equal(r.reach,1.234);assert.equal(r.taker,r.base);assert.equal(r.fk,null);assert.equal(r.draws,0);
 }
});

// ----- model (pure functions on plain situations) -----
check('shot value: a probability, deterministic, keeper gradation, steep skill effect, calm only against pressure, decisions',()=>{
 live(ON,{ticks:10});
 const r=copy(ev(`(()=>{const P=SI3.params(),xg=over=>v183FinishPlan(P,SI3.sit(over)).xg,spread=over=>v183FinishSpread(P,SI3.sit(over)).x,keeper=gk=>({lat:.3,depth:2,gk,spd:10,hands:true}),d0=SI3.draws();
  const out={base:xg({}),again:xg({}),gk:[6,10,14,18].map(gk=>xg({keeper:keeper(gk)})),skill:[7,10,13,16].map(skill=>xg({skill})),
   calmPressed:[4,18].map(calm=>({xg:xg({pressure:1.5,calm}),spread:spread({pressure:1.5,calm})})),calmFree:[4,18].map(calm=>spread({calm})),
   dec:[4,18].map(dec=>xg({dec})),decSpread:[4,18].map(dec=>spread({dec})),
   long:[15,17].map(skill=>xg({skill,from:{lat:4,depth:Math.sqrt(24*24-16)},range:24,speed:21+.4*skill+.2*skill,keeper:{lat:4*2/Math.sqrt(24*24-16),depth:2,gk:12.7,spd:10,hands:true}}))};
  out.draws=SI3.draws()-d0;return out;})()`));
 assert(r.base>0&&r.base<1,'probability');assert.equal(r.base,r.again);assert.equal(r.draws,0);
 for(let i=1;i<r.gk.length;i++)assert(r.gk[i]<r.gk[i-1],`gk gradation ${r.gk}`);
 for(let i=1;i<r.skill.length;i++)assert(r.skill[i]>r.skill[i-1],`skill gradation ${r.skill}`);
 assert(r.skill[3]/r.skill[0]>=1.8,`skill 16 vs 7 at 10 m: ${r.skill}`);
 assert(r.calmPressed[1].spread<r.calmPressed[0].spread&&r.calmPressed[1].xg>r.calmPressed[0].xg,'calm damps pressure');
 assert.equal(r.calmFree[0],r.calmFree[1],'calm has no effect without pressure');
 assert(r.dec[1]>=r.dec[0],'better decisions choose better aims');assert.equal(r.decSpread[0],r.decSpread[1],'decisions never change the execution');
 for(const x of r.long)assert(x>=.1&&x<=.3,`long shot by a good finisher: ${x}`);
 Object.assign(examples,{xgAt10m:r.base,gk6to18:r.gk,skill7to16:r.skill,longFin15and17:r.long});
});
check('placement decides: unreachable corner = goal, reachable centre = save, over the bar and wide = miss',()=>{
 live(ON,{ticks:10});
 const r=copy(ev(`(()=>{const P=SI3.params(),sit=SI3.sit({}),run=(frac,h,u2,u3)=>{const x=v183FinishExecute(P,sit,SI3.forced(sit,frac,h),.5,u2,u3);return {goal:x.goal,onTarget:x.onTarget,over:x.over,wide:x.wide,reachable:x.reach?.reachable??null,stretch:x.reach?.stretch??null};};
  return {corner:run(-.92,.45,.5,.5),centre:run(0,1.35,.5,.5),over:run(.35,2.35,.5,.999),wide:run(.92,.45,.999,.5)};})()`));
 assert.deepEqual([r.corner.goal,r.corner.onTarget,r.corner.reachable],[true,true,false],'far corner');assert(r.corner.stretch>1);
 assert.deepEqual([r.centre.goal,r.centre.onTarget,r.centre.reachable],[false,true,true],'centre');assert(r.centre.stretch<=1);
 assert.deepEqual([r.over.goal,r.over.onTarget,r.over.over],[false,false,true],'over the bar');
 assert.deepEqual([r.wide.goal,r.wide.onTarget,r.wide.wide],[false,false,true],'wide');
});
check('no ball through the keeper: every goal passes outside his body or above his reach',()=>{
 live(ON,{ticks:10});
 const r=copy(ev(`(()=>{const P=SI3.params();let goals=0,bad=0,n=0,seed=7;const u=()=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;
  for(const [lat,depth,kLat,kDepth,gk] of [[0,6,0,1.5,12],[3,9,.5,2,8],[-6,14,-.8,2.2,16],[0,20,0,2.5,12],[8,10,1.5,1.4,10],[1,3,.5,1.2,12]])for(let i=0;i<400;i++){
   const sit=SI3.sit({from:{lat,depth},range:Math.hypot(lat,depth),keeper:{lat:kLat,depth:kDepth,gk,spd:10,hands:true}}),plan=v183FinishPlan(P,sit),x=v183FinishExecute(P,sit,plan,u(),u(),u());n++;
   if(!x.goal)continue;goals++;const K=plan.K,dive=Math.max(0,x.path.t-K.reaction),up=P.handsHeight+K.up+Math.min(P.jumpMax,dive*P.jumpSpeed);
   if(!(x.reach.stretch>1&&(x.reach.gap>.6||x.reach.height>up)))bad++;}
  return {goals,bad,n};})()`));
 assert(r.goals>50,`goals in the sample: ${r.goals}`);assert.equal(r.bad,0);
});

// ----- live shots through the new path -----
check('live shots: named draws, statistics, display data and outcome follow the model',()=>{
 const outcomes={goal:0,save:0,miss:0};
 for(let seed=1;seed<=40;seed++){
  live(ON,{ticks:60});h.call('Native182.seedRandom',Math.imul(seed,2654435761)>>>0);
  const ids=copy(h.call('SI3.shotScene',{lat:(seed%5-2)*1.5,depth:9+seed%9,fin:6+seed%12,gk:8+seed%10}));
  const r=copy(ev(`(()=>{const m=match,p=SI3.person('${ids.p}'),k=SI3.person('${ids.k}'),before={shots:p.stats.shots,on:p.stats.onTarget,faced:k.stats.faced,score:m.score[0],saves:k.stats.saves},d0=SI3.draws();
   v55Shoot(p);const d1=SI3.draws(),trace=v183TraceEntries(m).filter(e=>e.type==='finish.shot').at(-1),release=m.flight&&v99Flights.get(m.flight),flight=m.flight?{target:m.flight.target}:null;
   const display=release?{endHeight:release.endHeight,over:release.over,blocked:release.blocked}:null;SI3.untilLanded();
   return {draws:d1-d0,trace,display,flight,shots:p.stats.shots-before.shots,on:p.stats.onTarget-before.on,faced:k.stats.faced-before.faced,goals:m.score[0]-before.score,saves:k.stats.saves-before.saves};})()`));
  assert.equal(r.shots,1);assert(r.trace&&r.trace.kind==='shot','trace entry');
  // aim, lateral, height, then the catch draw for a reachable ball (no blocker in these scenes).
  assert.equal(r.draws,3+(r.trace.onTarget&&!r.trace.goal?1:0),`draws seed ${seed}`);
  assert.equal(r.on,r.trace.onTarget?1:0);assert.equal(r.goals,r.trace.goal?1:0);assert.equal(r.faced,r.trace.onTarget&&!r.trace.goal?1:0);
  assert.equal(r.saves,r.trace.onTarget&&!r.trace.goal?1:0);
  assert(r.display.endHeight>=.29,'display height');if(r.trace.goal)assert(Math.abs(r.display.endHeight-Math.max(.29,r.trace.h))<.006,'goal height');
  assert.equal(r.display.over,r.trace.over);
  if(r.trace.onTarget)assert.equal(r.display.blocked,false);
  outcomes[r.trace.goal?'goal':r.trace.onTarget?'save':'miss']++;
 }
 for(const [k,n]of Object.entries(outcomes))assert(n>0,`outcome ${k} occurs`);
 examples.liveOutcomes=outcomes;
});
check('a header beyond heading range keeps the legacy header pass (no shot)',()=>{
 live(ON,{ticks:60});h.call('SI3.shotScene',{depth:22,lat:0});
 const r=copy(ev(`(()=>{const p=match.owner,shots=p.stats.shots;v55Shoot(p,'header');return {shots:p.stats.shots-shots,trace:v183TraceEntries(match).filter(e=>e.type==='finish.shot').length};})()`));
 assert.equal(r.shots,0);
});
check('long shots carry the ledger source long-shot',()=>{
 live(ON,{ticks:60});h.call('Native182.seedRandom',4242);h.call('SI3.shotScene',{depth:24,lat:2,fin:16,tec:15});
 const r=copy(ev(`(()=>{v55Shoot(match.owner);const event=v117Flights.get(match.flight);return {sources:event?.sources||[],shot:event?.shot};})()`));
 assert.equal(r.shot,true);assert(r.sources.includes('long-shot'),JSON.stringify(r.sources));
});

// ----- keeper -----
check('keeper reach at the three sites follows the keeper model and grows with gk',()=>{
 live(ON,{ticks:60});
 const r=copy(ev(`(()=>{const m=match,k=m.people.find(q=>q.t===1&&q.keeper),contact={x:k.x,y:k.y},out={};
  for(const site of ['shot-lane','open-goal','keeper-contact']){out[site]=[6,12,18].map(gk=>{k.gk=gk;return v183KeeperReach(m,k,14,contact,{site,reach:.123});});}
  k.gk=12;const P=SI3.params(),K=v183FinishKeeper(P,{gk:ability(k,'gk'),spd:ability(k,'spd'),hands:true});out.formula=K.reach0+Math.max(0,14/27-K.reaction)*K.lateral;out.value=v183KeeperReach({...m,owner:null},k,14,contact,{site:'keeper-contact',reach:.123});return out;})()`));
 for(const site of ['shot-lane','open-goal','keeper-contact']){assert(r[site][0]<r[site][1]&&r[site][1]<r[site][2],site);assert(!r[site].includes(.123),site);}
 assert(Math.abs(r.value-r.formula)<1e-9);
 examples.keeperReach14m=r['keeper-contact'];
});
check('parries: near-post saves go round the post more often; in-field parries land away from the keeper',()=>{
 live(ON,{ticks:60});
 const r=copy(ev(`(()=>{const m=match,k=m.people.find(q=>q.t===1&&q.keeper),s=v150Scale(m),goal=v183FinishGoal(m),P=SI3.params(),line=v55Field.top,res={near:0,centre:0,n:200,minDistance:Infinity,outsidePost:true,legacyDraws:0};
  for(const [key,lat] of [['near',goal.half-.2],['centre',.2]])for(let i=0;i<res.n;i++){
   Native182.seedRandom(Math.imul(i+1,2654435761)>>>0);Object.assign(m,{flight:null,rebound:null,setPiece:null});const point={x:.5+lat/s.x,y:line+2/s.y};k.x=point.x;k.y=point.y;
   v183FinishParries.set(m,{flight:null,keeperPid:k.pid,lat,stretch:.8,speed:28,gk:12});v115KeeperDeflect(point,0,k,'Parade');
   const t=m.flight.target,out=Math.abs(t.y-line)<1e-9;if(out){res[key]++;if(Math.abs(t.x-.5)*s.x<goal.width/2+goal.radius)res.outsidePost=false;}else res.minDistance=Math.min(res.minDistance,v122Metres(point,t));}
  // Without a parry plan (e.g. an unmarked match) the legacy deflection runs: two draws.
  Object.assign(m,{flight:null});Native182.seedRandom(77);v115KeeperDeflect({x:.5,y:line+2/s.y},0,k,'Parade');res.legacyDraws=SI3.draws();res.parryNear=P.parryNear;return res;})()`));
 assert(r.near>r.centre,`near ${r.near} vs centre ${r.centre}`);assert(r.outsidePost,'corner targets lie outside the posts');
 assert(r.minDistance>=r.parryNear-1e-6,`in-field parry distance ${r.minDistance}`);assert.equal(r.legacyDraws,2);
 examples.parryOutShare={nearPost:r.near/r.n,centre:r.centre/r.n};
});

check('P03: a native parry into the field, the loose ball, the keeper gathering it and his distribution',()=>{
 // Attackers stay away so the keeper wins the rebound; the sequence is read
 // from the actual ledger and native state, nothing is scripted after the shot.
 let found=null;
 for(let seed=1;seed<=40&&!found;seed++){
  live(ON,{ticks:60});h.call('Native182.seedRandom',Math.imul(seed+300,2654435761)>>>0);
  const ids=copy(h.call('SI3.shotScene',{depth:15,lat:(seed%3-1)*1.2,kLat:0,gk:17,fin:9}));
  ev(`(()=>{for(const q of match.people)if(q.t===0&&q.pid!=='${ids.p}'&&!q.keeper){q.x=.5+(q.n%3-1)*.2;q.y=.75;q.tx=q.x;q.ty=q.y;}})()`);
  const r=copy(ev(`(()=>{const m=match,k=SI3.person('${ids.k}'),start=m.ballAccounting.events.length;v55Shoot(m.owner);
   const steps=[];let gathered=null,released=null;
   for(let i=0;i<400&&!released;i++){Native183.advance();
    const parry=v183TraceEntries(m).filter(e=>e.type==='finish.parry').at(-1);if(!steps.length&&parry){if(parry.out)return null;steps.push('parry');}
    if(steps.length===1&&m.rebound)steps.push('loose-ball');
    if(steps.length===2&&m.owner===k){gathered=i;steps.push('keeper-gathers');}
    if(steps.length===3&&m.flight&&m.owner!==k){released=i;steps.push('keeper-distributes');}}
   const events=m.ballAccounting.events.slice(start).map(e=>[e.kind,e.result,e.actorPid===k.pid?'keeper':!e.actorPid?'-':e.team===k.t?'defender':'attacker']);
   return steps.length===4?{steps,events,gatheredAfter:gathered,releasedAfter:released}:null;})()`));
  if(r)found={seed,...r};
 }
 assert(found,'a complete parry/rebound/gather/distribution sequence within 40 seeds');
 assert.deepEqual(found.steps,['parry','loose-ball','keeper-gathers','keeper-distributes']);
 assert(found.events.some(e=>e[0]==='shot'&&e[1]==='parried'),JSON.stringify(found.events));
 examples.p03Sequence=found;
});

// ----- free kicks -----
check('direct free kicks: the best finisher takes central free kicks in the direct zone; other restarts unchanged',()=>{
 live(ON,{ticks:60});
 const r=copy(ev(`(()=>{const m=match,field=v50Outfield(0),rank=p=>ability(p,'fin')*.7+ability(p,'tec')*.3,best=[...field].sort((a,b)=>rank(b)-rank(a))[0],near={x:.5,y:v55Field.top+.2},wide={x:.1,y:v55Field.top+.2},far={x:.5,y:.6};
  const pick=(type,spot)=>v50BestTaker(0,type,spot).pid,base=(type,spot)=>v183FinishBaseTaker(0,type,spot).pid;
  return {direct:pick('freeKick',near),best:best.pid,wide:[pick('freeKick',wide),base('freeKick',wide)],far:[pick('freeKick',far),base('freeKick',far)],corner:[pick('corner',{x:.02,y:v55Field.top}),base('corner',{x:.02,y:v55Field.top})],penalty:[pick('penalty',near),base('penalty',near)],
   rec:v183DirectFreeKick(m,{taker:best,spot:near}),recFar:v183DirectFreeKick(m,{taker:best,spot:{x:.5,y:v55Field.top+.45}})};})()`));
 assert.equal(r.direct,r.best);for(const key of ['wide','far','corner','penalty'])assert.equal(r[key][0],r[key][1],key);
 assert(r.rec&&typeof r.rec.direct==='boolean'&&r.rec.xg>0&&r.rec.range<r.rec.limit,'recommendation near');assert.equal(r.recFar.direct,false);
});
check('direct free-kick shots run through the placement model (kind direct-free-kick, goal source)',()=>{
 let goals=0,n=0;
 for(let seed=1;seed<=30;seed++){live(ON,{ticks:60});h.call('Native182.seedRandom',Math.imul(seed+77,2654435761)>>>0);h.call('SI3.shotScene',{depth:20,lat:(seed%3-1)*3,fin:15,tec:14});
  const r=copy(ev(`(()=>{const m=match,score=m.score[0];v55Shoot(m.owner,'direct-free-kick');const t=v183TraceEntries(m).filter(e=>e.type==='finish.shot').at(-1);SI3.untilLanded();const g=m.goals.at(-1);return {kind:t.kind,goal:t.goal,scored:m.score[0]-score,source:m.score[0]>score?g?.source??null:null};})()`));
  assert.equal(r.kind,'direct-free-kick');assert.equal(r.scored,r.goal?1:0);if(r.goal){goals++;assert.equal(r.source,'direct-free-kick');}n++;}
 examples.directFreeKick20m={goals,n};
});

// ----- interfaces -----
check('shot estimate interface: probability, aim on the goal line with height, window, speed; no draw',()=>{
 live(ON,{ticks:60});h.call('SI3.shotScene',{depth:13,lat:2,fin:14});
 const r=copy(ev(`(()=>{const m=match,p=m.owner,d0=SI3.draws(),a=v183ShotEstimate(m,p),b=v183ShotEstimate(m,p,{x:p.x,y:p.y}),c=v183ShotEstimate(m,p,{x:.5,y:v55Field.top+.5}),fk=v183ShotEstimate(m,p,p,{kind:'direct-free-kick'});return {a,b,c,fk,draws:SI3.draws()-d0,line:v55Field.top};})()`));
 assert(r.a.xg>0&&r.a.xg<1);assert.deepEqual(r.a,r.b);assert(r.c.xg<r.a.xg,'far away is worse');assert.equal(r.draws,0);
 assert.equal(Object.hasOwn(r.a,'stub'),false,'the real estimate is no stub');assert(Number.isFinite(r.a.speed)&&Number.isFinite(r.fk.speed)&&Number.isFinite(r.c.speed));
 assert.equal(r.a.aim.y,r.line);assert(Number.isFinite(r.a.aim.height));assert.equal(typeof r.a.window,'boolean');assert(r.a.speed>20);
 assert(r.fk.speed<r.a.speed,'free kicks are struck softer');
});

// ----- restore -----
check('restore: no added match state; checkpoints keep the finish package and the continuation; no snapshot during a shot flight',()=>{
 live(ON,{ticks:40});let saved=0,flightRefused=false;
 for(let i=0;i<5;i++){
  h.call('Native183.run',150);
  if(ev('Boolean(match.flight)')&&!ev('v65Snapshot(v65WorldActive)'))flightRefused=true;
  let ok=false;for(let j=0;j<60&&!ok;j++){const before=h.call('Native183.digest');ok=h.call('Native183.checkpoint');if(ok){assert.equal(h.call('Native183.digest'),before,`state after restore ${i}`);saved++;}else h.call('Native183.advance');}
  assert.equal(ev("v183Active(match,'finish')"),true);assert.equal(ev('v183FinishParries.has(match)'),false,'no pending parry plan on a restored match');
 }
 assert.equal(saved,5);
 // A shot flight refuses the snapshot; the parry plan lives only during it.
 h.call('Native182.seedRandom',11);h.call('SI3.shotScene',{depth:10,lat:0,kLat:.2,gk:18,fin:8});ev('v55Shoot(match.owner)');
 assert.equal(ev('Boolean(match.flight)'),true);assert.equal(ev('v65Snapshot(v65WorldActive)'),false);
 h.call('SI3.untilLanded');
 const shots=ev("v183TraceEntries(match).filter(e=>e.type==='finish.shot').length");h.call('Native183.run',300);
 assert(ev("v183TraceEntries(match).filter(e=>e.type==='finish.shot').length")>=shots,'continues through the new path');
 examples.restoreCheckpoints=saved;examples.flightRefusedDuringRun=flightRefused;
});

console.log(JSON.stringify({pass:true,checks:checks.length,names:checks,examples}));
