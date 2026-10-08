const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:780}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href,{timeout:120000});
  await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  const report=await page.evaluate(()=>{
   clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();v103EndReplay(match);hideOverlay();running=true;
   const m=match,template=m.people.find(p=>!p.keeper),s=v150Scale(),keys=['spd','tec','pas','fin','tak','pos','air','sta','gk'];
   const player=(id,t,x,y,keeper=false)=>{const p={...structuredClone(template),pid:id,name:id,n:id.length+1,t,x,y,tx:x,ty:y,bx:x,by:y,initialBy:y,line:keeper?'gk':'att',assignedLine:keeper?'gk':'att',keeper,form:0,fresh:100,instructions:[],stats:emptyStats(),motionX:0,motionY:0,recoverUntil:0,slideActive:false};for(const k of keys)p[k]=18;v117Stats(p);return p;};
   const reset=people=>{
    v103EndReplay(m);hideOverlay();running=true;v150SpacePasses.delete(m);delete m.spacePassIntent;
    Object.assign(m,{people,owner:null,kickoff:null,countdown:0,postBanner:null,throwIn:null,setPiece:null,flight:null,slide:null,goalPause:0,goalScene:null,rebound:null,halftimePause:0,next:Infinity,finished:false,score:[0,0],shots:[0,0],goals:[],lastPass:null,lastTouch:0,elapsed:10,ballAccounting:{version:117,sequence:0,events:[]},halftimeBreakDone:false,fulltimePending:false});
    delete m.ballEventId;v115KeeperChallenges.delete(m);v123GroundControls.delete(m);v121PositioningSamples.delete(m);v123DefensiveThreats.delete(m);v124AirBalls.delete(m);
    const a=v99ActionState(m);a.keepers.clear();a.kicks.clear();a.throws.clear();a.miss=null;a.outBall=null;const motion=v102State(m);motion.clock=0;motion.poses.clear();motion.loose=null;
   };
   const scenes=[];
   for(const team of [0,1])for(const kind of ['run','alternate','intercept','offside','keeper','unreached','exit']){
    const flip=y=>team===0?y:1-y,p=player('passer',team,.45,flip(.62)),runner=player('runner',team,.58,flip(.52)),other=player('other',team,.82,flip(.7)),def=player('defender',1-team,.82,flip(.3)),k=player('keeper',1-team,.5,flip(.07),true),k0=player('ownkeeper',team,.5,flip(.93),true);
    let target={x:.58,y:flip(.45)};
    if(kind==='alternate'){other.x=.58;other.y=flip(.45);runner.x=.9;runner.y=flip(.65);}
    if(kind==='intercept'){def.x=.52;def.y=flip(.54);runner.x=.75;}
    if(kind==='offside'){runner.x=.58;runner.y=flip(.13);target={x:.58,y:flip(.13)};def.x=.9;def.y=flip(.3);k.x=.85;}
    if(kind==='keeper'){target={x:.5,y:flip(.12)};runner.x=.9;runner.y=flip(.6);k.y=flip(.14);def.x=.9;}
    if(kind==='unreached'){target={x:.58,y:flip(.42)};runner.x=.9;runner.y=flip(.75);other.x=.9;other.y=flip(.75);def.x=.1;def.y=flip(.1);k.x=.1;}
    if(kind==='exit'){target={x:-.08,y:flip(.55)};runner.x=.9;other.x=.9;def.x=.9;k.x=.9;}
    reset([p,runner,other,def,k,k0]);m.owner=p;m.ball={x:p.x,y:p.y};Math.random=()=>.5;
    const plan=v150SpacePass(p,{target,runner}),flight=m.flight,landing={...flight.target},initialGap=v122Metres(runner,landing),event=v117Flights.get(flight);let steps=0,maxStep=0,endFree=false;
    while(steps++<180){
     const before=new Map(m.people.map(p=>[p,{x:p.x,y:p.y}]));step(.05*MATCH_SPEED,.05);
     for(const q of m.people)maxStep=Math.max(maxStep,v122Metres(q,before.get(q)));
     if(!m.flight&&m.rebound)endFree=true;
     if(kind==='unreached'&&endFree||plan.settled||m.setPiece||m.throwIn)break;
    }
    scenes.push({team,kind,steps,maxStep,initialGap,endFree,owner:m.owner?.pid||null,event:{...event},complete:p.stats.passComplete,lost:p.stats.passLost,offside:m.setPiece?.type||null,throwTeam:m.throwIn?.team,runnerInterceptions:runner.stats.interceptions,defenderInterceptions:def.stats.interceptions,keeperInterceptions:k.stats.interceptions,livePlan:v150SpacePasses.has(m)});
   }
   const quality=[];
   for(const skill of [5,18]){
    const p=player('quality',0,.5,.65),r=player('runner',0,.6,.55),def=player('def',1,.9,.25),k=player('keeper',1,.5,.07,true),target={x:.6,y:.43};p.pas=skill;reset([p,r,def,k]);m.owner=p;m.ball={x:p.x,y:p.y};Math.random=()=>.9;v150SpacePass(p,{target,runner:r});quality.push({skill,error:v122Metres(m.flight.target,target)});
   }
   const timing=[];
   for(const pos of [5,18]){
    const p=player('passer',0,.45,.62),r=player('runner',0,.58,.52),k=player('keeper',1,.9,.07,true);r.pos=pos;reset([p,r,k]);m.owner=p;m.ball={x:p.x,y:p.y};Math.random=()=>.5;v150SpacePass(p,{target:{x:.58,y:.45},runner:r});v150Prepare(m,.15);v150RunTarget(m,r);timing.push({pos,delay:v150Delay(r),moving:v122Metres(r,{x:r.tx,y:r.ty})>.1});
   }
   const candidates=[];
   for(const blocked of [false,true]){
    const p=player('passer',0,.45,.62),r=player('runner',0,.58,.52),def=player('defender',1,blocked?.51:.9,blocked?.57:.22),k=player('keeper',1,.5,.07,true);r.instructions=['deep'];reset([p,r,def,k]);m.owner=p;m.ball={x:p.x,y:p.y};const options=v150Candidates(p,[r],[def,k]);candidates.push({blocked,count:options.length,target:options[0]?.target,receiver:{x:r.x,y:r.y}});
   }
   reset([player('passer',0,.5,.6),player('runner',0,.6,.5),player('keeper',1,.5,.07,true)]);const p=m.people[0];m.owner=p;m.ball={x:p.x,y:p.y};Math.random=()=>.5;const plan=v150SpacePass(p,{target:{x:.6,y:.43},runner:m.people[1]});v150Prepare(m,.05);const before=JSON.stringify({people:m.people,flight:{...m.flight,done:null},ball:m.ball}),randomBefore=Math.random;v150RunTarget(m,m.people[1]);
   // Rendering must not choose a runner, settle a pass, or draw simulation randoms.
   const engine=JSON.stringify({people:m.people,flight:{...m.flight,done:null},ball:m.ball});let draws=0;Math.random=()=>{draws++;return .5;};v98View='3d';for(let i=0;i<3;i++){draw();}const graphics={unchanged:engine===JSON.stringify({people:m.people,flight:{...m.flight,done:null},ball:m.ball}),randomDraws:draws};Math.random=randomBefore;
   const races=[];
   for(const faster of ['attacker','defender']){
    const p=player('passer',0,.5,.67),a=player('attacker',0,.38,.50),b=player('defender',1,.62,.50),k=player('keeper',1,.9,.07,true),k0=player('ownkeeper',0,.1,.93,true);a.spd=faster==='attacker'?20:3;b.spd=faster==='defender'?20:3;reset([p,a,b,k,k0]);m.owner=p;m.ball={x:p.x,y:p.y};Math.random=()=>.5;const race=v150SpacePass(p,{target:{x:.5,y:.36},runner:a});let frames=0;while(!race.settled&&frames++<180)step(.05*MATCH_SPEED,.05);races.push({faster,winner:v150Event(m,race)?.receiverPid,complete:p.stats.passComplete,lost:p.stats.passLost,frames});
   }
   const persistence=[];
   for(const offside of [false,true]){
    const p=player('passer',0,.45,.62),r=player('runner',0,.9,offside?.13:.75),def=player('defender',1,.1,.3),k=player('keeper',1,.1,.07,true);reset([p,r,def,k]);m.owner=p;m.ball={x:p.x,y:p.y};Math.random=()=>.5;v150SpacePass(p,{target:{x:.58,y:.42},runner:r});let frames=0;while(m.flight&&frames++<100)step(.05*MATCH_SPEED,.05);
    if(!m.rebound||!m.spacePassIntent)throw Error('Missing persistent loose intent');
    const context=v65Context();v65Snapshot(context);const saved=JSON.parse(JSON.stringify(context.state.physicalSnapshot));
    // Exercise the actual snapshot restore, including pending offside participation.
    const outcomes=[];
    for(const mode of ['current','restored']){
     if(mode==='restored'){context.state.physicalSnapshot=structuredClone(saved);v65Restore(context);}
     const active=match,receiver=active.people.find(q=>q.pid==='runner'),point={...active.ball};receiver.x=point.x;receiver.y=point.y;v150Prepare(active,.05);const restored=v150SpacePasses.get(active);v150Receive(active,restored,receiver,point);
     const passer=active.people.find(q=>q.pid==='passer'),event=active.ballAccounting.events.find(e=>e.intent==='space');outcomes.push({mode,complete:passer.stats.passComplete,lost:passer.stats.passLost,result:event.result,offside:active.setPiece?.type||null,intentRemoved:!active.spacePassIntent});
    }
    // Restore the original match object before the next isolated fixture.
    match=m;persistence.push({offside,outcomes});
   }
   const legacy=player('legacy',0,.5,.5);reset([legacy]);m.rebound={x:.6,y:.5,delay:0,vx:0,vy:0};m.ball={x:.6,y:.5};const legacyBefore=JSON.stringify(m);v150Prepare(m,.05);const unchangedLegacy=legacyBefore===JSON.stringify(m)&&!v150SpacePasses.has(m);
   running=false;return {scenes,quality,timing,candidates,graphics,races,persistence,unchangedLegacy};
  });
  fs.writeFileSync('outputs/space-passes-v150.json',JSON.stringify({...report,errors},null,2)+'\n');
  assert.deepEqual(errors,[]);
  for(const row of report.scenes){
   if(row.kind!=='offside')assert(row.maxStep<.45,JSON.stringify(row));assert.equal(row.event.intent,'space');
   if(row.kind==='run')assert.equal(row.complete,1,JSON.stringify(row));
   if(row.kind==='alternate')assert.equal(row.event.receiverPid,'other',JSON.stringify(row));
   if(row.kind==='intercept'){assert.equal(row.defenderInterceptions,1,JSON.stringify(row));assert.equal(row.lost,1);}
   if(row.kind==='offside'){assert.equal(row.offside,'offside',JSON.stringify(row));assert.equal(row.complete,0);assert.equal(row.lost,1);}
   if(row.kind==='keeper'){assert.equal(row.owner,'keeper',JSON.stringify(row));assert.equal(row.keeperInterceptions,1);assert.equal(row.lost,1);}
   if(row.kind==='unreached'){assert(row.endFree&&!row.owner&&row.livePlan,JSON.stringify(row));assert.equal(row.complete,0);}
   if(row.kind==='exit'){assert.equal(row.throwTeam,1-row.team,JSON.stringify(row));assert.equal(row.lost,1);}
  }
  assert(report.quality[0].error>report.quality[1].error*2);assert(report.timing[0].delay>report.timing[1].delay);
  assert(report.candidates[0].count>0);assert.equal(report.candidates[1].count,0);assert.notDeepEqual(report.candidates[0].target,report.candidates[0].receiver);
  assert(report.graphics.unchanged);assert.equal(report.graphics.randomDraws,0);
  for(const row of report.races)assert.equal(row.winner,row.faster,JSON.stringify(row));
  for(const row of report.persistence){const [current,restored]=row.outcomes;assert.deepEqual({...current,mode:null},{...restored,mode:null});assert(current.intentRemoved);assert.equal(current.result,row.offside?'offside':'received');}
  assert(report.unchangedLegacy);
  console.log(JSON.stringify({scenes:report.scenes.map(({event,...r})=>r),quality:report.quality,timing:report.timing,candidates:report.candidates,graphics:report.graphics,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
