// T3 preview harness for the real build (http://127.0.0.1:4521/native-build.html)
// or the source (/source/index.html?engine=unity). Paste the whole file once per
// tab, then drive it in short evaluate calls (T3 evaluate stops after 15 s):
//   QAJ('name', D6QAScenario({fieldSize:'large',fieldPlayers:6}, true))  -> poll window.QAR
//   QAJ('name', D6QAScenario(null, false))     career without field choice, native 2D
// Single steps: D6QA160.setup/run/camera/pause/review/returnLive/checkpoint/fallback/digest.
// The simulation uses a seeded stream only inside career creation and match
// steps, so Unity and 2D runs with the same call sequence must give the same
// digest. sampleEvery only thins the picture sampling (awaited frames), never
// the native .05 s steps. Picture checks compare each sampled Unity picture
// with the native positions of exactly that rendered frame (v98Frame.qaNative).
window.D6QA160=(()=>{
 const frame=()=>new Promise(r=>requestAnimationFrame(()=>r())),wait=ms=>new Promise(r=>setTimeout(r,ms));
 let rng=0,c=null,s=null,o=null,fixtureId=null,halftime=false,halftimeShown=false,checkpoints=0;
 const seeded=fn=>{const original=Math.random;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};try{return fn()}finally{Math.random=original}};
 const stats={pictures:0,maxError:0,outside:0,labels:0,visibleLabels:0,lastSequence:0,ballOutside:0,keeperContacts:[],netMax:0};
 const geometry=()=>match.geometry||{length:68,width:44};
 const metres=(p,turned)=>{const g=geometry(),x=turned?1-p.x:p.x,y=turned?1-p.y:p.y;return {x:(.5-y)*g.length/(v55Field.bottom-v55Field.top),z:(x-.5)*g.width/(v55Field.right-v55Field.left)};};
 const sample=()=>{
  const pic=D6UnityMatch.picture;if(!pic||pic.replay||pic.sequence===stats.lastSequence||!v98Frame?.qaNative||v98Frame.elapsed!==pic.elapsed)return;
  stats.lastSequence=pic.sequence;const g=geometry(),source=v98Frame.qaNative;
  if(!match.flight)for(const p of pic.players){const person=source.get(p.id);if(!person)continue;const m=metres(person,pic.turned);stats.maxError=Math.max(stats.maxError,Math.hypot(m.x-p.position[0],m.z-p.position[2]));if(Math.abs(p.position[0])>g.length/2+3||Math.abs(p.position[2])>g.width/2+3)stats.outside++;}
  for(const p of pic.players)if(p.contactPoint&&source.get(p.id)?.keeper)stats.keeperContacts.length<200&&stats.keeperContacts.push({id:p.id,action:p.action,metres:+Math.hypot(p.contactPoint[0]-p.position[0],p.contactPoint[2]-p.position[2]).toFixed(3)});
  if(pic.netActive&&pic.net)stats.netMax=Math.max(stats.netMax,Math.abs(pic.net.z??0));
  // A fading ball (opacity < 1) after "wide/out" may fly past the stands; only a visible ball counts.
  if(pic.ballOpacity>=.99&&(Math.abs(pic.ball[0])>g.length/2+4||Math.abs(pic.ball[2])>g.width/2+4))stats.ballOutside++;
  stats.pictures++;const pr=D6UnityMatch.projection;if(pr){stats.labels=Math.max(stats.labels,pr.markers.length);stats.visibleLabels=Math.max(stats.visibleLabels,pr.markers.filter(m=>m.visible).length)}
 };
 // Waits for a new Unity session when one is given, then for its first acknowledged picture.
 async function unityReady(old){for(let i=0;i<240&&(D6UnityMatch.session===old||!D6UnityMatch.ready||D6UnityMatch.lastAck?.players!==match.people.length)&&!D6UnityMatch.lastError;i++)await wait(500);return D6UnityMatch.ready&&!D6UnityMatch.lastError}
 async function setup(options){
  o={config:null,unity:true,seed:160112,...options};rng=o.seed;halftime=halftimeShown=false;checkpoints=0;Object.assign(stats,{pictures:0,maxError:0,outside:0,labels:0,visibleLabels:0,lastSequence:0,ballOutside:0,keeperContacts:[],netMax:0});
  if(!window.D6QA160Base){window.D6QA160Base=v98PitchFrame;v98PitchFrame=function(current){const f=window.D6QA160Base(current);f.qaNative=new Map(current.people.map(p=>[p.pid,{x:p.x,y:p.y,keeper:p.keeper}]));return f;};}
  const name=o.config?`unity-v160-${o.config.fieldSize}-${o.config.fieldPlayers}`:'unity-v160-default';
  c=await seeded(()=>v61CreateCareer('GER-2',name,'Unity QA',undefined,o.config||undefined));const club=v66Own(c);seeded(()=>{v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0)});
  while(c.world.market.phase==='open'){const original=Math.random;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};try{await v66NextMarketDay(c)}finally{Math.random=original}}
  const f=v62Fixtures(c).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0];fixtureId=f.id;
  const oldSession=window.D6UnityMatch?.session;
  seeded(()=>{s=v64MakeState(c,f);c.world.activeMatch={fixtureId:f.id,state:s};v61CurrentCareer=c;s.phase='paused';match=null;v65WorldActive=null;v98View=o.unity?'3d':'2d';v98CameraMode='tv';v65Show(v65Context());clearInterval(v65WorldFrame)});
  if(!o.replays)v103CanReplay=()=>false;
  const per=(o.config?.fieldPlayers||5)+1,out={config:o.config,unity:o.unity,people:match.people.length,perTeam:[0,1].map(t=>match.people.filter(p=>p.t===t).length),keepers:[0,1].map(t=>match.people.filter(p=>p.t===t&&p.keeper).length),geometry:match.geometry||null,expectedPerTeam:per};
  if(o.unity){out.unityReady=await unityReady(oldSession);out.ack=D6UnityMatch.lastAck&&{players:D6UnityMatch.lastAck.players,ids:D6UnityMatch.lastAck.ids?.length,allReal:D6UnityMatch.lastAck.ids?.every(id=>match.people.some(p=>p.pid===id))};out.error=D6UnityMatch.lastError}
  seeded(()=>{v65Resume();clearInterval(v65WorldFrame)});
  return out;
 }
 // Live play until {minute}, the final whistle ({finished:true}), the halftime
 // pause ({stopAtHalftime:true}) or stopWhen(); calling run again continues the same steps.
 async function run({minute=999,finished=false,stopAtHalftime=false,limit=20000,sampleEvery=3,stopWhen=null}={}){
  let ticks=0;
  while(!match.finished&&ticks++<limit){
   const context=v65Context();
   if(context.state.phase==='paused'){halftime||=match.halftimePause>0;if(stopAtHalftime&&match.halftimePause>0&&!halftimeShown){halftimeShown=true;return{stopped:'halftime',minute:s.minute,score:[...s.score]}}seeded(()=>{v65Resume();clearInterval(v65WorldFrame)})}
   if(!finished&&s.minute>=minute)break;
   if(stopWhen&&stopWhen())return {stopped:'when',minute:s.minute,score:[...s.score]};
   seeded(()=>{step(.05*MATCH_SPEED,.05);if(context.state.phase==='live'&&!match.finished)v65AfterStep(context)});
   if(o.unity&&ticks%sampleEvery===0){await frame();sample();if(D6UnityMatch.lastError)break;}
   else if(!o.unity&&ticks%200===0)await wait(0);
  }
  if(o.unity)for(let i=0;i<6;i++){await frame();sample()}
  return {ticks,minute:s.minute,phase:s.phase,score:[...s.score],finished:Boolean(match.finished),halftime,unityError:o.unity?D6UnityMatch.lastError:null,stats:report()};
 }
 const report=()=>({pictures:stats.pictures,maxPositionError:+stats.maxError.toFixed(5),playersOutside:stats.outside,visibleBallOutside:stats.ballOutside,netMaxZ:+stats.netMax.toFixed(3),labels:stats.labels,visibleLabels:stats.visibleLabels,domLabels:document.querySelectorAll('#d6-unity-labels [data-player]').length,keeperContactSamples:stats.keeperContacts.length,keeperContactMetres:[...new Set(stats.keeperContacts.map(k=>k.action+':'+k.metres))]});
 async function settle(n=12){for(let i=0;i<n;i++)await frame();await wait(250);}
 async function camera(mode){v98CameraMode=mode;v98Toolbar?.();await settle();const pic=D6UnityMatch.picture,g=geometry();return {mode,camera:pic?.camera,ball:pic?.ball,geometry:{length:g.length,width:g.width},error:D6UnityMatch.lastError};}
 async function pause(){v65PauseRequested=false;let n=0;while((match.flight||match.slide)&&n++<400)await run({minute:s.minute+1,limit:1,sampleEvery:1});const ok=v65Pause();clearInterval(v65WorldFrame);if(o.unity)await settle(20);return {steps:n,ok,phase:s.phase,picturePhase:o.unity?D6UnityMatch.picture?.phase:null};}
 async function review(){
  const state=v103ReplayState(match),frames=state.timeline;if(frames.length<2)return {timeline:frames.length};
  v131Seek(frames[Math.floor(frames.length/2)].clock);await settle();const pic=D6UnityMatch.picture;
  return {timeline:frames.length,phase:s.phase,replayPicture:Boolean(pic?.replay),pictureElapsed:pic?.elapsed,liveElapsed:match.elapsed,players:pic?.players.length,labelsDisabled:[...document.querySelectorAll('#d6-unity-labels [data-player]')].every(b=>b.disabled),panel:Boolean(document.querySelector('#v131-review'))};
 }
 async function returnLive(){v131ReturnLive(false);seeded(()=>{v65Resume();clearInterval(v65WorldFrame)});if(o.unity)await settle();return {phase:s.phase,replay:o.unity?D6UnityMatch.picture?.replay:null,error:o.unity?D6UnityMatch.lastError:null};}
 // Real JSON continuation: v65Snapshot -> JSON round trip -> match=null -> v65Restore.
 async function checkpoint(){
  for(let i=0;i<400&&(match.flight||match.slide||match.setPiece||match.throwIn||match.kickoff);i++)seeded(()=>{const context=v65Context();step(.05*MATCH_SPEED,.05);v65AfterStep(context)});
  const context=v65Context(),loads=o.unity?D6UnityMatch.loads:null,saved=v65Snapshot(context);if(!saved)return {saved};
  s.physicalSnapshot=JSON.parse(JSON.stringify(s.physicalSnapshot));const minute=s.minute;match=null;const restored=v65Restore(context);checkpoints++;
  let ready=null;if(o.unity){await settle(30);ready=await unityReady();}
  return {saved,restored,minute,loadsBefore:loads,loadsAfter:o.unity?D6UnityMatch.loads:null,unityReady:ready,error:o.unity?D6UnityMatch.lastError:null};
 }
 // Foreign window messages are ignored; an error from the Unity frame itself drops to 2D.
 async function fallback(){
  const iframe=document.querySelector('#d6-unity-host iframe');if(!iframe)return {iframe:false};
  window.postMessage({channel:D6WorldUnityContract.schema,session:D6UnityMatch.session,kind:'error',message:'QA foreign'},'*');await settle();
  const foreign={error:D6UnityMatch.lastError,active:D6UnityMatch.active};
  iframe.contentWindow.eval('parent.postMessage('+JSON.stringify({channel:D6WorldUnityContract.schema,session:D6UnityMatch.session,kind:'error',message:'QA forced runtime error'})+',"*")');await settle();
  const after={error:D6UnityMatch.lastError,failure:D6UnityMatch.lastFailure,active:D6UnityMatch.active,view:v98View,host:Boolean(document.querySelector('#d6-unity-host')),status:document.querySelector('#v98-status')?.textContent};
  const before=s.minute;await run({minute:s.minute+3});
  return {foreign,after,playsOn2D:{from:before,to:s.minute,phase:s.phase}};
 }
 function strip(value){return JSON.parse(JSON.stringify(value,(k,v)=>['updated','created','savedAt'].includes(k)?'<volatile>':v));}
 function digest(){
  const world=strip(c.world),parts={score:s.score,events:s.events,stats:s.stats,fresh:s.fresh,minutes:s.minutes,report:strip(s.postMatchReport),ratings:s.ratings,ballAccounting:match.ballAccounting,geometry:match.geometry,people:match.people.map(p=>({pid:p.pid,x:p.x,y:p.y,fresh:p.fresh,stats:p.stats})),finances:world.clubs.map(club=>({id:club.id,balance:club.balance,ledger:club.ledger??club.finance??null})),development:world.clubs.flatMap(club=>club.roster).map(p=>({pid:p.pid,fresh:p.fresh,form:p.form,skills:D6PlayerGeneration.SKILL_KEYS.map(k=>p[k]),model:p.playerModel})),fixtures:v62Fixtures(c).filter(f=>f.result).map(f=>({id:f.id,result:f.result,record:f.matchRecord})),world};
  const text={};for(const [k,v]of Object.entries(parts))text[k]=JSON.stringify(v);
  const hash=t=>{let h=2166136261;for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619)>>>0;return h.toString(16).padStart(8,'0')};
  const hashes=Object.fromEntries(Object.entries(text).map(([k,v])=>[k,hash(v)+':'+v.length]));
  window.D6QA160Parts=text;
  return {score:[...s.score],phase:s.phase,finished:Boolean(match.finished),valid:v61ValidateCareer(c),booked:Boolean(v62Fixtures(c).find(f=>f.id===fixtureId)?.result),balanceOwn:v66Own(c).balance,checkpoints,hashes,all:hash(Object.values(text).join('|'))};
 }
 return {setup,run,camera,pause,review,returnLive,checkpoint,fallback,digest,report,get career(){return c},get state(){return s}};
})();
window.QAJ=(name,p)=>{window.QAR={name,done:false,t0:Date.now()};p.then(v=>window.QAR={name,done:true,v,ms:Date.now()-QAR.t0},e=>window.QAR={name,done:true,error:String(e&&e.stack||e)});return 'started '+name};
// Fixed call sequence shared by the Unity and native 2D parity runs.
window.D6QAScenario=async(config,unity,hooks={})=>{const Q=D6QA160,log={};log.setup=await Q.setup({config,unity,replays:true});log.r20=await Q.run({minute:20,sampleEvery:3});log.pause=await Q.pause();log.live=await Q.returnLive();log.half=await Q.run({stopAtHalftime:true,sampleEvery:30,stopWhen:hooks.stopWhen});log.r60=await Q.run({minute:60,sampleEvery:30});log.cp=await Q.checkpoint();log.end=await Q.run({finished:true,sampleEvery:30});log.digest=Q.digest();return JSON.parse(JSON.stringify(log))};
'D6QA160 ready';
