'use strict';

const v34FinaleStyle=document.createElement('style');
v34FinaleStyle.textContent=`
.season-flow-progress{grid-template-columns:repeat(5,1fr)}
.finale-squad-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:20px 0}
.finale-squad-card{padding:15px;border:1px solid #3a4f52;border-radius:8px;background:#102126}
.finale-squad-card .player-link{display:flex;align-items:center;gap:9px;text-align:left;font-size:14px}
.finale-squad-card .flag-icon{width:27px;flex:none}
.finale-squad-card p{margin:8px 0 0;color:#91a5a2;font-size:11px;line-height:1.5}
.finale-squad-card em{display:inline-block;margin-top:9px;color:#c7f36b;font-size:10px;font-style:normal}
@media(max-width:760px){.season-flow-progress{grid-template-columns:repeat(2,1fr)}.finale-squad-grid{grid-template-columns:1fr}}
`;
document.head.append(v34FinaleStyle);

v31StageIndex=function(stage){return{summary:0,retirements:1,finance:2,squad:3,complete:4,gameover:4}[stage]??0};
v31Progress=function(stage){const active=v31StageIndex(stage);return`<div class="season-flow-progress">${['Saisonbilanz','Karriereenden','Finanzen','Kader','Neue Saison'].map((label,index)=>`<span class="${index<active?'done':index===active?'active':''}">${label}</span>`).join('')}</div>`};

const v31FinanceHTMLV34=v31FinanceHTML;
v31FinanceHTML=function(finale){return v31FinanceHTMLV34(finale).replace(/data-finale-stage="(?:complete|gameover)"/,'data-finale-stage="squad"').replace(/(?:Game Over ansehen|Saison \d+ beginnen)/,'Weiter: Kader')};

function v34FinaleRoster(finale){
 const departing=new Set(finale.retirements.map(player=>player.pid));
 const order={gk:0,def:1,mid:2,att:3};
 return[activeSave.keeper,...activeSave.squad].filter(player=>player&&!player.retired&&!departing.has(player.pid)).sort((a,b)=>(order[a.line]??4)-(order[b.line]??4)||a.name.localeCompare(b.name))
}
function v34SquadHTML(finale){
 const roster=v34FinaleRoster(finale),youthCount=roster.filter(player=>player.youthPotential).length,next=finale.season+1;
 return`${v31Progress('squad')}<section class="panel season-flow-card"><p class="eyebrow">KADER · SAISON ${finale.season}</p><h1>Dein Kader am Saisonende</h1><p class="season-flow-note">Diese Spieler gehen mit dir in Saison ${next}. Karriereenden sind bereits berücksichtigt; das Transferfenster öffnet sich danach.</p><div class="section-heading"><h2>${roster.length} Spieler</h2><span>${youthCount} Jugendspieler</span></div><div class="finale-squad-grid">${roster.map(player=>`<article class="finale-squad-card"><button class="player-link" data-final-player="${escapeHTML(player.pid)}">${flagSVG(player.nation)}<b>${escapeHTML(player.name)}</b></button><p>${escapeHTML(transferPosition(player))} · ${player.age} Jahre · ${annualSalary(player)} Credits/Jahr</p><p>${scoutingTextHTML(player)}</p>${player.youthPotential?'<em>Jugendspieler</em>':''}</article>`).join('')||'<p class="help">Noch kein Spieler im Kader. Plane im nächsten Transferfenster neue Verpflichtungen.</p>'}</div><button class="primary" data-finale-stage="${finale.finance?.gameOver?'gameover':'complete'}">${finale.finance?.gameOver?'Game Over ansehen':`Saison ${next} beginnen`} <span>↗</span></button></section>`
}

const v31RenderFinaleV34=v31RenderFinale;
v31RenderFinale=function(){
 const finale=v31EnsureFinale();if(!finale||finale.stage!=='squad')return v31RenderFinaleV34();
 clubCenter.innerHTML=`<section class="intro"><div><p class="eyebrow">SAISONABSCHLUSS</p><h1>${escapeHTML(activeSave.club)}</h1></div><p class="center-subtitle">Saison ${finale.season}</p></section><div class="season-flow">${v34SquadHTML(finale)}</div><footer><span>Doppel 6 / PROTOTYP 39</span><span>Saison ${finale.season}</span></footer>`;
 clubCenter.querySelectorAll('[data-finale-stage]').forEach(button=>button.onclick=()=>v31SetStage(button.dataset.finaleStage));
 clubCenter.querySelectorAll('[data-final-player]').forEach(button=>button.onclick=()=>openPlayerCard(button.dataset.finalPlayer));return true
};
const v31SetStageV34=v31SetStage;
v31SetStage=function(stage){
 if(stage!=='squad')return v31SetStageV34(stage);
 const finale=v31EnsureFinale();if(!finale||!['finance','squad'].includes(finale.stage))return false;
 finale.stage='squad';saveCurrent();renderCenter();window.scrollTo(0,0);return true
};

generateSalesOffers=function(){
 const state=transferState();state.salesOffers=state.salesOffers||[];let changed=false;
 const persist=()=>{if(changed)saveCurrent()};
 for(const offer of state.salesOffers)if(offer.status==='active'&&offer.expiresDay<state.day){offer.status='expired';changed=true}
 const live=state.salesOffers.filter(offer=>offer.status==='active');
 for(const offer of live.slice(1)){offer.status='expired';changed=true}
 if(!state.open||activeOutfield().length<=5||state.salesOffers.some(offer=>offer.status==='active')||state.salesOffers.length>=2){persist();return}
 const last=state.salesOffers.at(-1);if(last&&state.day<=(last.createdDay||1)+1){persist();return}
 const candidates=activeOutfield().filter(player=>!state.salesOffers.some(offer=>offer.pid===player.pid));if(!candidates.length){persist();return}
 const player=pick(candidates),amount=Math.round(saleValue(player)*(.9+Math.random()*.25)/10)*10;
 state.salesOffers.push({id:crypto.randomUUID(),pid:player.pid,name:player.name,amount,status:'active',createdDay:state.day,expiresDay:Math.min(5,state.day+1+Math.floor(Math.random()*2))});
 addNews('Angebot eingegangen',`${amount} Credits werden für ${player.name} geboten.`,'transfer');changed=true;persist()
};

const v33RenderCenterV34=renderCenter;
renderCenter=function(){const result=v33RenderCenterV34();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');return result};
startScreen.querySelector('footer').textContent='Doppel 6 / PROTOTYP 39';
