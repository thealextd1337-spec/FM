'use strict';

// Display-only event metadata: never serialized and never consumes match RNG.
const v99Flights=new WeakMap(),v99Actions=new WeakMap();
let v99Release=null;
let v99SwapQueue=null;
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
 const actionState=match&&v99Actions.get(match);if(actionState){actionState.goalHeight=0;actionState.goalLateral=0}
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
 let state=v99Actions.get(current);if(!state){state={keepers:new Map(),throws:new Map(),goalHeight:0,miss:null};v99Actions.set(current,state)}return state;
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
 if(!release)return v99BaseFly(target,duration,done);
 const state=v99ActionState(current);
 if(release.kind==='shot'){
  const shooter=release.shooter,keeper=current.people.find(p=>p.keeper&&p.t!==shooter.t);
  const onTarget=(shooter.stats.onTarget||0)>release.onTarget;
  const goalLine=shooter.t===0?v55Field.top:v55Field.bottom;
  const blocked=Math.abs(target.y-goalLine)>.015;
  const variant=((shooter.stats.shots||0)+shooter.n)%3;
  const displayTarget={...target};if(onTarget&&!blocked)displayTarget.x=Math.max(.41,Math.min(.59,target.x+(variant===0?-.018:variant===1?.018:0)));
  Object.assign(release,{keeper,onTarget,blocked,over:!onTarget&&!blocked&&variant!==0,displayTarget,
   endHeight:blocked?.45:onTarget?[.35,1.15,2.05][variant]:variant===0?.29:3.4+variant*.45,
   startHeight:.29,target:{...target},age:0,saved:false});
  if(keeper&&!blocked&&(onTarget||!release.over))state.keepers.set(keeper.pid,release);
 }else{
  Object.assign(release,{startHeight:2.62,endHeight:.29,target:{...target},age:0});
  state.throws.set(release.taker.pid,release);
 }
 const result=v99BaseFly(target,duration,()=>{
  const saves=release.keeper?.stats.saves||0,goals=current.goals.length;
  const value=done();
  release.completed=true;release.age=0;
  release.saved=(release.keeper?.stats.saves||0)>saves;
  if(current.goals.length>goals){state.goalHeight=release.endHeight;state.goalLateral=(release.displayTarget?.x??release.target.x)-release.target.x}
  if(release.over)state.miss=release;
  return value;
 });
 release.flight=current.flight;v99Flights.set(current.flight,release);
 return result;
};
const v99BaseStep=step;
step=function(delta,realDelta){
 const current=match,state=current&&v99Actions.get(current);
 if(state&&running&&!(typeof v47PlayerDialog!=='undefined'&&v47PlayerDialog.open)){
  const dt=Math.max(0,realDelta);
  for(const poses of [state.keepers,state.throws])for(const [id,pose]of poses){
   if(pose.completed){pose.age+=dt;if(pose.age>(pose.kind==='throw'?.32:.95))poses.delete(id)}
   else if(current.flight!==pose.flight)poses.delete(id);
  }
  if(state.miss){state.miss.age+=dt;if(state.miss.age>.65)state.miss=null}
 }
 const result=v99BaseStep(delta,realDelta);v99FlushSwaps();return result;
};
function v99BallView(current){
 if(current.finished)return null;
 const state=v99Actions.get(current),release=current.flight&&v99Flights.get(current.flight);
 if(current.goalScene&&current.goalPause>0&&state?.goalHeight){
  const raw=v83GoalPosition(current.goalScene);
  return {...raw,x:raw.x+(state.goalLateral||0)*Math.max(0,1-current.goalScene.elapsed/1.15),height:undefined,elevation:state.goalHeight*Math.max(0,1-current.goalScene.elapsed/1.15)};
 }
 if(current.throwIn?.taker&&current.throwIn.ready>0)return {...current.throwIn.taker,elevation:2.62};
 if(release){
  const q=Math.max(0,Math.min(1,current.flight.progress));
  const start={x:current.flight.x,y:current.flight.y},end=release.over?{x:.5+(release.shooter.n%2?-.045:.045),y:release.target.y}:release.displayTarget||release.target;
  return {x:start.x+(end.x-start.x)*q,y:start.y+(end.y-start.y)*q,
   elevation:release.startHeight*(1-q)+release.endHeight*q+Math.sin(Math.PI*q)*(release.kind==='throw'?1.35:release.blocked?.25:.75)};
 }
 if(state?.miss){const pose=state.miss,q=Math.min(1,pose.age/.65),direction=pose.shooter.t===0?-1:1;
  return {x:.5+(pose.shooter.n%2?-.045:.045),y:pose.target.y+direction*.065*q,elevation:pose.endHeight*(1-q)};
 }
 return null;
}
function v99PlayerAction(current,person){
 if(current.finished)return null;
 if(current.throwIn?.taker===person&&current.throwIn.ready>0)return {kind:'throw',progress:Math.min(1,current.throwIn.ready/.55),holding:true,target:current.throwIn.spot};
 const state=v99Actions.get(current),throwPose=state?.throws.get(person.pid);
 if(throwPose)return {kind:'throw',progress:throwPose.completed?1:Math.min(1,(current.flight?.progress||0)*4),holding:false,target:throwPose.target};
 const keeper=state?.keepers.get(person.pid);if(!keeper)return null;
 return {kind:'save',progress:keeper.completed?1:Math.min(1,(current.flight?.progress||0)/.85),recovery:keeper.completed?Math.min(1,keeper.age/.95):0,
  target:keeper.displayTarget||keeper.target,height:keeper.endHeight,saved:keeper.saved};
}
