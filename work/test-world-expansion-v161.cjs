'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const values=new Map();let uuid=0;
const context=vm.createContext({crypto:{randomUUID:()=>`expansion-test-${++uuid}`},structuredClone,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},location:{protocol:'http:',hostname:'test.invalid',search:''},URLSearchParams});context.window=context;
const read=f=>fs.readFileSync('dist/'+f,'utf8'),run=f=>vm.runInContext(read(f),context,{filename:f}),call=(n,...args)=>vm.runInContext(n,context)(...args),copy=o=>JSON.parse(JSON.stringify(o));
const penalty=read('penalties-v42.js');vm.runInContext(penalty.slice(penalty.indexOf('function v42Composure('),penalty.indexOf('function v42OrderHTML(')),context);
for(const f of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js','player-generation.js','player-effective-abilities.js','player-freshness.js','player-load-candidate-v158.js','player-development.js','player-aging.js','player-role-suitability.js','player-position-routine.js','player-tactic-transitions.js','player-match-ratings.js','player-foundation-preview-v153.js','world-player-foundation-v153.js','world-player-roles-v154.js','world-player-performance-v155.js','world-player-load-v158.js'])run(f);
const foundation=read('world-foundation-v61.js');vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
for(const f of ['world-economy-v66.js','world-youth-manager-v67.js','world-transfer-list-v72.js','world-honours-v74.js','world-payments-v124.js'])run(f);
// Freeze legacy generation before loading expansion: added profiles cannot alter it.
const old=call('v61CreateCareer','GER-2','ap03-legacy','QA',null),oldWorld=JSON.stringify(old.world),oldNative=JSON.stringify(call('v61CreateCareer','GER-2','ap03-native-legacy','QA').world);
for(const f of ['world-expansion-catalog-v161.js','world-expansion-v161.js'])run(f);
const sponsorIds=new Set();for(const [country,brands]of Object.entries(vm.runInContext('v66SponsorBrands',context))){assert.equal(brands.length,6);for(const brand of brands){assert.ok(!sponsorIds.has(brand.id));sponsorIds.add(brand.id);for(const compact of [false,true]){const svg=call('v66SponsorLogoSVG',country,{name:brand.name,brandId:brand.id},compact);assert.ok(!svg.includes('undefined')&&!svg.includes('var(--'));}}}assert.equal(sponsorIds.size,72);
assert.equal(JSON.stringify(old.world),oldWorld);
assert(call('v61ValidateCareer',old));
const oldAgain=call('v61CreateCareer','GER-2','ap03-legacy','QA',null);assert.equal(JSON.stringify(oldAgain.world),oldWorld);
assert.equal(JSON.stringify(call('v61CreateCareer','GER-2','ap03-native-legacy','QA').world),oldNative);
const rows=[];
for(const seed of ['ap03-expansion-one','ap03-expansion-two']){
 const career=call('v161CreateCareer','AUT-5',seed,'QA'),world=career.world;
 assert.equal(career.schema,15);assert.equal(career.modelVersion,11);assert.equal(career.phase,'world-foundation');assert.equal(world.clubs.length,192);assert.equal(world.countries.length,12);assert.equal(world.competitions.length,0);assert(call('v61ValidateCareer',career));
 assert.equal(world.clubs.find(c=>c.id==='AUT-5').name,'Innsbruck Sport');
 assert.equal(world.clubs.filter(c=>c.simulationOnly).length,96);
 assert.equal(world.clubs.filter(c=>c.leagueId).length,96);
 for(const club of world.clubs){assert(call('v61ValidClubKits',club.kits),club.id);assert.ok(club.roster.length>=11&&club.roster.length<=14);assert.ok(club.roster.every(p=>p.playerModel?.roleModel&&p.playerModel.freshnessState));assert.ok(club.sponsors.every(s=>s.brandId));if(club.simulationOnly){assert.equal(club.balance,0);assert.equal(club.ledger.length,0);assert.equal(club.youthPool.length,0);}else assert.ok(club.youthPool.length+club.roster.filter(p=>p.age===17).length>=2);}
 for(const country of world.countries){assert.equal(world.clubs.filter(c=>c.countryId===country.id).length,16);assert(world.market.freePlayers.some(p=>p.pid.includes(':'+country.id+':FREE')));assert(vm.runInContext('v79YouthPartners',context)[country.id]);}
 const again=call('v161CreateCareer','AUT-5',seed,'QA');assert.equal(JSON.stringify(world),JSON.stringify(again.world));
 const mean=club=>club.roster.reduce((sum,p)=>sum+call('v66Skill',p),0)/club.roster.length;
 assert(mean(world.clubs.find(c=>c.id==='GRE-1'))>Math.min(...world.clubs.filter(c=>c.leagueId&&c.expansionTier==='A').map(mean)),'Starke kleine Liga kann schwachen A-Verein herausfordern');
 const before=JSON.stringify(career);assert(call('v61ValidateCareer',copy(career)));assert.equal(JSON.stringify(career),before);assert.throws(()=>call('v62AdvanceDay',career),/noch nicht vorbereitet/);
 const reordered=copy(career);reordered.world.rules=Object.fromEntries(Object.entries(reordered.world.rules).reverse());assert(call('v61ValidateCareer',reordered));
 for(const mutate of [c=>c.world.rules.variant='unknown',c=>c.world.clubs.pop(),c=>c.world.countries[11].id='ENG',c=>c.world.clubs[0].countryId='GRE',c=>c.manager.managedClubId='AUT-C1',c=>c.world.clubs[0].roster[0].tec=999,c=>c.world.clubs[0].kits.keepers.pop(),c=>c.world.playerFoundation.expansionGeneration.clubOffsets['AUT-5']=99,c=>c.world.opening.previousInternationalWinners.crown='AUT-C1']){const bad=copy(career);mutate(bad);assert.equal(call('v61ValidateCareer',bad),false);}
 rows.push({seed,players:world.clubs.reduce((sum,c)=>sum+c.roster.length,0),youth:world.clubs.reduce((sum,c)=>sum+c.youthPool.length,0),bytes:Buffer.byteLength(before)});
 if(seed==='ap03-expansion-one')context.testCareer=career;
}
assert.throws(()=>call('v161CreateCareer','AUT-C1','bad','QA'),/Ligaverein/);
(async()=>{
 const fresh=context.testCareer;await call('v61SaveCareers',[old,fresh]);const exported=await call('v61ExportCareerData',fresh.id);assert.equal(exported.schema,15);assert.equal(exported.modelVersion,11);const legacyExport=await call('v61ExportCareerData',old.id);assert.equal(legacyExport.schema,14);assert.equal(legacyExport.modelVersion,10);assert.equal(JSON.stringify(legacyExport.save.world),oldWorld);
 const imported=await call('v61ImportCareerData',exported);assert.notEqual(imported.id,fresh.id);assert.equal(JSON.stringify(imported.world),JSON.stringify(fresh.world));assert.equal(call('v61RescueCareerData',fresh.id).schema,15);assert.equal(call('v61ReadCareers').length,3);
 const mismatch=copy(exported);mismatch.schema=14;await assert.rejects(()=>call('v61ImportCareerData',mismatch),/Format/);
 await call('v61DeleteCareer',imported.id);assert.equal(call('v61ReadCareers').length,2);assert.equal(JSON.stringify(call('v61ReadCareers')[0].world),oldWorld);
 fs.mkdirSync('outputs/ligaexpansion-ap03',{recursive:true});fs.writeFileSync('outputs/ligaexpansion-ap03/check.json',JSON.stringify({pass:true,rows,legacyUnchanged:true,mixedStorage:true,competitions:'pending-ap04-ap06'},null,2)+'\n');console.log(JSON.stringify({pass:true,rows,legacyUnchanged:true,mixedStorage:true}));
})().catch(error=>{console.error(error);process.exitCode=1;});
