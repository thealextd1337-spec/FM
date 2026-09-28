const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let nextId=0;
const context=vm.createContext({crypto:{randomUUID:()=>`market-${++nextId}`}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
vm.runInContext(fs.readFileSync('dist/world-economy-v66.js','utf8'),context);
context.escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const market=fs.readFileSync('dist/world-market-ui-v66.js','utf8');
vm.runInContext(market.slice(0,market.indexOf('const v66BaseSetCareerTab=')),context);
const career=vm.runInContext('v61CreateCareer',context)('GER-2','market-nationalities');
const filter=vm.runInContext('v66Filter',context);
const marketPlayers=vm.runInContext('v66MarketPlayers',context);
const marketHTML=vm.runInContext('v66MarketHTML',context);
const free=career.world.market.freePlayers[0];

filter.country='FRA';filter.nationality=free.nation;filter.club='free';
let results=marketPlayers(career);
assert(results.length>0&&results.some(item=>item.player.pid===free.pid));
assert(results.every(item=>!item.club&&item.player.nation===free.nation),'Vereinsland darf freie Spieler nicht filtern');

filter.club='all';filter.country='GER';
results=marketPlayers(career);
assert(results.some(item=>item.club&&item.club.countryId==='GER'),'gebundene Profis bleiben auffindbar');
assert(results.every(item=>item.club?item.club.countryId==='GER':item.player.nation===free.nation),'beide Filter wirken unabhängig');

filter.club='free';filter.nationality=vm.runInContext('v79Nationalities',context).find(nation=>!career.world.market.freePlayers.some(player=>player.nation===nation.code)).code;
assert.equal(marketPlayers(career).length,0);
let html=marketHTML(career);
assert(html.includes('Keine Spieler in dieser Auswahl.'),'leere Nationalitätsauswahl ist erklärt');
const options=html.match(/<select id="v66-nationality">([\s\S]*?)<\/select>/)?.[1];
assert(options,'eigener Nationalitätsfilter ist sichtbar');
assert.equal((options.match(/<option /g)||[]).length,102,'alle 101 Nationalitäten plus Sammeloption sind auswählbar');

filter.nationality=free.nation;
html=marketHTML(career);
assert(html.includes(` · ${vm.runInContext('v79NationName',context)(free.nation)} · `),'Spielerkarten zeigen den Landesnamen');
console.log('PASS: getrennte Marktfilter, 101 Nationalitäten, leere Auswahl und Landesname');
