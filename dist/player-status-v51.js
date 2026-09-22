'use strict';

// Form remains a record of recent results. The displayed and simulated form
// follows the player's current freshness, including gradual match fatigue.
const v51FormKeys=['very-weak','weak','normal','good','very-good'];
const v51FormColors={'very-weak':'#9865D6',weak:'#4C9DE8',normal:'#49C67D',good:'#F18B38','very-good':'#F0525D'};
function v51Workload(player,earlyPress=false){
 const base=player.keeper?9:20+(100-(player.sta||70))*.12+(earlyPress?6:0)+(player.age>=33?3:0);
 return base*(1-clamp(player.form||0,-2,2)*.05);
}
function v51LiveFreshness(player){
 const initial=clamp(player.fresh??100,0,100);
 if(!match?.people?.includes(player))return initial;
 return clamp(initial-v51Workload(player,player.t===0&&Boolean(press))*clamp(match.elapsed/75,0,1),0,100);
}
function v51EffectiveForm(player,freshness=v51LiveFreshness(player)){
 const cap=freshness>=88?2:freshness>=72?1:freshness>=52?0:freshness>=32?-1:-2;
 return Math.min(clamp(player.form||0,-2,2),cap);
}
function v51FreshnessKey(freshness){
 return freshness>=88?'fresh':freshness>=72?'ready':freshness>=52?'slightly-tired':freshness>=32?'tired':'exhausted';
}
function v51StatusHTML(player,freshness=v51LiveFreshness(player)){
 const form=v51EffectiveForm(player,freshness),face=v51FormKeys[form+2];
 const label=`Form: ${formText(form)}; Frische: ${freshText(freshness)} (${Math.round(freshness)} von 100)`;
 return `<span class="v51-status" role="img" aria-label="${escapeHTML(label)}" style="--v51-status-color:${v51FormColors[face]}"><img class="v51-face" src="${v51StatusFaces[face]}" data-v51-face="${face}" alt=""><span class="v51-bar" aria-hidden="true"><span class="v51-bar-fill" style="transform:scaleX(${(clamp(freshness,0,100)/100).toFixed(3)})"></span></span></span>`;
}
function v51PitchFaceHTML(player){
 const face=v51FormKeys[v51EffectiveForm(player)+2];
 return `<span class="v51-pitch-face" aria-hidden="true"><img src="${v51StatusFaces[face]}" alt=""></span>`;
}
function v51PitchBarHTML(player){
 const face=v51FormKeys[v51EffectiveForm(player)+2];
 return `<span class="v51-pitch-bar" aria-hidden="true" style="--v51-status-color:${v51FormColors[face]}"><span class="v51-pitch-bar-fill" style="transform:scaleY(${(clamp(player.fresh??100,0,100)/100).toFixed(3)})"></span></span>`;
}
function v51TopSkills(player){
 if(!player.keeper)return v24TopSkills(player);
 return [['Torwartspiel','gk'],['Passspiel','pas'],['Stellungsspiel','pos'],['Geschwindigkeit','spd'],['Kondition','sta']]
  .map(([label,key],index)=>({label,key,index,value:player[key]??0}))
  .sort((a,b)=>b.value-a.value||a.index-b.index).slice(0,3)
  .map(skill=>`${skill.label} ${scoutingBand(skill.value,player,skill.key)}`).join(' · ');
}

const v51Style=document.createElement('style');
v51Style.textContent=`
.v51-status{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;vertical-align:middle}.v51-face{display:block;width:32px;height:32px}.v51-bar{position:relative;display:block;flex:none;width:64px;height:10px;overflow:hidden;border-radius:5px;background:#415558}.v51-bar-fill{position:absolute;inset:1px;border-radius:4px;background:var(--v51-status-color,#86CF99);transform-origin:left center;transition:transform .45s linear,background-color .45s ease}
.v51-starters{padding:13px 16px;border-top:1px solid #34494c;background:#172b2e}.v51-starters h3{margin:0 0 9px;font-size:13px}.v51-starter-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.v51-starter{min-width:0;border:1px solid #3b5053;border-radius:7px;background:#102126;padding:9px 10px}.v51-starter-head{display:block}.v51-starter-head button{display:block;max-width:100%;border:0;padding:0;background:none;color:#eef6f2;font-size:11px;font-weight:700;text-align:left;white-space:normal}.v51-starter-head button:hover{text-decoration:underline}.v51-starter-head .v51-status{display:flex;width:max-content;margin-top:3px}.v51-starter small{display:block;margin-top:4px;color:#abc4b9;font-size:10px;line-height:1.35}
.bench-chip{grid-template-columns:minmax(0,1fr) auto}.bench-chip>.fitness-dot{display:none}.bench-select>.v51-status{margin-top:5px}.pitch-role-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.pitch-role-meta>.v51-status{flex:none}.grid .cell .position-label{align-self:flex-start;width:100%;padding-left:3px;text-align:left;font-weight:800}.grid .cell .player-label{width:100%;padding-left:3px;justify-content:flex-start;text-align:left}.grid .cell>.fitness-dot{display:none}.v51-pitch-face{position:absolute;z-index:2;left:calc(50% + 5px);top:calc(50% - 11px);width:24px;height:24px;pointer-events:none}.v51-pitch-face img{display:block;width:100%;height:100%}.keeper .v51-pitch-face{top:4px;left:calc(50% + 8px)}.keeper .v51-keeper-position{display:block;align-self:stretch;text-align:left;font-size:9px;font-weight:800;color:#e6f3e9}.keeper .player-link{text-align:left;width:100%}
.v51-live-status{padding:11px 13px 14px;border-top:1px solid #34494c;background:#172b2e}.v51-live-status h3{margin:0 0 8px;font-size:13px}.v51-live-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.v51-live-player{min-width:0;padding:6px 7px;background:#102126;border:1px solid #3b5053;border-radius:6px}.v51-live-player b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.v51-live-player .v51-status{margin-top:3px}.v51-face.v51-changed{animation:v51FaceChange .7s cubic-bezier(.22,1,.36,1)}@keyframes v51FaceChange{from{opacity:.25;transform:translateY(2px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:760px){.v51-live-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v51-starter-grid{grid-template-columns:1fr}.v51-starter{padding:8px 9px}.grid .cell .position-label,.grid .cell .player-label{padding-left:1px}.keeper .v51-keeper-position{font-size:8px}}
.bench-strip{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:visible}.bench-chip{min-width:0;grid-template-columns:minmax(0,1fr) auto;width:100%}.bench-chip>.fitness-dot{display:none}.bench-select>.v51-status{display:flex;width:100%;justify-content:center;margin:7px 0}.bench-select .bench-title,.bench-select .bench-title b,.bench-select .bench-skills{white-space:normal}.v51-keeper-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.v51-keeper-info{min-width:0}.v51-keeper-card .bench-title{display:flex;align-items:center;gap:7px}.v51-keeper-card .bench-title .flag-icon{width:25px;height:17px;flex:none}.v51-keeper-card .v51-status{display:flex;justify-content:center;margin:7px 0}.v51-keeper-card .bench-meta{display:block;color:#b9ccc6;font-size:11px}.v51-keeper-card small{margin-top:5px}.v51-keeper-card .player-link{min-height:44px;padding:8px 10px;border:1px solid #56716d;border-radius:6px;background:#20383a;color:#f0f6f1;font-size:11px;font-weight:700}
.v51-starter[draggable=true]{cursor:grab;touch-action:none}.v51-starter.dragging{opacity:.45}.v51-starter.drag-over{border-color:var(--club-primary);background:color-mix(in srgb,var(--club-primary) 14%,#102126)}
.v51-starter,.bench-chip{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;min-height:0;padding:10px 11px}.v51-card-main{display:grid;grid-template-columns:minmax(0,1fr);justify-items:stretch;gap:5px;min-width:0;width:100%;padding:0;border:0;background:none;color:#eef6f2;text-align:left}.v51-card-title{display:flex;align-items:center;gap:8px;min-width:0;font-size:13px;line-height:1.3}.v51-card-title .flag-icon{width:27px;height:18px;flex:none}.v51-card-title b{min-width:0;white-space:normal;overflow-wrap:anywhere}.v51-card-main>.v51-status{display:flex;justify-self:center;margin:0}.v51-card-meta{color:#c4d3cc;font-size:12px;line-height:1.35}.v51-card-meta strong{color:#f0f6f1}.v51-card-skills{color:#abc4b9;font-size:11px;line-height:1.4}.v51-starter .player-link,.bench-chip .player-link{min-height:44px;padding:8px 10px;border:1px solid #56716d;border-radius:6px;background:#20383a;color:#f0f6f1;font-size:12px;font-weight:700}.v51-keeper-card{align-items:center}.compact-actions button{min-height:44px;padding:8px 10px;font-size:13px;line-height:1.2}.v51-pitch-bar{position:absolute;z-index:2;left:calc(50% + 34px);top:calc(50% - 11px);width:6px;height:24px;overflow:hidden;border-radius:4px;background:#415558;pointer-events:none}.v51-pitch-bar-fill{position:absolute;inset:1px;border-radius:3px;background:var(--v51-status-color);transform-origin:center bottom}.keeper .v51-pitch-bar{top:4px;left:calc(50% + 37px)}.keeper>small{display:none}
.v51-card-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px 12px;min-width:0}.v51-card-head>.v51-status,.v51-keeper-card .v51-card-head>.v51-status{display:inline-flex;justify-content:flex-start;margin:0}.v51-card-title{flex:1 1 auto}.v51-card-title :is(b,a,button){min-width:0;white-space:normal;overflow-wrap:anywhere;font-size:13px;font-weight:800;line-height:1.3}.v51-card-profile,.v51-card-select-name,.v51-card-pick{border:0;padding:0;background:none;color:#eef6f2;text-align:left}.v51-card-profile{text-decoration:underline;text-decoration-color:#8dacaa;text-underline-offset:3px}.v51-card-profile:hover{color:var(--club-primary)}.v51-card-select-name{display:none}.v51-card-pick{display:inline-flex;flex:none;align-items:center}.v51-card-pick .v51-status{display:inline-flex}.v51-card-main:has(.v51-card-pick){cursor:default}@media(hover:none),(pointer:coarse){.v51-card-profile{display:none}.v51-card-select-name{display:inline}}#setup-pitch .keeper{width:min(144px,70%);gap:1px}#setup-pitch .keeper .v51-keeper-position{font-size:9px;line-height:1.1}#setup-pitch .keeper .player-link{display:flex;align-items:center;gap:3px;font-size:9px;line-height:1.1;letter-spacing:.3px}#setup-pitch .keeper .player-link .flag-icon{width:14px;height:10px;flex:none}#setup-pitch .keeper .v51-pitch-face{top:2px}#setup-pitch .keeper .v51-pitch-bar{top:1px;left:calc(50% + 42px);height:30px;width:7px;border:1px solid #b8d6c7;background:#163538}
@media(max-width:760px){.bench-strip{grid-template-columns:1fr}}
@media(max-width:480px){.v51-card-profile{display:none}.v51-card-select-name{display:inline}}
.v51-starter .v51-card-head{justify-content:flex-start}.v51-starter .v51-card-title{flex:0 1 auto}#setup-pitch .keeper .v51-keeper-position{padding-left:17px}
@media(prefers-reduced-motion:reduce){.v51-face.v51-changed{animation:none}.v51-bar-fill{transition:none}}
`;
document.head.append(v51Style);

if(typeof v24BenchHTML==='function'){
 v24BenchHTML=function(player){return `<article class="bench-chip" draggable="true" data-drag-player="${player.n}" data-drag-kind="bench" data-bank-player="${player.n}"><button type="button" class="bench-select v51-card-main" data-bench-select="${player.n}" aria-label="${escapeHTML(player.name)} einwechseln">${v51LineupCardContent(player,transferPosition(player))}</button><button type="button" class="player-link" data-open-player="${escapeHTML(player.pid)}" aria-label="Details zu ${escapeHTML(player.name)} öffnen">Details</button></article>`};
}

function v51LineupCardContent(player,position,selectCell=null){
 const name=`#${player.n} ${escapeHTML(player.name)}`;
 const label=selectCell===null?`<b>${name}</b>`:`<a class="v51-card-profile" href="#spielerprofil" data-open-player="${escapeHTML(player.pid)}" aria-label="Statistiken von ${escapeHTML(player.name)} öffnen">${name}</a><button type="button" class="v51-card-select-name" data-v51-select="${selectCell}" aria-label="${escapeHTML(player.name)} auf dem Feld auswählen">${name}</button>`;
 const status=v51StatusHTML(player),condition=selectCell===null?status:`<button type="button" class="v51-card-pick" data-v51-select="${selectCell}" aria-label="Ausrichtung von ${escapeHTML(player.name)} anzeigen">${status}</button>`;
 return `<span class="v51-card-head"><span class="v51-card-title">${flagSVG(player.nation)}${label}</span>${condition}</span><span class="v51-card-meta"><strong>${escapeHTML(position)}</strong> · Müdigkeit: ${v24FatigueText(player.fresh??100)}</span><span class="v51-card-skills">${escapeHTML(v51TopSkills(player))}</span>`;
}

function v51OrderedStarters(starters=[...players,homeKeeper]){
 const order={gk:0,def:1,mid:2,att:3};
 return [...starters].sort((a,b)=>(order[a.keeper?'gk':a.assignedLine||a.line]??4)-(order[b.keeper?'gk':b.assignedLine||b.line]??4));
}
function v51StarterPanel(){
 if(!activeSave||running)return;
 let panel=$('#v51-starters');if(!panel){panel=document.createElement('section');panel.id='v51-starters';panel.className='v51-starters';$('#setup-pitch').insertAdjacentElement('afterend',panel)}
 const starters=v51OrderedStarters();
 panel.innerHTML=`<h3>Startaufstellung · Form und Müdigkeit</h3><div class="v51-starter-grid">${starters.map(player=>{
  const position=player.keeper?'Torwart':v25PositionShort[player.assignedLine||player.line];
  const details=`<button type="button" class="player-link" data-open-player="${escapeHTML(player.pid)}" aria-label="Details zu ${escapeHTML(player.name)} öffnen">Details</button>`;
  if(player.keeper)return `<article class="v51-starter v51-keeper-card"><div class="v51-card-main">${v51LineupCardContent(player,position)}</div>${details}</article>`;
  return `<article class="v51-starter" draggable="true" data-drag-player="${player.n}" data-drag-kind="pitch" data-drop-cell="${player.cell}"><div class="v51-card-main">${v51LineupCardContent(player,position,player.cell)}</div>${details}</article>`;
 }).join('')}</div>`;
 panel.hidden=v24Tab!=='lineup';
 panel.querySelectorAll('[data-v51-select]').forEach(button=>button.onclick=event=>{event.stopPropagation();$('#grid').querySelector(`[data-cell="${button.dataset.v51Select}"]`)?.click()});
 panel.querySelectorAll('.v51-starter[data-drop-cell]').forEach(card=>card.onclick=event=>{if(event.target.closest('[data-open-player]'))return;$('#grid').querySelector(`[data-cell="${card.dataset.dropCell}"]`)?.click()});
 bindPlayerCardLinks(panel);
}
function v51PrematchStatus(){
 if(!activeSave||running)return;
 v51StarterPanel();
 const player=players[selected],meta=$('#pitch-role-bar .pitch-role-meta');
 if(meta&&player)meta.innerHTML=`${v51StatusHTML(player)}<span>${escapeHTML(formText(v51EffectiveForm(player)))}e Form · ${escapeHTML(freshText(player.fresh??100))}</span>`;
 $('#grid')?.querySelectorAll('.cell[data-cell]').forEach(cell=>{
 cell.querySelector('.v51-pitch-face')?.remove();
  cell.querySelector('.v51-pitch-bar')?.remove();
  const person=players.find(item=>item.cell===+cell.dataset.cell),token=cell.querySelector('.token');
  if(!person||!token)return;
  token.insertAdjacentHTML('afterend',v51PitchFaceHTML(person)+v51PitchBarHTML(person));
  cell.dataset.v51BaseLabel ||= cell.getAttribute('aria-label');
  cell.setAttribute('aria-label',`${cell.dataset.v51BaseLabel}, Form ${formText(v51EffectiveForm(person))}, ${freshText(person.fresh??100)}`);
 });
 const keeper=$('#setup-pitch .keeper');
 if(keeper&&activeSave.keeper){
  keeper.querySelector('.v51-pitch-face')?.remove();
  keeper.querySelector('.v51-pitch-bar')?.remove();
  keeper.querySelector('b')?.insertAdjacentHTML('afterend',v51PitchFaceHTML(homeKeeper)+v51PitchBarHTML(homeKeeper));
  keeper.querySelector('.v51-keeper-position')?.remove();
  keeper.querySelector('.player-link')?.insertAdjacentHTML('beforebegin','<strong class="v51-keeper-position">TOR</strong>');
  keeper.querySelector('.player-link')?.setAttribute('aria-label',`${homeKeeper.name}, Torwart, Form ${formText(v51EffectiveForm(homeKeeper))}, ${freshText(homeKeeper.fresh??100)}, Spielerprofil öffnen`);
  keeper.querySelector('small')?.remove();
 }
}
if(typeof v25Prematch==='function'){
 const v51BasePrematch=v25Prematch;
 v25Prematch=function(){v51BasePrematch();v51PrematchStatus()};
}
if(typeof v24ApplyTab==='function'){
 const v51BaseApplyTab=v24ApplyTab;
 v24ApplyTab=function(){v51BaseApplyTab();const panel=$('#v51-starters');if(panel&&!running)panel.hidden=v24Tab!=='lineup'};
}
if(typeof playerCardHTML==='function'){
 const v51BasePlayerCardHTML=playerCardHTML;
 playerCardHTML=function(player){
  const original=v51BasePlayerCardHTML(player);
  return original.replace(`<span>Form<b>${formText(player.form||0)}</b></span><span>Fitness<b>${freshText(player.fresh??100)}</b></span>`,
   `<span>Form und Frische<b>${v51StatusHTML(player)}</b></span><span>Aktuell<b>${formText(v51EffectiveForm(player))} · ${freshText(player.fresh??100)}</b></span>`);
 };
}

let v51LastLiveStep=-1;
function v51LivePanel(){
 const area=$('#match-area');if(!area||!match)return null;
 let panel=area.querySelector('#v51-live-status');if(panel)return panel;
 panel=document.createElement('section');panel.id='v51-live-status';panel.className='v51-live-status';
 panel.innerHTML=`<h3>Dein Team · Form und Müdigkeit</h3><div class="v51-live-grid">${match.people.filter(player=>player.t===0).map(player=>
  `<article class="v51-live-player" data-v51-number="${player.n}"><b>#${player.n} ${escapeHTML(player.name)}</b>${v51StatusHTML(player)}</article>`
 ).join('')}</div>`;
 area.append(panel);return panel;
}
function v51UpdateLiveStatus(){
 if(!match||!running)return;
 const step=Math.floor(match.elapsed*2);if(step===v51LastLiveStep)return;v51LastLiveStep=step;
 const panel=v51LivePanel();if(!panel)return;
 for(const item of panel.querySelectorAll('[data-v51-number]')){
  const player=match.people.find(person=>person.t===0&&person.n===+item.dataset.v51Number);if(!player)continue;
  const fresh=v51LiveFreshness(player),form=v51EffectiveForm(player,fresh),faceKey=v51FormKeys[form+2];
  const status=item.querySelector('.v51-status'),face=item.querySelector('.v51-face'),bar=item.querySelector('.v51-bar-fill');if(!status||!face||!bar)continue;
  status.setAttribute('aria-label',`Form: ${formText(form)}; Frische: ${freshText(fresh)} (${Math.round(fresh)} von 100)`);
  status.style.setProperty('--v51-status-color',v51FormColors[faceKey]);
  if(face.dataset.v51Face!==faceKey){face.src=v51StatusFaces[faceKey];face.dataset.v51Face=faceKey;face.classList.remove('v51-changed');void face.offsetWidth;face.classList.add('v51-changed')}
  bar.style.transform=`scaleX(${(fresh/100).toFixed(3)})`;
 }
}
const v51BaseUpdateTeamStats=updateTeamStats;
updateTeamStats=function(){const result=v51BaseUpdateTeamStats();v51UpdateLiveStatus();return result};

// The report keeps the true final freshness. Rest is credited once when the
// next club view opens, including after loading a save or resolving a cup tie.
function v52ApplyRecovery(){
 const pending=activeSave?.pendingPlayedRecovery;
 if(!Array.isArray(pending)||!pending.length||activeSave.cup?.pending)return false;
 syncSquadFromLineup();
 for(const entry of pending){
  const source=entry.keeper?activeSave.keeper:activeSave.squad.find(player=>player.n===entry.number);
  if(source)source.fresh=clamp((source.fresh??100)+16,0,100);
 }
 delete activeSave.pendingPlayedRecovery;
 syncLineupFromSquad();
 saveCurrent();
 return true;
}
const v51BaseRenderCenter=renderCenter;
renderCenter=function(){v52ApplyRecovery();return v51BaseRenderCenter()};
const v51BaseFinishMatch=finishMatch;
finishMatch=function(){
 const wasFinished=Boolean(match?.finished),result=v51BaseFinishMatch();
 if(!wasFinished&&match?.finished&&activeSave){
  activeSave.pendingPlayedRecovery=match.people.filter(player=>player.t===0).map(player=>({number:player.n,keeper:Boolean(player.keeper)}));
  saveCurrent();
 }
 return result;
};
const v51BaseStart=start;
start=function(){v52ApplyRecovery();v51LastLiveStep=-1;$('#v51-live-status')?.remove();const result=v51BaseStart();if(running){const panel=$('#v51-starters');if(panel)panel.hidden=true;v51UpdateLiveStatus()}return result};
$('#start').onclick=()=>start();

const v51BaseVersion=v50Version;
v50Version=function(){v51BaseVersion();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 53');const footer=startScreen?.querySelector('footer');if(footer)footer.textContent='Doppel 6 / PROTOTYP 53'};
v50Version();
