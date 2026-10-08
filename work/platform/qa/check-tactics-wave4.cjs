'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('outputs/platform/tactics-wave4');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],screens:[],sourceHashes:Object.fromEntries(['world-tactics-ui-v156.js','player-tactics-ui.js','player-tactics-ui.css','world-tactics-layout-v156.css'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('dist/'+f)).digest('hex')]))};
const check=(name,value)=>{assert(value,name);report.checks.push(name);};
(async()=>{
 const server=require('../../ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser&players=wave3`);await page.waitForFunction(()=>window.D6TacticsProjection&&window.D6PlayerFoundationPreviewOptions);
  await page.evaluate(()=>{const c=v61CreateCareer('GER-2','tactic-ui-wave4');v61CurrentCareer=c;v61RenderCareer(c);v61SetCareerTab('matchplan',false);});
  await page.locator('[data-v46-view=matchplan] [data-d6-role]').waitFor({state:'visible'});
  const newRole=await page.locator('[data-v46-view=matchplan] [data-d6-role] option').nth(1).getAttribute('value');
  await page.locator('[data-v46-view=matchplan] [data-d6-role]').selectOption(newRole);await page.waitForFunction(r=>Object.values(v61CurrentCareer.manager.matchPlan.roleAssignments).some(a=>a.roleId===r),newRole);
  check('Permanent role control uses and persists central plan',await page.evaluate(r=>Object.values(v61CurrentCareer.manager.matchPlan.roleAssignments).some(a=>a.roleId===r),newRole));
  await page.locator('[data-v46-view=matchplan] [data-v64-orientation="1"]').click();
  await page.waitForFunction(()=>v61CurrentCareer.manager.matchPlan.roleAssignments[v64CareerPlanContext(v61CurrentCareer).fixture.plan.home.starters[v64CareerSelectedSlot]].orientation===1);
  check('Permanent orientation persists in the role assignment',true);
  for(const width of [320,390,1366])for(const theme of ['dark','light'])for(const lang of ['de','en']){
   await page.setViewportSize({width,height:956});await page.emulateMedia({colorScheme:theme});await page.evaluate(({lang})=>{v61RenderCareer(v61CurrentCareer);v61SetCareerTab('matchplan',false);window.doppel6Language.set(lang);},{lang});await page.waitForTimeout(100);
   const state=await page.evaluate(()=>{const view=document.querySelector('[data-v46-view=matchplan]'),select=view.querySelector('[data-d6-role]'),field=view.querySelector('.v64-prematch-field'),zone=field.querySelector('.d6-role-zone');return {overflow:document.documentElement.scrollWidth>innerWidth+1,selectWidth:select.getBoundingClientRect().width,zone:field.querySelectorAll('.d6-role-zone').length,labels:field.querySelectorAll('.d6-pitch-role').length,options:select.options.length,oldInstructions:!!view.querySelector('[data-v64-instruction]'),title:zone?.getAttribute('aria-label'),theme:document.querySelector('.fl-shell')?.dataset.flTheme,roleText:select.parentElement.parentElement.textContent};});
   report.layouts||=[];report.layouts.push({width,theme,lang,...state});
   const file=`plan-${width}-${theme}-${lang}.png`;await page.screenshot({path:path.join(out,file),fullPage:true});report.screens.push(file);
   check(`${width}/${theme}/${lang}: role labels, one zone and contained controls`,!state.overflow&&state.selectWidth>100&&state.zone===1&&state.labels===6&&state.options>0&&!state.oldInstructions&&state.theme===theme);
   if(lang==='en')check(`${width}/${theme}: English role names`,/Role/.test(state.roleText)&&!/Rolle/.test(state.roleText));
  }
  const projection=await page.evaluate(()=>{const c=v61CurrentCareer,p=v66Own(c).roster[0],ui=v156Projection(c,p);return {serialized:JSON.stringify(ui),keys:Object.keys(ui),pId:p.pid};});
  check('Projection exposes no talent, caps, routine or raw values',!/(talent|caps|routine|development|"value"|"rating")/.test(projection.serialized));
  await page.evaluate(pid=>v68OpenPlayerProfile(v61CurrentCareer,pid,null),projection.pId);
  check('Profile shows fixed recommendations and a best recommendation',await page.locator('.d6-profile-roles .d6-profile-role').count()>0&&await page.locator('.d6-profile-roles .is-best').count()===1);await page.screenshot({path:path.join(out,'profile.png')});
  await page.evaluate(()=>v61ProfileDialog.close());
  await page.evaluate(async()=>{const c=v61CurrentCareer,club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);const f=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v64UiRender(c);});
  check('Prematch uses the same role controller',await page.locator('[data-d6-role]').count()===1);
  await page.evaluate(()=>{const state=v65Context().state;state.phase='paused';v65PauseView=true;v65PauseTab='lineup';v65Show(v65Context());clearInterval(v65WorldFrame);v65PauseView=true;v65UpdateControls(v65Context());});
  await page.locator('#v65-plan-view [data-d6-role]').waitFor({state:'visible'});
  check('Halftime/pause shows the same role and one shared area',await page.locator('#v65-plan-view .d6-role-zone').count()===1);
  const choice=await page.locator('#v65-plan-view [data-d6-role] option').last().getAttribute('value');
  await page.locator('#v65-plan-view [data-d6-role]').selectOption(choice);
  await page.waitForFunction(r=>v65Context().state.roleAssignments[v64Active(v65Context().state,v65Context().ownSide)[v65SelectedSlot]].roleId===r,choice);
  check('Paused role edits support central undo',await page.evaluate(()=>{const context=v65Context(),before=context.state.pauseUndo.roleAssignments,expected=JSON.stringify(before);v65UndoLast(context);return JSON.stringify(context.state.roleAssignments)===expected;}));
  await page.screenshot({path:path.join(out,'pause.png'),fullPage:true});
  check('No browser runtime errors',report.errors.length===0);
 }catch(e){report.failure=e.stack;throw e;}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
 console.log(`${report.checks.length} tactical UI checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
