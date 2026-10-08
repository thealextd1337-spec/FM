const fs=require('fs'),path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1320,height:920}});
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-a4-meshy-vergleich.html')).href);
  await page.waitForFunction(()=>window.playerA2Study?.ready);
  await page.getByRole('button',{name:'Gesicht',exact:true}).click();
  for(const strength of [0,.2]){
   await page.evaluate(strength=>{const s=window.playerA2Study.studies[1];s.model.traverse(o=>{if(o.isMesh)for(const m of [].concat(o.material))m.normalScale.set(strength,strength)});s.renderer.render(s.scene,s.camera)},strength);
   await page.screenshot({path:`outputs/a4-normal-${strength}.png`});
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
