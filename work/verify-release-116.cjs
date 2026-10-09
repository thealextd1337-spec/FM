'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const out='outputs/release-116',read=f=>fs.readFileSync(f),json=f=>JSON.parse(read(f)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const live=process.argv.includes('--live'),report={release:116,checkedAt:new Date().toISOString(),checks:[],pass:false};
function check(name,ok){assert(ok,name);report.checks.push(name);}
async function remoteHash(relative){
 const url='https://fussball.cakamper.at/'+relative+(relative.includes('?')?'&':'?')+'verify='+Date.now();
 const r=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(180000)});assert(r.ok,'HTTP '+r.status+' '+relative);
 const digest=crypto.createHash('sha256');let bytes=0;for await(const chunk of r.body){digest.update(chunk);bytes+=chunk.length;}return{sha256:digest.digest('hex'),bytes};
}
(async()=>{
 const build=read('outputs/index.html'),html=build.toString();
 check('Source and build footer 116',read('dist/index.html').toString().includes('PROTOTYP 116')&&html.includes('PROTOTYP 116'));
 check('Both runtime footer setters 116',(read('dist/progress-v58.js').toString().match(/PROTOTYP 116/g)||[]).length===2);
 check('Runtime cache address 116',html.includes('unity-match/runtime.html?v=116'));
 check('Generated DE/EN 3D help 116',read('dist/world-3d-documentation-data-v134.js').toString().includes('window.D6ThreeDocumentation={"version":116,')&&html.includes(read('dist/world-3d-documentation-data-v134.js').toString()));
 check('Identical offline copies',build.equals(read('outputs/Doppel-6-Fussballmanager.html')));
 const ui=json(out+'/ui-build-manifest.json');check('26 exact embedded UI assets',ui.embedded.length===26&&ui.buildSha256===hash(build)&&ui.embedded.every(r=>hash(Buffer.from(read('dist/ui-flutlicht/'+r.file).toString().replace(/\r\n/g,'\n')))===r.sha256));
 const workflow=read('.github/workflows/deploy.yml').toString(),commands=workflow.split(/\r?\n/).map(l=>/^          ((?:[A-Z_]+=[^ ]+ )*)(node|python3) (.+)$/.exec(l)).filter(Boolean).map(m=>m[1]+m[2]+' '+m[3]),preflight=json(out+'/preflight.json');
 check('All 86 exact production commands pass',preflight.release===116&&preflight.pass&&commands.length===86&&JSON.stringify(commands)===JSON.stringify(preflight.checks.map(c=>c.command))&&preflight.checks.every(c=>c.pass));
 const identity=json('prototypes/match-engine-unity/source-identity.json'),digest=crypto.createHash('sha256');for(const f of identity.sources){digest.update(f+'\0');digest.update(read(f));}const sourceId=digest.digest('hex');
 check('Frozen Unity source bytes',sourceId===identity.sourceId&&sourceId==='61abeca81ae558b301e832e1bde22745d0556d71a5b385ea7d2d51b5ada246e6');
 check('Compiled identity source',read('prototypes/match-engine-unity/ProbeBuildIdentity.cs').toString().includes('"'+sourceId+'"'));
 const manifest=json('outputs/platform/unity-web/probe-build.json');check('Matching Unity manifest identity and contract',manifest.sourceId===sourceId&&manifest.worldView==='d6-world-view-1');
 for(const row of manifest.sourceFiles)check('Manifest source '+row.file,hash(read('prototypes/match-engine-unity/'+row.file))===row.sha256);
 check('Exactly four published build files',manifest.files.length===4&&JSON.stringify(fs.readdirSync('outputs/platform/unity-web/Build').sort())===JSON.stringify(manifest.files.map(r=>r.file).sort()));
 for(const row of manifest.files){const b=read('outputs/platform/unity-web/Build/'+row.file);check('Manifest build '+row.file,b.length===row.bytes&&hash(b)===row.sha256);}
 const proof=json(out+'/unity-manifest-verify.json');check('Independent Unity manifest checks',proof.failures===0&&proof.sourceId===sourceId&&proof.checks.every(c=>c.ok));
 const sources=['dist/screen-wake-v20.js','dist/world-physical-v65.js','dist/world-goal-replay-v103.js','dist/world-offensive-quality-v157.js','dist/world-football-flow-v159.js','dist/world-unity-v151.js','dist/world-pitch3d-v98.js','dist/pitch-motion-v102.js','dist/progress-v58.js'];
 for(const f of sources)check('Embedded current '+f,html.includes('<script>'+read(f).toString().replace(/\r\n/g,'\n').replace(/PROTOTYP \d+\b/g,'PROTOTYP 116')+'</script>'));
 const native=json('outputs/3d-quality/mobile-readability/native-pace-v162.json');check('Six complete native matches, P02 and old-match parity',native.pass&&native.legacyParity&&native.matches.length===6&&native.matches.every(r=>r.finished&&r.half&&r.load.finiteFreshnessValidated)&&native.legacy.every(r=>r.legacyRestoreUnmarked));
 for(const [f,h] of Object.entries(native.sourceHashes))check('Native measurement source '+f,hash(read('dist/'+f))===h);
 check('136 actual Unity ring checks',json('outputs/3d-quality/mobile-readability/team-ring-tests.json').passed===136);
 check('18 wake lifecycle checks',json('outputs/3d-quality/mobile-readability/wake-lifecycle.json').passed===18);
 const mobile=json('outputs/3d-quality/mobile-readability/browser-mobile.json');check('14 mobile lifecycle and WebGL checks',mobile.pass&&mobile.sourceId===sourceId&&mobile.checks.length===14&&!mobile.errors.length);
 const parity=json(out+'/candidate-parity.json');check('Release 116 HTML complete native/Unity parity',parity.failures===0&&parity.candidateHtmlSha256===hash(build)&&parity.unitySourceId===sourceId&&parity.results.some(r=>r.config==='standard-5'&&r.ok&&r.sameDigest&&r.unity.setup.ack.players===12&&r.unity.checkpoint.restored));
 report.buildSha256=hash(build);report.buildBytes=build.length;report.unitySourceId=sourceId;report.productionCommands=commands.length;report.workflowSha256=hash(Buffer.from(workflow));report.sourceHashes=Object.fromEntries([...sources,'dist/index.html','dist/world-3d-documentation-data-v134.js','work/build.cjs','work/generate-3d-documentation.cjs'].map(f=>[f,hash(read(f))]));
 if(live){report.url='https://fussball.cakamper.at/';report.liveHtml=await remoteHash('');check('Live HTML identical',report.liveHtml.sha256===report.buildSha256&&report.liveHtml.bytes===build.length);for(const row of manifest.files){const got=await remoteHash('unity/Build/'+row.file);check('Live build '+row.file,got.sha256===row.sha256&&got.bytes===row.bytes);}check('Live manifest identical',(await remoteHash('unity/probe-build.json')).sha256===hash(read('outputs/platform/unity-web/probe-build.json')));check('Live iframe identical',(await remoteHash('unity-match/runtime.html?v=116')).sha256===hash(read('dist/unity-match/runtime.html')));check('Live runtime JS identical',(await remoteHash('unity-match/runtime.js')).sha256===hash(read('dist/unity-match/runtime.js')));}
 report.pass=true;fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/'+(live?'live-hashes':'candidate')+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:true,release:116,checks:report.checks.length,buildSha256:report.buildSha256,live}));
})().catch(e=>{console.error(e);process.exitCode=1});
