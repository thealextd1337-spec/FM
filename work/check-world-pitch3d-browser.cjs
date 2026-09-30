// Isolated browser acceptance: never uses the user's browser profile or saves.
const fs=require('fs'),assert=require('node:assert/strict'),path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.D6_TEST_URL||'http://127.0.0.1:4190/';
async function setup(page,view='3d',sourceUrl=url,fixtureSide=null){
 await page.goto(sourceUrl);await page.waitForFunction(()=>window.d6Pitch3D&&document.querySelector('footer span:first-child')?.textContent.includes('PROTOTYP 100'));
 await page.evaluate(({view,fixtureSide})=>{
  let seed=12345;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const career=v61CreateCareer('GER-2','world3d-parity'),club=career.world.clubs.find(item=>item.id==='GER-2');
  v66ChooseSponsor(career,club.id,club.sponsors[0].id);while(career.world.market.phase==='open')v66NextMarketDay(career);
  const fixture=v62Fixtures(career).find(item=>!item.result&&(fixtureSide==='home'?item.homeId==='GER-2':item.homeId==='GER-2'||item.awayId==='GER-2'));
  career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;v98View=view;
  career.world.activeMatch.state.phase='live';v65Show(v65Context());clearInterval(v65WorldFrame);
 },{view,fixtureSide});
}
async function complete(page,view){
 await setup(page,view);
 return page.evaluate(()=>{
  const timeline=[];let frames=0,last='';
  while(!match.finished&&frames++<18000){
   if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}
   step(.05*MATCH_SPEED,.05);if(v65Context().state.phase==='live'&&!match.finished)v65AfterStep(v65Context());
   if(frames%30===0)draw();
   const sample=JSON.stringify({elapsed:match.elapsed,score:match.score,goals:match.goals.length,half:match.halftimeBreakDone,phase:v65Context().state.phase,substitutions:v65Context().state.substitutions.length});
   if(frames%30===0||sample!==last&&match.goals.length)timeline.push(sample);last=sample;
  }
  if(!match.finished)throw Error('Match did not finish');
  const state=v65Context().state;return {frames,timeline,score:match.score,goals:match.goals,events:state.events,substitutions:state.substitutions,elapsed:match.elapsed,minute:state.minute,stats:state.stats,result:v65Context().fixture.result};
 });
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.D6_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  fs.mkdirSync('outputs',{recursive:true});
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[],warnings=[];
  page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().startsWith('3D pitch')){warnings.push(m.text());console.log(m.text());}});
  const twoD=await complete(page,'2d');console.log('2D match finished',twoD.frames,twoD.score);
  const threeD=await complete(page,'3d');assert.deepEqual(threeD,twoD,'identical match with and without 3D rendering');
  console.log('3D match identical: timeline, score, goals, events, substitutions, statistics and booked result.');
  await setup(page);await page.evaluate(()=>{match.kickoff=null;match.countdown=0;match.postBanner=null;match.owner=match.people.find(person=>person.t===0&&!person.keeper);match.ball={x:match.owner.x,y:match.owner.y};hideOverlay();for(let i=0;i<100;i++){step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context());}draw();});
  await page.waitForFunction(()=>v98Scene.advertisingState.ready);
  const sponsor=await page.evaluate(()=>{const context=v65Context(),home=v66Club(context.career,context.fixture.homeId);return {ownSide:context.ownSide,expected:home.sponsors.find(item=>item.id===home.sponsorId).name,actual:v98Scene.advertisingState.name};});assert.equal(sponsor.actual,sponsor.expected);assert.equal(sponsor.ownSide,1,'sponsor comes from home club during away match');
  assert.equal(await page.locator('[data-v98-player]').first().evaluate(el=>getComputedStyle(el).fontSize),'8px');
  const stage=page.locator('#match-area .v42-pitch-stage');await stage.screenshot({path:'outputs/world3d-play.png'});
  await page.evaluate(()=>{const player=match.people.find(person=>person.t===0&&!person.keeper&&person!==match.owner);player.x=.3;player.y=.1;const snapshot=v55OffsideSnapshot(match.owner);if(!snapshot.offside.has(player))throw Error('Fixture player must be offside');v55WhistleOffside(snapshot,player);draw();});
  const offside=await page.evaluate(()=>window.d6Pitch3D.getState().frame.offside);assert(offside);assert.equal(offside.signal.pose,'raised');assert(!(await page.locator('#match-overlay').isVisible()),'real offside has no central banner');
  await stage.screenshot({path:'outputs/world3d-offside-raised.png'});
  await page.evaluate(()=>{for(let i=0;i<20;i++)step(.05*MATCH_SPEED,.05);draw();});assert.equal(await page.evaluate(()=>window.d6Pitch3D.getState().frame.offside.signal.pose),'far');
  await stage.screenshot({path:'outputs/world3d-offside-far.png'});
  await page.evaluate(()=>{for(let i=0;i<11;i++)step(.05*MATCH_SPEED,.05);draw();});assert.equal(await page.evaluate(()=>window.d6Pitch3D.getState().frame.offside.signal.pose),'middle');
  await stage.screenshot({path:'outputs/world3d-offside.png'});
  await page.evaluate(()=>{hideOverlay();match.offsideVisual=null;const scorer=match.people.find(person=>person.t===0&&!person.keeper),keeper=match.people.find(person=>person.t===1&&person.keeper);v50Goal(scorer,keeper);draw();});
  assert(!(await page.locator('.v84-goal-banner').isVisible()),'goal banner waits');
  await page.evaluate(()=>{step(.49*MATCH_SPEED,.49);draw();});assert(!(await page.locator('.v84-goal-banner').isVisible()),'goal banner waits until 500ms');
  await page.evaluate(()=>{step(.011*MATCH_SPEED,.011);draw();});assert(await page.locator('.v84-goal-banner').isVisible());const goalText=await page.locator('.v84-goal-details').textContent();
  await stage.screenshot({path:'outputs/world3d-goal.png'});
  const goalPause=await page.evaluate(()=>{const elapsed=match.elapsed;step(.05*MATCH_SPEED,.05);draw();return {frozen:elapsed===match.elapsed,ball:window.d6Pitch3D.getState().frame.ball};});assert(goalPause.frozen);
  await page.evaluate(()=>v100PitchMenu(true));await page.locator('[data-v98-view="2d"]').click();assert.equal(await page.locator('.v84-goal-details').textContent(),goalText);await page.evaluate(()=>v100PitchMenu(true));await page.locator('[data-v98-view="3d"]').click();
  await page.evaluate(()=>{hideOverlay();match.goalScene=null;match.goalPause=0;match.flight=null;match.slide=null;match.kickoff=null;v65PauseView=true;v65PauseTab='lineup';v65Pause();v65PauseView=true;v65UpdateControls(v65Context());});
  await page.setViewportSize({width:1440,height:1300});
  const selected=await page.evaluate(()=>{const c=v65Context();v65SelectedSlot=v64Active(c.state,c.ownSide).findIndex(pid=>c.state.roles[pid]==='att');v65UpdateControls(c);return {outPid:v64Active(c.state,c.ownSide)[v65SelectedSlot],slot:v65SelectedSlot};});
  const {outPid}=selected,incoming=page.locator('#v65-plan-view [data-v65-bench-card]').first(),inPid=await incoming.getAttribute('data-v65-bench-card');
  await incoming.locator('.bench-title').dragTo(page.locator(`#v65-plan-view [data-v65-pick-slot="${selected.slot}"] .token`));
  assert.equal(await page.evaluate(()=>v65Context().state.pending[v65Context().ownSide].length),1);
  await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);kickoff(0);v65AfterStep(v65Context());draw();});
  assert(await page.locator('#v65-swap-info').isVisible());
  assert(await page.evaluate(({outPid,inPid})=>!window.d6Pitch3D.getState().frame.players.some(person=>person.id===outPid)&&window.d6Pitch3D.getState().frame.players.some(person=>person.id===inPid),{outPid,inPid}));
  await stage.screenshot({path:'outputs/world3d-substitution.png'});
  assert(!(await page.locator('#v65-swap-info').textContent()).includes('undefined'));
  await page.evaluate(()=>{v50PenaltyVisual({team:0,taker:match.people.find(person=>person.t===0&&!person.keeper)},null);draw();});assert(await page.locator('#v50-penalty-scene').isVisible());await stage.screenshot({path:'outputs/world3d-penalty.png'});
  await page.evaluate(()=>{$('#v50-penalty-scene').remove();match.halftimeBreakDone=true;draw();showOverlay('HALBZEIT','Kurze Pause vor der zweiten Hälfte');});assert(await page.locator('#match-overlay').isVisible());const turned=await page.evaluate(()=>window.d6Pitch3D.getState().frame.turned);assert(turned);
  await page.evaluate(()=>{hideOverlay();showOverlay('ABPFIFF','Das Spiel ist beendet.');draw();});assert(await page.locator('#match-overlay').isVisible());
  await page.setViewportSize({width:844,height:390});await page.evaluate(()=>{hideOverlay();draw();});await stage.screenshot({path:'outputs/world3d-play-mobile.png'});
  await page.evaluate(()=>{window.doppel6Language.set('en');draw();});
  await page.waitForFunction(()=>document.querySelector('#v98-view-controls').getAttribute('aria-label')==='Pitch view');
  assert.equal(await page.locator('#v98-canvas').getAttribute('aria-label'),'3D football match from the TV camera');
  assert((await page.locator('[data-v98-player]').first().getAttribute('aria-label')).endsWith('Live player information'));
  await stage.screenshot({path:'outputs/world3d-play-english.png'});
  await page.evaluate(()=>{window.doppel6Language.set('de');draw();});
  await page.waitForFunction(()=>document.querySelector('#v98-view-controls').getAttribute('aria-label')==='Spielfelddarstellung');
  assert((await page.locator('[data-v98-player]').first().getAttribute('aria-label')).endsWith('Live-Spielerinfo'));
  console.log('Banner and substitution checks passed; testing device orientation.');
  await page.setViewportSize({width:1024,height:1366});await page.waitForFunction(()=>window.d6Pitch3D.getState().view==='2d');
  await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>window.d6Pitch3D.getState().view==='3d');
  await page.evaluate(()=>{v98Scene.renderer.domElement.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));});assert.equal(await page.evaluate(()=>window.d6Pitch3D.getState().view),'2d');
  assert(await page.locator('#v98-status').textContent());
  await page.evaluate(()=>v100PitchMenu(true));await page.locator('[data-v98-view="3d"]').click();assert.equal(await page.evaluate(()=>window.d6Pitch3D.getState().view),'3d');
  console.log('Orientation and context-loss recovery passed.');
  console.log('Checking leave and storage.');await page.evaluate(async()=>{await Promise.race([v65Leave(true),new Promise((_,reject)=>setTimeout(()=>reject(Error(JSON.stringify({writing:v61StorageWriting,pending:Boolean(v61StoragePending),ready:v61StorageReady,error:v61StorageError,world:Boolean(v65WorldActive)}))),10000))])});assert.equal(await page.locator('#v98-canvas').count(),0);console.log('Leave passed.');
  await setup(page,'3d',url,'home');await page.waitForFunction(()=>v98Scene.advertisingState.ready);
  assert(await page.evaluate(()=>{const c=v65Context(),home=v66Club(c.career,c.fixture.homeId);return c.ownSide===0&&v98Scene.advertisingState.name===home.sponsors.find(item=>item.id===home.sponsorId).name;}),'home fixture uses its own home sponsor');
  await stage.screenshot({path:'outputs/world3d-home-sponsor.png'});
  // Offline artifact uses embedded vendor, shared scene and all SC samples.
  console.log('Checking embedded offline build.');await setup(page,'3d',pathToFileURL(path.resolve('outputs/Doppel-6-Fussballmanager.html')).href);assert.equal(await page.evaluate(()=>window.d6Pitch3D.getState().view),'3d');console.log('Offline setup passed.');
  assert.equal(await page.evaluate(()=>window.d6Pitch3D.getState().camera.mode),'follow');
  await page.evaluate(()=>v100PitchMenu(true));await page.locator('#v98-camera').selectOption('wide');assert.equal(await page.evaluate(()=>window.d6Pitch3D.getState().camera.mode),'wide');
  await page.locator('#v98-camera').selectOption('follow');assert.equal(await page.evaluate(()=>window.d6Pitch3D.getState().camera.mode),'follow');
  await page.waitForFunction(()=>v98Scene.advertisingState.ready);
  assert(await page.evaluate(()=>v98Scene.advertisingState.name===v98HomeSponsor(v65Context()).name),'offline sponsor logo loaded with correct home contract');
  assert(await page.evaluate(()=>window.D6_AUDIO&&Object.keys(window.D6_AUDIO).length===6));
  await page.evaluate(()=>v100PitchMenu(true));await page.locator('#v98-sound').click();await page.waitForFunction(()=>window.d6Pitch3D.getState().audioLoaded);assert(await page.evaluate(()=>window.d6Pitch3D.getState().ambient));
  fs.writeFileSync('outputs/world3d-parity.json',JSON.stringify({matched:true,twoD,goalPause,offside,turned,errors,warnings},null,2));
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);console.log('Browser gates: real play, goal/banner/pause, offside, substitutions, penalties, halftime, fulltime, tablet orientation, context-loss fallback, disposal and embedded offline audio passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
