'use strict';
// Ball physics 184 (dist/match-ball-physics-v184.js): pure integrator and
// solver in a minimal context, then scene checks in the native183 VM harness
// (constructed marked match): table-driven flights, painters on the same path,
// loose-ball predictors against the real landing, woodwork never a goal,
// old air states without the new fields, unmarked matches without marker.
// Usage: node work/test-ball-physics-v184.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),checks=[];
function check(name,fn){fn();checks.push(name);}

// ----- part 1: pure module -----
const ctx=vm.createContext({});
vm.runInContext(['fly','v50LooseBall','v50GoalKick','v124AdvanceAir','v182BallAt','v132FallingBallTarget','v182AirTarget','v150AdvanceFlight','v109FlightPoint','v102FlightBall','v101ShotPoint'].map(n=>`var ${n}=function(){};`).join(''),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'dist/match-ball-physics-v184.js'),'utf8'),ctx,{filename:'match-ball-physics-v184.js'});
const P=name=>vm.runInContext(name,ctx);
const V184=P('V184'),build=P('v184BuildTable'),at=P('v184TableAt'),advance=P('v184Advance'),stateOf=P('v184State');
const goalWidth=44*.2/(544/600),goalHeight=goalWidth/3,post=goalWidth/2+V184.frameRadius;
const frame={ballRadius:.1764,near:3,goals:[{y:0,posts:[-post,post],bar:goalHeight+V184.frameRadius}]};   // ball centre = z + V184.rest
const copyState=s=>({...s});
const lateral=(start,end,p)=>{const dx=end.x-start.x,dy=end.y-start.y,l=Math.hypot(dx,dy);return (dx*(p.y-start.y)-dy*(p.x-start.x))/l;};

const cases=[
 {name:'shot +y',start:{x:0,y:-25,z:0},end:{x:1.5,y:0,z:1.06},T:1.0,w:[0,0,40]},
 {name:'shot -y',start:{x:3,y:25,z:0},end:{x:-1,y:0,z:.31},T:.95,w:[0,0,-40]},
 {name:'cross lofted',start:{x:-20,y:-8,z:0},end:{x:2,y:-3,z:2.36},T:1.4,w:[0,0,30]},
 {name:'header lob',start:{x:5,y:10,z:2.36},end:{x:-2,y:20,z:0},T:1.3,w:[0,0,0]},
 {name:'long pass',start:{x:-15,y:-30,z:0},end:{x:15,y:10,z:0},T:2.6,w:[0,0,25]},
 {name:'short block',start:{x:0,y:0,z:.16},end:{x:.9,y:-1.2,z:0},T:.14,w:[0,0,0]},
];
check('solver reaches the target at the given time within 1 cm in both attack directions',()=>{
 for(const c of cases){
  const t=build(c.start,c.end,c.T,c.w,null,false),e=at(t,1),s=at(t,0);
  assert(Math.hypot(e.x-c.end.x,e.y-c.end.y,e.z-c.end.z)<.01,`${c.name}: end ${JSON.stringify(e)}`);
  assert(Math.hypot(s.x-c.start.x,s.y-c.start.y,s.z-c.start.z)<1e-12,c.name+': start');
  assert.equal(t.woodwork,null,c.name+': no frame');
  assert(Math.abs(e.t-c.T)<1e-9,c.name+': time');
  for(let i=1;i<=t.n;i++)assert(t.times[i]>t.times[i-1],c.name+': times increase');
  const mid=at(t,.5);assert(mid.z>=Math.min(c.start.z,c.end.z)-1e-6,c.name+': no dip below the end points');
 }
});
check('a lofted flight needs a higher apex than its end points and keeps it between them',()=>{
 const t=build(cases[2].start,cases[2].end,cases[2].T,[0,0,0],null,false);let apex=0;
 for(let q=0;q<=1;q+=.02)apex=Math.max(apex,at(t,q).z);
 assert(apex>2.36&&apex<4.5,'apex '+apex);
});
check('same input gives the same table',()=>{
 const a=build(cases[0].start,cases[0].end,cases[0].T,cases[0].w,null,false),b=build(cases[0].start,cases[0].end,cases[0].T,cases[0].w,null,false);
 assert.deepEqual(Array.from(a.pos),Array.from(b.pos));assert.deepEqual(Array.from(a.vel),Array.from(b.vel));assert.deepEqual(a.v0,b.v0);
});
check('side spin curves sideways only: bulge on the expected side, single curvature, same height profile, straight without spin',()=>{
 const c=cases[0],plain=build(c.start,c.end,c.T,[0,0,0],null,false);
 for(const [w,sign] of [[40,-1],[-40,1]]){
  const t=build(c.start,c.end,c.T,[0,0,w],null,false);
  const dev=[],head=[];
  for(let i=0;i<=t.n;i++){const p={x:t.pos[3*i],y:t.pos[3*i+1]};dev.push(lateral(c.start,c.end,p));head.push(Math.atan2(t.vel[3*i+1],t.vel[3*i]));}
  const mid=dev[Math.floor(t.n/2)];
  assert(mid*sign>.15,`spin ${w}: mid deviation ${mid}`);
  assert(dev.every(d=>d*sign>=-1e-9),'deviation keeps one side');
  let turns=0;for(let i=2;i<head.length;i++){const a=head[i]-head[i-1],b=head[i-1]-head[i-2];if(a*b<-1e-14)turns++;}
  assert.equal(turns,0,'heading changes monotonically (no unexplained direction change)');
  let extrema=0;for(let i=2;i<dev.length;i++){const a=dev[i]-dev[i-1],b=dev[i-1]-dev[i-2];if(a*b<0)extrema++;}
  assert(extrema<=1,'one bulge');
  for(let i=0;i<=t.n;i++)assert(Math.abs(t.pos[3*i+2]-plain.pos[3*i+2])<.03,'height profile unchanged by side spin');
 }
 for(let i=0;i<=plain.n;i++)assert(Math.abs(lateral(c.start,c.end,{x:plain.pos[3*i],y:plain.pos[3*i+1]}))<1e-9,'no spin: straight');
});
check('a bounce loses energy, keeps the ground restitution and turns sliding into forward spin',()=>{
 const st=stateOf({x:0,y:0,z:1.5},{vx:4,vy:0,vz:-3},[0,0,0]);
 let before=null;
 while(st.impacts===0){before=copyState(st);advance(st,V184.dt,{});}
 const vzBefore=-Math.sqrt(9+2*V184.g*1.5);
 const e=V184.groundRestitution;assert(st.vz>-vzBefore*(e-.03)&&st.vz<-vzBefore*e+1e-9,'vertical restitution '+st.vz/-vzBefore);
 assert(st.vx<before.vx&&st.vx>=before.vx*(1-V184.bounceSlip)-.01,'friction takes at most the calibrated share of the pre-impact speed: '+st.vx+' from '+before.vx);
 assert(st.wy>0,'forward spin after sliding');
 const ke=s=>s.vx*s.vx+s.vy*s.vy+s.vz*s.vz;
 assert(ke(st)<ke(before)*.6,'energy lost');
 advance(st,5,{});assert(st.settled&&st.z===0,'settled on the ground');
});
check('rolling stops after the calibrated travel',()=>{
 const st=stateOf({x:0,y:0,z:0},{vx:5,vy:0,vz:0},[0,0,0]);
 advance(st,10,{});
 assert(st.stopped&&st.vx===0&&st.vy===0,'stopped');
 assert(Math.abs(st.x-(5-V184.stop)/V184.roll)<.02,'travel '+st.x);
});
check('post and crossbar reflect the ball, energy decreases, a miss never heads back into the goal',()=>{
 const run=(x,z,vx)=>{const st=stateOf({x,y:6,z},{vx,vy:-20,vz:0},[0,0,0]),speed=Math.hypot(vx,20);let n=0;while(!st.woodwork&&n++<60)advance(st,V184.dt,{frame,miss:true});return {st,speed};};
 const p=run(post+.1,.5,-.5);assert.equal(p.st.woodwork?.frame,'post');assert(p.st.vy>0,'post: moving away from the line');assert(Math.hypot(p.st.vx,p.st.vy,p.st.vz)<p.speed,'post: speed reduced');
 const b=run(0,frame.goals[0].bar-V184.rest+.05+.5*V184.g*(6/20)**2,0);   // gravity drop on the way to the lineassert.equal(b.st.woodwork?.frame,'bar');assert(b.st.vy>0,'bar: moving away');assert(Math.hypot(b.st.vx,b.st.vy,b.st.vz)<b.speed,'bar: speed reduced');
 const none=run(0,.5,0);assert.equal(none.st.woodwork,null,'a ball through the mouth touches nothing');
 // without the miss rule an inner-face contact may rebound inward (free balls keep the physical result)
 const free=(()=>{const st=stateOf({x:post-.1,y:6,z:.5},{vx:.6,vy:-20,vz:0},[0,0,0]);let n=0;while(!st.woodwork&&n++<60)advance(st,V184.dt,{frame});return st;})();
 assert.equal(free.woodwork?.frame,'post');
});
check('free-ball integration is independent of the step size (grid multiples exact, other steps within 2 mm)',()=>{
 const make=()=>stateOf({x:0,y:0,z:2},{vx:6,vy:1,vz:2},[0,5,20]);
 const runWith=(h,until)=>{const st=make();while(st.t<until-1e-12)advance(st,Math.min(h,until-st.t),{frame});return st;};
 const ref=runWith(V184.dt,3),a=runWith(.05,3),b=runWith(.025,3),c=runWith(.0437,3);
 for(const [name,s] of [['.05',a],['.025',b]])assert(Math.hypot(s.x-ref.x,s.y-ref.y,s.z-ref.z)<1e-9,name+' equals the fine run');
 assert(Math.hypot(c.x-ref.x,c.y-ref.y,c.z-ref.z)<2e-3,'irregular steps within 2 mm');
 assert(ref.impacts>=1,'the ball bounced at least once');
 for(let t=.1;t<=3;t+=.1){const x=runWith(.05,t),y=runWith(.025,t);assert(Math.hypot(x.x-y.x,x.y-y.y,x.z-y.z)<1e-9,'equal at '+t.toFixed(1));}
});
check('table sampling interpolates between the recorded substeps',()=>{
 const t=build(cases[4].start,cases[4].end,cases[4].T,cases[4].w,null,false);
 for(let i=0;i<=t.n;i++){const p=at(t,t.times[i]/t.T);assert(Math.abs(p.x-t.pos[3*i])<1e-9&&Math.abs(p.z-t.pos[3*i+2])<1e-9,'sample '+i);}
 let last=-1;for(let q=0;q<=1;q+=.013){const p=at(t,q);assert(p.t>=last,'time monotone');last=p.t;}
});

// ----- part 2: scenes in the native183 harness -----
const {create}=require('./native183-scenes.cjs');
const h=create({view:false}),ev=e=>{const v=h.evaluate(e);return v===undefined?undefined:h.copy(v);};
h.run('finishMatch=function(){match.finished=true;running=false;match.flight=null;}','stub');
const fresh=(opt={})=>{h.call('Native183.constructed',{roles:true,...opt});h.run('match.firstHalfEnd=5000;match.fullTimeEnd=10000;match.halftime=false;','clock');};

check('a new marked match carries ballRevision 184; ball:false and si:false leave it out',()=>{
 fresh();assert.equal(ev('match.attackFlow.ballRevision'),184);assert.equal(ev('match.si.revision'),183);
 fresh({ball:false});assert.equal(ev('match.attackFlow.ballRevision'),undefined);assert.equal(ev('match.si.revision'),183);
 fresh({si:false});assert.equal(ev('match.attackFlow.ballRevision'),undefined);assert.equal(ev('match.si'),undefined);
});
check('flights follow the table: progression, v109/v102/v101 readers and v99BallView agree, heights continuous, ground passes stay on the straight lerp',()=>{
 fresh();
 h.run(`globalThis.__bp={tables:0,ground:0,spins:0,kinds:{},maxJump:0,maxView:0,maxLerp:0,prev:new WeakMap()};`,'probe');
 const probe=`(()=>{const m=match,f=m.flight;if(!f)return;const t=v184Table(m,f);
  if(!t){const meta=v102Flights.get(f);if(meta&&meta.startHeight===.29&&meta.endHeight===.29){const q=Math.min(1,f.progress),lx=f.x+(f.target.x-f.x)*q,ly=f.y+(f.target.y-f.y)*q;__bp.maxLerp=Math.max(__bp.maxLerp,Math.hypot(m.ball.x-lx,m.ball.y-ly));if(!__bp.prev.has(f)){__bp.ground++;__bp.prev.set(f,true);}}return;}
  const q=Math.min(1,f.progress),p=v109FlightPoint(f,q);
  if(!__bp.prev.has(f)){__bp.tables++;__bp.kinds[t.kind]=(__bp.kinds[t.kind]||0)+1;if(t.w0[2])__bp.spins++;}
  if(q>0&&q<1){const d=Math.hypot(p.x-m.ball.x,p.y-m.ball.y);if(d>__bp.maxView)__bp.maxView=d;}   // q 0: created this tick, the ball still sits at the kick
  const meta=v102Flights.get(f),rel=v99Flights.get(f),alt=rel?.kind==='shot'?v101ShotPoint(rel,q):meta?v102FlightBall(meta,q):p;
  __bp.maxView=Math.max(__bp.maxView,Math.hypot(alt.x-p.x,alt.y-p.y,alt.elevation-p.elevation));
  if(!m.goalPause&&!m.setPiece&&!m.throwIn&&!m.kickoff&&!m.postBanner){const view=v99BallView(m);if(view&&Number.isFinite(view.elevation))__bp.maxView=Math.max(__bp.maxView,Math.hypot(view.x-p.x,view.y-p.y,view.elevation-p.elevation));}
  const last=__bp.prev.get(f);if(typeof last==='number')__bp.maxJump=Math.max(__bp.maxJump,Math.abs(p.elevation-last));__bp.prev.set(f,p.elevation);})()`;
 for(let i=0;i<3600;i++){h.call('Native183.advance');h.evaluate(probe);}
 const r=ev('({tables:__bp.tables,ground:__bp.ground,spins:__bp.spins,kinds:__bp.kinds,maxJump:__bp.maxJump,maxView:__bp.maxView,maxLerp:__bp.maxLerp})');
 assert(r.tables>=5,'table flights '+JSON.stringify(r));
 assert(r.ground>=10,'ground passes seen');
 assert(r.spins>=1,'spinning flights seen');
 assert(r.maxView<1e-9,'every reader returns the table point: '+r.maxView);
 assert(r.maxLerp<1e-12,'ground passes on the engine lerp: '+r.maxLerp);
 assert(r.maxJump<1.6,'height continuous per tick (at most 30 m/s, also right after a frame rebound): '+r.maxJump);
});
check('loose-ball predictors match the real path: v182BallAt, landing point and the falling-ball runner target',()=>{
 fresh();
 const setup=`(()=>{const m=match,s=v150Scale(m),rate=v183Rate(m);
  Object.assign(m,{setPiece:null,throwIn:null,kickoff:null,flight:null,owner:null,goalPause:0,postBanner:null,slide:null,next:Infinity,pendingKickoff:null});
  for(const p of m.people){p.x=.2+(p.n%5)*.15;p.y=p.keeper?(p.t===0?.95:.05):.86;p.tx=p.x;p.ty=p.y;p.interceptTarget=null;p.slideActive=false;}
  const r={x:.3,y:.3,delay:0,chase:null};m.rebound=r;m.ball={x:.3,y:.3};m.lastTouch=0;
  const vxm=4,vym=2;r.vx=vxm/(s.x*rate);r.vy=vym/(s.y*rate);
  v124AirBalls.set(m,{rebound:r,height:2.5,vh:3,impacts:0,settled:false,spin:[0,0,30],vxm,vym});
  const a=v124AirBalls.get(m),pred=v182BallAt(r,1.2),land=v184Landing(m,r,a);
  let runner=null;for(const p of m.people)if(!p.keeper&&v132FallingBallTarget(m,p)){runner={pid:p.pid,tx:p.tx,ty:p.ty};break;}
  return {pred,land,runner,vx:r.vx,vy:r.vy};})()`;
 const before=ev(setup);
 assert(before.runner,'a falling-ball runner was chosen');
 assert(Math.abs(before.runner.tx-before.land.x)<1e-9&&Math.abs(before.runner.ty-before.land.y)<1e-9,'runner target is the physical landing point');
 assert.equal(ev('match.rebound.vx'),before.vx,'velocity restored after the read');
 let landed=null;
 for(let i=0;i<24;i++){h.call('Native183.advance',.05);const st=ev('(()=>{const a=v124AirBalls.get(match);return {x:match.ball.x,y:match.ball.y,impacts:a?a.impacts:null,owner:!!match.owner,rebound:!!match.rebound,t:(i=>i)(0)};})()');
  if(!landed&&st.impacts>=1)landed={...st,tick:i+1};assert(st.rebound&&!st.owner,'ball still free at tick '+i);}
 const after=ev('({x:match.ball.x,y:match.ball.y})');
 assert(Math.hypot(after.x-before.pred.x,after.y-before.pred.y)<2e-3,`v182BallAt vs real: ${Math.hypot(after.x-before.pred.x,after.y-before.pred.y)}`);
 assert(landed,'the ball landed within 1.2 s');
 assert(Math.abs(landed.tick*.05-before.land.seconds)<=.05+1e-9,'landing time '+before.land.seconds+' vs tick '+landed.tick);
 assert(Math.hypot(landed.x-before.land.x,landed.y-before.land.y)<.3,'landing point within one tick of travel');
});
check('an air state saved without spin/velocity fields (older snapshot) advances with the fallback values',()=>{
 fresh();
 const r=ev(`(()=>{const m=match,s=v150Scale(m),rate=v183Rate(m);Object.assign(m,{setPiece:null,throwIn:null,kickoff:null,flight:null,owner:null,next:Infinity});
  const r={x:.5,y:.5,delay:0,vx:2/(s.x*rate),vy:0};m.rebound=r;m.ball={x:.5,y:.5};
  v124AirBalls.set(m,{rebound:r,height:2,vh:1,impacts:0,settled:false});
  const a=v124AdvanceAir(m,.05);return {height:a.height,vxm:a.vxm,spin:a.spin,vx:r.vx};})()`);
 assert(r.height>2&&r.height<2.1,'rose during the tick');assert(Math.abs(r.vxm-2)<.02,'horizontal velocity from r.vx');assert.deepEqual(r.spin.map(x=>+x.toFixed(9)),[0,0,0]);
});
check('woodwork: a pre-rolled miss whose scatter lies in the frame band hits post or bar, is booked as off-target plus woodwork, continues as loose ball and never scores',()=>{
 const seen={post:0,bar:0};let tries=0;
 const scene=(seed)=>ev(`(()=>{const m=match,s=v150Scale(m),top=v55Field.top,p=m.people.find(q=>q.t===0&&!q.keeper),k=m.people.find(q=>q.t===1&&q.keeper);
  Object.assign(m,{setPiece:null,throwIn:null,kickoff:null,flight:null,rebound:null,goalPause:0,postBanner:null,slide:null,next:Infinity,pendingKickoff:null});
  p.x=.5+3/s.x;p.y=top+14/s.y;p.fin=9;p.tec=12;k.x=.5;k.y=top+2/s.y;k.gk=12;
  for(const r of m.people)if(r.t===1&&!r.keeper){r.x=.5+(r.n%3-1)*.2;r.y=top+40/s.y;}
  for(const q of m.people){q.tx=q.x;q.ty=q.y;q.interceptTarget=null;}
  m.owner=p;m.ball={x:p.x,y:p.y};Native182.seedRandom(${seed});
  const events=m.ballAccounting.events.length;v55Shoot(p);
  const f=m.flight,t=f&&v184Table(m,f),rel=f&&v99Flights.get(f);
  return {woodwork:t?.woodwork?.frame||null,onTarget:rel?.onTarget,blocked:rel?.blocked,events,score:[...m.score],pid:p.pid};})()`);
 for(let seed=1;seed<=1500&&(!seen.post||!seen.bar);seed++){
  fresh({seed:'wood'+seed});
  const s=scene(Math.imul(seed+1,2654435761)>>>0||1);tries++;
  if(!s.woodwork)continue;
  assert(!s.onTarget&&!s.blocked,'woodwork only on a miss');
  let hit=null,inGoal=0;
  for(let i=0;i<60;i++){h.call('Native183.advance',.05);
   const st=ev(`(()=>{const m=match,ev=m.ballAccounting.events,w=ev.find(e=>e.kind==='woodwork'&&e.id>${s.events});const s=v150Scale(m),gw=m.geometry.goalWidth;
    const behind=m.ball.y<v55Field.top&&Math.abs(m.ball.x-.5)*s.x<gw/2;return {w:w?{frame:w.frame,parent:w.parentId,result:w.result}:null,shot:ev.find(e=>e.shot&&e.id>${s.events})?.result||null,loose:ev.filter(e=>e.kind==='loose-ball'&&e.id>${s.events}).length,score:[...m.score],behind,flight:!!m.flight,rebound:!!m.rebound};})()`);
   if(st.behind&&st.rebound)inGoal++;
   if(st.w&&!hit)hit=st;
   if(st.w&&!st.flight&&!st.rebound&&i>8)break;
  }
  assert(hit,'woodwork event booked (seed '+seed+')');
  assert.equal(hit.w.frame,s.woodwork);assert.equal(hit.shot,'off-target','the shot stays a miss');assert.equal(hit.w.result,'rebound');
  const final=ev('({score:[...match.score],goals:match.goals.length,loose:match.ballAccounting.events.filter(e=>e.kind==="loose-ball").length})');
  assert.deepEqual(final.score,s.score,'no goal from the woodwork rebound (seed '+seed+')');
  assert.equal(inGoal,0,'the free ball never lies inside the goal');
  assert(final.loose>=1,'a loose ball followed');
  seen[s.woodwork]++;
 }
 assert(seen.post>=1&&seen.bar>=1,`post ${seen.post}, bar ${seen.bar} in ${tries} shots`);
 console.log(JSON.stringify({woodworkScenes:seen,shots:tries}));
});
console.log(JSON.stringify({pass:true,checks:checks.length,names:checks}));
