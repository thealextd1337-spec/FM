'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('dist/world-expansion-catalog-v161.js','utf8'),c);
const catalog=vm.runInContext('v161Catalog',c),manifest=JSON.parse(fs.readFileSync('dist/crests-expansion/manifest.json','utf8'));
assert.equal(manifest.entries.length,192);assert.equal(new Set(manifest.entries.map(e=>e.clubId)).size,192);
const svgs=new Set();
for(const entry of manifest.entries){const club=catalog.find(c=>c.id===entry.clubId);assert.ok(club);assert.ok(fs.existsSync('dist/'+entry.crest),entry.crest);assert.deepEqual(entry.colors,JSON.parse(JSON.stringify(club.palette.map(p=>p.hex))));if(entry.format==='own-vector-draft'){const svg=fs.readFileSync('dist/'+entry.crest,'utf8');assert.ok(!svgs.has(svg));svgs.add(svg);assert.ok(svg.includes('viewBox="0 0 100 100"'));assert.ok(!/<(?:script|foreignObject)|href=|https?:/i.test(svg.replace('http://www.w3.org/2000/svg','')));for(const hex of entry.colors)assert.ok(svg.includes(hex),entry.clubId+' '+hex);}}
assert.equal(svgs.size,144);
const html=fs.readFileSync('dist/index.html','utf8'),build=fs.readFileSync('outputs/index.html','utf8');
for(const name of ['world-expansion-catalog-v161.js','world-expansion-v161.js','world-expansion-domestic-v164.js','world-expansion-crown-v165.js','world-expansion-horizon-v166.js','world-expansion-ui-v166.js','world-expansion-progression-v167.js','world-expansion-economy-v168.js','world-expansion-season-ui-v169.js','world-expansion-stories-v170.js','world-expansion-office-v170.js','world-expansion-awards-v171.js','world-expansion-interface-v172.js']){assert.ok(html.includes(`src="${name}"`));assert.ok(!build.includes(`src="${name}"`));}
assert.ok(build.includes('function v161CreateCareer'));assert.ok(build.includes('function v166CreateCareer'));assert.ok(build.includes('function v166Render'));assert.ok(build.includes('function v167NextSeason'));assert.ok(build.includes('function v169RankingHTML'));assert.equal(build,fs.readFileSync('outputs/Doppel-6-Fussballmanager.html','utf8'));
console.log('192 Assetzuordnungen, 144 eigene sichere SVGs, alle drei Farben und Offline-Einbettung geprüft.');
