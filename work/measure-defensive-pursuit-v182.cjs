'use strict';
// B03 measurement: native breakaway pursuit, unmarked vs. marked 182.
// Usage: node work/measure-defensive-pursuit-v182.cjs [--marker-only|--old-only] [--json=path]
const fs=require('node:fs'),{create}=require('./native182-scenes.cjs');
const h=create({view:false}),args=process.argv.slice(2),json=args.find(a=>a.startsWith('--json='))?.slice(7);
const modes=args.includes('--old-only')?[false]:args.includes('--marker-only')?[true]:[false,true],rows=[];
for(const marker of modes)for(const scene of h.copy(h.call('Native182.pursuitScenes',marker))){
 const m=h.copy(h.call('Native182.pursuitMetrics',h.call('Native182.pursuitRun',scene)));rows.push({...scene,...m});
}
const sum=(list,key)=>list.reduce((n,r)=>n+(r[key]||0),0),round=(v,d=2)=>v==null?null:Math.round(v*10**d)/10**d;
function summary(list){const reached=list.filter(r=>r.goalSideAt!=null),n=list.length||1;
 return {scenes:list.length,goalSidePct:round(reached.length/n*100,1),goalSideMean:reached.length?round(sum(reached,'goalSideAt')/reached.length):null,passByPer100:round(sum(list,'passBy')/n*100,1),passByAfterLostDuelPer100:round(sum(list,'passByRecovering')/n*100,1),closeNoCheckPer100:round(sum(list,'closeNoCheck')/n*100,1),standingPer100:round(sum(list,'standing')/n*100,1),slidesPer100:round(sum(list,'slides')/n*100,1),slidesBehindPer100:round(sum(list,'slidesBehind')/n*100,1),foulsPer100:round(sum(list,'fouls')/n*100,1),foulsBehindPer100:round(sum(list,'foulsBehind')/n*100,1),foulsFrontPer100:round(sum(list,'foulsFront')/n*100,1),wonPct:round(list.filter(r=>r.end==='won'||r.end==='loose').length/n*100,1),foulPct:round(list.filter(r=>r.end==='foul').length/n*100,1),escapedPct:round(list.filter(r=>r.end==='escaped').length/n*100,1),timeoutPct:round(list.filter(r=>r.end==='timeout').length/n*100,1)};}
const groups=[['all',()=>true],['straight',r=>r.path===0],['cut30',r=>r.path===30],['cut60',r=>r.path===60],['cut90',r=>r.path===90],['behind',r=>r.offset.startsWith('behind')],['side',r=>r.offset.startsWith('side')],['diag',r=>r.offset.startsWith('diag')],['front',r=>r.offset.startsWith('front')],['team0',r=>r.team===0],['team1',r=>r.team===1],['large',r=>r.size==='large'],['def8',r=>r.quality===8&&r.size==='standard'],['def18',r=>r.quality===18&&r.size==='standard'],['fastAtt18vsDef8',r=>r.attack===18&&r.quality===8],['slowAtt8vsDef18',r=>r.attack===8&&r.quality===18]];
const table=[];for(const [name,filter]of groups)for(const marker of modes)table.push({group:name,version:marker?'182':'alt',...summary(rows.filter(r=>r.marker===marker&&filter(r)))});
console.table(table);
if(json)fs.writeFileSync(json,JSON.stringify({table,rows},null,1)+'\n');
