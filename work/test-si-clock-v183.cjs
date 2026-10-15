'use strict';
// SI 183, package SI-0 (clock contract and stoppages). Runs the actual dist
// modules in the native VM harness (native183-scenes.cjs).
//   - helpers matchRate/matchSpan/matchLegacyElapsed (game.js), registered
//     parameters, default activation;
//   - old path: clock package off replays the 182 constructor exactly; the clock
//     package at the 182 rate with the 182 stoppage parameters does as well,
//     including a forced foul and a forced goal;
//   - clock contract: real-time invariance. Rates that differ by a power of two
//     (exact in floating point) must replay the same match in real time, state by
//     state, for a whole half (all intervals in clock units are converted);
//   - stoppages: free kick <= 3.0 s with teleport, lock of the two players only,
//     kickoff after a goal at least 2 s shorter, residual walk;
//   - freshness weight of intense duels;
//   - restore during a free kick and during the kickoff advance;
//   - classification of the remaining MATCH_SPEED occurrences in dist/.
// Usage: node work/test-si-clock-v183.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs'),{root}=require('./native130-harness.cjs');
const checks=[],timing=[];const check=(name,fn)=>{if(process.env.D6_CHECK&&!name.includes(process.env.D6_CHECK))return;const t0=Date.now();fn();checks.push(name);timing.push(Math.round((Date.now()-t0)/1000));if(process.env.D6_VERBOSE)console.error(timing.at(-1)+' s  '+name);};
const PACKAGES=['clock','options','offball','finish','defence','setplay','field'];
const OFF=Object.fromEntries(PACKAGES.map(p=>[p,false]));
const LEGACY_PARAMS={clock:{teleport:false,freeKickScene:3.8,foulLock:2.7,kickoffAdvance:false,kickoffWalkLead:0}};
const MATCH_SPEED=.78;
// The foul scene (v113) is not part of the native harness list; production loads it last.
// v65Restore of a goal scene shows the goal banner through two UI helpers the VM harness leaves out.
const harness=()=>{const h=create({view:false});h.run(fs.readFileSync(path.join(root,'dist/player-ball-events-v111.js'),'utf8'),'player-ball-events-v111.js');h.run('var v25DisplaySides=()=>[0,1];');return h;};
// finish: the keeper hold lines of SI-3 (world-pitch-actions-v99.js:27/37) are real time only with this switch.
const clockSi=(rate,params={})=>({packages:{clock:true,finish:true},clockRate:rate,params});
const CLUBS=[{club:'GER-2',seed:'inv0'},{club:'ENG-4',seed:'inv1'},{club:'ESP-1',seed:'inv2'}];

// ----- helpers and registration -----
const h0=harness(),ev0=text=>h0.evaluate(text),copy0=v=>h0.copy(v);
// Conversion sites: v152Seconds (clock units -> seconds) and v115FlightDuration (legacy-unit duration floor
// kept in real time, physical minimum in clock units) stand for the inline expressions used everywhere.
const rateProbe=(si,expr)=>{h0.call('Native183.constructed',{si});h0.call('Native183.run',20);return ev0(expr);};
const FLIGHT=`(()=>{const a={x:.5,y:.5},near={x:.5,y:.5+.002},far={x:.5,y:.2};return JSON.stringify({floor:v115FlightDuration(a,near,.32,'pass'),long:v115FlightDuration(a,far,.32,'pass'),metres:v122Metres(a,far)})})()`;
check('unmarked and clock-off matches keep MATCH_SPEED: v152Seconds, flight durations, v183Rate',()=>{
 for(const si of [false,{packages:OFF,clockRate:.42},{packages:{...OFF,finish:true},clockRate:.42}]){
  assert.equal(rateProbe(si,'v152Seconds(match)===match.elapsed/MATCH_SPEED'),true);
  const f=JSON.parse(ev0(FLIGHT));
  assert.equal(f.floor,.32,'legacy floor in units');assert.equal(f.long,f.metres/16*MATCH_SPEED,'physical term at MATCH_SPEED');
 }
});
check('clock matches: stored rate for seconds and physical flight time, legacy floor kept at its real-time length',()=>{
 for(const rate of [.42,.36,.39,MATCH_SPEED,1.56]){
  h0.call('Native183.constructed',{si:clockSi(rate)});h0.call('Native183.run',20);
  assert.equal(ev0('v183Rate(match)'),rate);assert.equal(ev0('v152Seconds(match)'),ev0('match.elapsed')/rate);
  const f=JSON.parse(ev0(FLIGHT));
  assert.equal(f.floor,.32*(rate/MATCH_SPEED),'floor: legacy units scaled by rate / MATCH_SPEED');
  assert.equal(f.long,f.metres/16*rate,'physical term: metres / speed * rate');
  // Real time: the floor lasts .32 / MATCH_SPEED seconds at any rate.
  assert(Math.abs(f.floor/rate-.32/MATCH_SPEED)<1e-15);
 }
});
check('a match of the 182 rate with the clock package behaves as without it (floor exactly the legacy unit)',()=>{
 h0.call('Native183.constructed',{si:clockSi(MATCH_SPEED)});
 assert.equal(JSON.parse(ev0(FLIGHT)).floor,.32);
});
check('registered parameters: defaults, types, stored with the match; the clock switch is on for new matches',()=>{
 assert.deepEqual(copy0(ev0('v183Registry.defaults.clock')),{teleport:true,freeKickScene:2.2,foulLock:1.8,kickoffAdvance:true,kickoffWalkLead:1.5});
 assert.equal(ev0('v183Registry.enabled.clock'),true);
 h0.call('Native183.constructed',{});
 assert.equal(ev0("v183Active(match,'clock')"),true);assert.equal(ev0('match.si.clockRate'),MATCH_SPEED,'the default rate stays the 182 rate until SI-K');
 assert.deepEqual(copy0(ev0('match.si.params.clock')),{teleport:true,freeKickScene:2.2,foulLock:1.8,kickoffAdvance:true,kickoffWalkLead:1.5});
 assert.throws(()=>h0.call('Native183.constructed',{si:{params:{clock:{foulLock:'1.8'}}}}),/number expected/);
 assert.throws(()=>h0.call('Native183.constructed',{si:{params:{clock:{teleport:1}}}}),/boolean expected/);
 assert.throws(()=>h0.call('Native183.constructed',{si:{params:{clock:{unknown:1}}}}),/Unknown SI parameter/);
 // v183ClockParam: the registered value for clock matches, the legacy value otherwise.
 h0.call('Native183.constructed',{si:false});assert.equal(ev0("v183ClockParam(match,'foulLock',2.7)"),2.7);
 h0.call('Native183.constructed',{si:{packages:OFF}});assert.equal(ev0("v183ClockParam(match,'foulLock',2.7)"),2.7);
 h0.call('Native183.constructed',{});assert.equal(ev0("v183ClockParam(match,'foulLock',2.7)"),1.8);
});
check('a stored match without a later clock parameter reads the registered default (restore compatibility)',()=>{
 h0.call('Native183.constructed',{});
 const stored=ev0(`(()=>{const m=structuredClone(match);delete m.si.params.clock.foulLock;return v183Param(m,'clock.foulLock')})()`);
 assert.equal(stored,1.8);
});

// ----- old path -----
check('clock package off (any stored rate) replays the 182 constructor exactly, without match.si',()=>{
 const h=harness();
 for(const scene of copy0(h.call('Native183.constructedScenes')).filter((s,i)=>i%4===0)){
  const marked=h.call('Native183.constructedDigest',scene,{withoutSi:true,si:{packages:OFF,clockRate:.42},segments:[250,250]}),legacy=h.call('Native183.constructedDigest',scene,{si:false,segments:[250,250]});
  assert.equal(marked,legacy,scene.id);
 }
});
// A scripted match: warm-up, a forced foul in midfield, the free kick, a forced goal, the kickoff.
const SCRIPT=`(()=>{const m=match,v=m.owner,o=m.people.filter(p=>p.t!==v.t&&!p.keeper).sort((a,b)=>v122Metres(a,v)-v122Metres(b,v))[0];o.x=v.x+.004;o.y=v.y+.004;v50Foul(v,o);return !!m.setPiece})()`;
// The goal is scored with the field players bunched up in midfield, so the kickoff formation needs a real walk.
const GOAL=`(()=>{const m=match,s=m.people.filter(p=>!p.keeper&&p.t===0)[0],k=m.people.find(p=>p.keeper&&p.t===1);for(const p of m.people)if(!p.keeper){p.x=.5+(p.bx-.5)*.3;p.y=.5+(p.by-.5)*.3;p.tx=p.x;p.ty=p.y}m.owner=s;m.flight=null;m.setPiece=null;m.rebound=null;m.kickoff=null;v50Goal(s,k,false,null)})()`;
// Plays on until a field player owns the ball in open play (no restart, goal scene, banner or loose ball).
function warm(h,ticks=300,dt=.05){for(let i=0;i<ticks;i++)h.call('Native183.advance',dt);for(let i=0;i<400&&!h.evaluate('!!match.owner&&!match.owner.keeper&&!match.flight&&!match.kickoff&&!match.setPiece&&!match.postBanner&&!(match.goalPause>0)&&!match.throwIn&&!match.rebound&&!match.halftimePause'); i++)h.call('Native183.advance',dt);}
function scripted(si,{club='GER-2',seed='script'}={}){
 const h=harness();h.call('Native183.constructed',{club,seed,size:'standard',roles:true,si});
 warm(h);assert(h.evaluate(SCRIPT),'foul created');
 for(let i=0;i<220;i++)h.call('Native183.advance',.05);
 const first=h.call('Native183.digest',{withoutSi:true});
 warm(h,60);h.evaluate(GOAL);
 for(let i=0;i<260;i++)h.call('Native183.advance',.05);
 return [first,h.call('Native183.digest',{withoutSi:true})];
}
check('clock package at the 182 rate with the 182 stoppage parameters replays 182 exactly (foul, free kick, goal, kickoff)',()=>{
 for(const club of ['GER-2','ENG-4']){
  const legacy=scripted(false,{club}),clock=scripted(clockSi(MATCH_SPEED,LEGACY_PARAMS),{club});
  assert.equal(clock[0],legacy[0],club+' after the free kick');assert.equal(clock[1],legacy[1],club+' after the kickoff');
 }
});

// ----- real-time invariance -----
// Compares two matches state by state: numbers equal, or related by the clock ratio in
// either direction (clock units / per clock unit); display-minute fields are excluded.
const DUMP=`(()=>{const m=match,seen=new WeakSet(),out={};
 const walk=(v,p,d)=>{if(d>6)return;if(typeof v==='number'){out[p]=v;return}if(!v||typeof v!=='object'||seen.has(v))return;seen.add(v);if(Array.isArray(v)){v.forEach((x,i)=>walk(x,p+'['+i+']',d+1));return}for(const k of Object.keys(v)){if(k==='people'||k==='exitedPeople'||k==='geometry'||k==='si')continue;walk(v[k],p+'.'+k,d+1)}};
 walk(m,'m',0);m.people.forEach((q,i)=>{for(const k of ['x','y','tx','ty','recoverUntil'])if(typeof q[k]==='number')out['p'+i+'.'+k]=q[k]});
 out.clock=v102Clock(m);out.owner=m.owner?m.owner.pid:null;
 return JSON.stringify({out,facts:{shots:m.shots,score:m.score,setPieces:m.setPieceStats,fouls:m.people.reduce((n,p)=>n+(p.stats.fouls||0),0),throwIn:!!m.throwIn,kickoffs:m.kickoff?1:0}})})()`;
// forced: [{tick, code}] run in both matches before that step (set pieces that open play rarely produces).
function invariance({club,seed},rateA,rateB,{params={},dt=.0437,limit=36,forced=[]}={}){
 const mk=rate=>{const h=harness();h.call('Native183.constructed',{club,seed,size:'standard',roles:true,si:clockSi(rate,params)});
  // Fatigue depends on the virtual minute by design; neutralise it so the comparison is about real time.
  h.evaluate('match.people.forEach(p=>{p.sta=100})');return h;};
 const A=mk(rateA),B=mk(rateB),ratio=rateB/rateA,events={shots:0,fouls:0,goals:0,corners:0,freeKicks:0,penalties:0};
 let ticks=0;
 for(;ticks<12000;ticks++){
  for(const item of forced)if(item.tick===ticks){A.evaluate(item.code);B.evaluate(item.code);}
  A.call('Native183.advance',dt);B.call('Native183.advance',dt);
  const da=JSON.parse(A.evaluate(DUMP)),db=JSON.parse(B.evaluate(DUMP));
  if(da.out['m.elapsed']>=limit||db.out['m.elapsed']>=limit)break;
  assert.equal(da.out.owner,db.out.owner,`owner at ${(ticks+1)*dt}s`);
  for(const k of Object.keys(da.out)){
   if(/minute|halftime|firstHalfEnd|fullTimeEnd|addedMinutes|stoppage/i.test(k))continue;
   assert(k in db.out,`${k} missing at ${((ticks+1)*dt).toFixed(2)} s`);
   const a=da.out[k],b=db.out[k];if(typeof a!=='number')continue;
   assert(Math.abs(a-b)<1e-9||Math.abs(a*ratio-b)<1e-9||Math.abs(a-b*ratio)<1e-9,`${k}: ${a} vs ${b} at ${((ticks+1)*dt).toFixed(2)} s (rates ${rateA}/${rateB})`);
  }
  assert.deepEqual(da.facts,db.facts,`facts at ${((ticks+1)*dt).toFixed(2)} s`);
  events.shots=da.facts.shots[0]+da.facts.shots[1];events.fouls=da.facts.fouls;events.goals=da.facts.score[0]+da.facts.score[1];
  events.corners=da.facts.setPieces.corners[0]+da.facts.setPieces.corners[1];events.freeKicks=da.facts.setPieces.freeKicks[0]+da.facts.setPieces.freeKicks[1];events.penalties=da.facts.setPieces.penalties[0]+da.facts.setPieces.penalties[1];
 }
 return {seconds:ticks*dt,events};
}
const covered={shots:0,fouls:0,goals:0,corners:0,freeKicks:0};
check('real-time invariance: rates .78 and .39 replay the first half identically (182 stoppage parameters)',()=>{
 for(const cfg of CLUBS){const r=invariance(cfg,.78,.39,{params:LEGACY_PARAMS});assert(r.seconds>35,`window ${r.seconds}`);}
});
check('real-time invariance: rates .78 and .39 replay the first half identically (new stoppage parameters)',()=>{
 for(const cfg of CLUBS){const r=invariance(cfg,.78,.39);assert(r.seconds>35,`window ${r.seconds}`);for(const k of Object.keys(covered))covered[k]+=r.events[k];}
});
check('real-time invariance: rates .39 and .195 (a whole half, 2 min of play) and .78 against 1.56',()=>{
 for(const cfg of CLUBS){const r=invariance(cfg,.39,.195);assert(r.seconds>100,`window ${r.seconds}`);for(const k of Object.keys(covered))covered[k]+=r.events[k];}
 const r=invariance(CLUBS[0],.78,1.56);assert(r.seconds>20,`window ${r.seconds}`);
});
check('the invariance windows contain shots, fouls and free kicks (the comparison is not vacuous)',()=>{
 assert(covered.shots>=4,JSON.stringify(covered));assert(covered.fouls+covered.freeKicks>=1,JSON.stringify(covered));
});

check('real-time invariance with a forced corner and a forced penalty (rates .78 and .39)',()=>{
 const corner=`v50Corner(0,.2,'Test')`;
 const penalty=`(()=>{const m=match,v=m.people.filter(p=>!p.keeper&&p.t===0)[0],o=m.people.filter(p=>!p.keeper&&p.t===1)[0];v.x=.5;v.y=.12;o.x=.504;o.y=.124;m.owner=v;m.flight=null;m.rebound=null;v50Foul(v,o)})()`;
 for(const cfg of CLUBS.slice(0,2)){
  const r=invariance(cfg,.78,.39,{forced:[{tick:200,code:corner},{tick:520,code:penalty}]});
  assert(r.seconds>35,`window ${r.seconds}`);
  assert(r.events.corners>=1&&r.events.penalties>=1,`forced set pieces happened: ${JSON.stringify(r.events)}`);
 }
});

// ----- stoppages -----
function freeKickSeconds(si,{club='GER-2'}={}){
 const h=harness();h.call('Native183.constructed',{club,seed:'fk',size:'standard',roles:true,si});warm(h);
 assert(h.evaluate(SCRIPT),'foul');
 const victim=h.evaluate('v113Fouls.get(match).victim.pid'),offender=h.evaluate('v113Fouls.get(match).offender.pid');
 const pos=()=>JSON.parse(h.evaluate(`JSON.stringify(match.people.map(p=>[p.pid,p.x,p.y]))`));
 let ticks=0,moved1=null,lockedAt1=null,lockedAt2=null;const before=pos();
 while(h.evaluate('!!match.setPiece')&&ticks<400){
  h.call('Native183.advance',.05);ticks++;
  if(ticks===1)moved1=pos();
  if(ticks===20)lockedAt1=pos();   // 1.0 s
  if(ticks===44)lockedAt2=pos();   // 2.2 s: past the 1.8 s lock
 }
 const metres=(a,b)=>h.evaluate(`Math.hypot((${a[1]}-${b[1]})*v160PitchWidth()/(v55Field.right-v55Field.left),(${a[2]}-${b[2]})*v160PitchLength()/(v55Field.bottom-v55Field.top))`);
 return {seconds:ticks*.05,before,moved1,lockedAt1,lockedAt2,victim,offender,metres,wait:null};
}
check('free kick: scene + fade + pause = 2.95 s (at most 3.0 s) with teleport at any rate, the 182 free kick lasts far longer',()=>{
 assert.equal(ev0('v183Registry.defaults.clock.freeKickScene')+.25+.5<=3.0,true);
 // Counted in 0.05 s ticks (a tick counts while the set piece exists), so one tick of quantisation is allowed.
 for(const rate of [.78,.42,.36]){const r=freeKickSeconds(clockSi(rate));assert(r.seconds<=3.0+.05+1e-9,`${rate}: ${r.seconds}`);assert(r.seconds>=2.9,`${rate}: ${r.seconds}`);}
 const legacy=freeKickSeconds(false);assert(legacy.seconds>=5,`182: ${legacy.seconds}`);
 const params=freeKickSeconds(clockSi(.78,LEGACY_PARAMS));assert(params.seconds>=5,`legacy parameters: ${params.seconds}`);
});
check('free kick: everybody but the two players involved is placed at once; those two are placed when the 1.8 s lock ends',()=>{
 const r=freeKickSeconds(clockSi(.5)),legacy=freeKickSeconds(clockSi(.5,LEGACY_PARAMS));
 const idx=pid=>r.before.findIndex(p=>p[0]===pid);
 const afterFirst=r.before.map((p,i)=>r.metres(p,r.moved1[i]));
 const legacyFirst=legacy.before.map((p,i)=>legacy.metres(p,legacy.moved1[i]));
 const locked=new Set([idx(r.victim),idx(r.offender)]);
 const placedAtOnce=afterFirst.filter((d,i)=>!locked.has(i)&&d>1).length;
 assert(placedAtOnce>=4,`teleported at once: ${placedAtOnce}`);
 assert(legacyFirst.filter(d=>d>1).length===0,'182: nobody jumps in the first tick');
 for(const i of locked){assert(r.metres(r.before[i],r.lockedAt1[i])<1e-6,'locked player stays for the first second');}
 // After the lock the two players have been placed.
 assert([...locked].some(i=>r.metres(r.before[i],r.lockedAt2[i])>1),'locked players placed after the lock');
});
check('foul event: the animation duration equals the lock (1.8 s) and is absent in 182 matches; three.js plays the whole animation in it',()=>{
 const probe=(si,ticks)=>{const h=harness();h.call('Native183.constructed',{club:'GER-2',seed:'fk',size:'standard',roles:true,si});warm(h);h.evaluate(SCRIPT);
  for(let i=0;i<ticks;i++)h.call('Native183.advance',.05);
  return JSON.parse(h.evaluate(`(()=>{const f=v113Fouls.get(match);return JSON.stringify({victim:v113FoulAction(match,f.victim),offender:v113FoulAction(match,f.offender)})})()`));};
 const clock=probe(clockSi(.5),35);   // 1.75 s: still inside the 1.8 s lock
 for(const side of ['victim','offender']){assert.equal(clock[side].duration,1.8,side);assert(clock[side].progress>.9&&clock[side].progress<1,`${side} progress ${clock[side].progress}`);}
 for(const si of [false,clockSi(.5,LEGACY_PARAMS)]){
  const old=probe(si,35);
  for(const side of ['victim','offender'])assert.deepEqual(Object.keys(old[side]),['id','kind','progress','age','sliding','target'],'182 event format unchanged');
  assert(old.victim.progress<.7,'2.7 s lock in 182');
 }
 // The three.js scaling (dist/player-user-ball-actions-v111.js) is evaluated from its source.
 const source=fs.readFileSync(path.join(root,'dist/player-user-ball-actions-v111.js'),'utf8'),expression=/const foulAge=([^;]+);/.exec(source)?.[1];
 assert(expression,'foulAge expression');
 const foulAge=new Function('a',`return ${expression}`);
 assert.equal(foulAge({kind:'foulVictim',age:1.8,duration:1.8}),2.7,'the whole animation within the lock');
 assert.equal(foulAge({kind:'foulOffender',age:.9,duration:1.8}),1.35);
 assert.equal(foulAge({kind:'foulVictim',age:1.8}),1.8,'without duration the 182 animation time is unchanged');
 assert.equal(foulAge({kind:'tackle',age:.3,duration:.5}),.3,'other actions keep their age');
 assert(/celebrating=goal&&goal\.team===v\.team&&speed<\.6/.test(fs.readFileSync(path.join(root,'dist/player-user-motion-v108.js'),'utf8')),'walking players stop celebrating (as in Unity)');
});
// Goal scored by the most advanced player of team 0 with the field players where open play left them.
const GOAL_NATURAL=`(()=>{const m=match,s=m.people.filter(p=>!p.keeper&&p.t===0).sort((a,b)=>a.y-b.y)[0],k=m.people.find(p=>p.keeper&&p.t===1);m.owner=s;m.flight=null;m.setPiece=null;m.rebound=null;m.kickoff=null;v50Goal(s,k,false,null)})()`;
const KICKOFF_CONFIGS=[{club:'GER-2',size:'large',warm:700},{club:'ESP-1',size:'standard',warm:600},{club:'ENG-4',size:'standard',warm:500}];
function kickoffAfterGoal(si,{club='GER-2',size='standard',warm:warmTicks=300,goal=GOAL_NATURAL}={}){
 const h=harness();h.call('Native183.constructed',{club,seed:'ko5',size,roles:true,si});
 h.evaluate('match.people.forEach(p=>{p.sta=100})');   // fatigue follows the virtual minute by design; keep the starting position equal at every rate
 warm(h,warmTicks);h.evaluate(goal);
 // mean distance of the field players of one team to their base position of the kickoff formation
 const dist=team=>h.evaluate(`(()=>{const m=match;let s=0,n=0;for(const p of m.people){if(p.keeper||p.t!==${team})continue;s+=v122Metres(p,{x:p.bx,y:p.t===0?Math.max(p.by,.56):Math.min(p.by,.44)});n++}return s/n})()`);
 // team 0 scored, team 1 kicks off
 const start=[dist(0),dist(1)];let ticks=0,phase='',marks={},countdown=null,at2=null,at4=null;
 const cat=()=>h.evaluate(`(()=>{const m=match;return m.goalPause>0?'goalPause':m.postBanner?('banner:'+m.postBanner.kind):m.kickoff?('kickoff:'+m.kickoff.phase):'play'})()`);
 for(;ticks<800;ticks++){
  h.call('Native183.advance',.05);const c=cat();
  if(ticks===39)at2=[dist(0),dist(1)];   // 2.0 s into the goal scene
  if(ticks===79)at4=[dist(0),dist(1)];   // 4.0 s
  if(c!==phase){marks[c]=(ticks+1)*.05;phase=c;if(c==='kickoff:waiting')countdown=h.evaluate('match.countdown');}
  if(c==='kickoff:rolling')break;
 }
 return {seconds:+((ticks+1)*.05).toFixed(2),marks,start,at2,at4,countdown};
}
check('kickoff after a goal: at least 2 s shorter; the scoring team celebrates first, the kicking-off team walks at once',()=>{
 for(const cfg of KICKOFF_CONFIGS){
  const tag=`${cfg.club} ${cfg.size}`,legacy=kickoffAfterGoal(false,cfg),flat=kickoffAfterGoal(clockSi(.78,LEGACY_PARAMS),cfg);
  assert.equal(flat.seconds,legacy.seconds,tag+': the 182 parameters keep the 182 time');
  const reference=kickoffAfterGoal(clockSi(.78),cfg);
  // Rates in power-of-two ratios replay the play before the goal identically (see the invariance checks).
  for(const rate of [.78,.39,.195]){
   const r=rate===.78?reference:kickoffAfterGoal(clockSi(rate),cfg);
   // Same starting position (play before the goal is identical): only the advance is switched off.
   const without=kickoffAfterGoal(clockSi(rate,{clock:{kickoffAdvance:false}}),cfg);
   assert(without.seconds-r.seconds>=2-1e-9,`${tag} ${rate}: ${without.seconds} -> ${r.seconds}`);
   assert.equal(r.seconds,reference.seconds,`${tag}: independent of the rate`);
   // Scoring team (0): untouched while the goal scene celebrates (lead 1.5 s of 4.05 s), walking afterwards.
   assert.equal(r.at2[0],r.start[0],`${tag} ${rate}: scoring team stays during the celebration`);
   assert(r.at4[0]<r.start[0]*.9,`${tag} ${rate}: scoring team walks at the end of the goal scene ${r.start[0]} -> ${r.at4[0]}`);
   // Kicking-off team (1) walks at once.
   assert(r.at2[1]<r.start[1]*.8,`${tag} ${rate}: the kicking-off team walks from the start ${r.start[1]} -> ${r.at2[1]}`);
  }
 }
});
check('kickoff advance: the walk targets are the real kickoff formation (residual walk <= 0.2 s)',()=>{
 // Everybody arrives (one long step of the advance), then the actual kickoff places the formation.
 for(const size of ['standard','large'])for(const team of [0,1]){
  const h=harness();h.call('Native183.constructed',{club:'ENG-4',seed:'ko6',size,roles:true,si:clockSi(.42)});warm(h,500);
  h.evaluate(GOAL_NATURAL);
  if(team===1)h.evaluate('(()=>{const m=match;m.pendingKickoff=1-m.pendingKickoff})()');   // the other side kicks off
  const countdown=h.evaluate(`(()=>{const m=match;m.goalPause=1;v183ClockKickoffAdvance(m,30);const next=m.pendingKickoff;m.goalScene=null;m.goalPause=0;m.postBanner=null;kickoff(next);m.pendingKickoff=null;return m.countdown})()`);
  assert(countdown<=.2+1e-9,`${size} team ${team}: residual walk ${countdown} s`);
 }
});
check('clock package off: free kick and kickoff times are the 182 ones whatever the stored rate',()=>{
 const off=kickoffAfterGoal({packages:OFF,clockRate:.42}),legacy=kickoffAfterGoal(false);
 assert.deepEqual(off,legacy);
 assert.equal(freeKickSeconds({packages:OFF,clockRate:.42}).seconds,freeKickSeconds(false).seconds);
});

// ----- freshness weight of intense duels -----
check('intense-duel load events weigh rate / MATCH_SPEED for clock matches, exactly 1 otherwise',()=>{
 const h=harness();
 const units=si=>{
  h.call('Native183.constructed',{si});h.call('Native183.run',20);
  return h.evaluate(`(()=>{const m=match,ctx=v65WorldActive,a=m.people.find(p=>!p.keeper&&p.t===0),b=m.people.find(p=>!p.keeper&&p.t===1);
   ctx.state.playerLoad={version:158,players:{[a.pid]:{},[b.pid]:{}},meta:{},pending:{},sequence:0,startFresh:{}};
   v158Contact(m,a,b);v158LoadAction(m,a,'keeper-dive','x:dive');
   const e=ctx.state.playerLoad.pending[a.pid].events;return JSON.stringify(e.map(x=>({type:x.type,units:x.units,keys:Object.keys(x).join()})))})()`);
 };
 const base=JSON.parse(units(false));
 assert.deepEqual(base.map(x=>x.units),[1,1]);
 assert.equal(base[0].keys,'id,causeId,type,minute,units','event format unchanged');
 assert.deepEqual(JSON.parse(units({packages:OFF,clockRate:.42})).map(x=>x.units),[1,1]);
 assert.deepEqual(JSON.parse(units(clockSi(.78))).map(x=>x.units),[1,1]);
 assert.deepEqual(JSON.parse(units(clockSi(.39))).map(x=>x.units),[.5,1],'keeper events are not scaled (fixed weight in the freshness model)');
 const low=JSON.parse(units(clockSi(.36)))[0].units;assert(Math.abs(low-.36/MATCH_SPEED)<1e-15);
});

// ----- restore -----
function checkpointNow(h){let saved=false;for(let i=0;i<60&&!saved;i++){saved=h.call('Native183.checkpoint');if(!saved)h.call('Native183.advance',.05);}assert(saved,'checkpoint taken');}
check('restore during a free kick: stored rate, parameters and waiting time carry on; the free kick ends on time',()=>{
 const run=(restore)=>{
  const h=harness();h.call('Native183.constructed',{club:'GER-2',seed:'rs',size:'standard',roles:true,si:clockSi(.42)});warm(h);h.evaluate(SCRIPT);
  for(let i=0;i<12;i++)h.call('Native183.advance',.05);   // 0.6 s into the 2.2 s scene
  const before=h.copy(h.evaluate('JSON.stringify({si:match.si,wait:match.setPiece.wait,phase:match.setPiece.phase,type:match.setPiece.type,spot:match.setPiece.spot,team:match.setPiece.team})'));
  if(restore){
   h.call('Native183.checkpoint')||assert.fail('snapshot refused during the waiting phase');
   const after=h.copy(h.evaluate('JSON.stringify({si:match.si,wait:match.setPiece.wait,phase:match.setPiece.phase,type:match.setPiece.type,spot:match.setPiece.spot,team:match.setPiece.team})'));
   assert.equal(after,before,'free-kick state and match.si restored');
   assert.equal(h.evaluate("v183Active(match,'clock')&&Object.isFrozen(match.si)&&match.si.clockRate===.42"),true);
  }
  let ticks=12;while(h.evaluate('!!match.setPiece')&&ticks<400){h.call('Native183.advance',.05);ticks++;}
  return {seconds:ticks*.05,ownerSet:h.evaluate('!!match.flight||!!match.owner')};
 };
 const straight=run(false),restored=run(true);
 assert(straight.seconds<=3.05+1e-9&&restored.seconds<=3.05+1e-9,JSON.stringify({straight,restored}));
 assert.equal(restored.seconds,straight.seconds,'the restart is not delayed by the restore');
});
check('restore during the kickoff advance: positions and phase persist, the kickoff follows on time',()=>{
 const run=(restore,params={})=>{
  const h=harness();h.call('Native183.constructed',{club:'ENG-4',seed:'rs2',size:'standard',roles:true,si:clockSi(.42,params)});warm(h);h.evaluate(GOAL);
  for(let i=0;i<40;i++)h.call('Native183.advance',.05);   // 2 s into the goal scene: players are walking
  const snap=()=>h.copy(h.evaluate('JSON.stringify({pk:match.pendingKickoff,gp:match.goalPause,pos:match.people.map(p=>[p.pid,p.x,p.y])})'));
  const before=snap();
  if(restore){h.call('Native183.checkpoint')||assert.fail('snapshot refused during the goal scene');assert.equal(snap(),before,'goal scene state and player positions restored');}
  const cat=()=>h.evaluate(`(()=>{const m=match;return m.kickoff?m.kickoff.phase:'x'})()`);
  let ticks=40;while(cat()!=='rolling'&&ticks<700){h.call('Native183.advance',.05);ticks++;}
  return ticks*.05;
 };
 const straight=run(false),restored=run(true),legacy=run(false,LEGACY_PARAMS);
 assert.equal(restored,straight,'the kickoff is not delayed by the restore');
 assert(legacy-straight>=2-1e-9,`kickoff after ${straight} s against ${legacy} s with the 182 parameters`);
});

// ----- classification of the remaining MATCH_SPEED occurrences -----
check('MATCH_SPEED in the engine files: after removing the inline conversions only the documented bare uses remain',()=>{
 // Inline conversions: (m.si?v183Rate(m):MATCH_SPEED), v183Rate(m)/MATCH_SPEED, MATCH_SPEED/v183Rate(m).
 const inline=[/\(([a-z]+)\.si\?v183Rate\(\1\):MATCH_SPEED\)/g,/\(typeof match!=='undefined'&&match\?\.si\?v183Rate\(match\):MATCH_SPEED\)/g,/v183Rate\([a-z]+\)\/MATCH_SPEED/g,/MATCH_SPEED\/v183Rate\([a-z]+\)/g];
 const expected={
  'game.js':2,                              // the constant and the loop of the old Sechserliga
  'pitch-motion-v102.js':1,                 // flight meta before fly(): legacy-unit duration / MATCH_SPEED (overwritten after fly)
  'world-3d-documentation-data-v134.js':2,  // documentation text
  'world-offensive-quality-v157.js':1,      // legacy floor of the pass lead / MATCH_SPEED = constant real time
  'world-pitch-actions-v99.js':5,           // :27/:37 keeper hold (SI-3), v101ShotDuration (legacy unit for fly), fallback of the miss pose
  'world-pitch3d-v98.js':1,                 // presentation: slide recovery duration (constant real time)
  'world-space-passes-v150.js':1,           // fly() argument in legacy units
 };
 const actual={};
 for(const f of fs.readdirSync(path.join(root,'dist')).filter(f=>f.endsWith('.js')&&!f.startsWith('match-si-'))){
  let text=fs.readFileSync(path.join(root,'dist',f),'latin1');
  for(const pattern of inline)text=text.replace(pattern,'');
  const n=(text.match(/MATCH_SPEED/g)||[]).length;if(n)actual[f]=n;
 }
 assert.deepEqual(actual,expected);
});

console.log(JSON.stringify({pass:true,checks:checks.length,names:checks,seconds:timing,covered}));
