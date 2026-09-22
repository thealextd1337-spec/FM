'use strict';

// Form remains a record of recent results. The displayed and simulated form
// follows the player's current freshness, including gradual match fatigue.
const v51FormKeys=['very-weak','weak','normal','good','very-good'];
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
 return `<span class="v51-status" role="img" aria-label="${escapeHTML(label)}"><img class="v51-face" src="${v51StatusFaces[face]}" data-v51-face="${face}" alt=""><span class="v51-bar" aria-hidden="true"><span class="v51-bar-fill" style="transform:scaleX(${(clamp(freshness,0,100)/100).toFixed(3)})"></span></span></span>`;
}
function v51PitchFaceHTML(player){
 const face=v51FormKeys[v51EffectiveForm(player)+2];
 return `<span class="v51-pitch-face" aria-hidden="true"><img src="${v51StatusFaces[face]}" alt=""></span>`;
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
.v51-status{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;vertical-align:middle}.v51-face{display:block;width:32px;height:32px}.v51-bar{position:relative;display:block;flex:none;width:64px;height:10px;overflow:hidden;border-radius:5px;background:#415558}.v51-bar-fill{position:absolute;inset:1px;border-radius:4px;background:#a3e4d4;transform-origin:left center;transition:transform .45s linear}
.v51-starters{padding:13px 16px;border-top:1px solid #34494c;background:#172b2e}.v51-starters h3{margin:0 0 9px;font-size:13px}.v51-starter-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.v51-starter{min-width:0;border:1px solid #3b5053;border-radius:7px;background:#102126;padding:9px 10px}.v51-starter-head{display:block}.v51-starter-head button{display:block;max-width:100%;border:0;padding:0;background:none;color:#eef6f2;font-size:11px;font-weight:700;text-align:left;white-space:normal}.v51-starter-head button:hover{text-decoration:underline}.v51-starter-head .v51-status{display:flex;width:max-content;margin-top:3px}.v51-starter small{display:block;margin-top:4px;color:#abc4b9;font-size:10px;line-height:1.35}
.bench-chip{grid-template-columns:minmax(0,1fr) auto}.bench-chip>.fitness-dot{display:none}.bench-select>.v51-status{margin-top:5px}.pitch-role-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.pitch-role-meta>.v51-status{flex:none}.grid .cell .position-label{align-self:flex-start;width:100%;padding-left:3px;text-align:left;font-weight:800}.grid .cell .player-label{justify-content:flex-start;text-align:left}.grid .cell>.fitness-dot{display:none}.v51-pitch-face{position:absolute;z-index:2;left:calc(50% + 5px);top:calc(50% - 11px);width:24px;height:24px;pointer-events:none}.v51-pitch-face img{display:block;width:100%;height:100%}.keeper .v51-pitch-face{top:4px;left:calc(50% + 8px)}.keeper .v51-keeper-position{display:block;align-self:stretch;text-align:left;font-size:9px;font-weight:800;color:#e6f3e9}.keeper .player-link{text-align:left;width:100%}
.v51-live-status{padding:11px 13px 14px;border-top:1px solid #34494c;background:#172b2e}.v51-live-status h3{margin:0 0 8px;font-size:13px}.v51-live-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.v51-live-player{min-width:0;padding:6px 7px;background:#102126;border:1px solid #3b5053;border-radius:6px}.v51-live-player b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.v51-live-player .v51-status{margin-top:3px}.v51-face.v51-changed{animation:v51FaceChange .7s cubic-bezier(.22,1,.36,1)}@keyframes v51FaceChange{from{opacity:.25;transform:translateY(2px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:760px){.v51-live-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v51-starter-grid{grid-template-columns:1fr}.v51-starter{padding:8px 9px}.grid .cell .position-label{padding-left:1px}.keeper .v51-keeper-position{font-size:8px}}
@media(prefers-reduced-motion:reduce){.v51-face.v51-changed{animation:none}.v51-bar-fill{transition:none}}
`;
document.head.append(v51Style);

if(typeof v24BenchHTML==='function'){
 const v51BaseBenchHTML=v24BenchHTML;
 v24BenchHTML=function(player){return v51BaseBenchHTML(player).replace('<span class="bench-meta">',`${v51StatusHTML(player)}<span class="bench-meta">`)};
}

function v51StarterPanel(){
 if(!activeSave||running)return;
 let panel=$('#v51-starters');if(!panel){panel=document.createElement('section');panel.id='v51-starters';panel.className='v51-starters';$('#setup-pitch').insertAdjacentElement('afterend',panel)}
 const starters=[...players,homeKeeper];
 panel.innerHTML=`<h3>Startaufstellung · Form und Müdigkeit</h3><div class="v51-starter-grid">${starters.map(player=>{
  const position=player.keeper?'TOR':v25PositionShort[player.line];
  const action=player.keeper?`data-open-player="${escapeHTML(player.pid)}"`:`data-v51-select="${player.cell}"`;
  return `<article class="v51-starter"><div class="v51-starter-head"><button type="button" ${action}>#${player.n} ${escapeHTML(player.name)} · ${position}</button>${v51StatusHTML(player)}</div><small>${escapeHTML(v51TopSkills(player))}</small></article>`;
 }).join('')}</div>`;
 panel.hidden=v24Tab!=='lineup';
 panel.querySelectorAll('[data-v51-select]').forEach(button=>button.onclick=()=>$('#grid').querySelector(`[data-cell="${button.dataset.v51Select}"]`)?.click());
 bindPlayerCardLinks(panel);
}
function v51PrematchStatus(){
 if(!activeSave||running)return;
 v51StarterPanel();
 const player=players[selected],meta=$('#pitch-role-bar .pitch-role-meta');
 if(meta&&player)meta.innerHTML=`${v51StatusHTML(player)}<span>${escapeHTML(formText(v51EffectiveForm(player)))}e Form · ${escapeHTML(freshText(player.fresh??100))}</span>`;
 $('#grid')?.querySelectorAll('.cell[data-cell]').forEach(cell=>{
  cell.querySelector('.v51-pitch-face')?.remove();
  const person=players.find(item=>item.cell===+cell.dataset.cell),token=cell.querySelector('.token');
  if(!person||!token)return;
  token.insertAdjacentHTML('afterend',v51PitchFaceHTML(person));
  cell.dataset.v51BaseLabel ||= cell.getAttribute('aria-label');
  cell.setAttribute('aria-label',`${cell.dataset.v51BaseLabel}, Form ${formText(v51EffectiveForm(person))}, ${freshText(person.fresh??100)}`);
 });
 const keeper=$('#setup-pitch .keeper');
 if(keeper&&activeSave.keeper){
  keeper.querySelector('.v51-pitch-face')?.remove();
  keeper.querySelector('b')?.insertAdjacentHTML('afterend',v51PitchFaceHTML(homeKeeper));
  keeper.querySelector('.v51-keeper-position')?.remove();
  keeper.querySelector('.player-link')?.insertAdjacentHTML('beforebegin','<strong class="v51-keeper-position">TOR</strong>');
  keeper.querySelector('.player-link')?.setAttribute('aria-label',`${homeKeeper.name}, Torwart, Form ${formText(v51EffectiveForm(homeKeeper))}, ${freshText(homeKeeper.fresh??100)}, Spielerprofil öffnen`);
  const note=keeper.querySelector('small');if(note)note.textContent=freshText(activeSave.keeper.fresh??100);
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
