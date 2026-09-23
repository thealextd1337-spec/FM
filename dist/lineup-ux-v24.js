'use strict';

let v24Tab='lineup',v24Undo=null,v24Drag=null,v24SuppressClickUntil=0;

const v24Style=document.createElement('style');
v24Style.textContent=`
.prematch-context{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:-12px 0 14px}.prematch-context span{padding:10px 12px;background:#17282c;border:1px solid #34494c;border-radius:8px;color:#829694;font-size:9px;text-transform:uppercase}.prematch-context b{display:block;margin-top:4px;color:#eef5f1;font-size:12px;text-transform:none}.prematch-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px;padding:5px;background:#102126;border:1px solid #34494c;border-radius:9px}.prematch-tabs button{min-height:42px;border:0;border-radius:6px;background:transparent;color:#9db0ad;font-weight:700}.prematch-tabs button.active{background:var(--club-primary);color:#132527}.compact-bench{padding:14px 16px 16px;border-top:1px solid #34494c;background:#14262a}.compact-bench-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:9px}.compact-bench-head h3{margin:0;font-size:13px}.compact-bench-head span{color:#879b99;font-size:9px}.bench-strip{display:flex;gap:7px;overflow-x:auto;padding:2px 1px 7px;scrollbar-width:thin}.bench-chip{position:relative;display:grid;grid-template-columns:8px minmax(92px,1fr) auto;gap:7px;align-items:center;min-width:180px;padding:9px;background:#102126;border:1px solid #3b5053;border-radius:8px}.bench-chip.drag-over,.cell.drag-over{border-color:var(--club-primary)!important;background:color-mix(in srgb,var(--club-primary) 14%,#102126)!important}.bench-select{min-width:0;padding:0;border:0;background:transparent;color:#edf5f0;text-align:left}.bench-select b,.bench-select small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bench-select b{font-size:11px}.bench-select small{margin-top:3px;color:#879b99;font-size:8px}.fitness-dot{width:8px;height:8px;border-radius:50%;background:#F26BB5}.fitness-dot.ready{background:#E9CF59}.fitness-dot.tired{background:#91AEC4}.bench-chip .player-link{font-size:9px}.compact-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:8px}.compact-actions button{min-height:34px;padding:6px;border:1px solid #43575a;border-radius:6px;background:#23363b;color:#dce7e3;font-size:8px}.compact-actions button:disabled{opacity:.4}.lineup-status{min-height:18px;margin:9px 0 0;color:#9fb1ae;font-size:9px;text-align:center}.lineup-status.warning{color:#e4be78}.selected-compact{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:11px;background:#102126;border:1px solid #384d50;border-radius:8px}.selected-compact b,.selected-compact span{display:block}.selected-compact span{margin-top:4px;color:#91a4a2;font-size:9px}.selected-compact .position-warning{color:#e4be78}.selected-compact .player-link{padding:7px}.cell[draggable=true],.bench-chip[draggable=true]{cursor:grab}.cell.dragging,.bench-chip.dragging{opacity:.45}.drag-ghost{position:fixed;z-index:9999;pointer-events:none;padding:8px 11px;border:1px solid var(--club-primary);border-radius:8px;background:#102126;color:#fff;font-size:11px;box-shadow:0 12px 30px #000b;transform:translate(12px,12px)}.keeper small{font-size:8px;color:#c9d8d2}.pitch .player-label{max-width:88px}.cell .fitness-dot{position:absolute;left:9px;top:9px;width:6px;height:6px}.player-panel-slim>.duel-help{display:none}#roster{display:none!important}.prematch-lineup{display:none!important}
@media(max-width:760px){.prematch-context{grid-template-columns:repeat(3,1fr);margin-top:-6px}.prematch-context span{padding:8px;font-size:8px}.prematch-tabs{position:sticky;top:6px;z-index:20}.compact-bench{padding:12px}.bench-chip{min-width:164px}.compact-actions{grid-template-columns:repeat(2,1fr)}#start:not([hidden]){position:sticky;bottom:10px;z-index:18;box-shadow:0 10px 35px #071012dd}.workspace{gap:12px}.player-panel-slim{margin-bottom:8px}.pitch{height:440px}}
`;
document.head.append(v24Style);
v24Style.textContent+=`.bench-chip{min-width:270px;grid-template-columns:8px minmax(0,1fr) auto;gap:9px;padding:10px}.bench-select{display:block;min-height:46px;width:100%;text-align:left}.bench-title{display:flex;align-items:center;gap:7px}.bench-title .flag-icon{width:25px;height:17px;flex:none}.bench-select b{font-size:12px;line-height:1.3}.bench-meta{display:block;margin-top:5px;color:#b9ccc6;font-size:11px;line-height:1.35;white-space:normal}.bench-meta strong{color:#f0f6f1}.bench-chip .player-link{min-height:44px;padding:8px 10px;border:1px solid #56716d;border-radius:6px;background:#20383a;color:#f0f6f1;font-size:11px;font-weight:700}@media(max-width:760px){.bench-chip{min-width:255px}}`;
v24Style.textContent+=`.grid .cell .player-label{display:flex;align-items:center;justify-content:center;gap:3px;max-width:100%;white-space:nowrap}.grid .cell .player-label .flag-icon{width:16px;height:11px;flex:none}.grid .cell .player-label span{min-width:0;overflow:hidden;text-overflow:ellipsis}.keeper .flag-icon{width:16px;height:11px;margin-right:3px}@media(max-width:480px){.grid .cell .player-label .flag-icon{width:13px;height:9px}}`;
v24Style.textContent+=`.grid .cell .position-label{display:block;margin-top:2px;color:#c7e2d0;font-size:8px;font-weight:700;line-height:1;letter-spacing:.5px}@media(max-width:760px){.grid .cell .position-label{font-size:7px}}`;
v24Style.textContent+=`.bench-skills{display:block;margin-top:4px;color:#a9c8be;font-size:10px;line-height:1.4;white-space:normal}`;
v24Style.textContent+=`.cell[draggable=true],.bench-chip[draggable=true]{touch-action:none}`;

function v24FitnessClass(value){return value<52?'tired':value<72?'ready':'fresh'}
function v24PositionWarning(player){
 const row=Math.floor(player.cell/5)+1;
 if(player.line==='def'&&row<=3)return'Dieser Verteidiger steht sehr offensiv.';
 if(player.line==='att'&&row>=5)return'Dieser Angreifer steht sehr defensiv.';
 return'';
}
function v24Snapshot(){
 if(!activeSave)return null;syncSquadFromLineup();
 return{lineup:[...activeSave.lineup],squad:structuredClone(activeSave.squad),formation,press,direct};
}
function v24Remember(){v24Undo=v24Snapshot()}
function v24UndoLast(){
 if(!v24Undo||!activeSave||running)return false;
 activeSave.lineup=[...v24Undo.lineup];activeSave.squad=structuredClone(v24Undo.squad);formation=v24Undo.formation;press=v24Undo.press;direct=v24Undo.direct;v24Undo=null;
 syncLineupFromSquad();selected=Math.min(selected,players.length-1);saveCurrent();render();return true;
}
function v24Validation(){
 const errors=[];
 if(!activeSave?.keeper||activeSave.keeper.retired)errors.push('Ein aktiver Torwart fehlt.');
 if(players.length!==5||new Set(players.map(player=>player.n)).size!==5)errors.push('Es müssen fünf Feldspieler aufgestellt sein.');
 if(new Set(players.map(player=>player.cell)).size!==players.length)errors.push('Zwei Spieler belegen dasselbe Rasterfeld.');
 if(!players.some(player=>Math.floor(player.cell/5)>=4))errors.push('Mindestens ein Feldspieler muss defensiv positioniert sein.');
 return errors;
}
function v24SetStatus(text,warning=false){const status=document.querySelector('#lineup-status');if(status){status.textContent=text;status.classList.toggle('warning',warning)}}
function v24UpdateReadiness(){
 const errors=v24Validation(),startButton=$('#start');
 if(startButton){startButton.disabled=Boolean(errors.length);startButton.title=errors[0]||''}
 v24SetStatus(errors[0]||'Aufstellung gültig · Änderungen werden automatisch gespeichert.',Boolean(errors.length));
}
function v24BenchPlayers(){return activeSave.squad.filter(player=>!player.retired&&!activeSave.lineup.includes(player.n))}
function v24FatigueText(value){return value>=88?'keine':value>=72?'gering':value>=52?'leicht':value>=32?'müde':'erschöpft'}
function v24TopSkills(player){
 const skills=[['Technik','tec'],['Passspiel','pas'],['Abschluss','fin'],['Zweikampf','tak'],['Stellungsspiel','pos'],['Geschwindigkeit','spd'],['Kondition','sta'],['Luftspiel','air']];
 return skills.map(([label,key],index)=>({label,key,index,value:player[key]??0})).sort((a,b)=>b.value-a.value||a.index-b.index).slice(0,3).map(skill=>`${skill.label} ${scoutingBand(skill.value,player,skill.key)}`).join(' · ');
}
function v24BenchHTML(player){
 return`<article class="bench-chip" draggable="true" data-drag-player="${player.n}" data-drag-kind="bench" data-bank-player="${player.n}"><i class="fitness-dot ${v24FitnessClass(player.fresh)}"></i><button class="bench-select" data-bench-select="${player.n}" aria-label="${escapeHTML(player.name)} einwechseln"><span class="bench-title">${flagSVG(player.nation)}<b>#${player.n} ${escapeHTML(player.name)}</b></span><span class="bench-meta"><strong>${escapeHTML(transferPosition(player))}</strong> · Müdigkeit: ${v24FatigueText(player.fresh)}</span><span class="bench-skills">${escapeHTML(v24TopSkills(player))}</span></button><button class="player-link" data-open-player="${escapeHTML(player.pid)}" aria-label="Details zu ${escapeHTML(player.name)} öffnen">Details</button></article>`;
}
function v24SelectedCompact(){
 const panel=$('#player-panel'),player=players[selected];if(!panel||!player)return;
 panel.classList.add('player-panel-slim');
 const heading=panel.querySelector('.section-heading h2'),count=panel.querySelector('.section-heading span'),help=panel.querySelector(':scope > .help');
 if(heading)heading.textContent='Aufstellung';if(count)count.textContent='5 Feldspieler + Torwart';if(help)help.textContent='Spieler antippen oder direkt zwischen Spielfeld und Bank ziehen.';
 const warning=v24PositionWarning(player),target=$('#selected-player');
 target.innerHTML=`<div class="selected-compact"><div><button class="player-link" data-open-player="${escapeHTML(player.pid)}">#${player.n} ${escapeHTML(player.name)}</button><span>${escapeHTML(lineNames[player.line])} · ${player.age} J. · Form ${escapeHTML(formText(player.form))} · ${escapeHTML(freshText(player.fresh))}</span>${warning?`<span class="position-warning">${escapeHTML(warning)}</span>`:''}</div><button class="player-link" data-open-player="${escapeHTML(player.pid)}">Statistik</button></div>`;
 bindPlayerCardLinks(target);
}
function v24DecorateGrid(){
 const grid=$('#grid');if(!grid)return;
 grid.querySelectorAll('[data-cell]').forEach(cell=>{const player=players.find(item=>item.cell===+cell.dataset.cell);cell.dataset.dropCell=cell.dataset.cell;if(player){cell.draggable=true;cell.dataset.dragPlayer=player.n;cell.dataset.dragKind='pitch';const position={def:'VER',mid:'MIT',att:'ANG'}[player.line]||'';cell.setAttribute('aria-label',`${player.name}, ${position}, ${nationData[player.nation]?.name||player.nation||'Nationalität unbekannt'}, Spieler auswählen, Reihe ${Math.floor(player.cell/5)+1}, Spalte ${player.cell%5+1}`);const label=cell.querySelector('.player-label');if(label){label.innerHTML=`${flagSVG(player.nation)}<span>${escapeHTML(player.name.toUpperCase())}</span>`;const positionLabel=cell.querySelector('.position-label');if(positionLabel)positionLabel.textContent=position;else label.insertAdjacentHTML('beforebegin',`<span class="position-label">${position}</span>`)}const dot=document.createElement('i');dot.className=`fitness-dot ${v24FitnessClass(player.fresh)}`;cell.append(dot)}else{cell.draggable=false;delete cell.dataset.dragPlayer;delete cell.dataset.dragKind}});
 const keeper=document.querySelector('#setup-pitch .keeper');if(keeper&&activeSave?.keeper){keeper.innerHTML=`<b>1</b><button class="player-link" data-open-player="${escapeHTML(activeSave.keeper.pid)}">${escapeHTML(activeSave.keeper.name.toUpperCase())} · TW</button><small>${escapeHTML(freshText(activeSave.keeper.fresh))}</small>`;bindPlayerCardLinks(keeper)}
}
function renderPreMatchLineup(){
 if(!activeSave||running)return;
 syncSquadFromLineup();document.querySelector('#prematch-lineup')?.remove();
 let area=$('#compact-bench');if(!area){area=document.createElement('section');area.id='compact-bench';area.className='compact-bench';$('#setup-pitch').insertAdjacentElement('afterend',area)}
 const bench=v24BenchPlayers();area.innerHTML=`<div class="compact-bench-head"><h3>Ersatzbank</h3><span>Ziehen oder Feldspieler wählen und Ersatz antippen</span></div><div class="bench-strip" id="bench-strip">${bench.map(v24BenchHTML).join('')||'<p class="help">Keine Feldspieler auf der Bank.</p>'}</div><div class="compact-actions"><button data-v24-quick="fresh">Frischeste</button><button data-v24-quick="defensive">Defensiver</button><button data-v24-quick="offensive">Offensiver</button><button data-v24-undo ${v24Undo?'':'disabled'}>Letzte Änderung zurücknehmen</button></div><p id="lineup-status" class="lineup-status" role="status"></p>`;
 area.querySelectorAll('[data-bench-select]').forEach(button=>button.onclick=()=>{if(Date.now()<v24SuppressClickUntil)return;v24SwapWithBench(players[selected]?.n,+button.dataset.benchSelect)});
 area.querySelectorAll('[data-v24-quick]').forEach(button=>button.onclick=()=>{v24Remember();applyQuickLineup(button.dataset.v24Quick);selected=0;render()});
 area.querySelector('[data-v24-undo]')?.addEventListener('click',v24UndoLast);bindPlayerCardLinks(area);v24UpdateReadiness();
}
function v24SwapWithBench(outNumber,inNumber){
 if(!activeSave||running||outNumber===inNumber)return false;syncSquadFromLineup();
 const index=activeSave.lineup.indexOf(outNumber),out=activeSave.squad.find(player=>player.n===outNumber),incoming=activeSave.squad.find(player=>player.n===inNumber&&!player.retired);if(index<0||!out||!incoming)return false;
 v24Remember();incoming.cell=out.cell;incoming.role=out.role;incoming.assignedLine=incoming.line;activeSave.lineup[index]=incoming.n;syncLineupFromSquad();selected=index;saveCurrent();render();v24SetStatus(`${incoming.name} ersetzt ${out.name}.`);return true;
}
function v24MoveOnPitch(number,targetCell){
 if(!activeSave||running)return false;const source=players.find(player=>player.n===number),target=players.find(player=>player.cell===targetCell);if(!source||source===target)return false;
 v24Remember();const oldCell=source.cell;source.cell=targetCell;if(target)target.cell=oldCell;selected=players.indexOf(source);formation='custom';saveCurrent();render();v24SetStatus(target?`${source.name} und ${target.name} tauschen die Positionen.`:`${source.name} wurde im Raster verschoben.`);return true;
}
function v24HandleDrop(source,target){
 if(!source||!target||running)return false;
 const cell=target.closest?.('[data-drop-cell]'),bank=target.closest?.('[data-bank-player]');
 if(cell){const occupied=players.find(player=>player.cell===+cell.dataset.dropCell);if(source.kind==='bench'){if(!occupied){v24SetStatus('Ziehe den Bankspieler auf einen Feldspieler, um ihn einzuwechseln.',true);return false}return v24SwapWithBench(occupied.n,source.number)}return v24MoveOnPitch(source.number,+cell.dataset.dropCell)}
 if(bank&&source.kind==='pitch')return v24SwapWithBench(source.number,+bank.dataset.bankPlayer);
 if(target.closest?.('#compact-bench')&&source.kind==='pitch'){v24SetStatus('Ziehe den Feldspieler direkt auf den gewünschten Bankspieler.',true);return false}
 return false;
}
let v24ScrollFrame=0;
function v24HighlightDrag(x,y){document.querySelectorAll('.drag-over').forEach(item=>item.classList.remove('drag-over'));document.elementFromPoint(x,y)?.closest?.('[data-drop-cell],[data-bank-player],#compact-bench')?.classList.add('drag-over')}
function v24ScrollDuringDrag(){
 v24ScrollFrame=0;if(!v24Drag?.dragging)return;
 const edge=72,y=v24Drag.clientY,height=window.innerHeight;
 if(Number.isFinite(y)){
  const speed=y<edge?-Math.ceil((edge-y)/edge*16):y>height-edge?Math.ceil((y-height+edge)/edge*16):0;
  if(speed){window.scrollBy(0,speed);v24HighlightDrag(v24Drag.clientX,y)}
 }
 v24ScrollFrame=requestAnimationFrame(v24ScrollDuringDrag);
}
function v24TrackDrag(x,y){v24Drag.clientX=x;v24Drag.clientY=y;if(!v24ScrollFrame)v24ScrollFrame=requestAnimationFrame(v24ScrollDuringDrag)}
function v24ClearDrag(){if(v24ScrollFrame)cancelAnimationFrame(v24ScrollFrame);v24ScrollFrame=0;document.querySelectorAll('.dragging,.drag-over').forEach(element=>element.classList.remove('dragging','drag-over'));document.querySelector('.drag-ghost')?.remove();v24Drag=null}
document.addEventListener('dragstart',event=>{const source=event.target.closest?.('[data-drag-player]');if(!source||running)return;v24Drag={number:+source.dataset.dragPlayer,kind:source.dataset.dragKind,dragging:true};source.classList.add('dragging');event.dataTransfer?.setData('text/plain',JSON.stringify(v24Drag));if(event.dataTransfer)event.dataTransfer.effectAllowed='move'});
document.addEventListener('dragover',event=>{if(!v24Drag)return;v24TrackDrag(event.clientX,event.clientY);const target=event.target.closest?.('[data-drop-cell],[data-bank-player],#compact-bench');if(target){event.preventDefault();v24HighlightDrag(event.clientX,event.clientY)}});
document.addEventListener('drop',event=>{if(!v24Drag)return;event.preventDefault();const source=v24Drag;v24ClearDrag();v24HandleDrop(source,event.target)});
document.addEventListener('dragend',v24ClearDrag);
document.addEventListener('pointerdown',event=>{const source=event.target.closest?.('[data-drag-player]');if(!source||running||event.pointerType==='mouse')return;v24Drag={number:+source.dataset.dragPlayer,kind:source.dataset.dragKind,pointer:event.pointerId,x:event.clientX,y:event.clientY,dragging:false,source}});
 document.addEventListener('pointermove',event=>{if(!v24Drag||v24Drag.pointer!==event.pointerId)return;const distance=Math.hypot(event.clientX-v24Drag.x,event.clientY-v24Drag.y);if(!v24Drag.dragging&&distance<9)return;if(!v24Drag.dragging){v24Drag.dragging=true;v24Drag.source.classList.add('dragging');const ghost=document.createElement('div');ghost.className='drag-ghost';ghost.textContent=v24Drag.source.querySelector('b,.player-label,button')?.textContent||'Spieler';document.body.append(ghost)}event.preventDefault();v24TrackDrag(event.clientX,event.clientY);const ghost=document.querySelector('.drag-ghost');if(ghost){ghost.style.left=`${event.clientX}px`;ghost.style.top=`${event.clientY}px`}v24HighlightDrag(event.clientX,event.clientY)},{passive:false});
document.addEventListener('pointerup',event=>{if(!v24Drag||v24Drag.pointer!==event.pointerId)return;const source={number:v24Drag.number,kind:v24Drag.kind},wasDragging=v24Drag.dragging,target=document.elementFromPoint(event.clientX,event.clientY);v24ClearDrag();if(wasDragging){v24SuppressClickUntil=Date.now()+450;v24HandleDrop(source,target)}});
document.addEventListener('pointercancel',event=>{if(v24Drag?.pointer===event.pointerId)v24ClearDrag()});
document.addEventListener('click',event=>{if(Date.now()<v24SuppressClickUntil&&event.target.closest?.('[data-cell],[data-drag-player]')){event.preventDefault();event.stopImmediatePropagation()}},true);

function v24Tabs(){
 let tabs=$('#prematch-tabs');if(!tabs){tabs=document.createElement('nav');tabs.id='prematch-tabs';tabs.className='prematch-tabs';tabs.setAttribute('aria-label','Vor dem Spiel');tabs.innerHTML='<button data-v24-tab="lineup">Aufstellung</button><button data-v24-tab="tactics">Taktik</button>';document.querySelector('#game-screen .workspace').before(tabs);tabs.querySelectorAll('[data-v24-tab]').forEach(button=>button.onclick=()=>{v24Tab=button.dataset.v24Tab;v24ApplyTab()})}v24ApplyTab();
}
function v24ApplyTab(){
 const tabs=$('#prematch-tabs'),playerPanel=$('#player-panel'),tacticsPanel=$('#tactics-panel'),bench=$('#compact-bench'),help=$('#pitch-help'),roleBar=$('#pitch-role-bar');if(!tabs)return;
 tabs.hidden=running;tabs.querySelectorAll('[data-v24-tab]').forEach(button=>{const active=button.dataset.v24Tab===v24Tab;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active)});
 if(!running){if(playerPanel)playerPanel.hidden=v24Tab!=='lineup';if(tacticsPanel)tacticsPanel.hidden=v24Tab!=='tactics';if(bench)bench.hidden=v24Tab!=='lineup';if(help)help.hidden=v24Tab!=='lineup';if(roleBar)roleBar.hidden=v24Tab!=='lineup'}
}
function v24OpponentContext(){
 let context=$('#prematch-context');if(!context){context=document.createElement('section');context.id='prematch-context';context.className='prematch-context';document.querySelector('#game-screen .intro').insertAdjacentElement('afterend',context)}
 if(!activeSave)return;const opponent=activeOpponent(),rank=standings().findIndex(team=>team.id===opponent.id)+1,fixture=userFixture(),venue=fixture?.home==='user'?'Heimspiel':'Auswärtsspiel',strength=opponent.strength>=75?'stark':opponent.strength>=70?'ausgeglichen':'machbar',color=typeof v55SkillColor==='function'?` style="color:${v55SkillColor(Math.round(opponent.strength/5))}"`:'';context.innerHTML=`<span>Partie<b>${escapeHTML(venue)}</b></span><span>Gegner<b${color}>${escapeHTML(strength)}</b></span><span>Tabelle<b>Platz ${rank||'-'}</b></span>`;context.hidden=running;
}
function v24DecoratePrematch(){if(!activeSave||running)return;v24DecorateGrid();v24SelectedCompact();renderPreMatchLineup();v24Tabs();v24OpponentContext()}

const v23Render=render;
render=function(){v23Render();v24DecoratePrematch()};
const v23ShowTactics=showTactics;
showTactics=function(){v24Tab='lineup';v23ShowTactics();v24DecoratePrematch();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39')};
const v23Start=start;
start=function(){const result=v23Start();if(running){$('#prematch-tabs')?.setAttribute('hidden','');$('#prematch-context')?.setAttribute('hidden','');$('#compact-bench')?.setAttribute('hidden','')}return result};$('#start').onclick=()=>start();

function v24EnsureSeasonOneFreeAgents(){
 if(!activeSave||activeSave.seasonNumber!==1)return;const state=transferState();initMarketClock();
 if(!state.seasonOneFreePrepared){state.seasonOneFreePrepared=true;state.open=false;state.offers=[];for(const line of['gk','def','mid','att',pick(['def','mid','att'])]){const offer=makeOffer('free',line,59+Math.floor(Math.random()*7),23+Math.floor(Math.random()*13));offer.status='active';offer.expiresDay=99;state.offers.push(offer)}}
}
function v24SeasonOneMarket(){
 if(!activeSave||activeSave.seasonNumber!==1||activeSave.currentRound>=10||activeSave.finance?.gameOver)return;v24EnsureSeasonOneFreeAgents();const state=transferState(),free=state.offers.filter(offer=>offer.kind==='free'&&!offer.signed&&offer.status==='active');
 const finance=clubCenter.querySelector('.finance-panel'),lead=clubCenter.querySelector('.center-lead');if(!finance&&!lead)return;
 const panel=document.createElement('details');panel.className='panel season-one-free';panel.innerHTML=`<summary><div><p class="eyebrow">ZWISCHEN DEN SPIELTAGEN</p><h2>Ablösefreie Spieler</h2></div><strong>${free.length} verfügbar</strong></summary><p class="help">Keine Ablöse, aber das Jahresgehalt zählt vollständig. Neue Spieler sind ab dem nächsten Spiel einsetzbar.</p><div class="market-grid">${free.map(offer=>qolOfferCardHTML(offer,true)).join('')||'<p class="help">Aktuell sind keine ablösefreien Spieler verfügbar.</p>'}</div>`;(finance||lead).insertAdjacentElement('afterend',panel);
 panel.querySelectorAll('[data-free-sign]').forEach(button=>button.onclick=()=>{button.disabled=true;signFreeAgent(button.dataset.freeSign)});bindPlayerCardLinks(panel);
}
const v23RenderCenter=renderCenter;
renderCenter=function(){v24EnsureSeasonOneFreeAgents();v23RenderCenter();v24SeasonOneMarket();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39')};

document.querySelector('#grid')?.addEventListener('click',event=>{const cell=event.target.closest('[data-cell]');if(cell&&!players.some(player=>player.cell===+cell.dataset.cell))v24Remember()},true);
document.querySelector('#roles')?.addEventListener('click',event=>{if(event.target.closest('[data-role]'))v24Remember()},true);
document.querySelector('#tactics-panel')?.addEventListener('click',event=>{if(event.target.closest('[data-formation]'))v24Remember()},true);

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
