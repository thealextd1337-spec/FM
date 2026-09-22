'use strict';

const v45Style=document.createElement('style');
v45Style.textContent=`.v45-keeper-intro{margin-top:18px}.v45-keeper-preview,.v45-logo-preview{display:flex;align-items:center;gap:15px;min-height:96px;margin:10px 0 12px;padding:13px;border:1px solid #526864;border-radius:9px;background:#102126}.v45-keeper-preview svg{width:64px;height:68px;flex:none}.v45-logo-preview .club-crest-svg{width:72px;height:78px;flex:none}.v45-keeper-preview strong,.v45-logo-preview strong{display:block;color:#f0f5ed;font-size:14px}.v45-keeper-preview small,.v45-logo-preview small{display:block;margin-top:5px;color:#a9bdb4;font-size:11px}.v45-keeper-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.v45-keeper-options button{display:flex;align-items:center;justify-content:center;gap:6px;min-height:61px;padding:5px;border:1px solid #617573;border-radius:7px;background:#1b3033;color:#eaf2ec;font:inherit;font-size:10px;cursor:pointer}.v45-keeper-options button[aria-pressed=true]{border:2px solid #f0d889;background:#314338}.v45-keeper-options svg{width:35px;height:40px;flex:none}@media(max-width:600px){.v45-keeper-options button{flex-direction:column;font-size:9px;min-height:67px}}`;
document.head.append(v45Style);

const v45KeeperOptions=[
 {id:'gold',label:'Gold',main:'#e5b56a',trim:'#4a341b',style:'solid'},
 {id:'turquoise',label:'Türkis',main:'#54d3ce',trim:'#173b4b',style:'stripe'},
 {id:'coral',label:'Koralle',main:'#f37b72',trim:'#4b233f',style:'hoops'},
 {id:'violet',label:'Violett',main:'#b89af0',trim:'#382c68',style:'halves'},
 {id:'silver',label:'Silber',main:'#e3e9e5',trim:'#455961',style:'diagonal'},
 {id:'orange',label:'Orange',main:'#f2a75a',trim:'#563123',style:'pinstripes'}
];
v44Choice.keeper='gold';
function v45KeeperKit(id){const item=v45KeeperOptions.find(option=>option.id===id)||v45KeeperOptions[0];return{main:item.main,trim:item.trim,style:item.style}}

const v45KeeperSection=document.createElement('section');
v45KeeperSection.className='v45-keeper-intro';
v45KeeperSection.innerHTML='<h3>Torwarttrikot</h3><p>Wähle das erste Trikot für deinen Torwart. Es gilt für Heim- und Auswärtsspiele.</p><div class="v45-keeper-preview" id="v45-keeper-preview"></div><div class="v45-keeper-options" id="v45-keeper-options" role="group" aria-label="Torwarttrikot wählen"></div><p>Dein Verein erhält zusätzlich ein festes zweites Torwarttrikot. Im Match wird bei Bedarf wegen des Kontrasts zwischen beiden gewechselt.</p>';
v44Section.querySelector('[data-v44-group="away"]').insertAdjacentElement('afterend',v45KeeperSection);

const v45LogoPreview=document.createElement('div');
v45LogoPreview.id='v45-logo-preview';v45LogoPreview.className='v45-logo-preview';v45LogoPreview.setAttribute('aria-label','Aktuelle Logovorschau');
v44Section.querySelector('[data-v44-group="shape"]').insertAdjacentElement('beforebegin',v45LogoPreview);
function v45RenderIdentity(){
 const selected=v45KeeperOptions.find(option=>option.id===v44Choice.keeper)||v45KeeperOptions[0],keeper=v45KeeperKit(selected.id);
 v45KeeperSection.querySelector('#v45-keeper-preview').innerHTML=`${v44ShirtSVG({n:1},keeper,'Gewähltes Torwarttrikot')}<div><strong>${selected.label}</strong><small>Torwart · Heim und Auswärts</small></div>`;
 v45KeeperSection.querySelector('#v45-keeper-options').innerHTML=v45KeeperOptions.map(option=>`<button type="button" data-v45-keeper="${option.id}" aria-pressed="${option.id===selected.id}">${v44ShirtSVG(null,v45KeeperKit(option.id),`Torwarttrikot ${option.label}`)}<span>${option.label}</span></button>`).join('');
 const name=$('#club-name').value.trim()||'Dein Verein',kits=makeKits($('#club-primary').value,$('#club-secondary').value);kits.crest={shape:v44Choice.shape,decoration:v44Choice.decoration};
 v45LogoPreview.innerHTML=`${crestHTML(name,kits)}<div><strong>${escapeHTML(name)}</strong><small>${v44Shapes.find(item=>item[0]===v44Choice.shape)?.[1]||'Schild'} · ${v44Decorations.find(item=>item[0]===v44Choice.decoration)?.[1]||'Streifen'}</small></div>`;
}
v45KeeperSection.addEventListener('click',event=>{const id=event.target.closest('[data-v45-keeper]')?.dataset.v45Keeper;if(!v45KeeperOptions.some(option=>option.id===id))return;v44Choice.keeper=id;v45RenderIdentity()});
v44Section.addEventListener('click',event=>{if(event.target.closest('[data-v44-choice]'))v45RenderIdentity()});
for(const id of['#club-name','#club-primary','#club-secondary','#club-tertiary'])$(id).addEventListener('input',()=>{updateIdentityPreview();v45RenderIdentity()});
$$('[data-colors]').forEach(button=>button.addEventListener('click',v45RenderIdentity));
v45RenderIdentity();

const v45BaseMakeWorld=makeWorld;
const v45OpponentKeeperIds={hafen:'turquoise',nord:'coral',union:'violet',athletik:'silver',vorstadt:'orange'};
function v45AlternateKeeper(kits){
 const primary=kits.keeper,field=[kits.home?.main,kits.away?.main].filter(Boolean);
 return v45KeeperOptions.filter(option=>option.main!==primary.main).map(option=>v45KeeperKit(option.id)).sort((a,b)=>
  Math.min(colorDistance(b.main,primary.main),...field.map(color=>colorDistance(b.main,color)))-
  Math.min(colorDistance(a.main,primary.main),...field.map(color=>colorDistance(a.main,color))))[0];
}
function v45EnsureKeeperPairs(world){
 world.kits.keeper=world.kits.keeper||v45KeeperKit('gold');
 world.kits.keeperAlt=world.kits.keeperAlt||v45AlternateKeeper(world.kits);
 for(const team of world.teams){
  if(!team.kits)continue;
  if(!team.kits.keeperAlt&&(!team.kits.keeper||team.kits.keeper.main===v45KeeperKit('gold').main))team.kits.keeper=v45KeeperKit(v45OpponentKeeperIds[team.id]||'gold');
  team.kits.keeperAlt=team.kits.keeperAlt||v45AlternateKeeper(team.kits);
 }
 return world;
}
makeWorld=function(primary,secondary,completeHistory){const world=v45BaseMakeWorld(primary,secondary,completeHistory);world.kits.keeper=v45KeeperKit(v44Choice.keeper);return v45EnsureKeeperPairs(world)};
const v45BaseEnsure=ensureChampionship;
ensureChampionship=function(raw){const slot=v45BaseEnsure(raw);if(slot.world)v45EnsureKeeperPairs(slot.world);return slot};
function v45DistinctKeeper(chosen,first,second){
 if(!chosen)return v45KeeperKit('gold');
 if(colorDistance(chosen.main,first.main)>=100&&colorDistance(chosen.main,second.main)>=100)return chosen;
 return[chosen,...v45KeeperOptions.map(option=>v45KeeperKit(option.id))].sort((a,b)=>Math.min(colorDistance(b.main,first.main),colorDistance(b.main,second.main))-Math.min(colorDistance(a.main,first.main),colorDistance(a.main,second.main)))[0];
}
const v45BaseStart=start;
function v45ResolveKeeperPair(user,opponent,userField,opponentField){
 let best=null;
 for(const [userIndex,userKeeper]of [user.keeper,user.keeperAlt].entries())for(const [opponentIndex,opponentKeeper]of [opponent.keeper,opponent.keeperAlt].entries()){
  if(!userKeeper||!opponentKeeper)continue;
  const contrast=Math.min(...[userKeeper,opponentKeeper].flatMap(kit=>[userField,opponentField].map(field=>colorDistance(kit.main,field.main))),colorDistance(userKeeper.main,opponentKeeper.main));
  const candidate={user:userKeeper,opponent:opponentKeeper,clear:contrast>=100,swaps:userIndex+opponentIndex,contrast};
  if(!best||Number(candidate.clear)>Number(best.clear)||candidate.clear===best.clear&&(candidate.clear?(candidate.swaps<best.swaps||candidate.swaps===best.swaps&&candidate.contrast>best.contrast):(candidate.contrast>best.contrast||candidate.contrast===best.contrast&&candidate.swaps<best.swaps)))best=candidate;
 }
 return{user:best?.user||user.keeper,opponent:best?.opponent||opponent.keeper};
}
start=function(){const result=v45BaseStart();if(running&&match?.kits){const pair=v45ResolveKeeperPair(currentKits(),activeOpponent().kits,match.kits.user,match.kits.opponent);match.kits.userKeeper=pair.user;match.kits.opponentKeeper=pair.opponent}return result};
const v45BasePending=v42CareerPending;
v42CareerPending=function(){const pending=v45BasePending();pending.ownKeeperColour=structuredClone(match.kits?.userKeeper||currentKits().keeper);pending.opponentKeeperColour=structuredClone(match.kits?.opponentKeeper||activeOpponent().kits.keeper);return pending};
const v45BasePenaltyKeeperKit=v44PenaltyKeeperKit;
v44PenaltyKeeperKit=function(session,side){const kit=side===0?session.ownKeeperColour:session.opponentKeeperColour;return kit||v45BasePenaltyKeeperKit(session,side)};
