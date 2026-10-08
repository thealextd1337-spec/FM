'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../serve.cjs');
const round=process.argv[2]||'audit',target=process.argv[3]||'source';
const out=path.resolve('outputs/ui-redesign/consistency-v157',round);fs.mkdirSync(out,{recursive:true});
const owned=()=>Object.fromEntries(fs.readdirSync('dist/ui-flutlicht',{recursive:true}).filter(f=>/\.(js|css)$/.test(f)).concat(['../player-tactics-ui.css','../world-tactics-layout-v156.css']).sort().map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.resolve('dist/ui-flutlicht',f))).digest('hex')]));
const buildHash=()=>crypto.createHash('sha256').update(fs.readFileSync('outputs/index.html')).digest('hex');
const report={round,target,before:owned(),...(target==='build'?{buildHash:buildHash()}:{}),cases:[],errors:[],checks:[]};
const cascadeOnly=process.argv.includes('--cascade');
const settle=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const combos=[{width:1440,lang:'de',theme:'dark'},{width:390,lang:'de',theme:'light'},{width:1440,lang:'en',theme:'light'},{width:320,lang:'en',theme:'dark'},{width:768,lang:'de',theme:'dark'}];
async function navigate(page,route){let direct=page.locator(`[data-fl-route="${route}"]:visible`).first();if(!await direct.count()){await page.locator('[data-fl-menu]:visible').click();direct=page.locator(`[data-fl-route="${route}"]:visible`).first();}await direct.click();await settle(page);}
async function capture(page,surface,combo,screenshot=true){
 const info=await page.evaluate(()=>{
  const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[hidden]');};
  const label=e=>e.getAttribute('aria-label')||[...e.labels||[]].map(l=>l.textContent).join(' ').trim()||e.id||e.name||e.className;
  const select=[...document.querySelectorAll('select')].filter(visible).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),o=e.selectedOptions[0],os=o&&getComputedStyle(o);return {label:label(e),id:e.id,class:e.className,width:r.width,height:r.height,font:s.fontFamily,size:s.fontSize,appearance:s.appearance,bg:s.backgroundColor,color:s.color,backgroundImage:s.backgroundImage,colorScheme:s.colorScheme,selected:o?.textContent,options:e.options.length,optionBg:os?.backgroundColor,optionColor:os?.color};});
  const overflow=[...document.querySelectorAll('body *')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+2||r.left< -2;}).slice(0,20).map(e=>({tag:e.tagName,class:e.className,id:e.id,text:e.textContent.trim().slice(0,80),right:e.getBoundingClientRect().right}));
  const old=[...document.querySelectorAll('button,input,select,summary,h1,h2,h3,p,small')].filter(visible).map(e=>({e,s:getComputedStyle(e)})).filter(({s})=>/monospace|Courier|Press Start/i.test(s.fontFamily)||s.textShadow!=='none').slice(0,20).map(({e,s})=>({tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,80),font:s.fontFamily,textShadow:s.textShadow}));
  const affected=[...document.querySelectorAll('.v64-selection,.d6-role-control,.segmented,.prematch-tabs,.v64-bench-chip,.v64-bench-chip .bench-title b,.v64-bench-chip .bench-meta,.v64-bench-chip .player-link,#match-info .stat-row b,#match-info .stats b,body.fl-match-active>.legal-nav button,.fl-squad-profile .v74-profile-tabs [aria-selected=true]')].filter(visible).map(e=>{const s=getComputedStyle(e);return {class:e.className,text:e.textContent.trim().slice(0,70),bg:s.backgroundColor,color:s.color,border:s.borderColor};});
  const svg=[...document.querySelectorAll('.d6-role-important-icon')].filter(visible).map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
  return {scrollWidth:document.documentElement.scrollWidth,innerWidth,select,overflow,old,svg,affected,theme:document.querySelector('.fl-prematch,.fl-shell:not(.fl-start-header),#game-screen.fl-match')?.dataset.flTheme,dialog:!!document.querySelector('dialog[open]')};
 });
 const key=`${surface}-${combo.width}-${combo.lang}-${combo.theme}`;report.cases.push({surface,...combo,...info});
 if(screenshot)await page.screenshot({path:path.join(out,key+'.png'),fullPage:!info.dialog&&!['matchplan','pause-lineup','transfers','transfers-listed'].includes(surface)});
 if(round!=='audit'){
  assert(info.scrollWidth<=combo.width+1,`${key}: page overflow ${info.scrollWidth}`);
  assert(info.old.length===0,`${key}: legacy clock styling`);
  for(const control of info.select){assert(control.height>=44,`${key}: ${control.label} height ${control.height}`);assert.equal(control.appearance,'auto',`${key}: dropdown arrow`);assert.equal(control.backgroundImage,'none',`${key}: old dropdown decoration`);}
  for(const icon of info.svg)assert(icon.width<=14&&icon.height<=14,`${key}: important icon expands`);
  const obsolete=['rgb(16, 33, 38)','rgb(16, 38, 41)','rgb(199, 243, 107)','rgb(237, 245, 240)','rgb(240, 246, 241)'];
  for(const area of info.affected){assert(!obsolete.includes(area.bg),`${key}: old green background on ${area.class}`);assert(!obsolete.includes(area.color),`${key}: old lime/nearwhite text on ${area.class}`);assert(!obsolete.includes(area.border),`${key}: old lime border on ${area.class}`);}
  assert.equal(info.theme,combo.theme,`${key}: surface theme`);
 }
}
let server,browser,page;
(async()=>{
 server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 for(const combo of combos){
  const context=await browser.newContext({viewport:{width:combo.width,height:956},colorScheme:combo.theme});page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(target==='source'?`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser&players=wave3`:require('node:url').pathToFileURL(path.resolve('outputs/index.html')).href+'?engine=browser&players=wave3');await page.waitForFunction(()=>v61StorageReady&&window.D6Flutlicht?.navigation);await page.evaluate(lang=>doppel6Language.set(lang),combo.lang);await settle(page);
  if(cascadeOnly){
   await page.evaluate(async()=>{const c=v61CreateCareer('GER-2','ui-cascade-v157','UI Konsistenz'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);v61CurrentCareer=c;while(c.world.market.phase==='open')await v66NextMarketDay(c);const f=v62Fixtures(c).find(f=>!f.result&&(f.homeId===club.id||f.awayId===club.id));c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v64UiRender(c);});await settle(page);
   const state=await page.evaluate(()=>{const scope=document.querySelector('.fl-prematch'),s=getComputedStyle(scope),gold=s.getPropertyValue('--fl-gold').trim(),control=s.getPropertyValue('--fl-control').trim(),ink=s.getPropertyValue('--fl-ink').trim(),muted=s.getPropertyValue('--fl-muted').trim(),rgb=value=>{const e=document.createElement('span');e.style.color=value;scope.append(e);const v=getComputedStyle(e).color;e.remove();return v;};const style=selector=>{const e=scope.querySelector(selector),c=getComputedStyle(e);return {bg:c.backgroundColor,color:c.color};};return {theme:scope.dataset.flTheme,active:style('.prematch-tabs button.active'),quick:style('.compact-actions button'),help:style('.v64-controls>p'),gold:rgb(gold),control:rgb(control),ink:rgb(ink),muted:rgb(muted),icon:[...scope.querySelectorAll('.d6-role-important-icon')].every(e=>e.getBoundingClientRect().width===13&&e.getBoundingClientRect().height===13)};});
   assert.equal(state.theme,combo.theme);assert.equal(state.active.bg,state.gold);assert.equal(state.quick.bg,state.control);assert.equal(state.quick.color,state.ink);assert.equal(state.help.color,state.muted);assert(state.icon);report.cases.push({surface:'native-prematch-cascade',...combo,...state});report.checks.push(`${combo.width}/${combo.lang}/${combo.theme}: late native style cascade stays within Flutlicht`);await context.close();continue;
  }
  await capture(page,'start',combo);await page.evaluate(()=>{v61Flow.step='manager';v61RenderFlow();v61ShowScreen();});await settle(page);await capture(page,'creation-manager',combo);
  await page.locator('#v61-manager-name').fill('UI Konsistenz');await page.locator('[data-v61-manager-next]').click();await settle(page);await capture(page,'creation-country',combo);
  await page.locator('[data-v61-country="GER"]').click();await settle(page);await capture(page,'creation-clubs',combo);await page.locator('[data-v61-club="GER-2"]').click();await settle(page);await capture(page,'creation-roster',combo);
  await page.evaluate(async()=>{const c=v61CreateCareer('GER-2','ui-consistency-v157','UI Konsistenz'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);v61CurrentCareer=await v61StoreNewCareer(c);v61CareerTab='overview';v61RenderCareer(c);});await settle(page);
  const pristine=await page.evaluate(()=>JSON.stringify(v61CurrentCareer));
  for(const route of ['overview','squad','matchplan','transfers','competition','calendar','statistics','club','settings']){
   await navigate(page,route);await capture(page,route,combo);
   const view=page.locator(`[data-v46-view="${route}"]`),tabs=view.locator('.fl-section-tabs [role="tab"],.fl-club-tabs [role="tab"]');
   for(let i=1;i<await tabs.count();i++){const button=tabs.nth(i),key=await button.getAttribute('data-fl-section-tab')||await button.getAttribute('data-fl-club-tab')||i;await button.click();await settle(page);await capture(page,route+'-'+key,combo);}
  }
  assert.equal(pristine,await page.evaluate(()=>JSON.stringify(v61CurrentCareer)),'menu display mutated career');report.checks.push(`${combo.width}/${combo.lang}/${combo.theme}: menu/state purity`);
  await page.evaluate(()=>v68OpenPlayerProfile(v61CurrentCareer,v66Own(v61CurrentCareer).roster[0].pid,null));await settle(page);await capture(page,'profile',combo);await page.locator('[data-v74-profile-tab="career"]').click();await settle(page);await capture(page,'profile-career',combo);await page.keyboard.press('Escape');
  await page.evaluate(async()=>{const c=v61CurrentCareer,club=v66Own(c);while(c.world.market.phase==='open')await v66NextMarketDay(c);const f=v62Fixtures(c).find(f=>!f.result&&(f.homeId===club.id||f.awayId===club.id));c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v64UiRender(c);});await settle(page);await capture(page,'prematch',combo);
  if(round!=='audit'){
   const controls=page.locator('#v61-world-screen [data-d6-role]'),previous=await controls.inputValue(),role=await controls.locator('option').last().getAttribute('value'),stateBefore=await page.evaluate(()=>JSON.stringify(v61CurrentCareer.world.activeMatch.state.roleAssignments));
   assert.notEqual(previous,role,'prematch role has an alternative');await controls.selectOption(role);await page.waitForFunction(r=>Object.values(v61CurrentCareer.world.activeMatch.state.roleAssignments).some(a=>a.roleId===r),role);await settle(page);
   assert(await page.locator('#v61-world-screen [data-d6-role]').evaluate(e=>document.activeElement===e),'prematch select focus restored');
   await page.locator('[data-v64-undo]').click();await page.waitForFunction(before=>JSON.stringify(v61CurrentCareer.world.activeMatch.state.roleAssignments)===before,stateBefore);await settle(page);
   await page.locator('[data-v64-tab="tactics"]').focus();await page.keyboard.press('Enter');await settle(page);assert(await page.locator('.v64-tactics').isVisible(),'keyboard opens native prematch tactics');await capture(page,'prematch-tactics',combo);await page.locator('[data-v64-tab="lineup"]').click();await settle(page);
   report.checks.push(`${combo.width}/${combo.lang}/${combo.theme}: native prematch select, undo, focus and keyboard tactics`);
  }
  await page.evaluate(()=>{const state=v65Context().state;state.phase='paused';v98View='2d';v65PauseView=true;v65PauseTab='lineup';v65Show(v65Context());clearInterval(v65WorldFrame);v65PauseView=true;v65UpdateControls(v65Context());});await settle(page);await capture(page,'pause-lineup',combo);
  if(round!=='audit'){
   const controls=page.locator('#v65-controls [data-d6-role]'),role=await controls.locator('option').last().getAttribute('value'),before=await page.evaluate(()=>JSON.stringify(v65Context().state.roleAssignments));await controls.selectOption(role);await page.waitForFunction(r=>Object.values(v65Context().state.roleAssignments).some(a=>a.roleId===r),role);await settle(page);await page.locator('[data-v65-undo]').click();await page.waitForFunction(previous=>JSON.stringify(v65Context().state.roleAssignments)===previous,before);await settle(page);
   await page.locator('#fl-match-tab-lineup').focus();await page.keyboard.press('ArrowRight');await settle(page);assert.equal(await page.locator('#fl-match-tab-tactics').getAttribute('aria-selected'),'true');report.checks.push(`${combo.width}/${combo.lang}/${combo.theme}: paused role select, native undo and keyboard tabs`);
  }else await page.locator('#fl-match-tab-tactics').click();await settle(page);await capture(page,'pause-tactics',combo);
  await context.close();console.log(`Completed ${combo.width}/${combo.lang}/${combo.theme}`);
 }
 assert.equal(report.errors.length,0,'uncaught runtime errors');assert.deepEqual(owned(),report.before,'presentation sources changed during UI run');if(target==='build')assert.equal(buildHash(),report.buildHash,'build changed during UI run');report.pass=true;
})().catch(e=>{report.failure=e.stack;process.exitCode=1;console.error(e);}).finally(async()=>{report.after=owned();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();server?.close();console.log(JSON.stringify({cases:report.cases.length,errors:report.errors,pass:report.pass,failure:report.failure}));});
