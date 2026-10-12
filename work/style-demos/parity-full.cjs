'use strict';
// Adapter of the Release-130 full native/Unity parity run (outputs/release-130/final-browser/check-parity.cjs)
// to a style-demo server. Same scenario, helper and assertions; only the target, report path and the
// /__build binding differ. Needs a real browser with WebGL: run it only in a separately assigned acceptance
// task, never while another Unity/GPU job is active. Writes outputs/style-demos/<style>/parity-<style>.json.
// usage: node work/style-demos/parity-full.cjs --style nighttime|lowpoly|baseline [--repo DIR] [--url http://127.0.0.1:4411]
//        [--chrome PATH] [--playwright DIR] [--report FILE]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),http=require('node:http');
const lib=require('./lib.cjs');
lib.requireNode();
const args=lib.parseArgs(process.argv.slice(2),{style:'string',repo:'string',url:'string',chrome:'string',playwright:'string',report:'string'});
const style=lib.requireStyle(args),repo=lib.resolveRepo(args),url=(args.url||'http://127.0.0.1:'+lib.STYLES[style].port).replace(/\/$/,'');
const runtime='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const {chromium}=require(args.playwright||runtime),chrome=args.chrome||'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const reportFile=path.resolve(repo,args.report||path.join('outputs/style-demos',style,'parity-'+style+'.json'));
const helper=fs.readFileSync(path.join(repo,'work/platform/qa/unity-integration-v160.js'),'utf8'),results=[];
const buildState=()=>new Promise((resolve,reject)=>http.get(url+'/__build',res=>{let t='';res.on('data',c=>t+=c);res.on('end',()=>{try{resolve(JSON.parse(t));}catch(e){reject(e);}});}).on('error',reject));
(async()=>{
 const before=await buildState();
 assert.equal(before.style,style,'Server liefert Stil '+before.style);
 assert.equal(before.freshness?.state,'fresh','Server nicht frisch gepackt: '+JSON.stringify(before.freshness));
 const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--enable-webgl']});
 try{
  for(const unity of [false,true]){
   const page=await browser.newPage({viewport:{width:1280,height:800}});
   await page.goto(url+'/?engine='+(unity?'unity':'browser'));await page.waitForFunction(()=>v61StorageReady&&window.userMeshyMatchReady);await page.evaluate(helper);
   const setup=await page.evaluate(unity=>D6QA160.setup({expansion:true,unity,replays:false,seed:160112,config:{fieldSize:'standard',fieldPlayers:5}}),unity);if(unity)assert(setup.unityReady&&!setup.error);
   const flags=await page.evaluate(()=>({keeper:match.attackFlow.keeperChaseRevision,pace:match.attackFlow.paceRevision}));assert.equal(flags.keeper,180);assert.equal(flags.pace,119);
   const end=await page.evaluate(()=>D6QA160.run({finished:true,sampleEvery:10}));assert(end.finished&&!end.unityError);
   const digest=await page.evaluate(()=>D6QA160.digest()),parts=await page.evaluate(()=>D6QA160Parts);assert(digest.valid===true||digest.valid?.ok===true,'Actual completed native career must validate');
   results.push({unity,setup,flags,end,digest,partsSha256:crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex')});await page.close();
  }
  assert.deepEqual(results[0].digest,results[1].digest,'Native/P02/RNG/roles/world digest differs between 2D and Unity');
  assert.equal(results[0].partsSha256,results[1].partsSha256,'Full native payload differs');
  const after=await buildState();
  assert.equal(after.sourceFingerprint,before.sourceFingerprint);assert.equal(after.htmlSha256,before.htmlSha256);assert.equal(after.packageManifestSha256,before.packageManifestSha256,'Paket während der Prüfung gewechselt');
  const report={checkedAt:new Date().toISOString(),pass:true,style,url,scope:'Complete fixed-native-tick 2D versus Unity native/P02/RNG parity on the served package. Not a visual, FPS, Android or live claim.',
   build:{sourceCommit:before.sourceCommit,sourceDirty:before.sourceDirty,sourceFingerprint:before.sourceFingerprint,sourceId:before.sourceId,htmlSha256:before.htmlSha256,unityManifestSha256:before.unityManifestSha256,packageManifestSha256:before.packageManifestSha256},results};
  fs.mkdirSync(path.dirname(reportFile),{recursive:true});fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({pass:true,report:reportFile,ticks:results.map(r=>r.end.ticks),score:results[0].digest.score,digest:results[0].digest.all,payloadSHA:results[0].partsSha256}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
