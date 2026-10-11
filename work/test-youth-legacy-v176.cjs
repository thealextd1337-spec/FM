'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {harness}=require('./world-expansion-harness-v167.cjs'),{call,run,copy,context}=harness();
const old=call('v167CreateCareer','AUT-5','youth-old','QA'),oldWorld=JSON.stringify(old.world);
run('world-youth-legacy-v176.js');assert(call('v61ValidateCareer',old));assert.equal(JSON.stringify(old.world),oldWorld);
const c=call('v167CreateCareer','AUT-5','youth-new','QA');context.v61CurrentCareer=c;assert(call('v61ValidateCareer',c));
const club=c.world.clubs.find(c=>c.id==='AUT-5');call('v66ChooseSponsor',c,club.id,club.sponsors[0].id);
const before=JSON.stringify(c.world);assert.throws(()=>call('v124SetYouthBudget',c,200));assert.equal(JSON.stringify(c.world),before);
call('v124SetYouthBudget',c,1500);assert.equal(club.youthBudget,1500);assert.throws(()=>call('v124SetYouthBudget',c,500));
for(let i=0;i<5;i++)call('v66NextMarketDay',c);assert(call('v61ValidateCareer',copy(c)));
const frozen=JSON.stringify(club.youthLegacy.expectation);call('v176FreezeExpectations',c);assert.equal(JSON.stringify(club.youthLegacy.expectation),frozen);
assert.equal(call('v176Quality',10),-.12);assert.equal(call('v176Quality',90),.12);assert(call('v176Quality',59)>call('v176Quality',58));
const rows=[];
for(const amount of [0,500,1000,1500]){
 const probe=copy(c),p=probe.world.clubs.find(c=>c.id==='AUT-5');p.youthInvestmentHistory=[{season:1,amount},{season:2,amount}];let count=0;const positions={gk:0,def:0,mid:0,att:0};
 for(let s=3;s<63;s++){probe.world.season=s;const n=call('v176Count',probe,p,amount);count+=n;for(let slot=0;slot<n;slot++){const player=call('v67Youth',probe,p,s,slot);positions[player.line]++;assert.equal(player.keeper,player.line==='gk');assert.equal(player.playerModel.development.playerId,player.pid);for(const key of Object.keys(player.playerModel.caps)){assert(player[key]>=1&&player[key]<=20);assert(player.playerModel.caps[key]>=player[key]);}}}
 assert(Object.values(positions).every(n=>n>0));rows.push({amount,count,positions});
}
const ageing=club.roster[0];ageing.age=39;c.world.calendarCursor=112;call('v176DecideRetirements',c);assert(call('v176Retiring',c,ageing.pid));const decisions=JSON.stringify(c.world.retirementDecisions);call('v176DecideRetirements',c);assert.equal(JSON.stringify(c.world.retirementDecisions),decisions);assert.throws(()=>call('v66Renew',c,ageing.pid,200,3,0));
const loaded=copy(c);assert(call('v67Validate',loaded));assert.equal(JSON.stringify(loaded.world.retirementDecisions),decisions);
call('v176CloseRetirements',c);assert(club.retiredPlayers.some(p=>p.pid===ageing.pid));assert(!c.world.contracts.some(p=>p.pid===ageing.pid));assert(call('v66Player',c,ageing.pid));
const retiredBefore=c.world.clubs.flatMap(c=>c.retiredPlayers||[]).length;call('v176CloseRetirements',c);assert.equal(c.world.clubs.flatMap(c=>c.retiredPlayers||[]).length,retiredBefore);
assert(call('v67Validate',c));assert(call('v66ValidateCareerEvents',c));
const invalid=copy(c);invalid.world.clubs.find(c=>c.id==='AUT-5').youthLegacy.status=NaN;assert(!call('v67Validate',invalid));
const target=call('v176StatusStep',50,1000,50);assert(target>50);assert(call('v176StatusStep',50,1000,100)>target);assert(call('v176StatusStep',50,0,0)<50);
const G=vmValue('D6PlayerGeneration');function vmValue(code){return require('node:vm').runInContext(code,context);}
const sample=c.world.clubs.find(club=>!club.simulationOnly&&club.id!=='AUT-5'),weights=call('v176Population',c,sample,1),total=Object.values(weights).reduce((a,b)=>a+b,0);
// Use the declared talent-band keys; no hard-coded implementation names.
const highExpected=Object.entries(weights).filter(([,n])=>n).reduce((sum,[quality,n])=>{const probabilities=G.youthTalentProbabilities(weights,quality);return sum+n*G.TALENT_BANDS.filter(b=>b.min>=20).reduce((s,b)=>s+probabilities[b.key],0)/total;},0);assert(Math.abs(highExpected-.05)<1e-12);
const countryControls=[];
for(const country of vmValue('v161Countries'))for(const kind of ['free','cup']){const id=kind==='cup'?`${country.id}-C1`:`${country.id}-FREE-S2`,f=c.world.playerFoundation,base=call('v176ParametersBase',f,kind,id),actual=call('v176WithGeneration',c,null,null,()=>call('v161GenerationParameters',f,kind,id)),offset=kind==='cup'?f.expansionGeneration.tierOffsets[country.tier]:0,pct={A:.04,B:.02,C:0,D:-.03}[country.tier];for(let i=0;i<base.qualityByKind[kind].length;i++)for(const quality of ['weak','normal','strong']){const b=base.qualityByKind[kind][i].byQuality[quality],a=actual.qualityByKind[kind][i].byQuality[quality];for(let j=0;j<b.length;j++)assert(Math.abs(a[j].min-Math.max(1,Math.min(20,(b[j].min-offset)*(1+pct))))<1e-12);}countryControls.push({country:country.id,kind});}
fs.mkdirSync('outputs/release-127',{recursive:true});fs.writeFileSync('outputs/release-127/controls.json',JSON.stringify({pass:true,oldWorldUnchanged:true,rows,retirementReloadStable:true,retirementIdempotent:true,highExpected,countryControls},null,2));console.log('Youth legacy controls passed');
