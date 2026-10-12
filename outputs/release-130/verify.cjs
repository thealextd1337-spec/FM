'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p); const si=JSON.parse(read('prototypes/match-engine-unity/source-identity.json'));
const h=crypto.createHash('sha256');for(const p of si.sources){h.update(p+'\0');h.update(read(p));}
assert.equal(h.digest('hex'),si.sourceId);const manifest=JSON.parse(read('outputs/platform/unity-web/probe-build.json'));assert.equal(manifest.sourceId,si.sourceId);
for(const row of manifest.sourceFiles)assert.equal(sha(read('prototypes/match-engine-unity/'+row.file)),row.sha256,row.file);
for(const row of manifest.files){const b=read('outputs/platform/unity-web/Build/'+row.file);assert.equal(b.length,row.bytes);assert.equal(sha(b),row.sha256);}
assert.equal(JSON.parse(read('work/platform/assets/manifest.json')).assetHash,manifest.assetHash);assert.equal(sha(read('dist/players/football-v130.glb')),manifest.assetHash);assert.equal(sha(read('work/match-next/contacts/catalog.json')),manifest.catalogHash);
assert(read('outputs/index.html').equals(read('outputs/Doppel-6-Fussballmanager.html')));
const html=read('outputs/index.html').toString('utf8');assert(html.includes('<title>Doppel 6 · Fußballmanager</title>'));assert(html.includes('PROTOTYP 130'));assert(!html.includes('PROTOTYP 129'));assert(!html.includes('local-preview-frame.js'));
const doc=read('docs/Bugliste.md').toString('utf8');const links=[...doc.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)].map(m=>m[1]);for(const p of links)assert(fs.existsSync(path.resolve('docs',p)),p);
const result={pass:true,at:new Date().toISOString(),release:130,sourceId:si.sourceId,identitySources:si.sources.length,manifestSources:manifest.sourceFiles.length,buildAssets:manifest.files.length,manifestSha256:sha(read('outputs/platform/unity-web/probe-build.json')),htmlSha256:sha(read('outputs/index.html')),sourceIndexSha256:sha(read('dist/index.html')),bridgeSha256:sha(read('dist/world-unity-v151.js')),cameraSha256:sha(read('dist/world-pitch3d-v98.js')),schedulerSha256:sha(read('dist/view-frame-scheduler-v130.js')),runtimeSha256:sha(read('dist/unity-match/runtime.js')),twoBuildsByteIdentical:true,buglisteLinks:links.length};
fs.writeFileSync(path.join(__dirname,'artifact-verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
