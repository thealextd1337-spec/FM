'use strict';
// Runs the complete P01 measurement series of docs/p01-analyse-2026-10-14.md in two
// parallel lanes (7 browser pages each). Results: outputs/p01-r132/*.json.
// Usage: node work/run-p01-series-r132.cjs [--set=baseline|variants|boosts|faults|all] [--dry]
const {spawn}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),measure=path.join(__dirname,'measure-p01-r132.cjs'),logs=path.join(root,'outputs/p01-r132');
const set=(process.argv.find(a=>a.startsWith('--set='))||'--set=all').slice(6);
const variants=['no-b03','speed60','speed52','window26','willing','lane10','attack','speed60-attack','carrier145','turn','carrier-turn','aim-keeper','fastRestart','speed52-attack-aim-keeper','speed52-full','speed45-attack-aim-keeper-fast','speed45-full','speed45-full-c160-nob03'];
const jobs=[];
if(['baseline','all'].includes(set))jobs.push(['--variant=baseline','--clubs=96'],['--variant=baseline','--clubs=48','--dt=0.04']);
if(['variants','all'].includes(set))for(const v of variants)jobs.push([`--variant=${v}`,'--clubs=96']);
if(['boosts','all'].includes(set))for(const b of ['fin:4','pas:4','spd:4','tak:4','gk:4'])jobs.push(['--variant=baseline',`--boost=${b}`,'--clubs=48']);
if(['faults','all'].includes(set))for(const p of ['p01f1','p01f2'])for(const v of ['baseline','no-b03'])jobs.push([`--variant=${v}`,`--seedPrefix=${p}`,'--clubs=96']);
if(process.argv.includes('--dry')){for(const j of jobs)console.log(j.join(' '));process.exit(0);}
fs.mkdirSync(logs,{recursive:true});
const run=(args,port)=>new Promise(resolve=>{const name=args.join('_').replace(/[^A-Za-z0-9.-]+/g,'_'),log=fs.openSync(path.join(logs,`series-${name}.log`),'w');
 const child=spawn(process.execPath,[measure,...args,'--workers=7',`--port=${port}`],{cwd:root,stdio:['ignore',log,log]});child.on('exit',code=>{fs.closeSync(log);console.log(`${code===0?'ok  ':'FAIL'} ${args.join(' ')}`);resolve(code);});});
(async()=>{let next=0,failed=0;const lane=async port=>{while(next<jobs.length){const job=jobs[next++];if(await run(job,port))failed++;}};
 await Promise.all([lane(4252),lane(4253)]);console.log(JSON.stringify({set,jobs:jobs.length,failed}));if(failed)process.exitCode=1;})();
