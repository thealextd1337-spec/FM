'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('outputs/platform/contact-pilot/live');fs.mkdirSync(out,{recursive:true});
const report={sourceId:JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId,checks:[],errors:[],clips:[],contacts:[]};
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
  const seen=new Set();await page.evaluate(()=>{v103CanReplay=()=>false;v65Resume();clearInterval(v65WorldFrame);v98CameraMode='tactical';});
  for(let i=0;i<1000;i++){
   await page.evaluate(()=>{step(.05*MATCH_SPEED,.05);v65AfterStep(v65Context());draw();});await page.waitForTimeout(45);
   const projection=await page.evaluate(()=>D6UnityMatch.projection);
   for(const pose of projection.poses||[]){
    assert(report.fixture.players.includes(pose.id),'Foreign rendered player');
    if(!seen.has(pose.clip)){seen.add(pose.clip);await page.screenshot({path:path.join(out,pose.clip+'.png')});}
    if(pose.contact)report.contacts.push({clock:projection.clock,...pose});
   }
   if(i%200===0)console.log('Native pictures observed: '+i+'; clips: '+[...seen].join(', '));
   if(i>300&&['pass_inside_meshy','receive_ground_meshy','shot_meshy'].every(c=>seen.has(c)))break;
  }
  report.clips=[...seen];check('Real Vereinswelt uses distinct pass, reception and shot clips',['pass_inside_meshy','receive_ground_meshy','shot_meshy'].every(c=>seen.has(c)));
  check('Native contact pictures reach actual foot bones',report.contacts.filter(p=>p.kind!=='hand'&&['pass_inside_meshy','receive_ground_meshy','shot_meshy'].includes(p.clip)&&p.reachable&&p.contactError<.03).length>0);
  await page.evaluate(()=>{v65Pause();clearInterval(v65WorldFrame);draw();});await page.waitForTimeout(300);const frozen=await page.evaluate(()=>({projection:D6UnityMatch.projection,clock:match.elapsed,score:match.score,ball:match.ball}));await page.waitForTimeout(400);const after=await page.evaluate(()=>({projection:D6UnityMatch.projection,clock:match.elapsed,score:match.score,ball:match.ball}));check('Paused motion samples, names, clock and ball freeze',JSON.stringify(frozen.projection.poses)===JSON.stringify(after.projection.poses)&&JSON.stringify(frozen.projection.markers)===JSON.stringify(after.projection.markers)&&frozen.clock===after.clock&&JSON.stringify(frozen.ball)===JSON.stringify(after.ball));
  check('No uncaught runtime errors',report.errors.length===0);report.pass=true;
 }catch(error){report.pass=false;report.failure=error.stack;throw error;}
 finally{await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
})().catch(error=>{console.error(error);process.exitCode=1;});
