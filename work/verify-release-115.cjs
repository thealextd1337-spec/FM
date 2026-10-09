'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const out='outputs/release-115',read=f=>fs.readFileSync(f),json=f=>JSON.parse(read(f)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const live=process.argv.includes('--live'),report={release:115,checkedAt:new Date().toISOString(),checks:[],pass:false};
function check(name,ok){assert(ok,name);report.checks.push(name);}
async function remoteHash(relative){
 const url='https://fussball.cakamper.at/'+relative+(relative.includes('?')?'&':'?')+'verify='+Date.now();
 const r=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(180000)});assert(r.ok,'HTTP '+r.status+' '+relative);
 const digest=crypto.createHash('sha256');let bytes=0;for await(const chunk of r.body){digest.update(chunk);bytes+=chunk.length;}
 return {sha256:digest.digest('hex'),bytes};
}
(async()=>{
 const build=read('outputs/index.html'),html=build.toString(),source=read('dist/index.html').toString();
 check('Source and build footer 115',source.includes('PROTOTYP 115')&&html.includes('PROTOTYP 115'));
 check('Both runtime footer setters 115',(read('dist/progress-v58.js').toString().match(/PROTOTYP 115/g)||[]).length===2);
 check('Runtime cache address 115',html.includes('unity-match/runtime.html?v=115'));
 check('Generated DE/EN 3D help version 115',read('dist/world-3d-documentation-data-v134.js').toString().includes('window.D6ThreeDocumentation={"version":115,')&&html.includes(read('dist/world-3d-documentation-data-v134.js').toString()));
 check('Identical offline copies',build.equals(read('outputs/Doppel-6-Fussballmanager.html')));
 const ui=json(out+'/ui-build-manifest.json');check('26 exact embedded UI assets',ui.embedded.length===26&&ui.buildSha256===hash(build)&&ui.embedded.every(r=>hash(Buffer.from(read('dist/ui-flutlicht/'+r.file).toString().replace(/\r\n/g,'\n')))===r.sha256));
 const workflow=read('.github/workflows/deploy.yml').toString();
 const commands=workflow.split(/\r?\n/).map(l=>/^          ((?:[A-Z_]+=[^ ]+ )*)(node|python3) (.+)$/.exec(l)).filter(Boolean).map(m=>m[1]+m[2]+' '+m[3]);
 const preflight=json(out+'/preflight.json');
 check('All exact production commands pass',preflight.release===115&&preflight.pass&&commands.length===85&&JSON.stringify(commands)===JSON.stringify(preflight.checks.map(c=>c.command))&&preflight.checks.every(c=>c.pass));
 const identity=json('prototypes/match-engine-unity/source-identity.json'),digest=crypto.createHash('sha256');
 for(const file of identity.sources){digest.update(file+'\0');digest.update(read(file));}
 const sourceId=digest.digest('hex');
 check('Frozen Unity source bytes',sourceId===identity.sourceId&&sourceId==='959aea1e62482d85aff5d6c7d1d001f23bb64097f6497fe1389f5cb444128b93');
 check('Compiled identity source',read('prototypes/match-engine-unity/ProbeBuildIdentity.cs').toString().includes('"'+sourceId+'"'));
 const manifest=json('outputs/platform/unity-web/probe-build.json');
 check('Matching Unity manifest identity and contract',manifest.sourceId===sourceId&&manifest.worldView==='d6-world-view-1');
 for(const row of manifest.sourceFiles)check('Manifest source '+row.file,hash(read('prototypes/match-engine-unity/'+row.file))===row.sha256);
 check('Exactly the published build files',JSON.stringify(fs.readdirSync('outputs/platform/unity-web/Build').sort())===JSON.stringify(manifest.files.map(r=>r.file).sort()));
 for(const row of manifest.files){const b=read('outputs/platform/unity-web/Build/'+row.file);check('Manifest build '+row.file,b.length===row.bytes&&hash(b)===row.sha256);}
 const proof=json(out+'/unity-manifest-verify.json');check('Independent Unity manifest checks',proof.failures===0&&proof.sourceId===sourceId&&proof.checks.every(c=>c.ok));
 for(const file of ['dist/world-unity-v151.js','dist/world-pitch3d-v98.js','dist/pitch-motion-v102.js','dist/progress-v58.js'])check('Embedded current '+file,html.includes(read(file).toString().replace(/\r\n/g,'\n')));
 for(const [file,count] of [['stadiums/club-stadium-profile-tests.json',396],['stadiums/catalog-audit.json',197],['unity/stadium-architecture-tests.json',560],['unity/duel-tests.json',34]])check('Accepted '+file,json('outputs/3d-quality/'+file).passed===count);
 const audit=json('outputs/3d-quality/animation-audit/unity-959aea-final/report.json');check('Current source audit',audit.unitySourceId===sourceId&&audit.tests.passed===16);
 const browser=json('outputs/3d-quality/browser/runtime-tests.json');check('Browser integration evidence',browser.checks.length===21&&!browser.errors.length&&browser.parity.half&&browser.parity.minute===99);
 const full=json('outputs/3d-quality/browser/t3-large6-webgl.json').v;check('Full 14-player WebGL match evidence',full.setup.ack.allReal&&full.setup.ack.players===14&&full.cp.saved&&full.cp.restored&&full.digest.all==='44417dc8');
 const parity=json(out+'/candidate-parity.json');check('Release 115 HTML full match parity',parity.failures===0&&parity.candidateHtmlSha256===hash(build)&&parity.unitySourceId===sourceId&&parity.results.some(r=>r.config==='large-6'&&r.ok&&r.sameDigest&&r.unityDigest.all==='44417dc8'&&r.unity.setup.ack.players===14&&r.unity.checkpoint.restored));
 report.buildSha256=hash(build);report.buildBytes=build.length;report.unitySourceId=sourceId;report.productionCommands=commands.length;report.workflowSha256=hash(Buffer.from(workflow));
 report.sourceHashes=Object.fromEntries(['dist/index.html','dist/progress-v58.js','dist/world-unity-v151.js','dist/world-pitch3d-v98.js','dist/pitch-motion-v102.js','dist/world-3d-documentation-data-v134.js','work/build.cjs','work/generate-3d-documentation.cjs'].map(f=>[f,hash(read(f))]));
 if(live){
  report.url='https://fussball.cakamper.at/';report.liveHtml=await remoteHash('');check('Live HTML identical',report.liveHtml.sha256===report.buildSha256&&report.liveHtml.bytes===build.length);
  for(const row of manifest.files){const got=await remoteHash('unity/Build/'+row.file);check('Live build '+row.file,got.sha256===row.sha256&&got.bytes===row.bytes);}
  check('Live manifest identical',(await remoteHash('unity/probe-build.json')).sha256===hash(read('outputs/platform/unity-web/probe-build.json')));
  check('Live iframe identical',(await remoteHash('unity-match/runtime.html?v=115')).sha256===hash(read('dist/unity-match/runtime.html')));
 }
 report.pass=true;fs.writeFileSync(out+'/'+(live?'live-hashes':'candidate')+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:true,release:115,checks:report.checks.length,buildSha256:report.buildSha256,live}));
})().catch(e=>{console.error(e);process.exitCode=1});
