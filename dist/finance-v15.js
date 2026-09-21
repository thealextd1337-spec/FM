'use strict';

function annualSalary(player){
 if(Number.isFinite(player.salary))return player.salary;const keys=player.keeper?['gk','pas','pos','sta']:['tec','pas','fin','tak','pos','spd','sta'],quality=keys.reduce((sum,key)=>sum+(player[key]||50),0)/keys.length,prime=player.age>=24&&player.age<=30?15:player.age<=21?-10:0;player.salary=clamp(Math.round((92+quality*1.65+prime+(player.keeper?10:0))/10)*10,150,290);return player.salary
}
function payroll(save=activeSave){return[save.keeper,...save.squad].reduce((sum,player)=>sum+annualSalary(player),0)}
function sponsorOffers(season){return[
 {id:'safe',name:'AlpenMobil',kind:'Sicherer Sponsor',timing:'start',amount:900,copy:'900 Credits sofort. Keine sportliche Bedingung.'},
 {id:'success',name:'Voltwerk',kind:'Erfolgssponsor',timing:'end',base:500,success:1150,copy:'1.150 Credits bei Platz 1–3, sonst 500. Auszahlung am Saisonende.'},
 {id:'attack',name:'Bergquell',kind:'Offensivsponsor',timing:'end',base:650,success:1050,copy:'1.050 Credits ab 12 Ligatoren, sonst 650. Auszahlung am Saisonende.'}
].map(offer=>({...offer,season}))}
function freshSponsor(season){return{season,offers:sponsorOffers(season),selectedId:null,paid:false,paidAmount:0}}
function ensureFinance(save){
 for(const player of[save.keeper,...save.squad])annualSalary(player);
 if(!save.finance)save.finance={balance:650,ledger:[{key:'start',season:1,label:'Startkapital',type:'start',amount:650,balance:650}],sponsor:freshSponsor(save.seasonNumber||1),resultCredits:{},payrollSeasons:[],gameOver:false};
 save.finance.ledger=save.finance.ledger||[];save.finance.resultCredits=save.finance.resultCredits||{};save.finance.payrollSeasons=save.finance.payrollSeasons||[];
 if(!save.finance.sponsor||save.finance.sponsor.season!==save.seasonNumber)save.finance.sponsor=freshSponsor(save.seasonNumber);return save.finance
}
function bookCredit(key,label,amount,type){
 const finance=ensureFinance(activeSave);if(finance.ledger.some(entry=>entry.key===key))return false;finance.balance+=amount;finance.ledger.push({key,season:activeSave.seasonNumber,round:activeSave.currentRound,label,type,amount,balance:finance.balance});return true
}
function selectedSponsor(){const finance=ensureFinance(activeSave);return finance.sponsor.offers.find(offer=>offer.id===finance.sponsor.selectedId)}
function selectSponsor(id){
 const finance=ensureFinance(activeSave),contract=finance.sponsor.offers.find(offer=>offer.id===id);if(!contract||finance.sponsor.selectedId)return;finance.sponsor.selectedId=id;
 if(contract.timing==='start'){bookCredit(`sponsor-${activeSave.seasonNumber}`,`${contract.name} · Jahreszahlung`,contract.amount,'sponsor');finance.sponsor.paid=true;finance.sponsor.paidAmount=contract.amount}
 saveCurrent();renderCenter()
}
function settleSponsor(){
 const finance=ensureFinance(activeSave),contract=selectedSponsor();if(!contract||finance.sponsor.paid)return finance.sponsor.paidAmount||0;
 const user=activeSave.table.find(team=>team.id==='user'),success=contract.id==='success'?standings().findIndex(team=>team.id==='user')<3:contract.id==='attack'?user.gf>=12:true,amount=success?contract.success:contract.base;
 bookCredit(`sponsor-${activeSave.seasonNumber}`,`${contract.name} · Jahreszahlung`,amount,'sponsor');finance.sponsor.paid=true;finance.sponsor.paidAmount=amount;finance.sponsor.success=success;return amount
}
function settleAnnualPayroll(){
 const finance=ensureFinance(activeSave),season=activeSave.seasonNumber;if(finance.payrollSeasons.includes(season))return;settleSponsor();const due=payroll();bookCredit(`salary-${season}`,'Jahresgehälter',-due,'salary');finance.payrollSeasons.push(season);finance.gameOver=finance.balance<0;finance.shortfall=Math.max(0,-finance.balance);finance.closingBalance=finance.balance;
 const snapshot=(activeSave.clubHistory||[]).find(item=>item.number===season);if(snapshot)snapshot.finance={resultCredits:finance.resultCredits[season]||0,sponsorCredits:finance.sponsor.paidAmount||0,salaries:due,closingBalance:finance.balance,gameOver:finance.gameOver}
}
function recordResultCredits(){
 const finance=ensureFinance(activeSave),season=activeSave.seasonNumber,round=activeSave.currentRound,key=`result-${season}-${round}`;if(finance.ledger.some(entry=>entry.key===key))return;const[h,a]=match.score,amount=h>a?150:h===a?60:0,label=h>a?'Siegprämie':h===a?'Prämie für Unentschieden':'Keine Ergebnisprämie';if(amount)bookCredit(key,label,amount,'result');else finance.ledger.push({key,season,round,label,type:'result',amount:0,balance:finance.balance});finance.resultCredits[season]=(finance.resultCredits[season]||0)+amount
}
function sponsorChoiceHTML(){
 const sponsor=ensureFinance(activeSave).sponsor;if(sponsor.selectedId)return'';
 return`<section class="panel sponsor-choice"><p class="eyebrow">SAISON ${activeSave.seasonNumber} · SPONSORWAHL</p><h2>Wähle deinen Hauptsponsor.</h2><p class="help">Der Vertrag gilt für eine Saison und kann danach nicht mehr gewechselt werden.</p><div class="sponsor-offers">${sponsor.offers.map(offer=>{const fixed=offer.amount??offer.base??0,variable=Math.max(0,(offer.success??fixed)-fixed),condition=offer.id==='success'?'bei Platz 1–3':offer.id==='attack'?'ab 12 Ligatoren':'keine Bedingung';return`<button data-sponsor="${offer.id}"><span>${escapeHTML(offer.kind)}</span><b>${escapeHTML(offer.name)}</b><div class="sponsor-terms"><small>Fixum<strong>${fixed} Credits</strong></small><small>Variabel<strong>${variable?`+${variable} Credits`:'0 Credits'}</strong><em>${condition}</em></small></div><p>${escapeHTML(offer.copy)}</p></button>`}).join('')}</div></section>`
}
function financePanelHTML(){
 const finance=ensureFinance(activeSave),due=payroll(),after=finance.balance-due,contract=selectedSponsor(),entries=finance.ledger.slice(-5).reverse();
 const sponsorHelp=contract&&!finance.sponsor.paid?' und die Sponsorzahlung':'';
 return`<section class="panel finance-panel"><div class="section-heading"><h2>Finanzen</h2><strong>${finance.balance} Credits</strong></div><div class="finance-cards"><span>Aktuelles Budget<b>${finance.balance}</b></span><span>Jahresgehälter<b>−${due}</b></span><span class="${after<0?'finance-danger':''}">Nach Gehältern heute<b>${after}</b></span><span>Hauptsponsor<b>${contract?escapeHTML(contract.name):'offen'}</b></span></div><p class="finance-warning ${after<0?'show':''}">${after<0?`Es fehlen derzeit ${Math.abs(after)} Credits für die Gehälter. Siege, Unentschieden${sponsorHelp} können die Lücke schließen.`:'Die aktuellen Gehälter können bezahlt werden. Transfers müssen später aus diesem Rest finanziert werden.'}</p><details><summary><b>Letzte Buchungen</b></summary><div class="ledger">${entries.map(entry=>`<div><span>${escapeHTML(entry.label)}</span><b class="${entry.amount<0?'out':''}">${entry.amount>0?'+':''}${entry.amount}</b></div>`).join('')}</div></details></section>`
}
function renderGameOver(){
 const finance=ensureFinance(activeSave),snapshot=(activeSave.clubHistory||[]).slice(-1)[0];clubCenter.innerHTML=`<section class="intro"><div>${crestHTML(activeSave.club,currentKits())}<p class="eyebrow">ZAHLUNGSUNFÄHIG</p><h1>Game Over.</h1></div></section><section class="panel game-over"><p class="eyebrow">SAISON ${activeSave.seasonNumber} · FINANZABSCHLUSS</p><h2>${escapeHTML(activeSave.club)} kann die Gehälter nicht bezahlen.</h2><div class="gameover-balance"><span>Kontostand<b>${finance.balance} Credits</b></span><span>Fehlbetrag<b>${finance.shortfall} Credits</b></span><span>Platzierung<b>${snapshot?`Platz ${snapshot.rank}`:'–'}</b></span><span>Spielzeiten<b>${(activeSave.clubHistory||[]).length}</b></span></div><p>Der Spielstand ist beendet. Es gibt keine Kredite, Rettungszahlungen oder automatischen Spielerverkäufe.</p><button id="gameover-start" class="primary">Neues Spiel <span>↗</span></button><button id="gameover-menu" class="menu-action wide">Zum Startscreen</button></section><footer><span>SECHSER / PROTOTYP 15</span><span>Finanzen entscheiden.</span></footer>`;
 clubCenter.querySelector('#gameover-start').onclick=()=>{activeSave=null;clubCenter.hidden=true;startScreen.hidden=false;drawSlots();$('#club-form').hidden=false;$('#club-name').focus()};clubCenter.querySelector('#gameover-menu').onclick=showStartScreen
}
function decorateFinances(){
 if(!activeSave)return;const finance=ensureFinance(activeSave);if(finance.gameOver){renderGameOver();return}const intro=clubCenter.querySelector('.intro');if(!intro)return;intro.insertAdjacentHTML('afterend',`${sponsorChoiceHTML()}${financePanelHTML()}`);const lineupButton=clubCenter.querySelector('#to-lineup');if(lineupButton&&!finance.sponsor.selectedId){lineupButton.disabled=true;if(lineupButton.firstChild)lineupButton.firstChild.textContent='Zuerst Sponsor wählen ';else lineupButton.textContent='Zuerst Sponsor wählen'}
 clubCenter.querySelectorAll('[data-sponsor]').forEach(button=>button.onclick=()=>selectSponsor(button.dataset.sponsor));clubCenter.querySelectorAll('.squad-row').forEach((row,index)=>{const player=[activeSave.keeper,...activeSave.squad][index],copy=row.querySelector('div');if(player&&copy&&!copy.querySelector('.salary-copy'))copy.insertAdjacentHTML('beforeend',`<small class="salary-copy">${annualSalary(player)} Credits/Jahr</small>`)})
 document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 15')
}

const v14EnsureChampionship=ensureChampionship;ensureChampionship=function(raw){const slot=v14EnsureChampionship(raw);ensureFinance(slot);return slot};
const v14RenderCenter=renderCenter;renderCenter=function(){v14RenderCenter();decorateFinances()};
const v14Start=start;start=function(){if(!activeSave||!ensureFinance(activeSave).sponsor.selectedId){if(activeSave)renderCenter();return}v14Start()};$('#start').onclick=()=>start();
const v14FinishMatch=finishMatch;finishMatch=function(){if(match.finished)return;v14FinishMatch();recordResultCredits();if(activeSave.currentRound>=10)settleAnnualPayroll();saveCurrent();if(ensureFinance(activeSave).gameOver){$('#back').textContent='Finanzabschluss ansehen ↗';$('#back').onclick=showCenter}};
const v14StartNextSeason=startNextSeason;startNextSeason=function(){const finance=ensureFinance(activeSave);if(finance.gameOver||!finance.payrollSeasons.includes(activeSave.seasonNumber))return;v14StartNextSeason();ensureFinance(activeSave);saveCurrent();renderCenter()};

const v14Step=step;function finishActivePlay(){match.fulltimePending=true;match.next=Infinity;match.elapsed=74.999;if(!match.flight&&match.goalPause<=0)v14Step(.01,0)}step=function(delta,realDelta){
 if(!match||match.finished)return v14Step(delta,realDelta);
 if(match.fulltimePending){if(match.goalPause>0){match.goalPause=Math.max(0,match.goalPause-realDelta);if(match.goalPause<=0){hideOverlay();match.pendingKickoff=null}updateTeamStats();if(match.goalPause<=0&&!match.flight)v14Step(.01,0);return}if(match.flight){match.elapsed=74;v14Step(delta,realDelta);if(!match.finished)match.elapsed=74.999;if(!match.flight&&match.goalPause<=0)v14Step(.01,0);return}return v14Step(.01,0)}
 if(match.halftimeBreakDone&&match.elapsed<75&&match.elapsed+delta>=75){match.next=Infinity;const remaining=Math.max(0,74.999-match.elapsed);v14Step(remaining,realDelta);if(!match.finished)finishActivePlay();return}v14Step(delta,realDelta)
};
document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 15');
