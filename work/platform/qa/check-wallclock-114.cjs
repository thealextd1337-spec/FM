'use strict';
// Does wall-clock time (not native steps) change the native match? Native 2D,
// seeded D6QAScenario stages; variants: plain, sleep after every stage, busy-wait in every step.
// usage: node check-wallclock-114.cjs [config=large-5] [variants=plain,stageSleep,slowSteps,sleep:<stage>]
// sleep:<stage> idles 1.5 s only after that stage (setup|r20|pause|live|half|r60|cp).
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const name=process.argv[2]||'large-5',[size,players]=name.split('-'),config=size==='legacy'?null:{fieldSize:size,fieldPlayers:Number(players)};
const variants=(process.argv[3]||'plain,stageSleep,slowSteps').split(',');
const helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
async function run(browser,v){
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');await p.evaluate(helper);
 if(v==='slowSteps')await p.evaluate(()=>{const outer=step;step=function(...a){const t=performance.now();while(performance.now()-t<2);return outer.apply(this,a)}});
 const r=await p.evaluate(async([c,v])=>{const Q=D6QA160,at=k=>v==='stageSleep'||v==='sleep:'+k?new Promise(r=>setTimeout(r,1500)):null,log={};
  log.setup=await Q.setup({config:c,unity:false,replays:true});await at('setup');log.r20=await Q.run({minute:20,sampleEvery:3});await at('r20');log.pause=await Q.pause();await at('pause');log.live=await Q.returnLive();await at('live');
  log.half=await Q.run({stopAtHalftime:true,sampleEvery:30});await at('half');log.r60=await Q.run({minute:60,sampleEvery:30});await at('r60');log.cp=await Q.checkpoint();await at('cp');log.end=await Q.run({finished:true,sampleEvery:30});
  return {digest:Q.digest()};},[config,v]);
 await p.close();return {variant:v,digest:r.digest,errors};
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{const runs=[];for(const v of variants){const t=Date.now(),r=await run(browser,v);r.ms=Date.now()-t;runs.push(r);const ref=runs[0].digest,diff=Object.keys(ref.hashes).filter(k=>ref.hashes[k]!==r.digest.hashes[k]);console.log(v.padEnd(11),'ms',r.ms,'all',r.digest.all,'score',JSON.stringify(r.digest.score),diff.length?'DIFF: '+diff.join(','):'equal',r.errors.length?r.errors:'');}
  fs.writeFileSync(`outputs/release-114/wallclock-${name}.json`,JSON.stringify({config:name,runs},null,1)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
