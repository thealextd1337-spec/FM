'use strict';

// Verkaufslisten und voneinander getrennte Verhandlungen der neuen Vereinswelt.
function v72Market(career){
 const market=career.world.market;
 market.saleListings??=[];market.negotiations??=[];market.transferResults??=[];market.nextNegotiation??=1;
 return market;
}
function v72Listing(career,pid){return v72Market(career).saleListings.find(item=>item.pid===pid&&item.status==='active')||null}
function v72ListOwn(career,pid,ask){
 const market=v72Market(career),club=v66Club(career,career.manager.managedClubId),player=club?.roster.find(item=>item.pid===pid);
 ask=Number(ask);
 if(market.phase!=='open'||!player)throw Error('Spieler können nur während des Transferfensters angeboten werden.');
 if(market.saleListings.some(item=>item.pid===pid))throw Error('Für diesen Spieler gab es in diesem Transferfenster bereits ein Verkaufsangebot.');
 if(!Number.isInteger(ask)||ask<10)throw Error('Bitte eine gültige verhandelbare Ablöse ab 10 Credits eingeben.');
 if(!v72CanCommitSale(career,club.id,pid))throw Error('Der Verein muss mindestens zehn Profis und einen Torwart behalten.');
 const listing={id:`S${career.world.season}:L:${pid}`,pid,sellerId:club.id,ask,reason:'manager',status:'active',createdDay:market.day};
 market.saleListings.push(listing);v72AiInterest(career,pid);return listing;
}
function v72WithdrawOwn(career,pid){
 const market=v72Market(career),listing=v72Listing(career,pid);
 if(!['open','deadline'].includes(market.phase)||!listing||listing.sellerId!==career.manager.managedClubId)throw Error('Dieses eigene Verkaufsangebot ist nicht aktiv.');
 if(market.negotiations.some(item=>item.pid===pid&&['contract','contract-wait','contract-counter','ready','completed'].includes(item.stage)))throw Error('Nach einer Ablöseeinigung kann der Spieler nicht mehr zurückgezogen werden.');
 listing.status='withdrawn';
 for(const item of market.negotiations.filter(item=>item.pid===pid&&!['rejected','completed'].includes(item.stage)))v72Reject(career,item,'Das Verkaufsangebot wurde zurückgezogen.');
 return listing;
}
function v72LowerOwnAsk(career,pid,amount){
 const market=v72Market(career),listing=market.saleListings.find(item=>item.pid===pid&&item.sellerId===career.manager.managedClubId);
 amount=Number(amount);
 if(market.phase!=='open'||!listing||!['active','withdrawn'].includes(listing.status))throw Error('Die Forderung kann nur im laufenden Transferfenster gesenkt werden.');
 if(market.negotiations.some(item=>item.pid===pid)||market.pendingBids.some(item=>item.pid===pid))throw Error('Für diesen Spieler liegt bereits ein Angebot vor oder lag eines vor.');
 if(!Number.isInteger(amount)||amount<10||amount>=listing.ask)throw Error('Die neue Forderung muss mindestens 10 Credits betragen und niedriger sein als bisher.');
 if(!v72CanCommitSale(career,listing.sellerId,pid))throw Error('Der Verein muss mindestens zehn Profis und einen Torwart behalten.');
 listing.ask=amount;listing.status='active';listing.updatedDay=market.day;
 v72AiInterest(career,pid);
 return listing;
}
function v72OpenMarket(career){v72AdvanceDay(career)}
function v72ListingPressure(career,club){
 const due=v66SalaryDue(career,club.id),income=v66SecureNextIncome(club);
 return club.restructuring||club.balance+v66LeaguePrizes[5]-due<500||due>income*1.2&&club.balance<due*1.6;
}
function v72AdvanceDay(career){
 const market=v72Market(career),own=career.manager.managedClubId,targets={gk:1,def:3,mid:4,att:3},minimum={gk:1,def:1,mid:1,att:1};
 for(const listing of market.saleListings.filter(item=>item.status==='active')){
  const club=v66Club(career,listing.sellerId),agreed=market.negotiations.some(item=>item.pid===listing.pid&&['contract','contract-wait','contract-counter','ready'].includes(item.stage));
  if(club?.roster.some(player=>player.pid===listing.pid)&&club.roster.length>10&&(listing.reason!=='finance'||v72ListingPressure(career,club)||agreed))continue;
  if(agreed)continue;
  listing.status='withdrawn';
  for(const negotiation of market.negotiations.filter(item=>item.pid===listing.pid&&['fee-wait','fee-counter','seller-offer','seller-counter-wait'].includes(item.stage))){v72Reject(career,negotiation,'Der Verein hat den Spieler von der Verkaufsliste genommen.');const result=market.transferResults.find(item=>item.negotiationId===negotiation.id&&item.kind==='rejected');if(result)result.day=Math.max(0,market.day-1)}
 }
 for(const club of career.world.clubs.filter(item=>item.id!==own&&item.roster.length>10)){
  const pressure=v72ListingPressure(career,club),counts={gk:0,def:0,mid:0,att:0};
  for(const player of club.roster)counts[player.line]++;
  const room=club.roster.length-10,surplusRoom=Math.max(0,club.roster.length-11),picks=new Map(),remaining={...counts};
  if(pressure){
   const expensive=[...club.roster].filter(player=>remaining[player.line]>minimum[player.line]).sort((a,b)=>(v66Contract(career,b.pid)?.annual||0)-(v66Contract(career,a.pid)?.annual||0)||a.pid.localeCompare(b.pid));
   let needed=Math.max(200,v66SalaryDue(career,club.id)-v66SecureNextIncome(club),500-(club.balance+v66LeaguePrizes[5]-v66SalaryDue(career,club.id)));
   for(const player of expensive){if(picks.size>=room||needed<=0)break;if(remaining[player.line]<=minimum[player.line])continue;picks.set(player.pid,'finance');remaining[player.line]--;needed-=v66Value(player)}
  }
  for(const line of ['gk','def','mid','att']){
   const extra=Math.max(0,counts[line]-targets[line]);if(!extra||picks.size>=surplusRoom)continue;
   const candidates=club.roster.filter(player=>player.line===line&&(!player.keeper||counts.gk>1)).sort((a,b)=>v66Skill(a)-v66Skill(b)||b.age-a.age||a.pid.localeCompare(b.pid));
   for(const player of candidates.slice(0,extra)){if(picks.size>=surplusRoom)break;if(!picks.has(player.pid)&&remaining[player.line]>minimum[player.line]){picks.set(player.pid,'surplus');remaining[player.line]--}}
  }
  for(const [pid,reason] of picks){
   if(market.saleListings.some(item=>item.pid===pid))continue;
   const player=club.roster.find(item=>item.pid===pid),value=v66Value(player),strength=v66Skill(player),factor=reason==='finance'?.98:strength>=16?2.2:strength>=15?1.65:1.12;
   market.saleListings.push({id:`S${career.world.season}:L:${player.pid}`,pid:player.pid,sellerId:club.id,ask:Math.max(10,Math.round(value*factor/10)*10),reason,status:'active',createdDay:market.day});
  }
 }
 v72AiInterest(career);
}
function v72Willingness(career,pid,buyerId){
 const seller=v66Owner(career,pid),buyer=v66Club(career,buyerId),player=v66Player(career,pid);
 if(!seller||!buyer||!player)return'no';
 const gap=buyer.policy.tradition+buyer.policy.fans*.25-seller.policy.tradition-seller.policy.fans*.25;
 if(gap<-2.5&&v66Skill(player)>=12)return'no';
 return gap<-.8?'unsure':'open';
}
function v72CommittedPids(career,sellerId){return new Set(v72Market(career).negotiations.filter(item=>item.sellerId===sellerId&&['contract','contract-wait','contract-counter','ready'].includes(item.stage)).map(item=>item.pid))}
function v72CanCommitSale(career,sellerId,pid){const seller=v66Club(career,sellerId),player=seller?.roster.find(item=>item.pid===pid),committed=v72CommittedPids(career,sellerId);return !!(player&&seller.roster.length-(committed.has(pid)?committed.size:committed.size+1)>=10&&(!player.keeper||seller.roster.filter(item=>item.keeper).length>1))}
function v72Queue(career,negotiation,kind,message){
 const market=v72Market(career),id=`${negotiation.id}:${kind}`;
 if(market.transferResults.some(item=>item.id===id))return;
 market.transferResults.push({id,negotiationId:negotiation.id,pid:negotiation.pid,buyerId:negotiation.buyerId,sellerId:negotiation.sellerId,kind,price:negotiation.agreedPrice??negotiation.price,message,day:market.day,released:false,seen:kind!=='completed'});
}
function v72ReleaseResults(career){for(const result of v72Market(career).transferResults)result.released=true}
function v72Reject(career,negotiation,reason){
 if(['rejected','completed'].includes(negotiation.stage))return;
 negotiation.stage='rejected';negotiation.lastChange=reason;
 const market=v72Market(career);
 if(!market.decisions.some(item=>item.negotiationId===negotiation.id))market.decisions.push({negotiationId:negotiation.id,pid:negotiation.pid,buyerId:negotiation.buyerId,season:career.world.season,status:'rejected',atPlayed:v62Fixtures(career).filter(fixture=>fixture.result).length});
 if(negotiation.buyerId===career.manager.managedClubId||negotiation.sellerId===career.manager.managedClubId)v72Queue(career,negotiation,'rejected',reason);
}
function v72Floor(listing){return Math.max(10,Math.round(listing.ask*(listing.reason==='finance'?.85:.9)/10)*10)}
function v72Start(career,pid,amount){
 const market=v72Market(career),listing=v72Listing(career,pid),buyerId=career.manager.managedClubId,player=v66Player(career,pid);
 if(market.phase!=='open'||!listing||!player||listing.sellerId===buyerId||v66Owner(career,pid)?.id!==listing.sellerId)throw Error('Dieses Verkaufsangebot ist nicht mehr verfügbar.');
 if(v66Club(career,buyerId).roster.length>=14)throw Error('Der Kader hat bereits 14 Profis.');
 amount=Number(amount);
 if(!Number.isInteger(amount)||amount<1||!v66CanAfford(career,buyerId,amount,v66Salary(player)))throw Error('Diese Ablöse ist nicht finanzierbar.');
 if(market.negotiations.some(item=>item.pid===pid&&item.buyerId===buyerId&&!['rejected','completed'].includes(item.stage)))throw Error('Für diesen Spieler läuft bereits eine Verhandlung.');
 if(market.decisions.some(item=>item.pid===pid&&item.buyerId===buyerId&&item.season===career.world.season&&['rejected','expired'].includes(item.status)))throw Error('Ein neues Gebot ist erst im nächsten Transferfenster möglich.');
 const negotiation={id:`S${career.world.season}:N${market.nextNegotiation++}`,pid,buyerId,sellerId:listing.sellerId,price:amount,annual:0,years:2,promise:3,stage:'fee-wait',createdDay:market.day,answerDay:market.day,lastChange:`Ablösegebot: ${amount} Credits.`};
 market.negotiations.push(negotiation);
 if(v72Willingness(career,pid,buyerId)==='no'){negotiation.stage='refusal-wait';negotiation.lastChange='Dein Transferwunsch wird beim Tageswechsel entschieden.';return negotiation}
 if(amount<v72Floor(listing)){
  negotiation.stage='fee-counter';negotiation.counter=Math.max(v72Floor(listing),Math.round((listing.ask+amount)/20)*10);
  negotiation.counterDay=market.day;negotiation.lastChange=`${v66Club(career,listing.sellerId).name} fordert ${negotiation.counter} Credits.`;
 }
 return negotiation;
}
function v72Negotiation(career,id){return v72Market(career).negotiations.find(item=>item.id===id)||null}
function v72SubmitFee(career,id,amount){
 const market=v72Market(career),item=v72Negotiation(career,id),listing=item&&v72Listing(career,item.pid);
 if(!item||item.buyerId!==career.manager.managedClubId||item.stage!=='fee-counter'||!listing||!['open','deadline'].includes(market.phase))throw Error('Dieses Ablöseangebot kann nicht mehr geändert werden.');
 amount=Number(amount);
 if(!Number.isInteger(amount)||amount<1||!v66CanAfford(career,item.buyerId,amount,v66Salary(v66Player(career,item.pid))))throw Error('Diese Ablöse ist nicht finanzierbar.');
 item.price=amount;item.stage='fee-wait';item.answerDay=market.day;item.lastChange=`Dein neues Ablösegebot: ${amount} Credits.`;
 if(market.phase==='deadline')v72ResolveFee(career,item,true);
 return item;
}
function v72ResolveFee(career,item,deadline=false){
 const listing=v72Listing(career,item.pid),seller=v66Club(career,item.sellerId);
 if(item.stage==='refusal-wait'){v72Reject(career,item,'Der Spieler hat den Wechsel abgelehnt.');return}
 if(!listing||!seller?.roster.some(player=>player.pid===item.pid)||!v72CanCommitSale(career,item.sellerId,item.pid)){v72Reject(career,item,'Der Verein kann diesen Spieler nicht mehr abgeben.');return}
 if(item.price>=v72Floor(listing)){
  item.stage='contract';item.agreedPrice=item.price;item.lastChange=`${seller.name} stimmt ${item.price} Credits Ablöse zu. Jetzt folgt der Spielervertrag.`;
  if(item.buyerId===career.manager.managedClubId)v72Queue(career,item,'fee-agreed',item.lastChange);
  return;
 }
 if(deadline||item.price<=item.previousPrice){v72Reject(career,item,'Der Verein hat das Ablösegebot abgelehnt.');return}
 item.previousPrice=item.price;item.stage='fee-counter';item.counter=Math.max(v72Floor(listing),Math.round((listing.ask+item.price)/20)*10);
 item.counterDay=career.world.market.day;item.lastChange=`${seller.name} fordert ${item.counter} Credits.`;
}
function v72SellerRespond(career,id,response,amount){
 const market=v72Market(career),item=v72Negotiation(career,id),listing=item&&v72Listing(career,item.pid);
 if(!item||item.sellerId!==career.manager.managedClubId||item.stage!=='seller-offer'||!listing||!['open','deadline'].includes(market.phase))throw Error('Dieses Kaufangebot ist nicht mehr offen.');
 if(response==='reject'){v72Reject(career,item,'Du hast das Kaufangebot abgelehnt.');return item}
 if(response==='accept'){
  if(!v72CanCommitSale(career,item.sellerId,item.pid)||!v66CanAfford(career,item.buyerId,item.price,item.annual))throw Error('Der Wechsel ist inzwischen nicht mehr möglich.');
  item.agreedPrice=item.price;item.stage='contract-wait';item.answerDay=market.day;item.lastChange=`Du hast ${item.price} Credits Ablöse mit ${v66Club(career,item.buyerId).name} vereinbart. Der Spieler verhandelt jetzt den Vertrag.`;
  v72Queue(career,item,'fee-agreed',item.lastChange);return item;
 }
 if(response!=='counter')throw Error('Ungültige Antwort auf das Kaufangebot.');
 amount=Number(amount);
 if(!Number.isInteger(amount)||amount<=item.price)throw Error('Die Gegenforderung muss über dem letzten Gebot liegen.');
 item.counter=amount;item.stage='seller-counter-wait';item.answerDay=market.day;item.lastChange=`Deine Gegenforderung an ${v66Club(career,item.buyerId).name}: ${amount} Credits.`;
 if(market.phase==='deadline')v72ResolveSellerCounter(career,item);
 return item;
}
function v72ResolveSellerCounter(career,item){
 const listing=v72Listing(career,item.pid),buyer=v66Club(career,item.buyerId);
 if(!listing||!buyer||!v72CanCommitSale(career,item.sellerId,item.pid)){v72Reject(career,item,'Der Wechsel ist nicht mehr möglich.');return}
 const ceiling=Math.max(item.price,Math.round(listing.ask*1.08/10)*10),annual=item.annual;
 if(item.counter<=ceiling&&v66CanAfford(career,buyer.id,item.counter,annual)){
  item.price=item.counter;item.agreedPrice=item.counter;item.stage='contract-wait';item.lastChange=`${buyer.name} stimmt ${item.counter} Credits Ablöse zu. Der Spieler verhandelt jetzt den Vertrag.`;
  v72Queue(career,item,'fee-agreed',item.lastChange);return;
 }
 if(item.price<ceiling&&item.counter<=Math.round(ceiling*1.15)&&v66CanAfford(career,buyer.id,ceiling,annual)){
  item.price=ceiling;item.stage='seller-offer';item.lastChange=`${buyer.name} bietet jetzt ${ceiling} Credits Ablöse.`;return;
 }
 v72Reject(career,item,`${buyer.name} hat die Gegenforderung abgelehnt.`);
}
function v72SubmitContract(career,id,annual,years,promise){
 const market=v72Market(career),item=v72Negotiation(career,id),player=item&&v66Player(career,item.pid);
 if(!item||item.buyerId!==career.manager.managedClubId||!['contract','contract-counter'].includes(item.stage)||!player||!['open','deadline'].includes(market.phase))throw Error('Dieses Vertragsangebot kann nicht mehr geändert werden.');
 annual=Number(annual);years=Number(years);promise=Number(promise);
 if(!Number.isInteger(annual)||annual<60||!Number.isInteger(years)||years<1||years>3||!Number.isInteger(promise)||promise<0||promise>10||!v66CanAfford(career,item.buyerId,item.agreedPrice,annual))throw Error('Der Vertrag ist ungültig oder nicht finanzierbar.');
 if(item.stage==='contract-counter'&&annual<=item.annual)throw Error('Das neue Gehalt muss höher sein.');
 item.annual=annual;item.years=years;item.promise=promise;item.answerDay=market.day;
 const minimum=v66Consent(career,item).minimum;
 if(annual>=minimum){item.stage='contract-wait';item.lastChange=`Dein Vertragsangebot: ${annual} Credits Gehalt für ${years} Saisons.`;return item}
 if(market.day===5||market.phase==='deadline'){
  item.stage='contract-counter';item.counter=minimum;item.counterDay=market.day;item.lastChange=`Der Spieler fordert ${minimum} Credits Jahresgehalt.`;
 }else{item.stage='contract-wait';item.lastChange=`Dein neues Vertragsangebot: ${annual} Credits Jahresgehalt. Die Antwort folgt am nächsten Transfertag.`}
 return item;
}
function v72Cancel(career,id){
 const item=v72Negotiation(career,id);
 if(!item||item.buyerId!==career.manager.managedClubId||!['fee-wait','fee-counter'].includes(item.stage))throw Error('Nach der Ablöseeinigung kann die Verhandlung nicht mehr beendet werden.');
 v72Reject(career,item,'Du hast die Verhandlung beendet.');return item;
}
function v72HasPending(career){const own=career.manager.managedClubId;return v72Market(career).negotiations.some(item=>(item.buyerId===own||item.sellerId===own)&&!['rejected','ready','completed'].includes(item.stage))}
function v72ResolveDay(career,day,deadline=false){
 const market=v72Market(career);
 const own=career.manager.managedClubId;
 for(const item of market.negotiations.filter(entry=>entry.buyerId===own||entry.sellerId===own)){
  if(item.sellerId===own){
   if(item.stage==='seller-counter-wait'&&item.answerDay<=day)v72ResolveSellerCounter(career,item);
   else if(item.stage==='seller-offer'&&deadline)v72Reject(career,item,'Das Kaufangebot blieb bis zum Transferschluss offen.');
   else if(item.stage==='contract-wait'&&item.answerDay<=day){
    const consent=v66Consent(career,item);
    if(!consent.accepted)item.annual=consent.minimum;
    if(v66CanAfford(career,item.buyerId,item.agreedPrice,item.annual)){item.stage='ready';item.lastChange='Der Spieler hat einem Vertrag zugestimmt. Die Transferentscheidung folgt beim Tageswechsel.'}
    else v72Reject(career,item,'Mit dem Spieler kam kein Vertrag zustande.');
   }
   continue;
  }
  if(item.stage==='refusal-wait'&&item.answerDay<=day)v72ResolveFee(career,item,deadline||day===5);
  else if(item.stage==='fee-wait'&&item.answerDay<=day)v72ResolveFee(career,item,deadline||day===5);
  else if(item.stage==='fee-counter'&&day===5&&market.phase==='deadline')v72Reject(career,item,'Das Ablöseangebot blieb bis zum Transferschluss offen.');
  else if(deadline&&['contract','contract-counter'].includes(item.stage))v72Reject(career,item,'Mit dem Spieler kam kein Vertrag zustande.');
  else if(item.stage==='contract-wait'&&item.answerDay<=day){
   const consent=v66Consent(career,item);
   if(consent.accepted){item.stage='ready';item.lastChange='Der Spieler hat dem Vertrag zugestimmt. Die Transferentscheidung folgt beim Tageswechsel.'}
   else if(deadline){item.stage='contract-counter';item.counter=consent.minimum;item.counterDay=day;item.lastChange=`Der Spieler fordert ${consent.minimum} Credits Jahresgehalt.`}
   else{item.stage='contract-counter';item.counter=consent.minimum;item.counterDay=day;item.lastChange=`Der Spieler fordert ${consent.minimum} Credits Jahresgehalt.`}
  }
 }
 v72Finalize(career);
}
function v72Finalize(career){
 const market=v72Market(career),groups=new Map();
 for(const item of market.negotiations)if(!['completed'].includes(item.stage)){if(!groups.has(item.pid))groups.set(item.pid,[]);groups.get(item.pid).push(item)}
 for(const items of groups.values()){
  const agreed=items.filter(item=>['contract','contract-wait','contract-counter','ready'].includes(item.stage));
  if(!agreed.length||agreed.some(item=>item.stage!=='ready'))continue;
  const ready=agreed.sort((a,b)=>v66BidAppeal(career,b)-v66BidAppeal(career,a)||a.id.localeCompare(b.id));
  let winner=null;
  for(const item of ready){
   if(v66Owner(career,item.pid)?.id!==item.sellerId||v66Club(career,item.sellerId).roster.length<=10||!v66CanAfford(career,item.buyerId,item.agreedPrice,item.annual)){v72Reject(career,item,'Der Wechsel ist nicht mehr möglich.');continue}
   const bid={id:item.id,pid:item.pid,buyerId:item.buyerId,sellerId:item.sellerId,price:item.agreedPrice,annual:item.annual,years:item.years,promise:item.promise,status:'pending'};
   market.pendingBids.push(bid);
   try{v66Transfer(career,bid);item.stage='completed';item.lastChange=bid.reason;winner=item;if(item.buyerId===career.manager.managedClubId||item.sellerId===career.manager.managedClubId)v72Queue(career,item,'completed',bid.reason);break}catch(error){market.pendingBids=market.pendingBids.filter(entry=>entry!==bid);v72Reject(career,item,error.message)}
  }
  if(winner)for(const item of items.filter(entry=>entry!==winner&&!['rejected','completed'].includes(entry.stage)))v72Reject(career,item,'Dieses Transferangebot wurde nicht angenommen.');
 }
}
function v72AiInterest(career,targetPid=null){
 const market=v72Market(career),own=career.manager.managedClubId,random=v61Random(`${career.world.seed}:S${career.world.season}:D${market.day}:sale-interest:${targetPid||'all'}`);
 const listings=market.saleListings.filter(item=>item.status==='active'&&(!targetPid||item.pid===targetPid));
 for(const buyer of career.world.clubs.filter(item=>item.id!==career.manager.managedClubId&&item.roster.length<13&&item.roster.some(player=>player.keeper))){
  if(random()>(targetPid ? .18 : .11))continue;
  const candidates=listings.filter(item=>{
   const player=v66Player(career,item.pid);if(!player)return false;
   const strength=v66Skill(player),ratio=item.ask/Math.max(1,v66Value(player));
   const maxRatio=strength>=16?3:strength>=15?2.1:strength>=13?1.5:1.25;
   const peers=buyer.roster.filter(member=>member.line===player.line);
   const sportingFit=peers.length<(player.keeper?2:player.line==='att'?3:4)||strength>Math.max(0,...peers.map(v66Skill))+.8;
   return ratio<=maxRatio&&sportingFit&&item.sellerId!==buyer.id&&v72CanCommitSale(career,item.sellerId,item.pid)&&!market.negotiations.some(entry=>entry.pid===item.pid&&entry.buyerId===buyer.id)&&v72Willingness(career,item.pid,buyer.id)!=='no'&&v66CanAfford(career,buyer.id,item.ask,v66Salary(player));
  });
  candidates.sort((a,b)=>buyer.roster.filter(player=>player.line===v66Player(career,a.pid).line).length-buyer.roster.filter(player=>player.line===v66Player(career,b.pid).line).length||a.ask-b.ask||a.pid.localeCompare(b.pid));
  const listing=candidates[0];if(!listing)continue;
  const player=v66Player(career,listing.pid),annual=Math.round(v66Salary(player)*1.2/10)*10;
  if(!v66CanAfford(career,buyer.id,listing.ask,annual))continue;
  const ownSale=listing.sellerId===own,price=ownSale?Math.max(10,Math.round(listing.ask*(.82+random()*.16)/10)*10):listing.ask;
  const item={id:`S${career.world.season}:N${market.nextNegotiation++}`,pid:player.pid,buyerId:buyer.id,sellerId:listing.sellerId,price,agreedPrice:ownSale?undefined:price,annual,years:2,promise:buyer.leagueId?3:0,stage:ownSale?'seller-offer':'ready',createdDay:market.day,answerDay:market.day,lastChange:ownSale?`${buyer.name} bietet ${price} Credits Ablöse.`:'Verein und Spieler sind sich einig.'};
  item.annual=Math.max(item.annual,v66Consent(career,item).minimum);
  if(v66CanAfford(career,buyer.id,item.price,item.annual))market.negotiations.push(item);
 }
}
function v72CloseMarket(career){
 const market=v72Market(career);
 for(const listing of market.saleListings.filter(item=>item.status==='active'))listing.status='expired';
 for(const item of market.negotiations.filter(entry=>!['completed','rejected'].includes(entry.stage)))v72Reject(career,item,'Das Transferfenster ist geschlossen.');
}
