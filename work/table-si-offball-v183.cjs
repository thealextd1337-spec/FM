'use strict';
// Paired SI-2 evaluation of two measure-si-offball-v183 result files
// (outputs/si183/<label>.json), paired by club and pitch size. Prints the SI-2
// criteria (plan 7 "SI-2") with paired differences (+/-95 %), favourites and
// strength slope as in table-si-r132, overall and per pitch size.
// Usage: node work/table-si-offball-v183.cjs <baseLabel> <label> [--size=standard|large] [--json]
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),outDir=path.join(root,'outputs/si183');
const args=process.argv.slice(2),labels=args.filter(a=>!a.startsWith('--')),sizeArg=(args.find(a=>a.startsWith('--size='))||'').slice(7),json=args.includes('--json');
if(labels.length!==2){console.error('Usage: node work/table-si-offball-v183.cjs <baseLabel> <label> [--size=standard|large] [--json]');process.exit(2);}
const load=label=>JSON.parse(fs.readFileSync(path.join(outDir,label+'.json'),'utf8'));
const A=load(labels[0]),B=load(labels[1]),key=r=>r.clubId+'|'+r.size;
const ok=r=>r.finished&&!r.engineError&&!r.stall&&r.rec&&r.extras?.offball;
const mapB=new Map(B.matches.filter(ok).map(r=>[key(r),r]));
const pairsAll=A.matches.filter(ok).filter(r=>mapB.has(key(r))).map(r=>[r,mapB.get(key(r))]);
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:NaN,sd=xs=>{const m=mean(xs);return xs.length>1?Math.sqrt(xs.reduce((a,x)=>a+(x-m)**2,0)/(xs.length-1)):NaN;};
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const metrics={
 minutes:r=>r.realSeconds/60,
 shots:r=>total(r,'shots'),
 onTarget:r=>total(r,'onTarget'),
 goals:r=>r.score[0]+r.score[1],
 offsides:r=>r.extras.offball.offsides,
 movedPerPossession:r=>r.extras.offball.movedMean,
 rebounds:r=>r.extras.offball.rebounds,
 reboundWins:r=>r.extras.offball.reboundWins,
 reboundShots5s:r=>r.extras.offball.reboundShots,
 reboundFinishNew:r=>r.extras.offball.reboundFinishNew,
 crosses:r=>r.extras.offball.crosses.length,
 crossBox2:r=>r.extras.offball.crossBox2,
 crossComplete:r=>r.extras.crossComplete,
 corners:r=>r.extras.corners,
 freeKicks:r=>r.extras.freeKicks,
 fouls:r=>total(r,'fouls'),
 passes:r=>total(r,'passes'),
 passComplete:r=>total(r,'passComplete'),
 spacePasses:r=>r.extras.spacePasses,
 intentsPerCycle:r=>r.extras.offball.intentsPerCycle,
 carrierSpeed:r=>r.extras.offball.carrierSpeed,
 runnerSpeed:r=>r.extras.offball.runnerSpeed,
 runnerFastShare:r=>r.extras.offball.runnerFastShare,
 patternCounter:r=>r.extras.offball.patterns.counter||0,
 patternFollow:r=>r.extras.offball.patterns.follow||0,
 patternOverlap:r=>r.extras.offball.patterns.overlap||0,
 patternOneTwo:r=>r.extras.offball.patterns['one-two']||0,
 sourceRebound:r=>r.extras.offball.sources.rebound||0,
 computeMs:r=>r.computeMs
};
const fav=(rows,gap)=>{const g=rows.filter(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr)>=gap);const w=g.filter(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return r.score[s]>r.score[1-s];}).length;return {n:g.length,win:g.length?w/g.length:NaN};};
const slope=rows=>{const xs=[],ys=[];for(const r of rows)for(const i of [0,1]){xs.push(r.teams[i].ovr-r.teams[1-i].ovr);ys.push(r.teams[i].score-r.teams[1-i].score);}const mx=mean(xs),my=mean(ys);let a=0,b=0;for(let i=0;i<xs.length;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;}return b?a/b:NaN;};
const share=(rows,f)=>rows.length?rows.filter(f).length/rows.length:NaN;
const evaluate=pairs=>{
 const out={pairs:pairs.length,metrics:{}};
 for(const [k,f]of Object.entries(metrics)){
  const xs=pairs.map(p=>f(p[0])).filter(Number.isFinite),ys=pairs.map(p=>f(p[1])).filter(Number.isFinite),d=pairs.map(p=>f(p[1])-f(p[0])).filter(Number.isFinite);
  out.metrics[k]={a:+mean(xs).toFixed(3),b:+mean(ys).toFixed(3),delta:+mean(d).toFixed(3),ci:d.length>1?+(1.96*sd(d)/Math.sqrt(d.length)).toFixed(3):NaN};
 }
 const rateOf=(side,num,den)=>{const n=pairs.reduce((s,p)=>s+num(p[side]),0),dn=pairs.reduce((s,p)=>s+den(p[side]),0);return dn?n/dn:NaN;};
 out.rates={
  reboundWinShare:{a:rateOf(0,metrics.reboundWins,metrics.rebounds),b:rateOf(1,metrics.reboundWins,metrics.rebounds)},
  crossBox2Share:{a:rateOf(0,metrics.crossBox2,metrics.crosses),b:rateOf(1,metrics.crossBox2,metrics.crosses)},
  onTargetShare:{a:rateOf(0,metrics.onTarget,metrics.shots),b:rateOf(1,metrics.onTarget,metrics.shots)},
  goalsPerShot:{a:rateOf(0,metrics.goals,metrics.shots),b:rateOf(1,metrics.goals,metrics.shots)},
  crossCompleteShare:{a:rateOf(0,metrics.crossComplete,metrics.crosses),b:rateOf(1,metrics.crossComplete,metrics.crosses)}
 };
 const rowsA=pairs.map(p=>p[0]),rowsB=pairs.map(p=>p[1]);
 out.favourites={a:fav(rowsA,1),b:fav(rowsB,1)};out.slope={a:+slope(rowsA).toFixed(3),b:+slope(rowsB).toFixed(3)};
 out.targets={goals23:{a:share(rowsA,r=>{const g=r.score[0]+r.score[1];return g>=2&&g<=3;}),b:share(rowsB,r=>{const g=r.score[0]+r.score[1];return g>=2&&g<=3;})},nilNil:{a:share(rowsA,r=>r.score[0]+r.score[1]===0),b:share(rowsB,r=>r.score[0]+r.score[1]===0)},minutes46:{a:share(rowsA,r=>r.realSeconds/60>=4&&r.realSeconds/60<=6),b:share(rowsB,r=>r.realSeconds/60>=4&&r.realSeconds/60<=6)}};
 return out;
};
const groups={all:pairsAll,standard:pairsAll.filter(p=>p[0].size==='standard'),large:pairsAll.filter(p=>p[0].size==='large')};
const selected=sizeArg?{[sizeArg]:groups[sizeArg]}:groups;
const report={a:labels[0],b:labels[1],onlyA:A.matches.filter(ok).length-pairsAll.length,onlyB:B.matches.filter(ok).length-pairsAll.length,failures:[A.failures.length,B.failures.length],unusable:[A.matches.filter(r=>!ok(r)).length,B.matches.filter(r=>!ok(r)).length],groups:Object.fromEntries(Object.entries(selected).map(([g,pairs])=>[g,evaluate(pairs)]))};
if(json){console.log(JSON.stringify(report,null,1));return;}
const f=(x,n=2)=>Number.isFinite(x)?x.toFixed(n):'–',pct=x=>Number.isFinite(x)?(x*100).toFixed(0)+' %':'–';
console.log(`Basis ${labels[0]} gegen ${labels[1]}; Paare je Gruppe: ${Object.entries(selected).map(([g,p])=>`${g} ${p.length}`).join(', ')}; Fehler ${report.failures.join('/')}, unbrauchbar ${report.unusable.join('/')}`);
for(const [g,ev]of Object.entries(report.groups)){
 console.log(`\n### ${g} (${ev.pairs} Paare)\n\n| Kennzahl | ${labels[0]} | ${labels[1]} | Differenz (±95 %) |\n| --- | ---: | ---: | ---: |`);
 for(const [k,v]of Object.entries(ev.metrics))console.log(`| ${k} | ${f(v.a)} | ${f(v.b)} | ${v.delta>=0?'+':''}${f(v.delta)} ±${f(v.ci)} |`);
 for(const [k,v]of Object.entries(ev.rates))console.log(`| ${k} | ${pct(v.a)} | ${pct(v.b)} | ${f((v.b-v.a)*100,1)} Punkte |`);
 console.log(`| Favoriten ≥1 (N) | ${pct(ev.favourites.a.win)} (${ev.favourites.a.n}) | ${pct(ev.favourites.b.win)} (${ev.favourites.b.n}) | ${f((ev.favourites.b.win-ev.favourites.a.win)*100,1)} Punkte |`);
 console.log(`| Tordiff. je Stärkepunkt | ${f(ev.slope.a)} | ${f(ev.slope.b)} | ${f(ev.slope.b-ev.slope.a)} |`);
 console.log(`| 2–3 Tore / 0:0 / 4–6 min | ${pct(ev.targets.goals23.a)} / ${pct(ev.targets.nilNil.a)} / ${pct(ev.targets.minutes46.a)} | ${pct(ev.targets.goals23.b)} / ${pct(ev.targets.nilNil.b)} / ${pct(ev.targets.minutes46.b)} | |`);
}
