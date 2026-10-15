'use strict';
// SI-5 evaluation: paired comparison of two measure-si-offball-v183 result files
// (outputs/si183/<label>.json) per pitch size with the SI-5 criteria (plan 7,
// "SI-5"): shots, goals, time with the ball inside 22 m per team, favourites,
// duration, plus the ratio large/standard of one run. Pairs by club and size.
// Usage: node work/table-si-field-v183.cjs <baseLabel> <label> [--size=standard|large]
//        node work/table-si-field-v183.cjs <label>                (single run, ratio large/standard)
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),outDir=path.join(root,'outputs/si183');
const args=process.argv.slice(2),labels=args.filter(a=>!a.startsWith('--')),sizeArg=(args.find(a=>a.startsWith('--size='))||'').slice(7);
if(labels.length<1||labels.length>2){console.error('Usage: node work/table-si-field-v183.cjs <baseLabel> <label> [--size=…] | <label>');process.exit(2);}
const load=label=>JSON.parse(fs.readFileSync(path.join(outDir,label+'.json'),'utf8'));
const ok=r=>r.finished&&!r.engineError&&!r.stall&&r.rec;
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:NaN,sd=xs=>{const m=mean(xs);return xs.length>1?Math.sqrt(xs.reduce((a,x)=>a+(x-m)**2,0)/(xs.length-1)):NaN;};
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const metrics={
 minutes:r=>r.realSeconds/60,
 shots:r=>total(r,'shots'),
 onTarget:r=>total(r,'onTarget'),
 goals:r=>r.score[0]+r.score[1],
 zone22PerTeam:r=>(r.rec.zone22[0]+r.rec.zone22[1])/2,
 zone30PerTeam:r=>(r.rec.zone30[0]+r.rec.zone30[1])/2,
 ballZone22:r=>(r.rec.ballZone22[0]+r.rec.ballZone22[1])/2,
 phases:r=>r.rec.phases.length,
 phasesZone22:r=>r.rec.phases.filter(p=>p.zone22).length,
 phasesFinal3:r=>r.rec.phases.filter(p=>p.final3).length,
 passes:r=>total(r,'passes'),
 passComplete:r=>total(r,'passComplete'),
 fouls:r=>total(r,'fouls'),
 duels:r=>total(r,'duels'),
 duelsWon:r=>total(r,'duelsWon'),
 tackleAttempts:r=>total(r,'tackleAttempts'),
 tacklesWon:r=>total(r,'tacklesWon'),
 slideAttempts:r=>total(r,'slideAttempts'),
 slideWon:r=>total(r,'slideWon'),
 interceptions:r=>total(r,'interceptions'),
 corners:r=>r.extras.corners,
 crosses:r=>total(r,'crosses'),
 spacePasses:r=>r.extras.spacePasses,
 offsides:r=>r.extras.offball?.offsides,
 computeMs:r=>r.computeMs
};
const fav=(rows,gap)=>{const g=rows.filter(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr)>=gap);const w=g.filter(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return r.score[s]>r.score[1-s];}).length;return {n:g.length,win:g.length?w/g.length:NaN};};
const slope=rows=>{const xs=[],ys=[];for(const r of rows)for(const i of [0,1]){xs.push(r.teams[i].ovr-r.teams[1-i].ovr);ys.push(r.teams[i].score-r.teams[1-i].score);}const mx=mean(xs),my=mean(ys);let a=0,b=0;for(let i=0;i<xs.length;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;}return b?a/b:NaN;};
const f=(x,n=2)=>Number.isFinite(x)?x.toFixed(n):'–',pct=x=>Number.isFinite(x)?(x*100).toFixed(0)+' %':'–';
const key=r=>r.clubId+'|'+r.size;
if(labels.length===1){
 const A=load(labels[0]),rows=A.matches.filter(ok),by=s=>rows.filter(r=>r.size===s);
 console.log(`Lauf ${labels[0]}: ${rows.length} Partien (Fehler ${A.failures.length})`);
 console.log('\n| Kennzahl | Standard | Groß | Groß/Standard |\n| --- | ---: | ---: | ---: |');
 for(const [k,fn]of Object.entries(metrics)){const a=mean(by('standard').map(fn).filter(Number.isFinite)),b=mean(by('large').map(fn).filter(Number.isFinite));console.log(`| ${k} | ${f(a)} | ${f(b)} | ${pct(b/a)} |`);}
 for(const s of ['standard','large']){const r=by(s);console.log(`${s}: Favoriten ≥1 ${pct(fav(r,1).win)} (N ${fav(r,1).n}), Tordiff./Stärkepunkt ${f(slope(r))}`);}
 process.exit(0);
}
const A=load(labels[0]),B=load(labels[1]),mapB=new Map(B.matches.filter(ok).map(r=>[key(r),r]));
const pairsAll=A.matches.filter(ok).filter(r=>mapB.has(key(r))).map(r=>[r,mapB.get(key(r))]);
const groups={all:pairsAll,standard:pairsAll.filter(p=>p[0].size==='standard'),large:pairsAll.filter(p=>p[0].size==='large')};
console.log(`Basis ${labels[0]} gegen ${labels[1]}; Paare: ${Object.entries(groups).map(([g,p])=>`${g} ${p.length}`).join(', ')}; Fehler ${A.failures.length}/${B.failures.length}`);
for(const [g,pairs]of Object.entries(groups)){
 if((sizeArg&&g!==sizeArg)||!pairs.length)continue;
 console.log(`\n### ${g} (${pairs.length} Paare)\n\n| Kennzahl | ${labels[0]} | ${labels[1]} | Differenz (±95 %) |\n| --- | ---: | ---: | ---: |`);
 for(const [k,fn]of Object.entries(metrics)){
  const xs=pairs.map(p=>fn(p[0])).filter(Number.isFinite),ys=pairs.map(p=>fn(p[1])).filter(Number.isFinite),d=pairs.map(p=>fn(p[1])-fn(p[0])).filter(Number.isFinite);
  console.log(`| ${k} | ${f(mean(xs))} | ${f(mean(ys))} | ${mean(d)>=0?'+':''}${f(mean(d))} ±${f(1.96*sd(d)/Math.sqrt(d.length))} |`);
 }
 const ra=pairs.map(p=>p[0]),rb=pairs.map(p=>p[1]);
 console.log(`| Favoriten ≥1 (N) | ${pct(fav(ra,1).win)} (${fav(ra,1).n}) | ${pct(fav(rb,1).win)} (${fav(rb,1).n}) | ${f((fav(rb,1).win-fav(ra,1).win)*100,1)} Punkte |`);
 console.log(`| Tordiff. je Stärkepunkt | ${f(slope(ra))} | ${f(slope(rb))} | ${f(slope(rb)-slope(ra))} |`);
 const share=(rows,fn)=>rows.filter(fn).length/rows.length,gl=r=>r.score[0]+r.score[1];
 console.log(`| 0:0 / 2–3 Tore / 4–6 min | ${pct(share(ra,r=>gl(r)===0))} / ${pct(share(ra,r=>gl(r)>=2&&gl(r)<=3))} / ${pct(share(ra,r=>r.realSeconds/60>=4&&r.realSeconds/60<=6))} | ${pct(share(rb,r=>gl(r)===0))} / ${pct(share(rb,r=>gl(r)>=2&&gl(r)<=3))} / ${pct(share(rb,r=>r.realSeconds/60>=4&&r.realSeconds/60<=6))} | |`);
}
