const fs=require('fs'),vm=require('vm'),assert=require('assert');

const source=fs.readFileSync('dist/lineup-ux-v24.js','utf8');
const start=source.indexOf('function v24SwapWithBench('),end=source.indexOf('function v24MoveOnPitch(',start);
assert(start>=0&&end>start,'Taktiktausch muss vorhanden sein');
const outgoing={n:7,name:'Mittelfeld',line:'mid',assignedLine:'mid',cell:17,role:0};
const incoming={n:9,name:'Angreifer',line:'att',assignedLine:'att',cell:7,role:1};
const context={activeSave:{lineup:[7],squad:[outgoing,incoming]},running:false,selected:0,
 syncSquadFromLineup(){},syncLineupFromSquad(){},v24Remember(){},saveCurrent(){},render(){},v24SetStatus(){}};
vm.createContext(context);vm.runInContext(source.slice(start,end),context);
assert.equal(vm.runInContext('v24SwapWithBench(7,9)',context),true);
assert.equal(incoming.line,'att','die Stammposition Angreifer bleibt erhalten');
assert.equal(incoming.assignedLine,'att','der Tausch darf die Einsatzposition nicht stillschweigend ändern');
assert.equal(incoming.cell,17,'der neue Spieler übernimmt den Rasterplatz');
assert.equal(context.activeSave.lineup[0],9);
console.log('PASS: Taktiktausch erhält die Position des eingewechselten Spielers');
