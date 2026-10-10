'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('./ui-redesign/serve.cjs');
(async()=>{const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const results=[];try{for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/source/expansion-awards-preview.html');await page.waitForFunction(()=>document.querySelectorAll('.award').length===66);
  await page.waitForFunction(()=>[...document.querySelectorAll('.sample img')].every(i=>i.complete));
  const result=await page.evaluate(()=>({awards:document.querySelectorAll('.award').length,images:document.querySelectorAll('.sample img').length,broken:[...document.querySelectorAll('.sample img')].filter(i=>!i.naturalWidth).length,overflow:document.documentElement.scrollWidth>innerWidth,compact:[...document.querySelectorAll('.sample img.small')].every(i=>i.getBoundingClientRect().width===24)}));
  assert.equal(result.broken,0);assert.equal(result.images,264);assert(!result.overflow);assert(result.compact);assert.deepEqual(errors,[]);
  await page.screenshot({path:'outputs/ligaexpansion-ap11/trophy-cutouts/gallery-'+width+'.png',fullPage:true});results.push({width,...result});await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.route('**/ap11-offline.html',r=>r.fulfill({path:'outputs/index.html',contentType:'text/html'}));
 await page.goto(origin+'/ap11-offline.html');await page.waitForFunction(()=>typeof v62AwardIcon==='function');
 const manifest=JSON.parse(fs.readFileSync('dist/trophies-expansion/manifest.json','utf8'));
 const offline=await page.evaluate(async entries=>{const container=document.createElement('div');document.body.append(container);container.innerHTML=entries.filter(e=>e.country!=='EU').map(e=>v62AwardIcon(e.country,e.kind)+v62AwardIcon(e.country,e.kind,true)).join('');const images=[...container.querySelectorAll('img')];await Promise.all(images.map(i=>i.decode()));return {count:images.length,inline:images.every(i=>i.src.startsWith('data:image/webp;base64,')),broken:images.filter(i=>!i.naturalWidth).length,alt:images.every(i=>i.alt&&i.title===i.alt),large:images.filter(i=>i.naturalWidth===320).length,small:images.filter(i=>i.naturalWidth===96).length};},manifest.entries);
 assert.equal(offline.count,128);assert(offline.inline&&offline.alt);assert.equal(offline.broken,0);assert.equal(offline.large,64);assert.equal(offline.small,64);
 fs.writeFileSync('outputs/ligaexpansion-ap11/trophy-cutouts/browser-checks.json',JSON.stringify({pass:true,results,offline},null,2));console.log(JSON.stringify({pass:true,previewImages:264,offlineImages:128,mobileAndDesktop:true}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
