'use strict';
// A world without the 183 stamp must play native matches exactly like release 132: digests (full native state incl. continuation, P02 load and
// random draws) of the constructor default in a stamp-free world on the current dist against the published base e4e531c0.
// Usage: node work/check-old-world-matches-v183.cjs [baseRoot]   (baseRoot defaults to work/tmp-base183, created with `git archive e4e531c0 dist work/test-v41.cjs`)
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const sha=text=>crypto.createHash('sha256').update(text).digest('hex');
if(process.env.D6_OLDWORLD_CHILD){
 const {create}=require('./native183-scenes.cjs'),h=create({view:false}),out=[];
 for(const scene of h.copy(h.call('Native183.constructedScenes')))out.push({id:scene.id,hash:sha(h.call('Native183.constructedDigest',{config:{...scene.config,stamp:false}},{}))});
 process.stdout.write(JSON.stringify(out));
}else{
 const root=path.resolve(__dirname,'..'),base=path.resolve(process.argv[2]||path.join(__dirname,'tmp-base183'));
 if(!fs.existsSync(path.join(base,'dist/world-physical-v65.js'))){fs.mkdirSync(base,{recursive:true});cp.execSync(`git archive --format=tar e4e531c0 dist work/test-v41.cjs | tar -x -C "${base.replaceAll('\\','/')}"`,{cwd:root,stdio:['ignore','inherit','inherit'],shell:true});}
 assert(!fs.existsSync(path.join(base,'dist/match-si-core-v183.js')),'Base tree already contains SI 183');
 const run=dir=>{const r=cp.spawnSync(process.execPath,[__filename],{cwd:root,env:{...process.env,D6_OLDWORLD_CHILD:'1',D6_TEST_ROOT:dir},encoding:'utf8',maxBuffer:1<<26});if(r.status!==0)throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout);};
 const before=run(base),after=run(root);
 assert.equal(after.length,before.length);
 const differing=after.filter((row,i)=>row.id!==before[i].id||row.hash!==before[i].hash).map(r=>r.id);
 console.log(JSON.stringify({pass:!differing.length,scenes:after.length,differing,scope:'constructor default of a world without the 183 stamp, current dist against base e4e531c0, 3 x 300 ticks per scene, standard and large pitch, with and without roles'}));
 if(differing.length)process.exit(1);
}
