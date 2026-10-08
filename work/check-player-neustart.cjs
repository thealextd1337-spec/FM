const fs=require('fs'),path=require('path'),assert=require('assert');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
  const page=await browser.newPage({viewport:{width:1050,height:920}}), errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message)); page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-neustart.html')).href);
  await page.waitForFunction(()=>window.meshyPreview?.ready||window.meshyPreview?.error);
  const report=await page.evaluate(()=>{
   const p=window.meshyPreview;if(!p.ready)throw Error(p.error);
   const meshes=[];p.model.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o)});
   const colours=()=>Object.fromEntries(meshes.map(o=>[o.material.name,o.material.color.getHexString()]));
   p.setKit('home');const home=colours();p.setKit('away');const away=colours();p.setKit('home');
   let finite=true,weightError=0,samples=0;const v=p.camera.position.clone();
   for(const mesh of meshes){const w=mesh.geometry.attributes.skinWeight;for(let i=0;i<w.count;i++)weightError=Math.max(weightError,Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1));}
   for(const [name,clip] of Object.entries(p.clips))for(let i=0;i<=32;i++){
    p.seek(name,clip.duration*i/32);samples++;
    for(const mesh of meshes){mesh.skeleton.update();for(let j=0;j<mesh.geometry.attributes.position.count;j++){mesh.getVertexPosition(j,v);v.applyMatrix4(mesh.matrixWorld);finite&&=[v.x,v.y,v.z].every(Number.isFinite)}}
   }
   p.seek('rigged',0);return {home,away,finite,weightError,samples,meshes:meshes.length,bones:meshes[0].skeleton.bones.length};
  });
  assert(report.finite);assert(report.weightError<1e-4);assert.equal(report.samples,99);
  assert.notEqual(report.home.D6_shirt,report.away.D6_shirt);assert.notEqual(report.home.D6_shorts,report.away.D6_shorts);
  for(const key of ['D6_skin','D6_hair','D6_boots','D6_socks'])assert.equal(report.home[key],report.away[key]);
  for(const [kit,angle,mode,time] of [['home','front','rigged',0],['away','front','rigged',0],['home','head','rigged',0],['home','side','rigged',0],['home','back','rigged',0],['away','front','running',.25]]){
   await page.evaluate(({kit,angle,mode,time})=>{const p=window.meshyPreview;p.setKit(kit);p.angle(angle);p.seek(mode,time)},{kit,angle,mode,time});
   await page.screenshot({path:`outputs/neustart-${kit}-${angle}-${mode}.png`});
  }
  await page.setViewportSize({width:844,height:390});
  await page.evaluate(()=>{const p=window.meshyPreview;p.angle('front');p.seek('walking',.3)});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'outputs/neustart-mobile-landscape.png',fullPage:true});
  await page.getByLabel('Trikotvariante').selectOption('home');
  await page.getByRole('button',{name:'Gehen',exact:true}).click();
  await page.getByRole('button',{name:'Weiter',exact:true}).click();
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  fs.writeFileSync('docs/spieler-meshy-neustart/browser-qa.json',JSON.stringify({...report,errors,remoteRequests:requests.length,hardware:'Headless Edge / software WebGL; no physical mobile performance claim'},null,2));
  console.log(JSON.stringify(report));
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
