'use strict';
// Paired single-attribute probes (own team +4) against the baseline; prints a Markdown table.
const fs=require('node:fs'),path=require('node:path'),dir=path.resolve(__dirname,'../outputs/p01-r132');
const load=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')),base=load('baseline.json'),key=r=>r.clubId+'|'+r.size,bm=new Map(base.matches.map(r=>[key(r),r]));
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)));};
const f=(x,d=2)=>(x>=0?'+':'')+x.toFixed(d).replace('.',',');
const own=r=>r.teams[0],opp=r=>r.teams[1],pts=r=>r.score[0]>r.score[1]?3:r.score[0]===r.score[1]?1:0;
const metrics=[['eig. Schüsse',r=>own(r).stats.shots],['eig. aufs Tor',r=>own(r).stats.onTarget],['eig. Tore',r=>r.score[0]],['Gegentore',r=>r.score[1]],['Gegn. Schüsse',r=>opp(r).stats.shots],['Punkte',pts],['Passquote %',r=>100*own(r).stats.passComplete/Math.max(1,own(r).stats.passes)],['gew. Zweikämpfe',r=>own(r).stats.tacklesWon+own(r).stats.interceptions],['Ballbesitz %',r=>100*own(r).possession/(own(r).possession+opp(r).possession)]];
const labels={fin:'Abschluss',pas:'Passspiel',spd:'Geschwindigkeit',tak:'Zweikampf',gk:'Torwartspiel'};
const lines=['| +4 auf (eigenes Team) | N | '+metrics.map(m=>m[0]).join(' | ')+' |','|---|---:|'+metrics.map(()=>'---:').join('|')+'|'];
for(const k of ['fin','pas','spd','tak','gk']){const file=`baseline-boost-${k}_4.json`;if(!fs.existsSync(path.join(dir,file)))continue;const rep=load(file),pairs=rep.matches.filter(r=>r.finished&&bm.has(key(r))).map(r=>[bm.get(key(r)),r]);
 lines.push(`| ${labels[k]} | ${pairs.length} | `+metrics.map(([,fn])=>{const d=pairs.map(([a,b])=>fn(b)-fn(a)),m=mean(d),ci=1.96*sd(d)/Math.sqrt(d.length);return `${f(m)} ±${ci.toFixed(2).replace('.',',')}`;}).join(' | ')+' |');}
console.log(lines.join('\n'));
