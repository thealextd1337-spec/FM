'use strict';
// B11/B06/B02 measurement (fix/r132-anim): records real Unity-WebGL matches of the current dist/ build in
// Chrome Desktop. Per rendered picture: the native picture sent to Unity (action, progress, position,
// facing, movement mode/speeds, person heading), the Unity projection poses (clip, base clip, action
// weight, clip time, locomotion mode) and every native foul (victim, offender, sliding). Screenshots of
// the Unity host during foul windows. Pure observation: nothing in the match is changed.
//   node work/record-foul-poses-r132.cjs [--seeds 12345,22222] [--minutes 6] [--out outputs/3d-quality/fix-r132/recordings] [--headless]
// Needs Node 20+ and Playwright (the codex runtime copy is used when present).
const fs=require('node:fs'),path=require('node:path');
const playwrightPath=fs.existsSync('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')?'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright':'playwright';
const {chromium}=require(playwrightPath);
const {createServer}=require('./ui-redesign/serve.cjs');
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback;};
const seeds=String(arg('--seeds','12345')).split(',').map(Number),minutes=Number(arg('--minutes','6')),out=path.resolve(arg('--out','outputs/3d-quality/fix-r132/recordings'));
const headless=process.argv.includes('--headless'),side=arg('--side','home'),port=Number(arg('--port','4216'));
const chrome=['C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
fs.mkdirSync(out,{recursive:true});
const server=createServer();const url=`http://127.0.0.1:${port}/source/index.html`;
async function prepare(page,seedValue){
 await page.goto(url+'?engine=unity');await page.waitForFunction(()=>window.D6WorldUnityContract&&window.D6Flutlicht?.adapter);await page.waitForFunction(()=>window.userMeshyMatchReady,{},{timeout:60000});
 return page.evaluate(async ({side,seedValue})=>{
  let seed=seedValue;window.D6TestRandomCalls=0;Math.random=()=>{window.D6TestRandomCalls++;seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const c=v61CreateCareer('GER-2','r132-foul-recording-'+seedValue),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);if(c.world.market.phase==='budget')v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
  const fixture=v62Fixtures(c).find(f=>!f.result&&(side==='home'?f.homeId===club.id:f.awayId===club.id));
  c.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(c,fixture)};v61CurrentCareer=c;c.world.activeMatch.state.phase='paused';v98View='3d';v65Show(v65Context());clearInterval(v65WorldFrame);
  // In-page recorder: projections from the Unity iframe, pictures as sent, native fouls.
  const rec=window.__d6rec={projections:[],pictures:[],fouls:[],seed:seedValue,fixtureId:fixture.id,motionRevision:match.attackFlow?.motionRevision??null,flowVersion:match.attackFlow?.flowVersion??null,lastSeq:0};
  window.addEventListener('message',e=>{const d=e.data;if(!d||d.channel!=='d6-world-view-1'||d.kind!=='projection'||!Array.isArray(d.poses))return;
   rec.projections.push({seq:d.sequence,clock:+d.clock.toFixed(3),frame:d.renderFrame,t:+performance.now().toFixed(1),poses:d.poses.map(p=>[p.id,p.clip,p.baseClip||'',+p.actionWeight.toFixed(3),+p.time.toFixed(3),p.motion||'',+p.speed.toFixed(2),p.kind||'',p.contact?1:0,+p.stridePhase.toFixed(3)])});});
  const baseFoul=v113FoulContact;v113FoulContact=function(current,victim,offender){rec.fouls.push({clock:+v102Clock(current).toFixed(3),elapsed:+current.elapsed.toFixed(3),victim:victim.pid,offender:offender.pid,sliding:Boolean(offender.slideActive),victimTeam:victim.t,offenderTeam:offender.t,position:{x:+offender.x.toFixed(4),y:+offender.y.toFixed(4)}});window.__d6foulUntil=performance.now()+4200;return baseFoul.apply(this,arguments);};
  const sample=()=>{try{const p=window.D6UnityMatch?.picture;if(p&&p.sequence!==rec.lastSeq){rec.lastSeq=p.sequence;const raw=v98Frame;const byId=new Map((raw?.players||[]).map(q=>[q.id,q]));
    rec.pictures.push({seq:p.sequence,clock:+p.clock.toFixed(3),phase:p.phase,owner:p.owner,turned:p.turned,ball:p.ball.map(v=>+v.toFixed(3)),players:p.players.map(q=>{const r=byId.get(q.id);const m=r?.movement;return [q.id,q.action,q.actionId,+(q.progress??0).toFixed(3),+q.position[0].toFixed(3),+q.position[2].toFixed(3),+q.facing[0].toFixed(3),+q.facing[2].toFixed(3),q.moving?1:0,m?.mode||'',m?+(m.bodySpeed??NaN).toFixed(2):null,m?+(m.positionSpeed??NaN).toFixed(2):null,m?.facing?[+(m.facing.x-r.x).toFixed(3),+(m.facing.z-r.z).toFixed(3)]:null,m?.travelFacing?[+(m.travelFacing.x-r.x).toFixed(3),+(m.travelFacing.z-r.z).toFixed(3)]:null,Number.isFinite(r?.person?.offenseMotion?.heading)?+r.person.offenseMotion.heading.toFixed(3):null,r?.person?.slideActive?1:0,(typeof v108MovementMode==='function'&&r?.person?v108MovementMode(match,r.person)?.mode:null)||'',match.attackFlow?.pendingTurn?.playerId===q.id?1:0,r?.person?.offenseMotion?[+r.person.offenseMotion.vx.toFixed(3),+r.person.offenseMotion.vy.toFixed(3)]:null,r?.person?.keeper?1:0];})});}}catch(e){rec.sampleError=String(e);}
   requestAnimationFrame(sample);};requestAnimationFrame(sample);
  // Visual-check events (screenshots): free-kick wait, kick contacts, a backward Unity stride of a field player, walking.
  window.__d6event=()=>{const piece=match.setPiece;if(piece&&piece.type==='freeKick'&&['waiting','fading','postBanner'].includes(piece.phase))return 'freekick';const pic=D6UnityMatch.picture;const pr=D6UnityMatch.projection;if(!pic)return '';
   if(pic.players.some(q=>['pass','shot','freeKick','highPass'].includes(q.action)&&(q.progress??0)*(q.duration||1)<.15))return 'kick';
   if(pr&&pr.poses.some(x=>x.motion==='back'&&!match.people.find(p=>p.pid===x.id)?.keeper))return 'back';
   if(pr&&pr.poses.some(x=>x.motion==='walk'&&!match.people.find(p=>p.pid===x.id)?.keeper))return 'walk';return '';};
  return {fixtureId:fixture.id,ownId:club.id,ownSide:v65Context().ownSide,ids:match.people.map(p=>p.pid),motionRevision:rec.motionRevision,flowVersion:rec.flowVersion};
 },{side,seedValue});
}
async function waitPicture(page){await page.waitForFunction(()=>D6UnityMatch?.ready&&D6UnityMatch.lastAck?.sequence>=D6UnityMatch.picture?.sequence-1,{},{timeout:180000});}
(async()=>{
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:chrome,headless,args:headless?['--enable-webgl','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']:['--ignore-gpu-blocklist']});
 const summary=[];
 try{
  for(const seedValue of seeds){
   const page=await browser.newPage({viewport:{width:1440,height:950}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const first=await prepare(page,seedValue);console.log('seed',seedValue,'fixture',first.fixtureId,'motionRevision',first.motionRevision,'flowVersion',first.flowVersion);
   await waitPicture(page);console.log('Unity ready');
   await page.evaluate(({camera,near})=>{if(camera)v98CameraMode=camera;if(Number.isFinite(near))v98CameraNear=near;v103CanReplay=()=>false;v65Resume();},{camera:arg('--camera',null),near:Number(arg('--near','NaN'))});
   const started=Date.now();let shots=0;const counts={};const shotDir=path.join(out,'seed-'+seedValue);fs.mkdirSync(shotDir,{recursive:true});let lastShot=0;
   while(Date.now()-started<minutes*60000){
    await page.waitForTimeout(120);
    const state=await page.evaluate(()=>({phase:v65Context()?.state.phase,finished:match.finished,half:match.halftimePause,foulUntil:window.__d6foulUntil||0,now:performance.now(),elapsed:match.elapsed,fouls:window.__d6rec.fouls.length,pictures:window.__d6rec.pictures.length,projections:window.__d6rec.projections.length,active:D6UnityMatch.active,error:D6UnityMatch.lastError}));
    if(state.finished)break;
    if(state.error){console.log('Unity error',state.error);break;}
    if(state.phase==='paused'){await page.evaluate(()=>{v65Resume();});continue;}
    const event=state.foulUntil>state.now?'foul':await page.evaluate(()=>window.__d6event?window.__d6event():'');
    const gap={foul:160,freekick:400,kick:300,back:300,walk:1500}[event]||0,cap={foul:400,freekick:60,kick:60,back:60,walk:30}[event]||0;counts[event]=counts[event]||0;
    if(event&&state.now-lastShot>gap&&counts[event]<cap){lastShot=state.now;const host=await page.$('#d6-unity-host');if(host){const clock=await page.evaluate(()=>D6UnityMatch.picture?.clock);await host.screenshot({path:path.join(shotDir,`${event}-${String(counts[event]).padStart(3,'0')}-clock-${Number(clock).toFixed(2)}.png`)});counts[event]++;shots++;}}
   }
   const rec=await page.evaluate(()=>window.__d6rec);const stats=await page.evaluate(()=>({elapsed:match.elapsed,score:[...match.score],finished:match.finished,fouls:match.setPieceStats?.fouls}));
   const file=path.join(out,`recording-${seedValue}.json`);fs.writeFileSync(file,JSON.stringify({...rec,first,stats,errors,minutes,chrome,headless,unityRuntime:sha('dist/unity-match/runtime.js'),bridge:sha('dist/world-unity-v151.js')}));
   console.log('seed',seedValue,'elapsed',stats.elapsed.toFixed(1),'score',stats.score,'fouls',rec.fouls.length,'pictures',rec.pictures.length,'projections',rec.projections.length,'shots',shots,'errors',errors.length,'->',file);
   summary.push({seed:seedValue,fixture:first.fixtureId,fouls:rec.fouls,pictures:rec.pictures.length,projections:rec.projections.length,shots,errors});
   await page.close();
  }
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,1));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
function sha(file){return require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
