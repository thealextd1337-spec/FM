'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='outputs/ligaexpansion-ap07/physical';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4184/expansion-world-preview.html');await page.waitForFunction(()=>!document.getElementById('create').disabled);
  await page.locator('#seed').fill('ap06-browser');await page.locator('#create').click();await page.waitForFunction(()=>document.getElementById('store').disabled===false);
  const initial=await page.evaluate(()=>({valid:engine.v61ValidateCareer(world),fixtures:engine.v62Fixtures(world).length,id:world.id,stage:world.world.rules.stage}));assert(initial.valid);assert.equal(initial.fixtures,865);
  await page.locator('#store').click();await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('Gespeichert.'));
  await page.goto('http://127.0.0.1:4184/index.html?engine=2d');await page.waitForFunction(()=>window.D6Expansion);await page.evaluate(async id=>{await v61WaitForStorage();await v61OpenCareer(id);},initial.id);
  await page.locator('[data-v166-sponsor]').first().click();await page.waitForSelector('[data-v166-action="budget"]');await page.locator('[data-v166-action="budget"]').click();await page.waitForSelector('[data-v166-action="market"]');
  for(let i=0;i<5;i++){await page.locator('[data-v166-action="market"]').click();await page.waitForFunction(previous=>v61CurrentCareer.world.market.phase==='closed'||v61CurrentCareer.world.market.day>previous,i+1);}
  await page.waitForSelector('[data-v166-action="match"]');assert(await page.evaluate(()=>v61ValidateCareer(v61CurrentCareer)));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
  await page.screenshot({path:out+'/career-mobile.png'});
  await page.locator('[data-v166-action="match"]').click();await page.waitForFunction(()=>v61CurrentCareer.world.activeMatch?.state.phase==='prematch');await page.evaluate(()=>v61WaitForStorage());
  const prematch=await page.evaluate(()=>({fixtureId:v61CurrentCareer.world.activeMatch.fixtureId,valid:v61ValidateCareer(v61CurrentCareer)}));assert(prematch.valid);
  await page.reload();await page.waitForFunction(()=>window.D6Expansion);await page.evaluate(async id=>{await v61WaitForStorage();await v61OpenCareer(id);},initial.id);assert.equal(await page.evaluate(()=>v61CurrentCareer.world.activeMatch.fixtureId),prematch.fixtureId);
  await page.screenshot({path:out+'/prematch-mobile.png'});
  await page.evaluate(()=>v61AdvanceCareer());await page.waitForFunction(()=>v65WorldActive&&match&&match.elapsed>0,{},{timeout:30000});
  await page.evaluate(()=>v65Pause());await page.waitForFunction(()=>v65WorldActive.state.phase==='paused');
  const paused=await page.evaluate(async()=>{v65Snapshot(v65Context());await v64UiSave();await v61WaitForStorage();return {elapsed:match.elapsed,score:[...match.score],ids:match.people.map(p=>p.pid),valid:v61ValidateCareer(v61CurrentCareer)};});assert(paused.valid);
  await page.reload();await page.waitForFunction(()=>window.D6Expansion);await page.evaluate(async id=>{await v61WaitForStorage();await v61OpenCareer(id);},initial.id);
  const restored=await page.evaluate(()=>({elapsed:match.elapsed,score:[...match.score],ids:match.people.map(p=>p.pid)}));assert.deepEqual(restored,{elapsed:paused.elapsed,score:paused.score,ids:paused.ids});
  assert.equal(errors.length,0,errors.join('\n'));const report={pass:true,initial,preseason:true,mobileOverflow:false,prematchReload:true,physicalPauseReload:true,errors};fs.writeFileSync(out+'/browser.json',JSON.stringify(report,null,2)+'\n');console.log(report);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
