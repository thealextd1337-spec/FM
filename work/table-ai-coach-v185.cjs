'use strict';
// AI coach 185: paired comparison of two measure-si183 series (outputs/si183/<label>.json), matched by
// seed|club|pitch. Prints goals, shots, on target, draws, favourite wins (gap >= 1 / >= 3), the paired
// differences and the score dynamics at minute 60 (state minute, clock 50): points of the trailing and the
// leading team, split by computer side (physical 1, the coached side) and user side. With aiCoach extras
// (work/measure-ai-coach-v185.cjs) also changes per match and their reasons.
// Usage: node work/table-ai-coach-v185.cjs <label[,label]> <baseLabel[,label]> [--json]
const fs=require('node:fs'),path=require('node:path');
const outDir=path.resolve(__dirname,'..','outputs/si183'),args=process.argv.slice(2),runs=args.filter(a=>!a.startsWith('--'));
if(runs.length!==2){console.error('Usage: node work/table-ai-coach-v185.cjs <label[,label]> <baseLabel[,label]> [--json]');process.exit(2);}
const dirs=[outDir,path.resolve(__dirname,'..','..','ball-physics','outputs/si183')];
const load=run=>run.split(',').flatMap(label=>{const file=dirs.map(d=>path.join(d,label+'.json')).find(fs.existsSync);if(!file)throw Error('missing '+label);return JSON.parse(fs.readFileSync(file,'utf8')).matches;}).filter(r=>r.finished&&!r.engineError&&!r.stall);
const key=r=>`${r.seed}|${r.clubId}|${r.size}`,A=new Map(load(runs[0]).map(r=>[key(r),r])),B=new Map(load(runs[1]).map(r=>[key(r),r]));
const pairs=[...A.keys()].filter(k=>B.has(k)).map(k=>[A.get(k),B.get(k)]);
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length,se=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length);};
const goals=r=>r.score[0]+r.score[1],shots=r=>r.teams[0].stats.shots+r.teams[1].stats.shots,on=r=>r.teams[0].stats.onTarget+r.teams[1].stats.onTarget;
const points=(r,t)=>r.score[t]>r.score[1-t]?3:r.score[t]===r.score[1-t]?1:0;
const at60=r=>{const s=[0,0];for(const g of r.rec.goals)if(g.at<50)s[g.team]++;return s;};
const fav=(r,gap)=>{const d=r.teams[0].ovr-r.teams[1].ovr;if(Math.abs(d)<gap)return null;const t=d>0?0:1;return r.score[t]>r.score[1-t]?1:0;};
function side(rows){
 const draws=rows.map(r=>r.score[0]===r.score[1]?1:0),f1=rows.map(r=>fav(r,1)).filter(x=>x!==null),f3=rows.map(r=>fav(r,3)).filter(x=>x!==null);
 const trail={ai:[],user:[]},lead={ai:[],user:[]};
 for(const r of rows){const s=at60(r);if(s[0]===s[1])continue;const behind=s[0]<s[1]?0:1;trail[behind===1?'ai':'user'].push(points(r,behind));lead[behind===1?'user':'ai'].push(points(r,1-behind));}
 return{n:rows.length,goals:[mean(rows.map(goals)),se(rows.map(goals))],shots:[mean(rows.map(shots)),se(rows.map(shots))],onTarget:[mean(rows.map(on)),se(rows.map(on))],draws:[100*mean(draws),100*se(draws)],fav1:[100*mean(f1),100*se(f1),f1.length],fav3:[100*mean(f3),100*se(f3),f3.length],
  aiPoints:[mean(rows.map(r=>points(r,1))),se(rows.map(r=>points(r,1)))],trailAi:[mean(trail.ai),se(trail.ai),trail.ai.length],trailUser:[mean(trail.user),se(trail.user),trail.user.length],leadAi:[mean(lead.ai),se(lead.ai),lead.ai.length],leadUser:[mean(lead.user),se(lead.user),lead.user.length],
  trailPointsShare:[100*mean([...trail.ai,...trail.user].map(p=>p>0?1:0)),[...trail.ai,...trail.user].length]};
}
const diff=f=>{const d=pairs.map(([a,b])=>f(a)-f(b));return[mean(d),se(d)];};
const coach=pairs.map(([a])=>a.extras?.aiCoach).filter(Boolean),reasons={},kinds={tactics:0,sub:0};
for(const c of coach)for(const e of c.log){kinds[e.kind]++;if(e.kind==='tactics')reasons[e.why]=(reasons[e.why]||0)+1;else reasons['sub:'+e.why]=(reasons['sub:'+e.why]||0)+1;}
const out={labels:runs,pairs:pairs.length,run:side(pairs.map(p=>p[0])),base:side(pairs.map(p=>p[1])),paired:{goals:diff(goals),shots:diff(shots),onTarget:diff(on),aiPoints:diff(r=>points(r,1))},
 coach:coach.length?{matches:coach.length,marked:coach.filter(c=>c.revision===185).length,tacticChangesPerMatch:kinds.tactics/coach.length,subsPerMatch:kinds.sub/coach.length,reasons}:null};
for(const size of ['standard','large']){const p=pairs.filter(([a])=>a.size===size);out[size]={run:side(p.map(x=>x[0])),base:side(p.map(x=>x[1]))};}
if(args.includes('--json')){console.log(JSON.stringify(out,null,1));process.exit(0);}
const f=(v,d=2)=>Number.isFinite(v)?v.toFixed(d):'–',pm=(v,d=2)=>`${f(v[0],d)} ± ${f(v[1],d)}${v[2]!==undefined?` (n ${v[2]})`:''}`;
const rows=[['Tore je Partie','goals',2],['Schüsse je Partie','shots',2],['Aufs Tor je Partie','onTarget',2],['Remis %','draws',1],['Favorit gewinnt % (≥ 1)','fav1',1],['Favorit gewinnt % (≥ 3)','fav3',1],['Punkte KI-Seite','aiPoints',2],['Punkte bei Rückstand 60′ – KI','trailAi',2],['Punkte bei Rückstand 60′ – Nutzer','trailUser',2],['Punkte bei Führung 60′ – KI','leadAi',2],['Punkte bei Führung 60′ – Nutzer','leadUser',2]];
for(const [title,block] of [['beide Felder',out],['Standardfeld',out.standard],['großes Feld',out.large]]){
 console.log(`\n### ${title}\n\n| Kennzahl | ${runs[0]} | ${runs[1]} |\n| --- | ---: | ---: |\n| Partien | ${block.run.n} | ${block.base.n} |`);
 for(const [name,k,d] of rows)console.log(`| ${name} | ${pm(block.run[k],d)} | ${pm(block.base[k],d)} |`);
 console.log(`| Rückstand 60′: Punkte geholt % | ${f(block.run.trailPointsShare[0],1)} (n ${block.run.trailPointsShare[1]}) | ${f(block.base.trailPointsShare[0],1)} (n ${block.base.trailPointsShare[1]}) |`);
}
console.log(`\nGepaart (${out.pairs}): Tore ${pm(out.paired.goals)}, Schüsse ${pm(out.paired.shots)}, aufs Tor ${pm(out.paired.onTarget)}, Punkte KI ${pm(out.paired.aiPoints)}`);
if(out.coach)console.log(`KI-Trainer: ${out.coach.marked}/${out.coach.matches} markiert, ${f(out.coach.tacticChangesPerMatch)} Umstellungen und ${f(out.coach.subsPerMatch)} Wechsel je Partie; Gründe ${JSON.stringify(out.coach.reasons)}`);
