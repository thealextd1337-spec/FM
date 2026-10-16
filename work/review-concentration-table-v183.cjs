'use strict';
// Review SI-6: table for work/review-concentration-v183.cjs. Usage: node work/review-concentration-table-v183.cjs --label=base [--shards=4]
const fs=require('node:fs'),path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const label=arg('label','base'),shards=+arg('shards',4);
const jobs=Array.from({length:shards},(_,s)=>JSON.parse(fs.readFileSync(`outputs/review-si6/${label}-${s}of${shards}.json`,'utf8')).jobs).flat().filter(j=>j.ok);
function collect(kind,size,filter){
 const acc={teams:0,shots:0,goals:0,hS:[],hG:[],bestShots:0,bestGoals:0,topShots:0,topGoals:0,brace:0,hat:0,assists:0};
 for(const j of jobs){
  if(size&&j.size!==size)continue;
  const games=kind==='phys'?[j.phys]:j.comp;
  for(const game of games)for(const t of [0,1]){
   const team=game[t],other=game[1-t],gap=team.ovr-other.ovr;if(!filter(gap))continue;
   const ps=team.players,N=ps.reduce((a,p)=>a+p.shots,0),G=ps.reduce((a,p)=>a+p.goals,0);
   acc.teams++;acc.shots+=N;acc.goals+=G;acc.assists+=ps.reduce((a,p)=>a+(p.assists||0),0);
   if(N>=2)acc.hS.push(ps.reduce((a,p)=>a+p.shots*(p.shots-1),0)/(N*(N-1)));
   if(G>=2)acc.hG.push(ps.reduce((a,p)=>a+p.goals*(p.goals-1),0)/(G*(G-1)));
   const best=ps.reduce((b,p)=>p.fin>b.fin?p:b,ps[0]);acc.bestShots+=best.shots;acc.bestGoals+=best.goals;
   acc.topShots+=Math.max(...ps.map(p=>p.shots));acc.topGoals+=Math.max(...ps.map(p=>p.goals));
   if(ps.some(p=>p.goals>=2))acc.brace++;if(ps.some(p=>p.goals>=3))acc.hat++;
  }
 }
 const m=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN,pc=x=>(100*x).toFixed(1);
 return{n:acc.teams,shots:(acc.shots/acc.teams).toFixed(2),goals:(acc.goals/acc.teams).toFixed(2),Hshots:m(acc.hS).toFixed(3),Hgoals:m(acc.hG).toFixed(3),bestFinShotShare:pc(acc.bestShots/acc.shots),bestFinGoalShare:pc(acc.bestGoals/acc.goals),topShooterShare:pc(acc.topShots/acc.shots),topScorerShare:pc(acc.topGoals/acc.goals),topScorerGoals:(acc.topGoals/acc.teams).toFixed(2),brace:pc(acc.brace/acc.teams),hat:pc(acc.hat/acc.teams),assistsPerGoal:kind==='comp'?(acc.assists/acc.goals).toFixed(2):'-'};
}
const rows=[];
for(const size of ['standard','large',null])for(const [name,f] of [['all',()=>true],['fav>=2',g=>g>=2],['fav>=3',g=>g>=3],['|gap|<1',g=>Math.abs(g)<1]]){
 rows.push({size:size||'both',band:name,kind:'phys',...collect('phys',size,f)});rows.push({size:size||'both',band:name,kind:'comp',...collect('comp',size,f)});
}
console.table(rows);
