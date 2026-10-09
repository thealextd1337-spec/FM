'use strict';

function v84CompetitionLabel(competition){
 return competition?.type==='league'?'Liga'+(Number.isInteger(competition.division)&&competition.division>0?' '+competition.division:/^S\d+:(?:GER|ENG|ESP|ITA|FRA|POR):LEAGUE$/.test(competition.id||'')?' 1':''):competition?.type==='cup'?'Nationaler Pokal':'Europacup';
}
function v84SeasonGoals(player,career,fixture,physical){
 const completed=(player.history||[]).filter(entry=>entry.season===career.world.season&&entry.competitionId===fixture.competitionId&&entry.fixtureId!==fixture.id).reduce((total,entry)=>total+(entry.goals||0),0);
 return completed+(physical.goals||[]).filter(goal=>goal.pid===player.pid).length;
}
function v84BannerHTML(player,club,competition,count,score,ownGoal=false){
 const goals=ownGoal?`Eigentor - ${v84CompetitionLabel(competition)}`:`${count} ${count===1?'Tor':'Tore'} - ${v84CompetitionLabel(competition)}`;
 const number=Number.isInteger(player.n)&&player.n>0?`<b class="v84-shirt-number" aria-label="Rückennummer ${player.n}">#${player.n}</b> `: "";
 const scoreClass=score.some(value=>value>9)?' v84-score-long':'';
 return `<div class="v84-goal-decor" aria-hidden="true"><i class="v84-pattern v84-pattern-tl"></i><i class="v84-pattern v84-pattern-tr"></i><i class="v84-pattern v84-pattern-br"></i><i class="v84-accent v84-accent-left"></i><i class="v84-accent v84-accent-right"></i><i class="v84-corner v84-corner-tl"></i><i class="v84-corner v84-corner-tr"></i><i class="v84-corner v84-corner-bl"></i><i class="v84-corner v84-corner-br"></i></div><div class="v84-goal-details"><span class="v84-score${scoreClass}" aria-label="Spielstand ${score[0]} zu ${score[1]}">${score[0]}:${score[1]}</span><span class="v84-scorer">${number}${escapeHTML(player.name)}${ownGoal?' (Eigentor)':''}</span><span class="v84-goals">${escapeHTML(goals)}</span></div><div class="v84-goal-logo">${v61CrestSVG(club)}<span class="v119-goal-club">${escapeHTML(club?.name||'')}</span></div><div class="v84-goal-strips" aria-hidden="true"><i></i><b></b><i></i></div>`;
}

let v84PendingGoal=null;
function v84CancelGoalDelay(){v84PendingGoal=null;$('#match-overlay').classList.remove('v84-goal-wait')}
const v84BaseShowOverlay=showOverlay;
showOverlay=function(title,copy,...rest){
 v84CancelGoalDelay();
 const result=v84BaseShowOverlay(title,copy,...rest),overlay=$('#match-overlay');
 overlay.querySelectorAll('.v84-goal-decor,.v84-goal-details,.v84-goal-logo,.v84-goal-strips').forEach(node=>node.remove());
 overlay.classList.remove('v84-goal-banner','v84-no-sprite');
 overlay.removeAttribute('role');
 const context=v65WorldActive&&v65Context(),goal=rest[0]&&context&&match?.goalPause>0&&match.goals.at(-1);
 if(!goal?.pid&&!goal?.ownGoalPid){if(overlay.parentElement?.classList.contains('v42-pitch-stage'))$('#match-area').insertBefore(overlay,$('#event'));return result}
 const player=v66Player(context.career,goal.pid||goal.ownGoalPid),club=v65Club(context,goal.team);
 const competition=v62Current(context.career).find(item=>item.id===context.fixture.competitionId);
 if(!player||!club||!competition)return result;
 $('#match-area .v42-pitch-stage').append(overlay);
 const count=v84SeasonGoals(player,context.career,context.fixture,match);
 $('#overlay-title').innerHTML='<span class="v84-goal-word">TOOOOR!</span>';
 $('#overlay-copy').textContent=`${player.name}${goal.ownGoal?' (Eigentor)':''} · ${match.score[0]} : ${match.score[1]}`;
 overlay.insertAdjacentHTML('beforeend',v84BannerHTML(player,club,competition,count,match.score,goal.ownGoal));
 overlay.classList.add('v84-goal-banner');
 if(!overlay.querySelector('.v82-goal-sprite'))overlay.classList.add('v84-no-sprite');
 overlay.setAttribute('role','status');
 v84PendingGoal={match,goal,remaining:.5};overlay.classList.add('v84-goal-wait');
 return result;
};
const v84BaseHideOverlay=hideOverlay;
hideOverlay=function(...args){v84CancelGoalDelay();return v84BaseHideOverlay(...args)};
const v84BaseStep=step;
step=function(delta,realDelta){
 const pending=v84PendingGoal,playing=running&&!(typeof v47PlayerDialog!=='undefined'&&v47PlayerDialog.open);
 const result=v84BaseStep(delta,realDelta);
 if(pending&&pending===v84PendingGoal&&pending.match===match&&playing)pending.remaining-=Math.max(0,realDelta);
 return result;
};
const v84BaseDraw=draw;
draw=function(...args){
 const result=v84BaseDraw(...args),pending=v84PendingGoal;
 if(pending&&(pending.match!==match||pending.goal!==match?.goals.at(-1)||match?.goalPause<=0||$('#match-overlay').hidden||pending.remaining<=0))v84CancelGoalDelay();
 return result;
};

const v84Style=document.createElement('style');
v84Style.textContent=`
 .v65-world-match #match-area .v84-goal-banner.v84-goal-wait{visibility:hidden;pointer-events:none;animation:none!important}
 .v65-world-match #match-area .v84-goal-banner.v84-goal-wait *{animation:none!important}
 .v65-world-match #match-area .match-overlay.goal.v84-goal-banner{--v84-sprite-size:260px;top:50%;bottom:auto;left:50%;display:grid;grid-template-columns:var(--v84-sprite-size) minmax(0,1fr) 140px;grid-template-rows:190px 5px;gap:5px 8px;width:min(98%,720px);min-height:0;padding:18px 12px 7px;transform:translate(-50%,-50%);border:3px solid #ffe06e;border-radius:0;background:radial-gradient(ellipse at 50% 45%,#0c2c69 0,#071c43 62%,#04112c 100%);box-shadow:0 0 0 4px #051125,0 8px 0 #041329,0 18px 30px #000b;text-align:left;overflow:visible;animation:v84BannerIn .28s ease-out both}
 .v65-world-match #match-area .match-overlay.goal.v84-goal-banner.fade-out{animation:v84BannerOut .25s ease-in forwards}
 .v84-goal-banner #overlay-title{position:absolute;top:-19px;left:50%;z-index:4;width:210px;height:49px;margin:0;overflow:hidden;transform:translateX(-50%);border:3px solid #0b1535;border-radius:0;background:linear-gradient(#e93499df,#e93499df),repeating-conic-gradient(#f048a8 0 25%,#c8207e 0 50%) 0 0/8px 8px;color:#fffdf2!important;box-shadow:inset 0 0 0 3px #fd55b4,0 0 0 2px #ed379c,4px 5px 0 #050e25;font:900 36px/43px Impact,'Barlow Condensed',sans-serif!important;letter-spacing:1px;text-align:center;white-space:nowrap;text-shadow:3px 3px 0 #06132d}
 .v84-goal-banner #overlay-title .v84-goal-word{display:block;width:100%;margin:0;color:inherit;font:inherit;letter-spacing:inherit;animation:v84GoalRun .95s ease-in-out both,v84GoalBlink .42s step-end .95s infinite}
 .v84-goal-banner #overlay-copy{position:absolute!important;width:1px;height:1px;margin:0!important;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
 .v65-world-match #match-area .v84-goal-banner .v82-goal-sprite{grid-column:1;grid-row:1;z-index:2;align-self:end;width:var(--v84-sprite-size);height:var(--v84-sprite-size);margin:0!important;overflow:visible;background:transparent;border:0;box-shadow:none}
 .v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite{width:100%;height:100%;image-rendering:pixelated;transform:scale(1.22);transform-origin:0 100%}
 .v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v86-pose="arms_wide"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v86-pose="two_fingers_up"]{transform:scale(1.13,1.5)}
 @media(min-width:701px){.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="a"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="a2"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="e"]{transform:scale(1.03)}}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-details{grid-column:2;grid-row:1;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;gap:5px;text-align:center}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-details span{display:block;min-width:0;max-width:100%;margin:0;color:#f6f6e8;letter-spacing:0;overflow-wrap:anywhere}
 .v65-world-match #match-area .v84-goal-banner .v84-scorer{font:900 clamp(25px,3.4vw,35px)/1 'Arial Black',Impact,sans-serif;text-transform:uppercase;text-shadow:3px 3px 0 #06142e}
 .v84-shirt-number{color:#ffe16e;font-size:.65em;white-space:nowrap}
 .v65-world-match #match-area .v84-goal-banner .v84-score{color:#ffe16e!important;font:900 72px/1 'Arial Black',Impact,sans-serif;white-space:nowrap;font-variant-numeric:tabular-nums;letter-spacing:1px;text-shadow:3px 3px 0 #07132d,5px 5px 0 #c23981}
 .v65-world-match #match-area .v84-goal-banner .v84-score.v84-score-long{font-size:52px}
 .v65-world-match #match-area .v84-goal-banner .v84-goals{padding:0;color:#f8f9f0!important;font:900 19px/1.15 'Arial Black',Impact,sans-serif;text-transform:uppercase;white-space:nowrap;text-shadow:2px 2px 0 #06132d}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-logo{grid-column:3;grid-row:1;z-index:2;display:grid;place-items:center;align-self:center;width:140px;height:160px;min-width:0;background:none;border:0;box-shadow:none;filter:drop-shadow(4px 4px 0 #06132d)}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v61-crest{display:block;width:132px;height:156px;max-width:100%}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-strips{grid-column:1/-1;grid-row:2;z-index:3;position:relative;display:flex;justify-content:space-between;gap:10px;width:100%;height:5px;min-width:0}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-strips i{display:block;height:5px;background:#00e3d5;box-shadow:0 2px 0 #07152b}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-strips i:first-child{width:80%}.v65-world-match #match-area .v84-goal-banner .v84-goal-strips i:last-child{width:13%}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-strips b{position:absolute;left:51%;top:-4px;width:13px;height:13px;transform:translateX(-50%);border:3px solid #06132d;background:#f9fff4;box-shadow:0 0 0 2px #f9fff4}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-strips b:after{content:'';position:absolute;inset:2px;background:#06132d}
 .v65-world-match #match-area .match-overlay.goal.v84-goal-banner.v84-no-sprite{grid-template-columns:minmax(0,1fr) 140px;grid-template-rows:minmax(190px,auto) 5px;min-height:0}.v65-world-match #match-area .v84-goal-banner.v84-no-sprite .v84-goal-details{grid-column:1}.v65-world-match #match-area .v84-goal-banner.v84-no-sprite .v84-goal-logo{grid-column:2}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-decor{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}
 .v65-world-match #match-area .v84-goal-banner .v84-pattern{position:absolute;display:block;background:repeating-linear-gradient(135deg,#15519a 0 4px,#0c3474 4px 8px,transparent 8px 12px);opacity:.65}
 .v65-world-match #match-area .v84-goal-banner .v84-pattern-tl{top:9px;left:9px;width:150px;height:95px;clip-path:polygon(0 0,100% 0,0 100%)}
 .v65-world-match #match-area .v84-goal-banner .v84-pattern-tr{top:9px;right:9px;width:150px;height:95px;clip-path:polygon(0 0,100% 0,100% 100%)}
 .v65-world-match #match-area .v84-goal-banner .v84-pattern-br{right:9px;bottom:9px;width:105px;height:78px;clip-path:polygon(100% 0,100% 100%,0 100%)}
 .v65-world-match #match-area .v84-goal-banner .v84-accent{position:absolute;top:16px;width:72px;height:5px;background:#00e8d7;box-shadow:0 10px 0 #00e8d7}
 .v65-world-match #match-area .v84-goal-banner .v84-accent-left{left:calc(50% - 177px)}.v65-world-match #match-area .v84-goal-banner .v84-accent-right{right:calc(50% - 177px)}
 .v65-world-match #match-area .v84-goal-banner .v84-corner{position:absolute;z-index:5;display:block;width:7px;height:7px;background:#ffe06e}
 .v65-world-match #match-area .v84-goal-banner .v84-corner-tl{top:0;left:0;box-shadow:7px 0 #ffe06e,0 7px #ffe06e}.v65-world-match #match-area .v84-goal-banner .v84-corner-tr{top:0;right:0;box-shadow:-7px 0 #ffe06e,0 7px #ffe06e}.v65-world-match #match-area .v84-goal-banner .v84-corner-bl{bottom:0;left:0;box-shadow:7px 0 #ffe06e,0 -7px #ffe06e}.v65-world-match #match-area .v84-goal-banner .v84-corner-br{bottom:0;right:0;box-shadow:-7px 0 #ffe06e,0 -7px #ffe06e}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-decor{animation:v84DecorIn .25s ease-out both}
 .v65-world-match #match-area .v84-goal-banner .v82-goal-sprite{animation:v84PlayerIn .4s cubic-bezier(.18,.8,.25,1) .06s both}
 .v65-world-match #match-area .v84-goal-banner .v84-scorer{animation:v84InfoIn .28s ease-out .13s both}
 .v65-world-match #match-area .v84-goal-banner .v84-score{animation:v84ScoreIn .34s cubic-bezier(.2,1.35,.4,1) .18s both}
 .v65-world-match #match-area .v84-goal-banner .v84-goals{animation:v84InfoIn .28s ease-out .23s both}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-logo{animation:v84CrestIn .34s cubic-bezier(.2,1.25,.4,1) .21s both}
 .v65-world-match #match-area .v84-goal-banner .v84-goal-strips i{transform-origin:left center;animation:v84StripeIn .32s steps(6,end) .12s both,v84NeonPulse 1.2s step-end .62s infinite}
 .v65-world-match #match-area .v84-goal-banner .v84-accent,.v65-world-match #match-area .v84-goal-banner .v84-corner{animation:v84NeonPulse 1.2s step-end .62s infinite}
 @keyframes v84GoalRun{0%{transform:translateX(-105%)}72%{transform:translateX(88%)}100%{transform:translateX(0)}}@keyframes v84GoalBlink{50%{background:#fff078;color:#183b50!important}}@keyframes v84BannerIn{from{opacity:0;transform:translate(-50%,calc(-50% + 12px)) scale(.98)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}@keyframes v84BannerOut{to{opacity:0;transform:translate(-50%,calc(-50% + 9px))}}
 @keyframes v84DecorIn{from{opacity:0;transform:scaleX(.96)}to{opacity:1;transform:scaleX(1)}}@keyframes v84PlayerIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes v84InfoIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes v84ScoreIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}@keyframes v84CrestIn{from{opacity:0;transform:translateY(8px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes v84StripeIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes v84NeonPulse{50%{opacity:.48}}
 @media(max-width:700px){.v65-world-match #match-area .match-overlay.goal.v84-goal-banner{--v84-sprite-size:220px;grid-template-columns:var(--v84-sprite-size) minmax(0,1fr) 100px;grid-template-rows:175px 5px}.v65-world-match #match-area .v84-goal-banner .v84-goal-logo{width:100px;height:120px}.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v61-crest{width:94px;height:114px}.v65-world-match #match-area .v84-goal-banner .v84-score{font-size:48px}.v65-world-match #match-area .v84-goal-banner .v84-score.v84-score-long{font-size:40px}.v65-world-match #match-area .v84-goal-banner .v84-goals{font-size:14px}}
 @media(max-width:700px){.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite{transform:scale(1.05)}.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v86-pose="arms_wide"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v86-pose="two_fingers_up"]{transform:scale(1.05,1.35)}}
 @media(max-width:520px){.v65-world-match #match-area .match-overlay.goal.v84-goal-banner{--v84-sprite-size:clamp(116px,40vw,150px);grid-template-columns:var(--v84-sprite-size) minmax(0,1fr) 62px;grid-template-rows:152px 5px;gap:5px 6px;width:calc(100% - 8px);padding:17px 5px 5px;border-width:2px}.v84-goal-banner #overlay-title{top:-15px;width:168px;height:39px;font-size:29px!important;line-height:33px!important}.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite{transform:scale(1.1)}.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v86-pose="arms_wide"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v86-pose="two_fingers_up"]{transform:scale(1.1,1.4)}.v65-world-match #match-area .v84-goal-banner .v84-goal-logo{width:62px;height:78px}.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v61-crest{width:62px;height:75px}.v65-world-match #match-area .v84-goal-banner .v84-goal-details{gap:3px}.v65-world-match #match-area .v84-goal-banner .v84-scorer{font-size:clamp(16px,4.5vw,20px)}.v65-world-match #match-area .v84-goal-banner .v84-score{font-size:clamp(38px,10vw,44px)}.v65-world-match #match-area .v84-goal-banner .v84-goals{font-size:clamp(11px,3.4vw,13px);white-space:normal}.v65-world-match #match-area .v84-goal-banner .v84-pattern-tl,.v65-world-match #match-area .v84-goal-banner .v84-pattern-tr{width:75px;height:55px}.v65-world-match #match-area .v84-goal-banner .v84-pattern-br{width:65px;height:50px}.v65-world-match #match-area .v84-goal-banner .v84-accent{top:11px;width:28px;height:3px;box-shadow:0 7px 0 #00e8d7}.v65-world-match #match-area .v84-goal-banner .v84-accent-left{left:calc(50% - 104px)}.v65-world-match #match-area .v84-goal-banner .v84-accent-right{right:calc(50% - 104px)}.v65-world-match #match-area .match-overlay.goal.v84-goal-banner.v84-no-sprite{grid-template-columns:minmax(0,1fr) 62px;grid-template-rows:minmax(128px,auto) 5px}}
 @media(max-width:340px){.v65-world-match #match-area .match-overlay.goal.v84-goal-banner{--v84-sprite-size:112px;grid-template-columns:var(--v84-sprite-size) minmax(0,1fr) 54px;grid-template-rows:132px 5px}.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite,.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v86-pose="arms_wide"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v86-pose="two_fingers_up"]{transform:none}.v65-world-match #match-area .v84-goal-banner .v84-goal-logo{width:54px;height:68px}.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v61-crest{width:52px;height:64px}.v65-world-match #match-area .match-overlay.goal.v84-goal-banner.v84-no-sprite{grid-template-columns:minmax(0,1fr) 54px}}
 @media(max-width:520px){.v65-world-match #match-area .v84-goal-banner .v84-score.v84-score-long{font-size:30px}.v65-world-match #match-area .v84-goal-banner .v84-goals{font:900 clamp(13px,3.8vw,15px)/1.1 Impact,'Barlow Condensed',sans-serif;white-space:normal}}
 @media(max-width:340px){.v65-world-match #match-area .v84-goal-banner .v84-scorer{font-family:Impact,'Barlow Condensed',sans-serif;font-size:16px}}
 @media(min-width:701px){.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="b"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="b2"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="g"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="i"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="k"]{transform:scale(1)}.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="c"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="c2"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="j"]{transform:scale(.9)}.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="d"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="d2"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="f"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="h"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="l"]{transform:scale(.8)}}
 @media(min-width:341px) and (max-width:700px){.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="b"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="b2"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="g"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="i"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="k"]{transform:scale(.92)}.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="c"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="c2"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="j"]{transform:scale(.9)}.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="d"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="d2"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="f"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="h"],.v65-world-match #match-area .v84-goal-banner .v82-goal-sprite .v82-sprite[data-v87-pair="l"]{transform:scale(.97)}}
 @media(prefers-reduced-motion:reduce){.v65-world-match #match-area .match-overlay.goal.v84-goal-banner,.v65-world-match #match-area .match-overlay.goal.v84-goal-banner.fade-out,.v84-goal-banner *{animation:none!important;transition:none!important}}
`;
document.head.append(v84Style);

v84Style.textContent+=`
.v65-world-match #match-area .v84-goal-banner .v84-goal-logo{display:flex;flex-direction:column;height:auto;gap:6px}
.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v61-crest{width:112px;height:132px}
.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v119-goal-club{display:block;margin:0;max-width:100%;color:#f8f9f0;text-align:center;font:700 12px/1.2 Arial,sans-serif;overflow-wrap:anywhere;text-shadow:1px 1px 0 #06132d}
@media(max-width:700px){.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v61-crest{width:80px;height:96px}.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v119-goal-club{font-size:11px}}
@media(max-width:520px){.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v61-crest{width:52px;height:64px}.v65-world-match #match-area .v84-goal-banner .v84-goal-logo .v119-goal-club{font-size:10px}}
`;
