'use strict';
// SI-K calibration aid for step (a): evaluates the SI-3 placement/keeper model
// (the actual dist functions v183FinishPlan in the native VM harness) on the
// exactly traced shot situations of measure-si-calibration-v183 result files
// (extras.sik.finishTrace, run with --traceLimit). No draws: expected goals
// per shot = mean of plan.xg over the unblocked traced shots (the block draw of
// the run is kept), expected on-target likewise. Groups as in the SI-K table:
// finishing (fin <10 / 10-14 / >=14, open play), keeper (gk 10-14 / >=14, goals
// per on-target shot), long shots (>22 m, fin >=14), headers.
// First-order only: a different model also changes which shots SI-1 takes.
// Usage: node work/calibrate-si-k-finish-v183.cjs <label[,label]> [--params=JSON] [--params=JSON ...]
const fs=require('node:fs'),path=require('node:path');
const {create}=require('./native183-scenes.cjs');
const args=process.argv.slice(2),labels=(args.find(a=>!a.startsWith('--'))||'').split(',').filter(Boolean);
const variants=args.filter(a=>a.startsWith('--params=')).map(a=>JSON.parse(a.slice(9)));if(!variants.length)variants.push({});
const shots=[];
for(const label of labels){const rep=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../outputs/si183',label+'.json'),'utf8'));
 for(const m of rep.matches){if(!m.finished||!m.extras?.sik?.finishTrace)continue;
  const traced=m.extras.sik.finishTrace.filter(e=>e.type==='finish.shot'),records=m.rec.shots.filter(s=>!s.penalty);
  if(traced.length!==records.length){console.error(`skip ${m.clubId} ${m.size}: trace ${traced.length} vs shots ${records.length}`);continue;}
  records.forEach((s,i)=>{const e=traced[i];if(e.kind!==s.kind)throw Error('kind mismatch');shots.push({kind:s.kind,size:m.size,result:s.result,goal:s.result==='goal',blocked:e.blocked,fin:s.skills.fin,gk:s.skills.gk,range:s.range,open:s.kind!=='direct-free-kick',xg0:e.xg,sit:e.sit});});}}
const h=create({view:false});
h.run(`globalThis.__sik=function(overrides,list){
 const P=Object.freeze({...v183RegisterDefaults('finish',{}),...overrides});
 return list.map(s=>{const sit=s.sit,kind=sit.kind,speed=overrides.__keepSpeed?sit.speed:kind==='header'?P.headerBase+P.headerAir*(sit.air??10):sit.speed;
  const plan=v183FinishPlan(P,{...sit,speed});return [plan.xg,plan.on];});
};`,'sik-finish');
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN,pc=x=>Number.isFinite(x)?(100*x).toFixed(1):'–';
const sits=shots.map(s=>({sit:s.sit}));
const rows=[];
for(const v of variants){
 const res=h.copy(h.evaluate(`__sik(${JSON.stringify({...v,__keepSpeed:true})},${JSON.stringify(sits)})`));
 const ev=shots.map((s,i)=>({...s,xg:s.blocked?0:res[i][0],on:s.blocked?0:res[i][1]}));
 const g=(list,f=x=>x.xg)=>({n:list.length,p:mean(list.map(f))});
 const open=ev.filter(s=>s.open),band=(l,lo,hi)=>l.filter(s=>s.fin>=lo&&s.fin<hi);
 const low=g(band(open,0,10)),high=g(band(open,14,99)),gkMid=ev.filter(s=>s.gk>=10&&s.gk<14),gkHigh=ev.filter(s=>s.gk>=14);
 const perOn=l=>{const on=l.reduce((a,s)=>a+s.on,0),go=l.reduce((a,s)=>a+s.xg,0);return on?go/on:NaN;};
 const far=open.filter(s=>s.range>22);
 rows.push({params:JSON.stringify(v),n:ev.length,goalPerShot:pc(mean(ev.map(s=>s.xg))),actual:pc(mean(shots.map(s=>s.goal?1:0))),onTarget:pc(mean(ev.map(s=>s.on))),
  ratio:(high.p/low.p).toFixed(2),keeperGap:pc(perOn(gkMid)-perOn(gkHigh)),longHigh:pc(g(band(far,14,99)).p),longAll:pc(g(far).p),near:pc(g(open.filter(s=>s.range<=14)).p),header:pc(g(ev.filter(s=>s.kind==='header')).p),headerActual:pc(mean(shots.filter(s=>s.kind==='header').map(s=>s.goal?1:0)))});
}
console.table(rows);
