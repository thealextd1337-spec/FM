'use strict';

// Der dauerhafte Matchplan gehört zur Managerkarriere, nicht zu einem Spieltag.
let v64CareerPlanTab='lineup',v64CareerSelectedSlot=1,v64CareerPresetName='',v64CareerUiId=null,v64CareerDraggedBench=null;
function v64CareerClub(career){return career.world.clubs.find(club=>club.id===career.manager.managedClubId)}
function v64CareerPlanDefault(career){
 const club=v64CareerClub(career),coach=career.world.coaches.find(item=>item.id===club.coachId),tactics=v64CoachTactics(coach);
 const side=v64BuildSide(club,tactics.formation),state={active:side.starters,roles:side.roles,cells:{}};
 v64EnsureCells(state,0);
 return{starters:side.starters,bench:side.bench,roles:side.roles,cells:state.cells,orientation:{},instructions:{},tactics};
}
function v64CareerPlanNormalize(career,saved){
 const club=v64CareerClub(career),roster=club.roster,defaults=v64CareerPlanDefault(career),source=saved&&typeof saved==='object'?saved:defaults;
 const formation=v64Formations.includes(source.tactics?.formation)?source.tactics.formation:defaults.tactics.formation;
 const tactics={...defaults.tactics,formation};
 for(const [key,values]of Object.entries({pressing:v63Pressing,passing:v63Passing,focus:v64FocusOptions,defense:v63Defense,aggression:['Vorsichtig','Normal','Aggressiv']}))if(values.includes(source.tactics?.[key]))tactics[key]=source.tactics[key];
 const savedStarters=Array.isArray(source.starters)?source.starters:[],used=new Set(),starters=[],roles={};
 for(const role of v64RoleList(formation)){
  const eligible=player=>!used.has(player.pid)&&(role==='gk'?player.keeper:!player.keeper);
  const preferred=savedStarters.map(pid=>roster.find(player=>player.pid===pid)).filter(Boolean);
  const replacement=roster.filter(item=>eligible(item)&&!savedStarters.includes(item.pid)).sort((a,b)=>v64Rating(b,role)-v64Rating(a,role)||a.pid.localeCompare(b.pid))[0];
  const player=preferred.find(item=>eligible(item)&&source.roles?.[item.pid]===role)||replacement||preferred.find(eligible)||roster.filter(eligible).sort((a,b)=>v64Rating(b,role)-v64Rating(a,role)||a.pid.localeCompare(b.pid))[0];
  if(!player)throw Error('Für den Matchplan fehlen Profis.');
  used.add(player.pid);starters.push(player.pid);roles[player.pid]=role;
 }
 const remaining=roster.filter(player=>!used.has(player.pid)),savedBench=Array.isArray(source.bench)?source.bench:[];
 const bench=[...savedBench.map(pid=>remaining.find(player=>player.pid===pid)).filter(Boolean),...remaining.filter(player=>!savedBench.includes(player.pid)).sort((a,b)=>v64Rating(b,b.line)-v64Rating(a,a.line)||a.pid.localeCompare(b.pid))].slice(0,5).map(player=>player.pid);
 const cells={},occupied=new Set();
 for(const pid of starters){const cell=source.cells?.[pid];if(roles[pid]!=='gk'&&Number.isInteger(cell)&&cell>=0&&cell<35&&v64GridRole(cell)===roles[pid]&&!occupied.has(cell)){cells[pid]=cell;occupied.add(cell)}}
 for(const role of ['def','mid','att']){
  const ids=starters.filter(pid=>roles[pid]===role),defaultsForRole=v64GridCells[role][ids.length];
  for(const pid of ids)if(!Number.isInteger(cells[pid])){const cell=defaultsForRole.find(value=>!occupied.has(value))??Array.from({length:35},(_,index)=>index).find(value=>v64GridRole(value)===role&&!occupied.has(value));cells[pid]=cell;occupied.add(cell)}
 }
 const orientation={},instructions={};
 for(const pid of starters){if(roles[pid]==='gk')continue;if([-1,0,1].includes(source.orientation?.[pid]))orientation[pid]=source.orientation[pid];const raw=source.instructions?.[pid],values=Array.isArray(raw)?raw:raw?[raw]:[];const valid=v64Instructions[roles[pid]].filter(value=>values.includes(value));if(valid.length)instructions[pid]=valid}
 return{starters,bench,roles,cells,orientation,instructions,tactics};
}
function v64CareerPlanContext(career){
 const club=v64CareerClub(career),plan=v64CareerPlanNormalize(career,career.manager.matchPlan),side={clubId:club.id,starters:[...plan.starters],bench:[...plan.bench],roles:{...plan.roles},tactics:{...plan.tactics}};
 const fixture={id:'career-plan',homeId:club.id,awayId:club.id,plan:{home:side,away:{clubId:club.id,starters:[],bench:[],roles:{},tactics:{}}}};
 const state={phase:'prematch',minute:0,active:[...plan.starters],awayActive:[],bench:[...plan.bench],awayBench:[],roles:{...plan.roles},cells:{...plan.cells},orientation:{...plan.orientation},instructions:structuredClone(plan.instructions),tactics:[{...plan.tactics},{}],tacticChanges:[],fresh:{},minutes:{},stats:{}};
 for(const player of club.roster){state.fresh[player.pid]=player.fresh;state.minutes[player.pid]=0;state.stats[player.pid]={goals:0,assists:0,shots:0}}
 return{fixture,state};
}
function v64CareerPlanSnapshot(context){
 const {fixture,state}=context,starters=[...fixture.plan.home.starters],bench=[...fixture.plan.home.bench];
 return{starters,bench,roles:Object.fromEntries(starters.map(pid=>[pid,state.roles[pid]])),cells:Object.fromEntries(starters.filter(pid=>Number.isInteger(state.cells[pid])).map(pid=>[pid,state.cells[pid]])),orientation:Object.fromEntries(starters.filter(pid=>state.orientation[pid]!==undefined).map(pid=>[pid,state.orientation[pid]])),instructions:Object.fromEntries(starters.filter(pid=>v64PlayerInstructions(state,pid).length).map(pid=>[pid,v64PlayerInstructions(state,pid)])),tactics:{...state.tactics[0]}};
}
function v64ApplyCareerPlan(career,fixture,state){
 if(!career.manager.matchPlan)return;
 const club=v64CareerClub(career),side=fixture.homeId===club.id?0:fixture.awayId===club.id?1:-1;if(side<0)return;
 const saved=v64CareerPlanNormalize(career,career.manager.matchPlan),target=side===0?fixture.plan.home:fixture.plan.away,old=[...target.starters,...target.bench];
 target.starters=[...saved.starters];target.bench=[...saved.bench];target.roles={...saved.roles};target.tactics={...saved.tactics};
 if(side===0){state.active=[...saved.starters];state.bench=[...saved.bench]}else{state.awayActive=[...saved.starters];state.awayBench=[...saved.bench]}
 for(const pid of old){delete state.roles[pid];delete state.cells?.[pid];delete state.orientation?.[pid];delete state.instructions?.[pid]}
 Object.assign(state.roles,saved.roles);state.cells||={};Object.assign(state.cells,saved.cells);state.orientation||={};Object.assign(state.orientation,saved.orientation);state.instructions||={};Object.assign(state.instructions,structuredClone(saved.instructions));state.tactics[side]={...saved.tactics};
 for(const pid of [...saved.starters,...saved.bench])if(state.fresh[pid]===undefined){const player=club.roster.find(item=>item.pid===pid);state.fresh[pid]=player.fresh;state.minutes[pid]=0;state.stats[pid]={goals:0,assists:0,shots:0}}
}
function v64CareerPlanHTML(career){
 const {fixture,state}=v64CareerPlanContext(career),club=v64CareerClub(career),slot=Math.min(v64CareerSelectedSlot,5),pid=fixture.plan.home.starters[slot],player=club.roster.find(item=>item.pid===pid),presets=career.manager.tacticPresets||[];
 const bench=fixture.plan.home.bench.map(id=>{const item=club.roster.find(entry=>entry.pid===id);return`<article class="bench-chip v64-bench-chip v64-career-bench-chip" draggable="true" data-v64-career-bench-card="${escapeHTML(id)}" data-v64-career-keeper="${item.keeper}" aria-label="${escapeHTML(item.name)} auf ein Feldtrikot ziehen"><div class="bench-select"><span class="bench-title">${v61FlagSVG(item.nation)}<b>#${escapeHTML(item.n)} ${escapeHTML(item.name)}</b></span><span class="bench-meta">${v61PositionNames[item.line]} · ${freshText(item.fresh)}</span>${v51StatusHTML(item,item.fresh)}<span class="bench-skills">${v55TopSkillsHTML(item)}</span></div><button type="button" class="player-link" data-v64-career-profile="${escapeHTML(id)}" aria-label="Profil von ${escapeHTML(item.name)} ansehen">Details</button></article>`}).join('');
 const benchPanel=`<section class="v64-bench-section compact-bench v64-career-bench"><div class="compact-bench-head"><h3>Ersatzbank</h3><span>${fixture.plan.home.bench.length} / 5 · Auf ein Trikot ziehen</span></div><div class="bench-strip v64-bench-strip">${bench||'<p>Keine Feldspieler auf der Bank.</p>'}</div></section>`;
 const controls=v64CareerPlanTab==='tactics'?v64UiTactics(state,0):`<h3>${escapeHTML(player.name)} · ${v64Roles[state.roles[pid]]}</h3>${v64PositionWarningHTML(player,state.roles[pid])}${v64OrientationHTML(state,pid)}${v64InstructionHTML(state,pid)}`;
 return`<div class="v64-career-plan"><h2>Aufstellung & Taktik</h2><p>Dieser Matchplan gilt für dein nächstes Spiel. Änderungen werden gespeichert.</p><div class="v64-layout v129-plan-layout"><div class="v64-pitch-area">${v64UiPrematchPitch(career,fixture,state,0,{selected:slot,pickAttribute:'data-v64-career-slot',label:'Dauerhafter Matchplan auf dem Spielfeld'})}${benchPanel}</div><div class="v129-plan-controls"><nav class="prematch-tabs v64-prematch-tabs" aria-label="Dauerhafter Matchplan"><button type="button" data-v64-career-tab="lineup" aria-pressed="${v64CareerPlanTab==='lineup'}" class="${v64CareerPlanTab==='lineup'?'active':''}">Aufstellung</button><button type="button" data-v64-career-tab="tactics" aria-pressed="${v64CareerPlanTab==='tactics'}" class="${v64CareerPlanTab==='tactics'?'active':''}">Taktik</button></nav><section class="v64-controls">${controls}</section></div></div><section class="v62-season v64-career-presets"><h3>Gespeicherte Matchpläne</h3><p>Eine Vorlage enthält Startelf, Feldpositionen, Einzelanweisungen und Teamtaktik. Fehlende Spieler werden beim Laden ersetzt.</p><div class="v64-career-save"><label for="v64-career-name">Name der Vorlage</label><input id="v64-career-name" maxlength="32" value="${escapeHTML(v64CareerPresetName)}" placeholder="Zum Beispiel: Flügelspiel"><button type="button" data-v64-career-save>Vorlage speichern</button></div>${presets.length?`<div class="v64-career-preset-list">${presets.map(preset=>`<div><strong translate="no">${escapeHTML(preset.name)}</strong><button type="button" data-v64-career-load="${escapeHTML(preset.id)}">Laden</button><button type="button" data-v64-career-delete="${escapeHTML(preset.id)}" aria-label="Vorlage ${escapeHTML(preset.name)} entfernen">Entfernen</button></div>`).join('')}</div>`:'<p>Noch keine Vorlage gespeichert.</p>'}</section><p class="v61-error" role="alert" id="v64-career-error"></p></div>`;
}
function v64CareerRenderView(career){const view=v61WorldScreen.querySelector('[data-v46-view="matchplan"]');if(!view)return;try{view.innerHTML=v64CareerPlanHTML(career)}catch(error){view.innerHTML=`<h2>Aufstellung & Taktik</h2><p class="v61-error" role="alert">${escapeHTML(error.message)}</p>`}}
async function v64CareerCommit(career,mutate){
 const previous=career.manager.matchPlan;
 try{const context=v64CareerPlanContext(career);mutate(context);career.manager.matchPlan=v64CareerPlanSnapshot(context);await v64UiSave();v64CareerRenderView(career)}
 catch(error){career.manager.matchPlan=previous;const message=v61WorldScreen.querySelector('#v64-career-error');if(message)message.textContent=error.message}
}
function v64CareerCanDrop(source,target){
 return Boolean(source&&target?.dataset.v64CareerSlot!==undefined&&!v61CurrentCareer?.world.activeMatch&&target.classList.contains('v64-keeper-choice')===source.keeper);
}
function v64CareerDropAction(source,target){
 if(!v64CareerCanDrop(source,target))return;
 const career=v61CurrentCareer,slot=Number(target.dataset.v64CareerSlot);
 v64CareerSelectedSlot=slot;
 return v64CareerCommit(career,({fixture,state})=>v64SetPrematchSlot(career,fixture,state,0,slot,source.pid));
}
v61CareerTabs.splice(2,0,['matchplan',v46Icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16m5-16v16m5-16v16M3 10h18m-18 5h18"/>'),'Matchplan']);
const v64CareerBaseRenderCareer=v61RenderCareer;
v61RenderCareer=function(career){
 v64CareerBaseRenderCareer(career);if(career.world.activeMatch)return;
 if(v64CareerUiId!==career.id){v64CareerUiId=career.id;v64CareerPlanTab='lineup';v64CareerSelectedSlot=1;v64CareerPresetName=''}
 const view=document.createElement('div');view.dataset.v46View='matchplan';v61WorldScreen.querySelector('[data-v46-view="squad"]')?.after(view);v64CareerRenderView(career);v61SetCareerTab(v61CareerTab,false);
};
v61WorldScreen.addEventListener('input',event=>{if(event.target.id==='v64-career-name')v64CareerPresetName=event.target.value});
v61WorldScreen.addEventListener('click',async event=>{
 if(!event.target.closest('[data-v46-view="matchplan"]'))return;
 const career=v61CurrentCareer;if(!career||career.world.activeMatch)return;
 const profile=event.target.closest('[data-v64-pitch-profile],[data-v64-career-profile]');if(profile){event.stopPropagation();v61OpenProfile(profile.dataset.v64PitchProfile||profile.dataset.v64CareerProfile,profile);return}
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.v64CareerTab){v64CareerPlanTab=button.dataset.v64CareerTab;v64CareerRenderView(career);return}
 if(button.dataset.v64CareerSlot!==undefined){v64CareerSelectedSlot=Number(button.dataset.v64CareerSlot);v64CareerPlanTab='lineup';v64CareerRenderView(career);return}
 if(button.dataset.v64CareerLoad){const preset=(career.manager.tacticPresets||[]).find(item=>item.id===button.dataset.v64CareerLoad);if(!preset)return;const previous=career.manager.matchPlan;try{career.manager.matchPlan=v64CareerPlanNormalize(career,preset.plan);await v64UiSave();v64CareerPresetName=preset.name;v64CareerRenderView(career)}catch(error){career.manager.matchPlan=previous;v61WorldScreen.querySelector('#v64-career-error').textContent=error.message}return}
 if(button.hasAttribute('data-v64-career-save')){const name=v64CareerPresetName.trim().replace(/\s+/g,' ');if(name.length<2||name.length>32){v61WorldScreen.querySelector('#v64-career-error').textContent='Der Vorlagenname muss 2 bis 32 Zeichen haben.';return}const presets=career.manager.tacticPresets||[],previous=structuredClone(presets),existing=presets.find(item=>item.name.toLocaleLowerCase()===name.toLocaleLowerCase());try{const plan=v64CareerPlanNormalize(career,career.manager.matchPlan);if(existing){existing.name=name;existing.plan=plan}else presets.push({id:crypto.randomUUID(),name,plan});career.manager.tacticPresets=presets;await v64UiSave();v64CareerPresetName=name;v64CareerRenderView(career)}catch(error){career.manager.tacticPresets=previous;v61WorldScreen.querySelector('#v64-career-error').textContent=error.message}return}
 if(button.dataset.v64CareerDelete){const preset=(career.manager.tacticPresets||[]).find(item=>item.id===button.dataset.v64CareerDelete);if(!preset)return;const question=`Vorlage „${preset.name}“ entfernen?`;if(!window.confirm(window.doppel6Language?.localize(question)||question))return;const previous=career.manager.tacticPresets;career.manager.tacticPresets=previous.filter(item=>item.id!==preset.id);try{await v64UiSave();v64CareerRenderView(career)}catch(error){career.manager.tacticPresets=previous;v61WorldScreen.querySelector('#v64-career-error').textContent=error.message}return}
 const slot=v64CareerSelectedSlot;
 if(button.dataset.v64Orientation!==undefined)return v64CareerCommit(career,({fixture,state})=>v64SetOrientation(state,fixture.plan.home.starters[slot],Number(button.dataset.v64Orientation)));
 if(button.dataset.v64Instruction)return v64CareerCommit(career,({fixture,state})=>v64ToggleInstruction(state,fixture.plan.home.starters[slot],button.dataset.v64Instruction));
 if(button.dataset.v64TacticKey)return v64CareerCommit(career,({fixture,state})=>v64PrematchTactics(career,fixture,state,0,{[button.dataset.v64TacticKey]:button.dataset.v64TacticValue}));
 if(button.dataset.v64Cell!==undefined)return v64CareerCommit(career,({fixture,state})=>v64MoveCell(career,fixture,state,0,fixture.plan.home.starters[slot],Number(button.dataset.v64Cell)));
});
v61WorldScreen.addEventListener('dragstart',event=>{
 const card=event.target.closest?.('[data-v64-career-bench-card]');
 if(!card||v61CurrentCareer?.world.activeMatch)return;
 v64CareerDraggedBench={pid:card.dataset.v64CareerBenchCard,keeper:card.dataset.v64CareerKeeper==='true'};
 event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','Spieler verschieben');
});
v61WorldScreen.addEventListener('dragover',event=>{
 if(!v64CareerDraggedBench)return;
 const target=event.target.closest?.('[data-v64-career-slot]');
 if(!v64CareerCanDrop(v64CareerDraggedBench,target))return;
 event.preventDefault();event.dataTransfer.dropEffect='move';target.classList.add('v64-drag-over');
});
v61WorldScreen.addEventListener('dragleave',event=>{
 const target=event.target.closest?.('[data-v64-career-slot]');
 if(target&&!target.contains(event.relatedTarget))target.classList.remove('v64-drag-over');
});
v61WorldScreen.addEventListener('drop',event=>{
 if(!v64CareerDraggedBench)return;
 const target=event.target.closest?.('[data-v64-career-slot]');
 if(!v64CareerCanDrop(v64CareerDraggedBench,target))return;
 event.preventDefault();
 const source=v64CareerDraggedBench;v64CareerDraggedBench=null;
 v64CareerDropAction(source,target);
});
v61WorldScreen.addEventListener('dragend',()=>{
 v64CareerDraggedBench=null;v61WorldScreen.querySelectorAll('[data-v64-career-slot].v64-drag-over').forEach(item=>item.classList.remove('v64-drag-over'));
});
