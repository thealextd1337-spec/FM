'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const setup=fs.readFileSync('work/test-world-expansion-v161.cjs','utf8').split('// Freeze legacy generation')[0],harness=vm.createContext({require,console,structuredClone,URLSearchParams});vm.runInContext(setup+';globalThis.api={context,run,call,copy};',harness);const {context,run,call,copy}=harness.api;
for(const f of ['world-expansion-catalog-v161.js','world-expansion-v161.js','world-expansion-domestic-v164.js','world-expansion-crown-v165.js'])run(f);
const legacy=JSON.stringify(call('v61CreateCareer','GER-2','ap06-legacy','QA').world);run('world-expansion-horizon-v166.js');assert.equal(JSON.stringify(call('v61CreateCareer','GER-2','ap06-legacy','QA').world),legacy);
const clubs=vm.runInContext('v161Catalog',context),crown=call('v165OpeningCrown'),entrants=call('v166OpeningHorizon'),days=call('v164Calendar').horizon;
assert.equal(entrants.length,32);assert(entrants.includes('AUT-5'));assert(entrants.every(id=>!crown.includes(id)));
let knockoutSeasons=0;
for(let seed=0;seed<80;seed++){
 const cup=call('v166Horizon',entrants,clubs,1,'horizon-'+seed,crown),career={world:{seed:'horizon-'+seed,clubs}};assert.equal(JSON.stringify(cup),JSON.stringify(call('v166Horizon',entrants,clubs,1,'horizon-'+seed,crown)));
 for(const round of ['R32','R16','QF','SF','F']){
  const fixtures=cup.fixtures.filter(f=>f.round===round);assert.equal(fixtures.length,{R32:32,R16:16,QF:8,SF:4,F:1}[round]);
  for(const f of fixtures){if(['R32','R16'].includes(round))assert.notEqual(clubs.find(c=>c.id===f.homeId).countryId,clubs.find(c=>c.id===f.awayId).countryId);if(f.leg===2){const first=fixtures.find(x=>x.pair===f.pair&&x.leg===1);assert.equal(f.homeId,first.awayId);}f.result={homeGoals:1,awayGoals:0,winnerId:f.leg===2||round==='F'?f.homeId:null};}
  const day=round==='F'?days[round]:days[round][1];call('v62EuropeProgress',career,cup,day);const before=JSON.stringify(cup);call('v62EuropeProgress',career,cup,day);assert.equal(JSON.stringify(cup),before);
 }
 assert.equal(cup.fixtures.length,61);assert(cup.fixtures.find(f=>f.round==='F').neutral);assert.equal(cup.fixtures.filter(f=>f.homeId===cup.winnerId||f.awayId===cup.winnerId).length,9);knockoutSeasons++;
}
const crowded=Array.from({length:32},(_,i)=>({id:'X-'+i,countryId:i<16?'A':'B'}));for(let seed=0;seed<30;seed++){const cup=call('v166Horizon',crowded.map(c=>c.id),crowded,1,'max-'+seed);assert.equal(cup.fixtures.length,32);}
assert.throws(()=>call('v166Horizon',entrants,clubs,1,'bad',[entrants[0]]),/Überschneidung/);
const career=call('v166CreateCareer','AUT-5','ap06-native-season','QA');context.v61CurrentCareer=career;assert(call('v61ValidateCareer',career));assert.equal(call('v62Fixtures',career).length,865);assert.equal(career.world.competitions.length,26);assert.throws(()=>call('v62AdvanceDay',career),/Sponsor/);
const own=career.world.clubs.find(c=>c.id==='AUT-5');call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);call('v124SetYouthBudget',career,0);for(let i=0;i<5;i++)call('v66NextMarketDay',career);assert.equal(career.world.market.phase,'closed');assert(call('v61ValidateCareer',career));
// A managed first leg and second leg use the same native completion/booking path.
let ownGames=0,checkpoint=false;
while(!career.world.seasonFinished){
 const fixture=call('v64AdvanceToOwnMatch',career);if(!fixture)break;const state=career.world.activeMatch.state;
 while(state.phase!=='finished')call('v64Step',career,fixture,state);
 call('v64CompleteOwnMatch',career);const processed=career.world.eventLog.processedEventIds.length;call('v64CompleteOwnMatch',career);assert.equal(career.world.eventLog.processedEventIds.length,processed);delete career.world.activeMatch;ownGames++;
 if(fixture.competitionId.endsWith(':HORIZON')&&fixture.leg===2){assert(fixture.result.winnerId);assert(Array.isArray(fixture.result.aggregate));checkpoint=true;}
 assert(call('v61ValidateCareer',career),`Invalid world after ${fixture.id}, cursor ${career.world.calendarCursor}`);
 if(ownGames%5===0){const restored=copy(career);assert(call('v61ValidateCareer',restored));Object.assign(career,restored);context.v61CurrentCareer=career;}
 console.log('Managed match',ownGames,fixture.id,'world matches',career.world.eventLog.processedEventIds.length);
}
assert(checkpoint);assert(career.world.seasonFinished);assert.equal(career.world.calendarCursor,224);const fixtures=call('v62Fixtures',career);assert.equal(fixtures.length,991);assert(fixtures.every(f=>f.result));assert(career.world.competitions.every(c=>c.winnerId));assert.equal(new Set(career.world.eventLog.processedEventIds).size,991);assert.equal(career.world.economyProcessedFixtures.length,991);assert(call('v61ValidateCareer',career));
const finished=JSON.stringify(career);assert.equal(call('v62AdvanceDay',career).length,0);assert.equal(JSON.stringify(career),finished);assert.throws(()=>call('v62NextSeason',career),/AP07/);
const corrupt=copy(career);corrupt.world.competitions[25].fixtures[0].awayId=corrupt.world.competitions[25].fixtures[0].homeId;assert.equal(call('v61ValidateCareer',corrupt),false);
(async()=>{await call('v61SaveCareers',[career]);const exported=await call('v61ExportCareerData',career.id),imported=await call('v61ImportCareerData',exported);assert.equal(JSON.stringify(imported.world),JSON.stringify(career.world));const report={pass:true,knockoutSeasons,maxCountryDraws:30,fullNativeSeasonMatches:991,ownGames,checkpoint,competitions:26,seasonClosed:true,saveRoundtrip:true,legacyUnchanged:true};fs.mkdirSync('outputs/ligaexpansion-ap06',{recursive:true});fs.writeFileSync('outputs/ligaexpansion-ap06/check.json',JSON.stringify(report,null,2)+'\n');console.log(report);})().catch(e=>{console.error(e);process.exitCode=1;});
