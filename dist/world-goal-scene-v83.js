'use strict';

const v83GoalSceneDuration=4.05;
function v83GoalLine(team){return team===0?v55Field.top:v55Field.bottom}
function v83GoalPosition(scene){
 const time=Math.max(0,Math.min(scene.elapsed,2.45)),direction=scene.team===0?-1:1;
 let depth,height,bulge,drift;
 if(time<.6){const p=time/.6;depth=17*p;height=6*p;bulge=p;drift=0}
 else if(time<1.05){const p=(time-.6)/.45;depth=17-7*p;height=6+2*Math.sin(Math.PI*p);bulge=1-.55*p;drift=-.003*p}
 else if(time<1.65){const p=(time-1.05)/.6;depth=10+4*p;height=6*(1-p)*(1-p);bulge=.45*(1-p);drift=-.003+.006*p}
 else{const p=Math.min(1,(time-1.65)/.8);depth=14-2*p;height=0;bulge=0;drift=.003+.009*p}
 return{x:Math.max(.412,Math.min(.588,scene.x+drift)),y:v83GoalLine(scene.team)+direction*depth/740,height,bulge};
}
function v83StartGoalScene(scorer){
 if(!v65WorldActive||!match||!scorer?.pid)return;
 const x=Math.max(.415,Math.min(.585,match.ball.x));
 match.goalScene={team:scorer.t,x,elapsed:0};
 match.ball={x,y:v83GoalLine(scorer.t)};
 match.goalPause=v83GoalSceneDuration;
}
function v83AdvanceGoalScene(scene,realDelta){
 scene.elapsed=Math.min(2.45,scene.elapsed+Math.max(0,realDelta));
 const point=v83GoalPosition(scene);match.ball={x:point.x,y:point.y};
}
function v83DrawGoalNet(ctx,team,bulge=0,impact=300){
 const line=v83GoalLine(team)*740,direction=team===0?-1:1;
 const depthAt=x=>18+8*bulge*Math.max(0,1-Math.abs(x-impact)/65);
 ctx.save();
 ctx.fillStyle='#0d302bb8';ctx.beginPath();ctx.moveTo(240,line);ctx.lineTo(360,line);
 for(let x=360;x>=240;x-=12)ctx.lineTo(x,line+direction*depthAt(x));
 ctx.closePath();ctx.fill();
 ctx.strokeStyle='#dcead0a8';ctx.lineWidth=1.3;
 for(const fraction of [.25,.5,.75,1]){
  ctx.beginPath();
  for(let x=240;x<=360;x+=12){const y=line+direction*depthAt(x)*fraction;if(x===240)ctx.moveTo(x,y);else ctx.lineTo(x,y)}
  ctx.stroke();
 }
 for(let x=240;x<=360;x+=15){ctx.beginPath();ctx.moveTo(x,line);ctx.lineTo(x,line+direction*depthAt(x));ctx.stroke()}
 ctx.strokeStyle='#f3f7ee';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(240,line+direction*depthAt(240));ctx.lineTo(240,line);ctx.lineTo(360,line);ctx.lineTo(360,line+direction*depthAt(360));ctx.stroke();
 ctx.restore();
}
function v83DrawGoalScene(ctx,scene,turned=false){
 const raw=v83GoalPosition(scene),point=turned?{...raw,x:1-raw.x,y:1-raw.y}:raw;
 v83DrawGoalNet(ctx,turned?1-scene.team:scene.team,point.bulge,(turned?1-scene.x:scene.x)*600);
 ctx.save();
 const x=point.x*600,y=point.y*740;
 ctx.fillStyle='#071d1b88';ctx.beginPath();ctx.ellipse(x+2,y+3,7,4,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fffdf2';ctx.strokeStyle='#17292b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-point.height,6,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.restore();
}
const v83BaseGoal=v50Goal;
v50Goal=function(scorer,keeper,penalty=false,source=null){
 const result=v83BaseGoal(scorer,keeper,penalty,source);
 v83StartGoalScene(scorer);
 return result;
};
const v83BaseStep=step;
step=function(delta,realDelta){
 const current=match;
 if(current?.goalScene&&current.goalPause>0)v83AdvanceGoalScene(current.goalScene,realDelta);
 const result=v83BaseStep(delta,realDelta);
 if(current===match&&current?.goalScene&&current.goalPause<=0)current.goalScene=null;
 return result;
};
const v83BaseKickoff=kickoff;
kickoff=function(team){if(match)match.goalScene=null;return v83BaseKickoff(team)};
const v83BaseDraw=draw;
draw=function(){
 const current=match,scene=v65WorldActive&&current?.goalPause>0?current.goalScene:null;
 if(!v65WorldActive||!current)return v83BaseDraw();
 let result;
 if(scene){const ball=current.ball;try{current.ball={x:-1,y:-1};result=v83BaseDraw()}finally{current.ball=ball}}
 else result=v83BaseDraw();
 const ctx=$('#canvas').getContext('2d'),turned=Boolean(current.halftimeBreakDone),goalTeam=scene?(turned?1-scene.team:scene.team):null;
 for(const team of [0,1])if(team!==goalTeam)v83DrawGoalNet(ctx,team);
 if(scene)v83DrawGoalScene(ctx,scene,turned);
 return result;
};

const v83GoalStyle=document.createElement('style');
v83GoalStyle.textContent=`.v42-goal-scene .v42-ball.goal{animation:v83BallGoal 2.05s ease-out both}.v42-goal-scene.goal .v42-net{animation:v83GoalNet 1.15s ease-out .68s both}@keyframes v83BallGoal{0%{left:50%;bottom:26px;transform:translateX(-50%) scale(1)}36%{left:calc(50% + var(--shot-x));bottom:143px;transform:translateX(-50%) scale(.55)}49%{left:calc(50% + var(--shot-x));bottom:153px;transform:translateX(-50%) scale(.52)}63%{left:calc(50% + var(--shot-x) - 7px);bottom:137px;transform:translateX(-50%) scale(.62)}79%{left:calc(50% + var(--shot-x) + 3px);bottom:109px;transform:translateX(-50%) scale(.72)}100%{left:calc(50% + var(--shot-x) + 10px);bottom:107px;transform:translateX(-50%) scale(.72)}}@keyframes v83GoalNet{0%{transform:scale(1)}28%{transform:scale(1.05,1.18)}58%{transform:scale(.99,.96)}100%{transform:scale(1)}}@media(prefers-reduced-motion:reduce){.v42-goal-scene .v42-ball.goal{animation:none;left:calc(50% + var(--shot-x) + 10px);bottom:107px;transform:translateX(-50%) scale(.72)}.v42-goal-scene.goal .v42-net{animation:none}}`;
document.head.append(v83GoalStyle);
