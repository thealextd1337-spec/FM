const fs=require('fs'),path=require('path'),assert=require('assert');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1320,height:920}}),errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-a-meshy-v1.html')).href);
  await page.waitForFunction(()=>window.playerAStudy?.ready||window.playerAStudy?.error);
  const report=await page.evaluate(()=>{
   const p=window.playerAStudy;if(!p.ready)throw Error(p.error);
   let finite=true,vertices=0,meshes=0,materials=0;const v=p.camera.position.clone();
   p.model.traverse(o=>{if(o.isMesh){meshes++;materials+=[].concat(o.material).length;const pos=o.geometry.attributes.position;for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);finite&&=[v.x,v.y,v.z].every(Number.isFinite);vertices++;}}});
   return {finite,vertices,meshes,materials,triangles:p.triangles,scale:p.scale,rawBounds:{min:p.rawBounds.min.toArray(),max:p.rawBounds.max.toArray()},referenceViews:Object.keys(p.refs),ready:p.ready};
  });
  assert(report.finite);assert.equal(report.triangles,30644);assert.deepEqual(report.referenceViews,['front','side','back','quarter']);
  for(const [view,label] of [['front','Vorne'],['side','Seite'],['back','Hinten'],['quarter','Schräg vorne'],['head','Gesicht']]){
   await page.getByRole('button',{name:label,exact:true}).click();
   assert.equal(await page.locator(`[data-view="${view}"]`).getAttribute('aria-pressed'),'true');
   if(view!=='head')assert(await page.locator('#reference').evaluate(img=>img.complete&&img.naturalWidth>0));
   await page.screenshot({path:`outputs/player-a-meshy-${view}.png`});
  }
  await page.getByRole('button',{name:'Ansicht zurücksetzen',exact:true}).click();
  assert.equal(await page.locator('[data-view="front"]').getAttribute('aria-pressed'),'true');
  await page.setViewportSize({width:844,height:390});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'outputs/player-a-meshy-landscape.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'outputs/player-a-meshy-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
  fs.writeFileSync('docs/spieler-a-mehransichten/browser-qa.json',JSON.stringify({...report,errors,remoteRequests:remote.length,hardware:'Headless Edge, software WebGL; physical device performance untested'},null,2));
  console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
