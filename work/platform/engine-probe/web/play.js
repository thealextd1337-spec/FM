(function(root){'use strict';
// Bounded pass/finish scenes. Player contacts extend the existing ball integrator.
const Physics=typeof module!=='undefined'&&module.exports?require('./physics.js'):root.D6BallPhysics;
const Net=typeof module!=='undefined'&&module.exports?require('./net.js'):root.D6Net;
const clone=x=>JSON.parse(JSON.stringify(x)),DT=1/60;
function actor(s,id){return s.actors.find(a=>a.id===id);}
function point(a,kind='foot'){const f=a.facing||[1,0,0],forward=kind==='hand'?.45:.3,side=kind==='hand'?0:.25;return [a.position[0]+f[0]*forward+f[2]*side,kind==='hand'?1.25:.25,a.position[2]+f[2]*forward-f[0]*side];}
function held(s,a){const p=point(a),f=a.facing,position=[p[0]+f[0]*.24,s.ball.radius,p[2]+f[2]*.24],t=Math.min(1,Math.max(0,(s.elapsed-s.phaseStarted)/.22)),blend=t*t*(3-2*t);for(let i=0;i<3;i++){s.ball.position[i]=s.lastContactPoint&&s.lastActorId===a.id&&t<1?s.lastContactPoint[i]+(position[i]-s.lastContactPoint[i])*blend:position[i];s.ball.velocity[i]=0;}}
function pose(a,name,time){if(a.pose!==name){a.pose=name;a.poseStarted=time;}}
function contact(s,a,kind,emit,type,reason){const center=point(a,kind);emit('contact',a.id,kind,center,kind==='hand'?.22:.12);emit(type,a.id,reason,center,kind==='hand'?.22:.12);s.lastActorId=a.id;s.ignoreUntil=s.elapsed+.4;}
function closest(s,h){
 if(s.ownerId||s.resultDelivered||!['pass-flight','shot-flight','rebound'].includes(s.playPhase))return null;
 let best=null;for(const a of s.actors){const kind=a.action==='parry'&&s.playPhase==='shot-flight'?'hand':'foot';if(kind==='foot'&&!(s.playPhase==='pass-flight'&&['receive','intercept'].includes(a.action)||s.playPhase==='rebound'&&['receive','intercept'].includes(a.action)))continue;if(a.id===s.lastActorId&&s.elapsed<s.ignoreUntil)continue;
 const center=point(a,kind),q=s.ball.position.map((p,i)=>p-center[i]),v=s.ball.velocity.map((p,i)=>p-a.velocity[i]),radius=s.ball.radius+(kind==='hand'?.22:.12),aa=v.reduce((n,x)=>n+x*x,0),bb=q.reduce((n,x,i)=>n+x*v[i],0),cc=q.reduce((n,x)=>n+x*x,0)-radius*radius,disc=bb*bb-aa*cc;
 if(aa<1e-12||disc<0)continue;const t=cc<=0?0:(-bb-Math.sqrt(disc))/aa;if(t<0||t>h||bb>=0&&cc>0)continue;if(!best||t<best.t-1e-9||Math.abs(t-best.t)<1e-9&&a.id<best.actor.id)best={t,actor:a,kind};
 }return best;
}
function resolve(s,hit,emit){const a=hit.actor;
 if(hit.kind==='hand'){contact(s,a,'hand',emit,'parry','Handkontakt');const center=point(a,'hand'),n=s.ball.position.map((x,i)=>x-center[i]),length=Math.hypot(...n);for(let i=0;i<3;i++)n[i]/=length;const speed=s.ball.velocity.reduce((v,x,i)=>v+x*n[i],0);for(let i=0;i<3;i++)s.ball.velocity[i]=(s.ball.velocity[i]-1.65*speed*n[i])*.35;s.ownerId=null;s.playPhase='rebound';s.phaseStarted=s.elapsed;s.lastContactPoint=[...s.ball.position];pose(a,'parry',s.elapsed);emit('free-ball',a.id,'Abpraller ohne Besitzer');return;}
 contact(s,a,'foot',emit,s.playPhase==='rebound'?'possession':a.action==='intercept'?'interception':'received','Fußkontakt');s.ownerId=a.id;s.phaseStarted=s.elapsed;s.lastContactPoint=[...s.ball.position];for(const other of s.actors)other.velocity=[0,0,0];pose(a,'receive',s.elapsed);held(s,a);
 if(s.playPhase==='rebound'||a.action==='intercept'){s.outcome=a.action==='intercept'&&s.playPhase==='pass-flight'?'interception':'possession';s.playPhase='complete';}else{s.playPhase='prepare-shot';s.releaseAt=s.elapsed+.75;}
}
function prepare(s,scene,emit){
 if(s.resultDelivered)return;
 if(s.ownerId&&['prepare-pass','prepare-shot'].includes(s.playPhase)){const a=actor(s,s.ownerId),shoot=s.playPhase==='prepare-shot';pose(a,shoot?'prepare-shot':'prepare-pass',s.phaseStarted);held(s,a);if(s.elapsed<s.releaseAt-1e-9)return;
  const center=point(a),distance=Math.hypot(...s.ball.position.map((x,i)=>x-center[i]));if(distance>s.ball.radius+.12+1e-8){s.outcome='missed-release';s.playPhase='complete';emit('missed-contact',a.id,'Ball außerhalb des Fußkontakts');return;}
  contact(s,a,'foot',emit,shoot?'shot-release':'pass-release',shoot?'Schuss':'Pass');s.ownerId=null;s.lastContactPoint=[...s.ball.position];s.phaseStarted=s.elapsed;
  if(shoot){const sign=scene.geometry.attackDirection,target=[sign*scene.geometry.length/2,1.5,scene.play.targetZ],delta=target.map((x,i)=>x-s.ball.position[i]),length=Math.hypot(delta[0],delta[2]),duration=length/18;s.ball.velocity=[delta[0]/duration,(delta[1]+4.905*duration*duration)/duration,delta[2]/duration];s.playPhase='shot-flight';}
  else{const target=point(actor(s,scene.play.receiverId)),delta=target.map((x,i)=>x-s.ball.position[i]),length=Math.hypot(delta[0],delta[2]);s.ball.velocity=[delta[0]/length*13,0,delta[2]/length*13];s.playPhase='pass-flight';}
 }
 if(s.playPhase==='rebound')for(const a of s.actors){if(!['receive','intercept'].includes(a.action))continue;const dx=s.ball.position[0]-a.position[0],dz=s.ball.position[2]-a.position[2],length=Math.hypot(dx,dz);if(length>.01)a.facing=[dx/length,0,dz/length];const speed=a.action==='intercept'?5.8:5.5;a.velocity=length>.4?[dx/length*speed,0,dz/length*speed]:[0,0,0];pose(a,'chase',s.elapsed);}
}
function step(s,config,emit){if(!s.running||s.finished)return;const end=s.resultDelivered?s.followThroughUntil:config.scenario.duration,dt=Math.min(DT,end-s.elapsed);
 const move=h=>{for(const a of s.actors)for(let i=0;i<3;i++)a.position[i]+=a.velocity[i]*h;s.elapsed+=h;s.tick=Math.round(s.elapsed/DT);};
 for(let n=0;n<8&&dt>1e-10;n++){const h=dt/8;prepare(s,config.scenario,emit);if(s.ownerId){move(h);held(s,actor(s,s.ownerId));Net.step(s,h,(type,reason)=>emit(type,null,reason));}else Physics.substep(s,h,(type,reason)=>emit(type,null,reason),{find:remaining=>closest(s,remaining),move,resolve:hit=>resolve(s,hit,emit)});}
 if(!s.resultDelivered&&(['goal','out','interception','possession','missed-release'].includes(s.outcome)||s.elapsed>=config.scenario.duration-1e-8)){s.resultDelivered=true;s.resolvedAt=s.elapsed;s.followThroughUntil=s.elapsed+(config.followThroughSeconds||0);s.playPhase='complete';emit('result',s.ownerId,s.outcome||'Kein Kontakt bis zum Szenenende');}
 s.following=s.resultDelivered&&s.elapsed<s.followThroughUntil-1e-8;s.finished=s.resultDelivered&&!s.following;if(s.finished)s.running=false;
}
function create(config){const s=Physics.create(config).state;s.physicsProbe=false;s.playProbe=true;s.playPhase='prepare-pass';s.phaseStarted=0;s.releaseAt=.65;s.lastContactPoint=null;s.lastActorId=null;s.ignoreUntil=0;s.ownerId=config.scenario.play.passerId;s.findings=[{code:'CONNECTED_PLAY',text:'Zusammenhängende lokale Spielprobe: reale bewegte Fuß-/Handkontaktvolumen, vorbereitete Freigabe, Besitzwechsel und freie Abpraller. Die Animation liest den Zustand und richtet das Kontaktglied aus. Keine vollständige Match-KI oder Meshkollision.'}];held(s,actor(s,s.ownerId));
 function emit(type,actorId=null,reason=null,contactPoint=null,contactRadius=0){s.events.push({id:s.scenarioId+':'+s.events.length,type,actorId,reason,tick:s.tick,time:s.elapsed,position:[...s.ball.position],parentId:s.events.at(-1)?.id||null,contactPoint:contactPoint&&[...contactPoint],contactRadius,ballDistance:contactPoint?Math.hypot(...s.ball.position.map((x,i)=>x-contactPoint[i])):0});}
 return {state:s,step:()=>step(s,config,emit)};
}
const api={create,step,point,closest};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.D6Play=api;
})(typeof globalThis!=='undefined'?globalThis:this);
