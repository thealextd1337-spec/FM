'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/youth-20years-20261011'),frozen=path.join(out,'source');process.chdir(frozen);
const {harness}=require(path.join(frozen,'work/world-expansion-harness-v167.cjs')),{context,call}=harness();
const G=vm.runInContext('D6PlayerGeneration',context),D=vm.runInContext('D6Development',context);
const q=p=>G.positionQuality(p,p.line),mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const groups={},career=call('v167CreateCareer','AUT-5','youth20-control','QA'),foundation=career.world.playerFoundation;
// Same identity, profile and all inputs except academy country: isolate the country pathway.
let countryPairs=0,countryMatches=0,budgetPairs=0,budgetMatches=0;
const countries=career.world.countries.map(c=>c.id);
for(let i=0;i<100;i++)for(const profile of [1,3,5]){
 let reference;
 for(const country of countries){const p={pid:'controlled:'+profile+':'+i,name:'QA',nation:'GER',age:17,line:['gk','def','mid','att'][i%4],fresh:100,form:0,history:[],seasons:[]};call('v153Generate',p,foundation,'youth',3,profile,country+'-1');const signature=JSON.stringify([G.SKILL_KEYS.map(k=>p[k]),p.playerModel.caps,p.playerModel.talent]);if(reference!==undefined){countryPairs++;countryMatches+=signature===reference;}else reference=signature;}
}
for(let i=0;i<1000;i++){
 const club=career.world.clubs.find(c=>c.id==='AUT-5'),saved=club.youthInvestmentHistory;club.youthInvestmentHistory=[];const a=call('v67Youth',career,club,4,i);
 club.youthInvestmentHistory=[1,2,3].map(season=>({season,amount:400}));const b=call('v67Youth',career,club,4,i);club.youthInvestmentHistory=saved;
 const signature=p=>JSON.stringify([G.SKILL_KEYS.map(k=>p[k]),p.playerModel.caps,p.playerModel.talent]);budgetPairs++;budgetMatches+=signature(a)===signature(b);
}
assert.equal(countryMatches,countryPairs);assert.equal(budgetMatches,budgetPairs);
for(let seed=0;seed<12;seed++){
 const c=call('v167CreateCareer','AUT-5','generation-control-'+seed,'QA');
 for(const club of c.world.clubs.filter(c=>c.leagueId)){
  const key=club.countryId,row=groups[key]??={country:key,tier:club.expansionTier,start:[],startPrime:[],youth:[],byPosition:{},profiles:{},budget:[],initialYouthPool:0};
  row.budget.push(club.youthBudget);row.initialYouthPool+=club.youthPool.length;
  for(const p of club.roster){row.start.push(q(p));if(p.age>=24&&p.age<=29)row.startPrime.push(q(p));const r=row.byPosition[p.line]??={start:[],youth:[]};r.start.push(q(p));}
  for(const p of club.youthPool){row.youth.push(q(p));row.byPosition[p.line]??={start:[],youth:[]};row.byPosition[p.line].youth.push(q(p));const r=row.profiles[club.policy.youth]??={n:0,sum:0};r.n++;r.sum+=q(p);}
 }
}
const ideal=[];
for(let i=0;i<240;i++){
 const club=career.world.clubs.filter(c=>c.leagueId)[i%96],p=call('v67Youth',career,club,4,i),initial=q(p),weights=G.POSITION_WEIGHTS?.[p.line];
 const approved=weights||Object.fromEntries(G.SKILL_KEYS.map(k=>[k,1]));let ledger=D.createLedger(p.pid,career.world.seed,1),skills=Object.fromEntries(G.SKILL_KEYS.map(k=>[k,p[k]]));
 for(let season=1;season<=7;season++){
  if(season>1)ledger=D.resetSeason(ledger,season);
  for(let match=0;match<28;match++){
   const change=D.developmentDelta({id:p.pid,age:16+season,talent:p.playerModel.talent,skills,caps:p.playerModel.caps},ledger,{id:'ideal:'+season+':'+match,worldId:career.world.seed,seasonId:season,minutes:90,rating:7,skillWeights:approved,fullSeasonMinutes:1260},approved);
   assert(['applied','no-change'].includes(change.status));for(const k of G.SKILL_KEYS)skills[k]+=change.skillDelta[k];ledger=change.nextLedger;
  }
 }
 ideal.push({country:club.countryId,profile:club.policy.youth,line:p.line,initial,at24:G.positionQuality(skills,p.line),totalMinutes:7*28*90,condition:'28 full games per season, always rating 7, position-proportional skill weights; scenario only, not a native match history'});
}
fs.writeFileSync(path.join(out,'controls.json'),JSON.stringify({countryPairs,countryMatches,budgetPairs,budgetMatches,groups,ideal,idealWeights:'confirmed primary-position weights (diagnostic allocation only)',baselineSeeds:12},null,2));
console.log(JSON.stringify({countryPairs,countryMatches,budgetPairs,budgetMatches,baselineSeeds:12,idealPlayers:ideal.length,idealRelativeGrowth:mean(ideal.map(p=>p.at24))/mean(ideal.map(p=>p.initial))-1}));
