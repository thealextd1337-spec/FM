const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

function worldContext(){
 const stored=new Map();let nextId=0;
 const context=vm.createContext({
  crypto:{randomUUID:()=>`career-${++nextId}`},
  localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)}
 });
 for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
 const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
 vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
 for(const file of ['world-economy-v66.js','world-youth-manager-v67.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
 return{name:(symbol,...args)=>vm.runInContext(symbol,context)(...args),stored};
}

(async()=>{
 const world=worldContext(),call=world.name;
 const first=call('v61CreateCareer','GER-2','save-seed-1');
 first.manager.reputation=3.5;
 await call('v61StoreNewCareer',first);
 const exported=await call('v61ExportCareerData',first.id);
 assert.strictEqual(exported.format,'world');
 assert.strictEqual(exported.schema,13);
 assert.strictEqual(exported.modelVersion,9);
 assert.strictEqual(exported.save.manager.reputation,3.5);
 assert.strictEqual(JSON.stringify(exported.save.world),JSON.stringify(first.world));
 assert(call('v61IsWorldExport',exported));

 for(let index=2;index<=5;index++)await call('v61StoreNewCareer',call('v61CreateCareer','GER-2',`save-seed-${index}`));
 assert.strictEqual(call('v61ReadCareers').length,5);
 await assert.rejects(call('v61StoreNewCareer',call('v61CreateCareer','GER-2','save-seed-6')),/Maximal fünf/);
 await assert.rejects(call('v61ImportCareerData',JSON.parse(JSON.stringify(exported))),/Maximal fünf/);
 assert.strictEqual(call('v61ReadCareers').length,5);

 const removed=call('v61ReadCareers')[1].id;
 await call('v61DeleteCareer',removed);
 assert.strictEqual(call('v61ReadCareers').length,4);
 const imported=await call('v61ImportCareerData',JSON.parse(JSON.stringify(exported)));
 assert.notStrictEqual(imported.id,first.id,'gleiche ID wird beim Import neu vergeben');
 assert.strictEqual(JSON.stringify(imported.world),JSON.stringify(first.world));
 assert.strictEqual(call('v61ReadCareers').length,5);

 await call('v61DeleteCareer',imported.id);
 const invalid=JSON.parse(JSON.stringify(exported));invalid.save.modelVersion=8;
 await assert.rejects(call('v61ImportCareerData',invalid),/nicht unterstütztes Format/);
 invalid.save.modelVersion=9;invalid.save.world.clubs.pop();
 await assert.rejects(call('v61ImportCareerData',invalid),/unvollständig oder beschädigt/);
 assert.strictEqual(call('v61ReadCareers').length,4,'ungültige Importe ändern keinen Spielstand');

 const fresh=worldContext();
 const restored=await fresh.name('v61ImportCareerData',JSON.parse(JSON.stringify(exported)));
 assert.strictEqual(JSON.stringify(restored.world),JSON.stringify(first.world));
 assert.strictEqual(fresh.name('v61ReadCareers').length,1);
 console.log('Weltspielstände: Export, Import, doppelte ID, Löschung, Fehler und Grenze von fünf Karrieren geprüft.');
})().catch(error=>{console.error(error);process.exitCode=1});
