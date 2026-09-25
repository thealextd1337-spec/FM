'use strict';

let v67YouthView={line:'all',sort:'expires'};
let v67Busy=false;
let v67PromoteDialog=null;
let v67ContractReminderDialog=null;
function v67MaybeContractReminder(career){
 if(career.world.activeMatch||career.world.seasonFinished||career.world.market.phase!=='closed'||career.world.contractReminderSeason===career.world.season)return;
 const own=v66Own(career),league=v62Current(career).find(item=>item.type==='league'&&item.country===own.countryId),played=league.fixtures.filter(item=>item.result&&(item.homeId===own.id||item.awayId===own.id)).length;
 if(played!==8)return;
 career.world.contractReminderSeason=career.world.season;
 const expiring=career.world.contracts.filter(item=>item.clubId===own.id&&item.endSeason===career.world.season);
 Promise.resolve(v64UiSave()).then(()=>{
  if(!expiring.length||v61CurrentCareer!==career||career.world.activeMatch)return;
  if(!v67ContractReminderDialog){
   v67ContractReminderDialog=document.createElement('dialog');v67ContractReminderDialog.className='v72-transfer-dialog v67-contract-reminder';document.body.append(v67ContractReminderDialog);
   v67ContractReminderDialog.addEventListener('click',event=>{if(event.target.closest('[data-v67-contract-dismiss]'))v67ContractReminderDialog.close();if(event.target.closest('[data-v67-contract-open]')){v67ContractReminderDialog.close();v61SetCareerTab('squad');v61WorldScreen.querySelector('.v66-contracts')?.scrollIntoView({behavior:'smooth',block:'start'})}});
  }
  v67ContractReminderDialog.innerHTML=`<div class="v72-dialog-head"><h2>Verträge prüfen</h2><button type="button" data-v67-contract-dismiss aria-label="Erinnerung schließen">×</button></div><p>Nach dem 8. Ligaspieltag laufen ${expiring.length} ${expiring.length===1?'Vertrag':'Verträge'} deines Vereins zum Saisonende aus. Du kannst jetzt noch Verlängerungen verhandeln.</p><div class="v67-contract-reminder-actions"><button type="button" class="menu-action" data-v67-contract-dismiss>Später</button><button type="button" class="primary" data-v67-contract-open>Zu den Verträgen →</button></div>`;
  v67ContractReminderDialog.showModal();
 }).catch(()=>{career.world.contractReminderSeason=null});
}
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
const v67ReviewTitles=['Deine Saison','Kaderübersicht','Pokale & Awards','Saisonübersicht'];
function v67ReviewPlayers(career,clubId){
 const season=career.world.season,players=[...career.world.clubs.flatMap(club=>club.roster),...career.world.market.freePlayers];
 const order={gk:0,def:1,mid:2,att:3};
 return players.map(player=>({player,games:(player.history||[]).filter(item=>item.season===season&&item.clubId===clubId)})).filter(item=>item.games.length).map(({player,games})=>({player,appearances:games.length,minutes:games.reduce((sum,item)=>sum+item.minutes,0),goals:games.reduce((sum,item)=>sum+item.goals,0),assists:games.reduce((sum,item)=>sum+item.assists,0)})).sort((a,b)=>(order[a.player.line]??4)-(order[b.player.line]??4)||b.appearances-a.appearances||a.player.name.localeCompare(b.player.name));
}
function v67ReviewDecider(career,competition,clubId){
 const games=competition.fixtures.filter(item=>item.result&&(item.homeId===clubId||item.awayId===clubId)).sort((a,b)=>a.day-b.day),last=games.at(-1);
 if(!last)return competition.type==='europe'?'Nicht qualifiziert':'Keine Partie';
 const home=last.homeId===clubId,opponent=v66Club(career,home?last.awayId:last.homeId),result=last.result,score=`${home?result.homeGoals:result.awayGoals}:${home?result.awayGoals:result.homeGoals}${result.penalties?` · i. E. ${home?result.penalties.join(':'):[...result.penalties].reverse().join(':')}`:''}`;
 if(competition.type==='cup')return`${{QF:'Viertelfinale',SF:'Halbfinale',F:'Finale'}[last.round]||last.round}: ${score} gegen ${opponent?.name||'Gegner'}`;
 if(['QF','SF','F'].includes(last.round)){
  const aggregate=result.aggregate?` · gesamt ${home?result.aggregate.join(':'):[...result.aggregate].reverse().join(':')}`:'';
  return`${{QF:'Viertelfinale',SF:'Halbfinale',F:'Finale'}[last.round]}: ${score}${aggregate} gegen ${opponent?.name||'Gegner'}`;
 }
 const ranking=v62Table(competition,competition.entrants),place=ranking.findIndex(item=>item.clubId===clubId)+1;
 return`Nach der Ligaphase · Platz ${place} von ${ranking.length} · zuletzt ${score} gegen ${opponent?.name||'Gegner'}`;
}
function v67SeasonDeparturesHTML(career,clubId,season){
 const departures=career.world.transfers.filter(item=>item.season===season&&item.sellerId===clubId&&item.reason==='Vertragsende');
 const retirements=(career.world.retirements||[]).filter(item=>item.season===season&&item.clubId===clubId);
 if(!departures.length&&!retirements.length)return'';
 return`<section class="v67-season-departures"><h3>Veränderungen zum Saisonende</h3><ul>${departures.map(item=>`<li><strong>${escapeHTML(item.playerName)}</strong><span>Vertrag beendet · verlässt den Verein ablösefrei</span></li>`).join('')}${retirements.map(item=>`<li><strong>${escapeHTML(item.name)}</strong><span>Karriere beendet · ${escapeHTML(item.reason)}</span></li>`).join('')}</ul></section>`;
}
function v67ReviewPage(career,step){
 const season=career.world.season,own=v66Own(career),competitions=v62Current(career),league=competitions.find(item=>item.type==='league'&&item.country===own.countryId),cup=competitions.find(item=>item.type==='cup'&&item.country===own.countryId),europe=competitions.find(item=>item.type==='europe'),players=v67ReviewPlayers(career,own.id);
 if(step===0){
  const rank=v62Table(league,league.fixtures.flatMap(item=>[item.homeId,item.awayId]).filter((id,index,array)=>array.indexOf(id)===index)),place=rank.findIndex(item=>item.clubId===own.id)+1;
  const result=(competition,label)=>{const fixtures=competition.fixtures.filter(item=>item.result&&(item.homeId===own.id||item.awayId===own.id)),wins=fixtures.filter(item=>item.result.winnerId===own.id||!item.result.winnerId&&(item.homeId===own.id?item.result.homeGoals>item.result.awayGoals:item.result.awayGoals>item.result.homeGoals)).length,draws=fixtures.filter(item=>item.result.homeGoals===item.result.awayGoals&&!item.result.winnerId).length,losses=fixtures.length-wins-draws;return`<article><small>${label}</small><strong>${competition.winnerId===own.id?'🏆 Titel':competition.type==='league'?`Platz ${place} von ${rank.length}`:competition.type==='europe'&&europe.entrants.includes(own.id)?'Teilgenommen':fixtures.length?'Ausgeschieden':'Nicht qualifiziert'}</strong><span>${fixtures.length} ${fixtures.length===1?'Spiel':'Spiele'} · ${wins} ${wins===1?'Sieg':'Siege'} · ${draws} Remis · ${losses} ${losses===1?'Niederlage':'Niederlagen'}</span>${competition.type!=='league'&&fixtures.length?`<em>${escapeHTML(v67ReviewDecider(career,competition,own.id))}</em>`:''}</article>`};
  return`<div class="v67-show-grid">${result(league,'Liga')}${result(cup,'Nationaler Pokal')}${result(europe,'Europacup')}</div><p>Die letzte Partie ist gespielt. Hier siehst du, was dein Verein in Saison ${season} erreicht hat.</p>${v67SeasonDeparturesHTML(career,own.id,season)}`;
 }
 if(step===1)return`<p>Alle eingesetzten Spieler von ${escapeHTML(own.name)} in Saison ${season}, nach Position geordnet.</p><div class="v67-show-table-wrap"><table class="v67-show-table"><thead><tr><th>Spieler</th><th>Land</th><th>Position</th><th>Alter</th><th>Sp.</th><th>Min.</th><th>Tore</th><th>Vorlagen</th></tr></thead><tbody>${players.map(item=>`<tr><th scope="row"><button type="button" class="player-link" data-v68-player="${escapeHTML(item.player.pid)}">${escapeHTML(item.player.name)}</button></th><td><span class="v67-show-nation" aria-label="${escapeHTML(v61CountryNames[item.player.nation]||item.player.nation)}">${v61FlagSVG(item.player.nation)}</span></td><td>${escapeHTML(v61PositionNames[item.player.line])}</td><td>${item.player.age}</td><td>${item.appearances}</td><td>${item.minutes}</td><td>${item.goals}</td><td>${item.assists}</td></tr>`).join('')}</tbody></table></div>`;
 if(step===2){
  const trophies=competitions.filter(item=>item.winnerId===own.id),awardWinners=[...career.world.clubs.flatMap(club=>club.roster),...career.world.market.freePlayers].flatMap(player=>(player.honours||[]).filter(item=>item.season===season&&item.clubId===own.id&&item.kind!=='title').map(item=>({player,item})));
  const card=(title,detail,country,kind)=>`<article class="v67-award">${v62AwardIcon(country,kind)}<div><strong>${title}</strong><small>${detail}</small></div></article>`;
  const rank=v62Table(league,[...new Set(league.fixtures.flatMap(item=>[item.homeId,item.awayId]))]),place=rank.findIndex(item=>item.clubId===own.id)+1;
  const outcome=competition=>{const label=competition.type==='league'?'Meisterschaft':competition.type==='cup'?'Nationaler Pokal':'Europacup',detail=competition.winnerId===own.id?'Titel gewonnen':competition.type==='league'?`Platz ${place} von ${rank.length}`:v67ReviewDecider(career,competition,own.id);return card(label,escapeHTML(detail),competition.country,competition.type)};
  const awardDetail=({player,item})=>{const competition=competitions.find(entry=>entry.id===item.competitionId),fixture=competition?.fixtures.find(entry=>entry.id===item.fixtureId),round=fixture?.round,label=round?competition.type==='league'||competition.type==='europe'&&round.startsWith('R')?`Spieltag ${round.slice(1)}`:({QF:'Viertelfinale',SF:'Halbfinale',F:'Finale'}[round]||round):null;return card(escapeHTML(v74HonourLabel(item)),`${escapeHTML(player.name)}${label?` · ${escapeHTML(label)}`:''}`,item.kind==='man-of-the-match'?null:competition?.country,item.kind)};
  return`<div class="v67-awards"><h3>Deine Wettbewerbe</h3>${[league,cup,europe].map(outcome).join('')}${trophies.length?`<p>${trophies.length} ${trophies.length===1?'Mannschaftspokal':'Mannschaftspokale'} gewonnen.</p>`:''}<h3>Persönliche Awards</h3>${awardWinners.length?awardWinners.map(awardDetail).join(''):'<p>In dieser Saison ging kein persönlicher Award an deinen Verein.</p>'}</div>`;
 }
 const leagues=competitions.filter(item=>item.type==='league').sort((a,b)=>v61CountryNames[a.country].localeCompare(v61CountryNames[b.country],'de'));
 const rankings=v74LeagueRankings(career,league);
 const podium=(title,kind,entries)=>`<section class="v67-league-podium"><h4>${v62AwardIcon(own.countryId,kind)} ${title}</h4>${entries.length?`<ol>${entries.slice(0,3).map((entry,index)=>{const club=v66Club(career,entry.games.at(-1).clubId);return`<li><b>${index+1}.</b><span><button type="button" class="player-link" data-v68-player="${escapeHTML(entry.player.pid)}">${escapeHTML(entry.player.name)}</button><small>${escapeHTML(club?.name||'Vereinslos')}</small></span><strong>${kind==='top-scorer'?`${entry.goals} ${entry.goals===1?'Tor':'Tore'}`:`Ø ${v67AverageRating(entry.ratings)} · ${entry.goals} T · ${entry.assists} V`}</strong></li>`}).join('')}</ol>`:'<p>Keine qualifizierten Spieler.</p>'}</section>`;
 const winnerLine=(item,label)=>{const club=v66Club(career,item?.winnerId);return`<div class="v67-winner-line">${v62AwardIcon(item?.country,item?.type||'europe')}<span><small>${label}</small><strong>${escapeHTML(club?.name||'Noch offen')}</strong></span>${club?v61CrestSVG(club):''}</div>`};
 return`<section class="v67-own-league"><h3>${v62LeagueLabel(own.countryId)} · Deine Liga</h3><div class="v67-own-league-titles">${winnerLine(league,'Meister')}${winnerLine(cup,'Pokalsieger')}</div><div class="v67-league-podiums">${podium('Torschützenkönig · Top 3', 'top-scorer',rankings.scorers)}${podium('Spieler der Saison · Top 3','player-of-season',rankings.best)}</div><p>Rangfolge der Spieler der Saison: Durchschnittsnote, Tore und Vorlagen. Mindestens drei Einsätze und 135 Minuten.</p></section><h3>Weitere Sieger · Saison ${season}</h3><div class="v67-show-winners">${leagues.filter(item=>item.country!==own.countryId).map(item=>{const nationalCup=competitions.find(entry=>entry.type==='cup'&&entry.country===item.country);return`<article><div class="v67-winner-country">${v61FlagSVG(item.country)}<span>${escapeHTML(v61CountryNames[item.country])}</span></div>${winnerLine(item,'Meister')}${winnerLine(nationalCup,'Pokalsieger')}</article>`}).join('')}<article class="v67-europe-winner"><div class="v67-winner-country">Europacup</div>${winnerLine(europe,'Europacupsieger')}</article></div>`;
}
function v67AverageRating(ratings){return(ratings.reduce((sum,value)=>sum+value,0)/ratings.length).toFixed(1).replace('.',',')}
function v67SeasonShowHTML(career){
 const step=career.world.transition.reviewStep;
 return`<section class="v62-season v67-season-show" id="v67-season-show"><p class="eyebrow">Saison ${career.world.season} · Rückblick</p><div class="v67-show-progress" aria-label="Seite ${step+1} von 4">${v67ReviewTitles.map((_,index)=>`<span class="${index<=step?'active':''}"></span>`).join('')}</div><div class="v67-show-title">${v61CrestSVG(v66Own(career))}<h2 tabindex="-1">${v67ReviewTitles[step]}</h2></div>${v67ReviewPage(career,step)}<div class="v67-show-actions">${step?'<button type="button" class="menu-action" data-v67-review-back>Zurück</button>':''}<button type="button" class="primary" data-v67-review-next>${step===3?'Zum Saisonwechsel':'Weiter'} →</button></div><p id="v67-transition-error" class="v61-error" role="alert"></p></section>`;
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
 return`<section class="v62-season v67-youth" id="v67-youth"><div class="v62-season-head"><div><p class="eyebrow">Vereinseigener Nachwuchs</p><h3>Nachwuchspool</h3><p>${club.youthPool.length} ${club.youthPool.length===1?'Kandidat':'Kandidaten'} · Saisonbudget ${v66Credits(club.youthBudget)} · Profikader ${club.roster.length} / 14</p></div></div><p>Fähigkeiten sind im Profil als Farbstufen sichtbar. Entwicklung beginnt erst nach einer Übernahme durch tatsächliche Pflichtspieleinsätze.</p><div class="v67-filters"><label>Position<select id="v67-line"><option value="all">Alle Positionen</option>${Object.entries(v61PositionNames).map(([id,name])=>`<option value="${id}" ${v67YouthView.line===id?'selected':''}>${name}</option>`).join('')}</select></label><label>Sortierung<select id="v67-sort"><option value="expires" ${v67YouthView.sort==='expires'?'selected':''}>Ablauf zuerst</option><option value="age" ${v67YouthView.sort==='age'?'selected':''}>Jüngste zuerst</option><option value="value" ${v67YouthView.sort==='value'?'selected':''}>Marktwert zuerst</option></select></label></div><div class="v67-youth-list">${pool.map(player=>{const fee=v67Fee(player),annual=v66Salary(player),can=club.roster.length<14&&club.balance>=fee;return`<article><div><button type="button" class="v67-profile" data-v67-profile="${escapeHTML(player.pid)}">${v61FlagSVG(player.nation)} <strong>${escapeHTML(player.name)}</strong></button><small>${v61PositionNames[player.line]} · ${player.age} Jahre · bis Ende Saison ${player.expiresAfterSeason}</small><small>Ausbildungsentschädigung ${v66Credits(fee)} · Gehalt ${v66Credits(annual)} je Saison · ${14-club.roster.length} ${club.roster.length===13?'freier Kaderplatz':'freie Kaderplätze'}</small></div><button type="button" class="menu-action" data-v67-promote="${escapeHTML(player.pid)}" ${can?'':'disabled'}>In den Profikader übernehmen</button></article>`}).join('')||'<p>Keine Kandidaten in dieser Auswahl.</p>'}</div><p id="v67-youth-error" class="v61-error" role="alert"></p></section>`;
}
function v67ManagerHistoryHTML(career){return`<section class="v62-season v67-manager"><h3>Managerlaufbahn</h3><p>Ruf: ${v63Grade(Math.max(1,Math.round(career.manager.reputation)))}</p><ul>${career.manager.stationHistory.map(job=>`<li>${escapeHTML(v66Club(career,job.clubId)?.name||job.clubId)} · ab Saison ${job.fromSeason}${job.toSeason?` bis Saison ${job.toSeason}`:''}</li>`).join('')}</ul></section>`}
function v67DecorateCareer(career){
 const overview=v61WorldScreen.querySelector('[data-v46-view="overview"]'),squad=v61WorldScreen.querySelector('[data-v46-view="squad"]'),club=v61WorldScreen.querySelector('[data-v46-view="club"]');
 if(!overview||!squad||!club)return;
 squad.querySelector(':scope > h2.v46-view-heading')?.remove();
 overview.classList.toggle('v67-showing',Boolean(career.world.seasonFinished&&career.world.transition?.reviewStep<4));
 overview.insertAdjacentHTML('afterbegin',v67TransitionHTML(career)+v67TransferReviewHTML(career));
 squad.insertAdjacentHTML('beforeend',v67YouthHTML(career));
 squad.querySelector('#v67-youth > p')?.insertAdjacentText('beforeend',' Entlassene Nachwuchsspieler sind diese und die nächste Saison für alle Vereine ablösefrei; danach beenden sie ohne Vertrag ihre Laufbahn.');
 for(const article of squad.querySelectorAll('.v67-youth-list article')){
  const pid=article.querySelector('[data-v67-profile]')?.dataset.v67Profile,promote=article.querySelector('[data-v67-promote]');if(!pid||!promote)continue;
  const actions=document.createElement('div');actions.className='v67-youth-actions';promote.replaceWith(actions);actions.append(promote);
  const release=document.createElement('button');release.type='button';release.className='menu-action';release.dataset.v67Release=pid;release.textContent='Entlassen';actions.append(release);
 }
 club.insertAdjacentHTML('beforeend',v67ManagerHistoryHTML(career));
 v58Refresh();
 v67MaybeContractReminder(career);
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
v58Button.onclick=function(){const action=v58State()?.action;if(action==='v67-review'){if(v61WorldScreen.querySelector('[data-v46-view="overview"]')?.hidden){v61SetCareerTab('overview');v61WorldScreen.querySelector('#v67-season-show')?.scrollIntoView({behavior:'smooth',block:'start'});return}v67ReviewAdvance(1);return}if(action==='v67-offers'||action==='v67-budget'){v61SetCareerTab('overview');v61WorldScreen.querySelector('#v67-transition')?.scrollIntoView({behavior:'smooth',block:'start'});return}return v67BaseProgressClick()};
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
  if(button.hasAttribute('data-v67-release')){const pid=button.dataset.v67Release,player=v66Own(career).youthPool.find(item=>item.pid===pid);if(!player||!window.confirm(`${player.name} aus dem Nachwuchspool entlassen? Er ist diese und die nächste Saison für alle Vereine ablösefrei. Ohne Vertrag beendet er danach seine Karriere.`))return;v67RunBusy('Nachwuchsentlassung wird gespeichert …',async()=>{v67ReleaseYouth(career,career.manager.managedClubId,pid);await v64UiSave();v61RenderCareer(career)});return}
  if(button.hasAttribute('data-v67-profile')){
   const player=v66Own(career).youthPool.find(item=>item.pid===button.dataset.v67Profile);if(!player)return;
   v61ProfileReturn=button;
   v61ProfileDialog.innerHTML=`<div class="player-card-head"><div>${v61FlagSVG(player.nation)}<p class="eyebrow">Nachwuchskandidat</p><h2>${escapeHTML(player.name)}</h2><span>${v61PositionNames[player.line]} · ${player.age} Jahre</span></div><button type="button" data-v61-close aria-label="Spielerprofil schließen">×</button></div><div class="player-card-facts"><span>Ausbildungsentschädigung<b>${v66Credits(v67Fee(player))}</b></span><span>Künftiges Jahresgehalt<b>${v66Credits(v66Salary(player))}</b></span><span>Verfügbar bis<b>Ende Saison ${player.expiresAfterSeason}</b></span></div><section><h3>Fähigkeiten</h3>${v55SkillGroupsHTML(player)}</section>`;
   v61ProfileDialog.querySelector('[data-v61-close]').onclick=()=>v61ProfileDialog.close();v61ProfileDialog.showModal();return;
  }
 }catch(error){const target=v61WorldScreen.querySelector(button.hasAttribute('data-v67-promote')||button.hasAttribute('data-v67-release')?'#v67-youth-error':'#v67-transition-error');if(target){target.textContent=error.message;target.scrollIntoView({behavior:'smooth',block:'center'})}}
});
