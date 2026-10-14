'use strict';
// Markdown comparison of P01 prototype variants against the paired baseline.
// Usage: node work/table-p01-r132.cjs v1 v2 ...   (reads outputs/p01-r132/<v>.json)
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../outputs/p01-r132');
const load=v=>{const r=JSON.parse(fs.readFileSync(path.join(dir,v+'.json'),'utf8'));r.excluded=r.matches.filter(m=>!m.finished).length+r.failures.length;r.matches=r.matches.filter(m=>m.finished);return r;};
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)));};
const f=(x,d=2)=>x.toFixed(d).replace('.',',');
const base=load('baseline'),key=r=>r.clubId+'|'+r.size,bm=new Map(base.matches.map(r=>[key(r),r]));
const metrics=[['Min.',r=>r.realSeconds/60],['Schüsse',r=>total(r,'shots')],['aufs Tor',r=>total(r,'onTarget')],['Tore',r=>r.score[0]+r.score[1]],['0:0 %',r=>r.score[0]+r.score[1]===0?100:0],['Pässe',r=>total(r,'passes')],['Fouls',r=>total(r,'fouls')]];
const strength=rows=>{const xs=[],ys=[];for(const r of rows)for(const i of [0,1]){xs.push(r.teams[i].ovr-r.teams[1-i].ovr);ys.push(r.teams[i].score-r.teams[1-i].score);}const mx=mean(xs),my=mean(ys);let a=0,b=0;for(let i=0;i<xs.length;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;}return a/b;};
const fav=rows=>{const g=rows.filter(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr)>=1);const w=g.filter(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return r.score[s]>r.score[1-s];}).length;return 100*w/g.length;};
const lines=['| Variante | N | '+metrics.map(m=>m[0]).join(' | ')+' | Tordiff./Stärkepunkt | Favoritensiege % |','|---|---:|'+metrics.map(()=>'---:').join('|')+'|---:|---:|'];
const row=(name,rows,pairs)=>{const cells=metrics.map(([label,fn])=>{const v=mean(rows.map(fn));if(!pairs||label==='0:0 %')return f(v,label==='0:0 %'?0:2);const d=pairs.map(([a,b])=>fn(b)-fn(a)),m=mean(d),se=sd(d)/Math.sqrt(d.length);return `${f(v)} (${m>=0?'+':''}${f(m)} ±${f(1.96*se)})`;});return `| ${name} | ${rows.length} | ${cells.join(' | ')} | ${f(strength(rows))} | ${f(fav(rows),0)} |`;};
lines.push(row('Basis R132'+(base.excluded?' ('+base.excluded+' ausgeschl.)':''),base.matches,null));
for(const v of process.argv.slice(2)){let rep;try{rep=load(v);}catch{lines.push(`| ${v} | – | fehlt |`);continue;}const pairs=rep.matches.filter(r=>bm.has(key(r))).map(r=>[bm.get(key(r)),r]);lines.push(row(v+(rep.excluded?' ('+rep.excluded+' ausgeschl.)':''),rep.matches,pairs));}
console.log(lines.join('\n'));
