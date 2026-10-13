'use strict';
// Puts the runtime/shader sources of a base commit into the Nighttime Unity
// project, keeping only the editor tooling (Tests/Setup/Cli/WebBuild/Diagnostics)
// of the working tree, so a baseline render runs the unchanged renderer with
// the same evidence tool. Records sync-unity.cjs digests, so a later normal
// sync recognises these copies as its own.
//   node work/platform/qa/lowpoly-baseline-sources.cjs <git ref> [unity project]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const repo=path.resolve(__dirname,'../../..'),ref=process.argv[2],project=process.argv[3]||'G:/unity/Doppel6-LowPoly-Demo';
if(!ref)throw Error('git ref required');if(!/Doppel6-LowPoly-Demo/.test(project))throw Error('refusing a project other than the Low-Poly demo: '+project);
const source=path.join(repo,'prototypes/match-engine-unity'),probe=path.join(project,'Assets/Doppel6EngineProbe');
const editor=/(Tests|Setup|Cli|WebBuild|Diagnostics)\.cs$/;
function destination(file){
 if(file==='ProbeBuildIdentity.cs')return 'Runtime';
 if(file.endsWith('.cs'))return editor.test(file)?'Editor':'Runtime';
 if(file==='WorldKit.shader'||file==='D6Common.hlsl')return 'Art';
 if(file.endsWith('.shader'))return 'Art/Resources';
 if(file.endsWith('.jslib'))return 'Plugins';
 if(file==='link.xml')return '.';
 return null;
}
const strip=b=>b.toString('utf8').replace(/\r/g,'').replace(/\n+$/,''),digest=b=>crypto.createHash('sha256').update(strip(b)).digest('hex');
const stateFile=path.join(repo,'outputs/unity-cli/sync-state.json'),state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{};
function at(file){try{return execFileSync('git',['show',ref+':prototypes/match-engine-unity/'+file],{cwd:repo,stdio:['ignore','pipe','ignore']});}catch{return null;}}
const written=[],removed=[];
for(const file of fs.readdirSync(source)){
 const folder=destination(file);if(!folder)continue;const target=path.join(probe,folder,file);
 const content=editor.test(file)?fs.readFileSync(path.join(source,file)):at(file);
 if(content===null){if(fs.existsSync(target)){fs.rmSync(target);fs.rmSync(target+'.meta',{force:true});delete state[target];removed.push(file);}continue;}
 if(fs.existsSync(target)&&strip(fs.readFileSync(target))===strip(content))continue;
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);state[target]=digest(content);written.push(file);
}
fs.mkdirSync(path.dirname(stateFile),{recursive:true});fs.writeFileSync(stateFile,JSON.stringify(state,null,1));
console.log(JSON.stringify({ref,written,removed}));
