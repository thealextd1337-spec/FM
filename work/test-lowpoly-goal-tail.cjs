'use strict';
// Controlled inputs to the actual production projection and packet functions.
// No native match reachability/frequency claim and no replica of ball physics.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const source=read('dist/world-pitch3d-v98.js'),unity=read('dist/world-unity-v151.js'),actions=read('dist/world-pitch-actions-v99.js');
function actualFunction(text,name){const start=text.indexOf('function '+name+'(');assert(start>=0,name);let braces=0,opened=false;for(let end=start;end<text.length;end++){if(text[end]==='{'){braces++;opened=true;}else if(text[end]==='}'&&--braces===0&&opened)return text.slice(start,end+1);}throw Error(name+' unclosed');}
let draws=0;const math=Object.create(Math);math.random=()=>{draws++;throw Error('Presentation drew RNG');};
const context=vm.createContext({Math:math,console,WeakMap,Map,URLSearchParams,
 v55Field:{left:28/600,right:572/600,top:26/740,bottom:714/740},v83GoalSceneDuration:4.05,
 v99Actions:new WeakMap(),v99Flights:new WeakMap(),clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
 v160PitchLength:m=>m.geometry.length,v160PitchWidth:m=>m.geometry.width,
 v102Clock:m=>m.clock});
const sceneSource=read('dist/world-goal-scene-v83.js');
vm.runInContext(actualFunction(sceneSource,'v83GoalLine')+'\n'+actualFunction(sceneSource,'v83GoalPosition'),context,{filename:'dist/world-goal-scene-v83.js'});
vm.runInContext(actualFunction(actions,'v101GoalBall'),context,{filename:'dist/world-pitch-actions-v99.js'});
vm.runInContext(source.slice(0,source.indexOf('function v98HomeSponsor(')),context,{filename:'dist/world-pitch3d-v98.js'});
vm.runInContext(unity.slice(0,unity.indexOf("if(typeof window==='object'&&typeof v98RenderScene")),context,{filename:'dist/world-unity-v151.js'});
// Release 132 split the wrapper into observation/preparation helpers and the
// frame decorator. Load that complete production block, as the native harness
// does, instead of assuming the decorator still occupies a single line.
const wrapperStart=unity.indexOf('const basePitchFrame=v98PitchFrame;'),wrapperEnd=unity.indexOf('\n let shownGeometry=',wrapperStart);assert(wrapperStart>=0&&wrapperEnd>wrapperStart);
const wrapper=unity.slice(wrapperStart,wrapperEnd);
vm.runInContext('{'+wrapper+'}',context,{filename:'dist/world-unity-v151.js:actual-frame-wrapper'});
const {v55Field:field,v99Actions:states,D6WorldUnityContract:C}=context;
const clean=v=>JSON.parse(JSON.stringify(v)),radius=.1764,camera={position:{x:0,height:20,z:30},target:{x:0,height:0,z:0},fov:42};
function packet(m){return clean(C.picture(C.scaled(context.v98PitchFrame(m),m.geometry),'goal-tail-controlled',1,camera,'goal',m.score));}
const speeds=[.5,.6,.7,.8,.83,.85,.9,1,1.2,1.45,1.65,2,2.4,4,7,12,20],profiles=[[.29,0],[.7,0],[.44,7],[.89,6.5]],rows=[];
let worstBoundary=0,worstEnvelope=-Infinity,continuation=0;
for(const speed of speeds)for(const [elevation,vh]of profiles)for(const z of [0,3])for(const team of [0,1]){
 const scale=team===0?1:1.2,g={version:1,length:68*scale,width:44*scale,goalWidth:44*.2/(field.right-field.left)};g.goalHeight=g.goalWidth/3;
 const sy=g.length/(field.bottom-field.top),sx=g.width/(field.right-field.left),direction=team===0?-1:1;
 const travel={x:.5+z/sx,y:team===0?field.top:field.bottom,vx:0,vy:direction*speed/sy,elevation,vh,direction};
 const m={geometry:g,people:[],goals:[{team,pid:'scorer'}],score:[team===0?1:0,team===1?1:0],ball:{x:.5,y:.5},elapsed:123,clock:31,goalPause:4.05,goalScene:{team,x:travel.x,elapsed:0},halftimeBreakDone:z!==0};
 states.set(m,{goalTravel:travel});const state=states.get(m);
 const at=t=>{m.goalPause=4.05-t;m.goalScene.elapsed=Math.min(t,2.45);return packet(m);};
 const samples=[];
 for(const t of [0,.1,1,2.45,2.8,3,3.5,3.85,3.95,4,4.05-1e-6]){
  const native=JSON.stringify(m),facts=JSON.stringify(state),p=packet(m),v=context.v119VisibleGoalView(m);assert.equal(JSON.stringify(m),native);assert.equal(JSON.stringify(state),facts);
  const sample=at(t),input=JSON.stringify(m),factInput=JSON.stringify(state);assert.deepEqual(packet(m),sample,'Pause picture stable');assert.equal(JSON.stringify(m),input);assert.equal(JSON.stringify(state),factInput);
  const visible=context.v119VisibleGoalView(m);assert.equal(sample.net.flowing,true);assert.ok(Math.abs(visible.age-Math.max(0,t-visible.impact))<1e-12);
  assert.ok(sample.ball.every(Number.isFinite));const depth=Math.abs(sample.ball[0])-g.length/2;worstEnvelope=Math.max(worstEnvelope,depth+radius-2.2);assert.ok(depth>=-1e-10&&depth+radius<=2.2+1e-10);
  samples.push({t,ball:sample.ball,age:sample.net.age,bulge:sample.net.bulge});
 }
 const held=at(2.45),later=at(3.5);if(speed<=.8){assert.notDeepEqual(later.ball,held.ball,'Slow ball continues after native scene cap');continuation++;}
 const capBefore=at(2.45-1e-6),capAfter=at(2.45+1e-6);assert.ok(Math.hypot(...capAfter.ball.map((v,i)=>v-capBefore.ball[i]))<5e-5,'Continuous across native pose cap');
 const before=at(4.05-1e-6);m.goalPause=0;m.goalScene=null;m.postBanner={kind:'goal'};const end=packet(m);
 const boundary=Math.hypot(...end.ball.map((v,i)=>v-before.ball[i]));worstBoundary=Math.max(worstBoundary,boundary);assert.ok(boundary<=3e-5,'Goal pause to banner continuous');assert.equal(end.netActive,false);
 // Seek/replay reconstructs a picture from received state, without a display clock.
 m.postBanner=null;m.goalScene={team,x:travel.x,elapsed:2.45};for(const t of [3.95,1,3.5,2.8,0,4])assert.deepEqual(at(t),at(t),'Seek/replay deterministic');
 // scene.elapsed is deliberately different; only the existing pause determines the view.
 const expected=at(3);m.goalScene.elapsed=0;assert.deepEqual(packet(m),expected);
 rows.push({speed,elevation,vh,z,team,scale,impact:context.v119VisibleGoalView(m).impact,samples,boundary});
}
assert.equal(rows.length,272);assert.equal(draws,0);
// Rear-hit marker only: fallback facts retain the absent legacy contract.
const fallback={people:[],goals:[],score:[0,0],ball:{x:.5,y:.5},elapsed:0,clock:0,goalPause:1,goalScene:{team:0,x:.5,elapsed:2.45},geometry:{length:68,width:44}};
states.set(fallback,{});assert.equal(Object.hasOwn(packet(fallback).net,'flowing'),false);
const lateMatch={...fallback,goalPause:4.05-2.8,geometry:{length:68,width:44,goalWidth:9.7,goalHeight:3.23}};
states.set(lateMatch,{goalTravel:{x:.5,y:field.top,vx:0,vy:-(2.2-radius)/2.74/(68/(field.bottom-field.top)),elevation:.29,vh:0,direction:-1}});
const lateView=context.v119VisibleGoalView(lateMatch),latePacket=packet(lateMatch);
assert.ok(Math.abs(lateView.age-.06)<1e-12);assert.ok(Math.abs(lateView.bulge-.6)<1e-12);assert.equal(latePacket.net.flowing,true);assert.equal(latePacket.celebrationTime,2.8);
for(const hit of ['side','roof']){
 const m={...fallback,geometry:{length:68,width:44,goalWidth:9.7,goalHeight:3.23},goalPause:3.05};
 const sy=68/(field.bottom-field.top),sx=44/(field.right-field.left);
 states.set(m,{goalTravel:{x:.5,y:field.top,vx:hit==='side'?10/sx:0,vy:-.7/sy,elevation:hit==='roof'?3.2:.29,vh:hit==='roof'?5:0,direction:-1}});
 assert.equal(context.v119VisibleGoalView(m).hit,hit);assert.equal(packet(m).netActive,false);
}
const report={scope:'272 controlled actual production goal-tail projections; no match reachability/frequency or Unity mesh/device claim',cases:rows.length,slowContinued:continuation,randomDraws:draws,worstPauseBannerJump:worstBoundary,worstRestNetPenetration:worstEnvelope,hashes:Object.fromEntries(['dist/world-pitch3d-v98.js','dist/world-unity-v151.js','dist/world-pitch-actions-v99.js'].map(f=>[f,crypto.createHash('sha256').update(read(f)).digest('hex')])),rows};
const output=path.join(root,'outputs/lowpoly-live-rollout-20261013/goal-tail-controlled.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,rows:undefined,output},null,2));
