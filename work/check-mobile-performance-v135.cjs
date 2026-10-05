// Isolated browser measurement; no user profile, saves or live-site writes.
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const label=process.argv[2]||'after',url=process.env.D6_TEST_URL||pathToFileURL(path.resolve('outputs/index.html')).href;
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:3,isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>window.D6UserModelStatus==='ready',null,{timeout:60000});
  await page.evaluate(()=>{
   let seed=12345;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
   const career=v61CreateCareer('GER-2','mobile-performance-135'),club=career.world.clubs.find(c=>c.id==='GER-2');v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')v66NextMarketDay(career);
   const fixture=v62Fixtures(career).find(f=>!f.result&&(f.homeId==='GER-2'||f.awayId==='GER-2'));career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;career.world.activeMatch.state.phase='live';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);clearInterval(v64UiTimer);running=false;v102StopPaint();hideOverlay();draw();
  });
  const initial=await page.evaluate(()=>({players:v98Players.size,ratio:v98Scene.renderer.getPixelRatio(),width:v98Scene.renderer.domElement.width,height:v98Scene.renderer.domElement.height,shadows:v98Scene.renderer.shadowMap.enabled,antialias:v98Scene.renderer.getContext().getContextAttributes().antialias,calls:v98Scene.renderer.info.render.calls,triangles:v98Scene.renderer.info.render.triangles,model:D6UserModelStatus}));
  assert.equal(initial.players,12);assert.equal(initial.model,'ready');
  if(label==='after'){assert.equal(initial.ratio,1);assert.equal(initial.shadows,false);assert.equal(initial.antialias,false);}
  // Real loop measurement includes the simulation timer and animation callbacks.
  await page.evaluate(()=>{
   window.perf135={renders:0,times:[],tickRenders:0,rafRenders:0};const base=v98Scene.renderer.render.bind(v98Scene.renderer);
   v98Scene.renderer.render=(...args)=>{perf135.renders++;v102Painting?perf135.rafRenders++:perf135.tickRenders++;return base(...args)};
   const paint=v98RenderScene;v98RenderScene=function(...args){const start=performance.now(),count=perf135.renders;try{return paint(...args)}finally{if(perf135.renders>count)perf135.times.push(performance.now()-start)}};
   perf135.start=performance.now();running=true;v65Context().state.phase='live';v65StartLoop();
  });
  await page.waitForTimeout(5000);
  const measurement=await page.evaluate(()=>{clearInterval(v65WorldFrame);running=false;v102StopPaint();const p=perf135,sorted=p.times.slice().sort((a,b)=>a-b);return {seconds:(performance.now()-p.start)/1000,renders:p.renders,tickRenders:p.tickRenders,rafRenders:p.rafRenders,paintMsMedian:sorted[Math.floor(sorted.length*.5)],paintMsP95:sorted[Math.floor(sorted.length*.95)],elapsed:match.elapsed,timeline:v103ReplayState(match).timeline.length}});
  await page.locator('#v98-canvas').screenshot({path:`outputs/mobile-performance-v135-${label}.png`});
  let checks=null;
  if(label==='after'){
   checks=await page.evaluate(()=>{
    const state=v65Context().state;state.phase='live';running=true;draw();const count=v102PaintCount,clock=v98Frame.clock;step(.04*MATCH_SPEED,.04);draw();const deferred=v102PaintCount===count,fresh=v98Frame.clock>clock;state.phase='paused';running=false;draw();const immediate=v102PaintCount===count+1,stopped=!v102Loop;
    return {deferred,fresh,immediate,stopped};
   });assert(Object.values(checks).every(Boolean),JSON.stringify(checks));
   await page.evaluate(()=>v132RevealControls());await page.locator('#v99-expand').click();await page.waitForFunction(()=>document.body.classList.contains('v132-fullscreen'));await page.evaluate(()=>draw());
   const fullscreen=await page.evaluate(()=>({ratio:v98Scene.renderer.getPixelRatio(),width:v98Scene.renderer.domElement.width,cssWidth:Math.round(document.querySelector('#v98-canvas').getBoundingClientRect().width)}));assert.equal(fullscreen.ratio,1);assert.equal(fullscreen.width,fullscreen.cssWidth);checks.fullscreen=fullscreen;
   await page.evaluate(()=>v132LeaveFullscreen());
   const snapshot=await page.evaluate(()=>JSON.stringify(match));
   for(const language of ['de','en']){await page.evaluate(lang=>{doppel6Language.set(lang);v98View='2d';draw()},language);assert.equal(await page.evaluate(()=>d6Pitch3D.getState().view),'2d');await page.evaluate(()=>{v98View='3d';draw()});assert.equal(await page.evaluate(()=>d6Pitch3D.getState().view),'3d');}
   await page.setViewportSize({width:412,height:915});await page.waitForFunction(()=>!v98Orientation.matches&&!document.body.classList.contains('v98-pitch3d'));await page.setViewportSize({width:915,height:412});await page.waitForFunction(()=>document.body.classList.contains('v98-pitch3d'));
   assert.equal(await page.evaluate(()=>JSON.stringify(match)),snapshot,'view/language/orientation changes preserve the match');checks.viewSwitchAndOrientation=true;
   const desktop=await browser.newPage({viewport:{width:1280,height:850},deviceScaleFactor:2});await desktop.goto(url);await desktop.waitForFunction(()=>window.D6PitchScene);const quality=await desktop.evaluate(()=>{const scene=D6PitchScene.create(document.createElement('canvas'),{advertising:null}),result={ratio:scene.renderer.getPixelRatio(),shadows:scene.renderer.shadowMap.enabled,antialias:scene.renderer.getContext().getContextAttributes().antialias};scene.dispose();return result});assert.deepEqual(quality,{ratio:1.75,shadows:true,antialias:true});checks.desktop=quality;await desktop.close();
  }
  assert.deepEqual(errors,[]);const report={label,url,emulated:true,gpu:'SwiftShader; not a Pixel hardware benchmark',initial,measurement,checks,errors};fs.writeFileSync(`outputs/mobile-performance-v135-${label}.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
