const fs=require('fs'),path=require('path');
const {read}=require('./user-character-glb.cjs');
const head=process.argv.includes('--head'),football=process.argv.includes('--football')||head;
const headReport=head?JSON.parse(fs.readFileSync('docs/spieler-nutzer-rig/head-transfer-qa.json')):null;
const folder='meshy_output/user-character-2026-10-03',target=folder+(head?'/character-head-textured-football.glb':football?'/character-football-animations.glb':'/character-textured-meshy-motions.glb');
const model=read(target),original=read(folder+'/character-original.glb'),combined=read(folder+'/character-meshy-motions.glb');
const material=model.json.materials[model.json.meshes[0].primitives[0].material];
const baseImage=model.json.textures[material.pbrMetallicRoughness.baseColorTexture.index].source;
const mask=fs.readFileSync(folder+(head?'/'+headReport.stage+'/cloth-mask-4k.png':'/cloth-mask.png')).toString('base64');
const references=JSON.parse(fs.readFileSync('docs/spieler-nutzer-rig/cloth-mask-qa.json')).referenceBrightness;
let html=fs.readFileSync('outputs/spieler-nutzer-rig.html','utf8');
function replace(before,after){if(!html.includes(before))throw Error('Preview template changed: '+before.slice(0,80));html=html.replace(before,after);}
replace('Dein geriggter Charakter','Dein Charakter · Meshy-Textur');
replace('<h1>Dein Charakter · Meshy-Bewegungen</h1>','<h1>Dein Charakter · Textur und Vereinsfarben</h1>');
replace('Gehen und Laufen aus Meshy. Ziehen','Neue 2K-Textur und Geh-/Laufclips aus Meshy. Ziehen');
replace("const embedded='"+original.bytes.toString('base64')+"',canvas=", "const originalEmbedded='"+original.bytes.toString('base64')+"',embedded='"+model.bytes.toString('base64')+"',canvas=");
replace("document.querySelector('#download').href='data:model/gltf-binary;base64,'+embedded;", "document.querySelector('#download').href='data:model/gltf-binary;base64,'+originalEmbedded;");
replace(combined.bytes.toString('base64'),model.bytes.toString('base64'));
replace('href="data:model/gltf-binary;base64,'+model.bytes.toString('base64')+'"','href="#"');
replace('Doppel6-Nutzercharakter-Meshy-Bewegungen.glb','Doppel6-Nutzercharakter-Texturiert.glb');
replace('Modell mit Meshy-Gehen/Laufen herunterladen','Texturiertes Modell mit Animationen herunterladen');
replace('<div class="timeline">',`<div class="controls"><label>Ansicht <select id="appearance" aria-label="Texturvergleich"><option value="textured">Neue Meshy-Textur</option><option value="original">Vorher · ohne Farbtextur</option></select></label><label>Trikot <input id="jersey-color" aria-label="Trikotfarbe" type="color" value="#22579a"></label><label>Hose <input id="shorts-color" aria-label="Hosenfarbe" type="color" value="#10243e"></label><label>Stutzen <input id="socks-color" aria-label="Stutzenfarbe" type="color" value="#f4f5f4"></label><button id="cloth-reset">Meshy-Farben wiederherstellen</button></div><div class="timeline">`);
replace('input{max-width:220px;', 'input[type=color]{width:48px;height:34px;border:0;padding:2px;background:#244044;border-radius:5px}button:disabled,input:disabled{opacity:.5}input{max-width:220px;');
replace('Die Geh- und Laufbewegungen stammen aus dem vorhandenen Meshy-Rig; ihre Schlüsselbilder bleiben erhalten.', 'Meshy hat die neue 2K-Farb- und Materialtextur erstellt (10 Credits); die bewährte Normalmap bleibt für glatte Oberflächen erhalten. Die Farbregler ändern nur die vorbereiteten Stoffflächen; der Download übernimmt die gewählten Farben. Geometrie, Rig und Animationsdaten bleiben erhalten.');
replace("const model=data.scene;model.updateMatrixWorld(true);",`const model=data.scene;model.updateMatrixWorld(true);
 const previous=await new GLTFLoader().parseAsync(Uint8Array.from(atob(originalEmbedded),c=>c.charCodeAt(0)).buffer,'');
 let oldMaterial;previous.scene.traverse(o=>{if(o.isMesh){oldMaterial=o.material;o.geometry.dispose()}});
 const surfaces=[];model.traverse(o=>{if(o.isMesh)surfaces.push(o)});if(surfaces.length!==1)throw Error('Erwartet wird eine Modelloberfläche');
 const texturedMaterial=surfaces[0].material,baseMap=texturedMaterial.map;
 const paint=document.createElement('canvas');paint.width=baseMap.image.width;paint.height=baseMap.image.height;const paintContext=paint.getContext('2d',{willReadFrequently:true});paintContext.drawImage(baseMap.image,0,0);const sourcePixels=paintContext.getImageData(0,0,paint.width,paint.height);
 const maskImage=new Image();maskImage.src='data:image/png;base64,${mask}';await maskImage.decode();const maskCanvas=document.createElement('canvas');maskCanvas.width=paint.width;maskCanvas.height=paint.height;const maskContext=maskCanvas.getContext('2d',{willReadFrequently:true});maskContext.drawImage(maskImage,0,0);const maskPixels=maskContext.getImageData(0,0,paint.width,paint.height).data;
 const canvasMap=new THREE.CanvasTexture(paint);canvasMap.colorSpace=THREE.SRGBColorSpace;canvasMap.flipY=false;canvasMap.wrapS=baseMap.wrapS;canvasMap.wrapT=baseMap.wrapT;
 const activeColors=[null,null,null],referenceBrightness=${JSON.stringify(references)},colorIDs=['jersey-color','shorts-color','socks-color'];let appearance='textured';
 function updateColors(){const result=new ImageData(new Uint8ClampedArray(sourcePixels.data),paint.width,paint.height);for(let i=0;i<result.data.length;i+=4){let region=-1;for(let k=0;k<3;k++)if(maskPixels[i+k]>127){region=k;break;}if(region<0||!activeColors[region])continue;const shade=Math.max(.25,Math.min(1.45,Math.max(sourcePixels.data[i],sourcePixels.data[i+1],sourcePixels.data[i+2])/255/referenceBrightness[region]));for(let k=0;k<3;k++)result.data[i+k]=Math.round(activeColors[region][k]*shade);}paintContext.putImageData(result,0,0);canvasMap.needsUpdate=true;texturedMaterial.map=activeColors.some(Boolean)?canvasMap:baseMap;texturedMaterial.needsUpdate=true;renderer.render(scene,camera);}
 function setAppearance(value){appearance=value;surfaces[0].material=value==='original'?oldMaterial:texturedMaterial;document.querySelector('#appearance').value=value;for(const id of colorIDs)document.getElementById(id).disabled=value==='original';document.querySelector('#cloth-reset').disabled=value==='original';renderer.render(scene,camera);}
 function setClothColor(region,value){if(region<0||region>2||!/^#[0-9a-f]{6}$/i.test(value))throw Error('Ungültige Stofffarbe');activeColors[region]=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));document.getElementById(colorIDs[region]).value=value;setAppearance('textured');updateColors();}
 function resetClothColors(){activeColors.fill(null);['#22579a','#10243e','#f4f5f4'].forEach((v,i)=>document.getElementById(colorIDs[i]).value=v);setAppearance('textured');updateColors();}
 document.querySelector('#appearance').onchange=e=>setAppearance(e.target.value);colorIDs.forEach((id,i)=>document.getElementById(id).onchange=e=>setClothColor(i,e.target.value));document.querySelector('#cloth-reset').onclick=resetClothColors;
 let exportedURL=null;
 function exportGLB(){if(!activeColors.some(Boolean))return Uint8Array.from(atob(embedded),c=>c.charCodeAt(0));const original=Uint8Array.from(atob(embedded),c=>c.charCodeAt(0)),view=new DataView(original.buffer),jsonLength=view.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(original.slice(20,20+jsonLength))),binOffset=20+jsonLength,bin=original.slice(binOffset+8,binOffset+8+view.getUint32(binOffset,true));const png=Uint8Array.from(atob(paint.toDataURL('image/png').split(',')[1]),c=>c.charCodeAt(0)),offset=Math.ceil(bin.length/4)*4;json.images[${baseImage}]={mimeType:'image/png',bufferView:json.bufferViews.length};json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:png.length});json.buffers=[{byteLength:offset+png.length}];const text=new TextEncoder().encode(JSON.stringify(json)),textSize=Math.ceil(text.length/4)*4,binSize=Math.ceil((offset+png.length)/4)*4,out=new Uint8Array(12+8+textSize+8+binSize),dv=new DataView(out.buffer);dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,out.length,true);dv.setUint32(12,textSize,true);dv.setUint32(16,0x4e4f534a,true);out.fill(32,20,20+textSize);out.set(text,20);const start=20+textSize;dv.setUint32(start,binSize,true);dv.setUint32(start+4,0x004e4942,true);out.set(bin,start+8);out.set(png,start+8+offset);return out;}
 document.querySelector('#combined-download').addEventListener('click',()=>{if(exportedURL)URL.revokeObjectURL(exportedURL);exportedURL=URL.createObjectURL(new Blob([exportGLB()],{type:'model/gltf-binary'}));document.querySelector('#combined-download').href=exportedURL;});
`);
replace('window.userCharacterPreview={ready:true,', 'window.userCharacterPreview={ready:true,setAppearance,setClothColor,resetClothColors,exportGLB,sourcePixels,maskPixels,paint,activeColors,get appearance(){return appearance},');
replace('Modell und Meshy-Geh-/Laufclips geladen. 0 zusätzliche Meshy-Credits.', '2K-Textur und Meshy-Bewegungen geladen. Texturpass: 10 Credits.');
if(football){
 const entries=JSON.parse(fs.readFileSync(folder+'/football-motion-pack/plan.json')).clips;
 const begin=html.indexOf('const mixer=new THREE.AnimationMixer(model),clips='),end=html.indexOf('for(const [name,c] of Object.entries(clips))',begin);
 if(begin<0||end<0)throw Error('Motion initialization template changed');
 html=html.slice(0,begin)+"const mixer=new THREE.AnimationMixer(model),clips={},actions={};for(const c of data.animations)clips[c.name==='Charged_Spell_Cast'?'gesture':c.name]=c;\n "+html.slice(end);
 replace('actions[name]=mixer.clipAction(c)',"actions[name]=mixer.clipAction(c);if(name.startsWith('celebrate_')){actions[name].setLoop(THREE.LoopOnce,1);actions[name].clampWhenFinished=true;}");
 replace("paused?'Weiter':'Pause'", "paused?(action.paused&&action.clampWhenFinished?'Erneut abspielen':'Weiter'):'Pause'");
 replace("paused=true;mixer.setTime", "paused=true;action.paused=false;action.enabled=true;mixer.setTime");
 replace("document.querySelector('#pause').onclick=()=>{paused=!paused;updateUI()}", "mixer.addEventListener('finished',()=>{paused=true;updateUI()});document.querySelector('#pause').onclick=()=>{if(action.paused&&action.clampWhenFinished)setMode('clip');else{paused=!paused;updateUI()}}");
 const start=html.indexOf('<select id="motion"'),finish=html.indexOf('</select>',start)+9;
 html=html.slice(0,start)+'<select id="motion" aria-label="Animation"><optgroup label="Laufen"><option value="walking">Gehen</option><option value="running">Bisheriger Lauf</option>'+entries.filter(c=>c.group==='running').map(c=>`<option value="${c.key}">${c.label}</option>`).join('')+'</optgroup><optgroup label="Jubel">'+entries.filter(c=>c.group==='celebration').map(c=>`<option value="${c.key}">${c.label}</option>`).join('')+'</optgroup><optgroup label="Original"><option value="gesture">Ursprünglicher Gestenclip</option></optgroup></select>'+html.slice(finish);
 replace('Doppel 6 · Dein Charakter · Meshy-Textur','Doppel 6 · Laufanimationen und Fußballjubel');
 replace('<h1>Dein Charakter · Textur und Vereinsfarben</h1>','<h1>Dein Charakter · Laufen und Fußballjubel</h1>');
 replace('Neue 2K-Textur und Geh-/Laufclips aus Meshy.', 'Drei neue Laufvarianten und drei Jubelclips aus Meshy.');
 replace('Doppel6-Nutzercharakter-Texturiert.glb','Doppel6-Nutzercharakter-Fussballanimationen.glb');
 replace('Texturiertes Modell mit Animationen herunterladen','Charakter mit allen 9 Animationen herunterladen');
 replace('Fußballaktionen und Match-Integration folgen separat.', 'Läufe wiederholen sich auf der Stelle. Jubelclips laufen einmal und halten die letzte Pose; über die Clip-Zeit kannst du einzelne Posen ansehen. Wiederholen: „Animation abspielen“. Ballaktionen und Match-Integration folgen separat.');
 replace('2K-Textur und Meshy-Bewegungen geladen. Texturpass: 10 Credits.', '9 Animationen geladen · Erweiterung: 5 Credits Rig + 18 Credits Animationen = 23 Credits.');
}
if(head){
 const previous=read(folder+'/character-football-animations.glb');
 replace("const previous=await new GLTFLoader().parseAsync(Uint8Array.from(atob(originalEmbedded)","const previousTextureEmbedded='"+previous.bytes.toString('base64')+"';const previous=await new GLTFLoader().parseAsync(Uint8Array.from(atob(previousTextureEmbedded)");
 replace('Vorher · ohne Farbtextur','Vorher · bisherige Kopftextur');
 replace('Neue Meshy-Textur','Neue Meshy-Kopftextur');
 replace("resize();angle('front');setMode('rest');", "resize();angle('head');setMode('rest');");
 replace('<h1>Dein Charakter · Laufen und Fußballjubel</h1>','<h1>Dein Charakter · Neue Kopf- und Augentextur</h1>');
 replace('Drei neue Laufvarianten und drei Jubelclips aus Meshy.', 'Kopf und Augen neu mit Meshy texturiert · 4K · neun Animationen.');
 replace('Doppel6-Nutzercharakter-Fussballanimationen.glb','Doppel6-Nutzercharakter-Kopftextur-Fussballanimationen.glb');
 replace('Meshy hat die neue 2K-Farb- und Materialtextur erstellt (10 Credits); die bewährte Normalmap bleibt für glatte Oberflächen erhalten.', 'Meshy hat Kopf und Augen neu texturiert (4K; '+headReport.totalHeadIterationCredits+' Credits für die Kopfiteration). Die neue Farbtextur wird nur im Kopfbereich und mit einem weichen Übergang am Hals übernommen; Körper- und Kleidungsfarben, Normal- und Materialkarten bleiben erhalten.');
 replace('9 Animationen geladen · Erweiterung: 5 Credits Rig + 18 Credits Animationen = 23 Credits.', 'Neue Kopftextur und 9 Animationen geladen · Kopfiteration: '+headReport.totalHeadIterationCredits+' Credits · Animationserweiterung: 23 Credits.');
}
const output=head?'outputs/spieler-nutzer-kopftextur.html':football?'outputs/spieler-nutzer-fussball-animationen.html':'outputs/spieler-nutzer-textur.html';
fs.writeFileSync(output,html);fs.writeFileSync('outputs/spieler-neustart.html',html);
console.log(JSON.stringify({output,htmlBytes:Buffer.byteLength(html),model:target,textureTaskId:head?headReport.headTextureTaskId:'01a10128-99dd-77a5-8b30-b633116d62fe',consumedCredits:head?headReport.totalHeadIterationCredits:football?23:10}));
