'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const root=__dirname,file=path.join(root,'ci.json'),old=JSON.parse(fs.readFileSync(file)),base='https://api.github.com/repos/thealextd1337-spec/FM/actions/runs/38316574115';
const headers={'User-Agent':'Doppel6-release-validation'};const r=await fetch(base,{headers});assert(r.ok);const run=await r.json();assert.equal(run.head_sha,'1063ed6f96d507bfa14b0b8a8cfd764646771bb6');assert.equal(run.status,'completed');assert.equal(run.conclusion,'success');
const j=await fetch(base+'/jobs',{headers});assert(j.ok);const jobs=await j.json();const now=new Date().toISOString();
for(const f of ['handoff.md','handoff.json'])fs.copyFileSync(path.join(root,f),path.join(root,'pre-upload-'+f));
old.rows.push({checkedAt:now,id:run.id,head:run.head_sha,status:run.status,conclusion:run.conclusion,html_url:run.html_url});old.checkedAt=now;old.jobsCheckedAt=now;old.status=run.status;old.conclusion=run.conclusion;old.jobs=jobs.jobs.map(({id,name,status,conclusion,html_url,steps})=>({id,name,status,conclusion,html_url,steps}));old.inProgressHandoff=false;old.completedAfterBoundedChildWait=true;
fs.writeFileSync(file,JSON.stringify(old,null,2));console.log(JSON.stringify({status:run.status,conclusion:run.conclusion,head:run.head_sha}));
})().catch(e=>{console.error(e);process.exitCode=1;});
