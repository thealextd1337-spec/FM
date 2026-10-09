'use strict';
// Which asynchronous callback changes native match/state while the page is idle?
// Native 2D, seeded stages up to the checkpoint, then 1.5 s idle with every
// timer/interval/rAF callback wrapped: state hash before/after each callback.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const name=process.argv[2]||'large-5',[size,players]=name.split('-'),config=size==='legacy'?null:{fieldSize:size,fieldPlayers:Number(players)};
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const p=await b.newPage();
 await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
 const out=await p.evaluate(async c=>{const Q=D6QA160;
  await Q.setup({config:c,unity:false,replays:true});await Q.run({minute:20,sampleEvery:3});await Q.pause();await Q.returnLive();await Q.run({stopAtHalftime:true,sampleEvery:30});await Q.run({minute:60,sampleEvery:30});await Q.checkpoint();
  const H=()=>{const t=JSON.stringify({m:match,s:Q.state},(k,v)=>v instanceof Element?undefined:v);let h=2166136261;for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619)>>>0;return h.toString(16)};
  const log=[],wrap=(kind,fn,extra)=>function(...a){const before=H(),t0=performance.now();try{return fn.apply(this,a)}finally{const after=H();if(after!==before)log.push({kind,extra,src:String(fn).slice(0,240),ms:+(performance.now()-t0).toFixed(1),stack:new Error().stack.split('\n').slice(2,4).join(' | ')})}};
  const st=setTimeout,si=setInterval,ra=requestAnimationFrame;
  window.setTimeout=(fn,d,...r)=>st(typeof fn==='function'?wrap('timeout',fn,d):fn,d,...r);window.setInterval=(fn,d,...r)=>si(typeof fn==='function'?wrap('interval',fn,d):fn,d,...r);window.requestAnimationFrame=fn=>ra(wrap('raf',fn));
  const before={hash:H(),elapsed:match.elapsed,minute:Q.state.minute,phase:Q.state.phase,running,frame:v65WorldFrame,currentIsQA:v61CurrentCareer===Q.career};
  await new Promise(r=>st(r,1500));
  window.setTimeout=st;window.setInterval=si;window.requestAnimationFrame=ra;
  const after={hash:H(),elapsed:match.elapsed,minute:Q.state.minute,phase:Q.state.phase,running,frame:v65WorldFrame,currentIsQA:v61CurrentCareer===Q.career};
  return {before,after,changes:log};
 },config);
 console.log(JSON.stringify(out,null,1).slice(0,6000));fs.writeFileSync(`outputs/release-114/idle-callbacks-${name}.json`,JSON.stringify(out,null,1)+'\n');await b.close();
})().catch(e=>{console.error(e);process.exitCode=1});
