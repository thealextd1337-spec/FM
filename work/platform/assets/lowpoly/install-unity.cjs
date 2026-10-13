'use strict';
// Copies the versioned low-poly FBX and its baked BaseColor/cloth mask into the Low-Poly demo Unity project only.
//   node work/platform/assets/lowpoly/install-unity.cjs <version> [unity project]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../../../..'),version=process.argv[2],project=process.argv[3]||'G:/unity/Doppel6-LowPoly-Demo';
if(!/^v\d+$/.test(version||''))throw Error('version like v2 required');if(!/Doppel6-LowPoly-Demo/.test(project))throw Error('refusing a project other than the Low-Poly demo: '+project);
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for(const name of [`d6_lowpoly_${version}.fbx`,`d6_lowpoly_${version}_base.png`,`d6_lowpoly_${version}_mask.png`]){
 const from=path.join(repo,`outputs/platform/assets/lowpoly-${version}`,name),to=path.join(project,'Assets/Doppel6EngineProbe/Art',name);
 if(fs.existsSync(to)&&sha(to)===sha(from)){console.log('unchanged',to,sha(to));continue;}
 fs.copyFileSync(from,to);console.log('copied',to,sha(to));
}
