'use strict';
// Future loose balls retain momentum; presentation also shows the actual defender contact.
function v110BlockReachable(player,geometry,shooter){
 if(!v65WorldActive)return true;
 const point={x:geometry.x,y:geometry.y},seconds=Math.max(.14,v122Metres(shooter,point)/27),speed=3+ability(player,'spd')*.14;
 return Math.max(0,v122Metres(player,point)-.8)<=speed*seconds;
}
const v110Blocks=new WeakMap();
function v110BlockFlight(player,point,launch){
 if(!v65WorldActive)return launch();
 player.interceptTarget=point;const result=launch();if(match.flight)v110Blocks.set(match.flight,{player,point});return result;
}
const v110BaseDeflect=v50Deflect;
v50Deflect=function(point,team,defender,...args){
 if(!v65WorldActive)return v110BaseDeflect(point,team,defender,...args);
 defender.interceptTarget=null;match.lastTouch=defender.t;
 v123DefensiveThreats.set(match,team);
 const previous=v102Release,incoming=v109IncomingFlight?.current===match?v109IncomingFlight.flight:null;v102Release={person:defender,kind:'block',contact:{...point},height:incoming?v109FlightPoint(incoming,1).elevation:.29};
 try{if(defender.keeper)return v115KeeperDeflect(point,team,defender,args[0]);return v110BaseDeflect(point,team,defender,...args)}finally{v102Release=previous}
};
function v115KeeperDeflect(point,team,keeper,description){
 v123DefensiveThreats.set(match,team);
 const line=team===0?v55Field.top:v55Field.bottom,away=team===0?1:-1,out=random()<.28,side=point.x>=keeper.x?1:-1,spread=.055+random()*.07,target={x:clamp(point.x+side*spread,.055,.945),y:out?line:clamp(point.y+away*.075,v55Field.top+.025,v55Field.bottom-.025)};
 if(out&&Math.abs(target.x-.5)<.11)target.x=.5+side*.11;
 match.owner=keeper;match.ball={...point};fly(target,.32,()=>{if(out)v55Out({edge:team===0?'top':'bottom',...target},keeper.t,description);else v50LooseBall(target,`Der Ball liegt nach ${description} frei.`);});
}
const v110BaseLoose=v50LooseBall;
const v124AirBalls=new WeakMap();
function v124AdvanceAir(current,seconds){
 const a=v124AirBalls.get(current),r=current.rebound;if(!a||a.rebound!==r||current.owner||current.flight){v124AirBalls.delete(current);return null;}
 if(a.settled)return a;
 let left=Math.max(0,seconds);const ground=.29,g=9.8;
 for(let i=0;i<8&&left>1e-7;i++){
  const impact=(a.vh+Math.sqrt(a.vh*a.vh+2*g*Math.max(0,a.height-ground)))/g,dt=Math.min(left,impact);
  a.height=Math.max(ground,a.height+a.vh*dt-.5*g*dt*dt);a.vh-=g*dt;left-=dt;
  if(dt>=impact-1e-7){a.height=ground;a.vh=-a.vh*.42;r.vx*=.82;r.vy*=.82;a.impacts++;if(a.vh<.9){a.vh=0;a.settled=true;break;}}
 }
 if(a.settled)a.height=ground;
 return a;
}
v50LooseBall=function(point,...args){
 const current=match,flight=v109IncomingFlight?.current===current?v109IncomingFlight.flight:current?.flight,loose=v102Motion.get(current)?.loose;
 const result=v110BaseLoose(point,...args),r=current?.rebound;
 if(!v65WorldActive||!r)return result;
 const motion=v102Motion.get(current),air=flight&&v102Flights.get(flight),contact=motion&&[...motion.poses.values()].some(p=>p.at===motion.clock&&p.contact);
 if(air?.high&&!loose&&!contact&&air.endHeight>.4)r.delay=Math.max(r.delay,Math.sqrt(2*(air.endHeight-.29)/9.8)*MATCH_SPEED);
 let velocity={x:0,y:0};
 if(loose&&!loose.drop){
  // A headed clearance leaves the contact point, rather than its requested landing target.
  r.x=loose.start.x;r.y=loose.start.y;current.ball={x:r.x,y:r.y};
  r.delay=Math.max(r.delay,loose.duration*MATCH_SPEED);
  velocity={x:(loose.target.x-loose.start.x)/(loose.duration*MATCH_SPEED),y:(loose.target.y-loose.start.y)/(loose.duration*MATCH_SPEED)};
 }
 else if(flight){const end=v109FlightPoint(flight,1),before=v109FlightPoint(flight,.98);velocity={x:(end.x-before.x)/Math.max(.001,flight.duration*.02),y:(end.y-before.y)/Math.max(.001,flight.duration*.02)}}
 const speed=Math.hypot(velocity.x*v160PitchWidth()/(v55Field.right-v55Field.left),velocity.y*v160PitchLength()/(v55Field.bottom-v55Field.top))*MATCH_SPEED,limit=Math.min(1,18/Math.max(.001,speed));
 r.vx=velocity.x*limit;r.vy=velocity.y*limit;
 if(loose&&!loose.drop)loose.target={x:loose.start.x+r.vx*loose.duration*MATCH_SPEED,y:loose.start.y+r.vy*loose.duration*MATCH_SPEED};
 const end=flight&&v109FlightPoint(flight,1),before=flight&&v109FlightPoint(flight,.98),duration=loose?.duration;
 const height=loose&&!loose.drop?2.65:end?.elevation??.29,vh=loose&&!loose.drop?(.29-2.65)/duration+4.9*duration:end&&before?(end.elevation-before.elevation)/Math.max(.001,flight.duration/MATCH_SPEED*.02):0;
 if(height>.30||vh<-.9){const airState={rebound:r,height,vh,impacts:0,settled:false};v124AirBalls.set(current,airState);const fall=(vh+Math.sqrt(vh*vh+19.6*Math.max(0,height-.29)))/9.8;r.delay=Math.max(r.delay,fall*MATCH_SPEED);}
 else v124AirBalls.delete(current);
 return result;
};
const v110BaseChase=v50ChaseLooseBall;
v50ChaseLooseBall=function(delta,positions){
 const current=match,r=current?.rebound;
 if(v65WorldActive&&r&&!current.owner&&!current.flight&&!current.kickoff&&!current.halftimePause&&!current.finished&&Number.isFinite(r.vx)&&Number.isFinite(r.vy)){
  const air=v124AdvanceAir(current,Math.max(0,delta)/MATCH_SPEED),loose=v102Motion.get(current)?.loose,airborne=air?!air.settled:loose&&(!loose.drop||loose.free);
  if(air&&!air.settled)r.delay=Math.max(r.delay,delta+.001);
  const start={x:r.x,y:r.y},damp=airborne?1:Math.exp(-2.3*Math.max(0,delta)/MATCH_SPEED),travel=airborne?Math.max(0,delta):(1-damp)/(2.3/MATCH_SPEED),target={x:r.x+r.vx*travel,y:r.y+r.vy*travel},hit=v55Exit(start,target);
  r.vx*=damp;r.vy*=damp;
  if(hit){const contact=v55BoundaryStop(hit);current.ball={x:contact.x,y:contact.y};v55Out(hit,current.lastTouch??0,'Der freie Ball rollt über die Linie.');return}
  r.x=target.x;r.y=target.y;current.ball={x:r.x,y:r.y};
 }
 const result=v110BaseChase(delta,positions),winner=current?.owner;
 if(v65WorldActive&&r&&!current.rebound&&winner&&!winner.keeper&&!current.flight&&v131OpenGoal(winner,{x:r.x,y:r.y})){
  const point={x:r.x,y:r.y},from={x:r.x-(r.vx||0)*.2,y:r.y-(r.vy||0)*.2};
  v127TryOneTouch(winner,point,from);
 }
 return result;
};
const v110BaseRestart=v50Restart;
v50Restart=function(type,...args){
 const current=match,r=current?.rebound,start=current?.ball&&{...current.ball},view=current&&v99BallView(current),motion=current&&v102Motion.get(current),loose=motion?.loose;
 const vertical=v124AirBalls.get(current)?.vh??(loose&&!loose.drop?(-2.36+1.1*Math.PI*Math.cos(Math.PI*clamp((motion.clock-loose.at)/loose.duration,0,1)))/loose.duration:0);
 const result=v110BaseRestart(type,...args),tail=current&&v109CornerBalls.get(current);
 if(v65WorldActive&&type==='corner'&&tail?.piece===current.setPiece&&r&&Number.isFinite(r.vx)){tail.start={...start,elevation:view?.elevation??.29};tail.velocity={x:r.vx*MATCH_SPEED,y:r.vy*MATCH_SPEED,height:vertical}}
 return result;
};
const v110BaseBallView=v99BallView;
v99BallView=function(current){
 const existing=v110BaseBallView(current),r=current.rebound;
 const air=v124AirBalls.get(current);
 return v65WorldActive&&r&&!current.owner&&!current.flight&&!current.setPiece&&!current.throwIn&&!current.finished&&Number.isFinite(r.vx)?{x:r.x,y:r.y,elevation:air?.rebound===r?air.height:existing?.elevation??.29}:existing;
};
function v110RollingBallView(current){const r=current.rebound;return v65WorldActive&&r&&Number.isFinite(r.vx)?{x:r.x,y:r.y}:null}
const v110BasePlayerAction=v102PlayerAction;
v102PlayerAction=function(current,person){
 const block=current.flight&&v110Blocks.get(current.flight);if(block?.player===person&&current.flight.progress>.55)return {id:'block-ready',kind:'block',target:block.point,contact:block.point,progress:-Math.min(.15,(1-current.flight.progress)*.3),duration:.48};
 const existing=v110BasePlayerAction(current,person);if(existing)return existing;
 if(window.D6UserMeshyPlayer?.nativeShot&&current.owner===person&&!person.keeper&&!current.flight&&!current.setPiece&&!current.kickoff&&!current.throwIn&&current.goalPause<=0&&!current.postBanner&&!current.halftimePause){const remaining=(current.next-current.elapsed)/MATCH_SPEED;if(remaining>=0&&remaining<.35)return {id:'kick-ready',kind:'kickReady',target:{x:.5,y:person.t===0?v55Field.top:v55Field.bottom},progress:1-remaining/.35,duration:.35}}
 return null;
};
function v110BallRoll(scene,frame,live){
 const previous=scene.ballTravel;scene.ballTravel={x:frame.ball.x,z:frame.ball.z,opacity:frame.ball.opacity??1};
 if(!live||!previous||previous.opacity<.05||(frame.ball.opacity??1)<.05)return;
 const dx=frame.ball.x-previous.x,dz=frame.ball.z-previous.z,d=Math.hypot(dx,dz);if(d<.00001||d>5)return;
 const radius=scene.ball.geometry.parameters.radius*scene.ball.scale.x;
 scene.ball.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(dz,0,-dx).normalize(),d/radius));
}
