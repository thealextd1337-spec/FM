'use strict';

// Player intelligence 183, package SI-0: clock contract and stoppages.
// New logic only for v183Active(m,'clock'); every other match, and every
// context without the SI modules, keeps the rules 182 exactly.
//
// Clock contract. m.elapsed counts clock units; a match with the clock package
// advances them at match.si.clockRate units per real second (v183Rate). The old
// engine files convert with the inline expressions
//   rate of m:                 (m.si?v183Rate(m):MATCH_SPEED)
//   legacy interval x (units): (m.si?x*(v183Rate(m)/MATCH_SPEED):x)
// which need nothing beyond MATCH_SPEED in contexts without the SI modules and
// give exactly MATCH_SPEED and x for every other match. Everything physical
// (flights, loose-ball rolling, goalkeeper reaction, slides, positioning
// samples) converts clock units and seconds with the rate; every interval
// written in clock units (the 0.75 pause after a reception, 0.55 after a loose
// ball, 0.7 after a duel, recovery times, the 0.16 loose-ball lock, the floors
// of flight times, the 5-unit assist window) keeps the real-time length it has at
// the 182 rate MATCH_SPEED. Arguments of fly() are such legacy intervals; the
// floor and the physical minimum are combined in v115FlightDuration. The rate
// therefore changes only the display minutes per real second: movement,
// decisions and stoppages run in real time, and a match lasts about
// clock end / rate + stoppage. Stoppage compensation stays in display minutes
// (5 per half at most, v74), the attack extensions are 20 s of real time.
//
// Stoppages (parameters below, in seconds):
//  - Free kick and offside restarts set their formation at once ("teleport",
//    no hiding needed). A foul locks only the two players involved, for
//    foulLock seconds; the lock does not count towards the waiting time and the
//    formation completes when it ends. The foul scene lasts freeKickScene
//    seconds, so a free kick takes freeKickScene + 0.25 + 0.5 = 2.95 s.
//  - After a goal the players walk towards the kickoff formation during the goal
//    scene and the following banner (kickoffAdvance); the fixed two-second
//    countdown of the kickoff then drops, only the remaining walk is waited for.
//    The team that kicks off walks at once. The scoring team celebrates where it
//    stands and starts kickoffWalkLead seconds before the end of the goal scene
//    (the views celebrate only while a player stands still; the three.js
//    celebration follows that rule too). A lead of 1.5 s keeps the kickoff at least
//    2 s shorter than without the advance; with 0 s the farthest scorer limits
//    the gain to about 1 s.
//  - Weight of an intense duel in the freshness model (v158): the event count
//    follows real time, the 90 virtual minutes do not, so the weight scales with
//    rate / MATCH_SPEED and a full match keeps its freshness reference.
//
// No random draws. State: only the stored rate and plain fields of the existing
// restart objects (setPiece.wait, countdown); the advance is stateless and
// recomputed from player positions each tick, so a restore needs nothing.
v183RegisterDefaults('clock',{teleport:true,freeKickScene:2.2,foulLock:1.8,kickoffAdvance:true,kickoffWalkLead:1.5});

// Package parameter for matches running the clock package, else the legacy value.
function v183ClockParam(m,key,legacy){return v183Active(m,'clock')?v183Param(m,'clock.'+key):legacy;}
// Weight of one intense-duel load event (see above); exactly 1 at the 182 rate.
function v183ClockLoadUnits(m){return v183Active(m,'clock')?v183Rate(m)/MATCH_SPEED:1;}

// Kickoff formation walk during the goal scene: the destinations of the kickoff
// formation (set-pieces-v50.js, kickoff; game.js, kickoff) are derived from the
// team that kicks off (m.pendingKickoff): base positions on the own half, the
// players of the receiving team pushed out of the centre circle, kicker and
// support on the centre line. Players walk there at the restart speed of 6 m/s.
// The kickoff itself still places everybody and waits for any residual walk.
function v183ClockKickoffTargets(m){
 const team=m.pendingKickoff,targets=new Map();
 for(const p of m.people){
  let y=p.by;
  if(!p.keeper){y=p.t===0?Math.max(p.by,.56):Math.min(p.by,.44);if(p.t!==team&&Math.hypot(p.bx-.5,y-.5)<.15)y=p.t===0?.65:.35;}
  targets.set(p,{x:p.bx,y});
 }
 const field=m.people.filter(p=>!p.keeper&&p.t===team),att=p=>(p.assignedLine||p.line)==='att'?0:1,centre=p=>Math.abs(targets.get(p).x-.5);
 const kicker=[...field].sort((a,b)=>att(a)-att(b)||centre(a)-centre(b))[0],support=field.filter(p=>p!==kicker).sort((a,b)=>centre(a)-centre(b))[0];
 if(kicker)targets.set(kicker,{x:.5,y:.5+(team===0?1:-1)*.65*(v55Field.bottom-v55Field.top)/v160PitchLength()});
 if(support)targets.set(support,{x:.5,y:team===0?.60:.40});
 // The kickoff keeps a clearance between the players (v119SpaceKickoff); the real rule runs on a copy.
 if(kicker&&support&&typeof v119SpaceKickoff==='function'){
  const copies=new Map(m.people.map(p=>[p,{x:targets.get(p).x,y:targets.get(p).y,tx:0,ty:0,t:p.t,keeper:p.keeper}]));
  v119SpaceKickoff({people:[...copies.values()],kickoff:{t:team,kicker:copies.get(kicker),support:copies.get(support)}});
  for(const [p,copy]of copies)targets.set(p,{x:copy.x,y:copy.y});
 }
 return targets;
}
function v183ClockKickoffAdvance(m,realDelta){
 if(typeof v65WorldActive==='undefined'||!v65WorldActive||m.pendingKickoff==null||m.finished||!(m.goalPause>0||m.postBanner?.kind==='goal'))return;
 // The scoring team celebrates where it stands (the views celebrate only while a player stands still)
 // and starts to walk kickoffWalkLead seconds before the end of the goal scene; the team that kicks
 // off walks at once.
 const celebrating=m.goalPause>v183ClockParam(m,'kickoffWalkLead',0)?1-m.pendingKickoff:null,width=v160PitchWidth()/(v55Field.right-v55Field.left),length=v160PitchLength()/(v55Field.bottom-v55Field.top);
 for(const [p,target]of v183ClockKickoffTargets(m)){
  if(p.t===celebrating)continue;
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx*width,dy*length);
  if(d<.001)continue;
  const q=Math.min(1,6*Math.max(0,realDelta)/d);
  p.x+=dx*q;p.y+=dy*q;p.tx=p.x;p.ty=p.y;
 }
}
const v183ClockBaseStep=step;
step=function(delta,realDelta){
 const m=match;
 if(m?.si&&v183ClockParam(m,'kickoffAdvance',false)===true)v183ClockKickoffAdvance(m,realDelta);
 return v183ClockBaseStep(delta,realDelta);
};

v183EnableByDefault('clock');
