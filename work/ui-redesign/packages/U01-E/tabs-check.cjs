'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=path.resolve(__dirname,'../../../..'),files=['dist/ui-flutlicht/tokens.css','dist/ui-flutlicht/components.css','dist/ui-flutlicht/components.js','dist/ui-flutlicht/registry.js','dist/ui-flutlicht/views/club.css','dist/ui-flutlicht/views/club.js','work/ui-redesign/packages/U01-E/fixture.js'];
const hashes=()=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,file))).digest('hex')]));
const out=path.join(base,'outputs/ui-redesign/U01-E',`tabs-${new Date().toISOString().replace(/[:.]/g,'-')}`);
const labels={Vereinsprofil:'Club profile',Finanzen:'Finances',Sponsor:'Sponsor','Chronik & Erfolge':'History & honours',Managerlaufbahn:'Manager career',Vereinsbereiche:'Club sections','Noch kein Sponsor gewählt.':'No sponsor selected yet.','Sponsor auswählen':'Choose sponsor','Vereinsfinanzen nicht verfügbar.':'Club finances unavailable.','Managerlaufbahn nicht verfügbar.':'Manager career unavailable.'};
(async()=>{
 const before=hashes();fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const errors=[],checks=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><main id="v61-world-screen"><div class="fl-shell" data-fl-theme="light" style="display:block"><div class="fl-content" id="content"></div></div></main></body></html>');
  for(const file of files){const source=fs.readFileSync(path.join(base,file),'utf8');if(file.endsWith('.css'))await page.addStyleTag({content:source});else await page.addScriptTag({content:source});}
  await page.evaluate(()=>{
   content.innerHTML=flClubMarkup;
   const panel=document.querySelector('[data-v46-view="club"]');panel.insertAdjacentHTML('afterbegin','<h2 class="v46-view-heading">Verein</h2>');
   flClubFixture.club.activeSection='profile';flClubFixture.club.sponsorHTML='<section class="v66-sponsors"><h3>Sponsor · Saison 2</h3><p>Native fixture sponsor contract · 750 Credits</p></section>';
   window.language='de';window.labels={};window.sectionsChanged=[];window.navigation=[];window.nativeCount=0;
   window.originalKit=panel.querySelector('[data-v81-save-patterns]');originalKit.addEventListener('click',()=>nativeCount++);
   window.originalFilter=panel.querySelector('[data-v74-transfer-year]');window.originalFinance=panel.querySelector('.v66-finance');window.originalManager=panel.querySelector('.v67-manager');window.originalHonours=panel.querySelector('.v68-profile-grid > .v62-season:nth-child(2)');
   window.actions={t:s=>language==='en'?(labels[s]||s):s,setClubSection:section=>{flClubFixture.club.activeSection=section;sectionsChanged.push(section)},navigate:(...args)=>navigation.push(args)};
   window.refresh=()=>D6Flutlicht.registry.enhance(content,flClubFixture,actions);refresh();refresh();
  });
  const own=page.locator('[data-v46-view="club"]'),tabs=own.locator('.fl-club-tabs [role=tab]');
  assert.equal(await tabs.count(),5);assert.equal(await page.locator('[data-v68-detail] .fl-club-tabs').count(),0,'foreign club and coach cannot expose own tabs');
  assert.deepEqual(await tabs.allTextContents(),['Vereinsprofil','Finanzen','Sponsor','Chronik & Erfolge','Managerlaufbahn']);
  assert.equal(await own.locator('[data-fl-club-section]:visible').getAttribute('data-fl-club-section'),'profile');
  await own.locator('[data-v81-pattern]').selectOption({label:'Einfarbig'});
  await own.locator('[data-fl-club-tab=history]').click();await own.locator('[data-v74-transfer-year]').selectOption('1');
  const former=own.locator('.fl-club-records [data-v68-player=former]').first();await former.focus();
  await page.evaluate(()=>{window.focused=document.activeElement;refresh()});assert.equal(await page.evaluate(()=>document.activeElement===focused),true,'unchanged refresh must preserve focused historical profile');
  await own.locator('[data-fl-club-tab=finances]').click();assert.equal(await own.locator('.v66-finance').isVisible(),true);assert.equal(await own.locator('.v61-club-hero').isVisible(),false);
  await own.locator('[data-fl-club-tab=sponsor]').click();assert.equal(await own.locator('.fl-club-sponsor-content .v66-sponsors').isVisible(),true);
  await own.locator('[data-fl-club-tab=manager]').click();assert.equal(await own.locator('.v67-manager').isVisible(),true);
  await own.locator('[data-fl-club-tab=profile]').click();assert.equal(await own.locator('[data-v81-pattern]').inputValue(),'Einfarbig');await own.locator('[data-v81-save-patterns]').click();
  assert.equal(await page.evaluate(()=>nativeCount),1);assert.equal(await page.evaluate(()=>originalKit===document.querySelector('[data-v81-save-patterns]')&&originalFilter===document.querySelector('[data-v74-transfer-year]')&&originalFinance===document.querySelector('.v66-finance')&&originalManager===document.querySelector('.v67-manager')),true,'controller-owned nodes must not be cloned or replaced');
  assert.equal(await own.locator('[data-v81-save-colors]').isDisabled(),true);
  await own.locator('[data-fl-club-tab=history]').click();assert.equal(await own.locator('[data-v74-transfer-year]').inputValue(),'1');assert.equal(await page.evaluate(()=>originalHonours.parentElement.dataset.flClubSection),'history');
  await own.locator('[data-fl-club-tab=profile]').click();assert.equal(await page.evaluate(()=>originalHonours.parentElement.className),'v68-profile-grid');
  await own.locator('[data-fl-club-tab=profile]').focus();await page.keyboard.press('ArrowRight');assert.equal(await own.getAttribute('data-fl-club-active'),'finances');assert.equal(await tabs.locator('[aria-selected=true]').count(),0);
  assert.equal(await own.locator('[data-fl-club-tab=finances]').getAttribute('aria-selected'),'true');assert.equal(await page.evaluate(()=>document.activeElement.dataset.flClubTab),'finances');
  await page.keyboard.press('End');assert.equal(await own.getAttribute('data-fl-club-active'),'manager');await page.keyboard.press('Home');assert.equal(await own.getAttribute('data-fl-club-active'),'profile');await page.keyboard.press('ArrowLeft');assert.equal(await own.getAttribute('data-fl-club-active'),'manager');
  await page.evaluate(()=>{flClubFixture.club.activeSection='finances';refresh()});assert.equal(await own.getAttribute('data-fl-club-active'),'finances','external navigation/history controls tab');
  for(const width of [320,390,768,1440])for(const theme of ['light','dark'])for(const language of ['de','en']){
   await page.setViewportSize({width,height:1000});await page.evaluate(({theme,language,labels})=>{document.querySelector('.fl-shell').dataset.flTheme=theme;window.language=language;window.labels=labels;refresh()},{theme,language,labels});
   for(const section of ['profile','finances','sponsor','history','manager']){
    await own.locator(`[data-fl-club-tab=${section}]`).click();const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,visible:[...document.querySelectorAll('[data-v46-view=club] [data-fl-club-section]')].filter(p=>!p.hidden).length,minHeight:Math.min(...[...document.querySelectorAll('.fl-club-tabs [role=tab]')].map(b=>b.getBoundingClientRect().height))}));
    assert.equal(result.overflow,false,`${width}/${theme}/${language}/${section}`);assert.equal(result.visible,1);assert.ok(result.minHeight>=44);checks.push({width,theme,language,section,...result});
   }
   if([390,1440].includes(width)&&language==='de'){await own.locator('[data-fl-club-tab=profile]').click();await page.screenshot({path:path.join(out,`profile-${width}-${theme}.png`),fullPage:true});}
  }
  await page.evaluate(()=>{flClubFixture.club.activeSection='sponsor';flClubFixture.club.sponsorHTML=null;language='en';refresh()});assert.equal(await own.locator('[data-fl-club-sponsor-select]').textContent(),'Choose sponsor');await own.locator('[data-fl-club-sponsor-select]').click();assert.deepEqual(await page.evaluate(()=>navigation.at(-1)),['overview',{section:'sponsor'}]);
  await page.evaluate(()=>{const panel=document.querySelector('[data-v46-view=club]');D6Flutlicht.clubView.select(panel,'history',{focus:true})});assert.equal(await own.getAttribute('data-fl-club-active'),'history');assert.equal(await page.evaluate(()=>document.activeElement.dataset.flClubTab),'history');
  assert.equal(await own.locator('.fl-club-records').count(),1);assert.equal(await own.locator('.fl-club-last-lineup').count(),1);assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'scoped sources changed during fixture checks');
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({passed:true,checks,assertions:['five own-club destinations','foreign profiles do not expose own sponsor/finance','one visible panel with labelled tabs','native node identities, handlers, filters and kit values preserved','titles reachable in profile and history without clones','keyboard arrows/Home/End wrap and focus','external navigation/history tab selection','translated tab labels and empty sponsor action','44px targets and no overflow','no game model touched by view'],limitations:['sanitized view fixtures; real controller and browser-history integration owned by root','no physical device/Safari/screen-reader verification'],hashes:before},null,2));console.log(out);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
