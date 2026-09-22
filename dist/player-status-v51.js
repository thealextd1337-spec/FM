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
 const form=v51EffectiveForm(player,freshness),face=v51FormKeys[form+2],bar=v51FreshnessKey(freshness);
 const label=`Form: ${formText(form)}; Frische: ${freshText(freshness)}`;
 return `<span class="v51-status" role="img" aria-label="${escapeHTML(label)}"><img class="v51-face" src="${v51StatusFaces[face]}" data-v51-face="${face}" alt=""><img class="v51-bar" src="${v51StatusBars[bar]}" data-v51-bar="${bar}" alt=""></span>`;
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
.v51-status{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;vertical-align:middle}.v51-face{display:block;width:32px;height:24px;image-rendering:pixelated}.v51-bar{display:block;width:56px;height:20px;image-rendering:pixelated}
.v51-starters{padding:13px 16px;border-top:1px solid #34494c;background:#172b2e}.v51-starters h3{margin:0 0 9px;font-size:13px}.v51-starter-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.v51-starter{min-width:0;border:1px solid #3b5053;border-radius:7px;background:#102126;padding:9px 10px}.v51-starter-head{display:flex;justify-content:space-between;align-items:center;gap:7px}.v51-starter-head button{min-width:0;border:0;padding:0;background:none;color:#eef6f2;font-size:11px;font-weight:700;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v51-starter-head button:hover{text-decoration:underline}.v51-starter-head .v51-status{flex:none}.v51-starter small{display:block;margin-top:4px;color:#abc4b9;font-size:10px;line-height:1.35}
.bench-select>.v51-status{margin-top:5px}.pitch-role-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.pitch-role-meta>.v51-status{flex:none}.grid .cell .position-label{align-self:flex-start;width:100%;padding-left:3px;text-align:left;font-weight:800}.grid .cell .player-label{justify-content:flex-start;text-align:left}.keeper .v51-keeper-position{display:block;align-self:stretch;text-align:left;font-size:9px;font-weight:800;color:#e6f3e9}.keeper .player-link{text-align:left;width:100%}
.v51-live-status{padding:11px 13px 14px;border-top:1px solid #34494c;background:#172b2e}.v51-live-status h3{margin:0 0 8px;font-size:13px}.v51-live-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.v51-live-player{min-width:0;padding:6px 7px;background:#102126;border:1px solid #3b5053;border-radius:6px}.v51-live-player b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.v51-live-player .v51-status{margin-top:3px}.v51-face.v51-changed{animation:v51FaceChange .55s ease-out}@keyframes v51FaceChange{from{opacity:.35;transform:translateY(2px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:760px){.v51-live-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v51-starter-grid{grid-template-columns:1fr}.v51-starter{padding:8px 9px}.grid .cell .position-label{padding-left:1px}.keeper .v51-keeper-position{font-size:8px}}
@media(prefers-reduced-motion:reduce){.v51-face.v51-changed{animation:none}}
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
 const keeper=$('#setup-pitch .keeper');
 if(keeper&&activeSave.keeper){
  keeper.querySelector('.v51-keeper-position')?.remove();
  keeper.querySelector('.player-link')?.insertAdjacentHTML('beforebegin','<strong class="v51-keeper-position">TOR</strong>');
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
  const fresh=v51LiveFreshness(player),form=v51EffectiveForm(player,fresh),faceKey=v51FormKeys[form+2],barKey=v51FreshnessKey(fresh);
  const status=item.querySelector('.v51-status'),face=item.querySelector('.v51-face'),bar=item.querySelector('.v51-bar');if(!status||!face||!bar)continue;
  status.setAttribute('aria-label',`Form: ${formText(form)}; Frische: ${freshText(fresh)}`);
  if(face.dataset.v51Face!==faceKey){face.src=v51StatusFaces[faceKey];face.dataset.v51Face=faceKey;face.classList.remove('v51-changed');void face.offsetWidth;face.classList.add('v51-changed')}
  if(bar.dataset.v51Bar!==barKey){bar.src=v51StatusBars[barKey];bar.dataset.v51Bar=barKey}
 }
}
const v51BaseUpdateTeamStats=updateTeamStats;
updateTeamStats=function(){const result=v51BaseUpdateTeamStats();v51UpdateLiveStatus();return result};
const v51BaseStart=start;
start=function(){v51LastLiveStep=-1;$('#v51-live-status')?.remove();const result=v51BaseStart();if(running){const panel=$('#v51-starters');if(panel)panel.hidden=true;v51UpdateLiveStatus()}return result};
$('#start').onclick=()=>start();

const v51BaseVersion=v50Version;
v50Version=function(){v51BaseVersion();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 52');const footer=startScreen?.querySelector('footer');if(footer)footer.textContent='Doppel 6 / PROTOTYP 52'};
v50Version();
