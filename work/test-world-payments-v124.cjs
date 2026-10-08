const assert=require('node:assert/strict'),{harness}=require('./world-finance-harness-v124.cjs');
const modern=harness(),legacy=harness(false),{call}=modern;
const career=call('v61CreateCareer','GER-2','payment-regression-v124'),club=call('v66Club',career,'GER-2');
assert.equal(career.world.paymentSchedule,1);
assert.throws(()=>call('v124SetYouthBudget',career,200),/Jugendbudget/);
assert.throws(()=>call('v62AdvanceDay',career),/abschließen/);
assert(!club.ledger.some(row=>row.id.endsWith(':youth-budget')));
call('v66ChooseSponsor',career,club.id,club.sponsors[0].id);
assert.equal(career.world.market.phase,'budget');
const openingPlan=call('v124FinancePlan',career,club.id);
assert(openingPlan.payments.filter(item=>item.label.startsWith('Sponsorbonus: Liga')).every(item=>!item.safe),'Vorläufige Tabellenplätze sind keine sicheren Sponsorboni');
assert.equal(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true);
const shortBudget=JSON.parse(JSON.stringify(career)),shortClub=call('v66Club',shortBudget,club.id);
for(let index=0;index<2;index++){const player=shortClub.roster.pop();shortBudget.world.market.freePlayers.push(player);shortBudget.world.contracts=shortBudget.world.contracts.filter(item=>item.pid!==player.pid)}
assert.equal(shortClub.roster.length,9);
assert.equal(call('v61ValidateCareer',shortBudget),true,'Budgetwahl muss nach Vertragsabgängen vor der Kaderergänzung speicherbar sein');
assert.throws(()=>call('v124SetYouthBudget',career,club.balance+50),/Jugendbudget/);
const before=club.balance;call('v124SetYouthBudget',career,200);
const passive=career.world.clubs.filter(item=>item.simulationOnly);
assert.equal(passive.length,12);
for(const team of passive){
 assert.equal(team.balance,0);assert.equal(team.ledger.length,0);assert.equal(team.youthPool.length,0);
 assert.equal(call('v66SalaryDue',career,team.id),0);
 assert.equal(call('v124FinancePlan',career,team.id).payments.length,0);
 assert.equal(call('v66Book',career,team.id,'illegal-income',1000,'Test'),false);
 assert.throws(()=>call('v66MakeBid',career,club.id,team.roster[0].pid,500,200,2),/Simulationsteam/);
 assert.throws(()=>call('v66MakeBid',career,team.id,club.roster[1].pid,500,200,2),/Simulationsteam/);
 assert.equal(call('v72TransferTerms',career,team.roster[0].pid),null);
 assert.throws(()=>call('v72Start',career,team.roster[1].pid,500));
}
assert.equal(club.balance,before-200);
assert.equal(career.world.market.phase,'open');
assert.throws(()=>call('v124SetYouthBudget',career,200),/Jugendbudget/);
const moneyRows=club.ledger.filter(row=>row.amount!==0);
assert(moneyRows.findIndex(row=>row.id.endsWith(':fixed'))<moneyRows.findIndex(row=>row.id.endsWith(':youth-budget')));
while(career.world.market.phase==='open')call('v66NextMarketDay',career);
let steps=0;
while(!career.world.seasonFinished){
 call('v62AdvanceDay',career);assert(++steps<100);
 if(career.world.calendarCursor===95){
  const cup=call('v62Current',career).find(item=>item.type==='cup'&&item.country==='GER');
  for(const fixture of cup.fixtures.filter(item=>item.round==='QF'))for(const id of [fixture.homeId,fixture.awayId]){
   const prize=call('v66Club',career,id).ledger.filter(row=>row.id.includes(':cup-prize:')).reduce((sum,row)=>sum+row.amount,0);
   assert.equal(prize,call('v66Club',career,id).simulationOnly?0:fixture.result.winnerId===id?90:40);
   if(fixture.result.winnerId!==id){const probe=JSON.parse(JSON.stringify(career)),team=call('v66Club',probe,id),offer=team.sponsors.find(item=>item.id===team.sponsorId);offer.goals=[{kind:'cup',target:'F',bonus:200,label:'Finale erreichen'}];assert(!call('v124FinancePlan',probe,id).payments.some(item=>item.label==='Sponsorbonus: Finale erreichen'),'Nach Ausscheiden ist der Finale-Bonus nicht mehr möglich')}
  }
 }
 if(career.world.calendarCursor===196){
  for(const team of career.world.clubs.filter(item=>item.leagueId))assert.equal(team.ledger.filter(row=>row.id.endsWith(':league-prize')).length,1);
  assert(career.world.clubs.every(team=>!team.ledger.some(row=>row.id.endsWith(':salary'))),'Gehälter erst am Saisonende');
 }
 if(career.world.calendarCursor===214){
  const europe=call('v62Current',career).find(item=>item.type==='europe'),winner=call('v66Club',career,europe.winnerId);
  if(!winner.simulationOnly)assert(winner.ledger.some(row=>row.id.endsWith(':europe-prize:winner')&&row.day===214));
 }
}
assert.equal(call('v61ValidateCareer',career),true);
const europe=call('v62Current',career).find(item=>item.type==='europe');
for(const team of career.world.clubs){
 if(team.simulationOnly){assert.equal(team.ledger.length,0);assert.equal(team.balance,0);continue}
 const rows=team.ledger.filter(row=>row.season===1),cup=call('v62Current',career).find(item=>item.type==='cup'&&item.country===team.countryId),rounds=cup.fixtures.filter(item=>item.homeId===team.id||item.awayId===team.id).map(item=>item.round);
 const cupExpected=rounds.includes('F')?(cup.winnerId===team.id?270:150):rounds.includes('SF')?90:40;
 assert.equal(rows.filter(row=>row.id.includes(':cup-prize:')).reduce((sum,row)=>sum+row.amount,0),cupExpected,team.id);
 const matches=europe.fixtures.filter(item=>item.homeId===team.id||item.awayId===team.id);
 assert.equal(rows.filter(row=>row.id.includes(':europe-prize')).reduce((sum,row)=>sum+row.amount,0),matches.length*42+(europe.winnerId===team.id?350:0),team.id);
 assert(!rows.some(row=>row.id===`S1:${team.id}:cup-prize`||row.id===`S1:${team.id}:europe-prize`));
 assert.equal(rows.find(row=>row.id.endsWith(':salary')).day,224);
 assert.equal(new Set(rows.map(row=>row.id)).size,rows.length);
 if(team.id!==club.id)assert(team.balance>=0);
 // Late free signings may alter wages; every paid salary must at least be a finite whole amount.
 assert(Number.isInteger(rows.find(row=>row.id.endsWith(':salary')).amount));
}
const snapshot=JSON.stringify(career);call('v66SeasonEnd',career);call('v62AdvanceDay',career);
for(const fixture of call('v62Fixtures',career))call('v66AfterFixture',career,fixture);
assert.equal(JSON.stringify(career),snapshot,'Abschluss und Prämien bleiben nach Wiederholung unverändert');
const simulationClub=passive[0],retiring=simulationClub.roster[0],survivor=simulationClub.roster[1];
retiring.age=retiring.retirementAge-1;survivor.age=25;
const retirePid=retiring.pid,survivorPid=survivor.pid,retireGames=retiring.history.length,retireHonours=JSON.stringify(retiring.honours);
modern.next(career);
assert(!simulationClub.roster.some(player=>player.pid===retirePid));
assert.equal(simulationClub.roster[0].line,retiring.line);assert.equal(simulationClub.roster[0].n,retiring.n);
assert.equal(simulationClub.roster[0].keeper,true);assert(simulationClub.roster[0].age>=18&&simulationClub.roster[0].age<=23);
assert(simulationClub.roster.some(player=>player.pid===survivorPid),'Nicht ausgeschiedene Spieler bleiben erhalten');
const archived=call('v66Player',career,retirePid);assert.equal(archived.retiredSeason,1);assert.equal(JSON.stringify(archived.honours),retireHonours);
assert.equal(archived.seasons.filter(row=>row.season===1).reduce((sum,row)=>sum+row.games,0),retireGames);
assert(!career.world.market.freePlayers.some(player=>player.pid===retirePid));
assert(!career.world.transfers.some(row=>passive.some(team=>team.id===row.buyerId||team.id===row.sellerId)));
for(const team of passive){assert.equal(team.roster.length,11);assert.equal(team.balance,0);assert.equal(team.ledger.length,0)}
assert.equal(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true);
assert.equal(career.world.season,2);
assert(!club.ledger.some(row=>row.season===2&&row.id.endsWith(':youth-budget')));
call('v66ChooseSponsor',career,club.id,club.sponsors[0].id);call('v124SetYouthBudget',career,0);
assert.equal(club.youthBudget,0);assert.equal(club.youthInvestmentHistory.filter(item=>item.season===2).length,1);
// Existing careers are loaded without a marker and retain their original events and workflow.
let old=legacy.call('v61CreateCareer','GER-2','legacy-payment-regression');
const oldBefore=JSON.stringify(old);old=JSON.parse(oldBefore);
assert.equal(call('v61ValidateCareer',old),true);assert.equal(JSON.stringify(old),oldBefore);
assert.equal(old.world.paymentSchedule,undefined);
call('v66ChooseSponsor',old,'GER-2',old.world.clubs.find(item=>item.id==='GER-2').sponsors[0].id);
assert.equal(old.world.market.phase,'open');
while(old.world.market.phase==='open')call('v66NextMarketDay',old);
while(!old.world.seasonFinished)call('v62AdvanceDay',old);
assert(old.world.clubs.every(team=>team.ledger.some(row=>row.id===`S1:${team.id}:cup-prize`&&row.day===224)));
assert(old.world.clubs.every(team=>!team.ledger.some(row=>row.id.includes(':cup-prize:'))));
console.log('Zahlungszeitpunkte, Jugendbudgetfolge, Gehaltsfälligkeit, reine Simulationsteams, Kaderfortführung, Karriereenden mit Statistikarchiv, Transfersperren und bestehende Karrieren geprüft.');
