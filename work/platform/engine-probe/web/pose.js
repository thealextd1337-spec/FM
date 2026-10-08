(function(root){'use strict';
function sample(a,s){const age=Math.max(0,s.elapsed-(a.poseStarted||0)),prepare=a.pose==='prepare-pass'||a.pose==='prepare-shot',duration=a.pose==='prepare-pass'?.65:.75;let clip=Math.hypot(a.velocity[0],a.velocity[2])>.1?'running':a.role==='keeper'?'keeper_ready_meshy':'idle_stand_meshy',time=s.elapsed;
 if(prepare&&age<duration+1){clip='shot_meshy';time=age<=duration?age/duration*.46:.46+age-duration;}
 if(a.pose==='parry'&&age<1.3){clip='keeper_low_meshy';time=1.1+age;}
 const hand=a.role==='keeper'&&(s.playPhase==='shot-flight'||a.pose==='parry'&&age<.2),kind=hand?'hand':'foot',point=root.D6Play.point(a,kind),distance=Math.hypot(...s.ball.position.map((x,i)=>x-point[i]));
 let active=hand?distance<2||a.pose==='parry'&&age<.2:prepare&&age<duration+.12||s.ownerId===a.id||['receive','intercept'].includes(a.action)&&distance<.85;
 return {clip,time,kind,point,active};
}
function bind(model,T){const bones={};model.traverse(b=>{if(b.isBone)bones[b.name.replace(/^mixamorig[:_]?/,'')]=b;});return {bones,T,model};}
function solve(rig,point,kind){const {bones,T,model}=rig,upper=bones[kind==='hand'?'RightArm':'RightUpLeg'],lower=bones[kind==='hand'?'RightForeArm':'RightLeg'],end=bones[kind==='hand'?'RightHand':'RightFoot'];if(!upper||!lower||!end)return null;
 model.updateWorldMatrix(true,true);const pos=b=>model.worldToLocal(b.getWorldPosition(new T.Vector3())),hip=pos(upper),knee=pos(lower),foot=pos(end),target=model.worldToLocal(new T.Vector3(-point[0],point[1],point[2])),a=hip.distanceTo(knee),b=knee.distanceTo(foot),direction=target.clone().sub(hip),d=Math.min(a+b-1e-5,Math.max(Math.abs(a-b)+1e-5,direction.length()));direction.normalize();
 const along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along)),pole=knee.clone().sub(hip);pole.addScaledVector(direction,-pole.dot(direction));if(pole.lengthSq()<1e-8)pole.set(0,0,1);pole.normalize();const wantedKnee=hip.clone().addScaledVector(direction,along).addScaledVector(pole,height),wantedEnd=hip.clone().addScaledVector(direction,d);
 const endRotation=end.getWorldQuaternion(new T.Quaternion());
 function aim(bone,child,wanted){const parent=bone.parent,from=parent.worldToLocal(child.getWorldPosition(new T.Vector3())).sub(bone.position).normalize(),to=parent.worldToLocal(model.localToWorld(wanted.clone())).sub(bone.position).normalize();bone.quaternion.premultiply(new T.Quaternion().setFromUnitVectors(from,to));model.updateWorldMatrix(true,true);}
 aim(upper,lower,wantedKnee);aim(lower,end,wantedEnd);end.quaternion.copy(end.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(endRotation));model.updateWorldMatrix(true,true);const actual=end.getWorldPosition(new T.Vector3()),canonical=[-actual.x,actual.y,actual.z];return {point:canonical,error:Math.hypot(...canonical.map((x,i)=>x-point[i]))};
}
root.D6Pose={sample,bind,solve};
})(typeof globalThis!=='undefined'?globalThis:this);
