'use strict';
// Copies the versioned Unity sources into the existing project's
// Assets/Doppel6EngineProbe folders. A project file that differs from both the
// committed base, the new source and the last copy made by this script belongs
// to someone else: stop, never overwrite.
//   node prototypes/match-engine-unity/sync-unity.cjs [unity project] [--base <git ref>]
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const here=__dirname,repo=path.resolve(here,'../..'),args=process.argv.slice(2);
const project=args.find(a=>!a.startsWith('--')&&args[args.indexOf(a)-1]!=='--base')||'G:/unity/My project';
const base=args.includes('--base')?args[args.indexOf('--base')+1]:'HEAD';
const probe=path.join(project,'Assets/Doppel6EngineProbe');
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
const stateFile=path.join(repo,'outputs/unity-cli/sync-state.json'),state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{};
const digest=b=>require('node:crypto').createHash('sha256').update(strip(b)).digest('hex');
const strip=b=>b.toString('utf8').replace(/\r/g,'').replace(/\n+$/,'');
function committed(file){try{return execFileSync('git',['show',base+':prototypes/match-engine-unity/'+file],{cwd:repo,stdio:['ignore','pipe','ignore']});}catch{return null;}}
const copies=[],conflicts=[];
for(const file of fs.readdirSync(here)){
 const folder=destination(file);if(!folder)continue;
 const source=fs.readFileSync(path.join(here,file)),target=path.join(probe,folder,file);
 if(fs.existsSync(target)){
  const current=fs.readFileSync(target);if(strip(current)===strip(source))continue;
  const old=committed(file);if((!old||strip(old)!==strip(current))&&state[target]!==digest(current))conflicts.push(path.relative(project,target));
 }
 copies.push([path.join(here,file),target]);
}
if(conflicts.length){console.error('Foreign changes in the Unity project, nothing copied:\n '+conflicts.join('\n '));process.exit(2);}
for(const [from,to] of copies){fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);state[to]=digest(fs.readFileSync(to));console.log('copied',path.relative(project,to));}
fs.mkdirSync(path.dirname(stateFile),{recursive:true});fs.writeFileSync(stateFile,JSON.stringify(state,null,1));
console.log(copies.length+' file(s) synchronised');
