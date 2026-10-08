(function(){'use strict';
// Isolated Welle 1 adapter: native match functions own all outcomes. Never imports the oracle.
const C=window.D6ProbeContract,DT=1/60,originalRandom=Math.random;
let nativeNet=null,lastNetBall=null,physics=null, cameraPoints=[],renderer=null,template=null,actorTemplate=null,keeperTemplate=null,scene=null,seed=617,rng=C.rng(seed),tick=0,active=false,done=false,ready=false,raf=0,lastTime=0,accumulator=0,findings=[],config=null,ballVelocity=[0,0,0],velocities=new Map(),lastCpu=0,totalCpu=0,error=null;
const clone=v=>JSON.parse(JSON.stringify(v)),point=p=>C.toNative(p,scene.geometry),canonical=(p,h=.29)=>C.fromNative(p,scene.geometry,h);
function randomScope(fn){const previous=Math.random;Math.random=()=>rng.next();try{return fn();}finally{Math.random=previous;}}
function stopNativeTimers(){clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();if(typeof v132StopReview==='function')v132StopReview();if(typeof frame!=='undefined')cancelAnimationFrame(frame);running=false;}
function finding(code,text){if(!findings.some(x=>x.code===code))findings.push({code,text});}
function person(a,index){
 const p=clone(a.role==='keeper'?keeperTemplate:actorTemplate),v=point(a.position);
 Object.assign(p,{pid:a.id,name:a.role==='keeper'?'Torwart':'Spieler',n:index+1,t:a.team,x:v.x,y:v.y,tx:v.x,ty:v.y,bx:v.x,by:v.y,initialBy:v.y,line:a.role==='keeper'?'gk':'att',assignedLine:a.role==='keeper'?'gk':'att',keeper:a.role==='keeper',role:0,form:0,fresh:100,instructions:[],stats:emptyStats(),motionX:0,motionY:0,recoverUntil:0,slideActive:false,interceptTarget:null});
 for(const k of ['spd','tec','pas','fin','tak','pos','air','sta','gk'])p[k]=12;
 v117Stats(p);return p;
}
function updateNativeNet(){
 let view=match.ball,height=.29;try{const shown=v99BallView(match);if(shown){view=shown;height=shown.elevation??.29;}}catch(_){}
 const position=canonical(view,height),previous=lastNetBall||position,velocity=position.map((x,i)=>(x-previous[i])/DT);lastNetBall=position;
 nativeNet.ball={position,velocity,radius:scene.ball.radius};if(match.score[0]+match.score[1]>0&&Math.abs(position[0])>scene.geometry.length/2)nativeNet.goalSign=Math.sign(position[0]);
 if(Math.hypot(...position.map((x,i)=>x-previous[i]))>4)nativeNet.ball.velocity=[0,0,0];
 window.D6Net.step(nativeNet,DT,null,false);
}
function state(){
 if(physics)return {...clone(physics.state),running:active,cameraPoints:clone(cameraPoints),rngState:rng.state};
 if(!ready||!scene||!match)return {ready,engine:'browser',error,scenarioId:scene?.id||null,elapsed:0,tick,running:active,finished:done,actors:[],events:[],findings:clone(findings)};
 let view=match.ball,height=.29;try{const nativeView=v99BallView(match);if(nativeView){view=nativeView;height=nativeView.elevation??.29;}}catch(_){/* keep the native logical position if no ball view is available */}
 return {ready,engine:'browser',scenarioId:scene.id,geometry:clone(scene.geometry),cameraPoints:clone(cameraPoints),elapsed:tick*DT,nativeElapsed:match.elapsed,tick,running:active,finished:done,following:!done&&tick*DT>=scene.duration,netPatches:clone(nativeNet?.netPatches||[]),ball:{position:canonical(view,height),logicalPosition:canonical(match.ball),velocity:[...ballVelocity],radius:scene.ball.radius},actors:match.people.map(p=>({id:p.pid,team:p.t,role:p.keeper?'keeper':'field',position:canonical(p,0),velocity:velocities.get(p.pid)||[0,0,0],action:v102PlayerAction(match,p)?.kind||(match.owner===p?'control':'move')})),events:clone(match.ballAccounting?.events||[]),score:[...match.score],ownerId:match.owner?.pid||null,findings:clone(findings),rngState:rng.state};
}
function paint(){if(!renderer||!ready||!scene)return;const previous=Math.random;Math.random=originalRandom;try{renderer.render(state());}finally{Math.random=previous;}}
function notify(){if(parent!==window)parent.postMessage({type:'d6-probe-state',snapshot:state()},location.origin);}
function takeTick(){
 if(done||!scene)return;
 if(physics){physics.state.running=true;physics.step();tick=physics.state.tick;done=physics.state.finished;if(done)active=false;return;}
 const before=canonical(match.ball),players=new Map(match.people.map(p=>[p.pid,canonical(p)])),started=performance.now();
 if(!['keeper-permission','offside'].includes(scene.kind))randomScope(()=>{running=true;step(DT*MATCH_SPEED,DT);running=false;});
 tick++;updateNativeNet();lastCpu=performance.now()-started;totalCpu+=lastCpu;
 const after=canonical(match.ball);ballVelocity=after.map((x,i)=>(x-before[i])/DT);
 for(const p of match.people){const prev=players.get(p.pid),now=canonical(p);velocities.set(p.pid,now.map((x,i)=>(x-prev[i])/DT));}
 if(tick>=Math.ceil((scene.duration+(config.followThroughSeconds||0))/DT)||match.finished){done=true;active=false;}
}
function animate(now){
 raf=0;if(!active)return;
 if(lastTime)accumulator+=Math.min(.1,(now-lastTime)/1000);lastTime=now;
 while(accumulator>=DT&&active){takeTick();accumulator-=DT;}
 paint();notify();if(active)raf=requestAnimationFrame(animate);
}
function pause(){active=false;running=false;cancelAnimationFrame(raf);raf=0;lastTime=0;accumulator=0;return state();}
function camera(mode){if(!['overview','contact'].includes(mode))throw Error('Invalid camera');renderer?.setCamera?.(mode);paint();return state();}
function begin(){if(!ready||!scene)throw Error('No loaded native scenario');if(!done&&!active){active=true;lastTime=0;raf=requestAnimationFrame(animate);}return state();}
function launch(){
 const attack=scene.geometry.attackDirection===1?0:1,subject=match.people.find(p=>p.pid===scene.provenance?.subjectId);
 if(scene.kind==='keeper-permission'){
  const nativeAllowed=v150KeeperArea(subject,match.ball);
  finding('NATIVE_PERMISSION_PROBE',`v150KeeperArea: ${nativeAllowed?'innerhalb':'außerhalb'} der bisherigen 16,5×24-Kontaktbox. Herkunftssperren werden dort nicht geprüft.`);
  done=!(config.followThroughSeconds>0);return;
 }
 if(scene.kind==='offside'){
  finding('OFFSIDE_FIXTURE_UNSUPPORTED','Der Katalog enthält einen fachlichen Beteiligungssnapshot, aber keine native Abspielhistorie. Kein künstlicher Pfiff wird erzeugt.');done=!(config.followThroughSeconds>0);return;
 }
 if(scene.kind==='boundary'){
  const target=point(scene.ball.position.map((v,i)=>v+scene.ball.velocity[i]*scene.duration));
  const hit=v55Exit(match.ball,target);finding('NATIVE_BOUNDARY_PROBE',hit?`v55Exit erkennt Mittelpunktquerung an ${hit.edge}; vollständiges Ballvolumen wird hier nicht geprüft.`:'v55Exit erkennt in diesem Segment keine Mittelpunktquerung.');
  finding('BOUNDARY_HEIGHT_BASELINE','Die freie native Bodenbahn übernimmt keine willkürlich vorgegebene Testhöhe; Torrahmen-/Luftfälle brauchen gesonderte native Ausführung.');
  v50LooseBall({...match.ball},'Lokale Grenzprobe');
  if(match.rebound){match.rebound.delay=0;match.rebound.vx=scene.ball.velocity[2]/scene.geometry.width*(544/600)/MATCH_SPEED;match.rebound.vy=-scene.ball.velocity[0]/scene.geometry.length*(688/740)/MATCH_SPEED;}
  return;
 }
 const shooter=match.people.find(p=>p.t===attack&&!p.keeper&&scene.actors.find(a=>a.id===p.pid)?.action==='none')||match.people.find(p=>p.t===attack&&!p.keeper);
 Object.assign(shooter,{...match.ball,tx:match.ball.x,ty:match.ball.y,bx:match.ball.x,by:match.ball.y,initialBy:match.ball.y});match.owner=shooter;
 finding('ADAPTER_RELEASE_PLAYER','Ein vorhandener unbeteiligter Feldspieler steht für die native Freigabe am Ball; Mannschaftsgröße bleibt erhalten.');
 if(scene.kind==='shot'||scene.kind==='sequence'){
  v55Shoot(shooter,'shot');
  finding('NATIVE_SHOT_PRESELECTS','Die unveränderte Schussfunktion wählt Ziel, Tempo und Ergebnis selbst; eine gehaltene Bahn kann auf den Keeper umgelenkt werden. Die Fixturebahn wird nicht erzwungen.');
  if(scene.kind==='sequence')finding('FOLLOWUP_NOT_SCRIPTED','Folgeabschluss und Abpraller werden durch die native Simulation entschieden; die vorgegebene Testfolge wird nicht künstlich ausgelöst.');
 }else{
  const target=point(scene.ball.position.map((v,i)=>v+scene.ball.velocity[i]*scene.duration)),runner=match.people.find(p=>p.pid===(scene.provenance?.intendedReceiverId||'receiver'))||match.people.find(p=>p.t===attack&&!p.keeper&&p!==shooter);
  v150SpacePass(shooter,{target,runner});
  finding('NATIVE_PASS_EXECUTION','Die Bestandsengine nutzt eigene Passstreuung, Geschwindigkeit, Laufziele und Kontaktweite; Testgeschwindigkeiten werden nicht in die Engine geschrieben.');
 }
}
async function load(input){
 await initialized;pause();if(!input?.scenario||input.scenario.schemaVersion!==C.VERSION)throw Error('Incompatible native scenario');
 if(!Number.isFinite(input.followThroughSeconds??0)||(input.followThroughSeconds??0)<0||(input.followThroughSeconds??0)>10)throw Error('Invalid follow-through duration');
 config=clone(input);scene=clone(input.scenario);physics=null;nativeNet={geometry:clone(scene.geometry),goalSign:0,ball:clone(scene.ball),netPatches:[]};lastNetBall=null;cameraPoints=window.D6ProbeCamera.points(scene);seed=Number(input.seed??617)>>>0;rng=C.rng(seed);tick=0;done=false;findings=[];velocities=new Map();ballVelocity=[...scene.ball.velocity];totalCpu=0;
 if(match)v103EndReplay(match);hideOverlay();stopNativeTimers();
 if(scene.kind==='physics'||scene.kind==='play'){physics=scene.kind==='play'?window.D6Play.create(config):window.D6BallPhysics.create(config);paint();notify();return state();}
 match={...clone(template),people:scene.actors.map(person),exitedPeople:[],owner:null,ball:point(scene.ball.position),elapsed:10,score:[0,0],shots:[0,0],possession:[0,0],goals:[],flight:null,slide:null,rebound:null,kickoff:null,countdown:0,postBanner:null,throwIn:null,setPiece:null,goalPause:0,goalScene:null,halftimePause:0,halftime:false,halftimeBreakDone:false,fulltimePending:false,finished:false,next:Infinity,lastPass:null,lastTouch:scene.geometry.attackDirection===1?0:1,offsideVisual:null,ballAccounting:{version:117,sequence:0,events:[]},overlayTTL:0,pendingKickoff:null};
 delete match.ballEventId;delete match.spacePassIntent;
 v102State(match).clock=0;
 finding('ISOLATED_NATIVE','Flüchtige lokale Matchprobe ohne Karriere-Speicherung. Alle Matchresultate kommen aus den Bestandsfunktionen.');
 finding('NATIVE_BOX_VARIANTS','Sichtbarer Strafraum 10×20; Raumpass-Zugriff 16,5×24; allgemeiner freier Ball 14×24.');
 finding('NATIVE_ACTOR_CONTROL','Auch unbeteiligte Katalogakteure bleiben native Spieler. Die Engine bestimmt ihre Bewegung statt konstanter Fixturegeschwindigkeit.');
 if(config.followThroughSeconds>0)finding('NATIVE_FOLLOW_THROUGH','Drei Sekunden zusätzlicher nativer Ablauf; Ballbild und logische Ballposition bleiben getrennt erfasst. Die Netzverformung folgt der Ballansicht; die Bestandsphysik bleibt unverändert.');
 if(scene.geometry.length!==68)finding('FIELD_PROJECTION_ONLY','Das größere Feld ist eine Darstellung der weiterhin mit 68×44 rechnenden nativen Physik; Reichweiten und Geschwindigkeiten skalieren dadurch sichtbar mit.');
 randomScope(launch);stopNativeTimers();paint();notify();return state();
}
function signature(s){return JSON.stringify({scenarioId:s.scenarioId,tick:s.tick,ball:s.ball,actors:s.actors,events:s.events,score:s.score,netPatches:s.netPatches,ownerId:s.ownerId,rngState:s.rngState,finished:s.finished,playPhase:s.playPhase,phaseStarted:s.phaseStarted,releaseAt:s.releaseAt,lastActorId:s.lastActorId,ignoreUntil:s.ignoreUntil,resultDelivered:s.resultDelivered,resolvedAt:s.resolvedAt,followThroughUntil:s.followThroughUntil});}
function checkpoint(){
 pause();if(!scene)throw Error('No native scene');
 if(typeof window.D6ProbeSourceId!=='string'||!window.D6ProbeSourceId)throw Error('Missing native source identity; checkpoint unavailable');
 const snapshot=state();return {schemaVersion:C.VERSION,engine:'browser',sourceId:window.D6ProbeSourceId,method:'deterministic-replay',adapterVersion:1,config:clone(config),tick,seedState:rng.state,state:snapshot,signature:signature(snapshot),findings:['Replay checkpoint reconstructs native callbacks; not a native career-save proof.']};
}
async function restore(saved){
 if(saved?.schemaVersion!==C.VERSION||saved.engine!=='browser'||!window.D6ProbeSourceId||saved.sourceId!==window.D6ProbeSourceId||saved.method!=='deterministic-replay'||saved.adapterVersion!==1||!Number.isInteger(saved.tick)||saved.tick<0||saved.tick>36000)throw Error('Incompatible native replay checkpoint');
 await load(saved.config);while(tick<saved.tick&&!done)takeTick();
 const actual=state();if(tick!==saved.tick||rng.state!==saved.seedState||signature(actual)!==saved.signature)throw Error('Native replay checkpoint diverged; restore rejected');
 finding('REPLAY_CHECKPOINT','Fortsetzung wurde durch erneute deterministische Ausführung und vollständigen Zustandsvergleich geprüft; kein Karriere-Speichernachweis.');paint();notify();return state();
}
async function initialize(){
 const deadline=performance.now()+120000;
 while(window.D6UserModelStatus!=='ready'){if(['error','failed'].includes(window.D6UserModelStatus)||performance.now()>deadline)throw Error('Existing player asset failed or timed out');await new Promise(r=>setTimeout(r,50));}
 randomScope(()=>{
  const career=v61CreateCareer('GER-2','Lokale Engineprobe'),club=career.world.clubs.find(c=>c.id==='GER-2');v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')v66NextMarketDay(career);
  const fixture=v62Fixtures(career).find(f=>!f.result&&(f.homeId==='GER-2'||f.awayId==='GER-2'));career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;career.world.activeMatch.state.phase='live';v98View='2d';v65Show(v65Context());
 });
 stopNativeTimers();v103EndReplay(match);hideOverlay();template=clone({...match,owner:null,kickoff:null,flight:null,slide:null});actorTemplate=clone(match.people.find(p=>!p.keeper));keeperTemplate=clone(match.people.find(p=>p.keeper));
 const stage=document.createElement('div');stage.id='probeStage';Object.assign(stage.style,{position:'fixed',inset:'0',zIndex:'2147483640',background:'#102c26'});document.body.append(stage);
 if(window.D6DemoRenderer)renderer=await window.D6DemoRenderer.create(stage);
 ready=true;window.D6ProbeReady=true;notify();return true;
}
const initialized=initialize().catch(e=>{error=e.message;window.D6ProbeError=error;notify();throw e;});
window.D6Probe={get ready(){return ready;},load,start:begin,pause,resume:begin,camera,reset:()=>load(config),snapshot:state,checkpoint,restore,stats:()=>({...renderer?.stats?.(),engine:'browser',tick,lastStepMs:lastCpu,totalStepMs:totalCpu}),advance:async count=>{await initialized;pause();if(!Number.isInteger(count)||count<0||count>36000)throw Error('Invalid tick count');for(let n=0;n<count&&!done;n++)takeTick();paint();return state();}};
window.addEventListener('message',async event=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='d6-probe')return;
 const {command,id,payload}=event.data;if(!['load','start','pause','resume','camera','reset','snapshot','checkpoint','restore','stats','advance'].includes(command))return;
 try{const result=await window.D6Probe[command](payload);parent.postMessage({type:'d6-probe-response',id,result},location.origin);}catch(e){parent.postMessage({type:'d6-probe-response',id,error:e.message},location.origin);}
});
})();
