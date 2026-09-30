const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
const setup=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('async function complete('))+';setup',{url:process.env.D6_TEST_URL||'http://127.0.0.1:4195/'});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page);
  await page.waitForFunction(()=>v98Scene.advertisingState.ready);
  const boards=await page.evaluate(()=>v98Scene.advertisingState.boards);assert.equal(boards.length,12);assert(boards.every(b=>Math.abs(b.z)>22&&Math.abs(b.x)+b.width/2<34),'sponsor boards only outside long sidelines');
  const widthBefore=await page.locator('#v98-canvas').evaluate(el=>el.getBoundingClientRect().width);
  await page.locator('#v99-expand').click();const widthAfter=await page.locator('#v98-canvas').evaluate(el=>el.getBoundingClientRect().width);assert(widthAfter>widthBefore*1.3,'corner button enlarges actual pitch');assert.equal(await page.locator('#v99-expand').getAttribute('aria-pressed'),'true');
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/world3d-expanded99.png'});
  await page.locator('#v99-expand').click();assert.equal(await page.locator('#v99-expand').getAttribute('aria-pressed'),'false');
  const save=await page.evaluate(async()=>{
   hideOverlay();Object.assign(match,{goalPause:0,goalScene:null,kickoff:null,postBanner:null,countdown:0,flight:null,throwIn:null,setPiece:null});
   const shooter=match.people.find(p=>p.t===0&&!p.keeper),keeper=match.people.find(p=>p.t===1&&p.keeper);shooter.x=.5;shooter.y=.23;
   for(const p of match.people)if(p!==shooter&&!p.keeper){p.x=.15;p.y=.7}
   match.owner=shooter;match.ball={x:.5,y:.23};shooter.stats.shots=(3-shooter.n%3)%3;
   const original=Math.random,values=[.5,.01,.99];Math.random=()=>values.shift()??.99;v55Shoot(shooter);Math.random=original;
   if(!match.flight)throw Error('shot missing');match.flight.progress=.8;match.ball={x:match.flight.x+(match.flight.target.x-match.flight.x)*.8,y:match.flight.y+(match.flight.target.y-match.flight.y)*.8};
   v98CameraPose=null;draw();const before=JSON.stringify(match),visual=v98Players.get(keeper.pid);
   return {unchanged:before===JSON.stringify(match),height:v98Frame.ball.height,lean:visual.body.rotation.z,keeper:keeper.pid,saves:keeper.stats.saves};
  });assert(save.height>.7);assert(Math.abs(save.lean)>.3,'goalkeeper dives toward shot');
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/world3d-save99.png'});
  const caught=await page.evaluate(()=>{const f=match.flight;match.flight=null;f.done();draw();const k=match.people.find(p=>p.t===1&&p.keeper);return {saves:k.stats.saves,saved:v99PlayerAction(match,k).saved,height:v98Frame.ball.height};});assert.equal(caught.saves,save.saves+1);assert(caught.saved);
  await page.evaluate(()=>{step(.78*.5,.5);draw();});
  const overhead=await page.evaluate(()=>{
   const taker=match.people.find(p=>p.t===0&&!p.keeper);taker.x=v55Field.left;taker.y=.4;match.owner=null;match.ball={x:taker.x,y:taker.y};match.throwIn={team:0,taker,spot:{x:taker.x,y:taker.y},ready:.3};draw();
   return {height:v98Frame.ball.height,arms:v98Players.get(taker.pid).limbs[1].rotation.x};
  });assert(overhead.height>2.5);assert(overhead.arms<-2.5);
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/world3d-throw-ready99.png'});
  const thrown=await page.evaluate(()=>{v55ThrowStep(.78*.3,.3);if(!match.flight)throw Error('Throw did not release');match.flight.progress=.45;draw();return {height:v98Frame.ball.height,kind:v99Flights.get(match.flight).kind};});assert.equal(thrown.kind,'throw');assert(thrown.height>2);
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/world3d-throw-flight99.png'});
  const high=await page.evaluate(()=>{
   const s=match.people.find(p=>p.t===0&&!p.keeper);Object.assign(match,{throwIn:null,flight:null,owner:s,ball:{x:s.x,y:s.y}});s.stats.shots=(4-s.n%3)%3;
   const original=Math.random;Math.random=()=>.99;v55Shoot(s);Math.random=original;match.flight.progress=1;draw();return {height:v98Frame.ball.height,x:v98Frame.ball.x};
  });assert(high.height>2.6);
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/world3d-overbar99.png'});
  await page.evaluate(()=>{
   match.flight=null;match.setPiece=null;match.throwIn=null;match.postBanner=null;const s=match.people.find(p=>p.t===0&&!p.keeper),k=match.people.find(p=>p.t===1&&p.keeper);v50Goal(s,k);
   const c=v65Context(),active=v64Active(c.state,c.ownSide);v65ShowSwapInfo(c,[{side:c.ownSide,outPid:active[0],inPid:active[1],minute:23}]);draw();
  });assert(!(await page.locator('#v65-swap-info').isVisible()));
  await page.evaluate(()=>{step(.78*.51,.51);draw();});assert(await page.locator('.v84-goal-banner').isVisible());assert(!(await page.locator('#v65-swap-info').isVisible()));
  await page.evaluate(()=>{for(let i=0;i<90;i++)step(.78*.05,.05);draw();});assert(await page.locator('#v65-swap-info').isVisible());assert(!(await page.locator('.v84-goal-banner').isVisible()));
  await page.setViewportSize({width:844,height:390});await page.locator('#v99-expand').click();assert(await page.locator('#v99-expand').isVisible());await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/world3d-expanded-mobile99.png'});
  await page.evaluate(()=>{window.doppel6Language.set('en');draw();});assert.equal(await page.locator('#v99-expand').getAttribute('aria-label'),'Shrink pitch');
  await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>window.d6Pitch3D.getState().view==='2d');assert(!(await page.locator('#v99-expand').isVisible()),'portrait remains 2D');assert.deepEqual(errors,[]);
  console.log(JSON.stringify({boards:boards.length,widthBefore,widthAfter,save,caught,overhead,thrown,high,errors}));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
