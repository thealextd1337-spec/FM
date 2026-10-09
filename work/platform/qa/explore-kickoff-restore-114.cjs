'use strict';
// Exploration: autosave/JSON/restore at every tick of a kickoff restart; does the kickoff still start?
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const out={};
 for(const [name,config] of [['legacy',null],['large6',{fieldSize:'large',fieldPlayers:6}],['standard5',{fieldSize:'standard',fieldPlayers:5}]]){
  const p=await browser.newPage();p.on('pageerror',e=>console.log('pageerror',e.message));
  await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');
  await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
  await p.evaluate(c=>D6QA160.setup({config:c,unity:false}),config);
  out[name]=await p.evaluate(async()=>{
   const c=v65Context(),tick=()=>{step(.05*MATCH_SPEED,.05);v65AfterStep(c)};
   for(let i=0;i<300;i++)tick();
   const res=[];
   for(const offset of [0,1,3,6,10,20,30]){
    // fresh kickoff after a goal-like restart, then restore after offset ticks
    while(match.flight||match.slide||match.kickoff||match.setPiece||match.throwIn||match.postBanner||match.goalPause>0)tick();
    kickoff(1);for(let i=0;i<offset;i++)tick();
    if(match.flight||match.slide){res.push({offset,skipped:'flight'});continue}
    const phaseAtSave=match.kickoff?.phase??'none';
    v65Snapshot(c);c.state.physicalSnapshot=JSON.parse(JSON.stringify(c.state.physicalSnapshot));match=null;v65Restore(c);
    let n=0;for(;n<1200&&match.kickoff&&match.kickoff.phase!=='rolling';n++)tick();
    res.push({offset,phaseAtSave,hasCont:!!c.state.physicalSnapshot.match.nativeContinuation,ticksToRolling:n,stuck:n>=1200,phase:match.kickoff?.phase??'done',countdown:+(match.countdown||0).toFixed(2),overlay:document.querySelector('#match-overlay').hidden?null:document.querySelector('#overlay-title').textContent,ready:v115KickoffReady(match),kickerDist:match.kickoff&&+Math.hypot(match.kickoff.kicker.x-.5,match.kickoff.kicker.y-.5).toFixed(4),wrongHalf:match.people.filter(p=>p.t===0?p.y<.5-.00001:p.y>.5+.00001).map(p=>p.pid+':'+p.y.toFixed(3))});
   }
   return res;
  });
  await p.close();
 }
 fs.writeFileSync('outputs/release-114/unity-kickoff-restore-explore.json',JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out,null,1));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
