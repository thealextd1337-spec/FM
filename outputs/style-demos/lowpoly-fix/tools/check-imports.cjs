'use strict';
// Compares the Low-Poly Unity project's imported files and the original repo
// assets with docs/3d-stilauftraege/basis-low-poly-release130.json (read only).
//   node check-imports.cjs <repo> <unity project> [out.json]
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const [repo,project,out]=process.argv.slice(2);
const basis=JSON.parse(fs.readFileSync(path.join(repo,'docs/3d-stilauftraege/basis-low-poly-release130.json'),'utf8'));
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const res={originalAssets:[],imports:{total:basis.importedAssets.length,equal:0,differing:[],missing:[]}};
for(const a of basis.originalAssets){const f=path.join(repo,a.path);const h=fs.existsSync(f)?sha(f):null;res.originalAssets.push({path:a.path,equal:h===a.sha256,sha256:h});}
for(const a of basis.importedAssets){const f=path.join(project,a.file);if(!fs.existsSync(f)){res.imports.missing.push(a.file);continue;}const h=sha(f);if(h===a.sha256)res.imports.equal++;else res.imports.differing.push(a.file);}
console.log('original assets equal',res.originalAssets.filter(a=>a.equal).length+'/'+res.originalAssets.length,'imports equal',res.imports.equal+'/'+res.imports.total,'differing',res.imports.differing.length,'missing',res.imports.missing.length);
for(const f of res.imports.differing)console.log(' differs',f);for(const f of res.imports.missing)console.log(' missing',f);
if(out)fs.writeFileSync(out,JSON.stringify(res,null,1));
