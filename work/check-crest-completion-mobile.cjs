'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('./ui-redesign/serve.cjs');
(async()=>{
 const built=process.argv.includes('--build'),live=process.argv.includes('--live'),server=createServer(),handler=server.listeners('request')[0];
 server.removeAllListeners('request');server.on('request',(req,res)=>{if(req.url.startsWith('/release.html')){res.setHeader('Content-Type','text/html; charset=utf-8');fs.createReadStream('outputs/index.html').pipe(res);}else handler(req,res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const out='outputs/release-126';fs.mkdirSync(out,{recursive:true});const rows=[];
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(live?'https://fussball.cakamper.at/?engine=2d&qa=126':`http://127.0.0.1:${server.address().port}/${built?'release.html':'source/index.html'}?engine=2d`,{timeout:120000});
 assert((await page.locator('footer').first().textContent()).includes('PROTOTYP 126'));
 await page.locator('#v61-begin').click();await page.locator('#v172-name').fill('Wappen und Mobilprüfung');await page.locator('[data-v172-start="name"]').click();
 await page.locator('[data-v172-country="GER"]').click();await page.locator('[data-v172-club="GER-7"]').click();await page.locator('[data-v172-start="create"]').click();await page.locator('#v61-world-screen .fl-shell').waitFor();
 const initial=await page.evaluate(()=>JSON.stringify(v61CurrentCareer.world));
 const inspect=()=>{
   const selector='.sponsor-offers>button,.v66-sponsor-money,.v66-sponsor-money>span,.v66-sponsor-money strong,.v66-sponsor-goals li,.v66-sponsor-total';
   const spills=[...document.querySelectorAll(selector)].filter(e=>e.getBoundingClientRect().width>0&&e.scrollWidth>e.clientWidth+2).map(e=>({class:e.className,text:e.innerText,width:e.clientWidth,scroll:e.scrollWidth}));
   const cards=[...document.querySelectorAll('.sponsor-offers>button')];
   const escaped=cards.flatMap(card=>[...card.querySelectorAll('.v66-sponsor-money>span,.v66-sponsor-goals strong,.v66-sponsor-total strong')].filter(e=>e.getBoundingClientRect().right>card.getBoundingClientRect().right-2).map(e=>e.innerText));
   return {spills,escaped,documentOverflow:document.documentElement.scrollWidth>innerWidth+1};
 };
 // Reproduce the old intrinsic grid sizing at the reported 390px width.
 const baseline=await page.addStyleTag({content:'.fl-shell .fl-overview .v66-sponsor-money{grid-template-columns:1fr 1fr}.fl-shell .fl-overview .v66-sponsor-money>span{min-width:auto}'});
 assert((await page.evaluate(inspect)).spills.length>0,'The old layout must reproduce internal overflow');await baseline.evaluate(e=>e.remove());
 for(const width of [320,360,390,440,768,1440])for(const lang of ['de','en'])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(({lang,theme})=>{window.doppel6Language.set(lang);document.querySelectorAll(".fl-shell").forEach(e=>e.dataset.flTheme=theme);},{lang,theme});
   const layout=await page.evaluate(inspect);assert.deepEqual(layout.spills,[],JSON.stringify({width,lang,theme,layout}));assert.deepEqual(layout.escaped,[]);assert.equal(layout.documentOverflow,false);
   assert.equal(await page.locator('.v66-sponsor-goals li').count(),6);rows.push({width,lang,theme,...layout});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.doppel6Language.set('de'));await page.screenshot({path:`${out}/${live?'live':built?'build':'source'}-sponsors-390.png`});
 assert.equal(await page.evaluate(()=>JSON.stringify(v61CurrentCareer.world)),initial,'Layout must not change the career');
 const coverage=await page.evaluate(()=>v161Catalog.map(c=>({id:c.id,name:c.name,image:v61CrestAssets[c.id]?.image??null})));
 assert.equal(coverage.length,192);assert(coverage.every(c=>c.image),'Every club needs authored artwork');
 assert.equal(errors.length,0,errors.join('\n'));
 fs.writeFileSync(`${out}/${live?'live':built?'build':'source'}-mobile.json`,JSON.stringify({rows,coverage,errors},null,2));
 console.log('24 sponsor layouts pass with no internal overflow; all 192 club assets present.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
