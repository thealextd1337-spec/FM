const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext();
for(const file of ['next-match-v49.js','opponent-profile-v54.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
vm.runInContext("beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe')",context);

const preview=vm.runInContext('v49PreviewHTML()',context);
assert.match(preview,/>Heim<\/span>/);
assert.match(preview,/>Auswärts<\/span>/);
assert.equal((preview.match(/<title>Österreich<\/title>/g)||[]).length,2,'both clubs carry the chosen Austrian flag');
assert.doesNotMatch(preview,/links älter, rechts neuer/i);

const empty=vm.runInContext("v54TeamHTML(worldTeam('nord'))",context);
assert.match(empty,/SV Nordring/);
assert.match(empty,/Kader · 9 Spieler/);
assert.match(empty,/noch kein Spiel bestritten/);
vm.runInContext("activeSave.schedule.flat().find(game=>game.home==='nord'||game.away==='nord').result=[1,0]",context);
const played=vm.runInContext("v54TeamHTML(worldTeam('nord'))",context);
assert.match(played,/Letzte genutzte Aufstellung · 2–2–1/);
assert.doesNotMatch(played,/noch kein Spiel bestritten/);
for(const name of vm.runInContext("aiLineup(worldTeam('nord')).map(player=>player.name)",context))assert(played.includes(name),`last lineup includes ${name}`);
assert.match(played,/Startelf/);
assert.match(played,/Bank/);

assert.match(vm.runInContext("v54StrengthSentence(worldTeam('nord'))",context),/Augenhöhe/);
assert.match(fs.readFileSync('dist/opponent-profile-v54.js','utf8'),/row\.setAttribute\('role','button'\)/,'table rows are keyboard-operable');
console.log('PASS: fixture captions and flags, opponent squad and last lineup, short strength sentence');
