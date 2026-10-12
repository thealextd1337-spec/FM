'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const result=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename],{stdio:'inherit'});process.exit(result.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('./ui-redesign/serve.cjs');
const expected={version:1,fieldSize:'standard',fieldPlayers:5},out='outputs/career-start-defaults';
(async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 fs.mkdirSync(out,{recursive:true});const results=[];
 try{
  for(const target of ['source','build']){
   const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(target==='source'?`http://127.0.0.1:${server.address().port}/source/index.html`:require('node:url').pathToFileURL(path.resolve('outputs/index.html')).href);
   await page.waitForFunction(()=>v61StorageReady);
   await page.evaluate(()=>{window.doppel6Language.set('de');v61Begin();});
   assert.equal(await page.locator('#v160-field-size,#v160-field-players,#v172-field,#v172-players').count(),0);
   await page.locator('#v172-name').fill('Start QA');
   await page.locator('[data-v172-start="name"]').click();
   await page.locator('[data-v172-start="back"]').click();
   assert.equal(await page.locator('#v172-name').inputValue(),'Start QA');
   assert.equal(await page.locator('#v172-field,#v172-players').count(),0);
   await page.screenshot({path:`${out}/${target}-mobile-manager.png`,fullPage:true});
   await page.locator('[data-v172-start="name"]').click();
   await page.locator('[data-v172-country="GER"]').click();
   await page.locator('[data-v172-club="GER-2"]').click();
   await page.locator('[data-v172-start="create"]').waitFor();
   assert.match(await page.locator('.v172-start').innerText(),/Standardfeldgröße · 5 Feldspieler plus Torwart/);
   assert.deepEqual(await page.evaluate(()=>v172Flow.preview.world.matchConfig),expected);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`${out}/${target}-mobile-summary.png`,fullPage:true});
   await page.evaluate(()=>window.doppel6Language.set('en'));
   assert.match(await page.locator('.v172-start').innerText(),/Standard pitch size · 5 outfield players plus goalkeeper/);
   await page.setViewportSize({width:1280,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`${out}/${target}-desktop-summary-en.png`,fullPage:true});
   await page.locator('[data-v172-start="create"]').click();
   await page.waitForFunction(()=>!!v61CurrentCareer&&v172Flow===null);
   const saved=await page.evaluate(async()=>{await v61WaitForStorage();const career=v61CurrentCareer,exported=await v61ExportCareerData(career.id);return{id:career.id,config:career.world.matchConfig,exported:exported.save.world.matchConfig};});
   assert.deepEqual(saved.config,expected);assert.deepEqual(saved.exported,expected);
   await page.reload();
   await page.locator(`[data-v61-open="${saved.id}"]`).click();
   await page.waitForFunction(()=>!!v61CurrentCareer);
   assert.deepEqual(await page.evaluate(()=>v61CurrentCareer.world.matchConfig),expected);
   assert.deepEqual(errors,[]);
   results.push({target,pass:true,checks:['selectors absent','back navigation','DE/EN summary','mobile/desktop overflow','actual start','storage/export','reload'],config:saved.config});
   await context.close();
  }
  fs.writeFileSync(`${out}/checks.json`,JSON.stringify({pass:true,results},null,2)+'\n');
  console.log(JSON.stringify({pass:true,results}));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
