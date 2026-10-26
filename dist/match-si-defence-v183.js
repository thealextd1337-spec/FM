'use strict';

// Player intelligence 183, package SI-4: defence, radii and fouls.
// New logic only for v183Active(m,'defence'); otherwise the wrapped previous
// function runs unchanged. All tunable values are match.si.params.defence
// (registered below, stored with each new match, calibrated in SI-K). Plain run
// state lives in m.attackFlow.defence (saved with the match, restored as is):
//   {tick, poss, counter:{team,at,until}|null, cover:[pid|null,pid|null], slideAt|null}
// Times in that state are the native contact clock v102Clock(m) (real seconds).
// Random draws of this package, all inside marked paths only:
//   "clearance.lateral"  v183Clearance without a caller draw (as the SI-F stub)
//   "clearance.out"      v183Clearance: a clearance under pressure goes out
//   "clearance.kind"     v183Clearance: out over the goal line (corner) or not
//   slide draw           the existing draw of v56MaybeChallenge, made at the slide
//                        cadence instead of at every decision (not a new draw)
// What this package changes in a marked match:
//   - one contact path: duels open from the per-tick check only (v182ContactCheck);
//     the decision path (action -> v56MaybeChallenge) no longer opens duels. A
//     slide is considered at the slide cadence (a slide from behind stays possible: B03);
//     the optional forecast filter (slideForecast 1/2, default 0) uses the kinematics of
//     v56StartSlide/v56AdvanceSlide;
//   - fouls arise only from contact events (standing tackle, slide; traced). The
//     contactless foul probe of set-pieces-v50.js:160 is not reachable in the
//     production load order (pitch-v55.js:492 replaces action) and stays off;
//   - roles: presser (nearest, existing B03 logic), safety defender (second
//     nearest, on the carrier-goal line behind the presser), rest in cover/zone;
//   - counter-pressing after a turnover in the loser's final third;
//   - pressure radii in metres (v183Radius with defence.*PressureRadius);
//   - v183Clearance (a clearance under pressure may go out) and the direction of
//     blocks (v183BlockAim, used at set-pieces-v50.js:215).
// B03 stays: a slide from behind with body contact is always a foul
// (v56AdvanceSlide is not touched); the contact and press pace values are stored
// parameters of the new match.

v183RegisterDefaults('defence',{
 // Pressure radii in metres: area-equivalent circles of the former normalised
 // ellipse (.15 = 7.3 x 11.0 m on the 44 x 68 m pitch, 20 % more on the large one).
 // pass: pitch-v55.js:192 (this package; SI-1 mirrors it in its arrival estimate).
 // cross, shot and decision have no consumer yet: SI-7 uses setplay.pressureRadius
 // (3 m), SI-3 finish.pressureRadius (2.5 m) and pitch-v55.js:494 is still the
 // normalised .15; SI-K fixes the common metre values for all sites.
 passPressureRadius:9,crossPressureRadius:9,shotPressureRadius:9,decisionPressureRadius:9,
 // Contact: seconds locked after a challenge (B03 today .25), seconds between two
 // slide decisions, forecast filter for slides (0 off: every slide candidate may slide,
 // also from behind, B03 as released; 1 only slides that reach the ball first; 2 also
 // slides that miss but are not from behind. 1 and 2 are all-knowing binary filters
 // kept for tests and SI-K), scale of the foul chance of a standing tackle.
 contactWindow:.25,slideInterval:.5,slideForecast:0,standingFoulScale:1,
 // Pace factors (B03 pressing today 1.58; safety defender: support factor 1.35).
 pressPace:1.58,coverPace:1.35,
 // Safety defender: carrier closer than coverZone m to the own goal, safety
 // defender within coverRange m of the carrier, coverDepth m behind the presser,
 // leash coverLeash m from the formation anchor.
 coverZone:40,coverRange:14,coverDepth:4,coverLeash:18,
 // Counter-pressing: window in s (with early pressing), turnover within
 // counterZone m of the loser's attacked goal, pressers within counterRange m,
 // number of pressers, lateral offset of the second one; counterCutters further
 // players stand on the lane from a near team-mate of the carrier to the carrier,
 // counterLane of the way from the team-mate; counterContactWindow: contact window in s
 // for duels with the carrier while the window is open (at most contactWindow).
 counterWindow:0,counterWindowPress:0, // SI-K: 2/3 s -> 0 (window off; no gain in the SI-4 scenes)
 counterZone:24,counterRange:14,counterPressers:2,counterWide:1.4,counterCutters:1,counterLane:.35,counterContactWindow:.15,
 // Clearance under pressure (v183Clearance): chance that a header clearance goes
 // out = clearOutBase + clearOutPressure*pressing rivals + clearOutBox in the own
 // box, damped by calm, capped at clearOutMax. Block (kind 'block' of v183Clearance,
 // reserved: no caller yet, SI-7 has its own v183BlockCross): base chance and box bonus.
 clearOutBase:.08,clearOutPressure:.12,clearOutBox:.12,clearOutMax:.5,clearCalm:.025,blockOutBase:.35,blockOutBox:.15,
 // Direction of a block deflection (draw offset, spread, gain per point of 'pos').
 blockBias:.2,blockSpread:.3,blockSkill:.004,
 // Marker of a signalled cross runner (SI-K2, cross into space B22): crossMark
 // 0 = off; reaction to the run in s (crossMarkReaction, minus crossMarkPos per
 // pos point above 10, .1-.8 s); he shadows the runner crossMarkGap m on the
 // side of the spot (pressing pace); negative: that far behind him on his path
 // (SI-K2: -1 keeps the open-play arrival of B22, 0 cost 8 points of it).
 crossMark:1,crossMarkReaction:.4,crossMarkPos:.02,crossMarkGap:-1
});

// Counter-pressing willingness by tactical role (0 = never presses). A design
// table like V183_PERSONALITY: the nearest players are ranked by metres / weight.
const V183_DEF_COUNTER_ROLE=Object.freeze({'ball-winner':1.25,'box-to-box':1.1,stopper:1,striker:1,dribbler:.9,winger:.9,playmaker:.85,'cover-defender':.8,'ball-playing-defender':.8,poacher:.7,'target-player':.6,'line-keeper':0,'sweeper-keeper':0});
function v183DefCounterWeight(p){return Object.hasOwn(V183_DEF_COUNTER_ROLE,p.tacticalRole)?V183_DEF_COUNTER_ROLE[p.tacticalRole]:1;}

function v183DefFlow(m){return m.attackFlow.defence||(m.attackFlow.defence={tick:null,poss:null,counter:null,cover:[null,null],slideAt:null});}
function v183DefOn(m){return Boolean(m&&v183Active(m,'defence')&&m.attackFlow?.flowVersion===159);}
function v183DefReady(m,team,from){
 return m.people.filter(q=>q.t===team&&!q.keeper&&!q.slideActive&&(q.recoverUntil||0)<=m.elapsed).sort((a,b)=>v122Metres(a,from)-v122Metres(b,from)||a.n-b.n);
}

// ----- Contact: one path, fouls only with contact -----
// The flag is raised while the actual contact functions run (the only production callers
// of v50Foul). v50Foul itself awards a foul only within 43/32 m of body contact; every
// awarded foul is traced with its gap and whether it came from a contact function. The
// decision path is closed.
let v183DefContactOpen=0,v183DefTickGate=false;
function v183DefContact(fn){v183DefContactOpen++;try{return fn();}finally{v183DefContactOpen--;}}
const v183DefBaseStandingTackle=v56StandingTackle;
v56StandingTackle=function(tackler,victim){return v183DefOn(match)?v183DefContact(()=>v183DefBaseStandingTackle(tackler,victim)):v183DefBaseStandingTackle(tackler,victim);};
const v183DefBaseAdvanceSlide=v56AdvanceSlide;
v56AdvanceSlide=function(delta){return v183DefOn(match)?v183DefContact(()=>v183DefBaseAdvanceSlide(delta)):v183DefBaseAdvanceSlide(delta);};
const v183DefBaseFoul=v50Foul;
v50Foul=function(victim,offender){
 const m=match;if(!v183DefOn(m))return v183DefBaseFoul(victim,offender);
 const fouls=m.setPieceStats.fouls[0]+m.setPieceStats.fouls[1],gap=v56Contact(victim,offender),result=v183DefBaseFoul(victim,offender);
 if(m.setPieceStats.fouls[0]+m.setPieceStats.fouls[1]>fouls)v183Trace(m,{type:'foul',victim:victim.pid,offender:offender.pid,gap:+gap.toFixed(1),slide:Boolean(offender.slideActive),contact:v183DefContactOpen>0});
 return result;
};
const v183DefBaseFoulChance=v50FoulChance;
v50FoulChance=function(tackler,victim){const chance=v183DefBaseFoulChance(tackler,victim);return v183DefOn(match)?chance*v183Param(match,'defence.standingFoulScale'):chance;};

// The decision path (action) no longer opens duels in a marked match.
const v183DefBaseMaybeChallenge=v56MaybeChallenge;
v56MaybeChallenge=function(victim){
 const m=match;if(!v183DefOn(m))return v183DefBaseMaybeChallenge(victim);
 return v183DefTickGate?v183DefBaseMaybeChallenge(victim):false;
};

// A slide takes .65 real seconds (pitch-v56.js:47: progress per real second is 1/.65 and
// independent of the clock rate once SI-0 divides by .65 * rate for marked matches).
const V183_DEF_SLIDE_SECONDS=.65;
// Forecast of a slide with the kinematics of v56StartSlide/v56AdvanceSlide, in real
// seconds: the tackler slides to the ball position plus a short follow-through, the
// carrier and his ball keep their observed velocity. The first event decides: 'ball'
// (ball gap < 24/32 m), 'foul' (body gap < 27/32 m with the ball not reached, or from
// behind: the flag of the start or, at each step, the metres test of v182Behind) or
// 'miss'. The loop ends with the slide (.65 s plus one step).
// Direction of the carrier's run as v182Behind takes it (observed velocity, else his last
// motion, else towards the opponent's goal).
function v183DefRunDirection(m,victim){
 const s=v150Scale(m),body=v157Body(victim),speed=Math.hypot(body.vx,body.vy);
 if(speed>.5)return {x:body.vx/speed,y:body.vy/speed};
 const mx=(victim.motionX||0)*s.x,my=(victim.motionY||0)*s.y,l=Math.hypot(mx,my);
 return l>1e-6?{x:mx/l,y:my/l}:{x:0,y:victim.t===0?-1:1};
}
function v183DefBehindAt(m,run,tackler,carrier){const s=v150Scale(m);return (tackler.x-carrier.x)*s.x*run.x+(tackler.y-carrier.y)*s.y*run.y<-.5;}
function v183DefSlideForecast(m,slider,victim){
 const s=v150Scale(m),body=v157Body(victim),vx=body.vx/s.x,vy=body.vy/s.y,forward=v56Forward(victim),behind=v56ApproachInfo(slider,victim).behind,run=v183DefRunDirection(m,victim);
 const ball={...m.ball},reach=behind?.25:.18,from={x:slider.x,y:slider.y};
 const target={x:clamp(ball.x+forward.x*reach/s.x,.06,.94),y:clamp(ball.y+forward.y*reach/s.y,.06,.94)};
 const rate=1/V183_DEF_SLIDE_SECONDS,metres=(a,b)=>Math.hypot((a.x-b.x)*s.x,(a.y-b.y)*s.y)*32;
 for(let t=0;t<=V183_DEF_SLIDE_SECONDS+.05;t+=.05){
  const q=Math.min(1,rate*t),eased=1-(1-q)*(1-q),tackler={x:from.x+(target.x-from.x)*eased,y:from.y+(target.y-from.y)*eased};
  const carrier={x:victim.x+vx*t,y:victim.y+vy*t},ballAt={x:ball.x+vx*t,y:ball.y+vy*t},bodyGap=metres(tackler,carrier),ballGap=metres(tackler,ballAt);
  if(bodyGap<27&&(ballGap>23||behind||v183DefBehindAt(m,run,tackler,carrier)))return 'foul';
  if(ballGap<24)return 'ball';
 }
 return 'miss';
}

// Per-tick contact check: the only way a duel opens. Standing tackles are tried at
// every tick outside the contact window; a slide is considered only every
// slideInterval seconds and only if its forecast reaches the ball first.
function v183DefContactTick(m){
 const owner=m.owner;
 if(!v182PursuitActive(m)||!owner||owner.keeper||m.flight||m.slide||m.setPiece||m.kickoff||m.throwIn||m.finished||v121PositioningPaused(m))return false;
 const flow=m.attackFlow,clock=v102Clock(m),state=v183DefFlow(m),pressing=Boolean(state.counter&&state.counter.team!==owner.t&&state.counter.until>clock);
 const lock=pressing?Math.min(v183Param(m,'defence.contactWindow'),v183Param(m,'defence.counterContactWindow')):v183Param(m,'defence.contactWindow');
 if(flow.challengeAt!=null&&clock-flow.challengeAt<lock)return false;
 const rivals=m.people.filter(q=>q.t!==owner.t&&!q.keeper&&!q.slideActive&&(q.recoverUntil||0)<=m.elapsed);
 const standing=rivals.some(q=>{const info=v56ApproachInfo(q,owner);return !info.behind&&info.ball<30.4&&info.body<40;});
 if(!standing){
  // The same candidate as the base slide, at the slide cadence.
  const slider=rivals.filter(q=>{const info=v56ApproachInfo(q,owner);return info.ball>=25&&info.ball<83.2&&info.body<105&&(info.behind||info.ball<info.body);}).sort((a,b)=>v56Contact(a,m.ball)-v56Contact(b,m.ball))[0];
  if(!slider||(state.slideAt!==null&&clock-state.slideAt<v183Param(m,'defence.slideInterval')))return false;
  state.slideAt=clock;
  const filter=v183Param(m,'defence.slideForecast');
  if(filter>0){
   const outcome=v183DefSlideForecast(m,slider,owner);
   // A slide that would foul is never tried; one that misses only if the filter is relaxed and the slider is not behind.
   if(outcome==='foul'||outcome==='miss'&&(filter<2||v56ApproachInfo(slider,owner).behind)){v183Trace(m,{type:'slide-skipped',slider:slider.pid,outcome});return false;}
  }
 }
 v183DefTickGate=true;
 try{return v183DefBaseMaybeChallenge(owner);}finally{v183DefTickGate=false;}
}
const v183DefBaseContactCheck=v182ContactCheck;
v182ContactCheck=function(m){return v183DefOn(m)?v183DefContactTick(m):v183DefBaseContactCheck(m);};

// ----- Roles: presser, safety defender, counter-pressing -----
// Possession bookkeeping, once per native tick: a turnover (the team with the ball
// changes to a field player) within counterZone m of the loser's attacked goal
// opens a counter-pressing window for the loser.
function v183DefTrack(m,state,clock){
 if(state.tick===clock)return;
 state.tick=clock;
 const team=m.owner?m.owner.t:m.flight?m.flight.team:null;
 if(v121PositioningPaused(m)){state.poss=null;state.counter=null;return;}
 if(team!==null){
  if(state.poss!==null&&team!==state.poss&&m.owner&&!m.owner.keeper){
   const loser=state.poss;
   if(v115GoalDistance({x:m.ball.x,y:m.ball.y,t:loser})<=v183Param(m,'defence.counterZone')){
    const press=Boolean(m.teamPress?.[loser]);
    state.counter={team:loser,at:clock,until:clock+v183Param(m,press?'defence.counterWindowPress':'defence.counterWindow')};
    v183Trace(m,{type:'counter-window',team:loser,press,until:state.counter.until});
   }
  }
  if(state.counter&&state.counter.team===team)state.counter=null;
  state.poss=team;
 }
 if(state.counter&&state.counter.until<=clock)state.counter=null;
}
// The second counter-presser closes from the side: the press point of B03, shifted.
function v183DefCounterPoint(m,p,owner,seen,second){
 const s=v150Scale(m),point=v182PressPoint(m,p,owner,seen);
 if(!second)return point;
 return v159Point({x:point.x+(p.x<owner.x?-1:1)*v183Param(m,'defence.counterWide')/s.x,y:point.y},s,.5);
}
function v183DefCoverSpot(m,p,owner,presser){
 const s=v150Scale(m),goal={x:.5,y:p.t===0?v55Field.bottom:v55Field.top},gx=(goal.x-owner.x)*s.x,gy=(goal.y-owner.y)*s.y,g=Math.hypot(gx,gy)||1;
 const depth=Math.min(clamp((presser?v122Metres(presser,owner):2)+v183Param(m,'defence.coverDepth'),4.5,12),Math.max(2.5,g-1.5));
 return v159Point({x:owner.x+gx/g*depth/s.x,y:owner.y+gy/g*depth/s.y},s,.5);
}
// Same record as the base defensive read, so the pace weichen of v157Pace see it.
function v183DefAssign(m,p,target,kind){
 const flow=m.attackFlow,reads=flow.defenseReads||(flow.defenseReads={}),now=v152Seconds(m);
 reads[p.pid]={team:v123PossessionTeam(m),at:now,nextAt:now+.2,ball:{x:m.ball.x,y:m.ball.y},target,purpose:kind==='cover'?'cover':'press',kind};
 p.tx=target.x;p.ty=target.y;return true;
}
// Marker of a signalled cross runner (SI-K2). SI-1 publishes the run of a cross
// into space in attackFlow.crossRun from the decision on (the runner starts
// toward the spot, SI-2). Without a reaction the defenders kept their zone
// targets, so 43 % of these crosses landed with no defender in the duel and
// headers without a rival within 2.5 m scored 68 %. Now one defender per signal
// follows the visible run: the nearest ready outfield player to the runner except
// the presser of the crosser, chosen once per signal (plain record
// attackFlow.defence.mark {runnerId,at,markerId}). After his reaction he stands
// crossMarkGap m from the runner toward the spot (in the air: toward the landing
// point of the aerial plan); a contender of the aerial plan runs to the ball as
// before (interceptTarget). No draw.
function v183DefCrossMark(m,p){
 const run=m.attackFlow.crossRun;
 if(!run||!(v183Param(m,'defence.crossMark')>0))return false;
 const now=v183Seconds(m),runner=m.people.find(q=>q.pid===run.runnerId);
 if(now>run.until||!runner||runner.t===p.t||runner.slideActive)return false;
 const state=v183DefFlow(m);
 if(state.mark?.runnerId!==run.runnerId||state.mark.at!==run.at){
  const crosser=m.people.find(q=>q.pid===run.crosserId),presser=crosser?v183DefReady(m,p.t,crosser)[0]:null,marker=v183DefReady(m,p.t,runner).find(q=>q!==presser);
  state.mark={runnerId:run.runnerId,at:run.at,markerId:marker?marker.pid:null};
 }
 if(state.mark.markerId!==p.pid)return false;
 const reaction=clamp(v183Param(m,'defence.crossMarkReaction')-(ability(p,'pos')-10)*v183Param(m,'defence.crossMarkPos'),.1,.8);
 if(now-run.at<reaction)return false;
 const plan=run.kicked&&m.flight&&typeof v122AerialPlans!=='undefined'?v122AerialPlans.get(m.flight):null,spot=plan?.end||{x:run.x,y:run.y},gap=v122Metres(runner,spot),share=gap>1e-6?Math.min(1,v183Param(m,'defence.crossMarkGap')/gap):1;
 return v183DefAssign(m,p,{x:runner.x+(spot.x-runner.x)*share,y:runner.y+(spot.y-runner.y)*share},'mark');
}
function v183DefTarget(m,p){
 const owner=m.owner;
 if(!owner||owner.keeper||m.flight||!v182PursuitActive(m)||owner.t===p.t)return false;
 const state=v183DefFlow(m),clock=v102Clock(m);v183DefTrack(m,state,clock);
 const ready=v183DefReady(m,p.t,owner),s=v150Scale(m);
 if(!ready.includes(p))return false;
 // Counter-pressing: the nearest willing players close the new carrier.
 const counter=state.counter&&state.counter.team===p.t?state.counter:null;
 if(counter){
  const range=v183Param(m,'defence.counterRange'),willing=ready.filter(q=>v183DefCounterWeight(q)>0&&v122Metres(q,owner)<=range).sort((a,b)=>v122Metres(a,owner)/v183DefCounterWeight(a)-v122Metres(b,owner)/v183DefCounterWeight(b)||a.n-b.n);
  const presserCount=v183Param(m,'defence.counterPressers'),index=willing.indexOf(p);
  if(index>=0&&index<presserCount)return v183DefAssign(m,p,v183DefCounterPoint(m,p,owner,v182PursuitRead(m,p,owner,ready).seen,index>0),'counter');
  // Lane cutters: the next willing players take the lanes to the carrier's nearest team-mates.
  if(index>=presserCount&&index<presserCount+v183Param(m,'defence.counterCutters')){
   const mate=m.people.filter(q=>q.t===owner.t&&!q.keeper&&q!==owner&&!q.slideActive).sort((a,b)=>v122Metres(a,owner)-v122Metres(b,owner)||a.n-b.n)[index-presserCount];
   if(mate){const lane=v183Param(m,'defence.counterLane');return v183DefAssign(m,p,v159Point({x:mate.x+(owner.x-mate.x)*lane,y:mate.y+(owner.y-mate.y)*lane},s,.5),'counter');}
  }
 }
 // Safety defender: the second nearest, behind the presser on the carrier-goal line.
 const presser=ready[0];
 if(p===presser)return false;
 const goalDepth=Math.hypot((owner.x-.5)*s.x,(owner.y-(p.t===0?v55Field.bottom:v55Field.top))*s.y);
 if(goalDepth>v183Param(m,'defence.coverZone'))return false;
 const second=ready[1],kept=ready.find(q=>q.pid===state.cover[p.t]&&q!==presser),choice=kept&&second&&v122Metres(kept,owner)<=v122Metres(second,owner)+1.5?kept:second;
 if(choice!==p||v122Metres(p,owner)>v183Param(m,'defence.coverRange')){if(state.cover[p.t]===p.pid&&choice!==p)state.cover[p.t]=null;return false;}
 state.cover[p.t]=p.pid;
 const spot=v183DefCoverSpot(m,p,owner,presser),anchor={x:p.bx,y:p.by},gap=Math.hypot((spot.x-anchor.x)*s.x,(spot.y-anchor.y)*s.y),limit=Math.min(1,v183Param(m,'defence.coverLeash')/Math.max(.001,gap));
 return v183DefAssign(m,p,v159Point({x:anchor.x+(spot.x-anchor.x)*limit,y:anchor.y+(spot.y-anchor.y)*limit},s,.5),'cover');
}
// Ball line (B28): a defender who is neither pressing nor chasing a flight never
// takes a target upfield of the ball. The cover spot leashed to a far anchor and
// the mark of a receiver behind the ball (football-flow-v159 'receiver') sent him
// away from an advancing carrier; now such a target stops 1 m goal-side of the ball
// (the cached read is corrected too, so the cadence path keeps it).
function v183DefBallLine(m,p){
 const owner=m.owner,read=m.attackFlow.defenseReads?.[p.pid];
 if(!owner||owner.keeper||owner.t===p.t||m.flight||!read||!['cover','receiver'].includes(read.purpose))return;
 const dir=p.t===0?1:-1,s=v150Scale(m),limit=clamp(m.ball.y+dir/s.y,v55Field.top+.5/s.y,v55Field.bottom-.5/s.y);
 // The mark of a receiver who himself stands ahead of the ball stays free (its zone blend may lie
 // beyond the ball); only the mark of a back-pass option is clamped. Same formula as
 // world-football-flow-v159.js (receiver branch), but recomputed from current positions while a read is cached.
 if(read.purpose==='receiver'){const marked=m.people.filter(q=>q.t===owner.t&&!q.keeper&&q!==owner&&!q.slideActive&&v122Metres(q,p)<13).map(q=>{const lane=passLaneGeometry(p,owner,q);return{q,cost:v122Metres(p,q)-((q.y-owner.y)*(owner.t===0?-1:1)*s.y)*.10+(lane?.t?-.6:0)};}).sort((a,b)=>a.cost-b.cost||a.q.n-b.q.n)[0]?.q;if(marked&&(marked.y-m.ball.y)*dir>0)return;}
 if((p.ty-limit)*dir<0){p.ty=limit;read.target.y=limit;}
}
const v183DefBaseDefensiveTarget=v159DefensiveTarget;
v159DefensiveTarget=function(m,p){
 if(!v183DefOn(m)||p.keeper||p.slideActive||v121PositioningPaused(m))return v183DefBaseDefensiveTarget(m,p);
 const result=v183DefCrossMark(m,p)||v183DefTarget(m,p)||v183DefBaseDefensiveTarget(m,p);
 if(result)v183DefBallLine(m,p);
 return result;
};

// Pace of pressing and covering through the SI-F weiche of v157Pace: pressing
// reasons and the safety defender take stored factors, every other purpose goes
// to the previous owner of the function.
const v183DefBasePaceFactor=v183PaceFactor;
v183PaceFactor=function(m,p,purpose,detail={}){
 if(v183DefOn(m)){
  const read=detail.read;
  if(read&&detail.now!==undefined&&read.nextAt>=detail.now&&read.kind==='cover')return v183Param(m,'defence.coverPace');
  if(purpose==='purposeful'&&v183PaceReason(m,p,detail)==='press')return v183Param(m,'defence.pressPace');
 }
 return v183DefBasePaceFactor(m,p,purpose,detail);
};

// ----- Clearance under pressure and block direction -----
// context.kind 'header' (default, air duel) or 'block' (reserved, no caller yet); context.evaluate: the
// deterministic centre and the chance of going out (outChance), no draw.
const v183DefBaseClearance=v183Clearance;
v183Clearance=function(m,defender,point,context={}){
 if(!v183DefOn(m))return v183DefBaseClearance(m,defender,point,context);
 const block=context.kind==='block',air=Number.isFinite(context.air)?context.air:ability(defender,'air'),own=context.ownBox!==undefined?Boolean(context.ownBox):Boolean(m.geometry&&v160PenaltyContains(defender,defender.t,m));
 const pressure=Number.isFinite(context.pressure)?context.pressure:m.people.filter(q=>q.t!==defender.t&&!q.keeper&&v122Metres(q,defender)<2).length,calm=v183Mental(defender,'calm'),s=v150Scale(m),dir=defender.t===0?-1:1;
 const draw=context.evaluate?.5:Number.isFinite(context.lateralDraw)?context.lateralDraw:random(),forward=block?3+air*.1:7+air*.20,lateral=(draw-.5)*6;
 const centre={x:clamp(point.x+lateral/s.x,.07,.93),y:clamp(point.y+dir*forward/s.y,.07,.93)};
 const chance=clamp(block?v183Param(m,'defence.blockOutBase')+(own?v183Param(m,'defence.blockOutBox'):0):(v183Param(m,'defence.clearOutBase')+v183Param(m,'defence.clearOutPressure')*Math.min(2,pressure)+(own?v183Param(m,'defence.clearOutBox'):0))*(1-v183Param(m,'defence.clearCalm')*(calm-10)),0,block?.8:v183Param(m,'defence.clearOutMax'));
 if(context.evaluate)return {target:centre,out:false,outChance:chance};
 if(!(chance>0&&random()<chance))return {target:centre,out:false};
 // Out: over the own goal line beside the post when inside the own box (a corner),
 // otherwise over the touchline on the side of the lateral draw.
 const side=draw<.5?-1:1,goalLine=defender.t===0?v55Field.bottom:v55Field.top,halfGoal=(m.geometry?.goalWidth||9.7)/2;
 if(own&&Math.abs(point.y-goalLine)*s.y<=22&&random()<.6){
  const x=.5+side*Math.max(Math.abs(point.x-.5)*s.x+3,halfGoal+3)/s.x;
  return {target:{x:clamp(x,v55Field.left+1/s.x,v55Field.right-1/s.x),y:goalLine-dir*2.5/s.y},out:true};
 }
 return {target:{x:side<0?v55Field.left-2.5/s.x:v55Field.right+2.5/s.x,y:centre.y},out:true};
};
// Draw offset and spread of a block deflection for v50Deflect (set-pieces-v50.js:215).
// A better 'pos' steers the ball away from the own goal line. Unmarked matches and an
// inactive package keep the legacy constants .3 and .3.
function v183BlockAim(m,defender){
 if(!v183DefOn(m))return {bias:.3,spread:.3};
 return {bias:v183Param(m,'defence.blockBias')+(ability(defender,'pos')-10)*v183Param(m,'defence.blockSkill'),spread:v183Param(m,'defence.blockSpread')};
}

v183EnableByDefault('defence');
