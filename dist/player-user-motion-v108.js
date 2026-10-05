'use strict';
// Optional Meshy locomotion. Only presentation bones and heading are changed.
window.D6UserLocomotion={create(v,mesh,skeleton,calibration){
 const T=THREE,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=(a,b,dt,k)=>a+(b-a)*(1-Math.exp(-dt*k)),angle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a)),profiles=calibration.clips,ground=calibration.ground;
 const names=skeleton.bones.map(b=>b.name.replace(/^mixamorig:?/i,'').replace(/[^a-z0-9]/gi,'')),bones=skeleton.bones,index=n=>names.indexOf(n),position=i=>new T.Vector3().setFromMatrixPosition(bones[i].matrixWorld);
 const feet=calibration.soles.map(sole=>({sole,hip:index(sole.side+'UpLeg'),knee:index(sole.side+'Leg'),foot:sole.joint,toes:[index(sole.side+'ToeBase'),index(sole.side+'ToeEnd')].filter(i=>i>=0),anchor:new T.Vector3(),orientation:new T.Quaternion(),locked:false,strength:0,age:0,blocked:false}));
 const state={feet,clock:0,previous:{x:v.base.x,z:v.base.z},turned:null,previousSpeed:0,stationary:0,stopSpeed:0,transition:null,cooldown:0,maxCorrection:0,pelvis:0,enabled:true,resetCount:0,clipTimes:{},frozen:null};
  const idleClip=profiles.idle_stand_meshy?'idle_stand_meshy':'idle_relaxed';
 let phase=(v.number*.61803398875)%1,weights={},idleHeading=null;
 // Use only the quiet tail of the Meshy sprint stop. Walking settles directly
 // into stand; playing the arms-wide sprint brake after the root stops looks wrong.
 const windows={brake_meshy:[1.55,1.93,.38],turn_run_left:[.50,1.38,.62],turn_run_right:[.32,1.32,.62],turn_sharp_right:[.42,1.16,.56],turn_walk_left:[.40,1.80,.78],turn_walk_right:[.35,1.98,.78],turn_idle_left:[0,1,.7],turn_idle_right:[0,1.06,.7],back_step_meshy:[0,.8666,.52]};
 function release(){for(const f of feet){f.locked=false;f.strength=0;f.age=0;f.blocked=false}state.frozen=null;state.resetCount++}
 function start(name){if(!profiles[name])return;state.transition={name,time:0};state.cooldown=windows[name][2]+.35}
 function drive({person,frame,dt,live}){
  const delta=live?clamp(dt,0,.1):0,dx=person.x-state.previous.x,dz=person.z-state.previous.z,distance=Math.hypot(dx,dz),teleport=distance>4||state.turned!==null&&state.turned!==frame.turned;
  state.previous={x:person.x,z:person.z};state.turned=frame.turned;
  if(teleport){release();state.transition=null;state.cooldown=.3;state.previousSpeed=0;idleHeading=null}
  const receiving=person.action?.kind==='receive'||person.action?.kind==='control'&&frame.ball.height<=1.1;
  const speed=delta&&!teleport?clamp(distance/delta,0,8):live?state.previousSpeed:0,m=v.locomotion||{idle:1,walk:0,run:0,turn:0,acceleration:0},filtered=v.runSpeed||0,goal=frame.celebration,celebrating=goal&&goal.team===v.team,special=person.action&&!receiving||person.slideActive||m.slide>.02,direction=distance>.0001?Math.atan2(dx,dz):state.direction||0,angularSpeed=delta&&state.direction!==undefined?angle(state.direction,direction)/delta:0;
  const carrying=frame.owner!=null&&frame.owner===person.id&&frame.carrying!==false&&!frame.ballInFlight&&!person.keeper&&!special&&!celebrating;
  const backward=!carrying&&person.movement?.mode==='backpedal';if(backward!==Boolean(state.backward)&&delta){release();state.transition=null;state.cooldown=.25;if(backward&&speed<1.1)start('back_step_meshy')}state.backward=backward;
  if(carrying){
   // A new ball carrier must not retain defensive steps or turn toward their own ball.
   idleHeading=null;if(!state.carrying){release();state.transition=null;state.cooldown=.25}
   for(const name of Object.keys(weights))if(name.startsWith('back_'))weights[name]=0;
   // Keep the smoothed turn, but never let possession travel behind the facing direction.
   if(delta&&!teleport&&speed>.10&&distance>.0001){v.heading=direction+clamp(angle(direction,v.heading??direction),-Math.PI/3,Math.PI/3);v.root.rotation.y=v.heading}
  }
  if(!person.keeper&&person.movement?.mode==='pursuit'&&!special&&!celebrating){
   idleHeading=null;for(const name of Object.keys(weights))if(name.startsWith('back_'))weights[name]=0;
   if(delta&&!teleport&&speed>.10&&distance>.0001){v.heading=direction+clamp(angle(direction,v.heading??direction),-Math.PI/3,Math.PI/3);v.root.rotation.y=v.heading;}
  }
  state.carrying=carrying;
  if(delta){
   state.stopping=false;
   const beforeStill=state.stationary;state.stationary=speed<.10?state.stationary+delta:0;if(speed>=.10)state.stopSpeed=speed;
   state.clock+=delta;state.cooldown=Math.max(0,state.cooldown-delta);
   if(special||celebrating){state.transition=null;idleHeading=null;release()}
   else if(!person.keeper&&!teleport&&!backward){
    const stopDelay=carrying?.18:.06;
    state.stopping=beforeStill<stopDelay&&state.stationary>=stopDelay&&state.stopSpeed>.22;
    if(state.stopping&&state.stopSpeed>2.2)start('brake_meshy');
    if(!state.transition&&state.cooldown===0){
     if(!carrying&&m.acceleration<-3.2&&filtered>2.2&&speed>.10&&speed<1.4)start('brake_meshy');
     else if(!carrying&&Math.abs(m.turn||0)>(filtered>2?.20:.12)&&speed>.25){const side=m.turn>0?'left':'right';start(filtered>2?side==='right'&&Math.abs(angularSpeed)>5?'turn_sharp_right':'turn_run_'+side:'turn_walk_'+side)}
     else if(!carrying&&m.idle>.9&&speed<.1&&frame.ball){const target=Math.atan2(frame.ball.x-person.x,frame.ball.z-person.z),turn=angle(v.heading||0,target);if(Math.abs(turn)>.8){idleHeading=target;start(turn>0?'turn_idle_left':'turn_idle_right')}}
    }
    if(state.transition?.name==='turn_run_right'&&Math.abs(angularSpeed)>5&&m.turn<0)start('turn_sharp_right');
   }
   if(state.transition){state.transition.time+=delta;if(state.transition.time>=windows[state.transition.name][2])state.transition=null}
   if(idleHeading!==null){if(speed>.25)idleHeading=null;else{v.heading=(v.heading||0)+angle(v.heading||0,idleHeading)*(1-Math.exp(-delta*6));if(Math.abs(angle(v.heading,idleHeading))<.015)idleHeading=null}}
   state.previousSpeed=speed;
   if(distance>.0001)state.direction=direction;
  }
  // Preserve the displayed idle turn when playback is paused.
  if(!special&&!celebrating&&m.idle>.8)v.root.rotation.y=v.heading||0;
  const fast=clamp((filtered-3.2)/1.6,0,1),sprint=clamp((filtered-5.5)/1.3,0,1),gaitRun=clamp((filtered-1.9)/1.3,0,1)*(1-m.idle),gaitWalk=1-m.idle-gaitRun,target={[idleClip]:m.idle,walking:gaitWalk,run_fast6:gaitRun*(1-fast),run_fast4:gaitRun*fast*(1-sprint),sprint_forward:gaitRun*fast*sprint};
  if(!special&&!celebrating&&state.stationary>=(carrying?.18:.06)){for(const n of Object.keys(target))target[n]=n===idleClip?1:0;}
  if(backward){const sideways=Math.cos(v.heading||0)*dx-Math.sin(v.heading||0)*dz,diagonal=clamp(Math.abs(sideways)/Math.max(.0001,distance)*1.7,0,1);for(const n of Object.keys(target))if(n!==idleClip)target[n]=0;target.back_walk=(1-m.idle)*(1-diagonal);target.back_left=(1-m.idle)*diagonal*(sideways>0?1:0);target.back_right=(1-m.idle)*diagonal*(sideways<=0?1:0)}
  const stride=Object.entries(target).reduce((a,[n,w])=>a+(n.startsWith('idle_')?0:(profiles[n]?.stride||2.4)*w),0)/Math.max(.001,1-m.idle);
  if(delta&&!special&&!celebrating&&!teleport){const travel=carrying&&state.stationary<.18?filtered*delta:distance;if(travel>.00001)phase+=travel/Math.max(1.4,stride);}
  if(state.transition&&!special&&!celebrating){const tr=state.transition,w=windows[tr.name],brake=tr.name==='brake_meshy',runningTurn=tr.name.startsWith('turn_run')||tr.name==='turn_sharp_right',envelope=Math.min(1,tr.time/(brake?.10:.11),(w[2]-tr.time)/(brake?.18:.16)),amount=(brake?.32:runningTurn?.28:.72)*clamp(envelope,0,1);if(brake&&speed<.1){for(const n of Object.keys(target))target[n]=n===idleClip?1:0}for(const n of Object.keys(target))target[n]*=1-amount;target[tr.name]=amount}
  if(celebrating){for(const n of Object.keys(target))target[n]=0;target[['celebrate_fist','celebrate_arms','celebrate_victory'][v.number%3]]=1}
  if(person.keeper&&m.keeperReady>.02&&!special&&!celebrating&&profiles.keeper_ready_meshy){for(const n of Object.keys(target))target[n]=0;target.keeper_ready_meshy=1;state.clipTimes.keeper_ready_meshy=state.clock%profiles.keeper_ready_meshy.duration;}
  const all=new Set([...Object.keys(weights),...Object.keys(target)]);for(const n of all)weights[n]=delta?smooth(weights[n]||0,target[n]||0,delta,18):Object.keys(weights).length?weights[n]||0:target[n]||0;
  const total=Object.values(weights).reduce((a,b)=>a+b,0);if(total)for(const n of Object.keys(weights))weights[n]/=total;
  for(const [n,p]of Object.entries(profiles)){
   if(n.startsWith('idle_')||n==='keeper_ready_meshy')state.clipTimes[n]=state.clock%p.duration;
   else if(windows[n]){const w=windows[n];state.clipTimes[n]=state.transition?.name===n?w[0]+clamp(state.transition.time/w[2],0,1)*(w[1]-w[0]):state.clipTimes[n]||w[0]}
   else state.clipTimes[n]=((phase+p.phaseOffset)%1)*p.duration;
  }
  state.enabled=!special&&!(v.locomotion?.slide>.02)&&!celebrating&&!teleport;state.teleport=teleport;
  const dominant=Object.entries(weights).filter(([n])=>n!=='idle_meshy').sort((a,b)=>b[1]-a[1])[0];
  const keeperSide=person.keeper&&m.keeperSide>.02&&!special&&!celebrating;
  const keeperReady=person.keeper&&m.keeperReady>.02&&!special&&!celebrating;
  return {weights,times:state.clipTimes,phase,motion:celebrating?['celebrate_fist','celebrate_arms','celebrate_victory'][v.number%3]:(keeperSide?'keeper_sidestep':keeperReady?'keeper_ready':state.transition?.name||(m.idle>.8?'idle':dominant?.[0]||'idle')),procedural:special||keeperReady?1:0};
 }
 // Move each independent world bone as one rigid chain. Skin weights remain intact.
 function rotateChain(ids,pivot,q){for(const i of ids){const p=new T.Vector3(),r=new T.Quaternion(),s=new T.Vector3();bones[i].matrixWorld.decompose(p,r,s);p.sub(pivot).applyQuaternion(q).add(pivot);r.premultiply(q);bones[i].matrixWorld.compose(p,r,s)}}
 function solve(f,target,orientation){
  const h=position(f.hip),k=position(f.knee),a=position(f.foot),l1=h.distanceTo(k),l2=k.distanceTo(a),axis=target.clone().sub(h),requested=axis.length(),d=clamp(requested,Math.abs(l1-l2)+.002,l1+l2-.002);f.reachError=Math.max(0,requested-d);axis.normalize();
  // Keep the provider's bend plane; straight legs use the rendered forward direction.
  let bend=k.clone().sub(h);bend.addScaledVector(axis,-bend.dot(axis));if(bend.lengthSq()<1e-7){bend=new T.Vector3(0,0,1).applyAxisAngle(new T.Vector3(0,1,0),v.root.rotation.y);bend.addScaledVector(axis,-bend.dot(axis))}bend.normalize();
  const along=(l1*l1+d*d-l2*l2)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along)),newK=h.clone().addScaledVector(axis,along).addScaledVector(bend,height),q1=new T.Quaternion().setFromUnitVectors(k.clone().sub(h).normalize(),newK.clone().sub(h).normalize());
  rotateChain([f.hip,f.knee,f.foot,...f.toes],h,q1);
  const ankle=position(f.foot),knee=position(f.knee),reachable=h.clone().addScaledVector(axis,d),q2=new T.Quaternion().setFromUnitVectors(ankle.clone().sub(knee).normalize(),reachable.clone().sub(knee).normalize());rotateChain([f.knee,f.foot,...f.toes],knee,q2);
  if(orientation){const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();bones[f.foot].matrixWorld.decompose(p,q,s);rotateChain([f.foot,...f.toes],p,orientation.clone().multiply(q.invert()))}
 }
 const vertex=new T.Vector3();
 function confidence(side){if(v.locomotion?.keeperSide>.5)return clamp(-Math.sin((v.runPhase||0)+side*Math.PI)*3,0,1);let contact=0;for(const [n,w]of Object.entries(weights)){const p=profiles[n];if(!p||w<.001)continue;const at=(state.clipTimes[n]||0)/p.duration*120,sample=Math.min(119,Math.floor(at)),next=windows[n]?Math.min(119,sample+1):(sample+1)%120,q=v.meshy?.keeper?0:at-Math.floor(at);contact+=w*(n.startsWith('idle_')?1:p.contacts[sample][side]*(1-q)+p.contacts[next][side]*q)}return contact}
 function measure(f){let y=Infinity;for(const i of f.sole.sampleVertices){mesh.getVertexPosition(i,vertex).applyMatrix4(mesh.matrixWorld);y=Math.min(y,vertex.y)}return {y,marker:new T.Vector3().fromArray(f.sole.center).applyMatrix4(bones[f.foot].matrixWorld)}}
 function apply({live,dt,person,frame}){
  if(!live&&state.frozen&&!state.teleport&&!person.action&&!person.slideActive&&!(v.locomotion?.slide>.02)&&!frame.celebration){bones.forEach((b,i)=>b.matrixWorld.fromArray(state.frozen[i]));skeleton.update();return}
  if(!state.enabled){release();skeleton.update();return}
  const delta=live?clamp(dt,0,.1):0;state.maxCorrection=0;skeleton.update();
  const raw=feet.map(measure),minimum=Math.min(...raw.map(p=>p.y));
  // Correct small rig-height errors without moving the engine root or flattening flight.
  const lift=minimum<ground?clamp(ground-minimum,0,.13):0;if(lift){for(const b of bones)b.matrixWorld.elements[13]+=lift;skeleton.update()}
  let pelvis=0;
  feet.forEach((f,i)=>{const measured=measure(f);if(!f.locked&&(confidence(i)<.5||measured.y>ground+.12||f.blocked))return;const h=position(f.hip),k=position(f.knee),a=position(f.foot),scale=new T.Vector3(),q=new T.Quaternion(),p=new T.Vector3();bones[f.foot].matrixWorld.decompose(p,q,scale);const normal=new T.Vector3().fromArray(f.sole.normal).applyQuaternion(q).normalize(),orientation=f.locked?f.orientation:new T.Quaternion().setFromUnitVectors(normal,new T.Vector3(0,1,0)).multiply(q),anchor=f.locked?f.anchor:measured.marker.clone().setY(ground+.01),target=anchor.clone().sub(new T.Vector3().fromArray(f.sole.center).multiply(scale).applyQuaternion(orientation)),horizontal=Math.hypot(target.x-h.x,target.z-h.z),reach=h.distanceTo(k)+k.distanceTo(a)-.025;if(horizontal<reach)pelvis=Math.max(pelvis,h.y-target.y-Math.sqrt(reach*reach-horizontal*horizontal))});
  state.pelvis=smooth(state.pelvis,clamp(pelvis,0,.28),delta,25);if(state.pelvis){for(const b of bones)b.matrixWorld.elements[13]-=state.pelvis;skeleton.update()}
  feet.forEach((f,i)=>{
   const contact=confidence(i);
   const measured=measure(f),want=contact>.5&&measured.y<ground+.12;
   if(contact<.25)f.blocked=false;
   if(f.locked&&(contact<.25||f.anchor.distanceTo(measured.marker)>.65)){f.locked=false;f.blocked=contact>=.25}
   const footP=new T.Vector3(),footQ=new T.Quaternion(),footS=new T.Vector3();bones[f.foot].matrixWorld.decompose(footP,footQ,footS);
   if(!f.locked&&!f.blocked&&want&&(!live||delta)){f.anchor.copy(measured.marker);f.anchor.y=ground+.01;const normal=new T.Vector3().fromArray(f.sole.normal).applyQuaternion(footQ).normalize();f.orientation.copy(new T.Quaternion().setFromUnitVectors(normal,new T.Vector3(0,1,0)).multiply(footQ));f.locked=true;if(person.keeper)f.strength=1;f.age=0}
   if(f.locked)f.age+=delta;if(person.keeper){if(!f.locked)f.strength=smooth(f.strength,0,delta,35);}else f.strength=smooth(f.strength,f.locked?1:0,delta,f.locked?28:22);
   const marker=measured.marker.clone(),targetMarker=marker.clone();if(f.strength>.001)targetMarker.lerp(f.anchor,f.strength);else if(measured.y<ground)targetMarker.y+=ground-measured.y;
   const correction=targetMarker.clone().sub(marker);state.maxCorrection=Math.max(state.maxCorrection,correction.length());
   if(correction.lengthSq()>.0000001||f.strength>.001){const orientation=footQ.clone().slerp(f.orientation,f.strength),offset=new T.Vector3().fromArray(f.sole.center).multiply(footS).applyQuaternion(orientation),target=targetMarker.clone().sub(offset);solve(f,target,orientation);skeleton.update();const actual=measure(f),clearance=f.locked?0:f.strength>.001?.065*(1-f.strength):0,floorDelta=ground+clearance-actual.y;if(f.locked||floorDelta>0){const adjusted=position(f.foot);adjusted.y+=floorDelta;solve(f,adjusted,orientation);skeleton.update()}}
   f.height=measure(f).y;f.contact=contact;
   if(f.locked&&f.reachError>.015&&f.age>.065){f.locked=false;f.blocked=true}
  });
  state.frozen=bones.map(b=>b.matrixWorld.toArray());
 }
 function shotContact(person,progress,side=1){
  skeleton.update();for(let i=0;i<2;i++){const f=feet[i],sample=measure(f),target=sample.marker.clone();target.y+=Math.max(0,ground-sample.y);
   if(i===side&&progress<.28){const amount=1-Math.min(1,Math.max(0,progress/.28)),facing=v.root.rotation.y;target.lerp(new T.Vector3(person.x+Math.sin(facing)*.51,.13,person.z+Math.cos(facing)*.51),amount*amount)}
   const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();bones[f.foot].matrixWorld.decompose(p,q,s);const offset=new T.Vector3().fromArray(f.sole.center).multiply(s).applyQuaternion(q);solve(f,target.sub(offset),q);skeleton.update();const floorDelta=ground-measure(f).y;if(floorDelta>0){const ankle=position(f.foot);ankle.y+=floorDelta;solve(f,ankle,q);skeleton.update()}
  }
 }
 function footTarget(side,center,weight){const f=feet[side],sample=measure(f),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();bones[f.foot].matrixWorld.decompose(p,q,s);const facing=v.root.rotation.y,target=center.clone().add(new T.Vector3(-Math.sin(facing)*.10,-.15,-Math.cos(facing)*.10)),marker=sample.marker.clone().lerp(target,weight),offset=new T.Vector3().fromArray(f.sole.center).multiply(s).applyQuaternion(q);solve(f,marker.sub(offset),q);skeleton.update();const lift=ground-measure(f).y;if(lift>0){const ankle=position(f.foot);ankle.y+=lift;solve(f,ankle,q);skeleton.update()}}
 return {state,drive,apply,release,shotContact,footTarget};
}};
