const fs=require('fs'),vm=require('vm');

const testSource=fs.readFileSync('work/test-v17.cjs','utf8');
const harness=testSource.slice(0,testSource.indexOf('const context=makeContext();'));
const makeContext=new Function('require',`${harness}\nreturn makeContext;`)(require);

const profiles={
 weak:[[2,1],[2,1],[2,1],[1,1],[1,1],[0,1],[0,1],[0,1],[0,1],[0,1]],
 balanced:[[2,1],[2,1],[2,1],[2,1],[1,1],[1,1],[1,1],[0,1],[0,1],[0,1]],
 strong:[[2,1],[2,1],[2,1],[2,1],[2,1],[1,1],[1,1],[0,1],[0,1],[0,1]]
};

function evaluate(context,source){return vm.runInContext(source,context)}
function snapshot(context){return JSON.parse(JSON.stringify(evaluate(context,`(()=>{const finance=ensureFinance(activeSave),salary=finance.ledger.find(entry=>entry.key==='salary-'+activeSave.seasonNumber)?.amount||0,user=activeSave.table.find(team=>team.id==='user');return{season:activeSave.seasonNumber,balance:finance.balance,payroll:-salary,sponsor:finance.sponsor.paidAmount||0,results:finance.resultCredits[activeSave.seasonNumber]||0,gameOver:finance.gameOver,w:user.w,d:user.d,l:user.l,active:activeRosterSize(),retired:activeSave.transfer?.retirements?.length||0}})()`)))}
function prepareSeason(context){
 evaluate(context,`selectSponsor('safe')`);
 let guard=0;
 while(evaluate(context,`Boolean(activeSave.keeper?.retired)`)){
  const id=evaluate(context,`activeSave.transfer.offers.find(offer=>offer.kind==='free'&&offer.status==='active'&&offer.player.keeper)?.id`);if(!id)break;evaluate(context,`signFreeAgent('${id}')`);if(++guard>3)break;
 }
 guard=0;
 while(evaluate(context,`activeOutfield().length<6`)){
  const id=evaluate(context,`activeSave.transfer.offers.find(offer=>offer.kind==='free'&&offer.status==='active'&&!offer.player.keeper)?.id`);if(!id)break;evaluate(context,`signFreeAgent('${id}')`);if(++guard>8)break;
 }
 evaluate(context,`if(transferState().open)forceTransferDeadline();saveCurrent()`);
 return evaluate(context,`validMatchSquad()&&!transferState().open`);
}
function simulate(seed,profileName){
 const context=makeContext(),scores=profiles[profileName];
 evaluate(context,`let financeSeed=${seed};Math.random=()=>((financeSeed=(financeSeed*1664525+1013904223)>>>0)/4294967296);beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe')`);
 const seasons=[];
 for(let season=1;season<=12;season++){
  if(season>1&&!prepareSeason(context))return{seed,profile:profileName,survived:false,failedSeason:season,seasons};
  for(const score of scores){
   const started=evaluate(context,`start();Boolean(match&&!match.finished)`);if(!started)return{seed,profile:profileName,survived:false,failedSeason:season,seasons,reason:'match-blocked'};
   evaluate(context,`match.score=[${score[0]},${score[1]}];finishMatch()`);
  }
  seasons.push(snapshot(context));
  if(evaluate(context,`ensureFinance(activeSave).gameOver`))return{seed,profile:profileName,survived:false,failedSeason:season,seasons};
  if(season<12)evaluate(context,`startNextSeason()`);
 }
 return{seed,profile:profileName,survived:true,failedSeason:null,seasons};
}

const runs=[];
for(const profile of Object.keys(profiles))for(let seed=1;seed<=5;seed++)runs.push(simulate(seed,profile));
const summary={};
for(const profile of Object.keys(profiles)){
 const items=runs.filter(run=>run.profile===profile),survivors=items.filter(run=>run.survived),finals=survivors.map(run=>run.seasons.at(-1).balance),failures=items.filter(run=>!run.survived);
 summary[profile]={runs:items.length,survived:survivors.length,survivalRate:`${Math.round(survivors.length/items.length*100)}%`,minFinal:finals.length?Math.min(...finals):null,maxFinal:finals.length?Math.max(...finals):null,averageFinal:finals.length?Math.round(finals.reduce((sum,value)=>sum+value,0)/finals.length):null,earliestFailure:failures.length?Math.min(...failures.map(run=>run.failedSeason)):null};
}
const representative=runs.find(run=>run.profile==='balanced'&&run.seed===3);
console.log(JSON.stringify({summary,representative:representative.seasons},null,2));
if(summary.balanced.survived<4)process.exitCode=1;
