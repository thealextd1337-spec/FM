const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
const turn=()=>new Promise(setImmediate);
function harness(stored=new Map(),options={}){
 let nextId=0;
 const writes=[];
 const database={createObjectStore(){},transaction(store,mode){
  let puts=0;const staged=new Map(),tx={objectStore:()=>({
   get(key){const request={};queueMicrotask(()=>{request.result=clone(stored.get(key));request.onsuccess?.()});return request},
   put(value,key){if(++puts===options.failPutAt)throw Error('QuotaExceededError');staged.set(key,clone(value))}
  }),commit(){for(const [key,value] of staged)stored.set(key,value);tx.oncomplete?.()},abort(){tx.error=Error('QuotaExceededError');tx.onabort?.()}};
  if(mode==='readwrite')writes.push(tx);
  return tx;
 }};
 const context=vm.createContext({crypto:{randomUUID:()=>`recovery-${++nextId}`},console,indexedDB:options.local?undefined:{open(){const request={result:database};queueMicrotask(()=>request.onsuccess?.());return request}},localStorage:{getItem:key=>stored.get(key)||null,setItem(key,value){if(options.full)throw Error('QuotaExceededError');stored.set(key,value)}}});
 for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
 const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
 vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
 for(const file of ['world-economy-v66.js','world-youth-manager-v67.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
 context.v61RenderSaves=()=>{};
 const status={textContent:'',append(){}},elements=new Map();
 context.v61CurrentCareer=null;context.v64MatchMenu={dataset:{},querySelector(selector){if(selector==='[data-v64-storage-status]')return status;if(!elements.has(selector))elements.set(selector,{});return elements.get(selector)}};
 context.document={createElement:()=>({})};context.escapeHTML=value=>value;
 const ui=fs.readFileSync('dist/world-match-ui-v64.js','utf8');vm.runInContext(ui.slice(ui.indexOf('function v64UiStorageStatus'),ui.indexOf("v64MatchMenu.addEventListener('click'")),context);
 const call=(name,...args)=>vm.runInContext(name,context)(...args),read=name=>vm.runInContext(name,context);
 return{stored,writes,context,call,read,status,async init(){call('v61InitStorage');await turn()}};
}
(async()=>{
 const faults={},h=harness(new Map(),faults);await h.init();
 const career=h.call('v61CreateCareer','GER-2','recovery-seed');
 let write=h.call('v61SaveCareers',[career]);assert.equal(h.status.textContent,'Wird gespeichert …');h.writes.shift().commit();await write;assert.equal(h.status.textContent,'Gespeichert');
 assert.equal(h.stored.get('worlds-backup')[0].id,career.id,'Auch die erste Speicherung legt eine gültige Kopie an');
 const confirmedBefore=JSON.stringify([...h.stored]);faults.failPutAt=2;
 const quotaWrite=h.call('v61SaveCareers',[career]);h.writes.shift();await assert.rejects(quotaWrite,/nicht gespeichert/);
 assert.equal(JSON.stringify([...h.stored]),confirmedBefore,'Fehler zwischen Backup- und Hauptschreibvorgang verändert keine Kopie');
 faults.failPutAt=undefined;
 // Aborting without an error event is a valid IndexedDB failure path.
 career.manager.reputation=2;
 const first=h.call('v61SaveCareers',[career]);
 career.manager.reputation=3;
 const queued=h.call('v61SaveCareers',[career]);
 let settled=0;first.catch(()=>settled++);queued.catch(()=>settled++);
 h.writes.shift().abort();await turn();
 assert.equal(settled,2,'Abbruch muss aktive und wartende Speicheraufträge ablehnen, statt sie endlos warten zu lassen');
 assert.equal(h.status.textContent,'Nicht gespeichert');
 const rescue=h.call('v61RescueCareerData',career.id);assert.equal(rescue.rescue,true);assert.equal(rescue.save.manager.reputation,3,'Rettungsexport erhält den unbestätigten Fortschritt');
 let downloaded,clicked=false;const link={click(){clicked=true}};
 h.context.Blob=Blob;h.context.URL={createObjectURL(blob){downloaded=blob;return 'blob:recovery-test'},revokeObjectURL(){}};h.context.setTimeout=()=>{};h.context.document.createElement=()=>link;
 h.call('v64DownloadRescue',career.id);assert(clicked);assert.match(link.download,/^doppel-6-rettung-/);
 const rescueFile=JSON.parse(await downloaded.text()),rescueImport=harness(new Map(),{local:true});
 const importedRescue=await rescueImport.call('v61ImportCareerData',rescueFile);assert.equal(importedRescue.manager.reputation,3,'Herunterladbare Rettungsdatei ist erneut importierbar');
 assert.notEqual(h.stored.get('worlds')[0].manager.reputation,3,'Letzter gültiger Stand bleibt erhalten');
 write=h.call('v61SaveCareers',[career]);h.writes.shift().commit();await write;
 assert.equal(h.stored.get('worlds')[0].manager.reputation,3,'Erneutes Speichern nach Fehler funktioniert');
 assert.equal(h.read('v61StorageError'),null);
 assert.notEqual(h.stored.get('worlds-backup')[0].manager.reputation,3,'Vorheriger bestätigter Stand ist die Rückfallkopie');
 // A queued request must capture the state at call time, not mutable live objects.
 career.manager.reputation=4;const active=h.call('v61SaveCareers',[career]);
 career.manager.reputation=5;const pending=h.call('v61SaveCareers',[career]);
 career.manager.reputation=6;
 h.writes.shift().commit();await active;h.writes.shift().commit();await pending;
 assert.equal(h.stored.get('worlds')[0].manager.reputation,5,'Wartende Speicherung hält ihren eigenen Schnappschuss');
 assert.equal((await h.call('v61ExportCareerData',career.id)).save.manager.reputation,5,'Normaler Export enthält nur bestätigte Daten');
 assert.equal(h.stored.get('worlds-backup')[0].manager.reputation,4);
 const reload=harness(h.stored);await reload.init();assert.equal(reload.call('v61ReadCareers')[0].manager.reputation,5,'Neuladen verwendet den tatsächlich bestätigten Schnappschuss');
 // Export must also wait for writes queued after the export was requested.
 career.manager.reputation=7;const beforeExport=h.call('v61SaveCareers',[career]);
 const exporting=h.call('v61ExportCareerData',career.id);let exported=false;exporting.then(()=>exported=true);
 career.manager.reputation=8;const afterExport=h.call('v61SaveCareers',[career]);
 h.writes.shift().commit();await beforeExport;await turn();assert.equal(exported,false);
 h.writes.shift().commit();await afterExport;assert.equal((await exporting).save.manager.reputation,8);
 h.stored.set('worlds',[{broken:true}]);
 const restored=harness(h.stored);await restored.init();
 assert.throws(()=>restored.call('v61ReadCareers'));
 assert.equal(restored.read('v61StorageBackup')[0].manager.reputation,7,'Gültige Wiederherstellungskopie wird beim Laden erkannt');
 const recovery=restored.call('v61RestoreStorage');restored.writes.shift().commit();await recovery;
 assert.equal(restored.call('v61ReadCareers')[0].manager.reputation,7);
 const deletion=restored.call('v61DeleteCareer',career.id);await turn();restored.writes.shift().commit();await deletion;
 assert.equal(h.stored.get('worlds-backup').length,0,'Gelöschte Karriere bleibt nicht in der Wiederherstellungskopie');
 // Persist and reopen a running match through the actual storage layer.
 const matchWorld=harness();await matchWorld.init();
 const matchCareer=matchWorld.call('v61CreateCareer','GER-2','storage-match'),fixture=matchWorld.call('v64AdvanceToOwnMatch',matchCareer),state=matchCareer.world.activeMatch.state;
 state.phase='live';while(state.minute<30)matchWorld.call('v64Step',matchCareer,fixture,state);
 write=matchWorld.call('v61SaveCareers',[matchCareer]);matchWorld.writes.shift().commit();await write;
 const reopened=harness(matchWorld.stored);await reopened.init();const loaded=reopened.call('v61ReadCareers')[0],loadedFixture=reopened.call('v64ActiveFixture',loaded),loadedState=loaded.world.activeMatch.state;
 assert.equal(JSON.stringify(loadedState),JSON.stringify(state),'Fortsetzen erhält Ereignisse und Zufallszustand');
 while(state.phase!=='finished')matchWorld.call('v64Step',matchCareer,fixture,state);
 while(loadedState.phase!=='finished')reopened.call('v64Step',loaded,loadedFixture,loadedState);
 assert.equal(JSON.stringify(loadedState.events),JSON.stringify(state.events),'Fortsetzung erzeugt dieselbe Ereignisfolge ohne Wiederholung');
 reopened.call('v64CompleteOwnMatch',loaded);write=reopened.call('v61SaveCareers',[loaded]);reopened.writes.shift().commit();await write;
 const finished=harness(reopened.stored);await finished.init();const finishedCareer=finished.call('v61ReadCareers')[0],before=JSON.stringify(finishedCareer);
 finished.call('v64CompleteOwnMatch',finishedCareer);assert.equal(JSON.stringify(finishedCareer),before,'Erneutes Öffnen verbucht kein Match doppelt');
 const localOptions={local:true},local=harness(new Map(),localOptions);await local.init();
 const localCareer=local.call('v61CreateCareer','GER-2','local-recovery');await local.call('v61SaveCareers',[localCareer]);
 const localBefore=local.stored.get(local.read('v61WorldKey'));localOptions.full=true;localCareer.manager.reputation=9;
 await assert.rejects(local.call('v61SaveCareers',[localCareer]),/nicht gespeichert/);
 assert.equal(local.stored.get(local.read('v61WorldKey')),localBefore,'localStorage ersetzt Haupt- und Rückfallkopie atomar');
 assert.equal(local.call('v61RescueCareerData',localCareer.id).save.manager.reputation,9);
 localOptions.full=false;await local.call('v61SaveCareers',[localCareer]);
 const raw=JSON.parse(local.stored.get(local.read('v61WorldKey')));raw.worlds=[{}];local.stored.set(local.read('v61WorldKey'),JSON.stringify(raw));
 const localReload=harness(local.stored,{local:true});assert.throws(()=>localReload.call('v61ReadCareers'));await localReload.call('v61RestoreStorage');
 assert.equal(localReload.call('v61ReadCareers')[0].id,localCareer.id);
 console.log('PASS: abort, queued failure, retry, immutable snapshots, export, recovery, deletion and match continuation');
})().catch(error=>{console.error(error);process.exitCode=1});
