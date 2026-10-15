'use strict';
// SI-4 measurement table: paired comparison (same club and pitch size, same seed)
// of two result files written by work/measure-si-defence-v183.cjs (or
// measure-si183.cjs for the harness metrics) in outputs/si183/.
// Usage: node work/table-si-defence-v183.cjs <baseLabel> <newLabel> [--size=standard|large] [--md]
// Differences are new - base with a 95 % interval of the paired mean difference.
// Favourites: the team with the higher mean of the eight team skills (teams[].skills)
// when the gap is at least 1 point; "wins" counts their victories.
const fs=require('node:fs'),path=require('node:path');
const outDir=path.resolve(__dirname,'..','outputs/si183');
const [a,b]=process.argv.slice(2).filter(x=>!x.startsWith('--')),arg=name=>(process.argv.find(x=>x.startsWith('--'+name+'='))||'').split('=')[1];
const load=label=>JSON.parse(fs.readFileSync(path.join(outDir,label+'.json'),'utf8'));
const A=load(a),B=load(b),size=arg('size'),key=r=>r.clubId+'|'+r.size;
const mapB=new Map(B.matches.map(r=>[key(r),r]));
const pairs=A.matches.filter(r=>(!size||r.size===size)&&mapB.has(key(r))).map(r=>[r,mapB.get(key(r))]);
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const def=r=>r.extras.defence||{fouls:[],corners:[],deflects:{},challenges:{},turnovers:[]};
const third=r=>(r.size==='large'?81.6:68)/3;
const GAIN=['zweikampf','abfangen','ballgewinn-frei'];
const gains=r=>(r.rec?.phases||[]).filter(p=>GAIN.includes(p.startReason));
const lossReasons=p=>/verloren|abgefangen|fehlpass|ballverlust/.test(p.endReason||'');
// A team loses the ball in its final third (phase reached the final third) and has it back within 3 s.
const regain3=r=>{const ph=(r.rec?.phases||[]).slice().sort((x,y)=>x.startTick-y.startTick);let n=0;for(let i=0;i<ph.length;i++){const p=ph[i];if(!lossReasons(p)||!p.final3)continue;const next=ph.slice(i+1).find(q=>q.team===p.team&&q.startTick>p.endTick);if(next&&GAIN.includes(next.startReason)&&(next.startTick-p.endTick)*(r.ticks?r.realSeconds/r.ticks:.05)<=3)n++;}return n;};
const metrics={
 minutes:r=>r.realSeconds/60,shots:r=>total(r,'shots'),onTarget:r=>total(r,'onTarget'),goals:r=>r.score[0]+r.score[1],
 freeKicks:r=>r.extras.freeKicks,penalties:r=>r.extras.penalties,fouls:r=>total(r,'fouls'),
 standingAttempts:r=>def(r).challenges.standing||0,standingWon:r=>def(r).challenges.standingWon||0,slideStarts:r=>def(r).challenges.slideStart||0,slidesWon:r=>total(r,'slideWon'),
 foulCalls:r=>def(r).fouls.length,foulsAwarded:r=>def(r).fouls.filter(f=>f.awarded).length,
 foulsViaContact:r=>def(r).fouls.filter(f=>f.awarded&&(f.path==='standing'||f.path==='slide')).length,
 foulsViaProbeOrOther:r=>def(r).fouls.filter(f=>f.awarded&&f.path!=='standing'&&f.path!=='slide').length,
 corners:r=>r.extras.corners,cornersBlock:r=>def(r).corners.filter(c=>c.source==='block').length,cornersParade:r=>def(r).corners.filter(c=>c.source==='parade').length,
 cornersRoll:r=>def(r).corners.filter(c=>c.source==='roll').length,cornersOther:r=>def(r).corners.filter(c=>c.source==='other').length,
 airClears:r=>def(r).clears||0,airClearsOut:r=>def(r).clearOut||0,blocks:r=>(def(r).deflects||{}).block||0,
 gains:r=>gains(r).length,gainsFinalThird:r=>gains(r).filter(p=>p.startDist<=third(r)).length,
 turnoversFinalThird:r=>(def(r).turnovers||[]).filter(t=>t.loserFinal3).length,regainWithin3s:regain3,
 crosses:r=>total(r,'crosses'),saves:r=>total(r,'saves'),ticks:r=>r.ticks
};
const stat=xs=>{const n=xs.length,m=xs.reduce((s,x)=>s+x,0)/n,sd=Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/Math.max(1,n-1));return {m,ci:1.96*sd/Math.sqrt(n)};};
const rows={};
for(const [k,f] of Object.entries(metrics)){
 const xs=pairs.map(([x])=>f(x)),ys=pairs.map(([,y])=>f(y)),d=stat(ys.map((y,i)=>y-xs[i]));
 rows[k]={[a]:+(xs.reduce((s,x)=>s+x,0)/xs.length).toFixed(3),[b]:+(ys.reduce((s,x)=>s+x,0)/ys.length).toFixed(3),delta:+d.m.toFixed(3),ci95:+d.ci.toFixed(3)};
}
// Favourites (strength gap >= 1) and goal difference per strength point.
const strength=t=>Object.values(t.skills).reduce((s,x)=>s+x,0)/Object.keys(t.skills).length;
const fav=side=>{
 const list=pairs.map(p=>p[side]).filter(r=>Math.abs(strength(r.teams[0])-strength(r.teams[1]))>=1);
 const win=list.filter(r=>{const f=strength(r.teams[0])>strength(r.teams[1])?0:1;return r.score[f]>r.score[1-f];}).length;
 const points=list.filter(r=>{const f=strength(r.teams[0])>strength(r.teams[1])?0:1;return r.score[f]>=r.score[1-f];}).length;
 const slope=(()=>{let num=0,den=0;for(const r of pairs.map(p=>p[side])){const ds=strength(r.teams[0])-strength(r.teams[1]);num+=(r.score[0]-r.score[1])*ds;den+=ds*ds;}return den?num/den:NaN;})();
 return {games:list.length,winShare:+(win/list.length).toFixed(3),unbeatenShare:+(points/list.length).toFixed(3),goalDiffPerPoint:+slope.toFixed(3)};
};
const report={base:a,new:b,pairs:pairs.length,size:size||'all',metrics:rows,favourites:{[a]:fav(0),[b]:fav(1)},ratios:{
 contactShareOfAwardedFouls:{[a]:+(pairs.reduce((s,[x])=>s+metrics.foulsViaContact(x),0)/Math.max(1,pairs.reduce((s,[x])=>s+metrics.foulsAwarded(x),0))).toFixed(3),[b]:+(pairs.reduce((s,[,y])=>s+metrics.foulsViaContact(y),0)/Math.max(1,pairs.reduce((s,[,y])=>s+metrics.foulsAwarded(y),0))).toFixed(3)}
}};
if(process.argv.includes('--md')){
 console.log(`| Kennzahl | ${a} | ${b} | Differenz | ±95 % |\n| --- | ---: | ---: | ---: | ---: |`);
 for(const [k,v] of Object.entries(rows))console.log(`| ${k} | ${v[a]} | ${v[b]} | ${v.delta} | ${v.ci95} |`);
}else console.log(JSON.stringify(report,null,1));
