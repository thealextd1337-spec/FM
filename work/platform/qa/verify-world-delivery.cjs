'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8'),json=rel=>JSON.parse(read(rel));
const attack=process.argv.includes('--attack-flow'),pilot=attack||process.argv.includes('--contact-pilot'),iteration=attack?'outputs/platform/attack-flow':pilot?'outputs/platform/contact-pilot':'outputs/platform/world-render';
const hash=rel=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');
(async()=>{
 const manifest=json('outputs/platform/unity-web/probe-build.json');
 assert.equal(manifest.worldView,'d6-world-view-1');
 for(const item of manifest.files)assert.equal(hash('outputs/platform/unity-web/Build/'+item.file),item.sha256,item.file);
 for(const item of manifest.sourceFiles)assert.equal(hash('prototypes/match-engine-unity/'+item.file),item.sha256,item.file);
 const source=read('dist/index.html'),build=read('outputs/index.html');
 assert.equal(build,read('outputs/Doppel-6-Fussballmanager.html'));
 assert(source.includes('world-unity-v151.js'));assert(build.includes(read('dist/world-unity-v151.js').replace(/\r\n/g,'\n')));
 const assets=require('../../ui-redesign/shared/assets.cjs'),ui=[...assets.styles,...assets.scripts];
 for(const file of ui)assert(build.includes(read('dist/ui-flutlicht/'+file).replace(/\r\n/g,'\n')),file);
 const versions=[...new Set(source.match(/PROTOTYP \d+/g))];assert.deepEqual(versions,[...new Set(build.match(/PROTOTYP \d+/g))]);
 const uiSource=json('outputs/ui-redesign/review-followups/source/checks.json'),uiBuild=json('outputs/ui-redesign/review-followups/build/checks.json'),runtime=json('outputs/platform/world-unity/runtime-tests.json');
 assert.equal(uiSource.checks.length,262);assert.equal(uiBuild.checks.length,262);assert.equal(runtime.errors.length,0);assert(runtime.parity.half&&runtime.parity.minute>=90);
 assert.deepEqual(json('outputs/platform/world-unity/parity-raw.json').native,json('outputs/platform/world-unity/parity-raw.json').unity);
 for(const [file,expected] of Object.entries(runtime.sourceHashes||{}))assert.equal(hash(file),expected,'Runtime source changed: '+file);
 const renderReports=['fixed','fixed-expanded-deferred'].map(name=>({name,...json('outputs/platform/world-render/'+name+'/report.json')}));
 for(const report of renderReports){assert.equal(report.sourceId,manifest.sourceId);assert.equal(report.errors.length,0);assert(report.checks.every(x=>x.passed),report.name);}
 const unityBuild=json(iteration+'/build-report.json');assert.equal(unityBuild.result,'Succeeded');assert.equal(unityBuild.totalErrors,0);
 const before=json(iteration+'/editor-before.json'),after=json(iteration+'/editor-after.json');for(const [key,value] of Object.entries(before))assert.deepEqual(after[key],value,'Editor setting '+key);assert(!after.compiling&&!after.compilationFailed);
 let pilotEvidence=null;
 if(pilot){const asset=json('work/platform/assets/contact-pilot-manifest.json'),live=json('outputs/platform/contact-pilot/live/report.json'),rig=json('outputs/platform/contact-pilot/rig-tests.json');assert.equal(asset.consumedCredits,20);assert.equal(hash('dist/players/football-v130.glb'),asset.originalAssetSha256);for(const item of asset.files)assert.equal(hash(item.path),item.sha256);assert(live.pass&&live.errors.length===0);assert.equal(live.sourceId,manifest.sourceId);assert.equal(rig.passed,23);assert.equal(json('outputs/platform/world-unity/contract-tests.json').passed,24);pilotEvidence={consumedCredits:asset.consumedCredits,assetFiles:asset.files,liveChecks:live.checks.length,rigChecks:rig.passed,clips:live.clips};}
 const links=[];
 for(const port of [4200,4300]){
  const base='http://127.0.0.1:'+port,html=await fetch(base+'/source/index.html?engine=unity');assert(html.ok);const text=await html.text();assert(text.includes('D6UnityMatchUrl')&&text.includes('ui-flutlicht/match.css'));
  const published=await fetch(base+'/unity/probe-build.json');assert(published.ok);assert.deepEqual(await published.json(),manifest);
  const script=await fetch(base+'/source/world-unity-v151.js');assert(script.ok);assert.equal(await script.text(),read('dist/world-unity-v151.js'));
  const loader=await fetch(base+'/source/unity-match/runtime.html');assert(loader.ok);assert((await loader.text()).includes('runtime.js'));
  links.push({url:base+'/source/index.html?engine=unity',sourceId:manifest.sourceId,passed:true});
 }
 const demo=await fetch('http://127.0.0.1:4300/?engine=unity');assert(demo.ok);assert((await demo.text()).includes('scene'));
 const report={verifiedAt:new Date().toISOString(),version:versions,uiFiles:ui.length,uiSourceChecks:uiSource.checks.length,uiBuildChecks:uiBuild.checks.length,runtimeChecks:runtime.checks.length,parity:runtime.parity,unitySourceId:manifest.sourceId,links,buildHash:hash('outputs/index.html'),sourceHashes:Object.fromEntries(['dist/index.html','dist/world-unity-v151.js','dist/unity-match/runtime.js',...ui.map(file=>'dist/ui-flutlicht/'+file)].map(file=>[file,hash(file)])),unityFiles:manifest.files};
 report.worldRender={reports:renderReports.map(x=>({name:x.name,checks:x.checks.length,passed:true})),buildId:unityBuild.buildId,editorRestored:true};
 if(pilotEvidence){const direct=json('outputs/platform/contact-pilot/link-test.json');assert(direct.pass);assert.equal(direct.observed.sourceId,manifest.sourceId);report.contactPilot={...pilotEvidence,directLink:direct.url};}
 if(attack){
  const native=json('outputs/platform/attack-flow/native-tests.json'),locomotion=json('outputs/platform/attack-flow/locomotion-tests.json');assert(native.pass&&native.errors.length===0&&native.matches.length===6);assert.equal(locomotion.passed,13);
  for(const [file,expected] of Object.entries(native.sourceHashes))assert.equal(hash(file),expected,'Attack flow source changed: '+file);
  const playerReports=['source','build'].map(kind=>({kind,...json('outputs/platform/player-foundation/'+kind+'-tests.json')}));
  for(const evidence of playerReports){assert(evidence.pass&&evidence.errors.length===0);assert.equal(evidence.checks.length,21);for(const [file,expected] of Object.entries(evidence.sourceHashes))assert.equal(hash(file),expected,'Player source changed: '+file);if(evidence.built)assert.equal(hash('outputs/index.html'),evidence.buildHash);}
  const integrated=['world-attack-flow-v152.js','player-generation.js','player-effective-abilities.js','player-freshness.js','player-development.js','player-aging.js','world-player-foundation-v153.js','player-foundation-preview-v153.js'];
  for(const file of integrated){assert(source.includes(file),file);assert(build.includes(read('dist/'+file).replace(/\r\n/g,'\n')),file);}
  report.attackFlow={nativeChecks:native.checks.length,fullMatches:native.matches.length,locomotionChecks:locomotion.passed,sourceHashes:native.sourceHashes};
  report.playerFoundation={reports:playerReports.map(p=>({kind:p.kind,checks:p.checks.length,passed:true})),sourceHashes:playerReports[0].sourceHashes};
  report.historicalUiEvidence=true; // The 262 UI cases are prior evidence, not rerun in this iteration.
 }
 fs.writeFileSync(path.join(root,'outputs/platform/world-unity/delivery-manifest.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({passed:true,uiFiles:ui.length,uiSourceChecks:report.uiSourceChecks,uiBuildChecks:report.uiBuildChecks,runtimeChecks:report.runtimeChecks,version:versions,links:links.map(x=>x.url)}));
})().catch(error=>{console.error(error);process.exitCode=1;});
