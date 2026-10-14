'use strict';
// Markdown tables for the Spielerintelligenz prototype series (outputs/si-r132/<variant>.json).
// Usage: node work/table-si-r132.cjs [--size=standard|large] v1 v2 ...   (baseline is always the first row)
//        node work/table-si-r132.cjs --json v1 v2 ...   (machine-readable summary)
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../outputs/si-r132');
const args=process.argv.slice(2),sizeFilter=(args.find(a=>a.startsWith('--size='))||'').slice(7)||null,json=args.includes('--json'),names=args.filter(a=>!a.startsWith('--'));
const load=v=>{const r=JSON.parse(fs.readFileSync(path.join(dir,v+'.json'),'utf8'));r.excluded=r.matches.filter(m=>!m.finished).length+r.failures.length;r.matches=r.matches.filter(m=>m.finished&&(!sizeFilter||m.size===sizeFilter));return r;};
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)));};
const f=(x,d=2)=>Number.isFinite(x)?x.toFixed(d).replace('.',','):'–',pct=(a,b)=>b?100*a/b:NaN;
const key=r=>r.clubId+'|'+r.size;
const openShots=r=>r.rec.shots.filter(s=>!s.penalty&&s.kind!=='direct-free-kick');
const onT=s=>s.plannedOnTarget||s.actualOnTarget||['goal','caught','parried'].includes(s.result);
const metrics=[
 ['Min.',r=>r.realSeconds/60],
 ['Schüsse',r=>total(r,'shots')],
 ['aufs Tor',r=>total(r,'onTarget')],
 ['Tore',r=>r.score[0]+r.score[1]],
 ['Abpraller',r=>r.extras?.rebounds??NaN],
 ['Ecken',r=>r.extras?.corners??(r.setPieces.corners[0]+r.setPieces.corners[1])],
 ['Flanken',r=>r.extras?.flights?.cross??total(r,'crosses')],
 ['Raumpässe',r=>r.extras?.spacePasses??NaN],
 ['Fouls',r=>total(r,'fouls')],
];
const share=(rows,pred)=>pct(rows.filter(pred).length,rows.length);
const strength=rows=>{const xs=[],ys=[];for(const r of rows)for(const i of [0,1]){xs.push(r.teams[i].ovr-r.teams[1-i].ovr);ys.push(r.teams[i].score-r.teams[1-i].score);}const mx=mean(xs),my=mean(ys);let a=0,b=0;for(let i=0;i<xs.length;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;}return b?a/b:NaN;};
const fav=(rows,gap)=>{const g=rows.filter(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr)>=gap);const w=g.filter(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return r.score[s]>r.score[1-s];}).length,d=g.filter(r=>r.score[0]===r.score[1]).length;return {n:g.length,win:pct(w,g.length),draw:pct(d,g.length)};};
const shotQuality=rows=>{const shots=rows.flatMap(openShots),all=rows.flatMap(r=>r.rec.shots);return {dist:mean(shots.map(s=>s.range)),far:share(shots,s=>s.range>22),near:share(shots,s=>s.range<=14),onTarget:pct(all.filter(onT).length,all.length),goalPerShot:pct(all.filter(s=>s.result==='goal'||s.goal).length,all.length),goalPerOnTarget:pct(all.filter(s=>s.result==='goal'||s.goal).length,all.filter(onT).length),blocked:share(all,s=>s.result==='blocked'||s.result==='unreached-block'),saved:share(all,s=>s.result==='caught'||s.result==='parried'),directFk:share(all,s=>s.kind==='direct-free-kick')};};
const summary=(name,rep,base)=>{
 const rows=rep.matches,bm=base&&new Map(base.matches.map(r=>[key(r),r])),pairs=bm?rows.filter(r=>bm.has(key(r))).map(r=>[bm.get(key(r)),r]):null;
 const out={variant:name,n:rows.length,excluded:rep.excluded,metrics:{},targets:{goals23:share(rows,r=>{const g=r.score[0]+r.score[1];return g>=2&&g<=3;}),shots1016:share(rows,r=>{const s=total(r,'shots');return s>=10&&s<=16;}),minutes46:share(rows,r=>r.realSeconds/60>=4&&r.realSeconds/60<=6),nilNil:share(rows,r=>r.score[0]+r.score[1]===0),draws:share(rows,r=>r.score[0]===r.score[1])},quality:shotQuality(rows),favourite1:fav(rows,1),favourite2:fav(rows,2),goalDiffPerPoint:strength(rows)};
 for(const [label,fn]of metrics){const v=mean(rows.map(fn)),m={mean:v};if(pairs&&pairs.length){const d=pairs.map(([a,b])=>fn(b)-fn(a)),dm=mean(d),se=sd(d)/Math.sqrt(d.length);m.diff=dm;m.ci=1.96*se;}out.metrics[label]=m;}
 return out;
};
const base=load('baseline'),reps=[['Basis R132',base,null],...names.filter(v=>v!=='baseline').map(v=>{try{return [v,load(v),base];}catch{return [v,null,null];}})];
const sums=reps.map(([name,rep,b])=>rep?summary(name,rep,b):{variant:name,missing:true});
if(json){console.log(JSON.stringify(sums,null,1));process.exit(0);}
const cell=(m,label)=>{if(!m)return '–';const d=label==='Min.'?2:2;return m.diff===undefined?f(m.mean,d):`${f(m.mean,d)} (${m.diff>=0?'+':''}${f(m.diff,d)} ±${f(m.ci,d)})`;};
const lines=[];
lines.push(`### Kennzahlen je Partie${sizeFilter?` (${sizeFilter==='standard'?'Standardfeld, 5 Feldspieler':'großes Feld, 6 Feldspieler'})`:' (beide Feldgrößen)'}`,'',
 '| Variante | N | '+metrics.map(m=>m[0]).join(' | ')+' |','|---|---:|'+metrics.map(()=>'---:').join('|')+'|');
for(const s of sums){if(s.missing){lines.push(`| ${s.variant} | – | fehlt |`);continue;}lines.push(`| ${s.variant}${s.excluded?` (${s.excluded} ausgeschl.)`:''} | ${s.n} | ${metrics.map(([label])=>cell(s.metrics[label],label)).join(' | ')} |`);}
lines.push('','### Zielerreichung und Qualität','','| Variante | 4–6 min % | 10–16 Schüsse % | 2–3 Tore % | 0:0 % | Remis % | Distanz (m) | >22 m % | ≤14 m % | aufs Tor % | Tor/Schuss % | Tor/aufs Tor % | geblockt % | gehalten % | dir. Freistoß % | Favoriten ≥1 % (N) | Favoriten ≥2 % (N) | Tordiff./Pkt. |','|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for(const s of sums){if(s.missing)continue;const q=s.quality,t=s.targets;lines.push(`| ${s.variant} | ${f(t.minutes46,0)} | ${f(t.shots1016,0)} | ${f(t.goals23,0)} | ${f(t.nilNil,0)} | ${f(t.draws,0)} | ${f(q.dist,1)} | ${f(q.far,0)} | ${f(q.near,0)} | ${f(q.onTarget,0)} | ${f(q.goalPerShot,0)} | ${f(q.goalPerOnTarget,0)} | ${f(q.blocked,0)} | ${f(q.saved,0)} | ${f(q.directFk,0)} | ${f(s.favourite1.win,0)} (${s.favourite1.n}) | ${f(s.favourite2.win,0)} (${s.favourite2.n}) | ${f(s.goalDiffPerPoint,2)} |`);}
console.log(lines.join('\n'));
