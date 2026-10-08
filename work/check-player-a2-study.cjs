const fs=require('fs'),path=require('path'),assert=require('assert');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const version=process.argv[2]||'a2';
if(!/^a[2-9][0-9]*$/.test(version))throw Error('Ungültige Studienversion');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1320,height:920}}),errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  await page.goto(pathToFileURL(path.resolve(`outputs/spieler-${version}-meshy-vergleich.html`)).href);
  await page.waitForFunction(()=>window.playerA2Study?.ready||window.playerA2Study?.error);
  const models=await page.evaluate(()=>{
   const p=window.playerA2Study;if(!p.ready)throw Error(p.error);
   return p.studies.map(s=>{
    let finite=true,vertices=0,meshes=0,materials=0;const v=s.camera.position.clone();
    s.model.traverse(o=>{if(o.isMesh){meshes++;materials+=[].concat(o.material).length;const pos=o.geometry.attributes.position;for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);finite&&=[v.x,v.y,v.z].every(Number.isFinite);vertices++;}}});
    return {id:s.id,finite,vertices,meshes,materials,triangles:s.asset.triangles,scale:s.scale,rawBounds:{min:s.rawBounds.min.toArray(),max:s.rawBounds.max.toArray()},referenceViews:Object.keys(s.asset.images)};
   });
  });
  assert.equal(models.length,2);assert.equal(models[1].id,version);
  const manifest=JSON.parse(fs.readFileSync(`docs/spieler-${version}-mehransichten/model.json`,'utf8'));
  if(manifest.previous)assert.equal(models[0].id,manifest.previous.id);else assert.equal(models[0].triangles,30644);
  for(const m of models){assert(m.finite);assert(m.triangles>0);assert.deepEqual(m.referenceViews,['front','side','back','quarter']);}
  for(const [view,label] of [['front','Vorne'],['side','Seite'],['back','Hinten'],['quarter','Schräg vorne'],['head','Gesicht']]){
   await page.getByRole('button',{name:label,exact:true}).click();assert.equal(await page.locator(`[data-view="${view}"]`).getAttribute('aria-pressed'),'true');
   for(const m of models)assert(await page.locator('#ref-'+m.id).evaluate(img=>img.complete&&img.naturalWidth>0));
   await page.screenshot({path:`outputs/player-${version}-compare-${view}.png`});
  }
  await page.getByRole('button',{name:'Ansicht zurücksetzen',exact:true}).click();
  const canvas=await page.locator('#'+version).boundingBox();await page.mouse.move(canvas.x+canvas.width*.5,canvas.y+canvas.height*.5);await page.mouse.down();await page.mouse.move(canvas.x+canvas.width*.65,canvas.y+canvas.height*.55,{steps:8});await page.mouse.up();
  const synchronized=await page.evaluate(()=>{const [a,b]=window.playerA2Study.studies;return a.camera.position.distanceTo(b.camera.position)<1e-6&&Math.abs(a.camera.zoom-b.camera.zoom)<1e-6});assert(synchronized,'Drag must synchronize the cameras');
  await page.getByRole('button',{name:'Ansicht zurücksetzen',exact:true}).click();
  const downloadEvent=page.waitForEvent('download');await page.locator('.meta a').nth(1).click();const download=await downloadEvent;const downloaded=`outputs/player-${version}-browser-download.glb`;await download.saveAs(downloaded);
  assert(fs.readFileSync(downloaded).equals(fs.readFileSync(manifest.model)),'Browser download must be the actual GLB');
  for(const [name,size] of [['landscape',{width:844,height:390}],['mobile',{width:390,height:844}]]){await page.setViewportSize(size);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`outputs/player-${version}-compare-${name}.png`,fullPage:true});}
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
  const report={models,synchronized,downloadVerified:true,errors,remoteRequests:remote.length,hardware:'Headless Edge, software WebGL; physical device performance untested'};
  fs.writeFileSync(`docs/spieler-${version}-mehransichten/browser-qa.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
