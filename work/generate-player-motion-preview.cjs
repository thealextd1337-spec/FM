// Review artifact built from the production scene, model and pose functions.
const fs=require('fs');
const read=path=>fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n');
const motion=read('dist/pitch-motion-v102.js');
const poses=motion.slice(motion.indexOf('function v102LegPose('));
if(!poses.startsWith('function v102LegPose('))throw Error('Production leg solver not found');
const libraries=['camera-prototype/vendor/three-r160.min.js','player-model-v105.js','pitch-scene-v98.js'].map(path=>'<script>'+read('dist/'+path)+'</script>').join('\n');
const html=`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Doppel 6 · Spieler und Bewegungen</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#122624;color:#eef2e5;font:16px/1.5 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:24px}h1{font-size:clamp(22px,4vw,32px);margin:0 0 8px}p{margin:8px 0 16px;color:#cbd9cf}.controls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:20px 0}button,select{font:inherit;color:#eef2e5;background:#24413a;border:1px solid #698879;border-radius:6px;padding:10px 14px;min-height:44px}button{cursor:pointer}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #c7f36b;outline-offset:3px}label{display:flex;gap:10px;align-items:center}canvas{display:block;width:100%;aspect-ratio:16/9;background:#91b7bd;border-radius:8px}.legend{display:flex;justify-content:space-around;margin-top:10px;color:#eef2e5}a{color:#c7f36b;text-underline-offset:4px}.notes{font-size:14px;margin-top:24px}@media(max-width:600px){main{padding:16px}.legend{font-size:13px}label{width:100%}select{flex:1;min-width:0}}
</style><main><h1>Stilisiertes 3D · Spieler und Bewegungen</h1><p>Sportliche Proportionen, klare Formen und abgestimmter Ballkontakt.</p>
<div class="controls"><label>Bewegung <select id="motion"><option value="walk">Gehen</option><option value="run">Laufen</option><option value="turn">Bremsen und Drehen</option><option value="pass">Flacher Pass</option><option value="cross">Flanke</option><option value="shot">Schuss</option><option value="header">Kopfball</option><option value="volley">Volley</option><option value="idle">Stillstand</option></select></label><button id="pause" type="button">Pause</button><button id="restart" type="button">Von vorn</button></div>
<canvas id="pitch" aria-label="Drei Spieler mit unterschiedlichen Frisuren und Trikots zeigen die gewählte Bewegung"></canvas><div class="legend"><span>Locken · Feldspieler</span><span>Scheitel · Feldspieler</span><span>Kurzhaar · Torwart</span></div>
<p class="notes">Bewegungsprobe mit den Figuren und Bewegungsfunktionen der Spielansicht. Die Sequenz stellt keine Partie nach. Echte Partien verwenden weiterhin vorhandene Regeln, Taktiken und Banner.</p><a href="index.html">Spiel öffnen</a></main>
${libraries}
<script>function v98PitchPoint(p){return {x:p.x,z:p.y}}\n${poses}
const canvas=document.getElementById('pitch'),stage=D6PitchScene.create(canvas),select=document.getElementById('motion'),pause=document.getElementById('pause');
const kits=[{main:'#204944',trim:'#e7eee2',accent:'#dcbb66',style:'hoops'},{main:'#deddd2',trim:'#99283f',accent:'#153941',style:'pinstripes'},{main:'#254f73',trim:'#e7ce70'}];
const looks=[{skinTone:'deep',hairColor:'black',hairstyle:'tight_curls',faceShape:'oval',facialHair:'none'},{skinTone:'warm',hairColor:'dark-brown',hairstyle:'side_part',faceShape:'square',facialHair:'stubble'},{skinTone:'fair',hairColor:'gray',hairstyle:'buzz',faceShape:'angular',facialHair:'none'}];
const figures=kits.map((kit,i)=>stage.player(i%2,7+i,(i-1)*1.7,0,i===2,kit,looks[i]));
stage.ownerRing.visible=false;stage.ballRoot.visible=false;stage.ballShadow.visible=false;
const balls=figures.map(()=>{const ball=stage.ballRoot.clone(true);ball.visible=false;stage.scene.add(ball);return ball});
let elapsed=0,last=performance.now(),paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
function sync(){pause.textContent=paused?'Fortsetzen':'Pause';pause.setAttribute('aria-pressed',String(paused))}sync();
function reset(){elapsed=0;figures.forEach(v=>{v.previous={x:0,z:0};v.runSpeed=0;v.runPhase=v.number;v.heading=0;v.locomotion=null;v.lastGesture=null;v.gestureExit=null})}reset();
select.addEventListener('change',reset);document.getElementById('restart').addEventListener('click',reset);pause.addEventListener('click',()=>{paused=!paused;sync()});
function paint(now){
 const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(!paused&&!document.hidden)elapsed+=dt;
 const mode=select.value,active=!paused&&!document.hidden,tick=active?dt:0;
 figures.forEach((v,i)=>{
  const x=(i-1)*1.7,cycle=elapsed%5,travel=mode==='walk'?.8:mode==='run'?3:mode==='turn'?cycle<2?3:cycle<3?0:2:0;
  const direction=mode==='turn'&&cycle>3?(cycle-3)*.65:0;
  const person={x:v.previous.x+Math.sin(direction)*travel*tick,z:v.previous.z+Math.cos(direction)*travel*tick,number:v.number};
  v102RunPose(v,person,tick,active);v.previous={x:person.x,z:person.z};v.root.position.set(x,0,0);v.root.rotation.y=v.heading;
  const ball=balls[i];ball.visible=!['walk','run','turn','idle'].includes(mode);
  if(ball.visible){const p=Math.min(1,((elapsed%2)-.08)/.48);v102ActionPose(v,{kind:mode,progress:p,duration:.48,target:{x,y:10},contact:mode==='header'?{x,y:.5}:null},{x,z:0},false);ball.position.set(x,mode==='header'?2.65:mode==='volley'?1.2:.29,.65+Math.max(0,p)*1.5)}
 });
 const width=canvas.clientWidth,height=canvas.clientHeight;stage.renderer.setSize(width,height,false);stage.camera.aspect=width/height;stage.camera.fov=32;stage.camera.position.set(0,2.7,9);stage.camera.lookAt(0,1.35,0);stage.camera.updateProjectionMatrix();stage.renderer.render(stage.scene,stage.camera);requestAnimationFrame(paint);
}requestAnimationFrame(paint);
window.D6MotionPreview={stage,figures,balls,getState:()=>({elapsed,paused,mode:select.value})};
</script></html>`;
fs.mkdirSync('outputs',{recursive:true});fs.writeFileSync('outputs/player-motion-preview.html',html);console.log('Created outputs/player-motion-preview.html from production graphics.');
