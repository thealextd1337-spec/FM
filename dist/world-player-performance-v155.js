'use strict';
// Both match adapters emit resolved actions. Intent plans never earn credit.
const v178CompactBalance=Object.freeze({version:178,goalBase:.32,goalCeiling:.48,homeShotFactor:1.03});
function v178CompactShotChance(fixture,state,side){
 const balance=state.playerPerformance?.shotBalanceRevision===178?state.playerPerformance.compactBalance:null;
 return(balance||state.playerPerformance?.shotBalanceRevision===119 ? .09 : .22)*(balance&&side===0&&!fixture.neutral?balance.homeShotFactor:1);
}
// P02 / SI-6 (marker 183): the compact match follows the played-out match. The values come from the
// physical acceptance series (576 matches, 96 clubs x 2 pitches x 3 seed sets, plan 10 and
// docs/spielerintelligenz-si6-kompakt-183.md); re-fitted on the series sb2-f of the final defaults (17 Oct 2026, section "Neuanpassung an sb2-f"): expected shots per team follow the strength gap, every shot
// has a source, a shooter weighted by role and skill and a result from finishing and keeper.
// No score, win rate or result is forced. The snapshot is stored with the match.
const v183CompactBalance=Object.freeze({
 version:183,matchMinutes:97.7,homeShotFactor:1.03,gapKnee:5.5,gapOver:.15,gapFade:.5,shotOver:.1,
 levers:Object.freeze({onFin:.196,goalFin:.173,goalGk:-.148,onGap:.03,finSelf:1}),
 scoreState:Object.freeze({lead1:-.1,lead2:-.1,trail1:.1,trail2:.1,level:0,levelFrom:.5}),
 assisted:Object.freeze({open:.8,long:.15,'header-volley':.9,rebound:0,corner:.9,'free-kick-follow':.6,'direct-free-kick':0}),
 groups:Object.freeze({open:'open',long:'long','header-volley':'head',rebound:'rebound',corner:'head','free-kick-follow':'fk','direct-free-kick':'dfk'}),
 shooters:Object.freeze({
 open:Object.freeze({skill:'fin',slope:.185,fallback:.05,roles:Object.freeze({'ball-playing-defender':.03093,'ball-winner':.10152,'box-to-box':.56889,'cover-defender':.05718,dribbler:.32775,playmaker:.24468,poacher:.84381,stopper:.04632,striker:1.33896,'target-player':.34263,winger:.02769})}),
 long:Object.freeze({skill:'fin',slope:.8,fallback:.01,roles:Object.freeze({'ball-playing-defender':.00794,'ball-winner':.00576,'box-to-box':.05155,'cover-defender':.00715,dribbler:.10355,playmaker:.01754,poacher:.31383,stopper:.00541,striker:.29286,'target-player':.07443,winger:.01526})}),
 head:Object.freeze({skill:'air',slope:.18,fallback:.05,roles:Object.freeze({'ball-playing-defender':.02633,'ball-winner':.08208,'box-to-box':.14821,'cover-defender':.03717,dribbler:.09785,playmaker:.05788,poacher:.18562,stopper:.05114,striker:.24198,'target-player':.08636,winger:.01207})}),
 rebound:Object.freeze({skill:'fin',slope:.4,fallback:.008,roles:Object.freeze({'ball-playing-defender':.00293,'ball-winner':.01008,'box-to-box':.0313,'cover-defender':.00382,dribbler:.01425,playmaker:.01666,poacher:.05495,stopper:.00541,striker:.06826,'target-player':.03089,winger:.00568})}),
 fk:Object.freeze({skill:'fin',slope:.159,fallback:.02,roles:Object.freeze({'ball-playing-defender':.01129,'ball-winner':.02232,'box-to-box':.08837,'cover-defender':.01572,dribbler:.1007,playmaker:.04824,poacher:.26865,stopper:.01083,striker:.27673,'target-player':.12146,winger:.02343})}),
 dfk:Object.freeze({skill:'fin',slope:.9,fallback:1,roles:Object.freeze({})})
 }),
 sizes:Object.freeze({
 standard:Object.freeze({shotBase:5.452,shotSlope:.122,deepDefenceShots:1.401,shotKnee:11.5,mix:Object.freeze([Object.freeze(['open',6.556]),Object.freeze(['long',1.823]),Object.freeze(['header-volley',1.462]),Object.freeze(['rebound',.361]),Object.freeze(['corner',.076]),Object.freeze(['free-kick-follow',1.615]),Object.freeze(['direct-free-kick',.306])]),on:Object.freeze({open:-.295,long:-.896,'header-volley':.003,rebound:-.172,corner:.003,'free-kick-follow':-.172,'direct-free-kick':-.221}),goal:Object.freeze({open:.081,long:-.213,'header-volley':.597,rebound:.954,corner:.597,'free-kick-follow':.255,'direct-free-kick':-.351}),corners:.79,crossExtra:1.71,fouls:2.05,freeKickExtra:.03,slopes:Object.freeze({long:2.4}),load:Object.freeze({background:Object.freeze({def:.176,mid:.272,att:.152,gk:.026})})}),
 large:Object.freeze({shotBase:5.09,shotSlope:.125,deepDefenceShots:1.351,shotKnee:10,mix:Object.freeze([Object.freeze(['open',5.358]),Object.freeze(['long',3.361]),Object.freeze(['header-volley',1.188]),Object.freeze(['rebound',.375]),Object.freeze(['corner',.042]),Object.freeze(['free-kick-follow',.948]),Object.freeze(['direct-free-kick',.167])]),on:Object.freeze({open:-.148,long:-.75,'header-volley':-.069,rebound:-.089,corner:-.069,'free-kick-follow':-.22,'direct-free-kick':-1.033}),goal:Object.freeze({open:.189,long:-1.155,'header-volley':.537,rebound:.723,corner:.537,'free-kick-follow':.189,'direct-free-kick':-.822}),corners:.675,crossExtra:1,fouls:1.38,freeKickExtra:.115,slopes:Object.freeze({long:.8}),load:Object.freeze({background:Object.freeze({def:.198,mid:.287,att:.176,gk:.026})}),levers:Object.freeze({onFin:.21,goalFin:.24,goalGk:-.14,onGap:.06,finSelf:1})})
 })
});
function v183CompactSnapshot(career){
 const size=career?.world?.matchConfig?.fieldSize==='large'?'large':'standard',{sizes,...shared}=v183CompactBalance;
 return structuredClone({...shared,...sizes[size],fieldSize:size});
}
function v183Sigmoid(x){return 1/(1+Math.exp(-x));}
// The played-out reference measured strength gaps up to about 6 points (13 matches above 5, 4 above 6). Beyond the knee the
// effect grows only with the factor gapOver (the reference plateaus at about 11.7 shots of the favourite), so the widest gaps of the
// start worlds stay inside the shot corridor.
function v183Gap(B,gap){const size=Math.abs(gap);return Math.sign(gap)*(size<=B.gapKnee?size:B.gapKnee+(size-B.gapKnee)*B.gapOver);}
// Strength gap input of the shot model: mean of the eight outfield skills of the active outfield players
// (same definition as the `ovr` of the played-out reference, from the stored skills). Fatigue and form act
// through the effective finishing, passing and keeper values of the single actions.
let v183CompactMemo=null;
function v183CompactTeams(career,fixture,state){
 if(v183CompactMemo?.state===state&&v183CompactMemo.minute===state.minute)return v183CompactMemo.teams;
 const teams=[0,1].map(side=>{
  const skills={},ids=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk');let sum=0;
  for(const pid of ids){const s=v154Skills(v64Player(career,fixture,side,pid));skills[pid]=s;sum+=(s.spd+s.tec+s.pas+s.fin+s.tak+s.pos+s.air+s.sta)/8;}
  return{ids,skills,ovr:ids.length?sum/ids.length:10};
 });
 v183CompactMemo={state,minute:state.minute,teams};return teams;
}
function v183CompactStats(state){
 return state.compactStats||=Object.fromEntries([...['shots','onTarget','corners','crosses','fouls','freeKicks'].map(k=>[k,[0,0]]),['sources',{}],['sourceGoals',{}]]);
}
function v183ShooterWeight(balance,source,team,state){
 const g=balance.shooters[balance.groups[source]];
 const slope=balance.slopes?.[balance.groups[source]]??g.slope;
 return pid=>(g.roles[state.roleAssignments?.[pid]?.roleId]??g.fallback)*Math.exp(slope*(team.skills[pid][g.skill]-10));
}
function v183PickShooter(balance,source,team,state,random){
 return v64PickAttacker(team.ids,v183ShooterWeight(balance,source,team,state),random);
}
// Finishing of the shooter relative to the expected shooter of his team for this source (same weights as the pick).
// The finishing levers were fitted across teams. In the SI-K2 series the played-out best finisher converted hardly better than his team-mates
// (open play 28 % against 29 %), so the own deviation counted only with the share finSelf 0.3. In sb2-f he converts better again (63 % of the
// team goals from 59 % of the shots), so the fitted set uses finSelf 1; snapshots stored with 0.3 keep it.
function v183ShooterFinishing(balance,source,team,state,pid,finishing){
 const share=balance.levers.finSelf??1;if(share===1)return finishing;
 const weight=v183ShooterWeight(balance,source,team,state);let sum=0,centre=0;
 for(const id of team.ids){const w=weight(id);sum+=w;centre+=w*team.skills[id].fin;}
 return sum>0?finishing-(1-share)*(team.skills[pid].fin-centre/sum):finishing;
}
// Score state of the played-out match (leader manages the lead, trailing team pushes): relative change of the expected shots from the score
// difference of the team (leader about -10 %, trailing side about +10 %, measured in sb2-f). The optional level term (late caution while
// level) grows linearly from `levelFrom` (share of the 90 minutes) to the end; it is 0 in the fitted set. Stored snapshots without the block: no effect.
function v183ScoreFactor(B,state,side){
 const S=B.scoreState;if(!S)return 1;
 const diff=state.score[side]-state.score[1-side];
 if(diff>0)return 1+(diff>1?S.lead2:S.lead1);
 if(diff<0)return 1+(diff<-1?S.trail2:S.trail1);
 return 1+S.level*Math.min(1,Math.max(0,(state.minute/90-S.levelFrom)/(1-S.levelFrom)));
}
// Expected shots of a team in a match: strength gap in outfield skill points, small relative home bonus
// (never on a neutral pitch) and the measured effect of a deep defensive line of the opponent.
function v183ShotRate(B,own,other,home,deepOpponent){
 const rate=B.shotBase*Math.exp(B.shotSlope*v183Gap(B,own-other))*(home?B.homeShotFactor:1)*(deepOpponent?B.deepDefenceShots:1);
 // The favourite's shots plateau in the reference (about 11.7 at 4-7 points, about 10 on the large pitch). Only for gaps beyond the knee
 // (fading in over `gapFade` points) and only above the plateau height `shotKnee` the excess counts with the factor `shotOver`.
 const fade=Math.min(1,Math.max(0,(Math.abs(own-other)-B.gapKnee)/B.gapFade));
 return rate>B.shotKnee&&fade>0?rate+(B.shotKnee+(rate-B.shotKnee)*B.shotOver-rate)*fade:rate;
}
// Chance of a shot to hit the goal frame and, if it does, to score: shooter finishing, opposing keeper and strength gap
// (the played-out levers of the K2 series: 0,196 / 0,173 per finishing point, -0,148 per keeper point).
function v183ShotOdds(B,source,finishing,keeping,gap){
 const L=B.levers;
 return{onTarget:v183Sigmoid(B.on[source]+L.onFin*(finishing-10)+L.onGap*v183Gap(B,gap)),goal:v183Sigmoid(B.goal[source]+L.goalFin*(finishing-10)+L.goalGk*(keeping-10))};
}
function v183CompactActions(career,fixture,state,side,random){
 const B=state.playerPerformance.compactBalance,teams=v183CompactTeams(career,fixture,state),mine=teams[side],other=teams[1-side],stats=v183CompactStats(state);
 const attackers=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk'),rivals=v64Active(state,1-side),defenders=rivals.filter(pid=>state.roles[pid]!=='gk');
 const lambda=v183ShotRate(B,mine.ovr,other.ovr,side===0&&!fixture.neutral,state.tactics[1-side]?.defense==='Tief')*v183ScoreFactor(B,state,side);
 // Statistics of the other kinds of events (corners, crosses, fouls) run on their own draws.
 if(random()<B.corners/B.matchMinutes)stats.corners[side]++;
 if(random()<B.crossExtra/B.matchMinutes)stats.crosses[side]++;
 if(random()<B.freeKickExtra/B.matchMinutes)stats.freeKicks[side]++;
 if(random()<B.fouls/B.matchMinutes){
  const fouling=v64PickAttacker(defenders,pid=>(state.roles[pid]==='def'?1.3:state.roles[pid]==='mid'?1:.6)*Math.exp(.05*((other.skills[pid]?.tak??10)-10)),random);
  state.stats[fouling].fouls=(state.stats[fouling].fouls||0)+1;stats.fouls[1-side]++;stats.freeKicks[side]++;
 }
 let source=null;
 if(random()<lambda/B.matchMinutes){
  const total=B.mix.reduce((sum,[,rate])=>sum+rate,0);let ticket=random()*total;
  source=B.mix.at(-1)[0];for(const [name,rate]of B.mix){ticket-=rate;if(ticket<0){source=name;break;}}
 }
 const scorer=source?v183PickShooter(B,source,mine,state,random):v64PickAttacker(attackers,pid=>1+(['poacher','striker'].includes(state.roleAssignments[pid].roleId)?1:0),random);
 const assisted=Boolean(source)&&random()<B.assisted[source];
 const helper=v64PickAttacker(attackers.filter(pid=>pid!==scorer),pid=>1+(['playmaker','winger','target-player'].includes(state.roleAssignments[pid].roleId)?1:0),random);
 const p=v64Player(career,fixture,side,helper),q=v64Player(career,fixture,side,scorer),defender=defenders[Math.floor(random()*defenders.length)];
 if(state.playerLoad){v158CompactOffers(career,fixture,state,side,scorer,helper);v183CompactBackground(state,side);}
 const from=v155CompactPoint(state,helper,side),to=v155CompactPoint(state,scorer,side),opponents=rivals.map(pid=>({pid,point:v155CompactPoint(state,pid,1-side)})),range=Math.hypot(to.x-from.x,to.y-from.y),nearest=Math.min(...opponents.map(o=>Math.hypot(o.point.x-from.x,o.point.y-from.y)));
 const pressure=clamp(1-nearest/8,0,1),receiverPressure=clamp(1-Math.min(...opponents.map(o=>Math.hypot(o.point.x-to.x,o.point.y-to.y)))/8,0,1),progressMetres=(to.y-from.y)*(side?1:-1),difficulty=clamp(range/35+pressure*.3,0,1),context={difficulty,pressure,progressMetres,usefulness:clamp(Math.max(0,progressMetres)/12,0,1),repeatKey:`pass:${helper}:${scorer}`,errorAttribution:false};
 const passing=state.playerLoad?v158Ability(p,'pas',state,pressure>0):p.pas;
 // A shot minute is a chain that started with a completed pass; every other minute keeps the pass duel.
 const complete=source?true:random()<clamp(.77+(passing-10)*.009-pressure*.16,.4,.94);
 v155Event(state,helper,'pass',complete,context);
 if(!complete){v155Event(state,defender,'interception',true,{difficulty,usefulness:.65});return false;}
 v155Event(state,scorer,'receive',true,{difficulty:receiverPressure,usefulness:context.usefulness,pressure:receiverPressure});
 if(!source){v158CompactContact(career,fixture,state,side,scorer,random);return false;}
 // Resolution of the shot from the shooter's finishing and the opposing keeper (the played-out levers).
 state.stats[scorer].shots++;stats.shots[side]++;(stats.sources[source]||=[0,0])[side]++;
 if(source==='header-volley'||source==='corner')stats.crosses[side]++;
 const finishing=state.playerLoad?v158Ability(q,'fin',state,false):q.fin,keeper=rivals.find(pid=>state.roles[pid]==='gk'),k=v64Player(career,fixture,1-side,keeper),keeping=state.playerLoad?v158Ability(k,'gk',state,false):k.gk;
 const odds=v183ShotOdds(B,source,v183ShooterFinishing(B,source,mine,state,scorer,finishing),keeping,mine.ovr-other.ovr),pOn=odds.onTarget,pGoal=odds.goal,onTarget=random()<pOn;
 if(state.playerLoad){const height=.29+random()*2.3,lateral=(random()-.5)*5.5;v158CompactKeeper(career,fixture,state,1-side,keeper,`${fixture.id}:compact-shot:${scorer}:${state.stats[scorer].shots}`,onTarget,height,Math.abs(lateral));}
 const goal=onTarget&&random()<pGoal;
 if(onTarget)stats.onTarget[side]++;
 v155Event(state,scorer,'shot',onTarget,{difficulty:clamp(1-pOn*pGoal*1.5,.15,.9),usefulness:onTarget?1:.25,pressure:receiverPressure});
 if(onTarget&&!goal)v155Event(state,keeper,'save',true,{usefulness:1});
 if(!goal)return false;
 (stats.sourceGoals[source]||=[0,0])[side]++;
 state.score[side]++;state.stats[scorer].goals++;if(assisted)state.stats[helper].assists++;state.events.push({minute:state.minute,type:'goal',side,scorerPid:scorer,assistPid:assisted?helper:null,source});return true;
}
function v155Initialize(career,state){
 if(!v154Active(career)||state.playerPerformance)return;
 // Marker 183 only in a world with the 183 stamp; every other world keeps the release-132 marker 178.
 const revised=typeof v183WorldSi==='function'&&v183WorldSi(career);
 state.playerPerformance={version:155,shotBalanceRevision:revised?183:178,compactBalance:revised?v183CompactSnapshot(career):{...v178CompactBalance},parameters:career.world.playerFoundation.ratings,events:[],phases:{},sequence:0};
 v155SyncPhases(state);
}
function v155SyncPhases(state){
 const ledger=state.playerPerformance;if(!ledger)return;
 const current=new Set([...state.active,...state.awayActive]);
 for(const [pid,phases]of Object.entries(ledger.phases))if(!current.has(pid)&&phases.length)phases.at(-1).endMinute=Math.min(phases.at(-1).endMinute,state.minute);
 for(const pid of current){
  const a=state.roleAssignments[pid],phases=ledger.phases[pid]||=[];if(!a)continue;
  const last=phases.at(-1);
  if(!last||last.position!==a.position||last.roleId!==a.roleId||last.orientation!==a.orientation){if(last)last.endMinute=state.minute;const next={startMinute:state.minute,endMinute:state.minute,position:a.position,roleId:a.roleId,orientation:a.orientation};if(last&&last.startMinute===state.minute)phases[phases.length-1]=next;else phases.push(next);}
  else last.endMinute=state.minute;
 }
}
function v155Event(state,pid,type,success,context={}){
 const ledger=state.playerPerformance;if(!ledger)return;
 ledger.events.push({id:`${state.fixtureId}:${++ledger.sequence}`,minute:state.minute,playerId:pid,type,success,context});
}
function v155PassContext(m,p,q){
 const pressure=Math.max(0,1-Math.min(6,...m.people.filter(r=>r.t!==p.t&&!r.keeper).map(r=>v122Metres(p,r)))/6),dir=p.t===0?-1:1;
 const progressMetres=(q.y-p.y)*dir*v150Scale().y;
 const blocked=m.people.filter(r=>r.t!==p.t&&!r.keeper).some(r=>{const g=passLaneGeometry(r,p,q);return g&&v122Metres(r,g)<1.5;});
 return {difficulty:clamp(v122Metres(p,q)/30+pressure*.3+(blocked?.25:0),0,1),usefulness:clamp(Math.max(0,progressMetres)/12,0,1),progressMetres,pressure,repeatKey:`pass:${p.pid}:${q.pid||`space:${Math.round(q.x*10)}:${Math.round(q.y*10)}`}`,errorAttribution:false};
}
function v155AttemptPass(m,p,q){
 if(!v65WorldActive?.state.playerPerformance)return;
 m.performancePasses||={};m.performancePasses[p.pid]={receiverId:q.pid||null,from:{x:p.x,y:p.y},context:v155PassContext(m,p,q)};
}
function v155ReceiveContext(m,receiver,attempt){
 const pressure=Math.max(0,1-Math.min(6,...m.people.filter(p=>p.t!==receiver.t&&!p.keeper).map(p=>v122Metres(receiver,p)))/6);
 if(!attempt.from)return {pressure};
 const progressMetres=(receiver.y-attempt.from.y)*(receiver.t===0?-1:1)*v150Scale().y;
 return {pressure,progressMetres,usefulness:clamp(Math.max(0,progressMetres)/12,0,1)};
}
function v155BeforeNative(m){
 if(!v65WorldActive?.state.playerPerformance)return;
 m.performanceObservation||={previous:{},anchors:{},lastMinute:-1};
 const obs=m.performanceObservation;
 for(const p of m.people){if(!obs.previous[p.pid])obs.previous[p.pid]={...p.stats};if(!obs.anchors[p.pid])obs.anchors[p.pid]={x:p.x,y:p.y,owner:m.owner?.pid||null};}
}
function v155ObserveNative(context){
 const state=context.state,m=match,ledger=state.playerPerformance,obs=m?.performanceObservation;if(!ledger||!obs)return;
 v155SyncPhases(state);
 obs.pendingIntercepts||={};obs.pendingShots||={};
 for(const p of [...m.people,...m.exitedPeople]){
  const prev=obs.previous[p.pid]||p.stats,diff=k=>Math.max(0,(p.stats[k]||0)-(prev[k]||0)),attempt=m.performancePasses?.[p.pid];
  if(diff('passLost')&&attempt)attempt.lost=true;
  if(diff('interceptions'))obs.pendingIntercepts[p.pid]=true;
  if(diff('shots'))obs.pendingShots[p.pid]={onTargetBefore:prev.onTarget||0,context:{difficulty:clamp(Math.abs(p.y-(p.t===0?v55Field.top:v55Field.bottom))*v150Scale().y/25,0,1)}};
  for(const [key,type,success]of [['passComplete','pass',true],['tacklesWon','tackle',true],['saves','save',true]]){
   for(let n=0;n<diff(key);n++){
    let c={};if(type==='pass'&&attempt)c=attempt.context;
    if(type==='save')c={usefulness:1};
    v155Event(state,p.pid,type,success,c);
    if(type==='pass'&&attempt){const receiver=m.lastPass?.passer?.pid===p.pid?m.lastPass.receiver:m.owner?.t===p.t&&m.owner?.pid!==p.pid?m.owner:null;if(receiver)v155Event(state,receiver.pid,'receive',true,v155ReceiveContext(m,receiver,attempt));delete m.performancePasses[p.pid];}
   }
  }
  obs.previous[p.pid]={...p.stats};
  if(attempt?.lost&&!m.flight){v155Event(state,p.pid,'pass',false,attempt.context);delete m.performancePasses[p.pid];}
  if(obs.pendingIntercepts[p.pid]&&m.owner===p){v155Event(state,p.pid,'interception',true,{usefulness:.65});delete obs.pendingIntercepts[p.pid];}
  else if(!m.flight)delete obs.pendingIntercepts[p.pid];
  const shot=obs.pendingShots[p.pid];if(shot&&!m.flight){const onTarget=p.stats.onTarget>shot.onTargetBefore;v155Event(state,p.pid,'shot',onTarget,{...shot.context,usefulness:onTarget?1:.25});delete obs.pendingShots[p.pid];}
 }
 // Short, bounded observations of actual movement and actually open lanes.
 if(state.minute<obs.lastMinute+2)return;obs.lastMinute=state.minute;
 const owner=m.owner,team=v123PossessionTeam(m);
 for(const p of m.people){
  const anchor=obs.anchors[p.pid],travel=anchor?v122Metres(anchor,p):0,dir=p.t===0?-1:1;
  if(owner&&!p.keeper&&travel>=1.5&&!v121PositioningPaused(m)){
   if(p===owner&&anchor?.owner===p.pid){const gain=(p.y-anchor.y)*dir*v150Scale().y;if(gain>2)v155Event(state,p.pid,'carry',true,{progressMetres:gain,usefulness:clamp(gain/8,0,1)});}
   else if(team===p.t&&p!==owner&&v122Metres(owner,p)<18){const c=v155PassContext(m,owner,p);if(c.difficulty<.8&&c.usefulness>.2)v155Event(state,p.pid,'support-run',true,{...c,repeatKey:`offer:${p.pid}:${Math.floor(state.minute/6)}`});}
   else if(team!==p.t&&owner&&!owner.keeper){const rival=m.people.find(q=>q.t!==p.t&&q!==owner&&!q.keeper&&(q.y-owner.y)*-dir>0),lane=rival&&passLaneGeometry(p,owner,rival);if(lane&&v122Metres(p,lane)<2)v155Event(state,p.pid,'cover',true,{usefulness:.6,repeatKey:`cover:${p.pid}:${Math.floor(state.minute/6)}`});}
  }
  obs.anchors[p.pid]={x:p.x,y:p.y,owner:owner?.pid||null};
 }
}
function v155CompactPoint(state,pid,side){
 if(state.playerLoad)return v158CompactPoint(state,pid,side);
 const cell=state.cells[pid],keeper=state.roles[pid]==='gk',x=keeper?.5:(cell%5+.5)/5,y=keeper?.93:(Math.floor(cell/5)+.5)/7;
 const g=state.geometry||{width:44,length:68};return {x:(side?1-x:x)*g.width,y:(side?1-y:y)*g.length};
}
function v155CompactActions(career,fixture,state,side,random){
 if(state.playerPerformance?.shotBalanceRevision===183)return v183CompactActions(career,fixture,state,side,random);
 const attackers=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk'),rivals=v64Active(state,1-side),scorer=v64PickAttacker(attackers,pid=>1+(['poacher','striker'].includes(state.roleAssignments[pid].roleId)?1:0),random);
 const helper=v64PickAttacker(attackers.filter(pid=>pid!==scorer),pid=>1+(['playmaker','winger','target-player'].includes(state.roleAssignments[pid].roleId)?1:0),random);
 const p=v64Player(career,fixture,side,helper),q=v64Player(career,fixture,side,scorer),defenders=rivals.filter(pid=>state.roles[pid]!=='gk'),defender=defenders[Math.floor(random()*defenders.length)];
 if(state.playerLoad)v158CompactOffers(career,fixture,state,side,scorer,helper);
 const from=v155CompactPoint(state,helper,side),to=v155CompactPoint(state,scorer,side),opponents=rivals.map(pid=>({pid,point:v155CompactPoint(state,pid,1-side)})),range=Math.hypot(to.x-from.x,to.y-from.y),nearest=Math.min(...opponents.map(o=>Math.hypot(o.point.x-from.x,o.point.y-from.y)));
 const pressure=clamp(1-nearest/8,0,1),receiverPressure=clamp(1-Math.min(...opponents.map(o=>Math.hypot(o.point.x-to.x,o.point.y-to.y)))/8,0,1),progressMetres=(to.y-from.y)*(side?1:-1),difficulty=clamp(range/35+pressure*.3,0,1),context={difficulty,pressure,progressMetres,usefulness:clamp(Math.max(0,progressMetres)/12,0,1),repeatKey:`pass:${helper}:${scorer}`,errorAttribution:false};
 const passing=state.playerLoad?v158Ability(p,'pas',state,pressure>0):p.pas,finishing=state.playerLoad?v158Ability(q,'fin',state,receiverPressure>0):q.fin;
 const complete=random()<clamp(.77+(passing-10)*.009-pressure*.16,.4,.94);
 v155Event(state,helper,'pass',complete,context);
 if(!complete){v155Event(state,defender,'interception',true,{difficulty,usefulness:.65});return false;}
 v155Event(state,scorer,'receive',true,{difficulty:receiverPressure,usefulness:context.usefulness,pressure:receiverPressure});
 if(state.playerLoad&&v158CompactContact(career,fixture,state,side,scorer,random))return false;
 // Compact actions are resolved abstract actions, not reconstructed 3D runs.
 // No credit for support/cover unless that action was actually simulated.
 const balance=state.playerPerformance?.shotBalanceRevision===178?state.playerPerformance.compactBalance:null;
 const shotChance=v178CompactShotChance(fixture,state,side);
 if(random()>shotChance)return false;
 state.stats[scorer].shots++;
 const goalPoint={x:(state.geometry?.width||44)/2,y:side?(state.geometry?.length||68):0},shotDistance=Math.hypot(to.x-goalPoint.x,to.y-goalPoint.y),shotDifficulty=clamp(shotDistance/35+receiverPressure*.3+Math.abs(to.x-goalPoint.x)/22*.15,0,1);
 const keeper=rivals.find(pid=>state.roles[pid]==='gk'),k=v64Player(career,fixture,1-side,keeper),onTarget=random()<clamp(.48+(finishing-10)*.013-receiverPressure*.13,.25,.8);
 // New candidate shots specify their placement before the keeper outcome.
 if(state.playerLoad){const height=.29+random()*2.3,lateral=(random()-.5)*5.5;v158CompactKeeper(career,fixture,state,1-side,keeper,`${fixture.id}:compact-shot:${scorer}:${state.stats[scorer].shots}`,onTarget,height,Math.abs(lateral));}
 const keeping=state.playerLoad?v158Ability(k,'gk',state,false):k.gk,goal=onTarget&&random()<clamp((balance?balance.goalBase:.27)+(finishing-keeping)*.012-shotDifficulty*.08,.08,balance?balance.goalCeiling:.48);
 v155Event(state,scorer,'shot',onTarget,{difficulty:shotDifficulty,usefulness:onTarget?1:.25,pressure:receiverPressure});
 // The abstract result has no observed shot placement, pace or keeper reach.
 // A successful save is known; its difficulty is deliberately not invented.
 if(onTarget&&!goal)v155Event(state,keeper,'save',true,{usefulness:1});
 if(!goal)return false;
 state.score[side]++;state.stats[scorer].goals++;state.stats[helper].assists++;state.events.push({minute:state.minute,type:'goal',side,scorerPid:scorer,assistPid:helper});return true;
}
function v155Rated(career,fixture,state,pid){
 const ledger=state.playerPerformance;if(!ledger)return null;
 return D6MatchRatings.rateAppearance({playerId:pid,fixtureId:fixture.id,worldId:career.world.seed,seasonId:career.world.season,virtualMinutes:state.minutes[pid]||0,rolePositionPhases:(ledger.phases[pid]||[]).filter(p=>p.endMinute>p.startMinute),actualEvents:ledger.events.filter(e=>e.playerId===pid)},ledger.parameters);
}
function v155Book(career,fixture,state,player){
 const rated=v155Rated(career,fixture,state,player.pid);if(!rated||rated.status!=='rated')return null;
 const roleModel=player.playerModel.roleModel;if(roleModel.processedFixtures.includes(fixture.id))return rated;
 const minutes={};for(const phase of state.playerPerformance.phases[player.pid]||[])minutes[phase.position]=(minutes[phase.position]||0)+phase.endMinute-phase.startMinute;
 const routine=D6PositionRoutine.routineTransition(roleModel.routine,minutes,career.world.playerFoundation.roles.routine);
 const change=v153ApplyAppearance(career,player,{id:rated.id,worldId:rated.worldId,seasonId:rated.seasonId,minutes:rated.minutes,rating:rated.rating,skillWeights:rated.skillWeights},rated.skillWeights);
 if(!['applied','no-change','duplicate'].includes(change.status))throw Error('Leistungsdaten fehlen. Der Einsatz konnte nicht verbucht werden.');
 roleModel.routine=routine;roleModel.processedFixtures.push(fixture.id);
 roleModel.bestRecommendedRole=D6PlayerRoles.bestRecommendedRole(player.playerModel.recommendedRoles,roleModel.bestRecommendedRole,v154Skills(player),routine,career.world.playerFoundation.roles.suitability);
 return rated;
}
