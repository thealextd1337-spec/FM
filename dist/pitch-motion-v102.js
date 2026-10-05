'use strict';

// Presentation data belongs to this match instance, never to a saved match.
const v102Motion=new WeakMap(),v102Flights=new WeakMap();
let v102Release=null,v102Air=null;
function v102State(current){
 let state=v102Motion.get(current);if(!state){state={clock:0,serial:0,poses:new Map(),loose:null};v102Motion.set(current,state)}return state;
}
function v102Clock(current){return v102Motion.get(current)?.clock||0}
function v102Pose(current,person,kind,target,contact=null){
 // Contact is still at progress zero; only the visual follow-through lasts longer.
 const nativeShot=typeof window!=='undefined'&&window.D6UserMeshyPlayer?.nativeShot;
 const nativeBall=typeof window!=='undefined'&&window.D6UserMeshyPlayer?.nativeBall;
 const duration=nativeBall&&kind==='receive'?.45:nativeBall&&kind==='control'?.48:kind==='header'?.62:kind==='pass'?(nativeBall?.62:.40):nativeShot&&['shot','freeKick'].includes(kind)?.95:['shot','freeKick','volley'].includes(kind)?.60:['cross','highPass'].includes(kind)?(nativeBall?.78:.55):.48;
 const state=v102State(current),pose={id:++state.serial,kind,target:{...target},contact:contact&&{...contact},at:state.clock,duration};
 state.poses.set(person.pid,pose);return pose;
}
function v102Scoped(person,kind,fn){
 const previous=v102Release;v102Release=v65WorldActive?{person,kind,contact:v102Air?.end||(v127OneTouchRelease?.person===person?v127OneTouchRelease.point:null)||(kind==='header'?{x:person.x,y:person.y}:null)}:null;
 try{return fn()}finally{v102Release=previous}
}
const v102GroundPass=v55GroundPass;
v55GroundPass=function(person,receiver,kind,...args){return v102Scoped(person,kind==='header'?'header':'pass',()=>v102GroundPass(person,receiver,kind,...args))};
const v102HighPass=v55HighPass;
v55HighPass=function(person,receiver,options){return v102Scoped(person,options?.cross?'cross':'highPass',()=>{if(v102Release&&options?.corner)v102Release.contact={...match.ball};return v102HighPass(person,receiver,options)})};
const v102Shoot=v55Shoot;
v55Shoot=function(person,kind,...args){return v102Scoped(person,kind==='header'?'header':kind==='volley'?'volley':kind==='direct-free-kick'?'freeKick':'shot',()=>v102Shoot(person,kind,...args))};
const v102ResolveAir=v55ResolveAir;
v55ResolveAir=function(info){const previous=v102Air;v102Air=v65WorldActive?info:null;try{return v102ResolveAir(info)}finally{v102Air=previous}};
// Called only after the engine has selected the actual winner, including clears.
function v102AirContact(person,end){
 if(!v65WorldActive)return;
 v102Pose(match,person,'control',end,end).aerial=true;
}
function v102AirClear(person,end,target){
 if(!v65WorldActive)return;
 const pose=v102Pose(match,person,'header',target,end),state=v102State(match);
 state.loose={at:state.clock,start:{...end},target:{...target},duration:typeof v122HeaderSpeed==='function'?Math.max(.35,v122Metres(end,target)/v122HeaderSpeed(person)):.3,pose:pose.id};
}
function v102AirHeight(current,target){
 const nearest=Math.min(...current.people.filter(p=>!p.keeper).map(p=>Math.hypot(p.x-target.x,p.y-target.y)));
 return .29+2.36*Math.max(0,Math.min(1,(.09-nearest)/.035));
}
const v102Fly=fly;
fly=function(target,duration,done){
 const current=match,release=v102Release;
 if(!release)return v102Fly(target,duration,done);
 const state=v102State(current),keeperKick=v99Actions.get(current)?.kicks.get(release.person.pid)?.phase==='waiting';
 const contact=release.contact,kind=release.kind,high=kind==='highPass'||kind==='cross';
 const start=contact?{...contact}:v101KickPoint(release.person,target);
 const startHeight=release.height??(kind==='header'?2.65:kind==='volley'?1.2:.29);
 const meta={kind,person:release.person,start,target:{...target},startHeight,endHeight:high?v102AirHeight(current,target):.29,at:state.clock,duration:duration/MATCH_SPEED,high};
 if(!keeperKick){const pose=v102Pose(current,release.person,kind,target,contact);if(v127OneTouchRelease?.person===release.person)pose.direct=true;}
 state.loose=null;
 const result=v102Fly(target,duration,()=>{
  const value=done();
  // An uncontested aerial ball lands; control brings it smoothly down to feet.
  if(high){const pose=[...state.poses.values()].find(p=>p.at===state.clock&&p.contact);if(pose)meta.endHeight=pose.kind==='volley'?1.2:2.65;
   if(!pose&&!current.flight&&current.rebound&&!state.loose&&meta.endHeight>.4){const duration=Math.sqrt(2*(meta.endHeight-.29)/9.8);state.loose={at:state.clock,start:{...target},target:{...current.ball},duration,drop:true,free:true,startHeight:meta.endHeight,owner:null};}
   if(!current.flight&&(current.owner&&!current.owner.keeper||pose?.kind==='control'&&current.rebound))state.loose={at:state.clock,start:{...target},target:{x:current.ball.x,y:current.ball.y},duration:.23,drop:true,startHeight:meta.endHeight,owner:current.owner};}
  return value;
 });
 const flight=current.flight;if(!flight)return result;
 if(keeperKick&&high){const kick=v99Actions.get(current)?.kicks.get(release.person.pid);if(kick){kick.phase='follow';kick.age=0;kick.target={...target};}}
 meta.duration=flight.duration/MATCH_SPEED;
 meta.flight=flight;v102Flights.set(flight,meta);
 const shot=v99Flights.get(flight);
 if(shot?.kind==='shot'){shot.visualStart=start;shot.startHeight=startHeight;meta.shot=true;}
 return result;
};
const v102Step=step;
step=function(delta,realDelta){
 if(v65WorldActive&&match&&running&&!v47PlayerDialog.open){
  const state=v102State(match);state.clock+=Math.max(0,realDelta);
  for(const [id,pose]of state.poses)if(state.clock-pose.at>pose.duration)state.poses.delete(id);
  if(state.loose&&(state.clock-state.loose.at>state.loose.duration||match.flight||state.loose.drop&&match.owner!==state.loose.owner||!state.loose.drop&&match.owner))state.loose=null;
 }
 const result=v102Step(delta,realDelta),meta=match?.flight&&v102Flights.get(match.flight);
 if(meta?.high)meta.endHeight=typeof v122AerialPlans!=='undefined'&&v122AerialPlans.has(match.flight)?2.65:v102AirHeight(match,meta.target);
 return result;
};
function v102FlightBall(meta,q){
 return {x:meta.start.x+(meta.target.x-meta.start.x)*q,y:meta.start.y+(meta.target.y-meta.start.y)*q,
  elevation:meta.startHeight*(1-q)+meta.endHeight*q+Math.sin(Math.PI*q)*(meta.high?4.1:meta.kind==='header'?.65:.06)};
}
const v102BallView=v99BallView;
v99BallView=function(current){
 const existing=v102BallView(current),meta=current.flight&&v102Flights.get(current.flight);
 if(current.finished||current.goalPause>0||current.setPiece||current.throwIn)return existing;
 if(meta&&!meta.shot&&v99Flights.get(current.flight)?.kind!=='goalKick')return v102FlightBall(meta,Math.max(0,Math.min(1,current.flight.progress)));
 const state=v102Motion.get(current),loose=state?.loose;
 if(loose&&!current.flight){const time=Math.max(0,state.clock-loose.at),q=Math.max(0,Math.min(1,time/loose.duration));if(loose.free)return {...current.ball,elevation:Math.max(.29,loose.startHeight-4.9*time*time)};return {x:loose.start.x+(loose.target.x-loose.start.x)*q,y:loose.start.y+(loose.target.y-loose.start.y)*q,elevation:loose.drop?Math.max(.29,loose.startHeight+(.29-loose.startHeight)*q):2.65*(1-q)+.29*q+1.1*Math.sin(Math.PI*q)}}
 return existing;
};
function v102PlayerAction(current,person){
 const existing=v99PlayerAction(current,person);if(existing)return {...existing,id:existing.kind};
 const state=v102Motion.get(current),pose=state?.poses.get(person.pid);
 if(pose){const progress=Math.max(0,Math.min(1,(state.clock-pose.at)/pose.duration));return {...pose,progress}}
 const flight=current.flight,meta=flight&&v102Flights.get(flight);
 const plan=typeof v122AerialPlans!=='undefined'&&v122AerialPlans.get(flight),remaining=flight?(1-flight.progress)*flight.duration/MATCH_SPEED:Infinity;
 const ground=v127GroundReceivers.get(flight);
 if(meta?.kind==='pass'&&ground?.receiver===person&&!ground.offside&&remaining<.25){const choice=v127DirectOptions(person,meta.target,meta.start);if(choice?.kind)return {id:'direct-ready',kind:choice.kind==='pass'?'passReady':'kickReady',direct:true,target:choice.target,contact:meta.target,progress:clamp(1-remaining/.25,0,1)};}
 if(meta?.high&&!person.keeper&&(plan?plan.contenders.includes(person)&&v122Metres(person,meta.target)<=.65:Math.hypot(person.x-meta.target.x,person.y-meta.target.y)<.055)&&(plan?remaining<.30:flight.progress>.65)){
  return {id:'air-ready',kind:'airReady',target:meta.target,contact:meta.target,progress:Math.max(0,plan?1-remaining/.30:(flight.progress-.65)/.35)};
 }
 return null;
}

// One simulation-frame buffer. Sampling never steps the match or consumes RNG.
function v102Interpolate(a,b,q){
 if(!a||a.turned!==b.turned||!a.offside&&b.offside||q>=1)return {...b,ball:{...b.ball},players:b.players.map(p=>({...p}))};
 const lerp=(x,y)=>x+(y-x)*q,old=new Map(a.players.map(p=>[p.id,p]));
 const players=b.players.map(p=>{
  const before=old.get(p.id);if(!before)return {...p};
  const action=before.action?.id===p.action?.id&&before.action?.kind===p.action?.kind&&p.action?{...p.action,progress:lerp(before.action.progress,p.action.progress),recovery:lerp(before.action.recovery||0,p.action.recovery||0),...(Number.isFinite(before.action.age)&&Number.isFinite(p.action.age)?{age:lerp(before.action.age,p.action.age)}:{})}:q<1?before.action:p.action;
  const movement=before.movement?.mode===p.movement?.mode&&p.movement?{...p.movement,facing:{x:lerp(before.movement.facing.x,p.movement.facing.x),z:lerp(before.movement.facing.z,p.movement.facing.z)}}:p.movement;
  return {...p,x:lerp(before.x,p.x),z:lerp(before.z,p.z),slideActive:before.slideActive,action,movement};
 });
 // Ownership and its flags belong to the same buffered picture.
 const hiddenReset=Math.min(a.ball.opacity??1,b.ball.opacity??1)===0&&Math.hypot(a.ball.x-b.ball.x,a.ball.z-b.ball.z)>2;
 const resetBall=(a.ball.opacity??1)===0?b.ball:a.ball;
 return {...b,elapsed:lerp(a.elapsed,b.elapsed),clock:lerp(a.clock,b.clock),broadcast:a.broadcast?{...a.broadcast,seconds:a.broadcast.period===b.broadcast?.period&&a.broadcast.added===b.broadcast.added?lerp(a.broadcast.seconds,b.broadcast.seconds):a.broadcast.seconds}:b.broadcast,owner:a.owner,carrying:a.carrying,ballInFlight:a.ballInFlight,outOfPlayBall:a.outOfPlayBall,players,
  celebration:a.celebration&&b.celebration&&a.celebration.id===b.celebration.id&&a.celebration.team===b.celebration.team?{...b.celebration,time:lerp(a.celebration.time,b.celebration.time)}:b.celebration,
  ball:{x:hiddenReset?resetBall.x:lerp(a.ball.x,b.ball.x),z:hiddenReset?resetBall.z:lerp(a.ball.z,b.ball.z),height:hiddenReset?resetBall.height:lerp(a.ball.height,b.ball.height),opacity:lerp(a.ball.opacity??1,b.ball.opacity??1)},offside:a.offside};
}
// Solve against the actual model joints, including the body's forward lean.
function v102LegPose(visual,leg,ankleHeight,reach,lean){
 ankleHeight+=visual.meshy?.ankleLift[leg]||0;
 const hipHeight=visual.limbs[leg*2].position.y||.89,thigh=-visual.knees[leg].position.y||.4,shin=-visual.feet[leg].position.y||.38;
 const dy=ankleHeight-visual.body.position.y-hipHeight*Math.cos(lean),dz=reach-visual.body.position.z-hipHeight*Math.sin(lean);
 const y=dy*Math.cos(lean)+dz*Math.sin(lean),z=dz*Math.cos(lean)-dy*Math.sin(lean),r=Math.max(Math.abs(thigh-shin)+.0001,Math.min(thigh+shin-.0001,Math.hypot(y,z)));
 const hip=Math.atan2(-z,-y)-Math.acos(Math.max(-1,Math.min(1,(thigh*thigh+r*r-shin*shin)/(2*thigh*r))));
 const knee=Math.PI-Math.acos(Math.max(-1,Math.min(1,(thigh*thigh+shin*shin-r*r)/(2*thigh*shin))));
 visual.limbs[leg*2].rotation.x=hip;visual.knees[leg].rotation.x=knee;visual.feet[leg].rotation.x=-hip-knee-lean;
}
// Visual velocity and state weights never move the simulation's player root.
function v106Smooth(a,b,dt,rate){return a+(b-a)*(1-Math.exp(-Math.max(0,dt)*rate))}
function v106Angle(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
function v102RunPose(visual,person,dt,live,focus=null){
 const dx=person.x-visual.previous.x,dz=person.z-visual.previous.z,distance=Math.hypot(dx,dz),speed=live?Math.min(8,distance/Math.max(.001,dt)):0;
 const m=visual.locomotion||(visual.locomotion={state:'idle',idle:1,walk:0,run:0,clock:0,acceleration:0,turn:0});
 if(live&&dt>0){
  const before=visual.runSpeed||0;visual.runSpeed=v106Smooth(before,speed,dt,speed>before?9:14);
  m.acceleration=v106Smooth(m.acceleration,(visual.runSpeed-before)/dt,dt,12);m.clock+=dt;
  // Longer strides and a human cadence ceiling; the physical root stays immediate.
  visual.runPhase=(visual.runPhase??person.number)+Math.min(distance*4.4,dt*14);
  // Hysteresis prevents near-zero and walk/run threshold flicker.
  m.state=m.state==='idle'?(speed>.22?'walk':'idle'):speed<.10?'idle':m.state==='run'?(speed<1.65?'walk':'run'):speed>2.05?'run':'walk';
  const moving=Math.min(1,Math.max(0,(visual.runSpeed-.04)/.4)),run=Math.min(1,Math.max(0,(visual.runSpeed-1.35)/1.25))*moving;
  m.idle=1-moving;m.walk=moving-run;m.run=run;
  if(speed>.10||person.keeper&&focus||person.movement?.mode==='restart'){const face=person.keeper?focus:['backpedal','restart'].includes(person.movement?.mode)?person.movement.facing:null,target=face?Math.atan2(face.x-person.x,face.z-person.z):Math.atan2(dx,dz),turn=v106Angle(visual.heading??target,target),advance=turn*(1-Math.exp(-dt*(Math.abs(turn)>1.8?11:8)));
   if(!person.keeper&&!person.action&&!face){if(distance>4)m.headingVelocity=0;m.headingVelocity=v106Smooth(m.headingVelocity||0,advance/dt,dt,24);const step=m.headingVelocity*dt;visual.heading=(visual.heading??target)+(Math.sign(step)===Math.sign(turn)?Math.sign(turn)*Math.min(Math.abs(turn),Math.abs(step)):step);}
   else{m.headingVelocity=0;visual.heading=(visual.heading??target)+advance;}
   m.turn=v106Smooth(m.turn,turn,dt,10);
  }else{m.headingVelocity=0;m.turn=v106Smooth(m.turn,0,dt,12);}
 }
 const amplitude=Math.min(1,(visual.runSpeed||0)/2.6),phase=visual.runPhase??person.number,turn=Math.max(-1,Math.min(1,m.turn)),reduced=Boolean(visual.reducedMotion);
 for(const group of [visual.body,...visual.limbs,...visual.knees,...visual.feet,...visual.elbows,visual.neck])group.rotation.set(0,0,0);
 const breath=reduced?0:Math.sin(m.clock*2.1+person.number)*.0025*m.idle;
 const impulse=reduced?0:Math.max(-.04,Math.min(.045,m.acceleration*.004));
 const lean=amplitude*.04+impulse,walk=m.walk,run=m.run;
 visual.body.position.set(0,-.105*amplitude+(1-Math.cos(phase*2))*amplitude*.008+breath,0);
 m.slide=v106Smooth(m.slide||0,person.slideActive?1:0,live?dt:0,10);
 visual.body.rotation.x=lean;visual.body.rotation.y=turn*.16*(reduced?.35:1);visual.body.rotation.z=(Math.sin(phase)*amplitude*.008-turn*run*.006);
 const backward=person.movement?.mode==='backpedal'?-1:1,swing=Math.sin(phase)*(.20*walk+.42*run)*backward;
 visual.limbs[1].rotation.x=-swing*.7;visual.limbs[3].rotation.x=swing*.7;
 for(let i=0;i<2;i++){
  const cycle=((phase/(2*Math.PI)+i*.5)%1+1)%1,planted=cycle<.6,q=planted?cycle/.6:(cycle-.6)/.4;
  const reach=(planted?1-2*q:-Math.cos(Math.PI*q))*(.26*walk+.38*run)*backward,lift=planted?0:Math.pow(Math.sin(Math.PI*q),2)*(.08*walk+.18*run);
  v102LegPose(visual,i,.11+lift,reach,lean);visual.elbows[i].rotation.x=-.18-.18*walk-.28*run;
  visual.feet[i].rotation.y=turn*.10*(planted?.25:1);
 }
 let look=turn*.28;
 if(focus&&m.idle>.5){const target=Math.atan2(focus.x-person.x,focus.z-person.z);look=Math.max(-.35,Math.min(.35,v106Angle(visual.heading??0,target)))*m.idle;}
 m.look=v106Smooth(m.look||0,look,live?dt:0,12);visual.neck.rotation.y=m.look*(reduced?.35:1);
 // Keep the keeper square to the ball while shuffling across the goal.
 const lateral=Math.cos(visual.heading||0)*dx-Math.sin(visual.heading||0)*dz,sideways=person.keeper&&focus&&!person.action&&!person.slideActive&&speed>.12&&speed<4.1&&distance>.00001&&Math.abs(lateral)/distance>.72;
 m.keeperSide=v106Smooth(m.keeperSide||0,sideways?1:0,live?dt:0,14);
 // A stationary keeper stays square with open ready hands, including corners.
 // Distance must not switch him to the outfield player's relaxed stand pose.
 const ready=person.keeper&&focus&&!person.action&&!person.slideActive&&(sideways||speed<.12);
 m.keeperReady=v106Smooth(m.keeperReady||0,ready?1:0,live?dt:0,14);
 if(m.keeperReady>.001){
  const w=m.keeperReady,step=Math.min(1,m.keeperSide/Math.max(.001,w)),groups=[visual.body,...visual.limbs,...visual.knees,...visual.feet,...visual.elbows,visual.neck],before=groups.map(g=>g.rotation.clone()),body=visual.body.position.clone();
  visual.body.position.set(0,.02,-.80);visual.body.rotation.set(.55,0,0);visual.neck.rotation.x=-.40;
  for(let i=0;i<2;i++){
   const wave=Math.sin(phase+i*Math.PI),lift=Math.max(0,wave)*.075*step;
   v102LegPose(visual,i,.11+lift,.04,.55);
   const spread=(i===0?1:-1)*(.23+.06*wave*step);
   visual.limbs[i*2].rotation.z=spread;visual.feet[i].rotation.z=-spread;
   // Open the ready arms; inward shoulder angles make the gloves clasp at the waist.
   visual.limbs[i*2+1].rotation.set(-.08,0,.08*(i===0?1:-1));visual.elbows[i].rotation.x=-.48;
  }
  groups.forEach((g,i)=>{for(const axis of ['x','y','z'])g.rotation[axis]=before[i][axis]+v106Angle(before[i][axis],g.rotation[axis])*w});visual.body.position.lerp(body,1-w);
 }
 // A slide has a low pelvis and a leading boot, not a sideways running cycle.
 // Blend only the rig; the engine owns the tackle's path and contact time.
 if(visual.meshy&&m.slide>.001&&!person.keeper){
  const w=m.slide,groups=[visual.body,...visual.limbs,...visual.knees,...visual.feet,...visual.elbows,visual.neck],before=groups.map(g=>g.rotation.clone()),body=visual.body.position.clone();
  visual.body.position.set(0,-1.04,0);visual.body.rotation.set(-.28,0,.10);
  v102LegPose(visual,0,.13,1.20,-.28);v102LegPose(visual,1,.16,.10,-.28);
  visual.limbs[0].rotation.z=-.08;visual.limbs[2].rotation.z=.12;
  visual.limbs[1].rotation.set(.22,0,-.55);visual.limbs[3].rotation.set(-.30,0,.42);
  visual.elbows[0].rotation.x=-.30;visual.elbows[1].rotation.x=-.55;visual.neck.rotation.x=.18;
  groups.forEach((g,i)=>{for(const axis of ['x','y','z'])g.rotation[axis]=before[i][axis]+v106Angle(before[i][axis],g.rotation[axis])*w});
  visual.body.position.lerp(body,1-w);
 }
 visual.movementState=m.state;return speed;
}
// Blend interrupted special gestures back to today's locomotion, never delay a contact.
function v106PoseSnapshot(v,p){const groups=[v.body,...v.limbs,...v.knees,...v.feet,...v.elbows,v.neck];return {rot:groups.map(g=>({x:g.rotation.x,y:g.rotation.y,z:g.rotation.z})),body:{x:v.body.position.x,y:v.body.position.y,z:v.body.position.z},offset:{x:v.root.position.x-p.x,z:v.root.position.z-p.z},heading:v.root.rotation.y}}
function v106BlendSnapshot(v,p,s,weight){
 const groups=[v.body,...v.limbs,...v.knees,...v.feet,...v.elbows,v.neck];
 groups.forEach((g,i)=>{for(const axis of ['x','y','z'])g.rotation[axis]+=v106Angle(g.rotation[axis],s.rot[i][axis])*weight});
 for(const axis of ['x','y','z'])v.body.position[axis]+=(s.body[axis]-v.body.position[axis])*weight;
 v.root.position.x+=s.offset.x*weight;v.root.position.z+=s.offset.z*weight;v.root.rotation.y+=v106Angle(v.root.rotation.y,s.heading)*weight;
}
function v106GestureTransition(v,p,action,base,dt,live){
 const special=action&&['throw','goalKick','save'].includes(action.kind);
 if(special){
  const entry=action.kind==='block'||action.kind==='throw'||action.kind==='goalKick'||action.saved?1:Math.min(1,Math.max(0,action.progress/.12));
  if(entry<1){const target=v106PoseSnapshot(v,p);v106BlendSnapshot(v,p,base,1-entry*entry*(3-2*entry));v.root.position.x=p.x+target.offset.x*entry;v.root.position.z=p.z+target.offset.z*entry;}
 }
 if(!action&&v.lastGesture){if(!v.gestureExit)v.gestureExit={pose:v.lastGesture,left:.14};if(live)v.gestureExit.left=Math.max(0,v.gestureExit.left-dt);const q=v.gestureExit.left/.14;v106BlendSnapshot(v,p,v.gestureExit.pose,q*q*(3-2*q));if(q===0){v.gestureExit=null;v.lastGesture=null}}
 else if(action){v.gestureExit=null;v.lastGesture=v106PoseSnapshot(v,p)}
}
function v102ActionPose(visual,action,person,turned){
 if(visual.meshy&&!person.keeper&&(person.slideActive||(visual.locomotion?.slide||0)>.02&&['passReady','kickReady','receive','control'].includes(action.kind)))return;
 // Low reception uses the native gait and one foot contact, without turning back to the ball.
 if(visual.meshy&&window.D6UserMeshyPlayer?.nativeBall&&['receive','control','foulVictim','foulOffender'].includes(action.kind)&&!action.aerial)return;
 const p=action.progress,ease=(1+Math.cos(Math.PI*p))/2,header=action.kind==='header',ready=action.kind==='airReady',control=action.kind==='control',landing=action.kind==='airLand';
 const preparing=['passReady','kickReady'].includes(action.kind),recovery=Math.min(1,Math.max(0,(1-p)/.3)),entry=p<0?Math.max(0,1+p*action.duration/.08):1,blend=preparing?Math.min(1,Math.max(0,p/.3)):entry<1?entry:recovery,weight=ready?1:blend*blend*(3-2*blend);
 const groups=[visual.body,...visual.limbs,...visual.knees,...visual.feet,...visual.elbows,visual.neck],rotations=groups.map(g=>({x:g.rotation.x,y:g.rotation.y,z:g.rotation.z})),bodyY=visual.body.position.y;
 const target=v98PitchPoint(action.target,turned),heading=Math.atan2(target.x-person.x,target.z-person.z),baseHeading=visual.heading??visual.root.rotation.y;
 // A rebound target changes at contact; it must not flip the blocker's body and foot offset.
 visual.root.rotation.y=action.kind==='block'?baseHeading:baseHeading+Math.atan2(Math.sin(heading-baseHeading),Math.cos(heading-baseHeading))*weight;
 if(preparing&&visual.meshy)visual.heading=visual.root.rotation.y;
 if(action.kind==='block'&&action.contact){const contact=v98PitchPoint(action.contact,turned),facing=visual.root.rotation.y,dx=contact.x-Math.sin(facing)*.55-person.x,dz=contact.z-Math.cos(facing)*.55-person.z,limit=Math.min(1,.65/Math.max(.001,Math.hypot(dx,dz)));visual.root.position.x+=dx*limit*weight;visual.root.position.z+=dz*limit*weight}
 if(header||ready||control||landing){
  const contact=v98PitchPoint(action.contact||action.target,turned),reach=ready?p:Math.min(1,Math.pow(1-p,2));
  // Leave room for the head and the radius of the ball at forehead contact.
  const facing=visual.root.rotation.y;
  const headReach=visual.meshy?.headerReach??.54;
  const dx=contact.x-Math.sin(facing)*headReach-person.x,dz=contact.z-Math.cos(facing)*headReach-person.z,limit=Math.min(1,.45/Math.max(.001,Math.hypot(dx,dz)));
  if(!landing){visual.root.position.x+=dx*limit*reach*weight;visual.root.position.z+=dz*limit*reach*weight;}
  const jump=ready?.25*Math.sin(p*Math.PI/2):header||landing||action.aerial?.25*Math.pow(1-p,2):0;
  visual.body.position.y=jump-(p>.6?.12*Math.sin((p-.6)/.4*Math.PI):0);
  visual.body.rotation.x=ready?-.12*p:header?.34*Math.sin(Math.PI*p):.08*ease;
  visual.neck.rotation.x=ready?-.16*p:header?.38*Math.sin(Math.PI*p):0;
  for(const i of [0,2])visual.limbs[i].rotation.x=-.15*ease;
  for(const knee of visual.knees)knee.rotation.x=.25*ease+(p>.6?.45*Math.sin((p-.6)/.4*Math.PI):0);
  visual.limbs[1].rotation.z=-.45*ease;visual.limbs[3].rotation.z=.45*ease;
 }else{
  const strong=['shot','freeKick','volley'].includes(action.kind),high=['highPass','cross'].includes(action.kind),volley=action.kind==='volley';
  if(volley&&action.contact){const contact=v98PitchPoint(action.contact,turned),facing=visual.root.rotation.y;visual.root.position.x+=(contact.x-Math.sin(facing)*.67-person.x)*ease*weight;visual.root.position.z+=(contact.z-Math.cos(facing)*.67-person.z)*ease*weight;}
  const wind=p<0?Math.min(1,-p*action.duration/.08):0;
  visual.body.rotation.x=(strong?.2:high?-.08:.08)*ease;visual.body.rotation.y=(strong?.22:.08)*Math.sin(Math.PI*p);
  visual.body.rotation.z=0;
  visual.limbs[1].rotation.x=.35*ease;visual.limbs[3].rotation.x=-.3*ease;
  visual.limbs[1].rotation.z=-.35*ease;visual.limbs[3].rotation.z=.45*ease;
  for(const elbow of visual.elbows)elbow.rotation.x=-.35*ease;
  visual.body.position.y=-.025*ease;
  // The support sole stays on the grass. The other boot meets the ball at release.
  v102LegPose(visual,0,.11,-.04,visual.body.rotation.x);
  const follow=Math.sin(Math.PI*Math.max(0,p)),scale=visual.root.scale?.y||1.12,height=(volley?1.2:.29)/scale-.02;
  v102LegPose(visual,1,wind?.14:height+(strong?.18:.08)*follow,wind?-.32*wind:.65/scale-.19+.12*follow,visual.body.rotation.x);
  visual.feet[1].rotation.y=(strong?0:.22)*ease;
 }
 // Release the gesture gradually into the current distance-driven run pose.
 groups.forEach((group,i)=>{for(const axis of ['x','y','z'])group.rotation[axis]=rotations[i][axis]+(group.rotation[axis]-rotations[i][axis])*weight});
 visual.body.position.y=bodyY+(visual.body.position.y-bodyY)*weight;
}
