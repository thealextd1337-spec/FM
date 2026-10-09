'use strict';
// Exploration: JSON round trip of the native autosave in every stopped state, then keep stepping.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await browser.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.log('pageerror',e.message));
 try{
  await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');
  await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
  await p.evaluate(()=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:false}));
  const out=await p.evaluate(async()=>{
   const res=[];const ctx=()=>v65Context();
   const kind=()=>match.goalPause>0?'goalPause':match.halftimePause>0?'halftime':match.kickoff?.phase==='waiting'?'kickoffWaiting':match.kickoff?'kickoff':match.postBanner?'postBanner':match.setPiece?'setPiece:'+match.setPiece.type+':'+match.setPiece.phase:match.throwIn?'throwIn':'open';
   const seen=new Set();let ticks=0;
   while(!match.finished&&ticks++<30000&&res.length<40){
    const c=ctx();if(c.state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame)}
    step(.05*MATCH_SPEED,.05);v65AfterStep(c);
    const k=kind();if(match.flight||match.slide||seen.has(k))continue;seen.add(k);
    // real autosave path
    const ok=v65Snapshot(c);if(!ok)continue;
    const keep=match,json=JSON.stringify(c.state.physicalSnapshot);c.state.physicalSnapshot=JSON.parse(json);
    match=null;const restored=v65Restore(c);let err=null,n=0;
    try{for(;n<200;n++){step(.05*MATCH_SPEED,.05);v65AfterStep(c)}}catch(e){err=e.stack.split('\n').slice(0,4).join(' | ')}
    res.push({kind:k,minute:c.state.minute,restored,err,n,overlay:document.querySelector('#overlay')?.textContent?.slice(0,40),aliasPeople:keep.people[0]===c.state.physicalSnapshot.match?.people?.[0]});
   }
   return res;
  });
  console.log(JSON.stringify(out,null,1));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
