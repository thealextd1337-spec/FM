'use strict';

// Native P02 adapter for explicitly NEW local worlds. The active-match map is
// authoritative; physical player copies and both renderers are readers.
const v158ParameterCache=new WeakMap(),v158Samples=new WeakMap(),v158AbilityCache=new WeakMap();
function v158Active(career){return career?.world?.playerFoundation?.loadParameters?.parameterId===D6LoadCandidate.PARAMETER_ID;}
function v158PlayerActive(player){return player?.playerModel?.loadParameterId===D6LoadCandidate.PARAMETER_ID;}
function v158Runtime(saved){let runtime=v158ParameterCache.get(saved);if(!runtime){runtime=D6LoadCandidate.materializeParameters(saved);v158ParameterCache.set(saved,runtime);}return runtime;}
function v158Parameters(career){return v158Runtime(career.world.playerFoundation.loadParameters);}
function v158Generate(player,foundation){
 if(!foundation.loadParameters)return;
 D6LoadCandidate.materializeParameters(foundation.loadParameters);
 Object.assign(player.playerModel,{loadParameterId:D6LoadCandidate.PARAMETER_ID,freshnessState:D6Freshness.createState(player.pid,player.fresh),loadCursor:Math.max(0,(foundation.loadDay||0)-1),loadPlayedDays:[]});
}
// A newly reached season is an explicit product event, also for ordinary
// careers. This hook is never called while loading an existing season.
function v158SeasonStart(career){
 const world=career.world;if(world.playerSeasonStart===world.season)return false;
 const absolute=v64AbsoluteDay(career,0),seen=new Set(),players=[...world.clubs.flatMap(c=>[...c.roster,...(c.youthPool||[])]),...(world.market?.freePlayers||[])];
 for(const p of players){
  if(seen.has(p.pid))continue;seen.add(p.pid);p.fresh=100;p.form=Math.floor(v61Random(`${world.seed}:S${world.season}:${p.pid}:starting-form`)()*5)-2;p.formRatings=[];
  if(v158PlayerActive(p)){p.playerModel.freshnessState=D6Freshness.createState(p.pid,100);p.playerModel.loadCursor=Math.max(0,absolute-1);}
 }
 if(v158Active(career))world.playerFoundation.loadDay=absolute;
 world.playerSeasonStart=world.season;
 if(typeof v66RefreshMarketValues==='function')v66RefreshMarketValues(career,'start');
 return true;
}
function v158Initialize(career,fixture,state){
 if(!v158Active(career))return;
 if(fixture.matchRecord)throw Error('Eine abgeschlossene Partie darf keine neue Belastungsledger erhalten.');
 v158Parameters(career);
 const players={},meta={};
 for(const side of [0,1])for(const p of v64Side(career,fixture,side)){
  if(!Object.hasOwn(state.fresh,p.pid))continue;
  if(!v158PlayerActive(p)||!p.playerModel.freshnessState)throw Error('Frischezustand der neuen Prüfkarriere fehlt.');
  // Completed fixtures are already guarded by matchRecord. Only the new
  // appearance needs a load transport ledger; checkpoints retain that ledger.
  players[p.pid]=D6Freshness.createState(p.pid,p.playerModel.freshnessState.freshness);meta[p.pid]={stamina:p.sta,keeper:Boolean(p.keeper)};
  state.fresh[p.pid]=players[p.pid].freshness;
 }
 state.playerLoad={version:158,parameterId:D6LoadCandidate.PARAMETER_ID,parameters:structuredClone(career.world.playerFoundation.loadParameters),startFresh:{...state.fresh},players,meta,pending:{},sequence:0,day:v64AbsoluteDay(career,fixture.day),compactPositions:{}};
}
function v158StateFor(player,state=null){
 if(state?.playerLoad?.players[player.pid])return state;
 const context=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 return context?.state.playerLoad&&typeof match!=='undefined'&&match?.people.includes(player)?context.state:null;
}
function v158Fresh(player,state=null){const active=v158StateFor(player,state);return active?active.fresh[player.pid]:player.playerModel?.freshnessState?.freshness??player.fresh??100;}
function v158Pressure(player){
 if(typeof match==='undefined'||!match?.people.includes(player)||v121PositioningPaused(match))return false;
 return match.people.some(q=>q.t!==player.t&&!q.keeper&&!q.slideActive&&v122Metres(q,player)<3.5);
}
function v158Effective(player,state=null,pressure=null){
 const context=typeof v65WorldActive!=='undefined'&&v65WorldActive,career=context?.career||v61CurrentCareer;
 const active=v158StateFor(player,state);if((!active?.playerLoad&&!v158Active(career))||!v158PlayerActive(player))return null;
 const fresh=v158Fresh(player,active),form=player.form||0,actualPressure=pressure??v158Pressure(player),clock=active?.minute??null;
 const cached=v158AbilityCache.get(player);
 if(active&&cached?.state===active&&cached.fresh===fresh&&cached.form===form&&cached.pressure===actualPressure&&cached.clock===clock)return cached.values;
 const base=v154Skills(player),runtime=active?.playerLoad?v158Runtime(active.playerLoad.parameters):v158Parameters(career),values=D6EffectiveAbilities.effectiveAbilities(base,fresh,D6LoadCandidate.formContext(base,form,runtime.formParameters),{actualPressure},runtime.effectParameters);
 if(active)v158AbilityCache.set(player,{state:active,fresh,form,pressure:actualPressure,clock,values});
 return values;
}
function v158Ability(player,key,state=null,pressure=null){
 const values=v158Effective(player,state,pressure);if(!values)return null;
 const misplaced=!player.keeper&&player.assignedLine&&player.assignedLine!==player.line&&!['spd','sta'].includes(key)?.45:0;
 const aggression=key==='tak'&&typeof match!=='undefined'&&match?.people.includes(player)&&running?(match.aggression?.[player.t]||0)*1.2:0;
 return clamp(values[key]-misplaced+aggression,1,20);
}
function v158Movement(player,maxSpeed,acceleration){
 if(!v158PlayerActive(player))return {maxSpeed,acceleration};
 const context=typeof v65WorldActive!=='undefined'&&v65WorldActive,career=context?.career||v61CurrentCareer;
 if(!v158Active(career))return {maxSpeed,acceleration};
 return D6EffectiveAbilities.movementLimits({maxSpeed,acceleration},v158Fresh(player),v158Parameters(career).effectParameters);
}
function v158ReactionLoss(player){
 if(!v158PlayerActive(player))return 0;
 const values=v158Effective(player,null,false);if(!values)return 0;
 const runtime=v158Parameters(v65WorldActive.career),base=v154Skills(player),form=D6LoadCandidate.formContext(base,player.form||0,runtime.formParameters);
 return ((clamp(base.ant*form.multipliers.ant,1,20)-values.ant)+(clamp(base.dec*form.multipliers.dec,1,20)-values.dec))*.008;
}
function v158Pending(state,pid){return state.playerLoad.pending[pid]||(state.playerLoad.pending[pid]={intervals:[],events:[],running:{sprint:0,pressing:0,both:0}});}
function v158Interval(state,pid,from,to){
 if(!(to>from))return;
 const intervals=v158Pending(state,pid).intervals,last=intervals.at(-1);
 if(last&&Math.abs(last.endMinute-from)<1e-7)last.endMinute=to;else intervals.push({startMinute:from,endMinute:to});
}
function v158QueueAction(career,fixture,state,player,type,causeId,minute){
 if(!state.playerLoad?.players[player.pid])return;
 const pending=v158Pending(state,player.pid),id=`${causeId}:${player.pid}:${type}`;
 if(!pending.events.some(e=>e.id===id))pending.events.push({id,causeId,type,minute,units:1});
}
function v158LoadAction(current,player,type,causeId){
 const context=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 if(!context?.state.playerLoad||current!==match)return;
 v158QueueAction(context.career,context.fixture,context.state,player,type,causeId,Math.max(0,current.elapsed*90/75));
}
function v158Contact(current,a,b){
 const context=typeof v65WorldActive!=='undefined'&&v65WorldActive;if(!context?.state.playerLoad||current!==match)return;
 const id=`${context.fixture.id}:contact:${++context.state.playerLoad.sequence}`;
 v158LoadAction(current,a,'intense-duel',id);v158LoadAction(current,b,'intense-duel',id);
}
function v158PenaltyDive(current,setPiece,keeper){
 const context=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 if(!context?.state.playerLoad||current!==match||current.finished||context.state.phase==='penalties'||current.setPiece!==setPiece||setPiece.type!=='penalty'||setPiece.loadDiveId)return;
 setPiece.loadDiveId=`${context.fixture.id}:penalty-dive:${++context.state.playerLoad.sequence}`;
 v158LoadAction(current,keeper,'keeper-dive',setPiece.loadDiveId);
}
function v158Commit(context){
 const {career,fixture,state}=context,load=state.playerLoad;if(!load)return;
 const params=v158Parameters(career).loadParameters;
 for(const [pid,pending]of Object.entries(load.pending)){
  if(!pending.intervals.length&&!pending.events.length)continue;
  const id=`${fixture.id}:load:${++load.sequence}:${pid}`,end=pending.intervals.at(-1)?.endMinute??pending.events.at(-1).minute,events=[...pending.events];
  for(const [group,units]of Object.entries(pending.running))if(units>0){
   const causeId=`${id}:run:${group}`;
   for(const type of group==='both'?['sprint','pressing']:[group])events.push({id:`${causeId}:${type}`,causeId,type,minute:end,units});
  }
  load.players[pid]=D6Freshness.consumeFreshness(load.players[pid],{id,fixtureId:fixture.id,...load.meta[pid],intervals:pending.intervals,events},params);
  state.fresh[pid]=load.players[pid].freshness;
  delete load.pending[pid];
 }
}
function v158BeginNative(current,realDelta){
 const context=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 if(!context?.state.playerLoad||current!==match||context.state.phase!=='live'||current.finished)return;
 v158Samples.set(current,{context,at:current.elapsed,realDelta,owner:current.owner?{pid:current.owner.pid,t:current.owner.t,x:current.owner.x,y:current.owner.y,keeper:current.owner.keeper}:null,paused:Boolean(v121PositioningPaused(current)),people:current.people.map(p=>({p,x:p.x,y:p.y,slide:p.slideActive,threshold:(p.keeper?2.6+ability(p,'spd')*.065:3+ability(p,'spd')*.14)*(v158Movement(p,1,1).maxSpeed)*1.15}))});
}
function v158EndNative(current){
 const sample=v158Samples.get(current);if(!sample)return;v158Samples.delete(current);
 const {context}=sample,from=Math.max(0,sample.at*90/75),to=Math.max(from,current.elapsed*90/75),duration=to-from;
 if(duration>0){
  for(const old of sample.people){
   const p=old.p;v158Interval(context.state,p.pid,from,to);
   if(sample.paused||v121PositioningPaused(current)||old.slide||p.slideActive)continue;
   const travel=v122Metres(old,p),speed=travel/Math.max(1e-6,sample.realDelta),sprint=travel>.01&&speed>old.threshold;
   const owner=sample.owner,pressing=owner&&!owner.keeper&&!p.keeper&&owner.t!==p.t&&travel>.01&&speed>.8&&v122Metres(old,owner)<14&&v122Metres(p,owner)<v122Metres(old,owner)-.005;
   if(sprint||pressing){const key=sprint&&pressing?'both':sprint?'sprint':'pressing';v158Pending(context.state,p.pid).running[key]+=duration;}
  }
 }
 if(Math.floor(to)!==Math.floor(from)||current.halftimePause>0||current.finished)v158Commit(context);
}
function v158RecoverMatch(career,fixture,state,type){
 const load=state.playerLoad;if(!load)return;
 v158Commit({career,fixture,state});
 if(type==='final-whistle'&&!load.finalFresh)load.finalFresh={...state.fresh};
 for(const [pid,source]of Object.entries(load.players)){
  const appeared=source.ledger.fixtures.find(f=>f.id===fixture.id)?.minuteRanges.some(i=>i.endMinute>i.startMinute);if(!appeared)continue;
  load.players[pid]=D6Freshness.recoverFreshness(source,{id:`${fixture.id}:${type}:${pid}`,type,fixtureId:fixture.id});state.fresh[pid]=load.players[pid].freshness;
 }
}
function v158PersistMatch(career,fixture,state){
 const load=state.playerLoad;if(!load)return;
 v158RecoverMatch(career,fixture,state,'final-whistle');
 for(const side of [0,1])for(const p of v64Side(career,fixture,side)){
  const source=load.players[p.pid];if(!source)continue;
  // The complete current appearance stays in activeMatch (and QA evidence).
  // A completed player's next calendar state needs only the resulting value;
  // keeping every transport signature on every club would exhaust browser saves.
  p.playerModel.freshnessState=D6Freshness.createState(p.pid,source.freshness);p.fresh=source.freshness;
  if(source.ledger.fixtures.find(f=>f.id===fixture.id)?.minuteRanges.length&&!p.playerModel.loadPlayedDays.includes(load.day))p.playerModel.loadPlayedDays.push(load.day);
 }
}
function v158RecoverWorld(career,day){
 if(!v158Active(career))return false;
 const absolute=v64AbsoluteDay(career,day),through=absolute-1,seen=new Set();career.world.playerFoundation.loadDay=absolute;
 const players=[...career.world.clubs.flatMap(c=>[...c.roster,...(c.youthPool||[])]),...(career.world.market?.freePlayers||[])];
 for(const p of players){
  if(seen.has(p.pid)||!v158PlayerActive(p))continue;seen.add(p.pid);
  const model=p.playerModel;if(!Number.isInteger(model.loadCursor)||!model.freshnessState)throw Error('Kalenderzustand der neuen Prüfkarriere fehlt.');
  if(through<=model.loadCursor)continue;
  let source=model.freshnessState;
  for(let completed=model.loadCursor+1;completed<=through;completed++){
   if(source.freshness>=100)break;
   if(model.loadPlayedDays.includes(completed))continue;
   const dayId=`${career.world.seed}:day:${completed}`;source=D6Freshness.recoverFreshness(source,{id:`${dayId}:${p.pid}`,type:'rest-day',dayId,fullMatchFreeDay:true});
  }
  model.freshnessState=source;model.loadCursor=through;p.fresh=source.freshness;
 }
 return true;
}
function v158CompactPoint(state,pid,side){
 const stored=state.playerLoad?.compactPositions[pid];if(stored)return stored;
 const cell=state.cells[pid],keeper=state.roles[pid]==='gk',x=keeper?.5:(cell%5+.5)/5,y=keeper?.93:(Math.floor(cell/5)+.5)/7;
 return {x:(side?1-x:x)*44,y:(side?1-y:y)*68};
}
function v158CompactRun(career,fixture,state,pid,side,target,press=false){
 const load=state.playerLoad;if(load.compactBudget?.minute!==state.minute)load.compactBudget={minute:state.minute,used:{}};
 const remaining=Math.max(0,1-(load.compactBudget.used[pid]||0));
 const p=v64Player(career,fixture,side,pid),from=v158CompactPoint(state,pid,side),dx=target.x-from.x,dy=target.y-from.y,gap=Math.hypot(dx,dy),values=v158Effective(p,state,false);
 const neutral=3+values.spd*.14,pace=D6EffectiveAbilities.movementLimits({maxSpeed:neutral*1.42,acceleration:6.2+values.spd*.08},state.fresh[pid],v158Parameters(career).effectParameters).maxSpeed,distance=Math.min(gap,pace/.936*remaining),ratio=gap?distance/gap:0;
 state.playerLoad.compactPositions[pid]={x:clamp(from.x+dx*ratio,0,44),y:clamp(from.y+dy*ratio,0,68)};
 const activeMinutes=distance/Math.max(.01,pace)*.936,sprint=pace>neutral*1.15,pressing=press&&pace>.8;if(distance>.01&&(sprint||pressing))v158Pending(state,pid).running[sprint&&pressing?'both':sprint?'sprint':'pressing']+=activeMinutes;
 load.compactBudget.used[pid]=Math.min(1,(load.compactBudget.used[pid]||0)+activeMinutes);
}
function v158CompactOffers(career,fixture,state,side,receiverId,passerId){
 if(!state.playerLoad)return;
 const point=v158CompactPoint(state,receiverId,side);v158CompactRun(career,fixture,state,receiverId,side,{x:point.x,y:point.y+(side?5:-5)});
 const ball=v158CompactPoint(state,passerId,side),rivals=v64Active(state,1-side).filter(pid=>state.roles[pid]!=='gk').map(pid=>({pid,point:v158CompactPoint(state,pid,1-side)})).sort((a,b)=>Math.hypot(a.point.x-ball.x,a.point.y-ball.y)-Math.hypot(b.point.x-ball.x,b.point.y-ball.y));
 const count=state.tactics[1-side].pressing==='Früh'?2:1;
 for(const r of rivals.slice(0,count))if(Math.hypot(r.point.x-ball.x,r.point.y-ball.y)<14)v158CompactRun(career,fixture,state,r.pid,1-side,ball,true);
}
function v158CompactContact(career,fixture,state,side,pid,random){
 if(!state.playerLoad)return false;
 const point=v158CompactPoint(state,pid,side),rivals=v64Active(state,1-side).filter(id=>state.roles[id]!=='gk').map(id=>({id,point:v158CompactPoint(state,id,1-side)})).sort((a,b)=>Math.hypot(a.point.x-point.x,a.point.y-point.y)-Math.hypot(b.point.x-point.x,b.point.y-point.y)),near=rivals[0];
 if(!near||Math.hypot(near.point.x-point.x,near.point.y-point.y)>1.8)return false;
 const victim=v64Player(career,fixture,side,pid),defender=v64Player(career,fixture,1-side,near.id),cause=`${fixture.id}:compact-contact:${++state.playerLoad.sequence}`;
 for(const p of [victim,defender]){const stats=state.stats[p.pid];stats.duels=(stats.duels||0)+1;v158QueueAction(career,fixture,state,p,'intense-duel',cause,state.minute);}
 const ds=state.stats[defender.pid];ds.tackleAttempts=(ds.tackleAttempts||0)+1;
 const won=random()<clamp(.25+(v158Ability(defender,'tak',state,true)-v158Ability(victim,'tec',state,true))*.022,.08,.55);
 if(won)ds.tacklesWon=(ds.tacklesWon||0)+1;v155Event(state,defender.pid,'tackle',won,{pressure:1,usefulness:won?.65:0});return won;
}
function v158CompactMinute(career,fixture,state){
 if(!state.playerLoad)return;
 for(const side of [0,1])for(const pid of v64Active(state,side))v158Interval(state,pid,state.minute-1,state.minute);
}
function v158ShotMotion(current,shooter,keeper,target,onTarget){
 if(!v65WorldActive?.state.playerLoad)return null;
 const variant=((shooter.stats.shots||0)+shooter.n)%3,near=onTarget&&v122Metres(target,keeper)<2.4;
 return {id:`${v65WorldActive.fixture.id}:shot:${shooter.pid}:${shooter.stats.shots}`,keeperPid:keeper.pid,startHeight:.29,endHeight:onTarget?[(near?.6:.35),1.35,2.7][variant]:variant===0?.29:3.4+variant*.45,onTarget,launched:false};
}
function v158KeeperLaunch(current,keeper,flight){
 const motion=flight?.shotMotion;if(!motion||motion.launched||!motion.onTarget)return;
 motion.launched=true;
 const lateral=Math.abs(flight.target.x-keeper.x)*v150Scale().x,type=lateral>.75?'keeper-dive':motion.endHeight>1.05?'keeper-jump':null;
 if(type)v158LoadAction(current,keeper,type,motion.id);
}
function v158CompactKeeper(career,fixture,state,side,keeperId,shotId,onTarget,height,lateral){
 if(!state.playerLoad||!onTarget)return;
 const type=lateral>.75?'keeper-dive':height>1.05?'keeper-jump':null;
 if(type)v158QueueAction(career,fixture,state,v64Player(career,fixture,side,keeperId),type,shotId,state.minute);
}
