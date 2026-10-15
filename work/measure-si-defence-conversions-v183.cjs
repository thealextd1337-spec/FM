'use strict';
// SI-4 mechanism rates (no browser, no engine run): how often a block deflection
// crosses the goal line (corner) and how often a header clearance under pressure
// goes out, with the package off (legacy) and on. Uses the actual dist functions
// v50Deflect and v183Clearance in the native VM harness with a seeded stream.
// Usage: node work/measure-si-defence-conversions-v183.cjs [--reps=4000]
const {create}=require('./native183-scenes.cjs'),{source}=require('./si-defence-scenes-v183.cjs');
const reps=+((process.argv.find(a=>a.startsWith('--reps='))||'').slice(7)||4000);
const h=create({view:false});h.run(source,'native-defence-scenes');
const out=h.copy(h.evaluate(`(()=>{
 const reps=${reps},result={};
 const seeded=seed=>{let s=seed>>>0||1;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
 // Blocks: a block point at 4..10 m from the goal line, a defender of average 'pos'. Share of deflections that reach the goal line.
 for(const on of [false,true]){
  let crossed=0;
  for(let i=0;i<reps;i++){
   NativeDef.build({on,d:0,defs:[{depth:5,lateral:1,line:'def'}],carrier:{depth:12,lateral:0,vy:1},seed:i+1});
   const m=match,def=m.people.find(x=>x.pid==='def0'),s=v150Scale(m),depth=4+(i%7);
   seeded(1000+i);v50Deflect({x:def.x,y:v55Field.bottom-depth/s.y},1,def,'Block von X');
   if(m.flight&&m.flight.target.y>=v55Field.bottom-1e-9)crossed++;
  }
  result['blockCrossesGoalLine_'+(on?'package':'legacy')]=+(crossed/reps).toFixed(3);
 }
 // Header clearances in the own box (depth 3..14 m) with 0, 1, 2 pressing rivals; share that goes out and share that ends as a corner.
 for(const pressure of [0,1,2]){
  let out=0,byline=0;
  for(let i=0;i<reps;i++){
   NativeDef.build({on:true,d:i%2,defs:[{depth:3+(i%12),lateral:(i%9)-4,line:'def'}],carrier:{depth:20,lateral:0,vy:1},seed:i+1});
   const m=match,def=m.people.find(x=>x.pid==='def0'),s=v150Scale(m);seeded(5000+i);
   const r=v183Clearance(m,def,{x:def.x,y:def.y},{pressure,ownBox:true});
   if(r.out){out++;const beyondLine=def.t===0?r.target.y>v55Field.bottom:r.target.y<v55Field.top;if(beyondLine)byline++;}
  }
  result['clearanceOutShare_pressure'+pressure]=+(out/reps).toFixed(3);result['clearanceCornerShare_pressure'+pressure]=+(byline/reps).toFixed(3);
 }
 return result;})()`));
console.log(JSON.stringify(out,null,1));
