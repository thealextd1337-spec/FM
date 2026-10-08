const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const file=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
let setupSource=file.slice(file.indexOf('async function setup('),file.indexOf('async function complete('));
setupSource=setupSource.replace(' await page.evaluate(({view,fixtureSide,graphicsAtTick})=>{',' await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});\n await page.evaluate(({view,fixtureSide,graphicsAtTick})=>{');
const setup=vm.runInNewContext(setupSource+';setup',{url:pathToFileURL(path.resolve('outputs/Doppel-6-Fussballmanager.html')).href});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page,'2d',undefined,null,false);
  const cases=await page.evaluate(()=>{
   const cases=[],reset=()=>{clearInterval(v65WorldFrame);v102StopPaint();v65CreateMatch(v65Context());running=false;match.kickoff=null;match.countdown=0;match.postBanner=null;hideOverlay();return {p:match.people.find(p=>p.t===0&&!p.keeper),k:v50Keeper(1)}};
   for(const outcome of ['goal','save-caught','save-parried','wide']){
    const {p,k}=reset(),base=Math.random;Math.random=()=>outcome==='save-parried'?0:.99;
    try{v50FinishPenalty({taker:p,team:0,outcome:outcome.startsWith('save')?'save':outcome})}finally{Math.random=base}
    cases.push({kind:outcome,score:[...match.score],shooter:{...p.stats},keeper:{...k.stats},events:structuredClone(match.ballAccounting.events)});
   }
   // Actual kickoff creates no attempt; a restored legacy match stays untracked.
   const {p,k}=reset();delete match.ballAccounting;const base=Math.random;Math.random=()=>0;
   try{v50FinishPenalty({taker:p,team:0,outcome:'goal'})}finally{Math.random=base}
   cases.push({kind:'legacy',tracked:!!match.ballAccounting,score:[...match.score],keeper:{...k.stats}});
   return cases;
  });
  for(const c of cases){
   if(c.kind==='legacy'){assert(!c.tracked);assert.deepEqual(c.score,[1,0]);continue}
   assert.equal(c.events.filter(e=>e.shot).length,1);assert.equal(c.shooter.shots,1);
   assert.equal(c.keeper.faced,c.keeper.saves+c.keeper.shotConceded);assert.equal(c.keeper.conceded,c.keeper.shotConceded+c.keeper.nonShotConceded);
   assert.equal(c.keeper.saves,c.keeper.savesCaught+c.keeper.savesParried);assert.equal(c.shooter.onTarget,c.keeper.faced);
   assert.equal(c.events[0].result,c.kind==='goal'?'goal':c.kind==='wide'?'off-target':c.kind==='save-caught'?'caught':'parried');
   if(c.kind==='save-parried')assert.equal(c.events[1].parentId,c.events[0].id);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync('docs/spieler-nutzer-rig/shot-accounting-native-v117.json',JSON.stringify({cases,errors,passed:true},null,2)+'\n');console.log(cases.length+' native accounting cases passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
