'use strict';

// Bounded native football iteration. Only future marked matches allocate these
// plain intentions; actual contacts, execution errors and P02 remain authoritative.
function v159Active(m){return Boolean(typeof v157Active==='function'&&v157Active(m)&&m.attackFlow.flowVersion===159);}
function v159Rivals(m,p){return m.people.filter(q=>q.t!==p.t&&!q.keeper&&!q.slideActive);}
function v159Cover(p){return p.role<0||['ball-winner','ball-playing-defender'].includes(p.tacticalRole)||(p.assignedLine||p.line)==='def'&&p.role<=0;}
function v159Point(point,s,margin=1.4){return {x:clamp(point.x,v55Field.left+margin/s.x,v55Field.right-margin/s.x),y:clamp(point.y,v55Field.top+margin/s.y,v55Field.bottom-margin/s.y)};}
function v162Zone(m,p){
 const s=v150Scale(),plan=v121PositioningPlans.get(m)?.get(p),line=p.assignedLine||p.line,attacking=v123PossessionTeam(m)===p.t,dir=p.t===0?-1:1;
 // Read the current formation/defensive line, so a tactical change immediately
 // changes the home zone. The ball shifts it modestly rather than replacing it.
 if(line==='def'&&plan?.x!=null)return{x:plan.x,y:plan.y};
 const depth=line==='att'?8:line==='mid'?6:3;
 const x=p.tacticalRole==='winger'?p.bx<.5?v55Field.left+3/s.x:v55Field.right-3/s.x:p.bx+clamp((m.ball.x-.5)*.12,-3/s.x,3/s.x);
 return v159Point({x,y:p.by+dir*(attacking?2+p.role*1.5:-2)/s.y+clamp((m.ball.y-p.by)*.18,-depth/s.y,depth/s.y)},s,.5);
}
function v162RecoverTarget(m,p,dt){
 if(!v162Active(m)||p===m.owner||p.keeper||p.slideActive||v121PositioningPaused(m)||p.interceptTarget&&m.flight)return false;
 // A target player is already making the role's carrier-relative outlet,
 // including keeper build-up. Preserve that active purpose until ownership ends.
 if(p.tacticalRole==='target-player'&&m.owner?.t===p.t){
  const limit=v121PositioningPlans.get(m)?.get(p)?.limit;if(limit!=null)p.ty=p.t===0?Math.max(p.ty,limit):Math.min(p.ty,limit);
  return true;
 }
 // Keep the existing actual loose-ball chasers and incoming receivers free.
 if(m.rebound&&typeof v132FallingBallTarget==='function'&&v132FallingBallTarget(m,p))return true;
 if(m.flight){const runners=m.people.filter(q=>q.t===p.t&&!q.keeper&&!q.slideActive).sort((a,b)=>v122Metres(a,m.ball)-v122Metres(b,m.ball)||a.n-b.n).slice(0,2);if(runners.includes(p))return false;}
 const zone=v162Zone(m,p),s=v150Scale(),dx=(p.tx-zone.x)*s.x,dy=(p.ty-zone.y)*s.y,gap=Math.hypot(dx,dy),reach=(p.assignedLine||p.line)==='att'?5:3.5;
 const weight=.28*Math.min(1,reach/Math.max(.001,gap)),target={x:zone.x+dx*weight/s.x,y:zone.y+dy*weight/s.y};
 const last=p.offenseCoord||(p.offenseCoord={x:p.tx,y:p.ty}),blend=Math.min(1,Math.max(0,dt)*(4+4*clamp(p.positionRoutine??.7,0,1)));
 last.x+=(target.x-last.x)*blend;last.y+=(target.y-last.y)*blend;p.tx=last.x;p.ty=last.y;
 const limit=v121PositioningPlans.get(m)?.get(p)?.limit;if(limit!=null)p.ty=p.t===0?Math.max(p.ty,limit):Math.min(p.ty,limit);
 return true;
}
function v159Contact(m,p,point){
 if(!v159Active(m)||m.owner!==p||p.keeper||v121PositioningPaused(m)||v122Metres(p,point)>.8)return false;
 const combo=m.attackFlow.combination,pass=m.lastPass;
 // An intended receiver is not a received pass. Native lastPass is recorded
 // only after its real legal contact, including an actual direct-touch chance.
 if(!combo||combo.confirmed||combo.receiverId!==p.pid||pass?.receiver!==p||pass.passer?.pid!==combo.passerId||pass.at<combo.releaseAt*MATCH_SPEED)return false;
 combo.confirmed=true;combo.receivedAt=v152Seconds(m);combo.contact={x:point.x,y:point.y};combo.until=combo.receivedAt+1.65;
 return true;
}
function v159AfterPass(m,p,q){
 if(!v159Active(m)||!q?.pid)return;
 const combo=m.attackFlow.combination;
 if(combo){combo.releaseAt=v152Seconds(m);combo.confirmed=false;combo.until=combo.releaseAt+3.2;}
}
function v159Follow(m,p,q){
 if(!v159Active(m)||p.keeper||v159Cover(p)||v121PositioningPaused(m))return;
 const s=v150Scale(),dir=p.t===0?-1:1,side=p.x<q.x?-1:1,rivals=v159Rivals(m,p);
 const choices=[2.5,4,-2.5].map(lateral=>v159Point({x:p.x+side*lateral/s.x,y:p.y+dir*6.5/s.y},s));
 const score=point=>Math.min(10,...rivals.map(r=>v122Metres(r,point)))-Math.max(0,3-v122Metres(q,point))*2-v122Metres(p,point)*.07;
 choices.sort((a,b)=>score(b)-score(a));
 m.attackFlow.intents[p.pid]={...choices[0],type:'follow',team:p.t,until:v152Seconds(m)+2.2};
 if(v162Active(m))(m.attackFlow.paceRecovery||(m.attackFlow.paceRecovery={}))[p.pid]=v152Seconds(m)+3.05;
}
function v159Offers(m,owner,allies,rivals){
 if(!v159Active(m))return false;
 const flow=m.attackFlow,now=v152Seconds(m),s=v150Scale(),dir=owner.t===0?-1:1,quick=v162Active(m);
 const valid=flow.offerOwner===owner.pid&&flow.offerUntil>now;
 if(valid){
  const offers=Object.entries(flow.intents).filter(([,i])=>i.type!=='follow');
  const crowded=offers.some(([pid,i])=>now>(i.at||0)+.45&&rivals.some(r=>v122Metres(r,i)<1.1)&&v122Metres(m.people.find(p=>p.pid===pid)||i,i)>1.5);
  const reached=offers.length&&offers.every(([pid,i])=>v122Metres(m.people.find(p=>p.pid===pid)||i,i)<.65);
  if(!crowded&&!reached)return true;
 }
 // A runner commits to a destination rather than shifting lanes whenever the
 // carrier moves. A changed owner, reached run, crowding or timeout reconsiders.
 if(quick){
  const recovery=flow.paceRecovery||(flow.paceRecovery={});
  for(const id of Object.keys(recovery))if(recovery[id]<=now||!m.people.some(p=>p.pid===id))delete recovery[id];
  for(const id of flow.paceOffers||[])if(id!==owner.pid&&flow.intents[id]?.type!=='follow')recovery[id]=now+(v119PaceActive(m)?.55:.85);
 }
 flow.offerOwner=owner.pid;flow.offerUntil=now+(v119PaceActive(m)?1.05:1.35);
 flow.intents=Object.fromEntries(Object.entries(flow.intents).filter(([pid,i])=>i.type==='follow'&&i.until>now&&m.people.some(p=>p.pid===pid&&!p.slideActive)));
 const occupied=Object.values(flow.intents),runners=allies.filter(p=>!hasInstruction(p,'support')&&!v159Cover(p)&&!['target-player'].includes(p.tacticalRole)&&(p.assignedLine||p.line)!=='def'&&(!quick||!(flow.paceRecovery[p.pid]>now)))
  .sort((a,b)=>(hasInstruction(b,'deep')?4:0)+((b.assignedLine||b.line)==='att'?2:0)+b.role*.4-((hasInstruction(a,'deep')?4:0)+((a.assignedLine||a.line)==='att'?2:0)+a.role*.4)||a.n-b.n);
 for(const p of runners.slice(0,quick&&allies.length<5?1:2)){
  if(flow.intents[p.pid])continue;
  const side=p.bx<.5?-1:1,lead=(hasInstruction(p,'deep')?8:6.5)+ability(p,'pos')*.07;
  const targets=[{x:p.x+side*3.5/s.x,y:owner.y+dir*lead/s.y},{x:owner.x+side*7/s.x,y:owner.y+dir*lead/s.y},{x:p.x-side*3.5/s.x,y:owner.y+dir*(lead+1)/s.y}].map(point=>v159Point(point,s));
  const score=point=>Math.min(10,...rivals.map(r=>v122Metres(r,point)))-v122Metres(p,point)*.15-occupied.reduce((n,i)=>n+Math.max(0,4-v122Metres(i,point))*2.5,0)+(v157Lane(m,owner,point,rivals,1.25)?1.2:0)-(quick?Math.max(0,v122Metres(v162Zone(m,p),point)-10)*.12:0);
  targets.sort((a,b)=>score(b)-score(a));flow.intents[p.pid]={...targets[0],type:'depth',team:p.t,at:now,until:flow.offerUntil};occupied.push(targets[0]);
 }
 const support=allies.filter(p=>!flow.intents[p.pid]&&!v159Cover(p)&&(hasInstruction(p,'support')||(p.assignedLine||p.line)==='mid')&&(!quick||!(flow.paceRecovery[p.pid]>now))).sort((a,b)=>v122Metres(a,owner)-v122Metres(b,owner)||a.n-b.n)[0];
 if(support){
  const side=support.bx<.5?-1:1,targets=[5.5,-5.5].map(lateral=>v159Point({x:owner.x+side*lateral/s.x,y:owner.y-dir*2/s.y},s));
  const score=point=>Math.min(8,...rivals.map(r=>v122Metres(r,point)))-v122Metres(support,point)*.1+(v157Lane(m,owner,point,rivals)?1:0);
  targets.sort((a,b)=>score(b)-score(a));flow.intents[support.pid]={...targets[0],type:'support',team:support.t,at:now,until:flow.offerUntil};
 }
 if(quick)flow.paceOffers=Object.entries(flow.intents).filter(([,i])=>i.type!=='follow').map(([id])=>id);
 return true;
}
function v159ReceivePlan(m,p,point){
 if(!v159Active(m)||m.owner!==p||p.keeper||v121PositioningPaused(m)||v122Metres(p,point)>.8)return null;
 v159Contact(m,p,point);
 const now=v152Seconds(m),flow=m.attackFlow,existing=flow.receipt;
 if(existing?.playerId===p.pid&&existing.at===now)return existing;
 const s=v150Scale(),body=v157Body(p),rivals=v159Rivals(m,p),dir=p.t===0?-1:1,technique=ability(p,'tec'),speed=Math.hypot(body.vx,body.vy);
 const options=[0,-.55,.55,-1.05,1.05].map(turn=>{
  const angle=body.heading+turn,direction={x:Math.sin(angle),y:Math.cos(angle)},target=v159Point({x:p.x+direction.x*1.6/s.x,y:p.y+direction.y*1.6/s.y},s,.4);
  const space=Math.min(7,...rivals.map(r=>v122Metres(r,target))),progress=direction.y*dir,blocked=rivals.some(r=>{const lane=passLaneGeometry(r,point,target);return lane&&v122Metres(r,lane)<.65;});
  return{direction,turn,score:space+progress*.8-Math.abs(turn)*.6-(blocked?2.5:0)};
 }).sort((a,b)=>b.score-a.score),choice=options[0],pressure=rivals.filter(r=>v122Metres(r,p)<2.5).length;
 const duration=clamp(.14+(20-technique)*.009+Math.abs(choice.turn)*.05+Math.min(2,pressure)*.025+(typeof v158ReactionLoss==='function'?v158ReactionLoss(p):0),.14,.48);
 const receipt={playerId:p.pid,at:now,readyAt:now+duration,until:now+.5,start:{x:point.x,y:point.y},direction:choice.direction,lead:.35+(20-technique)*.022+Math.min(.18,speed*.035)};
 flow.receipt=receipt;m.next=Math.max(m.elapsed,receipt.readyAt*MATCH_SPEED);return receipt;
}
function v159OwnedBall(m,p){
 if(!v159Active(m)||p.keeper||v121PositioningPaused(m))return null;
 const touch=m.attackFlow.receipt,now=v152Seconds(m);if(touch?.playerId!==p.pid||now<touch.at||now-touch.at>=.30)return null;
 const s=v150Scale(),dir=v123ControlDirection(p),lead=.52+(1-ability(p,'tec')/20)*.20,q=clamp((now-touch.at)/.30,0,1),blend=q*q*(3-2*q);
 const dx=touch.direction.x*touch.lead*(1-blend)+dir.x*lead*blend,dy=touch.direction.y*touch.lead*(1-blend)+dir.y*lead*blend;
 const end={x:p.x+dx/s.x,y:p.y+dy/s.y};return{x:touch.start.x+(end.x-touch.start.x)*blend,y:touch.start.y+(end.y-touch.start.y)*blend};
}
function v159CarrierTarget(m,p){
 if(!v159Active(m)||p!==m.owner||m.attackFlow.pendingTurn||v121PositioningPaused(m))return false;
 const receipt=m.attackFlow.receipt,carry=m.attackFlow.carry,now=v152Seconds(m),s=v150Scale();
 if(receipt?.playerId===p.pid&&now>=receipt.at&&now<=receipt.until){p.tx=p.x+receipt.direction.x*1.4/s.x;p.ty=p.y+receipt.direction.y*1.4/s.y;return true;}
 if(carry?.playerId!==p.pid||carry.until<now)return false;
 const dx=(carry.target.x-p.x)*s.x,dy=(carry.target.y-p.y)*s.y,gap=Math.hypot(dx,dy)||1;p.tx=p.x+dx/gap*2/s.x;p.ty=p.y+dy/gap*2/s.y;return true;
}
function v159Prepare(m){
 if(!v159Active(m))return;
 const flow=m.attackFlow,now=v152Seconds(m);
 if(v121PositioningPaused(m)){delete flow.receipt;delete flow.carry;delete flow.defenseReads;delete flow.offerOwner;delete flow.offerUntil;if(v162Active(m)){delete flow.paceOffers;delete flow.paceRecovery;}return;}
 const receipt=flow.receipt;
 if(receipt&&(receipt.playerId!==m.owner?.pid||!m.people.some(p=>p.pid===receipt.playerId)||receipt.until<now))delete flow.receipt;
 else if(receipt&&now<receipt.readyAt)m.next=Math.max(m.next||0,receipt.readyAt*MATCH_SPEED);
 if(flow.carry&&(flow.carry.playerId!==m.owner?.pid||flow.carry.until<now))delete flow.carry;
 if(flow.defenseReads)for(const id of Object.keys(flow.defenseReads))if(!m.people.some(p=>p.pid===id&&!p.slideActive))delete flow.defenseReads[id];
 const combo=flow.combination;
 if(combo?.confirmed&&m.owner?.pid===combo.receiverId){
  const passer=m.people.find(p=>p.pid===combo.passerId),receiver=m.owner;
  if(passer&&!v159Cover(passer)&&!flow.intents[passer.pid])v159Follow(m,passer,receiver);
 }
}
function v159Decide(m,p){
 if(!v159Active(m))return false;
 const receipt=m.attackFlow.receipt;if(receipt?.playerId===p.pid&&v152Seconds(m)<receipt.readyAt){m.next=receipt.readyAt*MATCH_SPEED;return true;}
 const range=v115GoalDistance(p),rivals=v159Rivals(m,p),s=v150Scale(),goal={x:.5,y:p.t===0?v55Field.top:v55Field.bottom},line=p.assignedLine||p.line;
 if(p===m.owner&&line==='att'&&!v159Cover(p)&&range>12&&range<30){
  const dx=(goal.x-p.x)*s.x,dy=(goal.y-p.y)*s.y,gap=Math.hypot(dx,dy)||1,probe=v159Point({x:p.x+dx/gap*5/s.x,y:p.y+dy/gap*5/s.y},s,.5);
  const blocked=rivals.some(r=>{const lane=passLaneGeometry(r,p,probe);return v122Metres(r,p)<1.8||lane&&v122Metres(r,lane)<1.7||v122Metres(r,probe)<1.7;});
  const offside=v55OffsideSnapshot(p).offside,better=m.people.some(q=>q.t===p.t&&q!==p&&!q.keeper&&!q.slideActive&&!offside.has(q)&&v115GoalDistance(q)<range-6&&v157ShotQuality(q,rivals)>v157ShotQuality(p,rivals)+.25&&v157Lane(m,p,q,rivals));
  if(!blocked&&!better){m.attackFlow.carry={playerId:p.pid,target:goal,until:v152Seconds(m)+.34};m.next=m.elapsed+.24*MATCH_SPEED;return true;}
 }
 delete m.attackFlow.carry;
 return false;
}
function v159KeeperTarget(m,p){
 if(!v159Active(m)||!p.keeper||v121PositioningPaused(m)||m.flight||m.rebound)return false;
 const owner=m.owner;if(!owner||owner.keeper||owner.t===p.t)return false;
 const s=v150Scale(),goal={x:.5,y:p.t===0?v55Field.bottom:v55Field.top},ball=m.ball,depth=Math.abs(ball.y-goal.y)*s.y,lateral=Math.abs(ball.x-.5)*s.x;
 const covered=m.people.some(q=>q.t===p.t&&!q.keeper&&!q.slideActive&&(v122Metres(q,owner)<2.5||(()=>{const lane=passLaneGeometry(q,ball,goal);return lane&&v122Metres(q,lane)<2.6&&v122Metres(q,owner)<12;})()));
 // Only an observed, unprotected close breakthrough uses the existing rush and
 // actual smother-contact path. A covered carrier or square-pass attack calls
 // for a ball-to-goal angle; following him to the ball leaves the whole goal.
 if(depth<13&&lateral<8&&!covered)return false;
 const stand=clamp(1.4+Math.max(0,16-depth)*.09,1.4,2.7),fraction=stand/Math.max(stand,depth),side=clamp((ball.x-.5)*fraction,-1.8/s.x,1.8/s.x);
 p.tx=.5+side;p.ty=goal.y+(p.t===0?-1:1)*stand/s.y;
 return true;
}
// A public, released goal threat may cross the old formation leash. Only the
// nearest ready pair within a reachable lane gets this bounded pursuit.
function v119DefensiveThreat(m,team,ready){
 if(!v119PaceActive(m))return null;
 const s=v150Scale(),goal=team===0?v55Field.bottom:v55Field.top,flight=m.flight,owner=m.owner;
 let point=null;
 if(!flight&&owner&&!owner.keeper&&owner.t!==team)point=m.ball;
 else if(flight&&flight.team!==team){
  const remaining=Math.max(0,1-flight.progress)*flight.duration/MATCH_SPEED;
  const ground=typeof v127GroundReceivers!=='undefined'&&v127GroundReceivers.get(flight),space=typeof v150SpacePasses!=='undefined'&&v150SpacePasses.get(m);
  if(remaining>1.1||ground?.offside)return null;
  const receiver=ground?.receiver||m.people.filter(q=>q.t===flight.team&&!q.keeper&&!q.slideActive&&v122Metres(q,flight.target)<6&&!(space?.flight===flight&&space.snapshot.offside.has(q))).sort((a,b)=>v122Metres(a,flight.target)-v122Metres(b,flight.target)||a.n-b.n)[0];
  if(receiver&&!receiver.keeper&&!receiver.slideActive&&v122Metres(receiver,flight.target)<6)point=flight.target;
 }
 if(!point||Math.abs(point.y-goal)*s.y>=30||Math.abs(point.x-.5)*s.x>=18)return null;
 const chasers=[...ready].sort((a,b)=>v122Metres(a,point)-v122Metres(b,point)||a.n-b.n).slice(0,2).filter(q=>v122Metres(q,point)<=14);
 return chasers.length?{point,chasers}:null;
}
function v159DefensiveTarget(m,p){
 if(!v159Active(m)||p.keeper||p.slideActive||v121PositioningPaused(m))return false;
 const possession=v123PossessionTeam(m);if(possession==null||possession===p.t)return false;
 const flight=m.flight,owner=m.owner;if(!flight&&!owner)return false;
 const flow=m.attackFlow,now=v152Seconds(m),s=v150Scale(),reads=flow.defenseReads||(flow.defenseReads={}),prior=reads[p.pid],awareness=ability(p,'pos');
 const revised=v119PaceActive(m),ready=m.people.filter(q=>q.t===p.t&&!q.keeper&&!q.slideActive&&(!revised||(q.recoverUntil||0)<=m.elapsed)).sort((a,b)=>v122Metres(a,owner||m.ball)-v122Metres(b,owner||m.ball)||a.n-b.n);
 const localPressure=revised&&!flight&&owner&&!owner.keeper&&(p.recoverUntil||0)<=m.elapsed&&ready.slice(0,2).includes(p)&&v122Metres(p,owner)<=6;
 const threat=revised&&v119DefensiveThreat(m,p.t,ready),urgent=Boolean(threat&&threat.chasers.includes(p));
 // Read public ball motion on a bounded, skill-based cadence. No future action,
 // chosen outcome or hidden rival intention is available to this defender.
 if(!localPressure&&!urgent&&prior&&prior.team===possession&&prior.nextAt>now){p.tx=prior.target.x;p.ty=prior.target.y;return true;}
 let target=null,purpose='mark';
 if(localPressure||urgent&&!flight){
  // An observed nearby carrier can cross a formation boundary. Ready pressure
  // players contest his actual ball with a short observed-velocity lead; a
  // recovering teammate must not monopolize the nearest-chaser assignment.
  const motion=owner.offenseMotion,lead=.12,velocity={x:motion?.vx||0,y:motion?.vy||0},speed=Math.hypot(velocity.x,velocity.y),limit=Math.min(1,9/Math.max(.001,speed));
  target={x:m.ball.x+velocity.x*limit*lead/s.x,y:m.ball.y+velocity.y*limit*lead/s.y};purpose='press';
 }
 if(urgent&&flight){target=threat.point;purpose='ball';}
 if(flight&&!target){
  const seconds=flight.duration/MATCH_SPEED,lead=clamp(.18+awareness*.01,.2,.38),velocity={x:(flight.target.x-flight.x)/Math.max(.01,seconds),y:(flight.target.y-flight.y)/Math.max(.01,seconds)},remaining=Math.max(0,1-flight.progress)*seconds;
  const point=v159Point({x:m.ball.x+velocity.x*Math.min(lead,remaining),y:m.ball.y+velocity.y*Math.min(lead,remaining)},s,.35);
  const nearest=m.people.filter(q=>q.t===p.t&&!q.keeper&&!q.slideActive&&(!revised||(q.recoverUntil||0)<=m.elapsed)).sort((a,b)=>v122Metres(a,point)-ability(a,'pos')*.03-(v122Metres(b,point)-ability(b,'pos')*.03)||a.n-b.n).slice(0,2);
  if(nearest.includes(p)){target=point;purpose='ball';}
  else{
   // The released trajectory can reveal an incoming recipient. Covering players
   // track that visible player on the goal side while the nearest pair attacks
   // the actual ball; they never read a not-yet-released offensive intention.
   const receiver=m.people.filter(q=>q.t===possession&&!q.keeper&&!q.slideActive&&v122Metres(q,flight.target)<6).sort((a,b)=>v122Metres(a,flight.target)+v122Metres(a,p)*.15-(v122Metres(b,flight.target)+v122Metres(b,p)*.15)||a.n-b.n)[0];
   if(receiver){const side=p.bx<receiver.x?-1:1;target={x:receiver.x+side*.8/s.x,y:receiver.y+(p.t===0?1:-1)*1.2/s.y};purpose='incoming-receiver';}
  }
 }
 if(!target&&owner&&!owner.keeper){
  const teammates=revised?ready:m.people.filter(q=>q.t===p.t&&!q.keeper&&!q.slideActive).sort((a,b)=>v122Metres(a,owner)-v122Metres(b,owner)||a.n-b.n);
  if(teammates[0]===p){target={x:owner.x+(p.bx-.5)*.035,y:owner.y-(p.t===0?-1:1)*1/s.y};purpose='press';}
  else{
   const receiver=m.people.filter(q=>q.t===possession&&!q.keeper&&q!==owner&&!q.slideActive&&v122Metres(q,p)<13).map(q=>{const lane=passLaneGeometry(p,owner,q);return{q,cost:v122Metres(p,q)-((q.y-owner.y)*(possession===0?-1:1)*s.y)*.10+(lane?.t?-.6:0)};}).sort((a,b)=>a.cost-b.cost||a.q.n-b.q.n)[0]?.q;
   if(receiver){const towardGoal=p.t===0?1:-1;target={x:receiver.x,y:receiver.y+towardGoal*1.2/s.y};purpose='receiver';}
  }
 }
 if(!target)return false;
 if(v162Active(m)&&!['press','ball'].includes(purpose)){
  const zone=v162Zone(m,p);target={x:target.x*.65+zone.x*.35,y:target.y*.65+zone.y*.35};
 }
 const radius=(p.assignedLine||p.line)==='def'?12:16,anchor={x:p.bx,y:p.by},dx=(target.x-anchor.x)*s.x,dy=(target.y-anchor.y)*s.y,gap=Math.hypot(dx,dy),limit=localPressure||urgent?1:Math.min(1,radius/Math.max(.001,gap));
 target=v159Point({x:anchor.x+(target.x-anchor.x)*limit,y:anchor.y+(target.y-anchor.y)*limit},s,.5);
 reads[p.pid]={team:possession,at:now,nextAt:now+clamp(.34-(awareness-1)*.01+(typeof v158ReactionLoss==='function'?v158ReactionLoss(p):0),.12,.45),ball:{x:m.ball.x,y:m.ball.y},target,purpose};p.tx=target.x;p.ty=target.y;return true;
}
function v159DirectOptions(m,p,point,from){
 if(!v159Active(m)||p.keeper||v121PositioningPaused(m)||v122Metres(p,point)>.8)return null;
 const s=v150Scale(),rivals=m.people.filter(q=>q.t!==p.t),offside=v55OffsideSnapshot(p).offside,body=v157Body(p),incoming={x:(point.x-from.x)*s.x,y:(point.y-from.y)*s.y},length=Math.hypot(incoming.x,incoming.y);
 if(length<.2)return null;
 const legalDirection=(target,maxTurn=1.05)=>{const dx=(target.x-point.x)*s.x,dy=(target.y-point.y)*s.y,d=Math.hypot(dx,dy);return d>1&&Math.abs(v157Angle(body.heading,Math.atan2(dx,dy)))<=maxTurn&&(incoming.x*dx+incoming.y*dy)/length/d>-.55;};
 const safe=target=>v157Lane(m,p,target,rivals,1.4),open=v131OpenGoal(p,point),goal=open?.target||{x:.5,y:p.t===0?v55Field.top:v55Field.bottom},range=v115GoalDistance(p),dir=p.t===0?-1:1;
 const combo=m.attackFlow.combination,options=m.people.filter(q=>q.t===p.t&&q!==p&&!q.keeper&&!q.slideActive&&!offside.has(q)).map(q=>{
  const target=v157PassLead(m,p,q,point),distance=v122Metres(point,target),gain=(target.y-point.y)*dir*s.y,returnRun=combo?.confirmed&&combo.receiverId===p.pid&&combo.passerId===q.pid&&gain>1.5;
  return{q,target,distance,gain,returnRun,quality:v157ShotQuality({...q,...target},rivals),score:gain*.11-distance*.025+(returnRun?.8:0)};
 }).filter(o=>o.distance>=3&&o.distance<=18&&(o.gain>1.5||o.returnRun)&&legalDirection(o.target)&&safe(o.target)).sort((a,b)=>b.score-a.score||a.q.n-b.q.n);
 // A side-foot finish can open the hip across a square pass. A pass in the
 // opposite body direction still uses the native v157 turn-and-brake guard.
 const target=options[0],shot=(open||range<=18&&Math.abs(point.x-.5)*s.x<9)&&legalDirection(goal,1.65)&&safe(goal),better=target&&target.quality>v157ShotQuality(p,rivals)+.2&&v115GoalDistance(target.q)<range-2;
 const kind=shot&&(open||!better)?'shot':target?'pass':null;
 return{kind,target:kind==='shot'?goal:target?.q,openGoal:Boolean(open&&kind==='shot'),pressure:rivals.filter(r=>!r.keeper&&v122Metres(r,p)<2.5).length};
}
