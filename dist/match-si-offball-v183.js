'use strict';

// Player intelligence 183, package SI-2: off-ball movement, patterns and pace.
// New logic only for v183Active(m,'offball'); unmarked and 182 matches, and
// marked matches with the package off, run the wrapped previous functions
// unchanged. Wrapped here (plan 8.3): v159Offers (offers for every team-mate
// without a cover duty, box occupation, one-two, overlap, counter),
// v121RunnerTarget (follow-up runs behind an own shot), v183ReboundFinish
// (direct finish after a parry or block), v183PaceFactor (carrier and runner
// pace). v162RecoverTarget, v182LooseChasers and v154RoleTarget keep their
// previous behaviour. v183Offers keeps the foundation stub: a read-only copy
// of attackFlow.intents, whose entries now carry `cat`, `pattern` and `value`.
// Every run state is plain data in attackFlow.intents and attackFlow.offball
// and therefore part of each checkpoint; nothing lives in a WeakMap. Deadlines
// are real seconds (v183Seconds); SI-0 binds the intent clock (v152Seconds) to
// the same stored rate, and clock units convert through v183Rate(m). This
// module draws no random number: choosing an offer or a pattern never consumes
// one. The only random effect is indirect: v183ReboundFinish lets the existing
// native one-touch try (with its own draw) start after more loose balls, in
// marked matches only. All calibration values are parameters (SI-K).

// ----- Parameters (defaults; stored with every new match) -----
// Pace factors multiply the base pace 3+spd*0.14 m/s; the carrier factor is
// multiplied by (0.78+tec*0.009) as before. Distances are metres, times real
// seconds. Category weights per tactical role (profiles) scale the positive
// part of an offer value; costs (run, crowding, formation leash, offside
// clamp, owner distance) are unweighted.
const V183_OFFBALL_CATEGORIES=Object.freeze(['depth','box','byline','overlap','wide','edge','support','hold']);
const V183_OFFBALL_PROFILES=Object.freeze({
 poacher:{depth:1.15,box:1.4,edge:.5,wide:.6,byline:.6,overlap:.5,support:.4,hold:.9},
 striker:{depth:1.3,box:1.2,edge:.6,wide:.8,byline:.8,overlap:.8,support:.5,hold:.85},
 'target-player':{depth:.9,box:1.2,edge:.8,wide:.5,byline:.4,overlap:.4,support:1.1,hold:1},
 winger:{depth:1,box:.9,edge:.4,wide:1.35,byline:1.4,overlap:1,support:.5,hold:.8},
 dribbler:{depth:1.1,box:.9,edge:.5,wide:1.1,byline:1.1,overlap:1,support:.7,hold:.8},
 playmaker:{depth:.8,box:.6,edge:1.2,wide:.6,byline:.4,overlap:.7,support:1.35,hold:1},
 'box-to-box':{depth:1.1,box:.9,edge:1.2,wide:.8,byline:.8,overlap:1.35,support:1,hold:.9},
 'ball-winner':{depth:.5,box:.4,edge:1.1,wide:.5,byline:.3,overlap:.4,support:1.3,hold:1.1},
 'ball-playing-defender':{depth:.4,box:.3,edge:.8,wide:.7,byline:.2,overlap:.3,support:1.3,hold:1.1},
 stopper:{depth:.3,box:.3,edge:.6,wide:.4,byline:.2,overlap:.2,support:1,hold:1.2},
 'cover-defender':{depth:.3,box:.3,edge:.6,wide:.4,byline:.2,overlap:.2,support:1,hold:1.2},
 att:{depth:1.3,box:1.2,edge:.6,wide:.8,byline:.8,overlap:.8,support:.5,hold:.85},
 mid:{depth:1.1,box:.9,edge:1.2,wide:.8,byline:.8,overlap:1.35,support:1,hold:.9},
 def:{depth:.4,box:.3,edge:.8,wide:.7,byline:.2,overlap:.3,support:1.3,hold:1.1}
});
v183RegisterDefaults('offball',{
 carrierPace:1.5,carrierClosePace:1.28,carrierCloseRadius:2.5,carrierBrakeLead:.25,runPace:1.58,
 offerCycle:1.05,crowdDelay:.45,crowdRadius:1.1,reachRadius:.65,recoverySeconds:.55,turnoverGap:2.5,
 depthRunners:2,leadBase:6.5,leadDeep:8,leadPos:.07,
 boxRange:30,wideBall:6,boxNear:[4,6],boxSpot:[0,11],boxFar:[-4,7],boxEdge:[0,18],boxTaken:2,boxGapWidth:12,boxGapRange:20,boxGapMin:5,boxWideBonus:3,
 bylineDepth:4,bylineRange:32,touchlineGap:3,wideAhead:4,wideAnchor:6,
 overlapMinWide:8,overlapOutside:3.5,overlapAhead:9,overlapRange:14,
 supportSide:6,supportBack:3,safetyBack:9,
 oneTwoSeconds:2.2,oneTwoOutside:2.2,oneTwoAhead:4.5,oneTwoPresser:6,oneTwoWindow:1.2,
 counterSeconds:3,counterLead:14,counterRunners:2,counterBonus:2,
 followers:2,followDepth:7,followSide:3.5,followRange:24,followReaction:.35,followReactionAnt:.015,followSeconds:2.5,
 reboundFinishRange:18,
 // Cross runners (B22): with the ball within crossRunRange of goal and wide
 // (crossRunWide m from the centre) or within crossRunDeep, a new offer cycle
 // starts at once and up to crossRunners team-mates without a cover duty (best
 // box profile and air) run to the box points (bonus crossRunBonus); a plain
 // follow run of theirs is released, a one-two is kept.
 crossRunRange:36,crossRunWide:7,crossRunDeep:30,crossRunners:2,crossRunBonus:6,
 zoneLeash:12,zoneLeashAtt:16,wZone:.25,
 wSpace:1,spaceCap:10,wLane:1.5,laneClearance:1.25,wProgress:.12,wRun:.08,wCrowd:1.5,crowdGap:5,crowdGapBox:3,wXg:3,xgRange:24,ownerNear:5,wOwnerNear:.6,ownerFar:26,wOwnerFar:.4,wOffside:.15,holdCost:.8,holdAgain:1,
 profiles:V183_OFFBALL_PROFILES
});

function v183OffballOn(m){return typeof v183Active==='function'&&v183Active(m,'offball');}
function v183OffballState(m){const flow=m.attackFlow;return flow.offball||(flow.offball={team:null,since:null,lastAt:null,counterTeam:null,counterUntil:null,oneTwoAt:null,follow:null});}
function v183OffballProfile(m,p){
 const profiles=v183Param(m,'offball.profiles'),role=p.tacticalRole,line=p.assignedLine||p.line;
 return profiles[role]||profiles[line]||profiles.mid;
}
// Trace hook for patterns (counter, follow, overlap, one-two, box); plain data
// in the transient decision trace only. Measurements may wrap this function.
function v183OffballPattern(m,kind,detail={}){return v183Trace(m,{kind:'pattern',pattern:kind,...detail});}

// ----- Possession bookkeeping and counter window (H10) -----
// A live turnover (the opponent held the ball less than turnoverGap seconds
// ago; restarts and keeper holds leave a longer gap) in the own half opens a
// counter window: two deep runners for counterSeconds, read by SI-1 through
// pattern 'counter' on their intents.
function v183OffballPossession(m,owner,now){
 const state=v183OffballState(m),P=key=>v183Param(m,'offball.'+key);
 if(state.team!==owner.t){
  const previous=state.team,live=previous===1-owner.t&&Number.isFinite(state.lastAt)&&now-state.lastAt<=P('turnoverGap');
  state.team=owner.t;state.since=now;delete m.attackFlow.crossRun;
  const s=v150Scale(m),ownGoal=owner.t===0?v55Field.bottom:v55Field.top,depth=Math.abs(owner.y-ownGoal)*s.y;
  if(live&&depth<v160PitchLength(m)*.5){state.counterTeam=owner.t;state.counterUntil=now+P('counterSeconds');v183LedgerSource(m,'counter');v183OffballPattern(m,'counter',{team:owner.t,owner});}
 }
 state.lastAt=now;
 return state.counterTeam===owner.t&&state.counterUntil>now;
}

// ----- One-two (H: Doppelpass) -----
// After a pass the passer already runs on (v152AfterPass/v159Follow). While the
// receiver controls the ball, that run is pointed past the rival who pressed
// the passer, so the return pass finds him behind the defender. The intent keeps
// type 'follow' (run pace) and is tagged pattern 'one-two'; the first pass of a
// confirmed one-two is tagged in the ledger.
function v183OffballOneTwo(m,owner,rivals,now){
 const flow=m.attackFlow,combo=flow.combination,P=key=>v183Param(m,'offball.'+key);
 if(!combo||combo.team!==owner.t||combo.receiverId!==owner.pid||!Number.isFinite(combo.releaseAt))return;
 const passer=m.people.find(p=>p.pid===combo.passerId),intent=passer&&flow.intents[passer.pid];
 if(!passer||passer.keeper||passer.slideActive||!intent||intent.type!=='follow')return;
 const state=v183OffballState(m);
 if(intent.pattern!=='one-two'&&now-combo.releaseAt<=P('oneTwoWindow')){
  const s=v150Scale(m),dir=owner.t===0?-1:1,side=passer.x<owner.x?-1:1;
  const presser=rivals.filter(r=>!r.slideActive&&v122Metres(r,passer)<P('oneTwoPresser')).sort((a,b)=>v122Metres(a,passer)-v122Metres(b,passer)||a.n-b.n)[0];
  const base=presser||passer,point=v159Point({x:base.x+side*P('oneTwoOutside')/s.x,y:base.y+dir*P('oneTwoAhead')/s.y},s);
  const ahead=passer.y+dir*(P('oneTwoAhead')+1.5)/s.y;point.y=dir<0?Math.min(point.y,ahead):Math.max(point.y,ahead);
  const until=Math.max(intent.until,now+P('oneTwoSeconds'));
  flow.intents[passer.pid]={...intent,x:point.x,y:point.y,type:'follow',team:passer.t,at:now,until,cat:'one-two',pattern:'one-two'};
  state.oneTwo={releaseAt:combo.releaseAt,passerId:passer.pid,x:point.x,y:point.y,until};
  v183OffballPattern(m,'one-two',{passer,receiver:owner,presser:presser||null});
 }
 if(combo.confirmed&&flow.intents[passer.pid]?.pattern==='one-two'&&state.oneTwoAt!==combo.releaseAt){state.oneTwoAt=combo.releaseAt;v183LedgerSource(m,'one-two');}
}
// v157Prepare rewrites the passer's follow intent every tick of a confirmed
// combination; the one-two point is restored per tick from plain state.
function v183OffballOneTwoKeep(m,p){
 const flow=m.attackFlow,o=flow.offball?.oneTwo,combo=flow.combination,intent=flow.intents[p.pid];
 if(!o||o.passerId!==p.pid||!combo||combo.passerId!==p.pid||combo.releaseAt!==o.releaseAt||v183Seconds(m)>o.until||!intent||intent.type!=='follow'||intent.pattern==='one-two')return;
 flow.intents[p.pid]={...intent,x:o.x,y:o.y,until:Math.max(intent.until,o.until),cat:'one-two',pattern:'one-two'};
}

// ----- Offers for every team-mate without a cover duty -----
// Candidate points per player (metres, converted with the pitch scale): runs
// ahead of the ball (depth), box points when the ball is near the goal (near
// post, penalty spot, far post) and the edge of the box (second ball), width on
// the player's side, the byline on the ball side, an overlap outside a wide
// carrier, support stations beside/behind the ball and holding the current
// spot. Value = role weight * (space + open lane + progress + shot value)
// - run - crowding - formation leash - owner distance - offside clamp.
function v183OffballCandidates(m,p,ctx){
 const {owner,s,dir,goal,ballSide,ballRange,wide,counter,recovering,cover,P}=ctx,out=[],side=p.bx<.5?-1:1,line=p.assignedLine||p.line;
 const rel=(base,lateral,ahead)=>v159Point({x:base.x+lateral/s.x,y:base.y+dir*ahead/s.y},s),g=(lateral,depth)=>v159Point({x:.5+lateral/s.x,y:goal.y-dir*depth/s.y},s);
 const push=(cat,point,pattern=null)=>out.push({cat,pattern,x:point.x,y:point.y});
 const runner=!cover&&!recovering&&p.tacticalRole!=='target-player';
 if(runner){
  const lead=counter?P('counterLead'):(hasInstruction(p,'deep')?P('leadDeep'):P('leadBase'))+ability(p,'pos')*P('leadPos'),pattern=counter?'counter':null;
  // A counter runner already ahead of the ball runs on from his own position.
  const baseY=counter?(dir<0?Math.min(owner.y,p.y+(lead-5)/s.y):Math.max(owner.y,p.y-(lead-5)/s.y)):owner.y;
  push('depth',rel({x:p.x,y:baseY},side*3.5,lead),pattern);push('depth',rel({x:owner.x,y:baseY},side*7,lead),pattern);push('depth',rel({x:p.x,y:baseY},-side*3.5,lead+1),pattern);
 }
 if(!cover&&ballRange<P('boxRange')){
  const near=P('boxNear'),spot=P('boxSpot'),far=P('boxFar');
  push('box',g(ballSide*near[0],near[1]),'box');push('box',g(spot[0],spot[1]),'box');push('box',g(-ballSide*Math.abs(far[0]),far[1]),'box');
  // The widest gap between defenders inside the box width, at penalty-spot depth.
  const width=P('boxGapWidth'),xs=[-width,...ctx.rivals.filter(r=>v115GoalDistance({...r,t:p.t})<P('boxGapRange')).map(r=>(r.x-.5)*s.x).filter(x=>Math.abs(x)<width).sort((a,b)=>a-b),width];
  let gap=0,at=0;for(let i=1;i<xs.length;i++)if(xs[i]-xs[i-1]>gap){gap=xs[i]-xs[i-1];at=(xs[i]+xs[i-1])/2;}
  if(gap>=P('boxGapMin'))push('box',g(at,spot[1]-1),'box');
 }
 if(ballRange<P('boxRange')&&line!=='def'){const edge=P('boxEdge');push('edge',g(edge[0],edge[1]));}
 if(!cover&&!recovering&&(Math.abs(p.bx-.5)*s.x>P('wideAnchor')||['winger','dribbler'].includes(p.tacticalRole))){
  const wx=side<0?v55Field.left+P('touchlineGap')/s.x:v55Field.right-P('touchlineGap')/s.x;
  push('wide',v159Point({x:wx,y:owner.y+dir*P('wideAhead')/s.y},s));
  if(wide&&side===ballSide&&ballRange<P('bylineRange'))push('byline',v159Point({x:wx,y:goal.y-dir*P('bylineDepth')/s.y},s));
 }
 if(!cover&&!recovering&&Math.abs(owner.x-.5)*s.x>P('overlapMinWide')&&v122Metres(p,owner)<P('overlapRange')&&(p.y-owner.y)*dir*s.y<2)push('overlap',rel(owner,ballSide*P('overlapOutside'),P('overlapAhead')),'overlap');
 push('support',rel(owner,P('supportSide'),-P('supportBack')));push('support',rel(owner,-P('supportSide'),-P('supportBack')));push('support',rel(owner,0,-P('safetyBack')));
 push('hold',{x:p.x,y:p.y});
 return out;
}
function v183OffballValue(m,p,c,ctx){
 const {owner,rivals,s,dir,occupied,zone,profile,limit,P}=ctx,point={x:c.x,y:c.y};
 let clamped=0;
 if(limit!=null){const over=(p.t===0?limit-point.y:point.y-limit)*s.y;if(over>0){clamped=over;point.y=limit;}}
 const space=Math.min(P('spaceCap'),...rivals.map(r=>v122Metres(r,point))),lane=v157Lane(m,owner,point,rivals,P('laneClearance')),progress=(point.y-p.y)*dir*s.y,run=v122Metres(p,point);
 const xg=v115GoalDistance({...point,t:p.t})<P('xgRange')?v183ShotEstimate(m,p,point).xg:0;
 const crowdGap=c.cat==='box'?P('crowdGapBox'):P('crowdGap'),crowd=occupied.reduce((n,o)=>n+Math.max(0,crowdGap-v122Metres(o,point)),0),zoneGap=Math.max(0,v122Metres(zone,point)-((p.assignedLine||p.line)==='att'?P('zoneLeashAtt'):P('zoneLeash')));
 const od=v122Metres(owner,point),ownerCost=(od<P('ownerNear')?(P('ownerNear')-od)*P('wOwnerNear'):0)+(od>P('ownerFar')?(od-P('ownerFar'))*P('wOwnerFar'):0);
 const weight=profile[c.cat]??1,gain=P('wSpace')*space+(lane?P('wLane'):0)+P('wProgress')*Math.max(0,progress)+P('wXg')*xg;
 const again=c.cat==='hold'?P('holdCost')+(ctx.lastCats?.[p.pid]==='hold'?P('holdAgain'):0):0;
 const bonus=(c.pattern==='counter'?P('counterBonus'):0)+(c.cat==='box'&&ctx.wide?P('boxWideBonus'):0)+(c.cat==='box'&&ctx.crossRunner?P('crossRunBonus'):0);
 // Cover players (defensive line, ball-winner, ball-playing defender) never leave their formation zone by more than the leash.
 const leash=ctx.cover&&zoneGap>0&&c.cat!=='hold'?1e3:0;
 const value=weight*gain+P('wProgress')*Math.min(0,progress)-P('wRun')*run-P('wCrowd')*crowd-P('wZone')*zoneGap-ownerCost-P('wOffside')*clamped-again-leash+bonus;
 return {...c,x:point.x,y:point.y,raw:{x:c.x,y:c.y},value,clamped};
}
function v183OffballOffers(m,owner,allies,rivals){
 const flow=m.attackFlow,now=v183Seconds(m),s=v150Scale(m),dir=owner.t===0?-1:1,P=key=>v183Param(m,'offball.'+key);
 const counter=v183OffballPossession(m,owner,now),state0=v183OffballState(m);
 const crossZone=v115GoalDistance(owner)<P('crossRunRange')&&(Math.abs(owner.x-.5)*s.x>P('crossRunWide')||v115GoalDistance(owner)<P('crossRunDeep'));
 // Entering the cross zone starts a new cycle at once (box runners below).
 const entered=crossZone&&state0.crossZoneOwner!==owner.pid;if(entered)state0.crossZoneOwner=owner.pid;else if(!crossZone&&state0.crossZoneOwner===owner.pid)state0.crossZoneOwner=null;
 const valid=flow.offerOwner===owner.pid&&flow.offerUntil>now&&!entered;
 if(valid){
  const offers=Object.entries(flow.intents).filter(([,i])=>i.type!=='follow');
  const crowded=offers.some(([pid,i])=>now>(i.at||0)+P('crowdDelay')&&rivals.some(r=>v122Metres(r,i)<P('crowdRadius'))&&v122Metres(m.people.find(p=>p.pid===pid)||i,i)>1.5);
  const moving=offers.filter(([,i])=>i.cat!=='hold'),reached=moving.length&&moving.every(([pid,i])=>v122Metres(m.people.find(p=>p.pid===pid)||i,i)<P('reachRadius'));
  v183OffballOneTwo(m,owner,rivals,now);
  if(!crowded&&!reached)return true;
 }
 // Runners of the previous cycle rest briefly (support offers only) before a
 // new deep run; a commitment is kept until reached, crowded or timed out.
 const recovery=flow.paceRecovery||(flow.paceRecovery={});
 for(const id of Object.keys(recovery))if(recovery[id]<=now||!m.people.some(p=>p.pid===id))delete recovery[id];
 for(const id of flow.paceOffers||[])if(id!==owner.pid&&flow.intents[id]?.type==='depth')recovery[id]=now+P('recoverySeconds');
 flow.offerOwner=owner.pid;flow.offerUntil=now+P('offerCycle');
 flow.intents=Object.fromEntries(Object.entries(flow.intents).filter(([pid,i])=>(i.type==='follow'||i.pattern==='follow'||i.pattern==='cross-run')&&i.until>now&&m.people.some(p=>p.pid===pid&&!p.slideActive)));
 v183OffballOneTwo(m,owner,rivals,now);
 const goal={x:.5,y:owner.t===0?v55Field.top:v55Field.bottom},ballRange=v115GoalDistance(owner),wide=Math.abs(owner.x-.5)*s.x>P('wideBall'),ballSide=owner.x<.5?-1:1;
 const plans=v121PositioningPlans.get(m),occupied=Object.values(flow.intents).map(i=>({x:i.x,y:i.y})),state=v183OffballState(m),lastCats=state.lastCats||{};
 // Cross runners: released from a plain follow run, chosen by box profile and air.
 const crossRunners=crossZone?allies.filter(p=>p.role>=0&&!v115RestartLocked(m,p)&&!p.interceptTarget&&!(v159Cover(p)||(p.assignedLine||p.line)==='def')&&(!flow.intents[p.pid]||flow.intents[p.pid].type==='follow'&&flow.intents[p.pid].pattern!=='one-two'&&flow.intents[p.pid].pattern!=='cross-run')).sort((a,b)=>v183OffballProfile(m,b).box*(1+ability(b,'air')*.05)-v115GoalDistance(b)*.02-(v183OffballProfile(m,a).box*(1+ability(a,'air')*.05)-v115GoalDistance(a)*.02)||a.n-b.n).slice(0,P('crossRunners')):[];
 for(const p of crossRunners)delete flow.intents[p.pid];
 const candidates=allies.filter(p=>p.role>=0&&!flow.intents[p.pid]&&!v115RestartLocked(m,p)&&!p.interceptTarget&&((p.assignedLine||p.line)!=='def'||p.role>0));
 const counterRunners=counter?[...candidates].filter(p=>!(v159Cover(p)||(p.assignedLine||p.line)==='def')).sort((a,b)=>ability(b,'spd')-ability(a,'spd')||a.n-b.n).slice(0,P('counterRunners')):[];
 candidates.sort((a,b)=>(counterRunners.includes(b)?8:0)+(crossRunners.includes(b)?6:0)+(hasInstruction(b,'deep')?4:0)+((b.assignedLine||b.line)==='att'?2:0)+b.role*.4-((counterRunners.includes(a)?8:0)+(crossRunners.includes(a)?6:0)+(hasInstruction(a,'deep')?4:0)+((a.assignedLine||a.line)==='att'?2:0)+a.role*.4)||a.n-b.n);
 let ahead=0;const boxTaken=[];
 for(const p of candidates){
  const cover=v159Cover(p)||(p.assignedLine||p.line)==='def',recovering=recovery[p.pid]>now,profile=v183OffballProfile(m,p),zone=v162Zone(m,p),limit=plans?.get(p)?.limit;
  const ctx={owner,rivals,s,dir,goal,ballSide,ballRange,wide,counter:counterRunners.includes(p),crossRunner:crossRunners.includes(p),recovering,cover,occupied,zone,profile,limit,lastCats,P};
  const options=v183OffballCandidates(m,p,ctx).filter(c=>!(c.cat==='depth'&&ahead>=P('depthRunners'))&&!(c.cat==='box'&&boxTaken.some(b=>v122Metres(b,c)<P('boxTaken')))).map(c=>v183OffballValue(m,p,c,ctx)).sort((a,b)=>b.value-a.value||V183_OFFBALL_CATEGORIES.indexOf(a.cat)-V183_OFFBALL_CATEGORIES.indexOf(b.cat));
  const best=options[0];if(!best)continue;
  const type=cover||p.tacticalRole==='target-player'||['support','hold','edge'].includes(best.cat)?'support':'depth';
  flow.intents[p.pid]={x:best.x,y:best.y,type,team:p.t,at:now,until:flow.offerUntil,cat:best.cat,pattern:best.pattern,value:+best.value.toFixed(3)};
  occupied.push({x:best.x,y:best.y});if(best.cat==='depth')ahead++;if(best.cat==='box')boxTaken.push(best.raw);
  if(best.pattern==='overlap')v183OffballPattern(m,'overlap',{runner:p,owner});
 }
 if(boxTaken.length)v183OffballPattern(m,'box',{owner,count:boxTaken.length,wide,crossRunners:crossRunners.map(p=>p.pid)});
 state.lastCats=Object.fromEntries(Object.entries(flow.intents).map(([pid,i])=>[pid,i.cat||i.type]));
 flow.paceOffers=Object.entries(flow.intents).filter(([,i])=>i.type!=='follow').map(([id])=>id);
 v183Trace(m,{kind:'offers',owner,count:Object.keys(flow.intents).length,cats:Object.values(flow.intents).map(i=>i.cat||i.type),counter});
 return true;
}
const v183OffballBaseOffers=v159Offers;
v159Offers=function(m,owner,allies,rivals){
 if(!v183OffballOn(m)||!v159Active(m))return v183OffballBaseOffers.call(this,m,owner,allies,rivals);
 return v183OffballOffers(m,owner,allies,rivals);
};

// ----- Follow-up runs behind an own shot (H7, Nachsetzen) -----
// While an own shot flies, up to `followers` team-mates with the highest
// follow weight (role and anticipation) near the goal run into the rebound
// zone: followDepth metres in front of the goal, beside the likely parry side
// (the side of the shot's goal point relative to the keeper) and on the other
// side. The run starts after a reaction of followReaction - followReactionAnt
// per anticipation point above 10; it is a plain 'depth' intent (pattern
// 'follow') that survives the parry, so the follower is the nearest chaser.
function v183OffballFollow(m,p){
 const f=m.flight;if(!f||p.keeper||p.slideActive||p.interceptTarget||p.role<0||v121PositioningPaused(m)||f.team!==p.t)return false;
 const meta=typeof v102Flights!=='undefined'?v102Flights.get(f):null,visual=typeof v99Flights!=='undefined'?v99Flights.get(f):null;
 if(!(meta?.shot||visual?.kind==='shot'))return false;
 const shooter=meta?.person||visual?.shooter;if(shooter===p)return false;
 const flow=m.attackFlow,state=v183OffballState(m),now=v183Seconds(m),P=key=>v183Param(m,'offball.'+key),eventId=m.ballEventId??null;
 if(!state.follow||state.follow.eventId!==eventId||state.follow.team!==p.t){
  const s=v150Scale(m),dir=p.t===0?-1:1,goal={x:.5,y:p.t===0?v55Field.top:v55Field.bottom},keeper=m.people.find(q=>q.keeper&&q.t!==p.t),contactX=f.target?.x??goal.x,side=contactX>=(keeper?.x??.5)?1:-1;
  const a=v159Point({x:contactX+side*P('followSide')/s.x,y:goal.y-dir*P('followDepth')/s.y},s),b=v159Point({x:.5-side*(P('followSide')-.5)/s.x,y:goal.y-dir*(P('followDepth')+1)/s.y},s);
  const ranked=m.people.filter(q=>q.t===p.t&&!q.keeper&&!q.slideActive&&q!==shooter&&q.role>=0&&!v159Cover(q)&&v115GoalDistance(q)<P('followRange'))
   .map(q=>({q,score:v183Personality(q).followWeight/(1+Math.min(v122Metres(q,a),v122Metres(q,b))/10)})).sort((x,y)=>y.score-x.score||x.q.n-y.q.n).slice(0,P('followers')).map(x=>x.q);
  const first=ranked.sort((x,y)=>v122Metres(x,a)-v122Metres(y,a)||x.n-y.n);
  state.follow={eventId,team:p.t,releaseAt:now-f.progress*f.duration/v183Rate(m),pids:first.map(q=>q.pid),points:first.map((q,i)=>i===0?{x:a.x,y:a.y}:{x:b.x,y:b.y})};
  if(first.length)v183OffballPattern(m,'follow',{shooter,followers:first.map(q=>q.pid)});
 }
 const index=state.follow.pids.indexOf(p.pid);if(index<0)return false;
 const reaction=clamp(P('followReaction')-P('followReactionAnt')*(v183Mental(p,'ant')-10),.1,.6);
 if(now-state.follow.releaseAt<reaction)return false;
 const point=state.follow.points[index];
 flow.intents[p.pid]={x:point.x,y:point.y,type:'depth',team:p.t,at:now,until:now+P('followSeconds'),cat:'follow',pattern:'follow'};
 p.tx=point.x;p.ty=point.y;return true;
}
// ----- Cross into space (B22): the signalled runner -----
// SI-1 writes attackFlow.crossRun {crosserId,runnerId,x,y,at,kickAt,until,
// kicked} when the carrier commits to a cross into space (SI-7 completes it at
// the kick and removes it at the landing). From the signal on, the runner's
// intent points at the space spot (pattern 'cross-run', run pace) every tick
// while the crosser still holds the ball or the cross is in the air. Until the
// kick the onside clamp below holds him at the line; during the flight it is
// released, because the offside snapshot of the kick already governs him and
// the aerial plan sends him to the spot. Plain data only, no random draw.
function v183OffballCrossRun(m,p){
 const flow=m.attackFlow,run=flow.crossRun;if(!run||run.runnerId!==p.pid||p.keeper||p.slideActive||p.role<0)return;
 const now=v183Seconds(m);if(now>run.until)return;
 const crosser=m.people.find(q=>q.pid===run.crosserId);
 if(!crosser||crosser.t!==p.t||!(run.kicked?m.flight&&m.flight.team===p.t:m.owner===crosser))return;
 const intent=flow.intents[p.pid];
 if(intent?.pattern==='cross-run'&&intent.x===run.x&&intent.y===run.y&&intent.until>=run.until)return;
 const type=p.tacticalRole==='target-player'?'support':'depth';
 flow.intents[p.pid]={x:run.x,y:run.y,type,team:p.t,at:now,until:run.until,cat:'box',pattern:'cross-run'};
 if(!run.signalled){run.signalled=true;v183OffballPattern(m,'cross-run',{crosser,runner:p,lead:+Math.max(0,run.kickAt-run.at).toFixed(2),kicked:Boolean(run.kicked)});}
}
// Offers stay onside: a stored offer point (hold, box, run) is pulled back to
// the predicted offside limit every tick, also while the ball is in flight to
// a team-mate, so an idle runner never waits in an offside position. Follow-up
// runs after a shot are exempt (no offside after a parry), and the signalled
// runner of a cross into space while that cross is in the air (B22).
function v183OffballKeepOnside(m,p){
 const intent=m.attackFlow.intents[p.pid];if(!intent||intent.pattern==='follow'||intent.team!==p.t)return;
 if(intent.pattern==='cross-run'&&m.flight&&m.attackFlow.crossRun?.kicked&&m.attackFlow.crossRun.runnerId===p.pid)return;
 const limit=v121PositioningPlans.get(m)?.get(p)?.limit;if(limit==null)return;
 if(p.t===0?intent.y<limit:intent.y>limit)m.attackFlow.intents[p.pid]={...intent,y:limit};
}
// Hooked into v121RunnerTarget (called for every player each tick, before
// v157Target applies intents), so a follower with a still valid offer intent is
// re-pointed as well. v162RecoverTarget keeps the previous zone behaviour.
const v183OffballBaseRunner=v121RunnerTarget;
v121RunnerTarget=function(current,person){
 const value=v183OffballBaseRunner.call(this,current,person);
 if(v183OffballOn(current)&&v162Active(current)){v183OffballOneTwoKeep(current,person);v183OffballCrossRun(current,person);v183OffballKeepOnside(current,person);v183OffballFollow(current,person);}
 return value;
};

// ----- Direct finish after a parry or block (switch world-ball-motion-v110.js:76) -----
// A field player who wins a loose ball that stems from a shot (ledger parent
// chain: parry, block, post) within reboundFinishRange of the goal tries the
// native one-touch finish when the shot estimate shows a window, not only with
// an open goal. The try itself keeps its own skill draw and may still pass or
// control. Source tag 'rebound' on the loose-ball event.
function v183OffballFromShot(m){
 const ledger=typeof v117Ledger==='function'?v117Ledger(m):null;if(!ledger)return false;
 let e=ledger.events.find(x=>x.id===m.ballEventId);
 for(let i=0;i<4&&e;i++){if(e.kind==='shot'||e.shot===true)return true;e=ledger.events.find(x=>x.id===e.parentId);}
 return false;
}
const v183OffballBaseRebound=v183ReboundFinish;
v183ReboundFinish=function(m,winner,point){
 if(!v183OffballOn(m))return v183OffballBaseRebound.call(this,m,winner,point);
 const open=v131OpenGoal(winner,point);if(open)return open;
 if(v115GoalDistance(winner)>v183Param(m,'offball.reboundFinishRange')||!v183OffballFromShot(m))return null;
 const estimate=v183ShotEstimate(m,winner,point);if(!estimate.window)return null;
 v183LedgerSource(m,'rebound');v183Trace(m,{kind:'rebound-finish',player:winner,xg:estimate.xg});
 return {target:estimate.aim,range:v115GoalDistance(winner),rebound:true,xg:estimate.xg};
};

// ----- Pace (switch v157Pace, world-offensive-quality-v157.js:42) -----
// Carrier: carrierPace (1.5), or carrierClosePace (1.28, the previous duel
// pace) while a rival stands within carrierCloseRadius (situational choice,
// B02 native part); both times (0.78+tec*0.009) as before. Own runs (intent
// depth/follow): runPace. Pressing, support and base factors stay with the
// previous function (SI-4). Load order: this module is the outermost wrapper
// of v183PaceFactor and returns for carrier/run before SI-4 sees the call.
const v183OffballBasePace=v183PaceFactor;
v183PaceFactor=function(m,p,purpose,detail={}){
 if(!v183OffballOn(m))return v183OffballBasePace.call(this,m,p,purpose,detail);
 if(purpose==='carrier'){
  const radius=v183Param(m,'offball.carrierCloseRadius'),close=m.people.some(q=>q.t!==p.t&&!q.keeper&&!q.slideActive&&v122Metres(q,p)<radius);
  return v183Param(m,close?'offball.carrierClosePace':'offball.carrierPace')*(.78+ability(p,'tec')*.009);
 }
 if(purpose==='purposeful'){const reason=v183PaceReason(m,p,detail);if(reason==='run'||reason==='follow')return v183Param(m,'offball.runPace');}
 return v183OffballBasePace.call(this,m,p,purpose,detail);
};

// ----- Carrier target beyond the braking distance (SI-K) -----
// v159CarrierTarget puts the carry target 2 m ahead of the carrier, and
// v157Move caps the wanted speed at sqrt(2*brake*(d-0.05)): about 7.1 m/s for
// that distance, so carrier paces above it (fast carriers, SI-5 on the large
// pitch) never showed. With carrierBrakeLead > 0 the carry target lies that
// many metres beyond the braking distance of the carrier's wanted pace, never
// closer than before. The first-touch branch (receipt, 1.4 m) is unchanged;
// 0 keeps the legacy 2 m. Reads state only; no random draw.
const v183OffballBaseCarrierTarget=v159CarrierTarget;
v159CarrierTarget=function(m,p){
 const value=v183OffballBaseCarrierTarget.apply(this,arguments);
 if(!value||!v183OffballOn(m))return value;
 const margin=v183Param(m,'offball.carrierBrakeLead'),receipt=m.attackFlow.receipt,now=v152Seconds(m);
 if(!(margin>0)||receipt?.playerId===p.pid&&now>=receipt.at&&now<=receipt.until)return value;
 const s=v150Scale(),dx=(p.tx-p.x)*s.x,dy=(p.ty-p.y)*s.y,gap=Math.hypot(dx,dy);if(!gap)return value;
 const mass=(p.offenseMotion||v157InitialBody(p)).massKg/74,quick=v162Active(m)&&!p.keeper,brake=10.5*(quick&&v119PaceActive(m)?1.25:quick?1.18:1)/mass,pace=v157Pace(m,p);
 const lead=Math.max(gap,pace*pace/(2*brake)+.05+margin);
 p.tx=p.x+dx/gap*lead/s.x;p.ty=p.y+dy/gap*lead/s.y;return value;
};

v183EnableByDefault('offball');
