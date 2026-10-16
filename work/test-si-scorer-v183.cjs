'use strict';
// Torjäger round of player intelligence 183 (goal spread, score state, air
// finishes of open play). Runs the actual dist modules in the native VM
// harness. Checks: parameters registered with their defaults; perceived
// finishing (SI-1 v183OptPerceived) pulls a team-mate's finishing toward the
// team mean in pass values (mateFin) and the carrier's own shot (selfFin),
// restores the ability function (also after an error) and draws nothing;
// two receivers who differ only in finishing are valued alike at mateFin 0;
// SI-2 offer values use the same rule (xgFin); the lead intensity of a
// leading team (score, cap, clock) and its effect on shoot and risk weights
// (SI-1) and on carrier/run pace (SI-2); the keeper shift during an opposing
// high ball: keeperShift for corners, keeperShiftOpen otherwise (SI-7); no
// new match state; full constructor matches on both pitch sizes.
// Usage: node work/test-si-scorer-v183.cjs
const assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs');
const h=create({view:false}),ev=t=>h.evaluate(t),copy=h.copy;
let failures=0,passed=0;
function check(name,fn){try{fn();passed++;console.log('ok   '+name);}catch(e){failures++;console.log('FAIL '+name+'\n     '+String(e.stack||e).split('\n').slice(0,4).join('\n     '));}}

// Scene builder (as test-si-options-v183): two keepers and explicit field
// players on a fresh native match with the 182 markers of new matches and
// match.si; dec 20 = no evaluation noise.
h.run(`globalThis.SC={
 build(spec){
  const N=Native182;N.seedRandom(spec.seed??1);
  const size=spec.size||'standard',geometry=v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:size,fieldPlayers:5}}}),s={x:geometry.width/(v55Field.right-v55Field.left),y:geometry.length/(v55Field.bottom-v55Field.top)},L=geometry.length;
  const place=(t,goal,lateral)=>N.at(t,L-goal,lateral,s);
  const people=[N.person('k0',0,...Object.values(N.at(0,1.5,0,s)),'gk',{n:1,gk:12},true),N.person('k1',1,...Object.values(N.at(1,1.5,0,s)),'gk',{n:1,gk:12},true)];
  let n=2;
  for(const [list,t]of [[spec.attack||[],0],[spec.defend||[],1]])for(const q of list){const at=t===0?place(0,q.goal,q.lateral):N.at(1,q.goal,-q.lateral,s);const p=N.person(q.id,t,at.x,at.y,q.line||'mid',{n:n++,dec:20,...(q.skills||{})});if(q.role)p.tacticalRole=q.role;people.push(p);}
  N.install({people,size,ball:{x:people[2].x,y:people[2].y},lastTouch:0,markers:{keeperHoldRevision:182,setPieceRevision:182,looseBallRevision:182,pursuitRevision:182,motionRevision:182}});
  match.penaltyRevision=182;match.si=v183CreateSi(spec.si||{packages:{options:true,finish:true,offball:true,setplay:true}});
  const carrier=match.people.find(p=>p.pid===spec.attack[0].id);match.owner=carrier;match.ball={x:carrier.x,y:carrier.y};match.next=match.elapsed;match.lastTouch=0;
  for(const q of [...(spec.attack||[]),...(spec.defend||[])]){const p=match.people.find(x=>x.pid===q.id),body=v157Body(p);body.heading=q.heading??(p.t===0?Math.PI:0);}
  if(spec.score)match.score=[...spec.score];if(spec.elapsed!=null)match.elapsed=spec.elapsed;
  return match;
 },
 options(){const m=match,p=m.owner,allies=m.people.filter(q=>q.t===p.t&&q!==p&&!q.keeper),rivals=m.people.filter(q=>q.t!==p.t),P=v183OptParams(m);
  return v183OptCached(()=>v183OptOptions(m,p,allies,rivals,P)).list.map(o=>({kind:o.kind,ref:o.ref??null,u:o.u,gain:o.gain,loss:o.loss,arrival:o.arrival??null,xg:o.xg??null}));},
 by(id){return match.people.find(p=>p.pid===id);}
};`,'scorer-scenes');
const scene=spec=>h.call('SC.build',spec);
const options=()=>copy(h.call('SC.options'));
const DEFAULTS={'options.mateFin':.3,'options.selfFin':.5,'options.leadShoot':.5,'options.leadRisk':.5,'options.leadCap':3,'options.leadEarly':.5,'offball.xgFin':.3,'offball.leadPace':.25,'setplay.keeperShift':.4,'setplay.keeperShiftOpen':1,'finish.volleySpread':1.6};
const si=(flat={})=>{const params={};for(const [k,v]of Object.entries(flat)){const [pkg,name]=k.split('.');(params[pkg]??={})[name]=v;}return {packages:{options:true,finish:true,offball:true,setplay:true},params};};
// Two receivers mirrored about the carrier's line, equal except finishing.
const pair=(params,extra={})=>({seed:3,si:si(params),attack:[{id:'c',goal:30,lateral:0,line:'mid',role:'box-to-box',skills:{pas:13,fin:10,tec:11}},{id:'a',goal:15,lateral:-6,line:'att',role:'striker',skills:{fin:16,tec:11,spd:11}},{id:'b',goal:15,lateral:6,line:'att',role:'striker',skills:{fin:8,tec:11,spd:11}}],defend:[{id:'x',goal:13,lateral:-12,line:'def'},{id:'y',goal:13,lateral:12,line:'def'}],...extra});

check('parameters registered with the defaults of the Torjäger round',()=>{
 scene(pair({}));
 for(const [key,value]of Object.entries(DEFAULTS))assert.equal(ev(`v183Param(match,${JSON.stringify(key)})`),value,key);
});

check('lead intensity: 0 when level or behind; min(lead,leadCap)/leadCap times leadEarly..1 over the clock',()=>{
 const at=(score,elapsed,t=0)=>{scene(pair({'options.leadCap':3,'options.leadEarly':.5},{score,elapsed}));ev('match.fullTimeEnd=80');return ev(`v183LeadIntensity(match,${t})`);};
 assert.equal(at([0,0],40),0);assert.equal(at([1,2],40),0);assert.equal(at([2,1],40,1),0);
 assert(Math.abs(at([1,0],0)-1/3*.5)<1e-12,'one goal at kick-off');assert(Math.abs(at([2,0],40)-2/3*.75)<1e-12,'two goals at half time');
 assert(Math.abs(at([6,0],80)-1)<1e-12,'capped at leadCap, full at full time');assert(Math.abs(at([0,3],80,1)-1)<1e-12,'team 1');
});

// Explicit score-state parameters for the mechanics checks (independent of the defaults).
const STATE={'options.leadCap':2,'options.leadEarly':.5,'options.leadShoot':.4,'options.leadRisk':.3,'options.levelRisk':.3,'offball.leadPace':.2,'offball.levelPace':.15,'offball.leashLead':4};
const near=(a,b,msg)=>assert(Math.abs(a-b)<1e-12,`${msg}: ${a} vs ${b}`);
check('score state: shoot and risk weights fall with the lead intensity, the risk weight late in a level game; neutral without parameters',()=>{
 const w=(score,elapsed,params=STATE)=>{scene(pair(params,{score,elapsed}));ev('match.fullTimeEnd=80');return copy(ev(`(()=>{const P=v183OptParams(match),c=SC.by('c');return {state:v183OptStateWeights(match,c,P),base:v183OptWeights(c,P),s:v183ScoreState(match,0)};})()`));};
 const lead=w([2,0],80),one=w([1,0],40),behind=w([0,2],80),level=w([1,1],60),early=w([0,0],0);
 assert.deepEqual(lead.s,{lead:1,level:0});near(one.s.lead,.5*.75,'one goal at half time');assert.deepEqual(behind.s,{lead:0,level:0});near(level.s.level,.5625,'level at 60 of 80');
 near(lead.state.shootWeight,lead.base.shootWeight*(1-.4),'leader shoots less');near(lead.state.riskWeight,lead.base.riskWeight*(1-.3),'leader risks less');
 assert.deepEqual(behind.state,behind.base,'trailing team unchanged');
 near(level.state.shootWeight,level.base.shootWeight,'level: shoot unchanged');near(level.state.riskWeight,level.base.riskWeight*(1-.3*.5625),'level late: cautious');
 assert.deepEqual(early.state,early.base,'level at kick-off: no effect');
 const off=w([2,0],80,{});assert.deepEqual(off.state,off.base,'neutral without parameters');
 const gain=score=>{scene({seed:5,si:si(STATE),score,elapsed:20,attack:[{id:'c',goal:16,lateral:1,line:'att',role:'striker',skills:{fin:14}}],defend:[{id:'x',goal:8,lateral:7,line:'def'}]});ev('match.fullTimeEnd=80');return {g:options().find(o=>o.kind==='shot').gain,s:copy(ev('v183ScoreState(match,0)'))};};
 const g2=gain([2,0]),g0=gain([0,0]);assert(g2.s.lead>0);near(g2.g,g0.g*(1-.4*g2.s.lead),'shot gain of the leader');
});

check('score state: SI-2 carrier and run pace by leadPace and levelPace; the trailing team keeps its pace',()=>{
 const pace=(score,elapsed=80,params=STATE)=>{scene(pair(params,{score,elapsed}));ev('match.fullTimeEnd=80');return copy(ev(`(()=>{const c=SC.by('c'),x=SC.by('x');return {carrier:v183PaceFactor(match,c,'carrier'),rival:v183PaceFactor(match,x,'carrier')};})()`));};
 const lead=pace([2,0]),level=pace([1,1]),base=pace([0,0],80,{}),start=pace([0,0],0);
 near(lead.carrier,base.carrier*(1-.2),'leading carrier slower');assert.equal(lead.rival,base.rival,'trailing carrier unchanged');
 near(level.carrier,base.carrier*(1-.15),'level at full time slower');assert.equal(start.carrier,base.carrier,'level at kick-off unchanged');
});

check('score state: SI-2 zone leash of a leading team shrinks by leashLead x lead intensity',()=>{
 const shift=(score,params)=>{scene(pair(params,{score,elapsed:80}));ev('match.fullTimeEnd=80');return copy(ev('[v183OffballLeashShift(match,0),v183OffballLeashShift(match,1)]'));};
 assert.deepEqual(shift([2,0],STATE),[-4,0]);assert.deepEqual(shift([1,1],STATE),[0,0]);assert.deepEqual(shift([2,0],{}),[0,0]);
 const val=score=>{scene(pair(STATE,{score,elapsed:80}));ev('match.fullTimeEnd=80');return ev(`(()=>{const m=match,q=SC.by('c'),z=v162Zone(m,q),s=v150Scale(),pt={x:z.x,y:z.y+(q.t===0?-1:1)*20/s.y},ctx={owner:SC.by('a'),rivals:m.people.filter(r=>r.t!==q.t),s,dir:q.t===0?-1:1,occupied:[],zone:z,profile:v183OffballProfile(m,q),limit:null,lastCats:{},leashShift:v183OffballLeashShift(m,q.t),P:k=>v183Param(m,'offball.'+k)};return v183OffballValue(m,q,{x:pt.x,y:pt.y,cat:'depth'},ctx).value;})()`);};
 assert(val([2,0])<val([0,0]),'a far run costs the leader more');
});

check('keeper during an opposing high ball: keeperShift for a corner, keeperShiftOpen for every other flight',()=>{
 const run=kind=>{scene(pair({'setplay.keeperShift':.4,'setplay.keeperShiftOpen':1}));return copy(ev(`(()=>{const m=match,k=m.people.find(p=>p.keeper&&p.t===1),s=v160PitchScale(m),end={x:.5+5/s.x,y:v55Field.top+7/s.y};
  k.tx=.5;k.ty=v55Field.top+.6/s.y;const flight={aerial:true,team:0,progress:.6,duration:1.2};m.flight=flight;v122AerialPlans.set(flight,{contenders:[],pursuers:[],end});
  m.attackFlow.setplay={secondBall:{team:0,at:0,x:end.x,y:end.y,kind:${JSON.stringify(kind)}}};
  const t=v183KeeperFlightTarget(m,k);m.flight=null;return {x:(t.x-.5)*s.x,stale:(()=>{m.flight=flight;m.attackFlow.setplay.secondBall={team:0,at:0,x:end.x+.01,y:end.y,kind:'corner'};const u=v183KeeperFlightTarget(m,k);m.flight=null;return (u.x-.5)*s.x;})()};})()`));};
 const corner=run('corner'),cross=run('cross');
 assert(cross.x>corner.x+.1,`the keeper steps further across on an open-play cross (${cross.x.toFixed(2)} vs corner ${corner.x.toFixed(2)} m)`);
 assert(Math.abs(corner.x/cross.x-.4/1)<1e-9,'shares as configured (start target at the centre)');
 assert.equal(cross.stale,cross.x,'a corner record of another flight counts as open play');
});

check('full constructor matches with the defaults (both pitch sizes) finish without errors; no new attackFlow keys',()=>{
 for(const size of ['standard','large']){
  h.call('Native183.constructed',{club:'GER-2',seed:'scorer-'+size,size,roles:true});
  const r=copy(ev(`(()=>{finishMatch=function(){match.finished=true;running=false;match.flight=null;};
   for(let i=0;i<800&&(match.kickoff||match.countdown>0);i++)Native183.advance();match.firstHalfEnd=1200;match.fullTimeEnd=2400;match.halftime=false;
   const keys=new Set();let n=0;for(;n<24000&&!match.finished;n++){Native183.advance();for(const k of Object.keys(match.attackFlow))keys.add(k);}
   return {finished:match.finished||n===24000,goals:match.score[0]+match.score[1],shots:match.people.reduce((a,p)=>a+(p.stats.shots||0),0),keys:[...keys]};})()`));
  assert(r.shots>0,'shots');
  for(const k of r.keys)assert(['decision','carry','intents','offball','defence','setplay','crossRun','pendingTurn','receipt','combination','releaseGuard','counter','crossZoneOwner'].includes(k)||!/lead|scorer|perceiv/i.test(k),'unexpected state key '+k);
 }
});

console.log(`\n${passed} passed, ${failures} failed`);
if(failures)process.exitCode=1;
