const fs=require('fs'),path=require('path'),assert=require('assert');
const {read}=require('./user-character-glb.cjs');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1080,height:1040}}),errors=[],remote=[],warnings=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});page.on('console',m=>{if(m.type()==='warning'&&/binding|not found/i.test(m.text()))warnings.push(m.text())});
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-textur.html')).href);
  await page.waitForFunction(()=>window.userCharacterPreview?.ready||window.userCharacterPreview?.error,null,{timeout:45000});
  const loaded=await page.evaluate(()=>{const p=window.userCharacterPreview;if(!p.ready)throw Error(p.error);let mesh;p.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o});return {meshes:1,joints:mesh.skeleton.bones.length,vertices:mesh.geometry.attributes.position.count,textureSize:[mesh.material.map.image.width,mesh.material.map.image.height],normalMap:Boolean(mesh.material.normalMap),roughnessMap:Boolean(mesh.material.roughnessMap),metalnessMap:Boolean(mesh.material.metalnessMap)};});
  assert.equal(loaded.joints,28);assert.equal(loaded.vertices,9725);assert.deepEqual(loaded.textureSize,[2048,2048]);assert(loaded.normalMap&&loaded.roughnessMap&&loaded.metalnessMap);
  const poses=await page.evaluate(()=>{const p=window.userCharacterPreview;let mesh;p.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o});const v=mesh.position.clone();const sample=()=>{p.scene.updateMatrixWorld(true);mesh.skeleton.update();return Array.from({length:mesh.geometry.attributes.position.count},(_,i)=>mesh.getVertexPosition(i,v).clone().applyMatrix4(mesh.matrixWorld));};p.setMode('rest');const rest=sample(),results=[];for(const name of ['walking','running','gesture']){p.setMotion(name);let finite=true,movement=0;for(let i=0;i<33;i++){p.seek(p.clip.duration*i/33);for(const [k,q] of sample().entries()){finite&&=[q.x,q.y,q.z].every(Number.isFinite);movement=Math.max(movement,q.distanceTo(rest[k]));}}p.setMode('rest');results.push({name,samples:33,finite,movement,restError:Math.max(...sample().map((q,i)=>q.distanceTo(rest[i])))});}return results;});
  for(const p of poses){assert(p.finite&&p.movement>.05&&p.restError<1e-5);}
  for(const angle of ['front','quarter','side','back','head']){await page.selectOption('#angle',angle);await page.screenshot({path:`outputs/user-texture-${angle}.png`});}
  await page.selectOption('#appearance','original');assert(await page.locator('#jersey-color').isDisabled());await page.selectOption('#angle','quarter');await page.screenshot({path:'outputs/user-texture-before.png'});
  await page.selectOption('#appearance','textured');assert(await page.locator('#jersey-color').isEnabled());
  const colorResults=[];
  for(const [region,id,color] of [[0,'jersey-color','#e53232'],[1,'shorts-color','#eec83b'],[2,'socks-color','#299c55']]){
   await page.getByRole('button',{name:'Meshy-Farben wiederherstellen'}).click();await page.locator('#'+id).fill(color);await page.locator('#'+id).dispatchEvent('change');
   const pixels=await page.evaluate(region=>{const p=window.userCharacterPreview,a=p.sourcePixels.data,b=p.paint.getContext('2d').getImageData(0,0,p.paint.width,p.paint.height).data,m=p.maskPixels;let changes=0,unexpected=0;for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]){changes++;if(m[i+region]<128)unexpected++;}}return {changes,unexpected};},region);assert(pixels.changes>10000);assert.equal(pixels.unexpected,0);colorResults.push({region,color,...pixels});
  }
  await page.evaluate(()=>{const p=window.userCharacterPreview;p.setClothColor(0,'#e53232');p.setClothColor(1,'#eec83b');p.setClothColor(2,'#299c55');p.angle('quarter')});await page.screenshot({path:'outputs/user-texture-colors.png'});
  const changedEvent=page.waitForEvent('download');await page.locator('#combined-download').click();await (await changedEvent).saveAs('outputs/user-texture-colors.glb');
  const changed=read('outputs/user-texture-colors.glb'),base=read('meshy_output/user-character-2026-10-03/character-textured-meshy-motions.glb');assert.deepEqual(changed.json.nodes,base.json.nodes);assert.deepEqual(changed.json.skins,base.json.skins);assert.deepEqual(changed.json.animations,base.json.animations);assert(changed.bin.subarray(0,base.bin.length).equals(base.bin));assert.equal(changed.json.images[0].mimeType,'image/png');
  await page.getByRole('button',{name:'Meshy-Farben wiederherstellen'}).click();
  assert(await page.evaluate(()=>{const p=window.userCharacterPreview,a=p.sourcePixels.data,b=p.paint.getContext('2d').getImageData(0,0,p.paint.width,p.paint.height).data;return a.every((v,i)=>v===b[i]);}));
  const defaultEvent=page.waitForEvent('download');await page.locator('#combined-download').click();await (await defaultEvent).saveAs('outputs/user-texture-download.glb');assert(fs.readFileSync('outputs/user-texture-download.glb').equals(base.bytes));
  const originalEvent=page.waitForEvent('download');await page.locator('#download').click();await (await originalEvent).saveAs('outputs/user-texture-original.glb');assert(fs.readFileSync('outputs/user-texture-original.glb').equals(fs.readFileSync('C:/Users/alex/Downloads/Meshy_AI_Stilisierter_Fußball_Charged_Spell_Cast.glb')));
  for(const [name,time] of [['walking',.24],['running',.20]]){await page.selectOption('#motion',name);await page.evaluate(t=>window.userCharacterPreview.seek(t),time);await page.screenshot({path:`outputs/user-texture-${name}.png`});}
  await page.getByRole('button',{name:'Animation abspielen',exact:true}).click();await page.waitForFunction(()=>window.userCharacterPreview.action.time>.12);await page.getByRole('button',{name:'Pause',exact:true}).click();const time=await page.evaluate(()=>window.userCharacterPreview.action.time);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.userCharacterPreview.action.time),time);
  await page.locator('#skeleton').check();assert(await page.evaluate(()=>window.userCharacterPreview.helper.visible));await page.locator('#skeleton').uncheck();
  for(const [name,size] of [['portrait',{width:390,height:844}],['landscape',{width:844,height:390}]]){await page.setViewportSize(size);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`outputs/user-texture-${name}.png`,fullPage:true});}
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(remote,[]);
  const report={loaded,poses,colorResults,defaultDownloadByteEqual:true,originalDownloadByteEqual:true,coloredDownloadRigAndMotionBinaryPreserved:true,resetPixelExact:true,errors,bindingWarnings:warnings,remoteRequests:remote.length,hardware:'Headless Edge software WebGL; real mobile performance and artistic acceptance pending'};fs.writeFileSync('docs/spieler-nutzer-rig/texture-browser-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
