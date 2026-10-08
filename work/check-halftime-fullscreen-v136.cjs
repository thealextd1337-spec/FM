const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),{pathToFileURL}=require('node:url'),{chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline');
const liveUrl=process.env.D6_HALFTIME_LIVE_URL;
let fixture='outputs/spieler-nutzer-match.html';
if(baseline){
 const current=fs.readFileSync('dist/world-goal-replay-v103.js','utf8').replace(/\r\n/g,'\n'),original=execFileSync('git',['show','57de5e4:dist/world-goal-replay-v103.js'],{encoding:'utf8',windowsHide:true}).replace(/\r\n/g,'\n'),html=fs.readFileSync(fixture,'utf8');
 assert(html.includes(current));fixture='outputs/halftime-fullscreen-v136-before.html';fs.writeFileSync(fixture,html.replace(current,original));
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:915,height:412},deviceScaleFactor:3,isMobile:true,hasTouch:true}),errors=[],cases=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(liveUrl||pathToFileURL(path.resolve(fixture)).href,{timeout:120000});
  if(liveUrl){
   await page.waitForFunction(()=>window.D6UserModelStatus==='ready',null,{timeout:60000});
   assert((await page.locator('footer span').first().textContent()).includes('PROTOTYP 109'));
   await page.evaluate(()=>{
    const career=v61CreateCareer('GER-2','halftime-live-109'),club=career.world.clubs.find(c=>c.id==='GER-2');
    v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')v66NextMarketDay(career);
    const fixture=v62Fixtures(career).find(f=>!f.result&&f.homeId==='GER-2');career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};career.world.activeMatch.state.phase='live';v61CurrentCareer=career;v98View='3d';v65Show(v65Context());draw();
   });
  }else await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  await page.evaluate(()=>{window.qaNativeFullscreen=$('#match-area').requestFullscreen;clearInterval(v64UiTimer);});
  const state=()=>page.evaluate(()=>({fullscreen:document.body.classList.contains('v132-fullscreen'),native:document.fullscreenElement===$('#match-area'),phase:v65Context().state.phase,running,half:match.halftimePause,elapsed:match.elapsed,score:[...match.score],tactics:v65PauseView&&v65PauseTab==='tactics'&&!$('#v65-plan-view').hidden&&!$('#v65-controls').hidden,tab:v65PauseTab,view:document.body.classList.contains('v98-pitch3d')?'3d':'2d'}));
  for(const scenario of baseline?[{native:true,fullscreen:true,language:'de',portrait:false}]:[
   {native:true,fullscreen:true,language:'de',portrait:false},
   {native:false,fullscreen:true,language:'en',portrait:false},
   {native:false,fullscreen:true,language:'de',portrait:true},
   {native:true,fullscreen:false,language:'de',portrait:false},
   {native:false,fullscreen:true,exitBeforeHalf:true,language:'en',portrait:false}
  ]){
   await page.evaluate(()=>v132LeaveFullscreen());await page.waitForFunction(()=>!document.fullscreenElement);
   await page.setViewportSize(scenario.portrait?{width:412,height:915}:{width:915,height:412});
   await page.evaluate(s=>{
    clearInterval(v65WorldFrame);v102StopPaint();v103EndReplay();v131ReturnLive(false);
    Object.assign(match,{flight:null,slide:null,kickoff:null,setPiece:null,throwIn:null,postBanner:null,countdown:0,goalPause:0,halftimePause:0,halftime:false,halftimeBreakDone:false,halftimePending:false,finished:false,elapsed:37.5,firstHalfEnd:37.5,score:[2,1]});
    const context=v65Context();context.state.phase='live';context.state.halftimeAiDone=false;v65PauseView=false;running=true;v98View='3d';v98Failed=false;
    $('#match-area').requestFullscreen=s.native?window.qaNativeFullscreen:()=>Promise.reject(Error('Unsupported device'));
    doppel6Language.set(s.language);v65UpdateControls(context);v58Refresh();draw();
   },scenario);
   if(scenario.fullscreen){await page.locator('#match-area .v42-pitch-stage').tap();await page.locator('#v99-expand').click();await page.waitForFunction(()=>document.body.classList.contains('v132-fullscreen'));if(scenario.native)await page.waitForFunction(()=>Boolean(document.fullscreenElement));}
   if(scenario.exitBeforeHalf){await page.locator('#v99-expand').click();await page.waitForFunction(()=>!document.body.classList.contains('v132-fullscreen'));}
   // Use the real halftime engine boundary and automatic world-match pause.
   await page.evaluate(()=>{beginHalftimeBreak();v65AfterStep(v65Context());draw();clearInterval(v65WorldFrame);v102StopPaint();});
   if(!baseline)await page.waitForFunction(()=>!document.fullscreenElement);
   const half=await state();assert.equal(half.phase,'paused');assert.equal(half.running,false);assert(half.tactics);assert(half.half>0);
   if(baseline){cases.push({scenario,half,tacticsVisible:await page.locator('#v65-controls').isVisible()});break;}
   if(!baseline){assert.equal(half.fullscreen,false);assert(await page.locator('#v65-controls').isVisible());}
   // Halftime editing and waiting must leave time and score frozen.
   await page.locator('[data-v65-tab="lineup"]').click();await page.locator('[data-v65-tab="tactics"]').click();
   assert.equal((await state()).elapsed,half.elapsed);assert.deepEqual((await state()).score,half.score);
   const start=await page.evaluate(()=>{window.scrollTo({top:0,behavior:'instant'});return v58Button.id;});
   await page.locator(scenario.portrait?'#v65-quick-nav button':'#'+start).click();
   await page.evaluate(()=>{clearInterval(v65WorldFrame);v102StopPaint();});
   const expected=scenario.fullscreen&&!scenario.exitBeforeHalf;
   if(!baseline&&expected)await page.waitForFunction(()=>document.body.classList.contains('v132-fullscreen'));
   if(!baseline&&expected&&scenario.native)await page.waitForFunction(()=>Boolean(document.fullscreenElement));
   const resumed=await state();assert.equal(resumed.phase,'live');assert.equal(resumed.half,0);assert.equal(resumed.running,true);
   if(!baseline){assert.equal(resumed.fullscreen,Boolean(expected));assert.equal(resumed.native,Boolean(expected&&scenario.native));}
   cases.push({scenario,half,resumed});
   console.log(JSON.stringify({passed:scenario}));
  }
  let cleanup=false;
  if(!baseline){
   await page.evaluate(()=>{match.flight=null;match.slide=null;match.halftimePause=0;v65Context().state.phase='live';running=true;v65PauseView=false;draw();});
   await page.locator('#match-area .v42-pitch-stage').tap();await page.locator('#v99-expand').click();
   await page.evaluate(()=>{match.halftimeBreakDone=false;v65Context().state.halftimeAiDone=false;beginHalftimeBreak();v65AfterStep(v65Context());draw();});
   assert.equal(await page.evaluate(()=>v132HalfFullscreenMatch===match),true);
   await page.evaluate(()=>{v65WorldActive=null;v98Dispose();});
   assert.equal(await page.evaluate(()=>v132HalfFullscreenMatch),null);cleanup=true;
  }
  assert.deepEqual(errors,[]);
  const report={baseline,liveUrl,cases,cleanup,errors};fs.writeFileSync('outputs/halftime-fullscreen-v136'+(baseline?'-before':liveUrl?'-live':'')+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
