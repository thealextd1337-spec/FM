const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),{pathToFileURL}=require('node:url'),{chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline'),liveUrl=process.env.D6_MATCH_BUTTON_LIVE_URL;let fixture='outputs/spieler-nutzer-match.html';
if(baseline){const current=fs.readFileSync('dist/world-goal-replay-v103.js','utf8').replace(/\r\n/g,'\n'),original=execFileSync('git',['show','1e48990:dist/world-goal-replay-v103.js'],{encoding:'utf8',windowsHide:true}).replace(/\r\n/g,'\n'),html=fs.readFileSync(fixture,'utf8');assert(html.includes(current));fixture='outputs/match-play-button-v137-before.html';fs.writeFileSync(fixture,html.replace(current,original));}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:915,height:412},hasTouch:true,isMobile:true,deviceScaleFactor:3}),errors=[],cases=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(liveUrl||pathToFileURL(path.resolve(fixture)).href,{timeout:120000});
  if(liveUrl){await page.waitForFunction(()=>window.D6UserModelStatus==='ready',null,{timeout:60000});assert((await page.locator('footer span').first().textContent()).includes('PROTOTYP 110'));await page.evaluate(()=>{const career=v61CreateCareer('GER-2','button-live-110'),club=career.world.clubs.find(c=>c.id==='GER-2');v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')v66NextMarketDay(career);const fixture=v62Fixtures(career).find(f=>!f.result&&f.homeId==='GER-2');career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};career.world.activeMatch.state.phase='live';v61CurrentCareer=career;v98View='3d';v65Show(v65Context());draw();});}
  else await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  const inspect=()=>page.evaluate(()=>({running,phase:v65Context().state.phase,elapsed:match.elapsed,review:v103ReplayState(match).review&&{time:v103ReplayState(match).review.time,playing:Boolean(v103ReplayState(match).review.playing)},paint:v102Loop,reviewLoop:v132ReviewLoop,label:$('#v131-review [data-v132-play]').getAttribute('aria-label'),disabled:$('#v131-review [data-v132-play]').disabled,icon:$('#v131-review [data-v132-play]').textContent}));
  const click=async()=>{await page.locator('#match-area .v42-pitch-stage').tap({position:{x:100,y:100}});await page.locator('[data-v132-play]').click();};
  for(const language of baseline?['de']:['de','en']){
   await page.evaluate(lang=>{
    clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v132StopReview();v103EndReplay();v103Replays.delete(match);v102StopPaint();
    Object.assign(match,{flight:null,slide:null,kickoff:null,setPiece:null,throwIn:null,goalPause:0,halftimePause:0,finished:false,elapsed:12,score:[2,1]});
    running=true;v65Context().state.phase='live';v65PauseView=false;doppel6Language.set(lang);v102State(match).clock=0;v98Render();v131RecordRendered(v98PitchFrame(match));v102State(match).clock=10;v98Render();v131RecordRendered(v98PitchFrame(match));draw();v102StopPaint();
   },language);
   await click();const paused=await inspect();
   if(baseline){cases.push({language,firstClick:paused});break;}
   assert.equal(paused.running,false);assert.equal(paused.phase,'paused');assert.equal(paused.review,null);assert.equal(paused.paint,0);assert.equal(paused.reviewLoop,0);assert.equal(paused.icon,'▶');assert.equal(paused.label,language==='de'?'Spiel fortsetzen':'Resume match');
   const frozen=await page.evaluate(()=>JSON.stringify(match));await page.waitForTimeout(220);assert.equal(await page.evaluate(()=>JSON.stringify(match)),frozen,'Whole match stays frozen');
   await click();assert.equal(await page.evaluate(()=>running&&v65Context().state.phase==='live'&&!v103ReplayState(match).review),true);
   await page.evaluate(()=>{clearInterval(v65WorldFrame);v102StopPaint();});
   assert.equal((await inspect()).icon,'Ⅱ');assert.equal((await inspect()).label,language==='de'?'Spiel pausieren':'Pause match');
   // The selected button freezes ongoing actions immediately, like seeking does.
   for(const kind of ['flight','slide']){
    await page.evaluate(kind=>{match[kind]={progress:.4};running=true;v65Context().state.phase='live';v131ReviewUI();},kind);
    await click();assert.equal((await inspect()).running,false);assert.equal((await inspect()).phase,'paused');assert.equal((await inspect()).review,null);
    const action=await page.evaluate(kind=>JSON.stringify(match[kind]),kind);await page.waitForTimeout(120);assert.equal(await page.evaluate(kind=>JSON.stringify(match[kind]),kind),action);
    await click();await page.evaluate(()=>{clearInterval(v65WorldFrame);v102StopPaint();});assert.equal((await inspect()).running,true);assert.equal(await page.evaluate(kind=>JSON.stringify(match[kind]),kind),action);await page.evaluate(kind=>{match[kind]=null;},kind);
   }
   // Explicit seek still selects a historical scene; playback never advances the match.
   await page.evaluate(()=>v131Seek(5));const liveClock=await page.evaluate(()=>match.elapsed);
   await click();await page.waitForFunction(()=>v103ReplayState(match).review.time>5.1);assert.equal((await inspect()).running,false);assert.equal(await page.evaluate(()=>match.elapsed),liveClock);
   await click();const reviewPaused=await inspect();assert.equal(reviewPaused.review.playing,false);const selected=reviewPaused.review.time;await page.waitForTimeout(160);assert.equal((await inspect()).review.time,selected);
   await page.evaluate(()=>{v131Seek(v103ReplayState(match).timeline.at(-1).clock);});
   await click();assert.equal(await page.evaluate(()=>running&&!v103ReplayState(match).review),true,'Recording end resumes live without rewinding');await page.evaluate(()=>{clearInterval(v65WorldFrame);v102StopPaint();});
   // Match pause works even before enough frames exist for a recording.
   await page.evaluate(()=>{v103ReplayState(match).timeline=[];draw();v102StopPaint();});assert.equal((await inspect()).disabled,false);await click();assert.equal((await inspect()).running,false);assert.equal((await inspect()).review,null);
   await page.evaluate(()=>{match.finished=true;draw();});assert.equal((await inspect()).disabled,true);await page.evaluate(()=>{match.finished=false;draw();});
   cases.push({language,paused,resumedWithoutReview:true,selectedReviewPreserved:true,endReturnsLive:true,noFramesCanPause:true,finishedCannotResume:true});
  }
  assert.deepEqual(errors,[]);const report={baseline,liveUrl,cases,errors};fs.writeFileSync('outputs/match-play-button-v137'+(baseline?'-before':liveUrl?'-live':'')+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
