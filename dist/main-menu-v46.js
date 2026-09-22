'use strict';

const v46Style=document.createElement('style');
v46Style.textContent=`.v46-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:0 0 16px;padding:7px;border:1px solid #415854;border-radius:10px;background:#102126}.v46-nav button{min-width:0;min-height:47px;padding:7px 4px;border:0;border-radius:7px;background:transparent;color:#b7c9c1;font:700 12px Arial,sans-serif;cursor:pointer}.v46-nav button[aria-current=page]{background:var(--club-primary);color:var(--club-text)}.v46-nav button span{display:block;font-size:15px;margin-bottom:2px}.v46-menu-row{display:flex;justify-content:flex-end;margin:-8px 0 8px}.v46-more{position:relative;z-index:12}.v46-more summary{list-style:none;cursor:pointer;padding:9px 14px;border:1px solid #5b716b;border-radius:7px;color:#ecf3ed;font-size:12px;font-weight:700}.v46-more summary::-webkit-details-marker{display:none}.v46-more[open] summary{border-radius:7px 7px 0 0}.v46-menu-panel{position:absolute;right:0;top:100%;width:min(275px,80vw);padding:9px;border:1px solid #5b716b;border-radius:8px 0 8px 8px;background:#14282b;box-shadow:0 15px 35px #0008}.v46-menu-panel button{display:block;width:100%;min-height:42px;margin:2px 0;padding:9px 10px;text-align:left;border:0;border-radius:6px;background:#243b3c;color:#eef5ee;font:700 12px Arial,sans-serif;cursor:pointer}.v46-menu-panel button:hover{background:#375452}.v46-menu-panel #center-save{display:block;min-height:42px;margin:2px 0;padding:9px 10px;border:0;border-radius:6px;background:#243b3c;color:#eef5ee;font:700 12px Arial,sans-serif}.v46-view-heading{margin:8px 0 15px;color:#edf4eb;font-size:24px}.v46-competition>.panel,.v46-squad>.panel,.v46-club-identity{margin-bottom:16px}.v46-competition .league-table{margin-top:11px}.v46-competition .fixtures{max-height:380px;overflow:auto}.v46-squad .v35-roster-grid{margin:13px 0}.v46-squad .player-history{margin-top:8px}.v46-club-identity .v46-identity-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.v46-club-identity .v46-identity-row>div{display:flex;flex-direction:column;gap:5px}.v46-club-identity .v46-kit-row{display:flex;flex-wrap:wrap;gap:16px;margin-top:13px}.v46-kit-row>span{display:grid;gap:5px;justify-items:center;color:#aebfb9;font-size:11px}.v46-kit-row svg{width:48px;height:52px}.v46-extras{margin:16px 0;border:1px solid #45605b;border-radius:9px;background:#102126}.v46-extras>summary{padding:15px;cursor:pointer;font-weight:800}.v46-extras>.panel{margin:10px}.v46-extras>.save-tools{margin:10px}.v46-extras .v42-demo-card{margin-top:10px}@media(max-width:760px){#club-center.v46-has-menu{padding-bottom:94px}.v46-nav{position:fixed;z-index:30;left:0;right:0;bottom:0;margin:0;padding:7px 5px calc(7px + env(safe-area-inset-bottom));gap:2px;border-radius:12px 12px 0 0;border-bottom:0;box-shadow:0 -8px 24px #0009}.v46-nav button{min-height:55px;padding:5px 1px;font-size:9px}.v46-nav button span{font-size:18px}.v46-menu-row{margin-top:-12px}.v46-competition .scorer-table{overflow-x:auto}body:has(#club-center.v46-has-menu:not([hidden])) .legal-nav{padding-bottom:calc(85px + env(safe-area-inset-bottom))}}`;
document.head.append(v46Style);
v46Style.textContent+=`body:has(#club-center.v46-has-menu:not([hidden]))>header{position:sticky;top:0;z-index:40;background:#101d21}#club-center.v46-has-menu .intro{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;align-items:start;gap:0 18px}#club-center.v46-has-menu .intro>div{grid-column:1;grid-row:1/3;min-width:0}#club-center.v46-has-menu .intro .center-subtitle{grid-column:2;grid-row:2;align-self:end;text-align:right}#club-center.v46-has-menu .v46-menu-row{grid-column:2;grid-row:1;align-self:start;justify-self:end;margin:0}.v46-more{z-index:42}.v46-nav{position:sticky;top:88px;z-index:39;box-shadow:0 8px 20px #0714169c}.v46-nav button:hover:not([aria-current=page]),.v46-nav button:focus-visible{background:#29403f;color:#f4fbf4}.v46-nav button span svg{display:block;width:21px;height:21px;margin:0 auto 4px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#club-center.v46-has-menu details.free-agent-dropdown,#club-center.v46-has-menu details.free-agent-market-dropdown,#club-center.v46-has-menu details.season-one-free{scroll-margin-top:168px}@media(max-width:760px){#club-center.v46-has-menu{padding-bottom:0}#club-center.v46-has-menu .intro{gap:8px 10px}#club-center.v46-has-menu .intro>div{grid-row:1/3}#club-center.v46-has-menu .intro .center-subtitle{grid-column:1/-1;grid-row:3;text-align:left;margin:4px 0 0}#club-center.v46-has-menu .v46-menu-row{grid-column:2;grid-row:1}.v46-nav{position:sticky;top:68px;left:auto;right:auto;bottom:auto;margin:0 -16px 16px;padding:6px;border:1px solid #415854;border-radius:0 0 10px 10px;box-shadow:0 8px 20px #0714169c}.v46-nav button{min-height:52px}.v46-nav button span svg{width:20px;height:20px}#club-center.v46-has-menu details.free-agent-dropdown,#club-center.v46-has-menu details.free-agent-market-dropdown,#club-center.v46-has-menu details.season-one-free{scroll-margin-top:145px}body:has(#club-center.v46-has-menu:not([hidden])) .legal-nav{padding-bottom:0}}`;

function v46Icon(path){return`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`}
const v46Tabs=[
 ['overview',v46Icon('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>'),'Übersicht'],
 ['squad',v46Icon('<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2z"/><path d="M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v1h-4"/>'),'Kader'],
 ['transfers',v46Icon('<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>'),'Transfers'],
 ['competition',v46Icon('<path d="M7 3h10v7a5 5 0 0 1-10 0zM7 5H4v3a4 4 0 0 0 3 4m10-7h3v3a4 4 0 0 1-3 4M12 15v4m-4 2h8"/>'),'Wettbewerbe'],
 ['club',v46Icon('<path d="M12 2 4 5v6c0 5 3.2 8.7 8 11 4.8-2.3 8-6 8-11V5z"/><path d="M8 8h8m-8 4h8m-4-4v8"/>'),'Verein']
];
let v46ActiveTab='overview',v46LastSeason=null;
function v46SetTab(tab,scroll=true){
 if(!v46Tabs.some(item=>item[0]===tab))return;
 v46ActiveTab=tab;
 for(const node of clubCenter.querySelectorAll(':scope > [data-v46-view]'))node.hidden=node.dataset.v46View!==tab;
 for(const button of clubCenter.querySelectorAll('.v46-nav button')){if(button.dataset.v46Tab===tab)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')}
 if(tab==='transfers'){
  const free=[...clubCenter.querySelectorAll('details.free-agent-dropdown, details.free-agent-market-dropdown, details.season-one-free')].find(node=>node.dataset.v46View==='transfers'||node.closest('[data-v46-view]')?.dataset.v46View==='transfers');
  if(free){free.open=true;if(scroll)requestAnimationFrame(()=>free.scrollIntoView({block:'start',behavior:'auto'}))}
  else if(scroll)window.scrollTo(0,0);
 }else if(scroll)window.scrollTo(0,0);
}
function v46ClubIdentityHTML(){const kits=currentKits();return`<section class="panel v46-club-identity"><div class="section-heading"><h2>Vereinsidentität</h2><span>Deine Farben</span></div><div class="v46-identity-row">${crestHTML(activeSave.club,kits)}<div><b>${escapeHTML(activeSave.club)}</b><small>${v44Shapes.find(item=>item[0]===kits.crest?.shape)?.[1]||'Schild'} · ${v44Decorations.find(item=>item[0]===kits.crest?.decoration)?.[1]||'Streifen'}</small></div></div><div class="v46-kit-row"><span>${kitHTML(kits.home,'Heimtrikot')}Heimtrikot</span><span>${kitHTML(kits.away,'Auswärtstrikot')}Auswärtstrikot</span><span>${kitHTML(kits.keeper,'Torwarttrikot')}Torwarttrikot</span></div></section>`}
function v46SquadHTML(includeRoster){const roster=[activeSave.keeper,...activeSave.squad].filter(Boolean);return`<div class="v46-squad" data-v46-view="squad"><h2 class="v46-view-heading">Kader & Spielerstatistiken</h2>${includeRoster?`<section class="panel"><div class="section-heading"><h2>Aktueller Kader</h2><span>${roster.filter(player=>!player.retired).length}/12 Spieler</span></div>${v35RosterHTML()}</section><section class="panel"><h2>Statistiken</h2><p class="help">Spieler öffnen, um Saison, Vorsaison und Karriere zu vergleichen.</p>${roster.map(playerHistory).join('')}</section>`:''}</div>`}
function v46Honours(id){const previous=(activeSave.clubHistory||[]).find(item=>item.number===activeSave.seasonNumber-1),cupWinner=activeSave.cupArchive?.find(item=>item.season===activeSave.seasonNumber-1)?.winner;return`${previous?.awards?.championId===id?`<span class="table-honours" title="Meister">${v40TrophyIcon()}</span>`:''}${cupWinner===id?`<span class="table-honours" title="Pokalsieger">${v40CupIcon()}</span>`:''}`}
function v46CompetitionHTML(){const fixture=userFixture(),opponent=fixture?(fixture.home==='user'?fixture.away:fixture.home):null;return`<div class="v46-competition" data-v46-view="competition"><h2 class="v46-view-heading">Liga & Pokal</h2><section class="panel"><div class="section-heading"><h2>Ligatabelle</h2><span>Spieltag ${Math.min(activeSave.currentRound+1,10)}</span></div><div class="league-table"><div class="table-row table-head"><span>#</span><b>Verein</b><span>Sp.</span><span>TD</span><strong>Pt.</strong></div>${standings().map((team,index)=>`<div class="table-row ${team.id==='user'?'own cup-own':''} ${team.id===opponent?'cup-opponent':''}"><span>${index+1}</span><b>${escapeHTML(team.name)}${v46Honours(team.id)}</b><span>${team.played}</span><span>${team.gf-team.ga>0?'+':''}${team.gf-team.ga}</span><strong>${team.pts}</strong></div>`).join('')}</div></section>${activeSave.cupEnabled&&activeSave.cup?`<section class="panel"><h2>Pokalbaum</h2>${v41CupBracket(activeSave.cup)}</section>`:''}<section class="panel"><h2>Ligaspielplan</h2><div class="fixtures">${fixtureRows()}</div></section>${scorerTableHTML()}</div>`}
function v46TabFor(node){
 if(node.classList.contains('records-entry')||node.classList.contains('finance-panel')||node.classList.contains('v13-grid'))return'club';
 if(node.classList.contains('v35-roster'))return'transfers';
 if(node.classList.contains('qol-market')||node.classList.contains('transfer-panel')||node.classList.contains('youth-panel')||node.classList.contains('season-one-free')||node.classList.contains('free-agent-market-dropdown')||node.classList.contains('retirement-panel')||node.classList.contains('own-transfers'))return'transfers';
 if(node.classList.contains('cup-summary'))return'competition';
 return'overview';
}
function v46ArrangeCenter(){
 clubCenter.classList.remove('v46-has-menu');
 if(!activeSave||activeSave.cup?.pending||clubCenter.querySelector('.season-flow,.game-over'))return;
 const intro=clubCenter.querySelector(':scope > .intro');if(!intro)return;
 if(v46LastSeason!==activeSave.seasonNumber){v46ActiveTab='overview';v46LastSeason=activeSave.seasonNumber}
 clubCenter.classList.add('v46-has-menu');
 const menu=document.createElement('div');menu.className='v46-menu-row';menu.innerHTML='<details class="v46-more"><summary>☰ Menü</summary><div class="v46-menu-panel"><button type="button" data-v46-action="settings">Einstellungen & Speicher</button><button type="button" data-v46-action="impressum">Impressum</button><button type="button" data-v46-action="privacy">Datenschutz</button></div></details>';
 const save=clubCenter.querySelector('#center-save');if(save)menu.querySelector('.v46-menu-panel').prepend(save);
 intro.append(menu);
 const nav=document.createElement('nav');nav.className='v46-nav';nav.setAttribute('aria-label','Karrieremenü');nav.innerHTML=v46Tabs.map(([key,icon,label])=>`<button type="button" data-v46-tab="${key}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('');intro.insertAdjacentElement('afterend',nav);
 for(const node of[...clubCenter.children])if(node!==intro&&node!==nav&&node.tagName!=='FOOTER')node.dataset.v46View=v46TabFor(node);
 const squadPanels=[...clubCenter.children].filter(node=>node.classList.contains('panel')&&(node.querySelector('.squad-list')||node.querySelector('.player-history')));
 const squad=document.createElement('div');squad.innerHTML=v46SquadHTML(!squadPanels.length);const squadView=squad.firstElementChild;nav.insertAdjacentElement('afterend',squadView);
 for(const panel of squadPanels)squadView.append(panel);
 const competition=document.createElement('div');competition.innerHTML=v46CompetitionHTML();clubCenter.querySelector('footer')?.insertAdjacentElement('beforebegin',competition.firstElementChild);
 const club=document.createElement('div');club.innerHTML=v46ClubIdentityHTML();club.firstElementChild.dataset.v46View='club';clubCenter.querySelector('footer')?.insertAdjacentElement('beforebegin',club.firstElementChild);
 clubCenter.querySelectorAll('[data-roster-player]').forEach(button=>button.onclick=()=>openPlayerCard(button.dataset.rosterPlayer));
 nav.onclick=event=>{const tab=event.target.closest('[data-v46-tab]')?.dataset.v46Tab;if(tab)v46SetTab(tab)};
 menu.onclick=event=>{const action=event.target.closest('[data-v46-action]')?.dataset.v46Action;if(action==='settings')v38OpenLegal('speicher');if(action==='impressum')v38OpenLegal('impressum');if(action==='privacy')v38OpenLegal('datenschutz')};
 v46SetTab(v46ActiveTab,false);
}
const v46BaseRenderCenter=renderCenter;
renderCenter=function(){const result=v46BaseRenderCenter();v46ArrangeCenter();const label=clubCenter.querySelector('footer span:first-child');if(label)label.textContent='Doppel 6 / PROTOTYP 46';return result};
const v46BaseShowCenter=showCenter;
showCenter=function(){v46ActiveTab='overview';return v46BaseShowCenter()};
const v46BaseOpenSlot=openSlot;
openSlot=function(raw){v46ActiveTab='overview';return v46BaseOpenSlot(raw)};

const v46Extras=document.createElement('details');v46Extras.className='v46-extras';v46Extras.innerHTML='<summary>Extras & Einstellungen</summary>';
startScreen.querySelector('.menu-layout').insertAdjacentElement('afterend',v46Extras);
for(const node of[startScreen.querySelector('.v42-demo-card'),startScreen.querySelector('#share-yes')?.closest('.panel'),startScreen.querySelector('.legal-intro'),startScreen.querySelector('.save-tools')])if(node)v46Extras.append(node);
startScreen.querySelector('footer').textContent='Doppel 6 / PROTOTYP 46';
const v46BaseShowRecords=v43ShowRecords;
v43ShowRecords=function(){v46BaseShowRecords();const label=clubCenter.querySelector('footer span:first-child');if(label)label.textContent='Doppel 6 / PROTOTYP 46'};
