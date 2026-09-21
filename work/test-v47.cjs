const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {makeContext}=require('./test-v41.cjs');
const context=makeContext();
for(const file of['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
assert.equal(vm.runInContext("teamShortCode('Athletik 06')",context),'ATH');
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');start()",context);
assert(vm.runInContext('Boolean(match)',context));
vm.runInContext("match.people[0].stats.assists=1;match.people[1].stats.goals=1;match.score=[1,0];finishMatch()",context);
const html=vm.runInContext('v47Dialog.innerHTML',context);
for(const label of['Spielbericht','Teamstatistik','Aufs Tor','Ballbesitz','Passquote','Note','Vorlagen'])assert(html.includes(label),label);
assert(html.includes('FC Dauertest'));
assert(html.includes('>1</b>'));

const cupContext=makeContext();
for(const file of['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),cupContext);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');v41CupEnsure()",cupContext);
let count=0;
while(!vm.runInContext('Boolean(v41CupGameForUser())',cupContext)){
 vm.runInContext('start();match.score=[2,0];finishMatch();renderCenter()',cupContext);
 if(++count>4)throw Error('Cup game did not arrive');
}
vm.runInContext('start();match.score=[1,1];finishMatch()',cupContext);
assert.equal(vm.runInContext('activeSave.cup.pending.phase',cupContext),'choose');
assert.equal(vm.runInContext('activeSave.cup.pending.report.players.length',cupContext),12);
assert.equal(vm.runInContext('activeSave.cup.pending.report.score.join(":")',cupContext),'1:1');
console.log('PASS: compact team codes, both post-match squads, assists and persisted cup report');
