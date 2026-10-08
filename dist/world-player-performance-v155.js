'use strict';
// Both match adapters emit resolved actions. Intent plans never earn credit.
function v155Initialize(career,state){
 if(!v154Active(career))return;
 state.playerPerformance={version:155,parameters:career.world.playerFoundation.ratings,events:[],phases:{},sequence:0};
 v155SyncPhases(state);
}
function v155SyncPhases(state){
 const ledger=state.playerPerformance;if(!ledger)return;
 const current=new Set([...state.active,...state.awayActive]);
 for(const [pid,phases]of Object.entries(ledger.phases))if(!current.has(pid)&&phases.length)phases.at(-1).endMinute=Math.min(phases.at(-1).endMinute,state.minute);
 for(const pid of current){
  const a=state.roleAssignments[pid],phases=ledger.phases[pid]||=[];if(!a)continue;
  const last=phases.at(-1);
  if(!last||last.position!==a.position||last.roleId!==a.roleId||last.orientation!==a.orientation){if(last)last.endMinute=state.minute;const next={startMinute:state.minute,endMinute:state.minute,position:a.position,roleId:a.roleId,orientation:a.orientation};if(last&&last.startMinute===state.minute)phases[phases.length-1]=next;else phases.push(next);}
  else last.endMinute=state.minute;
 }
}
function v155Event(state,pid,type,success,context={}){
 const ledger=state.playerPerformance;if(!ledger)return;
 ledger.events.push({id:`${state.fixtureId}:${++ledger.sequence}`,minute:state.minute,playerId:pid,type,success,context});
}
function v155PassContext(m,p,q){
 const pressure=Math.max(0,1-Math.min(6,...m.people.filter(r=>r.t!==p.t&&!r.keeper).map(r=>v122Metres(p,r)))/6),dir=p.t===0?-1:1;
 const progressMetres=(q.y-p.y)*dir*v150Scale().y;
 const blocked=m.people.filter(r=>r.t!==p.t&&!r.keeper).some(r=>{const g=passLaneGeometry(r,p,q);return g&&v122Metres(r,g)<1.5;});
 return {difficulty:clamp(v122Metres(p,q)/30+pressure*.3+(blocked?.25:0),0,1),usefulness:clamp(Math.max(0,progressMetres)/12,0,1),progressMetres,pressure,repeatKey:`pass:${p.pid}:${q.pid||`space:${Math.round(q.x*10)}:${Math.round(q.y*10)}`}`,errorAttribution:false};
}
function v155AttemptPass(m,p,q){
 if(!v65WorldActive?.state.playerPerformance)return;
 m.performancePasses||={};m.performancePasses[p.pid]={receiverId:q.pid||null,from:{x:p.x,y:p.y},context:v155PassContext(m,p,q)};
}
function v155ReceiveContext(m,receiver,attempt){
 const pressure=Math.max(0,1-Math.min(6,...m.people.filter(p=>p.t!==receiver.t&&!p.keeper).map(p=>v122Metres(receiver,p)))/6);
 if(!attempt.from)return {pressure};
 const progressMetres=(receiver.y-attempt.from.y)*(receiver.t===0?-1:1)*v150Scale().y;
 return {pressure,progressMetres,usefulness:clamp(Math.max(0,progressMetres)/12,0,1)};
}
function v155BeforeNative(m){
 if(!v65WorldActive?.state.playerPerformance)return;
 m.performanceObservation||={previous:{},anchors:{},lastMinute:-1};
 const obs=m.performanceObservation;
 for(const p of m.people){if(!obs.previous[p.pid])obs.previous[p.pid]={...p.stats};if(!obs.anchors[p.pid])obs.anchors[p.pid]={x:p.x,y:p.y,owner:m.owner?.pid||null};}
}
function v155ObserveNative(context){
 const state=context.state,m=match,ledger=state.playerPerformance,obs=m?.performanceObservation;if(!ledger||!obs)return;
 v155SyncPhases(state);
 obs.pendingIntercepts||={};obs.pendingShots||={};
 for(const p of [...m.people,...m.exitedPeople]){
  const prev=obs.previous[p.pid]||p.stats,diff=k=>Math.max(0,(p.stats[k]||0)-(prev[k]||0)),attempt=m.performancePasses?.[p.pid];
  if(diff('passLost')&&attempt)attempt.lost=true;
  if(diff('interceptions'))obs.pendingIntercepts[p.pid]=true;
  if(diff('shots'))obs.pendingShots[p.pid]={onTargetBefore:prev.onTarget||0,context:{difficulty:clamp(Math.abs(p.y-(p.t===0?v55Field.top:v55Field.bottom))*v150Scale().y/25,0,1)}};
  for(const [key,type,success]of [['passComplete','pass',true],['tacklesWon','tackle',true],['saves','save',true]]){
   for(let n=0;n<diff(key);n++){
    let c={};if(type==='pass'&&attempt)c=attempt.context;
    if(type==='save')c={usefulness:1};
    v155Event(state,p.pid,type,success,c);
    if(type==='pass'&&attempt){const receiver=m.lastPass?.passer?.pid===p.pid?m.lastPass.receiver:m.owner?.t===p.t&&m.owner?.pid!==p.pid?m.owner:null;if(receiver)v155Event(state,receiver.pid,'receive',true,v155ReceiveContext(m,receiver,attempt));delete m.performancePasses[p.pid];}
   }
  }
  obs.previous[p.pid]={...p.stats};
  if(attempt?.lost&&!m.flight){v155Event(state,p.pid,'pass',false,attempt.context);delete m.performancePasses[p.pid];}
  if(obs.pendingIntercepts[p.pid]&&m.owner===p){v155Event(state,p.pid,'interception',true,{usefulness:.65});delete obs.pendingIntercepts[p.pid];}
  else if(!m.flight)delete obs.pendingIntercepts[p.pid];
  const shot=obs.pendingShots[p.pid];if(shot&&!m.flight){const onTarget=p.stats.onTarget>shot.onTargetBefore;v155Event(state,p.pid,'shot',onTarget,{...shot.context,usefulness:onTarget?1:.25});delete obs.pendingShots[p.pid];}
 }
 // Short, bounded observations of actual movement and actually open lanes.
 if(state.minute<obs.lastMinute+2)return;obs.lastMinute=state.minute;
 const owner=m.owner,team=v123PossessionTeam(m);
 for(const p of m.people){
  const anchor=obs.anchors[p.pid],travel=anchor?v122Metres(anchor,p):0,dir=p.t===0?-1:1;
  if(owner&&!p.keeper&&travel>=1.5&&!v121PositioningPaused(m)){
   if(p===owner&&anchor?.owner===p.pid){const gain=(p.y-anchor.y)*dir*v150Scale().y;if(gain>2)v155Event(state,p.pid,'carry',true,{progressMetres:gain,usefulness:clamp(gain/8,0,1)});}
   else if(team===p.t&&p!==owner&&v122Metres(owner,p)<18){const c=v155PassContext(m,owner,p);if(c.difficulty<.8&&c.usefulness>.2)v155Event(state,p.pid,'support-run',true,{...c,repeatKey:`offer:${p.pid}:${Math.floor(state.minute/6)}`});}
   else if(team!==p.t&&owner&&!owner.keeper){const rival=m.people.find(q=>q.t!==p.t&&q!==owner&&!q.keeper&&(q.y-owner.y)*-dir>0),lane=rival&&passLaneGeometry(p,owner,rival);if(lane&&v122Metres(p,lane)<2)v155Event(state,p.pid,'cover',true,{usefulness:.6,repeatKey:`cover:${p.pid}:${Math.floor(state.minute/6)}`});}
  }
  obs.anchors[p.pid]={x:p.x,y:p.y,owner:owner?.pid||null};
 }
}
function v155CompactPoint(state,pid,side){
 if(state.playerLoad)return v158CompactPoint(state,pid,side);
 const cell=state.cells[pid],keeper=state.roles[pid]==='gk',x=keeper?.5:(cell%5+.5)/5,y=keeper?.93:(Math.floor(cell/5)+.5)/7;
 return {x:(side?1-x:x)*44,y:(side?1-y:y)*68};
}
function v155CompactActions(career,fixture,state,side,random){
 const attackers=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk'),rivals=v64Active(state,1-side),scorer=v64PickAttacker(attackers,pid=>1+(['poacher','striker'].includes(state.roleAssignments[pid].roleId)?1:0),random);
 const helper=v64PickAttacker(attackers.filter(pid=>pid!==scorer),pid=>1+(['playmaker','winger','target-player'].includes(state.roleAssignments[pid].roleId)?1:0),random);
 const p=v64Player(career,fixture,side,helper),q=v64Player(career,fixture,side,scorer),defender=rivals.filter(pid=>state.roles[pid]!=='gk')[Math.floor(random()*5)];
 if(state.playerLoad)v158CompactOffers(career,fixture,state,side,scorer,helper);
 const from=v155CompactPoint(state,helper,side),to=v155CompactPoint(state,scorer,side),opponents=rivals.map(pid=>({pid,point:v155CompactPoint(state,pid,1-side)})),range=Math.hypot(to.x-from.x,to.y-from.y),nearest=Math.min(...opponents.map(o=>Math.hypot(o.point.x-from.x,o.point.y-from.y)));
 const pressure=clamp(1-nearest/8,0,1),receiverPressure=clamp(1-Math.min(...opponents.map(o=>Math.hypot(o.point.x-to.x,o.point.y-to.y)))/8,0,1),progressMetres=(to.y-from.y)*(side?1:-1),difficulty=clamp(range/35+pressure*.3,0,1),context={difficulty,pressure,progressMetres,usefulness:clamp(Math.max(0,progressMetres)/12,0,1),repeatKey:`pass:${helper}:${scorer}`,errorAttribution:false};
 const passing=state.playerLoad?v158Ability(p,'pas',state,pressure>0):p.pas,finishing=state.playerLoad?v158Ability(q,'fin',state,receiverPressure>0):q.fin;
 const complete=random()<clamp(.77+(passing-10)*.009-pressure*.16,.4,.94);
 v155Event(state,helper,'pass',complete,context);
 if(!complete){v155Event(state,defender,'interception',true,{difficulty,usefulness:.65});return false;}
 v155Event(state,scorer,'receive',true,{difficulty:receiverPressure,usefulness:context.usefulness,pressure:receiverPressure});
 if(state.playerLoad&&v158CompactContact(career,fixture,state,side,scorer,random))return false;
 // Compact actions are resolved abstract actions, not reconstructed 3D runs.
 // No credit for support/cover unless that action was actually simulated.
 if(random()>.22)return false;
 state.stats[scorer].shots++;
 const goalPoint={x:22,y:side?68:0},shotDistance=Math.hypot(to.x-goalPoint.x,to.y-goalPoint.y),shotDifficulty=clamp(shotDistance/35+receiverPressure*.3+Math.abs(to.x-goalPoint.x)/22*.15,0,1);
 const keeper=rivals.find(pid=>state.roles[pid]==='gk'),k=v64Player(career,fixture,1-side,keeper),onTarget=random()<clamp(.48+(finishing-10)*.013-receiverPressure*.13,.25,.8);
 // New candidate shots specify their placement before the keeper outcome.
 if(state.playerLoad){const height=.29+random()*2.3,lateral=(random()-.5)*5.5;v158CompactKeeper(career,fixture,state,1-side,keeper,`${fixture.id}:compact-shot:${scorer}:${state.stats[scorer].shots}`,onTarget,height,Math.abs(lateral));}
 const keeping=state.playerLoad?v158Ability(k,'gk',state,false):k.gk,goal=onTarget&&random()<clamp(.27+(finishing-keeping)*.012-shotDifficulty*.08,.08,.48);
 v155Event(state,scorer,'shot',onTarget,{difficulty:shotDifficulty,usefulness:onTarget?1:.25,pressure:receiverPressure});
 // The abstract result has no observed shot placement, pace or keeper reach.
 // A successful save is known; its difficulty is deliberately not invented.
 if(onTarget&&!goal)v155Event(state,keeper,'save',true,{usefulness:1});
 if(!goal)return false;
 state.score[side]++;state.stats[scorer].goals++;state.stats[helper].assists++;state.events.push({minute:state.minute,type:'goal',side,scorerPid:scorer,assistPid:helper});return true;
}
function v155Rated(career,fixture,state,pid){
 const ledger=state.playerPerformance;if(!ledger)return null;
 return D6MatchRatings.rateAppearance({playerId:pid,fixtureId:fixture.id,worldId:career.world.seed,seasonId:career.world.season,virtualMinutes:state.minutes[pid]||0,rolePositionPhases:(ledger.phases[pid]||[]).filter(p=>p.endMinute>p.startMinute),actualEvents:ledger.events.filter(e=>e.playerId===pid)},ledger.parameters);
}
function v155Book(career,fixture,state,player){
 const rated=v155Rated(career,fixture,state,player.pid);if(!rated||rated.status!=='rated')return null;
 const roleModel=player.playerModel.roleModel;if(roleModel.processedFixtures.includes(fixture.id))return rated;
 const minutes={};for(const phase of state.playerPerformance.phases[player.pid]||[])minutes[phase.position]=(minutes[phase.position]||0)+phase.endMinute-phase.startMinute;
 const routine=D6PositionRoutine.routineTransition(roleModel.routine,minutes,career.world.playerFoundation.roles.routine);
 const change=v153ApplyAppearance(career,player,{id:rated.id,worldId:rated.worldId,seasonId:rated.seasonId,minutes:rated.minutes,rating:rated.rating,skillWeights:rated.skillWeights},rated.skillWeights);
 if(!['applied','no-change','duplicate'].includes(change.status))throw Error('Leistungsdaten fehlen. Der Einsatz konnte nicht verbucht werden.');
 roleModel.routine=routine;roleModel.processedFixtures.push(fixture.id);
 roleModel.bestRecommendedRole=D6PlayerRoles.bestRecommendedRole(player.playerModel.recommendedRoles,roleModel.bestRecommendedRole,v154Skills(player),routine,career.world.playerFoundation.roles.suitability);
 return rated;
}
