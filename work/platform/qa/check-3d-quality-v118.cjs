'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const live=process.argv.includes('--live'),url=process.argv[2]||'http://127.0.0.1:4532/native-build.html',out=live?'outputs/release-118/live-browser':'outputs/3d-quality/iteration-118/browser';
const files=['dist/world-unity-v151.js','outputs/index.html','outputs/Doppel-6-Fussballmanager.html','outputs/platform/unity-web/probe-build.json'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const frozen=hashes(),identity=JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId,helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'),layout=fs.readFileSync('work/platform/qa/unity-label-readability.js','utf8');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[],checks=[];
 const check=(name,value)=>{assert(value,name);checks.push(name)};
 try{
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'?engine=unity&quality=reduced&iteration=118');await page.evaluate(helper);
  await page.evaluate(()=>QAJ('setup',D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true})));await page.waitForFunction(()=>QAR.done,null,{timeout:150000});check('14 real players loaded into new Unity build',await page.evaluate(()=>!QAR.error&&D6UnityMatch.ready&&D6UnityMatch.lastAck.players===14));
  await page.evaluate(()=>{v65Pause();hideOverlay();v132ScreenState(true);draw()});await page.evaluate(()=>D6QA160.camera('wide'));await page.waitForFunction(()=>D6UnityMatch.projection?.width===844&&D6UnityMatch.projection?.height===390);
  await page.evaluate(id=>window.D6LabelQAIdentity=id,identity);await page.evaluate(layout);const labels=await page.evaluate(()=>D6LabelQA());check('18 real-head and synthetic crowded-label checks',labels.pass&&labels.checks.length===18&&labels.viewport.width===844&&labels.viewport.height===390);
  await page.waitForFunction(()=>D6UnityMatch.projection.ballMarker?.visible&&!document.querySelector('#d6-unity-ball-guide').hidden);
  const actual=await page.evaluate(()=>{const p=D6UnityMatch.projection,g=document.querySelector('#d6-unity-ball-guide'),area=document.querySelector('#d6-unity-labels').getBoundingClientRect();return {marker:p.ballMarker,renderWidth:p.width,cssWidth:area.width,cssHeight:area.height,left:parseFloat(g.style.left),top:parseFloat(g.style.top),size:parseFloat(g.style.width),opacity:parseFloat(g.style.opacity),clock:match.elapsed}});
  check('Ball guide follows actual rendered ball projection',Math.abs(actual.left-actual.marker.x*actual.cssWidth)<.01&&Math.abs(actual.top-actual.marker.y*actual.cssHeight)<.01&&actual.size>=12&&actual.size<=16&&actual.opacity>0);
  await page.waitForTimeout(250);await page.screenshot({path:out+'/ball-guide-on.png'});
  await page.evaluate(()=>{v132RevealControls();v100PitchMenu(true)});await page.locator('#d6-ball-guide-toggle').click();
  check('Actual menu toggles guide off without advancing paused match',await page.evaluate(clock=>document.querySelector('#d6-unity-ball-guide').hidden&&document.querySelector('#d6-ball-guide-toggle').getAttribute('aria-pressed')==='false'&&localStorage.getItem('d6-ball-guide')==='off'&&match.elapsed===clock,actual.clock));
  await page.evaluate(()=>v100PitchMenu(false));await page.screenshot({path:out+'/ball-guide-off.png'});
  await page.reload();await page.evaluate(helper);await page.evaluate(()=>QAJ('restore-setting',D6QA160.setup({config:{fieldSize:'standard',fieldPlayers:5},unity:true})));await page.waitForFunction(()=>QAR.done,null,{timeout:150000});
  check('Ball setting persists separately after reload and new match',await page.evaluate(()=>document.querySelector('#d6-ball-guide-toggle').getAttribute('aria-pressed')==='false'&&document.querySelector('#d6-unity-ball-guide').hidden));
  await page.evaluate(()=>{v65Pause();hideOverlay();v132ScreenState(true);draw();v132RevealControls();v100PitchMenu(true)});await page.locator('#d6-ball-guide-toggle').click();await page.evaluate(()=>v100PitchMenu(false));
  check('Actual menu re-enables ball preference',await page.evaluate(()=>localStorage.getItem('d6-ball-guide')==='on'&&document.querySelector('#d6-ball-guide-toggle').getAttribute('aria-pressed')==='true'));
  await page.evaluate(()=>{v98View='2d';draw()});check('2D hides ball view with Unity host',await page.locator('#d6-unity-host').isHidden());await page.evaluate(()=>{v98View='3d';draw()});await page.waitForFunction(()=>D6UnityMatch.active);check('Return to 3D retains actual session',await page.evaluate(()=>!D6UnityMatch.lastError));
  check('Source footer and 3D help identify Release118',await page.evaluate(()=>Array.from(document.querySelectorAll('footer')).some(f=>f.textContent.includes('PROTOTYP 118'))&&D6ThreeDocumentation.version===118));
  fs.writeFileSync(out+'/mobile.json',JSON.stringify({pass:true,release:118,sourceId:identity,htmlSha256:frozen['outputs/index.html'],checks,labels,actual,errors,note:'Fixed touch layout in isolated Edge software WebGL. Physical Android screen timeout, GPU speed and match feel are unmeasured.'},null,2)+'\n');console.log(JSON.stringify({mobile:true,checks:checks.length,labelChecks:labels.checks.length}));
  const results=[];
  for(const config of (live?[{fieldSize:'standard',fieldPlayers:5}]:[{fieldSize:'standard',fieldPlayers:5},{fieldSize:'large',fieldPlayers:6}])){
   const pair={config};for(const unity of [false,true]){
    await page.goto(url+'?engine='+(unity?'unity':'browser')+'&iteration=118-parity');await page.evaluate(helper);
    await page.evaluate(({config,unity})=>QAJ('parity',D6QAScenario(config,unity)),{config,unity});await page.waitForFunction(()=>QAR.done,null,{timeout:240000});const result=await page.evaluate(()=>QAR);assert(!result.error,result.error);pair[unity?'unity':'native']=result.v;
    console.log(JSON.stringify({config,mode:unity?'unity':'native',minute:result.v.end.minute,hash:result.v.digest.all}));
   }
   assert.deepEqual(pair.unity.digest,pair.native.digest);assert(pair.unity.pause.ok&&pair.unity.cp.restored&&pair.unity.cp.unityReady&&pair.unity.end.finished);results.push(pair);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),frozen);
  fs.writeFileSync(out+'/native-unity-parity.json',JSON.stringify({pass:true,release:118,hashes:frozen,sourceId:identity,results,errors,note:'Actual HTML native/Unity complete matches, pause, halftime and actual JSON continuation. All 14 digest parts equal for each pair. No physical-device performance claim.'},null,2)+'\n');
  console.log(JSON.stringify({pass:true,mobileChecks:checks.length,labelChecks:labels.checks.length,fullMatches:results.length*2,parityParts:14}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
