'use strict';
// Native SI 183 scenes. Builds on native182-scenes.cjs (loose balls, pursuit) and
// adds matches made by the actual constructor v65CreateMatch on a v61 career,
// with optional SI overrides (packages/params/clockRate), deterministic tactical
// roles and JSON checkpoints. Runs the actual dist controllers in the native130
// VM harness; also against pre-183 base trees (no v183 functions there).
const fs=require('node:fs'),path=require('node:path'),{create:create182}=require('./native182-scenes.cjs'),{root}=require('./native130-harness.cjs');

function inContext(){
 const N=Native182;let active=null;
 const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
 // Deterministic roles for constructed matches (v61 careers carry none). The
 // same assignment is made on base and current trees. v61 players also carry no
 // calm/ant/dec, so v183Personality uses its fallback 10 for them.
 const roleCycle=['poacher','playmaker','winger','ball-winner','stopper','striker','box-to-box','dribbler','cover-defender','target-player','ball-playing-defender'];
 function assignRoles(m){let i=0;for(const p of m.people){if(p.keeper)continue;p.tacticalRole=roleCycle[i++%roleCycle.length];p.positionRoutine=.6;}}
 // config: {club,seed,size,roles,si,stamp}. si: undefined = constructor default,
 // false = no marker 183, object = {packages,params,clockRate} overrides.
 // stamp:false removes the 183 world stamp (a career of release 132): the
 // constructor default then writes no marker (work/test-si-newworld-v183.cjs).
 // The large pitch uses six field players as in production careers.
 // ball:false leaves the ball-physics marker 184 out (constructor option, see v65CreateMatch).
 function constructed({club='GER-2',seed='si183',size='standard',roles=false,si,stamp=true,ball}={}){
  let h=0;for(const ch of `${club}:${seed}:${size}`)h=(Math.imul(h,31)+ch.charCodeAt(0))>>>0;
  N.seedRandom(h||1);
  const career=v61CreateCareer(club,`native183-${seed}`);career.world.matchConfig={version:1,fieldSize:size,fieldPlayers:size==='large'?6:5};
  if(!stamp)delete career.world.siRevision;
  const fixture=v62Fixtures(career).find(f=>f.homeId===club||f.awayId===club);
  v64PrepareFixture(career,fixture);const state=v64MakeState(career,fixture);career.world.activeMatch={fixtureId:fixture.id,state};
  v61CurrentCareer=career;active={career,fixture,state,ownSide:fixture.homeId===club?0:1};v65WorldActive=active;state.phase='live';
  const options={};if(si!==undefined)options.si=si;if(ball===false)options.ball=false;
  v65CreateMatch(active,Object.keys(options).length?options:undefined);
  if(roles)assignRoles(match);
  return match;
 }
 // Clock units per real step from the match rate (MATCH_SPEED without SI).
 function advance(dt=.05){
  const clock=v102Clock(match),rate=typeof v183Rate==='function'?v183Rate(match):MATCH_SPEED;step(dt*rate,dt);
  if(Math.abs(v102Clock(match)-clock-dt)>1e-8)throw Error('Native clock did not advance once');
  for(const p of match.people)if(![p.x,p.y,p.tx,p.ty].every(Number.isFinite))throw Error('Nonfinite player');
 }
 function run(ticks){let n=0;for(;n<ticks&&!match.finished;n++)advance();return n;}
 // Full native state incl. continuation, P02 load and random draws. withoutSi
 // drops only the marker object for the "all packages off = 182" comparison.
 function digest({withoutSi=false}={}){
  const {people,exitedPeople,owner,lastPass,breakawayCarrier,slide,nativeContactClock,si,...rest}=match,player=p=>{const{playerModel,...plain}=p;return plain};
  const rng=N.rng();
  return JSON.stringify(canonical({...rest,...(si!==undefined&&!withoutSi?{si}:{}),people:people.map(player),exitedPeople:(exitedPeople||[]).map(player),owner:owner?.pid||null,lastPass:lastPass?{passer:lastPass.passer?.pid,receiver:lastPass.receiver?.pid,at:lastPass.at}:null,breakawayCarrier:breakawayCarrier?.pid||null,slide:slide?{...slide,tackler:slide.tackler?.pid,victim:slide.victim?.pid}:null,continuation:v160SnapshotContinuation(match),clock:v102Clock(match),load:active.state.playerLoad,fresh:active.state.fresh,rng:rng.value,draws:rng.draws}));
 }
 // JSON checkpoint through the actual v65Snapshot/v65Restore; returns false
 // while a flight or slide forbids a snapshot.
 function checkpoint(){
  if(!v65Snapshot(active))return false;
  active.state.physicalSnapshot=JSON.parse(JSON.stringify(active.state.physicalSnapshot));match=null;
  if(!v65Restore(active))throw Error('Restore failed');
  return true;
 }
 function savedMatch(){return active.state.physicalSnapshot?.match||null;}
 // Constructed scene list: seeds x sizes x roles.
 function constructedScenes(){const list=[];
  for(const [club,seed]of [['GER-2','a'],['ENG-4','b'],['ESP-1','c']])for(const size of ['standard','large'])for(const roles of [false,true])list.push({id:`${club}:${seed}:${size}:${roles?'roles':'plain'}`,config:{club,seed,size,roles}});
  return list;}
 // Digest after each segment; the scene continues natively between them.
 function constructedDigest(scene,{si,ball,withoutSi=false,segments=[300,300,300]}={}){
  constructed({...scene.config,si,ball});const out=[];
  for(const ticks of segments){run(ticks);out.push(digest({withoutSi}));if(match.finished)break;}
  return out.join('\n');}
 // v182 scenes with their 182 markers (loose ball, pursuit); base comparison.
 function marked182Scenes(){const list=[];
  for(const kind of ['static','rolling','diagonal','rebound','air'])for(const team of [0,1])for(const size of ['standard','large'])for(const seed of [0,3,4])list.push({id:`loose182:${kind}:${team}:${size}:${seed}`,type:'loose',config:{kind,team,size,seed,marker:true}});
  N.pursuitScenes(true).forEach((scene,i)=>{if(i%9===0)list.push({id:'pursuit182:'+scene.id,type:'pursuit',config:scene});});
  return list;}
 globalThis.Native183={constructed,assignRoles,advance,run,digest,checkpoint,savedMatch,constructedScenes,constructedDigest,marked182Scenes,context:()=>active,si:()=>typeof v183CreateSi==='function'};
}
function create(options){
 // Constructed matches score goals: load the goal scene in production order.
 const h=create182({...options,goalScene:true}),foundation=fs.readFileSync(path.join(root,'dist/world-foundation-v61.js'),'utf8'),end=foundation.indexOf('const v61Panel=');
 if(end<0)throw Error('world-foundation-v61 boundary');
 // Career construction only; the panel/UI part of the foundation is not loaded.
 h.run(foundation.slice(0,end),'world-foundation-v61.js');
 h.run('('+inContext.toString()+')()','native183-scenes');
 // Test mode: reading an SI parameter for a match without marker 183 is an error.
 h.run("if(typeof v183StrictParams==='function')v183StrictParams(true);",'native183-strict');
 return h;
}
module.exports={create,inContext};
