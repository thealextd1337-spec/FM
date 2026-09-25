'use strict';

let v72Filter={country:'all',line:'all',maxPrice:'',willingness:'all'};
const v72WillingnessText={open:'Offen',unsure:'Unsicher',no:'Wird nicht wechseln'};
const v72WillingnessIcon={open:'✓',unsure:'?',no:'×'};
function v72WillingnessHTML(value){return`<span class="v72-willingness v72-${value}" role="img" aria-label="Wechselbereitschaft: ${v72WillingnessText[value]}" title="${v72WillingnessText[value]}">${v72WillingnessIcon[value]}</span>`}
function v72ListedPlayers(career){
 return v72Market(career).saleListings.filter(item=>item.status==='active'&&item.sellerId!==career.manager.managedClubId).map(listing=>({listing,club:v66Club(career,listing.sellerId),player:v66Player(career,listing.pid)})).filter(item=>item.club&&item.player&&item.club.roster.some(player=>player.pid===item.player.pid)).filter(item=>v72Filter.country==='all'||item.club.countryId===v72Filter.country).filter(item=>v72Filter.line==='all'||item.player.line===v72Filter.line).filter(item=>!v72Filter.maxPrice||item.listing.ask<=Number(v72Filter.maxPrice)).filter(item=>v72Filter.willingness==='all'||v72Willingness(career,item.player.pid,career.manager.managedClubId)===v72Filter.willingness).sort((a,b)=>a.listing.ask-b.listing.ask||a.player.name.localeCompare(b.player.name,'de'));
}
function v72ListingsHTML(career){
 const market=v72Market(career),all=market.saleListings.filter(item=>item.status==='active'&&item.sellerId!==career.manager.managedClubId),entries=v72ListedPlayers(career),open=market.phase==='open';
 return`<section class="v72-sale-list" id="v72-sale-list"><div class="section-heading"><div><h3>Von Vereinen angeboten</h3><p>${all.length} Spieler stehen zum Verkauf. Die angezeigte Ablöse ist verhandelbar.</p></div><span>${entries.length} angezeigt</span></div><div class="v72-filters"><label>Land<select id="v72-country"><option value="all">Alle Länder</option>${v61Countries.map(([id,name])=>`<option value="${id}" ${v72Filter.country===id?'selected':''}>${name}</option>`).join('')}</select></label><label>Position<select id="v72-line"><option value="all">Alle Positionen</option>${Object.entries(v61PositionNames).map(([id,name])=>`<option value="${id}" ${v72Filter.line===id?'selected':''}>${name}</option>`).join('')}</select></label><label>Verhandelbare Ablöse bis<input id="v72-max-price" type="number" min="0" step="10" value="${escapeHTML(String(v72Filter.maxPrice))}" placeholder="Alle"></label><label>Wechselbereitschaft<select id="v72-willingness"><option value="all">Alle</option>${Object.entries(v72WillingnessText).map(([key,label])=>`<option value="${key}" ${v72Filter.willingness===key?'selected':''}>${label}</option>`).join('')}</select></label></div><div class="v72-sale-grid">${entries.map(({listing,club,player})=>{const willingness=v72Willingness(career,player.pid,career.manager.managedClubId),blocked=market.decisions.some(item=>item.pid===player.pid&&item.buyerId===career.manager.managedClubId&&item.season===career.world.season&&['rejected','expired'].includes(item.status));return`<article class="v72-sale-card"><div class="v72-sale-top">${v61FlagSVG(player.nation)}<div><button type="button" data-v66-profile="${escapeHTML(player.pid)}">${escapeHTML(player.name)}</button><small>${escapeHTML(club.name)} · ${v61PositionNames[player.line]} · ${player.age} Jahre</small></div>${v72WillingnessHTML(willingness)}</div><div class="v72-sale-prices"><span>Verhandelbare Ablöse<b>${v66Credits(listing.ask)}</b></span><span>Marktwert<b>${v66Credits(v66Value(player))}</b></span></div><button type="button" class="menu-action" data-v72-open="${escapeHTML(player.pid)}" ${!open||blocked?'disabled':''}>${blocked?'Erst im nächsten Fenster':'Ablöse verhandeln'}</button></article>`}).join('')||'<p class="v66-note">Für diese Filter gibt es kein aktives Verkaufsangebot.</p>'}</div></section>`;
}
function v72ProfileSaleHTML(career,pid){
 if(v66Owner(career,pid)?.id!==career.manager.managedClubId)return'';
 const market=v72Market(career),listing=market.saleListings.find(item=>item.pid===pid),player=v66Player(career,pid);
 let content='';
 if(listing?.status==='active')content=`<p>Zum Verkauf gestellt · Verhandelbare Ablöse: <strong>${v66Credits(listing.ask)}</strong></p><button type="button" class="menu-action" data-v72-go-sale>Im Transfermenü verwalten</button>`;
 else if(listing)content='<p>Das Verkaufsangebot für dieses Transferfenster ist beendet.</p>';
 else if(market.phase==='open'&&v72CanCommitSale(career,career.manager.managedClubId,pid))content=`<label>Verhandelbare Ablöse<input type="number" min="10" step="10" value="${Math.max(10,Math.round(v66Value(player)*1.12/10)*10)}" data-v72-own-ask></label><button type="button" class="menu-action" data-v72-list-own="${escapeHTML(pid)}">Zum Verkauf anbieten</button><p>Die öffentliche Forderung bleibt bis zum Ende des Transferfensters fest.</p>`;
 else if(market.phase==='open')content='<p>Für einen Verkauf müssen mindestens zehn Profis und ein Torwart im Kader bleiben.</p>';
 else content='<p>Verkaufsangebote sind im Transferfenster möglich.</p>';
 return`<section class="v72-profile-sale" data-v72-profile-sale="${escapeHTML(pid)}"><h3>Verkaufsangebot</h3>${content}<p class="v72-dialog-error" role="alert"></p></section>`;
}
function v72DecorateOwnProfile(career,pid){
 v61ProfileDialog.querySelector('.v72-profile-sale')?.remove();
 v61ProfileDialog.querySelector('.v72-profile-offer')?.remove();
 const target=v61ProfileDialog.querySelector('[data-v74-profile-panel="overview"]')||v61ProfileDialog;
 const html=v72ProfileSaleHTML(career,pid);if(html)target.insertAdjacentHTML('beforeend',html);
 const owner=v66Owner(career,pid),player=v66Player(career,pid);
 if(player&&owner?.id!==career.manager.managedClubId){
  const available=career.world.market.phase==='open'||!owner&&career.world.market.phase==='closed'&&!career.world.seasonFinished;
  target.insertAdjacentHTML('beforeend',`<section class="v72-profile-offer"><h3>Transfer</h3><button type="button" class="menu-action" data-v72-profile-offer="${escapeHTML(pid)}" ${available?'':'disabled'}>Angebot für ${escapeHTML(player.name)} abgeben</button>${available?'':'<p>Ein Angebot ist erst im nächsten Transferfenster möglich.</p>'}</section>`);
 }
}
function v72OwnPriceControlHTML(career,listing){
 const market=v72Market(career),can=market.phase==='open'&&listing.ask>10&&['active','withdrawn'].includes(listing.status)&&!market.negotiations.some(item=>item.pid===listing.pid)&&!market.pendingBids.some(item=>item.pid===listing.pid);
 if(!can)return'';
 const newAsk=Math.max(10,Math.round(listing.ask*.8/10)*10);
 return`<div class="v72-own-reprice"><label>Neue Forderung<input type="number" min="10" max="${listing.ask-1}" step="10" value="${Math.max(10,Math.min(newAsk,listing.ask-10))}" data-v72-new-ask="${escapeHTML(listing.pid)}"></label><button type="button" class="menu-action" data-v72-lower-ask="${escapeHTML(listing.pid)}">${listing.status==='withdrawn'?'Günstiger erneut anbieten':'Forderung senken'}</button></div>`;
}
function v72OwnListingsHTML(career){
 const market=v72Market(career),own=career.manager.managedClubId,listings=market.saleListings.filter(item=>item.sellerId===own&&['active','withdrawn'].includes(item.status)&&v66Owner(career,item.pid)?.id===own);
 if(!listings.length)return`<section class="v72-own-sales" id="v72-own-sales"><h3>Eigene Verkaufsangebote</h3><p>Öffne das Profil eines eigenen Spielers, um ihn zum Verkauf anzubieten.</p></section>`;
 const stages={'seller-offer':'Antwort auf Kaufangebot offen','seller-counter-wait':'Antwort des Käufers ausstehend','contract-wait':'Spielervertrag ausstehend',ready:'Entscheidung beim Tageswechsel'};
 const cards=listings.map(listing=>{
  const player=v66Player(career,listing.pid),offers=market.negotiations.filter(item=>item.pid===listing.pid&&!['rejected','completed'].includes(item.stage)),agreed=offers.some(item=>['contract-wait','ready'].includes(item.stage)),status=listing.status==='active'?'Zum Verkauf':listing.status==='withdrawn'?'Zurückgezogen':'Transferfenster beendet';
  const offerRows=offers.map(item=>`<div class="v72-own-offer"><span><strong>${escapeHTML(v66Club(career,item.buyerId)?.name||'Verein')}</strong><small>${stages[item.stage]||item.stage} · Aktuelles Gebot ${v66Credits(item.agreedPrice??item.price)}</small></span><div class="v72-own-actions">${item.stage==='seller-offer'?`<button type="button" class="v72-quick-accept" data-v72-quick-seller="${escapeHTML(item.id)}" data-v72-response="accept" title="Gebot annehmen" aria-label="Gebot von ${escapeHTML(v66Club(career,item.buyerId)?.name||'Verein')} annehmen">✓</button><button type="button" class="v72-quick-reject" data-v72-quick-seller="${escapeHTML(item.id)}" data-v72-response="reject" title="Gebot ablehnen" aria-label="Gebot von ${escapeHTML(v66Club(career,item.buyerId)?.name||'Verein')} ablehnen">×</button>`:''}<button type="button" data-v72-seller-deal="${escapeHTML(item.id)}">Verhandlung öffnen</button></div></div>`).join('');
  return`<article class="v72-own-card"><div><button type="button" class="v72-own-name" data-v61-player="${escapeHTML(listing.pid)}">${escapeHTML(player?.name||listing.pid)}</button><small>${status} · Verhandelbare Ablöse ${v66Credits(listing.ask)} · Marktwert ${player?v66Credits(v66Value(player)):'–'}</small></div>${listing.status==='active'&&!agreed?`<button type="button" class="menu-action" data-v72-withdraw="${escapeHTML(listing.pid)}">Angebot zurückziehen</button>`:''}${v72OwnPriceControlHTML(career,listing)}${offerRows}</article>`;
 }).join('');
 return`<section class="v72-own-sales" id="v72-own-sales"><h3>Eigene Verkaufsangebote</h3><p>Ohne Kaufangebot kannst du die öffentliche Forderung während des Transferfensters senken. Gebote und Gegenforderungen gelten nur für den jeweiligen Käufer.</p>${cards}<p id="v72-own-message" class="v61-error" role="alert"></p></section>`;
}function v72NegotiationsHTML(career){
 const own=career.manager.managedClubId,items=v72Market(career).negotiations.filter(item=>item.buyerId===own&&!['completed','rejected'].includes(item.stage));
 if(!items.length)return'';
 const label={"refusal-wait":'Entscheidung beim Tageswechsel',"fee-wait":'Vereinsantwort ausstehend',"fee-counter":'Gegenforderung des Vereins',contract:'Spielervertrag anbieten',"contract-wait":'Spielerantwort ausstehend',"contract-counter":'Gegenforderung des Spielers',ready:'Entscheidung beim Tageswechsel'};
 return`<section class="v72-open-deals"><h3>Laufende Verhandlungen</h3>${items.map(item=>`<div><span><button type="button" class="v72-player-name" data-v68-player="${escapeHTML(item.pid)}">${escapeHTML(v66Player(career,item.pid)?.name||item.pid)}</button><small>${label[item.stage]||item.stage} · ${escapeHTML(v66Club(career,item.sellerId)?.name||'Verein')}</small></span><button type="button" data-v72-deal="${escapeHTML(item.id)}">Dialog öffnen</button></div>`).join('')}</section>`;
}
const v72BaseOfferHTML=v66OfferHTML;
v66OfferHTML=function(career){
 const listing=v72Listing(career,v66Filter.selected);
 if(!listing)return v72BaseOfferHTML(career);
 const player=v66Player(career,listing.pid),club=v66Club(career,listing.sellerId),blocked=v72Market(career).decisions.some(item=>item.pid===listing.pid&&item.buyerId===career.manager.managedClubId&&item.season===career.world.season&&['rejected','expired'].includes(item.status));
 return`<section class="v66-offer" id="v66-offer"><h3>${escapeHTML(player.name)} steht zum Verkauf</h3><p>${escapeHTML(club.name)} · Verhandelbare Ablöse ${v66Credits(listing.ask)} · Marktwert ${v66Credits(v66Value(player))}</p><button type="button" class="menu-action" data-v72-open="${escapeHTML(player.pid)}" ${v72Market(career).phase==='open'&&!blocked?'':'disabled'}>Ablöse verhandeln</button></section>`;
};
const v72BaseMarketHTML=v66MarketHTML;
v66MarketHTML=function(career){return v72BaseMarketHTML(career).replace('<h3>Spieler suchen</h3>',`${v72OwnListingsHTML(career)}${v72NegotiationsHTML(career)}${v72ListingsHTML(career)}<h3>Spieler suchen</h3>`)};
const v72BaseProgressState=v58State;
v58State=function(){
 const career=v61CurrentCareer;
 if(career&&!v61WorldScreen.hidden&&!career.world.activeMatch&&career.world.market.phase==='deadline')return{context:'Transferschluss · laufende Verhandlungen',label:'Verhandlungen abschließen',action:'v66-day'};
 return v72BaseProgressState();
};
let v72Dialog=null,v72DialogMode=null,v72CurrentId=null,v72DialogBusy=false;
function v72EnsureDialog(){
 if(v72Dialog?.isConnected)return v72Dialog;
 v72Dialog=document.createElement('dialog');v72Dialog.id='v72-transfer-dialog';v72Dialog.className='v72-transfer-dialog';document.body.append(v72Dialog);
 v72Dialog.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button||v72DialogBusy)return;
  if(button.dataset.v72Adjust!==undefined){const input=v72Dialog.querySelector(`#${button.dataset.v72Input}`),step=Number(input?.step)||10,min=Number(input?.min)||1;if(input){input.value=String(Math.max(min,(Number(input.value)||min)+Number(button.dataset.v72Adjust)*step));input.focus()}return}
  const career=v61CurrentCareer;
  if(button.dataset.v72PlayerProfile!==undefined){v68OpenPlayerProfile(career,button.dataset.v72PlayerProfile,button);return}
  if(button.dataset.v72ClubProfile!==undefined){v72Dialog.close();v68OpenDetail('club',button.dataset.v72ClubProfile,v61WorldScreen.querySelector('[data-v61-tab="transfers"]'));return}
  v72DialogBusy=true;button.disabled=true;
  try{
   if(button.dataset.v72Close!==undefined){v72Dialog.close();return}
   if(button.dataset.v72Result!==undefined){const result=v72Market(career).transferResults.find(item=>item.id===button.dataset.v72Result);if(result)result.seen=true;await v64UiSave();v72Dialog.close();v72ShowResults();return}
   if(button.dataset.v72Start!==undefined){const item=v72Start(career,button.dataset.v72Start,v72Dialog.querySelector('#v72-fee')?.value);v72CurrentId=item.id;await v64UiSave();v61RenderCareer(career);v72RenderDeal(career,item.id);return}
   if(button.dataset.v72Fee!==undefined){v72SubmitFee(career,button.dataset.v72Fee,v72Dialog.querySelector('#v72-fee')?.value);await v64UiSave();v61RenderCareer(career);v72RenderDeal(career,button.dataset.v72Fee);return}
   if(button.dataset.v72Contract!==undefined){v72SubmitContract(career,button.dataset.v72Contract,v72Dialog.querySelector('#v72-salary')?.value,v72Dialog.querySelector('#v72-years')?.value,v72Dialog.querySelector('#v72-promise')?.value);await v64UiSave();v61RenderCareer(career);v72RenderDeal(career,button.dataset.v72Contract);return}
   if(button.dataset.v72SellerRespond!==undefined){const id=button.dataset.v72SellerRespond,response=button.dataset.v72Response;v72SellerRespond(career,id,response,v72Dialog.querySelector('#v72-seller-price')?.value);await v64UiSave();v61RenderCareer(career);v72RenderSellerDeal(career,id);return}
   if(button.dataset.v72Cancel!==undefined){v72ConfirmCancel(career,button.dataset.v72Cancel);return}
   if(button.dataset.v72CancelBack!==undefined){v72RenderDeal(career,button.dataset.v72CancelBack);return}
   if(button.dataset.v72CancelConfirm!==undefined){v72Cancel(career,button.dataset.v72CancelConfirm);await v64UiSave();v61RenderCareer(career);v72RenderDeal(career,button.dataset.v72CancelConfirm)}
  }catch(error){const target=v72Dialog.querySelector('.v72-dialog-error');if(target)target.textContent=error.message}
  finally{v72DialogBusy=false;if(button.isConnected)button.disabled=false}
 });
 v72Dialog.addEventListener('cancel',event=>{if(v72DialogMode==='result')event.preventDefault()});
 return v72Dialog;
}
function v72DialogShell(title,body,closable=true){return`<div class="v72-dialog-head"><h2>${title}</h2>${closable?'<button type="button" data-v72-close aria-label="Dialog schließen">×</button>':''}</div>${body}${closable?'<div class="v72-dialog-nav"><button type="button" class="menu-action" data-v72-close>Zur Transferübersicht</button></div>':''}<p class="v72-dialog-error" role="alert"></p>`}
function v72DealProfiles(career,pid,clubId){
 const player=v66Player(career,pid),club=v66Club(career,clubId);
 return`<p class="v72-deal-profiles">${player?`<button type="button" data-v72-player-profile="${escapeHTML(pid)}" aria-label="Spielerprofil ${escapeHTML(player.name)} öffnen">${escapeHTML(player.name)}</button>`:escapeHTML(pid)} · ${club?`<button type="button" data-v72-club-profile="${escapeHTML(clubId)}" aria-label="Vereinsprofil ${escapeHTML(club.name)} öffnen">${escapeHTML(club.name)}</button>`:'Verein'}</p>`;
}
function v72ConfirmCancel(career,id){
 const item=v72Negotiation(career,id),player=item&&v66Player(career,item.pid);if(!item)return;
 const body=`${v72DealProfiles(career,item.pid,item.sellerId)}<p>Dein aktuelles Ablöseangebot wird zurückgezogen. Für diesen Spieler kannst du in diesem Transferfenster kein neues Angebot abgeben.</p><div class="v72-confirm-actions"><button type="button" class="menu-action" data-v72-cancel-back="${escapeHTML(id)}">Zurück zur Verhandlung</button><button type="button" class="menu-action v72-confirm-danger" data-v72-cancel-confirm="${escapeHTML(id)}">Verhandlung endgültig beenden</button></div>`;
 v72Dialog.innerHTML=v72DialogShell('Verhandlung beenden?',body);
 v72Dialog.querySelector('[data-v72-cancel-back]')?.focus();
}
function v72NumberField(id,value,min=1){return`<span class="v72-number"><button type="button" data-v72-adjust="-1" data-v72-input="${id}" aria-label="Wert verringern">−</button><input id="${id}" type="number" min="${min}" step="10" value="${value}"><button type="button" data-v72-adjust="1" data-v72-input="${id}" aria-label="Wert erhöhen">+</button></span>`}
function v72OpenListing(career,pid){
 const existing=v72Market(career).negotiations.find(item=>item.pid===pid&&item.buyerId===career.manager.managedClubId&&!['completed','rejected'].includes(item.stage));
 if(existing){v72RenderDeal(career,existing.id);return}
 const listing=v72Listing(career,pid),player=listing&&v66Player(career,pid),club=listing&&v66Club(career,listing.sellerId);if(!listing||!player||!club)return;
 const willingness=v72Willingness(career,pid,career.manager.managedClubId);
 const body=`${v72DealProfiles(career,pid,club.id)}<div class="v72-dialog-facts"><span>Verhandelbare Ablöse<b>${v66Credits(listing.ask)}</b></span><span>Marktwert<b>${v66Credits(v66Value(player))}</b></span><span>Wechselbereitschaft<b>${v72WillingnessHTML(willingness)}</b></span></div><label>Dein Ablösegebot${v72NumberField('v72-fee',listing.ask)}</label><button type="button" class="primary" data-v72-start="${escapeHTML(pid)}">Gebot abgeben</button>`;
 const dialog=v72EnsureDialog();v72DialogMode='deal';v72CurrentId=null;dialog.innerHTML=v72DialogShell('Ablöse verhandeln',body);if(!dialog.open)dialog.showModal();
}
function v72RenderDeal(career,id){
 const item=v72Negotiation(career,id),player=item&&v66Player(career,item.pid),seller=item&&v66Club(career,item.sellerId);if(!item)return;
 const stage={"refusal-wait":'Entscheidung am Tageswechsel',"fee-wait":'Vereinsantwort ausstehend',"fee-counter":'Ablöse: Gegenforderung',contract:'Spielervertrag',"contract-wait":'Spielerantwort ausstehend',"contract-counter":'Vertrag: Gegenforderung',ready:'Entscheidung ausstehend',completed:'Wechsel abgeschlossen',rejected:'Verhandlung beendet'}[item.stage];
 let action='';
 if(item.stage==='fee-counter')action=`<div class="v72-dialog-facts"><span>Dein letztes Gebot<b>${v66Credits(item.price)}</b></span><span>Gegenforderung<b>${v66Credits(item.counter)}</b></span></div><label>Neues Ablösegebot${v72NumberField('v72-fee',item.counter)}</label><button type="button" class="primary" data-v72-fee="${escapeHTML(id)}">Antwort senden</button>`;
 else if(['contract','contract-counter'].includes(item.stage)){
  const salary=item.stage==='contract-counter'?item.counter:Math.round(v66Salary(player)*1.1/10)*10;
  action=`<p>Verein und Käufer haben ${v66Credits(item.agreedPrice)} Ablöse vereinbart. Jetzt entscheidet der Spieler über den Vertrag.</p><div class="v66-fields"><label>Jahresgehalt${v72NumberField('v72-salary',salary,60)}</label><label>Laufzeit<select id="v72-years">${[1,2,3].map(value=>`<option value="${value}" ${value===item.years?'selected':''}>${value} ${value===1?'Saison':'Saisons'}</option>`).join('')}</select></label><label>Einsatz-Zusage<select id="v72-promise">${Array.from({length:11},(_,value)=>`<option value="${value}" ${value===item.promise?'selected':''}>${value} ${value===1?'Einsatz':'Einsätze'}</option>`).join('')}</select></label></div><button type="button" class="primary" data-v72-contract="${escapeHTML(id)}">Vertragsangebot senden</button>`;
 }
 if(['fee-wait','fee-counter'].includes(item.stage))action+=`<button type="button" class="menu-action v72-cancel" data-v72-cancel="${escapeHTML(id)}">Verhandlung beenden</button>`;
 const body=`${v72DealProfiles(career,item.pid,item.sellerId)}<p class="v72-stage">${stage}</p><div class="v72-dialog-facts"><span>Öffentliche Forderung<b>${v66Credits(v72Market(career).saleListings.find(entry=>entry.pid===item.pid)?.ask||item.price)}</b></span><span>Deine Ablöse<b>${v66Credits(item.agreedPrice??item.price)}</b></span></div><p class="v72-last-change"><small>Letzte Änderung</small>${escapeHTML(item.lastChange)}</p>${action}`;
 const dialog=v72EnsureDialog();v72DialogMode='deal';v72CurrentId=id;dialog.innerHTML=v72DialogShell('Transferverhandlung',body);if(!dialog.open)dialog.showModal();
}
function v72RenderSellerDeal(career,id){
 const item=v72Negotiation(career,id),player=item&&v66Player(career,item.pid),buyer=item&&v66Club(career,item.buyerId);if(!item||item.sellerId!==career.manager.managedClubId)return;
 const listing=v72Market(career).saleListings.find(entry=>entry.pid===item.pid),stage={'seller-offer':'Kaufangebot erhalten','seller-counter-wait':'Antwort des Käufers ausstehend','contract-wait':'Spielervertrag ausstehend',ready:'Entscheidung beim Tageswechsel',completed:'Wechsel abgeschlossen',rejected:'Verhandlung beendet'}[item.stage]||item.stage;
 const ask=Math.max(item.price+10,listing?.ask||item.price+10);
 const actions=item.stage==='seller-offer'?`<div class="v72-seller-actions"><button type="button" class="primary" data-v72-seller-respond="${escapeHTML(id)}" data-v72-response="accept">Gebot annehmen</button><label>Deine Gegenforderung${v72NumberField('v72-seller-price',ask,item.price+1)}</label><button type="button" class="menu-action" data-v72-seller-respond="${escapeHTML(id)}" data-v72-response="counter">Gegenforderung senden</button><button type="button" class="menu-action" data-v72-seller-respond="${escapeHTML(id)}" data-v72-response="reject">Gebot ablehnen</button></div>`:'';
 const body=`${v72DealProfiles(career,item.pid,item.buyerId)}<p class="v72-stage">${stage}</p><div class="v72-dialog-facts"><span>Öffentliche Forderung<b>${v66Credits(listing?.ask||item.price)}</b></span><span>Gebot dieses Käufers<b>${v66Credits(item.agreedPrice??item.price)}</b></span></div><p class="v72-last-change"><small>Letzte Änderung</small>${escapeHTML(item.lastChange)}</p>${actions}`;
 const dialog=v72EnsureDialog();v72DialogMode='deal';v72CurrentId=id;dialog.innerHTML=v72DialogShell('Kaufangebot verwalten',body);if(!dialog.open)dialog.showModal();
}
function v72ShowResults(){
 if(!v61CurrentCareer||v72Dialog?.open)return;
 const career=v61CurrentCareer,market=v72Market(career),silent=market.transferResults.filter(item=>!item.seen&&!['completed','lost'].includes(item.kind));
 if(silent.length){for(const item of silent)item.seen=true;v64UiSave()}
 const result=market.transferResults.find(item=>['completed','lost'].includes(item.kind)&&!item.seen&&(item.released||market.day>item.day));if(!result)return;
 const player=v66Player(career,result.pid),seller=v66Club(career,result.sellerId),buyer=v66Club(career,result.buyerId),title=result.kind==='lost'?'Spieler wechselt zu anderem Verein':'Transfer abgeschlossen';
 const route=`<div class="v72-transfer-route" aria-label="Wechsel von ${escapeHTML(seller?.name||'Vereinslos')} zu ${escapeHTML(buyer?.name||'Verein')}"><div>${seller?v61CrestSVG(seller):'<span class="v72-free-agent-mark" aria-label="Ablösefrei">Frei</span>'}<small>Von</small><strong>${escapeHTML(seller?.name||'Vereinslos')}</strong></div><span class="v72-transfer-arrow" aria-hidden="true">→</span><div>${buyer?v61CrestSVG(buyer):'<span class="v72-free-agent-mark">Frei</span>'}<small>Zu</small><strong>${escapeHTML(buyer?.name||'Verein')}</strong></div></div>`;
 const body=`${route}<div class="v72-dialog-facts"><span>Spieler<b>${escapeHTML(player?.name||result.pid)}</b></span><span>Bisheriger Verein<b>${escapeHTML(seller?.name||'Vereinslos')}</b></span><span>Zielverein<b>${escapeHTML(buyer?.name||'Verein')}</b></span><span>${result.kind==='completed'?'Gezahlte Ablöse':'Gebotene Ablöse'}<b>${result.price?v66Credits(result.price):'Ablösefrei'}</b></span></div><p>${escapeHTML(result.message)}</p><button type="button" class="primary" data-v72-result="${escapeHTML(result.id)}">Weiter</button>`;
 const dialog=v72EnsureDialog();v72DialogMode='result';v72CurrentId=null;dialog.innerHTML=v72DialogShell(title,body,false);dialog.showModal();
}
v61WorldScreen.addEventListener('change',event=>{
 const target=event.target;
 if(target.id==='v72-country')v72Filter.country=target.value;
 else if(target.id==='v72-line')v72Filter.line=target.value;
 else if(target.id==='v72-max-price')v72Filter.maxPrice=target.value;
 else if(target.id==='v72-willingness')v72Filter.willingness=target.value;
 else return;
 if(v61CurrentCareer)v61RenderCareer(v61CurrentCareer);
});
v61WorldScreen.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button||!v61CurrentCareer)return;
 if(button.dataset.v72Open!==undefined){v72OpenListing(v61CurrentCareer,button.dataset.v72Open);return}
 if(button.dataset.v72Deal!==undefined)v72RenderDeal(v61CurrentCareer,button.dataset.v72Deal);
 if(button.dataset.v72SellerDeal!==undefined)v72RenderSellerDeal(v61CurrentCareer,button.dataset.v72SellerDeal);
 if(button.dataset.v72QuickSeller!==undefined){button.disabled=true;try{const scrollY=window.scrollY;v72SellerRespond(v61CurrentCareer,button.dataset.v72QuickSeller,button.dataset.v72Response);await v64UiSave();v61RenderCareer(v61CurrentCareer);window.scrollTo(0,scrollY)}catch(error){const target=v61WorldScreen.querySelector('#v72-own-message');if(target)target.textContent=error.message}finally{if(button.isConnected)button.disabled=false}return}
 if(button.dataset.v72Withdraw!==undefined){try{v72WithdrawOwn(v61CurrentCareer,button.dataset.v72Withdraw);await v64UiSave();v61RenderCareer(v61CurrentCareer)}catch(error){const target=v61WorldScreen.querySelector('#v72-own-message');if(target)target.textContent=error.message}}
 if(button.dataset.v72LowerAsk!==undefined){button.disabled=true;try{const pid=button.dataset.v72LowerAsk,amount=v61WorldScreen.querySelector(`[data-v72-new-ask="${CSS.escape(pid)}"]`)?.value;v72LowerOwnAsk(v61CurrentCareer,pid,amount);await v64UiSave();v61RenderCareer(v61CurrentCareer)}catch(error){const target=v61WorldScreen.querySelector('#v72-own-message');if(target)target.textContent=error.message}finally{if(button.isConnected)button.disabled=false}return}
});
v61ProfileDialog.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button||!v61CurrentCareer)return;
 if(button.dataset.v72ProfileOffer!==undefined){v66Filter.selected=button.dataset.v72ProfileOffer;v61ProfileDialog.close();v61CareerTab='transfers';v61RenderCareer(v61CurrentCareer);v61WorldScreen.querySelector('#v66-offer')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(button.dataset.v72GoSale!==undefined){v61ProfileDialog.close();v61SetCareerTab('transfers');v61WorldScreen.querySelector('#v72-own-sales')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(button.dataset.v72ListOwn!==undefined){
  button.disabled=true;
  try{v72ListOwn(v61CurrentCareer,button.dataset.v72ListOwn,v61ProfileDialog.querySelector('[data-v72-own-ask]')?.value);await v64UiSave();v61RenderCareer(v61CurrentCareer);v72DecorateOwnProfile(v61CurrentCareer,button.dataset.v72ListOwn)}
  catch(error){const target=v61ProfileDialog.querySelector('.v72-profile-sale .v72-dialog-error');if(target)target.textContent=error.message}
  finally{if(button.isConnected)button.disabled=false}
 }
});
const v72BaseOpenProfile=v61OpenProfile;
v61OpenProfile=function(pid,button){v72BaseOpenProfile(pid,button);if(v61CurrentCareer)v72DecorateOwnProfile(v61CurrentCareer,pid)};
const v72BaseRunMarketDay=v66RunMarketDay;
v66RunMarketDay=async function(){
 const career=v61CurrentCareer,own=career?.manager.managedClubId;
 const snapshot=career?.world?.market?.negotiations.filter(item=>item.buyerId===own||item.sellerId===own).map(item=>`${item.id}:${item.stage}:${item.lastChange}`).join('|');
 await v72BaseRunMarketDay();
 if(career&&snapshot!==career.world.market.negotiations.filter(item=>item.buyerId===own||item.sellerId===own).map(item=>`${item.id}:${item.stage}:${item.lastChange}`).join('|')){
  career.world.market.transferNotice=true;
  await v64UiSave();v72UpdateTransferBadge(career);
 }
 v72ShowResults();
};
function v72UpdateTransferBadge(career){
 const button=v61WorldScreen.querySelector('[data-v61-tab="transfers"]');if(!button)return;
 button.querySelector('.v72-transfer-badge')?.remove();
 if(career.world.market.transferNotice){button.insertAdjacentHTML('beforeend','<span class="v72-transfer-badge" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M3 4.5h14v9H9l-4 3v-3H3z"/><circle cx="8" cy="9" r="1"/><circle cx="12" cy="9" r="1"/></svg></span>');button.setAttribute('aria-label','Transfers – neue Antwort auf ein Angebot')}
 else button.removeAttribute('aria-label');
}
const v72BaseSetCareerTab=v61SetCareerTab;
v61SetCareerTab=function(tab,scroll=true){
 if(tab==='transfers'&&v61CurrentCareer?.world?.market?.transferNotice){v61CurrentCareer.world.market.transferNotice=false;v64UiSave()}
 const result=v72BaseSetCareerTab(tab,scroll);
 if(v61CurrentCareer)v72UpdateTransferBadge(v61CurrentCareer);
 return result;
};
const v72BaseRenderCareer=v61RenderCareer;
v61RenderCareer=function(career){v72BaseRenderCareer(career);v72UpdateTransferBadge(career);if(career?.world?.market?.transferResults?.some(item=>!item.seen))setTimeout(v72ShowResults,0)};
