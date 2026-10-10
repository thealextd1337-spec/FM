'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
// Reuse the native-world harness, without running its independent AP03 checks.
const setup=fs.readFileSync('work/test-world-expansion-v161.cjs','utf8').split('// Freeze legacy generation')[0];
const harness=vm.createContext({require,console,structuredClone,URLSearchParams});vm.runInContext(setup+';globalThis.api={context,run,call,copy};',harness);
const {context,run,call,copy}=harness.api;
for(const f of ['world-expansion-catalog-v161.js','world-expansion-v161.js'])run(f);
const legacyBefore=JSON.stringify(call('v61CreateCareer','GER-2','ap04-legacy','QA').world);
run('world-expansion-domestic-v164.js');
assert.equal(JSON.stringify(call('v61CreateCareer','GER-2','ap04-legacy','QA').world),legacyBefore);
const catalog=vm.runInContext('v161Catalog',context),calendar=call('v164Calendar');
const week=d=>Math.floor((d+3)/7),weekday=d=>new Date(Date.UTC(2024,7,1+d)).getUTCDay();
const cupDays=Object.values(calendar.cup),crownDays=[...calendar.crown.league,...calendar.crown.QF,...calendar.crown.SF,calendar.crown.F],horizonDays=[...calendar.horizon.R32,...calendar.horizon.R16,...calendar.horizon.QF,...calendar.horizon.SF,calendar.horizon.F];
assert(calendar.league.every(d=>[0,6].includes(weekday(d))));assert.equal(new Set(calendar.league.map(week)).size,14);
assert(cupDays.every(d=>weekday(d)===3));
for(const route of [crownDays,horizonDays]){assert(route.every(d=>weekday(d)===3));assert(route.every(d=>!cupDays.some(c=>week(c)===week(d))));const days=[...calendar.league,...cupDays,...route].sort((a,b)=>a-b);for(let i=1;i<days.length;i++)assert(days[i]-days[i-1]>=3,days.join(','));}
assert.equal(weekday(calendar.seasonEnd),4);assert.equal(new Date(Date.UTC(2024,7,1+calendar.seasonEnd)).getUTCMonth(),2);
let seasons=0;
for(let seed=0;seed<40;seed++)for(const country of vm.runInContext('v161Countries',context)){
 const members=catalog.filter(c=>c.countryId===country.id).map(c=>({...c,leagueId:c.playable?country.id+'-LEAGUE':null}));
 const league=call('v164League',country.id,members.filter(c=>c.playable),1,'calendar-'+seed),cup=call('v164Cup',country.id,members,1,'calendar-'+seed),career={world:{seed:'calendar-'+seed}};
 assert.equal(league.fixtures.length,56);const pairs=new Set();
 for(const f of league.fixtures){assert.equal(weekday(f.day),6);assert(!pairs.has(f.homeId+'>'+f.awayId));pairs.add(f.homeId+'>'+f.awayId);}
 for(const c of members.filter(c=>c.playable)){assert.equal(league.fixtures.filter(f=>f.homeId===c.id).length,7);assert.equal(league.fixtures.filter(f=>f.awayId===c.id).length,7);}
 for(const round of ['R16','QF','SF','F']){
  assert.equal(cup.fixtures.filter(f=>f.round===round).length,{R16:8,QF:4,SF:2,F:1}[round]);
  for(const f of cup.fixtures.filter(f=>f.round===round))f.result={homeGoals:1,awayGoals:0,winnerId:f.homeId};
  call('v62CupProgress',career,cup,calendar.cup[round]);const before=JSON.stringify(cup);call('v62CupProgress',career,cup,calendar.cup[round]);assert.equal(JSON.stringify(cup),before,'No redraw after reload/retry');
 }
 assert.equal(cup.fixtures.length,15);assert(cup.fixtures.find(f=>f.round==='F').neutral);assert(cup.winnerId&&cup.finalistId);assert.equal(cup.fixtures.filter(f=>f.homeId===cup.winnerId||f.awayId===cup.winnerId).length,4);
 call('v62ValidateSchedule',[league,cup],members);seasons++;
}
const career=call('v164CreateCareer','AUT-5','ap04-native','QA');assert(call('v61ValidateCareer',career));assert.equal(career.world.competitions.length,24);assert.equal(call('v62Fixtures',career).length,768);
assert.equal(JSON.stringify(call('v164CreateCareer','AUT-5','ap04-native','QA').world),JSON.stringify(career.world));
assert.throws(()=>call('v62AdvanceDay',career),/internationalen/);
const saved=JSON.stringify(career.world);assert.equal(JSON.stringify(copy(career).world),saved);assert(call('v61ValidateCareer',copy(career)));
for(const mutate of [c=>c.world.rules.calendar.league[0]=3,c=>c.world.competitions[0].fixtures[0].day=3,c=>c.world.competitions[1].fixtures[0].awayId='GRE-1',c=>c.world.competitions[0].fixtures.pop(),c=>c.world.competitions[0].fixtures[0].result={homeGoals:0,awayGoals:0}]){const bad=copy(career);mutate(bad);assert.equal(call('v61ValidateCareer',bad),false);}
// Use the shared shootout law and saved squads; no extra-time path exists.
const fixture=career.world.competitions.find(c=>c.type==='cup').fixtures[0];call('v64PrepareFixture',career,fixture);fixture.result={homeGoals:1,awayGoals:1,penalties:null,winnerId:null};
call('v62ResolveSingle',career,fixture);assert(fixture.result.penalties[0]!==fixture.result.penalties[1]);assert([fixture.homeId,fixture.awayId].includes(fixture.result.winnerId));const once=JSON.stringify(fixture);call('v62ResolveSingle',career,fixture);assert.equal(JSON.stringify(fixture),once);
// This resolved fixture is a test copy, not a persisted preparation.
fixture.result=null;delete fixture.plan;
(async()=>{await call('v61SaveCareers',[career]);const exported=await call('v61ExportCareerData',career.id);const imported=await call('v61ImportCareerData',exported);assert.equal(JSON.stringify(imported.world),JSON.stringify(career.world));fs.mkdirSync('outputs/ligaexpansion-ap04',{recursive:true});const report={pass:true,countrySeasons:seasons,preparedCompetitions:24,preparedFixtures:768,completedSeasonFixtures:852,sharedCalendar:true,shootout:true,saveRoundtrip:true};fs.writeFileSync('outputs/ligaexpansion-ap04/check.json',JSON.stringify(report,null,2)+'\n');console.log(report);})().catch(e=>{console.error(e);process.exitCode=1;});
