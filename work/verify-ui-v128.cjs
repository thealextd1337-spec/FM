const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const output='outputs/Doppel-6-Fussballmanager.html',html=read(output);
const sources=['world-physical-v65.js','world-competition-v62.js','world-start-v61.css'];
for(const file of sources){
 let source=read('dist/'+file);
 for(const asset of [...new Set(source.match(/(?:referees|trophies|sprites|crests)\/[a-z0-9-]+\.png/g)||[])])source=source.replaceAll(asset,'data:image/png;base64,'+fs.readFileSync('dist/'+asset).toString('base64'));
 assert(html.includes(source),'Build includes current '+file);
}
assert.equal(hash(output),hash('outputs/index.html'));
assert(read('dist/index.html').includes('PROTOTYP 106'));assert(html.includes('PROTOTYP 106'));
const layout=JSON.parse(read('outputs/pause-layout-qa-v128.json')),preview=JSON.parse(read('outputs/preview-standing-qa-v128.json'));
assert.equal(layout.rows.length,4);assert.equal(preview.rows.length,2);assert.deepEqual(layout.errors,[]);assert.deepEqual(preview.errors,[]);
for(const row of layout.rows)assert(!row.initial.overflow&&!row.initial.controlOverflow&&row.reopened&&row.pauseTimeUnchanged);
for(const row of preview.rows)assert(row.unchanged&&row.english&&row.noOverflow);
for(const file of ['docs/ui-anpassungen-v128.md','docs/mentale-faehigkeiten-plan.md']){
 for(const [,target] of read(file).matchAll(/\]\(([^)]+)\)/g))if(!target.startsWith('http'))assert(fs.existsSync(path.resolve(path.dirname(file),target)),target);
}
const report={version:128,publishedFooter:106,published:false,buildSHA256:hash(output),sources:Object.fromEntries(sources.map(f=>[f,hash('dist/'+f)])),layoutScreens:layout.rows.length,previewScreens:preview.rows.length,mentalAbilitiesImplemented:false};
fs.writeFileSync('outputs/ui-verification-v128.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
