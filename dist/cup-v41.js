'use strict';

const v41Style=document.createElement('style');
v41Style.textContent=`.cup-next-label{display:inline-block;padding:5px 9px;border:1px solid #8ccde8;border-radius:5px;color:#c5eaff;font-size:11px;font-weight:800;letter-spacing:.7px}.cup-main-panel{grid-column:1/-1}.cup-own{background:#264638!important;border-left:3px solid #c7f36b}.cup-opponent{background:#263f51!important;border-left:3px solid #8ccde8}.cup-bracket{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.cup-round{min-width:0}.cup-round h3{font-size:13px;color:#c5eaff}.cup-game{padding:9px;border:1px solid #3a4f52;border-radius:7px;background:#102126;margin-bottom:9px}.cup-game.user{border-color:#c7f36b}.cup-game.final{border-color:#8ccde8}.cup-game>div{display:flex;justify-content:space-between;gap:8px;padding:4px}.cup-game .winner{font-weight:800;color:#e6f5c4}.cup-game small{display:block;color:#8fa8a7;padding:3px 4px}.cup-summary{margin:16px 0}.cup-penalty-order{margin:15px 0;padding:13px;border:1px solid #476268;border-radius:8px;background:#14292e}.cup-penalty-order h3{margin:0 0 8px}.cup-order-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:5px 0}.cup-order-row span{flex:1}.cup-order-row button{min-width:32px;min-height:32px;border:1px solid #536d70;background:#21383d;color:#fff;border-radius:5px}.cup-ceremony{margin:15px 0;padding:18px;border:1px solid #8ccde8;border-radius:10px;background:#142b34;text-align:center}.cup-ceremony .cup-entrants{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:center;margin:20px 0}.cup-ceremony .cup-team{display:flex;flex-direction:column;gap:7px}.cup-ceremony .cup-team:first-child{animation:cup-left .9s ease-out}.cup-ceremony .cup-team:last-child{animation:cup-right .9s ease-out}.cup-ceremony .cup-team span{padding:5px;background:#223c43;border-radius:4px;font-size:11px}.cup-ceremony .cup-vs{color:#8ccde8;font-weight:800}.cup-penalties{padding:15px;margin:14px 0;border:1px solid #8ccde8;border-radius:8px;background:#142b34}.cup-penalties li{margin:5px 0}.cup-celebration{position:relative;overflow:hidden;padding:24px;margin:16px 0;border:2px solid var(--cup-colour,#c7f36b);border-radius:10px;text-align:center;background:#142b34}.cup-celebration h2{position:relative;z-index:1;color:var(--cup-colour,#c7f36b)}.cup-celebration .confetti{position:absolute;top:-12px;width:7px;height:13px;background:var(--confetti);left:var(--left);animation:cup-fall 3s linear infinite;animation-delay:var(--delay)}@keyframes cup-fall{to{transform:translateY(210px) rotate(600deg)}}@keyframes cup-left{from{transform:translateX(-80px);opacity:0}}@keyframes cup-right{from{transform:translateX(80px);opacity:0}}@media(max-width:760px){.cup-bracket{grid-template-columns:1fr}.cup-ceremony .cup-entrants{gap:7px}}@media(prefers-reduced-motion:reduce){.cup-ceremony .cup-team,.cup-celebration .confetti{animation:none}}`;
document.head.append(v41Style);
v41Style.textContent+=`.cup-ceremony-pitch{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:12px;min-height:185px;align-items:center;padding:18px 14px;margin:17px 0;border:2px solid #82ad94;border-radius:9px;background:repeating-linear-gradient(90deg,#24513f 0 44px,#285b46 44px 88px);overflow:hidden}.cup-ceremony-pitch:after{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:2px solid #d4ecd5a8}.cup-ceremony-side{position:relative;z-index:1;display:flex;flex-direction:column;gap:15px;align-items:center}.cup-ceremony-side.left{animation:cup-left 1.2s ease-out both}.cup-ceremony-side.right{animation:cup-right 1.2s ease-out both}.cup-ceremony-line{display:flex;justify-content:center;gap:3px;width:100%}.cup-ceremony-line span{display:grid;place-items:center;width:23px;height:27px;border-radius:5px;background:var(--shirt);border:2px solid var(--trim);color:var(--text);font-size:10px;font-weight:800;transform:rotate(var(--face))}.cup-ceremony-side b{padding:5px 8px;border-radius:5px;background:#102126d9;font-size:11px}@media(max-width:600px){.cup-ceremony-pitch{gap:4px;padding:12px 4px}.cup-ceremony-line span{width:18px;height:24px;font-size:9px}}`;
v41Style.textContent+=`.cup-ceremony-line .cup-ceremony-player{display:flex;flex:1;min-width:0;width:auto;height:auto;padding:0;flex-direction:column;gap:5px;border:0;border-radius:0;background:none;color:#edf7ee;transform:none}.cup-ceremony-line .cup-ceremony-avatar{position:relative;display:grid;place-items:center;width:34px;height:34px;flex:none;border:2px solid var(--player-stroke);border-radius:50%;background:var(--player-fill);color:#142629;font:700 16px Arial,sans-serif;transform:none;box-shadow:0 8px 0 #0003}.cup-ceremony-line .cup-ceremony-player small{display:block;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#edf7ee;font:10px Arial,sans-serif}.cup-ceremony-side.left{--player-fill:#c7f36b;--player-stroke:#e5ffb0}.cup-ceremony-side.right{--player-fill:#7bb7e9;--player-stroke:#bedfff}.cup-ceremony-line .cup-ceremony-player.keeper .cup-ceremony-avatar{background:#e5b56a}@media(max-width:600px){.cup-ceremony-line{gap:1px}.cup-ceremony-line .cup-ceremony-avatar{width:19px;height:19px;font-size:9px}.cup-ceremony-line .cup-ceremony-player small{display:none}}`;
v41Style.textContent+=`.cup-ceremony-pitch{grid-template-columns:repeat(2,minmax(0,1fr))}.cup-ceremony-side{min-width:0}.cup-ceremony-line{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px}.cup-ceremony-line .cup-ceremony-player{width:100%;align-items:center}.cup-ceremony-line .cup-ceremony-player.keeper{position:static;left:auto;bottom:auto;transform:none}.cup-ceremony-line .cup-ceremony-avatar{width:clamp(19px,3vw,34px);height:clamp(19px,3vw,34px);font-size:clamp(9px,1.5vw,16px)}.cup-ceremony-line .cup-ceremony-player small{font-size:clamp(8px,.9vw,10px)}@media(max-width:760px){.cup-ceremony-pitch{grid-template-columns:minmax(0,1fr);gap:20px;padding:17px 8px;min-height:260px}.cup-ceremony-pitch:after{left:0;right:0;top:50%;bottom:auto;border-left:0;border-top:2px solid #d4ecd5a8}.cup-ceremony-side{gap:10px}.cup-ceremony-line{gap:2px}.cup-ceremony-line .cup-ceremony-avatar{width:30px;height:30px;font-size:14px}.cup-ceremony-line .cup-ceremony-player small{display:block;font-size:9px}}@media(max-width:400px){.cup-ceremony-line .cup-ceremony-avatar{width:25px;height:25px;font-size:12px}.cup-ceremony-line .cup-ceremony-player small{font-size:8px}}`;

const v41Dates=[2,5,8],v41Labels=['Auftaktrunde','Halbfinale','Finale'];
let v41PlayingCup=false;
function v41CupActive(){return Boolean(activeSave?.cupEnabled)}
function v41Shuffled(values){const list=[...values];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
function v41CupEnsure(){
 if(!v41CupActive())return null;
 if(activeSave.cup?.season===activeSave.seasonNumber)return activeSave.cup;
 const previous=activeSave.seasonArchive?.find(item=>item.number===activeSave.seasonNumber-1)?.table;
 const all=['user',...activeSave.world.teams.map(team=>team.id)],seeded=previous?[...previous].sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf).slice(0,2).map(team=>team.id):v41Shuffled(all).slice(0,2);
 const rest=v41Shuffled(all.filter(id=>!seeded.includes(id))),byes=v41Shuffled(seeded);
 activeSave.cup={season:activeSave.seasonNumber,stage:0,rounds:[[{home:rest[0],away:rest[1],result:null,winner:null},{home:rest[2],away:rest[3],result:null,winner:null}],[{home:byes[0],away:null,result:null,winner:null},{home:byes[1],away:null,result:null,winner:null}],[{home:null,away:null,result:null,winner:null}]],winner:null};
 saveCurrent();return activeSave.cup;
}
function v41CupStats(player){player.cupSeasons=player.cupSeasons||[];let stats=player.cupSeasons.find(item=>item.number===activeSave.seasonNumber);if(!stats){stats=blankStats(activeSave.seasonNumber,`Pokal Saison ${activeSave.seasonNumber}`);player.cupSeasons.push(stats)}return stats}
function v41CupGameForUser(){const cup=activeSave?.cup;if(!v41CupActive()||!cup||cup.stage>=3||activeSave.currentRound<v41Dates[cup.stage])return null;return cup.rounds[cup.stage].find(game=>!game.result&&(game.home==='user'||game.away==='user'))||null}
function v41PenaltyChance(shooter,keeper){return clamp(.68+((shooter.fin??(shooter.pas||55)*.72)-70)*.004+(shooter.form||0)*.025-(100-(shooter.fresh??100))*.0015-((keeper.gk||70)-70)*.003,.35,.9)}
function v41PenaltyOrder(people,custom){const byNumber=new Map(people.map(player=>[player.n,player])),defaultOrder=[...people.filter(player=>!player.keeper),...people.filter(player=>player.keeper)];return[...(custom||[]).map(number=>byNumber.get(number)).filter(Boolean),...defaultOrder.filter(player=>!(custom||[]).includes(player.n))].filter((player,index,list)=>list.indexOf(player)===index)}
function v41Shootout(userPlayers,opponentPlayers,custom){
 const user=v41PenaltyOrder(userPlayers,custom),opponent=v41PenaltyOrder(opponentPlayers),keepers=[user.find(player=>player.keeper),opponent.find(player=>player.keeper)],kicks=[],score=[0,0];
 const kick=(side,index)=>{const player=(side===0?user:opponent)[index%6],goal=Math.random()<v41PenaltyChance(player,keepers[1-side]);score[side]+=Number(goal);kicks.push({side,number:player.n,name:player.name,goal,score:[...score]})};
 for(let i=0;i<3;i++){kick(0,i);kick(1,i)}
 for(let i=3;score[0]===score[1]&&i<42;i++){kick(0,i);kick(1,i)}
 if(score[0]===score[1]){const side=Math.random()<.5?0:1;for(let team=0;team<2;team++){const player=(team===0?user:opponent)[42%6],goal=team===side;score[team]+=Number(goal);kicks.push({side:team,number:player.n,name:player.name,goal,score:[...score]})}}
 return{kicks,score,winner:score[0]>score[1]?0:1};
}
function v41SimulateGame(game){
 const home=activeSave.world.teams.find(team=>team.id===game.home),away=activeSave.world.teams.find(team=>team.id===game.away),strength=id=>{const base=id==='user'?72:activeSave.world.teams.find(team=>team.id===id)?.strength||70;return typeof aiTeamStrength==='function'?aiTeamStrength(id,base):base};
 const result=[randomGoals(strength(game.home)+2,strength(game.away)),randomGoals(strength(game.away),strength(game.home))];
 let winner=result[0]>result[1]?game.home:result[1]>result[0]?game.away:null,penalties=null;
 if(!winner){const sides=[home,away].map(team=>aiLineup(team));const shoot=v41Shootout(sides[0],sides[1]);penalties=shoot.score;winner=shoot.winner===0?game.home:game.away}
 game.result=result;game.penalties=penalties;game.winner=winner;
 for(const [team,goals] of [[home,result[0]],[away,result[1]]]){
  const lineup=aiLineup(team),outfield=lineup.filter(player=>!player.keeper),contribution=new Map(lineup.map(player=>[player,0]));
  for(let i=0;i<goals;i++){const scorer=pick(outfield),others=outfield.filter(player=>player!==scorer),assist=others.length&&Math.random()<.7?pick(others):null;v41CupStats(scorer).goals++;contribution.set(scorer,contribution.get(scorer)+1);if(assist){v41CupStats(assist).assists++;contribution.set(assist,contribution.get(assist)+.45)}}
  for(const player of lineup){const stats=v41CupStats(player);stats.games++;stats.ratingCount++;stats.ratingTotal+=Math.min(9.5,6+(Math.random()-.5)*.8+contribution.get(player))}
 }
}
function v41CupWinner(cup){
 if(!cup.winner)return;
 activeSave.cupArchive=activeSave.cupArchive||[];
 if(!activeSave.cupArchive.some(item=>item.season===cup.season))activeSave.cupArchive.push(structuredClone(cup));
 activeSave.awardHistory=activeSave.awardHistory||[];
 if(!activeSave.awardHistory.some(item=>item.type==='cup'&&item.season===cup.season))activeSave.awardHistory.push({type:'cup',season:cup.season,winner:cup.winner,winnerName:teamName(cup.winner)});
 if(cup.winner==='user')bookCredit(`cup-winner-${cup.season}`,'Pokalprämie',200,'cup');
}
function v41CupAdvance(){
 const cup=v41CupEnsure();if(!cup)return null;
 let changed=false;
 while(cup.stage<3&&activeSave.currentRound>=v41Dates[cup.stage]){
  const games=cup.rounds[cup.stage];
  for(const game of games)if(game.home&&game.away&&!game.result&&game.home!=='user'&&game.away!=='user'){v41SimulateGame(game);changed=true}
  if(games.some(game=>!game.result)){break}
  if(cup.stage===0){cup.rounds[1][0].away=games[0].winner;cup.rounds[1][1].away=games[1].winner}
  if(cup.stage===1){cup.rounds[2][0].home=games[0].winner;cup.rounds[2][0].away=games[1].winner}
  if(cup.stage===2){cup.winner=games[0].winner;v41CupWinner(cup)}
  cup.stage++;changed=true;
 }
 if(changed)saveCurrent();return cup;
}

const v11UserFixtureV41=userFixture;
userFixture=function(){return v41CupGameForUser()||v11UserFixtureV41()};
const v11RecordPerformanceV41=recordPerformance;
recordPerformance=function(person,source){if(!v41PlayingCup)return v11RecordPerformanceV41(person,source);const stats=v41CupStats(source);stats.games++;stats.ratingTotal+=person.stats.rating;stats.ratingCount++;for(const key of statKeys)stats[key]+=(person.stats[key]||0)};
const v11SettleRoundV41=settleRound;
settleRound=function(){if(v41PlayingCup)return;return v11SettleRoundV41()};
const v15RecordResultCreditsV41=recordResultCredits;
recordResultCredits=function(){if(v41PlayingCup)return;return v15RecordResultCreditsV41()};
const v13RecordParallelGamesV41=recordParallelGames;
recordParallelGames=function(index){if(v41PlayingCup)return;return v13RecordParallelGamesV41(index)};

function v41CupBracket(cup=activeSave.cup){
 if(!cup)return'';
 return`<div class="cup-bracket">${cup.rounds.map((round,index)=>`<div class="cup-round"><h3>${v41Labels[index]}</h3>${round.map(game=>`<div class="cup-game ${game.home==='user'||game.away==='user'?'user':''} ${index===2?'final':''}"><div class="${game.winner===game.home?'winner':''}"><span>${escapeHTML(game.home?teamName(game.home):'Offen')}</span><b>${game.result?.[0]??'–'}</b></div><div class="${game.winner===game.away?'winner':''}"><span>${escapeHTML(game.away?teamName(game.away):'Offen')}</span><b>${game.result?.[1]??'–'}</b></div>${game.penalties?`<small>Elfmeterschießen ${game.penalties.join(' : ')}</small>`:''}</div>`).join('')}</div>`).join('')}</div>`;
}
function v41CupColours(id){return id==='user'?currentKits().home:activeSave.world.teams.find(team=>team.id===id)?.kits?.home||{main:'#8ccde8',trim:'#fff'}}
function v41CupCelebration(id){const colours=v41CupColours(id);return`<div class="cup-celebration" style="--cup-colour:${escapeHTML(colours.main)}"><h2>Glückwunsch zum Pokalsieg!</h2><p>${escapeHTML(teamName(id))} gewinnt den Pokal.</p>${Array.from({length:30},(_,i)=>`<i class="confetti" style="--left:${(i*37)%100}%;--delay:-${(i%7)*.37}s;--confetti:${escapeHTML(i%2?colours.main:colours.trim)}"></i>`).join('')}</div>`}

function v41OrderHTML(){
 const game=v41CupGameForUser();if(!game)return'';
 const all=[...players,homeKeeper],saved=activeSave.cup.penaltyOrder||[],order=v41PenaltyOrder(all,saved);
 return`<div class="cup-penalty-order"><h3>Elfmeterschützen</h3><p class="help">Drei Schützen beginnen. Danach treten alle weiteren Spieler einschließlich Torwart an, bevor jemand erneut schießt.</p>${order.map((player,index)=>`<div class="cup-order-row"><b>${index+1}.</b><span>${escapeHTML(player.name)}${player.keeper?' · TW':''}</span><button type="button" data-cup-move="${index}" data-cup-dir="-1" aria-label="${escapeHTML(player.name)} nach oben" ${index===0?'disabled':''}>↑</button><button type="button" data-cup-move="${index}" data-cup-dir="1" aria-label="${escapeHTML(player.name)} nach unten" ${index===5?'disabled':''}>↓</button></div>`).join('')}</div>`;
}
function v41RenderOrder(){const old=$('#cup-penalty-order');old?.remove();if(!v41CupGameForUser())return;$('#start').insertAdjacentHTML('beforebegin',`<div id="cup-penalty-order">${v41OrderHTML()}</div>`);$('#cup-penalty-order').querySelectorAll('[data-cup-move]').forEach(button=>button.onclick=()=>{const order=v41PenaltyOrder([...players,homeKeeper],activeSave.cup.penaltyOrder).map(player=>player.n),i=+button.dataset.cupMove,j=i+(+button.dataset.cupDir);[order[i],order[j]]=[order[j],order[i]];activeSave.cup.penaltyOrder=order;saveCurrent();v41RenderOrder()})}
const v41CeremonyLines=[
 'Teams und Zuschauer sind bereit! Das Pokalfinale geht los!',
 'Die Tribünen sind voll. Alles ist bereit für das Pokalfinale!',
 'Zwei Teams, ein Pokal. Gleich beginnt das Finale!',
 'Die Spieler stehen bereit. Wer holt sich heute den Pokal?',
 'Das Stadion wartet auf den Anpfiff. Das Finale kann beginnen!'
];
function v41CeremonyLine(game){
 if(!Number.isInteger(game.ceremonyLine)||game.ceremonyLine<0||game.ceremonyLine>=v41CeremonyLines.length){game.ceremonyLine=Math.floor(Math.random()*v41CeremonyLines.length);saveCurrent()}
 return v41CeremonyLines[game.ceremonyLine];
}
function v41FinalCeremony(){
 const game=v41CupGameForUser();if(!game||activeSave.cup.stage!==2)return;
 const opponent=activeOpponent(),us=[...players,homeKeeper],them=aiLineup(opponent);
 const shortName=name=>{const parts=String(name||'').trim().split(/\s+/);return parts.length>1?`${Array.from(parts[0])[0]}. ${parts.slice(1).join(' ')}`:parts[0]||''};
 const icon=player=>`<span class="cup-ceremony-player${player.keeper?' keeper':''}" title="${escapeHTML(player.name)}" role="img" aria-label="${escapeHTML(player.name)}, Nummer ${player.n}${player.keeper?', Torwart':''}"><span class="cup-ceremony-avatar" aria-hidden="true">${player.n}</span><small aria-hidden="true">${escapeHTML(shortName(player.name))}</small></span>`;
 $('#start').hidden=true;
 $('#game-screen .intro').insertAdjacentHTML('afterend',`<section id="cup-ceremony" class="cup-ceremony"><p class="eyebrow">POKALFINALE · EINLAUF</p><h2>${escapeHTML(activeSave.club)} gegen ${escapeHTML(opponent.name)}</h2><div class="cup-ceremony-pitch"><div class="cup-ceremony-side left"><b>${escapeHTML(activeSave.club)}</b><div class="cup-ceremony-line">${us.map(icon).join('')}</div></div><div class="cup-ceremony-side right"><b>${escapeHTML(opponent.name)}</b><div class="cup-ceremony-line">${them.map(icon).join('')}</div></div></div><p class="cup-vs">${escapeHTML(v41CeremonyLine(game))}</p><button type="button" id="cup-final-start" class="primary">Finale starten ↗</button></section>`);
 $('#cup-final-start').onclick=()=>{$('#cup-ceremony').remove();$('#start').hidden=false;start()};
}
const v25ShowTacticsV41=showTactics;
showTactics=function(){v25ShowTacticsV41();if(v41CupActive())v41CupAdvance();const game=v41CupGameForUser();$('#start').innerHTML=`${game?'Pokalspiel':'Ligaspiel'} starten <span>↗</span>`;if(!game)return;$('#heading').textContent=`Dein Plan fürs Pokal-${v41Labels[activeSave.cup.stage]}.`;$('#subtitle').textContent=`${activeSave.club} gegen ${activeOpponent().name}`;v41RenderOrder();v41FinalCeremony()};
const v25StartV41=start;
start=function(){const game=v41CupGameForUser();v41PlayingCup=Boolean(game);const result=v25StartV41();if(running&&v41PlayingCup){match.cup={stage:activeSave.cup.stage,index:activeSave.cup.rounds[activeSave.cup.stage].indexOf(game)};match.cupOpponentName=activeOpponent().name;$('#subtitle').textContent=`Pokal · ${v41Labels[match.cup.stage]} · ${activeSave.club} gegen ${match.cupOpponentName}`;$('#match-plan').textContent=`POKAL · ${v41Labels[match.cup.stage].toUpperCase()}`}else v41PlayingCup=false;document.querySelector('.match-meta span:last-child').textContent=v41PlayingCup?'POKALSPIEL':'LIGASPIEL';return result};$('#start').onclick=()=>start();
function v41RefreshCupBoard(){const name=document.querySelector('.scoreboard .away-team b');if(match?.cupOpponentName&&name)name.textContent=match.cupOpponentName}
if(typeof v25UpdateLiveBoard==='function'){const v25UpdateLiveBoardV41=v25UpdateLiveBoard;v25UpdateLiveBoard=function(){v25UpdateLiveBoardV41();v41RefreshCupBoard()}}

function v41FinishCupGame(game,shootout){
 const cup=activeSave.cup,result=game.home==='user'?[...match.score]:[match.score[1],match.score[0]];
 if(shootout)for(const kick of shootout.kicks){
  const roster=kick.side===0?[...players,homeKeeper]:worldTeam(game.home==='user'?game.away:game.home).roster,source=roster.find(player=>player.n===kick.number);
  if(source){const stats=v41CupStats(source),key=kick.goal?'penaltiesScored':'penaltiesMissed';stats[key]=(stats[key]||0)+1}
 }
 game.result=result;game.penalties=shootout?(game.home==='user'?shootout.score:[shootout.score[1],shootout.score[0]]):null;
 game.winner=result[0]>result[1]?game.home:result[1]>result[0]?game.away:shootout.winner===0?'user':game.home==='user'?game.away:game.home;
 v41PlayingCup=false;v41CupAdvance();v41RefreshCupBoard();saveCurrent();
 return cup;
}
function v41PenaltyDisplay(shootout,winner){
 $('#back').hidden=true;
 const panel=$('#match-info');panel.insertAdjacentHTML('beforeend','<section id="cup-penalties" class="cup-penalties"><h3>Elfmeterschießen</h3><p id="cup-penalty-score">0 : 0</p><ol id="cup-kicks"></ol><button type="button" id="cup-next-kick" class="primary">Nächster Elfmeter ↗</button></section>');
 let index=0;$('#cup-next-kick').onclick=()=>{const kick=shootout.kicks[index++];$('#cup-kicks').insertAdjacentHTML('beforeend',`<li>${escapeHTML(kick.name)}: ${kick.goal?'Tor':'gehalten/verschossen'}</li>`);$('#cup-penalty-score').textContent=kick.score.join(' : ');showOverlay(kick.goal?'ELFMETER-TOR!':'KEIN TOR',`${kick.name} · ${kick.score.join(' : ')}`,kick.goal,1.5);if(index>=shootout.kicks.length){$('#cup-next-kick').remove();$('#back').hidden=false;$('#match-title').textContent=`${teamName(winner)} gewinnt im Elfmeterschießen.`;hideOverlay();if(match.cup.stage===2)panel.insertAdjacentHTML('beforeend',v41CupCelebration(winner))}};
}
const v33FinishMatchV41=finishMatch;
finishMatch=function(){if(!v41PlayingCup||!match?.cup)return v33FinishMatchV41();const game=activeSave.cup.rounds[match.cup.stage][match.cup.index];v33FinishMatchV41();const shootout=match.score[0]===match.score[1]?v41Shootout(match.people.filter(player=>player.t===0),match.people.filter(player=>player.t===1),activeSave.cup.penaltyOrder):null;const cup=v41FinishCupGame(game,shootout),winner=game.winner;$('#back').textContent='Zur Vereinszentrale ↗';$('#back').onclick=showCenter;if(shootout)v41PenaltyDisplay(shootout,winner);else{const text=winner==='user'?`Pokalsieg für ${activeSave.club}!`:`${teamName(winner)} gewinnt das Pokalspiel.`;$('#match-title').textContent=text;if(match.cup.stage===2)$('#match-info').insertAdjacentHTML('beforeend',v41CupCelebration(winner))}return cup};

const v40SummaryHTMLV41=v31SummaryHTML;
v31SummaryHTML=function(finale){const base=v40SummaryHTMLV41(finale),cup=activeSave.cup;if(!cup?.winner)return base;return base.replace('<h2>Top 3 Torschützen deines Kaders</h2>',`<h2>Pokalsieger ${v40CupIcon()}</h2>${v41CupCelebration(cup.winner)}<div class="cup-summary">${v41CupBracket(cup)}</div><h2>Top 3 Torschützen deines Kaders</h2>`)};

const v40RenderCenterV41=renderCenter;
renderCenter=function(){if(v41CupActive())v41CupAdvance();const result=v40RenderCenterV41();if(!v41CupActive()||activeSave.currentRound>=10)return result;const lead=clubCenter.querySelector('.center-lead'),table=clubCenter.querySelector('.league-table')?.closest('.panel'),game=v41CupGameForUser();if(!lead)return result;lead.classList.add('cup-main-panel');if(table)table.classList.add('cup-main-panel');const label=game?`Pokal · ${v41Labels[activeSave.cup.stage]}`:`Liga · Spieltag ${activeSave.currentRound+1}`;lead.querySelector('.eyebrow').innerHTML=`<span class="cup-next-label">${label}</span>`;if(game){lead.querySelector('h2').textContent=`${game.home==='user'?'Heimspiel':'Auswärtsspiel'} gegen ${activeOpponent().name}`;lead.querySelector('.help').textContent='KO-Spiel · bei Gleichstand entscheidet das Elfmeterschießen.';lead.querySelector('#to-lineup').innerHTML='Pokalaufstellung & Taktik <span>↗</span>';lead.insertAdjacentHTML('afterend',`<section class="panel cup-main-panel"><h2>Turnierbaum</h2>${v41CupBracket()}</section>`);if(table)table.remove()}else if(table){lead.insertAdjacentElement('afterend',table);table.querySelector('h2').textContent='Aktuelle Ligatabelle'}else{lead.insertAdjacentHTML('afterend',`<section class="panel cup-main-panel"><h2>Aktuelle Ligatabelle</h2><div class="league-table"><div class="table-row table-head"><span>#</span><b>Verein</b><span>Sp.</span><span>TD</span><strong>Pt.</strong></div>${standings().map((team,index)=>`<div class="table-row ${team.id==='user'?'own':''}"><span>${index+1}</span><b>${escapeHTML(team.name)}</b><span>${team.played}</span><span>${team.gf-team.ga>0?'+':''}${team.gf-team.ga}</span><strong>${team.pts}</strong></div>`).join('')}</div></section>`);v40TableHonours()}const cup=activeSave.cup;if(cup&&(!game||cup.stage>=3))clubCenter.querySelector('.center-grid')?.insertAdjacentHTML('afterend',`<details class="panel cup-summary"><summary><b>Pokalturnier ${cup.winner?`· Sieger: ${escapeHTML(teamName(cup.winner))}`:''}</b></summary>${v41CupBracket()}</details>`);clubCenter.querySelector('.center-subtitle').textContent=game?`Pokal · ${v41Labels[cup.stage]} · gegen ${activeOpponent().name}`:`Liga · Spieltag ${activeSave.currentRound+1} · gegen ${activeOpponent().name}`;return result};

const v15StartNextSeasonV41=startNextSeason;
startNextSeason=function(){const before=activeSave?.seasonNumber,result=v15StartNextSeasonV41();if(activeSave?.seasonNumber>before&&v41CupActive()){v41CupEnsure();saveCurrent();renderCenter()}return result};
