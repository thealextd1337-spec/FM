'use strict';
// Unmarked and 182 matches must replay byte-identically against the published
// R132 base e4e531c0: same native state, continuation, P02 ledger and random
// draws per scene. New matches with marker 183 and every SI package off must
// equal the 182 constructor result apart from the marker field match.si.
// Groups: unmarked v182 scenes, 182-marked v182 scenes (loose ball, pursuit),
// constructor matches without marker (si:false) and constructor matches with
// marker 183 with every package switched off explicitly (digest without match.si).
// Usage: node work/check-old-matches-v183.cjs [baseRoot]
// baseRoot defaults to work/tmp-base183; if missing it is created with
// `git archive e4e531c0 dist work/test-v41.cjs`.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const BASE_COMMIT='e4e531c0';
const sha=text=>crypto.createHash('sha256').update(text).digest('hex');
if(process.env.D6_OLD183_CHILD){
 const {create}=require('./native183-scenes.cjs'),h=create({view:false}),current=h.call('Native183.si'),out=[];
 if(process.env.D6_OLD183_CHILD==='current')assert(current,'SI 183 core is missing in the current tree');
 for(const scene of h.copy(h.call('Native182.oldScenes')))out.push({group:'unmarked',id:scene.id,hash:sha(h.call('Native182.oldDigest',scene))});
 for(const scene of h.copy(h.call('Native183.marked182Scenes')))out.push({group:'marked182',id:scene.id,hash:sha(h.call('Native182.oldDigest',scene))});
 for(const scene of h.copy(h.call('Native183.constructedScenes'))){
  out.push({group:'constructed182',id:scene.id,hash:sha(h.call('Native183.constructedDigest',scene,current?{si:false}:{})),si:h.evaluate('match.si===undefined?null:JSON.stringify(match.si)')});
  out.push({group:'si183-off',id:scene.id,hash:sha(h.call('Native183.constructedDigest',scene,{withoutSi:true,si:current?{packages:Object.fromEntries(['clock','options','offball','finish','defence','setplay','field'].map(p=>[p,false]))}:undefined})),si:h.evaluate('match.si===undefined?null:JSON.stringify(match.si)')});
 }
 process.stdout.write(JSON.stringify(out));
}else{
 const root=path.resolve(__dirname,'..'),base=path.resolve(process.argv[2]||path.join(__dirname,'tmp-base183'));
 if(!fs.existsSync(path.join(base,'dist/world-physical-v65.js'))){
  if(process.argv[2])throw Error(`Base tree without dist: ${base}`);
  fs.mkdirSync(base,{recursive:true});
  cp.execSync(`git archive --format=tar ${BASE_COMMIT} dist work/test-v41.cjs | tar -x -C "${base.replaceAll('\\','/')}"`,{cwd:root,stdio:['ignore','inherit','inherit'],shell:true});
 }
 assert(!fs.existsSync(path.join(base,'dist/match-si-core-v183.js')),'Base tree already contains SI 183');
 const run=(dir,label)=>{const r=cp.spawnSync(process.execPath,[__filename],{cwd:root,env:{...process.env,D6_OLD183_CHILD:label,D6_TEST_ROOT:dir},encoding:'utf8',maxBuffer:1<<26});if(r.status!==0)throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout);};
 const before=run(base,'base'),after=run(root,'current');
 assert.equal(after.length,before.length,'Scene count differs');
 const differing=after.filter((row,i)=>row.group!==before[i].group||row.id!==before[i].id||row.hash!==before[i].hash).map(r=>`${r.group}:${r.id}`);
 // Marker check: si:false leaves no marker; the default carries revision 183
 // with every package off and a positive finite clock rate.
 const markerErrors=[];
 for(const row of after){
  if(row.group==="constructed182"&&row.si!=null)markerErrors.push(`${row.id}: si:false still wrote match.si`);
  if(row.group==='si183-off'){const si=row.si&&JSON.parse(row.si);if(!si||si.revision!==183||Object.values(si.packages).some(Boolean)||!(Number.isFinite(si.clockRate)&&si.clockRate>0))markerErrors.push(`${row.id}: unexpected marker ${row.si}`);}
 }
 for(const row of before)if(row.si!=null)markerErrors.push(`base ${row.group}:${row.id} has match.si`);
 const groups=Object.fromEntries(['unmarked','marked182','constructed182','si183-off'].map(g=>[g,after.filter(r=>r.group===g).length]));
 const pass=!differing.length&&!markerErrors.length;
 console.log(JSON.stringify({pass,scenes:after.length,groups,differing,markerErrors,base,baseCommit:BASE_COMMIT,scope:'Native VM scenes on base vs. current dist: unmarked and 182-marked v182 scenes, constructor matches without marker and with marker 183 (all packages off, digest without match.si); full digests incl. continuation, P02 load and RNG draws.'}));
 if(!pass)process.exit(1);
}
