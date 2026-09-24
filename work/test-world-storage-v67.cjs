const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const stored=new Map();let nextId=0,renders=0,pauseWrite=false,finishWrite=null;
const database={
 createObjectStore(){},
 transaction(){
  const transaction={objectStore:()=>({
   get:key=>{const request={result:stored.get(key)};queueMicrotask(()=>request.onsuccess?.());return request},
   put:(value,key)=>{const copy=JSON.parse(JSON.stringify(value)),complete=()=>{stored.set(key,copy);transaction.oncomplete?.()};if(pauseWrite)finishWrite=complete;else queueMicrotask(complete)}
  })};return transaction;
 }
};
const indexedDB={open:()=>{const request={result:database};queueMicrotask(()=>{request.onupgradeneeded?.();request.onsuccess?.()});return request}};
const context=vm.createContext({crypto:{randomUUID:()=>`storage-${++nextId}`},indexedDB,localStorage:{getItem:()=>null,setItem:()=>{throw Error('Neue Karrieren dürfen nicht in localStorage landen.')}}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
for(const file of ['world-economy-v66.js','world-youth-manager-v67.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
context.v61RenderSaves=()=>renders++;
const call=(name,...args)=>vm.runInContext(name,context)(...args);
(async()=>{
 call('v61InitStorage');await new Promise(setImmediate);
 assert(renders>0,'Ladeabschluss aktualisiert die Startseite');
 const career=call('v61CreateCareer','GER-2','indexeddb-seed');
 const first=call('v61SaveCareers',[career]);
 career.manager.reputation=3.25;
 const second=call('v61SaveCareers',[career]);
 await Promise.all([first,second]);
 assert.strictEqual(stored.get('worlds')[0].manager.reputation,3.25);
 assert.strictEqual(call('v61ReadCareers')[0].id,career.id);
 assert.strictEqual(call('v61ValidateCareer',stored.get('worlds')[0]),true);
 pauseWrite=true;career.manager.reputation=4.5;
 const pending=call('v61SaveCareers',[career]),exported=call('v61ExportCareerData',career.id);
 let exportFinished=false;exported.then(()=>exportFinished=true);
 await Promise.resolve();
 assert.strictEqual(exportFinished,false,'Export wartet auf den Schreibabschluss');
 finishWrite();await pending;
 assert.strictEqual((await exported).save.manager.reputation,4.5);
 console.log('Weltenspeicher: IndexedDB-Laden, Schreibabschluss, zusammengefasste Folgespeicherung, Export nach Schreibabschluss und Neuladen geprüft.');
})().catch(error=>{console.error(error);process.exitCode=1});
