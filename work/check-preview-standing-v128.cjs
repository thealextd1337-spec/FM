const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const rows=[],errors=[];
  for(const viewport of [{width:1632,height:956},{width:390,height:844}]){
   const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.resolve('outputs/Doppel-6-Fussballmanager.html')).href);await page.waitForFunction(()=>v61StorageReady);
   const result=await page.evaluate(()=>{
    const c=v61CreateCareer('ESP-1','preview-standing-v128'),competitions=v62Current(c),league=competitions.find(q=>q.type==='league'&&q.country==='ESP'),europe=competitions.find(q=>q.type==='europe'),cup=competitions.find(q=>q.type==='cup'&&q.country==='ESP');
    const lg=league.fixtures.find(f=>f.round==='R2'&&(f.homeId==='ESP-1'||f.awayId==='ESP-1')),eg=europe.fixtures.find(f=>f.round==='R2'&&(f.homeId==='ESP-1'||f.awayId==='ESP-1'));
    const preview=f=>{const el=document.createElement('div');el.innerHTML=v62NextOpponentHTML(c,f);return {html:el.innerHTML,status:[...el.querySelectorAll('.v128-competition-standing')].map(q=>q.textContent)};};
    const ranks=(comp,f)=>{const ids=comp.type==='europe'?comp.entrants:[...new Set(comp.fixtures.flatMap(g=>[g.homeId,g.awayId]))],table=v62Table(comp,ids);return [f.homeId,f.awayId].map(id=>'Platz '+(table.findIndex(q=>q.clubId===id)+1));};
    const zero=preview(lg),zeroExpected=ranks(league,lg);
    league.fixtures.filter(f=>f.round==='R1').forEach((f,i)=>{f.result={homeGoals:i+2,awayGoals:0};});
    europe.fixtures.filter(f=>f.round==='R1').forEach((f,i)=>{f.result={homeGoals:0,awayGoals:i+1};});
    const stored=JSON.stringify(c),leaguePreview=preview(lg),europePreview=preview(eg),cupPreview=preview(cup.fixtures[0]),euroKnockout=preview({...eg,round:'QF',leg:1}),semi=preview({...cup.fixtures[0],round:'SF'}),final=preview({...cup.fixtures[0],round:'F'});
    const unchanged=stored===JSON.stringify(c);startScreen.hidden=true;v61WorldScreen.hidden=false;v61WorldScreen.innerHTML=leaguePreview.html+europePreview.html+cupPreview.html+euroKnockout.html;
    return {zero:zero.status,zeroExpected,league:leaguePreview.status,leagueExpected:ranks(league,lg),europe:europePreview.status,europeExpected:ranks(europe,eg),cup:cupPreview.status,knockout:euroKnockout.status,semi:semi.status,final:final.status,unchanged};
   });
   assert.deepEqual(result.zero,result.zeroExpected);assert.deepEqual(result.league,result.leagueExpected);assert.deepEqual(result.europe,result.europeExpected);assert.deepEqual(result.cup,['Runde: Viertelfinale','Runde: Viertelfinale']);assert.deepEqual(result.knockout,result.cup);assert.deepEqual(result.semi,['Runde: Halbfinale','Runde: Halbfinale']);assert.deepEqual(result.final,['Runde: Finale','Runde: Finale']);assert(result.unchanged);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'outputs/preview-standing-'+viewport.width+'-de-v128.png',fullPage:true});
   await page.evaluate(()=>doppel6Language.set('en'));await page.waitForFunction(()=>document.querySelector('.v128-competition-standing')?.textContent.startsWith('Position'));
   assert(await page.locator('.v128-competition-standing').allTextContents().then(labels=>labels.some(x=>x==='Round: Quarter-final')));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'outputs/preview-standing-'+viewport.width+'-en-v128.png',fullPage:true});
   rows.push({viewport,...result,english:true,noOverflow:true});await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync('outputs/preview-standing-qa-v128.json',JSON.stringify({rows,errors},null,2)+'\n');console.log(JSON.stringify(rows,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
