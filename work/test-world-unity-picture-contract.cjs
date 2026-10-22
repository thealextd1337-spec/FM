'use strict';
// Unity picture contract over whole matches: every native 0.05 s step of seeded new-world matches (D6QA160 career start,
// native 2D stepping) builds the production picture (D6WorldUnityContract.picture of the scaled v98PitchFrame, as
// world-unity-v151.js sends it) and checks it against a mirror of WorldViewContract.Validate (C#). Unity reads the picture
// with JsonUtility: the mirror checks the JSON round trip (NaN/Infinity become null, then 0; missing numbers 0) and
// reports non-finite source numbers separately even where C# would accept the 0. Any rejection makes Unity show
// "Unity ist nicht verfügbar · 2D ist aktiv". Node >= 20 with Playwright and Edge.
//   node work/test-world-unity-picture-contract.cjs [--root <checkout>] [--seeds 160112,...] [--expect-rejections] [--out <json>]
// --root serves another checkout's dist/ (e.g. a git archive of the base) through its own work/ui-redesign/serve.cjs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback;};
const root=path.resolve(arg('--root',path.join(__dirname,'..'))),seeds=String(arg('--seeds','160112,160113,160114,160115,160116,160117,160118,160119')).split(',').map(Number);
const expectRejections=process.argv.includes('--expect-rejections'),out=arg('--out',null);
const helper=fs.readFileSync(path.join(__dirname,'platform/qa/unity-integration-v160.js'),'utf8');
// Mirror of WorldViewContract.Validate (prototypes/match-engine-unity/WorldViewContract.cs) plus WorldViewPlayback.FootContact.
function mirror(){
 const fin=n=>typeof n==='number'&&Number.isFinite(n),num=n=>n==null?0:n,vec=v=>Array.isArray(v)&&v.length===3&&v.every(n=>fin(num(n))&&Math.abs(num(n))<=250);
 const footContact=a=>['pass','highPass','cross','shot','freeKick','volley','goalKick','receive','control','tackle'].includes(a);
 const phases=new Set(['live','paused','finished','replay','prematch','preparation']);
 // Non-finite numbers anywhere in the sent picture (before the JSON round trip turns them into 0).
 function nonFinite(x,at,outList){if(typeof x==='number'){if(!Number.isFinite(x))outList.push(at);}else if(Array.isArray(x))x.forEach((v,i)=>nonFinite(v,at+'['+i+']',outList));else if(x&&typeof x==='object')for(const k of Object.keys(x))nonFinite(x[k],at+'.'+k,outList);return outList;}
 return function validate(sent,geometry,numbers){
  const reasons=[];const bad=nonFinite(sent,'picture',[]);for(const b of bad)reasons.push('nonfinite '+b.replace(/\[\d+\]/g,'[]').replace(/^picture\.players\[\]/,'player'));
  const f=JSON.parse(JSON.stringify(sent));const p0=x=>num(x);
  if(!(f.sequence>=1)||p0(f.clock)<0||p0(f.elapsed)<0||!phases.has(f.phase)||!vec(f.ball)||p0(f.ball?.[1])<0||p0(f.ballOpacity)<0||p0(f.ballOpacity)>1||f.score?.length!==2||f.score.some(n=>n<0||n>1000)||!f.camera||!vec(f.camera.position)||!vec(f.camera.target)||p0(f.camera.fov)<5||p0(f.camera.fov)>100||!Array.isArray(f.players)||f.players.length<1||f.players.length>24)reasons.push('picture');
  const ids=new Set();
  for(const p of f.players||[]){
   const why=[];if(!p||!numbers.has(p.id))why.push('identity');else if(ids.has(p.id))why.push('duplicate id');ids.add(p?.id);
   if(!vec(p.position))why.push('position');if(!vec(p.facing))why.push('facing');if((p.contactPoint?.length??0)>0&&!vec(p.contactPoint))why.push('contactPoint');
   if(p.actionId!=null&&p.actionId.length>160)why.push('actionId');const rec=p0(p.recovery);if(rec<0||rec>1)why.push('recovery');
   const fr=p0(p.freshness);if(fr!==-1&&(fr<0||fr>1))why.push('freshness');if(Math.abs(p0(p.progress))>100)why.push('progress');const du=p0(p.duration);if(du<=0||du>30)why.push('duration');
   if(numbers.has(p.id)&&p.number!==numbers.get(p.id))why.push('number');const pk=p0(p.pickup);if(pk!==-1&&(pk<0||pk>1))why.push('pickup');
   if(p.holding&&p.action!=='throw')why.push('holding on '+p.action);if(p.phase&&(p.action!=='goalKick'||p.phase!=='waiting'&&p.phase!=='follow'))why.push('phase '+p.phase+' on '+p.action);
   if(p.actionAtKnown&&(p0(p.actionAt)<0||p0(p.actionAt)>p0(f.clock)+1e-6))why.push('action time');
   if(p.leadAction&&(!footContact(p.leadAction)||p.leadId!=null&&p.leadId.length>160||!vec(p.leadContact)||p0(p.leadIn)<=0||p0(p.leadIn)>1||p0(p.leadSpan)<p0(p.leadIn)||p0(p.leadSpan)>1))why.push('display lead');
   for(const w of why)reasons.push('player '+w);
  }
  if(f.owner&&!ids.has(f.owner))reasons.push('owner');
  if(f.offside&&Math.abs(p0(f.offside.lineX))>geometry.length/2+.001)reasons.push('offside');
  if(f.celebrating&&(p0(f.celebrationTeam)<0||p0(f.celebrationTeam)>1||p0(f.celebrationTime)<0||p0(f.celebrationTime)>60||f.celebrationScorer!=null&&f.celebrationScorer.length>160))reasons.push('celebration');
  if(f.netActive&&(!f.net||Math.abs(p0(f.net.sign))!==1||Math.abs(p0(f.net.z))>geometry.goalWidth/2||p0(f.net.height)<0||p0(f.net.height)>5||p0(f.net.age)<0||p0(f.net.bulge)<0||p0(f.net.bulge)>1.5))reasons.push('net');
  return reasons;
 };
}
(async()=>{
 const {createServer}=require(path.join(root,'work/ui-redesign/serve.cjs'));const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/source/index.html?engine=unity`;
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const report={root,seeds:{},reasons:{},examples:{}};
 try{
  for(const seed of seeds){
   const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base,{timeout:180000});await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter&&window.userMeshyMatchReady,{},{timeout:180000});
   await page.evaluate(helper);await page.evaluate(s=>D6QA160.setup({unity:false,seed:s,replays:false}),seed);
   const r=await page.evaluate(async src=>{
    const validate=(0,eval)('('+src+')')();const C=D6WorldUnityContract,cam={position:{x:0,y:30,height:30,z:-40},target:{x:0,y:0,height:0,z:0},fov:40};
    const geometry=match.geometry||{length:68,width:44,goalWidth:7.32};
    const counts={},examples={};let seq=0,pictures=0;
    const run=await D6QA160.run({minute:999,finished:true,limit:300000,stopWhen:()=>{
     const shown=C.scaled(v98PitchFrame(match),match.geometry),state=v65Context().state;
     const sent=C.picture(shown,'contract',++seq,cam,match.finished?'finished':state.phase,match.score);pictures++;
     const numbers=new Map(sent.players.map(p=>[p.id,p.number]));
     for(const reason of new Set(validate(sent,geometry,numbers))){counts[reason]=(counts[reason]||0)+1;if(!examples[reason]){const who=sent.players.find(p=>p.holding&&p.action!=='throw')||null;examples[reason]={minute:D6QA160.state.minute,clock:sent.clock,player:who&&{id:who.id,action:who.action,actionId:who.actionId,holding:who.holding,progress:who.progress,recovery:who.recovery}};}}
     return false;}});
    return {pictures,counts,examples,score:[...match.score],minute:D6QA160.state.minute,ballRevision:match.attackFlow?.ballRevision??null,finished:run.finished};
   },mirror.toString());
   report.seeds[seed]={...r,errors};for(const [k,v] of Object.entries(r.counts)){report.reasons[k]=(report.reasons[k]||0)+v;report.examples[k]??={seed,...r.examples[k]};}
   console.log(seed,JSON.stringify({pictures:r.pictures,score:r.score,ballRevision:r.ballRevision,rejections:r.counts,errors:errors.length}));
   await page.close();
  }
 }finally{await browser.close();server.close();}
 if(out)fs.writeFileSync(out,JSON.stringify(report,null,1));
 console.log('reasons',JSON.stringify(report.reasons));console.log('examples',JSON.stringify(report.examples));
 const total=Object.entries(report.reasons).filter(([k])=>!k.startsWith('nonfinite')).reduce((a,[,v])=>a+v,0);
 if(expectRejections)assert.ok(total>0,'expected at least one rejected picture');else{assert.equal(total,0,'rejected pictures: '+JSON.stringify(report.reasons));assert.equal(Object.keys(report.reasons).length,0,'non-finite picture values: '+JSON.stringify(report.reasons));}
 for(const s of Object.values(report.seeds))assert.equal(s.errors.length,0,'page errors');
 console.log(expectRejections?'base reproduces the rejection':'0 rejected pictures');
})().catch(e=>{console.error(e);process.exit(1);});
