const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],samples=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-bewegungsprobe.html')).href);await page.waitForFunction(()=>window.userMotionLab?.ready,null,{timeout:60000});
 for(const [id,time] of [['stop-ball',1.8],['throw',.55],['goal-kick',.7],['keeper-parry-left',.7],['keeper-parry-right',.7],['keeper-smother',.65]]){
  await page.selectOption('#motion-scenario',id);await page.waitForFunction(time=>userMotionLab.time>=time,time,{timeout:10000});await page.click('#motion-pause');
  const row=await page.evaluate(()=>({id:document.querySelector('#motion-scenario').value,time:userMotionLab.time,motion:userMotionLab.actor.meshy.motion,gloves:userMotionLab.actor.meshy.gloves.length,ball:v98Scene.ballRoot.position.toArray(),handContact:userMotionLab.actor.meshy.handContact,engine:match.elapsed}));
  const snapshot=await page.evaluate(()=>userMotionLab.actor.meshy.skeleton.bones.map(b=>b.matrixWorld.toArray()));await page.waitForTimeout(100);assert.deepEqual(await page.evaluate(()=>userMotionLab.actor.meshy.skeleton.bones.map(b=>b.matrixWorld.toArray())),snapshot,'pause '+id);
  assert(await page.evaluate(()=>match.elapsed)===row.engine);if(id==='throw'){assert(row.ball[1]>3);assert(row.handContact<.2)}if(id==='goal-kick'){assert.equal(row.gloves,2);assert.equal(row.motion,'keeper_ground_ready');assert.equal(row.ball[1],.29)}
  samples.push(row);await page.locator('#v98-canvas').screenshot({path:'outputs/football-lab-'+id+'-v115.png'});await page.click('#motion-pause');
 }
 await page.setViewportSize({width:844,height:390});const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(layout.scroll<=layout.width+1);assert.deepEqual(errors,[]);fs.writeFileSync('docs/spieler-nutzer-rig/motion-lab-qa-v115.json',JSON.stringify({samples,layout,errors},null,2));console.log(JSON.stringify({samples,layout,errors}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
