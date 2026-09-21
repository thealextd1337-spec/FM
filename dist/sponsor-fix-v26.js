'use strict';

const v26SponsorTerms={
 safe:{name:'AlpenMobil',kind:'Sicherer Sponsor',fixed:900,bonus:0,copy:'900 Credits sofort. Keine sportliche Bedingung.'},
 success:{name:'Voltwerk',kind:'Erfolgssponsor',fixed:500,bonus:650,copy:'500 Credits sofort. +650 Credits bei Platz 1–3 am Saisonende.'},
 attack:{name:'Bergquell',kind:'Offensivsponsor',fixed:650,bonus:400,copy:'650 Credits sofort. +400 Credits ab 12 Ligatoren am Saisonende.'}
};

function v26NormalizeSponsor(finance){
 const sponsor=finance.sponsor;if(!sponsor)return null;sponsor.paidAmount=Number(sponsor.paidAmount)||0;
 sponsor.offers=(sponsor.offers||[]).map(offer=>{const terms=v26SponsorTerms[offer.id];return terms?{...offer,name:terms.name,kind:terms.kind,timing:terms.bonus?'split':'start',amount:terms.fixed,base:terms.fixed,success:terms.fixed+terms.bonus,copy:terms.copy}:offer});
 const legacy=finance.ledger.some(entry=>entry.key===`sponsor-${sponsor.season}`),fixedEntry=finance.ledger.some(entry=>entry.key===`sponsor-fixed-${sponsor.season}`),bonusEntry=finance.ledger.some(entry=>entry.key===`sponsor-bonus-${sponsor.season}`);
 if(legacy){sponsor.fixedPaid=true;if(sponsor.paid)sponsor.settled=true}
 if(fixedEntry)sponsor.fixedPaid=true;if(bonusEntry){sponsor.bonusPaid=true;sponsor.settled=true;sponsor.paid=true}
 return sponsor
}
function v26SponsorContract(finance){const sponsor=v26NormalizeSponsor(finance);return sponsor?.offers.find(offer=>offer.id===sponsor.selectedId)||null}
function v26BookSponsor(finance,key,label,amount){if(!amount||finance.ledger.some(entry=>entry.key===key))return false;finance.balance+=amount;finance.ledger.push({key,season:activeSave.seasonNumber,round:activeSave.currentRound,label,type:'sponsor',amount,balance:finance.balance});return true}
function v26PaySponsorFixed(){
 if(!activeSave)return 0;const finance=ensureFinance(activeSave),sponsor=v26NormalizeSponsor(finance),contract=v26SponsorContract(finance);if(!sponsor||!contract||sponsor.fixedPaid)return 0;
 const fixed=v26SponsorTerms[contract.id]?.fixed??contract.amount??contract.base??0;if(v26BookSponsor(finance,`sponsor-fixed-${activeSave.seasonNumber}`,`${contract.name} · Fixum`,fixed))sponsor.paidAmount+=fixed;
 sponsor.fixedPaid=true;if(!(v26SponsorTerms[contract.id]?.bonus)){sponsor.paid=true;sponsor.settled=true;sponsor.success=true}return fixed
}

selectSponsor=function(id){
 const finance=ensureFinance(activeSave),sponsor=v26NormalizeSponsor(finance),contract=sponsor?.offers.find(offer=>offer.id===id);if(!contract||sponsor.selectedId)return false;sponsor.selectedId=id;v26PaySponsorFixed();
 if(typeof addNews==='function')addNews('Sponsor gewählt',`${contract.name} begleitet den Verein in Saison ${activeSave.seasonNumber}. Das Fixum wurde gutgeschrieben.`,'success',`sponsor-news-${activeSave.seasonNumber}`);saveCurrent();renderCenter();return true
};

settleSponsor=function(){
 const finance=ensureFinance(activeSave),sponsor=v26NormalizeSponsor(finance),contract=v26SponsorContract(finance);if(!contract)return 0;v26PaySponsorFixed();if(sponsor.settled)return sponsor.paidAmount||0;
 const user=activeSave.table.find(team=>team.id==='user'),success=contract.id==='success'?standings().findIndex(team=>team.id==='user')<3:contract.id==='attack'?user.gf>=12:true,bonus=success?(v26SponsorTerms[contract.id]?.bonus||0):0;
 if(v26BookSponsor(finance,`sponsor-bonus-${activeSave.seasonNumber}`,`${contract.name} · Erfolgsbonus`,bonus))sponsor.paidAmount+=bonus;sponsor.bonusPaid=bonus>0;sponsor.success=success;sponsor.paid=true;sponsor.settled=true;return sponsor.paidAmount
};

const v25RenderCenterV26=renderCenter;
renderCenter=function(){if(activeSave&&!activeSave.finance?.gameOver)v26PaySponsorFixed();const result=v25RenderCenterV26();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 26');return result};

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 26');
