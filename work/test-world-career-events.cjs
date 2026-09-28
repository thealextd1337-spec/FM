const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let serial=0;
const stored=new Map(),context=vm.createContext({crypto:{randomUUID:()=>`events-${++serial}`},localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
for(const file of ['world-economy-v66.js','world-youth-manager-v67.js','world-transfer-list-v72.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const call=(name,...args)=>vm.runInContext(name,context)(...args),copy=value=>JSON.parse(JSON.stringify(value));
const career=call('v61CreateCareer','GER-2','career-events');
const own=call('v66Club',career,'GER-2'),contract=career.world.contracts.find(item=>item.clubId===own.id&&item.endSeason===1);
const before=copy(contract);
call('v66Renew',career,contract.pid,10000,3,4);
assert(career.world.careerEvents?.events.some(event=>event.type==='renewal'&&event.pid===contract.pid),'accepted renewals must be recorded');
const history=(save=career,filters={})=>call('v66CareerHistory',save,filters);
const renewal=history(career,{pid:contract.pid}).events[0];
assert.equal(renewal.before.annual,before.annual);assert.equal(renewal.before.endSeason,1);
assert.equal(renewal.after.annual,10000);assert.equal(renewal.after.endSeason,3);assert.equal(renewal.after.promise,4);
contract.annual=before.annual; // Keep the season fixture affordable; stored snapshots must not change.
assert.equal(renewal.after.annual,10000);
assert.equal(history().coverage.status,'complete');
assert.equal(history().events.filter(event=>event.type==='free-agent-entry').length,10);
const beforeGeneration=JSON.stringify(career);call('v66NewFreeAgents',career);assert.equal(JSON.stringify(career),beforeGeneration,'generating candidates alone is not a confirmed market entry');
assert.throws(()=>call('v66Renew',career,contract.pid,10000,3,4));
assert.equal(history(career,{type:'renewal'}).events.length,1);

const rejected=call('v61CreateCareer','GER-2','rejected-events'),rejectedContract=rejected.world.contracts.find(item=>item.clubId==='GER-2'&&item.endSeason===1);
assert.equal(call('v66Renew',rejected,rejectedContract.pid,60,2,1).accepted,false);
assert.equal(history(rejected,{type:'renewal'}).events.length,0,'counteroffers are not signed contracts');

function transfer(save,player,buyer,seller,fee,id){
 buyer.balance=100000;
 const bid={id,pid:player.pid,buyerId:buyer.id,sellerId:seller?.id||null,price:fee,annual:call('v66Salary',player),years:2,promise:2,placedDay:Math.max(0,save.world.calendarCursor),status:'pending'};
 call('v66Transfer',save,bid);return bid;
}
const marketCareer=call('v61CreateCareer','GER-2','transfer-events'),buyer=call('v66Club',marketCareer,'GER-2'),seller=call('v66Club',marketCareer,'ENG-1');
call('v66ChooseSponsor',marketCareer,buyer.id,buyer.sponsors[0].id);
const player=seller.roster.find(item=>!item.keeper),bid=transfer(marketCareer,player,buyer,seller,1230,'events:paid');
const afterTransfer=JSON.stringify(marketCareer);call('v66Transfer',marketCareer,bid);
assert.equal(JSON.stringify(marketCareer),afterTransfer,'replaying a completed transfer cannot duplicate roster, contract, money or event');
const zero=seller.roster.find(item=>!item.keeper);transfer(marketCareer,zero,buyer,seller,0,'events:zero');
const free=marketCareer.world.market.freePlayers.find(item=>!item.keeper),freeBid=transfer(marketCareer,free,buyer,null,0,'events:free');
const afterFree=JSON.stringify(marketCareer);call('v66Transfer',marketCareer,freeBid);assert.equal(JSON.stringify(marketCareer),afterFree);
const paidEvent=history(marketCareer,{pid:player.pid}).events[0],zeroEvent=history(marketCareer,{pid:zero.pid}).events[0];
assert.equal(paidEvent.kind,'paid-transfer');assert.equal(paidEvent.fee,1230);assert.equal(paidEvent.currency,'credits');
assert.equal(zeroEvent.kind,'zero-fee-transfer');assert.equal(zeroEvent.previouslyFree,false);
const freeHistory=history(marketCareer,{pid:free.pid});
assert.equal(freeHistory.events.at(-1).kind,'free-agent-signing');assert.equal(freeHistory.freePeriods[0].durationSimulationDays,0);
assert.equal(freeHistory.freePeriods[0].status,'closed');
assert.equal(history(marketCareer,{clubId:buyer.id,season:1}).summary.expense,1230);
assert.equal(history(marketCareer,{clubId:seller.id,season:1}).summary.income,1230);
assert.equal(history(marketCareer,{clubId:seller.id}).summary.outgoing,2);
assert.equal(history(marketCareer,{clubId:buyer.id}).summary.incoming,3);
assert.equal(history(marketCareer,{season:2}).events.length,0);
assert.equal(call('v61ValidateCareer',marketCareer),true);
const immutable=JSON.stringify(marketCareer),queried=history(marketCareer);
queried.events[0].playerName='changed';queried.coverage.fromStart=false;
assert.equal(JSON.stringify(marketCareer),immutable,'queries return detached copies and never mutate saves');

const legacy=copy(marketCareer);delete legacy.world.careerEvents;
const legacyBefore=JSON.stringify(legacy);assert.equal(history(legacy).coverage.status,'not-recorded');
assert.equal(JSON.stringify(legacy),legacyBefore,'reading older careers must not create history');
assert.equal(call('v61ValidateCareer',legacy),true);
call('v66Transfer',legacy,bid);assert.equal(JSON.stringify(legacy),legacyBefore,'replay does not reconstruct an old event');
const legacyBuyer=call('v66Club',legacy,'ITA-1'),legacyFree=legacy.world.market.freePlayers.find(item=>!item.keeper);
transfer(legacy,legacyFree,legacyBuyer,null,0,'events:legacy-free');
assert.equal(history(legacy).coverage.status,'partial');assert.equal(history(legacy).events.length,1);
assert.equal(history(legacy).freePeriods[0].status,'start-not-recorded');
assert.equal(history(legacy).freePeriods[0].durationSimulationDays,null);

const youth=call('v61CreateCareer','GER-2','youth-events'),youthClub=call('v66Club',youth,'GER-2'),released=youthClub.youthPool[0],promoted=youthClub.youthPool[1];
youthClub.balance=100000;
call('v67ReleaseYouth',youth,youthClub.id,released.pid);call('v67Promote',youth,youthClub.id,promoted.pid);
assert.equal(history(youth,{pid:released.pid}).events[0].type,'youth-release');
assert.equal(history(youth,{pid:released.pid}).freePeriods[0].status,'open');
assert(history(youth,{pid:promoted.pid}).summary.youthCompensation>0);
assert.equal(history(youth,{pid:promoted.pid}).summary.incoming,1,'youth promotion is a professional roster arrival');
assert.equal(history(youth,{pid:promoted.pid}).summary.transferFees,0);
assert.throws(()=>call('v67Promote',youth,youthClub.id,promoted.pid));
assert.equal(history(youth,{pid:promoted.pid}).events.length,1);
const keeper=youthClub.roster.find(item=>item.keeper);call('v66ReleaseKeeper',youth,youthClub,keeper);
const releasedOnce=JSON.stringify(youth);call('v66ReleaseKeeper',youth,youthClub,keeper);assert.equal(JSON.stringify(youth),releasedOnce);
assert.equal(history(youth,{pid:keeper.pid}).events[0].reason,'release');
youth.world.calendarCursor=10;youth.world.market.phase='closed';
const keeperBuyer=call('v66Club',youth,'ITA-1');
transfer(youth,keeper,keeperBuyer,null,0,'events:released-signing');
assert.equal(history(youth,{pid:keeper.pid}).freePeriods[0].durationSimulationDays,11,'closed-market transfer uses its actual completion day');
assert.equal(history(youth,{pid:keeper.pid}).events.at(-1).previouslyFree,true);
youth.world.season=2;youth.world.calendarCursor=224;
call('v67SeasonEnd',youth);
assert.equal(history(youth,{pid:released.pid}).events.at(-1).type,'retirement');
assert.equal(history(youth,{pid:released.pid}).freePeriods[0].durationSimulationDays,449);
assert(history(youth,{type:'youth-expiry'}).events.length>0);
assert.equal(history(youth,{type:'youth-expiry'}).summary.contractExpirations,0);
const endOnce=JSON.stringify(youth.world.careerEvents);call('v67SeasonEnd',youth);assert.equal(JSON.stringify(youth.world.careerEvents),endOnce);
const pool=call('v61CreateCareer','GER-2','pool-events'),leaving=pool.world.market.freePlayers[0];
pool.world.season=5;pool.world.calendarCursor=-1;call('v66StartSeason',pool);
assert.equal(history(pool,{pid:leaving.pid}).events.at(-1).type,'pool-exit');
assert.equal(history(pool,{pid:leaving.pid}).freePeriods[0].durationSimulationDays,900);

// Complete a real season: automatic renewals and expirations share the same history.
call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);
while(career.world.market.phase!=='closed')call('v66NextMarketDay',career);
while(!career.world.seasonFinished)call('v62AdvanceDay',career);
assert.equal(call('v61ValidateCareer',career),true);
const seasonHistory=history();
assert(seasonHistory.events.some(event=>event.type==='renewal'&&event.clubId!==own.id&&event.effectiveFrom.season===2));
assert(seasonHistory.events.some(event=>event.type==='free-agent'&&event.reason==='contract-expiry'));
const finalized=JSON.stringify(career);call('v66SeasonEnd',career);assert.equal(JSON.stringify(career),finalized);
assert.equal(new Set(seasonHistory.events.map(event=>event.id)).size,seasonHistory.events.length);
assert.deepEqual(copy(seasonHistory.events.map(event=>event.sequence)),Array.from({length:seasonHistory.events.length},(_,index)=>index+1));
for(const mutate of [save=>save.world.careerEvents.events.push(copy(save.world.careerEvents.events[0])),save=>save.world.careerEvents.events[0].day=-1,save=>save.world.careerEvents.version=99,save=>save.world.careerEvents.events.find(event=>event.type==='renewal').after.annual=-1]){
 const invalid=copy(career);mutate(invalid);assert.equal(call('v61ValidateCareer',invalid),false,'corrupt history is rejected');
}
(async()=>{
 await call('v61StoreNewCareer',career);
 const exported=await call('v61ExportCareerData',career.id),imported=await call('v61ImportCareerData',copy(exported));
 assert.deepEqual(copy(imported.world.careerEvents),copy(career.world.careerEvents));
 assert.deepEqual(copy(history(imported)),copy(history(career)));
 const persisted=JSON.stringify(imported);call('v66SeasonEnd',imported);assert.equal(JSON.stringify(imported),persisted,'reloaded season cannot record twice');
 console.log(`Career events: renewals, transfers, free agency, youth, idempotence, partial coverage, validation and export/import passed (${seasonHistory.events.length} events).`);
})().catch(error=>{console.error(error);process.exitCode=1});
