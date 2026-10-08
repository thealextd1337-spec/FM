'use strict';
// Own HTTP server and fresh browser context; never visits a user's file tab.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('outputs/platform/action-iteration/live');fs.mkdirSync(out,{recursive:true});
const report={sourceId:JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId,checks:[],errors:[],clips:[],movingActions:{receive:0,pass:0,shot:0},carrier:{right:0,left:0,reachable:0,pictures:0},samples:[],carrierSamples:[]};
function check(name,value){assert(value,name);report.checks.push(name);console.log(name);}
(async()=>{
 const server=require('../../ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}});page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(/NullReferenceException|MissingReferenceException|RuntimeError/.test(m.text()))report.errors.push(m.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=unity`);await page.waitForFunction(()=>window.userMeshyMatchReady&&window.D6UnityMatch,null,{timeout:45000});
  report.fixture=await page.evaluate(async()=>{
   let seed=12345;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   const c=v61CreateCareer('GER-2','football-motion-pilot'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
   const f=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);return {id:f.id,players:match.people.map(p=>p.pid)};
  });await page.waitForFunction(()=>D6UnityMatch.ready&&D6UnityMatch.projection?.poses?.length,null,{timeout:150000});
  await page.evaluate(()=>{v103CanReplay=()=>false;v65Resume();clearInterval(v65WorldFrame);v98CameraMode='tactical';});
  const seen=new Set(),pictured=new Set();
  for(let i=0;i<1800;i++){
   await page.evaluate(()=>{step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context());draw();});await page.waitForTimeout(45);
   const data=await page.evaluate(()=>({projection:D6UnityMatch.projection,picture:D6UnityMatch.picture,finished:match.phase==='finished'||match.finished}));
   const projection=data.projection;
   for(const pose of projection.poses||[]){
    assert(report.fixture.players.includes(pose.id),'Foreign rendered player');seen.add(pose.clip);
    assert(Number.isFinite(pose.speed),'New Unity action build is required: observed speed is missing');
    const family=pose.clip==='receive_ground_meshy'?'receive':pose.clip==='pass_inside_meshy'?'pass':pose.clip==='shot_meshy'?'shot':null;
    if(family&&pose.speed>.4&&pose.baseClip&&pose.actionWeight>.01&&pose.actionWeight<.9){
     report.movingActions[family]++;if(report.samples.length<100)report.samples.push({clock:projection.clock,...pose});
     if(!pictured.has(family)){pictured.add(family);await page.screenshot({path:path.join(out,`moving-${family}.png`)});}
    }
    // This dedicated controlled clip is selected only for the rendered owner.
    // The native inbox is newer than the interpolated projection, so comparing
    // its owner would discard the very quick release/reception pictures.
    if(pose.clip==='running'&&pose.speed>.2){
     report.carrier.pictures++;if(report.carrierSamples.length<20)report.carrierSamples.push({clock:projection.clock,...pose});
     if(pose.contact){report.carrier[pose.kind==='left-foot'?'left':'right']++;if(pose.reachable&&pose.contactError<.03)report.carrier.reachable++;}
     if(!pictured.has('carrier')){pictured.add('carrier');await page.screenshot({path:path.join(out,'controlled-carrier.png')});}
    }
   }
   if(i%300===0)console.log('Observed native pictures: '+i+'; moving blends: '+JSON.stringify(report.movingActions)+'; carrier: '+JSON.stringify(report.carrier));
   if(i>300&&Object.values(report.movingActions).every(n=>n>0)&&report.carrier.left+report.carrier.right>0)break;
   if(data.finished)break;
  }
  report.clips=[...seen];check('Real moving receptions use running-contact blend',report.movingActions.receive>0);
  check('Real passing and shooting retain stride during follow-through',report.movingActions.pass>0&&report.movingActions.shot>0);
  check('Actual carrier uses controlled stride with bounded real-foot reach attempts',report.carrier.pictures>0&&report.carrier.left+report.carrier.right>0);
  await page.evaluate(()=>{v65Pause();clearInterval(v65WorldFrame);draw();});await page.waitForTimeout(300);
  const frozen=await page.evaluate(()=>({projection:D6UnityMatch.projection,clock:match.elapsed,score:match.score,ball:match.ball}));await page.waitForTimeout(400);
  const after=await page.evaluate(()=>({projection:D6UnityMatch.projection,clock:match.elapsed,score:match.score,ball:match.ball}));
  check('Native pause freezes blended actions, label anchors, clock and ball',JSON.stringify(frozen.projection.poses)===JSON.stringify(after.projection.poses)&&JSON.stringify(frozen.projection.markers)===JSON.stringify(after.projection.markers)&&frozen.clock===after.clock&&JSON.stringify(frozen.ball)===JSON.stringify(after.ball));
  check('No uncaught Unity or page runtime errors',report.errors.length===0);report.pass=true;
 }catch(error){report.pass=false;report.failure=error.stack;throw error;}
 finally{await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
})().catch(error=>{console.error(error);process.exitCode=1;});
