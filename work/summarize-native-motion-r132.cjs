'use strict';
// Summarises a natural-motion.json run (NaturalMotionDiagnostics) for fix/r132-anim: foot-action windows over 1600 deg/s
// (B05), real foul windows with the B11 gates, failed r21 gates. node work/summarize-native-motion-r132.cjs <folder> [top]
const fs=require('node:fs'),path=require('node:path');
const folder=process.argv[2],top=Number(process.argv[3]||25);
const n=JSON.parse(fs.readFileSync(path.join(folder,'natural-motion.json'),'utf8').replace(/\bNaN\b/g,'null').replace(/-?Infinity/g,'null'));
const cases=n.cases.filter(c=>c.origin==='r21-native');console.log('native cases',cases.length);
const W=['approach','entry','contact','return'];const fa=[];for(const c of cases)for(const a of (c.footActions||[]))fa.push({c:c.name,...a});
let over=0;const perWindow=[0,0,0,0];const worst=[];
for(const a of fa){for(let w=0;w<4;w++)if(a.frames[w]>0&&a.jointRootMax[w]>1600){over++;perWindow[w]++;}const m=Math.max(...a.jointRootMax),i=a.jointRootMax.indexOf(m);worst.push({c:a.c.replace('native132-',''),action:a.action,entry:+a.entryClock.toFixed(3),from:a.entryFrom,max:+m.toFixed(0),w:W[i],at:a.jointRootAt[i],lead:a.leadFrames,err:a.entryContactError==null?null:+a.entryContactError.toFixed(3),windows:a.jointRootMax.map(v=>+v.toFixed(0))});}
console.log('foot actions',fa.length,'windows >1600:',over,'per window (approach/entry/contact/return):',perWindow.join('/'));
worst.sort((a,b)=>b.max-a.max);for(const w of worst.slice(0,top))console.log(JSON.stringify(w));
const byAction={};for(const a of fa){const o=byAction[a.action]||(byAction[a.action]={n:0,over:0});o.n++;if(a.jointRootMax.some((v,i)=>a.frames[i]>0&&v>1600))o.over++;}console.log(JSON.stringify(byAction));
const fouls=cases.flatMap(c=>(c.fouls||[]).map(f=>({c:c.name.replace('native132-',''),start:f.start,exitTo:f.exitTo,armMax:f.armMax,armSettled:f.armSettledMax,wsum:[f.weightSumMin,f.weightSumMax],nan:f.nanPictures,float:f.floatMax,joint:f.jointRootMax,pelvis:f.pelvisRateMax})));
console.log('fouls',fouls.length);for(const f of fouls)console.log(JSON.stringify(f));
const r21=n.r21Gates||[];console.log('r21 gates',r21.length,'failed',r21.filter(g=>!g.passed).length);for(const g of r21.filter(g=>!g.passed))console.log('FAIL',g.name.slice(0,160),g.value,'limit',g.limit);
module.exports={worst,fouls};
