'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,sha}=require('./inventory.cjs'),m=require('./manifest.json'),out=path.join(root,m.outputDirectory);
for(const s of m.source){const bytes=fs.readFileSync(path.join(root,s.path));assert.equal(sha(bytes),s.sha256);assert.equal(sha(fs.readFileSync(path.join(out,path.basename(s.path)))),s.sha256);}
for(const i of m.images)assert.equal(sha(fs.readFileSync(path.join(out,i.file))),i.sha256);
assert.equal(m.skins[0].joints.length,28);assert.equal(m.clips.length,34);assert.equal(m.calibration.clipCount,30);
const r=JSON.parse(fs.readFileSync(path.join(out,'fbx-validation.json')));assert(r.roundTrip.passed);assert.equal(r.roundTrip.meshes[0].vertices,9725);assert.equal(r.roundTrip.meshes[0].triangles,12668);assert(r.roundTrip.images.every(i=>i.exists));
const delivery=['football-v130.glb','football-v130.fbx','calibration-v130.json','cloth-mask.png',...m.images.map(i=>i.file)].map(file=>{const b=fs.readFileSync(path.join(out,file));return{file,bytes:b.length,sha256:sha(b)}});
const result={passed:true,sourceUnchanged:true,textureBytesUnchanged:true,vertices:9725,triangles:12668,joints:28,clips:34,calibratedClips:30,roundTripMaxJointErrorMetres:r.roundTrip.maxJointPositionErrorMetres,delivery,limits:['Numerical Blender round trip covers three poses per clip; Unity import and rendered silhouette/contact checks remain separate.','Full master geometry/textures retained; no mobile performance claim.']};
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
