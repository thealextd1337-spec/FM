// B16 (Angebot zurückziehen) und B17 (Popups für Antworten auf eigene Transferangebote) im VM ohne Browser.
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
let serial=0;
const context=vm.createContext({clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),crypto:{randomUUID:()=>`r132-${++serial}`}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const penaltySource=fs.readFileSync('dist/penalties-v42.js','utf8');
vm.runInContext(penaltySource.slice(penaltySource.indexOf('function v42Composure('),penaltySource.indexOf('function v42OrderHTML(')),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
for(const file of ['world-economy-v66.js','world-transfer-list-v72.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
context.escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const ui=fs.readFileSync('dist/world-market-ui-v66.js','utf8');
vm.runInContext(ui.slice(0,ui.indexOf('const v66BaseSetCareerTab=')),context);
context.v58State=()=>({});
const transferUI=fs.readFileSync('dist/world-transfer-list-ui-v72.js','utf8');
vm.runInContext(transferUI.slice(0,transferUI.indexOf("v61WorldScreen.addEventListener('change'")),context);
const progression=fs.readFileSync('dist/world-expansion-progression-v167.js','utf8');
vm.runInContext(progression.slice(progression.indexOf('function v167Active('),progression.indexOf('function v167Rules(')),context);
const squad=fs.readFileSync('dist/world-squad-planning-v179.js','utf8'),squadUI=fs.readFileSync('dist/world-squad-ui-v179.js','utf8');
vm.runInContext(squad.slice(0,squad.indexOf('const v179BaseInit=')),context);
vm.runInContext(squadUI.slice(0,squadUI.indexOf('const v179BaseDecorate=')),context);
const dialog={open:false,innerHTML:'',showModal(){this.open=true},querySelector(){return null}};
context.testDialog=dialog;
vm.runInContext('v72EnsureDialog=()=>v72Dialog=testDialog',context);
const call=(name,...args)=>vm.runInContext(name,context)(...args);
const credits=value=>call('v66Credits',value);
const roundtrip=career=>JSON.parse(JSON.stringify(career));
const REPLY=['fee-agreed','fee-counter','contract-counter'];

function fresh(seed){
 const career=call('v61CreateCareer','GER-2',seed),own=call('v66Club',career,'GER-2');
 call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);
 own.balance=100000;
 return{career,own,market:career.world.market};
}
function targets(career,own,count){
 const used=new Set(),found=[];
 for(const club of career.world.clubs.filter(item=>item.id!==own.id&&!item.simulationOnly&&item.roster.length===11)){
  if(used.has(club.id))continue;
  const player=club.roster.find(item=>!item.keeper&&!call('v72Listing',career,item.pid)&&call('v72Willingness',career,item.pid,own.id)!=='no'&&!career.world.market.negotiations.some(entry=>entry.pid===item.pid)&&!career.world.market.pendingBids.some(entry=>entry.pid===item.pid));
  if(player){used.add(club.id);found.push({player,club})}
  if(found.length===count)break;
 }
 assert.equal(found.length,count,'genug Zielspieler');
 return found;
}
const floorOf=player=>call('v72Floor',{ask:call('v66Value',player),reason:'direct'});
// Zeigt das nächste ungesehene Popup an und bestätigt es wie "Später"/"Weiter".
function popup(career){
 context.v61CurrentCareer=career;dialog.open=false;dialog.innerHTML='';
 call('v72ShowResults');
 return dialog.open?dialog.innerHTML:null;
}
function dismiss(career,kind){
 const result=career.world.market.transferResults.find(item=>!item.seen&&(!kind||item.kind===kind));
 assert(result,'ein ungesehenes Ergebnis');result.seen=true;dialog.open=false;return result;
}
function replyResults(career){return career.world.market.transferResults.filter(item=>REPLY.includes(item.kind))}
function unseen(career){return career.world.market.transferResults.filter(item=>!item.seen)}

// ---------- B17: drei gleichzeitige Vereinsantworten, Beträge, Mehrfachanzeige, Reload ----------
{
 const{career,own,market}=fresh('r132-replies');
 const[a,b,c]=targets(career,own,3);
 const valueA=call('v66Value',a.player);
 const dealA=call('v72Start',career,a.player.pid,valueA);
 assert.equal(dealA.stage,'fee-wait');
 const dealB=call('v72Start',career,b.player.pid,10);
 assert.equal(dealB.stage,'fee-counter','sofortige Gegenforderung beim Start');
 const middle=floorOf(b.player)-10;
 call('v72SubmitFee',career,dealB.id,middle);
 assert.equal(dealB.stage,'fee-wait');
 const dealC=call('v72Start',career,c.player.pid,call('v66Value',c.player));
 c.club.roster=c.club.roster.filter(item=>item.pid===c.player.pid||item.keeper);
 assert.equal(unseen(career).length,0,'Sofortantworten am Starttag erzeugen kein Popup');
 assert.equal(popup(career),null);
 call('v66NextMarketDay',career);
 assert.equal(market.day,2);
 assert.equal(dealA.stage,'contract');assert.equal(dealB.stage,'fee-counter');assert.equal(dealC.stage,'rejected');
 const results=unseen(career);
 assert.deepEqual(results.map(item=>item.kind).sort(),['fee-agreed','fee-counter','rejected'],'drei Antworten, je genau eine');
 assert.equal(new Set(market.transferResults.map(item=>item.id)).size,market.transferResults.length,'keine doppelten Kennungen');
 // Reload mit drei ungesehenen: jedes erscheint genau einmal.
 let copy=roundtrip(career);
 const seenKinds=[];
 for(let round=0;round<4;round++){
  const html=popup(copy);if(!html)break;
  const result=copy.world.market.transferResults.find(item=>!item.seen);
  seenKinds.push(result.kind);
  if(result.kind==='fee-agreed'){
   assert(html.includes(a.player.name)&&html.includes(a.club.name),'Annahme nennt Spieler und Verein');
   assert(html.includes(credits(valueA)),'Annahme nennt die vereinbarte Ablöse');
   assert(html.includes('Spielervertrag verhandeln')&&html.includes('noch nicht vollzogen')&&html.includes('Später'));
  }else if(result.kind==='fee-counter'){
   assert(html.includes(b.player.name)&&html.includes(b.club.name));
   assert(html.includes(credits(middle))&&html.includes(credits(dealB.counter)),'Gegenangebot nennt Gebot und Forderung');
   assert(html.includes('Gegenangebot bearbeiten')&&html.includes('Später'));
   assert(!html.includes(credits(valueA))||valueA===middle||valueA===dealB.counter);
  }else{
   assert.equal(result.kind,'rejected');
   assert(html.includes('Transfer abgelehnt')&&html.includes(c.player.name)&&html.includes(c.club.name));
  }
  assert(unseen(copy).length>0);
  dismiss(copy);
  if(round===0)copy=roundtrip(copy);
 }
 assert.deepEqual(seenKinds,['fee-agreed','fee-counter','rejected'],'nacheinander in Reihenfolge und nach Reload genau einmal');
 assert.equal(popup(copy),null,'nichts erscheint erneut');
 assert.equal(popup(roundtrip(copy)),null,'auch nicht nach erneutem Reload');
 // Gegenangebot bearbeiten öffnet den Verhandlungsdialog und markiert die Antwort als gesehen.
 const counter=career.world.market.transferResults.find(item=>item.kind==='fee-counter');
 call('v72OpenReply',career,counter);
 assert(dialog.innerHTML.includes('id="v72-fee"')&&dialog.innerHTML.includes('data-v72-fee='),'Gegenangebot lässt sich im Dialog bearbeiten');
 assert(counter.seen,'v72RenderDeal markiert die passende Antwort als gesehen');
 const accepted=career.world.market.transferResults.find(item=>item.kind==='fee-agreed');
 call('v72OpenReply',career,accepted);
 assert(dialog.innerHTML.includes('id="v72-salary"'),'Annahme führt direkt in die Vertragsverhandlung');
 assert(accepted.seen);
 assert(own.roster.every(item=>item.pid!==a.player.pid)&&a.club.roster.some(item=>item.pid===a.player.pid),'Vereinsannahme vollzieht keinen Wechsel');
 assert.equal(own.balance,100000,'Vereinsannahme bucht nichts');
 // Überholte Antwort: wer schon handelt, bevor das Popup erscheint, sieht kein veraltetes Popup.
 const stale=roundtrip(career);
 for(const item of stale.world.market.transferResults)item.seen=false;
 const staleDeal=stale.world.market.negotiations.find(item=>item.id===dealA.id);
 staleDeal.stage='contract-wait';
 const staleHtml=popup(stale);
 assert(!staleHtml||!staleHtml.includes('Spielervertrag verhandeln'),'überholte Vereinsannahme erscheint nicht');
 assert(stale.world.market.transferResults.find(item=>item.kind==='fee-agreed').seen,'überholte Antwort wird still als gesehen markiert');
 console.log('B17 Vereinsantworten: Annahme, Gegenangebot, Ablehnung, Reihenfolge, Reload, Aktionen und überholte Antworten geprüft.');
}

// ---------- B17: Spielerantworten bei Ablöseverhandlungen ----------
{
 const{career,own,market}=fresh('r132-player-replies');
 const[a,b]=targets(career,own,2);
 const dealA=call('v72Start',career,a.player.pid,call('v66Value',a.player));
 const dealB=call('v72Start',career,b.player.pid,call('v66Value',b.player));
 call('v66NextMarketDay',career);
 assert.equal(dealA.stage,'contract');assert.equal(dealB.stage,'contract');
 for(const item of unseen(career))item.seen=true;
 const minimumA=call('v66Consent',career,{...dealA,annual:0}).minimum,minimumB=call('v66Consent',career,{...dealB,annual:0}).minimum;
 call('v72SubmitContract',career,dealA.id,Math.max(60,minimumA-30),2,3);
 call('v72SubmitContract',career,dealB.id,minimumB+30,2,3);
 assert.equal(dealA.stage,'contract-wait');assert.equal(dealB.stage,'contract-wait');
 assert.equal(unseen(career).length,0);
 const cash=own.balance;
 call('v66NextMarketDay',career);
 assert.equal(dealA.stage,'contract-counter','Spieler fordert mehr Gehalt');
 assert.equal(dealB.stage,'completed','Spielerannahme vollzieht den Wechsel');
 assert(own.roster.some(item=>item.pid===b.player.pid)&&own.balance===cash-dealB.agreedPrice);
 const kinds=unseen(career).map(item=>item.kind).sort();
 assert.deepEqual(kinds,['completed','contract-counter'],'Spielerannahme nutzt nur die vorhandene Erfolgsmeldung');
 const first=popup(career),firstResult=career.world.market.transferResults.find(item=>!item.seen);
 const order=[];
 let html=first;
 for(let round=0;round<3&&html;round++){
  const result=career.world.market.transferResults.find(item=>!item.seen);order.push(result.kind);
  if(result.kind==='contract-counter'){
   assert(html.includes(a.player.name)&&html.includes(a.club.name),'Gegenforderung nennt Spieler und Verein');
   assert(html.includes(credits(dealA.counter))&&html.includes(credits(dealA.annual)),'Gegenforderung nennt Forderung und Angebot');
   assert(html.includes('Vertragsforderung bearbeiten')&&html.includes('noch nicht vollzogen'));
  }else{
   assert(html.includes('Transfer abgeschlossen')&&html.includes(b.player.name));
  }
  dismiss(career);html=popup(career);
 }
 assert.deepEqual(order.sort(),['completed','contract-counter']);
 assert.equal(popup(career),null);
 assert(firstResult);
 // Reload mit ungesehener Spielerforderung.
 const counter=market.transferResults.find(item=>item.kind==='contract-counter');
 counter.seen=false;
 const reloaded=roundtrip(career);
 assert(popup(reloaded)&&popup(reloaded).includes('Vertragsforderung bearbeiten'),'ungesehene Spielerforderung überlebt Reload');
 dismiss(reloaded);assert.equal(popup(reloaded),null);
 call('v72OpenReply',career,counter);
 assert(dialog.innerHTML.includes('id="v72-salary"')&&dialog.innerHTML.includes('data-v72-contract='),'Forderung lässt sich bearbeiten');
 // Zweite Runde: Gegenforderung erneut unterboten, neue Antwort erscheint trotz gleicher Forderung.
 call('v72SubmitContract',career,dealA.id,dealA.annual+10,2,3);
 assert.equal(dealA.stage,'contract-wait');
 call('v66NextMarketDay',career);
 assert.equal(dealA.stage,'contract-counter','zweite Runde bleibt unter der Forderung');
 {
  const rounds=market.transferResults.filter(item=>item.kind==='contract-counter');
  assert.equal(rounds.length,2,'jede Runde erhält ein eigenes Popup');
  assert.equal(new Set(rounds.map(item=>item.id)).size,2);
 }
 console.log('B17 Spielerantworten (Ablöse): Gegenforderung, Annahme ohne Doppelmeldung, Reload und mehrere Runden geprüft.');
}

// ---------- B17: ablösefreie Spieler ----------
{
 const{career,own,market}=fresh('r132-free-replies');
 const[low,high,refused]=market.freePlayers.slice(0,3);
 const minimum=player=>call('v66Consent',career,{pid:player.pid,buyerId:own.id,sellerId:null,annual:0,years:2,promise:2}).minimum;
 const lowBid=call('v66MakeBid',career,own.id,low.pid,0,60,2,3);
 const highBid=call('v66MakeBid',career,own.id,high.pid,0,minimum(high)+40,2,3);
 const refusedBid=call('v66MakeBid',career,own.id,refused.pid,0,60,2,3);
 assert.equal(unseen(career).length,0);
 call('v66NextMarketDay',career);
 assert.equal(lowBid.status,'counter');assert.equal(highBid.status,'completed');
 const kinds=unseen(career).map(item=>`${item.kind}:${item.pid}`).sort();
 assert(kinds.includes(`contract-counter:${low.pid}`)&&kinds.includes(`completed:${high.pid}`));
 assert.equal(unseen(career).filter(item=>item.kind==='contract-counter').length,2,'Gegenforderungen beider niedrigen Gebote');
 const counterResult=market.transferResults.find(item=>item.kind==='contract-counter'&&item.pid===low.pid);
 assert.equal(counterResult.counter,lowBid.counter);
 // Popup-Inhalt
 for(const item of market.transferResults)if(item!==counterResult)item.seen=true;
 const html=popup(career);
 assert(html.includes(low.name)&&html.includes('Vereinslos'),'nennt Spieler und Vereinslos');
 assert(html.includes(credits(lowBid.counter))&&html.includes(credits(lowBid.annual))&&html.includes('Vertragsforderung bearbeiten'));
 const reloaded=roundtrip(career);
 assert(popup(reloaded),'nach Reload genau einmal');dismiss(reloaded);assert.equal(popup(reloaded),null);
 call('v72OpenReply',career,counterResult);
 assert(dialog.innerHTML.includes('data-v72-free-improve='),'Gegenforderung im ablösefreien Dialog bearbeiten');
 assert(counterResult.seen);
 // Erfüllte Forderung führt zum Wechsel; die Meldung ist die vorhandene Erfolgsmeldung, keine zweite Antwort.
 call('v66ImproveBid',career,lowBid.id,lowBid.counter);
 assert.equal(lowBid.status,'completed');
 assert.equal(market.transferResults.filter(item=>item.pid===low.pid&&item.kind==='completed').length,1);
  void refusedBid;void refused;
 console.log('B17 Ablösefreie Spieler: Gegenforderung, Erfüllung, Reload geprüft.');
}

// ---------- B17: Sofortauswertung am letzten Tag, verkäuferseitige und alte Ergebnisse ----------
{
 const{career,own,market}=fresh('r132-day-five');
 const[a,b]=targets(career,own,2);
 for(let day=1;day<5;day++)call('v66NextMarketDay',career);
 assert.equal(market.day,5);
 for(const item of unseen(career))item.seen=true;
 const before=market.transferResults.length;
 const agreed=call('v72Start',career,a.player.pid,call('v66Value',a.player));
 assert.equal(agreed.stage,'contract','Tag 5 wertet sofort aus');
 const counter=call('v72Start',career,b.player.pid,10);
 call('v72SubmitFee',career,counter.id,floorOf(b.player)-10);
 assert.equal(replyResults(career).length,0,'Sofortauswertung an Tag 5 erzeugt keine Annahme-/Gegenangebots-Popups');
 assert.equal(counter.stage,'rejected','letzte Runde am Tag 5 endet sofort');
 assert.equal(market.transferResults.length-before,1,'nur die vorhandene Absage');
 const minimumA=call('v66Consent',career,{...agreed,annual:0}).minimum;
 call('v72SubmitContract',career,agreed.id,Math.max(60,minimumA-30),2,3);
 assert.equal(market.transferResults.filter(item=>item.kind==='contract-counter').length,0,'auch die Sofort-Gegenforderung bleibt still');
 // Freier Spieler am letzten Tag
 const free=market.freePlayers.find(player=>!market.pendingBids.some(bid=>bid.pid===player.pid));
 const freeBid=call('v66MakeBid',career,own.id,free.pid,0,60,2,3);
 assert.equal(freeBid.status,'counter');
 assert.equal(market.transferResults.filter(item=>item.kind==='contract-counter').length,0);
}
{
 // Seller-side acceptance and legacy entries never reach the buyer popup.
 const{career,own,market}=fresh('r132-seller-side');
 const player=own.roster.find(item=>!item.keeper);
 const listing=call('v72ListOwn',career,player.pid,call('v66Value',player)*2);
 const buyer=career.world.clubs.find(club=>club.id!==own.id&&!club.simulationOnly&&club.roster.length<13&&club.leagueId);
 const offer={id:'S1:N900',pid:player.pid,buyerId:buyer.id,sellerId:own.id,price:call('v66Value',player),annual:200,years:2,promise:0,stage:'seller-offer',createdDay:1,answerDay:1,lastChange:'Gebot'};
 market.negotiations.push(offer);
 call('v72SellerRespond',career,offer.id,'accept');
 const fee=market.transferResults.find(item=>item.negotiationId===offer.id&&item.kind==='fee-agreed');
 assert(fee&&fee.buyerId===buyer.id,'verkäuferseitiges fee-agreed wird gespeichert');
 call('v72ReleaseResults',career);
 assert.equal(popup(career),null,'kein Käufer-Popup für den Verkauf');
 assert(fee.seen,'still als gesehen markiert');
 // Altbestand ohne Kennzeichnung (vor dieser Änderung gespeichert) erscheint nicht rückwirkend.
 const legacy={id:'S1:N901:fee-agreed',negotiationId:'S1:N901',pid:'x',buyerId:own.id,sellerId:buyer.id,kind:'fee-agreed',price:100,message:'alt',day:1,released:true,seen:false};
 market.transferResults.push(legacy);
 market.negotiations.push({id:'S1:N901',pid:'x',buyerId:own.id,sellerId:buyer.id,stage:'contract',agreedPrice:100,price:100,lastChange:'alt'});
 assert.equal(popup(career),null);assert(legacy.seen);
 console.log('B17 Tag 5 ohne Doppel-Popup, verkäuferseitig und Altbestand still geprüft.');
}

// ---------- B16: Angebot zurückziehen ----------
{
 const stages=['fee-wait','fee-counter','contract','contract-wait','contract-counter','ready'];
 for(const stage of stages){
  const{career,own,market}=fresh(`r132-withdraw-${stage}`);
  const[a]=targets(career,own,1);
  const value=call('v66Value',a.player);
  let deal=call('v72Start',career,a.player.pid,stage==='fee-counter'?10:value);
  if(['contract','contract-wait','contract-counter','ready'].includes(stage)){
   call('v66NextMarketDay',career);assert.equal(deal.stage,'contract');
   const minimum=call('v66Consent',career,{...deal,annual:0}).minimum;
   if(stage!=='contract'){
    call('v72SubmitContract',career,deal.id,Math.max(60,minimum-30),2,3);
    if(stage==='contract-counter'){call('v66NextMarketDay',career);assert.equal(deal.stage,'contract-counter')}
    if(stage==='ready')deal.stage='ready';
   }
  }
  assert.equal(deal.stage,stage,`Stufe ${stage} erreicht`);
  const cash=own.balance,roster=own.roster.map(item=>item.pid).join(),sellerRoster=a.club.roster.length;
  // Antwort noch ungesehen: wird beim Zurückziehen verworfen.
  for(const item of market.transferResults)if(item.negotiationId===deal.id)item.seen=false;
  call('v72Cancel',career,deal.id);
  assert.equal(deal.stage,'rejected',`${stage}: Käufer darf zurückziehen`);
  assert.equal(deal.lastChange,'Du hast das Angebot zurückgezogen.');
  assert(!market.decisions.some(item=>item.negotiationId===deal.id),`${stage}: keine Sperre`);
  assert(!market.transferResults.some(item=>item.negotiationId===deal.id&&!item.seen),`${stage}: kein Popup`);
  assert.throws(()=>call('v72Cancel',career,deal.id),/zurückgezogen/,'nicht doppelt zurückziehbar');
  assert.equal(popup(career),null);
  // Speichern/Neuladen und Tageswechsel: weder Wechsel noch Zahlung.
  const saved=roundtrip(career);
  for(let step=0;step<2;step++)call('v66NextMarketDay',saved);
  const savedOwn=call('v66Club',saved,own.id);
  assert.equal(savedOwn.roster.map(item=>item.pid).join(),roster,`${stage}: kein Wechsel`);
  assert.equal(savedOwn.balance,cash,`${stage}: keine Zahlung`);
  assert.equal(call('v66Club',saved,a.club.id).roster.length,sellerRoster);
  assert(!saved.world.market.transferResults.some(item=>item.negotiationId===deal.id&&!item.seen&&['rejected','completed'].includes(item.kind)),`${stage}: auch nach Tageswechsel kein Ergebnis`);
  assert.equal(call('v61ValidateCareer',saved),true);
  // Sofort ein neues Angebot (auch ohne Listing: Direktgebot).
  const again=call('v72Start',career,a.player.pid,value);
  assert.notEqual(again.id,deal.id);
  assert(['fee-wait','contract'].includes(again.stage),`${stage}: neues Angebot sofort möglich`);
  // Dialogstände
  call('v72RenderDeal',career,again.id);
  assert(dialog.innerHTML.includes('data-v72-retract='),'Zurückziehen-Knopf im Dialog');
  assert(!dialog.innerHTML.includes('data-v72-cancel'),'alte Knöpfe sind ersetzt');
 }
 // Nach dem Zurückziehen führt die Angebotsansicht wieder zum neuen Gebot.
 {
  const{career,own}=fresh('r132-withdraw-ui');
  const[a]=targets(career,own,1);
  const deal=call('v72Start',career,a.player.pid,call('v66Value',a.player));
  call('v72ConfirmRetract',career,deal.id,'deal');
  assert(dialog.innerHTML.includes('Angebot zurückziehen?')&&dialog.innerHTML.includes('data-v72-retract-confirm=')&&dialog.innerHTML.includes('data-v72-retract-back='),'Bestätigungsansicht');
  assert(dialog.innerHTML.includes('sofort ein neues Angebot'));
  call('v72Cancel',career,deal.id);
  call('v72RenderDeal',career,deal.id);
  assert(dialog.innerHTML.includes('data-v72-reopen='),'Neues Angebot aus dem beendeten Dialog');
  assert(!call('v66OfferHTML',career).includes('v72-deal='),'zurückgezogene Verhandlung blockiert die Angebotsansicht nicht');
  call('v72OpenPlayerOffer',career,a.player.pid);
  assert(dialog.innerHTML.includes('id="v72-fee"')&&dialog.innerHTML.includes('data-v72-start='),'Suche öffnet nach dem Zurückziehen wieder das Gebotsformular');
 }
 // Vollzogen, beendet: nicht zurückziehbar.
 {
  const{career,own}=fresh('r132-withdraw-completed');
  const[a]=targets(career,own,1);
  const deal=call('v72Start',career,a.player.pid,call('v66Value',a.player));
  call('v66NextMarketDay',career);
  const minimum=call('v66Consent',career,{...deal,annual:0}).minimum;
  call('v72SubmitContract',career,deal.id,minimum+30,2,3);
  call('v66NextMarketDay',career);
  assert.equal(deal.stage,'completed');
  const roster=own.roster.map(item=>item.pid).join();
  assert.throws(()=>call('v72Cancel',career,deal.id),/nicht mehr zurückgezogen/);
  assert.equal(own.roster.map(item=>item.pid).join(),roster,'vollzogene Transfers bleiben abgeschlossen');
 }
 // Ablösefrei: pending und counter
 for(const state of ['pending','counter']){
  const{career,own,market}=fresh(`r132-withdraw-free-${state}`);
  const player=market.freePlayers[0];
  const bid=call('v66MakeBid',career,own.id,player.pid,0,state==='pending'?call('v66Consent',career,{pid:player.pid,buyerId:own.id,sellerId:null,annual:0,years:2,promise:2}).minimum+40:60,2,3);
  if(state==='counter'){call('v66NextMarketDay',career);assert.equal(bid.status,'counter')}
  else assert.equal(bid.status,'pending');
  const cash=own.balance;
  call('v72OpenFreeAgent',career,player.pid);
  assert(dialog.innerHTML.includes('data-v72-retract=')&&dialog.innerHTML.includes('data-v72-kind="free"'),'Zurückziehen im Dialog Spielervertrag');
  call('v72ConfirmRetract',career,bid.id,'free');
  assert(dialog.innerHTML.includes('Angebot zurückziehen?'));
  for(const item of market.transferResults)if(item.negotiationId===bid.id)item.seen=false;
  call('v66WithdrawBid',career,bid.id);
  assert.equal(bid.status,'rejected');assert.equal(bid.reason,'Du hast das Angebot zurückgezogen.');
  assert(!market.decisions.some(item=>item.pid===player.pid&&item.buyerId===own.id),'keine Sperre');
  assert.throws(()=>call('v66WithdrawBid',career,bid.id),/nicht mehr zurückgezogen/);
  assert(unseen(career).filter(item=>item.pid===player.pid&&item.kind!=='contract-counter').length===0,'kein Ergebnis-Popup');
  call('v72MarkReplies',career,bid.id);
  assert.equal(popup(career),null,'auch eine ungesehene Gegenforderung erscheint nicht mehr');
  const saved=roundtrip(career);
  call('v66NextMarketDay',saved);call('v66NextMarketDay',saved);
  assert(call('v66Club',saved,own.id).roster.every(item=>item.pid!==player.pid),'kein Wechsel');
  assert.equal(call('v66Club',saved,own.id).balance,cash,'keine Zahlung');
  assert.equal(popup(saved),null);
  call('v72OpenFreeAgent',career,player.pid);
  assert(dialog.innerHTML.includes('data-v72-free-offer=')&&!dialog.innerHTML.includes('data-v72-free-offer="'+player.pid+'" disabled'),'neues Angebot sofort möglich');
  const next=call('v66MakeBid',career,own.id,player.pid,0,200,2,3);
  assert.equal(next.status,'pending');
  assert.equal(call('v61ValidateCareer',roundtrip(career)),true);
 }
 console.log('B16 Angebot zurückziehen: alle Stufen, ablösefrei, Reload, Tageswechsel, neues Angebot, vollzogen nicht zurückziehbar geprüft.');
}
console.log('PASS test-world-offer-withdraw-reply-r132');
