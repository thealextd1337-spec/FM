'use strict';

// Ein Matchzustand für die sichtbare Partie und die kompakten Weltpartien.
const v64Formations=['1–1–3','1–2–2','1–3–1','2–1–2','2–2–1','3–1–1'];
const v64Roles={def:'Abwehr',mid:'Mittelfeld',att:'Angriff',gk:'Torwart'};
function v64AbsoluteDay(career,day){return(career.world.season-1)*v62Days.seasonEnd+day}
function v64RecoverClub(career,club,day){
 const absolute=v64AbsoluteDay(career,day),last=club.lastRecoveredDay;
 if(Number.isInteger(last)&&absolute>last){const gain=Math.min(100,(absolute-last)*4);for(const player of club.roster)player.fresh=Math.min(100,player.fresh+gain)}
 club.lastRecoveredDay=absolute;
}
function v64Rating(player,role){
 const field=role==='def'?(player.tak+player.pos+player.air)/3:role==='mid'?(player.tec+player.pas+player.sta)/3:(player.fin+player.tec+player.spd)/3;
 return(role==='gk'?(player.gk*2+player.pos+player.air)/4:field)+(player.line===role?1.3:-1.3)+(player.form||0)*.3+(player.fresh-70)*.025;
}
function v64RoleList(formation){
 const parts=formation.split('–').map(Number);
 if(!v64Formations.includes(formation))throw Error('Ungültige Grundordnung.');
 return['gk',...Array(parts[0]).fill('def'),...Array(parts[1]).fill('mid'),...Array(parts[2]).fill('att')];
}
function v64BuildSide(club,formation){
 const roles=v64RoleList(formation),chosen=new Set(),starters=[],assigned={};
 for(const role of roles){
  const possible=club.roster.filter(player=>!chosen.has(player.pid)&&(role==='gk'?player.keeper:!player.keeper));
  const player=possible.sort((a,b)=>v64Rating(b,role)-v64Rating(a,role)||a.pid.localeCompare(b.pid))[0];
  if(!player)throw Error(`Für ${club.name} fehlt ein Spieler der Startelf.`);
  chosen.add(player.pid);starters.push(player.pid);assigned[player.pid]=role;
 }
 const bench=club.roster.filter(player=>!chosen.has(player.pid)).sort((a,b)=>v64Rating(b,b.line)-v64Rating(a,a.line)||a.pid.localeCompare(b.pid)).slice(0,5).map(player=>player.pid);
 return{clubId:club.id,starters,bench,roles:assigned};
}
function v64CoachTactics(coach){
 return{formation:v64Formations.includes(coach?.style.formation)?coach.style.formation:'2–2–1',pressing:coach?.style.pressing||'Ausgewogen',passing:coach?.style.passing||'Variabel',defense:coach?.style.defense||'Neutral',aggression:coach?.style.risk>=4?'Aggressiv':'Normal'};
}
function v64PrepareFixture(career,fixture){
 if(fixture.plan)return fixture.plan;
 const clubs=career.world.clubs,home=clubs.find(club=>club.id===fixture.homeId),away=clubs.find(club=>club.id===fixture.awayId);
 for(const club of [home,away])v64RecoverClub(career,club,fixture.day);
 const side=club=>{
  const coach=career.world.coaches.find(item=>item.id===club.coachId),tactics=v64CoachTactics(coach);
  return{...v64BuildSide(club,tactics.formation),coachId:coach?.id||null,tactics};
 };
 fixture.plan={home:side(home),away:side(away)};
 return fixture.plan;
}
function v64MakeState(career,fixture){
 const plan=v64PrepareFixture(career,fixture),active=[...plan.home.starters,...plan.away.starters],fresh={},minutes={},stats={};
 for(const pid of active.concat(plan.home.bench,plan.away.bench)){
  const player=career.world.clubs.flatMap(club=>club.roster).find(item=>item.pid===pid);
  fresh[pid]=player.fresh;minutes[pid]=0;stats[pid]={goals:0,assists:0,shots:0};
 }
 return{fixtureId:fixture.id,minute:0,score:[0,0],active:[...plan.home.starters],awayActive:[...plan.away.starters],bench:[...plan.home.bench],awayBench:[...plan.away.bench],roles:{...plan.home.roles,...plan.away.roles},tactics:[{...plan.home.tactics},{...plan.away.tactics}],tacticChanges:[],pending:[[],[]],substitutions:[],exited:[],events:[],fresh,minutes,stats,phase:'prematch',lastAiCheck:[-1,-1],lastAiChange:[-20,-20]};
}
function v64Players(career,side){return career.world.clubs.find(club=>club.id===side.clubId).roster}
function v64Side(career,fixture,side){return v64Players(career,side===0?fixture.plan.home:fixture.plan.away)}
function v64Active(state,side){return side===0?state.active:state.awayActive}
function v64Bench(state,side){return side===0?state.bench:state.awayBench}
function v64Player(career,fixture,side,pid){return v64Side(career,fixture,side).find(player=>player.pid===pid)}
function v64SetFormation(career,fixture,state,side,formation,reason='Nutzerentscheidung'){
 const roles=v64RoleList(formation),active=v64Active(state,side),players=active.map(pid=>v64Player(career,fixture,side,pid));
 if(active.length!==6||players.filter(player=>player.keeper).length!==1)throw Error('Die Mannschaft ist nicht vollständig.');
 const remaining=new Set(active),assign={};
 for(const role of roles){const pid=[...remaining].filter(id=>role==='gk'?v64Player(career,fixture,side,id).keeper:!v64Player(career,fixture,side,id).keeper).sort((a,b)=>v64Rating(v64Player(career,fixture,side,b),role)-v64Rating(v64Player(career,fixture,side,a),role)||a.localeCompare(b))[0];if(!pid)throw Error('Ungültige Feldbesetzung.');remaining.delete(pid);assign[pid]=role}
 Object.assign(state.roles,assign);state.tactics[side].formation=formation;
 state.tacticChanges.push({minute:state.minute,side,tactics:{...state.tactics[side]},reason});
}
function v64ChangeTactics(career,fixture,state,side,changes,reason='Nutzerentscheidung'){
 if(state.phase==='finished')throw Error('Die Partie ist beendet.');
 const allowed={pressing:v63Pressing,passing:v63Passing,defense:v63Defense,aggression:['Vorsichtig','Normal','Aggressiv']};
 for(const [key,value]of Object.entries(changes))if(key!=='formation'&&!allowed[key]?.includes(value))throw Error('Ungültige Taktik.');
 if(changes.formation&&changes.formation!==state.tactics[side].formation)v64SetFormation(career,fixture,state,side,changes.formation,reason);
 let changed=false;for(const [key,value]of Object.entries(changes))if(key!=='formation'&&state.tactics[side][key]!==value){state.tactics[side][key]=value;changed=true}
 if(changed)state.tacticChanges.push({minute:state.minute,side,tactics:{...state.tactics[side]},reason});
}
function v64SetPrematchSlot(career,fixture,state,side,slot,inPid){
 if(state.phase!=='prematch')throw Error('Die Startelf kann nur vor Anpfiff geändert werden.');
 const plan=side===0?fixture.plan.home:fixture.plan.away,active=v64Active(state,side),bench=v64Bench(state,side),outPid=plan.starters[slot];
 if(outPid===inPid)return;
 const out=v64Player(career,fixture,side,outPid),incoming=v64Player(career,fixture,side,inPid);
 if(!out||!incoming||!bench.includes(inPid)||out.keeper!==incoming.keeper)throw Error('Dieser Startelftausch ist nicht zulässig.');
 const role=state.roles[outPid],benchIndex=bench.indexOf(inPid);
 plan.starters[slot]=inPid;plan.bench[benchIndex]=outPid;active[slot]=inPid;bench[benchIndex]=outPid;
 delete state.roles[outPid];state.roles[inPid]=role;delete plan.roles[outPid];plan.roles[inPid]=role;
}
function v64PrematchTactics(career,fixture,state,side,changes){
 if(state.phase!=='prematch')throw Error('Der Anpfiff ist bereits erfolgt.');
 v64ChangeTactics(career,fixture,state,side,changes,'Matchplan');
 const plan=side===0?fixture.plan.home:fixture.plan.away;
 plan.tactics={...state.tactics[side]};plan.roles=Object.fromEntries(v64Active(state,side).map(pid=>[pid,state.roles[pid]]));
}
function v64QueueSubstitution(career,fixture,state,side,outPid,inPid){
 if(state.phase==='finished'||state.substitutions.filter(item=>item.side===side).length+state.pending[side].length>=2)throw Error('Es sind höchstens zwei Wechsel möglich.');
 const active=v64Active(state,side),bench=v64Bench(state,side),out=v64Player(career,fixture,side,outPid),incoming=v64Player(career,fixture,side,inPid);
 if(!active.includes(outPid)||!bench.includes(inPid)||!out||!incoming||out.keeper!==incoming.keeper||state.exited.includes(inPid)||state.pending[side].some(item=>item.outPid===outPid||item.inPid===inPid))throw Error('Dieser Wechsel ist nicht zulässig.');
 state.pending[side].push({outPid,inPid});
}
function v64CancelPending(state,side,index){state.pending[side].splice(index,1)}
function v64ExecutePending(career,fixture,state,reason){
 const changes=[];
 for(const side of [0,1]){
  const active=v64Active(state,side),bench=v64Bench(state,side),pending=state.pending[side];
  if(state.substitutions.filter(item=>item.side===side).length+pending.length>2)throw Error('Zu viele Wechsel.');
  for(const item of pending){
   const out=v64Player(career,fixture,side,item.outPid),incoming=v64Player(career,fixture,side,item.inPid);
   if(!active.includes(item.outPid)||!bench.includes(item.inPid)||out.keeper!==incoming.keeper)throw Error('Ungültige Wechselvormerkung.');
   changes.push({side,...item,role:state.roles[item.outPid]});
  }
 }
 for(const item of changes){
  const active=v64Active(state,item.side),bench=v64Bench(state,item.side);
  active[active.indexOf(item.outPid)]=item.inPid;bench.splice(bench.indexOf(item.inPid),1);state.exited.push(item.outPid);
  delete state.roles[item.outPid];state.roles[item.inPid]=item.role;
  const record={minute:state.minute,side:item.side,outPid:item.outPid,inPid:item.inPid,reason};state.substitutions.push(record);
  state.events.push({minute:state.minute,type:'substitution',side:item.side,outPid:item.outPid,inPid:item.inPid});
 }
 state.pending=[[],[]];
 return changes;
}
function v64TeamStrength(career,fixture,state,side){
 const active=v64Active(state,side),field=active.filter(pid=>state.roles[pid]!=='gk'),tactic=state.tactics[side];
 const attack=field.reduce((sum,pid)=>sum+v64Rating(v64Player(career,fixture,side,pid),state.roles[pid])*(state.fresh[pid]/100),0)/5;
 return attack+(tactic.pressing==='Früh'?.55:tactic.pressing==='Abwartend'?-.25:0)+(tactic.passing==='Direkt'?.2:0)+(tactic.aggression==='Aggressiv'?.2:0);
}
function v64AiAdjust(career,fixture,state,side,reason){
 const plan=side===0?fixture.plan.home:fixture.plan.away;if(!plan.coachId||state.minute===state.lastAiCheck[side])return;
 state.lastAiCheck[side]=state.minute;
 const score=state.score[side]-state.score[1-side],tactic=state.tactics[side],coach=career.world.coaches.find(item=>item.id===plan.coachId),changes={};
 if(state.minute-state.lastAiChange[side]>=10||reason==='Tor'){
  const pressing=score<0&&state.minute>=30?'Früh':score>0&&state.minute>=60?'Abwartend':coach.style.pressing;
  if(tactic.pressing!==pressing)changes.pressing=pressing;
  const formation=score<0&&state.minute>=60?'1–2–2':score>0&&state.minute>=70?'3–1–1':coach.style.formation;
  if(tactic.formation!==formation)changes.formation=formation;
  if(Object.keys(changes).length){v64ChangeTactics(career,fixture,state,side,changes,reason);state.lastAiChange[side]=state.minute}
 }
 if(state.minute<60||state.substitutions.filter(item=>item.side===side).length+state.pending[side].length>=2)return;
 const active=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk'&&!state.pending[side].some(item=>item.outPid===pid)).sort((a,b)=>state.fresh[a]-state.fresh[b]);
 const out=active[0],role=state.roles[out],bench=v64Bench(state,side).filter(pid=>!v64Player(career,fixture,side,pid).keeper&&!state.pending[side].some(item=>item.inPid===pid)).sort((a,b)=>v64Rating(v64Player(career,fixture,side,b),role)-v64Rating(v64Player(career,fixture,side,a),role));
 if(out&&bench[0]&&(state.fresh[out]<88||state.minute>=75))v64QueueSubstitution(career,fixture,state,side,out,bench[0]);
}
function v64Step(career,fixture,state){
 if(state.phase==='finished'||state.phase==='paused')return state;
 state.phase='live';state.minute++;
 for(const side of [0,1])for(const pid of v64Active(state,side)){
  state.minutes[pid]++;
  const player=v64Player(career,fixture,side,pid),tactic=state.tactics[side],full=player.keeper?10:21+(tactic.pressing==='Früh'?3:0)+(player.age>=33?2:0)+(20-player.sta)*.35;
  state.fresh[pid]=Math.max(0,state.fresh[pid]-full/90);
 }
 let goal=false,stoppage=state.minute===45;
 for(const side of [0,1]){
  const random=v61Random(`${career.world.seed}:${fixture.id}:minute:${state.minute}:side:${side}`),strength=v64TeamStrength(career,fixture,state,side),opponent=v64TeamStrength(career,fixture,state,1-side),ownTactics=state.tactics[side],otherTactics=state.tactics[1-side];
  const lineEffect=(ownTactics.defense==='Hoch'?.0015:ownTactics.defense==='Tief'?-.001:0)+(otherTactics.defense==='Tief'?-.002:otherTactics.defense==='Hoch'?(ownTactics.passing==='Direkt'?.003:.001):0);
  const riskEffect=otherTactics.aggression==='Aggressiv'?.001:0;
  const chance=Math.max(.003,Math.min(.045,.014+(strength-opponent)*.002+(side===0?.002:0)+lineEffect+riskEffect));
  if(random()<.12){const attackers=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk'),scorer=attackers[Math.floor(random()*attackers.length)];state.stats[scorer].shots++;
   if(random()<chance/.12){state.score[side]++;state.stats[scorer].goals++;const helpers=attackers.filter(pid=>pid!==scorer),helper=helpers[Math.floor(random()*helpers.length)],assist=helper&&random()<.68?helper:null;if(assist)state.stats[assist].assists++;state.events.push({minute:state.minute,type:'goal',side,scorerPid:scorer,assistPid:assist});goal=true;stoppage=true;}
  }
  if(random()<.16)stoppage=true;
 }
 if(state.minute===45)state.events.push({minute:45,type:'halftime'});
 if(goal||state.minute===45||state.minute%15===0)for(const side of [0,1])v64AiAdjust(career,fixture,state,side,goal?'Tor':state.minute===45?'Halbzeit':'Reguläre Prüfung');
 if(stoppage&&state.pending.some(items=>items.length))v64ExecutePending(career,fixture,state,state.minute===45?'Halbzeit':'Spielunterbrechung');
 if(state.minute>=90)state.phase='finished';
 return state;
}
function v64FinishFixture(career,fixture,state){
 if(state.minute!==90||state.phase!=='finished')throw Error('Die Partie ist noch nicht beendet.');
 if(fixture.matchRecord)return fixture.matchRecord;
 const record={score:[...state.score],starters:{home:[...fixture.plan.home.starters],away:[...fixture.plan.away.starters]},tacticChanges:state.tacticChanges,substitutions:state.substitutions,events:state.events,players:[]};
 for(const side of [0,1])for(const player of v64Side(career,fixture,side)){
  const minutes=state.minutes[player.pid]||0;if(!minutes)continue;
  const stats=state.stats[player.pid],rating=minutes>=20?(state.ratings?.[player.pid]??Math.max(1,Math.min(10,6+stats.goals*1.2+stats.assists*.6+stats.shots*.1-(state.score[1-side]>state.score[side]?.35:0)))):null;
  const line={pid:player.pid,side,minutes,goals:stats.goals,assists:stats.assists,shots:stats.shots,rating};record.players.push(line);
  player.fresh=Math.round(state.fresh[player.pid]*100)/100;
  if(rating!==null)player.form=Math.max(-2,Math.min(2,(player.form||0)+(rating>=7.5?1:rating<5?-1:0)));
  player.history.push({fixtureId:fixture.id,season:career.world.season,competitionId:fixture.competitionId,minutes,goals:stats.goals,assists:stats.assists,shots:stats.shots,rating});
 }
 fixture.matchRecord=record;
 return record;
}
function v64SimulateFixture(career,fixture){
 const state=v64MakeState(career,fixture);
 while(state.phase!=='finished')v64Step(career,fixture,state);
 const record=v64FinishFixture(career,fixture,state);
 return{homeGoals:record.score[0],awayGoals:record.score[1],penalties:null,winnerId:null};
}
function v64ArchiveSeason(career){
 const season=career.world.season;
 for(const competition of v62Current(career))for(const fixture of competition.fixtures){
  if(!fixture.result)throw Error('Ein Spiel der abgelaufenen Saison fehlt.');
  if(fixture.plan)fixture.lineups=[fixture.plan.home.starters,fixture.plan.away.starters];
  if(fixture.matchRecord)fixture.switches=fixture.matchRecord.substitutions.map(item=>[item.minute,item.side,item.outPid,item.inPid]);
  delete fixture.plan;delete fixture.matchRecord;delete fixture.coachExpectations;delete fixture.managerExpectation;
 }
 for(const player of [...career.world.clubs.flatMap(club=>club.roster),...(career.world.market?.freePlayers||[])]){
  const played=player.history.filter(item=>item.season===season);
  if(!played.length)continue;
  const summary={season,games:played.length,minutes:0,goals:0,assists:0,shots:0};
  for(const item of played)for(const key of ['minutes','goals','assists','shots'])summary[key]+=item[key];
  player.seasons.push(summary);player.history=player.history.filter(item=>item.season!==season);
 }
}
function v64ActiveFixture(career){
 const id=career.world.activeMatch?.fixtureId;
 return id?v62Fixtures(career).find(fixture=>fixture.id===id):null;
}
function v64AdvanceToOwnMatch(career){
 if(career.world.activeMatch)return v64ActiveFixture(career);
 const managed=career.manager.managedClubId;
 while(!career.world.seasonFinished){
  const next=v62Fixtures(career).filter(fixture=>!fixture.result&&(fixture.homeId===managed||fixture.awayId===managed)).sort((a,b)=>a.day-b.day)[0];
  if(!next){v62AdvanceDay(career);continue}
  const earliest=Math.min(...v62Fixtures(career).filter(fixture=>!fixture.result).map(fixture=>fixture.day));
  if(earliest<next.day){v62AdvanceDay(career);continue}
  if(typeof v66ResolveFreeDecisions==='function')v66ResolveFreeDecisions(career,next.day);
  v64PrepareFixture(career,next);
  if(!next.coachExpectations)v63BeforeFixture(career,next);
  career.world.activeMatch={fixtureId:next.id,state:v64MakeState(career,next)};
  career.world.pendingMatchDay=next.day;
  career.updated=new Date().toISOString();
  return next;
 }
 return null;
}
function v64CompleteOwnMatch(career){
 const fixture=v64ActiveFixture(career),state=career.world.activeMatch?.state;
 if(!fixture||!state||state.phase!=='finished')throw Error('Kein beendetes eigenes Spiel vorhanden.');
 if(fixture.result)return fixture;
 const record=v64FinishFixture(career,fixture,state);
 fixture.result={homeGoals:record.score[0],awayGoals:record.score[1],penalties:null,winnerId:null};
 const competition=v62Current(career).find(item=>item.id===fixture.competitionId);
 if(competition.type==='league'||competition.type==='europe'&&fixture.round.startsWith('R'))v62ResolveLeague(career,fixture);
 else if(competition.type==='europe'&&fixture.leg===2)v62ResolveSecondLeg(career,fixture,competition);
 else if(competition.type==='europe'&&fixture.round==='F')v62ResolveSingle(career,fixture);
 else if(competition.type==='cup')v62ResolveSingle(career,fixture);
 career.world.eventLog.processedEventIds.push(fixture.id);
 v63AfterFixture(career,fixture);
 if(typeof v66AfterFixture==='function')v66AfterFixture(career,fixture);
 v62AdvanceDay(career);
 career.updated=new Date().toISOString();
 return fixture;
}
