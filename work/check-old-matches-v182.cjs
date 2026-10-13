'use strict';
// Unmarked (old) matches must replay byte-identically against the base commit:
// same native state, continuation, P02 ledger and random draws per scene.
// Usage: node work/check-old-matches-v182.cjs [baseRoot]
// baseRoot defaults to work/tmp-base182 (e.g. `git archive f2458c1f dist work/test-v41.cjs`).
const path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
if(process.env.D6_OLD182_CHILD){
 const {create}=require('./native182-scenes.cjs'),h=create({view:false}),out=[];
 for(const scene of h.copy(h.call('Native182.oldScenes')))out.push({id:scene.id,hash:crypto.createHash('sha256').update(h.call('Native182.oldDigest',scene)).digest('hex')});
 process.stdout.write(JSON.stringify(out));
}else{
 const root=path.resolve(__dirname,'..'),base=path.resolve(process.argv[2]||path.join(__dirname,'tmp-base182'));
 const run=dir=>{const r=cp.spawnSync(process.execPath,[__filename],{cwd:root,env:{...process.env,D6_OLD182_CHILD:'1',D6_TEST_ROOT:dir},encoding:'utf8',maxBuffer:1<<26});if(r.status!==0)throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout);};
 const before=run(base),after=run(root);assert.equal(after.length,before.length);
 const differing=after.filter((row,i)=>row.id!==before[i].id||row.hash!==before[i].hash).map(r=>r.id);
 console.log(JSON.stringify({pass:!differing.length,scenes:after.length,differing,base,scope:'Unmarked native scenes (loose balls and defensive pursuit) on base vs. current dist; full digests incl. RNG draws.'}));
 if(differing.length)process.exit(1);
}
