'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const local=process.argv.includes('--local'),out='outputs/release-112';fs.mkdirSync(out,{recursive:true});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const buildFile=process.env.D6_RELEASE_BUILD||'outputs/index.html',manifestFile=process.env.D6_RELEASE_MANIFEST||'outputs/platform/unity-web/probe-build.json';
let server,url=process.env.D6_RELEASE_URL||'https://fussball.cakamper.at/?release=112';
const report={release:112,target:local?'local-production-layout':'live',checks:[],errors:[],pass:false};
function check(name,value){assert(value,name);report.checks.push(name);console.log('PASS '+name);}
async function prepare(page,browserRenderer=false){
 const target=url+(url.includes('?')?'&':'?')+(browserRenderer?'engine=browser':'default=unity');
 if(!report.pageVerified){const response=await fetch(target,{headers:{'Cache-Control':'no-cache'}});assert(response.ok);const digest=crypto.createHash('sha256');for await(const block of response.body)digest.update(block);check('Page bytes equal the inspected release build',digest.digest('hex')===sha(fs.readFileSync(buildFile)));report.pageVerified=true;}
 const response=await page.goto(target,{timeout:120000});assert(response.ok());
 await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&window.userMeshyMatchReady,null,{timeout:120000});
 check('Start page and footer use Flutlicht and version 112',await page.evaluate(()=>document.querySelector('#start-screen').classList.contains('fl-shell')&&document.querySelector('footer span').textContent.includes('PROTOTYP 112')));
 return page.evaluate(async()=>{
  let seed=12345;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const career=v61CreateCareer('GER-2','release-112'),club=v66Own(career);v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')await v66NextMarketDay(career);
  const fixture=v62Fixtures(career).find(f=>!f.result&&f.homeId===club.id);career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;career.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);window.D6CanReplay=v103CanReplay;v103CanReplay=()=>false;
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
  await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/?release=112';
 }
 report.url=url;const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  let page=await browser.newPage({viewport:{width:1440,height:950}});page.on('pageerror',e=>report.errors.push(e.message));
  const setup=await prepare(page);check('Regular new physical match uses flow v159',setup.flowVersion===159);await picture(page);
  check('Default view is genuine Unity with the actual players',await page.evaluate(ids=>D6UnityMatch.active&&!D6UnityMatch.lastError&&D6UnityMatch.lastAck.ids.length===ids.length&&D6UnityMatch.lastAck.ids.every(id=>ids.includes(id)),setup.players));
  report.runtimeUrl=page.frames().find(f=>f.url().includes('/unity-match/runtime.html')).url();
  const manifest=await page.evaluate(async()=>{const r=await fetch('/unity/probe-build.json',{cache:'no-store'});if(!r.ok)throw Error('Published manifest unavailable');return r.json();});
  await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);let i=0;while((match.elapsed<=0||i<40)&&i<2000){D6ReleaseTick(.05);if(i%4===3)draw();i++;}if(v65Context().state.phase!=='live'){v65Resume();clearInterval(v65WorldFrame);}});
  const paused=await page.evaluate(()=>{v131PauseMatch();draw();return {elapsed:match.elapsed,ball:{...match.ball},phase:v65Context().state.phase};});
  await page.waitForTimeout(400);await page.evaluate(()=>draw());await picture(page);
  check('Live pause holds clock and ball while Unity keeps rendering',paused.phase==='paused'&&await page.evaluate(p=>match.elapsed===p.elapsed&&JSON.stringify({...match.ball})===JSON.stringify(p.ball)&&D6UnityMatch.active&&!D6UnityMatch.lastError,paused));
  await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);for(let i=0;i<20;i++){D6ReleaseTick(.05);if(i%4===3)draw();}});await picture(page);
  check('Resume continues the same match in Unity',await page.evaluate(p=>v65Context().state.phase==='live'&&match.elapsed>p.elapsed&&D6UnityMatch.active,paused));
  // Record a short genuine rendered segment for the existing review timeline.
  // Accelerated parity runs disable automatic replays; this short section uses the real recorder.
  await page.evaluate(()=>{v103CanReplay=D6CanReplay;});
  for(let k=0;k<18;k++){await page.evaluate(()=>{for(let n=0;n<4;n++)D6ReleaseTick(.05);draw();});await page.waitForTimeout(55);}
  const before=await page.evaluate(()=>{const saved={elapsed:match.elapsed,score:[...match.score],events:JSON.stringify(v65Context().state.events)};const t=v103ReplayState(match).timeline;v131Seek(t[Math.max(0,t.length-12)].clock);return saved;});
  await page.waitForTimeout(250);await page.evaluate(()=>draw());await picture(page);
  check('Review streams recorded pictures to Unity without changing the match',await page.evaluate(b=>Boolean(v103ReplayState(match).review)&&D6UnityMatch.picture.replay&&match.elapsed===b.elapsed&&JSON.stringify(v65Context().state.events)===b.events,before));
  await page.screenshot({path:out+'/'+report.target+'-review.png'});
  await page.evaluate(()=>{v131ReturnLive(false);v103CanReplay=()=>false;v98View='2d';draw();});
  check('Deliberate 2D view hides Unity and stays playable',await page.locator('#d6-unity-host').isHidden()&&await page.evaluate(()=>match.people.length>0));
  await page.evaluate(()=>{v98View='3d';draw();});await picture(page);check('Return to Unity keeps the same session',await page.evaluate(()=>D6UnityMatch.active&&!D6UnityMatch.lastError));
  check('Actual published Unity identity equals the frozen build',manifest.sourceId===JSON.parse(fs.readFileSync(manifestFile)).sourceId);report.unitySourceId=manifest.sourceId;
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
  await page.close();
  const touch=await browser.newContext({viewport:{width:915,height:412},hasTouch:true,isMobile:true});
  await touch.addInitScript(()=>{if(location.pathname.includes('/unity-match/'))addEventListener('message',e=>{const q=e.data?.config?.quality??e.data?.payload?.config?.quality;if(q)window.__d6Quality=q;});});
  page=await touch.newPage();page.on('pageerror',e=>report.errors.push(e.message));await prepare(page);await picture(page);
  const quality=await page.frames().find(f=>f.url().includes('/unity-match/runtime.html')).evaluate(()=>window.__d6Quality||null);report.touchQuality=quality;
  check('Touch landscape loads Unity with the reduced quality tier',quality==='reduced'&&await page.evaluate(()=>D6UnityMatch.active&&!D6UnityMatch.lastError));
  await page.screenshot({path:out+'/'+report.target+'-touch.png'});await touch.close();
  page=await browser.newPage({viewport:{width:1440,height:950}});page.on('pageerror',e=>report.errors.push(e.message));await page.route('**/unity/probe-build.json',route=>route.fulfill({status:404,body:'Not available'}));
  await prepare(page);await page.waitForFunction(()=>v98View==='2d'&&D6UnityMatch.lastError,null,{timeout:120000});
  check('Missing Unity runtime falls back to a playable 2D match',await page.evaluate(()=>match.people.length>0&&!D6UnityMatch.active));
  report.score=unity.score;report.finished=new Date().toISOString();report.buildSha256=sha(fs.readFileSync(buildFile));check('No browser script errors',report.errors.length===0);report.pass=true;
 }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
 fs.writeFileSync(out+'/'+report.target+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:true,target:report.target,checks:report.checks.length,score:report.score}));
})().catch(error=>{report.failure=error.stack;fs.writeFileSync(out+'/'+report.target+'.json',JSON.stringify(report,null,2)+'\n');console.error(error);server?.close();process.exitCode=1;});
