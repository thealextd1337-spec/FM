const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let nextId=0;
const context=vm.createContext({crypto:{randomUUID:()=>`test-${++nextId}`}});
vm.runInContext(fs.readFileSync('dist/world-catalog-v61.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-competition-v62.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-coaches-v63.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-match-v64.js','utf8'),context);
const source=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(source.slice(0,source.indexOf('const v61Panel=')),context);

const career=vm.runInContext("v61CreateCareer('GER-2','calendar-seed')",context);
const initial=JSON.stringify(career);
const current=()=>vm.runInContext('v62Current',context)(career);
const fixtures=()=>vm.runInContext('v62Fixtures',context)(career);
const validate=vm.runInContext('v62ValidateSchedule',context);
validate(current(),career.world.clubs);
assert.strictEqual(fixtures().filter(item=>item.competitionId.endsWith(':LEAGUE')).length,180);
assert.strictEqual(fixtures().filter(item=>item.competitionId.endsWith(':CUP')).length,24);
assert.strictEqual(fixtures().filter(item=>item.competitionId.endsWith(':EUROPE')).length,24);
const nationalWeeks=new Set(fixtures().filter(item=>item.competitionId.endsWith(':CUP')).map(item=>Math.floor(item.day/7)));
assert(fixtures().filter(item=>item.competitionId.endsWith(':EUROPE')).every(item=>!nationalWeeks.has(Math.floor(item.day/7))));
for(const league of current().filter(item=>item.type==='league'))for(const id of new Set(league.fixtures.flatMap(item=>[item.homeId,item.awayId])))assert.strictEqual(league.fixtures.filter(item=>item.homeId===id||item.awayId===id).length,10);
const europe=current().find(item=>item.type==='europe');
for(const id of europe.entrants){
 const games=europe.fixtures.filter(item=>item.homeId===id||item.awayId===id);
 assert.strictEqual(games.length,4);
 assert.strictEqual(new Set(games.map(item=>item.homeId===id?item.awayId:item.homeId)).size,4);
 assert.strictEqual(games.filter(item=>item.homeId===id).length,2);
 assert(games.every(item=>item.homeId.slice(0,3)!==item.awayId.slice(0,3)));
}

const advance=vm.runInContext('v62AdvanceDay',context);
let guard=0;
while(!career.world.seasonFinished&&guard++<40){advance(career);validate(current(),career.world.clubs);assert(vm.runInContext('v63Validate',context)(career),'jede Trainerstelle bleibt eindeutig besetzt')}
assert(career.world.seasonFinished,'Saisonabschluss erreicht');
assert.strictEqual(fixtures().length,259);
assert(fixtures().every(item=>item.result));
assert.strictEqual(new Set(fixtures().map(item=>item.id)).size,259);
assert.strictEqual(career.world.eventLog.processedEventIds.length,259);
assert(current().every(item=>item.winnerId));
for(const cup of current().filter(item=>item.type==='cup')){
 assert.deepStrictEqual([cup.fixtures.filter(item=>item.round==='QF').length,cup.fixtures.filter(item=>item.round==='SF').length,cup.fixtures.filter(item=>item.round==='F').length],[4,2,1]);
 assert(cup.fixtures.every(item=>item.result.winnerId));
}
for(const leg of europe.fixtures.filter(item=>item.leg===2)){
 const{aggregate,penalties,winnerId}=leg.result;
 assert(aggregate);
 assert(aggregate[0]!==aggregate[1]||penalties);
 assert([leg.homeId,leg.awayId].includes(winnerId));
}
const entrants=vm.runInContext('v62NextEntrants',context)(career);
assert.strictEqual(entrants.length,12);
assert.strictEqual(new Set(entrants).size,12);
const firstSeason=JSON.stringify(current());
const repeat=vm.runInContext("v61CreateCareer('GER-2','calendar-seed')",context);
while(!repeat.world.seasonFinished)advance(repeat);
assert.strictEqual(JSON.stringify(repeat.world.competitions),firstSeason,'gleicher Seed liefert dieselben Ergebnisse');
assert.strictEqual(JSON.stringify(repeat.world.coaches),JSON.stringify(career.world.coaches),'gleicher Seed liefert denselben Trainerverlauf');
const finished=JSON.stringify(career);
advance(career);
assert.strictEqual(JSON.stringify(career),finished,'erneutes Fortsetzen verändert keine abgeschlossene Saison');
vm.runInContext('v62NextSeason',context)(career);
assert.strictEqual(career.world.season,2);
assert.strictEqual(JSON.stringify(career.world.europeEntrants),JSON.stringify(entrants));
assert.strictEqual(career.world.competitions.length,26);
validate(current(),career.world.clubs);
assert.strictEqual(JSON.stringify(career.world.clubs.map(club=>club.roster.map(player=>player.pid))),JSON.stringify(JSON.parse(initial).world.clubs.map(club=>club.roster.map(player=>player.pid))),'Kalender verändert keine Spielerzuordnung');
for(let season=2;season<=10;season++){
 while(!career.world.seasonFinished)advance(career);
 assert.strictEqual(fixtures().length,259,`Saison ${season}: vollständige Wettbewerbe`);
 validate(current(),career.world.clubs);
 assert(vm.runInContext('v63Validate',context)(career),`Saison ${season}: eindeutige Trainerzuordnung`);
 if(season<10)vm.runInContext('v62NextSeason',context)(career);
}
assert(Buffer.byteLength(JSON.stringify(career),'utf8')<5_000_000,'zehn Jahre bleiben unter fünf MB');
const dismissals=career.world.clubs.flatMap(club=>club.history).filter(item=>item.type==='coach-dismissal').length;
console.log(`Weltkalender: 259 Partien je Saison, Terminabstände, feste Ergebnisse, Qualifikation und zehn Saisons geprüft; ${dismissals} Trainerentlassungen.`);
