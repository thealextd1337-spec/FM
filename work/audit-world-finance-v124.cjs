const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto'),{harness}=require('./world-finance-harness-v124.cjs');
const seeds=Number(process.env.DOPPEL_FINANCE_SEEDS||6),seasons=Number(process.env.DOPPEL_FINANCE_SEASONS||10);
assert(Number.isInteger(seeds)&&seeds>0&&Number.isInteger(seasons)&&seasons>0);
const output=path.resolve('outputs/finance-v124');fs.mkdirSync(output,{recursive:true});
const rows=[],cases=[],checks={clubSeasons:0,economicClubSeasons:0,simulationClubSeasons:0,simulationReplacements:0,fixtures:0,duplicateBookings:0,negativeAiClosings:0,invalidCareers:0};
const categories=['base','sponsorFixed','sponsorBonus','league','cup','europe','matchCredits','sales','purchases','salaries','youthBudget','youthPromotion'];
function category(row){
 const id=row.id;
 if(id.endsWith(':base'))return'base';
 if(id.endsWith(':fixed'))return'sponsorFixed';
 if(id.includes(':bonus:'))return'sponsorBonus';
 if(id.endsWith(':league-prize'))return'league';
 if(id.includes(':cup-prize'))return'cup';
 if(id.includes(':europe-prize'))return'europe';
 if(id.endsWith(':match-credit'))return'matchCredits';
 if(id.endsWith(':sale'))return'sales';
 if(id.endsWith(':buy'))return row.amount===0?null:'purchases';
 if(id.endsWith(':salary'))return'salaries';
 if(id.endsWith(':youth-budget'))return'youthBudget';
 if(id.endsWith(':youth-promotion'))return'youthPromotion';
 if(row.amount===0)return null;
 throw Error(`Unbekannte Finanzbuchung: ${id}, ${row.amount}`);
}
for(const variant of ['previous','new']){
 const modern=variant==='new',{call,market,next}=harness(modern);
 for(let seed=1;seed<=seeds;seed++){
  const career=call('v61CreateCareer','GER-2',`finance-v124-${seed}`),caseMap=new Map();
  for(const club of career.world.clubs){
   const record={key:`${variant}:${seed}:${club.id}`,variant,seed,clubId:club.id,name:club.name,country:club.countryId,kind:club.leagueId?'league':'cup',managed:club.id===career.manager.managedClubId,europeSeasons:0,initialBalance:club.balance-club.ledger.filter(item=>item.season===1).reduce((sum,item)=>sum+item.amount,0)};
   record.simulationOnly=Boolean(club.simulationOnly);cases.push(record);caseMap.set(club.id,record);
  }
  for(let season=1;season<=seasons;season++){
   const opening=new Map(career.world.clubs.map(club=>[club.id,club.balance-club.ledger.filter(item=>item.season===season).reduce((sum,item)=>sum+item.amount,0)]));
   const lows=new Map(career.world.clubs.map(club=>[club.id,Math.min(opening.get(club.id),club.balance)]));
   const checkBalances=()=>{for(const club of career.world.clubs)lows.set(club.id,Math.min(lows.get(club.id),club.balance))};
   market(career);checkBalances();
   assert.equal(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true);
   const salaryBefore=new Map(career.world.clubs.map(club=>[club.id,call('v66SalaryDue',career,club.id)]));
   let steps=0;
   while(!career.world.seasonFinished){
    try{call('v62AdvanceDay',career)}catch(error){throw Error(`${variant}, Seed ${seed}, Saison ${season}, Tag ${career.world.calendarCursor}: ${error.message}`,{cause:error})}
    checkBalances();assert(++steps<100,'Saisonfortschritt hängt');
   }
   assert.equal(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true);
   const competitions=call('v62Current',career),europe=competitions.find(item=>item.type==='europe'),fixtures=competitions.flatMap(item=>item.fixtures);
   assert.equal(fixtures.length,259);assert(fixtures.every(item=>item.result));checks.fixtures+=fixtures.length;
   for(const club of career.world.clubs){
    const record=caseMap.get(club.id),books=club.ledger.filter(item=>item.season===season),count=new Set(books.map(item=>item.id)).size;
    assert.equal(count,books.length,`Doppelte Buchung ${record.key}`);
    const amounts=Object.fromEntries(categories.map(key=>[key,0]));
    for(const book of books){const key=category(book);if(key)amounts[key]+=Math.abs(book.amount)}
    const income=books.filter(item=>item.amount>0).reduce((sum,item)=>sum+item.amount,0),expense=-books.filter(item=>item.amount<0).reduce((sum,item)=>sum+item.amount,0);
    assert.equal(club.balance,opening.get(club.id)+income-expense,`Kassenabgleich ${record.key}`);
    const games=europe.fixtures.filter(item=>item.homeId===club.id||item.awayId===club.id),europeParticipant=games.length>0;
    if(europeParticipant)record.europeSeasons++;
    assert.equal(amounts.europe,club.simulationOnly?0:games.length*42+(europe.winnerId===club.id?350:0));
    const cup=competitions.find(item=>item.type==='cup'&&item.country===club.countryId),rounds=cup.fixtures.filter(item=>item.homeId===club.id||item.awayId===club.id).map(item=>item.round);
    assert.equal(amounts.cup,club.simulationOnly?0:rounds.includes('F')?(cup.winnerId===club.id?270:150):rounds.includes('SF')?90:40);
    if(club.simulationOnly){
     assert.equal(club.balance,0);assert.equal(books.length,0);assert.equal(club.roster.length,11);assert.equal(club.youthPool.length,0);assert.equal(club.youthInvestmentHistory.length,0);
     assert(!career.world.transfers.some(item=>item.buyerId===club.id||item.sellerId===club.id));
     assert(!career.world.market.pendingBids.some(item=>item.buyerId===club.id||item.sellerId===club.id));
     assert(!career.world.market.saleListings.some(item=>item.sellerId===club.id));
     checks.simulationClubSeasons++;
    }else checks.economicClubSeasons++;
    let rank=null;
    if(club.leagueId){const league=competitions.find(item=>item.type==='league'&&item.country===club.countryId),ids=career.world.clubs.filter(item=>item.leagueId===club.leagueId).map(item=>item.id);rank=call('v62Table',league,ids).findIndex(item=>item.clubId===club.id)+1;assert.equal(amounts.league,[560,430,330,250,190,140][rank-1])}
    if(modern){
     for(const book of books){
      if(book.id.endsWith(':league-prize'))assert.equal(book.day,196);
      if(book.id.endsWith(':salary')||book.id.includes(':bonus:'))assert.equal(book.day,224);
      if(book.id.includes(':cup-prize:'))assert.equal(book.day,book.id.endsWith(':winner')?193:book.id.endsWith(':F')?144:95);
      if(book.id.includes(':europe-prize')){const game=games.find(item=>book.id.startsWith(item.id+':'));assert.equal(book.day,game?.day??214)}
     }
     const sponsorIndex=books.findIndex(item=>item.id.endsWith(':fixed')),budgetIndex=books.findIndex(item=>item.id.endsWith(':youth-budget'));
     if(budgetIndex>=0)assert(sponsorIndex>=0&&sponsorIndex<budgetIndex,'Sponsor vor Jugendbudget');
    }
    if(!record.managed)assert(club.balance>=0,`Neue KI-Schulden ${record.key}`);
    const withoutEurope=amounts.base+amounts.sponsorFixed+amounts.sponsorBonus+amounts.league+amounts.cup+amounts.matchCredits;
    rows.push({key:record.key,variant,seed,season,clubId:club.id,name:club.name,country:club.countryId,kind:record.kind,managed:record.managed,rank,europeParticipant,europeGames:games.length,openingBalance:opening.get(club.id),closingBalance:club.balance,minObservedBalance:lows.get(club.id),income,expense,net:income-expense,operatingWithoutEurope:withoutEurope-amounts.salaries-amounts.youthBudget,netWithoutEurope:income-expense-amounts.europe,roster:club.roster.length,salaryBeforeMatches:salaryBefore.get(club.id),...amounts});
    rows.at(-1).simulationOnly=Boolean(club.simulationOnly);rows.at(-1).youthPromotions=books.filter(item=>item.id.endsWith(':youth-promotion')).length;checks.clubSeasons++;
   }
   const before=JSON.stringify(career);call('v66SeasonEnd',career);call('v62AdvanceDay',career);assert.equal(JSON.stringify(career),before,'Abschluss doppelt verbucht');
   if(season<seasons)next(career);
  }
  checks.simulationReplacements+=career.world.clubs.reduce((sum,club)=>sum+(club.retiredPlayers?.length||0),0);
  console.log(`${variant}: Welt ${seed}/${seeds}, ${seasons} Saisonen geprüft.`);
 }
}
for(const row of rows)row.europeSeasons=cases.find(item=>item.key===row.key).europeSeasons;
const average=values=>values.reduce((sum,value)=>sum+value,0)/values.length;
const median=values=>{values=[...values].sort((a,b)=>a-b);const index=Math.floor(values.length/2);return values.length%2?values[index]:(values[index-1]+values[index])/2};
const summarize=(variant,filter)=>{
 const members=cases.filter(item=>item.variant===variant&&!item.managed&&!item.simulationOnly&&filter(item)),keys=new Set(members.map(item=>item.key)),annual=rows.filter(row=>keys.has(row.key));
 return{cases:members.length,distinctClubs:new Set(members.map(item=>item.clubId)).size,initialAverage:members.length?average(members.map(item=>item.initialBalance)):null,bySeason:Array.from({length:seasons},(_,index)=>{
  const items=annual.filter(row=>row.season===index+1);if(!items.length)return{season:index+1,count:0};
  return{season:index+1,count:items.length,averageBalance:average(items.map(item=>item.closingBalance)),medianBalance:median(items.map(item=>item.closingBalance)),minBalance:Math.min(...items.map(item=>item.closingBalance)),maxBalance:Math.max(...items.map(item=>item.closingBalance)),averageIncome:average(items.map(item=>item.income)),averageExpense:average(items.map(item=>item.expense)),averageNet:average(items.map(item=>item.net)),averageOperatingWithoutEurope:average(items.map(item=>item.operatingWithoutEurope)),lossCases:items.filter(item=>item.net<0).length,...Object.fromEntries(categories.map(key=>[key,average(items.map(item=>item[key]))]))};
 })};
};
const groups=Object.fromEntries(['previous','new'].map(variant=>[variant,{neverEuropeLeague:summarize(variant,item=>item.kind==='league'&&item.europeSeasons===0),everEuropeLeague:summarize(variant,item=>item.kind==='league'&&item.europeSeasons>0),cupOnly:summarize(variant,item=>item.kind==='cup'),neverEuropeCup:summarize(variant,item=>item.kind==='cup'&&item.europeSeasons===0)}]));
const files=['dist/world-economy-v66.js','dist/world-payments-v124.js','dist/world-youth-manager-v67.js','dist/world-transfer-list-v72.js','dist/world-competition-v62.js','dist/world-match-v64.js','dist/world-foundation-v61.js'];
const report={createdAt:new Date().toISOString(),seeds,seasons,managedClubId:'GER-2',method:'Deterministische Welt-KI, sechs feste Seeds; eigener Verein mit Sponsor 1, 200 Credits Nachwuchsbudget und Mindestkader-Ergänzungen. Eigene Partien werden mit der Welt-KI simuliert. Keine Live-Match-Engine, keine erzwungene Nichtqualifikation, keine künstlichen Geldzuflüsse. Der menschliche Verein bleibt aus KI-Gruppenvergleichen ausgeschlossen.',comparison:'Gleiche Welt-Seeds, bisheriger Ablauf gegen neuen Zahlungsplan. Früheres Geld kann KI-Entscheidungen und sportliche Erfolge verändern. Neue Karrieren zahlen außerdem das erste Jugendjahresbudget. Gruppen ohne Europacup werden je Ablauf separat anhand tatsächlich gespielter zehn Saisonen gebildet; das ist kein isolierter Kausaltest der Europacupteilnahme.',checks,sourceHashes:Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),groups,cases,rows};
report.comparison+=' Zwölf reine Pokalvereine haben im neuen Ablauf keine Vereinswirtschaft und werden aus Finanzmitteln ausgeschlossen. Sie behalten ihre Kader; Karriereenden zwischen 33 und 38 Jahren werden positionsgleich ersetzt. Im bisherigen Ablauf wirtschaften diese Vereine noch und nehmen am Markt teil. Der Vergleich umfasst deshalb auch die veränderten Marktteilnehmer.';
fs.writeFileSync(path.join(output,'finance-data.json'),JSON.stringify(report));
const columns=Object.keys(rows[0]),cell=value=>`"${String(value??'').replaceAll('"','""')}"`;
fs.writeFileSync(path.join(output,'finance-clubs.csv'),'\uFEFF'+[columns.join(';'),...rows.map(row=>columns.map(key=>cell(row[key])).join(';'))].join('\r\n'));
console.log(JSON.stringify({checks,newGroups:Object.fromEntries(Object.entries(groups.new).map(([key,group])=>[key,{cases:group.cases,initial:group.initialAverage,final:group.bySeason.at(-1)}]))},null,2));
