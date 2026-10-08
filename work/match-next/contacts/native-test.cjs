'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../../..'),{createServer}=require('../../platform/engine-probe/server.cjs'),catalog=require('./catalog.json');
(async()=>{const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:720}});page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.__probeWrites=[];const prior=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){window.__probeWrites.push(k);return prior.call(this,k,v);};});
 await page.goto(`http://127.0.0.1:${server.address().port}/native/index.html`);await page.waitForFunction(()=>window.D6ProbeReady||window.D6ProbeError,null,{timeout:120000});
 assert.equal(await page.evaluate(()=>window.D6ProbeError),undefined);
 const startupWrites=await page.evaluate(()=>{const writes=[...window.__probeWrites];window.__probeWrites=[];return writes;});
 assert.ok(startupWrites.every(key=>key==='doppel6.language'),'unexpected career write at native startup');
 const cases=catalog.filter(s=>['free-goal-keeper-left','fast-pass-interception','native-box-mismatch','block-followup','parry-followup','touchline-out'].includes(s.provenance.family));
 for(const scenario of cases){
  const result=await page.evaluate(async scenario=>{await D6Probe.load({scenario,seed:619});const before=D6Probe.snapshot();await D6Probe.advance(20);const saved=D6Probe.checkpoint();await D6Probe.advance(20);const after=D6Probe.snapshot();await D6Probe.restore(saved);await D6Probe.advance(20);const replay=D6Probe.snapshot();const select=s=>JSON.stringify({ball:s.ball,actors:s.actors,events:s.events,score:s.score,tick:s.tick,rng:s.rngState});return {id:scenario.id,actors:before.actors.length,expectedActors:2*(scenario.geometry.fieldPlayers+1),replayEqual:select(after)===select(replay),events:replay.events.length,tick:replay.tick,score:replay.score,eventResults:replay.events.map(e=>({kind:e.kind,result:e.result})),oracleExpectation:scenario.expected,findings:replay.findings.map(f=>f.code)};},scenario);
  assert.equal(result.actors,result.expectedActors);assert.equal(result.replayEqual,true,result.id);results.push(result);
 }
 const checks=await page.evaluate(async()=>{D6Probe.pause();const start=JSON.stringify(D6Probe.snapshot());D6Probe.snapshot();D6Probe.stats();D6Probe.camera('contact');D6Probe.camera('overview');const readOnly=start===JSON.stringify(D6Probe.snapshot());let reject=false,sourceReject=false;try{await D6Probe.restore({schemaVersion:'wrong',engine:'browser'});}catch(_){reject=true;}const wrong=D6Probe.checkpoint();wrong.sourceId='different-source';try{await D6Probe.restore(wrong);}catch(_){sourceReject=true;}return {readOnly,reject,sourceReject,writes:window.__probeWrites};});
 assert.equal(checks.readOnly,true);assert.equal(checks.reject,true);assert.equal(checks.sourceReject,true);assert.deepEqual(checks.writes,[]);assert.deepEqual(errors,[]);
 const out=path.join(root,'outputs/platform/native');fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'browser-native.png')});
 const files=['work/platform/engine-probe/web/native.js','work/platform/engine-probe/web/scene.js','work/match-next/contacts/catalog.json'];
 const hashes=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
 const report={passed:true,scope:'isolated native adapter behavior and deterministic replay, not matching oracle outcomes',generatedAt:new Date().toISOString(),cases:results.length,startupWrites,checks,errors,hashes,results};fs.writeFileSync(path.join(out,'native-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,cases:results.length,checks}));
}finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1});
