'use strict';

let v67YouthView={line:'all',sort:'expires'};
let v67Busy=false;
function v67RunBusy(label,work){
 if(v67Busy)return;
 v67Busy=true;
 const indicator=document.createElement('div');indicator.className='v67-loading v67-loading-inline';indicator.setAttribute('role','status');indicator.innerHTML=`<span>${escapeHTML(label)}</span><span class="v67-loading-track" role="progressbar" aria-label="${escapeHTML(label)}"><span></span></span>`;
 v61WorldScreen.prepend(indicator);v58Button.disabled=true;
 requestAnimationFrame(()=>setTimeout(async()=>{
  try{await work()}catch(error){const target=v61WorldScreen.querySelector('#v67-transition-error')||v61WorldScreen.querySelector('.v61-career-nav');target?.insertAdjacentHTML('afterend',`<p class="v61-error" role="alert">${escapeHTML(error.message)}</p>`)}
  finally{indicator.remove();v67Busy=false;v58Refresh()}
 }));
}
function v67TransitionHTML(career){
 const transition=career.world.transition;if(!career.world.seasonFinished||!transition)return'';
 const own=v66Own(career),openOffers=transition.choice===null,limit=Math.max(0,Math.min(500,Math.floor(own.balance/50)*50));
 if(openOffers)return`<section class="v62-season v67-transition" id="v67-transition"><p class="eyebrow">Saisonwechsel</p><h2>Stellenangebote</h2><p>Dein Ruf: ${v63Grade(Math.max(1,Math.round(career.manager.reputation)))}. Diese Trainerstellen sind zum Saisonende vorläufig besetzt. Wähle einen Verein oder bleibe bei ${escapeHTML(own.name)}.</p><div class="v67-offers">${transition.offers.map(id=>{const club=v66Club(career,id);return`<article><div class="v67-offer-title">${v61CrestSVG(club)}<span><strong>${escapeHTML(club.name)}</strong><small>${v61FlagSVG(club.countryId)} ${escapeHTML(v61CountryNames[club.countryId])}</small></span></div><p>${escapeHTML(club.historyText)} · ${club.roster.length} Profis · ${v66Credits(club.balance)} Kassenstand</p><button type="button" class="menu-action" data-v67-offer="${escapeHTML(id)}">Verein übernehmen</button></article>`}).join('')}</div><button type="button" class="menu-action" data-v67-stay>Bei ${escapeHTML(own.name)} bleiben</button><p id="v67-transition-error" class="v61-error" role="alert"></p></section>`;
 return`<section class="v62-season v67-transition" id="v67-transition"><p class="eyebrow">Saisonwechsel</p><h2>Jugendbudget für Saison ${career.world.season+1}</h2><p>${transition.offers.length?transition.choice==='stay'?'Du bleibst bei deinem Verein.':`Du übernimmst ${escapeHTML(own.name)}.`:'Diesmal gibt es kein passendes Stellenangebot.'} Das Budget wird einmal zu Saisonbeginn aus dem Kassenstand bezahlt. Mehrjährige Förderung erhöht die Zahl und leicht die Chancen neuer Talente.</p><p>Verfügbar: ${v66Credits(own.balance)}</p><label class="v67-budget-label">Jahresbudget <strong id="v67-budget-value">${v66Credits(Math.min(200,limit))}</strong><input id="v67-budget" type="range" min="0" max="${limit}" step="50" value="${Math.min(200,limit)}"></label><button type="button" class="primary" data-v67-budget>Budget bestätigen und Saison starten</button><p id="v67-transition-error" class="v61-error" role="alert"></p></section>`;
}
function v67TransferReviewHTML(career){
 if(!career.world.seasonFinished)return'';
 const clubId=career.world.seasonReviewClubId||career.manager.managedClubId,completed=career.world.market.pendingBids.filter(item=>item.status==='completed'),groups=[['Zum Verein gekommen',completed.filter(item=>item.buyerId===clubId),'sellerId','Von'],['Verein verlassen',completed.filter(item=>item.sellerId===clubId),'buyerId','Zu']];
 return`<section class="v62-season v67-transfer-review"><p class="eyebrow">Saisonrückblick</p><h2>Transfers · Saison ${career.world.season}</h2><div class="v66-deadline-columns">${groups.map(([title,bids,otherKey,preposition])=>`<div><h3>${title} · ${bids.length}</h3>${bids.length?`<ul>${bids.map(bid=>`<li><span><strong>${escapeHTML(v66Player(career,bid.pid)?.name||bid.pid)}</strong><small>${preposition} ${escapeHTML(v66Club(career,bid[otherKey])?.name||'Vereinslos')}</small></span><strong>${bid.price?v66Credits(bid.price):'Ablösefrei'}</strong></li>`).join('')}</ul>`:'<p>Keine Wechsel.</p>'}</div>`).join('')}</div></section>`;
}
function v67YouthHTML(career){
 const club=v66Own(career),pool=club.youthPool.filter(player=>v67YouthView.line==='all'||player.line===v67YouthView.line);
 pool.sort((a,b)=>v67YouthView.sort==='age'?a.age-b.age||a.name.localeCompare(b.name):v67YouthView.sort==='value'?v66Value(b)-v66Value(a):a.expiresAfterSeason-b.expiresAfterSeason||a.name.localeCompare(b.name));
 return`<section class="v62-season v67-youth" id="v67-youth"><div class="v62-season-head"><div><p class="eyebrow">Vereinseigener Nachwuchs</p><h3>Nachwuchspool</h3><p>${club.youthPool.length} Kandidaten · Saisonbudget ${v66Credits(club.youthBudget)} · Profikader ${club.roster.length} / 14</p></div></div><p>Fähigkeiten sind im Profil als Farbstufen sichtbar. Entwicklung beginnt erst nach einer Übernahme durch tatsächliche Pflichtspieleinsätze.</p><div class="v67-filters"><label>Position<select id="v67-line"><option value="all">Alle Positionen</option>${Object.entries(v61PositionNames).map(([id,name])=>`<option value="${id}" ${v67YouthView.line===id?'selected':''}>${name}</option>`).join('')}</select></label><label>Sortierung<select id="v67-sort"><option value="expires" ${v67YouthView.sort==='expires'?'selected':''}>Ablauf zuerst</option><option value="age" ${v67YouthView.sort==='age'?'selected':''}>Jüngste zuerst</option><option value="value" ${v67YouthView.sort==='value'?'selected':''}>Marktwert zuerst</option></select></label></div><div class="v67-youth-list">${pool.map(player=>{const fee=v67Fee(player),annual=v66Salary(player),can=club.roster.length<14&&club.balance>=fee;return`<article><div><button type="button" class="v67-profile" data-v67-profile="${escapeHTML(player.pid)}">${v61FlagSVG(player.nation)} <strong>${escapeHTML(player.name)}</strong></button><small>${v61PositionNames[player.line]} · ${player.age} Jahre · bis Ende Saison ${player.expiresAfterSeason}</small><small>Ausbildungsentschädigung ${v66Credits(fee)} · Gehalt ${v66Credits(annual)} je Saison · ${14-club.roster.length} freie Kaderplätze</small></div><button type="button" class="menu-action" data-v67-promote="${escapeHTML(player.pid)}" ${can?'':'disabled'}>In den Profikader übernehmen</button></article>`}).join('')||'<p>Keine Kandidaten in dieser Auswahl.</p>'}</div><p id="v67-youth-error" class="v61-error" role="alert"></p></section>`;
}
function v67ManagerHistoryHTML(career){return`<section class="v62-season v67-manager"><h3>Managerlaufbahn</h3><p>Ruf: ${v63Grade(Math.max(1,Math.round(career.manager.reputation)))}</p><ul>${career.manager.stationHistory.map(job=>`<li>${escapeHTML(v66Club(career,job.clubId)?.name||job.clubId)} · ab Saison ${job.fromSeason}${job.toSeason?` bis Saison ${job.toSeason}`:''}</li>`).join('')}</ul></section>`}
function v67DecorateCareer(career){
 const overview=v61WorldScreen.querySelector('[data-v46-view="overview"]'),squad=v61WorldScreen.querySelector('[data-v46-view="squad"]'),club=v61WorldScreen.querySelector('[data-v46-view="club"]');
 if(!overview||!squad||!club)return;
 overview.insertAdjacentHTML('afterbegin',v67TransferReviewHTML(career)+v67TransitionHTML(career));
 squad.insertAdjacentHTML('beforeend',v67YouthHTML(career));
 club.insertAdjacentHTML('beforeend',v67ManagerHistoryHTML(career));
 v58Refresh();
}
const v67BaseRenderCareer=v61RenderCareer;
v61RenderCareer=function(career){v67BaseRenderCareer(career);if(!career.world.activeMatch)v67DecorateCareer(career)};
const v67BaseAdvanceCareer=v61AdvanceCareer;
v61AdvanceCareer=function(){
 if(!v61CurrentCareer||v61CurrentCareer.world.activeMatch)return v67BaseAdvanceCareer();
 v67RunBusy(v61CurrentCareer.world.seasonFinished?'Neue Saison wird vorbereitet …':'Spielkalender wird fortgesetzt …',async()=>{v67BaseAdvanceCareer();await v64UiSave()});
};
const v67BaseProgressState=v58State;
v58State=function(){
 const career=v61CurrentCareer;if(!career||v61WorldScreen.hidden||career.world.activeMatch)return v67BaseProgressState();
 const transition=career.world.transition;
 if(career.world.seasonFinished&&transition){
  if(transition.choice===null)return{context:`Saison ${career.world.season} abgeschlossen`,label:'Stellenangebote prüfen',action:'v67-offers'};
  if(transition.budget===null)return{context:`Saison ${career.world.season+1} vorbereiten`,label:'Jugendbudget festlegen',action:'v67-budget'};
 }
 return v67BaseProgressState();
};
const v67BaseProgressClick=v58Button.onclick;
v58Button.onclick=function(){const action=v58State()?.action;if(action==='v67-offers'||action==='v67-budget'){v61SetCareerTab('overview');v61WorldScreen.querySelector('#v67-transition')?.scrollIntoView({behavior:'smooth',block:'start'});return}return v67BaseProgressClick()};
v61WorldScreen.addEventListener('input',event=>{if(event.target.id==='v67-budget'){const output=v61WorldScreen.querySelector('#v67-budget-value');if(output)output.textContent=v66Credits(Number(event.target.value))}});
v61WorldScreen.addEventListener('change',event=>{if(event.target.id==='v67-line'){v67YouthView.line=event.target.value;v61RenderCareer(v61CurrentCareer)}else if(event.target.id==='v67-sort'){v67YouthView.sort=event.target.value;v61RenderCareer(v61CurrentCareer)}});
v61WorldScreen.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||!v61CurrentCareer||v61CurrentCareer.world.activeMatch)return;
 const career=v61CurrentCareer;
 try{
  if(button.hasAttribute('data-v67-stay')||button.hasAttribute('data-v67-offer')){const clubId=button.dataset.v67Offer||null;v67RunBusy('Managerentscheidung wird gespeichert …',async()=>{v67ChooseOffer(career,clubId);await v64UiSave();v61RenderCareer(career)});return}
  if(button.hasAttribute('data-v67-budget')){const amount=v61WorldScreen.querySelector('#v67-budget')?.value;v67RunBusy('Neue Saison wird vorbereitet …',async()=>{v67SetBudget(career,amount);await v64UiSave();v62NextSeason(career);await v64UiSave();v61CareerTab='overview';v61RenderCareer(career)});return}
  if(button.hasAttribute('data-v67-promote')){const pid=button.dataset.v67Promote;v67RunBusy('Nachwuchsübernahme wird gespeichert …',async()=>{v67Promote(career,career.manager.managedClubId,pid);await v64UiSave();v61RenderCareer(career)});return}
  if(button.hasAttribute('data-v67-profile')){
   const player=v66Own(career).youthPool.find(item=>item.pid===button.dataset.v67Profile);if(!player)return;
   v61ProfileReturn=button;
   v61ProfileDialog.innerHTML=`<div class="player-card-head"><div>${v61FlagSVG(player.nation)}<p class="eyebrow">Nachwuchskandidat</p><h2>${escapeHTML(player.name)}</h2><span>${v61PositionNames[player.line]} · ${player.age} Jahre</span></div><button type="button" data-v61-close aria-label="Spielerprofil schließen">×</button></div><div class="player-card-facts"><span>Ausbildungsentschädigung<b>${v66Credits(v67Fee(player))}</b></span><span>Künftiges Jahresgehalt<b>${v66Credits(v66Salary(player))}</b></span><span>Verfügbar bis<b>Ende Saison ${player.expiresAfterSeason}</b></span></div><section><h3>Fähigkeiten</h3>${v55SkillGroupsHTML(player)}</section>`;
   v61ProfileDialog.querySelector('[data-v61-close]').onclick=()=>v61ProfileDialog.close();v61ProfileDialog.showModal();return;
  }
 }catch(error){const target=v61WorldScreen.querySelector(button.hasAttribute('data-v67-promote')?'#v67-youth-error':'#v67-transition-error');if(target){target.textContent=error.message;target.scrollIntoView({behavior:'smooth',block:'center'})}}
});
