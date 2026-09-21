const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {makeContext}=require('./test-v41.cjs');
const context=makeContext();
vm.runInContext(fs.readFileSync('dist/club-records-v43.js','utf8'),context);
vm.runInContext(`
 const recordPlayer=(pid,name,nation,games,goals,cupGames=0,cupGoals=0)=>({pid,name,nation,seasons:[{number:1,games,goals}],cupSeasons:[{number:1,games:cupGames,goals:cupGoals}]});
 activeSave={club:'FC Test',seasonNumber:2,keeper:recordPlayer('keeper','Keeper','AT',11,0),squad:[recordPlayer('one','Anton','AT',10,7,2,2),recordPlayer('two','Bela','DE',16,4,1,0)],formerPlayers:[{player:recordPlayer('old','Cem','TR',12,10,3,1)},{player:recordPlayer('one','Anton','AT',1,0)}],awardHistory:[{season:1,type:'league',scorer:{name:'Cem',nation:'TR',club:'FC Test',games:10,goals:8},best:{name:'Bela',nation:'DE',club:'FC Test',games:10,goals:3,assists:5}},{season:1,type:'cup',winner:'user',winnerName:'FC Test'}]};
`,context);
const records=JSON.parse(JSON.stringify(vm.runInContext('v43Records()',context)));
assert.equal(records.scorer.player.name,'Cem');
assert.equal(records.scorer.games,15);
assert.equal(records.scorer.goals,11);
assert.equal(records.appearances.player.name,'Bela');
assert.equal(records.appearances.games,17);
const html=vm.runInContext('v43RecordsHTML()',context);
for(const label of['Awards & Vereinsrekorde','Meiste Tore','Meiste Einsätze','Cem','Bela','15 Pflichtspiele · 11 Tore','17 Pflichtspiele · 4 Tore','Torschützenkönig','Bester Spieler','Pokalsieger'])assert(html.includes(label),label);
assert.equal((html.match(/record-award/g)||[]).length,3);
console.log('PASS: Vereinsrekorde zählen Liga und Pokal, frühere Spieler bleiben sichtbar, Awards erscheinen');
