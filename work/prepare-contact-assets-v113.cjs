const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {read,accessor,pack}=require('./user-character-glb.cjs');
(async()=>{
 const T=await import('data:text/javascript;base64,'+fs.readFileSync('outputs/meshy-viewer-vendor/three.module.js').toString('base64'));
 const folder='meshy_output/user-character-2026-10-03',target=read(folder+'/character-football-v111.glb');
 const mapping=JSON.parse(fs.readFileSync('docs/spieler-nutzer-rig/model.json')).bindingMaps.walking;
 const batches=[{file:'provider-motions.glb',task:'01a106a6-77ec-75c1-bb63-28ea39ebf2c3',entries:[['foul_fall_meshy',366],['foul_stumble_meshy',519]]}];
 function rest(asset){
  const parents={};asset.json.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents[c]=i));
  const local=i=>{const n=asset.json.nodes[i];return n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(new T.Vector3().fromArray(n.translation||[0,0,0]),new T.Quaternion().fromArray(n.rotation||[0,0,0,1]),new T.Vector3().fromArray(n.scale||[1,1,1]))};
  const world=i=>parents[i]===undefined?local(i):world(parents[i]).multiply(local(i));
  const skin=asset.json.skins[0],ibm=accessor(asset,skin.inverseBindMatrices),bind=new Map(skin.joints.map((n,i)=>[n,new T.Matrix4().fromArray(ibm[i]).invert()]));
  return new Map(skin.joints.map(n=>{const parent=bind.get(parents[n])||world(parents[n]),m=parent.clone().invert().multiply(bind.get(n)),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();m.decompose(p,q,s);return[n,{p,q:q.normalize(),s}]}));
 }
 const bRest=rest(target),json=structuredClone(target.json),parts=[target.bin];let bytes=target.bin.length;
 function add(rows,type){const flat=rows.flat(),buf=Buffer.alloc(flat.length*4);flat.forEach((v,i)=>{assert(Number.isFinite(v));buf.writeFloatLE(v,i*4)});const pad=(4-bytes%4)%4;if(pad){parts.push(Buffer.alloc(pad));bytes+=pad}const view=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:bytes,byteLength:buf.length});parts.push(buf);bytes+=buf.length;const index=json.accessors.length,a={bufferView:view,componentType:5126,count:rows.length,type};if(type==='SCALAR'){a.min=[Math.min(...flat)];a.max=[Math.max(...flat)]}json.accessors.push(a);return index}
 const reports=[];
 for(const batch of batches){const source=read(folder+'/contact-v113/'+batch.file),aRest=rest(source),entries=batch.entries;assert.equal(source.json.animations.length,entries.length);
 source.json.animations.forEach((c,index)=>{
  const [key,id]=entries[index],loop=key.startsWith('idle_'),duration=Math.max(...c.samplers.flatMap(s=>accessor(source,s.input).flat())),clip={name:key,channels:[],samplers:[],extras:{provider:'Meshy',actionId:id,sourceTask:batch.task,loop,rootMotion:'horizontal travel and provider yaw removed; match owns heading'}};
  const inputs=new Map();let rootYaw=[];
  for(const channel of c.channels){
   const name=source.json.nodes[channel.target.node].name,destination=json.nodes.findIndex(n=>n.name===mapping[name]);assert(destination>=0,'Missing bone '+name);const path=channel.target.path,s=c.samplers[channel.sampler],times=accessor(source,s.input).flat(),values=accessor(source,s.output),a=aRest.get(channel.target.node),b=bRest.get(destination);assert(a&&b);assert(['LINEAR','STEP'].includes(s.interpolation));
   if(!inputs.has(s.input))inputs.set(s.input,add(times.map(t=>[t]),'SCALAR'));
   const retarget=values.map((v,k)=>{
    if(path==='rotation'){
     const delta=a.q.clone().invert().multiply(new T.Quaternion().fromArray(v));
     if(name==='Hips'){const forward=new T.Vector3(0,0,1).applyQuaternion(delta),yaw=Math.atan2(forward.x,forward.z);rootYaw.push(yaw);delta.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-yaw));}
     return b.q.clone().multiply(delta).normalize().toArray();
    }
    if(path==='translation')return name==='Hips'?[b.p.x,b.p.y+(v[1]-a.p.y)*.01,b.p.z]:b.p.toArray();
    if(path==='scale')return b.s.toArray();throw Error('Unsupported path '+path);
   });
   if(loop)for(let k=0;k<retarget.length;k++){const close=key==='idle_meshy'?.18:.1,t=Math.max(0,Math.min(1,(times[k]-(duration-close))/close)),w=t*t*(3-2*t);if(path==='rotation')retarget[k]=new T.Quaternion().fromArray(retarget[k]).slerp(new T.Quaternion().fromArray(retarget[0]),w).normalize().toArray();else retarget[k]=retarget[k].map((v,j)=>v+(retarget[0][j]-v)*w)}
   clip.channels.push({sampler:clip.samplers.length,target:{node:destination,path}});clip.samplers.push({input:inputs.get(s.input),output:add(retarget,path==='rotation'?'VEC4':'VEC3'),interpolation:s.interpolation});
  }
  json.animations.push(clip);reports.push({key,actionId:id,sourceTask:batch.task,providerClip:c.name,duration,loop,providerYawRange:rootYaw.length?[Math.min(...rootYaw),Math.max(...rootYaw)]:null});
 });
 }
 // Reuse the upright, relaxed end of Meshy's rise clip. Other idle clips cross or lift a leg.
 const upright=target.json.animations.find(c=>c.name==='keeper_rise_meshy'),idle={name:'idle_stand_meshy',channels:[],samplers:[],extras:{...upright.extras,loop:true,trim:[6.8,7.8],description:'Upright stance with arms resting beside the thighs'}};
 for(const channel of upright.channels){const s=upright.samplers[channel.sampler],times=accessor(target,s.input).flat(),values=accessor(target,s.output),selected=Array.from({length:31},(_,i)=>({t:6.8+i/30})),start=6.8,duration=1,rows=selected.map(({t})=>{let hi=times.findIndex(v=>v>=t);if(hi<0)hi=times.length-1;const lo=Math.max(0,hi-1),w=s.interpolation==='STEP'?0:Math.max(0,Math.min(1,(t-times[lo])/Math.max(1e-8,times[hi]-times[lo])));return channel.target.path==='rotation'?new T.Quaternion().fromArray(values[lo]).slerp(new T.Quaternion().fromArray(values[hi]),w).normalize().toArray():values[lo].map((v,j)=>v+(values[hi][j]-v)*w)});
  rows.forEach((row,i)=>{const w=Math.max(0,Math.min(1,(selected[i].t-start-duration+.16)/.16)),blend=w*w*(3-2*w);if(channel.target.path==='rotation')rows[i]=new T.Quaternion().fromArray(row).slerp(new T.Quaternion().fromArray(rows[0]),blend).normalize().toArray();else rows[i]=row.map((v,j)=>v+(rows[0][j]-v)*blend)});
  idle.channels.push({...channel,sampler:idle.samplers.length});idle.samplers.push({input:add(selected.map(r=>[r.t-start]),'SCALAR'),output:add(rows,channel.target.path==='rotation'?'VEC4':'VEC3'),interpolation:s.interpolation});
 }
 json.animations.push(idle);reports.push({key:idle.name,actionId:344,sourceTask:upright.extras.sourceTask,providerClip:'standup_01',trim:[6.8,7.8],duration:1,loop:true,reused:true,additionalCredits:0});
 const output=folder+'/character-football-v113.glb';pack(json,Buffer.concat(parts),output);const check=read(output);assert.deepEqual(check.json.nodes,target.json.nodes);assert.deepEqual(check.json.skins,target.json.skins);assert.deepEqual(check.json.materials,target.json.materials);assert.deepEqual(check.json.animations.slice(0,29),target.json.animations);assert(check.bin.subarray(0,target.bin.length).equals(target.bin));
 const report={output,sourceTasks:batches.map(b=>b.task),resource:'animate',project:'meshy_output/20261003_123727_nutzercharakter-fussball-beweg_01a10156',rigTask:'01a10156-b12b-74d3-baef-6e0b4054a2b9',consumedCredits:{foulActions:6,total:6},clipCount:32,geometryRigTexturesOriginalClipsPreserved:true,sha256:crypto.createHash('sha256').update(check.bytes).digest('hex'),clips:reports};
 fs.writeFileSync('docs/spieler-nutzer-rig/contact-assets-v113.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
