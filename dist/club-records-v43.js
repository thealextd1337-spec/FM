'use strict';

const v43Styles=document.createElement('style');
v43Styles.textContent=`.records-entry{margin:0 0 16px}.records-entry button{width:100%;text-align:left}.records-page .records-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.records-page .records-heading h1{margin:4px 0 0}.records-page .records-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:17px 0}.records-page .record-card{min-width:0;padding:17px;border:1px solid #455a59;border-radius:10px;background:#102126}.records-page .record-card>span{display:block;color:#adc0b9;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase}.records-page .record-card>strong{display:block;margin:10px 0 6px;color:#f0d889;font:700 34px Impact,sans-serif}.records-page .record-card>b{display:flex;align-items:center;gap:8px;overflow-wrap:anywhere;font-size:17px}.records-page .record-card>p{margin:9px 0 0;color:#b8c9c2;font-size:12px}.records-page .record-card .flag-icon,.records-page .record-award .flag-icon{flex:none}.records-page .record-award{display:flex;gap:10px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #344a4a}.records-page .record-award>span{flex:none;min-width:24px;color:#f5d886;font-size:19px}.records-page .record-award>span svg{width:22px;height:22px}.records-page .record-award>div{min-width:0}.records-page .record-award b{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px}.records-page .record-award small{display:block;margin-top:4px;color:#9fb3ad;font-size:10px}.records-page .record-season{margin:18px 0 0;color:#a9bbb4;font-size:11px;text-transform:uppercase;letter-spacing:1px}.records-page .record-back{margin:0 0 15px}@media(max-width:600px){.records-page .records-grid{grid-template-columns:1fr}.records-page .records-heading{display:block}}`;
document.head.append(v43Styles);

function v43ClubPlayers(){
 const players=new Map();
 for(const entry of activeSave.formerPlayers||[]){const player=entry.player;if(player)players.set(player.pid||`former-${players.size}`,player)}
 for(const player of[activeSave.keeper,...activeSave.squad])if(player)players.set(player.pid||`current-${player.n}`,player);
 return[...players.values()];
}
function v43ClubStats(player){
 const league=sumStats(player),cup=(player.cupSeasons||[]).reduce((total,season)=>({games:total.games+(season.games||0),goals:total.goals+(season.goals||0)}),{games:0,goals:0});
 return{player,games:(league.games||0)+cup.games,goals:(league.goals||0)+cup.goals};
}
function v43Records(){
 const rows=v43ClubPlayers().map(v43ClubStats).filter(row=>row.games>0);
 return{
  scorer:[...rows].sort((a,b)=>b.goals-a.goals||a.games-b.games||a.player.name.localeCompare(b.player.name,'de'))[0]||null,
  appearances:[...rows].sort((a,b)=>b.games-a.games||b.goals-a.goals||a.player.name.localeCompare(b.player.name,'de'))[0]||null
 };
}
function v43RecordCard(label,value,row){
 return`<article class="record-card"><span>${label}</span><strong>${row?value(row):'–'}</strong><b>${row?`${flagSVG(row.player.nation)} ${escapeHTML(row.player.name)}`:'Noch kein Einsatz'}</b><p>${row?`${escapeHTML(nationData[row.player.nation]?.name||row.player.nation||'Unbekannt')} · ${row.games} Pflichtspiele · ${row.goals} Tore für ${escapeHTML(activeSave.club)}`:'Der Rekord erscheint nach dem ersten Spiel.'}</p></article>`;
}
function v43AwardsHTML(){
 const seasons=new Map();
 for(const entry of activeSave.awardHistory||[]){const list=seasons.get(entry.season)||[];
  if(entry.type==='league')for(const [label,icon,player]of[['Torschützenkönig','⚽',entry.scorer],['Bester Spieler','★',entry.best]])if(player)list.push(`<article class="record-award"><span>${icon}</span><div><b>${label}: ${flagSVG(player.nation)} ${escapeHTML(player.name)}</b><small>${escapeHTML(player.club)} · ${player.games} Spiele · ${player.goals} Tore${label==='Bester Spieler'?` · ${player.assists||0} Assists`:''}</small></div></article>`);
  if(entry.type==='cup')list.push(`<article class="record-award"><span>${v40CupIcon()}</span><div><b>Pokalsieger: ${escapeHTML(entry.winnerName||teamName(entry.winner))}</b></div></article>`);
  seasons.set(entry.season,list);
 }
 return[...seasons].sort((a,b)=>b[0]-a[0]).map(([season,items])=>`<h3 class="record-season">Saison ${season}</h3>${items.join('')}`).join('')||'<p class="help">Noch keine Awards vergeben.</p>';
}
function v43RecordsHTML(){
 const records=v43Records();
 return`<section class="intro records-heading"><div><p class="eyebrow">${escapeHTML(activeSave.club)}</p><h1>Awards & Vereinsrekorde</h1></div></section><button type="button" class="menu-action record-back" id="records-back">← Zur Vereinszentrale</button><section class="panel records-page"><div class="section-heading"><h2>Vereinsrekorde</h2><span>Ligaspiele + Pokalspiele</span></div><div class="records-grid">${v43RecordCard('Meiste Tore',row=>row.goals,records.scorer)}${v43RecordCard('Meiste Einsätze',row=>row.games,records.appearances)}</div><div class="section-heading"><h2>Awardhistorie</h2><span>Alle Saisonen</span></div>${v43AwardsHTML()}</section><footer><span>Doppel 6 / PROTOTYP 43</span><span>Saison ${activeSave.seasonNumber}</span></footer>`;
}
function v43ShowRecords(){if(!activeSave||running)return;clubCenter.innerHTML=v43RecordsHTML();clubCenter.classList.add('records-page');clubCenter.querySelector('#records-back').onclick=()=>{clubCenter.classList.remove('records-page');renderCenter();window.scrollTo(0,0)};window.scrollTo(0,0)}
const v42RenderCenterV43=renderCenter;
renderCenter=function(){clubCenter.classList.remove('records-page');const result=v42RenderCenterV43();if(!activeSave||!clubCenter.querySelector('.intro')||activeSave.cup?.pending)return result;clubCenter.querySelector('.intro').insertAdjacentHTML('afterend','<div class="records-entry"><button type="button" class="menu-action" id="open-records">🏅 Awards & Vereinsrekorde ansehen <span>↗</span></button></div>');clubCenter.querySelector('#open-records').onclick=v43ShowRecords;clubCenter.querySelector('.honour-history')?.remove();return result};
