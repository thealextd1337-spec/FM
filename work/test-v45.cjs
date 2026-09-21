const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {makeContext}=require('./test-v41.cjs');
const context=makeContext();
for(const file of['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);

vm.runInContext("v44Choice.keeper='violet';beginSquadSetup();autoSelectSquad();confirmInitialSquad()",context);
assert.equal(vm.runInContext('activeSave.world.kits.keeper.main',context),'#b89af0');
assert.equal(vm.runInContext('activeSave.world.kits.keeper.style',context),'halves');
assert.equal(vm.runInContext('v45KeeperOptions.length',context),6);
assert.equal(vm.runInContext("v45DistinctKeeper(activeSave.world.kits.keeper,{main:'#2244aa'},{main:'#ffcc22'}).main",context),'#b89af0');
assert(vm.runInContext("v45DistinctKeeper({main:'#2244aa',trim:'#fff',style:'solid'},{main:'#2244aa'},{main:'#ffcc22'}).main!=='#2244aa'",context));
console.log('PASS: six goalkeeper shirts, saved choice and contrasting match shirt');
