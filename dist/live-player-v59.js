'use strict';

const v59Style=document.createElement('style');
v59Style.textContent=`#canvas{cursor:pointer}.v59-player-scout{margin-top:17px}.v59-player-scout h3{margin:0 0 9px;font-size:13px}.v59-scout-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v59-scout-grid span{min-width:0;padding:7px 9px;color:#b8cbc1;font-size:10px}.v59-scout-grid b{font-size:11px;overflow-wrap:anywhere}.v59-player-detail{margin:15px 0 0;color:#bfd1c8;font-size:12px}.v59-player-actions{position:sticky;bottom:-20px;display:flex;justify-content:flex-end;margin-top:18px;padding:10px 0 0;background:#16292d}.v59-player-actions button{min-height:44px;padding:9px 15px;border:0;border-radius:7px;background:#c7f36b;color:#142629;font:inherit;font-weight:800;cursor:pointer}.v59-player-actions button:focus-visible{outline:2px solid #fff;outline-offset:2px}`;
document.head.append(v59Style);

function v59LivePlayerHTML(player){
 const stats=player.stats,teamName=player.t===0?(activeSave?.club||'FC Viertel'):(match.opponentName||match.cupOpponentName||activeOpponent()?.name||'Gegner');
 const role=player.keeper?'TOR':({def:'VER',mid:'MIT',att:'ANG'}[player.assignedLine||player.line]||'SPI');
 const fresh=typeof v51LiveFreshness==='function'?v51LiveFreshness(player):player.fresh??100;
 const form=typeof v51EffectiveForm==='function'?v51EffectiveForm(player,fresh):player.form||0;
 const rows=[['Alter',`${player.age} Jahre`],['Einsatzposition',role],['Form',formText(form)],['Müdigkeit',freshText(fresh)],['Tore',stats.goals||0],['Vorlagen',stats.assists||0],['Pässe',`${stats.passComplete||0} / ${stats.passes||0}`]];
 if(player.keeper)rows.push(['Paraden',stats.saves||0],['Schüsse aufs Tor',stats.faced||0],['Gegentore',stats.conceded||0]);
 else rows.push(['Schüsse',stats.shots||0],['Zweikämpfe',`${stats.duelsWon||0} / ${stats.duels||0}`],['Ballabfänge',stats.interceptions||0]);
 const scouting=player.t===0?`<section class="v59-player-scout"><h3>Bekannte Fähigkeiten</h3>${scoutingSkillsHTML(player)}</section>`:'';
 return `<div class="v47-player-dialog-head"><div><h2 id="v47-player-title">${flagSVG(player.nation||'AT')} #${player.n} ${escapeHTML(player.name)}</h2><p>${escapeHTML(teamName)} · Live im Spiel</p></div><button type="button" class="v47-player-close" aria-label="Spielerinformationen schließen">×</button></div>${scouting}<div class="v47-player-stats">${rows.map(([label,value])=>{const color=label==='Form'&&typeof v51FormColor==='function'?v51FormColor(form):label==='Müdigkeit'&&typeof v51FreshnessColor==='function'?v51FreshnessColor(fresh):null;return`<span>${label}</span><b${color?` style="color:${color}"`:''}>${escapeHTML(String(value))}</b>`}).join('')}</div><p class="v59-player-detail">Das Spiel pausiert, solange diese Ansicht geöffnet ist.</p><div class="v59-player-actions"><button type="button" class="v59-player-resume">Spiel fortsetzen</button></div>`;
}
function v59OpenLivePlayer(player){
 if(!running||!match?.people?.includes(player)||match.finished)return false;
 v47PlayerDialog.innerHTML=v59LivePlayerHTML(player);
 v47PlayerDialog.querySelector('.v47-player-close').onclick=()=>v47PlayerDialog.close();
 v47PlayerDialog.querySelector('.v59-player-resume').onclick=()=>v47PlayerDialog.close();
 if(v47PlayerDialog.open)v47PlayerDialog.close();
 v47PlayerDialog.showModal();
 return true;
}

const v59BaseStep=step;
step=function(delta,realDelta){
 if(running&&v47PlayerDialog.open)return;
 return v59BaseStep(delta,realDelta);
};

$('#match-area').addEventListener('click',event=>{
 const card=event.target.closest?.('[data-v51-number]');
 if(!card||!event.currentTarget.contains(card))return;
 const player=match?.people?.find(person=>person.t===0&&person.n===Number(card.dataset.v51Number));
 if(player)v59OpenLivePlayer(player);
});

const v59Canvas=$('#canvas');
v59Canvas.addEventListener('click',event=>{
 if(!running||!match?.people?.length)return;
 const rect=v59Canvas.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 const x=(event.clientX-rect.left)*v59Canvas.width/rect.width,y=(event.clientY-rect.top)*v59Canvas.height/rect.height;
 const points=typeof v44VisualPositions==='function'?v44VisualPositions(match.people):match.people.map(person=>({x:person.x*600,y:person.y*740}));
 let closest=null,distance=25;
 for(let i=0;i<points.length;i++){
  const dx=(points[i].x-x)*rect.width/v59Canvas.width,dy=(points[i].y-y)*rect.height/v59Canvas.height;
  const current=Math.hypot(dx,dy);
  if(current<distance){closest=match.people[i];distance=current}
 }
 if(closest)v59OpenLivePlayer(closest);
});
