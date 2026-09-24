'use strict';

let v66Filter={country:'all',club:'all',line:'all',selected:null};
function v66Credits(value){return `${Math.round(value).toLocaleString('de-DE')} Credits`}
function v66Own(career){return v66Club(career,career.manager.managedClubId)}
function v66ContractHTML(career,player){
 const contract=v66Contract(career,player.pid);if(!contract)return'';
 const remaining=contract.endSeason-career.world.season+1,canRenew=remaining===1&&contract.renewalOffers<2&&career.world.market.phase!=='sponsor';
 return`<article class="v66-contract"><button type="button" data-v61-player="${escapeHTML(player.pid)}">${v61FlagSVG(player.nation)} <strong>${escapeHTML(player.name)}</strong></button><span>${v61PositionNames[player.line]} · ${v66Credits(contract.annual)} pro Saison · ${remaining} ${remaining===1?'Saison':'Saisons'} Restlaufzeit${contract.promise?` · Zusage ${contract.promise} ${contract.promise===1?'Einsatz':'Einsätze'}`:''}</span>${canRenew?`<details><summary>Vertrag verlängern</summary><div class="v66-fields"><label>Jahresgehalt<input type="number" min="60" step="10" value="${Math.max(contract.annual,v66Salary(player))}" data-v66-renew-salary="${escapeHTML(player.pid)}"></label><label>Laufzeit<select data-v66-renew-years="${escapeHTML(player.pid)}"><option value="2">2 Saisons</option><option value="3">3 Saisons</option></select></label><label>Einsatz-Zusage<select data-v66-renew-promise="${escapeHTML(player.pid)}">${Array.from({length:11},(_,index)=>`<option value="${index}" ${index===contract.promise?'selected':''}>${index} ${index===1?'Einsatz':'Einsätze'}</option>`).join('')}</select></label><button type="button" class="menu-action" data-v66-renew="${escapeHTML(player.pid)}">Angebot machen</button></div></details>`:''}</article>`;
}
function v66FinanceHTML(career){
 const club=v66Own(career),due=v66SalaryDue(career,club.id),recent=[...club.ledger].reverse().slice(0,12);
 return`<section class="v62-season v66-finance"><h3>Vereinsfinanzen</h3><div class="finance-cards"><span>Kontostand<b>${v66Credits(club.balance)}</b></span><span>Geplante Gehälter<b>${v66Credits(due)}</b></span><span>Profis<b>${club.roster.length} / 14</b></span><span>Status<b>${club.restructuring?'Sanierung':'Regulär'}</b></span></div>${club.restructuring?'<p class="v66-note">Während der Sanierung sind Käufe mit Ablöse gesperrt. Ein positiver Kontostand beendet die Sperre erst beim nächsten Saisonabschluss.</p>':''}<h4>Letzte Buchungen</h4><div class="ledger">${recent.map(item=>`<div><span>${escapeHTML(item.label)}</span><b class="${item.amount<0?'out':''}">${item.amount>0?'+':''}${v66Credits(item.amount)}</b></div>`).join('')}</div></section>`;
}
function v66SponsorHTML(career){
 const club=v66Own(career),selected=club.sponsors.find(item=>item.id===club.sponsorId);
 if(selected)return`<section class="v62-season v66-sponsors"><h3>Sponsor · Saison ${career.world.season}</h3><p><strong>${escapeHTML(selected.name)}</strong> · Fixum ${v66Credits(selected.fixed)}</p><ul>${selected.goals.map(goal=>`<li>${escapeHTML(goal.label)}: ${v66Credits(goal.bonus)}</li>`).join('')}</ul></section>`;
 return`<section class="v62-season v66-sponsors" id="v66-sponsor"><h2>Sponsor für Saison ${career.world.season} wählen</h2><p>Das Fixum wird sofort gebucht. Jedes erreichte Bonusziel wird am Saisonende einzeln bezahlt.</p><div class="sponsor-offers">${club.sponsors.map(offer=>`<button type="button" data-v66-sponsor="${escapeHTML(offer.id)}"><span>${escapeHTML(offer.name)}</span><b>${v66Credits(offer.fixed)}</b><p>${offer.goals.map(goal=>`${escapeHTML(goal.label)} · ${v66Credits(goal.bonus)}`).join('<br>')}</p></button>`).join('')}</div></section>`;
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
 return`<article class="v66-bid"><div><strong>${escapeHTML(name)}</strong><span>${escapeHTML(other)} · ${v66Credits(bid.price)} Ablöse · ${v66Credits(bid.annual)} Gehalt · ${bid.years} ${bid.years===1?'Saison':'Saisons'}</span><small>${status}${bid.reason?` · ${escapeHTML(bid.reason)}`:''}</small></div>${kind==='incoming'&&bid.status==='pending'?`<div class="v66-bid-actions"><button type="button" class="menu-action" data-v66-accept="${escapeHTML(bid.id)}">Annehmen</button><button type="button" class="menu-action" data-v66-reject="${escapeHTML(bid.id)}">Ablehnen</button></div>`:''}${kind==='outgoing'&&bid.status==='counter'?`<div class="v66-bid-actions"><label>Neues Gehalt<input type="number" min="${bid.counter}" step="10" value="${bid.counter}" data-v66-counter-salary="${escapeHTML(bid.id)}"></label><button type="button" class="menu-action" data-v66-improve="${escapeHTML(bid.id)}">Einmal verbessern</button></div>`:''}</article>`;
}
function v66MarketHTML(career){
 const market=career.world.market,own=v66Own(career),open=market.phase==='open',bids=market.pendingBids.filter(item=>item.buyerId===own.id||item.sellerId===own.id),incoming=bids.filter(item=>item.sellerId===own.id),outgoing=bids.filter(item=>item.buyerId===own.id);
 const clubs=career.world.clubs.filter(club=>club.id!==own.id&&(v66Filter.country==='all'||club.countryId===v66Filter.country));
 return`<section class="v62-season v66-market"><div class="v62-season-head"><div><p class="eyebrow">Gemeinsamer Spielermarkt</p><h2>Transfers</h2><p>${open?`Transfertag ${market.day} von 5`:'Die reguläre Transferphase ist geschlossen.'} · ${own.roster.length} Profis · Kontostand ${v66Credits(own.balance)}</p></div></div>${open?'<p>Nach dem fünften Tag braucht jeder Verein mindestens zehn Profis und einen Torwart. Offene Angebote werden nach Fristablauf automatisch abgelehnt.</p>':'<p>Während der Saison sind nur ablösefreie Verpflichtungen möglich.</p>'}${incoming.length?`<h3>Eingegangene Angebote</h3><div class="v66-bids">${incoming.slice(-12).reverse().map(bid=>v66BidHTML(career,bid,'incoming')).join('')}</div>`:''}${outgoing.length?`<h3>Deine Angebote</h3><div class="v66-bids">${outgoing.slice(-12).reverse().map(bid=>v66BidHTML(career,bid,'outgoing')).join('')}</div>`:''}<h3>Spieler suchen</h3><div class="v66-filters"><label>Land<select id="v66-country"><option value="all">Alle Länder</option>${v61Countries.map(([id,name])=>`<option value="${id}" ${v66Filter.country===id?'selected':''}>${name}</option>`).join('')}</select></label><label>Verein<select id="v66-club"><option value="all">Alle Vereine und Freie</option><option value="free" ${v66Filter.club==='free'?'selected':''}>Vereinslos</option>${clubs.map(club=>`<option value="${club.id}" ${v66Filter.club===club.id?'selected':''}>${escapeHTML(club.name)}</option>`).join('')}</select></label><label>Position<select id="v66-line"><option value="all">Alle Positionen</option>${Object.entries(v61PositionNames).map(([id,name])=>`<option value="${id}" ${v66Filter.line===id?'selected':''}>${name}</option>`).join('')}</select></label></div><p class="v66-note">Marktwert und Gehalt sind Richtwerte. Spielerfähigkeiten stehen nur als Farbstufen im Profil.</p><div class="v66-player-list">${v66MarketPlayers(career).map(({player,club})=>`<button type="button" data-v66-select="${escapeHTML(player.pid)}" ${v66Filter.selected===player.pid?'aria-current="true"':''}><span>${v61FlagSVG(player.nation)} <strong>${escapeHTML(player.name)}</strong><small>${escapeHTML(club?.name||'Vereinslos')} · ${v61PositionNames[player.line]}, ${player.age}</small></span><b>${club?v66Credits(v66Value(player)):'Ablösefrei'}</b></button>`).join('')||'<p>Keine Spieler in dieser Auswahl.</p>'}</div>${v66OfferHTML(career)}<p id="v66-message" class="v61-error" role="alert"></p></section>`;
}
function v66DecorateCareer(career){
 const overview=v61WorldScreen.querySelector('[data-v46-view="overview"]'),squad=v61WorldScreen.querySelector('[data-v46-view="squad"]'),club=v61WorldScreen.querySelector('[data-v46-view="club"]'),competition=v61WorldScreen.querySelector('[data-v46-view="competition"]');
 if(!overview||!squad||!club||!competition)return;
 overview.insertAdjacentHTML('afterbegin',v66SponsorHTML(career));
 overview.querySelector('.v62-explainer')?.remove();
 const count=squad.querySelector('.v61-roster-head p');if(count)count.textContent=`${v66Own(career).roster.length} Profis · Verträge und Spielerprofile öffnen.`;
 squad.insertAdjacentHTML('beforeend',`<section class="v62-season v66-contracts"><h3>Profiverträge</h3>${v66Own(career).roster.map(player=>v66ContractHTML(career,player)).join('')}<p id="v66-contract-message" class="v61-error" role="alert"></p></section>`);
 club.insertAdjacentHTML('beforeend',v66FinanceHTML(career));
 const transfer=document.createElement('div');transfer.dataset.v46View='transfers';transfer.innerHTML=v66MarketHTML(career);competition.before(transfer);
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
v58Button.onclick=function(){
 const action=v58State()?.action;
 if(action==='v66-sponsor'){v61SetCareerTab('overview');v61WorldScreen.querySelector('#v66-sponsor')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(action==='v66-day'){
  try{v66NextMarketDay(v61CurrentCareer);v64UiSave();v61RenderCareer(v61CurrentCareer)}catch(error){v64UiSave();v61CareerTab='transfers';v61RenderCareer(v61CurrentCareer);const target=v61WorldScreen.querySelector('#v66-message');if(target){target.textContent=error.message;target.scrollIntoView({behavior:'smooth',block:'center'})}}
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
  else if(button.dataset.v66Select){v66Filter.selected=button.dataset.v66Select;action=true}
  else if(button.dataset.v66Profile){const player=v66Player(career,button.dataset.v66Profile),owner=v66Owner(career,player.pid),contract=v66Contract(career,player.pid);v61ProfileReturn=button;v61ProfileDialog.innerHTML=`<div class="player-card-head"><div>${v61FlagSVG(player.nation)}<p class="eyebrow">${escapeHTML(v61CountryNames[player.nation])}</p><h2>${escapeHTML(player.name)}</h2><span>${v61PositionNames[player.line]} · ${player.age} Jahre · ${escapeHTML(owner?.name||'Vereinslos')}</span></div><button type="button" data-v61-close aria-label="Spielerprofil schließen">×</button></div><div class="player-card-facts"><span>Marktwert<b>${v66Credits(v66Value(player))}</b></span>${contract?`<span>Jahresgehalt<b>${v66Credits(contract.annual)}</b></span><span>Vertrag bis<b>Saison ${contract.endSeason}</b></span>`:''}</div><section><h3>Fähigkeiten</h3>${v55SkillGroupsHTML(player)}</section>`;v61ProfileDialog.querySelector('[data-v61-close]').onclick=()=>v61ProfileDialog.close();v61ProfileDialog.showModal();return}
  else if(button.dataset.v66Offer){v66MakeBid(career,career.manager.managedClubId,button.dataset.v66Offer,v61WorldScreen.querySelector('#v66-price').value,v61WorldScreen.querySelector('#v66-salary').value,v61WorldScreen.querySelector('#v66-years').value,v61WorldScreen.querySelector('#v66-promise').value);action=true}
  else if(button.dataset.v66Accept){v66RespondBid(career,button.dataset.v66Accept,true);action=true}
  else if(button.dataset.v66Reject){v66RespondBid(career,button.dataset.v66Reject,false);action=true}
  else if(button.dataset.v66Improve){const annual=v61WorldScreen.querySelector(`[data-v66-counter-salary="${CSS.escape(button.dataset.v66Improve)}"]`)?.value;v66ImproveBid(career,button.dataset.v66Improve,annual);action=true}
  else if(button.dataset.v66Renew){const pid=button.dataset.v66Renew,result=v66Renew(career,pid,v61WorldScreen.querySelector(`[data-v66-renew-salary="${CSS.escape(pid)}"]`)?.value,v61WorldScreen.querySelector(`[data-v66-renew-years="${CSS.escape(pid)}"]`)?.value,v61WorldScreen.querySelector(`[data-v66-renew-promise="${CSS.escape(pid)}"]`)?.value);if(!result.accepted)throw Error(`Spieler fordert mindestens ${v66Credits(result.counter)}. Ein verbessertes Angebot ist möglich.`);action=true}
  if(action){v64UiSave();v61RenderCareer(career);if(button.dataset.v66Select)v61WorldScreen.querySelector('#v66-offer')?.scrollIntoView({behavior:'smooth',block:'start'})}
 }catch(error){const target=v61WorldScreen.querySelector('#v66-message')||v61WorldScreen.querySelector('#v66-contract-message');if(target){target.textContent=error.message;target.scrollIntoView({behavior:'smooth',block:'center'})}}
});
const v66BaseOpenProfile=v61OpenProfile;
v61OpenProfile=function(pid,button){v66BaseOpenProfile(pid,button);if(!v61CurrentCareer)return;const contract=v66Contract(v61CurrentCareer,pid);if(!contract)return;const facts=v61ProfileDialog.querySelector('.player-card-facts');if(facts)facts.insertAdjacentHTML('beforeend',`<span>Vertrag bis<b>Saison ${contract.endSeason}</b></span><span>Jahresgehalt<b>${v66Credits(contract.annual)}</b></span>`)};
