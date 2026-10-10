'use strict';
// Actual Unity projection in an isolated browser profile, using the documented
// world integration workflow. No existing browser career or device is touched.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const out=path.resolve('outputs/release-121/live-browser');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync('work/platform/qa/check-world-unity.cjs','utf8');
const context=vm.createContext({url:'https://fussball.cakamper.at/',roleCandidate:false});
vm.runInContext(source.slice(source.indexOf('async function prepare('),source.indexOf('async function fullMatch(')),context);
const report={url:context.url,scope:'Actual live HTTPS page, isolated Edge profile; mobile viewports are not physical Android hardware',checkedAt:new Date().toISOString(),checks:[],cases:[],errors:[],sourceId:JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId};
(async()=>{

 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:844,height:390}});page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',async response=>{if(new URL(response.url()).pathname==='/unity/probe-build.json'){try{report.observedManifest=await response.json();}catch{}}});
  const check=(name,value)=>{assert(value,name);report.checks.push(name);console.log(name);};
  const fixture=await context.prepare(page);await context.waitPicture(page);
  report.version=await page.evaluate(()=>({footer:document.querySelector('footer').textContent,help:D6ThreeDocumentation.version,url:location.href}));
  assert.match(report.version.footer,/PROTOTYP 121/);assert.equal(report.version.help,121);check('Actual live page footer and help use Release121',report.version.url.startsWith(context.url));
  check('Live Unity acknowledged the actual fixture and player identities',await page.evaluate(fixture=>D6UnityMatch.active&&D6UnityMatch.session.startsWith(fixture.fixtureId+':')&&JSON.stringify([...D6UnityMatch.lastAck.ids].sort())===JSON.stringify([...fixture.ids].sort()),fixture));
  check('Iframe loaded the frozen current Unity manifest',report.observedManifest?.sourceId===report.sourceId);
  report.matchConfig=await page.evaluate(()=>({config:v65Context().career.world.matchConfig,geometry:match.geometry}));
  check('Camera fixture uses the native larger field',report.matchConfig.config.fieldSize==='large');
  const frozen=await page.evaluate(()=>JSON.stringify({elapsed:match.elapsed,score:match.score,ball:match.ball,randomCalls:D6TestRandomCalls}));await page.waitForTimeout(400);
  check('Paused live Unity leaves native clock, ball, score and randomness unchanged',frozen===await page.evaluate(()=>JSON.stringify({elapsed:match.elapsed,score:match.score,ball:match.ball,randomCalls:D6TestRandomCalls})));
  report.liveClock=await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);let ticks=0;while(match.elapsed===0&&ticks++<200)D6QAWorldTick(.05);for(let n=0;n<20;n++)D6QAWorldTick(.05);draw();return {ticks,elapsed:match.elapsed};});
  await page.waitForFunction(()=>D6UnityMatch.lastAck?.clock>0,{},{timeout:30000});check('Resumed live Unity consumes native movement and clock',report.liveClock.elapsed>0);
  for(let i=0;i<18;i++){await page.evaluate(()=>{for(let n=0;n<4;n++)D6QAWorldTick(.05);draw();});await page.waitForTimeout(55);}
  const before=await page.evaluate(()=>{const saved=JSON.stringify({elapsed:match.elapsed,score:match.score,events:v65Context().state.events});v131Seek(v103ReplayState(match).timeline.at(-1).clock);draw();return saved;});
  await page.waitForFunction(()=>Boolean(v103ReplayState(match).review)&&D6UnityMatch.picture?.replay,{},{timeout:15000});check('Live Unity review uses the existing recorded timeline',true);
  await page.evaluate(()=>{const state=v103ReplayState(match);state.review.time=state.timeline[0].clock;draw();});await page.waitForTimeout(180);
  check('Seeking leaves native live results and events unchanged',before===await page.evaluate(()=>JSON.stringify({elapsed:match.elapsed,score:match.score,events:v65Context().state.events})));
  await page.screenshot({path:path.join(out,'live-review.png')});
  await context.prepare(page);await context.waitPicture(page);
  await page.evaluate(async()=>{await v132ToggleFullscreen();clearInterval(v65WorldFrame);hideOverlay();});
  await context.waitPicture(page);
  let caseId=0;
  for(const [width,height] of [[844,390],[931,448],[1280,720]]){
   await page.setViewportSize({width,height});
   for(const mode of ['follow','sideline'])for(const [name,x,z,elevation] of [['centre',0,0,.29],['near',0,20.5,.29],['corner',31,20.5,.29],['far',0,-20.5,.29],['high',0,20.5,6]]){
    const input={mode,x,z,elevation,caseId:++caseId};
    const target=await page.evaluate(input=>{
     match.owner=null;match.flight=null;match.kickoff=null;match.postBanner=null;match.rebound=null;match.setPiece=null;match.throwIn=null;match.goalPause=0;match.goalScene=null;v99Actions.delete(match);match.ball={x:.5+input.z*(v55Field.right-v55Field.left)/44,y:.5-input.x*(v55Field.bottom-v55Field.top)/68};hideOverlay();
     // Use the existing aerial projection for the elevated fixture only.
     if(input.elevation>.29)match.flight={aerial:true,progress:.5};
     v98CameraMode=input.mode;v98CameraNear=60+input.caseId*.000001;draw();
     return {sequence:D6UnityMatch.picture?.sequence,clock:match.elapsed};
    },input);
    await page.waitForFunction(sequence=>D6UnityMatch.projection?.sequence>sequence,Number.isFinite(target.sequence)?target.sequence:0,{timeout:20000});
    const actual=await page.evaluate(()=>({ball:D6UnityMatch.projection.ballMarker,width:D6UnityMatch.projection.width,height:D6UnityMatch.projection.height,camera:D6UnityMatch.picture.camera,pictureBall:D6UnityMatch.picture.ball,frameBall:v98PitchFrame(match).ball,clock:match.elapsed,error:D6UnityMatch.lastError}));
    report.cases.push({viewportWidth:width,viewportHeight:height,mode,name,input,...actual});
    console.log(`${width} ${mode} ${name}`,JSON.stringify(actual));
    assert(actual.ball.visible&&actual.ball.x>0&&actual.ball.x<1&&actual.ball.y<.86&&actual.ball.y>0,`${width}x${height} ${mode} ${name}: ${JSON.stringify(actual.ball)}`);
    assert.equal(actual.clock,target.clock,'camera test must leave native clock paused');assert.equal(actual.error,null);
    assert(Math.abs(actual.width-width)<=2&&Math.abs(actual.height-height)<=2,'fullscreen render must match requested viewport');
    if(name==='near'||name==='corner')await page.locator('#d6-unity-host').screenshot({path:path.join(out,`${width}-${mode}-${name}.png`)});
   }
  }
  assert.deepEqual(report.errors,[]);report.minimumBottomMargin=Math.min(...report.cases.map(c=>1-c.ball.y));report.passed=true;report.completedAt=new Date().toISOString();console.log(`PASS ${report.cases.length} actual WebGL camera cases`);
 }finally{fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
