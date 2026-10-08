// Package existing Meshy clips into the user's unchanged mesh/rig. No keyframes generated.
const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const folder='meshy_output/user-character-2026-10-03';
function read(name){const b=fs.readFileSync(folder+'/'+name+'.glb'),length=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+length)),start=20+length;assert.equal(b.readUInt32LE(start+4),0x004e4942);return {j,bin:b.subarray(start+8,start+8+b.readUInt32LE(start))};}
const source=read('character-original'),j=structuredClone(source.j),parts=[source.bin];let offset=source.bin.length;const clips=[];
for(const name of ['walking','running']){
 const m=read(name);assert.equal(m.j.nodes.length,j.nodes.length);
 m.j.nodes.forEach((n,i)=>assert.deepEqual(n.children||[],j.nodes[i].children||[]));
 const viewOffset=j.bufferViews.length,accessorOffset=j.accessors.length;
 for(const view of m.j.bufferViews){assert.equal(view.buffer||0,0);j.bufferViews.push({...view,buffer:0,byteOffset:(view.byteOffset||0)+offset});}
 for(const a of m.j.accessors){assert(!a.sparse,'Sparse accessor unsupported');j.accessors.push({...a,bufferView:a.bufferView+viewOffset});}
 for(const anim of m.j.animations){const c=structuredClone(anim);c.name=name;for(const s of c.samplers){s.input+=accessorOffset;s.output+=accessorOffset;}j.animations.push(c);}
 clips.push({name,source:folder+'/'+name+'.glb',keyframeBinarySha256:crypto.createHash('sha256').update(m.bin).digest('hex')});parts.push(m.bin);offset+=m.bin.length;
}
const bin=Buffer.concat(parts);j.buffers=[{byteLength:bin.length}];let json=Buffer.from(JSON.stringify(j));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);
const result=Buffer.alloc(12+8+json.length+8+bin.length);result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8);result.writeUInt32LE(json.length,12);result.writeUInt32LE(0x4e4f534a,16);json.copy(result,20);result.writeUInt32LE(bin.length,20+json.length);result.writeUInt32LE(0x004e4942,24+json.length);bin.copy(result,28+json.length);
assert(bin.subarray(0,source.bin.length).equals(source.bin));const file=folder+'/character-meshy-motions.glb';fs.writeFileSync(file,result);
fs.writeFileSync('docs/spieler-nutzer-rig/combined-qa.json',JSON.stringify({file,bytes:result.length,sourceMeshRigAndTextureBinaryPreserved:true,animations:j.animations.map(a=>a.name),meshTaskId:'01a10106-76ab-77a7-89a2-d58771af210c',clips,additionalMeshyCredits:0},null,2));console.log(JSON.stringify({file,bytes:result.length,animations:j.animations.map(a=>a.name)}));
