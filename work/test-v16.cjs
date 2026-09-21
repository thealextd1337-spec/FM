const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');

function makeContext(name='FC Transfer'){const elements=new Map(),storage=new Map(),scoreboard=[];function element(){return{innerHTML:'',textContent:'',hidden:false,value:'',disabled:false,dataset:{},className:'',style:{setProperty(){}},classList:{toggle(){},remove(){}},firstChild:null,setAttribute(){},addEventListener(){},append(){},before(){},prepend(){},focus(){},scrollIntoView(){},insertAdjacentElement(){},insertAdjacentHTML(){},querySelector(){return element()},querySelectorAll(){return[]},closest(){return null},getContext(){return{clearRect(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},ellipse(){},save(){},clip(){},restore(){},fillText(){}}}}}scoreboard.push(element(),element());const document={documentElement:element(),querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector)},querySelectorAll(selector){return selector==='.scoreboard span'?scoreboard:[]},createElement:element,createTextNode:text=>text};elements.set('#club-name',Object.assign(element(),{value:name}));elements.set('#club-primary',Object.assign(element(),{value:'#2244aa'}));elements.set('#club-secondary',Object.assign(element(),{value:'#ffcc22'}));const context={document,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},window:{scrollTo(){}},location:{protocol:'file:'},crypto,structuredClone,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},alert:message=>{throw Error(message)},confirm:()=>true,fetch:async()=>({ok:true}),console,Math};vm.createContext(context);for(const file of['game.js','manager-v11.js','identity-v12.js','season-v13.js','halftime-v14.js','finance-v15.js','transfer-v16.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);vm.runInContext(`$('#club-form').onsubmit({preventDefault(){}})`,context);return context}
function finishWinningSeason(context){vm.runInContext(`selectSponsor('safe');for(let round=0;round<10;round++){start();match.score=[2,0];finishMatch()}`,context)}

const context=makeContext();
assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext(`[retirementChance(33),retirementChance(34),retirementChance(35),retirementChance(36),retirementChance(37),retirementChance(38),retirementChance(39)]`,context))),[0,.5,.6,.7,.8,.9,1]);
assert.equal(vm.runInContext('activeSave.transfer.open',context),false);
finishWinningSeason(context);
vm.runInContext(`for(const p of[activeSave.keeper,...activeSave.squad])p.age=25;activeSave.squad[0].age=38;syncLineupFromSquad();startNextSeason()`,context);
let state=vm.runInContext(`({season:activeSave.seasonNumber,round:activeSave.currentRound,open:activeSave.transfer.open,prepared:activeSave.transfer.prepared,retirements:activeSave.transfer.retirements,retired:activeSave.squad.filter(p=>p.retired).map(p=>p.name),offers:activeSave.transfer.offers.length,regular:activeSave.transfer.offers.filter(o=>o.kind==='regular').length,free:activeSave.transfer.offers.filter(o=>o.kind==='free').length,sponsor:activeSave.finance.sponsor.selectedId,valid:validMatchSquad(),payroll:payroll()})`,context);state=JSON.parse(JSON.stringify(state));
assert.equal(state.season,2);assert.equal(state.round,0);assert.equal(state.open,true);assert.equal(state.prepared,true);assert.equal(state.retirements.length,1);assert.equal(state.retired.length,1);assert.equal(state.retirements[0].age,39);assert.equal(state.offers,13);assert.equal(state.regular,8);assert.equal(state.free,5);assert.equal(state.sponsor,null);assert.equal(state.valid,true);

const regularId=vm.runInContext(`activeSave.transfer.offers.find(o=>o.kind==='regular'&&!o.player.keeper).id`,context);
assert.equal(vm.runInContext(`buyOffer('${regularId}')`,context),false,'Kauf vor Sponsorwahl muss gesperrt sein');
vm.runInContext(`selectSponsor('safe');start()`,context);assert.equal(vm.runInContext('running',context),false,'Offenes Transferfenster muss den Saisonstart sperren');
const beforeBuy=vm.runInContext(`({balance:activeSave.finance.balance,active:activeRosterSize(),payroll:payroll()})`,context),offer=vm.runInContext(`activeSave.transfer.offers.find(o=>o.id==='${regularId}')`,context),fee=JSON.parse(JSON.stringify(offer)).fee;
assert.equal(vm.runInContext(`buyOffer('${regularId}')`,context),true);
state=vm.runInContext(`({balance:activeSave.finance.balance,active:activeRosterSize(),payroll:payroll(),signed:activeSave.transfer.offers.find(o=>o.id==='${regularId}').signed,bought:activeSave.transfer.history.find(h=>h.type==='buy'&&h.amount>0)})`,context);state=JSON.parse(JSON.stringify(state));
assert.equal(state.balance,beforeBuy.balance-fee);assert.equal(state.active,beforeBuy.active+1);assert(state.payroll>beforeBuy.payroll);assert.equal(state.signed,true);assert(state.bought);

const boughtPid=state.bought.pid,balanceBeforeSale=state.balance;
assert.equal(vm.runInContext(`sellPlayer('${boughtPid}')`,context),true);
state=vm.runInContext(`({balance:activeSave.finance.balance,active:activeRosterSize(),sale:activeSave.transfer.history.find(h=>h.type==='sale'&&h.pid==='${boughtPid}'),former:activeSave.formerPlayers.some(e=>e.player.pid==='${boughtPid}')})`,context);state=JSON.parse(JSON.stringify(state));
assert(state.balance>balanceBeforeSale);assert.equal(state.active,beforeBuy.active);assert(state.sale.amount>0);assert.equal(state.former,true);

vm.runInContext(`showStartScreen();openSlot(readSlots().find(s=>s.id===activeSave.id))`,context);
assert.equal(vm.runInContext('activeSave.transfer.open',context),true,'Offene Transferphase muss Speichern und Laden überstehen');
assert.equal(vm.runInContext('closeTransferWindow()',context),true);
state=vm.runInContext(`({open:activeSave.transfer.open,retiredInSquad:activeSave.squad.some(p=>p.retired),valid:validMatchSquad(),lineup:activeSave.lineup.length})`,context);state=JSON.parse(JSON.stringify(state));
assert.deepEqual(state,{open:false,retiredInSquad:false,valid:true,lineup:5});

const otherRegular=vm.runInContext(`activeSave.transfer.offers.find(o=>o.kind==='regular'&&!o.signed&&!o.player.keeper).id`,context),freeId=vm.runInContext(`activeSave.transfer.offers.find(o=>o.kind==='free'&&!o.player.keeper).id`,context);
assert.equal(vm.runInContext(`buyOffer('${otherRegular}')`,context),false,'Nach Transferschluss darf keine Ablöse mehr gezahlt werden');
const freeBalance=vm.runInContext('activeSave.finance.balance',context),freeActive=vm.runInContext('activeRosterSize()',context);
assert.equal(vm.runInContext(`buyOffer('${freeId}')`,context),true,'Ablösefreier Zugang muss nach Transferschluss möglich bleiben');
assert.equal(vm.runInContext('activeSave.finance.balance',context),freeBalance);assert.equal(vm.runInContext('activeRosterSize()',context),freeActive+1);
vm.runInContext(`start()`,context);assert.equal(vm.runInContext('running',context),true,'Nach Transferschluss muss das Ligaspiel starten können');

const keeperContext=makeContext('FC Torwartwechsel');finishWinningSeason(keeperContext);
vm.runInContext(`for(const p of[activeSave.keeper,...activeSave.squad])p.age=25;activeSave.keeper.age=38;syncLineupFromSquad();startNextSeason();selectSponsor('safe')`,keeperContext);
assert.equal(vm.runInContext('activeSave.keeper.retired',keeperContext),true);assert.equal(vm.runInContext('validMatchSquad()',keeperContext),false);
const keeperOfferId=vm.runInContext(`activeSave.transfer.offers.find(o=>o.kind==='regular'&&o.player.keeper).id`,keeperContext);
assert.equal(vm.runInContext(`buyOffer('${keeperOfferId}')`,keeperContext),true);assert.equal(vm.runInContext('activeSave.keeper.retired',keeperContext),false);assert.equal(vm.runInContext('activeSave.keeper.n',keeperContext),1);assert.equal(vm.runInContext('closeTransferWindow()',keeperContext),true);

console.log('PASS: Karriereende 34–39, Transferfenster, Käufe, Verkäufe, Transferschluss, freie Spieler und Torwartersatz');
