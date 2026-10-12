'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const commands=fs.readFileSync('.github/workflows/deploy.yml','utf8').split(/\r?\n/).map(line=>line.trim()).filter(line=>/^(?:DOPPEL_\w+=\d+ )*(?:node work\/(?!build\.cjs)|python3 work\/test)/.test(line));
const out='outputs/release-128/tests';fs.mkdirSync(out,{recursive:true});const previous=process.argv.includes('--remaining')?JSON.parse(fs.readFileSync(path.join(out,'checks.json'),'utf8')):{rows:[]};
const previousFailures=[...(previous.previousFailures||[]),...previous.rows.filter(row=>row.exit!==0)],rows=previous.rows.filter(row=>row.exit===0);
const completed=new Set(rows.filter(row=>row.exit===0).map(row=>row.command));
for(const [index,line] of commands.entries()){
 if(completed.has(line))continue;
 const tokens=line.split(/\s+/),env={...process.env};while(tokens[0].startsWith('DOPPEL_')){const [key,value]=tokens.shift().split('=');env[key]=value;}
 const executable=tokens.shift()==='node'?process.execPath:'python',at=Date.now();
 const result=spawnSync(executable,tokens,{env,encoding:'utf8',windowsHide:true,maxBuffer:20*1024*1024,timeout:900000});
 const log=path.join(out,`${String(rows.length+1).padStart(3,'0')}-${path.basename(tokens[0])}.log`);
 fs.writeFileSync(log,(result.stdout||'')+(result.stderr||'')+(result.error?.message||''));
 rows.push({command:line,exit:result.status,seconds:(Date.now()-at)/1000,log});console.log(JSON.stringify(rows.at(-1)));
 fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({passed:rows.every(row=>row.exit===0),completed:rows.length,total:commands.length,previousFailures,rows},null,2)+'\n');
}
if(rows.some(row=>row.exit!==0))process.exitCode=1;
