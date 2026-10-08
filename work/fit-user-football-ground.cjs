const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {read,accessor}=require('./user-character-glb.cjs');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const asset=read('meshy_output/user-character-2026-10-03/character-football-animations.glb'),samples={};
 for(const c of asset.json.animations.slice(3)){const times=[...new Set(c.samplers.flatMap(s=>accessor(asset,s.input).flat()))].sort((a,b)=>a-b);samples[c.name]=[...times,...times.slice(1).map((t,i)=>(t+times[i])/2),...Array.from({length:65},(_,i)=>times.at(-1)*i/64)];}
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage();await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-fussball-animationen.html')).href);await page.waitForFunction(()=>window.userCharacterPreview?.ready,null,{timeout:45000});
  const report=await page.evaluate(samples=>{const p=window.userCharacterPreview;let mesh;p.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o});const v=mesh.position.clone(),report={};for(const [name,times] of Object.entries(samples)){p.setMotion(name);let minY=Infinity;for(const t of times){p.seek(t);p.scene.updateMatrixWorld(true);mesh.skeleton.update();for(let k=0;k<mesh.geometry.attributes.position.count;k++)minY=Math.min(minY,mesh.getVertexPosition(k,v).applyMatrix4(mesh.matrixWorld).y);}report[name]={sampleCount:times.length,preCorrectionMinimumWorldY:minY,presentationScale:p.presentation.scale.y,heightOffsetMeters:Math.max(0,-minY/p.presentation.scale.y+.003)};}return report;},samples);
  fs.writeFileSync('docs/spieler-nutzer-rig/football-fit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
