'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const {suite,summary,sha}=require('./compact-balance-harness-v178.cjs'),h=suite(),prior=JSON.parse(fs.readFileSync('outputs/top-bottom-matches/results.json'));
const hashes=Object.fromEntries(Object.keys(prior.sourceHashes).map(f=>[f,sha(fs.readFileSync('dist/'+f))]));
assert.deepEqual(Object.keys(hashes).filter(f=>hashes[f]!==prior.sourceHashes[f]),['world-player-performance-v155.js']);
const modes={neutral:1,home02:1.02,home03:1.03},rows=[];
for(let round=1;round<=5;round++){
 const fixtures=prior.matches.filter(m=>m.round===round),seed=fixtures[0].seed,c=h.call('v167CreateCareer','AUT-5',seed,'Startkaderanalyse'),snapshot=JSON.stringify(c),initial=sha(snapshot),day=Math.min(...c.world.competitions.filter(c=>c.type==='league').flatMap(c=>c.fixtures.map(f=>f.day)));
 for(const d of fixtures){
  const each={};
  for(const [mode,homeShotFactor]of Object.entries(modes)){
   const r=h.play(snapshot,d,{goalBase:.27,goalCeiling:.48,homeShotFactor},{day,neutral:mode==='neutral'}),aHome=d.homeId===d.topId;
   each[mode]={home:r.home,away:r.away,a:aHome?r.home:r.away,b:aHome?r.away:r.home,eventHash:r.eventHash};
  }
  rows.push({round,seed,fixtureId:d.id,homeId:d.homeId,awayId:d.awayId,...each});
 }
 assert.equal(sha(JSON.stringify(c)),initial);
 console.log('PASS home pairs '+(round*100)+'/500: '+JSON.stringify(Object.fromEntries(Object.keys(modes).map(mode=>[mode,summary(rows.filter(r=>r.round===round).map(r=>r[mode]))]))));
}
assert.equal(rows.length,500);
const sum=(mode,side,key)=>rows.reduce((n,r)=>n+r[mode][side][key],0),out=Object.fromEntries(Object.keys(modes).map(mode=>[mode,{...summary(rows.map(r=>r[mode])),homeGoals:sum(mode,'home','goals'),awayGoals:sum(mode,'away','goals'),homeShots:sum(mode,'home','shots'),awayShots:sum(mode,'away','shots'),homeWins:rows.filter(r=>r[mode].home.goals>r[mode].away.goals).length,awayWins:rows.filter(r=>r[mode].home.goals<r[mode].away.goals).length,changedEvents:rows.filter(r=>r[mode].eventHash!==r.neutral.eventHash).length,changedScore:rows.filter(r=>r[mode].home.goals!==r.neutral.home.goals||r[mode].away.goals!==r.neutral.away.goals).length}]));
for(const [f,hash]of Object.entries(hashes))assert.equal(sha(fs.readFileSync('dist/'+f)),hash);
fs.writeFileSync('outputs/compact-balance-v178/home-screening.json',JSON.stringify({sourceHashes:hashes,design:'500 paired mixed-strength fixtures from the same five original seeds, balanced home assignment. Same roster, fixture ID and RNG per case. One shared neutral baseline (goal .27, cap .48) and two isolated home factors .02/.03 relative. Neutral shot chance is independent of the stored home factor; no separate independent-control count claimed.',pairs:500,games:1500,modes,out,rows},null,2));
console.log(JSON.stringify({passed:true,pairs:500,games:1500,out}));
