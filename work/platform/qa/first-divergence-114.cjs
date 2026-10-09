'use strict';
// First native step that differs between "no idle" and "1.5 s idle after the
// checkpoint" (native 2D, seeded D6QAScenario stages). Records a match hash
// after every step following the checkpoint, then the full match JSON (and
// non-JSON engine maps) at the first differing step and the step before it.
// usage: node first-divergence-114.cjs [config=large-5]
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const name=process.argv[2]||'large-5',[size,players]=name.split('-'),config=size==='legacy'?null:{fieldSize:size,fieldPlayers:Number(players)};
const helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
async function run(browser,idle,captureAt=null){
 const p=await browser.newPage();await p.goto('http://127.0.0.1:4521/source/index.html?engine=browser');await p.evaluate(helper);
 return p.evaluate(async([c,idle,captureAt])=>{const Q=D6QA160;
  const ser=v=>JSON.stringify(v,(k,x)=>x instanceof Map?[...x].map(([a,b])=>[a?.pid??a,b]):x instanceof Set?[...x]:(x&&typeof x==='object'&&x.pid&&k&&k!=='people'&&k!=='exitedPeople'?'@'+x.pid:x));
  const maps=()=>{const m=match,g=(w,k)=>{try{return ser(w.get(k))}catch(e){return 'ERR '+e.message}};return{v102:g(v102Motion,m),v121:g(v121PositioningSamples,m),v123ground:g(v123GroundControls,m),v123threat:String(v123DefensiveThreats.get(m)),v115:g(v115KeeperChallenges,m),v124:g(v124AirBalls,m),v99:typeof v99Actions!=='undefined'?g(v99Actions,m):null,restart:(m.setPiece||m.kickoff)?g(v114RestartMoves,m.setPiece||m.kickoff):null};};
  const H=t=>{let h=2166136261;for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619)>>>0;return h.toString(16)};
  await Q.setup({config:c,unity:false,replays:true});await Q.run({minute:20,sampleEvery:3});await Q.pause();await Q.returnLive();await Q.run({stopAtHalftime:true,sampleEvery:30});await Q.run({minute:60,sampleEvery:30});await Q.checkpoint();
  if(idle)await new Promise(r=>setTimeout(r,1500));
  const hashes=[],capture={};let n=0;const outer=step;
  step=function(...a){
   if(captureAt!==null&&n===captureAt-1)capture.before={match:ser(match),maps:maps()};
   const r=outer.apply(this,a);n++;const text=ser(match);hashes.push(H(text)+'|'+H(JSON.stringify(maps())));
   if(captureAt!==null&&n===captureAt)capture.at={match:text,maps:maps()};
   return r;};
  await Q.run({minute:62,sampleEvery:30});step=outer;
  return {hashes,capture};
 },[config,idle,captureAt]).finally(()=>p.close());
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const a=await run(browser,false),b=await run(browser,true);
  const k=a.hashes.findIndex((h,i)=>h!==b.hashes[i]);
  console.log('steps',a.hashes.length,b.hashes.length,'first differing step index',k,k>=0?[a.hashes[k],b.hashes[k]]:'');
  const out={config:name,firstDiff:k};
  if(k>=0){
   const [ca,cb]=[await run(browser,false,k+1),await run(browser,true,k+1)];
   const diffKeys=(x,y)=>{const ox=JSON.parse(x),oy=JSON.parse(y);return Object.keys({...ox,...oy}).filter(key=>JSON.stringify(ox[key])!==JSON.stringify(oy[key]));};
   out.beforeMatchDiff=diffKeys(ca.capture.before.match,cb.capture.before.match);
   out.beforeMapsDiff=Object.keys(ca.capture.before.maps).filter(key=>ca.capture.before.maps[key]!==cb.capture.before.maps[key]);
   out.atMatchDiff=diffKeys(ca.capture.at.match,cb.capture.at.match);
   out.atMapsDiff=Object.keys(ca.capture.at.maps).filter(key=>ca.capture.at.maps[key]!==cb.capture.at.maps[key]);
   out.details={};for(const key of out.beforeMapsDiff)out.details['before.'+key]=[ca.capture.before.maps[key].slice(0,1500),cb.capture.before.maps[key].slice(0,1500)];
   for(const key of out.beforeMatchDiff.slice(0,6))out.details['before.match.'+key]=[JSON.stringify(JSON.parse(ca.capture.before.match)[key]).slice(0,800),JSON.stringify(JSON.parse(cb.capture.before.match)[key]).slice(0,800)];
   for(const key of out.atMapsDiff)out.details['at.'+key]=[ca.capture.at.maps[key].slice(0,3000),cb.capture.at.maps[key].slice(0,3000)];
   console.log(JSON.stringify(out,null,1).slice(0,9000));
  }
  fs.writeFileSync(`outputs/release-114/first-divergence-${name}.json`,JSON.stringify(out,null,1)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
