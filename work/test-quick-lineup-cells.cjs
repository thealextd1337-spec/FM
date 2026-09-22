const fs=require('fs'),vm=require('vm'),assert=require('assert');

const source=fs.readFileSync('dist/qol-v17.js','utf8');
const start=source.indexOf('function balancedSelection('),end=source.indexOf('/* Five-day transfer market',start);
assert(start>=0&&end>start,'Schnellaufstellung muss vorhanden sein');
const squad=[
 {n:1,line:'def',assignedLine:'def',cell:26,fresh:80},
 {n:2,line:'def',assignedLine:'def',cell:28,fresh:80},
 {n:3,line:'mid',assignedLine:'mid',cell:16,fresh:80},
 {n:4,line:'mid',assignedLine:'mid',cell:18,fresh:80},
 {n:5,line:'att',assignedLine:'att',cell:7,fresh:40},
 {n:6,line:'att',assignedLine:'att',cell:16,fresh:100}
];
const save={lineup:[1,2,3,4,5],squad,quickLineup:{previous:null}};
const context={activeSave:save,running:false,activeOutfield:()=>squad,transferQuality:()=>10,
 normalizeLineup(){},syncLineupFromSquad(){},saveCurrent(){},renderCenter(){}};
vm.createContext(context);vm.runInContext(source.slice(start,end),context);
assert.equal(vm.runInContext("applyQuickLineup('fresh')",context),true);
const starters=save.lineup.map(number=>squad.find(player=>player.n===number));
assert.equal(new Set(starters.map(player=>player.cell)).size,5,'fünf Startspieler brauchen fünf verschiedene Rasterfelder');
assert.equal(squad[2].cell,16,'bereits aufgestellte Spieler behalten ihren Platz');
assert.equal(squad[5].line,'att');assert.equal(squad[5].assignedLine,'att');
assert.equal(vm.runInContext("applyQuickLineup('restore')",context),true);
assert.deepEqual(save.lineup,[1,2,3,4,5]);
Object.assign(squad[4],{tak:1,pos:1,fin:1,tec:1});
Object.assign(squad[5],{tak:18,pos:18,fin:18,tec:18});
for(const mode of ['defensive','offensive']){
 assert.equal(vm.runInContext(`applyQuickLineup('${mode}')`,context),true);
 const cells=save.lineup.map(number=>squad.find(player=>player.n===number).cell);
 assert.equal(new Set(cells).size,5,`${mode} braucht eindeutige Rasterfelder`);
 assert.equal(vm.runInContext("applyQuickLineup('restore')",context),true);
}
console.log('PASS: Schnellaufstellung vergibt eindeutige Rasterfelder und lässt Stammpositionen bestehen');
