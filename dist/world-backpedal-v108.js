'use strict';
// Defensive movement is shared by 2D and 3D. Modes are transient, never save fields.
const v108MovementModes=new WeakMap(),v108BackwardSpeed=.60;
const v121PositioningPlans=new WeakMap(),v121PositioningSamples=new WeakMap();
const v123DefensiveThreats=new WeakMap();
function v123PossessionTeam(current){if(current.owner||v121PositioningPaused(current)){v123DefensiveThreats.delete(current);return current.owner?.t??current.flight?.team??current.lastTouch;}return v123DefensiveThreats.get(current)??current.flight?.team??current.lastTouch;}
function v121PositioningPaused(current){return current.kickoff||current.setPiece||current.throwIn||current.goalPause>0||current.postBanner||current.halftimePause||current.finished;}
function v121PreparePositioning(current){
 if(!v65WorldActive)return;
 const plans=new Map();v121PositioningPlans.set(current,plans);
 if(v121PositioningPaused(current)){v121PositioningSamples.delete(current);return;}
 const width=44/(v55Field.right-v55Field.left),length=68/(v55Field.bottom-v55Field.top),gap=(a,b)=>Math.hypot((a.x-b.x)*width,(a.y-b.y)*length),previous=v121PositioningSamples.get(current),seconds=previous?(current.elapsed-previous.at)/MATCH_SPEED:0,velocity=new Map();
 for(const p of current.people){const before=previous?.positions.get(p);let x=0,y=0;if(before&&seconds>0&&seconds<.2){x=(p.x-before.x)/seconds;y=(p.y-before.y)/seconds;const speed=Math.hypot(x*width,y*length),limit=Math.min(1,7/Math.max(.001,speed));x*=limit;y*=limit;}velocity.set(p,{x,y});}
 v121PositioningSamples.set(current,{at:current.elapsed,positions:new Map(current.people.map(p=>[p,{x:p.x,y:p.y}]))});
 const possession=v123PossessionTeam(current);if(possession==null)return;
 for(const team of [0,1]){
  const depth=y=>team===0?1-y:y,at=d=>team===0?1-d:d,base={[-1]:.21,0:.31,1:.41}[current.defenseLines?.[team]||0],ball=depth(current.owner?.y??current.ball.y),defs=current.people.filter(p=>p.t===team&&!p.keeper&&(p.assignedLine||p.line)==='def'&&p!==current.owner);
  // A distant turnover keeps the block compact above its tactical base. The
  // line drops as the ball advances, not just because ownership changed.
  const defensiveLine=ball<base-.08?Math.max(base-.12,ball+.045):Math.min(.52,base+clamp((ball-.5)*.55,0,.14));
  for(const p of defs){const advance=current.owner?.keeper?.035:Math.max(.07,Math.min(.22,(ball-base)*.48)),line=possession===team?Math.min(.64,base+advance):defensiveLine;plans.set(p,{x:clamp(p.bx+(current.ball.x-.5)*.2,.08,.92),y:at(line),mark:null});}
  if(possession===team){
   if(current.owner?.keeper){const k=current.owner,rivals=current.people.filter(q=>q.t!==team&&!q.keeper);for(const p of defs){const side=p.bx<.5?-1:1,depth=Math.min(.24,Math.max(.14,Math.abs(k.y-(team===0?v55Field.bottom:v55Field.top))+.10)),y=(team===0?v55Field.bottom-depth:v55Field.top+depth),options=[.5+side*.19,.5+side*.29,.5+side*.11].map(x=>({x,y})),score=spot=>Math.min(...rivals.map(r=>{const lane=passLaneGeometry(r,k,spot);return Math.min(gap(r,spot),lane?gap(r,lane)*1.7:20)}),20)-gap(p,spot)*.03;options.sort((a,b)=>score(b)-score(a));plans.set(p,{...options[0],mark:null});}}
   continue;
  }
  const available=new Set(defs),owner=current.owner;
  const mark=(p,threat)=>{const anticipation=.12+ability(p,'pos')*.01,v=velocity.get(threat)||{x:0,y:0},margin=(1+(20-ability(p,'pos'))*.06)/length;plans.set(p,{x:clamp(threat.x+v.x*anticipation,.07,.93),y:clamp(at(depth(threat.y+v.y*anticipation)-margin),v55Field.top+.6/length,v55Field.bottom-.6/length),mark:threat});available.delete(p);};
  const chaser=owner&&!owner.keeper?[...available].sort((a,b)=>gap(a,owner)-gap(b,owner)||a.n-b.n)[0]:null;
  if(chaser&&(ball<base+.08||gap(chaser,owner)<9))mark(chaser,owner);
  // Idle offside runners must not pull the line back and make themselves legal.
  // An in-flight receiving run still demands cover; its release snapshot remains authoritative.
  const offside=v55OffsideSnapshot(owner||{t:1-team}).offside;
  const runners=current.people.filter(p=>p.t!==team&&!p.keeper&&p!==owner&&depth(p.y)<defensiveLine+.08&&
   (current.flight&&p.interceptTarget||ball<defensiveLine+.18&&!offside.has(p))).sort((a,b)=>depth(a.y)-depth(b.y)||a.n-b.n);
  for(const runner of runners){const p=[...available].sort((a,b)=>gap(a,runner)-gap(b,runner)||a.n-b.n)[0];if(p&&gap(p,runner)<16)mark(p,runner);}
 }
 // Anticipate an advancing offside line without removing poor timing from weak runners.
 if(!current.owner?.keeper){const team=current.owner?.t??possession,reference=current.owner||current.ball,opponents=current.people.filter(p=>p.t!==team).sort((a,b)=>team===0?a.y-b.y:b.y-a.y),second=opponents[1],v=velocity.get(second)||{y:0},line=v55OffsideLine(team,reference);for(const p of current.people){if(p.t!==team||p.keeper||p===current.owner||(p.assignedLine||p.line)==='def')continue;const quality=ability(p,'pos')/20,shift=clamp(v.y*(.12+.28*quality),-1.2/length,1.2/length),predicted=team===0?Math.max(line,Math.min(reference.y,line+shift)):Math.min(line,Math.max(reference.y,line+shift));plans.set(p,{limit:predicted+ (team===0?1:-1)*v115OffsideMargin(p)});}}
 // Counterattack outlets stay onside while the other team owns or passes the ball.
 // The opponent's ball must not become the reference for our attacking limit.
 const defending=1-possession,reference={y:defending===0?v55Field.bottom:v55Field.top},limit=v55OffsideLine(defending,reference);
 for(const p of current.people)if(p.t===defending&&!p.keeper&&(p.assignedLine||p.line)==='att')plans.set(p,{limit:limit+(defending===0?1:-1)*(1+(20-ability(p,'pos'))*.035)/length});
}
const v132AirChasers=new WeakMap();
function v132FallingBallTarget(current,person){
 const r=current.rebound,air=typeof v124AirBalls!=='undefined'&&v124AirBalls.get(current);
 if(current.owner||current.flight||!r||air?.rebound!==r||air.settled||v121PositioningPaused(current)){v132AirChasers.delete(current);return false;}
 const seconds=clamp((air.vh+Math.sqrt(air.vh*air.vh+19.6*Math.max(0,air.height-.29)))/9.8,0,1.5),target={x:clamp(r.x+(r.vx||0)*MATCH_SPEED*seconds,v55Field.left,v55Field.right),y:clamp(r.y+(r.vy||0)*MATCH_SPEED*seconds,v55Field.top,v55Field.bottom)};
 let plan=v132AirChasers.get(current);if(plan?.source!==r){const runners=[];for(const team of [0,1]){const p=current.people.filter(p=>p.t===team&&!p.keeper&&!p.slideActive).sort((a,b)=>v122Metres(a,target)/(3+ability(a,'spd')*.14)-ability(a,'pos')*.01-(v122Metres(b,target)/(3+ability(b,'spd')*.14)-ability(b,'pos')*.01))[0];if(p)runners.push(p);}plan={source:r,runners};v132AirChasers.set(current,plan);}
 if(person.keeper||person.slideActive||!plan.runners.includes(person))return false;
 person.tx=target.x;person.ty=target.y;return true;
}
function v121RunnerTarget(current,person){if(!v65WorldActive)return;if(v132FallingBallTarget(current,person))return;const plan=v121PositioningPlans.get(current)?.get(person);if(plan?.limit==null||v121PositioningPaused(current)||current.flight&&person.interceptTarget)return;
 const reference=current.owner||current.ball,line=person.assignedLine||person.line,dir=person.t===0?-1:1,length=68/(v55Field.bottom-v55Field.top);
 // Support instructions stay behind the carrier; strikers accompany the attack
 // even when their original formation anchor is now behind the ball.
 if(!current.owner?.keeper&&v123PossessionTeam(current)===person.t){
  const support=hasInstruction(person,'support'),deep=hasInstruction(person,'deep'),quality=ability(person,'pos')/20;
  const lead=support?-4:deep?6+2*quality:line==='att'?4+2*quality+person.role:person.role>0?2+2*quality:person.role===0?-4:null;
  if(lead!==null){const target=clamp(reference.y+dir*lead/length,.13,.87);person.ty=support?target:person.t===0?Math.min(person.ty,target):Math.max(person.ty,target);}
 }
 person.ty=person.t===0?Math.max(person.ty,plan.limit):Math.min(person.ty,plan.limit);
}
const v115KeeperChallenges=new WeakMap();
function v115KeeperTarget(current,person){
 if(!v65WorldActive||!person.keeper||current.kickoff||current.setPiece||current.throwIn||current.goalPause>0||current.postBanner||current.halftimePause||current.finished)return;
 const release=current.flight&&v99Flights.get(current.flight);
 if(release?.keeper===person&&release.onTarget&&!release.blocked){
  const seconds=current.flight.progress*current.flight.duration/MATCH_SPEED,delay=.28-ability(person,'gk')*.005;
  if(v131KeeperSetting(current,person)){person.tx=seconds>=delay?clamp(release.displayTarget.x,.405,.595):person.x;person.ty=person.y;}
  else if(!release.launched){release.launched=true;release.diveAt=current.flight.progress;release.keeperStart={x:person.x,y:person.y};if(typeof v158KeeperLaunch==='function')v158KeeperLaunch(current,person,current.flight);}
  return;
 }
 const challenge=v115KeeperChallenges.get(current);if(challenge?.keeper===person&&v102Clock(current)-challenge.at<challenge.duration){const q=Math.min(1,(v102Clock(current)-challenge.at)/challenge.duration);person.tx=challenge.start.x+(challenge.end.x-challenge.start.x)*q;person.ty=challenge.start.y+(challenge.end.y-challenge.start.y)*q;return;}
 if(typeof v159KeeperTarget==='function'&&v159KeeperTarget(current,person))return;
 const owner=current.owner;if(!owner||owner.t===person.t||owner.keeper||current.flight||current.rebound)return;
 const width=44/(v55Field.right-v55Field.left),length=68/(v55Field.bottom-v55Field.top),goal=person.t===0?v55Field.bottom:v55Field.top,depth=Math.abs(owner.y-goal)*length,lateral=Math.abs(owner.x-.5)*width;
 if(depth>16.5||lateral>12)return;
 const quality=(ability(person,'gk')+ability(person,'pos'))/40,direction=person.t===0?-1:1;
 // Close down along the ball-to-goal line, then approach the actual ball.
 // A fixed eight-metre cap previously prevented contact with most box attackers.
 const advance=clamp(depth-(.85+(1-quality)*.65),2.2,15.2),fraction=advance/Math.max(2.2,depth);
 person.tx=clamp(.5+(owner.x-.5)*fraction,v55Field.left+1/width,v55Field.right-1/width);person.ty=goal+direction*advance/length;
 const ball=v101KickPoint(owner,person),gap=Math.hypot((ball.x-person.x)*width,(ball.y-person.y)*length);
 if(gap<1.45+quality*.65&&(!challenge||v102Clock(current)-challenge.at>2.2)){
  if(typeof v158LoadAction==='function'&&v65WorldActive.state.playerLoad)v158LoadAction(current,person,'keeper-dive',`${v65WorldActive.fixture.id}:smother:${++v65WorldActive.state.playerLoad.sequence}`);
  const dx=(ball.x-person.x)*width,dy=(ball.y-person.y)*length,d=Math.hypot(dx,dy)||1,reach=Math.min(1.8,gap);v115KeeperChallenges.set(current,{keeper:person,attacker:owner,start:{x:person.x,y:person.y},end:{x:person.x+dx/d*reach/width,y:person.y+dy/d*reach/length},contact:ball,at:v102Clock(current),duration:.55,caught:false,checked:false});
 }
}
function v115ResolveKeeperChallenge(current){
 if(!v65WorldActive)return;const c=v115KeeperChallenges.get(current);if(!c||c.checked)return;
 const age=v102Clock(current)-c.at;if(age>c.duration){c.checked=true;return;}
 if(current.owner!==c.attacker||current.flight){c.checked=true;return;}
 const ball=v101KickPoint(c.attacker,c.keeper),gap=Math.hypot((ball.x-c.keeper.x)*44/(v55Field.right-v55Field.left),(ball.y-c.keeper.y)*68/(v55Field.bottom-v55Field.top));
 if(age>.4&&gap<.8){c.checked=true;const chance=clamp(.48+ability(c.keeper,'gk')*.025-ability(c.attacker,'tec')*.013,.28,.92);if(random()<chance){c.caught=true;c.contact={...ball};c.caughtAt=v102Clock(current);c.keeper.stats.interceptions++;v50GoalKick(c.keeper,`${c.keeper.name} kommt heraus und sichert den Ball.`,{held:true});}}
}
function v115KeeperChallengeAction(current,person){
 const c=v115KeeperChallenges.get(current);if(c?.keeper!==person||current.flight&&v99Flights.get(current.flight)?.keeper===person)return null;const age=v102Clock(current)-c.at;if(age>1.8)return null;
 return {kind:'save',id:(c.pickup?'pickup:':'smother:')+c.at,progress:c.pickup?1:Math.min(1,age/.55),recovery:c.pickup?Math.min(1,age/1.55):age>.55?Math.min(1,(age-.55)/1.25):0,target:c.contact,origin:c.start,height:c.pickup?.29:.35,saved:c.caught,smother:!c.pickup,goal:false};
}
function v113DefenderTarget(current,person){
 if(!v65WorldActive||person.keeper||(person.assignedLine||person.line)!=='def'||person===current.owner||v121PositioningPaused(current))return;
 if(!v121PositioningPlans.get(current)?.has(person))v121PreparePositioning(current);
 const plan=v121PositioningPlans.get(current)?.get(person);if(plan?.x!=null){person.tx=plan.x;person.ty=plan.y;}
}
function v108DefensiveMovement(current,person,dx,dy){
 if(!current?.owner||current.owner.t===person.t||current.owner.keeper||person.keeper||(person.assignedLine||person.line)!=='def'||person.slideActive||person.interceptTarget||current.finished||current.goalPause>0||current.kickoff||current.throwIn||current.setPiece||current.rebound||current.halftimePause||current.postBanner)return null;
 const width=44/(v55Field.right-v55Field.left),length=68/(v55Field.bottom-v55Field.top),motion={x:dx*width,y:dy*length},travel=Math.hypot(motion.x,motion.y);if(travel<.025)return null;
 const goal={x:.5,y:person.t===0?v55Field.bottom:v55Field.top},toGoal={x:(goal.x-person.x)*width,y:(goal.y-person.y)*length},goalDistance=Math.hypot(toGoal.x,toGoal.y);if(goalDistance<1.5||((motion.x*toGoal.x+motion.y*toGoal.y)/travel/goalDistance)<.3)return null;
 // A beaten defender turns and runs at full pace, even if another attacker is still ahead.
 const owner=current.owner,ballSide={x:(owner.x-person.x)*width,y:(owner.y-person.y)*length},ownerGap=Math.hypot(ballSide.x,ballSide.y);
 if(ballSide.x*toGoal.x+ballSide.y*toGoal.y>0||ownerGap>9)return null;
 const threats=current.people.filter(p=>p.t!==person.t&&!p.keeper).map(threat=>{
  const look={x:(threat.x-person.x)*width,y:(threat.y-person.y)*length},distance=Math.hypot(look.x,look.y),axis={x:(threat.x-goal.x)*width,y:(threat.y-goal.y)*length},total=axis.x*axis.x+axis.y*axis.y,t=total?((person.x-goal.x)*width*axis.x+(person.y-goal.y)*length*axis.y)/total:0,lateral=Math.abs((person.x-goal.x)*width*axis.y-(person.y-goal.y)*length*axis.x)/Math.sqrt(total||1),backward=distance?(motion.x*look.x+motion.y*look.y)/travel/distance:1;
  return {threat,distance,t,lateral,backward};
 }).filter(o=>o.distance>1.2&&o.distance<16&&o.t>.02&&o.t<1.02&&o.lateral<7&&o.backward<-.45).sort((a,b)=>a.distance-b.distance||a.threat.n-b.threat.n);
 const focus=threats[0]?.threat;if(!focus)return null;return {mode:'backpedal',speedFactor:v108BackwardSpeed,focus};
}
function v108MoveFactor(current,person,dx,dy){
 const mode=typeof v65WorldActive!=='undefined'&&v65WorldActive?v108DefensiveMovement(current,person,dx,dy):null;
 const owner=current?.owner,goal=person.t===0?v55Field.bottom:v55Field.top,pursuit=v65WorldActive&&!mode&&owner&&owner.t!==person.t&&!owner.keeper&&!person.keeper&&(person.assignedLine||person.line)==='def'&&!v121PositioningPaused(current)&&!current.rebound&&!person.slideActive&&!person.interceptTarget&&(owner.y-person.y)*(goal-person.y)>0&&Math.hypot(dx,dy)>.0001;
 if(mode)v108MovementModes.set(person,mode);else if(pursuit)v108MovementModes.set(person,{mode:'pursuit',speedFactor:1,focus:owner});else v108MovementModes.delete(person);return mode?.speedFactor||1;
}
function v108MovementMode(current,person){
 const mode=v108MovementModes.get(person);if(!mode||!current.owner||current.owner.t===person.t||person.slideActive||current.finished||current.goalPause>0||current.setPiece||current.throwIn||current.kickoff||current.halftimePause)return null;
 if(mode.mode==='pursuit'){const goal=person.t===0?v55Field.bottom:v55Field.top;if((current.owner.y-person.y)*(goal-person.y)<=0)return null;return {mode:mode.mode,speedFactor:1,facing:{x:current.owner.x,y:current.owner.y}};}
 const goalY=person.t===0?v55Field.bottom:v55Field.top;if((current.owner.y-person.y)*(goalY-person.y)>0||Math.hypot(person.x-current.owner.x,person.y-current.owner.y)>.13)return null;
 return {mode:mode.mode,speedFactor:mode.speedFactor,facing:{x:mode.focus.x,y:mode.focus.y}};
}
function v108KeeperLook(visual,person,frame,dt,live){
 if(!person.keeper||!frame.ball)return;
 visual.root.updateMatrixWorld(true);
 const neck=visual.neck.getWorldPosition(new THREE.Vector3()),direction=new THREE.Vector3(frame.ball.x,frame.ball.height,frame.ball.z).sub(neck);
 if(direction.lengthSq()<.0001)return;
 const parent=visual.neck.parent.getWorldQuaternion(new THREE.Quaternion()).invert();direction.applyQuaternion(parent);
 const yaw=Math.atan2(direction.x,direction.z),pitch=-Math.atan2(direction.y,Math.hypot(direction.x,direction.z)),state=visual.keeperLook||(visual.keeperLook={yaw:0,pitch:0});
 if(live&&dt>0){state.yaw+=v106Angle(state.yaw,Math.max(-1.45,Math.min(1.45,yaw)))*(1-Math.exp(-dt*18));state.pitch=v106Smooth(state.pitch,Math.max(-1.25,Math.min(1.25,pitch)),dt,18)}
 visual.neck.rotation.set(state.pitch,state.yaw,0,'YXZ');
 visual.renderKeeperLook?.(frame,dt,live);
}
