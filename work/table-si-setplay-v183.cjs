'use strict';
// SI-7 paired comparison of measure-si183 result files: cross, corner, header
// and favourite metrics per match, paired by club and pitch size.
// Usage: node work/table-si-setplay-v183.cjs <baseLabel> <variantLabel> [...moreVariants] [--size=standard|large] [--json]
const fs=require('node:fs'),path=require('node:path');
const outDir=path.join(path.resolve(__dirname,'..'),'outputs/si183');
const args=process.argv.slice(2),sizeArg=(args.find(a=>a.startsWith('--size='))||'').slice(7),labels=args.filter(a=>!a.startsWith('--'));
if(labels.length<2){console.error('labels: base variant [...]');process.exit(2);}
const load=label=>JSON.parse(fs.readFileSync(path.join(outDir,label+'.json'),'utf8')).matches.filter(r=>!sizeArg||r.size===sizeArg);
const key=r=>r.clubId+'|'+r.size;
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const metrics={
 minutes:r=>r.realSeconds/60,
 shots:r=>total(r,'shots'),
 onTarget:r=>total(r,'onTarget'),
 goals:r=>r.score[0]+r.score[1],
 crosses:r=>total(r,'crosses'),
 crossComplete:r=>total(r,'crossComplete'),
 crossFlights:r=>r.extras.flights?.cross??NaN,
 headerVolleyShots:r=>(r.rec?.shots||[]).filter(s=>s.kind==='header'||s.kind==='volley').length,
 headerVolleyGoals:r=>(r.rec?.shots||[]).filter(s=>(s.kind==='header'||s.kind==='volley')&&s.goal).length,
 aerialDuels:r=>total(r,'aerialDuels'),
 corners:r=>r.extras.corners,
 shotsAfterCorner10s:r=>(r.rec?.shots||[]).filter(s=>s.restart&&s.restart.type==='corner'&&s.restart.team===s.team&&s.restart.ago<=10).length,
 freeKicks:r=>r.extras.freeKicks,
 rebounds:r=>r.extras.rebounds,
 fouls:r=>total(r,'fouls'),
 saves:r=>total(r,'saves'),
};
const mean=list=>list.reduce((a,b)=>a+b,0)/Math.max(1,list.length);
const sd=list=>{const m=mean(list);return Math.sqrt(mean(list.map(x=>(x-m)*(x-m))));};
const favourite=rows=>{const pairs=rows.map(r=>{const d=r.teams[0].ovr-r.teams[1].ovr,g=r.score[0]-r.score[1];return {d,g};}).filter(p=>Math.abs(p.d)>=1);const wins=pairs.filter(p=>Math.sign(p.g)===Math.sign(p.d)).length;return {n:pairs.length,rate:pairs.length?wins/pairs.length:NaN};};
const slope=rows=>{let num=0,den=0;for(const r of rows){const d=r.teams[0].ovr-r.teams[1].ovr,g=r.score[0]-r.score[1];num+=d*g;den+=d*d;}return den?num/den:NaN;};
const base=load(labels[0]),baseMap=new Map(base.map(r=>[key(r),r]));
const report={base:labels[0],size:sizeArg||'both',n:base.length,variants:{}};
const row=(name,values)=>name.padEnd(22)+values.map(v=>String(v).padStart(18)).join('');
const lines=[row('metric',[labels[0],...labels.slice(1).flatMap(l=>[l,'delta ±95%'])])];
const perMetric={};
for(const [name,f]of Object.entries(metrics)){
 const b=mean(base.map(f));perMetric[name]={[labels[0]]:+b.toFixed(3)};
 const cells=[b.toFixed(3)];
 for(const label of labels.slice(1)){
  const v=load(label),pairs=v.filter(r=>baseMap.has(key(r))).map(r=>[baseMap.get(key(r)),r]);
  const deltas=pairs.map(([x,y])=>f(y)-f(x)),d=mean(deltas),ci=1.96*sd(deltas)/Math.sqrt(Math.max(1,deltas.length));
  const vm=mean(pairs.map(([,y])=>f(y)));
  perMetric[name][label]={mean:+vm.toFixed(3),delta:+d.toFixed(3),ci95:+ci.toFixed(3),pairs:pairs.length};
  cells.push(vm.toFixed(3),`${d>=0?'+':''}${d.toFixed(3)} ±${ci.toFixed(3)}`);
 }
 lines.push(row(name,cells));
}
// Ratios and favourites.
const ratios={};
for(const label of labels){
 const rows=load(label),fav=favourite(rows),hv=rows.reduce((s,r)=>s+metrics.headerVolleyShots(r),0),hvg=rows.reduce((s,r)=>s+metrics.headerVolleyGoals(r),0),cr=rows.reduce((s,r)=>s+metrics.crosses(r),0),cc=rows.reduce((s,r)=>s+metrics.crossComplete(r),0),co=rows.reduce((s,r)=>s+metrics.corners(r),0),sc=rows.reduce((s,r)=>s+metrics.shotsAfterCorner10s(r),0),goals=rows.reduce((s,r)=>s+metrics.goals(r),0),shots=rows.reduce((s,r)=>s+metrics.shots(r),0);
 ratios[label]={n:rows.length,crossCompleteShare:cr?+(cc/cr).toFixed(3):NaN,headerVolleyGoalShare:hv?+(hvg/hv).toFixed(3):NaN,shotsAfterCornerPerCorner:co?+(sc/co).toFixed(3):NaN,goalsPerShot:shots?+(goals/shots).toFixed(3):NaN,favouriteRate:+fav.rate.toFixed(3),favouriteN:fav.n,goalDiffPerStrengthPoint:+slope(rows).toFixed(3),failures:JSON.parse(fs.readFileSync(path.join(outDir,label+'.json'),'utf8')).failures.length,within4to6:+(rows.filter(r=>r.realSeconds>=240&&r.realSeconds<=360).length/rows.length).toFixed(3)};
}
report.metrics=perMetric;report.ratios=ratios;
console.log(lines.join('\n'));
console.log('');
console.log(row('ratio',labels));
for(const k of ['crossCompleteShare','headerVolleyGoalShare','shotsAfterCornerPerCorner','goalsPerShot','favouriteRate','favouriteN','goalDiffPerStrengthPoint','within4to6','failures','n'])console.log(row(k,labels.map(l=>ratios[l][k])));
if(args.includes('--json'))console.log(JSON.stringify(report));
fs.writeFileSync(path.join(outDir,`table-setplay-${labels.join('_vs_')}${sizeArg?'-'+sizeArg:''}.json`),JSON.stringify(report,null,1)+'\n');
