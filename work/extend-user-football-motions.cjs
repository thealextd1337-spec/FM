const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const {read,accessor,pack}=require('./user-character-glb.cjs');
(async()=>{
 const THREE=await import('data:text/javascript;base64,'+fs.readFileSync('outputs/meshy-viewer-vendor/three.module.js').toString('base64'));
 const folder='meshy_output/user-character-2026-10-03',source=read(folder+'/football-motion-pack/meshy-football-motions.glb'),target=read(folder+'/character-textured-meshy-motions.glb');
 const plan=JSON.parse(fs.readFileSync(folder+'/football-motion-pack/plan.json')),mapping=JSON.parse(fs.readFileSync('docs/spieler-nutzer-rig/model.json')).bindingMaps.walking;
 assert.equal(source.json.animations.length,6);
 function rest(asset){
  const parents={};asset.json.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents[c]=i));
  const nodeMatrix=i=>{const n=asset.json.nodes[i];return n.matrix?new THREE.Matrix4().fromArray(n.matrix):new THREE.Matrix4().compose(new THREE.Vector3().fromArray(n.translation||[0,0,0]),new THREE.Quaternion().fromArray(n.rotation||[0,0,0,1]),new THREE.Vector3().fromArray(n.scale||[1,1,1]));};
  const world=i=>parents[i]===undefined?nodeMatrix(i):world(parents[i]).multiply(nodeMatrix(i));
  const skin=asset.json.skins[0],ibm=accessor(asset,skin.inverseBindMatrices),bind=new Map(skin.joints.map((n,i)=>[n,new THREE.Matrix4().fromArray(ibm[i]).invert()]));
  return new Map(skin.joints.map(n=>{const parent=bind.get(parents[n])||world(parents[n]),local=parent.clone().invert().multiply(bind.get(n)),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();local.decompose(p,q,s);return [n,{p,q:q.normalize(),s}];}));
 }
 const srcRest=rest(source),dstRest=rest(target),json=structuredClone(target.json),parts=[target.bin];let bytes=target.bin.length;
 function add(rows,type){const flat=rows.flat(),buf=Buffer.alloc(flat.length*4);flat.forEach((v,i)=>{assert(Number.isFinite(v));buf.writeFloatLE(v,i*4)});const padding=(4-bytes%4)%4;if(padding){parts.push(Buffer.alloc(padding));bytes+=padding;}
  const bufferView=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:bytes,byteLength:buf.length});parts.push(buf);bytes+=buf.length;
  const result=json.accessors.length,a={bufferView,componentType:5126,count:rows.length,type};if(type==='SCALAR'){a.min=[Math.min(...flat)];a.max=[Math.max(...flat)]}json.accessors.push(a);return result;
 }
 const entries=plan.clips||plan.animations||plan.actions;assert(entries&&entries.length===6,'Missing planned clips');
 const fitFile='docs/spieler-nutzer-rig/football-fit.json',fit=fs.existsSync(fitFile)?JSON.parse(fs.readFileSync(fitFile)):{};
 const reports=[];
 source.json.animations.forEach((animation,index)=>{
  const entry=entries[index],newClip={name:entry.key,channels:[],samplers:[],extras:{provider:'Meshy',actionId:entry.actionId||entry.id,sourceTask:'01a10158-e876-7413-916c-bd0a8d5ff2ec',loop:entry.loop,rootMotion:'horizontal removed; vertical retained'}};
  const inputs=new Map();let rootRange;
  for(const channel of animation.channels){
   const node=channel.target.node,path=channel.target.path,name=source.json.nodes[node].name,destination=json.nodes.findIndex(n=>n.name===mapping[name]);assert(destination>=0,'Missing bone '+name);
   const sampler=animation.samplers[channel.sampler];assert(['LINEAR','STEP'].includes(sampler.interpolation));
   if(!inputs.has(sampler.input))inputs.set(sampler.input,add(accessor(source,sampler.input),'SCALAR'));
   const a=srcRest.get(node),b=dstRest.get(destination);assert(a&&b);
   const original=accessor(source,sampler.output),times=accessor(source,sampler.input).flat(),isRoot=name==='Hips';
   const heightOffset=fit[entry.key]?.heightOffsetMeters||0;
   const values=original.map(v=>{
    if(path==='rotation')return b.q.clone().multiply(a.q.clone().invert()).multiply(new THREE.Quaternion().fromArray(v)).normalize().toArray();
    // Preserve the original skeleton's bone lengths. Only hips carry locomotion.
    if(path==='translation')return isRoot?[b.p.x,b.p.y+(v[1]-a.p.y)*.01+heightOffset,b.p.z]:b.p.toArray();
    if(path==='scale')return b.s.toArray();
    throw Error('Unsupported animation path '+path);
   });
   // Close the provider sprint's mismatched cycle with a short blend to its own start pose.
   if(entry.key==='sprint_forward'&&values.length>2){const duration=times.at(-1);for(let k=0;k<values.length;k++){const t=Math.max(0,Math.min(1,(times[k]-(duration-.1))/.1)),w=t*t*(3-2*t);if(path==='rotation')values[k]=new THREE.Quaternion().fromArray(values[k]).slerp(new THREE.Quaternion().fromArray(values[0]),w).normalize().toArray();else values[k]=values[k].map((v,j)=>v+(values[0][j]-v)*w);}}
   if(isRoot&&path==='translation')rootRange={sourceHorizontalTravel:Math.max(...original.map(v=>v[2]))-Math.min(...original.map(v=>v[2])),targetHorizontalTravel:0,heightOffsetMeters:heightOffset,minY:Math.min(...values.map(v=>v[1])),maxY:Math.max(...values.map(v=>v[1]))};
   newClip.channels.push({sampler:newClip.samplers.length,target:{node:destination,path}});newClip.samplers.push({input:inputs.get(sampler.input),output:add(values,path==='rotation'?'VEC4':'VEC3'),interpolation:sampler.interpolation});
  }
  json.animations.push(newClip);reports.push({key:entry.key,label:entry.label,providerClip:animation.name,actionId:entry.actionId||entry.id,loop:entry.loop,sprintClosureBlendSeconds:entry.key==='sprint_forward'?.1:0,duration:Math.max(...animation.samplers.flatMap(s=>accessor(source,s.input).flat())),channels:newClip.channels.length,...rootRange});
 });
 const output=folder+'/character-football-animations.glb';pack(json,Buffer.concat(parts),output);const result=read(output);assert.deepEqual(result.json.nodes,target.json.nodes);assert.deepEqual(result.json.skins,target.json.skins);assert.deepEqual(result.json.materials,target.json.materials);assert.deepEqual(result.json.animations.slice(0,3),target.json.animations);assert(result.bin.subarray(0,target.bin.length).equals(target.bin));
 const report={output,rigTaskId:'01a10156-b12b-74d3-baef-6e0b4054a2b9',animationTaskId:'01a10158-e876-7413-916c-bd0a8d5ff2ec',project:'meshy_output/20261003_123727_nutzercharakter-fussball-beweg_01a10156',consumedCredits:{rigging:5,animation:18,total:23},sourceJoints:24,targetJoints:28,clipCount:9,originalBinaryPrefixPreserved:true,originalNodesSkinsMaterialsClipsPreserved:true,method:'Local bind rotation correction from inverse bind matrices; original bone lengths; centimeter to meter conversion; hips X/Z fixed to bind position, Y motion preserved',sourceSha256:crypto.createHash('sha256').update(source.bytes).digest('hex'),mapping,clips:reports};
 fs.writeFileSync('docs/spieler-nutzer-rig/football-motion-qa.json',JSON.stringify(report,null,2));plan.state='completed';plan.apiAnimationTaskId=report.animationTaskId;plan.consumedCredits=report.consumedCredits;fs.writeFileSync(folder+'/football-motion-pack/plan.json',JSON.stringify(plan,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
