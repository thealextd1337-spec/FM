'use strict';

// Die neue Welt zeigt ihr Match im vertrauten Spielfeldrahmen, getrennt vom alten Spielstand.
let v64UiTimer=null,v64UiFrame=null,v64SelectedSlot=0,v64UiTab='lineup',v64UiFixtureId=null,v64UiUndo=null,v64UiDrag=null;
function v64UiCount(value,one,many){return`${value} ${value===1?one:many}`}
function v64UiStop(){if(v64UiTimer){clearInterval(v64UiTimer);v64UiTimer=null}if(v64UiFrame){cancelAnimationFrame(v64UiFrame);v64UiFrame=null}}
function v64UiSave(){
 if(!v61CurrentCareer)return;
 const careers=v61ReadCareers();
 return v61SaveCareers(careers.map(career=>career.id===v61CurrentCareer.id?v61CurrentCareer:career));
}
function v64UiFixture(){return v61CurrentCareer&&v64ActiveFixture(v61CurrentCareer)}
function v64UiOwnSide(fixture){return fixture.homeId===v61CurrentCareer.manager.managedClubId?0:1}
function v64UiName(pid){
 const fixture=v64UiFixture(),career=v61CurrentCareer;
 for(const side of [0,1]){const player=v64Side(career,fixture,side).find(item=>item.pid===pid);if(player)return player.name}
 return pid;
}
function v64UiEvent(event){
 const minute=`${event.minute}′`;
 if(event.type==='goal')return`<li><b>${minute} Tor für ${v62Name(v61CurrentCareer,event.side===0?v64UiFixture().homeId:v64UiFixture().awayId)}</b> · ${escapeHTML(v64UiName(event.scorerPid))}</li>`;
 if(event.type==='substitution')return`<li><b>${minute} Wechsel</b> · ${escapeHTML(v64UiName(event.outPid))} → ${escapeHTML(v64UiName(event.inPid))}</li>`;
 return`<li><b>${minute} Halbzeit</b></li>`;
}
function v64UiEvents(state,all=false){return state.events.length?`<ol class="v64-events">${(all?state.events:state.events.slice(-8)).map(v64UiEvent).join('')}</ol>`:'<p class="v62-explainer">Der Spielverlauf erscheint nach Anpfiff.</p>'}
function v64UiTacticButtons(key,values,current,labels){return`<div class="segmented v64-tactic-options">${values.map(value=>`<button type="button" data-v64-tactic-key="${key}" data-v64-tactic-value="${escapeHTML(value)}" class="${current===value?'active':''}" aria-pressed="${current===value}">${escapeHTML(labels?.[value]||value)}</button>`).join('')}</div>`}
function v64UiTactics(state,side){
 const tactic=state.tactics[side];
 const names={'1–1–3':'Sturm','1–2–2':'Offensiv','1–3–1':'Zentrum','2–1–2':'Kompakt','2–2–1':'Balance','3–1–1':'Defensiv'};
 return`<div class="v64-tactics"><fieldset><legend>Grundordnung</legend><div class="formation-presets">${v64Formations.map(value=>`<button type="button" data-v64-tactic-key="formation" data-v64-tactic-value="${value}" class="${tactic.formation===value?'active':''}" aria-pressed="${tactic.formation===value}">${names[value]}<small>${value}</small></button>`).join('')}</div></fieldset><fieldset><legend>Pressing</legend>${v64UiTacticButtons('pressing',v63Pressing,tactic.pressing,{Abwartend:'Abwarten',Früh:'Früh angreifen'})}</fieldset><fieldset><legend>Passspiel</legend>${v64UiTacticButtons('passing',v63Passing,tactic.passing,{Kurz:'Kurze Pässe',Direkt:'Schnell nach vorne'})}</fieldset><fieldset><legend>Abwehrlinie</legend>${v64UiTacticButtons('defense',v63Defense,tactic.defense)}</fieldset><fieldset><legend>Zweikämpfe</legend>${v64UiTacticButtons('aggression',['Vorsichtig','Normal','Aggressiv'],tactic.aggression)}</fieldset><div class="plan-card"><span>DEIN MATCHPLAN</span><strong>${names[tactic.formation]} · ${tactic.formation}</strong><p>Pressing: ${tactic.pressing} · Passspiel: ${tactic.passing} · Abwehrlinie: ${tactic.defense} · Zweikämpfe: ${tactic.aggression}</p></div></div>`;
}
function v64UiLineup(fixture,state,side){
 const plan=side===0?fixture.plan.home:fixture.plan.away,roster=v64Side(v61CurrentCareer,fixture,side);
 return`<div class="v64-lineup">${plan.starters.map((pid,index)=>{const player=roster.find(item=>item.pid===pid),role=state.roles[pid],choices=[pid,...plan.bench.filter(other=>roster.find(item=>item.pid===other).keeper===player.keeper)];return`<label><span>${v64Roles[role]}</span><select data-v64-slot="${index}">${choices.map(id=>{const item=roster.find(other=>other.pid===id);return`<option value="${escapeHTML(id)}" ${id===pid?'selected':''}>${escapeHTML(item.name)} · ${v64Roles[item.line]}</option>`}).join('')}</select></label>`}).join('')}</div>`;
}
function v64UiPending(fixture,state,side){
 const pending=state.pending[side],active=v64Active(state,side),bench=v64Bench(state,side),roster=v64Side(v61CurrentCareer,fixture,side),used=state.substitutions.filter(item=>item.side===side).length;
 const remaining=2-used-pending.length;
 const availableBench=bench.filter(pid=>!pending.some(item=>item.inPid===pid)),eligibleOut=active.filter(pid=>!pending.some(item=>item.outPid===pid)&&availableBench.some(other=>roster.find(item=>item.pid===other).keeper===roster.find(item=>item.pid===pid).keeper)).sort((a,b)=>Number(roster.find(item=>item.pid===a).keeper)-Number(roster.find(item=>item.pid===b).keeper));
 const initialKeeper=eligibleOut.length?roster.find(item=>item.pid===eligibleOut[0]).keeper:false,eligibleIn=availableBench.filter(pid=>roster.find(item=>item.pid===pid).keeper===initialKeeper);
 return`<div class="v64-sub-panel"><h3>Spielerwechsel</h3><p>Bis zu zwei Wechsel. Eine Vormerkung wird erst bei der nächsten Spielunterbrechung ausgeführt.</p>${pending.length?`<ul class="v64-pending">${pending.map((item,index)=>`<li>${escapeHTML(v64UiName(item.outPid))} → ${escapeHTML(v64UiName(item.inPid))} <button type="button" class="menu-action" data-v64-cancel="${index}">Entfernen</button></li>`).join('')}</ul>`:''}<p>${remaining} Wechsel noch möglich</p>${remaining>0&&eligibleOut.length?`<div class="v64-sub-choices"><label>Vom Feld<select id="v64-out">${eligibleOut.map(pid=>`<option value="${escapeHTML(pid)}">${escapeHTML(v64UiName(pid))}</option>`).join('')}</select></label><label>Von der Bank<select id="v64-in">${eligibleIn.map(pid=>`<option value="${escapeHTML(pid)}">${escapeHTML(roster.find(item=>item.pid===pid).name)}</option>`).join('')}</select></label><button type="button" class="menu-action" data-v64-queue>Wechsel vormerken</button></div>`:''}</div>`;
}
function v64UiResult(fixture,state,side){
 const record=fixture.matchRecord,own=record.players.filter(item=>item.side===side),other=record.players.filter(item=>item.side!==side),list=items=>`<div class="v64-result-players">${items.map(item=>`<div><strong>${escapeHTML(v64UiName(item.pid))}</strong><span>${item.minutes} Min. · ${v64UiCount(item.goals,'Tor','Tore')} · ${v64UiCount(item.assists,'Vorlage','Vorlagen')}</span></div>`).join('')}</div>`;
 return`<div class="v64-result"><h2>Abpfiff</h2><p>Die Partie und die übrigen Begegnungen dieses Kalendertags sind gespeichert.</p><h3>Dein Verein</h3>${list(own)}<h3>Gegner</h3>${list(other)}</div>`;
}
function v64UiAdboards(clubs){
 const sponsors=clubs.map(club=>({club,offer:club.sponsors?.find(item=>item.id===club.sponsorId)})).filter(item=>item.offer);
 return sponsors.length?`<div class="v64-adboards" aria-label="Werbebanner">${sponsors.map(({club,offer})=>`<div class="v64-adboard">${v66SponsorLogoSVG(club.countryId,offer.name)}<span>${escapeHTML(offer.name)}</span></div>`).join('')}</div>`:'';
}
function v64UiPrematchPitch(career,fixture,state,side){
 const plan=side===0?fixture.plan.home:fixture.plan.away,roster=v64Side(career,fixture,side),groups={gk:[],def:[],mid:[],att:[]};
 plan.starters.forEach((pid,slot)=>groups[state.roles[pid]]?.push({pid,slot}));
 const positions={gk:84,def:64,mid:42,att:20};
 const players=Object.entries(groups).flatMap(([role,items])=>items.map(({pid,slot},index)=>{const player=roster.find(item=>item.pid===pid),x=items.length===1?50:items.length===2?28+index*44:20+index*30;
  return`<button type="button" draggable="${role!=='gk'}" class="v64-field-player ${role==='gk'?'is-keeper':''}" style="left:${x}%;top:${positions[role]}%" data-v64-pick-slot="${slot}" aria-label="${escapeHTML(player.name)}, ${v64Roles[role]}, auswählen oder verschieben" aria-pressed="${slot===v64SelectedSlot}"><span class="v64-field-shirt">${escapeHTML(player.n)}</span><span class="v64-field-name">${escapeHTML(player.name.split(' ').at(-1))}</span></button>`;
 })).join('');
 const club=career.world.clubs.find(item=>item.id===(side===0?fixture.homeId:fixture.awayId)),colors=v61ClubColors(club);
 return`<div class="v64-prematch-field" style="--v64-shirt:${escapeHTML(colors[0])};--v64-shirt-edge:${escapeHTML(colors[1])}" aria-label="Deine Startelf auf dem Spielfeld"><div class="v64-field-lines" aria-hidden="true"><span class="v64-field-box"></span><span class="v64-field-half"></span><span class="v64-field-circle"></span></div><span class="v64-field-direction">ANGRIFF ↑</span>${players}</div>`;
}
function v64UiPrematchSelection(career,fixture,state,side){
 const plan=side===0?fixture.plan.home:fixture.plan.away,slot=Math.min(v64SelectedSlot,plan.starters.length-1),pid=plan.starters[slot],roster=v64Side(career,fixture,side),player=roster.find(item=>item.pid===pid),role=state.roles[pid],bench=plan.bench.map(id=>roster.find(item=>item.pid===id));
 const choices=[player,...bench.filter(item=>item.keeper===player.keeper)];
 const otherSlots=plan.starters.map((id,index)=>({id,index,other:roster.find(item=>item.pid===id)})).filter(item=>item.index!==slot&&item.other.keeper===player.keeper);
 return`<div class="v64-selection"><p class="eyebrow">Ausgewählter Spieler · ${v64Roles[role]}</p><div class="v64-selection-head"><strong>${v61FlagSVG(player.nation)} ${escapeHTML(player.name)}</strong>${v51StatusHTML(player,player.fresh)}</div><p>${v61PositionNames[player.line]} · ${player.age} Jahre · Nr. ${escapeHTML(player.n)}</p>${v55TopSkillsHTML(player)}<button type="button" class="menu-action" data-v64-profile="${escapeHTML(pid)}">Spielerprofil ansehen</button><label>Startplatz besetzen<select data-v64-slot="${slot}">${choices.map(item=>`<option value="${escapeHTML(item.pid)}" ${item.pid===pid?'selected':''}>${escapeHTML(item.name)} · ${v61PositionNames[item.line]}</option>`).join('')}</select></label>${otherSlots.length?`<label>Position mit Mitspieler tauschen<select id="v64-swap-target">${otherSlots.map(item=>`<option value="${item.index}">${escapeHTML(item.other.name)} · ${v64Roles[state.roles[item.id]]}</option>`).join('')}</select></label><button type="button" class="menu-action" data-v64-swap-selected>Positionen tauschen</button>`:''}</div>`;
}
function v64UiPrematchBench(career,fixture,state,side){
 const plan=side===0?fixture.plan.home:fixture.plan.away,roster=v64Side(career,fixture,side),selected=roster.find(item=>item.pid===plan.starters[v64SelectedSlot]);
 return`<section class="v64-bench-section compact-bench"><div class="compact-bench-head"><h3>Ersatzbank</h3><span>${plan.bench.length} / 5 · Antippen oder auf ein Trikot ziehen</span></div><div class="bench-strip v64-bench-strip">${plan.bench.map(pid=>{const item=roster.find(player=>player.pid===pid);return`<article class="bench-chip v64-bench-chip" draggable="true" data-v64-bench-card="${escapeHTML(pid)}"><i class="fitness-dot ${item.fresh<52?'tired':item.fresh<72?'ready':'fresh'}"></i><button type="button" class="bench-select" data-v64-bench="${escapeHTML(pid)}" ${item.keeper!==selected.keeper?'disabled title="Nur gleiche Torwartrolle tauschbar"':''}><span class="bench-title">${v61FlagSVG(item.nation)}<b>#${escapeHTML(item.n)} ${escapeHTML(item.name)}</b></span><span class="bench-meta">${v61PositionNames[item.line]} · ${freshText(item.fresh)}</span><span class="bench-skills">${v55TopSkillsHTML(item)}</span></button><button type="button" class="player-link" data-v64-profile="${escapeHTML(pid)}">Details</button></article>`}).join('')}</div><div class="compact-actions"><button type="button" data-v64-quick="fresh">Frischeste</button><button type="button" data-v64-quick="defensive">Defensiver</button><button type="button" data-v64-quick="offensive">Offensiver</button><button type="button" data-v64-undo ${v64UiUndo?'':'disabled'}>Letzte Änderung zurücknehmen</button></div><p class="lineup-status" role="status">Aufstellung gültig · Änderungen werden automatisch gespeichert.</p></section>`;
}
function v64UiRemember(fixture,state){v64UiUndo=structuredClone({plan:fixture.plan,state})}
function v64UiUndoLast(career,fixture){
 if(!v64UiUndo)return;
 fixture.plan=v64UiUndo.plan;career.world.activeMatch.state=v64UiUndo.state;v64UiUndo=null;
 v64UiSave();v64UiRender(career);
}
function v64UiSwapSlots(career,fixture,state,side,first,second){
 const plan=side===0?fixture.plan.home:fixture.plan.away,active=v64Active(state,side),a=plan.starters[first],b=plan.starters[second];
 if(!a||!b||a===b)return;
 if(v64Player(career,fixture,side,a).keeper!==v64Player(career,fixture,side,b).keeper)throw Error('Torwart und Feldspieler können ihre Position nicht tauschen.');
 const roleA=state.roles[a],roleB=state.roles[b];
 if(roleA===roleB){[plan.starters[first],plan.starters[second]]=[b,a];[active[first],active[second]]=[b,a]}
 else{state.roles[a]=roleB;state.roles[b]=roleA;plan.roles[a]=roleB;plan.roles[b]=roleA}
}
function v64UiQuickLineup(career,fixture,state,side,kind){
 const plan=side===0?fixture.plan.home:fixture.plan.away,roster=v64Side(career,fixture,side),formation=kind==='defensive'?'3–1–1':kind==='offensive'?'1–2–2':state.tactics[side].formation;
 const remaining=new Set(roster.map(player=>player.pid)),starters=[],assigned={};
 for(const role of v64RoleList(formation)){
  const candidates=roster.filter(player=>remaining.has(player.pid)&&(role==='gk'?player.keeper:!player.keeper));
  candidates.sort((a,b)=>kind==='fresh'?b.fresh-a.fresh||v64Rating(b,role)-v64Rating(a,role):v64Rating(b,role)-v64Rating(a,role)||b.fresh-a.fresh);
  const player=candidates[0];if(!player)throw Error('Für diese Aufstellung fehlen Profis.');
  remaining.delete(player.pid);starters.push(player.pid);assigned[player.pid]=role;
 }
 const bench=roster.filter(player=>remaining.has(player.pid)).sort((a,b)=>v64Rating(b,b.line)-v64Rating(a,a.line)).slice(0,5).map(player=>player.pid);
 for(const player of roster)delete state.roles[player.pid];
 Object.assign(state.roles,assigned);plan.roles={...assigned};plan.starters=starters;plan.bench=bench;
 if(side===0){state.active=[...starters];state.bench=[...bench]}else{state.awayActive=[...starters];state.awayBench=[...bench]}
 for(const pid of [...starters,...bench])if(state.fresh[pid]===undefined){const player=roster.find(item=>item.pid===pid);state.fresh[pid]=player.fresh;state.minutes[pid]=0;state.stats[pid]={goals:0,assists:0,shots:0}}
 if(state.tactics[side].formation!==formation){state.tactics[side].formation=formation;state.tacticChanges.push({minute:0,side,tactics:{...state.tactics[side]},reason:'Schnelle Aufstellung'})}
 plan.tactics={...state.tactics[side]};v64SelectedSlot=0;
}
function v64UiScreenHTML(career,fixture,state){
 const competition=v62Current(career).find(item=>item.id===fixture.competitionId),label=competition.type==='league'?v62LeagueLabel(competition.country):competition.type==='cup'?'Nationaler Pokal':'Europacup',home=career.world.clubs.find(club=>club.id===fixture.homeId),away=career.world.clubs.find(club=>club.id===fixture.awayId),side=v64UiOwnSide(fixture),phase=state.phase;
 const controls=phase==='prematch'?(v64UiTab==='tactics'?`<h2>Teamtaktik</h2><p>Wähle Formation und Spielidee. Änderungen sind sofort auf dem Spielfeld sichtbar.</p>${v64UiTactics(state,side)}`:`<h2>Aufstellung</h2><p>Wähle ein Trikot auf dem Feld und besetze den Platz mit einem Spieler von der Bank.</p>${v64UiPrematchSelection(career,fixture,state,side)}`):phase==='paused'?`<h2>Spielpause</h2><p>Taktikänderungen gelten sofort. Wechsel erfolgen bei der nächsten Unterbrechung.</p>${v64UiTactics(state,side)}${v64UiPending(fixture,state,side)}<button type="button" class="primary v64-resume" data-v64-resume>Spiel fortsetzen →</button>`:phase==='live'?`<h2>Live-Spiel</h2><p>Die Partie läuft. Pausiere, um Taktik und Wechsel anzupassen.</p><button type="button" class="menu-action v64-pause" data-v64-pause>Spiel pausieren</button><p id="v64-live-status" class="v62-explainer">Nächste KI-Prüfung nach Tor, zur Halbzeit oder an der 15-Minuten-Marke.</p>`:v64UiResult(fixture,state,side);
 const field=phase==='prematch'?v64UiPrematchPitch(career,fixture,state,side):`<canvas id="v64-pitch" width="600" height="740" role="img" aria-label="Animiertes Spielfeld ${escapeHTML(home.name)} gegen ${escapeHTML(away.name)}"></canvas>`;
 const events=phase==='prematch'?'':`<section class="v62-season"><h3>Spielverlauf</h3><div id="v64-events">${v64UiEvents(state,phase==='finished')}</div></section>`;
 const tabs=phase==='prematch'?`<nav class="prematch-tabs v64-prematch-tabs" aria-label="Vor dem Spiel"><button type="button" data-v64-tab="lineup" class="${v64UiTab==='lineup'?'active':''}" aria-pressed="${v64UiTab==='lineup'}">Aufstellung</button><button type="button" data-v64-tab="tactics" class="${v64UiTab==='tactics'?'active':''}" aria-pressed="${v64UiTab==='tactics'}">Taktik</button></nav>`:'';
 return`<div class="v64-match-page"><div class="v64-top"><p class="eyebrow">${label} · Saison ${career.world.season} · ${v62Date(fixture.day)}</p><button type="button" class="menu-action" data-v64-exit>Zur Startseite</button></div><div class="v64-board"><div>${v61CrestSVG(home)}<strong>${escapeHTML(home.name)}</strong></div><span id="v64-score" aria-live="polite">${state.score[0]} : ${state.score[1]}</span><div>${v61CrestSVG(away)}<strong>${escapeHTML(away.name)}</strong></div></div><p id="v64-minute" class="v64-minute">${phase==='prematch'?'Vor Anpfiff':`${state.minute}′ · ${phase==='finished'?'Abpfiff':phase==='paused'?'Pause':'Live'}`}</p>${tabs}<div class="v64-layout"><div class="v64-pitch-area">${v64UiAdboards([home,away])}${field}${phase==='prematch'&&v64UiTab==='lineup'?v64UiPrematchBench(career,fixture,state,side):''}${events}</div><section class="v64-controls">${controls}<p id="v64-message" role="alert" class="v61-error"></p></section></div></div>`;
}
function v64UiDraw(career,fixture,state,time){
 const canvas=v61WorldScreen.querySelector('#v64-pitch');if(!canvas)return;
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);
 for(let index=0;index<10;index++){ctx.fillStyle=index%2?'#245446':'#214e43';ctx.fillRect(0,index*h/10,w,h/10)}
 ctx.strokeStyle='#b5d7baaa';ctx.lineWidth=2;ctx.strokeRect(28,26,w-56,h-52);ctx.beginPath();ctx.moveTo(28,h/2);ctx.lineTo(w-28,h/2);ctx.stroke();ctx.beginPath();ctx.arc(w/2,h/2,70,0,Math.PI*2);ctx.stroke();ctx.strokeRect(w*.25,26,w*.5,105);ctx.strokeRect(w*.25,h-131,w*.5,105);ctx.strokeRect(w*.4,10,w*.2,16);ctx.strokeRect(w*.4,h-26,w*.2,16);
 for(const side of [0,1]){
  const club=career.world.clubs.find(item=>item.id===(side===0?fixture.homeId:fixture.awayId)),colors=v61ClubColors(club),active=v64Active(state,side),roles=['gk','def','mid','att'];
  for(const role of roles){
   const players=active.filter(pid=>state.roles[pid]===role),base=role==='gk'?.91:role==='def'?.74:role==='mid'?.55:.35;
   players.forEach((pid,index)=>{
    const player=v64Player(career,fixture,side,pid),x=(players.length===1?.5:.18+index*.64/(players.length-1))+Math.sin(time/950+index*1.7+side*3)*.009,y=(side===0?base:1-base)+Math.sin(time/1100+index*2+side)*.007;
    ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(x*w,y*h+10,18,9,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=role==='gk'?'#e7b957':colors[0];ctx.strokeStyle=colors[1];ctx.lineWidth=3;ctx.beginPath();ctx.arc(x*w,y*h,16,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 14px Arial';ctx.fillText(String(player.n),x*w,y*h+5);ctx.font='11px Arial';ctx.fillText(player.name.split(' ').at(-1),x*w,y*h+29);
   });
  }
 }
 const ballX=w*(.5+Math.sin(time/760+state.minute*.7)*.13),ballY=h*(.5+Math.sin(time/1130+state.minute*.41)*.16);
 ctx.fillStyle='#fff';ctx.strokeStyle='#152725';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ballX,ballY,6,0,Math.PI*2);ctx.fill();ctx.stroke();
}
function v64UiAnimate(time){
 const career=v61CurrentCareer,fixture=career&&v64ActiveFixture(career),state=career?.world.activeMatch?.state;
 if(!fixture||!state||state.phase!=='live'||v61WorldScreen.hidden){v64UiFrame=null;return}
 v64UiDraw(career,fixture,state,time);v64UiFrame=requestAnimationFrame(v64UiAnimate);
}
function v64UiUpdate(career,fixture,state){
 const score=v61WorldScreen.querySelector('#v64-score'),minute=v61WorldScreen.querySelector('#v64-minute'),events=v61WorldScreen.querySelector('#v64-events');
 if(score)score.textContent=`${state.score[0]} : ${state.score[1]}`;
 if(minute)minute.textContent=`${state.minute}′ · Live`;
 if(events)events.innerHTML=v64UiEvents(state);
}
function v64UiTick(){
 const career=v61CurrentCareer,fixture=career&&v64ActiveFixture(career),state=career?.world.activeMatch?.state;
 if(!fixture||state?.phase!=='live'){v64UiStop();return}
 try{
  v64Step(career,fixture,state);
  if(state.phase==='finished'){v64CompleteOwnMatch(career);v64UiSave();v64UiRender(career);return}
  v64UiSave();v64UiUpdate(career,fixture,state);
 }catch(error){state.phase='paused';v64UiStop();v64UiRender(career);v64UiError(error)}
}
function v64UiStart(){
 if(!v64UiTimer)v64UiTimer=setInterval(v64UiTick,650);
 if(!v64UiFrame)v64UiFrame=requestAnimationFrame(v64UiAnimate);
}
function v64UiRender(career){
 v64UiStop();const fixture=v64ActiveFixture(career),state=career.world.activeMatch?.state;
 if(!fixture||!state)return;
 if(v64UiFixtureId!==fixture.id){v64UiFixtureId=fixture.id;v64UiTab='lineup';v64SelectedSlot=0;v64UiUndo=null}
 startScreen.hidden=true;v61WorldScreen.hidden=false;
 v61WorldScreen.innerHTML=v64UiScreenHTML(career,fixture,state);
 v58Refresh();v64UiDraw(career,fixture,state,state.minute*190);
 if(state.phase==='live')v64UiStart();
}
function v64UiError(error){const target=v61WorldScreen.querySelector('#v64-message');if(target)target.textContent=error.message}
function v64UiChange(event){
 const career=v61CurrentCareer,fixture=career&&v64ActiveFixture(career),state=career?.world.activeMatch?.state;
 if(!fixture||!state)return;
 const side=v64UiOwnSide(fixture),target=event.target;
 try{
  if(target.id==='v64-out'){
   const keeper=v64Player(career,fixture,side,target.value).keeper,bench=v64Bench(state,side).filter(pid=>!state.pending[side].some(item=>item.inPid===pid)&&v64Player(career,fixture,side,pid).keeper===keeper);
   v61WorldScreen.querySelector('#v64-in').innerHTML=bench.map(pid=>`<option value="${escapeHTML(pid)}">${escapeHTML(v64Player(career,fixture,side,pid).name)}</option>`).join('');return;
  }
  if(target.dataset.v64Slot!==undefined){v64UiRemember(fixture,state);v64SetPrematchSlot(career,fixture,state,side,Number(target.dataset.v64Slot),target.value)}
  else if(target.dataset.v64Tactic){
   const changes={[target.dataset.v64Tactic]:target.value};
   if(state.phase==='prematch')v64PrematchTactics(career,fixture,state,side,changes);else if(state.phase==='paused')v64ChangeTactics(career,fixture,state,side,changes);
  }else return;
  v64UiSave();v64UiRender(career);
 }catch(error){v64UiError(error)}
}
function v64UiClick(event){
 const button=event.target.closest('button');if(!button)return;
 const career=v61CurrentCareer,fixture=career&&v64ActiveFixture(career),state=career?.world.activeMatch?.state;
 if(!fixture||!state)return;
 try{
  if(button.hasAttribute('data-v64-exit')){v61ShowStart();return}
  if(button.dataset.v64Tab&&state.phase==='prematch'){v64UiTab=button.dataset.v64Tab;v64UiRender(career);v61WorldScreen.querySelector(`[data-v64-tab="${v64UiTab}"]`)?.focus();return}
  if(button.dataset.v64TacticKey&&state.phase==='prematch'){
   const side=v64UiOwnSide(fixture),key=button.dataset.v64TacticKey,value=button.dataset.v64TacticValue;
   if(state.tactics[side][key]===value)return;
   v64UiRemember(fixture,state);v64PrematchTactics(career,fixture,state,side,{[key]:value});v64UiSave();v64UiRender(career);
   v61WorldScreen.querySelector(`[data-v64-tactic-key="${key}"][data-v64-tactic-value="${value}"]`)?.focus();return;
  }
  if(button.hasAttribute('data-v64-undo')&&state.phase==='prematch'){v64UiUndoLast(career,fixture);return}
  if(button.dataset.v64Quick&&state.phase==='prematch'){v64UiRemember(fixture,state);v64UiQuickLineup(career,fixture,state,v64UiOwnSide(fixture),button.dataset.v64Quick);v64UiSave();v64UiRender(career);return}
  if(button.hasAttribute('data-v64-swap-selected')&&state.phase==='prematch'){
   const target=Number(v61WorldScreen.querySelector('#v64-swap-target')?.value);v64UiRemember(fixture,state);v64UiSwapSlots(career,fixture,state,v64UiOwnSide(fixture),v64SelectedSlot,target);v64UiSave();v64UiRender(career);return;
  }
  if(button.dataset.v64PickSlot!==undefined&&state.phase==='prematch'){v64SelectedSlot=Number(button.dataset.v64PickSlot);v64UiTab='lineup';v64UiRender(career);v61WorldScreen.querySelector(`[data-v64-pick-slot="${v64SelectedSlot}"]`)?.focus();return}
  if(button.dataset.v64Profile){v61OpenProfile(button.dataset.v64Profile,button);return}
  if(button.dataset.v64Bench&&state.phase==='prematch'){v64UiRemember(fixture,state);v64SetPrematchSlot(career,fixture,state,v64UiOwnSide(fixture),v64SelectedSlot,button.dataset.v64Bench);v64UiSave();v64UiRender(career);return}
  if(button.hasAttribute('data-v64-pause')&&state.phase==='live'){state.phase='paused';v64UiSave();v64UiRender(career);return}
  if(button.hasAttribute('data-v64-resume')&&state.phase==='paused'){state.phase='live';v64UiSave();v64UiRender(career);return}
  if(button.hasAttribute('data-v64-queue')&&state.phase==='paused'){
   const out=v61WorldScreen.querySelector('#v64-out')?.value,inPid=v61WorldScreen.querySelector('#v64-in')?.value;
   v64QueueSubstitution(career,fixture,state,v64UiOwnSide(fixture),out,inPid);v64UiSave();v64UiRender(career);return;
  }
  if(button.dataset.v64Cancel!==undefined&&state.phase==='paused'){
   v64CancelPending(state,v64UiOwnSide(fixture),Number(button.dataset.v64Cancel));v64UiSave();v64UiRender(career);
  }
 }catch(error){v64UiError(error)}
}
function v64UiDragTarget(event){return event.target.closest?.('[data-v64-pick-slot],[data-v64-bench-card]')}
function v64UiCanDrop(target){
 if(!v64UiDrag||!target)return false;
 const career=v61CurrentCareer,fixture=career&&v64ActiveFixture(career),state=career?.world.activeMatch?.state;if(!fixture||state?.phase!=='prematch')return false;
 const side=v64UiOwnSide(fixture),plan=side===0?fixture.plan.home:fixture.plan.away,source=v64UiDrag.kind==='field'?plan.starters[v64UiDrag.slot]:v64UiDrag.pid,dest=target.dataset.v64PickSlot!==undefined?plan.starters[Number(target.dataset.v64PickSlot)]:target.dataset.v64BenchCard;
 return Boolean(source&&dest&&source!==dest&&v64Player(career,fixture,side,source).keeper===v64Player(career,fixture,side,dest).keeper);
}
function v64UiDragStart(event){
 const career=v61CurrentCareer,fixture=career&&v64ActiveFixture(career),state=career?.world.activeMatch?.state;
 if(!fixture||state?.phase!=='prematch')return;
 const target=v64UiDragTarget(event);if(!target)return;
 v64UiDrag=target.dataset.v64PickSlot!==undefined?{kind:'field',slot:Number(target.dataset.v64PickSlot)}:{kind:'bench',pid:target.dataset.v64BenchCard};
 event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','Spieler verschieben');
}
function v64UiDragOver(event){const target=v64UiDragTarget(event);if(!v64UiCanDrop(target))return;event.preventDefault();event.dataTransfer.dropEffect='move';target.classList.add('v64-drag-over')}
function v64UiDragLeave(event){const target=v64UiDragTarget(event);if(target&&!target.contains(event.relatedTarget))target.classList.remove('v64-drag-over')}
function v64UiDrop(event){
 const target=v64UiDragTarget(event);if(!v64UiCanDrop(target))return;
 event.preventDefault();const career=v61CurrentCareer,fixture=v64ActiveFixture(career),state=career.world.activeMatch.state,side=v64UiOwnSide(fixture),source=v64UiDrag;
 try{
  v64UiRemember(fixture,state);
  if(source.kind==='field'&&target.dataset.v64PickSlot!==undefined)v64UiSwapSlots(career,fixture,state,side,source.slot,Number(target.dataset.v64PickSlot));
  else if(source.kind==='bench')v64SetPrematchSlot(career,fixture,state,side,Number(target.dataset.v64PickSlot),source.pid);
  else v64SetPrematchSlot(career,fixture,state,side,source.slot,target.dataset.v64BenchCard);
  v64UiTab='lineup';v64UiSave();v64UiRender(career);
 }catch(error){v64UiError(error)}finally{v64UiDrag=null}
}

const v64BaseRenderCareer=v61RenderCareer;
v61RenderCareer=function(career){if(career.world.activeMatch)v64UiRender(career);else{v64UiStop();v64BaseRenderCareer(career)}};
const v64BaseAdvanceCareer=v61AdvanceCareer;
v61AdvanceCareer=function(){
 const career=v61CurrentCareer;if(!career)return;
 try{
  const active=career.world.activeMatch;
  if(active){
   if(active.state.phase==='prematch'){active.state.phase='live';v64UiSave();v64UiRender(career)}
   else if(active.state.phase==='finished'){delete career.world.activeMatch;v64UiSave();v61RenderCareer(career)}
   return;
  }
  if(career.world.seasonFinished){v64BaseAdvanceCareer();return}
  v64AdvanceToOwnMatch(career);v64UiSave();v61RenderCareer(career);
 }catch(error){v64UiError(error);const target=v61WorldScreen.querySelector('.v61-career-nav');if(target)target.insertAdjacentHTML('afterend',`<p class="v61-error" role="alert">${escapeHTML(error.message)}</p>`)}
};
const v64BaseShowStart=v61ShowStart;
v61ShowStart=function(){if(v61CurrentCareer?.world.activeMatch?.state.phase==='live'){v61CurrentCareer.world.activeMatch.state.phase='paused';v64UiSave()}v64UiStop();v64BaseShowStart()};
const v64BaseProgressState=v58State;
v58State=function(){
 const state=v64BaseProgressState(),active=v61CurrentCareer?.world.activeMatch;
 if(v61WorldScreen.hidden||!v61CurrentCareer)return state;
 if(active){
  const fixture=v64ActiveFixture(v61CurrentCareer),phase=active.state.phase;
  return{context:`${v62Date(fixture.day)} · ${v62Name(v61CurrentCareer,fixture.homeId)} gegen ${v62Name(v61CurrentCareer,fixture.awayId)}`,label:phase==='prematch'?'Match starten':phase==='finished'?'Zur Karriereübersicht':null,action:phase==='prematch'||phase==='finished'?'v61-world':null};
 }
 if(state?.action==='v61-world'&&!v61CurrentCareer.world.seasonFinished)state.label='Nächstes Spiel vorbereiten';
 return state;
};
v61WorldScreen.addEventListener('change',v64UiChange);
v61WorldScreen.addEventListener('click',v64UiClick);
v61WorldScreen.addEventListener('dragstart',v64UiDragStart);
v61WorldScreen.addEventListener('dragover',v64UiDragOver);
v61WorldScreen.addEventListener('dragleave',v64UiDragLeave);
v61WorldScreen.addEventListener('drop',v64UiDrop);
v61WorldScreen.addEventListener('dragend',()=>{v64UiDrag=null;v61WorldScreen.querySelectorAll('.v64-drag-over').forEach(item=>item.classList.remove('v64-drag-over'))});
const v64BaseOpenProfile=v61OpenProfile;
v61OpenProfile=function(pid,button){
 v64BaseOpenProfile(pid,button);
 if(!v61CurrentCareer)return;
 const player=v61CurrentCareer.world.clubs.find(club=>club.id===v61CurrentCareer.manager.managedClubId)?.roster.find(item=>item.pid===pid),section=v61ProfileDialog.querySelector('section:last-of-type');
 if(!player||!section)return;
 const current=player.history.filter(item=>item.season===v61CurrentCareer.world.season),rows=[...(player.seasons||[])];
 if(current.length)rows.push({season:v61CurrentCareer.world.season,games:current.length,minutes:current.reduce((sum,item)=>sum+item.minutes,0),goals:current.reduce((sum,item)=>sum+item.goals,0),assists:current.reduce((sum,item)=>sum+item.assists,0)});
 section.innerHTML=`<h3>Spielerstatistik</h3>${rows.length?`<div class="v64-player-seasons">${rows.reverse().map(row=>`<p><strong>Saison ${row.season}</strong><span>${v64UiCount(row.games,'Einsatz','Einsätze')} · ${v64UiCount(row.minutes,'Minute','Minuten')} · ${v64UiCount(row.goals,'Tor','Tore')} · ${v64UiCount(row.assists,'Vorlage','Vorlagen')}</span></p>`).join('')}</div>`:'<p>Noch keine Pflichtspieleinsätze.</p>'}`;
};
