const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const {pathToFileURL}=require('url');const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1080,height:920}}),errors=[],remote=[],warnings=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&/PropertyBinding|not found|binding/i.test(m.text()))warnings.push(m.text())});page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-rig.html')).href);await page.waitForFunction(()=>window.userCharacterPreview?.ready||window.userCharacterPreview?.error);
  const rig=await page.evaluate(()=>{
   const p=window.userCharacterPreview;if(!p.ready)throw Error(p.error);const meshes=[];let maxWeightError=0,unweightedVertices=0,invalidJointReferences=0;
   p.model.traverse(o=>{if(o.isSkinnedMesh){meshes.push({vertices:o.geometry.attributes.position.count,joints:o.skeleton.bones.length});const weights=o.geometry.attributes.skinWeight,joints=o.geometry.attributes.skinIndex;for(let i=0;i<weights.count;i++){let sum=0;for(let k=0;k<4;k++){const w=weights.getComponent(i,k),j=joints.getComponent(i,k);if(w>0&&(j<0||j>=o.skeleton.bones.length))invalidJointReferences++;sum+=w;}if(sum===0)unweightedVertices++;maxWeightError=Math.max(maxWeightError,Math.abs(sum-1));}}});
   return {meshes,maxWeightError,unweightedVertices,invalidJointReferences,clip:p.clip.name,duration:p.clip.duration};
  });assert.equal(rig.meshes.length,1);assert.equal(rig.meshes[0].joints,28);assert(rig.maxWeightError<.001);assert.equal(rig.unweightedVertices,0);assert.equal(rig.invalidJointReferences,0);
  const deformation=await page.evaluate(()=>{
   const p=window.userCharacterPreview;let mesh;p.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o});const v=mesh.position.clone();function capture(){p.scene.updateMatrixWorld(true);mesh.skeleton.update();return Array.from({length:mesh.geometry.attributes.position.count},(_,i)=>mesh.getVertexPosition(i,v).clone().applyMatrix4(mesh.matrixWorld));}
   p.setMode('rest');const rest=capture(),results=[];const samples=33;
   for(const name of ['walking','running','gesture']){p.setMotion(name);let finite=true,maxMovement=0,minY=Infinity,maxY=-Infinity;
    for(let j=0;j<samples;j++){p.seek(p.clip.duration*j/samples);const positions=capture();for(let i=0;i<positions.length;i++){const q=positions[i];finite&&=[q.x,q.y,q.z].every(Number.isFinite);maxMovement=Math.max(maxMovement,q.distanceTo(rest[i]));minY=Math.min(minY,q.y);maxY=Math.max(maxY,q.y);}}
    p.setMode('rest');const restored=capture();const restoreError=Math.max(...restored.map((q,i)=>q.distanceTo(rest[i])));results.push({name,samples,finite,maxMovementMetres:maxMovement,minY,maxY,restPoseRestorationErrorMetres:restoreError});
   }return results;
  });for(const d of deformation){assert(d.finite);assert(d.maxMovementMetres>.05);assert(d.restPoseRestorationErrorMetres<1e-5);}
  for(const angle of ['front','quarter','side','back','head']){await page.selectOption('#angle',angle);await page.screenshot({path:`outputs/user-character-${angle}.png`});}
  for(const [name,time] of [['walking',.24],['running',.20]]){await page.selectOption('#motion',name);await page.evaluate(t=>window.userCharacterPreview.seek(t),time);await page.selectOption('#angle','quarter');await page.screenshot({path:`outputs/user-character-${name}.png`});}
  await page.selectOption('#motion','gesture');await page.selectOption('#angle','front');await page.getByRole('button',{name:'Animation abspielen',exact:true}).click();await page.waitForFunction(()=>window.userCharacterPreview.action.time>.12);
  await page.getByRole('button',{name:'Pause',exact:true}).click();const paused=await page.evaluate(()=>window.userCharacterPreview.action.time);await page.waitForTimeout(160);assert(Math.abs(await page.evaluate(()=>window.userCharacterPreview.action.time)-paused)<1e-6);
  await page.locator('#time').fill('1.35');assert(Math.abs(await page.evaluate(()=>window.userCharacterPreview.action.time)-1.35)<.011);await page.screenshot({path:'outputs/user-character-clip.png'});
  await page.locator('#skeleton').check();assert(await page.evaluate(()=>window.userCharacterPreview.helper.visible));await page.screenshot({path:'outputs/user-character-skeleton.png'});
  await page.getByRole('button',{name:'Ruhepose',exact:true}).click();assert.equal(await page.locator('#rest').getAttribute('aria-pressed'),'true');
  const event=page.waitForEvent('download');await page.locator('#download').click();const download=await event;await download.saveAs('outputs/user-character-download.glb');
  const manifest=JSON.parse(fs.readFileSync('docs/spieler-nutzer-rig/model.json'));
  const original=fs.readFileSync(manifest.source),local=fs.readFileSync(manifest.model);assert(original.equals(local));assert(local.equals(fs.readFileSync('outputs/user-character-download.glb')));
  const combinedEvent=page.waitForEvent('download');await page.locator('#combined-download').click();const combinedDownload=await combinedEvent;await combinedDownload.saveAs('outputs/user-character-combined-download.glb');assert(fs.readFileSync('outputs/user-character-combined-download.glb').equals(fs.readFileSync('meshy_output/user-character-2026-10-03/character-meshy-motions.glb')));
  for(const [name,size] of [['portrait',{width:390,height:844}],['landscape',{width:844,height:390}]]){await page.setViewportSize(size);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`outputs/user-character-${name}.png`,fullPage:true});}
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(remote,[]);
  const report={rig,deformation,sourcePreserved:true,downloadByteEqual:true,combinedDownloadByteEqual:true,sha256:crypto.createHash('sha256').update(local).digest('hex'),errors,bindingWarnings:warnings,remoteRequests:remote.length,hardware:'Headless Edge software WebGL; physical mobile performance untested'};
  fs.writeFileSync('docs/spieler-nutzer-rig/browser-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
