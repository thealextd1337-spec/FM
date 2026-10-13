'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/youth-comparison-20years-20261011');process.chdir(path.join(root,'outputs/youth-20years-20261011/source'));
const api=require(path.join(root,'work/youth-audit-native-harness.cjs')).harness();api.run('world-expansion-stories-v170.js');const {call,evaluate}=api,career=call('v167CreateCareer','AUT-5','position-control','Kontrolle');globalThis.v61CurrentCareer=career;globalThis.auditComparisonVariant='status';globalThis.auditStatusRows=[];
evaluate(fs.readFileSync(path.join(root,'work/youth-comparison-hooks-20261011.js'),'utf8'));call('auditInitYouthStatus',career);career.world.season=2;
const club=career.world.clubs.find(c=>c.id==='ENG-2'),rows=[];
for(const budget of [0,500,1000,1500]){
 const positions={gk:0,def:0,mid:0,att:0};
 for(let season=2;season<=61;season++){
  const count=call('auditCandidateCount',budget,call('v61Random',`${career.world.seed}:${club.id}:youth-count:S${season}`)());
  for(let slot=0;slot<count;slot++){const p=call('v67Youth',career,club,season,slot);positions[p.line]++;}
 }
 rows.push({budget,seasons:60,positions});
}
assert.equal(rows[0].positions.att,0);assert(rows.slice(1).every(r=>r.positions.att===60));assert(rows.every(r=>r.positions.gk===20));
fs.writeFileSync(path.join(out,'position-controls.json'),JSON.stringify({pass:true,method:'60 independent generated academy cohorts per fixed smoothed budget; no extra played native career',rows,finding:'Inherited slot sequence makes permanent0 generate no attackers; 500/1000/1500 each generate one attacker/year and one goalkeeper every third year. Additional1500 slot is always a defender.'},null,2));console.log(JSON.stringify({pass:true,rows}));
