'use strict';
// SI-6 / P02 season-level check: whole seasons of the new club world (12 countries, native player model) with the
// compact simulation of marker 183 against marker 178. Everything the manager does not watch is compact.
// Usage: node work/measure-compact-seasons-v183.cjs --marker=183|178 [--seed=s1] [--seasons=3] [--country=AUT-5] [--size=standard|large] [--out=path]
// Output (JSON): per season league table spread, goals per match, 0:0 share, home share, top scorers and assists,
// the 0-1 / 1-2 / 2-3 / >=3 strength gap table of the finished league matches and the freshness use of full-match players.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const arg=(name,fallback)=>{const hit=process.argv.find(a=>a.startsWith('--'+name+'='));return hit?hit.slice(name.length+3):fallback;};
const marker=arg('marker','183'),seed=arg('seed','si6-season-a'),seasons=+arg('seasons','3'),club=arg('country','AUT-5'),size=arg('size','standard'),out=arg('out',`outputs/si6/seasons-${marker}-${seed}-${size}.json`);
const {harness}=require('./youth-native-harness-v176.cjs'),h=harness();h.run('world-expansion-stories-v170.js');h.run('world-youth-legacy-v176.js');
if(marker==='178')h.evaluate("const v183SeasonInit=v155Initialize;v155Initialize=function(career,state){const had=Boolean(state.playerPerformance);v183SeasonInit(career,state);if(!had&&state.playerPerformance){state.playerPerformance.shotBalanceRevision=178;state.playerPerformance.compactBalance={...v178CompactBalance};}};");
const call=h.call,mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN,sd=a=>{const m=mean(a);return a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):NaN;};
const career=call('v167CreateCareer',club,seed,'QA',{fieldSize:size,fieldPlayers:size==='standard'?5:6});globalThis.v61CurrentCareer=career;
const own=career.world.clubs.find(c=>c.id===career.manager.managedClubId);call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);call('v124SetYouthBudget',career,0);
const result={marker,seed,club,size,seasons:[]};
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
 const fixtures=call('v62Fixtures',career).filter(f=>f.result&&f.matchRecord);
 const leagues=call('v62Current',career).filter(x=>x.type==='league'),rows=[],scorers=[],assisters=[],gaps=[],ratings=[];
 const clubSkill=new Map();
 for(const f of fixtures){
  const rec=f.matchRecord,league=leagues.some(l=>l.id===f.competitionId);
  const sk=(id,pids)=>{const cl=career.world.clubs.find(x=>x.id===id);const ps=pids.map(pid=>cl.roster.find(p=>p.pid===pid)).filter(p=>p&&!p.keeper);return mean(ps.map(p=>(p.spd+p.tec+p.pas+p.fin+p.tak+p.pos+p.air+p.sta)/8));};
  if(league&&f.plan){const ho=sk(f.homeId,f.plan.home.starters),aw=sk(f.awayId,f.plan.away.starters);if(Number.isFinite(ho)&&Number.isFinite(aw))gaps.push({gap:Math.abs(ho-aw),favWin:(ho>aw?rec.score[0]>rec.score[1]:rec.score[1]>rec.score[0]),draw:rec.score[0]===rec.score[1],goals:rec.score[0]+rec.score[1]});}
  rows.push({league,goals:rec.score[0]+rec.score[1],home:rec.score[0]>rec.score[1],draw:rec.score[0]===rec.score[1],stats:rec.teamStats||null,managed:f.homeId===career.manager.managedClubId||f.awayId===career.manager.managedClubId});
  for(const p of rec.players){if(Number.isFinite(p.rating)&&p.minutes>=20)ratings.push(p.rating);if(p.goals)scorers.push([p.pid,f.competitionId,p.goals]);if(p.assists)assisters.push([p.pid,f.competitionId,p.assists]);}
 }
 const top=list=>{const per={};for(const [pid,comp,n] of list){per[comp]??={};per[comp][pid]=(per[comp][pid]||0)+n;}return Object.fromEntries(Object.entries(per).map(([comp,m])=>[comp,Object.values(m).sort((a,b)=>b-a)[0]]));};
 const tables=leagues.map(l=>{const ids=career.world.clubs.filter(x=>x.countryId===l.country&&x.leagueId).map(x=>x.id),t=call('v62Table',l,ids);return{id:l.id,spread:t[0].points-t.at(-1).points,champion:t[0].points,last:t.at(-1).points,gf:t.reduce((n,r)=>n+r.goalsFor,0)/Math.max(1,t.reduce((n,r)=>n+r.played,0))*2};});
 const league=rows.filter(r=>r.league),band=(lo,hi)=>{const g=gaps.filter(x=>x.gap>=lo&&x.gap<hi);return{n:g.length,fav:g.filter(x=>x.favWin).length/Math.max(1,g.length),draw:g.filter(x=>x.draw).length/Math.max(1,g.length),goals:mean(g.map(x=>x.goals))};};
 const players=career.world.clubs.flatMap(c=>c.roster),fresh=players.map(p=>p.fresh).filter(Number.isFinite);
 result.seasons.push({season,seconds:(Date.now()-t0)/1000,fixtures:rows.length,leagueFixtures:league.length,goalsPerMatch:mean(rows.map(r=>r.goals)),leagueGoalsPerMatch:mean(league.map(r=>r.goals)),goalsSd:sd(rows.map(r=>r.goals)),zeroZero:rows.filter(r=>r.goals===0).length/rows.length,homeWin:rows.filter(r=>r.home).length/rows.length,draw:rows.filter(r=>r.draw).length/rows.length,
  tableSpreadMean:mean(tables.map(t=>t.spread)),championPoints:mean(tables.map(t=>t.champion)),lastPoints:mean(tables.map(t=>t.last)),topScorerMax:Math.max(...Object.values(top(scorers))),topScorerLeagueMean:mean(Object.entries(top(scorers)).filter(([id])=>leagues.some(l=>l.id===id)).map(([,v])=>v)),topScorerLeagueMax:Math.max(...Object.entries(top(scorers)).filter(([id])=>leagues.some(l=>l.id===id)).map(([,v])=>v)),topScorerMean:mean(Object.values(top(scorers))),topAssistMax:Math.max(...Object.values(top(assisters))),topAssistLeagueMean:mean(Object.entries(top(assisters)).filter(([id])=>leagues.some(l=>l.id===id)).map(([,v])=>v)),topAssistMean:mean(Object.values(top(assisters))),
  teamStatsMean:marker==='183'?Object.fromEntries(['shots','onTarget','corners','crosses','fouls','freeKicks'].map(k=>[k,mean(rows.filter(r=>r.stats).map(r=>r.stats[k][0]+r.stats[k][1]))])):null,gaps:{'0-1':band(0,1),'1-2':band(1,2),'2-3':band(2,3),'>=3':band(3,99)},freshMean:mean(fresh),ratingMean:mean(ratings),ratingSd:sd(ratings),ratingAbove8:ratings.filter(x=>x>=8).length/Math.max(1,ratings.length),ratingBelow5:ratings.filter(x=>x<5).length/Math.max(1,ratings.length)});
 console.log(JSON.stringify({marker,seed,size,season,...result.seasons.at(-1),gaps:undefined}));
 if(season<seasons){if(career.world.transition?.choice===null)call('v67ChooseOffer',career);call('v62NextSeason',career);}
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,1));
}
console.log('done',out);
