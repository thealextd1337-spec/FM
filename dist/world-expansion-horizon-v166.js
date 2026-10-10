'use strict';

Object.assign(v61CountryNames,Object.fromEntries(v161Countries.map(c=>[c.id,c.name])));

function v166Expansion(career){return career?.world?.rules?.stage==='active'&&career.world.rules.variant==='expansion12';}
function v166OpeningHorizon(opening=v161Opening){const crown=v165OpeningCrown(opening);return opening.countryOrder.flatMap((country,index)=>opening.nationalPreviousSeason[country].leagueOrder.filter(id=>!crown.includes(id)).slice(0,index<8?3:2));}
function v166DrawHorizon(competition,round,entrants,clubs,seed){
 const count={R32:32,R16:16,QF:8,SF:4,F:2}[round];if(!count||entrants.length!==count||new Set(entrants).size!==count)throw Error('Ungültiges Horizon-Rundenfeld.');
 if(competition.fixtures.some(f=>f.round===round))return;
 const countries=new Map(clubs.map(c=>[c.id,c.countryId])),protectedRound=['R32','R16'].includes(round),order=v62Shuffle([...entrants].sort(),`${seed}:${competition.id}:${round}`);
 if(entrants.some(id=>!countries.has(id)))throw Error('Ein Horizon-Verein fehlt.');
 if(protectedRound&&Math.max(...[...new Set(entrants.map(id=>countries.get(id)))].map(c=>entrants.filter(id=>countries.get(id)===c).length))>count/2)throw Error('Nationale Sperre kann für dieses Horizon-Feld nicht erfüllt werden.');
 // Pair the most concentrated remaining country first; the half-field invariant
 // guarantees a matching. Random order resolves all ties and selects opponents.
 const remaining=[...order],pairs=[];
 while(remaining.length){
  const frequency=id=>remaining.filter(other=>countries.get(id)===countries.get(other)).length;
  const a=protectedRound?[...remaining].sort((a,b)=>frequency(b)-frequency(a)||order.indexOf(a)-order.indexOf(b))[0]:remaining[0];
  const possible=remaining.filter(id=>id!==a&&(!protectedRound||countries.get(id)!==countries.get(a)));
  if(!possible.length)throw Error('Ungültige Horizon-Paarung.');
  const b=protectedRound?[...possible].sort((a,b)=>frequency(b)-frequency(a)||order.indexOf(a)-order.indexOf(b))[0]:possible[0];
  pairs.push([a,b]);remaining.splice(remaining.indexOf(a),1);remaining.splice(remaining.indexOf(b),1);
 }
 const random=v61Random(`${seed}:${competition.id}:${round}:home`),days=v164Calendar().horizon[round];
 pairs.forEach(([a,b],pair)=>{const [home,away]=random()<.5?[a,b]:[b,a];if(round==='F'){const f=v62Fixture(competition,round,days,home,away,1,pair);f.neutral=true;v62Add(competition,f);}else v62Add(competition,v62Fixture(competition,round,days[0],home,away,1,pair),v62Fixture(competition,round,days[1],away,home,2,pair));});
}
function v166Horizon(entrants,clubs,season,seed,crown=[]){
 if(entrants.length!==32||new Set(entrants).size!==32||entrants.some(id=>crown.includes(id)))throw Error('Ungültige Horizon-Teilnehmer oder Crown-Überschneidung.');
 const cup={id:`S${season}:HORIZON`,type:'europe',format:'horizon',name:'Horizon Cup',country:null,season,entrants:[...entrants],fixtures:[],winnerId:null};v166DrawHorizon(cup,'R32',entrants,clubs,seed);return cup;
}
function v166HorizonProgress(career,cup,day){
 const rounds=['R32','R16','QF','SF','F'],days=v164Calendar().horizon,index=rounds.findIndex(r=>(r==='F'?days[r]:days[r][1])===day);if(index<0)return;
 const round=rounds[index],fixtures=cup.fixtures.filter(f=>f.round===round&&f.leg===(round==='F'?1:2));
 if(fixtures.length!==[16,8,4,2,1][index]||fixtures.some(f=>!f.result||![f.homeId,f.awayId].includes(f.result.winnerId)))throw Error('Die Horizon-Runde ist noch nicht abgeschlossen.');
 const winners=fixtures.sort((a,b)=>a.pair-b.pair).map(f=>f.result.winnerId);
 if(round==='F')cup.winnerId=winners[0];else v166DrawHorizon(cup,rounds[index+1],winners,career.world.clubs,career.world.seed);
}
function v166Rules(){return{...v165Rules(),stage:'active'};}
function v166Competitions(career){const domestic=v164DomesticCompetitions(career),crown=v165OpeningCrown(career.world.opening);return[...domestic,v165Crown(crown,career.world.clubs,1,career.world.seed),v166Horizon(v166OpeningHorizon(career.world.opening),career.world.clubs,1,career.world.seed,crown)];}
function v166CreateCareer(clubId,seed,name,matchOptions){
 const career=v161CreateCareer(clubId,seed,name,matchOptions);career.world.rules=v166Rules();career.world.competitions=v166Competitions(career);career.world.seasonFinished=false;career.phase='world-sponsor';career.world.foundationReady.competitions='active-first-season';v62ValidateSchedule(career.world.competitions,career.world.clubs);return career;
}

function v166Resolve(career,fixture,competition){
 if(v62IsLeagueFixture(competition,fixture))v62ResolveLeague(career,fixture);
 else if(competition.type==='europe'&&fixture.leg===2)v62ResolveSecondLeg(career,fixture,competition);
 else if(competition.type==='europe'&&fixture.round!=='F')fixture.result=fixture.result||v62Score(career,fixture);
 else v62ResolveSingle(career,fixture);
}
function v166AdvanceDay(career){
 const world=career.world;if(world.seasonFinished)return[];
 if(world.market.phase!=='closed')throw Error('Zuerst Sponsor, Jugendbudget und Transfers abschließen.');
 const calendar=world.rules.calendar,fixtures=v62Fixtures(career),freeDays=world.market.pendingBids.filter(b=>b.status==='pending'&&!b.sellerId).map(b=>b.placedDay+1),days=[...new Set([...fixtures.filter(f=>!f.result).map(f=>f.day),...freeDays,world.pendingMatchDay,calendar.seasonEnd])].filter(d=>Number.isInteger(d)&&d>world.calendarCursor).sort((a,b)=>a-b);
 if(!days.length)return[];const day=days[0],todays=fixtures.filter(f=>f.day===day&&!f.result),allToday=fixtures.filter(f=>f.day===day),competitions=v62Current(career);
 if(world.activeMatch&&world.activeMatch.state.phase!=='finished'&&v64ActiveFixture(career)?.day===day)throw Error('Zuerst das laufende eigene Spiel beenden.');
 if(typeof v158RecoverWorld==='function')v158RecoverWorld(career,day);v66ResolveFreeDecisions(career,day);
 for(const fixture of todays){const competition=competitions.find(c=>c.id===fixture.competitionId);v64PrepareFixture(career,fixture);if(!fixture.coachExpectations)v63BeforeFixture(career,fixture);v166Resolve(career,fixture,competition);if(!world.eventLog.processedEventIds.includes(fixture.id))world.eventLog.processedEventIds.push(fixture.id);v63AfterFixture(career,fixture);v66AfterFixture(career,fixture);}
 world.calendarCursor=day;if(world.pendingMatchDay===day)delete world.pendingMatchDay;
 if(day>=112)v66RefreshMarketValues(career,'mid');
 for(const competition of competitions){
  if(competition.type==='league'&&competition.fixtures.every(f=>f.result))competition.winnerId=v62Table(competition,[...new Set(competition.fixtures.flatMap(f=>[f.homeId,f.awayId]))])[0].clubId;
  if(!allToday.some(f=>f.competitionId===competition.id))continue;
  if(competition.type==='cup')v62CupProgress(career,competition,day);else if(competition.type==='europe')v62EuropeProgress(career,competition,day);
 }
 v62ValidateSchedule(competitions,world.clubs);
 if(day===calendar.seasonEnd){if(competitions.some(c=>!c.winnerId||c.fixtures.some(f=>!f.result)))throw Error('Die Wettbewerbe sind noch nicht vollständig abgeschlossen.');v74CloseSeason(career);v66SeasonEnd(career);v63SeasonEnd(career);v67SeasonEnd(career);world.seasonFinished=true;}
 return todays;
}
function v166ValidateSeason(career,contract=null){
 try{
  const world=career.world;if(world.season!==(contract?.season||1)||!v161SameData(world.rules,contract?.rules||v166Rules())||!Number.isInteger(world.calendarCursor)||world.calendarCursor<0||world.calendarCursor>224||world.competitions.length!==26)return false;
  const expected=contract?.competitions||v166Competitions(career),actual=world.competitions,processed=[];
  for(const day of [...new Set([...v164Calendar().league,...Object.values(v164Calendar().cup),...Object.values(v164Calendar().crown).flat(),...Object.values(v164Calendar().horizon).flat()])].sort((a,b)=>a-b)){
   for(const competition of expected){
    const source=actual.find(c=>c.id===competition.id);if(!source)return false;
    const fixtures=competition.fixtures.filter(f=>f.day===day);
    for(const fixture of fixtures){
     const saved=source.fixtures.find(f=>f.id===fixture.id);if(!saved)return false;
     for(const key of Object.keys(fixture).filter(k=>k!=='result'))if(!v161SameData(fixture[key],saved[key]))return false;
     if(!saved.result){if(day<=world.calendarCursor)return false;continue;}
     if(day>world.calendarCursor)return false;
     const r=saved.result;if(!Number.isInteger(r.homeGoals)||!Number.isInteger(r.awayGoals)||r.homeGoals<0||r.awayGoals<0||r.homeGoals>99||r.awayGoals>99||!contract?.archived&&!v161SameData(saved.matchRecord?.score,[r.homeGoals,r.awayGoals]))return false;
     const knockout=!v62IsLeagueFixture(competition,fixture)&&(competition.type==='cup'||fixture.leg===2||fixture.round==='F');
     let home=r.homeGoals,away=r.awayGoals;
     if(fixture.leg===2){const first=competition.fixtures.find(f=>f.round===fixture.round&&f.pair===fixture.pair&&f.leg===1);if(!first?.result)return false;home+=first.result.awayGoals;away+=first.result.homeGoals;if(!v161SameData(r.aggregate,[home,away]))return false;}
     if(knockout){const tied=home===away;if(tied&&(!Array.isArray(r.penalties)||r.penalties.length!==2||r.penalties.some(n=>!Number.isInteger(n)||n<0)||r.penalties[0]===r.penalties[1]))return false;if(!tied&&r.penalties)return false;const winner=home>away?fixture.homeId:away>home?fixture.awayId:r.penalties[0]>r.penalties[1]?fixture.homeId:fixture.awayId;if(r.winnerId!==winner)return false;}else if(r.penalties||r.winnerId)return false;
     fixture.result=JSON.parse(JSON.stringify(r));processed.push(fixture.id);
    }
    if(fixtures.length&&fixtures.every(f=>f.result)){if(competition.type==='cup')v164CupProgress(career,competition,day);else if(competition.format==='crown')v165CrownProgress(career,competition,day);else if(competition.format==='horizon')v166HorizonProgress(career,competition,day);}
    if(competition.type==='league'&&competition.fixtures.every(f=>f.result))competition.winnerId=v62Table(competition,[...new Set(competition.fixtures.flatMap(f=>[f.homeId,f.awayId]))])[0].clubId;
   }
  }
  for(const competition of expected){const source=actual.find(c=>c.id===competition.id);if(source.fixtures.length!==competition.fixtures.length||new Set(source.fixtures.map(f=>f.id)).size!==source.fixtures.length)return false;for(const key of Object.keys(competition).filter(k=>k!=='fixtures'))if(!v161SameData(competition[key],source[key]))return false;}
  const ids=world.eventLog.processedEventIds;if(ids.length!==processed.length||new Set(ids).size!==ids.length||processed.some(id=>!ids.includes(id)))return false;
  if(Boolean(world.seasonFinished)!==(world.calendarCursor===224))return false;
  if(world.activeMatch){const f=v62Fixtures(career).find(f=>f.id===world.activeMatch.fixtureId);if(!f||world.activeMatch.state.fixtureId!==f.id||![f.homeId,f.awayId].includes(career.manager.managedClubId))return false;}
  return true;
 }catch{return false;}
}
const v166BaseValidator=v161ValidateRules;
v161ValidateRules=function(career){if(!v166Expansion(career))return v166BaseValidator(career);return v166ValidateSeason(career)&&v166BaseValidator({...career,phase:'world-foundation',world:{...career.world,calendarCursor:0,rules:v161Rules(),competitions:[]}});};
const v166BaseEuropeProgress=v62EuropeProgress;
v62EuropeProgress=function(career,cup,day){return cup.format==='horizon'?v166HorizonProgress(career,cup,day):v166BaseEuropeProgress(career,cup,day);};
const v166BaseAdvance=v62AdvanceDay;
v62AdvanceDay=function(career){return v166Expansion(career)?v166AdvanceDay(career):v166BaseAdvance(career);};
const v166BaseNextSeason=v62NextSeason;
v62NextSeason=function(career){if(v166Expansion(career))throw Error('Die Folgequalifikation und nächste Saison folgen mit AP07.');return v166BaseNextSeason(career);};
const v166BaseOwnMatch=v64AdvanceToOwnMatch;
v64AdvanceToOwnMatch=function(career){if(v166Expansion(career)&&career.world.market.phase!=='closed')throw Error('Zuerst Sponsorwahl, Jugendbudget und Transferphase abschließen.');return v166BaseOwnMatch(career);};

if(typeof window==='object')Object.assign(window.D6Expansion,{createSeason:v166CreateCareer,advanceDay:v62AdvanceDay,validateSeason:v166ValidateSeason});
