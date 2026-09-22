'use strict';

function aiLineup(team){
 const outfield=team.roster.filter(player=>!player.keeper);
 return [team.roster.find(player=>player.keeper),...outfield.filter(player=>player.line==='def').slice(0,2),...outfield.filter(player=>player.line==='mid').slice(0,2),...outfield.filter(player=>player.line==='att').slice(0,1)].filter(Boolean);
}
function storedSeason(player,number=activeSave.seasonNumber){return(player.seasons||[]).find(season=>season.number===number)||blankStats(number)}
function addSyntheticMatch(team,goals){
 const lineup=aiLineup(team),outfield=lineup.filter(player=>!player.keeper);
 for(const player of lineup){const stats=currentStats(player);stats.games++;stats.ratingTotal+=6;stats.ratingCount++}
 for(let goal=0;goal<goals;goal++){
  const pool=outfield.flatMap(player=>Array(Math.max(1,Math.round((player.fin??9)/3.6)+(player.line==='att'?3:player.line==='mid'?1:0))).fill(player));
  const scorer=pick(pool),stats=currentStats(scorer);stats.goals++;stats.shots+=1+Math.floor(Math.random()*2);stats.onTarget++;
 }
}
function recordParallelGames(roundIndex){
 const round=activeSave.schedule[roundIndex];if(!round)return;
 for(const game of round){if(game.home==='user'||game.away==='user'||!game.result||game.v13Recorded)continue;addSyntheticMatch(worldTeam(game.home),game.result[0]);addSyntheticMatch(worldTeam(game.away),game.result[1]);game.v13Recorded=true}
}
function leaguePlayerRows(number=activeSave.seasonNumber){
 const entries=[...[activeSave.keeper,...activeSave.squad].map(player=>({player,club:activeSave.club,clubId:'user'})),...activeSave.world.teams.flatMap(team=>team.roster.map(player=>({player,club:team.name,clubId:team.id})))]
  .filter(entry=>!entry.player.keeper)
  .map(entry=>{const stats=storedSeason(entry.player,number);return{...entry,stats,games:stats.games||0,goals:stats.goals||0,shots:stats.shots||0,onTarget:stats.onTarget||0,rating:stats.ratingCount?stats.ratingTotal/stats.ratingCount:0}});
 return entries.sort((a,b)=>b.goals-a.goals||b.onTarget-a.onTarget||b.shots-a.shots||b.rating-a.rating||a.player.name.localeCompare(b.player.name));
}
function ownSeasonRows(number=activeSave.seasonNumber){return[activeSave.keeper,...activeSave.squad].map(player=>{const stats=storedSeason(player,number);return{player,stats,rating:stats.ratingCount?stats.ratingTotal/stats.ratingCount:0}})}
function seasonSnapshot(){
 if(activeSave.currentRound<10)return null;activeSave.clubHistory=activeSave.clubHistory||[];
 const existing=activeSave.clubHistory.find(item=>item.number===activeSave.seasonNumber);if(existing)return existing;
 const rank=standings().findIndex(team=>team.id==='user')+1,user=activeSave.table.find(team=>team.id==='user'),leagueScorer=leaguePlayerRows()[0],clubScorer=leaguePlayerRows().filter(row=>row.clubId==='user')[0],best=ownSeasonRows().sort((a,b)=>b.rating-a.rating)[0];
 const snapshot={number:activeSave.seasonNumber,rank,played:user.played,w:user.w,d:user.d,l:user.l,gf:user.gf,ga:user.ga,pts:user.pts,champion:standings()[0].name,topScorer:leagueScorer?{name:leagueScorer.player.name,nation:leagueScorer.player.nation,club:leagueScorer.club,goals:leagueScorer.goals}:null,clubTopScorer:clubScorer?{name:clubScorer.player.name,nation:clubScorer.player.nation,goals:clubScorer.goals}:null,bestPlayer:best?{name:best.player.name,nation:best.player.nation,rating:best.rating}:null};
 activeSave.clubHistory.push(snapshot);return snapshot;
}
function scorerTableHTML(){
 const rows=leaguePlayerRows().slice(0,10);return`<section class="panel v13-panel"><div class="section-heading"><h2>Ligastatistik</h2><span>Saison ${activeSave.seasonNumber}</span></div><h3 class="v13-subtitle">Torschützenliste</h3><div class="scorer-table"><div class="scorer-row scorer-head"><span>#</span><b>Spieler</b><span>Verein</span><span>Sp.</span><span>Sch.</span><strong>Tore</strong></div>${rows.map((row,index)=>`<div class="scorer-row ${row.clubId==='user'?'own':''}"><span>${index+1}</span><b>${flagSVG(row.player.nation)}<i>${escapeHTML(row.player.name)}</i></b><span>${escapeHTML(row.club)}</span><span>${row.games}</span><span>${row.shots}</span><strong>${row.goals}</strong></div>`).join('')}</div></section>`
}
function historyHTML(){
 const completed=activeSave.clubHistory||[],savedCurrent=completed.find(season=>season.number===activeSave.seasonNumber),user=activeSave.table.find(team=>team.id==='user'),liveCurrent=savedCurrent||{number:activeSave.seasonNumber,rank:user.played?standings().findIndex(team=>team.id==='user')+1:null,played:user.played,w:user.w,d:user.d,l:user.l,gf:user.gf,ga:user.ga,pts:user.pts,live:true},seasons=[...completed.filter(season=>season.number!==activeSave.seasonNumber),liveCurrent],titles=completed.filter(season=>season.rank===1).length,total=seasons.reduce((sum,season)=>({games:sum.games+season.played,wins:sum.wins+season.w,gf:sum.gf+season.gf,ga:sum.ga+season.ga}),{games:0,wins:0,gf:0,ga:0});
 return`<section class="panel v13-panel club-history"><div class="section-heading"><h2>Vereinshistorie</h2><span>Seit Saison 1</span></div><div class="history-summary"><span>Spielzeiten<b>${seasons.length}</b></span><span>Meisterschaften<b>${titles}</b></span><span>Siege<b>${total.wins}</b></span><span>Tore<b>${total.gf}:${total.ga}</b></span></div><div class="history-seasons">${[...seasons].reverse().map(season=>`<article class="${season.live?'current-season':''}"><b>Saison ${season.number}</b><span>${season.played?`Platz ${season.rank} · `:'Saisonstart · '}${season.played} Sp. · ${season.w}S ${season.d}U ${season.l}N · ${season.gf}:${season.ga}</span><em>${season.live?`Aktuell · ${season.pts} Punkte`:season.rank===1?'🏆 Meister':`${season.pts} Punkte`}</em></article>`).join('')}</div></section>`
}
function finaleHTML(snapshot){
 const kits=currentKits(),difference=snapshot.gf-snapshot.ga,top=snapshot.topScorer,best=snapshot.bestPlayer;
 return`<section class="panel season-finale"><div class="finale-title">${crestHTML(activeSave.club,kits)}<div><p class="eyebrow">SAISON ${snapshot.number} ABGESCHLOSSEN</p><h2>${snapshot.rank===1?'MEISTER!':`Platz ${snapshot.rank}`}</h2><p>${escapeHTML(snapshot.champion)} ist Meister der Sechserliga.</p></div><div class="finale-kits">${kitHTML(kits.home,'Heimtrikot')} ${kitHTML(kits.away,'Auswärtstrikot')}</div></div><div class="finale-stats"><span>Siege<b>${snapshot.w}</b></span><span>Unentschieden<b>${snapshot.d}</b></span><span>Niederlagen<b>${snapshot.l}</b></span><span>Tore<b>${snapshot.gf}:${snapshot.ga}</b></span><span>Tordifferenz<b>${difference>0?'+':''}${difference}</b></span><span>Punkte<b>${snapshot.pts}</b></span></div><div class="awards"><article><span>⚽ TORSCHÜTZENKÖNIG</span><b>${top?`${flagSVG(top.nation)} ${escapeHTML(top.name)}`:'–'}</b><p>${top?`${escapeHTML(top.club)} · ${top.goals} Tore`:'Noch keine Tore'}</p></article><article><span>★ BESTER VEREINSSPIELER</span><b>${best?`${flagSVG(best.nation)} ${escapeHTML(best.name)}`:'–'}</b><p>${best&&best.rating?`Bewertung ${best.rating.toFixed(1).replace('.',',')}`:'Keine Bewertung'}</p></article></div></section>`
}
function renderSeasonPresentation(){
 if(!activeSave)return;const centerGrid=clubCenter.querySelector('.center-grid');if(!centerGrid)return;
 let snapshot=null;if(activeSave.currentRound>=10)snapshot=seasonSnapshot();
 centerGrid.insertAdjacentHTML('afterend',`${snapshot?finaleHTML(snapshot):''}<div class="v13-grid">${scorerTableHTML()}${historyHTML()}</div>`);
 document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
}

const v12RenderCenter=renderCenter;renderCenter=function(){v12RenderCenter();renderSeasonPresentation()};
const v12FinishMatch=finishMatch;finishMatch=function(){
 if(match.finished)return;const opponent=activeOpponent();v12FinishMatch();
 for(const person of match.people.filter(player=>player.t===1)){const source=opponent.roster.find(player=>player.n===person.n);if(source)recordPerformance(person,source)}
 const completedRound=activeSave.currentRound-1,fixture=activeSave.schedule[completedRound]?.find(game=>game.home==='user'||game.away==='user');if(fixture)fixture.v13Recorded=true;recordParallelGames(completedRound);if(activeSave.currentRound>=10)seasonSnapshot();saveCurrent();
};
const v12StartNextSeason=startNextSeason;startNextSeason=function(){
 if(activeSave.currentRound<10)return;seasonSnapshot();v12StartNextSeason();
 for(const team of activeSave.world.teams)for(const player of team.roster){player.age++;player.fresh=100;player.form=player.form>0?player.form-1:player.form<0?player.form+1:0}
 saveCurrent();renderCenter();
};
document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
