const assert=require('assert'),fs=require('fs'),vm=require('vm');
const context=vm.createContext({escapeHTML:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))});
vm.runInContext(fs.readFileSync('dist/world-catalog-v61.js','utf8'),context);
const source=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(source.slice(source.indexOf('const v61Colors='),source.indexOf('function v61RosterHTML')),context);
const clubs=vm.runInContext('v61Catalog',context),assets=vm.runInContext('v61CrestAssets',context),render=vm.runInContext('v61CrestSVG',context),build=vm.runInContext('v61BuildClubKits',context);
assert.strictEqual(Object.keys(assets).sort().join('|'),clubs.map(c=>c.id).sort().join('|'));
const ids=new Set();let preview='';
for(const club of clubs){
 const kits=build(club),record={...club,kits},before=JSON.stringify(record);
 const original=render(record);
 assert(original.includes(assets[club.id].image));
 assert(original.includes('Vereinslogo '+club.name));
 assert.strictEqual(JSON.stringify(record),before,'rendering never mutates saves');
 assert(render(club).includes(assets[club.id].image),'clubs without kit snapshots render directly');
 assert(original.indexOf(assets[club.id].edge)<original.indexOf(assets[club.id].image),'contrast silhouette sits behind artwork');
 for(const path of [assets[club.id].image,assets[club.id].edge,assets[club.id].detail,...assets[club.id].masks]){
  const data=fs.readFileSync('dist/'+path);
  assert.strictEqual(data.subarray(1,4).toString(),'PNG');
  assert.strictEqual(data.readUInt32BE(16),336);assert.strictEqual(data.readUInt32BE(20),336);
 }
 const changed=render({...record,kits:{...kits,colors:{primary:'#b7255d',secondary:'#dbe9f2',tertiary:'#215798'}}});
 for(const id of changed.matchAll(/id="([^"]+)"/g)){assert(!ids.has(id[1]));ids.add(id[1]);}
 for(const color of ['#b7255d','#dbe9f2','#215798'])assert(changed.includes(color));
 assert(changed.includes(assets[club.id].image)&&changed.includes(assets[club.id].detail),'color changes retain source shading and neutral engraving');
 assert.strictEqual((changed.match(/<feColorMatrix /g)||[]).length,3);
 assert(changed.includes('color-interpolation-filters="sRGB"'));
 preview+=`<section><h2>${club.name}</h2><div class="pair">${original}${changed}</div><div class="small">${original}${changed}</div></section>`;
}
const manifest=JSON.parse(fs.readFileSync('dist/crests/manifest.json','utf8'));
for(const id of ['FRA-1','FRA-C1','GER-1','GER-C1'])assert.strictEqual(manifest[id].source,'vier-vereine-v2.png');
assert(!render({...clubs[0],name:'<img src=x onerror=alert(1)>'}).includes('<img src=x'));
const bundle=fs.readFileSync('outputs/index.html','utf8');
assert(!/crests\/[a-z0-9-]+\.png/.test(bundle),'single-file build embeds every image and mask');
assert(bundle.includes(fs.readFileSync('dist/crests/fra-1.png').toString('base64')));
fs.writeFileSync('outputs/crests-preview.html',`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#183039;color:#f4f6ef;font:14px system-ui;margin:20px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}h2{font-size:16px}.pair{display:flex;gap:12px}.pair svg{width:112px;height:130px}.small{display:flex;gap:16px;margin-top:12px}.small svg{width:19px;height:23px}</style><h1>Vereinswappen: Original und Farbwechsel</h1><main>${preview}</main></html>`);
console.log('48 Wappen mit Konturen und Detailerhalt, 144 Farbmasken, vier Ersatzmotive, eindeutige SVG-IDs, unveränderte Spielstände und Offline-Build geprüft.');
