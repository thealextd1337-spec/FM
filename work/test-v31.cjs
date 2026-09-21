const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');

function makeContext(){
 const elements=new Map(),storage=new Map(),scoreboard=[];
 function element(){return{innerHTML:'',textContent:'',hidden:false,value:'',checked:false,disabled:false,dataset:{},className:'',files:[],style:{setProperty(){}},classList:{toggle(){},remove(){},add(){}},firstChild:null,setAttribute(){},addEventListener(){},append(){},before(){},prepend(){},remove(){},focus(){},click(){},scrollIntoView(){},insertAdjacentElement(){},insertAdjacentHTML(){},replaceChildren(value){this.textContent=value?.textContent??value??''},querySelector(){return element()},querySelectorAll(){return[]},closest(){return null},getContext(){return{clearRect(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},ellipse(){},save(){},clip(){},restore(){},fillText(){}}}}}
 scoreboard.push(element(),element());const body=element(),document={documentElement:element(),head:element(),body,querySelector(selector){if(selector==='body')return body;if(!elements.has(selector))elements.set(selector,element());return elements.get(selector)},querySelectorAll(selector){return selector==='.scoreboard span'?scoreboard:[]},createElement:element,createTextNode:text=>text};
 elements.set('#club-name',Object.assign(element(),{value:'FC Dauertest'}));elements.set('#club-primary',Object.assign(element(),{value:'#2244aa'}));elements.set('#club-secondary',Object.assign(element(),{value:'#ffcc22'}));
 const customMath=Object.create(Math);customMath.random=Math.random;
 const context={document,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},window:{scrollY:0,pageYOffset:0,scrollTo(){}},location:{protocol:'file:'},crypto,structuredClone,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},alert:message=>{throw Error(message)},confirm:()=>true,fetch:async()=>({ok:true}),console,Math:customMath,Date,Blob:global.Blob,URL:{createObjectURL:()=>'',revokeObjectURL(){}}};
 vm.createContext(context);for(const file of['game.js','manager-v11.js','identity-v12.js','season-v13.js','halftime-v14.js','finance-v15.js','transfer-v16.js','qol-v17.js','player-card-v18.js','sponsor-fix-v26.js','season-finale-v31.js','dashboard-layout-v32.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);return context
}

const context=makeContext();
vm.runInContext(`beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');for(const player of[activeSave.keeper,...activeSave.squad,homeKeeper,...players,...activeSave.world.teams.flatMap(team=>team.roster)])player.age=18`,context);

assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext('v31PlacementAwards',context))),{1:900,2:750,3:600,4:450,5:325,6:250});
for(let season=1;season<=12;season++){
 vm.runInContext(`for(let round=0;round<10;round++){start();match.score=[2,0];finishMatch()}`,context);
 let state=JSON.parse(JSON.stringify(vm.runInContext(`(()=>{const f=v31EnsureFinale(),finance=ensureFinance(activeSave),season=activeSave.seasonNumber;return{season,round:activeSave.currentRound,stage:f.stage,rank:f.snapshot.rank,top:f.topThree.length,retirements:f.retirements.length,balance:finance.balance,placement:finance.placementCredits?.[season],placementEntries:finance.ledger.filter(entry=>entry.key==='placement-'+season).length,salaryEntries:finance.ledger.filter(entry=>entry.key==='salary-'+season).length,html:v31SummaryHTML(f)}})()`,context)));
 assert.equal(state.season,season);assert.equal(state.round,10);assert.equal(state.stage,'summary');assert.equal(state.rank,1);assert.equal(state.top,3);assert.equal(state.retirements,0);assert.equal(state.placement,900);assert.equal(state.placementEntries,1);assert.equal(state.salaryEntries,1);assert(state.html.includes('Top 3 Torschützen'));assert(state.html.includes('MEISTER!'));
 vm.runInContext(`settleAnnualPayroll();renderCenter();settleAnnualPayroll()`,context);
 state=JSON.parse(JSON.stringify(vm.runInContext(`({placement:activeSave.finance.ledger.filter(entry=>entry.key==='placement-'+activeSave.seasonNumber).length,salary:activeSave.finance.ledger.filter(entry=>entry.key==='salary-'+activeSave.seasonNumber).length})`,context)));
 assert.deepEqual(state,{placement:1,salary:1},'Saisonabschluss darf Zahlungen nicht doppelt buchen');
 vm.runInContext(`v31SetStage('retirements');v31SetStage('finance')`,context);
 state=JSON.parse(JSON.stringify(vm.runInContext(`({stage:activeSave.seasonFinale.stage,finance:v31FinanceBreakdown(),html:v31FinanceHTML(activeSave.seasonFinale)})`,context)));
 assert.equal(state.stage,'finance');assert.equal(state.finance.placement,900);assert.equal(state.finance.gameOver,false);assert.equal(state.finance.before+state.finance.results+state.finance.sponsorFixed+state.finance.sponsorBonus+state.finance.placement-state.finance.salary,state.finance.closing);assert(state.html.includes('Jahresgehälter'));assert(state.html.includes('Saison '+(season+1)+' beginnen'));
 vm.runInContext(`v31SetStage('complete')`,context);
 if(season<12){
   state=JSON.parse(JSON.stringify(vm.runInContext(`({season:activeSave.seasonNumber,open:activeSave.transfer.open,archive:activeSave.seasonFinaleArchive.length,pending:activeSave.pendingRetirements})`,context)));
   assert.equal(state.season,season+1);assert.equal(state.open,true);assert.equal(state.archive,season);assert.equal(state.pending,undefined);
   vm.runInContext(`selectSponsor('safe');closeTransferWindow()`,context);
 }
}
const result=JSON.parse(JSON.stringify(vm.runInContext(`({season:activeSave.seasonNumber,balance:activeSave.finance.balance,gameOver:activeSave.finance.gameOver,placementSeasons:Object.keys(activeSave.finance.placementCredits).length,payrollSeasons:activeSave.finance.payrollSeasons.length,archive:activeSave.seasonFinaleArchive.length,ledgerPlacements:activeSave.finance.ledger.filter(entry=>entry.type==='placement').length})`,context)));
assert.equal(result.season,13);assert.equal(result.gameOver,false);assert.equal(result.placementSeasons,12);assert.equal(result.payrollSeasons,12);assert.equal(result.archive,12);assert.equal(result.ledgerPlacements,12);assert(result.balance>0);

const retirementContext=makeContext();
vm.runInContext(`beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');for(const player of[activeSave.keeper,...activeSave.squad,homeKeeper,...players])player.age=20;activeSave.squad[0].age=33;players.find(player=>player.n===activeSave.squad[0].n).age=33;Math.random=()=>0;for(let round=0;round<10;round++){start();match.score=[1,0];finishMatch()}`,retirementContext);
let retirement=JSON.parse(JSON.stringify(vm.runInContext(`({first:v31EnsureFinale().retirements.map(player=>player.pid),second:(renderCenter(),v31EnsureFinale().retirements.map(player=>player.pid))})`,retirementContext)));
assert.deepEqual(retirement.first,retirement.second,'Karriereenden müssen nach Neuladen stabil bleiben');assert.equal(retirement.first.length,1);
vm.runInContext(`v31SetStage('complete')`,retirementContext);assert.equal(vm.runInContext(`activeSave.transfer.retirements.length`,retirementContext),1);

console.log(`PASS: 12 Saisonen, persistenter Vier-Schritt-Abschluss, einmalige Platzierungsprämien und Gehälter, stabile Karriereenden; Endbudget ${result.balance} Credits`);
