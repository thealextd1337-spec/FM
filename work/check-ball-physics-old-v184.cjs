'use strict';
// Ball physics 184 must not touch matches without the marker: unmarked and 182
// scenes and constructor matches without marker (si:false) replay
// byte-identically against release 133 (5c3ea6b8): same native state,
// continuation, P02 ledger and random draws. Marked matches constructed with
// ball:false are compared with the current tree loaded WITHOUT the 184 module
// (D6_SKIP_BALL184, native130-harness): the loaded module must be inert for
// them. Release 133 is no base for these 12 scenes any more since B28
// (fix/si-defender-drift) changed SI-4 for every marked match, ball marker or
// not (bug fixes stay ungated by user rule). Marked matches with the default
// (ball marker 184) must differ from the module-less tree in at least one
// scene, otherwise the module is not wired in.
// Usage: node work/check-ball-physics-old-v184.cjs [baseRoot]
// baseRoot defaults to work/tmp-base184; if missing it is created with
// `git archive 5c3ea6b8 dist work/test-v41.cjs`.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const BASE_COMMIT='5c3ea6b8';
const sha=text=>crypto.createHash('sha256').update(text).digest('hex');
if(process.env.D6_OLD184_CHILD){
 const {create}=require('./native183-scenes.cjs'),h=create({view:false}),current=process.env.D6_OLD184_CHILD!=='base',out=[];
 for(const scene of h.copy(h.call('Native182.oldScenes')))out.push({group:'unmarked',id:scene.id,hash:sha(h.call('Native182.oldDigest',scene))});
 for(const scene of h.copy(h.call('Native183.marked182Scenes')))out.push({group:'marked182',id:scene.id,hash:sha(h.call('Native182.oldDigest',scene))});
 for(const scene of h.copy(h.call('Native183.constructedScenes'))){
  out.push({group:'constructed182',id:scene.id,hash:sha(h.call('Native183.constructedDigest',scene,{si:false})),marker:h.evaluate('match.attackFlow.ballRevision??null')});
  out.push({group:'marked-ball-off',id:scene.id,hash:sha(h.call('Native183.constructedDigest',scene,current?{ball:false}:{})),marker:h.evaluate('match.attackFlow.ballRevision??null')});
  out.push({group:'marked-default',id:scene.id,hash:sha(h.call('Native183.constructedDigest',scene,{})),marker:h.evaluate('match.attackFlow.ballRevision??null')});
 }
 process.stdout.write(JSON.stringify(out));
}else{
 const root=path.resolve(__dirname,'..'),base=path.resolve(process.argv[2]||path.join(__dirname,'tmp-base184'));
 if(!fs.existsSync(path.join(base,'dist/world-physical-v65.js'))){
  if(process.argv[2])throw Error(`Base tree without dist: ${base}`);
  fs.mkdirSync(base,{recursive:true});
  cp.execSync(`git archive --format=tar ${BASE_COMMIT} dist work/test-v41.cjs | tar -x -C "${base.replaceAll('\\','/')}"`,{cwd:root,stdio:['ignore','inherit','inherit'],shell:true});
 }
 assert(!fs.existsSync(path.join(base,'dist/match-ball-physics-v184.js')),'Base tree already contains ball physics 184');
 const run=(dir,label)=>{const r=cp.spawnSync(process.execPath,[__filename],{cwd:root,env:{...process.env,D6_OLD184_CHILD:label,D6_TEST_ROOT:dir,...(label==='current-noball'?{D6_SKIP_BALL184:'1'}:{})},encoding:'utf8',maxBuffer:1<<26});if(r.status!==0)throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout);};
 const before=run(base,'base'),after=run(root,'current'),noBall=run(root,'current-noball');
 const noBallByKey=new Map(noBall.map(r=>[r.group+':'+r.id,r]));
 assert.equal(after.length,before.length,'Scene count differs');
 const same=['unmarked','marked182','constructed182'];
 const differing=after.filter((row,i)=>same.includes(row.group)&&(row.group!==before[i].group||row.id!==before[i].id||row.hash!==before[i].hash)).map(r=>`${r.group}:${r.id}`);
 for(const row of after)if(row.group==='marked-ball-off'&&row.hash!==noBallByKey.get(row.group+':'+row.id)?.hash)differing.push('marked-ball-off(vs module-less tree):'+row.id);
 const changed=after.filter(row=>row.group==='marked-default'&&row.hash!==noBallByKey.get(row.group+':'+row.id)?.hash).length;
 const markerErrors=[];
 for(const row of after){
  if(['constructed182','marked-ball-off'].includes(row.group)&&row.marker!==null)markerErrors.push(`${row.id}: ${row.group} carries ballRevision ${row.marker}`);
  if(row.group==='marked-default'&&row.marker!==184)markerErrors.push(`${row.id}: default marked match without ballRevision 184`);
 }
 for(const row of before)if(row.marker!=null)markerErrors.push(`base ${row.group}:${row.id} has a ball marker`);
 for(const row of noBall)if(row.group==='marked-default'&&row.marker!==184)markerErrors.push(`module-less ${row.id}: default marked match without ballRevision 184`);
 const groups=Object.fromEntries(['unmarked','marked182','constructed182','marked-ball-off','marked-default'].map(g=>[g,after.filter(r=>r.group===g).length]));
 const pass=!differing.length&&!markerErrors.length&&changed>0;
 console.log(JSON.stringify({pass,scenes:after.length,groups,differing,markerErrors,markedDefaultChanged:changed,base,baseCommit:BASE_COMMIT,scope:'Native VM scenes: unmarked and 182 scenes and constructor matches without marker are byte-identical to release 133; marked matches with ball:false are byte-identical to the current tree without the 184 module (full digests incl. continuation, P02 load and RNG draws); marked default matches carry ballRevision 184 and differ from the module-less tree.'}));
 if(!pass)process.exit(1);
}
