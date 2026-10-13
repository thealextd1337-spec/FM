'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/youth-comparison-20years-20261011');fs.mkdirSync(out,{recursive:true});
process.chdir(path.join(root,'outputs/youth-20years-20261011/source'));
const {harness}=require(path.join(root,'work/youth-audit-native-harness.cjs')),api=harness(),{call,evaluate}=api;
api.run('world-expansion-stories-v170.js');
const career=call('v167CreateCareer','AUT-5','youth20-a','Nachwuchsanalyse');globalThis.v61CurrentCareer=career;
globalThis.auditComparisonVariant='status';globalThis.auditStatusRows=[];
evaluate(fs.readFileSync(path.join(root,'work/youth-comparison-hooks-20261011.js'),'utf8'));call('auditInitYouthStatus',career);
const scenarios=[];
for(const budget of [0,500,1000,1500])for(const sport of [0,50,100]){let s=50;const history=[];for(let year=1;year<=20;year++){s=call('auditStatusStep',s,budget,sport).status;history.push(s);}scenarios.push({budget,sport,history});assert(history.every(x=>x>=0&&x<=100));}
assert(call('auditStatusStep',50,1000,100).status>call('auditStatusStep',50,1000,0).status);
assert.equal(call('auditStatusStep',50,0,0).status,47.5);
assert.equal(call('auditStatusStep',50,1500,100).status,57.5);
const counts=[];
for(const amount of [0,500,1000,1500]){const samples=Array.from({length:1000},(_,i)=>call('auditCandidateCount',amount,i/1000));counts.push({amount,min:Math.min(...samples),max:Math.max(...samples),mean:samples.reduce((s,n)=>s+n,0)/samples.length});}
assert.deepEqual(counts.map(r=>[r.min,r.max]),[[1,2],[3,4],[5,5],[6,6]]);
const checks=[];
const gen=evaluate('D6PlayerGeneration');
career.world.season=2; // Pure generation controls, not a played career transition.
for(const variant of ['status','country']){
 globalThis.auditComparisonVariant=variant;
 for(const country of ['ENG','POR','AUT','GRE'])for(const status of [10,30,50,70,90]){
  const club=career.world.clubs.find(c=>c.id===country+'-1');club.auditYouthStatus=status;
  const nativeParams=career.world.playerFoundation.parameters,rows=nativeParams.qualityByKind.youth.map(r=>({...r,byQuality:{...r.byQuality,weak:r.byQuality.normal,strong:r.byQuality.normal}})),normalParams={...nativeParams,qualityByKind:{...nativeParams.qualityByKind,youth:rows}};
  let ratios=[],sameTalents=0;
  for(let slot=0;slot<60;slot++){
   const p=call('v67Youth',career,club,2,slot),context={id:p.pid,age:17,mainPosition:p.line,kind:'youth',clubQuality:career.world.playerFoundation.qualityMapping[club.policy.startingSquad],youthQuality:career.world.playerFoundation.qualityMapping[club.policy.youth]};
   const native=gen.generatePlayer(context,normalParams,call('v61Random',`${p.pid}:player-foundation-2`));
   const ratio=gen.positionQuality(p,p.line)/gen.positionQuality(native.skills,p.line);
   const expected=1+call('auditStatusPct',status)+(variant==='country'?{ENG:.03,POR:.01,AUT:0,GRE:-.02}[country]:0);
   assert(Math.abs(ratio-expected)<1e-10);assert.equal(p.playerModel.talent,native.talent);sameTalents++;
   for(const k of gen.SKILL_KEYS){assert(p[k]>=1&&p[k]<=20);assert(p.playerModel.caps[k]>=p[k]&&p.playerModel.caps[k]<=20);}
   ratios.push(ratio);
  }
  checks.push({variant,country,status,meanRatio:ratios.reduce((s,n)=>s+n,0)/ratios.length,unchangedTalents:sameTalents});
 }
}
// Funding must stay affordable and discrete, even with empty reserves.
const budgetChecks=[];
for(const profile of [1,2,3,4,5])for(const free of [0,1000,3000,5000,10000]){
 const club=career.world.clubs.find(c=>c.id==='ENG-1'),oldBalance=club.balance,oldProfile=club.policy.youth;club.policy.youth=profile;club.balance=call('v66SalaryDue',career,club.id)+450+free;
 const amount=call('v67AiBudget',career,club);assert([0,500,1000,1500].includes(amount));assert(amount<=free*.22);budgetChecks.push({profile,free,amount});club.balance=oldBalance;club.policy.youth=oldProfile;
}
fs.writeFileSync(path.join(out,'controls.json'),JSON.stringify({pass:true,scenarios,counts,generatorCases:checks,budgetChecks,generatedPlayersChecked:checks.length*60,talentDistribution:'Native static academy profiles and population weights retained; no talent reweighting in this experiment.'},null,2));
console.log(JSON.stringify({pass:true,generatedPlayersChecked:checks.length*60,counts}));
