'use strict';
// Evaluation of work/measure-sponsor-goals-v183.cjs: hit rate of the old sponsor goal ("mindestens N Tore" = ceil((11+squad)*1.4) in the
// league, 4 in the cup) in the world of release 132 and the goal count that reaches the same hit rate in a new world.
// Usage: node work/table-sponsor-goals-v183.cjs [dir=outputs/sponsor-goals-v183]
const fs=require('node:fs'),path=require('node:path');
const dir=process.argv[2]||'outputs/sponsor-goals-v183';
const load=world=>fs.readdirSync(dir).filter(f=>f.startsWith(`goals-${world}-`)&&f.endsWith('.json')).flatMap(f=>{const r=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));return r.seasons.flatMap(s=>s.rows.map(row=>({...row,size:r.size,seed:r.seed,season:s.season,file:f})));});
const old=load('old'),fresh=load('new');
const rate=(rows,t)=>rows.length?rows.filter(r=>r.goals>=t).length/rows.length:NaN;
const mean=a=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length),quant=(a,q)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(q*s.length))];};
console.log('rows old/new',old.length,fresh.length);
for(const kind of ['league','cup']){
 const o=old.filter(r=>r.league===(kind==='league')),n=fresh.filter(r=>r.league===(kind==='league'));
 console.log(`\n== ${kind}: matches per club old ${mean(o.map(r=>r.matches)).toFixed(1)} new ${mean(n.map(r=>r.matches)).toFixed(1)}; goals old ${mean(o.map(r=>r.goals)).toFixed(2)} new ${mean(n.map(r=>r.goals)).toFixed(2)}`);
 const squads=[...new Set(o.map(r=>r.squad))].sort((a,b)=>a-b);
 for(const sq of squads){
  const os=o.filter(r=>r.squad===sq),ns=n.filter(r=>r.squad===sq),target=Math.round(mean(os.map(r=>r.target)));
  const p=rate(os,target);
  let best=null;for(let t=0;t<=120;t++){const d=Math.abs(rate(ns,t)-p);if(best===null||d<best.d)best={t,d,r:rate(ns,t)};}
  console.log(`squad ${sq}: n old ${os.length} new ${ns.length} | old goals mean ${mean(os.map(r=>r.goals)).toFixed(1)} median ${quant(os.map(r=>r.goals),.5)} target ${target} hit ${(100*p).toFixed(1)}% | new goals mean ${mean(ns.map(r=>r.goals)).toFixed(1)} median ${quant(ns.map(r=>r.goals),.5)} p25 ${quant(ns.map(r=>r.goals),.25)} p75 ${quant(ns.map(r=>r.goals),.75)} | equal-hit target ${best.t} (hit ${(100*best.r).toFixed(1)}%)`);
 }
 const all=o,target=r=>r.target;const pAll=all.filter(r=>r.goals>=r.target).length/all.length;
 console.log(`overall old hit ${(100*pAll).toFixed(1)}%`);
}
