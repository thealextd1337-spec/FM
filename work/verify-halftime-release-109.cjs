const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),rows=[];
for(const args of [['work/build.cjs'],['work/check-release-tests-v108.cjs'],['work/generate-user-meshy-match.cjs'],['work/check-halftime-fullscreen-v136.cjs'],['work/run-fullscreen-regression-v136.cjs'],['work/run-halftime-parity-v136.cjs']]){
 const start=Date.now(),result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:20*1024*1024,timeout:360000});
 const row={command:args.join(' '),exit:result.status,seconds:(Date.now()-start)/1000};rows.push(row);console.log(JSON.stringify(row));
 if(result.status!==0){console.error(result.stdout,result.stderr,result.error?.message||'');process.exit(1);}
}
const html=fs.readFileSync(path.join(root,'outputs/index.html'),'utf8'),source=fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),script=fs.readFileSync(path.join(root,'dist/world-goal-replay-v103.js'),'utf8').replace(/\r\n/g,'\n');
assert(source.includes('PROTOTYP 109'));assert(html.includes('PROTOTYP 109'));assert(html.includes(script));
const report={version:109,rows,bytes:Buffer.byteLength(html),sha256:crypto.createHash('sha256').update(html).digest('hex'),sourceBuildMatch:true};
fs.writeFileSync(path.join(root,'outputs/release-109-preflight.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
