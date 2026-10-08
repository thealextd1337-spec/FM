// Read-only acceptance on the live deployment using fresh browser profiles.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),report=JSON.parse(fs.readFileSync(path.join(root,'outputs/release-108-preflight.json'),'utf8'));
for(const [file,args,env]of [['work/check-live-release-v108.cjs',[],{}],['work/check-mobile-performance-v135.cjs',['after'],{D6_TEST_URL:'https://fussball.cakamper.at/?release=108&mobileqa=1'}]]){
 if(process.argv.includes('--mobile-only')&&file==='work/check-live-release-v108.cjs')continue;
 const result=spawnSync(process.execPath,[file,...args],{cwd:root,env:{...process.env,...env},encoding:'utf8',windowsHide:true,maxBuffer:2*1024*1024,timeout:360000});console.log(result.stdout);if(result.status!==0){console.error(result.stderr,result.error?.message||'');process.exit(1);}
}
const live=JSON.parse(fs.readFileSync(path.join(root,'outputs/live-release-v108.json'),'utf8')),mobile=JSON.parse(fs.readFileSync(path.join(root,'outputs/mobile-performance-v135-after.json'),'utf8'));assert.equal(live.sha256,report.sha256);assert.equal(live.version,108);assert.equal(mobile.initial.ratio,1);assert.equal(mobile.initial.shadows,false);assert.deepEqual(mobile.errors,[]);
console.log(JSON.stringify({liveVersion:live.version,sha256:live.sha256,sourceBuildLiveEqual:true,mobileVerified:true}));
