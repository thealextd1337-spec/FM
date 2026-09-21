const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');

function makeContext(){
 const elements=new Map(),storage=new Map(),scoreboard=[];
 function element(){return{innerHTML:'',textContent:'',hidden:false,value:'',checked:false,disabled:false,dataset:{},className:'',files:[],style:{setProperty(){}},classList:{toggle(){},remove(){},add(){}},firstChild:null,setAttribute(){},addEventListener(){},append(){},before(){},prepend(){},remove(){},focus(){},click(){},scrollIntoView(){},insertAdjacentElement(){},insertAdjacentHTML(){},replaceChildren(value){this.textContent=value?.textContent??value??''},querySelector(){return element()},querySelectorAll(){return[]},closest(){return null},getContext(){return{clearRect(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},ellipse(){},save(){},clip(){},restore(){},fillText(){}}}}}
 scoreboard.push(element(),element());const body=element(),document={documentElement:element(),head:element(),body,querySelector(selector){if(selector==='body')return body;if(!elements.has(selector))elements.set(selector,element());return elements.get(selector)},querySelectorAll(selector){return selector==='.scoreboard span'?scoreboard:[]},createElement:element,createTextNode:text=>text};
 elements.set('#club-name',Object.assign(element(),{value:'FC Dauertest'}));elements.set('#club-primary',Object.assign(element(),{value:'#2244aa'}));elements.set('#club-secondary',Object.assign(element(),{value:'#ffcc22'}));
 const customMath=Object.create(Math);customMath.random=Math.random;
 const context={document,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},window:{scrollY:0,pageYOffset:0,scrollTo(){}},location:{protocol:'file:'},crypto,structuredClone,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},alert:message=>{throw Error(message)},confirm:()=>true,fetch:async()=>({ok:true}),console,Math:customMath,Date,Blob:global.Blob,URL:{createObjectURL:()=>'',revokeObjectURL(){}}};
 vm.createContext(context);for(const file of['game.js','manager-v11.js','identity-v12.js','season-v13.js','halftime-v14.js','finance-v15.js','transfer-v16.js','qol-v17.js','player-card-v18.js','sponsor-fix-v26.js','season-finale-v31.js','dashboard-layout-v32.js','awards-v40.js','cup-v41.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);return context
}

const context=makeContext();
vm.runInContext(`beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure();`,context);
assert.equal(vm.runInContext('activeSave.cupEnabled',context),true);
const initial=JSON.parse(JSON.stringify(vm.runInContext('activeSave.cup',context)));
assert.equal(initial.rounds[0].length,2);assert.equal(initial.rounds[1].length,2);assert.equal(initial.rounds[2].length,1);
let cupMatches=0,leagueMatches=0;
while(vm.runInContext('activeSave.currentRound',context)<10){
 const cup=Boolean(vm.runInContext('Boolean(v41CupGameForUser())',context));
 vm.runInContext(`start();if(!running)throw Error('Match did not start');match.score=[2,0];finishMatch()`,context);
 if(cup)cupMatches++;else leagueMatches++;
 if(cupMatches+leagueMatches>13)throw Error('Cup or league progression stalled');
}
const result=JSON.parse(JSON.stringify(vm.runInContext(`({round:activeSave.currentRound,cupStage:activeSave.cup.stage,cupWinner:activeSave.cup.winner,cupMatches:activeSave.cup.rounds.flat().filter(game=>game.result).length,leagueGames:activeSave.schedule.flat().filter(game=>game.result).length,ownLeague:currentStats(activeSave.squad[0]).games,ownCup:activeSave.squad[0].cupSeasons?.find(s=>s.number===1)?.games||0,awardHistory:activeSave.awardHistory||[],cupEntries:activeSave.finance.ledger.filter(e=>e.type==='cup').length})`,context)));
assert.equal(leagueMatches,10);assert(cupMatches>=2&&cupMatches<=3);assert.equal(result.round,10);assert.equal(result.cupStage,3);assert.equal(result.cupWinner,'user');assert.equal(result.cupMatches,5);assert.equal(result.leagueGames,30);assert.equal(result.ownLeague,10);assert.equal(result.ownCup,cupMatches);assert.equal(result.cupEntries,1);assert(result.awardHistory.some(item=>item.type==='cup'));
vm.runInContext('v41CupAdvance();seasonSnapshot();seasonSnapshot()',context);
assert.equal(vm.runInContext("activeSave.finance.ledger.filter(e=>e.type==='cup').length",context),1);
assert.equal(vm.runInContext("activeSave.awardHistory.filter(e=>e.type==='league').length",context),1);
assert(vm.runInContext("Boolean(activeSave.clubHistory.find(e=>e.number===1)?.awards?.championId)",context));
const summary=vm.runInContext("v31SummaryHTML({snapshot:seasonSnapshot(),topThree:[]})",context);
for(const label of['Saison-Auszeichnungen','Torschützenkönig','Bester Spieler','Abschlusstabelle','Pokalsieger','Glückwunsch zum Pokalsieg'])assert(summary.includes(label),label);
const penalty=JSON.parse(JSON.stringify(vm.runInContext('v41Shootout(match.people.filter(p=>p.t===0),match.people.filter(p=>p.t===1))',context)));
assert.equal(new Set(penalty.kicks.filter(k=>k.side===0).slice(0,6).map(k=>k.number)).size,Math.min(6,penalty.kicks.filter(k=>k.side===0).length));
const longPenalty=JSON.parse(JSON.stringify(vm.runInContext("Math.random=()=>0;v41Shootout(match.people.filter(p=>p.t===0),match.people.filter(p=>p.t===1))",context)));
for(const side of[0,1])assert.equal(new Set(longPenalty.kicks.filter(k=>k.side===side).slice(0,6).map(k=>k.number)).size,6);
assert.equal(longPenalty.kicks.filter(k=>k.side===0).length,longPenalty.kicks.filter(k=>k.side===1).length);
console.log('PASS: cup bracket, ten league rounds, separate cup statistics, winner award, single prize, penalty order');
