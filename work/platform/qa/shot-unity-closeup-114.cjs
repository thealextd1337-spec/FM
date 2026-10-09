'use strict';
// Close-up of real Unity players (follow camera, near) for edge inspection.
// usage: node shot-unity-closeup-114.cjs <label> [quality]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const label=process.argv[2]||'before',quality=process.argv[3]||'reduced',out=path.resolve('outputs/release-114/unity-kits');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11','--enable-gpu']});
 const p=await browser.newPage({viewport:{width:1440,height:950}});
 // Optional A/B: D6_UNITY_DIR serves another Unity build (probe-build.json + Build/) to the same page.
 if(process.env.D6_UNITY_DIR)await p.route(/\/unity\/(probe-build\.json|Build\/)/,route=>route.fulfill({path:path.resolve(process.env.D6_UNITY_DIR,new URL(route.request().url()).pathname.slice(7))}));
 try{
  await p.goto('http://127.0.0.1:4521/source/index.html?engine=unity&quality='+quality);
  await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
  await p.evaluate(()=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true,replays:true}));
  await p.evaluate(()=>D6QA160.run({minute:9,sampleEvery:20}));
  await p.evaluate(()=>D6QA160.pause());
  for(const mode of ['follow','goal']){await p.evaluate(m=>{v98CameraMode=m;v98CameraNear=100;v98Toolbar?.()},mode);for(let i=0;i<40;i++)await p.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));await p.waitForTimeout(800);await p.locator('#d6-unity-host').screenshot({path:path.join(out,`${label}-${quality}-close-${mode}.png`)});}
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
