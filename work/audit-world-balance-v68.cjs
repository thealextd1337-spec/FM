const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const {performance}=require('perf_hooks');

let nextId=0;
const context=vm.createContext({crypto:{randomUUID:()=>`audit-${++nextId}`}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
for(const file of ['world-economy-v66.js','world-youth-manager-v67.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const call=(name,...args)=>vm.runInContext(name,context)(...args);
const seedCount=Number(process.env.DOPPEL_BALANCE_SEEDS||6),seasons=Number(process.env.DOPPEL_BALANCE_SEASONS||10),startSeed=Number(process.env.DOPPEL_BALANCE_START_SEED||1);
assert(Number.isInteger(seedCount)&&seedCount>0&&Number.isInteger(seasons)&&seasons>0&&Number.isInteger(startSeed)&&startSeed>0);
const metrics={seeds:seedCount,seasons,leagueTitles:new Map(),clubRanks:new Map(),titleTiers:[0,0,0],rankDistance:0,leagueRows:0,longestTitleRun:0,longestTitleClub:null,cupOnlyWinners:0,coachDismissals:0,coachRetirements:0,naturalOffers:0,transferSignings:0,transferFees:0,youthMinutes:0,rosterMin:Infinity,rosterMax:0,lowestAiBalance:Infinity,maxSalaryShare:0,qualityRatios:[],lastSeasonRatios:[],seasonRatios:new Map(),finalGroups:{league:[],cup:[]},saveMaxBytes:0,maxStepMs:0};
const titleRuns=new Map();
function assertUniqueEvents(career){
 const fixtures=call('v62Current',career).flatMap(item=>item.fixtures),played=fixtures.filter(item=>item.result).map(item=>item.id);
 assert.strictEqual(new Set(played).size,played.length,'doppelte gespielte Partie');
 const processed=career.world.eventLog.processedEventIds;
 assert.strictEqual(new Set(processed).size,processed.length,'doppelte Matchbuchung');
 assert(played.every(id=>processed.includes(id)),'gespielte Partie ohne Ereignisbuchung');
 for(const fixture of fixtures.filter(item=>item.result)){
  assert(fixture.plan,'gespielte Partie ohne Aufstellung');
  const ids=[...fixture.plan.home.starters,...fixture.plan.away.starters];
  assert.strictEqual(fixture.plan.home.starters.length,6,'unvollständiges Heimteam');
  assert.strictEqual(fixture.plan.away.starters.length,6,'unvollständiges Auswärtsteam');
  assert.strictEqual(new Set(ids).size,12,'doppelter Spieler in der Startaufstellung');
 }
 for(const club of career.world.clubs){const ids=club.ledger.map(item=>item.id);assert.strictEqual(new Set(ids).size,ids.length,`doppelte Buchung bei ${club.id}`)}
 assert.strictEqual(new Set(career.world.contracts.map(item=>item.pid)).size,career.world.contracts.length,'doppelter Spielervertrag');
}
function prepareManagedMarket(career){
 const club=career.world.clubs.find(item=>item.id===career.manager.managedClubId);
 call('v66ChooseSponsor',career,club.id,club.sponsors[0].id);
 let guard=0;
 while(career.world.market.phase==='open'&&guard++<14){
  while(club.roster.length<10&&club.youthPool.length){try{call('v67Promote',career,club.id,club.youthPool[0].pid)}catch{break}}
  const pending=career.world.market.pendingBids.filter(item=>item.buyerId===club.id&&item.status==='pending'),pendingIds=new Set(pending.map(item=>item.pid));
  const keeperPending=()=>[...pendingIds].some(pid=>call('v66Player',career,pid)?.keeper);
  const missing=Math.max(0,10-club.roster.length-pending.length,!club.roster.some(item=>item.keeper)&&!keeperPending()?1:0);
  for(let index=0;index<missing;index++){
   const needKeeper=!club.roster.some(item=>item.keeper)&&!keeperPending();
   const player=career.world.market.freePlayers.filter(item=>(!needKeeper||item.keeper)&&!pendingIds.has(item.pid)&&!career.world.market.decisions.some(decision=>decision.pid===item.pid&&decision.buyerId===club.id&&['rejected','expired'].includes(decision.status))).sort((a,b)=>call('v66Salary',a)-call('v66Salary',b))[0];
   assert(player,`Saison ${career.world.season}: freier Spieler für Mindestkader`);
   call('v66MakeBid',career,club.id,player.pid,0,Math.max(100,Math.round(call('v66Salary',player)*1.25/10)*10),2,2);
   pendingIds.add(player.pid);
  }
  try{call('v66NextMarketDay',career)}catch(error){if(!/mindestens zehn Profis/.test(error.message))throw error}
 }
 assert.strictEqual(career.world.market.phase,'closed','Transferphase muss abschließen');
}
for(let index=0;index<seedCount;index++){
 const seedNumber=startSeed+index,career=call('v61CreateCareer','GER-2',`balance-v68-${seedNumber}`);
 for(let season=1;season<=seasons;season++){
  prepareManagedMarket(career);
  assert.strictEqual(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true,'Transferphase muss nach Neuladen gültig bleiben');
  const expectedRanks=new Map();
  for(const league of call('v62Current',career).filter(item=>item.type==='league')){
   const clubs=career.world.clubs.filter(club=>club.countryId===league.country&&club.leagueId);
   clubs.sort((a,b)=>call('v62Quality',b)-call('v62Quality',a)||a.id.localeCompare(b.id));
   clubs.forEach((club,rank)=>expectedRanks.set(club.id,rank));
  }
  for(const club of career.world.clubs){
   metrics.rosterMin=Math.min(metrics.rosterMin,club.roster.length);metrics.rosterMax=Math.max(metrics.rosterMax,club.roster.length);
   assert(club.roster.length>=10&&club.roster.length<=14&&club.roster.some(item=>item.keeper),`spielfähiger Kader vor Saisonspielen: ${club.id}`);
  }
  for(const [country] of vm.runInContext('v61Countries',context)){
   const league=career.world.clubs.filter(club=>club.countryId===country&&club.leagueId),cups=career.world.clubs.filter(club=>club.countryId===country&&!club.leagueId);
   const average=clubs=>clubs.reduce((sum,club)=>sum+call('v62Quality',club),0)/clubs.length;
   const ratio=average(cups)/average(league);
   if(!metrics.seasonRatios.has(season))metrics.seasonRatios.set(season,[]);
   metrics.seasonRatios.get(season).push(ratio);
   if(season===1)metrics.qualityRatios.push(ratio);
   if(season===seasons)metrics.lastSeasonRatios.push(ratio);
  }
  let steps=0;
  while(!career.world.seasonFinished){
   const start=performance.now();try{call('v62AdvanceDay',career)}catch(error){const broke=career.world.clubs.filter(club=>club.id!==career.manager.managedClubId&&club.balance<0).map(club=>({id:club.id,balance:club.balance,seasonEntries:club.ledger.filter(item=>item.season===season)}));throw Error(`Seed ${seedNumber}, Saison ${season}, Tag ${career.world.calendarCursor}: ${error.message}; ${JSON.stringify(broke)}`,{cause:error})}metrics.maxStepMs=Math.max(metrics.maxStepMs,performance.now()-start);
   if(++steps===3&&season===1){assert.strictEqual(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true,'laufende Saison muss nach Neuladen gültig bleiben');assertUniqueEvents(career)}
   assert(steps<100,'Saisonfortschritt ist steckengeblieben');
  }
  assert.strictEqual(call('v61ValidateCareer',career),true,`ungültige Karriere in Seed ${index+1}, Saison ${season}`);
  const fixtures=call('v62Current',career).flatMap(item=>item.fixtures),ids=fixtures.map(item=>item.id);
  assert.strictEqual(fixtures.length,259,'259 Pflichtspiele pro Saison');
  assert.strictEqual(new Set(ids).size,259,'eindeutige Spiel-IDs');
  assert(fixtures.every(item=>item.result),'alle Partien verbucht');
  const players=career.world.clubs.flatMap(item=>item.roster.map(player=>player.pid));
  assert.strictEqual(new Set(players).size,players.length,'kein Spieler in zwei Vereinen');
  assertUniqueEvents(career);
  const finished=JSON.parse(JSON.stringify(career));
  assert.strictEqual(call('v61ValidateCareer',finished),true,'Saisonabschluss muss nach Neuladen gültig bleiben');
  assert.strictEqual(call('v62AdvanceDay',finished).length,0,'abgeschlossene Saison darf nicht erneut verbucht werden');
  assert.strictEqual(JSON.stringify(finished),JSON.stringify(career),'Neuladen und erneuter Fortschritt dürfen den Abschluss nicht verändern');
  for(const club of career.world.clubs){
   if(club.id!==career.manager.managedClubId)metrics.lowestAiBalance=Math.min(metrics.lowestAiBalance,club.balance);
   const rows=club.ledger.filter(item=>item.season===season),income=rows.filter(item=>item.amount>0).reduce((sum,item)=>sum+item.amount,0),salary=-rows.filter(item=>item.id===`S${season}:${club.id}:salary`).reduce((sum,item)=>sum+item.amount,0);
   if(income>0)metrics.maxSalaryShare=Math.max(metrics.maxSalaryShare,salary/income);
   const signings=rows.filter(item=>item.id.startsWith(`S${season}:B`)&&item.id.endsWith(':buy'));
   metrics.transferSignings+=signings.length;metrics.transferFees-=signings.reduce((sum,item)=>sum+item.amount,0);
   if(season===seasons)metrics.finalGroups[club.leagueId?'league':'cup'].push({quality:call('v62Quality',club),balance:club.balance,annual:career.world.contracts.filter(item=>item.clubId===club.id).reduce((sum,item)=>sum+item.annual,0),youthBudget:club.youthBudget});
  }
  for(const league of call('v62Current',career).filter(item=>item.type==='league')){
   const clubs=career.world.clubs.filter(club=>club.countryId===league.country&&club.leagueId).map(club=>club.id),table=call('v62Table',league,clubs);
   table.forEach((row,rank)=>{metrics.rankDistance+=Math.abs(expectedRanks.get(row.clubId)-rank);metrics.leagueRows++;if(!metrics.clubRanks.has(row.clubId))metrics.clubRanks.set(row.clubId,[]);metrics.clubRanks.get(row.clubId).push({expected:expectedRanks.get(row.clubId)+1,actual:rank+1})});
   const winner=league.winnerId,expected=expectedRanks.get(winner);metrics.titleTiers[Math.floor(expected/2)]++;
   metrics.leagueTitles.set(winner,(metrics.leagueTitles.get(winner)||0)+1);
   const previous=titleRuns.get(`${index}:${league.country}`),run=previous?.winner===winner?previous.run+1:1;
   titleRuns.set(`${index}:${league.country}`,{winner,run});if(run>metrics.longestTitleRun){metrics.longestTitleRun=run;metrics.longestTitleClub=`Seed ${seedNumber}, ${winner}`}
  }
  const youthPids=new Set([...career.world.clubs.flatMap(club=>[...club.roster,...club.youthPool]),...career.world.market.freePlayers].filter(player=>Number.isInteger(player.discoveredSeason)).map(player=>player.pid));
  metrics.youthMinutes+=fixtures.flatMap(item=>item.matchRecord?.players||[]).filter(item=>youthPids.has(item.pid)).reduce((sum,item)=>sum+item.minutes,0);
  metrics.cupOnlyWinners+=call('v62Current',career).filter(item=>item.type==='cup'&&!career.world.clubs.find(club=>club.id===item.winnerId).leagueId).length;
  const dismissals=career.world.clubs.flatMap(club=>club.history.filter(item=>item.season===season&&item.type==='coach-dismissal'));
  const retirements=career.world.clubs.flatMap(club=>club.history.filter(item=>item.season===season&&item.type==='coach-retirement'));
  metrics.coachDismissals+=dismissals.length;metrics.coachRetirements+=retirements.length;
  metrics.naturalOffers+=career.world.transition.offers.length;
  metrics.saveMaxBytes=Math.max(metrics.saveMaxBytes,Buffer.byteLength(JSON.stringify(career),'utf8'));
  if(season<seasons){
   if(career.world.transition.choice===null)call('v67ChooseOffer',career,null);
   call('v67SetBudget',career,Math.min(200,Math.max(0,career.world.clubs.find(club=>club.id===career.manager.managedClubId).balance)));
   call('v62NextSeason',career);
  }
 }
}
assert(metrics.saveMaxBytes<10_000_000,'Spielstand überschreitet 10 MB');
assert(metrics.lowestAiBalance>=0,'KI-Verein gerät in ungedeckte Schulden');
const ratios=metrics.qualityRatios.sort((a,b)=>a-b),median=ratios[Math.floor(ratios.length/2)],lastRatios=metrics.lastSeasonRatios.sort((a,b)=>a-b);
if(seedCount>=6&&seasons>=5){assert(median>=.7&&median<=.8,'Pokalvereine sollen im Median 20–30 Prozent schwächer starten');assert(metrics.naturalOffers>0,'im Seed-Sweep muss ein echtes Stellenangebot entstehen')}
const groupAverage=group=>Object.fromEntries(['quality','balance','annual','youthBudget'].map(key=>[key,Number((group.reduce((sum,item)=>sum+item[key],0)/group.length).toFixed(1))]));
const round=value=>Number(value.toFixed(2)),medianOf=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)];
const byClub=[...metrics.clubRanks].map(([clubId,rows])=>{const average=rows.reduce((sum,row)=>sum+row.actual,0)/rows.length;return{clubId,titles:metrics.leagueTitles.get(clubId)||0,expectedRank:round(rows.reduce((sum,row)=>sum+row.expected,0)/rows.length),actualRank:round(average),rankVariance:round(rows.reduce((sum,row)=>sum+(row.actual-average)**2,0)/rows.length)}}).sort((a,b)=>b.titles-a.titles||a.clubId.localeCompare(b.clubId));
const qualityBySeason=Object.fromEntries([...metrics.seasonRatios].map(([season,values])=>[season,round(medianOf(values))]));
if(seedCount>=6&&seasons>=10)assert(Object.values(qualityBySeason).every(ratio=>ratio>=.68&&ratio<=.83),'Pokalabstand driftet über Saisons außerhalb des vereinbarten Bereichs');
console.log(JSON.stringify({seeds:metrics.seeds,seasons:metrics.seasons,leagueTitleClubs:metrics.leagueTitles.size,topTitleClubs:byClub.slice(0,6),rankVarianceMean:round(byClub.reduce((sum,item)=>sum+item.rankVariance,0)/byClub.length),titleByStartingStrength:{topTwo:metrics.titleTiers[0],middleTwo:metrics.titleTiers[1],bottomTwo:metrics.titleTiers[2]},meanRankDistance:round(metrics.rankDistance/metrics.leagueRows),longestTitleRun:metrics.longestTitleRun,longestTitleClub:metrics.longestTitleClub,cupOnlyWinners:metrics.cupOnlyWinners,coachDismissals:metrics.coachDismissals,coachRetirements:metrics.coachRetirements,naturalOffers:metrics.naturalOffers,transferSignings:metrics.transferSignings,transferFees:metrics.transferFees,youthMinutes:metrics.youthMinutes,rosterRange:[metrics.rosterMin,metrics.rosterMax],lowestAiBalance:metrics.lowestAiBalance,maxSalaryShare:round(metrics.maxSalaryShare),cupQualityRatio:{start:{min:round(ratios[0]),median:round(median),max:round(ratios.at(-1))},final:{min:round(lastRatios[0]),median:round(lastRatios[Math.floor(lastRatios.length/2)]),max:round(lastRatios.at(-1))},medianBySeason:qualityBySeason},finalClubAverages:{league:groupAverage(metrics.finalGroups.league),cup:groupAverage(metrics.finalGroups.cup)},saveMaxMB:round(metrics.saveMaxBytes/1_000_000),maxWorldStepMs:round(metrics.maxStepMs)},null,2));
