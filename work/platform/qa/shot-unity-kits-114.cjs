'use strict';
// Real Unity screenshots (normal play + replay) for kit/edge readability.
// usage: node shot-unity-kits-114.cjs <label> [quality=standard|reduced] [url base=http://127.0.0.1:4521/source/index.html]
// Writes outputs/release-114/unity-kits/<label>-<quality>-{live,replay,live-zoom,replay-zoom}.png and meta json.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const label=process.argv[2]||'before',quality=process.argv[3]||'standard',base=process.argv[4]||'http://127.0.0.1:4521/source/index.html';
const out=path.resolve('outputs/release-114/unity-kits');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11','--enable-gpu']});
 const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 // Optional A/B: D6_UNITY_DIR serves another Unity build (probe-build.json + Build/) to the same page.
 if(process.env.D6_UNITY_DIR)await p.route(/\/unity\/(probe-build\.json|Build\/)/,route=>route.fulfill({path:path.resolve(process.env.D6_UNITY_DIR,new URL(route.request().url()).pathname.slice(7))}));
 const meta={label,quality,unityDir:process.env.D6_UNITY_DIR||null};
 try{
  await p.goto(base+'?engine=unity&quality='+quality);
  await p.evaluate(fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8'));
  meta.setup=await p.evaluate(()=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true,replays:true}).then(r=>({ready:r.unityReady,error:r.error})));
  meta.kits=await p.evaluate(()=>match.kits);meta.source=await p.evaluate(()=>window.D6UnityMatch.lastAck&&{source:D6UnityMatch.lastAck.source||D6UnityMatch.lastAck.sourceId||null});
  await p.evaluate(()=>D6QA160.run({minute:9,sampleEvery:20}));
  // D6_KITS=violet: the reported pairing (violet vs white with dark trim), applied
  // through a real checkpoint so Unity starts a new session with these kits.
  if(process.env.D6_KITS==='violet'){meta.checkpoint=await p.evaluate(async()=>{Object.assign(match.kits.user,{main:'#8a6cc0',pattern:'#f2f3ed',trim:'#f2f3ed',accent:'#3d2f5c',style:'solid'});Object.assign(match.kits.opponent,{main:'#e9e7e1',pattern:'#24262b',trim:'#24262b',accent:'#24262b',style:'stripe'});return D6QA160.checkpoint();});meta.kits=await p.evaluate(()=>match.kits);}
  await p.evaluate(()=>{v98CameraMode='tv';v98CameraNear=70;v98Toolbar?.()});
  const host=p.locator('#d6-unity-host');
  const shot=async name=>{for(let i=0;i<40;i++)await p.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));await p.waitForTimeout(800);await host.screenshot({path:path.join(out,`${label}-${quality}-${name}.png`)});const pic=await p.evaluate(()=>D6UnityMatch.picture&&{replay:D6UnityMatch.picture.replay,ball:D6UnityMatch.picture.ball,camera:D6UnityMatch.picture.camera});meta[name]=pic;
   // zoom crop around the ball position projected by Unity labels: use the featured label if any
   const box=await host.boundingBox(),pr=await p.evaluate(()=>{const m=D6UnityMatch.projection?.markers?.filter(m=>m.visible)||[];if(!m.length)return null;const f=m.find(x=>x.featured)||m[0];return {x:f.x,y:f.y}});
   if(pr&&box){const w=420,h=280,x=Math.max(box.x,Math.min(box.x+box.width-w,box.x+pr.x*box.width-w/2)),y=Math.max(box.y,Math.min(box.y+box.height-h,box.y+pr.y*box.height-h/3));await p.screenshot({path:path.join(out,`${label}-${quality}-${name}-zoom.png`),clip:{x,y,width:w,height:h}});}
  };
  await shot('live');
  await p.evaluate(()=>D6QA160.pause());
  meta.review=await p.evaluate(()=>D6QA160.review());
  await shot('replay');
 }finally{meta.errors=errors;fs.writeFileSync(path.join(out,`${label}-${quality}.json`),JSON.stringify(meta,null,1)+'\n');console.log(JSON.stringify(meta));await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
