'use strict';

// Player intelligence 183, package SI-3: finishing and goalkeeper.
// New logic only for v183Active(m,'finish') in a world match; otherwise every
// wrapped function calls its previous version unchanged (no extra draw).
//
// Placement model. A shot is a goal exactly when the placed ball is inside the
// frame and out of the keeper's reach; there is no blanket goal or on-target
// roll and no "settled keeper" rule. In metres in the goal frame (lat: lateral
// offset from the goal centre, depth: distance from the goal line, h: height):
//   aim      27 candidates (9 lateral x 3 heights). The expected goal value of
//            each aim integrates the shooter's own scatter; the choice is
//            tempered by decisions (dec): weight exp((p-pBest)/tau),
//            tau = aimTemp*(21-dec)/11 (draw "finish.aim").
//   scatter  angular sigma theta = (spreadBase + spreadSkill*(1-q)^spreadPower)
//            * (1 + pressureGain*pressure*calmFactor) * kind * body, with
//            q = skill/20 (finishing composite of the kind), pressure =
//            sum(1-d/pressureRadius) of close rivals (metres; replaces the
//            legacy normalised .15 radius of pitch-v55.js:403), calmFactor =
//            clamp(1+calmDamp*(10-calm), .3, 1.6), body = 1+bodyGain*turn^2.
//            Lateral sigma at the line = theta*range + spreadFlat*(1-q)^2,
//            vertical sigma = verticalRatio*theta*range + spreadFlatV*(1-q)^2
//            (both at least .05 m; draws "finish.lateral" and "finish.height";
//            normal quantiles).
//            The ball never goes below ground height; above the bar or wide of
//            the posts is a miss.
//   speed    speedBase + speedFin*fin + speedTec*tec m/s (headers: headerBase +
//            headerAir*air; volley x volleySpeed; direct free kick x fkSpeed).
//   keeper   in his depth plane: reach0 = reachBase + reachGk*(gk-10) (only
//            with hands, else noHandsReach), reaction = max(reactionMin,
//            reactionBase - reactionGk*(gk-10)), lateral speed = lateralBase +
//            lateralSpd*(spd-10) + lateralGk*(gk-10). At contact time t the
//            lateral reach is reach0 + max(0,t-reaction)*speed; heights above
//            handsHeight use upBase + upGk*(gk-10) + min(jumpMax,dive*jumpSpeed),
//            below it `down`. Reachable iff (gap/R)^2 + (dh/Rv)^2 <= 1, gap
//            perpendicular to the flight. Goal iff in frame and not reachable.
// Saves: catch or parry (draw "finish.catch") from shot speed, stretch, height
// and gk. A parry (v115KeeperDeflect) goes round the post for a corner more
// often near the post (draw "finish.parryOut") and otherwise away from the
// keeper, wider for better keepers (draw "finish.parrySpread").
// Direct free kicks: the best finisher on the pitch takes a free kick in the
// direct zone (v50BestTaker); the shot uses this model with fkSpread/fkSpeed
// and the existing wall/block rule. v183DirectFreeKick gives SI-7 the direct
// recommendation (range <= fkRangeBase + fkRangeFin*fin, open angle, xg).
// Interfaces: v183ShotEstimate (deterministic, no draw) and v183KeeperReach
// (all three sites). Parameter finish.keeperHold: keeper hold in seconds.
// No state is added to the match: the aim, scatter and save plan live only
// during one shot flight (a snapshot is refused during a flight); the parry
// plan waits in a WeakMap until the keeper deflects the same flight. The
// transient decision trace receives "finish.shot" (expected xg/on-target, aim,
// executed point, outcome and the plain situation) and "finish.parry".
// Named draws in the new path, in order: "finish.aim", "finish.lateral",
// "finish.height", "shot.block" (existing chance, only with a blocker in the
// lane), "finish.catch" (only for a save); in the deflection "finish.parryOut"
// and "finish.parrySpread".

const V183_FINISH_KEYS=Object.freeze(Object.keys(v183RegisterDefaults('finish',{
 keeperHold:1.6,
 spreadBase:.037,spreadSkill:.584,spreadPower:1.61,spreadFlat:2.22,spreadFlatV:1,verticalRatio:1.2,
 pressureRadius:2.5,pressureGain:.38,calmDamp:.05,bodyGain:.5,
 headerSpread:1.3,volleySpread:1.2,oneTouchSpread:1.1,fkSpread:1,
 aimTemp:.036,
 speedBase:21,speedFin:.4,speedTec:.2,headerBase:11,headerAir:.3,volleySpeed:1.03,fkSpeed:.92,
 reachBase:1.39,reachGk:.066,noHandsReach:.35,reactionBase:.168,reactionGk:.015,reactionMin:.06,
 lateralBase:3.67,lateralSpd:.065,lateralGk:.098,handsHeight:1,upBase:1.49,upGk:.01,jumpMax:.55,jumpSpeed:2.2,down:1,
 parryBase:.55,parrySpeed:.02,parryStretch:.35,parryHigh:.1,parryGk:.015,parryMin:.15,parryMax:.9,
 outBase:.4,outPost:.45,outStretch:.2,outGk:.015,postZone:1.8,parryNear:3.5,parryFar:8,parryAngle:.45,parryAngleGk:.03,
 fkRangeBase:14,fkRangeFin:.6,fkMinXg:.05
})));
const V183_FINISH_LATERAL=Object.freeze([-.92,-.78,-.6,-.35,0,.35,.6,.78,.92]);
const V183_FINISH_HEIGHTS=Object.freeze([.45,1.35,2.35]);
const V183_FINISH_GROUND=.29;
// Ten equal-probability height nodes (normal quantiles of (i+.5)/10).
const V183_FINISH_NODES=Object.freeze([-1.6449,-1.0364,-.6745,-.3853,-.1257,.1257,.3853,.6745,1.0364,1.6449]);
const v183FinishParamCache=new WeakMap(),v183FinishParries=new WeakMap();

function v183FinishLive(m){return Boolean(m&&typeof v65WorldActive!=='undefined'&&v65WorldActive&&v183Active(m,'finish'));}
// Plain parameter object of a marked match (match.si is frozen, so cached by it).
function v183FinishParams(m){
 let params=v183FinishParamCache.get(m.si);
 if(!params){params=Object.freeze(Object.fromEntries(V183_FINISH_KEYS.map(key=>[key,v183Param(m,'finish.'+key)])));v183FinishParamCache.set(m.si,params);}
 return params;
}

// ----- numeric helpers (pure) -----
function v183FinishPhi(z){
 // Standard normal CDF (Abramowitz-Stegun 7.1.26, |error| < 1.5e-7).
 const x=Math.abs(z)/Math.SQRT2,t=1/(1+.3275911*x),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);
 return z>=0?.5*(1+y):.5*(1-y);
}
function v183FinishQuantile(u){
 // Inverse standard normal CDF (Acklam), u clamped into (0,1).
 const p=Math.min(1-1e-9,Math.max(1e-9,u)),a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-.007784894002430293,-.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[.007784695709041462,.3224671290700398,2.445134137142996,3.754408661907416];
 if(p<.02425){const q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 if(p>1-.02425){const q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 const q=p-.5,r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
// Probability that N(mu,sigma) lies in [lo,hi].
function v183FinishBand(mu,sigma,lo,hi){if(!(hi>lo))return 0;return v183FinishPhi((hi-mu)/sigma)-v183FinishPhi((lo-mu)/sigma);}

// ----- model (pure: plain situation in metres, parameters P) -----
// Keeper capabilities from his stored values.
function v183FinishKeeper(P,keeper){
 const gk=keeper.gk-10,spd=keeper.spd-10;
 return {reach0:keeper.hands?P.reachBase+P.reachGk*gk:P.noHandsReach,reaction:Math.max(P.reactionMin,P.reactionBase-P.reactionGk*gk),
  lateral:Math.max(.5,P.lateralBase+P.lateralSpd*spd+P.lateralGk*gk),up:keeper.hands?P.upBase+P.upGk*gk:.8,hands:keeper.hands};
}
// Angular and metric scatter of the shooter for this situation.
function v183FinishSpread(P,sit){
 const q=clamp(sit.skill/20,0,1),calm=clamp(1+P.calmDamp*(10-sit.calm),.3,1.6);
 const kind=sit.kind==='header'?P.headerSpread:sit.kind==='volley'?P.volleySpread:sit.kind==='direct-free-kick'?P.fkSpread:sit.oneTouch?P.oneTouchSpread:1;
 const theta=(P.spreadBase+P.spreadSkill*Math.pow(1-q,P.spreadPower))*(1+P.pressureGain*sit.pressure*calm)*kind*(1+P.bodyGain*sit.turn*sit.turn);
 return {theta,x:Math.max(.05,theta*sit.range+P.spreadFlat*(1-q)*(1-q)),h:Math.max(.05,P.verticalRatio*theta*sit.range+P.spreadFlatV*(1-q)*(1-q))};
}
// Flight constants towards an aimed lateral point: fraction of the path at the
// keeper's depth plane, perpendicular factor and time to that plane.
function v183FinishPath(sit,aimLat){
 const S=sit.from,K=sit.keeper,length=Math.hypot(S.depth,aimLat-S.lat)||.001;
 const q=K&&S.depth>K.depth+.05?(S.depth-K.depth)/S.depth:0;
 return {q,c:S.depth/length,t:q*length/sit.speed,length};
}
// Keeper reach for a ball at lateral `lat` (goal line) and height `h` (goal line).
function v183FinishReach(P,sit,K,path,lat,h){
 const S=sit.from,keeper=sit.keeper;
 if(!keeper)return {reachable:false,stretch:Infinity,gap:Infinity,plane:null};
 const dive=Math.max(0,path.t-K.reaction),R=K.reach0+dive*K.lateral;
 const hk=sit.h0+(h-sit.h0)*path.q,dh=hk-P.handsHeight,Rv=dh>0?K.up+Math.min(P.jumpMax,dive*P.jumpSpeed):P.down,f=1-(dh/Rv)*(dh/Rv);
 const latK=path.q>0?S.lat+(lat-S.lat)*path.q:S.lat,gap=path.q>0?Math.abs(latK-keeper.lat)*path.c:Math.hypot(S.lat-keeper.lat,S.depth-keeper.depth);
 const reff=f>0?R*Math.sqrt(f):0,stretch=reff>0?gap/reff:Infinity;
 return {reachable:stretch<=1,stretch,gap,reach:R,height:hk,plane:{lat:latK,depth:path.q>0?keeper.depth:S.depth}};
}
// Expected goal and on-target probability of one aim (lateral integration in
// closed form per height node).
function v183FinishAimValue(P,sit,K,spread,aimLat,aimH){
 const half=sit.goal.half,top=sit.goal.top,path=v183FinishPath(sit,aimLat),S=sit.from,keeper=sit.keeper;
 let goal=0,on=0;
 for(const z of V183_FINISH_NODES){
  const h=Math.max(V183_FINISH_GROUND,aimH+spread.h*z);if(h>=top)continue;
  const inFrame=v183FinishBand(aimLat,spread.x,-half,half);on+=inFrame;
  if(!keeper){goal+=inFrame;continue;}
  const dive=Math.max(0,path.t-K.reaction),R=K.reach0+dive*K.lateral,hk=sit.h0+(h-sit.h0)*path.q,dh=hk-P.handsHeight,Rv=dh>0?K.up+Math.min(P.jumpMax,dive*P.jumpSpeed):P.down,f=1-(dh/Rv)*(dh/Rv);
  if(f<=0){goal+=inFrame;continue;}
  const reff=R*Math.sqrt(f);
  if(path.q<=0){if(Math.hypot(S.lat-keeper.lat,S.depth-keeper.depth)>reff)goal+=inFrame;continue;}
  const span=reff/path.c/path.q,centre=S.lat+(keeper.lat-S.lat)/path.q,lo=Math.max(-half,centre-span),hi=Math.min(half,centre+span);
  goal+=inFrame-v183FinishBand(aimLat,spread.x,lo,hi);
 }
 const n=V183_FINISH_NODES.length;
 return {p:Math.max(0,goal/n),on:on/n};
}
// All aims with their values and the decision weights (dec-tempered).
function v183FinishPlan(P,sit){
 const K=sit.keeper?v183FinishKeeper(P,sit.keeper):null,spread=v183FinishSpread(P,sit),aims=[];
 for(const h of V183_FINISH_HEIGHTS)for(const f of V183_FINISH_LATERAL){const lat=f*sit.goal.half,v=v183FinishAimValue(P,sit,K,spread,lat,h);aims.push({lat,h,p:v.p,on:v.on,w:0});}
 const best=aims.reduce((a,b)=>b.p>a.p?b:a),tau=Math.max(1e-4,P.aimTemp*(21-clamp(sit.dec,1,20))/11);
 let sum=0;for(const a of aims){a.w=Math.exp((a.p-best.p)/tau);sum+=a.w;}
 let xg=0,on=0;for(const a of aims){a.w/=sum;xg+=a.w*a.p;on+=a.w*a.on;}
 return {K,spread,aims,best,xg,on};
}
// One executed shot: aim choice (u1), lateral (u2) and height (u3) draws.
function v183FinishExecute(P,sit,plan,u1,u2,u3){
 let acc=0,aim=plan.aims[plan.aims.length-1];for(const a of plan.aims){acc+=a.w;if(u1<acc){aim=a;break;}}
 const lat=aim.lat+plan.spread.x*v183FinishQuantile(u2),raw=aim.h+plan.spread.h*v183FinishQuantile(u3),h=Math.max(V183_FINISH_GROUND,raw);
 const wide=Math.abs(lat)>=sit.goal.half,over=!wide&&h>=sit.goal.top,onTarget=!wide&&!over,path=v183FinishPath(sit,aim.lat);
 const reach=onTarget?v183FinishReach(P,sit,plan.K,path,lat,h):null;
 return {aim,lat,h,wide,over,onTarget,path,reach,goal:onTarget&&!reach.reachable};
}
function v183FinishParryChance(P,sit,reach){
 return clamp(P.parryBase+P.parrySpeed*(sit.speed-27)+P.parryStretch*Math.min(1,reach.stretch)+P.parryHigh*Math.max(0,reach.height-1.8)-P.parryGk*(sit.keeper.gk-10),P.parryMin,P.parryMax);
}

// ----- adapters between the live match and the model -----
function v183FinishGoal(m){
 const g=m.geometry||{},r=g.ballRadius||.1764,width=g.goalWidth||44*.2/(v55Field.right-v55Field.left),height=g.goalHeight||width/3;
 return {half:width/2-r,top:height-r,width,height,radius:r};
}
function v183FinishFrame(m,t,point){const s=v150Scale(m),goalY=t===0?v55Field.top:v55Field.bottom;return {lat:(point.x-.5)*s.x,depth:Math.abs(point.y-goalY)*s.y};}
function v183FinishPoint(m,t,lat,depth){const s=v150Scale(m),goalY=t===0?v55Field.top:v55Field.bottom;return {x:.5+lat/s.x,y:goalY+(t===0?1:-1)*depth/s.y};}
// Finishing composite of a kind (the same weights as the legacy execution).
function v183FinishSkill(p,kind,oneTouch=false){
 if(kind==='header')return ability(p,'fin')*.45+ability(p,'air')*.40+ability(p,'tec')*.15;
 if(oneTouch||kind==='volley'||kind==='direct-free-kick')return ability(p,'fin')*.7+ability(p,'tec')*.3;
 return ability(p,'fin')*.8+ability(p,'tec')*.2;
}
function v183FinishSpeed(P,p,kind){
 if(kind==='header')return P.headerBase+P.headerAir*ability(p,'air');
 const base=P.speedBase+P.speedFin*ability(p,'fin')+P.speedTec*ability(p,'tec');
 return base*(kind==='volley'?P.volleySpeed:kind==='direct-free-kick'?P.fkSpeed:1);
}
// Plain situation for shooter p from `from` (normalised) in match m.
function v183FinishSituation(m,p,from,kind='shot',options={}){
 const P=v183FinishParams(m),S=v183FinishFrame(m,p.t,from),keeper=m.people.find(q=>q.keeper&&q.t!==p.t),oneTouch=Boolean(options.oneTouch);
 let pressure=0;for(const r of m.people)if(r.t!==p.t&&!r.keeper&&!r.slideActive){const d=v122Metres(r,from);if(d<P.pressureRadius)pressure+=1-d/P.pressureRadius;}
 const body=p.offenseMotion,s=v150Scale(m),goalY=p.t===0?v55Field.top:v55Field.bottom,goalDir=Math.atan2((.5-from.x)*s.x,(goalY-from.y)*s.y);
 const turn=body&&Number.isFinite(body.heading)&&kind!=='direct-free-kick'?Math.abs(v157Angle(body.heading,goalDir))/Math.PI:0;
 const K=keeper?{...v183FinishFrame(m,p.t,keeper),gk:ability(keeper,'gk'),spd:ability(keeper,'spd'),hands:typeof v160KeeperHands!=='function'||v160KeeperHands(m,keeper,keeper),pid:keeper.pid}:null;
 return {kind,oneTouch,from:S,range:Math.hypot(S.lat,S.depth),h0:kind==='header'?1.9:kind==='volley'?.7:V183_FINISH_GROUND,skill:v183FinishSkill(p,kind,oneTouch),
  calm:v183Mental(p,'calm'),dec:v183Mental(p,'dec'),pressure,turn,speed:v183FinishSpeed(P,p,kind),keeper:K,goal:v183FinishGoal(m)};
}
// The first reachable outfield blocker on the line to `target` (legacy rule).
function v183FinishBlocker(m,shooter,target){
 return m.people.filter(r=>r.t!==shooter.t&&!r.keeper).map(player=>({player,geometry:passLaneGeometry(player,shooter,target)})).filter(item=>item.geometry&&item.geometry.lateral<.075&&(typeof v110BlockReachable!=='function'||v110BlockReachable(item.player,item.geometry,shooter))).sort((a,b)=>a.geometry.t-b.geometry.t)[0]||null;
}
function v183FinishBlockChance(blocker){return blocker?clamp(.09+ability(blocker.player,'tak')*.012,.1,.34):0;}

// ----- interfaces -----
// v183ShotEstimate(m,p,from,detail) -> {xg,aim,window,speed,onTarget,block}.
// With the finish package: xg is the probability that one attempt from `from`
// scores (expected over the shooter's own aim choice and scatter, times the
// chance that the first reachable blocker in the lane does not block). aim:
// the best aim {x,y} on the goal line plus `height` in metres; window: an aim
// with a positive goal value and an open lane exists; speed: shot speed m/s.
// detail.kind: 'shot' (default), 'volley', 'header' or 'direct-free-kick'.
// Deterministic, no draw, writes nothing. Without the package: previous stub.
const v183FinishBaseEstimate=v183ShotEstimate;
v183ShotEstimate=function(m,p,from=p,detail={}){
 if(!v183FinishLive(m))return v183FinishBaseEstimate.call(this,m,p,from,detail);
 const kind=detail?.kind||'shot',sit=v183FinishSituation(m,p,{x:from.x,y:from.y},kind,{oneTouch:detail?.oneTouch}),plan=v183FinishPlan(v183FinishParams(m),sit);
 const aim={...v183FinishPoint(m,p.t,plan.best.lat,0),height:plan.best.h},blocker=v183FinishBlocker(m,{...p,x:from.x,y:from.y},aim),block=v183FinishBlockChance(blocker);
 return {xg:plan.xg*(1-block),aim,window:plan.best.p>0&&!blocker,speed:sit.speed,onTarget:plan.on,block};
};
// v183KeeperReach: lateral keeper reach in metres at all three sites for a ball
// arriving after `range` metres, with the shooter's speed when he is known
// (detail.shooter, else the opposing ball owner, else 27 m/s), at hand height.
const v183FinishBaseReach=v183KeeperReach;
v183KeeperReach=function(m,keeper,range,contact,detail={}){
 if(!v183FinishLive(m)||!keeper)return v183FinishBaseReach.call(this,m,keeper,range,contact,detail);
 const P=v183FinishParams(m),shooter=detail.shooter||(m.owner&&m.owner.t!==keeper.t?m.owner:null),speed=shooter?v183FinishSpeed(P,shooter,'shot'):27;
 const hands=detail.site==='keeper-contact'||typeof v160KeeperHands!=='function'||!contact||v160KeeperHands(m,keeper,contact);
 const K=v183FinishKeeper(P,{gk:ability(keeper,'gk'),spd:ability(keeper,'spd'),hands});
 return K.reach0+Math.max(0,range/speed-K.reaction)*K.lateral;
};
// Direct free-kick recommendation for SI-7 (v182FreeKickPlan): shoot when the
// spot lies within fkRangeBase + fkRangeFin*fin metres, the angle is open and
// the estimate reaches fkMinXg. null without the finish package.
// Timing: the estimate reads the current defender positions. Call it once the
// wall stands (at the execution, or with the wall targets in place); called when
// the set piece is created, the wall is not yet in the lane, so xg is too high
// and the block is ignored.
function v183DirectFreeKick(m,setPiece){
 if(!v183FinishLive(m)||!setPiece?.taker||!setPiece.spot)return null;
 const P=v183FinishParams(m),taker=setPiece.taker,spot=setPiece.spot,S=v183FinishFrame(m,taker.t,spot),range=Math.hypot(S.lat,S.depth),limit=P.fkRangeBase+P.fkRangeFin*ability(taker,'fin');
 const angle=S.depth>=1&&Math.abs(S.lat)<=S.depth*.85+1,estimate=v183ShotEstimate(m,taker,spot,{kind:'direct-free-kick'});
 return {direct:range<=limit&&angle&&estimate.xg>=P.fkMinXg,range,limit,xg:estimate.xg,estimate};
}

// ----- execution -----
function v183FinishShoot(shooter,kind){
 const m=match,P=v183FinishParams(m),team=shooter.t,rivals=m.people.filter(player=>player.t!==team),keeper=rivals.find(player=>player.keeper);
 const oneTouch=v127OneTouchRelease?.person===shooter,from={x:m.ball.x,y:m.ball.y};
 shooter.stats.shots++;m.shots[team]++;if(kind==='header')shooter.stats.headers++;if(kind==='volley')shooter.stats.volleys++;
 v183FinishParries.delete(m);
 const sit=v183FinishSituation(m,shooter,from,kind,{oneTouch}),plan=v183FinishPlan(P,sit);
 const u1=random(),u2=random(),u3=random(),shot=v183FinishExecute(P,sit,plan,u1,u2,u3),line=team===0?v55Field.top:v55Field.bottom;
 // Misses keep the native display range of the legacy path (x within .3-.7).
 const goalPoint={x:clamp(v183FinishPoint(m,team,shot.lat,0).x,.3,.7),y:line};
 const blocker=v183FinishBlocker(m,shooter,goalPoint);
 const label=kind==='header'?'köpft aufs Tor':kind==='volley'?'schießt direkt volley':oneTouch?'schießt direkt':'schießt';
 note(`${shooter.name} ${label}!`,'shot');
 const blocked=Boolean(blocker&&random()<v183FinishBlockChance(blocker));
 // Trace after the block decision: onTarget/goal are the actual outcome; a block stops both.
 v183Trace(m,{type:'finish.shot',shooter,kind,range:+sit.range.toFixed(2),xg:+plan.xg.toFixed(4),on:+plan.on.toFixed(4),aimLat:+shot.aim.lat.toFixed(2),aimH:shot.aim.h,lat:+shot.lat.toFixed(2),h:+shot.h.toFixed(2),blocked,onTarget:!blocked&&shot.onTarget,over:!blocked&&shot.over,wide:!blocked&&shot.wide,goal:!blocked&&shot.goal,stretch:shot.reach&&Number.isFinite(shot.reach.stretch)?+shot.reach.stretch.toFixed(3):null,sx:+plan.spread.x.toFixed(2),sh:+plan.spread.h.toFixed(2),sit});
 if(blocked){
  const point={x:blocker.geometry.x,y:blocker.geometry.y},launch=()=>fly(point,clamp(distance(shooter,point)*1.2,.17,.45),()=>{if(v122Metres(blocker.player,point)>.8){blocker.player.interceptTarget=null;v50LooseBall(point,`${blocker.player.name} erreicht den Abschluss nicht.`);return}v50Deflect(point,team,blocker.player,`Block von ${blocker.player.name}`)});if(typeof v110BlockFlight==='function')v110BlockFlight(blocker.player,point,launch);else launch();return;
 }
 const onTarget=shot.onTarget,goal=shot.goal,reachable=Boolean(onTarget&&shot.reach.reachable);
 if(onTarget){shooter.stats.onTarget++;if(reachable)keeper.stats.faced++;}
 const parry=reachable?random()<v183FinishParryChance(P,sit,shot.reach):null;
 const contact=reachable?v183FinishPoint(m,team,shot.reach.plane.lat,shot.reach.plane.depth):null;
 const end=goal?goalPoint:reachable?contact:{x:goalPoint.x,y:line};
 const height=reachable?shot.reach.height:shot.wide?Math.min(shot.h,sit.goal.height+.6):shot.h;
 if(typeof v158ShotMotion==='function'){const motion=v158ShotMotion(m,shooter,keeper,end,onTarget);if(motion){motion.endHeight=Math.max(V183_FINISH_GROUND,height);m.nextShotMotion=motion;}}
 // fly() takes durations in the legacy measure (seconds x MATCH_SPEED); SI-0 converts it to the match rate.
 const metres=v122Metres(m.ball,end),duration=Math.max(typeof v101ShotDuration==='function'?v101ShotDuration(m.ball,end,.48,kind):.48,metres/sit.speed*MATCH_SPEED);
 fly(end,duration,()=>{if(goal){v50Goal(shooter,keeper,false,kind==='direct-free-kick'?'direct-free-kick':null);return}if(!onTarget){v50GoalKick(keeper,`${shooter.name} setzt den Ball vorbei. Abstoß.`);return}keeper.stats.saves++;if(parry)v50Deflect(end,team,keeper,`Parade von ${keeper.name}`);else v50GoalKick(keeper,`${keeper.name} hält den Abschluss fest.`)});
 // Display data of this flight follows the model: height, over the bar, save at
 // the keeper (also when his contact lies further than the generic 2.4 m).
 const release=m.flight&&typeof v99Flights!=='undefined'&&v99Flights.get(m.flight);
 if(release){
  release.endHeight=Math.max(V183_FINISH_GROUND,height);release.over=Boolean(shot.over);
  if(onTarget){release.blocked=false;release.keeperContact=reachable;if(keeper)v99ActionState(m).keepers.set(keeper.pid,release);}
  if(parry!==null)release.parry=parry;
 }
 if(parry)v183FinishParries.set(m,{flight:m.flight,keeperPid:keeper.pid,lat:shot.reach.plane.lat,stretch:Math.min(1,shot.reach.stretch),speed:sit.speed,gk:sit.keeper.gk});
 if(sit.range>22&&m.flight)v183LedgerSource(m.flight,'long-shot',m);
 if(typeof v100ShotOutcome==='function')v100ShotOutcome(m.flight,goal);
}
// The wrapped chain below this module is v99 (shot display scope) -> v102
// (release pose scope) -> pitch-v55 v55Shoot. The new path keeps both scopes.
const v183FinishBaseShoot=v55Shoot;
v55Shoot=function(shooter,kind='shot',...args){
 const m=match;
 if(!v183FinishLive(m)||kind==='header'&&v115GoalDistance(shooter)>v115HeaderRange(shooter))return v183FinishBaseShoot.call(this,shooter,kind,...args);
 const previous=v99Release;v99Release={kind:'shot',shooter,onTarget:shooter.stats.onTarget||0};
 try{return v102Scoped(shooter,kind==='header'?'header':kind==='volley'?'volley':kind==='direct-free-kick'?'freeKick':'shot',()=>v183FinishShoot(shooter,kind))}finally{v99Release=previous}
};

// Parry direction: round the post for a corner (mostly near the post, more so
// for good keepers), otherwise into the field away from the keeper.
const v183FinishBaseDeflect=v115KeeperDeflect;
v115KeeperDeflect=function(point,team,keeper,description){
 const m=match,plan=v183FinishLive(m)?v183FinishParries.get(m):null,incoming=typeof v109IncomingFlight!=='undefined'&&v109IncomingFlight?.current===m?v109IncomingFlight.flight:null;
 // A plan belongs to exactly one shot flight: consumed here, and dropped as stale on a mismatch.
 if(plan)v183FinishParries.delete(m);
 if(!plan||plan.keeperPid!==keeper.pid||plan.flight!==incoming)return v183FinishBaseDeflect.call(this,point,team,keeper,description);
 const P=v183FinishParams(m),goal=v183FinishGoal(m),s=v150Scale(m),line=team===0?v55Field.top:v55Field.bottom,away=team===0?1:-1;
 v123DefensiveThreats.set(m,team);
 const nearPost=clamp((Math.abs(plan.lat)-(goal.half-P.postZone))/P.postZone,0,1),gk=plan.gk-10;
 const outChance=clamp(P.outBase+P.outPost*nearPost+P.outStretch*plan.stretch+P.outGk*gk*nearPost,.03,.9);
 const out=random()<outChance,spread=random(),side=Math.abs(plan.lat)>.25?Math.sign(plan.lat):point.x>=keeper.x?1:-1;
 v183Trace(m,{type:'finish.parry',keeper,out,outChance:+outChance.toFixed(3),nearPost:+nearPost.toFixed(2),stretch:+plan.stretch.toFixed(2)});
 let target;
 if(out)target={x:.5+side*(goal.width/2+goal.radius+.4+2.1*spread)/s.x,y:line};
 else{const angle=clamp(P.parryAngle+P.parryAngleGk*gk,.1,1.3),d=P.parryNear+(P.parryFar-P.parryNear)*spread;target={x:clamp(point.x+side*Math.sin(angle)*d/s.x,.055,.945),y:clamp(point.y+away*Math.cos(angle)*d/s.y,v55Field.top+.025,v55Field.bottom-.025)};}
 m.owner=keeper;m.ball={...point};
 fly(target,.32,()=>{if(out)v55Out({edge:team===0?'top':'bottom',...target},keeper.t,description);else v50LooseBall(target,`Der Ball liegt nach ${description} frei.`);});
};

// Direct free kicks: the best finisher on the pitch takes a central free kick
// in the direct zone (he is placed on the spot at the execution).
const v183FinishBaseTaker=v50BestTaker;
v50BestTaker=function(team,type,spot){
 const m=match,depth=team===0?spot?.y:1-spot?.y;
 if(type!=='freeKick'||!v183FinishLive(m)||!(depth<.38&&spot.x>.18&&spot.x<.82))return v183FinishBaseTaker.call(this,team,type,spot);
 const field=v50Outfield(team),rank=p=>v183FinishSkill(p,'direct-free-kick');
 return [...field].sort((a,b)=>rank(b)-rank(a)||distance(a,spot)-distance(b,spot))[0];
};

v183EnableByDefault('finish');
