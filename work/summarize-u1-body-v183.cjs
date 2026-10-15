'use strict';
// U-1 (player intelligence 183, B02): table of the native-body cases of a NaturalMotionDiagnostics run
// (NativeBody: free carrier 1.50x, close carrier 1.28x, own run 1.58x; change of direction 0/+-45/+-90/+-135/180 and the
// body-relative stress set). Per case: top speed, stride clips in order with their changes, stride band changes,
// playback rate of the stride clip and its stride scale over the cruise, support glide (the weight-bearing sole on the
// turf: mean, share of the speed, maximum) and the largest root-relative joint speed per window.
//   node work/summarize-u1-body-v183.cjs <run folder> [--sequence] [--json <file>]
const fs=require('node:fs'),path=require('node:path');
const folder=process.argv[2],withSequence=process.argv.includes('--sequence'),jsonOut=process.argv.includes('--json')?process.argv[process.argv.indexOf('--json')+1]:null;
const n=JSON.parse(fs.readFileSync(path.join(folder,'natural-motion.json'),'utf8').replace(/\bNaN\b/g,'null').replace(/-?Infinity/g,'null'));
const cases=n.cases.filter(c=>c.origin==='si183');
const f=(v,d=2)=>v==null?'-':Number(v).toFixed(d);
const rows=[];
for(const c of cases){
 const w=k=>c[k]&&c[k].frames?c[k]:null;const joint=k=>w(k)?Math.round(w(k).jointSpeedRootMax||0):null;
 const tr=(c.transitions||[]).reduce((m,t)=>Math.max(m,t.jointSpeedRootMax||0),0);
 const r={name:c.name.replace('body-',''),top:c.speed,clips:c.clips.length,clipChanges:c.gait?.clipChanges,bandChanges:c.bands?.changes,rate:c.gait?.rateMean,rateMax:c.gait?.rateMax,scale:c.gait?.scaleMean,
  glide:c.cruise?.supportGlideMean,glideShare:c.cruise?.supportGlideRatio,glideMax:c.cruise?.supportGlideMax,startJ:joint('start'),cruiseJ:joint('cruise'),stopJ:joint('stop'),wholeJ:Math.round(c.whole?.jointSpeedRootMax||0),transJ:Math.round(tr),soleBelow:['start','cruise','stop'].reduce((s,k)=>s+(w(k)?.soleBelow||0),0),sequence:c.gait?.sequence};
 rows.push(r);
}
console.log('case | top m/s | clip changes | band changes | rate mean/max | scale | support glide m/s (share, max) | joint start/cruise/stop/whole/transitions deg/s | sole below');
for(const r of rows){console.log(`${r.name} | ${f(r.top)} | ${r.clipChanges} | ${r.bandChanges} | ${f(r.rate)}/${f(r.rateMax)} | ${f(r.scale)} | ${f(r.glide,3)} (${f(r.glideShare*100,1)} %, ${f(r.glideMax,2)}) | ${r.startJ}/${r.cruiseJ}/${r.stopJ}/${r.wholeJ}/${r.transJ} | ${r.soleBelow}`);if(withSequence)console.log('   ',r.sequence);}
const gates=n.u1Gates||[];console.log('u1 gates',gates.length,'failed',gates.filter(g=>!g.passed).length);for(const g of gates.filter(g=>!g.passed).slice(0,20))console.log('FAIL',g.name,g.value,'limit',g.limit);
if(jsonOut)fs.writeFileSync(jsonOut,JSON.stringify({folder,rows,gates:{count:gates.length,failed:gates.filter(g=>!g.passed).map(g=>({name:g.name,value:g.value,limit:g.limit}))}},null,1));
