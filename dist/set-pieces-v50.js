'use strict';

// Match restarts live only in the current simulation. Career records still use the
// existing goals, passes, shots and assists, so old saves need no migration.
let aggression=0;
const v50AggressionLabels={[-1]:'Vorsichtig',0:'Normal',1:'Aggressiv'};
const v50OpponentStyles={hafen:0,nord:1,union:-1,athletik:1,vorstadt:-1};
function v50OpponentAggression(){return v50OpponentStyles[activeOpponent()?.id]??0}
const v50AggressionPanel=$('#tactics-panel');
$('#tactics-panel .plan-card')?.insertAdjacentHTML('beforebegin',`<fieldset id="v50-aggression"><legend>Aggressivität</legend><div class="segmented" role="group" aria-label="Aggressivität"><button type="button" data-aggression="-1">Vorsichtig</button><button type="button" data-aggression="0">Normal</button><button type="button" data-aggression="1">Aggressiv</button></div><p class="help">Aggressivere Zweikämpfe erhöhen die Chance auf Ballgewinn und Foul.</p></fieldset>`);
function v50SyncAggression(){
 $$('[data-aggression]').forEach(button=>{const active=Number(button.dataset.aggression)===aggression;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active)});
}
const v50BaseSaveCurrent=saveCurrent;
saveCurrent=function(){if(activeSave)activeSave.aggression=aggression;return v50BaseSaveCurrent()};
const v50BaseOpenSlot=openSlot;
openSlot=function(raw){aggression=clamp(Number(raw.aggression)||0,-1,1);const result=v50BaseOpenSlot(raw);v50SyncAggression();return result};
if(typeof v24Snapshot==='function'){
 const v50BaseSnapshot=v24Snapshot;
 v24Snapshot=function(){const snapshot=v50BaseSnapshot();if(snapshot)snapshot.aggression=aggression;return snapshot};
 const v50BaseUndoLast=v24UndoLast;
 v24UndoLast=function(){
  const before=aggression,restore=v24Undo?.aggression;
  if(restore!==undefined)aggression=restore;
  const result=v50BaseUndoLast();
  if(!result)aggression=before;
  v50SyncAggression();return result;
 };
}
const v50BaseUpdatePlan=updatePlan;
updatePlan=function(){v50BaseUpdatePlan();$('#plan-copy').textContent+=` Aggressivität: ${v50AggressionLabels[aggression]}.`};
v50AggressionPanel?.addEventListener('click',event=>{
 const button=event.target.closest('[data-aggression]');if(!button||running)return;
 const value=Number(button.dataset.aggression);if(value===aggression)return;
 v24Remember();aggression=value;saveCurrent();render();v50SyncAggression();
});
v50SyncAggression();
const v50BaseAbility=ability;
ability=function(player,key){
 const value=v50BaseAbility(player,key);
 return key==='tak'&&match&&running?clamp(value+(match.aggression?.[player.t]??0)*6,10,98):value;
};

const v50BaseStart=start;
start=function(){
 const result=v50BaseStart();
 if(match&&running){
  match.aggression=[aggression,v50OpponentAggression()];
  match.setPieceStats={corners:[0,0],fouls:[0,0],freeKicks:[0,0],penalties:[0,0]};
  $('#live-plan').textContent+=` · Zweikämpfe: ${v50AggressionLabels[aggression]} · Gegner: ${v50AggressionLabels[match.aggression[1]]}`;
 }
 v50Version();
 return result;
};
$('#start').onclick=()=>start();
function v50Version(){
 document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 51');
 const menuFooter=startScreen?.querySelector('footer');if(menuFooter)menuFooter.textContent='Doppel 6 / PROTOTYP 51';
}
const v50BaseRenderCenter=renderCenter;
renderCenter=function(){const result=v50BaseRenderCenter();v50Version();return result};
const v50BaseShowTactics=showTactics;
showTactics=function(){const result=v50BaseShowTactics();$('#subtitle').textContent+=` · Gegner: ${v50AggressionLabels[v50OpponentAggression()]}`;v50SyncAggression();v50Version();return result};
v50Version();

function v50Name(team){
 return team===0?(activeSave?.club||'FC Viertel'):(match?.opponentName||match?.cupOpponentName||activeOpponent()?.name||'SC Hafen');
}
function v50Outfield(team){return match.people.filter(player=>player.t===team&&!player.keeper)}
function v50Keeper(team){return match.people.find(player=>player.t===team&&player.keeper)}
function v50BestTaker(team,type,spot){
 const field=v50Outfield(team),nearGoal=team===0?spot.y<.38:spot.y>.62;
 const key=type==='corner'||(type==='freeKick'&&!nearGoal)?'pas':'fin',proximity=type==='penalty'?0:type==='corner'?22:45;
 const rank=player=>ability(player,key)*.7+ability(player,'pos')*.1-distance(player,spot)*proximity;
 return [...field].sort((a,b)=>rank(b)-rank(a))[0];
}
function v50Spot(player,spot){player.x=spot.x;player.y=spot.y;player.tx=spot.x;player.ty=spot.y}
function v50ClearPenaltyScene(){document.querySelector('#v50-penalty-scene')?.remove()}
const v50OffsideFreezeSeconds=1.5;

function v50Restart(type,team,spot,description){
 const m=match;if(!m||m.finished||m.setPiece)return;
 const taker=v50BestTaker(team,type,spot);
 m.owner=null;m.flight=null;m.rebound=null;m.lastPass=null;m.next=Infinity;
 m.ball={...spot};m.setPiece={type,team,spot,taker,phase:'waiting',wait:type==='penalty'?2.5:type==='corner'?2:type==='offside'?v50OffsideFreezeSeconds+1.1:1.8};
 if(type==='corner'){
  const allies=v50Outfield(team).filter(player=>player!==taker),opponents=v50Outfield(1-team),goalY=team===0?.1:.9;
  v50Spot(taker,{x:spot.x,y:spot.y===.035?.05:.95});
  allies.forEach((player,index)=>v50Spot(player,{x:[.34,.45,.56,.66][index],y:goalY+(team===0?1:-1)*[.025,.085,.13,.18][index]}));
  opponents.forEach((player,index)=>v50Spot(player,{x:[.32,.43,.54,.65,.76][index],y:goalY+(team===0?1:-1)*[.045,.08,.115,.15,.19][index]}));
 }else{
  v50Spot(taker,spot);
  for(const rival of v50Outfield(1-team)){
   const dx=rival.x-spot.x,dy=rival.y-spot.y,d=Math.hypot(dx,dy);
   if(d<.13)v50Spot(rival,{x:clamp(spot.x+(d?dx/d:1)*.13,.06,.94),y:clamp(spot.y+(d?dy/d:0)*.13,.06,.94)});
  }
 }
 note(description,'restart');
 if(type==='penalty'){hideOverlay();v50PenaltyVisual(m.setPiece,null)}
 else showOverlay(type==='corner'?'ECKBALL':'FREISTOSS',`${v50Name(team)} · ${taker.name}`);
 updateTeamStats();
}

function v50Corner(team,x,lastTouch){
 match.setPieceStats.corners[team]++;
 v50Restart('corner',team,{x:x<.5?.035:.965,y:team===0?.035:.965},
  `Eckball für ${v50Name(team)} nach ${lastTouch}.`);
}
function v50Foul(victim,offender){
 const m=match,team=victim.t,spot={x:clamp(victim.x,.12,.88),y:clamp(victim.y,.08,.92)};
 const penalty=spot.x>=.25&&spot.x<=.75&&(team===0?spot.y<=.18:spot.y>=.82);
 m.setPieceStats.fouls[offender.t]++;
 offender.stats.fouls=(offender.stats.fouls||0)+1;
 if(penalty)m.setPieceStats.penalties[team]++;
 else m.setPieceStats.freeKicks[team]++;
 v50Restart(penalty?'penalty':'freeKick',team,penalty?{x:.5,y:team===0?.17:.83}:spot,
  `${offender.name} foult ${victim.name}. ${penalty?'Elfmeter':'Freistoß'} für ${v50Name(team)}.`);
}

const v50BaseAction=action;
let FOUL_SKILL_FACTOR=.0006;
function v50FoulChance(tackler,victim){
 return clamp(.045+(tackler.t===0&&press?.01:0)+(match.aggression?.[tackler.t]??0)*.025+(ability(tackler,'tak')-ability(victim,'tec'))*FOUL_SKILL_FACTOR,.015,.13);
}
action=function(){
 const m=match,p=m?.owner;
 if(p&&!p.keeper&&!m.setPiece){
  const tackler=m.people.filter(other=>other.t!==p.t&&!other.keeper&&distance(other,p)<.135)
   .sort((a,b)=>distance(a,p)-distance(b,p))[0];
  if(tackler){
   if(random()<v50FoulChance(tackler,p)){v50Foul(p,tackler);return}
  }
 }
 return v50BaseAction();
};

function v50LooseBall(point,text){
 const m=match;m.owner=null;m.flight=null;m.lastPass=null;m.next=Infinity;
 m.ball={x:clamp(point.x,.07,.93),y:clamp(point.y,.065,.935)};
 m.rebound={x:m.ball.x,y:m.ball.y,delay:.16};
 note(text,'duel');
}
function v50ChaseLooseBall(delta){
 const m=match,r=m.rebound;if(!r||m.owner||m.flight||m.kickoff||m.halftimePause||m.finished)return;
 r.delay=Math.max(0,r.delay-delta);
 if(r.delay)return;
 const candidates=[...m.people].sort((a,b)=>distance(a,r)-distance(b,r)).slice(0,3);
 for(const player of candidates){
  const dx=r.x-player.x,dy=r.y-player.y,d=Math.hypot(dx,dy);
  if(d>.014){const speed=(player.keeper?.17:.07+ability(player,'spd')*PLAYER_SPEED_FACTOR)*delta*3.5,portion=Math.min(1,speed/d);player.x+=dx*portion;player.y+=dy*portion}
 }
 const winner=candidates.find(player=>distance(player,r)<.026);
 if(winner){m.rebound=null;m.owner=winner;m.ball={x:winner.x,y:winner.y};m.next=m.elapsed+.55;note(`${winner.name} nimmt den freien Ball auf.`,'duel')}
}

function v50Goal(scorer,keeper,penalty=false){
 const m=match;
 scorer.stats.goals++;
 if(m.lastPass?.receiver===scorer&&m.lastPass.passer!==scorer&&m.elapsed-m.lastPass.at<5)m.lastPass.passer.stats.assists++;
 m.lastPass=null;keeper.stats.conceded++;m.score[scorer.t]++;
 m.goals.push({team:scorer.t,name:scorer.name,minute:Math.max(1,displayMatchMinute(m.elapsed)),penalty});
 note(`${penalty?'ELFMETERTOR!':'TOR!'} ${scorer.name} trifft für ${v50Name(scorer.t)}.`,'goal');
 m.owner=null;m.rebound=null;m.goalPause=2;m.pendingKickoff=1-scorer.t;
 showOverlay(penalty?'ELFMETERTOR!':'TOR!',`${scorer.name} · ${m.score[0]} : ${m.score[1]}`,true);
}
function v50GoalKick(keeper,text){
 match.owner=keeper;match.ball={x:keeper.x,y:keeper.y};match.lastPass=null;match.next=match.elapsed+.75;
 note(text,'restart');
}
function v50Deflect(point,team,defender,description){
 const goalLine=team===0?.035:.965,forward=team===0?-1:1;
 const endY=point.y+forward*(random()-.3)*.3;
 const crossed=team===0?endY<=goalLine:endY>=goalLine;
 let endX=clamp(point.x+(random()-.5)*.4,.05,.95);
 if(crossed&&endX>.37&&endX<.63)endX=endX<.5?.37:.63;
 const target={x:endX,y:crossed?goalLine:clamp(endY,.065,.935)};
 match.owner=defender;match.ball={...point};
 fly(target,.25,()=>{
  if(crossed)v50Corner(team,target.x,description);
  else v50LooseBall(target,`Der Ball liegt nach ${description} frei.`);
 });
}

shoot=function(shooter,rivals,near,progress){
 const m=match,keeper=rivals.find(player=>player.keeper),team=shooter.t;
 shooter.stats.shots++;m.shots[team]++;
 const goalPoint={x:.45+random()*.1,y:team===0?.035:.965};
 const blockers=rivals.filter(player=>!player.keeper).map(player=>({player,geometry:passLaneGeometry(player,shooter,goalPoint)}))
  .filter(item=>item.geometry&&item.geometry.lateral<.09)
  .sort((a,b)=>a.geometry.t-b.geometry.t);
 const blocker=blockers[0];
 if(blocker&&random()<clamp(.12+ability(blocker.player,'tak')*.002,.16,.34)){
  const point={x:blocker.geometry.x,y:blocker.geometry.y};
  note(`${shooter.name} schießt – ${blocker.player.name} stellt sich in den Weg!`,'shot');
  fly(point,clamp(distance(shooter,point)*1.5,.16,.45),()=>{
   v50Deflect(point,team,blocker.player,`Block von ${blocker.player.name}`);
  });
  return;
 }
 const pressure=near.reduce((sum,player)=>sum+ability(player,'tak'),0);
 const onTarget=random()<clamp(.42+ability(shooter,'fin')*.005-pressure*.0015-(.82-progress)*.35,.22,.88);
 if(onTarget){shooter.stats.onTarget++;keeper.stats.faced++}
 const goalChance=onTarget?clamp(.16+ability(shooter,'fin')*.006-ability(keeper,'gk')*.0025-pressure*.0006-(.84-progress)*.25,.12,.62):0;
 const goal=onTarget&&random()<goalChance;
 const end={x:goal?goalPoint.x:onTarget?.34+random()*.32:random()<.5?.18:.82,y:onTarget&&!goal?keeper.y:goalPoint.y};
 note(`${shooter.name} zieht ab!`,'shot');
 fly(end,.5,()=>{
  if(goal){v50Goal(shooter,keeper);return}
  if(!onTarget){v50GoalKick(keeper,`${shooter.name} setzt den Ball vorbei. Abstoß für ${v50Name(keeper.t)}.`);return}
  keeper.stats.saves++;
  if(random()<.32){
   v50Deflect(end,team,keeper,`Parade von ${keeper.name}`);
  }else v50GoalKick(keeper,`${keeper.name} hält den Abschluss fest.`);
 });
};

function v50TakeCorner(setPiece){
 const m=match,taker=setPiece.taker,team=setPiece.team;
 const allies=v50Outfield(team).filter(player=>player!==taker);
 const receiver=[...allies].sort((a,b)=>ability(b,'pos')+ability(b,'fin')*.35-ability(a,'pos')-ability(a,'fin')*.35)[0];
 const target={x:receiver.x,y:receiver.y};
 m.owner=taker;m.ball={...setPiece.spot};taker.stats.passes++;
 note(`${taker.name} bringt die Ecke vor das Tor.`,'restart');
 fly(target,.7,()=>{
  const defenders=v50Outfield(1-team).sort((a,b)=>distance(a,target)-distance(b,target));
  const defender=defenders[0],contest=defender&&distance(defender,target)<.15;
  if(contest&&random()<clamp(.34+(ability(defender,'pos')-ability(receiver,'pos'))*.006,.18,.62)){
   m.owner=defender;m.lastPass=null;m.next=m.elapsed+.5;
   note(`${defender.name} klärt die Ecke.`,'duel');
  }else{
   taker.stats.passComplete++;m.owner=receiver;m.lastPass={passer:taker,receiver,at:m.elapsed};m.next=m.elapsed+.25;
   note(`${receiver.name} erreicht die Flanke.`,'shot');
  }
 });
}
function v50TakeFreeKick(setPiece){
 const m=match,taker=setPiece.taker,team=setPiece.team;
 const goalDistance=team===0?setPiece.spot.y:1-setPiece.spot.y;
 m.owner=taker;m.ball={...setPiece.spot};
 if(goalDistance<.38&&setPiece.spot.x>.18&&setPiece.spot.x<.82&&random()<.65){
  note(`${taker.name} versucht es direkt mit dem Freistoß.`,'restart');
  const rivals=m.people.filter(player=>player.t!==team);
  shoot(taker,rivals,rivals.filter(player=>!player.keeper&&distance(player,taker)<.16),1-goalDistance);
  return;
 }
 const allies=v50Outfield(team).filter(player=>player!==taker);
 const target=[...allies].sort((a,b)=>(team===0?a.y-b.y:b.y-a.y)||distance(a,taker)-distance(b,taker))[0];
 taker.stats.passes++;
 note(`${taker.name} spielt den Freistoß auf ${target.name}.`,'restart');
 fly(target,clamp(distance(taker,target)*1.5,.3,.8),()=>{
  const defender=v50Outfield(1-team).find(player=>distance(player,target)<.065);
  if(defender&&random()<.4){taker.stats.passLost++;defender.stats.interceptions++;m.owner=defender;m.lastPass=null;m.next=m.elapsed+.6;note(`${defender.name} fängt den Freistoß ab.`,'duel')}
  else{taker.stats.passComplete++;m.owner=target;m.lastPass={passer:taker,receiver:target,at:m.elapsed};m.next=m.elapsed+.75}
 });
}

const v50PenaltyStyle=document.createElement('style');
v50PenaltyStyle.textContent=`#v50-penalty-scene{position:absolute;z-index:9;inset:0;display:grid;place-items:center;padding:12px;background:#091c20f0}#v50-penalty-scene .v42-goal-scene{width:100%;margin:0;height:min(52vw,310px)}#v50-penalty-scene .v42-next-shooter{position:absolute;top:8px;left:10px;right:10px;text-align:center;color:#fff;font-size:13px;font-weight:800}#v50-penalty-scene .v42-stands{height:96px}@media(max-width:600px){#v50-penalty-scene{padding:6px}#v50-penalty-scene .v42-goal-scene{height:260px}}`;
document.head.append(v50PenaltyStyle);
function v50PenaltyVisual(setPiece,last){
 let scene=document.querySelector('#v50-penalty-scene');
 if(!scene){scene=document.createElement('div');scene.id='v50-penalty-scene';scene.setAttribute('role','status');$('#match-area .v42-pitch-stage').append(scene)}
 const attacker=setPiece.team,defender=1-attacker,kit=match.kits||{};
 const colour=team=>team===0?(kit.user||{main:'#c7f36b',trim:'#18302a'}):(kit.opponent||{main:'#7bb7e9',trim:'#bedfff'});
 const session={ownName:v50Name(attacker),opponentName:v50Name(defender),ownColour:colour(attacker),opponentColour:colour(defender),
  keeperKits:[attacker===0?kit.userKeeper:kit.opponentKeeper,defender===0?kit.userKeeper:kit.opponentKeeper],
  own:[v42Player(setPiece.taker)],opponent:[v42Player(v50Keeper(defender))],order:[setPiece.taker.n],opponentOrder:[v50Keeper(defender).n],
  score:[0,0],kicks:[],phase:last?'done':'shooting',last};
 scene.innerHTML=v42SceneHTML(session);
 if(last){scene.querySelector('.v42-goal-scene')?.classList.add(last.outcome);scene.querySelector('.v42-ball')?.classList.add(last.outcome)}
}
function v50TakePenalty(setPiece){
 const keeper=v50Keeper(1-setPiece.team),shooter=setPiece.taker;
 const goal=random()<v42PenaltyChance(v42Player(shooter),v42Player(keeper));
 const outcome=goal?'goal':random()<.45?'save':random()<.5?'wide':'high';
 setPiece.phase='result';setPiece.wait=1.15;setPiece.outcome=outcome;
 setPiece.shotSide=random()<.5?-1:1;
 setPiece.diveSide=outcome==='save'?setPiece.shotSide:-setPiece.shotSide;
 v50PenaltyVisual(setPiece,{side:0,number:shooter.n,name:shooter.name,goal,outcome,shotSide:setPiece.shotSide,diveSide:setPiece.diveSide});
 note(`${shooter.name}: ${v42OutcomeText({goal,outcome})}`,'shot');
}
function v50FinishPenalty(setPiece){
 const m=match,shooter=setPiece.taker,keeper=v50Keeper(1-setPiece.team),outcome=setPiece.outcome;
 v50ClearPenaltyScene();m.setPiece=null;
 shooter.stats.shots++;m.shots[shooter.t]++;
 if(outcome==='goal')shooter.stats.penaltiesScored=(shooter.stats.penaltiesScored||0)+1;
 else shooter.stats.penaltiesMissed=(shooter.stats.penaltiesMissed||0)+1;
 if(outcome==='goal'||outcome==='save'){shooter.stats.onTarget++;keeper.stats.faced++}
 if(outcome==='goal'){v50Goal(shooter,keeper,true);return}
 if(outcome==='save'){
  keeper.stats.saves++;
  if(random()<.3)v50Deflect({x:.5,y:keeper.y},shooter.t,keeper,`Parade von ${keeper.name}`);
  else v50GoalKick(keeper,`${keeper.name} hält den Elfmeter fest.`);
 }else v50GoalKick(keeper,`${shooter.name} schießt den Elfmeter vorbei. Abstoß.`);
 hideOverlay();
}

const v50BaseKickoff=kickoff;
kickoff=function(team){if(match){match.setPiece=null;match.rebound=null;v50ClearPenaltyScene()}return v50BaseKickoff(team)};
const v50BaseHalftime=beginHalftimeBreak;
beginHalftimeBreak=function(){
 if(match?.setPiece){match.halftimePending=true;match.elapsed=37.499;return}
 return v50BaseHalftime();
};
const v50BaseFinish=finishMatch;
finishMatch=function(){if(match?.setPiece){match.fulltimePending=true;return}return v50BaseFinish()};
const v50BaseBeginKickoff=beginKickoff;
beginKickoff=function(){
 if(!match?.kickoff)return v50BaseBeginKickoff();
 match.kickoff.phase='banner';
 match.postBanner={kind:'kickoff',wait:1.65,visible:true};
 showOverlay('ANPFIFF','Gleich rollt der Ball');
};
const v50BaseStep=step;
step=function(delta,realDelta){
 const m=match;
 if(m?.fulltimePending&&!m.setPiece&&!m.flight&&!m.throwIn&&m.goalPause<=0&&!m.postBanner){m.kickoff=null;finishMatch();return}
 if(m?.postBanner&&!m.finished){
  const pause=m.postBanner;pause.wait=Math.max(0,pause.wait-realDelta);
  if(pause.visible&&pause.wait<=1){hideOverlay();pause.visible=false}
  if(pause.wait<=0){
   m.postBanner=null;
   if(pause.kind==='kickoff'){v50BaseBeginKickoff();hideOverlay();m.overlayTTL=0}
   else{kickoff(m.pendingKickoff);m.pendingKickoff=null}
  }
  updateTeamStats();return;
 }
 if(m?.goalPause>0&&m.goalPause<=realDelta){
  m.goalPause=0;hideOverlay();m.postBanner={kind:'goal',wait:1,visible:false};updateTeamStats();return;
 }
 if(m?.setPiece&&!m.finished){
  const current=m.setPiece;current.wait=Math.max(0,current.wait-realDelta);
  if(current.wait<=0){
   if(current.phase==='waiting'&&(current.type==='freeKick'||current.type==='offside')){current.phase='fading';current.wait=.25;$('#match-overlay').classList.add('fade-out')}
   else if(current.phase==='fading'){current.phase='postBanner';current.wait=.5;hideOverlay();$('#match-overlay').classList.remove('fade-out')}
   else if(current.phase==='waiting'&&current.type!=='penalty'){current.phase='postBanner';current.wait=1;hideOverlay()}
   else if(current.phase==='result')v50FinishPenalty(current);
   else if(current.type==='penalty'){hideOverlay();v50TakePenalty(current)}
   else{m.setPiece=null;hideOverlay();if(current.type==='corner')v50TakeCorner(current);else v50TakeFreeKick(current)}
  }
  updateTeamStats();return;
 }
 const result=v50BaseStep(delta,realDelta);
 if(m?.rebound&&!m.finished)v50ChaseLooseBall(delta);
 return result;
};

const v50BaseTeamStats=updateTeamStats;
updateTeamStats=function(){
 v50BaseTeamStats();
 if(!match?.setPieceStats)return;
 for(const [id,key] of [['#setpiece-corners','corners'],['#setpiece-fouls','fouls'],['#setpiece-free-kicks','freeKicks']]){
  const row=$(id);if(!row)continue;
  row.querySelector('[data-stat-value="home"]').textContent=match.setPieceStats[key][0];
  row.querySelector('[data-stat-value="away"]').textContent=match.setPieceStats[key][1];
 }
};
