'use strict';
// AI coach 185: table of a replay (outputs/ai-coach-v185/<label>.json, work/replay-ai-coach-v185.cjs), off (v64AiAdjust)
// against on (marker 185), paired per job. Subsets: league (a + b), a (similar strength), b-fav (AI favourite),
// b-out (AI outsider), c (cup, AI = cup club; separate), p (the 192 browser fixtures of bp-h / bp-hl; their off runs are
// compared with the browser series bp-h + bp-hl, their on runs with aic-b, as a fidelity check of the replay). Per subset: goals, shots, draws, favourite wins at a gap of
// >= 1 / >= 3 skill points (actual starters), AI points after trailing at state minute 60, AI tactic changes and
// substitutions per match, share of tactic changes reverted within 10 minutes (flip-flops) and, for the league,
// the reaction by coach stage (Gegneranpassung 1-5).
// Usage: node work/table-ai-coach-replay-v185.cjs <label> [--json]
const fs=require('node:fs'),path=require('node:path');
const label=process.argv[2];if(!label){console.error('Usage: node work/table-ai-coach-replay-v185.cjs <label> [--json]');process.exit(2);}
const data=JSON.parse(fs.readFileSync(path.resolve(__dirname,'..','outputs/ai-coach-v185',label+'.json'),'utf8'));
const byJob=new Map();for(const r of data.rows){if(!r.finished)throw Error('unfinished '+r.id);(byJob.get(r.id)||byJob.set(r.id,{}).get(r.id))[r.on?'on':'off']=r;}
const pairs=[...byJob.values()].filter(p=>p.off&&p.on);
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN,se=a=>{if(a.length<2)return NaN;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length);};
const goals=r=>r.teams[0].score+r.teams[1].score,shots=r=>r.teams[0].shots+r.teams[1].shots;
const ai=r=>r.teams.find(t=>t.side===r.aiSide),user=r=>r.teams.find(t=>t.side!==r.aiSide);
const points=(own,other)=>own.score>other.score?3:own.score===other.score?1:0,aiPoints=r=>points(ai(r),user(r));
const fav=(r,gap)=>{const [x,y]=r.teams;if(Math.abs(x.ovr-y.ovr)<gap)return null;const f=x.ovr>y.ovr?x:y,o=f===x?y:x;return f.score>o.score?1:0;};
const at60=r=>{const s={ai:0,user:0};for(const [minute,side] of r.goals)if(minute<60)s[side===r.aiSide?'ai':'user']++;return s;};
// Tactic changes of the AI side as key changes (last snapshot per minute); flip-flop = reverted to the previous value within 10 minutes.
function keyChanges(r){
 const keys=['formation','pressing','passing','defense','aggression'],perMinute=new Map();for(const [minute,tactics] of r.changes)perMinute.set(minute,tactics);
 let prev=r.base;const out=[];for(const [minute,t] of perMinute){for(const k of keys)if(t[k]!==prev[k])out.push({k,from:prev[k],to:t[k],minute});prev=t;}
 for(const [i,c] of out.entries())c.flip=out.slice(i+1).some(d=>d.k===c.k&&d.minute<=c.minute+10&&d.to===c.from);
 return out;
}
const changeMinutes=r=>new Set(r.changes.map(c=>c[0])).size,aiSubs=r=>r.subs.filter(s=>s[1]===r.aiSide).length;
function side(rows){
 const draws=rows.map(r=>r.teams[0].score===r.teams[1].score?1:0),f1=rows.map(r=>fav(r,1)).filter(x=>x!==null),f3=rows.map(r=>fav(r,3)).filter(x=>x!==null);
 const trailing=rows.filter(r=>{const s=at60(r);return s.ai<s.user;}),changes=rows.flatMap(keyChanges);
 return{n:rows.length,goals:[mean(rows.map(goals)),se(rows.map(goals))],shots:[mean(rows.map(shots)),se(rows.map(shots))],draws:[100*mean(draws),100*se(draws)],
  fav1:[100*mean(f1),100*se(f1),f1.length],fav3:[100*mean(f3),100*se(f3),f3.length],aiPoints:[mean(rows.map(aiPoints)),se(rows.map(aiPoints))],
  comeback:[mean(trailing.map(aiPoints)),se(trailing.map(aiPoints)),trailing.length],comebackShare:[100*mean(trailing.map(r=>aiPoints(r)>0?1:0)),trailing.length],
  changes:mean(rows.map(changeMinutes)),subs:mean(rows.map(aiSubs)),flip:[changes.filter(c=>c.flip).length,changes.length]};
}
const diff=(rows,f)=>{const d=rows.map(p=>f(p.on)-f(p.off));return[mean(d),se(d)];};
function subset(filter){const p=pairs.filter(x=>filter(x.on));return{off:side(p.map(x=>x.off)),on:side(p.map(x=>x.on)),paired:{goals:diff(p,goals),shots:diff(p,shots),aiPoints:diff(p,aiPoints)}};}
// Reaction by coach stage (league, on): first AI tactic change after falling behind (minutes), changes per match, pressure answers.
function stages(rows){
 const out={};for(const q of [1,2,3,4,5]){const s=rows.filter(r=>r.adaptation===q);if(!s.length)continue;
  const delays=[];for(const r of s){let ai=0,user=0,behindAt=null;for(const [minute,sd] of r.goals){sd===r.aiSide?ai++:user++;if(ai<user&&behindAt===null)behindAt=minute;if(ai>=user)behindAt=null;}
   const first=r.log.find(e=>e.kind==='tactics'&&behindAt!==null&&e.minute>=behindAt&&e.why==='trail');if(first)delays.push(first.minute-behindAt);}
  const tactics=s.flatMap(r=>r.log.filter(e=>e.kind==='tactics'));
  out[q]={matches:s.length,changes:mean(s.map(changeMinutes)),pressure:mean(s.map(r=>r.log.filter(e=>e.kind==='tactics'&&(e.why==='pressure'||e.why==='protect')).length)),trailDelay:[mean(delays),delays.length],firstPressureMinute:mean(s.map(r=>r.log.find(e=>e.why==='pressure')?.minute).filter(Number.isFinite)),reasons:tactics.reduce((m,e)=>(m[e.why]=(m[e.why]||0)+1,m),{})};}
 return out;
}
const league=x=>['a','b-fav','b-out'].includes(x.set);
const out={label,pairs:pairs.length,sets:{league:subset(league),a:subset(x=>x.set==='a'),'b-fav':subset(x=>x.set==='b-fav'),'b-out':subset(x=>x.set==='b-out'),c:subset(x=>x.set==='c'),p:subset(x=>x.set==='p')},named:pairs.filter(p=>p.on.set==='p'&&p.on.kind!=='p').map(p=>({id:p.on.id,kind:p.on.kind,ai:ai(p.on).clubId,ovr:[user(p.on).ovr,ai(p.on).ovr],off:[user(p.off).score,ai(p.off).score],on:[user(p.on).score,ai(p.on).score],log:p.on.log.map(e=>e.minute+' '+(e.kind==='sub'?'Wechsel ':'')+e.why)})),
 sizes:{standard:subset(x=>league(x)&&x.size==='standard'),large:subset(x=>league(x)&&x.size==='large')},stages:stages(pairs.map(p=>p.on).filter(league)),stagesOff:stages(pairs.map(p=>p.off).filter(league))};
// Browser reference for set p (same fixtures): bp-h + bp-hl (without marker) and aic-b (with marker).
const browser=(...labels)=>{const dir=[path.resolve(__dirname,'..','outputs/si183'),path.resolve(__dirname,'..','..','ball-physics','outputs/si183')];const rows=labels.flatMap(l=>{const file=dir.map(d=>path.join(d,l+'.json')).find(fs.existsSync);return file?JSON.parse(fs.readFileSync(file,'utf8')).matches.filter(m=>m.finished):[];});if(!rows.length)return null;const g=rows.map(m=>m.score[0]+m.score[1]),sh=rows.map(m=>m.teams[0].stats.shots+m.teams[1].stats.shots),d=rows.map(m=>m.score[0]===m.score[1]?1:0);return{n:rows.length,goals:[mean(g),se(g)],shots:[mean(sh),se(sh)],draws:[100*mean(d),100*se(d)]};};
out.browser={off:browser('bp-h-trace40000','bp-hl-trace40000'),on:browser('aic-b-trace40000')};
if(process.argv.includes('--json')){console.log(JSON.stringify(out,null,1));process.exit(0);}
const f=(v,d=2)=>Number.isFinite(v)?v.toFixed(d):'–',pm=(v,d=2)=>`${f(v[0],d)} ± ${f(v[1],d)}${v[2]!==undefined?` (n ${v[2]})`:''}`;
const names={league:'Liga gesamt (a + b)',a:'(a) ähnliche Stärke',['b-fav']:'(b) KI Favorit',['b-out']:'(b) KI Außenseiter',c:'(c) Pokal, KI = Pokalverein (getrennt)',p:'(p) die 192 Browser-Fixtures (bp-h/bp-hl, Treueprüfung)'};
for(const [key,s] of [...Object.entries(out.sets),['Standardfeld (Liga)',out.sizes.standard],['großes Feld (Liga)',out.sizes.large]]){
 console.log(`\n### ${names[key]||key}\n\n| Kennzahl | ohne 185 | mit 185 | gepaart |\n| --- | ---: | ---: | ---: |\n| Partien | ${s.off.n} | ${s.on.n} | |`);
 console.log(`| Tore | ${pm(s.off.goals)} | ${pm(s.on.goals)} | ${pm(s.paired.goals)} |\n| Schüsse | ${pm(s.off.shots)} | ${pm(s.on.shots)} | ${pm(s.paired.shots)} |\n| Remis % | ${pm(s.off.draws,1)} | ${pm(s.on.draws,1)} | |`);
 console.log(`| Favorit ≥ 1 % | ${pm(s.off.fav1,1)} | ${pm(s.on.fav1,1)} | |\n| Favorit ≥ 3 % | ${pm(s.off.fav3,1)} | ${pm(s.on.fav3,1)} | |\n| Punkte KI | ${pm(s.off.aiPoints)} | ${pm(s.on.aiPoints)} | ${pm(s.paired.aiPoints)} |`);
 console.log(`| Punkte KI nach Rückstand 60′ | ${pm(s.off.comeback)} | ${pm(s.on.comeback)} | |\n| KI holt nach Rückstand 60′ Punkte % | ${f(s.off.comebackShare[0],1)} | ${f(s.on.comebackShare[0],1)} | |`);
 console.log(`| Umstellungen je Partie | ${f(s.off.changes)} | ${f(s.on.changes)} | |\n| Wechsel je Partie (KI) | ${f(s.off.subs)} | ${f(s.on.subs)} | |\n| Hin und her (≤ 10 min zurück) | ${s.off.flip[0]}/${s.off.flip[1]} (${f(100*s.off.flip[0]/s.off.flip[1],1)} %) | ${s.on.flip[0]}/${s.on.flip[1]} (${f(100*s.on.flip[0]/s.on.flip[1],1)} %) | |`);
}
console.log('\n### Reaktion nach Trainerstufe (Liga, mit 185)\n\n| Stufe | Partien | Umstellungen je Partie | Druck-/Sicherungsantworten je Partie | erste Druckreaktion (Minute) | Rückstand → erste Umstellung (min, n) | Gründe |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |');
for(const [q,s] of Object.entries(out.stages))console.log(`| ${q} | ${s.matches} | ${f(s.changes)} | ${f(s.pressure)} | ${f(s.firstPressureMinute,1)} | ${f(s.trailDelay[0],1)} (${s.trailDelay[1]}) | ${JSON.stringify(s.reasons)} |`);
if(out.browser.off)console.log(`
### Treue: Replay (p) gegen Browser auf denselben Fixtures

| Kennzahl | Replay ohne 185 | Browser ohne 185 (bp-h/bp-hl) | Replay mit 185 | Browser mit 185 (aic-b) |
| --- | ---: | ---: | ---: | ---: |
| Partien | ${out.sets.p.off.n} | ${out.browser.off.n} | ${out.sets.p.on.n} | ${out.browser.on?.n??'–'} |
| Tore | ${pm(out.sets.p.off.goals)} | ${pm(out.browser.off.goals)} | ${pm(out.sets.p.on.goals)} | ${out.browser.on?pm(out.browser.on.goals):'–'} |
| Schüsse | ${pm(out.sets.p.off.shots)} | ${pm(out.browser.off.shots)} | ${pm(out.sets.p.on.shots)} | ${out.browser.on?pm(out.browser.on.shots):'–'} |
| Remis % | ${pm(out.sets.p.off.draws,1)} | ${pm(out.browser.off.draws,1)} | ${pm(out.sets.p.on.draws,1)} | ${out.browser.on?pm(out.browser.on.draws,1):'–'} |`);
console.log(`
### Benannte Ligapaarungen (Review, Standardfeld, eigener Verein – KI)

| Paarung | Art | Stärke eigen/KI | ohne 185 | mit 185 | KI-Entscheidungen mit 185 |
| --- | --- | ---: | ---: | ---: | --- |`);
for(const n of out.named)console.log(`| ${n.id.split(':')[2]} – ${n.ai} | ${n.kind} | ${n.ovr.join(' / ')} | ${n.off.join(':')} | ${n.on.join(':')} | ${n.log.join(', ')||'–'} |`);
