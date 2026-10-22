'use strict';
// Optional introduction v186: start-flow notes, opt-in, all chapters, persistence, settings, mobile/EN and the single-file build.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const result=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename,...process.argv.slice(2)],{stdio:'inherit'});process.exit(result.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright')),{createServer}=require('./ui-redesign/serve.cjs');
const out='outputs/tutorial-check',withBuild=process.argv.includes('--build'),checks=[];
const pass=name=>{checks.push(name);console.log('PASS '+name);};

async function open(browser,url,width,lang){
 const context=await browser.newContext({viewport:{width,height:width<600?844:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(/Tutorial/.test(message.text()))errors.push(message.text());});
 await page.goto(url,{timeout:180000});await page.waitForFunction(()=>v61StorageReady,null,{timeout:120000});
 await page.evaluate(lang=>window.doppel6Language.set(lang),lang);
 return {context,page,errors};
}
const coach=page=>page.evaluate(()=>{const panel=document.querySelector('[data-v186-coach]'),state=window.D6Tutorial.state(),box=panel?.getBoundingClientRect();return{state,title:panel?.querySelector('h2')?.textContent||null,host:panel?.parentElement?.tagName||null,inside:!!box&&box.top>=0&&box.left>=0&&box.bottom<=innerHeight+1&&box.right<=innerWidth+1,target:document.querySelector('.v186-target')?.outerHTML.slice(0,240)||null,overflow:document.documentElement.scrollWidth>innerWidth};});
const settle=page=>page.waitForTimeout(700);
async function createCareer(page,club='GER-2',{optin}={}){
 await page.evaluate(()=>v61Begin());
 await page.locator('details.v186-explain').waitFor();
 await page.locator('#v172-name').fill('Einführung QA');await page.locator('[data-v172-start="name"]').click();
 await page.locator('details.v186-explain').waitFor();await page.locator(`[data-v172-country="${club.slice(0,3)}"]`).click();
 await page.locator('details.v186-explain').waitFor();await page.locator(`[data-v172-club="${club}"]`).click();
 await page.locator('#v186-optin').waitFor();
 const checked=await page.locator('#v186-optin').isChecked();
 if(typeof optin==='boolean'&&checked!==optin)await page.locator('#v186-optin').setChecked(optin);
 await page.locator('[data-v172-start="create"]').click();
 await page.waitForFunction(()=>!!v61CurrentCareer&&v172Flow===null);await settle(page);
 return {checked,id:await page.evaluate(()=>v61CurrentCareer.id)};
}
const click=(page,selector)=>page.locator(selector).first().click();
const next=page=>click(page,'[data-v186="next"]').then(()=>settle(page));
const go=async page=>{if(await page.locator('[data-v186="go"]').count()){await click(page,'[data-v186="go"]');await settle(page);}};
const lead=async page=>{await page.evaluate(()=>[...document.querySelectorAll('[data-fl-lead],#career-progress-action')].find(n=>n.getClientRects().length).click());};
async function idle(page){await page.waitForFunction(()=>!v58Button.disabled&&!document.querySelector('.v66-day-progress'),null,{timeout:30000});for(let i=0;i<8;i++){const result=page.locator('dialog[open] [data-v72-result]');if(!await result.count())break;await result.first().click();await page.waitForTimeout(300);}}
const step=(page,chapter,index)=>page.waitForFunction(([chapter,index])=>{const s=window.D6Tutorial.state();return s?.chapter===chapter&&s.step===index;},[chapter,index],{timeout:30000});

(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const base=`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser`;
 try{
  // 1. Desktop DE: opt-in, chapters 1-3 with real actions, persistence, renew chapter.
  {
   const {context,page,errors}=await open(browser,base,1280,'de');
   const first=await createCareer(page);
   assert.equal(first.checked,true);pass('Opt-in is pre-selected while no career is saved');
   let view=await coach(page);
   assert.equal(view.state.careerId,first.id);assert.equal(view.state.chapter,'welcome');assert.match(view.title,/^Willkommen beim /);assert.ok(view.inside);
   const overlap=await page.evaluate(()=>{const a=document.querySelector('[data-v186-coach]').getBoundingClientRect(),b=[...document.querySelectorAll('[data-fl-lead]')].find(n=>n.getClientRects().length).getBoundingClientRect();return a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;});
   assert.equal(overlap,false);pass('Chapter 1 starts after saving and leaves the lead action free');
   await page.screenshot({path:`${out}/desktop-welcome.png`});
   for(const [index,pattern] of [[1,/data-fl-lead/],[2,/fl-main-nav/],[3,/fl-overview-office/],[4,/v170-office/],[5,/v66-sponsor/]]){await next(page);await go(page);await step(page,'welcome',index);assert.match((await coach(page)).target||'',pattern);}
   pass('Welcome highlights lead action, navigation, club office, news and sponsor choice');
   await click(page,'[data-v66-sponsor]');await step(page,'youth',0);
   assert.match((await coach(page)).target,/data-v124-budget/);
   await click(page,'[data-v124-budget]');await step(page,'transfer',0);pass('Sponsor choice and youth funding hand over to the next chapter');
   await next(page);await go(page);assert.match((await coach(page)).target,/data-fl-section-tab="search"/);
   await next(page);await go(page);await next(page);await go(page);await step(page,'transfer',3);
   await click(page,'.v186-target');await page.locator('dialog[open] [data-v72-free-offer], dialog[open] [data-v72-start]').first().waitFor();
   view=await coach(page);assert.equal(view.host,'DIALOG');assert.match(view.target,/data-v72-(free-offer|start)/);pass('The panel moves into the open offer dialog and points at its confirm button');
   await click(page,'dialog[open] [data-v72-free-offer], dialog[open] [data-v72-start]');await step(page,'transfer',4);pass('Placing an offer advances the step');
   for(const close of ['dialog[open] [data-v72-close]','dialog[open] [data-v72-close]'])if(await page.locator(close).count())await click(page,close);
   await next(page);await go(page);await step(page,'transfer',5);
   await click(page,'.v186-target');await page.locator('dialog[open] [data-v72-list-own]').waitFor();
   await click(page,'dialog[open] [data-v72-list-own]');await step(page,'transfer',6);pass('Listing an own player advances the step');
   await page.keyboard.press('Escape');
   await page.reload({timeout:180000});await page.waitForFunction(()=>v61StorageReady);
   await page.locator(`[data-v61-open="${first.id}"]`).click();await page.waitForFunction(()=>!!v61CurrentCareer);await settle(page);
   view=await coach(page);assert.equal(view.state.chapter,'transfer');assert.equal(view.state.step,6);assert.ok(view.title);pass('Progress survives a reload');
   await next(page);await go(page);await next(page);await step(page,'transfer',8);
   await lead(page);await step(page,'transfer',9);await idle(page);pass('The next transfer day leads to the answers step');
   await next(page);await page.waitForFunction(()=>window.D6Tutorial.state()?.chapter==='renew',null,{timeout:30000});
   assert.match((await coach(page)).target,/contracts/);
   await next(page);await go(page);await next(page);await go(page);await step(page,'renew',2);
   await click(page,'.v186-target');await step(page,'renew',3);
   await click(page,'#v66-renew-dialog [data-v66-renew-submit]');await step(page,'renew',4);pass('The renew chapter follows chapter 3 and advances on the real offer');
   await next(page);
   const saved=await page.evaluate(async()=>{await v61WaitForStorage();const exported=await v61ExportCareerData(v61CurrentCareer.id);return JSON.stringify(exported).includes('v186')||JSON.stringify(exported).includes('doppel6.tutorial');});
   assert.equal(saved,false);pass('Tutorial progress stays out of the saved career');
   // 2. Opt-out, settings switch and restart on a second career.
   await page.evaluate(()=>v61ShowStart());await settle(page);
   const second=await createCareer(page,'AUT-1');
   assert.equal(second.checked,false);assert.equal((await coach(page)).title,null);
   assert.equal(await page.evaluate(()=>window.D6Tutorial.state().careerId),first.id);pass('With a saved career the opt-in starts unchecked and nothing is shown');
   await page.locator('.fl-sidebar [data-fl-route="settings"]').click();await page.locator('.v186-settings').waitFor();
   assert.equal(await page.locator('[data-v186-setting="enabled"]').isChecked(),false);
   await page.locator('[data-v186-setting="enabled"]').check();await settle(page);
   view=await coach(page);assert.equal(view.state.careerId,second.id);assert.equal(view.state.chapter,'welcome');
   await page.locator('.v186-glossary > summary').click();assert.ok(await page.locator('.v186-glossary details').count()>=6);
   await page.screenshot({path:`${out}/desktop-settings.png`});
   await click(page,'[data-v186="end"]');await settle(page);assert.equal((await coach(page)).title,null);assert.equal(await page.locator('[data-v186-setting="enabled"]').isChecked(),false);
   await click(page,'[data-v186-setting="restart"]');await settle(page);assert.equal((await coach(page)).state.chapter,'welcome');assert.match(await page.locator('.v186-settings-status').textContent(),/Kapitel 1/);
   pass('Settings switch, end and restart work for the current career');
   assert.deepEqual(errors,[]);await context.close();
  }
  // 3. Line-up and first match in the browser renderer.
  {
   const {context,page,errors}=await open(browser,base,1280,'de');
   await page.evaluate(()=>{localStorage.removeItem('doppel6.tutorial');});
   await createCareer(page,'GER-2',{optin:true});
   await click(page,'[data-v186="skip"]');await click(page,'[data-v66-sponsor]');await settle(page);
   await click(page,'[data-v186="skip"]');await click(page,'[data-v124-budget]');await settle(page);
   await click(page,'[data-v186="skip"]');await settle(page);await click(page,'[data-v186="skip"]');
   for(let i=0;i<8;i++){await idle(page);if(await page.evaluate(()=>v58State()?.label)==='Transferschluss bestätigen')break;await lead(page);await page.waitForTimeout(500);}
   await page.waitForFunction(()=>window.D6Tutorial.state()?.chapter==='deadline');await page.locator('[data-fl-lead].v186-target').waitFor();pass('Day five opens the deadline chapter');
   await lead(page);await page.waitForFunction(()=>v58State()?.label==='Nächstes Spiel vorbereiten',null,{timeout:30000});await idle(page);
   await step(page,'lineup',0);await go(page);await next(page);await go(page);
   await step(page,'lineup',1);const slots=await page.locator('[data-v64-career-slot]').count();
   for(let i=slots-1;i>=0&&await page.evaluate(()=>window.D6Tutorial.state().step)===1;i--){await page.locator('[data-v64-career-bench-card]').first().dragTo(page.locator('[data-v64-career-slot]').nth(i));await settle(page);}
   await step(page,'lineup',2);pass('Dragging a player onto the pitch advances the line-up step');
   await next(page);await next(page);await lead(page);
   await step(page,'match',0);await page.locator('[data-v64-quick].v186-target').waitFor();
   await next(page);await lead(page);await step(page,'match',2);
   await click(page,'[data-v65-quick]');await step(page,'match',3);await lead(page);await settle(page);
   await page.locator('#v65-pause-tabs.v186-target').waitFor();await next(page);await page.locator('.v51-pitch-bar.v186-target').waitFor();
   await lead(page);await page.waitForFunction(()=>v65Context()?.state.phase==='live');await settle(page);
   assert.equal((await coach(page)).title,null);pass('Pause steps show tactics and freshness and hide while the match runs');
   const forward=until=>page.evaluate(until=>{clearInterval(v65WorldFrame);const done=new Function('return '+until);for(let n=0;n<40000&&!done();n++){const c=v65Context();if(!c||c.state.phase!=='live'||match.finished)break;step(.05*MATCH_SPEED,.05);if(c.state.phase==='live'&&!match.finished)v65AfterStep(c);}},until);
   await forward("match.halftimePause>0&&v65Context().state.phase==='paused'");await settle(page);
   await next(page);assert.equal((await coach(page)).title,'Halbzeit');pass('Half-time shows its own step');
   await lead(page);await page.waitForFunction(()=>v65Context()?.state.phase==='live');await forward('match.finished');
   await page.waitForFunction(()=>window.D6Tutorial.state()?.step===6&&!!document.querySelector('[data-v186-coach]'),null,{timeout:30000});
   assert.equal((await coach(page)).host,'DIALOG');
   for(let i=0;i<6;i++){if(!/Spielbericht|Ergebnisse/.test(await page.evaluate(()=>v58State()?.context)||''))break;const done=page.locator('.v47-competition-done:visible').first();if(await done.count())await done.click();else await page.locator('#v47-match-report[open] button:visible',{hasText:'Weiter'}).first().click();await page.waitForTimeout(1200);}
   await step(page,'match',7);assert.equal((await coach(page)).title,'Geschafft!');await next(page);
   assert.ok((await coach(page)).state.done.includes('match'));pass('Report, results and the closing step finish the match chapter');
   assert.deepEqual(errors,[]);await context.close();
  }
  // 4. Mobile in English.
  {
   const {context,page,errors}=await open(browser,base,390,'en');
   await page.evaluate(()=>localStorage.removeItem('doppel6.tutorial'));
   await createCareer(page,'GER-2',{optin:true});
   let view=await coach(page);assert.match(view.title,/^Welcome to /);assert.ok(view.inside);assert.equal(view.overflow,false);
   for(let i=0;i<5;i++){await next(page);await go(page);view=await coach(page);assert.ok(view.inside);assert.equal(view.overflow,false);}
   await click(page,'[data-v66-sponsor]');await step(page,'youth',0);
   view=await coach(page);assert.match(view.target,/data-v124-budget/);
   assert.equal(await page.evaluate(()=>{const t=document.querySelector('.v186-target').getBoundingClientRect(),p=document.querySelector('[data-v186-coach]').getBoundingClientRect();return t.left<p.right&&p.left<t.right&&t.top<p.bottom&&p.top<t.bottom;}),false);
   assert.match(await page.locator('[data-v186-coach] p').textContent(),/Pay youth funding and open transfers/);
   await page.screenshot({path:`${out}/mobile-en-youth.png`});
   await click(page,'[data-v124-budget]');await step(page,'transfer',0);
   pass('Mobile English: panel stays on screen, avoids its target and quotes the translated labels');
   assert.deepEqual(errors,[]);await context.close();
  }
  // 5. Single-file build.
  if(withBuild){
   const {context,page,errors}=await open(browser,require('node:url').pathToFileURL(path.resolve('outputs/index.html')).href,1280,'de');
   await page.evaluate(()=>localStorage.removeItem('doppel6.tutorial'));
   await createCareer(page,'GER-2',{optin:true});
   assert.equal((await coach(page)).state.chapter,'welcome');assert.ok(await page.evaluate(()=>!!window.D6Tutorial));
   pass('The single-file build contains and starts the introduction');
   assert.deepEqual(errors,[]);await context.close();
  }
  fs.writeFileSync(`${out}/checks.json`,JSON.stringify({pass:true,build:withBuild,checks},null,2)+'\n');
  console.log(JSON.stringify({pass:true,checks:checks.length}));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
