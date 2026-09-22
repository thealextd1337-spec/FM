'use strict';

const v49Style=document.createElement('style');
v49Style.textContent=`.v49-match-preview{margin:4px 0 17px;padding:13px;border:1px solid #405955;border-radius:9px;background:#102126}.v49-match-preview>p{margin:0 0 10px;color:#a9beb6;font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase}.v49-fixture{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:11px;align-items:start}.v49-club{min-width:0}.v49-club>strong{display:block;min-height:35px;color:#edf5ef;font-size:15px;line-height:1.25;overflow-wrap:anywhere}.v49-club>strong small{color:#a9beb6;font-size:12px;white-space:nowrap}.v49-fixture>span{padding-top:2px;color:#92aaa4;font-size:11px}.v49-form{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.v49-form b{display:grid;place-items:center;width:27px;height:27px;border-radius:5px;font-size:12px}.v49-form .win{background:#276344;color:#dcffe0}.v49-form .loss{background:#70343c;color:#ffe2e2}.v49-form .draw{background:#4a5759;color:#eef1f1}.v49-form .empty{border:1px dashed #4a6060;color:#839795}.center-lead>.squad-warnings{margin:0 0 17px;padding:0;border:0;background:transparent}.center-lead>.squad-warnings ul{margin-bottom:0}@media(max-width:420px){.v49-fixture{gap:5px}.v49-club>strong{font-size:13px}.v49-form{gap:3px}.v49-form b{width:22px;height:23px;font-size:11px}}`;
document.head.append(v49Style);

function v49RecentForm(teamId){
 const games=[];
 const league=[...(activeSave.seasonArchive||[]).map(season=>({number:season.number,schedule:season.schedule})),{number:activeSave.seasonNumber,schedule:activeSave.schedule}];
 for(const season of league)for(const [round,fixtures] of (season.schedule||[]).entries())for(const game of fixtures){if(!game.result||(game.home!==teamId&&game.away!==teamId))continue;const own=game.home===teamId?game.result[0]:game.result[1],other=game.home===teamId?game.result[1]:game.result[0];games.push({order:season.number*100+round+1,result:own>other?'S':own<other?'N':'U'})}
 const cups=[...(activeSave.cupArchive||[]).filter(cup=>cup.season!==activeSave.seasonNumber),activeSave.cup].filter(Boolean);
 for(const cup of cups)for(const [stage,round] of (cup.rounds||[]).entries())for(const game of round){if(!game.result||(game.home!==teamId&&game.away!==teamId))continue;const own=game.result[game.home===teamId?0:1],other=game.result[game.home===teamId?1:0],result=game.winner?(game.winner===teamId?'S':'N'):own>other?'S':own<other?'N':'U';games.push({order:cup.season*100+v41Dates[stage]+.5,result})}
 return games.sort((a,b)=>a.order-b.order).slice(-5).map(game=>game.result);
}
function v49FormHTML(teamId){const form=v49RecentForm(teamId),recent=[...Array(5-form.length).fill('–'),...form],names={S:'Sieg',N:'Niederlage',U:'Unentschieden','–':'Noch kein Spiel'};return`<div class="v49-form" aria-label="Form der letzten fünf Spiele: ${escapeHTML(form.map(result=>names[result]).join(', ')||'Noch keine Spiele')}">${recent.map(result=>`<b class="${{S:'win',N:'loss',U:'draw','–':'empty'}[result]}" title="${names[result]}">${result}</b>`).join('')}</div>`}
function v49PreviewHTML(){
 if(!activeSave||activeSave.currentRound>=10)return'';
 const fixture=userFixture();if(!fixture)return'';
 const cup=Boolean(v41CupGameForUser()),ranks=standings(),club=id=>`${escapeHTML(teamName(id))}${cup?'':` <small>(${ranks.findIndex(team=>team.id===id)+1}.)</small>`}`;
 return`<div class="v49-match-preview"><p>Letzte 5 Spiele · links älter, rechts neuer</p><div class="v49-fixture"><div class="v49-club"><strong>${club(fixture.home)}</strong>${v49FormHTML(fixture.home)}</div><span>gegen</span><div class="v49-club"><strong>${club(fixture.away)}</strong>${v49FormHTML(fixture.away)}</div></div></div>`;
}
function v49NextMatchPreview(){
 const lead=clubCenter.querySelector('.center-lead'),html=v49PreviewHTML();if(!lead||!html)return;
 lead.querySelector('.v49-match-preview')?.remove();
 lead.querySelector('#to-lineup')?.insertAdjacentHTML('beforebegin',html);
 const check=clubCenter.querySelector('.squad-warnings');
 if(check)lead.querySelector('.v49-match-preview')?.insertAdjacentElement('afterend',check);
}
const v49BaseRenderCenter=renderCenter;
renderCenter=function(){const result=v49BaseRenderCenter();v49NextMatchPreview();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 49');return result};
const v49BaseShowTactics=showTactics;
showTactics=function(){const result=v49BaseShowTactics();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 49');return result};
startScreen.querySelector('footer').textContent='Doppel 6 / PROTOTYP 49';
