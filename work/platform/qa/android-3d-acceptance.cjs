'use strict';
// QA only: an existing USB Android Chrome, one new page, one private loopback origin.
const fs=require('node:fs'),path=require('node:path'),net=require('node:net'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../../..');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
const argv=process.argv.slice(2),options={mode:null,adb:'adb',serial:null,seconds:90};
for(let i=0;i<argv.length;i++){
 const a=argv[i];if(a==='--probe'||a==='--run'){if(options.mode)throw Error('Choose exactly one of --probe and --run');options.mode=a.slice(2);}
 else if(['--adb','--serial','--seconds'].includes(a)){if(!argv[i+1])throw Error('Missing value for '+a);options[a.slice(2)]=argv[++i];}
 else throw Error('Unknown argument: '+a);
}
if(!options.mode)throw Error('Usage: node android-3d-acceptance.cjs --probe|--run [--adb path] [--serial device] [--seconds 60..180]');
options.seconds=Number(options.seconds);
if(!Number.isInteger(options.seconds)||options.seconds<60||options.seconds>180)throw Error('--seconds must be an integer from 60 to 180');
const out=path.join(root,'outputs/3d-quality/android-device-prerequisites',options.mode+'-'+new Date().toISOString().replace(/[:.]/g,'-'));
const report={schema:1,mode:options.mode,status:'blocked',pass:false,hardwarePass:false,started:new Date().toISOString(),prerequisites:{},samples:[],manual:['Real app switch and return; wake-lock reacquisition and unchanged native match state','Visual readability of names, team rings and ball in landscape; interaction and keeper animations'],limitations:['No GPU presentation or per-frame GPU timing measurement','No performance acceptance threshold or full device acceptance is inferred from loop counters']};
let serial=null,server=null,browser=null,page=null,cdp=null,reverse=null,forward=null,origin=null;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function adb(args,device=true){
 const r=spawnSync(options.adb,[...(device?['-s',serial]:[]),...args],{encoding:'utf8',timeout:12000,windowsHide:true});
 if(r.error||r.status!==0)throw Error('ADB command unavailable/failed: '+args.slice(0,2).join(' '));return r.stdout.trim();
}
function power(){
 const text=adb(['shell','dumpsys','power']);
 return {wakefulness:text.match(/mWakefulness=(\w+)/)?.[1]??null,displayState:text.match(/Display Power: state=(\w+)/)?.[1]??text.match(/mScreenState=(\w+)/)?.[1]??null};
}
function bindings(text){return text.split(/\r?\n/).filter(Boolean).map(line=>line.trim().split(/\s+/));}
function hasBinding(rows,local,remote,owner){return rows.some(row=>row.at(-2)===local&&(!remote||row.at(-1)===remote)&&(!owner||row[0]===owner));}
async function freePort(){const s=net.createServer();await new Promise((r,j)=>{s.once('error',j);s.listen(0,'127.0.0.1',r);});const p=s.address().port;await new Promise(r=>s.close(r));return p;}
function summary(values){if(!values.length)return null;const v=[...values].sort((a,b)=>a-b);return {samples:v.length,p50:v[Math.floor((v.length-1)*.5)],p95:v[Math.floor((v.length-1)*.95)],max:v.at(-1)};}
async function hash(file){const h=createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return h.digest('hex');}
async function buildSnapshot(){
 const base=path.join(root,'outputs/platform/unity-web'),manifestFile=path.join(base,'probe-build.json'),htmlFile=path.join(root,'outputs/index.html');
 if(!fs.existsSync(manifestFile)||!fs.existsSync(htmlFile))return {valid:false,reason:'Current HTML or Unity manifest missing'};
 const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8')),expected=['unity-web.data','unity-web.framework.js','unity-web.loader.js','unity-web.wasm'];
 if(!Array.isArray(manifest.files)||manifest.files.length!==4||!expected.every(name=>manifest.files.filter(f=>f.file===name).length===1))return {valid:false,reason:'Expected exactly four frozen Unity build assets'};
 const assets=[];for(const name of expected){const file=path.join(base,'Build',name),entry=manifest.files.find(f=>f.file===name);if(!fs.existsSync(file))return {valid:false,reason:'Frozen Unity asset missing'};const sha256=await hash(file);assets.push({file:name,sha256,bytes:fs.statSync(file).size,manifestMatches:sha256===entry.sha256&&fs.statSync(file).size===entry.bytes});}
 return {sourceId:manifest.sourceId,htmlSha256:await hash(htmlFile),manifestSha256:await hash(manifestFile),assets,valid:assets.every(f=>f.manifestMatches)};
}
async function prerequisites(){
 report.prerequisites.nodeMajor=Number(process.versions.node.split('.')[0]);
 report.prerequisites.nodeSupported=report.prerequisites.nodeMajor>=20;
 report.prerequisites.buildAvailable=fs.existsSync(path.join(root,'outputs/index.html'));
 report.prerequisites.playwrightAvailable=fs.existsSync(path.join(runtime,'node_modules/playwright/index.js'));
 report.buildBefore=await buildSnapshot();
 try{report.prerequisites.adbVersion=adb(['version'],false).split(/\r?\n/)[0];report.prerequisites.adbAvailable=true;}catch{report.prerequisites.adbAvailable=false;report.reason='ADB missing: install/locate Platform Tools yourself and use --adb; no SDK download performed';return false;}
 const devices=adb(['devices','-l'],false).split(/\r?\n/).slice(1).map(line=>line.trim().split(/\s+/)).filter(row=>row.length>=2);
 let soleUsb=null;try{soleUsb=adb(['-d','get-serialno'],false);}catch{}
 const usb=[];for(const row of devices.filter(r=>r[1]==='device'&&!r[0].startsWith('emulator-'))){serial=row[0];let devpath='';try{devpath=adb(['get-devpath']);}catch{}if(row[0]===soleUsb||row.some(x=>x.startsWith('usb:'))||devpath.startsWith('usb:'))usb.push(row);}serial=null;
 report.prerequisites.devices={physicalUsbCandidates:usb.length,unauthorized:devices.filter(r=>r[1]==='unauthorized').length,offline:devices.filter(r=>r[1]==='offline').length};
 const selected=options.serial?usb.find(row=>row[0]===options.serial):usb.length===1?usb[0]:null;
 if(!selected){report.reason='Need exactly one authorized physical USB device, or select one with --serial; emulators/network devices are rejected';return false;}
 serial=selected[0];if(adb(['shell','getprop','ro.kernel.qemu'])==='1'){report.reason='Emulator rejected';return false;}
 report.prerequisites.physicalUsb=true;
 report.device={model:adb(['shell','getprop','ro.product.model']),androidRelease:adb(['shell','getprop','ro.build.version.release']),androidSdk:Number(adb(['shell','getprop','ro.build.version.sdk']))||null,chromeVersion:adb(['shell','dumpsys','package','com.android.chrome']).match(/versionName=([^\s]+)/)?.[1]??null,transport:'Authorized physical USB only; serial omitted'};
 report.prerequisites.chromeInstalled=Boolean(adb(['shell','pm','path','com.android.chrome']));
 report.prerequisites.chromeDebugSocket=adb(['shell','cat','/proc/net/unix']).includes('@chrome_devtools_remote');
 report.prerequisites.screenOffTimeoutMs=Number(adb(['shell','settings','get','system','screen_off_timeout']))||null;
 const stay=Number(adb(['shell','settings','get','global','stay_on_while_plugged_in']));
 const battery=adb(['shell','dumpsys','battery']);
 const plugged=(/AC powered: true/.test(battery)?1:0)|(/USB powered: true/.test(battery)?2:0)|(/Wireless powered: true/.test(battery)?4:0);
 report.prerequisites.chargingPolicyKnown=Number.isFinite(stay)&&/USB powered: (?:true|false)/.test(battery);
 report.prerequisites.chargingStayAwake=Number.isFinite(stay)&&Boolean(stay&plugged);
 report.prerequisites.initialPower=power();
 const p=report.prerequisites;
 const ok=p.nodeSupported&&report.buildBefore.valid&&p.playwrightAvailable&&p.chromeInstalled&&p.chromeDebugSocket&&p.initialPower.wakefulness==='Awake';
 report.status=ok?'prerequisites-ready':'blocked';report.reason=ok?'Prerequisites only; no match, FPS or wake timeout test has run':'Need current build, Node 20+, Playwright, unlocked awake device and already-open stable Chrome with USB debugging';return ok;
}
async function serve(){
 server=require('../../ui-redesign/serve.cjs').createServer();const source=server.listeners('request')[0];server.removeAllListeners('request');
 server.on('request',(req,res)=>{
  let url;try{url=new URL('http://'+req.headers.host+req.url);}catch{res.writeHead(400);res.end();return;}
  if(!['127.0.0.1','localhost'].includes(url.hostname)||Number(url.port)!==server.address().port){res.writeHead(403);res.end();return;}
  if(url.pathname==='/native-build.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');fs.createReadStream(path.join(root,'outputs/index.html')).pipe(res);return;}
  if(url.pathname.startsWith('/unity-match/'))req.url='/source'+req.url;
  source(req,res);
 });
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});
 const port=server.address().port,local='tcp:'+port;
 if(hasBinding(bindings(adb(['reverse','--list'])),local))throw Error('Chosen reverse port already bound; refusing to change it');
 adb(['reverse','--no-rebind',local,local]);reverse={local,remote:local};origin='http://localhost:'+port;
 const cdpPort=await freePort(),host='tcp:'+cdpPort,remote='localabstract:chrome_devtools_remote';
 if(hasBinding(bindings(adb(['forward','--list'],false)),host))throw Error('Chosen CDP port already bound; refusing to change it');
 adb(['forward','--no-rebind',host,remote]);forward={local:host,remote};return 'http://127.0.0.1:'+cdpPort;
}
async function snapshot(){return page.evaluate(()=>{
 const p=window.D6UnityMatch?.projection,u=window.D6UnityMatch;
 return {hostTime:performance.now(),elapsed:match?.elapsed??null,phase:v65Context()?.state.phase??null,halftimePause:match?.halftimePause??0,finished:Boolean(match?.finished),visible:document.visibilityState,unityActive:Boolean(u?.active),clockHeld:Boolean(u?.clockHeld),unityError:u?.lastError??null,sequence:p?.sequence??null,renderFrame:Number.isFinite(p?.renderFrame)?p.renderFrame:null,renderTime:Number.isFinite(p?.renderTime)?p.renderTime:null,wakeHeld:typeof matchWakeLock!=='undefined'&&Boolean(matchWakeLock&&!matchWakeLock.released),nativeFullscreen:Boolean(document.fullscreenElement),viewportFullscreen:document.body.classList.contains('v132-fullscreen')};
 });}
async function run(){
 const endpoint=await serve(),{chromium}=require(path.join(runtime,'node_modules/playwright'));
 browser=await chromium.connectOverCDP(endpoint,{timeout:20000});
 // Never enumerate/read/close existing pages. Existing default context stays open.
 const context=browser.contexts()[0];if(!context)throw Error('Android Chrome has no default CDP context');
 page=await context.newPage();
 await page.addInitScript(()=>{window.addEventListener('message',e=>{if(window!==top&&e.source===parent&&e.origin===location.origin&&e.data?.channel==='d6-world-view-1'&&e.data.kind==='load')window.__androidQAConfig={quality:e.data.config?.quality,fieldPlayers:e.data.config?.geometry?.fieldPlayers};});});
 const navigatedAt=Date.now();await page.goto(origin+'/native-build.html?engine=unity',{waitUntil:'domcontentloaded',timeout:90000});await page.bringToFront();report.load={navigationToDomMs:Date.now()-navigatedAt,profile:'Existing Chrome profile/process; fresh QA origin; no cache/profile reset; no cold-start claim'};
 await page.evaluate(fs.readFileSync(path.join(__dirname,'unity-integration-v160.js'),'utf8'));
 await page.evaluate(()=>QAJ('android',D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true,replays:false})));
 const setupAt=Date.now();for(let i=0;i<45;i++){if(interrupted)throw Error('Interrupted');if(await page.evaluate(()=>QAR.done))break;await wait(4000);}report.load.harnessSetupToAckMs=Date.now()-setupAt;report.load.setupTimingNote='Includes QA career/market creation and Unity readiness; not isolated asset download or cold start';
 const setup=await page.evaluate(()=>({done:QAR.done,error:QAR.error,people:QAR.v?.people,unityReady:QAR.v?.unityReady,ack:QAR.v?.ack}));
 report.setup=setup;if(!setup.done||setup.error||!setup.unityReady||setup.people!==14||setup.ack?.players!==14||!setup.ack.allReal)throw Error('Current Unity build did not acknowledge fourteen actual players');
 report.presentation=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},coarse:matchMedia('(pointer:coarse)').matches,loadConfiguration:document.querySelector('#d6-unity-host iframe')?.contentWindow.__androidQAConfig??null,projection:{width:D6UnityMatch.projection?.width??null,height:D6UnityMatch.projection?.height??null}}));
 if(report.presentation.loadConfiguration?.quality!=='reduced'||report.presentation.loadConfiguration?.fieldPlayers!==6)throw Error('Actual acknowledged load configuration is not reduced quality with six field players');
 // setup deliberately clears its interval. Resume through the real native entry point.
 await page.evaluate(()=>{v65Pause();v65Resume();hideOverlay();v132RevealControls();window.__androidQA={raf:[],last:null,trustedTap:null};const b=document.querySelector('#v99-expand');b.addEventListener('click',e=>{__androidQA.trustedTap={isTrusted:e.isTrusted,active:navigator.userActivation?.isActive??null};},{once:true,capture:true});function raf(t){if(__androidQA.last!==null&&__androidQA.raf.length<24000)__androidQA.raf.push(t-__androidQA.last);__androidQA.last=t;__androidQA.request=requestAnimationFrame(raf);}__androidQA.request=requestAnimationFrame(raf);});
 await page.locator('#v99-expand').scrollIntoViewIfNeeded();const box=await page.locator('#v99-expand').boundingBox();if(!box)throw Error('Fullscreen button unavailable; manual real-screen tap required');
 cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await wait(1500);report.fullscreenTap=await page.evaluate(()=>__androidQA.trustedTap);const initial=await snapshot();
 if(!report.fullscreenTap?.isTrusted||!initial.nativeFullscreen&&!initial.viewportFullscreen)throw Error('Trusted fullscreen tap failed; repeat as a documented manual step');
 const timeout=report.prerequisites.screenOffTimeoutMs,eligible=timeout>0&&timeout+15000<=180000&&report.prerequisites.chargingPolicyKnown&&!report.prerequisites.chargingStayAwake;
 const duration=eligible?Math.max(options.seconds*1000,timeout+15000):options.seconds*1000;
 report.measurement={requestedSeconds:options.seconds,actualSeconds:duration/1000,nativeTimer:true,acceleratedRun:false};
 report.wake={status:'not-measured',reason:eligible?null:'Timeout exceeds 165 seconds, a required OS policy is unknown, or charging stay-awake defeats screen-timeout evidence; settings unchanged'};
 const started=Date.now();report.samples.push({...initial,power:power()});
 while(Date.now()-started<duration){if(interrupted)throw Error('Interrupted');await wait(Math.min(2000,duration-(Date.now()-started)));if(interrupted)throw Error('Interrupted');report.samples.push({...await snapshot(),power:power()});}
 const first=report.samples[0],last=report.samples.at(-1),observedMs=last.hostTime-first.hostTime;
 report.native={elapsedDelta:last.elapsed-first.elapsed,visibleThroughout:report.samples.every(s=>s.visible==='visible'),activeThroughout:report.samples.every(s=>s.unityActive&&!s.unityError&&!s.clockHeld),phases:[...new Set(report.samples.map(s=>s.phase))]};
 const frames=report.samples.filter(s=>s.renderFrame!==null&&s.renderTime!==null);
 const monotonic=frames.length===report.samples.length&&frames.every((s,i)=>i===0||s.renderFrame>=frames[i-1].renderFrame&&s.renderTime>=frames[i-1].renderTime);
 const from=frames[0],to=frames.at(-1);
 report.unityLoop=monotonic&&to.renderTime>from.renderTime&&to.renderFrame>from.renderFrame?{status:'measured',averageFramesPerSecond:(to.renderFrame-from.renderFrame)/(to.renderTime-from.renderTime),frameDelta:to.renderFrame-from.renderFrame,seconds:to.renderTime-from.renderTime,note:'Unity frame counter / Unity realtime across all observed phases, including pauses; not a gameplay benchmark, delivered GPU FPS or per-frame p95'}:{status:'not-measured',reason:'Actual monotonic renderFrame/renderTime telemetry unavailable'};
 const live=s=>s.phase==='live'&&!s.halftimePause&&!s.finished&&s.visible==='visible'&&s.unityActive&&!s.clockHeld;
 let liveFrames=0,liveSeconds=0,liveIntervals=0;
 if(monotonic)for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i];if(live(a)&&live(b)&&b.elapsed>a.elapsed&&b.renderTime>a.renderTime){liveFrames+=b.renderFrame-a.renderFrame;liveSeconds+=b.renderTime-a.renderTime;liveIntervals++;}}
 report.liveIntervalUnityLoop=liveSeconds>0&&liveFrames>0?{status:'measured',averageFramesPerSecond:liveFrames/liveSeconds,seconds:liveSeconds,intervals:liveIntervals,note:'Only polling intervals with live, advancing native time and visible active Unity at both ends; intermediate transitions are not observed; not GPU presentation FPS'}:{status:'not-measured',reason:'No qualifying live intervals with actual Unity telemetry'};
 const raf=await page.evaluate(()=>{cancelAnimationFrame(__androidQA.request);return __androidQA.raf;});report.hostRafIntervalMs=summary(raf);report.hostRafIntervalMsNote='Host document rAF intervals; never Unity FPS';
 let changes=0;for(let i=1;i<report.samples.length;i++)if(report.samples[i].sequence!==report.samples[i-1].sequence)changes++;
 report.projectionObservations={changedPolls:changes,pollCount:report.samples.length,note:'Latest projection sampled approximately every 2 seconds; not projection rate or Unity FPS'};
 const interruption=s=>s.finished||s.phase==='finished'?'Native full-time ended the wake experiment':s.halftimePause>0?'Native half-time paused the wake experiment':s.visible!=='visible'?'QA page visibility changed':!['live','paused'].includes(s.phase)?'Native phase left the live/paused wake scope':!s.nativeFullscreen&&!s.viewportFullscreen?'Fullscreen wake scope ended':null;
 const interruptedSample=report.samples.find(s=>interruption(s));
 if(interruptedSample){report.wake={status:'not-measured',interrupted:true,reason:interruption(interruptedSample),interruptedAtMs:interruptedSample.hostTime-first.hostTime,screenOffTimeoutMs:timeout,observedMs,note:'Native half/full-time, visibility and fullscreen transitions are not overridden; no feature failure or wake pass is inferred from an interrupted experiment'};}
 else if(eligible&&report.samples.some(s=>!s.power.wakefulness||!s.power.displayState)){report.wake={status:'not-measured',reason:'Android power state could not be decoded throughout the experiment',screenOffTimeoutMs:timeout,observedMs};}
 else if(eligible){const awake=report.samples.every(s=>s.power.wakefulness==='Awake'&&s.power.displayState==='ON'),lock=report.samples.every(s=>s.wakeHeld);report.wake={status:observedMs>timeout&&awake&&lock?'passed':'failed',screenOffTimeoutMs:timeout,observedMs,continuousEligibleScope:true,awakeThroughout:awake,wakeLockHeldThroughout:lock,note:'Observed scope stayed visible and fullscreen in live/paused play, excluding native half/full-time. No touches after fullscreen entry; dumpsys power read only; global charging stay-awake excluded. Other OS wake policies can still affect attribution.'};}
 report.automatedChecksPassed=report.native.elapsedDelta>0&&report.native.activeThroughout&&report.native.visibleThroughout&&report.wake.status==='passed';
 report.status='measured-manual-acceptance-outstanding';report.reason='Raw physical-device observations; manual app-switch/readability and product performance acceptance remain outstanding';
}
async function cleanup(){
 const failures=[];
 if(page)try{await page.close();}catch{failures.push('own-page-close');}
 if(browser)try{await browser.close();}catch{failures.push('CDP-disconnect');}
 // Remove only bindings still pointing at our original destination; never --remove-all.
 for(const [kind,binding] of [['forward',forward],['reverse',reverse]])if(binding)try{const rows=bindings(adb([kind,'--list'],kind==='reverse'));if(hasBinding(rows,binding.local,binding.remote,kind==='forward'?serial:null))adb([kind,'--remove',binding.local]);else failures.push(kind+'-binding-changed-preserved');}catch{failures.push(kind+'-cleanup');}
 if(server)await new Promise(r=>server.close(r));report.cleanup={failures};
}
let interrupted=false;process.on('SIGINT',()=>{interrupted=true;});
(async()=>{try{if(await prerequisites()&&options.mode==='run'){if(interrupted)throw Error('Interrupted');await run();}}catch(e){report.status='blocked-or-failed';report.reason=String(e.message).replaceAll(serial||'\0','<device>');}finally{await cleanup();try{report.buildAfter=await buildSnapshot();report.buildUnchanged=JSON.stringify(report.buildBefore)===JSON.stringify(report.buildAfter);if(!report.buildUnchanged||!report.buildAfter.valid){report.status='blocked-or-failed';report.reason='Build changed or manifest verification failed; observations are not a frozen build acceptance';report.automatedChecksPassed=false;}}catch{report.status='blocked-or-failed';report.reason='Final build snapshot unavailable';}report.finished=new Date().toISOString();fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,pass:false,hardwarePass:false,reason:report.reason,report:path.relative(root,path.join(out,'report.json'))}));process.exitCode=report.status==='prerequisites-ready'||report.status==='measured-manual-acceptance-outstanding'?0:2;}})();
