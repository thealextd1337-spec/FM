'use strict';
// Does the picture path (as run by Unity paint() between native steps) change
// the native match? Native 2D, same seeded D6QAScenario; after every 3rd step
// one render-path function is called outside the seeded stream (as in paint()).
// usage: node check-render-side-effects-114.cjs [config=large-5]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const name=process.argv[2]||'large-5',[size,players]=name.split('-'),config=size==='legacy'?null:{fieldSize:size,fieldPlayers:Number(players)};
const helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
async function run(browser,mode){
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');await p.evaluate(helper);
 await p.evaluate(m=>{let n=0;const outer=step;step=function(...a){const r=outer.apply(this,a);
   if(m!=='none'&&match&&++n%3===0){const random=Math.random;Math.random=()=>0.5;try{
    if(m==='frame'||m==='all'){const f=v98PitchFrame(match);if(m==='all'){v98Frame=f;v131RecordRendered(f);}}
    if(m==='replay'||m==='all')v103ReplayFrame(performance.now(),true);
   }finally{Math.random=random}}
   return r;};},mode);
 await p.evaluate(c=>QAJ('s',D6QAScenario(c,false)),config);
 await p.waitForFunction(()=>window.QAR?.done,null,{timeout:900000,polling:500});
 const r=await p.evaluate(()=>window.QAR);await p.close();
 if(r.error)throw Error(mode+': '+r.error);
 return {mode,digest:r.v.digest,errors};
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const runs=[];for(const m of ['none','frame','replay','all'])runs.push(await run(browser,m));
  const ref=runs[0].digest;
  for(const r of runs){const diff=Object.keys(ref.hashes).filter(k=>ref.hashes[k]!==r.digest.hashes[k]);console.log(r.mode.padEnd(6),'all',r.digest.all,'score',JSON.stringify(r.digest.score),diff.length?'DIFF vs none: '+diff.join(','):'equal',r.errors.length?'errors '+r.errors:'');}
  fs.writeFileSync(`outputs/release-114/render-side-effects-${name}.json`,JSON.stringify({config:name,runs},null,1)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
