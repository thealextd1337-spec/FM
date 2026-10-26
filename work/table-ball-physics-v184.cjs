'use strict';
// Ball physics 184: series comparison of measure-si183 / measure-si-calibration-v183
// result files (outputs/si183/<label>.json). Pools the labels of a run, prints
// goals, shots, on target, real minutes, draws, favourite wins (gap >= 1 and
// gap >= 3 strength points) per pitch and pooled, each with the standard error,
// and the woodwork share of shots and of goals (ledger kind 'woodwork', goals
// whose parent chain reaches a woodwork event within four steps).
// Usage: node work/table-ball-physics-v184.cjs <label[,label...]> [<baseLabel[,label...]>] [--json]
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),outDir=path.join(root,'outputs/si183');
const args=process.argv.slice(2),runs=args.filter(a=>!a.startsWith('--')),json=args.includes('--json');
if(!runs.length){console.error('Usage: node work/table-ball-physics-v184.cjs <label[,label]> [<baseLabel[,label]>] [--json]');process.exit(2);}
const load=run=>{const matches=[];let failures=0,unusable=0;for(const label of run.split(',')){const rep=JSON.parse(fs.readFileSync(path.join(outDir,label+'.json'),'utf8'));failures+=rep.failures.length;for(const r of rep.matches){if(!r.finished||r.engineError||r.stall){unusable++;continue;}matches.push(r);}}return {labels:run,matches,failures,unusable};};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN,se=a=>{const m=mean(a);return a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length):NaN;};
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k],goals=r=>r.score[0]+r.score[1];
const fav=(rows,gap)=>{const g=rows.filter(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr)>=gap);const win=g.map(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return r.score[s]>r.score[1-s]?1:0;});return {n:g.length,pct:100*mean(win),se:100*se(win)};};
const pct=(x,n)=>n?100*x/n:NaN;
function summary(rows){
 const shots=rows.map(r=>total(r,'shots')),wood=rows.map(r=>(r.extras?.woodwork||[]).length),woodGoals=rows.map(r=>r.extras?.woodworkGoals||0),frames={post:0,bar:0};
 for(const r of rows)for(const f of r.extras?.woodwork||[])frames[f]=(frames[f]||0)+1;
 const S=shots.reduce((a,b)=>a+b,0),G=rows.map(goals).reduce((a,b)=>a+b,0),W=wood.reduce((a,b)=>a+b,0),WG=woodGoals.reduce((a,b)=>a+b,0);
 return {n:rows.length,
  goals:{mean:mean(rows.map(goals)),se:se(rows.map(goals))},shots:{mean:mean(shots),se:se(shots)},onTarget:{mean:mean(rows.map(r=>total(r,'onTarget'))),se:se(rows.map(r=>total(r,'onTarget')))},
  minutes:{mean:mean(rows.map(r=>r.realSeconds/60)),se:se(rows.map(r=>r.realSeconds/60))},
  draws:{pct:100*mean(rows.map(r=>r.score[0]===r.score[1]?1:0)),se:100*se(rows.map(r=>r.score[0]===r.score[1]?1:0))},
  fav1:fav(rows,1),fav3:fav(rows,3),
  woodwork:{perMatch:mean(wood),count:W,shots:S,pctOfShots:pct(W,S),goals:G,goalsAfter:WG,pctOfGoals:pct(WG,G),frames}};
}
const f=(x,d=2)=>Number.isFinite(x)?x.toFixed(d):'–',pm=(v,d=2)=>`${f(v.mean,d)} ± ${f(v.se,d)}`;
function report(run){const out={labels:run.labels,failures:run.failures,unusable:run.unusable,all:summary(run.matches)};for(const size of ['standard','large'])out[size]=summary(run.matches.filter(r=>r.size===size));return out;}
const A=report(load(runs[0])),B=runs[1]?report(load(runs[1])):null;
if(json){console.log(JSON.stringify({run:A,base:B},null,1));process.exit(0);}
const rows=[['Partien','n',s=>String(s.n)],['Tore je Partie','goals',s=>pm(s.goals)],['Schüsse je Partie','shots',s=>pm(s.shots)],['Aufs Tor je Partie','onTarget',s=>pm(s.onTarget)],['Reale Minuten','minutes',s=>pm(s.minutes)],['Remis %','draws',s=>`${f(s.draws.pct,1)} ± ${f(s.draws.se,1)}`],['Favorit gewinnt % (Abstand ≥ 1)','fav1',s=>`${f(s.fav1.pct,1)} ± ${f(s.fav1.se,1)} (n ${s.fav1.n})`],['Favorit gewinnt % (Abstand ≥ 3)','fav3',s=>`${f(s.fav3.pct,1)} ± ${f(s.fav3.se,1)} (n ${s.fav3.n})`],['Aluminium je Partie','woodwork',s=>f(s.woodwork.perMatch,3)],['Aluminium % der Schüsse','woodwork',s=>`${f(s.woodwork.pctOfShots,2)} (${s.woodwork.count}/${s.woodwork.shots}, Pfosten ${s.woodwork.frames.post||0}, Latte ${s.woodwork.frames.bar||0})`],['Tore nach Aluminium % der Tore','woodwork',s=>`${f(s.woodwork.pctOfGoals,2)} (${s.woodwork.goalsAfter}/${s.woodwork.goals})`]];
for(const size of ['all','standard','large']){
 console.log(`\n### ${size==='all'?'beide Felder':size==='standard'?'Standardfeld':'großes Feld'}\n`);
 console.log(B?`| Kennzahl | ${A.labels} | ${B.labels} |\n| --- | ---: | ---: |`:`| Kennzahl | ${A.labels} |\n| --- | ---: |`);
 for(const [name,,fn] of rows)console.log(B?`| ${name} | ${fn(A[size])} | ${fn(B[size])} |`:`| ${name} | ${fn(A[size])} |`);
}
console.log(`\nAusfälle: ${A.failures} / unbrauchbar ${A.unusable}${B?`; Basis: ${B.failures} / ${B.unusable}`:''}`);
