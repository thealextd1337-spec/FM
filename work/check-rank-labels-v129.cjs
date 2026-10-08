const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const rows=[],errors=[];
  for(const viewport of [{width:1632,height:956},{width:390,height:844}]){
   const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.resolve('outputs/Doppel-6-Fussballmanager.html')).href);await page.waitForFunction(()=>v61StorageReady&&window.d6Pitch3D);
   const result=await page.evaluate(()=>{
    const c=v61CreateCareer('ESP-1','rank-labels-v129'),comps=v62Current(c),league=comps.find(q=>q.type==='league'&&q.country==='ESP'),europe=comps.find(q=>q.type==='europe'),cup=comps.find(q=>q.type==='cup'&&q.country==='ESP');
    league.fixtures.filter(f=>f.round==='R1').forEach((f,i)=>{f.result={homeGoals:i+2,awayGoals:0};});europe.fixtures.filter(f=>f.round==='R1').forEach((f,i)=>{f.result={homeGoals:0,awayGoals:i+1};});
    const lf=league.fixtures.find(f=>f.round==='R2'&&(f.homeId==='ESP-1'||f.awayId==='ESP-1')),ef=europe.fixtures.find(f=>f.round==='R2'&&(f.homeId==='ESP-1'||f.awayId==='ESP-1')),cf=cup.fixtures.find(f=>f.homeId==='ESP-1'||f.awayId==='ESP-1')||cup.fixtures[0];
    v61CurrentCareer=c;
    const examples=[];
    for(const f of [lf,ef,cf,{...ef,round:'QF',leg:1}]){
     const comp=comps.find(q=>q.id===f.competitionId),ids=comp.type==='europe'?comp.entrants:[...new Set(comp.fixtures.flatMap(g=>[g.homeId,g.awayId]))],eligible=comp.type==='league'||comp.type==='europe'&&/^R\d+$/.test(f.round),table=eligible?v62Table(comp,ids):[];
     const expected=[f.homeId,f.awayId].map(id=>{const name=c.world.clubs.find(q=>q.id===id).name,index=table.findIndex(q=>q.clubId===id);return name+(index>=0?' ('+(index+1)+'.)':'');});
     const state=v64MakeState(c,f),before=JSON.stringify(c),preview=document.createElement('div'),board=document.createElement('div');preview.innerHTML=v62NextOpponentHTML(c,f);board.innerHTML=v64UiScreenHTML(c,f,state);
     const ownSide=f.homeId==='ESP-1'?0:1,labels=v65LiveRankLabels({career:c,fixture:f,ownSide});
     examples.push({type:comp.type,round:f.round,expected,preview:[...preview.querySelectorAll('.v49-club>strong>span:last-child')].map(q=>q.textContent),preparation:[...board.querySelectorAll('.v64-board-club>strong')].map(q=>q.textContent),separateRank:preview.querySelectorAll('.v128-competition-standing').length+board.querySelectorAll('.v64-board-club>small').length,labels,expectedLabels:[ownSide,1-ownSide].map(side=>{const id=side===0?f.homeId:f.awayId,index=table.findIndex(q=>q.clubId===id);return index>=0?'('+(index+1)+'.)':'';}),roundInHeader:preview.querySelector('p').textContent,unchanged:before===JSON.stringify(c)});
    }
    const state=v64MakeState(c,lf);c.world.activeMatch={fixtureId:lf.id,state};v64UiRender(c);v64UiTab='tactics';v64UiRender(c);v64UiStop();return {examples};
   });
   for(const ex of result.examples){assert.deepEqual(ex.preview,ex.expected);assert.deepEqual(ex.preparation,ex.expected);assert.deepEqual(ex.labels,ex.expectedLabels);assert.equal(ex.separateRank,0);assert(ex.unchanged);if(ex.round==='QF')assert(ex.roundInHeader.includes('Viertelfinale'));}
   assert(await page.locator('.v64-tactics').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'outputs/rank-preparation-'+viewport.width+'-de-v129.png',fullPage:true});
   await page.evaluate(()=>doppel6Language.set('en'));await page.waitForFunction(()=>document.querySelector('.v64-controls')?.textContent.includes('Team tactics'));assert.deepEqual(await page.locator('.v64-board-club>strong').allTextContents(),result.examples[0].expected);await page.screenshot({path:'outputs/rank-preparation-'+viewport.width+'-en-v129.png',fullPage:true});
   const live=await page.evaluate(()=>{const c=v61CurrentCareer;c.world.activeMatch.state.phase='live';v65Show(v65Context());clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();running=false;v25UpdateLiveBoard();const names=[...document.querySelectorAll('#match-area .score-name-text')].map(q=>q.textContent);const ctx=v65Context();return {names,expected:[ctx.ownSide,1-ctx.ownSide].map(side=>{const f=ctx.fixture,id=side===0?f.homeId:f.awayId;return c.world.clubs.find(q=>q.id===id).name+' '+v62FixtureRankLabels(c,f).get(id);})};});assert.deepEqual(live.names,live.expected);
   rows.push({viewport,...result,live,english:true,noPreparationOverflow:true});await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync('outputs/rank-labels-qa-v129.json',JSON.stringify({rows,errors},null,2)+'\n');console.log(JSON.stringify(rows.map(r=>({viewport:r.viewport,contexts:r.examples.length,live:r.live.names})),null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

