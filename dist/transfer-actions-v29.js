'use strict';

const v29TransferStyle=document.createElement('style');
v29TransferStyle.textContent=`
.center-lead .v29-deadline{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;margin-top:10px;padding:12px 15px;border:2px solid #df6b62;border-radius:9px;background:transparent;color:#ffaaa2;font-weight:800}.center-lead .v29-deadline:hover:not(:disabled){background:#df6b6218;color:#ffc0ba}.center-lead .v29-deadline:disabled{border-color:#704946;color:#9b7470;opacity:.62}.qol-market .market-day-actions:empty{display:none}.center-grid.v29-single,.v13-grid.v29-single{grid-template-columns:1fr}
`;
document.head.append(v29TransferStyle);

function v29SimplifyDashboard(){
 clubCenter.querySelector('.league-table')?.closest('.panel')?.remove();clubCenter.querySelector('.scorer-table')?.closest('.panel')?.remove();clubCenter.querySelector('.fixtures')?.closest('.panel')?.remove();const centerGrid=clubCenter.querySelector('.center-grid'),seasonGrid=clubCenter.querySelector('.v13-grid');if(centerGrid)centerGrid.classList.add('v29-single');if(seasonGrid)seasonGrid.classList.add('v29-single')
}
function v29ResolveFinalBids(){
 const state=transferState(),pending=state.bids.filter(bid=>bid.status==='pending'&&bid.resolveDay<=state.day+1).map(bid=>{const offer=state.offers.find(item=>item.id===bid.offerId);return{bidId:bid.id,offerId:bid.offerId,player:offer?.player?structuredClone(offer.player):{name:bid.playerName}}});if(!pending.length)return false;
 v17Busy=true;for(const item of pending){const bid=state.bids.find(entry=>entry.id===item.bidId);if(bid)resolveBid(bid)}recalculateReserved();state.notice='Die letzten Angebote wurden entschieden. Bestätige nun deinen Kader und den Transferschluss.';saveCurrent();v17Busy=false;renderCenter();v28ShowTransferResults(v28TransferResultData(state,pending),state.day);return true
}
function v29TransferActions(){
 if(!activeSave||activeSave.finance?.gameOver||activeSave.seasonNumber<2)return;const state=transferState();if(!state?.open)return;
 const lead=clubCenter.querySelector('.center-lead'),action=lead?.querySelector('#to-lineup'),deadline=clubCenter.querySelector('#deadline-button'),oldNext=clubCenter.querySelector('#next-market-day');oldNext?.remove();clubCenter.querySelector('.market-day-actions:empty')?.remove();if(!lead||!action)return;
 if(selectedSponsor()){
  const finalDay=state.day>=state.maxDays,pending=state.bids.some(bid=>bid.status==='pending');action.disabled=finalDay&&!pending;action.innerHTML=finalDay?(pending?'Letzte Angebote entscheiden <span>→</span>':'Transferphase bereit zum Abschluss'): `Nächster Transfertag <span>→</span>`;action.setAttribute('aria-label',finalDay?'Letzte Transferangebote entscheiden':`Transfertag ${state.day+1} beginnen`);action.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();if(action.disabled)return;action.disabled=true;if(finalDay)v29ResolveFinalBids();else advanceTransferDay()},true)
 }
 if(deadline){deadline.classList.remove('primary');deadline.classList.add('v29-deadline');deadline.textContent='Kader bestätigen & Transferschluss';lead.append(deadline)}
}

const v28RenderCenterV29=renderCenter;
renderCenter=function(){const result=v28RenderCenterV29();v29SimplifyDashboard();v29TransferActions();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 29');return result};

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 29');
