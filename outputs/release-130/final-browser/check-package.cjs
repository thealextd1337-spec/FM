'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const meta=JSON.parse(fs.readFileSync(path.join(__dirname,'../package.json'),'utf8')),checks=[];
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[];const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(e.message));
 const check=(name,value)=>{assert(value,name);checks.push(name);console.log('PASS '+name);};
 try{
  await page.goto('http://127.0.0.1:4548/?engine=unity');await page.waitForFunction(()=>v61StorageReady&&window.userMeshyMatchReady);
  check('Packaged footer is Version 130',(await page.locator('body').innerText()).includes('PROTOTYP 130'));
  const setup=await page.evaluate(async()=>{const c=v167CreateCareer('AUT-5','local-129-r20-http','QA'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);if(c.world.market.phase==='budget')v124SetYouthBudget(c,0);let days=0;while(c.world.market.phase==='open'&&days++<40)await v66NextMarketDay(c);if(c.world.market.phase==='open')throw Error('Market setup incomplete');const fixture=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);c.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(c,fixture)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);return {clubs:c.world.clubs.length,countries:new Set(c.world.clubs.map(x=>x.countryId)).size,roster:club.roster.length,keepers:club.roster.filter(x=>x.keeper).length,roles:v179SquadDepth(c,club).counts,fixtureId:fixture.id,players:match.people.length};});
  check('Packaged world retains 192 clubs and 12 countries',setup.clubs===192&&setup.countries===12);
  check('Packaged squad retains 11 pros, two keepers and 6/3/2 roles',setup.roster===11&&setup.keepers===2&&setup.roles.starter===6&&setup.roles.rotation===3&&setup.roles.reserve===2);
  await page.waitForFunction(()=>D6UnityMatch?.ready&&D6UnityMatch.lastAck?.ids?.length===match.people.length,{},{timeout:120000});
  const runtime=await page.evaluate(()=>({ready:D6UnityMatch.ready,active:D6UnityMatch.active,ids:D6UnityMatch.lastAck.ids,players:match.people.map(p=>p.pid),session:D6UnityMatch.session,lastError:D6UnityMatch.lastError,labels:document.querySelectorAll('#d6-unity-labels button').length}));
  assert.deepEqual([...runtime.ids].sort(),[...runtime.players].sort());check('Actual packaged Unity fixture confirms all 12 native actors',runtime.ready&&runtime.active&&runtime.labels===12&&runtime.session.startsWith(setup.fixtureId+':')&&!runtime.lastError);
  const preserved=await page.evaluate(async()=>{const take=()=>JSON.stringify({elapsed:match.elapsed,score:match.score,events:v65Context().state.events,fresh:v65Context().state.fresh,load:v65Context().state.playerLoad});const before=take();window.postMessage({channel:D6WorldUnityContract.schema,kind:'error',message:'foreign renderer test'},'*');await new Promise(r=>setTimeout(r,180));return {same:before===take(),ready:D6UnityMatch.ready,error:D6UnityMatch.lastError};});
  check('Paused native facts and P02 survive rendering and foreign messages',preserved.same&&preserved.ready&&!preserved.error);
  check('Packaged browser has no uncaught page errors',errors.length===0);
  const candidate=await page.evaluate(()=>({marker:match.attackFlow.keeperChaseRevision,pump:D6ViewFramePump?.version===130&&D6ViewFramePump.enabled,iframePump:document.querySelector('iframe').contentWindow.D6ViewFramePump?.version===130,noLocal:!window.D6LocalFramePump&&!document.querySelector('iframe').contentWindow.D6LocalFramePump}));
  check('Fresh physical match has keeper revision180 and retained pace119',candidate.marker===180&&await page.evaluate(()=>match.attackFlow.paceRevision===119));
  check('Production frame scheduler is scoped to actual Unity surfaces without local opt-in code',candidate.pump&&candidate.iframePump&&candidate.noLocal);
  await page.screenshot({path:path.join(__dirname,'package-match.png')});
  fs.writeFileSync(path.join(__dirname,'package-checks.json'),JSON.stringify({checkedAt:new Date().toISOString(),passed:true,scope:'Final release130 HTTP package, own isolated Chrome, SwiftShader for contract checks; no hardware/FPS/live claim.',sourceId:meta.sourceId,manifestSha256:meta.manifestSha256,htmlSha256:meta.htmlSha256,checks,setup,runtime,errors},null,2)+'\n');
 }catch(e){fs.writeFileSync(path.join(__dirname,'package-checks.json'),JSON.stringify({passed:false,checks,errors,error:e.message},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
