const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scene=fs.readFileSync('dist/pitch-scene-v98.js','utf8'),source=fs.readFileSync('dist/world-pitch3d-v98.js','utf8');
// Execute the production quality selection with a renderer stub.
for(const [mobile,dpr,ratio]of [[true,3,1],[true,.8,.8],[false,3,1.75],[false,1,1]]){
 const context=vm.createContext({window:{matchMedia:()=>({matches:mobile})},devicePixelRatio:dpr,THREE:{WebGLRenderer:class{constructor(options){this.options=options;this.shadowMap={}}setPixelRatio(r){this.ratio=r}}}});
 vm.runInContext(scene.slice(0,scene.indexOf(' const scene=new THREE.Scene();'))+'return {renderer,quality};}};',context);
 const result=vm.runInContext('window.D6PitchScene.create({})',context);assert.equal(result.renderer.ratio,ratio);assert.equal(result.renderer.options.antialias,!mobile);assert.equal(result.renderer.shadowMap.enabled,!mobile);assert.equal(result.quality.maxFps,mobile?60:0);
}
// Exercise the real capture/scheduling code at a synthetic 120 Hz, independently
// of the host monitor, GPU or wall-clock noise. Stub only the final scene drawing.
function fixture(maxFps){
 let now=0,callback=null;const pictures=[],rawFrames=[];
 const canvas={parentElement:{getBoundingClientRect:()=>({width:840,height:473})}},empty={hidden:false};
 const context=vm.createContext({document:{hidden:false,body:{classList:{add(){},toggle(){}}}},performance:{now:()=>now},running:true,v47PlayerDialog:{open:false},contextPhaseLive:()=>true,v98IsWorld:()=>true,v98View:'3d',v98Orientation:{matches:true},v98Failed:false,match:{flight:null},v102Flights:new WeakMap(),$:selector=>selector==='#v98-canvas'?canvas:empty,v98Toolbar(){},v98SyncAudio(){},v98Scene:{quality:{maxFps},renderer:{domElement:{width:840,height:473},getPixelRatio:()=>1,setSize(){throw Error('Unexpected resize')}},camera:{}},v98LastTime:-1000,v98PitchFrame:()=>{const f={turned:false,elapsed:now/1000,clock:now/1000,ball:{x:0,z:0},players:[],offside:null};rawFrames.push(f);return f},requestAnimationFrame:fn=>{callback=fn;return 1},cancelAnimationFrame:()=>{callback=null},pictures,v98Match:null,v102Interpolate:(_a,b)=>b});
 vm.runInContext('v98Match=match;let v102Loop=0,v102Painting=false,v102Frames=null,v99Expanded=false,v98Frame=null;',context);
 vm.runInContext(source.slice(source.indexOf('function v102StopPaint()'),source.indexOf('let v98Offside=')),context);
 const start=source.indexOf('function v98RenderScene('),end=source.indexOf('  const ids=new Set(',start);
 vm.runInContext(source.slice(start,end)+'pictures.push({now,dt,clock:frame.clock});if(live)v102PaintNext();else v102StopPaint();}catch(error){throw error;}}\nfunction v98Render(){return v98RenderScene();}',context);
 return {context,pictures,rawFrames,setTime:value=>{now=value},paint:()=>{const fn=callback;callback=null;if(fn)fn()},run:code=>vm.runInContext(code,context)};
}
const mobile=fixture(60);mobile.run('v98RenderScene(true)');assert.equal(mobile.pictures.length,1);
mobile.setTime(1);mobile.run('v98RenderScene(true)');assert.equal(mobile.pictures.length,1,'timer supplies snapshots without duplicate painting');assert.equal(mobile.rawFrames.length,2);
for(let i=1;i<=120;i++){mobile.setTime(i*1000/120);if(i%5===0)mobile.run('v98RenderScene(true)');mobile.paint();}
assert.equal(mobile.pictures.length,61,'120 Hz monitor produces 60 new mobile pictures per second');
assert(mobile.pictures.slice(2).every(p=>Math.abs(p.dt-1/60)<1e-9),'animation time advances by the actual drawn interval');
assert(mobile.pictures.at(-1).clock>.9,'drawing uses the latest simulation snapshot');
mobile.run('running=false;v98RenderScene(true)');assert.equal(mobile.pictures.length,62,'pause paints immediately');assert.equal(mobile.run('v102Loop'),0,'pause cancels the screen callback');
mobile.run('running=true;v98RenderScene(true)');assert.equal(mobile.pictures.length,63,'resume paints and restarts the loop');mobile.run('v98RenderScene()');assert.equal(mobile.pictures.length,64,'explicit scene probes remain synchronous');
const desktop=fixture(0);desktop.run('v98RenderScene(true)');for(let i=1;i<=120;i++){desktop.setTime(i*1000/120);desktop.paint();}assert.equal(desktop.pictures.length,121,'desktop retains native screen refresh');
const replaySource=fs.readFileSync('dist/world-goal-replay-v103.js','utf8'),replayState={review:{playing:true,time:0,at:0},timeline:[{clock:0},{clock:10}]};
let replayPictures=0;const replay=vm.createContext({match:{elapsed:42},v103Replays:new WeakMap(),v98Scene:{quality:{maxFps:60}},v98LastTime:0,now:0,document:{hidden:false},v47PlayerDialog:{open:false},v103CanReplay:()=>true,v131ReviewUI(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),v98Render:()=>{replayPictures++;replay.v98LastTime=replay.now}});
replay.v103Replays.set(replay.match,replayState);vm.runInContext('let v132ReviewLoop=0;'+replaySource.slice(replaySource.indexOf('function v132StopReview()'),replaySource.indexOf('function v132ToggleReview()')),replay);
for(let i=1;i<=120;i++){replay.now=i*1000/120;vm.runInContext('v132ReviewTick(now)',replay)}
assert.equal(replayPictures,60,'mobile review also limits actual rig pictures');assert(Math.abs(replayState.review.time-1)<1e-9,'review time retains real speed at 120 Hz');assert.equal(replay.match.elapsed,42,'review leaves simulation paused');
replayState.review.time=9.999;replay.now+=1000/120;vm.runInContext('v132ReviewTick(now)',replay);assert.equal(replayPictures,61,'the final paused review picture is drawn even inside the frame budget');assert.equal(replayState.review.time,10);assert.equal(replayState.review.playing,false);replayState.review.playing=true;
replay.document.hidden=true;vm.runInContext('v132ReviewTick(now)',replay);assert.equal(replayState.review.playing,false,'hidden review stops');
console.log('Mobile performance: quality budget, 120 Hz live/review cadence, fresh capture, animation time, pause/resume and desktop rendering passed.');
