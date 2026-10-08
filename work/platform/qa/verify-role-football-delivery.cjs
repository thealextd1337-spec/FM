'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8'),json=rel=>JSON.parse(read(rel)),hash=rel=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');
function currentHashes(report,prefix=''){for(const [file,expected]of Object.entries(report.sourceHashes||{}))assert.equal(hash(prefix+file),expected,'Changed source: '+file);}
function clean(report){assert.equal(report.errors?.length||0,0);assert(report.pass!==false);assert(report.checks.every(x=>typeof x==='string'||x.passed!==false));}
(async()=>{
 const manifest=json('outputs/platform/unity-web/probe-build.json');
 for(const item of manifest.files)assert.equal(hash('outputs/platform/unity-web/Build/'+item.file),item.sha256,item.file);
 for(const item of manifest.sourceFiles)assert.equal(hash('prototypes/match-engine-unity/'+item.file),item.sha256,item.file);
 const source=read('dist/index.html'),build=read('outputs/index.html');assert.equal(build,read('outputs/Doppel-6-Fussballmanager.html'));
 const modules=['player-role-suitability.js','player-position-routine.js','player-tactic-transitions.js','player-match-ratings.js','player-tactics-ui.js','world-player-roles-v154.js','world-player-performance-v155.js','world-tactics-ui-v156.js','world-player-foundation-v153.js','player-foundation-preview-v153.js','world-space-passes-v150.js','world-attack-flow-v152.js','world-unity-v151.js'];
 for(const file of modules){assert(source.includes(file),file);assert(build.includes(read('dist/'+file).replace(/\r\n/g,'\n')),file);}
 for(const file of ['player-tactics-ui.css','world-tactics-layout-v156.css'])assert(build.includes(read('dist/'+file).replace(/\r\n/g,'\n')),file);
 const versions=[...new Set(source.match(/PROTOTYP \d+/g))];assert.deepEqual(versions,['PROTOTYP 110']);assert.deepEqual([...new Set(build.match(/PROTOTYP \d+/g))],versions);
 const ui=json('outputs/platform/tactics-wave4/report.json');clean(ui);assert.equal(ui.checks.length,26);currentHashes(ui,'dist/');
 const nativeContext=json('outputs/platform/role-performance/native-context-tests.json');clean(nativeContext);assert.equal(nativeContext.checks.length,24);currentHashes(nativeContext);
 const ratings=['source','build'].map(kind=>({kind,...json('outputs/platform/role-performance/'+kind+'-tests.json')}));
 for(const report of ratings){clean(report);assert(report.pass);assert.equal(report.changedDuringRun.length,0);currentHashes(report);if(report.built){assert(!report.buildChangedDuringRun);assert.equal(hash('outputs/index.html'),report.buildHash);}}
 const parity=['','/roles-wave4'].map(folder=>({folder,...json('outputs/platform/world-unity'+folder+'/runtime-tests.json')}));
 for(const report of parity){clean(report);currentHashes(report);assert(report.parity.half&&report.parity.minute>=90);const raw=json('outputs/platform/world-unity'+report.folder+'/parity-raw.json');assert.deepEqual(raw.native,raw.unity);}
 assert(parity[1].roleCandidate);
 const action=json('outputs/platform/action-iteration/evidence.json');assert(action.pass&&action.sourceAndBuildHashes&&action.editorRestoredExactly);assert.equal(action.sourceId,manifest.sourceId);assert.equal(action.build.result,'Succeeded');assert.equal(action.build.totalErrors,0);
 assert.equal(read('outputs/platform/action-iteration/editor-before.json'),read('outputs/platform/action-iteration/editor-after.json'));
 const rigPaths=['outputs/platform/action-iteration/rig-tests.json','outputs/platform/attack-flow/locomotion-tests.json','outputs/platform/contact-pilot/rig-tests.json','outputs/platform/world-unity/contract-tests.json'];
 const rigChecks=rigPaths.map((file,i)=>{const report=json(file);assert.equal(report.passed,[22,15,23,24][i]);return report.passed;});
 const render=['outputs/platform/action-iteration/live/report.json','outputs/platform/contact-pilot/live/report.json','outputs/platform/world-render/fixed/report.json','outputs/platform/world-render/fixed-expanded-deferred/report.json'];
 for(const file of render){const report=json(file);clean(report);assert.equal(report.sourceId,manifest.sourceId);}
 const direct=json('outputs/platform/contact-pilot/link-test.json');clean(direct);assert(direct.pass);assert.equal(direct.observed.sourceId,manifest.sourceId);
 assert.equal(hash('dist/players/football-v130.glb'),'5a2ae8bdc6606b00178d4861893fb008edadc05b4597c34459d7030ebb6e7fd1');
 const links=[];for(const port of [4200,4300]){
  const base='http://127.0.0.1:'+port,html=await fetch(base+'/source/index.html?engine=unity&players=wave3');assert(html.ok);assert((await html.text()).includes('world-tactics-ui-v156.js'));
  const published=await fetch(base+'/unity/probe-build.json');assert(published.ok);assert.deepEqual(await published.json(),manifest);
  for(const file of ['world-player-roles-v154.js','world-player-performance-v155.js','world-tactics-ui-v156.js']){const response=await fetch(base+'/source/'+file);assert(response.ok);assert.equal(await response.text(),read('dist/'+file));}
  links.push(base+'/source/index.html?engine=unity&players=wave3');
 }
 const result={pass:true,verifiedAt:new Date().toISOString(),version:versions[0],localOnly:true,buildHash:hash('outputs/index.html'),unitySourceId:manifest.sourceId,unityBuildId:action.build.buildId,uiChecks:ui.checks.length,nativeContextChecks:nativeContext.checks.length,roleChecks:ratings.map(x=>({kind:x.kind,checks:x.checks.length,matches:x.matches.length})),parityChecks:parity.map(x=>({roles:x.roleCandidate,checks:x.checks.length,parity:x.parity})),rigChecks,links,sourceHashes:Object.fromEntries(modules.map(file=>['dist/'+file,hash('dist/'+file)]))};
 fs.writeFileSync(path.join(root,'outputs/platform/role-football-delivery.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1;});
