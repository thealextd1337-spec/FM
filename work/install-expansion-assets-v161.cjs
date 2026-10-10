'use strict';
const fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({});
vm.runInContext(fs.readFileSync('dist/world-expansion-catalog-v161.js','utf8'),c);
const source=fs.readFileSync('dist/world-expansion-v161.js','utf8');
vm.runInContext(source.slice(source.indexOf('function v161Escape('),source.indexOf('const v161BaseCrest=')),c);
const catalog=vm.runInContext('v161Catalog',c),crest=vm.runInContext('v161Crest',c);
fs.mkdirSync('dist/crests-expansion',{recursive:true});
const entries=[];
for(const entry of catalog){
 const isNew=entry.origin==='ap02-editorial',file=isNew?`crests-expansion/${entry.id.toLowerCase()}.svg`:`crests/${entry.id.toLowerCase()}.png`;
 if(isNew)fs.writeFileSync('dist/'+file,crest({...entry,kits:{colors:Object.fromEntries(['primary','secondary','tertiary'].map((k,i)=>[k,entry.palette[i].hex]))}},136)+'\n');
 entries.push({clubId:entry.id,crest:file,format:isNew?'own-vector-draft':'existing-authored-png',colors:entry.palette.map(p=>p.hex),source:isNew?'work/install-expansion-assets-v161.cjs / v161Crest':'existing-48-manifest',motif:entry.crestConcept,stadium:{clubId:entry.id,city:entry.city,status:'identity-only; existing-neutral-fallback'}});
}
fs.writeFileSync('dist/crests-expansion/manifest.json',JSON.stringify({version:1,status:'ap03-identity-assets',newVectorAssets:144,preservedCrests:48,artReview:'draft; small-size and palette review required before release',entries},null,2)+'\n');
console.log('144 eigene SVG-Wappenskizzen; Manifest für alle 192 Identitäten.');
