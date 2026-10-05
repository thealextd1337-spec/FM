'use strict';

// Read-only projection of the existing physical match. No match clock or rules.
function v98PitchPoint(point,turned=false){
 const x=turned?1-point.x:point.x,y=turned?1-point.y:point.y;
 return {x:(.5-y)*68/(v55Field.bottom-v55Field.top),z:(x-.5)*44/(v55Field.right-v55Field.left)};
}
function v98PitchFrame(current){
 const turned=Boolean(current.halftimeBreakDone),scene=current.goalPause>0&&current.goalScene;
 const actionBall=typeof v99BallView==='function'?v99BallView(current):null;
 const rawBall=actionBall||(scene?v83GoalPosition(scene):current.ball);
 const height=actionBall?Math.max(0,actionBall.elevation-.29):scene?rawBall.height*68/688:current.flight?.aerial?Math.sin(Math.PI*Math.min(1,current.flight.progress))*5.34:0;
 const ball=v98PitchPoint(rawBall,turned);
 const restartFacing=Boolean(current.throwIn||current.setPiece?.type==='corner'||current.owner?.keeper&&v99Actions.get(current)?.kicks.get(current.owner.pid)?.phase==='waiting');
 const restartTaker=current.throwIn?.taker||current.setPiece?.taker||current.owner;
 // The engine's offset fits its large 2D disks. Keep possession at the 3D feet.
 if(current.owner&&!actionBall&&!scene&&!current.flight&&!current.rebound&&!current.setPiece&&!current.throwIn&&!current.kickoff&&!current.postBanner&&!current.halftimePause&&!current.finished&&!(typeof v123OwnedBall==='function'&&v123OwnedBall(current))){
  const owner=v98PitchPoint(current.owner,turned),dx=ball.x-owner.x,dz=ball.z-owner.z,gap=Math.hypot(dx,dz);
  const direction=(current.owner.t===0?1:-1)*(turned?-1:1);
  ball.x=owner.x+(gap>0?dx/gap:direction)*.65;ball.z=owner.z+(gap>0?dz/gap:0)*.65;
 }
 return {
  elapsed:current.elapsed,clock:typeof v102Clock==='function'?v102Clock(current):0,turned,broadcast:typeof v132Broadcast==='function'?v132Broadcast(current):null,
  celebration:scene?{id:current.goals.length,team:scene.team,time:Math.max(0,v83GoalSceneDuration-current.goalPause)}:null,
  players:current.people.map(person=>{const mode=restartFacing&&person!==restartTaker?{mode:'restart',facing:rawBall}:typeof v108MovementMode==='function'?v108MovementMode(current,person):null;return {id:person.pid,person,team:person.t,number:person.n,keeper:person.keeper,slideActive:Boolean(person.slideActive),action:typeof v102PlayerAction==='function'?v102PlayerAction(current,person):null,movement:mode?{...mode,facing:v98PitchPoint(mode.facing,turned)}:null,...v98PitchPoint(person,turned)}}),
  ball:{...ball,height:.29+Math.max(0,height),opacity:actionBall?.opacity??1},
  owner:current.owner?.pid||null,ballInFlight:Boolean(current.flight),carrying:Boolean(current.owner&&!scene&&!current.flight&&!current.rebound&&!current.setPiece&&!current.throwIn&&!current.kickoff&&!current.postBanner&&!current.halftimePause&&!current.finished),
  outOfPlayBall:Boolean(v99Actions.get(current)?.miss&&v99Actions.get(current).miss.age<1.15||v99Actions.get(current)?.outBall&&v102Clock(current)-v99Actions.get(current).outBall.at<1.15),
  offside:current.offsideVisual?{...v98PitchPoint(current.offsideVisual,turned),lineX:v98PitchPoint({x:.5,y:current.offsideVisual.lineY},turned).x,signal:v55OffsideSignal(turned?{...current.offsideVisual,x:1-current.offsideVisual.x}:current.offsideVisual,current.setPiece?.positionElapsed||0)}:null
 };
}

function v98HomeSponsor(context){
 const home=context.career.world.clubs.find(club=>club.id===context.fixture.homeId),sponsor=home?.sponsors?.find(item=>item.id===home.sponsorId);
 return sponsor?{clubId:home.id,name:sponsor.name,svg:v66SponsorLogoSVG(home.countryId,sponsor,false)}:null;
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
.v98-view-controls{position:absolute;top:8px;right:8px;z-index:7;width:40px;height:40px}
.v98-view-controls button,.v98-view-controls select{min-height:36px;padding:7px 10px;border:1px solid #536b6b;border-radius:6px;background:#203b3e;color:#eaf4ef;font:inherit;font-size:11px;font-weight:700}
.v98-view-controls #v100-pitch-toggle{display:grid;place-items:center;width:40px;height:40px;padding:10px;background:#142b30ed;border-color:#79978c;position:relative}
#v100-pitch-toggle svg{width:20px;height:20px}.v98-view-controls button:hover{background:#2e504d}.v98-view-controls button:focus-visible,.v98-view-controls select:focus-visible{outline:2px solid #c7f36b;outline-offset:2px}
.v98-view-controls[data-status="true"] #v100-pitch-toggle:after{content:'';position:absolute;right:5px;top:5px;width:6px;height:6px;border-radius:50%;background:#ffda68}
#v100-pitch-panel{position:absolute;top:46px;right:0;width:228px;max-width:calc(100vw - 32px);padding:10px;background:#142b30;border:1px solid #536b6b;border-radius:8px;box-shadow:0 8px 22px #0006;display:grid;gap:9px}
.v100-view-row{display:flex;gap:6px}.v100-view-row button{flex:1}.v100-camera-label{display:grid;gap:5px;color:#c6d9d4;font-size:11px;text-align:left}#v98-camera{width:100%}#v98-sound{width:100%}
.v98-view-controls button[aria-pressed="true"]{background:#c7f36b;color:#142629;border-color:#c7f36b}
.v98-view-controls small{color:#bad0cc;font-size:11px;line-height:1.4;text-align:left}.v98-view-controls small:empty{display:none}
.v65-world-match #match-area .v42-pitch-stage{scroll-margin-top:80px}
.v65-world-match #v50-penalty-scene.v100-penalty-award{grid-template-columns:minmax(90px,.4fr) minmax(0,1fr);gap:24px;padding:clamp(16px,4vw,36px);background:#112b30f7}
.v100-penalty-award img{height:min(70%,280px);max-width:100%;width:auto;justify-self:center;align-self:center;image-rendering:pixelated}
.v100-penalty-award h2{margin:0 0 10px;color:#c7f36b;font:900 clamp(36px,7vw,72px)/1 'Barlow Condensed',Impact,sans-serif}
.v100-penalty-award p{margin:0;color:#eaf4ef;font-size:clamp(13px,2vw,18px);font-weight:700;line-height:1.5;text-align:left}
.v65-world-match #v50-penalty-scene .v42-ball{width:20.16px;height:20.16px;font-size:20.16px;right:auto;line-height:20.16px;text-align:center}
.v65-world-match #v50-penalty-scene .v42-ball.wide{animation:none!important}
@media(pointer:coarse){.v98-view-controls{width:44px;height:44px}.v98-view-controls #v100-pitch-toggle{width:44px;height:44px}.v98-view-controls button,.v98-view-controls select{min-height:44px}#v100-pitch-panel{top:50px}}
body.v98-pitch3d #match-area .v42-pitch-stage{width:min(100%,840px);aspect-ratio:16/9;padding:0;overflow:hidden;background:#718b6d}
body.v98-pitch3d #match-area #canvas{visibility:hidden;pointer-events:none}
body.v98-pitch3d #v65-adboards{clip-path:inset(50%);width:1px;height:1px;overflow:hidden;pointer-events:none}
#v98-canvas{display:block;position:absolute;inset:0;width:100%;height:100%;cursor:pointer}
#v98-player-labels{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}
#v98-player-labels button{position:absolute;transform:translate(-50%,0);max-width:62px;padding:1px 3px;border:0;border-radius:2px;background:#122b30bf;color:#f3f8ed;font:bold 8px/12px Arial;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;pointer-events:auto;min-height:14px}
#v98-player-labels button:focus-visible{outline:2px solid #fff;outline-offset:1px}
#v99-expand{position:absolute;right:8px;bottom:8px;z-index:5;display:grid;place-items:center;width:44px;height:44px;padding:10px;background:#142b30e8;color:#f3f8ed;border:1px solid #79978c;border-radius:6px;cursor:pointer}
#v99-expand svg{width:22px;height:22px}#v99-expand:hover{background:#2e504d}#v99-expand:focus-visible{outline:2px solid #c7f36b;outline-offset:2px}
body.v98-pitch3d.v99-expanded main{max-width:1600px}
body.v98-pitch3d.v99-expanded #game-screen .workspace{grid-template-columns:minmax(0,1fr)}
body.v98-pitch3d.v99-expanded #match-area .v42-pitch-stage{width:min(100%,1280px)}
body:not(.v98-pitch3d) #v99-expand{display:none}
@media (orientation:landscape) and (max-height:500px){body.v98-pitch3d #match-area .v42-pitch-stage{width:min(100%,840px)}}
`;
document.head.append(v98Style);
const v98Orientation=window.matchMedia('(orientation:landscape)');
let v98View='3d',v98CameraMode='follow',v98CameraPose=null,v98Scene=null,v98Match=null,v98Failed=false,v98LastTime=0,v98Frame=null;
let v99Expanded=false;
const v98Players=new Map();
let v102Loop=0,v102Painting=false,v102Frames=null,v102PaintCount=0;
function v102StopPaint(){if(v102Loop)cancelAnimationFrame(v102Loop);v102Loop=0;}
function v102Capture(frame,now,live){
 const key=JSON.stringify([frame.turned,frame.elapsed,frame.ball,frame.players.map(p=>[p.id,p.x,p.z,p.action,p.slideActive]),frame.offside]);
 const old=v102Frames;
 if(old&&old.live===live&&frame.clock===old.latest.clock&&key===old.key)return;
 const span=old?frame.clock-old.latest.clock:0;
 const reset=!old||!live||!old.live||span<=0||span>.2||old.latest.turned!==frame.turned;
 v102Frames={previous:reset?frame:old.latest,latest:frame,at:now,span:reset?0:span,key,live};
 if(!reset){
  const latest=new Map(frame.players.map(p=>[p.id,p]));
  v102Frames.previous={...v102Frames.previous,players:v102Frames.previous.players.map(p=>{
   const next=latest.get(p.id)?.action;
   // An already prepared block is at contact: do not rewind its root correction.
   return next&&typeof next.id==='number'&&next.id!==p.action?.id&&!(next.kind==='block'&&p.action?.kind==='block')&&!(p.action?.kind==='airReady'&&['header','control','airLand'].includes(next.kind))?{...p,action:{...next,progress:-Math.min(.08,span)/next.duration}}:p;
  })};
 }
 // Resolve the last part of an incoming air ball against the confirmed contact.
 const incoming=old?.latest.flightVisual;
 if(!reset&&incoming?.meta.high&&incoming.meta.flight!==match.flight&&incoming.meta.endHeight!==incoming.height&&match.setPiece?.type!=='corner'){
  const point=v102FlightBall(incoming.meta,incoming.progress),projected=v98PitchPoint(point,frame.turned);
  v102Frames.previous={...v102Frames.previous,ball:{...projected,height:point.elevation}};
 }
}
function v102PaintNext(){
 if(v102Loop||document.hidden||!running||v47PlayerDialog.open||!contextPhaseLive())return;
 v102Loop=requestAnimationFrame(()=>{v102Loop=0;v102Painting=true;try{v98Render()}finally{v102Painting=false}});
}
let v98Offside=null,v98Offender=null,v98Assistant=null,v98Flag=null;
const v98Audio={enabled:false,context:null,buffers:null,ambient:null,active:new Set(),loading:null,match:null,last:null};
let v100MenuMatch=null;
function v98Text(de,en){return window.doppel6Language?.get()==='en'?en:de}
function v98IsWorld(){return Boolean(v65WorldActive&&match&&!$('#game-screen').hidden&&document.body.classList.contains('v65-world-match'))}
function v100PitchMenu(open,restoreFocus=false){
 const panel=$('#v100-pitch-panel'),toggle=$('#v100-pitch-toggle');if(!panel||!toggle)return;
 if(panel.hidden===open)panel.hidden=!open;
 if(toggle.getAttribute('aria-expanded')!==String(open))toggle.setAttribute('aria-expanded',String(open));
 if(restoreFocus)toggle.focus();
}
document.addEventListener('pointerdown',event=>{const toolbar=$('#v98-view-controls');if(toolbar&&!toolbar.contains(event.target))v100PitchMenu(false)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#v100-pitch-panel')&&!$('#v100-pitch-panel').hidden){event.preventDefault();event.stopPropagation();v100PitchMenu(false,true)}});
function v98Toolbar(){
 let toolbar=$('#v98-view-controls');
 if(!toolbar){
  toolbar=document.createElement('nav');toolbar.id='v98-view-controls';toolbar.className='v98-view-controls';toolbar.setAttribute('aria-label',v98Text('Spielfelddarstellung','Pitch view'));
  toolbar.innerHTML='<button type="button" id="v100-pitch-toggle" aria-expanded="false" aria-controls="v100-pitch-panel" aria-describedby="v98-status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h5m4 0h7M4 12h11m4 0h1M4 18h2m4 0h10"/><circle cx="11" cy="6" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></svg></button><div id="v100-pitch-panel" hidden><div class="v100-view-row"><button type="button" data-v98-view="3d">3D · TV</button><button type="button" data-v98-view="2d">2D</button></div><label class="v100-camera-label"><span id="v100-camera-label"></span><select id="v98-camera"><option value="follow"></option><option value="wide"></option></select></label><button type="button" id="v98-sound"></button><small id="v98-status" role="status"></small></div>';
  $('#match-area .v42-pitch-stage').append(toolbar);
  toolbar.addEventListener('click',event=>{
   const button=event.target.closest('button');if(!button)return;
   if(button.id==='v100-pitch-toggle')v100PitchMenu($('#v100-pitch-panel').hidden);
   else if(button.dataset.v98View){v98View=button.dataset.v98View;v98Failed=false;draw();}
   else if(button.id==='v98-sound')v98ToggleSound();
  });
  toolbar.querySelector('#v98-camera').addEventListener('change',event=>{v98CameraMode=event.target.value;v98View='3d';v98Failed=false;draw();});
 }
 toolbar.hidden=!v98IsWorld();
 if(v100MenuMatch!==match){v100MenuMatch=match;v100PitchMenu(false)}
 toolbar.setAttribute('aria-label',v98Text('Spielfelddarstellung','Pitch view'));
 const toggle=toolbar.querySelector('#v100-pitch-toggle'),menuLabel=v98Text('Darstellung und Ton','View and sound');toggle.setAttribute('aria-label',menuLabel);toggle.title=menuLabel;
 toolbar.querySelector('#v100-camera-label').textContent=v98Text('Kamera','Camera');
 const pitchLabel=v98Text('3D-Fußballspiel aus Sicht der TV-Kamera','3D football match from the TV camera');
 if($('#v98-canvas')?.getAttribute('aria-label')!==pitchLabel)$('#v98-canvas')?.setAttribute('aria-label',pitchLabel);
 toolbar.querySelector('[data-v98-view="3d"]').disabled=!v98Orientation.matches;
 const cameraSelect=toolbar.querySelector('#v98-camera');cameraSelect.value=v98CameraMode;cameraSelect.disabled=!v98Orientation.matches;cameraSelect.setAttribute('aria-label',v98Text('TV-Kamera','TV camera'));
 cameraSelect.querySelector('[value="follow"]').textContent=v98Text('TV nah · Mitfahrt','Close TV · Tracking');cameraSelect.querySelector('[value="wide"]').textContent=v98Text('TV weit · Übersicht','Wide TV · Overview');
 for(const button of toolbar.querySelectorAll('[data-v98-view]'))button.setAttribute('aria-pressed',String(button.dataset.v98View===(document.body.classList.contains('v98-pitch3d')?'3d':'2d')));
 toolbar.querySelector('#v98-sound').textContent=v98Text(v98Audio.enabled?'Ton aus':'Ton einschalten',v98Audio.enabled?'Mute sound':'Enable sound');
 toolbar.querySelector('#v98-sound').setAttribute('aria-pressed',String(v98Audio.enabled));
 toolbar.querySelector('#v98-status').textContent=v98Failed?v98Text('3D nicht verfügbar · 2D aktiv','3D unavailable · using 2D'):!v98Orientation.matches?v98Text('3D im Querformat','3D in landscape'):window.D6UserModelStatus==='loading'?v98Text('Spieler werden vorbereitet','Preparing players'):window.D6UserModelStatus==='failed'?v98Text('Spielermodelle nicht verfügbar · Ersatzdarstellung aktiv','Player models unavailable · using fallback'):'';
 toolbar.dataset.status=String(Boolean(toolbar.querySelector('#v98-status').textContent));
 if(typeof v132FullscreenUI==='function')v132FullscreenUI();
 return toolbar;
}
function v98Dispose(){
 v102StopPaint();v102Frames=null;
 v98Scene?.dispose();v98Scene=null;v98Match=null;v98Players.clear();v98Frame=null;v98CameraPose=null;
 $('#v98-canvas')?.remove();$('#v98-player-labels')?.remove();
 if(typeof v132LeaveFullscreen==='function'&&(!v98IsWorld()||v98Failed||v132ScreenMatch&&v132ScreenMatch!==match))v132LeaveFullscreen();
 if(document.body.classList.contains('v99-expanded'))document.body.classList.remove('v99-expanded');v99Expanded=false;
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
function v98RenderScene(captureOnly=false){
 const world=v98IsWorld();
 if(!world){v98Dispose();if($('#v98-view-controls'))$('#v98-view-controls').hidden=true;v98SyncAudio(false);return;}
 const active=v98View==='3d'&&v98Orientation.matches&&!v98Failed;
 if(!active){v102StopPaint();v102Frames=null;document.body.classList.remove('v98-pitch3d');if($('#v98-canvas'))$('#v98-canvas').hidden=true;if($('#v98-player-labels'))$('#v98-player-labels').hidden=true;v98Toolbar();v98SyncAudio();return;}
 try{
  if(v98Match!==match){v98Dispose();v98Create();}
  if(!v102Painting){document.body.classList.add('v98-pitch3d');$('#v98-canvas').hidden=false;$('#v98-player-labels').hidden=false;document.body.classList.toggle('v99-expanded',v99Expanded);}
  const {renderer,camera,ballRoot,ball,ballShadow,ownerRing}=v98Scene,canvas=$('#v98-canvas'),rect=canvas.parentElement.getBoundingClientRect();
  if(!rect.width||!rect.height||document.hidden){v102StopPaint();v102Frames=null;if(!v102Painting){v98Toolbar();v98SyncAudio();}return;}
  const width=Math.round(rect.width),height=Math.round(rect.height);if(renderer.domElement.width!==Math.round(width*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(height*renderer.getPixelRatio()))renderer.setSize(width,height,false);
  camera.aspect=width/height;
  const now=performance.now();
  const live=running&&!v47PlayerDialog.open&&contextPhaseLive();
  if(!v102Painting){
   const raw=v98PitchFrame(match),meta=match.flight&&v102Flights.get(match.flight);
   if(meta?.high)raw.flightVisual={meta,progress:match.flight.progress,height:meta.endHeight};
   v98Frame=raw;v102Capture(raw,now,live);
  }
  // The match timer supplies new snapshots; the pending screen callback paints.
  // Pause, direct scene checks and the first picture still draw synchronously.
  if(captureOnly&&live&&v102Loop){v98Toolbar();v98SyncAudio();return;}
  const minFrameMs=v98Scene.quality?.maxFps?1000/v98Scene.quality.maxFps:0;
  if(v102Painting&&live&&now-v98LastTime<minFrameMs-.5){v102PaintNext();return;}
  const dt=Math.min(.1,Math.max(0,(now-v98LastTime)/1000));v98LastTime=now;
  const buffer=v102Frames;if(!buffer)return;
  const frame=(typeof v103ReplayFrame==='function'&&v103ReplayFrame(now,live))||v102Interpolate(buffer.previous,buffer.latest,buffer.span?Math.min(1,(now-buffer.at)/1000/buffer.span):1);
  const ids=new Set(frame.players.map(person=>person.id));
  for(const [id,visual]of v98Players)if(!ids.has(id)){v98Scene.removePlayer(visual);visual.label.remove();v98Players.delete(id);}
  for(const person of frame.players){
   let visual=v98Players.get(person.id);
   if(!visual){
    visual=v98Scene.player(person.team,person.number,person.x,person.z,person.keeper,v98Kit(person.person),person.person.appearance);
    const label=document.createElement('button');label.type='button';label.dataset.v98Player=person.id;label.textContent=`${person.number} ${person.person.name.split(' ').at(-1)}`;label.setAttribute('aria-label',`${person.person.name} · ${v98Text('Live-Spielerinfo','Live player information')}`);$('#v98-player-labels').append(label);visual.label=label;v98Players.set(person.id,visual);
   }
   if(frame.review&&v131ReviewPose(visual,person.id,frame.review))continue;
   if(visual.turned!==frame.turned||Math.hypot(person.x-visual.previous.x,person.z-visual.previous.z)>4){
    visual.heading=(person.team===0?1:-1)*(frame.turned?-1:1)*Math.PI/2;visual.turned=frame.turned;visual.previous={x:person.x,z:person.z};visual.runSpeed=0;visual.locomotion=null;visual.lastGesture=null;visual.gestureExit=null;visual.airOffset=null;
   }
   visual.reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   v102RunPose(visual,person,dt,live,frame.ball);
   visual.root.position.set(person.x,0,person.z);visual.root.rotation.y=visual.heading;
   visual.previous={x:person.x,z:person.z};
   const action=person.action,basePose=v106PoseSnapshot(visual,person);
   if(action){
    const target=v98PitchPoint(action.target,frame.turned),heading=Math.atan2(target.x-person.x,target.z-person.z);
    if(action.kind==='throw'){
     const inward=v98PitchPoint({x:person.person.x<.5?person.person.x+.15:person.person.x-.15,y:person.person.y},frame.turned);
     visual.root.rotation.y=action.holding?Math.atan2(inward.x-person.x,inward.z-person.z):heading;
     visual.body.position.y=0;visual.body.rotation.x=action.holding?-.12:.22*action.progress;
     for(const i of [0,2])visual.limbs[i].rotation.x=0;
     for(const i of [1,3])visual.limbs[i].rotation.x=action.holding?-Math.PI+.28:-Math.PI+.28+action.progress*1.9;
     visual.limbs[1].rotation.z=-.33;visual.limbs[3].rotation.z=.33;
    }else if(action.kind==='goalKick'){
     visual.root.rotation.y=heading;visual.body.position.set(0,0,0);visual.body.rotation.z=0;
     const follow=action.phase==='follow',strike=Math.max(0,(action.progress-.6)/.4),blend=(1-Math.cos(Math.PI*strike))/2;
     const swing=follow?-1.05*(1-action.progress):action.progress<=.6?.55*Math.sin(action.progress/.6*Math.PI/2):.55-1.6*blend;
     visual.body.rotation.x=follow?.14*(1-action.progress):action.progress<=.6?-.08*action.progress/.6:-.08+.22*blend;
     visual.limbs[0].rotation.x=follow?.16*(1-action.progress):0;visual.limbs[2].rotation.x=swing;
     visual.limbs[1].rotation.x=-swing*.3;visual.limbs[3].rotation.x=swing*.3;
     visual.limbs[1].rotation.z=-.18;visual.limbs[3].rotation.z=.18;
    }else if(action.kind==='save'){
     const attack=(person.team===0?1:-1)*(frame.turned?-1:1);
     visual.root.rotation.y=attack*Math.PI/2;
     const direction=Math.sign(target.z-person.z)||((person.number%2)?1:-1),reach=action.progress*(1-action.recovery)*(action.goal?.4:1);
     const high=action.height>1.65,central=Math.abs(target.z-person.z)<.35;
     // Reach the same projected contact point, then return to the engine position.
     if(!action.goal&&!visual.meshy){const dx=target.x-person.x,dz=target.z-person.z,limit=Math.min(1,1.1/Math.max(.001,Math.hypot(dx,dz)));visual.root.position.x+=dx*reach*limit;visual.root.position.z+=dz*reach*.45*limit;}
     visual.body.rotation.z=central?0:direction*attack*(high?.6:1.25)*reach;
     // Rotate around the hips rather than burying the torso beneath the turf.
     visual.body.position.y=high?.45*reach:central?-.18*reach:.95*(1-Math.cos(visual.body.rotation.z))-.28*reach;
     visual.body.position.x=central?0:-direction*attack*(high?.45:.65)*reach;
     visual.limbs[1].rotation.x=visual.limbs[3].rotation.x=-(high?2.8:1.7)*reach;
     visual.limbs[1].rotation.z=-.35*reach;visual.limbs[3].rotation.z=.35*reach;
     visual.limbs[0].rotation.x=.35*reach;visual.limbs[2].rotation.x=-.45*reach;
    }else if(!(visual.meshy&&action.kind==='control'&&frame.ball.height<=1.1))v102ActionPose(visual,action,person,frame.turned);
    if(['throw','goalKick','save'].includes(action.kind))for(const group of [...visual.knees,...visual.feet,...visual.elbows])group.rotation.set(0,0,0);
   }
   v106GestureTransition(visual,person,action,basePose,dt,live);
   if(visual.meshy&&!person.keeper&&action?.kind!=='block'){
    const offset=visual.airOffset||(visual.airOffset={x:0,z:0}),blend=live?1-Math.exp(-dt*16):0;
    offset.x+=(visual.root.position.x-person.x-offset.x)*blend;offset.z+=(visual.root.position.z-person.z-offset.z)*blend;
    visual.root.position.x=person.x+offset.x;visual.root.position.z=person.z+offset.z;
   }
   visual.renderMotion?.({person,frame,dt,live});
   if(typeof v108KeeperLook==='function')v108KeeperLook(visual,person,frame,dt,live);
   visual.label.disabled=!live;
   const label=`${person.person.name} · ${v98Text('Live-Spielerinfo','Live player information')}`;if(visual.label.getAttribute('aria-label')!==label)visual.label.setAttribute('aria-label',label);
  }
  const ownerVisual=frame.owner&&v98Players.get(frame.owner),nativeBall=!frame.review&&(ownerVisual?.meshy?.heldBallPoint||ownerVisual?.meshy?.ballPoint);if(nativeBall&&!frame.ballInFlight&&!frame.outOfPlayBall){frame.ball.x=nativeBall.x;frame.ball.z=nativeBall.z;frame.ball.height=nativeBall.y}
  // Foot control follows the last drawn ball through pivots and preparation changes.
  const previousBall=v98Scene.controlBall,controller=frame.players.find(p=>p.id===frame.owner);
  if(live&&previousBall&&controller&&!controller.keeper&&frame.carrying&&!frame.ballInFlight&&!frame.outOfPlayBall&&previousBall.turned===frame.turned&&previousBall.opacity>.1&&(frame.ball.opacity??1)>.1){
   const dx=frame.ball.x-previousBall.x,dy=frame.ball.height-previousBall.height,dz=frame.ball.z-previousBall.z,d=Math.hypot(dx,dy,dz),travel=controller.id===previousBall.owner?Math.hypot(controller.x-previousBall.playerX,controller.z-previousBall.playerZ):0,limit=travel+8*(live?dt:0);
   if(d>limit&&d<5){const q=limit/Math.max(.001,d);frame.ball.x=previousBall.x+dx*q;frame.ball.height=previousBall.height+dy*q;frame.ball.z=previousBall.z+dz*q}
  }
  const catchPose=frame.players.find(p=>p.id===frame.owner)?.action,catcher=!frame.review&&!frame.ballInFlight&&!nativeBall&&catchPose?.saved&&v98Players.get(frame.owner);
  if(catcher&&catchPose.recovery<1){
   catcher.root.updateMatrixWorld(true);
   const hand=catcher.meshy?.handPoint?catcher.meshy.handPoint():catcher.limbs[1].localToWorld(new THREE.Vector3(0,-.56,0)),blend=Math.min(1,catchPose.recovery*1.5);
   frame.ball.x=hand.x+(frame.ball.x-hand.x)*blend;frame.ball.z=hand.z+(frame.ball.z-hand.z)*blend;frame.ball.height=Math.max(.29,hand.y+(frame.ball.height-hand.y)*blend);
  }
  ballRoot.position.set(frame.ball.x,frame.ball.height,frame.ball.z);v110BallRoll(v98Scene,frame,live);
  v98Scene.controlBall={...frame.ball,turned:frame.turned,owner:frame.owner,playerX:controller?.x,playerZ:controller?.z};
  const ballOpacity=frame.ball.opacity??1;v109BallOpacity(v98Scene,ballOpacity);
  ballShadow.position.set(frame.ball.x,.105,frame.ball.z);ballShadow.scale.setScalar(1+(frame.ball.height-.29)*.09);ballShadow.material.opacity=ballOpacity*.38/(1+frame.ball.height*.2);
  const owner=v98Players.get(frame.owner);ownerRing.visible=Boolean(owner);if(owner)ownerRing.position.set(owner.root.position.x,.11,owner.root.position.z);
  v98Offside.visible=v98Offender.visible=v98Assistant.root.visible=Boolean(frame.offside);
  if(frame.offside){
   const signal=frame.offside.signal,angle={raised:Math.PI,far:Math.PI*.75,middle:Math.PI*.5}[signal.pose];
   v98Offside.position.x=frame.offside.lineX;v98Offender.position.set(frame.offside.x,.13,frame.offside.z);
   v98Assistant.root.position.set(frame.offside.lineX,0,signal.left?-24:24);v98Assistant.root.rotation.y=signal.left?0:Math.PI;v98Assistant.limbs[1].rotation.z=angle;
   // Keep the cloth hanging down while the shared signal lowers the flagpole.
   v98Flag.position.set(-.16*Math.sin(angle),-1.05-.16*Math.cos(angle),0);v98Flag.rotation.z=-angle;
  }
  if(typeof v131RecordRendered==='function'&&!frame.review)v131RecordRendered(frame);
  const cameraBall={...frame.ball,x:Math.max(-42,Math.min(42,frame.ball.x))};
  v98CameraPose=v98BlendCamera(v98CameraPose,v98CameraAim(cameraBall,v98CameraMode,camera.aspect),dt);
  const pose=v98CameraPose;
  camera.position.set(pose.position.x,pose.position.y,pose.position.z);camera.fov=pose.fov;camera.updateProjectionMatrix();camera.lookAt(pose.target.x,pose.target.y,pose.target.z);
  renderer.render(v98Scene.scene,camera);
  if(typeof v132BroadcastUI==='function')v132BroadcastUI(frame);
  for(const visual of v98Players.values()){const point=new THREE.Vector3(visual.root.position.x,.25,visual.root.position.z).project(camera);visual.label.hidden=point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1;visual.label.style.left=`${(point.x+1)*50}%`;visual.label.style.top=`${(1-point.y)*50+1.8}%`;}
  v102PaintCount++;if(!v102Painting){v98Toolbar();v98SyncAudio();}
  if(live)v102PaintNext();else v102StopPaint();
 }catch(error){console.warn('3D pitch unavailable',error);v98Failed=true;v98Dispose();v98Toolbar();v98SyncAudio();}
}
function contextPhaseLive(){return v65Context()?.state.phase==='live'}
// Three.js allocates random UUIDs. Give graphics a separate stream so creating
// or switching a view cannot consume the simulation's next random decision.
let v98VisualSeed=98;
function v98Render(captureOnly=false){
 const simulationRandom=Math.random;
 Math.random=()=>{v98VisualSeed=(v98VisualSeed*1664525+1013904223)>>>0;return v98VisualSeed/4294967296;};
 try{return v98RenderScene(captureOnly);}finally{Math.random=simulationRandom;}
}

// Optional SuperCollider samples, triggered only by existing match events.
async function v98ToggleSound(){
 if(v98Audio.enabled){v98Audio.enabled=false;v98SyncAudio(false);v98Toolbar();return;}
 try{
  if(!v98Audio.buffers){
   if(!v98Audio.loading)v98Audio.loading=(async()=>{
    const AC=window.AudioContext||window.webkitAudioContext;v98Audio.context=new AC();await v98Audio.context.resume();
    const bass=v98Audio.context.createBiquadFilter(),compressor=v98Audio.context.createDynamicsCompressor(),master=v98Audio.context.createGain();
    bass.type='lowshelf';bass.frequency.value=150;bass.gain.value=3;
    compressor.threshold.value=-14;compressor.knee.value=16;compressor.ratio.value=4;compressor.attack.value=.005;compressor.release.value=.22;master.gain.value=.8;
    bass.connect(compressor);compressor.connect(master);master.connect(v98Audio.context.destination);v98Audio.bus=bass;
    const buffers={};await Promise.all(['pass','shot','whistle','crowd','cheer','net'].map(async name=>{let bytes;if(window.D6_AUDIO?.[name]){bytes=Uint8Array.from(atob(window.D6_AUDIO[name]),char=>char.charCodeAt(0)).buffer;}else{const response=await fetch(`camera-prototype/audio/${name}.wav`);if(!response.ok)throw Error('Audio unavailable');bytes=await response.arrayBuffer();}buffers[name]=await v98Audio.context.decodeAudioData(bytes);}));v98Audio.buffers=buffers;
   })();
   await v98Audio.loading;
  }
  v98Audio.enabled=true;v98Audio.last=null;v98SyncAudio();v98Toolbar();
 }catch(error){v98Audio.loading=null;v98Audio.enabled=false;v98Toolbar();$('#v98-status').textContent=v98Text('Ton nicht verfügbar','Sound unavailable');}
}
function v98Sound(name,level=.65){
 const source=v98Audio.context.createBufferSource(),gain=v98Audio.context.createGain();source.buffer=v98Audio.buffers[name];gain.gain.value=level;source.connect(gain);gain.connect(v98Audio.bus);v98Audio.active.add(source);source.onended=()=>{v98Audio.active.delete(source);source.disconnect();gain.disconnect();};source.start();
}
function v98SyncAudio(allow=true){
 const audible=allow&&v98Audio.enabled&&v98Audio.buffers&&v98IsWorld()&&running&&contextPhaseLive()&&!v47PlayerDialog.open&&!document.hidden&&!$('#match-area').hidden;
 if(!audible){if(v98Audio.ambient){v98Audio.ambient.stop();v98Audio.ambient=null;}for(const source of v98Audio.active)source.stop();v98Audio.active.clear();if(v98Audio.context?.state==='running')v98Audio.context.suspend();v98Audio.last=null;return;}
 v98Audio.context.resume();
 if(!v98Audio.ambient){const source=v98Audio.context.createBufferSource(),gain=v98Audio.context.createGain();source.buffer=v98Audio.buffers.crowd;source.loop=true;gain.gain.value=.22;source.connect(gain);gain.connect(v98Audio.bus);source.onended=()=>{source.disconnect();gain.disconnect();};source.start();v98Audio.ambient=source;}
 const stats={goals:match.goals.length,shots:match.shots.reduce((a,b)=>a+b,0),passes:match.people.reduce((n,person)=>n+(person.stats.passes||0),0),penaltyShot:match.setPiece?.type==='penalty'&&match.setPiece.phase==='result'?match.setPiece:null,stoppage:match.setPiece?.type||match.throwIn&&'throwIn'||match.halftimePause>0&&'halftime'||match.kickoff?.phase};
 if(v98Audio.match===match&&v98Audio.last){const last=v98Audio.last;if(stats.goals>last.goals){v98Sound('net',.8);v98Sound('cheer',.9);}else if(stats.penaltyShot&&stats.penaltyShot!==last.penaltyShot||stats.shots>last.shots&&!last.penaltyShot)v98Sound('shot',.9);else if(stats.passes>last.passes)v98Sound('pass',.55);if(stats.stoppage!==last.stoppage&&['corner','freeKick','penalty','halftime'].includes(stats.stoppage))v98Sound('whistle',.4);}
 v98Audio.match=match;v98Audio.last=stats;
}
const v98PreviousDraw=draw;
draw=function(){const result=v98PreviousDraw();v98Render(true);return result;};
const v98PreviousControls=v65UpdateControls;
v65UpdateControls=function(context){const result=v98PreviousControls(context);v98Render(true);return result;};
v98Orientation.addEventListener('change',()=>{if(v98IsWorld())draw();});
new ResizeObserver(()=>{if(v98IsWorld())draw();}).observe($('#match-area .v42-pitch-stage'));
new MutationObserver(()=>{if(!v98IsWorld()){v98Dispose();v98SyncAudio(false);if($('#v98-view-controls'))$('#v98-view-controls').hidden=true;}}).observe(document.body,{attributes:true,attributeFilter:['class']});
new MutationObserver(()=>{if(!v98IsWorld()){v98Dispose();v98SyncAudio(false);if($('#v98-view-controls'))$('#v98-view-controls').hidden=true;}}).observe($('#game-screen'),{attributes:true,attributeFilter:['hidden']});
document.addEventListener('visibilitychange',()=>{v98SyncAudio();if(document.hidden)v102StopPaint();else if(v98IsWorld())draw()});
v47PlayerDialog.addEventListener('close',()=>v98SyncAudio());
new MutationObserver(()=>v98SyncAudio()).observe(v47PlayerDialog,{attributes:true,attributeFilter:['open']});
const v100BasePenaltyVisual=v50PenaltyVisual;
v50PenaltyVisual=function(setPiece,last){
 const result=v100BasePenaltyVisual(setPiece,last),scene=$('#v50-penalty-scene');if(!v65WorldActive||!scene)return result;
 scene.classList.toggle('v100-penalty-award',!last&&!setPiece.penaltyReady);
 if(!last&&setPiece.penaltyReady)scene.querySelector('.v78-penalty-referee')?.remove();
 if(!last&&!setPiece.penaltyReady)scene.innerHTML=`<img src="${v55RefereeAsset('penalty')}" alt="${v98Text('Schiedsrichter zeigt auf den Elfmeterpunkt','Referee points to the penalty spot')}"><div><h2>${v98Text('ELFMETER!','PENALTY!')}</h2><p>${escapeHTML(v50Name(setPiece.team))}<br>${escapeHTML(setPiece.taker.name)}</p></div>`;
 return result;
};
function v100SyncPenaltyBall(){
 if(!v65WorldActive||match?.setPiece?.phase!=='result'||match.setPiece.outcome!=='wide')return;
 const ball=$('#v50-penalty-scene .v42-ball.wide'),scene=$('#v50-penalty-scene .v42-goal-scene');if(!ball||!scene)return;
 const rect=scene.getBoundingClientRect(),point=v100PenaltyWidePoint((2.15-match.setPiece.wait)/.9,match.setPiece.shotSide,rect.width,rect.height);
 ball.style.left=`${point.left}px`;ball.style.bottom=`${point.bottom}px`;ball.style.transform=`translateX(-50%) scale(${point.scale})`;
}
const v100PreviousDraw=draw;
draw=function(){const result=v100PreviousDraw();v100SyncPenaltyBall();return result};
const v100BaseResume=v65Resume;
v65Resume=function(...args){
 const returnToPitch=v65Context()?.state.phase==='paused'&&(v65PauseView||match?.halftimePause>0),result=v100BaseResume(...args);
 if(returnToPitch&&v65Context()?.state.phase==='live'){
  v98CameraPose=null;v100PitchMenu(false);
  // Restore the live layout before focusing it; a smooth scroll can be interrupted by resumed painting.
  requestAnimationFrame(()=>{if(v98IsWorld()){draw();$('#match-area .v42-pitch-stage').scrollIntoView({block:'start',behavior:'instant'})}});
 }
 return result;
};
window.d6Pitch3D={getState:()=>({view:document.body.classList.contains('v98-pitch3d')?'3d':'2d',landscape:v98Orientation.matches,available:!v98Failed,players:v98Players.size,frame:v98Frame?{elapsed:v98Frame.elapsed,turned:v98Frame.turned,ball:{...v98Frame.ball},players:v98Frame.players.map(({id,x,z,number})=>({id,x,z,number})),offside:v98Frame.offside?{...v98Frame.offside}:null}:null,camera:v98CameraPose?{mode:v98CameraMode,position:{...v98CameraPose.position},target:{...v98CameraPose.target},fov:v98CameraPose.fov}:null,audioEnabled:v98Audio.enabled,audioLoaded:Boolean(v98Audio.buffers),ambient:Boolean(v98Audio.ambient),activeSounds:v98Audio.active.size,drawCalls:v98Scene?.renderer.info.render.calls||0})};
