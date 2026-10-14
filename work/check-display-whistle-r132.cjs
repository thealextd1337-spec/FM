'use strict';
// Actual native shots and fixture-owned display identity, source/build. Node >=20.
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=process.argv.includes('--baseline'),build=process.argv.includes('--build'),unity=process.argv.includes('--unity');
(async()=>{
 const server=process.argv.includes('--external-server')?null:require('./ui-redesign/serve.cjs').createServer();if(server)await new Promise(r=>server.listen(4213,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(baseline){const {execFileSync}=require('node:child_process');await page.route('**/source/*.js',route=>{const file=new URL(route.request().url()).pathname.slice(8);if(!['game.js','presentation-v25.js','halftime-v14.js','pitch-motion-v102.js','world-physical-v65.js','world-goal-replay-v103.js','world-pitch-actions-v99.js','world-pitch3d-v98.js','world-ball-motion-v110.js'].includes(file))return route.continue();return route.fulfill({body:execFileSync('git',['show','f2458c1fb981a68d13c50df6d4356c9fdb30a957:dist/'+file],{maxBuffer:8000000}),contentType:'text/javascript'});});}
  await page.goto(build?pathToFileURL(path.resolve('outputs/index.html')).href:'http://127.0.0.1:4213/source/index.html?engine='+(unity?'unity':'browser'));
  await page.waitForFunction(()=>v61StorageReady&&window.d6Pitch3D);await page.evaluate(async()=>{await window.D6UserModelReady;});
  const report=await page.evaluate(async({unity})=>{
   const originalRandom=Math.random;let rng=13213;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
   const c=v61CreateCareer('GER-2','display-whistle-r132','Display QA'),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
   const fixture=v62Fixtures(c).filter(f=>!f.result&&f.awayId===club.id).sort((a,b)=>a.day-b.day)[0];
   c.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(c,fixture)};v61CurrentCareer=c;const state=c.world.activeMatch.state;state.phase='paused';state.tactics[0].formation='2-2-1';state.tactics[1].formation='1-2-2';v98View=unity?'3d':'2d';v65Show(v65Context());clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();v103CanReplay=()=>false;if(unity){for(let i=0;i<240&&!D6UnityMatch.ready&&!D6UnityMatch.lastError;i++)await new Promise(r=>setTimeout(r,250));if(!D6UnityMatch.ready)throw Error('Unity unavailable: '+D6UnityMatch.lastError);}
   // Controlled time jumps do not exercise fatigue/performance booking; the
   // separate P02 regression runs complete native intervals without jumps.
   delete state.playerLoad;delete state.playerPerformance;v65BookWorldMatch=()=>{};v65ShowPostMatch=()=>{};
   const setup=()=>{v65CreateMatch(v65Context());Object.assign(match,{kickoff:null,pendingKickoff:null,postBanner:null,countdown:0,goalPause:0,halftimePause:0,owner:null,flight:null,setPiece:null,throwIn:null,rebound:null});state.phase='live';running=true;};
   const prep=document.createElement('div');prep.innerHTML=v64UiScreenHTML(c,fixture,state);const preparation={names:[...prep.querySelectorAll('.v64-board-club>strong')].map(n=>n.textContent),crests:prep.querySelectorAll('.v61-crest').length};
   // Controlled native stepping stays in 2D; Unity's acknowledgement gate
   // is covered by the separate complete-match parity run.
   v98View='2d';const shots=[];
   try{
    // Search real, seeded v55Shoot results, including both native directions.
    for(const team of [0,1])for(const end of ['half','final']){
     const found=new Set();
     for(let attempt=0;attempt<240&&found.size<4;attempt++){
      setup();const shooter=match.people.find(p=>p.t===team&&!p.keeper),keeper=match.people.find(p=>p.t!==team&&p.keeper);
      for(const p of match.people.filter(p=>!p.keeper&&p!==shooter)){p.x=.08;p.y=.5;}
      shooter.x=.5;shooter.y=team===0?.24:.76;shooter.n=attempt%3;keeper.x=.5;keeper.y=team===0?v55Field.top+.015:v55Field.bottom-.015;match.owner=shooter;match.ball={x:shooter.x,y:shooter.y};match.elapsed=(end==='half'?(match.firstHalfEnd||37.5):(match.fullTimeEnd||75))-.001;if(end==='final'){match.halftime=true;match.halftimeBreakDone=true;}
      v55Shoot(shooter);const flight=match.flight,release=flight&&v99Flights.get(flight);if(!release)continue;
      const kind=release.goal?'goal':release.onTarget?'save':release.over?'high':'wide';if(found.has(kind))continue;found.add(kind);
      const trace=[],record=label=>{const frame=v98PitchFrame(match);trace.push({label,elapsed:match.elapsed,flight:Boolean(match.flight),finished:Boolean(match.finished),half:Boolean(match.halftimeBreakDone),pause:match.halftimePause,missAge:v99Actions.get(match)?.miss?.age??null,nativeBall:{...match.ball},score:[...match.score],rng,view:v99BallView(match),shotView:v119VisibleShotBall(match),frameBall:frame.ball,outOfPlayBall:frame.outOfPlayBall});};
      record('release');if(end==='half')beginHalftimeBreak();else v65Finish();record('deferred-whistle');
      // Engine flight stepping and callback, never a replacement outcome.
      let ticks=0;while(match.flight&&ticks++<200)step(.02*MATCH_SPEED,.02);
      record('flight-end');while(match.goalPause>0&&ticks++<700)step(.02*MATCH_SPEED,.02);
      if(end==='half')beginHalftimeBreak();else v65Finish();record('whistle');
      running=false;const beforePause=JSON.stringify(match);record('tactics-pause');const frozen=beforePause===JSON.stringify(match);
      if(end==='half'){startSecondHalf();record('resume');running=true;let passes=0;while(!match.flight&&passes++<600)step(.02*MATCH_SPEED,.02);record('first-kickoff-pass');}
      const boundary=trace.find(p=>p.label==='whistle'),resume=trace.find(p=>p.label==='resume');
      shots.push({team,end,kind,attempt,ticks,frozen,trace,clean:boundary.missAge===null&&boundary.view===null&&boundary.shotView===null&&!boundary.outOfPlayBall&&(!resume||resume.missAge===null&&resume.view===null&&resume.shotView===null),releasedDrained:!trace.find(p=>p.label==='flight-end').flight});
     }
     if(found.size!==4)throw Error('Missing native outcome '+team+'/'+end+': '+[...found]);
    }
    setup();v98View=unity?'3d':'2d';running=false;state.phase='paused';Object.assign(match,{elapsed:12,score:[2,1],shots:[9,4],possession:[30,70]});
    for(const p of match.people){p.stats.passes=0;p.stats.passComplete=0;}for(const t of [0,1]){const p=match.people.find(p=>p.t===t&&!p.keeper);p.stats.passes=5;p.stats.passComplete=t===0?4:2;}
    const scorers=[0,1].map(t=>match.people.find(p=>p.t===t&&!p.keeper));match.goals=[{team:0,pid:scorers[0].pid,name:scorers[0].name,minute:12},{team:0,pid:scorers[0].pid,name:scorers[0].name,minute:19},{team:1,pid:scorers[1].pid,name:scorers[1].name,minute:7}];
    const rows=[],expectedNames=[fixture.homeId,fixture.awayId].map(id=>c.world.clubs.find(q=>q.id===id).name),expectedScorers=[v25Surname(scorers[1].name),v25Surname(scorers[0].name)];
    const sample=async label=>{const before=JSON.stringify(match),randomBefore=rng;if(unity){const session=D6UnityMatch.session,sequence=D6UnityMatch.picture?.sequence||0;draw();for(let i=0;i<240;i++){await new Promise(r=>setTimeout(r,100));const p=D6UnityMatch.picture;if(D6UnityMatch.ready&&p?.elapsed===match.elapsed&&(D6UnityMatch.session!==session||p.sequence>sequence)&&p.score.join(',')===match.score.join(','))break;if(i===239)throw Error('Unity picture not acknowledged: '+label+' '+D6UnityMatch.lastError);}}updateTeamStats();const frame=v98PitchFrame(match);v132BroadcastUI(frame);const clone=document.createElement('div');clone.innerHTML=v65PausePitch(v65Context());
     const row={label,unityPicture:unity?{score:D6UnityMatch.picture.score,players:D6UnityMatch.picture.players.map(p=>p.id),expectedPlayers:match.people.map(p=>p.pid),ready:D6UnityMatch.ready,ack:D6UnityMatch.lastAck?.sequence}:null,names:[...document.querySelectorAll('#match-area .score-name-text')].map(n=>n.textContent),score:$('#score').childNodes[0].textContent,scorers:[...document.querySelectorAll('#match-area .goal-list')].map(n=>n.textContent),formations:[...document.querySelectorAll('#match-area .score-team>small')].map(n=>n.textContent),shirts:[...document.querySelectorAll('#match-area .score-shirt')].map(n=>[...n.querySelectorAll('[fill]')].map(p=>p.getAttribute('fill'))),expectedShirts:[1,0].map(t=>{const n=document.createElement('div');n.innerHTML=v44ShirtSVG(null,matchKit(t),'Spieltrikot');return [...n.querySelectorAll('[fill]')].map(p=>p.getAttribute('fill'));}),expectedFormations:[...state.tactics].map(t=>t.formation),tv:frame.broadcast,expectedTVColours:[match.kits.opponent.main,match.kits.user.main],tvNames:[...document.querySelectorAll('#v132-tv [data-tv-team]')].map(n=>n.title),pauseScore:clone.querySelector('.scoreboard>strong').textContent,pauseNames:[...clone.querySelectorAll('.score-name-text')].map(n=>n.textContent),stats:['shots','possession','pass-rate'].map(id=>[...document.querySelectorAll('#'+id+' [data-stat-value]')].map(n=>n.textContent)),unchanged:JSON.stringify(match)===before&&rng===randomBefore};rows.push(row);
    };
    await sample('before-half');beginHalftimeBreak();await sample('half-pause');startSecondHalf();await sample('second-half');match.kickoff=null;match.flight=null;v65Snapshot(v65Context());
    // Real serialized native checkpoint, fresh object identity and derived fixture side.
    const saved=JSON.parse(JSON.stringify(c));v61CurrentCareer=saved;match=null;v65WorldActive=v65Context();if(!v65Restore(v65Context()))throw Error('Restore failed');await sample('saved-reload');
    return {unity,preparation,fixture:{homeId:fixture.homeId,awayId:fixture.awayId,managedClubId:club.id},expectedNames,expectedScorers,shots,rows};
   }finally{Math.random=originalRandom;running=false;clearInterval(v65WorldFrame);v102StopPaint();}
  },{unity});
  if(!baseline){
   const savedId=await page.evaluate(async()=>{const c=v61CurrentCareer,f=v64ActiveFixture(c);c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};const ctx=v65Context();ctx.state.phase='paused';v65WorldActive=ctx;v65CreateMatch(ctx);Object.assign(match,{elapsed:12,score:[2,1],kickoff:null,pendingKickoff:null,countdown:0,postBanner:null});ctx.state.score=[1,2];v65Snapshot(ctx);await v61SaveCareers([c]);await v61WaitForStorage();return c.id;});
   await page.reload();await page.waitForFunction(()=>v61StorageReady&&window.d6Pitch3D);
   report.persistentReload=await page.evaluate(async({id,unity})=>{await window.D6UserModelReady;v61CurrentCareer=v61ReadCareers().find(c=>c.id===id);if(!v61CurrentCareer)throw Error('Saved career missing');v98View=unity?'3d':'2d';v65Show(v65Context());clearInterval(v65WorldFrame);v102StopPaint();running=false;if(unity){for(let i=0;i<240&&!D6UnityMatch.ready&&!D6UnityMatch.lastError;i++)await new Promise(r=>setTimeout(r,250));if(!D6UnityMatch.ready)throw Error('Unity after persisted reload unavailable: '+D6UnityMatch.lastError);}updateTeamStats();v132BroadcastUI(v98PitchFrame(match));return{unityReady:unity?D6UnityMatch.ready:null,unityScore:unity?D6UnityMatch.picture.score:null,names:[...document.querySelectorAll('#match-area .score-name-text')].map(n=>n.textContent.replace(/ \(\d+\.\)$/,'')),score:$('#score').textContent,nativeScore:[...match.score],tv:v132Broadcast(match),phase:v65Context().state.phase};},{id:savedId,unity});
   assert.deepEqual(report.persistentReload.names,report.expectedNames);assert.equal(report.persistentReload.score,'1 : 2');assert.deepEqual(report.persistentReload.nativeScore,[2,1]);assert.deepEqual(report.persistentReload.tv.score,[1,2]);if(unity){assert(report.persistentReload.unityReady);assert.deepEqual(report.persistentReload.unityScore,[2,1]);}
  }
  const crypto=require('node:crypto'),files=['dist/game.js','dist/halftime-v14.js','dist/presentation-v25.js','dist/world-physical-v65.js','dist/world-pitch-actions-v99.js','dist/pitch-motion-v102.js','dist/world-ball-motion-v110.js','dist/world-pitch3d-v98.js','dist/world-goal-replay-v103.js',__filename];
  const sourceHashes=Object.fromEntries(files.map(f=>[path.relative(process.cwd(),path.resolve(f)).replaceAll('\\','/'),crypto.createHash('sha256').update(baseline&&f.startsWith('dist/')?require('node:child_process').execFileSync('git',['show','f2458c1fb981a68d13c50df6d4356c9fdb30a957:'+f],{maxBuffer:8000000}):fs.readFileSync(f)).digest('hex')]));
  const native=r=>r.shots.map(s=>({team:s.team,end:s.end,kind:s.kind,attempt:s.attempt,ticks:s.ticks,trace:s.trace.map(({label,elapsed,flight,finished,half,pause,nativeBall,score,rng})=>({label,elapsed,flight,finished,half,pause,nativeBall,score,rng}))}));
  if(!baseline&&fs.existsSync('outputs/r132-display/baseline.json')){assert.deepEqual(native(report),native(JSON.parse(fs.readFileSync('outputs/r132-display/baseline.json','utf8')).report));report.nativeTraceAndRngUnchanged=true;}
  fs.mkdirSync('outputs/r132-display',{recursive:true});fs.writeFileSync('outputs/r132-display/'+(baseline?'baseline':unity?'unity':build?'build':'source')+'.json',JSON.stringify({report,errors,baselineReference:baseline?'f2458c1fb981a68d13c50df6d4356c9fdb30a957':null,sourceHashes},null,2)+'\n');
  console.log(JSON.stringify({baseline,build,unity,shots:report.shots.map(s=>({team:s.team,end:s.end,kind:s.kind,clean:s.clean})),rows:report.rows.map(r=>({label:r.label,score:r.score,names:r.names})),errors}));
  assert.deepEqual(errors,[]);if(!baseline||process.argv.includes('--expect-clean')){assert.deepEqual(report.preparation.names.map(n=>n.replace(/ \(\d+\.\)$/,'')),report.expectedNames);assert.equal(report.preparation.crests,2);assert.equal(report.shots.length,16);for(const s of report.shots){assert(s.releasedDrained);assert(s.clean,'Stale picture after whistle: '+s.team+'/'+s.end+'/'+s.kind);assert(s.frozen);}for(const r of report.rows){assert.deepEqual(r.names.map(n=>n.replace(/ \(\d+\.\)$/,'')),report.expectedNames);assert.equal(r.score,'1 : 2');assert.deepEqual(r.tv.score,[1,2]);assert.deepEqual(r.tv.names,report.expectedNames);assert.deepEqual(r.tv.colours,r.expectedTVColours);assert.deepEqual(r.tvNames,report.expectedNames);assert.deepEqual(r.shirts,r.expectedShirts);assert.deepEqual(r.formations,r.expectedFormations);assert.deepEqual(r.stats[0],['4','9']);assert.deepEqual(r.stats[1],['70 %','30 %']);assert.deepEqual(r.stats[2],['40 %','80 %']);assert(r.scorers.every((s,i)=>s.includes(report.expectedScorers[i])));assert.deepEqual(r.pauseNames,r.names);assert.equal(r.pauseScore,'1 : 2');assert(r.unchanged);if(unity){assert(r.unityPicture.ready);assert.deepEqual(r.unityPicture.score,[2,1]);assert.deepEqual(r.unityPicture.players,r.unityPicture.expectedPlayers);assert(r.unityPicture.ack>0);}}}
 }finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
