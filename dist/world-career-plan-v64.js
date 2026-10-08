'use strict';

// Der dauerhafte Matchplan gehört zur Managerkarriere, nicht zu einem Spieltag.
let v64CareerPlanTab='lineup',v64CareerSelectedSlot=1,v64CareerPresetName='',v64CareerUiId=null,v64CareerDraggedBench=null,v64CareerCommitPending=false;
function v64CareerClub(career){return career.world.clubs.find(club=>club.id===career.manager.managedClubId)}
function v64CareerPlanDefault(career){
 const club=v64CareerClub(career),coach=career.world.coaches.find(item=>item.id===club.coachId),tactics=v64CoachTactics(coach,career);
 const side=v64BuildSide(club,tactics.formation),state={active:side.starters,roles:side.roles,cells:{}};
 v64EnsureCells(state,0);
 return{starters:side.starters,bench:side.bench,roles:side.roles,cells:state.cells,orientation:{},instructions:{},tactics};
}
function v64CareerPlanNormalize(career,saved){
 const club=v64CareerClub(career),roster=club.roster,defaults=v64CareerPlanDefault(career),source=saved&&typeof saved==='object'?saved:defaults;
 const formation=v160FormationValid(career,source.tactics?.formation)?source.tactics.formation:defaults.tactics.formation;
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
 return{starters,bench,roles,cells,orientation,instructions,tactics,...(typeof v154Active==='function'&&v154Active(career)?{roleAssignments:structuredClone(source.roleAssignments||{}),roleMoveSequence:source.roleMoveSequence||0}:{})};
}
function v64CareerPlanContext(career){
 const club=v64CareerClub(career),plan=v64CareerPlanNormalize(career,career.manager.matchPlan),side={clubId:club.id,starters:[...plan.starters],bench:[...plan.bench],roles:{...plan.roles},tactics:{...plan.tactics}};
 const fixture={id:'career-plan',homeId:club.id,awayId:club.id,plan:{home:side,away:{clubId:club.id,starters:[],bench:[],roles:{},tactics:{}}}};
 const state={phase:'prematch',minute:0,active:[...plan.starters],awayActive:[],bench:[...plan.bench],awayBench:[],roles:{...plan.roles},cells:{...plan.cells},orientation:{...plan.orientation},instructions:structuredClone(plan.instructions),tactics:[{...plan.tactics},{}],tacticChanges:[],fresh:{},minutes:{},stats:{}};
 for(const player of club.roster){state.fresh[player.pid]=player.fresh;state.minutes[player.pid]=0;state.stats[player.pid]={goals:0,assists:0,shots:0}}
 if(typeof v154Initialize==='function')v154Initialize(career,fixture,state,plan.roleAssignments);if(plan.roleMoveSequence)state.roleMoveSequence=plan.roleMoveSequence;
 return{fixture,state};
}
function v64CareerPlanSnapshot(context){
 const {fixture,state}=context,starters=[...fixture.plan.home.starters],bench=[...fixture.plan.home.bench];
 return{starters,bench,...(state.roleAssignments?{roleAssignments:structuredClone(state.roleAssignments),roleMoveSequence:state.roleMoveSequence||0}:{}),roles:Object.fromEntries(starters.map(pid=>[pid,state.roles[pid]])),cells:Object.fromEntries(starters.filter(pid=>Number.isInteger(state.cells[pid])).map(pid=>[pid,state.cells[pid]])),orientation:Object.fromEntries(starters.filter(pid=>state.orientation[pid]!==undefined).map(pid=>[pid,state.orientation[pid]])),instructions:Object.fromEntries(starters.filter(pid=>v64PlayerInstructions(state,pid).length).map(pid=>[pid,v64PlayerInstructions(state,pid)])),tactics:{...state.tactics[0]}};
}
function v64ApplyCareerPlan(career,fixture,state,savedPlan=career.manager.matchPlan){
 if(!savedPlan)return;
 const club=v64CareerClub(career),side=fixture.homeId===club.id?0:fixture.awayId===club.id?1:-1;if(side<0)return;
 const saved=v64CareerPlanNormalize(career,savedPlan),target=side===0?fixture.plan.home:fixture.plan.away,old=[...target.starters,...target.bench];
 target.starters=[...saved.starters];target.bench=[...saved.bench];target.roles={...saved.roles};target.tactics={...saved.tactics};
 if(side===0){state.active=[...saved.starters];state.bench=[...saved.bench]}else{state.awayActive=[...saved.starters];state.awayBench=[...saved.bench]}
 for(const pid of old){delete state.roles[pid];delete state.cells?.[pid];delete state.orientation?.[pid];delete state.instructions?.[pid]}
 Object.assign(state.roles,saved.roles);state.cells||={};Object.assign(state.cells,saved.cells);state.orientation||={};Object.assign(state.orientation,saved.orientation);state.instructions||={};Object.assign(state.instructions,structuredClone(saved.instructions));state.tactics[side]={...saved.tactics};
 if(typeof v154Initialize==='function')v154Initialize(career,fixture,state,saved.roleAssignments);
 for(const pid of [...saved.starters,...saved.bench])if(state.fresh[pid]===undefined){const player=club.roster.find(item=>item.pid===pid);state.fresh[pid]=player.fresh;state.minutes[pid]=0;state.stats[pid]={goals:0,assists:0,shots:0}}
}
let v140MatchPresetName='',v140MatchPresetId='';
function v140MatchPresetPlan(career,fixture,state,side){
 const target={starters:[...v64Active(state,side)],bench:[...v64Bench(state,side)]};
 return v64CareerPlanNormalize(career,v64CareerPlanSnapshot({fixture:{plan:{home:target}},state:{...state,tactics:[state.tactics[side]]}}));
}
function v140MatchPresetsHTML(career,mode='prematch'){
 const presets=career.manager.tacticPresets||[],selected=presets.find(p=>p.id===v140MatchPresetId)||presets[0];
 return `<section class="v140-match-presets" data-v140-mode="${mode}" aria-label="Gespeicherte Matchpläne"><h3>Gespeicherte Matchpläne</h3><div><label class="sr-only" for="v140-${mode}-name">Name der Vorlage</label><input data-v140-name id="v140-${mode}-name" maxlength="32" value="${escapeHTML(v140MatchPresetName)}" placeholder="Name der Vorlage"><button type="button" data-v140-save>Vorlage speichern</button></div><div><label class="sr-only" for="v140-${mode}-select">Gespeicherte Matchpläne</label><select data-v140-select id="v140-${mode}-select" ${presets.length?'':'disabled'}>${presets.length?presets.map(p=>`<option value="${escapeHTML(p.id)}" translate="no" ${p.id===v140MatchPresetId?'selected':''}>${escapeHTML(p.name)}</option>`).join(''):'<option>Noch keine Vorlage gespeichert.</option>'}</select><button type="button" data-v140-load ${presets.length?'':'disabled'}>Laden</button><button type="button" data-v140-delete aria-label="${selected?`Vorlage ${escapeHTML(selected.name)} entfernen`:'Entfernen'}" title="Entfernen" ${presets.length?'':'disabled'}>×</button></div><p data-v140-error id="v140-${mode}-error" class="v61-error" role="alert"></p></section>`;
}
async function v140SaveMatchPreset(career,fixture,state,side,name){
 if(!['prematch','paused'].includes(state.phase))return false;
 name=name.trim().replace(/\s+/g,' ');if(name.length<2||name.length>32)throw Error('Der Vorlagenname muss 2 bis 32 Zeichen haben.');
 const previous=career.manager.tacticPresets,entries=structuredClone(previous||[]),existing=entries.find(p=>p.name.toLocaleLowerCase()===name.toLocaleLowerCase()),plan=v140MatchPresetPlan(career,fixture,state,side),preset=existing||{id:crypto.randomUUID(),name,plan};
 preset.name=name;preset.plan=plan;if(!existing)entries.push(preset);career.manager.tacticPresets=entries;
 try{await v64UiSave();v140MatchPresetName=name;v140MatchPresetId=preset.id;return true}catch(error){career.manager.tacticPresets=previous;throw error}
}
async function v140LoadMatchPreset(career,fixture,state,id){
 if(!['prematch','paused'].includes(state.phase))return false;
 const preset=(career.manager.tacticPresets||[]).find(p=>p.id===id);if(!preset)return false;
 const previousPlan=structuredClone(fixture.plan),previousState=structuredClone(state),previousPermanent=career.manager.matchPlan;
 try{if(fixture.id==='career-plan')career.manager.matchPlan=v64CareerPlanNormalize(career,preset.plan);else if(state.phase==='paused'){const undo=v65UndoSnapshot({state,ownSide:v64UiOwnSide(fixture)});v140ApplyPausedPreset(career,fixture,state,preset.plan);state.pauseUndo=undo;}else v64ApplyCareerPlan(career,fixture,state,preset.plan);await v64UiSave();v140MatchPresetName=preset.name;v140MatchPresetId=id;return true}catch(error){fixture.plan=previousPlan;for(const key of Object.keys(state))if(!(key in previousState))delete state[key];Object.assign(state,previousState);career.manager.matchPlan=previousPermanent;throw error}
}
function v140ApplyPausedPreset(career,fixture,state,source){
 const side=v64UiOwnSide(fixture),plan=v64CareerPlanNormalize(career,source),active=v64Active(state,side),outgoing=active.filter(pid=>!plan.starters.includes(pid)),incoming=plan.starters.filter(pid=>!active.includes(pid)),mapping=new Map(active.filter(pid=>plan.starters.includes(pid)).map(pid=>[pid,pid]));
 state.pending[side]=[];
 for(const inPid of incoming){const keeper=v64Player(career,fixture,side,inPid).keeper,index=outgoing.findIndex(pid=>v64Player(career,fixture,side,pid).keeper===keeper);if(index<0)throw Error('Dieser Wechsel ist nicht zulässig.');const outPid=outgoing.splice(index,1)[0];v64QueueSubstitution(career,fixture,state,side,outPid,inPid);mapping.set(outPid,inPid);}
 v64ChangeTactics(career,fixture,state,side,plan.tactics,'Matchplan');
 for(const [pid,target]of mapping){state.roles[pid]=plan.roles[target];delete state.cells[pid];delete state.orientation[pid];delete state.instructions[pid];if(Number.isInteger(plan.cells[target]))state.cells[pid]=plan.cells[target];if(plan.orientation[target]!==undefined)state.orientation[pid]=plan.orientation[target];if(plan.instructions[target])state.instructions[pid]=[...plan.instructions[target]];}
 if(state.roleAssignments)v154Initialize(career,fixture,state,Object.fromEntries([...mapping].map(([pid,target])=>[pid,plan.roleAssignments?.[target]])));
}
function v140TacticsHTML(state,side){return '<h2>Teamtaktik</h2>'+v64UiTactics(state,side);}
function v64CareerPlanHTML(career){
 const {fixture,state}=v64CareerPlanContext(career),club=v64CareerClub(career),slot=Math.min(v64CareerSelectedSlot,fixture.plan.home.starters.length-1),pid=fixture.plan.home.starters[slot],player=club.roster.find(item=>item.pid===pid),presets=career.manager.tacticPresets||[];
 const bench=fixture.plan.home.bench.map(id=>{const item=club.roster.find(entry=>entry.pid===id);return`<article class="bench-chip v64-bench-chip v64-career-bench-chip" draggable="true" data-v64-career-bench-card="${escapeHTML(id)}" data-v64-career-keeper="${item.keeper}" aria-label="${escapeHTML(item.name)} auf ein Feldtrikot ziehen"><div class="bench-select"><span class="bench-title">${v61FlagSVG(item.nation)}<b>#${escapeHTML(item.n)} ${escapeHTML(item.name)}</b></span><span class="bench-meta">${v61PositionNames[item.line]} · ${freshText(item.fresh)}</span>${v51StatusHTML(item,item.fresh)}<span class="bench-skills">${v55TopSkillsHTML(item)}</span></div><button type="button" class="player-link" data-v64-career-profile="${escapeHTML(id)}" aria-label="Profil von ${escapeHTML(item.name)} ansehen">Details</button></article>`}).join('');
 const benchPanel=`<section class="v64-bench-section compact-bench v64-career-bench"><div class="compact-bench-head"><h3>Ersatzbank</h3><span>${fixture.plan.home.bench.length} / 5 · Auf ein Trikot ziehen</span></div><div class="bench-strip v64-bench-strip">${bench||'<p>Keine Feldspieler auf der Bank.</p>'}</div></section>`;
 const controls=v64CareerPlanTab==='tactics'?v140TacticsHTML(state,0):`<h3>${escapeHTML(player.name)} · ${v64Roles[state.roles[pid]]}</h3>${v64PositionWarningHTML(player,state.roles[pid])}${state.roleAssignments?v156Selection(career,fixture,state,0,pid):v64OrientationHTML(state,pid)+v64InstructionHTML(state,pid)}`;
 return`<div class="v64-career-plan"><h2>Aufstellung & Taktik</h2><p id="v64-career-move-help">Dieser Matchplan gilt für dein nächstes Spiel. Änderungen werden gespeichert. Spieler im Feld ziehen oder mit Alt + Pfeiltasten verschieben.</p><div class="v64-layout v129-plan-layout"><div class="v64-pitch-area">${v64UiPrematchPitch(career,fixture,state,0,{selected:slot,pickAttribute:'data-v64-career-slot',label:'Dauerhafter Matchplan auf dem Spielfeld'})}${benchPanel}</div><div class="v129-plan-controls"><nav class="prematch-tabs v64-prematch-tabs" aria-label="Dauerhafter Matchplan"><button type="button" data-v64-career-tab="lineup" aria-pressed="${v64CareerPlanTab==='lineup'}" class="${v64CareerPlanTab==='lineup'?'active':''}">Aufstellung</button><button type="button" data-v64-career-tab="tactics" aria-pressed="${v64CareerPlanTab==='tactics'}" class="${v64CareerPlanTab==='tactics'?'active':''}">Taktik</button></nav><section class="v64-controls">${controls}</section>${v140MatchPresetsHTML(career,'career')}</div></div><p class="v61-error" role="alert" id="v64-career-error"></p></div>`;
}
function v64CareerRenderView(career){const view=v61WorldScreen.querySelector('[data-v46-view="matchplan"]');if(!view)return;try{view.innerHTML=v64CareerPlanHTML(career);view.querySelectorAll('[data-v64-career-slot][draggable="true"]').forEach(button=>{button.style.touchAction='none';button.setAttribute('aria-describedby','v64-career-move-help');button.setAttribute('aria-keyshortcuts','Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight')})}catch(error){view.innerHTML=`<h2>Aufstellung & Taktik</h2><p class="v61-error" role="alert">${escapeHTML(error.message)}</p>`}}
async function v64CareerCommit(career,mutate){
 if(v64CareerCommitPending)return false;
 v64CareerCommitPending=true;
 const previous=career.manager.matchPlan,previousSlot=v64CareerSelectedSlot;
 try{const context=v64CareerPlanContext(career);mutate(context);const selectedPid=context.fixture.plan.home.starters[v64CareerSelectedSlot];career.manager.matchPlan=v64CareerPlanNormalize(career,v64CareerPlanSnapshot(context));v64CareerSelectedSlot=Math.max(0,career.manager.matchPlan.starters.indexOf(selectedPid));await v64UiSave();v64CareerRenderView(career);return true}
 catch(error){career.manager.matchPlan=previous;v64CareerSelectedSlot=previousSlot;const message=v61WorldScreen.querySelector('#v64-career-error');if(message)message.textContent=error.message;return false}
 finally{v64CareerCommitPending=false}
}
function v64CareerDragSource(target){
 if(!v61CurrentCareer||v61CurrentCareer.world.activeMatch||v64CareerCommitPending||v64CareerPlanTab!=='lineup')return null;
 const element=target.closest?.('[data-v64-career-slot],[data-v64-career-bench-card]');if(!element)return null;
 const {fixture}=v64CareerPlanContext(v61CurrentCareer),slot=Number(element.dataset.v64CareerSlot),pid=element.dataset.v64CareerSlot!==undefined?fixture.plan.home.starters[slot]:element.dataset.v64CareerBenchCard,player=v64CareerClub(v61CurrentCareer).roster.find(item=>item.pid===pid);
 if(!player||element.dataset.v64CareerSlot!==undefined&&player.keeper)return null;
 return{element,source:{kind:element.dataset.v64CareerSlot!==undefined?'field':'bench',slot,pid,keeper:player.keeper}};
}
function v64CareerDragTarget(target){return target.closest?.('[data-v64-career-slot],[data-v64-career-bench-card],[data-v64-cell]')||null}
function v64CareerCanDrop(source,target){
 const career=v61CurrentCareer;if(!source||!target||!career||career.world.activeMatch||v64CareerCommitPending||target.closest&&!target.closest('[data-v46-view="matchplan"]'))return false;
 const {fixture,state}=v64CareerPlanContext(career),plan=fixture.plan.home;
 if(source.kind==='field'&&target.dataset.v64Cell!==undefined){
  const pid=plan.starters[source.slot],cell=Number(target.dataset.v64Cell),cells=v64EnsureCells(state,0);if(pid!==source.pid||state.roles[pid]==='gk'||!Number.isInteger(cell)||cell<0||cell>34||cells[pid]===cell)return false;
  const other=plan.starters.find(id=>id!==pid&&cells[id]===cell),group=value=>state.roleAssignments?(1-(Math.floor(value/5)+.5)/7<.3?'def':1-(Math.floor(value/5)+.5)/7<.7?'mid':'att'):v64GridRole(value),roles={...state.roles,[pid]:group(cell)};if(other)roles[other]=group(cells[pid]);
  return ['def','mid','att'].every(role=>{const count=plan.starters.filter(id=>roles[id]===role).length;return count>=1&&count<=3});
 }
 if(source.kind==='field'){const incoming=v64CareerClub(career).roster.find(player=>player.pid===target.dataset.v64CareerBenchCard);return Boolean(plan.starters[source.slot]===source.pid&&incoming&&plan.bench.includes(incoming.pid)&&incoming.keeper===source.keeper)}
 const destination=plan.starters[Number(target.dataset.v64CareerSlot)];
 return Boolean(destination&&target.classList.contains('v64-keeper-choice')===source.keeper&&(source.pid===undefined||plan.bench.includes(source.pid)));
}
function v64CareerDropAction(source,target){
 if(!v64CareerCanDrop(source,target))return;
 const career=v61CurrentCareer,slot=source.kind==='field'?source.slot:Number(target.dataset.v64CareerSlot);
 v64CareerSelectedSlot=slot;v64CareerPlanTab='lineup';
 return v64CareerCommit(career,({fixture,state})=>source.kind==='field'&&target.dataset.v64Cell!==undefined?v64MoveCell(career,fixture,state,0,fixture.plan.home.starters[slot],Number(target.dataset.v64Cell)):v64SetPrematchSlot(career,fixture,state,0,slot,source.kind==='field'?target.dataset.v64CareerBenchCard:source.pid));
}
function v64CareerKeyboardCell(cell,key,horizontal){
 const row=cell%5,column=Math.floor(cell/5),offset=(horizontal?{ArrowLeft:5,ArrowRight:-5,ArrowUp:-1,ArrowDown:1}:{ArrowLeft:-1,ArrowRight:1,ArrowUp:-5,ArrowDown:5})[key];
 if(offset===undefined||horizontal&&(key==='ArrowUp'&&row===0||key==='ArrowDown'&&row===4||key==='ArrowLeft'&&column===6||key==='ArrowRight'&&column===0)||!horizontal&&(key==='ArrowLeft'&&row===0||key==='ArrowRight'&&row===4||key==='ArrowUp'&&column===0||key==='ArrowDown'&&column===6))return null;
 return cell+offset;
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
 const drag=v64CareerDragSource(event.target);if(!drag)return;
 v64CareerDraggedBench=drag.source;
 event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','Spieler verschieben');
});
v61WorldScreen.addEventListener('dragover',event=>{
 if(!v64CareerDraggedBench)return;
 const target=v64CareerDragTarget(event.target),valid=v64CareerCanDrop(v64CareerDraggedBench,target);
 event.preventDefault();event.dataTransfer.dropEffect=valid?'move':'none';v61WorldScreen.querySelectorAll('.v64-drag-over').forEach(item=>item.classList.remove('v64-drag-over'));if(valid)target.classList.add('v64-drag-over');
});
v61WorldScreen.addEventListener('dragleave',event=>{
 const target=v64CareerDragTarget(event.target);
 if(target&&!target.contains(event.relatedTarget))target.classList.remove('v64-drag-over');
});
v61WorldScreen.addEventListener('drop',event=>{
 if(!v64CareerDraggedBench)return;
 const target=v64CareerDragTarget(event.target);event.preventDefault();
 const source=v64CareerDraggedBench;v64CareerDraggedBench=null;
 if(v64CareerCanDrop(source,target))v64CareerDropAction(source,target);
 v61WorldScreen.querySelectorAll('.v64-drag-over').forEach(item=>item.classList.remove('v64-drag-over'));
});
v61WorldScreen.addEventListener('dragend',()=>{
 v64CareerDraggedBench=null;v61WorldScreen.querySelectorAll('.v64-drag-over').forEach(item=>item.classList.remove('v64-drag-over'));
});
v61WorldScreen.addEventListener('keydown',event=>{
 const button=event.target.closest?.('[data-v64-career-slot][data-v64-cell]');
 if(!button||!event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
 event.preventDefault();const drag=v64CareerDragSource(button);if(!drag)return;
 const destination=v64CareerKeyboardCell(Number(button.dataset.v64Cell),event.key,window.matchMedia('(min-width:900px), (min-width:600px) and (orientation:landscape)').matches);if(destination===null)return;
 v64CareerSelectedSlot=drag.source.slot;
 v64CareerCommit(v61CurrentCareer,({fixture,state})=>v64MoveCell(v61CurrentCareer,fixture,state,0,drag.source.pid,destination)).then(()=>{const slot=v64CareerPlanContext(v61CurrentCareer).fixture.plan.home.starters.indexOf(drag.source.pid);v61WorldScreen.querySelector(`[data-v64-career-slot="${slot}"]`)?.focus()});
});

function v140PresetContext(panel){
 const career=v61CurrentCareer;if(!career)return null;
 if(panel.dataset.v140Mode==='career'){if(career.world.activeMatch)return null;return {career,...v64CareerPlanContext(career),side:0};}
 const fixture=v64ActiveFixture(career),state=career.world.activeMatch?.state;if(!fixture||!['prematch','paused'].includes(state?.phase))return null;return {career,fixture,state,side:v64UiOwnSide(fixture)};
}
function v140PresetRender(context,mode){if(mode==='career')v64CareerRenderView(context.career);else if(mode==='paused'){const physical=v65Context();v65ApplyTactics(physical);v65Snapshot(physical);v65UpdateControls(physical);draw();}else v64UiRender(context.career);}
document.addEventListener('input',event=>{if(event.target.matches('[data-v140-name]'))v140MatchPresetName=event.target.value;});
document.addEventListener('change',event=>{if(event.target.matches('[data-v140-select]'))v140MatchPresetId=event.target.value;});
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-v140-save],[data-v140-load],[data-v140-delete]');if(!button||button.disabled)return;
 const panel=button.closest('.v140-match-presets'),context=v140PresetContext(panel);if(!context)return;const {career,fixture,state,side}=context;button.disabled=true;
 try{if(button.hasAttribute('data-v140-save'))await v140SaveMatchPreset(career,fixture,state,side,panel.querySelector('[data-v140-name]').value);else if(button.hasAttribute('data-v140-delete')){const id=panel.querySelector('[data-v140-select]').value,preset=(career.manager.tacticPresets||[]).find(p=>p.id===id),question=`Vorlage „${preset.name}“ entfernen?`;if(!window.confirm(window.doppel6Language?.localize(question)||question)){button.disabled=false;return;}const previous=career.manager.tacticPresets;try{career.manager.tacticPresets=previous.filter(p=>p.id!==id);await v64UiSave();}catch(error){career.manager.tacticPresets=previous;throw error;}}else await v140LoadMatchPreset(career,fixture,state,panel.querySelector('[data-v140-select]').value);v140PresetRender(context,panel.dataset.v140Mode);}
 catch(error){panel.querySelector('[data-v140-error]').textContent=error.message;button.disabled=false;}
});
