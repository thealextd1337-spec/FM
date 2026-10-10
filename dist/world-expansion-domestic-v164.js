'use strict';

// One calendar contract for AP04–06. Day zero is 1 August, as in v62Date.
function v164Calendar(){return{version:1,seasonStart:0,seasonEnd:224,league:[2,16,30,44,58,79,93,114,128,149,163,184,198,219],cup:{R16:13,QF:76,SF:139,F:202},crown:{league:[27,48,69,90,111],QF:[125,132],SF:[153,160],F:209},horizon:{R32:[27,48],R16:[69,90],QF:[111,125],SF:[153,160],F:188}};}
function v164League(country,clubs,season,seed){
 if(clubs.length!==8||new Set(clubs.map(c=>c.id)).size!==8)throw Error('Eine erweiterte Liga benötigt acht Vereine.');
 const competition={id:`S${season}:${country}:LEAGUE`,type:'league',country,season,fixtures:[],winnerId:null};
 const days=v164Calendar().league,first=[];let order=v62Shuffle(clubs.map(c=>c.id),`${seed}:${competition.id}:draw`);
 for(let round=0;round<7;round++){
  const pairs=[];
  for(let pair=0;pair<4;pair++){const a=order[pair],b=order[7-pair];pairs.push((round+pair)%2?[a,b]:[b,a]);}
  first.push(pairs);order=[order[0],order[7],...order.slice(1,7)];
 }
 for(let round=0;round<14;round++)for(const[a,b]of first[round%7])v62Add(competition,v62Fixture(competition,`R${round+1}`,days[round],round<7?a:b,round<7?b:a));
 return competition;
}
function v164DrawCupRound(competition,round,entrants,seed){
 const size={R16:16,QF:8,SF:4,F:2}[round],day=v164Calendar().cup[round];
 if(!size||entrants.length!==size||new Set(entrants).size!==size)throw Error('Ungültige Pokalteilnehmer.');
 if(competition.fixtures.some(f=>f.round===round))return;
 const draw=v62Shuffle(entrants,`${seed}:${competition.id}:${round}`);
 for(let pair=0;pair<size/2;pair++){const f=v62Fixture(competition,round,day,draw[2*pair],draw[2*pair+1],1,pair);if(round==='F')f.neutral=true;v62Add(competition,f);}
}
function v164Cup(country,clubs,season,seed){
 const competition={id:`S${season}:${country}:CUP`,type:'cup',country,season,fixtures:[],winnerId:null,finalistId:null,format:'domestic16'};
 v164DrawCupRound(competition,'R16',clubs.map(c=>c.id),seed);return competition;
}
function v164CupProgress(career,competition,day){
 const rounds=['R16','QF','SF','F'],index=rounds.findIndex(r=>v164Calendar().cup[r]===day);if(index<0)return;
 const round=rounds[index],fixtures=competition.fixtures.filter(f=>f.round===round),size=[8,4,2,1][index];
 if(fixtures.length!==size||fixtures.some(f=>!f.result?.winnerId))throw Error('Die Pokalrunde ist noch nicht abgeschlossen.');
 const winners=fixtures.map(f=>{if(![f.homeId,f.awayId].includes(f.result.winnerId))throw Error('Ungültiger Pokalsieger.');return f.result.winnerId;});
 if(index<3)v164DrawCupRound(competition,rounds[index+1],winners,career.world.seed);
 else{competition.winnerId=winners[0];competition.finalistId=fixtures[0].homeId===winners[0]?fixtures[0].awayId:fixtures[0].homeId;}
}
function v164DomesticCompetitions(career){
 const {clubs,seed,season}=career.world,competitions=[];
 for(const {id}of v161Countries){const members=clubs.filter(c=>c.countryId===id);competitions.push(v164League(id,members.filter(c=>c.leagueId),season,seed),v164Cup(id,members,season,seed));}
 v62ValidateSchedule(competitions,clubs);return competitions;
}
function v164Rules(){return{...v161Rules(),stage:'domestic-prepared',calendar:v164Calendar()};}
function v164CreateCareer(clubId,seed,name,matchOptions){
 const career=v161CreateCareer(clubId,seed,name,matchOptions);
 career.world.competitions=v164DomesticCompetitions(career);career.world.rules=v164Rules();
 career.world.foundationReady.competitions='national-prepared-international-pending';return career;
}
function v164ValidatePreparation(career){
 // Only an unplayed preparation is stored until the complete season is activated.
 try{return v161SameData(career.world.rules,v164Rules())&&v161SameData(career.world.competitions,v164DomesticCompetitions(career));}catch{return false;}
}
const v164BaseRulesValidator=v161ValidateRules;
v161ValidateRules=function(career){
 if(career?.world?.rules?.stage!=='domestic-prepared')return v164BaseRulesValidator(career);
 if(!v164ValidatePreparation(career))return false;
 const foundation={...career,world:{...career.world,rules:v161Rules(),competitions:[]}};return v164BaseRulesValidator(foundation);
};
const v164BaseCupProgress=v62CupProgress;
v62CupProgress=function(career,competition,day){return competition.format==='domestic16'?v164CupProgress(career,competition,day):v164BaseCupProgress(career,competition,day);};
const v164BaseAdvance=v62AdvanceDay;
v62AdvanceDay=function(career){if(career.world.rules?.stage==='domestic-prepared')throw Error('Die internationalen Wettbewerbe dieser Welt sind noch nicht vorbereitet.');return v164BaseAdvance(career);};
const v164BaseRender=v161RenderFoundation;
function v164CalendarHTML(career){
 const clubId=career.manager.managedClubId,fixtures=v62Fixtures(career).filter(f=>f.homeId===clubId||f.awayId===clubId).sort((a,b)=>a.day-b.day);
 return `<details><summary>Vorbereiteter Kalender des Startvereins</summary><ul>${fixtures.map(f=>{const competition=career.world.competitions.find(c=>c.id===f.competitionId),label=competition.type==='league'?'Liga '+f.round.slice(1):competition.type==='cup'?'Pokal '+f.round:(competition.name||'Europacup')+' '+f.round;return `<li>${v62Date(f.day)} · ${v161Escape(label)} · ${v161Escape(career.world.clubs.find(c=>c.id===(f.homeId===clubId?f.awayId:f.homeId)).name)} (${f.neutral?'Neutral':f.homeId===clubId?'Heim':'Auswärts'})</li>`;}).join('')}</ul></details>`;
}
v161RenderFoundation=function(career){
 v164BaseRender(career);
 if(career.world.rules?.stage!=='domestic-prepared')return;
 v61WorldScreen.querySelector('section p').textContent='Die Vereinswelt und ihre nationalen Spielpläne sind vorbereitet. Crown und Horizon werden im nächsten Schritt ergänzt; danach folgt die volle Spielbarkeit.';
 v61WorldScreen.querySelector('section').insertAdjacentHTML('beforeend',v164CalendarHTML(career));
};
if(typeof window==='object')Object.assign(window.D6Expansion,{createDomestic:v164CreateCareer,calendar:v164Calendar,calendarHTML:v164CalendarHTML});
