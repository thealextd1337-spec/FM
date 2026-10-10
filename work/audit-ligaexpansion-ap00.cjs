'use strict';

// Read-only inventory. Build/test side effects stay in the isolated outputs copy.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs','ligaexpansion-ap00');
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).trim();
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const scripts=html=>[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match=>match[1]);
const ref=git('rev-parse',process.argv.slice(2).find(arg=>!arg.startsWith('--'))||'origin/main'),snapshot=path.join(out,ref.slice(0,12));
fs.mkdirSync(out,{recursive:true});
if(!fs.existsSync(path.join(snapshot,'dist','index.html'))){
 const archive=path.join(out,ref.slice(0,12)+'.tar');
 cp.execFileSync('git',['archive','--format=tar','-o',archive,ref,'dist','work','docs','AGENTS.md'],{cwd:root});
 fs.mkdirSync(snapshot,{recursive:true});
 cp.execFileSync('tar',['-xf',archive,'-C',snapshot]);
}
const source=fs.readFileSync(path.join(root,'dist','index.html'),'utf8');
const current=fs.readFileSync(path.join(snapshot,'dist','index.html'),'utf8');
const report={checkedAt:new Date().toISOString(),node:process.version,localCommit:git('rev-parse','HEAD'),currentCommit:ref,commitDistance:git('rev-list','--left-right','--count',`HEAD...${ref}`),snapshot,local:{version:source.match(/PROTOTYP \d+/)?.[0],scripts:scripts(source)},current:{version:current.match(/PROTOTYP \d+/)?.[0],scripts:scripts(current)},tests:[]};
report.current.onlyCurrentScripts=report.current.scripts.filter(file=>!report.local.scripts.includes(file));
report.current.modules=report.current.scripts.map(file=>{const data=fs.readFileSync(path.join(snapshot,'dist',file));return{file,sha256:hash(data),bytes:data.length}});
const testFiles=['test-world-foundation-v61.cjs','test-world-competition-v62.cjs','test-world-match-v64.cjs','test-world-save-management-v70.cjs','test-world-storage-v67.cjs','test-world-storage-recovery.cjs','test-world-payments-v124.cjs'];
if(process.argv.includes('--native'))testFiles.push('test-native-career-v160.cjs');
for(const file of testFiles){
 const result=cp.spawnSync(process.execPath,[`work/${file}`],{cwd:snapshot,encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
 report.tests.push({file,exitCode:result.status,error:result.error?.message,output:(result.stdout+result.stderr).trim()});
}
const build=cp.spawnSync(process.execPath,['work/build.cjs'],{cwd:snapshot,encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
report.build={exitCode:build.status,error:build.error?.message,output:(build.stdout+build.stderr).trim()};
if(build.status===0){const data=fs.readFileSync(path.join(snapshot,'outputs','index.html'));report.build.sha256=hash(data);report.build.bytes=data.length;report.build.externalScripts=scripts(data.toString('utf8'));}
const previousCwd=process.cwd();
try{
 process.chdir(snapshot);
 const {call}=require(path.join(snapshot,'work','world-finance-harness-v124.cjs')).harness(false);
 const career=call('v61CreateCareer','GER-2','ap00-legacy48-v1','AP00');
 const before=JSON.stringify(career),roundTrip=JSON.parse(before);
 if(!call('v61ValidateCareer',roundTrip)||JSON.stringify(roundTrip)!==before)throw Error('Legacy fixture round-trip failed');
 const fixture={game:'Doppel 6',format:'world',schema:14,modelVersion:10,exported:new Date().toISOString(),save:career};
 fs.writeFileSync(path.join(out,'legacy48.json'),JSON.stringify(fixture,null,2)+'\n');
 report.legacyFixture={file:'legacy48.json',seed:career.world.seed,valid:true,unchangedAfterValidation:true,clubs:career.world.clubs.length,countries:career.world.countries.length,competitions:career.world.competitions.length,sha256:hash(before)};
}finally{process.chdir(previousCwd)}
const liveFile=path.join(out,'live.json');
if(fs.existsSync(liveFile)){report.live=JSON.parse(fs.readFileSync(liveFile,'utf8'));report.build.matchesObservedLive=report.live.sha256===report.build.sha256;}
fs.writeFileSync(path.join(out,'inventory.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({local:report.local.version,current:report.current.version,commitDistance:report.commitDistance,currentScripts:report.current.scripts.length,tests:report.tests.map(({file,exitCode,error})=>({file,exitCode,error})),build:report.build},null,2));
if(report.tests.some(test=>test.exitCode!==0)||build.status!==0)process.exitCode=1;
