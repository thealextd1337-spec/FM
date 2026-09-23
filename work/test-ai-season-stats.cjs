const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext();
for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','main-menu-v46.js','match-report-v47.js','set-pieces-v50.js'])
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
const round=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');
 activeSave.cupEnabled=false;
 let seed=17;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 start();match.score=[1,0];finishMatch();
 return activeSave.schedule[0].filter(game=>game.home!=='user'&&game.away!=='user').map(game=>({
  home:game.home,away:game.away,result:game.result,
  teams:[game.home,game.away].map(id=>({id,players:worldTeam(id).roster.map(player=>({name:player.name,keeper:player.keeper,stats:player.seasons?.find(season=>season.number===activeSave.seasonNumber)||null}))}))
 }));
})())`,context));
assert.equal(round.length,2,'the league round includes two computer-only matches');
for(const fixture of round){
 assert(fixture.result,`missing result for ${fixture.home}–${fixture.away}`);
 for(const [side,team] of fixture.teams.entries()){
  assert.equal(team.players.filter(player=>(player.stats?.games||0)>0).length,6,`${team.id} must record all six participants`);
  assert.equal(team.players.reduce((sum,player)=>sum+(player.stats?.goals||0),0),fixture.result[side],`${team.id} scorer totals must match the fixture`);
  const keeper=team.players.find(player=>player.keeper);
  assert(keeper&&keeper.stats?.games===1,`${team.id} goalkeeper must be identified and credited with the match`);
  assert.equal(keeper.stats.conceded,fixture.result[1-side],`${team.id} goalkeeper must record goals conceded`);
  assert.equal(keeper.stats.cleanSheet||0,Number(fixture.result[1-side]===0),`${team.id} goalkeeper needs the correct clean-sheet total`);
  assert(team.players.reduce((sum,player)=>sum+(player.stats?.fouls||0),0)>0,`${team.id} must have recorded fouls`);
 }
}
const before=vm.runInContext('JSON.stringify(activeSave.world.teams.map(team=>team.roster.map(player=>player.seasons)))',context);
vm.runInContext('recordParallelGames(0)',context);
assert.equal(vm.runInContext('JSON.stringify(activeSave.world.teams.map(team=>team.roster.map(player=>player.seasons)))',context),before,'rechecking a round cannot double-book statistics');
const shutout=round.find(fixture=>fixture.result.includes(0));
const shutoutWinner=shutout.teams[shutout.result[0]===0?1:0];
const leagueBoard=vm.runInContext('v46StatisticsHTML()',context).split('Pokalstatistik')[0];
assert(leagueBoard.includes(shutoutWinner.players.find(player=>player.keeper).name),'the league leaders include the computer goalkeeper clean sheet');
assert.doesNotMatch(leagueBoard,/KI-Spielen werden nur Tore und Schüsse erfasst/,'the old statistics disclaimer must be removed');

const special=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const team=activeSave.world.teams[0],before=team.roster.map(player=>({...currentStats(player)}));
 Math.random=()=>0;
 addSyntheticMatch(team,1,0);
 return team.roster.map((player,index)=>({keeper:player.keeper,before:before[index],after:currentStats(player)}));
})())`,context));
assert.equal(special.reduce((sum,item)=>sum+item.after.penaltiesScored-item.before.penaltiesScored,0),1,'a scored synthetic penalty is attributed to its taker');
assert.equal(special.filter(item=>item.keeper)[0].after.cleanSheet-special.filter(item=>item.keeper)[0].before.cleanSheet,1,'the direct simulation records a goalkeeper clean sheet');
const ordinary=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const team=activeSave.world.teams[0],before=team.roster.map(player=>({...currentStats(player)}));
 Math.random=()=>.5;addSyntheticMatch(team,2,1);
 return team.roster.map((player,index)=>({before:before[index],after:currentStats(player)}));
})())`,context));
assert.equal(ordinary.reduce((sum,item)=>sum+item.after.assists-item.before.assists,0),2,'ordinary goals can credit other computer players with assists');
const missed=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const team=activeSave.world.teams[0],before=team.roster.map(player=>({missed:currentStats(player).penaltiesMissed,shots:currentStats(player).shots}));
 Math.random=()=>0;addSyntheticMatch(team,0,0);
 return team.roster.reduce((sum,player,index)=>({missed:sum.missed+currentStats(player).penaltiesMissed-before[index].missed,shots:sum.shots+currentStats(player).shots-before[index].shots}),{missed:0,shots:0});
})())`,context));
assert.deepEqual(missed,{missed:1,shots:1},'a missed synthetic penalty counts as a shot without changing the final score');

const legacy=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const game=activeSave.schedule[0].find(item=>item.home!=='user'&&item.away!=='user'&&item.result.includes(0));
 const raw=structuredClone(activeSave),savedGame=raw.schedule[0].find(item=>item.home===game.home&&item.away===game.away);
 delete savedGame.v13DetailVersion;
 const winningTeam=raw.world.teams.find(team=>team.id===(game.result[0]===0?game.away:game.home));
 const keeper=winningTeam.roster.find(player=>player.keeper),stats=keeper.seasons.find(season=>season.number===raw.seasonNumber);
 stats.cleanSheet=0;stats.conceded=0;
 openSlot(raw);
 const restored=worldTeam(winningTeam.id).roster.find(player=>player.keeper);
 return{game:activeSave.schedule[0].find(item=>item.home===game.home&&item.away===game.away),winnerId:winningTeam.id,cleanSheet:currentStats(restored).cleanSheet};
})())`,context));
assert.equal(legacy.cleanSheet,1,'legacy computer fixtures backfill the exactly recoverable clean sheet');
assert.equal(legacy.game.v13DetailVersion,2,'legacy fixture is marked to avoid repeated backfills');
vm.runInContext('openSlot(activeSave)',context);
assert.equal(vm.runInContext(`currentStats(worldTeam('${legacy.winnerId}').roster.find(player=>player.keeper)).cleanSheet`,context),1,'reloading the migrated save does not add the same clean sheet twice');
console.log('PASS: computer-only league fixtures populate season statistics, avoid duplicate records, and backfill legacy clean sheets');
