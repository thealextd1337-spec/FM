'use strict';
// Ball physics 184 (Spur A, user decision 21 Oct 2026): the physics shapes the
// trajectory, the match outcome stays pre-rolled. Every flight keeps its engine
// target and its duration (SI calibration of release 133); the module only
// solves the launch velocity that reaches that target at that time under
// gravity, quadratic air drag and the Magnus force of a launched side spin,
// and samples the path once per flight with a fixed 1/120 s substep. Readers
// of the ball position (progression, 2D/3D painters, loose-ball handover,
// chasers) read the same table; only the engine tick (v150AdvanceFlight) builds
// and re-solves it (the SI finish completes the launch data after fly returns),
// so renderer reads between ticks never change the match. Free balls run the same integrator while they are airborne
// (bounce with restitution, tangential friction and spin coupling, no frame);
// on the ground the calibrated damping of world-ball-motion-v110 (2.3/s)
// applies, so chase distances stay as measured.
// Woodwork (only pre-rolled misses meet the post and crossbar cylinders):
// a miss whose target lies in the band around the frame (SI finish draws the
// lateral and height scatter continuously) hits post or bar, the rebound continues
// as a loose ball and never becomes a goal. No random draw is added anywhere; spin direction
// and strength come from the situation and the abilities.
// Active only for matches constructed with attackFlow.ballRevision 184
// (worlds with SI stamp 183); older matches and snapshots are byte-identical.
// Units: metres and real seconds inside the module (legacy pitch units are
// converted with v160PitchScale, elevation .29 is the resting ball).
// Collisions and lines use the game ball radius (geometry.ballRadius .1764) and
// the engine's convention that the elevation is the ball centre (resting .29,
// v115GoalCrossing); mass, drag area and spin coupling use the physical ball
// (0.43 kg, 0.11 m).

const V184_REVISION=184;
const V184=Object.freeze({
 dt:1/120,g:9.81,radius:.11,
 drag:.0133,            // rho*Cd*A/(2m): 1.2*.25*pi*.11^2/(2*.43)
 magnus:.0045,          // acceleration per (rad/s * m/s) of omega x v
 spinDecay:.1,          // 1/s in the air
 groundRestitution:.42,frameRestitution:.62,friction:.45,
 bounceSlip:.18,        // cap of the tangential loss per bounce as share of the tangential speed (release-133 factor .82 of v124)
 settle:.9,             // vertical speed after a bounce below which the ball stays down (v124 rule)
 roll:2.3,              // ground damping 1/s (release-133 loose-ball model)
 stop:.05,              // rolling speed below which the ball rests
 frameRadius:.06,       // post and crossbar
 spinShot:50,spinCross:40,   // rad/s at top technique and execution
 rest:.29,              // resting elevation = ball centre height (engine convention)
 missBand:.03           // a miss hits post or bar only within this distance of the frame axis (dead-centre hits); a nearer miss clears it. Series 21 Oct 2026: .08 gave 3.3 % of shots and +.29 goals per match from the live rebounds
});
const v184Tables=new WeakMap(),v184Launches=new WeakMap(),v184Paths=new WeakMap();
let v184Projecting=false,v184Handover=null,v184WoodworkPending=null;
function v184Active(m){return m?.attackFlow?.ballRevision===V184_REVISION;}
function v184Rate(m){return typeof v183Rate==='function'?v183Rate(m):.78;}

// ----- pure integrator (metres, seconds) -----
// state: x,y,z (z = height of the ball above its resting position), vx,vy,vz,
// wx,wy,wz (rad/s), t (absolute seconds on the substep grid), impacts, settled.
function v184Sweep(p,v,a,b,r,dt){
 const dot=(u,w)=>u[0]*w[0]+u[1]*w[1]+u[2]*w[2];
 const axis=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],length=Math.hypot(...axis),u=axis.map(x=>x/length),q=[p[0]-a[0],p[1]-a[1],p[2]-a[2]],along=dot(q,u),speed=dot(v,u),perp=q.map((x,i)=>x-along*u[i]),vp=v.map((x,i)=>x-speed*u[i]);let best=null;
 function candidate(q,w,valid,center){const aa=dot(w,w),bb=dot(q,w),cc=dot(q,q)-r*r;if(aa<1e-15)return;const disc=bb*bb-aa*cc;if(disc<0)return;const t=cc<=1e-10?0:(-bb-Math.sqrt(disc))/aa;if(t<0||t>dt||!valid(t))return;const at=p.map((x,i)=>x+v[i]*t),c=center(t),n=at.map((x,i)=>x-c[i]),l=Math.hypot(...n);if(l<1e-12)return;for(let i=0;i<3;i++)n[i]/=l;if(dot(v,n)>=-1e-8)return;if(!best||t<best.t)best={t,n};}
 candidate(perp,vp,t=>along+speed*t>=0&&along+speed*t<=length,t=>a.map((x,i)=>x+u[i]*(along+speed*t)));
 for(const end of [a,b])candidate([p[0]-end[0],p[1]-end[1],p[2]-end[2]],v,()=>true,()=>end);
 return best;
}
// frame: {goals:[{y,posts:[xLeft,xRight],bar:zAxis}], ballRadius, near}; the ball centre sits V184.rest above z
function v184FrameHit(st,frame,h){
 if(!frame)return null;
 let first=null;
 const p=[st.x,st.y,st.z+V184.rest],v=[st.vx,st.vy,st.vz],r=frame.ballRadius+V184.frameRadius;
 for(const goal of frame.goals){
  if(Math.abs(st.y-goal.y)>frame.near)continue;
  for(const x of goal.posts){const c=v184Sweep(p,v,[x,goal.y,0],[x,goal.y,goal.bar],r,h);if(c&&(!first||c.t<first.t))first={...c,frame:'post',goal};}
  const c=v184Sweep(p,v,[goal.posts[0],goal.y,goal.bar],[goal.posts[1],goal.y,goal.bar],r,h);if(c&&(!first||c.t<first.t))first={...c,frame:'bar',goal};
 }
 return first;
}
function v184Bounce(st){
 // ground contact: restitution, Coulomb friction with the slip of the contact point (sphere, I=2/5 m r^2).
 // The loss is capped at the calibrated share of the tangential speed instead of the 2/7 rolling
 // threshold: with physical (lower) landing speeds the sphere rule checked lofted balls up so hard that
 // second balls stayed in the box (+0.27 goals per match in the series of 21 Oct 2026).
 const e=V184.groundRestitution,R=V184.radius,vn=st.vz;
 st.z=0;
 let vzNext=-e*vn;
 const ux=st.vx-R*st.wy,uy=st.vy+R*st.wx,u=Math.hypot(ux,uy);
 if(u>1e-9){const limit=Math.min(V184.friction*(1+e)*Math.abs(vn),2*u/7,V184.bounceSlip*Math.hypot(st.vx,st.vy)),dx=ux/u,dy=uy/u;st.vx-=limit*dx;st.vy-=limit*dy;const dw=5*limit/(2*R);st.wx-=dw*dy;st.wy+=dw*dx;}
 st.impacts=(st.impacts||0)+1;
 if(vzNext<V184.settle){vzNext=0;st.settled=true;}
 st.vz=vzNext;
}
function v184Substep(st,h,opt){
 const airborne=st.z>1e-9||st.vz>1e-9;
 if(!airborne&&!opt.flight){
  st.z=0;st.vz=0;const d=Math.exp(-V184.roll*h),f=(1-d)/V184.roll;
  st.x+=st.vx*f;st.y+=st.vy*f;st.vx*=d;st.vy*=d;
  if(Math.hypot(st.vx,st.vy)<V184.stop){st.vx=0;st.vy=0;st.stopped=true;}
  const s=Math.exp(-3*h);st.wx*=s;st.wy*=s;st.wz*=s;st.settled=true;st.t+=h;return;
 }
 const speed=Math.hypot(st.vx,st.vy,st.vz),k=V184.drag*speed,km=V184.magnus;
 st.vx+=(-k*st.vx+km*(st.wy*st.vz-st.wz*st.vy))*h;
 st.vy+=(-k*st.vy+km*(st.wz*st.vx-st.wx*st.vz))*h;
 st.vz+=(-V184.g-k*st.vz+km*(st.wx*st.vy-st.wy*st.vx))*h;
 let left=h;
 for(let n=0;n<4&&left>1e-12;n++){
  let hit=null;
  if(!opt.flight&&st.vz<-1e-9){const t=-st.z/st.vz;if(t>=0&&t<=left)hit={t,ground:true};}
  const f=v184FrameHit(st,opt.frame,left);if(f&&(!hit||f.t<hit.t))hit=f;
  const t=hit?hit.t:left;
  st.x+=st.vx*t;st.y+=st.vy*t;st.z+=st.vz*t;left-=t;
  if(!hit)break;
  if(hit.ground){v184Bounce(st);if(st.settled)break;continue;}
  const vn=st.vx*hit.n[0]+st.vy*hit.n[1]+st.vz*hit.n[2],j=(1+V184.frameRestitution)*vn;
  st.vx-=j*hit.n[0];st.vy-=j*hit.n[1];st.vz-=j*hit.n[2];
  st.x+=hit.n[0]*1e-6;st.y+=hit.n[1]*1e-6;st.z+=hit.n[2]*1e-6;
  // shortcut: the inner face of post and bar is not modelled for a pre-rolled miss; a rebound that
  // still heads for the goal line is mirrored, so a miss cannot cross into the goal.
  if(opt.miss&&st.vy*(hit.goal.y-st.y)>0)st.vy=-st.vy;
  st.impacts=(st.impacts||0)+1;
  if(!st.woodwork)st.woodwork={t:st.t+(h-left),frame:hit.frame,x:st.x,y:st.y,z:st.z};
  if(opt.flight)opt.flight=false;  // after the frame the ball may land before the flight ends
 }
 if(left>1e-12){st.x+=st.vx*left;st.y+=st.vy*left;st.z+=st.vz*left;}
 const s=Math.exp(-V184.spinDecay*h);st.wx*=s;st.wy*=s;st.wz*=s;
 if(st.z<0&&!opt.flight){st.z=0;if(st.vz<0)st.vz=0;}
 st.t+=h;
}
// Advance a state by `seconds` on the fixed grid (substep boundaries at
// multiples of V184.dt from t=0), independent of how the seconds are split.
function v184Advance(st,seconds,opt={}){
 const o={frame:opt.frame||null,flight:!!opt.flight,miss:!!opt.miss};
 let left=Math.max(0,seconds);
 while(left>1e-12){
  const next=(Math.floor(st.t/V184.dt+1e-7)+1)*V184.dt,h=Math.min(left,next-st.t);
  v184Substep(st,h,o);left-=h;
 }
 return st;
}
function v184State(start,v,w){return {x:start.x,y:start.y,z:start.z,vx:v.vx,vy:v.vy,vz:v.vz,wx:w[0],wy:w[1],wz:w[2],t:0,impacts:0,settled:false,stopped:false,woodwork:null};}
// Launch velocity that reaches `end` at time T (Newton on the integrator, no frame, no ground);
// null when the iteration does not converge (residual over .05 m or non-finite), the caller
// then keeps the engine's straight lerp.
function v184Launch(start,end,T,w){
 let v={vx:(end.x-start.x)/T,vy:(end.y-start.y)/T,vz:(end.z-start.z)/T+.5*V184.g*T},err=Infinity;
 const residual=v=>{const st=v184Advance(v184State(start,v,w),T,{flight:true});return [st.x-end.x,st.y-end.y,st.z-end.z];};
 for(let i=0;i<12;i++){
  const r=residual(v);err=Math.hypot(r[0],r[1],r[2]);if(err<1e-5)break;
  const eps=.01,J=[];
  for(const key of ['vx','vy','vz']){const d=residual({...v,[key]:v[key]+eps});J.push([(d[0]-r[0])/eps,(d[1]-r[1])/eps,(d[2]-r[2])/eps]);}
  // J[k] is the column for key k; solve J * dv = -r with Cramer's rule
  const M=[[J[0][0],J[1][0],J[2][0]],[J[0][1],J[1][1],J[2][1]],[J[0][2],J[1][2],J[2][2]]],det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  const D=det(M);if(Math.abs(D)<1e-12)break;
  const col=(m,i,b)=>m.map((row,j)=>row.map((x,k)=>k===i?b[j]:x)),b=[-r[0],-r[1],-r[2]];
  v={vx:v.vx+det(col(M,0,b))/D,vy:v.vy+det(col(M,1,b))/D,vz:v.vz+det(col(M,2,b))/D};err=Infinity;
 }
 if(!(err<1e-5))err=Math.hypot(...residual(v));
 return err<.05?v:null;
}
// Sample table of one flight: positions and velocities at every substep (null when the launch has no solution).
function v184BuildTable(start,end,T,w,frame,miss){
 const v0=v184Launch(start,end,T,w);if(!v0)return null;
 const st=v184State(start,v0,w),n=Math.max(1,Math.ceil(T/V184.dt-1e-9)),pos=new Float64Array(3*(n+1)),vel=new Float64Array(3*(n+1)),times=new Float64Array(n+1);
 const o={frame:frame||null,flight:true,miss};
 const record=i=>{pos[3*i]=st.x;pos[3*i+1]=st.y;pos[3*i+2]=st.z;vel[3*i]=st.vx;vel[3*i+1]=st.vy;vel[3*i+2]=st.vz;times[i]=st.t;};
 record(0);
 for(let i=1;i<=n;i++){const target=Math.min(T,i*V184.dt);v184Substep(st,target-st.t,o);st.t=target;record(i);}
 return {T,n,pos,vel,times,w0:[...w],v0,end:{...end},zT:end.z,woodwork:st.woodwork,endSpin:[st.wx,st.wy,st.wz],endState:{x:st.x,y:st.y,z:st.z,vx:st.vx,vy:st.vy,vz:st.vz}};
}
function v184TableAt(table,q){
 const t=Math.max(0,Math.min(1,q))*table.T;let i=Math.min(table.n-1,Math.floor(t/V184.dt+1e-9));
 while(i>0&&table.times[i]>t)i--;
 const t0=table.times[i],t1=table.times[i+1],f=t1>t0?Math.max(0,Math.min(1,(t-t0)/(t1-t0))):0,p=table.pos,v=table.vel,a=3*i,b=3*(i+1);
 return {x:p[a]+(p[b]-p[a])*f,y:p[a+1]+(p[b+1]-p[a+1])*f,z:p[a+2]+(p[b+2]-p[a+2])*f,vx:v[a]+(v[b]-v[a])*f,vy:v[a+1]+(v[b+1]-v[a+1])*f,vz:v[a+2]+(v[b+2]-v[a+2])*f,t};
}
function v184SpinAt(table,q){const s=Math.exp(-V184.spinDecay*Math.max(0,Math.min(1,q))*table.T);return table.w0.map(w=>w*s);}
// Re-solve the remaining path from the current sample when the requested end height changes
// (v102 raises the landing height of a high ball to head height once a player contests it).
function v184Resplice(table,q,zT){
 const t=Math.max(0,Math.min(1,q))*table.T,i=Math.min(table.n-1,Math.floor(t/V184.dt+1e-9)),rest=table.T-table.times[i];
 if(rest<.05){table.zT=zT;return table;}
 const start={x:table.pos[3*i],y:table.pos[3*i+1],z:table.pos[3*i+2]},w=v184SpinAt(table,table.times[i]/table.T),tail=v184BuildTable(start,{...table.end,z:zT},rest,w,null,false);
 if(!tail){table.zT=zT;return table;}
 for(let j=0;j<=tail.n;j++){const k=i+j;if(k>table.n)break;for(let c=0;c<3;c++){table.pos[3*k+c]=tail.pos[3*j+c];table.vel[3*k+c]=tail.vel[3*j+c];}table.times[k]=table.times[i]+tail.times[j];}
 table.zT=zT;table.endSpin=tail.endSpin;table.endState=tail.endState;return table;
}

// ----- engine binding -----
function v184Frame(m){
 const g=m.geometry,s=v160PitchScale(m),width=g?.goalWidth||.2*v160PitchWidth(m),height=g?.goalHeight||width/3,half=width/2+V184.frameRadius,cx=.5*s.x;
 return {ballRadius:g?.ballRadius||.1764,near:3,goals:[v55Field.top*s.y,v55Field.bottom*s.y].map(y=>({y,posts:[cx-half,cx+half],bar:height+V184.frameRadius}))};
}
function v184Metres(m,p,z){const s=v160PitchScale(m);return {x:p.x*s.x,y:p.y*s.y,z};}
function v184Legacy(m,st){const s=v160PitchScale(m);return {x:st.x/s.x,y:st.y/s.y,elevation:.29+st.z,vx:st.vx/s.x,vy:st.vy/s.y,vh:st.vz};}
// Side spin of a launched ball (rad/s about the vertical axis; sign by the
// right-hand rule). Only placed shots, direct free kicks, crosses and high
// passes curl; direction from the situation, strength from the abilities.
function v184LaunchSpin(m,kind,launch,start,end,shot){
 const person=launch.person;if(!person)return [0,0,0];
 const placed=kind==='shot'||kind==='freeKick',lofted=kind==='cross'||kind==='highPass';
 if(!placed&&!lofted)return [0,0,0];
 const tec=ability(person,'tec')/20,exec=ability(person,placed?'fin':'pas')/20,strength=(placed?V184.spinShot:V184.spinCross)*Math.max(0,Math.min(1,tec))*(.5+.5*Math.max(0,Math.min(1,exec)));
 const dx=end.x-start.x,dy=end.y-start.y,len=Math.hypot(dx,dy);if(len<1||strength<1e-6)return [0,0,0];
 const s=v160PitchScale(m),leftOf=p=>(dx*(p.y*s.y-start.y)-dy*(p.x*s.x-start.x))>0;
 let obstacle=null;
 if(placed)obstacle=shot?.keeperStart||m.people.find(p=>p.keeper&&p.t!==person.t)||null;
 else{const mid={x:(start.x+end.x)/2,y:(start.y+end.y)/2};obstacle=m.people.filter(p=>p.t!==person.t&&!p.keeper).map(p=>({p,d:Math.hypot(p.x*s.x-mid.x,p.y*s.y-mid.y)})).filter(o=>o.d<8).sort((a,b)=>a.d-b.d)[0]?.p||null;
  if(!obstacle)obstacle={x:.5,y:person.t===0?v55Field.top:v55Field.bottom,toward:true};}
 // bulge away from the obstacle (or toward goal for an unopposed cross); a positive wz accelerates the ball to the left of its path
 const bulgeLeft=obstacle.toward?leftOf(obstacle):!leftOf(obstacle);
 return [0,0,bulgeLeft?-strength:strength];
}
// Pure lookup for readers: null until the first engine tick of the flight built the table.
function v184Table(m,flight){return flight&&v184Active(m)?v184Tables.get(flight)??null:null;}
function v184EngineTable(m,flight){let table=v184Tables.get(flight);if(table===undefined){table=v184CreateTable(m,flight);v184Tables.set(flight,table);}return table;}
function v184CreateTable(m,flight){
 const shot=v99Flights.get(flight),meta=v102Flights.get(flight),launch=v184Launches.get(flight)||{},rate=v184Rate(m),T=flight.duration/rate;
 if(!(T>0))return null;
 const kind=meta?.kind||shot?.kind||launch.kind||'flight';
 if(kind==='throw'||shot?.kind==='goalKick'&&!meta?.high)return null;
 let start,end,z0,zT,frame=null,miss=false;
 if(shot?.kind==='shot'){start=shot.visualStart||{x:flight.x,y:flight.y};end=shot.displayTarget||shot.target;z0=shot.startHeight-.29;zT=shot.endHeight-.29;}
 else if(meta){start=shot?.kind==='goalKick'&&shot.start||meta.start;end=meta.target;z0=(shot?.kind==='goalKick'?shot.startHeight:meta.startHeight)-.29;zT=meta.endHeight-.29;}   // a held goal kick leaves from the placed ball (v99), not from the keeper's kick point
 else{start={x:flight.x,y:flight.y};end=flight.target;z0=0;zT=0;}
 const S=v184Metres(m,start,Math.max(0,z0)),E=v184Metres(m,end,Math.max(0,zT)),w=v184LaunchSpin(m,kind,launch,S,E,shot);
 miss=Boolean(shot?.kind==='shot'&&!shot.onTarget&&!shot.blocked);   // every miss meets the frame; the sweep decides post, bar or nothing
 if(miss){frame=v184Frame(m);v184MissBand(frame,E);}
 if(S.z===0&&E.z===0&&!w[2]&&!miss)return null;   // ground ball: the engine's straight lerp is exact
 const table=v184BuildTable(S,E,T,w,frame,miss);if(!table)return null;
 table.kind=kind;table.shot=shot||null;table.meta=meta||null;
 if(table.woodwork)table.woodwork.handled=false;
 return table;
}
// The miss scatter of the finish model is densest at the posts, and every ball
// overlapping the frame would hit it (6 % of all shots). Only the frontal band
// counts as a hit; a miss nearer to the frame than its reach but outside the
// band is moved just past post or bar (up to the reach, .25 m, for a ball that
// overlapped the post from inside: the finish model already called it wide).
function v184MissBand(frame,E){
 const goal=frame.goals.reduce((a,b)=>Math.abs(b.y-E.y)<Math.abs(a.y-E.y)?b:a),reach=frame.ballRadius+V184.frameRadius+.01,cx=(goal.posts[0]+goal.posts[1])/2,side=E.x>=cx?1:-1,half=goal.posts[1]-cx,lateral=Math.abs(E.x-cx),zc=E.z+V184.rest;
 if(lateral>half-reach){const dx=lateral-half;if(Math.abs(dx)<V184.missBand||dx>=reach)return;E.x=cx+side*(half+reach);return;}   // post zone: clear the post on the outside
 const dz=zc-goal.bar;if(Math.abs(dz)<V184.missBand||Math.abs(dz)>=reach)return;E.z=goal.bar+reach-V184.rest;   // under the mouth: clear the bar above
}
function v184WantedEnd(table){const h=table.shot?table.shot.endHeight:table.meta?.endHeight;return Number.isFinite(h)?Math.max(0,h-.29):table.zT;}
function v184Sample(m,table,q){return v184Legacy(m,v184TableAt(table,q));}
const v184BaseFly=fly;
fly=function(target,duration,done){
 const m=match;if(!v184Active(m))return v184BaseFly(target,duration,done);
 const launch={person:v102Release?.person||null,kind:v102Release?.kind||v99Release?.kind||null};
 let flight=null;
 // The done chain runs inside out (v99, v102, v109, this, ledger v117, engine callback). A woodwork
 // miss keeps the whole chain (ledger settles the shot as off-target) and only replaces the engine's
 // goal kick, intercepted in v50GoalKick below, by the physical rebound.
 const result=v184BaseFly(target,duration,function(...args){
  const table=flight&&v184Tables.get(flight);
  if(!table?.woodwork||table.woodwork.handled)return done.apply(this,args);
  table.woodwork.handled=true;v184WoodworkPending={m,flight,table};
  try{return done.apply(this,args);}finally{v184WoodworkPending=null;}
 });
 flight=m.flight;if(!flight)return result;
 v184Launches.set(flight,launch);
 return result;
};
const v184BaseGoalKick=v50GoalKick;
v50GoalKick=function(keeper,...args){
 const pending=v184WoodworkPending;
 if(!pending||pending.m!==match)return v184BaseGoalKick.call(this,keeper,...args);
 v184WoodworkPending=null;return v184AfterWoodwork(pending.m,pending.flight,pending.table);
};
function v184AfterWoodwork(m,flight,table){
 const shooter=table.shot.shooter,frame=table.woodwork.frame,end=v184Legacy(m,table.endState),point={x:end.x,y:end.y};
 // Ledger: a 'woodwork' event under the shot and the frame on the shot event itself; the loose ball
 // stays parented to the shot, so rebound chains (loose ball from a shot) keep their meaning.
 if(typeof v117Event==='function'&&typeof v117Ledger==='function'&&v117Ledger(m)){const parent=typeof v117Origin==='function'?v117Origin(m):null,event=v117Event(m,'woodwork',shooter,parent?.id??null);event.frame=frame;event.result='rebound';if(parent)parent.woodwork=frame;}
 m.lastTouch=shooter.t;
 v184Handover={point,state:table.endState,spin:table.endSpin};
 try{v50LooseBall(point,`Aluminium! ${shooter.name} trifft ${frame==='bar'?'die Latte':'den Pfosten'}.`);}finally{v184Handover=null;}
}
const v184BaseLoose=v50LooseBall;
v50LooseBall=function(point,...args){
 const m=match,hand=v184Handover,result=v184BaseLoose(point,...args),r=m?.rebound;
 if(!v184Active(m)||!r)return result;
 const s=v160PitchScale(m),rate=v184Rate(m);
 if(hand){
  const st=hand.state;r.vx=st.vx/(s.x*rate);r.vy=st.vy/(s.y*rate);
  const air={rebound:r,height:.29+st.z,vh:st.vz,impacts:0,settled:false,spin:[...hand.spin],vxm:st.vx,vym:st.vy};
  if(st.z>.01||st.vz>0){v124AirBalls.set(m,air);const fall=(st.vz+Math.sqrt(st.vz*st.vz+2*V184.g*Math.max(0,st.z)))/V184.g;r.delay=Math.max(r.delay,fall*rate);}
  else v124AirBalls.delete(m);
  return result;
 }
 const flight=typeof v109IncomingFlight!=='undefined'&&v109IncomingFlight?.current===m?v109IncomingFlight.flight:null,table=flight&&v184Tables.get(flight),loose=v102Motion.get(m)?.loose;
 // A flight without table ends on the engine's straight path: the same release velocity as v110 derives
 // from the last 2 % of the flight, without its .001 clock-unit floor (rate-invariant for very short flights).
 if(flight&&!table&&!(loose&&!loose.drop)&&flight.duration>0){const vx=(flight.target.x-flight.x)/flight.duration,vy=(flight.target.y-flight.y)/flight.duration,speed=Math.hypot(vx*s.x,vy*s.y)*rate,limit=Math.min(1,18/Math.max(.001,speed));r.vx=vx*limit;r.vy=vy*limit;}
 const air=v124AirBalls.get(m);
 if(air&&air.rebound===r){air.spin=table?[...table.endSpin]:[0,0,0];air.vxm=r.vx*s.x*rate;air.vym=r.vy*s.y*rate;}
 return result;
};
function v184AirState(m,a,r){
 const s=v160PitchScale(m),rate=v184Rate(m);
 return {x:r.x*s.x,y:r.y*s.y,z:Math.max(0,(a.height??.29)-.29),vx:Number.isFinite(a.vxm)?a.vxm:(r.vx||0)*s.x*rate,vy:Number.isFinite(a.vym)?a.vym:(r.vy||0)*s.y*rate,vz:a.vh||0,wx:a.spin?.[0]||0,wy:a.spin?.[1]||0,wz:a.spin?.[2]||0,t:0,impacts:0,settled:false,stopped:false,woodwork:null};
}
const v184BaseAir=v124AdvanceAir;
v124AdvanceAir=function(current,seconds){
 if(!v184Active(current))return v184BaseAir(current,seconds);
 const a=v124AirBalls.get(current),r=current.rebound;
 if(!a||a.rebound!==r||current.owner||current.flight){v124AirBalls.delete(current);return null;}
 if(a.settled)return a;
 const dt=Math.max(0,seconds);if(!(dt>0))return a;
 const s=v160PitchScale(current),rate=v184Rate(current),st=v184AirState(current,a,r),x0=st.x,y0=st.y;
 v184Advance(st,dt);   // no frame: only a pre-rolled miss meets post or bar (product rule: woodwork is never a goal)
 a.height=.29+st.z;a.vh=st.vz;a.spin=[st.wx,st.wy,st.wz];a.vxm=st.vx;a.vym=st.vy;a.impacts=(a.impacts||0)+st.impacts;
 // v110 moves the ball by r.v * delta while airborne and by the damped travel once settled: hand over the actual displacement of this tick.
 const tx=(st.x-x0)/s.x,ty=(st.y-y0)/s.y;
 if(st.settled){a.settled=true;a.height=.29;a.vh=0;const damp=Math.exp(-V184.roll*dt),f=(1-damp)/(V184.roll/rate);r.vx=tx/f;r.vy=ty/f;}
 else{r.vx=tx/(dt*rate);r.vy=ty/(dt*rate);}
 return a;
};
// Predictors of one airborne free ball share one integration per tick: the path
// sampled every .05 s up to 6 s (the intercept search of v182 asks for exactly
// these times) and the first ground contact. Keyed by the air state, rebuilt
// when the state changes (once per tick).
function v184Path(m,r,a){
 const sig=[r.x,r.y,a.height,a.vh,a.vxm,a.vym,a.spin?.[0],a.spin?.[1],a.spin?.[2]].join(',');
 let path=v184Paths.get(a);if(path&&path.sig===sig)return path;
 const st=v184AirState(m,a,r),pts=[v184Legacy(m,st)];
 for(let i=1;i<=120;i++){v184Advance(st,.05);pts.push(v184Legacy(m,st));}
 const land=v184AirState(m,a,r);let landing;
 if(land.z<=1e-9&&land.vz<=1e-9)landing={...v184Legacy(m,land),seconds:0};
 else{let t=0;while(t<3&&!(land.impacts>0||land.settled)){v184Advance(land,V184.dt);t+=V184.dt;}landing={...v184Legacy(m,land),seconds:land.t};}
 path={sig,pts,landing};v184Paths.set(a,path);return path;
}
function v184FreeBallAt(m,r,a,seconds){
 const pts=v184Path(m,r,a).pts,t=Math.max(0,Math.min(6,seconds)),i=Math.min(pts.length-2,Math.floor(t/.05+1e-9)),f=Math.max(0,Math.min(1,(t-i*.05)/.05)),p=pts[i],q=pts[i+1];
 return {x:p.x+(q.x-p.x)*f,y:p.y+(q.y-p.y)*f,elevation:p.elevation+(q.elevation-p.elevation)*f};
}
// First ground contact of an airborne free ball: point (legacy) and seconds.
function v184Landing(m,r,a){return v184Path(m,r,a).landing;}
const v184BaseBallAt=v182BallAt;
v182BallAt=function(r,seconds){
 const m=typeof match!=='undefined'?match:null,a=m&&v184Active(m)&&m.rebound===r?v124AirBalls.get(m):null;
 if(!a||a.rebound!==r||a.settled)return v184BaseBallAt(r,seconds);
 return v159Point(v184FreeBallAt(m,r,a,seconds),v150Scale(m),.3);
};
// The falling-ball runners of v132/v182 extrapolate r + r.v * fall (ballistic). Feed them the
// velocity that lands on the physical point for the duration of their read.
function v184WithLanding(m,fn){
 const r=m.rebound,a=v124AirBalls.get(m);
 if(!v184Active(m)||v184Projecting||!a||a.rebound!==r||a.settled||m.owner||m.flight)return fn();
 const fall=Math.max(0,Math.min(1.5,((a.vh||0)+Math.sqrt((a.vh||0)**2+19.6*Math.max(0,(a.height??.29)-.29)))/9.8));
 if(!(fall>1e-6))return fn();
 const land=v184Landing(m,r,a),rate=v184Rate(m),vx=r.vx,vy=r.vy;
 r.vx=(land.x-r.x)/(rate*fall);r.vy=(land.y-r.y)/(rate*fall);v184Projecting=true;
 try{return fn();}finally{v184Projecting=false;if(m.rebound===r){r.vx=vx;r.vy=vy;}}
}
const v184BaseFalling=v132FallingBallTarget;
v132FallingBallTarget=function(current,person){return v184WithLanding(current,()=>v184BaseFalling(current,person));};
const v184BaseAirTarget=v182AirTarget;
v182AirTarget=function(m,p,r){return v184WithLanding(m,()=>v184BaseAirTarget(m,p,r));};
// Flight progression (game.js skips its straight lerp when this returns true).
const v184BaseAdvanceFlight=v150AdvanceFlight;
v150AdvanceFlight=function(m,delta){
 const f=m.flight;
 if(!f||!v184Active(m)||v150SpacePasses.get(m)?.flight===f)return v184BaseAdvanceFlight(m,delta);
 const table=v184EngineTable(m,f);if(!table)return v184BaseAdvanceFlight(m,delta);
 f.progress+=delta/f.duration;const q=Math.min(1,f.progress);
 const zT=v184WantedEnd(table);if(Math.abs(zT-table.zT)>1e-9&&!table.woodwork)v184Resplice(table,q,zT);   // only the engine tick re-solves (v102 raises the landing height once a player contests)
 if(q>=1&&!table.woodwork){m.ball.x=f.target.x;m.ball.y=f.target.y;}
 else{const p=v184Sample(m,table,q);m.ball.x=p.x;m.ball.y=p.y;}
 if(q>=1){m.flight=null;f.done();
  // v99 sets its miss pose after the done chain; after a frame hit the ball is in play, not behind the goal
  if(table.woodwork?.handled){const actions=v99Actions.get(m);if(actions?.miss?.flight===f)actions.miss=null;}}
 return true;
};
const v184BaseFlightPoint=v109FlightPoint;
v109FlightPoint=function(flight,q){const table=v184Table(match,flight);return table?v184Sample(match,table,q):v184BaseFlightPoint(flight,q);};
const v184BaseFlightBall=v102FlightBall;
v102FlightBall=function(meta,q){const table=meta?.flight&&v184Table(match,meta.flight);return table?v184Sample(match,table,q):v184BaseFlightBall(meta,q);};
const v184BaseShotPoint=v101ShotPoint;
v101ShotPoint=function(release,q){const table=release?.flight&&v184Table(match,release.flight);return table?v184Sample(match,table,q):v184BaseShotPoint(release,q);};
