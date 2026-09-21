'use strict';

const v25Style=document.createElement('style');
v25Style.textContent=`
#player-panel{display:none!important}.bench-strip{display:grid!important;grid-template-columns:1fr;gap:6px;overflow:visible!important}.bench-chip{width:100%;min-width:0!important;grid-template-columns:8px minmax(0,1fr) auto;padding:10px 11px}.bench-select{display:grid;grid-template-columns:minmax(120px,1fr) auto;align-items:center;gap:10px}.bench-select b{font-size:11px}.bench-select small{margin:0!important;text-align:right;font-size:9px}.pitch-role-bar{margin:10px 0 2px;padding:10px;background:#102126;border:1px solid #384d50;border-radius:8px}.pitch-role-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.pitch-role-head b{font-size:11px}.pitch-role-head .player-link{font-size:9px}.pitch-role-bar .segmented{margin:0}.pitch-role-bar .role-warning{margin:7px 0 0;color:#e4be78;font-size:9px;text-align:center}.keeper{width:min(170px,70%)}.keeper .player-link{max-width:100%;padding:0;border:0;color:#fff;font-size:10px;font-weight:700;letter-spacing:.5px;text-align:center;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.keeper .player-link:hover,.keeper .player-link:focus{color:var(--club-primary);text-decoration:none}.keeper small{display:block}.retro-clock{width:max-content;min-width:126px;margin:13px auto 5px;padding:7px 13px 5px;border:2px solid #3d4641;border-radius:5px;background:#090c0b;color:#f4ad45;font:700 31px/1 Consolas,'Courier New',monospace;letter-spacing:4px;font-variant-numeric:tabular-nums;text-align:center;text-shadow:0 0 4px #f08a28,0 0 11px #c85b18;box-shadow:inset 0 0 14px #000,0 2px 5px #0007}.retro-clock .clock-colon{display:inline-block;margin:0 1px;animation:v25Blink 1s steps(1,end) infinite}@keyframes v25Blink{50%{opacity:.35}}.scoreboard{display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:8px;align-items:start!important;padding:8px 10px 12px!important}.scoreboard>strong{min-width:82px;text-align:center}.score-team{min-width:0;text-align:center}.score-team>b,.score-team>small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.score-team>b{font-size:13px}.score-team>small{margin-top:4px;color:#a9c1b8;font-size:10px}.goal-list{min-height:15px;margin-top:5px;color:#dce8e2;font-size:9px;line-height:1.45}.goal-line{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.match-meta #clock,.match-meta #match-plan{display:none}.match-meta{padding:0 0 12px!important}.match-meta span:last-child{color:#839b93}.compact-bench-head span{max-width:58%;text-align:right}.scoreboard+.match-meta{margin-top:0}
@media(max-width:760px){.bench-select{grid-template-columns:minmax(0,1fr) auto}.retro-clock{min-width:142px;font-size:35px;margin-top:10px}.scoreboard{grid-template-columns:minmax(0,1fr) 72px minmax(0,1fr);gap:4px}.scoreboard>strong{min-width:0;font-size:32px}.score-team>b{font-size:11px}.score-team>small{font-size:9px}.goal-list{font-size:8px}.compact-bench-head{align-items:flex-start}.compact-bench-head span{font-size:8px}}
@media(prefers-reduced-motion:reduce){.retro-clock .clock-colon{animation:none}}
`;
document.head.append(v25Style);
v25Style.textContent+=`.bench-chip{grid-template-columns:8px minmax(0,1fr) auto;gap:10px;padding:12px}.bench-select{display:block;min-height:46px;width:100%;text-align:left}.bench-title{display:flex;align-items:center;gap:8px}.bench-title .flag-icon{width:27px;height:18px;flex:none}.bench-select b{font-size:13px;line-height:1.3}.bench-meta{display:block;margin-top:5px;color:#c4d3cc;font-size:12px;line-height:1.35;white-space:normal}.bench-meta strong{color:#f0f6f1}.bench-chip .player-link{min-height:44px;padding:8px 12px;border:1px solid #56716d;border-radius:6px;background:#20383a;color:#f0f6f1;font-size:12px;font-weight:700}@media(max-width:420px){.bench-chip{gap:7px;padding:10px 8px}.bench-chip .player-link{padding:8px}}`;

const v25PositionShort={gk:'TOR',def:'VER',mid:'MIT',att:'ANG'};
v24BenchHTML=function(player){return`<article class="bench-chip" draggable="true" data-drag-player="${player.n}" data-drag-kind="bench" data-bank-player="${player.n}"><i class="fitness-dot ${v24FitnessClass(player.fresh)}"></i><button class="bench-select" data-bench-select="${player.n}" aria-label="${escapeHTML(player.name)} einwechseln"><span class="bench-title">${flagSVG(player.nation)}<b>#${player.n} ${escapeHTML(player.name)}</b></span><span class="bench-meta"><strong>${escapeHTML(transferPosition(player))}</strong> · Müdigkeit: ${v24FatigueText(player.fresh)}</span></button><button class="player-link" data-open-player="${escapeHTML(player.pid)}" aria-label="Details zu ${escapeHTML(player.name)} öffnen">Details</button></article>`};

function v25RoleBar(){
 const bench=$('#compact-bench'),player=players[selected];if(!bench||!player)return;bench.querySelector('#pitch-role-bar')?.remove();
 const bar=document.createElement('section');bar.id='pitch-role-bar';bar.className='pitch-role-bar';const warning=v24PositionWarning(player);bar.innerHTML=`<div class="pitch-role-head"><b>#${player.n} ${escapeHTML(player.name)} · ${v25PositionShort[player.line]}</b><button class="player-link" data-open-player="${escapeHTML(player.pid)}">Profil</button></div><div class="segmented"><button data-pitch-role="-1" ${player.role===-1?'class="active"':''}>Defensiv</button><button data-pitch-role="0" ${player.role===0?'class="active"':''}>Ausgewogen</button><button data-pitch-role="1" ${player.role===1?'class="active"':''}>Offensiv</button></div>${warning?`<p class="role-warning">${escapeHTML(warning)}</p>`:''}`;bench.querySelector('.compact-actions')?.insertAdjacentElement('beforebegin',bar);
 bar.querySelectorAll('[data-pitch-role]').forEach(button=>button.onclick=()=>{v24Remember();players[selected].role=+button.dataset.pitchRole;saveCurrent();render()});bindPlayerCardLinks(bar);
}
function v25Keeper(){const keeper=$('#setup-pitch .keeper');if(!keeper||!activeSave?.keeper)return;keeper.innerHTML=`<b>1</b><button class="player-link" data-open-player="${escapeHTML(activeSave.keeper.pid)}">${flagSVG(activeSave.keeper.nation)}${escapeHTML(activeSave.keeper.name.toUpperCase())}</button><small>TOR · ${escapeHTML(freshText(activeSave.keeper.fresh))}</small>`;bindPlayerCardLinks(keeper)}
function v25Prematch(){if(!activeSave||running)return;v25Keeper();v25RoleBar();const help=$('#pitch-help');if(help)help.innerHTML='<span>● Spieler antippen</span><span>↕ Spieler ziehen</span>'}

const v24RenderV25=render;
render=function(){v24RenderV25();v25Prematch()};
const v24ShowTacticsV25=showTactics;
showTactics=function(){v24ShowTacticsV25();v25Prematch();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39')};
document.querySelector('#prematch-tabs')?.addEventListener('click',()=>requestAnimationFrame(v25Prematch));

function v25Formation(team){
 if(team===0)return formation==='custom'?'Individuell':formations[formation]?.short||'Individuell';
 if(!match)return'2-2-1';const people=match.people.filter(player=>player.t===team&&!player.keeper),counts=['def','mid','att'].map(line=>people.filter(player=>player.line===line).length);return counts.join('-');
}
function v25Surname(name){const parts=String(name).trim().split(/\s+/);return parts[parts.length-1]||name}
function v25Scorers(team){
 const goals=(match?.goals||[]).filter(goal=>goal.team===team),groups=[];for(const goal of goals){let group=groups.find(item=>item.name===goal.name);if(!group){group={name:goal.name,minutes:[]};groups.push(group)}group.minutes.push(goal.minute)}
 const surnames=groups.map(group=>v25Surname(group.name));return groups.map(group=>{const surname=v25Surname(group.name),duplicate=surnames.filter(value=>value===surname).length>1,first=group.name.trim().charAt(0);return`<div class="goal-line">${escapeHTML(duplicate?`${first}. ${surname}`:surname)} ${group.minutes.map(minute=>`${minute}′`).join(', ')}</div>`}).join('');
}
function v25EnsureScoreboard(){
 const area=$('#match-area'),scoreboard=area?.querySelector('.scoreboard');if(!area||!scoreboard)return null;let clock=$('#retro-clock');if(!clock){clock=document.createElement('div');clock.id='retro-clock';clock.className='retro-clock';clock.setAttribute('aria-label','Spielzeit');scoreboard.before(clock)}
 if(!scoreboard.querySelector('.score-team'))scoreboard.innerHTML='<span class="score-team home-team"></span><strong id="score">0 : 0</strong><span class="score-team away-team"></span>';return{clock,scoreboard};
}
function v25ClockParts(){const total=Math.min(90*60,Math.floor(((match?.elapsed||0)/75)*90*60)),minutes=Math.floor(total/60),seconds=total%60;return[String(minutes).padStart(2,'0'),String(seconds).padStart(2,'0')]}
function v25UpdateLiveBoard(){
 if(!match)return;const ui=v25EnsureScoreboard();if(!ui)return;const[minutes,seconds]=v25ClockParts();ui.clock.innerHTML=`<span>${minutes}</span><span class="clock-colon">:</span><span>${seconds}</span>`;ui.clock.setAttribute('aria-label',`${minutes} Minuten ${seconds} Sekunden`);$('#score').textContent=match.score.join(' : ');
 const home=ui.scoreboard.querySelector('.home-team'),away=ui.scoreboard.querySelector('.away-team'),homeName=activeSave?.club||'FC Viertel',awayName=match.opponentName||match.cupOpponentName||(activeSave?activeOpponent().name:'SC Hafen');home.innerHTML=`<b>${escapeHTML(homeName)}</b><small>${escapeHTML(v25Formation(0))}</small><div class="goal-list">${v25Scorers(0)}</div>`;away.innerHTML=`<b>${escapeHTML(awayName)}</b><small>${escapeHTML(v25Formation(1))}</small><div class="goal-list">${v25Scorers(1)}</div>`;
}
const v24UpdateTeamStatsV25=updateTeamStats;
updateTeamStats=function(){v24UpdateTeamStatsV25();v25UpdateLiveBoard()};
const v24StartV25=start;
start=function(){const result=v24StartV25();if(running)v25UpdateLiveBoard();return result};$('#start').onclick=()=>start();

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
