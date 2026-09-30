// Isolated profile: fixtures never touch the user's saved career or browser.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
const setup=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('async function complete('))+';setup',{url:process.env.D6_TEST_URL||'http://127.0.0.1:4196/'});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page,'3d',undefined,null,false);
  // Software WebGL: lower raster cost to measure scheduling independently.
  await page.evaluate(()=>{v98Scene.renderer.setPixelRatio(.5);v98Scene.renderer.shadowMap.enabled=false;draw()});await page.waitForTimeout(800);
  const cadence=await page.evaluate(async()=>{
   hideOverlay();Object.assign(match,{kickoff:null,countdown:0,postBanner:null,throwIn:null,setPiece:null,flight:null,slide:null,goalPause:0,goalScene:null,rebound:null});
   const p=match.people.find(p=>p.t===0&&!p.keeper);let ticks=0,between=0,last=null;const before=v102PaintCount,clock=v102Clock(match);
   const timer=setInterval(()=>{p.x+=.0009;step(.04*MATCH_SPEED,.04);ticks++;draw()},40);
   const end=performance.now()+1100;
   while(performance.now()<end){await new Promise(requestAnimationFrame);const visual=v98Players.get(p.pid),x=visual.root.position.z;if(last!==null&&x!==last&&Math.abs(x-v98Frame.players.find(a=>a.id===p.pid).z)>.001)between++;last=x;}
   clearInterval(timer);return {ticks,paints:v102PaintCount-before,clock:v102Clock(match)-clock,between,drawCalls:v98Scene.renderer.info.render.calls,geometries:v98Scene.renderer.info.memory.geometries};
  });assert(cadence.ticks>10);assert(cadence.paints>cadence.ticks,'graphics interpolate above the simulation cadence');assert(cadence.between>3,'players occupy intermediate presentation positions');assert(Math.abs(cadence.clock-cadence.ticks*.04)<1e-8,'graphics do not step the engine');
  const pause=await page.evaluate(async()=>{
   running=false;draw();const snapshot=()=>JSON.stringify([...v98Players.values()].map(v=>[v.root.position,v.body.position,...v.limbs.map(l=>l.rotation),...v.knees.map(l=>l.rotation)]));
   const before=snapshot(),clock=v102Clock(match),paints=v102PaintCount;await new Promise(r=>setTimeout(r,150));v98Render();return {frozen:before===snapshot(),clock:v102Clock(match)===clock,loop:v102Loop,extra:v102PaintCount-paints};
  });assert(pause.frozen&&pause.clock&&pause.loop===0&&pause.extra===1);
  await page.evaluate(()=>{v98Scene.renderer.setPixelRatio(1);v98Scene.renderer.shadowMap.enabled=true;draw()});
  const actions=[];
  for(const team of [0,1])for(const turned of [false,true])for(const kind of ['pass','highPass','cross','shot','freeKick','volley','header']){
   const result=await page.evaluate(({team,turned,kind})=>{
    running=true;Object.assign(match,{kickoff:null,postBanner:null,flight:null,setPiece:null,throwIn:null,goalPause:0,goalScene:null,rebound:null,halftimePause:0,halftimeBreakDone:turned});
    const p=match.people.find(p=>p.t===team&&!p.keeper),r=match.people.find(p=>p.t===team&&!p.keeper&&p!==match.people.find(p=>p.t===team&&!p.keeper));p.x=.5;p.y=team===0?.3:.7;r.x=.55;r.y=team===0?.18:.82;match.owner=p;match.ball={x:p.x,y:p.y};
    if(kind==='pass'||kind==='header')v55GroundPass(p,r,kind==='header'?'header':'pass');else if(kind==='highPass'||kind==='cross')v55HighPass(p,r,{cross:kind==='cross'});else v55Shoot(p,kind==='freeKick'?'direct-free-kick':kind);
    draw();v102Frames.at-=1000;v98Render();const visual=v98Players.get(p.pid),action=v102PlayerAction(match,p),ball=v99BallView(match),before=JSON.stringify(match);
    const contactKind=action.kind,contactHeight=ball.elevation,leg=visual.limbs[2].rotation.x;
    step(.06*MATCH_SPEED,.06);draw();v102Frames.at-=1000;v98Render();
    const posed={leg:visual.limbs[2].rotation.x,knee:visual.knees[1].rotation.x,elbow:visual.elbows[1].rotation.x,neck:visual.neck.rotation.x};
    const after=JSON.stringify(match);v98Render();if(JSON.stringify(match)!==after)throw Error('Extra rendering mutated match');
    return {kind,team,turned,contactKind,contactHeight,leg,posed,drawCalls:v98Scene.renderer.info.render.calls};
   },{team,turned,kind});assert.equal(result.contactKind,kind);assert(result.contactHeight>=.29);assert(Object.values(result.posed).every(Number.isFinite));if(kind==='header'){assert(result.contactHeight===2.65);assert(result.posed.neck>.02)}else assert(result.leg<-.3);actions.push(result);
  }
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/motion102-header.png'});
  const air=[];
  for(const team of [0,1])for(const turned of [false,true])for(const resultKind of ['header','headerPass','volley','clear','control']){
   const result=await page.evaluate(({team,turned,resultKind})=>{
    running=true;Object.assign(match,{kickoff:null,postBanner:null,flight:null,setPiece:null,throwIn:null,goalPause:0,goalScene:null,rebound:null,halftimePause:0,halftimeBreakDone:turned});
    v102State(match).poses.clear();v102State(match).loose=null;
    const passer=match.people.find(p=>p.t===team&&!p.keeper),receiver=match.people.find(p=>p.t===team&&!p.keeper&&p!==passer),defender=match.people.find(p=>p.t!==team&&!p.keeper);
    for(const p of match.people)if(!p.keeper){p.x=.08;p.y=.5}
    passer.x=.5;passer.y=.55;receiver.x=.5;receiver.y=resultKind==='headerPass'?.5:team===0?.18:.82;
    match.owner=passer;match.ball={x:passer.x,y:passer.y};const random=Math.random,readAbility=ability;
    Math.random=()=>.5;try{v55HighPass(passer,receiver,{exempt:true})}finally{Math.random=random}
    const incoming=match.flight,end={...incoming.target};receiver.x=end.x;receiver.y=end.y;
    if(resultKind==='clear'){receiver.x=.1;receiver.y=.5;defender.x=end.x;defender.y=end.y}
    else if(resultKind!=='volley'&&resultKind!=='control'){defender.x=end.x;defender.y=end.y+.001}
    const winner=resultKind==='clear'?defender:receiver;
    incoming.progress=1;match.ball={...end};match.flight=null;
    ability=function(p,key){return p===receiver&&key==='air'?resultKind==='volley'?1:20:p===receiver&&key==='tec'?resultKind==='volley'?20:1:readAbility(p,key)};
    const controlRandom=[.99,.99,.01];Math.random=()=>resultKind==='control'?controlRandom.shift()??.01:.01;
    try{incoming.done()}finally{Math.random=random;ability=readAbility}
    draw();v102Frames.at-=1000;v98Render();
    const action=v102PlayerAction(match,winner),ball=v99BallView(match),visual=v98Players.get(winner.pid);visual.root.updateMatrixWorld(true);
    if(!ball)throw Error(JSON.stringify({team,turned,resultKind,action,owner:match.owner?.pid,setPiece:match.setPiece,flight:match.flight&&{progress:match.flight.progress,target:match.flight.target},loose:v102State(match).loose,poses:[...v102State(match).poses],end}));
    const head=visual.neck.localToWorld(new THREE.Vector3(0,.26,.02)),point=v98PitchPoint(ball,turned),headGap=Math.hypot(head.x-point.x,head.z-point.z,head.y-ball.elevation);
    return {resultKind,team,turned,kind:action?.kind,height:ball?.elevation,headGap,startX:ball.x,endX:end.x,startY:ball.y,endY:end.y};
   },{team,turned,resultKind});
   assert.equal(result.kind,resultKind==='headerPass'||resultKind==='clear'?'header':resultKind);
   assert(Math.abs(result.startX-result.endX)<1e-8&&Math.abs(result.startY-result.endY)<1e-8,'confirmed air action starts at incoming contact');
   if(result.kind==='header')assert(result.headGap>.35&&result.headGap<.75,'ball meets forehead without being buried inside the head');air.push(result);
  }
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/motion102-air-contact.png'});
  const clear=await page.evaluate(()=>{
   match.flight=null;match.owner=null;const p=match.people.find(p=>p.t===1&&!p.keeper);v102AirClear(p,{x:p.x,y:p.y},{x:.65,y:.55});draw();v102Frames.at-=1000;v98Render();const start=v99BallView(match);step(.04*MATCH_SPEED,.15);draw();return {height:start.elevation,kind:v102PlayerAction(match,p).kind,heightLater:v99BallView(match)?.elevation};
  });assert(clear.kind==='header'&&clear.height===2.65);
  const lifecycle=await page.evaluate(()=>{v98View='2d';draw();const stopped=v102Loop===0;v98View='3d';draw();const restarted=v102Loop!==0;draw();draw();const pending=v102Loop;return {stopped,restarted,pending}});assert(lifecycle.stopped&&lifecycle.restarted&&lifecycle.pending>0);
  await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>d6Pitch3D.getState().view==='2d');assert.equal(await page.evaluate(()=>v102Loop),0);
  await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>d6Pitch3D.getState().view==='3d');
  const hidden=await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const stopped=v102Loop===0;delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));return {stopped,restarted:v102Loop!==0}});assert(hidden.stopped&&hidden.restarted);
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/motion102-landscape-mobile.png'});
  await page.evaluate(()=>$('#v98-canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));assert.equal(await page.evaluate(()=>v102Loop),0);assert.equal(await page.evaluate(()=>d6Pitch3D.getState().view),'2d');
  assert.deepEqual(errors,[]);fs.writeFileSync('outputs/motion102-browser-results.json',JSON.stringify({cadence,pause,actions,air,clear,lifecycle,hidden,errors},null,2));console.log(JSON.stringify({cadence,pause,actionCases:actions.length,airCases:air.length,clear,lifecycle,hidden,errors}));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
