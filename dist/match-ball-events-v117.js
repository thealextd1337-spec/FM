'use strict';

// New live world matches only. Plain event records survive snapshots; callback
// references stay transient. Observation must never consume simulation randoms.
const v117Flights=new WeakMap();
let v117Incoming=null;
const v117StatKeys=['shotGoals','nonShotGoals','shotConceded','nonShotConceded','shotsInterrupted','savesCaught','savesParried'];
function v117Ledger(current=match){return current?.ballAccounting?.version===117?current.ballAccounting:null}
function v117Stats(person){for(const key of v117StatKeys)if(!Number.isFinite(person.stats[key]))person.stats[key]=0;return person.stats}
function v117Event(current,kind,person,parentId=null){
 const ledger=v117Ledger(current);if(!ledger)return null;
 const event={id:++ledger.sequence,parentId,kind,actorPid:person?.pid||null,team:person?.t??null,at:current.elapsed,result:null};
 ledger.events.push(event);return event;
}
function v117Origin(current){
 if(v117Incoming?.current===current)return v117Incoming.event;
 const id=current.rebound?.ballEventId??current.ballEventId;
 return v117Ledger(current)?.events.find(event=>event.id===id)||null;
}
function v117Settle(current,event,before){
 if(!event||event.result)return;
 event.endAt=current.elapsed;
 if(event.shot){
  const keeper=current.people.find(p=>p.pid===event.keeperPid);
  if(event.goal)event.result='goal';
  else if(keeper&&keeper.stats.saves>before){
   event.result=event.parried?'parried':'caught';
   v117Stats(keeper)[event.parried?'savesParried':'savesCaught']++;
  }else event.result=event.blocked?'blocked':event.expectedBlock?'unreached-block':'off-target';
 }else event.result=event.goal?'goal':current.rebound?'loose':current.owner?'received':'arrived';
 if(current.owner)event.receiverPid=current.owner.pid;
}
function v117Interrupt(current,reason,flight=current?.flight){
 const event=flight&&v117Flights.get(flight);if(!event||event.result)return;
 event.result='interrupted';event.reason=reason;event.endAt=current.elapsed;
 if(!event.shot)return;
 const people=[...current.people,...(current.exitedPeople||[])],shooter=people.find(p=>p.pid===event.actorPid),keeper=people.find(p=>p.pid===event.keeperPid);
 if(shooter)v117Stats(shooter).shotsInterrupted++;
 // Target/faced are booked at release for the animation metadata. Undo only
 // an unfinished attempt, before the report and performance rating are copied.
 if(event.plannedOnTarget){if(shooter)shooter.stats.onTarget--;if(keeper)keeper.stats.faced--;}
}
const v117CreateMatch=v65CreateMatch;
v65CreateMatch=function(...args){
 const value=v117CreateMatch.apply(this,args);
 match.ballAccounting={version:117,sequence:0,events:[]};
 for(const person of match.people)v117Stats(person);
 return value;
};
const v117Fly=fly;
fly=function(target,duration,done){
 const current=match;if(!v117Ledger(current))return v117Fly.apply(this,arguments);
 const parent=v117Origin(current);let flight,event;
 const value=v117Fly.call(this,target,duration,function(...args){
  const previous=v117Incoming;v117Incoming={current,event};
  const keeper=current.people.find(p=>p.pid===event?.keeperPid),before=keeper?.stats.saves||0;
  try{return done.apply(this,args)}finally{v117Settle(current,event,before);v117Incoming=previous;}
 });
 flight=current.flight;if(!flight)return value;
 const meta=v102Flights.get(flight),visual=v99Flights.get(flight);
 event=v117Event(current,meta?.kind||visual?.kind||'flight',meta?.person||visual?.shooter,parent?.id??null);
 event.start={x:flight.x,y:flight.y};event.target={...target};event.duration=flight.duration;
 if(flight.shotMotion)event.shotMotion=flight.shotMotion;
 v117Flights.set(flight,event);current.ballEventId=event.id;
 return value;
};
const v117Shoot=v55Shoot;
v55Shoot=function(shooter,...args){
 const current=match,before=shooter.stats.shots,onTarget=shooter.stats.onTarget;
 const value=v117Shoot.call(this,shooter,...args),event=current.flight&&v117Flights.get(current.flight);
 if(event&&shooter.stats.shots>before){event.shot=true;event.keeperPid=v50Keeper(1-shooter.t).pid;event.plannedOnTarget=shooter.stats.onTarget>onTarget;event.expectedBlock=!!v99Flights.get(current.flight)?.blocked;}
 return value;
};
const v117Deflect=v50Deflect;
v50Deflect=function(point,team,defender,...args){
 const event=v117Incoming?.current===match?v117Incoming.event:null;
 if(event){if(defender.keeper)event.parried=true;else event.blocked=true;}
 return v117Deflect.call(this,point,team,defender,...args);
};
const v117LooseBall=v50LooseBall;
v50LooseBall=function(...args){
 const current=match,parent=v117Origin(current),value=v117LooseBall.apply(this,args);
 if(v117Ledger(current)&&current.rebound&&parent){
  const event=v117Event(current,'loose-ball',null,parent.id);event.result='rolling';
  current.rebound.ballEventId=event.id;current.ballEventId=event.id;
 }
 return value;
};
const v117Goal=v50Goal;
v50Goal=function(scorer,keeper,penalty=false,source=null){
 const current=match,parent=v117Origin(current),value=v117Goal.apply(this,arguments);
 if(!v117Ledger(current))return value;
 // A saved shot has already resolved. A goal from its subsequent rebound is
 // a different ball event unless a player intentionally takes another shot.
 const shot=!!parent?.shot&&!parent.result&&source!=='own-goal';
 const event=v117Event(current,'goal',scorer,parent?.id??null);
 event.result=shot?'shot-goal':'non-shot-goal';event.source=source;event.keeperPid=keeper.pid;if(source==='own-goal')event.ownGoalPid=scorer.ownGoalPid||null;
 if(parent&&!parent.result)parent.goal=true;
 if(shot&&!parent.plannedOnTarget){
  const shooter=current.people.find(p=>p.pid===parent.actorPid);
  if(shooter)shooter.stats.onTarget++;
  keeper.stats.faced++;parent.actualOnTarget=true;
 }
 if(scorer.pid)v117Stats(scorer)[shot?'shotGoals':'nonShotGoals']++;
 v117Stats(keeper)[shot?'shotConceded':'nonShotConceded']++;
 const goal=current.goals.at(-1);goal.ballEventId=event.id;goal.shotGoal=shot;
 current.ballEventId=event.id;
 return value;
};
const v117Penalty=v50FinishPenalty;
v50FinishPenalty=function(setPiece){
 const current=match;if(!v117Ledger(current))return v117Penalty.apply(this,arguments);
 const shooter=setPiece.taker,keeper=v50Keeper(1-setPiece.team),event=v117Event(current,'penalty',shooter,v117Origin(current)?.id??null),previous=v117Incoming,before=keeper.stats.saves;
 event.shot=true;event.keeperPid=keeper.pid;event.plannedOnTarget=['goal','save'].includes(setPiece.outcome);
 v117Incoming={current,event};current.ballEventId=event.id;
 try{return v117Penalty.apply(this,arguments)}finally{v117Settle(current,event,before);v117Incoming=previous;}
};
const v117Finish=v65Finish;
v65Finish=function(...args){if(v65Context()&&!match?.finished)v117Interrupt(match,'final-whistle');return v117Finish.apply(this,args)};
const v117Report=v65WorldReport;
v65WorldReport=function(...args){const report=v117Report.apply(this,args);if(v117Ledger())report.ballAccounting=structuredClone(match.ballAccounting);return report};
const v117Halftime=beginHalftimeBreak;
beginHalftimeBreak=function(...args){const current=match,flight=current?.flight,value=v117Halftime.apply(this,args);if(flight&&!current.flight)v117Interrupt(current,'half-time',flight);return value};
