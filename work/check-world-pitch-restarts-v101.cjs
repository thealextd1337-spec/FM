// Isolated acceptance for standing goal kicks, resume focus and continuous shots.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
const setup=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('async function complete('))+';setup',{url:process.env.D6_TEST_URL||'http://127.0.0.1:4195/'});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));await setup(page);
  const stage=page.locator('#match-area .v42-pitch-stage');
  const kick=await page.evaluate(()=>{
   hideOverlay();Object.assign(match,{elapsed:10,kickoff:null,countdown:0,postBanner:null,throwIn:null,setPiece:null,flight:null,slide:null,goalPause:0,goalScene:null,rebound:null});
   const k=match.people.find(p=>p.t===0&&p.keeper);k.x=.54;v50GoalKick(k,'Abstoß');const start={x:k.x,y:k.y},others=match.people.filter(p=>!p.keeper).map(p=>({id:p.pid,x:p.x,y:p.y}));
   for(let i=0;i<40;i++)step(.05*MATCH_SPEED,.05);draw();const visual=v98Players.get(k.pid);
   const standing={distance:Math.hypot(k.x-start.x,k.y-start.y),leg:visual.limbs[2].rotation.x,held:match.owner===k&&!match.flight,moved:others.some(a=>{const p=match.people.find(p=>p.pid===a.id);return Math.hypot(p.x-a.x,p.y-a.y)>.01})};
   step(.26*MATCH_SPEED,.26);draw();const backswing=visual.limbs[2].rotation.x;
   const before=JSON.stringify(match);v98Render();if(JSON.stringify(match)!==before)throw Error('Render changed match');
   step(.15*MATCH_SPEED,.15);draw();return {id:k.pid,standing,backswing,phase:v99PlayerAction(match,k)?.phase,leg:visual.limbs[2].rotation.x,kind:v99Flights.get(match.flight)?.kind,progress:match.flight?.progress};
  });assert(kick.standing.held&&kick.standing.moved);assert(kick.standing.distance<1e-9&&Math.abs(kick.standing.leg)<1e-9,'keeper stands still while teammates move');assert(kick.backswing>.1&&kick.leg<-.7&&kick.phase==='follow'&&kick.kind==='goalKick'&&kick.progress===0);
  await stage.screenshot({path:'outputs/goal-kick-contact101.png'});
  const pause=await page.evaluate(()=>{const k=match.people.find(p=>p.pid===v99Flights.get(match.flight).keeper.pid);const wasRunning=running;running=false;const pose=v99PlayerAction(match,k);draw();const frozen=JSON.stringify(pose)===JSON.stringify(v99PlayerAction(match,k));running=wasRunning;for(let i=0;i<14;i++)step(.05*MATCH_SPEED,.05);draw();return {frozen,done:v99PlayerAction(match,k)===null,pose:v99PlayerAction(match,k),running,stoppage:{goal:match.goalPause,half:match.halftimePause,kickoff:match.kickoff?.phase,post:match.postBanner},age:v99Actions.get(match)?.kicks.get(k.pid)?.age};});assert(pause.frozen&&pause.done,JSON.stringify(pause));
  await page.evaluate(()=>{match.flight=null;match.slide=null;match.halftimePause=0;v65PauseTargetTab='tactics';if(!v65Pause())throw Error('Could not pause');window.scrollTo(0,document.body.scrollHeight);});
  assert(await page.locator('#match-area').evaluate(el=>el.hidden));
  await page.locator('.v65-resume-action').click();await page.evaluate(()=>clearInterval(v65WorldFrame));await page.waitForTimeout(900);
  const resume=await stage.evaluate(el=>({top:el.getBoundingClientRect().top,hidden:el.closest('#match-area').hidden}));assert(!resume.hidden&&resume.top>=0&&resume.top<350);assert.equal(await page.evaluate(()=>d6Pitch3D.getState().view),'3d');
  const shots=[];
  for(const [team,variant,turned]of [[0,0,false],[0,2,false],[1,1,false],[0,1,true]]){
   const shot=await page.evaluate(({team,variant,turned})=>{
    Object.assign(match,{flight:null,kickoff:null,postBanner:null,throwIn:null,setPiece:null,slide:null,goalPause:0,goalScene:null,halftimePause:0,halftimeBreakDone:turned});hideOverlay();
    const s=match.people.find(p=>p.t===team&&!p.keeper);s.x=variant===1?.68:.5;s.y=team===0?.18:.82;
    for(const p of match.people)if(p!==s&&!p.keeper){p.x=.08;p.y=.5}
    match.owner=s;match.ball={x:s.x,y:s.y};s.stats.shots=((variant-1-s.n)%3+3)%3;
    const original=Math.random,values=[.5,.01,.01];Math.random=()=>values.shift()??.01;try{v55Shoot(s)}finally{Math.random=original}
    const flight=match.flight,seconds=flight.duration/MATCH_SPEED;flight.progress=1;match.ball={...flight.target};draw();const atLine={...v98Frame.ball},end=v99BallView(match);
    match.flight=null;flight.done();draw();const start={...v98Frame.ball},travel=v99Actions.get(match).goalTravel;
    if(!travel)throw Error('Goal trajectory missing');const samples=[];
    for(const t of [0,.001,travel.impact,travel.impact+.04,.4]){match.goalScene.elapsed=t;draw();samples.push({t,...v98Frame.ball})}
    return {seconds,atLine,start,end,travel,samples};
   },{team,variant,turned});
   for(const key of ['x','z','height'])assert(Math.abs(shot.atLine[key]-shot.start[key])<1e-8,'ball does not jump at goal line');assert(shot.seconds<.5,'close shots have punchier pace');assert(shot.travel.impact<.15);
   const sy=(turned?-1:1)*-68/(688/740); // compare direction independently of camera framing
   assert(Math.abs((shot.samples[1].x-shot.samples[0].x)/.001-shot.end.vy*sy)<.08,'same forward velocity through line');
   assert(shot.samples.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&p.height>=.29));shots.push({team,variant,turned,seconds:shot.seconds,hit:shot.travel.hit});
   await stage.screenshot({path:`outputs/goal-flight101-${team}-${variant}-${turned}.png`});
  }
  await page.setViewportSize({width:844,height:390});await setup(page);await page.evaluate(()=>{match.kickoff=null;match.postBanner=null;match.flight=null;match.slide=null;doppel6Language.set('en');v65PauseTargetTab='tactics';v65Pause();window.scrollTo(0,document.body.scrollHeight)});await page.locator('.v65-resume-action').click();await page.evaluate(()=>clearInterval(v65WorldFrame));await page.waitForTimeout(900);assert.equal(await page.evaluate(()=>d6Pitch3D.getState().view),'3d');assert(!(await page.locator('#match-area').evaluate(el=>el.hidden)));assert(await stage.evaluate(el=>el.getBoundingClientRect().top>=0&&el.getBoundingClientRect().top<150),'mobile resume focuses pitch below fixed header');
  await page.evaluate(()=>{match.flight=null;match.kickoff=null;match.slide=null;v98View='2d';draw();v65PauseTargetTab='tactics';v65Pause()});await page.locator('.v65-resume-action').click();await page.evaluate(()=>clearInterval(v65WorldFrame));await page.waitForTimeout(900);assert.equal(await page.evaluate(()=>d6Pitch3D.getState().view),'2d','resume preserves deliberate 2D choice');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({kick,pause,resume,shots,errors}));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
