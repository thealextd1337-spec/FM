'use strict';

let v66Filter={country:'all',club:'all',line:'all',selected:null};
let v66ContractSort={key:'roster',desc:false};
function v66Credits(value){return `${Math.round(value).toLocaleString('de-DE')} Credits`}
function v66Own(career){return v66Club(career,career.manager.managedClubId)}
function v66ContractFactsHTML(contract,season){
 if(!contract)return'';
 const remaining=contract.endSeason-season+1;
 return`<span>Jahresgehalt<b>${v66Credits(contract.annual)}</b></span><span>Beginn<b>Saison ${contract.fromSeason}</b></span><span>Vertrag bis<b>Saison ${contract.endSeason}</b></span><span>Restlaufzeit<b>${remaining} ${remaining===1?'Saison':'Saisons'}</b></span><span>Einsatz-Zusage<b>${contract.promise?`${contract.promise} ${contract.promise===1?'Einsatz':'Einsätze'} pro Saison`:'Keine'}</b></span>`;
}
function v66ContractHTML(career,player){
 const contract=v66Contract(career,player.pid);if(!contract)return'';
 const remaining=contract.endSeason-career.world.season+1,canRenew=remaining===1&&contract.renewalOffers<2&&career.world.market.phase!=='sponsor';
 return`<tr class="v66-contract"><td><button type="button" data-v61-player="${escapeHTML(player.pid)}" aria-label="Profil von ${escapeHTML(player.name)} öffnen">${v61FlagSVG(player.nation)} <strong>${escapeHTML(player.name)}</strong></button></td><td>${v61PositionNames[player.line]}</td><td class="v66-number">${v66Credits(contract.annual)}</td><td class="v66-number">${remaining} ${remaining===1?'Saison':'Saisons'}</td><td class="v66-number">${contract.promise?`${contract.promise} ${contract.promise===1?'Einsatz':'Einsätze'}`:'Keine'}</td><td>${canRenew?`<details><summary>Verlängern</summary><div class="v66-fields"><label>Jahresgehalt<input type="number" min="60" step="10" value="${Math.max(contract.annual,v66Salary(player))}" data-v66-renew-salary="${escapeHTML(player.pid)}"></label><label>Laufzeit<select data-v66-renew-years="${escapeHTML(player.pid)}"><option value="2">2 Saisons</option><option value="3">3 Saisons</option></select></label><label>Einsatz-Zusage<select data-v66-renew-promise="${escapeHTML(player.pid)}">${Array.from({length:11},(_,index)=>`<option value="${index}" ${index===contract.promise?'selected':''}>${index} ${index===1?'Einsatz':'Einsätze'}</option>`).join('')}</select></label><button type="button" class="menu-action" data-v66-renew="${escapeHTML(player.pid)}">Angebot machen</button></div></details>`:'–'}</td></tr>`;
}
function v66ContractsTableHTML(career){
 const roster=[...v66Own(career).roster];
 if(v66ContractSort.key!=='roster')roster.sort((a,b)=>{const first=v66Contract(career,a.pid),second=v66Contract(career,b.pid),key=v66ContractSort.key,values={name:[a.name,b.name],position:[v61PositionNames[a.line],v61PositionNames[b.line]],salary:[first?.annual??0,second?.annual??0],remaining:[(first?.endSeason??0)-career.world.season+1,(second?.endSeason??0)-career.world.season+1],promise:[first?.promise??0,second?.promise??0]}[key],order=typeof values[0]==='string'?values[0].localeCompare(values[1],'de'):values[0]-values[1];return(v66ContractSort.desc?-order:order)||a.name.localeCompare(b.name,'de')});
 const heading=(key,label)=>`<th scope="col" ${v66ContractSort.key===key?`aria-sort="${v66ContractSort.desc?'descending':'ascending'}"`:''}><button type="button" data-v66-contract-sort="${key}">${label}${v66ContractSort.key===key?` <span aria-hidden="true">${v66ContractSort.desc?'↓':'↑'}</span>`:''}</button></th>`;
 return`<p class="v66-table-hint">Tabelle seitlich scrollen, um alle Spalten zu sehen.</p><div class="v66-contract-wrap" tabindex="0" role="region" aria-label="Profiverträge, seitlich scrollbar"><table class="v66-contract-table"><thead><tr>${heading('name','Spieler')}${heading('position','Position')}${heading('salary','Gehalt / Saison')}${heading('remaining','Restlaufzeit')}${heading('promise','Einsatz-Zusage')}<th scope="col">Aktion</th></tr></thead><tbody>${roster.map(player=>v66ContractHTML(career,player)).join('')}</tbody></table></div>`;
}
function v66FinanceHTML(career){
 const club=v66Own(career),due=v66SalaryDue(career,club.id),recent=[...club.ledger].reverse().slice(0,12);
 return`<section class="v62-season v66-finance"><h3>Vereinsfinanzen</h3><div class="finance-cards"><span>Kontostand<b>${v66Credits(club.balance)}</b></span><span>Geplante Gehälter<b>${v66Credits(due)}</b></span><span>Profis<b>${club.roster.length} / 14</b></span><span>Status<b>${club.restructuring?'Sanierung':'Regulär'}</b></span></div>${club.restructuring?'<p class="v66-note">Während der Sanierung sind Käufe mit Ablöse gesperrt. Ein positiver Kontostand beendet die Sperre erst beim nächsten Saisonabschluss.</p>':''}<h4>Letzte Buchungen</h4><div class="ledger">${recent.map(item=>`<div><span>${escapeHTML(item.label)}</span><b class="${item.amount<0?'out':''}">${item.amount>0?'+':''}${v66Credits(item.amount)}</b></div>`).join('')}</div></section>`;
}
function v66SponsorHTML(career){
 const club=v66Own(career),selected=club.sponsors.find(item=>item.id===club.sponsorId);
 const brand=offer=>`<span class="v66-sponsor-brand">${v66SponsorLogoSVG(club.countryId,offer.name)}<span><strong>${escapeHTML(offer.name)}</strong><small>${escapeHTML(v61CountryNames[club.countryId])}</small></span></span>`;
 const goals=offer=>`<ul class="v66-sponsor-goals">${offer.goals.map(goal=>`<li><span>${escapeHTML(goal.label)}</span><strong>+ ${v66Credits(goal.bonus)}</strong></li>`).join('')}</ul>`;
 if(selected)return`<section class="v62-season v66-sponsors"><h3>Sponsor · Saison ${career.world.season}</h3>${brand(selected)}<p>Fixum erhalten: <strong>${v66Credits(selected.fixed)}</strong></p>${goals(selected)}</section>`;
 return`<section class="v62-season v66-sponsors" id="v66-sponsor"><h2>Sponsor für Saison ${career.world.season} wählen</h2><p>Das Fixum wird sofort gebucht. Jedes erreichte Bonusziel wird am Saisonende einzeln bezahlt.</p><div class="sponsor-offers">${club.sponsors.map(offer=>{const possible=offer.goals.reduce((sum,goal)=>sum+goal.bonus,0);return`<button type="button" data-v66-sponsor="${escapeHTML(offer.id)}">${brand(offer)}<span class="v66-sponsor-money"><span><small>Sofortiges Fixum</small><strong>${v66Credits(offer.fixed)}</strong></span><span><small>Mögliche Boni</small><strong>+ ${v66Credits(possible)}</strong></span></span>${goals(offer)}<span class="v66-sponsor-total">Maximal bei allen Zielen <strong>${v66Credits(offer.fixed+possible)}</strong></span></button>`}).join('')}</div></section>`;
}
function v66MarketPlayers(career){
 const clubs=career.world.clubs.filter(club=>club.id!==career.manager.managedClubId&&(v66Filter.country==='all'||club.countryId===v66Filter.country)&&(v66Filter.club==='all'||club.id===v66Filter.club));
 const owned=clubs.flatMap(club=>club.roster.map(player=>({player,club}))),free=career.world.market.freePlayers.filter(player=>(v66Filter.club==='all'||v66Filter.club==='free')&&(v66Filter.country==='all'||player.pid.includes(`:${v66Filter.country}:`))).map(player=>({player,club:null}));
 return[...free,...owned].filter(item=>v66Filter.line==='all'||item.player.line===v66Filter.line).sort((a,b)=>Number(!a.club)-Number(!b.club)||v66Value(b.player)-v66Value(a.player)).slice(0,48);
}
function v66OfferHTML(career){
 const player=v66Player(career,v66Filter.selected);if(!player)return'';
 const owner=v66Owner(career,player.pid);if(owner?.id===career.manager.managedClubId)return'';
 const club=v66Own(career),available=club.roster.length<14,price=owner?v66Value(player):0,annual=Math.round(v66Salary(player)*1.12/10)*10;
 return`<section class="v66-offer" id="v66-offer"><h3>Angebot für ${escapeHTML(player.name)}</h3><p>${owner?`Aktueller Verein: ${escapeHTML(owner.name)} · Richtwert ${v66Credits(price)}. Auch Spieler ohne Verkaufsliste können ein Gebot erhalten.`:'Vereinslos · keine Ablöse.'} ${v61FlagSVG(player.nation)} ${v61PositionNames[player.line]}, ${player.age} Jahre</p><button type="button" class="menu-action" data-v66-profile="${escapeHTML(player.pid)}">Spielerprofil ansehen</button><div class="v66-fields"><label>Ablöse<input type="number" id="v66-price" min="${owner?1:0}" step="10" value="${price}" ${owner?'':'readonly'}></label><label>Jahresgehalt<input type="number" id="v66-salary" min="60" step="10" value="${annual}"></label><label>Laufzeit<select id="v66-years"><option value="1">1 Saison</option><option value="2" selected>2 Saisons</option><option value="3">3 Saisons</option></select></label><label>Einsatz-Zusage<select id="v66-promise">${Array.from({length:11},(_,index)=>`<option value="${index}" ${index===3?'selected':''}>${index} ${index===1?'Einsatz':'Einsätze'}</option>`).join('')}</select></label><button type="button" class="primary" data-v66-offer="${escapeHTML(player.pid)}" ${available&&(career.world.market.phase==='open'||career.world.market.phase==='closed'&&!owner&&!career.world.seasonFinished)?'':'disabled'}>Angebot senden ↗</button></div><p class="v66-note">Ein gebundener Spieler wechselt erst nach Zustimmung von Verein und Spieler. Der Käufer zahlt die Ablöse; Gehälter werden am Saisonende fällig.</p></section>`;
}
function v66BidHTML(career,bid,kind){
 const player=v66Player(career,bid.pid),name=player?.name||bid.pid,other=v66Club(career,kind==='incoming'?bid.buyerId:bid.sellerId)?.name||'Vereinslos';
 const status={pending:'Offen',counter:'Gegenforderung',completed:'Abgeschlossen',rejected:'Abgelehnt',expired:'Abgelaufen'}[bid.status]||bid.status;
 return`<article class="v66-bid"><div>${player?`<button type="button" class="v66-bid-player" data-v66-profile="${escapeHTML(bid.pid)}">${escapeHTML(name)} <span class="v66-profile-hint">Profil ansehen</span></button>`:`<strong>${escapeHTML(name)}</strong>`}<span>${escapeHTML(other)} · ${v66Credits(bid.price)} Ablöse · ${v66Credits(bid.annual)} Gehalt · ${bid.years} ${bid.years===1?'Saison':'Saisons'}</span><small>${status}${bid.reason?` · ${escapeHTML(bid.reason)}`:''}</small></div>${kind==='incoming'&&bid.status==='pending'?`<div class="v66-bid-actions"><button type="button" class="menu-action" data-v66-accept="${escapeHTML(bid.id)}">Annehmen</button><button type="button" class="menu-action" data-v66-reject="${escapeHTML(bid.id)}">Ablehnen</button></div>`:''}${kind==='outgoing'&&bid.status==='counter'?`<div class="v66-bid-actions"><label>Neues Gehalt<input type="number" min="${bid.counter}" step="10" value="${bid.counter}" data-v66-counter-salary="${escapeHTML(bid.id)}"></label><button type="button" class="menu-action" data-v66-improve="${escapeHTML(bid.id)}">Einmal verbessern</button></div>`:''}</article>`;
}
function v66DeadlineHTML(career){
 const own=v66Own(career),completed=career.world.market.pendingBids.filter(bid=>bid.status==='completed'),arrivals=completed.filter(bid=>bid.buyerId===own.id),departures=completed.filter(bid=>bid.sellerId===own.id);
 const entries=(bids,direction)=>bids.length?`<ul>${bids.map(bid=>{const player=v66Player(career,bid.pid),other=v66Club(career,direction==='in'?bid.sellerId:bid.buyerId),relation=direction==='in'?`Von ${escapeHTML(other?.name||'Vereinslos')}`:`Zu ${escapeHTML(other?.name||'Unbekannt')}`;return`<li><span>${player?`<button type="button" data-v66-profile="${escapeHTML(bid.pid)}">${escapeHTML(player.name)}</button>`:escapeHTML(bid.pid)}<small>${relation}</small></span><strong>${bid.price?v66Credits(bid.price):'Ablösefrei'}</strong></li>`}).join('')}</ul>`:`<p>Keine ${direction==='in'?'Zugänge':'Abgänge'}.</p>`;
 return`<section class="v66-deadline" id="v66-deadline"><h3>Transferbilanz · Saison ${career.world.season}</h3><p>Abgeschlossene Wechsel seit Saisonbeginn. Kontostand und Gehaltslast zeigen den aktuellen Stand.</p><div class="v66-deadline-finance"><span>Kontostand<strong>${v66Credits(own.balance)}</strong></span><span>Gehälter zum Saisonende<strong>${v66Credits(v66SalaryDue(career,own.id))}</strong></span></div><div class="v66-deadline-columns"><div><h4>Zum Verein gekommen · ${arrivals.length}</h4>${entries(arrivals,'in')}</div><div><h4>Verein verlassen · ${departures.length}</h4>${entries(departures,'out')}</div></div></section>`;
}
function v66MarketHTML(career){
 const market=career.world.market,own=v66Own(career),open=market.phase==='open',bids=market.pendingBids.filter(item=>item.buyerId===own.id||item.sellerId===own.id),incoming=bids.filter(item=>item.sellerId===own.id),outgoing=bids.filter(item=>item.buyerId===own.id);
 const clubs=career.world.clubs.filter(club=>club.id!==own.id&&(v66Filter.country==='all'||club.countryId===v66Filter.country));
 return`<section class="v62-season v66-market"><div class="v62-season-head"><div><p class="eyebrow">Gemeinsamer Spielermarkt</p><h2>Transfers</h2><p>${open?`Transfertag ${market.day} von 5`:'Die reguläre Transferphase ist geschlossen.'} · ${own.roster.length} Profis · Kontostand ${v66Credits(own.balance)}</p></div></div>${open?'<p>Nach dem fünften Tag braucht jeder Verein mindestens zehn Profis und einen Torwart. Offene Angebote werden nach Fristablauf automatisch abgelehnt.</p>':'<p>Während der Saison sind nur ablösefreie Verpflichtungen möglich.</p>'}${incoming.length?`<h3>Eingegangene Angebote</h3><div class="v66-bids">${incoming.slice(-12).reverse().map(bid=>v66BidHTML(career,bid,'incoming')).join('')}</div>`:''}${outgoing.length?`<h3>Deine Angebote</h3><div class="v66-bids">${outgoing.slice(-12).reverse().map(bid=>v66BidHTML(career,bid,'outgoing')).join('')}</div>`:''}<h3>Spieler suchen</h3><p class="v66-note">Alle Profis anderer Vereine und vereinslose Spieler sind sichtbar. Das ist keine Verkaufsliste: Du kannst jedem gebundenen Spieler ein Angebot machen. Zuerst erscheinen die höchsten Marktwert-Richtwerte, danach Vereinslose; die Liste zeigt bis zu 48 Treffer. Der Länderfilter bezieht sich auf den Verein.</p><div class="v66-filters"><label>Vereinsland<select id="v66-country"><option value="all">Alle Länder</option>${v61Countries.map(([id,name])=>`<option value="${id}" ${v66Filter.country===id?'selected':''}>${name}</option>`).join('')}</select></label><label>Verein<select id="v66-club"><option value="all">Alle Vereine und Freie</option><option value="free" ${v66Filter.club==='free'?'selected':''}>Vereinslos</option>${clubs.map(club=>`<option value="${club.id}" ${v66Filter.club===club.id?'selected':''}>${escapeHTML(club.name)}</option>`).join('')}</select></label><label>Position<select id="v66-line"><option value="all">Alle Positionen</option>${Object.entries(v61PositionNames).map(([id,name])=>`<option value="${id}" ${v66Filter.line===id?'selected':''}>${name}</option>`).join('')}</select></label></div><p class="v66-note">Marktwert und Gehalt sind Richtwerte. Spielerfähigkeiten stehen nur als Farbstufen im Profil.</p><div class="v66-player-list">${v66MarketPlayers(career).map(({player,club})=>`<article class="v66-player-card" ${v66Filter.selected===player.pid?'data-selected="true"':''}><div class="v66-player-identity">${v61FlagSVG(player.nation)}<span><button type="button" class="v66-player-name" data-v66-profile="${escapeHTML(player.pid)}">${escapeHTML(player.name)}</button><small>${escapeHTML(club?.name||'Vereinslos')} · ${v61PositionNames[player.line]}, ${player.age}</small></span></div><button type="button" class="v66-player-pick" data-v66-select="${escapeHTML(player.pid)}" aria-label="Angebot für ${escapeHTML(player.name)} planen"><b>${club?v66Credits(v66Value(player)):'Ablösefrei'}</b><small>Angebot planen</small></button></article>`).join('')||'<p>Keine Spieler in dieser Auswahl.</p>'}</div>${v66OfferHTML(career)}<p id="v66-message" class="v61-error" role="alert"></p></section>`;
}
function v66DecorateCareer(career){
 const overview=v61WorldScreen.querySelector('[data-v46-view="overview"]'),squad=v61WorldScreen.querySelector('[data-v46-view="squad"]'),club=v61WorldScreen.querySelector('[data-v46-view="club"]'),competition=v61WorldScreen.querySelector('[data-v46-view="competition"]');
 if(!overview||!squad||!club||!competition)return;
 overview.insertAdjacentHTML('afterbegin',v66SponsorHTML(career));
 overview.querySelector('.v62-explainer')?.remove();
 const count=squad.querySelector('.v61-roster-head p');if(count)count.textContent=`${v66Own(career).roster.length} Profis · Verträge und Spielerprofile öffnen.`;
 squad.insertAdjacentHTML('beforeend',`<section class="v62-season v66-contracts"><h3>Profiverträge</h3>${v66ContractsTableHTML(career)}<p id="v66-contract-message" class="v61-error" role="alert"></p></section>`);
 club.insertAdjacentHTML('beforeend',v66FinanceHTML(career));
 const transfer=document.createElement('div');transfer.dataset.v46View='transfers';transfer.innerHTML=v66MarketHTML(career);competition.before(transfer);
 if(career.world.market.phase==='closed')transfer.querySelector('.v62-season-head')?.insertAdjacentHTML('afterend',v66DeadlineHTML(career));
 const nav=v61WorldScreen.querySelector('[data-v61-tab="transfers"]');if(nav){nav.disabled=false;nav.removeAttribute('aria-label')}
 v61SetCareerTab(v61CareerTab,false);
 v58Refresh();
}
const v66BaseSetCareerTab=v61SetCareerTab;
v61SetCareerTab=function(tab,scroll=true){
 if(tab!=='transfers')return v66BaseSetCareerTab(tab,scroll);
 v61CareerTab=tab;
 for(const view of v61WorldScreen.querySelectorAll(':scope > [data-v46-view]'))view.hidden=view.dataset.v46View!==tab;
 for(const button of v61WorldScreen.querySelectorAll('.v61-career-nav button')){if(button.dataset.v61Tab===tab)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')}
 if(scroll)window.scrollTo(0,0);
};
const v66BaseRenderCareer=v61RenderCareer;
v61RenderCareer=function(career){v66BaseRenderCareer(career);if(!career.world.activeMatch)v66DecorateCareer(career)};
const v66BaseProgressState=v58State;
v58State=function(){
 const career=v61CurrentCareer;if(!career||v61WorldScreen.hidden||career.world.activeMatch)return v66BaseProgressState();
 const market=career.world.market;
 if(market.phase==='sponsor')return{context:`Saison ${career.world.season} · Sponsor`,label:'Sponsor wählen',action:'v66-sponsor'};
 if(market.phase==='open')return{context:`Transferphase · Tag ${market.day} von 5`,label:market.day===5?'Transferschluss bestätigen':'Nächster Transfertag',action:'v66-day'};
 return v66BaseProgressState();
};
const v66BaseProgressClick=v58Button.onclick;
let v66DayBusy=false;
async function v66RunMarketDay(){
 if(v66DayBusy)return;
 const career=v61CurrentCareer,closing=career.world.market.day===5,day=career.world.market.day+1,started=Date.now();
 v66DayBusy=true;
 const indicator=document.createElement('div');indicator.className='v66-day-progress';indicator.setAttribute('role','status');indicator.innerHTML=`<span>${closing?'Transferschluss wird ausgewertet':`Transfertag ${day} wird vorbereitet`} …</span><span class="v66-day-track" aria-hidden="true"><span></span></span>`;
 v58Bar.append(indicator);v58Button.disabled=true;v58Button.textContent='Bitte warten …';
 try{
  await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
  v66NextMarketDay(career);await v64UiSave();
  await new Promise(resolve=>setTimeout(resolve,Math.max(0,420-(Date.now()-started))));
  if(career.world.market.phase==='closed')v61CareerTab='transfers';
  v61RenderCareer(career);
  if(career.world.market.phase==='closed')v61WorldScreen.querySelector('#v66-deadline')?.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(error){
  await v64UiSave();v61CareerTab='transfers';v61RenderCareer(career);
  const target=v61WorldScreen.querySelector('#v66-message');if(target){target.textContent=error.message;target.scrollIntoView({behavior:'smooth',block:'center'})}
 }finally{indicator.remove();v66DayBusy=false;v58Refresh()}
}
v58Button.onclick=function(){
 const action=v58State()?.action;
 if(action==='v66-sponsor'){v61SetCareerTab('overview');v61WorldScreen.querySelector('#v66-sponsor')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(action==='v66-day'){
  v66RunMarketDay();
  return;
 }
 return v66BaseProgressClick();
};
v61WorldScreen.addEventListener('change',event=>{
 const target=event.target;if(!v61CurrentCareer||v61CurrentCareer.world.activeMatch)return;
 if(target.id==='v66-country'){v66Filter.country=target.value;v66Filter.club='all';v66Filter.selected=null}
 else if(target.id==='v66-club'){v66Filter.club=target.value;v66Filter.selected=null}
 else if(target.id==='v66-line'){v66Filter.line=target.value;v66Filter.selected=null}
 else return;
 v61RenderCareer(v61CurrentCareer);
});
v61WorldScreen.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||!v61CurrentCareer||v61CurrentCareer.world.activeMatch)return;
 const career=v61CurrentCareer;let action=false;
 try{
  if(button.dataset.v66Sponsor){v66ChooseSponsor(career,career.manager.managedClubId,button.dataset.v66Sponsor);v61CareerTab='transfers';action=true}
  else if(button.dataset.v66ContractSort){const key=button.dataset.v66ContractSort;if(!['name','position','salary','remaining','promise'].includes(key))return;v66ContractSort={key,desc:v66ContractSort.key===key?!v66ContractSort.desc:false};v61RenderCareer(career);v61WorldScreen.querySelector('.v66-contracts')?.scrollIntoView({block:'start'});return}
  else if(button.dataset.v66Select){v66Filter.selected=button.dataset.v66Select;action=true}
  else if(button.dataset.v66Profile){const player=v66Player(career,button.dataset.v66Profile);if(!player)return;const owner=v66Owner(career,player.pid),contract=v66Contract(career,player.pid);v61ProfileReturn=button;v61ProfileDialog.innerHTML=`<div class="player-card-head"><div>${v61FlagSVG(player.nation)}<p class="eyebrow">${escapeHTML(v61CountryNames[player.nation])}</p><h2>${escapeHTML(player.name)}</h2><span>${v61PositionNames[player.line]} · ${player.age} Jahre · ${escapeHTML(owner?.name||'Vereinslos')}</span></div><button type="button" data-v61-close aria-label="Spielerprofil schließen">×</button></div><div class="player-card-facts"><span>Marktwert<b>${v66Credits(v66Value(player))}</b></span>${v66ContractFactsHTML(contract,career.world.season)}</div><section><h3>Fähigkeiten</h3>${v55SkillGroupsHTML(player)}</section>`;v61ProfileDialog.querySelector('[data-v61-close]').onclick=()=>v61ProfileDialog.close();v61ProfileDialog.showModal();return}
  else if(button.dataset.v66Offer){v66MakeBid(career,career.manager.managedClubId,button.dataset.v66Offer,v61WorldScreen.querySelector('#v66-price').value,v61WorldScreen.querySelector('#v66-salary').value,v61WorldScreen.querySelector('#v66-years').value,v61WorldScreen.querySelector('#v66-promise').value);action=true}
  else if(button.dataset.v66Accept){v66RespondBid(career,button.dataset.v66Accept,true);action=true}
  else if(button.dataset.v66Reject){v66RespondBid(career,button.dataset.v66Reject,false);action=true}
  else if(button.dataset.v66Improve){const annual=v61WorldScreen.querySelector(`[data-v66-counter-salary="${CSS.escape(button.dataset.v66Improve)}"]`)?.value;v66ImproveBid(career,button.dataset.v66Improve,annual);action=true}
  else if(button.dataset.v66Renew){const pid=button.dataset.v66Renew,result=v66Renew(career,pid,v61WorldScreen.querySelector(`[data-v66-renew-salary="${CSS.escape(pid)}"]`)?.value,v61WorldScreen.querySelector(`[data-v66-renew-years="${CSS.escape(pid)}"]`)?.value,v61WorldScreen.querySelector(`[data-v66-renew-promise="${CSS.escape(pid)}"]`)?.value);if(!result.accepted)throw Error(`Spieler fordert mindestens ${v66Credits(result.counter)}. Ein verbessertes Angebot ist möglich.`);action=true}
  if(action){v64UiSave();v61RenderCareer(career);if(button.dataset.v66Select)v61WorldScreen.querySelector('#v66-offer')?.scrollIntoView({behavior:'smooth',block:'start'})}
 }catch(error){const target=v61WorldScreen.querySelector('#v66-message')||v61WorldScreen.querySelector('#v66-contract-message');if(target){target.textContent=error.message;target.scrollIntoView({behavior:'smooth',block:'center'})}}
});
const v66BaseOpenProfile=v61OpenProfile;
v61OpenProfile=function(pid,button){v66BaseOpenProfile(pid,button);if(!v61CurrentCareer)return;const contract=v66Contract(v61CurrentCareer,pid),facts=v61ProfileDialog.querySelector('.player-card-facts');if(facts)facts.insertAdjacentHTML('beforeend',v66ContractFactsHTML(contract,v61CurrentCareer.world.season))};
