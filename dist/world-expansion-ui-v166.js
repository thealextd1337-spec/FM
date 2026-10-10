'use strict';

function v166CompetitionHTML(career,competition){
 const title=competition.name||`${career.world.countries.find(c=>c.id===competition.country).name} · ${competition.type==='league'?'Liga':'Nationaler Pokal'}`;
 const names=id=>v161Escape(career.world.clubs.find(c=>c.id===id)?.name||id);
 const table=competition.type==='league'?`<ol>${v62Table(competition,career.world.clubs.filter(c=>c.leagueId===`${competition.country}-LEAGUE`).map(c=>c.id)).map(r=>`<li>${names(r.clubId)} · ${r.points} Punkte · ${r.played} Spiele</li>`).join('')}</ol>`:competition.format==='crown'?`<ol>${v62Table(competition,competition.entrants).map(r=>`<li>${names(r.clubId)} · ${r.points} Punkte</li>`).join('')}</ol>`:'';
 return `<details><summary>${v161Escape(title)}${competition.winnerId?' · Sieger: '+names(competition.winnerId):''}</summary>${table}<ul>${competition.fixtures.map(f=>`<li>${v62Date(f.day)} · ${f.round}${f.leg===2?' Rückspiel':''} · ${names(f.homeId)} – ${names(f.awayId)} · ${f.result?`${f.result.homeGoals}:${f.result.awayGoals}${f.result.aggregate?' (Gesamt '+f.result.aggregate.join(':')+')':''}${f.result.penalties?' · i. E. '+f.result.penalties.join(':'):''}`:'ausstehend'}</li>`).join('')}</ul>${competition.type!=='league'&&!competition.winnerId?'<p>Weitere Paarungen werden nach Abschluss der Vorrunde ausgelost.</p>':''}</details>`;
}
function v166Render(career){
 const own=v66Own(career),world=career.world,market=world.market;let controls='';
 if(world.seasonFinished)controls=typeof v169SeasonControls==='function'&&v167Active(career)?v169SeasonControls(career):'<p>Diese ältere Entwicklungskarriere endet nach Saison 1. Für weitere Saisons eine neue erweiterte Karriere anlegen.</p>';
 else if(market.phase==='sponsor')controls=`<h3>Sponsor wählen</h3>${own.sponsors.map(s=>`<button type="button" data-v166-sponsor="${s.id}">${v66SponsorLogoSVG(own.countryId,s,true)} ${v161Escape(s.name)} · ${s.fixed} Credits Fixum</button>`).join('')}`;
 else if(market.phase==='budget')controls=`<label>Jugendbudget <input id="v166-budget" type="number" value="0" min="0" max="${v67BudgetLimit(own)}" step="50"></label><button type="button" data-v166-action="budget">Budget bestätigen</button>`;
 else if(['open','deadline'].includes(market.phase))controls=`<p>Transfertag ${market.day} von 5</p><button type="button" data-v166-action="market">Transfertag abschließen</button>${v66MarketHTML(career)}`;
 else controls='<button type="button" data-v166-action="match">Nächstes Spiel vorbereiten</button><button type="button" data-v166-action="simulate">Nächsten Spieltag simulieren</button>';
 v61WorldScreen.innerHTML=`<section class="v61-shell v166-career"><h1>${v161Escape(own.name)} · Saison ${world.season}</h1>${v61CrestSVG(own)}<p>${world.seasonFinished?'Saison abgeschlossen':v62Date(Math.max(0,world.calendarCursor))} · ${v62Fixtures(career).filter(f=>f.result).length} abgeschlossene Partien · ${own.balance} Credits</p>${controls}${typeof v170OfficeHTML==='function'?v170OfficeHTML(career):''}<p id="v166-message" role="status"></p><button type="button" data-v166-action="back">Zu den Spielständen</button><details><summary>Kader</summary>${v61SeasonRosterHTML(career,own.roster)}</details>${typeof v169ManagementHTML==='function'?v169ManagementHTML(career):''}${typeof v169RankingHTML==='function'?v169RankingHTML(career):''}<h2>Deine Wettbewerbe</h2>${v62Current(career).filter(c=>c.country===own.countryId||c.entrants?.includes(own.id)).map(c=>v166CompetitionHTML(career,c)).join('')}<h2>Alle Wettbewerbe</h2>${v62Current(career).map(c=>v166CompetitionHTML(career,c)).join('')}</section>`;
 v61ShowScreen();
}
if(typeof document==='object')document.addEventListener('DOMContentLoaded',()=>{
 const style=document.createElement('style');style.textContent='.v166-career{max-width:1100px;margin:auto;padding:18px 16px 60px}.v166-career>h1{font-size:clamp(1.7rem,6vw,2.3rem);line-height:1.15;margin:12px 0 20px}.v166-career>h2{font-size:1.15rem;margin:24px 0 12px}.v166-career>p{line-height:1.6}.v166-career button[data-v169-offer],.v166-career button[data-v169-action],.v166-career>button{font:inherit;padding:12px 16px;border:1px solid #799056;border-radius:9px;background:#d5f08d;color:#17252c;margin:6px 6px 6px 0;cursor:pointer;max-width:100%}.v166-career>button[data-v166-action="back"]{background:transparent;color:inherit;border-color:#799096}.v166-career>button:disabled{opacity:.55}.v166-career>details{border:1px solid #647b83;border-radius:10px;padding:12px;margin:10px 0;background:rgba(127,150,156,.08)}.v166-career summary{cursor:pointer;font-weight:600;line-height:1.5}.v166-career li{margin:10px 0;line-height:1.5;overflow-wrap:anywhere}.v166-career ul,.v166-career ol{padding-left:20px}.v166-career>button svg{width:46px;height:36px;vertical-align:middle;margin-right:8px}';document.head.append(style);
 const render=v61RenderCareer;v61RenderCareer=function(career){if(v166Expansion(career)&&!career.world.activeMatch){v64UiStop();return v166Render(career);}return render(career);};
 const progress=v58State;v58State=function(){if(v166Expansion(v61CurrentCareer)&&!v61WorldScreen.hidden&&!v61CurrentCareer.world.activeMatch)return{context:v61CurrentCareer.world.seasonFinished?`Saison ${v61CurrentCareer.world.season} abgeschlossen`:`Vereinswelt · Saison ${v61CurrentCareer.world.season}`};return progress();};
 v61WorldScreen.addEventListener('click',async event=>{
  const button=event.target.closest('[data-v166-action],[data-v166-sponsor]'),career=v61CurrentCareer;if(!button||!v166Expansion(career))return;
  button.disabled=true;try{
   if(button.dataset.v166Sponsor)v66ChooseSponsor(career,career.manager.managedClubId,button.dataset.v166Sponsor);
   else if(button.dataset.v166Action==='budget')v124SetYouthBudget(career,v61WorldScreen.querySelector('#v166-budget').value);
   else if(button.dataset.v166Action==='market')v66NextMarketDay(career);
   else if(button.dataset.v166Action==='match'){v61WorldScreen.querySelector('#v166-message').textContent='Spielkalender wird verarbeitet …';await new Promise(r=>setTimeout(r,0));v64AdvanceToOwnMatch(career);}
   else if(button.dataset.v166Action==='simulate'){await new Promise(r=>setTimeout(r,0));v62AdvanceDay(career);}
   else if(button.dataset.v166Action==='back'){await v61ShowStart();return;}
   await v64UiSave();v61RenderCareer(career);
  }catch(error){const target=v61WorldScreen.querySelector('#v166-message');if(target)target.textContent=error.message;}finally{if(button.isConnected)button.disabled=false;}
 });
});
