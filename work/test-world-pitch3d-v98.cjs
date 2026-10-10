const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/world-pitch3d-v98.js','utf8');
const context=vm.createContext({v55Field:{left:28/600,right:572/600,top:26/740,bottom:714/740},v99Actions:new WeakMap(),v102Clock:()=>0,v83GoalSceneDuration:4.05,v83GoalPosition:()=>({x:.53,y:9/740,height:6})});
vm.runInContext(source.slice(0,source.indexOf('const v98Style=')),context);
const pitchSource=fs.readFileSync('dist/pitch-v55.js','utf8');vm.runInContext(pitchSource.slice(pitchSource.indexOf('function v55OffsideSignal('),pitchSource.indexOf('function v55DrawAssistantReferee(')),context);
const point=vm.runInContext('v98PitchPoint',context),frame=vm.runInContext('v98PitchFrame',context);
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
near(point({x:28/600,y:26/740}).x,34);near(point({x:28/600,y:26/740}).z,-22);
near(point({x:572/600,y:714/740}).x,-34);near(point({x:572/600,y:714/740}).z,22);
near(point({x:.5,y:.5}).x,0);near(point({x:.5,y:.5}).z,0);
const person={pid:'p1',x:.3,y:.7,t:0,n:8,keeper:false},match={elapsed:10,goals:[],people:[person],ball:{x:.53,y:.2},owner:person,flight:{aerial:true,progress:.5},offsideVisual:{x:.3,y:.7,lineY:.6}};
const before=JSON.stringify(match),first=frame(match);assert.equal(JSON.stringify(match),before,'projection does not alter physical match');
for(const [elapsed,pose]of [[0,'raised'],[1,'far'],[1.5,'middle']]){match.setPiece={positionElapsed:elapsed};assert.equal(frame(match).offside.signal.pose,pose,'uses existing referee signal sequence');}
assert.equal(first.owner,'p1');assert.equal(first.players[0].id,'p1');near(first.ball.height,5.63);
const controlled={...match,flight:null,setPiece:null,ball:{x:person.x+.016,y:person.y-.022}};
const controlledBefore=JSON.stringify(controlled),controlledFrame=frame(controlled);
near(Math.hypot(controlledFrame.ball.x-controlledFrame.players[0].x,controlledFrame.ball.z-controlledFrame.players[0].z),.65);
assert.equal(JSON.stringify(controlled),controlledBefore,'visual ball contact never changes engine coordinates');
for(const key of ['setPiece','throwIn','kickoff','postBanner','rebound']){const waiting={...controlled,[key]:{}};near(frame(waiting).ball.x,point(waiting.ball).x);}
controlled.halftimeBreakDone=true;const controlledTurned=frame(controlled);near(controlledTurned.ball.x,-controlledFrame.ball.x);near(controlledTurned.ball.z,-controlledFrame.ball.z);
context.v66SponsorLogoSVG=(_country,sponsor)=>sponsor.name;
const sponsor=vm.runInContext('v98HomeSponsor',context),sponsorContext={career:{world:{clubs:[{id:'home',countryId:'GER',sponsorId:'h',sponsors:[{id:'h',name:'Home brand'}]},{id:'away',countryId:'ESP',sponsorId:'a',sponsors:[{id:'a',name:'Away brand'}]}]}},fixture:{homeId:'home',awayId:'away'}};
for(const ownSide of [0,1]){const ad=sponsor({...sponsorContext,ownSide});assert.equal(ad.clubId,'home');assert.equal(ad.name,'Home brand');assert.equal(ad.svg,'Home brand');}
sponsorContext.career.world.clubs[0].sponsorId=null;assert.equal(sponsor(sponsorContext),null,'no contract means no invented sponsor');
const aim=vm.runInContext('v98CameraAim',context),blend=vm.runInContext('v98BlendCamera',context);
const centre=aim({x:0,z:0,height:.29},'follow',16/9),right=aim({x:30,z:10,height:.29},'follow',16/9),left=aim({x:-30,z:-10,height:.29},'follow',16/9),wide=aim({x:0,z:0,height:.29},'wide',16/9);
assert(centre.position.y<wide.position.y&&centre.position.z<wide.position.z&&centre.fov<wide.fov,'close camera frames less field');
assert(right.position.x>0&&right.position.x<right.target.x,'small lateral travel plus stronger turn toward ball');near(left.target.x,-right.target.x);near(left.position.x,-right.position.x);
assert(right.target.z>0&&left.target.z<0,'tilt follows ball depth');
assert(Math.abs(aim({x:.001,z:0,height:.29},'follow',16/9).target.x-aim({x:-.001,z:0,height:.29},'follow',16/9).target.x)<.01,'no camera cut at halfway line');
const smooth=blend(centre,right,.05);assert(smooth.position.x>0&&smooth.position.x<right.position.x&&smooth.target.x>0&&smooth.target.x<right.target.x,'smooth scroll and turn');
const once=blend(centre,right,.1),twice=blend(blend(centre,right,.05),right,.05);near(once.position.x,twice.position.x);near(once.target.x,twice.target.x);near(blend(centre,right,0).target.x,centre.target.x);
// Independent perspective projection: the actual near sideline must clear
// the bottom HUD band in both TV views, including a corner and a high ball.
function projectBall(ball,camera,aspect){
 const sub=(a,b)=>[a.x-b.x,a.y-b.y,a.z-b.z],norm=a=>{const n=Math.hypot(...a);return a.map(v=>v/n);},dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 const forward=norm(sub(camera.target,camera.position)),right=norm([-forward[2],0,forward[0]]),up=[right[1]*forward[2]-right[2]*forward[1],right[2]*forward[0]-right[0]*forward[2],right[0]*forward[1]-right[1]*forward[0]];
 const delta=sub({x:ball.x,y:ball.height,z:ball.z},camera.position),depth=dot(delta,forward),span=depth*Math.tan(camera.fov*Math.PI/360);
 return {x:.5+dot(delta,right)/(2*span*aspect),y:.5+dot(delta,up)/(2*span)};
}
const unityCamera=require('../dist/world-unity-v151.js').camera;
for(const [width,height] of [[844,390],[931,448],[1280,720]])for(const mode of ['follow','sideline'])for(const ball of [{x:0,z:20.5,height:.29},{x:31,z:20.5,height:.29},{x:0,z:0,height:.29},{x:0,z:-20.5,height:.29},{x:0,z:20.5,height:6}])for(const geometry of [null,{length:81.6,width:52.8}]){
 const frozen=JSON.stringify(ball),physical=geometry?{...ball,x:ball.x*1.2,z:ball.z*1.2}:ball,pose=unityCamera(b=>aim(b,mode,width/height),physical,geometry,mode),screen=projectBall(physical,pose,width/height);
 assert(screen.x>0&&screen.x<1&&screen.y>.14&&screen.y<1,`${mode} ${width}x${height}: ball must clear bottom HUD ${JSON.stringify(screen)}`);
 assert.equal(JSON.stringify(ball),frozen,'camera remains a pure reader');
}
for(const mode of ['follow','sideline']){
 const geometry={length:81.6,width:52.8},poses=[13-1e-7,13,13+1e-7].map(z=>unityCamera(b=>aim(b,mode,844/390),{x:0,z:z*1.2,height:.29},geometry,mode));
 for(const key of ['position','target'])assert(Math.abs(poses[2][key].z-poses[0][key].z)<1e-5,`${mode}: no jump across near-side pan threshold`);
}
match.halftimeBreakDone=true;const turned=frame(match);near(turned.players[0].x,-first.players[0].x);near(turned.players[0].z,-first.players[0].z);near(turned.ball.x,-first.ball.x);near(turned.offside.lineX,-first.offside.lineX);
match.goalPause=2;match.goalScene={};const goal=frame(match);near(goal.ball.height,.29+6*68/688);assert(goal.ball.x<-34,'second-half goal stays behind its visible goal line');
const randomStart=source.indexOf('let v98VisualSeed=98;'),randomEnd=source.indexOf('// Optional SuperCollider');
let calls=0;const original=()=>{calls++;return .42;};const math=Object.create(Math);math.random=original;
const randomContext=vm.createContext({Math:math,v98RenderScene(){for(let i=0;i<100;i++)math.random();}});
vm.runInContext(source.slice(randomStart,randomEnd),randomContext);vm.runInContext('v98Render()',randomContext);assert.equal(calls,0,'graphics do not consume simulation randomness');assert.equal(math.random,original);
randomContext.v98RenderScene=()=>{math.random();throw Error('render failure')};assert.throws(()=>vm.runInContext('v98Render()',randomContext));assert.equal(math.random,original,'simulation random function restored on renderer error');
const physicalSource=fs.readFileSync('dist/world-physical-v65.js','utf8'),bannerContext=vm.createContext({v65Club:()=>({name:'Testverein'}),v61CrestSVG:()=>'',escapeHTML:String,v64UiName:pid=>pid});
vm.runInContext(physicalSource.slice(physicalSource.indexOf('function v65SwapInfoHTML('),physicalSource.indexOf('function v65ShowSwapInfo(')),bannerContext);
const swapHTML=vm.runInContext('v65SwapInfoHTML',bannerContext),swapContext={ownSide:0,state:{minute:17}},change={side:0,outPid:'out',inPid:'in'};
assert(swapHTML(swapContext,[change]).includes('17′'),'executed change inherits current match minute');assert(swapHTML(swapContext,[{...change,minute:0}]).includes('0′'),'explicit minute zero stays valid');
assert(!swapHTML({...swapContext,state:{}},[change]).includes('undefined'),'unknown minute is omitted');
console.log('3D projection: pitch bounds, side change, flight/goal/offside, immutable match and independent random stream passed.');
