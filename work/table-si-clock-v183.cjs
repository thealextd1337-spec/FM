'use strict';
// SI 183, package SI-0: paired table of measurement series (outputs/si183/<label>.json).
// Usage: node work/table-si-clock-v183.cjs <baseLabel> <label> [<label> ...]
// Every later series is compared with the first one match by match (club|size); the
// columns are means over all matches, the plus-minus is the 95 % interval of the paired
// difference. Time columns: whole match in real minutes (all-inclusive), the running
// clock (clock end / rate) and the stoppage rest; per free kick the time the set piece
// exists (standard-freeKick:*); kickoff time per match (banner, countdown, goal scene).
// Events per real minute divide match totals by the real match minutes.
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../outputs/si183');
const labels=process.argv.slice(2);
if(labels.length<2){console.error('Usage: node work/table-si-clock-v183.cjs <baseLabel> <label> [<label> ...]');process.exit(2);}
const load=label=>JSON.parse(fs.readFileSync(path.join(dir,label+'.json'),'utf8'));
const runs=labels.map(label=>({label,data:load(label)}));
const key=r=>r.clubId+'|'+r.size;
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const sumTime=(r,pattern)=>Object.entries(r.rec?.time||{}).filter(([k])=>pattern.test(k)).reduce((s,[,v])=>s+v,0);
const rateOf=run=>run.data.si?.clockRate??.78;
const metrics={
 'Dauer all-inclusive (min)':{f:r=>r.realSeconds/60,d:3},
 'Uhrende (Einheiten)':{f:r=>r.elapsed,d:2},
 'laufende Uhr (min, Uhrende/Rate)':{f:(r,run)=>r.elapsed/rateOf(run)/60,d:3},
 'Stillstand (min)':{f:(r,run)=>r.realSeconds/60-r.elapsed/rateOf(run)/60,d:3},
 'Anteil 4–6 min (%)':{f:r=>r.realSeconds/60>=4&&r.realSeconds/60<=6?100:0,d:1},
 'Schüsse':{f:r=>total(r,'shots'),d:2},
 'aufs Tor':{f:r=>total(r,'onTarget'),d:2},
 'Tore':{f:r=>r.score[0]+r.score[1],d:3},
 'Pässe':{f:r=>total(r,'passes'),d:1},
 'Zweikämpfe':{f:r=>total(r,'duels'),d:1},
 'Fouls':{f:r=>total(r,'fouls'),d:2},
 'Freistöße':{f:r=>r.extras.freeKicks,d:2},
 'Ecken':{f:r=>r.extras.corners,d:2},
 'Freistoßdauer (s je Freistoß, Summe/Anzahl)':{f:null,d:2,ratio:[r=>sumTime(r,/^standard-freeKick:/),r=>r.extras.freeKicks]},
 'Anstoß+Torszene (s je Partie)':{f:r=>sumTime(r,/^(anstoss|torszene)/),d:2},
 'Frische bei Abpfiff, Feldspieler (Mittel)':{f:r=>{const f=(r.extras.fresh||[]).filter(x=>!x[1]);return f.length?f.reduce((s,x)=>s+x[3],0)/f.length:NaN;},d:2},
 'Frische bei Abpfiff, Kondition 9–11':{f:r=>{const f=(r.extras.fresh||[]).filter(x=>!x[1]&&x[0]>=9&&x[0]<=11);return f.length?f.reduce((s,x)=>s+x[3],0)/f.length:NaN;},d:2},
 'Stillstand je Minute laufender Uhr (s)':{f:(r,run)=>(r.realSeconds-r.elapsed/rateOf(run))/(r.elapsed/rateOf(run)/60),d:1},
 'Schüsse je Echtminute':{f:r=>total(r,'shots')/(r.realSeconds/60),d:3},
 'Tore je Echtminute':{f:r=>(r.score[0]+r.score[1])/(r.realSeconds/60),d:3},
 'Fouls je Echtminute':{f:r=>total(r,'fouls')/(r.realSeconds/60),d:3},
 'Zweikämpfe je Echtminute':{f:r=>total(r,'duels')/(r.realSeconds/60),d:2},
 'Pässe je Echtminute':{f:r=>total(r,'passes')/(r.realSeconds/60),d:2},
 'Schüsse je Minute laufender Uhr':{f:(r,run)=>total(r,'shots')/(r.elapsed/rateOf(run)/60),d:3},
};
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const sd=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/Math.max(1,a.length-1));};
const base=runs[0],baseMap=new Map(base.data.matches.map(r=>[key(r),r]));
const lines=[];
lines.push('| Kennzahl | '+runs.map(r=>r.label).join(' | ')+' |');
lines.push('| --- | '+runs.map(()=>'---:').join(' | ')+' |');
const fmt=(x,d)=>Number.isFinite(x)?x.toFixed(d):'–';
const out={labels,n:{},metrics:{}};
for(const run of runs)out.n[run.label]={matches:run.data.matches.length,failures:run.data.failures.length,rate:rateOf(run),dist:run.data.dist,packages:run.data.si?.packages??null};
for(const [name,spec] of Object.entries(metrics)){
 const cells=[];out.metrics[name]={};
 for(const run of runs){
  const pairs=run.data.matches.filter(r=>baseMap.has(key(r))).map(r=>[baseMap.get(key(r)),r]);
  let value,delta='';
  if(spec.ratio){
   const [num,den]=spec.ratio,a=run.data.matches,s=a.reduce((x,r)=>x+num(r),0),c=a.reduce((x,r)=>x+den(r),0);
   value=c?s/c:NaN;
   if(run!==base){const sb=base.data.matches.reduce((x,r)=>x+num(r),0),cb=base.data.matches.reduce((x,r)=>x+den(r),0);delta=cb?` (${(value-sb/cb>=0?'+':'')}${fmt(value-sb/cb,spec.d)})`:'';}
  }else{
   const vals=run.data.matches.map(r=>spec.f(r,run)).filter(Number.isFinite);value=mean(vals);
   if(run!==base&&pairs.length){
    const diffs=pairs.map(([b,r])=>spec.f(r,run)-spec.f(b,base)).filter(Number.isFinite),m=mean(diffs),ci=1.96*sd(diffs)/Math.sqrt(diffs.length);
    delta=` (${m>=0?'+':''}${fmt(m,spec.d)} ±${fmt(ci,spec.d)})`;
   }
  }
  out.metrics[name][run.label]=value;
  cells.push(fmt(value,spec.d)+delta);
 }
 lines.push(`| ${name} | ${cells.join(' | ')} |`);
}
// Kickoff and goal scene per goal: slope of (torszene + anstoss) over the goals of a match.
const slope=run=>{const pts=run.data.matches.map(r=>[r.score[0]+r.score[1],sumTime(r,/^(anstoss|torszene)/)]),mx=mean(pts.map(p=>p[0])),my=mean(pts.map(p=>p[1])),sxx=pts.reduce((s,p)=>s+(p[0]-mx)**2,0);return sxx?pts.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0)/sxx:NaN;};
lines.push('| Anstoß+Torszene je Tor (Regression, s) | '+runs.map(run=>fmt(slope(run),2)).join(' | ')+' |');
console.log(lines.join('\n'));
console.log('\n'+JSON.stringify(out.n));
