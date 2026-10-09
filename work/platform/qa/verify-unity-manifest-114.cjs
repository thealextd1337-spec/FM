'use strict';
// Release 114: read-only verification of the Unity identity and WebGL manifest.
// Recomputes the source id exactly like generate-identity.cjs (without writing),
// and checks ProbeBuildIdentity.cs, probe-build.json source/build hashes and the
// cache-busting URLs. Also hashes the native files and the single-file build that
// the final parity runs used. usage: node verify-unity-manifest-114.cjs [out.json]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),unity=path.join(root,'prototypes/match-engine-unity'),web=path.join(root,'outputs/platform/unity-web');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),checks=[];
const check=(name,ok,detail)=>{checks.push({name,ok:Boolean(ok),detail});console.log((ok?'PASS ':'FAIL ')+name+(detail?' · '+detail:''));};
const identity=JSON.parse(fs.readFileSync(path.join(unity,'source-identity.json'),'utf8'));
const generator=fs.readFileSync(path.join(unity,'generate-identity.cjs'),'utf8'),sources=JSON.parse(generator.match(/sources=(\[[^\]]*\])/)[1].replace(/'/g,'"'));
check('identity source list equals generator',JSON.stringify(sources)===JSON.stringify(identity.sources),sources.length+' files');
const h=crypto.createHash('sha256');for(const file of sources){h.update(file+'\0');h.update(fs.readFileSync(path.join(root,file)));}
const sourceId=h.digest('hex');
check('recomputed sourceId equals source-identity.json',sourceId===identity.sourceId,sourceId);
check('ProbeBuildIdentity.cs carries sourceId',fs.readFileSync(path.join(unity,'ProbeBuildIdentity.cs'),'utf8').includes(`"${sourceId}"`));
const manifest=JSON.parse(fs.readFileSync(path.join(web,'probe-build.json'),'utf8'));
check('probe-build.json sourceId',manifest.sourceId===sourceId);
check('probe-build.json worldView',manifest.worldView==='d6-world-view-1',manifest.worldView);
for(const {file,sha256} of manifest.sourceFiles){const actual=sha(path.join(unity,file));check('source '+file,actual===sha256,actual===sha256?'':'actual '+actual);}
const buildFiles=fs.readdirSync(path.join(web,'Build'));
check('build file set equals manifest',JSON.stringify(buildFiles.slice().sort())===JSON.stringify(manifest.files.map(f=>f.file).sort()),buildFiles.join(','));
for(const {file,bytes,sha256} of manifest.files){const p=path.join(web,'Build',file),actual=sha(p);check('build '+file,actual===sha256&&fs.statSync(p).size===bytes,actual===sha256?bytes+' B':'actual '+actual);}
for(const key of ['loaderUrl','dataUrl','frameworkUrl','codeUrl']){const [file,v]=manifest[key].replace('/unity/Build/','').split('?v=');check('url '+key,sha(path.join(web,'Build',file))===v,file);}
check('assetHash',manifest.assetHash===JSON.parse(fs.readFileSync(path.join(root,'work/platform/assets/manifest.json'),'utf8')).assetHash);
check('catalogHash',manifest.catalogHash===sha(path.join(root,'work/match-next/contacts/catalog.json')));
const native=['dist/world-unity-v151.js','dist/pitch-motion-v102.js','dist/world-pitch-actions-v99.js','dist/player-ball-events-v111.js','dist/world-ball-motion-v110.js','dist/world-physical-v65.js','dist/pitch-v55.js','dist/world-offensive-quality-v157.js','dist/world-foundation-v61.js','dist/progress-v58.js','dist/index.html','outputs/index.html','outputs/Doppel-6-Fussballmanager.html','work/platform/qa/unity-integration-v160.js','work/platform/qa/check-unity-parity-114.cjs'].map(file=>({file,sha256:sha(path.join(root,file)),mtime:fs.statSync(path.join(root,file)).mtime.toISOString()}));
const sites=text=>(text.match(/flowVersion===159\|\|/g)||[]).length;
const sourceSites=['pitch-motion-v102.js','world-pitch-actions-v99.js','player-ball-events-v111.js','world-ball-motion-v110.js'].reduce((n,f)=>n+sites(fs.readFileSync(path.join(root,'dist',f),'utf8')),0);
for(const file of ['outputs/index.html','outputs/Doppel-6-Fussballmanager.html']){const n=sites(fs.readFileSync(path.join(root,file),'utf8'));check(file+' contains every flowVersion-159 native flag site',sourceSites>0&&n===sourceSites,n+'/'+sourceSites+' sites');}
const failures=checks.filter(c=>!c.ok).length;
fs.writeFileSync(path.join(root,process.argv[2]||'outputs/release-114/unity-manifest-verify.json'),JSON.stringify({at:new Date().toISOString(),sourceId,failures,checks,hashes:native},null,2)+'\n');
console.log(failures?failures+' check(s) FAILED':'ALL '+checks.length+' checks PASSED');process.exitCode=failures?1:0;
