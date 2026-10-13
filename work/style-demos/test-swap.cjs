'use strict';
// Fault-injection test for swap.cjs on disposable directories. No runtime flag exists in the tools; faults are injected
// here by wrapping fs.renameSync. usage: node work/style-demos/test-swap.cjs [--dir ABS_DIR_UNDER_outputs/style-demos/support]
const fs=require('node:fs'),path=require('node:path');
const lib=require('./lib.cjs');lib.requireNode();
const {swapIn}=require('./swap.cjs');

const arg=process.argv.indexOf('--dir');
const base=path.resolve(arg>0?process.argv[arg+1]:path.join(lib.OWN_REPO,'outputs','style-demos','support','round2','swap-tests'));
const testRoot=path.join(lib.OWN_REPO,'outputs','style-demos','support'),testRelative=path.relative(testRoot,base);
if(!testRelative||testRelative.startsWith('..')||path.isAbsolute(testRelative))throw new Error('--dir muss strikt unter outputs/style-demos/support des eigenen Checkouts liegen: '+base);
fs.rmSync(base,{recursive:true,force:true});

let passed=0,failed=0;
const ok=(name,cond,detail)=>{if(cond)passed++;else failed++;console.log((cond?'ok   ':'FAIL ')+name+(cond?'':'  '+(detail||'')));};
const read=p=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):null;

// scenario dir: out/{site/index.html, demo-package.json} = OLD (optional) and out/.staging/{site/index.html, demo-package.json} = NEW
function scenario(name,{withOld=true}={}){
  const out=path.join(base,name),stage=path.join(out,'.staging');
  fs.mkdirSync(path.join(stage,'site'),{recursive:true});
  fs.writeFileSync(path.join(stage,'site','index.html'),'NEW-site');fs.writeFileSync(path.join(stage,'demo-package.json'),'NEW-manifest');
  if(withOld){fs.mkdirSync(path.join(out,'site'),{recursive:true});fs.writeFileSync(path.join(out,'site','index.html'),'OLD-site');fs.writeFileSync(path.join(out,'demo-package.json'),'OLD-manifest');}
  return{out,stage,backupDir:path.join(out,'.previous-test'),rejectDir:path.join(out,'.rejected-test'),staged:[['site',path.join(stage,'site')],['demo-package.json',path.join(stage,'demo-package.json')]]};
}
// fsx whose renameSync throws EBUSY for the n-th rename whose source/destination matches `match`
function faulty(match){
  const fsx=Object.create(fs);fsx.renameSync=(from,to)=>{if(match(path.basename(from),path.basename(path.dirname(from)),path.basename(to),path.basename(path.dirname(to)))){const e=new Error('EBUSY: injected, rename '+from);e.code='EBUSY';throw e;}return fs.renameSync(from,to);};
  return fsx;
}
const run=(s,fsx)=>{try{swapIn({out:s.out,staged:s.staged,backupDir:s.backupDir,rejectDir:s.rejectDir,fsx});return null;}catch(e){return e;}};
const oldIsBack=s=>read(path.join(s.out,'site','index.html'))==='OLD-site'&&read(path.join(s.out,'demo-package.json'))==='OLD-manifest';
const candidateNotServed=s=>!fs.existsSync(path.join(s.out,'site','index.html'))||read(path.join(s.out,'site','index.html'))!=='NEW-site';

{ // 1. successful replacement of an existing package
  const s=scenario('replace'),e=run(s);
  ok('replace: no error',!e,e&&e.message);
  ok('replace: new site + manifest in place',read(path.join(s.out,'site','index.html'))==='NEW-site'&&read(path.join(s.out,'demo-package.json'))==='NEW-manifest');
  ok('replace: backup deleted after success',!fs.existsSync(s.backupDir));
  ok('replace: staging entries moved out',!fs.existsSync(path.join(s.stage,'site')));
}
{ // 2. first install without an old package
  const s=scenario('fresh',{withOld:false}),e=run(s);
  ok('fresh: installed',!e&&read(path.join(s.out,'site','index.html'))==='NEW-site'&&read(path.join(s.out,'demo-package.json'))==='NEW-manifest',e&&e.message);
}
{ // 3. backing up the 2nd entry fails after the 1st was already moved to the backup
  const s=scenario('backup-second-fails'),e=run(s,faulty((f,fp,t,tp)=>f==='demo-package.json'&&t==='demo-package.json'&&tp==='.previous-test'));
  ok('backup2: error reported with original cause',e&&e.exitCode===2&&/EBUSY/.test(e.message)&&e.cause&&e.cause.code==='EBUSY',e&&e.message);
  ok('backup2: old site + manifest back at original paths',oldIsBack(s));
  ok('backup2: candidate not served, still staged',candidateNotServed(s)&&read(path.join(s.stage,'site','index.html'))==='NEW-site'&&read(path.join(s.stage,'demo-package.json'))==='NEW-manifest');
  ok('backup2: no rollback-failed flag, backup dir cleaned',!e.rollbackFailed&&!fs.existsSync(s.backupDir));
}
{ // 4. installing the 2nd staged entry fails after the 1st was installed
  const s=scenario('install-second-fails'),e=run(s,faulty((f,fp,t,tp)=>f==='demo-package.json'&&fp==='.staging'));
  ok('install2: error reported with original cause',e&&e.exitCode===2&&/EBUSY/.test(e.message)&&e.cause&&e.cause.code==='EBUSY',e&&e.message);
  ok('install2: old site + manifest back at original paths',oldIsBack(s));
  ok('install2: candidate moved out of served location, back in staging',candidateNotServed(s)&&read(path.join(s.stage,'site','index.html'))==='NEW-site'&&read(path.join(s.stage,'demo-package.json'))==='NEW-manifest');
  ok('install2: backup dir cleaned',!fs.existsSync(s.backupDir));
}
{ // 5. first install fails (old moved away already): old must return
  const s=scenario('install-first-fails'),e=run(s,faulty((f,fp)=>f==='site'&&fp==='.staging'));
  ok('install1: old package restored',e&&oldIsBack(s)&&candidateNotServed(s),e&&e.message);
}
{ // 6. rollback impossible: install 2nd fails and the old site cannot be restored -> backup must survive, paths reported
  const s=scenario('rollback-fails'),e=run(s,faulty((f,fp,t,tp)=>(f==='demo-package.json'&&fp==='.staging')||(f==='site'&&fp==='.previous-test')));
  ok('rollback-fail: error flagged and mentions original + surviving backup',e&&e.rollbackFailed===true&&/EBUSY/.test(e.message)&&e.message.includes(path.join(s.backupDir,'site')),e&&e.message);
  ok('rollback-fail: old site bytes survive in backup',read(path.join(s.backupDir,'site','index.html'))==='OLD-site');
  ok('rollback-fail: backup not deleted',fs.existsSync(s.backupDir));
  ok('rollback-fail: candidate not served as old state',candidateNotServed(s)&&read(path.join(s.out,'demo-package.json'))!=='NEW-manifest');
  ok('rollback-fail: old manifest restored where possible',read(path.join(s.out,'demo-package.json'))==='OLD-manifest');
}
{ // 7. candidate cannot be moved back to staging -> goes to the rejected dir, old package restored, nothing served from the candidate
  const s=scenario('reject-dir'),e=run(s,faulty((f,fp,t,tp)=>(f==='demo-package.json'&&fp==='.staging')||(f==='site'&&t==='site'&&tp==='.staging')));
  ok('reject-dir: old package restored, candidate not served',e&&!e.rollbackFailed&&oldIsBack(s)&&candidateNotServed(s),e&&e.message);
  ok('reject-dir: rejected dir cleaned',!fs.existsSync(s.rejectDir));
}
{ // 7b. candidate can neither return nor be rejected -> reported, old backup survives
  const s=scenario('reject-impossible'),e=run(s,faulty((f,fp,t,tp)=>(f==='demo-package.json'&&fp==='.staging')||(f==='site'&&t==='site'&&(tp==='.staging'||tp==='.rejected-test'))));
  ok('reject-impossible: flagged, candidate location and backup named',e&&e.rollbackFailed===true&&e.message.includes('Kandidat site liegt noch in '+path.join(s.out,'site'))&&e.message.includes(path.join(s.backupDir,'site')),e&&e.message);
  ok('reject-impossible: backup survives',read(path.join(s.backupDir,'site','index.html'))==='OLD-site');
}
{ // 8. path guard: nothing outside the owned directory is moved or deleted
  const s=scenario('guard'),outside=path.join(base,'outside-sentinel');fs.mkdirSync(outside,{recursive:true});fs.writeFileSync(path.join(outside,'keep.txt'),'keep');
  let e=null;try{swapIn({out:s.out,staged:s.staged,backupDir:outside,rejectDir:s.rejectDir});}catch(x){e=x;}
  ok('guard: backupDir outside out is refused',e&&/außerhalb/.test(e.message),e&&e.message);
  ok('guard: external sentinel untouched',read(path.join(outside,'keep.txt'))==='keep');
  ok('guard: old package untouched after refusal',oldIsBack(s));
  e=null;try{swapIn({out:s.out,staged:[['site',path.join(outside,'keep.txt')]],backupDir:s.backupDir,rejectDir:s.rejectDir});}catch(x){e=x;}
  ok('guard: staged path outside out is refused and old package restored',e&&oldIsBack(s)&&read(path.join(outside,'keep.txt'))==='keep',e&&e.message);
  e=null;try{swapIn({out:s.out,staged:[['../evil',path.join(s.stage,'site')]],backupDir:s.backupDir,rejectDir:s.rejectDir});}catch(x){e=x;}
  ok('guard: unknown entry name refused',e&&/Unbekannter Paketeintrag/.test(e.message));
  e=null;try{swapIn({out:'relative/out',staged:[],backupDir:s.backupDir,rejectDir:s.rejectDir});}catch(x){e=x;}
  ok('guard: relative out refused',e&&/absolut/.test(e.message));
}
console.log('\n'+passed+' ok, '+failed+' fehlgeschlagen · Arbeitsordner '+base);
process.exitCode=failed?1:0;
