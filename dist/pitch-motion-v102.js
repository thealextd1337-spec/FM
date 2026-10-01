'use strict';

// Presentation data belongs to this match instance, never to a saved match.
const v102Motion=new WeakMap(),v102Flights=new WeakMap();
let v102Release=null,v102Air=null;
function v102State(current){
 let state=v102Motion.get(current);if(!state){state={clock:0,serial:0,poses:new Map(),loose:null};v102Motion.set(current,state)}return state;
}
function v102Clock(current){return v102Motion.get(current)?.clock||0}
function v102Pose(current,person,kind,target,contact=null){
 const state=v102State(current),pose={id:++state.serial,kind,target:{...target},contact:contact&&{...contact},at:state.clock,duration:kind==='header'?.55:kind==='pass'?.3:.48};
 state.poses.set(person.pid,pose);return pose;
}
function v102Scoped(person,kind,fn){
 const previous=v102Release;v102Release=v65WorldActive?{person,kind,contact:v102Air?.end||(kind==='header'?{x:person.x,y:person.y}:null)}:null;
 try{return fn()}finally{v102Release=previous}
}
const v102GroundPass=v55GroundPass;
v55GroundPass=function(person,receiver,kind,...args){return v102Scoped(person,kind==='header'?'header':'pass',()=>v102GroundPass(person,receiver,kind,...args))};
const v102HighPass=v55HighPass;
v55HighPass=function(person,receiver,options){return v102Scoped(person,options?.cross?'cross':'highPass',()=>v102HighPass(person,receiver,options))};
const v102Shoot=v55Shoot;
v55Shoot=function(person,kind,...args){return v102Scoped(person,kind==='header'?'header':kind==='volley'?'volley':kind==='direct-free-kick'?'freeKick':'shot',()=>v102Shoot(person,kind,...args))};
const v102ResolveAir=v55ResolveAir;
v55ResolveAir=function(info){const previous=v102Air;v102Air=v65WorldActive?info:null;try{return v102ResolveAir(info)}finally{v102Air=previous}};
// Called only after the engine has selected the actual winner, including clears.
function v102AirContact(person,end){
 if(!v65WorldActive)return;
 v102Pose(match,person,'control',end,end);
}
function v102AirClear(person,end,target){
 if(!v65WorldActive)return;
 const pose=v102Pose(match,person,'header',target,end),state=v102State(match);
 state.loose={at:state.clock,start:{...end},target:{...target},duration:.3,pose:pose.id};
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
 const startHeight=kind==='header'?2.65:kind==='volley'?1.2:.29;
 const meta={kind,start,target:{...target},startHeight,endHeight:high?v102AirHeight(current,target):.29,at:state.clock,duration:duration/MATCH_SPEED,high};
 if(!keeperKick)v102Pose(current,release.person,kind,target,contact);
 state.loose=null;
 const result=v102Fly(target,duration,()=>{
  const value=done();
  // An uncontested aerial ball lands; control brings it smoothly down to feet.
  if(high){const pose=[...state.poses.values()].find(p=>p.at===state.clock&&p.contact);meta.endHeight=pose?.kind==='volley'?1.2:pose?2.65:.29;
   if(!current.flight&&(current.owner&&!current.owner.keeper||pose?.kind==='control'&&current.rebound))state.loose={at:state.clock,start:{...target},target:{x:current.ball.x,y:current.ball.y},duration:.23,drop:true,startHeight:meta.endHeight,owner:current.owner};}
  return value;
 });
 const flight=current.flight;if(!flight)return result;
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
 if(meta?.high)meta.endHeight=v102AirHeight(match,meta.target);
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
 if(loose&&!current.flight){const q=Math.max(0,Math.min(1,(state.clock-loose.at)/loose.duration));return {x:loose.start.x+(loose.target.x-loose.start.x)*q,y:loose.start.y+(loose.target.y-loose.start.y)*q,elevation:loose.drop?Math.max(.29,loose.startHeight+(.29-loose.startHeight)*q):2.65*(1-q)+.29*q+1.1*Math.sin(Math.PI*q)}}
 return existing;
};
function v102PlayerAction(current,person){
 const existing=v99PlayerAction(current,person);if(existing)return {...existing,id:existing.kind};
 const state=v102Motion.get(current),pose=state?.poses.get(person.pid);
 if(pose){const progress=Math.max(0,Math.min(1,(state.clock-pose.at)/pose.duration));return {...pose,progress}}
 const flight=current.flight,meta=flight&&v102Flights.get(flight);
 if(meta?.high&&!person.keeper&&Math.hypot(person.x-meta.target.x,person.y-meta.target.y)<.055&&flight.progress>.65){
  return {id:'air-ready',kind:'airReady',target:meta.target,contact:meta.target,progress:Math.max(0,(flight.progress-.65)/.35)};
 }
 return null;
}

// One simulation-frame buffer. Sampling never steps the match or consumes RNG.
function v102Interpolate(a,b,q){
 if(!a||a.turned!==b.turned||q>=1)return {...b,ball:{...b.ball},players:b.players.map(p=>({...p}))};
 const lerp=(x,y)=>x+(y-x)*q,old=new Map(a.players.map(p=>[p.id,p]));
 const players=b.players.map(p=>{
  const before=old.get(p.id);if(!before)return {...p};
  const action=before.action?.id===p.action?.id&&before.action?.kind===p.action?.kind&&p.action?{...p.action,progress:lerp(before.action.progress,p.action.progress),recovery:lerp(before.action.recovery||0,p.action.recovery||0)}:q<1?before.action:p.action;
  return {...p,x:lerp(before.x,p.x),z:lerp(before.z,p.z),action};
 });
 return {...b,elapsed:lerp(a.elapsed,b.elapsed),clock:lerp(a.clock,b.clock),owner:q<1?a.owner:b.owner,players,
  ball:{x:lerp(a.ball.x,b.ball.x),z:lerp(a.ball.z,b.ball.z),height:lerp(a.ball.height,b.ball.height)},offside:q<1?a.offside:b.offside};
}
function v102RunPose(visual,person,dt,live){
 const distance=Math.hypot(person.x-visual.previous.x,person.z-visual.previous.z),speed=live?Math.min(8,distance/Math.max(.001,dt)):0;
 if(live){visual.runSpeed=(visual.runSpeed||0)+(speed-(visual.runSpeed||0))*(1-Math.exp(-dt*10));visual.runPhase=(visual.runPhase||person.number)+distance*6.2;}
 const amplitude=Math.min(1,(visual.runSpeed||0)/2.6),phase=visual.runPhase||person.number,stride=Math.sin(phase)*.55*amplitude;
 for(const group of [visual.body,...visual.limbs,...visual.knees,...visual.feet,...visual.elbows,visual.neck])group.rotation.set(0,0,0);
 visual.body.position.set(0,-.075*amplitude+(1-Math.cos(phase*2))*amplitude*.008,0);
 visual.limbs[1].rotation.x=-stride*.7;visual.limbs[3].rotation.x=stride*.7;
 // A low planted phase and a raised return phase; solve the two leg segments.
 for(let i=0;i<2;i++){
  const cycle=((phase/(2*Math.PI)+i*.5)%1+1)%1,planted=cycle<.6,q=planted?cycle/.6:(cycle-.6)/.4;
  const reach=(planted?1-2*q:-Math.cos(Math.PI*q))*.28*amplitude,lift=planted?0:Math.pow(Math.sin(Math.PI*q),2)*.18*amplitude,lean=amplitude*.04;
  const deltaY=.11+lift-visual.body.position.y-.89*Math.cos(lean),y=deltaY*Math.cos(lean)+reach*Math.sin(lean),z=-deltaY*Math.sin(lean)+reach*Math.cos(lean),r=Math.min(.7799,Math.hypot(y,z));
  const hip=Math.atan2(-z,-y)-Math.acos(Math.max(-1,Math.min(1,(.16+r*r-.1444)/(.8*r))));
  const knee=Math.PI-Math.acos(Math.max(-1,Math.min(1,(.16+.1444-r*r)/.304)));
  visual.limbs[i*2].rotation.x=hip;visual.knees[i].rotation.x=knee;
  visual.feet[i].rotation.x=-hip-knee-lean;visual.elbows[i].rotation.x=-.25-.5*amplitude;
 }
 visual.body.rotation.x=amplitude*.04;visual.body.rotation.z=person.slideActive?1.1:Math.sin(phase)*amplitude*.015;
 return speed;
}
function v102ActionPose(visual,action,person,turned){
 const p=action.progress,ease=(1+Math.cos(Math.PI*p))/2,header=action.kind==='header',ready=action.kind==='airReady',control=action.kind==='control';
 const recovery=Math.min(1,Math.max(0,(1-p)/.3)),entry=p<0?Math.max(0,1+p*action.duration/.08):1,blend=entry<1?entry:recovery,weight=ready?1:blend*blend*(3-2*blend);
 const groups=[visual.body,...visual.limbs,...visual.knees,...visual.feet,...visual.elbows,visual.neck],rotations=groups.map(g=>({x:g.rotation.x,y:g.rotation.y,z:g.rotation.z})),bodyY=visual.body.position.y;
 const target=v98PitchPoint(action.target,turned),heading=Math.atan2(target.x-person.x,target.z-person.z),baseHeading=visual.heading??visual.root.rotation.y;
 visual.root.rotation.y=baseHeading+Math.atan2(Math.sin(heading-baseHeading),Math.cos(heading-baseHeading))*weight;
 if(header||ready||control){
  const contact=v98PitchPoint(action.contact||action.target,turned),reach=ready?p:Math.min(1,Math.pow(1-p,2));
  // Leave room for the head and the radius of the ball at forehead contact.
  const facing=visual.root.rotation.y;
  visual.root.position.x+=(contact.x-Math.sin(facing)*.54-person.x)*reach;visual.root.position.z+=(contact.z-Math.cos(facing)*.54-person.z)*reach;
  const jump=ready?.25*Math.sin(p*Math.PI/2):header?.25*Math.pow(1-p,2):0;
  visual.body.position.y=jump-(p>.6?.12*Math.sin((p-.6)/.4*Math.PI):0);
  visual.body.rotation.x=ready?-.12*p:header?.34*Math.sin(Math.PI*p):.08*ease;
  visual.neck.rotation.x=ready?-.16*p:header?.38*Math.sin(Math.PI*p):0;
  for(const i of [0,2])visual.limbs[i].rotation.x=-.15*ease;
  for(const knee of visual.knees)knee.rotation.x=.25*ease+(p>.6?.45*Math.sin((p-.6)/.4*Math.PI):0);
  visual.limbs[1].rotation.z=-.45*ease;visual.limbs[3].rotation.z=.45*ease;
 }else{
  const strong=['shot','freeKick','volley'].includes(action.kind),high=['highPass','cross'].includes(action.kind),volley=action.kind==='volley';
  if(volley&&action.contact){const contact=v98PitchPoint(action.contact,turned),facing=visual.root.rotation.y;visual.root.position.x+=(contact.x-Math.sin(facing)*.67-person.x)*ease;visual.root.position.z+=(contact.z-Math.cos(facing)*.67-person.z)*ease;}
  visual.limbs[0].rotation.x=.16*ease;visual.knees[0].rotation.x=.16*ease;
  visual.limbs[2].rotation.x=-(volley?1.75:strong?1.05:high?.9:.65)*ease;
  const wind=p<0?Math.min(1,-p*action.duration/.08):0;
  visual.limbs[2].rotation.x+=(strong?1.6:1.1)*wind;
  visual.knees[1].rotation.x=.12*ease+.7*wind;visual.feet[1].rotation.y=(strong?0:.35)*ease;
  visual.body.rotation.x=(strong?.2:high?-.08:.08)*ease;visual.body.rotation.y=(strong?.22:.08)*Math.sin(Math.PI*p);
  visual.limbs[1].rotation.x=.35*ease;visual.limbs[3].rotation.x=-.3*ease;
  visual.limbs[1].rotation.z=-.35*ease;visual.limbs[3].rotation.z=.45*ease;
  for(const elbow of visual.elbows)elbow.rotation.x=-.35*ease;
  visual.body.position.y=0;
 }
 // Release the gesture gradually into the current distance-driven run pose.
 groups.forEach((group,i)=>{for(const axis of ['x','y','z'])group.rotation[axis]=rotations[i][axis]+(group.rotation[axis]-rotations[i][axis])*weight});
 visual.body.position.y=bodyY+(visual.body.position.y-bodyY)*weight;
}
