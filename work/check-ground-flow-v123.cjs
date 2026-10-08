// Native callbacks and UI, isolated actors; no saved user career is opened.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
 const report=await page.evaluate(()=>{
  clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();v103EndReplay(match);hideOverlay();running=true;
  const m=match,context=v65Context(),templates=[m.people.find(p=>!p.keeper),m.people.find(p=>p.keeper)],sx=44/(v55Field.right-v55Field.left),sy=68/(v55Field.bottom-v55Field.top),cases=[];
  const player=(id,t,x,y,keeper=false)=>{const p={...structuredClone(templates[keeper?1:0]),pid:'flow-'+id,t,x,y,tx:x,ty:y,bx:x,by:y,initialBy:y,keeper,line:keeper?'gk':'def',assignedLine:keeper?'gk':'def',instructions:[],fresh:100,form:0,stats:emptyStats(),motionX:0,motionY:0,recoverUntil:0,slideActive:false};for(const k of ['spd','tec','pas','fin','tak','pos','air','sta','gk'])p[k]=12;v117Stats(p);return p;};
  const reset=people=>{Object.assign(m,{people,owner:null,kickoff:null,countdown:0,postBanner:null,throwIn:null,setPiece:null,flight:null,slide:null,goalPause:0,goalScene:null,rebound:null,halftimePause:0,next:Infinity,finished:false,score:[0,0],goals:[],lastPass:null,lastTouch:0,elapsed:10,ballAccounting:{version:117,sequence:0,events:[]}});delete m.ballEventId;v115KeeperChallenges.delete(m);v121PositioningSamples.delete(m);v123DefensiveThreats.delete(m);v123GroundControls.delete(m);const a=v99ActionState(m);a.keepers.clear();a.kicks.clear();a.throws.clear();a.miss=a.outBall=null;v102State(m).clock=0;v102State(m).poses.clear();v102State(m).loose=null;};
  const finish=()=>{const f=m.flight,end={...f.target},dir={x:end.x-f.x,y:end.y-f.y};m.flight=null;m.ball=end;v109IncomingFlight={current:m,flight:f};try{f.done();}finally{v109IncomingFlight=null;}return dir;};
  for(const team of [0,1]){
   const y=team===0?.9:.1,k=player('keeper',team,.5,y,true),a=player('left',team,.31,team===0?.73:.27),b=player('right',team,.69,team===0?.73:.27),r=player('rival',1-team,.31,team===0?.83:.17);
   reset([k,a,b,r]);m.owner=k;m.ball={x:k.x,y:k.y};const before=m.people.map(p=>[p.x,p.y]);v121PreparePositioning(m);const plans=[a,b].map(p=>({id:p.pid,...v121PositioningPlans.get(m).get(p)}));cases.push({kind:'keeper-support',team,plans,unchanged:JSON.stringify(before)===JSON.stringify(m.people.map(p=>[p.x,p.y]))});
   const q=player('long',team,.78,team===0?.4:.6);reset([k,q]);m.owner=k;m.ball={x:k.x,y:k.y};v99ActionState(m).kicks.set(k.pid,{keeper:k,phase:'waiting',held:false,age:0});Math.random=()=>.5;action();cases.push({kind:'keeper-long',team,flight:v102Flights.get(m.flight)?.kind,high:!!m.flight.aerial,pose:v99PlayerAction(m,k)});
  }
  for(const gap of [.5,2]){
   const p=player('passer',0,.5,.6),q=player('receiver',0,.5,.45),r=player('interceptor',1,.5+.7/sx,.54);reset([p,q,r]);m.owner=p;m.ball={x:p.x,y:p.y};const values=[.5,.5,0];Math.random=()=>values.shift()??.9;v55GroundPass(p,q,'pass',true);const target=m.flight.target;r.x=target.x+gap/sx;r.y=target.y;Math.random=()=>.9;const dir=finish();cases.push({kind:'interceptor-contact',gap,owned:m.owner?.pid||null,loose:!!m.rebound,direction:dir,velocity:m.rebound?{x:m.rebound.vx,y:m.rebound.vy}:null});
  }
  for(const gap of [.5,2]){
   const p=player('passer',0,.5,.6),q=player('receiver',0,.5,.45);reset([p,q]);m.owner=p;m.ball={x:p.x,y:p.y};Math.random=()=>.5;v55GroundPass(p,q,'pass',true);q.x=m.flight.target.x+gap/sx;q.y=m.flight.target.y;const dir=finish();cases.push({kind:'receiver-contact',gap,owned:m.owner?.pid||null,loose:!!m.rebound,direction:dir,velocity:m.rebound?{x:m.rebound.vx,y:m.rebound.vy}:null});
  }
  const cup=v62Current(context.career).find(c=>c.type==='cup'),old={competitionId:context.fixture.competitionId,round:context.fixture.round};
  for(const round of ['QF','SF','F']){context.fixture.competitionId=cup.id;context.fixture.round=round;v65Show(context);clearInterval(v65WorldFrame);v102StopPaint();cases.push({kind:'cup-heading',round,label:$('#match-area .match-meta span:last-child').textContent});}Object.assign(context.fixture,old);
  return cases;
 });fs.writeFileSync('docs/spieler-nutzer-rig/ground-flow-qa-v123.json',JSON.stringify({cases:report,errors},null,2)+'\n');assert.deepEqual(errors,[]);
 for(const c of report){if(c.kind==='keeper-support'){assert(c.unchanged);assert.equal(c.plans.length,2);assert(c.plans[0].x<.5&&c.plans[1].x>.5);assert(c.plans.every(p=>!p.mark));}if(c.kind==='keeper-long'){assert(c.high);assert.equal(c.pose.kind,'goalKick');assert.equal(c.pose.phase,'follow');assert.equal(c.pose.held,false);}if(c.kind.includes('-contact')){if(c.gap===.5)assert(c.owned);else{assert(!c.owned&&c.loose);assert(c.velocity.x*c.direction.x+c.velocity.y*c.direction.y>0);assert(Math.abs(c.velocity.x*c.direction.y-c.velocity.y*c.direction.x)<1e-9,'Missed contact retains direction');}}if(c.kind==='cup-heading')assert.equal(c.label,'POKALSPIEL · '+{QF:'Viertelfinale',SF:'Halbfinale',F:'Finale'}[c.round]);}
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
