'use strict';
// Browser acceptance of a served style-demo package (real Unity WebGL in Chromium/Edge, native match rules).
// Only drives the page and its documented QA helper work/platform/qa/unity-integration-v160.js; no second match
// authority, no source or package writes. The package server is read-only here (/__build is compared before/after).
//   node work/style-demos/acceptance-browser.cjs --style nighttime --repo <checkout> --url http://127.0.0.1:4411 --out <dir>
//        [--only build,viewports,flow,goal,parity,reload,fallback,architectures] [--software] [--edge PATH] [--playwright DIR]
//        [--expectMesh NAME [--expectMeshVertices N]] [--expectGroundMesh NAME [--expectGroundVertices N]] [--archViewports 1280x720,844x390]   (architectures is opt-in: not part of the default section list)
// Output: <out>/acceptance.json (d6-style-demo-acceptance-1) and <out>/shots/*.png. Exit 2 if a check fails.
// Scope: functional lifecycle on one desktop GPU (or --software). Not an FPS, Android or visual-quality claim.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),crypto=require('node:crypto');
const lib=require('./lib.cjs');
lib.requireNode();
const args=lib.parseArgs(process.argv.slice(2),{style:'string',repo:'string',url:'string',out:'string',only:'string',software:'boolean',edge:'string',playwright:'string',seed:'string',expectMesh:'string',expectMeshVertices:'string',expectGroundMesh:'string',expectGroundVertices:'string',archViewports:'string'});
const style=lib.requireStyle(args),repo=lib.resolveRepo(args),base=(args.url||'http://127.0.0.1:'+lib.STYLES[style].port).replace(/\/$/,'');
if(!args.out)throw lib.fail('--out ist Pflicht (unter outputs/style-demos des Repos oder des Support-Checkouts)');
const out=path.resolve(args.out);
for(const root of [repo,lib.OWN_REPO]){const rel=path.relative(path.join(root,'outputs','style-demos'),out);if(rel&&!rel.startsWith('..')&&!path.isAbsolute(rel))break;if(root===lib.OWN_REPO)throw lib.fail('--out muss unter outputs/style-demos liegen: '+out);}
const only=args.only?args.only.split(','):['build','viewports','flow','goal','parity','reload','fallback'];
// Player mesh the Unity runtime must report on load (WorldViewBridge logs '[D6] match mesh <name> ...'); styles without an expectation only record it.
const expectMesh=args.expectMesh||({lowpoly:'WorldPlayerLowPoly-v4'})[style]||null;
// Optional: the load line must also name the separate ground mesh (hidden ground skin, e.g. WorldPlayer under the low-poly match mesh). Not required by default.
const expectGround=args.expectGroundMesh?{mesh:expectMesh,vertices:args.expectMeshVertices?Number(args.expectMeshVertices):null,groundMesh:args.expectGroundMesh,groundVertices:args.expectGroundVertices?Number(args.expectGroundVertices):null}:null;
if(args.expectGroundMesh&&!expectMesh)throw lib.fail('--expectGroundMesh braucht --expectMesh (oder einen Stil mit Mesherwartung)');
let scenario='-';
const {chromium}=require(args.playwright||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const edge=args.edge||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const launchArgs=args.software?['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11'];
const helper=fs.readFileSync(path.join(repo,'work/platform/qa/unity-integration-v160.js'),'utf8'),labelHelper=fs.readFileSync(path.join(repo,'work/platform/qa/unity-label-readability.js'),'utf8');
fs.mkdirSync(path.join(out,'shots'),{recursive:true});

const harnessState=lib.sourceState(lib.OWN_REPO,['work/style-demos']);
const report={schema:'d6-style-demo-acceptance-1',style,url:base,repo,startedAt:new Date().toISOString(),gpu:!args.software,harness:{file:'work/style-demos/acceptance-browser.cjs',sha256:lib.sha256File(__filename),commit:harnessState.commit,branch:harnessState.branch,dirty:harnessState.dirty,node:process.version},checks:[],sections:{},shots:[],network:{},pageErrors:[],consoleErrors:[],d6Console:[],expectMesh,expectGround,renderer:null,
 scope:'Functional lifecycle on the served package with real Unity WebGL; not an FPS, Android or visual-quality claim.'};
const check=(id,name,ok,detail)=>{report.checks.push({id,name,ok:Boolean(ok),...(detail===undefined?{}:{detail:typeof detail==='string'?detail:JSON.stringify(detail)})});console.log((ok?'PASS ':'FAIL ')+id+' '+name+(ok||detail===undefined?'':' · '+(typeof detail==='string'?detail:JSON.stringify(detail)).slice(0,300)));return Boolean(ok);};
const getJson=url=>new Promise((resolve,reject)=>http.get(url,res=>{let t='';res.on('data',c=>t+=c);res.on('end',()=>{try{resolve(JSON.parse(t));}catch(e){reject(e);}});}).on('error',reject));
const buildOf=state=>({sourceCommit:state.sourceCommit,sourceDirty:state.sourceDirty,sourceFingerprint:state.sourceFingerprint,sourceId:state.sourceId,htmlSha256:state.htmlSha256,unityManifestSha256:state.unityManifestSha256,packageManifestSha256:state.packageManifestSha256,freshness:state.freshness?.state,files:Object.fromEntries((state.files||[]).map(f=>[f.file,f.sha256]))});

// Page-side helpers (run inside the real match page).
const PAGE=`window.D6Acc={
 sha:async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join(''),
 snap(){const U=D6UnityMatch,host=document.querySelector('#d6-unity-host'),f=host&&host.querySelector('iframe'),pr=U.projection,ack=U.lastAck,ctx=typeof v65Context==='function'&&v65Context();
  return {view:v98View,failed:v98Failed,threeScene:typeof v98Scene!=='undefined'&&Boolean(v98Scene),pitch3dClass:document.body.classList.contains('v98-pitch3d'),active:U.active,ready:U.ready,error:U.lastError,failure:U.lastFailure||null,session:U.session,loads:U.loads,clockHeld:U.clockHeld,
   ackPlayers:ack&&ack.players,ackSeq:ack&&ack.sequence,ackAllReal:Boolean(ack&&ack.ids&&match&&ack.ids.length===match.people.length&&ack.ids.every(id=>match.people.some(p=>p.pid===id))),labels:document.querySelectorAll('#d6-unity-labels button').length,visibleLabels:pr?pr.markers.filter(m=>m.visible).length:null,
   iframe:f?f.src:null,hostHidden:host?host.hidden:null,picturePhase:U.picture&&U.picture.phase,pictureReplay:U.picture&&U.picture.replay,elapsed:match&&match.elapsed,minute:ctx&&ctx.state.minute,phase:ctx&&ctx.state.phase,score:match?[...match.score]:null,events:ctx&&ctx.state.events.length,quality:new URLSearchParams(location.search).get('quality')}},
 async state(){const ctx=v65Context();return {elapsed:match.elapsed,clock:v102Clock(match),score:[...match.score],goals:match.goals.length,events:await D6Acc.sha(JSON.stringify(ctx.state.events)),eventCount:ctx.state.events.length,lineup:await D6Acc.sha(JSON.stringify(match.people.map(p=>p.pid).sort())),positions:await D6Acc.sha(JSON.stringify(match.people.map(p=>[p.pid,p.x,p.y]))),ball:await D6Acc.sha(JSON.stringify(match.ball)),minute:ctx.state.minute,phase:ctx.state.phase,half:match.halftimePause>0,randomless:true}},
 ack:()=>D6UnityMatch.ready&&D6UnityMatch.lastAck&&D6UnityMatch.picture&&D6UnityMatch.lastAck.sequence>=D6UnityMatch.picture.sequence-1,
 stopGoalReplay:()=>{const s=v103ReplayState(match);return Boolean(s.active&&!s.active.penalty&&match.goals.length>0)}
};'D6Acc ready'`;
const INIT=`(()=>{window.__d6Loads=[];window.addEventListener('message',e=>{const d=e.data;if(d&&d.kind==='load'&&d.config)window.__d6Loads.push({quality:d.config.quality,session:d.config.session,fixtureId:d.config.fixtureId,teams:(d.config.teams||[]).map(t=>t.id),home:(d.config.teams||[]).filter(t=>t.home).map(t=>t.id),schema:d.config.schema});},true);})();`;
const loadsOf=async page=>{const frame=page.frames().find(f=>f.url().includes('unity-match'));return frame?frame.evaluate(()=>window.__d6Loads):[];};

const wait=ms=>new Promise(r=>setTimeout(r,ms));
const consoleOf=new WeakMap();
// '[D6] match mesh <name> vertices=.. base=.. mask=..' is logged once per Unity runtime; wait for it (the console event reaches Node asynchronously).
const meshLines=async page=>{const lines=consoleOf.get(page)||[];for(let i=0;i<40&&!lines.some(l=>l.includes('match mesh '));i++)await wait(250);return lines.filter(l=>l.includes('match mesh '));};
const withTimeout=(promise,ms,label)=>{let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Zeitüberschreitung '+label+' nach '+ms/1000+' s')),ms);})]).finally(()=>clearTimeout(timer));};
async function newContext(browser,viewport,extra={}){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,...extra});await wireContext(context);return context;
}
async function wireContext(context){
  await context.addInitScript(INIT);
  context.on('response',res=>{const url=res.url();if(!url.startsWith(base))return;const p=new URL(url).pathname,key=p.startsWith('/unity/')||p==='/'||p.endsWith('runtime.html')||p.endsWith('runtime.js')?p+(new URL(url).search):'(other)';
    const entry=report.network[key]||(report.network[key]={status:{},sha:new Set(),count:0});entry.count++;entry.status[res.status()]=(entry.status[res.status()]||0)+1;const sha=res.headers()['x-d6-sha256'];if(sha)entry.sha.add(sha);});
  context.on('page',page=>{const lines=[];consoleOf.set(page,lines);page.on('pageerror',e=>report.pageErrors.push(String(e.message).slice(0,300)));page.on('console',m=>{const text=m.text();if(m.type()==='error'&&report.consoleErrors.length<60)report.consoleErrors.push({scenario,text:text.slice(0,240)});if(text.startsWith('[D6]')){lines.push(text.slice(0,300));if(report.d6Console.length<400)report.d6Console.push({scenario,text:text.slice(0,300)});}});});
}
async function openMatch(context,{quality,config=null,replays=true,seed,route,club=null}={}){
  const page=await context.newPage();if(route)await page.route(route.pattern,route.handler);
  await page.goto(base+'/?engine=unity'+(quality?'&quality='+quality:''));
  await page.waitForFunction(()=>window.D6WorldUnityContract&&window.userMeshyMatchReady,{},{timeout:120000});
  await page.evaluate(helper);await page.evaluate(PAGE);
  // club: career for another real league club; the unchanged QA helper creates it by the documented native constructor (one-shot id substitution), fixture = its earliest real fixture.
  const setup=await page.evaluate(async([o,club])=>{const original=v61CreateCareer;if(club)v61CreateCareer=function(id,...rest){v61CreateCareer=original;return original(club,...rest);};try{return await D6QA160.setup(o);}finally{v61CreateCareer=original;}},[{config,unity:true,replays,...(seed?{seed}:{})},club]);
  return {page,setup};
}
const shot=async(page,name)=>{const file=path.join(out,'shots',name+'.png');await page.waitForTimeout(250);await page.screenshot({path:file});report.shots.push('shots/'+name+'.png');return file;};
const settle=page=>page.waitForFunction(()=>D6Acc.ack(),{},{timeout:120000});
// After a Unity failure the QA helper's run() stops by design; prove native play with the page's own loop and visible controls.
const nativePlays=async page=>{const phase=()=>page.evaluate(()=>v65Context().state.phase);const a=await page.evaluate(()=>v102Clock(match));
  // The QA helper leaves the match live without a loop: start the page's own native loop (or press the visible resume control when paused).
  if(await phase()==='paused')await page.locator('#v65-quick-nav button').click();else await page.evaluate(()=>v65StartLoop());
  await page.waitForFunction(a=>v102Clock(match)>a+2&&v65Context().state.phase==='live',a,{timeout:90000}).catch(()=>{});const b=await page.evaluate(()=>v102Clock(match));return {from:a,to:b,phase:await phase()};};
const screenLayout=async(page,on=true)=>{await page.evaluate(on=>{v132ScreenState(on);if(on)v132RevealControls();draw();},on);await page.waitForTimeout(500);await settle(page).catch(()=>{});await page.waitForTimeout(350);};
const rendererOf=async page=>{const frame=page.frames().find(f=>f.url().includes('unity-match'));return frame?frame.evaluate(()=>{const c=document.createElement('canvas').getContext('webgl2');const d=c&&c.getExtension('WEBGL_debug_renderer_info');return d?c.getParameter(d.UNMASKED_RENDERER_WEBGL):'unknown';}):null;};
async function bindingChecks(prefix,page,setup,label){
  const s=await page.evaluate(()=>D6Acc.snap());
  check(prefix+'-unity','Unity aktiv und bereit, kein lastError ('+label+')',s.ready&&s.active&&!s.error&&!s.failure&&setup?.unityReady===true&&!setup?.error,{ready:s.ready,active:s.active,error:s.error,failure:s.failure});
  check(prefix+'-no-three','Kein stiller THREE-Fallback: 3D-Ansicht, kein v98Scene, Unity-iframe vorhanden ('+label+')',s.view==='3d'&&!s.failed&&!s.threeScene&&Boolean(s.iframe&&s.iframe.includes('/unity-match/runtime.html')),{view:s.view,failed:s.failed,threeScene:s.threeScene,iframe:s.iframe});
  check(prefix+'-players','12 echte Spieler im Unity-ACK, 12 Labels ('+label+')',s.ackPlayers===12&&s.ackAllReal&&s.labels===12,{ack:s.ackPlayers,real:s.ackAllReal,labels:s.labels});
  if(expectMesh){const mesh=await meshLines(page);check(prefix+'-mesh','Unity meldet beim Laden das Spielermesh '+expectMesh+' (kein Originalmesh, kein anderes Mesh) ('+label+')',mesh.length>0&&mesh.every(l=>l.includes('match mesh '+expectMesh+' ')),mesh);
    if(expectGround){const r=lib.matchMeshLines(mesh,expectGround);check(prefix+'-ground','Ladezeile nennt das Spielermesh '+expectMesh+(expectGround.vertices!=null?' ('+expectGround.vertices+' Vertices)':'')+' mit separatem Boden-Mesh '+expectGround.groundMesh+(expectGround.groundVertices!=null?' ('+expectGround.groundVertices+' Vertices)':'')+', nicht ground=drawn ('+label+')',r.ok,r.ok?undefined:{problems:r.problems,mesh});}}
  return s;
}

const sections={
async build(){
  const before=await getJson(base+'/__build'),manifest=await getJson(base+'/unity/probe-build.json');
  report.buildBefore=buildOf(before);report.unityManifest={sourceId:manifest.sourceId,files:manifest.files.map(f=>({file:f.file,sha256:f.sha256})),loaderUrl:manifest.loaderUrl,dataUrl:manifest.dataUrl,frameworkUrl:manifest.frameworkUrl,codeUrl:manifest.codeUrl};
  check('build-style','Server meldet Stil '+style+' mit frischem Paket',before.style===style&&before.freshness?.state==='fresh'&&before.integrity?.ok===true,{style:before.style,fresh:before.freshness?.state});
  check('build-source-id','probe-build.json trägt dieselbe sourceId wie /__build',manifest.sourceId===before.sourceId,{manifest:manifest.sourceId,build:before.sourceId});
  check('build-clean','Quelle sauber und committed',before.sourceDirty===false,{commit:before.sourceCommit,dirty:before.sourceDirty});
},
async viewports(browser){
  for(const quality of ['standard','reduced'])for(const [w,h] of [[1280,720],[844,390],[931,448]]){
    const label=`${w}x${h}-${quality}`,context=await newContext(browser,{width:w,height:h});
    try{
      const {page,setup}=await openMatch(context,{quality});if(!report.renderer)report.renderer=await rendererOf(page);
      await bindingChecks('vp-'+label,page,setup,label);
      const sent=(await loadsOf(page)).map(l=>l.quality);check('vp-'+label+'-quality','Unity erhielt Qualität '+quality+' im Ladebefehl',sent.length>0&&sent.every(q=>q===quality),sent);
      if(w===1280||w===844){await page.evaluate(()=>document.querySelector('#d6-unity-host').scrollIntoView({block:'center'}));await page.waitForTimeout(400);await shot(page,'page-'+label+'-kickoff');}
      await screenLayout(page,true);await shot(page,'screen-'+label+'-kickoff');
      await page.evaluate(()=>D6QA160.run({minute:10,sampleEvery:3}));await settle(page);await shot(page,'screen-'+label+'-live-m10');
      const p=await page.evaluate(()=>D6QA160.pause());await settle(page);await shot(page,'screen-'+label+'-paused');
      const s=await page.evaluate(()=>D6Acc.snap());
      check('vp-'+label+'-play','Spiel lief bis Minute 10, Pause hält Unity-Bild im Zustand paused, Labels sichtbar',s.minute>=10&&s.phase==='paused'&&s.picturePhase==='paused'&&s.visibleLabels>0&&!s.error,{minute:s.minute,phase:s.phase,picture:s.picturePhase,visible:s.visibleLabels,pause:p});
    }finally{await context.close();}
  }
},
async flow(browser){
  const context=await newContext(browser,{width:1280,height:720}),{page,setup}=await openMatch(context,{quality:'standard'});
  try{
    const s0=await bindingChecks('flow',page,setup,'1280x720');await page.evaluate(()=>{window.__acc={};});await shot(page,'flow-01-setup');
    // Real pause/resume with the visible control, real page loop.
    const quick=page.locator('#v65-quick-nav button');await quick.click();await page.waitForFunction(()=>v65Context().state.phase==='paused',{},{timeout:30000});
    const paused0=await page.evaluate(()=>D6Acc.state());const shown=await page.waitForFunction(()=>D6UnityMatch.picture?.phase==='paused',{},{timeout:15000}).then(()=>true,()=>false);
    check('flow-pause-ui','Sichtbare Pause-Taste hält nativ (Phase paused) und Unity zeigt das Bild als paused',shown&&paused0.phase==='paused',{native:paused0.phase,picture:await page.evaluate(()=>D6UnityMatch.picture?.phase)});
    await quick.click();await page.waitForFunction(()=>match.elapsed>1.5&&v65Context().state.phase==='live',{},{timeout:90000});
    const live1=await page.evaluate(()=>({...D6Acc.snap()}));await quick.click();await page.waitForFunction(()=>v65Context().state.phase==='paused',{},{timeout:30000});
    const frozenA=await page.evaluate(()=>D6Acc.state());await settle(page);await page.waitForTimeout(1500);const frozenB=await page.evaluate(()=>D6Acc.state());const sP=await page.evaluate(()=>D6Acc.snap());
    check('flow-resume-ui','Sichtbare Fortsetzen-Taste: Echtzeit-Schleife lief (Uhr >1,5 s, Unity-ACKs)',live1.elapsed>1.5&&live1.ackSeq>s0.ackSeq&&!live1.error,{elapsed:live1.elapsed,ack:live1.ackSeq});
    check('flow-pause-frozen','Pausiert: Uhr, Stand, Positionen, Ball und Ereignisse unverändert über 1,5 s',JSON.stringify(frozenA)===JSON.stringify(frozenB)&&sP.picturePhase==='paused',{a:frozenA.elapsed,b:frozenB.elapsed,pos:frozenA.positions===frozenB.positions});
    await quick.click();await page.waitForFunction(a=>match.elapsed>a+.8,frozenA.elapsed,{timeout:60000});const resumed=await page.evaluate(()=>D6Acc.snap());
    check('flow-resume-session','Nach Fortsetzen gleiche Unity-Sitzung, keine Neuladung, weiter 3D',resumed.session===s0.session&&resumed.loads===s0.loads&&resumed.active&&!resumed.error,{loads:[s0.loads,resumed.loads]});
    await shot(page,'flow-02-realtime-live');
    // Native deterministic stepping to halftime.
    await quick.click();await page.waitForFunction(()=>v65Context().state.phase==='paused',{},{timeout:30000});
    const half=await page.evaluate(()=>D6QA160.run({stopAtHalftime:true,sampleEvery:6}));await page.waitForTimeout(600);
    const h=await page.evaluate(async()=>({half:match.halftimePause>0,phase:v65Context().state.phase,planView:!document.querySelector('#v65-plan-view').hidden,label:document.querySelector('#v65-quick-nav button').getAttribute('aria-label'),minute:v65Context().state.minute,score:[...match.score],state:await D6Acc.state()}));
    check('flow-halftime','Echte Halbzeitpause erreicht (native Pause, Taste „2. Halbzeit starten“)',half.stopped==='halftime'&&h.half&&h.phase==='paused'&&/Halbzeit/.test(h.label),h);
    await shot(page,'flow-03-halftime');
    await quick.click();await page.waitForFunction(()=>v65Context().state.phase==='live'&&match.halftimePause===0,{},{timeout:30000});
    await page.evaluate(()=>{clearInterval(v65WorldFrame);});await page.evaluate(()=>D6QA160.run({minute:v65Context().state.minute+4,sampleEvery:3}));await settle(page);
    const second=await page.evaluate(()=>D6Acc.snap());
    check('flow-second-half','Zweite Halbzeit per Taste gestartet: Uhr läuft, Unity aktiv, gleiche Sitzung, kein Fehler',second.phase==='live'&&second.active&&!second.error&&second.session===s0.session&&second.minute>h.minute,{minute:[h.minute,second.minute],session:second.session===s0.session});
    await screenLayout(page,true);await shot(page,'flow-04-second-half');await screenLayout(page,false);
    // Review of the actually recorded history.
    await page.evaluate(()=>D6QA160.run({minute:60,sampleEvery:6}));await settle(page);
    const before=await page.evaluate(async()=>({state:await D6Acc.state(),timeline:v103ReplayState(match).timeline.length,span:[v103ReplayState(match).timeline[0]?.clock,v103ReplayState(match).timeline.at(-1)?.clock],markers:v103ReplayState(match).markers.length}));
    await page.evaluate(()=>{v131Seek(v103ReplayState(match).timeline[Math.floor(v103ReplayState(match).timeline.length/2)].clock)});
    await page.waitForFunction(()=>D6UnityMatch.picture?.replay&&v103ReplayState(match).review,{},{timeout:30000});await settle(page);
    const rv=await page.evaluate(async()=>({review:Boolean(v103ReplayState(match).review),replayPicture:D6UnityMatch.picture.replay,pictureElapsed:D6UnityMatch.picture.elapsed,labelsDisabled:[...document.querySelectorAll('#d6-unity-labels [data-player]')].every(b=>b.disabled),panel:Boolean(document.querySelector('#v131-review')),state:await D6Acc.state(),phase:v65Context().state.phase}));
    check('flow-review-history','Rückschau nutzt die echte aufgezeichnete Zeitleiste (≥ 2 Bilder), Unity zeigt replay-Bild, Labels gesperrt',before.timeline>=2&&rv.review&&rv.replayPicture&&rv.labelsDisabled&&rv.phase==='paused',{timeline:before.timeline,span:before.span,markers:before.markers,rv:{review:rv.review,picture:rv.replayPicture,disabled:rv.labelsDisabled,panel:rv.panel,phase:rv.phase}});
    check('flow-review-readonly','Rückschau ändert Uhr, Stand, Aufstellung, Positionen, Ball und Ereignisse nicht',['elapsed','clock','events','lineup','positions','ball','minute'].every(k=>before.state[k]===rv.state[k])&&before.state.score.join()===rv.state.score.join(),{before:before.state.elapsed,after:rv.state.elapsed});
    await screenLayout(page,true);await shot(page,'flow-05-review-screen');await screenLayout(page,false);
    await page.evaluate(()=>{const s=v103ReplayState(match);s.review.time=s.timeline[0].clock;draw();});await page.waitForTimeout(500);await settle(page);
    const early=await page.evaluate(()=>({pictureElapsed:D6UnityMatch.picture.elapsed,replay:D6UnityMatch.picture.replay}));
    check('flow-review-scrub','Zurückspulen zeigt eine frühere Spielzeit im Unity-Bild',early.replay&&early.pictureElapsed<rv.pictureElapsed,{early:early.pictureElapsed,mid:rv.pictureElapsed});
    const back=await page.evaluate(()=>D6QA160.returnLive());await settle(page);
    const live2=await page.evaluate(async()=>({state:await D6Acc.state(),replay:D6UnityMatch.picture.replay,snap:D6Acc.snap()}));
    check('flow-review-return','Zurück zu Live: kein replay-Bild, gleicher Spielstand, gleiche Sitzung, kein Fehler',!live2.replay&&live2.state.score.join()===before.state.score.join()&&live2.snap.session===s0.session&&!live2.snap.error,{back});
    // Finish the real match.
    const end=await page.evaluate(()=>D6QA160.run({finished:true,sampleEvery:30}));await page.waitForTimeout(800);await settle(page).catch(()=>{});
    const fin=await page.evaluate(()=>{const d=D6QA160.digest();return {digest:d,picturePhase:D6UnityMatch.picture.phase,err:D6UnityMatch.lastError,minute:v65Context().state.minute,continue:Boolean(document.querySelector('[data-v65-continue]'))};});
    report.flowDigest=fin.digest;
    check('flow-complete','Vollständige Partie beendet: Ergebnis gebucht, Karriere valide, Unity-Bild finished, kein Fehler',end.finished&&fin.digest.booked&&(fin.digest.valid===true||fin.digest.valid?.ok===true)&&fin.picturePhase==='finished'&&!fin.err,{ticks:end.ticks,score:end.score,all:fin.digest.all,picture:fin.picturePhase,booked:fin.digest.booked,valid:fin.digest.valid});
    await screenLayout(page,true);await shot(page,'flow-06-full-time');await screenLayout(page,false);
    await page.evaluate(async()=>{await v65Leave(true);});
    check('flow-leave','Verlassen der Partie entfernt Renderer und Stream',await page.locator('#d6-unity-host').count()===0);
  }finally{await context.close();}
},
async goal(browser){
  const seeds=args.seed?[Number(args.seed)]:[160112,1,2,3,5,8];const attempts=[];
  for(const seed of seeds){
    const context=await newContext(browser,{width:1280,height:720}),{page,setup}=await openMatch(context,{quality:'standard',seed});
    try{
      const r=await page.evaluate(()=>D6QA160.run({finished:true,sampleEvery:6,stopWhen:D6Acc.stopGoalReplay}));attempts.push({seed,stopped:r.stopped||null,score:r.score});
      if(r.stopped!=='when')continue;
      await page.waitForTimeout(500);await settle(page).catch(()=>{});
      const during=await page.evaluate(async()=>({state:await D6Acc.state(),goals:match.goals.map(g=>({...g})),replay:D6UnityMatch.picture.replay,netActive:D6UnityMatch.picture.netActive,hud:Boolean(document.querySelector('#v103-replay-hud')),active:Boolean(v103ReplayState(match).active),snap:D6Acc.snap()}));
      await screenLayout(page,true);await shot(page,'goal-replay-'+seed);
      check('goal-real','Echtes Tor durch die native Simulation (nicht erzeugt): Seed '+seed+', Tor im Spielstand und in den Ereignissen',during.goals.length>=1&&during.state.score[0]+during.state.score[1]>=1&&during.state.eventCount>=1,{score:during.state.score,goals:during.goals.length});
      check('goal-replay','Tor-Wiederholung: HUD sichtbar, Unity zeigt replay-Bild, kein Fehler',during.hud&&during.active&&during.replay===true&&!during.snap.error&&during.snap.session!=null,{hud:during.hud,replay:during.replay,net:during.netActive});
      // Replay ends by its own native clock; no second booking.
      await page.evaluate(()=>D6QA160.run({minute:v65Context().state.minute+2,sampleEvery:6,stopWhen:()=>!v103ReplayState(match).active}));await page.waitForFunction(()=>D6UnityMatch.picture&&!D6UnityMatch.picture.replay,{},{timeout:30000}).catch(()=>{});await settle(page).catch(()=>{});
      const after=await page.evaluate(async()=>({state:await D6Acc.state(),active:Boolean(v103ReplayState(match).active),replay:D6UnityMatch.picture.replay,err:D6UnityMatch.lastError}));
      check('goal-replay-no-double','Wiederholung endet und bucht kein zweites Tor (Stand und Torliste gleich)',!after.active&&!after.replay&&after.state.goals===during.state.goals&&after.state.score.join()===during.state.score.join()&&!after.err,{before:during.state.score,after:after.state.score,goals:[during.state.goals,after.state.goals]});
      report.sections.goal={seed,attempts};return;
    }finally{await context.close();}
  }
  report.sections.goal={attempts};check('goal-real','Echtes Tor mit Wiederholung innerhalb der begrenzten Seeds gefunden',false,attempts);
},
async parity(browser){
  const config={fieldSize:'standard',fieldPlayers:5},res=[];
  for(const unity of [true,false]){
    const context=await newContext(browser,{width:1280,height:720}),page=await context.newPage();
    try{
      await page.goto(base+'/?engine='+(unity?'unity':'browser'));await page.waitForFunction(()=>window.userMeshyMatchReady,{},{timeout:120000});await page.evaluate(helper);
      const log=await page.evaluate(([c,u])=>D6QAScenario(c,u),[config,unity]);const parts=await page.evaluate(()=>D6QA160Parts);
      res.push({unity,log,parts:crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex')});
    }finally{await context.close();}
  }
  const [u,n]=res;report.parity={unity:{all:u.log.digest.all,score:u.log.digest.score,ticks:u.log.end.ticks,hashes:u.log.digest.hashes,payloadSha256:u.parts},native2d:{all:n.log.digest.all,score:n.log.digest.score,ticks:n.log.end.ticks,payloadSha256:n.parts}};
  check('parity-sequence','Identische Aufrufsequenz (20\u2032, Pause, Fortsetzen, Halbzeit, 60\u2032, Checkpoint, Abpfiff): Unity-Digest = natives 2D, gleiche Nutzdaten-SHA256',JSON.stringify(u.log.digest)===JSON.stringify(n.log.digest)&&u.parts===n.parts&&u.log.end.ticks===n.log.end.ticks&&!u.log.end.unityError,{unity:u.log.digest.all,native:n.log.digest.all,payload:[u.parts.slice(0,12),n.parts.slice(0,12)]});
  check('parity-complete','Beide Partien vollständig, gebucht und valide; Unity ohne Fehler',[u,n].every(x=>x.log.digest.finished&&x.log.digest.booked&&(x.log.digest.valid===true||x.log.digest.valid?.ok===true)),{unity:u.log.digest.valid,native:n.log.digest.valid});
},
async reload(){
  const profile=path.join(out,'profile-reload');fs.rmSync(profile,{recursive:true,force:true});fs.mkdirSync(profile,{recursive:true});
  const open=async()=>{const context=await chromium.launchPersistentContext(profile,{executablePath:edge,headless:true,args:launchArgs,viewport:{width:1280,height:720},deviceScaleFactor:1});await wireContext(context);return context;};
  let context=await open(),page,id,saved;
  try{
    ({page}=await openMatch(context,{quality:'standard'}));
    await page.evaluate(()=>D6QA160.run({minute:25,sampleEvery:6}));await page.evaluate(()=>D6QA160.pause());await settle(page);
    id=await page.evaluate(async()=>{await v61StoreNewCareer(D6QA160.career);await v61WaitForStorage();return v61CurrentCareer.id;});
    saved=await page.evaluate(async()=>({state:await D6Acc.state(),snap:await D6Acc.sha(JSON.stringify(v65Context().state.physicalSnapshot)),own:v66Own(v61CurrentCareer).name}));
    await page.waitForTimeout(500);
    check('reload-saved','Checkpoint im isolierten Profil gespeichert (Pause bei Minute 25, physicalSnapshot, Spielstand)',saved.state.phase==='paused'&&saved.state.minute>=25&&Boolean(saved.snap)&&Boolean(id),{minute:saved.state.minute,elapsed:saved.state.elapsed,snap:saved.snap.slice(0,12),id});
    for(const mode of ['page.reload','browser restart']){
      if(mode==='browser restart'){await context.close();context=await open();page=await context.newPage();await page.goto(base+'/?engine=unity&quality=standard');}
      else await page.reload();
      await page.waitForFunction(()=>window.D6WorldUnityContract&&window.userMeshyMatchReady,{},{timeout:120000});await page.evaluate(helper);await page.evaluate(PAGE);await page.evaluate(()=>v61WaitForStorage()).catch(()=>{});
      const stored=await page.evaluate(async id=>{const c=v61ReadCareers().find(c=>c.id===id),s=c&&c.world.activeMatch&&c.world.activeMatch.state;return s&&{phase:s.phase,minute:s.minute,snap:await D6Acc.sha(JSON.stringify(s.physicalSnapshot)),elapsed:s.physicalSnapshot?.match.elapsed};},id);
      check('reload-persisted-'+mode,'Nach '+mode+' liegt derselbe Checkpoint im Speicher (physicalSnapshot-SHA256 gleich)',stored&&stored.snap===saved.snap&&stored.phase==='paused',{stored:stored&&stored.snap.slice(0,12),saved:saved.snap.slice(0,12)});
      const open_=page.locator('[data-v61-open="'+id+'"]');check('reload-open-'+mode,'Gespeicherte Karriere über die sichtbare Öffnen-Schaltfläche erreichbar',await open_.count()>0);
      await open_.first().click();
      await page.waitForFunction(()=>typeof match!=='undefined'&&match&&D6UnityMatch.ready&&D6UnityMatch.lastAck?.players===12&&!D6UnityMatch.lastError,{},{timeout:150000});await settle(page);
      const restored=await page.evaluate(async()=>({state:await D6Acc.state(),snap:D6Acc.snap()}));
      check('reload-restored-'+mode,'Wiederhergestellte Partie: Uhr, Stand, Aufstellung, Positionen, Ball, Ereignisse wie vor dem Neuladen',['elapsed','clock','lineup','positions','ball','events','minute'].every(k=>restored.state[k]===saved.state[k])&&restored.state.score.join()===saved.state.score.join(),{saved:saved.state.elapsed,restored:restored.state.elapsed,pos:restored.state.positions===saved.state.positions});
      const b=await bindingChecks('reload-'+mode.replace(' ','-'),page,{unityReady:true},'nach '+mode);await shot(page,'reload-'+mode.replace(' ','-')+'-paused');
      await page.locator('#v65-quick-nav button').click();await page.waitForFunction(a=>match.elapsed>a+1&&v65Context().state.phase==='live',saved.state.elapsed,{timeout:90000});
      check('reload-resume-'+mode,'Sichtbares Fortsetzen nach '+mode+': Uhr läuft weiter, Unity ohne Fehler',await page.evaluate(()=>!D6UnityMatch.lastError&&D6UnityMatch.active),b.session);
      await page.locator('#v65-quick-nav button').click();await page.waitForFunction(()=>v65Context().state.phase==='paused',{},{timeout:30000});
      saved=await page.evaluate(async()=>{await v61WaitForStorage();return {state:await D6Acc.state(),snap:await D6Acc.sha(JSON.stringify(v65Context().state.physicalSnapshot))};});
    }
    
  }finally{await context.close().catch(()=>{});fs.rmSync(profile,{recursive:true,force:true});}
},
async fallback(browser){
  // 1) Voluntary 2D switch and return to 3D through the page's own view controls.
  let context=await newContext(browser,{width:1280,height:720}),{page,setup}=await openMatch(context,{quality:'standard'});
  try{
    const s0=await bindingChecks('fb',page,setup,'Ausgang');await page.evaluate(()=>D6QA160.run({minute:5,sampleEvery:3}));
    await page.evaluate(()=>document.querySelector('[data-v98-view="2d"]').click());await page.waitForTimeout(700);
    const two=await page.evaluate(()=>({...D6Acc.snap(),hostCount:document.querySelectorAll('#d6-unity-host').length,hostVisible:Boolean(document.querySelector('#d6-unity-host')&&!document.querySelector('#d6-unity-host').hidden)}));
    const m2=await page.evaluate(async()=>{const a=match.elapsed;await D6QA160.run({minute:v65Context().state.minute+2,sampleEvery:3});return {from:a,to:match.elapsed,phase:v65Context().state.phase};});
    await shot(page,'fallback-2d-switch');
    check('fb-2d-switch','Wechsel auf 2D: Ansicht 2d, Unity-Host verborgen, native Partie läuft weiter',two.view==='2d'&&!two.hostVisible&&m2.to>m2.from&&!two.threeScene,{view:two.view,hostVisible:two.hostVisible,m2});
    await page.evaluate(()=>document.querySelector('[data-v98-view="3d"]').click());await page.waitForFunction(()=>D6UnityMatch.active&&D6UnityMatch.lastAck?.players===12,{},{timeout:60000});await settle(page);
    const three=await page.evaluate(()=>D6Acc.snap());await shot(page,'fallback-return-3d');
    check('fb-return-3d','Rückkehr in 3D: Unity aktiv, 12 echte Spieler, kein Fehler, kein THREE',three.view==='3d'&&three.active&&three.ackAllReal&&three.labels===12&&!three.error&&!three.threeScene,{view:three.view,session:[s0.session,three.session],loads:[s0.loads,three.loads]});
    // 2) Forced runtime error from the Unity frame: visible 2D fallback, match plays on.
    const fb=await page.evaluate(()=>D6QA160.fallback());fb.playsOn2D=await nativePlays(page);await shot(page,'fallback-forced-error');
    check('fb-foreign-message','Fremde window-Nachricht stört den Renderer nicht',fb.foreign&&fb.foreign.active&&!fb.foreign.error,fb.foreign);
    check('fb-forced-error','Fehler aus dem Unity-Frame: sichtbarer 2D-Rückfall (Meldung gesetzt), Spiel läuft nativ weiter, kein THREE',fb.after.view==='2d'&&Boolean(fb.after.error)&&!fb.after.active&&fb.playsOn2D.to>fb.playsOn2D.from,fb);
  }finally{await context.close();}
  // 3) Missing Unity build: playable 2D, never silent THREE.
  scenario='missing-build';context=await newContext(browser,{width:1280,height:720});
  try{
    const r=await openMatch(context,{quality:'standard',route:{pattern:'**/unity/probe-build.json',handler:route=>route.fulfill({status:404,body:'Not available'})}}).catch(error=>({error}));
    const p=r.page||(context.pages()[0]);await p.waitForFunction(()=>v98View==='2d'&&D6UnityMatch.lastError,{},{timeout:150000});await p.waitForTimeout(500);
    const s=await p.evaluate(()=>({...D6Acc.snap(),status:document.querySelector('#v98-status')?.textContent,people:match.people.length,phase:v65Context().state.phase}));await shot(p,'fallback-missing-build');
    const m=await nativePlays(p);
    check('fb-missing-build','Fehlender Unity-Build: 2D mit Meldung „'+(s.error||'')+'“, 12 Spieler, Partie spielbar, kein v98Scene',s.view==='2d'&&Boolean(s.error)&&!s.active&&s.people===12&&!s.threeScene&&m.to>m.from,{error:s.error,status:s.status,view:s.view,m});
  }finally{await context.close();scenario='-';}
},
async architectures(browser){
  // Real league clubs whose earliest native fixture is a home match, so the stadium Unity builds is their own ClubStadiumProfiles entry.
  // (Only the six league clubs per country can be taken over; sun-terraces clubs ESP-3/ITA-6/POR-3 open their season away, so that type is not reachable without choosing another fixture.)
  const owns=['ENG-1','ENG-2','ITA-1','ESP-4','ESP-5','ITA-4'],sizes=(args.archViewports||'1280x720').split(',').map(s=>s.split('x').map(Number));
  const source=fs.readFileSync(path.join(repo,'prototypes/match-engine-unity/ClubStadiumProfiles.cs'),'utf8');
  const catalog=Object.fromEntries([...source.matchAll(/Plan\("([A-Z0-9-]+)",\s*"([^"]*)",\s*"([^"]+)",\s*"([^"]+)"/g)].map(m=>[m[1],{name:m[2],archetype:m[3],facade:m[4]}]));
  const labelsOf=page=>page.evaluate(()=>{const pr=D6UnityMatch.projection,buttons=[...document.querySelectorAll('#d6-unity-labels [data-player]')],vw=innerWidth,vh=innerHeight;
    return {markers:pr?pr.markers.length:0,visibleMarkers:pr?pr.markers.filter(m=>m.visible).length:0,buttons:buttons.length,named:buttons.filter(b=>(b.textContent||'').trim().length>0).length,
     inViewport:buttons.filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=vw&&r.bottom<=vh;}).length,texts:buttons.map(b=>(b.textContent||'').trim())};});
  const rows=[];
  for(const own of owns)for(const quality of ['standard','reduced'])for(const [w,h] of sizes){
    const label=own+'-'+w+'x'+h+'-'+quality,context=await newContext(browser,{width:w,height:h});
    try{
      const {page,setup}=await openMatch(context,{quality,club:own}),id='arch-'+label;
      const s=await bindingChecks(id,page,setup,label);
      const loads=await loadsOf(page),last=loads.at(-1)||{},home=last.home||[],profile=catalog[home[0]];
      check(id+'-home','Echtes Heimspiel von '+own+': Ladebefehl nennt genau diesen Heimverein, Profil '+(profile?profile.archetype+'/'+profile.facade:'?')+', Qualität '+quality,home.length===1&&home[0]===own&&Boolean(profile)&&last.quality===quality&&/-/.test(String(last.fixtureId||'')),{home,teams:last.teams,fixture:last.fixtureId,quality:last.quality});
      await screenLayout(page,true);const kickoff=await labelsOf(page);await shot(page,'arch-'+label+'-kickoff');
      await page.evaluate(()=>D6QA160.run({minute:5,sampleEvery:3}));await settle(page);const live=await labelsOf(page);await shot(page,'arch-'+label+'-live-m5');
      // Repository label QA (work/platform/qa/unity-label-readability.js) on the actually rendered heads, run paused after the screenshot: no overlap, nothing outside the viewport, accessible names, ring patterns, native state untouched.
      await page.evaluate(()=>D6QA160.pause());await settle(page);await page.evaluate(labelHelper);
      const lq=await page.evaluate(()=>D6LabelQA().then(r=>({pass:r.pass,checks:r.checks.length}),e=>({pass:false,error:String(e&&e.message||e).slice(0,300)})));
      check(id+'-label-qa','Repository-Labelprüfung auf den echt gerenderten Köpfen ('+label+'): keine Überlappung, nichts außerhalb, Namen/Ringmuster, Nativzustand unverändert',lq.pass,lq);
      const e=await page.evaluate(()=>({...D6Acc.snap(),fixture:v65Context().fixture.id,home:v65Context().fixture.homeId}));
      check(id+'-play','Spiel bis Minute 5 ohne Fehler; 12 Labels mit Text, Bildpunkte stammen vom Unity-Bild ('+label+')',e.minute>=5&&!e.error&&e.active&&kickoff.buttons===12&&kickoff.named===12&&live.buttons===12&&live.named===12,{minute:e.minute,kickoff:{visible:kickoff.visibleMarkers,inViewport:kickoff.inViewport},live:{visible:live.visibleMarkers,inViewport:live.inViewport}});
      rows.push({labelQA:lq,own,home:home[0],archetype:profile&&profile.archetype,facade:profile&&profile.facade,viewport:w+'x'+h,quality,fixture:e.fixture,iframe:e.iframe,session:e.session,loads:e.loads,mesh:consoleOf.get(page).filter(l=>l.includes('match mesh ')),kickoff,live,minute:e.minute});
    }finally{await context.close();}
  }
  const types=[...new Set(rows.map(r=>r.archetype))];report.sections.architectures={rows:rows.map(r=>({own:r.own,home:r.home,archetype:r.archetype,facade:r.facade,viewport:r.viewport,quality:r.quality,fixture:r.fixture,mesh:r.mesh,labelQA:r.labelQA,kickoffVisible:r.kickoff.visibleMarkers,kickoffInViewport:r.kickoff.inViewport,liveVisible:r.live.visibleMarkers,liveInViewport:r.live.inViewport})),types};
  check('arch-types','Mindestens 3 weitere bestehende Architekturtypen (zusätzlich zu dockside-ground aus GER-2) im echten WebGL-Spiel: '+types.join(', '),types.length>=3,types);
}
};

(async()=>{
  const browser=await chromium.launch({executablePath:edge,headless:true,args:launchArgs});
  const t0=Date.now();
  try{
    for(const name of only){
      if(!sections[name]){report.sections[name]={status:'unknown'};continue;}
      const started=Date.now(),failuresBefore=report.checks.filter(c=>!c.ok).length;
      console.log('--- '+name);
      try{await withTimeout(sections[name](browser),name==='architectures'?2400000:name==='parity'||name==='flow'?900000:600000,name);report.sections[name]={...(report.sections[name]||{}),status:report.checks.filter(c=>!c.ok).length>failuresBefore?'fail':'pass',seconds:Math.round((Date.now()-started)/1000)};}
      catch(error){report.sections[name]={...(report.sections[name]||{}),status:'error',error:String(error&&error.stack||error).slice(0,1200),seconds:Math.round((Date.now()-started)/1000)};console.error('FEHLER in '+name+': '+(error&&error.message));}
    }
    const after=await getJson(base+'/__build'),beforeBuild=report.buildBefore||buildOf(after),afterBuild=buildOf(after);
    report.buildAfter=afterBuild;
    check('build-unchanged','/__build vor und nach dem Lauf identisch (Fingerprint, sourceId, HTML-, Manifest-, Paket-Hash, alle Dateihashes)',JSON.stringify(beforeBuild)===JSON.stringify(afterBuild),{before:beforeBuild.packageManifestSha256,after:afterBuild.packageManifestSha256});
    // Payloads actually fetched by the browsers vs the package manifest.
    const shas=Object.fromEntries((after.files||[]).map(f=>[f.file,f.sha256]));const wanted=['unity-web.data','unity-web.framework.js','unity-web.loader.js','unity-web.wasm'];
    const net=Object.entries(report.network).map(([k,v])=>({url:k,count:v.count,status:v.status,sha:[...v.sha]}));
    const fetched=wanted.map(f=>{const hit=net.find(n=>n.url.startsWith('/unity/Build/'+f));return {file:f,url:hit&&hit.url,sha:hit&&hit.sha[0],expected:shas['unity/Build/'+f]||shas['Build/'+f]||Object.entries(shas).find(([k])=>k.endsWith('/'+f)||k===f)?.[1]};});
    report.fetchedBuild=fetched;report.networkSummary=net;
    if(only.some(n=>['viewports','flow','goal','parity','reload','fallback','architectures'].includes(n)))check('network-payload','Der Browser lud alle vier WebGL-Dateien über die hashgebundenen URLs; X-D6-Sha256 = Paketmanifest',fetched.every(f=>f.url&&f.sha&&f.sha===f.expected&&/\?v=[0-9a-f]{8,}/.test(f.url)),fetched);
    if(only.some(n=>['viewports','flow','goal','parity','reload','fallback','architectures'].includes(n))){const badStatus=net.filter(n=>Object.keys(n.status).some(s=>Number(s)>=400)&&!/probe-build\.json/.test(n.url));check('network-status','Keine HTTP-Fehler außer dem bewusst blockierten probe-build.json',badStatus.length===0,badStatus);}
    const unexpectedConsole=report.consoleErrors.filter(e=>!(e.scenario==='missing-build'&&/status of 404/.test(e.text)));
    check('console-errors','Keine Konsolenfehler außer dem erwarteten 404 des bewusst blockierten probe-build.json (Szenario missing-build)',unexpectedConsole.length===0,unexpectedConsole.slice(0,5));
    check('page-errors','Keine unbehandelten Seitenfehler (pageerror)',report.pageErrors.length===0,report.pageErrors.slice(0,5));
  }finally{await browser.close();}
  report.finishedAt=new Date().toISOString();report.seconds=Math.round((Date.now()-t0)/1000);
  report.pass=report.checks.every(c=>c.ok)&&Object.values(report.sections).every(s=>s.status==='pass');
  for(const entry of Object.values(report.network))entry.sha=[...entry.sha];
  fs.writeFileSync(path.join(out,'acceptance.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({pass:report.pass,checks:report.checks.length,failed:report.checks.filter(c=>!c.ok).map(c=>c.id),sections:Object.fromEntries(Object.entries(report.sections).map(([k,v])=>[k,v.status])),report:path.join(out,'acceptance.json')}));
  process.exitCode=report.pass?0:2;
})().catch(error=>{console.error(error&&error.message||error);process.exitCode=1;});
