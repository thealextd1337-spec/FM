'use strict';
// Measurement only: unchanged production compact controller, fresh start per game.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const sourceHashes=Object.fromEntries(fs.readdirSync('dist').filter(f=>f.endsWith('.js')).map(f=>[f,sha(fs.readFileSync('dist/'+f))]));
const measured=JSON.parse(fs.readFileSync('outputs/start-roster-strength/measurement.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('outputs/top-bottom-matches/results.json','utf8'));
assert.equal(measured.generationVersion,3);assert.equal(measured.worlds.length,30);
assert.deepEqual(sourceHashes,measured.sourceHashes);assert.deepEqual(sourceHashes,baseline.sourceHashes);
const ordered=kind=>measured.worlds[0].clubs.filter(c=>c.kind===kind).map(c=>({...c,mean:measured.worlds.reduce((s,w)=>s+w.clubs.find(x=>x.clubId===c.clubId).meanQuality,0)/30})).sort((a,b)=>b.mean-a.mean||a.clubId.localeCompare(b.clubId));
const league=ordered('league'),cup=ordered('cup'),publicClub=c=>({id:c.clubId,name:c.name,country:c.country,kind:c.kind});
const groups={top:league.slice(0,10).map(publicClub),bottom:league.slice(-10).map(publicClub),cup:cup.slice(0,10).map(publicClub),largeMiddle:['ENG','ESP','GER','ITA','FRA'].flatMap(country=>league.filter(c=>c.country===country).slice(2,4).map(publicClub)),smallTop:['AUT','SUI','TUR'].flatMap(country=>league.filter(c=>c.country===country).slice(0,2).map(publicClub))};
assert.equal(league.length,96);assert.equal(cup.length,96);assert.equal(groups.largeMiddle.length,10);assert.equal(groups.smallTop.length,6);
assert(!Object.values(groups).flat().some(c=>c.id==='AUT-5'),'All measured clubs need native AI coaches');
const {harness}=require('./youth-native-harness-v176.cjs'),{call,run,copy}=harness();run('world-expansion-stories-v170.js');run('world-youth-legacy-v176.js');
const seeds=[0,7,14,21,29].map(i=>measured.worlds[i]),matches=[],controls=[],rounds=[],checks=[];
const combinations=xs=>xs.flatMap((a,i)=>xs.slice(i+1).map(b=>[a,b]));
function summary(list){
 const sum=key=>list.reduce((s,m)=>s+m[key],0),goals=sum('aGoals')+sum('bGoals'),shots=sum('aShots')+sum('bShots');
 return {games:list.length,aWins:list.filter(m=>m.aGoals>m.bGoals).length,draws:list.filter(m=>m.aGoals===m.bGoals).length,bWins:list.filter(m=>m.aGoals<m.bGoals).length,aGoals:sum('aGoals'),bGoals:sum('bGoals'),aShots:sum('aShots'),bShots:sum('bShots'),aOnTarget:sum('aOnTarget'),bOnTarget:sum('bOnTarget'),aPasses:sum('aPasses'),bPasses:sum('bPasses'),aComplete:sum('aComplete'),bComplete:sum('bComplete'),zeroZero:list.filter(m=>m.aGoals===0&&m.bGoals===0).length,atMostOneGoal:list.filter(m=>m.aGoals+m.bGoals<=1).length,goalsPerGame:goals/list.length,shotsPerGame:shots/list.length,aConversion:sum('aGoals')/sum('aShots'),bConversion:sum('bGoals')/sum('bShots'),aOnTargetRate:sum('aOnTarget')/sum('aShots'),bOnTargetRate:sum('bOnTarget')/sum('bShots'),aGoalsPerOnTarget:sum('aGoals')/sum('aOnTarget'),bGoalsPerOnTarget:sum('bGoals')/sum('bOnTarget')};
}
let snapshot,day,round,seed;
function play(suite,a,b,aHome,tag,neutral=false,fixtureId=null){
 const career=JSON.parse(snapshot);globalThis.v61CurrentCareer=career;
 const f={id:fixtureId||`QA:FOLLOWUP:${suite}:R${round}:${tag}`,competitionId:'QA-START-LEAGUE',day,homeId:aHome?a.id:b.id,awayId:aHome?b.id:a.id,neutral,result:null};
 const s=call('v64MakeState',career,f);let ticks=0;
 assert(s.playerLoad&&s.playerPerformance&&s.roleAssignments);assert([119,178].includes(s.playerPerformance.shotBalanceRevision));
 assert(f.plan.home.coachId&&f.plan.away.coachId);assert.equal(s.active.length,6);assert.equal(s.awayActive.length,6);
 assert(Object.values(s.fresh).every(v=>v===100));
 while(s.phase!=='finished'&&ticks++<110)call('v64Step',career,f,s);
 assert.equal(s.phase,'finished');assert(s.minute>=90&&s.minute<=100);
 const nativeHash=sha(JSON.stringify({score:s.score,events:s.events,stats:s.stats,fresh:s.fresh,minutes:s.minutes,tactics:s.tactics,tacticChanges:s.tacticChanges,substitutions:s.substitutions,performance:s.playerPerformance,roles:s.roleAssignments}));
 const record=call('v64FinishFixture',career,f,s),events=s.playerPerformance.events;
 const stats=side=>{const ids=new Set(career.world.clubs.find(c=>c.id===(side===0?f.homeId:f.awayId)).roster.map(p=>p.pid)),rows=record.players.filter(p=>p.side===side),shots=events.filter(e=>ids.has(e.playerId)&&e.type==='shot'),passes=events.filter(e=>ids.has(e.playerId)&&e.type==='pass');const sum=key=>rows.reduce((v,p)=>v+(p[key]||0),0);assert.equal(sum('shots'),shots.length);assert.equal(sum('goals'),s.score[side]);return{goals:sum('goals'),shots:sum('shots'),onTarget:shots.filter(e=>e.success).length,passes:passes.length,complete:passes.filter(e=>e.success).length};};
 const sa=stats(aHome?0:1),sb=stats(aHome?1:0);assert(sa.goals<=sa.onTarget&&sb.goals<=sb.onTarget);
 return {suite,round,seed,key:`${suite}:R${round}:${tag}:${neutral?'neutral':'home'}`,fixtureId:f.id,aId:a.id,bId:b.id,aHome,neutral,homeId:f.homeId,awayId:f.awayId,aGoals:sa.goals,bGoals:sb.goals,aShots:sa.shots,bShots:sb.shots,aOnTarget:sa.onTarget,bOnTarget:sb.onTarget,aPasses:sa.passes,bPasses:sb.passes,aComplete:sa.complete,bComplete:sb.complete,minute:s.minute,nativeHash};
}
for(let k=0;k<5;k++){
 const measuredWorld=seeds[k],base=call('v167CreateCareer','AUT-5',measuredWorld.seed,'Startkaderanalyse');seed=measuredWorld.seed;round=k+1;
 assert(call('v61ValidateCareer',base));assert(base.world.clubs.every(c=>c.roster.every(p=>p.fresh===100&&p.history.length===0&&p.playerModel.development.processedAppearances.length===0)));
 for(const c of base.world.clubs)assert(Math.abs(c.roster.reduce((s,p)=>s+call('v177Quality',p),0)/11-measuredWorld.clubs.find(x=>x.clubId===c.id).meanQuality)<1e-8);
 snapshot=JSON.stringify(base);const startHash=sha(snapshot);day=Math.min(...base.world.competitions.filter(c=>c.type==='league').flatMap(c=>c.fixtures.map(f=>f.day)));
 for(const [suite,group]of [['top-top',groups.top],['bottom-bottom',groups.bottom]]){
  const pool=combinations(group);
  for(let i=0;i<10;i++){const [a,b]=pool[(k*10+i)%pool.length];for(const home of [true,false]){const tag=`P${i}:${home?'AB':'BA'}`,m=play(suite,a,b,home,tag);matches.push(m);if(suite==='top-top'&&i===0&&home)assert.deepEqual(play(suite,a,b,home,tag),m,'Deterministic replay');}}
 }
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)matches.push(play('league-cup',groups.bottom[i],groups.cup[j],(i+j+k)%2===0,`P${i}-${j}`));
 for(let i=0;i<10;i++)for(let j=0;j<6;j++)matches.push(play('overlap',groups.largeMiddle[i],groups.smallTop[j],(i+j+k)%2===0,`P${i}-${j}`));
 for(let i=0;i<10;i++)for(const home of [true,false]){
  const a=groups.top[i],b=groups.bottom[(i+k)%10],tag=`P${i}:${home?'AB':'BA'}`,m=play('home-mirror',a,b,home,tag),control=play('home-neutral-control',a,b,home,tag,true,m.fixtureId);
  matches.push(m,control);controls.push({round,seed,fixtureId:m.fixtureId,aId:a.id,bId:b.id,aHome:home,identicalScore:m.aGoals===control.aGoals&&m.bGoals===control.bGoals,identicalRecordedState:m.nativeHash===control.nativeHash});
 }
 assert.equal(sha(JSON.stringify(base)),startHash,'Original start world remains unchanged');
 const rows=Object.fromEntries(['top-top','bottom-bottom','league-cup','overlap','home-mirror','home-neutral-control'].map(suite=>[suite,summary(matches.filter(m=>m.round===round&&m.suite===suite))]));rounds.push({round,seed,series:rows});
 console.log('PASS round '+round+'/5, '+matches.length+'/1200 games: '+JSON.stringify(Object.fromEntries(Object.entries(rows).map(([s,r])=>[s,{games:r.games,result:[r.aWins,r.draws,r.bWins],goals:[r.aGoals,r.bGoals]}]))));
}
const series=Object.fromEntries(['top-top','bottom-bottom','league-cup','overlap','home-mirror','home-neutral-control'].map(suite=>[suite,summary(matches.filter(m=>m.suite===suite))]));
assert.equal(matches.length,1200);assert.equal(new Set(matches.map(m=>m.key)).size,1200);
for(const [suite,expected]of [['top-top',100],['bottom-bottom',100],['league-cup',500],['overlap',300],['home-mirror',100],['home-neutral-control',100]])assert.equal(series[suite].games,expected);
for(const suite of ['league-cup','overlap']){
 const subset=matches.filter(m=>m.suite===suite),left=suite==='league-cup'?groups.bottom:groups.largeMiddle,right=suite==='league-cup'?groups.cup:groups.smallTop;
 for(const a of left)for(const b of right)assert.equal(subset.filter(m=>m.aId===a.id&&m.bId===b.id).length,5);
 for(const c of [...left,...right]){const own=subset.filter(m=>m.aId===c.id||m.bId===c.id);assert.equal(own.filter(m=>m.homeId===c.id).length,own.length/2);}
}
assert.equal(controls.length,100);
for(const [f,h]of Object.entries(sourceHashes))assert.equal(sha(fs.readFileSync('dist/'+f)),h);
const mirror=matches.filter(m=>m.suite==='home-mirror'),home={aHome:summary(mirror.filter(m=>m.aHome)),aAway:summary(mirror.filter(m=>!m.aHome)),neutralPairs:100,identicalScore:controls.filter(c=>c.identicalScore).length,identicalRecordedState:controls.filter(c=>c.identicalRecordedState).length};
const originalConversion={a:baseline.total.topGoals/baseline.total.topShots,b:baseline.total.bottomGoals/baseline.total.bottomShots};
checks.push('1200 complete native compact games plus five exact replays','unchanged production controllers and source hashes','all initial rosters reproduce measurement budgets','full initial freshness and independent JSON copy per game','native AI, roles, load, shots and match ratings','goal totals, on-target shots and match record reconcile','all initial worlds remain unchanged','league-cup and overlap: every pair five times with balanced home status','100 mirrored games and 100 paired neutral controls');
const report={createdAt:new Date().toISOString(),generationVersion:3,sourceHashes,engine:'Production compact v64/v155/v158, no score injection, no physical or Unity series',scope:'Initial contracted squads only; no youth pool, transfers, preceding matches or carried development',selection:'Fixed club groups by mean initial squad quality across the same thirty worlds. League-cup uses the TEN STRONGEST cup-only clubs, a closest-gap stress comparison. Large ranks 3/4 and AUT/SUI/TUR ranks 1/2 use country ranking by the same mean.',design:'Five original measurement seeds; independent full JSON world copy per game; native AI tactics, lineups, substitutions and in-match fatigue. Reference series: ten unordered pairings per world, each played in both orientations; cycles cover all forty-five unordered pairings. League-cup and overlap: all cross-pairs once per seed. Home: ten mixed-strength pairs per seed in both orientations; neutral twin keeps seed, fixture ID, side assignment and roster unchanged, varying only fixture.neutral.',games:1200,diagnosticReplays:5,groups,series,home,originalConversion,rounds,controls,matches,checks,codeFindings:[{file:'dist/world-match-v64.js',function:'v64Step',finding:'The computed chance includes strength difference, line/risk effects and home bonus .002, but is used only by the branch without playerPerformance. Current marked worlds call v155CompactActions with no chance argument.'},{file:'dist/world-player-performance-v155.js',function:'v155CompactActions',finding:'Current shot occurrence is .09 after completed pass and survived contact. On-target uses finishing and receiver pressure; conversion uses finishing versus keeping and shotDifficulty. No fixture.neutral or computed v64 chance is consumed. No isolated causal estimate for finishing versus keeping from team aggregates.'}]};
report.nativeHashScope=['score','events','stats','fresh','minutes','tactics','tacticChanges','substitutions','performance','roles'];
fs.mkdirSync('outputs/strength-followup',{recursive:true});fs.writeFileSync('outputs/strength-followup/results.json',JSON.stringify(report,null,2));
const names=new Map(Object.values(groups).flat().map(c=>[c.id,c.name])),quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
const rows=[['Serie','Lauf','Startwelt','Heimverein','Gastverein','Heimtore','Gasttore','Gruppe-A-Verein','Gruppe-B-Verein','A-Tore','B-Tore','A-Schüsse','B-Schüsse','A-aufs-Tor','B-aufs-Tor','Neutral','Fixture-ID'],...matches.map(m=>[m.suite,m.round,m.seed,names.get(m.homeId),names.get(m.awayId),m.aHome?m.aGoals:m.bGoals,m.aHome?m.bGoals:m.aGoals,names.get(m.aId),names.get(m.bId),m.aGoals,m.bGoals,m.aShots,m.bShots,m.aOnTarget,m.bOnTarget,m.neutral,m.fixtureId])];
fs.writeFileSync('outputs/strength-followup/einzelspiele.csv','\ufeff'+rows.map(row=>row.map(quote).join(';')).join('\r\n')+'\r\n');
console.log(JSON.stringify({passed:true,games:1200,series,home,originalConversion}));
