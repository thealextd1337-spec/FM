'use strict';

// Player intelligence 183, package SI-1: option model of the ball carrier.
// For v183Active(m,'options') one evaluation replaces the fixed order of
// v157Decide (W7: striker carry, turn, square pass, shot, high ball, forward
// pass, space pass, dribble, breakaway, emergency pass, cross, carry). The dead
// second tree behind it (pitch-v55.js action, W1/W3) is never reached by
// marked matches either and stays unchanged for older ones; its team focus and
// direct play enter the evaluation as weights. Unmarked and 182 matches and
// marked matches with the package off run the wrapped functions unchanged.
//
// Every option is valued in one unit, the goal probability of the next state:
//   shot   gain xG (v183ShotEstimate) inside the window windowBase+windowFin*fin m
//   pass   gain arrival*receiver value (v183PassEstimate), loss (1-arrival)*L
//   space  pass into a runner's path (v150Candidates), high ball (v162HighOption)
//   cross  arrival*header value (v183CrossEstimate)
//   carry  keep probability*value 1 s ahead in a free corridor (goal, straight,
//          two diagonals); hold = shield on the spot
// utility = gain*turn discount - loss/risk. L is the opponent's possession value
// at the loss point (counter weight). Body orientation is a cost of every option:
// a pass beyond the legacy queue angle (1.05 rad) costs its turn time, a shot
// loses value away from the heading, and a shot can replace a pending pass turn
// ("shot from the turn", H5). A pending turn releases at turnRelease rad and
// turnSpeed m/s.
// Personality (v183Personality, role and mental values) only weights: shoot
// the shot gain, dribble the carry gain, hold the hold gain and risk only the
// loss term, never lane width or arrival (these depend on pas/tec and geometry).
// Until the first 192 series the weights are taken relative to the neutral
// player and clamped to weightMin-weightMax. Score and remaining time scale the
// risk weight. Beyond the SI-F personality formula, dec only sets the
// evaluation noise: a softmax over the options whose temperature falls with dec
// (dec 20 takes the best option without noise).
// SI-F stub bridge: a shot estimate with speed:null is the SI-F stub
// (v157ShotQuality, a quality up to 22 m). It is read at the point whose goal
// distance is range*stubRange/window on the same line and scaled by stubScale,
// so the skill window applies; a blocker between the shooter and that point
// halves it. A real estimate (SI-3) is used as it is. Cross header values use
// the same scale while the shot estimate is the stub.
// Random draws: one named draw "options.choice", only when at least two options
// lie inside the noise band. The executed actions keep their native draws.
// State: attackFlow.decision (plain data: player, option, reference, target,
// times in real seconds of v183Seconds) gives commitment and the re-check of a
// pending turn; it is saved and restored with the match. Deadlines read by
// older code (attackFlow.carry, pendingTurn) stay on v152Seconds.

v183RegisterDefaults('options',{
 cadence:.25,              // decision cadence (s, real) after carry/hold
 weightMin:.85,weightMax:1.15, // effective personality span
 windowBase:16,windowFin:.7,   // shooter window (m): 16 + 0.7*fin
 stubRange:22,stubScale:.4,    // SI-F shot stub bridge (see above)
 threat:.3,threatLength:16,    // possession value .3*exp(-d/16), d metres to goal
 counter:1.6,              // weight of the opponent's possession value after a loss
 recvShot:.85,offer:.15,oneTwo:.03,passMin:2.5,passMax:32,
 turnRelease:.55,turnSpeed:2.5,turnTick:.08,turnCheck:.25,turnTau:.7,
 shotFree:1.2,shotTurn:.5,switchMargin:.15,
 carryHorizon:1,carryMin:2.5,carryMax:6,carryShot:.4,engage:2,
 holdFactor:.9,crossConv:.6,crossMax:30,crossWide:8,laneOne:.5,
 spaceCount:3,
 noise:.15,noiseFloor:.006,commit:.08,
 scoreRisk:.15,focus:.1,direct:.25
});
const V183_OPT_KEYS=Object.freeze(Object.keys(v183RegisterDefaults('options',{})));
// Neutral values of the SI-F personality formula (role 1, mental values 10).
const V183_OPT_NEUTRAL=Object.freeze({shootWeight:.85,riskWeight:.9,dribbleWeight:.9,holdWeight:.95});

function v183OptParams(m){const P={};for(const key of V183_OPT_KEYS)P[key]=v183Param(m,'options.'+key);return P;}
function v183OptWeights(p,P){const raw=v183Personality(p),w={};for(const [key,neutral]of Object.entries(V183_OPT_NEUTRAL))w[key]=clamp(raw[key]/neutral,P.weightMin,P.weightMax);return w;}
// Real seconds into the v152Seconds deadlines read by older code (carry,
// turns), without assuming how that clock relates to the match rate.
function v183OptLegacyAfter(m,seconds){return v152Seconds(m)+seconds*v183Rate(m)*v152Seconds({elapsed:1,si:m.si});}
function v183OptGoal(t){return {x:.5,y:t===0?v55Field.top:v55Field.bottom};}
function v183OptGoalDistance(point,t){return v115GoalDistance({x:point.x,y:point.y,t});}
// Possession value of team t at point: threat*exp(-d/threatLength), halved
// toward the goal line at a flat angle.
function v183OptThreat(P,point,t){
 const s=v150Scale(),depth=Math.abs(point.y-(t===0?v55Field.top:v55Field.bottom))*s.y,lateral=Math.abs(point.x-.5)*s.x;
 return P.threat*Math.exp(-Math.hypot(depth,lateral)/P.threatLength)*(.5+.5*clamp((depth+2)/(lateral+2),0,1));
}
// Value lost when team t loses the ball at point.
function v183OptLoss(P,point,t){return P.counter*v183OptThreat(P,point,1-t);}
function v183OptHeading(p,point){const s=v150Scale();return Math.atan2((point.x-p.x)*s.x,(point.y-p.y)*s.y);}
function v183OptTurnRate(p){const body=v157Body(p);return (3.5+ability(p,'tec')*.055)*1.32/Math.sqrt(body.massKg/74)/(1+Math.hypot(body.vx,body.vy)*.055);}
// Seconds before a pass to point can be released: none inside the legacy queue
// angle (v157QueueTurn), otherwise turning to turnRelease and slowing to turnSpeed.
function v183OptTurnTime(p,point,P,rate){
 const body=v157Body(p),angle=Math.abs(v157Angle(body.heading,v183OptHeading(p,point)));
 if(angle<=1.05)return 0;
 return Math.max(0,angle-P.turnRelease)/rate+Math.max(0,Math.hypot(body.vx,body.vy)-P.turnSpeed)/(10.5*1.25/(body.massKg/74));
}
function v183OptScoreRisk(m,p,P){const diff=m.score[p.t]-m.score[1-p.t],late=clamp(m.elapsed/(m.fullTimeEnd||75),0,1);return 1+P.scoreRisk*clamp(-diff,-1,1)*late*late;}
function v183OptInside(point,s,margin){return point.x>=v55Field.left+margin/s.x&&point.x<=v55Field.right-margin/s.x&&point.y>=v55Field.top+margin/s.y&&point.y<=v55Field.bottom-margin/s.y;}

// ----- Shot value (goal probability) -----
function v183OptShot(m,p,P,from=p){
 const range=v183OptGoalDistance(from,p.t),window=P.windowBase+P.windowFin*ability(p,'fin');
 if(range>window)return {xg:0,range,window,stub:null};
 const est=v183ShotEstimate(m,p,from);
 if(est.speed!==null)return {xg:Math.max(0,est.xg||0),range,window,stub:false};
 const goal=v183OptGoal(p.t),f=clamp(P.stubRange/window,.5,1.5),virtual={x:goal.x+(from.x-goal.x)*f,y:goal.y+(from.y-goal.y)*f};
 let near=0;
 if(f<1)for(const r of m.people){if(r.t===p.t||r.keeper||r.slideActive)continue;const lane=passLaneGeometry(r,from,virtual);if(lane&&v122Metres(r,lane)<1.4)near++;}
 const quality=f===1?est.xg:v183ShotEstimate(m,p,virtual).xg;
 return {xg:Math.max(0,quality||0)*P.stubScale*(near===0?1:near===1?P.laneOne:0),range,window,stub:true};
}
// Whether the active shot estimate is the SI-F stub (speed:null).
function v183OptStubEstimate(m,p){return v183ShotEstimate(m,p,p).speed===null;}

// ----- Pass estimate (SI-1 owns v183PassEstimate) -----
// arrival: probability that the ground pass reaches q and is controlled,
// mirroring the native execution (v55GroundPass): first lane interceptor and
// its chance, passing error against the receiver's reach, first-touch failure.
// It depends on pas/tec/pos/spd and geometry only, never on personality.
// receiver: value of q's possession at the target (max of the position value
// and his shot there, both reduced by the space around him; +offer for a run,
// +oneTwo for a confirmed return run). loss: opponent value at the loss point.
// value = arrival*receiver - (1-arrival)*loss (objective, before risk weight).
// lane: today's open-lane test (v157Lane), returnRun as in the stub.
function v183OptPass(m,p,q,target,P,ctx){
 const from=m.ball,point=target||v157PassLead(m,p,q,from)||{x:q.x,y:q.y},s=v150Scale(),dir=p.t===0?-1:1,pas=ability(p,'pas');
 const rivals=ctx?.rivals||m.people.filter(r=>r.t!==p.t),duration=clamp(distance(from,point)*1.5,.32,.9),seconds=v115FlightDuration(from,point,duration,'pass')/MATCH_SPEED;
 const lanes=[];
 for(const r of rivals){
  if(r.keeper||r.slideActive)continue;
  const g=passLaneGeometry(r,from,point);if(!g)continue;
  const gap=v122Metres(r,g),margin=(3+ability(r,'spd')*.14)*seconds*g.t-Math.max(0,gap-.8),weight=clamp((margin+.6)/1.2,0,1)*clamp((3.4-gap)/.8,0,1);
  if(weight>0)lanes.push({t:g.t,weight,chance:clamp(.11+ability(r,'pos')*.016+ability(r,'spd')*.004-pas*.011,.05,.55)});
 }
 lanes.sort((a,b)=>a.t-b.t);
 let intercept=0,clear=1;for(const lane of lanes){intercept+=clear*lane.weight*lane.chance;clear*=1-lane.weight;}
 // Execution error (uniform square, metres) against the receiver's reach. The
 // pressure count mirrors v55GroundPass (normalised .15, W4; SI-4 owns that radius).
 const pressure=m.people.filter(r=>r.t!==p.t&&!r.keeper&&distance(r,p)<.15).length,accuracy=clamp((20-pas)*.003+pressure*.015,.005,.1),error=accuracy*s.x*clamp(v122Metres(from,point)/30,.12,1.25);
 const reach=.8+(3+ability(q,'spd')*.14)*1.2*Math.max(0,seconds-.15)*.75,root=Math.SQRT2*error;
 const reached=reach>=root?1:reach<=error?Math.PI*reach*reach/(4*error*error):Math.PI/4+(1-Math.PI/4)*(reach-error)/(root-error);
 let near=Infinity,crowd=0;for(const r of rivals){if(r.keeper)continue;const d=v122Metres(r,point);near=Math.min(near,d);if(d<2.5)crowd++;}
 const tec=ability(q,'tec'),failure=clamp(.015+(20-tec)*.006+crowd*(.025+(20-tec)*.002),.015,.30),arrival=clamp((1-intercept)*reached*(1-.6*failure),0,1);
 const gain=(point.y-p.y)*dir*s.y,combo=m.attackFlow?.combination;
 const returnRun=Boolean(combo?.receiverId===p.pid&&combo.passerId===q.pid&&gain>2&&combo.confirmed);
 const space=clamp((near-1.2)/4,.25,1),shot=v183OptShot(m,q,P,point).xg*P.recvShot*space;
 let receiver=Math.max(v183OptThreat(P,point,q.t)*(.6+.4*space),shot);
 if(ctx?.offers?.has(q.pid))receiver*=1+P.offer;
 if(returnRun)receiver+=P.oneTwo;
 const loss=v183OptLoss(P,{x:(from.x+point.x)/2,y:(from.y+point.y)/2},p.t);
 return {arrival,value:arrival*receiver-(1-arrival)*loss,receiver,loss,intercept,lane:v157Lane(m,p,point,rivals),returnRun,target:{x:point.x,y:point.y},gain};
}
const v183OptPassStub=v183PassEstimate;
v183PassEstimate=function(m,p,q,target){
 if(!v183Active(m,'options'))return v183OptPassStub(m,p,q,target);
 return v183OptPass(m,p,q,target,v183OptParams(m),null);
};

// ----- Carry and hold -----
// Probability of keeping the ball on the segment p->point within `horizon`
// seconds: every opponent who can reach the segment challenges engage times
// (weighted by how surely he reaches it) with today's standing-tackle chance;
// from behind half as often (B03 keeps its fouls).
function v183OptKeep(m,p,point,horizon,P,rivals){
 const s=v150Scale(),dx=(point.x-p.x)*s.x,dy=(point.y-p.y)*s.y,len2=dx*dx+dy*dy,tec=ability(p,'tec'),spd=ability(p,'spd');
 let keep=1;
 for(const r of rivals){
  if(r.slideActive||(r.recoverUntil||0)>m.elapsed)continue;
  const rx=(r.x-p.x)*s.x,ry=(r.y-p.y)*s.y,u=len2?clamp((rx*dx+ry*dy)/len2,0,1):0,dseg=Math.hypot(rx-u*dx,ry-u*dy);
  let reach,chance;
  if(r.keeper){if(v183OptGoalDistance(point,p.t)>16.5)continue;reach=1.45+(2.6+ability(r,'spd')*.065)*Math.max(0,horizon-.25)*.8;chance=clamp(.48+ability(r,'gk')*.025-tec*.013,.2,.8);}
  else{reach=.9+(3+ability(r,'spd')*.14)*1.45*Math.max(0,horizon-clamp(.3-(ability(r,'pos')-1)*.01,.1,.32))*.8;chance=clamp(.18+(ability(r,'tak')-tec)*.022+(ability(r,'pos')-spd)*.006+(m.aggression?.[r.t]??0)*.04,.08,.55);}
  const weight=clamp((reach+.5-dseg)/1.5,0,1)*(len2&&(rx*dx+ry*dy)<-.5*Math.sqrt(len2)?.5:1);
  keep*=Math.pow(1-chance,weight*P.engage);
 }
 return keep;
}
function v183OptCarries(m,p,P,ctx){
 const s=v150Scale(),dir=p.t===0?-1:1,goal=v183OptGoal(p.t),gx=(goal.x-p.x)*s.x,gy=(goal.y-p.y)*s.y,gl=Math.hypot(gx,gy)||1,ux=gx/gl,uy=gy/gl;
 const step=clamp(v157Pace(m,p)*P.carryHorizon,P.carryMin,P.carryMax),dirs=[{ref:'goal',x:ux,y:uy},{ref:'straight',x:0,y:dir}];
 for(const side of [-1,1]){const c=Math.cos(.6*side),n=Math.sin(.6*side);dirs.push({ref:side<0?'left':'right',x:ux*c-uy*n,y:ux*n+uy*c});}
 const out=[],body=v157Body(p);
 for(const d of dirs){
  const point={x:p.x+d.x*step/s.x,y:p.y+d.y*step/s.y};
  if(!v183OptInside(point,s,1.4))continue;
  const keep=v183OptKeep(m,p,point,P.carryHorizon,P,ctx.rivals),value=Math.max(v183OptThreat(P,point,p.t),v183OptShot(m,p,P,point).xg*P.carryShot);
  const turn=Math.max(0,Math.abs(v157Angle(body.heading,Math.atan2(d.x,d.y)))-.5)/ctx.turnRate*.5;
  out.push({kind:'carry',ref:d.ref,target:point,dir:{x:d.x,y:d.y},keep,gain:ctx.w.dribbleWeight*keep*value*Math.exp(-turn/P.turnTau),loss:(1-keep)*v183OptLoss(P,p,p.t)});
 }
 const keep=v183OptKeep(m,p,p,.5,P,ctx.rivals);
 out.push({kind:'hold',ref:null,target:{x:p.x,y:p.y},keep,gain:ctx.w.holdWeight*keep*v183OptThreat(P,p,p.t)*P.holdFactor,loss:(1-keep)*v183OptLoss(P,p,p.t)});
 return out;
}

// ----- Evaluation -----
function v183OptFocus(m,p,point,P){
 const focus=m.teamFocus?.[p.t]||'Variabel',wide=clamp(Math.abs(point.x-.5)*2,0,1)*2-.5;
 return 1+(focus==='Außen'?P.focus*wide:focus==='Mitte'?-P.focus*wide:0);
}
function v183OptDirect(m,p,gain,P){return m.teamDirect?.[p.t]&&gain>0?1+P.direct*Math.min(1,gain/15):1;}
function v183OptOptions(m,p,allies,rivals,P){
 const s=v150Scale(),w=v183OptWeights(p,P),risk=w.riskWeight*v183OptScoreRisk(m,p,P),now=v152Seconds(m),flow=m.attackFlow,body=v157Body(p);
 const offside=v55OffsideSnapshot(p).offside,offers=new Set(v183Offers(m).filter(o=>o.team===p.t&&o.until>=now&&['depth','follow'].includes(o.type)).map(o=>o.pid));
 const ctx={P,w,risk,rivals,offers,turnRate:v183OptTurnRate(p)},list=[],range=v183OptGoalDistance(p,p.t);
 const press=1-v183OptKeep(m,p,p,.5,P,rivals),here=v183OptLoss(P,p,p.t);
 // A pending action during a turn: the chance to be dispossessed meanwhile.
 const delayed=(o,time)=>{const e=Math.exp(-time/P.turnTau);o.gain*=e;o.loss=e*o.loss+(1-e)*press*here;return o;};
 // Shot.
 const shot=v183OptShot(m,p,P,p);
 if(shot.xg>0){const angle=Math.abs(v157Angle(body.heading,v183OptHeading(p,v183OptGoal(p.t)))),orient=angle<=P.shotFree?1:clamp(1-(angle-P.shotFree)*P.shotTurn,.25,1);list.push({kind:'shot',ref:null,target:null,xg:shot.xg,orient,gain:w.shootWeight*shot.xg*orient,loss:0});}
 // Ground passes.
 for(const q of allies){
  if(q.slideActive||offside.has(q))continue;
  const target=v157PassLead(m,p,q,m.ball);if(!target||!v183OptInside(target,s,0))continue;
  const metres=v122Metres(p,target);if(metres<P.passMin||metres>P.passMax)continue;
  const e=v183OptPass(m,p,q,target,P,ctx),factor=v183OptFocus(m,p,target,P)*v183OptDirect(m,p,e.gain,P);
  list.push(delayed({kind:'pass',ref:q.pid,q,target,arrival:e.arrival,gain:e.arrival*e.receiver*factor,loss:(1-e.arrival)*e.loss},v183OptTurnTime(p,target,P,ctx.turnRate)));
 }
 // Space passes into a runner's path (v150 targets, reachable runners only).
 if(!m.flight&&!m.rebound&&P.spaceCount>0){
  const pressure=rivals.filter(r=>!r.keeper&&v122Metres(r,p)<3).length;
  for(const o of v150Candidates(p,allies,rivals).slice(0,P.spaceCount)){
   const metres=v122Metres(m.ball,o.target),arrival=clamp(.35+.6*Math.min(1,o.margin)-.004*(20-ability(p,'pas'))*metres-.05*pressure,.05,.85);
   const receiver=Math.max(v183OptThreat(P,o.target,p.t),v183OptShot(m,o.runner,P,o.target).xg*P.recvShot)*(offers.has(o.runner.pid)?1+P.offer:1),gain=(o.target.y-p.y)*(p.t===0?-1:1)*s.y;
   list.push(delayed({kind:'space',ref:o.runner.pid,q:o.runner,option:o,target:o.target,arrival,gain:arrival*receiver*v183OptFocus(m,p,o.target,P)*v183OptDirect(m,p,gain,P),loss:(1-arrival)*v183OptLoss(P,o.target,p.t)},v183OptTurnTime(p,o.target,P,ctx.turnRate)));
  }
 }
 // High ball over a midfield obstruction.
 const high=v162HighOption(m,p,allies,rivals);
 if(high){const arrival=clamp(.3+(ability(p,'pas')-10)*.03+Math.min(1,(high.space-2.8)/6)*.25,.1,.75),receiver=v183OptThreat(P,high.q,p.t);list.push(delayed({kind:'high',ref:high.q.pid,q:high.q,target:{x:high.q.x,y:high.q.y},arrival,gain:arrival*receiver*v183OptDirect(m,p,high.gain,P),loss:(1-arrival)*v183OptLoss(P,high.q,p.t)},v183OptTurnTime(p,high.q,P,ctx.turnRate)));}
 // Cross into the box (header value on the shot scale of the estimate).
 if(range<P.crossMax&&Math.abs(p.x-.5)*s.x>P.crossWide){
  for(const q of allies){
   if(q.slideActive||offside.has(q)||v183OptGoalDistance(q,p.t)>=16)continue;
   const c=v183CrossEstimate(m,p,q);if(!c.eligible||!(c.arrival>0))continue;
   ctx.stub??=shot.stub??v183OptStubEstimate(m,p);
   const header=Math.max(0,c.headerXg||0)*(ctx.stub?P.stubScale:1)*P.crossConv;
   list.push(delayed({kind:'cross',ref:q.pid,q,target:{x:q.x,y:q.y},arrival:c.arrival,gain:c.arrival*header*v183OptFocus(m,p,q,P),loss:(1-c.arrival)*v183OptLoss(P,q,p.t)},v183OptTurnTime(p,q,P,ctx.turnRate)));
  }
 }
 // Carry, dribble, hold.
 list.push(...v183OptCarries(m,p,P,ctx));
 for(const o of list)o.u=o.gain-o.loss/risk;
 return {list,ctx,range};
}
// Softmax choice over the options inside the noise band: temperature
// noise*(20-dec)/10 of the best utility (at least noiseFloor); dec 20 chooses
// the best option without noise. A missing dec counts as 10 (SI-F rule). One named draw "options.choice" only when two
// or more options compete.
function v183OptChoose(m,p,list,P){
 const decision=m.attackFlow.decision,now=v183Seconds(m);
 let best=-Infinity;for(const o of list)best=Math.max(best,o.u);
 const scale=Math.max(Math.abs(best),P.noiseFloor);
 if(decision?.playerId===p.pid&&decision.until>=now){const kept=list.find(o=>o.kind===decision.kind&&o.ref===decision.ref);if(kept){kept.u+=P.commit*scale;best=Math.max(best,kept.u);}}
 const dec=Number.isFinite(p.dec)?clamp(p.dec,1,20):10,temperature=P.noise*clamp((20-dec)/10,0,1.9)*scale,band=list.filter(o=>o.u>=best-4*temperature).sort((a,b)=>b.u-a.u);
 if(band.length<2||!(temperature>0))return {choice:band[0],drawn:false};
 const weights=band.map(o=>Math.exp((o.u-best)/temperature)),total=weights.reduce((a,b)=>a+b,0);
 let roll=random()*total;// "options.choice"
 for(let i=0;i<band.length;i++){roll-=weights[i];if(roll<=0)return {choice:band[i],drawn:true};}
 return {choice:band.at(-1),drawn:true};
}
function v183OptRecord(m,p,o,P){
 const now=v183Seconds(m);
 m.attackFlow.decision={playerId:p.pid,kind:o.kind,ref:o.ref??null,target:o.target?{x:o.target.x,y:o.target.y}:null,at:now,until:now+P.cadence+.15,checkAt:now+P.turnCheck,value:o.u};
}
function v183OptExecute(m,p,o,allies,rivals,P){
 if(o.kind==='shot'){v55Shoot(p);return true;}
 if(o.kind==='pass'){v55GroundPass(p,o.q);return true;}
 if(o.kind==='space'){v150SpacePass(p,o.option);return true;}
 if(o.kind==='cross'){v55HighPass(p,o.q,{cross:true});return true;}
 if(o.kind==='high'&&v162TryHighPass(m,p,allies,rivals))return true;
 const flow=m.attackFlow,s=v150Scale(),hold=o.kind!=='carry';
 // Keep the corridor target a few metres ahead so the native carrier target follows it.
 const target=hold?{x:p.x,y:p.y}:{x:clamp(p.x+o.dir.x*8/s.x,v55Field.left+1/s.x,v55Field.right-1/s.x),y:clamp(p.y+o.dir.y*8/s.y,v55Field.top+1/s.y,v55Field.bottom-1/s.y)};
 flow.carry={playerId:p.pid,target,until:v183OptLegacyAfter(m,P.cadence+.1)};
 if(!hold&&o.ref==='goal'&&v55HasClearRun(p,rivals,p.t===0?1-p.y:p.y))m.breakawayCarrier=p;
 m.next=m.elapsed+v183ClockUnits(m,P.cadence);
 return true;
}
function v183OptTrace(m,p,o,list,drawn,range){
 const top=[...list].sort((a,b)=>b.u-a.u).slice(0,3).map(x=>({kind:x.kind,ref:x.ref??null,u:+x.u.toFixed(5)}));
 v183Trace(m,{type:'options',pid:p.pid,kind:o.kind,ref:o.ref??null,u:+o.u.toFixed(5),arrival:Number.isFinite(o.arrival)?+o.arrival.toFixed(4):null,range:+range.toFixed(1),n:list.length,drawn,top});
}
// Abilities, pace and reaction delays are fixed during one evaluation: read
// each once per person and key. The originals are restored before any action
// is executed (also on errors). No state is written.
function v183OptCached(run){
 const baseAbility=ability,basePace=v150Pace,baseDelay=v150Delay,cache=new Map();
 const memo=(base,tag)=>function(p,key){let row=cache.get(p);if(!row)cache.set(p,row=new Map());const k=key===undefined?tag:tag+key;if(row.has(k))return row.get(k);const value=base.apply(this,arguments);row.set(k,value);return value;};
 ability=memo(baseAbility,'a');v150Pace=memo(basePace,'p');v150Delay=memo(baseDelay,'d');
 try{return run();}finally{ability=baseAbility;v150Pace=basePace;v150Delay=baseDelay;}
}
function v183OptDecide(m,p,allies,rivals){
 const P=v183OptParams(m),{list,range,choice,drawn}=v183OptCached(()=>{const r=v183OptOptions(m,p,allies,rivals,P);return {...r,...v183OptChoose(m,p,r.list,P)};});
 v183OptRecord(m,p,choice,P);v183OptTrace(m,p,choice,list,drawn,range);
 return v183OptExecute(m,p,choice,allies,rivals,P);
}

// ----- Pending turn: release earlier, or shoot from the turn -----
const v183OptBaseTurn=v157ContinueTurn;
v157ContinueTurn=function(m,p,rivals){
 const turn=m.attackFlow?.pendingTurn;
 if(!turn||!v183Active(m,'options')||turn.options?.restart)return v183OptBaseTurn(m,p,rivals);
 const q=m.people.find(x=>x.pid===turn.receiverId),target=turn.kind==='space'?turn.target:q,body=v157Body(p);
 const lane=q&&(turn.kind==='high'?rivals.every(r=>v122Metres(r,target)>(r.keeper?4:2.8)):v157Lane(m,p,target,rivals,1.2));
 if(turn.playerId!==p.pid||!q||q.slideActive||v55OffsideSnapshot(p).offside.has(q)||!lane){delete m.attackFlow.pendingTurn;return false;}
 const P=v183OptParams(m),now=v183Seconds(m),decision=m.attackFlow.decision;
 // Shot from the turn: re-check the shot against the pending pass every turnCheck seconds.
 if(decision?.playerId===p.pid&&now>=decision.checkAt){
  decision.checkAt=now+P.turnCheck;
  const shot=v183OptShot(m,p,P,p);
  if(shot.xg>0){
   const w=v183OptWeights(p,P),angle=Math.abs(v157Angle(body.heading,v183OptHeading(p,v183OptGoal(p.t)))),orient=angle<=P.shotFree?1:clamp(1-(angle-P.shotFree)*P.shotTurn,.25,1),u=w.shootWeight*shot.xg*orient;
   const e=v183OptPass(m,p,q,turn.kind==='space'?turn.target:null,P,{rivals,offers:new Set()}),wait=Math.exp(-v183OptTurnTime(p,target,P,v183OptTurnRate(p))/P.turnTau),pending=wait*e.arrival*e.receiver-(1-e.arrival)*e.loss/(w.riskWeight*v183OptScoreRisk(m,p,P));
   if(u>pending+P.switchMargin*Math.max(Math.abs(pending),P.noiseFloor)){
    delete m.attackFlow.pendingTurn;
    Object.assign(decision,{kind:'shot',ref:null,target:null,at:now,until:now+P.cadence+.15,value:u});
    v183Trace(m,{type:'options',pid:p.pid,kind:'shot',ref:null,u:+u.toFixed(5),fromTurn:true,pending:+pending.toFixed(5)});
    v55Shoot(p);return true;
   }
  }
 }
 const angle=Math.atan2((target.x-p.x)*v150Scale().x,(target.y-p.y)*v150Scale().y);
 if(Math.abs(v157Angle(body.heading,angle))>P.turnRelease||Math.hypot(body.vx,body.vy)>P.turnSpeed){m.next=m.elapsed+v183ClockUnits(m,P.turnTick);return true;}
 delete m.attackFlow.pendingTurn;m.attackFlow.releaseGuard=p.pid;
 try{if(turn.kind==='high')v55HighPass(p,q,turn.options);else if(turn.kind==='space')v150SpacePass(p,{target:turn.target,runner:q});else v55GroundPass(p,q,'pass',turn.options.exempt,turn.options);}finally{delete m.attackFlow.releaseGuard;}
 return true;
};

// ----- Entry: the striker carry of v159Decide is an option of the evaluation -----
const v183OptBaseFlow=v159Decide;
v159Decide=function(m,p){
 if(!v183Active(m,'options'))return v183OptBaseFlow(m,p);
 // The first touch keeps its native preparation window.
 const receipt=m.attackFlow?.receipt;
 return receipt?.playerId===p.pid&&v152Seconds(m)<receipt.readyAt?v183OptBaseFlow(m,p):false;
};
const v183OptBaseDecide=v157Decide;
v157Decide=function(m,p,allies,rivals){
 if(!v183Active(m,'options')||!v157Active(m)||p.keeper)return v183OptBaseDecide(m,p,allies,rivals);
 if(v159Decide(m,p))return true;
 if(v157ContinueTurn(m,p,rivals))return true;
 if(v131OpenGoal(p)){v55Shoot(p);return true;}
 return v183OptDecide(m,p,allies,rivals);
};

// SI-1 is complete: new matches carry options:true (harness: packages override).
v183EnableByDefault('options');
