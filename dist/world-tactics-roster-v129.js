'use strict';
// One presentation/interaction seam for the permanent plan and match preparation.
(()=>{
 const labels={gk:'Torwart',def:'Abwehr',mid:'Mittelfeld',att:'Angriff'};
 let picked=null;
 const translations={'Weitere Kaderspieler':'Other squad players','Außerhalb des Spieltagskaders':'Outside the match squad','Wählen':'Select','Nicht verfügbar':'Unavailable','mit der Eingabetaste wählen und danach mit der Eingabetaste auf einem Spieler im Feld oder auf der Bank tauschen':'press Enter to select, then press Enter on a player on the pitch or bench to swap','Spieler ziehen oder per Tastatur tauschen (Alt + Pfeiltasten, Eingabetaste).':'Drag players, or swap with the keyboard (Alt + arrow keys, Enter).','Jetzt mit der Eingabetaste einen Feld- oder Bankspieler zum Tauschen wählen.':'Now press Enter on a player on the pitch or bench to swap.','Torwart und Feldspieler können ihre Position nicht tauschen.':'Keepers and outfield players cannot swap positions.','Mit der Eingabetaste einen Feld- oder Bankspieler zum Tauschen wählen.':'Press Enter on a player on the pitch or bench to swap.','Positionen':'Positions'};
 const tr=text=>document.documentElement.lang==='en'?(translations[text]||window.doppel6Language?.localize(text)||text):text;
 const outside=(roster,plan)=>roster.filter(p=>!plan.starters.includes(p.pid)&&!plan.bench.includes(p.pid));
 function card(p,careerMode){
  const attr=careerMode?'data-v64-career-bench-card':'data-v64-bench-card',profile=careerMode?'data-v64-career-profile':'data-v64-profile',available=v129RosterEligible(p),position=p.keeper?'gk':p.line;
  return `<article class="bench-chip v64-bench-chip v129-roster-card" draggable="${available}" ${attr}="${escapeHTML(p.pid)}" data-v129-position="${escapeHTML(position)}" ${available?'':'aria-disabled="true"'}><div class="bench-select"><span class="bench-title">${v61FlagSVG(p.nation)}<b>#${escapeHTML(p.n)} ${escapeHTML(p.name)}</b></span><span class="bench-meta"><span class="v129-position">${tr(labels[position]||'')}</span> · ${freshText(p.fresh)}</span>${v51StatusHTML(p,p.fresh)}<span class="bench-skills">${v55TopSkillsHTML(p)}</span></div><div class="v129-card-actions"><button type="button" data-v129-roster-pick="${escapeHTML(p.pid)}" aria-pressed="false" aria-label="${escapeHTML(p.name+' · '+tr('mit der Eingabetaste wählen und danach mit der Eingabetaste auf einem Spieler im Feld oder auf der Bank tauschen'))}" ${available?'':'disabled'}>${tr(available?'Wählen':'Nicht verfügbar')}</button><button type="button" class="player-link" ${profile}="${escapeHTML(p.pid)}">Details</button></div></article>`;
 }
 function section(roster,plan,careerMode){
  const extra=outside(roster,plan);return (extra.length?`<section class="v129-roster-overflow" aria-label="${tr('Weitere Kaderspieler')}"><div class="v129-roster-divider"><h3>${tr('Weitere Kaderspieler')}</h3><span>${extra.length} · ${tr('Außerhalb des Spieltagskaders')}</span></div><div class="bench-strip v64-bench-strip">${extra.map(p=>card(p,careerMode)).join('')}</div></section>`:'')+`<p class="v129-roster-help" role="status" data-v129-roster-status>${tr('Spieler ziehen oder per Tastatur tauschen (Alt + Pfeiltasten, Eingabetaste).')}</p><ul class="v129-position-legend" aria-label="${tr('Positionen')}">${Object.entries(labels).map(([position,label])=>`<li data-v129-position="${position}"><i aria-hidden="true"></i>${tr(label)}</li>`).join('')}</ul>`;
 }
 function decorate(html,roster,careerMode){
  const template=document.createElement('template');template.innerHTML=html;
  template.content.querySelectorAll(careerMode?'[data-v64-career-bench-card]':'[data-v64-bench-card]').forEach(n=>{
   const pid=careerMode?n.dataset.v64CareerBenchCard:n.dataset.v64BenchCard,p=roster.find(p=>p.pid===pid);if(!p)return;
   n.dataset.v129Position=p.keeper?'gk':p.line;
   const button=document.createElement('button');button.type='button';button.dataset.v129RosterPick=pid;button.textContent=tr('Wählen');button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',p.name+' · '+tr('mit der Eingabetaste wählen und danach mit der Eingabetaste auf einem Spieler im Feld oder auf der Bank tauschen'));button.disabled=!v129RosterEligible(p);n.append(button);
  });return template.innerHTML;
 }
 const originalBench=v64UiPrematchBench;v64UiPrematchBench=function(career,fixture,state,side){picked=null;const html=originalBench(career,fixture,state,side);if(state.phase!=='prematch')return html;const roster=v64Side(career,fixture,side),plan=side===0?fixture.plan.home:fixture.plan.away;return decorate(html,roster,false)+section(roster,plan,false);};
 const originalPlan=v64CareerPlanHTML;v64CareerPlanHTML=function(career){picked=null;const roster=v64CareerClub(career).roster,plan=v64CareerPlanContext(career).fixture.plan.home;return decorate(originalPlan(career),roster,true).replace('</div><div class="v129-plan-controls">',section(roster,plan,true)+'</div><div class="v129-plan-controls">');};
 const originalPitch=v64UiPrematchPitch;v64UiPrematchPitch=function(career,fixture,state,side,options={}){const template=document.createElement('template');template.innerHTML=originalPitch(career,fixture,state,side,options);const plan=side===0?fixture.plan.home:fixture.plan.away;template.content.querySelectorAll('[data-v64-pick-slot],[data-v64-career-slot]').forEach(n=>{const slot=Number(n.dataset.v64PickSlot??n.dataset.v64CareerSlot),pid=plan.starters[slot];n.dataset.v129Position=state.roles[pid];});return template.innerHTML;};
 function context(mode){const career=v61CurrentCareer;if(!career)return null;if(mode==='career'){if(career.world.activeMatch)return null;return {career,...v64CareerPlanContext(career),side:0};}const fixture=v64ActiveFixture(career),state=career.world.activeMatch?.state;if(!fixture||state?.phase!=='prematch')return null;return{career,fixture,state,side:v64UiOwnSide(fixture)};}
 function targetPid(target,c,mode){const key=mode==='career'?'v64CareerSlot':'v64PickSlot',card=mode==='career'?'v64CareerBenchCard':'v64BenchCard',plan=c.side===0?c.fixture.plan.home:c.fixture.plan.away;return target?.dataset[key]!==undefined?plan.starters[Number(target.dataset[key])]:target?.dataset[card];}
 function valid(source,target,mode){const c=context(mode);if(!c||!source||!target||mode==='career'&&v64CareerCommitPending)return false;const plan=c.side===0?c.fixture.plan.home:c.fixture.plan.away,a=source.kind==='field'?plan.starters[source.slot]:source.pid,b=targetPid(target,c,mode),pa=v64Player(c.career,c.fixture,c.side,a),pb=v64Player(c.career,c.fixture,c.side,b);if(!pa||!pb||a===b||!v129RosterEligible(pa)||!v129RosterEligible(pb))return false;const fieldA=plan.starters.includes(a),fieldB=plan.starters.includes(b);return fieldA||fieldB?pa.keeper===pb.keeper:plan.bench.includes(a)||plan.bench.includes(b);}
 const careerCan=v64CareerCanDrop;v64CareerCanDrop=function(source,target){if(source?.kind==='field'&&target?.dataset.v64Cell!==undefined)return careerCan(source,target);return valid(source,target,'career');};
 const matchCan=v64UiCanDrop;v64UiCanDrop=function(target){if(v64UiDrag?.kind==='field'&&target?.dataset.v64Cell!==undefined)return matchCan(target);return valid(v64UiDrag,target,'prematch');};
 function mutate(c,source,target,mode){const plan=c.side===0?c.fixture.plan.home:c.fixture.plan.away,a=source.kind==='field'?plan.starters[source.slot]:source.pid,b=targetPid(target,c,mode),ai=plan.starters.indexOf(a),bi=plan.starters.indexOf(b);if(ai>=0&&bi>=0)return v64UiSwapSlots(c.career,c.fixture,c.state,c.side,ai,bi);if(ai>=0||bi>=0)return v64SetPrematchSlot(c.career,c.fixture,c.state,c.side,ai>=0?ai:bi,ai>=0?b:a);return v129RosterBench(c.career,c.fixture,c.state,c.side,plan.bench.includes(a)?a:b,plan.bench.includes(a)?b:a);}
 const careerDrop=v64CareerDropAction;v64CareerDropAction=function(source,target){if(source.kind==='field'&&target?.dataset.v64Cell!==undefined)return careerDrop(source,target);if(!valid(source,target,'career'))return;const c=context('career');picked=null;return v64CareerCommit(c.career,({fixture,state})=>mutate({...c,fixture,state},source,target,'career'));};
 const matchDrop=v64UiDropAction;v64UiDropAction=function(source,target){if(source.kind==='field'&&target?.dataset.v64Cell!==undefined)return matchDrop(source,target);if(!valid(source,target,'prematch'))return;const c=context('prematch');picked=null;try{v64UiRemember(c.fixture,c.state);mutate(c,source,target,'prematch');v64UiTab='lineup';v64UiSave();v64UiRender(c.career);}catch(error){v64UiError(error)}finally{v64UiDrag=null;}};
 const idleStatus='Spieler ziehen oder per Tastatur tauschen (Alt + Pfeiltasten, Eingabetaste).',pickedStatus='Jetzt mit der Eingabetaste einen Feld- oder Bankspieler zum Tauschen wählen.';
 function paint(){document.querySelectorAll('[data-v129-roster-pick]').forEach(n=>{const on=picked?.pid===n.dataset.v129RosterPick;n.setAttribute('aria-pressed',String(on));n.closest('article')?.classList.toggle('v129-picked',on)});document.querySelectorAll('[data-v129-roster-status]').forEach(n=>n.textContent=tr(picked?pickedStatus:idleStatus));}
 // Reserve selection is a keyboard/assistive way: activate "Wählen", then activate a shirt or another card. Real pointer clicks never swap.
 window.v129KeyboardPick=(card,pid)=>{
  if(!card.querySelector('[data-v129-roster-pick]')){const name=card.querySelector('.bench-title b')?.textContent||pid,button=document.createElement('button');button.type='button';button.dataset.v129RosterPick=pid;button.textContent=tr('Wählen');button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',name+' · '+tr('mit der Eingabetaste wählen und danach mit der Eingabetaste auf einem Spieler im Feld oder auf der Bank tauschen'));card.append(button);}
  if(picked?.mode==='pause'&&picked.pid===pid)paint();
 };
 const slotSelector='[data-v64-career-slot],[data-v64-pick-slot],[data-v65-pick-slot]',cardSelector='[data-v64-career-bench-card],[data-v64-bench-card],[data-v65-bench-card]';
 const modeOf=element=>element.closest('[data-v46-view="matchplan"]')?'career':element.closest('#v65-plan-view')?'pause':'prematch';
 function swapReserve(pid,target,mode){
  const source={kind:'bench',pid};
  if(mode==='pause'){v65Drag=source;try{if(v65CanDrop(target))v65DropAction(source,target);else v65ReportInvalidDrop();}finally{v65Drag=null;}return;}
  const c=context(mode);if(!c)return;
  if(pid===targetPid(target,c,mode))return;
  if(valid(source,target,mode))return mode==='career'?v64CareerDropAction(source,target):v64UiDropAction(source,target);
  const status=document.querySelector('[data-v129-roster-status]');if(status)status.textContent=tr('Mit der Eingabetaste einen Feld- oder Bankspieler zum Tauschen wählen.');
 }
 // Real pointer clicks (pointerdown before the click, detail > 0) never select or swap; keyboard and assistive-technology activation arrives as a click without that pointer sequence.
 let pointerSequence=false;
 document.addEventListener('pointerdown',()=>{pointerSequence=true;},true);
 function focusFirstTarget(pid,mode){
  const source={kind:'bench',pid},targets=[...document.querySelectorAll(slotSelector)].filter(element=>modeOf(element)===mode&&(mode==='pause'?(v65Drag=source,v65CanDrop(element)):valid(source,element,mode)));
  v65Drag=null;targets[0]?.focus();
 }
 document.addEventListener('keydown',event=>{
  pointerSequence=false;
  if(event.key==='Escape'&&picked){const pid=picked.pid;picked=null;paint();document.querySelector(`[data-v129-roster-pick="${pid}"]`)?.focus();}
 },true);
 document.addEventListener('click',event=>{
  const pointer=pointerSequence&&event.detail>0;pointerSequence=false;
  const button=event.target.closest?.('[data-v129-roster-pick]'),slot=button?null:event.target.closest?.(slotSelector);
  if(!button&&!(slot&&picked))return;
  const element=button||slot,mode=modeOf(element);
  if(pointer){if(button){event.preventDefault();event.stopImmediatePropagation();}return;}
  if(slot&&picked.mode!==mode)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(button){
   if(!picked||picked.mode!==mode){picked={pid:button.dataset.v129RosterPick,mode};paint();focusFirstTarget(picked.pid,mode);return;}
   const pid=picked.pid;picked=null;paint();
   if(pid!==button.dataset.v129RosterPick){const card=button.closest(cardSelector);if(card)swapReserve(pid,card,mode);}
   return;
  }
  const pid=picked.pid;picked=null;paint();
  const focusSlot=()=>{const attribute=slot.hasAttribute('data-v64-career-slot')?'data-v64-career-slot':slot.hasAttribute('data-v65-pick-slot')?'data-v65-pick-slot':'data-v64-pick-slot';document.querySelector(`[${attribute}="${slot.getAttribute(attribute)}"]`)?.focus();};
  Promise.resolve(swapReserve(pid,slot,mode)).then(focusSlot);
 },true);
 let renderedLanguage=document.documentElement.lang;
 document.addEventListener('doppel6-language-change',()=>{const language=document.documentElement.lang;if(language===renderedLanguage)return;renderedLanguage=language;const c=v61CurrentCareer;if(!c)return;if(!c.world.activeMatch)v64CareerRenderView(c);else if(c.world.activeMatch.state.phase==='prematch')v64UiRender(c);});
})();
