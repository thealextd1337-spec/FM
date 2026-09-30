'use strict';

// Read-only projection of the existing physical match. No match clock or rules.
function v98PitchPoint(point,turned=false){
 const x=turned?1-point.x:point.x,y=turned?1-point.y:point.y;
 return {x:(.5-y)*68/(v55Field.bottom-v55Field.top),z:(x-.5)*44/(v55Field.right-v55Field.left)};
}
function v98PitchFrame(current){
 const turned=Boolean(current.halftimeBreakDone),scene=current.goalPause>0&&current.goalScene;
 const rawBall=scene?v83GoalPosition(scene):current.ball;
 const height=scene?rawBall.height*68/688:current.flight?.aerial?Math.sin(Math.PI*Math.min(1,current.flight.progress))*5.34:0;
 const ball=v98PitchPoint(rawBall,turned);
 // The engine's offset fits its large 2D disks. Keep possession at the 3D feet.
 if(current.owner&&!scene&&!current.flight&&!current.rebound&&!current.setPiece&&!current.throwIn&&!current.kickoff&&!current.postBanner&&!current.halftimePause&&!current.finished){
  const owner=v98PitchPoint(current.owner,turned),dx=ball.x-owner.x,dz=ball.z-owner.z,gap=Math.hypot(dx,dz);
  const direction=(current.owner.t===0?1:-1)*(turned?-1:1);
  ball.x=owner.x+(gap>0?dx/gap:direction)*.65;ball.z=owner.z+(gap>0?dz/gap:0)*.65;
 }
 return {
  elapsed:current.elapsed,turned,
  players:current.people.map(person=>({id:person.pid,person,team:person.t,number:person.n,keeper:person.keeper,...v98PitchPoint(person,turned)})),
  ball:{...ball,height:.29+Math.max(0,height)},
  owner:current.owner?.pid||null,
  offside:current.offsideVisual?{...v98PitchPoint(current.offsideVisual,turned),lineX:v98PitchPoint({x:.5,y:current.offsideVisual.lineY},turned).x,signal:v55OffsideSignal(turned?{...current.offsideVisual,x:1-current.offsideVisual.x}:current.offsideVisual,current.setPiece?.positionElapsed||0)}:null
 };
}

function v98HomeSponsor(context){
 const home=context.career.world.clubs.find(club=>club.id===context.fixture.homeId),sponsor=home?.sponsors?.find(item=>item.id===home.sponsorId);
 return sponsor?{clubId:home.id,name:sponsor.name,svg:v66SponsorLogoSVG(home.countryId,sponsor,true)}:null;
}

function v98CameraAim(ball,mode,aspect){
 const limit=(value,min,max)=>Math.max(min,Math.min(max,value));
 const fov=mode==='wide'?46:42;
 const adaptedFov=2*Math.atan(Math.tan(fov*Math.PI/360)*Math.min(1,1.85/aspect))*180/Math.PI;
 if(mode==='wide')return {position:{x:limit(ball.x*.56,-17,17),y:32,z:49+Math.max(0,1.55-aspect)*28},target:{x:limit(ball.x*.56,-17,17),y:0,z:limit(ball.z*.1,-2,2)-2},fov:adaptedFov};
 // A continuous half-centre avoids a jump when the ball crosses midfield.
 const halfCentre=17*Math.tanh(ball.x/8),beyondHalfCentre=Math.max(0,Math.abs(ball.x)-17);
 return {position:{x:limit(ball.x*.28,-9,9),y:24,z:37+Math.max(0,1.55-aspect)*20},
  target:{x:halfCentre*.65+ball.x*.35+Math.sign(ball.x)*Math.min(4,beyondHalfCentre*.18),y:Math.min(1.2,Math.max(0,ball.height-.29)*.18),z:limit(ball.z*.35,-6.5,6.5)},fov:adaptedFov};
}
function v98BlendCamera(previous,desired,dt){
 if(!previous)return {position:{...desired.position},target:{...desired.target},fov:desired.fov};
 const blend=(a,b,rate)=>a+(b-a)*(1-Math.exp(-Math.max(0,dt)*rate)),pose={position:{},target:{},fov:blend(previous.fov,desired.fov,2.8)};
 for(const axis of ['x','y','z']){pose.position[axis]=blend(previous.position[axis],desired.position[axis],1.8);pose.target[axis]=blend(previous.target[axis],desired.target[axis],3.6);}
 return pose;
}

const v98Style=document.createElement('style');
v98Style.textContent=`
.v98-view-controls{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;flex-wrap:wrap}
.v98-view-controls button,.v98-view-controls select{min-height:44px;padding:8px 13px;border:1px solid #536b6b;border-radius:6px;background:#203b3e;color:#eaf4ef;font:inherit;font-size:12px;font-weight:700}
.v98-view-controls button[aria-pressed="true"]{background:#c7f36b;color:#142629;border-color:#c7f36b}
.v98-view-controls small{color:#bad0cc;font-size:11px}
body.v98-pitch3d #match-area .v42-pitch-stage{width:min(100%,840px);aspect-ratio:16/9;padding:0;overflow:hidden;background:#718b6d}
body.v98-pitch3d #match-area #canvas{visibility:hidden;pointer-events:none}
body.v98-pitch3d #v65-adboards{clip-path:inset(50%);width:1px;height:1px;overflow:hidden;pointer-events:none}
#v98-canvas{display:block;position:absolute;inset:0;width:100%;height:100%;cursor:pointer}
#v98-player-labels{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}
#v98-player-labels button{position:absolute;transform:translate(-50%,0);max-width:62px;padding:1px 3px;border:0;border-radius:2px;background:#122b30bf;color:#f3f8ed;font:bold 8px/12px Arial;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;pointer-events:auto;min-height:14px}
#v98-player-labels button:focus-visible{outline:2px solid #fff;outline-offset:1px}
@media (orientation:landscape) and (max-height:500px){body.v98-pitch3d #match-area .v42-pitch-stage{width:min(100%,840px)}}
`;
document.head.append(v98Style);
const v98Orientation=window.matchMedia('(orientation:landscape)');
let v98View='3d',v98CameraMode='follow',v98CameraPose=null,v98Scene=null,v98Match=null,v98Failed=false,v98LastTime=0,v98Frame=null;
const v98Players=new Map();
let v98Offside=null,v98Offender=null,v98Assistant=null,v98Flag=null;
const v98Audio={enabled:false,context:null,buffers:null,ambient:null,active:new Set(),loading:null,match:null,last:null};
function v98Text(de,en){return window.doppel6Language?.get()==='en'?en:de}
function v98IsWorld(){return Boolean(v65WorldActive&&match&&!$('#game-screen').hidden&&document.body.classList.contains('v65-world-match'))}
function v98Toolbar(){
 let toolbar=$('#v98-view-controls');
 if(!toolbar){
  toolbar=document.createElement('nav');toolbar.id='v98-view-controls';toolbar.className='v98-view-controls';toolbar.setAttribute('aria-label',v98Text('Spielfelddarstellung','Pitch view'));
  toolbar.innerHTML='<button type="button" data-v98-view="3d">3D · TV</button><button type="button" data-v98-view="2d">2D</button><select id="v98-camera"><option value="follow"></option><option value="wide"></option></select><button type="button" id="v98-sound"></button><small id="v98-status" role="status"></small>';
  $('#match-area .v42-pitch-stage').before(toolbar);
  toolbar.addEventListener('click',event=>{
   const button=event.target.closest('button');if(!button)return;
   if(button.dataset.v98View){v98View=button.dataset.v98View;v98Failed=false;draw();}
   else if(button.id==='v98-sound')v98ToggleSound();
  });
  toolbar.querySelector('#v98-camera').addEventListener('change',event=>{v98CameraMode=event.target.value;v98View='3d';v98Failed=false;draw();});
 }
 toolbar.hidden=!v98IsWorld();
 toolbar.setAttribute('aria-label',v98Text('Spielfelddarstellung','Pitch view'));
 const pitchLabel=v98Text('3D-Fußballspiel aus Sicht der TV-Kamera','3D football match from the TV camera');
 if($('#v98-canvas')?.getAttribute('aria-label')!==pitchLabel)$('#v98-canvas')?.setAttribute('aria-label',pitchLabel);
 toolbar.querySelector('[data-v98-view="3d"]').disabled=!v98Orientation.matches;
 const cameraSelect=toolbar.querySelector('#v98-camera');cameraSelect.value=v98CameraMode;cameraSelect.disabled=!v98Orientation.matches;cameraSelect.setAttribute('aria-label',v98Text('TV-Kamera','TV camera'));
 cameraSelect.querySelector('[value="follow"]').textContent=v98Text('TV nah · Mitfahrt','Close TV · Tracking');cameraSelect.querySelector('[value="wide"]').textContent=v98Text('TV weit · Übersicht','Wide TV · Overview');
 for(const button of toolbar.querySelectorAll('[data-v98-view]'))button.setAttribute('aria-pressed',String(button.dataset.v98View===(document.body.classList.contains('v98-pitch3d')?'3d':'2d')));
 toolbar.querySelector('#v98-sound').textContent=v98Text(v98Audio.enabled?'Ton aus':'Ton einschalten',v98Audio.enabled?'Mute sound':'Enable sound');
 toolbar.querySelector('#v98-sound').setAttribute('aria-pressed',String(v98Audio.enabled));
 toolbar.querySelector('#v98-status').textContent=v98Failed?v98Text('3D nicht verfügbar · 2D aktiv','3D unavailable · using 2D'):!v98Orientation.matches?v98Text('3D im Querformat','3D in landscape'):'';
 return toolbar;
}
function v98Dispose(){
 v98Scene?.dispose();v98Scene=null;v98Match=null;v98Players.clear();v98Frame=null;v98CameraPose=null;
 $('#v98-canvas')?.remove();$('#v98-player-labels')?.remove();
 v98Offside=v98Offender=v98Assistant=v98Flag=null;
 if(document.body.classList.contains('v98-pitch3d'))document.body.classList.remove('v98-pitch3d');
}
function v98Create(){
 const canvas=document.createElement('canvas');canvas.id='v98-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',v98Text('3D-Fußballspiel aus Sicht der TV-Kamera','3D football match from the TV camera'));
 $('#match-area .v42-pitch-stage').prepend(canvas);
 try{v98Scene=window.D6PitchScene.create(canvas,{goalWidth:44*.2/(v55Field.right-v55Field.left),advertising:v98HomeSponsor(v65Context())});}catch(error){canvas.remove();throw error;}
 const labels=document.createElement('div');labels.id='v98-player-labels';canvas.after(labels);
 labels.addEventListener('click',event=>{const label=event.target.closest('[data-v98-player]'),person=match?.people.find(item=>item.pid===label?.dataset.v98Player);if(person)v59OpenLivePlayer(person)});
 canvas.addEventListener('click',event=>{
  if(!running||!v98Frame)return;
  const rect=canvas.getBoundingClientRect();let selected=null,distance=28;
  for(const [id,visual]of v98Players){const point=new THREE.Vector3(visual.root.position.x,1.2,visual.root.position.z).project(v98Scene.camera),x=rect.left+(point.x+1)*rect.width/2,y=rect.top+(1-point.y)*rect.height/2,next=Math.hypot(event.clientX-x,event.clientY-y);if(point.z<1&&next<distance){selected=match.people.find(person=>person.pid===id);distance=next}}
  if(selected)v59OpenLivePlayer(selected);
 });
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();v98Failed=true;v98Dispose();draw();});
 const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.12,-22),new THREE.Vector3(0,.12,22)]);
 v98Offside=new THREE.Line(geometry,new THREE.LineDashedMaterial({color:'#ffda68',dashSize:.8,gapSize:.5}));v98Offside.computeLineDistances();v98Scene.scene.add(v98Offside);
 v98Offender=new THREE.Mesh(new THREE.RingGeometry(1,1.13,32),new THREE.MeshBasicMaterial({color:'#ffda68',side:THREE.DoubleSide}));v98Offender.rotation.x=-Math.PI/2;v98Scene.scene.add(v98Offender);
 v98Assistant=v98Scene.player(0,0,0,24,false,{main:'#f1ca4a',trim:'#182c36'});v98Assistant.root.visible=false;
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.55,6),new THREE.MeshStandardMaterial({color:'#f3f5e9'}));pole.position.set(0,-.83,0);v98Assistant.limbs[1].add(pole);
 v98Flag=new THREE.Mesh(new THREE.BoxGeometry(.45,.32,.04),new THREE.MeshBasicMaterial({color:['#ffd85c','#f79053','#eaff9b'][match.refereeVariant||0]}));v98Assistant.limbs[1].add(v98Flag);
 v98Match=match;v98LastTime=performance.now();
}
function v98Kit(person){return person.keeper?(person.t===0?match.kits?.userKeeper:match.kits?.opponentKeeper):(person.t===0?match.kits?.user:match.kits?.opponent)}
function v98RenderScene(){
 const world=v98IsWorld();
 if(!world){v98Dispose();if($('#v98-view-controls'))$('#v98-view-controls').hidden=true;v98SyncAudio(false);return;}
 const active=v98View==='3d'&&v98Orientation.matches&&!v98Failed;
 if(!active){document.body.classList.remove('v98-pitch3d');if($('#v98-canvas'))$('#v98-canvas').hidden=true;if($('#v98-player-labels'))$('#v98-player-labels').hidden=true;v98Toolbar();v98SyncAudio();return;}
 try{
  if(v98Match!==match){v98Dispose();v98Create();}
  document.body.classList.add('v98-pitch3d');$('#v98-canvas').hidden=false;$('#v98-player-labels').hidden=false;
  const {renderer,camera,ballRoot,ball,ballShadow,ownerRing}=v98Scene,canvas=$('#v98-canvas'),rect=canvas.parentElement.getBoundingClientRect();
  if(!rect.width||!rect.height){v98Toolbar();v98SyncAudio();return;}
  const width=Math.round(rect.width),height=Math.round(rect.height);if(renderer.domElement.width!==Math.round(width*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(height*renderer.getPixelRatio()))renderer.setSize(width,height,false);
  camera.aspect=width/height;
  const now=performance.now(),dt=Math.min(.1,Math.max(0,(now-v98LastTime)/1000));v98LastTime=now;
  const frame=v98PitchFrame(match),live=running&&!v47PlayerDialog.open&&contextPhaseLive();
  const ids=new Set(frame.players.map(person=>person.id));
  for(const [id,visual]of v98Players)if(!ids.has(id)){v98Scene.removePlayer(visual);visual.label.remove();v98Players.delete(id);}
  for(const person of frame.players){
   let visual=v98Players.get(person.id);
   if(!visual){
    visual=v98Scene.player(person.team,person.number,person.x,person.z,person.keeper,v98Kit(person.person));
    const label=document.createElement('button');label.type='button';label.dataset.v98Player=person.id;label.textContent=`${person.number} ${person.person.name.split(' ').at(-1)}`;label.setAttribute('aria-label',`${person.person.name} · ${v98Text('Live-Spielerinfo','Live player information')}`);$('#v98-player-labels').append(label);visual.label=label;v98Players.set(person.id,visual);
   }
   const dx=person.x-visual.previous.x,dz=person.z-visual.previous.z,speed=live?Math.min(8,Math.hypot(dx,dz)/Math.max(dt,.001)):0;
   if(speed>.1){const target=Math.atan2(dx,dz);visual.heading+=Math.atan2(Math.sin(target-visual.heading),Math.cos(target-visual.heading))*Math.min(1,dt*9);}
   else if(!v98Frame||v98Frame.turned!==frame.turned)visual.heading=(person.team===0?1:-1)*(frame.turned?-1:1)*Math.PI/2;
   visual.root.position.set(person.x,0,person.z);visual.root.rotation.y=visual.heading;
   if(live){const stride=Math.sin(frame.elapsed*12+person.number)*.52*Math.min(1,speed/2.6);visual.limbs[0].rotation.x=stride;visual.limbs[2].rotation.x=-stride;visual.limbs[1].rotation.x=-stride*.7;visual.limbs[3].rotation.x=stride*.7;visual.body.position.y=Math.abs(stride)*.12;}
   visual.body.rotation.z=person.person.slideActive?1.1:0;visual.previous={x:person.x,z:person.z};
   visual.label.disabled=!live;
   const label=`${person.person.name} · ${v98Text('Live-Spielerinfo','Live player information')}`;if(visual.label.getAttribute('aria-label')!==label)visual.label.setAttribute('aria-label',label);
  }
  ballRoot.position.set(frame.ball.x,frame.ball.height,frame.ball.z);ball.rotation.z=-frame.elapsed*4;ball.rotation.x=frame.elapsed*2;
  ballShadow.position.set(frame.ball.x,.105,frame.ball.z);ballShadow.scale.setScalar(1+(frame.ball.height-.29)*.09);ballShadow.material.opacity=.38/(1+frame.ball.height*.2);
  const owner=v98Players.get(frame.owner);ownerRing.visible=Boolean(owner);if(owner)ownerRing.position.set(owner.root.position.x,.11,owner.root.position.z);
  v98Offside.visible=v98Offender.visible=v98Assistant.root.visible=Boolean(frame.offside);
  if(frame.offside){
   const signal=frame.offside.signal,angle={raised:Math.PI,far:Math.PI*.75,middle:Math.PI*.5}[signal.pose];
   v98Offside.position.x=frame.offside.lineX;v98Offender.position.set(frame.offside.x,.13,frame.offside.z);
   v98Assistant.root.position.set(frame.offside.lineX,0,signal.left?-24:24);v98Assistant.root.rotation.y=signal.left?0:Math.PI;v98Assistant.limbs[1].rotation.z=angle;
   // Keep the cloth hanging down while the shared signal lowers the flagpole.
   v98Flag.position.set(-.16*Math.sin(angle),-1.05-.16*Math.cos(angle),0);v98Flag.rotation.z=-angle;
  }
  v98CameraPose=v98BlendCamera(v98CameraPose,v98CameraAim(frame.ball,v98CameraMode,camera.aspect),dt);
  const pose=v98CameraPose;
  camera.position.set(pose.position.x,pose.position.y,pose.position.z);camera.fov=pose.fov;camera.updateProjectionMatrix();camera.lookAt(pose.target.x,pose.target.y,pose.target.z);
  renderer.render(v98Scene.scene,camera);
  for(const visual of v98Players.values()){const point=new THREE.Vector3(visual.root.position.x,.25,visual.root.position.z).project(camera);visual.label.hidden=point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1;visual.label.style.left=`${(point.x+1)*50}%`;visual.label.style.top=`${(1-point.y)*50+1.8}%`;}
  v98Frame=frame;v98Toolbar();v98SyncAudio();
 }catch(error){console.warn('3D pitch unavailable',error);v98Failed=true;v98Dispose();v98Toolbar();v98SyncAudio();}
}
function contextPhaseLive(){return v65Context()?.state.phase==='live'}
// Three.js allocates random UUIDs. Give graphics a separate stream so creating
// or switching a view cannot consume the simulation's next random decision.
let v98VisualSeed=98;
function v98Render(){
 const simulationRandom=Math.random;
 Math.random=()=>{v98VisualSeed=(v98VisualSeed*1664525+1013904223)>>>0;return v98VisualSeed/4294967296;};
 try{return v98RenderScene();}finally{Math.random=simulationRandom;}
}

// Optional SuperCollider samples, triggered only by existing match events.
async function v98ToggleSound(){
 if(v98Audio.enabled){v98Audio.enabled=false;v98SyncAudio(false);v98Toolbar();return;}
 try{
  if(!v98Audio.buffers){
   if(!v98Audio.loading)v98Audio.loading=(async()=>{
    const AC=window.AudioContext||window.webkitAudioContext;v98Audio.context=new AC();await v98Audio.context.resume();
    const buffers={};await Promise.all(['pass','shot','whistle','crowd','cheer','net'].map(async name=>{let bytes;if(window.D6_AUDIO?.[name]){bytes=Uint8Array.from(atob(window.D6_AUDIO[name]),char=>char.charCodeAt(0)).buffer;}else{const response=await fetch(`camera-prototype/audio/${name}.wav`);if(!response.ok)throw Error('Audio unavailable');bytes=await response.arrayBuffer();}buffers[name]=await v98Audio.context.decodeAudioData(bytes);}));v98Audio.buffers=buffers;
   })();
   await v98Audio.loading;
  }
  v98Audio.enabled=true;v98Audio.last=null;v98SyncAudio();v98Toolbar();
 }catch(error){v98Audio.loading=null;v98Audio.enabled=false;v98Toolbar();$('#v98-status').textContent=v98Text('Ton nicht verfügbar','Sound unavailable');}
}
function v98Sound(name,level=.65){
 const source=v98Audio.context.createBufferSource(),gain=v98Audio.context.createGain();source.buffer=v98Audio.buffers[name];gain.gain.value=level;source.connect(gain);gain.connect(v98Audio.context.destination);v98Audio.active.add(source);source.onended=()=>{v98Audio.active.delete(source);source.disconnect();gain.disconnect();};source.start();
}
function v98SyncAudio(allow=true){
 const audible=allow&&v98Audio.enabled&&v98Audio.buffers&&v98IsWorld()&&running&&contextPhaseLive()&&!v47PlayerDialog.open&&!document.hidden&&!$('#match-area').hidden;
 if(!audible){if(v98Audio.ambient){v98Audio.ambient.stop();v98Audio.ambient=null;}for(const source of v98Audio.active)source.stop();v98Audio.active.clear();if(v98Audio.context?.state==='running')v98Audio.context.suspend();v98Audio.last=null;return;}
 v98Audio.context.resume();
 if(!v98Audio.ambient){const source=v98Audio.context.createBufferSource(),gain=v98Audio.context.createGain();source.buffer=v98Audio.buffers.crowd;source.loop=true;gain.gain.value=.1;source.connect(gain);gain.connect(v98Audio.context.destination);source.onended=()=>{source.disconnect();gain.disconnect();};source.start();v98Audio.ambient=source;}
 const stats={goals:match.goals.length,shots:match.shots.reduce((a,b)=>a+b,0),passes:match.people.reduce((n,person)=>n+(person.stats.passes||0),0),stoppage:match.setPiece?.type||match.throwIn&&'throwIn'||match.halftimePause>0&&'halftime'||match.kickoff?.phase};
 if(v98Audio.match===match&&v98Audio.last){const last=v98Audio.last;if(stats.goals>last.goals){v98Sound('net');v98Sound('cheer',.6);}else if(stats.shots>last.shots)v98Sound('shot');else if(stats.passes>last.passes)v98Sound('pass',.4);if(stats.stoppage!==last.stoppage&&['corner','freeKick','penalty','halftime'].includes(stats.stoppage))v98Sound('whistle',.5);}
 v98Audio.match=match;v98Audio.last=stats;
}
const v98PreviousDraw=draw;
draw=function(){const result=v98PreviousDraw();v98Render();return result;};
const v98PreviousControls=v65UpdateControls;
v65UpdateControls=function(context){const result=v98PreviousControls(context);v98Render();return result;};
v98Orientation.addEventListener('change',()=>{if(v98IsWorld())draw();});
new ResizeObserver(()=>{if(v98IsWorld())draw();}).observe($('#match-area .v42-pitch-stage'));
new MutationObserver(()=>{if(!v98IsWorld()){v98Dispose();v98SyncAudio(false);if($('#v98-view-controls'))$('#v98-view-controls').hidden=true;}}).observe(document.body,{attributes:true,attributeFilter:['class']});
new MutationObserver(()=>{if(!v98IsWorld()){v98Dispose();v98SyncAudio(false);if($('#v98-view-controls'))$('#v98-view-controls').hidden=true;}}).observe($('#game-screen'),{attributes:true,attributeFilter:['hidden']});
document.addEventListener('visibilitychange',()=>v98SyncAudio());
v47PlayerDialog.addEventListener('close',()=>v98SyncAudio());
new MutationObserver(()=>v98SyncAudio()).observe(v47PlayerDialog,{attributes:true,attributeFilter:['open']});
window.d6Pitch3D={getState:()=>({view:document.body.classList.contains('v98-pitch3d')?'3d':'2d',landscape:v98Orientation.matches,available:!v98Failed,players:v98Players.size,frame:v98Frame?{elapsed:v98Frame.elapsed,turned:v98Frame.turned,ball:{...v98Frame.ball},players:v98Frame.players.map(({id,x,z,number})=>({id,x,z,number})),offside:v98Frame.offside?{...v98Frame.offside}:null}:null,camera:v98CameraPose?{mode:v98CameraMode,position:{...v98CameraPose.position},target:{...v98CameraPose.target},fov:v98CameraPose.fov}:null,audioEnabled:v98Audio.enabled,audioLoaded:Boolean(v98Audio.buffers),ambient:Boolean(v98Audio.ambient),activeSounds:v98Audio.active.size,drawCalls:v98Scene?.renderer.info.render.calls||0})};
