'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'../../../..'),runtime='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node';
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('../../serve.cjs'),{fixture}=require('./fixtures.cjs');
const files=['tokens.css','components.css','components.js','shell.js','registry.js','views/competitions.js','views/competitions.css'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'dist/ui-flutlicht',f))).digest('hex')]));
(async()=>{
 const before=hashes(),out=path.join(base,'outputs/ui-redesign/U01-D',new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage(),errors=[],cases=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  for(const file of ['world-start-v61.css','world-economy-v66.css','world-youth-v67.css','world-views-v68.css','ui-flutlicht/tokens.css','ui-flutlicht/components.css','ui-flutlicht/views/competitions.css'])await page.addStyleTag({path:path.join(base,'dist',file)});
  for(const file of ['registry.js','views/competitions.js'])await page.addScriptTag({path:path.join(base,'dist/ui-flutlicht',file)});
  async function render(lang,theme,kind='full'){
   await page.evaluate(({data,theme})=>{
    D6Flutlicht.registry.dispose(fixtureShell.content);fixtureShell.content.innerHTML=data.html;fixtureShell.content.closest('.fl-shell').id='v61-world-screen';fixtureShell.update({...FL_FIXTURE.frame,themePreference:theme});
    window.testData=data;window.testCalls={open:0,close:0,profile:0};window.testActions={t:text=>data.translations[text]||text,openReport:id=>{testCalls.open++;data.competitions.report=data.report;D6Flutlicht.registry.enhance(fixtureShell.content,data,testActions);},closeReport:()=>{testCalls.close++;data.competitions.report=null;D6Flutlicht.registry.enhance(fixtureShell.content,data,testActions);},openPlayer:()=>testCalls.profile++};
    window.nativeNodes=[...fixtureShell.content.querySelectorAll('[data-v62-season-choice],[data-v62-area],[data-v62-cup-slide],[data-v68-club]')];D6Flutlicht.registry.enhance(fixtureShell.content,data,testActions);
   },{data:fixture(lang,kind),theme});
  }
  for(const width of [320,390,768,1280])for(const theme of ['light','dark'])for(const lang of ['de','en']){
   await page.setViewportSize({width,height:width===768?390:900});await render(lang,theme);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}/${theme}/${lang}`);
   assert.equal(await page.locator('[data-v46-view="competition"] thead th').count(),9);assert.equal(await page.locator('[data-v46-view="overview"] thead th').count(),5);
   assert.equal(await page.locator('[data-v46-view="competition"] tbody tr').count(),6);assert.equal(await page.locator('[data-v46-view="competition"] tbody tr').first().locator('[data-fl-competition-column="wins"]').textContent(),'1');assert.equal(await page.locator('.v46-stat-category').count(),6);
   await page.evaluate(()=>D6Flutlicht.registry.enhance(fixtureShell.content,testData,testActions));assert.equal(await page.locator('[data-v46-view="competition"] thead th').count(),9);assert.equal(await page.evaluate(()=>nativeNodes.every(n=>n.isConnected)),true);
   await page.locator('[data-v46-view="calendar"] [data-fl-report-open]').click();await page.locator('.fl-competition-report[open]').waitFor();assert.equal(await page.locator('.fl-competition-report h3').count(),6);
   assert.equal(await page.evaluate(()=>{const d=document.querySelector('.fl-competition-report');return d.scrollWidth>d.clientWidth;}),false);
   if((width===390||width===1280)&&lang==='en')await page.screenshot({path:path.join(out,`report-${width}-${theme}.png`),animations:'disabled'});
   await page.locator('[data-fl-report-player]').first().click();assert.equal(await page.evaluate(()=>testCalls.profile),1);
   await page.keyboard.press('Escape');assert.equal(await page.locator('.fl-competition-report[open]').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.matches('[data-fl-report-open]')),true);assert.equal(await page.evaluate(()=>testCalls.close),1);
   cases.push({width,theme,lang,kind:'full',passed:true});
  }
  for(const kind of ['archive','empty']){await render('en','light',kind);await page.locator('[data-fl-report-open]').first().click();assert.equal(await page.locator('.fl-competition-missing').count(),4);assert.equal(await page.locator('.fl-competition-report [data-fl-report-player]').count()>0,true);if(kind==='empty')assert.match(await page.locator('.fl-competition-report').textContent(),/No substitutions/);await page.locator('[data-fl-report-close]').first().click();cases.push({kind,passed:true});}
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'source changed during test');fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({target:'fixture',cases,checks:['all 6 clubs and 6 categories','full competition columns and compact overview','idempotency/native nodes','report open/profile/close/Escape/focus','null data explicit','no page or dialog overflow','stable hashes'],hashes:before},null,2));console.log(out);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
