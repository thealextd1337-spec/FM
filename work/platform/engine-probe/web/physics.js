(function(root){'use strict';
// Isolated comparison probe, never called by the production match engine.
const Net=typeof module!=='undefined'&&module.exports?require('./net.js'):root.D6Net;
const G=9.81,R=.06,DT=1/60,clone=x=>JSON.parse(JSON.stringify(x));
function dot(a,b){return a.reduce((n,v,i)=>n+v*b[i],0);}
function sweep(p,v,a,b,r,dt){
 const axis=b.map((x,i)=>x-a[i]),length=Math.hypot(...axis),u=axis.map(x=>x/length),q=p.map((x,i)=>x-a[i]),along=dot(q,u),speed=dot(v,u),perp=q.map((x,i)=>x-along*u[i]),vp=v.map((x,i)=>x-speed*u[i]);let best=null;
 function candidate(q,w,valid,center){const aa=dot(w,w),bb=dot(q,w),cc=dot(q,q)-r*r;if(aa<1e-15)return;const disc=bb*bb-aa*cc;if(disc<0)return;const t=cc<=1e-10?0:(-bb-Math.sqrt(disc))/aa;if(t<0||t>dt||!valid(t))return;const at=p.map((x,i)=>x+v[i]*t),c=center(t),n=at.map((x,i)=>x-c[i]),l=Math.hypot(...n);if(l<1e-12)return;for(let i=0;i<3;i++)n[i]/=l;if(dot(v,n)>=-1e-8)return;if(!best||t<best.t)best={t,n};}
 candidate(perp,vp,t=>along+speed*t>=0&&along+speed*t<=length,t=>a.map((x,i)=>x+u[i]*(along+speed*t)));
 for(const end of [a,b])candidate(p.map((x,i)=>x-end[i]),v,()=>true,()=>end);
 return best;
}
function substep(s,h,emit,contacts=null){
 const b=s.ball,p=b.position,v=b.velocity,g=s.geometry,air=p[1]>b.radius+1e-8||v[1]>0;
 if(air)v[1]-=G*h/2;else{v[1]=0;const speed=Math.hypot(v[0],v[2]),next=Math.max(0,speed-2.4*h);if(speed){v[0]*=next/speed;v[2]*=next/speed;}}
 let remaining=h;
 for(let count=0;remaining>1e-10&&count<8;count++){
  let first=null;function hit(t,n,type,reason,e){if(t>=-1e-10&&t<=remaining&&(!first||t<first.t))first={t:Math.max(0,t),n,type,reason,e};}
  if(v[1]<-1e-8)hit((b.radius-p[1])/v[1],[0,1,0],'ground-contact','Boden',.52);
  for(const sign of [-1,1]){const x=sign*g.length/2;for(const z of [-g.goalWidth/2,g.goalWidth/2]){const c=sweep(p,v,[x,0,z],[x,g.goalHeight,z],b.radius+R,remaining);if(c)hit(c.t,c.n,'frame-contact','Pfosten',.62);}
   const c=sweep(p,v,[x,g.goalHeight,-g.goalWidth/2],[x,g.goalHeight,g.goalWidth/2],b.radius+R,remaining);if(c)hit(c.t,c.n,'frame-contact','Latte',.62);
  }
  if(!s.boundaryDelivered)for(const axis of [0,2])if(Math.abs(v[axis])>1e-8){const sign=Math.sign(v[axis]),limit=(axis===0?g.length:g.width)/2+b.radius,t=(sign*limit-p[axis])/v[axis];if(t>=0&&t<=remaining&&(!first||t<first.t))first={t,boundary:true};}
  const player=contacts?.find(remaining);if(player&&(!first||player.t<first.t))first={t:player.t,player};
  const t=first?first.t:remaining;for(let i=0;i<3;i++)p[i]+=v[i]*t;contacts?.move(t);remaining-=t;
  if(!first)break;
  if(first.player){contacts.resolve(first.player);break;}
  if(first.boundary){s.boundaryDelivered=true;const goal=Math.abs(p[0])>=g.length/2+b.radius-1e-7&&Math.abs(p[2])+b.radius<g.goalWidth/2&&p[1]+b.radius<g.goalHeight;
   if(goal){s.goalSign=Math.sign(p[0]);s.score[g.attackDirection>0?0:1]++;}s.outcome=goal?'goal':'out';emit(s.outcome);continue;}
  const normalSpeed=dot(v,first.n);for(let i=0;i<3;i++){v[i]-=(1+first.e)*normalSpeed*first.n[i];p[i]+=first.n[i]*1e-8;}
  if(first.type==='ground-contact'&&Math.abs(v[1])<.45)v[1]=0;
  // Quiet resting contacts must not flood the ledger.
  if(first.type!=='ground-contact'||Math.abs(normalSpeed)>.45)emit(first.type,first.reason);
  if(first.type==='frame-contact'||first.type==='ground-contact'&&!s.outcome)s.outcome=s.outcome||first.type;
 }
 if(contacts&&remaining>1e-10)contacts.move(remaining);
 Net.step(s,h,emit);
 if(air&&p[1]>b.radius+1e-8)v[1]-=G*h/2;
 if(p[1]<b.radius){p[1]=b.radius;v[1]=Math.max(0,v[1]);}
}
function step(s,config,emit){
 if(!s.running||s.finished)return;
 const end=s.resultDelivered?s.followThroughUntil:config.scenario.duration,dt=Math.min(DT,end-s.elapsed);
 if(dt>1e-10){for(let n=0;n<8;n++)substep(s,dt/8,emit);s.elapsed+=dt;s.tick=Math.round(s.elapsed/DT);}
 if(!s.resultDelivered&&(s.outcome||s.elapsed>=config.scenario.duration-1e-8)){s.resultDelivered=true;s.resolvedAt=s.elapsed;s.followThroughUntil=s.elapsed+(config.followThroughSeconds||0);emit('result');}
 s.following=s.resultDelivered&&s.elapsed<s.followThroughUntil-1e-8;s.finished=s.resultDelivered&&!s.following;if(s.finished)s.running=false;
}
function create(config){const scene=config.scenario,s={ready:true,physicsProbe:true,engine:'browser',scenarioId:scene.id,geometry:clone(scene.geometry),ball:clone(scene.ball),actors:clone(scene.actors),elapsed:0,tick:0,running:false,finished:false,following:false,resultDelivered:false,boundaryDelivered:false,goalSign:0,score:[0,0],netPatches:[],events:[],outcome:null,ownerId:null,findings:[{code:'ISOLATED_BALL_PHYSICS',text:'Isolierte Ballphysikprobe: Schwerkraft, Rollreibung, runder Torrahmen und nachgiebiges, nachschwingendes Tornetz. Keine Spielerkontakte oder Match-KI; die Bestandsphysik bleibt getrennt.'}]};
 function emit(type,reason=null){s.events.push({id:s.scenarioId+':'+s.events.length,type,reason,tick:s.tick,time:s.elapsed,position:[...s.ball.position],parentId:s.events.at(-1)?.id||null});}
 return {state:s,step:()=>step(s,config,emit)};
}
const api={create,sweep,substep,step};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.D6BallPhysics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
