'use strict';

const v28TransferStyle=document.createElement('style');
v28TransferStyle.textContent=`
.transfer-result-modal{width:min(580px,calc(100vw - 24px));max-height:calc(100dvh - 24px);padding:0;border:1px solid #53696b;border-radius:13px;background:#17282c;color:#edf5f0;box-shadow:0 25px 80px #000d}.transfer-result-modal::backdrop{background:#071012d9;backdrop-filter:blur(4px)}.transfer-result-card{max-height:calc(100dvh - 26px);overflow:auto;padding:22px}.transfer-result-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding-bottom:15px;border-bottom:1px solid #34494c}.transfer-result-head h2{font:700 31px/1 'Barlow Condensed',Impact,sans-serif}.transfer-result-list{display:grid;gap:9px;margin:16px 0}.transfer-result-player{display:grid;grid-template-columns:52px minmax(0,1fr);gap:11px;align-items:center;padding:13px;border:1px solid #3b5053;border-radius:9px;background:#102126}.transfer-result-player.is-in{border-color:#6f9f58;background:#172f26}.transfer-result-player.is-out{border-color:#94574f;background:#2b2021}.transfer-result-icon{grid-row:1/3;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;font-size:25px;background:#0c191b}.transfer-result-player.is-in .transfer-result-icon{background:#294b34}.transfer-result-player.is-out .transfer-result-icon{background:#492a2a}.transfer-result-name{display:flex;align-items:center;gap:8px;min-width:0}.transfer-result-name b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}.transfer-result-meta{display:block;margin-top:4px;color:#9fb1ae;font-size:10px}.transfer-result-status{grid-column:2;margin:2px 0 0;font-size:11px;font-weight:700}.transfer-result-player.is-in .transfer-result-status{color:#b9ef9c}.transfer-result-player.is-out .transfer-result-status{color:#ffada4}.transfer-result-card>.primary{margin-top:4px}.v28-market-scroll{grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-auto-rows:1fr;max-height:330px;overflow-y:auto;overscroll-behavior:contain;padding:2px 7px 7px 2px;scrollbar-color:var(--club-primary) #102126;scrollbar-width:thin}.v28-market-scroll .market-card{min-height:305px}.v28-market-scroll::-webkit-scrollbar{width:8px}.v28-market-scroll::-webkit-scrollbar-track{background:#102126;border-radius:8px}.v28-market-scroll::-webkit-scrollbar-thumb{background:var(--club-primary);border-radius:8px}
@media(max-width:760px){.v28-market-scroll{grid-template-columns:1fr!important;grid-auto-rows:auto;max-height:700px}.v28-market-scroll .market-card{min-height:215px}}
@media(max-width:600px){.transfer-result-card{padding:17px;max-height:calc(100dvh - 26px)}.transfer-result-head h2{font-size:27px}}
`;
document.head.append(v28TransferStyle);

function v28TransferResultData(state,pending){return pending.map(item=>{const bid=state.bids.find(entry=>entry.id===item.bidId),offer=state.offers.find(entry=>entry.id===item.offerId),player=offer?.player||item.player,status=bid?.status||'rejected',inTeam=status==='accepted',nation=typeof nationData!=='undefined'?(nationData[player?.nation]?.name||player?.nation||'Unbekannt'):(player?.nation||'Unbekannt');return{bidId:item.bidId,name:player?.name||bid?.playerName||'Unbekannter Spieler',age:player?.age||'–',nationCode:player?.nation||'',nation,status,inTeam,counterAmount:bid?.counterAmount||0}})}
function v28ResultLabel(result){if(result.inTeam)return'Im Team · Transfer abgeschlossen';if(result.status==='counter')return`Noch nicht im Team · Gegenangebot ${result.counterAmount} Credits`;if(result.status==='lost')return'Nicht im Team · Spieler nicht mehr verfügbar';return'Nicht im Team · Angebot abgelehnt'}
function v28ShowTransferResults(results,day,title='Transferentscheidungen'){
 if(!results.length||document.querySelector('#transfer-result-modal'))return false;
 const phase=transferState().open?`TRANSFERTAG ${day}`:'ZWISCHEN DEN SPIELTAGEN';
 const modal=document.createElement('dialog');modal.id='transfer-result-modal';modal.className='transfer-result-modal';modal.setAttribute('aria-labelledby','transfer-result-title');modal.innerHTML=`<section class="transfer-result-card"><div class="transfer-result-head"><div><p class="eyebrow">${phase}</p><h2 id="transfer-result-title">${escapeHTML(title)}</h2></div></div><div class="transfer-result-list">${results.map(result=>`<article class="transfer-result-player ${result.inTeam?'is-in':'is-out'}"><span class="transfer-result-icon" aria-hidden="true">${result.inTeam?'👍':'👎'}</span><div class="transfer-result-name">${result.nationCode?flagSVG(result.nationCode):''}<b>${escapeHTML(result.name)}</b></div><span class="transfer-result-meta">${escapeHTML(String(result.age))} Jahre · ${escapeHTML(result.nation)}</span><p class="transfer-result-status">${escapeHTML(v28ResultLabel(result))}</p></article>`).join('')}</div><button type="button" class="primary transfer-result-ok">Bestätigen <span>↗</span></button></section>`;document.body.append(modal);
 modal.addEventListener('cancel',event=>event.preventDefault());modal.querySelector('.transfer-result-ok').onclick=()=>{const pending=typeof transferState==='function'?transferState().pendingResult:null;if(pending){transferState().pendingResult=null;saveCurrent()}modal.close();modal.remove()};modal.showModal();modal.querySelector('.transfer-result-ok').focus();return true
}
function v28QueueTransferResults(results,day,title='Transferentscheidungen'){
 if(!results.length)return false;transferState().pendingResult={results:structuredClone(results),day,title};saveCurrent();return v28ShowTransferResults(results,day,title)
}
function v28ShowSigningResult(player){
 const nation=typeof nationData!=='undefined'?(nationData[player.nation]?.name||player.nation||'Unbekannt'):(player.nation||'Unbekannt');
 return v28QueueTransferResults([{name:player.name,age:player.age,nationCode:player.nation||'',nation,status:'accepted',inTeam:true}],transferState().day||1,'Neuverpflichtung')
}
function v28ScrollableMarkets(){clubCenter.querySelectorAll('.qol-market > .market-grid').forEach(grid=>{grid.classList.add('v28-market-scroll');grid.setAttribute('role','region');grid.setAttribute('tabindex','0');grid.setAttribute('aria-label',grid.previousElementSibling?.textContent?.trim()||'Transferliste')})}

const v27AdvanceTransferDayV28=advanceTransferDay;
advanceTransferDay=function(){
 const state=transferState(),pending=state.bids.filter(bid=>bid.status==='pending'&&bid.resolveDay<=state.day+1).map(bid=>{const offer=state.offers.find(item=>item.id===bid.offerId);return{bidId:bid.id,offerId:bid.offerId,player:offer?.player?structuredClone(offer.player):{name:bid.playerName}}}),result=v27AdvanceTransferDayV28();
 if(result!==false&&pending.length)v28QueueTransferResults(v28TransferResultData(state,pending),state.day);return result
};
const v17SignFreeAgentV28=signFreeAgent;
signFreeAgent=function(id){const player=transferState().offers.find(offer=>offer.id===id)?.player,result=v17SignFreeAgentV28(id);if(result&&player)v28ShowSigningResult(player);return result};
const v17AcceptCounterV28=acceptCounter;
acceptCounter=function(id){const bid=transferState().bids.find(item=>item.id===id),player=transferState().offers.find(offer=>offer.id===bid?.offerId)?.player,result=v17AcceptCounterV28(id);if(result&&player)v28ShowSigningResult(player);return result};

const v27RenderCenterV28=renderCenter;
renderCenter=function(){const result=v27RenderCenterV28();v28ScrollableMarkets();const pending=activeSave&&transferState().pendingResult;if(pending)v28ShowTransferResults(pending.results,pending.day,pending.title);document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');return result};

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
