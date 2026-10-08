'use strict';

// Local football tuning for future matches only. Metres/second, native clock,
// and plain checkpoint data; neither renderer owns movement or possession.
function v157Active(m){return Boolean(v152Active(m)&&m.attackFlow.qualityVersion===157);}
function v157Angle(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a));}
function v157InitialBody(p){
  const s=v150Scale(),dx=(p.motionX||0)*s.x,dy=(p.motionY||0)*s.y;
  // An estimated simulation mass, not a generated or displayed player attribute.
  const massKg=clamp(Number.isFinite(p.weightKg)?p.weightKg:74*Math.pow((p.heightCm||178)/178,2)+((Number.isFinite(p.str)?p.str:10)-10)*.8,52,108);
  return {vx:0,vy:0,heading:Math.hypot(dx,dy)>.01?Math.atan2(dx,dy):p.t===0?Math.PI:0,massKg};
}
function v157Body(p){return p.offenseMotion||(p.offenseMotion=v157InitialBody(p));}
function v157Boundary(before,after,min,max){
 // Native restart positions can be outside the playing rectangle. Re-enter
 // through actual movement; a field constraint must never relocate that body.
 if(before<min)return Math.max(before,after);
 if(before>max)return Math.min(before,after);
 return clamp(after,min,max);
}
function v157Pace(m,p){
 const base=p.keeper?2.6+ability(p,'spd')*.065:3+ability(p,'spd')*.14;
 if(p.keeper)return typeof v158Movement==='function'?v158Movement(p,base,1).maxSpeed:base;
 const intent=m.attackFlow.intents[p.pid],chase=Boolean(m.flight||m.rebound),purposeful=intent&&['depth','follow'].includes(intent.type);
 const pace=base*(m.owner===p?1.24*(.78+ability(p,'tec')*.009):purposeful||chase?1.42:1.18);return typeof v158Movement==='function'?v158Movement(p,pace,1).maxSpeed:pace;
}
function v157Move(m,p,dt){
 if(!v157Active(m))return false;
 const body=v157Body(p),s=v150Scale();dt=Math.max(0,dt);
 const locked=v121PositioningPaused(m)||v115RestartLocked(m,p)||v101KeeperWaiting(m,p)||v113KeeperReacting(m,p);
 if(locked){body.vx=body.vy=0;return true;}
 const dx=(p.tx-p.x)*s.x,dy=(p.ty-p.y)*s.y,d=Math.hypot(dx,dy),speed=Math.hypot(body.vx,body.vy),mass=body.massKg/74;
 const pending=m.attackFlow.pendingTurn,pivot=pending?.playerId===p.pid&&m.owner===p;
 const mode=v108MovementMode(m,p),focus=mode?.facing;
 const target=pivot?(pending.kind==='space'?pending.target:pending.receiverId?m.people.find(q=>q.pid===pending.receiverId):pending.target):null;
 const heading=target?Math.atan2((target.x-p.x)*s.x,(target.y-p.y)*s.y):focus?Math.atan2((focus.x-p.x)*s.x,(focus.y-p.y)*s.y):d>.03?Math.atan2(dx,dy):body.heading;
 const angularRate=(3.5+ability(p,'tec')*.055)/Math.sqrt(mass)/(1+speed*.055);
 body.heading+=clamp(v157Angle(body.heading,heading),-angularRate*dt,angularRate*dt);
 const factor=v108MoveFactor(m,p,p.tx-p.x,p.ty-p.y),brake=10.5/mass,baseAccel=(6.2+ability(p,'spd')*.08)/mass,accel=typeof v158Movement==='function'?v158Movement(p,1,baseAccel).acceleration:baseAccel;
 const desired=pivot?0:Math.min(v157Pace(m,p)*factor,Math.sqrt(2*brake*Math.max(0,d-.05)));
 // Forward runners follow the body through a curve; defensive backpedalling
 // can retain its observed focus and its existing reduced speed.
 const alignment=focus?1:Math.max(0,Math.cos(v157Angle(body.heading,heading))),pace=desired*alignment;
 const vx=focus?(d?dx/d*pace:0):Math.sin(body.heading)*pace,vy=focus?(d?dy/d*pace:0):Math.cos(body.heading)*pace;
 const ax=vx-body.vx,ay=vy-body.vy,gap=Math.hypot(ax,ay),decelerating=desired<speed||body.vx*vx+body.vy*vy<0,change=Math.min(1,(decelerating?brake:accel)*dt/Math.max(.00001,gap));
 body.vx+=ax*change;body.vy+=ay*change;
 const x=p.x+body.vx*dt/s.x,y=p.y+body.vy*dt/s.y;
 p.x=v157Boundary(p.x,x,v55Field.left+.15/s.x,v55Field.right-.15/s.x);p.y=v157Boundary(p.y,y,v55Field.top+.15/s.y,v55Field.bottom-.15/s.y);
 if(p.x!==x)body.vx=0;if(p.y!==y)body.vy=0;
 return true;
}
function v157Movement(m,p){
 if(!v157Active(m)||p.slideActive)return null;
 const body=p.offenseMotion||v157InitialBody(p),s=v150Scale(),turn=m.attackFlow.pendingTurn?.playerId===p.pid;
 return {mode:turn?'turn':Math.hypot(body.vx,body.vy)>.2?'run':'idle',facing:{x:p.x+Math.sin(body.heading)/s.x,y:p.y+Math.cos(body.heading)/s.y}};
}
function v157Separate(m,a,b,dx,dy,gap,push,sx,sy){
 if(!v157Active(m))return false;
 if(v121PositioningPaused(m))return true;
 const aa=v157Body(a),bb=v157Body(b),total=aa.massKg+bb.massKg,nx=dx/gap,ny=dy/gap;
 const move=push*2;
 a.x=v157Boundary(a.x,a.x+nx*move*bb.massKg/total/sx,.055,.945);a.y=v157Boundary(a.y,a.y+ny*move*bb.massKg/total/sy,.06,.94);
 b.x=v157Boundary(b.x,b.x-nx*move*aa.massKg/total/sx,.055,.945);b.y=v157Boundary(b.y,b.y-ny*move*aa.massKg/total/sy,.06,.94);
 const closing=(aa.vx-bb.vx)*nx+(aa.vy-bb.vy)*ny;
 if(closing<0){const impulse=-closing*1.05/(1/aa.massKg+1/bb.massKg);aa.vx+=nx*impulse/aa.massKg;aa.vy+=ny*impulse/aa.massKg;bb.vx-=nx*impulse/bb.massKg;bb.vy-=ny*impulse/bb.massKg;}
 return true;
}
function v157Prepare(m){
 if(!v157Active(m))return;
 const flow=m.attackFlow,now=v152Seconds(m),owner=m.owner;
 if(v121PositioningPaused(m)){delete flow.pendingTurn;delete flow.combination;return;}
 for(const p of m.people)v157Body(p);
 if(flow.pendingTurn&&(flow.pendingTurn.playerId!==owner?.pid||!m.people.some(p=>p.pid===flow.pendingTurn.receiverId)||flow.pendingTurn.until<now))delete flow.pendingTurn;
 const combo=flow.combination;
 if(combo&&(combo.until<now||v123PossessionTeam(m)!==combo.team||!m.people.some(p=>p.pid===combo.passerId)||!m.people.some(p=>p.pid===combo.receiverId)))delete flow.combination;
 // Negative orientations and cover roles keep their role-specific guard.
 for(const [id,intent]of Object.entries(flow.intents)){
  const p=m.people.find(q=>q.pid===id);
  if(!p||p.role<0||intent.type==='depth'&&['ball-winner','target-player','ball-playing-defender'].includes(p.tacticalRole))delete flow.intents[id];
 }
 if(!owner||owner.keeper)return;
 // Keep the same first-touch preparation; the planning cadence is already .45s.
 if(combo?.receiverId===owner.pid&&(!(typeof v159Active==='function'&&v159Active(m))||combo.confirmed)){
  const passer=m.people.find(p=>p.pid===combo.passerId),s=v150Scale(),dir=owner.t===0?-1:1;
  if(passer&&passer.role>=0){const side=passer.x<owner.x?-1:1;flow.intents[passer.pid]={x:clamp(owner.x+side*4/s.x,v55Field.left+1/s.x,v55Field.right-1/s.x),y:clamp(owner.y+dir*6/s.y,v55Field.top+1.4/s.y,v55Field.bottom-1.4/s.y),type:'follow',team:owner.t,until:combo.until};}
 }
}
function v157Target(m,p,dt){
 if(!v157Active(m)||v121PositioningPaused(m)||p.keeper||p.slideActive)return;
 if(m.owner===p&&m.attackFlow.pendingTurn?.playerId===p.pid){p.tx=p.x;p.ty=p.y;return;}
 if(m.owner===p){if(typeof v159CarrierTarget==='function')v159CarrierTarget(m,p);return;}
 if(typeof v159DefensiveTarget==='function'&&v159DefensiveTarget(m,p))return;
 const intent=m.attackFlow.intents[p.pid];if(!intent||intent.team!==v123PossessionTeam(m)||intent.until<v152Seconds(m))return;
 const last=p.offenseCoord||(p.offenseCoord={x:p.tx,y:p.ty}),blend=Math.min(1,dt*(3+4*clamp(p.positionRoutine??.7,0,1)));
 last.x+=(intent.x-last.x)*blend;last.y+=(intent.y-last.y)*blend;p.tx=last.x;p.ty=last.y;
 if(m.owner){const limit=v121PositioningPlans.get(m)?.get(p)?.limit;if(limit!=null)p.ty=p.t===0?Math.max(p.ty,limit):Math.min(p.ty,limit);}
}
function v157AfterPass(m,p,q){
 if(!v157Active(m)||!q?.pid||p.keeper||q.t!==p.t)return;
 m.attackFlow.combination={passerId:p.pid,receiverId:q.pid,team:p.t,until:v152Seconds(m)+2.1};
 if(typeof v159AfterPass==='function')v159AfterPass(m,p,q);
}
function v157PassLead(m,p,q,from){
 if(!v157Active(m))return null;
 const s=v150Scale(),body=v157Body(q),moving=Math.hypot(body.vx,body.vy);
 // Every running receiver carries momentum, including a support or wide offer.
 // Solve the moving intersection using observed velocity, not a fixed deep lead
 // or a future role target. Native errors and actual contact still decide receipt.
 if(moving<.35)return {x:q.x,y:q.y};
 let time=v122Metres(from,q)/16,target={x:q.x,y:q.y};
 for(let i=0;i<4;i++){
  target={x:v157Boundary(q.x,q.x+body.vx*Math.min(.95,time)/s.x,v55Field.left+.15/s.x,v55Field.right-.15/s.x),y:v157Boundary(q.y,q.y+body.vy*Math.min(.95,time)/s.y,v55Field.top+.15/s.y,v55Field.bottom-.15/s.y)};
  const duration=clamp(distance(from,target)*1.5,.32,.9);
  time=Math.max(duration/MATCH_SPEED,v122Metres(from,target)/16);
 }
 return target;
}
function v157PassError(m,from,target,accuracy){
 if(!v157Active(m))return null;
 const s=v150Scale(),factor=clamp(v122Metres(from,target)/30,.12,1.25),metres=accuracy*s.x*factor;
 // Short kicks no longer inherit the same field-normalized error as long balls.
 // Preserve the existing skill/pressure error and two execution random draws;
 // express its distance-scaled spread in the same physical units on both axes.
 return {x:metres/s.x,y:metres/s.y};
}
function v157Lane(m,p,point,rivals,clearance=1.4){
 return rivals.every(r=>{if(r.keeper||r.slideActive)return true;const lane=passLaneGeometry(r,m.ball,point);return v122Metres(r,point)>1.8&&(!lane||v122Metres(r,lane)>clearance);});
}
function v157QueueTurn(m,p,q,kind='ground',options={}){
 if(!v157Active(m)||m.owner!==p||p.keeper||kind==='header'||options.exempt||v121PositioningPaused(m)||m.attackFlow.releaseGuard===p.pid)return false;
 const body=v157Body(p),s=v150Scale(),target=Math.atan2((q.x-p.x)*s.x,(q.y-p.y)*s.y);
 if(Math.abs(v157Angle(body.heading,target))<=1.05)return false;
 m.attackFlow.pendingTurn={playerId:p.pid,receiverId:q.pid||options.runnerId||null,target:{x:q.x,y:q.y},kind,options:{...options},until:v152Seconds(m)+2.2};
 m.next=m.elapsed+.04*MATCH_SPEED;return true;
}
function v157ContinueTurn(m,p,rivals){
 const turn=m.attackFlow.pendingTurn;if(!turn)return false;
 const q=m.people.find(p=>p.pid===turn.receiverId),target=turn.kind==='space'?turn.target:q,body=v157Body(p),s=v150Scale();
 if(turn.playerId!==p.pid||!q||q.slideActive||v55OffsideSnapshot(p).offside.has(q)||!v157Lane(m,p,target,rivals,1.2)){delete m.attackFlow.pendingTurn;return false;}
 const angle=Math.atan2((target.x-p.x)*s.x,(target.y-p.y)*s.y);
 if(Math.abs(v157Angle(body.heading,angle))>.30||Math.hypot(body.vx,body.vy)>1.2){m.next=m.elapsed+.04*MATCH_SPEED;return true;}
 delete m.attackFlow.pendingTurn;m.attackFlow.releaseGuard=p.pid;
 try{if(turn.kind==='high')v55HighPass(p,q,turn.options);else if(turn.kind==='space')v150SpacePass(p,{target:turn.target,runner:q});else v55GroundPass(p,q);}finally{delete m.attackFlow.releaseGuard;}
 return true;
}
function v157ShotQuality(p,rivals){
 const s=v150Scale(),goal={x:.5,y:p.t===0?v55Field.top:v55Field.bottom},depth=Math.abs(goal.y-p.y)*s.y,lateral=Math.abs(goal.x-p.x)*s.x,range=v115GoalDistance(p);
 if(depth<1||range>22||lateral>depth*.85+1)return 0;
 if(rivals.some(r=>!r.keeper&&!r.slideActive&&(()=>{const lane=passLaneGeometry(r,p,goal);return lane&&v122Metres(r,lane)<1.4;})()))return 0;
 return clamp((22-range)/12,0,1)*(.55+(ability(p,'fin')+ability(p,'tec'))/80);
}
function v157Decide(m,p,allies,rivals){
 if(!v157Active(m)||p.keeper)return false;
 if(typeof v159Decide==='function'&&v159Decide(m,p))return true;
 if(v157ContinueTurn(m,p,rivals))return true;
 if(v131OpenGoal(p)){v55Shoot(p);return true;}
 const s=v150Scale(),dir=p.t===0?-1:1,range=v115GoalDistance(p),offside=v55OffsideSnapshot(p).offside;
 const options=allies.filter(q=>!q.slideActive&&!offside.has(q)).map(q=>{
  const target=v157PassLead(m,p,q,m.ball),distance=v122Metres(p,target),gain=(target.y-p.y)*dir*s.y,quality=v157ShotQuality({...q,...target},rivals),combo=m.attackFlow.combination,returnRun=combo?.receiverId===p.pid&&combo.passerId===q.pid&&gain>2&&(!(typeof v159Active==='function'&&v159Active(m))||combo.confirmed);
  return {q,target,distance,gain,quality,returnRun,score:gain*.11-distance*.028+quality*.9+(returnRun?.65:0)};
 }).filter(o=>o.target.x>=v55Field.left&&o.target.x<=v55Field.right&&o.target.y>=v55Field.top&&o.target.y<=v55Field.bottom&&o.distance>=3&&o.distance<=(m.teamDirect?.[p.t]?25:20)&&v157Lane(m,p,o.target,rivals)).sort((a,b)=>b.score-a.score||a.q.n-b.q.n);
 const shot=v157ShotQuality(p,rivals),square=options.find(o=>o.quality>shot+.22&&v115GoalDistance(o.q)<range-2);
 if(square){v55GroundPass(p,square.q);return true;}
 // A useful finishing window precedes speculative space balls and forced carry.
 if(shot>0&&(range<=14||random()<Math.max(v145ShotChance(p,rivals),shot*.65))){v55Shoot(p);return true;}
 const useful=options.find(o=>o.returnRun||o.gain>=3&&o.score>.05);
 if(useful){v55GroundPass(p,useful.q);return true;}
 if(v150TrySpacePass(p,allies,rivals))return true;
 if(v154TryDribble(m,p,allies,rivals))return true;
 const near=rivals.filter(q=>!q.keeper&&v122Metres(p,q)<3.5),progress=p.t===0?1-p.y:p.y;
 if(!near.length&&v55HasClearRun(p,rivals,progress)){m.breakawayCarrier=p;m.next=m.elapsed+.24*MATCH_SPEED;return true;}
 const support=options[0];if(support&&near.length){v55GroundPass(p,support.q);return true;}
 const box=allies.filter(q=>!offside.has(q)&&v115GoalDistance(q)<16);
 if(range<26&&Math.abs(p.x-.5)*s.x>9&&box.length&&random()<v115DecisionChance(p,'cross',.55)){const q=box.sort((a,b)=>ability(b,'air')-ability(a,'air'))[0];v55HighPass(p,q,{cross:true});return true;}
 // Keep carrying to create a new angle rather than always recycling sideways.
 m.next=m.elapsed+.28*MATCH_SPEED;return true;
}
