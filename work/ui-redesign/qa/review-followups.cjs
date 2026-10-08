'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),{createServer}=require('../serve.cjs');
const target=process.argv[2]||'source',out=path.resolve('outputs/ui-redesign/review-followups/'+target);fs.mkdirSync(out,{recursive:true});
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function navigate(page,route){let button=page.locator(`[data-fl-route="${route}"]:visible`).first();if(!await button.count()){await page.locator("[data-fl-menu]:visible").click();button=page.locator(`[data-fl-route="${route}"]:visible`).first();}await button.click();await settle(page);}
const report={target,checks:[],errors:[]};let server,browser;
function check(name,condition){assert(condition,name);report.checks.push(name);}
(async()=>{
 server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1322,height:956}});page.on('pageerror',error=>report.errors.push(error.message));
 await page.goto(target==='source'?`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser`:pathToFileURL(path.resolve('outputs/index.html')).href+'?engine=browser');await page.waitForFunction(()=>v61StorageReady&&D6Flutlicht.match);
 await page.evaluate(async()=>{const c=v61CreateCareer('ESP-2','review-followups','UI-Prüfung'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);const ownGames=v62Fixtures(c).filter(f=>f.homeId===club.id||f.awayId===club.id);for(const f of ownGames.slice(0,3))f.result={homeGoals:0,awayGoals:0};const p=club.roster[0];p.formRatings=[];for(const rating of [4.2,5.1,6.4,7.8,9.2])v64UpdateForm(p,rating);p.history=ownGames.slice(0,3).map(f=>({season:1,fixtureId:f.id,clubId:club.id,rating:6.7,minutes:90,goals:0,assists:0}));club.roster[1].formRatings=null;v61CurrentCareer=await v61StoreNewCareer(c);v61CareerTab='squad';v61RenderCareer(c);});await settle(page);
 const pristine=await page.evaluate(()=>JSON.stringify(v61CurrentCareer));
 for(const width of [1322,1182,390,320])for(const language of ['de','en'])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:956});await page.evaluate(language=>doppel6Language.set(language),language);await navigate(page,'settings');await page.locator('[data-fl-theme-preference-control]').selectOption(theme);await settle(page);
  await navigate(page,'squad');
  const label=`${width}/${language}/${theme}`;
  const row=page.locator('[data-v61-roster-row]').first(),face=row.locator('.fl-form-icon');
  check(label+' face has no visible description',(await face.textContent()).trim()==='');check(label+' face has accessible tooltip',Boolean(await face.getAttribute('aria-label'))&&Boolean(await face.getAttribute('data-fl-tooltip')));
  await face.focus();await settle(page);check(label+' keyboard opens the form tooltip',await page.locator('.fl-tooltip:visible').count()>0);await page.keyboard.press('Escape');
  const bars=row.locator('.fl-rating-game');check(label+' exactly five actual form ratings',await bars.count()===5);
  check(label+' all five grade bands match recorded ratings',JSON.stringify(await bars.evaluateAll(nodes=>nodes.map(n=>n.className.split(' ').find(c=>c.startsWith('fl-band-')))))===JSON.stringify(['fl-band-violetgray','fl-band-bluegray','fl-band-yellow','fl-band-orange','fl-band-pink']));
  check(label+' seasonal average is distinct from form ratings',(await row.locator('.fl-rating-average').textContent())===(language==='de'?'6,7':'6.7'));
  await bars.last().focus();await settle(page);check(label+' rating tooltip contains actual most recent grade',(await page.locator('.fl-tooltip:visible').last().textContent()).includes(language==='de'?'9,2':'9.2'));await page.keyboard.press('Escape');
  check(label+' missing old form period stays marked',await page.locator('[data-v61-roster-row]').nth(1).locator('.fl-rating-missing').count()===1);
  check(label+' no viewport overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1322&&language==='de')await page.screenshot({path:path.join(out,`squad-${theme}.png`),fullPage:true});
  await navigate(page,'overview');const tasks=page.locator('.fl-overview-office button.fl-overview-task');check(label+' club office actions remain accessible',await tasks.count()>0);for(const task of await tasks.all()){const rect=await task.boundingBox();check(label+' compact office action',rect.height>=44&&rect.height<=80);}
  if(width===1322&&language==='de')await page.screenshot({path:path.join(out,`office-${theme}.png`),fullPage:true});
  await navigate(page,'calendar');const played=page.locator('.v62-calendar-list li.played');check(label+' calendar retains results and report access',await played.count()===3&&await played.first().locator('[data-fl-report-open]').count()===1);if(width>=1182)check(label+' calendar rows are compact',(await played.first().boundingBox()).height<=82);
  check(label+' calendar has no viewport overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===1322&&language==='de')await page.screenshot({path:path.join(out,`calendar-${theme}.png`),fullPage:true});
 }
 check('Presentation and filters do not change the career',pristine===await page.evaluate(()=>JSON.stringify(v61CurrentCareer)));
 for(const width of [1322,390])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:956});await navigate(page,'settings');await page.locator('[data-fl-theme-preference-control]').selectOption(theme);await settle(page);
  await page.evaluate(()=>{const c=v61CurrentCareer,club=v66Own(c),f=v62Fixtures(c).find(f=>!f.result&&(f.homeId===club.id||f.awayId===club.id));c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};c.world.activeMatch.state.phase='paused';v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);});await settle(page);
  check(`match ${width}/${theme} uses the management theme`,await page.locator('#game-screen').getAttribute('data-fl-theme')===theme);check(`match ${width}/${theme} no viewport overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  check(`match ${width}/${theme} clock uses the modern style`,await page.locator('.retro-clock').evaluate(node=>getComputedStyle(node).textShadow==='none'&&getComputedStyle(node).boxShadow==='none'));
  await page.evaluate(()=>{v65PauseView=true;v65PauseTab='lineup';v65UpdateControls(v65Context());});await settle(page);
  const before=await page.evaluate(()=>JSON.stringify(v65Context().state.tactics));await page.locator('#fl-match-tab-lineup').focus();await page.keyboard.press('ArrowRight');await settle(page);check(`tactics ${width}/${theme} keyboard tab works`,await page.locator('#fl-match-tab-tactics').getAttribute('aria-selected')==='true');
  check(`tactics ${width}/${theme} control panel labelled`,await page.locator('#v65-controls').getAttribute('aria-labelledby')==='fl-match-tab-tactics');check(`tactics ${width}/${theme} view does not change tactics`,before===await page.evaluate(()=>JSON.stringify(v65Context().state.tactics)));check(`tactics ${width}/${theme} no viewport overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(out,`tactics-${width}-${theme}.png`),fullPage:true});await page.evaluate(async()=>v65Leave(false));await settle(page);
 }
 check('No uncaught page errors',report.errors.length===0);console.log(`PASS ${report.checks.length} UI checks (${target})`);
})().catch(error=>{report.failure=error.message;console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server?.close();fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));});
