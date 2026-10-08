const fs=require('fs'),assert=require('assert');
const path=process.argv[2],bytes=fs.readFileSync(path);
assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
const length=bytes.readUInt32LE(12);assert.equal(bytes.readUInt32LE(16),0x4e4f534a);
const gltf=JSON.parse(bytes.subarray(20,20+length).toString('utf8'));
let triangles=0,vertices=0;
for(const mesh of gltf.meshes||[])for(const p of mesh.primitives){
 assert.equal(p.mode??4,4,'Triangle mesh required');
 const count=gltf.accessors[p.indices??p.attributes.POSITION].count;
 assert.equal(count%3,0);triangles+=count/3;vertices+=gltf.accessors[p.attributes.POSITION].count;
}
const inspection={path,glbBytes:bytes.length,triangles,vertices,meshes:gltf.meshes?.length||0,materials:gltf.materials?.length||0,images:gltf.images?.length||0,skins:gltf.skins?.length||0,joints:(gltf.skins||[]).map(s=>s.joints.length),animations:(gltf.animations||[]).map(a=>({name:a.name||'',channels:a.channels.length,duration:Math.max(...a.samplers.map(s=>gltf.accessors[s.input].max?.[0]||0))})),bounds:(gltf.meshes||[]).flatMap(m=>m.primitives.map(p=>({min:gltf.accessors[p.attributes.POSITION].min,max:gltf.accessors[p.attributes.POSITION].max})))};
console.log(JSON.stringify(inspection,null,2));
