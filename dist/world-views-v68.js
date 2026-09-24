'use strict';

// Detailansichten bleiben innerhalb des gewählten Karrierereiters.
function v68Club(career,id){return career.world.clubs.find(club=>club.id===id)}
function v68Coach(career,id){return career.world.coaches.find(coach=>coach.id===id)}
function v68ClubButton(career,id){
 const club=v68Club(career,id);
 return club?`<button type="button" class="v68-club-link" data-v68-club="${escapeHTML(id)}" aria-label="Vereinsprofil ${escapeHTML(club.name)} öffnen">${v61CrestSVG(club)}<span>${escapeHTML(club.name)}</span></button>`:escapeHTML(id);
}
function v68CoachButton(coach){return coach?`<button type="button" class="v68-text-link" data-v68-coach="${escapeHTML(coach.id)}">${escapeHTML(coach.name)}</button>`:'–'}
function v68RelevantNews(career,clubId){
 const own=v68Club(career,career.manager.managedClubId),club=v68Club(career,clubId);
 if(club?.leagueId&&club.countryId===own.countryId)return true;
 const europe=v62Current(career).find(item=>item.type==='europe');
 const next=europe?.fixtures.filter(item=>!item.result&&(item.homeId===own.id||item.awayId===own.id)).sort((a,b)=>a.day-b.day)[0];
 return !!next&&(next.homeId===clubId||next.awayId===clubId);
}
const v68BaseMatchEvent=v64UiEvent;
v64UiEvent=function(event){
 if(event.type!=='substitution')return v68BaseMatchEvent(event);
 const fixture=v64UiFixture(),club=v68Club(v61CurrentCareer,event.side===0?fixture.homeId:fixture.awayId);
 return`<li class="v68-sub-event"><b>${event.minute}′ · Wechsel ${escapeHTML(club.name)}</b><span>Raus: ${escapeHTML(v64UiName(event.outPid))}</span><span>Rein: ${escapeHTML(v64UiName(event.inPid))}</span></li>`;
};

v62ResultHTML=function(career,fixture){
 const result=fixture.result,score=result?`${result.homeGoals}:${result.awayGoals}${result.penalties?` <small>i. E. ${result.penalties.join(':')}</small>`:''}`:'–';
 return`<div class="v62-fixture"><span>${v62Date(fixture.day)} · ${escapeHTML(fixture.round)}</span><div class="v68-result">${v68ClubButton(career,fixture.homeId)}<b>${score}</b>${v68ClubButton(career,fixture.awayId)}</div></div>`;
};
v62TableHTML=function(career,competition){
 const ids=competition.type==='europe'?competition.entrants:[...new Set(competition.fixtures.flatMap(fixture=>[fixture.homeId,fixture.awayId]))],rows=v62Table(competition,ids);
 return`<div class="v62-table-wrap" role="region" tabindex="0" aria-label="Tabelle ${competition.type==='europe'?'Europacup':v61CountryNames[competition.country]}"><table class="v62-table"><thead><tr><th scope="col">Pl.</th><th scope="col">Verein</th><th scope="col">Sp.</th><th scope="col">TD</th><th scope="col">Pkt.</th></tr></thead><tbody>${rows.map((row,index)=>`<tr class="${row.clubId===career.manager.managedClubId?'own':''}"><td>${index+1}</td><td>${v68ClubButton(career,row.clubId)}</td><td>${row.played}</td><td>${row.goalsFor-row.goalsAgainst}</td><td>${row.points}</td></tr>`).join('')}</tbody></table></div>`;
};
v63NewsHTML=function(career){
 const news=career.world.eventLog.visibleNews.filter(item=>item.season===career.world.season&&v68RelevantNews(career,item.clubId)).slice(-5).reverse();
 return news.length?`<section class="v62-season"><h2>Aus der Trainerwelt</h2><ul class="v63-news">${news.map(item=>`<li><span>${v62Date(item.day)} · </span>${v68ClubButton(career,item.clubId)}<span>${escapeHTML(item.text)}</span></li>`).join('')}</ul></section>`:'';
};

function v68PlayerRows(player,season){
 const rows=[...(player.seasons||[])],current=(player.history||[]).filter(item=>item.season===season);
 if(current.length)rows.push({season,games:current.length,minutes:current.reduce((sum,item)=>sum+item.minutes,0),goals:current.reduce((sum,item)=>sum+item.goals,0),assists:current.reduce((sum,item)=>sum+item.assists,0)});
 return rows.reverse().map(row=>`<p><strong>Saison ${row.season}</strong><span>${row.games} Einsätze · ${row.minutes} Minuten · ${row.goals} Tore · ${row.assists} Vorlagen</span></p>`).join('')||'<p>Noch keine Pflichtspieleinsätze.</p>';
}
function v68ClubHistory(career,club){
 const events=club.history.filter(item=>item.type?.startsWith('coach-')||item.type?.startsWith('manager-')).slice().reverse();
 return events.length?`<ul class="v68-history">${events.map(item=>{if(item.type==='manager-arrival')return`<li>Saison ${item.season} · Du übernimmst den Verein.</li>`;if(item.type==='manager-departure')return`<li>Saison ${item.season} · Deine Station bei diesem Verein endet.</li>`;const coach=v68Coach(career,item.coachId),label=item.type==='coach-arrival'?'übernimmt':item.type==='coach-retirement'?'beendet die Laufbahn':'verlässt den Verein';return`<li>Saison ${item.season} · ${v68CoachButton(coach)} ${label}${item.reason?` · ${escapeHTML(item.reason)}`:''}</li>`}).join('')}</ul>`:'<p>Noch keine Trainer- oder Managerwechsel.</p>';
}
function v68RosterHTML(club){
 return`<div class="v61-roster">${club.roster.map(player=>`<button type="button" class="v61-player" data-v68-player="${escapeHTML(player.pid)}"><span class="v61-shirt">${player.n}</span><span class="v61-player-name">${v61FlagSVG(player.nation)}<strong>${escapeHTML(player.name)}</strong><small>${v61PositionNames[player.line]} · ${player.age} Jahre</small></span><span class="v61-profile-action">Profil ansehen</span></button>`).join('')}</div>`;
}
function v68ClubDetailHTML(career,id){
 const club=v68Club(career,id);if(!club)return'<p>Verein nicht gefunden.</p>';
 const coach=v68Coach(career,club.coachId),titles=career.world.competitions.filter(item=>item.winnerId===id).sort((a,b)=>b.season-a.season);
 return`<section class="v61-club-hero">${v61CrestSVG(club)}<div><p>${v61FlagSVG(club.countryId)} ${escapeHTML(v61CountryNames[club.countryId])} · ${escapeHTML(club.city)}</p><h2>${escapeHTML(club.name)}</h2><p>${escapeHTML(club.historyText)}</p><small>${club.leagueId?'Ligaverein':'Pokalverein'} · Vereinsfarben: ${escapeHTML(club.colors)}</small></div></section><div class="v68-profile-grid"><section class="v62-season"><h3>Verein heute</h3><p>${club.coachId?`Trainer: ${v68CoachButton(coach)}`:club.id===career.manager.managedClubId?'Manager: Du':'Trainerstelle offen'}</p><p>${club.roster.length} Profis · Kontostand ${v66Credits(club.balance)}</p></section><section class="v62-season"><h3>Erfolge</h3>${titles.length?`<ul class="v68-history">${titles.map(item=>`<li>Saison ${item.season} · ${item.type==='league'?'Meister':item.type==='cup'?'Pokalsieger':'Europacupsieger'}</li>`).join('')}</ul>`:'<p>In dieser Karriere noch kein Titel.</p>'}</section></div><section class="v62-season"><h3>Vereins- und Trainerchronik</h3>${v68ClubHistory(career,club)}</section><section class="v61-roster-section"><div class="v61-roster-head"><div><h3>Kader</h3><p>${club.roster.length} Profis · Spielerprofile öffnen.</p></div></div>${v68RosterHTML(club)}</section>`;
}
function v68CoachDetailHTML(career,id){
 const coach=v68Coach(career,id);if(!coach)return'<p>Trainer nicht gefunden.</p>';
 const status=coach.currentClubId?v68ClubButton(career,coach.currentClubId):coach.retiredSeason?`Laufbahn beendet in Saison ${coach.retiredSeason}`:'Vereinslos';
 return`<section class="v62-season v68-coach-profile"><p class="eyebrow">Trainerprofil</p><h2>${v61FlagSVG(coach.nation)} ${escapeHTML(coach.name)}</h2><p>${coach.age} Jahre · ${coach.interim?'Interimstrainer · ':''}${status}</p><h3>Spielidee</h3><p>Formation ${escapeHTML(coach.style.formation)} · Pressing ${escapeHTML(coach.style.pressing)} · Pässe ${escapeHTML(coach.style.passing)} · Abwehr ${escapeHTML(coach.style.defense)}</p><p>Rotation ${escapeHTML(coach.style.rotation)} · Nachwuchs ${escapeHTML(coach.style.youth)}</p><h3>Fähigkeiten</h3><p>Gegneranpassung ${v63Grade(coach.judgment.adaptation)} · Kaderplanung ${v63Grade(coach.judgment.planning)} · Nachwuchsförderung ${v63Grade(coach.judgment.development)}</p></section><section class="v62-season"><h3>Stationen</h3>${coach.history.length?`<ul class="v68-history">${coach.history.slice().reverse().map(job=>`<li>${v68ClubButton(career,job.clubId)} · ab Saison ${job.fromSeason}${job.toSeason?` bis Saison ${job.toSeason}`:' · aktuell'}${job.endReason?` · ${escapeHTML(job.endReason)}`:''}</li>`).join('')}</ul>`:'<p>Noch keine Vereinsstation.</p>'}</section>`;
}
function v68CompetitionSummaryHTML(career){
 const current=v62Current(career),own=v68Club(career,career.manager.managedClubId),league=current.find(item=>item.type==='league'&&item.country===own.countryId),cup=current.find(item=>item.type==='cup'&&item.country===own.countryId),europe=current.find(item=>item.type==='europe');
 const table=v62Table(league,[...new Set(league.fixtures.flatMap(item=>[item.homeId,item.awayId]))]),ownRow=table.find(row=>row.clubId===own.id),rank=ownRow.played?`Platz ${table.findIndex(row=>row.clubId===own.id)+1} von 6`:'Noch keine Ligaspiele';
 const past=[...new Set(career.world.competitions.filter(item=>item.season<career.world.season&&item.winnerId).map(item=>item.season))].sort((a,b)=>b-a);
 const archive=past.map(season=>{const items=career.world.competitions.filter(item=>item.season===season&&item.winnerId);return`<details><summary>Saison ${season} · ${items.length} Sieger</summary><ul class="v68-history">${items.map(item=>`<li>${item.type==='europe'?'Europacup':`${v61CountryNames[item.country]} · ${item.type==='league'?'Liga':'Pokal'}`} · ${v68ClubButton(career,item.winnerId)}</li>`).join('')}</ul></details>`}).join('');
 return`<section class="v62-season v68-competition-summary"><h3>Saison auf einen Blick</h3><div class="v68-summary-grid"><div><span>Deine Liga</span><strong>${rank}</strong></div><div><span>Nationaler Pokal</span><strong>${cup.winnerId?v68ClubButton(career,cup.winnerId):'Läuft'}</strong></div><div><span>Europacup</span><strong>${europe.winnerId?v68ClubButton(career,europe.winnerId):'Läuft'}</strong></div></div>${archive?`<details class="v68-archive"><summary>Bisherige Sieger ansehen</summary>${archive}</details>`:''}</section>`;
}
function v68DigestHTML(career){
 const digest=career.world.lastDigest;if(!digest||digest.season!==career.world.season)return'';
 const fixtures=v62Fixtures(career),matches=digest.fixtureIds.map(id=>fixtures.find(item=>item.id===id)).filter(Boolean),news=digest.newsIds.map(id=>career.world.eventLog.visibleNews.find(item=>item.id===id)).filter(Boolean);
 if(!matches.length&&!news.length)return'';
 return`<section class="v62-season v68-digest"><h2>Seit deinem letzten Fortschritt</h2>${matches.length?`<div class="v62-recent">${matches.map(item=>v62ResultHTML(career,item)).join('')}</div>`:''}${news.length?`<ul class="v63-news">${news.map(item=>`<li>${v62Date(item.day)} · ${v68ClubButton(career,item.clubId)} ${escapeHTML(item.text)}</li>`).join('')}</ul>`:''}</section>`;
}
function v68DecorateMarket(career){
 const transfer=v61WorldScreen.querySelector('[data-v46-view="transfers"]');if(!transfer)return;
 const selected=typeof v66Filter!=='undefined'&&v66Filter.selected,owner=selected&&v66Owner(career,selected);
 if(owner)transfer.querySelector('#v66-offer > p')?.insertAdjacentHTML('afterend',`<p class="v68-market-club">${v68ClubButton(career,owner.id)}</p>`);
 const own=career.manager.managedClubId,bids=career.world.market.pendingBids.filter(item=>item.buyerId===own||item.sellerId===own),visible=[...bids.filter(item=>item.sellerId===own).slice(-12).reverse().map(item=>item.buyerId),...bids.filter(item=>item.buyerId===own).slice(-12).reverse().map(item=>item.sellerId)];
 transfer.querySelectorAll('.v66-bid').forEach((row,index)=>{const id=visible[index];if(id)row.firstElementChild?.insertAdjacentHTML('beforeend',`<span class="v68-bid-club">${v68ClubButton(career,id)}</span>`)});
}

let v68Stack=[],v68ReturnButton=null,v68OriginTab=null;
function v68ShowDetail(){
 const current=v68Stack.at(-1),career=v61CurrentCareer;if(!current||!career)return;
 v61WorldScreen.querySelector('[data-v68-detail]')?.remove();
 for(const view of v61WorldScreen.querySelectorAll(':scope > [data-v46-view]'))view.hidden=true;
 const panel=document.createElement('section');panel.className='v68-detail';panel.dataset.v68Detail='';
 panel.innerHTML=`<button type="button" class="menu-action v68-back" data-v68-back>Zurück zu ${v68Stack.length>1?'vorherigem Profil':escapeHTML(v46Tabs.find(([key])=>key===v68OriginTab)?.[2]||'Übersicht')}</button>${current.type==='club'?v68ClubDetailHTML(career,current.id):v68CoachDetailHTML(career,current.id)}`;
 v61WorldScreen.querySelector('.v61-career-nav').after(panel);
 window.scrollTo(0,0);panel.querySelector('[data-v68-back]').focus();
}
function v68OpenDetail(type,id,button){
 if(!v61CurrentCareer||v61CurrentCareer.world.activeMatch)return;
 if(type==='club'&&!v68Club(v61CurrentCareer,id)||type==='coach'&&!v68Coach(v61CurrentCareer,id))return;
 if(!v68Stack.length){v68OriginTab=v61CareerTab;v68ReturnButton=button}
 v68Stack.push({type,id});v68ShowDetail();
}
function v68CloseDetail(){
 if(!v68Stack.length)return;
 v68Stack.pop();if(v68Stack.length){v68ShowDetail();return}
 v61WorldScreen.querySelector('[data-v68-detail]')?.remove();
 const origin=v68OriginTab||'overview',returnButton=v68ReturnButton;
 v61SetCareerTab(origin,false);
 (returnButton?.isConnected?returnButton:v61WorldScreen.querySelector(`[data-v61-tab="${origin}"]`))?.focus();
}
const v68BaseSetCareerTab=v61SetCareerTab;
v61SetCareerTab=function(tab,scroll=true){
 v68Stack=[];v61WorldScreen.querySelector('[data-v68-detail]')?.remove();
 v68OriginTab=null;v68ReturnButton=null;
 return v68BaseSetCareerTab(tab,scroll);
};
const v68BaseRenderCareer=v61RenderCareer;
v61RenderCareer=function(career){
 v68Stack=[];v68OriginTab=null;v68ReturnButton=null;
 v68BaseRenderCareer(career);
 if(career.world.activeMatch)return;
 const overview=v61WorldScreen.querySelector('[data-v46-view="overview"]'),competition=v61WorldScreen.querySelector('[data-v46-view="competition"]'),clubView=v61WorldScreen.querySelector('[data-v46-view="club"]');
 if(!overview||!competition||!clubView)return;
 const digest=v68DigestHTML(career);if(digest)overview.insertAdjacentHTML('afterbegin',digest);
 competition.insertAdjacentHTML('afterbegin',v68CompetitionSummaryHTML(career));
 const own=v68Club(career,career.manager.managedClubId);
 const countryDetails=competition.querySelectorAll('.v62-competitions > details'),ownCountryIndex=v61Countries.findIndex(([id])=>id===own.countryId),ownCup=countryDetails[ownCountryIndex+2];
 if(ownCup){ownCup.querySelector('.v62-table-wrap')?.remove();ownCup.querySelector('h4')?.remove();ownCup.querySelector('summary').textContent=`Nationaler Pokal · ${v61CountryNames[own.countryId]}`}
 clubView.querySelector('.v61-club-hero')?.insertAdjacentHTML('afterend',`<button type="button" class="menu-action v68-own-profile" data-v68-club="${escapeHTML(own.id)}">Vollständiges Vereinsprofil ansehen</button>`);
 const peers=career.world.clubs.filter(item=>item.countryId===own.countryId&&item.leagueId&&item.id!==own.id);
 clubView.querySelectorAll('.v63-coach-list details').forEach((card,index)=>{const peer=peers[index],coach=v68Coach(career,peer.coachId);card.querySelector('.v63-coach-detail')?.insertAdjacentHTML('beforeend',`<div class="v68-coach-actions"><button type="button" class="menu-action" data-v68-club="${escapeHTML(peer.id)}">Vereinsprofil</button><button type="button" class="menu-action" data-v68-coach="${escapeHTML(coach.id)}">Trainerprofil</button></div>`)});
 clubView.querySelectorAll('.v67-manager li').forEach((item,index)=>{const job=career.manager.stationHistory[index],button=document.createElement('button');button.type='button';button.className='v68-text-link';button.dataset.v68Club=job.clubId;button.textContent='Vereinsprofil';item.append(' · ',button)});
 overview.querySelectorAll('.v67-offers article').forEach((item,index)=>{const id=career.world.transition?.offers[index];if(item&&id)item.querySelector('.v67-offer-title')?.insertAdjacentHTML('afterend',`<button type="button" class="menu-action" data-v68-club="${escapeHTML(id)}">Kader und Vereinsprofil ansehen</button>`)});
 v68DecorateMarket(career);
};

function v68CaptureDigest(career,before,newsBefore){
 const own=v68Club(career,career.manager.managedClubId),competitionById=new Map(v62Current(career).map(item=>[item.id,item]));
 const relevant=career.world.eventLog.processedEventIds.slice(before).map(id=>v62Fixtures(career).find(item=>item.id===id)).filter(item=>{if(!item)return false;const competition=competitionById.get(item.competitionId);return competition?.country===own.countryId||competition?.type==='europe'&&(item.homeId===own.id||item.awayId===own.id)}).slice(-6).map(item=>item.id);
 const news=career.world.eventLog.visibleNews.slice(newsBefore).filter(item=>v68RelevantNews(career,item.clubId)).slice(-3).map(item=>item.id);
 career.world.lastDigest={season:career.world.season,fixtureIds:relevant,newsIds:news};
}
const v68BaseAdvanceToOwnMatch=v64AdvanceToOwnMatch;
v64AdvanceToOwnMatch=function(career){
 const before=career.world.eventLog.processedEventIds.length,newsBefore=career.world.eventLog.visibleNews.length,result=v68BaseAdvanceToOwnMatch(career);
 v68CaptureDigest(career,before,newsBefore);
 return result;
};
const v68BaseAdvanceCareer=v61AdvanceCareer;
v61AdvanceCareer=function(){
 const career=v61CurrentCareer;
 if(!career||career.world.activeMatch||career.world.seasonFinished||career.world.market?.phase!=='closed')return v68BaseAdvanceCareer();
 v67RunBusy('Weltkalender wird verarbeitet …',async()=>{
  const before=career.world.eventLog.processedEventIds.length,newsBefore=career.world.eventLog.visibleNews.length,managed=career.manager.managedClubId;
  let steps=0;
  while(!career.world.seasonFinished){
   const pending=v62Fixtures(career).filter(item=>!item.result),next=pending.filter(item=>item.homeId===managed||item.awayId===managed).sort((a,b)=>a.day-b.day)[0];
   const earliest=pending.length?Math.min(...pending.map(item=>item.day)):Infinity;
   if(next&&earliest>=next.day)break;
   if(steps>=100)throw Error('Der Weltkalender konnte nicht abgeschlossen werden.');
   v62AdvanceDay(career);steps++;
   const label=v61WorldScreen.querySelector('.v67-loading-inline > span');if(label)label.textContent=`Weltkalender: ${steps} ${steps===1?'Spieltag':'Spieltage'} verarbeitet …`;
   await new Promise(resolve=>requestAnimationFrame(resolve));
  }
  if(!career.world.seasonFinished)v64AdvanceToOwnMatch(career);
  v68CaptureDigest(career,before,newsBefore);
  await v64UiSave();v61RenderCareer(career);
 });
};

v61WorldScreen.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||!v61CurrentCareer||v61CurrentCareer.world.activeMatch)return;
 if(button.hasAttribute('data-v68-back')){v68CloseDetail();return}
 if(button.dataset.v68Club){v68OpenDetail('club',button.dataset.v68Club,button);return}
 if(button.dataset.v68Coach){v68OpenDetail('coach',button.dataset.v68Coach,button);return}
 if(button.dataset.v68Player){
  const player=v61CurrentCareer.world.clubs.flatMap(club=>club.roster).find(item=>item.pid===button.dataset.v68Player);if(!player)return;
  const owner=v66Owner(v61CurrentCareer,player.pid),contract=v66Contract(v61CurrentCareer,player.pid);
  v61ProfileReturn=button;
  v61ProfileDialog.innerHTML=`<div class="player-card-head"><div>${v61FlagSVG(player.nation)}<p class="eyebrow">${escapeHTML(owner?.name||'Vereinslos')}</p><h2>${escapeHTML(player.name)}</h2><span>${v61PositionNames[player.line]} · ${player.age} Jahre</span></div><button type="button" data-v61-close aria-label="Spielerprofil schließen">×</button></div><div class="player-card-facts"><span>Rückennummer<b>${player.n}</b></span><span>Form<b>${formText(player.form)}</b></span><span>Fitness<b>${freshText(player.fresh)}</b></span>${contract?`<span>Vertrag bis<b>Saison ${contract.endSeason}</b></span>`:''}</div><section><h3>Fähigkeiten</h3>${v55SkillGroupsHTML(player)}</section><section><h3>Spielerstatistik</h3><div class="v64-player-seasons">${v68PlayerRows(player,v61CurrentCareer.world.season)}</div></section>`;
  v61ProfileDialog.querySelector('[data-v61-close]').onclick=()=>v61ProfileDialog.close();v61ProfileDialog.showModal();
 }
});
