'use strict';

// Only future physical world actions. Pursuit is transient; new loose intents can resume.
const v150SpacePasses=new WeakMap();
function v150Scale(){return {x:44/(v55Field.right-v55Field.left),y:68/(v55Field.bottom-v55Field.top)}}
function v150Pace(p){if(typeof v157Active==='function'&&v157Active(match))return v157Pace(match,p);return p.keeper?2.6+ability(p,'spd')*.065:3+ability(p,'spd')*.14}
function v150Delay(p){return .08+(20-ability(p,'pos'))*.018+(typeof v158ReactionLoss==='function'?v158ReactionLoss(p):0)}
function v150KeeperArea(p,point){const s=v150Scale(),goal=p.t===0?v55Field.bottom:v55Field.top;return Math.abs(point.y-goal)*s.y<=16.5&&Math.abs(point.x-.5)*s.x<=12}
function v150Candidates(p,allies,rivals){
 const m=match,s=v150Scale(),dir=p.t===0?-1:1,quick=m.teamDirect?.[p.t],focus=m.teamFocus?.[p.t]||'Variabel',snapshot=v55OffsideSnapshot(p),options=[];
 for(const runner of allies){
  if(runner.keeper||runner.slideActive||hasInstruction(runner,'support'))continue;
  const forward=(runner.y-p.y)*dir*s.y;
  if(forward< -2||forward>23||snapshot.offside.has(runner))continue;
  const deep=hasInstruction(runner,'deep'),wing=hasInstruction(runner,'wing');
  for(const lead of [4,7,10])for(const lateral of [-3,0,3]){
   const target={x:runner.x+lateral/s.x,y:runner.y+dir*lead/s.y};
   if(target.x<v55Field.left+1.2/s.x||target.x>v55Field.right-1.2/s.x||target.y<v55Field.top+2/s.y||target.y>v55Field.bottom-2/s.y)continue;
   const range=v122Metres(m.ball,target),gain=(target.y-p.y)*dir*s.y;
   if(range<8||range>32||gain<3)continue;
   const arrival=range/16,runnerTime=v150Delay(runner)+Math.max(0,v122Metres(runner,target)-.8)/v150Pace(runner);
   if(runnerTime>arrival+.75)continue;
   let margin=3,blocked=false;
   for(const rival of rivals){
    if(rival.slideActive)continue;
    margin=Math.min(margin,v150Delay(rival)+Math.max(0,v122Metres(rival,target)-.8)/v150Pace(rival)-runnerTime);
    const lane=passLaneGeometry(rival,m.ball,target);
    if(lane&&(!rival.keeper||v150KeeperArea(rival,lane))&&v150Delay(rival)+Math.max(0,v122Metres(rival,lane)-.8)/v150Pace(rival)<arrival*lane.t+.08)blocked=true;
   }
   if(blocked||margin<.10||rivals.some(r=>v122Metres(r,target)<2.2))continue;
   const awareness=(ability(p,'pas')+ability(p,'pos'))/40,score=gain*.035+Math.min(1,margin)*.65-Math.max(0,runnerTime-arrival)*.65-range*.012+(deep?.22:0)+(quick?.12:0)+(wing&&Math.abs(target.x-.5)>.22?.12:0)+(focus==='Außen'?Math.abs(target.x-.5)*.45:focus==='Mitte'?-Math.abs(target.x-.5)*.45:0)+awareness*.12;
   options.push({target,runner,score,margin});
  }
 }
 return options.sort((a,b)=>b.score-a.score||a.runner.n-b.runner.n);
}
function v150TrySpacePass(p,allies,rivals){
 if(!v65WorldActive||p.keeper||match.flight||match.rebound)return false;
 const option=v150Candidates(p,allies,rivals)[0];if(!option||option.score<.14)return false;
 const chance=clamp(.08+ability(p,'pas')*.012+ability(p,'pos')*.005+(match.teamDirect?.[p.t]?.10:0)+(hasInstruction(option.runner,'deep')?.10:0),.12,.58);
 if(random()>=chance)return false;
 v150SpacePass(p,option);return true;
}
function v150SpacePass(p,{target,runner=null}){
 if(typeof v157QueueTurn==='function'&&v157QueueTurn(match,p,target,'space',{runnerId:runner?.pid||null}))return;
 if(typeof v157AfterPass==='function'&&runner)v157AfterPass(match,p,runner);
 if(typeof v152AfterPass==='function')v152AfterPass(match,p,target);
 const m=match,s=v150Scale(),from={...m.ball},range=v122Metres(from,target),pressure=m.people.filter(q=>q.t!==p.t&&!q.keeper&&v122Metres(q,p)<3).length,quality=ability(p,'pas')*.75+ability(p,'tec')*.25;
 const error=.18+(20-quality)*.095+pressure*(20-ability(p,'tec'))*.025,dx=(target.x-from.x)*s.x,dy=(target.y-from.y)*s.y,d=Math.hypot(dx,dy)||1;
 const lateral=(random()-.5)*2*error,dosage=(random()-.5)*2*(.3+(20-ability(p,'pas'))*.12)*Math.min(1.5,range/15);
 const end={x:target.x+(dx/d*dosage-dy/d*lateral)/s.x,y:target.y+(dy/d*dosage+dx/d*lateral)/s.y},exit=v55Exit(from,end),landing=exit?{x:exit.x,y:exit.y}:end;
 const plan={passer:p,runner,intended:{...target},from,snapshot:v55OffsideSnapshot(p),age:0,targets:new Map(),contact:null,exit,settled:false};
 if(typeof v155AttemptPass==='function')v155AttemptPass(m,p,{...landing,pid:runner?.pid||null});
 p.stats.passes++;if((landing.y-p.y)*(p.t===0?-1:1)>.12)p.stats.progressive++;m.lastTouch=p.t;m.lastPass=null;m.rebound=null;
 note(`${p.name} spielt in den freien Raum.`);
 v102Scoped(p,'pass',()=>{v102Release.contact=from;fly(landing,v122Metres(from,landing)/16*MATCH_SPEED,()=>v150Arrive(m,plan));});
 plan.flight=m.flight;v150SpacePasses.set(m,plan);
 const event=typeof v117Flights!=='undefined'&&v117Flights.get(plan.flight);if(event){event.intent='space';event.intendedTarget={...target};event.intendedReceiverPid=runner?.pid||null;}
 return plan;
}
function v150Event(m,plan){return plan.flight&&typeof v117Flights!=='undefined'&&v117Flights.get(plan.flight)||m.ballAccounting?.events.find(e=>e.id===plan.eventId)}
function v150Lose(m,plan,reason='unreached'){
 if(!plan.settled){plan.passer.stats.passLost++;plan.settled=true;}
 const event=v150Event(m,plan);if(event){event.result=reason;event.endAt=m.elapsed;}
 v150SpacePasses.delete(m);delete m.spacePassIntent;
}
function v150Receive(m,plan,p,point){
 if(plan.snapshot.offside.has(p)){v150Lose(m,plan,'offside');m.flight=null;m.rebound=null;v55WhistleOffside(plan.snapshot,p);return;}
 plan.settled=true;v150SpacePasses.delete(m);delete m.spacePassIntent;m.flight=null;m.rebound=null;m.ball={...point};m.lastTouch=p.t;
 if(p.t===plan.passer.t&&p!==plan.passer){plan.passer.stats.passComplete++;m.lastPass={passer:plan.passer,receiver:p,at:m.elapsed};}
 else{plan.passer.stats.passLost++;m.lastPass=null;if(p.t!==plan.passer.t)p.stats.interceptions++;}
 const event=v150Event(m,plan);if(event){event.receiverPid=p.pid;event.result=p.t===plan.passer.t&&p!==plan.passer?'received':p===plan.passer?'recovered':'intercepted';event.endAt=m.elapsed;}
 if(p.keeper&&v150KeeperArea(p,point)){
  v115KeeperChallenges.set(m,{keeper:p,attacker:null,start:{x:p.x,y:p.y},end:{x:p.x,y:p.y},contact:{...point},at:v102Clock(m),duration:.55,caught:true,checked:true,pickup:true});
  v50GoalKick(p,`${p.name} sichert den freien Ball.`,{held:true});
 }else{m.owner=p;m.next=m.elapsed+.75;if(!p.keeper&&!v127TryOneTouch(p,point,plan.from))v123Receive(p,point);}
}
function v150Arrive(m,plan){
 if(plan.contact){v150Receive(m,plan,plan.contact.person,plan.contact.point);return;}
 if(plan.exit){v150Lose(m,plan,'out');v55Out(plan.exit,plan.passer.t,`Fehlpass von ${plan.passer.name}.`);return;}
 v50LooseBall(m.ball,'Der Raumpass bleibt frei.');plan.rebound=m.rebound;
 if(plan.rebound){
  plan.rebound.delay=0;plan.eventId=v150Event(m,plan)?.id;
  // A newly created loose pass can be saved without losing its offside/credit intent.
  m.spacePassIntent={version:150,passerPid:plan.passer.pid,runnerPid:plan.runner?.pid||null,from:plan.from,intended:plan.intended,eventId:plan.eventId,age:plan.age,lineY:plan.snapshot.lineY,ball:plan.snapshot.ball,offsidePids:[...plan.snapshot.offside].map(p=>p.pid),positions:[...plan.snapshot.positions].map(([p,point])=>[p.pid,point])};
 }
}
function v150RestoreIntent(m){
 const saved=m.spacePassIntent;if(!saved||saved.version!==150||!m.rebound||m.owner||m.flight)return null;
 const people=new Map([...m.people,...(m.exitedPeople||[])].map(p=>[p.pid,p])),passer=people.get(saved.passerPid);if(!passer)return null;
 const snapshot={lineY:saved.lineY,ball:{...saved.ball},offside:new Set(saved.offsidePids.map(id=>people.get(id)).filter(Boolean)),positions:new Map(saved.positions.map(([id,point])=>[people.get(id),{...point}]).filter(([p])=>p))};
 const plan={passer,runner:people.get(saved.runnerPid)||null,from:{...saved.from},intended:{...saved.intended},snapshot,age:saved.age,rebound:m.rebound,flight:null,targets:new Map(),settled:false,eventId:saved.eventId};v150SpacePasses.set(m,plan);return plan;
}
function v150Prepare(m,seconds){
 const plan=v150SpacePasses.get(m)||v150RestoreIntent(m);
 if(!plan)return;
 const active=m.flight&&m.flight===plan.flight||m.rebound&&m.rebound===plan.rebound;
 if(v121PositioningPaused(m)||m.owner||!active){v150Lose(m,plan,'interrupted');return;}
 plan.age+=Math.max(0,seconds);plan.before=new Map(m.people.map(p=>[p,{x:p.x,y:p.y}]));plan.targets=new Map();
 if(m.spacePassIntent)m.spacePassIntent.age=plan.age;
 const flight=m.flight,r=m.rebound,remaining=flight?Math.max(0,(1-flight.progress)*flight.duration/MATCH_SPEED):1;
 for(const team of [0,1]){
  const choices=[];
  for(const p of m.people){
   if(p.t!==team||p.slideActive||p===plan.passer&&plan.age<.25)continue;
   let best=null;
   for(let i=1;i<=12;i++){
    const time=remaining*i/12,point=flight?{x:m.ball.x+(flight.target.x-m.ball.x)*i/12,y:m.ball.y+(flight.target.y-m.ball.y)*i/12}:{x:r.x+(r.vx||0)*MATCH_SPEED*(1-Math.exp(-2.3*time))/2.3,y:r.y+(r.vy||0)*MATCH_SPEED*(1-Math.exp(-2.3*time))/2.3};
    if(p.keeper&&!v150KeeperArea(p,point))continue;
    const delay=Math.max(0,v150Delay(p)-plan.age),arrival=delay+Math.max(0,v122Metres(p,point)-.8)/v150Pace(p),cost=Math.max(time,arrival)+(arrival>time?.25:0);
    if(!best||cost<best.cost)best={point,cost};
   }
   if(best)choices.push({p,...best});
  }
  choices.sort((a,b)=>a.cost-b.cost||a.p.n-b.p.n);
  for(const choice of choices.slice(0,2))plan.targets.set(choice.p,choice.point);
 }
}
function v150RunTarget(m,p){const plan=v150SpacePasses.get(m),target=plan?.targets.get(p);if(!target)return;const waiting=plan.age<v150Delay(p);p.tx=waiting?p.x:target.x;p.ty=waiting?p.y:target.y;}
function v150Contact(m,plan,from,to){
 const s=v150Scale(),contacts=[];
 for(const p of m.people){
  if(p.slideActive||p===plan.passer&&plan.age<.25)continue;
  const before=plan.before?.get(p)||p,ax=(from.x-before.x)*s.x,ay=(from.y-before.y)*s.y,dx=((to.x-from.x)-(p.x-before.x))*s.x,dy=((to.y-from.y)-(p.y-before.y))*s.y;
  const a=dx*dx+dy*dy,b=2*(ax*dx+ay*dy),c=ax*ax+ay*ay-.8*.8,disc=b*b-4*a*c;
  const q=c<=0?0:a>1e-10&&disc>=0?(-b-Math.sqrt(disc))/(2*a):Infinity;
  if(q<0||q>1)continue;
  const point={x:from.x+(to.x-from.x)*q,y:from.y+(to.y-from.y)*q};
  contacts.push({person:p,point,q});
 }
 return contacts.sort((a,b)=>a.q-b.q||a.person.t-b.person.t||a.person.n-b.person.n)[0]||null;
}
function v150AdvanceFlight(m,delta){
 const plan=v150SpacePasses.get(m),f=m.flight;if(!plan||f!==plan.flight)return false;
 const q=Math.min(1,f.progress+delta/f.duration),from={...m.ball},to={x:f.x+(f.target.x-f.x)*q,y:f.y+(f.target.y-f.y)*q};
 plan.contact=v150Contact(m,plan,from,to);f.progress=q;m.ball=plan.contact?{...plan.contact.point}:to;
 if(plan.contact||q>=1){m.flight=null;f.done();}
 return true;
}
const v150BaseChase=v50ChaseLooseBall;
v50ChaseLooseBall=function(delta,positions){
 const m=match,plan=v150SpacePasses.get(m),r=m?.rebound;
 if(!plan||r!==plan.rebound)return v150BaseChase(delta,positions);
 const from={x:r.x,y:r.y},seconds=Math.max(0,delta)/MATCH_SPEED,damp=Math.exp(-2.3*seconds),travel=(1-damp)/(2.3/MATCH_SPEED),to={x:r.x+(r.vx||0)*travel,y:r.y+(r.vy||0)*travel},exit=v55Exit(from,to);
 const end=exit?{x:exit.x,y:exit.y}:to,contact=v150Contact(m,plan,from,end);
 if(contact){v150Receive(m,plan,contact.person,contact.point);return;}
 if(exit){v150Lose(m,plan,'out');m.rebound=null;m.ball=end;v55Out(exit,m.lastTouch,'Der freie Ball rollt über die Linie.');return;}
 r.x=to.x;r.y=to.y;r.vx*=damp;r.vy*=damp;m.ball={...to};
};
const v150BaseFinish=v65Finish;
v65Finish=function(...args){const plan=match&&(v150SpacePasses.get(match)||v150RestoreIntent(match));if(plan)v150Lose(match,plan,'interrupted');return v150BaseFinish.apply(this,args)};
