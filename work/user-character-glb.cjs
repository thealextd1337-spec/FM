const fs = require('fs');
function read(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.readUInt32LE(0) !== 0x46546c67) throw Error('Expected GLB');
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength));
  const offset = 20 + jsonLength;
  return {bytes, json, bin:bytes.subarray(offset + 8, offset + 8 + bytes.readUInt32LE(offset))};
}
function accessor(asset, index) {
  const a=asset.json.accessors[index],v=asset.json.bufferViews[a.bufferView];
  const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},sizes={5121:1,5123:2,5125:4,5126:4};
  const getters={5121:'readUInt8',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'};
  const width=widths[a.type],size=sizes[a.componentType],stride=v.byteStride||width*size;
  const start=(v.byteOffset||0)+(a.byteOffset||0),out=[];
  if(a.sparse||!size||!width)throw Error('Unsupported accessor');
  for(let i=0;i<a.count;i++){const row=[];for(let k=0;k<width;k++)row.push(asset.bin[getters[a.componentType]](start+i*stride+k*size));out.push(row);}
  return out;
}
function pack(json,bin,file) {
  json.buffers=[{byteLength:bin.length}];
  const raw=Buffer.from(JSON.stringify(json)),text=Buffer.alloc(Math.ceil(raw.length/4)*4,32),binary=Buffer.alloc(Math.ceil(bin.length/4)*4);
  raw.copy(text);bin.copy(binary);const out=Buffer.alloc(12+8+text.length+8+binary.length);
  out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
  out.writeUInt32LE(text.length,12);out.writeUInt32LE(0x4e4f534a,16);text.copy(out,20);
  const offset=20+text.length;out.writeUInt32LE(binary.length,offset);out.writeUInt32LE(0x004e4942,offset+4);binary.copy(out,offset+8);
  fs.writeFileSync(file,out);
}
module.exports={read,accessor,pack};
