const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

function setup(){
 const context=makeContext();
 for(const file of ['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js'])
  vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
 vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe')",context);
 return context;
}

const context=setup();
assert.equal(vm.runInContext("v51StatusHTML({form:2,fresh:71}).includes('scaleX(0.710)')",context),true,'bar uses exact freshness rather than one of five fixed images');
assert.equal(vm.runInContext("decodeURIComponent(v51StatusFaces['very-good']).includes('fill=\"#EE6C64\"')",context),true,'selected face design is bundled');
vm.runInContext("activeSave.squad.find(player=>!activeSave.lineup.includes(player.n)).fresh=50;start();match.elapsed=75;finishMatch()",context);
const whistle=JSON.parse(vm.runInContext(`JSON.stringify({
 starter:activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh,
 keeper:activeSave.keeper.fresh,
 bench:activeSave.squad.find(player=>!activeSave.lineup.includes(player.n)).fresh,
 pending:activeSave.pendingPlayedRecovery?.length
})`,context));
assert.equal(whistle.pending,6,'all six players are marked for recovery');
assert.equal(whistle.bench,74,'bench recovery remains unchanged');
vm.runInContext('renderCenter()',context);
const rested=JSON.parse(vm.runInContext(`JSON.stringify({
 starter:activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh,
 keeper:activeSave.keeper.fresh,
 bench:activeSave.squad.find(player=>!activeSave.lineup.includes(player.n)).fresh,
 pending:activeSave.pendingPlayedRecovery
})`,context));
assert(Math.abs(rested.starter-Math.min(100,whistle.starter+16))<.001,'starter recovers between games');
assert(Math.abs(rested.keeper-Math.min(100,whistle.keeper+16))<.001,'keeper recovers between games');
assert.equal(rested.bench,whistle.bench,'bench is not credited twice');
assert.equal(rested.pending,undefined,'recovery marker is cleared');
vm.runInContext('renderCenter()',context);
assert(Math.abs(vm.runInContext('activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh',context)-rested.starter)<.001,'repeated rendering cannot duplicate recovery');

const reloaded=setup();
vm.runInContext('start();match.elapsed=75;finishMatch()',reloaded);
const beforeReload=vm.runInContext('activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh',reloaded);
vm.runInContext('openSlot(structuredClone(activeSave))',reloaded);
const afterReload=vm.runInContext('activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh',reloaded);
assert(Math.abs(afterReload-Math.min(100,beforeReload+16))<.001,'recovery survives loading a saved game');
vm.runInContext('renderCenter()',reloaded);
assert(Math.abs(vm.runInContext('activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh',reloaded)-afterReload)<.001,'loaded recovery remains idempotent');

const cupPending=setup();
vm.runInContext('start();match.elapsed=75;finishMatch();activeSave.cup.pending={phase:"choose"}',cupPending);
const beforeDecision=vm.runInContext('activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh',cupPending);
assert.equal(vm.runInContext('v52ApplyRecovery()',cupPending),false,'a pending cup shootout delays recovery');
assert.equal(vm.runInContext('activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh',cupPending),beforeDecision);
vm.runInContext('activeSave.cup.pending=null;renderCenter()',cupPending);
assert(Math.abs(vm.runInContext('activeSave.squad.find(player=>activeSave.lineup.includes(player.n)).fresh',cupPending)-Math.min(100,beforeDecision+16))<.001,'recovery follows cup decision');

console.log('PASS: variant A, continuous bar, post-match recovery, reload and no double credit');
