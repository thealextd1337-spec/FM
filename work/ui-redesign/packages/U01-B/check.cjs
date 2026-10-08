'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=path.resolve(__dirname,'../../../..');
const files=['dist/ui-flutlicht/tokens.css','dist/ui-flutlicht/components.css','dist/ui-flutlicht/components.js','dist/ui-flutlicht/registry.js','dist/ui-flutlicht/views/squad.css','dist/ui-flutlicht/views/squad.js','work/ui-redesign/packages/U01-B/fixture.js'];
const hashes=()=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,file))).digest('hex')]));
const out=path.join(base,'outputs/ui-redesign/U01-B',new Date().toISOString().replace(/[:.]/g,'-'));
(async()=>{
 const before=hashes();fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const results=[],errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><main id="v61-world-screen"><div class="fl-shell" data-fl-theme="light" style="display:block"><div class="fl-content" id="content"></div></div></main><dialog class="fl-dialog" data-fl-theme="light" data-fl-player-id="fixture-former"></dialog></body></html>');
  await page.addStyleTag({content:fs.readFileSync(path.join(base,'dist/world-start-v61.css'),'utf8')});
  for(const file of files){const content=fs.readFileSync(path.join(base,file),'utf8');if(file.endsWith('.css'))await page.addStyleTag({content});else await page.addScriptTag({content});}
  await page.evaluate(()=>{
   content.innerHTML=flSquadMarkup;document.querySelector('dialog').innerHTML=flSquadProfileMarkup;
   window.nativeClicks=0;document.querySelector('[data-native-contract]').addEventListener('click',()=>nativeClicks++);
   window.savedProfileButton=document.querySelector('[data-v61-player]');savedProfileButton.addEventListener('click',()=>{document.querySelector('dialog').showModal();refresh()});
   document.querySelector('[data-v61-close]').onclick=()=>document.querySelector('dialog').close();
   document.querySelector('[data-v74-profile-tab="career"]').onclick=()=>{document.querySelector('[data-v74-profile-panel="overview"]').hidden=true;document.querySelector('[data-v74-profile-panel="career"]').hidden=false};
   document.querySelector('[data-v74-profile-tab="overview"]').onclick=()=>{document.querySelector('[data-v74-profile-panel="overview"]').hidden=false;document.querySelector('[data-v74-profile-panel="career"]').hidden=true};
   content.addEventListener('click',e=>{const sort=e.target.closest('[data-v61-roster-sort]');if(!sort)return;const body=sort.closest('table').tBodies[0],key=sort.dataset.v61RosterSort;body.append(...[...body.rows].sort((a,b)=>key==='name'?a.dataset.name.localeCompare(b.dataset.name):Number(a.dataset[key])-Number(b.dataset[key])))});
   window.refresh=()=>D6Flutlicht.registry.enhance(content,flSquadFixture,{t:text=>text});refresh();refresh();D6Flutlicht.components.installTooltips(content);
  });
  assert.equal(await page.locator('.fl-squad-tools').count(),1);assert.equal(await page.locator('.fl-squad-player-detail').count(),3);assert.equal(await page.locator('.fl-squad-table tbody tr').count(),3);
  assert.equal(await page.evaluate(()=>savedProfileButton===document.querySelector('[data-v61-player]')),true);
  assert.equal(await page.locator('.fl-squad-skills .fl-skill').count(),18);
  assert.match(await page.locator('tr[data-number="1"] td').nth(3).getAttribute('aria-label'),/nicht erfasst/);
  assert.equal(await page.locator('tr[data-number="11"] td').nth(3).textContent(),'6 (3)');
  await page.locator('tr[data-number="11"] [data-fl-tooltip]').focus();
  await page.evaluate(()=>{window.focusedTip=document.activeElement;window.preservedSkill=document.querySelector('.fl-squad-skills .fl-skill');refresh()});
  assert.equal(await page.evaluate(()=>document.activeElement===focusedTip&&document.querySelector('.fl-squad-skills .fl-skill')===preservedSkill),true);
  assert.equal(await page.locator('.fl-tooltip').isVisible(),true);await page.keyboard.press('Escape');
  await page.locator('[data-fl-squad-search]').fill('frankreich');assert.equal(await page.locator('tbody tr:visible').count(),1);
  await page.evaluate(()=>refresh());assert.equal(await page.locator('[data-fl-squad-search]').inputValue(),'frankreich');
  await page.locator('[data-fl-squad-search]').fill('does not exist');assert.equal(await page.locator('.fl-squad-empty').isVisible(),true);
  await page.locator('[data-fl-squad-search]').fill('');await page.locator('[data-fl-squad-position]').selectOption('gk');assert.equal(await page.locator('tbody tr:visible').count(),1);
  await page.locator('[data-fl-squad-position]').selectOption('all');await page.locator('[data-v61-roster-sort="age"]').click();assert.equal(await page.locator('tbody tr').first().getAttribute('data-number'),'11');
  await page.locator('[data-native-contract]').click();assert.equal(await page.evaluate(()=>nativeClicks),1);
  for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
   await page.evaluate(theme=>document.querySelectorAll('[data-fl-theme]').forEach(n=>n.dataset.flTheme=theme),theme);
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,skills:[...document.querySelectorAll('.fl-squad-skills .fl-skill')].every(n=>n.getClientRects().length>0),sort:[...document.querySelectorAll('[data-v61-roster-sort]')].every(n=>n.getClientRects().length>0)}));
   assert.equal(layout.overflow,false,`${width}/${theme} page overflow`);assert.equal(layout.skills,true);assert.equal(layout.sort,true);results.push({width,theme,...layout});
   if([390,1440].includes(width))await page.screenshot({path:path.join(out,`squad-${width}-${theme}.png`),fullPage:true});
  }
  await page.locator('[data-v61-player="fixture-keeper"]').click();assert.equal(await page.locator('dialog').evaluate(n=>n.open),true);
  assert.equal(await page.locator('.fl-squad-profile-status').count(),1);assert.equal(await page.locator('.fl-squad-profile-skills .fl-skill').count(),8);
  assert.equal(await page.locator('[data-v127-season-stats]').isVisible(),true);assert.equal(await page.locator('[data-native-transfer]').isVisible(),true);
  await page.locator('[data-v74-profile-tab="career"]').click();assert.equal(await page.locator('.v64-player-seasons').isVisible(),true);assert.match(await page.locator('.v74-honour-sections').textContent(),/Man of the Match/);
  await page.locator('[data-v74-profile-tab="overview"]').click();await page.setViewportSize({width:320,height:900});await page.screenshot({path:path.join(out,'profile-mobile.png'),fullPage:true});
  assert.equal(await page.locator('dialog').evaluate(n=>n.scrollWidth>n.clientWidth),false,'profile overflow');
  await page.locator('[data-v61-close]').click();assert.equal(await page.locator('dialog').evaluate(n=>n.open),false);
  const safe=await page.evaluate(()=>[...document.querySelectorAll('.fl-skill')].every(n=>/^(Technik|Passspiel|Abschluss|Zweikampf|Stellungsspiel|Geschwindigkeit|Kondition|Luftspiel|Torwartspiel): (Violettgrau|Blaugrau|Gelb|Orange|Pink|Nicht bekannt)$/.test(n.getAttribute('aria-label'))));assert.equal(safe,true);
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before);
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({passed:true,results,checks:['idempotent enhancement','same original row/button nodes','all skills always visible','native action listener preserved','sort keeps one row per player','nation search and position filter','filter retained on refresh','empty state','complete versus missing substitutions','profile native tabs/statistics/actions/honours preserved','profile mobile overflow','qualitative ability labels only'],limitations:['sanitized fixture, not source/build integration','no physical device or screen-reader proof'],hashes:before},null,2));console.log(out);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
