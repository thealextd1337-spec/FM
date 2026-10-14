'use strict';
// B06 (fix/r132-anim): the bridge's observed travel (world-unity-v151.js, v151WrapStep + v151Observe + picture()) on the
// real native producer and the production contract. Node 20+. node work/test-observed-facing-r132.cjs
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
// Review 1: every new world point of a picture scales like the positions on a larger pitch (a player off the centre).
check('scaled() maps observedFacing, restartAttention and prepareWorld like the positions',()=>{
 const g={length:81.6,width:52.8,goalWidth:7.32,goalHeight:2.44,penaltyDepth:16.5,penaltyWidth:40.3};
 const f={clock:10,elapsed:10,turned:false,owner:null,ballInFlight:false,ball:{x:10,z:5,height:.29},players:[{id:'p',team:0,keeper:false,x:20,z:-10,number:5,movement:{mode:'run',facing:{x:21,z:-10},travelFacing:{x:19,z:-10},observedFacing:{x:21,z:-10},observedSpeed:3,restartAttention:{x:30,z:-10,taker:true}},action:{kind:'freeKick',id:'fk',progress:0,duration:.9,targetWorld:{x:34,z:0},prepareWorld:{x:30,z:-10}}}]};
 const s=C.scaled(f,g),p=s.players[0],sx=g.length/68,sz=g.width/44;
 assert.deepEqual([p.x,p.z],[20*sx,-10*sz]);assert.deepEqual(p.movement.observedFacing,{x:21*sx,z:-10*sz});assert.deepEqual(p.movement.restartAttention,{x:30*sx,z:-10*sz,taker:true});assert.deepEqual(p.action.prepareWorld,{x:30*sx,z:-10*sz});
 const shown=picture(s).players[0];assert(Math.abs(shown.facing[0]-1)<1e-9&&Math.abs(shown.facing[2])<1e-9,'a pure +x direction stays +x on the large pitch ('+shown.facing+')');
 const unscaled=picture(C.scaled(f,{length:68,width:44,goalWidth:7.32}));assert.deepEqual(unscaled.players[0].facing,shown.facing,'same direction on both pitch sizes');});
// Real producer: observations come from completed native steps only (the bridge's step wrapper, installed here as in the view).
h.run('const v151BaseStep=step;step=function(...a){return v151WrapStep(v151BaseStep,this,a);};');
h.run(`Native130.chase=function(c){Native130.reset(c);match.rebound=null;match.setPiece=null;match.kickoff=null;match.throwIn=null;for(const p of match.people){const body=v157Body(p);body.heading=2.7;body.vx=-1.5;body.vy=-1.5;}return true;};`);
for(const size of ['standard','large'])check(`A completed native step carries the observed travel of its running field players ${size}`,()=>{
 h.call('Native130.chase',{team:0,size,turned:false});const first=currentFrame();assert(first.players.every(p=>p.movement?.observedFacing===undefined),'no step, no observation');
 const before=new Map(first.players.map(p=>[p.id,[p.x,p.z]]));h.call('Native130.advance');const second=currentFrame();
 const moved=second.players.filter(p=>!p.keeper&&p.movement?.mode==='run'&&p.movement.observedFacing);assert(moved.length>0,'running field players observed');
 for(const p of moved){const [bx,bz]=before.get(p.id);const tx=p.x-bx,tz=p.z-bz,dx=p.movement.observedFacing.x-p.x,dz=p.movement.observedFacing.z-p.z;assert(p.movement.observedSpeed>1.2);assert((dx*tx+dz*tz)/(Math.hypot(dx,dz)*Math.hypot(tx,tz))>.999999,'observed facing follows the completed step');}
 assert.deepEqual(picture(currentFrame()),picture(second),'the same clock gives the same picture, however often projected');
 const snapshot=h.call('Native130.state');assert.equal(h.call('Native130.state'),snapshot,'projection leaves the native state alone');});
check('A mirrored step, a reposition, a seek and a slow step carry no observation',()=>{
 h.call('Native130.chase',{team:0,size:'standard',turned:false});h.call('Native130.advance');assert(currentFrame().players.some(p=>p.movement?.observedFacing),'baseline observation');
 h.run('match.halftimeBreakDone=!match.halftimeBreakDone');assert(currentFrame().players.every(p=>p.movement?.observedFacing===undefined),'the mirroring changed since the step');
 h.run('match.halftimeBreakDone=!match.halftimeBreakDone');h.run('const v151Mirror=step;step=function(...a){match.halftimeBreakDone=!match.halftimeBreakDone;return v151Mirror.apply(this,a);};');h.call('Native130.advance');h.run('match.halftimeBreakDone=!match.halftimeBreakDone');assert(currentFrame().players.every(p=>p.movement?.observedFacing===undefined),'a step across the mirroring observes nothing');
 h.run('step=v151BaseStep;step=function(...a){return v151WrapStep(v151BaseStep,this,a);};');
 h.run('const v151Jump=step;step=function(...a){const r=v151Jump.apply(this,a);for(const p of match.people)if(!p.keeper)p.x+=.3;return r;};');h.call('Native130.advance');assert(currentFrame().players.every(p=>p.movement?.observedFacing===undefined),'a reposition within one step observes nothing');
 h.run('step=function(...a){return v151WrapStep(v151BaseStep,this,a);};');h.call('Native130.chase',{team:0,size:'standard',turned:false});h.call('Native130.advance');assert(currentFrame().players.some(p=>p.movement?.observedFacing),'observed again after a normal step of fresh bodies');
 h.run('v102State(match).clock-=.5');assert(currentFrame().players.every(p=>p.movement?.observedFacing===undefined),'a seek leaves none');
 h.run('v102State(match).clock+=.5;for(const p of match.people){const b=v157Body(p);b.vx=.05;b.vy=.05;}');h.call('Native130.advance');assert(currentFrame().players.every(p=>p.movement?.observedFacing===undefined),'a slow step stays below 1.2 m/s');});
check('Actual JSON snapshot carries no observed travel fields',()=>{const context=h.call('Native130.context');assert(h.call('v65Snapshot',context));assert(!/observedFacing|observedSpeed|v151Steps|v151Travel/.test(JSON.stringify(context.state.physicalSnapshot)));});
console.log(JSON.stringify({pass:true,suite:'observed-facing-r132',checks:checks.length,cases:checks,scope:'Production bridge projection on the real native producer; no full-match or visual acceptance claim.'}));
