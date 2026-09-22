'use strict';

// One career progression action. The underlying game functions remain responsible
// for validation, confirmations and saving; this layer only chooses the next step.
const v58Bar=document.createElement('div');
v58Bar.id='career-progress';
v58Bar.hidden=true;
v58Bar.innerHTML='<div class="career-progress-inner"><div class="career-progress-copy"><small>NÄCHSTER SCHRITT</small><span id="career-progress-context"></span></div><button type="button" id="career-progress-action" class="primary"></button></div>';
document.body.querySelector('header').insertAdjacentElement('afterend',v58Bar);
const v58Button=v58Bar.querySelector('#career-progress-action');
const v58Context=v58Bar.querySelector('#career-progress-context');
let v58LastReport=null;
let v58LastShootout=null;
let v58FinaleAction=null;

function v58ScrollTo(selector,tab){
 if(tab&&typeof v46SetTab==='function')v46SetTab(tab,false);
 const target=clubCenter.querySelector(selector);
 target?.scrollIntoView({behavior:'smooth',block:'start'});
 target?.querySelector('button:not(:disabled),select')?.focus({preventScroll:true});
}
function v58CleanCenter(){
 const finale=clubCenter.querySelector('[data-finale-stage]');
 v58FinaleAction=finale?{stage:finale.dataset.finaleStage,label:finale.textContent.replace('↗','').trim()}:null;
 for(const selector of ['#to-lineup','#next-season','#next-market-day','[data-finale-stage]'])clubCenter.querySelector(selector)?.remove();
 const deadline=clubCenter.querySelector('#deadline-button');
 if(deadline){
  const market=clubCenter.querySelector('.transfer-panel');
  if(market){
   let actions=market.querySelector('.market-day-actions');
   if(!actions){actions=document.createElement('div');actions.className='market-day-actions';market.querySelector('.window-check')?.before(actions)}
   actions?.append(deadline);
  }
  const finalDay=transferState().day>=transferState().maxDays;
  if(finalDay)deadline.remove();
  else deadline.textContent='Transferphase vorzeitig beenden';
 }
}
function v58State(){
 if(!activeSave||startScreen.hidden===false)return null;
 if(v47CompetitionDialog.open)return{context:'Ergebnisse & Tabelle',label:'Zur Vereinszentrale',action:'center'};
 if(v47Dialog.open)return{context:'Spielbericht',label:'Ergebnisse & Tabelle ansehen',action:'competition'};
 if(!v42Screen.hidden&&v42Session?.mode==='career'){
  if(v42Session.phase==='choose')return{context:'Elfmeterschützen festlegen'};
  if(v42Session.phase==='shooting')return{context:'Pokal · Elfmeterschießen',label:'Nächster Elfmeter',action:'penalty-kick'};
  return{context:'Elfmeterschießen beendet',label:'Spielbericht ansehen',action:'penalty-report'};
 }
 if(!$('#game-screen').hidden){
  if(running)return{context:'Spiel läuft · Abpfiff abwarten'};
  if(!$('#match-area').hidden&&match?.finished){
   if($('#cup-next-kick'))return{context:'Elfmeterschießen',label:'Nächsten Elfmeter ansehen',action:'penalty'};
   return v58LastReport?{context:'Abpfiff',label:'Spielbericht ansehen',action:'report'}:{context:'Abpfiff',label:'Zur Vereinszentrale',action:'center'};
  }
  const ceremony=$('#cup-final-start'),startButton=$('#start');
  return{context:ceremony?'Pokal-Finale · Einlauf':'Aufstellung & Taktik',label:ceremony?'Finale starten':startButton.textContent.replace('↗','').trim(),action:ceremony?'ceremony':'start',disabled:!ceremony&&startButton.disabled,reason:startButton.title||''};
 }
 if(clubCenter.hidden)return null;
 if(activeSave.finance?.gameOver||activeSave.seasonFinale?.stage==='gameover')return{context:'Karriere beendet'};
 if(activeSave.currentRound>=10){
  if(!v58FinaleAction)return{context:'Saisonabschluss'};
  return{context:`Saison ${activeSave.seasonNumber} · Abschluss`,label:v58FinaleAction.label,action:'finale'};
 }
 const state=transferState();
 if(!selectedSponsor())return{context:'Für die neue Saison',label:'Sponsor wählen',action:'sponsor'};
 if(state.open){
  const context=`Transferphase · Tag ${state.day} von ${state.maxDays}`;
  if(state.day<state.maxDays)return{context,label:'Nächster Transfertag',action:'day'};
  if(state.bids.some(bid=>bid.status==='pending'))return{context,label:'Letzte Angebote entscheiden',action:'bids'};
  if(!validMatchSquad())return{context,label:'Kader prüfen',action:'roster'};
  return{context,label:'Transferschluss bestätigen',action:'deadline'};
 }
 if(!validMatchSquad())return{context:'Kader nicht spielfähig',label:'Kader prüfen',action:'roster'};
 const cup=typeof v41CupGameForUser==='function'&&v41CupGameForUser();
 return{context:cup?`Pokal · ${v41Labels[activeSave.cup.stage]}`:`Liga · Spieltag ${activeSave.currentRound+1}`,label:cup?'Zur Pokalaufstellung':'Zur Aufstellung',action:'tactics'};
}
function v58PlaceButton(){
 const dialog=v47CompetitionDialog.open?v47CompetitionDialog:v47Dialog.open?v47Dialog:null;
 if(!dialog){v58Bar.querySelector('.career-progress-inner').append(v58Button);return}
 const head=dialog.querySelector('.v47-head,.v47-competition-head');
 if(!head)return;
 let slot=dialog.querySelector('.v58-dialog-action');
 if(!slot){slot=document.createElement('div');slot.className='v58-dialog-action';head.insertAdjacentElement('afterend',slot)}
 slot.append(v58Button);
}
function v58Refresh(){
 document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 58');
 const menuFooter=startScreen.querySelector('footer');if(menuFooter)menuFooter.textContent='Doppel 6 / PROTOTYP 58';
 const state=v58State();
 v58Bar.hidden=!state;
 document.body.classList.toggle('v58-active',Boolean(state));
 document.body.classList.toggle('v58-penalty-done',state?.action==='penalty-report');
 if(!state)return;
 v58PlaceButton();
 v58Context.textContent=state.context;
 v58Button.hidden=!state.action;
 if(state.action){v58Button.textContent=state.label+' →';v58Button.disabled=Boolean(state.disabled);v58Button.title=state.reason||'';v58Button.dataset.action=state.action}
}
v58Button.onclick=()=>{
 const state=v58State();
 if(!state?.action||state.disabled)return;
 switch(state.action){
  case 'sponsor':v58ScrollTo('.sponsor-choice','overview');break;
  case 'roster':v58ScrollTo('.v35-roster,.squad-list,.transfer-panel','transfers');break;
  case 'day':advanceTransferDay();break;
  case 'bids':v29ResolveFinalBids();break;
  case 'deadline':requestDeadline();break;
  case 'tactics':showTactics();break;
  case 'start':$('#start').click();break;
  case 'ceremony':$('#cup-final-start')?.click();break;
  case 'penalty':$('#cup-next-kick')?.click();break;
  case 'penalty-kick':v42Screen.querySelector('#v42-next')?.click();break;
  case 'penalty-report':v42Screen.querySelector('#v42-exit')?.click();break;
  case 'report':v47ShowReport(v58LastReport,v58LastShootout);break;
  case 'competition':v47Dialog.close();v47ShowCompetition(v58LastReport);break;
  case 'center':v47CompetitionDialog.close?.();showCenter();break;
  case 'finale':v31SetStage(v58FinaleAction.stage);break;
 }
 v58Refresh();
};

const v58BaseRenderCenter=renderCenter;
renderCenter=function(){const result=v58BaseRenderCenter();if(activeSave)v58CleanCenter();v58Refresh();return result};
const v58BaseShowCenter=showCenter;
showCenter=function(){const result=v58BaseShowCenter();v58Refresh();return result};
const v58BaseShowTactics=showTactics;
showTactics=function(){const result=v58BaseShowTactics();v58Refresh();return result};
const v58BaseShowStartScreen=showStartScreen;
showStartScreen=function(){const result=v58BaseShowStartScreen();v58Refresh();return result};
const v58BaseRender=render;
render=function(){const result=v58BaseRender();v58Refresh();return result};
const v58BaseStart=start;
start=function(){const result=v58BaseStart();v58Refresh();return result};
$('#start').onclick=()=>start();
const v58BaseFinishMatch=finishMatch;
finishMatch=function(){const result=v58BaseFinishMatch();v58Refresh();return result};
const v58BaseRenderPenalties=v42RenderScreen;
v42RenderScreen=function(openDialog=false){const result=v58BaseRenderPenalties(openDialog);v58Refresh();return result};
const v58BaseShowReport=v47ShowReport;
v47ShowReport=function(report,shootout){
 v58LastReport=report;v58LastShootout=shootout;
 const result=v58BaseShowReport(report,shootout);
 v47Dialog.querySelector('.v47-actions')?.remove();
 v58Refresh();return result
};
const v58BaseShowCompetition=v47ShowCompetition;
v47ShowCompetition=function(report){
 v58LastReport=report;
 const result=v58BaseShowCompetition(report);
 v47CompetitionDialog.querySelector('.v47-competition-actions')?.remove();
 v58Refresh();return result
};
for(const dialog of [v47Dialog,v47CompetitionDialog])dialog.addEventListener('close',()=>queueMicrotask(v58Refresh));
v58Refresh();
