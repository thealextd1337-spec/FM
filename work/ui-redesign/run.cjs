'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),os=require('node:os');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const r=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename,...process.argv.slice(2)],{stdio:'inherit'});process.exit(r.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('./serve.cjs');
const args=process.argv.slice(2),arg=(name,fallback)=>args[args.indexOf(name)+1]||fallback,target=arg('--target','fixture'),pkg=arg('--package','I00'),base=path.resolve(__dirname,'../..');
const files=()=>fs.readdirSync(path.join(base,'dist'),{recursive:true}).filter(f=>/\.(js|css|html)$/.test(f)).sort();
const hashes=()=>Object.fromEntries(files().map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'dist',f))).digest('hex')]));
(async()=>{const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const before=hashes(),out=path.join(base,'outputs/ui-redesign',pkg,new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),errors=[];
 try{const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));await page.goto(target==='build'?require('node:url').pathToFileURL(path.join(base,'outputs/index.html')).href:`http://127.0.0.1:${server.address().port}/${target==='source'?'source/index.html':''}`);
 if(target!=='fixture')await page.evaluate(async()=>{v61CurrentCareer=await v61StoreNewCareer(v61CreateCareer('GER-2','flutlicht-smoke','Testmanager'));v61RenderCareer(v61CurrentCareer);});
 await page.locator('.fl-shell').waitFor();assert.equal(await page.locator('.fl-shell').count(),1);await page.locator('[data-fl-menu]').click();assert.equal(await page.locator('.fl-menu-panel').evaluate(n=>n.open),true);await page.keyboard.press('Escape');
 const checks=['one shell','menu opens'];
 if(target!=='fixture'){
  const selected=await page.locator('[data-v66-sponsor]').first().getAttribute('data-v66-sponsor');await page.locator('[data-v66-sponsor]').first().click();
  await page.waitForFunction(()=>!!v66Own(v61CurrentCareer).sponsorId);await page.evaluate(()=>v61WaitForStorage());
  const saved=await page.evaluate(()=>({id:v61CurrentCareer.id,sponsor:v66Own(v61CurrentCareer).sponsorId,balance:v66Own(v61CurrentCareer).balance,entries:v66Own(v61CurrentCareer).ledger.length}));assert.equal(saved.sponsor,selected);
  await page.reload();await page.locator(`[data-v61-open="${saved.id}"]`).click();await page.locator('.fl-shell').waitFor();const restored=await page.evaluate(()=>({id:v61CurrentCareer.id,sponsor:v66Own(v61CurrentCareer).sponsorId,balance:v66Own(v61CurrentCareer).balance,entries:v66Own(v61CurrentCareer).ledger.length}));assert.deepEqual(restored,saved);checks.push('sponsor DOM action','storage completion','reload preserves balance and single booking');
 }
 await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,'horizontal overflow');assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before,'source changed during test');fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({target,pkg,checks:[...checks,'no horizontal overflow','no runtime errors','stable hashes'],hashes:before},null,2));console.log(out);
 }finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
