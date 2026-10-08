const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
(async()=>{
 const url='https://fussball.cakamper.at/?release=109',response=await fetch(url);assert(response.ok);
 const body=Buffer.from(await response.arrayBuffer()),sha256=crypto.createHash('sha256').update(body).digest('hex'),expected=crypto.createHash('sha256').update(fs.readFileSync('outputs/index.html')).digest('hex');
 assert.equal(sha256,expected,'Live bytes equal verified build');assert(body.toString('utf8').includes('PROTOTYP 109'));
 const result=spawnSync(process.execPath,['work/check-halftime-fullscreen-v136.cjs'],{encoding:'utf8',windowsHide:true,env:{...process.env,D6_HALFTIME_LIVE_URL:url},timeout:360000,maxBuffer:4*1024*1024});
 if(result.status!==0)throw Error(result.stdout+'\n'+result.stderr+'\n'+(result.error?.message||''));
 const report={version:109,url,bytes:body.length,sha256,sourceBuildLiveMatch:true,halftime:JSON.parse(fs.readFileSync('outputs/halftime-fullscreen-v136-live.json','utf8'))};
 fs.writeFileSync('outputs/live-release-v109.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(error=>{console.error(error);process.exitCode=1;});
