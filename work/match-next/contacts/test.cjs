'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const catalog=require('./catalog.json'),{validate}=require('./validate.cjs'),oracle=require('./oracle.cjs');
assert.deepEqual(validate(catalog),[]);
const results=[];
for(const scene of catalog){
 const got=oracle.evaluate(scene);
 for(const [key,value] of Object.entries(scene.expected))assert.deepEqual(got[key],value,`${scene.id}.${key}: ${JSON.stringify(got)}`);
 if(scene.followup){
  const f=scene.followup,hit=oracle.firstContact(f.ball,f.actors,f.duration);
  assert.equal(hit?.actorId,f.expectedActorId,scene.id+' actual followup contact');
  assert.equal(oracle.boundary(f.shot,scene.geometry,f.shotDuration)?.type,f.expectedFinalType,scene.id+' separate followup shot');
 }
 results.push({id:scene.id,pass:true,actual:got});
}
// Fast motion crosses entirely between frame endpoints: must detect entry at (10-.8)/100 seconds.
const fastBall={position:[0,.29,0],velocity:[100,0,0],radius:.1764};
const defender={id:'d',team:1,role:'field',position:[10,.29,0],velocity:[0,0,0],reach:.8,action:'block'};
assert.ok(Math.abs(oracle.firstContact(fastBall,[defender],.2).time-.092)<1e-12);
// Subdivision cannot remove or move the contact event; actor ordering cannot break ties.
for(const dt of [1/30,1/60,1/144]){
 let hit=null;
 for(let t=0;t<.2&&!hit;t+=dt){const part=oracle.firstContact({...fastBall,position:oracle.add(fastBall.position,fastBall.velocity,t)},[defender],Math.min(dt,.2-t));if(part)hit=t+part.time;}
 assert.ok(Math.abs(hit-.092)<1e-12);
}
const a={...defender,id:'a'},b={...defender,id:'b'};
assert.equal(oracle.firstContact(fastBall,[b,a],.2).actorId,'a');
assert.equal(oracle.firstContact(fastBall,[a,b],.2).actorId,'a');
assert.equal(oracle.firstContact({...fastBall,position:[0,4,0]},[defender],.2),null,'height cannot be ignored');
// Keeper position alone grants no hand right at a ball point outside; foot action remains available.
const permission=catalog.find(s=>s.provenance.family==='box-outside');
assert.equal(oracle.handPermission(permission.actors.find(a=>a.id==='keeper'),permission.ball.position,permission.geometry).allowed,false);
// Independent malformed-data checks: schema validator must actually reject invalid evidence inputs.
for(const mutate of [c=>c[0].actors.pop(),c=>c[0].ball.velocity[0]=null,c=>c[0].geometry.goalWidth*=1.2,c=>c[1].id=c[0].id,c=>c.pop()]){
 const c=JSON.parse(JSON.stringify(catalog));mutate(c);assert.ok(validate(c).length>0,'invalid catalog accepted');
}
const root=path.resolve(__dirname,'../../..'),sources=['work/match-next/contacts/catalog.json','work/match-next/contacts/oracle.cjs','work/match-next/contacts/validate.cjs','work/match-next/contacts/test.cjs','dist/pitch-scene-v98.js','dist/world-pitch3d-v98.js','dist/pitch-v55.js','dist/world-space-passes-v150.js'];
const hashes=Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
const report={schemaVersion:'d6-probe-1',scope:'analytical Welle0 oracle and schema only; no native/Unity runtime validation',generatedAt:new Date().toISOString(),passed:true,fixtureCount:catalog.length,familyCount:new Set(catalog.map(s=>s.provenance.family)).size,configurations:8,extraChecks:['continuous-fast-contact','time-step-subdivision','tie-order-stability','height-reach','outside-box-denial','five-invalid-catalog-mutations'],hashes,results};
const out=path.join(root,'outputs/platform/contacts');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'wave0-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:true,fixtures:catalog.length,families:report.familyCount,report:path.join(out,'wave0-report.json')}));
