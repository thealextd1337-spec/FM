const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function harness(modern=true){
 let nextId=0;
 const context=vm.createContext({crypto:{randomUUID:()=>`finance-${++nextId}`}});
 for(const file of ['world-catalog-v61.js','world-nationalities-v79.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
 const source=fs.readFileSync('dist/world-foundation-v61.js','utf8');
 vm.runInContext(source.slice(0,source.indexOf('const v61Panel=')),context);
 for(const file of ['world-economy-v66.js','world-transfer-list-v72.js','world-youth-manager-v67.js','world-honours-v74.js',...(modern?['world-payments-v124.js']:[])])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
 const call=(name,...args)=>vm.runInContext(name,context)(...args);
 function market(career){
  const club=call('v66Club',career,career.manager.managedClubId);
  call('v66ChooseSponsor',career,club.id,club.sponsors[0].id);
  assert.equal(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true,'Sponsor-/Budgetzustand muss vor der Kaderergänzung speicherbar sein');
  if(career.world.market.phase==='budget')call('v124SetYouthBudget',career,Math.min(200,call('v67BudgetLimit',club)));
  let guard=0;
  while(career.world.market.phase==='open'&&guard++<14){
   while(club.roster.length<10&&club.youthPool.length){try{call('v67Promote',career,club.id,club.youthPool[0].pid)}catch{break}}
   const pending=career.world.market.pendingBids.filter(item=>item.buyerId===club.id&&item.status==='pending'),ids=new Set(pending.map(item=>item.pid));
   const keeperPending=()=>[...ids].some(pid=>call('v66Player',career,pid)?.keeper);
   const missing=Math.max(0,10-club.roster.length-pending.length,!club.roster.some(item=>item.keeper)&&!keeperPending()?1:0);
   for(let index=0;index<missing;index++){
    const needKeeper=!club.roster.some(item=>item.keeper)&&!keeperPending();
    const player=career.world.market.freePlayers.filter(item=>(!needKeeper||item.keeper)&&!ids.has(item.pid)&&!career.world.market.decisions.some(decision=>decision.pid===item.pid&&decision.buyerId===club.id&&['rejected','expired'].includes(decision.status))).sort((a,b)=>call('v66Salary',a)-call('v66Salary',b))[0];
    assert(player,`Freier Spieler fehlt: Saison ${career.world.season}`);
    call('v66MakeBid',career,club.id,player.pid,0,Math.max(100,Math.round(call('v66Salary',player)*1.25/10)*10),2,2);ids.add(player.pid);
   }
   try{call('v66NextMarketDay',career)}catch(error){if(!/mindestens zehn Profis/.test(error.message))throw error}
  }
  assert.equal(career.world.market.phase,'closed');
 }
 function next(career){
  if(career.world.transition.choice===null)call('v67ChooseOffer',career,null);
  if(!modern)call('v67SetBudget',career,Math.min(200,call('v67BudgetLimit',call('v66Club',career,career.manager.managedClubId))));
  call('v62NextSeason',career);
 }
 return{call,context,market,next};
}
module.exports={harness};
