'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('./ui-redesign/serve.cjs');
(async()=>{
 const live=process.argv.includes('--live'),built=process.argv.includes('--build'),server=createServer(),sourceHandler=server.listeners('request')[0];
 server.removeAllListeners('request');server.on('request',(req,res)=>{
  if(new URL(req.url,'http://localhost').pathname==='/restored.html'){
   res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-cache');fs.createReadStream('outputs/index.html').pipe(res);return;
  }sourceHandler(req,res);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const out=live?'outputs/release-125':'outputs/ui-restore';fs.mkdirSync(out,{recursive:true});const rows=[];
 try{for(const width of [390,1440]){
  console.log(JSON.stringify({stage:'start',built,width}));
  const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(live?'https://fussball.cakamper.at/?engine=2d&qa=125':`http://127.0.0.1:${server.address().port}/${built?'restored.html':'source/index.html'}?engine=2d`,{timeout:120000});
  console.log(JSON.stringify({stage:'loaded',built,live,width}));
  assert((await page.locator('footer').first().textContent()).includes('PROTOTYP 125'));
  await page.locator('#v61-begin').click();await page.locator('#v172-name').fill('Oberflächenprüfung');
  await page.locator('[data-v172-start="name"]').click();assert.equal(await page.locator('[data-v172-country]').count(),12);
  await page.locator('[data-v172-country="AUT"]').click();await page.locator('[data-v172-club="AUT-5"]').click();
  await page.locator('[data-v172-start="create"]').click();await page.locator('#v61-world-screen .fl-shell').waitFor();
  console.log(JSON.stringify({stage:'career',built,width}));
  assert.equal(await page.evaluate(()=>v66Own(v61CurrentCareer).name),'Innsbruck Sport');
  assert(await page.evaluate(()=>v61ValidateCareer(v61CurrentCareer)));
  const navigate=async route=>{const buttons=page.locator(`.fl-nav-link[data-fl-route="${route}"]`);let visible=null;for(const button of await buttons.all())if(await button.isVisible()){visible=button;break;}
   if(!visible){await page.locator('[data-fl-menu]').click();visible=buttons.last();}await visible.click();await page.waitForFunction(route=>v61CareerTab===route,route);};
  await page.locator('[data-v66-sponsor]').first().click();await page.locator('[data-v124-budget]').waitFor();
  await page.locator('#v67-budget').selectOption('0');await page.locator('[data-v124-budget]').click();
  await page.waitForFunction(()=>!v67Busy&&v61CurrentCareer.world.market.phase==='open');
  const sectionSelect=async(key,root=page)=>{const picker=root.locator('[data-fl-section-select]:visible');if(await picker.count())await picker.first().selectOption(key);else await root.locator(`[data-fl-section-tab="${key}"]:visible,[data-fl-club-tab="${key}"]:visible`).click();};
  const menus=await page.locator('.fl-sidebar .fl-nav-link').evaluateAll(nodes=>nodes.map(x=>x.dataset.flRoute));
  const views=[];
  for(const lang of ['de','en']){
   await page.evaluate(lang=>window.doppel6Language.set(lang),lang);
   for(const route of ['overview','squad','matchplan','transfers','competition','calendar','statistics','club','settings']){
    await navigate(route);assert(await page.locator('#v61-world-screen .fl-shell').isVisible());
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width}/${lang}/${route} overflow`);
    views.push({lang,route});
   }
   await navigate('competition');const panel=page.locator('[data-v46-view="competition"]');
   if(lang==='en')assert.equal(await panel.locator('[data-fl-section-tab="ranking"]').textContent(),'Country ranking');
   for(const section of ['league','cup','crown','horizon','countries','ranking','archive']){
    await sectionSelect(section,panel);
    assert(await panel.locator(`[data-fl-section-panel="${section}"]`).isVisible());
   }
   await sectionSelect('crown',panel);assert.equal(await panel.locator('[data-fl-section-panel="crown"] tbody tr').count(),26);
   await sectionSelect('horizon',panel);assert((await panel.locator('[data-fl-section-panel="horizon"]').innerText()).includes('Horizon Cup'));
   await sectionSelect('countries',panel);await panel.locator('[data-v175-country]').selectOption('BEL');
   assert((await panel.locator('[data-fl-section-panel="countries"]').innerText()).includes(lang==='en'?'Belgium':'Belgien'));
   await navigate('squad');for(const section of ['roster','contracts','youth'])await sectionSelect(section);
   await navigate('transfers');for(const section of ['search','listed','own','offers','balance'])await sectionSelect(section);
   assert.equal(await page.locator('#v72-country option').count(),13,'All twelve countries in club sale filter');
  }
  await page.evaluate(()=>window.doppel6Language.set('de'));await navigate('overview');
  console.log(JSON.stringify({stage:'menus',built,width}));
  for(let day=1;day<=5;day++){
   await page.locator('[data-fl-lead]').first().click();await page.waitForFunction(day=>!v66DayBusy&&!v67Busy&&(v61CurrentCareer.world.market.day!==day||v61CurrentCareer.world.market.phase==='closed'),day);
  }
  assert.equal(await page.evaluate(()=>v61CurrentCareer.world.market.phase),'closed');
  await navigate('transfers');assert(await page.locator('.v66-market').count());
  await navigate('squad');await sectionSelect('contracts');assert(await page.locator('.v66-contracts').isVisible());
  await navigate('overview');await page.screenshot({path:`${out}/${live?'live':built?'build':'source'}-${width}.png`});
  const before=await page.evaluate(()=>JSON.stringify(v61CurrentCareer.world));
  await navigate('competition');await sectionSelect('ranking');
  assert.equal(await page.evaluate(()=>JSON.stringify(v61CurrentCareer.world)),before);
  const id=await page.evaluate(async()=>{await v64UiSave();await v61WaitForStorage();return v61CurrentCareer.id;});
  assert(await page.evaluate(()=>v61ValidateCareer(v61CurrentCareer)),'Saved world is valid');
  await page.reload();await page.waitForFunction(()=>v61StorageReady&&window.D6Flutlicht?.adapter);
  const reopened=await page.evaluate(async id=>{await v61WaitForStorage();await v61OpenCareer(id);return {current:v61CurrentCareer?.id,saves:v61ReadCareers().map(c=>c.id),error:v61StorageError};},id);
  assert.equal(reopened.current,id,JSON.stringify(reopened));await page.locator('#v61-world-screen .fl-shell').waitFor();
  assert.equal(await page.evaluate(()=>JSON.stringify(v61CurrentCareer.world)),before);
  await navigate('overview');await page.locator('[data-fl-lead]').first().click();await page.waitForFunction(()=>!v67Busy&&!!v61CurrentCareer.world.activeMatch,{timeout:60000});
  assert(await page.evaluate(()=>v61ValidateCareer(v61CurrentCareer)));
  const closed=JSON.parse(fs.readFileSync('outputs/ligaexpansion-ap09-ap10/closed-career.json','utf8'));
  await page.evaluate(async c=>{await v61StoreNewCareer(c);v61CurrentCareer=c;v61CareerTab='overview';v61RenderCareer(c);},closed);
  for(let step=0;step<4;step++){
   const review=page.locator('#v67-season-show');await review.waitFor();
   if([0,1,3].includes(step)){const text=await review.innerText();assert(text.includes('Crown Cup')&&text.includes('Horizon Cup'),'Both international cups in season review');}
   await review.locator('[data-v67-review-next]').click();await page.waitForFunction(step=>v61CurrentCareer.world.transition.reviewStep>step,step);
  }
  await page.locator('[data-v124-next]').click();await page.waitForFunction(()=>!v67Busy&&v61CurrentCareer.world.season===2);
  assert(await page.evaluate(()=>v61ValidateCareer(v61CurrentCareer)));
  await navigate('competition');await page.locator('[data-v46-view="competition"] [data-v172-select="season"]').selectOption('1');
  await sectionSelect('archive');const archive=await page.locator('[data-fl-section-panel="archive"]').innerText();assert(archive.includes('Crown Cup')&&archive.includes('Horizon Cup'));
  await navigate('statistics');await page.locator('[data-v46-view="statistics"] [data-v172-select="season"]').selectOption('1');
  for(const cup of ['crown','horizon']){await page.locator('[data-v46-view="statistics"] [data-fl-filter="competition"]').selectOption(cup);assert(await page.locator(`.v62-stat-board[data-fl-stat-type="${cup}"]`).isVisible());}
  await page.locator('[data-v46-view="statistics"] [data-fl-filter="category"]').selectOption('rating');
  assert(await page.locator('.v62-stat-board[data-fl-stat-type="horizon"] [data-fl-stat-category="rating"]').isVisible());
  assert(!(await page.locator('.v62-stat-board[data-fl-stat-type="horizon"] [data-fl-stat-category="goals"]').isVisible()));
  await page.evaluate(()=>v61ShowStart());await page.locator('#v61-begin').click();await page.locator('#v172-name').fill('Zweite Karriere');
  await page.locator('[data-v172-start="name"]').click();await page.locator('[data-v172-country="BEL"]').click();await page.locator('[data-v172-club="BEL-1"]').click();
  await page.locator('[data-v172-start="create"]').click();await page.locator('#v61-world-screen .fl-shell').waitFor();
  assert.equal(await page.evaluate(()=>v61CareerTab),'overview','New career starts at overview, independent of previous route');
  assert(await page.locator('[data-v46-view="overview"] .v66-sponsors').isVisible());
  assert.deepEqual(errors,[]);rows.push({width,built,live,url:page.url(),menus,views,phase:'season-2-sponsor',reviewPages:4,archiveCups:2,startAgain:true,valid:true,errors});await context.close();
  console.log(JSON.stringify({stage:'accepted',built,width}));
 }
 fs.writeFileSync(`${out}/${live?'live':built?'build':'source'}-browser.json`,JSON.stringify({pass:true,live,rows},null,2)+'\n');console.log(JSON.stringify({pass:true,built,cases:rows.length}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
