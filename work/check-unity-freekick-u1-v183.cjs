'use strict';
// U-1 (player intelligence 183): records a native free kick in the actual Unity WebGL view. The same seeded fixture as
// work/platform/qa/check-world-unity.cjs (new match, so the SI packages of new matches are on). Run 1 steps the match
// (no view) until the first foul and notes its tick. Run 2 replays the identical match to 1 s before it and then sends
// every native picture to Unity one by one, waiting for Unity's acknowledgment and rendered projection, until the free
// kick is taken and 1 s after. Recorded per picture: native clock, actions, set piece, the picture's player positions,
// teleports (a player displaced more than 0.6 m and faster than 12 m/s within one picture; a cut over 10 m in
// WorldViewPlayback.Cut), and Unity's rendered projection (displayed clock, per actor motion mode, speed and clip).
// Screenshots before and after each teleport picture. Observation only.
//   node work/check-unity-freekick-u1-v183.cjs [--port 4259] [--out work/u1/freekick] [--browser edge|chrome]
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('./ui-redesign/serve.cjs');
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback;};
const port=Number(arg('--port',4259)),out=path.resolve(arg('--out','work/u1/freekick'));
const browserPath=arg('--browser','edge')==='chrome'?'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
fs.mkdirSync(out,{recursive:true});
const server=createServer(),url=`http://127.0.0.1:${port}/source/index.html`;
async function prepare(page,engine){
 await page.goto(url+'?engine='+engine);await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter);await page.waitForFunction(()=>window.userMeshyMatchReady,{},{timeout:45000});
 return page.evaluate(async()=>{
  let seed=12345;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const c=v61CreateCareer('GER-2','world-unity-integration'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);if(c.world.market.phase==='budget')v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
  const fixture=v62Fixtures(c).find(f=>!f.result&&f.homeId===club.id);
  c.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(c,fixture)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);
  window.D6QAWorldTick=(real)=>{step(real*MATCH_SPEED,real);const context=v65Context();if(context.state.phase==='live'&&!match.finished)v65AfterStep(context);};
  v103CanReplay=()=>false;v65Resume();clearInterval(v65WorldFrame);
  window.D6U1Fouling=()=>{const f=v98PitchFrame(match);return f.players.some(p=>['foulVictim','foulOffender'].includes(p.action?.kind));};
  return {fixtureId:fixture.id,si:match.si?{packages:{...match.si.packages},clockRate:match.si.clockRate}:null};
 });
}
(async()=>{
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:browserPath,headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={port,browser:browserPath,errors:[],run1:null,pictures:[],teleports:[],checks:[]};
 try{
  // Run 1: the native match without a view, to the first foul.
  {const page=await browser.newPage();page.on('pageerror',e=>report.errors.push('run1: '+e.message));const setup=await prepare(page,'browser');
   report.run1={...setup,...await page.evaluate(()=>{let ticks=0;while(!D6U1Fouling()&&!match.finished&&ticks<20000){D6QAWorldTick(.05);ticks++;}return {foulTick:ticks,clock:match.elapsed,fouling:D6U1Fouling()};})};
   await page.close();console.log('run 1',JSON.stringify(report.run1));if(!report.run1.fouling)throw new Error('no foul in the fixture');}
  // Run 2: the identical match in Unity, picture by picture around the free kick.
  const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>report.errors.push('run2: '+e.message));
  const setup=await prepare(page,'unity');report.run2={...setup};
  await page.waitForFunction(()=>D6UnityMatch?.ready&&D6UnityMatch.lastAck?.sequence>=D6UnityMatch.picture?.sequence-1,{},{timeout:120000});
  const lead=20,start=Math.max(0,report.run1.foulTick-lead);
  await page.evaluate(n=>{for(let i=0;i<n;i++)D6QAWorldTick(.05);},start);
  let kicked=-1,teleportShots=0;
  for(let k=0;k<400;k++){
   const pic=await page.evaluate(()=>{D6QAWorldTick(.05);draw();const p=D6UnityMatch.picture;const sp=match.setPiece;return {sequence:p.sequence,clock:p.clock,phase:p.phase,owner:p.owner,ball:p.ball,players:p.players.map(q=>({id:q.id,action:q.action,position:q.position,moving:q.moving,progress:q.progress,duration:q.duration,durationKnown:Boolean(q.durationKnown)})),setPiece:sp?{type:sp.type,phase:sp.phase??null}:null,fouling:D6U1Fouling()};});
   await page.waitForFunction(seq=>D6UnityMatch.lastAck?.sequence>=seq,pic.sequence,{timeout:60000});
   const prev=report.pictures.at(-1);let teleport=null;
   if(prev&&pic.clock-prev.clock>0&&pic.clock-prev.clock<.2){const dt=pic.clock-prev.clock,moved=[];let max=0;
    for(let i=0;i<pic.players.length;i++){const a=prev.players[i].position,b=pic.players[i].position,d=Math.hypot(b[0]-a[0],b[2]-a[2]);max=Math.max(max,d);if(d>.6&&d>12*Math.max(dt,1e-3))moved.push({id:pic.players[i].id,metres:+d.toFixed(2),from:prev.players[i].action,to:pic.players[i].action});}
    if(moved.length)teleport={clock:pic.clock,dt:+dt.toFixed(3),max:+max.toFixed(2),cut:max>10,moved};}
   if(teleport&&teleportShots<6){await page.screenshot({path:path.join(out,`teleport-${teleportShots}-a.png`)});}
   // The projection Unity renders after this picture (displayed clock, poses).
   const projection=await page.waitForFunction(seq=>{const p=D6UnityMatch.projection;return p&&p.sequence>=seq?p:null;},pic.sequence,{timeout:60000}).then(h=>h.jsonValue()).catch(()=>null);
   const shown=projection?{sequence:projection.sequence,clock:projection.clock,poses:(projection.poses||[]).map(q=>({id:q.id,motion:q.motion,speed:+(q.speed||0).toFixed(2),clip:q.clip}))}:null;
   report.pictures.push({...pic,shown});
   if(teleport){
    // Moved actors in the first projection rendered after the picture: no stride over the jump.
    teleport.shown=shown?teleport.moved.map(m=>{const q=shown.poses.find(p=>p.id===m.id);return {id:m.id,motion:q?.motion,speed:q?.speed,clip:q?.clip};}):null;teleport.shownClock=shown?.clock??null;
    report.teleports.push(teleport);
    if(teleportShots<6){await page.waitForTimeout(150);await page.screenshot({path:path.join(out,`teleport-${teleportShots}-b.png`)});teleportShots++;}
   }
   if(pic.setPiece?.type==='freeKick')report.sawFreeKick=true;
   if(report.sawFreeKick&&kicked<0&&!pic.setPiece&&!pic.fouling)kicked=k;
   if(kicked>=0&&k-kicked>=20)break;
  }
  report.kickedAt=kicked>=0?report.pictures[kicked]?.clock:null;
  const check=(name,ok)=>{report.checks.push({name,ok});console.log(ok?'ok  ':'FAIL',name);};
  check('the recorded segment contains the native free kick and its release',report.sawFreeKick===true&&kicked>=0);
  check('Unity acknowledged every recorded picture',report.pictures.every(p=>p.shown!==null));
  check('teleport pictures were recorded',report.teleports.length>0);
  check('a teleported actor never shows a stride over its jump in the first rendered picture (speed below 1 m/s)',report.teleports.every(t=>(t.shown||[]).every(q=>q.speed<1)));
  check('no uncaught page errors',report.errors.length===0);
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'freekick-u1.json'),JSON.stringify(report,null,1));}
 console.log('teleports',JSON.stringify(report.teleports.map(t=>({clock:t.clock,max:t.max,cut:t.cut,moved:t.moved.length,shownClock:t.shownClock,shown:t.shown}))));
 if(report.checks.some(c=>!c.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
