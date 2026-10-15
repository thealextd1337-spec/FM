'use strict';
// SI-4 restore completeness with the B19 tool (work/check-restore-completeness-v183.cjs):
// real browser matches, Snapshot -> JSON -> Restore at the moment the package state
// exists, deep comparison of the whole state, then play on to the final whistle.
// Scenes: the safety defender is assigned, a counter-pressing window is open, the slide
// cadence has been used. The package keeps its state as plain data in
// match.attackFlow.defence and owns no module-wide WeakMap.
// Usage (lane B, take the lane lock first): node work/check-restore-defence-v183.cjs [--port=4256]
const {checkScenes}=require('./check-restore-completeness-v183.cjs');
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const SCENES=[
 {id:'si-defence-cover',trigger:"!!m.attackFlow.defence&&m.attackFlow.defence.cover.some(Boolean)&&!m.flight&&!m.slide"},
 {id:'si-defence-counter',trigger:"!!m.attackFlow.defence?.counter&&!m.flight&&!m.slide"},
 {id:'si-defence-slide-cadence',trigger:"m.attackFlow.defence?.slideAt!=null&&!m.flight&&!m.slide"}
];
(async()=>{
 const results=await checkScenes(SCENES,{port:+arg('port','4256'),sizes:['standard','large'],seeds:[0,1,2,3,4,5,6,7]});
 for(const r of results)console.log(`${r.pass?'PASS':'FAIL'} ${String(r.size).padEnd(8)} ${String(r.id).padEnd(26)} fired=${r.fired} seed=${r.seed} tick=${r.checkpoint?.tick} bytes=${r.checkpoint?.snapshotBytes}`);
 console.log(JSON.stringify({pass:results.every(r=>r.pass&&r.fired),runs:results.length}));
 if(!results.every(r=>r.fired))throw Error('a scene never fired');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
