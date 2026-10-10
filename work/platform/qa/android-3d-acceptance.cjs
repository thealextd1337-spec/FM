'use strict';
// QA only: an existing USB Android Chrome, one new page, one private loopback origin.
const fs=require('node:fs'),path=require('node:path'),net=require('node:net');
const {spawnSync}=require('node:child_process');
const {createHash,randomBytes}=require('node:crypto');
const root=path.resolve(__dirname,'../../..');
function parseOptions(argv){const options={mode:null,adb:'adb',serial:null,expansion:false,seconds:90,'manual-seconds':0};
for(let i=0;i<argv.length;i++){
 const a=argv[i];if(a==='--probe'||a==='--run'){if(options.mode)throw Error('Choose exactly one of --probe and --run');options.mode=a.slice(2);}
 else if(a==='--expansion')options.expansion=true;
 else if(a==='--manual-fullscreen')options.manualFullscreen=true;
 else if(a==='--wake-paused')options.wakePaused=true;
 else if(a==='--storage-large')options.storageLarge=true;
 else if(['--adb','--serial','--seconds','--manual-seconds'].includes(a)){if(!argv[i+1])throw Error('Missing value for '+a);options[a.slice(2)]=argv[++i];}
 else throw Error('Unknown argument: '+a);
}
if(!options.mode)throw Error('Usage: node android-3d-acceptance.cjs --probe|--run [--adb path] [--serial device] [--seconds 60..180] [--manual-seconds 0..180] [--expansion]');
options.seconds=Number(options.seconds);
if(!Number.isInteger(options.seconds)||options.seconds<60||options.seconds>180)throw Error('--seconds must be an integer from 60 to 180');
options['manual-seconds']=Number(options['manual-seconds']);if(!Number.isInteger(options['manual-seconds'])||options['manual-seconds']<0||options['manual-seconds']>180)throw Error('--manual-seconds must be an integer from 0 to 180');
return options;}
let options,out,report;
let serial=null,server=null,connection=null,page=null,cdp=null,reverse=null,forward=null,origin=null;
const wait=ms=>new Promise(r=>setTimeout(r,ms)).then(()=>{if(out&&fs.existsSync(path.join(out,'stop-requested')))interrupted=true;});
class CdpRpc {
 constructor(socket){this.socket=socket;this.pending=new Map();this.next=1;this.closed=false;
  socket.addEventListener('message',e=>{let m;try{m=JSON.parse(String(e.data));}catch{this.fail('Malformed CDP response');return;}const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);clearTimeout(p.timer);if(m.sessionId!==p.sessionId)p.reject(Error('CDP response session mismatch: '+p.method));else if(m.error)p.reject(Error('CDP '+p.method+': '+String(m.error.message||m.error.code)));else p.resolve(m.result);});
  socket.addEventListener('close',()=>this.fail('CDP connection closed'));socket.addEventListener('error',()=>this.fail('CDP connection error'));
 }
 static async connect(url){const socket=new WebSocket(url),rpc=new CdpRpc(socket);try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('CDP WebSocket connection timeout')),10000);const finish=fn=>{clearTimeout(timer);socket.removeEventListener('open',opened);socket.removeEventListener('error',errored);socket.removeEventListener('close',errored);fn();};const opened=()=>finish(resolve),errored=()=>finish(()=>reject(Error('CDP WebSocket connection unavailable')));socket.addEventListener('open',opened,{once:true});socket.addEventListener('error',errored,{once:true});socket.addEventListener('close',errored,{once:true});});return rpc;}catch(e){try{rpc.close();}catch{}throw e;}}
 send(method,params={},sessionId,timeout=10000){if(this.closed)return Promise.reject(Error('CDP connection closed'));const id=this.next++;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('CDP method timeout: '+method));},timeout);this.pending.set(id,{resolve,reject,timer,sessionId,method});try{this.socket.send(JSON.stringify({id,method,params,...sessionId?{sessionId}:{}}));}catch{clearTimeout(timer);this.pending.delete(id);reject(Error('CDP send failed: '+method));}});}
 fail(reason){this.closed=true;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error(reason));}this.pending.clear();}
 close(){this.fail('CDP connection disconnected');this.socket.close();}
}
class OwnedPage {
 constructor(rpc,qaOrigin){this.rpc=rpc;this.origin=qaOrigin;this.targetId=null;this.sessionId=null;this.creationUncertain=false;}
 async initAndroid(endpoint,launch,request=fetch,connect=url=>CdpRpc.connect(url)){
  const u=new URL(endpoint);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||!u.port||u.pathname!=='/'||u.username||u.password||u.search||u.hash)throw Error('Android tab endpoint outside own loopback forward');
  this.httpEndpoint=u.origin;this.httpRequest=request;
  this.launchUrl=this.origin+'/native-build.html?engine=unity&qaRun='+randomBytes(12).toString('hex');
  if(!/^http:\/\/localhost:\d+\/native-build\.html\?engine=unity&qaRun=[a-f0-9]{24}$/.test(this.launchUrl))throw Error('Unsafe QA launch URL');
  this.creationUncertain=true;await launch(this.launchUrl);
  // Metadata is filtered immediately; no foreign page/session is inspected or retained.
  const until=Date.now()+15000;while(Date.now()<until){
   const response=await request(this.httpEndpoint+'/json/list',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Android Chrome tab metadata unavailable');
   const list=await response.json();if(!Array.isArray(list))throw Error('Invalid Android tab metadata');
   const owned=list.filter(t=>t.type==='page'&&t.url===this.launchUrl);
   if(owned.length>1)throw Error('Ambiguous owned QA tab; refusing attachment');
   if(owned.length===1){if(typeof owned[0].id!=='string'||!/^[a-zA-Z0-9_-]+$/.test(owned[0].id))throw Error('Invalid owned Android tab id');this.targetId=owned[0].id;this.creationUncertain=false;this.nativeSocket=owned[0].webSocketDebuggerUrl;break;}
   await wait(250);if(interrupted)throw Error('Interrupted');
  }
  if(!this.targetId)throw Error('Visible QA tab did not appear; no existing tab attached');
  const ws=new URL(this.nativeSocket);if(ws.protocol!=='ws:'||ws.hostname!==u.hostname||ws.port!==u.port||ws.pathname!=='/devtools/page/'+this.targetId||ws.username||ws.password||ws.search||ws.hash)throw Error('Android tab socket outside own target');
  this.nativeConnection=await connect(ws.href);this.rpc=this.nativeConnection;this.direct=true;this.sessionId='owned-direct';await this.send('Page.enable');
 }
 async nativeTabCommand(command){if(!this.targetId||!this.httpEndpoint||!['activate','close'].includes(command))throw Error('Native tab command outside own tab scope');const response=await this.httpRequest(this.httpEndpoint+'/json/'+command+'/'+encodeURIComponent(this.targetId),{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Android Chrome own-tab '+command+' failed');}
 async init(){this.creationUncertain=true;const created=await this.rpc.send('Target.createTarget',{url:'about:blank',background:false});if(typeof created?.targetId!=='string'||!created.targetId)throw Error('Chrome did not return an owned QA target');this.targetId=created.targetId;this.creationUncertain=false;const attached=await this.rpc.send('Target.attachToTarget',{targetId:this.targetId,flatten:true});if(typeof attached?.sessionId!=='string'||!attached.sessionId)throw Error('Chrome did not attach the owned QA target');this.sessionId=attached.sessionId;await this.send('Page.enable');}
 send(method,params={},timeout){if(!this.sessionId||!['Runtime.evaluate','Page.enable','Page.navigate','Page.bringToFront','Page.addScriptToEvaluateOnNewDocument','Page.captureScreenshot','Input.dispatchTouchEvent'].includes(method))throw Error('Command outside the owned QA page scope');return this.rpc.send(method,params,this.direct?undefined:this.sessionId,timeout);}
 async evaluate(value,arg,timeout=10000){const expression=typeof value==='function'?'('+value.toString()+')('+(arg===undefined?'':JSON.stringify(arg))+')':String(value);const r=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},timeout);if(r?.exceptionDetails)throw Error('Owned QA evaluation failed: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text||'unknown exception'));if(r?.result?.type==='undefined')return undefined;if(!r?.result||!Object.hasOwn(r.result,'value'))throw Error('Owned QA evaluation did not return a JSON value');return r.result.value;}
 addInitScript(fn){return this.send('Page.addScriptToEvaluateOnNewDocument',{source:typeof fn==='function'?'('+fn.toString()+')();':String(fn)});}
 async goto(url,{timeout=90000}={}){const u=new URL(url);if(u.origin!==this.origin||u.pathname!=='/native-build.html')throw Error('Navigation outside the own QA origin refused');const result=await this.send('Page.navigate',{url});if(result?.errorText)throw Error('Own QA navigation failed: '+result.errorText);const until=Date.now()+timeout;while(Date.now()<until){if(interrupted)throw Error('Interrupted');try{const ready=await this.evaluate(()=>({url:location.href,ready:document.readyState!=='loading'&&typeof window.D6UnityMatch==='object'}));if(ready.url===u.href&&ready.ready)return;}catch(e){if(!/Execution context was destroyed|Cannot find context/.test(e.message))throw e;}await wait(250);}throw Error('Own QA DOM navigation timeout');}
 async bringToFront(){if(!this.targetId)throw Error('Owned target unavailable');if(this.httpEndpoint)await this.nativeTabCommand('activate');else await this.rpc.send('Target.activateTarget',{targetId:this.targetId});return this.send('Page.bringToFront');}
 locator(selector){if(selector!=='#v99-expand')throw Error('Only the own QA fullscreen control is supported');return {scrollIntoViewIfNeeded:()=>this.evaluate(()=>document.querySelector('#v99-expand')?.scrollIntoView({block:'center',inline:'center'})),boundingBox:()=>this.evaluate(()=>{const e=document.querySelector('#v99-expand');if(!e)return null;const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&getComputedStyle(e).visibility!=='hidden'?{x:b.x,y:b.y,width:b.width,height:b.height}:null;})};}
 async close(){if(!this.targetId)return;if(this.httpEndpoint){try{await this.nativeTabCommand('close');this.targetId=null;this.sessionId=null;}finally{this.nativeConnection?.close();}return;}const id=this.targetId;const result=await this.rpc.send('Target.closeTarget',{targetId:id},undefined,5000);if(!result?.success)throw Error('Own QA target did not close');this.targetId=null;this.sessionId=null;}
}
function displayState(text){
 const blocks=text.split(/^[ \t]*Display Power Controller:[ \t]*$/m).slice(1),states=[];
 for(const block of blocks){if(block.match(/^[ \t]*mDisplayId=[ \t]*(\d+)[ \t]*$/m)?.[1]!=='0')continue;const thread=block.split(/^[ \t]*Display Power Controller Thread State:[ \t]*$/m)[1];if(!thread||thread.match(/^[ \t]*mDisplayId=[ \t]*(\d+)[ \t]*$/m)?.[1]!=='0')continue;const current=thread.split(/^[ \t]*Display Power State:[ \t]*$/m)[1];if(!current)continue;const lines=current.replace(/^\r?\n/,'').split(/\r?\n/),part=[];for(const line of lines){if(line&& !/^[ \t]/.test(line))break;part.push(line);}const found=[...part.join('\n').matchAll(/^[ \t]*mScreenState=(ON|OFF|DOZE|DOZE_SUSPEND|ON_SUSPEND|UNKNOWN)[ \t]*$/gm)];if(found.length===1)states.push(found[0][1]);}
 return states.length===1?states[0]:null;
}
function adb(args,device=true){
 const r=spawnSync(options.adb,[...(device?['-s',serial]:[]),...args],{encoding:'utf8',timeout:12000,windowsHide:true});
 if(r.error||r.status!==0)throw Error('ADB command unavailable/failed: '+args.slice(0,2).join(' '));return r.stdout.trim();
}
function power(){
 const text=adb(['shell','dumpsys','power']);
 const legacy=text.match(/^[ \t]*Display Power: state=(ON|OFF|DOZE|DOZE_SUSPEND|ON_SUSPEND|UNKNOWN)\b/m)?.[1];
 return {wakefulness:text.match(/^[ \t]*mWakefulness=(\w+)/m)?.[1]??null,displayState:legacy??displayState(adb(['shell','dumpsys','display'])),displayStateSource:legacy?'dumpsys-power':'dumpsys-display/DisplayPowerController[0]'};
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
 report.prerequisites.nodeSupported=report.prerequisites.nodeMajor>=22&&typeof WebSocket==='function';
 report.prerequisites.buildAvailable=fs.existsSync(path.join(root,'outputs/index.html'));
 report.prerequisites.nativeWebSocketAvailable=typeof WebSocket==='function';
 report.prerequisites.adbSelection=options.adb==='adb'?'PATH':'explicit path';
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
 const ok=p.nodeSupported&&report.buildBefore.valid&&p.chromeInstalled&&p.chromeDebugSocket&&p.initialPower.wakefulness==='Awake';
 report.status=ok?'prerequisites-ready':'blocked';report.reason=ok?'Prerequisites only; no match, FPS or wake timeout test has run':'Need current build, Node 22+ with WebSocket, unlocked awake device and already-open stable Chrome with USB debugging';return ok;
}
async function serve(){
 server=require('../../ui-redesign/serve.cjs').createServer();const source=server.listeners('request')[0];server.removeAllListeners('request');
 server.on('request',(req,res)=>{
  let url;try{url=new URL('http://'+req.headers.host+req.url);}catch{res.writeHead(400);res.end();return;}
  if(!['127.0.0.1','localhost'].includes(url.hostname)||Number(url.port)!==server.address().port){res.writeHead(403);res.end();return;}
  if(options.storageLarge&&url.pathname==='/ap11-native-career.json'){res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');fs.createReadStream(path.join(root,'outputs/ligaexpansion-ap11/ap11-native-closed-career.json')).pipe(res);return;}
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
async function captureOwnScreenshot(name){
 const record={name,status:'not-captured',at:new Date().toISOString()};(report.screenshots??=[]).push(record);
 try{const state=await snapshot();if(state.visible!=='visible'){record.reason='Own QA page is not visible; no screenshot taken';return;}
  record.layout=await page.evaluate(()=>{const rect=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom};};const area=document.querySelector('#match-area'),frame=document.querySelector('#d6-unity-host iframe'),canvas=frame?.contentDocument?.querySelector('canvas'),projection=D6UnityMatch.projection;return {nativeFullscreen:Boolean(document.fullscreenElement),fullscreenElement:document.fullscreenElement?.id??null,viewportFullscreen:document.body.classList.contains('v132-fullscreen'),viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},visualViewport:visualViewport?{width:visualViewport.width,height:visualViewport.height,offsetTop:visualViewport.offsetTop,offsetLeft:visualViewport.offsetLeft}:null,body:rect(document.body),matchArea:rect(area),pitchStage:rect(document.querySelector('#match-area .v42-pitch-stage')),unityHost:rect(document.querySelector('#d6-unity-host')),iframe:rect(frame),canvas:canvas?{css:rect(canvas),renderWidth:canvas.width,renderHeight:canvas.height}:null,projection:projection?{width:projection.width,height:projection.height,sequence:projection.sequence}:null,backgrounds:{body:getComputedStyle(document.body).backgroundColor,matchArea:area?getComputedStyle(area).backgroundColor:null,iframe:frame?getComputedStyle(frame).backgroundColor:null}};});
  const result=await page.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});if(typeof result?.data!=='string'||!result.data.startsWith('iVBORw0KGgo'))throw Error('Own QA screenshot did not return PNG data');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(result.data,'base64'));record.status='captured';record.file=name+'.png';record.note='Only owned QA page pixels; Chrome/Android system bars are outside this capture';
 }catch(e){record.reason=String(e.message);}
}
async function manualWindow(){
 const seconds=options['manual-seconds'];if(!seconds)return;
 const observation=report.manualObservations={status:'observing',seconds,pass:false,samples:[],note:'User switches apps manually; only the owned QA page is polled. No automated Home/app switch, forced resume/fullscreen or inferred acceptance.'};
 try{observation.baseline=await snapshot();console.log(JSON.stringify({phase:'manual-ready',seconds,instructions:'Die eigene QA-Seite bleibt offen. Jetzt manuell die App wechseln und zu dieser QA-Seite zurÃ¼ckkehren; danach Vollbild/Wachhalten prÃ¼fen.'}));const start=Date.now();while(Date.now()-start<seconds*1000){if(interrupted)throw Error('Interrupted');await wait(Math.min(2000,seconds*1000-(Date.now()-start)));if(interrupted)throw Error('Interrupted');observation.samples.push(await snapshot());}observation.end=await snapshot();observation.status='observed-awaiting-user-feedback';if(observation.end.visible==='visible')await captureOwnScreenshot('manual-return');else observation.screenshotSkipped='Own QA page was not visible at manual-window end';}catch(e){observation.status='interrupted-or-not-measured';observation.reason=String(e.message);}
}
async function run(){
 const endpoint=await serve(),response=await fetch(endpoint+'/json/version',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Chrome browser CDP endpoint unavailable');const version=await response.json(),socketUrl=new URL(version.webSocketDebuggerUrl);const expected=new URL(endpoint);
 if(socketUrl.protocol!=='ws:'||!['127.0.0.1','localhost'].includes(socketUrl.hostname)||socketUrl.port!==expected.port||socketUrl.pathname!=='/devtools/browser')throw Error('Chrome returned a CDP endpoint outside the own forward');
 connection=await CdpRpc.connect(socketUrl.href);page=new OwnedPage(connection,origin);await page.initAndroid(endpoint,url=>{const result=adb(['shell','am','start','-W','-a','android.intent.action.VIEW','-p','com.android.chrome','--ez','create_new_tab','true','-d',"'"+url+"'"]);if(/Error:|Exception|Error type/.test(result))throw Error('Android Chrome QA URL launch failed');});report.cdp={transport:'Node native WebSocket',scope:'Only newly launched nonce URL; tab metadata filtered to exact QA URL and discarded; no foreign content/session inspection'};report.ownedResources={targetId:page.targetId,forward,reverse,origin};fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'in-progress.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({phase:'own-target-created',stopRequestFile:path.relative(root,path.join(out,'stop-requested'))}));
 await page.addInitScript(()=>{window.addEventListener('message',e=>{if(window!==top&&e.source===parent&&e.origin===location.origin&&e.data?.channel==='d6-world-view-1'&&e.data.kind==='load')window.__androidQAConfig={quality:e.data.config?.quality,fieldPlayers:e.data.config?.geometry?.fieldPlayers};});});
 const navigatedAt=Date.now();await page.goto(page.launchUrl,{waitUntil:'domcontentloaded',timeout:90000});await page.bringToFront();report.load={navigationToDomMs:Date.now()-navigatedAt,profile:'Existing Chrome profile/process; fresh QA origin; no cache/profile reset; no cold-start claim'};
 // QA preparation only. This independent sentinel MUST be released before wake measurement.
 report.setupWake=await page.evaluate(async()=>{try{window.__androidSetupWake=await navigator.wakeLock.request('screen');return {held:!__androidSetupWake.released,scope:'QA preparation only; excluded from product wake evidence'};}catch(e){return {held:false,error:String(e.message)};}});
 if(!report.setupWake.held)throw Error('QA preparation wake lock unavailable; no long setup or wake measurement started');
 await page.evaluate(fs.readFileSync(path.join(__dirname,'unity-integration-v160.js'),'utf8'));
 await page.evaluate(expansion=>QAJ('android',D6QA160.setup({config:{fieldSize:'large',fieldPlayers:6},unity:true,replays:false,expansion})),options.expansion);
 const setupAt=Date.now();for(let i=0;i<45;i++){if(interrupted)throw Error('Interrupted');if(await page.evaluate(()=>QAR.done))break;const prepared=await page.evaluate(()=>({hasMatch:typeof match==='object'&&match?.people?.length===14&&v65Context()?.state.phase==='paused',fullscreen:!!document.fullscreenElement||document.body.classList.contains('v132-fullscreen')}));if(prepared.hasMatch&&!prepared.fullscreen){await page.evaluate(()=>{v132RevealControls();document.querySelector('#v99-expand')?.addEventListener('click',e=>window.__androidSetupTap={isTrusted:e.isTrusted,active:navigator.userActivation?.isActive??null},{once:true,capture:true})});await page.locator('#v99-expand').scrollIntoViewIfNeeded();const b=await page.locator('#v99-expand').boundingBox();if(b&&options.manualFullscreen){if(!report.manualFullscreenRequested){report.manualFullscreenRequested=true;console.log(JSON.stringify({phase:'manual-fullscreen-ready',instructions:'Rotate Chrome to landscape and tap the fullscreen button on the owned QA page now.'}));}}else if(b){await page.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});await page.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});report.setupFullscreenTap=true;}}await wait(4000);}report.load.harnessSetupToAckMs=Date.now()-setupAt;report.load.setupTimingNote='Includes QA career/market creation and Unity readiness; not isolated asset download or cold start';
 const setup=await page.evaluate(()=>({done:QAR.done,error:QAR.error,people:QAR.v?.people,unityReady:QAR.v?.unityReady,ack:QAR.v?.ack}));
 report.setup=setup;report.world=await page.evaluate(()=>({clubs:D6QA160.career.world.clubs.length,presentationVersion:D6QA160.career.world.presentationVersion,expansion:D6QA160.career.world.rules?.variant==='expansion12'}));report.unityDiagnostics=await page.evaluate(()=>{const frame=document.querySelector('#d6-unity-host iframe');return {ready:D6UnityMatch.ready,error:D6UnityMatch.lastError,active:D6UnityMatch.active,iframe:frame?.getAttribute('src'),frameReady:frame?.contentDocument?.readyState,canvas:!!frame?.contentDocument?.querySelector('canvas'),status:document.querySelector('#d6-unity-message')?.textContent,visibility:document.visibilityState,landscape:v98Orientation.matches,view:v98View,viewport:{width:innerWidth,height:innerHeight},resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('/unity')).map(r=>({path:new URL(r.name).pathname,duration:r.duration,bytes:r.transferSize}))}});if(!setup.done||setup.error||!setup.unityReady||setup.people!==14||setup.ack?.players!==14||!setup.ack.allReal)throw Error('Current Unity build did not acknowledge fourteen actual players');
 report.presentation=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},coarse:matchMedia('(pointer:coarse)').matches,loadConfiguration:document.querySelector('#d6-unity-host iframe')?.contentWindow.__androidQAConfig??null,projection:{width:D6UnityMatch.projection?.width??null,height:D6UnityMatch.projection?.height??null}}));
 if(report.presentation.loadConfiguration?.quality!=='reduced'||report.presentation.loadConfiguration?.fieldPlayers!==6)throw Error('Actual acknowledged load configuration is not reduced quality with six field players');
 // setup deliberately clears its interval. Resume through the real native entry point.
 await page.evaluate(()=>{v65Pause();v65Resume();hideOverlay();v132RevealControls();window.__androidQA={raf:[],last:null,trustedTap:window.__androidSetupTap??null};const b=document.querySelector('#v99-expand');b.addEventListener('click',e=>{__androidQA.trustedTap={isTrusted:e.isTrusted,active:navigator.userActivation?.isActive??null};},{once:true,capture:true});function raf(t){if(__androidQA.last!==null&&__androidQA.raf.length<24000)__androidQA.raf.push(t-__androidQA.last);__androidQA.last=t;__androidQA.request=requestAnimationFrame(raf);}__androidQA.request=requestAnimationFrame(raf);});
 await page.locator('#v99-expand').scrollIntoViewIfNeeded();const box=await page.locator('#v99-expand').boundingBox();if(!box)throw Error('Fullscreen button unavailable; manual real-screen tap required');
 cdp={send:(method,params)=>page.send(method,params)};
 if(options.manualFullscreen&&!await page.evaluate(()=>!!document.fullscreenElement||document.body.classList.contains('v132-fullscreen')))throw Error('Manual fullscreen no longer active; no automated input performed');
 if(!options.manualFullscreen&&!await page.evaluate(()=>!!document.fullscreenElement||document.body.classList.contains('v132-fullscreen'))){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 await wait(1500);report.fullscreenTap=await page.evaluate(()=>__androidQA.trustedTap);
 if(options.wakePaused){const paused=await page.evaluate(()=>({paused:v65Pause(),halftime:match.halftimePause,finished:match.finished}));if(!paused.paused||paused.halftime||paused.finished)throw Error('Ordinary paused fullscreen wake scope unavailable');await wait(500);}
 const initial=await snapshot();
 if(!report.fullscreenTap?.isTrusted||!initial.nativeFullscreen&&!initial.viewportFullscreen)throw Error('Trusted fullscreen tap failed; repeat as a documented manual step');
 report.setupWake.release=await page.evaluate(async()=>{const lock=window.__androidSetupWake;if(!lock)return {released:false};await lock.release();return {released:lock.released,productWakeHeld:typeof matchWakeLock!=='undefined'&&Boolean(matchWakeLock&&!matchWakeLock.released)};});
 if(!report.setupWake.release.released)throw Error('QA preparation wake lock was not released; product wake evidence refused');
 const timeout=report.prerequisites.screenOffTimeoutMs,eligible=timeout>0&&timeout+15000<=180000&&report.prerequisites.chargingPolicyKnown&&!report.prerequisites.chargingStayAwake;
 const duration=eligible?Math.max(options.seconds*1000,timeout+15000):options.seconds*1000;
 report.measurement={requestedSeconds:options.seconds,actualSeconds:duration/1000,nativeTimer:!options.wakePaused,scope:options.wakePaused?'ordinary-paused-fullscreen':'natural-live-match',acceleratedRun:false};
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
 report.automatedChecksPassed=(options.wakePaused?report.samples.every(s=>s.phase==='paused'&&s.elapsed===first.elapsed):report.native.elapsedDelta>0)&&report.native.activeThroughout&&report.native.visibleThroughout&&report.wake.status==='passed';
 report.status='measured-manual-acceptance-outstanding';report.reason='Raw physical-device observations; manual app-switch/readability and product performance acceptance remain outstanding';
 await captureOwnScreenshot('automatic-fullscreen');await manualWindow();if(options.storageLarge)await storageLarge();
}
async function storageLarge(){
 const file=path.join(root,'outputs/ligaexpansion-ap11/ap11-native-closed-career.json');
 const c=JSON.parse(fs.readFileSync(file,'utf8')),expected=createHash('sha256').update(JSON.stringify(c.world)).digest('hex');
 report.storage={status:'running',bytes:fs.statSync(file).size,season:c.world.season,expectedWorldHash:expected};
 console.log(JSON.stringify({phase:'storage-start',bytes:report.storage.bytes,instructions:'Keep the QA page open; large career import/save/reload in isolated origin.'}));
 const guard=await page.evaluate(async()=>{window.__androidStorageWake=await navigator.wakeLock.request('screen');return !__androidStorageWake.released;});if(!guard)throw Error('Storage preparation wake guard unavailable');
 report.storage.imported=await page.evaluate(async()=>{const career=await(await fetch('/ap11-native-career.json')).json();await v61WaitForStorage();const t=performance.now(),before=await navigator.storage.estimate(),saved=await v61ImportCareerData(career),exported=await v61ExportCareerData(saved.id);await v61SaveCareers(v61ReadCareers());await v61WaitForStorage();const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(exported.save.world))))].map(x=>x.toString(16).padStart(2,'0')).join('');return {id:saved.id,worldHash:hash,milliseconds:performance.now()-t,indexedDb:!!v61StorageDb,before,after:await navigator.storage.estimate()};},undefined,180000);
 if(!report.storage.imported.indexedDb||report.storage.imported.worldHash!==expected)throw Error('Android native import/storage digest mismatch');
 await page.goto(page.launchUrl,{timeout:90000});
 report.storage.restored=await page.evaluate(async id=>{await v61WaitForStorage();const c=v61ReadCareers().find(c=>c.id===id);return {valid:v61ValidateCareer(c),worldHash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(c.world))))].map(x=>x.toString(16).padStart(2,'0')).join(''),count:v61ReadCareers().length};},report.storage.imported.id,180000);
 if(!report.storage.restored.valid||report.storage.restored.worldHash!==expected)throw Error('Android native reload validation/digest mismatch');
 report.storage.status='passed';report.storage.note='One large career plus backup in fresh isolated origin; not five simultaneous careers or a peak RAM measurement';
}
async function cleanup(){
 const failures=[];
 if(page?.creationUncertain)failures.push('own-target-creation-unverifiable-manual-close-may-be-needed');
 if(page)try{await page.close();}catch{failures.push('own-page-close');}
 if(connection)try{connection.close();}catch{failures.push('CDP-disconnect');}
 // Remove only bindings still pointing at our original destination; never --remove-all.
 for(const [kind,binding] of [['forward',forward],['reverse',reverse]])if(binding)try{const rows=bindings(adb([kind,'--list'],kind==='reverse'));if(hasBinding(rows,binding.local,binding.remote,kind==='forward'?serial:null))adb([kind,'--remove',binding.local]);else failures.push(kind+'-binding-changed-preserved');}catch{failures.push(kind+'-cleanup');}
 if(server)await new Promise(r=>server.close(r));report.cleanup={failures,ownTargetCreationVerified:!page?.creationUncertain};
}
let interrupted=false;
async function main(){options=parseOptions(process.argv.slice(2));out=path.join(root,'outputs/3d-quality/android-device-prerequisites',options.mode+'-'+new Date().toISOString().replace(/[:.]/g,'-'));report={schema:1,mode:options.mode,status:'blocked',pass:false,hardwarePass:false,started:new Date().toISOString(),prerequisites:{},samples:[],manual:['Real app switch and return; wake-lock reacquisition and unchanged native match state','Visual readability of names, team rings and ball in landscape; interaction and keeper animations'],limitations:['No GPU presentation or per-frame GPU timing measurement','No performance acceptance threshold or full device acceptance is inferred from loop counters']};process.on('SIGINT',()=>{interrupted=true;});try{if(await prerequisites()&&options.mode==='run'){if(interrupted)throw Error('Interrupted');await run();}}catch(e){report.status='blocked-or-failed';report.reason=String(e.message).replaceAll(serial||'\0','<device>');
 // Preserve failure evidence before closing the owned target. Never retry input or infer a pass.
 report.failureDiagnostics={};
 try{report.failureDiagnostics.power=power();}catch(e){report.failureDiagnostics.powerError=String(e.message);}
 if(page?.sessionId){try{report.failureDiagnostics.page=await page.evaluate(()=>({visibility:document.visibilityState,landscape:typeof v98Orientation!=='undefined'?v98Orientation.matches:null,viewport:{width:innerWidth,height:innerHeight},fullscreen:!!document.fullscreenElement,viewportFullscreen:document.body.classList.contains('v132-fullscreen'),setupTap:window.__androidSetupTap??null,unity:typeof D6UnityMatch!=='undefined'?{ready:D6UnityMatch.ready,active:D6UnityMatch.active,error:D6UnityMatch.lastError,iframe:!!document.querySelector('#d6-unity-host iframe')}:null}));}catch(e){report.failureDiagnostics.pageError=String(e.message);}
 if(report.failureDiagnostics.page?.visibility==='visible')await captureOwnScreenshot('failure-owned-page');}
 }finally{await cleanup();try{report.buildAfter=await buildSnapshot();report.buildUnchanged=JSON.stringify(report.buildBefore)===JSON.stringify(report.buildAfter);if(!report.buildUnchanged||!report.buildAfter.valid){report.status='blocked-or-failed';report.reason='Build changed or manifest verification failed; observations are not a frozen build acceptance';report.automatedChecksPassed=false;}}catch{report.status='blocked-or-failed';report.reason='Final build snapshot unavailable';}report.finished=new Date().toISOString();fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,pass:false,hardwarePass:false,reason:report.reason,report:path.relative(root,path.join(out,'report.json'))}));process.exitCode=report.status==='prerequisites-ready'||report.status==='measured-manual-acceptance-outstanding'?0:2;}}
module.exports={CdpRpc,OwnedPage,displayState,parseOptions};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=2;});
