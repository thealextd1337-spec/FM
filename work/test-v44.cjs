const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {makeContext}=require('./test-v41.cjs');
const context=makeContext();
for(const file of['penalties-v42.js','club-records-v43.js','club-identity-v44.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);

vm.runInContext("v44Choice.home='hoops';v44Choice.away='diagonal';v44Choice.shape='circle';v44Choice.decoration='chevron';var v44TestWorld=makeWorld('#000000','#ffffff',true)",context);
const kits=JSON.parse(JSON.stringify(vm.runInContext('v44TestWorld.kits',context)));
assert.equal(kits.home.style,'hoops');
assert.equal(kits.away.style,'diagonal');
assert.deepEqual(kits.crest,{shape:'circle',decoration:'chevron'});
assert(vm.runInContext("luminance(v44Accent('#000000'))>=.24",context));
assert(vm.runInContext("crestHTML('FC Test',v44TestWorld.kits)",context).includes('Vereinswappen FC Test'));
assert(vm.runInContext("v44ShirtSVG({n:9},v44TestWorld.kits.home)",context).includes('>9</text>'));
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();applyClubTheme()",context);
assert.equal(vm.runInContext('activeSave.world.kits.home.style',context),'hoops');
assert.equal(vm.runInContext('activeSave.world.kits.away.style',context),'diagonal');
assert.equal(vm.runInContext('activeSave.world.kits.crest.shape',context),'circle');

vm.runInContext(`var v44TeamA=v42Teams[0],v44TeamB=v42Teams[2];var v44SessionTest={mode:'demo',ownName:v44TeamA.name,opponentName:v44TeamB.name,ownColour:v42Colour(v44TeamA.id),opponentColour:v42Colour(v44TeamB.id),own:v42DemoRoster(v44TeamA),opponent:v42DemoRoster(v44TeamB),order:[1,2,4,6,7,9],opponentOrder:[2,4,6,7,9,1],score:[0,0],kicks:[],phase:'shooting'};`,context);
const scene=vm.runInContext('v42SceneHTML(v44SessionTest)',context);
assert(scene.includes('v44-keeper-shirt'));
assert(scene.includes('Torwarttrikot'));
assert(scene.includes('v42-shooter'));
assert.equal((scene.match(/aria-label="Torwarttrikot"/g)||[]).length,2);
console.log('PASS: six kit patterns, crest selection, dark colour contrast and penalty keeper shirt');
