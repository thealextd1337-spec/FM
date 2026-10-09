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
// Restart formations are destinations, rather than instant position changes in the world match.
const v114RestartMoves=new WeakMap(),v114KickoffBalls=new WeakMap();
function v114RememberRestart(current,key,positions){
 const targets=new Map(current.people.map(p=>[p,{x:p.x,y:p.y}]));let seconds=0;
 for(const [p,old]of positions){const next=targets.get(p);seconds=Math.max(seconds,Math.hypot((next.x-old.x)*v160PitchWidth()/(v55Field.right-v55Field.left),(next.y-old.y)*v160PitchLength()/(v55Field.bottom-v55Field.top))/6);v50Spot(p,old)}
 v114RestartMoves.set(key,targets);return seconds+.1;
}
function v114PositionRestart(current,seconds){
 const key=current.setPiece||current.kickoff,targets=key&&v114RestartMoves.get(key);if(!targets||key.phase==='rolling')return;
 for(const [p,target]of targets){const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx*v160PitchWidth()/(v55Field.right-v55Field.left),dy*v160PitchLength()/(v55Field.bottom-v55Field.top)),q=Math.min(1,6*Math.max(0,seconds)/Math.max(.001,d));p.x+=dx*q;p.y+=dy*q;p.tx=p.x;p.ty=p.y}
}
function v131CornerFormation(current,piece){
 const team=piece.team,dir=team===0?1:-1,goal=team===0?v55Field.top:v55Field.bottom,sx=(v55Field.right-v55Field.left)/v160PitchWidth(),sy=(v55Field.bottom-v55Field.top)/v160PitchLength(),side=piece.spot.x<.5?-1:1;
 const attackers=v50Outfield(team).filter(p=>p!==piece.taker).sort((a,b)=>ability(b,'air')+ability(b,'pos')*.4-ability(a,'air')-ability(a,'pos')*.4);
 if(!attackers.length)return;
 const variants=['near','central','far'];if(current.teamFocus?.[team]==='Außen'||ability(piece.taker,'pas')+ability(piece.taker,'tec')>30)variants.push('short');
 current.cornerVariants??=[null,null];const eligible=variants.filter(v=>v!==current.cornerVariants[team]),variant=eligible[Math.min(eligible.length-1,Math.floor(random()*eligible.length))];current.cornerVariants[team]=variant;
 const spots=variant==='near'?[[side*2.8,6.5],[-side*3.5,10],[0,18],[side*5,28]]:variant==='far'?[[-side*3.5,7.5],[side*2.5,11],[0,18],[side*5,28]]:variant==='short'?[[side*16,5],[side*2.5,10],[-side*3.5,12],[0,26]]:[[0,9],[side*3.5,7],[-side*4,18],[0,28]];
 const receiver=variant==='short'?[...attackers].sort((a,b)=>ability(b,'pas')+ability(b,'tec')-ability(a,'pas')-ability(a,'tec'))[0]:attackers[0];
 const ordered=[receiver,...attackers.filter(p=>p!==receiver)];piece.cornerVariant=variant;piece.cornerTargetPid=receiver.pid;piece.cornerTargetNumber=receiver.n;
 ordered.forEach((p,i)=>{const [x,depth]=spots[Math.min(i,spots.length-1)];v50Spot(p,{x:.5+x*sx,y:goal+dir*depth*sy})});
 const defenders=v50Outfield(1-team).sort((a,b)=>ability(b,'pos')+ability(b,'tak')*.4-ability(a,'pos')-ability(a,'tak')*.4);
 defenders.forEach((p,i)=>{const mark=ordered[i];if(mark&&i<3){const gap=.65+(20-ability(p,'pos'))*.04;v50Spot(p,{x:mark.x-side*.4*sx,y:mark.y-dir*gap*sy})}else v50Spot(p,{x:.5+(i===3?-side*4:side*5)*sx,y:goal+dir*(i===3?12:18)*sy})});
}
function v50ClearPenaltyScene(){document.querySelector('#v50-penalty-scene')?.remove()}
const v50OffsideFreezeSeconds=3;

function v50Restart(type,team,spot,description){
 const m=match;if(!m||m.finished||m.setPiece)return;
 const positions=typeof v65WorldActive!=='undefined'&&v65WorldActive&&type==='corner'?new Map(m.people.map(p=>[p,{x:p.x,y:p.y}])):null;
 const taker=v50BestTaker(team,type,spot);
 m.owner=null;m.flight=null;m.rebound=null;m.lastPass=null;m.next=Infinity;
 m.ball={...spot};m.setPiece={type,team,spot,taker,phase:'waiting',wait:type==='penalty'?2.5:type==='corner'?2:type==='offside'?v50OffsideFreezeSeconds+1.1:1.8};
 if(typeof v119FreeKickWall==='function'&&typeof v65WorldActive!=='undefined'&&v65WorldActive&&v119PaceActive(m)){
  const wall=v119FreeKickWall(m,m.setPiece);if(wall)m.setPiece.wall=wall;
 }
 if(type==='corner'){
  const allies=v50Outfield(team).filter(player=>player!==taker),opponents=v50Outfield(1-team),goalY=team===0?.1:.9;
  v50Spot(taker,positions?{x:spot.x+(spot.x<.5?-.35:.35)*(v55Field.right-v55Field.left)/v160PitchWidth(),y:spot.y+(team===0?-.54:.54)*(v55Field.bottom-v55Field.top)/v160PitchLength()}:{x:spot.x,y:team===0?.05:.95});
  if(positions)v131CornerFormation(m,m.setPiece);else{
   allies.forEach((player,index)=>v50Spot(player,{x:[.34,.45,.56,.66][index],y:goalY+(team===0?1:-1)*[.025,.085,.13,.18][index]}));
   opponents.forEach((player,index)=>v50Spot(player,{x:[.32,.43,.54,.65,.76][index],y:goalY+(team===0?1:-1)*[.045,.08,.115,.15,.19][index]}));
  }
 }else{
  v50Spot(taker,spot);
  for(const rival of v50Outfield(1-team)){
   const dx=rival.x-spot.x,dy=rival.y-spot.y,d=Math.hypot(dx,dy);
   if(d<.13)v50Spot(rival,{x:clamp(spot.x+(d?dx/d:1)*.13,.06,.94),y:clamp(spot.y+(d?dy/d:0)*.13,.06,.94)});
  }
 }
 if(positions)m.setPiece.wait=Math.max(m.setPiece.wait,v114RememberRestart(m,m.setPiece,positions));
 note(description,'restart');
 if(type==='penalty'){hideOverlay();v50PenaltyVisual(m.setPiece,null)}
 else showOverlay(type==='corner'?'ECKBALL':'FREISTOSS',`${v50Name(team)} · ${taker.name}`);
 updateTeamStats();
}

function v50Corner(team,x,lastTouch){
 match.setPieceStats.corners[team]++;
 v50Restart('corner',team,{x:x<.5?.049:.951,y:team===0?.036:.964},
  `Eckball für ${v50Name(team)} nach ${lastTouch}.`);
}
function v50Foul(victim,offender){
 if(typeof v65WorldActive!=='undefined'&&v65WorldActive&&v56Contact(victim,offender)>43)return false;
 if(typeof v113FoulContact==='function')v113FoulContact(match,victim,offender);
 const m=match,team=victim.t,spot={x:clamp(victim.x,.12,.88),y:clamp(victim.y,.08,.92)};
 const penalty=m.geometry?v160PenaltyContains(victim,1-team,m):spot.x>=.25&&spot.x<=.75&&(team===0?spot.y<=.18:spot.y>=.82);
 m.setPieceStats.fouls[offender.t]++;
 offender.stats.fouls=(offender.stats.fouls||0)+1;
 if(penalty)m.setPieceStats.penalties[team]++;
 else m.setPieceStats.freeKicks[team]++;
 v50Restart(penalty?'penalty':'freeKick',team,penalty?{x:.5,y:m.geometry?(team===0?v55Field.top:v55Field.bottom)+(team===0?1:-1)*68*(.17-26/740)/(688/740)/v160PitchScale(m).y:team===0?.17:.83}:spot,
  `${offender.name} foult ${victim.name}. ${penalty?'Elfmeter':'Freistoß'} für ${v50Name(team)}.`);
 if(typeof v113RestoreFoul==='function')v113RestoreFoul(m);
}

const v50BaseAction=action;
let FOUL_SKILL_FACTOR=.0006;
function v50FoulChance(tackler,victim){
 return clamp(.045+((match?.teamPress?.[tackler.t]??(tackler.t===0&&press))?1:0)*.01+(match.aggression?.[tackler.t]??0)*.025+(ability(tackler,'tak')-ability(victim,'tec'))*FOUL_SKILL_FACTOR,.015,.13);
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
 const world=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 const clearance=typeof v102Motion!=='undefined'&&v102Motion.get(match)?.loose;
 if(world&&(!clearance||clearance.drop)){const edge=point.x<v55Field.left?'left':point.x>v55Field.right?'right':point.y<v55Field.top?'top':point.y>v55Field.bottom?'bottom':null;if(edge){v55Out({edge,...point},match.lastTouch??0,text);return}}
 const m=match;m.owner=null;m.flight=null;m.lastPass=null;m.next=Infinity;
 m.ball=world?{x:point.x,y:point.y}:{x:clamp(point.x,.07,.93),y:clamp(point.y,.065,.935)};
 m.rebound={x:m.ball.x,y:m.ball.y,delay:.16};
 note(text,'duel');
}
function v50ChaseLooseBall(delta,positions){
 const m=match,r=m.rebound;if(!r||m.owner||m.flight||m.kickoff||m.halftimePause||m.finished)return;
 r.delay=Math.max(0,r.delay-delta);
 if(r.delay)return;
 const world=typeof v65WorldActive!=='undefined'&&v65WorldActive,width=world?v160PitchWidth()/(v55Field.right-v55Field.left):1,length=world?v160PitchLength()/(v55Field.bottom-v55Field.top):1,gap=player=>Math.hypot((player.x-r.x)*width,(player.y-r.y)*length);
 const candidates=[...m.people].sort((a,b)=>gap(a)-gap(b)).slice(0,3);
 for(const player of candidates){
  const start=positions.get(player),dx=r.x-start.x,dy=r.y-start.y,d=Math.hypot(dx,dy);
  if(world){const metres=Math.hypot(dx*width,dy*length),pace=player.keeper?2.6+ability(player,'spd')*.065:3+ability(player,'spd')*.14,portion=Math.min(1,pace*Math.max(0,delta)/MATCH_SPEED/Math.max(.00001,metres));player.x=start.x+dx*portion;player.y=start.y+dy*portion}
  else if(d>.014){const speed=(player.keeper?.17:.07+ability(player,'spd')*PLAYER_SPEED_FACTOR)*delta,portion=Math.min(1,speed/d);player.x=start.x+dx*portion;player.y=start.y+dy*portion}
 }
 const winner=candidates.find(player=>gap(player)<(world?.8:.026));
 if(winner){const contact={x:r.x,y:r.y},held=world&&winner.keeper&&(m.geometry?v160KeeperHands(m,winner,contact):Math.abs(contact.y-(winner.t===0?v55Field.bottom:v55Field.top))*length<=14&&Math.abs(contact.x-.5)*width<=12);m.rebound=null;if(held){v115KeeperChallenges.set(m,{keeper:winner,attacker:null,start:{x:winner.x,y:winner.y},end:{x:winner.x,y:winner.y},contact,at:v102Clock(m),duration:.55,caught:true,checked:true,pickup:true});v50GoalKick(winner,`${winner.name} sichert den freien Ball.`,{held:true})}else{m.owner=winner;m.ball={x:winner.x,y:winner.y};m.next=m.elapsed+.55;note(`${winner.name} nimmt den freien Ball auf.`,'duel')}}
}

function v50Goal(scorer,keeper,penalty=false,source=null){
 const m=match;
 scorer.stats.goals++;
 if(m.lastPass?.receiver===scorer&&m.lastPass.passer!==scorer&&m.elapsed-m.lastPass.at<5)m.lastPass.passer.stats.assists++;
 m.lastPass=null;keeper.stats.conceded++;m.score[scorer.t]++;
 const ownGoal=source==='own-goal';
 m.goals.push({team:scorer.t,pid:scorer.pid||null,name:scorer.name,minute:Math.max(1,displayMatchMinute(m.elapsed)),penalty,source,...(ownGoal?{ownGoal:true,ownGoalPid:scorer.ownGoalPid||null}:{})});
 note(`${penalty?'ELFMETERTOR!':'TOR!'} ${scorer.name}${ownGoal?' (Eigentor)':''} trifft ${source==='direct-free-kick'?'per direktem Freistoß ':''}für ${v50Name(scorer.t)}.`,'goal');
 m.owner=null;m.rebound=null;m.goalPause=2;m.pendingKickoff=1-scorer.t;
 showOverlay(penalty?'ELFMETERTOR!':'TOR!',`${scorer.name}${ownGoal?' (Eigentor)':''} · ${m.score[0]} : ${m.score[1]}`,true);
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
v50PenaltyStyle.textContent=`#v50-penalty-scene{position:absolute;z-index:9;inset:0;display:grid;place-items:center;padding:12px;background:#091c20f0}#v50-penalty-scene .v42-goal-scene{width:100%;margin:0;height:min(52vw,310px)}#v50-penalty-scene .v42-next-shooter{position:absolute;top:8px;left:10px;right:10px;text-align:center;color:#fff;font-size:13px;font-weight:800}#v50-penalty-scene .v42-stands{height:96px}#v50-penalty-scene .v42-ball.high{animation-name:v50BallHigh}@keyframes v50BallHigh{to{left:calc(50% + var(--shot-x));bottom:calc(100% - 34px);transform:translateX(-50%) scale(.65)}}@media(max-width:600px){#v50-penalty-scene{padding:6px}#v50-penalty-scene .v42-goal-scene{height:260px}}@media(prefers-reduced-motion:reduce){#v50-penalty-scene .v42-ball.high{animation:none;left:calc(50% + var(--shot-x));bottom:calc(100% - 34px);transform:translateX(-50%) scale(.65)}}`;
v50PenaltyStyle.textContent+=`#v50-penalty-scene .v78-penalty-referee{position:absolute;left:8px;bottom:8px;height:clamp(110px,30%,175px);width:auto;image-rendering:pixelated;pointer-events:none;filter:drop-shadow(0 3px 3px #07191d);animation:v78PenaltySignal 2.25s ease-out both}@keyframes v78PenaltySignal{0%{opacity:0;transform:translateY(10px)}12%,73%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){#v50-penalty-scene .v78-penalty-referee{animation:none;opacity:1}}`;
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
 scene.innerHTML=v42SceneHTML(session)+(!last&&typeof v55RefereeAsset==='function'?`<img class="v78-penalty-referee" src="${v55RefereeAsset('penalty')}" alt="Schiedsrichter zeigt auf den Elfmeterpunkt">`:'');
 if(last){const goal=scene.querySelector('.v42-goal-scene');goal?.classList.add(last.outcome);goal?.style.setProperty('--miss-x',`${last.shotSide*41}%`);scene.querySelector('.v42-ball')?.classList.add(last.outcome)}
}
function v50TakePenalty(setPiece){
 const keeper=v50Keeper(1-setPiece.team),shooter=setPiece.taker;
 const goal=random()<v42PenaltyChance(v42Player(shooter),v42Player(keeper));
 const outcome=goal?'goal':random()<.45?'save':random()<.5?'wide':'high';
 setPiece.phase='result';setPiece.wait=2.15;setPiece.outcome=outcome;
 setPiece.shotSide=random()<.5?-1:1;
 setPiece.diveSide=outcome==='save'?setPiece.shotSide:-setPiece.shotSide;
 if(typeof v158PenaltyDive==='function')v158PenaltyDive(match,setPiece,keeper);
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
 }else v50GoalKick(keeper,`${shooter.name} schießt den Elfmeter ${outcome==='high'?'über das Tor':'vorbei'}. Abstoß.`);
 hideOverlay();
}

const v50BaseKickoff=kickoff;
function v119SpaceKickoff(current){
 const restart=current.kickoff,sx=v160PitchWidth()/(v55Field.right-v55Field.left),sy=v160PitchLength()/(v55Field.bottom-v55Field.top),clearance=2.2;
 // Base setup clamps multiple forward rows onto the same half-way row. Resolve
 // actual future restart destinations before remembering travel, without RNG or
 // changing tactical anchors. Existing saved restart targets are never rebuilt.
 const fixed=[restart.kicker,restart.support,...current.people.filter(p=>p.keeper)],gap=(a,b)=>Math.hypot((a.x-b.x)*sx,(a.y-b.y)*sy);
 for(const p of current.people.filter(p=>!fixed.includes(p))){
  const origin={x:p.x,y:p.y},ownSide=p.t===0?1:-1;
  const valid=point=>point.x>=v55Field.left+.4/sx&&point.x<=v55Field.right-.4/sx&&point.y>=v55Field.top+.4/sy&&point.y<=v55Field.bottom-.4/sy&&(point.y-.5)*ownSide>=.1/sy&&(p.t===restart.t||Math.hypot(point.x-.5,point.y-.5)>=.15)&&fixed.every(q=>gap(point,q)>=clearance-1e-9);
  let target=valid(origin)?origin:null;
  for(let ring=1;!target&&ring<=12;ring++)for(const [dx,dy]of [[-1,0],[1,0],[0,1],[-.7071067811865476,.7071067811865476],[.7071067811865476,.7071067811865476],[0,-1],[-.7071067811865476,-.7071067811865476],[.7071067811865476,-.7071067811865476]]){
   const point={x:origin.x+dx*ring*clearance/sx,y:origin.y+dy*ownSide*ring*clearance/sy};if(valid(point)){target=point;break;}
  }
  if(target)v50Spot(p,target);fixed.push(p);
 }
}
kickoff=function(team){
 const m=match,moving=typeof v65WorldActive!=='undefined'&&v65WorldActive&&m?.elapsed>0&&!m.halftimePause,positions=moving?new Map(m.people.map(p=>[p,{x:p.x,y:p.y}])):null;
 const travel=moving&&m.pendingKickoff!=null&&v99Actions.get(m)?.goalTravel,source=moving?(travel?v101GoalBall(travel,v83GoalSceneDuration):v99BallView(m)||m.ball):null;
 if(m){m.setPiece=null;m.rebound=null;v50ClearPenaltyScene()}const result=v50BaseKickoff(team);
 if(typeof v65WorldActive!=='undefined'&&v65WorldActive){const kicker=m.kickoff.kicker,side=team===0?1:-1;kicker.y=.5+side*.65*(v55Field.bottom-v55Field.top)/v160PitchLength();kicker.ty=kicker.y;v119SpaceKickoff(m);}
 if(positions){m.countdown=Math.max(m.countdown,v114RememberRestart(m,m.kickoff,positions));v114KickoffBalls.set(m,{kickoff:m.kickoff,start:{...source,elevation:source.elevation??.29},at:v102Clock(m)})}
 return result;
};
const v50BaseHalftime=beginHalftimeBreak;
beginHalftimeBreak=function(){
 if(!match?.halftimeBreakDone&&typeof v65WorldActive!=='undefined'&&v65WorldActive&&(match.halftimeExtension||0)<20*MATCH_SPEED&&(v15ClearChance(match)||v131DangerousFlight(match)!==null)){match.halftimePending=true;match.halftimeAttackTeam=match.owner?.t??v131DangerousFlight(match);return;}
 // A released ball must settle through its existing native callback even
 // when the attacking-extension cap has expired. Never infer its outcome.
 if(!match?.halftimeBreakDone&&typeof v65WorldActive!=='undefined'&&v65WorldActive&&(match.flight||match.goalPause>0)){match.halftimePending=true;match.next=Infinity;return;}
 if(match?.setPiece){match.halftimePending=true;if(typeof v119PaceActive!=='function'||!v119PaceActive(match))match.elapsed=37.499;return}
 if(!match?.halftimeBreakDone&&typeof v65WorldActive!=='undefined'&&v65WorldActive)match.throwIn=null;
 return v50BaseHalftime();
};
const v50BaseFinish=finishMatch;
finishMatch=function(){if(match?.setPiece){match.fulltimePending=true;return}return v50BaseFinish()};
const v50BaseBeginKickoff=beginKickoff;
beginKickoff=function(){
 if(!match?.kickoff)return v50BaseBeginKickoff();
 if(typeof v65WorldActive!=='undefined'&&v65WorldActive&&!v115KickoffReady(match)){match.kickoff.phase='waiting';match.countdown=Math.max(.1,match.countdown);return;}
 match.kickoff.phase='banner';
 match.postBanner={kind:'kickoff',wait:1.65,visible:true};
 showOverlay('ANPFIFF','Gleich rollt der Ball');
};
function v115KickoffReady(current){
 const restart=current.kickoff,targets=restart&&v114RestartMoves.get(restart);if(!restart)return true;
 if(current.people.some(p=>p.t===0?p.y<.5-.00001:p.y>.5+.00001))return false;
 if(targets&&[...targets].some(([p,t])=>Math.hypot((p.x-t.x)*v160PitchWidth()/(v55Field.right-v55Field.left),(p.y-t.y)*v160PitchLength()/(v55Field.bottom-v55Field.top))>.12))return false;
 return Math.hypot((restart.kicker.x-.5)*v160PitchWidth()/(v55Field.right-v55Field.left),(restart.kicker.y-.5)*v160PitchLength()/(v55Field.bottom-v55Field.top))<.8;
}
const v50BaseStep=step;
step=function(delta,realDelta){
 const m=match;
 const chasePositions=m?.rebound?new Map(m.people.map(player=>[player,{x:player.x,y:player.y}])):null;
 if(m?.fulltimePending&&!m.setPiece&&!m.flight&&!m.throwIn&&m.goalPause<=0&&!m.postBanner){m.kickoff=null;finishMatch();return}
 if(m?.postBanner&&!m.finished){
  const pause=m.postBanner;pause.wait=Math.max(0,pause.wait-realDelta);
  if(pause.visible&&pause.wait<=1){hideOverlay();pause.visible=false}
  if(pause.wait<=0){
   m.postBanner=null;
   if(pause.kind==='kickoff'){if(typeof v65WorldActive!=='undefined'&&v65WorldActive&&!v115KickoffReady(m)){m.kickoff.phase='waiting';m.countdown=.1;return;}v50BaseBeginKickoff();hideOverlay();m.overlayTTL=0}
   else{kickoff(m.pendingKickoff);m.pendingKickoff=null}
  }
  updateTeamStats();return;
 }
 if(m?.goalPause>0&&m.goalPause<=realDelta){
  m.goalPause=0;hideOverlay();m.postBanner={kind:'goal',wait:1,visible:false};updateTeamStats();return;
 }
 if(m?.setPiece&&!m.finished){
  const current=m.setPiece;current.wait=Math.max(0,current.wait-realDelta);
  const targets=typeof v65WorldActive!=='undefined'&&v65WorldActive&&current.type==='corner'&&v114RestartMoves.get(current);
  if(targets&&[...targets].some(([p,t])=>Math.hypot((p.x-t.x)*v160PitchWidth()/(v55Field.right-v55Field.left),(p.y-t.y)*v160PitchLength()/(v55Field.bottom-v55Field.top))>.12))current.wait=Math.max(current.wait,.1);
  if(current.wait<=0){
   if(current.phase==='waiting'&&current.type==='offside'){current.phase='postBanner';current.wait=.75}
   else if(current.phase==='waiting'&&current.type==='freeKick'){current.phase='fading';current.wait=.25;$('#match-overlay').classList.add('fade-out')}
   else if(current.phase==='fading'){current.phase='postBanner';current.wait=.5;hideOverlay();$('#match-overlay').classList.remove('fade-out')}
   else if(current.phase==='waiting'&&current.type!=='penalty'){current.phase='postBanner';current.wait=1;hideOverlay()}
   else if(current.phase==='result')v50FinishPenalty(current);
   else if(current.type==='penalty'){hideOverlay();v50TakePenalty(current)}
   else{m.setPiece=null;hideOverlay();if(current.type==='corner')v50TakeCorner(current);else v50TakeFreeKick(current)}
  }
  updateTeamStats();return;
 }
 const result=v50BaseStep(delta,realDelta);
 if(chasePositions&&m?.rebound&&!m.finished)v50ChaseLooseBall(delta,chasePositions);
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
