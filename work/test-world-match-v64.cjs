const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let nextId=0;
const context=vm.createContext({crypto:{randomUUID:()=>`match-${++nextId}`}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const get=name=>vm.runInContext(name,context),career=get('v61CreateCareer')('GER-2','match-seed'),fixture=get('v62Fixtures')(career).find(item=>item.homeId==='GER-2'||item.awayId==='GER-2');
const plan=get('v64PrepareFixture')(career,fixture),players=id=>career.world.clubs.find(club=>club.id===id).roster;
for(const side of [plan.home,plan.away]){
 assert.strictEqual(side.starters.length,6);
 assert.strictEqual(side.bench.length,5);
 assert.strictEqual(new Set([...side.starters,...side.bench]).size,11);
 assert.strictEqual(side.starters.filter(pid=>players(side.clubId).find(player=>player.pid===pid).keeper).length,1);
 assert(get('v64Formations').includes(side.tactics.formation));
}
const state=get('v64MakeState')(career,fixture),ownSide=fixture.homeId==='GER-2'?0:1,own=ownSide===0?plan.home:plan.away;
const originalStarters=JSON.stringify(own.starters);
get('v64ChangeTactics')(career,fixture,state,ownSide,{formation:'1–2–2',pressing:'Früh'});
assert.strictEqual(state.tactics[ownSide].formation,'1–2–2');
assert.strictEqual(JSON.stringify(own.starters),originalStarters,'Startelf bleibt historisch fix');
const outgoing=own.starters.find(pid=>!players(own.clubId).find(player=>player.pid===pid).keeper),incoming=own.bench.find(pid=>!players(own.clubId).find(player=>player.pid===pid).keeper);
assert.throws(()=>get('v64QueueSubstitution')(career,fixture,state,ownSide,own.starters.find(pid=>players(own.clubId).find(player=>player.pid===pid).keeper),incoming),/nicht zulässig/);
get('v64QueueSubstitution')(career,fixture,state,ownSide,outgoing,incoming);
assert.strictEqual(state.substitutions.length,0,'Vormerkung zählt noch nicht');
state.phase='paused';const pausedMinute=state.minute;get('v64Step')(career,fixture,state);assert.strictEqual(state.minute,pausedMinute,'Pause hält die Simulation an');
state.phase='live';
while(state.minute<45)get('v64Step')(career,fixture,state);
assert.strictEqual(state.pending[ownSide].length,0,'Wechsel wurde an natürlicher Unterbrechung ausgeführt');
assert(state.substitutions.some(item=>item.outPid===outgoing&&item.inPid===incoming));
assert(!get('v64Active')(state,ownSide).includes(outgoing));
assert.throws(()=>get('v64QueueSubstitution')(career,fixture,state,ownSide,outgoing,own.bench[0]),/nicht zulässig/);
while(state.phase!=='finished')get('v64Step')(career,fixture,state);
const record=get('v64FinishFixture')(career,fixture,state);
assert.strictEqual(get('v64FinishFixture')(career,fixture,state),record,'Abpfiff bucht Spieler nur einmal');
for(const side of [0,1])assert.strictEqual(record.players.filter(item=>item.side===side).reduce((sum,item)=>sum+item.minutes,0),540,'sechs Spieler über 90 Minuten');
assert(record.substitutions.filter(item=>item.side===ownSide).length<=2);
assert(record.players.some(item=>item.pid===incoming&&item.minutes>0));
assert(record.players.some(item=>item.pid===outgoing&&item.minutes<90));
assert(record.players.every(item=>item.minutes>=20||item.rating===null));
for(const goal of state.events.filter(item=>item.type==='goal'))if(goal.assistPid)assert(state.stats[goal.assistPid].assists>0,'Angezeigte Vorlage ist auch als Spielerwert erfasst');
assert.strictEqual(state.events.filter(item=>item.type==='goal'&&item.assistPid).length,record.players.reduce((sum,item)=>sum+item.assists,0),'Vorlagen im Verlauf und Spielerbericht stimmen überein');

const replay=get('v61CreateCareer')('GER-2','match-seed'),otherFixture=get('v62Fixtures')(replay).find(item=>item.id===fixture.id),otherState=get('v64MakeState')(replay,otherFixture);
get('v64ChangeTactics')(replay,otherFixture,otherState,ownSide,{formation:'1–2–2',pressing:'Früh'});
get('v64QueueSubstitution')(replay,otherFixture,otherState,ownSide,outgoing,incoming);
while(otherState.phase!=='finished')get('v64Step')(replay,otherFixture,otherState);
assert.strictEqual(JSON.stringify(otherState.score),JSON.stringify(state.score),'Seed und Entscheidungen reproduzieren Ergebnis');
assert.strictEqual(JSON.stringify(otherState.events),JSON.stringify(state.events),'Seed und Entscheidungen reproduzieren Ereignisse');

const managed=get('v61CreateCareer')('GER-2','managed-seed'),ownMatch=get('v64AdvanceToOwnMatch')(managed),active=managed.world.activeMatch;
assert.strictEqual(active.fixtureId,ownMatch.id);
assert.strictEqual(active.state.phase,'prematch');
assert.strictEqual(get('v64AdvanceToOwnMatch')(managed),ownMatch,'erneutes Öffnen behält Spielplan');
while(active.state.phase!=='finished')get('v64Step')(managed,ownMatch,active.state);
get('v64CompleteOwnMatch')(managed);
assert(ownMatch.result&&managed.world.eventLog.processedEventIds.includes(ownMatch.id));
assert.strictEqual(managed.world.calendarCursor,ownMatch.day);
const after=JSON.stringify(managed);
get('v64CompleteOwnMatch')(managed);
assert.strictEqual(JSON.stringify(managed),after,'erneutes Öffnen bucht kein zweites Match');

console.log('Weltmatch: feste Startelf, Taktik, Pause, natürliche Wechsel, Spielminuten, reproduzierbare Ereignisse und einmalige Verbuchung geprüft.');
