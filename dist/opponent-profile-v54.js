'use strict';

const v54Style=document.createElement('style');
v54Style.textContent=`
.center-grid .table-row.v54-team-open{min-height:44px;cursor:pointer}.center-grid .table-row.v54-team-open:hover{background:#294448}.center-grid .table-row.v54-team-open:focus-visible{outline:2px solid var(--club-primary);outline-offset:-2px}
#v54-team-dialog{width:min(680px,calc(100vw - 24px));max-height:88vh;padding:0;border:1px solid #688279;border-radius:13px;background:#16292d;color:#edf5ef;box-shadow:0 24px 70px #000b}#v54-team-dialog::backdrop{background:#071416c9}.v54-body{max-height:88vh;overflow:auto;padding:20px}.v54-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.v54-head>div{display:flex;align-items:center;gap:10px;min-width:0}.v54-head .flag-icon{width:30px;height:20px}.v54-head h2{font-size:22px;line-height:1.2}.v54-close{width:44px;height:44px;flex:none;border:1px solid #536b65;border-radius:7px;background:#254047;color:#fff;font-size:22px}.v54-facts{margin:13px 0 5px;color:#c8d9d0;font-size:13px;line-height:1.5}.v54-strength{margin:0 0 20px;color:#aac5ba;font-size:13px;line-height:1.5}.v54-section{margin-top:18px}.v54-section h3{margin:0 0 9px;font-size:15px}.v54-formation,.v54-roster{border-top:1px solid #3b5553}.v54-line,.v54-roster-row{display:grid;grid-template-columns:82px minmax(0,1fr);gap:10px;align-items:start;padding:9px 0;border-bottom:1px solid #304947;font-size:12px}.v54-line>span,.v54-roster-row>small{color:#a7bdb4}.v54-line>div{display:flex;flex-wrap:wrap;gap:6px 15px}.v54-line b{font-size:12px}.v54-roster-row{grid-template-columns:minmax(0,1fr) auto;align-items:center}.v54-roster-row>span{display:flex;align-items:center;gap:8px;min-width:0}.v54-roster-row b{overflow-wrap:anywhere}.v54-roster-row .flag-icon{width:22px;height:15px}.v54-roster-row>small{text-align:right;white-space:nowrap}.v54-empty{margin:0;color:#a7bdb4;font-size:12px;line-height:1.5}
@media(max-width:480px){.v54-body{padding:15px}.v54-head h2{font-size:19px}.v54-line{grid-template-columns:68px minmax(0,1fr)}.v54-roster-row{align-items:start}.v54-roster-row>small{white-space:normal}}
`;
document.head.append(v54Style);

const v54Dialog=document.createElement('dialog');
v54Dialog.id='v54-team-dialog';
v54Dialog.setAttribute('aria-labelledby','v54-team-name');
document.body.append(v54Dialog);

function v54StrengthSentence(team){
 const own=activeSave.table.find(item=>item.id==='user')?.strength??72,difference=team.strength-own,name=team.name;
 if(difference>=8)return`${name} ist uns klar überlegen – hier wird jeder Punkt hart erkämpft.`;
 if(difference>=3)return`${name} ist uns leicht überlegen; ein enges Spiel steht bevor.`;
 if(difference>-3)return`${name} ist ein Gegner auf Augenhöhe.`;
 if(difference>=-8)return`${name} ist uns leicht unterlegen; wir gehen als Favorit ins Spiel.`;
 return`${name} ist uns deutlich unterlegen; wir sind klarer Favorit.`;
}
function v54StrengthSentenceHTML(team){
 const sentence=escapeHTML(v54StrengthSentence(team));
 if(typeof v55SkillColor!=='function')return sentence;
 const phrase=/klar überlegen|leicht überlegen|Gegner auf Augenhöhe|leicht unterlegen|deutlich unterlegen/;
 return sentence.replace(phrase,text=>`<strong style="color:${v55SkillColor(Math.round(team.strength/5))}">${text}</strong>`);
}
function v54TeamHTML(team){
 const standing=activeSave.table.find(item=>item.id===team.id),rank=standings().findIndex(item=>item.id===team.id)+1;
 const hasPlayed=v49RecentForm(team.id).length>0,lineup=hasPlayed?(team.lastLineup?.map(number=>team.roster.find(player=>player.n===number)).filter(Boolean)||aiLineup(team)):[],starters=new Set(lineup.map(player=>player.n));
 const groups=[['Angriff','att'],['Mittelfeld','mid'],['Abwehr','def'],['Torwart','gk']];
 const lineupHTML=lineup.length?`<div class="v54-formation">${groups.map(([label,line])=>`<div class="v54-line"><span>${label}</span><div>${lineup.filter(player=>player.line===line).map(player=>`<b>#${player.n} ${escapeHTML(player.name)}</b>`).join('')}</div></div>`).join('')}</div>`:'<p class="v54-empty">Dieser Verein hat noch kein Spiel bestritten.</p>';
 const roster=[...(team.roster||[])].sort((a,b)=>(a.keeper?-1:b.keeper?1:0)||({def:0,mid:1,att:2}[a.line]??3)-({def:0,mid:1,att:2}[b.line]??3)||a.n-b.n);
 return`<div class="v54-body"><div class="v54-head"><div>${flagSVG('AT')}<h2 id="v54-team-name">${escapeHTML(team.name)}</h2></div><button type="button" class="v54-close" aria-label="Vereinsinfo schließen">×</button></div><p class="v54-facts">Saison ${activeSave.seasonNumber} · Platz ${rank} · ${standing?.played??0} Spiele · ${standing?.pts??0} Punkte · Tore ${standing?.gf??0}:${standing?.ga??0}</p><p class="v54-strength">${v54StrengthSentenceHTML(team)}</p><section class="v54-section"><h3>Kader · ${roster.length} Spieler</h3><div class="v54-roster">${roster.map(player=>`<div class="v54-roster-row"><span>${flagSVG(player.nation)}<b>#${player.n} ${escapeHTML(player.name)}</b></span><small>${player.keeper?'Torwart':lineNames[player.line]||player.line} · ${player.age} J.${hasPlayed?` · ${starters.has(player.n)?'Startelf':'Bank'}`:''}</small></div>`).join('')}</div></section><section class="v54-section"><h3>Letzte genutzte Aufstellung · 2–2–1</h3>${lineupHTML}</section></div>`;
}
function v54OpenTeam(teamId){
 const team=worldTeam(teamId);if(!team)return;
 v54Dialog.innerHTML=v54TeamHTML(team);
 v54Dialog.querySelector('.v54-close').onclick=()=>v54Dialog.close();
 if(v54Dialog.open)v54Dialog.close();
 v54Dialog.showModal();
}
function v54DecorateCenter(){
 if(!activeSave)return;
 const opponent=activeSave.currentRound<10&&!v41CupGameForUser()?activeOpponent():null;
 const summary=clubCenter.querySelector('.center-lead > .help');
 if(opponent&&summary)summary.innerHTML=v54StrengthSentenceHTML(opponent);
 const teams=standings();
 clubCenter.querySelectorAll('.center-grid .league-table').forEach(table=>{
  table.querySelectorAll('.table-row:not(.table-head)').forEach((row,index)=>{
   const team=teams[index];if(!team||team.id==='user')return;
   row.classList.add('v54-team-open');row.tabIndex=0;
   row.setAttribute('role','button');row.setAttribute('aria-haspopup','dialog');row.setAttribute('aria-controls','v54-team-dialog');
   row.setAttribute('aria-label',`Vereinsinfo und Kader von ${team.name} öffnen`);
   row.onclick=()=>v54OpenTeam(team.id);
   row.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();v54OpenTeam(team.id)}};
  });
 });
}
const v54BaseRenderCenter=renderCenter;
renderCenter=function(){const result=v54BaseRenderCenter();v54DecorateCenter();return result};
