'use strict';
// Before/after comparison of two natural-motion.json runs (NaturalMotionDiagnostics) on the same native132 captures:
// every foot action matched by case, action and entry clock; windows over 1600 deg/s; per-window deltas; and the
// per-picture stage trace of one window. node work/compare-native-motion-r132.cjs <beforeFolder> <afterFolder> [traceName]
const fs=require('node:fs'),path=require('node:path');
const load=f=>JSON.parse(fs.readFileSync(path.join(f,'natural-motion.json'),'utf8').replace(/\bNaN\b/g,'null').replace(/-?Infinity/g,'null'));
const [before,after,traceName]=process.argv.slice(2);const A=load(before),B=load(after);
const W=['approach','entry','contact','return'];
function actions(n){const list=[];for(const c of n.cases.filter(c=>c.origin==='r21-native'))for(const a of (c.footActions||[]))list.push({key:c.name+'|'+a.action+'|'+a.entryClock.toFixed(2),c:c.name.replace('native132-',''),...a});return list;}
const a=actions(A),b=actions(B);const bm=new Map(b.map(x=>[x.key,x]));
const count=l=>{let n=0;const per=[0,0,0,0];for(const x of l)for(let w=0;w<4;w++)if(x.frames[w]>0&&x.jointRootMax[w]>1600){n++;per[w]++;}return {n,per};};
console.log('foot actions before/after',a.length,b.length,'windows >1600 before',JSON.stringify(count(a)),'after',JSON.stringify(count(b)));
let worse=0,better=0,same=0;const rows=[];
for(const x of a){const y=bm.get(x.key);if(!y)continue;for(let w=0;w<4;w++){if(x.frames[w]===0)continue;const d=y.jointRootMax[w]-x.jointRootMax[w];if(Math.abs(d)<1)same++;else if(d>0)worse++;else better++;rows.push({key:x.key.replace('native132-',''),w:W[w],before:+x.jointRootMax[w].toFixed(0),after:+y.jointRootMax[w].toFixed(0),d:+d.toFixed(0),at:y.jointRootAt[w]});}}
console.log('windows better/worse/same',better,worse,same);
console.log('worse by more than 100 deg/s:');for(const r of rows.filter(r=>r.d>100).sort((p,q)=>q.d-p.d).slice(0,20))console.log(JSON.stringify(r));
console.log('largest remaining (after):');for(const r of rows.sort((p,q)=>q.after-p.after).slice(0,25))console.log(JSON.stringify(r));
const byAction={};for(const y of b){const o=byAction[y.action]||(byAction[y.action]={n:0,over:0});o.n++;if(y.jointRootMax.some((v,i)=>y.frames[i]>0&&v>1600))o.over++;}console.log('after per action',JSON.stringify(byAction));
if(traceName){for(const [label,folder] of [['before',before],['after',after]]){const f=path.join(folder,traceName);if(!fs.existsSync(f)){console.log('no trace',f);continue;}const t=JSON.parse(fs.readFileSync(f,'utf8').replace(/\bNaN\b/g,'null'));console.log('trace',label,t.name,'frames',t.clock.length);
 for(let i=0;i<t.clock.length;i++){const st=t.stage?t.stage.slice(i*5,i*5+5).map(v=>Math.round(v)):[];console.log(t.clock[i].toFixed(3),(t.action[i]||'').padEnd(10),(t.clip[i]||'').padEnd(20),'t='+(t.poseTime?t.poseTime[i].toFixed(3):'?'),'aw='+(t.actionWeight?t.actionWeight[i].toFixed(2):'?'),'pr='+(t.progress?t.progress[i].toFixed(2):'?'),'c='+(t.contact?t.contact[i]:'?'),'err='+(t.contactError?t.contactError[i].toFixed(3):'?'),'joint='+Math.round(t.jointRoot[i]),'stages='+st.join('/'),'lock='+(t.lockState?t.lockState[i]:''),'rel='+(t.releaseWeight?t.releaseWeight[i].toFixed(2):''));}}}
