'use strict';
// Read-only production diagnosis. The controlled fixture uses actual native
// shooting/outcome callbacks and actual Unity picture projection; no build/device.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),baseline=Boolean(process.env.D6_QA_BEFORE_NET),out=path.join(root,'outputs/3d-quality/goal-net-diagnosis-v119/'+(baseline?'native-before.json':'native.json')),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const files=['dist/pitch-v55.js','dist/world-pitch-actions-v99.js','dist/world-corner-ball-v109.js','dist/world-ball-motion-v110.js','dist/world-player-load-v158.js','dist/world-goal-scene-v83.js','dist/world-pitch3d-v98.js','dist/world-unity-v151.js','prototypes/match-engine-unity/ProbeBridge.cs','prototypes/match-engine-unity/WorldViewBridge.cs','prototypes/match-engine-unity/FootballPresentation.cs'];
const report={scope:'Controlled native goal and received-picture contact geometry. Screenshot alone has no flight/score facts; no claim of reproducing the exact Ross event.',hashes:Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))])),cases:[],errors:[]};
const old={};if(baseline){
 const f='dist/world-pitch3d-v98.js',source=fs.readFileSync(path.join(root,f),'utf8');old[f]=source.slice(0,source.indexOf('// Visible goal-tail contact'))+source.slice(source.indexOf('function v98PitchFrame('));old[f]=old[f].replace('v119VisibleGoalView(current)?.ball||','');
 const b='dist/world-unity-v151.js';old[b]=fs.readFileSync(path.join(root,b),'utf8').replace(/const view=.*?,p=view\?\.contact\|\|v83GoalPosition\(current\.goalScene\)/,"const p=v83GoalPosition(current.goalScene)").replace("if(!view||view.hit==='rear')frame.net=","frame.net=").replace('height:view?.height??.8,age:view?.age??current.goalScene.elapsed,bulge:view?.bulge??p.bulge','height:.8,age:current.goalScene.elapsed,bulge:p.bulge');
 assert.equal(hash(old[f]),'90e1e3604eb3b8c213e83bbe416aac5fac9341beaed14a78709cdd9c156a8d12','Exact pre-fix v98 source reconstruction');assert.equal(hash(old[b]),'25756fc16b98d66ac6752bad45e9d147f73a37c28b6f368edadf9f5307a8e0a7','Exact pre-fix v151 source reconstruction');report.loadedBeforeHashes=Object.fromEntries(Object.entries(old).map(([f,s])=>[f,hash(s)]));
}
(async()=>{
 const server=require('./ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
 try{
  for(const size of ['standard','large']){
   const context=await browser.newContext(),p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));for(const [f,body]of Object.entries(old))await p.route('**/'+path.basename(f)+'*',r=>r.fulfill({body,contentType:'text/javascript'}));
   await p.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=unity&players=wave3`);await p.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
   report.cases.push(...await p.evaluate(async size=>{
    Math.random=()=>.5;
    const c=v61CreateCareer('GER-2','net119-'+size,'Goal QA',undefined,{fieldSize:size,fieldPlayers:5}),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
    const f=v62Fixtures(c).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0],state=v64MakeState(c,f);c.world.activeMatch={fixtureId:f.id,state};v61CurrentCareer=c;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);v103CanReplay=()=>false;draw=()=>{};
    const result=[],m=match;
    for(const team of [0,1])for(const range of [5,10,18])for(const variant of [0,1,2])for(const turned of [false,true]){
     const shooter=m.people.find(q=>!q.keeper&&q.t===team),keeper=m.people.find(q=>q.keeper&&q.t!==team),sy=v160PitchLength()/(v55Field.bottom-v55Field.top),line=team===0?v55Field.top:v55Field.bottom,direction=team===0?1:-1;
     for(const q of m.people){q.x=.9;q.y=.5;}shooter.x=.5;shooter.y=line+direction*range/sy;keeper.x=.8;keeper.y=line;m.owner=shooter;m.ball={x:shooter.x,y:shooter.y};m.kickoff=null;m.setPiece=null;m.throwIn=null;m.rebound=null;m.flight=null;m.goalPause=0;m.goalScene=null;m.postBanner=null;m.halftimePause=0;m.halftimeBreakDone=turned;v99Actions.delete(m);
     shooter.fin=shooter.tec=20;shooter.stats.shots=(variant-shooter.n-1+30)%3;let draws=0;Math.random=()=>draws++===0?.5:0;
     v55Shoot(shooter);const flight=m.flight,release=flight&&v99Flights.get(flight);if(!release?.goal)throw Error('Controlled actual native scoring shot missing');
     // Native flight completion seam: the existing engine places the endpoint,
     // clears flight and invokes this same production callback.
     const before=m.goals.length;flight.progress=1;m.ball={...flight.target};m.flight=null;flight.done();
     const travel=v99Actions.get(m).goalTravel,g=m.geometry,rad=.1764,visible=typeof v119VisibleGoalView==='function'?v119VisibleGoalView(m):null,impact=visible?.impact??travel.impact,hit=visible?.hit??travel.hit;
     const nativeBefore=JSON.stringify({score:m.score,goals:m.goals,flight,release,ball:m.ball,travel}),drawsBefore=draws;
     const samples=[];
     for(const t of [0,impact,impact+.04,.6,1.5,2.45,4.05]){
      m.goalScene.elapsed=t;
      const view=v99BallView(m),frame=v98PitchFrame(m),scaled=D6WorldUnityContract.scaled(frame,g),packet=D6WorldUnityContract.picture(scaled,'controlled',1,{position:{x:0,z:30},target:{x:0,z:0},fov:42},'goal',m.score);
      const depth=Math.abs(packet.ball[0])-g.length/2,y=packet.ball[1]-(.29-rad)*Math.max(0,Math.min(1,1-(packet.ball[1]-.29)));
      samples.push({t,ball:packet.ball,depth,net:packet.net,contactClearance:{rear:2.2-depth-rad,side:g.goalWidth/2-Math.abs(packet.ball[2])-rad,roof:g.goalHeight-y-rad},native:view});
     }
     m.goalScene.elapsed=0;
     const readOnly=JSON.stringify({score:m.score,goals:m.goals,flight,release,ball:m.ball,travel})===nativeBefore;
     m.goalPause=0;m.goalScene=null;m.postBanner={kind:'goal'};
     const postFrame=D6WorldUnityContract.scaled(v98PitchFrame(m),g),postDepth=Math.abs(postFrame.ball.x)-g.length/2,postY=postFrame.ball.height-(.29-rad)*Math.max(0,Math.min(1,1-(postFrame.ball.height-.29))),postClearance={rear:2.2-postDepth-rad,side:g.goalWidth/2-Math.abs(postFrame.ball.z)-rad,roof:g.goalHeight-postY-rad};
     const negatives=[];if(typeof v119VisibleGoalView==='function'){
      m.finished=true;negatives.push(v119VisibleGoalView(m)===null);m.finished=false;m.postBanner=null;negatives.push(v119VisibleGoalView(m)===null);
      m.goalPause=1;m.goalScene={team,x:.5,elapsed:0};const st=v99Actions.get(m),old=st.goalTravel;delete st.goalTravel;negatives.push(v119VisibleGoalView(m)===null);st.goalTravel=old;
      m.goalPause=0;m.goalScene=null;m.postBanner={kind:'save'};negatives.push(v119VisibleGoalView(m)===null);m.postBanner={kind:'goal'};
     }
     result.push({size,team,range,variant,turned,geometry:g,onTarget:release.onTarget,goal:release.goal,parry:release.parry??null,bookedGoalDelta:m.goals.length-before,height:release.endHeight,travel,visibleContact:{impact,hit},samples,postBanner:{clearance:postClearance,visible:typeof v119VisibleGoalView==='function'&&!!v119VisibleGoalView(m)},negatives,nativeDigest:nativeBefore,renderAddsNoDraws:draws===drawsBefore,renderDoesNotMutateNative:readOnly});
    }
    running=false;clearInterval(v65WorldFrame);return result;
   },size));await context.close();
  }
  assert.equal(report.cases.length,72);assert.deepEqual(report.errors,[]);
  for(const row of report.cases){assert(row.onTarget&&row.goal&&row.bookedGoalDelta===1&&row.renderAddsNoDraws&&row.renderDoesNotMutateNative);assert(row.samples.every(s=>Number.isFinite(s.depth)));}
  const premature=report.cases.filter(r=>r.samples[1].contactClearance[r.visibleContact.hit]>.05),escaped=report.cases.filter(r=>r.samples.some(s=>Math.min(...Object.values(s.contactClearance))< -1e-8));
  report.findings={prematureContactCases:premature.length,escapingNetCases:escaped.length,hitTypes:[...new Set(report.cases.map(r=>r.visibleContact.hit))],minImpactSeconds:Math.min(...report.cases.map(r=>r.visibleContact.impact)),maxImpactSeconds:Math.max(...report.cases.map(r=>r.visibleContact.impact)),actualGoalHeight:[...new Set(report.cases.map(r=>r.geometry.goalHeight))],clearanceAtImpactRange:[Math.min(...report.cases.map(r=>r.samples[1].contactClearance[r.visibleContact.hit])),Math.max(...report.cases.map(r=>r.samples[1].contactClearance[r.visibleContact.hit]))]};
  if(baseline)assert.equal(premature.length,72,'Reproduce actual ball rebound before matching displayed net plane');else{assert.equal(premature.length,0);for(const row of report.cases){assert(Math.abs(row.samples[1].contactClearance[row.visibleContact.hit])<1e-8,'Exact visible contact plane');assert.equal(row.samples[0].net?.bulge??0,0);if(row.visibleContact.hit!=='rear')assert(row.samples.every(s=>!s.net),'No phantom rear tail on side/roof hit');assert(row.postBanner.visible,'Goal banner retains corrected visible tail after scene removal');assert(Math.min(...Object.values(row.postBanner.clearance))>=-1e-8,'Banner tail remains within net');assert(row.negatives.length===4&&row.negatives.every(Boolean),'Finished/no-scene/no-recorded-goal/save remain untouched');}assert.equal(escaped.length,0,'Post-impact ball remains within visible net');}
  for(const row of report.cases){row.nativeDigestSha256=hash(row.nativeDigest);delete row.nativeDigest;}if(!baseline){const before=JSON.parse(fs.readFileSync(path.join(root,'outputs/3d-quality/goal-net-diagnosis-v119/native-before.json')));assert.deepEqual(report.cases.map(r=>r.nativeDigestSha256),before.cases.map(r=>r.nativeDigestSha256),'All actual native shot/bookkeeping facts identical before/after render-only patch');report.actualNativeParity=true;}
  for(const [f,h]of Object.entries(report.hashes))assert.equal(hash(fs.readFileSync(path.join(root,f))),h,'Source changed during diagnosis '+f);
  report.pass=true;console.log(JSON.stringify({pass:true,cases:report.cases.length,findings:report.findings}));
 }catch(e){report.pass=false;report.failure=e.stack;throw e;}finally{await browser.close();await new Promise(r=>server.close(r));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');}
})().catch(e=>{console.error(e);process.exitCode=1});
