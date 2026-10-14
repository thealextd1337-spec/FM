'use strict';
// Native motion captures for NaturalMotionDiagnostics (fix/r132-anim): seeded native matches through the production
// harness (work/platform/qa/unity-integration-v160.js, D6QA160, native 2D stepping) and the production bridge picture
// (D6WorldUnityContract.picture of the scaled v98PitchFrame), one picture per native 0.05 s step of the first half.
// Written as outputs/3d-quality/fix-r132/nm/native132/motion-<seed>-<size>-<fieldPlayers>.json in the NativeCapture
// shape NaturalMotionDiagnostics.Native reads (seed, fieldPlayers, fieldSize, keepers, pictures[NativePicture]).
// Observation only: no Unity, no match change; the match digest is written beside the capture.
//   node work/capture-native-motion-r132.cjs [--seeds 160112:standard:5,160114:large:6] [--minute 46] [--out <folder>]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('./ui-redesign/serve.cjs');
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback;};
const specs=String(arg('--seeds','160112:standard:5,160114:large:6')).split(',').map(s=>{const [seed,size,players]=s.split(':');return {seed:Number(seed),size,players:Number(players)};});
const minute=Number(arg('--minute','46')),out=path.resolve(arg('--out','outputs/3d-quality/fix-r132/nm/native132')),port=Number(arg('--port','4218'));
const helper=fs.readFileSync(path.join(__dirname,'platform/qa/unity-integration-v160.js'),'utf8');
const browserPath=['C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
fs.mkdirSync(out,{recursive:true});
const server=createServer();const url=`http://127.0.0.1:${port}/source/index.html`;
(async()=>{
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:browserPath,headless:true});
 try{
  for(const spec of specs){
   const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+'?engine=unity');// the Unity bridge wrapper (contactWorld/targetWorld) is installed by the URL switch; D6QA160 keeps the match in 2Dawait page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&window.userMeshyMatchReady,{},{timeout:60000});await page.waitForTimeout(500);
   for(let attempt=0;attempt<3;attempt++){await page.evaluate(helper);if(await page.evaluate(()=>typeof D6QA160==='object'))break;await page.waitForTimeout(1000);}
   const setup=await page.evaluate(({size,players,seed})=>D6QA160.setup({config:{fieldSize:size,fieldPlayers:players},unity:false,seed,replays:false}),spec);
   await page.evaluate(()=>{
    const C=D6WorldUnityContract,camera={position:{x:0,y:30,height:30,z:-40},target:{x:0,y:0,height:0,z:0},fov:40};
    window.NativeCapture={pictures:[],seq:0};
    window.captureStep=()=>{
     const state=v65Context().state;const shown=C.scaled(v98PitchFrame(match),match.geometry);
     const p=C.picture(shown,'native-motion-'+D6QA160.state.fixtureId,++NativeCapture.seq,camera,match.finished?'finished':state.phase,match.score);
     NativeCapture.pictures.push({clock:p.clock,phase:p.phase,owner:p.owner,ballInFlight:p.ballInFlight===true,turned:p.turned,ball:p.ball,players:p.players.map(q=>({id:q.id,action:q.action,actionId:q.actionId,position:q.position,facing:q.facing,contactPoint:q.contactPoint||null,progress:q.progress,duration:q.duration,freshness:Number.isFinite(q.freshness)?q.freshness:-1,moving:q.moving,actionAt:q.actionAtKnown?q.actionAt:-1,actionAtKnown:Boolean(q.actionAtKnown),durationKnown:Boolean(q.durationKnown)}))});
     return false;
    };
   });
   await page.evaluate(minute=>QAJ('capture',D6QA160.run({minute,stopAtHalftime:true,limit:200000,stopWhen:()=>captureStep()})),minute);
   await page.waitForFunction(()=>QAR.done,null,{timeout:900000});
   const result=await page.evaluate(()=>QAR);if(result.error)throw new Error(result.error);
   const capture=await page.evaluate(({seed,size,players})=>({seed,fieldPlayers:players,fieldSize:size,keepers:match.people.filter(p=>p.keeper).map(p=>p.pid),pictures:NativeCapture.pictures}),spec);
   const meta={seed:spec.seed,fieldSize:spec.size,fieldPlayers:spec.players,fixtureId:setup?setup.fixtureId:null,setup,run:result.v,pictures:capture.pictures.length,livePictures:capture.pictures.filter(p=>p.phase==='live').length,firstClock:capture.pictures[0]?.clock,lastClock:capture.pictures.at(-1)?.clock,errors,sources:Object.fromEntries(['dist/world-unity-v151.js','dist/world-pitch3d-v98.js','dist/world-physical-v65.js','dist/world-football-flow-v159.js','dist/set-pieces-v50.js','work/platform/qa/unity-integration-v160.js'].map(f=>[f,sha(f)])),motionRevision:await page.evaluate(()=>match.attackFlow?.motionRevision??null),flowVersion:await page.evaluate(()=>match.attackFlow?.flowVersion??null),keeperHoldRevision:await page.evaluate(()=>match.attackFlow?.keeperHoldRevision??null)};
   const name=`motion-${spec.seed}-${spec.size}-${spec.players}`;
   fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(capture));fs.writeFileSync(path.join(out,name+'.meta.json'),JSON.stringify(meta,null,1));
   console.log(name,'pictures',capture.pictures.length,'live',meta.livePictures,'clock',meta.firstClock,'->',meta.lastClock,'minute',result.v?.minute,'score',result.v?.score,'errors',errors.length);
   await page.close();
  }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
