'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../../serve.cjs');
const base=path.resolve(__dirname,'../../../..');
const files=['index.html','ui-flutlicht/adapter.js','ui-flutlicht/registry.js','ui-flutlicht/components.js','ui-flutlicht/components.css','ui-flutlicht/views/squad.js','ui-flutlicht/views/squad.css','world-foundation-v61.js','world-views-v68.js','world-market-ui-v66.js','world-youth-ui-v67.js','i18n-v75.js'];
const hashes=()=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'dist',file))).digest('hex')]));
const out=path.join(base,'outputs/ui-redesign/U01-B',`source-${new Date().toISOString().replace(/[:.]/g,'-')}`);
(async()=>{
 const before=hashes();fs.mkdirSync(out,{recursive:true});const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const errors=[],checks=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html`);
  await page.evaluate(async()=>{v61CurrentCareer=await v61StoreNewCareer(v61CreateCareer('GER-2','fl-squad-source','Fixture Manager'));v61RenderCareer(v61CurrentCareer);v61SetCareerTab('squad',false)});
  await page.locator('.fl-squad-tools').waitFor();
  const count=await page.locator('.fl-squad-table tbody tr').count();assert.equal(count,11);assert.equal(await page.locator('.fl-squad-player-detail').count(),count);
  const original=await page.evaluate(()=>JSON.stringify(v61CurrentCareer));
  await page.locator('[data-v61-roster-sort="age"]').click();const ages=await page.locator('.fl-squad-table tbody tr').evaluateAll(rows=>rows.map(r=>Number(r.dataset.age)));assert.deepEqual(ages,[...ages].sort((a,b)=>a-b));
  await page.locator('[data-fl-squad-position]').selectOption('gk');assert.equal(await page.locator('.fl-squad-table tbody tr:visible').count(),1);
  await page.evaluate(()=>D6Flutlicht.adapter.refresh());assert.equal(await page.locator('[data-fl-squad-position]').inputValue(),'gk');
  await page.locator('.fl-squad-table tbody tr:visible [data-v61-player]').click();await page.locator('dialog.fl-squad-profile[open]').waitFor();
  assert.equal(await page.locator('dialog.fl-squad-profile[open] .fl-squad-profile-skills .fl-skill').count(),9);
  assert.equal(await page.locator('dialog.fl-squad-profile[open] [data-v127-season-stats]').count(),1);
  await page.locator('dialog.fl-squad-profile[open] [data-v74-profile-tab="career"]').click();assert.equal(await page.locator('dialog.fl-squad-profile[open] [data-v74-profile-panel="career"]').isVisible(),true);
  await page.locator('dialog.fl-squad-profile[open] [data-v61-close]').click();
  await page.locator('[data-fl-squad-position]').selectOption('all');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,`source overflow ${width}`);
   checks.push({width,overflow});if([390,1440].includes(width))await page.screenshot({path:path.join(out,`squad-${width}.png`),fullPage:true});
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(v61CurrentCareer)),original,'view/filter/profile changed career');
  await page.evaluate(()=>{window.doppel6Language.set('en');D6Flutlicht.adapter.refresh()});assert.equal(await page.locator('.fl-squad-player-detail').count(),count);
  const abilityLeaks=await page.locator('.fl-skill').evaluateAll(nodes=>nodes.filter(n=>/\d/.test(n.getAttribute('aria-label')||'')).length);assert.equal(abilityLeaks,0);
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'relevant source changed during check');
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({passed:true,checks,assertions:['11 native roster rows','native age sorting','filter and refresh retention','native own goalkeeper profile','all nine qualitative keeper skills','native stats/career tab/close','unchanged career JSON after view interactions','language refresh no duplicated enhancements','no numeric ability labels','no runtime errors','stable relevant source hashes'],limitations:['No completed-match fixture or saved career reload here; I00 covers save/reload','No physical hardware, Safari, or screen-reader evidence'],hashes:before},null,2));console.log(out);
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
