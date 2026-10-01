const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const elements=new Map(),current={elapsed:0,goalPause:0,goals:[]},calls={step:0,after:0},dialog={open:false};let clock=0;
function element(id){const node={id,style:{},classList:{remove(){},toggle(){}},children:{},querySelector(sel){return this.children[sel]||(this.children[sel]={addEventListener(){},textContent:''})},append(child){elements.set(child.id,child)},remove(){elements.delete(this.id)}};return node}
const bodyClasses=new Set(),document={hidden:false,createElement:()=>element(''),head:{append(){}},body:{classList:{remove:k=>bodyClasses.delete(k),contains:k=>bodyClasses.has(k),toggle(k,on){on?bodyClasses.add(k):bodyClasses.delete(k)}}},addEventListener(){}};
const ctx=vm.createContext({document,performance:{now:()=>clock*1000},MutationObserver:class{observe(){}},match:current,running:true,v65WorldActive:true,v98View:'3d',v98Failed:false,v98Match:null,v98CameraPose:{},v98Orientation:{matches:true},v47PlayerDialog:dialog,
 $:id=>id==='#match-area .v42-pitch-stage'?element('stage'):elements.get(id.slice(1)),hideOverlay(){},v98Text:(de,en)=>en,v98IsWorld:()=>true,
 v102Clock:()=>clock,v98PitchFrame:()=>({clock,ball:{x:clock,z:0,height:.29},players:[],turned:false}),v102Interpolate:(a,b,q)=>({...b,clock:a.clock+(b.clock-a.clock)*q,ball:{x:a.ball.x+(b.ball.x-a.ball.x)*q}}),
 v50TakePenalty(piece){piece.outcome='goal'},v50PenaltyVisual(){elements.set('v50-penalty-scene',element('v50-penalty-scene'))},v50ClearPenaltyScene(){elements.delete('v50-penalty-scene')},
 v50Goal(){current.goals.push({});current.goalPause=4.05},step(_d,dt){calls.step++;clock+=dt;if(current.goalPause>0)current.goalPause=Math.max(0,current.goalPause-dt);else current.elapsed+=dt},v65AfterStep(){calls.after++},draw(){},v98Dispose(){},v65UpdateControls(){}});
vm.runInContext(fs.readFileSync('dist/world-goal-replay-v103.js','utf8'),ctx);
const read=code=>vm.runInContext(code,ctx);
for(let i=0;i<60;i++)ctx.step(.04,.04);ctx.v50Goal();for(let i=0;i<100&&!read('v103ReplayState(match).active');i++)ctx.step(.05,.05);
assert(read('!!v103ReplayState(match).active'));const before=JSON.stringify(current),steps=calls.step,now=clock;
ctx.step(.25,.25);ctx.v65AfterStep({});assert.equal(JSON.stringify(current),before);assert.equal(calls.step,steps);assert.equal(calls.after,0);assert.equal(clock,now);
const sample=ctx.v103ReplayFrame(clock*1000,true);assert(sample.clock<clock-2,'sample comes from recorded attack');
for(const pause of ['running','dialog','hidden']){
 if(pause==='running')ctx.running=false;else if(pause==='dialog')dialog.open=true;else document.hidden=true;
 const elapsed=read('v103ReplayState(match).active.elapsed');ctx.step(.5,.5);assert.equal(read('v103ReplayState(match).active.elapsed'),elapsed);
 ctx.running=true;dialog.open=false;document.hidden=false;
}
ctx.v103EndReplay();ctx.step(.1,.1);ctx.v65AfterStep({});assert.equal(current.goals.length,1);assert.equal(calls.after,1);assert(!read('v103ReplayState(match).active'));
// Natural completion, cancellation and the existing 2D continuation.
current.goalPause=0;ctx.v50Goal();for(let i=0;i<100&&!read('v103ReplayState(match).active');i++)ctx.step(.05,.05);
for(let i=0;i<150&&read('v103ReplayState(match).active');i++)ctx.step(.05,.05);assert(!read('v103ReplayState(match).active'));assert.equal(current.goals.length,2);
current.goalPause=0;ctx.v98View='2d';ctx.v50Goal();for(let i=0;i<90;i++)ctx.step(.05,.05);assert(!read('v103ReplayState(match).active'));assert.equal(current.goalPause,0);
ctx.v98View='3d';const piece={team:0,taker:{n:3,name:'Test'},shotSide:1,diveSide:-1};ctx.v50TakePenalty(piece);ctx.v50Goal(null,null,true);for(let i=0;i<100&&!read('v103ReplayState(match).active');i++)ctx.step(.05,.05);
assert(read('!!v103ReplayState(match).active.penalty'));assert(elements.has('v50-penalty-scene'));ctx.running=false;ctx.v65UpdateControls();assert(bodyClasses.has('v103-replay-paused'));
ctx.v103EndReplay();assert(!elements.has('v50-penalty-scene'));
console.log('Replay 103: recorded attack, held engine/AI, pause/dialog/hidden, skip, natural completion, 2D continuation and penalty cleanup passed.');
