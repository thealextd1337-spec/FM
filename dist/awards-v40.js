'use strict';

const v40Styles=document.createElement('style');
v40Styles.textContent=`.honour-medals{display:inline-flex;flex-wrap:wrap;gap:4px;vertical-align:middle;margin-left:7px}.honour-medal{display:inline-grid;place-items:center;min-width:23px;height:23px;padding:0 3px;border:1px solid #aa8c4b;border-radius:50%;background:#493b23;color:#ffe49b;font-size:13px}.honour-medal.best{border-color:#aab6c4;background:#33434d;color:#e0efff}.honour-medal.cup{border-color:#99cbe1;background:#244252;color:#c5eaff}.honours-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:17px 0}.honours-grid article{padding:13px;border:1px solid #3a4f52;border-radius:8px;background:#102126}.honours-grid article b,.honours-grid article span{display:block}.honours-grid article span{color:#9cafac;font-size:11px;margin-top:5px}.honour-history{margin-top:18px}.honour-history article{padding:9px 0;border-bottom:1px solid #35494b;font-size:12px}.table-honours{display:inline-flex;gap:3px;margin-left:5px}.table-honours svg{width:18px;height:18px;vertical-align:middle}@media(max-width:600px){.honours-grid{grid-template-columns:1fr}}`;
document.head.append(v40Styles);

function v40CupIcon(){return'<svg viewBox="0 0 24 24" role="img" aria-label="Pokalsieger"><title>Pokalsieger</title><path fill="#8ccde8" d="M7 3h10v4h3v2c0 3-2 5-5 5-.5 1-1.4 1.8-2.5 2.1V19h4v2h-9v-2h4v-2.9C10.4 15.8 9.5 15 9 14c-3 0-5-2-5-5V7h3V3Zm0 6H6c0 1.5.7 2.4 2 2.8C7.4 10.9 7 10 7 9Zm10 0c0 1-.4 1.9-1 2.8 1.3-.4 2-1.3 2-2.8h-1Z"/><path fill="#dff7ff" d="M9 5h6v4c0 3-1.2 5-3 5s-3-2-3-5V5Z"/></svg>'}
function v40TrophyIcon(){return'<svg viewBox="0 0 24 24" role="img" aria-label="Meister"><title>Meister</title><path fill="#eac15d" d="M7 3h10v4h3v2c0 3-2 5-5 5-.5 1-1.4 1.8-2.5 2.1V19h4v2h-9v-2h4v-2.9C10.4 15.8 9.5 15 9 14c-3 0-5-2-5-5V7h3V3Zm0 6H6c0 1.5.7 2.4 2 2.8C7.4 10.9 7 10 7 9Zm10 0c0 1-.4 1.9-1 2.8 1.3-.4 2-1.3 2-2.8h-1Z"/><path fill="#fff0aa" d="M9 5h6v4c0 3-1.2 5-3 5s-3-2-3-5V5Z"/></svg>'}

function v40AwardPlayer(player,type,season){
 if(!player)return;
 player.awards=player.awards||[];
 if(!player.awards.some(item=>item.type===type&&item.season===season))player.awards.push({type,season});
}
function v40Medals(player){return(player.awards||[]).length?`<span class="honour-medals">${player.awards.map(item=>`<span class="honour-medal ${item.type==='best'?'best':item.type==='cup'?'cup':''}" title="${item.type==='scorer'?'Torschützenkönig':item.type==='best'?'Bester Spieler':'Pokalsieger'} · Saison ${item.season}" aria-label="${item.type==='scorer'?'Torschützenkönig':item.type==='best'?'Bester Spieler':'Pokalsieger'} Saison ${item.season}">${item.type==='scorer'?'⚽':item.type==='best'?'★':'♜'}</span>`).join('')}</span>`:''}

const v13AddSyntheticMatchV40=addSyntheticMatch;
addSyntheticMatch=function(team,goals){
 if(!activeSave?.cupEnabled)return v13AddSyntheticMatchV40(team,goals);
 const lineup=aiLineup(team),outfield=lineup.filter(player=>!player.keeper),contributions=new Map(lineup.map(player=>[player,{goals:0,assists:0}]));
 for(let goal=0;goal<goals;goal++){
  const pool=outfield.flatMap(player=>Array(Math.max(1,Math.round((player.fin??9)/3.6)+(player.line==='att'?3:player.line==='mid'?1:0))).fill(player));
  const scorer=pick(pool),others=outfield.filter(player=>player!==scorer),assister=others.length&&Math.random()<.7?pick(others):null;
  const stats=currentStats(scorer);stats.goals++;stats.shots+=1+Math.floor(Math.random()*2);stats.onTarget++;contributions.get(scorer).goals++;
  if(assister){currentStats(assister).assists++;contributions.get(assister).assists++}
 }
 for(const player of lineup){const stats=currentStats(player),impact=contributions.get(player);stats.games++;stats.ratingTotal+=Math.min(9.5,6+(Math.random()-.5)*.8+impact.goals*1.05+impact.assists*.45);stats.ratingCount++}
};

function v40LeagueAwards(snapshot){
 if(!activeSave?.cupEnabled)return snapshot;
 if(snapshot.awards)return snapshot;
 const rows=leaguePlayerRows(snapshot.number);for(const row of rows)ensurePlayerId(row.player);for(const team of activeSave.world.teams)for(const player of team.roster)if(player.keeper)ensurePlayerId(player);ensurePlayerId(activeSave.keeper);const scorer=rows[0]?.goals>0?[...rows].sort((a,b)=>b.goals-a.goals||(b.stats.assists||0)-(a.stats.assists||0)||a.games-b.games||b.rating-a.rating||String(a.player.pid||a.player.name).localeCompare(String(b.player.pid||b.player.name)))[0]:null;
 const best=[...rows,...[activeSave.keeper,...activeSave.world.teams.map(team=>team.roster.find(player=>player.keeper))].filter(Boolean).map(player=>{const stats=storedSeason(player,snapshot.number);return{player,clubId:player===activeSave.keeper?'user':activeSave.world.teams.find(team=>team.roster.includes(player))?.id,club:player===activeSave.keeper?activeSave.club:activeSave.world.teams.find(team=>team.roster.includes(player))?.name,stats,games:stats.games||0,goals:stats.goals||0,rating:stats.ratingCount?stats.ratingTotal/stats.ratingCount:0}})].filter(row=>row.games>=5).sort((a,b)=>(b.rating+.12*(b.stats.assists||0))-(a.rating+.12*(a.stats.assists||0))||(b.stats.assists||0)-(a.stats.assists||0)||b.goals-a.goals||String(a.player.pid||a.player.name).localeCompare(String(b.player.pid||b.player.name)))[0];
 const entry=row=>row?{pid:row.player.pid,name:row.player.name,nation:row.player.nation,clubId:row.clubId,club:row.club,games:row.games,goals:row.goals,assists:row.stats.assists||0,rating:row.rating}:null;
 snapshot.awards={scorer:entry(scorer),best:entry(best),championId:standings()[0]?.id};
 if(scorer)v40AwardPlayer(scorer.player,'scorer',snapshot.number);
 if(best)v40AwardPlayer(best.player,'best',snapshot.number);
 activeSave.awardHistory=activeSave.awardHistory||[];
 if(!activeSave.awardHistory.some(item=>item.season===snapshot.number&&item.type==='league'))activeSave.awardHistory.push({season:snapshot.number,type:'league',...snapshot.awards});
 return snapshot;
}
const v13SeasonSnapshotV40=seasonSnapshot;
seasonSnapshot=function(){const snapshot=v13SeasonSnapshotV40();return snapshot?v40LeagueAwards(snapshot):null};

const v31SummaryHTMLV40=v31SummaryHTML;
v31SummaryHTML=function(finale){
 const base=v31SummaryHTMLV40(finale),awards=finale.snapshot.awards;
 if(!awards)return base;
 const card=(label,item)=>`<article><b>${label}</b><span>${item?`<button class="player-link" data-final-player="${escapeHTML(item.pid)}">${flagSVG(item.nation)} ${escapeHTML(item.name)}</button> · ${escapeHTML(item.club)}`:'–'}</span><span>${item?`${item.goals} Tore · ${item.assists} Assists · ${item.games} Spiele`:'Keine Vergabe'}</span></article>`;
 const champion=standings()[0];
 const table=`<h2>Abschlusstabelle</h2><div class="league-table">${standings().map((team,index)=>`<div class="table-row ${team.id==='user'?'own':''}"><span>${index+1}</span><b>${escapeHTML(team.name)}${index===0?` <span class="table-honours" title="Meister">${v40TrophyIcon()}</span>`:''}</b><span>${team.played}</span><span>${team.gf-team.ga}</span><strong>${team.pts}</strong></div>`).join('')}</div>`;
 return base.replace('<h2>Top 3 Torschützen deines Kaders</h2>',`<h2>Saison-Auszeichnungen</h2><div class="honours-grid">${card('⚽ Torschützenkönig',awards.scorer)}${card('★ Bester Spieler',awards.best)}<article><b>Meister ${v40TrophyIcon()}</b><span>${escapeHTML(champion.name)}</span></article></div>${table}<h2>Top 3 Torschützen deines Kaders</h2>`);
};

const v18PlayerCardHTMLV40=playerCardHTML;
playerCardHTML=function(player){return v18PlayerCardHTMLV40(player).replace('</h2>',`</h2>${v40Medals(player)}`)};
const v12PlayerHistoryV40=playerHistory;
playerHistory=function(player){return v12PlayerHistoryV40(player).replace(`${escapeHTML(player.name)}</b>`,`${escapeHTML(player.name)}</b>${v40Medals(player)}`)};

function v40TableHonours(){
 if(!activeSave?.cupEnabled)return;
 const previous=(activeSave.clubHistory||[]).find(item=>item.number===activeSave.seasonNumber-1),cupWinner=activeSave.cupArchive?.find(item=>item.season===activeSave.seasonNumber-1)?.winner;
 const next=userFixture(),opponent=next?(next.home==='user'?next.away:next.home):null;
 clubCenter.querySelectorAll('.league-table .table-row:not(.table-head)').forEach(row=>{
  const name=row.querySelector('b'),team=activeSave.table.find(item=>item.name===name?.textContent);if(!team||!name)return;
  if(team.id==='user'){row.classList.add('cup-own');row.setAttribute('aria-label',`${team.name}, dein Verein`)}
  if(team.id===opponent){row.classList.add('cup-opponent');row.setAttribute('aria-label',`${team.name}, nächster Gegner`)}
  if(previous?.awards?.championId===team.id)name.insertAdjacentHTML('beforeend',`<span class="table-honours" title="Meister Saison ${previous.number}">${v40TrophyIcon()}</span>`);
  if(cupWinner===team.id)name.insertAdjacentHTML('beforeend',`<span class="table-honours" title="Pokalsieger Saison ${activeSave.seasonNumber-1}">${v40CupIcon()}</span>`);
 });
}
function v40HistoryHTML(){
 const items=(activeSave.awardHistory||[]).flatMap(item=>{const rows=[];if(item.scorer)rows.push(`Saison ${item.season}: Torschützenkönig ${escapeHTML(item.scorer.name)} (${escapeHTML(item.scorer.club)})`);if(item.best)rows.push(`Saison ${item.season}: Bester Spieler ${escapeHTML(item.best.name)} (${escapeHTML(item.best.club)})`);if(item.type==='cup')rows.push(`Saison ${item.season}: Pokalsieger ${escapeHTML(item.winnerName)}`);return rows});
 return`<details class="panel honour-history"><summary><b>Awardhistorie</b></summary>${items.length?[...items].reverse().map(row=>`<article>${row}</article>`).join(''):'<p class="help">Noch keine Awards vergeben.</p>'}</details>`;
}
const v38RenderCenterV40=renderCenter;
renderCenter=function(){const result=v38RenderCenterV40();if(!activeSave?.cupEnabled)return result;v40TableHonours();if(!clubCenter.querySelector('.honour-history'))clubCenter.querySelector('footer')?.insertAdjacentHTML('beforebegin',v40HistoryHTML());return result};
