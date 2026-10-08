const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const rows=[],errors=[];
 for(const viewport of [{width:1270,height:871},{width:390,height:844}]){
  const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('outputs/Doppel-6-Fussballmanager.html')).href);await page.waitForFunction(()=>window.d6Pitch3D&&v61StorageReady);
  const id=await page.evaluate(async baseline=>{
   const career=v61CreateCareer('GER-2','penalty-controls-v126'),club=career.world.clubs.find(c=>c.id==='GER-2');
   v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')v66NextMarketDay(career);
   const fixture=v62Fixtures(career).find(f=>!f.result&&(f.homeId==='GER-2'||f.awayId==='GER-2')&&v62Current(career).find(c=>c.id===f.competitionId)?.type==='cup');
   career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;await v61SaveCareers([career]);career.world.activeMatch.state.phase='live';v65Show(v65Context());clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();match.score=[0,0];match.elapsed=match.fullTimeEnd||75;v65Finish();
   // Reproduce the previous missing world action without altering the build.
   if(baseline){const fixed=v58State;v58State=function(){return v65Context()?.state.phase==='penalties'?{context:'Elfmeterschießen'}:fixed();};}
   return career.id;
  },baseline);
  await page.locator('#v42-confirm').click();const button=page.locator('#career-progress-action');
  const initial=await page.evaluate(()=>({phase:v42Session.phase,kicks:v42Session.kicks.length,action:v58State().action||null,originalHidden:getComputedStyle(document.querySelector('#v42-next')).display==='none'}));
  const visible=await button.isVisible();if(baseline){assert(!visible&&initial.kicks===0&&initial.originalHidden);rows.push({viewport,initial,visible});await context.close();continue;}
  assert(visible);assert.equal(initial.action,'penalty-kick');assert.equal(initial.kicks,0);assert.match(await button.innerText(),/Schießen/);
  assert(await button.evaluate(b=>b.scrollWidth<=b.clientWidth),'shot label fits on mobile');assert.equal(await page.locator('#v65-quick-nav').count(),0);
  await button.click();assert.equal(await page.evaluate(()=>v42Session.kicks.length),1);
  await page.screenshot({path:'outputs/penalty-controls-'+viewport.width+'-v126.png'});
  await page.locator('#v42-exit').click();await page.waitForFunction(()=>startScreen.hidden===false);
  await page.reload();await page.waitForFunction(()=>v61StorageReady&&document.querySelector('[data-v61-open]'));
  await page.locator('[data-v61-open="'+id+'"]').click();await page.waitForFunction(()=>v42Session?.phase==='shooting');assert.equal(await page.evaluate(()=>v42Session.kicks.length),1);assert(await button.isVisible());
  // No automatic kick on resume; header action executes exactly one next kick.
  await page.evaluate(()=>{Math.random=()=>v42Session.kicks.length%2===0?0:.99;});
  let clicks=0;while(await page.evaluate(()=>v42Session.phase!=='done')){assert(clicks++<30);const count=await page.evaluate(()=>v42Session.kicks.length);await button.click();assert.equal(await page.evaluate(()=>v42Session.kicks.length),count+1);}
  assert.equal(await page.evaluate(()=>v58State().action),'penalty-report');assert(await button.isVisible());assert.match(await button.innerText(),/Zum Spielbericht/);
  const done=await page.evaluate(()=>({score:v42Session.score,kicks:v42Session.kicks.length,winner:v42Session.winner,phase:v42Session.phase}));
  await button.click();await page.waitForFunction(()=>v65Context()?.state.phase==='finished');const booked=await page.evaluate(()=>({result:v65Context().fixture.result,session:!!v65Context().state.penaltySession}));assert(!booked.session);assert(booked.result?.penalties,JSON.stringify({booked,errors}));
  rows.push({viewport,initial,visible,resumedKicks:1,clicks,done,booked});await context.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/spieler-nutzer-rig/penalty-controls-'+(baseline?'baseline':'qa')+'-v126.json',JSON.stringify({version:126,baseline,rows,errors},null,2)+'\n');console.log(JSON.stringify({baseline,rows,errors},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
