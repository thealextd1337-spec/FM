'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const out='outputs/release-114',read=f=>fs.readFileSync(f),json=f=>JSON.parse(read(f)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const value=f=>{const r=json(out+'/'+f);return r.value??r;},qa=f=>{const r=value(f);return r.v??r;};
const report={release:114,checkedAt:new Date().toISOString(),checks:[],pass:false};
function check(name,ok){assert(ok,name);report.checks.push(name);}
async function remoteHash(url){const r=await fetch(url,{headers:{'Cache-Control':'no-cache'}});assert(r.ok,`HTTP ${r.status}: ${url}`);const digest=crypto.createHash('sha256');let bytes=0;for await(const chunk of r.body){digest.update(chunk);bytes+=chunk.length;}return{sha256:digest.digest('hex'),bytes};}
(async()=>{
 const build=read('outputs/index.html'),html=build.toString(),source=read('dist/index.html').toString(),manifest=json('outputs/platform/unity-web/probe-build.json');
 check('Identical offline files',build.equals(read('outputs/Doppel-6-Fussballmanager.html')));
 check('Source and build footers 114',source.includes('PROTOTYP 114')&&html.includes('PROTOTYP 114'));
 check('Both runtime footer setters 114',(read('dist/progress-v58.js').toString().match(/PROTOTYP 114/g)||[]).length===2);
 check('Runtime cache key 114',html.includes('unity-match/runtime.html?v=114'));
 check('All 83 production commands pass',json(out+'/preflight.json').pass&&json(out+'/preflight.json').checks.length===83&&json(out+'/preflight.json').checks.every(r=>r.pass));
 const finalPaths=json(out+'/final-changed-paths.json');
 check('All eight final changed-path checks pass',finalPaths.pass&&finalPaths.checks.length===8&&finalPaths.checks.every(r=>r.pass));
 for(const mode of ['source','build']){
  check('Native matrix '+mode,qa('native-'+mode+'-matrix.json').checks.length===195);
  check('Free-kick proof '+mode,qa('freekick-'+mode+'.json').pass&&qa('freekick-'+mode+'.json').checks.length===40);
  check('Independent repeated snapshots '+mode,qa('reload-snapshot-'+mode+'.json').pass&&qa('reload-snapshot-'+mode+'.json').checks.length===80);
  check('Model asset timing has no native effect '+mode,qa('native-contact-'+mode+'.json').pass&&qa('native-contact-'+mode+'.json').checks.length===31);
 }
 for(const mode of ['desktop','mobile'])check('29 build UI checks '+mode,value('ui-build-'+mode+'.json').pass&&value('ui-build-'+mode+'.json').checks.length===29);
 check('Real fullscreen report',value('ui-build-desktop.json').details.fullscreen.native);
 const fullscreen=json(out+'/unity-fullscreen-report/result.json'),fullscreenRow=k=>fullscreen.log.find(r=>r.k===k)?.v;
 check('Real Unity fullscreen remains responsive with styled final report',fullscreen.ok&&!fullscreen.pageErrors.length&&!fullscreen.consoleErrors.length&&fullscreenRow('fullscreen')?.element==='match-area'&&fullscreenRow('end')?.finished&&!fullscreenRow('end')?.unityError&&fullscreenRow('after6s')?.phase==='finished'&&fullscreenRow('after6s')?.dialogs.some(r=>r.id==='v47-match-report'&&r.cls.includes('fl-dialog'))&&fullscreenRow('pingsMs')?.length===6&&fullscreenRow('pingsMs').every(ms=>ms<15000));
 const parity=json(out+'/unity-parity-final.json');
 check('All five complete Unity/native configurations agree',parity.results.length===5&&parity.failures===0&&parity.results.every(r=>r.ok&&r.sameDigest&&!r.diffParts.length));
 const buildParity=json(out+'/unity-parity-build-final.json');
 check('Critical build Unity/native configurations agree',['standard-6','large-5','large-6'].every(c=>buildParity.results.some(r=>r.config===c&&r.ok&&r.sameDigest&&!r.diffParts.length))&&buildParity.failures===0);
 const gate=json(out+'/unity-clock-gate.json');
 check('Unity loading gate proof',gate.failures===0&&gate.results.length===42&&gate.results.every(r=>r.ok));
 const manifestProof=json(out+'/unity-manifest-verify.json');
 check('All 45 Unity identity checks pass',manifestProof.failures===0&&manifestProof.checks.length===45&&manifestProof.checks.every(r=>r.ok));
 for(const f of ['q01-source.json','q01-build.json']){const q=json(out+'/'+f);check('Unchanged accepted '+f,q.evidenceValid&&q.errors.length===0&&q.records.every(r=>r.status==='bestanden'));}
 for(const row of value('mobile-fixture.json'))check('Mobile fixture '+row.theme+'/'+row.lang,row.dashText==='–'&&row.label===(row.lang==='de'?'präsentiert':'presents')&&row.labelVisible&&row.sponsor.bottom<row.clubs[0].y&&!row.overflow&&row.plate==='rgba(0, 0, 0, 0)');
 for(const theme of ['light','dark']){const b=value('boot-'+theme+'.json'),r=value('boot-'+theme+'-ready.json');check('Cold boot '+theme,b.boot===theme&&!b.ready&&r.ready&&!r.boot&&!r.overlay&&r.theme===theme);}
 report.buildSha256=hash(build);report.buildBytes=build.length;report.unitySourceId=manifest.sourceId;report.runtimeFiles=manifest.files;
 for(const row of manifest.files){const b=read(path.join('outputs/platform/unity-web/Build',row.file));check('Manifest runtime '+row.file,b.length===row.bytes&&hash(b)===row.sha256);}
 for(const row of manifest.sourceFiles)check('Manifest source '+row.file,hash(read(path.join('prototypes/match-engine-unity',row.file)))===row.sha256);
 for(const file of ['dist/world-unity-v151.js',...fs.readdirSync('dist/ui-flutlicht',{recursive:true}).filter(f=>/\.(js|css)$/.test(f)).map(f=>'dist/ui-flutlicht/'+f)])check('Embedded current '+file,html.includes(read(file).toString().replace(/\r\n/g,'\n')));
 if(process.argv.includes('--live')){
  const base='https://fussball.cakamper.at/';report.url=base;report.liveHtml=await remoteHash(base+'?release=114&verify='+Date.now());check('Live HTML identical',report.liveHtml.sha256===report.buildSha256);
  for(const row of manifest.files){const b=await remoteHash(base+'unity/Build/'+row.file+'?v='+row.sha256);check('Live runtime '+row.file,b.bytes===row.bytes&&b.sha256===row.sha256);}
  check('Live manifest identical',(await remoteHash(base+'unity/probe-build.json?verify='+Date.now())).sha256===hash(read('outputs/platform/unity-web/probe-build.json')));
  check('Live iframe identical',(await remoteHash(base+'unity-match/runtime.html?v=114')).sha256===hash(read('dist/unity-match/runtime.html')));
 }
 report.pass=true;fs.writeFileSync(out+'/'+(process.argv.includes('--live')?'live-hashes':'candidate')+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:true,release:114,checks:report.checks.length,buildSha256:report.buildSha256,live:process.argv.includes('--live')}));
})().catch(e=>{console.error(e);process.exitCode=1});
