'use strict';
// Prints the kit payload that a real club-world fixture sends to Unity.
//   node work/platform/qa/probe-world-kits.cjs
const path=require('node:path');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('../../ui-redesign/serve.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser`);
  await page.waitForFunction(()=>window.userMeshyMatchReady,{},{timeout:60000});
  console.log(JSON.stringify(await page.evaluate(async()=>{
   const c=v61CreateCareer('GER-2','visual-iteration'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
   const f=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v65Show(v65Context());clearInterval(v65WorldFrame);
   const ctx=v65Context(),teams=[v65Club(ctx,0),v65Club(ctx,1)];
   return {teams:teams.map(t=>({id:t.id,name:t.name,kits:t.kits})),matchKits:match.kits,people:match.people.map(p=>({pid:p.pid,t:p.t,n:p.n,keeper:p.keeper})),payload:teams.flatMap((club,team)=>club.roster.slice(0,2).map(p=>D6WorldUnityContract.player(p,team,p.keeper?(team===0?match.kits.userKeeper:match.kits.opponentKeeper):(team===0?match.kits.user:match.kits.opponent)))),goalsShape:match.goals};
  }),null,1));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
