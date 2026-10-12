'use strict';
// Continue the exact production command list from the first failed command.
// The preceding commands already passed in the recorded GitHub Actions run.
const fs=require('node:fs'),cp=require('node:child_process');
const commands=fs.readFileSync('.github/workflows/deploy.yml','utf8').split(/\r?\n/).map(s=>s.trim()).filter(s=>/^(?:DOPPEL_\w+=\d+ )*(?:node work\/|python3 work\/test)/.test(s));
const first=commands.indexOf('node work/test-world-direct-transfer.cjs');if(first<0)throw Error('Expected production command missing');
const rows=[],out='outputs/release-129/remaining-gates.json';
for(const command of commands.slice(first)){
 const words=command.split(' '),env={...process.env};while(words[0].startsWith('DOPPEL_')){const [k,v]=words.shift().split('=');env[k]=v;}
 const executable=words.shift()==='node'?process.execPath:'python',at=Date.now(),r=cp.spawnSync(executable,words,{env,encoding:'utf8',maxBuffer:8*1024*1024,timeout:900000,windowsHide:true});
 rows.push({command,exit:r.status,ms:Date.now()-at,output:(r.stdout||'').slice(-2000),error:(r.stderr||'').slice(-3000)});
 fs.writeFileSync(out,JSON.stringify({first,passed:rows.every(r=>r.exit===0),complete:rows.length===commands.length-first,rows},null,2));
 console.log(JSON.stringify({done:rows.length,total:commands.length-first,command,exit:r.status}));if(r.status!==0)process.exit(1);
}
