const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {read,accessor,pack}=require('./user-character-glb.cjs');
(async()=>{
 const T=await import('data:text/javascript;base64,'+fs.readFileSync('outputs/meshy-viewer-vendor/three.module.js').toString('base64'));
 const source=JSON.parse(fs.readFileSync('meshy_output/keeper-reference-samples-v130.json')),asset=read('dist/players/football-v113.glb'),json=structuredClone(asset.json),skin=json.skins[0],ibm=accessor(asset,skin.inverseBindMatrices),bind=new Map(),parents={};
 json.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents[c]=i));
 skin.joints.forEach((id,i)=>{const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();new T.Matrix4().fromArray(ibm[i]).invert().decompose(p,q,s);bind.set(id,{p,q,s});});
 const semantic=n=>n.replace(/^mixamorig:?/i,'').replace(/[^a-z0-9]/gi,''),mapping={Hips:'Pelvis',Spine:'Spine1',Spine1:'Spine2',Spine2:'Spine3',Neck:'Neck',Head:'Head'};
 for(const [side,prefix]of [['Left','L_'],['Right','R_']])Object.assign(mapping,{[side+'Shoulder']:prefix+'Collar',[side+'Arm']:prefix+'Shoulder',[side+'ForeArm']:prefix+'Elbow',[side+'Hand']:prefix+'Wrist',[side+'HandMiddle4']:prefix+'Middle3',[side+'UpLeg']:prefix+'Hip',[side+'Leg']:prefix+'Knee',[side+'Foot']:prefix+'Ankle',[side+'ToeBase']:prefix+'Foot'});
 const byName=new Map(source.bind.map(b=>[b.name,b])),hipId=skin.joints.find(id=>semantic(json.nodes[id].name)==='Hips'),leftHip=skin.joints.find(id=>semantic(json.nodes[id].name)==='LeftUpLeg'),leftFoot=skin.joints.find(id=>semantic(json.nodes[id].name)==='LeftFoot');
 const ratio=bind.get(leftHip).p.distanceTo(bind.get(leftFoot).p)/new T.Vector3().fromArray(byName.get('L_Hip').p).distanceTo(new T.Vector3().fromArray(byName.get('L_Ankle').p));
 const standingHip=byName.get('Pelvis').p[1]-(byName.get('L_Ankle').p[1]+byName.get('R_Ankle').p[1])/2+.10;
 const poses=source.frames.map(frame=>{
  const bones=new Map(frame.bones.map(b=>[b.name,b])),hip=bones.get('Pelvis'),delta=new T.Quaternion().fromArray(hip.q).multiply(new T.Quaternion().fromArray(byName.get('Pelvis').q).invert()),forward=new T.Vector3(0,0,1).applyQuaternion(delta),yaw=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-Math.atan2(forward.x,forward.z)),world=new Map();
  function pose(id){if(world.has(id))return world.get(id);const b=bind.get(id),name=mapping[semantic(json.nodes[id].name)];let q;if(name)q=yaw.clone().multiply(new T.Quaternion().fromArray(bones.get(name).q)).multiply(new T.Quaternion().fromArray(byName.get(name).q).invert()).multiply(b.q);else{const parent=parents[id];q=bind.has(parent)?pose(parent).clone().multiply(bind.get(parent).q.clone().invert()).multiply(b.q):b.q.clone();}world.set(id,q.normalize());return q;}
  const rotations=skin.joints.map(id=>{const q=pose(id).clone(),parent=parents[id];if(bind.has(parent))q.premultiply(pose(parent).clone().invert());return q.normalize().toArray();});
  return {time:frame.time,rotations,hip:[bind.get(hipId).p.x,bind.get(hipId).p.y+(hip.p[1]-standingHip)*ratio,bind.get(hipId).p.z]};
 });
 const parts=[asset.bin];let bytes=asset.bin.length;
 function add(rows,type){const flat=rows.flat(),buf=Buffer.alloc(flat.length*4);flat.forEach((v,i)=>{assert(Number.isFinite(v));buf.writeFloatLE(v,i*4)});const pad=(4-bytes%4)%4;if(pad){parts.push(Buffer.alloc(pad));bytes+=pad}const view=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:bytes,byteLength:buf.length});parts.push(buf);bytes+=buf.length;const i=json.accessors.length,a={bufferView:view,componentType:5126,count:rows.length,type};if(type==='SCALAR'){a.min=[Math.min(...flat)];a.max=[Math.max(...flat)]}json.accessors.push(a);return i;}
 function clip(name,frames){const input=add(frames.map(f=>[f.time]),'SCALAR'),animation={name,channels:[],samplers:[],extras:{provider:'Meshy',sourceResource:'text-to-motion',sourceTask:'01a10bf7-4e92-72b7-9cf8-bcee3bb987a2',rootMotion:'horizontal and yaw removed',consumedCredits:10}};
  for(const [i,id]of skin.joints.entries()){animation.channels.push({sampler:animation.samplers.length,target:{node:id,path:'rotation'}});animation.samplers.push({input,output:add(frames.map(f=>f.rotations[i]),'VEC4'),interpolation:'LINEAR'});}
  animation.channels.push({sampler:animation.samplers.length,target:{node:hipId,path:'translation'}});animation.samplers.push({input,output:add(frames.map(f=>f.hip),'VEC3'),interpolation:'LINEAR'});json.animations.push(animation);
 }
 clip('keeper_shuffle_meshy',poses);
 const quiet=poses.slice(0,34).map(f=>({...f,rotations:f.rotations.map(q=>[...q]),hip:[...f.hip]}));
 for(const f of quiet){const t=Math.max(0,Math.min(1,(f.time-(quiet.at(-1).time-.18))/.18)),w=t*t*(3-2*t);f.rotations=f.rotations.map((q,i)=>new T.Quaternion().fromArray(q).slerp(new T.Quaternion().fromArray(quiet[0].rotations[i]),w).toArray());f.hip=f.hip.map((x,i)=>x+(quiet[0].hip[i]-x)*w);}
 clip('keeper_ready_meshy',quiet);
 const bin=Buffer.concat(parts);assert(bin.subarray(0,asset.bin.length).equals(asset.bin));
 const file='meshy_output/character-keeper-v130.glb';pack(json,bin,file);
 fs.writeFileSync('docs/spieler-nutzer-rig/keeper-retarget-v130.json',JSON.stringify({file,sourceTask:'01a10bf7-4e92-72b7-9cf8-bcee3bb987a2',resource:'text-to-motion',consumedCredits:10,sourceFrames:poses.length,sourceJoints:source.bind.length,targetJoints:skin.joints.length,heightRatio:ratio,meshRigTextureAndExistingClipsPreserved:true,originalSHA256:crypto.createHash('sha256').update(asset.bytes).digest('hex'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),mapping},null,2)+'\n');console.log({file,clips:json.animations.length,ratio});
})();
