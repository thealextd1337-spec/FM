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
// a pass beyond the legacy queue angle (1.05 rad) costs its turn time, a stub
// shot loses value away from the heading (SI-3 includes it), and a shot can replace a pending pass turn
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
// SI-F stub bridge: a shot estimate with stub:true is the SI-F stub
// (v157ShotQuality, a quality up to 22 m). It is read at the point whose goal
// distance is range*stubRange/window on the same line and scaled by stubScale,
// so the skill window applies; a blocker between the shooter and that point
// halves it. A real estimate (SI-3, a goal probability) is used as it is;
// stubScale matches the bridge to it for average finishers at 14-22 m. Header
// values of the cross stub (until SI-7) scale by stubScale*crossConv.
// Random draws: one named draw "options.choice", only when at least two options
// lie inside the noise band. The executed actions keep their native draws.
// State: attackFlow.decision (plain data: player, option, reference, target,
// times in real seconds of v183Seconds) gives commitment and the re-check of a
// pending turn; it is saved and restored with the match. Deadlines read by
// older code (attackFlow.carry, pendingTurn) stay on v152Seconds.

v183RegisterDefaults('options',{
 cadence:.25,              // decision cadence (s, real) after carry/hold
 weightMin:.8,weightMax:1.2, // effective personality span (SI-K: .85-1.15 -> .8-1.2)
 windowBase:12.5,windowFin:.75, // shooter window (m): 12.5 + 0.75*fin (SI-K: 16 + 0.55*fin; beyond 22 m from fin 12.7)
 stubRange:22,stubScale:.6,    // SI-F shot stub bridge (see above)
 threat:.3,threatLength:16,    // possession value .3*exp(-d/16), d metres to goal
 counter:1.6,              // weight of the opponent's possession value after a loss
 recvShot:1,offer:.3,oneTwo:.03,passMin:2.5,passMax:32,
 counterOffer:.3,           // offer bonus for runs of a counter window (SI-2 pattern 'counter'); equal to offer = neutral
 turnRelease:.55,turnSpeed:2.5,turnTick:.08,turnCheck:.25,turnTau:1.5,
 shotFree:1.2,shotTurn:.5,switchMargin:.15,
 carryHorizon:1,carryMin:2.5,carryMax:6,carryShot:1, // carry and receiver shots: no discount beyond space, keep and arrival
 engage:2,carryFactor:.75,
 holdFactor:.65,crossConv:.67,crossMax:30,crossWide:8,laneOne:.5,
 spaceCount:3,spaceBase:.15,      // space-pass arrival base (calibrated on received space passes)
 noise:.15,noiseFloor:.006,commit:.08,
 scoreRisk:.15,focus:.1,direct:.25,
 close:.5,                 // share of an opponent's run that closes the space until the ball is held
 xgFalloff:9,              // carry endpoints: shot value falls e-fold every 9 m (from one estimate)
 shootInstruction:1.25,wingInstruction:1.25, // player instructions "Abschluss suchen", "Außenbahn & Flanken"
 // Cross into space (B22): box spots [lateral on the ball side, depth] in
 // metres a runner is sent to (near post, penalty spot, far post); crossSpace
 // spots are considered per runner (0 = no crosses into space). Runners within
 // crossRunnerRange of goal and crossRunnerWide of the centre, not offside;
 // the spot is never farther from goal than the runner plus crossRunnerBack.
 // crossLead: longest wait (real seconds) between the signal to the runner and
 // the kick; the option takes the wait the runner needs to make the spot
 // reachable with crossLeadSlack metres to spare (the carrier drives on toward
 // the byline meanwhile). At kickAt
 // the cross needs an arrival of at least crossKickMin, else the carrier
 // decides anew. The wait discounts the gain e-fold every crossLeadTau seconds
 // (the carrier drives on, unlike a turn on the spot); crossSpaceGain scales the
 // option value.
 crossSpace:3,crossSpots:[[4,6],[0,11],[-4,7]],crossRunnerRange:28,crossRunnerWide:14,crossRunnerBack:2,crossLead:2,crossLeadSlack:3,crossLeadTau:3,crossKickMin:.2,crossSpaceGain:1
});
const V183_OPT_KEYS=Object.freeze(Object.keys(v183RegisterDefaults('options',{})));
// Neutral values of the SI-F personality formula (role 1, mental values 10).
const V183_OPT_NEUTRAL=Object.freeze({shootWeight:.85,riskWeight:.9,dribbleWeight:.9,holdWeight:.95});

// Effective base of the shooter window (m): the stored windowBase. A switch for SI-5
// (large pitch), which wraps this function; every read of the window goes through it.
function v183OptWindowBase(m){return v183Param(m,'options.windowBase');}
function v183OptWindow(m,p){return v183OptWindowBase(m)+v183Param(m,'options.windowFin')*ability(p,'fin');}
function v183OptParams(m){const P={};for(const key of V183_OPT_KEYS)P[key]=v183Param(m,'options.'+key);P.windowBase=v183OptWindowBase(m);return P;}
function v183OptWeights(p,P){const raw=v183Personality(p),w={};for(const [key,neutral]of Object.entries(V183_OPT_NEUTRAL))w[key]=clamp(raw[key]/neutral,P.weightMin,P.weightMax);return w;}
// Real seconds into the v152Seconds deadlines read by older code (carry,
// turns), without assuming how that clock relates to the match rate. Only
// assumes that v152Seconds is linear in m.elapsed (elapsed/MATCH_SPEED today;
// elapsed/rate if SI-0 changes it): one clock unit is v152Seconds({elapsed:1}).
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
 if(est.stub!==true)return {xg:Math.max(0,est.xg||0),range,window,stub:false};
 const goal=v183OptGoal(p.t),f=clamp(P.stubRange/window,.5,1.5),virtual={x:goal.x+(from.x-goal.x)*f,y:goal.y+(from.y-goal.y)*f};
 let near=0;
 if(f<1)for(const r of m.people){if(r.t===p.t||r.keeper||r.slideActive)continue;const lane=passLaneGeometry(r,from,virtual);if(lane&&v122Metres(r,lane)<1.4)near++;}
 const quality=f===1?est.xg:v183ShotEstimate(m,p,virtual).xg;
 return {xg:Math.max(0,quality||0)*P.stubScale*(near===0?1:near===1?P.laneOne:0),range,window,stub:true};
}
// Space around a point when the new holder has the ball there after `seconds`
// (pass flight or carry horizon): the nearest outfield opponent, who closes in
// with close x his pace after his reaction; 0.25 (marked) to 1 (free). The
// same discount applies to a receiver, a carry endpoint and holding.
function v183OptSpace(point,rivals,seconds,P){let near=Infinity;for(const r of rivals){if(r.keeper||r.slideActive)continue;const run=(3+ability(r,'spd')*.14)*Math.max(0,seconds-clamp(.3-(ability(r,'pos')-1)*.01,.1,.32))*P.close;near=Math.min(near,Math.max(0,v122Metres(r,point)-run));}return clamp((near-1.2)/4,.25,1);}
// Possession value of p at point after the ball got there (pass or carry):
// position value (x posFactor) or p's shot from there (x shotFactor), both
// reduced by the space around him.
function v183OptHolder(m,p,P,point,rivals,shotFactor,seconds,posFactor=1,xg){
 const space=v183OptSpace(point,rivals,seconds,P),shot=shotFactor>0?(Number.isFinite(xg)?xg:v183OptShot(m,p,P,point).xg):0;
 return Math.max(v183OptThreat(P,point,p.t)*(.6+.4*space)*posFactor,shot*shotFactor*space);
}
// Passes under pressure: opponents near the passer as v55GroundPass counts
// them (SI-4 key defence.passPressureRadius in metres while defence is on,
// otherwise the normalised .15 of today, W4).
function v183OptPressure(m,p){const near=v183Radius(m,'defence.passPressureRadius',.15);return m.people.filter(r=>r.t!==p.t&&!r.keeper&&near(r,p)).length;}

// ----- Pass estimate (SI-1 owns v183PassEstimate) -----
// arrival: probability that the ground pass reaches q and is controlled,
// mirroring the native execution (v55GroundPass): first lane interceptor and
// its chance, passing error against the receiver's reach, first-touch failure.
// It depends on pas/tec/pos/spd and geometry only, never on personality.
// receiver: value of q's possession at the target (max of the position value
// and his shot there, both reduced by the space around him; +offer for a run,
// +counterOffer for a run of a counter window (pattern 'counter'), +oneTwo for
// a confirmed return run). loss: opponent value at the loss point.
// value = arrival*receiver - (1-arrival)*loss (objective, before risk weight).
// lane: today's open-lane test (v157Lane), returnRun as in the stub.
function v183OptPass(m,p,q,target,P,ctx,delay=0){
 // Flight seconds: clock units of v115FlightDuration through the match rate (SI-0).
 const from=m.ball,point=target||v157PassLead(m,p,q,from)||{x:q.x,y:q.y},s=v150Scale(),dir=p.t===0?-1:1,pas=ability(p,'pas');
 const rivals=ctx?.rivals||m.people.filter(r=>r.t!==p.t),duration=clamp(distance(from,point)*1.5,.32,.9),seconds=v115FlightDuration(from,point,duration,'pass')/v183Rate(m);
 const lanes=[];
 for(const r of rivals){
  if(r.keeper||r.slideActive)continue;
  const g=passLaneGeometry(r,from,point);if(!g)continue;
  const gap=v122Metres(r,g),margin=(3+ability(r,'spd')*.14)*(seconds*g.t+delay*P.close)-Math.max(0,gap-.8),weight=clamp((margin+.6)/1.2,0,1)*clamp((3.4-gap)/.8,0,1);
  if(weight>0)lanes.push({t:g.t,weight,chance:clamp(.11+ability(r,'pos')*.016+ability(r,'spd')*.004-pas*.011,.05,.55)});
 }
 lanes.sort((a,b)=>a.t-b.t);
 let intercept=0,clear=1;for(const lane of lanes){intercept+=clear*lane.weight*lane.chance;clear*=1-lane.weight;}
 // Execution error (uniform square, metres) against the receiver's reach.
 const pressure=ctx?ctx.pressure:v183OptPressure(m,p),accuracy=clamp((20-pas)*.003+pressure*.015,.005,.1),error=accuracy*s.x*clamp(v122Metres(from,point)/30,.12,1.25);
 const reach=.8+(3+ability(q,'spd')*.14)*1.2*Math.max(0,seconds-.15)*.75,root=Math.SQRT2*error;
 const reached=reach>=root?1:reach<=error?Math.PI*reach*reach/(4*error*error):Math.PI/4+(1-Math.PI/4)*(reach-error)/(root-error);
 // Opponents close in on the target during a turn and the flight.
 let crowd=0;for(const r of rivals)if(!r.keeper&&!r.slideActive&&v122Metres(r,point)-(3+ability(r,'spd')*.14)*Math.max(0,seconds+delay-.3)*P.close<2.5)crowd++;
 const tec=ability(q,'tec'),failure=clamp(.015+(20-tec)*.006+crowd*(.025+(20-tec)*.002),.015,.30),arrival=clamp((1-intercept)*reached*(1-.6*failure),0,1);
 const gain=(point.y-p.y)*dir*s.y,combo=m.attackFlow?.combination;
 const returnRun=Boolean(combo?.receiverId===p.pid&&combo.passerId===q.pid&&gain>2&&combo.confirmed);
 let receiver=v183OptHolder(m,q,P,point,rivals,P.recvShot,seconds+delay);
 const bonus=ctx?.offers?.get(q.pid);if(bonus!==undefined)receiver*=1+bonus;
 if(returnRun)receiver+=P.oneTwo;
 const loss=v183OptLoss(P,{x:(from.x+point.x)/2,y:(from.y+point.y)/2},p.t),out={seconds,arrival,value:arrival*receiver-(1-arrival)*loss,receiver,loss,intercept,returnRun,target:{x:point.x,y:point.y},gain};
 // Today's open-lane test only for outside callers (the evaluation does not use it).
 if(!ctx)out.lane=v157Lane(m,p,point,rivals);
 return out;
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
// Carry endpoints are valued like a pass target (v183OptHolder: space
// discount, shot factor carryShot), so a run into a marked area is worth no
// more than a pass there; the run itself costs the keep probability. The
// positional part is reduced by carryFactor (the defence reorganises while the
// ball is carried); approaching to shoot keeps carryShot.
// Dribbler role: the take-on of v154TryDribble (exactly one opponent 2.3-6 m
// ahead within 2.1 m sideways; 4 m forward, 3 m to either side where the lane
// is free) is offered as two further directions with a single challenge.
function v183OptCarries(m,p,P,ctx){
 const s=v150Scale(),s0=s,dir=p.t===0?-1:1,goal=v183OptGoal(p.t),gx=(goal.x-p.x)*s.x,gy=(goal.y-p.y)*s.y,gl=Math.hypot(gx,gy)||1,ux=gx/gl,uy=gy/gl;
 const step=clamp(v157Pace(m,p)*P.carryHorizon,P.carryMin,P.carryMax),dirs=[{ref:'goal',x:ux,y:uy},{ref:'straight',x:0,y:dir}];
 for(const side of [-1,1]){const c=Math.cos(.6*side),n=Math.sin(.6*side);dirs.push({ref:side<0?'left':'right',x:ux*c-uy*n,y:ux*n+uy*c});}
 const out=[],body=v157Body(p),loss=v183OptLoss(P,p,p.t),window=P.windowBase+P.windowFin*ability(p,'fin');
 // One shot estimate per decision for all endpoints: the carrier's own shot, or
 // at the endpoint toward goal when he is still outside his window; other
 // endpoints scale it by exp(-(range-range0)/xgFalloff) along the distance.
 let anchor=ctx.shotNow&&ctx.shotNow.xg>0?{xg:ctx.shotNow.xg,range:ctx.shotNow.range}:null;
 const shotAt=point=>{const range=v183OptGoalDistance(point,p.t);if(range>window)return 0;
  if(!anchor){const s=v183OptShot(m,p,P,{x:p.x+ux*step/s0.x,y:p.y+uy*step/s0.y});anchor={xg:s.xg,range:s.range};}
  return anchor.xg>0?Math.min(.95,anchor.xg*Math.exp((anchor.range-range)/P.xgFalloff)):0;};
 const push=(ref,point,d,keep)=>{
  const value=v183OptHolder(m,p,P,point,ctx.rivals,P.carryShot,P.carryHorizon,P.carryFactor,shotAt(point)),turn=Math.max(0,Math.abs(v157Angle(body.heading,Math.atan2(d.x,d.y)))-.5)/ctx.turnRate*.5;
  out.push({kind:'carry',ref,target:point,dir:{x:d.x,y:d.y},keep,gain:ctx.w.dribbleWeight*keep*value*Math.exp(-turn/P.turnTau),loss:(1-keep)*loss});
 };
 for(const d of dirs){
  const point={x:p.x+d.x*step/s.x,y:p.y+d.y*step/s.y};
  if(v183OptInside(point,s,1.4))push(d.ref,point,d,v183OptKeep(m,p,point,P.carryHorizon,P,ctx.rivals));
 }
 if(p.tacticalRole==='dribbler'){
  const near=ctx.rivals.filter(r=>!r.keeper&&v122Metres(p,r)<6),r=near[0];
  if(near.length===1&&v122Metres(p,r)>=2.3&&(r.y-p.y)*dir>0&&Math.abs(r.x-p.x)*s.x<=2.1){
   const tec=ability(p,'tec'),chance=clamp(.18+(ability(r,'tak')-tec)*.022+(ability(r,'pos')-ability(p,'spd'))*.006+(m.aggression?.[r.t]??0)*.04,.08,.55);
   for(const side of [-3,3]){
    const point={x:p.x+side/s.x,y:p.y+dir*4/s.y};
    if(!v183OptInside(point,s,1.4)||!v154DribbleLane(m,p,point))continue;
    const len=Math.hypot(side,4);push(side<0?'beat-left':'beat-right',point,{x:side/len,y:dir*4/len},1-chance);
   }
  }
 }
 const keep=v183OptKeep(m,p,p,.5,P,ctx.rivals),space=v183OptSpace(p,ctx.rivals,.5,P);
 out.push({kind:'hold',ref:null,target:{x:p.x,y:p.y},keep,gain:ctx.w.holdWeight*keep*v183OptThreat(P,p,p.t)*(.6+.4*space)*P.holdFactor,loss:(1-keep)*loss});
 return out;
}

// ----- Cross into space (B22) -----
// A floated cross to a box spot (crossSpots on the ball side) that a team-mate
// reaches during the flight; the estimate of SI-7 (detail.space with the
// runner) values the landing with his running path, the finish and the header
// at the spot. One option per runner (his best spot by gain-loss), valued like
// a cross: arrival x max(holder value at the spot, header value), delayed by
// the turn and crossLead. Needs the setplay package (space execution and
// estimate); with the package off no option is made.
function v183OptSpaceCrosses(m,p,allies,rivals,P,ctx,offside,delayed){
 const out=[];
 if(!(P.crossSpace>0)||m.flight||m.rebound||!v183Active(m,'setplay'))return out;
 const s=v150Scale(),goal=v183OptGoal(p.t),side=p.x<.5?-1:1,dir=p.t===0?1:-1,wing=hasInstruction(p,'wing')?P.wingInstruction:1;
 const spots=P.crossSpots.slice(0,Math.floor(P.crossSpace)).map(([lateral,depth])=>({x:goal.x+side*lateral/s.x,y:goal.y+dir*depth/s.y}));
 const maxLead=Math.max(0,P.crossLead),flightMin=v183Param(m,'setplay.flightMin'),speed=v183Param(m,'setplay.spaceCrossSpeed'),reaction=v183Param(m,'setplay.spaceReaction'),planning=typeof v183RunCover==='function'&&typeof v183AirPace==='function'&&typeof v183AirReach==='function';
 for(const q of allies){
  if(q.slideActive||q.keeper||offside.has(q)||v183OptGoalDistance(q,p.t)>P.crossRunnerRange||Math.abs(q.x-.5)*s.x>P.crossRunnerWide)continue;
  const limit=v183OptGoalDistance(q,p.t)+P.crossRunnerBack;let best=null;
  for(const spot of spots){
   if(v183OptGoalDistance(spot,p.t)>limit||!v183OptInside(spot,s,0))continue;
   // Wait the runner needs before the kick so the spot comes within his cover (capped by crossLead).
   let lead=0;
   if(maxLead>0&&planning){const flight=Math.max(flightMin,v122Metres(p,spot)/speed),pace=v183AirPace(m,q),needed=v122Metres(q,spot)+P.crossLeadSlack-v183RunCover(m,q,spot,flight,reaction)-v183AirReach(m,q,pace);if(needed>0)lead=Math.min(maxLead,needed/pace);}
   const c=v183CrossEstimate(m,p,spot,{runner:q,space:true,lead,offside});if(!c.eligible||!(c.arrival>0))continue;
   // The estimate may land short of the spot, where the runner can be at the landing (adapted).
   const point=c.landing&&Number.isFinite(c.landing.x)?{x:c.landing.x,y:c.landing.y}:spot;
   const raw=Math.max(0,c.headerXg||0),header=c.stub===true?raw*P.stubScale*P.crossConv:raw,seconds=Number.isFinite(c.flight)?c.flight:1;
   const receiver=Math.max(v183OptHolder(m,q,P,point,rivals,0,seconds),header);
   const o={kind:'cross',ref:q.pid,q,target:point,space:true,adapted:c.adapted===true,lead,arrival:c.arrival,header,est:{land:+(c.land||0).toFixed(3),duel:+(c.duel||0).toFixed(3),block:+(c.block||0).toFixed(3),cover:c.cover,gap:c.gap,reachable:c.reachable,flight:c.flight},gain:P.crossSpaceGain*c.arrival*receiver*v183OptFocus(m,p,point,P)*wing,loss:(1-c.arrival)*v183OptLoss(P,point,p.t)};
   delayed(o,v183OptTurnTime(p,o.target,P,ctx.turnRate));o.gain*=Math.exp(-lead/P.crossLeadTau);
   if(!best||o.gain-o.loss>best.gain-best.loss)best=o;
  }
  if(best)out.push(best);
 }
 return out;
}
// Signal before the kick (crossLead > 0): attackFlow.crossRun is written at the
// decision, the carrier keeps the ball in his heading and kicks at kickAt when
// the runner is still legal (SI-2 points the runner at the spot meanwhile).
// Returns true while this branch handles the carrier's decision.
function v183OptCrossRun(m,p,P){
 const flow=m.attackFlow,run=flow.crossRun;if(!run)return false;
 const now=v183Seconds(m);
 if(run.kicked){if(now>run.until)delete flow.crossRun;return false;}
 if(run.crosserId!==p.pid||now>run.until){delete flow.crossRun;return false;}
 if(now<run.kickAt-1e-9){m.next=Math.min(m.next,m.elapsed+v183ClockUnits(m,Math.max(P.turnTick,run.kickAt-now)));return true;}
 const q=m.people.find(x=>x.pid===run.runnerId),offside=v55OffsideSnapshot(p).offside;
 if(!q||q.slideActive||q.t!==p.t||offside.has(q)){delete flow.crossRun;v183Trace(m,{kind:'cross-run',crosser:p,runner:q||null,abort:q?'offside':'runner'});return false;}
 // The spot may have moved out of reach or into a block: re-estimate, land where the runner can be.
 const c=v183CrossEstimate(m,p,{x:run.x,y:run.y},{runner:q,space:true,offside}),point=c.landing&&Number.isFinite(c.landing.x)?c.landing:{x:run.x,y:run.y};
 if(!c.eligible||!(c.arrival>=P.crossKickMin)){delete flow.crossRun;v183Trace(m,{kind:'cross-run',crosser:p,runner:q,abort:'arrival',arrival:+(c.arrival||0).toFixed(3)});return false;}
 run.x=point.x;run.y=point.y;
 const before=p.stats.crosses||0;
 v55HighPass(p,q,{cross:true,space:{x:point.x,y:point.y}});
 // Traced after the attempt (SI-K2): kicked (also when blocked at the foot),
 // queued behind a body turn (the kick follows from v157ContinueTurn) or
 // declined by v55HighPass (no cross: a short ball becomes a ground pass).
 const kicked=(p.stats.crosses||0)>before,queued=!kicked&&flow.pendingTurn?.playerId===p.pid;
 v183Trace(m,{kind:'cross-run',crosser:p,runner:q,kick:kicked,...(queued?{queued:true}:{}),...(!kicked&&!queued?{abort:'declined'}:{}),arrival:+c.arrival.toFixed(3),adapted:c.adapted===true});
 return true;
}

// ----- Evaluation -----
function v183OptFocus(m,p,point,P){
 const focus=m.teamFocus?.[p.t]||'Variabel',wide=clamp(Math.abs(point.x-.5)*2,0,1)*2-.5;
 return 1+(focus==='Außen'?P.focus*wide:focus==='Mitte'?-P.focus*wide:0);
}
function v183OptDirect(m,p,gain,P){return m.teamDirect?.[p.t]&&gain>0?1+P.direct*Math.min(1,gain/15):1;}
// Shot quality away from the body heading (turn and shoot); only for the SI-F
// stub, a real estimate (SI-3) includes the body turn in its scatter.
function v183OptOrient(p,P){const angle=Math.abs(v157Angle(v157Body(p).heading,v183OptHeading(p,v183OptGoal(p.t))));return angle<=P.shotFree?1:clamp(1-(angle-P.shotFree)*P.shotTurn,.25,1);}
function v183OptShootGain(p,P,w,xg){return w.shootWeight*xg*(hasInstruction(p,'shoot')?P.shootInstruction:1);}
function v183OptOptions(m,p,allies,rivals,P){
 const s=v150Scale(),w=v183OptWeights(p,P),risk=w.riskWeight*v183OptScoreRisk(m,p,P),now=v152Seconds(m),flow=m.attackFlow,body=v157Body(p);
 const offside=v55OffsideSnapshot(p).offside,offers=new Map(v183Offers(m).filter(o=>o.team===p.t&&o.until>=now&&['depth','follow'].includes(o.type)).map(o=>[o.pid,o.pattern==='counter'?P.counterOffer:P.offer]));
 const ctx={P,w,risk,rivals,offers,turnRate:v183OptTurnRate(p),pressure:v183OptPressure(m,p)},list=[],range=v183OptGoalDistance(p,p.t);
 const press=1-v183OptKeep(m,p,p,.5,P,rivals),here=v183OptLoss(P,p,p.t);
 // A pending action during a turn: the chance to be dispossessed meanwhile.
 const delayed=(o,time)=>{const e=Math.exp(-time/P.turnTau);o.gain*=e;o.loss=e*o.loss+(1-e)*press*here;return o;};
 // Shot ("Abschluss suchen" raises the willingness like the old shot chance x1.5).
 const shot=v183OptShot(m,p,P,p);ctx.shotNow=shot;
 if(shot.xg>0){const orient=shot.stub?v183OptOrient(p,P):1;list.push({kind:'shot',ref:null,target:null,xg:shot.xg,orient,gain:v183OptShootGain(p,P,w,shot.xg*orient),loss:0});}
 // Ground passes.
 for(const q of allies){
  if(q.slideActive||offside.has(q))continue;
  const target=v157PassLead(m,p,q,m.ball);if(!target||!v183OptInside(target,s,0))continue;
  const metres=v122Metres(p,target);if(metres<P.passMin||metres>P.passMax)continue;
  const turn=v183OptTurnTime(p,target,P,ctx.turnRate),e=v183OptPass(m,p,q,target,P,ctx,turn),factor=v183OptFocus(m,p,target,P)*v183OptDirect(m,p,e.gain,P);
  list.push(delayed({kind:'pass',ref:q.pid,q,target,arrival:e.arrival,gain:e.arrival*e.receiver*factor,loss:(1-e.arrival)*e.loss},turn));
 }
 // Space passes into a runner's path (v150 targets, reachable runners only).
 if(!m.flight&&!m.rebound&&P.spaceCount>0){
  const pressure=rivals.filter(r=>!r.keeper&&v122Metres(r,p)<3).length;
  for(const o of v150Candidates(p,allies,rivals).slice(0,P.spaceCount)){
   const metres=v122Metres(m.ball,o.target),arrival=clamp(P.spaceBase+.6*Math.min(1,o.margin)-.004*(20-ability(p,'pas'))*metres-.05*pressure,.05,.85);
   const receiver=v183OptHolder(m,o.runner,P,o.target,rivals,P.recvShot,metres/16)*(offers.has(o.runner.pid)?1+offers.get(o.runner.pid):1),gain=(o.target.y-p.y)*(p.t===0?-1:1)*s.y;
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
   const c=v183CrossEstimate(m,p,q,{offside});if(!c.eligible||!(c.arrival>0))continue;
   // A cross is a pass in the air: the receiver holds the ball in the box
   // (holder value after a 1 s flight) or heads at goal. The SI-F cross stub
   // (stub:true) gives the header on the quality scale of v157ShotQuality:
   // stubScale as for shots, crossConv for the header stub. A real estimate
   // (SI-7) is a goal probability and is used unscaled.
   const raw=Math.max(0,c.headerXg||0),header=c.stub===true?raw*P.stubScale*P.crossConv:raw,receiver=Math.max(v183OptHolder(m,q,P,{x:q.x,y:q.y},rivals,0,1),header);
   list.push(delayed({kind:'cross',ref:q.pid,q,target:{x:q.x,y:q.y},arrival:c.arrival,gain:c.arrival*receiver*v183OptFocus(m,p,q,P)*(hasInstruction(p,'wing')?P.wingInstruction:1),loss:(1-c.arrival)*v183OptLoss(P,q,p.t)},v183OptTurnTime(p,q,P,ctx.turnRate)));
  }
  list.push(...v183OptSpaceCrosses(m,p,allies,rivals,P,ctx,offside,delayed));
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
 // Commitment: the previous target keeps a bonus; after a carry only its
 // direction does, against the other directions (no carry stickiness); holding
 // gets none.
 if(decision?.playerId===p.pid&&decision.until>=now){const kept=list.find(o=>o.kind===decision.kind&&o.ref===decision.ref);if(kept&&kept.kind!=='hold'){const bonus=P.commit*scale;if(kept.kind==='carry'){for(const o of list)if(o.kind!=='carry')o.u+=bonus;}kept.u+=bonus;best=-Infinity;for(const o of list)best=Math.max(best,o.u);}}
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
// Returns null, or 'high' when a chosen high ball is not available any more
// (v162TryHighPass declines) and the carrier holds instead.
function v183OptExecute(m,p,o,allies,rivals,P){
 if(o.kind==='shot'){v55Shoot(p);return null;}
 if(o.kind==='pass'){v55GroundPass(p,o.q);return null;}
 if(o.kind==='space'){v150SpacePass(p,o.option);return null;}
 if(o.kind==='cross'&&o.space){
  const now=v183Seconds(m),lead=Math.max(0,Number.isFinite(o.lead)?o.lead:P.crossLead),s=v150Scale();
  m.attackFlow.crossRun={crosserId:p.pid,runnerId:o.q.pid,x:o.target.x,y:o.target.y,at:now,kickAt:now+lead,until:now+lead+2.5,kicked:false};
  if(!(lead>0)){v55HighPass(p,o.q,{cross:true,space:{x:o.target.x,y:o.target.y}});return null;}
  // Signal first: the carrier drives on toward the byline until kickAt (v183OptCrossRun kicks).
  const dir=p.t===0?-1:1,target={x:p.x,y:clamp(p.y+dir*4/s.y,v55Field.top+1.5/s.y,v55Field.bottom-1.5/s.y)};
  m.attackFlow.carry={playerId:p.pid,target,until:v183OptLegacyAfter(m,lead+.1)};m.next=m.elapsed+v183ClockUnits(m,lead);return null;
 }
 if(o.kind==='cross'){v55HighPass(p,o.q,{cross:true});return null;}
 if(o.kind==='high'&&v162TryHighPass(m,p,allies,rivals))return null;
 const flow=m.attackFlow,s=v150Scale(),hold=o.kind!=='carry';
 // Keep the corridor target a few metres ahead so the native carrier target follows it.
 const target=hold?{x:p.x,y:p.y}:{x:clamp(p.x+o.dir.x*8/s.x,v55Field.left+1/s.x,v55Field.right-1/s.x),y:clamp(p.y+o.dir.y*8/s.y,v55Field.top+1/s.y,v55Field.bottom-1/s.y)};
 flow.carry={playerId:p.pid,target,until:v183OptLegacyAfter(m,P.cadence+.1)};
 if(!hold&&o.ref==='goal'&&v55HasClearRun(p,rivals,p.t===0?1-p.y:p.y))m.breakawayCarrier=p;
 m.next=m.elapsed+v183ClockUnits(m,P.cadence);
 return o.kind==='high'?'high':null;
}
function v183OptTrace(m,p,o,list,drawn,range,fallback){
 const top=[...list].sort((a,b)=>b.u-a.u).slice(0,3).map(x=>({kind:x.kind,ref:x.ref??null,u:+x.u.toFixed(5)}));
 v183Trace(m,{type:'options',pid:p.pid,kind:o.kind,ref:o.ref??null,u:+o.u.toFixed(5),arrival:Number.isFinite(o.arrival)?+o.arrival.toFixed(4):null,range:+range.toFixed(1),n:list.length,window:+v183OptWindow(m,p).toFixed(1),drawn,top,...(o.space?{space:true,adapted:o.adapted===true,lead:+(o.lead||0).toFixed(2),header:+(o.header||0).toFixed(4),est:o.est}:{}),...(fallback?{fallback,executed:'hold'}:{})});
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
 v183OptRecord(m,p,choice,P);
 const fallback=v183OptExecute(m,p,choice,allies,rivals,P);
 if(fallback)m.attackFlow.decision.kind='hold';
 v183OptTrace(m,p,choice,list,drawn,range,fallback);
 return true;
}

// ----- Pending turn: release earlier, or shoot from the turn -----
const v183OptBaseTurn=v157ContinueTurn;
v157ContinueTurn=function(m,p,rivals){
 const turn=m.attackFlow?.pendingTurn;
 if(!turn||!v183Active(m,'options')||turn.options?.restart)return v183OptBaseTurn(m,p,rivals);
 const q=m.people.find(x=>x.pid===turn.receiverId),target=turn.kind==='space'?turn.target:q,body=v157Body(p);
 const lane=q&&(turn.kind==='high'?Boolean(turn.options?.space)||rivals.every(r=>v122Metres(r,target)>(r.keeper?4:2.8)):v157Lane(m,p,target,rivals,1.2));
 if(turn.playerId!==p.pid||!q||q.slideActive||v55OffsideSnapshot(p).offside.has(q)||!lane){delete m.attackFlow.pendingTurn;return false;}
 const P=v183OptParams(m),now=v183Seconds(m),decision=m.attackFlow.decision;
 // Shot from the turn: re-check the shot against the pending pass every turnCheck seconds.
 if(decision?.playerId===p.pid&&now>=decision.checkAt){
  decision.checkAt=now+P.turnCheck;
  const shot=v183OptShot(m,p,P,p);
  if(shot.xg>0){
   const w=v183OptWeights(p,P),u=v183OptShootGain(p,P,w,shot.xg*(shot.stub?v183OptOrient(p,P):1));
   const left=v183OptTurnTime(p,target,P,v183OptTurnRate(p)),e=v183OptPass(m,p,q,turn.kind==='space'?turn.target:null,P,{rivals,offers:new Map(),pressure:v183OptPressure(m,p)},left),wait=Math.exp(-left/P.turnTau),pending=wait*e.arrival*e.receiver-(1-e.arrival)*e.loss/(w.riskWeight*v183OptScoreRisk(m,p,P));
   if(u>pending+P.switchMargin*Math.max(Math.abs(pending),P.noiseFloor)){
    delete m.attackFlow.pendingTurn;
    Object.assign(decision,{kind:'shot',ref:null,target:null,at:now,until:now+P.cadence+.15,value:u});
    v183Trace(m,{type:'options',pid:p.pid,kind:'shot',ref:null,u:+u.toFixed(5),window:+v183OptWindow(m,p).toFixed(1),fromTurn:true,pending:+pending.toFixed(5)});
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
 if(m.attackFlow.crossRun&&v183OptCrossRun(m,p,v183OptParams(m)))return true;
 return v183OptDecide(m,p,allies,rivals);
};

// SI-1 is complete: new matches carry options:true (harness: packages override).
v183EnableByDefault('options');
