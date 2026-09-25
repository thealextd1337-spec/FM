'use strict';

let v67YouthView={line:'all',sort:'expires'};
let v67Busy=false;
let v67PromoteDialog=null;
function v67ShowPromoteDialog(player,fee){
 if(!v67PromoteDialog){
  v67PromoteDialog=document.createElement('dialog');v67PromoteDialog.className='v72-transfer-dialog v67-promote-dialog';document.body.append(v67PromoteDialog);
  v67PromoteDialog.addEventListener('click',event=>{if(event.target.closest('[data-v67-promote-close]'))v67PromoteDialog.close()});
 }
 v67PromoteDialog.innerHTML=`<div class="v72-dialog-head"><h2>Neu im Profikader</h2><button type="button" data-v67-promote-close aria-label="Bestätigung schließen">×</button></div><p><strong>${escapeHTML(player.name)}</strong> wurde in den Profikader aufgenommen.</p><p>Ausbildungsentschädigung: ${v66Credits(fee)}. Der Spieler ist jetzt im Kader verfügbar.</p><button type="button" class="primary" data-v67-promote-close>Zum Kader</button>`;
 v67PromoteDialog.showModal();
}
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
const v67ReviewTitles=['Deine Saison','Spieler der Saison','Pokale & Awards','Meister der anderen Ligen'];
function v67ReviewPlayers(career,clubId){
 const season=career.world.season,players=[...career.world.clubs.flatMap(club=>club.roster),...career.world.market.freePlayers];
 return players.map(player=>({player,games:(player.history||[]).filter(item=>item.season===season&&item.clubId===clubId)})).filter(item=>item.games.length).map(({player,games})=>({player,appearances:games.length,minutes:games.reduce((sum,item)=>sum+item.minutes,0),goals:games.reduce((sum,item)=>sum+item.goals,0),assists:games.reduce((sum,item)=>sum+item.assists,0)})).sort((a,b)=>b.goals-a.goals||b.assists-a.assists||b.minutes-a.minutes||a.player.name.localeCompare(b.player.name));
}
function v67ReviewPage(career,step){
 const season=career.world.season,own=v66Own(career),competitions=v62Current(career),league=competitions.find(item=>item.type==='league'&&item.country===own.countryId),cup=competitions.find(item=>item.type==='cup'&&item.country===own.countryId),europe=competitions.find(item=>item.type==='europe'),players=v67ReviewPlayers(career,own.id);
 if(step===0){
  const rank=v62Table(league,league.fixtures.flatMap(item=>[item.homeId,item.awayId]).filter((id,index,array)=>array.indexOf(id)===index)),place=rank.findIndex(item=>item.clubId===own.id)+1;
  const result=(competition,label)=>{const fixtures=competition.fixtures.filter(item=>item.result&&(item.homeId===own.id||item.awayId===own.id)),wins=fixtures.filter(item=>item.result.winnerId===own.id||!item.result.winnerId&&(item.homeId===own.id?item.result.homeGoals>item.result.awayGoals:item.result.awayGoals>item.result.homeGoals)).length,draws=fixtures.filter(item=>item.result.homeGoals===item.result.awayGoals&&!item.result.winnerId).length;return`<article><small>${label}</small><strong>${competition.winnerId===own.id?'🏆 Titel':competition.type==='league'?`Platz ${place} von ${rank.length}`:competition.type==='europe'&&europe.entrants.includes(own.id)?'Teilgenommen':fixtures.length?'Ausgeschieden':'Nicht qualifiziert'}</strong><span>${fixtures.length} Spiele · ${wins} Siege · ${draws} Remis</span></article>`};
  return`<div class="v67-show-grid">${result(league,'Liga')}${result(cup,'Nationaler Pokal')}${result(europe,'Europacup')}</div><p>Die letzte Partie ist gespielt. Hier siehst du, was dein Verein in Saison ${season} erreicht hat.</p>`;
 }
 if(step===1)return`<p>Pflichtspiele für ${escapeHTML(own.name)} in Saison ${season}.</p><div class="v67-show-table-wrap"><table class="v67-show-table"><thead><tr><th>Spieler</th><th>Sp.</th><th>Min.</th><th>Tore</th><th>Vorlagen</th></tr></thead><tbody>${players.map(item=>`<tr><th><button type="button" class="player-link" data-v68-player="${escapeHTML(item.player.pid)}">${escapeHTML(item.player.name)}</button></th><td>${item.appearances}</td><td>${item.minutes}</td><td>${item.goals}</td><td>${item.assists}</td></tr>`).join('')}</tbody></table></div>`;
 if(step===2){
  const trophies=competitions.filter(item=>item.winnerId===own.id),awardWinners=[...career.world.clubs.flatMap(club=>club.roster),...career.world.market.freePlayers].flatMap(player=>(player.honours||[]).filter(item=>item.season===season&&item.clubId===own.id&&item.kind!=='title').map(item=>({player,item})));
  const card=(title,detail,country,kind)=>`<article class="v67-award">${v62AwardIcon(country,kind)}<div><strong>${title}</strong><small>${detail}</small></div></article>`;
  return`<div class="v67-awards"><h3>Pokale für deinen Verein</h3>${trophies.length?trophies.map(item=>card(item.type==='league'?'Meisterschaft':item.type==='cup'?'Nationaler Pokal':'Europacup',escapeHTML(own.name),item.country,item.type)).join(''):'<p>In dieser Saison gab es keinen Mannschaftspokal.</p>'}<h3>Persönliche Awards</h3>${awardWinners.length?awardWinners.map(({player,item})=>card(escapeHTML(v74HonourLabel(item)),escapeHTML(player.name),career.world.competitions.find(entry=>entry.id===item.competitionId)?.country,item.kind)).join(''):'<p>In dieser Saison ging kein persönlicher Award an deinen Verein.</p>'}</div>`;
 }
 const other=competitions.filter(item=>item.type==='league'&&item.country!==own.countryId).sort((a,b)=>v61CountryNames[a.country].localeCompare(v61CountryNames[b.country],'de'));
 return`<p>Die Meisterschaften der übrigen fünf Länder in Saison ${season}.</p><div class="v67-show-winners">${other.map(item=>{const winner=career.world.clubs.find(club=>club.id===item.winnerId),table=v62Table(item,item.fixtures.flatMap(fixture=>[fixture.homeId,fixture.awayId]).filter((id,index,array)=>array.indexOf(id)===index)),points=table.find(row=>row.clubId===item.winnerId)?.points??0;return`<article>${v61FlagSVG(item.country)}<span>${escapeHTML(v61CountryNames[item.country])}</span>${winner?v61CrestSVG(winner):''}<strong>${escapeHTML(winner?.name||'Noch offen')}</strong><small>${points} Punkte</small></article>`}).join('')}</div>`;
}
function v67SeasonShowHTML(career){
 const step=career.world.transition.reviewStep;
 return`<section class="v62-season v67-season-show" id="v67-season-show"><p class="eyebrow">Saison ${career.world.season} · Rückblick</p><div class="v67-show-progress" aria-label="Seite ${step+1} von 4">${v67ReviewTitles.map((_,index)=>`<span class="${index<=step?'active':''}"></span>`).join('')}</div><h2 tabindex="-1">${v67ReviewTitles[step]}</h2>${v67ReviewPage(career,step)}<div class="v67-show-actions">${step?'<button type="button" class="menu-action" data-v67-review-back>Zurück</button>':''}<button type="button" class="primary" data-v67-review-next>${step===3?'Zum Saisonwechsel':'Weiter'} →</button></div><p id="v67-transition-error" class="v61-error" role="alert"></p></section>`;
}
function v67TransitionHTML(career){
 const transition=career.world.transition;if(!career.world.seasonFinished||!transition)return'';
 if((transition.reviewStep??4)<4)return v67SeasonShowHTML(career);
 const own=v66Own(career),openOffers=transition.choice===null,limit=v67BudgetLimit(own);
 if(openOffers)return`<section class="v62-season v67-transition" id="v67-transition"><p class="eyebrow">Saisonwechsel</p><h2>Stellenangebote</h2><p>Dein Ruf: ${v63Grade(Math.max(1,Math.round(career.manager.reputation)))}. Diese Trainerstellen sind zum Saisonende vorläufig besetzt. Wähle einen Verein oder bleibe bei ${escapeHTML(own.name)}.</p><div class="v67-offers">${transition.offers.map(id=>{const club=v66Club(career,id);return`<article><div class="v67-offer-title">${v61CrestSVG(club)}<span><strong>${escapeHTML(club.name)}</strong><small>${v61FlagSVG(club.countryId)} ${escapeHTML(v61CountryNames[club.countryId])}</small></span></div><p>${escapeHTML(club.historyText)} · ${club.roster.length} Profis · ${v66Credits(club.balance)} Kassenstand</p><button type="button" class="menu-action" data-v67-offer="${escapeHTML(id)}">Verein übernehmen</button></article>`}).join('')}</div><button type="button" class="menu-action" data-v67-stay>Bei ${escapeHTML(own.name)} bleiben</button><p id="v67-transition-error" class="v61-error" role="alert"></p></section>`;
 return`<section class="v62-season v67-transition" id="v67-transition"><p class="eyebrow">Saisonwechsel</p><h2>Jugendbudget für Saison ${career.world.season+1}</h2><p>${transition.offers.length?transition.choice==='stay'?'Du bleibst bei deinem Verein.':`Du übernimmst ${escapeHTML(own.name)}.`:'Diesmal gibt es kein passendes Stellenangebot.'} Das Budget wird einmal zu Saisonbeginn aus dem Kassenstand bezahlt. Mehrjährige Förderung erhöht die Zahl und die Chance auf stärkere Talente, ohne einen Fund zu garantieren.</p><p>Verfügbar: ${v66Credits(own.balance)} · Maximal investierbar: ${v66Credits(limit)}</p><label class="v67-budget-label">Jahresbudget <strong id="v67-budget-value">${v66Credits(Math.min(200,limit))}</strong><input id="v67-budget" type="range" min="0" max="${limit}" step="50" value="${Math.min(200,limit)}"></label><button type="button" class="primary" data-v67-budget>Budget bestätigen und Saison starten</button><p id="v67-transition-error" class="v61-error" role="alert"></p></section>`;
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
 overview.classList.toggle('v67-showing',Boolean(career.world.seasonFinished&&career.world.transition?.reviewStep<4));
 overview.insertAdjacentHTML('afterbegin',v67TransitionHTML(career)+v67TransferReviewHTML(career));
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
  if((transition.reviewStep??4)<4)return{context:`Saison ${career.world.season} · Rückblick ${transition.reviewStep+1} von 4`,label:transition.reviewStep===3?'Zum Saisonwechsel':'Weiter',action:'v67-review'};
  if(transition.choice===null)return{context:`Saison ${career.world.season} abgeschlossen`,label:'Stellenangebote prüfen',action:'v67-offers'};
  if(transition.budget===null)return{context:`Saison ${career.world.season+1} vorbereiten`,label:'Jugendbudget festlegen',action:'v67-budget'};
 }
 return v67BaseProgressState();
};
const v67BaseProgressClick=v58Button.onclick;
v58Button.onclick=function(){const action=v58State()?.action;if(action==='v67-review'){v67ReviewAdvance(1);return}if(action==='v67-offers'||action==='v67-budget'){v61SetCareerTab('overview');v61WorldScreen.querySelector('#v67-transition')?.scrollIntoView({behavior:'smooth',block:'start'});return}return v67BaseProgressClick()};
async function v67ReviewAdvance(direction){
 const career=v61CurrentCareer,transition=career?.world.transition;if(!transition||v67Busy||transition.reviewStep>=4)return;
 const previous=transition.reviewStep;transition.reviewStep=Math.max(0,Math.min(4,previous+direction));v67Busy=true;
 try{await v64UiSave();v61SetCareerTab('overview');v61RenderCareer(career);window.scrollTo(0,0);v61WorldScreen.querySelector('#v67-season-show h2,#v67-transition h2')?.focus({preventScroll:true})}
 catch(error){transition.reviewStep=previous;v61WorldScreen.querySelector('#v67-transition-error').textContent=error.message}
 finally{v67Busy=false}
}
v61WorldScreen.addEventListener('input',event=>{if(event.target.id==='v67-budget'){const output=v61WorldScreen.querySelector('#v67-budget-value');if(output)output.textContent=v66Credits(Number(event.target.value))}});
v61WorldScreen.addEventListener('change',event=>{if(event.target.id==='v67-line'){v67YouthView.line=event.target.value;v61RenderCareer(v61CurrentCareer)}else if(event.target.id==='v67-sort'){v67YouthView.sort=event.target.value;v61RenderCareer(v61CurrentCareer)}});
v61WorldScreen.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||!v61CurrentCareer||v61CurrentCareer.world.activeMatch)return;
 const career=v61CurrentCareer;
 try{
  if(button.hasAttribute('data-v67-review-next')){v67ReviewAdvance(1);return}
  if(button.hasAttribute('data-v67-review-back')){v67ReviewAdvance(-1);return}
  if(button.hasAttribute('data-v67-stay')||button.hasAttribute('data-v67-offer')){const clubId=button.dataset.v67Offer||null;v67RunBusy('Managerentscheidung wird gespeichert …',async()=>{v67ChooseOffer(career,clubId);await v64UiSave();v61RenderCareer(career)});return}
  if(button.hasAttribute('data-v67-budget')){const amount=v61WorldScreen.querySelector('#v67-budget')?.value;v67RunBusy('Neue Saison wird vorbereitet …',async()=>{v67SetBudget(career,amount);await v64UiSave();v62NextSeason(career);await v64UiSave();v61CareerTab='overview';v61RenderCareer(career)});return}
  if(button.hasAttribute('data-v67-promote')){const pid=button.dataset.v67Promote;v67RunBusy('Nachwuchsübernahme wird gespeichert …',async()=>{const player=v66Own(career).youthPool.find(item=>item.pid===pid),fee=v67Fee(player);v67Promote(career,career.manager.managedClubId,pid);await v64UiSave();v61RenderCareer(career);v67ShowPromoteDialog(player,fee)});return}
  if(button.hasAttribute('data-v67-profile')){
   const player=v66Own(career).youthPool.find(item=>item.pid===button.dataset.v67Profile);if(!player)return;
   v61ProfileReturn=button;
   v61ProfileDialog.innerHTML=`<div class="player-card-head"><div>${v61FlagSVG(player.nation)}<p class="eyebrow">Nachwuchskandidat</p><h2>${escapeHTML(player.name)}</h2><span>${v61PositionNames[player.line]} · ${player.age} Jahre</span></div><button type="button" data-v61-close aria-label="Spielerprofil schließen">×</button></div><div class="player-card-facts"><span>Ausbildungsentschädigung<b>${v66Credits(v67Fee(player))}</b></span><span>Künftiges Jahresgehalt<b>${v66Credits(v66Salary(player))}</b></span><span>Verfügbar bis<b>Ende Saison ${player.expiresAfterSeason}</b></span></div><section><h3>Fähigkeiten</h3>${v55SkillGroupsHTML(player)}</section>`;
   v61ProfileDialog.querySelector('[data-v61-close]').onclick=()=>v61ProfileDialog.close();v61ProfileDialog.showModal();return;
  }
 }catch(error){const target=v61WorldScreen.querySelector(button.hasAttribute('data-v67-promote')?'#v67-youth-error':'#v67-transition-error');if(target){target.textContent=error.message;target.scrollIntoView({behavior:'smooth',block:'center'})}}
});
