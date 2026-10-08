const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function harness(load=true){
 const person={pid:'a',t:0,n:4,x:.4,y:.7,stats:{}},receiver={pid:'b',t:0,n:6,x:.5,y:.4,stats:{}};
 const match={people:[person,receiver],ball:{x:.4,y:.7},owner:person,elapsed:0},calls=[];
 const context=vm.createContext({match,running:true,v65WorldActive:true,MATCH_SPEED:.78,v55Field:{left:28/600,right:572/600,top:26/740,bottom:714/740},v47PlayerDialog:{open:false},v99Actions:new WeakMap(),v99Flights:new WeakMap(),
  v101KickPoint:(p,t)=>({x:p.x+.001,y:p.y-.009}),v99BallView:()=>null,v99PlayerAction:()=>null,
  step(_d,dt){match.elapsed+=dt;calls.push('step')},
  fly(target,duration,done){match.flight={x:match.ball.x,y:match.ball.y,target,duration,progress:0,done};match.owner=null;calls.push('fly')},
  v55GroundPass(p,r,kind){context.fly(r,.32,()=>{match.owner=r;match.flight=null});calls.push(kind||'pass')},
  v55HighPass(p,r){context.fly(r,.8,()=>context.v55ResolveAir({passer:p,receiver:r,end:r}));match.flight.aerial=true},
  v55Shoot(p,kind){context.fly({x:.5,y:.035},.4,()=>{});calls.push(kind||'shot')},
  v55ResolveAir(info){if(load)context.v102AirContact(info.receiver,info.end);context.v55GroundPass(info.receiver,person,'header')},
  v98PitchPoint:p=>({x:p.x,z:p.y})});
 if(load)vm.runInContext(fs.readFileSync('dist/pitch-motion-v102.js','utf8'),context);
 return {context,person,receiver,match,calls,read:code=>vm.runInContext(code,context)};
}
const h=harness(),{context:c,person:p,receiver:r,match:m}=h;
c.v55GroundPass(p,r);assert.equal(c.v102PlayerAction(m,p).kind,'pass');assert(c.v99BallView(m).y<p.y,'pass begins at the foot');
const saved=JSON.stringify(m);c.v99BallView(m);c.v102PlayerAction(m,p);assert.equal(JSON.stringify(m),saved,'render metadata never changes the saved match');
c.step(.04,.04);assert(c.v102PlayerAction(m,p).progress>0);c.running=false;const clock=c.v102Clock(m);c.step(.04,.04);assert.equal(c.v102Clock(m),clock,'pause freezes the gesture clock');c.running=true;
for(const [fn,kind,args]of [['v55HighPass','cross',[{cross:true}]],['v55Shoot','shot',[]],['v55Shoot','freeKick',['direct-free-kick']],['v55Shoot','volley',['volley']]]){
 c[fn](p,...(fn==='v55HighPass'?[r,...args]:args));assert.equal(c.v102PlayerAction(m,p).kind,kind);
}
c.v55HighPass(p,r);const incoming=m.flight;incoming.progress=1;assert(Math.abs(c.v99BallView(m).elevation-2.65)<1e-9);incoming.done();
assert.equal(c.v102PlayerAction(m,r).kind,'header');assert.equal(c.v99BallView(m).elevation,2.65,'header starts continuously at incoming head height');
assert.equal(c.v102PlayerAction(m,r).contact.x,r.x);
// An unclaimed aerial pass keeps its height, forward drift and gravity after flight ends.
const falling=harness();falling.context.v55ResolveAir=()=>{falling.match.owner=null;falling.match.flight=null;falling.match.ball={x:falling.receiver.x,y:falling.receiver.y};falling.match.rebound={delay:.16}};
falling.context.v55HighPass(falling.person,falling.receiver);const freeFlight=falling.match.flight;freeFlight.progress=1;
const arrivalHeight=falling.context.v99BallView(falling.match).elevation;freeFlight.done();
assert(Math.abs(falling.context.v99BallView(falling.match).elevation-arrivalHeight)<1e-9,'no height reset without contact');
const freeSaved=JSON.stringify(falling.match);falling.context.v99BallView(falling.match);assert.equal(JSON.stringify(falling.match),freeSaved,'freefall projection does not change engine pickup delay');
falling.match.ball.x+=.02;falling.context.step(.04,.2);const airborne=falling.context.v99BallView(falling.match);
assert.equal(airborne.x,falling.match.ball.x,'fall follows the drifting engine ball');assert(Math.abs(airborne.elevation-(arrivalHeight-4.9*.2*.2))<1e-9);
falling.context.step(.04,.6);assert.equal(falling.context.v99BallView(falling.match),null,'fall finishes at ground');
c.v102AirClear(r,{x:.51,y:.4},{x:.6,y:.25});m.flight=null;m.owner=null;assert.equal(c.v99BallView(m).elevation,2.65);c.step(.04,.15);assert(c.v99BallView(m).elevation>1);c.step(.04,.2);assert.equal(c.v99BallView(m),null,'clearance expires without changing engine waits');
const a={clock:1,elapsed:3,turned:false,owner:'a',ball:{x:0,z:0,height:.29},players:[{id:'a',x:0,z:0,action:{id:1,kind:'pass',progress:0}}]},b={clock:1.04,elapsed:3.04,turned:false,owner:null,ball:{x:4,z:2,height:2},players:[{id:'a',x:.4,z:.2,action:{id:1,kind:'pass',progress:.2}}]};
const original=JSON.stringify([a,b]),frame=c.v102Interpolate(a,b,.5);assert.equal(frame.ball.x,2);assert.equal(frame.players[0].x,.2);assert.equal(frame.players[0].action.progress,.1);assert.equal(frame.clock,1.02);assert.equal(JSON.stringify([a,b]),original);
const analysis={...b,offside:{lineX:4}};for(const q of [0,.5,.99]){const f=c.v102Interpolate(a,analysis,q);assert.equal(f.ball.x,b.ball.x);assert.equal(f.players[0].x,b.players[0].x);assert(f.offside,'offside analysis cuts directly to frozen snapshot instead of sliding through it')}
const carry={...a,carrying:true,ballInFlight:false,outOfPlayBall:false},flight={...b,carrying:false,ballInFlight:true,outOfPlayBall:true};
for(const q of [0,.25,.75,.999]){const f=c.v102Interpolate(carry,flight,q);assert.equal(f.owner,'a');assert.equal(f.carrying,true);assert.equal(f.ballInFlight,false);assert.equal(f.outOfPlayBall,false)}
assert.equal(c.v102Interpolate(carry,flight,1).owner,null);assert.equal(c.v102Interpolate(carry,flight,1).ballInFlight,true);
const outgoing={...a,ball:{x:-30,z:12,height:1,opacity:0}},corner={...b,ball:{x:32,z:-21,height:.29,opacity:.3}};
for(const q of [0,.25,.75,.999]){const f=c.v102Interpolate(outgoing,corner,q);assert.equal(f.ball.x,32);assert.equal(f.ball.z,-21);assert.equal(f.ball.opacity,.3*q,'hidden relocation fades in at the destination')}
const fadeOut=c.v102Interpolate({...outgoing,ball:{...outgoing.ball,opacity:.3}},{...corner,ball:{...corner.ball,opacity:0}},.5);assert.equal(fadeOut.ball.x,-30,'fade-out stays at the source');
const foulA={...a,players:[{...a.players[0],action:{id:7,kind:'foulVictim',progress:.2,age:.5}}]},foulB={...b,players:[{...b.players[0],action:{id:7,kind:'foulVictim',progress:.4,age:.7}}]};assert.equal(c.v102Interpolate(foulA,foulB,.5).players[0].action.age,.6);
const goalA={...a,celebration:{id:1,team:0,time:.1}},goalB={...b,celebration:{id:1,team:0,time:.2}},goalBefore=JSON.stringify([goalA,goalB]);
assert(Math.abs(c.v102Interpolate(goalA,goalB,.5).celebration.time-.15)<1e-9,'jubel uses the same buffered time as movement');
assert.equal(JSON.stringify([goalA,goalB]),goalBefore,'jubel interpolation leaves snapshots unchanged');
assert.equal(c.v102Interpolate(goalA,{...goalB,celebration:{id:2,team:1,time:0}},.5).celebration.time,0,'new goal does not blend with the previous jubel');
assert.equal(c.v102Interpolate(goalA,{...goalB,celebration:null},.5).celebration,null,'restart ends jubel immediately');
function group(){return {rotation:{x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})}},position:{x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})}}}}
function runner(hz){const v={root:group(),previous:{x:0,z:0},body:group(),limbs:Array.from({length:4},group),knees:[group(),group()],feet:[group(),group()],elbows:[group(),group()],neck:group()};for(let i=1;i<=hz;i++){const person={x:i/hz*3,z:0,number:4};c.v102RunPose(v,person,1/hz,true);v.previous={x:person.x,z:0}}return v}
const v30=runner(30),v60=runner(60),v120=runner(120);assert(Math.abs(v30.runPhase-v120.runPhase)<1e-8,'gait phase follows distance at any graphics rate');assert(Math.abs(v30.limbs[0].rotation.x-v60.limbs[0].rotation.x)<.01);
const phase=v60.runPhase,speed=v60.runSpeed;c.v102RunPose(v60,{x:3,z:0,number:4},.001,true);assert(v60.runSpeed>speed*.98,'extra drawing cannot collapse run amplitude');c.v102RunPose(v60,{x:3,z:0,number:4},.1,false);assert.equal(v60.runPhase,phase,'paused drawing cannot advance steps');
for(const kind of ['pass','shot','cross','header','volley','control','airReady']){c.v102ActionPose(v60,{kind,progress:.2,target:{x:4,y:1},contact:{x:3,y:0},duration:.5},{x:3,z:0},false);assert(Number.isFinite(v60.limbs[2].rotation.x));assert(Number.isFinite(v60.neck.rotation.x));}

// Two-bone gait: planted sole stays at turf level, swing foot clears it.
let planted=0,raised=0;
for(let i=0;i<240;i++){
 const v=runner(60);v.runPhase=i/240*Math.PI*2;v.runSpeed=3;
 c.v102RunPose(v,{x:3,z:0,number:4},0,false);
 for(let leg=0;leg<2;leg++){
  const hip=v.limbs[leg*2].rotation.x,knee=v.knees[leg].rotation.x,lean=v.body.rotation.x;
  const ankle=v.body.position.y+.89*Math.cos(lean)-.4*Math.cos(lean+hip)-.38*Math.cos(lean+hip+knee);
  const sole=ankle-.0775,cycle=((v.runPhase/(2*Math.PI)+leg*.5)%1+1)%1;
  if(cycle<.6){assert(Math.abs(sole-.0325)<.016,'planted foot does not slide vertically');planted++;}
  else if(cycle>.72&&cycle<.88){assert(sole>.12,'returning foot lifts clear of turf');raised++;}
  assert(Math.abs(lean+hip+knee+v.feet[leg].rotation.x)<1e-9,'ankle counter-rotates the boot');
 }
}
assert(planted>250&&raised>50);
const entry=runner(60),neutral=entry.limbs[2].rotation.x;
c.v102ActionPose(entry,{kind:'shot',progress:-.08/.48,duration:.48,target:{x:4,y:1}},{x:3,z:0},false);
assert(Math.abs(entry.limbs[2].rotation.x-neutral)<1e-8,'windup enters without a pose jump');

const bare=harness(false),decorated=harness(true);for(const x of [bare,decorated]){x.context.v55GroundPass(x.person,x.receiver);x.context.step(.04,.04);x.context.v55Shoot(x.person,'volley')}
assert.deepEqual(decorated.calls,bare.calls,'presentation wraps the same engine calls exactly once');assert.equal(JSON.stringify(decorated.match),JSON.stringify(bare.match),'same physical state with and without graphics metadata');
console.log('Motion 102: action kinds, head contact/clearance, pause, immutable state, shared interpolation and distance-driven gait at 30/60/120 Hz passed.');

