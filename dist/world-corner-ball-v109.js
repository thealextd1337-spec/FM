'use strict';

// Corner aftermath is presentation only. The restart and its wait stay in the engine.
const v109CornerBalls=new WeakMap();
let v109IncomingFlight=null;
function v109FlightPoint(flight,q){
 const release=v99Flights.get(flight),meta=v102Flights.get(flight);
 if(release?.kind==='shot')return v101ShotPoint(release,q);
 if(meta)return v102FlightBall(meta,q);
 return {x:flight.x+(flight.target.x-flight.x)*q,y:flight.y+(flight.target.y-flight.y)*q,elevation:.29};
}
const v109BaseFly=fly;
fly=function(target,duration,done){
 const current=match;let incoming;
 const result=v109BaseFly(target,duration,()=>{
  const previous=v109IncomingFlight;v109IncomingFlight=v65WorldActive&&incoming?{current,flight:incoming}:null;
  try{return done()}finally{v109IncomingFlight=previous}
 });
 incoming=current?.flight;return result;
};
const v109BaseRestart=v50Restart;
v50Restart=function(type,team,spot,...args){
 const current=match,previous=current?.setPiece;
 let motion=null;
 if(v65WorldActive&&current&&!current.finished&&!previous&&type==='corner'){
  const flight=v109IncomingFlight?.current===current?v109IncomingFlight.flight:current.flight;
  const end=flight?v109FlightPoint(flight,1):{...current.ball,elevation:.29},before=flight?v109FlightPoint(flight,.98):null,seconds=flight?flight.duration/MATCH_SPEED*.02:1;
  const velocity=before?{x:(end.x-before.x)/seconds,y:(end.y-before.y)/seconds,height:(end.elevation-before.elevation)/seconds}:{x:0,y:(team===0?-1:1)*6*(v55Field.bottom-v55Field.top)/68,height:0};
  // Bound the short visual tail to the stadium apron, even for very short engine flights.
  const speed=Math.hypot(velocity.x*44/(v55Field.right-v55Field.left),velocity.y*68/(v55Field.bottom-v55Field.top));
  if(speed>18){velocity.x*=18/speed;velocity.y*=18/speed}
  motion={start:{x:end.x,y:end.y,elevation:end.elevation??.29},velocity,at:v102Clock(current)};
 }
 const result=v109BaseRestart(type,team,spot,...args),piece=current?.setPiece;
 if(motion&&piece&&piece!==previous&&piece.type==='corner')v109CornerBalls.set(current,{...motion,piece,duration:Math.min(.85,Math.max(.15,piece.wait-.5))});
 else if(piece!==previous)v109CornerBalls.delete(current);
 return result;
};
function v109CornerBallView(current){
 if(!v65WorldActive||current.finished)return null;
 const motion=v109CornerBalls.get(current);if(!motion||current.setPiece!==motion.piece||current.setPiece.type!=='corner')return null;
 const time=Math.max(0,v102Clock(current)-motion.at),duration=motion.duration;
 if(time<duration+.10){
  const t=Math.min(time,duration),travel=(1-Math.exp(-2.4*t))/2.4;
  return {x:motion.start.x+motion.velocity.x*travel,y:motion.start.y+motion.velocity.y*travel,
   elevation:Math.max(.29,motion.start.elevation+motion.velocity.height*t-4.9*t*t),opacity:Math.max(0,Math.min(1,(duration-time)/.18))};
 }
 return {...motion.piece.spot,elevation:.29,opacity:Math.min(1,(time-duration-.10)/.16)};
}
const v109BaseBallView=v99BallView;
v99BallView=function(current){return v109CornerBallView(current)||v109BaseBallView(current)};
function v109BallOpacity(scene,opacity){
 if(scene.cornerBallOpacity===opacity)return;scene.cornerBallOpacity=opacity;
 scene.ballRoot.visible=opacity>0;
 scene.ball.traverse(object=>{if(!object.material)return;for(const material of Array.isArray(object.material)?object.material:[object.material]){
  const transparent=opacity<1;if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true}
  material.opacity=opacity;material.depthWrite=!transparent;
 }});
}
