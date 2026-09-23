const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {makeContext}=require('./test-v41.cjs');

const scripts=['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','next-match-v49.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v55.js','opponent-profile-v54.js','ai-career-v60.js'];
const context=makeContext();
for(const file of scripts)
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});

const result=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');activeSave.cupEnabled=false;
 const opponent=activeOpponent(),defenders=opponent.roster.filter(player=>player.line==='def');
 for(const player of defenders)for(const key of ['tak','pos','spd','air'])player[key]=12;
 defenders[0].fresh=25;defenders[1].fresh=42;defenders[2].fresh=100;
 const selected=aiLineup(opponent).filter(player=>player.line==='def').map(player=>player.n);
 start();const matchLineup=match.people.filter(player=>player.t===1).map(player=>player.n);
 const scorer=match.people.find(player=>player.t===1&&player.line==='att');scorer.stats.goals=3;
 match.elapsed=75;match.score=[0,1];finishMatch();
 const saved=JSON.stringify({roster:opponent.roster.map(player=>({n:player.n,form:player.form,fresh:player.fresh,history:player.history})),last:opponent.lastLineup,pending:opponent.pendingPlayedRecovery});
 finishMatch();const repeated=JSON.stringify({roster:opponent.roster.map(player=>({n:player.n,form:player.form,fresh:player.fresh,history:player.history})),last:opponent.lastLineup,pending:opponent.pendingPlayedRecovery});
 openSlot(activeSave);
 const restoredOpponent=worldTeam(opponent.id),featured=restoredOpponent.roster.find(player=>player.n===scorer.n),beforeRecovery=featured.fresh;
 aiCareerPrepare(restoredOpponent);const afterRecovery=featured.fresh;aiCareerPrepare(restoredOpponent);
 const afterSecondPrepare=featured.fresh;
 const fixture=activeSave.schedule[0].find(game=>game.home!=='user'&&game.away!=='user');
 const parallel=worldTeam(fixture.home),parallelStarters=parallel.lastLineup.map(number=>parallel.roster.find(player=>player.n===number));
 const parallelBefore=JSON.stringify(parallel.roster.map(player=>({form:player.form,fresh:player.fresh,history:player.history})));
 recordParallelGames(0);
 const parallelAfter=JSON.stringify(parallel.roster.map(player=>({form:player.form,fresh:player.fresh,history:player.history})));
 const cupHome=worldTeam(fixture.home),cupAway=worldTeam(fixture.away),cupBefore=cupHome.roster.map(player=>player.history.length),cupGame={home:cupHome.id,away:cupAway.id,result:null,winner:null};
 v41SimulateGame(cupGame);
 const cupNewHistory=cupHome.roster.filter((player,index)=>player.history.length>cupBefore[index]).length;
 const cupLast=cupHome.lastLineup.length;
 const beforeReload=JSON.stringify(activeSave.world.teams.map(team=>team.roster.map(player=>({form:player.form,fresh:player.fresh,history:player.history}))));
 openSlot(activeSave);
 const afterReload=JSON.stringify(activeSave.world.teams.map(team=>team.roster.map(player=>({form:player.form,fresh:player.fresh,history:player.history}))));
 const strengthTeam=activeSave.world.teams[0],original=strengthTeam.roster.map(player=>player.fresh);
 strengthTeam.pendingPlayedRecovery=[];for(const player of strengthTeam.roster)player.fresh=100;
 const fit=aiTeamStrength(strengthTeam.id,strengthTeam.strength);
 for(const player of strengthTeam.roster)player.fresh=35;
 const tired=aiTeamStrength(strengthTeam.id,strengthTeam.strength);
 strengthTeam.roster.forEach((player,index)=>player.fresh=original[index]);
 return{selected,rested:defenders[2].n,matchLineup,history:featured.history.length,form:featured.form,saved,repeated,beforeRecovery,afterRecovery,afterSecondPrepare,
  parallelGames:parallelStarters.map(player=>currentStats(player).games),parallelBefore,parallelAfter,cupNewHistory,cupLast,cupResult:cupGame.result,beforeReload,afterReload,fit,tired};
})())`,context));

assert(result.selected.includes(result.rested),'rotation includes the rested defender');
assert(result.selected.every(number=>result.matchLineup.includes(number)),'the match uses the selected defenders');
assert.equal(result.matchLineup.length,6,'the computer starts five outfield players and one keeper');
assert.equal(result.history,1,'a direct opponent gains one recent rating');
assert(result.form>0,'a strong performance improves the opponent form');
assert.equal(result.saved,result.repeated,'finishing the same match twice cannot change status again');
assert(result.beforeRecovery<result.afterRecovery,'a played computer player recovers before the next fixture');
assert.equal(result.afterRecovery,result.afterSecondPrepare,'recovery is credited once');
assert(result.parallelGames.every(games=>games===1),'parallel fixtures credit the selected six players');
assert.equal(result.parallelBefore,result.parallelAfter,'rechecking a league fixture cannot apply status twice');
assert.equal(result.cupNewHistory,6,'all six computer cup starters gain form history');
assert.equal(result.cupLast,6,'the cup saves its actual lineup');
assert(result.cupResult,'the cup game finishes');
assert.equal(result.beforeReload,result.afterReload,'loading a save does not recalculate earlier status');
assert(result.fit>result.tired,'freshness affects simulated computer match strength');

const seasonContext=makeContext();
for(const file of scripts)vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),seasonContext,{filename:file});
vm.runInContext("document.querySelector('#canvas').parentElement={append(){}}",seasonContext);
const season=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure();
 let fixtures=0;while(activeSave.currentRound<10&&fixtures++<15){showTactics();start();match.elapsed=75;match.score=[1,0];finishMatch();renderCenter()}
 const completed={round:activeSave.currentRound,fixtures,cupGames:activeSave.cup.rounds.flat().filter(game=>game.result).length,
  teams:activeSave.world.teams.map(team=>({leagueGames:team.roster.reduce((sum,player)=>sum+(storedSeason(player).games||0),0),
   starters:team.roster.filter(player=>(storedSeason(player).games||0)>0).length,last:team.lastLineup?.length||0,
   history:team.roster.reduce((sum,player)=>sum+player.history.length,0)}))};
 v31EnsureFinale();v31SetStage('retirements');v31SetStage('finance');v31SetStage('complete');
 completed.nextSeason={number:activeSave.seasonNumber,round:activeSave.currentRound,teams:activeSave.world.teams.map(team=>({pending:team.pendingPlayedRecovery,
  players:team.roster.map(player=>({fresh:player.fresh,history:player.history.length}))}))};
 return completed;
})())`,seasonContext));
assert.equal(season.round,10,'the season still finishes after ten league rounds');
assert.equal(season.cupGames,5,'computer status does not block the complete cup bracket');
assert(season.fixtures>=10&&season.fixtures<=13,'all fixtures complete once');
for(const team of season.teams){
 assert.equal(team.leagueGames,60,'each computer club records six players in ten league matches');
 assert(team.starters>6,'computer clubs rotate their outfield starters over the season');
 assert.equal(team.last,6,'the last lineup remains available for the club profile');
 assert(team.history>0,'computer players keep recent form history');
}
assert.equal(season.nextSeason.number,2,'the next season begins normally');
assert.equal(season.nextSeason.round,0,'the league round resets');
for(const team of season.nextSeason.teams){
 assert.equal(team.pending,undefined,'old recovery does not cross the season boundary');
 assert(team.players.every(player=>player.fresh===100&&player.history<=2),'computer status follows the season reset');
}
const liveContext=makeContext();
for(const file of scripts.slice(0,-1))vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),liveContext,{filename:file});
vm.runInContext('var v24Validation=()=>[];var v25RoleBar=()=>{};var v24Remember=()=>{};var v24FatigueText=()=>"frisch";var v24TopSkills=()=>"Passspiel gut";',liveContext);
for(const file of ['pitch-v55.js','pitch-v56.js','pitch-v57.js',scripts.at(-1)])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),liveContext,{filename:file});
const live=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');activeSave.cupEnabled=false;
 document.querySelector('#canvas').parentElement={append(){}};const opponent=activeOpponent();start();
 let frames=0;while(!match.finished&&frames++<5000)step(.039,.05);
 return{finished:match.finished,frames,opponentHistory:opponent.roster.reduce((sum,player)=>sum+player.history.length,0),
  opponentPending:opponent.pendingPlayedRecovery?.length||0};
})())`,liveContext));
assert(live.finished,'a complete match with computer status reaches full time');
assert.equal(live.opponentHistory,6,'the complete match updates all six opponent form histories');
assert.equal(live.opponentPending,6,'the complete match queues one recovery for each opponent starter');
console.log('PASS: computer rotation, league and cup status, one-time recovery, save reload, and result strength');
