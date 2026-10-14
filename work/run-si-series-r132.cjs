'use strict';
// Runs the Spielerintelligenz measurement series (docs/spielerintelligenz-analyse-2026-10-14.md)
// in parallel lanes (default ports 4262-4264, 6 browser pages each). Results: outputs/si-r132/*.json.
// Usage: node work/run-si-series-r132.cjs [--set=core|levers|extra|all] [--clubs=96] [--ports=4262,4263,4264] [--dry]
const {spawn}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),measure=path.join(__dirname,'measure-si-r132.cjs'),logs=path.join(root,'outputs/si-r132');
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const set=arg('set','all'),clubs=arg('clubs','96'),ports=arg('ports','4262,4263,4264').split(',').map(Number);
const core=['baseline','si-full45','si-full50','si-attack','si-brain','si-attack-gk','si-full42','si-full50-b03soft','si-full50-c160','speed50-teleport'];
const levers=['si-move','decide','offers','risk','cross','gk','teleport','rebound','runners2'];
const extra=['si-max42','si-max42-skill','si-max42-norisk','si-full40','si-full45-scale','si-full42-b03soft'];
const list=set==='core'?core:set==='levers'?levers:set==='extra'?extra:[...core,...levers];
const jobs=list.filter(v=>!fs.existsSync(path.join(logs,`${v}.json`))).map(v=>[`--variant=${v}`,`--clubs=${clubs}`]);
if(process.argv.includes('--dry')){for(const j of jobs)console.log(j.join(' '));process.exit(0);}
fs.mkdirSync(logs,{recursive:true});
const run=(args,port)=>new Promise(resolve=>{const name=args.join('_').replace(/[^A-Za-z0-9.-]+/g,'_'),log=fs.openSync(path.join(logs,`series-${name}.log`),'w');
 const child=spawn(process.execPath,[measure,...args,'--workers=6',`--port=${port}`],{cwd:root,stdio:['ignore',log,log]});child.on('exit',code=>{fs.closeSync(log);console.log(`${new Date().toISOString()} ${code===0?'ok  ':'FAIL'} ${args.join(' ')}`);resolve(code);});});
(async()=>{let next=0,failed=0;const lane=async port=>{while(next<jobs.length){const job=jobs[next++];if(await run(job,port))failed++;}};
 console.log(`${new Date().toISOString()} jobs=${jobs.length}`);
 await Promise.all(ports.map(lane));console.log(JSON.stringify({set,jobs:jobs.length,failed}));if(failed)process.exitCode=1;})();
