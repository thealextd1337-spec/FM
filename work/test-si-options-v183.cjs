'use strict';
// SI-1 option model of the ball carrier (dist/match-si-options-v183.js).
// Old path: with the options package off the wrapped functions run unchanged
// (constructor matches digest-equal to rules 182, stub estimate unchanged).
// New path: native scenes for the long shot of a good shooter, the shot from a
// pending turn, the turn release, stub detection, flight seconds at rate 0.42,
// player instructions, the dribbler take-on, symmetric carry/pass values, the
// high-ball fallback, risk/personality (same skills, other role or
// mental values and vice versa), free and closed passing lanes, a square pass,
// a won rebound, commitment between near-equal options and the dec noise; full
// constructor matches on both pitch sizes; restore of the decision and of a
// pending turn through JSON; timing of one evaluation in Node.
// Usage: node work/test-si-options-v183.cjs [--quick]   (Node >= 20)
const assert=require('node:assert/strict'),path=require('node:path'),cp=require('node:child_process');

// Child mode: time one evaluation in Node's main context (per match state the
// fastest of five blocks of four evaluations, so machine load does not count). The VM sandbox of the
// harness makes every global lookup slow (the legacy decision costs about
// eight times its main-context time there), so the scripts run in an ordinary
// global object here: makeContext's sandbox values are copied onto globalThis
// and scripts run with runInThisContext.
if(process.env.D6_SI1_TIMING){
 const vm=require('node:vm'),{performance}=require('node:perf_hooks');let sandbox=null;
 vm.createContext=function(context){sandbox=context;for(const [k,v]of Object.entries(context)){try{Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true,enumerable:true});}catch{}}return globalThis;};
 // The contextified sandbox tolerates assignments to undeclared globals in
 // strict scripts; an ordinary global does not. Predeclare such targets.
 const reserved=new Set(['const','let','var','function','return','if','else','for','while','this','new','typeof','case','default']),escape=s=>s.replace(/[$]/g,'\\$');
 vm.runInContext=function(code,ctx,opts){
  for(const m of code.matchAll(/(?:^|[;{}\n(,])\s*([A-Za-z_$][\w$]*)\s*=(?![=>])/g)){const k=m[1];if(reserved.has(k)||k in globalThis||new RegExp('(?:const|let|class|function)\\s[^;]*?(?:^|[^\\w$])'+escape(k)+'(?![\\w$])').test(code))continue;Object.defineProperty(globalThis,k,{value:undefined,writable:true,configurable:true,enumerable:true});}
  return vm.runInThisContext(code,typeof opts==='string'?{filename:opts}:opts);
 };
 const {create}=require('./native183-scenes.cjs'),h=create({view:false});
 for(const k of ['addEventListener','scrollTo','setInterval','clearInterval','location'])if(sandbox[k]!==undefined)Object.defineProperty(globalThis,k,{value:sandbox[k],writable:true,configurable:true});
 globalThis.window=globalThis;globalThis.__now=()=>performance.now();
 h.run(`finishMatch=function(){match.finished=true;running=false;match.flight=null;};globalThis.__samples=[];
  const base=v157Decide;v157Decide=function(m,p,allies,rivals){
   if(v183Active(m,'options')&&!p.keeper&&!m.attackFlow.pendingTurn&&!(m.attackFlow.receipt?.playerId===p.pid&&v152Seconds(m)<m.attackFlow.receipt.readyAt)&&__samples.length<${+process.env.D6_SI1_TIMING}){
    const P=v183OptParams(m);let best=Infinity;for(let b=0;b<5;b++){const t0=__now();for(let i=0;i<4;i++)v183OptCached(()=>v183OptOptions(m,p,allies,rivals,P));best=Math.min(best,(__now()-t0)/4);}__samples.push(best);}
   return base.apply(this,arguments);};`);
 for(const [club,size]of [['GER-2','standard'],['ENG-4','large'],['ESP-1','standard'],['ITA-3','large']]){h.run('running=true');h.call('Native183.constructed',{club,seed:'si1-timing',size,roles:true,si:{packages:{clock:true,options:true,...(process.env.D6_SI1_FINISH==='0'?{finish:false}:{})},clockRate:.42}});h.evaluate('(()=>{for(let n=0;n<20000&&!match.finished;n++)Native183.advance();})()');}
 process.stdout.write(h.evaluate('JSON.stringify(__samples)'));
 return;
}

const quick=process.argv.includes('--quick');
const {create}=require('./native183-scenes.cjs');
const h=create({view:false}),ev=t=>h.evaluate(t),copy=h.copy;
const PACKAGES=['clock','options','offball','finish','defence','setplay','field'],allOff=Object.fromEntries(PACKAGES.map(p=>[p,false]));
let failures=0;
function check(name,fn){try{fn();console.log('ok   '+name);}catch(e){failures++;console.log('FAIL '+name+'\n     '+String(e.stack||e).split('\n').slice(0,4).join('\n     '));}}

// Scene builder: two keepers and explicit field players on a fresh native
// match with the 182 markers of new matches and match.si for the options
// package (dec 20 = no evaluation noise unless a test sets it).
h.run(`globalThis.SI1={
 build(spec){
  const N=Native182;N.seedRandom(spec.seed??1);
  const size=spec.size||'standard',geometry=v160WorldGeometry({world:{matchConfig:{version:1,fieldSize:size,fieldPlayers:5}}}),s={x:geometry.width/(v55Field.right-v55Field.left),y:geometry.length/(v55Field.bottom-v55Field.top)},L=geometry.length;
  // goal: metres to the goal team t attacks; lateral: metres from the centre line.
  const place=(t,goal,lateral)=>N.at(t,L-goal,lateral,s);
  const people=[N.person('k0',0,...Object.values(N.at(0,1.5,0,s)),'gk',{n:1,gk:spec.gk0??12},true),N.person('k1',1,...Object.values(N.at(1,1.5,0,s)),'gk',{n:1,gk:spec.gk1??12},true)];
  let n=2;
  for(const [list,t]of [[spec.attack||[],0],[spec.defend||[],1]])for(const q of list){const at=t===0?place(0,q.goal,q.lateral):N.at(1,q.goal,-q.lateral,s);const p=N.person(q.id,t,at.x,at.y,q.line||'mid',{n:n++,dec:20,...(q.skills||{})});if(q.role)p.tacticalRole=q.role;people.push(p);}
  // defend[].goal is the defender's distance to its own goal (= the attackers' goal).
  N.install({people,size,ball:{x:people[2].x,y:people[2].y},lastTouch:0,markers:{keeperHoldRevision:182,setPieceRevision:182,looseBallRevision:182,pursuitRevision:182,motionRevision:182}});
  match.penaltyRevision=182;match.si=spec.si===false?undefined:v183CreateSi(spec.si||{packages:{options:true}});if(match.si===undefined)delete match.si;
  const carrier=match.people.find(p=>p.pid===spec.attack[0].id);match.owner=carrier;match.ball={x:carrier.x,y:carrier.y};match.next=match.elapsed;match.lastTouch=0;
  for(const q of [...(spec.attack||[]),...(spec.defend||[])]){const p=match.people.find(x=>x.pid===q.id),body=v157Body(p);body.heading=q.heading??(p.t===0?Math.PI:0);if(q.speed){body.vx=Math.sin(body.heading)*q.speed;body.vy=Math.cos(body.heading)*q.speed;}}
  return match;
 },
 decide(){const m=match,p=m.owner,allies=m.people.filter(q=>q.t===p.t&&q!==p&&!q.keeper),rivals=m.people.filter(q=>q.t!==p.t);const before=p.stats.shots,draws=Native182.rng().draws;v157Decide(m,p,allies,rivals);
  const last=v183TraceEntries(m).filter(e=>e.type==='options').at(-1)||null,meta=m.flight&&v102Flights.get(m.flight);
  return {kind:last?.kind??null,ref:last?.ref??null,u:last?.u??null,top:last?.top??null,drawn:last?.drawn??null,shot:p.stats.shots>before,flight:meta?.kind||null,turn:m.attackFlow.pendingTurn?{receiverId:m.attackFlow.pendingTurn.receiverId,kind:m.attackFlow.pendingTurn.kind}:null,carry:m.attackFlow.carry?{...m.attackFlow.carry}:null,decision:m.attackFlow.decision?{...m.attackFlow.decision}:null,draws:Native182.rng().draws-draws};},
 options(){const m=match,p=m.owner,allies=m.people.filter(q=>q.t===p.t&&q!==p&&!q.keeper),rivals=m.people.filter(q=>q.t!==p.t),P=v183OptParams(m);
  return v183OptCached(()=>v183OptOptions(m,p,allies,rivals,P)).list.map(o=>({kind:o.kind,ref:o.ref??null,u:o.u,gain:o.gain,loss:o.loss,arrival:o.arrival??null,xg:o.xg??null}));}
};`,'si1-scenes');
const scene=spec=>{h.call('SI1.build',spec);return h;};
const decide=()=>copy(h.call('SI1.decide'));
const options=()=>copy(h.call('SI1.options'));

// ----- old path -----
check('options off: constructor matches digest-equal to rules 182 (marker field aside)',()=>{
 const scenes=copy(h.call('Native183.constructedScenes')).slice(0,quick?4:12);
 for(const s of scenes){
  // Other packages may be on by default (SI-0 clock): switch all off explicitly.
  const legacy=h.call('Native183.constructedDigest',s,{si:false}),off=h.call('Native183.constructedDigest',s,{si:{packages:allOff},withoutSi:true});
  assert.equal(off,legacy,s.id+': all packages off');
 }
});
check('options off: v183PassEstimate is the SI-F stub; v157Decide/v159Decide/v157ContinueTurn pass through',()=>{
 h.call('Native183.constructed',{si:{packages:{options:false}}});h.call('Native183.run',200);
 const r=copy(ev(`(()=>{const m=match,p=m.people.find(q=>!q.keeper&&q.t===0),q=m.people.find(x=>!x.keeper&&x.t===0&&x!==p),d0=Native182.rng().draws,a=v183PassEstimate(m,p,q,{x:q.x,y:q.y}),b=v183OptPassStub(m,p,q,{x:q.x,y:q.y});
  return {same:JSON.stringify(a)===JSON.stringify(b),draws:Native182.rng().draws-d0,base:[v157Decide===v183OptBaseDecide,v159Decide===v183OptBaseFlow,v157ContinueTurn===v183OptBaseTurn]};})()`));
 assert(r.same);assert.equal(r.draws,0);assert.deepEqual(r.base,[false,false,false],'wrappers installed');
 // Marked match with options off: the wrappers call the previous functions with identical results.
 const scenes=copy(h.call('Native183.constructedScenes')).slice(0,2);
 for(const s of scenes){
  const wrapped=h.call('Native183.constructedDigest',s,{si:{packages:{options:false,clock:true},clockRate:.42}});
  ev('(()=>{globalThis.__w=[v157Decide,v159Decide,v157ContinueTurn,v183PassEstimate];v157Decide=v183OptBaseDecide;v159Decide=v183OptBaseFlow;v157ContinueTurn=v183OptBaseTurn;v183PassEstimate=v183OptPassStub;})()');
  try{assert.equal(h.call('Native183.constructedDigest',s,{si:{packages:{options:false,clock:true},clockRate:.42}}),wrapped,s.id);}finally{ev('[v157Decide,v159Decide,v157ContinueTurn,v183PassEstimate]=__w');}
 }
});

// ----- new path: scenes -----
// Team 0 attacks the top goal. goal = metres to that goal, lateral = metres from the centre.
const keeperLine=[{id:'d1',goal:9,lateral:-6,line:'def',skills:{tak:12,pos:12}},{id:'d2',goal:9,lateral:6,line:'def',skills:{tak:12,pos:12}}];
check('long shot: a good shooter shoots from 24 m, a weak shooter (window windowBase+windowFin*fin) does not',()=>{
 const spec=fin=>({seed:3,attack:[{id:'c',goal:24,lateral:0,line:'att',role:'striker',skills:{fin,tec:14}},{id:'w',goal:30,lateral:-14,line:'mid',skills:{pas:10}}],defend:[{id:'d1',goal:19,lateral:-2.6,line:'def'},{id:'d2',goal:19,lateral:2.6,line:'def'},{id:'d3',goal:27,lateral:-11,line:'mid'},{id:'d4',goal:10,lateral:5,line:'def'}]});
 scene(spec(18));const strong=options().find(o=>o.kind==='shot'),strongChoice=decide();
 scene(spec(8));const weak=options().find(o=>o.kind==='shot'),weakChoice=decide();
 assert(strong&&strong.xg>0,'shot option for fin 18 at 24 m');assert.equal(weak,undefined,'no shot option for fin 8 at 24 m (window 20.4 m)');
 assert.equal(strongChoice.kind,'shot');assert.equal(strongChoice.shot,true);assert.notEqual(weakChoice.kind,'shot');
});
check('shot value rises with finishing and falls with distance; a blocker lowers it (SI-3 estimate and SI-F stub bridge)',()=>{
 for(const finish of [true,false]){
  const xg=(fin,goal,block)=>{scene({seed:4,si:{packages:{options:true,finish}},attack:[{id:'c',goal,lateral:0,line:'att',skills:{fin,tec:12}}],defend:block?[{id:'b',goal:goal-1.5,lateral:.3,line:'def'}]:[]});return options().find(o=>o.kind==='shot')?.xg??0;};
  assert(xg(16,18)>xg(10,18),'finishing');assert(xg(14,16)>xg(14,22),'distance');assert(xg(14,22)>0);
  const free=xg(15,23),blocked=xg(15,23,true);
  // Stub bridge: a blocker before the read point (23*22/window m from goal) halves the value; SI-3: its block chance.
  if(finish)assert(blocked<free,`blocker lowers xg (${blocked}/${free})`);else assert(blocked>0&&Math.abs(blocked/free-.5)<1e-9,`one blocker halves (${blocked}/${free})`);
 }
});
check('pass estimate: arrival from pas and the lane only; free lane beats closed lane; riskWeight never enters arrival',()=>{
 const est=(pas,role,blocked)=>{scene({seed:5,attack:[{id:'c',goal:40,lateral:0,role,skills:{pas}},{id:'r',goal:26,lateral:4,line:'att'}],defend:blocked?[{id:'x',goal:33,lateral:2,line:'mid',skills:{pos:14,spd:14}}]:[]});
  return copy(ev(`(()=>{const m=match,p=m.owner,q=m.people.find(x=>x.pid==='r');return v183PassEstimate(m,p,q,{x:q.x,y:q.y});})()`));};
 const free=est(12,'playmaker',false),closed=est(12,'playmaker',true),weak=est(6,'playmaker',true),strong=est(18,'playmaker',true),stopper=est(12,'stopper',true);
 assert(free.arrival>closed.arrival,'free lane arrives more often');assert(strong.arrival>weak.arrival,'pas raises arrival');
 assert.equal(stopper.arrival,closed.arrival,'role (risk weight) does not change arrival');assert.equal(stopper.value,closed.value,'estimate value is objective');
 assert(free.arrival<=1&&weak.arrival>=0&&Number.isFinite(free.receiver)&&Number.isFinite(free.loss));
});
check('risk: same skills, playmaker vs stopper; utility differs only in the loss term',()=>{
 const run=(role,dec)=>{scene({seed:6,attack:[{id:'c',goal:38,lateral:0,role,skills:{pas:13,dec}},{id:'r',goal:22,lateral:3,line:'att',role:'poacher'},{id:'s',goal:44,lateral:-8,line:'def'}],defend:[{id:'x',goal:30,lateral:1.6,line:'mid',skills:{pos:12,spd:12}},{id:'y',goal:16,lateral:6,line:'def'}]});return options();};
 const play=run('playmaker',20),stop=run('stopper',20),pp=play.find(o=>o.kind==='pass'&&o.ref==='r'),sp=stop.find(o=>o.kind==='pass'&&o.ref==='r');
 assert.equal(pp.gain,sp.gain,'gain identical');assert.equal(pp.arrival,sp.arrival,'arrival identical');assert(pp.loss>0);
 assert(pp.u>sp.u,'the playmaker values the risky pass higher');
 const wPlay=copy(ev("v183OptWeights({tacticalRole:'playmaker',dec:20},v183OptParams(match))")),wStop=copy(ev("v183OptWeights({tacticalRole:'stopper',dec:20},v183OptParams(match))"));
 assert(Math.abs((pp.gain-pp.u)*wPlay.riskWeight-(sp.gain-sp.u)*wStop.riskWeight)<1e-12,'loss/risk is the only difference');
 // Same role, other mental value: dec raises the risk weight slightly (SI-F formula).
 const poacher=run('poacher',20).find(o=>o.kind==='pass'&&o.ref==='r'),low=run('poacher',4).find(o=>o.kind==='pass'&&o.ref==='r');assert(low.u<poacher.u,'dec raises the risk weight');assert.equal(low.gain,poacher.gain);
 // Effective span clamps the raw SI-F weights to 0.85-1.15 (relative to the neutral player).
 const span=copy(ev("['poacher','stopper','playmaker','winger'].map(r=>v183OptWeights({tacticalRole:r,calm:20,dec:20},v183OptParams(match)))"));
 for(const w of span)for(const v of Object.values(w))assert(v>=.85-1e-12&&v<=1.15+1e-12);
});
check('square pass: a free team-mate in a clearly better position is preferred to a covered shot',()=>{
 scene({seed:7,attack:[{id:'c',goal:16,lateral:-10,line:'att',skills:{fin:10}},{id:'r',goal:9.5,lateral:1,line:'att',skills:{fin:14,tec:14}}],defend:[{id:'b',goal:14.6,lateral:-9.2,line:'def'},{id:'d',goal:8,lateral:7,line:'def'}]});
 const r=decide();assert.equal(r.kind,'pass');assert.equal(r.ref,'r');
});
check('won rebound near goal with the keeper beaten: the open goal is taken at once',()=>{
 scene({seed:8,attack:[{id:'c',goal:7,lateral:3,line:'att',skills:{fin:12}}],defend:[]});
 ev("(()=>{const k=match.people.find(p=>p.pid==='k1');k.x=.5+6/v150Scale().x;})()");
 const r=decide();assert.equal(r.shot,true);
});
check('turn: a pass behind the body queues a turn; release at turnRelease, sooner than the legacy 0.30 rad',()=>{
 // Each tick decides (m.next forced) so only the release thresholds differ; the
 // release angle is read when the pass executes.
 const run=legacy=>{
  scene({seed:9,attack:[{id:'c',goal:34,lateral:0,heading:0,skills:{tec:12}},{id:'r',goal:30,lateral:-14,line:'mid'}],defend:keeperLine});
  return copy(ev(`(()=>{const m=match,p=m.owner,q=m.people.find(x=>x.pid==='r'),turn=v157ContinueTurn,pass=v55GroundPass;let release=null;
   if(${legacy})v157ContinueTurn=v183OptBaseTurn;
   v55GroundPass=function(a,b){if(m.attackFlow.releaseGuard===a.pid&&!release)release={angle:Math.abs(v157Angle(v157Body(a).heading,v183OptHeading(a,b))),at:v183Seconds(m)};return pass.apply(this,arguments);};
   try{const t0=v183Seconds(m);pass(p,q);const queued=Boolean(m.attackFlow.pendingTurn);for(let n=0;n<120&&m.attackFlow.pendingTurn;n++){m.next=m.elapsed;Native183.advance();}
    return {queued,release,seconds:release?release.at-t0:null};}finally{v157ContinueTurn=turn;v55GroundPass=pass;}})()`));
 };
 const si1=run(false),legacy=run(true);
 assert(si1.queued&&legacy.queued,'turn queued');assert(si1.release&&legacy.release,'pass released');
 assert(si1.release.angle<=.55+1e-9,`released at ${si1.release.angle} rad`);assert(legacy.release.angle<=.30+1e-9);
 assert(si1.seconds<legacy.seconds,`release after ${si1.seconds} s vs legacy ${legacy.seconds} s`);
});
check('shot from the turn: a pending pass turn is replaced by a shot once the shot is worth more',()=>{
 scene({seed:10,attack:[{id:'c',goal:17,lateral:-2,heading:-Math.PI/2,line:'att',role:'poacher',skills:{fin:17,tec:15}},{id:'r',goal:20,lateral:-14,line:'mid'}],defend:[{id:'d1',goal:8,lateral:-8,line:'def'}]});
 // Queue the turn to the wide team-mate, as an earlier decision would have.
 const r=copy(ev(`(()=>{const m=match,p=m.owner,q=m.people.find(x=>x.pid==='r');v183OptRecord(m,p,{kind:'pass',ref:'r',target:{x:q.x,y:q.y},u:0},v183OptParams(m));m.attackFlow.decision.checkAt=v183Seconds(m);
  const body=v157Body(p);body.heading=v183OptHeading(p,q)+Math.PI*.9;v157QueueTurn(m,p,q,'ground');const queued=Boolean(m.attackFlow.pendingTurn);
  body.heading=v183OptHeading(p,{x:.5,y:v55Field.top});const shots=p.stats.shots;v157Decide(m,p,m.people.filter(x=>x.t===0&&x!==p&&!x.keeper),m.people.filter(x=>x.t===1));
  return {queued,shot:p.stats.shots>shots,turn:Boolean(m.attackFlow.pendingTurn),fromTurn:v183TraceEntries(m).filter(e=>e.type==='options').at(-1)?.fromTurn===true,decision:m.attackFlow.decision.kind};})()`));
 assert(r.queued);assert(r.shot,'shot from the turn');assert.equal(r.turn,false);assert(r.fromTurn);assert.equal(r.decision,'shot');
});
check('commitment: near-equal carry directions do not flip between successive decisions',()=>{
 scene({seed:11,attack:[{id:'c',goal:45,lateral:0,skills:{dec:20}}],defend:[]});
 const seq=[];for(let i=0;i<6;i++){const r=decide();seq.push(r.kind+':'+r.ref);ev('(()=>{match.next=match.elapsed;for(let i=0;i<5;i++)Native183.advance();match.next=match.elapsed;})()');}
 const changes=seq.filter((x,i)=>i&&x!==seq[i-1]).length;assert(changes<=1,seq.join(' '));
});
check('noise: dec 20 decides without a draw where dec 1 draws (one named draw at most)',()=>{
 const draws=dec=>{scene({seed:12,attack:[{id:'c',goal:40,lateral:0,skills:{dec}},{id:'a',goal:40,lateral:-10,line:'mid'},{id:'b',goal:40,lateral:10,line:'mid'}],defend:[{id:'x',goal:34,lateral:0,line:'mid'},...keeperLine]});return decide();};
 const calm=draws(20),noisy=draws(1);
 // Carry and hold do not draw; a pass draws only in its own execution after the decision.
 assert.equal(calm.drawn,false);assert.equal(calm.kind==='carry'||calm.kind==='hold'?calm.draws:0,0);
 assert.equal(noisy.drawn,true);if(noisy.kind==='carry'||noisy.kind==='hold')assert.equal(noisy.draws,1,'one named draw options.choice');
});
check('team tactics: focus wide raises wide passes, direct raises forward passes (weights only)',()=>{
 const val=(focus,direct)=>{scene({seed:13,attack:[{id:'c',goal:40,lateral:0},{id:'w',goal:32,lateral:-16,line:'mid'},{id:'f',goal:24,lateral:1,line:'att'}],defend:keeperLine});ev(`match.teamFocus=['${focus}','Variabel'];match.teamDirect=[${direct},0];`);const o=options();return {wide:o.find(x=>x.kind==='pass'&&x.ref==='w').gain,fwd:o.find(x=>x.kind==='pass'&&x.ref==='f').gain};};
 const base=val('Variabel',0),wide=val('Außen',0),centre=val('Mitte',0),direct=val('Variabel',1);
 assert(wide.wide>base.wide&&centre.wide<base.wide);assert(direct.fwd>base.fwd);
});
const close=(a,b,msg='')=>assert(Math.abs(a-b)<1e-9,`${msg} ${a} vs ${b}`);
check('stub detection by stub:true; a real estimate with speed 0 or null is not bridged',()=>{
 scene({seed:15,si:{packages:{options:true,finish:false}},attack:[{id:'c',goal:20,lateral:0,line:'att',skills:{fin:14}}],defend:[]});
 const r=copy(ev(`(()=>{const m=match,p=m.owner,P=v183OptParams(m),base=v183ShotEstimate;try{
  const stub=v183OptShot(m,p,P,p),real=[];
  for(const speed of [0,null]){v183ShotEstimate=()=>({xg:.123,aim:{x:.5,y:v55Field.top},window:true,speed});real.push(v183OptShot(m,p,P,p));}
  return {stub,real};}finally{v183ShotEstimate=base;}})()`));
 assert.equal(r.stub.stub,true,'SI-F stub (stub:true) is bridged');
 for(const o of r.real){assert.equal(o.stub,false);assert.equal(o.xg,.123,'real estimate used as it is');}
});
check('cross header: a real cross estimate (no stub flag) is used unscaled; only the SI-F cross stub scales by stubScale*crossConv',()=>{
 // Header values above the receiver's holder value, so the cross gain follows the header.
 const gain=(finish,est)=>{scene({seed:18,si:{packages:{options:true,finish}},attack:[{id:'c',goal:20,lateral:-13,line:'mid'},{id:'b',goal:9,lateral:1,line:'att',skills:{air:15}}],defend:[{id:'d1',goal:6,lateral:6,line:'def'},{id:'d2',goal:7,lateral:-5,line:'def'}]});
  ev(`globalThis.__ce=v183CrossEstimate;v183CrossEstimate=()=>(${JSON.stringify(est)});`);
  try{const o=options().find(x=>x.kind==='cross'&&x.ref==='b');assert(o,'cross option exists');return o.gain;}finally{ev('v183CrossEstimate=__ce');}};
 const real=headerXg=>({arrival:.5,headerXg,eligible:true});
 for(const finish of [true,false])close(gain(finish,real(.9))/gain(finish,real(.6)),.9/.6,`real header unscaled (finish ${finish})`);
 close(gain(false,real(.9)),gain(true,real(.9)),'the shot stub (finish off) does not scale a real header');
 const P=copy(ev('v183OptParams(match)')),stub=gain(true,{...real(.9),stub:true});
 close(stub,gain(true,real(.9*P.stubScale*P.crossConv)),'stub header = headerXg*stubScale*crossConv');assert(stub<gain(true,real(.9)));
});
check('counter runs: an SI-2 intent with pattern counter gets counterOffer (default = offer, neutral), other runs offer',()=>{
 const gain=(pattern,params)=>{scene({seed:21,si:{packages:{options:true},...(params?{params:{options:params}}:{})},attack:[{id:'c',goal:40,lateral:0},{id:'r',goal:20,lateral:4,line:'att'}],defend:keeperLine});
  ev(`(()=>{const r=match.people.find(p=>p.pid==='r'),now=v152Seconds(match);match.attackFlow.intents={r:{x:r.x,y:r.y-.02,type:'depth',team:0,at:now,until:now+5,cat:'depth',pattern:${pattern?`'${pattern}'`:'null'}}};})()`);
  return options().find(o=>o.kind==='pass'&&o.ref==='r').gain;};
 const P=copy(ev('v183OptParams(match)'));assert.equal(P.counterOffer,P.offer,'default counterOffer = offer');
 assert.equal(gain('counter'),gain(null),'default: a counter run is valued like any run');
 close(gain('counter',{counterOffer:.6})/gain(null,{counterOffer:.6}),1.6/(1+P.offer),'counterOffer applies to counter runs only');
});
check('flight seconds use the match rate: clock package on (rate 0.42) and off (MATCH_SPEED); a real pass takes them',()=>{
 for(const [si,rate]of [[{packages:{options:true,clock:true},clockRate:.42},.42],[{packages:{options:true,clock:false}},null]]){
  scene({seed:16,si,attack:[{id:'c',goal:40,lateral:0},{id:'r',goal:28,lateral:6,line:'att'}],defend:keeperLine});
  const r=copy(ev(`(()=>{const m=match,p=m.owner,q=m.people.find(x=>x.pid==='r'),target=v157PassLead(m,p,q,m.ball),e=v183PassEstimate(m,p,q,target),duration=clamp(distance(m.ball,target)*1.5,.32,.9);
   const out={seconds:e.seconds,units:v115FlightDuration(m.ball,target,duration,'pass'),rate:v183Rate(m),speed:MATCH_SPEED};
   v157Body(p).heading=v183OptHeading(p,target);v55GroundPass(p,q);let ticks=0;while(m.flight&&ticks<200){Native183.advance();ticks++;}out.real=ticks*.05;return out;})()`));
  const expected=rate??r.speed;assert.equal(r.rate,expected);close(r.seconds,r.units/expected,'seconds');
  assert(Math.abs(r.real-r.seconds)<=.15,`real flight ${r.real} s vs estimate ${r.seconds} s`);
 }
});
check('player instructions: "Abschluss suchen" raises the shot gain, "Außenbahn & Flanken" the cross gain',()=>{
 const shot=list=>{scene({seed:17,attack:[{id:'c',goal:18,lateral:0,line:'att',skills:{fin:14}}],defend:[]});ev(`match.owner.instructions=${JSON.stringify(list)}`);return options().find(o=>o.kind==='shot').gain;};
 close(shot(['shoot'])/shot([]),copy(ev("v183OptParams(match).shootInstruction")),'shoot');
 const cross=list=>{scene({seed:18,attack:[{id:'c',goal:20,lateral:-13,line:'mid'},{id:'b',goal:9,lateral:1,line:'att',skills:{air:15}}],defend:[{id:'d1',goal:6,lateral:6,line:'def'},{id:'d2',goal:7,lateral:-5,line:'def'}]});ev(`match.owner.instructions=${JSON.stringify(list)}`);return options().find(o=>o.kind==='cross'&&o.ref==='b');};
 const plain=cross([]),wing=cross(['wing']);assert(plain&&wing,'cross option exists');close(wing.gain/plain.gain,copy(ev("v183OptParams(match).wingInstruction")),'wing');
 // The shot from a turn uses the same shot gain.
 assert.equal(copy(ev("v183OptShootGain({instructions:['shoot']},v183OptParams(match),{shootWeight:1},.2)")),.2*copy(ev("v183OptParams(match).shootInstruction")));
});
check('dribbler role: the take-on of v154TryDribble is offered as beat-left/right; other roles do not get it',()=>{
 const run=role=>{scene({seed:19,attack:[{id:'c',goal:30,lateral:0,role,skills:{tec:16,spd:14}}],defend:[{id:'x',goal:26,lateral:.5,line:'def',skills:{tak:10}},...keeperLine]});return options().filter(o=>o.kind==='carry'&&String(o.ref).startsWith('beat'));};
 const beat=run('dribbler');assert(beat.length>=1,'take-on offered');assert.equal(run('striker').length,0);
});
check('carry endpoint and pass target are valued alike (same space discount, closing opponents)',()=>{
 scene({seed:20,attack:[{id:'c',goal:30,lateral:0},{id:'r',goal:30,lateral:8}],defend:[{id:'x',goal:24,lateral:1.5,line:'def'},...keeperLine]});
 const r=copy(ev(`(()=>{const m=match,P=v183OptParams(m),c=m.owner,q=m.people.find(x=>x.pid==='r'),rivals=m.people.filter(x=>x.t===1),s=v150Scale(),point={x:.5,y:c.y-6/s.y},unmarked=rivals.filter(x=>x.pid!=='x');
  return {carrier:v183OptHolder(m,c,P,point,rivals,P.carryShot,1),receiver:v183OptHolder(m,q,P,point,rivals,P.carryShot,1),marked:v183OptHolder(m,c,P,point,rivals,P.carryShot,.5),free:v183OptHolder(m,c,P,point,unmarked,P.carryShot,.5),later:v183OptHolder(m,c,P,point,rivals,P.carryShot,1.5)};})()`));
 close(r.carrier,r.receiver,'same holder value');assert(r.marked<r.free,'a defender near the endpoint lowers its value');assert(r.later<=r.marked,'opponents close in over time');
});
check('a chosen high ball that is no longer available falls back to holding and is marked in the trace',()=>{
 scene({seed:21,attack:[{id:'c',goal:40,lateral:0},{id:'r',goal:20,lateral:4,line:'att'}],defend:keeperLine});
 const r=copy(ev(`(()=>{const m=match,p=m.owner,q=m.people.find(x=>x.pid==='r'),base=v183OptChoose;v183OptChoose=function(mm,pp,list){return {choice:{kind:'high',ref:'r',q,target:{x:q.x,y:q.y},u:.01,gain:.01,loss:0},drawn:false};};
  try{v157Decide(m,p,m.people.filter(x=>x.t===0&&x!==p&&!x.keeper),m.people.filter(x=>x.t===1));}finally{v183OptChoose=base;}
  const e=v183TraceEntries(m).filter(e=>e.type==='options').at(-1);return {fallback:e.fallback,executed:e.executed,kind:e.kind,decision:m.attackFlow.decision.kind,flight:Boolean(m.flight),carry:m.attackFlow.carry&&Math.abs(m.attackFlow.carry.target.x-p.x)<1e-9};})()`));
 assert.deepEqual(r,{fallback:'high',executed:'hold',kind:'high',decision:'hold',flight:false,carry:true});
});
check('trace entries are plain data; the decision is plain data in attackFlow',()=>{
 scene({seed:14,attack:[{id:'c',goal:30,lateral:0},{id:'r',goal:22,lateral:5,line:'att'}],defend:[{id:'x',goal:25,lateral:-3}]});decide();
 const t=copy(ev("JSON.stringify(v183TraceEntries(match).filter(e=>e.type==='options').at(-1))")),d=copy(ev('JSON.stringify(match.attackFlow.decision)'));
 assert.deepEqual(JSON.parse(t).type,'options');const decision=JSON.parse(d);assert.equal(decision.playerId,'c');for(const k of ['at','until','checkAt','value'])assert(Number.isFinite(decision[k]),k);
});

// ----- full matches -----
check('full constructor matches with options on (both pitch sizes, clock 0.42 and default) finish without errors',()=>{
 const list=[['GER-2','standard',.42],['ENG-4','large',.42],['ESP-1','standard',null],['ITA-3','large',null]].slice(0,quick?2:4);
 h.run('finishMatch=function(){match.finished=true;running=false;match.flight=null;};');
 for(const [club,size,rate]of list){
  h.run('running=true');h.call('Native183.constructed',{club,seed:'si1-full',size,roles:true,si:{packages:rate?{clock:true,options:true}:{options:true},...(rate?{clockRate:rate}:{})}});
  const r=copy(ev(`(()=>{let n=0;for(;n<20000&&!match.finished;n++)Native183.advance();const st=k=>match.people.concat(match.exitedPeople||[]).reduce((s,p)=>s+(p.stats[k]||0),0);return {n,finished:match.finished,shots:st('shots'),passes:st('passes'),decision:Boolean(match.attackFlow.decision)};})()`));
  assert(r.finished,`${club} ${size} finished`);assert(r.shots>0&&r.passes>10&&r.decision,JSON.stringify(r));
 }
});

// ----- restore -----
check('restore: attackFlow.decision and a pending turn survive JSON checkpoints and continue',()=>{
 h.run('running=true');h.call('Native183.constructed',{club:'GER-2',seed:'si1-restore',size:'standard',roles:true,si:{packages:{clock:true,options:true},clockRate:.42}});
 let carry=null,turn=null;
 for(let i=0;i<4000&&!(carry&&turn);i++){
  h.call('Native183.advance');
  const state=copy(ev(`(()=>{const m=match,d=m.attackFlow.decision;if(!m.owner||m.flight||m.slide||!d||d.playerId!==m.owner.pid)return null;return {kind:d.kind,turn:Boolean(m.attackFlow.pendingTurn)};})()`));
  if(!state)continue;
  const want=state.turn?!turn:state.kind==='carry'&&!carry;if(!want)continue;
  const before=copy(ev('JSON.stringify({decision:match.attackFlow.decision,turn:match.attackFlow.pendingTurn||null,carry:match.attackFlow.carry||null,owner:match.owner.pid,next:match.next,elapsed:match.elapsed,si:match.si})'));
  assert(h.call('Native183.checkpoint'),'checkpoint');
  const after=copy(ev('JSON.stringify({decision:match.attackFlow.decision,turn:match.attackFlow.pendingTurn||null,carry:match.attackFlow.carry||null,owner:match.owner.pid,next:match.next,elapsed:match.elapsed,si:match.si})'));
  assert.deepEqual(JSON.parse(after),JSON.parse(before),'decision state complete after restore');
  assert.equal(ev("v183Active(match,'options')"),true);
  if(state.turn){turn=JSON.parse(before);const r=copy(ev('(()=>{let n=0;const m=match;while(n<200&&m.attackFlow.pendingTurn){Native183.advance();n++;}return {n,resolved:!m.attackFlow.pendingTurn};})()'));assert(r.resolved,'turn resolved after restore');}
  else carry=JSON.parse(before);
 }
 assert(carry,'a carry decision was checkpointed');assert(turn,'a pending turn was checkpointed');
 h.call('Native183.run',1500);
});

// ----- timing -----
check('timing: one evaluation <= 0.3 ms in Node (median and p90 over real match states; mean reported)',()=>{
 const r=cp.spawnSync(process.execPath,[__filename],{cwd:path.resolve(__dirname,'..'),env:{...process.env,D6_SI1_TIMING:quick?'200':'600'},encoding:'utf8',maxBuffer:1<<24});
 if(r.status!==0)throw Error(r.stderr||r.stdout);
 const s=JSON.parse(r.stdout).sort((a,b)=>a-b),mean=s.reduce((a,b)=>a+b,0)/s.length,median=s[s.length>>1],p90=s[Math.floor(s.length*.9)];
 console.log(`     n=${s.length} median=${median.toFixed(4)} ms p90=${p90.toFixed(4)} ms mean=${mean.toFixed(4)} ms`);
 // Per state the fastest block counts, so preemption by other processes does
 // not enter; the mean is only reported (single slow states pull it up).
 assert(median<=.3,`median ${median}`);assert(p90<=.3,`p90 ${p90}`);
});

console.log(failures?`${failures} check(s) failed`:'all checks passed');
if(failures)process.exitCode=1;
