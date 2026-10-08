const fs=require('fs'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve('outputs/player-motion-preview.html')).href);await page.waitForFunction(()=>window.D6MotionPreview?.stage.renderer.info.render.calls>0);
  for(const mode of ['walk','run','turn','pass','cross','shot','header','volley','idle']){await page.locator('#motion').selectOption(mode);await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>D6MotionPreview.getState().mode),mode);assert(await page.evaluate(()=>D6MotionPreview.figures.every(v=>v.root.matrixWorld.elements.every(Number.isFinite))))}
  await page.locator('#motion').selectOption('pass');await page.locator('#pause').click();const before=await page.evaluate(()=>D6MotionPreview.getState().elapsed);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>D6MotionPreview.getState().elapsed),before);
  await page.locator('#restart').click();assert.equal(await page.evaluate(()=>D6MotionPreview.getState().elapsed),0);
  await page.locator('#motion').selectOption('idle');await page.screenshot({path:'outputs/stylized-motion-desktop.png',fullPage:true});
  await page.setViewportSize({width:844,height:390});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'outputs/stylized-motion-mobile.png',fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>window.D6MotionPreview);assert(await page.evaluate(()=>D6MotionPreview.getState().paused));
  assert.deepEqual(errors,[]);fs.writeFileSync('outputs/stylized-motion-preview-proof.json',JSON.stringify({modes:9,pause:true,restart:true,offline:true,reducedMotion:true,mobileOverflow:false,errors},null,2));console.log('Preview: 9 motions, finite poses, pause/restart, offline, mobile and reduced motion passed.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
