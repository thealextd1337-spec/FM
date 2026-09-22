'use strict';

const v36YouthStyle=document.createElement('style');
v36YouthStyle.textContent='.youth-actions{display:grid;gap:8px;margin-top:12px}';
document.head.append(v36YouthStyle);

signYouth=function(id){
 if(!activeSave||activeSave.currentRound>=10||!transferState().open||!selectedSponsor())return false;
 const candidate=ensureYouth().candidates.find(item=>item.id===id),finance=ensureFinance(activeSave);
 if(!candidate||candidate.signed||activeRosterSize()>=12||finance.balance-(finance.reserved||0)<YOUTH_SIGN_COST)return false;
 if(!bookCredit(`youth-sign-${activeSave.seasonNumber}-${id}`,`Jugendverpflichtung ${candidate.player.name}`,-YOUTH_SIGN_COST,'youth-sign'))return false;
 const player=structuredClone(candidate.player);player.youthPotential=structuredClone(candidate.target);player.youthGrowth={};player.n=nextSquadNumber();
 activeSave.squad.push(player);candidate.signed=true;currentStats(player);
 addNews('Nachwuchs verpflichtet',`${player.name} kommt aus der Jugendauswahl. Einsätze entwickeln seine Fähigkeiten.`,'success',`youth-news-${activeSave.seasonNumber}-${id}`);
 normalizeLineup();syncLineupFromSquad();saveCurrent();renderCenter();v28ShowSigningResult(player);return true
};

youthCandidateHTML=function(candidate){
 const player=candidate.player,finance=ensureFinance(activeSave),available=finance.balance-(finance.reserved||0);
 const details=candidate.scouted?`<p>Aktuell: ${scoutingTextHTML(player)}</p><p>Potenzial: ${youthPotentialHTML(candidate)} · Gehalt: ${annualSalary(player)} Credits/Jahr</p>`:'<p>Fähigkeiten und Potenzial sind noch unbekannt.</p>';
 const action=candidate.signed?'<span class="youth-signed">Verpflichtet</span>':`<div class="youth-actions">${candidate.scouted?'':`<button class="menu-action wide" data-youth-scout="${candidate.id}" ${available<YOUTH_SCOUT_COST?'disabled':''}>Für ${YOUTH_SCOUT_COST} Credits scouten</button>`}<button class="menu-action wide" data-youth-sign="${candidate.id}" ${!selectedSponsor()||activeRosterSize()>=12||available<YOUTH_SIGN_COST?'disabled':''}>Für ${YOUTH_SIGN_COST} Credits verpflichten</button></div>`;
 return`<article class="youth-card"><div class="market-name">${flagSVG(player.nation)}<div><b>${escapeHTML(player.name)}</b><span>${transferPosition(player)} · ${player.age} Jahre</span></div></div>${details}${action}</article>`
};

const v35RenderCenterV36=renderCenter;
renderCenter=function(){
 const result=v35RenderCenterV36();
 document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');return result
};
startScreen.querySelector('footer').textContent='Doppel 6 / PROTOTYP 39';
