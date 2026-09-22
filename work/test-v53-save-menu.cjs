const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext();
vm.runInContext(`
 const legacySave=ensureChampionship({schema:3,id:'legacy-save',club:'Alter Verein',updated:new Date().toISOString(),world:{teams:[]}});
 localStorage.setItem(SAVE_KEY,JSON.stringify([legacySave]));
 drawSlots();
 const currentSave={...structuredClone(legacySave),schema:4,id:'current-save',club:'Neuer Verein'};
 localStorage.setItem('sechser.saves.v4',JSON.stringify([currentSave]));
`,context);
for(const file of ['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v53.js'])
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);

const menu=vm.runInContext("document.querySelector('#save-list').innerHTML",context);
assert.match(menu,/data-load="current-save"/,'current saves must appear on initial load');
assert.doesNotMatch(menu,/legacy-save/,'incompatible saves must not remain as dead buttons');

vm.runInContext(`
 const deleteButton={dataset:{delete:'current-save'},closest(selector){return selector==='[data-delete]'?this:null}};
 document.querySelector('#save-list').onclick({target:deleteButton});
`,context);
assert.equal(vm.runInContext('readSlots().length',context),0,'confirmed deletion must remove the current save');
assert.doesNotMatch(vm.runInContext("document.querySelector('#save-list').innerHTML",context),/current-save/,'deleted save must disappear immediately');
console.log('PASS: current saves replace legacy buttons and confirmed deletion updates storage and menu');
