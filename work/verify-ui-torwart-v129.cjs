const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n'),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const output='outputs/Doppel-6-Fussballmanager.html',html=read(output);
const sources=['world-physical-v65.js','world-competition-v62.js','world-match-ui-v64.js','world-career-plan-v64.js','world-start-v61.css','pitch-motion-v102.js','player-user-ball-actions-v111.js'];
for(const file of sources){
 let source=read('dist/'+file);
 for(const asset of [...new Set(source.match(/(?:referees|trophies|sprites|crests)\/[a-z0-9-]+\.png/g)||[])])source=source.replaceAll(asset,'data:image/png;base64,'+fs.readFileSync('dist/'+asset).toString('base64'));
 assert(html.includes(source),'Current source included: '+file);
}
assert.equal(hash(output),hash('outputs/index.html'));assert(read('dist/index.html').includes('PROTOTYP 106'));assert(html.includes('PROTOTYP 106'));
const ranks=JSON.parse(read('outputs/rank-labels-qa-v129.json')),plan=JSON.parse(read('outputs/plan-preview-qa-v129.json')),keeper=JSON.parse(read('docs/spieler-nutzer-rig/keeper-sidestep-qa-v129.json')),baseline=JSON.parse(read('docs/spieler-nutzer-rig/keeper-sidestep-qa-baseline-v129.json')),ball=JSON.parse(read('docs/spieler-nutzer-rig/ball-actions-qa-v129.json'));
assert.equal(ranks.rows.length,2);assert.equal(plan.rows.length,4);assert.equal(keeper.rows.length,24);assert.equal(ball.cases.length,10);
for(const report of [ranks,plan,keeper,baseline,ball])assert.deepEqual(report.errors,[]);
assert(keeper.unchanged&&ball.unchanged);assert(keeper.rows.every(r=>r.paused));
const maxWrist=r=>Math.max(...r.samples.slice(1).flatMap((s,n)=>s.hands.map((h,k)=>Math.hypot(...h.point.map((x,i)=>x-s.hip[i]-r.samples[n].hands[k].point[i]+r.samples[n].hip[i])))));
const comparisons=keeper.rows.map((r,i)=>{
 const prior=baseline.rows[i];assert.equal(r.maxStep,prior.maxStep);assert.equal(r.maxPlantSlip,prior.maxPlantSlip);assert(maxWrist(r)<=maxWrist(prior)&&maxWrist(r)<7/r.fps);
 const frames=r.samples.slice(r.fps/2,r.fps*2),gaps=frames.map(s=>s.handGap);assert(gaps.every(g=>g>.45&&g<.8));assert(frames.every(s=>s.hands.every(h=>h.palmForward>.2)));
 return {fps:r.fps,pace:r.pace,heading:r.heading,sign:r.sign,baselineHandGap:prior.samples[r.fps].handGap,minHandGap:Math.min(...gaps),maxHandGap:Math.max(...gaps),baselineMaxWristStep:maxWrist(prior),maxWristStep:maxWrist(r)};
});
const report={version:129,published:false,publishedFooter:106,buildSHA256:hash(output),sources:Object.fromEntries(sources.map(f=>[f,hash('dist/'+f)])),rankScreens:ranks.rows.length,layoutScreens:plan.rows.length,keeperSequences:keeper.rows.length,ballActionCases:ball.cases.length,newMeshyCredits:0,comparisons};
fs.writeFileSync('outputs/ui-torwart-verification-v129.json',JSON.stringify(report,null,2)+'\n');
for(const [,target] of read('docs/ui-torwart-v129.md').matchAll(/\]\(([^)]+)\)/g))if(!target.startsWith('http'))assert(fs.existsSync(path.resolve('docs',target)),target);
console.log(JSON.stringify({...report,comparisons:undefined},null,2));
