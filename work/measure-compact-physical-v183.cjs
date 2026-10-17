'use strict';
// SI-6 / P02: compact replicas of the physical acceptance series SI-K2 (outputs/si183/k2-f*-trace40000.json).
// The 576 fixtures of the played-out series are rebuilt exactly (same world seed, club, pitch size, lineups; the
// strength of both teams is checked against the physical record) and every fixture is played K times with the
// compact simulation of the current dist. No browser: Node only.
// Usage: node work/measure-compact-physical-v183.cjs [--shard=0 --shards=4] [--k=8] [--label=c] [--revision=183|178]
//          [--set=path=value,...] [--limit=N] [--series=k2-f-trace40000,...]
//   --set   changes values of the stored compact snapshot per replica, e.g. --set=shotBase=*1.02,levers.onFin=+0.01
//   --variants=name:path=v,path=v;name2:path=v   several parameter variants per fixture (world built once, same replica seeds); files <label>_<name>-<shard>of<shards>.json
//   --revision=178 plays the same fixtures with the frozen marker 178 (comparison)
// Output: outputs/si6/<label>-<shard>of<shards>.json; evaluate with work/table-compact-physical-v183.cjs.
const fs=require('node:fs'),path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const {harness}=require('./youth-native-harness-v176.cjs');
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const shard=+arg('shard',0),shards=+arg('shards',1),K=+arg('k',8),label=arg('label','c'),limit=+arg('limit',0),sets=arg('set','').split(',').filter(Boolean),revision=arg('revision','183');
const variantArg=arg('variants','').split(';').filter(Boolean).map(v=>{const [name,rest]=v.split(':');return{name,sets:[...sets,...(rest||'').split(',').filter(Boolean)]};});
const variants=variantArg.length?variantArg:[{name:'',sets}];
const series=arg('series','k2-f-trace40000,k2-f-si183b-trace40000,k2-f-si183c-trace40000').split(',');
const KEYS=['spd','tec','pas','fin','tak','pos','air','sta'];
const physical=series.flatMap(name=>JSON.parse(fs.readFileSync(`outputs/si183/${name}.json`,'utf8')).matches.filter(r=>r.finished&&!r.engineError&&!r.stall&&r.rec&&r.extras?.sik));
const jobs=physical.map((r,index)=>({index,seed:r.seed,size:r.size,clubId:r.clubId,teams:r.teams.map(t=>({clubId:t.clubId,ovr:t.ovr}))})).filter((job,n)=>n%shards===shard);
const h=harness();
const setPath=(object,keyPath,value)=>{const parts=keyPath.split('.');let o=object;for(const key of parts.slice(0,-1))o=o[key];const last=parts.at(-1);o[last]=value.startsWith('*')?o[last]*Number(value.slice(1)):value.startsWith('+')?o[last]+Number(value.slice(1)):Number(value);};
const outs=variants.map(v=>({label:v.name?`${label}_${v.name}`:label,K,sets:v.sets,revision,series,jobs:[]}));
if(revision!=='178')globalThis.__shooters={},h.evaluate("const v183PickBase=v183PickShooter;v183PickShooter=function(B,source,team,state,random){const pid=v183PickBase(B,source,team,state,random);const e=(globalThis.__shooters[source]||=[0,0,0]);e[0]++;e[1]+=team.skills[pid].fin;e[2]+=team.skills[pid].air;return pid;};");
let done=0;
for(const job of (limit?jobs.slice(0,limit):jobs)){
 const career=h.call('v167CreateCareer',job.clubId,job.seed,'P01 Analyse',{fieldSize:job.size,fieldPlayers:job.size==='standard'?5:6});
 const own=career.world.clubs.find(x=>x.id===career.manager.managedClubId);h.call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);h.call('v124SetYouthBudget',career,0);
 for(let i=0;i<40&&['open','deadline'].includes(career.world.market?.phase);i++)h.call('v66NextMarketDay',career);
 const fixture=h.call('v64AdvanceToOwnMatch',career);globalThis.v61CurrentCareer=career;
 const base=career.world.activeMatch.state;
 const check=[0,1].map(side=>{const active=side===0?base.active:base.awayActive,club=career.world.clubs.find(x=>x.id===(side===0?fixture.homeId:fixture.awayId)),field=active.filter(pid=>base.roles[pid]!=='gk').map(pid=>club.roster.find(p=>p.pid===pid));return{clubId:club.id,ovr:+(KEYS.reduce((a,k)=>a+field.reduce((x,p)=>x+p[k],0)/field.length,0)/KEYS.length).toFixed(2)};});
 const baseRecord={index:job.index,seed:job.seed,size:job.size,clubId:job.clubId,homeId:fixture.homeId,awayId:fixture.awayId,neutral:Boolean(fixture.neutral),check,ovrOk:check.every(x=>job.teams.some(t=>t.clubId===x.clubId&&Math.abs(t.ovr-x.ovr)<.011)),};
 for(const [vi,variant] of variants.entries()){
 globalThis.__shooters={};const record={...baseRecord,matches:[]};
 for(let k=0;k<K;k++){
  const replica={...fixture,id:fixture.id+':r'+k,result:null},state=h.call('v64MakeState',career,replica);
  if(revision==='178'){state.playerPerformance.shotBalanceRevision=178;state.playerPerformance.compactBalance=h.evaluate('({...v178CompactBalance})');}
  else for(const item of variant.sets){const [keyPath,value]=item.split('=');setPath(state.playerPerformance.compactBalance,keyPath,value);}
  for(let guard=0;state.phase!=='finished'&&guard<130;guard++)h.call('v64Step',career,replica,state);
  const roleOf=pid=>state.roleAssignments?.[pid]?.roleId||state.playerPerformance.phases[pid]?.at(-1)?.roleId||null;
  const goals=state.events.filter(e=>e.type==='goal').map(e=>({side:e.side,scorer:roleOf(e.scorerPid),assist:e.assistPid?roleOf(e.assistPid):null,minute:e.minute,source:e.source||null}));
  const players=Object.entries(state.stats).filter(([pid])=>state.minutes[pid]>0).map(([pid,s])=>[roleOf(pid),s.shots,s.goals,s.assists,s.fouls||0,state.minutes[pid]]);
  const load=state.playerLoad?Object.entries(state.playerLoad.meta).filter(([pid])=>state.minutes[pid]>0).map(([pid,meta])=>[meta.stamina,meta.keeper?1:0,state.playerLoad.startFresh[pid],state.fresh[pid],state.minutes[pid],roleOf(pid)]):null;
  const stats=state.compactStats,side=i=>stats?{shots:stats.shots[i],onTarget:stats.onTarget[i],corners:stats.corners[i],crosses:stats.crosses[i],fouls:stats.fouls[i],freeKicks:stats.freeKicks[i]}:null;
  const totals=[0,1].map(i=>({shots:0}));if(!stats)for(const pid of Object.keys(state.stats))totals[(base.active.includes(pid)||base.bench.includes(pid))?0:1].shots+=state.stats[pid].shots;
  record.matches.push({score:state.score,minute:state.minute,stats:stats?[side(0),side(1)]:totals,sources:stats?{shots:stats.sources,goals:stats.sourceGoals}:null,goals,load,roles:players});
 }
 record.shooters=globalThis.__shooters;outs[vi].jobs.push(record);}
 done++;
 if(done%10===0)console.error(`shard ${shard}: ${done}/${jobs.length}`);
}
fs.mkdirSync('outputs/si6',{recursive:true});
for(const out of outs)fs.writeFileSync(`outputs/si6/${out.label}-${shard}of${shards}.json`,JSON.stringify(out));
console.error('written',label,shard);
