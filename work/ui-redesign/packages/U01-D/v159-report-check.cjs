'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'../../../..'),runtime='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node';
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('../../serve.cjs');
const files=['match-report-v47.js','ui-flutlicht/views/report.css','ui-flutlicht/views/competitions.js','ui-flutlicht/views/overview.js','ui-flutlicht/adapter.js','i18n-v75.js','ui-flutlicht/tokens.css','ui-flutlicht/components.css'];
const hashes=()=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'dist',file))).digest('hex')]));
const build=process.argv.includes('--build'),out=path.join(base,'outputs/ui-redesign/U01-D/v159',build?'build':'source');
const capture=!process.argv.includes('--no-images');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const before=hashes(),server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],checks=[],cases=[];page.on('pageerror',e=>errors.push(e.message));
  const htmlPath=path.join(base,build?'outputs/index.html':'dist/index.html'),htmlHash=crypto.createHash('sha256').update(fs.readFileSync(htmlPath)).digest('hex');
  await page.goto(build?new URL('file:///'+path.join(base,'outputs/index.html').replace(/\\/g,'/')).href:`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser`);
  await page.waitForFunction(()=>typeof v61CreateCareer==='function'&&typeof D6Flutlicht?.adapter?.project==='function');
  const cssIntegrated=await page.evaluate(()=>[...document.styleSheets].some(sheet=>sheet.href?.endsWith('/ui-flutlicht/views/report.css'))||[...document.querySelectorAll('style')].some(style=>style.textContent.includes('Native post-match report, its player detail')));
  assert.equal(cssIntegrated,true,'report CSS must be integrated in source/build');
  await page.evaluate(async()=>{
   for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();v98View='2d';
   const career=v61CreateCareer('ESP-2','report-v159-isolated','Bericht Prüfung');const own=v66Own(career);v66ChooseSponsor(career,own.id,own.sponsors[0].id);v124SetYouthBudget(career,0);
   for(let i=0;i<6&&career.world.market.phase!=='closed';i++)v66NextMarketDay(career);
   v61CurrentCareer=await v61StoreNewCareer(career);v61RenderCareer(career);
   v64AdvanceToOwnMatch(career);window.reportContext=v65Context();v65WorldActive=reportContext;v65CreateMatch(reportContext);
   while(reportContext.state.phase!=='finished')v64Step(career,reportContext.fixture,reportContext.state);
   const {state}=reportContext;match.score=[state.score[reportContext.ownSide],state.score[1-reportContext.ownSide]];match.shots=[3,2];match.possession=[33,27];
   for(const person of match.people){person.stats={...person.stats,...state.stats[person.pid],rating:6.7};state.ratings??={};state.ratings[person.pid]=6.7;}
   state.postMatchReport=v65WorldReport(reportContext,match.people);state.postMatchStep='report';v64CompleteOwnMatch(career);state.postMatchReport.manOfMatchPid=reportContext.fixture.matchRecord.manOfMatchPid;
   window.qaReport=state.postMatchReport;window.reportReadBaseline=JSON.stringify(career);v65ShowPostMatch(reportContext);
  });
  await page.locator('#v47-match-report[open]').waitFor();
  const nativeMeta=await page.evaluate(()=>({competition:qaReport.competition,fixtureId:qaReport.fixtureId,expected:Object.fromEntries(v62FixtureRankLabels(v61CurrentCareer,reportContext.fixture)),actual:[...v47Dialog.querySelectorAll('.v47-current-rank')].map(n=>n.textContent),identity:qaReport.clubIds}));
  assert.equal(nativeMeta.fixtureId,await page.evaluate(()=>reportContext.fixture.id));assert(nativeMeta.competition.id&&nativeMeta.competition.round);
  assert.deepEqual(nativeMeta.actual,nativeMeta.identity.map(id=>nativeMeta.expected[id]));checks.push('native report metadata and CURRENT actual table ranks');
  const rankChecks=await page.evaluate(()=>{
   const career=structuredClone(v61CurrentCareer),report=structuredClone(qaReport),league=v62Current(career).find(c=>c.id===report.competition.id),id=report.clubIds[0],before=v47CurrentReportRanks(report,career).get(id);
   for(const f of league.fixtures){if(f.homeId===id)f.result={homeGoals:9,awayGoals:0};else if(f.awayId===id)f.result={homeGoals:0,awayGoals:9};else f.result={homeGoals:0,awayGoals:0};}
   const changed=v47CurrentReportRanks(report,career).get(id),currentExact=v62Table(league,[...new Set(league.fixtures.flatMap(f=>[f.homeId,f.awayId]))]).findIndex(row=>row.clubId===id)+1;
   const cup=v47CurrentReportRanks({...report,competition:{type:'cup',country:'ESP',round:'QF'}},career).size;
   const eu=v62Current(career).find(c=>c.type==='europe'),euReport={...report,clubIds:eu.entrants.slice(0,2),competition:{id:eu.id,type:'europe',round:'R1'}};
   const group=v47CurrentReportRanks(euReport,career).size,knockout=v47CurrentReportRanks({...euReport,competition:{...euReport.competition,round:'SF'}},career).size,unknown=v47CurrentReportRanks({...euReport,competition:{type:'europe'}},career).size;
   const historic={...report,competition:{...report.competition,id:'S0:ESP:LEAGUE'}};
   return{before,changed,currentExact,cup,group,knockout,unknown,historicCurrent:v47CurrentReportRanks(historic,career).get(id),readOnly:reportReadBaseline===JSON.stringify(v61CurrentCareer)};
  });
  assert.equal(rankChecks.changed,rankChecks.currentExact);assert.equal(rankChecks.changed,1);assert.equal(rankChecks.cup,0);assert.equal(rankChecks.knockout,0);assert.equal(rankChecks.unknown,0);assert.equal(rankChecks.group,12);assert.equal(rankChecks.historicCurrent,1);assert.equal(rankChecks.readOnly,true);checks.push('current rank changes immediately; historical league reads current standings; cup and European KO omit rank; unknown group context not invented');
  const recentChecks=await page.evaluate(()=>{
   const c=structuredClone(v61CurrentCareer),clubId=c.manager.managedClubId,club=c.world.clubs.find(item=>item.id===clubId),opponent=c.world.clubs.find(item=>item.id!==clubId&&item.countryId===club.countryId),baseCompetitions=c.world.competitions;
   c.world.competitions=baseCompetitions.map(item=>({...item,fixtures:item.fixtures.filter(f=>f.homeId!==clubId&&f.awayId!==clubId)}));
   const custom=[['league',1],['cup',2],['europe',3],['league',4],['cup',5],['europe',6]];
   custom.forEach(([type,day],index)=>{const comp=c.world.competitions.find(item=>item.type===type&&(type==='europe'||item.country===club.countryId));comp.fixtures.push({id:'v159-recent-'+index,competitionId:comp.id,day,round:type==='cup'?'QF':'R1',homeId:clubId,awayId:opponent.id,result:{homeGoals:index===4?1:index%3===0?2:index%3===1?0:1,awayGoals:index%3===0?0:index%3===1?1:1,...(index===4?{penalties:[5,4],winnerId:clubId}:{})}});});
   const league=c.world.competitions.find(item=>item.type==='league'&&item.country===club.countryId);league.fixtures.push({id:'v159-upcoming',competitionId:league.id,day:7,round:'R2',homeId:clubId,awayId:opponent.id});
   const snapshot=JSON.stringify(c),row=D6Flutlicht.adapter.project(c).overview.fixture.home.recent;
   doppel6Language.set('en');const english=D6Flutlicht.adapter.project(c).overview.fixture.home.recent;doppel6Language.set('de');
   return{rows:row,english,chronological:row.every((result,index)=>result.detail.includes(v62Date(index+2))),unchanged:JSON.stringify(c)===snapshot};
  });
  assert.equal(recentChecks.rows.length,5);assert.equal(recentChecks.unchanged,true);assert.equal(recentChecks.chronological,true);assert(recentChecks.rows.some(row=>/Europacup|Europe/.test(row.detail)));assert(recentChecks.rows.some(row=>/Pokal|cup/i.test(row.detail)));assert(recentChecks.rows[3].outcome==='win','shootout win determines outcome');assert(recentChecks.english.every(row=>!/(Saison|Europacup|Pokal|Heimspiel|Elfmeterschießen)/.test(row.detail)),'recent result tooltips translated');assert(recentChecks.english[3].detail.includes('Penalty shootout'));checks.push('overview newest five include league/cup/Europe in chronological order and shootout result, without career mutation; DE/EN tooltips');
  for(const width of [320,390,768,1280])for(const theme of ['light','dark'])for(const lang of ['de','en']){
   await page.setViewportSize({width,height:width===768?390:900});
   await page.evaluate(({theme,lang})=>{localStorage.setItem('doppel6.ui.flutlicht.theme',theme);doppel6Language.set(lang);v47Dialog.innerHTML=v47ReportHTML(qaReport);v65ShowPostMatch(reportContext);},{theme,lang});
   await page.waitForTimeout(70);
   const geometry=await page.locator('#v47-match-report').evaluate(n=>({overflow:n.scrollWidth>n.clientWidth+1,bodyOverflow:n.querySelector('.v47-body').scrollWidth>n.querySelector('.v47-body').clientWidth+1,theme:n.dataset.flTheme,color:getComputedStyle(n).backgroundColor,titleColor:getComputedStyle(n.querySelector('h2')).color,table:n.querySelector('table').getAttribute('class'),controls:[...n.querySelectorAll('.v47-head button')].map(b=>({height:b.getBoundingClientRect().height,width:b.getBoundingClientRect().width})),rankLabels:[...n.querySelectorAll('.v47-current-rank')].map(r=>r.getAttribute('aria-label')),unchanged:reportReadBaseline===JSON.stringify(v61CurrentCareer)}));
   assert.equal(geometry.overflow,false,`dialog overflow ${width}/${theme}/${lang}`);assert.equal(geometry.bodyOverflow,false);assert.equal(geometry.theme,theme);assert.equal(geometry.color,theme==='dark'?'rgb(17, 21, 26)':'rgb(241, 243, 245)');assert.equal(geometry.table,'v47-stat-table');assert(geometry.controls.every(b=>b.height>=44&&b.width>=44));assert.equal(geometry.unchanged,true);
   assert(geometry.rankLabels.every(label=>label.startsWith(lang==='en'?'Current table position':'Aktueller Tabellenplatz')));
   if(capture&&[390,1280].includes(width)&&lang==='de')await page.screenshot({path:path.join(out,`native-${width}-${theme}.png`),animations:'disabled'});
   cases.push({width,theme,lang,...geometry});
  }
  await page.evaluate(()=>{v47Dialog.innerHTML=v47ReportHTML(qaReport);v47Dialog.onclick=e=>{const row=e.target.closest('[data-report-player]');if(row)v47OpenPlayerStats(qaReport,Number(row.dataset.reportPlayer))};});
  await page.locator('#v47-match-report .v47-player').first().click();await page.locator('.v47-player-dialog[open]').waitFor();await page.waitForTimeout(50);assert.equal(await page.locator('.v47-player-dialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);assert((await page.locator('.v47-player-dialog').textContent()).includes('Statistics for this match'));assert((await page.locator('.v47-player-stats').textContent()).includes('Saves'));assert.equal(await page.locator('.v47-player-close').getAttribute('aria-label'),'Close player statistics');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>v47Dialog.open),true);
  await page.locator('#v47-match-report .v47-player').nth(1).click();await page.locator('.v47-player-dialog[open]').waitFor();await page.waitForTimeout(50);assert((await page.locator('.v47-player-stats').textContent()).includes('Interceptions'));await page.keyboard.press('Escape');
  const flags=await page.evaluate(()=>['ARG','NOR'].map(code=>({code,embedded:v47PlayerFlag(code).includes(v79FlagAssets[code]),svg:v47PlayerFlag(code).includes('<image')})));assert(flags.every(flag=>flag.embedded&&flag.svg));checks.push('native keeper/outfield match statistics opens and returns, English detail labels and embedded FIFA-code flags');
  await page.evaluate(()=>{v47Dialog.close();v65ShowPostMatch(reportContext)});await page.locator('#v47-match-report .v47-menu').click();await page.locator('#v47-competition[open]').waitFor();assert.equal(await page.evaluate(()=>reportContext.state.postMatchStep),'competition');await page.locator('#v47-competition .v47-competition-back').click();await page.locator('#v47-match-report[open]').waitFor();assert.equal(await page.evaluate(()=>reportContext.state.postMatchStep),'report');checks.push('native Continue/result overview/report return preserves postmatch controller');
  const edgeCases=await page.evaluate(()=>{
   const copy=structuredClone(qaReport);copy.ownName='Verein <mit> & einem sehr langen vollständigen Vereinsnamen';copy.opponentName='United With A Very Long Complete Football Club Name';copy.players[0].name='Spieler <Name> & vollständiger Doppelname mit einer langen Erweiterung';copy.competition={type:'cup',country:'ESP',round:'SF'};copy.score=[1,1];copy.goals=[{team:0,name:copy.players[0].name,minute:'45+2',ownGoal:true}];
   const random=Math.random;let calls=0;Math.random=()=>{calls++;throw Error('Report must not draw match randomness')};let html;try{html=v47ReportHTML(copy,{score:[4,3],winner:0});v47PlayerStatsHTML(copy.players[0],copy.ownName);}finally{Math.random=random;}
   v47Dialog.innerHTML=html;
   return{calls,score:v47Dialog.querySelector('.v47-score-total').textContent,rankCount:v47Dialog.querySelectorAll('.v47-current-rank').length,ownGoal:v47Dialog.querySelector('.v47-score-goals').textContent,shotText:v47Dialog.textContent,fullName:v47Dialog.querySelector('.v47-score-club>span').textContent,overflow:v47Dialog.scrollWidth>v47Dialog.clientWidth+1,playerOverflow:v47Dialog.querySelector('.v47-rosters').scrollWidth>v47Dialog.querySelector('.v47-rosters').clientWidth+1,htmlEscaped:html.includes('&lt;Name&gt;'),careerUnchanged:reportReadBaseline===JSON.stringify(v61CurrentCareer)};
  });
  assert.equal(edgeCases.calls,0);assert.equal(edgeCases.score,'1 : 1');assert.equal(edgeCases.rankCount,0);assert(edgeCases.ownGoal.includes('45+2′')&&edgeCases.ownGoal.includes('(E.)'));assert(edgeCases.shotText.includes('4 : 3'));assert(edgeCases.fullName.includes('<mit> &'));assert.equal(edgeCases.htmlEscaped,true);assert.equal(edgeCases.overflow,false);assert.equal(edgeCases.playerOverflow,false);await page.waitForTimeout(50);const translatedShootout=await page.locator('#v47-match-report .help').textContent();assert.match(translatedShootout,/Penalty shootout.*wins/);checks.push('long escaped names, own-goal stoppage scorer, drawn regulation/penalty winner and no ambient randomness');
  await page.evaluate(()=>{v47Dialog.close();v47CompetitionDialog.close();delete v61CurrentCareer.world.activeMatch;v65WorldActive=null;match=null;document.body.classList.remove('v65-world-postmatch');v61RenderCareer(v61CurrentCareer);v61SetCareerTab('calendar',false)});
  const reportButton=page.locator(`[data-v46-view="calendar"] [data-fl-report-open="${nativeMeta.fixtureId}"]`);await reportButton.click();await page.locator('.fl-competition-report[open]').waitFor();
  const projection=await page.evaluate(()=>D6Flutlicht.adapter.project(v61CurrentCareer).competitions.report);assert(projection.home.currentRank&&projection.away.currentRank);assert(projection.home.crestHTML&&projection.away.crestHTML);assert.equal(await page.locator('.fl-competition-report .fl-report-current-rank').count(),2);
  await page.locator('.fl-competition-report [data-fl-report-player]').first().click();await page.locator('.v61-profile-dialog[open]').waitFor();await page.locator('.v61-profile-dialog [data-v61-close]').click();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.matches('[data-fl-report-open]')),true);checks.push('calendar current ranks/crests, actual player profile, report return and Escape focus restoration');
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{v47Dialog.innerHTML=v47ReportHTML(qaReport);v47Dialog.showModal()});assert.equal(await page.locator('#v47-match-report .v47-winner').first().evaluate(n=>getComputedStyle(n).animationName).catch(()=> 'none'),'none');checks.push('reduced-motion winner presentation');
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'owned source changed during QA');
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({target:build?'build':'source',htmlHash,cssIntegrated,cases,checks,rankChecks,recentChecks,edgeCases,flags,translatedShootout,nativeMeta,errors,hashes:before,limits:['isolated Edge profile','CSS viewport changes, not real mobile hardware or screen reader','2D test lane; does not certify Unity match animation']},null,2)+'\n');
  console.log(JSON.stringify({out,cases:cases.length,checks:checks.length,errors}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1});
