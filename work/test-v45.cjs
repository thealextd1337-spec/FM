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
const pairs=JSON.parse(vm.runInContext(`JSON.stringify(activeSave.world.teams.map(team=>({id:team.id,keeper:team.kits.keeper,alternate:team.kits.keeperAlt})))`,context));
assert.equal(new Set(pairs.map(team=>team.keeper.main)).size,pairs.length,'opponents have their own fixed goalkeeper shirts');
assert(pairs.every(team=>team.alternate&&team.alternate.main!==team.keeper.main),'each club saves two goalkeeper shirts');
assert(vm.runInContext('activeSave.world.kits.keeperAlt.main!==activeSave.world.kits.keeper.main',context),'own club saves a second shirt');
const restart=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const own=activeSave.world.kits,other=activeSave.world.teams[0].kits;
 const first=v45ResolveKeeperPair(own,other,{main:'#e5b56a'},{main:other.keeper.main});
 const second=v45ResolveKeeperPair(own,other,{main:'#e5b56a'},{main:other.keeper.main});
 return{first,second};
})())`,context));
assert.deepEqual(restart.first,restart.second,'keeper choice is stable for the same fixture');
assert(['#b89af0',vm.runInContext('activeSave.world.kits.keeperAlt.main',context)].includes(restart.first.user.main));
assert([pairs[0].keeper.main,pairs[0].alternate.main].includes(restart.first.opponent.main));
assert.notEqual(restart.first.user.main,restart.first.opponent.main,'keepers differ when the club pairs permit it');
const migrated=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const old=structuredClone(activeSave);
 delete old.world.kits.keeperAlt;
 for(const team of old.world.teams){team.kits.keeper=v45KeeperKit('gold');delete team.kits.keeperAlt}
 const restored=ensureChampionship(old);
 return{own:restored.world.kits.keeper.main,ownAlternate:restored.world.kits.keeperAlt.main,opponents:restored.world.teams.map(team=>({id:team.id,keeper:team.kits.keeper.main,alternate:team.kits.keeperAlt.main}))};
})())`,context));
assert.equal(migrated.own,'#b89af0','existing careers keep their chosen own keeper shirt');
assert.notEqual(migrated.ownAlternate,migrated.own);
assert.deepEqual(migrated.opponents,pairs.map(team=>({id:team.id,keeper:team.keeper.main,alternate:team.alternate.main})),'existing careers get stable club-specific pairs');
console.log('PASS: six goalkeeper shirts, saved choice and contrasting match shirt');
