'use strict';

// Wirtschaft der neuen Vereinswelt. Alle Buchungen besitzen einen stabilen Schlüssel.
const v66SeasonDays=v62Days.seasonEnd+1;
const v66LeaguePrizes=[560,430,330,250,190,140];
const v66Sponsors=['Stadtwerke','Sportpartner','Reisepartner','Handelspartner','Medienpartner','Regionalpartner'];
// Fiktive Sponsorzeichen greifen die Farben des Landes auf, ohne Bilddateien im Spielstand abzulegen.
function v66SponsorLogoSVG(countryId,name){
 const colors={ENG:['#ffffff','#c8102e','#ffffff'],ESP:['#aa151b','#f1bf00','#aa151b'],ITA:['#008c45','#ffffff','#cd212a'],GER:['#171717','#dd0000','#ffce00'],FRA:['#164a9f','#ffffff','#ed2939'],POR:['#006f42','#e42535','#e42535']}[countryId]||['#c7f36b','#ffffff','#c7f36b'];
 const initials=String(name||'?').trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase();
 return`<svg class="v66-sponsor-logo" viewBox="0 0 64 44" aria-hidden="true" focusable="false"><rect width="64" height="44" rx="7" fill="#f5f5ef"/><path d="M3 3h58v12H3z" fill="${colors[0]}"/><path d="M3 16h58v12H3z" fill="${colors[1]}"/><path d="M3 29h58v12H3z" fill="${colors[2]}"/><rect x="17" y="6" width="30" height="32" rx="5" fill="#102126"/><text x="32" y="29" text-anchor="middle" fill="#fff" font-size="17" font-weight="800" font-family="Arial,sans-serif">${escapeHTML(initials)}</text></svg>`;
}
function v66BaseIncome(club){return 1410+club.policy.fans*105+(club.leagueId?0:100)}
function v66Club(career,id){return career.world.clubs.find(club=>club.id===id)}
function v66Contract(career,pid){return career.world.contracts.find(contract=>contract.pid===pid)}
function v66Owner(career,pid){return career.world.clubs.find(club=>club.roster.some(player=>player.pid===pid))||null}
function v66Player(career,pid){const owner=v66Owner(career,pid);return owner?.roster.find(player=>player.pid===pid)||career.world.market.freePlayers.find(player=>player.pid===pid)}
function v66Skill(player){return player.keeper?(player.gk*2+player.pos+player.air+player.pas)/5:(player.tec+player.pas+player.fin+player.tak+player.pos+player.spd+player.sta+player.air)/8}
function v66Salary(player){const strength=v66Skill(player),ageFactor=player.age<22?.88:player.age>31?.91:1,honours=typeof v74HonourFactor==='function'?v74HonourFactor(player):1;return Math.round((65+Math.pow(Math.max(0,strength-8),2)*5.2)*ageFactor*honours/10)*10}
function v66BaseValue(player){const ageFactor=player.age<23?1.35:player.age>31?.7:1;return Math.max(100,Math.round(v66Salary(player)*(2+Math.max(0,30-player.age)*.035)*ageFactor/10)*10)}
function v66Value(player){return player.marketValue||v66BaseValue(player)}
function v66RefreshMarketValues(career,checkpoint){
 const stamp=`S${career.world.season}:${checkpoint}`;
 for(const player of [...career.world.clubs.flatMap(club=>club.roster),...career.world.market.freePlayers]){
  if(player.marketValueStamp===stamp)continue;
  const form=Math.max(-2,Math.min(2,Number(player.form)||0));
  const target=v66BaseValue(player)*(form>=0?1+form*.09:1+form*.035);
  const previous=player.marketValue||v66BaseValue(player);
  player.marketValue=Math.max(100,Math.round((previous+(target-previous)*(target>=previous?.75:.3))/10)*10);
  player.marketValueStamp=stamp;
 }
}
function v66Book(career,clubId,id,amount,label){
 const club=v66Club(career,clubId);if(!club)throw Error('Verein nicht gefunden.');
 if(club.ledger.some(item=>item.id===id))return false;
 if(!Number.isFinite(amount))throw Error('Ungültiger Geldbetrag.');
 amount=Math.round(amount);club.balance+=amount;
 club.ledger.push({id,season:career.world.season,day:career.world.calendarCursor,amount,label});
 return true;
}
function v66MakeSponsors(career,club){
 const seed=`${career.world.seed}:S${career.world.season}:${club.id}:sponsor`,random=v61Random(seed),names=v62Shuffle(v66Sponsors,`${seed}:names`),fans=club.policy.fans,tradition=club.policy.tradition;
 return Array.from({length:3},(_,index)=>{
  const fixed=Math.round((340+fans*55+tradition*25+(random()-.5)*180)/10)*10;
  const leagueTarget=index===0?4:2,cupTarget=index===1?'SF':'F';
  const goals=club.leagueId?[
   {kind:'league',target:leagueTarget,bonus:Math.round((index===0?150:290+random()*100)/10)*10,label:`Liga: Platz ${leagueTarget} oder besser`},
   index===2?{kind:'goals',competition:`S${career.world.season}:${club.countryId}:LEAGUE`,target:11+club.policy.startingSquad,bonus:240,label:`Liga: mindestens ${11+club.policy.startingSquad} reguläre Tore`}:{kind:'cup',target:cupTarget,bonus:Math.round((140+random()*70)/10)*10,label:`Nationaler Pokal: ${cupTarget==='F'?'Finale':'Halbfinale'} erreichen`}
  ]:[{kind:'cup',target:'SF',bonus:180,label:'Nationaler Pokal: Halbfinale erreichen'},index===2?{kind:'goals',competition:`S${career.world.season}:${club.countryId}:CUP`,target:4,bonus:230,label:'Nationaler Pokal: mindestens 4 reguläre Tore'}:{kind:'cup',target:'F',bonus:260,label:'Nationaler Pokal: Finale erreichen'}];
  return{id:`S${career.world.season}:${club.id}:SP${index+1}`,name:names[index],fixed,goals};
 });
}
function v66NewFreeAgents(career){
 const season=career.world.season;
 const slotsByCountry=season===1?[[0,2],[4,8],[1,5],[0,9],[2],[6]]:[[0,2,7],[0,4,8],[0,1,5],[0,3,9],[0,2,6],[0,1,6]];
 return v61Countries.flatMap(([country],countryIndex)=>{
  const random=v61Random(`${career.world.seed}:S${season}:${country}:free-agents`),quality=2+Math.floor(random()*3),entry={id:`${country}-FREE-S${season}`,profile:[0,0,0,0,0,quality]};
  const roster=v61GenerateRoster(entry,career.world.seed);
  return slotsByCountry[countryIndex].map((index,slot)=>{const player=roster[index];player.pid=`${career.world.seed}:S${season}:${country}:FREE${slot+1}`;player.freeSinceSeason=season;return player});
 });
}
function v66CompactLedger(club,season){
 const recent=club.ledger.filter(item=>item.season>=season-1),older=club.ledger.filter(item=>item.season<season-1),totals=new Map();
 for(const item of older)totals.set(item.season,(totals.get(item.season)||0)+item.amount);
 club.ledger=[...[...totals].sort((a,b)=>a[0]-b[0]).map(([year,amount])=>({id:`S${year}:${club.id}:summary`,season:year,day:v62Days.seasonEnd,amount,label:`Saison ${year} · Finanzsaldo`})),...recent];
}
function v66StartSeason(career){
 const world=career.world,season=world.season;
 world.economyProcessedFixtures=[];
 world.market={phase:'sponsor',day:1,freePlayers:[...(world.market?.freePlayers||[]).filter(player=>!player.freeSinceSeason||season-player.freeSinceSeason<(player.youthReleasedSeason?2:4)),...v66NewFreeAgents(career)],pendingBids:[],decisions:[],nextBid:1,saleListings:[],negotiations:[],transferResults:[],nextNegotiation:1};
 v66RefreshMarketValues(career,'start');
 for(const club of world.clubs){
  v66CompactLedger(club,season);
  club.salaryDue=0;club.sponsors=v66MakeSponsors(career,club);club.sponsorId=null;
  for(const contract of world.contracts.filter(item=>item.clubId===club.id)){
   contract.startsAt=0;contract.promiseHits=0;contract.promisePenalty=0;contract.lastPromiseCheck=0;
  }
  v66Book(career,club.id,`S${season}:${club.id}:base`,v66BaseIncome(club),'Jahresgrundbetrag');
  if(club.id!==career.manager.managedClubId){
   const choice=[...club.sponsors].sort((a,b)=>(b.fixed+b.goals.reduce((sum,goal)=>sum+goal.bonus*(club.policy.risk/6),0))-(a.fixed+a.goals.reduce((sum,goal)=>sum+goal.bonus*(club.policy.risk/6),0)))[0];
   v66ChooseSponsor(career,club.id,choice.id);
  }
 }
 career.phase='world-sponsor';
}
function v66Init(career){
 const world=career.world;world.contracts=[];
 for(const club of world.clubs){
  const random=v61Random(`${world.seed}:${club.id}:finance`);
  club.balance=Math.round((1150+club.policy.fans*175+club.policy.tradition*100+(random()-.5)*260)/10)*10;
  club.salaryDue=0;club.restructuring=false;
  club.ledger=[];
  club.roster.forEach((player,index)=>{
   const years=index===7?1:[1,4,9].includes(index)?2:3;
   world.contracts.push({id:`S1:${player.pid}:initial`,pid:player.pid,clubId:club.id,annual:v66Salary(player),fromSeason:1,endSeason:years,startsAt:0,promise:club.leagueId?Math.min(6,2+Math.round(v66Skill(player)/5)):0,promiseHits:0,promisePenalty:0,lastPromiseCheck:0,renewalOffers:0});
  });
 }
 v66StartSeason(career);
}
function v66ChooseSponsor(career,clubId,offerId){
 const club=v66Club(career,clubId),offer=club?.sponsors?.find(item=>item.id===offerId);
 if(!offer||club.sponsorId)throw Error('Das Sponsorangebot ist nicht mehr wählbar.');
 club.sponsorId=offer.id;
 v66Book(career,clubId,`${offer.id}:fixed`,offer.fixed,`Sponsor ${offer.name}: Fixum`);
 if(clubId===career.manager.managedClubId){career.world.market.phase='open';career.phase='world-market';if(typeof v72OpenMarket==='function')v72OpenMarket(career);v66AiPropose(career)}
 return offer;
}
function v66SalaryDue(career,clubId,day=v66SeasonDays){
 if(career.world.seasonFinished)return 0;
 const club=v66Club(career,clubId),remaining=career.world.contracts.filter(item=>item.clubId===clubId).reduce((sum,item)=>sum+item.annual*Math.max(0,day-item.startsAt)/v66SeasonDays,0);
 return Math.round(club.salaryDue+remaining);
}
function v66SettleSection(career,contract,day){
 const club=v66Club(career,contract.clubId);
 club.salaryDue+=contract.annual*Math.max(0,day-contract.startsAt)/v66SeasonDays;
}
function v66CanAfford(career,clubId,price,annual){
 const club=v66Club(career,clubId),own=clubId===career.manager.managedClubId;
 if(!club||price>0&&(club.balance<price||club.restructuring))return false;
 if(club.restructuring&&price===0){
  if(club.roster.length>=10||annual>220)return false;
  if(own)return true;
 }
 if(own)return true;
 const projected=club.balance-price+v66LeaguePrizes[5]-(v66SalaryDue(career,clubId)+annual);
 return projected>=0;
}
function v66MakeBid(career,buyerId,pid,price,annual,years,promise=0,offerDay=null){
 const market=career.world.market,buyer=v66Club(career,buyerId),seller=v66Owner(career,pid),player=v66Player(career,pid);
 if(!(market.phase==='open'||market.phase==='closed'&&!seller&&!career.world.seasonFinished)||!player||!buyer||seller?.id===buyerId)throw Error('Dieses Angebot ist außerhalb der Transferphase nicht möglich.');
 if(buyer.roster.length>=14)throw Error('Der Kader hat bereits 14 Profis.');
 price=Number(price);annual=Number(annual);years=Number(years);promise=Number(promise);
 if(!Number.isInteger(price)||price<0||seller&&price===0||!Number.isInteger(annual)||annual<60||!Number.isInteger(years)||years<1||years>3||!Number.isInteger(promise)||promise<0||promise>10)throw Error('Preis, Gehalt oder Laufzeit sind ungültig.');
 if(!buyer.leagueId)promise=0;
 if(!v66CanAfford(career,buyerId,price,annual))throw Error('Der Verein kann dieses Angebot nicht finanzieren.');
 if(market.pendingBids.some(bid=>bid.buyerId===buyerId&&bid.pid===pid&&['pending','counter'].includes(bid.status)))throw Error('Für diesen Spieler besteht bereits ein Angebot.');
 const played=v62Fixtures(career).filter(fixture=>fixture.result).length;
 if(market.decisions.some(item=>item.buyerId===buyerId&&item.pid===pid&&item.season===career.world.season&&['rejected','expired'].includes(item.status)&&(seller||played<=item.atPlayed)))throw Error(seller?'Nach einer Ablehnung ist ein neues Angebot erst nächste Saison möglich.':'Eine neue Anfrage ist erst nach einem weiteren Matchtag möglich.');
 const placedDay=market.phase==='open'?market.day:offerDay??Math.max(0,career.world.calendarCursor);
 const bid={id:`S${career.world.season}:B${market.nextBid++}`,pid,buyerId,sellerId:seller?.id||null,price,annual,years,promise,placedDay,expiresDay:market.phase==='open'?Math.min(5,market.day+1):placedDay+1,status:'pending',improved:false};
 market.pendingBids.push(bid);return bid;
}
function v66ResolveFreeDecisions(career,day){
 const bids=career.world.market.pendingBids.filter(item=>item.status==='pending'&&!item.sellerId&&item.placedDay<day),groups=new Map();
 for(const bid of bids){if(!groups.has(bid.pid))groups.set(bid.pid,[]);groups.get(bid.pid).push(bid)}
 for(const offers of groups.values()){
  offers.sort((a,b)=>v66BidAppeal(career,b)-v66BidAppeal(career,a)||a.id.localeCompare(b.id));
  for(const bid of offers)if(v66TryBid(career,bid))break;
 }
}
function v66CloseBid(career,bid,status,reason){
 bid.status=status;bid.reason=reason||'';
 if(status==='rejected'||status==='expired')career.world.market.decisions.push({pid:bid.pid,buyerId:bid.buyerId,season:career.world.season,status,atPlayed:v62Fixtures(career).filter(fixture=>fixture.result).length});
}
function v66Consent(career,bid){
 const player=v66Player(career,bid.pid),buyer=v66Club(career,bid.buyerId),seller=bid.sellerId&&v66Club(career,bid.sellerId);
 const reference=v66Salary(player),attractiveness=(buyer.policy.tradition-buyer.policy.risk)*.02;
 const role=buyer.leagueId?(bid.promise>=5?-.04:bid.promise<=2?.08:0):0,term=(bid.years-1)*-.025;
 const minimum=Math.round(reference*(1.03-attractiveness+role+term+(seller&&seller.policy.tradition>buyer.policy.tradition?.05:0))/10)*10;
 return{accepted:bid.annual>=minimum,minimum};
}
function v66BidAppeal(career,bid){const club=v66Club(career,bid.buyerId);return bid.annual+bid.years*12+bid.promise*4+club.policy.tradition*5}
function v66Transfer(career,bid){
 const world=career.world,market=world.market,buyer=v66Club(career,bid.buyerId),seller=bid.sellerId&&v66Club(career,bid.sellerId),player=v66Player(career,bid.pid),old=v66Contract(career,bid.pid);
 if(!player||buyer.roster.length>=14||seller&&!seller.roster.some(item=>item.pid===bid.pid)||!v66CanAfford(career,buyer.id,bid.price,bid.annual))throw Error('Das Angebot ist inzwischen nicht mehr ausführbar.');
 const day=market.phase==='closed'?bid.placedDay+1:Math.max(0,world.calendarCursor),event=bid.id;
 if(seller){v66SettleSection(career,old,day);seller.roster=seller.roster.filter(item=>item.pid!==bid.pid);v66Book(career,seller.id,`${event}:sale`,bid.price,`Verkauf ${player.name}`)}
 else market.freePlayers=market.freePlayers.filter(item=>item.pid!==bid.pid);
 if(old)world.contracts=world.contracts.filter(item=>item.pid!==bid.pid);
 delete player.youthReleasedSeason;
 buyer.roster.push(player);
 v66Book(career,buyer.id,`${event}:buy`,-bid.price,seller?`Kauf ${player.name}`:`Verpflichtung ${player.name}`);
 world.contracts.push({id:`${event}:contract`,pid:player.pid,clubId:buyer.id,annual:bid.annual,fromSeason:world.season,endSeason:world.season+bid.years-1,startsAt:day,promise:buyer.leagueId?bid.promise:0,promiseHits:0,promisePenalty:0,lastPromiseCheck:0,renewalOffers:0});
 world.transfers.push({id:event,season:world.season,day,pid:player.pid,playerName:player.name,sellerId:seller?.id||null,buyerId:buyer.id,price:bid.price});
 v66CloseBid(career,bid,'completed',`${player.name} wechselt zu ${buyer.name}.`);
 if((buyer.id===career.manager.managedClubId||seller?.id===career.manager.managedClubId)&&!market.negotiations?.some(item=>item.id===bid.id))v66QueueLegacyResult(career,bid,'completed',bid.reason);
 for(const other of market.pendingBids.filter(item=>item!==bid&&item.pid===bid.pid&&['pending','counter'].includes(item.status))){
  v66CloseBid(career,other,'rejected','Der Spieler hat einen anderen Verein gewählt.');
  if(other.buyerId===career.manager.managedClubId&&!market.negotiations?.some(item=>item.id===other.id))v66QueueLegacyResult(career,{...other,buyerId:buyer.id,sellerId:seller?.id,price:bid.price},'lost',`${player.name} wechselt zu ${buyer.name}.`);
 }
 return player;
}
function v66QueueLegacyResult(career,bid,kind,message){
 const market=career.world.market,id=`${bid.id}:${kind}`;
 if(!Array.isArray(market.transferResults))market.transferResults=[];
 if(market.transferResults.some(item=>item.id===id))return;
 market.transferResults.push({id,negotiationId:bid.id,pid:bid.pid,buyerId:bid.buyerId,sellerId:bid.sellerId,kind,price:bid.price,message,day:market.day,released:false,seen:false});
}
function v66TryBid(career,bid){
 if(bid.status!=='pending')return false;
 const owner=v66Owner(career,bid.pid),player=v66Player(career,bid.pid);
 if(!player||(owner?.id||null)!==bid.sellerId){v66CloseBid(career,bid,'expired','Spieler nicht mehr verfügbar.');return false}
 const seller=owner,priceFloor=seller?Math.round(v66Value(player)*(seller.roster.length<=10?1.45:.9)):0;
 if(seller&&seller.id===career.manager.managedClubId&&!bid.sellerAccepted)return false;
 if(seller&&seller.id!==career.manager.managedClubId&&(seller.roster.length<=10||player.keeper&&seller.roster.filter(item=>item.keeper).length<=1||typeof v72CanCommitSale==='function'&&!v72CanCommitSale(career,seller.id,bid.pid))){v66CloseBid(career,bid,'rejected','Der Verein benötigt diesen Spieler für seinen Kader.');return false}
 if(seller&&seller.id!==career.manager.managedClubId&&!bid.sellerAccepted&&bid.price<priceFloor){v66CloseBid(career,bid,'rejected','Der Verein lehnt die Ablöse ab.');return false}
 if(!v66CanAfford(career,bid.buyerId,bid.price,bid.annual)){v66CloseBid(career,bid,'rejected','Das Angebot ist nicht mehr finanzierbar.');return false}
 const consent=v66Consent(career,bid);
 if(!consent.accepted){
  if(bid.buyerId!==career.manager.managedClubId&&!bid.improved){bid.annual=consent.minimum;bid.improved=true;return v66TryBid(career,bid)}
  if(bid.buyerId===career.manager.managedClubId&&!bid.improved){bid.status='counter';bid.counter=consent.minimum;bid.reason=`Der Spieler fordert mindestens ${consent.minimum} Credits Jahresgehalt.`;return false}
  v66CloseBid(career,bid,'rejected','Der Spieler lehnt den Vertrag ab.');return false;
 }
 try{v66Transfer(career,bid);return true}catch(error){v66CloseBid(career,bid,'rejected',error.message);return false}
}
function v66ImproveBid(career,id,annual){
 const bid=career.world.market.pendingBids.find(item=>item.id===id&&item.buyerId===career.manager.managedClubId&&item.status==='counter');
 if(!bid||career.world.seasonFinished||bid.sellerId&&career.world.market.phase!=='open'||bid.improved||!Number.isInteger(Number(annual))||Number(annual)<bid.counter)throw Error('Dieses Folgeangebot ist nicht gültig.');
 bid.annual=Number(annual);bid.improved=true;bid.status='pending';bid.reason='';
 v66TryBid(career,bid);return bid;
}
function v66RespondBid(career,id,accept){
 const bid=career.world.market.pendingBids.find(item=>item.id===id&&item.sellerId===career.manager.managedClubId&&item.status==='pending');
 if(!bid)throw Error('Das Angebot ist nicht mehr offen.');
 if(!accept){v66CloseBid(career,bid,'rejected','Angebot abgelehnt.');return bid}
 bid.sellerAccepted=true;v66TryBid(career,bid);return bid;
}
function v66AiPropose(career){
 const market=career.world.market;if(market.phase!=='open')return;
 const random=v61Random(`${career.world.seed}:S${career.world.season}:D${market.day}:ai-market`);
 const clubs=v62Shuffle(career.world.clubs.filter(club=>club.id!==career.manager.managedClubId),`${career.world.seed}:S${career.world.season}:D${market.day}:buyers`);
 for(const buyer of clubs){
  const needKeeper=!buyer.roster.some(player=>player.keeper);
  if(buyer.roster.length>=14||!needKeeper&&buyer.roster.length>=10&&random()>.12)continue;
  const desired=needKeeper?'gk':['gk','def','mid','att'].sort((a,b)=>buyer.roster.filter(item=>item.line===a).length-buyer.roster.filter(item=>item.line===b).length)[0];
  const free=market.freePlayers.filter(player=>player.line===desired),sellers=career.world.clubs.filter(club=>club.id!==buyer.id&&club.roster.length>10).flatMap(club=>club.roster.filter(player=>player.line===desired&&!market.saleListings?.some(listing=>listing.pid===player.pid&&listing.status==='active')).map(player=>({player,club})));
  const candidates=[...free.map(player=>({player,club:null})),...sellers];if(!candidates.length)continue;
  // Ligavereine suchen im stärkeren Teil des Markts und halten für die Saison Kostenreserve.
  const shortlist=buyer.leagueId?[...candidates].sort((a,b)=>v66Skill(b.player)-v66Skill(a.player)||a.player.pid.localeCompare(b.player.pid)).slice(0,Math.max(6,Math.ceil(candidates.length/3))):candidates;
  const candidate=shortlist[Math.floor(random()*shortlist.length)],price=candidate.club?Math.round(v66Value(candidate.player)*(1.02+random()*.4)/10)*10:0,annual=Math.round(v66Salary(candidate.player)*(1.02+random()*.2)/10)*10;
  if(!v66CanAfford(career,buyer.id,price,annual)||buyer.leagueId&&buyer.balance-price+v66LeaguePrizes[5]-v66SalaryDue(career,buyer.id)-annual<600)continue;
  try{v66MakeBid(career,buyer.id,candidate.player.pid,price,annual,2+Math.floor(random()*2),buyer.leagueId?3:0)}catch{}
 }
}
function v66ResolveDay(career){
 const market=career.world.market,day=market.day,groups=new Map();
 for(const bid of market.pendingBids.filter(item=>item.status==='pending'&&item.placedDay<=day)){
  if(!groups.has(bid.pid))groups.set(bid.pid,[]);groups.get(bid.pid).push(bid);
 }
 for(const bids of groups.values()){
  const ordered=bids.sort((a,b)=>{
   const sa=a.sellerId?b.price-a.price:v66BidAppeal(career,b)-v66BidAppeal(career,a);
   return sa||b.annual-a.annual||a.id.localeCompare(b.id);
  });
  for(const bid of ordered){
   if(bid.status!=='pending')continue;
   if(bid.sellerId===career.manager.managedClubId&&!bid.sellerAccepted)continue;
   if(v66TryBid(career,bid))break;
   if(bid.status==='counter'){
    for(const other of ordered.filter(item=>item!==bid&&item.status==='pending'))other.expiresDay=Math.max(other.expiresDay,Math.min(5,day+1));
    break;
   }
  }
 }
 for(const bid of market.pendingBids.filter(item=>item.status==='pending'&&item.expiresDay<=day))v66CloseBid(career,bid,'expired','Die Angebotsfrist ist abgelaufen.');
 const managed=career.manager.managedClubId;
 market.pendingBids=market.pendingBids.filter(item=>['pending','counter'].includes(item.status)||item.buyerId===managed||item.sellerId===managed);
}
function v66NextMarketDay(career){
 const market=career.world.market;if(!['open','deadline'].includes(market.phase))throw Error('Die Transferphase ist nicht offen.');
 if(typeof v72ResolveDay==='function')v72ResolveDay(career,market.day,market.phase==='deadline');
 if(market.phase==='open')v66ResolveDay(career);
 if(market.day===5){
  if(typeof v72HasPending==='function'&&v72HasPending(career)){if(market.phase==='deadline')throw Error('Bitte öffne die laufenden Verhandlungen und schließe sie ab.');market.phase='deadline';if(typeof v72ReleaseResults==='function')v72ReleaseResults(career);return}
  const own=v66Club(career,career.manager.managedClubId);
  if(own.roster.length<10||!own.roster.some(player=>player.keeper))throw Error('Für den Saisonstart brauchst du mindestens zehn Profis und einen Torwart. Der letzte Transfertag bleibt offen.');
  for(const club of career.world.clubs.filter(item=>item.id!==own.id&&(item.roster.length<10||!item.roster.some(player=>player.keeper))))v66EmergencySign(career,club);
  const incomplete=career.world.clubs.find(club=>club.roster.length<10||!club.roster.some(player=>player.keeper));
  if(incomplete)throw Error(`Computerkader ${incomplete.name} ist noch unvollständig.`);
  for(const bid of market.pendingBids.filter(item=>item.status==='counter'))v66CloseBid(career,bid,'expired','Die Transferphase ist beendet.');
  market.phase='closed';career.phase='world-matches';if(typeof v72CloseMarket==='function')v72CloseMarket(career);if(typeof v72ReleaseResults==='function')v72ReleaseResults(career);return;
 }
 market.day++;
 if(typeof v72AdvanceDay==='function')v72AdvanceDay(career);
 v66AiPropose(career);
 if(typeof v72ReleaseResults==='function')v72ReleaseResults(career);
}
function v66EmergencySign(career,club){
 const market=career.world.market;
 while(club.roster.length<10||!club.roster.some(player=>player.keeper)){
  const needKeeper=!club.roster.some(player=>player.keeper),candidates=market.freePlayers.filter(player=>!needKeeper||player.keeper).sort((a,b)=>v66Salary(a)-v66Salary(b));
  if(!candidates.length)throw Error(`Kein bezahlbarer vereinsloser Spieler für ${club.name}.`);
  let signed=false;
  for(const player of candidates){const annual=v66Salary(player);if(!v66CanAfford(career,club.id,0,annual))continue;
   const bid=v66MakeBid(career,club.id,player.pid,0,annual,2,club.leagueId?2:0);bid.improved=true;bid.annual=Math.max(annual,v66Consent(career,bid).minimum);signed=v66TryBid(career,bid);if(signed)break;
  }
  if(!signed)throw Error(`Kein bezahlbarer vereinsloser Spieler für ${club.name}.`);
 }
}
function v66RenewalWindow(career,contract){
 if(contract.renewalOffers<2)return{canOffer:true};
 if(contract.renewalRound>=1)return{canOffer:false};
 const lastDay=contract.renewalNegotiation?.day;
 if(!Number.isInteger(lastDay))return{canOffer:false};
 const available=v62Days.seasonEnd-1-lastDay;
 if(available<60)return{canOffer:false};
 const random=v61Random(`${career.world.seed}:S${career.world.season}:${contract.pid}:renewal-window`);
 const nextDay=contract.renewalNextDay??lastDay+60+Math.floor(random()*(Math.min(90,available)-60+1));
 return{canOffer:career.world.calendarCursor>=nextDay,nextDay};
}
function v66Renew(career,pid,annual,years,promise=0){
 const contract=v66Contract(career,pid),club=contract&&v66Club(career,contract.clubId),player=v66Player(career,pid);
 if(!contract||!club||club.id!==career.manager.managedClubId||contract.endSeason!==career.world.season||!player||career.world.seasonFinished)throw Error('Dieser Vertrag kann nicht verlängert werden.');
 const window=v66RenewalWindow(career,contract);
 if(!window.canOffer)throw Error(window.nextDay?`Ein neues Verhandlungsfenster öffnet am ${v62Date(window.nextDay)}.`:'Dieser Vertrag kann nicht verlängert werden.');
 annual=Number(annual);years=Number(years);promise=Number(promise);
 if(!Number.isInteger(annual)||annual<60||!Number.isInteger(years)||years<2||years>3||!Number.isInteger(promise)||promise<0||promise>10)throw Error('Das Vertragsangebot ist ungültig.');
 if(contract.renewalOffers>=2){contract.renewalRound=1;contract.renewalOffers=0;delete contract.renewalNextDay}
 const previous=contract.renewalNegotiation,base=Math.round(v66Salary(player)*1.04/10)*10;
 const concession=previous&&annual>previous.annual?Math.floor((annual-previous.annual)/20)*10:0;
 const requested=Math.max(Math.round(v66Salary(player)/10)*10,(previous?.counter??base)-concession);
 contract.renewalOffers++;
 if(annual<requested){
  const day=career.world.calendarCursor,history=[...(previous?.history??(previous?[{annual:previous.annual,years:previous.years,promise:previous.promise,counter:previous.counter,day:previous.day,round:0}]:[])),{annual,years,promise,counter:requested,day,round:contract.renewalRound??0}];
  contract.renewalNegotiation={annual,years,promise,counter:requested,day,history};
  if(contract.renewalOffers===2&&contract.renewalRound!==1){const available=v62Days.seasonEnd-1-day;if(available>=60){const random=v61Random(`${career.world.seed}:S${career.world.season}:${pid}:renewal-window`);contract.renewalNextDay=day+60+Math.floor(random()*(Math.min(90,available)-60+1))}}
  return{accepted:false,counter:requested};
 }
 const day=Math.max(0,career.world.calendarCursor);v66SettleSection(career,contract,day);
 contract.annual=annual;contract.endSeason=career.world.season+years-1;contract.startsAt=day;contract.promise=promise;contract.lastPromiseCheck=0;contract.promisePenalty=0;
 delete contract.renewalNegotiation;
 delete contract.renewalNextDay;
 v66Book(career,club.id,`S${career.world.season}:${pid}:renewal:${contract.renewalOffers}`,0,`Vertrag verlängert: ${player.name}`);
 return{accepted:true,contract};
}
function v66PromiseCredits(career,player,season,fromDay=0){
 const days=new Map(v62Fixtures(career).map(fixture=>[fixture.id,fixture.day])),matches=player.history.filter(item=>item.season===season&&(days.get(item.fixtureId)??-1)>=fromDay),short=[];let full=0;
 for(const item of matches){const type=item.competitionId.includes('EUROPE')?1.5:item.competitionId.includes('CUP')?(item.fixtureId.includes(':F:')?1:.75):1,weighted=item.minutes*type;if(weighted>=45)full++;else short.push(weighted)}
 return full+Math.floor(short.reduce((sum,value)=>sum+value,0)/45);
}
function v66AfterFixture(career,fixture){
 const world=career.world;if(!world.economyProcessedFixtures||world.economyProcessedFixtures.includes(fixture.id))return;
 world.economyProcessedFixtures.push(fixture.id);
 const managed=career.manager.managedClubId;
 if([fixture.homeId,fixture.awayId].includes(managed)){
  const ownGoals=fixture.homeId===managed?fixture.result.homeGoals:fixture.result.awayGoals,otherGoals=fixture.homeId===managed?fixture.result.awayGoals:fixture.result.homeGoals,award=ownGoals>otherGoals?38:ownGoals===otherGoals?16:0;
  if(award)v66Book(career,managed,`${fixture.id}:match-credit`,award,ownGoals>otherGoals?'Sieg-Credits':'Remis-Credits');
 }
 for(const clubId of [fixture.homeId,fixture.awayId]){
  const club=v66Club(career,clubId);if(!club.leagueId)continue;
  for(const contract of world.contracts.filter(item=>item.clubId===clubId&&item.promise>0)){
   const games=v62Fixtures(career).filter(item=>item.result&&item.day>=contract.startsAt&&(item.homeId===clubId||item.awayId===clubId)).length;
   if(games-contract.lastPromiseCheck<4)continue;
   contract.lastPromiseCheck=games;
   const player=club.roster.find(item=>item.pid===contract.pid),played=v66PromiseCredits(career,player,world.season,contract.startsAt),total=Math.max(games,v62Fixtures(career).filter(item=>item.day>=contract.startsAt&&(item.homeId===clubId||item.awayId===clubId)).length),expected=Math.floor(contract.promise*games/total);
   if(expected-played>=2&&contract.promisePenalty<2){player.form=Math.max(-2,player.form-1);contract.promisePenalty++}
  }
 }
 for(const clubId of [fixture.homeId,fixture.awayId])v66AiSeasonOffer(career,clubId,fixture.day,fixture.id);
}
function v66AiSeasonOffer(career,clubId,day,fixtureId){
 const club=v66Club(career,clubId),market=career.world.market;
 if(market.phase!=='closed'||clubId===career.manager.managedClubId||club.roster.length>=12||day>=v62Days.seasonEnd-1)return;
 const random=v61Random(`${career.world.seed}:${fixtureId}:${clubId}:free-offer`);
 if(club.roster.length>=10&&random()>.075)return;
 const line=['gk','def','mid','att'].sort((a,b)=>club.roster.filter(item=>item.line===a).length-club.roster.filter(item=>item.line===b).length)[0];
 const candidates=market.freePlayers.filter(player=>player.line===line&&!market.pendingBids.some(bid=>bid.pid===player.pid&&bid.buyerId===clubId&&['pending','counter'].includes(bid.status))).sort((a,b)=>v66Salary(a)-v66Salary(b));
 if(!candidates.length)return;
 const player=candidates[Math.floor(random()*Math.min(4,candidates.length))],annual=Math.round(v66Salary(player)*1.15/10)*10;
 if(!v66CanAfford(career,clubId,0,annual))return;
 try{v66MakeBid(career,clubId,player.pid,0,annual,2,club.leagueId?3:0,day)}catch{}
}
function v66SponsorMet(career,club,goal){
 const competitions=v62Current(career),cup=competitions.find(item=>item.type==='cup'&&item.country===club.countryId);
 if(goal.kind==='league'){
  const league=competitions.find(item=>item.type==='league'&&item.country===club.countryId),ids=career.world.clubs.filter(item=>item.leagueId===club.leagueId).map(item=>item.id);
  return v62Table(league,ids).findIndex(row=>row.clubId===club.id)+1<=goal.target;
 }
 if(goal.kind==='cup')return cup.fixtures.some(item=>(goal.target==='SF'&&['SF','F'].includes(item.round)||goal.target==='F'&&item.round==='F')&&(item.homeId===club.id||item.awayId===club.id));
 if(goal.kind==='goals'){
  const competition=competitions.find(item=>item.id===goal.competition);
  return competition.fixtures.reduce((sum,item)=>sum+(item.result?(item.homeId===club.id?item.result.homeGoals:item.awayId===club.id?item.result.awayGoals:0):0),0)>=goal.target;
 }
 return false;
}
function v66SeasonEnd(career){
 const season=career.world.season;if(career.world.economyClosedSeason===season)return;
 career.world.seasonReviewClubId=career.manager.managedClubId;
 const competitions=v62Current(career);
 for(const club of career.world.clubs){
  const league=club.leagueId&&competitions.find(item=>item.id===`S${season}:${club.countryId}:LEAGUE`),cup=competitions.find(item=>item.id===`S${season}:${club.countryId}:CUP`),europe=competitions.find(item=>item.type==='europe');
  if(league){const ids=career.world.clubs.filter(item=>item.leagueId===club.leagueId).map(item=>item.id),rank=v62Table(league,ids).findIndex(row=>row.clubId===club.id);v66Book(career,club.id,`S${season}:${club.id}:league-prize`,v66LeaguePrizes[rank],`Ligaprämie · Platz ${rank+1}`)}
  const rounds=cup.fixtures.filter(item=>item.homeId===club.id||item.awayId===club.id).map(item=>item.round),cupPrize=rounds.includes('F')?(cup.winnerId===club.id?270:150):rounds.includes('SF')?90:40;
  v66Book(career,club.id,`S${season}:${club.id}:cup-prize`,cupPrize,'Nationale Pokalprämie');
  const european=europe.fixtures.filter(item=>item.result&&(item.homeId===club.id||item.awayId===club.id));
  if(european.length)v66Book(career,club.id,`S${season}:${club.id}:europe-prize`,european.length*42+(europe.winnerId===club.id?350:0),'Europacup-Prämie');
  const sponsor=club.sponsors.find(item=>item.id===club.sponsorId);
  for(let index=0;index<sponsor.goals.length;index++)if(v66SponsorMet(career,club,sponsor.goals[index]))v66Book(career,club.id,`${sponsor.id}:bonus:${index}`,sponsor.goals[index].bonus,`Sponsorbonus: ${sponsor.goals[index].label}`);
  const salary=v66SalaryDue(career,club.id);v66Book(career,club.id,`S${season}:${club.id}:salary`,-salary,'Jahresgehälter');club.salaryDue=0;
  if(club.id===career.manager.managedClubId){if(club.balance<0)club.restructuring=true;else if(club.restructuring)club.restructuring=false}
  else if(club.balance<0&&!club.restructuring)throw Error(`KI-Verein ${club.name} ist zahlungsunfähig.`);
 }
 const market=career.world.market;
 for(const contract of [...career.world.contracts].filter(item=>item.endSeason===season)){
  const club=v66Club(career,contract.clubId),player=club.roster.find(item=>item.pid===contract.pid),random=v61Random(`${career.world.seed}:S${season}:${contract.pid}:ai-renewal`);
  const renewedAnnual=Math.round(Math.max(contract.annual,v66Salary(player))*1.035/10)*10;
  const futureWages=career.world.contracts.filter(item=>item.clubId===club.id&&item.pid!==contract.pid&&item.endSeason>season).reduce((sum,item)=>sum+item.annual,renewedAnnual);
  // Der vorhandene Kassenstand trägt die Entscheidung; für das Folgejahr zählt nur der feste Grundbetrag, kein geschätzter Sponsorertrag.
  const affordable=club.balance+v66BaseIncome(club)-futureWages>=450;
  if(club.id!==career.manager.managedClubId&&affordable&&(club.roster.length<=10||random()<.76)){
   contract.endSeason=season+2;contract.fromSeason=season+1;contract.annual=renewedAnnual;contract.renewalOffers=0;
   v66Book(career,club.id,`S${season}:${contract.pid}:ai-renewal`,0,`Vertrag verlängert: ${player.name}`);
  }else{club.roster=club.roster.filter(item=>item.pid!==contract.pid);player.freeSinceSeason=season;market.freePlayers.push(player);career.world.contracts=career.world.contracts.filter(item=>item!==contract);const id=`S${season}:${contract.pid}:expiry`;career.world.transfers.push({id,season,day:career.world.calendarCursor,pid:player.pid,playerName:player.name,sellerId:club.id,buyerId:null,price:0,reason:'Vertragsende'});v66Book(career,club.id,id,0,`Vertragsende: ${player.name}`)}
 }
 career.world.economyClosedSeason=season;
}
function v66Validate(career){
 const world=career.world,market=world.market;if(!market||!['sponsor','open','deadline','closed'].includes(market.phase)||!Array.isArray(world.contracts)||!Array.isArray(market.freePlayers))return false;
 const roster=world.clubs.flatMap(club=>club.roster),all=[...roster,...market.freePlayers],ids=all.map(player=>player.pid),contractIds=world.contracts.map(item=>item.pid);
 if(new Set(ids).size!==ids.length||new Set(contractIds).size!==contractIds.length||contractIds.length!==roster.length)return false;
 if(world.clubs.some(club=>!Number.isFinite(club.balance)||!Number.isFinite(club.salaryDue)||!Array.isArray(club.ledger)||!Array.isArray(club.sponsors)||club.sponsors.length!==3))return false;
 if(world.contracts.some(item=>!v66Owner(career,item.pid)||v66Owner(career,item.pid).id!==item.clubId||item.endSeason<world.season||item.annual<60))return false;
 return market.freePlayers.every(player=>!world.contracts.some(item=>item.pid===player.pid));
}
