'use strict';

/* Reliable inline flags for every nationality used by the generator. */
const v18PreviousFlagSVG=flagSVG;
const v18FlagDesigns={
 SK:'<path fill="#fff" d="M0 0h24v5.33H0z"/><path fill="#0b4ea2" d="M0 5.33h24v5.34H0z"/><path fill="#ee1c25" d="M0 10.67h24V16H0z"/>',
 FR:'<path fill="#0055a4" d="M0 0h8v16H0z"/><path fill="#fff" d="M8 0h8v16H8z"/><path fill="#ef4135" d="M16 0h8v16h-8z"/>',
 ES:'<path fill="#aa151b" d="M0 0h24v4H0zM0 12h24v4H0z"/><path fill="#f1bf00" d="M0 4h24v8H0z"/>',
 PT:'<path fill="#046a38" d="M0 0h9v16H0z"/><path fill="#da291c" d="M9 0h15v16H9z"/><circle cx="9" cy="8" r="2.3" fill="#ffcd00"/>',
 NL:'<path fill="#ae1c28" d="M0 0h24v5.33H0z"/><path fill="#fff" d="M0 5.33h24v5.34H0z"/><path fill="#21468b" d="M0 10.67h24V16H0z"/>',
 RO:'<path fill="#002b7f" d="M0 0h8v16H0z"/><path fill="#fcd116" d="M8 0h8v16H8z"/><path fill="#ce1126" d="M16 0h8v16h-8z"/>',
 UA:'<path fill="#0057b7" d="M0 0h24v8H0z"/><path fill="#ffd700" d="M0 8h24v8H0z"/>',
 TR:'<path fill="#e30a17" d="M0 0h24v16H0z"/><circle cx="10" cy="8" r="4.2" fill="#fff"/><circle cx="11.6" cy="8" r="3.4" fill="#e30a17"/><path fill="#fff" d="m16 5.8.6 1.4 1.5.1-1.1 1 .4 1.5-1.3-.8-1.3.8.4-1.5-1.1-1 1.5-.1z"/>',
 BR:'<path fill="#009c3b" d="M0 0h24v16H0z"/><path fill="#ffdf00" d="M12 2 22 8l-10 6L2 8z"/><circle cx="12" cy="8" r="3.3" fill="#002776"/>',
 AR:'<path fill="#74acdf" d="M0 0h24v5.33H0zM0 10.67h24V16H0z"/><path fill="#fff" d="M0 5.33h24v5.34H0z"/><circle cx="12" cy="8" r="1.3" fill="#f6b40e"/>',
 CO:'<path fill="#fcd116" d="M0 0h24v8H0z"/><path fill="#003893" d="M0 8h24v4H0z"/><path fill="#ce1126" d="M0 12h24v4H0z"/>',
 MX:'<path fill="#006847" d="M0 0h8v16H0z"/><path fill="#fff" d="M8 0h8v16H8z"/><path fill="#ce1126" d="M16 0h8v16h-8z"/><circle cx="12" cy="8" r="1.2" fill="#8a6d3b"/>',
 US:'<path fill="#fff" d="M0 0h24v16H0z"/><path stroke="#b22234" stroke-width="2" d="M0 1h24M0 5h24M0 9h24M0 13h24"/><path fill="#3c3b6e" d="M0 0h10v8H0z"/><path fill="#fff" d="m2 1 .4 1H3l-.8.6.3 1-.9-.6-.9.6.3-1-.8-.6h1L2 1zm4 0 .4 1h1l-.8.6.3 1L6 3l-.9.6.3-1-.8-.6h1L6 1z"/>',
 CA:'<path fill="#d80621" d="M0 0h5v16H0zM19 0h5v16h-5z"/><path fill="#fff" d="M5 0h14v16H5z"/><path fill="#d80621" d="m12 3 1 2 1.6-.6-.6 2 1.4.8-2 .8.5 2-1.3-.6L12 13l-.6-3.6-1.3.6.5-2-2-.8 1.4-.8-.6-2L11 5z"/>',
 NG:'<path fill="#008751" d="M0 0h8v16H0zM16 0h8v16h-8z"/><path fill="#fff" d="M8 0h8v16H8z"/>',
 GH:'<path fill="#ce1126" d="M0 0h24v5.33H0z"/><path fill="#fcd116" d="M0 5.33h24v5.34H0z"/><path fill="#006b3f" d="M0 10.67h24V16H0z"/><path d="m12 6 1 3-2.6-1.8h3.2L11 9z"/>',
 SN:'<path fill="#00853f" d="M0 0h8v16H0z"/><path fill="#fdef42" d="M8 0h8v16H8z"/><path fill="#e31b23" d="M16 0h8v16h-8z"/><path fill="#00853f" d="m12 5.2.8 2.1h2.1l-1.7 1.3.7 2.1-1.9-1.2-1.9 1.2.7-2.1-1.7-1.3h2.1z"/>',
 MA:'<path fill="#c1272d" d="M0 0h24v16H0z"/><path fill="none" stroke="#006233" stroke-width="1.2" d="m12 4 1.1 3.1h3.3l-2.7 1.8 1 3.1-2.7-1.9L9.3 12l1-3.1-2.7-1.8h3.3z"/>',
 JP:'<path fill="#fff" d="M0 0h24v16H0z"/><circle cx="12" cy="8" r="4" fill="#bc002d"/>',
 KR:'<path fill="#fff" d="M0 0h24v16H0z"/><path fill="#cd2e3a" d="M8 8a4 4 0 0 1 8 0z"/><path fill="#0047a0" d="M8 8a4 4 0 0 0 8 0z"/>',
 AU:'<path fill="#012169" d="M0 0h24v16H0z"/><path fill="#fff" d="M0 0h10v7H0z"/><path stroke="#c8102e" stroke-width="1.4" d="M0 0l10 7M10 0 0 7"/><path fill="#fff" d="m18 4 .5 1.2 1.3.1-1 .8.4 1.3-1.2-.7-1.2.7.4-1.3-1-.8 1.3-.1z"/>'
};
flagSVG=function(code){code=String(code||'AT').toUpperCase();const design=v18FlagDesigns[code];if(!design)return v18PreviousFlagSVG(code);const label=nationData[code]?.name||code;return`<svg viewBox="0 0 24 16" role="img" aria-label="${escapeHTML(label)}" class="flag-icon"><title>${escapeHTML(label)}</title>${design}</svg>`};

/* Player profile dialog with deliberately imprecise scouting descriptions. */
const playerCardDialog=document.createElement('dialog');
playerCardDialog.id='player-card-dialog';
playerCardDialog.className='player-card-dialog';
document.querySelector('body')?.append(playerCardDialog);

function playerPool(){
 if(!activeSave)return[];
 const own=[activeSave.keeper,...(activeSave.squad||[])],world=(activeSave.world?.teams||[]).flatMap(team=>team.roster||[]),market=(activeSave.transfer?.offers||[]).map(offer=>offer.player).filter(Boolean),former=(activeSave.formerPlayers||[]).map(entry=>entry.player).filter(Boolean);
 return[...own,...world,...market,...former];
}
function findPlayerProfile(pid){return playerPool().find(player=>player.pid===pid)||null}
function scoutingBand(value,player,key){
 const seed=[...(player.pid||player.name||'')+key].reduce((sum,char)=>sum+char.charCodeAt(0),0),adjusted=(value||40)+(seed%7-3);
 return adjusted>=86?'herausragend':adjusted>=79?'sehr stark':adjusted>=72?'stark':adjusted>=65?'solide':adjusted>=57?'wechselhaft':adjusted>=49?'eher schwach':'deutlich ausbaufähig';
}
function scoutingSkillsHTML(player){
 const skills=player.keeper?[['Torwartspiel','gk'],['Passspiel','pas'],['Stellungsspiel','pos'],['Geschwindigkeit','spd'],['Kondition','sta']]:[['Technik','tec'],['Passspiel','pas'],['Abschluss','fin'],['Zweikampf','tak'],['Stellungsspiel','pos'],['Geschwindigkeit','spd'],['Kondition','sta']];
 return`<div class="scouting-skills">${skills.map(([label,key])=>`<span>${label}<b>${scoutingBand(player[key],player,key)}</b></span>`).join('')}</div>`;
}
function playerCardHTML(player){
 const position=player.keeper?'Torwart':lineNames[player.line],nation=nationData[player.nation]?.name||player.nation||'Unbekannt',starting=player.keeper||activeSave.lineup?.includes(player.n),status=activeSave.squad?.some(item=>item.pid===player.pid)||activeSave.keeper?.pid===player.pid?(starting?'Startaufstellung':'Ersatzbank'):'Beobachteter Spieler';
 return`<div class="player-card-head"><div>${flagSVG(player.nation)}<p class="eyebrow">${escapeHTML(nation)}</p><h2>${escapeHTML(player.name)}</h2><span>${escapeHTML(position)} · ${player.age} Jahre · ${escapeHTML(player.foot||'Rechts')}fuß</span></div><button id="close-player-card" aria-label="Spielerkarte schließen">×</button></div><div class="player-card-facts"><span>Status<b>${status}</b></span><span>Form<b>${formText(player.form||0)}</b></span><span>Fitness<b>${freshText(player.fresh??100)}</b></span><span>Spielertyp<b>${escapeHTML(player.type||position)}</b></span></div><section><h3>Fähigkeiten</h3>${scoutingSkillsHTML(player)}<small>Die Farben zeigen die Stärke der Fähigkeiten.</small></section><section class="season-stats-section">${seasonStatsPagerHTML(player,'h3')}</section>`;
}
function openPlayerProfile(player){
 if(!player)return false;playerCardDialog.innerHTML=playerCardHTML(player);playerCardDialog.querySelector('#close-player-card').onclick=()=>playerCardDialog.close?.();bindSeasonStatPagers(playerCardDialog);if(playerCardDialog.showModal)playerCardDialog.showModal();else playerCardDialog.setAttribute('open','');return true;
}
function openPlayerCard(pid){return openPlayerProfile(findPlayerProfile(pid))}
playerCardDialog.addEventListener('click',event=>{if(event.target===playerCardDialog)playerCardDialog.close?.()});

function openCandidateProfile(pid){
 const player=v17Draft?.candidates.find(candidate=>candidate.pid===pid);if(!player)return false;
 const position=player.keeper?'Torwart':lineNames[player.line],nation=nationData[player.nation]?.name||player.nation||'Unbekannt';
 playerCardDialog.innerHTML=`<div class="player-card-head"><div>${flagSVG(player.nation)}<p class="eyebrow">${escapeHTML(nation)} · STARTKADER</p><h2>${escapeHTML(player.name)}</h2><span>${escapeHTML(position)} · ${player.age} Jahre · ${escapeHTML(player.foot||'Rechts')}fuß</span></div><button id="close-player-card" aria-label="Spielerprofil schließen">×</button></div><div class="player-card-facts"><span>Status<b>${v17Draft.selected.includes(pid)?'Ausgewählt':'Verfügbar'}</b></span><span>Form<b>${formText(player.form||0)}</b></span><span>Fitness<b>${freshText(player.fresh??100)}</b></span><span>Gehalt<b>${annualSalary(player)} Credits/Jahr</b></span></div><section><h3>Fähigkeiten</h3>${scoutingSkillsHTML(player)}<small>Die Farben zeigen die Stärke der Fähigkeiten.</small></section><section><p>Karrierestatistiken sind nach dem ersten Spiel verfügbar.</p></section>`;
 playerCardDialog.querySelector('#close-player-card').onclick=()=>playerCardDialog.close?.();
 if(playerCardDialog.showModal)playerCardDialog.showModal();else playerCardDialog.setAttribute('open','');return true;
}

const v17RenderCandidateCards=renderOnboarding;
renderOnboarding=function(options={}){
 v17RenderCandidateCards(options);
 onboarding.querySelectorAll('.candidate-card').forEach(card=>{
  const player=v17Draft?.candidates.find(candidate=>candidate.pid===card.dataset.candidate);if(!player)return;
  const entry=document.createElement('div'),profile=document.createElement('button');
  entry.className='candidate-entry';profile.type='button';profile.className='candidate-profile';
  profile.textContent='Profil ansehen';profile.setAttribute('aria-label',`Profil von ${player.name} ansehen`);
  profile.onclick=()=>openCandidateProfile(player.pid);
  card.setAttribute('aria-pressed',String(v17Draft.selected.includes(player.pid)));
  card.replaceWith(entry);entry.append(card,profile);
 });
};

const v17OfferCardHTML=qolOfferCardHTML;
qolOfferCardHTML=function(offer,free=false){const html=v17OfferCardHTML(offer,free),name=escapeHTML(offer.player.name);return html.replace('<article class="market-card ',`<article data-player-pid="${escapeHTML(offer.player.pid)}" class="market-card `).replace(`<b>${name}</b>`,`<button class="player-link" data-open-player="${escapeHTML(offer.player.pid)}">${name}</button>`)};

function decoratePlayerCards(){
 if(!activeSave)return;const own=[activeSave.keeper,...activeSave.squad];
 clubCenter.querySelectorAll('.squad-row').forEach((row,index)=>{const player=own[index],name=row.querySelector('b');if(player&&name&&!name.querySelector('[data-open-player]'))name.innerHTML=`<button class="player-link" data-open-player="${escapeHTML(player.pid)}">#${player.n} ${escapeHTML(player.name)}</button>`});
 clubCenter.querySelectorAll('.player-history').forEach((item,index)=>{const player=own[index],name=item.querySelector('summary b');if(player&&name&&!name.querySelector('[data-open-player]'))name.innerHTML=`<button class="player-link" data-open-player="${escapeHTML(player.pid)}">#${player.n} ${escapeHTML(player.name)}</button>`});
 clubCenter.querySelectorAll('[data-open-player]').forEach(button=>button.onclick=event=>{event.preventDefault();event.stopPropagation();openPlayerCard(button.dataset.openPlayer)});
 document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
}

const v17RenderPlayerCenter=renderCenter;
renderCenter=function(){v17RenderPlayerCenter();decoratePlayerCards()};
let preMatchReplaceNumber=null;
function bindPlayerCardLinks(scope){scope.querySelectorAll('[data-open-player]').forEach(button=>button.onclick=event=>{event.preventDefault();event.stopPropagation();openPlayerCard(button.dataset.openPlayer)})}
function preMatchPlayerRow(player,starting){
 const picked=preMatchReplaceNumber===player.n,action=starting?`<button class="menu-action ${picked?'selected':''}" data-prematch-out="${player.n}">${picked?'Ausgewählt':'Wechseln'}</button>`:`<button class="menu-action" data-prematch-in="${player.n}" ${preMatchReplaceNumber?'':'disabled'}>Einwechseln</button>`;
 return`<article class="prematch-player ${picked?'selected':''}">${flagSVG(player.nation)}<div><button class="player-link" data-open-player="${escapeHTML(player.pid)}">#${player.n} ${escapeHTML(player.name)}</button><span>${transferPosition(player)} · ${player.age} J. · ${freshText(player.fresh)}</span></div>${action}</article>`;
}
function renderPreMatchLineup(){
 if(!activeSave||running)return;const panel=$('#player-panel');if(!panel)return;panel.querySelector('#prematch-lineup')?.remove();syncSquadFromLineup();const starters=activeSave.lineup.map(number=>activeSave.squad.find(player=>player.n===number)).filter(Boolean),bench=activeSave.squad.filter(player=>!player.retired&&!activeSave.lineup.includes(player.n));
 panel.insertAdjacentHTML('beforeend',`<section id="prematch-lineup" class="prematch-lineup"><div class="section-heading"><h3>Aufstellung ändern</h3><span>5 Feldspieler + Torwart</span></div><p class="help">Startspieler wählen, danach einen Bankspieler einwechseln. Rasterposition und Ausrichtung werden übernommen.</p><div class="prematch-quick"><button data-prematch-quick="fresh">Frischeste</button><button data-prematch-quick="defensive">Defensiv</button><button data-prematch-quick="offensive">Offensiv</button><button data-prematch-quick="restore" ${activeSave.quickLineup.previous?'':'disabled'}>Zurücksetzen</button></div><article class="prematch-keeper">${flagSVG(activeSave.keeper.nation)}<div><button class="player-link" data-open-player="${escapeHTML(activeSave.keeper.pid)}">#1 ${escapeHTML(activeSave.keeper.name)}</button><span>Torwart · ${activeSave.keeper.age} J. · ${freshText(activeSave.keeper.fresh)}</span></div><em>gesetzt</em></article><h4>Startaufstellung</h4><div class="prematch-list">${starters.map(player=>preMatchPlayerRow(player,true)).join('')}</div><h4>Ersatzbank</h4><div class="prematch-list">${bench.map(player=>preMatchPlayerRow(player,false)).join('')||'<p class="help">Keine Feldspieler auf der Bank.</p>'}</div><p class="prematch-status" role="status">${preMatchReplaceNumber?'Wähle jetzt einen Spieler von der Ersatzbank.':'Die Aufstellung wird nach jeder Änderung gespeichert.'}</p></section>`);
 const area=panel.querySelector('#prematch-lineup');area.querySelectorAll('[data-prematch-out]').forEach(button=>button.onclick=()=>{preMatchReplaceNumber=+button.dataset.prematchOut;renderPreMatchLineup()});area.querySelectorAll('[data-prematch-in]').forEach(button=>button.onclick=()=>swapPreMatchPlayer(+button.dataset.prematchIn));area.querySelectorAll('[data-prematch-quick]').forEach(button=>button.onclick=()=>{applyQuickLineup(button.dataset.prematchQuick);preMatchReplaceNumber=null;selected=0;render();renderPreMatchLineup()});bindPlayerCardLinks(area);
}
function swapPreMatchPlayer(inNumber){
 if(!activeSave||running||!preMatchReplaceNumber)return false;syncSquadFromLineup();const index=activeSave.lineup.indexOf(preMatchReplaceNumber),out=activeSave.squad.find(player=>player.n===preMatchReplaceNumber),incoming=activeSave.squad.find(player=>player.n===inNumber&&!player.retired);if(index<0||!out||!incoming)return false;incoming.cell=out.cell;incoming.role=out.role;activeSave.lineup[index]=incoming.n;preMatchReplaceNumber=null;syncLineupFromSquad();selected=Math.min(index,players.length-1);saveCurrent();render();renderPreMatchLineup();return true;
}
const v17ShowPlayerTactics=showTactics;
showTactics=function(){preMatchReplaceNumber=null;v17ShowPlayerTactics();renderPreMatchLineup();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39')};

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
