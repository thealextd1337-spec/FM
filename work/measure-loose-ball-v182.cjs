'use strict';
// B12 measurement: actual native loose-ball scenes, unmarked vs. marked 182.
// Usage: node work/measure-loose-ball-v182.cjs [--marker-only|--old-only] [--json=path]
const fs=require('node:fs'),{create}=require('./native182-scenes.cjs');
const h=create({view:false}),args=process.argv.slice(2),json=args.find(a=>a.startsWith('--json='))?.slice(7);
const modes=args.includes('--old-only')?[false]:args.includes('--marker-only')?[true]:[false,true];
const kinds=['static','rolling','diagonal','rebound','air'],rows=[];
for(const marker of modes)for(const kind of kinds)for(const team of [0,1])for(const size of ['standard','large'])for(let seed=0;seed<6;seed++){
 const run=h.call('Native182.looseRun',{kind,team,size,seed,marker}),m=h.copy(h.call('Native182.looseMetrics',run));
 rows.push({marker,kind,team,size,seed,...m});
}
const sum=(list,key)=>list.reduce((n,r)=>n+r[key],0),pct=(a,b)=>b?Math.round(a/b*1000)/10:null,per=(list,key)=>Math.round(sum(list,key)/list.length*100)/100;
function summarize(filter){const table=[];for(const marker of modes)for(const kind of [...kinds,'all']){
 const list=rows.filter(r=>r.marker===marker&&(kind==='all'||r.kind===kind)&&filter(r)),won=list.filter(r=>r.end==='owner');if(!list.length)continue;
 table.push({version:marker?'182':'alt',kind,scenes:list.length,awayPct:pct(sum(list,'awayTicks'),sum(list,'nearestTicks')),activeAwayPct:pct(sum(list,'activeAwayTicks'),sum(list,'nearestTicks')),brakingAwayPct:pct(sum(list,'brakingAwayTicks'),sum(list,'nearestTicks')),misalignedPct:pct(sum(list,'misalignedTicks'),sum(list,'closeMovingTicks')),misaligned45Pct:pct(sum(list,'misaligned45Ticks'),sum(list,'closeMovingTicks')),nearestFlips:per(list,'nearestFlips'),chaseQuits:per(list,'chaseQuits'),chaserChanges:per(list,'chaserChanges'),airTowardPct:pct(sum(list,'airToward'),sum(list,'airMoving')),landingSupport:sum(list,'landings')?Math.round(sum(list,'landingSupport')/sum(list,'landings')*100)/100:null,won:won.length,out:list.filter(r=>r.end==='out').length,timeout:list.filter(r=>r.end==='timeout').length,meanWin:won.length?Math.round(sum(won,'seconds')/won.length*100)/100:null,medianWin:won.length?+[...won].sort((a,b)=>a.seconds-b.seconds)[won.length>>1].seconds.toFixed(2):null});}
 return table;}
const table=summarize(()=>true);console.table(table);
const bySize=['standard','large'].flatMap(size=>[0,1].map(team=>({size,team,table:summarize(r=>r.size===size&&r.team===team).filter(r=>r.kind==='all')})));
for(const s of bySize)for(const r of s.table)console.log(s.size,'team',s.team,r.version,'away',r.awayPct,'active',r.activeAwayPct,'misaligned',r.misalignedPct,'flips',r.nearestFlips,'win',r.meanWin);
if(json)fs.writeFileSync(json,JSON.stringify({table,bySize,rows},null,1)+'\n');
