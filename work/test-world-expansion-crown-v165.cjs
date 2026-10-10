'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const setup=fs.readFileSync('work/test-world-expansion-v161.cjs','utf8').split('// Freeze legacy generation')[0],harness=vm.createContext({require,console,structuredClone,URLSearchParams});vm.runInContext(setup+';globalThis.api={context,run,call,copy};',harness);
const {context,run,call,copy}=harness.api;
for(const f of ['world-expansion-catalog-v161.js','world-expansion-v161.js','world-expansion-domestic-v164.js'])run(f);
const old=JSON.stringify(call('v61CreateCareer','GER-2','ap05-legacy','QA').world);run('world-expansion-crown-v165.js');assert.equal(JSON.stringify(call('v61CreateCareer','GER-2','ap05-legacy','QA').world),old);
const catalog=vm.runInContext('v161Catalog',context),entrants=call('v165OpeningCrown'),days=call('v164Calendar').crown;
assert.equal(entrants.length,26);assert(entrants.includes('ESP-1')&&entrants.includes('ESP-3')&&entrants.includes('POR-4'));
function prove(competition,clubs){
 const countries=new Map(clubs.map(c=>[c.id,c.countryId])),opponents=new Set(),home=new Map(competition.entrants.map(id=>[id,0]));assert.equal(competition.fixtures.length,65);
 for(let r=1;r<=5;r++){const fixtures=competition.fixtures.filter(f=>f.round==='R'+r);assert.equal(fixtures.length,13);assert.equal(new Set(fixtures.flatMap(f=>[f.homeId,f.awayId])).size,26);}
 for(const f of competition.fixtures){assert.notEqual(countries.get(f.homeId),countries.get(f.awayId));const pair=[f.homeId,f.awayId].sort().join('|');assert(!opponents.has(pair));opponents.add(pair);home.set(f.homeId,home.get(f.homeId)+1);}
 assert.equal([...home.values()].filter(n=>n===3).length,13);assert.equal([...home.values()].filter(n=>n===2).length,13);
}
let draws=0;
for(const distribution of [null,[13,13],[13,7,6],[12,12,2],[9,9,8]])for(let seed=0;seed<60;seed++){
 const clubs=distribution?distribution.flatMap((n,c)=>Array.from({length:n},(_,i)=>({id:`TEST${c}-${i}`,countryId:'TEST'+c}))):catalog,ids=distribution?clubs.map(c=>c.id):entrants;
 const cup=call('v165Crown',ids,clubs,1,'draw-'+seed);prove(cup,clubs);assert.equal(JSON.stringify(cup),JSON.stringify(call('v165Crown',ids,clubs,1,'draw-'+seed)));draws++;
}
assert.throws(()=>call('v165Crown',entrants.slice(1),catalog,1,'bad'),/Teilnehmerfeld/);
assert.throws(()=>call('v165Crown',[...entrants.slice(1),entrants[1]],catalog,1,'bad'),/Teilnehmerfeld/);
const crowded=Array.from({length:26},(_,i)=>({id:'X-'+i,countryId:i<14?'A':'B'}));assert.throws(()=>call('v165Crown',crowded.map(c=>c.id),crowded,1,'bad'),/Teilnehmerfeld/);
const nationalClubs=crowded.map((c,i)=>({...c,countryId:i<13?'A':'B'})),nationalCup=call('v165Crown',nationalClubs.map(c=>c.id),nationalClubs,1,'national-ko');
for(const f of nationalCup.fixtures)f.result={homeGoals:Number(nationalClubs.find(c=>c.id===f.homeId).countryId==='A'),awayGoals:Number(nationalClubs.find(c=>c.id===f.awayId).countryId==='A')};
call('v62EuropeProgress',{world:{seed:'national-ko'}},nationalCup,days.league[4]);assert(nationalCup.fixtures.filter(f=>f.round==='QF').every(f=>nationalClubs.find(c=>c.id===f.homeId).countryId===nationalClubs.find(c=>c.id===f.awayId).countryId));
for(let seed=0;seed<25;seed++){
 const cup=call('v165Crown',entrants,catalog,1,'ko-'+seed),career={world:{seed:'ko-'+seed}};
 assert.throws(()=>call('v62EuropeProgress',career,cup,days.league[4]),/nicht abgeschlossen/);
 for(const f of cup.fixtures)f.result={homeGoals:seed%3,awayGoals:(seed+1)%3};
 call('v62EuropeProgress',career,cup,days.league[4]);const once=JSON.stringify(cup);call('v62EuropeProgress',career,cup,days.league[4]);assert.equal(JSON.stringify(cup),once);
 const rank=cup.ranking;assert.equal(rank.length,26);assert.equal(cup.quarterPairs.length,4);
 for(const pair of cup.quarterPairs){assert(rank.slice(0,4).includes(pair[0]));assert(rank.slice(4,8).includes(pair[1]));}
 let resumed=copy(cup);
 for(const round of ['QF','SF']){
  const fixtures=resumed.fixtures.filter(f=>f.round===round);assert.equal(fixtures.length,round==='QF'?8:4);
  for(const f of fixtures){if(f.leg===2){assert(rank.indexOf(f.homeId)<rank.indexOf(f.awayId));const first=fixtures.find(x=>x.pair===f.pair&&x.leg===1);assert.equal(first.homeId,f.awayId);}f.result={homeGoals:2,awayGoals:0,winnerId:f.leg===2?f.homeId:null};}
  call('v62EuropeProgress',career,resumed,days[round][1]);const before=JSON.stringify(resumed);call('v62EuropeProgress',career,resumed,days[round][1]);assert.equal(JSON.stringify(resumed),before);resumed=copy(resumed);
 }
 assert.equal(resumed.fixtures.length,78);const final=resumed.fixtures.find(f=>f.round==='F');assert(final.neutral);final.result={homeGoals:1,awayGoals:0,winnerId:final.homeId};call('v62EuropeProgress',career,resumed,days.F);assert.equal(resumed.winnerId,final.homeId);assert.equal(resumed.fixtures.filter(f=>f.homeId===final.homeId||f.awayId===final.homeId).length,10);assert(!resumed.fixtures.some(f=>/play|R16/i.test(f.round)));
}
const career=call('v165CreateCareer','ESP-1','ap05-native','QA');assert(call('v61ValidateCareer',career));assert.equal(career.world.competitions.length,25);assert.equal(call('v62Fixtures',career).length,833);assert.throws(()=>call('v62AdvanceDay',career),/Horizon/);
assert.equal(JSON.stringify(call('v165CreateCareer','ESP-1','ap05-native','QA').world),JSON.stringify(career.world));
for(const mutate of [c=>c.world.competitions[24].fixtures[0].day++,c=>c.world.competitions[24].entrants.pop(),c=>c.world.competitions[24].fixtures[0].awayId=c.world.competitions[24].fixtures[0].homeId,c=>c.world.competitions[24].ranking=[]]){const bad=copy(career);mutate(bad);assert.equal(call('v61ValidateCareer',bad),false);}
// Native match pause/resume is JSON continuation, with one final booking.
const matchCareer=copy(career);context.v61CurrentCareer=matchCareer;
const fixture=matchCareer.world.competitions[24].fixtures[0],state=call('v64MakeState',matchCareer,fixture);for(let i=0;i<15;i++)call('v64Step',matchCareer,fixture,state);
state.phase='paused';const pausedMinute=state.minute;call('v64Step',matchCareer,fixture,state);assert.equal(state.minute,pausedMinute);
const resumedCareer=copy(matchCareer),resumedFixture=resumedCareer.world.competitions[24].fixtures[0],resumedState=copy(state);
for(const[c,f,s]of [[matchCareer,fixture,state],[resumedCareer,resumedFixture,resumedState]]){context.v61CurrentCareer=c;s.phase='live';while(s.phase!=='finished')call('v64Step',c,f,s);const record=call('v64FinishFixture',c,f,s),booked=JSON.stringify(c.world.clubs);assert.equal(JSON.stringify(call('v64FinishFixture',c,f,s)),JSON.stringify(record));assert.equal(JSON.stringify(c.world.clubs),booked);}
assert.equal(JSON.stringify(fixture.matchRecord),JSON.stringify(resumedFixture.matchRecord));
// No away-goal rule: 2:1 and 1:0 is a tied aggregate and goes to penalties.
const shootCareer=copy(career),cup=shootCareer.world.competitions[24],a=cup.entrants[0],b=cup.entrants[1];call('v62TwoLegPair',cup,'QF',days.QF,a,b,0,[a,b]);const first=cup.fixtures.find(f=>f.round==='QF'&&f.leg===1),second=cup.fixtures.find(f=>f.round==='QF'&&f.leg===2);first.result={homeGoals:2,awayGoals:1};second.result={homeGoals:1,awayGoals:0,penalties:null};call('v64PrepareFixture',shootCareer,second);call('v62ResolveSecondLeg',shootCareer,second,cup);assert.equal(JSON.stringify(second.result.aggregate),'[2,2]');assert(second.result.penalties[0]!==second.result.penalties[1]);const resolved=JSON.stringify(second);call('v62ResolveSecondLeg',shootCareer,second,cup);assert.equal(JSON.stringify(second),resolved);
(async()=>{await call('v61SaveCareers',[career]);const exportData=await call('v61ExportCareerData',career.id),imported=await call('v61ImportCareerData',exportData);assert.equal(JSON.stringify(imported.world),JSON.stringify(career.world));const report={pass:true,draws,knockoutSeasons:25,leagueFixtures:65,totalFixtures:78,preparedWorldFixtures:833,nativePauseResume:true,onceOnlyBooking:true,tiedAggregatePenalties:true,saveRoundtrip:true,legacyUnchanged:true};fs.mkdirSync('outputs/ligaexpansion-ap05',{recursive:true});fs.writeFileSync('outputs/ligaexpansion-ap05/check.json',JSON.stringify(report,null,2)+'\n');console.log(report);})().catch(e=>{console.error(e);process.exitCode=1;});
