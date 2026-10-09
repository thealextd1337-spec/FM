'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const out='outputs/release-113',read=f=>fs.readFileSync(f),json=f=>JSON.parse(read(f)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={release:113,checkedAt:new Date().toISOString(),checks:[],pass:false};
function check(name,ok){assert(ok,name);report.checks.push(name);}
async function remoteHash(url){const response=await fetch(url,{headers:{'Cache-Control':'no-cache'}});assert(response.ok,`HTTP ${response.status} ${url}`);const digest=crypto.createHash('sha256');let bytes=0;for await(const chunk of response.body){digest.update(chunk);bytes+=chunk.length;}return {sha256:digest.digest('hex'),bytes};}
(async()=>{
 const build=read('outputs/index.html'),source=read('dist/index.html').toString(),html=build.toString(),manifest=json('outputs/platform/unity-web/probe-build.json');
 check('Both offline files are identical',build.equals(read('outputs/Doppel-6-Fussballmanager.html')));
 check('Source and build footer are 113',source.includes('PROTOTYP 113')&&html.includes('PROTOTYP 113')&&!html.includes('PROTOTYP 112'));
 check('Source footer setters match 113',(read('dist/progress-v58.js').toString().match(/PROTOTYP 113/g)||[]).length===2);
 check('Actual source browser footers show 113',json(out+'/source-footer.json').version&&json(out+'/source-footer.json').footer.every(text=>text.includes('PROTOTYP 113')));
 check('HTTP runtime uses the release cache key',html.includes('unity-match/runtime.html?v=113'));
 check('Every production preflight command passed',json(out+'/preflight.json').pass&&json(out+'/preflight.json').checks.every(c=>c.pass));
 check('Final changed-path checks passed',json(out+'/final-changed-paths.json').pass);
 check('All four native combinations passed in source and build',json(out+'/native-source-matrix.json').checks.length===195&&json(out+'/native-build.json').matrix.checks.length===195);
 const ui=json(out+'/native-build.json').ui;
 check('Regular creation, export/import and real reload passed',ui.length===3&&ui.every(c=>c.checks.length===14&&c.reload.reload&&c.config.fieldPlayers===c.reload.config.fieldPlayers));
 check('Six-player mobile creation has no horizontal overflow',ui.some(c=>c.config.fieldPlayers===6&&c.width===390&&c.scrollWidth===390));
 const continued=json(out+'/native-build.json').fullMatch;
 check('Default world continues an identical full match after real JSON',continued.checks.includes('Complete gameplay/report/model parity after JSON')&&continued.matches[0].ticks===continued.matches[1].ticks&&JSON.stringify(continued.matches[0].score)===JSON.stringify(continued.matches[1].score));
 report.buildSha256=hash(build);report.buildBytes=build.length;report.unitySourceId=manifest.sourceId;report.runtimeFiles=[];
 const unityQA=json('outputs/platform/unity-native-v160/final-qa.json');
 check('Final Unity QA identifies this build',unityQA.build.finalSha256===report.buildSha256);
 check('Complete large five/six native and Unity worlds agree',['large5','large6'].every(key=>unityQA.parity[key].equal&&unityQA.parity[key].unity.all===unityQA.parity[key].native2D.all&&unityQA.parity[key].unity.world===unityQA.parity[key].native2D.world));
 check('All four Unity configurations show real players and names',['large5','large6','standard5','standard6'].every(key=>unityQA.visual[key].unityAck.allRealIds&&unityQA.visual[key].labels===unityQA.visual[key].people&&unityQA.visual[key].maxPositionErrorMetres===0));
 for(const [file,expected] of Object.entries(unityQA.build.sourceFilesEmbeddedVerbatim))check('Final Unity source and embedded bytes '+file,hash(read(file))===expected&&html.includes(read(file).toString()));
 for(const row of manifest.files){const local=read(path.join('outputs/platform/unity-web/Build',row.file));check('Frozen Unity file '+row.file,local.length===row.bytes&&hash(local)===row.sha256);report.runtimeFiles.push(row);}
 for(const row of manifest.sourceFiles)check('Frozen Unity source '+row.file,hash(read(path.join('prototypes/match-engine-unity',row.file)))===row.sha256);
 if(process.argv.includes('--live')){
  const base='https://fussball.cakamper.at/';report.url=base;
  report.liveHtml=await remoteHash(base+'?release=113&verify='+Date.now());check('Live HTML is byte-identical to release build',report.liveHtml.sha256===report.buildSha256);
  for(const row of manifest.files){const live=await remoteHash(base+'unity/Build/'+row.file+'?v='+row.sha256);check('Live Unity file '+row.file,live.sha256===row.sha256&&live.bytes===row.bytes);}
  const liveManifest=await remoteHash(base+'unity/probe-build.json?verify='+Date.now());check('Live manifest is byte-identical',liveManifest.sha256===hash(read('outputs/platform/unity-web/probe-build.json')));
  const runtime=await remoteHash(base+'unity-match/runtime.html?v=113');check('Live iframe is byte-identical',runtime.sha256===hash(read('dist/unity-match/runtime.html')));
 }
 report.pass=true;fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/'+(process.argv.includes('--live')?'live-hashes':'candidate')+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:true,release:113,checks:report.checks.length,buildSha256:report.buildSha256,live:process.argv.includes('--live')}));
})().catch(error=>{console.error(error);process.exitCode=1;});
