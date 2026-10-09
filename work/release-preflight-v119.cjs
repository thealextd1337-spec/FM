'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');
const workflow=fs.readFileSync('.github/workflows/deploy.yml','utf8');
const commands=workflow.split(/\r?\n/).map(line=>/^          ((?:[A-Z_]+=[^ ]+ )*)(node|python3) (.+)$/.exec(line)).filter(Boolean);
const out='outputs/release-119';fs.mkdirSync(out,{recursive:true});
const crypto=require('node:crypto');
function sourceHashes(){const files=[];function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=dir+'/'+e.name;if(e.isDirectory())scan(f);else files.push(f)}}scan('dist');files.push('.github/workflows/deploy.yml','work/build.cjs','work/generate-3d-documentation.cjs','docs/3d-system.md','docs/3d-system-en.md');return Object.fromEntries(files.sort().map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))}
const frozen=sourceHashes();
const taskTemp=path.resolve(out,'tmp');fs.mkdirSync(taskTemp,{recursive:true});
const old=process.argv.includes('--resume')&&fs.existsSync(out+'/preflight.json')?JSON.parse(fs.readFileSync(out+'/preflight.json')):null;
if(old&&JSON.stringify(old.sourceHashes)!==JSON.stringify(frozen))throw Error('Cannot resume: product source bytes changed since previous checks');
const previous=old?old.checks.filter(row=>row.pass):[];
const report={release:119,started:new Date().toISOString(),sourceHashes:frozen,checks:[],pass:false};
for(const [,assignments,kind,args] of commands){
 const command=assignments+kind+' '+args,passed=previous.find(row=>row.command===command);if(passed){report.checks.push(passed);continue;}
 const env={...process.env};for(const part of assignments.trim().split(' ').filter(Boolean)){const i=part.indexOf('=');env[part.slice(0,i)]=part.slice(i+1);}
 if(kind==='python3')env.TMPDIR=taskTemp;
 const start=Date.now(),result=cp.spawnSync(kind==='node'?process.execPath:process.env.D6_PYTHON||'python3',args.split(' '),{env,encoding:'utf8',windowsHide:true,maxBuffer:12*1024*1024});
 const row={command,pass:result.status===0,seconds:+((Date.now()-start)/1000).toFixed(2)};
 report.checks.push(row);console.log((row.pass?'PASS ':'FAIL ')+row.command+' ('+row.seconds+'s)');
 if(!row.pass){row.output=(result.stdout||'')+(result.stderr||'')+(result.error?.message||'');console.log(row.output.slice(-12000));fs.writeFileSync(out+'/preflight.json',JSON.stringify(report,null,2)+'\n');process.exit(1);}
}
if(JSON.stringify(sourceHashes())!==JSON.stringify(frozen))throw Error('Product sources changed during preflight');
report.pass=true;report.finished=new Date().toISOString();fs.writeFileSync(out+'/preflight.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS: '+report.checks.length+' exact production preflight commands.');
