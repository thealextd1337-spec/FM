'use strict';
// Live acceptance for release 134: public bytes equal the local build and a real browser starts the introduction.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const result=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename,...process.argv.slice(2)],{stdio:'inherit'});process.exit(result.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright'));
const site='https://fussball.cakamper.at/',out='outputs/release-r134',sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const files=[['index.html','outputs/index.html'],['unity-match/runtime.html','dist/unity-match/runtime.html'],['unity-match/runtime.js','dist/unity-match/runtime.js'],['unity/probe-build.json','outputs/platform/unity-web/probe-build.json']];
(async()=>{
 fs.mkdirSync(out,{recursive:true});const hashes=[];
 for(const [remote,local] of files){
  const response=await fetch(site+remote+'?live='+Date.now(),{headers:{'Cache-Control':'no-cache'}});assert.ok(response.ok,remote);
  const live=sha(Buffer.from(await response.arrayBuffer())),expected=sha(fs.readFileSync(local));
  assert.equal(live,expected,remote);hashes.push({remote,sha256:live});console.log('PASS live bytes '+remote);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await (await browser.newContext({viewport:{width:1280,height:900}})).newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(site+'?live='+Date.now(),{timeout:180000});await page.waitForFunction(()=>window.v61StorageReady&&window.D6Tutorial,null,{timeout:180000});
  assert.match(await page.locator('footer span').first().textContent(),/PROTOTYP 134/);
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.d6Release),'134');
  await page.evaluate(()=>{window.doppel6Language.set('de');v61Begin();});
  await page.locator('#v172-name').fill('Live QA');await page.locator('[data-v172-start="name"]').click();
  await page.locator('[data-v172-country="GER"]').click();await page.locator('[data-v172-club="GER-2"]').click();
  await page.locator('#v186-optin').check();await page.locator('[data-v172-start="create"]').click();
  await page.waitForFunction(()=>window.D6Tutorial.state()?.chapter==='welcome'&&!!document.querySelector('[data-v186-coach] h2'),null,{timeout:60000});
  const title=await page.locator('[data-v186-coach] h2').textContent();assert.match(title,/^Willkommen beim /);
  await page.screenshot({path:`${out}/live-welcome.png`});
  assert.deepEqual(errors,[]);console.log('PASS live browser shows release 134 and starts the introduction');
  fs.writeFileSync(`${out}/live-check.json`,JSON.stringify({pass:true,site,checkedAt:new Date().toISOString(),hashes,footer:'PROTOTYP 134',introduction:title},null,2)+'\n');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
