'use strict';
// Meshy source clips, contact constraints and transitions; never advances the match.
window.D6UserBallActions={create({visual:v,state,mesh,skeleton,locomotion,actions}){
 const T=THREE,bones=skeleton.bones,names=bones.map(b=>b.name.replace(/^mixamorig:?/i,'').replace(/[^a-z0-9]/gi,'')),index=n=>names.indexOf(n),position=i=>new T.Vector3().setFromMatrixPosition(bones[i].matrixWorld),clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)},arms=['Left','Right'].map(side=>({shoulder:index(side+'Arm'),elbow:index(side+'ForeArm'),hand:index(side+'Hand'),finger:index(side+'HandMiddle4')})),hips=index('Hips');
 const mirrorIndices=names.map(n=>index(n.startsWith('Left')?'Right'+n.slice(4):n.startsWith('Right')?'Left'+n.slice(5):n)),reflect=new T.Matrix4().makeScale(-1,1,1),point=new T.Vector3();
 let previous=null,exit=0,lastKey=null,entry=null,entryAge=1,holdCenter=null;
 function plan(person,frame){
  const a=person.action,p=clamp(a?.progress||0,0,1),r=clamp(a?.recovery||0,0,1);if(!a)return null;
  if(person.slideActive&&!person.keeper)return null;
  if(!person.keeper&&(v.locomotion?.slide||0)>.02&&['passReady','kickReady','receive','control'].includes(a.kind))return null;
  const target=a.target&&v98PitchPoint(a.target,frame.turned),origin=a.origin?v98PitchPoint(a.origin,frame.turned):person,lateral=target?(target.x-origin.x)*Math.cos(v.root.rotation.y)-(target.z-origin.z)*Math.sin(v.root.rotation.y):0,side=Math.sign(lateral)||1;
  if(a.kind==='foulVictim')return a.age<1.25?{clip:'foul_fall_meshy',time:Math.min(2.2666,a.age/.8*2.2666),mode:'foul_fall',weight:1,foul:true}:{clip:'keeper_rise_meshy',time:1.9+(6.8-1.9)*smooth((a.age-1.25)/1.45),mode:'foul_rise',weight:1,foul:true};
  if(a.kind==='foulOffender')return {clip:'foul_stumble_meshy',time:Math.min(2.7,a.age),mode:'foul_stumble',weight:1,foul:true};
  if(a.kind==='tackle')return {clip:'shot_meshy',time:.40+.42*p,mode:'tackle_meshy',weight:.72,foot:p};
  if(a.kind==='throw'){const pickup=a.holding&&a.pickup<.85;return {clip:pickup?'keeper_low_meshy':'idle_stand_meshy',time:pickup?1.42+1.13*smooth(a.pickup):0,mode:pickup?'throw_pickup':a.holding?'throw_hold':'throw_release',weight:1,throw:true};}
  if(['shot','freeKick','pass','cross','highPass','kickReady','passReady'].includes(a.kind)){
   const pass=['pass','passReady'].includes(a.kind),high=['cross','highPass'].includes(a.kind),ready=['kickReady','passReady'].includes(a.kind);return {clip:'shot_meshy',time:ready?.14+p*.35:.49+p*(pass?.67:high?.85:1.143333),mode:ready?pass?'pass_ready':'shot_ready':pass?'pass_meshy':high?'cross_meshy':'shot_meshy',weight:(pass?.72:1)*(a.direct&&ready?smooth(p/.35):1),foot:ready?1:p,ready,direct:Boolean(a.direct)};
  }
  if(['control','receive'].includes(a.kind)){if(a.kind==='control'&&frame.ball.height>1.1)return null;return {clip:'shot_meshy',time:.49-.12*p,mode:'receive_meshy',weight:(v.runSpeed>.25?.12:.28)*(1-smooth(p)),foot:p,receive:true};}
  if(a.kind==='goalKick'){
   if(a.held!==false&&a.phase==='waiting'&&p<.55)return {clip:'keeper_low_meshy',time:2.55,mode:'keeper_hold',weight:1,hold:true};
   if(a.held===false&&a.phase==='waiting'&&p===0)return {clip:'idle_stand_meshy',time:0,mode:'keeper_ground_ready',weight:1,grounded:true};
   return {clip:'shot_meshy',time:a.phase==='follow'?.49+p*.82:.14+p*.35,mode:'keeper_kick',weight:1,foot:a.phase==='follow'?p:1,ready:a.phase!=='follow',transfer:a.held!==false&&a.phase==='waiting'?(p-.55)/.45:null};
  }
  if(a.kind!=='save')return null;
  if(a.smother){const rise=r>.25;return {clip:rise?'keeper_rise_meshy':'keeper_low_meshy',time:rise?4.8+2*smooth((r-.25)/.75):1.42+.80*r,mode:rise?'keeper_smother_recover':'keeper_smother',weight:1,keeper:true,smother:true,rise,hold:a.saved&&frame.owner===person.id&&!frame.ballInFlight,side,high:false,wide:false,recovery:r,contact:p};}
  const high=a.height>1.65,wide=Math.abs(lateral)>.65,low=!high&&!wide,clip=high?'keeper_high_meshy':wide?'keeper_dive_meshy':'keeper_low_meshy',contact=high?1.63:wide?.77:1.42;
  const riseAt=high?.32:.42;
  if(r>riseAt)return {clip:'keeper_rise_meshy',time:1.9+(6.8-1.9)*smooth((r-riseAt)/(1-riseAt)),mode:'keeper_rise',weight:1,keeper:true,rise:true,miss:Boolean(a.goal),hold:a.saved&&frame.owner===person.id&&!frame.ballInFlight,side,high,wide,recovery:r,contact:1};
  // Enter the rise earlier, before the late catch pose requires a large floor correction.
  return {clip,time:r?contact+(high?.58:wide?.90:1.05)*Math.min(1,r/(high?.32:1)):Math.max(0,contact-(high?.8:wide?.6:.85)*(1-p)),mode:r?'keeper_recover':a.parry?side>0?'keeper_parry_right':'keeper_parry_left':low?'keeper_catch_low':high?'keeper_catch_high':side>0?'keeper_dive_right':'keeper_dive_left',weight:r?1:smooth(p/.3),keeper:true,singleHand:Boolean(a.parry),miss:Boolean(a.goal),hold:!a.parry&&a.saved&&frame.owner===person.id&&!frame.ballInFlight,side,high,wide,recovery:r,contact:p,mirror:wide&&side<0};
 }
 function shift(delta){for(const b of bones){b.matrixWorld.elements[12]+=delta.x;b.matrixWorld.elements[13]+=delta.y;b.matrixWorld.elements[14]+=delta.z}skeleton.update()}
 function rotate(ids,pivot,q){for(const i of ids){const p=new T.Vector3(),r=new T.Quaternion(),s=new T.Vector3();bones[i].matrixWorld.decompose(p,r,s);p.sub(pivot).applyQuaternion(q).add(pivot);r.premultiply(q);bones[i].matrixWorld.compose(p,r,s)}skeleton.update()}
 function armTarget(a,target){const h=position(a.shoulder),e=position(a.elbow),hand=position(a.hand),l1=h.distanceTo(e),l2=e.distanceTo(hand),axis=target.clone().sub(h),d=clamp(axis.length(),Math.abs(l1-l2)+.005,l1+l2-.005);axis.normalize();const bend=e.clone().sub(h).addScaledVector(axis,-e.clone().sub(h).dot(axis));if(bend.lengthSq()<1e-6)bend.set(0,-1,0).addScaledVector(axis,axis.y);bend.normalize();const along=(l1*l1+d*d-l2*l2)/(2*d),k=h.clone().addScaledVector(axis,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along))),q=new T.Quaternion().setFromUnitVectors(e.clone().sub(h).normalize(),k.clone().sub(h).normalize());rotate([a.shoulder,a.elbow,a.hand,a.finger],h,q);const ankle=position(a.hand),end=h.clone().addScaledVector(axis,d);rotate([a.elbow,a.hand,a.finger],k,new T.Quaternion().setFromUnitVectors(ankle.sub(k).normalize(),end.sub(k).normalize()))}
 function hands(center,budget=.35){const side=new T.Vector3(Math.cos(v.root.rotation.y),0,-Math.sin(v.root.rotation.y));for(let k=0;k<3;k++){for(const [i,a]of arms.entries()){const shoulder=position(a.shoulder),elbow=position(a.elbow),reach=shoulder.distanceTo(elbow)+elbow.distanceTo(position(a.hand))-.02,toTarget=center.clone().addScaledVector(side,i?-.15:.15).sub(shoulder),over=toTarget.length()-reach;if(over>0&&budget>0){const amount=Math.min(over,budget);shift(toTarget.normalize().multiplyScalar(amount));budget-=amount}}floor()}for(const [i,a]of arms.entries())armTarget(a,center.clone().addScaledVector(side,i?-.15:.15));state.handContact=Math.max(...arms.map(a=>position(a.hand).distanceTo(center)))}
 function floor(grounded=false){let min=Infinity;for(let i=0;i<mesh.geometry.attributes.position.count;i+=9){mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);min=Math.min(min,point.y)}if(min<.105||grounded)shift(new T.Vector3(0,.105-min,0));state.skinFloor=min}
 function cache(){const inverse=v.root.matrixWorld.clone().invert();return bones.map(b=>inverse.clone().multiply(b.matrixWorld))}
 function blend(from,w){for(let i=0;i<bones.length;i++){const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3(),bp=new T.Vector3(),bq=new T.Quaternion(),bs=new T.Vector3();bones[i].matrixWorld.decompose(p,q,s);v.root.matrixWorld.clone().multiply(from[i]).decompose(bp,bq,bs);p.lerp(bp,w);q.slerp(bq,w);s.lerp(bs,w);bones[i].matrixWorld.compose(p,q,s)}skeleton.update()}
 function apply({person,frame,dt,live,plan:a,drive,entryPose}){
  const delta=live?Math.max(0,dt):0;state.ballPoint=null;state.heldBallPoint=null;state.dribble=null;if(a?.miss)state.handContact=null;
  if(!a?.hold)holdCenter=null;
  if(a){
   if(a.mirror){const inverse=v.root.matrixWorld.clone().invert(),copy=bones.map(b=>b.matrixWorld.clone());bones.forEach((b,i)=>b.matrixWorld.copy(v.root.matrixWorld).multiply(reflect).multiply(inverse).multiply(copy[mirrorIndices[i]]).multiply(reflect));skeleton.update()}
   // A wide save travels sideways from its launch point as well as rotating.
   // Keep the displacement bounded; the final hand IK uses the same ball point.
   state.diveShift=0;
   if(a.keeper&&a.wide&&!a.smother&&!a.rise&&!a.miss){const target=person.action?.target&&v98PitchPoint(person.action.target,frame.turned),origin=person.action?.origin?v98PitchPoint(person.action.origin,frame.turned):person,side=new T.Vector3(Math.cos(v.root.rotation.y),0,-Math.sin(v.root.rotation.y)),lateral=target?(target.x-origin.x)*side.x+(target.z-origin.z)*side.z:0,budget=Math.min(1.65,Math.max(.55,(person.action.available||.65)*2));state.diveShift=Math.sign(lateral)*Math.min(budget,Math.max(0,Math.abs(lateral)-.65))*smooth(a.contact/.85)*(1-smooth(a.recovery));shift(side.multiplyScalar(state.diveShift));}
   if(a.keeper&&a.wide&&!a.high){const pivot=position(hips),q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1).applyQuaternion(v.root.getWorldQuaternion(new T.Quaternion())),-a.side*1.50*a.contact*(1-a.recovery));rotate(bones.map((_,i)=>i),pivot,q);shift(new T.Vector3(0,-.62*a.contact*(1-a.recovery),0))}
   if(a.smother&&!a.rise){const pivot=position(hips),right=new T.Vector3(1,0,0).applyQuaternion(v.root.getWorldQuaternion(new T.Quaternion())),q=new T.Quaternion().setFromAxisAngle(right,.35*a.contact*(1-a.recovery));rotate(bones.map((_,i)=>i),pivot,q);floor(true);}
   const key=a.mode+':'+a.clip+':'+Boolean(a.mirror)+':'+(person.action?.id||person.action?.kind);if(key!==lastKey){entry=previous||(a.foul||a.direct?entryPose:null);entryAge=0;lastKey=key}entryAge+=delta;
   const entryDuration=a.keeper?.20:.13;
   if(entry&&entryAge<entryDuration&&(a.direct||!a.foot&&!a.receive))blend(entry,1-smooth(entryAge/entryDuration));
   if(a.foot!==undefined){if(a.direct){locomotion.shotContact(person,.28);const point=person.action.contact&&v98PitchPoint(person.action.contact,frame.turned),contact=point&&new T.Vector3(point.x,.29,point.z),weight=a.ready?smooth(person.action.progress):1-smooth(a.foot/.28);if(contact&&contact.distanceTo(new T.Vector3(person.x,.29,person.z))<1.15)locomotion.footTarget(1,contact,weight);}else if(!a.receive)locomotion.shotContact(person,a.foot);else{const carrying=frame.owner===person.id&&frame.carrying!==false&&!frame.ballInFlight,contact=carrying?new T.Vector3(person.x+Math.sin(v.heading)*.65,Math.min(.48,frame.ball.height),person.z+Math.cos(v.heading)*.65):new T.Vector3(frame.ball.x,Math.min(.48,frame.ball.height),frame.ball.z);if(carrying)state.ballPoint=contact.clone();if(contact.distanceTo(new T.Vector3(person.x,.29,person.z))<1.15)locomotion.footTarget(1,contact,(v.runSpeed>.25?.3:.7)*(1-smooth(a.foot/.55)))}}
   if(a.throw){const p=person.action,lead=p.holding?-.10:-.10+.42*smooth(p.progress/.45),forward=new T.Vector3(Math.sin(v.root.rotation.y),0,Math.cos(v.root.rotation.y)),center=p.holding?new T.Vector3(frame.ball.x,frame.ball.height,frame.ball.z):new T.Vector3(person.x,3.04,person.z).addScaledVector(forward,lead),reach=p.holding?1:1-smooth((p.progress-.45)/.55);floor();if(reach>0){const before=cache();hands(center,0);if(reach<1)blend(before,1-reach)}floor();}
   if(a.grounded)floor();
   if((a.keeper||a.hold)&&!a.miss){
    floor();const forward=new T.Vector3(Math.sin(v.root.rotation.y),0,Math.cos(v.root.rotation.y)),target=person.action?.target&&v98PitchPoint(person.action.target,frame.turned),contact=target?new T.Vector3(target.x,person.action.height||frame.ball.height,target.z):new T.Vector3(frame.ball.x,frame.ball.height,frame.ball.z),chest=position(hips).addScaledVector(forward,.46).add(new T.Vector3(0,.34,0)),center=a.hold?a.keeper?contact.clone().lerp(chest,smooth(a.recovery/.65)):chest:contact,reach=a.hold?1:a.rise?0:smooth(a.smother?(a.contact-.12)/.5:(a.contact-.52)/.48)*(1-smooth(a.recovery/(person.action?.parry?.12:1)));
    const incomingBall=typeof v98Scene!=='undefined'&&v98Scene?.controlBall;if(live&&a.smother&&!a.rise&&!a.hold&&incomingBall&&incomingBall.turned===frame.turned&&incomingBall.opacity>.1&&center.distanceTo(new T.Vector3(incomingBall.x,incomingBall.height,incomingBall.z))<3)center.set(incomingBall.x,incomingBall.height,incomingBall.z);
    if(a.hold){const previousBall=typeof v98Scene!=='undefined'&&v98Scene?.controlBall;if(!holdCenter&&previousBall&&previousBall.turned===frame.turned&&previousBall.opacity>.1&&center.distanceTo(new T.Vector3(previousBall.x,previousBall.height,previousBall.z))<3)holdCenter=new T.Vector3(previousBall.x,previousBall.height,previousBall.z);if(holdCenter){const offset=center.clone().sub(holdCenter),length=offset.length(),limit=6*delta;if(length>limit)center.copy(holdCenter).addScaledVector(offset,limit/Math.max(.001,length))}holdCenter=center.clone()}
    if(reach>0){const hand=a.singleHand?arms[a.side>0?1:0]:null,middle=hand?position(hand.hand):position(arms[0].hand).add(position(arms[1].hand)).multiplyScalar(.5),correction=center.clone().sub(middle);correction.y=clamp(correction.y,-.40,.7);correction.clampLength(0,a.high?1:.85).multiplyScalar(reach);shift(correction);floor();if(hand){armTarget(hand,center);const remaining=center.clone().sub(position(hand.hand));if(remaining.length()>.005){shift(remaining.clampLength(0,a.high?.60:.45).multiplyScalar(reach));floor();armTarget(hand,center);}state.handContact=position(hand.hand).distanceTo(center);state.parryHand=a.side>0?'right':'left';}else{hands(center,a.high?.50:.35);state.parryHand=null;}}floor(a.hold&&!a.high);if(a.hold)state.heldBallPoint=position(arms[0].hand).add(position(arms[1].hand)).multiplyScalar(.5);
   }
   if(a.keeper&&a.miss)floor();
   if(a.foul)floor(a.mode==='foul_stumble');
   if(state.heldBallPoint)state.heldLocal=state.heldBallPoint.clone().applyMatrix4(v.root.matrixWorld.clone().invert());if(a.transfer!==null&&a.transfer!==undefined&&state.heldLocal){const foot=new T.Vector3(person.x+Math.sin(v.root.rotation.y)*.65,.29,person.z+Math.cos(v.root.rotation.y)*.65);state.heldBallPoint=state.heldLocal.clone().applyMatrix4(v.root.matrixWorld).lerp(foot,smooth(a.transfer))}
   previous=cache();exit=.20;
  }else{
   lastKey=null;entry=null;if(previous&&!person.action&&!person.slideActive&&!frame.celebration){exit=Math.max(0,exit-delta);if(exit>0)blend(previous,smooth(exit/.20));else previous=null}else previous=null;
   // Keep ready gloves low and forward with natural arm reach, then turn
   // the palms toward the ball. Catch and hold actions use their own contacts.
   if(person.keeper&&!person.action&&!person.slideActive&&!frame.celebration&&frame.owner!==person.id&&(v.locomotion?.keeperReady||0)>.001){
    const weight=v.locomotion.keeperReady,forward=new T.Vector3(Math.sin(v.heading),0,Math.cos(v.heading)),side=new T.Vector3(Math.cos(v.heading),0,-Math.sin(v.heading)),center=position(hips).addScaledVector(forward,.40).add(new T.Vector3(0,-.18,0)),before=cache();
    for(const [i,arm]of arms.entries())armTarget(arm,center.clone().addScaledVector(side,i===0?.38:-.38));
    if(weight<1)blend(before,1-weight);
    for(const [i,arm]of arms.entries()){
     const wrist=position(arm.hand),axis=wrist.clone().sub(position(arm.elbow)).normalize(),q=new T.Quaternion();bones[arm.hand].matrixWorld.decompose(new T.Vector3(),q,new T.Vector3());
     const palm=new T.Vector3(i===0?1:-1,0,0).applyQuaternion(q),target=forward.clone().addScaledVector(axis,-forward.dot(axis));palm.addScaledVector(axis,-palm.dot(axis));
     if(palm.lengthSq()>1e-6&&target.lengthSq()>1e-6){palm.normalize();target.normalize();const angle=Math.atan2(axis.dot(palm.clone().cross(target)),palm.dot(target));rotate([arm.hand,arm.finger],wrist,new T.Quaternion().setFromAxisAngle(axis,clamp(angle,-Math.PI/2,Math.PI/2)*weight));}
    }
   }
   if(person.action?.kind==='throw'){
    const weight=person.action.holding?1:1-smooth(person.action.progress/.45);
    if(weight>0){const before=cache();hands(new T.Vector3(person.x,3.04,person.z));if(weight<1)blend(before,1-weight)}
    state.motion=person.action.holding?'throw_hold':'throw_release';
   }
   if(frame.owner!=null&&frame.owner===person.id&&frame.carrying!==false&&!person.keeper&&!person.action&&!person.slideActive&&!frame.celebration&&!frame.ballInFlight&&frame.ball.opacity!==0){
    const speed=v.runSpeed||0,phase=((drive.phase*2)%1+1)%1,forward=new T.Vector3(Math.sin(v.heading),0,Math.cos(v.heading)),side=((Math.floor(drive.phase*2)%2)+2)%2,lead=speed>.25?.58+.36*(.5-.5*Math.cos(phase*Math.PI*2)):.57,center=person.person?new T.Vector3(frame.ball.x,.29,frame.ball.z):new T.Vector3(person.x,.29,person.z).addScaledVector(forward,lead);if(!person.person)center.addScaledVector(new T.Vector3(Math.cos(v.heading),0,-Math.sin(v.heading)),Math.sin(phase*Math.PI*2)*.13);
    // Let the native stride carry the foot: a brief 65% snap to the ball breaks
    // every half-cycle. This bounded touch has zero slope at entry and release.
    if(phase<.5&&speed>.25){const touch=Math.sin(phase*Math.PI/.5)**2;locomotion.footTarget(side,center,.20*touch);if(!person.person)center.addScaledVector(forward,.07*touch);}
    state.ballPoint=center;state.dribble={phase,lead:center.distanceTo(new T.Vector3(person.x,.29,person.z)),speed,foot:side};state.motion=speed>.25?'dribble_meshy':state.motion;
   }else state.dribble=null;
  }
  // Native locomotion releases its foot anchors during a slide. Constrain the
  // final blended skin too, including the transition back to standing.
  if(!person.keeper&&(person.slideActive||(v.locomotion?.slide||0)>.02)&&!a?.foul){floor();state.motion=person.slideActive?'slide_tackle':'slide_recover';}
  skeleton.update();
 }
 return {plan,apply};
}};
