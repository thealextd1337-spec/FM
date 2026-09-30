/* Doppel 6 — throwaway camera prototype. Synthetic sequence; no game state.
 * Question: is a wide sideline perspective with gentle ball tracking readable?
 * Local Three.js r160 (MIT); sounds authored in audio/render.scd.
 */
'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const stage = $('stage'), canvas = $('pitch');
 const wide = matchMedia('(orientation:landscape)');
 const reduceMotion = matchMedia('(prefers-reduced-motion:reduce)');
 const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
 const mix = (a,b,q) => a+(b-a)*q;
 const smooth = q => q*q*(3-2*q);
 const length = 28;
 let lang='de', playing=!reduceMotion.matches, time=0, preset='tv', height=32, fov=46;
 let frameTime=0, lastUI=-1, fpsFrames=0, fpsTime=0, measuredFPS=0;
 const copy = {
  de:{pause:'Pause',play:'Abspielen',restart:'Neu starten',soundOn:'Ton einschalten',soundOff:'Ton ausschalten',soundError:'Ton nicht verfügbar',tv:'TV-Kamera',overview:'Ganzes Feld',close:'Näher dran',height:'Kamerahöhe',width:'Bildweite',volume:'Lautstärke',scenes:'Szenen ansehen',buildUp:'Spielaufbau',wing:'Außenbahn',cross:'Flanke',finish:'Abschluss',goal:'TOOOR!',goalCopy:'Ballweg und Kamera im Torraum',loading:'Das Stadion wird aufgebaut …',demo:'DEMO · 6 GEGEN 6',rotateTitle:'Bitte ins Querformat drehen',rotateCopy:'Die 3D-TV-Kamera ist für das Querformat gedacht. Die Demo wartet hier auf dich.',timeline:'Demo-Zeitpunkt',description:'Erhöhte Seitenlinienkamera mit sanfter Ballverfolgung. Wiederholbare Beispielszenen, keine echte Partie und keine Speicherung. Sounds mit SuperCollider erzeugt.',newAttack:'Demo startet neu',tvLabel:'TV-Kamera · weit',overviewLabel:'Gesamtes Spielfeld · feste Kamera',closeLabel:'TV-Kamera · näher',fullscreen:'Vollbild',pitch:'Stilisierte 3D-Fußballdemo mit zwölf Spielern und einer TV-Kamera',unavailable:'Die 3D-Ansicht konnte nicht gestartet werden. Bitte öffne die Demo in einem Browser mit WebGL-Unterstützung.',soundLoading:'Ton wird geladen …'},
  en:{pause:'Pause',play:'Play',restart:'Restart',soundOn:'Enable sound',soundOff:'Mute sound',soundError:'Sound unavailable',tv:'TV camera',overview:'Whole pitch',close:'Closer view',height:'Camera height',width:'Field of view',volume:'Volume',scenes:'Explore scenes',buildUp:'Build-up',wing:'Wing play',cross:'Cross',finish:'Finish',goal:'GOAL!',goalCopy:'Ball flight and camera in the goal area',loading:'Building the stadium …',demo:'DEMO · SIX A SIDE',rotateTitle:'Please rotate to landscape',rotateCopy:'The 3D TV camera is designed for landscape. Your demo will wait here.',timeline:'Demo playhead',description:'Elevated sideline camera with gentle ball tracking. Repeatable example scenes, no real match and no saved data. Sounds created with SuperCollider.',newAttack:'Demo restarting',tvLabel:'TV camera · wide',overviewLabel:'Whole pitch · fixed camera',closeLabel:'TV camera · closer',fullscreen:'Full screen',pitch:'Stylised 3D football demo with twelve players and a TV camera',unavailable:'The 3D view could not start. Please open the demo in a browser with WebGL support.',soundLoading:'Loading sound …'}
 };
 const tr = key => copy[lang][key];
 let renderer,pitchScene;
 if(!window.THREE){
  $('loading').textContent=lang==='de'?'Die 3D-Bibliothek fehlt. Bitte baue die Demo erneut.':'The 3D library is missing. Please rebuild the demo.';
  document.querySelectorAll('main button, main input').forEach(el=>el.disabled=true);return;
 }
 try {
  pitchScene=window.D6PitchScene.create(canvas);renderer=pitchScene.renderer;
 } catch(error) {
  $('loading').textContent=tr('unavailable');
  document.querySelectorAll('main button, main input').forEach(el=>el.disabled=true);
  console.error(error); return;
 }
 const {scene,camera,people,player,ballRoot,ball,ballShadow,ownerRing}=pitchScene;
 [[-31,0],[-22,8],[-12,-12],[-5,-3],[11,16],[24,-2]].forEach(([x,z],i)=>player(0,i+1,x,z,i===0));
 [[32,0],[23,-7],[21,8],[10,-12],[3,10],[-9,-5]].forEach(([x,z],i)=>player(1,i+1,x,z,i===0));
 function segment(t,start,end,from,to,air=0){const q=clamp((t-start)/(end-start),0,1);return{x:mix(from[0],to[0],q),z:mix(from[1],to[1],q),h:.29+Math.sin(q*Math.PI)*air};}
 function sequence(t){
  let b,owner=null,phase='buildUp';
  if(t<4){b=segment(t,0,4,[-21.4,8],[-14.4,6]);owner=1;}
  else if(t<6)b=segment(t,4,6,[-14.4,6],[-5,-3]);
  else if(t<10){b=segment(t,6,10,[-4.4,-3],[7.6,-2]);owner=3;}
  else if(t<12){b=segment(t,10,12,[7.6,-2],[11,16]);phase='wing';}
  else if(t<16){b=segment(t,12,16,[11.6,16],[21.6,15]);owner=4;phase='wing';}
  else if(t<19){b=segment(t,16,19,[21.6,15],[24,-2],4.5);phase='cross';}
  else if(t<20.6){b=segment(t,19,20.6,[24,-2],[35.5,1.1],1.15);phase='finish';}
  else {b={x:35.5+Math.sin((t-20.6)*6)*.15*Math.exp(-(t-20.6)*2),z:1.1,h:.29};phase=t<25?'goal':'newAttack';}
  return{ball:b,owner,phase};
 }
 const cameraTarget=new THREE.Vector3(0,0,-2),cameraX={value:-7};
 const desiredCamera=new THREE.Vector3(),desiredTarget=new THREE.Vector3();
 function updatePlayers(t,state,dt){
  for(let i=0;i<people.length;i++){
   const p=people[i];let x=p.base.x,z=p.base.z;
   if(i===1&&t<6){x=mix(-22,-15,clamp(t/4,0,1));z=mix(8,6,clamp(t/4,0,1));}
   else if(i===3){x=mix(-5,7,clamp((t-6)/4,0,1));z=mix(-3,-2,clamp((t-6)/4,0,1));}
   else if(i===4){x=mix(11,21,clamp((t-12)/4,0,1));z=mix(16,15,clamp((t-12)/4,0,1));}
   else if(!p.keeper&&i!==5){const advance=clamp(t/18,0,1);x+=p.team===0?advance*7:advance*2;z+=Math.sin(t*.33+i)*.7;}
   if(t>=25){const reset=smooth(clamp((t-25)/3,0,1));x=mix(x,p.base.x,reset);z=mix(z,p.base.z,reset);}
   const dx=x-p.previous.x,dz=z-p.previous.z,speed=Math.hypot(dx,dz)/Math.max(dt,.001);
   if(speed>.1&&speed<30){const target=Math.atan2(dx,dz);p.heading+=Math.atan2(Math.sin(target-p.heading),Math.cos(target-p.heading))*Math.min(1,dt*9);}
   p.root.position.set(x,0,z);p.root.rotation.y=p.heading;p.body.position.y=0;p.body.rotation.z=0;p.body.rotation.x=0;
   const run=Math.min(1,speed/2.6),stride=Math.sin(t*9+i)*.52*run;
   p.limbs[0].rotation.x=stride;p.limbs[2].rotation.x=-stride;p.limbs[1].rotation.x=-stride*.7;p.limbs[3].rotation.x=stride*.7;
   p.body.position.y=Math.abs(Math.sin(t*9+i))*.065*run;
   if(i===5&&t>18.7&&t<19.4)p.body.position.y+=Math.sin((t-18.7)/.7*Math.PI)*.7;
   if(i===6&&t>19.5&&t<23){const dive=smooth(clamp((t-19.5)/.8,0,1));p.body.rotation.z=-dive*1.0;p.root.position.z=dive*2.0;p.body.position.y-=dive*.4;}
   if(t>21&&t<25&&p.team===0&&!p.keeper){p.limbs[1].rotation.z=.8;p.limbs[3].rotation.z=-.8;}else{p.limbs[1].rotation.z=0;p.limbs[3].rotation.z=0;}
   p.previous={x,z};
  }
  ownerRing.visible=state.owner!==null;
  if(ownerRing.visible){const p=people[state.owner].root.position;ownerRing.position.set(p.x,.11,p.z);}
 }
 function render(dt=.016,snap=false){
  const state=sequence(time);updatePlayers(time,state,dt);
  ballRoot.position.set(state.ball.x,state.ball.h,state.ball.z);ball.rotation.z=-time*4;ball.rotation.x=time*2;
  ballShadow.position.set(state.ball.x,.105,state.ball.z);ballShadow.scale.setScalar(1+(state.ball.h-.29)*.09);ballShadow.material.opacity=.38/(1+state.ball.h*.2);
  const follow=preset!=='overview';
  // A dead zone rejects tiny touches. The wide shot never whips after a pass.
  let desiredX=follow?clamp(state.ball.x*.56,-17,17):0;
  if(time>=25)desiredX=mix(desiredX,-7,smooth((time-25)/3));
  const gap=desiredX-cameraX.value;
  if(snap)cameraX.value=desiredX;
  else if(Math.abs(gap)>.8)cameraX.value+=(gap-Math.sign(gap)*.8)*(1-Math.exp(-dt*1.65));
  const aspect=camera.aspect;
  const distance=preset==='overview'?69:preset==='close'?40:49;
  // Narrow landscape viewports pull back to preserve the wide playing context.
  const extra=Math.max(0,1.55-aspect)*28;
  desiredCamera.set(cameraX.value,height,distance+extra);
  desiredTarget.set(cameraX.value,0,follow?clamp(state.ball.z*.10,-2,2)-2:-1);
  const adaptedFov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(fov/2))*Math.min(1,1.85/aspect)));
  if(snap){camera.position.copy(desiredCamera);cameraTarget.copy(desiredTarget);camera.fov=adaptedFov;}
  else {const q=1-Math.exp(-dt*3);camera.position.lerp(desiredCamera,q);cameraTarget.lerp(desiredTarget,q);camera.fov=mix(camera.fov,adaptedFov,q);}
  camera.updateProjectionMatrix();camera.lookAt(cameraTarget);renderer.render(scene,camera);
  if(Math.floor(time*5)!==lastUI){lastUI=Math.floor(time*5);updateUI(state);}
 }
 function updateUI(state=sequence(time)){
  $('scene-name').textContent=tr(state.phase);$('camera-name').textContent=tr(preset==='overview'?'overviewLabel':preset==='close'?'closeLabel':'tvLabel');
  $('clock').textContent=`12:${String(Math.floor(time)).padStart(2,'0')}`;
  $('score').textContent=time>=20.6?'1 : 0':'0 : 0';$('goal').hidden=!(time>=20.6&&time<25);
  $('timeline').value=time;$('elapsed').textContent=`0:${String(Math.floor(time)).padStart(2,'0')} / 0:28`;
  $('play').querySelector('span').textContent=tr(playing?'pause':'play');$('play').setAttribute('aria-pressed',String(!playing));
  $('play-icon').setAttribute('d',playing?'M6 4v12M14 4v12':'M6 3l10 7-10 7z');
 }
 function resize(){if(!wide.matches)return;const rect=stage.getBoundingClientRect();if(rect.width<1||rect.height<1)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();render(.016,true);}
 new ResizeObserver(resize).observe(stage);
 const audio={context:null,buffers:{},enabled:false,loaded:false,master:null,ambient:null,active:new Set(),loading:null};
 async function loadAudio(){
  if(audio.loaded)return;
  if(audio.loading)return audio.loading;
  audio.loading=(async()=>{
   const AC=window.AudioContext||window.webkitAudioContext;audio.context=new AC();
   audio.master=audio.context.createGain();audio.master.gain.value=Number($('volume').value)/100;audio.master.connect(audio.context.destination);
   await audio.context.resume();
   const names=['pass','shot','whistle','crowd','cheer','net'];
   await Promise.all(names.map(async name=>{
    let bytes;
    if(window.D6_AUDIO?.[name]){const raw=atob(window.D6_AUDIO[name]);bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)).buffer;}
    else {const response=await fetch(`audio/${name}.wav`);if(!response.ok)throw Error('Audio asset unavailable');bytes=await response.arrayBuffer();}
    audio.buffers[name]=await audio.context.decodeAudioData(bytes);
   }));audio.loaded=true;
  })();
  return audio.loading;
 }
 function sound(name,pan=0,level=1){
  if(!audio.enabled||!audio.loaded||!playing||!wide.matches||document.hidden)return;
  const source=audio.context.createBufferSource(),gain=audio.context.createGain(),panner=audio.context.createStereoPanner();
  source.buffer=audio.buffers[name];gain.gain.value=level;panner.pan.value=clamp(pan,-.65,.65);
  source.connect(gain);gain.connect(panner);panner.connect(audio.master);audio.active.add(source);
  source.onended=()=>{audio.active.delete(source);source.disconnect();gain.disconnect();panner.disconnect();};source.start();
 }
 function syncAudio(){
  const audible=audio.enabled&&audio.loaded&&playing&&wide.matches&&!document.hidden;
  if(!audible){
   if(audio.ambient){audio.ambient.stop();audio.ambient=null;}
   for(const source of audio.active)source.stop();audio.active.clear();
   if(audio.context?.state==='running')audio.context.suspend();return;
  }
  audio.context.resume();
  if(!audio.ambient){const source=audio.context.createBufferSource(),gain=audio.context.createGain();source.buffer=audio.buffers.crowd;source.loop=true;gain.gain.value=.22;source.connect(gain);gain.connect(audio.master);source.onended=()=>{source.disconnect();gain.disconnect();};source.start();audio.ambient=source;}
 }
 const cues=[[4,'pass'],[10,'pass'],[16,'shot'],[19,'shot'],[20.6,'net'],[20.65,'cheer'],[25,'whistle']];
 function seek(value){time=clamp(value,0,length-.001);lastUI=-1;for(const source of audio.active)source.stop();audio.active.clear();render(.016);updateUI();}
 $('play').addEventListener('click',()=>{playing=!playing;updateUI();syncAudio();});
 $('restart').addEventListener('click',()=>seek(0));
 $('timeline').addEventListener('input',event=>seek(Number(event.target.value)));
 document.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>seek(Number(button.dataset.time))));
 function setPreset(next){
  preset=['tv','overview','close'].includes(next)?next:'tv';
  const values={tv:[32,46],overview:[44,48],close:[26,40]};[height,fov]=values[preset];
  $('height').value=height;$('width').value=fov;$('height-value').textContent=`${height} m`;$('width-value').textContent=`${fov}°`;
  document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===preset)));
  const url=new URL(location.href);url.searchParams.set('variant',preset);try{history.replaceState(null,'',url);}catch{}
  lastUI=-1;updateUI();
 }
 document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>setPreset(b.dataset.preset)));
 for(const [id,setter,unit]of [['height',v=>height=v,'m'],['width',v=>fov=v,'°'],['volume',v=>{if(audio.master)audio.master.gain.setTargetAtTime(v/100,audio.context.currentTime,.03);},'%']]){
  $(id).addEventListener('input',event=>{const value=Number(event.target.value);setter(value);$(`${id}-value`).textContent=`${value}${unit==='°'?'':' '}${unit}`;});
 }
 $('sound').addEventListener('click',async()=>{
  const button=$('sound');button.disabled=true;button.querySelector('span').textContent=tr('soundLoading');
  try{await loadAudio();audio.enabled=!audio.enabled;button.setAttribute('aria-pressed',String(audio.enabled));button.querySelector('span').textContent=tr(audio.enabled?'soundOff':'soundOn');button.querySelector('svg').innerHTML=audio.enabled?'<path d="M3 8h3l4-4v12l-4-4H3zM14 6a6 6 0 0 1 0 8M13 8a3 3 0 0 1 0 4"/>':'<path d="M3 8h3l4-4v12l-4-4H3zM14 7l4 6M18 7l-4 6"/>';syncAudio();}
  catch(error){button.querySelector('span').textContent=tr('soundError');console.error(error);}
  finally{button.disabled=false;}
 });
 $('fullscreen').disabled=!document.fullscreenEnabled;
 $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{}resize();});
 $('language').addEventListener('click',()=>{
  lang=lang==='de'?'en':'de';document.documentElement.lang=lang;$('language').textContent=lang==='de'?'EN':'DE';$('language').setAttribute('aria-label',lang==='de'?'Switch to English':'Auf Deutsch wechseln');
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=tr(el.dataset.i18n));
  canvas.setAttribute('aria-label',tr('pitch'));$('fullscreen').setAttribute('aria-label',tr('fullscreen'));
  stage.closest('section').setAttribute('aria-label',lang==='de'?'3D TV-Kamera Demo':'3D TV camera demo');
  document.querySelector('.scorebug').setAttribute('aria-label',lang==='de'?'Illustrativer Spielstand':'Illustrative score');
  document.querySelector('.adjustments').setAttribute('aria-label',lang==='de'?'Kamera einstellen':'Camera settings');
  document.querySelector('.preset-group').setAttribute('aria-label',lang==='de'?'Kameraperspektive':'Camera perspective');
  document.querySelector('.scenes').setAttribute('aria-label',lang==='de'?'Demo-Szenen':'Demo scenes');
  $('sound').querySelector('span').textContent=tr(audio.enabled?'soundOff':'soundOn');lastUI=-1;updateUI();
 });
 document.addEventListener('keydown',event=>{if(event.target.closest('input,button,a'))return;if(event.code==='Space'){event.preventDefault();$('play').click();}if(event.code==='ArrowRight'){event.preventDefault();seek(time+1);}if(event.code==='ArrowLeft'){event.preventDefault();seek(time-1);}});
 wide.addEventListener('change',()=>{frameTime=performance.now();syncAudio();resize();});
 document.addEventListener('visibilitychange',()=>{frameTime=performance.now();syncAudio();});
 const initialPreset=new URL(location.href).searchParams.get('variant');if(initialPreset)setPreset(initialPreset);
 camera.position.set(-7,height,49);camera.lookAt(-7,0,-2);resize();render(.016,true);updateUI();$('loading').hidden=true;
 function tick(now){
  const dt=Math.min(.05,(now-(frameTime||now))/1000);frameTime=now;
  if(wide.matches&&!document.hidden){
   if(playing){const previous=time;time+=dt;if(time>=length){time=0;lastUI=-1;for(const source of audio.active)source.stop();audio.active.clear();}else for(const [at,name]of cues)if(previous<at&&time>=at)sound(name,(sequence(at).ball.x-cameraX.value)/40,name==='cheer'?.65:1);}
   render(dt);
   fpsFrames++;fpsTime+=dt;if(fpsTime>=1){measuredFPS=fpsFrames/fpsTime;fpsFrames=0;fpsTime=0;}
  }
  requestAnimationFrame(tick);
 }
 // Read-only instrumentation for prototype review; no persistence or match APIs.
 window.d6CameraPrototype={getState:()=>({time,playing,preset,height,fov,landscape:wide.matches,phase:sequence(time).phase,players:people.length,sound:audio.enabled,audioLoaded:audio.loaded,audioContext:audio.context?.state,activeSounds:audio.active.size,ambient:Boolean(audio.ambient),camera:{x:camera.position.x,y:camera.position.y,z:camera.position.z},fps:Math.round(measuredFPS),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles})};
 requestAnimationFrame(tick);
})();
