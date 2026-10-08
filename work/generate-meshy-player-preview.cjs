const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),job=JSON.parse(fs.readFileSync(path.resolve(root,process.argv[2]||'meshy_output/soccer-b-rigging.json'),'utf8').replace(/^\uFEFF/,''));
const output=path.resolve(root,process.argv[3]||'outputs/meshy-player-b-preview.html'),title=process.argv[4]||'Spieler nach Konzept B';
const vendor=path.join(root,'outputs/meshy-viewer-vendor');
const moduleUrl=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const utils=moduleUrl(fs.readFileSync(path.join(vendor,'BufferGeometryUtils.js'),'utf8'));
const loader=moduleUrl(fs.readFileSync(path.join(vendor,'GLTFLoader.js'),'utf8').replace('../utils/BufferGeometryUtils.js',utils));
const orbit=moduleUrl(fs.readFileSync(path.join(vendor,'OrbitControls.js'),'utf8'));
const three=moduleUrl(fs.readFileSync(path.join(vendor,'three.module.js'),'utf8'));
const assets=Object.fromEntries(['rigged','walking','running'].map(k=>[k,fs.readFileSync(path.join(job.project,k+'.glb')).toString('base64')]));
const rigBytes=fs.readFileSync(path.join(job.project,'rigged.glb')),rig=JSON.parse(rigBytes.subarray(20,20+rigBytes.readUInt32LE(12)).toString());
const triangleCount=rig.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+rig.accessors[p.indices??p.attributes.POSITION].count/3,0),jointCount=rig.skins[0].joints.length;
const html=`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Doppel 6 · Meshy-Spieler B</title>
<style>body{margin:0;background:#102428;color:#eef5ed;font:15px system-ui}main{max-width:1040px;margin:auto;padding:18px}h1{font-size:22px;margin:0 0 8px}p{color:#b9ccc6}canvas{display:block;width:100%;height:70vh;min-height:360px;touch-action:none;border-radius:14px}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}button,select{font:inherit;color:inherit;background:#244044;border:1px solid #57716c;border-radius:8px;padding:10px;cursor:pointer}button[aria-pressed=true]{background:#c5ef73;color:#163025}input{max-width:200px}#status{min-height:22px}</style>
<main><h1>Doppel 6 · Spieler nach Konzept B</h1><p>3.633 Dreiecke · 24 Gelenke · ein Material. Ziehen zum Drehen, scrollen zum Zoomen.</p><canvas aria-label="Geriggter Fußballspieler aus Meshy"></canvas><div class="controls"><button data-mode="rigged" aria-pressed="true">A-Pose</button><button data-mode="walking" aria-pressed="false">Gehen</button><button data-mode="running" aria-pressed="false">Laufen</button><button id="pause" aria-pressed="false">Pause</button><select id="angle" aria-label="Blickwinkel"><option value="front">Vorne</option><option value="side">Seite</option><option value="back">Hinten</option><option value="boots">Schuhe</option></select><label>Tempo <input id="speed" aria-label="Wiedergabetempo" type="range" min="0.25" max="1.5" step="0.05" value="1"></label></div><p id="status" role="status">Modell wird geladen …</p><p>Lokale Modellprobe mit Geh- und Laufclips. A-Pose ist eine Modellansicht, keine fertige Idle-Animation.</p></main>
<script type="importmap">${JSON.stringify({imports:{three}})}</script><script type="module">
import * as THREE from 'three';import {GLTFLoader} from '${loader}';import {OrbitControls} from '${orbit}';
const canvas=document.querySelector('canvas'),status=document.querySelector('#status');
try{
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;
const scene=new THREE.Scene();scene.background=new THREE.Color('#c7d5d1');scene.add(new THREE.HemisphereLight(0xf5f7ef,0x516653,2.1));const key=new THREE.DirectionalLight(0xfff8e9,2.2);key.position.set(3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({color:0x63846c,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);const grid=new THREE.GridHelper(6,12,0x47614c,0x76977d);grid.position.y=.002;scene.add(grid);
const camera=new THREE.PerspectiveCamera(32,1,.01,100);camera.position.set(0,1.2,4.4);const controls=new OrbitControls(camera,canvas);controls.target.set(0,.9,0);controls.enableDamping=true;controls.minDistance=.35;controls.maxDistance=8;
const embedded=${JSON.stringify(assets)},gltfLoader=new GLTFLoader(),models={};for(const [name,base64] of Object.entries(embedded)){const data=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));models[name]=await gltfLoader.parseAsync(data.buffer,'');}
const model=models.rigged.scene;scene.add(model);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
const mixer=new THREE.AnimationMixer(model),actions={};const clips={};
for(const [name,gltf] of Object.entries(models)){const clip=gltf.animations[0].clone();clip.name=name;const rootMotion=[];for(const t of clip.tracks){if(/Hips.position$/.test(t.name)){for(let i=0;i<t.values.length;i+=3){t.values[i]=t.values[0];t.values[i+2]=t.values[2];}rootMotion.push(t.name);}}clips[name]=clip;actions[name]=mixer.clipAction(clip);}
let mode='rigged',paused=false,speed=1;actions.rigged.play();function pauseUi(){const b=document.querySelector('#pause');b.textContent=paused?'Weiter':'Pause';b.setAttribute('aria-pressed',String(paused));}
function setMode(name){if(!actions[name])throw Error('Unknown mode');const old=actions[mode];mode=name;actions[name].reset().setEffectiveWeight(1).play();if(old!==actions[name]){actions[name].crossFadeFrom(old,.2,false);}document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===name)));}
function angle(value){const positions={front:[0,1.2,4.4],side:[4.4,1.2,0],back:[0,1.2,-4.4],boots:[.65,.40,1.15]};camera.position.fromArray(positions[value]);controls.target.set(0,value==='boots'?.20:.9,0);controls.update();}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));document.querySelector('#pause').onclick=e=>{paused=!paused;pauseUi();};document.querySelector('#angle').onchange=e=>angle(e.target.value);document.querySelector('#speed').oninput=e=>speed=Number(e.target.value);
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();
const clock=new THREE.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);if(!paused)mixer.update(dt*speed);controls.update();renderer.render(scene,camera);}frame();
window.meshyPreview={ready:true,model,mixer,clips,actions,scene,renderer,camera,setMode,angle,seek(name,time){paused=true;pauseUi();mixer.stopAllAction();mode=name;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===name)));actions[name].reset().setEffectiveWeight(1).play();mixer.setTime(time);scene.updateMatrixWorld(true);renderer.render(scene,camera);},get mode(){return mode;}};status.textContent='Modell und beide Bewegungsclips geladen. Übergänge: 0,2 Sekunden.';
}catch(error){status.textContent='3D-Probe konnte nicht starten: '+error.message;window.meshyPreview={ready:false,error:error.message};console.error(error);}
</script><!-- Three.js r160 MIT: ${fs.readFileSync(path.join(vendor,'LICENSE-three.txt'),'utf8').replace(/-->/g,'')} --></html>`;
fs.writeFileSync(output,html.replace('Doppel 6 · Spieler nach Konzept B','Doppel 6 · '+title).replace('3.633 Dreiecke · 24 Gelenke · ein Material',triangleCount.toLocaleString('de-DE')+' Dreiecke · '+jointCount+' Gelenke · '+rig.materials.length+' '+(rig.materials.length===1?'Material':'Materialien')));console.log(output);


