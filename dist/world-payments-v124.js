'use strict';

// The marker is assigned only when creating a career. Existing worlds keep their payment rules.
function v124Payments(career){return career.world.paymentSchedule===1}
function v124LeagueRemaining(career,club){
 if(!club.leagueId)return 0;
 return club.ledger.some(row=>row.id===`S${career.world.season}:${club.id}:league-prize`)?0:v66LeaguePrize(career,career.world.rules?.variant==='expansion12'?7:5);
}
function v124Book(career,clubId,id,amount,label,day){
 const booked=v66Book(career,clubId,id,amount,label);
 if(booked){const row=v66Club(career,clubId).ledger.at(-1);row.day=day;row.balanceAfter=v66Club(career,clubId).balance}
 return booked;
}
const v124BaseInit=v66Init;
v66Init=function(career){
 career.world.paymentSchedule=1;
 for(const club of career.world.clubs){
  club.simulationOnly=!club.leagueId;
  if(club.simulationOnly){club.retiredPlayers=[];for(const player of club.roster)player.retirementAge=v124RetirementAge(career,player)}
 }
 return v124BaseInit(career);
};
function v124RetirementAge(career,player){return Math.max(player.age+1,33+Math.floor(v61Random(`${career.world.seed}:${player.pid}:retirement-age`)()*6))}
// Roster assignments use zero-value contract records to preserve the shared match data model.
function v124SimulationContract(career,club,player){return{id:`S${career.world.season}:${player.pid}:simulation`,pid:player.pid,clubId:club.id,simulationOnly:true,annual:0,fromSeason:career.world.season,endSeason:career.world.season+1,startsAt:0,promise:0,promiseHits:0,promisePenalty:0,lastPromiseCheck:0,renewalOffers:0}}
const v124BaseArchiveSeason=v64ArchiveSeason;
v64ArchiveSeason=function(career){
 v124BaseArchiveSeason(career);
 for(const club of career.world.clubs.filter(item=>item.simulationOnly)){
  const retired=club.roster.filter(player=>player.age>=player.retirementAge);
  if(!retired.length)continue;
  const generated=v61GenerateRoster((career.world.rules?.variant==='expansion12'?v161Catalog:v61Catalog).find(item=>item.id===club.id),`${career.world.seed}:S${career.world.season+1}:replacement`);
  const names=new Set([...club.roster,...club.retiredPlayers].map(player=>player.name));
  for(const old of retired){
   old.retiredSeason=career.world.season;club.retiredPlayers.push(old);
   const slot=club.roster.indexOf(old),player=generated[slot];
   player.age=18+Math.floor(v61Random(`${player.pid}:age`)()*6);player.n=old.n;
   if(career.world.playerFoundation)v153Generate(player,{...career.world.playerFoundation,season:career.world.season+1},'cup',club.policy.startingSquad,club.policy.youth,club.id);
   player.name=v79PlayerName(player.nation,player.pid,names);names.add(player.name);
   player.retirementAge=v124RetirementAge(career,player);
   player.appearance=v61GenerateAppearance(player.pid,player.nation,player.age,club.roster);
   club.roster[slot]=player;
   career.world.contracts=career.world.contracts.filter(item=>item.pid!==old.pid);
   career.world.contracts.push(v124SimulationContract(career,club,player));
  }
 }
};
const v124BaseStartSeason=v66StartSeason;
v66StartSeason=function(career){
 const result=v124BaseStartSeason(career);
 if(v124Payments(career))career.world.youthBudgetPending=true;
 return result;
};
const v124BaseYouthInit=v67Init;
v67Init=function(career){const result=v124BaseYouthInit(career);if(v124Payments(career))v67StartSeason(career);return result};
const v124BaseChooseSponsor=v66ChooseSponsor;
v66ChooseSponsor=function(career,clubId,offerId){
 if(!v124Payments(career)||clubId!==career.manager.managedClubId||typeof v67FundYouth!=='function')return v124BaseChooseSponsor(career,clubId,offerId);
 const club=v66Club(career,clubId),offer=club?.sponsors.find(item=>item.id===offerId);
 if(!offer||club.sponsorId)throw Error('Das Sponsorangebot ist nicht mehr wählbar.');
 club.sponsorId=offer.id;
 v124Book(career,clubId,`${offer.id}:fixed`,offer.fixed,`Sponsor ${offer.name}: Fixum`,0);
 career.world.market.phase='budget';career.phase='world-budget';
 return offer;
};
function v124SetYouthBudget(career,amount){
 const club=v66Club(career,career.manager.managedClubId);amount=Number(amount);
 if(!v124Payments(career)||career.world.market.phase!=='budget'||!career.world.youthBudgetPending||!club.sponsorId||!Number.isInteger(amount)||amount<0||amount%50!==0||amount>v67BudgetLimit(club))throw Error('Das Jugendbudget ist nicht verfügbar oder nicht gedeckt.');
 v67FundYouth(career,club,amount);
 career.world.youthBudgetPending=false;career.world.market.phase='open';career.phase='world-market';
 if(typeof v72OpenMarket==='function')v72OpenMarket(career);
 v66AiPropose(career);career.updated=new Date().toISOString();
 return amount;
}
const v124BaseAdvanceDay=v62AdvanceDay;
v62AdvanceDay=function(career){
 if(v124Payments(career)&&!career.world.seasonFinished&&career.world.market.phase!=='closed')throw Error('Zuerst Sponsor, Jugendbudget und Transfers abschließen.');
 return v124BaseAdvanceDay(career);
};
function v124PayLeague(career,competition,day){
 if(competition.type!=='league'||!competition.fixtures.every(item=>item.result))return;
 const ids=career.world.clubs.filter(club=>club.leagueId===`${competition.country}-LEAGUE`).map(club=>club.id);
 v62Table(competition,ids).forEach((row,rank)=>v124Book(career,row.clubId,`S${career.world.season}:${row.clubId}:league-prize`,v66LeaguePrize(career,rank),`Ligaprämie · Platz ${rank+1}`,day));
}
const v124BaseAfterFixture=v66AfterFixture;
v66AfterFixture=function(career,fixture){
 const processed=career.world.economyProcessedFixtures?.includes(fixture.id);
 v124BaseAfterFixture(career,fixture);
 if(!v124Payments(career)||processed||!fixture.result)return;
 const competition=v62Current(career).find(item=>item.id===fixture.competitionId),season=career.world.season;
 // Match credits are created by the existing result handler before the calendar cursor advances.
 for(const clubId of [fixture.homeId,fixture.awayId]){
  const row=v66Club(career,clubId).ledger.find(item=>item.id===`${fixture.id}:match-credit`);
  if(row){row.day=fixture.day;row.balanceAfter=v66Club(career,clubId).balance}
  if(competition.type==='europe')v124Book(career,clubId,`${fixture.id}:${clubId}:europe-prize`,v66Prize(career,competition,'match'),(competition.name||'Europacup')+' · Spielprämie',fixture.day);
  if(competition.type==='cup'&&fixture.round==='R16'&&typeof v167Active==='function'&&v167Active(career))v124Book(career,clubId,`S${season}:${clubId}:cup-prize:R16`,v66Prize(career,competition,'R16'),'Nationaler Pokal: Achtelfinale',fixture.day);
  if(competition.type==='cup'&&fixture.round==='QF')v124Book(career,clubId,`S${season}:${clubId}:cup-prize:QF`,v66Prize(career,competition,'QF'),'Nationaler Pokal · Viertelfinale',fixture.day);
 }
 if(competition.type==='cup'){
  const next={QF:['SF',50,'Halbfinale erreicht'],SF:['F',60,'Finale erreicht'],F:['winner',120,'Pokalsieg']}[fixture.round];
  if(next&&fixture.result.winnerId)v124Book(career,fixture.result.winnerId,`S${season}:${fixture.result.winnerId}:cup-prize:${next[0]}`,v66Prize(career,competition,next[0]),`Nationaler Pokal · ${next[2]}`,fixture.day);
 }
 if(competition.type==='europe'&&fixture.round==='F'&&fixture.result.winnerId)v124Book(career,fixture.result.winnerId,`S${season}:${fixture.result.winnerId}:europe-prize:winner`,v66Prize(career,competition,'title'),(competition.name||'Europacup')+' · Titelbonus',fixture.day);
 v124PayLeague(career,competition,fixture.day);
};
function v124FinancePlan(career,clubId){
 const club=v66Club(career,clubId),season=career.world.season,competitions=v62Current(career),day=Math.max(0,career.world.calendarCursor),payments=[];
 if(club.simulationOnly)return{simulationOnly:true,balance:0,salary:0,safe:0,withSponsorBonuses:0,payments,next:undefined};
 const add=(label,amount,dueDay,safe=true)=>{if(amount!==0)payments.push({label,amount,day:dueDay,safe})};
 const done=career.world.seasonFinished;
 if(!done){
  const sponsor=club.sponsors.find(item=>item.id===club.sponsorId);
  if(!sponsor)add('Sponsorfixum · mindestens',Math.min(...club.sponsors.map(item=>item.fixed)),0);
  if(club.leagueId){const league=competitions.find(item=>item.type==='league'&&item.country===club.countryId);if(!club.ledger.some(row=>row.id===`S${season}:${club.id}:league-prize`))add(career.world.rules?.variant==='expansion12'?'Ligaprämie · mindestens Platz 8':'Ligaprämie · mindestens Platz 6',v66LeaguePrize(career,career.world.rules?.variant==='expansion12'?7:5),Math.max(...league.fixtures.map(item=>item.day)))}
  const cup=competitions.find(item=>item.type==='cup'&&item.country===club.countryId),first=cup.fixtures.find(item=>item.round==='QF'&&(item.homeId===club.id||item.awayId===club.id));
  if(typeof v167Active==='function'&&v167Active(career)){const opening=cup.fixtures.find(f=>f.round==='R16'&&(f.homeId===club.id||f.awayId===club.id));if(opening&&!opening.result)add('Nationaler Pokal: Achtelfinale',v66Prize(career,cup,'R16'),opening.day);}
  if(first&&!first.result)add('Nationaler Pokal · Viertelfinale',v66Prize(career,cup,'QF'),first.day);
  const europe=competitions.find(item=>item.type==='europe'&&item.fixtures.some(f=>f.homeId===club.id||f.awayId===club.id));
  for(const fixture of (europe?.fixtures||[]).filter(item=>!item.result&&(item.homeId===club.id||item.awayId===club.id)))add((europe.name||'Europacup')+' · Spielprämie',v66Prize(career,europe,'match'),fixture.day);
  for(const goal of sponsor?.goals||[]){
   const competition=goal.kind==='league'?competitions.find(item=>item.type==='league'&&item.country===club.countryId):goal.kind==='cup'?cup:competitions.find(item=>item.id===goal.competition);
   const final=goal.kind!=='league'||competition?.fixtures.every(item=>item.result),met=Boolean(final&&v66SponsorMet(career,club,goal));
   const possible=competition?.fixtures.some(item=>!item.result&&(item.homeId===club.id||item.awayId===club.id));
   if(met||possible)add(`Sponsorbonus: ${goal.label}`,goal.bonus,v62Days.seasonEnd,met);
  }
  add('Spielergehälter',-v66SalaryDue(career,clubId),v62Days.seasonEnd);
 }
 payments.sort((a,b)=>a.day-b.day||(a.amount<0)-(b.amount<0));
 const safe=payments.filter(item=>item.safe).reduce((sum,item)=>sum+item.amount,club.balance);
 return{balance:club.balance,salary:v66SalaryDue(career,clubId),safe,withSponsorBonuses:payments.filter(item=>!item.safe).reduce((sum,item)=>sum+item.amount,safe),payments,next:payments.find(item=>item.day>=day)};
}
