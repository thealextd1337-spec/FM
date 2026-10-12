'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const {suite,summary,sha}=require('./compact-balance-harness-v178.cjs'),h=suite();
const old=JSON.parse(fs.readFileSync('outputs/strength-followup/results.json')),top=JSON.parse(fs.readFileSync('outputs/top-bottom-matches/results.json'));
const sourceHashes=Object.fromEntries(Object.keys(old.sourceHashes).map(f=>[f,sha(fs.readFileSync('dist/'+f))]));
assert.deepEqual(Object.keys(sourceHashes).filter(f=>sourceHashes[f]!==old.sourceHashes[f]),['world-player-performance-v155.js']);
const modes={legacy:null,base30:{goalBase:.30,goalCeiling:.48,homeShotFactor:1},base32:{goalBase:.32,goalCeiling:.48,homeShotFactor:1},ceiling52:{goalBase:.27,goalCeiling:.52,homeShotFactor:1}};
const results=Object.fromEntries(Object.keys(modes).map(id=>[id,[]])),shots=[],series=['top-top','bottom-bottom','top-bottom','league-cup','overlap'];
for(let round=1;round<=5;round++){
 const seed=old.rounds[round-1].seed,career=h.call('v167CreateCareer','AUT-5',seed,'Startkaderanalyse'),snapshot=JSON.stringify(career),startHash=sha(snapshot),day=Math.min(...career.world.competitions.filter(c=>c.type==='league').flatMap(c=>c.fixtures.map(f=>f.day)));
 const chosen=series.flatMap(s=>{
  const list=s==='top-bottom'?top.matches.filter(m=>m.round===round).map(m=>({...m,suite:s,aId:m.topId,bId:m.bottomId,aHome:m.homeId===m.topId})):old.matches.filter(m=>m.round===round&&m.suite===s);
  if(s==='top-top'||s==='bottom-bottom')return list;
  return Array.from({length:20},(_,i)=>list[((round-1)*20+i)%list.length]);
 });assert.equal(chosen.length,100);
 for(const d of chosen)for(const [id,parameters]of Object.entries(modes)){
  const r=h.play(snapshot,d,parameters,{day,observe:id==='legacy'}),a=d.aHome?r.home:r.away,b=d.aHome?r.away:r.home;
  if(id==='legacy'){
   assert.equal(a.goals,d.aGoals??d.topGoals);assert.equal(b.goals,d.bGoals??d.bottomGoals);
   if(d.nativeHash)assert.equal(r.nativeHash,d.nativeHash,'Legacy trajectory exactly matches previous source');else assert.equal(r.eventHash,d.eventHash);
   shots.push(...r.shotSamples.map(s=>({...s,suite:d.suite,round})));
  }
  results[id].push({series:d.suite,round,seed,fixtureId:d.fixtureId||d.id,aId:d.aId,bId:d.bId,a,b,eventHash:r.eventHash});
 }
 assert.equal(sha(JSON.stringify(career)),startHash);
 console.log('PASS screening round '+round+'/5: '+JSON.stringify(Object.fromEntries(Object.entries(results).map(([id,rows])=>[id,summary(rows.filter(r=>r.round===round))]))));
}
const summaries=Object.fromEntries(Object.entries(results).map(([id,rows])=>[id,Object.fromEntries(series.map(s=>[s,summary(rows.filter(r=>r.series===s))]))]));
for(const [id,rows]of Object.entries(results)){assert.equal(rows.length,500);for(const s of series)assert.equal(summaries[id][s].games,100);}
for(const [f,hash]of Object.entries(sourceHashes))assert.equal(sha(fs.readFileSync('dist/'+f)),hash);
const histogram=(key,bounds)=>bounds.map((lower,i)=>({min:lower,max:bounds[i+1]??null,count:shots.filter(s=>s[key]>=lower&&(i===bounds.length-1||s[key]<bounds[i+1])).length}));
const diagnostics={games:500,shots:shots.length,difficulty:histogram('difficulty',[0,.2,.4,.6,.8,1]),distanceMetres:histogram('distanceMetres',[0,10,20,30,40,50,60,70]),pressure:histogram('pressure',[0,.2,.4,.6,.8,1]),roleCounts:Object.fromEntries(['def','mid','att'].map(role=>[role,shots.filter(s=>s.role===role).length])),difficultyAtCeiling:shots.filter(s=>s.difficulty===1).length};
const report={sourceHashes,modes,design:'500-fixture screening matrix, 100 per comparison group, twenty per original start seed. Same seed and fixture IDs for every variant. Legacy119 exactly reproduces archived scores and recorded trajectory/event hashes. Observational shot wrapper reads positions without extra random draws or product events.',summaries,diagnostics,results};
fs.writeFileSync('outputs/compact-balance-v178/screening.json',JSON.stringify(report,null,2));fs.writeFileSync('outputs/compact-balance-v178/shot-quality.json',JSON.stringify({diagnostics,shots},null,2));
console.log(JSON.stringify({passed:true,games:2000,summaries,diagnostics}));
