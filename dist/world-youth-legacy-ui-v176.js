'use strict';
function v176Text(de,en){return window.doppel6Language?.get()==='en'?en:de;}
function v176StatusHTML(career,club=v66Own(career)){
 if(!v176Active(career)||!club.youthLegacy)return'';
 const legacy=club.youthLegacy,index=Math.min(4,Math.floor(legacy.status/20)),key=v51FormKeys[index],label=v176Text(['Sehr schwach','Schwach','Normal','Gut','Sehr gut'][index],['Very weak','Weak','Normal','Good','Very good'][index]),trend=legacy.change>.5?1:legacy.change<-.5?-1:0,arrow=trend>0?'↑':trend<0?'↓':'→',direction=v176Text(trend>0?'Verbessert sich':trend<0?'Verschlechtert sich':'Stabil',trend>0?'Improving':trend<0?'Declining':'Stable');
 return `<p class="v176-status" data-v176-status><span class="v176-dot" style="background:${v51FormColors[key]}" aria-hidden="true"></span><strong>${v176Text('Jugendstatus: ','Academy status: ')}${label}</strong><span aria-label="${direction}" title="${direction}">${arrow}</span></p>`;
}
function v176FundingOptions(limit){return [{amount:0,label:v176Text('Keine Förderung','No funding'),detail:v176Text('Ein kleiner Jahrgang. Gewachsene Jugendarbeit wirkt zunächst weiter, sinkt aber bei dauerhaft fehlender Förderung.','A small cohort. Established academy work continues initially, but declines without sustained funding.')},{amount:500,label:v176Text('Grundförderung','Basic funding'),detail:v176Text('Regelmäßige Förderung für mehrere Kandidaten. Langfristige Förderung und sportliche Erfolge prägen ihre Qualität.','Regular funding for several candidates. Sustained investment and sporting success shape their quality.')},{amount:1000,label:v176Text('Schwerpunkt Jugend','Youth priority'),detail:v176Text('Jugend als Vereinsschwerpunkt: langfristig größere Jahrgänge und gute Jugendarbeit.','Youth as a club priority: larger cohorts and good academy work over time.')},{amount:1500,label:v176Text('Maximale Förderung','Maximum funding'),detail:v176Text('Maximale Priorität: langfristig bis zu sechs Kandidaten. Starke Spieler sind nicht garantiert; Profieinsätze bleiben nötig.','Maximum priority: up to six candidates over time. Strong players are not guaranteed; senior appearances remain necessary.')}].map(r=>({...r,available:r.amount<=limit}));}
const v176YouthHTMLBase=v67YouthHTML;
v67YouthHTML=function(career){return v176YouthHTMLBase(career).replace('<div class="v67-filters">',v176StatusHTML(career)+'<div class="v67-filters">');};
const v176BudgetHTMLBase=v124BudgetHTML;
v124BudgetHTML=function(career){const html=v176BudgetHTMLBase(career);return v176Active(career)?html.replace('<h3>Jugendförderung wählen</h3>','<h3>Jugendförderung wählen</h3>'+v176StatusHTML(career)):html;};
const v176ClubHTMLBase=v68ClubDetailHTML;
v68ClubDetailHTML=function(career,id){return v176ClubHTMLBase(career,id).replace('<h3>Verein heute</h3>','<h3>Verein heute</h3>'+v176StatusHTML(career,v66Club(career,id)));};
function v176RetirementNoticeHTML(career){
 if(!v176Active(career)||career.world.seasonFinished)return'';
 const own=v66Own(career),decided=career.world.retirementDecisions.season===career.world.season,players=own.roster.filter(p=>decided?v176Retiring(career,p.pid):p.age>=33);
 if(!players.length)return'';
 return `<aside class="v176-retirement-notice"><h3>${v176Text(decided?'Abschied zum Saisonende':'Mögliche Karriereenden',decided?'Retiring at the end of the season':'Possible retirements')}</h3><p>${v176Text(decided?'Die Entscheidung steht fest. Diese Spieler bleiben bis Saisonende verfügbar:':'Zu Saisonbeginn könnten diese Spieler ihre letzte Saison spielen. Die Entscheidung fällt zur Saisonmitte:',decided?'The decision is final. These players remain available until the end of the season:':'These players could be starting their final season. The decision is made at mid-season:')}</p><ul>${players.map(p=>`<li><button type="button" class="player-link" data-v68-player="${escapeHTML(p.pid)}">${escapeHTML(p.name)}</button> · ${p.age}</li>`).join('')}</ul></aside>`;
}
const v176TransitionHTMLBase=v67TransitionHTML;
v67TransitionHTML=function(career){return v176RetirementNoticeHTML(career)+v176TransitionHTMLBase(career);};
const v176ContractHTMLBase=v66ContractHTML;
v66ContractHTML=function(career,p){const html=v176ContractHTMLBase(career,p);return v176Retiring(career,p.pid)?html.replace(/<button type="button" class="menu-action v66-renew-open"[^>]*>[^<]*<\/button>/g,v176Text('Karriereende zum Saisonabschluss','Retiring at season close')):html;};
const v176DeparturesHTMLBase=v67SeasonDeparturesHTML;
v67SeasonDeparturesHTML=function(career,id,season){
 const html=v176DeparturesHTMLBase(career,id,season);if(!v176Active(career))return html;
 const players=(v66Club(career,id)?.retiredPlayers||[]).filter(p=>p.retiredSeason===season&&p.retirementStory);
 return html+players.map(p=>{const s=p.retirementStory,names=s.stations.map(id=>v66Club(career,id)?.name||id),story=v176Text(`${p.name} verabschiedet sich mit ${p.age} Jahren. In dieser Karriere sind ${s.games} Einsätze, ${s.goals} Tore und ${s.assists} Vorlagen erfasst. ${s.titles} Titel sind verzeichnet.`,`${p.name} retires at age ${p.age}. This career records ${s.games} appearances, ${s.goals} goals and ${s.assists} assists. ${s.titles} titles are recorded.`);return `<article class="v176-farewell"><h4><button type="button" class="player-link" data-v68-player="${escapeHTML(p.pid)}">${escapeHTML(p.name)}</button></h4><p>${escapeHTML(story)}</p>${names.length?`<p>${v176Text('Erfasste Stationen: ','Recorded clubs: ')}${names.map(escapeHTML).join(', ')}</p>`:''}</article>`;}).join('');
};
const v176PlayerProfileBase=v68OpenPlayerProfile;
v68OpenPlayerProfile=function(career,pid,button){
 const r=v176PlayerProfileBase(career,pid,button),player=v66Player(career,pid);if(!v176Active(career)||!player?.retiredSeason)return r;
 for(const offer of v61ProfileDialog.querySelectorAll('.v72-profile-offer,.v72-profile-sale'))offer.remove();
 const facts=v61ProfileDialog.querySelector('.player-card-facts');
 for(const field of facts?.querySelectorAll(':scope > span')||[])if(/^(Marktwert|Market value)/.test(field.textContent.trim()))field.remove();
 facts?.insertAdjacentHTML('beforeend',`<span>${v176Text('Status','Status')}<b>${v176Text('Karriere beendet','Retired')} · ${v176Text('Saison','Season')} ${player.retiredSeason}</b></span>`);return r;
};
