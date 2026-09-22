'use strict';

// Player skills are stored as integers from 0 to 20. Older game systems use
// a 100-point calculation scale, so only their calculation inputs are expanded.
const v53SkillKeys=['tec','pas','fin','tak','pos','spd','sta','gk'];
const v53SaveKey='sechser.saves.v4';
function v53Skill(value){return clamp(Math.round(value/5),0,20)}
function v53Legacy(value){return clamp(Number(value||0),0,20)*5}
function v53Shrink(player){for(const key of v53SkillKeys)if(Number.isFinite(player?.[key]))player[key]=v53Skill(player[key]);return player}
function v53SkillBand(value){return value<=7?'very-weak':value<=10?'weak':value<=13?'normal':value<=16?'good':'very-good'}
function v53SkillColor(value){return v51FormColors[v53SkillBand(value)]}

readSlots=function(){try{const slots=JSON.parse(localStorage.getItem(v53SaveKey)||'[]');if(!Array.isArray(slots))throw Error();storageFailed=false;return slots.filter(slot=>slot?.schema===4&&slot.world)}catch{storageFailed=true;return[]}};
persistSlots=function(slots){try{localStorage.setItem(v53SaveKey,JSON.stringify(slots));storageFailed=false;return true}catch{storageFailed=true;alert('Speichern fehlgeschlagen. Bitte freien Browserspeicher prüfen. Dein geöffnetes Spiel bleibt erhalten.');return false}};
const v53EnsureChampionship=ensureChampionship;
ensureChampionship=function(raw){if(![3,4].includes(raw?.schema))throw Error('Dieser Spielstand verwendet eine ältere Stärkeskala.');raw.schema=3;const save=v53EnsureChampionship(raw);save.schema=4;return save};
const v53ImportSaveObject=importSaveObject;
importSaveObject=function(raw){const candidate=raw?.save||raw;if(candidate?.schema!==4)return false;const copy=structuredClone(candidate);copy.schema=3;return v53ImportSaveObject(raw?.save?{...raw,save:copy}:copy)};

const v53PlayerIdentity=playerIdentity;
playerIdentity=function(...args){return v53Shrink(v53PlayerIdentity(...args))};
const v53GeneratedRoster=generatedRoster;
generatedRoster=function(...args){const roster=v53GeneratedRoster(...args);v53Shrink(roster.keeper);return roster};
const v53MakeMarketKeeper=makeMarketKeeper;
makeMarketKeeper=function(...args){return v53Shrink(v53MakeMarketKeeper(...args))};

// Keep all match people on the 0-20 scale, including generated opposition.
opponentPlayers=function(){const roster=activeOpponent().roster.filter(player=>!player.keeper),pickLine=(line,count)=>roster.filter(player=>player.line===line).slice(0,count),selection=[...pickLine('def',2),...pickLine('mid',2),...pickLine('att',1)],cells=[26,28,16,18,7],roles=[-1,-1,0,0,1],delta=(activeOpponent().strength-70)*.13;return selection.map((player,index)=>{const copy={...structuredClone(player),cell:cells[index],role:roles[index]};for(const key of v53SkillKeys)if(Number.isFinite(copy[key]))copy[key]=clamp(Math.round(copy[key]+delta),0,20);return copy})};
const v53Ability=ability;
ability=function(player,key){const legacy={...player};for(const skill of v53SkillKeys)if(Number.isFinite(legacy[skill]))legacy[skill]=v53Legacy(legacy[skill]);return v53Ability(legacy,key)};
const v53Workload=v51Workload;
v51Workload=function(player,earlyPress=false){return v53Workload({...player,sta:v53Legacy(player.sta??14)},earlyPress)};

const v53ScoutingBand=scoutingBand;
scoutingBand=function(value,player,key){return v53ScoutingBand(v53Legacy(value),player,key)};
const v53ScoutWord=scoutWord;
scoutWord=function(value){return v53ScoutWord(v53Legacy(value))};
const v53TransferQuality=transferQuality;
transferQuality=function(player){return v53Legacy(v53TransferQuality(player))};
const v53AnnualSalary=annualSalary;
annualSalary=function(player){if(Number.isFinite(player.salary))return player.salary;const expanded={...player};for(const key of v53SkillKeys)if(Number.isFinite(expanded[key]))expanded[key]=v53Legacy(expanded[key]);player.salary=v53AnnualSalary(expanded);return player.salary};

const v53PenaltyChance=v42PenaltyChance;
v42PenaltyChance=function(shooter,keeper){const own={...shooter},other={...keeper};for(const key of ['fin','pas','gk']){if(Number.isFinite(own[key]))own[key]=v53Legacy(own[key]);if(Number.isFinite(other[key]))other[key]=v53Legacy(other[key])}return v53PenaltyChance(own,other)};
v41PenaltyChance=v42PenaltyChance;
const v53PenaltyRank=v42Rank;
v42Rank=function(player){const expanded={...player};for(const key of ['fin','pas'])if(Number.isFinite(expanded[key]))expanded[key]=v53Legacy(expanded[key]);return v53PenaltyRank(expanded)};
const v53PenaltyLevel=v42Level;
v42Level=function(value){return v53PenaltyLevel(value<=20?v53Legacy(value):value)};
const v53DemoRoster=v42DemoRoster;
v42DemoRoster=function(team){return v53DemoRoster(team).map(v53Shrink)};

// Five shared colour steps for the existing approximate scouting words.
const v53ScoutingSkillsHTML=scoutingSkillsHTML;
scoutingSkillsHTML=function(player){const html=v53ScoutingSkillsHTML(player);return html.replace(/<span>([^<]+)<b>([^<]+)<\/b><\/span>/g,(whole,label,word)=>{const keys={Technik:'tec',Passspiel:'pas',Abschluss:'fin',Zweikampf:'tak',Stellungsspiel:'pos',Geschwindigkeit:'spd',Kondition:'sta',Torwartspiel:'gk'};const value=player[keys[label]];return Number.isFinite(value)?`<span>${label}<b style="color:${v53SkillColor(value)}">${word}</b></span>`:whole})};
function v53MarketSkillsHTML(player){
 const keys={Technik:'tec',Passspiel:'pas',Abschluss:'fin',Zweikampf:'tak',Stellungsspiel:'pos',Kondition:'sta',Tempo:'spd',Torwartspiel:'gk'};
 return scoutingText(player).split(' · ').map(part=>{
  const label=Object.keys(keys).find(name=>part.startsWith(name+' ')),value=player[keys[label]];
  if(!label||!Number.isFinite(value))return escapeHTML(part);
  return `${escapeHTML(label)} <strong style="color:${v53SkillColor(value)}">${escapeHTML(part.slice(label.length+1))}</strong>`;
 }).join(' · ');
}
const v53OfferCardHTML=qolOfferCardHTML;
qolOfferCardHTML=function(offer,free=false){
 const player=offer.player,plain=`<p>${escapeHTML(scoutingText(player))}</p>`;
 return v53OfferCardHTML(offer,free).replace(plain,`<p>${v53MarketSkillsHTML(player)}</p>`);
};
const v53LineupCardContent=v51LineupCardContent;
v51LineupCardContent=function(player,position){const html=v53LineupCardContent(player,position),keys={Technik:'tec',Passspiel:'pas',Abschluss:'fin',Zweikampf:'tak',Stellungsspiel:'pos',Geschwindigkeit:'spd',Kondition:'sta',Torwartspiel:'gk'};return html.replace(/<span class="v51-card-skills">([^<]*)<\/span>/,(whole,content)=>`<span class="v51-card-skills">${content.split(' · ').map(part=>{const label=Object.keys(keys).find(name=>part.startsWith(name+' ')),value=player[keys[label]];return Number.isFinite(value)?`<span style="color:${v53SkillColor(value)}">${part}</span>`:part}).join(' · ')}</span>`)};

// Earlier scripts render the start menu before the v4 save reader is installed.
// Refresh it now so every visible action refers to a loadable v4 save.
drawSlots();
