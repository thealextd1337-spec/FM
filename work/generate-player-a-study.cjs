const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const project=path.join(root,'meshy_output/20261002_222413_doppel-6-spieler-a-mehransicht_01a0fe49');
const vendor=path.join(root,'outputs/meshy-viewer-vendor');
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const utils=data(fs.readFileSync(path.join(vendor,'BufferGeometryUtils.js'),'utf8'));
const loader=data(fs.readFileSync(path.join(vendor,'GLTFLoader.js'),'utf8').replace('../utils/BufferGeometryUtils.js',utils));
const orbit=data(fs.readFileSync(path.join(vendor,'OrbitControls.js'),'utf8'));
const three=data(fs.readFileSync(path.join(vendor,'three.module.js'),'utf8'));
const modelBytes=fs.readFileSync(path.join(project,'player-a.glb'));
const gltf=JSON.parse(modelBytes.subarray(20,20+modelBytes.readUInt32LE(12)).toString());
const triangles=gltf.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+gltf.accessors[p.indices??p.attributes.POSITION].count/3,0);
const views=[['front','Vorne'],['side','Seite'],['back','Hinten'],['quarter','Schräg vorne']];
const refs=Object.fromEntries(views.map(([name])=>[name,'data:image/png;base64,'+fs.readFileSync(path.join(root,'docs/spieler-a-mehransichten',name+'.png')).toString('base64')]));
const buttons=views.map(([name,label])=>`<button data-view="${name}" aria-pressed="${name==='front'}">${label}</button>`).join('');
const html=`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Doppel 6 · Spieler A aus vier Ansichten</title>
<style>*{box-sizing:border-box}body{margin:0;background:#102428;color:#edf2e8;font:15px system-ui}main{max-width:1350px;margin:auto;padding:18px}h1{font-size:24px;margin:0 0 7px}p{line-height:1.5;color:#b9ccc6;margin:6px 0 14px}.layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(230px,1fr);gap:16px}.panel{background:#183439;border-radius:14px;overflow:hidden;min-width:0}.label{padding:12px 14px;font-weight:650}canvas{width:100%;height:65vh;min-height:360px;display:block;touch-action:none}figure{margin:0;background:#d7d9d8;display:flex;align-items:center;justify-content:center;height:65vh;min-height:360px}figure img{width:100%;height:100%;object-fit:contain}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}button,a.button{color:inherit;background:#244044;border:1px solid #58726d;border-radius:8px;padding:10px 14px;font:inherit;cursor:pointer;text-decoration:none}button[aria-pressed=true]{background:#c5ed78;color:#162d24}#status{min-height:24px}footer{margin-top:16px;color:#a8bbb4;font-size:13px}@media(max-width:700px){.layout{grid-template-columns:1fr}canvas{height:62vh}figure{height:62vh}main{padding:12px}h1{font-size:21px}}@media(max-height:500px) and (min-width:701px){canvas,figure{height:70vh;min-height:260px}}</style>
<main><h1>Variante A · erster Meshy-Entwurf</h1><p>Aus Vorder-, Seiten-, Rücken- und Dreiviertelansicht. Ziehen zum Drehen, scrollen oder mit zwei Fingern zoomen.</p>
<div class="layout"><section class="panel"><div class="label">Tatsächliches 3D-Modell</div><canvas aria-label="Drehbarer erster Meshy-Entwurf von Spieler A"></canvas></section><section class="panel"><div class="label" id="ref-label">Bildvorlage · Vorne</div><figure><img id="reference" src="${refs.front}" alt="Ausgewählte Variante A von vorne"></figure></section></div>
<div class="controls" aria-label="Blickwinkel">${buttons}<button data-view="head" aria-pressed="false">Gesicht</button><button id="reset">Ansicht zurücksetzen</button><a class="button" href="data:model/gltf-binary;base64,${modelBytes.toString('base64')}" download="Doppel6-Spieler-A-v1.glb">Modell herunterladen</a></div>
<p id="status" role="status">Modell wird geladen …</p><footer>Erste Formprüfung · ${triangles.toLocaleString('de-DE')} Dreiecke · noch keine Spielanimation. Bildvorlagen und Modell sind zur Beurteilung nebeneinander dargestellt.</footer></main>
<script type="importmap">${JSON.stringify({imports:{three}})}</script><script type="module">
import * as THREE from 'three';import {GLTFLoader} from '${loader}';import {OrbitControls} from '${orbit}';
const refs=${JSON.stringify(refs)},labels=${JSON.stringify(Object.fromEntries(views))};const canvas=document.querySelector('canvas'),status=document.querySelector('#status');
try{
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#cbd5d1');scene.add(new THREE.HemisphereLight(0xfffaf0,0x576858,2.0));
const key=new THREE.DirectionalLight(0xfff7e9,2.2);key.position.set(3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;key.shadow.normalBias=.025;scene.add(key);
const model=(await new GLTFLoader().parseAsync(Uint8Array.from(atob('${modelBytes.toString('base64')}'),c=>c.charCodeAt(0)).buffer,'')).scene;
model.updateMatrixWorld(true);const rawBounds=new THREE.Box3().setFromObject(model);const dimensions=rawBounds.getSize(new THREE.Vector3());
if(![dimensions.x,dimensions.y,dimensions.z].every(Number.isFinite)||dimensions.y<=0)throw Error('Ungültige Modellgröße');
const scale=1.8/dimensions.y;model.scale.multiplyScalar(scale);model.position.sub(rawBounds.getCenter(new THREE.Vector3()).multiplyScalar(scale));model.position.y+=.9;scene.add(model);
model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;for(const material of [].concat(o.material)){material.roughness=.9;material.metalness=0;}}});model.updateMatrixWorld(true);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({color:'#688270',roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.position.y=-.004;scene.add(ground);
const camera=new THREE.OrthographicCamera(-1,1,1.03,-1.03,.01,100);const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minZoom=.3;controls.maxZoom=6;
function setView(view){const positions={front:[0,.9,4.4],side:[4.4,.9,0],back:[0,.9,-4.4],quarter:[3.1,.9,3.1],head:[0,1.62,4.4]};if(!positions[view])throw Error('Unknown view');camera.position.fromArray(positions[view]);camera.zoom=view==='head'?3.5:1;camera.updateProjectionMatrix();controls.target.set(0,view==='head'?1.62:.9,0);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));if(refs[view]){document.querySelector('#reference').src=refs[view];document.querySelector('#reference').alt='Ausgewählte Variante A · '+labels[view];document.querySelector('#ref-label').textContent='Bildvorlage · '+labels[view];}renderer.render(scene,camera);}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelector('#reset').onclick=()=>setView('front');
function resize(){renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);const aspect=canvas.clientWidth/canvas.clientHeight;camera.left=-1.03*aspect;camera.right=1.03*aspect;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();setView('front');
function frame(){requestAnimationFrame(frame);controls.update();renderer.render(scene,camera);}frame();
window.playerAStudy={ready:true,model,scene,renderer,camera,controls,setView,rawBounds,scale,triangles:${triangles},refs};status.textContent='Erste Meshy-Fassung geladen. Alle vier Vorlagen sind zum Vergleich auswählbar.';
}catch(error){window.playerAStudy={ready:false,error:error.message};status.textContent='Die Modellprobe konnte nicht starten: '+error.message;console.error(error);}
</script><!-- Three.js r160 MIT: ${fs.readFileSync(path.join(vendor,'LICENSE-three.txt'),'utf8').replace(/-->/g,'')} --></html>`;
fs.writeFileSync(path.join(root,'outputs/spieler-a-meshy-v1.html'),html);
const previous=path.join(root,'outputs/spieler-neustart.html'),backup=path.join(root,'outputs/spieler-neustart-einzelbild.html');
if(fs.existsSync(previous)&&!fs.existsSync(backup))fs.copyFileSync(previous,backup);
fs.writeFileSync(previous,html);console.log(JSON.stringify({output:'outputs/spieler-a-meshy-v1.html',triangles,bytes:Buffer.byteLength(html)}));
