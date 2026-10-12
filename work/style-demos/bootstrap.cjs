'use strict';
// One-time baseline validation and inventory. Never launches Unity or changes sources.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const repo=path.resolve(__dirname,'../..'),project='G:/unity/Doppel6-Nighttime-Demo';
const release=path.resolve(repo,'../release-130');
const output=path.join(repo,'docs/3d-stilauftraege/basis-release130.json');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const identity=JSON.parse(fs.readFileSync(path.join(repo,'prototypes/match-engine-unity/source-identity.json')));
const h=crypto.createHash('sha256'),sources=[];
for(const file of identity.sources){const full=path.join(repo,file);h.update(file+'\0');h.update(fs.readFileSync(full));sources.push({file,sha256:sha(full)});}
assert.equal(h.digest('hex'),identity.sourceId,'Git checkout does not match released Unity identity');
const assets=JSON.parse(fs.readFileSync(path.join(repo,'work/platform/assets/manifest.json')));
for(const item of assets.source)assert.equal(sha(path.join(repo,item.path)),item.sha256,'Original asset differs: '+item.path);
const manifestPath=path.join(repo,'outputs/platform/unity-web/probe-build.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath));
assert.equal(manifest.sourceId,identity.sourceId);
for(const item of manifest.sourceFiles)assert.equal(sha(path.join(repo,'prototypes/match-engine-unity',item.file)),item.sha256,'Manifest source differs: '+item.file);
for(const item of manifest.files)assert.equal(sha(path.join(repo,'outputs/platform/unity-web/Build',item.file)),item.sha256,'Build differs: '+item.file);
const live=JSON.parse(fs.readFileSync(path.join(release,'outputs/release-130/live-files.json')));
assert.equal(live.pass,true);assert.equal(live.sourceId,identity.sourceId);assert.equal(live.manifestSha256,sha(manifestPath));
const imports=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else imports.push({file:path.relative(project,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:sha(file)});}}
walk(path.join(project,'Assets/Doppel6EngineProbe'));
const data={createdAt:new Date().toISOString(),productCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),release:130,unity:'6000.6.4f1',project,sourceId:identity.sourceId,sources,originalAssets:assets.source,manifestSha256:sha(manifestPath),buildFiles:manifest.files,liveProof:{at:live.at,htmlSha256:live.htmlSha256,files:live.files.length},importedAssets:imports};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({pass:true,sourceId:data.sourceId,sources:sources.length,originalAssets:assets.source.length,buildFiles:manifest.files.length,importedAssets:imports.length,output}));
