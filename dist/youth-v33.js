'use strict';

const YOUTH_SCOUT_COST=40,YOUTH_SIGN_COST=100,YOUTH_POOL_SIZE=12;
const youthKeys=['tec','pas','fin','tak','pos','spd','sta','air'];
const youthFocus={def:['tak','pos','air'],mid:['pas','tec','sta'],att:['fin','tec','air']};

function makeYouthCandidate(index){
 const line=['def','mid','att'][index%3],age=17+Math.floor(Math.random()*3);
 const peak=ensurePlayerId(playerIdentity(line,0,age,68+Math.floor(Math.random()*14)));
 const target=Object.fromEntries(youthKeys.filter(key=>Number.isFinite(peak[key])).map(key=>[key,peak[key]])),player=structuredClone(peak);
 for(const key of Object.keys(target)){
  const gap=youthFocus[line].includes(key)?2+Math.floor(Math.random()*2):1+Math.floor(Math.random()*2);
  player[key]=clamp(target[key]-gap,1,20)
 }
 player.salary=annualSalary({...player,...target});
 return{id:crypto.randomUUID(),player,target,scouted:false,signed:false}
}
function ensureYouth(save=activeSave){
 if(!save||save.seasonNumber<2)return null;
 if(save.youth?.season===save.seasonNumber&&Array.isArray(save.youth.candidates))return save.youth;
 save.youth={season:save.seasonNumber,candidates:Array.from({length:YOUTH_POOL_SIZE},(_,index)=>makeYouthCandidate(index))};
 return save.youth
}
function youthPotentialWord(candidate){
 const keys=youthFocus[candidate.player.line],score=keys.reduce((sum,key)=>sum+candidate.target[key],0)/keys.length;
 return scoutWord(score)
}
function youthPotentialHTML(candidate){return escapeHTML(youthPotentialWord(candidate))}
function scoutYouth(id){
 if(!activeSave||activeSave.currentRound>=10||!transferState().open)return false;
 const candidate=ensureYouth().candidates.find(item=>item.id===id),finance=ensureFinance(activeSave);
 if(!candidate||candidate.scouted||finance.balance-(finance.reserved||0)<YOUTH_SCOUT_COST)return false;
 if(!bookCredit(`youth-scout-${activeSave.seasonNumber}-${id}`,`Scouting ${candidate.player.name}`,-YOUTH_SCOUT_COST,'youth-scout'))return false;
 candidate.scouted=true;saveCurrent();renderCenter();return true
}
function signYouth(id){
 if(!activeSave||activeSave.currentRound>=10||!transferState().open||!selectedSponsor())return false;
 const candidate=ensureYouth().candidates.find(item=>item.id===id),finance=ensureFinance(activeSave);
 if(!candidate||!candidate.scouted||candidate.signed||activeRosterSize()>=12||finance.balance-(finance.reserved||0)<YOUTH_SIGN_COST)return false;
 if(!bookCredit(`youth-sign-${activeSave.seasonNumber}-${id}`,`Jugendverpflichtung ${candidate.player.name}`,-YOUTH_SIGN_COST,'youth-sign'))return false;
 const player=structuredClone(candidate.player);player.youthPotential=structuredClone(candidate.target);player.youthGrowth={};player.n=nextSquadNumber();
 activeSave.squad.push(player);candidate.signed=true;currentStats(player);
 addNews('Nachwuchs verpflichtet',`${player.name} kommt aus der Jugendauswahl. Einsätze entwickeln seine Fähigkeiten.`,'success',`youth-news-${activeSave.seasonNumber}-${id}`);
 normalizeLineup();syncLineupFromSquad();saveCurrent();renderCenter();return true
}
function youthGrowthInterval(age){return age<=19?2:age<=21?3:age<=23?5:Infinity}
function youthDevelop(player){
 const target=player.youthPotential,priority=[...youthFocus[player.line],...youthKeys.filter(key=>!youthFocus[player.line].includes(key))],chosen=new Set();
 let points=0;
 for(let i=0;i<2;i++){
  const key=priority.filter(item=>!chosen.has(item)&&player[item]<target[item]).sort((a,b)=>(target[b]-player[b])-(target[a]-player[a]))[0];
  if(!key)break;player[key]++;chosen.add(key);points++
 }
 return points
}
const v32AgeAdjustmentV33=ageAdjustment;
ageAdjustment=function(player,key){return player.youthPotential&&player.age<=23?0:v32AgeAdjustmentV33(player,key)};

const v32FinishMatchV33=finishMatch;
finishMatch=function(){
 if(match?.finished)return;
 v32FinishMatchV33();
 if(!activeSave)return;
 let changed=false;
 for(const player of players){
  if(!player.youthPotential||player.age>=24)continue;
  const season=activeSave.seasonNumber,interval=youthGrowthInterval(player.age),games=(currentStats(player).games||0)+(player.cupSeasons?.find(s=>s.number===season)?.games||0),due=Math.floor(games/interval);
  player.youthGrowth=player.youthGrowth||{};
  const progress=player.youthGrowth[season]||(player.youthGrowth[season]={awards:0,points:0});
  while(progress.awards<due){progress.points+=youthDevelop(player);progress.awards++;changed=true}
 }
 if(changed)saveCurrent()
};

function youthCandidateHTML(candidate){
 const player=candidate.player,finance=ensureFinance(activeSave),available=finance.balance-(finance.reserved||0);
 const details=candidate.scouted?`<p>Aktuell: ${scoutingTextHTML(player)}</p><p>Potenzial: ${youthPotentialHTML(candidate)} · Gehalt: ${annualSalary(player)} Credits/Jahr</p>`:'<p>Fähigkeiten und Potenzial sind noch unbekannt.</p>';
 const action=candidate.signed?'<span class="youth-signed">Verpflichtet</span>':candidate.scouted?`<button class="menu-action wide" data-youth-sign="${candidate.id}" ${!selectedSponsor()||activeRosterSize()>=12||available<YOUTH_SIGN_COST?'disabled':''}>Für ${YOUTH_SIGN_COST} Credits verpflichten</button>`:`<button class="menu-action wide" data-youth-scout="${candidate.id}" ${available<YOUTH_SCOUT_COST?'disabled':''}>Für ${YOUTH_SCOUT_COST} Credits scouten</button>`;
 return`<article class="youth-card"><div class="market-name">${flagSVG(player.nation)}<div><b>${escapeHTML(player.name)}</b><span>${transferPosition(player)} · ${player.age} Jahre</span></div></div>${details}${action}</article>`
}
function youthPanelHTML(){
 const youth=ensureYouth(),state=transferState(),signed=activeSave.squad.filter(player=>player.youthPotential&&!player.retired);
 const development=signed.length?'<div class="youth-progress">'+signed.map(player=>{const games=player.seasons?.find(item=>item.number===activeSave.seasonNumber)?.games||0,points=player.youthGrowth?.[activeSave.seasonNumber]?.points||0;return`<div><b>${escapeHTML(player.name)}</b><span>${player.age} Jahre · ${games} Einsätze · ${player.age<24?'+'+points+' Fähigkeitspunkte in dieser Saison':'Entwicklung abgeschlossen'}</span></div>`}).join('')+'</div>':'';
 const selection=state.open?`<p class="help">${YOUTH_POOL_SIZE} Spieler pro Saison. Vor dem Scouting sind keine Stärkewerte bekannt. Scouting ist für ${YOUTH_SCOUT_COST} Credits optional; du kannst auch sofort für ${YOUTH_SIGN_COST} Credits verpflichten. Es gelten Budget und Kaderlimit.</p><div class="youth-grid">${youth.candidates.map(youthCandidateHTML).join('')}</div>`:'';
 return`<section class="panel youth-panel"><div class="section-heading"><h2>Jugendarbeit</h2><span>${state.open?youth.candidates.filter(item=>item.scouted).length+'/'+YOUTH_POOL_SIZE+' gescoutet':signed.length+' im Kader'}</span></div>${development}${selection}</section>`
}
const v32RenderCenterV33=renderCenter;
renderCenter=function(){
 if(activeSave&&activeSave.seasonNumber>=2&&activeSave.currentRound<10&&!activeSave.finance?.gameOver){
  const existing=activeSave.youth?.season;ensureYouth();if(existing!==activeSave.seasonNumber)saveCurrent()
 }
 const result=v32RenderCenterV33();
 if(activeSave&&activeSave.seasonNumber>=2&&activeSave.currentRound<10&&!activeSave.finance?.gameOver){
  const anchor=clubCenter.querySelector('.finance-panel')||clubCenter.querySelector('.intro');
  anchor?.insertAdjacentHTML('afterend',youthPanelHTML());
  clubCenter.querySelectorAll('[data-youth-scout]').forEach(button=>button.onclick=()=>scoutYouth(button.dataset.youthScout));
  clubCenter.querySelectorAll('[data-youth-sign]').forEach(button=>button.onclick=()=>signYouth(button.dataset.youthSign))
 }
 document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');
 return result
};
startScreen.querySelector('footer').textContent='Doppel 6 / PROTOTYP 39';
