'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const {harness}=require('./world-expansion-harness-v167.cjs');
const {call,context}=harness();
vm.runInContext('globalThis.escapeHTML=v161Escape',context);
const manifest=JSON.parse(fs.readFileSync('docs/wappen-expansion/manifest.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('docs/wappen-expansion/catalog.json','utf8'));
const bundle=fs.readFileSync('outputs/index.html','utf8'),ids=new Set(),hashes=new Set();
assert.equal(catalog.length,96);assert.equal(Object.keys(manifest).length,96);
for(const entry of catalog){
 const club={...entry,kits:{colors:Object.fromEntries(['primary','secondary','tertiary'].map((key,i)=>[key,entry.palette[i]]))}};
 const before=JSON.stringify(club),asset=manifest[club.id];
 const original=call('v61CrestSVG',club);
 assert(original.includes(asset.image));assert(original.includes('role="img"'));assert(original.includes(club.name));
 assert.equal(JSON.stringify(club),before,'Rendering must not mutate stored clubs');
 for(const path of [asset.image,asset.edge,asset.detail,...asset.masks]){
  const data=fs.readFileSync('dist/'+path);
  assert.equal(data.subarray(1,4).toString(),'PNG');assert.equal(data.readUInt32BE(16),336);assert.equal(data.readUInt32BE(20),336);
  assert(bundle.includes(data.toString('base64')),'Offline build must embed '+path);
 }
 const hash=require('node:crypto').createHash('sha256').update(fs.readFileSync('dist/'+asset.image)).digest('hex');
 assert(!hashes.has(hash),'Each club needs its own artwork');hashes.add(hash);
 const changed=call('v61CrestSVG',{...club,kits:{colors:{primary:'#a83057',secondary:'#edf0ce',tertiary:'#2c7bb1'}}});
 for(const color of ['#a83057','#edf0ce','#2c7bb1'])assert(changed.includes(color));
 assert(changed.includes(asset.detail));
 for(const match of changed.matchAll(/id="([^"]+)"/g)){assert(!ids.has(match[1]));ids.add(match[1]);}
 assert(!call('v61CrestSVG',{...club,name:'<img src=x onerror=alert(1)>'}).includes('<img src=x'));
}
assert(!/crests\/new-[a-z0-9-]+\.png/.test(bundle));
console.log('96 unique expansion crests: PNGs, masks, tinting, labels, SVG IDs, unchanged clubs and offline coverage passed.');
