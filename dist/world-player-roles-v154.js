'use strict';
// Role assignments belong only to newly generated, explicitly marked worlds.
function v154Active(career){return career?.world?.playerFoundation?.parameterId==='wave3-local-candidate-1';}
function v154Skills(player){return Object.fromEntries(D6PlayerGeneration.SKILL_KEYS.map(k=>[k,player[k]]));}
function v154GenerateRoles(player,created,foundation){
 if(foundation.parameterId!=='wave3-local-candidate-1')return;
 const routine=D6PositionRoutine.createRoutine(player.line,created.playablePositions,foundation.roles.routine);
 const recommendedRoles=D6PlayerRoles.recommendRoles({...created,routine},foundation.roles.suitability);
 player.playerModel.recommendedRoles=recommendedRoles;
 player.playerModel.roleModel={version:154,routine,bestRecommendedRole:D6PlayerRoles.bestRecommendedRole(recommendedRoles,null,created.skills,routine,foundation.roles.suitability),processedFixtures:[]};
}
function v154Zone(cell,keeper=false){return D6TacticTransitions.zoneForPoint({depth:keeper?0:1-(Math.floor(cell/5)+.5)/7,width:keeper?.5:(cell%5+.5)/5,keeper});}
function v154Allowed(state,pid){return D6TacticTransitions.allowedRoles(v154Zone(state.cells?.[pid],state.roles[pid]==='gk'));}
function v154Initialize(career,fixture,state,saved=null){
 if(!v154Active(career))return;
 if(state.playerPerformance)v155SyncPhases(state);
 state.roleAssignments||={};const activeIds=new Set([...state.active,...state.awayActive]);for(const pid of Object.keys(state.roleAssignments))if(!activeIds.has(pid))delete state.roleAssignments[pid];state.roleParameters=career.world.playerFoundation.roles;
 for(const side of [0,1]){
  v64EnsureCells(state,side);
  for(const pid of v64Active(state,side)){
   const player=v64Player(career,fixture,side,pid),allowed=v154Allowed(state,pid),position=state.roles[pid];
   const previous=saved?.[pid]||state.roleAssignments[pid];
   const ranked=allowed.map(roleId=>({roleId,value:D6PlayerRoles.roleSuitability(v154Skills(player),player.playerModel.roleModel.routine[position],roleId,state.roleParameters.suitability)})).sort((a,b)=>b.value-a.value);
   state.roleAssignments[pid]={cell:player.keeper?null:state.cells[pid],position,roleId:allowed.includes(previous?.roleId)?previous.roleId:ranked[0].roleId,orientation:[-1,0,1].includes(previous?.orientation)?previous.orientation:0};
   if(!player.keeper)state.orientation[pid]=state.roleAssignments[pid].orientation;
  }
 }
 if(state.playerPerformance)v155SyncPhases(state);
}
function v154Transition(state,action,random){
 if(!state.roleAssignments)return;
 const source=action.playerId||action.outPlayerId,side=state.active.includes(source)||state.active.includes(action.inPlayerId)?state.active:state.awayActive;
 const assignments=Object.fromEntries([...new Set([...side,source])].filter(pid=>state.roleAssignments[pid]).map(pid=>[pid,state.roleAssignments[pid]]));
 const next=D6TacticTransitions.tacticTransition(action,assignments,state.roleParameters.transitions,random);
 for(const pid of Object.keys(assignments))delete state.roleAssignments[pid];Object.assign(state.roleAssignments,next);
 for(const [pid,a]of Object.entries(state.roleAssignments)){state.orientation[pid]=a.orientation;}
}
function v154SetRole(state,pid,roleId){
 if(!state.roleAssignments?.[pid]||!v154Allowed(state,pid).includes(roleId))throw Error('Diese Rolle passt nicht zur Einsatzzone.');
 if(state.playerPerformance)v155SyncPhases(state);
 state.roleAssignments[pid].roleId=roleId;
 if(state.playerPerformance)v155SyncPhases(state);
}
function v154RoleIntent(player,intent){
 const id=player.tacticalRole;
 if(!id)return null;
 return intent==='wing'?id==='winger':intent==='support'?['playmaker','target-player','ball-winner'].includes(id):intent==='deep'?['poacher','striker','box-to-box','dribbler'].includes(id):intent==='shoot'?['poacher','striker'].includes(id):false;
}
function v154PhysicalAssignment(context,person,side){
 const assignment=context.state.roleAssignments?.[person.pid];if(!assignment)return;
 const player=v64Player(context.career,context.fixture,side,person.pid);
 person.tacticalRole=assignment.roleId;person.positionRoutine=player.playerModel.roleModel.routine[assignment.position]/context.state.roleParameters.routine.cap;
}
function v154KeeperDepthTarget(m,p){
 const f=m.flight,meta=f&&typeof v102Flights!=='undefined'&&v102Flights.get(f);
 if(m.owner||m.rebound||!f||f.team===p.t||meta?.kind!=='pass'||meta.high||v113KeeperReacting(m,p))return null;
 const observed=f.progress*f.duration/MATCH_SPEED,remaining=(1-f.progress)*f.duration/MATCH_SPEED;
 if(!(observed>0&&remaining>0))return null;
 // Extrapolate only the ground ball already observed, never a future result or receiver.
 const vx=(m.ball.x-f.x)/observed,vy=(m.ball.y-f.y)/observed,dir=p.t===0?-1:1;
 if(!Number.isFinite(vx)||!Number.isFinite(vy)||vy*dir>=0)return null;
 const delay=Math.max(0,v150Delay(p)-observed),s=v150Scale();
 for(let i=1;i<=12;i++){
  const time=remaining*i/12,point={x:m.ball.x+vx*time,y:m.ball.y+vy*time};
  if(m.people.some(q=>q!==p&&!q.keeper&&!q.slideActive&&Math.max(0,v150Delay(q)-observed)+Math.max(0,v122Metres(q,point)-.8)/v150Pace(q)<=time))return null;
  if(point.x<v55Field.left||point.x>v55Field.right||point.y<v55Field.top||point.y>v55Field.bottom||!v150KeeperArea(p,point)||(point.y-p.y)*dir*s.y<=.8)continue;
  const arrival=delay+Math.max(0,v122Metres(p,point)-.8)/v150Pace(p);
  if(arrival>time)continue;
  return point;
 }
 return null;
}
function v154DribbleLane(m,p,point){
 return m.people.every(q=>q.t===p.t||(()=>{const lane=passLaneGeometry(q,p,point);return v122Metres(q,point)>2.1&&(!lane||v122Metres(q,lane)>1.5);})());
}
function v154TryDribble(m,p,allies,rivals){
 if(p.tacticalRole!=='dribbler'||m.owner!==p||p.keeper||p.slideActive||m.flight||m.rebound||v121PositioningPaused(m))return false;
 const s=v150Scale(),dir=p.t===0?-1:1,near=rivals.filter(q=>!q.keeper&&v122Metres(p,q)<6);
 if(near.length!==1||v122Metres(p,near[0])<2.3||(near[0].y-p.y)*dir<=0||Math.abs(near[0].x-p.x)*s.x>2.1)return false;
 const offside=allies.length?v55OffsideSnapshot(p).offside:new Set();
 // Keep clearly useful, reachable passes ahead of the isolated duel.
 if(allies.some(q=>!q.slideActive&&!offside.has(q)&&v122Metres(p,q)>=3&&v122Metres(p,q)<=18&&((q.y-p.y)*dir*s.y>=5||v115GoalDistance(q)<=18&&v115GoalDistance(q)<v115GoalDistance(p)-3)&&rivals.every(r=>{const lane=passLaneGeometry(r,m.ball,q);return r.keeper||v122Metres(r,q)>2&&(!lane||v122Metres(r,lane)>1.5);})))return false;
 const options=[-3,3].map(side=>({x:p.x+side/s.x,y:p.y+dir*4/s.y})).filter(point=>point.x>=v55Field.left+1/s.x&&point.x<=v55Field.right-1/s.x&&point.y>=v55Field.top+1.4/s.y&&point.y<=v55Field.bottom-1.4/s.y&&v154DribbleLane(m,p,point));
 options.sort((a,b)=>Math.min(...rivals.map(q=>v122Metres(q,b)))-Math.min(...rivals.map(q=>v122Metres(q,a))));
 if(!options.length)return false;
 p.roleDribble={...options[0],until:m.elapsed/MATCH_SPEED+.32};m.next=m.elapsed+.32*MATCH_SPEED;
 return true;
}
function v154RoleTarget(m,p,dt){
 if(p.roleDribble&&(p.tacticalRole!=='dribbler'||m.owner!==p||v121PositioningPaused(m)||p.slideActive))delete p.roleDribble;
 if(!p.tacticalRole||v121PositioningPaused(m)||p.slideActive)return;
 const owner=m.owner,team=v123PossessionTeam(m),dir=p.t===0?-1:1,s=v150Scale(),r=p.tacticalRole,attacking=team===p.t;
 if(p.keeper){
  if(r==='sweeper-keeper'&&attacking&&owner&&!owner.keeper&&!v113KeeperReacting(m,p)){p.ty=clamp(p.by+dir*Math.min(5/s.y,Math.abs(owner.y-p.by)*.12),v55Field.top+.04,v55Field.bottom-.04);}
  if(r==='sweeper-keeper'&&!attacking){const point=v154KeeperDepthTarget(m,p);if(point){p.tx=point.x;p.ty=point.y;}}
  return;
 }
 if(p===owner&&p.roleDribble){
  if(p.roleDribble.until>=m.elapsed/MATCH_SPEED&&v154DribbleLane(m,p,p.roleDribble)){p.tx=p.roleDribble.x;p.ty=p.roleDribble.y;}
  else delete p.roleDribble;
 }
 if(owner&&p!==owner&&attacking){
  if(r==='winger')p.tx=clamp(p.bx<.5?v55Field.left+3/s.x:v55Field.right-3/s.x,v55Field.left+.02,v55Field.right-.02);
  if(r==='target-player'){p.tx=clamp(owner.x+(p.bx<.5?-3:3)/s.x,v55Field.left+.03,v55Field.right-.03);p.ty=clamp(owner.y+dir*5/s.y,v55Field.top+.04,v55Field.bottom-.04);}
  if(r==='ball-winner'){p.ty=clamp(owner.y-dir*8/s.y,p.by-6/s.y,p.by+6/s.y);p.tx=clamp(owner.x,v55Field.left+.08,v55Field.right-.08);}
  if(r==='ball-playing-defender'){p.tx=clamp(owner.x+(p.bx<.5?-6:6)/s.x,v55Field.left+.04,v55Field.right-.04);}
  const limit=v121PositioningPlans.get(m)?.get(p)?.limit;if(limit!=null)p.ty=p.t===0?Math.max(p.ty,limit):Math.min(p.ty,limit);
 }
 if(owner&&!attacking&&!owner.keeper){
  const covering=m.people.some(q=>q.t===p.t&&q!==p&&!q.keeper&&(q.y-owner.y)*dir<0&&v122Metres(q,owner)<12);
  if(r==='stopper'&&covering&&v122Metres(p,owner)<10){p.tx=owner.x;p.ty=owner.y-dir*.7/s.y;}
  if(r==='ball-winner'&&v122Metres(p,owner)>6){p.tx=clamp(owner.x,v55Field.left+.05,v55Field.right-.05);p.ty=clamp(owner.y-dir*5/s.y,p.by-5/s.y,p.by+5/s.y);}
  if(r==='poacher'){
   const orientation=p.role===-1?-1:p.role===1?1:0,back=orientation<0?6:orientation>0?0:2;
   p.tx=p.bx;p.ty=clamp(p.by-dir*back/s.y,v55Field.top+.04,v55Field.bottom-.04);
   if(v122Metres(p,owner)<(orientation<0?10:orientation>0?2.3:6)){p.tx=owner.x;p.ty=clamp(owner.y-dir*.8/s.y,p.by-6/s.y,p.by+6/s.y);}
  }
  if(r==='striker'&&covering&&v122Metres(p,owner)<12){p.tx=owner.x;p.ty=owner.y-dir*.8/s.y;}
 }
 // Familiarity affects anticipation/coordination, never a permanent skill.
 if(!p.roleCoordTarget)p.roleCoordTarget={x:p.tx,y:p.ty};
 const blend=Math.min(1,Math.max(0,dt)*(2+4*clamp(p.positionRoutine||0,0,1)));
 p.roleCoordTarget.x+=(p.tx-p.roleCoordTarget.x)*blend;p.roleCoordTarget.y+=(p.ty-p.roleCoordTarget.y)*blend;
 if(!p.interceptTarget&&p!==owner){p.tx=p.roleCoordTarget.x;p.ty=p.roleCoordTarget.y;}
}
if(typeof window==='object')window.D6WorldRoles={active:v154Active,setRole:v154SetRole};
