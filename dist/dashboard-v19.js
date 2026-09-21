'use strict';

function removeRedundantCenterPanels(){
 for(const selector of['.squad-list','.player-history'])clubCenter.querySelector(selector)?.closest('.panel')?.remove();
}

function decorateCenterAction(){
 const action=clubCenter.querySelector('#to-lineup');if(!action)return;
 const lead=action.closest('.center-lead'),eyebrow=lead?.querySelector('.eyebrow'),title=lead?.querySelector('h2'),copy=lead?.querySelector('.help');
 const sponsorMissing=typeof selectedSponsor==='function'&&!selectedSponsor(),state=typeof transferState==='function'?transferState():null,transfersOpen=activeSave.seasonNumber>=2&&state?.open;
 action.disabled=false;action.onclick=null;
 if(transfersOpen){
  if(eyebrow)eyebrow.textContent='TRANSFERPHASE';if(title)title.textContent=`Transfertag ${state.day} von ${state.maxDays}`;if(copy)copy.textContent=sponsorMissing?'Wähle den Hauptsponsor und plane danach deinen Kader.':'Plane deinen Kader und schließe danach das Transferfenster.';action.innerHTML='Transferphase fortsetzen <span>↓</span>';
 }else if(sponsorMissing){
  if(eyebrow)eyebrow.textContent='SAISONSTART';if(title)title.textContent='Hauptsponsor wählen';if(copy)copy.textContent='Wähle zuerst den Vertrag für die neue Saison.';action.innerHTML='Zur Sponsorwahl <span>↓</span>';
 }else action.innerHTML='Nächstes Spiel <span>↗</span>';
}

function decorateTacticsRoster(){
 const panel=$('#player-panel'),heading=panel?.querySelector('.section-heading h2'),count=panel?.querySelector('.section-heading span'),help=panel?.querySelector(':scope > .help');
 if(heading)heading.textContent='Kader & Aufstellung';
 if(count&&activeSave)count.textContent=`${1+activeOutfield().length} Spieler`;
 if(help)help.textContent='Lege Startelf, Rasterpositionen und Ausrichtung für das nächste Spiel fest.';
}

const v18RenderDashboardCenter=renderCenter;
renderCenter=function(){v18RenderDashboardCenter();removeRedundantCenterPanels();decorateCenterAction();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 19')};
const v18RenderDashboardLineup=renderPreMatchLineup;
renderPreMatchLineup=function(){v18RenderDashboardLineup();decorateTacticsRoster()};
const v18ShowDashboardTactics=showTactics;
showTactics=function(){v18ShowDashboardTactics();decorateTacticsRoster();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 19')};

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 19');
