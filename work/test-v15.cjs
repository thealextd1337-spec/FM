const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');

function makeContext(){
 const elements=new Map(),storage=new Map(),scoreboard=[];
 function element(){return{innerHTML:'',textContent:'',hidden:false,value:'',disabled:false,dataset:{},className:'',style:{setProperty(){}},classList:{toggle(){},remove(){}},firstChild:null,setAttribute(){},addEventListener(){},append(){},before(){},prepend(){},focus(){},scrollIntoView(){},insertAdjacentElement(){},insertAdjacentHTML(){},querySelector(){return element()},querySelectorAll(){return[]},closest(){return null},getContext(){return{clearRect(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},ellipse(){},save(){},clip(){},restore(){},fillText(){}}}}}
 scoreboard.push(element(),element());
 const document={documentElement:element(),querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector)},querySelectorAll(selector){return selector==='.scoreboard span'?scoreboard:[]},createElement:element,createTextNode:text=>text};
 elements.set('#club-name',Object.assign(element(),{value:'FC Finanztest'}));
 elements.set('#club-primary',Object.assign(element(),{value:'#2244aa'}));
 elements.set('#club-secondary',Object.assign(element(),{value:'#ffcc22'}));
 const context={document,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},window:{scrollTo(){}},location:{protocol:'file:'},crypto,structuredClone,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},alert:message=>{throw Error(message)},confirm:()=>true,fetch:async()=>({ok:true}),console,Math};
 vm.createContext(context);
 for(const file of['game.js','manager-v11.js','identity-v12.js','season-v13.js','halftime-v14.js','finance-v15.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
 vm.runInContext(`$('#club-form').onsubmit({preventDefault(){}})`,context);
 return context;
}

const context=makeContext();
let state=vm.runInContext(`({balance:activeSave.finance.balance,sponsor:activeSave.finance.sponsor.selectedId,payroll:payroll(),salaries:[activeSave.keeper,...activeSave.squad].map(p=>p.salary)})`,context);
state=JSON.parse(JSON.stringify(state));
assert.equal(state.balance,650);
assert.equal(state.sponsor,null);
assert(state.payroll>=1500&&state.payroll<=2610);
assert(state.salaries.every(salary=>salary>=150&&salary<=290));

vm.runInContext(`start()`,context);
assert.equal(vm.runInContext('running',context),false,'Ohne Sponsor darf kein Spiel starten');
vm.runInContext(`selectSponsor('safe')`,context);
assert.equal(vm.runInContext('activeSave.finance.balance',context),1550);
assert.equal(vm.runInContext(`activeSave.finance.ledger.filter(e=>e.type==='sponsor').length`,context),1);
vm.runInContext(`selectSponsor('attack')`,context);
assert.equal(vm.runInContext(`activeSave.finance.ledger.filter(e=>e.type==='sponsor').length`,context),1,'Sponsor darf nicht doppelt gewählt werden');

const scores=[[2,0],[1,1],[0,1],[1,0],[0,0],[0,2],[3,1],[1,2],[2,2],[1,0]];
for(const [home,away] of scores)vm.runInContext(`start();match.score=[${home},${away}];finishMatch()`,context);
state=vm.runInContext(`({round:activeSave.currentRound,resultCredits:activeSave.finance.resultCredits[1],resultEntries:activeSave.finance.ledger.filter(e=>e.type==='result').length,sponsorEntries:activeSave.finance.ledger.filter(e=>e.type==='sponsor').length,salaryEntries:activeSave.finance.ledger.filter(e=>e.type==='salary').length,balance:activeSave.finance.balance,payroll:payroll(),settled:activeSave.finance.payrollSeasons.slice(),gameOver:activeSave.finance.gameOver,history:activeSave.clubHistory[0]})`,context);
state=JSON.parse(JSON.stringify(state));
const expectedResults=scores.reduce((sum,[home,away])=>sum+(home>away?150:home===away?60:0),0);
assert.equal(state.round,10);
assert.equal(state.resultCredits,expectedResults);
assert.equal(state.resultEntries,10);
assert.equal(state.sponsorEntries,1);
assert.equal(state.salaryEntries,1);
assert.deepEqual(state.settled,[1]);
assert.equal(state.balance,650+900+expectedResults-state.payroll);
assert.equal(state.gameOver,state.balance<0);
assert.equal(state.history.finance.resultCredits,expectedResults);
assert.equal(state.history.finance.sponsorCredits,900);
assert.equal(state.history.finance.salaries,state.payroll);
assert.equal(state.history.finance.closingBalance,state.balance);
vm.runInContext(`settleAnnualPayroll();settleAnnualPayroll()`,context);
assert.equal(vm.runInContext(`activeSave.finance.ledger.filter(e=>e.type==='salary').length`,context),1,'Gehälter dürfen nur einmal bezahlt werden');

const insolvent=makeContext();
vm.runInContext(`selectSponsor('safe');activeSave.finance.balance=0;for(const p of[activeSave.keeper,...activeSave.squad])p.salary=1000;activeSave.currentRound=10;seasonSnapshot();settleAnnualPayroll()`,insolvent);
state=vm.runInContext(`({gameOver:activeSave.finance.gameOver,balance:activeSave.finance.balance,shortfall:activeSave.finance.shortfall,salaryEntries:activeSave.finance.ledger.filter(e=>e.type==='salary').length})`,insolvent);
state=JSON.parse(JSON.stringify(state));
assert.equal(state.gameOver,true);
assert(state.balance<0&&state.shortfall===-state.balance);
assert.equal(state.salaryEntries,1);

const flight=makeContext();
vm.runInContext(`selectSponsor('safe');start();match.elapsed=74.99;match.halftime=true;match.halftimeBreakDone=true;match.kickoff=null;match.countdown=0;match.next=Infinity;const keeper=match.people.find(p=>p.t===0&&p.keeper);keeper.stats.faced=1;match.owner=null;match.flight={x:.5,y:.5,target:keeper,duration:.5,progress:0,team:0,done(){keeper.stats.saves++;match.owner=keeper;match.next=Infinity}};step(.08,.08)`,flight);
assert.equal(vm.runInContext('match.finished',flight),false,'Aktiver Schuss muss vor dem Abpfiff aufgelöst werden');
vm.runInContext(`for(let tick=0;tick<20&&!match.finished;tick++)step(.08,.08)`,flight);
state=vm.runInContext(`(()=>{const keeper=match.people.find(p=>p.t===0&&p.keeper);return{finished:match.finished,elapsed:match.elapsed,faced:keeper.stats.faced,saves:keeper.stats.saves,conceded:match.score[1]}})()`,flight);
state=JSON.parse(JSON.stringify(state));
assert.equal(state.finished,true);
assert.equal(state.elapsed,75);
assert.equal(state.faced,state.saves+state.conceded);

console.log(`PASS: Sponsor, ${scores.length} Prämien, Jahresgehälter, Game Over und offener Schuss am Abpfiff`);
