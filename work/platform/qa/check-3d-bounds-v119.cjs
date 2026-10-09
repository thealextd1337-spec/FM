'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.argv[2]||'http://127.0.0.1:4532',out='outputs/3d-quality/iteration-119/bounds';
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const checks=[],results=[],errors=[];try{
for(const size of [{width:931,height:448},{width:844,height:390},{width:1280,height:720}]){
 const context=await browser.newContext({viewport:size,hasTouch:true,isMobile:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/source/index.html?engine=unity&quality=reduced');await page.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));await page.evaluate(()=>QAJ('setup',D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true})));await page.waitForFunction(()=>QAR.done,null,{timeout:150000});assert(await page.evaluate(()=>!QAR.error&&D6UnityMatch.ready));
 await page.evaluate(()=>{v65Pause();hideOverlay();v132ScreenState(true);draw();});await page.waitForTimeout(400);
 const inspect=()=>page.evaluate(()=>{const s=document.querySelector('.v42-pitch-stage'),h=document.querySelector('#d6-unity-host'),r=s.getBoundingClientRect(),v=h.getBoundingClientRect();return {stage:{x:r.x,y:r.y,width:r.width,height:r.height},host:{x:v.x,y:v.y,width:v.width,height:v.height},scrollTop:s.scrollTop,overflow:getComputedStyle(s).overflow,projection:{width:D6UnityMatch.projection.width,height:D6UnityMatch.projection.height}};});
 // Reproduce the old clipping mechanism on the actual oversized hidden canvas.
 await page.evaluate(()=>{const s=document.querySelector('.v42-pitch-stage');s.style.setProperty('overflow','hidden','important');s.scrollTop=71;});const old=await inspect();assert(old.scrollTop>0&&old.host.y<old.stage.y-30,'Actual old surface scroll lifts the iframe');checks.push('Old hidden-canvas scroll reproduces clipped bottom '+size.width);
 await page.evaluate(()=>document.querySelector('.v42-pitch-stage').style.removeProperty('overflow'));const fixed=await inspect();assert.equal(fixed.overflow,'clip');assert.equal(fixed.scrollTop,0);assert(Math.abs(fixed.host.y-fixed.stage.y)<.1);assert(Math.abs(fixed.host.height-fixed.stage.height)<.1);checks.push('Unity surface fills stage after fix '+size.width);
 await page.evaluate(()=>{const s=document.querySelector('.v42-pitch-stage');s.scrollTop=71;v132RevealControls();});const focus=await inspect();assert.equal(focus.scrollTop,0);assert(Math.abs(focus.host.y-focus.stage.y)<.1);checks.push('Control reveal and attempted scroll retain origin '+size.width);
 await page.screenshot({path:out+'/'+size.width+'-fullscreen.png'});
 await page.evaluate(()=>{v98View='2d';draw()});assert(await page.locator('#d6-unity-host').isHidden());assert.notEqual(await page.evaluate(()=>getComputedStyle(document.querySelector('.v42-pitch-stage')).overflow),'clip');checks.push('2D fallback retains original layout '+size.width);
 results.push({size,old,fixed,focus});await context.close();
}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({pass:true,checks,results,errors,note:'Real source/Unity in isolated Edge software WebGL; old hidden-canvas scroll deliberately reproduced. Pixel119 repetition remains separate.'},null,2)+'\n');console.log(JSON.stringify({pass:true,checks:checks.length}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
