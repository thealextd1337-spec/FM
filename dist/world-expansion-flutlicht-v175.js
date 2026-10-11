'use strict';

// Expansion rules use the existing career renderer, decorators and menu controllers.
function v175Selection(c){
 const own=v66Own(c),w=c.world;
 if(v172Ui.id!==c.id)Object.assign(v172Ui,{id:c.id,tab:'overview',season:w.season,current:w.season,country:own.countryId,scope:'domestic',part:'table'});
 if(v172Ui.current!==w.season){if(v172Ui.season===v172Ui.current)v172Ui.season=w.season;v172Ui.current=w.season;}
}
function v175Competition(c,cup){
 const table=cup.type==='league'||cup.format==='crown'?v62TableHTML(c,cup):'';
 const rounds=[...new Set(cup.fixtures.map(f=>f.round))];
 return `<details open data-fl-expansion-section="${['crown','horizon'].includes(cup.format)?cup.format:cup.type}"><summary>${v62AwardIcon(cup.format||cup.country,cup.type,true)} ${v172E(v172Label(c,cup))}</summary>${table}${rounds.map(round=>`<details ${cup.type==='league'?'':'open'}><summary>${v172Round(round)}</summary>${cup.fixtures.filter(f=>f.round===round).map(f=>v62ResultHTML(c,f)).join('')}</details>`).join('')}${!cup.winnerId&&cup.type!=='league'?`<p>${v172T('Weitere Paarungen folgen nach dem Abschluss der Runde.','Further fixtures follow after the round is complete.')}</p>`:''}</details>`;
}
function v175CompetitionPage(c){
 const cups=c.world.competitions.filter(x=>x.season===v172Ui.season),own=v66Own(c),league=cups.find(x=>x.type==='league'&&x.country===own.countryId),cup=cups.find(x=>x.type==='cup'&&x.country===own.countryId);
 const countries=c.world.countries.filter(x=>x.id!==own.countryId),selected=countries.some(x=>x.id===v172Ui.country)?v172Ui.country:countries[0].id;
 return `<section class="v62-season"><div class="v62-competition-heading"><h2 class="v46-view-heading">${v172T('Wettbewerbe','Competitions')}</h2>${v172SeasonSelect(c)}</div><div data-v62-competition-area="own"><div class="v62-competitions">${v175Competition(c,league)}${v175Competition(c,cup)}${cups.filter(x=>['crown','horizon'].includes(x.format)).map(x=>v175Competition(c,x)).join('')}<section data-fl-expansion-section="ranking" translate="no">${v172Ranking(c)}</section></div></div><div data-v62-competition-area="other"><h3>${v172T('Andere Länder','Other countries')}</h3><label>${v172T('Land','Country')}<select data-v175-country>${countries.map(x=>`<option value="${x.id}" ${selected===x.id?'selected':''}>${v172E(v172Country(c,x.id))}</option>`).join('')}</select></label>${cups.filter(x=>x.country===selected&&['league','cup'].includes(x.type)).map(x=>v175Competition(c,x)).join('')}</div>${v62AwardOverviewHTML(c,v172Ui.season)}</section>`;
}
function v175Statistics(c){
 const own=v66Own(c),cups=c.world.competitions.filter(x=>x.season===v172Ui.season&&(x.country===own.countryId||['crown','horizon'].includes(x.format)));
 const totals=cups.map(cup=>{const games=cup.fixtures.filter(f=>f.result&&[f.homeId,f.awayId].includes(own.id));if(!games.length)return'';
  const scores=games.map(f=>f.homeId===own.id?[f.result.homeGoals,f.result.awayGoals]:[f.result.awayGoals,f.result.homeGoals]);
  return `<div class="v62-stat-card" data-fl-stat-type="${['crown','horizon'].includes(cup.format)?cup.format:cup.type}"><strong>${v172E(v172Label(c,cup))}</strong><span>${games.length} ${v172T('Spiele','games')}</span><span>${scores.filter(([a,b])=>a>b).length} ${v172T('S','W')} · ${scores.filter(([a,b])=>a===b).length} ${v172T('U','D')} · ${scores.filter(([a,b])=>a<b).length} ${v172T('N','L')}</span><span>${v172T('Tore','Goals')} ${scores.reduce((s,r)=>s+r[0],0)}:${scores.reduce((s,r)=>s+r[1],0)}</span></div>`;}).join('');
 return `<section class="v62-season"><div class="v62-competition-heading"><h2 class="v46-view-heading">${v172T('Statistik','Statistics')}</h2>${v172SeasonSelect(c)}</div><div class="v62-stat-grid">${totals||`<p>${v172T('Noch keine Partie gespielt.','No matches played yet.')}</p>`}</div></section>`+cups.map(cup=>cup.season===c.world.season&&!c.world.seasonFinished?v62StatBoardHTML(c,cup,v172Label(c,cup)).replace(/<\/section>$/,v172Statistics(c,cup,['rating'])+'</section>').replace(/data-fl-stat-type="[^"]+"/,`data-fl-stat-type="${cup.format==='crown'||cup.format==='horizon'?cup.format:cup.type}"`):`<section class="v62-stat-board" data-fl-stat-type="${cup.format==='crown'||cup.format==='horizon'?cup.format:cup.type}" translate="no"><h3>${v172E(v172Label(c,cup))}</h3>${v172Statistics(c,cup)}</section>`).join('');
}
const v175BaseViews=v62CareerViewsHTML;
v62CareerViewsHTML=function(c){
 if(!v167Active(c))return v175BaseViews(c);v175Selection(c);
 const own=c.manager.managedClubId,next=v62Fixtures(c).filter(f=>!f.result&&[f.homeId,f.awayId].includes(own)).sort((a,b)=>a.day-b.day)[0];
 return {overview:`<p id="v166-message" role="status"></p><section class="v62-season">${v62NextOpponentHTML(c,next)}</section><section class="v62-season" translate="no">${v172MomentHTML(c)}${v170OfficeHTML(c)}</section>`,competition:v175CompetitionPage(c),calendar:v62CalendarHTML(c),statistics:v175Statistics(c)};
};
const v175BaseSummary=v68CompetitionSummaryHTML;
v68CompetitionSummaryHTML=function(c){
 if(!v167Active(c))return v175BaseSummary(c);
 const completed=c.world.competitions.filter(x=>x.winnerId),seasons=[...new Set(completed.map(x=>x.season))].sort((a,b)=>b-a);
 return `<section class="v62-season v68-competition-summary"><details class="v68-archive"><summary>${v172T('Titelarchiv · bisherige Sieger','Title archive · previous winners')}</summary>${seasons.length?seasons.map(season=>`<details class="v68-archive-season" ${season===seasons[0]?'open':''}><summary>${v172T('Saison','Season')} ${season}</summary><div class="v68-archive-grid">${completed.filter(x=>x.season===season).map(x=>`<article><span class="v68-archive-competition">${v62AwardIcon(x.format||x.country,x.type)}${v172E(v172Label(c,x))}</span>${v68ClubButton(c,x.winnerId)}</article>`).join('')}</div></details>`).join(''):`<p>${v172T('Noch keine Titel vergeben.','No titles awarded yet.')}</p>`}</details></section>`;
};
if(typeof document==='object')document.addEventListener('DOMContentLoaded',()=>{
 v61WorldScreen.addEventListener('change',event=>{if(!event.target.matches('[data-v175-country]'))return;v172Ui.country=event.target.value;v61RenderCareer(v61CurrentCareer);});
});
