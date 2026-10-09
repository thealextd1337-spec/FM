'use strict';
// Does the wall-clock autosave (v65Snapshot every 700 ms) change the native
// match? Native 2D only, same seeded D6QAScenario; autosave either suppressed
// (never) or forced after every step (every), plus the normal timing (normal).
// Equal digests => snapshots are side-effect free. Unity is not involved.
// Mode reportEvery calls only v65RenderReport after every step (the autosave also runs it).
// usage: node check-snapshot-side-effects-114.cjs [config=large-5] [modes=never,normal,every,reportEvery]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const name=process.argv[2]||'large-5',[size,players]=name.split('-'),config=size==='legacy'?null:{fieldSize:size,fieldPlayers:Number(players)};
const helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
async function run(browser,mode){
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');await p.evaluate(helper);
 await p.evaluate(m=>{window.__snaps=0;const snap=v65Snapshot;v65Snapshot=function(...a){__snaps++;return snap.apply(this,a)};
  const after=v65AfterStep;v65AfterStep=function(context){
   if(m==='never')v65LastSaved=performance.now();          // the 700 ms autosave never fires
   const r=after.apply(this,arguments);
   if(m==='every'&&v65Context()?.state.phase==='live'&&!match.flight&&!match.slide)v65Snapshot(v65Context());
   if(m==='reportEvery'&&v65Context()?.state.phase==='live')v65RenderReport(v65Context());
   return r;};},mode);
 await p.evaluate(c=>QAJ('s',D6QAScenario(c,false)),config);
 await p.waitForFunction(()=>window.QAR?.done,null,{timeout:900000,polling:500});
 const r=await p.evaluate(()=>({q:window.QAR,snaps:__snaps}));await p.close();
 if(r.q.error)throw Error(mode+': '+r.q.error);
 return {mode,snapshots:r.snaps,digest:r.q.v.digest,errors};
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const runs=[];for(const m of (process.argv[3]||'never,normal,every,reportEvery').split(','))runs.push(await run(browser,m));
  const ref=runs[0].digest;
  for(const r of runs){const diff=Object.keys(ref.hashes).filter(k=>ref.hashes[k]!==r.digest.hashes[k]);console.log(r.mode.padEnd(6),'snapshots',r.snapshots,'all',r.digest.all,'score',JSON.stringify(r.digest.score),diff.length?'DIFF vs never: '+diff.join(','):'equal to never',r.errors.length?'errors '+r.errors:'');}
  fs.writeFileSync(`outputs/release-114/snapshot-side-effects-${name}.json`,JSON.stringify({config:name,runs},null,1)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
