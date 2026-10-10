'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('./ui-redesign/serve.cjs');
(async()=>{
 const live=process.argv.includes('--live'),server=live?null:createServer();
 if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=live?'https://fussball.cakamper.at/?release122=acceptance&engine=2d':'http://127.0.0.1:'+server.address().port+'/release122.html?engine=2d';
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const rows=[],out='outputs/release-122';fs.mkdirSync(out,{recursive:true});
 try{for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(!live)await page.route('**/release122.html*',r=>r.fulfill({path:'outputs/index.html',contentType:'text/html'}));
  await page.goto(url,{timeout:120000});await page.waitForFunction(()=>window.D6Expansion?.seasonMoments);
  assert((await page.locator('footer').first().textContent()).includes('122'));
  await page.locator('#v61-begin').click();await page.locator('#v172-name').fill('Release QA');
  await page.locator('[data-v172-start="name"]').click();assert.equal(await page.locator('[data-v172-country]').count(),12);
  await page.locator('[data-v172-country="AUT"]').click();await page.locator('[data-v172-club="AUT-5"]').click();
  await page.locator('[data-v172-start="create"]').click();await page.waitForFunction(()=>v61CurrentCareer?.world.presentationVersion===172);
  const initial=await page.evaluate(()=>({id:v61CurrentCareer.id,clubs:v61CurrentCareer.world.clubs.length,own:v66Own(v61CurrentCareer).name,valid:v61ValidateCareer(v61CurrentCareer),countries:v61CurrentCareer.world.countries.length}));
  assert(initial.valid);assert.equal(initial.clubs,192);assert.equal(initial.countries,12);assert.equal(initial.own,'Innsbruck Sport');
  await page.evaluate(async()=>{const c=v61CurrentCareer;v66ChooseSponsor(c,v66Own(c).id,v66Own(c).sponsors[0].id);v124SetYouthBudget(c,0);for(let i=0;i<5;i++)v66NextMarketDay(c);await v64UiSave();await v61WaitForStorage();v61RenderCareer(c);});
  const fixture=JSON.parse(fs.readFileSync('outputs/ligaexpansion-ap09-ap10/closed-career.json','utf8'));
  const archived=await page.evaluate(async c=>{if(!v61ValidateCareer(c))throw Error('Archive invalid');await v61StoreNewCareer(c);v61CurrentCareer=c;v61RenderCareer(c);return{statistics:c.world.competitions.every(x=>Array.isArray(x.playerStatistics)),moments:v172Moments(c).length,hash:JSON.stringify(c.world.countrySeasonValues)};},fixture);
  assert(archived.statistics);assert(archived.moments<=3);
  const tabs=await page.locator('[data-v172-tab]').evaluateAll(elements=>elements.map(x=>x.dataset.v172Tab));assert.equal(tabs.length,6);
  for(const language of ['de','en']){
   await page.evaluate(lang=>window.doppel6Language.set(lang),language);
   for(const tab of tabs){await page.locator('[data-v172-tab="'+tab+'"]').click();assert((await page.locator('#v172-workspace').textContent()).trim().length>10);}
   await page.locator('[data-v172-tab="competition"]').click();
   for(const cup of ['crown','horizon']){await page.locator('[data-v172-select="scope"]').selectOption(cup);assert((await page.locator('#v172-workspace').textContent()).includes(cup==='crown'?'Crown Cup':'Horizon Cup'));}
  }
  await page.evaluate(async()=>{await v64UiSave();await v61WaitForStorage();});const id=fixture.id;
  await page.reload();await page.waitForFunction(()=>window.D6Expansion);await page.evaluate(async id=>{await v61WaitForStorage();await v61OpenCareer(id);},id);
  assert(await page.evaluate(expected=>v61ValidateCareer(v61CurrentCareer)&&JSON.stringify(v61CurrentCareer.world.countrySeasonValues)===expected,archived.hash));
  const awards=await page.evaluate(async()=>{const box=document.createElement('div');box.hidden=true;document.body.append(box);box.innerHTML=v61CurrentCareer.world.countries.flatMap(({id:country})=>['league','cup','top-scorer','player-of-season','man-of-the-match'].map(kind=>v62AwardIcon(country,kind)+v62AwardIcon(country,kind,true))).join('')+['crown','horizon'].flatMap(country=>['europe','man-of-the-match'].map(kind=>v62AwardIcon(country,kind)+v62AwardIcon(country,kind,true))).join('');const images=[...box.querySelectorAll('img')];await Promise.all(images.map(i=>i.decode()));return{count:images.length,inline:images.every(i=>i.src.startsWith('data:image/webp;base64,')),broken:images.filter(i=>!i.naturalWidth).length};});
  assert.equal(awards.count,128);assert(awards.inline);assert.equal(awards.broken,0);
  const legacy=await page.evaluate(()=>{const c=v61CreateCareer('GER-2','release122-legacy','QA'),before=JSON.stringify(c.world);v61CurrentCareer=c;v61RenderCareer(c);return{valid:v61ValidateCareer(c),unchanged:before===JSON.stringify(c.world),clubs:c.world.clubs.length};});assert(legacy.valid&&legacy.unchanged&&legacy.clubs===48);
  assert.deepEqual(errors,[]);await page.screenshot({path:out+'/'+(live?'live':'local')+'-'+width+'.png'});
  rows.push({width,regularStart:true,initial,marketProgress:true,languages:2,careerTabs:tabs.length,crownAndHorizon:true,archivedStatistics:true,momentsAtMost3:true,rankingUnchangedOnReload:true,awards,legacy,errors});await context.close();
 }
 fs.writeFileSync(out+'/'+(live?'live-browser':'local-browser')+'.json',JSON.stringify({pass:true,url,rows,buildSha256:crypto.createHash('sha256').update(fs.readFileSync('outputs/index.html')).digest('hex')},null,2));console.log(JSON.stringify({pass:true,live,cases:rows.length}));
 }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
