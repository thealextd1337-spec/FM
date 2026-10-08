'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const local=process.argv.includes('--local'),out='outputs/release-111';fs.mkdirSync(out,{recursive:true});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
let server,url=process.env.D6_RELEASE_URL||'https://fussball.cakamper.at/?release=111';
const report={release:111,target:local?'local-production-layout':'live',checks:[],errors:[],pass:false};
function check(name,value){assert(value,name);report.checks.push(name);console.log('PASS '+name);}
async function prepare(page,browserRenderer=false){
 const target=url+(url.includes('?')?'&':'?')+(browserRenderer?'engine=browser':'default=unity');
 if(!report.pageVerified){const response=await fetch(target,{headers:{'Cache-Control':'no-cache'}});assert(response.ok);const digest=crypto.createHash('sha256');for await(const block of response.body)digest.update(block);check('Page bytes equal the inspected release build',digest.digest('hex')===sha(fs.readFileSync('outputs/index.html')));report.pageVerified=true;}
 const response=await page.goto(target,{timeout:120000});assert(response.ok());
 await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&window.userMeshyMatchReady,null,{timeout:120000});
 check('Start page and footer use Flutlicht and version 111',await page.evaluate(()=>document.querySelector('#start-screen').classList.contains('fl-shell')&&document.querySelector('footer span').textContent.includes('PROTOTYP 111')));
 return page.evaluate(async()=>{
  let seed=12345;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const career=v61CreateCareer('GER-2','release-111'),club=v66Own(career);v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')await v66NextMarketDay(career);
  const fixture=v62Fixtures(career).find(f=>!f.result&&f.homeId===club.id);career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;career.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);v103CanReplay=()=>false;
  window.D6ReleaseTick=real=>{step(real*MATCH_SPEED,real);const c=v65Context();if(c.state.phase==='live'&&!match.finished)v65AfterStep(c);if(v65PauseRequested&&!match.flight&&!match.slide&&c.state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame);}};
  return {fixtureId:fixture.id,players:match.people.map(p=>p.pid),flowVersion:match.attackFlow?.flowVersion};
 });
}
async function picture(page){await page.waitForFunction(()=>D6UnityMatch?.ready&&D6UnityMatch.lastAck?.sequence>=D6UnityMatch.picture?.sequence-1,null,{timeout:120000});}
async function finish(page){return page.evaluate(()=>{
 if(v65Context().state.phase==='paused')v65Resume();clearInterval(v65WorldFrame);let ticks=0;
 while(!match.finished&&ticks++<18000){if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}D6ReleaseTick(.05);if(ticks%40===0)draw();}
 if(!match.finished)throw Error('Release match did not finish');draw();const c=v65Context();
 return {elapsed:match.elapsed,score:match.score,goals:match.goals,events:c.state.events,stats:c.state.stats,result:c.fixture.result,record:c.fixture.matchRecord,ledger:v66Own(c.career).ledger,history:v66Own(c.career).roster.map(p=>({pid:p.pid,history:p.history,formRatings:p.formRatings,fresh:p.fresh}))};
});}
(async()=>{
 if(local){
  const files=new Map([['/','outputs/index.html'],['/index.html','outputs/index.html']]);
  for(const [dir,prefix]of [['dist/unity-match','/unity-match/'],['outputs/platform/unity-web','/unity/']]){
   function add(folder){for(const item of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,item.name);if(item.isDirectory())add(file);else if(item.name!=='.htaccess')files.set(prefix+path.relative(dir,file).replaceAll('\\','/'),file);}}add(dir);
  }
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.data':'application/octet-stream'};
  server=http.createServer((req,res)=>{const file=files.get(new URL(req.url,'http://localhost').pathname);if(!file){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');fs.createReadStream(file).pipe(res);});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/?release=111';
 }
 report.url=url;const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  let page=await browser.newPage({viewport:{width:1440,height:950}});page.on('pageerror',e=>report.errors.push(e.message));
  const setup=await prepare(page);check('Regular new physical match uses flow v159',setup.flowVersion===159);await picture(page);
  check('Default view is genuine Unity with the actual players',await page.evaluate(ids=>D6UnityMatch.active&&!D6UnityMatch.lastError&&D6UnityMatch.lastAck.ids.length===ids.length&&D6UnityMatch.lastAck.ids.every(id=>ids.includes(id)),setup.players));
  report.runtimeUrl=page.frames().find(f=>f.url().includes('/unity-match/runtime.html')).url();
  const manifest=await page.evaluate(async()=>{const r=await fetch('/unity/probe-build.json',{cache:'no-store'});if(!r.ok)throw Error('Published manifest unavailable');return r.json();});
  check('Actual published Unity identity equals the frozen build',manifest.sourceId===JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json')).sourceId);report.unitySourceId=manifest.sourceId;
  await page.evaluate(()=>{v133ToggleEnlarge();v65Resume();clearInterval(v65WorldFrame);let ticks=0;while((!match.halftimePause||v65Context().state.phase!=='paused')&&!match.finished&&ticks++<10000)D6ReleaseTick(.05);draw();});
  check('Real enlarged match reaches halftime without fullscreen',await page.evaluate(()=>match.halftimePause>0&&v65Context().state.phase==='paused'&&v99Expanded&&!document.fullscreenElement));
  await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);for(let i=0;i<15;i++)D6ReleaseTick(.05);draw();});await picture(page);
  check('Second half retains Unity and the enlarged view',await page.evaluate(()=>v99Expanded&&v98View==='3d'&&D6UnityMatch.active&&!D6UnityMatch.lastError));
  await page.waitForFunction(()=>D6UnityMatch.projection?.markers.length===match.people.length,null,{timeout:15000});
  check('Name projections correspond to actual player identities',await page.evaluate(()=>D6UnityMatch.projection.markers.every(m=>match.people.some(p=>p.pid===m.id))));
  await page.screenshot({path:out+'/'+report.target+'-second-half.png'});const unity=await finish(page);
  check('Native match report uses the current dialog design',await page.evaluate(()=>v47Dialog.classList.contains('fl-dialog')&&v47Dialog.open));
  await page.close();page=await browser.newPage({viewport:{width:1440,height:950}});page.on('pageerror',e=>report.errors.push(e.message));
  await prepare(page,true);const native=await finish(page);assert.deepEqual(unity,native);check('Complete Unity/browser match results, events, player records and finances match',true);
  report.score=unity.score;report.finished=new Date().toISOString();report.buildSha256=sha(fs.readFileSync('outputs/index.html'));check('No browser script errors',report.errors.length===0);report.pass=true;
 }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
 fs.writeFileSync(out+'/'+report.target+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:true,target:report.target,checks:report.checks.length,score:report.score}));
})().catch(error=>{report.failure=error.stack;fs.writeFileSync(out+'/'+report.target+'.json',JSON.stringify(report,null,2)+'\n');console.error(error);server?.close();process.exitCode=1;});
