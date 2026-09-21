const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {makeContext}=require('./test-v41.cjs');
const context=makeContext();
vm.runInContext(fs.readFileSync('dist/penalties-v42.js','utf8'),context);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure()",context);
let count=0;
while(!vm.runInContext('activeSave.currentRound>=8&&activeSave.cup.stage===2&&Boolean(v41CupGameForUser())',context)){
 vm.runInContext("start();match.score=[2,0];finishMatch();renderCenter()",context);
 if(++count>13)throw Error('Final did not arrive');
}
vm.runInContext('start();match.score=[1,1];finishMatch()',context);
assert.equal(vm.runInContext('activeSave.cup.pending.phase',context),'choose');
assert.equal(vm.runInContext('activeSave.cup.rounds[2][0].result',context),null);
assert.equal(vm.runInContext('activeSave.currentRound',context),8);
const leagueGames=vm.runInContext('currentStats(activeSave.squad[0]).games',context);
vm.runInContext("v42Session.phase='shooting';v42Save();v42NextKick();activeSave.cup.pending=JSON.parse(JSON.stringify(activeSave.cup.pending));renderCenter()",context);
assert.equal(vm.runInContext('v42Session.kicks.length',context),1);
assert.equal(vm.runInContext('activeSave.cup.pending.kicks.length',context),1);
for(let i=0;i<100&&vm.runInContext("v42Session.phase!=='done'",context);i++)vm.runInContext('v42NextKick()',context);
assert.equal(vm.runInContext('activeSave.cup.pending',context),null);
assert.equal(vm.runInContext('activeSave.cup.stage',context),3);
assert.equal(vm.runInContext('activeSave.cup.rounds[2][0].result.join(\":\")',context),'1:1');
assert.equal(vm.runInContext('activeSave.currentRound',context),8);
assert.equal(vm.runInContext('currentStats(activeSave.squad[0]).games',context),leagueGames);
assert.equal(vm.runInContext("activeSave.awardHistory.filter(item=>item.type==='cup').length",context),1);
assert(vm.runInContext('activeSave.cup.rounds[2][0].penalties[0]!==activeSave.cup.rounds[2][0].penalties[1]',context));
const oldLedger=vm.runInContext('activeSave.finance.ledger.length',context);
vm.runInContext("document.querySelector('#v42-own-team').value='elite-rot';document.querySelector('#v42-opp-team').value='amateur-gruen';document.querySelector('#v42-demo-start').onclick();v42Session.phase='shooting'",context);
assert.equal(vm.runInContext('v42Session.mode',context),'demo');
assert(vm.runInContext('v42PenaltyChance(v42Session.own[0],v42Session.opponent.find(p=>p.keeper))>v42PenaltyChance(v42Session.opponent[0],v42Session.own.find(p=>p.keeper))',context));
for(let i=0;i<100&&vm.runInContext("v42Session.phase!=='done'",context);i++)vm.runInContext('v42NextKick()',context);
assert.equal(vm.runInContext('activeSave.finance.ledger.length',context),oldLedger);
for(const side of[0,1])assert.equal(new Set(vm.runInContext(`v42Session.kicks.filter(k=>k.side===${side}).slice(0,6).map(k=>k.number)`,context)).size,Math.min(6,vm.runInContext(`v42Session.kicks.filter(k=>k.side===${side}).length`,context)));
vm.runInContext("document.querySelector('#v42-demo-start').onclick();v42Session.phase='shooting'",context);
for(const rolls of[[0,.2],[.99,0,0],[.99,.99,0,.99],[.99,.99,.99,.99]]){
 context.rolls=rolls;
 vm.runInContext('Math.random=()=>rolls.shift();v42NextKick()',context);
}
assert.equal(vm.runInContext('v42Session.kicks.map(kick=>kick.outcome).join(",")',context),'goal,save,wide,high');
assert.equal(vm.runInContext('v42Session.kicks.every(kick=>kick.goal===(kick.outcome==="goal"))',context),true);
assert(vm.runInContext("v42SceneHTML(v42Session).includes('v42-stands')&&v42SceneHTML(v42Session).includes('Trikot Nummer')",context));
console.log('PASS: post-match penalty choice, persisted kicks, demo isolation, unique shooters and distinct shot outcomes');
