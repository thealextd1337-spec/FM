'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const url='http://127.0.0.1:4300/?engine=unity&scene=play-goal&camera=contact';
 const report={url,errors:[],checks:[]},out=path.resolve('outputs/platform/action-iteration');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}});page.on('pageerror',e=>report.errors.push(e.message));await page.goto(url);
  await page.waitForFunction(()=>window.D6Probe?.ready,null,{timeout:150000});
  report.observed=await page.evaluate(async()=>({engine:document.querySelector('#engine').value,scene:document.querySelector('#scene').value,camera:document.querySelector('#camera').value,sourceId:(await D6Probe.checkpoint()).sourceId,scenarioId:D6Probe.snapshot().scenarioId}));
  assert.equal(report.observed.engine,'unity');assert.equal(report.observed.scene,'play-goal');assert.equal(report.observed.camera,'contact');assert.equal(report.observed.sourceId,JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId);report.checks.push('Direct demo uses selected Unity scene, contact camera and current source identity');
  await page.locator('#start').click();await page.waitForFunction(()=>D6Probe.snapshot().finished,null,{timeout:20000});const state=await page.evaluate(()=>D6Probe.snapshot());
  assert.equal(state.outcome,'goal');assert(state.events.some(e=>e.type==='received'));assert(state.events.some(e=>e.type==='shot-release'));report.events=state.events.map(e=>e.type);report.checks.push('Actual demo completes reception, shooting, goal and follow-through');
  assert.equal(report.errors.length,0);report.pass=true;fs.writeFileSync('outputs/platform/contact-pilot/link-test.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }catch(error){report.pass=false;report.failure=error.stack;throw error;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'link-test.json'),JSON.stringify(report,null,2));}
})().catch(error=>{console.error(error);process.exitCode=1;});
