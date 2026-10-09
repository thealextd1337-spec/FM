'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('outputs/3d-quality/role-picker-v119/wave4');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],screens:[],sourceHashes:Object.fromEntries(['world-tactics-ui-v156.js','player-tactics-ui.js','player-tactics-ui.css','world-tactics-layout-v156.css'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('dist/'+f)).digest('hex')]))};
const check=(name,value)=>{assert(value,name);report.checks.push(name);};
async function inspectPicker(page,scope,name){
 const trigger=page.locator(scope+' .d6-role-trigger').first();await trigger.click();
 const data=await page.evaluate(()=>{
  const popup=document.querySelector('.d6-role-choices:popover-open'),select=popup.parentElement.querySelector('[data-d6-role]'),career=v61CurrentCareer;
  const context=career.world.activeMatch?v65Context():v64CareerPlanContext(career),state=context.state,pid=select.dataset.d6Role,player=v66Player(career,pid);
  const allowed=v156Projection(career,player,state).allowedRoles,r=popup.getBoundingClientRect();
  return {expected:allowed.map(a=>({id:a.id,band:a.band})),choices:[...popup.querySelectorAll('[role=option]')].map(n=>({id:n.dataset.d6RoleChoice,band:[...n.querySelector('.d6-role-suitability').classList].find(c=>c.startsWith('fl-band-'))?.slice(8),label:n.getAttribute('aria-label'),height:n.getBoundingClientRect().height})),bounded:r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1};
 });
 check(name+': all options show actual projected bands',JSON.stringify(data.expected)===JSON.stringify(data.choices.map(({id,band})=>({id,band}))));
 check(name+': qualitative accessible options with touch targets',data.choices.every(c=>c.height>=44&&c.label&&!/\d/.test(c.label))&&data.bounded);
 if(await page.evaluate(()=>document.documentElement.lang==='de'))check(name+': German qualitative suitability survives language switching',data.choices.every(c=>!/\b(?:Good|Weak|Very|Normal)\b/.test(c.label)||c.label.endsWith(': Normal')));
 await trigger.press('End');const active=await trigger.getAttribute('aria-activedescendant');check(name+': End focuses last choice',active===await page.locator('.d6-role-choices:popover-open [role=option]').last().getAttribute('id'));
 await trigger.press('Home');check(name+': Home focuses first choice',await trigger.getAttribute('aria-activedescendant')===await page.locator('.d6-role-choices:popover-open [role=option]').first().getAttribute('id'));
 await trigger.press('ArrowDown');check(name+': arrow navigation retains combobox focus',await trigger.evaluate(n=>n===document.activeElement));
 await page.screenshot({path:path.join(out,name.replace(/[^a-zA-Z0-9-]/g,'-')+'-options.png')});
 await trigger.press('Escape');check(name+': Escape closes choices and keeps trigger focus',await trigger.getAttribute('aria-expanded')==='false'&&await trigger.evaluate(n=>n===document.activeElement));
}
(async()=>{
 const server=require('../../ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser&players=wave3`);await page.waitForFunction(()=>window.D6TacticsProjection&&window.D6PlayerFoundationPreviewOptions);
  await page.evaluate(()=>{const c=v61CreateCareer('GER-2','tactic-ui-wave4');v61CurrentCareer=c;v61RenderCareer(c);v61SetCareerTab('matchplan',false);});
  await page.locator('[data-v46-view=matchplan] .d6-role-trigger').waitFor({state:'visible'});
  const permanentPid=await page.locator('[data-v46-view=matchplan] [data-d6-role]').getAttribute('data-d6-role');
  const newRole=await page.locator('[data-v46-view=matchplan] [data-d6-role] option').nth(1).getAttribute('value');
  await page.locator('[data-v46-view=matchplan] .d6-role-trigger').click();await page.locator(`.d6-role-choices:popover-open [data-d6-role-choice="${newRole}"]`).click();await page.waitForFunction(r=>Object.values(v61CurrentCareer.manager.matchPlan.roleAssignments).some(a=>a.roleId===r),newRole);
  check('Permanent role control uses and persists central plan',await page.evaluate(({pid,role})=>v61CurrentCareer.manager.matchPlan.roleAssignments[pid].roleId===role,{pid:permanentPid,role:newRole}));
  await page.locator('[data-v46-view=matchplan] [data-v64-orientation="1"]').click();
  await page.waitForFunction(()=>v61CurrentCareer.manager.matchPlan.roleAssignments[v64CareerPlanContext(v61CurrentCareer).fixture.plan.home.starters[v64CareerSelectedSlot]].orientation===1);
  check('Permanent orientation persists in the role assignment',true);
  for(const width of [320,390,1366])for(const theme of ['dark','light'])for(const lang of ['de','en']){
   await page.setViewportSize({width,height:956});await page.emulateMedia({colorScheme:theme});await page.evaluate(({lang})=>{v61RenderCareer(v61CurrentCareer);v61SetCareerTab('matchplan',false);window.doppel6Language.set(lang);},{lang});await page.waitForTimeout(100);
   const state=await page.evaluate(()=>{const view=document.querySelector('[data-v46-view=matchplan]'),select=view.querySelector('[data-d6-role]'),field=view.querySelector('.v64-prematch-field'),zone=field.querySelector('.d6-role-zone');return {overflow:document.documentElement.scrollWidth>innerWidth+1,selectWidth:view.querySelector('.d6-role-trigger').getBoundingClientRect().width,zone:field.querySelectorAll('.d6-role-zone').length,labels:field.querySelectorAll('.d6-pitch-role').length,options:select.options.length,oldInstructions:!!view.querySelector('[data-v64-instruction]'),title:zone?.getAttribute('aria-label'),theme:document.querySelector('.fl-shell')?.dataset.flTheme,roleText:select.parentElement.parentElement.textContent};});
   report.layouts||=[];report.layouts.push({width,theme,lang,...state});
   const file=`plan-${width}-${theme}-${lang}.png`;await page.screenshot({path:path.join(out,file),fullPage:true});report.screens.push(file);
   check(`${width}/${theme}/${lang}: role labels, one zone and contained controls`,!state.overflow&&state.selectWidth>100&&state.zone===1&&state.labels===6&&state.options>0&&!state.oldInstructions&&state.theme===theme);
   if(lang==='en')check(`${width}/${theme}: English role names`,/Role/.test(state.roleText)&&!/Rolle/.test(state.roleText));
   if(theme==='dark'&&lang==='de')await inspectPicker(page,'[data-v46-view=matchplan]',`plan-${width}`);
  }
  const projection=await page.evaluate(()=>{const c=v61CurrentCareer,p=v66Own(c).roster[0],ui=v156Projection(c,p);return {serialized:JSON.stringify(ui),keys:Object.keys(ui),pId:p.pid};});
  check('Projection exposes no talent, caps, routine or raw values',!/(talent|caps|routine|development|"value"|"rating")/.test(projection.serialized));
  await page.evaluate(pid=>v68OpenPlayerProfile(v61CurrentCareer,pid,null),projection.pId);
  check('Profile shows fixed recommendations and a best recommendation',await page.locator('.d6-profile-roles .d6-profile-role').count()>0&&await page.locator('.d6-profile-roles .is-best').count()===1);await page.screenshot({path:path.join(out,'profile.png')});
  await page.evaluate(()=>v61ProfileDialog.close());
  await page.evaluate(async()=>{const c=v61CurrentCareer,club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);const f=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v64UiRender(c);});
  check('Prematch uses the same role controller',await page.locator('[data-d6-role]').count()===1);
  await inspectPicker(page,'.fl-prematch','prematch');
  const prematchChoice=await page.locator('[data-d6-role] option').last().getAttribute('value');await page.locator('.d6-role-trigger').click();await page.locator('.d6-role-choices:popover-open [data-d6-role-choice="'+prematchChoice+'"]').click();await page.waitForFunction(r=>Object.values(v65Context().state.roleAssignments).some(a=>a.roleId===r),prematchChoice);check('Prematch colored picker commits through the native controller',true);
  await page.evaluate(()=>{const state=v65Context().state;state.phase='paused';v65PauseView=true;v65PauseTab='lineup';v65Show(v65Context());clearInterval(v65WorldFrame);v65PauseView=true;v65UpdateControls(v65Context());});
  await page.locator('#v65-plan-view .d6-role-trigger').waitFor({state:'visible'});
  check('Halftime/pause shows the same role and one shared area',await page.locator('#v65-plan-view .d6-role-zone').count()===1);
  const choice=await page.locator('#v65-plan-view [data-d6-role]').evaluate(n=>[...n.options].find(o=>o.value&&o.value!==n.value).value);
  await inspectPicker(page,'#v65-plan-view','pause');
  await page.locator('#v65-plan-view .d6-role-trigger').click();await page.locator(`.d6-role-choices:popover-open [data-d6-role-choice="${choice}"]`).click();
  await page.waitForFunction(r=>v65Context().state.roleAssignments[v64Active(v65Context().state,v65Context().ownSide)[v65SelectedSlot]].roleId===r,choice);
  check('Paused role edits support central undo',await page.evaluate(()=>{const context=v65Context(),before=context.state.pauseUndo.roleAssignments,expected=JSON.stringify(before);v65UndoLast(context);return JSON.stringify(context.state.roleAssignments)===expected;}));
  await page.screenshot({path:path.join(out,'pause.png'),fullPage:true});
  // A separate private origin/context exercises trusted touch events without
  // accessing any human tab or touching production career data.
  const touchContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  try{
   const touch=await touchContext.newPage();touch.on('pageerror',e=>report.errors.push(e.message));await touch.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser&players=wave3`);await touch.waitForFunction(()=>window.D6TacticsProjection&&v61StorageReady);
   await touch.evaluate(()=>{v61CurrentCareer=v61CreateCareer('ITA-2','touch-role-v119');v61RenderCareer(v61CurrentCareer);v61SetCareerTab('matchplan',false);});
   const trigger=touch.locator('[data-v46-view=matchplan] .d6-role-trigger');await trigger.tap();check('Touch opens real shared colored choices',await touch.locator('.d6-role-choices:popover-open [role=option]').count()>1);
   const target=touch.locator('.d6-role-choices:popover-open [role=option]').last(),role=await target.getAttribute('data-d6-role-choice'),pid=await touch.locator('[data-v46-view=matchplan] [data-d6-role]').getAttribute('data-d6-role');await target.tap();await touch.waitForFunction(({pid,role})=>!v64CareerCommitPending&&v61CurrentCareer.manager.matchPlan.roleAssignments[pid].roleId===role&&[...document.querySelectorAll('[data-d6-role]')].some(s=>s.dataset.d6Role===pid&&s.value===role),{pid,role});check('Touch commits the selected role through central plan',await trigger.evaluate(e=>document.activeElement===e));
   await trigger.press('Enter');await trigger.press('Home');const first=touch.locator('.d6-role-choices:popover-open [role=option]').first(),keyboardRole=await first.getAttribute('data-d6-role-choice'),choiceId=await first.getAttribute('id');assert(await trigger.evaluate((e,id)=>document.activeElement===e&&e.getAttribute('aria-activedescendant')===id,choiceId),'Home keeps focus and activates the actual first choice');await trigger.press('Enter');await touch.waitForFunction(({pid,role})=>!v64CareerCommitPending&&v61CurrentCareer.manager.matchPlan.roleAssignments[pid].roleId===role&&[...document.querySelectorAll('[data-d6-role]')].some(s=>s.dataset.d6Role===pid&&s.value===role),{pid,role:keyboardRole});check('Keyboard Enter commits and closes choices',await touch.locator('.d6-role-choices:popover-open').count()===0&&await trigger.evaluate(e=>document.activeElement===e));
  }finally{await touchContext.close();}
  check('No browser runtime errors',report.errors.length===0);
 }catch(e){report.failure=e.stack;throw e;}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
 console.log(`${report.checks.length} tactical UI checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
