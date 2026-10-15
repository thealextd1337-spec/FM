'use strict';
// U-1 (player intelligence 183, B02): the native body path of the SI-2 tempi as identical input for the Unity
// presentation measurement (NaturalMotionDiagnostics, case group "native-body"). Runs the actual dist controllers in
// the native VM harness (native183-scenes.cjs, constructor match with the offball and clock packages, like the B02
// check of test-si-offball-v183.cjs) and records the body of the fastest field player every native step (0.05 s):
// rest, start, run, a change of direction (0, +-45, +-90, +-135, 180 degrees relative to the run) and the stop at a
// target placed at its braking distance (no overshoot), then rest. Three paces: the free carrier (offball carrierPace
// 1.50), the carrier with an opponent kept 2 m beside it (carrierClosePace 1.28 within carrierCloseRadius 2.5 m) and an
// own run (depth intent, runPace 1.58). Large pitch (SI-5, package field on): the same three paces as SI-5 scales them
// (carrier x1.20 up to carrierSpeedMax 8.5 m/s, close carrier 1.41, runs x1.15 up to runSpeedMax 9.5 m/s), for the same
// player (spd/tec 14) and for spd/tec 18 (the ceilings).
// Samples per run as parallel arrays (JsonUtility): t (s), x/z (m from the start; z along the initial heading),
// hx/hz (body heading as a unit vector in the same axes) and v (body speed, m/s).
// Observation only: the match is restored afterwards and nothing is written into dist.
//   node work/capture-native-body-u1-v183.cjs [--out prototypes/match-engine-unity/fixtures/native183-body]
// The default output is the versioned fixture that D6Cli.Tests reads (NaturalMotionDiagnostics.BodyFixture); regenerate it
// only together with a deliberate change of the native body or of the SI-2 tempi.
const fs=require('node:fs'),path=require('node:path'),{create}=require('./native183-scenes.cjs');
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback;};
const out=path.resolve(arg('--out','prototypes/match-engine-unity/fixtures/native183-body'));
const h=create({view:false}),ev=text=>h.evaluate(text),copy=value=>h.copy(value);
const kinds=[{name:'carrier150',kind:'carrier',pace:1.5},{name:'carrier128',kind:'close',pace:null},{name:'run158',kind:'runner',pace:null},
 {name:'large-carrier',kind:'carrier',size:'large'},{name:'large-close',kind:'close',size:'large'},{name:'large-run',kind:'runner',size:'large'},
 {name:'large-carrier-18',kind:'carrier',size:'large',ability:18},{name:'large-run-18',kind:'runner',size:'large',ability:18}];
const deltas=[0,45,-45,90,-90,135,-135,180];
const result={source:'v157Move (dist/world-offensive-quality-v157.js) through native183-scenes.cjs, dt 0.05 s',kinds:[]};
for(const k of kinds){
 h.call('Native183.constructed',{club:'GER-2',seed:'si2b02',size:k.size||'standard',roles:true,si:{packages:{offball:true,clock:true,...(k.size==='large'?{field:true}:{})},clockRate:.42,...(k.pace?{params:{offball:{carrierPace:k.pace}}}:{})}});
 let live=false;for(let i=0;i<800&&!live;i++){h.call('Native183.advance');live=ev('Boolean(match.owner&&!match.owner.keeper&&!v121PositioningPaused(match)&&!match.flight)');}
 if(!live)throw new Error('no live carrier');
 const r=copy(ev(`(()=>{const m=match,s=v150Scale(m),dt=.05,kind=${JSON.stringify(k.kind)},ability=${k.ability||0},p=m.people.filter(q=>!q.keeper&&q.t===0).sort((a,b)=>b.spd-a.spd)[0],mate=m.people.find(q=>!q.keeper&&q.t===0&&q!==p),rival=m.people.find(q=>!q.keeper&&q.t===1);
  const saved={owner:m.owner,ball:{...m.ball},flight:m.flight,intents:JSON.parse(JSON.stringify(m.attackFlow.intents)),pos:m.people.map(q=>[q.x,q.y,q.tx,q.ty])};
  const place=()=>{p.x=.5;p.y=.5;p.tx=p.x;p.ty=p.y;const b=v157Body(p);b.vx=b.vy=0;b.heading=0;for(const q of m.people)if(q!==p){q.x=q.t===0?.2:.8;q.y=q.t===0?.85:.15;}};
  const mode=()=>{m.flight=null;m.attackFlow.intents={};if(kind!=='runner'){m.owner=p;m.ball={x:p.x,y:p.y};}else{m.owner=mate;m.ball={x:mate.x,y:mate.y};m.attackFlow.intents[p.pid]={x:p.x,y:p.y,type:'depth',team:0,at:0,until:1e9};}};
  const body=()=>v157Body(p),speed=()=>Math.hypot(body().vx,body().vy);
  const mass=()=>body().massKg/74,revised=v162Active(m)&&!p.keeper&&v119PaceActive(m),brake=()=>10.5*(revised?1.25:v162Active(m)&&!p.keeper?1.18:1)/mass();
  const aim=(angle,metres)=>{p.tx=p.x+Math.sin(angle)*metres/s.x;p.ty=p.y+Math.cos(angle)*metres/s.y;};
  const skills={spd:p.spd,tec:p.tec};if(ability){p.spd=ability;p.tec=ability;}
  const runs=[];
  for(const delta of ${JSON.stringify(deltas)}){
   place();mode();const x0=p.x,y0=p.y,samples=[];let t=0;
   const record=()=>{const b=body();samples.push([+t.toFixed(3),+((p.x-x0)*s.x).toFixed(5),+((p.y-y0)*s.y).toFixed(5),+Math.sin(b.heading).toFixed(6),+Math.cos(b.heading).toFixed(6),+speed().toFixed(4)]);};
   const step=()=>{if(kind!=='runner')m.ball={x:p.x,y:p.y};if(kind==='close'){rival.x=p.x;rival.y=p.y+2/s.y;}else m.attackFlow.intents[p.pid]={x:p.tx,y:p.ty,type:'depth',team:0,at:0,until:1e9};v157Move(m,p,dt);t+=dt;record();};
   record();
   for(let i=0;i<12;i++){p.tx=p.x;p.ty=p.y;step();}
   const run=delta===0?52:32;for(let i=0;i<run;i++){aim(0,40);step();}
   if(delta!==0){const a=delta*Math.PI/180;for(let i=0;i<28;i++){aim(a,40);step();}}
   // Stop: the target at the braking distance along the current travel (the native arrival rule brakes onto it).
   const b=body(),v=speed(),ux=v>0?b.vx/v:0,uy=v>0?b.vy/v:0,stop=v*v/(2*brake())+.05;p.tx=p.x+ux*stop/s.x;p.ty=p.y+uy*stop/s.y;
   let still=0;for(let i=0;i<60&&still<16;i++){step();still=speed()<.05?still+1:0;}
   runs.push({delta,t:samples.map(x=>x[0]),x:samples.map(x=>x[1]),z:samples.map(x=>x[2]),hx:samples.map(x=>x[3]),hz:samples.map(x=>x[4]),v:samples.map(x=>x[5])});
  }
  const used={spd:p.spd,tec:p.tec};p.spd=skills.spd;p.tec=skills.tec;
  m.owner=saved.owner;m.ball=saved.ball;m.flight=saved.flight;m.attackFlow.intents=saved.intents;m.people.forEach((q,i)=>{[q.x,q.y,q.tx,q.ty]=saved.pos[i];});
  return {spd:used.spd,tec:used.tec,size:m.geometry?.length>70?'large':'standard',massKg:+v157Body(p).massKg.toFixed(1),runs};})()`));
 result.kinds.push({name:k.name,kind:k.kind,carrierPace:k.pace??null,...r});
 const top=Math.max(...r.runs[0].v);console.log(k.name,'top',top.toFixed(2),'runs',r.runs.length,'samples',r.runs.map(x=>x.t.length).join('/'));
}
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'body-183.json'),JSON.stringify(result));console.log('wrote',path.join(out,'body-183.json'));
