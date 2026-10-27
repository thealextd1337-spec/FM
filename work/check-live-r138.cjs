'use strict';
// Live acceptance for release 138: public bytes equal the local build (page, runtime, Unity build per manifest) and an
// isolated browser profile plays the live site in Unity and in 2D, stores the QA career, reloads and continues it.
// Release 138 adds the installed-app files (service worker, manifest, icons, privacy page, Android asset links)
// and an offline restart of the page with its Unity match.
// No personal profile and no real saves: a fresh Playwright context with its own storage.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const result=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename,...process.argv.slice(2)],{stdio:'inherit'});process.exit(result.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright'));
// D6_LIVE_SITE (e.g. http://127.0.0.1:4260/ via work/serve-tree.cjs) only for a dry run of this script before deploying.
const site=process.env.D6_LIVE_SITE||'https://fussball.cakamper.at/',out='outputs/release-r138',sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const manifest=JSON.parse(fs.readFileSync('outputs/platform/unity-web/probe-build.json','utf8'));
const unityFiles=['loaderUrl','dataUrl','frameworkUrl','codeUrl'].map(k=>manifest[k].split('?')[0].replace(/^\//,''));
const files=[['index.html','outputs/index.html'],['unity-match/runtime.html','dist/unity-match/runtime.html'],['unity-match/runtime.js','dist/unity-match/runtime.js'],['unity/probe-build.json','outputs/platform/unity-web/probe-build.json'],...unityFiles.map(f=>[f,'outputs/platform/unity-web/'+f.slice('unity/'.length)]),...JSON.parse(fs.readFileSync('work/app-files.json','utf8')).map(f=>[f,'dist/'+f])];
const helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const hashes=[],report={site,checkedAt:new Date().toISOString()};
 for(const [remote,local] of files){
  const response=await fetch(site+remote+'?live='+Date.now(),{headers:{'Cache-Control':'no-cache'}});assert.ok(response.ok,remote);
  const live=sha(Buffer.from(await response.arrayBuffer())),expected=sha(fs.readFileSync(local));
  assert.equal(live,expected,remote);hashes.push({remote,sha256:live});console.log('PASS live bytes '+remote);
 }
 // Manifest hashes of the Unity build are the ?v= query values.
 for(const k of ['loaderUrl','dataUrl','frameworkUrl','codeUrl']){const file=manifest[k].split('?')[0].replace(/^\//,''),v=manifest[k].split('v=')[1];assert.equal(hashes.find(h=>h.remote===file).sha256,v,'manifest '+k);}
 report.hashes=hashes;console.log('PASS Unity build files match the manifest');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:false,args:['--window-size=1000,620']});
 try{
  const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:3,isMobile:true,hasTouch:true,locale:'de-DE'});
  const open=async()=>{const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(site+'?live='+Date.now()+(site.startsWith('http:')?'&d6sw=1':''),{timeout:180000});
   await page.waitForFunction(()=>typeof v61StorageReady!=='undefined'&&v61StorageReady&&window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&typeof v61CreateCareer==='function',null,{timeout:180000});return {page,errors};};
  const probe=page=>page.evaluate(()=>({phase:v65Context()?.state.phase??null,elapsed:match?.elapsed??null,score:match?[...match.score]:null,view:typeof v98View==='string'?v98View:null,unity:{ready:window.D6UnityMatch?.ready??null,active:window.D6UnityMatch?.active??null,error:window.D6UnityMatch?.lastError??null}}));
  const advances=async(page,from)=>{for(let i=0;i<60;i++){const p=await probe(page);if(p.phase==='live'&&p.elapsed>from)return p;await wait(500);}throw Error('clock did not advance from '+from+': '+JSON.stringify(await probe(page)));};
  let {page,errors}=await open();
  report.footer=(await page.locator('footer span').first().textContent()).trim();assert.match(report.footer,/PROTOTYP 138/);
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.d6Release),'138');console.log('PASS live page shows release 138');
  await page.evaluate(helper);
  report.setup=await page.evaluate(()=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true,replays:true}));assert.ok(report.setup.unityReady,'Unity ready');
  const id=await page.evaluate(async()=>{await v61StoreNewCareer(D6QA160.career);await v61WaitForStorage();return v61CurrentCareer.id;});
  await page.evaluate(()=>{v65Pause();v65Resume();if(typeof hideOverlay==='function')hideOverlay();});
  const unityStart=await probe(page);await wait(20000);report.unity=await advances(page,unityStart.elapsed);
  assert.equal(report.unity.unity.active,true,'Unity active');assert.equal(report.unity.unity.error,null,'no Unity error');
  await page.screenshot({path:`${out}/live-unity.png`});console.log('PASS live Unity match runs '+JSON.stringify(report.unity));
  await page.evaluate(()=>{v98View='2d';draw();});await wait(1500);const flatStart=await probe(page);await wait(10000);report.flat=await advances(page,flatStart.elapsed);
  assert.equal(report.flat.view,'2d');assert.equal(await page.evaluate(()=>document.body.classList.contains('v98-pitch3d')),false);
  await page.screenshot({path:`${out}/live-2d.png`});console.log('PASS live 2D match runs '+JSON.stringify(report.flat));
  await page.evaluate(()=>v65Pause());await page.evaluate(()=>v61WaitForStorage());await wait(1000);report.paused=await probe(page);assert.equal(report.paused.phase,'paused');
  assert.deepEqual(errors,[]);await page.close();
  ({page,errors}=await open());await page.locator(`[data-v61-open="${id}"]`).first().click();
  await page.waitForFunction(()=>typeof match==='object'&&match&&v65Context(),null,{timeout:60000});
  report.restored=await probe(page);assert.equal(report.restored.elapsed,report.paused.elapsed,'restored clock');assert.deepEqual(report.restored.score,report.paused.score);
  await page.evaluate(()=>v65Resume());report.continued=await advances(page,report.restored.elapsed);
  assert.deepEqual(errors,[]);console.log('PASS saved match reloads and continues '+JSON.stringify({restored:report.restored.elapsed,continued:report.continued.elapsed}));
  // Offline restart as in the installed app: the worker serves the page and the Unity build cached above.
  await page.close();({page,errors}=await open());
  assert.ok(await page.evaluate(()=>!!navigator.serviceWorker.controller),'service worker controls the page');
  // The first visit loaded Unity before the worker took control; this controlled page stores the build.
  await page.evaluate(helper);assert.ok((await page.evaluate(()=>D6QA160.setup({config:{fieldSize:'standard',fieldPlayers:5},unity:true,replays:false}))).unityReady,'Unity ready online');
  const cached=()=>page.evaluate(async()=>{const keys=(await (await caches.open('doppel6-offline-1')).keys()).map(r=>new URL(r.url).pathname);
   return keys.includes('/')&&['loader.js','data','framework.js','wasm'].every(ext=>keys.includes('/unity/Build/unity-web.'+ext));});
  for(let i=0;!await cached();i++){assert.ok(i<180,'page and Unity build cached');await wait(1000);}
  await page.close();await context.setOffline(true);
  ({page,errors}=await open());report.offline={release:await page.evaluate(()=>document.documentElement.dataset.d6Release)};assert.equal(report.offline.release,'138');
  await page.evaluate(helper);report.offline.setup=await page.evaluate(()=>D6QA160.setup({config:{fieldSize:'standard',fieldPlayers:5},unity:true,replays:false}));
  assert.ok(report.offline.setup.unityReady,'Unity ready offline');assert.deepEqual(errors,[]);await context.setOffline(false);
  console.log('PASS offline restart opens release 138 and a Unity match');
  report.pass=true;
 }finally{fs.writeFileSync(`${out}/live-check.json`,JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
