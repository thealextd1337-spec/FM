'use strict';

function v124BudgetHTML(career){
 if(!v124Payments(career)||career.world.market.phase!=='budget')return'';
 const club=v66Own(career),limit=v67BudgetLimit(club),due=v66SalaryDue(career,club.id),amount=Math.min(200,limit);
 return`<section class="v62-season v67-transition" id="v124-budget"><p class="eyebrow">Saison ${career.world.season}</p><h2>Jugendbudget festlegen</h2><p>Grundbetrag und Sponsorfixum sind eingegangen. Das Jugendbudget wird jetzt vollständig bezahlt. Danach beginnt die Transferphase.</p><p>Kontostand: ${v66Credits(club.balance)} · Gehälter zum Saisonende: ${v66Credits(due)}</p><label class="v67-budget-label">Jahresbudget <strong id="v67-budget-value">${v66Credits(amount)}</strong><input id="v67-budget" type="range" min="0" max="${limit}" step="50" value="${amount}"></label><p>Die Gehälter bleiben am Saisonende fällig. Mögliche Erfolgsprämien sind noch nicht verdient.</p><button type="button" class="primary" data-v124-budget>Budget bezahlen und Transfers öffnen</button><p id="v67-transition-error" class="v61-error" role="alert"></p></section>`;
}
const v124BaseTransitionHTML=v67TransitionHTML;
v67TransitionHTML=function(career){
 const transition=career.world.transition;
 if(!v124Payments(career)||!career.world.seasonFinished||!transition||(transition.reviewStep??4)<4||transition.choice===null)return v124BaseTransitionHTML(career);
 return`<section class="v62-season v67-transition" id="v67-transition"><h2>Saison ${career.world.season+1} vorbereiten</h2><p>In der neuen Saison erhält dein Verein zuerst den Grundbetrag. Nach der Sponsorwahl legst du das Jugendbudget fest.</p><button type="button" class="primary" data-v124-next>Neue Saison starten</button><p id="v67-transition-error" class="v61-error" role="alert"></p></section>`;
};
const v124BaseFinanceHTML=v66FinanceHTML;
v66FinanceHTML=function(career){
 if(!v124Payments(career))return v124BaseFinanceHTML(career);
 const club=v66Own(career),plan=v124FinancePlan(career,club.id),rows=[...club.ledger].reverse().slice(0,18);
 const date=day=>day===0?'Saisonbeginn':v62Date(day);
 return`<section class="v62-season v66-finance"><h3>Vereinsfinanzen</h3><div class="finance-cards"><span>Kontostand<b>${v66Credits(plan.balance)}</b></span><span>Gehälter zum Saisonende<b>${v66Credits(plan.salary)}</b></span><span>Sichere Schlussprognose<b>${v66Credits(plan.safe)}</b></span><span>Mit möglichen Sponsorboni<b>${v66Credits(plan.withSponsorBonuses)}</b></span></div><p>Die Prognose berücksichtigt noch unbezahlte sichere Einnahmen und vereinbarte Gehälter. Weitere sportliche Erfolge und künftige Transfers sind nicht enthalten.</p>${club.restructuring?'<p class="v66-note">Während der Sanierung sind Käufe mit Ablöse gesperrt. Ein positiver Kontostand beendet die Sperre erst beim nächsten Saisonabschluss.</p>':''}${plan.next?`<h4>Nächste Zahlung</h4><p>${escapeHTML(plan.next.label)} · ${date(plan.next.day)} · ${v66Credits(plan.next.amount)}${plan.next.safe?'':' · noch ungewiss'}</p>`:''}<h4>Letzte Buchungen</h4><div class="ledger">${rows.map(row=>`<div><span><small>Saison ${row.season} · ${date(row.day)}</small><br>${escapeHTML(row.label)}${Number.isFinite(row.balanceAfter)?`<br><small>Kontostand danach: ${v66Credits(row.balanceAfter)}</small>`:''}</span><b class="${row.amount<0?'out':''}">${row.amount>0?'+':''}${v66Credits(row.amount)}</b></div>`).join('')}</div></section>`;
};
const v124BaseRenderCareer=v61RenderCareer;
v61RenderCareer=function(career){v124BaseRenderCareer(career);if(!career.world.activeMatch)v61WorldScreen.querySelector('[data-v46-view="overview"]')?.insertAdjacentHTML('afterbegin',v124BudgetHTML(career));v58Refresh()};
const v124BaseProgressState=v58State;
v58State=function(){
 const career=v61CurrentCareer;
 if(career&&!v61WorldScreen.hidden&&!career.world.activeMatch&&v124Payments(career)){
  if(career.world.market.phase==='budget')return{context:`Saison ${career.world.season}`,label:'Jugendbudget festlegen',action:'v124-budget'};
  const transition=career.world.transition;
  if(career.world.seasonFinished&&transition&&(transition.reviewStep??4)>=4&&transition.choice!==null)return{context:`Saison ${career.world.season+1} vorbereiten`,label:'Neue Saison starten',action:'v124-next'};
 }
 return v124BaseProgressState();
};
function v124NextSeason(){v67RunBusy('Neue Saison wird vorbereitet …',async()=>{v62NextSeason(v61CurrentCareer);await v64UiSave();v61CareerTab='overview';v61RenderCareer(v61CurrentCareer)})}
const v124BaseProgressClick=v58Button.onclick;
v58Button.onclick=function(){const action=v58State()?.action;if(action==='v124-budget'){v61SetCareerTab('overview');v61WorldScreen.querySelector('#v124-budget')?.scrollIntoView({behavior:'smooth',block:'start'});return}if(action==='v124-next'){v124NextSeason();return}return v124BaseProgressClick()};
v61WorldScreen.addEventListener('click',event=>{
 const button=event.target.closest('button'),career=v61CurrentCareer;if(!button||!career||career.world.activeMatch||!v124Payments(career))return;
 if(button.hasAttribute('data-v124-next'))v124NextSeason();
 if(button.hasAttribute('data-v124-budget'))v67RunBusy('Jugendbudget wird gespeichert …',async()=>{v124SetYouthBudget(career,v61WorldScreen.querySelector('#v67-budget').value);await v64UiSave();v61RenderCareer(career)});
});
