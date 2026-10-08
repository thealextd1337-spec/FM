const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=path.resolve('outputs/finance-v124');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.D6_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1200}}),errors=[],nativeChecks=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(output,'finance-report.html')).href);
  assert.equal(await page.locator('svg').count(),4);assert.equal(await page.locator('#annual-table tbody tr').count(),10);
  assert.equal(await page.locator('#recruitment-table tbody tr').count(),10);
  assert((await page.locator('#club option').count())>0);
  await page.screenshot({path:path.join(output,'finance-overview.png'),fullPage:true});
  await page.screenshot({path:path.join(output,'finance-summary.png'),clip:{x:0,y:0,width:1440,height:1100}});
  await page.locator('#group').selectOption('all');assert.equal(await page.locator('#club option').count(),48);
  await page.locator('#seed').selectOption('1');await page.locator('#club').selectOption('GER-2');
  assert((await page.locator('#club-description').textContent()).includes('Menschlicher Testverein'));
  await page.locator('#group').selectOption('cup');assert.equal(await page.locator('#club option').count(),12);
  assert((await page.locator('#club-description').textContent()).includes('Simulationsteam ohne Vereinswirtschaft'));
  assert.equal(await page.locator('#income-chart rect').count(),0);
  assert.equal(await page.locator('#recruitment-table tbody tr').count(),0);
  await page.locator('#seed').selectOption('all');await page.locator('#group').selectOption('cupNever');assert.equal(await page.locator('#club option').count(),12);
  await page.locator('#seed').selectOption('all');await page.locator('#group').selectOption('never');
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Report läuft auf Mobiltelefonen nicht horizontal über');
  await page.screenshot({path:path.join(output,'finance-mobile.png'),fullPage:true});
  // Source and offline builds each use a new browser profile; no real career is opened.
  for(const url of [process.env.D6_TEST_URL||'http://127.0.0.1:4192/',pathToFileURL(path.resolve('outputs/index.html')).href]){
   await page.goto(url);await page.waitForFunction(()=>typeof v124SetYouthBudget==='function'&&typeof window.doppel6Language==='object');
   await page.evaluate(()=>{
    const career=v61CreateCareer('GER-2','finance-browser-v124'),club=v66Club(career,'GER-2');
    v61CurrentCareer=career;v61WorldScreen.hidden=false;v61CareerTab='overview';
    v66ChooseSponsor(career,club.id,club.sponsors[0].id);v61RenderCareer(career);
   });
   assert.equal(await page.locator('#v124-budget').count(),1);
   assert.equal(await page.evaluate(()=>v58State().action),'v124-budget');
   await page.evaluate(()=>window.doppel6Language.set('en'));
   await page.waitForFunction(()=>document.querySelector('#v124-budget h2').textContent==='Financial statement');
   await page.evaluate(()=>window.doppel6Language.set('de'));
   await page.locator('[data-v124-budget]').click();
   await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='open'&&!v67Busy);
   assert.equal(await page.locator('#v124-budget').count(),0);
   await page.evaluate(()=>v61SetCareerTab('club'));
   assert((await page.locator('.v66-finance').textContent()).includes('Sichere Schlussprognose'));
   await page.screenshot({path:path.join(output,url.startsWith('http')?'finance-game-mobile.png':'finance-offline-mobile.png'),fullPage:true});
   const passiveUi=await page.evaluate(()=>{
    const career=v61CreateCareer('GER-2','simulation-browser-v124'),own=v66Club(career,'GER-2'),club=career.world.clubs.find(item=>item.simulationOnly);
    const survivor=club.roster[1],retiring=club.roster[0],pid=retiring.pid;survivor.age=25;retiring.age=retiring.retirementAge-1;
    v66ChooseSponsor(career,own.id,own.sponsors[0].id);v124SetYouthBudget(career,0);
    while(career.world.market.phase==='open')v66NextMarketDay(career);
    while(!career.world.seasonFinished)v62AdvanceDay(career);
    if(career.world.transition.choice===null)v67ChooseOffer(career,null);v62NextSeason(career);
    const html=v68ClubDetailHTML(career,club.id);
    v68OpenPlayerProfile(career,pid,null);
    const profile=v61ProfileDialog.textContent;v61ProfileDialog.close();
    return{html,profile,valid:v61ValidateCareer(JSON.parse(JSON.stringify(career))),books:club.ledger.length,roster:club.roster.length,retired:club.retiredPlayers.length,listed:v66MarketPlayers(career).some(item=>item.club?.simulationOnly)};
   });
   assert(passiveUi.valid);assert.equal(passiveUi.books,0);assert.equal(passiveUi.roster,11);assert(passiveUi.retired>0);assert.equal(passiveUi.listed,false);
   assert(passiveUi.html.includes('Simulationsteam ohne Vereinswirtschaft')&&passiveUi.html.includes('Karriereenden'));
   assert(!passiveUi.html.includes('Kontostand')&&!passiveUi.html.includes('Transferbilanz'));
   assert(passiveUi.profile.includes('Karriere beendet')&&!passiveUi.profile.includes('Marktwert')&&!passiveUi.profile.includes('Jahresgehalt'));
   const result=await page.evaluate(()=>{
    while(v61CurrentCareer.world.market.phase==='open')v66NextMarketDay(v61CurrentCareer);
    let seed=12345;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    const career=v61CurrentCareer,fixture=v62Fixtures(career).find(item=>!item.result&&(item.homeId==='GER-2'||item.awayId==='GER-2'));
    career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v98View='2d';
    career.world.activeMatch.state.phase='live';v65Show(v65Context());clearInterval(v65WorldFrame);
    let frames=0;
    while(!match.finished&&frames++<18000){
     if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame)}
     step(.05*MATCH_SPEED,.05);if(v65Context().state.phase==='live'&&!match.finished)v65AfterStep(v65Context());
     if(frames%60===0)draw();
    }
    if(!match.finished)throw Error('Match did not finish');
    const context=v65Context();
    return{frames,score:match.score,finished:match.finished,fixtureId:fixture.id,day:fixture.day,result:context.fixture.result,valid:v61ValidateCareer(career),ledger:career.world.clubs.find(item=>item.id==='GER-2').ledger};
   });
   assert(result.finished);assert(result.valid);assert(result.result,'Native Matchabschluss bucht das Ergebnis');
   for(const row of result.ledger.filter(row=>row.id===`${result.fixtureId}:match-credit`))assert.equal(row.day,result.day);
   nativeChecks.push({build:url.startsWith('http')?'source':'offline',frames:result.frames,finished:result.finished,valid:result.valid,simulationProfile:true,retiredProfile:true});
   console.log(`${url.startsWith('http')?'Quellseite':'Offline-Build'}: Budgetfolge, Mobilansicht, DE/EN und vollständige native Partie geprüft (${result.frames} Frames).`);
  }
  assert.deepEqual(errors,[],'Keine JavaScript-Fehler');
  const data=JSON.parse(fs.readFileSync(path.join(output,'finance-data.json'),'utf8'));
  fs.writeFileSync(path.join(output,'browser-check.json'),JSON.stringify({checkedAt:new Date().toISOString(),dataCreatedAt:data.createdAt,reportFilters:true,recruitmentBreakdown:true,mobile:true,languages:['de','en'],nativeChecks,status:'passed'},null,2));
  console.log('Interaktiver Finanzbericht: alle 48 Vereine, Welt-/Gruppenfilter, zehn Jahresbilanzen und Mobilansicht geprüft.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
