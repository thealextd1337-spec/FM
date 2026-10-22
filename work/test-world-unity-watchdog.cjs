'use strict';
// Unity watchdog (world-unity-v151.js paint): a page that itself paints nothing for over a second (frozen main thread:
// a device asleep without a hidden document, a long pause, a slow screenshot) must not count as an unresponsive Unity
// renderer, while a renderer that really stops answering still falls back to 2D after 10 s. One page with the actual
// WebGL build: a seeded new-world match (D6QA160) in Unity, a 12 s main-thread freeze, then dropped pictures.
// --base <git ref> serves that revision's world-unity-v151.js instead (expects the freeze to fail it). Node >= 20, Edge.
//   node work/test-world-unity-watchdog.cjs [--base <ref>]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback;};
const root=path.join(__dirname,'..'),base=arg('--base',null);
const helper=fs.readFileSync(path.join(__dirname,'platform/qa/unity-integration-v160.js'),'utf8');
(async()=>{
 const {createServer}=require('./ui-redesign/serve.cjs');const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={base};
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(base){const old=execFileSync('git',['show',base+':dist/world-unity-v151.js'],{cwd:root});await page.route('**/source/world-unity-v151.js',r=>r.fulfill({body:old,contentType:'text/javascript; charset=utf-8'}));}
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=unity`,{timeout:180000});
  await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&window.userMeshyMatchReady,{},{timeout:180000});await page.waitForTimeout(500);
  for(let a=0;a<3;a++){await page.evaluate(helper);if(await page.evaluate(()=>typeof D6QA160==='object'))break;await page.waitForTimeout(1000);}
  report.setup=await page.evaluate(()=>D6QA160.setup({unity:true,seed:160119,replays:false}));assert.ok(report.setup.unityReady,'Unity ready');
  await page.evaluate(()=>D6QA160.run({minute:1,sampleEvery:1}));
  const state=()=>page.evaluate(()=>({ack:D6UnityMatch.lastAck?.sequence??null,error:D6UnityMatch.lastError||null,failure:D6UnityMatch.lastFailure||null}));
  const before=await state();
  // 1. A 12 s freeze of the page's main thread (the iframe shares it), then live play again.
  // Frozen while a sent picture still waits for its acknowledgement (the watchdog's pending picture).
  report.pendingAtFreeze=await page.evaluate(async()=>{let pending=false;for(let i=0;i<400&&!pending;i++){pending=!!(D6UnityMatch.picture&&D6UnityMatch.lastAck&&D6UnityMatch.picture.sequence>D6UnityMatch.lastAck.sequence);if(!pending)await new Promise(r=>setTimeout(r,2));}const end=performance.now()+12000;while(performance.now()<end){}return pending;});
  assert.ok(report.pendingAtFreeze,'a picture was pending when the page froze');
  await page.evaluate(()=>D6QA160.run({minute:999,sampleEvery:1,limit:60}));await page.waitForTimeout(1500);
  report.afterFreeze=await state();report.before=before;
  if(!base){
  // 2. A renderer that stops answering: pictures to the iframe are dropped while the page paints on.
  await page.evaluate(()=>{const w=document.querySelector('#d6-unity-host iframe').contentWindow;w.postMessage=()=>{};});
  const t0=Date.now();while(Date.now()-t0<14000&&!(await state()).error){await page.evaluate(()=>D6QA160.run({minute:999,sampleEvery:1,limit:10}));await page.waitForTimeout(250);}
  report.silent=await state();}
  report.errors=errors;
 }finally{await browser.close();server.close();}
 console.log(JSON.stringify(report,null,1));
 if(base){assert.match(String(report.afterFreeze.failure||report.afterFreeze.error),/antwortet nicht/,'the base revision fails the frozen page');console.log('base reproduces the false "not responding"');return;}
 assert.equal(report.afterFreeze.error,null,'a frozen page is no unresponsive renderer');
 assert.ok(report.afterFreeze.ack>report.before.ack,'pictures are acknowledged after the freeze');
 assert.match(String(report.silent.failure||report.silent.error),/antwortet nicht/,'a silent renderer still falls back to 2D');
 assert.equal(report.errors.length,0,'page errors');
 console.log('watchdog: freeze tolerated, silent renderer detected');
})().catch(e=>{console.error(e);process.exit(1);});
