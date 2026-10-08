'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../../../..'),runtime='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node';
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('../../serve.cjs');
(async()=>{
 const out=path.join(base,'outputs/ui-redesign/U01-A','feedback-source-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage({viewport:{width:1440,height:956}}),errors=[],cases=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html`);await page.waitForFunction(()=>typeof v61CreateCareer==='function');
  await page.evaluate(async()=>{v61CurrentCareer=await v61StoreNewCareer(v61CreateCareer('ENG-1','u01-a-feedback-source','Übersichtstest'));v61RenderCareer(v61CurrentCareer);});
  await page.locator('[data-v66-sponsor]').first().click();await page.waitForFunction(()=>v61CurrentCareer.world.market.phase!=='sponsor');
  if(await page.locator('[data-v124-budget]').count()){await page.locator('[data-v124-budget]').click();await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='open');}
  await page.locator('.fl-overview-kpis').waitFor();
  const projection=await page.evaluate(()=>{const career=v61CurrentCareer,own=v66Own(career),before=JSON.stringify(career),data=D6Flutlicht.adapter.project(career).overview;D6Flutlicht.adapter.refresh();D6Flutlicht.adapter.refresh();return{data,balance:own.balance,roster:own.roster.length,plan:v124FinancePlan(career,own.id),unchanged:before===JSON.stringify(career)};});
  assert.equal(projection.unchanged,true);assert.equal(projection.data.kpis.length,4);assert.equal(projection.data.kpis[3].value,String(projection.roster));
  assert.equal(projection.data.finance.rows.length,4);assert.ok(projection.data.finance.balanceLabel.includes(String(projection.balance).replace(/\B(?=(\d{3})+(?!\d))/g,'.')));
  for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:956});await page.emulateMedia({colorScheme:theme});await page.evaluate(()=>{v61SetCareerTab('overview');D6Flutlicht.adapter.refresh();});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`source overflow ${width}/${theme}`);
   assert.equal(await page.locator('.fl-overview-office').isVisible(),true);assert.equal(await page.locator('.fl-overview-finance').isVisible(),true);
   cases.push({width,theme,passed:true});if([390,1440].includes(width))await page.screenshot({path:path.join(out,`overview-${width}-${theme}.png`),fullPage:true,animations:'disabled'});
  }
  await page.setViewportSize({width:1440,height:956});await page.emulateMedia({colorScheme:'dark'});
  await page.locator('.fl-overview-section-head button').click();assert.equal(await page.evaluate(()=>v61CareerTab),'club');assert.equal(await page.locator('[data-fl-club-active="finances"]').count(),1);
  const audit=[];
  for(const route of ['squad','matchplan','transfers','competition','calendar','statistics','club','settings']){
   await page.setViewportSize({width:1440,height:956});await page.emulateMedia({colorScheme:'dark'});await page.locator(`.fl-sidebar [data-fl-route="${route}"]`).click();await page.evaluate(()=>window.scrollTo(0,0));
   audit.push(await page.evaluate(route=>{const root=document.querySelector(`[data-v46-view="${route}"]`);return{route,overflow:document.documentElement.scrollWidth>innerWidth,tabs:root?[...root.querySelectorAll('[role="tab"],.fl-subnav button')].map(n=>n.textContent.trim()):[],headings:root?[...root.querySelectorAll('h2,h3')].filter(n=>n.getClientRects().length).slice(0,12).map(n=>({text:n.textContent.trim(),selector:n.className,color:getComputedStyle(n).color,font:getComputedStyle(n).fontFamily})):[]};},route));
   await page.screenshot({path:path.join(out,`audit-${route}-1440-dark.png`),fullPage:true,animations:'disabled'});
   await page.screenshot({path:path.join(out,`audit-${route}-1440-dark-top.png`),animations:'disabled'});
   for(const theme of ['light','dark']){await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:theme});await page.evaluate(()=>window.scrollTo(0,0));audit.push({route,width:390,theme,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await page.screenshot({path:path.join(out,`audit-${route}-390-${theme}-top.png`),animations:'disabled'});}
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({target:'isolated source',cases,projection,checks:['projected KPI/finance equal native controller data','refresh unchanged career','office/finance present at 4 widths × 2 themes','finance link reaches real club finance tab'],audit,errors},null,2));console.log(out);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
