'use strict';
// B06 (fix/r132-anim): the bridge's observed travel (world-unity-v151.js, v151Observe + picture()) on the real native
// producer and the production contract. Node 20+. node work/test-observed-facing-r132.cjs
const assert=require('node:assert/strict'),{harness}=require('./native130-harness.cjs'),h=harness(),C=h.contract,checks=[];
const camera={position:{x:0,z:25},target:{x:0,z:0},fov:42},picture=frame=>C.picture(frame,'native-test',1,camera,'paused',[0,0]);
function check(name,fn){fn();checks.push(name);}
function currentFrame(){const m=h.evaluate('match');return C.scaled(h.call('v98PitchFrame',m),m.geometry);}
// Pure contract: a running field player whose body velocity points away from the observed travel.
function runFrame(extra={}){return{clock:10,elapsed:10,turned:false,owner:null,ballInFlight:false,ball:{x:9,z:1,height:.29},players:[{id:'p',team:0,keeper:false,x:0,z:0,number:5,movement:{mode:'run',bodySpeed:2.2,positionSpeed:4.7,facing:{x:-1,z:.2},travelFacing:{x:-1,z:.2},observedFacing:{x:4.7,z:0},observedSpeed:4.7,...extra},action:null}]};}
check('Observed travel replaces a body velocity pointing more than 90 deg away',()=>{const f=runFrame(),before=JSON.stringify(f);assert.deepEqual(picture(f).players[0].facing,[4.7,0,0]);assert.equal(JSON.stringify(f),before,'picture never writes the frame');});
check('Observed travel within 90 deg keeps the native body velocity',()=>{const f=runFrame({observedFacing:{x:-3,z:2}});assert.deepEqual(picture(f).players[0].facing,[-1,0,.2]);});
check('Without a travel facing the stale body heading is replaced too',()=>{const f=runFrame({travelFacing:null});assert.deepEqual(picture(f).players[0].facing,[4.7,0,0]);});
check('Keeper, non-run modes and pictures without the field keep their projection',()=>{
 const k=runFrame();k.players[0].keeper=true;assert.deepEqual(picture(k).players[0].facing,[9,0,1]);
 const t=runFrame({mode:'turn'});assert.deepEqual(picture(t).players[0].facing,[-1,0,.2]);
 const b=runFrame({mode:'backpedal',travelFacing:null});assert.deepEqual(picture(b).players[0].facing,[-1,0,.2]);
 const old=runFrame();delete old.players[0].movement.observedFacing;delete old.players[0].movement.observedSpeed;assert.deepEqual(picture(old).players[0].facing,[-1,0,.2]);});
check('Explicit action facing, aimed kicks and restarts stay authoritative over the observed travel',()=>{
 const a=runFrame();a.players[0].action={kind:'run',facing:{x:0,z:-1}};assert.deepEqual(picture(a).players[0].facing,[0,0,-1]);
 const s=runFrame();s.players[0].action={kind:'shot',id:'s1',targetWorld:{x:0,z:8},progress:0};assert.deepEqual(picture(s).players[0].facing,[0,0,8]);});
// Real producer: positions moved natively while the body velocity stays; the wrapper attaches the observed travel.
h.run(`Native130.chase=function(c){Native130.reset(c);match.rebound=null;match.setPiece=null;match.kickoff=null;match.throwIn=null;for(const p of match.people){const body=v157Body(p);body.heading=2.7;body.vx=-1.5;body.vy=-1.5;}return true;};`);
function advance(dx,dy,dt=.05){h.run(`for(const p of match.people){if(p.keeper)continue;p.x+=${dx};p.y+=${dy};}v102State(match).clock+=${dt};`);}
for(const size of ['standard','large'])check(`Native positions moved against the body velocity carry an observed travel ${size}`,()=>{
 h.call('Native130.chase',{team:0,size,turned:false});const first=currentFrame();const field=first.players.filter(p=>!p.keeper&&p.movement?.mode==='run');assert(field.length>0,'running field players in the fixture');
 assert(field.every(p=>p.movement.observedFacing===undefined),'the first picture has no observed travel');
 advance(.004,0);const second=currentFrame();const moved=second.players.filter(p=>!p.keeper&&p.movement?.mode==='run');assert(moved.length>0);
 for(const p of moved){assert(p.movement.observedFacing&&Number.isFinite(p.movement.observedSpeed),'observed travel attached');assert(p.movement.observedSpeed>1.2,'observed speed above the walking threshold');
  const dx=p.movement.observedFacing.x-p.x,dz=p.movement.observedFacing.z-p.z;const prev=first.players.find(q=>q.id===p.id);const tx=p.x-prev.x,tz=p.z-prev.z;assert((dx*tx+dz*tz)/(Math.hypot(dx,dz)*Math.hypot(tx,tz))>.999999,'observed facing follows the actual step');}
 const again=currentFrame();assert.deepEqual(picture(again),picture(second),'the same clock gives the same picture');
 const shown=picture(second);for(const p of shown.players){const src=second.players.find(q=>q.id===p.id);if(!src.movement?.observedFacing)continue;const ox=src.movement.observedFacing.x-src.x,oz=src.movement.observedFacing.z-src.z;assert((p.facing[0]*ox+p.facing[2]*oz)/(Math.hypot(ox,oz)*Math.hypot(p.facing[0],p.facing[2]))>.9999,'stride facing follows the observed travel when the body velocity disagrees');}
});
check('A slow native step and a seek carry no observed travel',()=>{
 h.call('Native130.chase',{team:0,size:'standard',turned:false});currentFrame();advance(.0005,0);assert(currentFrame().players.every(p=>p.movement?.observedFacing===undefined),'below 1.2 m/s');
 advance(.004,0,-.5);assert(currentFrame().players.every(p=>p.movement?.observedFacing===undefined),'a clock going back resets');
 advance(.004,0,2);assert(currentFrame().players.every(p=>p.movement?.observedFacing===undefined),'a gap over 1 s resets');});
check('Actual JSON snapshot carries no observed travel fields',()=>{const context=h.call('Native130.context');assert(h.call('v65Snapshot',context));assert(!/observedFacing|observedSpeed|v151Travel/.test(JSON.stringify(context.state.physicalSnapshot)));});
console.log(JSON.stringify({pass:true,suite:'observed-facing-r132',checks:checks.length,cases:checks,scope:'Production bridge projection on the real native producer; no full-match or visual acceptance claim.'}));
