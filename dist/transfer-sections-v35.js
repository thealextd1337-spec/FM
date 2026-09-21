'use strict';

const v35TransferStyle=document.createElement('style');
v35TransferStyle.textContent=`
.season-flow-progress{grid-template-columns:repeat(4,1fr)}
.v35-fold{margin:16px 0;border:1px solid #3b5053;border-radius:10px;background:#102126;overflow:hidden}
.v35-fold>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 17px;cursor:pointer;color:#eef5f1;font-weight:800;list-style:none}
.v35-fold>summary::-webkit-details-marker{display:none}
.v35-fold>summary::after{content:'+';display:grid;place-items:center;width:27px;height:27px;flex:none;border:1px solid #52676a;border-radius:50%;color:var(--club-primary);font-size:19px}
.v35-fold[open]>summary::after{content:'−'}
.v35-fold>summary span{margin-left:auto;color:#91a5a2;font-size:10px;font-weight:600;text-align:right}
.v35-fold-body{padding:0 14px 14px}
.v35-roster{margin:18px 0}
.v35-roster-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.v35-roster-card{padding:12px;border:1px solid #374b4f;border-radius:8px;background:#17282c}
.v35-roster-card .player-link{display:flex;align-items:center;gap:8px;text-align:left;font-size:13px}
.v35-roster-card .flag-icon{width:25px;flex:none}
.v35-roster-card p{margin:8px 0 0;color:#a9b9b6;font-size:10px;line-height:1.5}
.v35-roster-card em{display:inline-block;margin-top:7px;color:#c7f36b;font-size:9px;font-style:normal}
.v35-regular .market-grid{max-height:640px;overflow-y:auto;overscroll-behavior:contain;padding-right:5px}
.v35-sales .v35-offer-list{max-height:250px;overflow-y:auto;overscroll-behavior:contain;padding-right:5px}
.v35-sales article:last-child{border-bottom:0}
@media(max-width:760px){.v35-roster-grid{grid-template-columns:1fr}.v35-fold>summary{padding:13px}.v35-fold>summary span{font-size:9px}.v35-regular .market-grid{max-height:520px}}
`;
document.head.append(v35TransferStyle);

// Existing version-34 saves may be paused on the removed roster step.
v31StageIndex=function(stage){return{summary:0,retirements:1,finance:2,complete:3,gameover:3}[stage]??0};
v31Progress=function(stage){const active=v31StageIndex(stage);return`<div class="season-flow-progress">${['Saisonbilanz','Karriereenden','Finanzen','Neue Saison'].map((label,index)=>`<span class="${index<active?'done':index===active?'active':''}">${label}</span>`).join('')}</div>`};
v31FinanceHTML=v31FinanceHTMLV34;
v31RenderFinale=v31RenderFinaleV34;
v31SetStage=v31SetStageV34;

function v35TransferUi(){const state=transferState();state.ui=state.ui||{rosterOpen:true,regularOpen:true,salesOpen:true};return state.ui}
function v35TrackFold(details,key){const ui=v35TransferUi();details.open=ui[key]!==false;details.addEventListener('toggle',()=>{if(ui[key]!==details.open){ui[key]=details.open;saveCurrent()}})}
function v35RosterHTML(){
 const order={gk:0,def:1,mid:2,att:3},roster=[activeSave.keeper,...activeSave.squad].filter(player=>player&&!player.retired).sort((a,b)=>(order[a.line]??4)-(order[b.line]??4)||a.name.localeCompare(b.name));
 return`<div class="v35-fold-body"><div class="v35-roster-grid">${roster.map(player=>`<article class="v35-roster-card"><button class="player-link" data-roster-player="${escapeHTML(player.pid)}">${flagSVG(player.nation)}<b>${escapeHTML(player.name)}</b></button><p>${escapeHTML(transferPosition(player))} · ${player.age} Jahre · ${annualSalary(player)} Credits/Jahr</p><p>${escapeHTML(scoutingText(player))}</p>${player.youthPotential?'<em>Jugendspieler</em>':''}</article>`).join('')}</div></div>`
}
function v35ShowRoster(){
 const market=clubCenter.querySelector('.qol-market');if(!market||!transferState().open)return;
 const roster=[activeSave.keeper,...activeSave.squad].filter(player=>player&&!player.retired),youth=roster.filter(player=>player.youthPotential).length,details=document.createElement('details');
 details.className='v35-fold v35-roster panel';details.innerHTML=`<summary><b>Aktueller Kader</b><span>${roster.length}/12 Spieler · ${youth} Jugendspieler</span></summary>${v35RosterHTML()}`;
 const anchor=clubCenter.querySelector('.youth-panel')||market;anchor.insertAdjacentElement('beforebegin',details);v35TrackFold(details,'rosterOpen');
 details.querySelectorAll('[data-roster-player]').forEach(button=>button.onclick=()=>openPlayerCard(button.dataset.rosterPlayer))
}
function v35FoldMarket(){
 const market=clubCenter.querySelector('.qol-market');if(!market||!transferState().open)return;
 const heading=[...market.querySelectorAll(':scope > h3')].find(item=>item.textContent.trim()==='Spieler mit Ablöse'),grid=heading?.nextElementSibling;
 if(heading&&grid?.classList.contains('market-grid')){
  const details=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('div');
  details.className='v35-fold v35-regular';summary.innerHTML=`<b>Spieler mit Ablöse</b><span>${grid.querySelectorAll('.market-card').length} Spieler anzeigen</span>`;body.className='v35-fold-body';
  heading.insertAdjacentElement('beforebegin',details);heading.remove();body.append(grid);details.append(summary,body);v35TrackFold(details,'regularOpen')
 }
 const old=market.querySelector('.sales-offers'),offers=old?[...old.querySelectorAll('article')]:[],details=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('div');
 details.className='v35-fold v35-sales';summary.innerHTML=`<b>Angebote für deine Spieler</b><span>${offers.length} ${offers.length===1?'Angebot':'Angebote'}</span>`;body.className='v35-fold-body v35-offer-list';
 if(offers.length)for(const offer of offers)body.append(offer);else body.innerHTML='<p class="help">Aktuell liegt kein Angebot für deine Spieler vor.</p>';
 if(old){old.insertAdjacentElement('beforebegin',details);old.remove()}else market.querySelector('.v35-regular')?.insertAdjacentElement('afterend',details);
 details.append(summary,body);v35TrackFold(details,'salesOpen')
}

const v34RenderCenterV35=renderCenter;
renderCenter=function(){
 if(activeSave?.currentRound>=10&&activeSave.seasonFinale?.stage==='squad'){activeSave.seasonFinale.stage='finance';saveCurrent()}
 const result=v34RenderCenterV35();
 if(activeSave&&activeSave.currentRound<10&&!activeSave.finance?.gameOver&&transferState().open){v35ShowRoster();v35FoldMarket()}
 document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 35');return result
};
startScreen.querySelector('footer').textContent='SECHSER / PROTOTYP 35';
