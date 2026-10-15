'use strict';
// SI-3 calibration aid: evaluates the placement/keeper model of
// dist/match-si-finish-v183.js (the actual module functions in the native VM
// harness) on the recorded shot situations of a measurement file, without
// draws. Expected on-target, goal and save shares per finishing/keeper group
// and synthetic long shots. With a finish trace in the result file (a run with
// the finish package whose rows carry finishTrace) the exact traced situations
// are used. Otherwise situations are reconstructed from the shot records
// (shooter lateral/depth, keeper distance and distance off the line, nearest
// rival, rivals within 2.5 m, effective fin/tec, opposing keeper's stored gk);
// unrecorded inputs use neutral values (calm/dec 10, keeper spd 10, no turn).
// Usage: node work/calibrate-si-finish-v183.cjs <result label|file> [--params=JSON] [--json]
const fs=require('node:fs'),path=require('node:path');
const {create}=require('./native183-scenes.cjs');
const args=process.argv.slice(2),label=args.find(a=>!a.startsWith('--'))||'sif-base-r042',json=args.includes('--json');
const overrides=JSON.parse((args.find(a=>a.startsWith('--params='))||'--params={}').slice(9));
const file=fs.existsSync(label)?label:path.resolve(__dirname,'../outputs/si183',label+'.json');
const rep=JSON.parse(fs.readFileSync(file,'utf8'));
const shots=[];
for(const m of rep.matches)if(m.finished&&m.finishTrace){
 const traced=m.finishTrace.filter(e=>e.type==='finish.shot'),records=m.rec.shots.filter(s=>!s.penalty);
 if(traced.length!==records.length)throw Error(`trace/record mismatch ${m.clubId} ${m.size}: ${traced.length} vs ${records.length}`);
 records.forEach((s,i)=>{const e=traced[i];if(e.kind!==s.kind)throw Error('kind mismatch');shots.push({kind:s.kind,oneTouch:e.sit.oneTouch,result:s.result,blocked:s.result==='blocked'||s.result==='unreached-block',fin:s.skills.fin,gk:m.teams[1-s.team].gk,range:s.range,sit:e.sit});});
}else if(m.finished)for(const s of m.rec.shots){if(s.penalty)continue;
 const ds=s.depth,ls=s.lateral,dk=Math.min(s.keeperOffLine??2,ds),kd=s.keeperDist??Math.hypot(ls,ds-dk),off=Math.sqrt(Math.max(0,kd*kd-(ds-dk)*(ds-dk))),line=ls*dk/Math.max(.1,ds),cands=[ls-off,ls+off],kl=cands.sort((a,b)=>Math.abs(a-line)-Math.abs(b-line))[0];
 const pressure=s.n25>0?Math.max(0,1-s.nearest/2.5)+(s.n25-1)*.35:0;
 shots.push({kind:s.kind,oneTouch:!!s.direct,result:s.result,blocked:s.result==='blocked'||s.result==='unreached-block',fin:s.skills.fin,gk:m.teams[1-s.team].gk,range:s.range,
  sit:{kind:s.kind,oneTouch:!!s.direct,from:{lat:ls,depth:ds},range:s.range,h0:s.kind==='header'?1.9:s.kind==='volley'?.7:.29,skill:s.kind==='header'?s.skills.effFin*.45+s.skills.air*.4+s.skills.effTec*.15:s.direct||s.kind==='volley'||s.kind==='direct-free-kick'?s.skills.effFin*.7+s.skills.effTec*.3:s.skills.effFin*.8+s.skills.effTec*.2,
   calm:10,dec:10,pressure,turn:0,speedFin:s.skills.effFin,speedTec:s.skills.effTec,keeper:{lat:kl,depth:dk,gk:m.teams[1-s.team].gk,spd:10,hands:true}}});}
const h=create({view:false});
h.run(`globalThis.__si3cal=function(overrides,list){
 const P=Object.freeze({...v183RegisterDefaults('finish',{}),...overrides}),goal={half:44*.2/(v55Field.right-v55Field.left)/2-.1764,top:44*.2/(v55Field.right-v55Field.left)/3-.1764,width:44*.2/(v55Field.right-v55Field.left),height:44*.2/(v55Field.right-v55Field.left)/3,radius:.1764};
 return list.map(item=>{const s=item,kind=s.kind,speed=Number.isFinite(s.speed)?s.speed:kind==='header'?P.headerBase+P.headerAir*10:(P.speedBase+P.speedFin*s.speedFin+P.speedTec*s.speedTec)*(kind==='volley'?P.volleySpeed:kind==='direct-free-kick'?P.fkSpeed:1);
  const plan=v183FinishPlan(P,{...s,speed,goal:s.goal||goal}),parry=plan.aims.reduce((a,x)=>a+x.w*(x.on-x.p),0);
  return {on:plan.on,goal:plan.xg,save:parry,sx:plan.spread.x,sh:plan.spread.h};});
};`,'si3-calibration');
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN,pc=x=>+(100*x).toFixed(1);
const defaults=h.copy(h.evaluate("v183RegisterDefaults('finish',{})"));
// Synthetic long shots (24 m, lateral 0/4/8 m, keeper on the shot line 2 m out, gk 12.7).
const synth=[];for(const fin of [9,12,15,17])for(const lat of [0,4,8]){const d=Math.sqrt(24*24-lat*lat);synth.push({fin,lat,sit:{kind:'shot',oneTouch:false,from:{lat,depth:d},range:24,h0:.29,skill:fin,calm:10,dec:10,pressure:0,turn:0,speedFin:fin,speedTec:fin,keeper:{lat:lat*2/d,depth:2,gk:12.7,spd:10,hands:true}}});}
function evaluate(overrides){
 const res=h.copy(h.call('__si3cal',overrides,shots.map(s=>s.sit).concat(synth.map(s=>s.sit))));
 shots.forEach((s,i)=>Object.assign(s,res[i]));synth.forEach((s,i)=>Object.assign(s,res[shots.length+i]));
 const agg=list=>{const live=list.map(s=>s.blocked?{on:0,goal:0,save:0}:s);return {n:list.length,on:pc(mean(live.map(s=>s.on))),goal:pc(mean(live.map(s=>s.goal))),save:pc(mean(live.map(s=>s.save))),goalPerOn:pc(mean(live.map(s=>s.goal))/mean(live.map(s=>s.on)))};};
 const open=shots.filter(s=>s.kind!=='direct-free-kick'),by=(list,lo,hi)=>list.filter(s=>s.fin>=lo&&s.fin<hi);
 const near=open.filter(s=>s.range<=14),mid=open.filter(s=>s.range>14);
 const groups={shots:shots.length,all:agg(shots),open:agg(open),fk:agg(shots.filter(s=>s.kind==='direct-free-kick')),
  fin:{low:agg(by(open,0,10)),mid:agg(by(open,10,14)),high:agg(by(open,14,99))},
  near:{low:agg(by(near,0,10)),mid:agg(by(near,10,14)),high:agg(by(near,14,99))},
  middle:{low:agg(by(mid,0,10)),mid:agg(by(mid,10,14)),high:agg(by(mid,14,99))},
  gk:{mid:agg(shots.filter(s=>s.gk>=10&&s.gk<14)),high:agg(shots.filter(s=>s.gk>=14))},
  fkHigh:agg(shots.filter(s=>s.kind==='direct-free-kick'&&s.fin>=14)),
  long:Object.fromEntries([9,12,15,17].map(fin=>[fin,agg(synth.filter(s=>s.fin===fin))])),
  spread:{near:+mean(near.map(s=>s.sx)).toFixed(2),mid:+mean(mid.map(s=>s.sx)).toFixed(2)}};
 groups.ratio=+(groups.fin.high.goal/groups.fin.low.goal).toFixed(2);groups.gkGap=+(groups.gk.mid.goalPerOn-groups.gk.high.goalPerOn).toFixed(1);
 return groups;
}
// --search=N: random search plus local refinement over the main parameters.
const RANGES={spreadBase:[.02,.12],spreadSkill:[.1,.6],spreadPower:[.8,2.5],spreadFlat:[0,2.5],spreadFlatV:[0,1.5],verticalRatio:[.4,1.2],pressureGain:[.1,.6],reachBase:[.8,1.6],reachGk:[.02,.07],reactionBase:[.08,.25],reactionGk:[.005,.02],lateralBase:[2.5,6.5],lateralGk:[.05,.25],upBase:[1.1,1.6],aimTemp:[.01,.12],fkSpread:[.8,1.6]};
const TARGET={goal:+(args.find(a=>a.startsWith('--goal='))||'--goal=23.4').slice(7),on:+(args.find(a=>a.startsWith('--on='))||'--on=47').slice(5),fk:10,long:20,ratio:2.2,nearLow:24,nearHigh:42,gkGap:12};
function loss(g){const sq=x=>x*x,below=(x,t)=>x<t?t-x:0,above=(x,t)=>x>t?x-t:0,long=(g.long[15].goal+g.long[17].goal)/2;
 return 4*sq(g.all.goal-TARGET.goal)+.5*sq(g.all.on-TARGET.on)+sq(g.fk.goal-TARGET.fk)+.3*sq(long-TARGET.long)+100*sq(below(g.ratio,TARGET.ratio))+sq(above(g.near.low.goal,TARGET.nearLow))+sq(below(g.near.high.goal,TARGET.nearHigh))+2*sq(below(g.gkGap,TARGET.gkGap));}
// --local: every iteration perturbs the current best (start: defaults + --params).
const searchN=+((args.find(a=>a.startsWith('--search='))||'').slice(9)||0),localOnly=args.includes('--local');
if(searchN){let rng=12345;const rand=()=>(rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296,pick=r=>r[0]+(r[1]-r[0])*rand();
 let best={...Object.fromEntries(Object.keys(RANGES).map(k=>[k,defaults[k]])),...overrides},bestLoss=loss(evaluate(best));
 for(let i=0;i<searchN;i++){const local=localOnly||i>searchN/2,trial={...best};
  for(const [k,r]of Object.entries(RANGES))if(!local||rand()<.3)trial[k]=local?Math.min(r[1],Math.max(r[0],(best[k]??pick(r))+(rand()-.5)*.2*(r[1]-r[0]))):pick(r);
  const l=loss(evaluate(trial));if(l<bestLoss){bestLoss=l;best=trial;console.error(i,l.toFixed(2));}}
 for(const k of Object.keys(best))best[k]=+best[k].toFixed(4);
 Object.assign(overrides,best);console.log(JSON.stringify(best));}
const groups=evaluate(overrides);if(searchN)console.log('loss',loss(groups).toFixed(2));
if(json){console.log(JSON.stringify(groups));return;}
const line=(name,g)=>`${name.padEnd(14)} n=${String(g.n).padStart(4)} on ${g.on}% goal ${g.goal}% save ${g.save}% goal/on ${g.goalPerOn}%`;
console.log([line('all',groups.all),line('open',groups.open),line('direct FK',groups.fk),line('FK fin>=14',groups.fkHigh),
 line('fin <10',groups.fin.low),line('fin 10-14',groups.fin.mid),line('fin >=14',groups.fin.high),`ratio >=14/<10 ${groups.ratio}`,
 line('<=14m <10',groups.near.low),line('<=14m 10-14',groups.near.mid),line('<=14m >=14',groups.near.high),
 line('>14m <10',groups.middle.low),line('>14m 10-14',groups.middle.mid),line('>14m >=14',groups.middle.high),
 line('gk 10-14',groups.gk.mid),line('gk >=14',groups.gk.high),`gk gap (goal/on) ${groups.gkGap}`,
 ...Object.entries(groups.long).map(([fin,g])=>line('long fin '+fin,g)),`mean lateral sigma near ${groups.spread.near} m, >14 m ${groups.spread.mid} m`].join('\n'));
