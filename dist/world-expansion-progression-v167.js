'use strict';

// New careers opt in at construction. Loading never assigns this marker.
function v167Active(career){return career?.world?.progressionVersion===167&&career.world.rules?.variant==='expansion12';}
function v167Rules(){return{...v166Rules(),progressionVersion:167,economyVersion:1};}
function v167Qualify(source,season){
 const {countryOrder,nationalPreviousSeason,previousInternationalWinners}=source,crown=[previousInternationalWinners.crown,previousInternationalWinners.horizon],nationalSlots={},horizonByCountry={};
 if(countryOrder.length!==12||new Set(countryOrder).size!==12||new Set(crown).size!==2)throw Error('Ungültige Qualifikationsquelle.');
 const known=new Set(v161Catalog.map(c=>c.id));if(crown.some(id=>!known.has(id)))throw Error('Ein Titelverteidiger fehlt.');
 for(const country of countryOrder){
  const row=nationalPreviousSeason[country],league=v161Catalog.filter(c=>c.playable&&c.countryId===country).map(c=>c.id);
  if(!row||row.leagueOrder.length!==8||new Set(row.leagueOrder).size!==8||row.leagueOrder.some(id=>!league.includes(id))||![row.cupWinner,row.cupFinalist].every(id=>known.has(id)&&id.startsWith(country+'-'))||row.cupWinner===row.cupFinalist)throw Error('Ungültiger Landesabschluss.');
  const champion=row.leagueOrder[0],cup=champion===row.cupWinner?row.cupFinalist:row.cupWinner;nationalSlots[country]=[];
  for(const id of [champion,cup]){if(crown.includes(id))nationalSlots[country].push(null);else{crown.push(id);nationalSlots[country].push(id);}}
 }
 // Reserve every direct qualifier before filling title overlaps.
 for(const country of countryOrder)for(let slot=0;slot<2;slot++)if(nationalSlots[country][slot]===null){const id=nationalPreviousSeason[country].leagueOrder.find(id=>!crown.includes(id));if(!id)throw Error('Kein Crown-Nachrücker verfügbar.');crown.push(id);nationalSlots[country][slot]=id;}
 for(const [rank,country]of countryOrder.entries()){horizonByCountry[country]=nationalPreviousSeason[country].leagueOrder.filter(id=>!crown.includes(id)).slice(0,rank<8?3:2);if(horizonByCountry[country].length!==(rank<8?3:2))throw Error('Zu wenige Horizon-Teilnehmer.');}
 const horizon=countryOrder.flatMap(id=>horizonByCountry[id]);if(crown.length!==26||new Set(crown).size!==26||horizon.length!==32||new Set(horizon).size!==32||horizon.some(id=>crown.includes(id)))throw Error('Ungültige internationale Teilnehmer.');
 return{season,countryOrder:[...countryOrder],nationalPreviousSeason:JSON.parse(JSON.stringify(nationalPreviousSeason)),previousInternationalWinners:{...previousInternationalWinners},nationalSlots,horizonByCountry,crown,horizon};
}
function v167Source(career,season,countryOrder){
 const competitions=career.world.competitions.filter(c=>c.season===season),nationalPreviousSeason={};
 for(const country of countryOrder){const league=competitions.find(c=>c.type==='league'&&c.country===country),cup=competitions.find(c=>c.type==='cup'&&c.country===country);if(!league?.winnerId||!cup?.winnerId||!cup.finalistId)throw Error('Landeswettbewerbe sind noch offen.');nationalPreviousSeason[country]={leagueOrder:v62Table(league,career.world.clubs.filter(c=>c.leagueId===country+'-LEAGUE').map(c=>c.id)).map(r=>r.clubId),cupWinner:cup.winnerId,cupFinalist:cup.finalistId};}
 const crown=competitions.find(c=>c.format==='crown')?.winnerId,horizon=competitions.find(c=>c.format==='horizon')?.winnerId;if(!crown||!horizon)throw Error('Internationale Titel sind noch offen.');
 return{countryOrder:[...countryOrder],nationalPreviousSeason,previousInternationalWinners:{crown,horizon}};
}
function v167Fraction(n,d=1){const gcd=(a,b)=>b?gcd(b,a%b):a,g=gcd(n,d)||1;return{n:n/g,d:d/g};}
function v167Sum(values){return values.reduce((a,b)=>v167Fraction(a.n*b.d+b.n*a.d,a.d*b.d),{n:0,d:1});}
function v167Compare(a,b){return a.n*b.d-b.n*a.d;}
function v167CountryValues(competitions,clubs,season,orderBefore){
 const cups=competitions.filter(c=>c.season===season&&c.type==='europe');if(cups.length!==2||cups.some(c=>!c.winnerId||c.fixtures.some(f=>!f.result)))throw Error('Die Europacups sind noch nicht abgeschlossen.');
 const contributions=cups.flatMap(c=>c.entrants.map(clubId=>{
  const matches=c.fixtures.filter(f=>f.homeId===clubId||f.awayId===clubId),matchPoints=matches.reduce((sum,f)=>{const own=f.homeId===clubId?f.result.homeGoals:f.result.awayGoals,other=f.homeId===clubId?f.result.awayGoals:f.result.homeGoals;return sum+(own>other?2:own===other?1:0);},0);
  // Count each reached round once; penalties never change match points.
  const bonuses=['QF','SF','F'].filter(round=>matches.some(f=>f.round===round)).length+(c.winnerId===clubId?1:0);
  return{clubId,competitionId:c.id,matchPoints,bonuses,points:matchPoints+bonuses};
 }));
 if(contributions.length!==58||new Set(contributions.map(c=>c.clubId)).size!==58)throw Error('Ungültiger Wertungsnenner.');
 return{season,orderBefore:[...orderBefore],countries:orderBefore.map(country=>{const entries=contributions.filter(c=>clubs.find(club=>club.id===c.clubId)?.countryId===country),points=entries.reduce((sum,c)=>sum+c.points,0);return{country,participants:entries.length,points,value:v167Fraction(points,entries.length),contributions:entries};})};
}
function v167Ranking(records,previousOrder){
 const recent=records.slice(-3),latest=recent.at(-1);return previousOrder.map(country=>({country,total:v167Sum(recent.map(r=>r.countries.find(c=>c.country===country).value)),latest:latest?.countries.find(c=>c.country===country).value||{n:0,d:1}})).sort((a,b)=>v167Compare(b.total,a.total)||v167Compare(b.latest,a.latest)||previousOrder.indexOf(a.country)-previousOrder.indexOf(b.country));
}
function v167CloseRanking(career){
 const world=career.world;if(!v167Active(career))return;
 if(world.countrySeasonValues.some(r=>r.season===world.season))return;
 const record=v167CountryValues(v62Current(career),world.clubs,world.season,world.countryRanking);world.countrySeasonValues.push(record);world.countryRanking=v167Ranking(world.countrySeasonValues,record.orderBefore).map(r=>r.country);
}
function v167Competitions(career,qualification=career.world.qualifications.find(q=>q.season===career.world.season)){
 if(!qualification)throw Error('Die Saisonqualifikation fehlt.');const {clubs,seed,season}=career.world;const competitions=[...v164DomesticCompetitions(career),v165Crown(qualification.crown,clubs,season,seed),v166Horizon(qualification.horizon,clubs,season,seed,qualification.crown)];v62ValidateSchedule(competitions,clubs);return competitions;
}
function v167CreateCareer(clubId,seed,name,matchOptions){
 const career=v161CreateCareer(clubId,seed,name,matchOptions,167),world=career.world;world.rules=v167Rules();world.countrySeasonValues=[];world.countryRanking=[...world.opening.countryOrder];world.qualifications=[v167Qualify(world.opening,1)];world.competitions=v167Competitions(career);world.seasonFinished=false;world.foundationReady.competitions='active-multiyear';career.phase='world-sponsor';return career;
}
function v167NextSeason(career){
 const world=career.world;if(!world.seasonFinished)throw Error('Die Saison ist noch nicht abgeschlossen.');
 if(!v167ValidateProgression(career))throw Error('Der Saisonabschluss ist unvollständig.');
 const qualification=v167Qualify(v167Source(career,world.season,world.countryRanking),world.season+1);
 v67BeforeNextSeason(career);v64ArchiveSeason(career);v63ArchiveSeason(career);world.season++;world.qualifications.push(qualification);
 v158RecoverWorld(career,0);v63NextSeason(career);world.competitions.push(...v167Competitions(career));world.calendarCursor=0;world.seasonFinished=false;delete world.activeMatch;delete world.pendingMatchDay;
 v66StartSeason(career);v67StartSeason(career);v158SeasonStart(career);career.updated=new Date().toISOString();return qualification;
}
function v167ValidateProgression(career){
 try{
  const world=career.world;if(!v161SameData(world.rules,v167Rules())||world.clubs.some(c=>c.economyVersion!==1)||!Number.isInteger(world.season)||world.season<1||!Array.isArray(world.qualifications)||world.qualifications.length!==world.season||!Array.isArray(world.countrySeasonValues)||world.countrySeasonValues.length!==world.season-1+Number(Boolean(world.seasonFinished))||world.competitions.length!==26*world.season)return false;
  let order=[...world.opening.countryOrder];const records=[];
  for(let season=1;season<=world.season;season++){
   const qualification=v167Qualify(season===1?world.opening:v167Source(career,season-1,order),season);if(!v161SameData(qualification,world.qualifications[season-1]))return false;
   const competitions=world.competitions.filter(c=>c.season===season),archived=season<world.season,projection={...career,world:{...world,season,competitions,calendarCursor:archived?224:world.calendarCursor,seasonFinished:archived||world.seasonFinished,activeMatch:archived?null:world.activeMatch,eventLog:{...world.eventLog,processedEventIds:world.eventLog.processedEventIds.filter(id=>id.startsWith(`S${season}:`))}}};
   if(!v166ValidateSeason(projection,{season,rules:v167Rules(),competitions:v167Competitions(projection,qualification),archived}))return false;
   if(archived||world.seasonFinished){const record=v167CountryValues(competitions,world.clubs,season,order);if(!v161SameData(record,world.countrySeasonValues[season-1]))return false;records.push(record);order=v167Ranking(records,order).map(r=>r.country);}
  }
  const ids=world.eventLog.processedEventIds,results=world.competitions.flatMap(c=>c.fixtures.filter(f=>f.result).map(f=>f.id));return v161SameData(order,world.countryRanking)&&new Set(ids).size===ids.length&&ids.length===results.length&&results.every(id=>ids.includes(id));
 }catch{return false;}
}
const v167BaseValidator=v161ValidateRules;
v161ValidateRules=function(career){if(!v167Active(career)||career.world.rules.stage!=='active')return v167BaseValidator(career);return v167ValidateProgression(career)&&v166BaseValidator({...career,phase:'world-foundation',world:{...career.world,season:1,calendarCursor:0,rules:v161Rules(),competitions:[]}});};
const v167BaseClose=v67SeasonEnd;
v67SeasonEnd=function(career){const result=v167BaseClose(career);v167CloseRanking(career);return result;};
const v167BaseNext=v62NextSeason;
v62NextSeason=function(career){return v167Active(career)?v167NextSeason(career):v167BaseNext(career);};
// Keep AP06 construction callable for regression tests; the preview opts into AP07.
if(typeof window==='object')Object.assign(window.D6Expansion,{createCareer:v167CreateCareer,nextSeason:v62NextSeason,ranking:v167Ranking,validateProgression:v167ValidateProgression});
