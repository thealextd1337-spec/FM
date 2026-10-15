'use strict';

// Display-only event metadata: never serialized and never consumes match RNG.
const v99Flights=new WeakMap(),v99Actions=new WeakMap();
const v115OffsideBalls=new WeakMap();
let v99Release=null;
let v99SwapQueue=null;
const v100BaseGoalKick=v50GoalKick;
v50GoalKick=function(...args){
 const current=match,incoming=typeof v109IncomingFlight!=='undefined'&&v109IncomingFlight?.current===current?v109IncomingFlight.flight:current?.flight,release=incoming&&v99Flights.get(incoming),rolling=current?.rebound;
 const held=Boolean(release?.onTarget||args[2]?.held),revised=v65WorldActive&&held&&current?.attackFlow?.keeperHoldRevision===182;
 // Only an already confirmed catch enters this path. Keep its real contact,
 // not a former parry/outgoing ball or the generic carrier offset.
 const challenge=revised&&v115KeeperChallenges.get(current),caught=challenge?.keeper===args[0]&&challenge.caught;
 const hold=revised?(args[2]?.held&&caught?{...challenge.contact,elevation:challenge.pickup?.29:.35}:release?.onTarget?v101ShotPoint(release,v131KeeperContactProgress(release)):{...current.ball,elevation:.29}):null;
 let outgoing=null;
 if(v65WorldActive&&!revised&&(incoming&&!release?.onTarget||rolling&&Number.isFinite(rolling.vx))){
  const end=incoming?v109FlightPoint(incoming,1):{...current.ball,elevation:v99BallView(current)?.elevation??.29},before=incoming?v109FlightPoint(incoming,.98):null,seconds=incoming?incoming.duration/(current.si?v183Rate(current):MATCH_SPEED)*.02:1;
  outgoing={start:end,at:v102Clock(current),velocity:before?{x:(end.x-before.x)/seconds,y:(end.y-before.y)/seconds,height:(end.elevation-before.elevation)/seconds}:{x:rolling.vx*(current.si?v183Rate(current):MATCH_SPEED),y:rolling.vy*(current.si?v183Rate(current):MATCH_SPEED),height:0}};
  const speed=Math.hypot(outgoing.velocity.x*v160PitchWidth()/(v55Field.right-v55Field.left),outgoing.velocity.y*v160PitchLength()/(v55Field.bottom-v55Field.top));if(speed>18){outgoing.velocity.x*=18/speed;outgoing.velocity.y*=18/speed}
 }
 const result=v100BaseGoalKick(...args);
 // The existing movement step forms the build-up while the keeper waits.
 if(v65WorldActive){
  // SI 183 switch (finish package): keeper hold in real seconds from finish.keeperHold.
  const holdSeconds=match.si&&typeof v183Active==='function'&&v183Active(match,'finish')?v183Param(match,'finish.keeperHold')??2.4:null;
  match.next=match.elapsed+(holdSeconds===null?2.4*MATCH_SPEED:v183ClockUnits(match,holdSeconds));
  const state=v99ActionState(match);if(!held)state.keepers.delete(args[0].pid);
  const kick={kind:'goalKick',keeper:args[0],phase:'waiting',age:0,held};
  if(hold){
   const point={...v101KickPoint(args[0],v101KickTarget(match,args[0])),elevation:.29},pace=v157Pace(match,args[0]),distance=Math.hypot(v122Metres(hold,point),hold.elevation-point.elevation);
   // The existing elapsed/next clock owns placement and release. Smoothly put
   // the secured ball down at no more than keeper pace; keep the keeper locked
   // at the catch position. Only a distant contact/tired keeper that cannot
   // complete placement within 2.4 seconds needs the physically required delay.
   const placement=Math.max(.28,1.6*distance/Math.max(.1,pace));
   match.next=match.elapsed+(holdSeconds===null?Math.max(2.4,placement)*MATCH_SPEED:v183ClockUnits(match,Math.max(holdSeconds,placement)));
   Object.assign(kick,{holdPoint:hold,kickPoint:point,holdRelease:match.next,holdPlacement:placement});
   match.ball={...hold};state.outBall=null;state.miss=null;
   const motion=typeof v102Motion!=='undefined'&&v102Motion.get(match);if(motion)motion.loose=null;
  }
  state.kicks.set(args[0].pid,kick);
  if(outgoing&&!release&&!hold)state.outBall=outgoing;
 }
 return result;
};
const v100BaseRestart=v50Restart;
v50Restart=function(type,...args){
 const previous=match?.setPiece,result=v100BaseRestart(type,...args);
 if(v65WorldActive&&type==='penalty'&&match?.setPiece&&match.setPiece!==previous)match.setPiece.wait=4;
 return result;
};
const v99BaseSwapInfo=v65ShowSwapInfo;
v65ShowSwapInfo=function(context,changes){
 if(match?.goalPause>0){
  const html=v65SwapInfoHTML(context,changes);
  if(!v99SwapQueue||v99SwapQueue.match!==match)v99SwapQueue={match,items:[]};
  v99SwapQueue.items.push(html);return;
 }
 return v99BaseSwapInfo(context,changes);
};
const v99BaseGoal=v50Goal;
v50Goal=function(...args){
 const actionState=match&&v99Actions.get(match);if(actionState){actionState.goalHeight=0;actionState.goalLateral=0;actionState.goalTravel=null}
 const banner=$('#v65-swap-info');
 if(banner&&!banner.hidden){
  if(!v99SwapQueue||v99SwapQueue.match!==match)v99SwapQueue={match,items:[]};
  v99SwapQueue.items.push(banner.innerHTML);banner.hidden=true;clearTimeout(v65SwapInfoTimer);v65SwapInfoTimer=0;
 }
 return v99BaseGoal(...args);
};
function v99FlushSwaps(){
 if(!v99SwapQueue)return;
 if(v99SwapQueue.match!==match){v99SwapQueue=null;return}
 if(match.goalPause>0||!running||v47PlayerDialog.open)return;
 const html=v99SwapQueue.items.join('');v99SwapQueue=null;
 v99BaseSwapInfo(v65Context(),[]);$('#v65-swap-info').innerHTML=html;
}
function v99ActionState(current){
 let state=v99Actions.get(current);if(!state){state={keepers:new Map(),throws:new Map(),kicks:new Map(),goalHeight:0,miss:null};v99Actions.set(current,state)}return state;
}
// Only called after the native whistle actually takes effect. Keep action
// locks, keeper recovery, poses and contact clocks authoritative and intact.
function v132ClearVisualTails(current){
 const state=v99Actions.get(current);if(state){state.miss=null;state.outBall=null;state.goalTravel=null;state.goalHeight=0;state.goalLateral=0;}
 if(typeof v102Motion!=='undefined'){const motion=v102Motion.get(current);if(motion)motion.loose=null;}
 for(const map of [v115OffsideBalls,typeof v109CornerBalls!=='undefined'?v109CornerBalls:null,typeof v114KickoffBalls!=='undefined'?v114KickoffBalls:null])map?.delete(current);
}
// Existing restart/recovery observations also lock native movement. Preserve
// them in new safe checkpoints using player IDs, never flight callbacks or
// another action clock. Missing old facts are not reconstructed.
function v119SnapshotActionLocks(current){
 const state=v99Actions.get(current);if(!state)return null;
 const fields=['kind','phase','age','completed','saved','parry','goal','blocked','onTarget','keeperContact','over','startHeight','endHeight','target','displayTarget','visualStart','keeperStart','diveAt','held','start','holdPoint','kickPoint','holdRelease','holdPlacement'];
 const read=pose=>{const record=Object.fromEntries(fields.filter(k=>pose[k]!==undefined).map(k=>[k,structuredClone(pose[k])]));for(const k of ['keeper','shooter','taker'])if(pose[k]?.pid)record[k+'Pid']=pose[k].pid;if(pose.flight)record.flight=Object.fromEntries(['x','y','duration','progress','team','target'].filter(k=>pose.flight[k]!==undefined).map(k=>[k,structuredClone(pose.flight[k])]));return record;};
 const maps=Object.fromEntries(['kicks','keepers','throws'].map(k=>[k,[...state[k]].map(([id,pose])=>[id,read(pose)])]));
 return Object.values(maps).some(items=>items.length)?maps:null;
}
function v119RestoreActionLocks(current,saved,find){
 if(!saved)return;const state=v99ActionState(current);
 for(const key of ['kicks','keepers','throws'])if(Array.isArray(saved[key]))for(const [id,record]of saved[key]){if(!find(id))continue;const pose=structuredClone(record);for(const k of ['keeper','shooter','taker'])if(pose[k+'Pid']){pose[k]=find(pose[k+'Pid']);delete pose[k+'Pid'];}state[key].set(id,pose);}
}
function v101KeeperWaiting(current,person){return current.owner===person&&!current.flight&&v99Actions.get(current)?.kicks.get(person.pid)?.phase==='waiting'}
function v182KeeperPlacement(current,kick){return clamp(1-(kick.holdRelease-current.elapsed)/(current.si?v183Rate(current):MATCH_SPEED)/kick.holdPlacement,0,1);}
function v182KeeperHold(current){
 if(!v65WorldActive||current.attackFlow?.keeperHoldRevision!==182||!current.owner?.keeper||current.flight||v121PositioningPaused(current))return null;
 const kick=v99Actions.get(current)?.kicks.get(current.owner.pid);if(kick?.phase!=='waiting'||!kick.held||!kick.holdPoint)return null;
 const q=v182KeeperPlacement(current,kick),blend=q*q*(3-2*q),a=kick.holdPoint,b=kick.kickPoint;
 return {x:a.x+(b.x-a.x)*blend,y:a.y+(b.y-a.y)*blend,elevation:a.elevation+(b.elevation-a.elevation)*blend};
}
const v182BaseOwnedBall=v123OwnedBall;
v123OwnedBall=function(current){return v182KeeperHold(current)||v182BaseOwnedBall(current);};
function v131KeeperContactProgress(release){const start=release.visualStart||release.flight;return release.goal?clamp((release.keeperStart.y-start.y)/(release.target.y-start.y),0,1):1;}
function v131KeeperSetting(current,person){const release=current.flight&&v99Flights.get(current.flight);if(release?.keeper!==person||!release.onTarget||release.blocked)return false;const seconds=current.flight.duration/(current.si?v183Rate(current):MATCH_SPEED),remaining=(v131KeeperContactProgress(release)-current.flight.progress)*seconds;return remaining>.30;}
function v113KeeperReacting(current,person){const release=current.flight&&v99Flights.get(current.flight),recover=v99Actions.get(current)?.keepers.get(person.pid);return release?.keeper===person&&release.onTarget&&!release.blocked&&!v131KeeperSetting(current,person)||recover?.completed&&recover.age<1.55;}
function v115RestartLocked(current,person){const pose=v99Actions.get(current)?.throws.get(person.pid);return Boolean(pose&&(!pose.completed||pose.age<.32)||current.kickoff&&current.kickoff.kicker===person);}
function v101KickTarget(current,keeper){return (v65WorldActive&&typeof v123KeeperOutlet==='function'&&v123KeeperOutlet(keeper,current)?.person)||current.people.filter(p=>p.t===keeper.t&&!p.keeper&&p.assignedLine==='def').sort((a,b)=>Math.hypot(a.x-keeper.x,a.y-keeper.y)-Math.hypot(b.x-keeper.x,b.y-keeper.y))[0]||{x:keeper.x,y:keeper.y+(keeper.t===0?-.1:.1)}}
function v101KickPoint(keeper,target){
 const sx=v160PitchWidth()/(v55Field.right-v55Field.left),sy=v160PitchLength()/(v55Field.bottom-v55Field.top),dx=(target.x-keeper.x)*sx,dy=(target.y-keeper.y)*sy,d=Math.hypot(dx,dy)||1;
 return {x:keeper.x+dx/d*.65/sx,y:keeper.y+dy/d*.65/sy};
}
function v115ThrowPoint(taker,target,holding=true,progress=0){const width=v160PitchWidth()/(v55Field.right-v55Field.left),length=v160PitchLength()/(v55Field.bottom-v55Field.top),dx=(target.x-taker.x)*width,dy=(target.y-taker.y)*length,d=Math.hypot(dx,dy)||1,lead=holding?-.10:-.10+.42*Math.min(1,progress/.45);return {x:taker.x+dx/d*lead/width,y:taker.y+dy/d*lead/length,elevation:3.04};}
function v115ThrowHold(current){const t=current.throwIn.taker,end=v115ThrowPoint(t,{x:t.x+(t.x<.5?.15:-.15),y:t.y}),start=current.throwIn.spot,q=Math.min(1,current.throwIn.ready/.35),blend=q*q*(3-2*q);return {x:start.x+(end.x-start.x)*blend,y:start.y+(end.y-start.y)*blend,elevation:.29+(end.elevation-.29)*blend};}
const v101BaseGroundPass=v55GroundPass;
v55GroundPass=function(passer,...args){
 const previous=v99Release,kick=v65WorldActive&&v99Actions.get(match)?.kicks.get(passer.pid);
 if(kick?.phase==='waiting')v99Release={kind:'goalKick',keeper:passer};
 try{return v101BaseGroundPass(passer,...args)}finally{v99Release=previous}
};
const v182BaseHighPass=v55HighPass;
v55HighPass=function(passer,...args){
 const previous=v99Release,kick=v65WorldActive&&match.attackFlow?.keeperHoldRevision===182&&v99Actions.get(match)?.kicks.get(passer.pid);
 if(kick?.phase==='waiting'&&kick.holdPoint)v99Release={kind:'goalKick',keeper:passer};
 try{return v182BaseHighPass(passer,...args)}finally{v99Release=previous}
};
function v101ShotDuration(from,to,duration,kind='shot'){
 if(!v65WorldActive)return duration;
 const metres=Math.hypot((to.x-from.x)*v160PitchWidth()/(v55Field.right-v55Field.left),(to.y-from.y)*v160PitchLength()/(v55Field.bottom-v55Field.top));
 return Math.max(.14,metres/(kind==='header'?14:27)*MATCH_SPEED);
}
function v101ShotPoint(release,q){
 const flight=release.flight,start=release.visualStart||flight,seconds=flight.duration/(typeof match!=='undefined'&&match?.si?v183Rate(match):MATCH_SPEED),time=q*seconds;
 const end=release.over?{x:.5+(release.shooter.n%2?-.045:.045),y:release.target.y}:release.displayTarget||release.target;
 const velocityHeight=(release.endHeight-release.startHeight)/seconds+4.9*seconds;
 return {x:start.x+(end.x-start.x)*q,y:start.y+(end.y-start.y)*q,elevation:Math.max(.29,release.startHeight+velocityHeight*time-4.9*time*time),vx:(end.x-start.x)/seconds,vy:(end.y-start.y)/seconds,vh:velocityHeight-9.8*time};
}
function v101GoalTravel(release){
 const end=v101ShotPoint(release,1),direction=release.shooter.t===0?-1:1;
 const depth=1.91*(v55Field.bottom-v55Field.top)/v160PitchLength(),side=v160GoalX(.6)-.5-.29*(v55Field.right-v55Field.left)/v160PitchWidth();
 const rear=depth/Math.max(.001,Math.abs(end.vy)),edge=end.vx?((.5+Math.sign(end.vx)*side)-end.x)/end.vx:Infinity;
 const roofHeight=(match.geometry?.goalHeight||.2*44/(v55Field.right-v55Field.left)/3)-.29,B=end.vh+.15*Math.abs(end.vy)*v160PitchLength()/(v55Field.bottom-v55Field.top)/2.2,C=end.elevation-roofHeight;
 const root=B*B+19.6*C,roof=C>=0?0:B>0&&root>=0?(B-Math.sqrt(root))/9.8:Infinity;
 const impact=Math.max(.001,Math.min(rear,edge,roof));
 return {...end,direction,impact,hit:roof<=Math.min(rear,edge)?'roof':edge<rear?'side':'rear'};
}
function v101GoalBall(travel,time){
 const t=Math.min(time,travel.impact),fall=Math.max(0,time-travel.impact),damp=(1-Math.exp(-7*fall))/7;
 const vh=travel.vh-9.8*t;
 return {x:travel.x+travel.vx*t+travel.vx*(travel.hit==='side'?-.18:.12)*damp,
  y:travel.y+travel.vy*t+travel.vy*(travel.hit==='rear'?-.18:.12)*damp,
  elevation:Math.max(.29,travel.elevation+travel.vh*t-4.9*t*t+(travel.hit==='roof'?-Math.abs(vh)*.18:vh)*fall-4.9*fall*fall)};
}
function v100ShotOutcome(flight,goal){
 const release=flight&&v99Flights.get(flight);if(!release)return;release.goal=goal;
 if(goal&&release.keeper&&!(typeof v159ShotActive==='function'&&v159ShotActive(match))){
  // A successful finish clears the keeper's body; a failed reaction cannot pull him to the net.
  const start=release.visualStart||flight,k=release.keeperStart,q=Math.max(0,Math.min(1,(k.y-start.y)/(release.target.y-start.y))),sx=v160PitchWidth()/(v55Field.right-v55Field.left),cross=start.x+(release.displayTarget.x-start.x)*q;
  if(Math.abs(cross-k.x)*sx<1.6&&release.endHeight<2.4){let side=Math.sign(release.target.x-k.x)||((release.shooter.n%2)?1:-1),x=(k.x+side*1.65/sx-start.x*(1-q))/Math.max(.1,q);if(x<.405||x>.595){side=-side;x=(k.x+side*1.65/sx-start.x*(1-q))/Math.max(.1,q);}release.displayTarget.x=Math.max(.405,Math.min(.595,x));release.target.x=flight.target.x=release.displayTarget.x;}
 }
}
// Marked woodwork penalties: contact at the post/crossbar, then a visible rebound.
function v182PenaltyFramePoint(progress,side,frame,width,height){
 const q=Math.max(0,Math.min(1,progress)),post=Math.min(width*.36,180),start={left:width/2,bottom:26,scale:1};
 const contact=frame==='post'?{left:width/2+side*(post-4),bottom:height-155,scale:.6}:{left:width/2+side*64,bottom:height-98,scale:.55},after=frame==='post'?{left:width/2+side*(post+34),bottom:44,scale:.85}:{left:width/2+side*90,bottom:height-40,scale:.45};
 const [a,b,t]=q<=.55?[start,contact,q/.55]:[contact,after,(q-.55)/.45];
 return {left:a.left+(b.left-a.left)*t,bottom:a.bottom+(b.bottom-a.bottom)*t,scale:a.scale+(b.scale-a.scale)*t};
}
// Same native penalty clock for the shared THREE/Unity picture. Geometry and
// frame affect presentation only; the booked miss and random stream stay native.
function v182PenaltyFrameBall(current){
 const piece=current.setPiece;if(current.penaltyRevision!==182||piece?.type!=='penalty'||piece.phase!=='result'||!['post','bar'].includes(piece.frame))return null;
 const q=Math.max(0,Math.min(1,(2.15-piece.wait)/.9)),side=piece.shotSide,direction=piece.team===0?-1:1,line=piece.team===0?v55Field.top:v55Field.bottom;
 const sx=v160PitchWidth(current)/(v55Field.right-v55Field.left),sy=v160PitchLength(current)/(v55Field.bottom-v55Field.top),width=current.geometry?.goalWidth||.2*sx,height=current.geometry?.goalHeight||width/3,radius=.1764;
 const start={...(piece.spot||current.ball),elevation:.29},contact={x:.5+side*(piece.frame==='post'?width/2-radius:width*.18)/sx,y:line-direction*radius/sy,elevation:piece.frame==='post'?Math.min(1.1,height/2):height-radius};
 const after={x:contact.x+side*(piece.frame==='post'?2:.4)/sx,y:line+direction*1.8/sy,elevation:piece.frame==='post'?.29:height+1};
 const [a,b,t]=q<=.55?[start,contact,q/.55]:[contact,after,(q-.55)/.45];
 return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,elevation:a.elevation+(b.elevation-a.elevation)*t};
}
function v100PenaltyWidePoint(progress,side,width,height){
 const q=Math.max(0,Math.min(1,progress)),goalWidth=Math.min(width*.72,360);
 return {left:width/2+side*(goalWidth/2+24)*q/.65,bottom:26+(height-195)*q/.65+8*Math.sin(Math.PI*q),scale:1-.55*q};
}
const v99BaseShoot=v55Shoot;
v55Shoot=function(shooter,...args){
 const previous=v99Release;v99Release={kind:'shot',shooter,onTarget:shooter.stats.onTarget||0};
 try{return v99BaseShoot(shooter,...args)}finally{v99Release=previous}
};
const v99BaseThrowStep=v55ThrowStep;
v55ThrowStep=function(...args){
 const previous=v99Release;v99Release=match?.throwIn?{kind:'throw',taker:match.throwIn.taker}:null;
 try{return v99BaseThrowStep(...args)}finally{v99Release=previous}
};
const v99BaseFly=fly;
fly=function(target,duration,done){
 const current=match,release=v99Release&&v65WorldActive?{...v99Release}:null;
 if(!release){const previous=v99Actions.get(current);if(previous){previous.miss=null;previous.outBall=null}return v99BaseFly(target,duration,done)}
 const state=v99ActionState(current);
 if(release.kind==='shot'){
  const shooter=release.shooter,keeper=current.people.find(p=>p.keeper&&p.t!==shooter.t);
  const onTarget=(shooter.stats.onTarget||0)>release.onTarget;
  const goalLine=shooter.t===0?v55Field.top:v55Field.bottom;
  const keeperContact=onTarget&&keeper&&Math.hypot((target.x-keeper.x)*v160PitchWidth()/(v55Field.right-v55Field.left),(target.y-keeper.y)*v160PitchLength()/(v55Field.bottom-v55Field.top))<2.4;
  const blocked=Math.abs(target.y-goalLine)>.015&&!keeperContact;
  const variant=((shooter.stats.shots||0)+shooter.n)%3;
  const displayTarget={...target};
  Object.assign(release,{keeper,keeperStart:keeper&&{x:keeper.x,y:keeper.y},keeperContact,onTarget,blocked,over:!onTarget&&!blocked&&variant!==0,displayTarget,
   endHeight:blocked?.45:onTarget?[(keeperContact?.6:.35),1.35,2.7][variant]:variant===0?.29:3.4+variant*.45,
   startHeight:.29,target:{...target},age:0,saved:false});
  if(keeper&&!blocked&&onTarget)state.keepers.set(keeper.pid,release);
 }else if(release.kind==='goalKick'){
  const kick=state.kicks.get(release.keeper.pid),placed=current.attackFlow?.keeperHoldRevision===182&&kick?.holdPoint;
  Object.assign(release,{startHeight:placed?current.ball.elevation??.29:.29,endHeight:.29,target:{...target},start:placed?{...current.ball}:v101KickPoint(release.keeper,target),phase:'follow',age:0,held:kick?.held||false});
  state.kicks.set(release.keeper.pid,release);
 }else{
  Object.assign(release,{startHeight:3.04,endHeight:.29,target:{...target},visualStart:v115ThrowPoint(release.taker,target,false,.45),age:0});
  state.throws.set(release.taker.pid,release);
 }
 const result=v99BaseFly(target,duration,()=>{
  const saves=release.keeper?.stats.saves||0,goals=current.goals.length;
  const value=done();
  release.completed=true;if(release.kind!=='goalKick')release.age=0;
  release.saved=(release.keeper?.stats.saves||0)>saves;
  if(current.goals.length>goals){state.goalHeight=release.endHeight;state.goalLateral=(release.displayTarget?.x??release.target.x)-release.target.x;if(release.kind==='shot')state.goalTravel=v101GoalTravel(release)}
  if(release.kind==='shot'&&!release.onTarget&&!release.blocked)state.miss=release;
  return value;
 });
 release.flight=current.flight;if(current.flight.shotMotion){release.startHeight=current.flight.shotMotion.startHeight;release.endHeight=current.flight.shotMotion.endHeight;}v99Flights.set(current.flight,release);
 return result;
};
const v99BaseStep=step;
step=function(delta,realDelta){
 const current=match,state=current&&v99Actions.get(current);
 if(state&&running&&!(typeof v47PlayerDialog!=='undefined'&&v47PlayerDialog.open)){
  const dt=Math.max(0,realDelta);
  for(const [id,kick]of state.kicks){
   if(kick.phase==='follow'){kick.age+=dt;if(kick.age>.45)state.kicks.delete(id)}
   else if(current.owner!==kick.keeper||current.setPiece||current.kickoff||current.goalPause>0)state.kicks.delete(id);
  }
  for(const poses of [state.keepers,state.throws])for(const [id,pose]of poses){
   if(pose.completed){pose.age+=dt;if(pose.age>(pose.kind==='throw'?.32:current.attackFlow?.flowVersion===159||typeof window!=='undefined'&&window.D6UserMeshyPlayer?.nativeBall?1.55:.95))poses.delete(id)}
   else if(current.flight!==pose.flight)poses.delete(id);
  }
  if(state.miss){state.miss.age+=dt;if(state.miss.age>1.5)state.miss=null}
 }
 const result=v99BaseStep(delta,realDelta);
 // Flight progress advances after movement; latch the dive before the first rendered save.
 const release=current?.flight&&v99Flights.get(current.flight);if(release?.keeper&&release.onTarget&&!release.blocked&&!release.launched&&!v131KeeperSetting(current,release.keeper)){release.launched=true;release.diveAt=current.flight.progress;release.keeperStart={x:release.keeper.x,y:release.keeper.y};if(typeof v158KeeperLaunch==='function')v158KeeperLaunch(current,release.keeper,current.flight);}
 v99FlushSwaps();return result;
};
function v99BallView(current){
 if(current.finished||current.halftimePause>0)return null;
 const penaltyBall=v182PenaltyFrameBall(current);if(penaltyBall)return penaltyBall;
 const held=current.attackFlow?.keeperHoldRevision===182&&v182KeeperHold(current);if(held)return held;
 const state=v99Actions.get(current),release=current.flight&&v99Flights.get(current.flight);
 if(current.postBanner?.kind==='goal'&&state?.goalTravel)return v101GoalBall(state.goalTravel,typeof v83GoalSceneDuration==='number'?v83GoalSceneDuration:4.05);
 if(current.goalScene&&(current.goalPause>0||current.postBanner?.kind==='goal')){
  const scene=current.goalScene,time=Math.max(0,scene.elapsed),direction=scene.team===0?-1:1;
  if(state?.goalTravel)return v101GoalBall(state.goalTravel,time);
  const impact=.12,depth=time<impact?1.9*time/impact:1.9-.52*(1-Math.exp(-(time-impact)*7));
  const startHeight=state?.goalHeight||.35,fall=Math.max(0,time-impact);
  return {x:scene.x+(state?.goalLateral||0),y:(scene.team===0?v55Field.top:v55Field.bottom)+direction*depth*(v55Field.bottom-v55Field.top)/v160PitchLength(),
   elevation:Math.max(.29,startHeight-5*fall*fall)};
 }
 const kickoffBall=typeof v114KickoffBalls!=='undefined'&&v114KickoffBalls.get(current);
 if(kickoffBall&&!current.flight&&current.kickoff===kickoffBall.kickoff&&current.kickoff.phase!=='rolling'){const age=Math.max(0,v102Clock(current)-kickoffBall.at);return age<.35?{...kickoffBall.start,opacity:Math.max(0,1-age/.25)}:{x:.5,y:.5,elevation:.29,opacity:Math.min(1,(age-.35)/.25)}}
 const offsideBall=v115OffsideBalls.get(current);if(offsideBall&&offsideBall.piece===current.setPiece&&!current.flight){const age=Math.max(0,v102Clock(current)-offsideBall.at);return age<.35?{...offsideBall.start,elevation:.29,opacity:Math.max(0,1-age/.25)}:{...current.setPiece.spot,elevation:.29,opacity:Math.min(1,(age-.35)/.25)}}
 if(current.throwIn?.taker&&current.throwIn.ready>0)return v115ThrowHold(current);
 if(release){
  const q=Math.max(0,Math.min(1,current.flight.progress));
  if(release.kind==='shot')return v101ShotPoint(release,q);
  if(release.kind==='goalKick'){
   const aerial=current.attackFlow?.keeperHoldRevision===182&&v102Flights.get(current.flight);
   if(aerial?.high)return v102FlightBall({...aerial,start:release.start,startHeight:release.startHeight},q);
   return {x:release.start.x+(release.target.x-release.start.x)*q,y:release.start.y+(release.target.y-release.start.y)*q,elevation:release.startHeight+(release.endHeight-release.startHeight)*q+.12*Math.sin(Math.PI*q)};
  }
  const start=release.visualStart||{x:current.flight.x,y:current.flight.y},end=release.over?{x:.5+(release.shooter.n%2?-.045:.045),y:release.target.y}:release.displayTarget||release.target;
  return {x:start.x+(end.x-start.x)*q,y:start.y+(end.y-start.y)*q,
   elevation:release.startHeight*(1-q)+release.endHeight*q+Math.sin(Math.PI*q)*(release.kind==='throw'?1.35:release.blocked?.25:.75)};
 }
 const outgoing=state?.outBall;
 if(outgoing&&!current.flight){const age=v102Clock(current)-outgoing.at;
  if(age<1.15)return {x:outgoing.start.x+outgoing.velocity.x*age,y:outgoing.start.y+outgoing.velocity.y*age,elevation:Math.max(.29,outgoing.start.elevation+outgoing.velocity.height*age-4.9*age*age),opacity:Math.max(0,Math.min(1,(1.1-age)/.45))};
  if(age<1.5&&current.owner?.keeper)return {...v101KickPoint(current.owner,v101KickTarget(current,current.owner)),elevation:.29,opacity:Math.max(0,Math.min(1,(age-1.15)/.35))};
 }
 if(state?.miss){const pose=state.miss,time=pose.age,seconds=pose.flight.duration/(current.si?v183Rate(current):typeof MATCH_SPEED==='number'?MATCH_SPEED:.78);
  if(time>=1.15&&current.owner?.keeper)return {...v101KickPoint(current.owner,v101KickTarget(current,current.owner)),elevation:.29,opacity:Math.max(0,Math.min(1,(time-1.15)/.35))};
  const startY=pose.flight.y,velocityY=(pose.target.y-startY)/seconds;
  // Continue the incoming forward/upward velocity instead of reflecting at the bar.
  const end=v101ShotPoint(pose,1),velocityHeight=end.vh;
  return {x:end.x+end.vx*time,y:pose.target.y+velocityY*time,
   elevation:Math.max(.29,pose.endHeight+velocityHeight*time-4.9*time*time),opacity:Math.max(0,Math.min(1,(1.1-time)/.45))};
 }
 // A confirmed pickup/smother has its own native contact. A previous parry
 // also increments saves, but cannot represent the newly held ball.
 const secured=current.owner?.keeper&&!current.flight&&typeof v115KeeperChallengeAction==='function'&&v115KeeperChallengeAction(current,current.owner);
 if(secured?.saved&&secured.target)return {...secured.target,elevation:secured.height??.29};
 const caught=current.owner?.keeper&&state?.keepers.get(current.owner.pid);
 if(caught?.completed&&caught.saved&&!caught.parry&&!current.flight)return v101ShotPoint(caught,1);
 if(current.owner?.keeper&&v101KeeperWaiting(current,current.owner))return {...v101KickPoint(current.owner,v101KickTarget(current,current.owner)),elevation:.29};
 return null;
}
function v99PlayerAction(current,person){
 if(current.finished||current.halftimePause>0)return null;
 if(person.keeper&&(current.kickoff||current.pendingKickoff!=null))return null;
 const native=current.attackFlow?.flowVersion===159||typeof window!=='undefined'&&window.D6UserMeshyPlayer?.nativeBall;
 const held=current.attackFlow?.keeperHoldRevision===182&&v99Actions.get(current)?.kicks.get(person.pid);
 const holding=Boolean(held?.holdPoint&&v101KeeperWaiting(current,person));
 // v182 only decorates the existing keeper phases. Never replace an active
 // catch/recovery with placement; both renderers receive the same hand fact.
 const smother=typeof v115KeeperChallengeAction==='function'&&v115KeeperChallengeAction(current,person);if(smother)return {...smother,parry:false,...(holding?{holding:true}:{})};
 if(v65WorldActive&&current.kickoff?.kicker===person&&current.kickoff.phase!=='rolling'&&v115KickoffReady(current))return {kind:'passReady',progress:current.postBanner?Math.min(1,Math.max(0,1-current.postBanner.wait/.35)):0,target:current.kickoff.support};
 if(current.throwIn?.taker===person&&current.throwIn.ready>0)return {kind:'throw',progress:Math.min(1,current.throwIn.ready/.55),holding:true,pickup:Math.min(1,current.throwIn.ready/.35),target:{x:person.x+(person.x<.5?.15:-.15),y:person.y}};
 const state=v99Actions.get(current),throwPose=state?.throws.get(person.pid);
 if(person.keeper&&state?.outBall&&v102Clock(current)-state.outBall.at<1.05)return null;
 if(person.keeper&&state?.miss&&state.miss.age<1.05)return null;
 if(throwPose)return {kind:'throw',progress:throwPose.completed?1:Math.min(1,(current.flight?.progress||0)*4),holding:false,target:throwPose.target};
 const kick=state?.kicks.get(person.pid),keeper=state?.keepers.get(person.pid);
 if(kick&&(kick.phase==='follow'||v101KeeperWaiting(current,person))&&(!keeper||keeper.completed&&keeper.age>=(native?1.55:.95))){
  const progress=kick.phase==='waiting'?holding?v182KeeperPlacement(current,kick):Math.max(0,Math.min(1,1-(current.next-current.elapsed)/(current.si?v183Rate(current):MATCH_SPEED)/.28)):Math.min(1,kick.age/.45);
  return {kind:'goalKick',phase:kick.phase,held:Boolean(kick.held),progress,target:kick.target||v101KickTarget(current,person),...(holding?{holding:progress<=.55}:current.attackFlow?.keeperHoldRevision===182&&kick.held&&kick.phase==='follow'?{holding:false}:{})};
 }
 if(!keeper)return null;
 if(v131KeeperSetting(current,person))return null;
 const q=v131KeeperContactProgress(keeper),contact=v101ShotPoint(keeper,q),from=keeper.diveAt??(current.flight?.progress||0);
 return {kind:'save',progress:keeper.completed?1:clamp(((current.flight?.progress||0)-from)/Math.max(.1,q-from),0,1),recovery:keeper.completed?Math.min(1,keeper.age/(native?1.55:.95)):0,
  target:{x:contact.x,y:contact.y},origin:keeper.keeperStart,height:contact.elevation,available:keeper.flight.duration/(current.si?v183Rate(current):MATCH_SPEED),saved:keeper.saved,parry:Boolean(keeper.parry),goal:Boolean(keeper.goal),...(holding?{holding:true}:{})};
}

// Keep the goal view visible before resolving a regular world-match penalty.
const v143BaseTakePenalty=v50TakePenalty;
v50TakePenalty=function(setPiece){
 if(v65WorldActive&&setPiece.phase==='waiting'&&!setPiece.penaltyReady){setPiece.penaltyReady=true;setPiece.wait=2;v50PenaltyVisual(setPiece,null);return;}
 return v143BaseTakePenalty(setPiece);
};
