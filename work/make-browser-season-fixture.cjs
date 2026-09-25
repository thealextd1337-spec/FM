/* Einmaliger, deterministischer Saisonend-Spielstand für den sichtbaren UI-Test. */
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
let id=0;
const context=vm.createContext({crypto:{randomUUID:()=>`browser-season-${++id}`}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
for(const file of ['world-economy-v66.js','world-transfer-list-v72.js','world-youth-manager-v67.js','world-honours-v74.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const call=(name,...args)=>vm.runInContext(name,context)(...args);
const career=call('v61CreateCareer','GER-2','browser-season-transition');
const own=career.world.clubs.find(club=>club.id===career.manager.managedClubId);
call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);
while(career.world.market.phase==='open')call('v66NextMarketDay',career);
let days=0;
while(!career.world.seasonFinished){call('v62AdvanceDay',career);assert(++days<100,'Saisonende nicht erreicht')}
assert.strictEqual(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true);
assert.strictEqual(career.world.season,1);
fs.writeFileSync('work/browser-season-fixture.json',JSON.stringify({game:'Doppel 6',format:'world',schema:14,modelVersion:10,exported:new Date().toISOString(),save:career}));
console.log(`Saisonend-Spielstand erzeugt: ${days} Kalenderschritte, ${career.world.clubs.length} Vereine.`);
