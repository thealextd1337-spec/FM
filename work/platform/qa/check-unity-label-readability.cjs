'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.argv[2]||'http://127.0.0.1:4532/native-build.html',out='outputs/3d-quality/label-readability';
const files=['dist/world-unity-v151.js','outputs/index.html','outputs/Doppel-6-Fussballmanager.html','outputs/platform/unity-web/probe-build.json'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const frozen=hashes(),helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'),layout=fs.readFileSync('work/platform/qa/unity-label-readability.js','utf8');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[];
 try{
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'?engine=unity&iteration=labels');await page.evaluate(helper);
  await page.evaluate(()=>QAJ('labels',D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true})));await page.waitForFunction(()=>QAR.done,null,{timeout:150000});assert(!await page.evaluate(()=>QAR.error));assert(await page.evaluate(()=>D6UnityMatch.ready));
  await page.evaluate(()=>{v65Pause();hideOverlay();v132ScreenState(true);draw()});await page.evaluate(()=>D6QA160.camera('wide'));await page.waitForFunction(()=>D6UnityMatch.projection?.width===844&&D6UnityMatch.projection?.height===390);
  await page.evaluate(layout);const report=await page.evaluate(()=>D6LabelQA());assert.equal(report.pass,true);assert.deepEqual(report.viewport,{width:844,height:390});report.note='Isolated desktop Edge with touch layout and software WebGL; fixed 844x390 viewport. Actual Unity heads and explicit synthetic crowd-layout cases, no physical Android performance evidence. T3 fallback after two requested 844x390 resizes still returned actual/frame 400x300.';
  await page.waitForTimeout(400);await page.screenshot({path:out+'/mobile-unity.png'});fs.writeFileSync(out+'/browser-mobile.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({layout:true,checks:report.checks.length,viewport:report.viewport}));
  const results={};
  for(const unity of [false,true]){
   await page.goto(url+'?engine='+(unity?'unity':'browser')+'&iteration=parity');await page.evaluate(helper);
   await page.evaluate(unity=>QAJ('parity',D6QAScenario({fieldSize:'standard',fieldPlayers:5},unity)),unity);await page.waitForFunction(()=>QAR.done,null,{timeout:180000});const result=await page.evaluate(()=>QAR);assert(!result.error,result.error);results[unity?'unity':'native']=result.v;
   console.log(JSON.stringify({mode:unity?'unity':'native',minute:result.v.end.minute,hash:result.v.digest.all}));
  }
  assert.deepEqual(results.unity.digest,results.native.digest);assert(results.unity.pause.ok&&results.unity.cp.restored&&results.unity.cp.unityReady&&results.unity.end.finished);assert.deepEqual(errors,[]);assert.deepEqual(hashes(),frozen);
  fs.writeFileSync(out+'/native-unity-parity.json',JSON.stringify({pass:true,hashes:frozen,results,errors,note:'Full HTML-build native/Unity standard-five matches including pause, halftime and actual JSON continuation; all 14 digest parts equal. Desktop software WebGL, no physical device performance claim.'},null,2)+'\n');
  console.log(JSON.stringify({pass:true,layoutChecks:report.checks.length,parityParts:Object.keys(results.unity.digest.hashes).length,hash:results.unity.digest.all}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
