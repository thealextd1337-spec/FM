'use strict';
// SI-6 / P02: the 1,700 archived fixtures of the v178 matrix, played natively with marker 183.
// Same fixture identifiers and five start worlds as work/validate-compact-balance-v178.cjs (frozen pattern);
// every game uses a fresh full world copy. No target score or win quota is forced; the checks are the product
// corridors (10-16 shots per game, quality gradient) plus the comparison with the matrix of marker 178.
// Output: outputs/compact-balance-v183/final-matrix.json and einzelspiele.csv.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const {suite,summary,sha}=require('./compact-balance-harness-v178.cjs'),h=suite(),a=JSON.parse(fs.readFileSync('outputs/strength-followup/results.json')),b=JSON.parse(fs.readFileSync('outputs/top-bottom-matches/results.json')),previous178=JSON.parse(fs.readFileSync('outputs/compact-balance-v178/final-matrix.json'));
const hashes=Object.fromEntries(fs.readdirSync('dist').filter(f=>f.endsWith('.js')).map(f=>[f,sha(fs.readFileSync('dist/'+f))]));
const modes=['top-top','bottom-bottom','top-bottom','league-cup','overlap','home-mirror','home-neutral-control'],rows=[];
for(let round=1;round<=5;round++){
 const fixtures=[...a.matches.filter(m=>m.round===round),...b.matches.filter(m=>m.round===round).map(m=>({...m,suite:'top-bottom',aId:m.topId,bId:m.bottomId,aHome:m.homeId===m.topId,aGoals:m.topGoals,bGoals:m.bottomGoals,aShots:m.topShots,bShots:m.bottomShots}))],seed=fixtures[0].seed,c=h.call('v167CreateCareer','AUT-5',seed,'Startkaderanalyse'),snapshot=JSON.stringify(c),initial=sha(snapshot),day=Math.min(...c.world.competitions.filter(c=>c.type==='league').flatMap(c=>c.fixtures.map(f=>f.day)));
 assert(h.call('v61ValidateCareer',c));h.call('v177CheckInitialRosters',c);
 for(const d of fixtures){
  const r=h.play(snapshot,d,undefined,{day}),aa=d.aHome?r.home:r.away,bb=d.aHome?r.away:r.home;
  assert.equal(r.state.playerPerformance.shotBalanceRevision,183);assert.deepEqual(r.state.playerPerformance.compactBalance,h.call('v183CompactSnapshot',r.career));
  assert.equal(r.state.playerPerformance.compactBalance.fieldSize,'standard','start worlds without match configuration play on the standard pitch');
  rows.push({series:d.suite,round,seed,fixtureId:d.fixtureId||d.id,homeId:d.homeId,awayId:d.awayId,aId:d.aId,bId:d.bId,aHome:d.aHome,neutral:d.neutral||false,a:aa,b:bb,eventHash:r.eventHash,teamStats:r.state.compactStats});
 }
 assert.equal(sha(JSON.stringify(c)),initial);console.log('PASS final matrix '+round+'/5: '+rows.length+'/1700 games');
}
assert.equal(rows.length,1700);
const series=Object.fromEntries(modes.map(s=>[s,{before:previous178.series[s].after,after:summary(rows.filter(r=>r.series===s))}]));
for(const [name,s]of Object.entries(series)){assert(s.after.shotsPerGame>=10&&s.after.shotsPerGame<=16,name+' shot target');assert(s.after.goalsPerGame>=2.5&&s.after.goalsPerGame<=6,name+' goal band of the played-out reference');}
assert(series['top-bottom'].after.aWins>series['top-bottom'].after.bWins);assert(series['top-bottom'].after.aGoals>series['top-bottom'].after.bGoals);
for(const [f,hash]of Object.entries(hashes))assert.equal(sha(fs.readFileSync('dist/'+f)),hash,'dist unchanged during the run: '+f);
const combined=summary(rows),previous=previous178.combined,sum=(k,i)=>rows.reduce((n,r)=>n+r.teamStats[k][i],0),teamStats=Object.fromEntries(['shots','onTarget','corners','crosses','fouls','freeKicks'].map(k=>[k,(sum(k,0)+sum(k,1))/rows.length]));
const out={passed:true,games:1700,marker:183,sourceHashes:hashes,series,combined,previous,teamStatsPerGame:teamStats,design:'Same 1700 archived fixture IDs and five start seeds as the v178 matrix, played with marker 183 (compact simulation follows the played-out match). Every game uses a fresh full world copy. The v178 matrix is the comparison, not a target. No score or win quota forced.'};
fs.mkdirSync('outputs/compact-balance-v183',{recursive:true});fs.writeFileSync('outputs/compact-balance-v183/final-matrix.json',JSON.stringify({...out,rows:rows.map(({teamStats,...r})=>r)},null,2));
const quote=s=>'"'+String(s).replace(/"/g,'""')+'"',csv=[['Serie','Lauf','Startwelt','Heimverein-ID','Gastverein-ID','A-Verein-ID','B-Verein-ID','A-Tore','B-Tore','A-Schüsse','B-Schüsse','Neutral'],...rows.map(r=>[r.series,r.round,r.seed,r.homeId,r.awayId,r.aId,r.bId,r.a.goals,r.b.goals,r.a.shots,r.b.shots,r.neutral])];fs.writeFileSync('outputs/compact-balance-v183/einzelspiele.csv','﻿'+csv.map(row=>row.map(quote).join(';')).join('\r\n')+'\r\n');
console.log(JSON.stringify({passed:true,combined,previous:{goalsPerGame:previous.goalsPerGame,shotsPerGame:previous.shotsPerGame,zeroZero:previous.zeroZero,games:previous.games},teamStats,series:Object.fromEntries(Object.entries(series).map(([k,v])=>[k,{shots:v.after.shotsPerGame,goals:v.after.goalsPerGame,zeroZero:v.after.zeroZero,aWins:v.after.aWins,draws:v.after.draws,bWins:v.after.bWins,before:{shots:v.before.shotsPerGame,goals:v.before.goalsPerGame}}]))}));
