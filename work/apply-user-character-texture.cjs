// Transfer Meshy's material maps to the selected rig without rewriting its mesh or clips.
const fs=require('fs'),assert=require('assert'),crypto=require('crypto'),path=require('path');
const {read,accessor,pack}=require('./user-character-glb.cjs');
const folder='meshy_output/user-character-2026-10-03';
const source=read(folder+'/character-meshy-motions.glb'),texture=read(folder+'/retexture.glb');
const a=source.json.meshes[0].primitives[0],b=texture.json.meshes[0].primitives[0];
const posA=accessor(source,a.attributes.POSITION),posB=accessor(texture,b.attributes.POSITION);
const uvA=accessor(source,a.attributes.TEXCOORD_0),uvB=accessor(texture,b.attributes.TEXCOORD_0);
assert.equal(source.json.meshes.length,1);assert.equal(texture.json.meshes.length,1);
assert.equal(posA.length,posB.length,'Retexture changed vertex count');
// Meshy normalizes the static output and reorders seam vertices. Match by unchanged UVs.
const key=v=>v.map(n=>Math.round(n*1e5)).join(','),uvMap=new Map(uvB.map((uv,i)=>[key(uv),i]));
assert.equal(uvMap.size,uvB.length,'Ambiguous texture UVs');
assert.equal(new Set(uvA.map(key)).size,uvA.length,'Ambiguous source UVs');
const mapping=uvA.map(v=>{const i=uvMap.get(key(v));assert(i!==undefined,'Missing original UV');return i;});
let maxUVError=0;
for(let i=0;i<uvA.length;i++)for(let k=0;k<2;k++)maxUVError=Math.max(maxUVError,Math.abs(uvA[i][k]-uvB[mapping[i]][k]));
assert(maxUVError<1e-6,'Retexture UV correspondence changed');
const transforms=[];let maxPositionError=0;
for(let k=0;k<3;k++){
 const meanA=posA.reduce((s,p)=>s+p[k],0)/posA.length,meanB=posA.reduce((s,_,i)=>s+posB[mapping[i]][k],0)/posA.length;
 const numerator=posA.reduce((s,p,i)=>s+(p[k]-meanA)*(posB[mapping[i]][k]-meanB),0),denominator=posA.reduce((s,p)=>s+(p[k]-meanA)**2,0);
 const scale=numerator/denominator,translation=meanB-scale*meanA;transforms.push({scale,translation});
 for(let i=0;i<posA.length;i++)maxPositionError=Math.max(maxPositionError,Math.abs(posA[i][k]*scale+translation-posB[mapping[i]][k]));
}
assert(maxPositionError<1e-5,'Retexture changed mesh shape');
assert(Math.max(...transforms.map(t=>t.scale))-Math.min(...transforms.map(t=>t.scale))<1e-5,'Non-uniform retarget geometry normalization');
const triangles=(indices,map)=>{const out=[];for(let i=0;i<indices.length;i+=3)out.push(indices.slice(i,i+3).map(n=>map[n]).sort((x,y)=>x-y).join(','));return out.sort();};
assert.deepEqual(triangles(accessor(source,a.indices).flat(),mapping),triangles(accessor(texture,b.indices).flat(),posB.map((_,i)=>i)),'Retexture topology changed');
const j=structuredClone(source.json),parts=[source.bin];let offset=source.bin.length;
const pad=()=>{const n=(4-offset%4)%4;if(n){parts.push(Buffer.alloc(n));offset+=n;}};
j.images=[];
fs.mkdirSync(folder+'/texture-maps',{recursive:true});
const maps=[];
for(const [i,img] of texture.json.images.entries()){
 assert(img.bufferView!==undefined,'Expected embedded texture');
 const v=texture.json.bufferViews[img.bufferView],bytes=texture.bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);
 pad();const newView=j.bufferViews.length;j.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length});parts.push(bytes);offset+=bytes.length;
 j.images.push({...img,bufferView:newView});delete j.images.at(-1).uri;
 const file=`${folder}/texture-maps/${i}-${(img.name||'map').replace(/[^a-zA-Z0-9_-]/g,'_')}.${img.mimeType==='image/jpeg'?'jpg':'png'}`;
 fs.writeFileSync(file,bytes);maps.push({image:i,file,mimeType:img.mimeType,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
j.textures=structuredClone(texture.json.textures);j.samplers=structuredClone(texture.json.samplers||[]);
j.materials=structuredClone(texture.json.materials);j.meshes[0].primitives[0].material=b.material;
const material=j.materials[b.material];assert(material.pbrMetallicRoughness?.baseColorTexture,'Missing new base color');
material.name='Doppel6_Meshy_2K';
// The supplied export uses its original normal map to compensate flat vertex normals.
// Meshy's replacement map exposes triangle facets; retain the proven original map.
const originalMaterial=source.json.materials[a.material];
const originalTexture=source.json.textures[originalMaterial.normalTexture.index];
const normalImage=j.images.length;j.images.push(structuredClone(source.json.images[originalTexture.source]));
const normalTexture=j.textures.length;j.textures.push({source:normalImage});
material.normalTexture={index:normalTexture,texCoord:0,scale:originalMaterial.normalTexture.scale??1};
const target=folder+'/character-textured-meshy-motions.glb';pack(j,Buffer.concat(parts),target);
const final=read(target);assert(final.bin.subarray(0,source.bin.length).equals(source.bin));
assert.deepEqual(final.json.nodes,source.json.nodes);assert.deepEqual(final.json.skins,source.json.skins);assert.deepEqual(final.json.animations,source.json.animations);
const baseImage=j.textures[material.pbrMetallicRoughness.baseColorTexture.index].source;
fs.copyFileSync(maps[baseImage].file,folder+'/base-color.jpg');
fs.writeFileSync(folder+'/cloth-input.json',JSON.stringify({positions:posA,uv:uvA,indices:accessor(source,a.indices).flat()}));
const report={source:folder+'/character-meshy-motions.glb',meshTaskId:'01a10106-76ab-77a7-89a2-d58771af210c',textureTaskId:'01a10128-99dd-77a5-8b30-b633116d62fe',resource:'retexture',project:'meshy_output/20261003_114651_nutzercharakter-textur-2026-10_01a10128',output:target,vertices:posA.length,triangles:accessor(source,a.indices).length/3,joints:j.skins[0].joints.length,animations:j.animations.map(a=>a.name),maxPositionError,maxUVError,meshysStaticOutputNormalization:transforms,uvCorrespondenceVertices:mapping.length,sourceGeometryRigAndAnimationBinaryPreserved:true,originalNormalMapPreserved:true,generatedNormalMap:'Saved as source asset; not applied because it exposes the supplied mesh flat normals',maps};
fs.writeFileSync('docs/spieler-nutzer-rig/texture-transfer-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
