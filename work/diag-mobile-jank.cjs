'use strict';
// B01 diagnosis (diag/mobile-jank): profiles a running native match of the real build in an isolated Edge context
// with mobile landscape emulation (915x412, DPR 3, touch, Android UA) and CPU throttling. Observation only: wrappers
// time existing calls and pass their arguments/results through unchanged; no match, clock or random draw is altered.
//   node work/diag-mobile-jank.cjs --view 2d|3d --throttle 4 --seconds 60 [--profile] [--trace] [--label x]
//        [--root <tree with outputs/index.html>] [--source] [--port 4250]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const arg=(n,f)=>{const i=process.argv.indexOf('--'+n);return i<0?f:process.argv[i+1]===undefined||process.argv[i+1].startsWith('--')?true:process.argv[i+1];};
const view=arg('view','2d'),throttle=Number(arg('throttle',4)),seconds=Number(arg('seconds',60)),port=Number(arg('port',4250));
const root=path.resolve(arg('root',path.join(__dirname,'..'))),useSource=Boolean(arg('source',false)),label=arg('label',`${view}-x${throttle}`);
if(port<4250||port>4269)throw Error('Port outside 4250-4269');
const out=path.join(__dirname,'..','outputs','diag-mobile-jank');fs.mkdirSync(out,{recursive:true});
const helper=fs.readFileSync(path.join(__dirname,'platform/qa/unity-integration-v160.js'),'utf8');
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const UA='Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

// Same routing as work/platform/qa/android-3d-acceptance.cjs, served from --root.
function serve(){
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm','.data':'application/octet-stream'};
 return require('node:http').createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),rel=decodeURIComponent(url.pathname);
  let file;
  if(rel==='/native-build.html')file=path.join(root,'outputs/index.html');
  else if(rel.startsWith('/unity/'))file=path.join(root,'outputs/platform/unity-web',rel.slice(7));
  else if(rel.startsWith('/unity-match/'))file=path.join(root,'dist',rel.slice(1));
  else if(rel.startsWith('/source/'))file=path.join(root,'dist',rel.slice(8));
  else{res.writeHead(404);res.end();return;}
  file=path.resolve(file);if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');
  if(rel==='/source/index.html'){res.end(fs.readFileSync(file,'utf8').replace('<head>','<head><script>window.D6UnityMatchUrl="/source/unity-match/runtime.html";</script>'));return;}
  fs.createReadStream(file).pipe(res);
 });
}

// Runs in the page and in the Unity iframe before any product script.
function init(){
 const now=()=>performance.now(),nativeRaf=window.requestAnimationFrame.bind(window),J=window.__jank={on:false,raf:[],lt:[],loaf:[],unity:[],unityMsg:[],recv:[]};
 let last=null;const loop=t=>{if(last!==null&&J.on)J.raf.push(t-last);last=t;nativeRaf(loop);};nativeRaf(loop);
 try{new PerformanceObserver(l=>{if(J.on)for(const e of l.getEntries())J.lt.push([e.startTime,e.duration]);}).observe({type:'longtask'});}catch{}
 try{new PerformanceObserver(l=>{if(J.on)for(const e of l.getEntries())J.loaf.push({d:e.duration,b:e.blockingDuration,r:e.renderStart?e.startTime+e.duration-e.renderStart:0,s:e.scripts.map(x=>[x.invoker,x.sourceFunctionName,(x.sourceURL||'').split('/').pop(),x.duration])});}).observe({type:'long-animation-frame'});}catch{}
 if(window===top)return;
 // Unity iframe: Emscripten main-loop callbacks (rAF or setTimeout) and the picture message handler.
 const hook=(fn,via)=>typeof fn==='function'&&fn.name==='MainLoop_runner'?function(...a){const t=now();try{return fn.apply(this,a);}finally{if(J.on)J.unity.push([t,now()-t,via]);}}:fn;
 const st=window.setTimeout;window.setTimeout=function(fn,ms,...a){return st.call(window,hook(fn,'timeout:'+Math.round(ms||0)),ms,...a);};
 let msgAt=0;window.addEventListener('message',e=>{if(e.data?.kind==='frame'){msgAt=now();if(J.on){const f=e.data.frame;J.recv.push([msgAt,f.sequence,f.clock,f.ball[0],f.ball[2]]);}}});
 document.addEventListener('DOMContentLoaded',()=>{
  const raf=window.requestAnimationFrame;window.requestAnimationFrame=function(fn){return raf.call(window,hook(fn,'raf'));};
  window.addEventListener('message',e=>{if(e.data?.kind==='frame'&&J.on)J.unityMsg.push(now()-msgAt);});
 });
}

// Installed in the page after setup. Wrappers measure and forward; arguments/results are untouched.
function instrument(){
 const J=window.__jank,now=()=>performance.now();J.tick=[];J.step=[];J.after=[];J.draw=[];J.frame=[];J.picture=[];J.post=[];J.heap=[];J.sim=[];J.drawAt=[];J.save=[];J.clone=[];J.valid=[];J.flush=[];J.report=[];J.saveAt=[];
 let lastStep=null;
 const wrap=(name,bucket,extra)=>{const base=window[name];window[name]=function(...a){const t=now();if(extra)extra(t);try{return base.apply(this,a);}finally{if(J.on)J[bucket].push(now()-t);}};};
 wrap('step','step',t=>{if(J.on&&lastStep!==null)J.tick.push(t-lastStep);lastStep=t;});
 wrap('v65AfterStep','after');wrap('v64UiSave','save',t=>{if(J.on)J.saveAt.push(t);});wrap('v61StorageClone','clone');wrap('v61ValidCareers','valid');wrap('v61FlushStorage','flush');wrap('v65RenderReport','report');wrap('draw','draw',t=>{if(J.on)J.drawAt.push(t);});wrap('v98PitchFrame','frame');
 const C=window.D6WorldUnityContract;if(C){const p=C.picture;C.picture=function(...a){const t=now();try{return p.apply(this,a);}finally{if(J.on)J.picture.push(now()-t);}};}
 const iframe=document.querySelector('#d6-unity-host iframe');
 if(iframe?.contentWindow){const w=iframe.contentWindow,pm=w.postMessage;w.postMessage=function(...a){const t=now();try{return pm.apply(this,a);}finally{if(J.on&&a[0]?.kind==='frame')J.post.push(now()-t);}};}
 J.heapTimer=setInterval(()=>{if(J.on){J.heap.push([now(),performance.memory?.usedJSHeapSize||0]);const pr=window.D6UnityMatch?.projection;J.sim.push([now(),match?.elapsed??null,v65Context()?.state.phase??null,match?.halftimePause||0,pr?.renderFrame??null,pr?.renderTime??null]);}},1000);
}

function stats(a){
 if(!a||!a.length)return null;const s=[...a].sort((x,y)=>x-y),q=p=>s[Math.min(s.length-1,Math.floor(p*s.length))],sum=a.reduce((x,y)=>x+y,0);
 return {n:a.length,mean:+(sum/a.length).toFixed(2),p50:+q(.5).toFixed(2),p95:+q(.95).toFixed(2),p99:+q(.99).toFixed(2),max:+s.at(-1).toFixed(2),sum:+sum.toFixed(1)};
}
const over=(a,ms)=>a.length?+(a.filter(x=>x>ms).length/a.length*100).toFixed(2):null;

// Replays the WorldViewPlayback.Receive/Sample rule (prototypes/match-engine-unity/WorldViewPlayback.cs) on the
// measured picture arrival times and Unity frame times: displayed ball speed per Unity frame vs. actual ball speed.
function playback(recv,unity){
 if(recv.length<10||unity.length<10)return null;
 let from=null,to=null,received=0,duration=0;const lerp=(a,b,q)=>a+(b-a)*q;
 const sample=t=>!to?null:duration<=0?to:(()=>{const q=Math.max(0,Math.min(1,(t-received)/duration));return {x:lerp(from.x,to.x,q),z:lerp(from.z,to.z,q)};})();
 // Ideal 60 Hz display grid (independent of how often Unity's loop runs): per grid frame the displayed ball step
 // relative to the source speed of the picture segment being shown. 1 = smooth; 0 = frozen frame; >1 = catch-up.
 const grid=[];for(let t=recv[0][0];t<recv.at(-1)[0];t+=1000/60)grid.push({t,kind:'u'});
 const events=[...recv.map(r=>({t:r[0],kind:'r',r})),...grid].sort((a,b)=>a.t-b.t||(a.kind==='r'?-1:1));
 let prevShown=null,segSpeed=0,lastPic=null;const ratio=[];let frozen=0,movingFrames=0;
 for(const e of events){
  if(e.kind==='r'){const f={x:e.r[3],z:e.r[4],clock:e.r[2]};const cur=sample(e.t)||f;const el=to?f.clock-to.clock:0;
   segSpeed=lastPic&&el>0?Math.hypot(f.x-lastPic.x,f.z-lastPic.z)/el:0;lastPic=f;
   from=cur;to={...f};received=e.t;duration=el<=0?0:Math.max(.025,Math.min(.1,el))*1000;}
  else{const p=sample(e.t);if(!p)continue;if(prevShown&&segSpeed>1){movingFrames++;const step=Math.hypot(p.x-prevShown.x,p.z-prevShown.z)/(1/60);const q=step/segSpeed;ratio.push(q);if(q<.05)frozen++;}prevShown=p;}
 }
 const rs=stats(ratio);
 return {gridFrames60:grid.length,movingFrames,frozenMovingFramesPct:movingFrames?+(frozen/movingFrames*100).toFixed(1):null,speedRatio:rs,speedRatioOutside50Pct:ratio.length?+(ratio.filter(q=>q<.5||q>1.5).length/ratio.length*100).toFixed(1):null,
  pictureGapMs:stats(recv.slice(1).map((r,i)=>r[0]-recv[i][0])),pictureClockStepMs:stats(recv.slice(1).map((r,i)=>(r[2]-recv[i][2])*1000))};
}

(async()=>{
 const server=serve();await new Promise(r=>server.listen(port,'127.0.0.1',r));
 const htmlFile=path.join(root,'outputs/index.html'),before=sha(htmlFile);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:false,args:['--window-size=1000,560','--window-position=40,40','--enable-precise-memory-info']});
 const report={label,view,throttle,seconds,root,source:useSource,nopump:Boolean(arg('nopump',false)),htmlSha256:before,at:new Date().toISOString(),notes:[]};
 try{
  const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA,locale:'de-DE'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Diagnostic variant only: a present D6ViewFramePump makes view-frame-scheduler-v130.js return early (native rAF).
  if(arg('nopump',false))await page.addInitScript(()=>{window.D6ViewFramePump={version:0,setEnabled(){},enabled:false,fallbacks:0,pending:0};});
  await page.addInitScript(init);
  const url=useSource?`http://127.0.0.1:${port}/source/index.html?engine=unity`:`http://127.0.0.1:${port}/native-build.html?engine=unity`;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&typeof v61CreateCareer==='function',{},{timeout:120000});await page.waitForTimeout(800);
  for(let i=0;i<3;i++){await page.evaluate(helper);if(await page.evaluate(()=>typeof D6QA160==='object'))break;await page.waitForTimeout(1000);}
  report.setup=await page.evaluate(unity=>D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity,replays:true}),view==='3d');
  report.env=await page.evaluate(()=>({si:Boolean(match.si),clockRate:match.si?v183Rate(match):MATCH_SPEED,coarse:matchMedia('(pointer:coarse)').matches,dpr:devicePixelRatio,view:v98View,people:match.people.length,canvas:[$('#canvas').width,$('#canvas').height],unityReady:window.D6UnityMatch?.ready??null,unityError:window.D6UnityMatch?.lastError??null}));
  // Natural product loop, as in the Android runner.
  await page.evaluate(()=>{v65Pause();v65Resume();if(typeof hideOverlay==='function')hideOverlay();v132RevealControls?.();});
  const expand=page.locator('#v99-expand');if(await expand.count()&&await expand.isVisible().catch(()=>false)){await expand.tap().catch(e=>report.notes.push('fullscreen tap: '+e.message));}
  await page.waitForTimeout(3000);
  report.fullscreen=await page.evaluate(()=>({native:Boolean(document.fullscreenElement),viewport:document.body.classList.contains('v132-fullscreen'),canvas:[$('#canvas').width,$('#canvas').height],canvasCss:[$('#canvas').offsetWidth,$('#canvas').offsetHeight],unityCanvas:(()=>{const c=document.querySelector('#d6-unity-host iframe')?.contentDocument?.querySelector('canvas');return c?[c.width,c.height]:null;})()}));
  const cdp=await context.newCDPSession(page);
  if(throttle>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
  // The product stores the running career; D6QA160 keeps it in memory only. Store it (plus optional copies with
  // their own ids to emulate further saved worlds) in this isolated profile so v64UiSave does the real work.
  report.stored=await page.evaluate(async n=>{const c=v61CurrentCareer,list=[c];for(let i=0;i<n;i++){const x=JSON.parse(JSON.stringify(c));x.id=c.id+'-diag'+i;list.push(x);}await v61SaveCareers(list);return {careers:v61ReadCareers().length,mb:+(JSON.stringify(v61ReadCareers()).length/1048576).toFixed(2)};},Number(arg('extra',0))).catch(e=>({error:e.message}));
  await page.evaluate(instrument);await page.waitForTimeout(4000);
  // Keep the match live across halftime (a user would press continue) and record it.
  const resumeTimer=setInterval(()=>page.evaluate(()=>{const c=v65Context();if(c?.state.phase==='paused'&&match?.halftimePause>0&&!match.finished){v65Resume();return true;}return false;}).then(r=>{if(r)report.notes.push('halftime resumed');}).catch(()=>{}),1500);
  const frames=page.frames();const setOn=on=>Promise.all(frames.map(f=>f.evaluate(o=>{if(window.__jank)window.__jank.on=o;},on).catch(()=>{})));
  if(arg('profile',false)){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start');}
  let trace=null;
  if(arg('trace',false)){trace=[];cdp.on('Tracing.dataCollected',e=>trace.push(...e.value));await cdp.send('Tracing.start',{traceConfig:{includedCategories:['devtools.timeline','disabled-by-default-v8.gc'],recordMode:'recordContinuously'},transferMode:'ReportEvents'});}
  const t0=Date.now();await setOn(true);
  await page.waitForTimeout(seconds*1000);
  await setOn(false);report.wallSeconds=(Date.now()-t0)/1000;clearInterval(resumeTimer);
  if(trace){const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;
   const gc=trace.filter(e=>/^(MinorGC|MajorGC|V8\.GC_SCAVENGER|V8\.GC_MARK_COMPACTOR|V8\.GCScavenger|V8\.GCFinalizeMC|V8\.GCIncrementalMarking)$/.test(e.name)&&e.dur);
   const by={};for(const e of gc){(by[e.name]??=[]).push(e.dur/1000);}
   report.gc=Object.fromEntries(Object.entries(by).map(([k,v])=>[k,stats(v)]));
   const tasks=trace.filter(e=>e.name==='RunTask'&&e.dur&&e.dur>50000);report.traceLongTasks=tasks.length;}
  if(arg('profile',false)){const {profile}=await cdp.send('Profiler.stop');
   const byId=new Map(profile.nodes.map(n=>[n.id,n])),self=new Map();const dt=profile.timeDeltas;
   for(let i=0;i<profile.samples.length;i++){const n=byId.get(profile.samples[i]);const k=n.callFrame;const key=(k.url.split('/').pop().split('?')[0]||'(native)')+' :: '+(k.functionName||'(anon)');self.set(key,(self.get(key)||0)+(dt[i]||0)/1000);}
   const total=[...self.values()].reduce((a,b)=>a+b,0),file=new Map();for(const [k,v]of self){const f=k.split(' :: ')[0];file.set(f,(file.get(f)||0)+v);}
   report.profile={totalMs:+total.toFixed(0),byFile:[...file].sort((a,b)=>b[1]-a[1]).slice(0,30).map(([k,v])=>[k,+v.toFixed(0),+(v/total*100).toFixed(1)]),topSelf:[...self].sort((a,b)=>b[1]-a[1]).slice(0,45).map(([k,v])=>[k,+v.toFixed(0),+(v/total*100).toFixed(1)])};
   fs.writeFileSync(path.join(out,label+'.cpuprofile'),JSON.stringify(profile));}
  const top=await page.evaluate(()=>{const J=window.__jank;clearInterval(J.heapTimer);return {raf:J.raf,lt:J.lt,loaf:J.loaf,tick:J.tick,step:J.step,after:J.after,draw:J.draw,frame:J.frame,picture:J.picture,post:J.post,heap:J.heap,sim:J.sim,drawAt:J.drawAt,save:J.save,clone:J.clone,valid:J.valid,flush:J.flush,report:J.report,saveAt:J.saveAt,careerBytes:(()=>{try{return JSON.stringify(v61ReadCareers()).length;}catch{return null;}})(),careers:(()=>{try{return v61ReadCareers().length;}catch{return null;}})()};});
  const unityFrame=frames.find(f=>f!==page.mainFrame()&&/unity-match/.test(f.url()));
  const inner=unityFrame?await unityFrame.evaluate(()=>{const J=window.__jank;return J?{raf:J.raf,lt:J.lt,unity:J.unity,unityMsg:J.unityMsg,recv:J.recv}:null;}).catch(e=>({error:e.message})):null;
  const live=top.sim.filter(s=>s[2]==='live'),simRate=live.length>2?(live.at(-1)[1]-live[0][1])/((live.at(-1)[0]-live[0][0])/1000):null;
  // Each 40 ms timer tick may advance at most 0.05 s of real time (world-physical-v65.js); longer gaps are lost.
  const lost=top.tick.reduce((a,t)=>a+Math.max(0,t-50),0);
  const tickTotal=top.tick.map((_,i)=>(top.step[i+1]||0)+(top.after[i+1]||0)+(top.draw[i+1]||0));
  report.page={rafMs:stats(top.raf),rafOver20Pct:over(top.raf,20),rafOver33Pct:over(top.raf,33.4),rafOver50Pct:over(top.raf,50),freezesPerMinute:+(top.raf.filter(x=>x>100).length/(report.wallSeconds/60)).toFixed(1),
   longTasks:{n:top.lt.length,ms:stats(top.lt.map(x=>x[1]))},loaf:{n:top.loaf.length,ms:stats(top.loaf.map(x=>x.d)),blockingSum:+top.loaf.reduce((a,x)=>a+x.b,0).toFixed(0)},
   tickIntervalMs:stats(top.tick),tickOver50Pct:over(top.tick,50),tickOver80Pct:over(top.tick,80),lostRealSecondsPerMinute:+(lost/1000/(report.wallSeconds/60)).toFixed(2),
   stepMs:stats(top.step),afterStepMs:stats(top.after),drawMs:stats(top.draw),tickWorkMs:stats(tickTotal),pitchFrameMs:stats(top.frame),pictureMs:stats(top.picture),postMessageMs:stats(top.post),
   heapMB:top.heap.length?{first:+(top.heap[0][1]/1048576).toFixed(1),last:+(top.heap.at(-1)[1]/1048576).toFixed(1),max:+(Math.max(...top.heap.map(h=>h[1]))/1048576).toFixed(1),drops:top.heap.slice(1).filter((h,i)=>h[1]<top.heap[i][1]*.9).length}:null,
   simSecondsPerWallSecond:simRate&&+simRate.toFixed(3),phases:[...new Set(top.sim.map(s=>s[2]))]};
  // Autosave inside v65AfterStep (every >700 ms of live play): whole-career JSON clone, validation, IndexedDB put.
  report.page.autosave={perMinute:+(top.saveAt.length/(report.wallSeconds/60)).toFixed(1),saveMs:stats(top.save),cloneMs:stats(top.clone),validateMs:stats(top.valid),flushMs:stats(top.flush),renderReportMs:stats(top.report),careerJsonMB:top.careerBytes&&+(top.careerBytes/1048576).toFixed(2),careers:top.careers};
  // 2D: the canvas only changes on a timer tick; share of display frames with new content at 60/120 Hz.
  const fresh=hz=>{const d=top.drawAt;if(d.length<10)return null;let n=0,k=0,i=0;for(let t=d[0];t<d.at(-1);t+=1000/hz){let c=false;while(i<d.length&&d[i]<=t){c=true;i++;}n++;if(c)k++;}return +(k/n*100).toFixed(1);};
  report.page.canvasNewContentPct={hz60:fresh(60),hz120:fresh(120),drawsPerSecond:+(top.drawAt.length/report.wallSeconds).toFixed(1)};
  const rf=top.sim.filter(s=>Number.isFinite(s[4])&&Number.isFinite(s[5]));if(rf.length>2)report.page.unityRenderedFps=+((rf.at(-1)[4]-rf[0][4])/(rf.at(-1)[5]-rf[0][5])).toFixed(1);
  report.page.heapSeries=top.heap.filter((_,i)=>i%10===0).map(h=>+(h[1]/1048576).toFixed(1));
  // Script attribution of long animation frames (page and iframe share the main thread).
  const att=new Map();for(const l of top.loaf)for(const [inv,fn,src,d]of l.s){const k=`${src||'?'} :: ${fn||inv}`;att.set(k,(att.get(k)||0)+d);}
  report.page.loafScripts=[...att].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>[k,+v.toFixed(0)]);
  if(inner&&!inner.error){report.unity={rafMs:stats(inner.raf),unityFrameIntervalMs:stats(inner.unity.slice(1).map((u,i)=>u[0]-inner.unity[i][0])),unityFrameIntervalOver20Pct:over(inner.unity.slice(1).map((u,i)=>u[0]-inner.unity[i][0]),20),unityFrameIntervalOver33Pct:over(inner.unity.slice(1).map((u,i)=>u[0]-inner.unity[i][0]),33.4),unityFrameCpuMs:stats(inner.unity.map(u=>u[1])),unityFramesPerSecond:+(inner.unity.length/report.wallSeconds).toFixed(1),unityScheduling:Object.fromEntries([...new Set(inner.unity.map(u=>u[2]))].map(k=>[k,inner.unity.filter(u=>u[2]===k).length])),pictureHandlerMs:stats(inner.unityMsg),picturesPerSecond:+(inner.recv.length/report.wallSeconds).toFixed(1),playback:playback(inner.recv,inner.unity)};}
  else if(inner?.error)report.notes.push('unity frame: '+inner.error);
  // Scaling probe of the autosave work on copies (no write): 1x and 3x the current career, still throttled.
  report.saveScaling=await page.evaluate(()=>{const c=v61CurrentCareer,r={};
   for(const k of [1,3]){const list=Array.from({length:k},()=>c);let a=performance.now();const copy=v61StorageClone(list);r['clone'+k]=+(performance.now()-a).toFixed(1);
    a=performance.now();copy.forEach(x=>v61ValidateCareer(x));r['validate'+k]=+(performance.now()-a).toFixed(1);a=performance.now();structuredClone(copy);r['structuredClone'+k]=+(performance.now()-a).toFixed(1);}
   r.mb1=+(JSON.stringify(c).length/1048576).toFixed(2);return r;}).catch(e=>({error:e.message}));
  report.errors=errors.slice(0,10);report.htmlUnchanged=sha(htmlFile)===before;
  report.end=await page.evaluate(()=>({elapsed:match?.elapsed,minute:v65Context()?.state.minute,phase:v65Context()?.state.phase,score:match?.score,unityError:window.D6UnityMatch?.lastError??null}));
 }catch(e){report.fatal=String(e.stack||e);}
 finally{fs.writeFileSync(path.join(out,label+'.json'),JSON.stringify(report,null,1));await browser.close();server.close();}
 console.log(JSON.stringify({label,fatal:report.fatal,env:report.env,page:report.page&&{raf:report.page.rafMs,over33:report.page.rafOver33Pct,tick:report.page.tickIntervalMs,tickWork:report.page.tickWorkMs,step:report.page.stepMs,draw:report.page.drawMs,lost:report.page.lostRealSecondsPerMinute,sim:report.page.simSecondsPerWallSecond,heap:report.page.heapMB},unity:report.unity},null,1));
})();
