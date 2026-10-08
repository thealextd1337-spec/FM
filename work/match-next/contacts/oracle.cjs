'use strict';
// Welle 0 analytical TEST oracle. Not an engine, possession resolver or production rule module.
const EPS=1e-9;
const add=(a,b,t=1)=>a.map((v,i)=>v+b[i]*t);
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
function firstContact(ball,actors,duration){
 const hits=[];
 for(const a of actors){
  if(a.action==='none')continue;
  const p=sub(ball.position,a.position),v=sub(ball.velocity,a.velocity),A=dot(v,v),B=2*dot(p,v),C=dot(p,p)-a.reach*a.reach,D=B*B-4*A*C;
  const t=C<=EPS?0:A>EPS&&D>=0?(-B-Math.sqrt(D))/(2*A):Infinity;
  if(t>=-EPS&&t<=duration+EPS)hits.push({actorId:a.id,time:Math.max(0,t),position:add(ball.position,ball.velocity,Math.max(0,t))});
 }
 // Stable fixture tie break only; product tie semantics remain unconfirmed.
 return hits.sort((a,b)=>a.time-b.time||(a.actorId<b.actorId?-1:a.actorId>b.actorId?1:0))[0]||null;
}
function ownBox(point,team,g){
 const end=team===0?-1:1,depth=g.length/2-end*point[0];
 return depth>=-EPS&&depth<=g.penaltyDepth+EPS&&Math.abs(point[2])<=g.penaltyWidth/2+EPS;
}
function handPermission(actor,point,g,provenance={}){
 if(actor.role!=='keeper')return {allowed:false,reason:'not-keeper'};
 if(!ownBox(point,actor.team,g))return {allowed:false,reason:'outside-own-box'};
 const restricted=provenance.sourceTeam===actor.team&&['deliberate-foot-pass','direct-throw-in'].includes(provenance.sourceAction);
 if(restricted&&!['clearance-executed','clearance-attempted'].includes(provenance.keeperFootAction))return {allowed:false,reason:'restricted-origin'};
 return {allowed:true,reason:'allowed'};
}
function boundary(ball,g,duration){
 const hits=[];
 for(const [axis,half,type] of [[0,g.length/2,'goal-line'],[2,g.width/2,'touchline']])for(const direction of [-1,1]){
  const speed=direction*ball.velocity[axis],start=direction*ball.position[axis],limit=half+ball.radius;
  if(speed<=0)continue;
  const time=(limit-start)/speed;
  // At exact end tangent the whole ball has not gone beyond the line yet.
  if(time<0||time>=duration-EPS)continue;
  const point=add(ball.position,ball.velocity,time);
  const goal=type==='goal-line'&&Math.abs(point[2])+ball.radius<g.goalWidth/2-EPS&&point[1]+ball.radius<g.goalHeight-EPS&&point[1]-ball.radius>=-EPS;
  hits.push({time,point,type:goal?'goal':'out',edge:type,direction});
 }
 return hits.sort((a,b)=>a.time-b.time)[0]||null;
}
function evaluate(scene){
 if(scene.kind==='keeper-permission'){
  const keeper=scene.actors.find(a=>a.id===scene.provenance.subjectId);
  return handPermission(keeper,scene.ball.position,scene.geometry,scene.provenance);
 }
 if(scene.kind==='offside'){
  const {offsideIds,participantId,participation,sourceAction}=scene.provenance;
  return {whistle:!['direct-throw-in','corner','goal-kick'].includes(sourceAction)&&participation&&offsideIds.includes(participantId)};
 }
 const contact=firstContact(scene.ball,scene.actors,scene.duration),cross=boundary(scene.ball,scene.geometry,scene.duration);
 if(contact&&(!cross||contact.time<=cross.time))return {type:'contact',actorId:contact.actorId,time:contact.time};
 return {type:cross?.type||'free',actorId:null,time:cross?.time??null};
}
module.exports={firstContact,ownBox,handPermission,boundary,evaluate,add};
