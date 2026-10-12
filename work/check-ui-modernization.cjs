'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename,...process.argv.slice(2)],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('./ui-redesign/serve.cjs');
const target=process.argv.includes('--live')?'live':process.argv.includes('--build')?'build':'source',base=path.resolve('.'),out=path.join('outputs/ui-modernization',target),results=[];
const sources=fs.readdirSync('dist',{recursive:true}).filter(f=>/\.(css|js|html)$/.test(f));
const hashes=()=>Object.fromEntries(sources.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join('dist',f))).digest('hex')]));
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),errors=[],beforeHashes=hashes();
 fs.mkdirSync(out,{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(target==='live'?'https://fussball.cakamper.at/?ui-release=128':target==='build'?require('node:url').pathToFileURL(path.join(base,'outputs/index.html')).href:`http://127.0.0.1:${server.address().port}/source/index.html`);
  assert.match(await page.locator('footer').first().innerText(),/PROTOTYP 128/);
  await page.waitForFunction(()=>v61StorageReady);
  await page.screenshot({path:path.join(out,'start-390.png'),fullPage:true});
  await page.locator('[data-v81-open-settings]').click();await page.locator('dialog.v81-settings[open]').waitFor();await page.keyboard.press('Escape');
  assert.equal(await page.locator('.v81-options>summary').count(),0);
  await page.evaluate(()=>v61Begin());assert.equal(await page.locator('.fl-start-steps li').count(),4);
  assert.equal(await page.locator('[data-v172-step]').count(),0,'future steps do not navigate');
  await page.locator('#v172-name').fill('Modern QA');await page.locator('[data-v172-start=name]').click();
  await page.locator('[data-v172-step=manager]').click();assert.equal(await page.locator('#v172-name').inputValue(),'Modern QA');
  await page.screenshot({path:path.join(out,'setup-390.png'),fullPage:true});
  await page.locator('[data-v172-start=back]').click();
  await page.evaluate(async()=>{
   v61CurrentCareer=await v61StoreNewCareer(v167CreateCareer('GER-2','modern-ui-20261012','Modern QA'));v61RenderCareer(v61CurrentCareer);
  });
  await page.locator('[data-v66-sponsor]').first().click();
  if(await page.locator('[data-v124-budget]').count())await page.locator('[data-v124-budget]').click();
  await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='open');
  const person=await page.evaluate(()=>{
   const c=v61CurrentCareer,own=v66Own(c),p=own.roster[0];window.modernOriginal=JSON.stringify(c);
   p.age=35;p.name='Johannes Maximilian von Hohenberg';v61RenderCareer(c);return{id:p.pid,name:p.name};
  });
  await page.locator('[data-fl-overview-section=contracts]').first().waitFor();
  await page.locator('[data-fl-overview-section=contracts]').first().focus();
  assert.equal(await page.evaluate(()=>{const before=document.activeElement;D6Flutlicht.adapter.refresh();return document.activeElement===before;}),true,'office focus survives refresh');
  assert.ok((await page.locator('.fl-overview-office').innerText()).includes(person.name));
  assert.equal(await page.locator('.v176-retirement-notice').count(),0);
  assert.equal(await page.evaluate(()=>document.querySelector('.fl-overview-fixture').nextElementSibling.matches('.fl-overview-office')),true,'office directly follows fixture in DOM');
  const fixtureHeight=await page.locator('.fl-overview-fixture').evaluate(n=>n.getBoundingClientRect().height);
  assert.ok(fixtureHeight<529,`compact fixture ${fixtureHeight}px`);
  await page.locator('[data-fl-overview-section=contracts]').first().click();
  await page.waitForFunction(()=>document.querySelector('[data-v46-view=squad]')?.dataset.flSection==='contracts');
  assert.ok((await page.locator('.v66-contracts:visible').innerText()).includes(person.name));
  await page.evaluate(()=>{
   const c=v61CurrentCareer;c.world.retirementDecisions={season:c.world.season,day:112,players:[{pid:v66Own(c).roster[0].pid,age:35,retire:true}]};v61RenderCareer(c);v61SetCareerTab('overview',false);
  });
  await page.locator('.fl-overview-office').waitFor();assert.match(await page.locator('.fl-overview-office').innerText(),/Abschied bestätigt/);
  await page.locator('[data-fl-overview-section=contracts]').first().click();
  await page.locator('[data-fl-contract-filter=attention]').click();
  assert.equal(await page.locator(`.v66-contract:has([data-v61-player="${person.id}"]):visible`).count(),1);
  assert.equal(await page.locator(`.v66-contract:has([data-v61-player="${person.id}"]) [data-v66-renew-open]`).count(),0,'retirement cannot be renewed');
  await page.locator('[data-fl-contract-filter=all]').click();
  await page.evaluate(()=>{v61SetCareerTab('squad',false);D6Flutlicht.navigation.tablist('squad').querySelector('[data-fl-section-tab=roster]').click();});
  await page.locator('[data-fl-squad-sort]').selectOption('age:descending');
  assert.equal(await page.locator('[data-fl-squad-search]').count(),0,'roster name search removed');
  const ages=await page.locator('.fl-squad-table tbody tr:visible').evaluateAll(rows=>rows.map(row=>Number(row.dataset.age)));assert.deepEqual(ages,[...ages].sort((a,b)=>b-a));
  await page.locator(`.fl-squad-table [data-v61-player="${person.id}"]`).click();
  await page.locator('dialog.fl-squad-profile[open]').waitFor();
  await page.locator('dialog.fl-squad-profile[open]').screenshot({path:path.join(out,'profile-390.png')});
  assert.ok(await page.locator('dialog[open] .fl-squad-profile-contract').count());
  await page.locator('[data-v61-close]').click();
  await page.evaluate(()=>{v61SetCareerTab('transfers',false);D6Flutlicht.navigation.tablist('transfers').querySelector('[data-fl-section-tab=search]').click();});
  await page.locator('#v66-line').click();await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>{const before=document.activeElement;D6Flutlicht.adapter.refresh();return before.id==='v66-line'&&document.activeElement===before;}),true,'primary filter focus survives click/refresh');
  await page.locator('.v66-filters .fl-market-more summary').click();
  await page.locator('#v66-country').focus();
  assert.equal(await page.evaluate(()=>{const before=document.activeElement;D6Flutlicht.adapter.refresh();return document.activeElement===before;}),true,'additional filter focus survives refresh');
  await page.locator('#v66-country').selectOption('GER');
  assert.match(await page.locator('.v66-filters .fl-market-filter-status').innerText(),/Deutschland/);
  await page.locator('.v66-filters .fl-market-more summary').click();
  assert.match(await page.locator('.v66-filters .fl-market-filter-status').innerText(),/Deutschland/);
  const baseline=await page.evaluate(()=>JSON.stringify(v61CurrentCareer));
  assert.equal(await page.locator('[data-fl-section-select],.fl-market-jumps').count(),0,'redundant navigation removed');
  for(const route of ['squad','transfers','competition','club']){
   await page.evaluate(route=>v61SetCareerTab(route,false),route);
   const tabs=page.locator('.fl-subnav-host [role=tab]');assert.ok(await tabs.count()>=3);
   for(let i=0;i<await tabs.count();i++){
    await tabs.nth(i).click();assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true');
    const panel=await tabs.nth(i).getAttribute('aria-controls');assert.equal(await page.locator(`[id="${panel}"]`).isVisible(),true);
   }
   await tabs.last().press('Home');assert.equal(await tabs.first().getAttribute('aria-selected'),'true');
   assert.equal(await page.evaluate(()=>{const node=document.activeElement;D6Flutlicht.adapter.refresh();return node===document.activeElement;}),true,'subnavigation focus survives refresh');
   await tabs.first().press('End');assert.equal(await tabs.last().getAttribute('aria-selected'),'true');
   assert.equal(await tabs.last().evaluate(node=>{const item=node.getBoundingClientRect(),row=node.parentElement.getBoundingClientRect();return item.left>=row.left-1&&item.right<=row.right+1;}),true,'keyboard keeps active tab visible');
  }
  await page.setViewportSize({width:1280,height:900});
  for(const route of ['squad','club']){
   await page.evaluate(route=>v61SetCareerTab(route,false),route);
   const tab=page.locator('.fl-subnav-host [role=tab][aria-selected=true]'),panelId=await tab.getAttribute('aria-controls');
   await tab.focus();await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(id=>document.activeElement.id===id,panelId),true,'desktop Tab reaches active panel');
  }
  await page.setViewportSize({width:390,height:900});
  await page.locator('.fl-subnav-host [role=tab][aria-selected=true]').focus();await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.flRoute==='overview'),true,'mobile main navigation remains in keyboard path');
  for(const [width,theme,lang] of [[390,'light','de'],[360,'dark','en'],[1280,'light','en'],[1280,'dark','de']]){
   await page.setViewportSize({width,height:900});await page.evaluate(({theme,lang})=>{window.doppel6Language.set(lang);D6Flutlicht.theme.set(theme);},{theme,lang});
   const measures={};
   for(const route of ['overview','squad','transfers','competition','matchplan','club']){
    await page.evaluate(route=>{v61SetCareerTab(route,false);const section={squad:'roster',transfers:'search',competition:'league'}[route];if(section)D6Flutlicht.navigation.tablist(route).querySelector(`[data-fl-section-tab="${section}"]`).click();},route);
    await page.waitForFunction(route=>document.querySelector(`[data-v46-view="${route}"]`)?.hidden===false,route);
    const details=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,fixture:document.querySelector('.fl-overview-fixture')?.getBoundingClientRect().height,rows:document.querySelectorAll('.fl-squad-table tbody tr').length}));
    assert.equal(details.overflow,false,`${target} ${route} ${width} ${theme} ${lang} overflow`);measures[route]=details;
    if(route!=='matchplan'){
     const dock=await page.locator('.fl-bottom-dock').boundingBox();assert.ok(Math.abs(dock.y+dock.height-900)<2,'dock remains at viewport bottom');
     assert.equal(await page.locator('.fl-content > [data-v46-view]:visible .fl-section-tabs,.fl-content > [data-v46-view]:visible .fl-club-tabs').count(),0,'single context navigation');
     assert.equal(await page.evaluate(()=>{const before=scrollY;D6Flutlicht.adapter.refresh();return scrollY===before;}),true,'refresh retains scroll position');
    }
    if((width===390&&theme==='light')||(width===1280&&theme==='dark')||(width===360&&route==='overview'))await page.screenshot({path:path.join(out,`${route}-${width}-${theme}-${lang}.png`),fullPage:!['transfers','squad','competition'].includes(route),animations:'disabled'});
    if(route==='overview'&&width<1100){assert.equal(await page.evaluate(()=>document.querySelector('.fl-overview-fixture').nextElementSibling.matches('.fl-overview-office')),true);}
    if(route==='competition'&&width<700){
     const row=page.locator('table.fl-competition-table tbody tr').first();
     if(await row.count()){
      assert.equal(await row.locator('[data-fl-label]').count(),9);
      const heights=await page.locator('table.fl-competition-table:visible tbody tr').evaluateAll(rows=>rows.map(row=>row.getBoundingClientRect().height));
      assert.ok(heights.reduce((sum,height)=>sum+height,0)/heights.length<95,'mobile standings average under 95px');
     }
    }
   }
   results.push({width,theme,lang,measures});
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(v61CurrentCareer)),baseline,'presentation does not change career');
  await page.evaluate(async()=>{v61CurrentCareer=JSON.parse(window.modernOriginal);await v64UiSave();await v61WaitForStorage();});
  const saved=await page.evaluate(()=>({id:v61CurrentCareer.id,career:JSON.stringify(v61CurrentCareer)}));
  await page.reload();await page.locator(`[data-v61-open="${saved.id}"]`).click();await page.waitForFunction(()=>!!v61CurrentCareer);
  assert.equal(await page.evaluate(()=>JSON.stringify(v61CurrentCareer)),saved.career,'reload retains saved career');
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),beforeHashes,'stable sources');
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({pass:true,target,fixtureHeight,results,checks:['direct settings','backward-only setup','possible/confirmed retirement','office-contract navigation','attention filter','native sorting and profile','active hidden filter summary','six screens and themes/languages','career unchanged','storage/reload'],errors,sourceHashes:beforeHashes},null,2)+'\n');
  console.log(JSON.stringify({pass:true,target,fixtureHeight,cases:results.length*6,out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
