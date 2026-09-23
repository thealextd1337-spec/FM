'use strict';

// All stored player abilities and effective match abilities use the same scale.
const v55SkillKeys=['tec','pas','fin','tak','pos','spd','sta','gk','air'];
PLAYER_SPEED_FACTOR=.00425;
FOUL_SKILL_FACTOR=.003;
const v55SaveKey='sechser.saves.v5';
const v55Skill=value=>clamp(Math.round(Number(value)||1),1,20);
const v55SkillBand=value=>value<=7?'very-weak':value<=10?'weak':value<=13?'normal':value<=16?'good':'very-good';
const v55SkillColor=value=>v51FormColors[v55SkillBand(value)];
const v55SkillBandNames={'very-weak':'sehr schwach',weak:'schwach',normal:'durchschnittlich',good:'gut','very-good':'sehr gut'};
const v55OutfieldSkills=[['Technik','tec'],['Passspiel','pas'],['Abschluss','fin'],['Zweikampf','tak'],['Stellungsspiel','pos'],['Geschwindigkeit','spd'],['Kondition','sta'],['Luftspiel','air']];
const v55KeeperSkills=[['Torwartspiel','gk'],...v55OutfieldSkills];
function v55CompleteKeeper(player){
 if(!player?.keeper)return player;
 for(const [key,value] of Object.entries({tec:player.gk??10,fin:10,tak:10,air:10}))if(!Number.isFinite(player[key]))player[key]=v55Skill(value);
 return player;
}
function v55SkillEntries(player){v55CompleteKeeper(player);return(player.keeper?v55KeeperSkills:v55OutfieldSkills).map(([label,key],index)=>({label,key,index,value:player[key]})).filter(skill=>Number.isFinite(skill.value))}
function v55TopSkillsHTML(player){
 const skills=v55SkillEntries(player).sort((a,b)=>b.value-a.value||a.index-b.index).slice(0,3);
 return `<span class="v55-skill-list" role="list" aria-label="Beste Fähigkeiten">${skills.map(skill=>`<span role="listitem" aria-label="${skill.label}: ${v55SkillBandNames[v55SkillBand(skill.value)]}" style="color:${v55SkillColor(skill.value)}">${skill.label}</span>`).join('')}</span>`;
}
function v55SkillGroupsHTML(player){
 v55CompleteKeeper(player);
 const groups=[['Offensiv',v55OutfieldSkills.slice(0,3)],['Defensiv',v55OutfieldSkills.slice(3,5)],['Körperlich',v55OutfieldSkills.slice(5)]];
 if(player.keeper)groups.unshift(['Torwart',[['Torwartspiel','gk']]]);
 return `<div class="v55-skill-groups">${groups.map(([title,skills])=>`<div class="v55-skill-group"><h4>${title}</h4><div role="list" aria-label="${title}">${skills.map(([label,key])=>`<span class="v55-skill-row" role="listitem" aria-label="${label}: ${v55SkillBandNames[v55SkillBand(player[key])]}"><span style="color:${v55SkillColor(player[key])}">${label}</span></span>`).join('')}</div></div>`).join('')}</div><div class="v55-skill-legend" aria-label="Farbstufen">${v51FormKeys.map(key=>`<span><i style="background:${v51FormColors[key]}" aria-hidden="true"></i>${v55SkillBandNames[key]}</span>`).join('')}</div>`;
}
function v55AllSkillsHTML(player){
 return `<div class="v55-roster-skills" role="list" aria-label="Alle Fähigkeiten">${v55SkillEntries(player).map(({label,value})=>`<span role="listitem" aria-label="${label}: ${value} von 20"><span style="color:${v55SkillColor(value)}">${label}</span><b style="color:${v55SkillColor(value)}">${value}</b></span>`).join('')}</div>`;
}
const v55SkillStyle=document.createElement('style');
v55SkillStyle.textContent=`.v55-skill-list{display:grid;gap:3px;line-height:1.35}.v55-skill-list>[role=listitem]{display:block;font-weight:700;white-space:normal;overflow-wrap:anywhere}.v51-card-skills .v55-skill-list{margin-top:2px}.v55-skill-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v55-skill-group{min-width:0;padding:11px;border:1px solid #34494c;border-radius:8px;background:#102126}.v55-skill-group h4{margin:0 0 8px;color:#c4d3cc;font-size:11px}.v55-skill-row{display:block;padding:5px 0;font-size:12px;font-weight:700}.v55-skill-row+.v55-skill-row{border-top:1px solid #34494c}.v55-skill-legend{display:flex;flex-wrap:wrap;gap:5px 12px;margin-top:10px;color:#b8c9c4;font-size:10px}.v55-skill-legend>span{display:inline-flex;align-items:center;gap:4px}.v55-skill-legend i{width:8px;height:8px;border-radius:50%}.market-card .v55-skill-list,.candidate-card .v55-skill-list{margin-top:3px}.v59-player-scout .v55-skill-groups{gap:6px}.v59-player-scout .v55-skill-group{padding:8px}@media(max-width:520px){.v55-skill-groups{grid-template-columns:1fr}.v55-skill-group{padding:9px}.v55-skill-row{padding:4px 0}}`;
v55SkillStyle.textContent+=`.v55-skill-row{display:flex;justify-content:space-between;gap:10px}.v55-skill-row b{font-size:13px}.v55-roster-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 14px;margin-top:10px}.v55-roster-skills>[role=listitem]{display:flex;justify-content:space-between;gap:7px;min-width:0;border-bottom:1px solid #34494c;padding:3px 0;font-size:10px;font-weight:700}.v55-roster-skills>[role=listitem]>span{min-width:0;overflow-wrap:anywhere}.v55-roster-skills b{flex:none}@media(max-width:420px){.v55-roster-skills{grid-template-columns:1fr}}`;
document.head.append(v55SkillStyle);

readSlots=function(){try{const slots=JSON.parse(localStorage.getItem(v55SaveKey)||'[]');if(!Array.isArray(slots))throw Error();storageFailed=false;return slots.filter(slot=>slot?.schema===5&&slot.world)}catch{storageFailed=true;return[]}};
persistSlots=function(slots){try{localStorage.setItem(v55SaveKey,JSON.stringify(slots));storageFailed=false;return true}catch{storageFailed=true;alert('Speichern fehlgeschlagen. Bitte freien Browserspeicher prüfen. Dein geöffnetes Spiel bleibt erhalten.');return false}};
const v55PreviousEnsure=ensureChampionship;
ensureChampionship=function(raw){if(![3,5].includes(raw?.schema))throw Error('Dieser Spielstand verwendet eine ältere Stärkeskala.');raw.schema=3;const save=v55PreviousEnsure(raw);for(const player of [save.keeper,...(save.world?.teams||[]).flatMap(team=>team.roster||[]),...(save.transfer?.offers||[]).map(offer=>offer.player),...(save.formerPlayers||[]).map(entry=>entry.player)])v55CompleteKeeper(player);save.schema=5;return save};
const v55PreviousImport=importSaveObject;
importSaveObject=function(raw){const candidate=raw?.save||raw;if(candidate?.schema!==5)return false;const copy=structuredClone(candidate);copy.schema=3;return v55PreviousImport(raw?.save?{...raw,save:copy}:copy)};

const v55Profiles={
 'Abräumer':{tec:11,pas:12,fin:7,tak:16,pos:16,spd:12,sta:16,air:16},
 'Aufbauspieler':{tec:14,pas:15,fin:8,tak:14,pos:15,spd:11,sta:14,air:13},
 'Schneller Verteidiger':{tec:12,pas:13,fin:8,tak:15,pos:14,spd:16,sta:15,air:13},
 'Spielmacher':{tec:16,pas:17,fin:12,tak:10,pos:15,spd:13,sta:14,air:10},
 'Balljäger':{tec:13,pas:13,fin:10,tak:15,pos:15,spd:14,sta:17,air:14},
 'Dynamischer Läufer':{tec:14,pas:14,fin:12,tak:12,pos:14,spd:15,sta:17,air:12},
 'Torjäger':{tec:15,pas:12,fin:17,tak:6,pos:15,spd:14,sta:13,air:16},
 'Tiefenläufer':{tec:14,pas:12,fin:15,tak:7,pos:14,spd:17,sta:14,air:12},
 'Dribbler':{tec:17,pas:13,fin:15,tak:6,pos:13,spd:16,sta:14,air:10}
};
function v55Roll(base,boost=0,spread=1.4){return v55Skill(base+boost+(random()*2-1)*spread)}
playerIdentity=function(line,n,age,quality=70,cell=17,role=0){
 const identity=uniqueIdentity(),type=pick(typeByLine[line]),base=v55Profiles[type],boost=(quality-70)*.11;
 const player={n,name:identity.name,nation:identity.nation,age,line,assignedLine:line,cell,role,type,foot:random()<.22?'Links':random()<.08?'Beidfüßig':'Rechts',form:0,fresh:100,history:[],seasons:[]};
 for(const [key,value] of Object.entries(base))player[key]=v55Roll(value,boost);
 return player;
};
function v55Keeper(quality=70,age=29){
 const identity=uniqueIdentity(),boost=(quality-70)*.11;
 return{n:1,name:identity.name,nation:identity.nation,age,keeper:true,line:'gk',assignedLine:'gk',type:'Torwart',foot:random()<.2?'Links':'Rechts',gk:v55Roll(16,boost),tec:v55Roll(11,boost*.5),pas:v55Roll(13,boost*.7),fin:v55Roll(5,boost*.2),tak:v55Roll(10,boost*.5),pos:v55Roll(15,boost*.9),spd:v55Roll(10,boost*.4),sta:v55Roll(16,boost*.7),air:v55Roll(14,boost*.8),form:0,fresh:100,history:[],seasons:[]};
}
generatedRoster=function(quality=70){
 beginClubNames();
 const ages=[20,24,27,28,29,30,31,33],layout=[['def',2,26,-1],['def',4,28,-1],['def',5,25,-1],['mid',6,16,0],['mid',7,18,0],['mid',8,17,0],['att',9,7,1],['att',10,8,1]];
 return{outfield:layout.map(([line,n,cell,role],index)=>playerIdentity(line,n,ages[index],quality,cell,role)),keeper:v55Keeper(quality,30)};
};
makeMarketKeeper=function(quality,age){return ensurePlayerId(v55Keeper(quality,age))};

opponentPlayers=function(){
 const roster=activeOpponent().roster.filter(player=>!player.keeper),pickLine=(line,count)=>roster.filter(player=>player.line===line).slice(0,count);
 const selection=[...pickLine('def',2),...pickLine('mid',2),...pickLine('att',1)],cells=[26,28,16,18,7],roles=[-1,-1,0,0,1],boost=(activeOpponent().strength-70)*.13;
 return selection.map((player,index)=>{const copy={...structuredClone(player),cell:cells[index],role:roles[index],assignedLine:player.line};for(const key of v55SkillKeys)if(Number.isFinite(copy[key]))copy[key]=v55Skill(copy[key]+boost);return copy});
};
ability=function(player,key){
 const base=Number.isFinite(player[key])?player[key]:key==='tec'?(player.gk||10):10;
 const age=player.youthPotential&&player.age<=23?0:player.age<=21?(key==='spd'?.4:key==='pos'?-.6:-.2):player.age<=29?0:player.age<=33?(['pas','pos'].includes(key)?.4:key==='spd'?-.6:-.2):(['pas','pos'].includes(key)?.2:key==='spd'?-1.4:-.6);
 const form=(typeof v51EffectiveForm==='function'?v51EffectiveForm(player):player.form||0)*.5;
 const freshness=(100-(player.fresh??100))*.016;
 const fatigue=match&&!player.keeper?match.elapsed/75*Math.max(0,16-(player.sta||14))*.22:0;
 const misplaced=!player.keeper&&player.assignedLine&&player.assignedLine!==player.line&&!['spd','sta'].includes(key)?.45:0;
 const aggression=key==='tak'&&match&&running?(match.aggression?.[player.t]||0)*1.2:0;
 return clamp(base+age+form-freshness-fatigue-misplaced+aggression,1,20);
};
v51Workload=function(player,earlyPress=false){const base=player.keeper?9:20+(20-(player.sta||14))*.6+(earlyPress?6:0)+(player.age>=33?3:0);return base*(1-clamp(player.form||0,-2,2)*.05)};
scoutingBand=function(value,player,key){const seed=[...(player.pid||player.name||'')+key].reduce((sum,char)=>sum+char.charCodeAt(0),0),adjusted=(value||8)+(seed%7-3)*.2;return adjusted>=17?'herausragend':adjusted>=16?'sehr stark':adjusted>=14?'stark':adjusted>=13?'solide':adjusted>=11?'wechselhaft':adjusted>=10?'eher schwach':'deutlich ausbaufähig'};
scoutWord=function(value){return value>=16?'sehr stark':value>=14?'gut':value>=13?'solide':value>=11?'ausbaufähig':'schwach'};
transferQuality=function(player){const keys=player.keeper?['gk','pas','pos','sta']:['tec','pas','fin','tak','pos','spd','sta','air'];return keys.reduce((sum,key)=>sum+(player[key]||10),0)/keys.length};
marketValue=function(player){const quality=transferQuality(player),ageFactor=player.age<=21?1.25:player.age<=25?1.12:player.age<=29?1:player.age<=32?.78:player.age<=35?.5:.3;return clamp(Math.round(((120+Math.max(0,quality-9.6)*70)*ageFactor*(player.keeper?.95:1))/10)*10,80,850)};
annualSalary=function(player){if(Number.isFinite(player.salary))return player.salary;const quality=transferQuality(player),prime=player.age>=24&&player.age<=30?15:player.age<=21?-10:0;player.salary=clamp(Math.round((92+quality*8.25+prime+(player.keeper?10:0))/10)*10,150,290);return player.salary};

scoutingSkillsHTML=v55SkillGroupsHTML;
function v55ColorSkills(text,player){const keys={Technik:'tec',Passspiel:'pas',Abschluss:'fin',Zweikampf:'tak',Stellungsspiel:'pos',Geschwindigkeit:'spd',Kondition:'sta',Torwartspiel:'gk',Luftspiel:'air'};return text.split(' · ').map(part=>{const label=Object.keys(keys).find(name=>part.startsWith(`${name} `)),value=player[keys[label]];return Number.isFinite(value)?`<span style="color:${v55SkillColor(value)}">${escapeHTML(part)}</span>`:escapeHTML(part)}).join(' · ')}
const v55LineupCardContent=v51LineupCardContent;
v51LineupCardContent=function(player,position,selectCell=null){return v55LineupCardContent(player,position,selectCell).replace(/<span class="v51-card-skills">[^<]*<\/span>/,`<span class="v51-card-skills">${v55TopSkillsHTML(player)}</span>`)};
const v55ScoutingText=scoutingText;
scoutingText=function(player){const original=v55ScoutingText(player);return player.keeper?original:`${original} · Luftspiel ${scoutWord(player.air)}`};
scoutingTextHTML=v55TopSkillsHTML;
youthPotentialHTML=function(candidate){
 const keys=youthFocus[candidate.player.line],score=keys.reduce((sum,key)=>sum+candidate.target[key],0)/keys.length;
 return `<strong style="color:${v55SkillColor(score)}">${escapeHTML(youthPotentialWord(candidate))}</strong>`;
};
v42LevelHTML=function(value){return `<strong style="color:${v55SkillColor(value)}">${escapeHTML(v42Level(value))}</strong>`};
for(const id of ['v42-own-team','v42-opp-team']){
 const select=document.querySelector(`#${id}`);if(!select)continue;
 const update=()=>{const team=v42Teams.find(item=>item.id===select.value);if(team)select.style.color=v55SkillColor(team.fin)};
 select.querySelectorAll('option').forEach(option=>{const team=v42Teams.find(item=>item.id===option.value);if(team)option.style.color=v55SkillColor(team.fin)});
 select.addEventListener('change',update);update();
}
const v55BaseStatBlock=statBlock;
statBlock=function(player,stats){const html=v55BaseStatBlock(player,stats);if(player.keeper)return html;const extra=`<span>Hohe Pässe<b>${stats.highComplete||0} / ${stats.highPasses||0}</b></span><span>Flanken<b>${stats.crossComplete||0} / ${stats.crosses||0}</b></span><span>Kopfbälle<b>${(stats.headers||0)+(stats.headerPasses||0)}</b></span><span>Luftduelle<b>${stats.aerialWon||0} / ${stats.aerialDuels||0}</b></span>`;return html.replace('</div>',`${extra}</div>`)};

drawSlots();
