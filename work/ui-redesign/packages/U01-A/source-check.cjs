'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'../../../..'),runtime='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node';
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('../../serve.cjs');
const relevant=['index.html','ui-flutlicht/overview.js','ui-flutlicht/adapter.js','ui-flutlicht/tokens.css','ui-flutlicht/components.css','ui-flutlicht/components.js','ui-flutlicht/shell.js','ui-flutlicht/views/overview.js','ui-flutlicht/views/overview.css'].filter(f=>fs.existsSync(path.join(base,'dist',f)));
const hashes=()=>Object.fromEntries(relevant.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'dist',f))).digest('hex')]));
(async()=>{
 const before=hashes(),out=path.join(base,'outputs/ui-redesign/U01-A','source-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html`);await page.waitForFunction(()=>typeof v61CreateCareer==='function');
  await page.evaluate(async()=>{v61CurrentCareer=await v61StoreNewCareer(v61CreateCareer('GER-2','u01-a-source-fixture','Übersichtstest'));v61RenderCareer(v61CurrentCareer);});
  await page.locator('.fl-overview').waitFor();assert.equal(await page.locator('[data-v66-sponsor]').count(),3);
  await page.screenshot({path:path.join(out,'sponsor-choice.png'),fullPage:true,animations:'disabled'});
  await page.locator('[data-v66-sponsor]').first().click();await page.waitForFunction(()=>v61CurrentCareer.world.market.phase!=='sponsor');
  if(await page.locator('[data-v124-budget]').count()){await page.locator('[data-v124-budget]').click();await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='open');}
  await page.locator('.fl-overview-fixture').waitFor();
  const state=await page.evaluate(()=>{const c=v61CurrentCareer,before=JSON.stringify(c),own=v66Own(c),s=own.sponsors.find(s=>s.id===own.sponsorId);D6Flutlicht.adapter.refresh();D6Flutlicht.adapter.refresh();return{unchanged:before===JSON.stringify(c),fixed:own.ledger.filter(r=>r.id===s.id+':fixed').length,sponsor:s.id,goals:D6Flutlicht.adapter.project(c).overview.sponsor.goals};});
  assert.equal(state.unchanged,true);assert.equal(state.fixed,1);assert.equal(await page.locator('.fl-overview-center').count(),1);
  for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`source overflow ${width}`);if(width===390||width===1280)await page.screenshot({path:path.join(out,`overview-${width}.png`),fullPage:true,animations:'disabled'});}
  await page.locator('.fl-overview-team-crest').last().click();await page.locator('[data-v68-back]').waitFor();await page.locator('[data-v68-back]').click();await page.locator('.fl-overview-fixture').waitFor();
  await page.locator('.fl-overview-sponsor').click();assert.equal(await page.evaluate(()=>location.hash),'#fl-overview-contract');
  assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'source changed during source run');
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({target:'source',checks:['three real sponsor offers','native sponsor choice and funding','exactly one fixed-fee booking','refresh does not mutate career','four viewport widths','opponent profile and return','contract anchor'],state,errors,hashes:before},null,2));console.log(out);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
