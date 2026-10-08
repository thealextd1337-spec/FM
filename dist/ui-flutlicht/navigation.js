/* Presentation-only subnavigation over existing controller-owned menu nodes. */
(() => {
 'use strict';
 const ns=window.D6Flutlicht=window.D6Flutlicht||{},states=new WeakMap(),routes=new Map(),remembered=new Map(),filterStates=new WeakMap(),filterMemory=new Map(),markup=new WeakMap();
 const definitions={
  squad:{label:'Kaderbereiche',sections:[['roster','Profikader'],['contracts','Verträge'],['youth','Nachwuchs']]},
  transfers:{label:'Transferbereiche',sections:[['search','Spielersuche'],['listed','Von Vereinen angeboten'],['own','Eigene Transferliste'],['offers','Angebote & Verhandlungen'],['balance','Transferbilanz']]},
  competition:{label:'Wettbewerbsbereiche',sections:[['league','Liga'],['cup','Nationaler Pokal'],['europe','Europacup'],['countries','Andere Länder'],['archive','Titelarchiv']]}
 };
 const competitionChoices=[['league','Liga'],['cup','Nationaler Pokal'],['europe','Europacup']];
 const categories=[['goals','Tore'],['assists','Vorlagen'],['cleanSheet','Zu-null-Spiele'],['fouls','Fouls'],['penaltiesScored','Elfmeter verwandelt'],['penaltiesMissed','Elfmeter verschossen']];
 let sequence=0;
 const setText=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
 const setHTML=(node,value)=>{if(markup.get(node)!==value){node.innerHTML=value;markup.set(node,value);}};
 function select(route,section,{focus=false}={}){
  const state=routes.get(route);if(!state?.view.isConnected||!state.nav.isConnected||!state.panels.has(section))return false;
  state.active=section;remembered.set(route,section);state.view.dataset.flSection=section;
  for(const [key,panel] of state.panels){panel.hidden=key!==section;const button=state.buttons.get(key);button.setAttribute('aria-selected',String(key===section));button.tabIndex=key===section?0:-1;}
  if(route==='competition'){
   const area=section==='countries'?'other':'own',button=state.view.querySelector(`[data-v62-area="${area}"]`);
   // The original controller retains its own/other-country selection and country filter.
   if(button&&button.getAttribute('aria-selected')!=='true')button.click();
   const other=state.view.querySelector('[data-v62-competition-area="other"]');if(other)other.hidden=section!=='countries';
  }
  if(focus)state.buttons.get(section).focus({preventScroll:true});
  return true;
 }
 function create(view,route,host,anchor,actions){
  let state=states.get(view);if(state){state.actions=actions;routes.set(route,state);return state;}
  const prefix=`fl-section-${++sequence}`,nav=document.createElement('div'),bodies=document.createElement('div');
  nav.className='fl-section-tabs';nav.setAttribute('role','tablist');bodies.className='fl-section-panels';
  state={view,route,host,nav,bodies,actions,panels:new Map(),buttons:new Map(),active:definitions[route].sections[0][0]};
  for(const [key] of definitions[route].sections){
   const button=document.createElement('button'),panel=document.createElement('section');button.type='button';button.id=`${prefix}-tab-${key}`;button.dataset.flSectionTab=key;button.setAttribute('role','tab');button.setAttribute('aria-controls',`${prefix}-panel-${key}`);
   panel.id=`${prefix}-panel-${key}`;panel.dataset.flSectionPanel=key;panel.className='fl-section-panel';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);panel.tabIndex=0;
   nav.append(button);bodies.append(panel);state.buttons.set(key,button);state.panels.set(key,panel);
  }
  nav.addEventListener('click',event=>{if(!nav.isConnected||!view.isConnected)return;const button=event.target.closest('[data-fl-section-tab]');if(button&&nav.contains(button)&&select(route,button.dataset.flSectionTab)){state.actions.setSection?.(route,button.dataset.flSectionTab);}});
  nav.addEventListener('keydown',event=>{
   if(!nav.isConnected||!view.isConnected)return;
   const button=event.target.closest('[data-fl-section-tab]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();const keys=[...state.panels.keys()],index=keys.indexOf(button.dataset.flSectionTab),key=keys[event.key==='Home'?0:event.key==='End'?keys.length-1:(index+(event.key==='ArrowRight'?1:-1)+keys.length)%keys.length];
   select(route,key,{focus:true});state.actions.setSection?.(route,key);
  });
  if(anchor)anchor.after(nav);else host.prepend(nav);nav.after(bodies);view.classList.add('fl-navigation-view');states.set(view,state);routes.set(route,state);return state;
 }
 function empty(state,key,label,t){
  const panel=state.panels.get(key);let message=panel.querySelector(':scope > .fl-navigation-empty');
  if([...panel.children].some(node=>node!==message)){message?.remove();return;}
  if(!message){message=document.createElement('p');message.className='fl-navigation-empty';panel.append(message);}setText(message,t(label));
 }
 function squad(view,projection,actions,t){
  const state=create(view,'squad',view,view.querySelector(':scope > .v46-view-heading'),actions);
  for(const node of [...view.children]){
   if(node===state.nav||node===state.bodies||node.matches('.v46-view-heading'))continue;
   const key=node.matches('.v66-contracts')?'contracts':node.matches('.v67-youth')?'youth':'roster';state.panels.get(key).append(node);
  }
  for(const key of ['roster','contracts','youth'])empty(state,key,'Bereich nicht verfügbar.',t);
  return state;
 }
 function transfers(view,projection,actions,t){
  const market=view.querySelector('.v66-market');if(!market)return null;
  const state=create(view,'transfers',market,market.querySelector(':scope > .v62-season-head'),actions);
  for(const node of [...market.children]){
   if(node===state.nav||node===state.bodies||node.matches('.v62-season-head,.fl-market-jumps,#v66-message'))continue;
   if(node.matches('.v66-recovery,.v66-deadline')){state.nav.before(node);continue;}
   // The phase/roster notice remains visible above all transfer destinations.
   if(node.matches('p')&&!node.classList.contains('v66-note')){state.nav.before(node);continue;}
   let key='search';
   if(node.matches('.v72-sale-list'))key='listed';else if(node.matches('.v72-own-sales'))key='own';else if(node.matches('.v72-open-deals,.v66-bids'))key='offers';
   else if(node.matches('h3')&&node.nextElementSibling?.matches('.v66-bids'))key='offers';
   state.panels.get(key).append(node);
  }
  let balance=state.panels.get('balance').querySelector(':scope > .fl-navigation-balance');
  if(!balance){balance=document.createElement('div');balance.className='fl-navigation-balance';state.panels.get('balance').append(balance);}
  setHTML(balance,projection.navigation?.transferBalanceHTML||`<p class="fl-navigation-empty">${ns.components.escape(t('Transferbilanz nicht erfasst.'))}</p>`);
  empty(state,'offers','Keine laufenden Angebote oder Verhandlungen.',t);empty(state,'listed','Bereich nicht verfügbar.',t);empty(state,'own','Bereich nicht verfügbar.',t);return state;
 }
 function competition(view,projection,actions,t){
  const heading=view.querySelector('.v62-competition-heading'),host=heading?.parentElement;if(!host)return null;
  const state=create(view,'competition',host,heading,actions),own=view.querySelector('[data-v62-competition-area="own"]'),other=view.querySelector('[data-v62-competition-area="other"]');
  view.querySelector('.v62-competition-tabs')?.classList.add('fl-navigation-native-tabs');own?.classList.add('fl-navigation-native-area');
  const groups=own?.querySelector('.v62-competitions');
  if(groups){
   const details=[...groups.children].filter(node=>node.matches('details'));
   details.forEach((node,index)=>{const key=['league','cup','europe'][index];if(key){let group=state.panels.get(key).querySelector(':scope > .fl-navigation-competition-group');if(!group){group=document.createElement('div');group.className='fl-navigation-competition-group fl-competition-groups';state.panels.get(key).append(group);}group.append(node);}});
  }
  if(other&&!state.panels.get('countries').contains(other))state.panels.get('countries').append(other);
  const awards=host.querySelector(':scope > .v62-awards-overview');if(awards)state.panels.get('league').append(awards);
  const archive=view.querySelector('.v68-archive');if(archive&&!state.panels.get('archive').contains(archive)){state.panels.get('archive').append(archive);archive.open=true;}
  for(const key of ['league','cup','europe','countries'])empty(state,key,'Bereich nicht verfügbar.',t);empty(state,'archive','Noch keine Titel archiviert.',t);return state;
 }
 function controls(view,kind,choices,actions,projection){
  let state=filterStates.get(view);if(state){state.actions=actions;return state;}
  const key=`${projection.players?.ownClubId||''}:${kind}`,remember=filterMemory.get(key)||Object.fromEntries(choices.map(([name,,options,initial])=>[name,initial||options[0][0]])),node=document.createElement('div');
  node.className='fl-navigation-filters';state={view,node,actions,inputs:new Map(),remember,choices};
  for(const [name,label,options] of choices){const wrapper=document.createElement('label'),caption=document.createElement('span'),input=document.createElement('select');caption.dataset.flFilterLabel=name;input.dataset.flFilter=name;wrapper.append(caption,input);node.append(wrapper);state.inputs.set(name,input);}
  node.addEventListener('change',event=>{if(!node.isConnected||!view.isConnected)return;const name=event.target.dataset.flFilter;if(state.inputs.get(name)!==event.target)return;state.remember[name]=event.target.value;filterMemory.set(key,state.remember);state.apply?.();});
  filterStates.set(view,state);return state;
 }
 function translateFilters(state,t){
  for(const [name,label,options] of state.choices){const input=state.inputs.get(name);setText(state.node.querySelector(`[data-fl-filter-label="${name}"]`),t(label));setHTML(input,options.map(([value,text])=>`<option value="${value}">${ns.components.escape(t(text))}</option>`).join(''));if(input.value!==state.remember[name])input.value=state.remember[name];}
 }
 function calendar(view,projection,actions,t){
  const calendar=view.querySelector('.v62-calendar');if(!calendar)return;
  const state=controls(view,'calendar',[['competition','Wettbewerb',[['all','Alle Wettbewerbe'],...competitionChoices]],['time','Zeitraum',[['all','Alle Termine'],['upcoming','Anstehend'],['played','Abgeschlossen']]]],actions,projection);
  if(!state.node.isConnected){const heading=calendar.querySelector('.v62-competition-heading');if(heading)heading.after(state.node);else calendar.prepend(state.node);}
  translateFilters(state,t);let empty=calendar.querySelector(':scope > .fl-navigation-empty');if(!empty){empty=document.createElement('p');empty.className='fl-navigation-empty';empty.setAttribute('role','status');calendar.append(empty);}setText(empty,t('Keine Termine in dieser Auswahl.'));
  state.apply=()=>{const rows=[...calendar.querySelectorAll('.v62-calendar-list > li')];let shown=0;for(const row of rows){const type=row.dataset.flCalendarType,known=competitionChoices.some(([key])=>key===type),showType=state.remember.competition==='all'||!known||state.remember.competition===type,showTime=state.remember.time==='all'||row.classList.contains(state.remember.time);row.hidden=!(showType&&showTime);if(!row.hidden)shown++;}empty.hidden=!rows.length||shown>0;};state.apply();
 }
 function statistics(view,projection,actions,t){
  if(!view.querySelector('.v62-stat-board'))return;
  const state=controls(view,'statistics',[['competition','Wettbewerb',[['all','Alle Wettbewerbe'],...competitionChoices],'league'],['category','Bestenliste',[['all','Alle Kategorien'],...categories],'goals']],actions,projection);
  if(!state.node.isConnected){const heading=view.querySelector(':scope > .v62-season > .v46-view-heading');if(heading)heading.after(state.node);else view.prepend(state.node);}
  translateFilters(state,t);
  state.apply=()=>{
   for(const board of view.querySelectorAll('.v62-stat-board')){const type=board.dataset.flStatType,known=competitionChoices.some(([key])=>key===type);board.hidden=state.remember.competition!=='all'&&known&&type!==state.remember.competition;for(const category of board.querySelectorAll('.v46-stat-category')){const key=category.dataset.flStatCategory;category.hidden=state.remember.category!=='all'&&categories.some(([name])=>name===key)&&key!==state.remember.category;}}
   for(const card of view.querySelectorAll('.v62-stat-card[data-fl-stat-type]'))card.hidden=state.remember.competition!=='all'&&card.dataset.flStatType!==state.remember.competition;
  };state.apply();
 }
 function enhance(root,projection={},actions={}){
  if(!root.classList?.contains('fl-content'))return;
  const t=actions.t||((value)=>value);
  for(const [route,build] of [['squad',squad],['transfers',transfers],['competition',competition]]){
   const view=root.querySelector(`:scope > [data-v46-view="${route}"]`);if(!view)continue;
   const state=build(view,projection,actions,t);if(!state)continue;
   state.nav.setAttribute('aria-label',t(definitions[route].label));for(const [key,label] of definitions[route].sections)setText(state.buttons.get(key),t(label));
   const external=projection.navigation?.[route];select(route,state.panels.has(external)?external:remembered.get(route)||definitions[route].sections[0][0]);
  }
  const calendarView=root.querySelector(':scope > [data-v46-view="calendar"]');if(calendarView)calendar(calendarView,projection,actions,t);
  const stats=root.querySelector(':scope > [data-v46-view="statistics"]');if(stats)statistics(stats,projection,actions,t);
 }
 ns.navigation=Object.freeze({select});ns.registry.register({id:'navigation',enhance});
})();
