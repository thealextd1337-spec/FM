const fs=require('fs'),{read,accessor}=require('./user-character-glb.cjs');
(async()=>{
 const T=await import('data:text/javascript;base64,'+fs.readFileSync('outputs/meshy-viewer-vendor/three.module.js').toString('base64'));
 const asset=read(process.argv[2]||'meshy_output/user-character-2026-10-03/character-locomotion-v108.glb'),j=asset.json,skin=j.skins[0],parents={};j.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents[c]=i));
 const bind=accessor(asset,skin.inverseBindMatrices).map(v=>new T.Matrix4().fromArray(v)),primitive=j.meshes[0].primitives[0],vertices=accessor(asset,primitive.attributes.POSITION),indices=accessor(asset,primitive.attributes.JOINTS_0),weights=accessor(asset,primitive.attributes.WEIGHTS_0),sem=n=>n.replace(/^mixamorig:?/i,'').replace(/[^a-z0-9]/gi,'');
 const footJoints=['Left','Right'].map(side=>skin.joints.findIndex(n=>sem(j.nodes[n].name)===side+'Foot'));
 const soles=footJoints.map((joint,side)=>{
  const rows=vertices.map((p,i)=>({p,i})).filter(({p,i})=>p[1]<.14&&indices[i].some((v,k)=>v===joint&&weights[i][k]>.45));
  const min=Math.min(...rows.map(r=>r.p[1])),lowest=rows.filter(r=>r.p[1]<min+.012),center=new T.Vector3();lowest.forEach(r=>center.add(new T.Vector3().fromArray(r.p).applyMatrix4(bind[joint])));center.divideScalar(lowest.length);const inverseRotation=new T.Quaternion().setFromRotationMatrix(bind[joint]);
  // Samples spread across the real shoe, including every extremal vertex.
  const selected=[...new Set([...rows.filter((_,i)=>i%Math.max(1,Math.floor(rows.length/48))===0).map(r=>r.i),...['x','y','z'].flatMap(axis=>{const k={x:0,y:1,z:2}[axis];return[rows.reduce((a,b)=>a.p[k]<b.p[k]?a:b).i,rows.reduce((a,b)=>a.p[k]>b.p[k]?a:b).i]})])];
  return {side:side?'Right':'Left',joint,center:center.toArray(),normal:new T.Vector3(0,1,0).transformDirection(bind[joint]).toArray(),sampleVertices:selected,vertexCount:rows.length};
 });
 function pose(c,time){
  const p=j.nodes.map(n=>new T.Vector3().fromArray(n.translation||[0,0,0])),q=j.nodes.map(n=>new T.Quaternion().fromArray(n.rotation||[0,0,0,1])),s=j.nodes.map(n=>new T.Vector3().fromArray(n.scale||[1,1,1]));
  for(const ch of c.channels){const sp=c.samplers[ch.sampler],times=accessor(asset,sp.input).flat(),v=accessor(asset,sp.output);let hi=times.findIndex(t=>t>=time);if(hi<0)hi=times.length-1;const lo=Math.max(0,hi-1),a=sp.interpolation==='STEP'?0:Math.max(0,Math.min(1,(time-times[lo])/Math.max(1e-8,times[hi]-times[lo]))),dest=ch.target.path==='rotation'?q[ch.target.node]:ch.target.path==='translation'?p[ch.target.node]:s[ch.target.node];dest.fromArray(v[lo]);if(ch.target.path==='rotation')dest.slerp(new T.Quaternion().fromArray(v[hi]),a);else dest.lerp(new T.Vector3().fromArray(v[hi]),a);}
  const world=[];function matrix(i){if(world[i])return world[i];const n=j.nodes[i],m=n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(p[i],q[i],s[i]);return world[i]=parents[i]===undefined?m:matrix(parents[i]).clone().multiply(m)}j.nodes.forEach((_,i)=>matrix(i));return world;
 }
 const profiles={};
 for(const c of j.animations.filter(c=>c.name!=='Charged_Spell_Cast'&&!c.name.startsWith('celebrate_'))){
  const duration=Math.max(...c.samplers.flatMap(s=>accessor(asset,s.input).flat())),samples=[];
  for(let k=0;k<=120;k++){
   const time=duration*k/120,world=pose(c,time),matrices=skin.joints.map((n,i)=>world[n].clone().multiply(bind[i])),feet=soles.map(sole=>{
    let minY=Infinity;for(const i of sole.sampleVertices){const p=new T.Vector3();for(let z=0;z<4;z++)if(weights[i][z])p.addScaledVector(new T.Vector3().fromArray(vertices[i]).applyMatrix4(matrices[indices[i][z]]),weights[i][z]);minY=Math.min(minY,p.y)}
    const point=new T.Vector3().fromArray(sole.center).applyMatrix4(world[skin.joints[sole.joint]]);return {minY,point:point.toArray()};
   });samples.push({phase:k/120,feet});
  }
  const ranges=[0,1].map(i=>{const ys=samples.map(s=>s.feet[i].minY);return {min:Math.min(...ys),max:Math.max(...ys)}});
  const cycle=['walking','running','run_fast4','run_fast6','sprint_forward','back_walk','back_left','back_right'].includes(c.name),back=c.name.startsWith('back_');
  const contacts=samples.map((s,k)=>s.feet.map((f,i)=>{const previous=samples[Math.max(0,k-1)].feet[i].point[2],next=samples[Math.min(120,k+1)].feet[i].point[2],counter=back?next-previous:previous-next;return f.minY<ranges[i].min+Math.min(.065,(ranges[i].max-ranges[i].min)*.3+.008)&&(!cycle||counter>.0005)}));
  // Align all cycles to left-foot landing, before its low backward stance sweep.
  let landing=contacts.findIndex((v,k)=>k>0&&v[0]&&!contacts[k-1][0]);if(landing<0)landing=0;
  const velocities=[];for(let k=1;k<samples.length;k++)for(let i=0;i<2;i++)if(contacts[k][i]&&contacts[k-1][i]){const dz=samples[k].feet[i].point[2]-samples[k-1].feet[i].point[2],back=c.name.startsWith('back_');if(back?dz>.001:dz<-.001)velocities.push(Math.abs(dz)/(duration/120)*1.45*1.12)}velocities.sort((a,b)=>a-b);const nativeSpeed=velocities[Math.floor(velocities.length*.5)]||0;
  profiles[c.name]={duration,phaseOffset:landing/120,nativeSpeed,stride:nativeSpeed*duration,ranges,contacts:contacts.slice(0,120).map(v=>v.map(Number)),footHeights:samples.slice(0,120).map(s=>s.feet.map(f=>f.minY)),footTravelZ:samples.slice(0,120).map(s=>s.feet.map(f=>f.point[2]))};
 }
 const out={model:require('path').basename(process.argv[2]||'character-locomotion-v108.glb'),scale:1.45,rootScale:1.12,ground:.105,soles,clips:profiles};fs.writeFileSync(process.argv[3]||'meshy_output/user-character-2026-10-03/locomotion-v108/calibration.json',JSON.stringify(out));
 console.log(JSON.stringify({soles:soles.map(s=>({...s,sampleVertices:s.sampleVertices.length})),clips:Object.fromEntries(Object.entries(profiles).map(([k,v])=>[k,{duration:v.duration,phaseOffset:v.phaseOffset,nativeSpeed:v.nativeSpeed,stride:v.stride,ranges:v.ranges}]))}));
})().catch(e=>{console.error(e);process.exitCode=1});
