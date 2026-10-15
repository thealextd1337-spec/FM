'use strict';
// SI-3 (finishing and goalkeeper) criteria from measure-si183.cjs result files.
// Usage: node work/table-si-finish-v183.cjs <base> <variant> [--size=standard|large] [--json]
//   <base>/<variant>: labels in outputs/si183/ (without .json) or paths to result files.
// Per-match means with paired differences (club|size, 95 % interval), shot
// quality by finishing and keeper groups (raw stored values 1-20), long shots,
// direct free kicks, saves, corners and the favourite share. Parries out of
// play (corners after saves) come from the finish trace (finish.parry with
// out:true) when the result file carries it (harness copy with trace export);
// otherwise the paired corner difference is the measure.
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../outputs/si183');
const args=process.argv.slice(2),sizeFilter=(args.find(a=>a.startsWith('--size='))||'').slice(7)||null,json=args.includes('--json'),names=args.filter(a=>!a.startsWith('--'));
const load=v=>{const file=fs.existsSync(v)?v:path.join(dir,v+'.json'),r=JSON.parse(fs.readFileSync(file,'utf8'));r.label=v;r.excluded=r.matches.filter(m=>!m.finished).length+r.failures.length;r.matches=r.matches.filter(m=>m.finished&&!m.engineError&&(!sizeFilter||m.size===sizeFilter));return r;};
const total=(r,k)=>r.teams[0].stats[k]+r.teams[1].stats[k];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN,pct=(a,b)=>b?100*a/b:NaN;
const key=r=>r.clubId+'|'+r.size;
const isGoal=s=>s.result==='goal'||s.goal===true;
const onT=s=>s.plannedOnTarget||s.actualOnTarget||['goal','caught','parried'].includes(s.result);
const open=s=>!s.penalty&&s.kind!=='direct-free-kick';
const fin=s=>s.skills?.fin??NaN,gkOf=(r,s)=>r.teams[1-s.team]?.gk??NaN;
const perMatch={
 minutes:r=>r.realSeconds/60,shots:r=>total(r,'shots'),onTarget:r=>total(r,'onTarget'),goals:r=>r.score[0]+r.score[1],saves:r=>total(r,'saves'),
 caught:r=>total(r,'savesCaught'),parried:r=>total(r,'savesParried'),corners:r=>r.extras.corners,parryOut:r=>r.finishTrace?r.finishTrace.filter(e=>e.type==='finish.parry'&&e.out).length:NaN,rebounds:r=>r.extras.rebounds,
 directFk:r=>r.rec.shots.filter(s=>s.kind==='direct-free-kick').length,freeKicks:r=>r.extras.freeKicks,blocked:r=>r.rec.shots.filter(s=>s.result==='blocked'||s.result==='unreached-block').length
};
const rate=(shots,pred=isGoal)=>({n:shots.length,pct:pct(shots.filter(pred).length,shots.length)});
const strength=rows=>{const xs=[],ys=[];for(const r of rows)for(const i of [0,1]){xs.push(r.teams[i].ovr-r.teams[1-i].ovr);ys.push(r.teams[i].score-r.teams[1-i].score);}const mx=mean(xs),my=mean(ys);let a=0,b=0;for(let i=0;i<xs.length;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;}return b?a/b:NaN;};
const fav=(rows,gap)=>{const g=rows.filter(r=>Math.abs(r.teams[0].ovr-r.teams[1].ovr)>=gap);const w=g.filter(r=>{const s=r.teams[0].ovr>r.teams[1].ovr?0:1;return r.score[s]>r.score[1-s];}).length;return {n:g.length,win:pct(w,g.length)};};
function summary(rep){
 const rows=rep.matches;
 const all=rows.flatMap(r=>r.rec.shots.map(s=>({...s,__gk:gkOf(r,s)}))),play=all.filter(open),stats={};
 for(const [k,f]of Object.entries(perMatch))stats[k]=mean(rows.map(f));
 const groups=(list,lo,hi)=>list.filter(s=>fin(s)>=lo&&fin(s)<hi);
 const low=rate(groups(play,0,10)),mid=rate(groups(play,10,14)),high=rate(groups(play,14,99));
 const near=s=>s.range<=14,midR=s=>s.range>14&&s.range<=22,far=s=>s.range>22;
 const onTarget=all.filter(onT),gkMid=onTarget.filter(s=>s.__gk>=10&&s.__gk<14),gkHigh=onTarget.filter(s=>s.__gk>=14);
 return {label:rep.label,n:rows.length,excluded:rep.excluded,perMatch:stats,
  shots:{all:all.length,onTargetPct:pct(onTarget.length,all.length),goalPerShot:rate(all).pct,goalPerOnTarget:rate(onTarget).pct,openGoalPerShot:rate(play).pct,
   savedParriedPct:pct(all.filter(s=>s.result==='parried').length,all.filter(s=>['caught','parried'].includes(s.result)).length)},
  finishing:{low,mid,high,ratio:high.pct/low.pct,
   near:{low:rate(groups(play.filter(near),0,10)),mid:rate(groups(play.filter(near),10,14)),high:rate(groups(play.filter(near),14,99))},
   middle:{low:rate(groups(play.filter(midR),0,10)),mid:rate(groups(play.filter(midR),10,14)),high:rate(groups(play.filter(midR),14,99))},
   long:{mid:rate(groups(play.filter(far),10,14)),high:rate(groups(play.filter(far),14,99)),highOnTarget:rate(groups(play.filter(far),14,99),onT),share:pct(play.filter(far).length,play.length)}},
  keeper:{mid:rate(gkMid),high:rate(gkHigh),gap:rate(gkMid).pct-rate(gkHigh).pct},
  directFk:rate(all.filter(s=>s.kind==='direct-free-kick')),
  favourite1:fav(rows,1),favourite2:fav(rows,2),goalDiffPerPoint:strength(rows)};
}
// Paired per-match differences (variant - base) with a 95 % normal interval.
function paired(a,b){
 const mapB=new Map(b.matches.map(r=>[key(r),r])),pairs=a.matches.filter(r=>mapB.has(key(r))).map(r=>[r,mapB.get(key(r))]),out={pairs:pairs.length};
 for(const [k,f]of Object.entries(perMatch)){const d=pairs.map(([x,y])=>f(y)-f(x)),m=mean(d),sd=Math.sqrt(mean(d.map(v=>(v-m)**2))*d.length/Math.max(1,d.length-1));out[k]={delta:m,ci95:1.96*sd/Math.sqrt(Math.max(1,d.length))};}
 return out;
}
const reps=names.map(load),sums=reps.map(summary),result={size:sizeFilter||'both',summaries:sums,paired:reps.length>1?paired(reps[0],reps[1]):null};
if(json){console.log(JSON.stringify(result,null,1));return;}
const f=(x,d=2)=>Number.isFinite(x)?x.toFixed(d).replace('.',','):'–',g=r=>`${f(r.pct,0)} % (${r.n})`;
const lines=[`| Kennzahl | ${sums.map(s=>s.label).join(' | ')} |`,`| --- | ${sums.map(()=>'---:').join(' | ')} |`];
const row=(name,fn)=>lines.push(`| ${name} | ${sums.map(fn).join(' | ')} |`);
row('Partien',s=>s.n);
for(const k of Object.keys(perMatch))row(k,s=>f(s.perMatch[k]));
row('aufs Tor % der Schüsse',s=>f(s.shots.onTargetPct,1));row('Tore je Schuss %',s=>f(s.shots.goalPerShot,1));row('Tore je Schuss aufs Tor %',s=>f(s.shots.goalPerOnTarget,1));row('Spielzug: Tore je Schuss %',s=>f(s.shots.openGoalPerShot,1));row('Paraden: abgewehrt %',s=>f(s.shots.savedParriedPct,0));
row('Abschluss <10 / 10–14 / ≥14',s=>`${g(s.finishing.low)} / ${g(s.finishing.mid)} / ${g(s.finishing.high)}`);row('Verhältnis ≥14 / <10',s=>f(s.finishing.ratio,2));
row('≤14 m: <10 / 10–14 / ≥14',s=>`${g(s.finishing.near.low)} / ${g(s.finishing.near.mid)} / ${g(s.finishing.near.high)}`);
row('14–22 m: <10 / 10–14 / ≥14',s=>`${g(s.finishing.middle.low)} / ${g(s.finishing.middle.mid)} / ${g(s.finishing.middle.high)}`);
row('>22 m: 10–14 / ≥14 (≥14 aufs Tor)',s=>`${g(s.finishing.long.mid)} / ${g(s.finishing.long.high)} (${f(s.finishing.long.highOnTarget.pct,0)} %)`);
row('Torwart 10–14 / ≥14 (Tore je Schuss aufs Tor), Abstand',s=>`${g(s.keeper.mid)} / ${g(s.keeper.high)}, ${f(s.keeper.gap,1)}`);
row('direkte Freistöße: Tore je Schuss',s=>g(s.directFk));
row('Favoriten ≥1 / ≥2 Punkte',s=>`${f(s.favourite1.win,0)} % (${s.favourite1.n}) / ${f(s.favourite2.win,0)} % (${s.favourite2.n})`);
row('Tordifferenz je Stärkepunkt',s=>f(s.goalDiffPerPoint,2));
console.log(lines.join('\n'));
if(result.paired){console.log(`\nGepaart (${result.paired.pairs} Paare, ${sums[1].label} − ${sums[0].label}):`);for(const k of Object.keys(perMatch))console.log(`  ${k}: ${f(result.paired[k].delta)} ±${f(result.paired[k].ci95)}`);}
