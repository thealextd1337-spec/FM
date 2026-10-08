'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const url='http://127.0.0.1:4300/?engine=unity&scene=play-goal&camera=contact';
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{const page=await browser.newPage({viewport:{width:1440,height:950}});await page.goto(url);await page.waitForFunction(()=>D6Probe.ready,null,{timeout:150000});
  const observed=await page.evaluate(async()=>({engine:document.querySelector('#engine').value,scene:document.querySelector('#scene').value,camera:document.querySelector('#camera').value,sourceId:(await D6Probe.checkpoint()).sourceId,scenarioId:D6Probe.snapshot().scenarioId}));assert.equal(observed.engine,'unity');assert.equal(observed.scene,'play-goal');assert.equal(observed.camera,'contact');assert.equal(observed.sourceId,JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId);
  await page.locator('#start').click();await page.waitForFunction(()=>D6Probe.snapshot().finished,null,{timeout:20000});const state=await page.evaluate(()=>D6Probe.snapshot());assert.equal(state.outcome,'goal');assert(state.events.some(e=>e.type==='received'));assert(state.events.some(e=>e.type==='shot-release'));const report={url,pass:true,observed,events:state.events.map(e=>e.type)};fs.writeFileSync('outputs/platform/contact-pilot/link-test.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
