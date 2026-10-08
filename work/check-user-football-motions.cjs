const fs=require('fs'),path=require('path'),assert=require('assert');
const {read}=require('./user-character-glb.cjs'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const head=process.argv.includes('--head'),prefix=head?'head-football':'football';
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1080,height:1040}}),errors=[],warnings=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});page.on('console',m=>{if(m.type()==='warning'&&/binding|not found/i.test(m.text()))warnings.push(m.text())});
  await page.goto(pathToFileURL(path.resolve(head?'outputs/spieler-nutzer-kopftextur.html':'outputs/spieler-nutzer-fussball-animationen.html')).href);
  await page.waitForFunction(()=>window.userCharacterPreview?.ready||window.userCharacterPreview?.error,null,{timeout:45000});
  const report=await page.evaluate(()=>{
   const p=window.userCharacterPreview;if(!p.ready)throw Error(p.error);let mesh;p.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o});
   const v=mesh.position.clone(),sample=()=>{p.scene.updateMatrixWorld(true);mesh.skeleton.update();return Array.from({length:mesh.geometry.attributes.position.count},(_,i)=>mesh.getVertexPosition(i,v).clone().applyMatrix4(mesh.matrixWorld));};
   p.setMode('rest');const rest=sample(),results=[];
   for(const [name,c] of Object.entries(p.clips)){
    p.setMotion(name);let finite=true,movement=0,minY=Infinity,maxY=-Infinity,maxSpan=0,first,last;
    for(let i=0;i<=32;i++){
     p.seek(c.duration*i/32);const points=sample();if(i===0)first=points;if(i===32)last=points;
     let minX=Infinity,maxX=-Infinity;
     for(const [k,q] of points.entries()){finite&&=[q.x,q.y,q.z].every(Number.isFinite);movement=Math.max(movement,q.distanceTo(rest[k]));minY=Math.min(minY,q.y);maxY=Math.max(maxY,q.y);minX=Math.min(minX,q.x);maxX=Math.max(maxX,q.x);}maxSpan=Math.max(maxSpan,maxX-minX);
    }
    p.setMode('rest');results.push({name,duration:c.duration,samples:33,finite,movement,minY,maxY,maxSpan,loopSeamVertexDistance:Math.max(...last.map((q,i)=>q.distanceTo(first[i]))),restError:Math.max(...sample().map((q,i)=>q.distanceTo(rest[i])))});
   }
   return {joints:mesh.skeleton.bones.length,vertices:mesh.geometry.attributes.position.count,textureSize:[mesh.material.map.image.width,mesh.material.map.image.height],poses:results};
  });
  assert.equal(report.joints,28);assert.equal(report.vertices,9725);assert.deepEqual(report.textureSize,head?[4096,4096]:[2048,2048]);assert.equal(report.poses.length,9);
  for(const r of report.poses){assert(r.finite&&r.movement>.05&&r.restError<1e-5);assert(r.maxSpan<2.8&&r.maxY<3,'Exploded pose '+r.name);if(!['gesture','walking','running'].includes(r.name))assert(r.minY>-.001,'New clip below ground '+r.name);if(['run_fast4','run_fast6','sprint_forward'].includes(r.name))assert(r.loopSeamVertexDistance<.001,'Visible loop seam '+r.name)}
  const shots=[['run_fast4',.18],['run_fast6',.22],['sprint_forward',.18],['celebrate_fist',.6],['celebrate_arms',1.1],['celebrate_victory',3.6]];
  for(const [name,t] of shots){await page.selectOption('#motion',name);await page.evaluate(t=>{const p=window.userCharacterPreview;p.angle('quarter');p.seek(t)},t);await page.screenshot({path:`outputs/${prefix}-${name}.png`});}
  if(head){await page.evaluate(()=>{const p=window.userCharacterPreview;p.setMode('rest');p.angle('head')});await page.screenshot({path:'outputs/head-after.png'});await page.selectOption('#appearance','original');await page.screenshot({path:'outputs/head-before.png'});await page.selectOption('#appearance','textured');}
  const playback=await page.evaluate(()=>{const p=window.userCharacterPreview,results=[];for(const name of ['run_fast4','run_fast6','sprint_forward','celebrate_fist','celebrate_arms','celebrate_victory']){p.setMotion(name);p.seek(0);p.action.reset().play();p.mixer.update(p.clip.duration*1.3);results.push({name,duration:p.clip.duration,time:p.action.time,paused:p.action.paused,loop:p.action.loop,clamp:p.action.clampWhenFinished});}return results;});
  for(const r of playback){if(r.name.startsWith('celebrate_'))assert(r.paused&&r.clamp&&Math.abs(r.time-r.duration)<1e-6);else assert(Math.abs(r.time-r.duration*.3)<1e-5)}
  await page.evaluate(()=>{const p=window.userCharacterPreview;p.setMotion('celebrate_arms');p.seek(1.1);p.setClothColor(0,'#e53232');p.setClothColor(1,'#eec83b');p.setClothColor(2,'#299c55')});
  const changedEvent=page.waitForEvent('download');await page.locator('#combined-download').click();await (await changedEvent).saveAs(`outputs/${prefix}-colors.glb`);
  const changed=read(`outputs/${prefix}-colors.glb`),base=read('meshy_output/user-character-2026-10-03/'+(head?'character-head-textured-football.glb':'character-football-animations.glb'));assert.deepEqual(changed.json.nodes,base.json.nodes);assert.deepEqual(changed.json.skins,base.json.skins);assert.deepEqual(changed.json.animations,base.json.animations);assert(changed.bin.subarray(0,base.bin.length).equals(base.bin));
  await page.locator('#cloth-reset').click();const downloadEvent=page.waitForEvent('download');await page.locator('#combined-download').click();await (await downloadEvent).saveAs(`outputs/${prefix}-download.glb`);assert(fs.readFileSync(`outputs/${prefix}-download.glb`).equals(base.bytes));
  await page.locator('#clip').click();await page.waitForFunction(()=>window.userCharacterPreview.action.time>.12);await page.locator('#pause').click();const time=await page.evaluate(()=>window.userCharacterPreview.action.time);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.userCharacterPreview.action.time),time);
  await page.locator('#skeleton').check();assert(await page.evaluate(()=>window.userCharacterPreview.helper.visible));await page.locator('#skeleton').uncheck();
  for(const size of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(size);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(remote,[]);
  Object.assign(report,{playback,defaultDownloadByteEqual:true,coloredExportRigClipsBinaryPreserved:true,errors,bindingWarnings:warnings,remoteRequests:remote.length,limits:'Software WebGL preview, no match integration or foot-contact/transition acceptance'});
  fs.writeFileSync('docs/spieler-nutzer-rig/'+(head?'head-browser-qa.json':'football-browser-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
