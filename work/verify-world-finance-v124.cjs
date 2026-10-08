const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const root='outputs/finance-v124/',data=JSON.parse(fs.readFileSync(root+'finance-data.json','utf8'));
for(const [file,hash]of Object.entries(data.sourceHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file);
assert.equal(data.seeds,6);assert.equal(data.seasons,10);
assert.equal(data.checks.clubSeasons,5760);assert.equal(data.checks.fixtures,31080);
assert.equal(data.checks.economicClubSeasons+data.checks.simulationClubSeasons,data.checks.clubSeasons);
assert.equal(data.checks.simulationClubSeasons,720);assert(data.checks.simulationReplacements>0);
for(const row of data.rows.filter(item=>item.simulationOnly)){
 assert.equal(row.income,0);assert.equal(row.expense,0);assert.equal(row.closingBalance,0);assert.equal(row.roster,11);
 assert.equal(row.youthPromotions,0);
}
assert(data.rows.every(row=>Number.isInteger(row.youthPromotions)&&row.youthPromotions>=0),'Jugendübernahmen sind tatsächliche ganzzahlige Vorgänge');
assert(fs.readFileSync(root+'finance-clubs.csv','utf8').split(/\r?\n/)[0].includes('youthPromotions'),'CSV enthält die Anzahl der Jugendübernahmen');
const html=fs.readFileSync(root+'finance-report.html','utf8'),embedded=html.match(/const data=(\{.*\});\r?\nconst \$/s);
assert(embedded,'Bericht enthält vollständige Messdaten');assert.deepEqual(JSON.parse(embedded[1]),data);
const offline=fs.readFileSync('outputs/index.html','utf8');
for(const file of ['world-payments-v124.js','world-payments-ui-v124.js','world-foundation-v61.js','world-economy-v66.js','world-transfer-list-v72.js','world-youth-manager-v67.js','world-market-ui-v66.js','world-views-v68.js']){
 // The offline builder embeds the same PNG references as data URLs throughout the source.
 const source=fs.readFileSync('dist/'+file,'utf8').replace(/\r\n/g,'\n').replace(/(?:referees|trophies|sprites|crests)\/[a-z0-9-]+\.png/g,asset=>'data:image/png;base64,'+fs.readFileSync('dist/'+asset).toString('base64'));
 assert(offline.includes(source),file+' im Offline-Build');
}
const browser=JSON.parse(fs.readFileSync(root+'browser-check.json','utf8'));
assert.equal(browser.status,'passed');assert.equal(browser.dataCreatedAt,data.createdAt);
assert.equal(browser.recruitmentBreakdown,true,'Separate Nachwuchs-/Transferauswertung im Browser geprüft');
assert.equal(browser.nativeChecks.length,2);assert(browser.nativeChecks.every(item=>item.finished&&item.valid&&item.simulationProfile&&item.retiredProfile));
fs.writeFileSync(root+'verification.json',JSON.stringify({checkedAt:new Date().toISOString(),audit:data.checks,seeds:data.seeds,seasons:data.seasons,sourceHashes:data.sourceHashes,report:'finance-report.html',browser:'browser-check.json',offlineMatchesSource:true,testFiles:['work/test-world-payments-v124.cjs','work/test-world-economy-v66.cjs','work/test-world-youth-manager-v67.cjs','work/test-world-transfer-list-v72.cjs','work/test-world-storage-v67.cjs','work/check-world-finance-browser-v124.cjs'],status:'passed'},null,2));
console.log('Prüfdaten, Bericht, Nullbuchungen, Quellenprüfsummen, Offline-Build und Browserabschluss stimmen überein.');
