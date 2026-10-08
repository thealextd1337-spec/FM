'use strict';

// Read the retained annual ledger without adding or changing career data.
function v130SeasonAccounts(career,clubId,season){
 const club=v66Club(career,clubId),books=club.ledger.filter(row=>row.season===season);
 const categories={base:0,sponsorFixed:0,sponsorBonus:0,league:0,cup:0,europe:0,match:0,sales:0,salaries:0,purchases:0,youthBudget:0,youthPromotion:0,otherIncome:0,otherExpense:0};
 const classify=row=>{
  const id=row.id;
  if(id.endsWith(':base'))return'base';
  if(id.endsWith(':fixed'))return'sponsorFixed';
  if(id.includes(':bonus:'))return'sponsorBonus';
  if(id.endsWith(':league-prize'))return'league';
  if(id.includes(':cup-prize'))return'cup';
  if(id.includes(':europe-prize'))return'europe';
  if(id.endsWith(':match-credit'))return'match';
  if(id.endsWith(':sale'))return'sales';
  if(id.endsWith(':buy'))return'purchases';
  if(id.endsWith(':salary'))return'salaries';
  if(id.endsWith(':youth-budget'))return'youthBudget';
  if(id.endsWith(':youth-promotion'))return'youthPromotion';
  return row.amount>0?'otherIncome':'otherExpense';
 };
 for(const row of books)categories[classify(row)]+=Math.abs(row.amount);
 const income=books.reduce((sum,row)=>sum+Math.max(0,row.amount),0),expense=books.reduce((sum,row)=>sum-Math.min(0,row.amount),0),net=income-expense;
 const closing=club.balance-club.ledger.filter(row=>row.season>season).reduce((sum,row)=>sum+row.amount,0);
 return{season,income,expense,net,opening:closing-net,closing,salaryPaid:books.some(row=>row.id.endsWith(':salary')),categories};
}
function v130AccountRow(label,amount,sign=''){
 return`<div class="v130-account-row"><span>${escapeHTML(label)}</span><b>${amount?sign:''}${v66Credits(amount)}</b></div>`;
}
function v130AnnualAccountsHTML(career,club){
 const season=career.world.season-1;
 if(season<1)return`<h3>Karrierestart</h3><p>Für deinen Verein liegt noch keine abgeschlossene Saisonabrechnung vor.</p>`;
 const accounts=v130SeasonAccounts(career,club.id,season),rows=accounts.categories;
 const income=[['Jahresgrundbetrag','base'],['Sponsorfixum','sponsorFixed'],['Sponsorboni','sponsorBonus'],['Ligaprämien','league'],['Nationale Pokalprämien','cup'],['Europacupprämien','europe'],['Match-Credits','match'],['Transfereinnahmen','sales'],['Weitere Einnahmen','otherIncome']];
 const expense=[['Angefallene Gehälter','salaries'],['Transferausgaben','purchases'],['Jugendförderung','youthBudget'],['Jugendspielerübernahmen','youthPromotion'],['Weitere Ausgaben','otherExpense']];
 return`<div class="v130-annual"><h3>Jahresabrechnung · Saison ${season}</h3><p class="v130-club-name">${escapeHTML(club.name)}</p>${v130AccountRow('Kontostand zu Saisonbeginn',accounts.opening)}<details><summary><span>Alle Einnahmen</span><b>+${v66Credits(accounts.income)}</b></summary>${income.filter(([,key])=>!key.startsWith('other')||rows[key]).map(([label,key])=>v130AccountRow(label,rows[key],'+')).join('')}</details><details><summary><span>Alle Ausgaben</span><b>−${v66Credits(accounts.expense)}</b></summary>${expense.filter(([,key])=>!key.startsWith('other')||rows[key]).map(([label,key])=>v130AccountRow(label,rows[key],'−')).join('')}</details>${v130AccountRow('Jahresbilanz',accounts.net,accounts.net>0?'+':'')}<p class="v130-paid">${accounts.salaryPaid?'Gehälter der abgelaufenen Saison vollständig bezahlt.':'Für diese Saison liegt keine Gehaltsbuchung vor.'} <strong>${v66Credits(rows.salaries)}</strong></p><div class="v130-account-row v130-total"><span>Übertrag aus der abgelaufenen Saison</span><b>${v66Credits(accounts.closing)}</b></div></div>`;
}
function v130FundingOptions(limit){
 return[{amount:0,label:'Förderpause',detail:'Keine zusätzliche Investition in die Jugendarbeit.'},{amount:200,label:'Basisförderung',detail:'Regelmäßige Förderung des vereinseigenen Nachwuchses.'},{amount:400,label:'Intensive Förderung',detail:'Mehrjährige Förderung verbessert die Talentchancen. Starke Spieler sind nicht garantiert.'}].map(item=>({...item,available:item.amount<=limit}));
}
function v124BudgetHTML(career){
 if(!v124Payments(career)||career.world.market.phase!=='budget')return'';
 const club=v66Own(career),limit=v67BudgetLimit(club),due=v66SalaryDue(career,club.id),amount=limit>=200?200:0,options=v130FundingOptions(limit),sponsor=club.sponsors.find(item=>item.id===club.sponsorId);
 const current=club.ledger.filter(row=>row.season===career.world.season),base=current.filter(row=>row.id.endsWith(':base')).reduce((sum,row)=>sum+row.amount,0),fixed=current.filter(row=>row.id.endsWith(':fixed')).reduce((sum,row)=>sum+row.amount,0),other=current.filter(row=>!row.id.endsWith(':base')&&!row.id.endsWith(':fixed')).reduce((sum,row)=>sum+row.amount,0);
 const carry=club.balance-current.reduce((sum,row)=>sum+row.amount,0);
 return`<section class="v62-season v67-transition v130-finance-close" id="v124-budget"><p class="eyebrow">Saisonwechsel · Saison ${career.world.season}</p><h2>Finanzabschluss</h2>${v130AnnualAccountsHTML(career,club)}<div class="v130-new-season"><h3>Neue Saison · Saison ${career.world.season}</h3>${v130AccountRow(career.world.season===1?'Startkapital':'Übertrag',carry)}${v130AccountRow('Grundbetrag bereits eingegangen',base,'+')}${v130AccountRow('Sponsorfixum bereits eingegangen',fixed,'+')}<p><span>Gewählter Sponsor</span> <strong translate="no">${escapeHTML(sponsor.name)}</strong></p>${other?v130AccountRow('Weitere Buchungen der neuen Saison',other,other>0?'+':''):''}${v130AccountRow('Aktueller Kontostand',club.balance)}<h3>Jugendförderung wählen</h3><label class="v130-funding-label" for="v67-budget">Förderstufe<select id="v67-budget">${options.map(item=>`<option value="${item.amount}" ${item.amount===amount?'selected':''} ${item.available?'':'disabled'}>${item.label} · ${v66Credits(item.amount)}${item.available?'':' · Nicht finanzierbar'}</option>`).join('')}</select></label><p id="v130-funding-detail">${escapeHTML(options.find(item=>item.amount===amount).detail)}</p><p>Die Jugendförderung wird jetzt vollständig bezahlt. Ausbildungsentschädigungen und spätere Profigehälter werden separat bezahlt.</p><div class="v130-account-row v130-total"><span>Kontostand zum Transferstart</span><output id="v130-transfer-balance" aria-live="polite">${v66Credits(club.balance-amount)}</output></div><h3>Projizierte Gehaltskosten</h3>${v130AccountRow('Vereinbarte Gehälter der neuen Saison',due)}<p>Diese Gehälter werden erst am Ende der neuen Saison bezahlt. Neue Verträge und Transfers verändern den Betrag.</p><div class="v130-account-row v130-total"><span>Rest nach vereinbarten Gehältern</span><output id="v130-after-salary" class="${club.balance-amount-due<0?'v130-negative':''}" aria-live="polite">${v66Credits(club.balance-amount-due)}</output></div><p>Weitere Einnahmen, Sichtungen und Transfers der neuen Saison sind noch nicht enthalten. Mögliche Sponsorboni sind noch nicht verdient.</p><button type="button" class="primary" data-v124-budget>Jugendförderung bezahlen und Transfers öffnen</button><p id="v67-transition-error" class="v61-error" role="alert"></p></div></section>`;
}
v61WorldScreen.addEventListener('change',event=>{
 if(event.target.id!=='v67-budget'||!event.target.closest('#v124-budget'))return;
 const career=v61CurrentCareer,club=v66Own(career),amount=Number(event.target.value),section=event.target.closest('#v124-budget'),rest=club.balance-amount-v66SalaryDue(career,club.id);
 section.querySelector('#v130-transfer-balance').textContent=v66Credits(club.balance-amount);
 const output=section.querySelector('#v130-after-salary');output.textContent=v66Credits(rest);output.classList.toggle('v130-negative',rest<0);
 section.querySelector('#v130-funding-detail').textContent=v130FundingOptions(v67BudgetLimit(club)).find(item=>item.amount===amount).detail;
});
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
v61RenderCareer=function(career){
 v124BaseRenderCareer(career);
 if(!career.world.activeMatch){
  const overview=v61WorldScreen.querySelector('[data-v46-view="overview"]'),budget=v124BudgetHTML(career);
  overview?.insertAdjacentHTML('afterbegin',budget);overview?.classList.toggle('v130-showing-close',Boolean(budget));
 }
 v58Refresh();
};
const v124BaseProgressState=v58State;
v58State=function(){
 const career=v61CurrentCareer;
 if(career&&!v61WorldScreen.hidden&&!career.world.activeMatch&&v124Payments(career)){
  if(career.world.market.phase==='budget')return{context:`Saison ${career.world.season}`,label:'Finanzabschluss und Jugendförderung',action:'v124-budget'};
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
