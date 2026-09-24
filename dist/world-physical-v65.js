'use strict';

// Die Weltkarriere nutzt denselben Ball- und Regelablauf wie die bisherige Liga.
let v65WorldActive=null,v65WorldFrame=0,v65LastFrame=0,v65LastSaved=0,v65ProcessedGoals=0,v65PauseRequested=false,v65PendingExit=false,v65PauseTab='lineup',v65PauseTargetTab='lineup',v65SelectedSlot=0,v65Drag=null;
function v65Context(){
 const career=v61CurrentCareer,fixture=career&&v64ActiveFixture(career),state=career?.world.activeMatch?.state;
 return fixture&&state?{career,fixture,state,ownSide:v64UiOwnSide(fixture)}:null;
}
function v65Side(physical,ownSide){return physical===0?ownSide:1-ownSide}
function v65Club(context,physical){const side=v65Side(physical,context.ownSide);return context.career.world.clubs.find(club=>club.id===(side===0?context.fixture.homeId:context.fixture.awayId))}
function v65LineupPositions(context,physical){
 const side=v65Side(physical,context.ownSide),active=v64Active(context.state,side),cells=v64EnsureCells(context.state,side),positions=new Map();
 for(const pid of active)if(context.state.roles[pid]!=='gk')positions.set(pid,cells[pid]);
 return positions;
}
function v65PhysicalPlayer(context,physical,pid){
 const side=v65Side(physical,context.ownSide),source=v64Player(context.career,context.fixture,side,pid),role=context.state.roles[pid],positions=v65LineupPositions(context,physical);
 const copy={...source,cell:positions.get(pid),assignedLine:role,role:v64Orientation(context.state,pid),matchEntryElapsed:0};
 const person=source.keeper?goalkeeper(copy,physical):team(copy,physical);
 person.initialBy=person.by;person.motionX=0;person.motionY=physical===0?-1:1;person.recoverUntil=0;
 return person;
}
function v65ApplyTactics(context){
 if(!match)return;
 match.teamPress=[0,1].map(physical=>context.state.tactics[v65Side(physical,context.ownSide)].pressing==='Früh'?1:0);
 match.teamDirect=[0,1].map(physical=>context.state.tactics[v65Side(physical,context.ownSide)].passing==='Direkt'?1:0);
 match.defenseLines=[0,1].map(physical=>({Tief:-1,Neutral:0,Hoch:1}[context.state.tactics[v65Side(physical,context.ownSide)].defense]||0));
 match.aggression=[0,1].map(physical=>({Vorsichtig:-1,Normal:0,Aggressiv:1}[context.state.tactics[v65Side(physical,context.ownSide)].aggression]||0));
 for(const physical of [0,1]){
  const positions=v65LineupPositions(context,physical),side=v65Side(physical,context.ownSide);
  for(const person of match.people.filter(item=>item.t===physical&&!item.keeper)){
   const cell=positions.get(person.pid),role=context.state.roles[person.pid],point=team({...person,cell},physical);
   person.cell=cell;person.assignedLine=role;person.role=v64Orientation(context.state,person.pid);person.bx=point.bx;person.by=point.by;person.initialBy=point.by;
  }
 }
 const own=context.state.tactics[context.ownSide],pressLabel={Abwartend:'Abwartendes',Ausgewogen:'Ausgewogenes',Früh:'Frühes'}[own.pressing],passLabel={Kurz:'Kurzes',Variabel:'Variables',Direkt:'Direktes'}[own.passing];
 $('#live-plan').textContent=`${own.formation} · ${pressLabel} Pressing · ${passLabel} Passspiel · Abwehrlinie: ${own.defense} · Zweikämpfe: ${own.aggression}`;
 $('#match-plan').textContent=own.formation;
}
function v65CreateMatch(context){
 const people=[];
 for(const physical of [0,1])for(const pid of v64Active(context.state,v65Side(physical,context.ownSide)))people.push(v65PhysicalPlayer(context,physical,pid));
 const home=v65Club(context,0),away=v65Club(context,1),homeColors=v61ClubColors(home),awayColors=v61ClubColors(away);
 match={people,exitedPeople:[],elapsed:0,score:[0,0],shots:[0,0],possession:[0,0],owner:null,flight:null,halftime:false,finished:false,kickoff:null,countdown:0,goalPause:0,pendingKickoff:null,overlayTTL:0,goals:[],aggression:[0,0],setPieceStats:{corners:[0,0],fouls:[0,0],freeKicks:[0,0],penalties:[0,0]},defenseLines:[0,0],throwIn:null,offsideVisual:null,lastTouch:null,slide:null,rebound:null,opponentName:away.name,kits:{user:{main:homeColors[0],trim:homeColors[1],style:'stripe'},opponent:{main:awayColors[0],trim:awayColors[1],style:'stripe'},userKeeper:{main:'#e7b957',trim:'#ffffff',style:'solid'},opponentKeeper:{main:'#516bb4',trim:'#ffffff',style:'solid'}}};
 v65ApplyTactics(context);kickoff(0);note('Bereit zum Anpfiff.','restart');
}
function v65Snapshot(context){
 if(!match||match.flight||match.slide)return false;
 const plain={...match,ownerPid:match.owner?.pid||null,lastPass:match.lastPass?{passerPid:match.lastPass.passer.pid,receiverPid:match.lastPass.receiver.pid,at:match.lastPass.at}:null};
 delete plain.owner;delete plain.flight;delete plain.slide;
 if(plain.setPiece)plain.setPiece={...plain.setPiece,takerPid:plain.setPiece.taker?.pid,taker:undefined};
 if(plain.throwIn)plain.throwIn={...plain.throwIn,takerPid:plain.throwIn.taker?.pid,taker:undefined};
 if(plain.kickoff)plain.kickoff={...plain.kickoff,kickerPid:plain.kickoff.kicker?.pid,supportPid:plain.kickoff.support?.pid,kicker:undefined,support:undefined};
 context.state.physicalSnapshot={match:plain,log:$('#log').innerHTML,event:$('#event').textContent};
 const saved=v64UiSave();if(saved===false)return false;v65LastSaved=performance.now();return true;
}
function v65Restore(context){
 const saved=context.state.physicalSnapshot;if(!saved?.match)return false;
 match=saved.match;match.flight=null;match.slide=null;
 const find=pid=>match.people.find(person=>person.pid===pid)||match.exitedPeople?.find(person=>person.pid===pid);
 match.owner=find(match.ownerPid)||null;delete match.ownerPid;
 if(match.lastPass)match.lastPass={passer:find(match.lastPass.passerPid),receiver:find(match.lastPass.receiverPid),at:match.lastPass.at};
 if(match.setPiece){match.setPiece.taker=find(match.setPiece.takerPid);delete match.setPiece.takerPid}
 if(match.throwIn){match.throwIn.taker=find(match.throwIn.takerPid);delete match.throwIn.takerPid}
 if(match.kickoff){match.kickoff.kicker=find(match.kickoff.kickerPid);match.kickoff.support=find(match.kickoff.supportPid);delete match.kickoff.kickerPid;delete match.kickoff.supportPid}
 $('#log').innerHTML=saved.log||'';$('#event').textContent=saved.event||'';
 if(match.setPiece?.type==='penalty')v50PenaltyVisual(match.setPiece,null);
 else if(match.setPiece)showOverlay(match.setPiece.type==='corner'?'ECKBALL':'FREISTOSS',`${v65Club(context,match.setPiece.team).name} · ${match.setPiece.taker?.name||''}`);
 else if(match.halftimePause>0)showOverlay('HALBZEIT','Kurze Pause vor der zweiten Hälfte');
 else if(match.goalPause>0)showOverlay('TOR!',`${match.goals.at(-1)?.name||''} · ${match.score.join(' : ')}`,true);
 else if(match.kickoff?.phase==='waiting')showOverlay(String(Math.max(1,Math.ceil(match.countdown))),`${v65Club(context,match.kickoff.t).name} hat Anstoß`);
 else if(match.postBanner?.visible)showOverlay('ANPFIFF','Gleich rollt der Ball');
 else hideOverlay();
 v65ProcessedGoals=match.goals.length;v65ApplyTactics(context);return true;
}
function v65SyncMinute(context,target){
 const state=context.state,fixture=context.fixture;
 while(state.minute<Math.min(90,target)){
  state.minute++;
  for(const physical of [0,1])for(const pid of v64Active(state,v65Side(physical,context.ownSide))){
   state.minutes[pid]++;
   const player=v64Player(context.career,fixture,v65Side(physical,context.ownSide),pid),tactic=state.tactics[v65Side(physical,context.ownSide)],full=v64Workload(player,tactic);
   state.fresh[pid]=Math.max(0,state.fresh[pid]-full/90);
  }
  if(state.minute===45)state.events.push({minute:45,type:'halftime'});
 }
 state.score[context.ownSide]=match.score[0];state.score[1-context.ownSide]=match.score[1];
}
function v65PhysicalSwap(context,change){
 const physical=change.side===context.ownSide?0:1,index=match.people.findIndex(person=>person.pid===change.outPid),out=match.people[index];
 if(index<0)throw Error('Ausgewechselter Spieler fehlt auf dem Feld.');
 match.exitedPeople.push(out);
 const incoming=v65PhysicalPlayer(context,physical,change.inPid);
 incoming.x=out.x;incoming.y=out.y;incoming.tx=out.tx;incoming.ty=out.ty;incoming.matchEntryElapsed=match.elapsed;
 match.people[index]=incoming;
 if(match.owner===out)match.owner=incoming;
 if(match.setPiece?.taker===out)match.setPiece.taker=incoming;
 if(match.throwIn?.taker===out)match.throwIn.taker=incoming;
 if(match.kickoff?.kicker===out)match.kickoff.kicker=incoming;
 if(match.kickoff?.support===out)match.kickoff.support=incoming;
 if(match.lastPass?.passer===out||match.lastPass?.receiver===out)match.lastPass=null;
 if(match.setPiece?.type==='penalty'&&match.setPiece.phase==='waiting')v50PenaltyVisual(match.setPiece,null);
 note(`Wechsel: ${out.name} geht, ${incoming.name} kommt.`, 'major');
 $('#v51-live-status')?.remove();v51LastLiveStep=-1;updateTeamStats();
}
function v65Stopped(){return !match.flight&&!match.slide&&(match.goalPause>0||match.halftimePause>0||match.setPiece?.phase==='waiting'||match.throwIn||match.kickoff?.phase==='waiting'||match.postBanner)}
function v65AfterStep(context){
 const state=context.state;
 v65SyncMinute(context,displayMatchMinute(match.elapsed));
 let goal=false;
 while(v65ProcessedGoals<match.goals.length){
  const entry=match.goals[v65ProcessedGoals++],physical=entry.team,person=[...match.people,...match.exitedPeople].find(item=>item.t===physical&&item.name===entry.name);
  state.events.push({minute:entry.minute,type:'goal',side:v65Side(physical,context.ownSide),scorerPid:person?.pid||null,assistPid:null});goal=true;
 }
 const halftime=state.minute>=45&&match.halftimePause>0&&!state.halftimeAiDone;
 if(halftime)state.halftimeAiDone=true;
 if(goal||halftime||state.minute>0&&state.minute!==45&&state.minute%15===0)for(const side of [0,1])v64AiAdjust(context.career,context.fixture,state,side,goal?'Tor':halftime?'Halbzeit':'Reguläre Prüfung');
 v65ApplyTactics(context);
 if(v65Stopped()&&state.pending.some(items=>items.length)){
  const changes=v64ExecutePending(context.career,context.fixture,state,match.halftimePause>0?'Halbzeit':'Spielunterbrechung');
  for(const change of changes)v65PhysicalSwap(context,change);
  v65ApplyTactics(context);
 }
 if(!match.flight&&!match.slide&&performance.now()-v65LastSaved>700)v65Snapshot(context);
}
function v65Finish(){
 const context=v65Context();if(!context||match.finished)return;
 const state=context.state;v65SyncMinute(context,90);running=false;clearInterval(v65WorldFrame);v65PauseRequested=false;match.finished=true;match.flight=null;hideOverlay();
 const everyone=[...match.people,...match.exitedPeople];state.ratings={};
 for(const person of everyone){
  const pid=person.pid;person.stats.cleanSheet=match.score[1-person.t]===0?1:0;
  state.stats[pid]={...person.stats};
  state.ratings[pid]=performanceRating(person);
 }
 state.phase='finished';state.score[context.ownSide]=match.score[0];state.score[1-context.ownSide]=match.score[1];
 state.postMatchReport=v65WorldReport(context,everyone);state.postMatchStep='report';
 delete state.physicalSnapshot;
 v64CompleteOwnMatch(context.career);v64UiSave();
 $('#board-label').textContent='ABPFIFF';$('#match-title').textContent=`Abpfiff · ${v65Club(context,0).name} ${match.score[0]} : ${match.score[1]} ${v65Club(context,1).name}`;
 note('Abpfiff! Die Partie ist beendet.','major');v65RenderReport(context);v65UpdateControls(context);v58Refresh();draw();v65ShowPostMatch(context);
 if(v65PendingExit){v65PendingExit=false;v65Leave(true)}
}
function v65RenderReport(context){
 const people=[...match.people,...match.exitedPeople].filter(person=>person.t===0),panel=$('#player-stats');
 panel.innerHTML=`<h3>Spielerstatistik</h3><div class="stat-row stat-head"><span>Spieler</span><span>Leistung</span><span>Werte</span></div>${people.map(person=>`<div class="stat-row"><b>${escapeHTML(person.name)}</b><span>${context.state.minutes[person.pid]>=20?performanceText(context.state.ratings[person.pid]):'ohne Note'}</span><span>${context.state.minutes[person.pid]} Min. · ${v64UiCount(person.stats.goals||0,'Tor','Tore')} · ${v64UiCount(person.stats.assists||0,'Vorlage','Vorlagen')} · ${v64UiCount(person.stats.shots||0,'Schuss','Schüsse')}</span></div>`).join('')}`;panel.hidden=false;
}
function v65PauseSelection(context){
 const {career,fixture,state,ownSide}=context,active=v64Active(state,ownSide),roster=v64Side(career,fixture,ownSide),pid=active[v65SelectedSlot],player=roster.find(item=>item.pid===pid),role=state.roles[pid],fresh=state.fresh[pid]??player.fresh;
 const otherSlots=active.map((id,index)=>({id,index,player:roster.find(item=>item.pid===id)})).filter(item=>item.index!==v65SelectedSlot&&item.player.keeper===player.keeper);
 return`<div class="v64-selection"><p class="eyebrow">Ausgewählter Spieler · ${v64Roles[role]}</p><div class="v64-selection-head"><strong>${v61FlagSVG(player.nation)} ${escapeHTML(player.name)}</strong>${v51StatusHTML(player,fresh)}</div><p>${v61PositionNames[player.line]} · ${player.age} Jahre · Nr. ${escapeHTML(player.n)}</p>${v55TopSkillsHTML(player)}${v64OrientationHTML(state,pid)}<button type="button" class="menu-action" data-v65-profile="${escapeHTML(pid)}">Spielerprofil ansehen</button>${otherSlots.length?`<label>Position mit Mitspieler tauschen<select id="v65-swap-target">${otherSlots.map(item=>`<option value="${item.index}">${escapeHTML(item.player.name)} · ${v64Roles[state.roles[item.id]]}</option>`).join('')}</select></label><button type="button" class="menu-action" data-v65-swap>Positionen tauschen</button>`:''}</div>`;
}
function v65PauseBench(context){
 const {career,fixture,state,ownSide}=context,active=v64Active(state,ownSide),bench=v64Bench(state,ownSide),roster=v64Side(career,fixture,ownSide),selected=roster.find(item=>item.pid===active[v65SelectedSlot]),pending=state.pending[ownSide],used=state.substitutions.filter(item=>item.side===ownSide).length,remaining=2-used-pending.length;
 return`<section class="v64-bench-section compact-bench"><div class="compact-bench-head"><h3>Ersatzbank</h3><span>${bench.length} / 5 · Für Wechsel auf ein Trikot ziehen</span></div><div class="bench-strip v64-bench-strip">${bench.map(pid=>{const item=roster.find(player=>player.pid===pid),fresh=state.fresh[pid]??item.fresh;return`<article class="bench-chip v64-bench-chip"><i class="fitness-dot ${fresh<52?'tired':fresh<72?'ready':'fresh'}"></i><div class="bench-select" data-v65-bench="${escapeHTML(pid)}"><span class="bench-title">${v61FlagSVG(item.nation)}<b>#${escapeHTML(item.n)} ${escapeHTML(item.name)}</b></span><span class="bench-meta">${v61PositionNames[item.line]} · ${freshText(fresh)}</span>${v51StatusHTML({...item,fresh},fresh)}<span class="bench-skills">${v55TopSkillsHTML(item)}</span></div><button type="button" class="player-link" data-v65-profile="${escapeHTML(pid)}">Details</button></article>`}).join('')}</div><p class="lineup-status" role="status">${remaining} Wechsel noch möglich · Für einen Wechsel den Ersatzspieler auf ein Feldtrikot ziehen.</p></section>`;
}
function v65PausePending(context){
 const {state,ownSide}=context,pending=state.pending[ownSide];
 return pending.length?`<div class="v64-sub-panel"><h3>Vorgemerkte Wechsel</h3><ul class="v64-pending">${pending.map((item,index)=>`<li>${escapeHTML(v64UiName(item.outPid))} → ${escapeHTML(v64UiName(item.inPid))} <button type="button" class="menu-action" data-v64-cancel="${index}">Entfernen</button></li>`).join('')}</ul></div>`:'';
}
function v65PausePitch(context){
 const {career,fixture,state,ownSide}=context,own=v65Club(context,0),other=v65Club(context,1);
 const replacements=Object.fromEntries(state.pending[ownSide].map(item=>[item.outPid,item.inPid]));
 const ratings=Object.fromEntries((match?.people||[]).filter(person=>person.t===0).map(person=>[person.pid,performanceRating(person)]));
 return`<div class="v64-board"><div>${v61CrestSVG(own)}<strong>${escapeHTML(own.name)}</strong></div><span aria-live="polite">${state.score[ownSide]} : ${state.score[1-ownSide]}</span><div>${v61CrestSVG(other)}<strong>${escapeHTML(other.name)}</strong></div></div><p class="v64-minute">Spielpause · ${state.minute}′</p>${v64UiPrematchPitch(career,fixture,state,ownSide,{starters:v64Active(state,ownSide),replacements,ratings,selected:v65SelectedSlot,pickAttribute:'data-v65-pick-slot',label:'Deine Spieler auf dem Spielfeld'})}${v65PauseBench(context)}`;
}
function v65SwapPositions(context,otherSlot,firstSlot=v65SelectedSlot){
 const active=v64Active(context.state,context.ownSide),first=active[firstSlot],second=active[otherSlot];
 if(!first||!second||first===second||v64Player(context.career,context.fixture,context.ownSide,first).keeper!==v64Player(context.career,context.fixture,context.ownSide,second).keeper)throw Error('Diese Positionen können nicht getauscht werden.');
 if(context.state.roles[first]==='gk')return;
 v64MoveCell(context.career,context.fixture,context.state,context.ownSide,first,v64EnsureCells(context.state,context.ownSide)[second]);
 v65ApplyTactics(context);v65Snapshot(context);v65UpdateControls(context);draw();
}
function v65UpdateControls(context){
 let panel=$('#v65-controls');if(!panel){panel=document.createElement('section');panel.id='v65-controls';panel.className='v64-controls';$('#match-info').insertBefore(panel,$('#match-info').querySelector('.match-stat-header'))}
 const {state,fixture,ownSide}=context;
 let quick=$('#v65-quick-nav');if(!quick){quick=document.createElement('nav');quick.id='v65-quick-nav';quick.setAttribute('aria-label','Spielpause öffnen');quick.innerHTML='<button type="button" data-v65-quick="lineup" aria-label="Aufstellung öffnen">Aufstellung</button><button type="button" data-v65-quick="tactics" aria-label="Taktik öffnen">Taktik</button>';v58Bar.querySelector('.career-progress-controls').insertBefore(quick,v58Button)}quick.hidden=state.phase!=='live';
 let tabs=$('#v65-pause-tabs');if(!tabs){tabs=document.createElement('nav');tabs.id='v65-pause-tabs';tabs.className='prematch-tabs v64-prematch-tabs';tabs.setAttribute('aria-label','Während der Spielpause');$('#game-screen .workspace').before(tabs)}
 let pitch=$('#v65-plan-view');if(!pitch){pitch=document.createElement('div');pitch.id='v65-plan-view';$('#match-area').before(pitch)}
 const paused=state.phase==='paused';tabs.hidden=!paused;pitch.hidden=!paused;$('#match-area').hidden=paused;$('#heading').textContent=paused?'Dein Spiel pausiert.':'Dein Spiel läuft.';
 if(paused){tabs.innerHTML=`<button type="button" data-v65-tab="lineup" class="${v65PauseTab==='lineup'?'active':''}" aria-pressed="${v65PauseTab==='lineup'}">Aufstellung</button><button type="button" data-v65-tab="tactics" class="${v65PauseTab==='tactics'?'active':''}" aria-pressed="${v65PauseTab==='tactics'}">Taktik</button>`;pitch.innerHTML=v65PausePitch(context);pitch.querySelectorAll('.v64-bench-chip').forEach(card=>{card.draggable=true;card.dataset.v65BenchCard=card.querySelector('[data-v65-bench]')?.dataset.v65Bench})}
 panel.hidden=state.phase==='live';panel.innerHTML=paused?(v65PauseTab==='lineup'?`<h2>Aufstellung</h2><p>Spieler auf dem Feld wählen und einen Ersatz von der Bank antippen. Wechsel erfolgen bei der nächsten Unterbrechung.</p>${v65PauseSelection(context)}${v65PausePending(context)}`:`<h2>Teamtaktik</h2><p>Wähle Formation und Spielidee. Die Änderung gilt sofort.</p>${v64UiTactics(state,ownSide)}`)+`<button type="button" class="primary v64-resume" data-v65-resume>Spiel fortsetzen →</button><p id="v65-error" role="alert" class="v61-error"></p>`:state.phase==='live'?'':'<h2>Spiel beendet</h2><button type="button" class="primary" data-v65-continue>Zur Karriereübersicht →</button>';
}
function v65WorldReport(context,people){
 const flagCodes={ESP:'ES',ITA:'IT',GER:'DE',FRA:'FR',POR:'PT',ENG:'GB'};
 return{ownName:v65Club(context,0).name,opponentName:v65Club(context,1).name,score:[...match.score],shots:[...match.shots],possession:[...match.possession],setPieceStats:match.setPieceStats?structuredClone(match.setPieceStats):null,players:people.map(person=>{const change=context.state.substitutions.find(item=>item.outPid===person.pid||item.inPid===person.pid);return{name:person.name,n:person.n,nation:flagCodes[person.nation]||person.nation,keeper:Boolean(person.keeper),team:person.t,minutes:context.state.minutes[person.pid]||0,substitution:change?{minute:change.minute,direction:change.inPid===person.pid?'in':'out'}:null,stats:{...person.stats,rating:context.state.ratings[person.pid]??0}}})};
}
function v65CompetitionResultsHTML(context){
 const {career,fixture}=context,competition=v62Current(career).find(item=>item.id===fixture.competitionId),type=competition.type,label=type==='league'?v62LeagueLabel(competition.country):type==='cup'?`Nationaler Pokal · ${escapeHTML(v61CountryNames[competition.country])}`:'Europacup';
 const games=competition.fixtures.filter(item=>item.round===fixture.round&&item.result).sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
 const results=`<section class="v47-competition-section"><h3>${escapeHTML(fixture.round)} · Alle Ergebnisse</h3>${games.map(item=>v62ResultHTML(career,item)).join('')||'<p>In dieser Runde liegen noch keine weiteren Ergebnisse vor.</p>'}</section>`;
 const table=type==='cup'?'':`<section class="v47-competition-section"><h3>${type==='league'?'Ligatabelle':'Europacup-Tabelle'}</h3>${v62TableHTML(career,competition)}</section>`;
 const leaders=type==='league'?`<div class="v47-leaders">${[['goals','Ligatorschützenliste'],['assists','Liga-Assistliste']].map(([key,title])=>{const rows=v62StatLeaders(career,competition,key);return`<section class="v47-competition-section"><h3>${title}</h3>${rows.map((entry,index)=>`<div class="v47-leader-row"><span>${index+1}.</span><b>${escapeHTML(entry.player.name)}<small>${escapeHTML(entry.club?.name||'Vereinslos')}</small></b><strong>${entry.value}</strong></div>`).join('')||'<p class="help">Noch keine Einträge.</p>'}</section>`}).join('')}</div>`:'';
 return`<div class="v47-competition-body"><div class="v47-competition-head"><div><h2 id="v47-competition-title">${label}</h2><p>Saison ${career.world.season} · ${v62Date(fixture.day)} · Ergebnisse nach deinem Spiel</p></div><div class="v47-competition-head-actions"><button type="button" class="v47-competition-done">Zur Vereinszentrale</button><button type="button" class="v47-competition-close" aria-label="Ergebnisübersicht schließen">×</button></div></div><div class="v47-competition-grid ${type==='cup'?'cup':''}">${results}${table}</div>${leaders}</div>`;
}
function v65ShowPostMatch(context){
 const {state}=context,report=state.postMatchReport;if(!report||state.postMatchStep==='done')return;
 document.body.classList.add('v65-world-postmatch');
 if(state.postMatchStep==='report'){
  if(v47Dialog.open)return;
  v47Dialog.innerHTML=v47ReportHTML(report);
  v47Dialog.onclick=event=>{const row=event.target.closest('[data-report-player]');if(row)v47OpenPlayerStats(report,Number(row.dataset.reportPlayer))};
  const next=()=>{v47PlayerDialog.close?.();v47Dialog.close?.();state.postMatchStep='competition';v64UiSave();v65ShowPostMatch(context)};
  v47Dialog.querySelectorAll('.v47-close,.v47-done,.v47-menu').forEach(button=>button.onclick=next);
  v47Dialog.oncancel=event=>{event.preventDefault();next()};
  v47Dialog.showModal();v58Refresh();return;
 }
 if(v47CompetitionDialog.open)return;
 v47CompetitionDialog.innerHTML=v65CompetitionResultsHTML(context);
 const done=()=>{v47CompetitionDialog.close?.();document.body.classList.remove('v65-world-postmatch');state.postMatchStep='done';v64UiSave();v65Leave(false).catch(v65ExitError)};
 v47CompetitionDialog.querySelectorAll('.v47-competition-close,.v47-competition-done').forEach(button=>button.onclick=done);
 v47CompetitionDialog.oncancel=event=>{event.preventDefault();done()};
 v47CompetitionDialog.showModal();v58Refresh();
}
function v65Show(context){
 const game=$('#game-screen');v61WorldScreen.hidden=true;startScreen.hidden=true;game.hidden=false;document.body.classList.add('v65-world-match');
 v64UiMenuVisible(true);
 for(const id of ['#setup-pitch','#pitch-help','#player-panel','#tactics-panel','#start','#duration','#back'])$(id).hidden=true;
 for(const id of ['#match-area','#match-info'])$(id).hidden=false;
 const own=v65Club(context,0),other=v65Club(context,1),competition=v62Current(context.career).find(item=>item.id===context.fixture.competitionId);
 let adboards=$('#v65-adboards');if(!adboards){adboards=document.createElement('div');adboards.id='v65-adboards';$('#match-area .v42-pitch-stage').append(adboards)}
 const home=v66Club(context.career,context.fixture.homeId),sponsor=home.sponsors?.find(item=>item.id===home.sponsorId);
 adboards.innerHTML=sponsor?['top-left','top-right','bottom-left','bottom-right'].map(position=>`<div class="v65-adboard ${position}">${v66SponsorLogoSVG(home.countryId,sponsor.name)}<span>${escapeHTML(sponsor.name)}</span></div>`).join(''):'';adboards.hidden=!sponsor;
 $('#heading').textContent='Dein Spiel läuft.';$('#subtitle').textContent=`${competition.type==='league'?`${v61CountryNames[competition.country]} · Liga 1`:competition.type==='cup'?'Pokal':'Europacup'} · ${own.name} gegen ${other.name}`;
 $('#game-screen .board-top strong').textContent=own.name;
 $('#board-label').textContent=context.state.phase==='paused'?'PAUSE':'LIVE';
 const labels=$$('#game-screen .scoreboard span');labels[0].textContent=own.name;labels[1].textContent=other.name;
 $('#match-area .match-meta span:last-child').textContent=competition.type==='league'?'LIGASPIEL':competition.type==='cup'?'POKALSPIEL':'EUROPACUP';
 $('#match-title').textContent='Dein Team spielt.';
 menuButton.hidden=true;
 if(!match||!v65WorldActive||v65WorldActive.fixture.id!==context.fixture.id){
  v65WorldActive=context;
  if(!v65Restore(context)){v65ProcessedGoals=0;$('#log').innerHTML='';v65CreateMatch(context)}
 }
 running=context.state.phase==='live';v65ApplyTactics(context);v65UpdateControls(context);updateTeamStats();draw();
 if(running)v65StartLoop();v58Refresh();
 window.scrollTo(0,0);
}
function v65StartLoop(){
 clearInterval(v65WorldFrame);v65LastFrame=performance.now();
 const tick=()=>{
  const context=v65Context();if(!context||context.state.phase!=='live'||!v65WorldActive)return;
  const now=performance.now();
  const real=Math.min((now-v65LastFrame)/1000,.05);v65LastFrame=now;
  try{step(real*MATCH_SPEED,real);if(context.state.phase==='live'&&!match.finished)v65AfterStep(context);draw();if(v65PauseRequested&&!match.flight&&!match.slide&&context.state.phase==='live'){v65PauseRequested=false;v65Pause();if(v65PendingExit){v65PendingExit=false;v65Leave(true).catch(v65ExitError)}}}
  catch(error){context.state.phase='paused';running=false;clearInterval(v65WorldFrame);v65Snapshot(context);v65UpdateControls(context);const target=$('#v65-error');if(target)target.textContent=error.message;return}
 };
 v65WorldFrame=setInterval(tick,40);
}
function v65Pause(){const context=v65Context();if(!context||context.state.phase!=='live')return false;if(match.flight||match.slide){v65PauseRequested=true;const pause=$('#v65-controls [data-v65-pause]');if(pause){pause.textContent='Pause nach der Ballaktion …';pause.disabled=true}return false}context.state.phase='paused';v65PauseTab=v65PauseTargetTab;v65PauseTargetTab='lineup';v65SelectedSlot=0;running=false;clearInterval(v65WorldFrame);$('#board-label').textContent='PAUSE';v65Snapshot(context);v65UpdateControls(context);v58Refresh();$('#v65-pause-tabs')?.scrollIntoView({behavior:'smooth',block:'start'});return true}
function v65Resume(){const context=v65Context();if(!context||context.state.phase!=='paused')return;context.state.phase='live';running=true;$('#board-label').textContent='LIVE';v65Snapshot(context);v65UpdateControls(context);v65StartLoop();v58Refresh()}
function v65ExitError(error){v64MatchMenu.open=true;v64MatchMenu.querySelector('[role="alert"]').textContent=error.message;const message=$('#v65-error');if(message)message.textContent=error.message}
async function v65Leave(toStart){
 const context=v65Context();if(!context)return;
 if(context.state.phase==='live'&&!v65Pause()){v65PendingExit=toStart;return}
 if(context.state.phase==='paused')v65Snapshot(context);
 await v61LastWrite;
 if(!toStart){const active=context.career.world.activeMatch;delete context.career.world.activeMatch;try{await v64UiSave()}catch(error){context.career.world.activeMatch=active;throw error}}
 clearInterval(v65WorldFrame);running=false;v65WorldActive=null;match=null;document.body.classList.remove('v65-world-postmatch','v65-world-match');$('#v65-adboards')?.remove();$('#v65-quick-nav')?.remove();$('#v65-pause-tabs')?.remove();$('#v65-plan-view')?.remove();$('#game-screen').hidden=true;menuButton.hidden=false;
 v64UiMenuVisible(false);
 if(toStart)v61ShowStart();else v61RenderCareer(context.career)
}
const v65BaseFinishMatch=finishMatch;
finishMatch=function(){return v65WorldActive?v65Finish():v65BaseFinishMatch()};
const v65BaseNote=note;
note=function(message,kind){
 if(v65WorldActive){const context=v65Context();if(context)message=message.replaceAll('FC Viertel',v65Club(context,0).name).replaceAll('SC Hafen',v65Club(context,1).name)}
 return v65BaseNote(message,kind);
};
const v65BaseOverlay=showOverlay;
showOverlay=function(title,copy,...rest){
 if(v65WorldActive){const context=v65Context();if(context)copy=copy.replaceAll('FC Viertel',v65Club(context,0).name).replaceAll('SC Hafen',v65Club(context,1).name)}
 return v65BaseOverlay(title,copy,...rest);
};
const v65BaseTeamLabel=v50Name;
v50Name=function(side){const context=v65WorldActive&&v65Context();return context?v65Club(context,side).name:v65BaseTeamLabel(side)};
const v65BaseLiveFreshness=v51LiveFreshness;
v51LiveFreshness=function(person){const context=v65WorldActive&&v65Context();return context&&person.pid&&context.state.fresh[person.pid]!==undefined?context.state.fresh[person.pid]:v65BaseLiveFreshness(person)};
const v65BaseAbility=ability;
ability=function(person,key){
 const value=v65BaseAbility(person,key),context=v65WorldActive&&v65Context();if(!context||!match||!person.pid)return value;
 const current=context.state.fresh[person.pid]??person.fresh,extraFatigue=key!=='sta'?(person.matchEntryElapsed||0)/75*Math.max(0,16-(person.sta||14))*.22:0;
 return clamp(value-(person.fresh-current)*.016+extraFatigue,1,20);
};
const v65BaseLiveBoard=v25UpdateLiveBoard;
v25UpdateLiveBoard=function(){
 v65BaseLiveBoard();const context=v65WorldActive&&v65Context();if(!context)return;
 const names=$$('#match-area .score-name-text'),formations=$$('#match-area .score-team small');
 if(names[0])names[0].textContent=v65Club(context,0).name;if(names[1])names[1].textContent=v65Club(context,1).name;
 for(const physical of [0,1])if(formations[physical])formations[physical].textContent=context.state.tactics[v65Side(physical,context.ownSide)].formation;
 for(const node of $$('#match-info [data-stat-home]'))node.textContent=v65Club(context,0).name;
 for(const node of $$('#match-info [data-stat-away]'))node.textContent=v65Club(context,1).name;
};
const v65BaseLivePlayerHTML=v59LivePlayerHTML;
v59LivePlayerHTML=function(person){const html=v65BaseLivePlayerHTML(person),context=v65WorldActive&&v65Context(),previous=escapeHTML(activeSave?.club||'FC Viertel');return context&&person.t===0?html.replace(`${previous} · Live im Spiel`,`${escapeHTML(v65Club(context,0).name)} · Live im Spiel`):html};
const v65BaseRender=v64UiRender;
v64UiRender=function(career){const context=v65Context();if(context&&context.state.phase!=='prematch'&&context.state.phase!=='finished')return v65Show(context);const result=v65BaseRender(career);if(context?.state.phase==='finished')v65ShowPostMatch(context);return result};
const v65BaseProgressState=v58State;
v58State=function(){
 const active=v65Context();if(active?.state.phase==='finished'&&(v47Dialog.open||v47CompetitionDialog.open))return{context:v47Dialog.open?'Spielbericht':'Ergebnisse des Wettbewerbs'};
 const context=v65WorldActive&&active;
 if(context&&!$('#game-screen').hidden)return context.state.phase==='live'?{context:'Spiel läuft',label:'Taktik & Wechsel',action:'v65-tactics'}:context.state.phase==='paused'?{context:'Spiel pausiert',label:'Spiel fortsetzen',action:'v65-resume'}:{context:'Abpfiff'};
 return v65BaseProgressState();
};
const v65BaseProgressClick=v58Button.onclick;
v58Button.onclick=function(){const action=v58State()?.action;if(action==='v65-tactics'){v65PauseTargetTab='tactics';v65Pause();return}if(action==='v65-resume'){v65Resume();return}return v65BaseProgressClick()};
v58Bar.addEventListener('click',event=>{const quick=event.target.closest('[data-v65-quick]');if(!quick||!v65WorldActive)return;v65PauseTargetTab=quick.dataset.v65Quick;v65Pause()});
const v65BaseShowStart=v61ShowStart;
v61ShowStart=function(){if(v65WorldActive)return v65Leave(true);return v65BaseShowStart()};
$('#game-screen').addEventListener('click',event=>{
 if(!v65WorldActive)return;
 const profile=event.target.closest?.('[data-v64-pitch-profile]');if(profile){event.stopPropagation();v61OpenProfile(profile.dataset.v64PitchProfile,profile);return}
 const button=event.target.closest('button');if(!button)return;
 const context=v65Context();if(!context)return;
 try{
  if(button.dataset.v65Tab&&context.state.phase==='paused'){v65PauseTab=button.dataset.v65Tab;v65UpdateControls(context);$('#v65-pause-tabs')?.querySelector(`[data-v65-tab="${v65PauseTab}"]`)?.focus();return}
  if(button.dataset.v65PickSlot!==undefined&&context.state.phase==='paused'){v65SelectedSlot=Number(button.dataset.v65PickSlot);v65PauseTab='lineup';v65UpdateControls(context);$('#v65-plan-view')?.querySelector(`[data-v65-pick-slot="${v65SelectedSlot}"]`)?.focus();return}
  if(button.dataset.v64Orientation!==undefined&&context.state.phase==='paused'){const pid=v64Active(context.state,context.ownSide)[v65SelectedSlot];v64SetOrientation(context.state,pid,Number(button.dataset.v64Orientation));v65ApplyTactics(context);v65Snapshot(context);v65UpdateControls(context);draw();return}
  if(button.dataset.v64Cell!==undefined&&context.state.phase==='paused'){
   const pid=v64Active(context.state,context.ownSide)[v65SelectedSlot];
   if(v64MoveCell(context.career,context.fixture,context.state,context.ownSide,pid,Number(button.dataset.v64Cell))){v65ApplyTactics(context);v65Snapshot(context);v65UpdateControls(context);draw()}return;
  }
  if(button.dataset.v65Profile){v61OpenProfile(button.dataset.v65Profile,button);return}
  if(button.hasAttribute('data-v65-swap')&&context.state.phase==='paused'){v65SwapPositions(context,Number($('#v65-swap-target')?.value));return}
  if(button.dataset.v65Bench&&context.state.phase==='paused'){
   v64QueueSubstitution(context.career,context.fixture,context.state,context.ownSide,v64Active(context.state,context.ownSide)[v65SelectedSlot],button.dataset.v65Bench);
   v65Snapshot(context);v65UpdateControls(context);return;
  }
  if(button.dataset.v64TacticKey&&context.state.phase==='paused'){
   const key=button.dataset.v64TacticKey,value=button.dataset.v64TacticValue;
   if(context.state.tactics[context.ownSide][key]===value)return;
   v64ChangeTactics(context.career,context.fixture,context.state,context.ownSide,{[key]:value});v65ApplyTactics(context);v65Snapshot(context);v65UpdateControls(context);draw();
   $('#v65-controls')?.querySelector(`[data-v64-tactic-key="${key}"][data-v64-tactic-value="${value}"]`)?.focus();return;
  }
  if(button.hasAttribute('data-v65-pause'))return v65Pause();
  if(button.hasAttribute('data-v65-resume'))return v65Resume();
  if(button.hasAttribute('data-v65-continue'))return v65Leave(false).catch(v65ExitError);
  if(button.hasAttribute('data-v64-queue')){v64QueueSubstitution(context.career,context.fixture,context.state,context.ownSide,$('#v64-out').value,$('#v64-in').value);v65Snapshot(context);return v65UpdateControls(context)}
  if(button.dataset.v64Cancel!==undefined){v64CancelPending(context.state,context.ownSide,Number(button.dataset.v64Cancel));v65Snapshot(context);return v65UpdateControls(context)}
 }catch(error){const target=$('#v65-error');if(target)target.textContent=error.message}
});
$('#game-screen').addEventListener('change',event=>{
 if(!v65WorldActive)return;
 const target=event.target,context=v65Context();if(!context||context.state.phase!=='paused')return;
 try{
  if(target.id==='v64-out'){
   const keeper=v64Player(context.career,context.fixture,context.ownSide,target.value).keeper;
   const bench=v64Bench(context.state,context.ownSide).filter(pid=>!context.state.pending[context.ownSide].some(item=>item.inPid===pid)&&v64Player(context.career,context.fixture,context.ownSide,pid).keeper===keeper);
   $('#v64-in').innerHTML=bench.map(pid=>`<option value="${escapeHTML(pid)}">${escapeHTML(v64Player(context.career,context.fixture,context.ownSide,pid).name)}</option>`).join('');return;
  }
  if(target.dataset.v64Tactic){v64ChangeTactics(context.career,context.fixture,context.state,context.ownSide,{[target.dataset.v64Tactic]:target.value});v65ApplyTactics(context);v65Snapshot(context);v65UpdateControls(context);draw()}
 }catch(error){const message=$('#v65-error');if(message)message.textContent=error.message}
});
function v65DragTarget(event){return event.target.closest?.('[data-v64-cell],[data-v65-pick-slot],[data-v65-bench-card]')}
function v65CanDrop(target){
 const context=v65Context();if(!v65Drag||!target||context?.state.phase!=='paused'||v65PauseTab!=='lineup'||v65Drag.kind==='bench'&&target.dataset.v65BenchCard)return false;
 const active=v64Active(context.state,context.ownSide),source=v65Drag.kind==='field'?active[v65Drag.slot]:v65Drag.pid,dest=target.dataset.v65PickSlot!==undefined?active[Number(target.dataset.v65PickSlot)]:target.dataset.v65BenchCard;
 if(target.dataset.v64Cell!==undefined&&!dest)return v65Drag.kind==='field'&&context.state.roles[source]!=='gk';
 if(!source||!dest||source===dest||v64Player(context.career,context.fixture,context.ownSide,source).keeper!==v64Player(context.career,context.fixture,context.ownSide,dest).keeper)return false;
 if(v65Drag.kind==='field'&&target.dataset.v65PickSlot!==undefined)return true;
 const pending=context.state.pending[context.ownSide],outPid=v65Drag.kind==='field'?source:dest,inPid=v65Drag.kind==='bench'?source:dest;
 return context.state.substitutions.filter(item=>item.side===context.ownSide).length+pending.length<2&&!context.state.exited.includes(inPid)&&!pending.some(item=>item.outPid===outPid||item.inPid===inPid);
}
$('#game-screen').addEventListener('dragstart',event=>{
 const context=v65Context();if(context?.state.phase!=='paused'||v65PauseTab!=='lineup')return;
 const target=v65DragTarget(event);if(!target||target.dataset.v65PickSlot===undefined&&target.dataset.v65BenchCard===undefined)return;
 v65Drag=target.dataset.v65PickSlot!==undefined?{kind:'field',slot:Number(target.dataset.v65PickSlot)}:{kind:'bench',pid:target.dataset.v65BenchCard};
 event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','Spieler verschieben');
});
$('#game-screen').addEventListener('dragover',event=>{const target=v65DragTarget(event);if(!v65CanDrop(target))return;event.preventDefault();event.dataTransfer.dropEffect='move';$('#v65-plan-view')?.querySelectorAll('.v64-drag-over').forEach(item=>item.classList.remove('v64-drag-over'));target.classList.add('v64-drag-over')});
$('#game-screen').addEventListener('dragleave',event=>{const target=v65DragTarget(event);if(target&&!target.contains(event.relatedTarget))target.classList.remove('v64-drag-over')});
$('#game-screen').addEventListener('drop',event=>{
 const target=v65DragTarget(event);if(!v65CanDrop(target))return;
 event.preventDefault();v65DropAction(v65Drag,target);
});
function v65DropAction(source,target){
 const context=v65Context(),active=v64Active(context.state,context.ownSide);
 try{
  if(source.kind==='field'&&target.dataset.v64Cell!==undefined){v64MoveCell(context.career,context.fixture,context.state,context.ownSide,active[source.slot],Number(target.dataset.v64Cell));v65ApplyTactics(context);v65Snapshot(context);v65UpdateControls(context);draw()}
  else if(source.kind==='field'&&target.dataset.v65PickSlot!==undefined)v65SwapPositions(context,Number(target.dataset.v65PickSlot),source.slot);
  else v64QueueSubstitution(context.career,context.fixture,context.state,context.ownSide,source.kind==='field'?active[source.slot]:active[Number(target.dataset.v65PickSlot)],source.kind==='bench'?source.pid:target.dataset.v65BenchCard);
  if(!(source.kind==='field'&&(target.dataset.v65PickSlot!==undefined||target.dataset.v64Cell!==undefined))){v65Snapshot(context);v65UpdateControls(context)}
 }catch(error){const message=$('#v65-error');if(message)message.textContent=error.message}finally{v65Drag=null}
}
$('#game-screen').addEventListener('dragend',()=>{v65Drag=null;$('#v65-plan-view')?.querySelectorAll('.v64-drag-over').forEach(item=>item.classList.remove('v64-drag-over'))});
$('#game-screen').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-v64-pitch-profile]')){event.preventDefault();event.stopPropagation();v61OpenProfile(event.target.dataset.v64PitchProfile,event.target)}});
