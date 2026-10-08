'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'../../../..'),runtime='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node';
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('../../serve.cjs'),{fixture}=require('./fixtures.cjs');
const relevant=['tokens.css','components.css','components.js','shell.js','registry.js','views/overview.js','views/overview.css'].map(f=>'dist/ui-flutlicht/'+f);
const hashes=()=>Object.fromEntries(relevant.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,f))).digest('hex')]));
(async()=>{
 const before=hashes(),out=path.join(base,'outputs/ui-redesign/U01-A',new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const page=await browser.newPage(),errors=[],cases=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  for(const file of ['world-start-v61.css','world-economy-v66.css','world-youth-v67.css','world-views-v68.css','ui-flutlicht/tokens.css','ui-flutlicht/components.css','ui-flutlicht/views/overview.css'])await page.addStyleTag({path:path.join(base,'dist',file)});
  await page.addScriptTag({path:path.join(base,'dist/ui-flutlicht/registry.js')});await page.addScriptTag({path:path.join(base,'dist/ui-flutlicht/views/overview.js')});
  async function render(language,theme,status){
   await page.evaluate(({data,theme})=>{
    fixtureShell.content.innerHTML=data.html;fixtureShell.content.closest('.fl-shell').id='v61-world-screen';
    fixtureShell.update({...FL_FIXTURE.frame,themePreference:theme});
    window.testData=data;window.testActions={t:text=>data.translations[text]||text};
    window.keptButtons=[...fixtureShell.content.querySelectorAll('[data-v68-club],[data-v67-review-next],[data-v124-budget]')];
    D6Flutlicht.registry.enhance(fixtureShell.content,{overview:data.overview},testActions);
   },{data:fixture(language,status),theme});
  }
  for(const width of [320,390,768,1280])for(const theme of ['light','dark'])for(const language of ['de','en']){
   await page.setViewportSize({width,height:width===768?390:900});await render(language,theme,'track');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}/${theme}/${language}`);
   assert.equal(await page.locator('.fl-overview-results .fl-result').count(),7);assert.equal(await page.locator('tbody tr').count(),6);
   assert.equal(await page.evaluate(()=>keptButtons.every(n=>n.isConnected)),true);
   await page.evaluate(()=>D6Flutlicht.registry.enhance(fixtureShell.content,{overview:testData.overview},testActions));
   assert.equal(await page.locator('.fl-overview-center').count(),1);assert.equal(await page.locator('.fl-overview-goal').count(),2);assert.equal(await page.locator('.fl-overview-team-crest').count(),2);
   assert.equal(await page.locator('.v62-first-leg-score').textContent(),language==='en'?'First leg1 : 0':'Hinspiel1 : 0');
   cases.push({width,theme,language,status:'track',passed:true});
   if((width===390||width===1280)&&language==='de')await page.screenshot({path:path.join(out,`${width}-${theme}.png`),fullPage:true,animations:'disabled'});
  }
  await page.setViewportSize({width:390,height:844});
  for(const status of ['open','achieved','paid','unknown','missing']){
   await render('en','dark',status);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const first=page.locator('.fl-overview-goal').first();
   if(status==='open')assert.match(await first.textContent(),/Target open/);
   if(status==='achieved')assert.match(await first.textContent(),/Achieved.*Not paid yet/s);
   if(status==='paid')assert.match(await page.locator('.fl-overview-goal').nth(1).textContent(),/Achieved.*Already paid/s);
   if(status==='unknown')assert.match(await first.textContent(),/Status not recorded.*Payment status not recorded/s);
   if(status==='missing')assert.equal(await page.locator('.fl-overview-team').first().locator('.fl-result').count(),0);
   cases.push({width:390,theme:'dark',language:'en',status,passed:true});
  }
  const result=page.locator('.fl-result').first();await result.focus();await page.locator('.fl-tooltip:not([hidden])').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('.fl-tooltip:not([hidden])').count(),0);
  await result.evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
  const box=await result.boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.locator('.fl-tooltip:not([hidden])').waitFor();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);assert.equal(await page.locator('.fl-tooltip:not([hidden])').count(),0);
  await page.locator('.fl-overview-goal').first().click();assert.equal(await page.evaluate(()=>location.hash),'#fl-overview-contract');
  await page.evaluate(()=>document.querySelector('.fl-overview').classList.add('v67-showing'));assert.equal(await page.locator('#v67-season-show').isVisible(),true);assert.equal(await page.locator('.fl-overview-fixture').isVisible(),false);
  await page.evaluate(()=>{const v=document.querySelector('.fl-overview');v.classList.remove('v67-showing');v.classList.add('v130-showing-close');});assert.equal(await page.locator('#v124-budget').isVisible(),true);assert.equal(await page.locator('.fl-overview-fixture').isVisible(),false);
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'relevant source changed during run');
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({target:'fixture',cases,checks:['idempotency','native actions connected','six table rows retained','first-leg score retained','sponsor payment independent','missing results unpadded','tooltip focus/Escape/tap/toggle','contract anchor','review and finance phase hiding','stable source hashes'],errors,hashes:before},null,2));console.log(out);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
