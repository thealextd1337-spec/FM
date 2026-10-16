'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const {suite,summary,sha}=require('./compact-balance-harness-v178.cjs'),h=suite(),a=JSON.parse(fs.readFileSync('outputs/strength-followup/results.json')),b=JSON.parse(fs.readFileSync('outputs/top-bottom-matches/results.json'));
const hashes=Object.fromEntries(Object.keys(a.sourceHashes).map(f=>[f,sha(fs.readFileSync('dist/'+f))]));assert.deepEqual(Object.keys(hashes).filter(f=>hashes[f]!==a.sourceHashes[f]),['world-player-performance-v155.js']);
const modes=['top-top','bottom-bottom','top-bottom','league-cup','overlap','home-mirror','home-neutral-control'],rows=[],baselines=[];
for(let round=1;round<=5;round++){
 const fixtures=[...a.matches.filter(m=>m.round===round),...b.matches.filter(m=>m.round===round).map(m=>({...m,suite:'top-bottom',aId:m.topId,bId:m.bottomId,aHome:m.homeId===m.topId,aGoals:m.topGoals,bGoals:m.bottomGoals,aShots:m.topShots,bShots:m.bottomShots}))],seed=fixtures[0].seed,c=h.call('v167CreateCareer','AUT-5',seed,'Startkaderanalyse'),snapshot=JSON.stringify(c),initial=sha(snapshot),day=Math.min(...c.world.competitions.filter(c=>c.type==='league').flatMap(c=>c.fixtures.map(f=>f.day)));
 assert(h.call('v61ValidateCareer',c));h.call('v177CheckInitialRosters',c);
 for(const d of fixtures){
  const r=h.play(snapshot,d,undefined,{day,revision:178}),aa=d.aHome?r.home:r.away,bb=d.aHome?r.away:r.home;
  assert.equal(r.state.playerPerformance.shotBalanceRevision,178);assert.deepEqual(r.state.playerPerformance.compactBalance,h.evaluate('({...v178CompactBalance})'));
  rows.push({series:d.suite,round,seed,fixtureId:d.fixtureId||d.id,homeId:d.homeId,awayId:d.awayId,aId:d.aId,bId:d.bId,aHome:d.aHome,neutral:d.neutral||false,a:aa,b:bb,eventHash:r.eventHash});
  baselines.push({series:d.suite,round,a:{goals:d.aGoals,shots:d.aShots,onTarget:d.aOnTarget||0},b:{goals:d.bGoals,shots:d.bShots,onTarget:d.bOnTarget||0}});
 }
 assert.equal(sha(JSON.stringify(c)),initial);console.log('PASS final matrix '+round+'/5: '+rows.length+'/1700 games');
}
assert.equal(rows.length,1700);
const series=Object.fromEntries(modes.map(s=>[s,{before:summary(baselines.filter(r=>r.series===s)),after:summary(rows.filter(r=>r.series===s))}]));
for(const [name,s]of Object.entries(series)){assert(s.after.shotsPerGame>=10&&s.after.shotsPerGame<=16,name+' shot target');}
assert(series['top-bottom'].after.aWins>series['top-bottom'].after.bWins);assert(series['top-bottom'].after.aGoals>series['top-bottom'].after.bGoals);
for(const [f,hash]of Object.entries(hashes))assert.equal(sha(fs.readFileSync('dist/'+f)),hash);
const combined=summary(rows),previous=summary(baselines),out={passed:true,games:1700,balance:h.evaluate('({...v178CompactBalance})'),sourceHashes:hashes,series,combined,previous,design:'Same 1700 archived fixture IDs and five start seeds: original Top/Bottom 500 plus Fable follow-up1200, including100 neutral controls. Every game uses a fresh full world copy. Cached baseline represents exact previously measured native results; no claim of independent controls. No target win/goal quota forced.',rows};
// The original Top/Bottom report did not collect on-target counts.
out.series['top-bottom'].before.aOnTarget=null;out.series['top-bottom'].before.bOnTarget=null;
out.previous.aOnTarget=null;out.previous.bOnTarget=null;
fs.writeFileSync('outputs/compact-balance-v178/final-matrix.json',JSON.stringify(out,null,2));
const quote=s=>'"'+String(s).replace(/"/g,'""')+'"',csv=[['Serie','Lauf','Startwelt','Heimverein-ID','Gastverein-ID','A-Verein-ID','B-Verein-ID','A-Tore','B-Tore','A-Schüsse','B-Schüsse','Neutral'],...rows.map(r=>[r.series,r.round,r.seed,r.homeId,r.awayId,r.aId,r.bId,r.a.goals,r.b.goals,r.a.shots,r.b.shots,r.neutral])];fs.writeFileSync('outputs/compact-balance-v178/einzelspiele.csv','\ufeff'+csv.map(row=>row.map(quote).join(';')).join('\r\n')+'\r\n');
console.log(JSON.stringify({passed:true,balance:out.balance,combined,previous,series}));
