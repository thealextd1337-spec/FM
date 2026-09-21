'use strict';

const v47Style=document.createElement('style');
v47Style.textContent=`#v47-match-report{width:min(900px,calc(100vw - 24px));max-height:88vh;padding:0;border:1px solid #688279;border-radius:13px;background:#16292d;color:#edf5ef;box-shadow:0 24px 70px #000b}#v47-match-report::backdrop{background:#071416c9}#v47-match-report .v47-body{max-height:88vh;overflow:auto;padding:22px}.v47-head{display:flex;justify-content:space-between;align-items:start;gap:12px}.v47-head h2{font-size:24px}.v47-head p{margin:4px 0 0;color:#a9bcb5;font-size:11px}.v47-close{min-width:44px;min-height:44px;border:1px solid #536b65;border-radius:7px;background:#254047;color:#fff;font-size:20px}.v47-score{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:12px;margin:17px 0;padding:17px;background:#102126;border-radius:9px;text-align:center}.v47-score span{font-size:14px;font-weight:800;overflow-wrap:anywhere}.v47-score strong{font-size:31px;font-variant-numeric:tabular-nums}.v47-stat-head,.v47-stat-row{display:grid;grid-template-columns:minmax(0,1fr) 72px 72px;gap:8px;align-items:center;padding:7px 9px;border-bottom:1px solid #334a49;font-size:12px}.v47-stat-head{color:#bad8bd;font-weight:800}.v47-stat-row b,.v47-stat-head b{text-align:center;font-variant-numeric:tabular-nums}.v47-stat-row>span{color:#afc2bc}.v47-rosters{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:19px 0}.v47-roster{min-width:0;padding:13px;background:#102126;border-radius:9px}.v47-roster h3{margin:0 0 9px;font-size:14px}.v47-player-head,.v47-player{display:grid;grid-template-columns:minmax(0,1fr) 44px 34px 34px;gap:5px;align-items:center;padding:8px 3px;border-bottom:1px solid #304543;font-size:11px}.v47-player-head{color:#a8bcb6;font-size:9px;font-weight:800}.v47-player>span:first-child{display:flex;align-items:center;gap:5px;min-width:0}.v47-player .flag-icon{width:22px;flex:none}.v47-player em{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:normal}.v47-player b,.v47-player-head>span:not(:first-child){text-align:center;font-variant-numeric:tabular-nums}.v47-player b{color:#d8efb4}.v47-actions{display:flex;justify-content:flex-end}.v47-actions button{min-height:44px}@media(max-width:650px){#v47-match-report .v47-body{padding:15px}.v47-head h2{font-size:20px}.v47-score{gap:5px;padding:12px 6px}.v47-score span{font-size:11px}.v47-score strong{font-size:25px}.v47-rosters{grid-template-columns:1fr}.v47-stat-head,.v47-stat-row{grid-template-columns:minmax(0,1fr) 58px 58px}.v47-player-head,.v47-player{grid-template-columns:minmax(0,1fr) 40px 30px 30px}}`;
document.head.append(v47Style);

const v47Dialog=document.createElement('dialog');
v47Dialog.id='v47-match-report';
v47Dialog.setAttribute('aria-labelledby','v47-report-title');
document.body.append(v47Dialog);

function v47Snapshot(opponentName){
 if(!match)return null;
 const ownName=activeSave?.club||'FC Viertel';
 return{ownName,opponentName:opponentName||match.cupOpponentName||activeOpponent()?.name||'Gegner',score:[...match.score],shots:[...match.shots],possession:[...match.possession],players:match.people.map(player=>({name:player.name,n:player.n,nation:player.nation||'AT',keeper:Boolean(player.keeper),team:player.t,stats:{...player.stats}}))};
}
function v47TeamTotal(report,team,key){return report.players.filter(player=>player.team===team).reduce((sum,player)=>sum+(player.stats[key]||0),0)}
function v47Percent(ok,total){return total?`${Math.round(ok/total*100)} %`:'–'}
function v47PlayerRows(report,team){return report.players.filter(player=>player.team===team).map(player=>{const stats=player.stats;return`<div class="v47-player"><span>${flagSVG(player.nation)}<em title="${escapeHTML(player.name)}">#${player.n} ${escapeHTML(player.name)}</em></span><b>${Number(stats.rating||0).toFixed(1).replace('.',',')}</b><b>${stats.goals||0}</b><b>${stats.assists||0}</b></div>`}).join('')}
function v47ReportHTML(report,shootout){
 const [homeTime,awayTime]=report.possession,share=Math.round(homeTime/(homeTime+awayTime||1)*100),homeCode=teamShortCode(report.ownName),awayCode=teamShortCode(report.opponentName);
 const rows=[['Schüsse',report.shots[0],report.shots[1]],['Aufs Tor',v47TeamTotal(report,0,'onTarget'),v47TeamTotal(report,1,'onTarget')],['Ballbesitz',`${share} %`,`${100-share} %`],['Passquote',v47Percent(v47TeamTotal(report,0,'passComplete'),v47TeamTotal(report,0,'passes')),v47Percent(v47TeamTotal(report,1,'passComplete'),v47TeamTotal(report,1,'passes'))],['Gewonnene Zweikämpfe',v47TeamTotal(report,0,'duelsWon'),v47TeamTotal(report,1,'duelsWon')]];
 return`<div class="v47-body"><div class="v47-head"><div><h2 id="v47-report-title">Spielbericht</h2><p>Spielende · Noten von 1 bis 10 · T = Tore · V = Vorlagen</p></div><button type="button" class="v47-close" aria-label="Spielbericht schließen">×</button></div><div class="v47-score"><span>${escapeHTML(report.ownName)}</span><strong>${report.score.join(' : ')}</strong><span>${escapeHTML(report.opponentName)}</span></div>${shootout?`<p class="help">Elfmeterschießen: ${shootout.score.join(' : ')} · ${escapeHTML(shootout.winner===0?report.ownName:report.opponentName)} gewinnt</p>`:''}<div class="v47-stat-head"><span>Teamstatistik</span><b title="${escapeHTML(report.ownName)}">${escapeHTML(homeCode)}</b><b title="${escapeHTML(report.opponentName)}">${escapeHTML(awayCode)}</b></div>${rows.map(([label,home,away])=>`<div class="v47-stat-row"><span>${label}</span><b>${home}</b><b>${away}</b></div>`).join('')}<div class="v47-rosters">${[[0,report.ownName],[1,report.opponentName]].map(([team,name])=>`<section class="v47-roster"><h3>${escapeHTML(name)}</h3><div class="v47-player-head"><span>Spieler</span><span>Note</span><span>T</span><span>V</span></div>${v47PlayerRows(report,team)}</section>`).join('')}</div><div class="v47-actions"><button type="button" class="menu-action v47-done">Schließen</button></div></div>`;
}
function v47ShowReport(report,shootout){
 if(!report)return;
 v47Dialog.innerHTML=v47ReportHTML(report,shootout);
 v47Dialog.querySelectorAll('.v47-close,.v47-done').forEach(button=>button.onclick=()=>v47Dialog.close());
 if(v47Dialog.open)v47Dialog.close();
 if(v47Dialog.showModal)v47Dialog.showModal();else v47Dialog.setAttribute('open','');
}

const v47BasePending=v42CareerPending;
v42CareerPending=function(){const pending=v47BasePending();pending.report=v47Snapshot(pending.opponentName);return pending};

const v47BaseFinishMatch=finishMatch;
finishMatch=function(){const alreadyFinished=Boolean(match?.finished),opponentName=match?.cupOpponentName||(!alreadyFinished&&activeSave?activeOpponent().name:null),result=v47BaseFinishMatch();if(!alreadyFinished&&match?.finished&&!activeSave?.cup?.pending)v47ShowReport(v47Snapshot(opponentName));return result};

const v47BaseRenderScreen=v42RenderScreen;
v42RenderScreen=function(openDialog=false){const result=v47BaseRenderScreen(openDialog),session=v42Session;if(session?.mode==='career'&&session.phase==='done'){const exit=v42Screen.querySelector('#v42-exit'),original=exit?.onclick;if(exit&&original)exit.onclick=()=>{const report=session.report||v47Snapshot(session.opponentName);original();v47ShowReport(report,{score:session.score,winner:session.winner})}}return result};

function v47Version(){document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 47');const menuFooter=startScreen.querySelector('footer');if(menuFooter)menuFooter.textContent='Doppel 6 / PROTOTYP 47'}
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
