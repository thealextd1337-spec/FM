'use strict';

// Player intelligence 183, package SI-7: crosses, corners and headers.
// New logic only for v183Active(m,'setplay'); every wrapper below calls the
// previous function unchanged for matches without the switch, so unmarked and
// 182 matches (and marked matches with the package off) stay byte-identical.
//
// Wrapped functions (owner SI-7, plan 8.3): v55HighPass (cross execution and
// error, pitch-v55.js:313-340), v122PlanAir and v122ResolveAir (air duel,
// :367-400; the clearing branch calls v183Clearance of SI-4), v131CornerFormation
// (set-pieces-v50.js:89-101), v182FreeKickPlan and v50TakeFreeKick (free-kick
// variants, :283-290; the direct shot itself stays with v55Shoot/SI-3),
// v50BestTaker (free-kick taker: the best shooter inside his range). Provided
// interfaces: v183CrossEstimate (used by SI-1/SI-2), v183AirFinish (header or
// volley after a won air duel, decided with v183ShotEstimate of SI-3).
//
// Reach model (H3): a player contests a high ball when the landing point lies
// within his reach: standing reach from air ability and body height plus a
// running-jump share from his approach speed, instead of 0.65 m. Contenders of
// both teams run to the landing point during the flight; the duel weighs air,
// positioning, the remaining share of reach, approach speed and height.
// Timing is planned in real seconds: waits through v183ClockUnits/v183Seconds,
// fly() durations in the legacy measure (seconds x MATCH_SPEED) that the SI-0
// flight rule (v115FlightDuration) converts to the match rate.
//
// Random draws of the active path (named, in order of occurrence):
//   setplay.landX, setplay.landY, setplay.landVariant  cross/corner landing error
//     (corners keep the B10 model v182CornerLanding with these three draws)
//   setplay.block, setplay.blockDirection             cross blocked by a close rival
//   setplay.duel                                      contested air duel
//   setplay.clear, setplay.clearLateral               defender clears (lateral draw
//     handed to v183Clearance, which then draws nothing itself)
//   setplay.airFinish                                 header/volley decision
//   setplay.layOff, setplay.control                   lay-off pass, ball control
//   setplay.cornerVariant                             corner variant
//   setplay.freeKickDirect                            direct free kick (shooter only,
//     only without the finish package; with it v183DirectFreeKick decides at execution)
// Plain state: setPiece.plan {direct,targetPid,kind} (saved with the set piece),
// setPiece.cornerBackPid, attackFlow.setplay.secondBall (H8 trigger for SI-2).
// The aerial plan is transient per flight (no snapshot during a flight).

v183RegisterDefaults('setplay',{
 // Reach in metres: standing reach at air 10 and 178 cm, per air point, per cm of
 // body height, per m/s of approach speed (running jump) and its cap.
 reachBase:.9,reachAir:.05,reachHeight:.01,reachRun:.12,reachRunMax:.5,
 // Flight planning: reaction time (s) and its pos bonus, approach pace factor on
 // the base pace while the ball is in the air, contenders per team.
 reaction:.32,reactionPos:.011,approachPace:1.45,contenders:2,
 // Duel: weights of air, pos, remaining reach share, approach speed (m/s) and
 // body height (cm); bounds of the attacker's chance.
 duelAir:.035,duelPos:.008,duelDistance:.16,duelRun:.03,duelHeight:.004,duelMin:.12,duelMax:.88,
 // Defender's header clearance instead of control: base, own box, per rival
 // within 2 m, per air-tec point; bounds.
 clearBase:.5,clearBox:.3,clearPressure:.14,clearAirTec:.012,clearMin:.25,clearMax:.95,
 // Header/volley finish: ranges (m), base chance, per metre closer, marked and
 // pressure penalties, weight of the shot estimate (SI-3 xg is a goal
 // probability, headers from 8-11 m rate about .02-.08), bounds before skill scaling.
 finishRange:12,volleyRange:14,finishBase:.6,finishDistance:.035,finishMarked:.15,finishPressure:.05,finishXg:2,finishMin:.1,finishMax:.95,
 // Lay-off (header pass) after a won header without finish; control of the won
 // ball: base and penalty per reach share.
 layOffBase:.12,layOffPas:.014,layOffMin:.15,layOffMax:.64,controlBase:.25,controlDistance:.25,
 // Cross execution error in metres (B10 pattern): base spread, per missing skill
 // point, per pressing rival; share of large errors (over- or under-hit).
 crossSpread:.9,crossSpreadSkill:.2,crossSpreadPressure:.5,crossLarge:.03,crossLargeSkill:.008,crossLargePressure:.02,crossLargeMax:.2,
 // Flight speed of crosses and corners (m/s) and the minimum real flight time.
 crossSpeed:20,cornerSpeed:16,flightMin:.7,
 // Pressure radius on the crosser (m) for the cross error and the estimates;
 // cornerPressureRadius keeps the B10 corner error model at its legacy input
 // (normalised .15 is about 7.3 m across and 11 m along the pitch, so 9 m;
 // joint SI-K value with SI-4). Cross block by a close rival: radius (m), chance
 // base, per tak point, bound, share that goes out for a corner when the block
 // happens within blockCornerDepth metres of the goal line.
 pressureRadius:3,cornerPressureRadius:9,blockRadius:1.8,blockBase:.12,blockTak:.012,blockMax:.4,blockCorner:.45,blockCornerDepth:20,
 // Corner formation: depth of the back-space player (m).
 cornerBack:17,
 // Free kick without the finish package: direct only by the best shooter within
 // range (m) + per fin point and a free angle; chance base + per fin point above
 // 10. With the finish package the SI-3 window finish.fkRangeBase/fkRangeFin and
 // v183DirectFreeKick decide instead. A cross variant needs this many team-mates
 // near the goal.
 freeKickRange:14,freeKickRangeFin:.6,freeKickDirectBase:.35,freeKickDirectFin:.04,freeKickCrossAllies:2,
 // Real seconds a controlled high ball settles before the next action.
 settle:.7,
 // Cross into space (B22): a floated cross to a box spot that a runner reaches
 // during the flight. spaceCrossSpeed: flight speed (m/s, slower than a driven
 // cross so the runner arrives; series V5); spaceReaction: reaction of the signalled runner
 // (s; he knows the ball is coming); spaceSlackMax: spare running distance that
 // widens the landing reach (m, cap); spaceLandGrid: samples per axis of the
 // error square for the landing share.
 spaceCrossSpeed:14,spaceReaction:.1,spaceSlackMax:2.5,spaceLandGrid:9,
 // Keeper during a high ball of the opponents (SI-K2): after reading the flight
 // (keeperRead s, minus keeperReadGk per gk point above 10) he steps onto the line
 // from the landing point to the goal centre, keeperStand m off his line plus
 // keeperStandDepth per metre the landing point lies inside 16 m (at most
 // keeperStandMax); keeperShift is the share of that move (0 = previous target).
 // Only for landing points within keeperShiftRange m of the goal.
 keeperShift:1,keeperRead:.25,keeperReadGk:.01,keeperStand:1.2,keeperStandDepth:.06,keeperStandMax:2,keeperShiftRange:20
});

const v183SetplayOn=m=>typeof v183Active==='function'&&v183Active(m,'setplay');
const v183SP=(m,key)=>v183Param(m,'setplay.'+key);
const v183Height=p=>Number.isFinite(p?.heightCm)?p.heightCm:178;
// Approach speed (m/s) of the player's body toward a point; 0 without a body.
function v183AirRun(p,point){
 const body=p.offenseMotion;if(!body)return 0;
 const s=v160PitchScale(),dx=(point.x-p.x)*s.x,dy=(point.y-p.y)*s.y,d=Math.hypot(dx,dy),vx=body.vx||0,vy=body.vy||0;
 return d<.01?Math.hypot(vx,vy):Math.max(0,(vx*dx+vy*dy)/d);
}
// Reach of an air duel in metres (never below today's 0.65 m).
function v183AirReach(m,p,run=0){
 return Math.max(.65,v183SP(m,'reachBase')+(ability(p,'air')-10)*v183SP(m,'reachAir')+(v183Height(p)-178)*v183SP(m,'reachHeight')+Math.min(v183SP(m,'reachRunMax'),Math.max(0,run)*v183SP(m,'reachRun')));
}
function v183GoalFrame(m,t,point){
 const s=v160PitchScale(m),goal={x:.5,y:t===0?v55Field.top:v55Field.bottom},depth=Math.abs(goal.y-point.y)*s.y,lateral=Math.abs(goal.x-point.x)*s.x;
 return {depth,lateral,dist:Math.hypot(depth,lateral)};
}
// Planning pace of a runner toward a high ball (m/s): base pace x approachPace,
// as v122PlanAir assumes it.
function v183AirPace(m,p){return (3+ability(p,'spd')*.14)*v183SP(m,'approachPace');}
// Metres a player covers toward `point` within `seconds` after `reaction`: from
// his current approach speed, with the native acceleration of v157Move
// ((6.2+0.08*spd)*1.4 per mass unit) up to the planning pace. No state is read
// beyond the body; used by the space-cross estimate (B22).
function v183RunCover(m,p,point,seconds,reaction){
 const body=p.offenseMotion||(typeof v157InitialBody==='function'?v157InitialBody(p):null),mass=(body&&body.massKg||74)/74;
 const v0=Math.max(0,v183AirRun(p,point)),vmax=v183AirPace(m,p),a=(6.2+ability(p,'spd')*.08)*1.4/mass,t=Math.max(0,seconds-reaction);
 if(v0>=vmax)return vmax*t;
 const ta=Math.min(t,(vmax-v0)/a);return v0*ta+.5*a*ta*ta+vmax*(t-ta);
}

// ----- Cross execution (wraps v55HighPass) -----
// Skill-dependent landing error for open-play crosses and high balls, following
// the B10 corner model: uniform spread from passing/technique and pressure, a
// small share of large errors (over-hit beyond the target, possibly out, or an
// under-hit that drops short). Corners keep v182CornerLanding unchanged.
function v183CrossLanding(m,passer,from,intended,land,[drawX,drawY,variant],pressure){
 const P=key=>v183SP(m,key),s=v160PitchScale(m),skill=ability(passer,'pas')*.6+ability(passer,'tec')*.4,spread=P('crossSpread')+(20-skill)*P('crossSpreadSkill')+pressure*P('crossSpreadPressure'),large=clamp(P('crossLarge')+(20-skill)*P('crossLargeSkill')+pressure*P('crossLargePressure'),P('crossLarge'),P('crossLargeMax'));
 let x=intended.x+(drawX-.5)*2*spread/s.x,y=intended.y+(drawY-.5)*2*spread/s.y,free=false;
 if(variant<large){
  const share=variant/large,dx=(intended.x-from.x)*s.x,dy=(intended.y-from.y)*s.y,length=Math.hypot(dx,dy)||1;
  if(share<.5){const extra=(4+share*16)*(1+(20-skill)*.06);x=intended.x+dx/length*extra/s.x;y=intended.y+dy/length*extra/s.y;free=x<v55Field.left||x>v55Field.right||y<v55Field.top||y>v55Field.bottom;}
  else{const reach=.4+(share-.5)*.8;x=from.x+(intended.x-from.x)*reach;y=from.y+(intended.y-from.y)*reach;}
 }
 if(!free){x=clamp(x,v55Field.left+1/s.x,v55Field.right-1/s.x);y=clamp(y,v55Field.top+1/s.y,v55Field.bottom-1/s.y);}
 land.x=x;land.y=y;
}
// The closest rival in front of the crosser (within blockRadius, on the side of
// the cross) who can get a leg to the ball.
function v183CrossBlocker(m,passer,land){
 const s=v160PitchScale(m),dx=(land.x-passer.x)*s.x,dy=(land.y-passer.y)*s.y,d=Math.hypot(dx,dy)||1,radius=v183SP(m,'blockRadius');
 return m.people.filter(q=>q.t!==passer.t&&!q.keeper&&!q.slideActive).map(q=>{const rx=(q.x-passer.x)*s.x,ry=(q.y-passer.y)*s.y,gap=Math.hypot(rx,ry);return {q,gap,along:(rx*dx+ry*dy)/d};}).filter(i=>i.gap<=radius&&i.along>=i.gap*.45).sort((a,b)=>a.gap-b.gap||a.q.n-b.q.n)[0]?.q||null;
}
function v183BlockChance(m,blocker){return clamp(v183SP(m,'blockBase')+ability(blocker,'tak')*v183SP(m,'blockTak'),0,v183SP(m,'blockMax'));}
// A blocked cross deflects 1.2 m along its lane: with blockCorner share toward
// the goal line (corner) within blockCornerDepth, otherwise a loose ball nearby (H6).
function v183BlockCross(m,passer,blocker,from,land){
 const P=key=>v183SP(m,key),s=v160PitchScale(m),dir=random(); // setplay.blockDirection
 const dx=(land.x-from.x)*s.x,dy=(land.y-from.y)*s.y,len=Math.hypot(dx,dy)||1,point={x:from.x+dx/len*1.2/s.x,y:from.y+dy/len*1.2/s.y};
 passer.stats.passLost++;blocker.stats.interceptions++;m.lastTouch=blocker.t;m.lastPass=null;m.ball={...point};m.owner=blocker;
 const goalLine=passer.t===0?v55Field.top:v55Field.bottom,toLine=Math.abs(point.y-goalLine)*s.y,side=point.x<.5?-1:1,cornerOut=dir<P('blockCorner')&&toLine<=P('blockCornerDepth');
 // Out for a corner only beside the goal: the lateral distance stays at least 5 m.
 const target=cornerOut?{x:clamp(.5+side*Math.max(5,Math.abs(point.x-.5)*s.x-1)/s.x,v55Field.left+.3/s.x,v55Field.right-.3/s.x),y:goalLine}:{x:clamp(point.x+(dir-.5)*8/s.x,v55Field.left+.5/s.x,v55Field.right-.5/s.x),y:clamp(point.y+(passer.t===0?-1:1)*(1+dir*5)/s.y,v55Field.top+.5/s.y,v55Field.bottom-.5/s.y)};
 note(`${blocker.name} blockt die Flanke von ${passer.name}.`,'duel');
 v183Trace(m,{kind:'cross-block',passer,blocker,corner:cornerOut});
 // The deflection flies without a release, like v50Deflect after a shot block.
 const previous=v102Release;v102Release=null;
 try{fly(target,Math.max(.25,v122Metres(point,target)/14)*MATCH_SPEED,()=>{if(cornerOut){v50Corner(passer.t,target.x,`Block von ${blocker.name}`);return;}v50LooseBall(target,`Der Ball liegt nach dem Block von ${blocker.name} frei.`);});}
 finally{v102Release=previous;}
}
// The outer wrappers of v55HighPass (pitch-v56, world-pitch-actions-v99,
// pitch-motion-v102) are reproduced around the replacement body: v56 acts only
// without the world engine, v99 marks a keeper's kick from the hands as
// goal-kick release, v102 scopes the release (flight meta kind cross/highPass,
// corner contact at the ball) so poses, flight height and the ledger kind stay.
const v183BaseHighPass=v55HighPass;
v55HighPass=function(passer,receiver,options={}){
 const m=match;if(!v183SetplayOn(m))return v183BaseHighPass.apply(this,arguments);
 const {cross=false,corner=false}=options,previous=v99Release,kick=m.attackFlow?.keeperHoldRevision===182&&v99Actions.get(m)?.kicks.get(passer.pid);
 if(kick?.phase==='waiting'&&kick.holdPoint)v99Release={kind:'goalKick',keeper:passer};
 try{return v102Scoped(passer,cross?'cross':'highPass',()=>{if(v102Release&&corner)v102Release.contact={...m.ball};return v183HighPass(m,passer,receiver,options);});}
 finally{v99Release=previous;}
};
// options.restart (free-kick cross): the queued turn must be kicked even with a
// rival near the taker or a doubtful receiver (v157ContinueTurn), as for the
// ground pass of a free kick. Corners keep the legacy pressure radius of the
// B10 error model (cornerPressureRadius); crosses use pressureRadius.
// options.space {x,y} (B22, cross into space): the ball is aimed at that point
// instead of the receiver, who runs there during the flight (floated at
// spaceCrossSpeed). The offside snapshot is taken at the kick as for every
// high ball; the runner may enter the box only after it. The plain record
// attackFlow.crossRun {crosserId,runnerId,x,y,at,kickAt,until,kicked} carries
// the signal (written by SI-1 before the kick, or here) for SI-2's runner and
// the aerial plan, and is removed when the ball lands.
let v183SpaceRunner=null;
function v183HighPass(m,passer,receiver,{cross=false,exempt=false,corner=false,restart=false,space=null}){
 const P=key=>v183SP(m,key),point=space&&Number.isFinite(space.x)&&Number.isFinite(space.y)?{x:space.x,y:space.y}:null;
 if(typeof v157QueueTurn==='function'&&v157QueueTurn(m,passer,point?{pid:receiver.pid,x:point.x,y:point.y}:receiver,'high',{cross,exempt,corner,restart,...(point?{space:point}:{})}))return;
 if(typeof v155AttemptPass==='function')v155AttemptPass(m,passer,receiver);
 if(v122Metres(passer,point||receiver)<7)return v55GroundPass(passer,receiver,'pass',exempt);
 const snapshot=v55OffsideSnapshot(passer,exempt),from={x:m.ball.x,y:m.ball.y},within=v183Radius(m,corner?'setplay.cornerPressureRadius':'setplay.pressureRadius',.15),pressure=m.people.filter(q=>q.t!==passer.t&&!q.keeper&&within(q,passer)).length;
 const intended=point||{x:receiver.x,y:receiver.y},drawX=random(),drawY=random(),variant=random(),land={...intended}; // setplay.landX, setplay.landY, setplay.landVariant
 if(corner&&m.attackFlow?.setPieceRevision===182)v182CornerLanding(passer,from,intended,land,[drawX,drawY,variant],pressure);else v183CrossLanding(m,passer,from,intended,land,[drawX,drawY,variant],pressure);
 passer.stats.passes++;passer.stats.highPasses++;if(cross)passer.stats.crosses++;m.lastTouch=passer.t;
 const forward=passer.t===0?passer.y-land.y:land.y-passer.y;if(forward>.12)passer.stats.progressive++;
 const blocker=cross&&!corner?v183CrossBlocker(m,passer,land):null;
 if(blocker&&random()<v183BlockChance(m,blocker)){if(point&&m.attackFlow.crossRun?.crosserId===passer.pid)delete m.attackFlow.crossRun;return v183BlockCross(m,passer,blocker,from,land);} // setplay.block
 // fly() takes its duration in the legacy measure (seconds x MATCH_SPEED); the
 // SI-0 flight rule converts it to the match rate so the real time stays.
 const exit=v55Exit(from,land),end=exit?v55BoundaryStop(exit):land,seconds=Math.max(P('flightMin'),v122Metres(from,end)/(corner?P('cornerSpeed'):point?P('spaceCrossSpeed'):P('crossSpeed'))),duration=seconds*MATCH_SPEED;
 const label=corner?'Ecke':cross?'Flanke':'hohen Ball';note(point?`${passer.name} flankt in den Lauf von ${receiver.name}.`:`${passer.name} spielt ${corner?'die Ecke':cross?'eine Flanke':'einen hohen Ball'} auf ${receiver.name}.`,corner?'restart':'shot');
 for(const player of m.people)player.interceptTarget=null;
 const now=v183Seconds(m);
 if(point){const run=m.attackFlow.crossRun;if(run&&run.runnerId===receiver.pid&&run.crosserId===passer.pid){run.kicked=true;run.kickAt=now;run.until=now+seconds+.5;}else m.attackFlow.crossRun={crosserId:passer.pid,runnerId:receiver.pid,x:point.x,y:point.y,at:now,kickAt:now,until:now+seconds+.5,kicked:true};}
 fly(end,duration,()=>{for(const player of m.people)player.interceptTarget=null;if(point&&m.attackFlow.crossRun?.runnerId===receiver.pid)delete m.attackFlow.crossRun;if(cross&&v122Metres(intended,land)>4){const delta=passer.t===0?land.y-intended.y:intended.y-land.y;note(`Die Flanke von ${passer.name} gerät ${delta>.055?'zu kurz':'zu weit'}.`,'duel')}if(exit){passer.stats.passLost++;v55Out(exit,passer.t,`${label} von ${passer.name} gerät ins Aus.`);return}v55ResolveAir({passer,receiver,end,snapshot,cross})});
 m.flight.aerial=true;
 if(!exit){v183SpaceRunner=point?receiver:null;try{v122PlanAir(m.flight,passer,end);}finally{v183SpaceRunner=null;}}
 if(cross)v183LedgerSource(m.flight,'cross',m);
 // H8 trigger: SI-2 may read the latest cross/corner for its back-space runner.
 if(cross||corner)(m.attackFlow.setplay??={}).secondBall={team:passer.t,at:now,x:end.x,y:end.y,kind:corner?'corner':'cross'};
 v183Trace(m,{kind:corner?'corner':cross?'cross':'high-pass',passer,receiver,pressure,error:+v122Metres(intended,land).toFixed(2),out:Boolean(exit),seconds:+seconds.toFixed(2),...(point?{space:true,runner:receiver.pid,gap:+v122Metres(receiver,intended).toFixed(1)}:{})});
}

// ----- Aerial plan during the flight (wraps v122PlanAir) -----
// Candidates can arrive within their reach before the ball lands (reaction
// time minus a pos bonus, base pace times approachPace). Up to `contenders`
// per team run to a point just short of the landing spot; without a candidate
// the quickest runner of that team still chases the ball.
const v183BasePlanAir=v122PlanAir;
v122PlanAir=function(flight,passer,end){
 const m=match;if(!v183SetplayOn(m))return v183BasePlanAir.apply(this,arguments);
 const P=key=>v183SP(m,key),seconds=flight.duration/v183Rate(m),contenders=[],pursuers=[],limit=Math.max(1,Math.round(P('contenders')));
 const reach=p=>v183AirReach(m,p,v183AirRun(p,end)),cost=p=>v122Metres(p,end)/reach(p)-ability(p,'pos')*.03-ability(p,'air')*.02;
 // Cross into space (B22): the signalled runner is the first contender of his
 // team; he read the cross before the kick and runs to the spot in any case.
 const runner=v183SpaceRunner&&v183SpaceRunner.t===passer.t&&!v183SpaceRunner.keeper&&!v183SpaceRunner.slideActive&&v183SpaceRunner!==passer?v183SpaceRunner:null;
 for(const team of [passer.t,1-passer.t]){
  const runners=m.people.filter(p=>p.t===team&&!p.keeper&&p!==passer&&!p.slideActive);
  const candidates=runners.filter(p=>v122Metres(p,end)<=Math.max(0,seconds-(P('reaction')-ability(p,'pos')*P('reactionPos')))*(3+ability(p,'spd')*.14)*P('approachPace')+reach(p)).sort((a,b)=>cost(a)-cost(b)||a.n-b.n);
  const chosen=runner&&team===passer.t?[runner,...candidates.filter(p=>p!==runner).slice(0,Math.max(0,limit-1))]:candidates.slice(0,limit);
  if(!chosen.length){const p=[...runners].sort((a,b)=>v122Metres(a,end)/(3+ability(a,'spd')*.14)-ability(a,'pos')*.01-(v122Metres(b,end)/(3+ability(b,'spd')*.14)-ability(b,'pos')*.01)||a.n-b.n)[0];if(p)chosen.push(p);}
  for(const p of chosen){const gap=v122Metres(p,end),offset=Math.min(.35,gap),amount=gap?offset/gap:0;p.interceptTarget={x:end.x+(p.x-end.x)*amount,y:end.y+(p.y-end.y)*amount};(candidates.includes(p)||p===runner?contenders:pursuers).push(p);}
 }
 v122AerialPlans.set(flight,{contenders,pursuers,end:{...end}});
 if(typeof v102Flights!=='undefined'){const meta=v102Flights.get(flight);if(meta)meta.endHeight=2.65;}
};

// ----- Keeper during the flight of a high ball (wraps v115KeeperTarget, SI-K2) -----
// Without this the keeper keeps the formation target of game.js (30 % of the
// ball's lateral offset on his base line) while a cross, corner or high ball of
// the opponents flies, so a header or volley at the landing point meets a goal
// whose keeper stands about 3 m off the shot line. After reading the flight he
// now steps onto the line from the landing point (the public flight target of
// the aerial plan, as the contenders run to it) to the goal centre. He moves at
// his native pace; whether he arrives depends on the flight time and his speed.
// Transient: read from the flight and its aerial plan, no state, no draw.
function v183KeeperFlightTarget(m,person){
 const flight=m.flight;
 if(!person.keeper||!flight?.aerial||flight.team===person.t||m.kickoff||m.setPiece||m.throwIn||m.goalPause>0||m.postBanner||m.halftimePause||m.finished)return null;
 const P=key=>v183SP(m,key),shift=clamp(P('keeperShift'),0,1),plan=v122AerialPlans.get(flight);
 if(!(shift>0)||!plan?.end)return null;
 const s=v160PitchScale(m),goalY=person.t===0?v55Field.bottom:v55Field.top,end=plan.end,depth=Math.abs(end.y-goalY)*s.y,lateral=(end.x-.5)*s.x;
 if(Math.hypot(depth,lateral)>P('keeperShiftRange'))return null;
 const seconds=flight.progress*flight.duration/v183Rate(m),read=Math.max(0,P('keeperRead')-P('keeperReadGk')*(ability(person,'gk')-10));
 if(seconds<read)return null;
 const stand=Math.min(P('keeperStandMax'),P('keeperStand')+Math.max(0,16-depth)*P('keeperStandDepth')),along=depth>stand?stand/depth:1,half=(m.geometry?.goalWidth||44*.2/(v55Field.right-v55Field.left))/2;
 const x=.5+clamp(lateral*along,-half,half)/s.x,y=goalY+(person.t===0?-1:1)*Math.min(stand,depth)/s.y;
 return {x:person.tx+(x-person.tx)*shift,y:person.ty+(y-person.ty)*shift};
}
const v183BaseKeeperTarget=v115KeeperTarget;
v115KeeperTarget=function(current,person){
 const value=v183BaseKeeperTarget.apply(this,arguments);
 if(!v183SetplayOn(current))return value;
 const target=v183KeeperFlightTarget(current,person);
 if(target){person.tx=target.x;person.ty=target.y;}
 return value;
};

// ----- Air duel at landing (wraps v122ResolveAir) -----
const v183BaseResolveAir=v122ResolveAir;
v122ResolveAir=function({passer,end,snapshot,cross}){
 const m=match;if(!v183SetplayOn(m))return v183BaseResolveAir.apply(this,arguments);
 const P=key=>v183SP(m,key);
 const info=p=>{const run=v183AirRun(p,end),reach=v183AirReach(m,p,run),gap=v122Metres(p,end);return {p,run,reach,gap,share:gap/reach};};
 const eligible=m.people.filter(p=>!p.keeper&&p!==passer&&!p.slideActive).map(info).filter(i=>i.share<=1);
 const cost=i=>i.share-ability(i.p,'pos')*.02-ability(i.p,'air')*.015;
 const best=team=>eligible.filter(i=>i.p.t===team).sort((a,b)=>cost(a)-cost(b)||a.p.n-b.p.n)[0]||null;
 const A=best(passer.t),D=best(1-passer.t);
 if(!A&&!D){passer.stats.passLost++;v183Trace(m,{kind:'air',result:'unreached',cross,x:+end.x.toFixed(4),y:+end.y.toFixed(4)});v50LooseBall(end,`Der hohe Ball von ${passer.name} springt frei auf.`);return;}
 if(A&&snapshot.offside.has(A.p)){v55WhistleOffside(snapshot,A.p);return;}
 let W=A||D,chance=null;
 if(A&&D){
  chance=clamp(.5+(ability(A.p,'air')-ability(D.p,'air'))*P('duelAir')+(ability(A.p,'pos')-ability(D.p,'pos'))*P('duelPos')+(D.share-A.share)*P('duelDistance')+(A.run-D.run)*P('duelRun')+(v183Height(A.p)-v183Height(D.p))*P('duelHeight'),P('duelMin'),P('duelMax'));
  W=random()<chance?A:D; // setplay.duel
  if(typeof v158Contact==='function')v158Contact(m,A.p,D.p);
  for(const i of [A,D]){i.p.stats.aerialDuels++;i.p.stats.duels++;}W.p.stats.aerialWon++;W.p.stats.duelsWon++;
 }
 const winner=W.p;
 v102AirContact(winner,end);m.lastTouch=winner.t;m.lastPass=null;
 if(A&&D)v102Pose(m,W===A?D.p:A.p,'airLand',end);
 const pressure=m.people.filter(p=>p.t!==winner.t&&!p.keeper&&v122Metres(p,winner)<2).length,marked=Boolean(A&&D&&v122Metres(A.p,D.p)<1.5),air=ability(winner,'air'),tec=ability(winner,'tec'),pos=ability(winner,'pos');
 const credit=()=>{passer.stats.passComplete++;passer.stats.highComplete++;if(cross)passer.stats.crossComplete++;m.lastPass={passer,receiver:winner,at:m.elapsed};};
 v183Trace(m,{kind:'air',result:'won',winner,team:winner.t,own:winner.t===passer.t,duel:Boolean(A&&D),chance:chance===null?null:+chance.toFixed(3),share:+W.share.toFixed(3),reach:+W.reach.toFixed(2),cross});
 if(winner.t!==passer.t){
  passer.stats.passLost++;winner.stats.interceptions++;
  const ownBox=v160PenaltyContains(winner,winner.t,m);
  if(random()<clamp(P('clearBase')+(ownBox?P('clearBox'):0)+pressure*P('clearPressure')+(air-tec)*P('clearAirTec'),P('clearMin'),P('clearMax'))){ // setplay.clear
   const draw=random(); // setplay.clearLateral
   const clearance=v183Clearance(m,winner,end,{lateralDraw:draw,air,kind:'header',ownBox,pressure,passer}),target=clearance.target,exit=clearance.out?v55Exit(end,target):null;
   if(exit){
    // SI-4 may clear beyond the line: the header flies to the boundary and the
    // restart follows (corner or throw-in for the attacking side).
    const stop=v55BoundaryStop(exit),previous=v102Release;m.owner=winner;m.ball={...end};v102Release={person:winner,kind:'header',contact:{...end},height:2.65};
    try{fly(stop,Math.max(.35,v122Metres(end,stop)/v122HeaderSpeed(winner))*MATCH_SPEED,()=>v55Out(exit,winner.t,`${winner.name} köpft den Ball ins Aus.`));}finally{v102Release=previous;}
    return;
   }
   v102AirClear(winner,end,target);v50LooseBall(target,`${winner.name} köpft den hohen Ball weg.`);return;
  }
 }else{
  const kind=v183AirFinish(m,winner,end,{headerRange:v115GoalDistance(winner)<=v115HeaderRange(winner),preferHeader:air>=tec||pressure>0,pressure,marked,passer,cross});
  if(kind){credit();m.owner=winner;m.ball={...end};v55Shoot(winner,kind);if(m.flight)v183LedgerSource(m.flight,'header',m);return;}
  const allies=m.people.filter(p=>p.t===winner.t&&!p.keeper&&p!==winner&&v122Metres(winner,p)<=14),offside=v55OffsideSnapshot(winner).offside;
  const next=allies.filter(p=>!offside.has(p)).sort((a,b)=>v122Metres(a,winner)-v122Metres(b,winner)||a.n-b.n)[0];
  if(next&&random()<clamp(P('layOffBase')+ability(winner,'pas')*P('layOffPas')+pos*.004+(pressure?.10:0),P('layOffMin'),P('layOffMax'))){credit();m.owner=winner;m.ball={...end};v55GroundPass(winner,next,'header');return;} // setplay.layOff
 }
 const control=clamp(P('controlBase')+tec*.026+pos*.006+air*.006-pressure*.12-W.share*P('controlDistance'),.18,.94);
 if(random()>control){if(winner.t===passer.t)passer.stats.passLost++;v50LooseBall(end,`${winner.name} verspringt die Annahme des hohen Balls.`);return;} // setplay.control
 if(winner.t===passer.t)credit();m.owner=winner;m.ball={x:winner.x,y:winner.y};m.next=m.elapsed+v183ClockUnits(m,P('settle'));note(`${winner.name} nimmt den hohen Ball an.`,'duel');
};

// ----- Header/volley decision (owner SI-7; stub of SI-F for inactive matches) -----
// Finish when the landing point lies inside finishRange (headers also inside
// v115HeaderRange, volleys inside volleyRange) at a usable angle. The chance
// grows with proximity and the shot estimate of SI-3, falls with marking and
// pressure, and scales with (air|fin + tec) like v115DecisionChance.
const v183BaseAirFinish=v183AirFinish;
v183AirFinish=function(m,winner,end,detail={}){
 if(!v183SetplayOn(m))return v183BaseAirFinish.apply(this,arguments);
 const P=key=>v183SP(m,key),{depth,lateral,dist}=v183GoalFrame(m,winner.t,end),tec=ability(winner,'tec');
 const headerOk=detail.headerRange!==false&&dist<=P('finishRange'),volleyOk=dist<=P('volleyRange')&&!detail.preferHeader;
 const kind=detail.preferHeader?(headerOk?'header':null):volleyOk?'volley':headerOk?'header':null;
 if(!kind||depth<1||lateral>depth*.85+1.5)return null;
 const estimate=v183ShotEstimate(m,winner,end,{kind}),xg=Number.isFinite(estimate?.xg)?estimate.xg:0,quality=(ability(winner,kind==='header'?'air':'fin')+tec)/40;
 const chance=clamp(clamp(P('finishBase')+(P('finishRange')-dist)*P('finishDistance')+xg*P('finishXg')-(detail.marked?P('finishMarked'):0)-(detail.pressure||0)*P('finishPressure'),P('finishMin'),P('finishMax'))*(.65+.65*quality),.05,.96);
 const roll=random(); // setplay.airFinish
 v183Trace(m,{kind:'air-finish',winner,shot:kind,dist:+dist.toFixed(1),chance:+chance.toFixed(3),xg:+xg.toFixed(3),taken:roll<chance});
 return roll<chance?kind:null;
};

// ----- Cross estimate for SI-1/SI-2 (no random draw) -----
// {arrival, headerXg, eligible, landing, receiverPid, block, land, duel}:
//   eligible  geometry allows a cross: crosser within 32 m of goal and at least
//             6 m wide, target inside the pitch, within 20 m of goal, at most
//             14 m wide and at least 7 m away (nearer balls become ground passes).
//   arrival   probability that a team-mate wins the ball at the landing point:
//             (1 - block) x land x duel. land = share of the error spread inside
//             the receiver's reach; duel = attacker's chance against the nearest
//             defender who can still arrive (0.92 without one). 0 for an offside
//             receiver.
//   headerXg  goal expectation of the finish *given* arrival (finish chance by
//             distance x conversion from fin/air and distance); the option value
//             is arrival x headerXg.
// detail.space:true with detail.runner (B22, cross into space): the target is a
// point the runner reaches during the flight (spaceCrossSpeed). The landing
// share is the part of the error square around the spot that lies within his
// cover (v183RunCover: current approach speed, native acceleration, planning
// pace, spaceReaction) plus spaceSlackMax and his reach, because the aerial
// plan sends him to the actual landing point (sampled on a spaceLandGrid
// grid); the duel takes his remaining share at landing
// and his approach speed against the defender's. The finish and the header
// conversion are read at the spot. detail.adapt:true (default for space): a
// spot beyond cover + half his reach is moved back along his path to that
// distance (landing in the result) when the moved point still qualifies.
// detail.lead: real seconds the runner gets before the kick (signal); they add to
// his running time and to the nearest defender's (who sees the run start), not
// to the flight (SI-K2: before, only the runner moved during the wait, so 98 %
// of the options took the uncontested duel value .92).
// detail.offside: the crosser's offside set (v55OffsideSnapshot(p).offside) when
// the caller already has it (one snapshot per option evaluation); same result.
const v183BaseCrossEstimate=v183CrossEstimate;
v183CrossEstimate=function(m,p,target,detail={}){
 if(!v183SetplayOn(m))return v183BaseCrossEstimate.apply(this,arguments);
 const P=key=>v183SP(m,key),s=v160PitchScale(m),space=detail.space===true&&detail.runner&&typeof detail.runner.pid==='string',receiver=space?detail.runner:target&&typeof target.pid==='string'?target:null;let point=target?{x:target.x,y:target.y}:null;
 const none={arrival:0,headerXg:0,eligible:false,landing:point,receiverPid:receiver?.pid||null,block:0,land:0,duel:0,space};
 if(!point||!(point.x>=v55Field.left&&point.x<=v55Field.right&&point.y>=v55Field.top&&point.y<=v55Field.bottom))return none;
 const range=v115GoalDistance(p),wide=Math.abs(p.x-.5)*s.x;let {dist:goalT,lateral:lateralT}=v183GoalFrame(m,p.t,point),length=v122Metres(p,point);
 const qualifies=()=>range<=32&&wide>=6&&goalT<=20&&lateralT<=14&&length>=7;
 if(!qualifies())return none;
 const who=receiver||m.people.filter(q=>q.t===p.t&&!q.keeper&&q!==p&&!q.slideActive).sort((a,b)=>v122Metres(a,point)-v122Metres(b,point)||a.n-b.n)[0]||null;
 if(!who)return {...none,eligible:true};
 if((typeof detail.offside?.has==='function'?detail.offside:v55OffsideSnapshot(p).offside).has(who))return {...none,eligible:true,receiverPid:who.pid,offside:true};
 const rivals=m.people.filter(q=>q.t!==p.t&&!q.keeper&&!q.slideActive),within=v183Radius(m,'setplay.pressureRadius',.15),pressure=rivals.filter(q=>within(q,p)).length;
 const skill=ability(p,'pas')*.6+ability(p,'tec')*.4,spread=P('crossSpread')+(20-skill)*P('crossSpreadSkill')+pressure*P('crossSpreadPressure'),large=clamp(P('crossLarge')+(20-skill)*P('crossLargeSkill')+pressure*P('crossLargePressure'),P('crossLarge'),P('crossLargeMax'));
 const lead=space&&Number.isFinite(detail.lead)?Math.max(0,detail.lead):0;
 let flight=Math.max(P('flightMin'),length/(space?P('spaceCrossSpeed'):P('crossSpeed'))),gapA=v122Metres(who,point),cover=space?v183RunCover(m,who,point,flight+lead,P('spaceReaction')):0,adapted=false;
 const approachA=space?(gapA>1?v183AirPace(m,who):v183AirRun(who,point)):2,reachA=v183AirReach(m,who,approachA);
 // The spot lies beyond the runner: land where he can be, on his path to the
 // spot. A nearer point shortens the flight and his cover, so repeat until it fits.
 for(let i=0;i<6&&space&&detail.adapt!==false&&gapA>cover+reachA*.5;i++){
  const share=(cover+reachA*.5)/gapA*(i?.92:1),moved={x:who.x+(point.x-who.x)*share,y:who.y+(point.y-who.y)*share};
  point=moved;({dist:goalT,lateral:lateralT}=v183GoalFrame(m,p.t,point));length=v122Metres(p,point);
  if(!qualifies())return {...none,eligible:true,receiverPid:who.pid,landing:point,unreachable:true};
  flight=Math.max(P('flightMin'),length/P('spaceCrossSpeed'));gapA=v122Metres(who,point);cover=v183RunCover(m,who,point,flight+lead,P('spaceReaction'));adapted=true;
 }
 const slack=space?clamp(cover-gapA,0,P('spaceSlackMax')):0,reachable=space?clamp((cover+reachA-gapA)/reachA,0,1):1;
 let land;
 if(space){
  // Share of the error square (side 2 x spread around the spot) within the
  // runner's reachable disc: radius cover + reach, centred on him (the ball
  // lands anywhere in the square; he runs to where it lands).
  const n=Math.max(2,Math.round(P('spaceLandGrid'))),R=cover+reachA,ux=gapA>0?(point.x-who.x)*s.x/gapA:1,uy=gapA>0?(point.y-who.y)*s.y/gapA:0;let hit=0;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const ex=(-1+(2*i+1)/n)*spread,ey=(-1+(2*j+1)/n)*spread;if(Math.hypot(gapA*ux+ex,gapA*uy+ey)<=R)hit++;}
  land=(1-large)*hit/(n*n);
 }else land=(1-large)*Math.min(1,Math.PI*reachA*reachA/(4*spread*spread));
 const blocker=v183CrossBlocker(m,p,point),block=blocker?v183BlockChance(m,blocker):0;
 const defender=[...rivals].sort((a,b)=>v122Metres(a,point)-v122Metres(b,point)||a.n-b.n)[0];
 // Remaining reach share of the defender at landing after running during the
 // flight and the wait before the kick (lead: he sees the runner start, SI-K2).
 const gapD=defender?v122Metres(defender,point):Infinity,runD=defender?Math.max(0,flight+lead-.3)*(3+ability(defender,'spd')*.14):0,arrive=defender?Math.max(0,gapD-runD)/v183AirReach(m,defender,2):Infinity;
 const shareA=space?Math.min(1,Math.max(0,gapA-cover)/reachA):Math.min(1,gapA/reachA*.5),approachD=space&&defender?(gapD>1?Math.min(gapD,runD)/Math.max(.3,flight+lead-.3):0):approachA;
 const duel=arrive>1?.92:clamp(.5+(ability(who,'air')-ability(defender,'air'))*P('duelAir')+(ability(who,'pos')-ability(defender,'pos'))*P('duelPos')+(arrive-shareA)*P('duelDistance')+(approachA-approachD)*P('duelRun')+(v183Height(who)-v183Height(defender))*P('duelHeight'),P('duelMin'),P('duelMax'));
 const arrival=(1-block)*land*duel;
 const finish=goalT<=P('finishRange')?clamp(P('finishBase')+(P('finishRange')-goalT)*P('finishDistance'),0,P('finishMax')):0;
 // Conversion of the header: the SI-3 placement model at the landing point when
 // it is live (goal probability, no `stub`), else a fin/air/distance formula.
 const estimate=v183ShotEstimate(m,who,point,{kind:'header'}),conversion=estimate&&!estimate.stub&&Number.isFinite(estimate.xg)?clamp(estimate.xg,0,1):clamp(.12+(ability(who,'fin')*.5+ability(who,'air')*.5-10)*.012-(goalT-6)*.012,.04,.35);
 return {arrival,headerXg:finish*conversion,eligible:true,landing:point,receiverPid:who.pid,block,land,duel,pressure,spread:+spread.toFixed(2),flight:+flight.toFixed(2),...(space?{space:true,cover:+cover.toFixed(2),gap:+gapA.toFixed(2),reachable:+reachable.toFixed(3),adapted,lead}:{})};
};

// ----- Corner formation (wraps v131CornerFormation) -----
// Variants near/central/far (+short for a skilled taker or focus "Außen"); the
// target is the best header of the team, a fourth attacker holds the back space
// (cornerBack metres, H8) for the second ball. Defenders mark the three box
// attackers by air and positioning.
const v183BaseCornerFormation=v131CornerFormation;
v131CornerFormation=function(current,piece){
 if(!v183SetplayOn(current))return v183BaseCornerFormation.apply(this,arguments);
 const m=current,team=piece.team,dir=team===0?1:-1,goal=team===0?v55Field.top:v55Field.bottom,s=v160PitchScale(m),sx=1/s.x,sy=1/s.y,side=piece.spot.x<.5?-1:1;
 const attackers=v50Outfield(team).filter(p=>p!==piece.taker).sort((a,b)=>ability(b,'air')+ability(b,'pos')*.4-ability(a,'air')-ability(a,'pos')*.4||a.n-b.n);
 if(!attackers.length)return;
 const variants=['near','central','far'];if(m.teamFocus?.[team]==='Außen'||ability(piece.taker,'pas')+ability(piece.taker,'tec')>30)variants.push('short');
 m.cornerVariants??=[null,null];const eligible=variants.filter(v=>v!==m.cornerVariants[team]),variant=eligible[Math.min(eligible.length-1,Math.floor(random()*eligible.length))];m.cornerVariants[team]=variant; // setplay.cornerVariant
 const back=v183SP(m,'cornerBack');
 const spots=variant==='near'?[[side*2.8,6.5],[-side*3.5,8],[0,10.5],[0,back],[side*7,22]]:variant==='far'?[[-side*3.5,7.5],[side*2.5,9],[0,11],[0,back],[side*7,22]]:variant==='short'?[[side*16,5],[side*2.5,8.5],[-side*3.5,9.5],[0,back],[0,26]]:[[0,9],[side*3.5,7],[-side*4,8.5],[0,back],[side*7,22]];
 const receiver=variant==='short'?[...attackers].sort((a,b)=>ability(b,'pas')+ability(b,'tec')-ability(a,'pas')-ability(a,'tec')||a.n-b.n)[0]:attackers[0];
 const ordered=[receiver,...attackers.filter(p=>p!==receiver)];
 piece.cornerVariant=variant;piece.cornerTargetPid=receiver.pid;piece.cornerTargetNumber=receiver.n;piece.cornerBackPid=ordered.length>3?ordered[3].pid:null;
 ordered.forEach((p,i)=>{const [x,depth]=spots[Math.min(i,spots.length-1)];v50Spot(p,{x:.5+x*sx,y:goal+dir*depth*sy})});
 const defenders=v50Outfield(1-team).sort((a,b)=>ability(b,'air')+ability(b,'pos')*.6+ability(b,'tak')*.2-ability(a,'air')-ability(a,'pos')*.6-ability(a,'tak')*.2||a.n-b.n);
 defenders.forEach((p,i)=>{const mark=ordered[i];if(mark&&i<3){const gap=.65+(20-ability(p,'pos'))*.04;v50Spot(p,{x:mark.x-side*.4*sx,y:mark.y-dir*gap*sy})}else v50Spot(p,{x:.5+(i===3?-side*4:side*5)*sx,y:goal+dir*(i===3?12:18)*sy})});
};

// ----- Free-kick variants (wraps v182FreeKickPlan, v50TakeFreeKick, v50BestTaker) -----
// Shooter quality as SI-3 rates a direct free kick (v183FinishSkill, else the
// same .7 fin + .3 tec); the direct window reads the SI-3 limits while the
// finish package is on, else the setplay parameters.
function v183ShooterSkill(p){return typeof v183FinishSkill==='function'?v183FinishSkill(p,'direct-free-kick'):ability(p,'fin')*.7+ability(p,'tec')*.3;}
function v183DirectLimit(m,shooter){
 const fin=ability(shooter,'fin');
 return v183Active(m,'finish')?v183Param(m,'finish.fkRangeBase')+v183Param(m,'finish.fkRangeFin')*fin:v183SP(m,'freeKickRange')+v183SP(m,'freeKickRangeFin')*fin;
}
function v183FreeKickWindow(m,team,spot,shooter){
 const {depth,lateral,dist}=v183GoalFrame(m,team,spot);
 return depth>=6&&lateral<=depth*.85+1&&dist<=v183DirectLimit(m,shooter);
}
// Cross variant applies when the spot is 12-36 m out and enough team-mates
// (excluding the taker) stand within 20 m of goal and 12 m of the centre.
function v183FreeKickBox(m,team,spot,taker){
 const s=v160PitchScale(m),allies=v50Outfield(team).filter(p=>p!==taker),{dist}=v183GoalFrame(m,team,spot),box=allies.filter(p=>v115GoalDistance(p)<=20&&Math.abs(p.x-.5)*s.x<=12);
 return dist>=12&&dist<=36&&box.length>=v183SP(m,'freeKickCrossAllies')?box:null;
}
// Pass variants of a free kick: a cross to the best header of the box, else
// today's short pass to the most advanced team-mate. Plain data for the saved set piece.
function v183FreeKickVariant(m,setPiece){
 const team=setPiece.team,taker=setPiece.taker,allies=v50Outfield(team).filter(p=>p!==taker),box=v183FreeKickBox(m,team,setPiece.spot,taker);
 if(box){const target=[...box].sort((a,b)=>ability(b,'air')+ability(b,'pos')*.4-ability(a,'air')-ability(a,'pos')*.4||a.n-b.n)[0];return {direct:false,targetPid:target.pid,kind:'cross'};}
 const target=[...allies].sort((a,b)=>(team===0?a.y-b.y:b.y-a.y)||distance(a,taker)-distance(b,taker))[0]||null;
 return {direct:false,targetPid:target?target.pid:null,kind:'pass'};
}
// One owner of "best shooter": the free kick inside the shooter's window is
// taken by the best shooter (SI-3 rating); a free kick that will be crossed by
// the best crosser (passing/technique, as corners); otherwise today's taker.
// A visible relocation of the taker is accepted for set pieces.
const v183BaseBestTaker=v50BestTaker;
v50BestTaker=function(team,type,spot){
 const m=match;if(!v183SetplayOn(m)||type!=='freeKick')return v183BaseBestTaker.apply(this,arguments);
 const field=v50Outfield(team),shooter=[...field].sort((a,b)=>v183ShooterSkill(b)-v183ShooterSkill(a)||a.n-b.n)[0];
 if(shooter&&v183FreeKickWindow(m,team,spot,shooter))return shooter;
 const crosser=[...field].sort((a,b)=>ability(b,'pas')*.6+ability(b,'tec')*.4-ability(a,'pas')*.6-ability(a,'tec')*.4||a.n-b.n)[0];
 if(crosser&&v183FreeKickBox(m,team,spot,crosser))return crosser;
 return v183BaseBestTaker.apply(this,arguments);
};
// Plan at creation (v50Restart, before wall and defenders are placed): the
// direct attempt needs the best shooter inside his window. With the finish
// package it is provisional and confirmed at execution by v183DirectFreeKick
// once the wall stands (v50TakeFreeKick below); without it one draw by
// finishing decides here, as the base plan draws at creation too.
const v183BaseFreeKickPlan=v182FreeKickPlan;
v182FreeKickPlan=function(m,setPiece){
 if(!v183SetplayOn(m))return v183BaseFreeKickPlan.apply(this,arguments);
 const P=key=>v183SP(m,key),team=setPiece.team,taker=setPiece.taker,field=v50Outfield(team),skill=v183ShooterSkill(taker);
 const bestShooter=!field.some(p=>v183ShooterSkill(p)>skill+1e-9),window=bestShooter&&v183FreeKickWindow(m,team,setPiece.spot,taker),advised=v183Active(m,'finish')&&typeof v183DirectFreeKick==='function';
 const direct=window&&(advised||random()<clamp(P('freeKickDirectBase')+(ability(taker,'fin')-10)*P('freeKickDirectFin'),.1,.9)); // setplay.freeKickDirect (only without the finish package)
 if(direct)return {direct:true,targetPid:null,kind:'direct',provisional:advised};
 return v183FreeKickVariant(m,setPiece);
};
// Execution: a provisional direct plan asks v183DirectFreeKick now that the
// wall and the defenders stand (range, free angle, goal probability incl. the
// block); a refusal turns the plan into the cross/pass variant from the current
// positions. The revised plan stays plain data in the set piece. The cross is
// kicked as a restart (the queued turn cannot be cancelled by a close rival).
const v183BaseTakeFreeKick=v50TakeFreeKick;
v50TakeFreeKick=function(setPiece){
 const m=match;if(!v183SetplayOn(m)||setPiece.type==='offside')return v183BaseTakeFreeKick.apply(this,arguments);
 if(setPiece.plan?.kind==='direct'&&v183Active(m,'finish')&&typeof v183DirectFreeKick==='function'){
  const advice=v183DirectFreeKick(m,setPiece);
  if(advice&&!advice.direct){setPiece.plan={...v183FreeKickVariant(m,setPiece),revised:'direct'};v183Trace(m,{kind:'free-kick-revised',taker:setPiece.taker,to:setPiece.plan.kind,xg:Number.isFinite(advice.xg)?+advice.xg.toFixed(3):null});}
  else if(advice)setPiece.plan={direct:true,targetPid:null,kind:'direct',xg:Number.isFinite(advice.xg)?+advice.xg.toFixed(3):null};
 }
 if(setPiece.plan?.kind!=='cross')return v183BaseTakeFreeKick.apply(this,arguments);
 const taker=setPiece.taker,team=setPiece.team,receiver=v50Outfield(team).find(p=>p!==taker&&p.pid===setPiece.plan.targetPid);
 if(!receiver)return v183BaseTakeFreeKick.apply(this,arguments);
 v50Spot(taker,setPiece.spot);m.owner=taker;m.ball={...setPiece.spot};m.offsideVisual=null;
 note(`${taker.name} flankt den Freistoß in den Strafraum auf ${receiver.name}.`,'restart');
 v55HighPass(taker,receiver,{cross:true,exempt:false,restart:true});
};

// Package complete: new matches start with the setplay package on.
v183EnableByDefault('setplay');
