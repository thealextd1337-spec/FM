const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const version = process.argv[2] || 'a2';
if(!/^a[2-9][0-9]*$/.test(version)) throw Error('Ungültige Studienversion');
const folder = path.join(root, `docs/spieler-${version}-mehransichten`);
const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'model.json'), 'utf8'));
const vendor = path.join(root, 'outputs/meshy-viewer-vendor');
const moduleURL = s => 'data:text/javascript;base64,' + Buffer.from(s).toString('base64');
const utils = moduleURL(fs.readFileSync(path.join(vendor, 'BufferGeometryUtils.js'), 'utf8'));
const loader = moduleURL(fs.readFileSync(path.join(vendor, 'GLTFLoader.js'), 'utf8').replace('../utils/BufferGeometryUtils.js', utils));
const orbit = moduleURL(fs.readFileSync(path.join(vendor, 'OrbitControls.js'), 'utf8'));
const three = moduleURL(fs.readFileSync(path.join(vendor, 'three.module.js'), 'utf8'));
const views = [['front','Vorne'], ['side','Seite'], ['back','Hinten'], ['quarter','Schräg vorne']];
const sources = [
  manifest.previous || {id:'a1', label:'A · bisherige Fassung', model:'meshy_output/20261002_222413_doppel-6-spieler-a-mehransicht_01a0fe49/player-a.glb', refs:'docs/spieler-a-mehransichten'},
  {id:version, label:manifest.label || version.toUpperCase()+' · neue Meshy-Fassung', model:manifest.model, refs:manifest.refs || `docs/spieler-${version}-mehransichten`, referenceLabel:manifest.referenceLabel}
];
const previousLabel = sources[0].id === 'a1' ? 'A' : sources[0].id.toUpperCase();
const currentLabel = version.toUpperCase();
const goal = manifest.goal || 'etwas kürzere Arme und ein kürzerer, kräftigerer Hals';
const comparisonTitle = manifest.comparisonTitle || `${previousLabel} → ${currentLabel} · Proportionen vergleichen`;
const description = manifest.description || 'Beide tatsächlichen Meshy-Modelle aus vier Ansichten. Ziehen zum gemeinsamen Drehen; scrollen oder mit zwei Fingern zoomen.';
const note = manifest.note || `${currentLabel} wurde aus korrigierten Bildvorlagen neu erzeugt. Ziel: ${goal}. Die Prozentangaben im Gestaltungsbrief sind keine gemessenen Modellwerte. Beide Figuren werden für den Vergleich auf dieselbe Anzeigehöhe skaliert; die gespeicherte Geometrie bleibt erhalten. Noch ohne Rigging oder Spielanimation.`;
const assets = sources.map(s => {
  const bytes = fs.readFileSync(path.join(root, s.model));
  const gltf = JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  return {...s, bytes:bytes.toString('base64'), triangles:gltf.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+gltf.accessors[p.indices??p.attributes.POSITION].count/3,0), images:Object.fromEntries(views.map(([v])=>[v,'data:image/png;base64,'+fs.readFileSync(path.join(root,s.refs,v+'.png')).toString('base64')]))};
});
const panels = assets.map(s => `<section class="panel"><h2>${s.label}</h2><canvas id="${s.id}" aria-label="Drehbares 3D-Modell ${s.id.toUpperCase()}"></canvas><div class="meta">${s.triangles.toLocaleString('de-DE')} Dreiecke · <a href="data:model/gltf-binary;base64,${s.bytes}" download="Doppel6-Spieler-${s.id.toUpperCase()}.glb">GLB herunterladen</a></div><details><summary>${s.referenceLabel || 'Verwendete Bildvorlage anzeigen'}</summary><figure><img id="ref-${s.id}" src="${s.images.front}" alt="Bildvorlage ${s.id.toUpperCase()} von vorne"></figure></details></section>`).join('');
const html = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Doppel 6 · ${previousLabel} und ${currentLabel} im Vergleich</title>
<style>*{box-sizing:border-box}body{margin:0;background:#102428;color:#edf2e8;font:15px system-ui}main{max-width:1450px;margin:auto;padding:18px}h1{font-size:25px;margin:0 0 8px}p{line-height:1.5;color:#b9ccc6}.layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.panel{background:#183439;border-radius:14px;overflow:hidden;min-width:0}h2{font-size:17px;margin:0;padding:12px 14px}canvas{width:100%;height:68vh;min-height:320px;display:block;touch-action:none}.meta,summary{padding:10px 14px}.meta{font-size:13px;color:#bfd2cb}a{color:#d2ef9a}summary{cursor:pointer}figure{margin:0;background:#d7d9d8;height:55vh}figure img{width:100%;height:100%;object-fit:contain}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}button{color:inherit;background:#244044;border:1px solid #58726d;border-radius:8px;padding:10px 14px;font:inherit;cursor:pointer}button[aria-pressed=true]{background:#c5ed78;color:#162d24}footer{color:#a8bbb4;font-size:13px;line-height:1.5;margin-top:14px}@media(max-width:700px){main{padding:12px}.layout{grid-template-columns:1fr}canvas{height:55vh;min-height:280px}h1{font-size:21px}}@media(max-height:500px) and (min-width:701px){canvas{height:76vh;min-height:250px}}</style>
<main><h1>${comparisonTitle}</h1><p>${description}</p><div class="controls">${views.map(([v,l])=>`<button data-view="${v}" aria-pressed="${v==='front'}">${l}</button>`).join('')}<button data-view="head" aria-pressed="false">Gesicht</button><button id="reset">Ansicht zurücksetzen</button></div><div class="layout">${panels}</div><p id="status" role="status">Modelle werden geladen …</p><footer>${note}</footer></main>
<script type="importmap">${JSON.stringify({imports:{three}})}</script><script type="module">
import * as THREE from 'three';import {GLTFLoader} from '${loader}';import {OrbitControls} from '${orbit}';
const assets=${JSON.stringify(assets)},labels=${JSON.stringify(Object.fromEntries(views))};const studies=[];let syncing=false;
try{
for(const asset of assets){
 const canvas=document.getElementById(asset.id),renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#cbd5d1');scene.add(new THREE.HemisphereLight(0xfffaf0,0x576858,2));const key=new THREE.DirectionalLight(0xfff7e9,2.2);key.position.set(3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;key.shadow.normalBias=.025;scene.add(key);
 const model=(await new GLTFLoader().parseAsync(Uint8Array.from(atob(asset.bytes),c=>c.charCodeAt(0)).buffer,'')).scene;model.updateMatrixWorld(true);const rawBounds=new THREE.Box3().setFromObject(model),size=rawBounds.getSize(new THREE.Vector3());if(![size.x,size.y,size.z].every(Number.isFinite)||size.y<=0)throw Error('Ungültige Modellgröße');
 const scale=1.8/size.y;model.scale.multiplyScalar(scale);model.position.sub(rawBounds.getCenter(new THREE.Vector3()).multiplyScalar(scale));model.position.y+=.9;scene.add(model);model.traverse(o=>{if(o.isMesh){o.castShadow=true;for(const m of [].concat(o.material)){m.roughness=.9;m.metalness=0;}}});model.updateMatrixWorld(true);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({color:'#688270',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.004;ground.receiveShadow=true;scene.add(ground);
 const camera=new THREE.OrthographicCamera(-1,1,1.03,-1.03,.01,100),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minZoom=.3;controls.maxZoom=6;
 const study={id:asset.id,asset,model,rawBounds,scale,camera,controls,scene,renderer};studies.push(study);
 function resize(){renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);const aspect=canvas.clientWidth/canvas.clientHeight;camera.left=-1.03*aspect;camera.right=1.03*aspect;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();
 controls.addEventListener('change',()=>{if(syncing)return;syncing=true;for(const other of studies){if(other===study)continue;other.camera.position.copy(camera.position);other.camera.quaternion.copy(camera.quaternion);other.camera.zoom=camera.zoom;other.camera.updateProjectionMatrix();other.controls.target.copy(controls.target);other.controls.update();}syncing=false;});
}
function setView(view){const positions={front:[0,.9,4.4],side:[4.4,.9,0],back:[0,.9,-4.4],quarter:[3.1,.9,3.1],head:[0,1.62,4.4]};if(!positions[view])throw Error('Unbekannte Ansicht');syncing=true;for(const s of studies){s.camera.position.fromArray(positions[view]);s.camera.zoom=view==='head'?3.5:1;s.camera.updateProjectionMatrix();s.controls.target.set(0,view==='head'?1.62:.9,0);s.controls.update();if(s.asset.images[view]){const img=document.getElementById('ref-'+s.id);img.src=s.asset.images[view];img.alt='Bildvorlage '+s.id.toUpperCase()+' · '+labels[view];}s.renderer.render(s.scene,s.camera);}syncing=false;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelector('#reset').onclick=()=>setView('front');setView('front');
function frame(){requestAnimationFrame(frame);for(const s of studies){s.controls.update();s.renderer.render(s.scene,s.camera);}}frame();window.playerA2Study={ready:true,studies,setView};document.getElementById('status').textContent='${previousLabel} und ${currentLabel} geladen. Beide Ansichten drehen und zoomen gemeinsam.';
}catch(e){window.playerA2Study={ready:false,error:e.message};document.getElementById('status').textContent='Modellvergleich konnte nicht starten: '+e.message;console.error(e);}
</script><!-- Three.js r160 MIT: ${fs.readFileSync(path.join(vendor,'LICENSE-three.txt'),'utf8').replace(/-->/g,'')} --></html>`;
fs.writeFileSync(path.join(root,`outputs/spieler-${version}-meshy-vergleich.html`),html);
fs.writeFileSync(path.join(root,'outputs/spieler-neustart.html'),html);
console.log(JSON.stringify({output:`outputs/spieler-${version}-meshy-vergleich.html`,models:assets.map(a=>({id:a.id,triangles:a.triangles})),bytes:Buffer.byteLength(html)}));
