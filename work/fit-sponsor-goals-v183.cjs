'use strict';
// Fit and check of the new sponsor goal table (docs/spielerintelligenz-neue-spielstaende-183.md): per squad class the hit rate of every
// candidate count of league goals in a new world (marker 183), per seed and pitch size, and the hit rate of the table in dist.
// Usage: node work/fit-sponsor-goals-v183.cjs [--seeds=sp-a,sp-b] [--table=10,14,19,31,44] [--dir=outputs/sponsor-goals-v183]
const fs=require('node:fs'),path=require('node:path');
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const dir=arg('dir','outputs/sponsor-goals-v183'),seeds=arg('seeds','sp-a').split(','),table=(arg('table','')||'').split(',').filter(Boolean).map(Number);
const rows=fs.readdirSync(dir).filter(f=>f.startsWith('goals-new-')&&f.endsWith('.json')).flatMap(f=>{const r=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));return seeds.includes(r.seed)?r.seasons.flatMap(s=>s.rows.filter(x=>x.league).map(x=>({...x,size:r.size,seed:r.seed,season:s.season}))):[];});
console.log('league rows',rows.length,'seeds',seeds.join(','));
const rate=(list,t)=>list.filter(r=>r.goals>=t).length/Math.max(1,list.length);
const pct=(list,q)=>{const s=list.map(r=>r.goals).sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(q*s.length))];};
for(let sq=1;sq<=5;sq++){
 const list=rows.filter(r=>r.squad===sq);
 const curve=[];for(let t=Math.max(1,pct(list,.1));t<=pct(list,.9);t++)curve.push(`${t}:${(100*rate(list,t)).toFixed(0)}`);
 console.log(`squad ${sq} n=${list.length} 45th percentile ${pct(list,.45)} median ${pct(list,.5)} | hit by target: ${curve.join(' ')}`);
 if(table[sq-1]!==undefined){
  const t=table[sq-1];
  console.log(`   table ${t}: hit ${(100*rate(list,t)).toFixed(1)}%`+['standard','large'].map(s=>` ${s} ${(100*rate(list.filter(r=>r.size===s),t)).toFixed(1)}%`).join('')+seeds.map(s=>` ${s} ${(100*rate(list.filter(r=>r.seed===s),t)).toFixed(1)}%`).join('')+[1,2,3].map(s=>` S${s} ${(100*rate(list.filter(r=>r.season===s),t)).toFixed(1)}%`).join(''));
 }
}
if(table.length===5){
 const all=rows.filter(r=>table[r.squad-1]!==undefined);console.log(`all classes: ${(100*all.filter(r=>r.goals>=table[r.squad-1]).length/all.length).toFixed(1)}% of ${all.length} club seasons reach the table target`);
 // mid-table clubs: rank 3-6 of 8 by goals within league (proxy via goals rank within country is not stored: use squad 3 as the mid class)
}
