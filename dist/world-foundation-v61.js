'use strict';

// Die Trainerwelt nutzt ein eigenes Format; frühere Weltstände bleiben im Browser erhalten.
const v61WorldKey='sechser.world.v9';
const v61MaxCareers=5;
const v61Countries=[['ENG','England'],['ESP','Spanien'],['ITA','Italien'],['GER','Deutschland'],['FRA','Frankreich'],['POR','Portugal']];
const v61CountryNames=Object.fromEntries(v79Nationalities.map(nation=>[nation.code,nation.de]));
const v61Names={
 ENG:[['Oliver','Jack','George','Harry','Noah','Leo','Oscar','Ethan','Lucas','Alfie','William','James'],['Smith','Walker','Turner','Bennett','Carter','Hughes','Morris','Clarke','Cooper','Bailey','Foster','Ward']],
 ESP:[['Alejandro','Daniel','Pablo','Álvaro','Diego','Javier','Sergio','Hugo','Marcos','Adrián','Iker','Iván'],['García','Martínez','López','Sánchez','Rodríguez','Fernández','Pérez','Gómez','Díaz','Moreno','Ruiz','Navarro']],
 ITA:[['Luca','Marco','Matteo','Davide','Andrea','Elia','Lorenzo','Federico','Simone','Riccardo','Alessandro','Tommaso'],['Rossi','Romano','Conti','Costa','Moretti','Gallo','Ferrari','Esposito','Bianchi','Ricci','Marino','Greco']],
 GER:[['Noah','Jonas','Paul','Finn','Anton','Julian','Tim','Nico','Leon','Emil','Moritz','David'],['Weber','Fischer','Wagner','Becker','Hoffmann','Koch','Schäfer','Wolf','Neumann','Braun','Krüger','Hartmann']],
 FRA:[['Lucas','Hugo','Louis','Jules','Raphaël','Nathan','Théo','Enzo','Mathis','Antoine','Adrien','Gabriel'],['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Laurent','Simon']],
 POR:[['João','Diogo','Tiago','Gonçalo','Rafael','Miguel','André','Pedro','Tomás','Nuno','Afonso','Bruno'],['Silva','Santos','Ferreira','Pereira','Oliveira','Costa','Rodrigues','Martins','Sousa','Fernandes','Gomes','Carvalho']]
};
const v61Layout=['gk','def','def','def','mid','mid','mid','mid','att','att','att'];
const v61SkillBases={
 gk:{tec:10,pas:12,fin:5,tak:8,pos:15,spd:10,sta:14,air:14,gk:16},
 def:{tec:11,pas:12,fin:7,tak:15,pos:15,spd:12,sta:14,air:14,gk:3},
 mid:{tec:14,pas:15,fin:11,tak:11,pos:14,spd:14,sta:15,air:10,gk:3},
 att:{tec:15,pas:12,fin:16,tak:7,pos:14,spd:15,sta:13,air:13,gk:3}
};
const v61PositionNames={gk:'Torwart',def:'Abwehr',mid:'Mittelfeld',att:'Angriff'};

function v61Random(seed){
 let state=2166136261;
 for(const char of seed)state=Math.imul(state^char.charCodeAt(0),16777619)>>>0;
 return()=>{state+=0x6D2B79F5;let value=state;value=Math.imul(value^value>>>15,value|1);value^=value+Math.imul(value^value>>>7,value|61);return((value^value>>>14)>>>0)/4294967296};
}

const v61SkinTones=['fair','light','warm','medium','brown','deep'];
const v61HairColors=['black','dark-brown','brown','light-brown','blond','auburn','gray'];
const v61Hairstyles=['buzz','side_part','medium_waves','round_afro','cornrows','textured_crop','tight_curls','short_locs','long_tied','bald'];
const v61FaceShapes=['oval','round','square','long','angular'];
const v61EyeBrows=['soft','straight','arched','wide-set','close-set'];
const v61Noses=['narrow','straight','rounded','broad'];
const v61Mouths=['narrow','soft','wide','full'];
const v61FacialHair=['none','stubble','moustache','short-beard','goatee'];
const v61JubelPoses=['fist_chest'];
const v61StoredJubelPoses=['double_fists','arms_wide','fist_chest','two_fingers_up'];
// Complete face signatures represented by the authored portrait/celebration pairs.
// Their colours remain independent and are drawn from the nationality weights.
const v61AuthoredFaces={
 a:{hairstyle:'tight_curls',pose:'double_fists',faceShape:'oval',eyeBrows:'straight',nose:'straight',mouth:'soft',facialHair:'none'},
 a2:{hairstyle:'buzz',pose:'double_fists',faceShape:'round',eyeBrows:'soft',nose:'straight',mouth:'soft',facialHair:'none'},
 b:{hairstyle:'short_locs',pose:'arms_wide',faceShape:'oval',eyeBrows:'straight',nose:'straight',mouth:'soft',facialHair:'none'},
 b2:{hairstyle:'short_locs',pose:'arms_wide',faceShape:'square',eyeBrows:'arched',nose:'broad',mouth:'narrow',facialHair:'short-beard'},
 c:{hairstyle:'medium_waves',pose:'fist_chest',faceShape:'oval',eyeBrows:'straight',nose:'straight',mouth:'soft',facialHair:'none'},
 c2:{hairstyle:'textured_crop',pose:'fist_chest',faceShape:'square',eyeBrows:'arched',nose:'straight',mouth:'narrow',facialHair:'stubble'},
 d:{hairstyle:'cornrows',pose:'two_fingers_up',faceShape:'angular',eyeBrows:'straight',nose:'straight',mouth:'soft',facialHair:'goatee'},
 d2:{hairstyle:'cornrows',pose:'two_fingers_up',faceShape:'round',eyeBrows:'soft',nose:'rounded',mouth:'full',facialHair:'none'},
 e:{hairstyle:'textured_crop',pose:'double_fists',faceShape:'angular',eyeBrows:'arched',nose:'narrow',mouth:'soft',facialHair:'none'},
 f:{hairstyle:'textured_crop',pose:'two_fingers_up',faceShape:'oval',eyeBrows:'wide-set',nose:'rounded',mouth:'full',facialHair:'none'},
 g:{hairstyle:'textured_crop',pose:'arms_wide',faceShape:'square',eyeBrows:'straight',nose:'broad',mouth:'wide',facialHair:'stubble'},
 h:{hairstyle:'tight_curls',pose:'two_fingers_up',faceShape:'round',eyeBrows:'arched',nose:'rounded',mouth:'soft',facialHair:'none'},
 i:{hairstyle:'tight_curls',pose:'arms_wide',faceShape:'long',eyeBrows:'close-set',nose:'narrow',mouth:'narrow',facialHair:'none'},
 j:{hairstyle:'tight_curls',pose:'fist_chest',faceShape:'angular',eyeBrows:'soft',nose:'straight',mouth:'full',facialHair:'none'},
 k:{hairstyle:'buzz',pose:'arms_wide',faceShape:'oval',eyeBrows:'arched',nose:'narrow',mouth:'wide',facialHair:'none'},
 l:{hairstyle:'buzz',pose:'two_fingers_up',faceShape:'square',eyeBrows:'wide-set',nose:'broad',mouth:'narrow',facialHair:'none'}
};
// Broad editorial weights, not measured skin-tone shares. Every tone remains possible.
const v61SkinProfiles={
 uefa:[25,31,24,13,6,1],north:[16,27,25,18,10,4],south:[8,20,28,26,14,4],
 asia:[7,19,37,26,9,2],oceania:[24,31,24,13,6,2],central:[4,15,29,31,16,5],africa:[2,6,14,24,30,24]
};
const v61SkinOverrides={
 ENG:[20,26,22,15,11,6],FRA:[17,23,22,17,13,8],POR:[17,25,26,19,10,3],
 ESP:[18,28,29,16,7,2],ITA:[18,28,29,16,7,2],
 BRA:[9,18,25,22,18,8],ARG:[25,30,23,14,6,2],URU:[25,30,23,14,6,2],
 USA:[18,26,23,17,11,5],CAN:[23,29,22,14,9,3],MEX:[5,15,31,31,14,4],
 JPN:[12,30,40,14,3,1],KOR:[12,30,40,14,3,1],CHN:[12,30,40,14,3,1],
 IND:[2,9,25,38,21,5],THA:[4,16,42,30,7,1],IRN:[4,15,35,30,13,3],SAU:[4,15,35,30,13,3],
 MAR:[3,12,30,32,17,6],ALG:[3,12,30,32,17,6],TUN:[3,12,30,32,17,6],EGY:[3,12,30,32,17,6],
 RSA:[8,10,13,23,28,18],CPV:[5,8,17,30,27,13]
};
const v61HairColorWeights=[
 [16,25,22,15,13,7,2],[22,28,22,13,9,5,1],[30,30,21,10,5,3,1],
 [38,31,19,7,2,2,1],[48,31,14,3,1,2,1],[57,29,9,2,1,1,1]
];
const v61HairStyleWeights=[
 [13,13,11,4,3,18,11,5,15,7],[13,12,10,5,4,17,13,6,13,7],
 [13,10,9,7,6,16,15,8,10,6],[12,8,7,9,8,15,17,10,8,6],
 [11,6,5,12,10,14,18,12,6,6],[10,4,3,14,11,12,19,14,6,7]
];
function v61WeightedChoice(values,weights,random){
 let choice=random()*weights.reduce((sum,weight)=>sum+weight,0);
 for(let index=0;index<values.length;index++){choice-=weights[index];if(choice<0)return values[index]}
 return values.at(-1);
}
function v61AppearanceSignature(appearance){
 return [appearance.hairstyle,appearance.faceShape,appearance.eyeBrows,appearance.nose,appearance.mouth,appearance.facialHair].join(':');
}
function v61GenerateAppearance(pid,nation,age,peers=[]){
 const group=v79NationByCode[nation]?.group,skinWeights=v61SkinOverrides[nation]||v61SkinProfiles[group];
 if(!skinWeights)throw Error(`Unbekannte Spielernationalität: ${nation}`);
 const used=new Set(peers.map(player=>player.appearance).filter(Boolean).map(v61AppearanceSignature));
 const pose=v61JubelPoses[0];
 for(let attempt=0;attempt<64;attempt++){
  const random=v61Random(`${pid}:appearance:${attempt}`);
  const skinTone=v61WeightedChoice(v61SkinTones,skinWeights,random),skinIndex=v61SkinTones.indexOf(skinTone);
  const hairWeights=[...v61HairColorWeights[skinIndex]];if(age>=30)hairWeights[6]*=3;
  const styleWeights=[...v61HairStyleWeights[skinIndex]];if(age>=30)styleWeights[9]*=2;
  const appearance={skinTone,hairColor:v61WeightedChoice(v61HairColors,hairWeights,random),hairstyle:v61WeightedChoice(v61Hairstyles,styleWeights,random),faceShape:v61FaceShapes[Math.floor(random()*v61FaceShapes.length)],eyeBrows:v61EyeBrows[Math.floor(random()*v61EyeBrows.length)],nose:v61Noses[Math.floor(random()*v61Noses.length)],mouth:v61Mouths[Math.floor(random()*v61Mouths.length)],facialHair:v61WeightedChoice(v61FacialHair,age<18?[90,5,2,2,1]:[62,17,7,11,3],random),pose};
  const authored=Object.values(v61AuthoredFaces).filter(face=>face.hairstyle===appearance.hairstyle&&face.pose===pose&&(age>=18||face.facialHair==='none'));
  if(authored.length)Object.assign(appearance,authored[Math.floor(random()*authored.length)]);
  if(!used.has(v61AppearanceSignature(appearance)))return appearance;
 }
 throw Error(`Keine freie Spielersignatur für ${pid}`);
}
function v61ValidAppearance(appearance){
 return !!appearance&&v61SkinTones.includes(appearance.skinTone)&&v61HairColors.includes(appearance.hairColor)&&v61Hairstyles.includes(appearance.hairstyle)&&v61FaceShapes.includes(appearance.faceShape)&&v61EyeBrows.includes(appearance.eyeBrows)&&v61Noses.includes(appearance.nose)&&v61Mouths.includes(appearance.mouth)&&v61FacialHair.includes(appearance.facialHair)&&v61StoredJubelPoses.includes(appearance.pose);
}

function v61GenerateRoster(entry,seed,foundation=null){
 const random=v61Random(`${seed}:${entry.id}`),home=entry.id.slice(0,3),quality=entry.profile[5]-(entry.id.includes('-C')?1:0),used=new Set(),legacyUsed=new Set(),roster=[];
 return v61Layout.map((line,index)=>{
  const legacyNation=random()<.79?home:v61Countries[Math.floor(random()*v61Countries.length)][0],names=v61Names[legacyNation];
  let legacyName,attempt=0;
  do{legacyName=`${names[0][Math.floor(random()*names[0].length)]} ${names[1][Math.floor(random()*names[1].length)]}`;attempt++}while(legacyUsed.has(legacyName)&&attempt<30);
  legacyUsed.add(legacyName);
  const pid=`${seed}:${entry.id}:${index+1}`,nation=v79ProfessionalNation(home,pid),name=v79PlayerName(nation,pid,used);
  used.add(name);
  const player={pid,n:index+1,name,nation,age:19+Math.floor(random()*16),line,assignedLine:line,keeper:line==='gk',type:v61PositionNames[line],foot:random()<.2?'Links':'Rechts',form:0,fresh:100,history:[],seasons:[],honours:[]};
  for(const [key,base]of Object.entries(v61SkillBases[line]))player[key]=Math.max(1,Math.min(20,Math.round(base+(quality-3)*1.1+(random()-.5)*3)));
  if(foundation)v153Generate(player,foundation,entry.id.includes('FREE')?'free':entry.id.includes('-C')?'cup':'start',entry.profile[5],entry.profile[2]);
  player.appearance=v61GenerateAppearance(pid,nation,player.age,roster);roster.push(player);
  return player;
 });
}

function v61ClubRecord(entry,seed,foundation=null){
 const countryId=entry.id.slice(0,3),cupOnly=entry.id.includes('-C');
 const[tradition,fans,youth,risk,patience,startingSquad]=entry.profile;
 return{id:entry.id,countryId,leagueId:cupOnly?null:`${countryId}-LEAGUE`,cupId:`${countryId}-CUP`,name:entry.name,city:entry.city,colors:entry.colors,kits:v61BuildClubKits(entry),historyText:entry.history,policy:{tradition,fans,youth,risk,patience,startingSquad},roster:v61GenerateRoster(entry,seed,foundation),youthPool:[],balance:null,ledger:[],coachId:null,history:[]};
}

function v61ManagerName(value){return typeof value==='string'?value.replace(/\s+/g,' ').trim():''}
function v61ValidManagerName(value){return typeof value==='string'&&value===v61ManagerName(value)&&value.length>=2&&value.length<=32&&!/[\u0000-\u001f\u007f]/.test(value)}
function v61ValidateCareer(career){
 if(career?.schema!==14||career.modelVersion!==10||!career.manager?.id||!career.world?.seed)return false;
 if(career.manager.name!==undefined&&!v61ValidManagerName(career.manager.name))return false;
 if(career.world.matchConfig!==undefined){try{v160MatchConfig(career.world.matchConfig)}catch{return false}}
 const clubs=career.world.clubs;
 if(!Array.isArray(clubs)||clubs.length!==48||new Set(clubs.map(club=>club.id)).size!==48)return false;
 if(!Array.isArray(career.world.countries)||career.world.countries.length!==6)return false;
 if(!Array.isArray(career.world.competitions)||v62Current(career).length!==13||!Number.isInteger(career.world.calendarCursor))return false;
 if(!Array.isArray(career.world.transfers)||new Set(career.world.transfers.map(item=>item.id)).size!==career.world.transfers.length)return false;
 const managed=clubs.find(club=>club.id===career.manager.managedClubId);
 if(!managed?.leagueId)return false;
 if(!v63Validate(career))return false;
 if(clubs.some(club=>club.kits!==undefined&&!v61ValidClubKits(club.kits)))return false;
 const players=clubs.flatMap(club=>club.roster||[]);
 if([...players,...(career.world.market?.freePlayers||[])].some(player=>!Array.isArray(player.honours)))return false;
 if([...players,...clubs.flatMap(club=>club.youthPool||[]),...(career.world.market?.freePlayers||[])].some(player=>player.appearance&&!v61ValidAppearance(player.appearance)))return false;
 const marketOpen=career.world.seasonFinished||['sponsor','open','deadline',...(career.world.paymentSchedule===1?['budget']:[])].includes(career.world.market?.phase);
 if(clubs.some(club=>!Array.isArray(club.roster)||club.roster.length>14||!marketOpen&&(club.roster.length<10||club.roster.filter(player=>player.keeper).length<1))||new Set(players.map(player=>player.pid)).size!==players.length)return false;
 if(!v61Countries.every(([id])=>clubs.filter(club=>club.countryId===id&&club.leagueId).length===6&&clubs.filter(club=>club.countryId===id&&!club.leagueId).length===2))return false;
 return (typeof v66Validate!=='function'||v66Validate(career))&&(typeof v67Validate!=='function'||v67Validate(career));
}

function v61CreateCareer(clubId,seed=crypto.randomUUID(),managerName=null,playerOptions=undefined,matchOptions=undefined){
 const foundation=typeof v153Options==='function'?v153Options(playerOptions===undefined?v153PreviewOptions():playerOptions,seed):null;
 if(!v61Catalog.some(club=>club.id===clubId&&!club.id.includes('-C')))throw Error('Nur ein Ligaverein kann übernommen werden.');
 const name=managerName===null?null:v61ManagerName(managerName);
 if(name!==null&&!v61ValidManagerName(name))throw Error('Der Managername muss 2 bis 32 Zeichen enthalten.');
 const now=new Date().toISOString();
 const career={schema:14,modelVersion:10,id:crypto.randomUUID(),created:now,updated:now,phase:'world-matches',manager:{id:crypto.randomUUID(),...(name===null?{}:{name}),managedClubId:clubId,stationHistory:[{clubId,fromSeason:1}]},world:{season:1,calendarCursor:null,seed,matchConfig:v160MatchConfig(matchOptions),...(foundation?{playerFoundation:foundation}:{}),countries:v61Countries.map(([id,name])=>({id,name,leagueId:`${id}-LEAGUE`,cupId:`${id}-CUP`})),clubs:v61Catalog.map(entry=>v61ClubRecord(entry,seed,foundation)),coaches:[],contracts:[],competitions:[],transfers:[],market:{freePlayers:[],pendingBids:[]},eventLog:{processedEventIds:[],visibleNews:[]}}};
 v62PrepareSeason(career);
 v63Init(career);
 if(typeof v66Init==='function')v66Init(career);
 if(typeof v67Init==='function')v67Init(career);
 if(typeof v158SeasonStart==='function')v158SeasonStart(career);
 if(!v61ValidateCareer(career))throw Error('Die Vereinswelt ist unvollständig.');
 return career;
}

let v61StorageDb=null,v61StorageReady=typeof indexedDB==='undefined',v61StorageCache=[],v61StoragePending=null,v61StorageWriting=false,v61StorageError=null,v61LastWrite=Promise.resolve();
let v61StorageConfirmed=null,v61StorageBackup=null,v61StorageSavedAt=null,v61StorageLoadError=false;
function v61StorageClone(value){return JSON.parse(JSON.stringify(value))}
function v61ValidCareers(value){try{return Array.isArray(value)&&new Set(value.map(career=>career.id)).size===value.length&&value.every(career=>typeof career.id==='string'&&career.id&&v61ValidateCareer(career))}catch{return false}}
function v61StorageNotify(){if(typeof v64UiStorageStatus==='function')v64UiStorageStatus()}
function v61LoadStorageValues(worlds,backup,savedAt){
 v61StorageBackup=v61ValidCareers(backup)?backup:null;
 v61StorageSavedAt=savedAt||null;
 if(!v61ValidCareers(worlds)){v61StorageLoadError=true;v61StorageError='Die gespeicherten Vereinswelten sind ungültig.';return}
 v61StorageCache=worlds;v61StorageConfirmed=v61StorageClone(worlds);v61StorageLoadError=false;v61StorageError=null;
}
function v61ReadCareers(){
 if(!v61StorageReady)throw Error(v61StorageError||'Vereinswelten werden geladen.');
 if(!v61StorageDb&&v61StorageConfirmed===null&&!v61StorageLoadError){
  try{const raw=JSON.parse(localStorage.getItem(v61WorldKey)||'[]');v61LoadStorageValues(Array.isArray(raw)?raw:raw.worlds,raw.backup,raw.savedAt)}
  catch{v61StorageLoadError=true;v61StorageError='Die gespeicherten Vereinswelten sind ungültig.'}
 }
 if(v61StorageLoadError)throw Error(v61StorageError);
 if(!v61ValidCareers(v61StorageCache))throw Error('Die gespeicherten Vereinswelten sind ungültig.');
 return v61StorageCache;
}
function v61FlushStorage(){
 if(!v61StorageDb||v61StorageWriting||!v61StoragePending)return;
 const pending=v61StoragePending;v61StoragePending=null;v61StorageWriting=true;
 const previous=v61StorageConfirmed||v61StorageBackup||[],backup=pending.careers.map(career=>previous.find(item=>item.id===career.id)||career);
 const savedAt=new Date().toISOString();let settled=false;
 const fail=()=>{
  if(settled)return;settled=true;v61StorageWriting=false;v61StorageError='Die Vereinswelt konnte nicht gespeichert werden.';
  const queued=v61StoragePending;v61StoragePending=null;
  for(const job of [pending,queued])job?.failures.forEach(reject=>reject(Error(v61StorageError)));
  v61StorageNotify();
 };
 try{
  const transaction=v61StorageDb.transaction('careers','readwrite'),store=transaction.objectStore('careers');
  transaction.onabort=fail;transaction.onerror=()=>{try{transaction.abort()}catch{fail()}};
  transaction.oncomplete=()=>{
   if(settled)return;settled=true;v61StorageWriting=false;v61StorageConfirmed=pending.careers;v61StorageBackup=backup;v61StorageSavedAt=savedAt;v61StorageError=null;v61StorageLoadError=false;
   pending.waiters.forEach(resolve=>resolve());v61FlushStorage();v61StorageNotify();
  };
  try{store.put(backup,'worlds-backup');store.put(savedAt,'saved-at');store.put(pending.careers,'worlds')}catch(error){try{transaction.abort()}catch{}fail()}
 }catch{fail()}
}
function v61SaveCareers(careers){
 if(!v61StorageReady)throw Error('Vereinswelten werden noch geladen.');
 if(v61StorageLoadError)throw Error(v61StorageError);
 // Snapshot before queueing: match and market objects continue changing in memory.
 const snapshot=v61StorageClone(careers);
 if(!v61ValidCareers(snapshot))throw Error('Die gespeicherten Vereinswelten sind ungültig.');
 if(!v61StorageDb&&v61StorageConfirmed===null)v61ReadCareers();
 v61StorageCache=careers;
 if(v61StorageDb){
  const write=new Promise((resolve,reject)=>{
   const previous=v61StoragePending;
   v61StoragePending={careers:snapshot,waiters:[...(previous?.waiters||[]),resolve],failures:[...(previous?.failures||[]),reject]};
   v61FlushStorage();
  });
  v61LastWrite=write;write.catch(()=>{});v61StorageNotify();return write;
 }
 try{
  const backup=snapshot.map(career=>(v61StorageConfirmed||[]).find(item=>item.id===career.id)||career),savedAt=new Date().toISOString();
  localStorage.setItem(v61WorldKey,JSON.stringify({worlds:snapshot,backup,savedAt}));
  v61StorageConfirmed=snapshot;v61StorageBackup=backup;v61StorageSavedAt=savedAt;v61StorageError=null;v61LastWrite=Promise.resolve();
 }catch{v61StorageError='Die Vereinswelt konnte nicht gespeichert werden.';v61LastWrite=Promise.reject(Error(v61StorageError));v61LastWrite.catch(()=>{})}
 v61StorageNotify();return v61LastWrite;
}
async function v61WaitForStorage(){
 let pending;do{pending=v61LastWrite;await pending}while(pending!==v61LastWrite);
 if(v61StorageError)throw Error(v61StorageError);
}
async function v61RestoreStorage(){
 if(!v61StorageLoadError||!v61StorageBackup?.length)throw Error('Keine gültige Wiederherstellungskopie verfügbar.');
 const backup=v61StorageClone(v61StorageBackup);v61StorageLoadError=false;v61StorageConfirmed=v61StorageClone(backup);
 try{await v61SaveCareers(backup);v61RenderSaves()}catch(error){v61StorageLoadError=true;v61StorageNotify();throw error}
}
async function v61StoreNewCareer(career,imported=false){
 try{await v61WaitForStorage()}catch(error){if(v61StorageLoadError)throw error}
 // A failed first write may remain in the working cache; only confirmed saves occupy slots.
 const careers=v61StorageError&&v61StorageConfirmed?v61StorageClone(v61StorageConfirmed):v61ReadCareers();
 if(careers.length>=v61MaxCareers)throw Error('Maximal fünf Vereinswelten. Exportiere oder lösche zuerst einen Spielstand.');
 const copy=imported?JSON.parse(JSON.stringify(career)):career;
 if(careers.some(item=>item.id===copy.id))copy.id=crypto.randomUUID();
 if(imported)copy.updated=new Date().toISOString();
 await v61SaveCareers([...careers,copy]);
 return copy;
}
function v61IsWorldExport(raw){
 const candidate=raw?.save||raw;
 return raw?.format==='world'||candidate?.schema===14||candidate?.modelVersion!==undefined;
}
async function v61ImportCareerData(raw){
 const candidate=raw?.save||raw;
 if(candidate?.schema!==14||candidate?.modelVersion!==10||raw?.format&&raw.format!=='world')throw Error('Diese Vereinswelt-Datei hat ein nicht unterstütztes Format.');
 let valid=false;
 try{valid=typeof candidate.id==='string'&&candidate.id.length>0&&v61ValidateCareer(candidate)}catch{}
 if(!valid)throw Error('Die Vereinswelt-Datei ist unvollständig oder beschädigt.');
 return v61StoreNewCareer(candidate,true);
}
async function v61ExportCareerData(id){
 await v61WaitForStorage();
 v61ReadCareers();
 const career=v61StorageConfirmed.find(item=>item.id===id);
 if(!career)throw Error('Diese Vereinswelt wurde nicht gefunden.');
 return{game:'Doppel 6',format:'world',schema:14,modelVersion:10,exported:new Date().toISOString(),save:JSON.parse(JSON.stringify(career))};
}
function v61RescueCareerData(id){
 const career=v61StorageCache.find(item=>item.id===id);
 if(!career||!v61ValidCareers([career]))throw Error('Die Vereinswelt-Datei ist unvollständig oder beschädigt.');
 return{game:'Doppel 6',format:'world',schema:14,modelVersion:10,rescue:true,exported:new Date().toISOString(),save:v61StorageClone(career)};
}
async function v61DeleteCareer(id){
 await v61WaitForStorage();
 const careers=v61ReadCareers();
 if(!careers.some(item=>item.id===id))throw Error('Diese Vereinswelt wurde nicht gefunden.');
 await v61SaveCareers(careers.filter(item=>item.id!==id));
}
function v61InitStorage(){
 if(typeof indexedDB==='undefined')return;
 const request=indexedDB.open('doppel6-world-v9',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('careers');
 request.onerror=()=>{v61StorageError='Der lokale Spielstandspeicher konnte nicht geöffnet werden.';v61RenderSaves();v61StorageNotify()};
 request.onsuccess=()=>{
  v61StorageDb=request.result;
  const transaction=v61StorageDb.transaction('careers','readonly'),store=transaction.objectStore('careers'),values={};let remaining=3,failed=false;
  const fail=()=>{failed=true;v61StorageReady=false;v61StorageLoadError=true;v61StorageError='Gespeicherte Vereinswelten konnten nicht gelesen werden.';v61RenderSaves();v61StorageNotify()};
  transaction.onabort=fail;transaction.onerror=fail;
  for(const key of ['worlds','worlds-backup','saved-at']){
   const read=store.get(key);read.onerror=fail;
   read.onsuccess=()=>{values[key]=read.result;if(--remaining||failed)return;v61LoadStorageValues(values.worlds===undefined?(values['worlds-backup']?.length?null:[]):values.worlds,values['worlds-backup'],values['saved-at']);v61StorageReady=true;v61RenderSaves();v61StorageNotify()};
  }
 };
}

const v61Colors={Anthrazit:'#283039',Bernstein:'#dc9a32',Blau:'#326db7',Bordeaux:'#732e49',Braun:'#76543b',Creme:'#f1e5cc',Dunkelblau:'#193653',Dunkelgrün:'#204938',Eisblau:'#9ccbd9',Elfenbein:'#f3edda',Flieder:'#a98bbb',Gold:'#d9ab45',Grau:'#8b979b',Grün:'#398b5b',Hellgrau:'#c7d0d0',Himmelblau:'#68b8d9',Indigo:'#3b477f',Jade:'#4ba68b',Karmin:'#a43e50',Kobaltblau:'#3267b0',Koralle:'#df7770',Kupfer:'#b8794a',Marineblau:'#24385b',Mint:'#85d0bd',Moosgrün:'#526948',Nachtblau:'#1c3045',Ocker:'#bd904a',Oliv:'#727b47',Orange:'#df8a3b',Petrol:'#2d777c',Pflaume:'#694766',Purpur:'#74468d',Rostrot:'#a85240',Rot:'#c43743',Safran:'#d6a238',Sand:'#d9c6a5',Schiefer:'#586b79',Schwarz:'#1d2329',Seegrün:'#318579',Silber:'#bec8cb',Smaragd:'#24775a',Tannengrün:'#275744',Terrakotta:'#ba674d',Türkis:'#3caaa8',Ultramarin:'#415caf',Violett:'#7750a0',Waldgrün:'#315b42',Weinrot:'#823b52',Weiß:'#f3f5f2',Ziegelrot:'#b94d43'};
const v61KitStyles=['solid','stripe','hoops','halves','diagonal','pinstripes'];
// Curated third colors preserve each club's existing primary and secondary identity.
const v61KitTertiary={
 'ENG-1':'Schwarz','ENG-2':'Marineblau','ENG-3':'Gold','ENG-4':'Weiß','ENG-5':'Creme','ENG-6':'Gold','ENG-C1':'Nachtblau','ENG-C2':'Creme',
 'ESP-1':'Marineblau','ESP-2':'Gold','ESP-3':'Bordeaux','ESP-4':'Marineblau','ESP-5':'Elfenbein','ESP-6':'Bernstein','ESP-C1':'Elfenbein','ESP-C2':'Gold',
 'ITA-1':'Gold','ITA-2':'Weiß','ITA-3':'Bordeaux','ITA-4':'Marineblau','ITA-5':'Creme','ITA-6':'Elfenbein','ITA-C1':'Kobaltblau','ITA-C2':'Bernstein',
 'GER-1':'Schwarz','GER-2':'Gold','GER-3':'Gold','GER-4':'Creme','GER-5':'Gold','GER-6':'Marineblau','GER-C1':'Gold','GER-C2':'Creme',
 'FRA-1':'Weiß','FRA-2':'Gold','FRA-3':'Koralle','FRA-4':'Bordeaux','FRA-5':'Gold','FRA-6':'Koralle','FRA-C1':'Marineblau','FRA-C2':'Creme',
 'POR-1':'Gold','POR-2':'Schwarz','POR-3':'Creme','POR-4':'Creme','POR-5':'Bordeaux','POR-6':'Gold','POR-C1':'Creme','POR-C2':'Marineblau'
};
const v61KeeperPalette=[
 {id:'gold',main:'#e5b56a',style:'solid'},{id:'turquoise',main:'#54d3ce',style:'solid'},
 {id:'coral',main:'#f37b72',style:'solid'},{id:'violet',main:'#b89af0',style:'solid'},
 {id:'silver',main:'#e3e9e5',style:'solid'},{id:'orange',main:'#f2a75a',style:'solid'},
 {id:'lime',main:'#d8ed68',style:'solid'},{id:'pink',main:'#ed6fc1',style:'solid'},
 {id:'blue',main:'#6a88df',style:'solid'},{id:'green',main:'#76d479',style:'solid'},
 {id:'magenta',main:'#ed53b7',style:'solid'},{id:'charcoal',main:'#121820',style:'solid'}
];
function v61KitColorDistance(first,second){
 const rgb=color=>[1,3,5].map(index=>parseInt(color.slice(index,index+2),16));
 const a=rgb(first),b=rgb(second);return Math.hypot(...a.map((value,index)=>value-b[index]));
}
function v61KitHue(color){
 const [r,g,b]=[1,3,5].map(index=>parseInt(color.slice(index,index+2),16)),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
 if(!max||delta/max<.35)return null;
 const hue=max===r?(g-b)/delta:max===g?(b-r)/delta+2:(r-g)/delta+4;
 return (hue*60+360)%360;
}
function v61HarmoniousKitColors({primary,secondary,tertiary}){
 const colors=[primary,secondary,tertiary];
 if(colors.some(color=>typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color))||new Set(colors.map(color=>color.toLowerCase())).size!==3)return false;
 if(v61KitColorDistance(primary,secondary)<60||Math.min(v61KitColorDistance(primary,tertiary),v61KitColorDistance(secondary,tertiary))<100)return false;
 const hues=colors.map(v61KitHue).filter(hue=>hue!==null);
 return hues.length<3||hues.some((hue,index)=>hues.some((other,otherIndex)=>otherIndex>index&&Math.min(Math.abs(hue-other),360-Math.abs(hue-other))<=65));
}
function v61KeeperTrim(main){
 const rgb=[1,3,5].map(index=>parseInt(main.slice(index,index+2),16));
 return (rgb[0]*.299+rgb[1]*.587+rgb[2]*.114)<145?'#f3f5f2':'#1d2329';
}
function v61BuildClubKits(entry,chosenColors=null,chosenStyles=null){
 const [primaryName,secondaryName]=entry.colors.split('/'),tertiaryName=v61KitTertiary[entry.id];
 const primary=chosenColors?.primary||v61Colors[primaryName],secondary=chosenColors?.secondary||v61Colors[secondaryName],tertiary=chosenColors?.tertiary||v61Colors[tertiaryName];
 if(!v61HarmoniousKitColors({primary,secondary,tertiary}))throw Error(`Ungültige Trikotfarben für ${entry.id}`);
 const index=v61Catalog.findIndex(club=>club.id===entry.id);
 const home={main:primary,pattern:secondary,accent:tertiary,style:chosenStyles?.home||v61KitStyles[index%v61KitStyles.length]};
 const away={main:tertiary,pattern:secondary,accent:primary,style:chosenStyles?.away||v61KitStyles[(index+3)%v61KitStyles.length]};
 let best=null;
 for(let first=0;first<v61KeeperPalette.length;first++)for(let second=first+1;second<v61KeeperPalette.length;second++){
  const a=v61KeeperPalette[first],b=v61KeeperPalette[second];
  const contrast=Math.min(v61KitColorDistance(a.main,b.main),...[a,b].flatMap(keeper=>[primary,secondary,tertiary].map(field=>v61KitColorDistance(keeper.main,field))));
  if(!best||contrast>best.contrast)best={first:a,second:b,contrast};
 }
 if(best.contrast<100)throw Error(`Kein klares Torwarttrikotpaar für ${entry.id}`);
 const keepers=[best.first,best.second].map(({id,main,style})=>({id,main,trim:v61KeeperTrim(main),style}));
 return{colors:{primary,secondary,tertiary},home,away,keepers};
}
function v61ValidClubKits(kits){
 if(!kits?.colors||!kits.home||!kits.away||!Array.isArray(kits.keepers)||kits.keepers.length!==2)return false;
 const {primary,secondary,tertiary}=kits.colors;
 if(!v61HarmoniousKitColors({primary,secondary,tertiary}))return false;
 if(kits.home.main!==primary||kits.home.pattern!==secondary||kits.home.accent!==tertiary||kits.away.main!==tertiary||kits.away.pattern!==secondary||kits.away.accent!==primary)return false;
 if(!v61KitStyles.includes(kits.home.style)||!v61KitStyles.includes(kits.away.style))return false;
 if(kits.keepers.some(kit=>!kit||!v61KeeperPalette.some(option=>option.id===kit.id&&option.main===kit.main&&option.style===kit.style)||kit.trim!==v61KeeperTrim(kit.main)))return false;
 return kits.keepers[0].id!==kits.keepers[1].id&&Math.min(v61KitColorDistance(kits.keepers[0].main,kits.keepers[1].main),...kits.keepers.flatMap(kit=>[primary,secondary,tertiary].map(field=>v61KitColorDistance(kit.main,field))))>=100;
}
function v61MatchFieldKit(club,home){
 const kit=club.kits?.[home?'home':'away'];
 if(kit)return{...kit,trim:kit.pattern};
 const colors=v61ClubColors(club);return{main:colors[home?0:1],trim:colors[home?1:0],style:'stripe'};
}
// Compare the visible shirt, including broad patterns, in perceptual color space.
// Main RGB alone accepts white/gold halves against gold/white stripes.
function v61KitAppearance(kit){
 const lab=color=>{
  const [r,g,b]=[1,3,5].map(i=>{const c=parseInt(color.slice(i,i+2),16)/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)});
  const f=n=>n>.008856?Math.cbrt(n):7.787*n+16/116;
  const x=f((.4124564*r+.3575761*g+.1804375*b)/.95047),y=f(.2126729*r+.7151522*g+.072175*b),z=f((.0193339*r+.119192*g+.9503041*b)/1.08883);
  // At TV-camera size, lightness is more reliable than small hue differences.
  return[116*y-16,250*(x-y),100*(y-z)];
 };
 const coverage={stripe:.28,stripes:.45,hoops:.28,halves:.5,diagonal:.2,pinstripes:.12}[kit.style]||0;
 const main=lab(kit.main),pattern=lab(kit.pattern||kit.trim||kit.main);
 return main.map((n,i)=>n*(1-coverage)+pattern[i]*coverage);
}
function v61KitAppearanceDistance(first,second){
 const a=v61KitAppearance(first),b=v61KitAppearance(second);return Math.hypot(...a.map((n,i)=>n-b[i]));
}
function v61KitNumberColor(background){
 const rgb=[1,3,5].map(i=>{const c=parseInt(background.slice(i,i+2),16)/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)}),l=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
 // Choose the larger actual text/background contrast, including mid-tone kits.
 return (l+.05)/.064>1.05/(l+.05)?'#102126':'#ffffff';
}
function v61SelectMatchKits(own,opponent,ownIsHome){
 const desired=[ownIsHome?0:1,ownIsHome?1:0],choices=[own,opponent].map(club=>[v61MatchFieldKit(club,true),v61MatchFieldKit(club,false)]);
 const keeperChoices=[own,opponent].map((club,index)=>club.kits?.keepers?.length===2?club.kits.keepers:[{main:index?'#516bb4':'#e7b957',trim:'#ffffff',style:'solid'}]);
 const candidates=[];
 for(let first=0;first<2;first++)for(let second=0;second<2;second++)for(const userKeeper of keeperChoices[0])for(const opponentKeeper of keeperChoices[1]){
  const user=choices[0][first],opponentKit=choices[1][second];
  const colors=[user.main,opponentKit.main,userKeeper.main,opponentKeeper.main];
  const contrast=Math.min(...colors.flatMap((color,index)=>colors.slice(index+1).map(other=>v61KitColorDistance(color,other))));
  const shirts=[user,opponentKit,userKeeper,opponentKeeper],appearance=shirts.map(v61KitAppearance);
  const visibleContrast=Math.min(...appearance.flatMap((color,index)=>appearance.slice(index+1).map(other=>Math.hypot(...color.map((n,i)=>n-other[i])))));
  const order=ownIsHome?[first,second,userKeeper.main,opponentKeeper.main]:[second,first,opponentKeeper.main,userKeeper.main];
  candidates.push({user,opponent:opponentKit,userKeeper,opponentKeeper,contrast:Math.round(contrast*1e6)/1e6,visibleContrast:Math.round(visibleContrast*1e6)/1e6,order:order.join('/'),homeSwap:Number((ownIsHome?first:second)!==0),swaps:Number(first!==desired[0])+Number(second!==desired[1])});
 }
 const clear=candidates.filter(candidate=>candidate.contrast>=100&&candidate.visibleContrast>=24),safe=candidates.filter(candidate=>candidate.contrast>=85);
 const selected=(clear.length?clear.sort((a,b)=>a.homeSwap-b.homeSwap||a.swaps-b.swaps||b.visibleContrast-a.visibleContrast||a.order.localeCompare(b.order)):
  (safe.length?safe:candidates).sort((a,b)=>b.visibleContrast-a.visibleContrast||b.contrast-a.contrast||a.homeSwap-b.homeSwap||a.swaps-b.swaps||a.order.localeCompare(b.order)))[0];
 return{user:selected.user,opponent:selected.opponent,userKeeper:{...selected.userKeeper},opponentKeeper:{...selected.opponentKeeper}};
}
function v61ClubColors(club){if(club.kits?.colors)return[club.kits.colors.primary,club.kits.colors.secondary];const[a,b]=club.colors.split('/');return[v61Colors[a]||'#c7f36b',v61Colors[b]||'#142629']}
function v61ClubColorLabel(club){
 if(!club.kits?.colors)return club.colors;
 const name=color=>Object.entries(v61Colors).find(([,value])=>value.toLowerCase()===color.toLowerCase())?.[0]||color.toUpperCase();
 const {primary,secondary,tertiary}=club.kits.colors;
 return [primary,secondary,tertiary].map(name).join('/');
}

const v61CrestShapes={
 shield:['M8 5H64V47C64 63 52 73 36 80C20 73 8 63 8 47Z','M12 9H60V47C60 60 49 69 36 75C23 69 12 60 12 47Z','M16 13H56V47C56 57 47 65 36 70C25 65 16 57 16 47Z'],
 round:['M36 5A37 37 0 1 1 35.99 5Z','M36 9A33 33 0 1 1 35.99 9Z','M36 14A28 28 0 1 1 35.99 14Z'],
 diamond:['M36 3 68 34 68 54 36 81 4 54 4 34Z','M36 8 63 36 63 52 36 76 9 52 9 36Z','M36 14 58 37 58 50 36 70 14 50 14 37Z'],
 hex:['M17 5H55L68 25V58L55 79H17L4 58V25Z','M19 9H53L63 27V56L53 74H19L9 56V27Z','M22 14H50L58 29V54L50 69H22L14 54V29Z'],
 pennant:['M8 5H64V64L36 81 8 64Z','M12 9H60V62L36 76 12 62Z','M16 13H56V59L36 70 16 59Z'],
 arch:['M36 3C54 3 66 15 66 31V55C66 68 52 77 36 81C20 77 6 68 6 55V31C6 15 18 3 36 3Z','M36 8C51 8 61 18 61 32V54C61 64 49 72 36 76C23 72 11 64 11 54V32C11 18 21 8 36 8Z','M36 13C48 13 56 21 56 32V53C56 61 47 68 36 71C25 68 16 61 16 53V32C16 21 24 13 36 13Z'],
 oct:['M20 4H52L68 20V64L52 80H20L4 64V20Z','M22 9H50L63 22V62L50 75H22L9 62V22Z','M24 14H48L58 24V60L48 70H24L14 60V24Z']
};
const v61CrestPatterns={
 vertical:['M28 27V56M36 27V56M44 27V56',5],
 pin:['M26 27V56M31 27V56M36 27V56M41 27V56M46 27V56',2],
 diagonal:['M26 51 42 28M33 56 49 33',5],
 hoops:['M25 31H47M25 40H47M25 49H47',4],
 sash:['M27 52 45 29',10]
};
const v61CrestMotifs={
 crown:'<path d="M19 46 18 31 28 37 36 25 44 37 54 31 53 46Z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 50H52" stroke="@INK@" stroke-width="4"/><circle cx="36" cy="34" r="2" fill="@INK@"/>',
 waves:'<path d="M19 34Q27 27 36 34T53 34M19 43Q27 36 36 43T53 43M19 52Q27 45 36 52T53 52" fill="none" stroke="@INK@" stroke-width="3.5" stroke-linecap="round"/>',
 anchor:'<circle cx="36" cy="28" r="4" fill="none" stroke="@INK@" stroke-width="3"/><path d="M36 32V53M25 36H47M20 45Q23 56 36 56T52 45M20 45l-2 6m34-6 2 6" fill="none" stroke="@INK@" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
 gear:'<path d="M31 24h10v5l5-2 5 8-4 3 4 4-5 8-5-2v5H31v-5l-5 2-5-8 4-4-4-3 5-8 5 2Z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5" stroke-linejoin="round"/><circle cx="36" cy="39" r="6" fill="none" stroke="@INK@" stroke-width="3"/>',
 leaf:'<path d="M35 54V30M35 42C22 42 19 34 22 27c9-1 14 5 13 15ZM36 47c13 0 17-8 15-16-10-1-16 6-15 16Z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 31 35 42m14-7L36 47" stroke="@INK@" stroke-width="2"/>',
 hammer:'<path d="M21 28h21v7H21zM36 35l12 18M46 51l-4 3" fill="@ACCENT@" stroke="@INK@" stroke-width="3" stroke-linejoin="round"/><path d="M19 54h34M24 50h24l-4 4H28Z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5"/>',
 sail:'<path d="M36 25v30M33 28 20 49h13ZM39 30 51 49H39Z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 54q8-5 16 0t16 0" fill="none" stroke="@INK@" stroke-width="3"/>',
 star:'<path d="m36 24 4 11 12 1-9 7 3 11-10-6-10 6 3-11-9-7 12-1Z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5" stroke-linejoin="round"/>',
 river:'<path d="M25 25q17 4 10 13t11 18M45 25q-17 4-10 13T24 56" fill="none" stroke="@INK@" stroke-width="4" stroke-linecap="round"/><circle cx="36" cy="40" r="3" fill="@ACCENT@"/>',
 sun:'<circle cx="36" cy="40" r="9" fill="@ACCENT@" stroke="@INK@" stroke-width="3"/><path d="M36 24v5m0 22v5M20 40h6m20 0h6M24 28l5 5m14 14 5 5m0-24-5 5M29 47l-5 5" stroke="@INK@" stroke-width="3" stroke-linecap="round"/>',
 delta:'<path d="M36 25 54 54H18Z" fill="@ACCENT@" stroke="@INK@" stroke-width="3" stroke-linejoin="round"/><path d="M36 36v17m0-8-9 8m9-8 9 8" fill="none" stroke="@INK@" stroke-width="2.5"/>',
 compass:'<path d="m36 22 6 13 13 6-13 6-6 13-6-13-13-6 13-6Z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5"/><circle cx="36" cy="41" r="4" fill="@INK@"/>',
 tower:'<path d="M22 30h28v5H22zm3 5h5v17h-5zm9 0h5v17h-5zm9 0h5v17h-5zM20 52h32v4H20zM26 25h20v5H26z" fill="@ACCENT@" stroke="@INK@" stroke-width="2" stroke-linejoin="round"/>',
 rail:'<path d="M27 25 23 55m22-30 4 30M27 30h18M26 39h20M25 48h22M23 55h26" fill="none" stroke="@INK@" stroke-width="3" stroke-linecap="round"/><path d="M32 25h8" stroke="@ACCENT@" stroke-width="4"/>',
 column:'<path d="M23 27h26v5H23zM27 32h18v21H27zM22 53h28v5H22z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5"/><path d="M33 33v18m6-18v18" stroke="@INK@" stroke-width="2"/>',
 hill:'<path d="M18 53 30 35l7 9 7-15 12 24Z" fill="@ACCENT@" stroke="@INK@" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 56h35" stroke="@INK@" stroke-width="3"/>',
 bridge:'<path d="M18 50h36M21 50V34h30v16M27 49q9-21 18 0M23 31h26" fill="none" stroke="@INK@" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 54h36" stroke="@ACCENT@" stroke-width="3"/>',
 union:'<circle cx="30" cy="40" r="12" fill="none" stroke="@INK@" stroke-width="4"/><circle cx="42" cy="40" r="12" fill="none" stroke="@ACCENT@" stroke-width="4"/><path d="M36 30q6 10 0 20" fill="none" stroke="@INK@" stroke-width="2"/>',
 v:'<path d="m20 28 16 26 16-26h-9l-7 12-7-12Z" fill="@ACCENT@" stroke="@INK@" stroke-width="3" stroke-linejoin="round"/>',
 laurel:'<path d="M29 55Q19 45 25 29m18 26q10-10 4-26" fill="none" stroke="@INK@" stroke-width="3"/><path d="m25 32-7-5 2 9 6 3m-2 3-7-2 4 8 6 1m20-17 7-5-2 9-6 3m2 3 7-2-4 8-6 1" fill="@ACCENT@" stroke="@INK@" stroke-width="1.5"/>'
};
// Curated silhouette, symbol and stripe layout keep clubs recognizable at small sizes.
const v61CrestDesigns={
 'ENG-1':['shield','crown','vertical'],'ENG-2':['round','waves','hoops'],'ENG-3':['pennant','anchor','diagonal'],'ENG-4':['hex','gear','vertical'],'ENG-5':['arch','anchor','pin'],'ENG-6':['shield','leaf','diagonal'],'ENG-C1':['hex','hammer','sash'],'ENG-C2':['pennant','sail','hoops'],
 'ESP-1':['round','star','diagonal'],'ESP-2':['shield','waves','vertical'],'ESP-3':['diamond','river','pin'],'ESP-4':['arch','sun','sash'],'ESP-5':['hex','delta','vertical'],'ESP-6':['pennant','compass','diagonal'],'ESP-C1':['oct','compass','hoops'],'ESP-C2':['round','sail','pin'],
 'ITA-1':['shield','tower','vertical'],'ITA-2':['hex','rail','diagonal'],'ITA-3':['arch','column','hoops'],'ITA-4':['diamond','hill','sash'],'ITA-5':['round','bridge','pin'],'ITA-6':['pennant','sun','diagonal'],'ITA-C1':['oct','leaf','vertical'],'ITA-C2':['arch','sail','hoops'],
 'GER-1':['round','river','vertical'],'GER-2':['shield','river','diagonal'],'GER-3':['hex','anchor','hoops'],'GER-4':['diamond','hill','vertical'],'GER-5':['arch','bridge','sash'],'GER-6':['oct','leaf','pin'],'GER-C1':['pennant','sun','vertical'],'GER-C2':['shield','compass','hoops'],
 'FRA-1':['hex','star','sash'],'FRA-2':['round','union','vertical'],'FRA-3':['shield','waves','pin'],'FRA-4':['pennant','sail','diagonal'],'FRA-5':['arch','union','hoops'],'FRA-6':['diamond','v','vertical'],'FRA-C1':['oct','river','sash'],'FRA-C2':['shield','compass','pin'],
 'POR-1':['arch','star','vertical'],'POR-2':['hex','bridge','hoops'],'POR-3':['shield','union','diagonal'],'POR-4':['diamond','compass','sash'],'POR-5':['round','laurel','pin'],'POR-6':['pennant','sail','vertical'],'POR-C1':['oct','tower','diagonal'],'POR-C2':['arch','sun','hoops']
};
// BEGIN AUTHORED CREST ASSETS
const v61CrestAssets={
 "ENG-1": {
  "palette": [
   "#c43743",
   "#f3f5f2",
   "#1d2329"
  ],
  "neutralForeground": null,
  "image": "crests/eng-1.png",
  "edge": "crests/eng-1-edge.png",
  "detail": "crests/eng-1-detail.png",
  "masks": [
   "crests/eng-1-0.png",
   "crests/eng-1-1.png",
   "crests/eng-1-2.png"
  ]
 },
 "ENG-2": {
  "palette": [
   "#68b8d9",
   "#f3f5f2",
   "#24385b"
  ],
  "neutralForeground": null,
  "image": "crests/eng-2.png",
  "edge": "crests/eng-2-edge.png",
  "detail": "crests/eng-2-detail.png",
  "masks": [
   "crests/eng-2-0.png",
   "crests/eng-2-1.png",
   "crests/eng-2-2.png"
  ]
 },
 "ENG-3": {
  "palette": [
   "#7750a0",
   "#f1e5cc",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/eng-3.png",
  "edge": "crests/eng-3-edge.png",
  "detail": "crests/eng-3-detail.png",
  "masks": [
   "crests/eng-3-0.png",
   "crests/eng-3-1.png",
   "crests/eng-3-2.png"
  ]
 },
 "ENG-4": {
  "palette": [
   "#d9ab45",
   "#1d2329",
   "#f3f5f2"
  ],
  "neutralForeground": null,
  "image": "crests/eng-4.png",
  "edge": "crests/eng-4-edge.png",
  "detail": "crests/eng-4-detail.png",
  "masks": [
   "crests/eng-4-0.png",
   "crests/eng-4-1.png",
   "crests/eng-4-2.png"
  ]
 },
 "ENG-5": {
  "palette": [
   "#3caaa8",
   "#732e49",
   "#f1e5cc"
  ],
  "neutralForeground": null,
  "image": "crests/eng-5.png",
  "edge": "crests/eng-5-edge.png",
  "detail": "crests/eng-5-detail.png",
  "masks": [
   "crests/eng-5-0.png",
   "crests/eng-5-1.png",
   "crests/eng-5-2.png"
  ]
 },
 "ENG-6": {
  "palette": [
   "#315b42",
   "#f3f5f2",
   "#d9ab45"
  ],
  "neutralForeground": 0,
  "image": "crests/eng-6.png",
  "edge": "crests/eng-6-edge.png",
  "detail": "crests/eng-6-detail.png",
  "masks": [
   "crests/eng-6-0.png",
   "crests/eng-6-1.png",
   "crests/eng-6-2.png"
  ]
 },
 "ENG-C1": {
  "palette": [
   "#a85240",
   "#f3edda",
   "#1c3045"
  ],
  "neutralForeground": null,
  "image": "crests/eng-c1.png",
  "edge": "crests/eng-c1-edge.png",
  "detail": "crests/eng-c1-detail.png",
  "masks": [
   "crests/eng-c1-0.png",
   "crests/eng-c1-1.png",
   "crests/eng-c1-2.png"
  ]
 },
 "ENG-C2": {
  "palette": [
   "#24385b",
   "#df8a3b",
   "#f1e5cc"
  ],
  "neutralForeground": null,
  "image": "crests/eng-c2.png",
  "edge": "crests/eng-c2-edge.png",
  "detail": "crests/eng-c2-detail.png",
  "masks": [
   "crests/eng-c2-0.png",
   "crests/eng-c2-1.png",
   "crests/eng-c2-2.png"
  ]
 },
 "ESP-1": {
  "palette": [
   "#f3f5f2",
   "#d9ab45",
   "#24385b"
  ],
  "neutralForeground": null,
  "image": "crests/esp-1.png",
  "edge": "crests/esp-1-edge.png",
  "detail": "crests/esp-1-detail.png",
  "masks": [
   "crests/esp-1-0.png",
   "crests/esp-1-1.png",
   "crests/esp-1-2.png"
  ]
 },
 "ESP-2": {
  "palette": [
   "#326db7",
   "#a43e50",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/esp-2.png",
  "edge": "crests/esp-2-edge.png",
  "detail": "crests/esp-2-detail.png",
  "masks": [
   "crests/esp-2-0.png",
   "crests/esp-2-1.png",
   "crests/esp-2-2.png"
  ]
 },
 "ESP-3": {
  "palette": [
   "#a98bbb",
   "#bec8cb",
   "#732e49"
  ],
  "neutralForeground": null,
  "image": "crests/esp-3.png",
  "edge": "crests/esp-3-edge.png",
  "detail": "crests/esp-3-detail.png",
  "masks": [
   "crests/esp-3-0.png",
   "crests/esp-3-1.png",
   "crests/esp-3-2.png"
  ]
 },
 "ESP-4": {
  "palette": [
   "#df7770",
   "#f1e5cc",
   "#24385b"
  ],
  "neutralForeground": null,
  "image": "crests/esp-4.png",
  "edge": "crests/esp-4-edge.png",
  "detail": "crests/esp-4-detail.png",
  "masks": [
   "crests/esp-4-0.png",
   "crests/esp-4-1.png",
   "crests/esp-4-2.png"
  ]
 },
 "ESP-5": {
  "palette": [
   "#275744",
   "#bd904a",
   "#f3edda"
  ],
  "neutralForeground": 0,
  "image": "crests/esp-5.png",
  "edge": "crests/esp-5-edge.png",
  "detail": "crests/esp-5-detail.png",
  "masks": [
   "crests/esp-5-0.png",
   "crests/esp-5-1.png",
   "crests/esp-5-2.png"
  ]
 },
 "ESP-6": {
  "palette": [
   "#586b79",
   "#f3f5f2",
   "#dc9a32"
  ],
  "neutralForeground": null,
  "image": "crests/esp-6.png",
  "edge": "crests/esp-6-edge.png",
  "detail": "crests/esp-6-detail.png",
  "masks": [
   "crests/esp-6-0.png",
   "crests/esp-6-1.png",
   "crests/esp-6-2.png"
  ]
 },
 "ESP-C1": {
  "palette": [
   "#727b47",
   "#823b52",
   "#f3edda"
  ],
  "neutralForeground": null,
  "image": "crests/esp-c1.png",
  "edge": "crests/esp-c1-edge.png",
  "detail": "crests/esp-c1-detail.png",
  "masks": [
   "crests/esp-c1-0.png",
   "crests/esp-c1-1.png",
   "crests/esp-c1-2.png"
  ]
 },
 "ESP-C2": {
  "palette": [
   "#9ccbd9",
   "#76543b",
   "#d9ab45"
  ],
  "neutralForeground": 1,
  "image": "crests/esp-c2.png",
  "edge": "crests/esp-c2-edge.png",
  "detail": "crests/esp-c2-detail.png",
  "masks": [
   "crests/esp-c2-0.png",
   "crests/esp-c2-1.png",
   "crests/esp-c2-2.png"
  ]
 },
 "ITA-1": {
  "palette": [
   "#1d2329",
   "#f3f5f2",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/ita-1.png",
  "edge": "crests/ita-1-edge.png",
  "detail": "crests/ita-1-detail.png",
  "masks": [
   "crests/ita-1-0.png",
   "crests/ita-1-1.png",
   "crests/ita-1-2.png"
  ]
 },
 "ITA-2": {
  "palette": [
   "#326db7",
   "#1d2329",
   "#f3f5f2"
  ],
  "neutralForeground": null,
  "image": "crests/ita-2.png",
  "edge": "crests/ita-2-edge.png",
  "detail": "crests/ita-2-detail.png",
  "masks": [
   "crests/ita-2-0.png",
   "crests/ita-2-1.png",
   "crests/ita-2-2.png"
  ]
 },
 "ITA-3": {
  "palette": [
   "#a98bbb",
   "#f3edda",
   "#732e49"
  ],
  "neutralForeground": 2,
  "image": "crests/ita-3.png",
  "edge": "crests/ita-3-edge.png",
  "detail": "crests/ita-3-detail.png",
  "masks": [
   "crests/ita-3-0.png",
   "crests/ita-3-1.png",
   "crests/ita-3-2.png"
  ]
 },
 "ITA-4": {
  "palette": [
   "#727b47",
   "#f3f5f2",
   "#24385b"
  ],
  "neutralForeground": null,
  "image": "crests/ita-4.png",
  "edge": "crests/ita-4-edge.png",
  "detail": "crests/ita-4-detail.png",
  "masks": [
   "crests/ita-4-0.png",
   "crests/ita-4-1.png",
   "crests/ita-4-2.png"
  ]
 },
 "ITA-5": {
  "palette": [
   "#3267b0",
   "#dc9a32",
   "#f1e5cc"
  ],
  "neutralForeground": 0,
  "image": "crests/ita-5.png",
  "edge": "crests/ita-5-edge.png",
  "detail": "crests/ita-5-detail.png",
  "masks": [
   "crests/ita-5-0.png",
   "crests/ita-5-1.png",
   "crests/ita-5-2.png"
  ]
 },
 "ITA-6": {
  "palette": [
   "#ba674d",
   "#1d2329",
   "#f3edda"
  ],
  "neutralForeground": null,
  "image": "crests/ita-6.png",
  "edge": "crests/ita-6-edge.png",
  "detail": "crests/ita-6-detail.png",
  "masks": [
   "crests/ita-6-0.png",
   "crests/ita-6-1.png",
   "crests/ita-6-2.png"
  ]
 },
 "ITA-C1": {
  "palette": [
   "#526948",
   "#d9c6a5",
   "#3267b0"
  ],
  "neutralForeground": null,
  "image": "crests/ita-c1.png",
  "edge": "crests/ita-c1-edge.png",
  "detail": "crests/ita-c1-detail.png",
  "masks": [
   "crests/ita-c1-0.png",
   "crests/ita-c1-1.png",
   "crests/ita-c1-2.png"
  ]
 },
 "ITA-C2": {
  "palette": [
   "#d9c6a5",
   "#415caf",
   "#dc9a32"
  ],
  "neutralForeground": null,
  "image": "crests/ita-c2.png",
  "edge": "crests/ita-c2-edge.png",
  "detail": "crests/ita-c2-detail.png",
  "masks": [
   "crests/ita-c2-0.png",
   "crests/ita-c2-1.png",
   "crests/ita-c2-2.png"
  ]
 },
 "GER-1": {
  "palette": [
   "#c43743",
   "#f3f5f2",
   "#1d2329"
  ],
  "neutralForeground": null,
  "image": "crests/ger-1.png",
  "edge": "crests/ger-1-edge.png",
  "detail": "crests/ger-1-detail.png",
  "masks": [
   "crests/ger-1-0.png",
   "crests/ger-1-1.png",
   "crests/ger-1-2.png"
  ]
 },
 "GER-2": {
  "palette": [
   "#398b5b",
   "#f3f5f2",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/ger-2.png",
  "edge": "crests/ger-2-edge.png",
  "detail": "crests/ger-2-detail.png",
  "masks": [
   "crests/ger-2-0.png",
   "crests/ger-2-1.png",
   "crests/ger-2-2.png"
  ]
 },
 "GER-3": {
  "palette": [
   "#204938",
   "#f1e5cc",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/ger-3.png",
  "edge": "crests/ger-3-edge.png",
  "detail": "crests/ger-3-detail.png",
  "masks": [
   "crests/ger-3-0.png",
   "crests/ger-3-1.png",
   "crests/ger-3-2.png"
  ]
 },
 "GER-4": {
  "palette": [
   "#dc9a32",
   "#315b42",
   "#f1e5cc"
  ],
  "neutralForeground": null,
  "image": "crests/ger-4.png",
  "edge": "crests/ger-4-edge.png",
  "detail": "crests/ger-4-detail.png",
  "masks": [
   "crests/ger-4-0.png",
   "crests/ger-4-1.png",
   "crests/ger-4-2.png"
  ]
 },
 "GER-5": {
  "palette": [
   "#1c3045",
   "#f3f5f2",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/ger-5.png",
  "edge": "crests/ger-5-edge.png",
  "detail": "crests/ger-5-detail.png",
  "masks": [
   "crests/ger-5-0.png",
   "crests/ger-5-1.png",
   "crests/ger-5-2.png"
  ]
 },
 "GER-6": {
  "palette": [
   "#4ba68b",
   "#bd904a",
   "#24385b"
  ],
  "neutralForeground": 0,
  "image": "crests/ger-6.png",
  "edge": "crests/ger-6-edge.png",
  "detail": "crests/ger-6-detail.png",
  "masks": [
   "crests/ger-6-0.png",
   "crests/ger-6-1.png",
   "crests/ger-6-2.png"
  ]
 },
 "GER-C1": {
  "palette": [
   "#74468d",
   "#c7d0d0",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/ger-c1.png",
  "edge": "crests/ger-c1-edge.png",
  "detail": "crests/ger-c1-detail.png",
  "masks": [
   "crests/ger-c1-0.png",
   "crests/ger-c1-1.png",
   "crests/ger-c1-2.png"
  ]
 },
 "GER-C2": {
  "palette": [
   "#b94d43",
   "#24385b",
   "#f1e5cc"
  ],
  "neutralForeground": null,
  "image": "crests/ger-c2.png",
  "edge": "crests/ger-c2-edge.png",
  "detail": "crests/ger-c2-detail.png",
  "masks": [
   "crests/ger-c2-0.png",
   "crests/ger-c2-1.png",
   "crests/ger-c2-2.png"
  ]
 },
 "FRA-1": {
  "palette": [
   "#193653",
   "#c43743",
   "#f3f5f2"
  ],
  "neutralForeground": null,
  "image": "crests/fra-1.png",
  "edge": "crests/fra-1-edge.png",
  "detail": "crests/fra-1-detail.png",
  "masks": [
   "crests/fra-1-0.png",
   "crests/fra-1-1.png",
   "crests/fra-1-2.png"
  ]
 },
 "FRA-2": {
  "palette": [
   "#732e49",
   "#f1e5cc",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/fra-2.png",
  "edge": "crests/fra-2-edge.png",
  "detail": "crests/fra-2-detail.png",
  "masks": [
   "crests/fra-2-0.png",
   "crests/fra-2-1.png",
   "crests/fra-2-2.png"
  ]
 },
 "FRA-3": {
  "palette": [
   "#398b5b",
   "#f3edda",
   "#df7770"
  ],
  "neutralForeground": 0,
  "image": "crests/fra-3.png",
  "edge": "crests/fra-3-edge.png",
  "detail": "crests/fra-3-detail.png",
  "masks": [
   "crests/fra-3-0.png",
   "crests/fra-3-1.png",
   "crests/fra-3-2.png"
  ]
 },
 "FRA-4": {
  "palette": [
   "#2d777c",
   "#d9c6a5",
   "#732e49"
  ],
  "neutralForeground": null,
  "image": "crests/fra-4.png",
  "edge": "crests/fra-4-edge.png",
  "detail": "crests/fra-4-detail.png",
  "masks": [
   "crests/fra-4-0.png",
   "crests/fra-4-1.png",
   "crests/fra-4-2.png"
  ]
 },
 "FRA-5": {
  "palette": [
   "#7750a0",
   "#8b979b",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/fra-5.png",
  "edge": "crests/fra-5-edge.png",
  "detail": "crests/fra-5-detail.png",
  "masks": [
   "crests/fra-5-0.png",
   "crests/fra-5-1.png",
   "crests/fra-5-2.png"
  ]
 },
 "FRA-6": {
  "palette": [
   "#85d0bd",
   "#283039",
   "#df7770"
  ],
  "neutralForeground": 1,
  "image": "crests/fra-6.png",
  "edge": "crests/fra-6-edge.png",
  "detail": "crests/fra-6-detail.png",
  "masks": [
   "crests/fra-6-0.png",
   "crests/fra-6-1.png",
   "crests/fra-6-2.png"
  ]
 },
 "FRA-C1": {
  "palette": [
   "#b8794a",
   "#3caaa8",
   "#24385b"
  ],
  "neutralForeground": null,
  "image": "crests/fra-c1.png",
  "edge": "crests/fra-c1-edge.png",
  "detail": "crests/fra-c1-detail.png",
  "masks": [
   "crests/fra-c1-0.png",
   "crests/fra-c1-1.png",
   "crests/fra-c1-2.png"
  ]
 },
 "FRA-C2": {
  "palette": [
   "#bd904a",
   "#204938",
   "#f1e5cc"
  ],
  "neutralForeground": null,
  "image": "crests/fra-c2.png",
  "edge": "crests/fra-c2-edge.png",
  "detail": "crests/fra-c2-detail.png",
  "masks": [
   "crests/fra-c2-0.png",
   "crests/fra-c2-1.png",
   "crests/fra-c2-2.png"
  ]
 },
 "POR-1": {
  "palette": [
   "#c43743",
   "#f3f5f2",
   "#d9ab45"
  ],
  "neutralForeground": null,
  "image": "crests/por-1.png",
  "edge": "crests/por-1-edge.png",
  "detail": "crests/por-1-detail.png",
  "masks": [
   "crests/por-1-0.png",
   "crests/por-1-1.png",
   "crests/por-1-2.png"
  ]
 },
 "POR-2": {
  "palette": [
   "#326db7",
   "#f3f5f2",
   "#1d2329"
  ],
  "neutralForeground": 0,
  "image": "crests/por-2.png",
  "edge": "crests/por-2-edge.png",
  "detail": "crests/por-2-detail.png",
  "masks": [
   "crests/por-2-0.png",
   "crests/por-2-1.png",
   "crests/por-2-2.png"
  ]
 },
 "POR-3": {
  "palette": [
   "#318579",
   "#a43e50",
   "#f1e5cc"
  ],
  "neutralForeground": null,
  "image": "crests/por-3.png",
  "edge": "crests/por-3-edge.png",
  "detail": "crests/por-3-detail.png",
  "masks": [
   "crests/por-3-0.png",
   "crests/por-3-1.png",
   "crests/por-3-2.png"
  ]
 },
 "POR-4": {
  "palette": [
   "#3b477f",
   "#bd904a",
   "#f1e5cc"
  ],
  "neutralForeground": null,
  "image": "crests/por-4.png",
  "edge": "crests/por-4-edge.png",
  "detail": "crests/por-4-detail.png",
  "masks": [
   "crests/por-4-0.png",
   "crests/por-4-1.png",
   "crests/por-4-2.png"
  ]
 },
 "POR-5": {
  "palette": [
   "#3caaa8",
   "#bec8cb",
   "#732e49"
  ],
  "neutralForeground": null,
  "image": "crests/por-5.png",
  "edge": "crests/por-5-edge.png",
  "detail": "crests/por-5-detail.png",
  "masks": [
   "crests/por-5-0.png",
   "crests/por-5-1.png",
   "crests/por-5-2.png"
  ]
 },
 "POR-6": {
  "palette": [
   "#694766",
   "#f1e5cc",
   "#d9ab45"
  ],
  "neutralForeground": 0,
  "image": "crests/por-6.png",
  "edge": "crests/por-6-edge.png",
  "detail": "crests/por-6-detail.png",
  "masks": [
   "crests/por-6-0.png",
   "crests/por-6-1.png",
   "crests/por-6-2.png"
  ]
 },
 "POR-C1": {
  "palette": [
   "#727b47",
   "#b8794a",
   "#f1e5cc"
  ],
  "neutralForeground": null,
  "image": "crests/por-c1.png",
  "edge": "crests/por-c1-edge.png",
  "detail": "crests/por-c1-detail.png",
  "masks": [
   "crests/por-c1-0.png",
   "crests/por-c1-1.png",
   "crests/por-c1-2.png"
  ]
 },
 "POR-C2": {
  "palette": [
   "#68b8d9",
   "#ba674d",
   "#24385b"
  ],
  "neutralForeground": 2,
  "image": "crests/por-c2.png",
  "edge": "crests/por-c2-edge.png",
  "detail": "crests/por-c2-detail.png",
  "masks": [
   "crests/por-c2-0.png",
   "crests/por-c2-1.png",
   "crests/por-c2-2.png"
  ]
 }
};
let v61CrestInstance=0;
// END AUTHORED CREST ASSETS
function v61CrestSVG(club){
 const asset=v61CrestAssets[club.id];
 if(asset){
  const colors=club.kits?.colors?['primary','secondary','tertiary'].map(key=>club.kits.colors[key]):[...v61ClubColors(club),v61Colors[v61KitTertiary[club.id]]];
  const palette=colors.map((color,index)=>/^#[0-9a-f]{6}$/i.test(color)?color:asset.palette[index]);
  const name=escapeHTML(club.name);
  let artwork;
  if(palette.every((color,index)=>color.toLowerCase()===asset.palette[index].toLowerCase()))artwork=`<image href="${asset.image}" width="336" height="336"/>`;
  else{
   const prefix=`v61-crest-${++v61CrestInstance}`;
   // Offset the original color regions: texture survives instead of becoming flat fills.
   const offsets=palette.map((color,index)=>[1,3,5].map(at=>(parseInt(color.slice(at,at+2),16)-parseInt(asset.palette[index].slice(at,at+2),16))/255));
   artwork='<defs>'+asset.masks.map((src,index)=>`<mask id="${prefix}-${index}" maskUnits="userSpaceOnUse" x="0" y="0" width="336" height="336" style="mask-type:alpha"><image href="${src}" width="336" height="336"/></mask><filter id="${prefix}-tint-${index}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 ${offsets[index][0]} 0 1 0 0 ${offsets[index][1]} 0 0 1 0 ${offsets[index][2]} 0 0 0 1 0"/></filter>`).join('')+'</defs>'+palette.map((color,index)=>`<image href="${asset.image}" width="336" height="336" data-color="${color}" mask="url(#${prefix}-${index})" filter="url(#${prefix}-tint-${index})"/>`).join('')+`<image href="${asset.detail}" width="336" height="336"/>`;
   if(asset.neutralForeground!==null){
    const foreground=palette[asset.neutralForeground];
    const brightness=[1,3,5].reduce((sum,at,index)=>sum+parseInt(foreground.slice(at,at+2),16)*[.2126,.7152,.0722][index],0);
    if(brightness>170){
     // A neutral field switches to dark ink when a saved palette makes its motif light.
     artwork=`<defs><filter id="${prefix}-field" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .082 0 0 0 0 .137 0 0 0 0 .176 0 0 0 1 0"/></filter></defs>`+artwork.replace(`href="${asset.detail}"`,`href="${asset.detail}" filter="url(#${prefix}-field)"`);
    }
   }
  }
  return `<svg class="v61-crest" viewBox="0 0 336 336" role="img" aria-label="Vereinslogo ${name}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"><title>Vereinslogo ${name}</title><image href="${asset.edge}" width="336" height="336"/>${artwork}</svg>`;
 }
 const [main,trim]=v61ClubColors(club),accent=club.kits?.colors?.tertiary||'#f1e5cc';
 const [shapeId,motifId,patternId]=v61CrestDesigns[club.id]||['shield','star','vertical'];
 const shape=v61CrestShapes[shapeId],pattern=v61CrestPatterns[patternId],ink=v61KeeperTrim(main),name=escapeHTML(club.name);
 const paths=shape.map((d,index)=>'<path d="'+d+'" fill="'+['#101820',trim,main][index]+'"/>').join('');
 const stripes='<path d="'+pattern[0]+'" fill="none" stroke="'+trim+'" stroke-width="'+pattern[1]+'" stroke-linecap="round" opacity=".48"/>';
 const motif=v61CrestMotifs[motifId].replaceAll('@INK@',ink).replaceAll('@ACCENT@',accent);
 return '<svg class="v61-crest" viewBox="0 0 72 84" role="img" aria-label="Vereinslogo '+name+'" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"><title>Vereinslogo '+name+'</title>'+paths+stripes+motif+'</svg>';
}
function v61FlagSVG(countryId){
 return v79FlagSVG(countryId);
}
function v61RosterHTML(roster){const order={gk:0,def:1,mid:2,att:3};return`<div class="v61-roster">${[...roster].sort((a,b)=>(order[a.line]??4)-(order[b.line]??4)||a.name.localeCompare(b.name,'de')).map(player=>`<button type="button" class="v61-player" data-v61-player="${escapeHTML(player.pid)}" aria-label="Profil von ${escapeHTML(player.name)} öffnen"><span class="v61-shirt">${player.n}</span><span class="v61-player-name">${v61FlagSVG(player.nation)}<strong>${escapeHTML(player.name)}</strong><small>${v61PositionNames[player.line]} · ${player.age} Jahre</small></span></button>`).join('')}</div>`}
function v61SeasonRosterHTML(career,roster){
 const season=career.world.season,order={gk:0,def:1,mid:2,att:3};
 const columns=[['number','#'],['name','Spieler'],['position','Position'],['age','Alter'],['games','Sp.'],['goals','T'],['assists','V'],['rating','Ø-Note']];
 return`<div class="v61-roster-table-wrap"><table class="v61-roster-table"><thead><tr>${columns.map(([key,label])=>`<th scope="col" data-v61-roster-column="${key}" ${key==='position'?'aria-sort="ascending"':''}><button type="button" data-v61-roster-sort="${key}" aria-label="Kader nach ${label} sortieren">${label}<span aria-hidden="true">${key==='position'?' ▲':''}</span></button></th>`).join('')}</tr></thead><tbody>${[...roster].sort((a,b)=>(order[a.line]??4)-(order[b.line]??4)||a.name.localeCompare(b.name,'de')).map(player=>{const records=(player.history||[]).filter(item=>item.season===season),games=records.length,goals=records.reduce((sum,item)=>sum+(item.goals||0),0),assists=records.reduce((sum,item)=>sum+(item.assists||0),0),rated=records.filter(item=>Number.isFinite(item.rating)),rating=rated.length?rated.reduce((sum,item)=>sum+item.rating,0)/rated.length:0;return`<tr data-v61-roster-row data-number="${player.n}" data-name="${escapeHTML(player.name)}" data-position="${order[player.line]??4}" data-age="${player.age}" data-games="${games}" data-goals="${goals}" data-assists="${assists}" data-rating="${rating}"><td><span class="v61-shirt">${player.n}</span></td><th scope="row"><button type="button" class="player-link" data-v61-player="${escapeHTML(player.pid)}">${v61FlagSVG(player.nation)}${escapeHTML(player.name)}</button></th><td>${v61PositionNames[player.line]}</td><td>${player.age}</td><td>${games}</td><td>${goals}</td><td>${assists}</td><td>${rated.length?rating.toFixed(1).replace('.',','):'–'}</td></tr>`}).join('')}</tbody></table></div>`;
}

const v61Panel=document.createElement('section');
v61Panel.className='panel v61-start-panel';
v61Panel.innerHTML='<div class="v61-start-copy"><h2>Deine neue Fußballwelt</h2><p>Sechs Länder. 36 spielbare Ligavereine. Wähle Land und Verein und sieh dir den Kader vor der Entscheidung an. Bis zu fünf Vereinswelten können gespeichert werden.</p><button type="button" class="primary" id="v61-begin">Neues Spiel starten <span>↗</span></button></div><div id="v61-saves"></div><p id="v61-message" role="status" class="help"></p>';
(startScreen.querySelector('.v46-extras')||startScreen.querySelector('.menu-layout')).insertAdjacentElement('beforebegin',v61Panel);
const v61Legacy=startScreen.querySelector('.menu-layout section:first-child');
v61Legacy.querySelector('h2').textContent='Bisherige Sechserliga';
v61Legacy.querySelector('.help').textContent='Der bisherige Spielmodus bleibt während des Ausbaus der neuen Welt spielbar.';
v61Legacy.querySelector('#new-game').innerHTML='Bisherige Liga starten <span>↗</span>';

const v61WorldScreen=document.createElement('main');
v61WorldScreen.id='v61-world-screen';
v61WorldScreen.hidden=true;
startScreen.before(v61WorldScreen);
const v61ProfileDialog=document.createElement('dialog');
v61ProfileDialog.className='player-card-dialog v61-profile-dialog';
document.body.append(v61ProfileDialog);
let v61Flow={step:'manager',managerName:'',countryId:null,clubId:null,seed:null,starting:false},v61CurrentCareer=null,v61ProfileReturn=null,v61CareerTab='overview',v61PendingDeleteId=null;

function v61FlowRoster(club,seed){
 const roster=v61GenerateRoster(club,seed,typeof v153Options==='function'?v153Options(v153PreviewOptions(),seed):null);
 if(typeof v158StartingForm==='function')for(const player of roster){player.fresh=100;player.form=v158StartingForm(seed,1,player.pid);player.formRatings=[];}
 return roster;
}
function v61ShowScreen(){startScreen.hidden=true;v61WorldScreen.hidden=false;v58Refresh();window.scrollTo(0,0)}
function v61ShowStart(){v61WorldScreen.hidden=true;startScreen.hidden=false;v61CurrentCareer=null;v61RenderSaves();v58Refresh();window.scrollTo(0,0)}
function v61Begin(){if(v61ReadCareers().length>=v61MaxCareers)return;v61Flow={step:'manager',managerName:'',countryId:null,clubId:null,seed:crypto.randomUUID(),starting:false};v61CurrentCareer=null;v61RenderFlow();v61ShowScreen()}
function v61RenderFlow(){
 const{step,countryId,clubId,seed,managerName}=v61Flow;
 const stepLabel=(key,label)=>`<span class="${step===key?'current':''}" ${step===key?'aria-current="step"':''}>${label}</span>`;
 const header=`<nav class="v61-steps" aria-label="Spielstart">${stepLabel('manager','Manager')}${stepLabel('country','Land')}${stepLabel('clubs','Verein')}${stepLabel('club','Kader')}${stepLabel('summary','Zusammenfassung')}</nav>`;
 if(step==='manager')v61WorldScreen.innerHTML=`${header}<div class="v61-flow-head"><button class="menu-action" data-v61-back="start">Zur Startseite</button><h1>Lokale Karriere starten</h1><p>Diese Karriere wird auf diesem Gerät im Browser gespeichert. Zum Öffnen der Webseite brauchst du Internet; die geöffnete Karriere kannst du ohne Konto spielen. Sichere deinen Spielstand regelmäßig per Exportdatei.</p></div><div class="v61-manager-step"><label for="v61-manager-name">Managername</label><input id="v61-manager-name" type="text" maxlength="32" autocomplete="off" value="${escapeHTML(managerName)}" aria-describedby="v61-manager-help"><p id="v61-manager-help">2 bis 32 Zeichen. Dieser Name gehört nur zu dieser Karriere.</p><fieldset><legend>Regeln dieser Vereinswelt</legend><label for="v160-field-size">Spielfeld</label><select id="v160-field-size"><option value="large" ${v61Flow.matchConfig?.fieldSize!=='standard'?'selected':''}>Größer (+20 % Länge und Breite)</option><option value="standard" ${v61Flow.matchConfig?.fieldSize==='standard'?'selected':''}>Bisherige Größe</option></select><label for="v160-field-players">Feldspieler pro Mannschaft</label><select id="v160-field-players"><option value="5" ${v61Flow.matchConfig?.fieldPlayers!==6?'selected':''}>5 plus Torwart</option><option value="6" ${v61Flow.matchConfig?.fieldPlayers===6?'selected':''}>6 plus Torwart</option></select><p>Diese Auswahl gilt dauerhaft für alle Vereine und Wettbewerbe dieser Karriere. Tore und Strafräume behalten ihre Größe.</p></fieldset><p class="v61-error" role="alert" data-v61-name-error hidden></p><button type="button" class="primary" data-v61-manager-next>Weiter zur Länderauswahl <span>↗</span></button></div>`;
 if(step==='country')v61WorldScreen.innerHTML=`${header}<div class="v61-flow-head"><button class="menu-action" data-v61-back="manager">Managername ändern</button><h1>Wähle dein Land</h1><p>Jedes Land hat sechs Ligavereine und zwei Pokalvereine.</p></div><div class="v61-country-grid">${v61Countries.map(([id,name])=>`<button type="button" class="v61-country-choice" data-v61-country="${id}">${v61FlagSVG(id)}<strong>${name}</strong><span>6 Vereine ansehen <b>↗</b></span></button>`).join('')}</div>`;
 if(step==='clubs')v61WorldScreen.innerHTML=`${header}<div class="v61-flow-head"><button class="menu-action" data-v61-back="country">Alle Länder</button><h1>${v61FlagSVG(countryId)} ${v61CountryNames[countryId]}</h1><p>Tippe auf einen Verein, um Geschichte und Kader anzusehen.</p></div><div class="v61-club-grid">${v61Catalog.filter(club=>club.id.startsWith(`${countryId}-`)&&!club.id.includes('-C')).map(club=>`<button type="button" class="v61-club-choice" data-v61-club="${club.id}">${v61CrestSVG(club)}<span><strong>${escapeHTML(club.name)}</strong><small>${escapeHTML(club.city)}</small><em>${escapeHTML(club.history)}</em></span><b aria-hidden="true">↗</b></button>`).join('')}</div>`;
 if(step==='club'){
  const club=v61Catalog.find(entry=>entry.id===clubId),roster=v61FlowRoster(club,seed);
  v61WorldScreen.innerHTML=`${header}<div class="v61-flow-head"><button class="menu-action" data-v61-back="clubs">Vereine in ${v61CountryNames[countryId]}</button></div><section class="v61-club-hero">${v61CrestSVG(club)}<div><p>${v61FlagSVG(countryId)} ${escapeHTML(v61CountryNames[countryId])} · ${escapeHTML(club.city)}</p><h1>${escapeHTML(club.name)}</h1><p>${escapeHTML(club.history)}</p><small>Vereinsfarben: ${escapeHTML(v61ClubColorLabel(club))}</small></div></section><section class="v61-roster-section"><div class="v61-roster-head"><div><h2>Startkader</h2><p>Elf Profis · Spieler öffnen für das vollständige Profil.</p></div><button type="button" class="primary" data-v61-review>Zur Zusammenfassung <span>↗</span></button></div>${v61RosterHTML(roster)}</section>`;
 }
 if(step==='summary'){
  const club=v61Catalog.find(entry=>entry.id===clubId),roster=v61FlowRoster(club,seed);
  v61WorldScreen.innerHTML=`${header}<div class="v61-flow-head"><button class="menu-action" data-v61-back="club">Zurück zum Kader</button><h1>Deine Karriere prüfen</h1><p>Prüfe deine Auswahl. Erst nach erfolgreicher Speicherung beginnt die Karriere.</p></div><section class="v61-summary"><h2>Zusammenfassung</h2><dl><div><dt>Speicherart</dt><dd>Auf diesem Gerät</dd></div><div><dt>Managername</dt><dd>${escapeHTML(managerName)}</dd></div><div><dt>Startverein</dt><dd>${v61CrestSVG(club)} ${escapeHTML(club.name)} · ${escapeHTML(v61CountryNames[countryId])}</dd></div><div><dt>Startkader</dt><dd>Elf fest erzeugte Profis</dd></div><div><dt>Regeln</dt><dd>${v61Flow.matchConfig?.fieldSize==='standard'?'Bisherige Feldgröße':'Größeres Feld'} · ${v61Flow.matchConfig?.fieldPlayers||5} Feldspieler plus Torwart</dd></div><div><dt>Öffentliche Teilnahme</dt><dd>Ausgeschaltet</dd></div></dl><p>Der Spielstand bleibt in diesem Browser. Eine Exportdatei ist deine unabhängige Sicherung.</p><button type="button" class="primary" data-v61-create="${club.id}">Karriere starten <span>↗</span></button></section><section class="v61-roster-section"><h2>Dein Startkader</h2>${v61RosterHTML(roster)}</section>`;
 }
}

function v61RenderSaves(){
 const container=v61Panel.querySelector('#v61-saves'),message=v61Panel.querySelector('#v61-message');
 try{
  const careers=v61ReadCareers();
  container.innerHTML=careers.length?`<h3>Deine Vereinswelten · ${careers.length}/${v61MaxCareers}</h3>${careers.map(career=>{const club=career.world.clubs.find(item=>item.id===career.manager.managedClubId),pending=career.id===v61PendingDeleteId;return`<article class="v61-saved"><span class="v61-save-info">${v61CrestSVG(club)}<span><strong>${escapeHTML(club.name)}</strong><small>${v61FlagSVG(club.countryId)} ${escapeHTML(v61CountryNames[club.countryId])} · Saison ${career.world.season}</small>${career.manager.name?`<small>Manager: ${escapeHTML(career.manager.name)}</small>`:''}</span></span><div class="v61-save-actions"><button type="button" class="menu-action" data-v61-open="${escapeHTML(career.id)}">Öffnen</button><button type="button" class="menu-action" data-v61-export="${escapeHTML(career.id)}">Exportieren</button>${pending?`<button type="button" class="menu-action danger" data-v61-confirm-delete="${escapeHTML(career.id)}">Endgültig löschen</button><button type="button" class="menu-action" data-v61-cancel-delete="${escapeHTML(career.id)}">Abbrechen</button>`:`<button type="button" class="menu-action danger" data-v61-delete="${escapeHTML(career.id)}">Löschen</button>`}</div>${pending?`<p class="v61-delete-prompt" role="status">„${escapeHTML(club.name)}“ und alle Fortschritte dieser Vereinswelt endgültig löschen?</p>`:''}</article>`}).join('')}${careers.length>=v61MaxCareers?'<p class="v61-limit-note">Für eine neue Vereinswelt zuerst einen Spielstand exportieren oder löschen.</p>':''}`:'';
  message.textContent='';delete message.dataset.status;v61Panel.querySelector('#v61-begin').disabled=careers.length>=v61MaxCareers;
 }catch(error){
  container.innerHTML=v61StorageError?'Gespeicherte Vereinswelten konnten nicht gelesen werden.':'<div class="v67-loading" role="status"><span>Vereinswelten werden geladen …</span><span class="v67-loading-track" role="progressbar" aria-label="Vereinswelten laden"><span></span></span></div>';
  if(v61StorageLoadError&&v61StorageBackup?.length)container.insertAdjacentHTML('beforeend','<p>Eine letzte gültige Wiederherstellungskopie ist verfügbar. Neuere Fortschritte können darin fehlen.</p><button type="button" class="menu-action" data-v61-restore>Wiederherstellung prüfen</button>');
  message.textContent=v61StorageError?error.message:'';v61Panel.querySelector('#v61-begin').disabled=true;
 }
}

const v61CareerTabs=[...v46Tabs.slice(0,4),['calendar',v46Icon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h3m3 0h3m-9 4h3"/>'),'Kalender'],...v46Tabs.slice(4)];
function v61RenderCareer(career){
 const club=career.world.clubs.find(item=>item.id===career.manager.managedClubId),views=v62CareerViewsHTML(career),honours=career.world.competitions.filter(item=>item.winnerId===club.id).map(item=>`<li>Saison ${item.season} · ${item.type==='league'?'Meister':item.type==='cup'?'Pokalsieger':'Europacupsieger'}</li>`).join('');
 views.overview+=v63NewsHTML(career);
 const hero=`<section class="v61-club-hero">${v61CrestSVG(club)}<div><p>${v61FlagSVG(club.countryId)} ${escapeHTML(v61CountryNames[club.countryId])} · ${escapeHTML(club.city)}</p><h2>${escapeHTML(club.name)}</h2><p>${escapeHTML(club.historyText)}</p><small>Vereinsfarben: ${escapeHTML(v61ClubColorLabel(club))}</small></div></section>${v63LeagueCoachesHTML(career)}`;
 v61WorldScreen.innerHTML=`<div class="v61-career-head">${v61CrestSVG(club)}<div><p class="eyebrow">Saison ${career.world.season} · ${escapeHTML(v61CountryNames[club.countryId])}</p><h1>${escapeHTML(club.name)}</h1></div></div><nav class="v46-nav v61-career-nav" aria-label="Karrieremenü">${v61CareerTabs.map(([key,icon,label])=>`<button type="button" data-v61-tab="${key}" ${key==='transfers'?'disabled aria-label="Transfers, noch nicht verfügbar"':''}><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}</nav><div data-v46-view="overview">${views.overview}</div><div data-v46-view="squad"><h2 class="v46-view-heading">Kader</h2><section class="v61-roster-section"><div class="v61-roster-head"><div><h3>Aktueller Kader</h3><p>Elf fest gespeicherte Profis · Spieler öffnen für das Profil.</p></div></div>${v61SeasonRosterHTML(career,club.roster)}</section></div><div data-v46-view="competition">${views.competition}</div><div data-v46-view="calendar">${views.calendar}</div><div data-v46-view="statistics">${views.statistics}</div><div data-v46-view="club"><h2 class="v46-view-heading">Verein</h2>${hero}<section class="v62-season"><h3>Erfolge dieser Karriere</h3>${honours?`<ul class="v61-honours">${honours}</ul>`:'<p>Noch kein Titel gewonnen.</p>'}</section></div>`;
 v61SetCareerTab(v61CareerTab,false);
 v61ShowScreen();
}
function v61SetCareerTab(tab,scroll=true){
 if(tab==='transfers'||!v61CareerTabs.some(([key])=>key===tab))return;
 v61CareerTab=tab;
 for(const view of v61WorldScreen.querySelectorAll(':scope > [data-v46-view], :scope > .fl-shell > .fl-workspace > .fl-content > [data-v46-view]'))view.hidden=view.dataset.v46View!==tab;
 for(const button of v61WorldScreen.querySelectorAll('.v61-career-nav button')){if(button.dataset.v61Tab===tab)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')}
 if(scroll)window.scrollTo(0,0);
}
function v61AdvanceCareer(){
 if(!v61CurrentCareer)return;
 try{
  if(v61CurrentCareer.world.seasonFinished)v62NextSeason(v61CurrentCareer);else v62AdvanceToManaged(v61CurrentCareer);
  v61SaveCareers(v61ReadCareers().map(career=>career.id===v61CurrentCareer.id?v61CurrentCareer:career));
  v61RenderCareer(v61CurrentCareer);
 }catch(error){v61WorldScreen.querySelector('.v61-career-nav')?.insertAdjacentHTML('afterend',`<p class="v61-error" role="alert">Weltkalender konnte nicht fortgesetzt werden: ${escapeHTML(error.message)}</p>`)}
}
function v61OpenCareer(id){
 try{const career=v61ReadCareers().find(item=>item.id===id);if(!career)return;v61CurrentCareer=career;v61CareerTab='overview';v61RenderCareer(career)}catch(error){v61Panel.querySelector('#v61-message').textContent=error.message}
}
function v61OpenProfile(pid,button){
 const roster=v61CurrentCareer?v61CurrentCareer.world.clubs.find(club=>club.id===v61CurrentCareer.manager.managedClubId)?.roster:v61FlowRoster(v61Catalog.find(club=>club.id===v61Flow.clubId),v61Flow.seed),player=roster?.find(item=>item.pid===pid);
 if(!player)return;
 v61ProfileReturn=button;
 v61ProfileDialog.innerHTML=`<div class="player-card-head"><div>${v61FlagSVG(player.nation)}<p class="eyebrow">${escapeHTML(v61CountryNames[player.nation])}</p><h2>${escapeHTML(player.name)}</h2><span>${v61PositionNames[player.line]} · ${player.age} Jahre · ${escapeHTML(player.foot)}fuß</span></div><button type="button" data-v61-close aria-label="Spielerprofil schließen">×</button></div><div class="player-card-facts"><span>Rückennummer<b>${player.n}</b></span><span>Form<b>${formText(player.form)}</b></span><span>Fitness<b>${freshText(player.fresh)}</b></span><span>Spielertyp<b>${v61PositionNames[player.line]}</b></span></div><section><h3>Fähigkeiten</h3>${v55SkillGroupsHTML(player)}</section><section><p>Spielerstatistiken folgen mit den Live-Matches.</p></section>`;
 v61ProfileDialog.querySelector('[data-v61-close]').onclick=()=>v61ProfileDialog.close();
 v61ProfileDialog.showModal();
}
v61ProfileDialog.addEventListener('close',()=>v61ProfileReturn?.focus());
v61ProfileDialog.addEventListener('click',event=>{if(event.target===v61ProfileDialog)v61ProfileDialog.close()});

v61Panel.querySelector('#v61-begin').onclick=v61Begin;
v61Panel.querySelector('#v61-saves').onclick=async event=>{
 const button=event.target.closest('button');if(!button)return;
 const message=v61Panel.querySelector('#v61-message');
 if(button.hasAttribute('data-v61-restore')){button.textContent='Wiederherstellung bestätigen';button.removeAttribute('data-v61-restore');button.setAttribute('data-v61-confirm-restore','');button.insertAdjacentHTML('afterend','<button type="button" class="menu-action" data-v61-cancel-restore>Abbrechen</button>');return}
 if(button.hasAttribute('data-v61-cancel-restore')){v61RenderSaves();return}
 if(button.dataset.v61Open){v61OpenCareer(button.dataset.v61Open);return}
 if(button.dataset.v61Delete){v61PendingDeleteId=button.dataset.v61Delete;v61RenderSaves();return}
 if(button.dataset.v61CancelDelete){v61PendingDeleteId=null;v61RenderSaves();return}
 button.disabled=true;
 try{
  if(button.hasAttribute('data-v61-confirm-restore')){await v61RestoreStorage();message.dataset.status='success';message.textContent='Wiederherstellung abgeschlossen.'}
  if(button.dataset.v61ConfirmDelete){await v61DeleteCareer(button.dataset.v61ConfirmDelete);v61PendingDeleteId=null;v61RenderSaves();message.dataset.status='success';message.textContent='Vereinswelt gelöscht.'}
  if(button.dataset.v61Export){const data=await v61ExportCareerData(button.dataset.v61Export),club=data.save.world.clubs.find(item=>item.id===data.save.manager.managedClubId),blob=new Blob([JSON.stringify(data)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`doppel-6-welt-${club.id.toLowerCase()}-${data.save.id.slice(0,8)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);message.dataset.status='success';message.textContent='Export der Vereinswelt gestartet.'}
 }catch(error){delete message.dataset.status;message.textContent=error.message}finally{button.disabled=false}
};
v61WorldScreen.onclick=event=>{
 const button=event.target.closest('button');if(!button)return;
 if(v61Flow.starting)return;
 if(button.dataset.v61RosterSort){const table=button.closest('table'),key=button.dataset.v61RosterSort,head=button.closest('th'),descending=head.getAttribute('aria-sort')==='ascending',body=table.tBodies[0];for(const cell of table.tHead.querySelectorAll('th')){cell.removeAttribute('aria-sort');cell.querySelector('span').textContent=''}head.setAttribute('aria-sort',descending?'descending':'ascending');button.querySelector('span').textContent=descending?' ▼':' ▲';const rows=[...body.rows],numeric=!['name'].includes(key);rows.sort((a,b)=>{const left=a.dataset[key],right=b.dataset[key],difference=numeric?Number(left)-Number(right):left.localeCompare(right,'de');return(descending?-1:1)*(difference||a.dataset.name.localeCompare(b.dataset.name,'de'))});body.append(...rows);return}
 if(button.dataset.v61Tab){v61SetCareerTab(button.dataset.v61Tab);return}
 if(button.dataset.v61Back){if(button.dataset.v61Back==='start')v61ShowStart();else{v61Flow.step=button.dataset.v61Back;v61RenderFlow();window.scrollTo(0,0)}return}
 if(button.hasAttribute('data-v61-manager-next')){const input=v61WorldScreen.querySelector('#v61-manager-name'),name=v61ManagerName(input.value);if(!v61ValidManagerName(name)){const error=v61WorldScreen.querySelector('[data-v61-name-error]');error.hidden=false;error.textContent='Der Managername muss 2 bis 32 Zeichen enthalten.';input.focus();return}v61Flow.managerName=name;v61Flow.matchConfig=v160MatchConfig({fieldSize:v61WorldScreen.querySelector('#v160-field-size').value,fieldPlayers:Number(v61WorldScreen.querySelector('#v160-field-players').value)});v61Flow.step='country';v61RenderFlow();window.scrollTo(0,0);return}
 if(button.dataset.v61Country){v61Flow.countryId=button.dataset.v61Country;v61Flow.step='clubs';v61RenderFlow();window.scrollTo(0,0);return}
 if(button.dataset.v61Club){v61Flow.clubId=button.dataset.v61Club;v61Flow.step='club';v61RenderFlow();window.scrollTo(0,0);return}
 if(button.dataset.v61Player){v61OpenProfile(button.dataset.v61Player,button);return}
 if(button.hasAttribute('data-v61-review')){v61Flow.step='summary';v61RenderFlow();window.scrollTo(0,0);return}
 if(button.dataset.v61Create){
  const clubId=button.dataset.v61Create;v61Flow.starting=true;button.disabled=true;
  button.insertAdjacentHTML('afterend','<div class="v67-loading" role="status"><span>Vereinswelt wird gespeichert …</span><span class="v67-loading-track" role="progressbar" aria-label="Vereinswelt speichern"><span></span></span></div>');
  requestAnimationFrame(()=>setTimeout(async()=>{try{const career=await v61StoreNewCareer(v61CreateCareer(clubId,v61Flow.seed,v61Flow.managerName,undefined,v61Flow.matchConfig));v61Flow.starting=false;v61CurrentCareer=career;v61CareerTab='overview';v61RenderCareer(career)}catch(error){v61Flow.starting=false;button.disabled=false;button.nextElementSibling?.remove();v61WorldScreen.querySelector('[data-v61-start-error]')?.remove();button.insertAdjacentHTML('afterend',`<p class="v61-error" role="alert" data-v61-start-error>Vereinswelt konnte nicht gespeichert werden: ${escapeHTML(error.message)}</p>`)}}));
 }
};
v61RenderSaves();
v61InitStorage();
const v61BaseProgressState=v58State;
function v61NextFixtureContext(career,fixture){
 const competition=v62Current(career).find(item=>item.id===fixture.competitionId);
 const label=competition?.type==='league'?`${v61CountryNames[competition.country]} · Liga 1`:competition?.type==='cup'?`${v61CountryNames[competition.country]} · Nationaler Pokal`:'Europacup';
 return`${v62Date(fixture.day)} · ${label} · ${v62Name(career,fixture.homeId)} gegen ${v62Name(career,fixture.awayId)}`;
}
v58State=function(){
 if(v61WorldScreen.hidden)return v61BaseProgressState();
 if(!v61CurrentCareer)return null;
 const career=v61CurrentCareer,managed=career.manager.managedClubId,next=v62Fixtures(career).filter(fixture=>!fixture.result&&(fixture.homeId===managed||fixture.awayId===managed)).sort((a,b)=>a.day-b.day)[0];
 return{context:career.world.seasonFinished?`Saison ${career.world.season} abgeschlossen`:next?v61NextFixtureContext(career,next):`Saison ${career.world.season} · letztes Spiel beendet`,label:career.world.seasonFinished?'Nächste Saison vorbereiten':next?'Nächstes Spiel simulieren':'Saisonende',action:'v61-world'};
};
const v61BaseProgressClick=v58Button.onclick;
v58Button.onclick=function(){if(v58State()?.action==='v61-world'){v61AdvanceCareer();return}v61BaseProgressClick()};
