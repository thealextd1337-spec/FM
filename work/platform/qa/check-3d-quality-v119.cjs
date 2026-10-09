'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const live=process.argv.includes('--live'),url=process.argv[2]||'http://127.0.0.1:4532/native-build.html',out=live?'outputs/release-119/live-browser':'outputs/3d-quality/iteration-119/browser';
const files=['dist/world-unity-v151.js','outputs/index.html','outputs/Doppel-6-Fussballmanager.html','outputs/platform/unity-web/probe-build.json'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const frozen=hashes(),identity=JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId,helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8').replace('log.r20=await Q.run',"log.compact=D6QA119Compact();log.r20=await Q.run"),layout=fs.readFileSync('work/platform/qa/unity-label-readability.js','utf8');fs.mkdirSync(out,{recursive:true});
const compactHelper=`window.D6QA119Compact=()=>{
 const career=JSON.parse(JSON.stringify(D6QA160.career)),fixture=v62Fixtures(career).find(f=>f.id===D6QA160.state.fixtureId);
 career.world.activeMatch=null;const state=v64MakeState(career,fixture);while(state.phase!=='finished')v64Step(career,fixture,state);
 const shots=state.playerPerformance?.events.filter(e=>e.type==='shot')||[];
 return {fixtureId:fixture.id,minute:state.minute,teams:[fixture.homeId,fixture.awayId].map((id,side)=>{const club=v66Club(career,id),ids=new Set(club.roster.map(p=>p.pid));return {name:club.name,shots:Object.entries(state.stats).filter(([pid])=>ids.has(pid)).reduce((n,[,s])=>n+(s.shots||0),0),onTarget:state.playerPerformance?shots.filter(e=>ids.has(e.playerId)&&e.success).length:null,goals:state.score[side]}}),note:'Same starting career, roster, plan and fixture; compact minute model on independent copy, physical match untouched'};
};`;
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[],checks=[];
 const check=(name,value)=>{assert(value,name);checks.push(name)};
 try{
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'?engine=unity&quality=reduced&iteration=119');await page.evaluate(helper);await page.evaluate(compactHelper);
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
  await page.reload();await page.evaluate(helper);await page.evaluate(compactHelper);await page.evaluate(()=>QAJ('restore-setting',D6QA160.setup({config:{fieldSize:'standard',fieldPlayers:5},unity:true})));await page.waitForFunction(()=>QAR.done,null,{timeout:150000});
  check('Ball setting persists separately after reload and new match',await page.evaluate(()=>document.querySelector('#d6-ball-guide-toggle').getAttribute('aria-pressed')==='false'&&document.querySelector('#d6-unity-ball-guide').hidden));
  await page.evaluate(()=>{v65Pause();hideOverlay();v132ScreenState(true);draw();v132RevealControls();v100PitchMenu(true)});await page.locator('#d6-ball-guide-toggle').click();await page.evaluate(()=>v100PitchMenu(false));
  check('Actual menu re-enables ball preference',await page.evaluate(()=>localStorage.getItem('d6-ball-guide')==='on'&&document.querySelector('#d6-ball-guide-toggle').getAttribute('aria-pressed')==='true'));
  await page.evaluate(()=>{v98View='2d';draw()});check('2D hides ball view with Unity host',await page.locator('#d6-unity-host').isHidden());await page.evaluate(()=>{v98View='3d';draw()});await page.waitForFunction(()=>D6UnityMatch.active);check('Return to 3D retains actual session',await page.evaluate(()=>!D6UnityMatch.lastError));
  check('Source footer and 3D help identify Release119',await page.evaluate(()=>Array.from(document.querySelectorAll('footer')).some(f=>f.textContent.includes('PROTOTYP 119'))&&D6ThreeDocumentation.version===119));
  fs.writeFileSync(out+'/mobile.json',JSON.stringify({pass:true,release:119,sourceId:identity,htmlSha256:frozen['outputs/index.html'],checks,labels,actual,errors,note:'Fixed touch layout in isolated Edge software WebGL. Physical Android screen timeout, GPU speed and match feel are unmeasured.'},null,2)+'\n');console.log(JSON.stringify({mobile:true,checks:checks.length,labelChecks:labels.checks.length}));
  const results=[];
  for(const config of (live?[{fieldSize:'standard',fieldPlayers:5}]:[{fieldSize:'standard',fieldPlayers:5},{fieldSize:'large',fieldPlayers:5},{fieldSize:'large',fieldPlayers:6}])){
   const pair={config};for(const unity of [false,true]){
    await page.goto(url+'?engine='+(unity?'unity':'browser')+'&iteration=119-parity');await page.evaluate(helper);await page.evaluate(compactHelper);
    await page.evaluate(({config,unity})=>QAJ('parity',D6QAScenario(config,unity)),{config,unity});await page.waitForFunction(()=>QAR.done,null,{timeout:240000});const result=await page.evaluate(()=>QAR);assert(!result.error,result.error);pair[unity?'unity':'native']=result.v;
    const metrics=await page.evaluate(()=>{const people=[...match.people,...(match.exitedPeople||[])],context=v65Context();return {minute:context.state.minute,teams:[0,1].map(team=>({name:v65Club(context,team).name,shots:people.filter(p=>p.t===team).reduce((n,p)=>n+(p.stats.shots||0),0),onTarget:people.filter(p=>p.t===team).reduce((n,p)=>n+(p.stats.onTarget||0),0),goals:match.score[team]})),unresolvedShotEvents:(match.ballAccounting?.events||[]).filter(e=>e.shot&&!e.result).length,interruptedShots:(match.ballAccounting?.events||[]).filter(e=>e.shot&&e.result==='interrupted').length,goalSources:(match.ballAccounting?.events||[]).filter(e=>e.goal).map(e=>({kind:e.kind,shot:Boolean(e.shot),team:e.team,result:e.result}))};});assert(metrics.teams.every(t=>t.shots>=t.onTarget&&t.onTarget>=0)&&metrics.unresolvedShotEvents===0);pair[unity?'unityMetrics':'nativeMetrics']=metrics;console.log(JSON.stringify({config,mode:unity?'unity':'native',shotMetrics:metrics}));
    console.log(JSON.stringify({config,mode:unity?'unity':'native',minute:result.v.end.minute,hash:result.v.digest.all}));
   }
   assert.deepEqual(pair.unity.digest,pair.native.digest);assert.deepEqual(pair.unityMetrics,pair.nativeMetrics);assert(pair.unity.pause.ok&&pair.unity.cp.restored&&pair.unity.cp.unityReady&&pair.unity.end.finished);results.push(pair);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),frozen);
  fs.writeFileSync(out+'/native-unity-parity.json',JSON.stringify({pass:true,release:119,hashes:frozen,sourceId:identity,results,errors,note:'Actual HTML native/Unity complete matches, pause, halftime and actual JSON continuation. All 14 digest parts equal for each pair. No physical-device performance claim.'},null,2)+'\n');
  fs.writeFileSync(out+'/shot-metrics.json',JSON.stringify({pass:true,release:119,sourceId:identity,htmlSha256:frozen['outputs/index.html'],matches:results.map(r=>({config:r.config,...r.unityMetrics,compact:r.unity.compact})),note:'Complete native matches displayed in actual Unity WebGL; QA accelerates simulation for test throughput. Counts include exited players, use settled native onTarget and score, exclude penalty shootout goals. Deterministic fixture sample, not a population balance study.'},null,2)+'\n');
  console.log(JSON.stringify({pass:true,mobileChecks:checks.length,labelChecks:labels.checks.length,fullMatches:results.length*2,parityParts:14}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
