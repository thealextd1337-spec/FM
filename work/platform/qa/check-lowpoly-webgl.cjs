'use strict';
// Klares Low-Poly WebGL evidence on the real club-world match page (dist/) with a
// chosen Unity build (baseline copy or candidate). The native match runs with
// a seeded Math.random and fixed 0.05 s ticks (D6QAWorldTick), so baseline and
// candidate consume identical simulation steps; the renderer only displays.
//   node work/platform/qa/check-lowpoly-webgl.cjs --build <repo-relative unity-web dir> --label <name> [--out <dir>] [--gpu|--software] [--only shots|parity|perf|video] [--unthrottled] [--port N]
// Node >= 20 (Playwright). Writes images, webm videos and <label>.json.
// --unthrottled: no vsync and no frame-rate cap, so perf frame times show the actual
// frame cost instead of the display interval (compare builds only within one mode).
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const repo=path.resolve(__dirname,'../../..'),arg=(n,d)=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:d;};
const buildDir=path.resolve(repo,arg('--build','outputs/platform/unity-web')),label=arg('--label','candidate'),only=arg('--only',null);
const out=path.resolve(repo,arg('--out','outputs/style-demos/lowpoly/webgl/'+label));fs.mkdirSync(out,{recursive:true});
const gpu=!process.argv.includes('--software'),unthrottled=process.argv.includes('--unthrottled'),port=Number(arg('--port',4372));
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(buildDir,'probe-build.json'),'utf8'));
const report={label,build:path.relative(repo,buildDir).replace(/\\/g,'/'),sourceId:manifest.sourceId,buildFiles:manifest.files,downloadBytes:manifest.files.reduce((s,f)=>s+f.bytes,0),renderer:null,gpu,unthrottled,shots:[],parity:null,perf:[],videos:[],errors:[],meshLog:[]};
for(const f of manifest.files){const actual=sha(path.join(buildDir,'Build',f.file));if(actual!==f.sha256)throw Error('Build file hash differs from its manifest: '+f.file);}

function server(){return http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),rel=decodeURIComponent(url.pathname),source=rel.startsWith('/source/'),unity=rel.startsWith('/unity/');
 const root=source?path.join(repo,'dist'):unity?buildDir:null;if(!root){res.writeHead(404);res.end();return;}
 const file=path.resolve(root,source?rel.slice(8):rel.slice(7));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm','.data':'application/octet-stream'}[path.extname(file)]||'application/octet-stream'));
 res.setHeader('Cache-Control','no-cache');
 if(source&&path.basename(file)==='index.html'){res.end(fs.readFileSync(file,'utf8').replace('<head>','<head><script>window.D6UnityMatchUrl="/source/unity-match/runtime.html";</script>'));return;}
 fs.createReadStream(file).pipe(res);
});}

// Counts WebGL draw calls per animation frame inside the Unity iframe.
const drawCounter=`(()=>{if(!location.pathname.includes('unity-match'))return;const counts={draws:0,frames:0,perFrame:[]};window.D6DrawStats=counts;
 for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext])if(C)for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced','drawRangeElements']){const f=C.prototype[name];if(f)C.prototype[name]=function(...a){counts.draws++;return f.apply(this,a);};}
 // Wasm linear memory of the Unity runtime (exported memory), for the perf heap figure.
 const wrap=n=>{const f=WebAssembly[n];if(f)WebAssembly[n]=async(...a)=>{const r=await f.apply(WebAssembly,a);try{for(const v of Object.values((r.instance||r).exports||{}))if(v instanceof WebAssembly.Memory)window.D6WasmMemory=v;}catch{}return r;};};wrap('instantiate');wrap('instantiateStreaming');
 const tick=()=>{counts.perFrame.push(counts.draws);if(counts.perFrame.length>2000)counts.perFrame.shift();counts.draws=0;counts.frames++;requestAnimationFrame(tick);};requestAnimationFrame(tick);})();`;

async function prepare(page,quality,seed=12345,near=60){
 await page.goto(`http://127.0.0.1:${port}/source/index.html?engine=unity&quality=${quality}`);
 await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter,{},{timeout:60000});await page.waitForFunction(()=>window.userMeshyMatchReady,{},{timeout:90000});
 const info=await page.evaluate(async({seed,near})=>{
  v98CameraNear=near;window.D6TestRandomCalls=0;Math.random=()=>{window.D6TestRandomCalls++;seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const c=v61CreateCareer('GER-2','lowpoly-demo'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);if(c.world.market.phase==='budget')v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
  const fixture=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);
  c.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(c,fixture)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);
  window.D6QATicks=0;window.D6QAWorldTick=(real)=>{window.D6QATicks++;step(real*MATCH_SPEED,real);const context=v65Context();if(context.state.phase==='live'&&!match.finished)v65AfterStep(context);};
  window.D6QAActions=()=>{try{return v98PitchFrame(match).players.map(p=>{const a=['foulVictim','foulOffender'].includes(p.action?.kind)?p.action:p.unityAction||p.action;return a?.kind||'idle';});}catch{return [];}};
  window.D6QAState=()=>({ticks:D6QATicks,elapsed:match.elapsed,score:[...match.score],ball:{x:match.ball.x,y:match.ball.y,z:match.ball.z},events:v65Context().state.events.length,randomCalls:D6TestRandomCalls});
  v103CanReplay=()=>false;
  return {fixtureId:fixture.id,home:club.id};
 },{seed,near});
 await waitPicture(page);
 if(!report.renderer)report.renderer=await page.frames().find(f=>f.url().includes('unity-match'))?.evaluate(()=>{
  const canvas=document.querySelector('canvas'),gl=canvas&&(canvas.getContext('webgl2')||canvas.getContext('webgl'));
  const debug=gl&&gl.getExtension('WEBGL_debug_renderer_info');
  return gl?{vendor:gl.getParameter(debug?debug.UNMASKED_VENDOR_WEBGL:gl.VENDOR),renderer:gl.getParameter(debug?debug.UNMASKED_RENDERER_WEBGL:gl.RENDERER),source:'existing Unity canvas context'}:null;
 });
 return info;
}
async function waitPicture(page){await page.waitForFunction(()=>D6UnityMatch?.ready&&D6UnityMatch.lastAck?.sequence>=D6UnityMatch.picture?.sequence-1,{},{timeout:180000});}
async function resume(page){await page.evaluate(()=>{v65Resume();clearInterval(v65WorldFrame);});}
// Fixed-step fast-forward (no wall-clock), drawing every few ticks like the page.
async function advance(page,ticks){await page.evaluate(n=>{for(let i=0;i<n&&!match.finished;i++){if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}D6QAWorldTick(.05);if(i%10===0)draw();}draw();},ticks);await waitPicture(page);}
// Real-time playback with the same fixed ticks (one per 50 ms) for videos.
async function play(page,seconds){await page.evaluate(s=>new Promise(done=>{const end=performance.now()+s*1000;const timer=setInterval(()=>{if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}D6QAWorldTick(.05);draw();if(performance.now()>=end||match.finished){clearInterval(timer);done();}},50);}),seconds);}
// The match view as the player sees it: viewport incl. the page's labels and HUD.
async function shot(page,file){await page.waitForTimeout(150);await page.screenshot({path:path.join(out,file)});}
// The page eases its camera over wall-clock time; let it settle so both builds frame alike.
async function pause(page){await page.evaluate(()=>{v65Pause();clearInterval(v65WorldFrame);draw();});await waitPicture(page);await page.waitForTimeout(3000);}

(async()=>{
 const srv=server();await new Promise(r=>srv.listen(port,'127.0.0.1',r));
 const args=gpu?['--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11','--enable-gpu-rasterization']:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 if(unthrottled)args.push('--disable-gpu-vsync','--disable-frame-rate-limit');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args});
 const newPage=async(viewport,video)=>{const context=await browser.newContext({viewport,deviceScaleFactor:1,...(video?{recordVideo:{dir:out,size:viewport}}:{})});await context.addInitScript(drawCounter);const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{const t=m.text();if(t.includes('[D6] match mesh')&&!report.meshLog.includes(t))report.meshLog.push(t);});return {context,page};};
 try{
  if(!only||only==='shots'){
   for(const quality of ['standard','reduced'])for(const [w,h] of [[1280,720],[844,390],[931,448]]){
    const {context,page}=await newPage({width:w,height:h});await prepare(page,quality);
    if(!report.renderer)report.renderer=await page.frames().find(f=>f.url().includes('unity-match'))?.evaluate(()=>{const c=document.createElement('canvas').getContext('webgl2');const d=c&&c.getExtension('WEBGL_debug_renderer_info');return d?c.getParameter(d.UNMASKED_RENDERER_WEBGL):'unknown';});
    // The existing viewport-filling match layout (v132ScreenState, as the fullscreen button without the browser API).
    await page.evaluate(()=>(v132ScreenState(true),v132RevealControls(),draw()));await page.waitForTimeout(500);await waitPicture(page);await page.waitForTimeout(400);
    const kick=`${label}-kickoff-${quality}-${w}x${h}.png`;await shot(page,kick);const plays=[];
    for(const ticks of [260,520,780]){await advance(page,ticks-await page.evaluate(()=>D6QATicks));await pause(page);const live=`${label}-play${ticks}-${quality}-${w}x${h}.png`;await shot(page,live);plays.push(live);}
    report.shots.push({quality,size:`${w}x${h}`,kickoff:kick,plays,state:await page.evaluate(()=>D6QAState()),labels:await page.locator('#d6-unity-labels button').count()});
    await context.close();
   }
  }
  if(!only||only==='parity'){
   // Native sequence after identical fixed steps (first half and beyond).
   const {context,page}=await newPage({width:1280,height:720});await prepare(page,'standard');const states=[];
   for(const ticks of [600,1200,2400,4800]){await advance(page,ticks-await page.evaluate(()=>D6QATicks));states.push(await page.evaluate(()=>({...D6QAState(),eventLog:JSON.stringify(v65Context().state.events),goals:JSON.stringify(match.goals)})));}
   report.parity={states:states.map(s=>({...s,eventLog:crypto.createHash('sha256').update(s.eventLog).digest('hex'),goals:crypto.createHash('sha256').update(s.goals).digest('hex')}))};await context.close();
  }
  if(!only||only==='perf'){
   for(const quality of ['standard','reduced']){
    const {context,page}=await newPage({width:1280,height:720});await prepare(page,quality);await page.evaluate(()=>(v132ScreenState(true),v132RevealControls(),draw()));await advance(page,400);
    const frame=page.frames().find(f=>f.url().includes('unity-match'));
    await frame.evaluate(()=>{window.D6FrameTimes=[];let last=performance.now();const loop=t=>{window.D6FrameTimes.push(t-last);last=t;if(window.D6FrameTimes.length<100000)requestAnimationFrame(loop);};requestAnimationFrame(loop);window.D6DrawStats.perFrame.length=0;});
    await play(page,12);
    const m=await frame.evaluate(()=>{const t=window.D6FrameTimes.slice(30).sort((a,b)=>a-b),d=window.D6DrawStats.perFrame.slice(30).filter(x=>x>0).sort((a,b)=>a-b),q=(a,p)=>a.length?a[Math.min(a.length-1,Math.floor(a.length*p))]:null;
     return {frames:t.length,frameMedianMs:q(t,.5),frameP95Ms:q(t,.95),drawsMedian:q(d,.5),drawsP95:q(d,.95),jsHeapMB:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,wasmMemoryMB:window.D6WasmMemory?Math.round(window.D6WasmMemory.buffer.byteLength/1048576):null};});
    report.perf.push({quality,...m});await context.close();
   }
  }
  if(!only||only==='video'){
   // Scan for the first native actions of interest, then record short clips around them.
   const marks={};
   for(const seed of [12345,777,4242,9001,31337,2026]){
    const {context:scanContext,page:scan}=await newPage({width:640,height:360});await prepare(scan,'standard',seed);
    const found=await scan.evaluate(()=>{const wanted={slide:'slide',tackle:'tackle',save:'keeper',shot:'shot',header:'header',pass:'pass'};const found={};
     for(let i=0;i<9000&&!match.finished;i++){if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}D6QAWorldTick(.05);for(const a of D6QAActions()){const k=wanted[a];if(k&&found[k]===undefined)found[k]=D6QATicks;}}return found;});
    await scanContext.close();for(const [k,t] of Object.entries(found))if(!marks[k])marks[k]={seed,tick:t};if(marks.keeper&&marks.slide&&marks.header)break;
   }
   report.videoMarks=marks;
   // Clips without a video encoder: deterministic picture sequences (two native
   // ticks = 0.1 s per frame, each frame waits for Unity's acknowledgement),
   // joined to an animated WebP at real-time pace plus a contact sheet.
   const sharp=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
   const clips=[['sprint-pass','pass',20,50],['shot','shot',30,60],['slide','slide',24,60],['keeper','keeper',36,70],['tackle','tackle',24,50],['header','header',24,50]];
   for(const [name,kind,lead,frames] of clips){
    if(!marks[kind]){report.videos.push({name,missing:true});continue;}const {seed,tick}=marks[kind];
    for(const quality of ['standard','reduced']){
     if(quality==='reduced'&&!['keeper','slide'].includes(name))continue;
     const {context,page}=await newPage({width:1280,height:720});await prepare(page,quality,seed,100);await page.evaluate(()=>(v132ScreenState(true),v132RevealControls(),draw()));
     await advance(page,Math.max(0,tick-lead*2));await page.waitForTimeout(1500);const shots=[];
     for(let k=0;k<frames;k++){await page.evaluate(()=>{for(let i=0;i<2&&!match.finished;i++){if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}D6QAWorldTick(.05);}draw();});await waitPicture(page);await page.waitForTimeout(70);
      shots.push(await sharp(await page.screenshot({type:'png'})).resize(960,540).png().toBuffer());}
     await context.close();const file=`${label}-${name}-${quality}.webp`,sheet=`${label}-${name}-${quality}-sheet.png`;
     await sharp(shots,{join:{animated:true}}).webp({delay:100,loop:0,quality:78}).toFile(path.join(out,file));
     const pick=[0,1,2,3,4,5,6,7].map(i=>shots[Math.min(shots.length-1,Math.round(i*(shots.length-1)/7))]);
     await sharp({create:{width:480*4,height:270*2,channels:3,background:'#000'}}).composite(await Promise.all(pick.map(async(b,i)=>({input:await sharp(b).resize(480,270).toBuffer(),left:(i%4)*480,top:Math.floor(i/4)*270})))).png().toFile(path.join(out,sheet));
     report.videos.push({name,quality,file,sheet,seed,cameraNear:100,startTick:Math.max(0,tick-lead*2),actionTick:tick,frames,secondsAtRealPace:frames/10});
    }
   }
  }
 }catch(e){report.errors.push(String(e&&e.stack||e));process.exitCode=1;}
 finally{fs.writeFileSync(path.join(out,label+'.json'),JSON.stringify(report,null,1));await browser.close();srv.close();}
 console.log(JSON.stringify({label,meshLog:report.meshLog,renderer:report.renderer,shots:report.shots.length,parity:report.parity&&report.parity.states.map(s=>[s.ticks,s.elapsed.toFixed(2),s.score.join(':'),s.events,s.eventLog.slice(0,10)]),perf:report.perf,videos:report.videos.length,errors:report.errors.slice(0,3)},null,1));
})();
