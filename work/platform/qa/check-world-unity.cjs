'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../../ui-redesign/serve.cjs');
const freshnessCandidate=process.argv.includes('--freshness');
const roleCandidate=process.argv.includes('--roles')||freshnessCandidate;
const offenseCandidate=process.argv.includes('--offense');
const out=process.env.D6_QA_OUTPUT?path.resolve(process.env.D6_QA_OUTPUT):freshnessCandidate?path.resolve('outputs/platform/freshness-v158/unity-world'):offenseCandidate?path.resolve('outputs/platform/offensive-quality',roleCandidate?'unity-roles':'unity-normal'):path.resolve('outputs/platform/world-unity',roleCandidate?'roles-wave4':'');fs.mkdirSync(out,{recursive:true});
const server=createServer();const port=4361,url=`http://127.0.0.1:${port}/source/index.html`;
const httpBuild=process.argv.includes('--http-build');
const sourceHashes=Object.fromEntries(['dist/world-unity-v151.js','dist/world-offensive-quality-v157.js','dist/pitch-v56.js','dist/world-pitch3d-v98.js','dist/pitch-motion-v102.js','dist/unity-match/runtime.js','dist/game.js','dist/pitch-v55.js','dist/world-match-v64.js','dist/world-physical-v65.js','dist/world-player-roles-v154.js','dist/world-player-performance-v155.js','outputs/index.html'].map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
if(freshnessCandidate)for(const file of ['dist/player-load-candidate-v158.js','dist/world-player-load-v158.js','dist/player-freshness.js','dist/player-effective-abilities.js','dist/player-status-v51.js'])sourceHashes[file]=require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(freshnessCandidate){const file='outputs/platform/unity-web/probe-build.json',manifest=JSON.parse(fs.readFileSync(file));for(const input of [file,...manifest.files.map(item=>'outputs/platform/unity-web/Build/'+item.file)])sourceHashes[input]=require('node:crypto').createHash('sha256').update(fs.readFileSync(input)).digest('hex');}
const report={checks:[],errors:[],parity:null,roleCandidate,offenseCandidate,freshnessCandidate,builtDocumentProtocol:httpBuild?'http:':'file:',sourceHashes};
function check(name,condition){assert(condition,name);report.checks.push(name);console.log(name);}
async function prepare(page,engine='unity',side='home',documentUrl=url){
 await page.goto(documentUrl+'?engine='+engine+(roleCandidate?'&players=wave3':''));await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter);await page.waitForFunction(()=>window.userMeshyMatchReady,{},{timeout:45000});
 return page.evaluate(async ({side})=>{
  let seed=12345;window.D6TestRandomCalls=0;Math.random=()=>{window.D6TestRandomCalls++;seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const c=v61CreateCareer('GER-2','world-unity-integration'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);if(c.world.market.phase==='budget')v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
  const fixture=v62Fixtures(c).find(f=>!f.result&&(side==='home'?f.homeId===club.id:f.awayId===club.id));
  c.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(c,fixture)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);
  window.D6QAWorldTick=(real)=>{step(real*MATCH_SPEED,real);const context=v65Context();if(context.state.phase==='live'&&!match.finished)v65AfterStep(context);if(v65PauseRequested&&!match.flight&&!match.slide&&context.state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame);}};
  return {fixtureId:fixture.id,ownId:club.id,ownSide:v65Context().ownSide,ids:match.people.map(p=>p.pid)};
 },{side});
}
async function waitPicture(page){await page.waitForFunction(()=>D6UnityMatch?.ready&&D6UnityMatch.lastAck?.sequence>=D6UnityMatch.picture?.sequence-1,{},{timeout:120000});}
async function fullMatch(page,engine){
 await prepare(page,engine);if(engine==='unity')await waitPicture(page);
 return page.evaluate(({offenseCandidate,freshnessCandidate})=>{
  // Automatic slow motion is covered separately. Both accelerated runs consume
  // precisely the same simulation ticks without wall-clock replay waits.
  v103CanReplay=()=>false;v65Resume();clearInterval(v65WorldFrame);let ticks=0,half=false;
  while(!match.finished&&ticks++<18000){
   if(v65Context().state.phase==='paused'){if(match.halftimePause>0)half=true;v65Resume();clearInterval(v65WorldFrame);}
   D6QAWorldTick(.05);
   if(ticks%40===0)draw();
  }
  if(!match.finished)throw Error('Full match did not finish');draw();const c=v65Context();
  return {...(freshnessCandidate?{playerLoad:c.state.playerLoad,fresh:c.state.fresh}:{}),...(offenseCandidate?{attackFlow:match.attackFlow,bodies:match.people.map(p=>({pid:p.pid,x:p.x,y:p.y,motion:p.offenseMotion}))}:{}),ticks,half,elapsed:match.elapsed,score:match.score,goals:match.goals,events:c.state.events,substitutions:c.state.substitutions,stats:c.state.stats,minute:c.state.minute,result:c.fixture.result,record:c.fixture.matchRecord,ledger:v66Own(c.career).ledger,history:v66Own(c.career).roster.map(p=>({pid:p.pid,history:p.history,formRatings:p.formRatings,fresh:p.fresh,...(c.state.playerPerformance?{playerModel:p.playerModel,skills:v154Skills(p)}:{})})),...(c.state.playerPerformance?{performance:c.state.playerPerformance}:{})};
 },{offenseCandidate,freshnessCandidate});
}
(async()=>{
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}});page.on('pageerror',e=>report.errors.push(e.message));
  const first=await prepare(page);console.log('Waiting for genuine Unity player');
  if(roleCandidate)check('New role candidate uses saved parameters and shared live phases',await page.evaluate(()=>v154Active(v65Context().career)&&Boolean(v65Context().state.playerPerformance)&&match.people.every(p=>Boolean(p.tacticalRole))));
  await waitPicture(page);check('Unity loaded the real fixture',await page.evaluate(id=>D6UnityMatch.session.startsWith(id+':'),first.fixtureId));
  if(freshnessCandidate){
   check('Unity receives measured freshness for all actual P02 actors',await page.evaluate(()=>Boolean(v65Context().state.playerLoad)&&D6UnityMatch.picture.players.every(p=>p.freshness>=0&&p.freshness<=1&&p.freshness===v65Context().state.fresh[p.id]/100)));
   check('Old picture contract omits missing freshness without changing frame data',await page.evaluate(()=>{const frame=v98PitchFrame(match);for(const p of frame.players)delete p.freshness;const before=JSON.stringify(frame);const packet=D6WorldUnityContract.picture(frame,'old-picture',1,{position:{x:0,z:0,height:1},target:{x:0,z:0},fov:42},'paused',[0,0]);return packet.players.every(p=>!Object.hasOwn(p,'freshness'))&&JSON.stringify(frame)===before;}));
  }
  check('Unity displays exactly the actual starting players',JSON.stringify((await page.evaluate(()=>D6UnityMatch.lastAck.ids)).sort())===JSON.stringify(first.ids.sort()));
  check('Visible labels identify real players',await page.locator('#d6-unity-labels button').count()===12);
  await page.screenshot({path:path.join(out,'real-match.png')});
  const frozen=await page.evaluate(()=>({elapsed:match.elapsed,score:[...match.score],ball:{...match.ball},randomCalls:D6TestRandomCalls}));await page.waitForTimeout(400);
  check('Rendering a paused match does not advance its clock or ball',JSON.stringify(frozen)===JSON.stringify(await page.evaluate(()=>({elapsed:match.elapsed,score:[...match.score],ball:{...match.ball},randomCalls:D6TestRandomCalls}))));
  const previousSession=await page.evaluate(()=>D6UnityMatch.session);
  const restore=await page.evaluate(()=>{const c=v65Context();v65Snapshot(c);const saved={elapsed:match.elapsed,score:[...match.score],ids:match.people.map(p=>p.pid)};match=null;v65WorldActive=null;v65Show(c);clearInterval(v65WorldFrame);return saved;});
  // The restored match is picked up by the next render frame, not synchronously.
  await page.waitForFunction(previous=>D6UnityMatch.session&&D6UnityMatch.session!==previous,previousSession,{timeout:15000});
  await waitPicture(page);check('Checkpoint restoration starts a fresh Unity session',previousSession!==await page.evaluate(()=>D6UnityMatch.session));
  check('Checkpoint keeps the original clock, score and lineup',JSON.stringify(restore)===JSON.stringify(await page.evaluate(()=>({elapsed:match.elapsed,score:[...match.score],ids:match.people.map(p=>p.pid)}))));
  const changed=await page.evaluate(()=>{const c=v65Context(),side=c.ownSide,out=v64Active(c.state,side).find(id=>!v64Player(c.career,c.fixture,side,id).keeper),incoming=v64Bench(c.state,side).find(id=>!v64Player(c.career,c.fixture,side,id).keeper);v64QueueSubstitution(c.career,c.fixture,c.state,side,out,incoming);const changes=v64ExecutePending(c.career,c.fixture,c.state,'Unity-Abnahme');for(const change of changes)v65PhysicalSwap(c,change);v65ApplyTactics(c);draw();return {out,incoming};});
  await page.waitForFunction(p=>D6UnityMatch.lastAck.ids.includes(p.incoming)&&!D6UnityMatch.lastAck.ids.includes(p.out),changed);
  check('Substitution changes the Unity identity without a second substitute',await page.locator('#d6-unity-labels button').count()===12);
  // The native kickoff countdown deliberately keeps elapsed at 0.
  // Reach actual play, then await Unity's ACK instead of a fixed render delay.
  report.liveClock=await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);let ticks=0;while(match.elapsed===0&&ticks++<200)D6QAWorldTick(.05);for(let n=0;n<20;n++)D6QAWorldTick(.05);draw();return {ticks,elapsed:match.elapsed,countdown:match.countdown};});
  await page.waitForFunction(()=>D6UnityMatch.lastAck?.clock>0,{},{timeout:30000});
  check('Unity consumes actual movement and the authoritative clock',await page.evaluate(()=>D6UnityMatch.lastAck.clock>0));
  if(offenseCandidate){
   check('New native mass and body heading are finite and included in actual Unity facing',await page.evaluate(()=>v157Active(match)&&match.people.every(p=>{const b=p.offenseMotion||v157InitialBody(p),frame=v98PitchFrame(match),actor=frame.players.find(q=>q.id===p.pid);return b&&b.massKg>=52&&b.massKg<=108&&[b.vx,b.vy,b.heading].every(Number.isFinite)&&(p.slideActive||Boolean(actor.movement?.facing));})));
   const turn=await page.evaluate(()=>{
    const p=match.people.find(p=>p.t===0&&!p.keeper),q=match.people.find(q=>q.t===0&&!q.keeper&&q!==p);
    match.kickoff=match.setPiece=match.throwIn=match.flight=match.rebound=match.slide=null;match.goalPause=match.halftimePause=0;match.postBanner=null;match.owner=p;match.fullTimeEnd=match.elapsed+100;
    for(const r of match.people){r.slideActive=false;r.recoverUntil=0;}
    for(const r of match.people)if(r!==p&&r!==q){r.x=.08;r.y=r.t===0?.8:.15;if(r.offenseMotion)r.offenseMotion.vx=r.offenseMotion.vy=0;}
    p.x=.5;p.y=.49;q.x=.5;q.y=.61;q.tacticalRole='ball-winner';q.role=-1;q.roleCoordTarget={x:q.x,y:q.y};
    Object.assign(v157Body(q),{vx:0,vy:0,heading:Math.PI});Object.assign(v157Body(p),{vx:0,vy:0,heading:Math.PI});match.ball=v123OwnedBall(match);
    const before=p.stats.passes,nativePass=v55GroundPass;let releaseAngle=null,ticks=0;
    // The role controller may move the receiver during preparation. Observe
    // alignment at the actual release, rather than the fixture's initial axis.
    v55GroundPass=function(actor,receiver,...args){
     const scale=v150Scale(),angle=Math.abs(v157Angle(actor.offenseMotion.heading,Math.atan2((receiver.x-actor.x)*scale.x,(receiver.y-actor.y)*scale.y))),count=actor.stats.passes;
     const result=nativePass(actor,receiver,...args);
     if(actor===p&&receiver===q&&actor.stats.passes===count+1)releaseAngle=angle;
     return result;
    };
    try{
     v55GroundPass(p,q);const queued=Boolean(match.attackFlow.pendingTurn)&&!match.flight&&p.stats.passes===before;
     v65Snapshot(v65Context());const saved=structuredClone(v65Context().state.physicalSnapshot);
     while(!match.flight&&p.stats.passes===before&&ticks++<120)D6QAWorldTick(.025);
     draw();return {queued,savedBody:saved.match.people.find(r=>r.pid===p.pid).offenseMotion,savedTurn:saved.match.attackFlow.pendingTurn,released:Boolean(match.flight)&&p.stats.passes===before+1,angle:releaseAngle,ticks};
    }finally{v55GroundPass=nativePass;}
   });
   report.turn=turn;
   console.log('Native backwards-pass fixture',JSON.stringify(turn));
   check('Backwards pass keeps possession and stats until a physical body turn',turn.queued&&turn.released&&Number.isFinite(turn.angle)&&turn.angle<.31&&turn.ticks>1);
   check('Body velocity and unfinished turn are serializable in native checkpoint',Boolean(turn.savedBody)&&turn.savedTurn?.kind==='ground');
   await waitPicture(page);await page.screenshot({path:path.join(out,'backwards-pass-turn.png')});
   await prepare(page);await waitPicture(page);await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);});
  }
  // Record a short genuine segment and open the existing review controls.
  for(let i=0;i<18;i++){await page.evaluate(()=>{for(let n=0;n<4;n++)D6QAWorldTick(.05);draw();});await page.waitForTimeout(55);}
  if(offenseCandidate){await waitPicture(page);await page.screenshot({path:path.join(out,'live-segment.png')});}
  const reviewBefore=await page.evaluate(()=>{const saved={elapsed:match.elapsed,score:[...match.score],events:JSON.stringify(v65Context().state.events)};v131Seek(v103ReplayState(match).timeline.at(-1).clock);return saved;});
  await page.waitForTimeout(180);check('Unity review uses the existing recorded match timeline',await page.evaluate(()=>Boolean(v103ReplayState(match).review)&&D6UnityMatch.picture.replay));
  await page.evaluate(()=>{const state=v103ReplayState(match);state.review.time=state.timeline[0].clock;draw();});await page.waitForTimeout(180);
  check('Seeking review does not change live results or events',JSON.stringify(reviewBefore)===JSON.stringify(await page.evaluate(()=>({elapsed:match.elapsed,score:[...match.score],events:JSON.stringify(v65Context().state.events)}))));
  await page.screenshot({path:path.join(out,'review.png')});
  await prepare(page);await waitPicture(page);
  await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);for(let i=0;i<20;i++)D6QAWorldTick(.05);const scorer=match.people.find(p=>p.t===0&&!p.keeper),keeper=match.people.find(p=>p.t===1&&p.keeper);v50Goal(scorer,keeper);for(let i=0;i<15;i++)D6QAWorldTick(.05);draw();});
  await page.waitForFunction(()=>D6UnityMatch.picture?.netActive&&D6UnityMatch.picture.net.bulge>.5);
  check('Actual goal pictures carry the animated net impact',await page.evaluate(()=>match.goals.length===1&&match.score[0]===1&&D6UnityMatch.picture.net.age>0));
  const goalBefore=await page.evaluate(()=>{const state=v103ReplayState(match);if(!v103StartReplay(match,state))throw Error('Native goal replay did not start');const impact=state.active.frames.find(f=>f.net?.bulge>.5);if(!impact)throw Error('Net impact not recorded');state.active.elapsed=(impact.clock-state.active.frames[0].clock)/.72;v65Pause();draw();return JSON.stringify({score:match.score,goals:match.goals,events:v65Context().state.events});});
  await page.waitForFunction(()=>D6UnityMatch.picture?.replay&&D6UnityMatch.picture.netActive);
  check('Goal replay retains net motion and never books a second goal',goalBefore===await page.evaluate(()=>JSON.stringify({score:match.score,goals:match.goals,events:v65Context().state.events})));
  if(freshnessCandidate){
   await prepare(page);await waitPicture(page);
   const half=await page.evaluate(()=>{
    v103CanReplay=()=>false;v133ToggleEnlarge();v65Resume();clearInterval(v65WorldFrame);let ticks=0;
    while((!match.halftimePause||v65Context().state.phase!=='paused')&&!match.finished&&ticks++<10000)D6QAWorldTick(.05);
    draw();const s=v65Context().state;return{ticks,phase:s.phase,pause:match.halftimePause,expanded:v99Expanded,full:Boolean(document.fullscreenElement),fresh:JSON.stringify(s.fresh),load:JSON.stringify(s.playerLoad)};
   });
   report.expandedHalftime=half;
   check('Real enlarged halftime reaches the native pause with P02 recovery',half.pause>0&&half.phase==='paused'&&half.expanded&&!half.full);
   await page.waitForTimeout(300);
   check('Enlarged halftime wait never consumes load or repeats recovery',await page.evaluate(before=>JSON.stringify(v65Context().state.fresh)===before.fresh&&JSON.stringify(v65Context().state.playerLoad)===before.load,half));
   await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);for(let i=0;i<15;i++)D6QAWorldTick(.05);draw();});await waitPicture(page);
   check('Second half remains genuine Unity in the enlarged view',await page.evaluate(()=>v99Expanded&&v98View==='3d'&&D6UnityMatch.active&&!D6UnityMatch.lastError&&D6UnityMatch.lastAck.ids.every(id=>match.people.some(p=>p.pid===id))));
   // An ACK precedes endFrameRendering. Let the real post-render head
   // projection catch up after resizing, before capturing the enlarged view.
   await page.waitForTimeout(350);
   report.enlargedProjectionBeforeWait=await page.evaluate(()=>{const p=D6UnityMatch.projection,rect=document.querySelector('#d6-unity-host').getBoundingClientRect();return {width:p?.width,height:p?.height,hostWidth:rect.width,hostHeight:rect.height,markers:p?.markers.length,actors:match.people.length,sequence:p?.sequence,ack:D6UnityMatch.lastAck.sequence};});
   console.log('Enlarged projection before bounded render wait',JSON.stringify(report.enlargedProjectionBeforeWait));
   const enlargedProjection=await page.waitForFunction(()=>{const p=D6UnityMatch.projection,rect=document.querySelector('#d6-unity-host').getBoundingClientRect();const matches=p?.markers.length===match.people.length&&p.markers.every(m=>match.people.some(person=>person.pid===m.id))&&Math.abs(p.width-rect.width)<=2&&Math.abs(p.height-rect.height)<=2&&p.sequence>=D6UnityMatch.lastAck.sequence-1;return matches?{matches,width:p.width,height:p.height,hostWidth:rect.width,hostHeight:rect.height,sequence:p.sequence,ack:D6UnityMatch.lastAck.sequence}:false;},{},{timeout:15000});
   // Assert the same post-render observation. A second browser round trip can
   // receive a newer ACK and compare it to an earlier projection incorrectly.
   report.enlargedProjection=await enlargedProjection.jsonValue();await enlargedProjection.dispose();
   check('Rendered head projections use actual actor IDs and the enlarged viewport',report.enlargedProjection.matches);
   await page.screenshot({path:path.join(out,'expanded-second-half.png')});
  }
  const native=await fullMatch(page,'browser');console.log('Reference match complete');
  const unity=await fullMatch(page,'unity');console.log('Unity match complete');
  fs.writeFileSync(path.join(out,'parity-raw.json'),JSON.stringify({native,unity},null,2));assert(JSON.stringify(unity)===JSON.stringify(native),'Full match parity differs; inspect parity-raw.json');report.parity={ticks:unity.ticks,half:unity.half,score:unity.score,minute:unity.minute,recordPlayers:unity.record.players.length};check('Full match, halftime, events, stats, career records and finances are identical',unity.half&&unity.minute>=90);
  if(roleCandidate)check('Unity parity also includes actual role events, routine and learning bookings',unity.performance.events.length>0&&unity.history.some(p=>p.playerModel.roleModel.processedFixtures.length>0&&p.playerModel.development.processedAppearances.length>0));
  await page.waitForTimeout(200);await page.screenshot({path:path.join(out,'full-time.png')});
  await prepare(page,'unity','away');await waitPicture(page);check('Away fixture keeps physical team and real home/away identities',await page.evaluate(()=>v65Context().ownSide===1&&D6UnityMatch.lastAck.ids.every(id=>match.people.some(p=>p.pid===id))));
  await page.evaluate(()=>{v98View='2d';draw();});check('2D remains usable while retaining the Unity session',await page.locator('#d6-unity-host').isHidden());await page.evaluate(()=>{v98View='3d';draw();});await waitPicture(page);
  check('Return to Unity restores the same fixture',await page.evaluate(()=>D6UnityMatch.active));
  await page.evaluate(async()=>{await v65Leave(true);});check('Leaving a match removes the renderer and stream',await page.locator('#d6-unity-host').count()===0);
  const failurePage=await browser.newPage({viewport:{width:1440,height:950}});await failurePage.route('**/unity/probe-build.json',route=>route.fulfill({status:404,body:'Not available'}));await prepare(failurePage);await failurePage.waitForFunction(()=>v98View==='2d'&&D6UnityMatch.lastError);
  check('Missing Unity build falls back to a playable 2D match',await failurePage.evaluate(()=>match.people.length===12&&!D6UnityMatch.active&&v65Context().state.phase==='paused'));await failurePage.close();
  const filePage=await browser.newPage({viewport:{width:1440,height:950}});filePage.on('pageerror',e=>report.errors.push(e.message));
  await filePage.addInitScript(runtime=>{window.D6UnityMatchUrl=runtime;},`http://127.0.0.1:${port}/source/unity-match/runtime.html`);
  if(httpBuild)await filePage.route('**/built/index.html?*',route=>route.fulfill({contentType:'text/html',body:fs.readFileSync('outputs/index.html','utf8').replace('<head>',`<head><base href="http://127.0.0.1:${port}/source/">`)}));
  const offline=httpBuild?`http://127.0.0.1:${port}/built/index.html`:require('node:url').pathToFileURL(path.resolve('outputs/index.html')).href;
  const offlineFixture=await prepare(filePage,'unity','home',offline);await waitPicture(filePage);
  check(httpBuild?'Built HTML streams its actual match to Unity over local HTTP':'Locally opened offline build streams its actual match to Unity',await filePage.evaluate(({id,protocol})=>location.protocol===protocol&&D6UnityMatch.session.startsWith(id+':')&&D6UnityMatch.lastAck.ids.every(pid=>match.people.some(p=>p.pid===pid)),{id:offlineFixture.fixtureId,protocol:report.builtDocumentProtocol}));
  const foreignBefore=await filePage.evaluate(()=>{const saved={elapsed:match.elapsed,score:[...match.score],events:JSON.stringify(v65Context().state.events)};window.postMessage({channel:D6WorldUnityContract.schema,kind:'error',message:'foreign renderer'},'*');return saved;});await filePage.waitForTimeout(100);
  check('Foreign window messages cannot fail the renderer or change a match',await filePage.evaluate(saved=>D6UnityMatch.ready&&!D6UnityMatch.lastError&&JSON.stringify(saved)===JSON.stringify({elapsed:match.elapsed,score:[...match.score],events:JSON.stringify(v65Context().state.events)}),foreignBefore));
  await filePage.screenshot({path:path.join(out,'offline-match.png')});await filePage.close();
  check('No uncaught page errors',report.errors.length===0);
  if(freshnessCandidate)check('Frozen source, HTML and actual Unity build stayed identical during tests',Object.entries(sourceHashes).every(([file,hash])=>require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex')===hash));
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'runtime-tests.json'),JSON.stringify(report,null,2));}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
