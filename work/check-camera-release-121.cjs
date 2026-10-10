'use strict';
// Actual Unity projection in an isolated browser profile, using the documented
// world integration workflow. No existing browser career or device is touched.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('./ui-redesign/serve.cjs');
const out=path.resolve('outputs/release-121/camera');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync('work/platform/qa/check-world-unity.cjs','utf8'),server=createServer(),port=4372;
const context=vm.createContext({url:`http://127.0.0.1:${port}/source/index.html`,roleCandidate:false});
vm.runInContext(source.slice(source.indexOf('async function prepare('),source.indexOf('async function fullMatch(')),context);
const report={cases:[],errors:[],sourceId:JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId};
(async()=>{
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:844,height:390}});page.on('pageerror',e=>report.errors.push(e.message));
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
  assert.deepEqual(report.errors,[]);report.passed=true;console.log(`PASS ${report.cases.length} actual WebGL camera cases`);
 }finally{fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
