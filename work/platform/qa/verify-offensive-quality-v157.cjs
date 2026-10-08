'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),out='outputs/platform/offensive-quality/',read=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(read(f)),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
function hashes(r){for(const [file,expected]of Object.entries(r.sourceHashes||{}))assert.equal(hash(file),expected,file);}
function clean(r){assert.equal(r.errors?.length||0,0);assert.equal(r.pass,true);}
(async()=>{
 const source=json(out+'source-tests.json'),built=json(out+'build-tests.json');
 for(const r of [source,built]){clean(r);hashes(r);assert.equal(r.changedDuringRun.length,0);assert.equal(r.matches.length,21);assert(r.motionCases.checks.length>=38);assert(r.matches.every(m=>m.diagnostics.sourceMismatches.length===0));}
 assert(!built.buildChangedDuringRun);assert.equal(hash('outputs/index.html'),built.buildHash);assert.equal(read('outputs/index.html'),read('outputs/Doppel-6-Fussballmanager.html'));
 for(const m of source.matches){const other=built.matches.find(q=>q.seed===m.seed&&q.mode===m.mode&&Boolean(q.interrupts)===Boolean(m.interrupts));assert(other,'Missing built match '+m.seed);assert.deepEqual(m.stats,other.stats);assert.deepEqual(m.score,other.score);assert.deepEqual(m.record,other.record);}
 const unity=json(out+'unity-turn/evidence.json'),manifest=json('outputs/platform/unity-web/probe-build.json');assert(unity.pass&&unity.editorRestoredExactly);assert.equal(manifest.sourceId,unity.sourceId);
 for(const item of manifest.files)assert.equal(hash('outputs/platform/unity-web/Build/'+item.file),item.sha256);
 for(const item of manifest.sourceFiles)assert.equal(hash('prototypes/match-engine-unity/'+item.file),item.sha256);
 assert.equal(read(out+'unity-turn/editor-before.json'),read(out+'unity-turn/editor-after.json'));
 const parity=['unity-normal','unity-roles'].map(folder=>{const r=json(out+folder+'/runtime-tests.json');assert.equal(r.errors.length,0);hashes(r);assert(r.offenseCandidate&&r.parity.half&&r.parity.minute>=90);assert(r.checks.includes('Backwards pass keeps possession and stats until a physical body turn'));assert(r.turn.queued&&r.turn.released&&Number.isFinite(r.turn.angle)&&r.turn.angle<.31&&r.turn.ticks>1);const raw=json(out+folder+'/parity-raw.json');assert.deepEqual(raw.native,raw.unity);return {folder,checks:r.checks.length,parity:r.parity};});
 const uiFiles=['outputs/ui-redesign/consistency-v157/header-build/report.json','outputs/ui-redesign/consistency-v157/cascade-final-build/report.json'];
 const ui=uiFiles.map(file=>{const r=json(file);clean(r);assert.equal(r.target,'build');assert.equal(r.buildHash,built.buildHash);for(const [f,h]of Object.entries(r.after||{})){const real=f==='__build__'?'outputs/index.html':path.relative(root,path.resolve(root,'dist/ui-flutlicht',f));assert.equal(hash(real),h);}return {file,checks:r.checks.length};});
 const modules=['world-offensive-quality-v157.js','world-attack-flow-v152.js','world-space-passes-v150.js','world-unity-v151.js'];
 for(const f of modules)assert(read('dist/index.html').includes(f)&&read('outputs/index.html').includes(read('dist/'+f).replace(/\r\n/g,'\n')));
 assert.deepEqual([...new Set(read('dist/index.html').match(/PROTOTYP \d+/g))],['PROTOTYP 110']);assert.deepEqual([...new Set(read('outputs/index.html').match(/PROTOTYP \d+/g))],['PROTOTYP 110']);
 assert.equal(hash('dist/players/football-v130.glb'),'5a2ae8bdc6606b00178d4861893fb008edadc05b4597c34459d7030ebb6e7fd1');
 const links=[];
 for(const port of [4200,4300]){const base='http://127.0.0.1:'+port,res=await fetch(base+'/source/index.html?engine=unity&players=wave3');assert(res.ok);assert((await res.text()).includes('world-offensive-quality-v157.js'));const data=await fetch(base+'/source/world-offensive-quality-v157.js');assert(data.ok);assert.equal(await data.text(),read('dist/world-offensive-quality-v157.js'));const model=await fetch(base+'/unity/probe-build.json');assert(model.ok);assert.deepEqual(await model.json(),manifest);links.push(base+'/source/index.html?engine=unity&players=wave3');}
 const result={pass:true,verifiedAt:new Date().toISOString(),localOnly:true,version:110,buildHash:built.buildHash,sourceHashes:source.sourceHashes,unitySourceId:manifest.sourceId,comparison:source.summary,nativeCases:source.motionCases.checks.length,sourceMatches:source.matches.length,buildMatches:built.matches.length,ui,parity,links,limits:['Local physics/balance candidate','Existing44x68 scene geometry and5 outfield+keeper','P02 consumption is separate','200%zoom, actual smartphone/screenreader and joint visual inspection remain deferred']};
 fs.writeFileSync(path.join(root,out+'delivery.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({pass:true,buildHash:result.buildHash,unitySourceId:result.unitySourceId,nativeCases:result.nativeCases,sourceMatches:21,buildMatches:21,ui,links}));
})().catch(e=>{console.error(e);process.exitCode=1;});
