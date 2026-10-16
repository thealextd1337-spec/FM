// Frozen controller of the compact simulation as of marker 178 (commit a95fe8d2, before SI-6).
// test-compact-balance-v183.cjs installs these functions in place of the current ones and requires
// matches with marker 178, 119 and without marker to be identical to the current implementation.
// v64FinishFixture is not part of it: later modules wrap it and its compact booking is covered by the test.
function v155Initialize(career,state){
 if(!v154Active(career)||state.playerPerformance)return;
 state.playerPerformance={version:155,shotBalanceRevision:178,compactBalance:{...v178CompactBalance},parameters:career.world.playerFoundation.ratings,events:[],phases:{},sequence:0};
 v155SyncPhases(state);
}
function v178CompactShotChance(fixture,state,side){
 const balance=state.playerPerformance?.shotBalanceRevision===178?state.playerPerformance.compactBalance:null;
 return(balance||state.playerPerformance?.shotBalanceRevision===119 ? .09 : .22)*(balance&&side===0&&!fixture.neutral?balance.homeShotFactor:1);
}
function v155CompactActions(career,fixture,state,side,random){
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
function v64Step(career,fixture,state){
 if(state.phase==='finished'||state.phase==='paused')return state;
 state.phase='live';state.minute++;
 for(const side of [0,1])for(const pid of v64Active(state,side)){
  state.minutes[pid]++;
  if(!state.playerLoad){const player=v64Player(career,fixture,side,pid),tactic=state.tactics[side],full=v64Workload(player,tactic);state.fresh[pid]=Math.max(0,state.fresh[pid]-full/90);}
 }
 if(state.playerLoad)v158CompactMinute(career,fixture,state);
 if(state.playerPerformance)v155SyncPhases(state);
 let goal=false,stoppage=state.minute===45;
 for(const side of [0,1]){
  const random=v61Random(`${career.world.seed}:${fixture.id}:minute:${state.minute}:side:${side}`),strength=v64TeamStrength(career,fixture,state,side),opponent=v64TeamStrength(career,fixture,state,1-side),ownTactics=state.tactics[side],otherTactics=state.tactics[1-side];
  const lineEffect=(ownTactics.defense==='Hoch'?.0015:ownTactics.defense==='Tief'?-.001:0)+(otherTactics.defense==='Tief'?-.002:otherTactics.defense==='Hoch'?(ownTactics.passing==='Direkt'?.003:.001):0);
  const riskEffect=otherTactics.aggression==='Aggressiv'?.001:0;
  const chance=Math.max(.003,Math.min(.045,.014+(strength-opponent)*.002+(side===0&&!fixture.neutral ? .002 : 0)+lineEffect+riskEffect));
  if(state.playerPerformance){if(v155CompactActions(career,fixture,state,side,random)){goal=true;stoppage=true;}}else if(random()<.12){const attackers=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk'),scorer=v64PickAttacker(attackers,pid=>1+(v64HasInstruction(state,pid,'shoot')?.55:0)+(v64HasInstruction(state,pid,'deep')?.2:0),random);state.stats[scorer].shots++;
   if(random()<chance/.12){state.score[side]++;state.stats[scorer].goals++;const helpers=attackers.filter(pid=>pid!==scorer),helper=v64PickAttacker(helpers,pid=>{const focus=ownTactics.focus||'Variabel';return 1+(v64HasInstruction(state,pid,'support')?.2:0)+(v64HasInstruction(state,pid,'wing')?(focus==='Außen'?.55:.25):0)},random),assist=helper&&random()<.68?helper:null;if(assist)state.stats[assist].assists++;state.events.push({minute:state.minute,type:'goal',side,scorerPid:scorer,assistPid:assist});goal=true;stoppage=true;}
  }
  if(random()<.16)stoppage=true;
 }
 if(stoppage){const half=state.minute<=state.firstHalfEnd?0:1,baseline=half===0?45:90+state.addedMinutes[0];if(state.minute<=baseline){state.stoppages[half]++;state.addedMinutes[half]=Math.min(5,Math.round(state.stoppages[half]/4));state.firstHalfEnd=45+state.addedMinutes[0];state.fullTimeEnd=90+state.addedMinutes[0]+state.addedMinutes[1]}}
 const halftime=state.minute===state.firstHalfEnd;
 if(state.playerLoad){v158Commit({career,fixture,state});if(halftime)v158RecoverMatch(career,fixture,state,'halftime');}
 if(halftime)state.events.push({minute:state.minute,type:'halftime'});
 if(goal||halftime||state.minute%15===0)for(const side of [0,1])v64AiAdjust(career,fixture,state,side,goal?'Tor':halftime?'Halbzeit':'Reguläre Prüfung');
 if(stoppage&&state.pending.some(items=>items.length))v64ExecutePending(career,fixture,state,halftime?'Halbzeit':'Spielunterbrechung');
 if(state.minute>=state.fullTimeEnd){if(state.playerLoad)v158RecoverMatch(career,fixture,state,'final-whistle');state.phase='finished';}
 return state;
}
