'use strict';
const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('docs/ligaexpansion-vereinskatalog.json','utf8'));
const opening=JSON.parse(fs.readFileSync('docs/ligaexpansion-saison1.json','utf8'));
const overrides={Sand:'#eedfc5',Eisblau:'#4b9dc8'};
const clubs=data.clubs.map(c=>({...c,palette:c.palette.map(p=>({...p,hex:c.origin==='preserved48'?p.hex:c.id==='GRE-C1'&&p.name==='Silber'?'#80949c':c.id==='ENG-C5'&&p.name==='Petrol'?'#248f8e':overrides[p.name]||p.hex}))}));
fs.writeFileSync('dist/world-expansion-catalog-v161.js',`'use strict';\n// AP02-Katalog plus abgestimmte AP03-Darstellungsfarben. Kein Legacy-Katalogersatz.\nconst v161Catalog=${JSON.stringify(clubs)};\nconst v161Countries=${JSON.stringify(data.countries)};\nconst v161Opening=${JSON.stringify(opening)};\n`);
fs.writeFileSync('docs/ligaexpansion-ap03-farben.json',JSON.stringify(clubs.filter(c=>c.origin!=='preserved48').map(c=>({id:c.id,colors:c.palette,changes:c.palette.filter((p,i)=>p.hex!==data.clubs.find(old=>old.id===c.id).palette[i].hex).map(p=>p.name)})),null,2)+'\n');
console.log('AP03-Katalog: 192 Identitäten, 48 unveränderte Bestandsfarbsätze.');
