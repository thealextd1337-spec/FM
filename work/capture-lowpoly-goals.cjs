'use strict';
// Actual seeded native matches; pictures use the production bridge projection.
// This does not load Unity or measure GPU performance. Controlled slow rollers
// are separately covered by test-lowpoly-goal-tail.cjs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/lowpoly-live-rollout-20261013/net-recordings');
const helper=fs.readFileSync(path.join(__dirname,'platform/qa/unity-integration-v160.js'),'utf8');
const sourceFiles=['dist/world-pitch3d-v98.js','dist/world-unity-v151.js','dist/world-pitch-actions-v99.js','dist/world-goal-scene-v83.js'];
const hashes=()=>Object.fromEntries(sourceFiles.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
const before=hashes(),base=process.argv[2]||'http://127.0.0.1:4417/source/index.html';
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const results=[];
 try{for(const size of ['standard','large']){for(const seed of [160112,160113,160114,160115,160116,160117,160118,160119]){
  const pair=[];
  for(const capture of [false,true]){
   const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   // Install the production Unity projection wrapper; setup keeps the match in
   // 2D so native stepping is independent of Unity loading or render pacing.
   await page.goto(base+'?engine=unity');await page.evaluate(helper);
   const setup=await page.evaluate(({size,seed})=>D6QA160.setup({config:{fieldSize:size,fieldPlayers:5},unity:false,seed,replays:false}),{size,seed});
   await page.evaluate(capture=>{
    const C=D6WorldUnityContract,camera={position:{x:0,y:20,height:20,z:-30},target:{x:0,y:0,height:0,z:0},fov:40};
    window.GoalCapture={frames:[],events:[],seq:0,active:false};
    window.captureGoal=()=>{
     if(!capture)return false;
     const hot=!!match.goalScene&&match.goalPause>0;
     if(hot||GoalCapture.active){
      const frame=C.picture(C.scaled(v98PitchFrame(match),match.geometry),'native-goal-'+D6QA160.state.fixtureId,++GoalCapture.seq,camera,v65Context().state.phase,match.score);
      GoalCapture.frames.push(frame);
      if(hot&&!GoalCapture.active){const travel=v99Actions.get(match)?.goalTravel;GoalCapture.events.push({minute:D6QA160.state.minute,score:[...match.score],travel:travel?{...travel}:null});}
     }
     GoalCapture.active=hot;return false;
    };
   },capture);
   await page.evaluate(()=>QAJ('goals',D6QA160.run({finished:true,sampleEvery:1e9,stopWhen:()=>captureGoal()})));
   await page.waitForFunction(()=>QAR.done,null,{timeout:600000});
   const r=await page.evaluate(()=>({run:QAR,digest:D6QA160.digest(),capture:GoalCapture}));
   assert(!r.run.error,r.run.error);assert(r.run.v.finished);assert.deepEqual(errors,[]);
   pair.push(r.digest);
   if(capture){
    const frames=r.capture.frames;
    const config={schema:'d6-world-view-1',fixtureId:'native-'+size+'-'+seed,geometry:setup.geometry};
    fs.writeFileSync(path.join(out,'native-'+size+'-'+seed+'.json'),JSON.stringify({scope:'Actual complete native match, production picture projection per native step; geometry metadata, not a transmitted configure packet',config,frames,events:r.capture.events,sourceHashes:before},null,1));
    console.log(JSON.stringify({size,seed,frames:frames.length,score:r.digest.score,netFrames:frames.filter(f=>f.netActive).length,flowing:frames.filter(f=>f.net?.flowing).length}));
    results.push({size,seed,frames:frames.length,goals:r.capture.events.length,flowingNetFrames:frames.filter(f=>f.netActive&&f.net?.flowing).length,digest:r.digest.all,events:r.capture.events});
   }
   await context.close();
  }
  assert.deepEqual(pair[0],pair[1],'Rendering must leave the native match and seeded RNG unchanged');
  if(results.at(-1).flowingNetFrames>0)break;
 }
 }}finally{await browser.close();}
 assert(results.some(r=>r.flowingNetFrames>0),'No fresh flowing rear-net pictures across the seeded matches');
 assert.deepEqual(hashes(),before,'Producer source changed during capture');
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({passed:true,sourceHashes:before,nativeParity:true,results,limits:['Not a GPU/browser frame delivery test','Slow roller frequency is not established by these two seeded matches']},null,2));
 console.log(JSON.stringify(results.map(({size,frames,goals,flowingNetFrames,digest})=>({size,frames,goals,flowingNetFrames,digest}))));
})().catch(e=>{console.error(e);process.exitCode=1});
