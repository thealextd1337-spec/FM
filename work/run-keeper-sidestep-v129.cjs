const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const baseline=process.argv.includes('--baseline'),file=path.resolve('work/check-keeper-sidestep-v124.cjs');
let source=fs.readFileSync(file,'utf8').replaceAll('v124',baseline?'baseline-v129':'v129');
const needle='const hip=new T.Vector3().setFromMatrixPosition';
if(!source.includes(needle))throw Error('Sidestep fixture changed');
source=source.replace(needle,`const hands=['Left','Right'].map(side=>{const bone=v.meshy.skeleton.bones.find(b=>b.name.endsWith(side+'Hand')),q=new T.Quaternion(),scale=new T.Vector3(),point=new T.Vector3();bone.matrixWorld.decompose(point,q,scale);const palm=new T.Vector3(side==='Left'?1:-1,0,0).applyQuaternion(q),forward=new T.Vector3(Math.sin(v.heading),0,Math.cos(v.heading));return {point:point.toArray(),palmForward:palm.dot(forward)};}),handGap=new T.Vector3().fromArray(hands[0].point).distanceTo(new T.Vector3().fromArray(hands[1].point));const hip=new T.Vector3().setFromMatrixPosition`);
source=source.replace('skin:min,hip:','skin:min,hands,handGap,hip:');
source=source.replace('assert(report.guards.every(g=>g.side<.001));',`assert(report.guards.every(g=>g.side<.001));
if(!${baseline})for(const row of report.rows){
 const settled=row.samples.slice(row.fps/2,row.fps*2);assert(settled.every(s=>s.handGap>.45&&s.handGap<.8));assert(settled.every(s=>s.hands.every(h=>h.palmForward>.2)));
 const maxWristStep=r=>Math.max(...r.samples.slice(1).flatMap((s,n)=>s.hands.map((h,k)=>Math.hypot(...h.point.map((x,i)=>x-s.hip[i]-r.samples[n].hands[k].point[i]+r.samples[n].hip[i])))));
 const prior=JSON.parse(fs.readFileSync('docs/spieler-nutzer-rig/keeper-sidestep-qa-baseline-v129.json','utf8')).rows.find(r=>r.fps===row.fps&&r.pace===row.pace&&r.heading===row.heading&&r.sign===row.sign);
 assert(maxWristStep(row)<7/row.fps,'Bounded wrist transition per second');assert(maxWristStep(row)<=maxWristStep(prior),'No increase in wrist movement peaks');assert.equal(row.maxStep,prior.maxStep);assert.equal(row.maxPlantSlip,prior.maxPlantSlip);
}
`);
source=source.replace('guards:report.guards},null,2)',"guards:report.guards,handGaps:report.rows.map(r=>({fps:r.fps,pace:r.pace,min:Math.min(...r.samples.slice(r.fps/2,r.fps*2).map(s=>s.handGap)),max:Math.max(...r.samples.slice(r.fps/2,r.fps*2).map(s=>s.handGap))}))},null,2)");
const task=new Module(file,module);task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));task._compile(source,file);
