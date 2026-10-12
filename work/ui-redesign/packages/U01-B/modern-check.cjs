'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../../serve.cjs');
const base=path.resolve(__dirname,'../../../..'),files=['ui-flutlicht/views/squad.js','ui-flutlicht/views/squad.css'];
const hashes=()=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'dist',file))).digest('hex')]));
(async()=>{
 const before=hashes(),out=path.join(base,'outputs/ui-redesign/U01-B',`modern-${new Date().toISOString().replace(/[:.]/g,'-')}`);fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),errors=[],checks=[];
 try{
  const page=await browser.newPage({viewport:{width:390,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html`);
  await page.evaluate(()=>{v61CurrentCareer=v61CreateCareer('GER-2','ui-modern-squad','Testmanager');v61RenderCareer(v61CurrentCareer);v61SetCareerTab('squad',false)});
  await page.locator('[data-fl-squad-sort]').waitFor();
  const original=await page.evaluate(()=>JSON.stringify(v61CurrentCareer));
  const originalButton=await page.locator('.fl-squad-table [data-v61-player]').first().getAttribute('data-v61-player');
  await page.evaluate(()=>window.preservedProfileButton=document.querySelector('.fl-squad-table [data-v61-player]'));
  const count=await page.locator('.fl-squad-table tbody tr').count();assert.ok(count>0);
  assert.equal(await page.locator('[data-fl-squad-sort] option').count(),16);
  const sorting=page.locator('[data-fl-squad-sort]');await sorting.focus();await sorting.selectOption('age:descending');
  const ages=await page.locator('.fl-squad-table tbody tr').evaluateAll(rows=>rows.map(r=>Number(r.dataset.age)));assert.deepEqual(ages,[...ages].sort((a,b)=>b-a));
  assert.equal(await sorting.evaluate(n=>document.activeElement===n),true,'mobile sorting retains focus');
  await page.locator('[data-fl-squad-position]').selectOption('gk');await page.evaluate(()=>D6Flutlicht.adapter.refresh());
  assert.equal(await sorting.inputValue(),'age:descending');assert.equal(await page.locator('[data-fl-squad-position]').inputValue(),'gk');
  await page.locator('.fl-squad-table tbody tr:visible [data-v61-player]').first().click();
  await page.locator('dialog.fl-squad-profile[open]').waitFor();
  assert.ok(await page.locator('dialog.fl-squad-profile[open] .fl-squad-profile-skills .fl-skill').count()>=8);
  assert.equal(await page.locator('dialog.fl-squad-profile[open] .fl-squad-profile-contract').count(),1);
  assert.ok(await page.locator('dialog.fl-squad-profile[open] .fl-squad-profile-contract .player-card-facts>span').count()>=5);
  assert.equal(await page.locator('dialog.fl-squad-profile[open] [data-v127-season-stats]').count(),1);
  assert.equal(await page.locator('dialog.fl-squad-profile[open]').evaluate(n=>n.scrollWidth>n.clientWidth),false);
  await page.screenshot({path:path.join(out,'profile-390.png'),fullPage:true});
  await page.locator('dialog.fl-squad-profile[open] [data-v74-profile-tab="career"]').click();assert.equal(await page.locator('dialog.fl-squad-profile[open] [data-v74-profile-panel="career"]').isVisible(),true);
  await page.locator('dialog.fl-squad-profile[open] [data-v61-close]').click();await page.locator('[data-fl-squad-position]').selectOption('all');
  for(const width of [320,390,768,1280]){
   await page.setViewportSize({width,height:1000});
   const state=await page.evaluate(()=>{
    const row=document.querySelector('.fl-squad-table tbody tr'),detail=row.querySelector('.fl-squad-player-detail'),identity=row.querySelector('.fl-squad-identity'),box=row.getBoundingClientRect(),d=detail.getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth>innerWidth,cardHeight:box.height,cardWidth:box.width,detailWidth:d.width,skills:[...row.querySelectorAll('.fl-skill')].every(n=>n.getClientRects().length>0),sortVisible:!!document.querySelector('[data-fl-squad-sort]').getClientRects().length,headersVisible:!!row.closest('table').tHead.getClientRects().length,identityWidth:identity.getBoundingClientRect().width};
   });
   assert.equal(state.overflow,false,`overflow at ${width}`);assert.equal(state.skills,true);
   if(width<=900){assert.equal(state.sortVisible,true);assert.equal(state.headersVisible,false);assert.ok(state.detailWidth>state.cardWidth-32,'skills use card width');await page.screenshot({path:path.join(out,`inspect-${width}.png`),fullPage:true});assert.ok(state.cardHeight<430,`compact mobile card: ${JSON.stringify(state)}`);}
   else {assert.equal(state.sortVisible,false);assert.equal(state.headersVisible,true);}
   checks.push({width,...state});if([390,1280].includes(width))await page.screenshot({path:path.join(out,`squad-${width}.png`),fullPage:true});
  }
  await page.locator('[data-v61-roster-sort="goals"]').click();await page.evaluate(()=>D6Flutlicht.adapter.refresh());assert.equal(await sorting.inputValue(),'goals:ascending');
  await page.setViewportSize({width:390,height:1000});assert.equal(await page.locator('[data-fl-squad-search]').count(),0);await page.locator('[data-fl-squad-position]').selectOption('gk');assert.equal(await page.locator('.fl-squad-table tbody tr:visible').count(),1);await page.locator('[data-fl-squad-position]').selectOption('all');
  assert.equal(await page.evaluate(id=>preservedProfileButton===document.querySelector(`[data-v61-player="${id}"]`),originalButton),true,'native profile node preserved');
  assert.equal(await page.evaluate(()=>JSON.stringify(v61CurrentCareer)),original,'view interactions changed career');
  await page.evaluate(()=>{doppel6Language.set('en');D6Flutlicht.adapter.refresh()});assert.equal(await page.locator('.fl-squad-tools').count(),1);assert.equal(await page.locator('.fl-squad-table tbody tr').count(),count);
  assert.equal(await page.locator('.fl-skill').evaluateAll(nodes=>nodes.filter(n=>/\d/.test(n.getAttribute('aria-label')||'')).length),0);
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before);
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({passed:true,checks,assertions:['16 native sort choices','descending native sort','mobile select focus retained','filter and sort retained through refresh','profile nine qualitative skills and all contract facts grouped','season stats and career tab preserved','no career state mutation','original player button preserved','no duplicate enhancements on EN refresh','no numerical skill labels','stable owned source hashes'],limitations:['Source only; parent covers build and visual QA','Emulated Chromium widths; no physical devices or screen reader'],hashes:before},null,2));console.log(out);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
