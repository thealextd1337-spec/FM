const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext();
for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','main-menu-v46.js','match-report-v47.js','set-pieces-v50.js'])
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure()",context);
assert.equal(vm.runInContext("v46Tabs.some(tab=>tab[0]==='statistics')",context),true);
const competition=vm.runInContext('v46CompetitionHTML()',context);
assert.match(competition,/>Liga<\/h2>/);
assert.match(competition,/>Nationaler Pokal<\/h2>/);
assert.doesNotMatch(competition,/Liga & Pokal|Ligastatistik/);

vm.runInContext(`(()=>{
 const own=activeSave.squad[0],opponent=activeSave.world.teams[0].roster.find(player=>!player.keeper);
 Object.assign(currentStats(own),{games:2,goals:3,assists:2,fouls:1,penaltiesScored:1,penaltiesMissed:1});
 Object.assign(currentStats(opponent),{games:2,goals:1,assists:1,fouls:2,penaltiesScored:0,penaltiesMissed:1});
 currentStats(activeSave.keeper).cleanSheet=2;currentStats(own).cleanSheet=3;
 activeSave.world.teams.flatMap(team=>team.roster).filter(player=>!player.keeper).slice(0,12).forEach((player,index)=>currentStats(player).goals=index+1);
})()`,context);
const stats=vm.runInContext('v46StatisticsHTML()',context);
for(const label of ['Statistik','Ligastatistik','Pokalstatistik','Tore','Assists','Zu null','Fouls','Elfmeter verwandelt','Elfmeter verschossen'])assert(stats.includes(label),`missing ${label}`);
assert(stats.includes('data-v46-view="statistics"'));
assert.equal((stats.match(/<details class="v46-stat-category" open>/g)||[]).length,12,'all six league and six cup categories are expanded for scrolling');
function category(label){const match=stats.match(new RegExp(`<summary><span>${label}<\\/span>[\\s\\S]*?<\\/details>`));assert(match,`missing category ${label}`);return match[0]}
assert.equal((category('Tore').match(/<tr class="(?:own)?">/g)||[]).length,10,'scorer list is limited to ten');
assert(!category('Tore').includes(vm.runInContext('activeSave.squad[1].name',context)),'players without a goal stay off the scorer list');
assert(category('Zu null').includes(vm.runInContext('activeSave.keeper.name',context)),'keeper clean sheets are listed');
assert(!category('Zu null').includes(vm.runInContext('activeSave.squad[0].name',context)),'outfield clean sheets are excluded');
assert(category('Fouls').includes(vm.runInContext('activeSave.squad[0].name',context)));
assert(category('Elfmeter verwandelt').includes(vm.runInContext('activeSave.squad[0].name',context)));
assert(category('Elfmeter verschossen').includes(vm.runInContext('activeSave.squad[0].name',context)));
vm.runInContext(`(()=>{
 activeSave.cupEnabled=false;for(const team of activeSave.world.teams)for(const player of team.roster)currentStats(player).fouls=0;globalThis.statsOpponentId=activeOpponent().id;start();
 const victim=match.people.find(player=>player.t===0&&!player.keeper),offender=match.people.find(player=>player.t===1&&!player.keeper);
 victim.x=.5;victim.y=.5;v50Foul(victim,offender);match.setPiece=null;
 v50FinishPenalty({team:0,taker:victim,outcome:'wide'});match.setPiece=null;
 finishMatch();
})()`,context);
assert.equal(vm.runInContext("worldTeam(statsOpponentId).roster.find(player=>player.n===match.people.find(person=>person.t===1&&!person.keeper).n).seasons.find(season=>season.number===activeSave.seasonNumber).fouls",context),1,'opponent foul is persisted');
assert.equal(vm.runInContext("activeSave.squad.find(player=>player.n===match.people.find(person=>person.t===0&&!person.keeper).n).seasons.find(season=>season.number===activeSave.seasonNumber).penaltiesMissed",context),1,'missed penalty is persisted');
const shootout=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 activeSave.cupEnabled=true;const opponent=worldTeam(statsOpponentId),own=players[0],rival=opponent.roster.find(player=>!player.keeper);
 const game=activeSave.cup.rounds[0][0];game.home='user';game.away=opponent.id;match.score=[1,1];
 v41FinishCupGame(game,{score:[1,0],winner:0,kicks:[{side:0,number:own.n,goal:true},{side:1,number:rival.n,goal:false}]});
 return{own:v41CupStats(own).penaltiesScored,savedOwn:v41CupStats(activeSave.squad.find(player=>player.n===own.n)).penaltiesScored,rival:v41CupStats(rival).penaltiesMissed};
})())`,context));
assert.deepEqual(shootout,{own:1,savedOwn:1,rival:1},'shootout penalties are attributed and saved for both players');
const cupContext=makeContext();
vm.runInContext(fs.readFileSync('dist/penalties-v42.js','utf8'),cupContext,{filename:'penalties-v42.js'});
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure()",cupContext);
const savedShootout=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const game=activeSave.cup.rounds[0][0],own=activeSave.squad[0],opponent=activeSave.world.teams[0],rival=opponent.roster.find(player=>!player.keeper);
 game.home='user';game.away=opponent.id;
 v42SettleCareer({stage:0,index:0,regulationScore:[1,1],score:[1,0],winner:0,kicks:[{side:0,number:own.n,goal:true},{side:1,number:rival.n,goal:false}]});
 return{own:v41CupStats(own).penaltiesScored,rival:v41CupStats(rival).penaltiesMissed};
})())`,cupContext));
assert.deepEqual(savedShootout,{own:1,rival:1},'saved cup shootout records both shooters');
console.log('PASS: separate statistics tab, clear league/cup headings, and recorded per-player categories');
