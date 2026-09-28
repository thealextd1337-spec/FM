const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('dist/world-physical-v65.js','utf8');
const code=source.slice(source.indexOf('function v65Side'),source.indexOf('function v65LineupPositions'));
const context=vm.createContext({
 v62Current:career=>career.world.competitions,
 v62Table:()=>[{clubId:'away'},{clubId:'home'}]
});
vm.runInContext(code,context);
const labels=vm.runInContext('v65LiveRankLabels',context);
const clubs=[{id:'home'},{id:'away'}];
const fixture={competitionId:'league',round:'R3',homeId:'home',awayId:'away'};
const career={world:{clubs,competitions:[{id:'league',type:'league',fixtures:[fixture]},{id:'europe',type:'europe',entrants:['home','away'],fixtures:[fixture]},{id:'cup',type:'cup',fixtures:[fixture]}]}};
const view=(competitionId,round,ownSide=0)=>Array.from(labels({career,fixture:{...fixture,competitionId,round},ownSide}));
assert.deepEqual(view('league','R3'),['(2.)','(1.)']);
assert.deepEqual(view('league','R3',1),['(1.)','(2.)'],'Auswärtsteam wird aus seiner eigenen Sicht korrekt zugeordnet');
assert.deepEqual(view('europe','R4'),['(2.)','(1.)']);
assert.deepEqual(view('europe','SF'),[],'in der K.-o.-Phase steht kein Ligaplatz');
assert.deepEqual(view('cup','SF'),[],'im nationalen Pokal steht kein Ligaplatz');
console.log('Live-Tabelle: Plätze in Liga und Ligaphase, Heim- und Auswärtssicht sowie K.-o.-Ausnahmen geprüft.');
