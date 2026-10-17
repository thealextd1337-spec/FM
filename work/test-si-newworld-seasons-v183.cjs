'use strict';
// New-world season guard (183): whole seasons of a NEW club world (world stamp 183, native player model, standard pitch with
// 5 outfield players, the only configuration of new careers) with the compact simulation of marker 183 and the sponsor goal table
// of new worlds. work/audit-world-balance-v68.cjs only covers the rules of release 132 (no player model, stamp removed); this check
// guards the economy and the cup distance of the configuration players actually get. Limits are wide corridors around the measured
// values (docs/spielerintelligenz-si6-kompakt-183.md, "Neuanpassung an sb2-f"), not a calibration.
// Usage: node work/test-si-newworld-seasons-v183.cjs   env DOPPEL_SI_SEASONS (default 2), DOPPEL_SI_SEED (default siw-seasons-a),
// DOPPEL_SI_OUT (optional JSON path for the season metrics).
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const seasons=Number(process.env.DOPPEL_SI_SEASONS||2),seed=process.env.DOPPEL_SI_SEED||'siw-seasons-a',out=process.env.DOPPEL_SI_OUT||null;
assert(Number.isInteger(seasons)&&seasons>0);
// DOPPEL_SI_PROBE=1 reports corridor misses instead of stopping (for longer measuring runs).
const probe=process.env.DOPPEL_SI_PROBE==='1',corridor=(ok,message)=>{if(ok)return;if(!probe)assert.fail(message);console.log('MISS '+message);};
const {harness}=require('./youth-native-harness-v176.cjs'),h=harness();h.run('world-expansion-stories-v170.js');h.run('world-youth-legacy-v176.js');
const call=h.call,mean=a=>a.reduce((s,x)=>s+x,0)/a.length,median=a=>{const s=[...a].sort((x,y)=>x-y),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};
const career=call('v167CreateCareer','AUT-5',seed,'QA',{fieldSize:'standard',fieldPlayers:5});globalThis.v61CurrentCareer=career;
assert.equal(career.world.siRevision,183,'new world carries the 183 stamp');
const managed=()=>career.world.clubs.find(c=>c.id===career.manager.managedClubId);
function prepareManaged(){
 const c=managed();if(!c.sponsorId&&c.sponsors?.length)call('v66ChooseSponsor',career,c.id,c.sponsors[0].id);if(career.world.market?.phase==='budget')call('v124SetYouthBudget',career,0);
 for(let guard=0;['open','deadline'].includes(career.world.market?.phase)&&guard<60;guard++){
  while(c.roster.length<10&&c.youthPool.length){try{call('v67Promote',career,c.id,c.youthPool[0].pid);}catch{break;}}
  const pending=career.world.market.pendingBids.filter(x=>x.buyerId===c.id&&x.status==='pending'),ids=new Set(pending.map(x=>x.pid)),keeperPending=()=>[...ids].some(pid=>call('v66Player',career,pid)?.keeper);
  const missing=Math.max(0,10-c.roster.length-pending.length,!c.roster.some(x=>x.keeper)&&!keeperPending()?1:0);
  for(let i=0;i<missing;i++){const needKeeper=!c.roster.some(x=>x.keeper)&&!keeperPending(),p=career.world.market.freePlayers.filter(x=>(!needKeeper||x.keeper)&&!ids.has(x.pid)).sort((x,y)=>call('v66Salary',x)-call('v66Salary',y))[0];if(!p)break;call('v66MakeBid',career,c.id,p.pid,0,Math.max(100,Math.round(call('v66Salary',p)*1.25/10)*10),2,2);ids.add(p.pid);}
  try{call('v66NextMarketDay',career);}catch(error){if(!/mindestens zehn Profis/.test(error.message))throw error;}
 }
}
const result={seed,seasons:[]},hits=[];
call('v66ChooseSponsor',career,managed().id,managed().sponsors[0].id);call('v124SetYouthBudget',career,0);
for(let season=1;season<=seasons;season++){
 const t0=Date.now();prepareManaged();
 assert.equal(career.world.market?.phase,'closed',`season ${season}: market closed`);
 const playing=career.world.clubs.filter(c=>!c.simulationOnly),countries=[...new Set(playing.map(c=>c.countryId))];
 // Cup-only clubs of the 12-country world are simulation-only (no economy); the distance is the mean quality of all cup clubs of a country over its league clubs.
 const all=career.world.clubs,quality=all.filter(c=>c.leagueId).map(c=>call('v62Quality',c)),ratios=countries.map(country=>{const avg=list=>mean(list.map(c=>call('v62Quality',c)));return avg(all.filter(c=>c.countryId===country&&!c.leagueId))/avg(all.filter(c=>c.countryId===country&&c.leagueId));});
 let guard=0;while(!career.world.seasonFinished&&guard++<2000)call('v62AdvanceDay',career);
 assert(career.world.seasonFinished,`season ${season} finished`);
 assert.equal(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true,`season ${season}: valid after reload`);
 const competitions=call('v62Current',career),leagues=competitions.filter(c=>c.type==='league'),league=leagues.flatMap(l=>l.fixtures).filter(f=>f.result);
 const records=league.map(f=>f.matchRecord).filter(Boolean),compact=records.filter(r=>r.teamStats);
 assert(compact.length>league.length*.9,`season ${season}: league matches run the compact simulation of marker 183 (${compact.length}/${league.length})`);
 const goals=league.map(f=>f.result.homeGoals+f.result.awayGoals),draws=league.filter(f=>f.result.homeGoals===f.result.awayGoals).length/league.length;
 const rows=[];
 for(const club of playing.filter(c=>c.leagueId)){
  const goal=club.sponsors[2].goals.find(g=>g.kind==='goals');
  assert.equal(goal.target,call('v66SponsorGoalTarget',career,club),`${club.id}: sponsor goal follows the table of new worlds`);
  assert.equal(call('v66SponsorGoalLabel',goal),`Liga: mindestens ${goal.target} Tore`);
  rows.push({squad:club.policy.startingSquad,target:goal.target,met:call('v66SponsorMet',career,club,goal)});
 }
 hits.push(...rows);
 const ai=playing.filter(c=>c.id!==career.manager.managedClubId),lowest=Math.min(...ai.map(c=>c.balance));
 const income=ai.map(c=>c.ledger.filter(x=>x.season===career.world.season&&x.amount>0).reduce((s,x)=>s+x.amount,0)),salary=ai.map(c=>-c.ledger.filter(x=>x.id===`S${career.world.season}:${c.id}:salary`).reduce((s,x)=>s+x.amount,0));
 const metrics={season,seconds:(Date.now()-t0)/1000,leagueGoalsPerMatch:mean(goals),leagueDraws:draws,leagueQualityMedian:median(quality),cupQualityRatioMedian:median(ratios),cupQualityRatioMax:Math.max(...ratios),sponsorHit:rows.filter(r=>r.met).length/rows.length,lowestAiBalance:lowest,maxSalaryShare:Math.max(...salary.map((s,i)=>income[i]>0?s/income[i]:0)),aiBalanceMedian:median(ai.map(c=>c.balance))};
 result.seasons.push(metrics);console.log(JSON.stringify(metrics));
 // Corridors (3 seeds x 10 seasons in the review of 17 Oct 2026: goals 3.47-4.08, draws 15.8-22.2 %, sponsor hit 29-52 % per season, 41-42 % over
 // 10 seasons, lowest AI balance 1,070-4,555): goals in the product band 3-5, draws around 17-20 %, sponsor goal hit by the squad class around 35-40 %,
 // at least 10 % cup distance (product rule; the cup-only clubs of this world catch up from 0.37 to 0.58 over 10 seasons in worlds with and
 // without the stamp alike), no AI club in uncovered debt.
 corridor(metrics.leagueGoalsPerMatch>=3&&metrics.leagueGoalsPerMatch<=4.6,`season ${season}: league goals per match ${metrics.leagueGoalsPerMatch.toFixed(2)} outside 3-4.6`);
 corridor(draws>=.1&&draws<=.27,`season ${season}: league draws ${(draws*100).toFixed(1)} % outside 10-27 %`);
 corridor(metrics.sponsorHit>=.15&&metrics.sponsorHit<=.65,`season ${season}: sponsor goal hit ${(metrics.sponsorHit*100).toFixed(1)} % outside 15-65 %`);
 corridor(metrics.cupQualityRatioMax<=.9,`season ${season}: cup distance ${JSON.stringify(ratios.map(r=>+r.toFixed(2)))}`);
 corridor(lowest>=0,`season ${season}: AI club in uncovered debt (${lowest})`);
 if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,1));}
 if(season<seasons){if(career.world.transition?.choice===null)call('v67ChooseOffer',career);call('v62NextSeason',career);}
}
const pooled=hits.filter(r=>r.met).length/hits.length;
corridor(pooled>=.22&&pooled<=.55,`pooled sponsor goal hit ${(pooled*100).toFixed(1)} % outside 22-55 %`);
result.sponsorHitPooled=pooled;
if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,1));}
console.log(`new-world seasons (183): ${seasons} season(s), seed ${seed}, sponsor hit ${(pooled*100).toFixed(1)} %, ok`);
