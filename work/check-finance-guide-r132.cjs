// B15: the top progress button only guides to the lower confirmation button; funding starts solely from that click.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=path.resolve('outputs/finance-guide-r132');fs.mkdirSync(output,{recursive:true});
const url=process.env.D6_TEST_URL||'http://127.0.0.1:4211/';
const hints={de:{1:'Bitte zuerst Jugendförderung bezahlen und Transfers öffnen bestätigen.',2:'Bitte zuerst Jugendförderung bezahlen und Saison 2 starten bestätigen.'},en:{1:'Please first confirm “Pay youth funding and open transfers”.',2:'Please first confirm “Pay youth funding and start season 2”.'}};
const budgetRows=()=>v66Own(v61CurrentCareer).ledger.filter(row=>row.season===v61CurrentCareer.world.season&&row.id.endsWith(':youth-budget')).length;
async function geometry(page){
 return page.evaluate(()=>{
  const button=document.querySelector('[data-v124-budget]'),rect=button.getBoundingClientRect(),dock=document.querySelector('.fl-bottom-dock'),dockRect=dock?dock.getBoundingClientRect():null;
  const hint=document.querySelector('.v124-budget-hint'),hintRect=hint?.getBoundingClientRect();
  const topElement=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
  return{rect:{top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right},viewport:{width:innerWidth,height:innerHeight},dock:dockRect&&{top:dockRect.top,bottom:dockRect.bottom,visible:dockRect.height>0&&getComputedStyle(dock).display!=='none'},
   hit:Boolean(topElement&&(topElement===button||button.contains(topElement))),focused:document.activeElement===button,hintRect:hintRect&&{top:hintRect.top,bottom:hintRect.bottom},hintCount:document.querySelectorAll('.v124-budget-hint').length,
   hintRole:hint?.getAttribute('role'),hintText:hint?.textContent,scrollWidthFits:document.documentElement.scrollWidth<=innerWidth+1};
 });
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.D6_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const results=[];
  for(const [view,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
   for(const language of ['de','en']){
    const context=await browser.newContext({viewport,hasTouch:view==='mobile',isMobile:view==='mobile'}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url);await page.waitForFunction(()=>typeof v124GuideToBudgetConfirm==='function'&&typeof window.doppel6Language==='object');
    await page.evaluate(lang=>window.doppel6Language.set(lang),language);
    await page.evaluate(async()=>{const career=await v61StoreNewCareer(v61CreateCareer('GER-2','finance-guide-r132'));v61CurrentCareer=career;v61CareerTab='overview';v61RenderCareer(career);});
    await page.locator('[data-v66-sponsor]').first().click();await page.waitForFunction(()=>!v67Busy&&v61CurrentCareer.world.market.phase==='budget');
    for(const season of [1,2]){
     if(season===2){
      await page.evaluate(async()=>{
       while(v61CurrentCareer.world.market.phase==='open')v66NextMarketDay(v61CurrentCareer);
       while(!v61CurrentCareer.world.seasonFinished)v62AdvanceDay(v61CurrentCareer);
       const transition=v61CurrentCareer.world.transition;transition.reviewStep=4;if(transition.choice===null)v67ChooseOffer(v61CurrentCareer,null);
       await v64UiSave();v61CareerTab='overview';v61RenderCareer(v61CurrentCareer);
      });
      await page.locator('[data-v124-next]').click();await page.waitForFunction(()=>v61CurrentCareer.world.season===2&&!v67Busy);
      await page.locator('[data-v66-sponsor]').first().click();await page.waitForFunction(()=>v61CurrentCareer.world.market.phase==='budget'&&!v67Busy);
     }
     await page.evaluate(()=>{v61SetCareerTab('overview');window.scrollTo(0,0);});
     const label=`${view}/${language}/season ${season}`;
     assert.equal(await page.locator('.v124-budget-hint').count(),0,label+': no hint before the guide');
     const progress=page.locator('[data-fl-lead]');assert(await progress.isVisible(),label+': top lead button visible');
     await progress.click();await page.waitForTimeout(1200);
     const after=await geometry(page);
     assert(after.focused,label+': confirmation button focused');
     assert.equal(await page.locator('[data-v124-budget]').getAttribute('aria-describedby'),'v124-budget-hint',label+': hint described');assert.equal(await page.locator('#v124-budget-hint').count(),1);
     assert.equal(after.hintCount,1,label+': exactly one hint');assert.equal(after.hintRole,'status');assert.equal(after.hintText.trim(),hints[language][season],label+': hint text');
     assert(after.rect.top>=0&&after.rect.bottom<=after.viewport.height,label+': button inside viewport '+JSON.stringify(after.rect));
     assert(after.hintRect.top>=0&&after.hintRect.bottom<=after.rect.top+1,label+': hint visible above button');
     assert(after.hit,label+': button not covered');
     if(after.dock?.visible)assert(after.rect.bottom<=after.dock.top+1,label+': button above dock');
     assert(after.scrollWidthFits,label+': no horizontal overflow');
     const state=await page.evaluate(()=>({phase:v61CurrentCareer.world.market.phase,saved:JSON.stringify(v61CurrentCareer).includes('Bitte zuerst')}));
     assert.equal(state.phase,'budget',label+': phase stays budget');assert.equal(state.saved,false,label+': hint is not part of the save');
     assert.equal(await page.evaluate(budgetRows),0,label+': no youth-budget booking from the guide');
     await progress.click();await page.waitForTimeout(600);
     assert.equal((await geometry(page)).hintCount,1,label+': repeated guide keeps a single hint');
     assert.equal(await page.evaluate(budgetRows),0,label+': still no booking');
     await page.screenshot({path:path.join(output,`${view}-${language}-season${season}.png`)});
     if(season===1&&language==='de'&&view==='desktop'){
      await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>window.scrollTo(0,0));await progress.click();await page.waitForTimeout(150);
      const reduced=await geometry(page);assert(reduced.rect.top>=0&&reduced.rect.bottom<=reduced.viewport.height,label+': reduced motion reaches target immediately');await page.emulateMedia({reducedMotion:'no-preference'});
     }
     await page.locator('[data-v124-budget]').click();await page.waitForFunction(()=>!v67Busy&&v61CurrentCareer.world.market.phase==='open');
     const booked=await page.evaluate(budgetRows);
     assert(booked<=1,label+': at most one booking');
     if(season===1)assert.equal(booked,1,label+': exactly one booking after the lower click');
     assert.equal(await page.locator('.v124-budget-hint').count(),0,label+': hint gone after confirmation');
     results.push({label,rect:after.rect,dock:after.dock,booked});
    }
    assert.deepEqual(errors,[]);await context.close();
   }
  }
  fs.writeFileSync(path.join(output,'browser-check.json'),JSON.stringify({checkedAt:new Date().toISOString(),results,status:'passed'},null,2));
  console.log('finance guide r132 passed:',results.length,'scenarios');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
