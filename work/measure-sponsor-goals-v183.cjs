'use strict';
// New-world gating (183): goals per club and season for the sponsor goal "mindestens N Tore". Whole seasons of the club world with
// the compact simulation, once for a world without the 183 stamp (release-132 rules, marker 178) and once for a new world (marker 183).
// Usage: node work/measure-sponsor-goals-v183.cjs --world=old|new [--seed=s1] [--seasons=3] [--country=AUT-5] [--size=standard|large] [--out=path]
// Output (JSON): per season and club: league/cup flag, startingSquad, matches and regular goals in the league or cup of the country.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const world=arg('world','new'),seed=arg('seed','sp-a'),seasons=+arg('seasons','3'),club=arg('country','AUT-5'),size=arg('size','standard'),out=arg('out',`outputs/sponsor-goals-v183/goals-${world}-${seed}-${size}.json`);
assert(['old','new'].includes(world),'--world=old|new');
const {harness}=require('./youth-native-harness-v176.cjs'),h=harness();h.run('world-expansion-stories-v170.js');h.run('world-youth-legacy-v176.js');
const call=h.call;
const career=call('v167CreateCareer',club,seed,'QA',{fieldSize:size,fieldPlayers:size==='standard'?5:6});
if(world==='old')delete career.world.siRevision;
assert.equal(career.world.siRevision,world==='old'?undefined:183);
globalThis.v61CurrentCareer=career;
const own=career.world.clubs.find(c=>c.id===career.manager.managedClubId);call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);call('v124SetYouthBudget',career,0);
const result={world,seed,club,size,seasons:[]};
function prepareManaged(){
 const c=career.world.clubs.find(x=>x.id===career.manager.managedClubId);if(!c.sponsorId&&c.sponsors?.length)call('v66ChooseSponsor',career,c.id,c.sponsors[0].id);if(career.world.market?.phase==='budget')call('v124SetYouthBudget',career,0);
 for(let guard=0;['open','deadline'].includes(career.world.market?.phase)&&guard<60;guard++){
  while(c.roster.length<10&&c.youthPool.length){try{call('v67Promote',career,c.id,c.youthPool[0].pid);}catch{break;}}
  const pending=career.world.market.pendingBids.filter(x=>x.buyerId===c.id&&x.status==='pending'),ids=new Set(pending.map(x=>x.pid)),keeperPending=()=>[...ids].some(pid=>call('v66Player',career,pid)?.keeper);
  const missing=Math.max(0,10-c.roster.length-pending.length,!c.roster.some(x=>x.keeper)&&!keeperPending()?1:0);
  for(let i=0;i<missing;i++){const needKeeper=!c.roster.some(x=>x.keeper)&&!keeperPending(),p=career.world.market.freePlayers.filter(x=>(!needKeeper||x.keeper)&&!ids.has(x.pid)).sort((x,y)=>call('v66Salary',x)-call('v66Salary',y))[0];if(!p)break;call('v66MakeBid',career,c.id,p.pid,0,Math.max(100,Math.round(call('v66Salary',p)*1.25/10)*10),2,2);ids.add(p.pid);}
  try{call('v66NextMarketDay',career);}catch(error){if(!/mindestens zehn Profis/.test(error.message))throw error;}
 }
}
prepareManaged();
for(let season=1;season<=seasons;season++){
 const t0=Date.now();
 if(season>1)prepareManaged();
 if(career.world.market?.phase!=='closed')throw Error('market not closed before season '+season+': '+career.world.market?.phase);
 let guard=0;while(!career.world.seasonFinished&&guard++<2000)call('v62AdvanceDay',career);
 assert(career.world.seasonFinished,'season finished');
 const competitions=call('v62Current',career),rows=[];
 for(const c of career.world.clubs){
  const comp=competitions.find(x=>x.id===`S${career.world.season}:${c.countryId}:${c.leagueId?'LEAGUE':'CUP'}`);
  let goals=0,matches=0,against=0;
  for(const f of comp.fixtures){if(!f.result)continue;if(f.homeId===c.id){goals+=f.result.homeGoals;against+=f.result.awayGoals;matches++;}else if(f.awayId===c.id){goals+=f.result.awayGoals;against+=f.result.homeGoals;matches++;}}
  const sponsor=c.sponsors?.find(s=>s.id===c.sponsorId);
  rows.push({id:c.id,league:Boolean(c.leagueId),squad:c.policy.startingSquad,matches,goals,against,target:c.sponsors?.map(s=>s.goals.find(g=>g.kind==='goals')?.target)[2]??null});
 }
 result.seasons.push({season,seconds:(Date.now()-t0)/1000,sponsorGoalTargets:rows.map(r=>r.target),rows});
 console.log(JSON.stringify({world,seed,size,season,seconds:(Date.now()-t0)/1000,leagueGoalsPerClub:rows.filter(r=>r.league).reduce((s,r)=>s+r.goals,0)/rows.filter(r=>r.league).length}));
 if(season<seasons){if(career.world.transition?.choice===null)call('v67ChooseOffer',career);call('v62NextSeason',career);}
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result));
}
console.log('done',out);
