'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {harness}=require('./youth-native-harness-v176.cjs');
const h=harness(),{call,copy,evaluate}=h,checks=[];
const career=call('v167CreateCareer','AUT-5','squad-roles-20261012','Kader QA'),own=career.world.clubs.find(c=>c.id===career.manager.managedClubId);
const test=(name,fn)=>{fn();checks.push(name);console.log('PASS '+name);};
test('New squads have six regular starters, three rotation players and two backups',()=>{
 for(const club of career.world.clubs){
  if(club.simulationOnly){assert(career.world.contracts.filter(c=>c.clubId===club.id).every(c=>c.promise===0));continue;}
  const depth=call('v179SquadDepth',career,club);assert.deepEqual(depth.counts,{starter:6,rotation:3,reserve:2});assert.equal(depth.overpromised,false);assert(depth.positions.every(p=>p.status!=='missing'));assert(depth.positions.every(p=>p.available=== (p.line==='gk'?2:3)));
  assert.deepEqual(club.roster.filter(p=>p.keeper).map(p=>call('v66Contract',career,p.pid).promise).sort((a,b)=>a-b),[2,10]);
 }
 assert(call('v61ValidateCareer',copy(career)));call('v177CheckInitialRosters',career);
 const before=JSON.stringify(career);for(const p of own.roster)call('v179PromiseProgress',career,p);call('v179SquadDepth',career,own);assert.equal(JSON.stringify(career),before,'Reading roles must not mutate saves');
});
test('Promise bands and legacy save reads retain stored numbers',()=>{
 for(const [promise,role] of [[0,'reserve'],[4,'reserve'],[5,'rotation'],[8,'rotation'],[9,'starter'],[14,'starter']])assert.equal(call('v179SquadRole',career,promise),role);
 const old=copy(career);old.world.contracts.forEach(c=>{if(!c.simulationOnly)c.promise=4;});const frozen=JSON.stringify(old);assert(call('v61ValidateCareer',old));assert.equal(JSON.stringify(old),frozen);
 call('v179SquadDepth',old,old.world.clubs.find(c=>c.id===own.id));assert.equal(JSON.stringify(old),frozen);
});
test('Six-field-player worlds use seven regular starters and one backup',()=>{
 const larger=call('v167CreateCareer','AUT-5','squad-six-field-v179','Kader QA',{fieldSize:'large',fieldPlayers:6});
 for(const club of larger.world.clubs.filter(c=>!c.simulationOnly))assert.deepEqual(call('v179SquadDepth',larger,club).counts,{starter:7,rotation:3,reserve:1});
 assert(call('v61ValidateCareer',larger));
});
const clubGames=c=>call('v62Fixtures',c).filter(f=>f.homeId===own.id||f.awayId===own.id);
const leagueGames=c=>call('v62Current',c).find(k=>k.type==='league'&&k.country===own.countryId).fixtures.filter(f=>f.homeId===own.id||f.awayId===own.id);
test('Weighted credits, current expectation and midseason target use native promises',()=>{
 const c=copy(career),club=c.world.clubs.find(x=>x.id===own.id),p=club.roster[2],contract=call('v66Contract',c,p.pid),league=leagueGames(c);contract.promise=10;
 for(const f of league.slice(0,4))f.result={homeGoals:0,awayGoals:0};
 p.history=league.slice(0,3).map((f,i)=>({fixtureId:f.id,season:1,clubId:club.id,minutes:i===0?45:23}));
 assert.equal(call('v66PromiseCredits',c,p,1),2);assert.equal(call('v179PromiseProgress',c,p).expected,2);
 const europe=call('v62Fixtures',c).find(f=>call('v62Current',c).find(k=>k.id===f.competitionId)?.type==='europe');
 p.history.push({fixtureId:europe.id,season:1,clubId:club.id,minutes:30});assert.equal(call('v66PromiseCredits',c,p,1),3);
 const cup=call('v62Fixtures',c).find(f=>call('v62Current',c).find(k=>k.id===f.competitionId)?.type==='cup'&&f.round!=='F');
 p.history=[{fixtureId:cup.id,season:1,clubId:club.id,minutes:59}];assert.equal(call('v66PromiseCredits',c,p,1),0);
 p.history[0].minutes=60;assert.equal(call('v66PromiseCredits',c,p,1),1);
 contract.startsAt=league[7].day;p.history=[];const progress=call('v179PromiseProgress',c,p);assert.equal(progress.target,5);assert.equal(progress.expected,0);
});
test('Existing form consequence occurs once and remains capped',()=>{
 const c=copy(career),club=c.world.clubs.find(x=>x.id===own.id),p=club.roster[2],contract=call('v66Contract',c,p.pid),games=leagueGames(c);contract.promise=14;p.history=[];p.form=0;
 for(let i=0;i<12;i++){
  const f=games[i];f.result={homeGoals:0,awayGoals:0};call('v66AfterFixture',c,f);
  const frozen=JSON.stringify(c);call('v66AfterFixture',c,f);assert.equal(JSON.stringify(c),frozen);
  if(i===3){assert.equal(contract.promisePenalty,1);assert.equal(p.form,-1);assert.equal(call('v179PromiseProgress',c,p).status,'behind');}
 }
 assert.equal(contract.promisePenalty,2);assert.equal(p.form,-2);
 const restored=copy(c);assert.equal(call('v179PromiseProgress',restored,restored.world.clubs.find(x=>x.id===own.id).roster[2]).status,'behind');
});
test('Depth warns about missing direct backup and too many promised starters',()=>{
 const c=copy(career),club=c.world.clubs.find(x=>x.id===own.id);for(const p of club.roster)call('v66Contract',c,p.pid).promise=10;
 assert.equal(call('v179SquadDepth',c,club).overpromised,true);
 club.roster=club.roster.filter(p=>!p.keeper||p===club.roster[0]);assert.equal(call('v179SquadDepth',c,club).positions[0].status,'thin');
 club.roster=club.roster.filter(p=>!p.keeper);assert.equal(call('v179SquadDepth',c,club).positions[0].status,'missing');
});
test('AI rotates similar players gently, protects quality and saved lineups',()=>{
 const c=copy(career),club=c.world.clubs.find(x=>x.id==='GER-1'),keepers=club.roster.filter(p=>p.keeper),games=call('v62Current',c).find(k=>k.type==='league'&&k.country===club.countryId).fixtures.filter(f=>f.homeId===club.id||f.awayId===club.id);
 const skills=evaluate('D6PlayerGeneration.SKILL_KEYS');for(const p of keepers){for(const key of skills)p[key]=12;p.form=0;p.fresh=100;}
 const [first,second]=[...keepers].sort((a,b)=>a.pid.localeCompare(b.pid));call('v66Contract',c,first.pid).promise=10;call('v66Contract',c,second.pid).promise=6;
 for(const f of games.slice(0,7))f.result={homeGoals:0,awayGoals:0};first.history=games.slice(0,7).map(f=>({fixtureId:f.id,season:1,clubId:club.id,minutes:90}));second.history=[];
 const formation=call('v179SquadDepth',c,club).formation;
 assert.equal(call('v64BuildSide',club,formation).starters[0],first.pid);assert.equal(call('v64BuildSide',club,formation,c).starters[0],second.pid);
 assert(call('v179LineupBonus',c,second)<=1.2);
 first.gk=18;assert.equal(call('v64BuildSide',club,formation,c).starters[0],first.pid,'Large quality gaps must prevail');
 const f=games[7];const plan=call('v64PrepareFixture',c,f),stored=JSON.stringify(plan);first.gk=1;second.gk=20;assert.equal(JSON.stringify(call('v64PrepareFixture',c,f)),stored);
 c.manager.managedClubId=club.id;assert.deepEqual(call('v64BuildSide',club,formation,c),call('v64BuildSide',club,formation));
});
test('Accepted transfers and renewals establish the selected role through real contracts',()=>{
 const c=copy(career),club=c.world.clubs.find(x=>x.id===own.id);club.balance=100000;c.world.market.phase='open';c.world.market.day=1;
 const p=c.world.market.freePlayers.find(x=>!x.keeper),bid=call('v66MakeBid',c,club.id,p.pid,0,call('v66Salary',p)*3,2,10);
 assert(call('v66TryBid',c,bid));assert.equal(call('v179PromiseProgress',c,p).role,'starter');
 const contract=call('v66Contract',c,p.pid);contract.endSeason=1;c.world.calendarCursor=120;const result=call('v66Renew',c,p.pid,call('v66Salary',p)*3,2,6);
 assert(result.accepted);assert.equal(contract.promise,6);assert.equal(call('v179PromiseProgress',c,p).role,'rotation');assert.equal(contract.startsAt,120);
});
fs.mkdirSync('outputs/squad-planning-v179',{recursive:true});
const sourceFiles=['world-squad-planning-v179.js','world-squad-ui-v179.js','world-match-v64.js','world-market-ui-v66.js','world-transfer-list-ui-v72.js','ui-flutlicht/adapter.js','ui-flutlicht/views/squad.js','ui-flutlicht/views/market.js'];
fs.writeFileSync('outputs/squad-planning-v179/checks.json',JSON.stringify({checks,sourceHashes:Object.fromEntries(sourceFiles.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('dist/'+f)).digest('hex')]))},null,2));
