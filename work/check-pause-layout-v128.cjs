const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const rows=[],errors=[];
  for(const viewport of [{width:1632,height:956},{width:844,height:390},{width:667,height:375},{width:390,height:844}].filter(v=>!process.env.D6_LAYOUT_WIDTH||v.width===Number(process.env.D6_LAYOUT_WIDTH))){
   const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.resolve('outputs/Doppel-6-Fussballmanager.html')).href);await page.waitForFunction(()=>window.d6Pitch3D&&v61StorageReady);
   await page.evaluate(async()=>{
    const career=v61CreateCareer('ESP-1','pause-layout-v128'),club=career.world.clubs.find(c=>c.id==='ESP-1');
    v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')v66NextMarketDay(career);
    const fixture=v62Fixtures(career).find(f=>!f.result&&(f.homeId==='ESP-1'||f.awayId==='ESP-1'));
    career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;await v61SaveCareers([career]);career.world.activeMatch.state.phase='live';v65Show(v65Context());clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();
    const c=v65Context();c.state.phase='paused';v65PauseView=true;v65PauseTab='lineup';v65SelectedSlot=v64Active(c.state,c.ownSide).findIndex(pid=>c.state.roles[pid]==='att');running=false;v65UpdateControls(c);v58Refresh();
   });
   const geometry=()=>page.evaluate(()=>{
    const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const field=rect('#v65-plan-view .v64-prematch-field'),side=rect('.v65-pause-controls'),panel=rect('#v65-controls');
    const outside=[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().width&&el.getBoundingClientRect().x+el.scrollWidth>innerWidth+1).map(el=>({tag:el.tagName,id:el.id,classes:el.className,right:el.getBoundingClientRect().right,scrollWidth:el.scrollWidth,text:el.textContent.slice(0,55)})).slice(0,10);
    return {field,side,panel,outside,pageOverflow:document.documentElement.scrollWidth>innerWidth+1,overflow:document.querySelector("#game-screen .workspace").scrollWidth>document.querySelector("#game-screen .workspace").clientWidth+1,controlOverflow:document.querySelector('#v65-controls').scrollWidth>panel.width+1,tabs:document.querySelectorAll('#v65-pause-tabs').length,panels:document.querySelectorAll('#v65-controls').length};
   });
   const initial=await geometry();assert(!initial.overflow&&!initial.controlOverflow,JSON.stringify({viewport,initial}));assert.equal(initial.tabs,1);assert.equal(initial.panels,1);
   if(viewport.width>=600){assert(initial.side.x>=initial.field.right-1);assert(Math.abs(initial.side.y-initial.field.y)<2);}else assert(initial.side.y>=initial.field.bottom);
   const original=await page.evaluate(()=>{const c=v65Context(),pid=v64Active(c.state,c.ownSide)[v65SelectedSlot];return {pid,orientation:v64Orientation(c.state,pid),time:match.elapsed,score:[...match.score]};});
   const next=original.orientation===1?-1:1;await page.locator('[data-v64-orientation="'+next+'"]').click();assert.equal(await page.evaluate(pid=>v64Orientation(v65Context().state,pid),original.pid),next);
   await page.locator('[data-v64-instruction="shoot"]').click();assert(await page.evaluate(pid=>v64PlayerInstructions(v65Context().state,pid).includes('shoot'),original.pid));
   await page.locator('[data-v65-undo]').click();assert(!await page.evaluate(pid=>v64PlayerInstructions(v65Context().state,pid).includes('shoot'),original.pid));
   await page.locator('#v65-plan-view .v64-prematch-field').scrollIntoViewIfNeeded();await page.screenshot({path:'outputs/pause-layout-'+viewport.width+'-de-v128.png',fullPage:true});
   await page.locator('[data-v65-tab="tactics"]').click();assert(await page.locator('#v65-controls .v64-tactics').isVisible());const tacticGeometry=await geometry();assert(!tacticGeometry.overflow&&!tacticGeometry.controlOverflow,JSON.stringify({viewport,tacticGeometry}));
   const pressing=await page.evaluate(()=>v65Context().state.tactics[v65Context().ownSide].pressing),newPress=pressing==='Früh'?'Abwartend':'Früh';await page.locator('[data-v64-tactic-key="pressing"][data-v64-tactic-value="'+newPress+'"]').click();assert.equal(await page.evaluate(()=>v65Context().state.tactics[v65Context().ownSide].pressing),newPress);
   await page.locator('[data-v65-tab="lineup"]').click();assert.equal(await page.evaluate(pid=>v64Orientation(v65Context().state,pid),original.pid),next);
   await page.evaluate(()=>doppel6Language.set('en'));await page.waitForFunction(()=>document.querySelector('#v65-controls')?.textContent.includes('Individual role'));assert(!(await geometry()).overflow);
   await page.screenshot({path:'outputs/pause-layout-'+viewport.width+'-en-v128.png',fullPage:true});
   const untouched=await page.evaluate(()=>({time:match.elapsed,score:[...match.score]}));assert.equal(untouched.time,original.time);assert.deepEqual(untouched.score,original.score);
   await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();running=false;});assert.equal(await page.locator('#match-info #v65-controls').count(),1);assert(!(await page.locator('#v65-plan-view').isVisible()));
   await page.evaluate(()=>{const c=v65Context();c.state.phase='paused';v65PauseView=true;v65PauseTab='lineup';v65UpdateControls(c);});assert.equal(await page.locator('.v65-pause-controls #v65-controls').count(),1);assert.equal(await page.locator('#v65-pause-tabs').count(),1);
   await page.locator('#v65-plan-view [data-v65-pick-slot="1"]').click({position:{x:5,y:5}});assert.equal(await page.evaluate(()=>v65SelectedSlot),1);assert(await page.locator('#v65-controls .v64-orientation').isVisible());
   rows.push({viewport,initial,tacticGeometry,orientation:true,instructions:true,undo:true,tactics:true,language:true,pauseTimeUnchanged:true,reopened:true});await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync('outputs/pause-layout-qa-v128.json',JSON.stringify({rows,errors},null,2)+'\n');console.log(JSON.stringify(rows.map(r=>({viewport:r.viewport,overflow:r.initial.overflow,reopened:r.reopened})),null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});





