'use strict';

const v47Style=document.createElement('style');
v47Style.textContent=`#v47-match-report{width:min(900px,calc(100vw - 24px));max-height:88vh;padding:0;border:1px solid #688279;border-radius:13px;background:#16292d;color:#edf5ef;box-shadow:0 24px 70px #000b}#v47-match-report::backdrop{background:#071416c9}#v47-match-report .v47-body{max-height:88vh;overflow:auto;padding:22px}.v47-head{display:flex;justify-content:space-between;align-items:start;gap:12px}.v47-head h2{font-size:24px}.v47-head p{margin:4px 0 0;color:#a9bcb5;font-size:11px}.v47-close{min-width:44px;min-height:44px;border:1px solid #536b65;border-radius:7px;background:#254047;color:#fff;font-size:20px}.v47-score{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:12px;margin:17px 0;padding:17px;background:#102126;border-radius:9px;text-align:center}.v47-score span{font-size:14px;font-weight:800;overflow-wrap:anywhere}.v47-score strong{font-size:31px;font-variant-numeric:tabular-nums}.v47-stat-head,.v47-stat-row{display:grid;grid-template-columns:minmax(0,1fr) 72px 72px;gap:8px;align-items:center;padding:7px 9px;border-bottom:1px solid #334a49;font-size:12px}.v47-stat-head{color:#bad8bd;font-weight:800}.v47-stat-row b,.v47-stat-head b{text-align:center;font-variant-numeric:tabular-nums}.v47-stat-row>span{color:#afc2bc}.v47-rosters{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:19px 0}.v47-roster{min-width:0;padding:13px;background:#102126;border-radius:9px}.v47-roster h3{margin:0 0 9px;font-size:14px}.v47-player-head,.v47-player{display:grid;grid-template-columns:minmax(0,1fr) 44px 34px 34px;gap:5px;align-items:center;padding:8px 3px;border-bottom:1px solid #304543;font-size:11px}.v47-player-head{color:#a8bcb6;font-size:9px;font-weight:800}.v47-player>span:first-child{display:flex;align-items:center;gap:5px;min-width:0}.v47-player .flag-icon{width:22px;flex:none}.v47-player em{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:normal}.v47-player b,.v47-player-head>span:not(:first-child){text-align:center;font-variant-numeric:tabular-nums}.v47-player b{color:#d8efb4}.v47-actions{display:flex;justify-content:flex-end}.v47-actions button{min-height:44px}@media(max-width:650px){#v47-match-report .v47-body{padding:15px}.v47-head h2{font-size:20px}.v47-score{gap:5px;padding:12px 6px}.v47-score span{font-size:11px}.v47-score strong{font-size:25px}.v47-rosters{grid-template-columns:1fr}.v47-stat-head,.v47-stat-row{grid-template-columns:minmax(0,1fr) 58px 58px}.v47-player-head,.v47-player{grid-template-columns:minmax(0,1fr) 40px 30px 30px}}`;
v47Style.textContent+=`#v47-match-report .v47-head{position:sticky;top:-22px;z-index:3;align-items:center;padding:10px 0;background:#16292df2}#v47-match-report .v47-head .v47-menu{width:auto;min-width:125px;min-height:44px;padding:10px 15px;font-size:13px}#v47-match-report .v47-player-detail{display:grid;gap:3px;min-width:0}#v47-match-report .v47-player-detail small{color:#a9c0b5;font-size:10px;white-space:normal}#v47-match-report .v47-player-detail .v47-sub-change{color:#dfff9c;font-weight:700}@media(max-width:650px){#v47-match-report .v47-head{top:-15px}#v47-match-report .v47-head .v47-menu{min-width:105px}}`;
document.head.append(v47Style);
v47Style.textContent+=`.v47-score .v47-winner{position:relative;padding:12px 5px;border:1px solid #c7f36b;border-radius:8px;background:#c7f36b22;color:#eaffbb;box-shadow:0 0 18px #c7f36b33;animation:v47-winner-reveal .7s ease-out both}.v47-score .v47-winner::after{content:'SIEGER';display:block;margin-top:6px;color:#c7f36b;font-size:10px;letter-spacing:1.2px}.v47-actions{gap:9px;flex-wrap:wrap}.v47-actions .v47-menu{border:0;border-radius:7px;padding:10px 16px;background:#c7f36b;color:#142629;font-weight:800}@keyframes v47-winner-reveal{from{opacity:.45;transform:scale(.94);box-shadow:0 0 0 #c7f36b00}to{opacity:1;transform:scale(1);box-shadow:0 0 18px #c7f36b33}}@media(prefers-reduced-motion:reduce){.v47-score .v47-winner{animation:none}}`;
v47Style.textContent+=`.v47-player{width:100%;border:0;border-bottom:1px solid #304543;background:transparent;color:#edf5ef;text-align:left;cursor:pointer}.v47-player:hover,.v47-player:focus-visible{background:#284342}.v47-player-dialog{width:min(430px,calc(100vw - 28px));max-height:85vh;overflow:auto;padding:20px;border:1px solid #688279;border-radius:11px;background:#16292d;color:#edf5ef}.v47-player-dialog::backdrop{background:#071416c9}.v47-player-dialog-head{display:flex;justify-content:space-between;gap:12px;align-items:start}.v47-player-dialog-head h2{margin:0;font-size:21px}.v47-player-dialog-head p{margin:5px 0 0;color:#a9bcb5;font-size:12px}.v47-player-dialog-head button{min-width:44px;min-height:44px;border:1px solid #536b65;border-radius:7px;background:#254047;color:#fff;font-size:20px}.v47-player-stats{display:grid;grid-template-columns:1fr auto;gap:0 12px;margin-top:17px}.v47-player-stats span,.v47-player-stats b{padding:9px 0;border-bottom:1px solid #304543;font-size:13px}.v47-player-stats b{text-align:right;color:#d8efb4;font-variant-numeric:tabular-nums}`;
v47Style.textContent+=`#v47-competition{width:min(950px,calc(100vw - 24px));max-height:88vh;padding:0;border:1px solid #688279;border-radius:13px;background:#16292d;color:#edf5ef}#v47-competition::backdrop{background:#071416c9}.v47-competition-body{max-height:88vh;overflow:auto;padding:22px}.v47-competition-head{display:flex;justify-content:space-between;gap:14px;align-items:start}.v47-competition-head h2{font-size:24px}.v47-competition-head p{margin:5px 0 0;color:#a9bcb5;font-size:12px}.v47-competition-head button{min-width:44px;min-height:44px;border:1px solid #536b65;border-radius:7px;background:#254047;color:#fff;font-size:20px}.v47-competition-grid,.v47-leaders{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px}.v47-competition-section{min-width:0;padding:16px;border:1px solid #344b49;border-radius:9px;background:#102126}.v47-competition-section h3{margin:0 0 12px;font-size:15px}.v47-result{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid #304543;font-size:12px}.v47-result span{min-width:0;overflow-wrap:anywhere}.v47-result span:last-of-type{text-align:right}.v47-result b{font-variant-numeric:tabular-nums;white-space:nowrap}.v47-result .winner{color:#c7f36b;font-weight:800}.v47-result small{grid-column:1/-1;color:#a9bcb5;text-align:center}.v47-competition-section .league-table{margin:0}.v47-competition-section .table-row{font-size:11px}.v47-competition-cup{margin-top:16px}.v47-competition-cup .cup-bracket{gap:9px}.v47-leader-row{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:7px;align-items:center;padding:7px 0;border-bottom:1px solid #304543;font-size:12px}.v47-leader-row span{color:#9fb7ae}.v47-leader-row b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v47-leader-row small{display:block;color:#9fb7ae;font-weight:400}.v47-leader-row strong{color:#c7f36b}.v47-competition-actions{display:flex;justify-content:flex-end;margin-top:20px}.v47-competition-actions button{min-height:44px;padding:10px 18px;border:0;border-radius:7px;background:#c7f36b;color:#142629;font-weight:800}@media(max-width:650px){.v47-competition-body{padding:15px}.v47-competition-grid,.v47-leaders{grid-template-columns:1fr}.v47-competition-section{padding:13px}.v47-competition-head h2{font-size:20px}}`;
v47Style.textContent+=`.v47-competition-grid.cup{grid-template-columns:minmax(0,1fr)}`;
v47Style.textContent+=`.v47-match-award{display:flex;align-items:center;gap:12px;margin:-4px 0 18px;padding:11px 14px;border:1px solid #a3c970;border-radius:9px;background:#263d32}.v47-match-award svg{width:38px;height:38px;flex:none}.v47-match-award span{display:grid;gap:3px}.v47-match-award small{color:#c7f36b;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.v47-match-award strong{font-size:15px}.v47-match-award em{color:#b8c9be;font-size:11px;font-style:normal}`;

const v47Dialog=document.createElement('dialog');
v47Dialog.id='v47-match-report';
v47Dialog.setAttribute('aria-labelledby','v47-report-title');
document.body.append(v47Dialog);
const v47PlayerDialog=document.createElement('dialog');
v47PlayerDialog.className='v47-player-dialog';
v47PlayerDialog.setAttribute('aria-labelledby','v47-player-title');
document.body.append(v47PlayerDialog);
const v47CompetitionDialog=document.createElement('dialog');
v47CompetitionDialog.id='v47-competition';
v47CompetitionDialog.setAttribute('aria-labelledby','v47-competition-title');
document.body.append(v47CompetitionDialog);

function v47Snapshot(opponentName){
 if(!match)return null;
 const ownName=activeSave?.club||'FC Viertel';
 return{ownName,opponentName:opponentName||match.cupOpponentName||activeOpponent()?.name||'Gegner',competition:match.cup?{type:'cup',stage:match.cup.stage}:{type:'league',round:Math.max(0,activeSave.currentRound-1)},score:[...match.score],goals:(match.goals||[]).map(goal=>({...goal})),shots:[...match.shots],possession:[...match.possession],setPieceStats:match.setPieceStats?structuredClone(match.setPieceStats):null,players:match.people.map(player=>({name:player.name,n:player.n,nation:player.nation||'AT',keeper:Boolean(player.keeper),team:player.t,stats:{...player.stats}}))};
}
function v47TeamTotal(report,team,key){return report.players.filter(player=>player.team===team).reduce((sum,player)=>sum+(player.stats[key]||0),0)}
function v47Percent(ok,total){return total?`${Math.round(ok/total*100)} %`:'–'}
function v47PlayerRows(report,team){return report.players.filter(player=>player.team===team).map(player=>{const stats=player.stats,index=report.players.indexOf(player),color=typeof v51RatingColor==='function'?v51RatingColor(Number(stats.rating)):null,change=player.substitution,playingTime=player.minutes===undefined?'':`${player.minutes} Min.`,changeText=change?`${change.direction==='in'?'↑ Eingewechselt':'↓ Ausgewechselt'} ${change.minute}′ · ${playingTime}`:playingTime;return`<button type="button" class="v47-player" data-report-player="${index}" aria-label="Statistik von ${escapeHTML(player.name)} anzeigen${changeText?`, ${changeText}`:''}"><span>${flagSVG(player.nation)}<span class="v47-player-detail"><em title="${escapeHTML(player.name)}">#${player.n} ${escapeHTML(player.name)}</em>${changeText?`<small class="${change?'v47-sub-change':''}">${changeText}</small>`:''}</span></span><b${color?` style="color:${color}"`:''}>${Number(stats.rating||0).toFixed(1).replace('.',',')}</b><b>${stats.goals||0}</b><b>${stats.assists||0}</b></button>`}).join('')}
function v47PlayerStatsHTML(player,teamName){
 const s=player.stats,rows=[['Note',Number(s.rating||0).toFixed(1).replace('.',',')],['Tore',s.goals||0],['Vorlagen',s.assists||0],['Pässe',`${s.passComplete||0} / ${s.passes||0}`],['Passquote',v47Percent(s.passComplete||0,s.passes||0)]];
 if(player.keeper)rows.push(['Paraden',s.saves||0],['Schüsse aufs Tor',s.faced||0],['Gegentore',s.conceded||0],['Zu null',s.cleanSheet?'Ja':'Nein']);
 else rows.push(['Schüsse',s.shots||0],['Davon aufs Tor',s.onTarget||0],['Hohe Pässe',`${s.highComplete||0} / ${s.highPasses||0}`],['Flanken',`${s.crossComplete||0} / ${s.crosses||0}`],['Kopfballschüsse',s.headers||0],['Kopfballpässe',s.headerPasses||0],['Volleyschüsse',s.volleys||0],['Luftduelle gewonnen',`${s.aerialWon||0} / ${s.aerialDuels||0}`],['Zweikämpfe gewonnen',`${s.duelsWon||0} / ${s.duels||0}`],['Ballabfänge',s.interceptions||0]);
 const color=typeof v51RatingColor==='function'?v51RatingColor(Number(s.rating)):null;
 return`<div class="v47-player-dialog-head"><div><h2 id="v47-player-title">${flagSVG(player.nation)} #${player.n} ${escapeHTML(player.name)}</h2><p>${escapeHTML(teamName)} · Statistik dieses Spiels</p></div><button type="button" class="v47-player-close" aria-label="Spielerstatistik schließen">×</button></div><div class="v47-player-stats">${rows.map(([label,value])=>`<span>${label}</span><b${label==='Note'&&color?` style="color:${color}"`:''}>${value}</b>`).join('')}</div>`;
}
function v47OpenPlayerStats(report,index){
 const player=report?.players?.[index];if(!player)return false;
 v47PlayerDialog.innerHTML=v47PlayerStatsHTML(player,player.team===0?report.ownName:report.opponentName);
 v47PlayerDialog.querySelector('.v47-player-close').onclick=()=>v47PlayerDialog.close?.();
 if(v47PlayerDialog.open)v47PlayerDialog.close();
 if(v47PlayerDialog.showModal)v47PlayerDialog.showModal();else v47PlayerDialog.setAttribute('open','');
 return true;
}
function v47SeasonLeaders(type,key){
 const own=[activeSave.keeper,...activeSave.squad].map(player=>({player,club:activeSave.club})),former=(activeSave.formerPlayers||[]).map(entry=>({player:entry.player,club:activeSave.club})),world=activeSave.world.teams.flatMap(team=>team.roster.map(player=>({player,club:team.name}))),seen=new Set();
 return[...own,...world,...former].filter(entry=>{
  const id=entry.player?.pid||`${entry.club}:${entry.player?.name}`;
  if(!entry.player||seen.has(id))return false;seen.add(id);return true;
 }).map(entry=>{
  const season=type==='cup'?entry.player.cupSeasons?.find(item=>item.number===activeSave.seasonNumber):storedSeason(entry.player);
  return{...entry,value:season?.[key]||0};
 }).filter(entry=>entry.value>0).sort((a,b)=>b.value-a.value||a.player.name.localeCompare(b.player.name)).slice(0,5);
}
function v47LeadersHTML(type,key,title){
 const rows=v47SeasonLeaders(type,key);
 return`<section class="v47-competition-section"><h3>${title} · Saison ${activeSave.seasonNumber}</h3>${rows.map((row,index)=>`<div class="v47-leader-row"><span>${index+1}.</span><b>${escapeHTML(row.player.name)}<small>${escapeHTML(row.club)}</small></b><strong>${row.value}</strong></div>`).join('')||'<p class="help">Noch keine Einträge.</p>'}</section>`;
}
function v47OtherResultHTML(game,type){
 const winner=type==='cup'?game.winner:game.result[0]>game.result[1]?game.home:game.result[1]>game.result[0]?game.away:null;
 return`<div class="v47-result"><span class="${winner===game.home?'winner':''}">${escapeHTML(teamName(game.home))}</span><b>${game.result.join(' : ')}</b><span class="${winner===game.away?'winner':''}">${escapeHTML(teamName(game.away))}</span>${game.penalties?`<small>Elfmeterschießen ${game.penalties.join(' : ')}</small>`:''}</div>`;
}
function v47CompetitionHTML(report){
 const type=report.competition?.type||(match?.cup?'cup':'league'),cup=type==='cup',index=cup?(report.competition?.stage??match?.cup?.stage??0):(report.competition?.round??Math.max(0,activeSave.currentRound-1)),games=(cup?activeSave.cup?.rounds[index]:activeSave.schedule[index])||[],roundResults=games.filter(game=>game.result&&(cup||game.home!=='user'&&game.away!=='user')),label=cup?`Pokal · ${v41Labels[index]}`:`Liga · Spieltag ${index+1}`;
 const results=`<section class="v47-competition-section"><h3>${cup?'Alle Ergebnisse':'Weitere Ergebnisse'}</h3>${roundResults.map(game=>v47OtherResultHTML(game,type)).join('')||'<p class="help">Noch keine Ergebnisse in dieser Runde.</p>'}</section>`;
 const table=`<section class="v47-competition-section"><h3>Ligatabelle</h3><div class="league-table"><div class="table-row table-head"><span>#</span><b>Verein</b><span>Sp.</span><span>TD</span><strong>Pt.</strong></div>${standings().map((team,rank)=>`<div class="table-row ${team.id==='user'?'own':''}"><span>${rank+1}</span><b>${escapeHTML(team.name)}</b><span>${team.played}</span><span>${team.gf-team.ga>0?'+':''}${team.gf-team.ga}</span><strong>${team.pts}</strong></div>`).join('')}</div></section>`;
 return`<div class="v47-competition-body"><div class="v47-competition-head"><div><h2 id="v47-competition-title">${label}</h2><p>Ergebnisse und Saisonstatistik</p></div><button type="button" class="v47-competition-close" aria-label="Wettbewerbsübersicht schließen">×</button></div><div class="v47-competition-grid${cup?' cup':''}">${results}${cup?'':table}</div>${cup?`<section class="v47-competition-section v47-competition-cup"><h3>Turnierbaum</h3>${v41CupBracket(activeSave.cup)}</section>`:''}<div class="v47-leaders">${v47LeadersHTML(type,'goals','Torschützen')}${v47LeadersHTML(type,'assists','Vorlagen')}</div><div class="v47-competition-actions"><button type="button" class="v47-competition-done">Zur Vereinszentrale</button></div></div>`;
}
function v47ShowCompetition(report){
 v47CompetitionDialog.innerHTML=v47CompetitionHTML(report);
 for(const button of v47CompetitionDialog.querySelectorAll('.v47-competition-close,.v47-competition-done'))button.onclick=()=>{v47CompetitionDialog.close?.();showCenter()};
 if(v47CompetitionDialog.open)v47CompetitionDialog.close();
 if(v47CompetitionDialog.showModal)v47CompetitionDialog.showModal();else v47CompetitionDialog.setAttribute('open','');
}
v47Style.textContent+=`.v47-score-team{display:grid;justify-items:center;align-content:center;gap:7px;min-width:0}.v47-score-club{display:flex;align-items:center;justify-content:center;gap:7px;min-width:0}.v47-score-club .v61-crest{width:29px;height:34px;flex:none}.v47-score-goals{display:grid;gap:3px;color:#c4d8ce;font-size:11px}.v47-score-goals small{font-size:11px}html[lang=en] .v47-score .v47-winner::after{content:'WINNER'}@media(max-width:650px){.v47-score-club{flex-wrap:wrap;gap:4px}.v47-score-club .v61-crest{width:23px;height:27px}.v47-score-goals small{font-size:9px}}`;
function v47ReportHTML(report,shootout){
 const [homeTime,awayTime]=report.possession,share=Math.round(homeTime/(homeTime+awayTime||1)*100),homeCode=teamShortCode(report.ownName),awayCode=teamShortCode(report.opponentName);
 const winner=shootout?.winner??(report.score[0]===report.score[1]?null:report.score[0]>report.score[1]?0:1);
 const matchWinner=report.players.find(player=>player.pid&&player.pid===report.manOfMatchPid);
 const matchAward=matchWinner?`<div class="v47-match-award">${typeof v62AwardIcon==='function'?v62AwardIcon(null,'man-of-the-match'):'★'}<span><small>Man of the Match</small><strong>${escapeHTML(matchWinner.name)}</strong><em>${escapeHTML(matchWinner.team===0?report.ownName:report.opponentName)} · Note ${Number(matchWinner.stats.rating).toFixed(1).replace('.',',')}</em></span></div>`:'';
 const scoreSide=(side,name)=>{
  const club=report.clubIds&&typeof v61CurrentCareer!=='undefined'&&v61CurrentCareer?.world.clubs.find(item=>item.id===report.clubIds[side]);
  const goals=(report.goals||[]).filter(goal=>goal.team===side);
  return`<div class="v47-score-team ${winner===side?'v47-winner':''}"><div class="v47-score-club">${club?v61CrestSVG(club):''}<span>${escapeHTML(name)}</span></div>${goals.length?`<div class="v47-score-goals">${goals.map(goal=>`<small>${escapeHTML(goal.name)} ${escapeHTML(String(goal.minute))}′</small>`).join('')}</div>`:''}</div>`;
 };
 const rows=[['Schüsse',report.shots[0],report.shots[1]],['Aufs Tor',v47TeamTotal(report,0,'onTarget'),v47TeamTotal(report,1,'onTarget')],['Ballbesitz',`${share} %`,`${100-share} %`],['Passquote',v47Percent(v47TeamTotal(report,0,'passComplete'),v47TeamTotal(report,0,'passes')),v47Percent(v47TeamTotal(report,1,'passComplete'),v47TeamTotal(report,1,'passes'))],['Gewonnene Zweikämpfe',v47TeamTotal(report,0,'duelsWon'),v47TeamTotal(report,1,'duelsWon')]];
 rows.push(...[['Hohe Pässe','highPasses'],['Flanken','crosses'],['Kopfballschüsse','headers'],['Volleyschüsse','volleys']].map(([label,key])=>[label,v47TeamTotal(report,0,key),v47TeamTotal(report,1,key)]));
 if(report.setPieceStats)rows.push(...[['Ecken','corners'],['Fouls','fouls'],['Freistöße','freeKicks'],['Elfmeter','penalties']].map(([label,key])=>[label,...report.setPieceStats[key]]));
 return`<div class="v47-body"><div class="v47-head"><div><h2 id="v47-report-title">Spielbericht</h2><p>Spielende · Noten von 1 bis 10 · T = Tore · V = Vorlagen</p></div><button type="button" class="primary v47-menu">Weiter →</button></div><div class="v47-score">${scoreSide(0,report.ownName)}<strong>${report.score.join(' : ')}</strong>${scoreSide(1,report.opponentName)}</div>${matchAward}${shootout?`<p class="help">Elfmeterschießen: ${shootout.score.join(' : ')} · ${escapeHTML(shootout.winner===0?report.ownName:report.opponentName)} gewinnt</p>`:''}<div class="v47-stat-head"><span>Teamstatistik</span><b title="${escapeHTML(report.ownName)}">${escapeHTML(homeCode)}</b><b title="${escapeHTML(report.opponentName)}">${escapeHTML(awayCode)}</b></div>${rows.map(([label,home,away])=>`<div class="v47-stat-row"><span>${label}</span><b>${home}</b><b>${away}</b></div>`).join('')}<div class="v47-rosters">${[[0,report.ownName],[1,report.opponentName]].map(([team,name])=>`<section class="v47-roster"><h3>${escapeHTML(name)}</h3><div class="v47-player-head"><span>Spieler</span><span>Note</span><span>T</span><span>V</span></div>${v47PlayerRows(report,team)}</section>`).join('')}</div></div>`;
}
function v47ShowReport(report,shootout){
 if(!report)return;
 v47Dialog.innerHTML=v47ReportHTML(report,shootout);
 v47Dialog.querySelectorAll('.v47-close,.v47-done').forEach(button=>button.onclick=()=>{v47PlayerDialog.close?.();v47Dialog.close()});
 v47Dialog.onclick=event=>{const row=event.target.closest('[data-report-player]');if(row)v47OpenPlayerStats(report,Number(row.dataset.reportPlayer))};
 v47Dialog.querySelector('.v47-menu').onclick=()=>{v47Dialog.close?.();v47ShowCompetition(report)};
 if(v47Dialog.open)v47Dialog.close();
 if(v47Dialog.showModal)v47Dialog.showModal();else v47Dialog.setAttribute('open','');
}

const v47BasePending=v42CareerPending;
v42CareerPending=function(){const pending=v47BasePending();pending.report=v47Snapshot(pending.opponentName);return pending};

const v47BaseFinishMatch=finishMatch;
finishMatch=function(){const alreadyFinished=Boolean(match?.finished),opponentName=match?.cupOpponentName||(!alreadyFinished&&activeSave?activeOpponent().name:null),result=v47BaseFinishMatch();if(!alreadyFinished&&match?.finished&&!activeSave?.cup?.pending)v47ShowReport(v47Snapshot(opponentName));return result};

const v47BaseRenderScreen=v42RenderScreen;
v42RenderScreen=function(openDialog=false){const result=v47BaseRenderScreen(openDialog),session=v42Session;if(session?.mode==='career'&&session.phase==='done'){const exit=v42Screen.querySelector('#v42-exit'),original=exit?.onclick;if(exit&&original)exit.onclick=()=>{const report=session.report||v47Snapshot(session.opponentName);original();v47ShowReport(report,{score:session.score,winner:session.winner})}}return result};

function v47Version(){document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 48');const menuFooter=startScreen.querySelector('footer');if(menuFooter)menuFooter.textContent='Doppel 6 / PROTOTYP 48'}
const v47BaseRenderCenter=renderCenter;
renderCenter=function(){const result=v47BaseRenderCenter();v47Version();return result};
const v47BaseShowTactics=showTactics;
showTactics=function(){const result=v47BaseShowTactics();v47Version();return result};
const v47BaseStart=start;
start=function(){const opponentName=activeSave?activeOpponent().name:'SC Hafen',result=v47BaseStart();if(match&&running)match.opponentName=match.cupOpponentName||opponentName;v47Version();return result};
$('#start').onclick=()=>start();
const v47BaseShowRecords=v43ShowRecords;
v43ShowRecords=function(){const result=v47BaseShowRecords();v47Version();return result};
v47Version();
