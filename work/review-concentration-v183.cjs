'use strict';
// Review SI-6: per-player concentration of shots and goals, compact (marker 183) against the physical series (default sb2-f, --series=k2-f-... for the SI-6 reference).
// Usage: node work/review-concentration-v183.cjs --shard=0 --shards=4 --k=4 [--label=x] [--set=path=value,...]
const fs=require('node:fs'),path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const {harness}=require('./youth-native-harness-v176.cjs');
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const shard=+arg('shard',0),shards=+arg('shards',1),K=+arg('k',4),label=arg('label','conc'),sets=arg('set','').split(',').filter(Boolean);
const series=arg('series','sb2-f-trace40000,sb2-f-si183b-trace40000,sb2-f-si183c-trace40000').split(',');
const KEYS=['spd','tec','pas','fin','tak','pos','air','sta'];
const physical=series.flatMap(name=>JSON.parse(fs.readFileSync(`outputs/si183/${name}.json`,'utf8')).matches.filter(r=>r.finished&&!r.engineError&&!r.stall&&r.rec&&r.extras?.sik));
const h=harness();
const setPath=(object,keyPath,value)=>{const parts=keyPath.split('.');let o=object;for(const key of parts.slice(0,-1))o=o[key];const last=parts.at(-1);o[last]=value.startsWith('*')?o[last]*Number(value.slice(1)):value.startsWith('+')?o[last]+Number(value.slice(1)):Number(value);};
const out={label,K,sets,jobs:[]};
physical.forEach((r,index)=>{
 if(index%shards!==shard)return;
 // physical team rows: players (non-keeper) with fin, shots, goals
 const phys=[0,1].map(t=>({ovr:r.teams[t].ovr,players:r.extras.sik.players.filter(p=>p.t===t&&!p.keeper).map(p=>({fin:p.fin,role:p.role,shots:p.shots,goals:p.goals}))}));
 const career=h.call('v167CreateCareer',r.clubId,r.seed,'P01 Analyse',{fieldSize:r.size,fieldPlayers:r.size==='standard'?5:6});
 const own=career.world.clubs.find(x=>x.id===career.manager.managedClubId);h.call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);h.call('v124SetYouthBudget',career,0);
 for(let i=0;i<40&&['open','deadline'].includes(career.world.market?.phase);i++)h.call('v66NextMarketDay',career);
 const fixture=h.call('v64AdvanceToOwnMatch',career);globalThis.v61CurrentCareer=career;
 const base=career.world.activeMatch.state;
 const clubs=[fixture.homeId,fixture.awayId].map(id=>career.world.clubs.find(x=>x.id===id));
 const check=[0,1].map(side=>{const active=side===0?base.active:base.awayActive,field=active.filter(pid=>base.roles[pid]!=='gk').map(pid=>clubs[side].roster.find(p=>p.pid===pid));return +(KEYS.reduce((a,k)=>a+field.reduce((x,p)=>x+p[k],0)/field.length,0)/KEYS.length).toFixed(2);});
 const ok=check.every(o=>r.teams.some(t=>Math.abs(t.ovr-o)<.011));
 const comp=[];
 for(let k=0;k<K;k++){
  const replica={...fixture,id:fixture.id+':q'+k,result:null},state=h.call('v64MakeState',career,replica);
  for(const item of sets){const [keyPath,value]=item.split('=');setPath(state.playerPerformance.compactBalance,keyPath,value);}
  for(let guard=0;state.phase!=='finished'&&guard<130;guard++)h.call('v64Step',career,replica,state);
  comp.push([0,1].map(side=>({ovr:check[side],players:Object.keys(state.stats).filter(pid=>state.minutes[pid]>0&&clubs[side].roster.some(p=>p.pid===pid)&&state.roles[pid]!=='gk'&&!clubs[side].roster.find(p=>p.pid===pid).keeper).map(pid=>{const p=clubs[side].roster.find(x=>x.pid===pid);return{fin:p.fin,role:state.roleAssignments?.[pid]?.roleId||null,shots:state.stats[pid].shots,goals:state.stats[pid].goals,assists:state.stats[pid].assists};})})));
 }
 out.jobs.push({index,size:r.size,ok,phys,comp});
 if(out.jobs.length%20===0)console.error(`shard ${shard}: ${out.jobs.length}`);
});
fs.mkdirSync('outputs/review-si6',{recursive:true});
fs.writeFileSync(`outputs/review-si6/${label}-${shard}of${shards}.json`,JSON.stringify(out));
console.error('written',label,shard);
