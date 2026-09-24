'use strict';

// Die Trainerwelt nutzt ein eigenes Format; frühere Weltstände bleiben im Browser erhalten.
const v61WorldKey='sechser.world.v8';
const v61MaxCareers=5;
const v61Countries=[['ENG','England'],['ESP','Spanien'],['ITA','Italien'],['GER','Deutschland'],['FRA','Frankreich'],['POR','Portugal']];
const v61CountryNames=Object.fromEntries(v61Countries);
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

function v61GenerateRoster(entry,seed){
 const random=v61Random(`${seed}:${entry.id}`),home=entry.id.slice(0,3),quality=entry.profile[5]-(entry.id.includes('-C')?1:0),used=new Set();
 return v61Layout.map((line,index)=>{
  const nation=random()<.79?home:v61Countries[Math.floor(random()*v61Countries.length)][0],names=v61Names[nation];
  let name,attempt=0;
  do{name=`${names[0][Math.floor(random()*names[0].length)]} ${names[1][Math.floor(random()*names[1].length)]}`;attempt++}while(used.has(name)&&attempt<30);
  used.add(name);
  const player={pid:`${seed}:${entry.id}:${index+1}`,n:index+1,name,nation,age:19+Math.floor(random()*16),line,assignedLine:line,keeper:line==='gk',type:v61PositionNames[line],foot:random()<.2?'Links':'Rechts',form:0,fresh:100,history:[],seasons:[]};
  for(const [key,base]of Object.entries(v61SkillBases[line]))player[key]=Math.max(1,Math.min(20,Math.round(base+(quality-3)*1.1+(random()-.5)*3)));
  return player;
 });
}

function v61ClubRecord(entry,seed){
 const countryId=entry.id.slice(0,3),cupOnly=entry.id.includes('-C');
 const[tradition,fans,youth,risk,patience,startingSquad]=entry.profile;
 return{id:entry.id,countryId,leagueId:cupOnly?null:`${countryId}-LEAGUE`,cupId:`${countryId}-CUP`,name:entry.name,city:entry.city,colors:entry.colors,historyText:entry.history,policy:{tradition,fans,youth,risk,patience,startingSquad},roster:v61GenerateRoster(entry,seed),youthPool:[],balance:null,ledger:[],coachId:null,history:[]};
}

function v61ValidateCareer(career){
 if(career?.schema!==13||career.modelVersion!==9||!career.manager?.id||!career.world?.seed)return false;
 const clubs=career.world.clubs;
 if(!Array.isArray(clubs)||clubs.length!==48||new Set(clubs.map(club=>club.id)).size!==48)return false;
 if(!Array.isArray(career.world.countries)||career.world.countries.length!==6)return false;
 if(!Array.isArray(career.world.competitions)||v62Current(career).length!==13||!Number.isInteger(career.world.calendarCursor))return false;
 const managed=clubs.find(club=>club.id===career.manager.managedClubId);
 if(!managed?.leagueId)return false;
 if(!v63Validate(career))return false;
 const players=clubs.flatMap(club=>club.roster||[]);
 const marketOpen=career.world.seasonFinished||career.world.market?.phase==='sponsor'||career.world.market?.phase==='open';
 if(clubs.some(club=>!Array.isArray(club.roster)||club.roster.length>14||!marketOpen&&(club.roster.length<10||club.roster.filter(player=>player.keeper).length<1))||new Set(players.map(player=>player.pid)).size!==players.length)return false;
 if(!v61Countries.every(([id])=>clubs.filter(club=>club.countryId===id&&club.leagueId).length===6&&clubs.filter(club=>club.countryId===id&&!club.leagueId).length===2))return false;
 return (typeof v66Validate!=='function'||v66Validate(career))&&(typeof v67Validate!=='function'||v67Validate(career));
}

function v61CreateCareer(clubId,seed=crypto.randomUUID()){
 if(!v61Catalog.some(club=>club.id===clubId&&!club.id.includes('-C')))throw Error('Nur ein Ligaverein kann übernommen werden.');
 const now=new Date().toISOString();
 const career={schema:13,modelVersion:9,id:crypto.randomUUID(),created:now,updated:now,phase:'world-matches',manager:{id:crypto.randomUUID(),managedClubId:clubId,stationHistory:[{clubId,fromSeason:1}]},world:{season:1,calendarCursor:null,seed,countries:v61Countries.map(([id,name])=>({id,name,leagueId:`${id}-LEAGUE`,cupId:`${id}-CUP`})),clubs:v61Catalog.map(entry=>v61ClubRecord(entry,seed)),coaches:[],contracts:[],competitions:[],market:{freePlayers:[],pendingBids:[]},eventLog:{processedEventIds:[],visibleNews:[]}}};
 v62PrepareSeason(career);
 v63Init(career);
 if(typeof v66Init==='function')v66Init(career);
 if(typeof v67Init==='function')v67Init(career);
 if(!v61ValidateCareer(career))throw Error('Die Vereinswelt ist unvollständig.');
 return career;
}

let v61StorageDb=null,v61StorageReady=typeof indexedDB==='undefined',v61StorageCache=[],v61StoragePending=null,v61StorageWriting=false,v61StorageError=null,v61LastWrite=Promise.resolve();
function v61ReadCareers(){
 if(!v61StorageReady)throw Error(v61StorageError||'Vereinswelten werden geladen.');
 const value=v61StorageDb?v61StorageCache:JSON.parse(localStorage.getItem(v61WorldKey)||'[]');
 if(!Array.isArray(value)||value.some(career=>!v61ValidateCareer(career)))throw Error('Die gespeicherten Vereinswelten sind ungültig.');
 return value;
}
function v61FlushStorage(){
 if(!v61StorageDb||v61StorageWriting||!v61StoragePending)return;
 const pending=v61StoragePending;v61StoragePending=null;v61StorageWriting=true;
 try{
  const transaction=v61StorageDb.transaction('careers','readwrite');transaction.objectStore('careers').put(pending.careers,'worlds');
  transaction.oncomplete=()=>{v61StorageWriting=false;pending.waiters.forEach(resolve=>resolve());v61FlushStorage()};
  transaction.onerror=()=>{v61StorageWriting=false;v61StorageError='Die Vereinswelt konnte nicht gespeichert werden.';pending.waiters.forEach((_,index)=>pending.failures[index](Error(v61StorageError)));console.error(transaction.error)};
 }catch(error){v61StorageWriting=false;v61StorageError='Die Vereinswelt konnte nicht gespeichert werden.';pending.failures.forEach(reject=>reject(error))}
}
function v61SaveCareers(careers){
 if(v61StorageError)throw Error(v61StorageError);
 if(!v61StorageReady)throw Error('Vereinswelten werden noch geladen.');
 if(v61StorageDb){
  v61StorageCache=careers;
  const write=new Promise((resolve,reject)=>{
   const previous=v61StoragePending;
   v61StoragePending={careers,waiters:[...(previous?.waiters||[]),resolve],failures:[...(previous?.failures||[]),reject]};
   v61FlushStorage();
  });
  v61LastWrite=write;write.catch(()=>{});return write;
 }
 localStorage.setItem(v61WorldKey,JSON.stringify(careers));v61LastWrite=Promise.resolve();return v61LastWrite;
}
async function v61StoreNewCareer(career,imported=false){
 await v61LastWrite;
 const careers=v61ReadCareers();
 if(careers.length>=v61MaxCareers)throw Error('Maximal fünf Vereinswelten. Exportiere oder lösche zuerst einen Spielstand.');
 const copy=imported?JSON.parse(JSON.stringify(career)):career;
 if(careers.some(item=>item.id===copy.id))copy.id=crypto.randomUUID();
 if(imported)copy.updated=new Date().toISOString();
 await v61SaveCareers([...careers,copy]);
 return copy;
}
function v61IsWorldExport(raw){
 const candidate=raw?.save||raw;
 return raw?.format==='world'||candidate?.schema===13||candidate?.modelVersion!==undefined;
}
async function v61ImportCareerData(raw){
 const candidate=raw?.save||raw;
 if(candidate?.schema!==13||candidate?.modelVersion!==9||raw?.format&&raw.format!=='world')throw Error('Diese Vereinswelt-Datei hat ein nicht unterstütztes Format.');
 let valid=false;
 try{valid=typeof candidate.id==='string'&&candidate.id.length>0&&v61ValidateCareer(candidate)}catch{}
 if(!valid)throw Error('Die Vereinswelt-Datei ist unvollständig oder beschädigt.');
 return v61StoreNewCareer(candidate,true);
}
async function v61ExportCareerData(id){
 await v61LastWrite;
 const career=v61ReadCareers().find(item=>item.id===id);
 if(!career)throw Error('Diese Vereinswelt wurde nicht gefunden.');
 return{game:'Doppel 6',format:'world',schema:13,modelVersion:9,exported:new Date().toISOString(),save:JSON.parse(JSON.stringify(career))};
}
async function v61DeleteCareer(id){
 await v61LastWrite;
 const careers=v61ReadCareers();
 if(!careers.some(item=>item.id===id))throw Error('Diese Vereinswelt wurde nicht gefunden.');
 await v61SaveCareers(careers.filter(item=>item.id!==id));
}
function v61InitStorage(){
 if(typeof indexedDB==='undefined')return;
 const request=indexedDB.open('doppel6-world-v8',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('careers');
 request.onerror=()=>{v61StorageError='Der lokale Spielstandspeicher konnte nicht geöffnet werden.';v61RenderSaves()};
 request.onsuccess=()=>{
  v61StorageDb=request.result;
  const read=v61StorageDb.transaction('careers','readonly').objectStore('careers').get('worlds');
  read.onerror=()=>{v61StorageError='Gespeicherte Vereinswelten konnten nicht gelesen werden.';v61RenderSaves()};
  read.onsuccess=()=>{v61StorageCache=read.result||[];v61StorageReady=true;v61RenderSaves()};
 };
}

const v61Colors={Anthrazit:'#283039',Bernstein:'#dc9a32',Bordeaux:'#732e49',Braun:'#76543b',Creme:'#f1e5cc',Dunkelblau:'#193653',Dunkelgrün:'#204938',Eisblau:'#9ccbd9',Elfenbein:'#f3edda',Flieder:'#a98bbb',Gold:'#d9ab45',Grau:'#8b979b',Grün:'#398b5b',Hellgrau:'#c7d0d0',Himmelblau:'#68b8d9',Indigo:'#3b477f',Jade:'#4ba68b',Karmin:'#a43e50',Kobaltblau:'#3267b0',Koralle:'#df7770',Kupfer:'#b8794a',Marineblau:'#24385b',Mint:'#85d0bd',Moosgrün:'#526948',Nachtblau:'#1c3045',Ocker:'#bd904a',Oliv:'#727b47',Orange:'#df8a3b',Petrol:'#2d777c',Pflaume:'#694766',Purpur:'#74468d',Rostrot:'#a85240',Safran:'#d6a238',Sand:'#d9c6a5',Schiefer:'#586b79',Schwarz:'#1d2329',Seegrün:'#318579',Silber:'#bec8cb',Smaragd:'#24775a',Tannengrün:'#275744',Terrakotta:'#ba674d',Türkis:'#3caaa8',Ultramarin:'#415caf',Violett:'#7750a0',Waldgrün:'#315b42',Weinrot:'#823b52',Weiß:'#f3f5f2',Ziegelrot:'#b94d43'};
function v61ClubColors(club){const[a,b]=club.colors.split('/');return[v61Colors[a]||'#c7f36b',v61Colors[b]||'#142629']}
function v61CrestSVG(club){
 const[main,trim]=v61ClubColors(club),variant=v61Catalog.findIndex(entry=>entry.id===club.id)%4,initials=club.name.split(/\s+/).filter(word=>!['FC','SC','SV','AC','AFC','CF'].includes(word)).slice(0,2).map(word=>word[0]).join('').toUpperCase();
 const mark=[`<path d="M14 45h44" stroke="${trim}" stroke-width="9"/>`,`<path d="M23 14v48M49 14v48" stroke="${trim}" stroke-width="7"/>`,`<path d="M16 58 56 18" stroke="${trim}" stroke-width="11"/>`,`<path d="M15 28h42M15 49h42" stroke="${trim}" stroke-width="7"/>`][variant];
 return`<svg class="v61-crest" viewBox="0 0 72 84" role="img" aria-label="Vereinslogo ${escapeHTML(club.name)}"><title>Vereinslogo ${escapeHTML(club.name)}</title><path d="M8 7h56v39c0 16-11 27-28 32C19 73 8 62 8 46Z" fill="${main}" stroke="${trim}" stroke-width="5"/><path d="M12 10h48v35c0 14-9 23-24 28-15-5-24-14-24-28Z" fill="none" stroke="#ffffff55" stroke-width="1.5"/>${mark}<rect x="16" y="31" width="40" height="25" rx="4" fill="#102126e8"/><text x="36" y="49" text-anchor="middle" fill="#fff" font-size="17" font-family="Barlow Condensed,Arial,sans-serif" font-weight="800">${escapeHTML(initials)}</text></svg>`;
}
function v61FlagSVG(countryId){
 if(countryId==='ENG')return'<svg class="flag-icon v61-country-flag" viewBox="0 0 24 16" role="img" aria-label="England"><title>England</title><path fill="#fff" d="M0 0h24v16H0z"/><path fill="#c8102e" d="M10 0h4v16h-4zM0 6h24v4H0z"/></svg>';
 return flagSVG({ESP:'ES',ITA:'IT',GER:'DE',FRA:'FR',POR:'PT'}[countryId]||countryId);
}
function v61RosterHTML(roster){return`<div class="v61-roster">${roster.map(player=>`<button type="button" class="v61-player" data-v61-player="${escapeHTML(player.pid)}"><span class="v61-shirt">${player.n}</span><span class="v61-player-name">${v61FlagSVG(player.nation)}<strong>${escapeHTML(player.name)}</strong><small>${v61PositionNames[player.line]} · ${player.age} Jahre</small></span><span class="v61-profile-action">Profil ansehen</span></button>`).join('')}</div>`}

const v61Panel=document.createElement('section');
v61Panel.className='panel v61-start-panel';
v61Panel.innerHTML='<div class="v61-start-copy"><h2>Deine neue Fußballwelt</h2><p>Sechs Länder. 36 spielbare Ligavereine. Wähle Land und Verein und sieh dir den Kader vor der Entscheidung an. Bis zu fünf Vereinswelten können gespeichert werden.</p><button type="button" class="primary" id="v61-begin">Neues Spiel starten <span>↗</span></button></div><div id="v61-saves"></div><p id="v61-message" role="status" class="help"></p>';
startScreen.querySelector('.menu-layout').insertAdjacentElement('beforebegin',v61Panel);
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
let v61Flow={step:'country',countryId:null,clubId:null,seed:null},v61CurrentCareer=null,v61ProfileReturn=null,v61CareerTab='overview',v61PendingDeleteId=null;

function v61ShowScreen(){startScreen.hidden=true;v61WorldScreen.hidden=false;v58Refresh();window.scrollTo(0,0)}
function v61ShowStart(){v61WorldScreen.hidden=true;startScreen.hidden=false;v61CurrentCareer=null;v61RenderSaves();v58Refresh();window.scrollTo(0,0)}
function v61Begin(){if(v61ReadCareers().length>=v61MaxCareers)return;v61Flow={step:'country',countryId:null,clubId:null,seed:crypto.randomUUID()};v61CurrentCareer=null;v61RenderFlow();v61ShowScreen()}
function v61RenderFlow(){
 const{step,countryId,clubId,seed}=v61Flow;
 const header=`<nav class="v61-steps" aria-label="Spielstart"><span class="${step==='country'?'current':''}">Land</span><span class="${step==='clubs'?'current':''}">Verein</span><span class="${step==='club'?'current':''}">Kader</span></nav>`;
 if(step==='country')v61WorldScreen.innerHTML=`${header}<div class="v61-flow-head"><button class="menu-action" data-v61-back="start">Zur Startseite</button><h1>Wähle dein Land</h1><p>Jedes Land hat sechs Ligavereine und zwei Pokalvereine.</p></div><div class="v61-country-grid">${v61Countries.map(([id,name])=>`<button type="button" class="v61-country-choice" data-v61-country="${id}">${v61FlagSVG(id)}<strong>${name}</strong><span>6 Vereine ansehen <b>↗</b></span></button>`).join('')}</div>`;
 if(step==='clubs')v61WorldScreen.innerHTML=`${header}<div class="v61-flow-head"><button class="menu-action" data-v61-back="country">Alle Länder</button><h1>${v61FlagSVG(countryId)} ${v61CountryNames[countryId]}</h1><p>Tippe auf einen Verein, um Geschichte und Kader anzusehen.</p></div><div class="v61-club-grid">${v61Catalog.filter(club=>club.id.startsWith(`${countryId}-`)&&!club.id.includes('-C')).map(club=>`<button type="button" class="v61-club-choice" data-v61-club="${club.id}">${v61CrestSVG(club)}<span><strong>${escapeHTML(club.name)}</strong><small>${escapeHTML(club.city)}</small><em>${escapeHTML(club.history)}</em></span><b aria-hidden="true">↗</b></button>`).join('')}</div>`;
 if(step==='club'){
  const club=v61Catalog.find(entry=>entry.id===clubId),roster=v61GenerateRoster(club,seed);
  v61WorldScreen.innerHTML=`${header}<div class="v61-flow-head"><button class="menu-action" data-v61-back="clubs">Vereine in ${v61CountryNames[countryId]}</button></div><section class="v61-club-hero">${v61CrestSVG(club)}<div><p>${v61FlagSVG(countryId)} ${escapeHTML(v61CountryNames[countryId])} · ${escapeHTML(club.city)}</p><h1>${escapeHTML(club.name)}</h1><p>${escapeHTML(club.history)}</p><small>Vereinsfarben: ${escapeHTML(club.colors)}</small></div></section><section class="v61-roster-section"><div class="v61-roster-head"><div><h2>Startkader</h2><p>Elf Profis · Spieler öffnen für das vollständige Profil.</p></div><button type="button" class="primary" data-v61-create="${club.id}">Verein übernehmen <span>↗</span></button></div>${v61RosterHTML(roster)}</section>`;
 }
}

function v61RenderSaves(){
 const container=v61Panel.querySelector('#v61-saves'),message=v61Panel.querySelector('#v61-message');
 try{
  const careers=v61ReadCareers();
  container.innerHTML=careers.length?`<h3>Deine Vereinswelten · ${careers.length}/${v61MaxCareers}</h3>${careers.map(career=>{const club=career.world.clubs.find(item=>item.id===career.manager.managedClubId),pending=career.id===v61PendingDeleteId;return`<article class="v61-saved"><span class="v61-save-info">${v61CrestSVG(club)}<span><strong>${escapeHTML(club.name)}</strong><small>${v61FlagSVG(club.countryId)} ${escapeHTML(v61CountryNames[club.countryId])} · Saison ${career.world.season}</small></span></span><div class="v61-save-actions"><button type="button" class="menu-action" data-v61-open="${escapeHTML(career.id)}">Öffnen</button><button type="button" class="menu-action" data-v61-export="${escapeHTML(career.id)}">Exportieren</button>${pending?`<button type="button" class="menu-action danger" data-v61-confirm-delete="${escapeHTML(career.id)}">Endgültig löschen</button><button type="button" class="menu-action" data-v61-cancel-delete="${escapeHTML(career.id)}">Abbrechen</button>`:`<button type="button" class="menu-action danger" data-v61-delete="${escapeHTML(career.id)}">Löschen</button>`}</div>${pending?`<p class="v61-delete-prompt" role="status">„${escapeHTML(club.name)}“ und alle Fortschritte dieser Vereinswelt endgültig löschen?</p>`:''}</article>`}).join('')}${careers.length>=v61MaxCareers?'<p class="v61-limit-note">Für eine neue Vereinswelt zuerst einen Spielstand exportieren oder löschen.</p>':''}`:'';
  message.textContent='';delete message.dataset.status;v61Panel.querySelector('#v61-begin').disabled=careers.length>=v61MaxCareers;
 }catch(error){
  container.innerHTML=v61StorageError?'Gespeicherte Vereinswelten konnten nicht gelesen werden.':'<div class="v67-loading" role="status"><span>Vereinswelten werden geladen …</span><span class="v67-loading-track" role="progressbar" aria-label="Vereinswelten laden"><span></span></span></div>';
  message.textContent=v61StorageError?error.message:'';v61Panel.querySelector('#v61-begin').disabled=true;
 }
}

function v61RenderCareer(career){
 const club=career.world.clubs.find(item=>item.id===career.manager.managedClubId),views=v62CareerViewsHTML(career),honours=career.world.competitions.filter(item=>item.winnerId===club.id).map(item=>`<li>Saison ${item.season} · ${item.type==='league'?'Meister':item.type==='cup'?'Pokalsieger':'Europacupsieger'}</li>`).join('');
 views.overview+=v63NewsHTML(career);
 const hero=`<section class="v61-club-hero">${v61CrestSVG(club)}<div><p>${v61FlagSVG(club.countryId)} ${escapeHTML(v61CountryNames[club.countryId])} · ${escapeHTML(club.city)}</p><h2>${escapeHTML(club.name)}</h2><p>${escapeHTML(club.historyText)}</p><small>Vereinsfarben: ${escapeHTML(club.colors)}</small></div></section>${v63LeagueCoachesHTML(career)}`;
 v61WorldScreen.innerHTML=`<div class="v61-career-head">${v61CrestSVG(club)}<div><p class="eyebrow">Saison ${career.world.season} · ${escapeHTML(v61CountryNames[club.countryId])}</p><h1>${escapeHTML(club.name)}</h1></div><button type="button" class="menu-action" data-v61-back="start">Zur Startseite</button></div><nav class="v46-nav v61-career-nav" aria-label="Karrieremenü">${v46Tabs.map(([key,icon,label])=>`<button type="button" data-v61-tab="${key}" ${key==='transfers'?'disabled aria-label="Transfers, noch nicht verfügbar"':''}><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}</nav><div data-v46-view="overview">${views.overview}</div><div data-v46-view="squad"><h2 class="v46-view-heading">Kader</h2><section class="v61-roster-section"><div class="v61-roster-head"><div><h3>Aktueller Kader</h3><p>Elf fest gespeicherte Profis · Spieler öffnen für das Profil.</p></div></div>${v61RosterHTML(club.roster)}</section></div><div data-v46-view="competition">${views.competition}</div><div data-v46-view="statistics">${views.statistics}</div><div data-v46-view="club"><h2 class="v46-view-heading">Verein</h2>${hero}<section class="v62-season"><h3>Erfolge dieser Karriere</h3>${honours?`<ul class="v61-honours">${honours}</ul>`:'<p>Noch kein Titel gewonnen.</p>'}</section></div>`;
 v61SetCareerTab(v61CareerTab,false);
 v61ShowScreen();
}
function v61SetCareerTab(tab,scroll=true){
 if(tab==='transfers'||!v46Tabs.some(([key])=>key===tab))return;
 v61CareerTab=tab;
 for(const view of v61WorldScreen.querySelectorAll(':scope > [data-v46-view]'))view.hidden=view.dataset.v46View!==tab;
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
 const roster=v61CurrentCareer?v61CurrentCareer.world.clubs.find(club=>club.id===v61CurrentCareer.manager.managedClubId)?.roster:v61GenerateRoster(v61Catalog.find(club=>club.id===v61Flow.clubId),v61Flow.seed),player=roster?.find(item=>item.pid===pid);
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
 if(button.dataset.v61Open){v61OpenCareer(button.dataset.v61Open);return}
 if(button.dataset.v61Delete){v61PendingDeleteId=button.dataset.v61Delete;v61RenderSaves();return}
 if(button.dataset.v61CancelDelete){v61PendingDeleteId=null;v61RenderSaves();return}
 button.disabled=true;
 try{
  if(button.dataset.v61ConfirmDelete){await v61DeleteCareer(button.dataset.v61ConfirmDelete);v61PendingDeleteId=null;v61RenderSaves();message.dataset.status='success';message.textContent='Vereinswelt gelöscht.'}
  if(button.dataset.v61Export){const data=await v61ExportCareerData(button.dataset.v61Export),club=data.save.world.clubs.find(item=>item.id===data.save.manager.managedClubId),blob=new Blob([JSON.stringify(data)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`doppel-6-welt-${club.id.toLowerCase()}-${data.save.id.slice(0,8)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);message.dataset.status='success';message.textContent='Export der Vereinswelt gestartet.'}
 }catch(error){delete message.dataset.status;message.textContent=error.message}finally{button.disabled=false}
};
v61WorldScreen.onclick=event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.v61Tab){v61SetCareerTab(button.dataset.v61Tab);return}
 if(button.dataset.v61Back){if(button.dataset.v61Back==='start')v61ShowStart();else{v61Flow.step=button.dataset.v61Back;v61RenderFlow();window.scrollTo(0,0)}return}
 if(button.dataset.v61Country){v61Flow.countryId=button.dataset.v61Country;v61Flow.step='clubs';v61RenderFlow();window.scrollTo(0,0);return}
 if(button.dataset.v61Club){v61Flow.clubId=button.dataset.v61Club;v61Flow.step='club';v61RenderFlow();window.scrollTo(0,0);return}
 if(button.dataset.v61Player){v61OpenProfile(button.dataset.v61Player,button);return}
 if(button.dataset.v61Create){
  const clubId=button.dataset.v61Create;button.disabled=true;
  button.insertAdjacentHTML('afterend','<div class="v67-loading" role="status"><span>Vereinswelt wird aufgebaut …</span><span class="v67-loading-track" role="progressbar" aria-label="Vereinswelt aufbauen"><span></span></span></div>');
  requestAnimationFrame(()=>setTimeout(async()=>{try{if(v61ReadCareers().length>=v61MaxCareers)throw Error('Maximal fünf Vereinswelten.');const career=await v61StoreNewCareer(v61CreateCareer(clubId,v61Flow.seed));v61CurrentCareer=career;v61CareerTab='overview';v61RenderCareer(career)}catch(error){button.disabled=false;button.nextElementSibling?.remove();button.insertAdjacentHTML('afterend',`<p class="v61-error" role="alert">Vereinswelt konnte nicht gespeichert werden: ${escapeHTML(error.message)}</p>`)}}));
 }
};
v61RenderSaves();
v61InitStorage();
const v61BaseProgressState=v58State;
v58State=function(){
 if(v61WorldScreen.hidden)return v61BaseProgressState();
 if(!v61CurrentCareer)return null;
 const career=v61CurrentCareer,managed=career.manager.managedClubId,next=v62Fixtures(career).filter(fixture=>!fixture.result&&(fixture.homeId===managed||fixture.awayId===managed)).sort((a,b)=>a.day-b.day)[0];
 return{context:career.world.seasonFinished?`Saison ${career.world.season} abgeschlossen`:next?`${v62Date(next.day)} · ${v62Name(career,next.homeId)} gegen ${v62Name(career,next.awayId)}`:'Alle eigenen Partien gespielt',label:career.world.seasonFinished?'Nächste Saison vorbereiten':next?'Nächstes Spiel simulieren':'Saison abschließen',action:'v61-world'};
};
const v61BaseProgressClick=v58Button.onclick;
v58Button.onclick=function(){if(v58State()?.action==='v61-world'){v61AdvanceCareer();return}v61BaseProgressClick()};
