// Actual shot recording, replay lifecycle and sound mix in an isolated profile.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
const setup=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('async function complete('))+';setup',{url:process.env.D6_TEST_URL||'http://127.0.0.1:4197/'});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page,'3d',undefined,null,false);
 await page.evaluate(()=>{v98Scene.renderer.setPixelRatio(.5);v98Scene.renderer.shadowMap.enabled=false;});
 const cases=[];
 for(const team of [0,1])for(const turned of [false,true]){
 const result=await page.evaluate(({team,turned})=>{
  v103EndReplay();running=true;hideOverlay();Object.assign(match,{kickoff:null,countdown:0,postBanner:null,throwIn:null,setPiece:null,flight:null,slide:null,goalPause:0,goalScene:null,rebound:null,halftimePause:0,halftimeBreakDone:turned});v103ReplayState(match).history=[];
  const shooter=match.people.find(p=>p.t===team&&!p.keeper),keeper=match.people.find(p=>p.t!==team&&p.keeper);shooter.x=.5;shooter.y=team===0?.18:.82;
  for(let i=0;i<15;i++){v102State(match).clock+=.04;shooter.x+=.0003;v103Record(match)}
  match.owner=shooter;match.ball={x:shooter.x,y:shooter.y};const rand=Math.random;Math.random=()=>0;try{v55Shoot(shooter)}finally{Math.random=rand}
  for(let i=0;!match.goalPause&&i<80;i++){step(.04*MATCH_SPEED,.04);draw()}
  if(!match.goalPause)throw Error('Forced shot did not score');
  const context=v65Context(),active=v64Active(context.state,context.ownSide);v65ShowSwapInfo(context,[{side:context.ownSide,outPid:active[0],inPid:active[1],minute:23}]);
  for(let i=0;i<100&&!v103ReplayState(match).active;i++){step(.05*MATCH_SPEED,.05);draw()}
  const replay=v103ReplayState(match).active;if(!replay)throw Error('Replay did not start');
  const before=JSON.stringify(match),clock=v102Clock(match),events=JSON.stringify(context.state.events),a=v103ReplayFrame(performance.now(),true);
  step(.9*MATCH_SPEED,.9);v65AfterStep(context);draw();const b=v103ReplayFrame(performance.now(),true);
  const sample={team,turned,frames:replay.frames.length,duration:replay.duration,goalBannerHidden:$('#match-overlay').hidden,swapHidden:!$('#v65-swap-info')||$('#v65-swap-info').hidden,held:JSON.stringify(match)===before&&v102Clock(match)===clock&&JSON.stringify(context.state.events)===events,moved:Math.hypot(a.ball.x-b.ball.x,a.ball.z-b.ball.z)>.001};
  running=false;v65UpdateControls(context);const frozen=JSON.stringify(v103ReplayFrame(performance.now(),false));step(.5,.5);draw();sample.paused=JSON.stringify(v103ReplayFrame(performance.now(),false))===frozen;
  running=true;v65UpdateControls(context);return sample;
 },{team,turned});
 if(!(result.held&&result.moved&&result.paused&&result.swapHidden))console.log(result);assert(result.held&&result.moved&&result.paused&&result.swapHidden);assert(result.frames>15);cases.push(result);
 assert(await page.locator('#v103-replay-hud').isVisible());assert(!(await page.locator('.v84-goal-banner').isVisible()));
 if(team===0&&turned===false){await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/replay103.png'});await page.locator('#v103-replay-hud button').click();}
 else if(team===1&&turned){await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>d6Pitch3D.getState().view==='2d');assert.equal(await page.evaluate(()=>!!v103ReplayState(match).active),false);await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>d6Pitch3D.getState().view==='3d');}
 else await page.evaluate(()=>{const duration=v103ReplayState(match).active.duration;for(let i=0;i<Math.ceil(duration/.05)+1;i++)step(.05*MATCH_SPEED,.05);draw()});
 assert.equal(await page.locator('#v103-replay-hud').count(),0);
 await page.evaluate(()=>{step(.1*MATCH_SPEED,.1);draw()});assert(await page.locator('#v65-swap-info').isVisible(),'substitution follows replay');
 }
 const penalty=await page.evaluate(()=>{
  v103EndReplay();running=true;Object.assign(match,{kickoff:null,postBanner:null,goalPause:0,goalScene:null,setPiece:null,flight:null,throwIn:null,halftimePause:0});
  v50Restart('penalty',0,{x:.5,y:.15},'Penalty');const piece=match.setPiece,wait=piece.wait;
  const random=Math.random;Math.random=()=>0;try{v50TakePenalty(piece)}finally{Math.random=random}
  v50FinishPenalty(piece);for(let i=0;i<100&&!v103ReplayState(match).active;i++)step(.05*MATCH_SPEED,.05);draw();
  const replay=v103ReplayState(match).active;running=false;v65UpdateControls(v65Context());const paused=document.body.classList.contains('v103-replay-paused');running=true;v65UpdateControls(v65Context());
  return {wait,penalty:!!replay?.penalty,scene:!!$('#v50-penalty-scene'),paused};
 });assert.deepEqual(penalty,{wait:4,penalty:true,scene:true,paused:true});await page.locator('#v103-replay-hud button').click();assert.equal(await page.locator('#v50-penalty-scene').count(),0);
 await page.evaluate(async()=>{await v98ToggleSound();v98SyncAudio();});
 const sound=await page.evaluate(()=>{
  const calls=[],base=v98Sound;v98Sound=(...args)=>{calls.push(args);return base(...args)};
  const piece={type:'penalty',phase:'waiting'};match.setPiece=piece;v98SyncAudio();piece.phase='result';v98SyncAudio();match.setPiece=null;match.shots[0]++;v98SyncAudio();v98Sound=base;
  const out={buffers:Object.keys(v98Audio.buffers).length,bass:v98Audio.bus.gain.value,shotCues:calls.filter(c=>c[0]==='shot').length,rate:v98Audio.buffers.shot.sampleRate};
  running=false;v65UpdateControls(v65Context());out.muted=v98Audio.active.size===0&&!v98Audio.ambient;return out;
 });assert.equal(sound.buffers,6);assert.equal(sound.bass,3);assert.equal(sound.shotCues,1);assert(sound.muted);
 assert.deepEqual(errors,[]);fs.writeFileSync('outputs/replay103-results.json',JSON.stringify({cases,penalty,sound,errors},null,2));console.log(JSON.stringify({cases,penalty,sound,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
