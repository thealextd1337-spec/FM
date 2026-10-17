'use strict';
// SI-6 / P02: the compact simulation of new matches follows the played-out match (marker 183).
// Checks the mechanism (stored snapshot, size mapping, shot rate, sources, statistics, load) and that the
// older identifiers 178, 119 and "unmarked" stay frozen: their full matches must equal the frozen
// controller of commit a95fe8d2 (outputs/compact-balance-v183/baseline-v178-controller.js).
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const {suite}=require('./compact-balance-harness-v178.cjs'),h=suite(),checks=[];
const frozenSource=fs.readFileSync('outputs/compact-balance-v183/baseline-v178-controller.js','utf8');
const names=['v155Initialize','v178CompactShotChance','v155CompactActions','v64Step'];
globalThis.v183Current=Object.fromEntries(names.map(name=>[name,h.evaluate(name)]));
const useFrozen=()=>h.evaluate(frozenSource),useCurrent=()=>h.evaluate(names.map(name=>`${name}=v183Current.${name};`).join(''));
const LARGE={fieldSize:'large',fieldPlayers:6};

function create(seed,options){return h.call('v167CreateCareer','AUT-5',seed,'QA',options);}
function initial(seed,revision,options){
 const c=create(seed,options),day=Math.min(...c.world.competitions.filter(x=>x.type==='league').flatMap(x=>x.fixtures.map(f=>f.day))),f={id:'QA:SI6:'+seed,competitionId:'QA-START-LEAGUE',homeId:'GER-1',awayId:'GER-6',day,neutral:false,result:null};globalThis.v61CurrentCareer=c;
 const s=h.call('v64MakeState',c,f);
 if(revision!==183){
  // The frozen identifiers are rebuilt the way their constructors wrote them.
  if(revision===178){s.playerPerformance.shotBalanceRevision=178;s.playerPerformance.compactBalance=h.evaluate('({...v178CompactBalance})');}
  else{delete s.playerPerformance.compactBalance;if(revision===119)s.playerPerformance.shotBalanceRevision=119;else delete s.playerPerformance.shotBalanceRevision;}
 }
 return{c,f,s};
}
function finish(x,until=Infinity){globalThis.v61CurrentCareer=x.c;while(x.s.phase!=='finished'&&x.s.minute<until)h.call('v64Step',x.c,x.f,x.s);if(x.s.phase==='finished')h.call('v64FinishFixture',x.c,x.f,x.s);return x;}

// 1. Snapshot: size mapping, independence and frozen constants.
{
 const standard=h.call('v183CompactSnapshot',create('si6-size-a')),large=h.call('v183CompactSnapshot',create('si6-size-b',LARGE)),constants=h.evaluate('v183CompactBalance');
 assert.equal(standard.fieldSize,'standard');assert.equal(large.fieldSize,'large');assert.equal(standard.version,183);
 assert.equal(standard.shotBase,constants.sizes.standard.shotBase);assert.equal(large.shotBase,constants.sizes.large.shotBase);
 assert(Math.abs(large.shotSlope-standard.shotSlope)<.02,'both pitches: the strength gap acts on the shots with a similar slope (series sb2-f: 0.122 / 0.125; the large pitch has its own finishing levers)');assert(large.levers.goalFin>standard.levers.goalFin&&large.levers.finSelf===1&&standard.levers.finSelf===1,'per-pitch levers: finishing counts more on the large pitch');
 assert.deepEqual(h.call('v183CompactSnapshot',{}),standard,'no match configuration (older careers) counts as standard pitch');
 assert(Object.isFrozen(constants)&&Object.isFrozen(constants.sizes.standard),'constants are frozen');
 standard.shotBase=99;assert.notEqual(h.evaluate('v183CompactBalance.sizes.standard.shotBase'),99,'snapshot is a copy');
 checks.push('snapshot follows the pitch size, older careers count as standard, constants frozen and copied');
}

// 2. New matches carry marker 183 and their own snapshot; existing performance state is never re-marked.
{
 const a=initial('si6-new-a',183),b=initial('si6-new-b',183,LARGE);
 assert.equal(a.s.playerPerformance.shotBalanceRevision,183);assert.deepEqual(a.s.playerPerformance.compactBalance,h.call('v183CompactSnapshot',a.c));
 assert.equal(a.s.playerPerformance.compactBalance.fieldSize,'standard');assert.equal(b.s.playerPerformance.compactBalance.fieldSize,'large');assert(b.s.geometry.length>68);
 for(const revision of [178,119,undefined]){const x=initial('si6-old-'+revision,revision),before=JSON.stringify(x.s.playerPerformance);h.call('v155Initialize',x.c,x.s);assert.equal(JSON.stringify(x.s.playerPerformance),before,'existing performance state stays as it is');}
 const model={world:{playerFoundation:{parameterId:'wave2-local-candidate-1'}}},unmarked={};h.call('v155Initialize',model,unmarked);assert.deepEqual(unmarked,{},'worlds without the player foundation stay unmarked');
 checks.push('new matches store marker 183 and the pitch snapshot; initialisation never re-marks existing states');
}

// 3. Shot rate: gap, small relative home bonus, neutral pitch, deep defensive line.
{
 const B=h.call('v183CompactSnapshot',create('si6-rate'));
 const rate=(gap,home,deep)=>h.call('v183ShotRate',B,10+gap,10,home,deep);
 assert.equal(rate(0,false,false),B.shotBase);assert.equal(rate(0,true,false),B.shotBase*B.homeShotFactor);assert.equal(B.homeShotFactor,1.03);
 assert(rate(1,false,false)>rate(0,false,false)&&rate(0,false,false)>rate(-1,false,false),'shots rise with the strength gap');
 assert.equal(rate(0,false,true),B.shotBase*B.deepDefenceShots);
 assert(Math.abs(rate(B.gapKnee,false,false)-B.shotBase*Math.exp(B.shotSlope*B.gapKnee))<1e-9,'unchanged up to the knee');
 assert(rate(B.gapKnee+3,false,false)<B.shotBase*Math.exp(B.shotSlope*(B.gapKnee+3)),'beyond the knee the gap acts only with the factor gapOver');
 assert(Math.abs(rate(5,false,true)-B.shotBase*Math.exp(B.shotSlope*5)*B.deepDefenceShots)<1e-9,'no plateau below the gap knee, also with the deep line');
 const wide=B.shotBase*Math.exp(B.shotSlope*(B.gapKnee+(9-B.gapKnee)*B.gapOver))*B.homeShotFactor*B.deepDefenceShots;
 assert(wide>B.shotKnee&&rate(9,true,true)<wide&&rate(9,true,true)>B.shotKnee,'plateau of the favourite shots at the widest gaps');
 assert(Math.abs(rate(9,true,true)-(B.shotKnee+(wide-B.shotKnee)*B.shotOver))<1e-9,'full plateau beyond the fade');
 {const gap=B.gapKnee+B.gapFade/2,free=B.shotBase*Math.exp(B.shotSlope*(B.gapKnee+B.gapFade/2*B.gapOver))*B.homeShotFactor*B.deepDefenceShots,full=B.shotKnee+(free-B.shotKnee)*B.shotOver,half=rate(gap,true,true);assert(free>B.shotKnee&&half<free&&half>full&&Math.abs(half-(free+full)/2)<1e-9,'the plateau fades in over gapFade points beyond the knee');}
 checks.push('shot rate: strength gap, 3 % home bonus only for the home side, deep defensive line of the opponent');
}

// 3b. Levers of the shot result: finishing raises, the keeper lowers the chance (played-out reference levers).
{
 const B=h.call('v183CompactSnapshot',create('si6-odds')),odds=(fin,gk,gap=0,source='open')=>h.call('v183ShotOdds',B,source,fin,gk,gap);
 assert(odds(14,12).onTarget>odds(10,12).onTarget&&odds(14,12).goal>odds(10,12).goal,'finishing');
 assert(odds(12,16).goal<odds(12,12).goal&&odds(12,16).onTarget===odds(12,12).onTarget,'the keeper only acts on the goal chance');
 assert(odds(12,12,3).onTarget>odds(12,12,0).onTarget&&odds(12,12,3).goal===odds(12,12,0).goal,'strength gap only acts on the frame chance');
 const drop=odds(12.5,12).goal-odds(12.5,16.5).goal;assert(drop>.10&&drop<.20,'keeper 12 against 16.5 points: about 14 points of goals per shot on target ('+drop.toFixed(3)+')');
 assert(odds(13,13,0,'header-volley').goal>odds(13,13,0,'long').goal,'sources differ');
 checks.push('shot result levers: finishing, keeper (gk) and gap act on the intended step');
}

// 3c. Within a team the own finishing deviation counts only with the share finSelf (played-out best finishers convert
// hardly better than their team-mates); the expected shooter of the team keeps the full cross-team lever.
{
 const x=initial('si6-self',183),stored=x.s.playerPerformance.compactBalance,team=h.call('v183CompactTeams',x.c,x.f,x.s)[0];
 assert.equal(stored.levers.finSelf,1,'fitted set (sb2-f): the best finisher of a team converts better again, no within-team shrink');
 // The mechanism stays for stored snapshots of 0.3 (SI-K2 fit) and for later fits.
 const B={...stored,levers:{...stored.levers,finSelf:.3}};
 for(const source of ['open','long','header-volley']){
  const weight=h.call('v183ShooterWeight',B,source,team,x.s),total=team.ids.reduce((n,pid)=>n+weight(pid),0);
  const centre=team.ids.reduce((n,pid)=>n+weight(pid)*team.skills[pid].fin,0)/total,adjusted=pid=>h.call('v183ShooterFinishing',B,source,team,x.s,pid,team.skills[pid].fin);
  assert(Math.abs(team.ids.reduce((n,pid)=>n+weight(pid)*adjusted(pid),0)/total-centre)<1e-9,'expected shooter keeps his finishing ('+source+')');
  const best=team.ids.reduce((a,b)=>team.skills[b].fin>team.skills[a].fin?b:a);
  assert(Math.abs(adjusted(best)-(centre+B.levers.finSelf*(team.skills[best].fin-centre)))<1e-9,'own deviation shrinks with finSelf ('+source+')');
 }
 assert.equal(h.call('v183ShooterFinishing',{...B,levers:{...B.levers,finSelf:1}},'open',team,x.s,team.ids[0],12.3),12.3,'share 1 keeps the finishing');
 checks.push('within-team finishing share: expected shooter unchanged, own deviation counts with finSelf');
}

// 3d. Score state (leader manages the lead, trailing side pushes, late caution while level): relative change of the expected shots from the
// score difference of the side; matches without the block in their stored snapshot behave as before (factor 1).
{
 const B=h.call('v183CompactSnapshot',create('si6-state')),S=B.scoreState,factor=(a,b,minute,side=0,balance=B)=>h.call('v183ScoreFactor',balance,{score:[a,b],minute},side);
 assert(S.lead1<0&&S.lead2<0,'the leader shoots less');assert(S.trail1>0&&S.trail2>0,'the trailing side shoots more');
 assert.equal(factor(1,0,30),1+S.lead1);assert.equal(factor(0,1,30),1+S.trail1);assert.equal(factor(2,0,30),1+S.lead2);assert.equal(factor(0,3,30),1+S.trail2);
 assert.equal(factor(1,0,30,1),1+S.trail1,'the factor follows the side asked for');assert.equal(factor(2,1,80,1),1+S.trail1);
 assert.equal(factor(0,0,10),1+S.level*0,'level early: no change');
 const late={...B,scoreState:{...S,level:-.2,levelFrom:.5}};
 assert.equal(factor(1,1,45,0,late),1,'level before levelFrom');assert(Math.abs(factor(1,1,90,0,late)-.8)<1e-9,'level at the end: full term');assert(Math.abs(factor(0,0,67.5,0,late)-.9)<1e-9,'level term grows linearly');
 const old={...B};delete old.scoreState;assert.equal(factor(3,0,80,0,old),1,'snapshots without the block: no score state');
 checks.push('score state: leader/trailer/level factors, side-aware, absent block neutral');
}

// 4. Home bonus on played matches: only side 0 on a non-neutral pitch asks for it (spy on the rate function).
{
 globalThis.v183Spy=[];h.evaluate('globalThis.v183RateOriginal=v183ShotRate;v183ShotRate=function(B,own,other,home,deep){v183Spy.push(home);return v183RateOriginal(B,own,other,home,deep);};');
 const homeMatch=finish(initial('si6-home',183)),homeCalls=globalThis.v183Spy.splice(0),neutralMatch=initial('si6-home',183);neutralMatch.f.neutral=true;finish(neutralMatch);const neutralCalls=globalThis.v183Spy.splice(0);
 h.evaluate('v183ShotRate=v183RateOriginal;');
 assert(homeCalls.length>150&&homeCalls.every((value,index)=>value===(index%2===0)),'home bonus only for the home side on a normal pitch');
 assert(neutralCalls.length>150&&neutralCalls.every(value=>value===false),'no bonus on a neutral pitch');
 assert(homeMatch.s.compactStats&&neutralMatch.s.compactStats);
 checks.push('home bonus only for side 0 on a non-neutral pitch, none on neutral ground');
}

// 5. Frozen identifiers: full matches equal the frozen controller of commit a95fe8d2.
for(const revision of [178,119,undefined]){
 const seed='si6-frozen-'+revision;
 useFrozen();const reference=finish(initial(seed,revision));useCurrent();
 const checkpoint=finish(initial(seed,revision),27),saved=JSON.stringify(checkpoint),direct=finish(checkpoint),loaded=finish(JSON.parse(saved));
 assert.equal(JSON.stringify(direct),JSON.stringify(loaded),'JSON continuation exact');
 assert.deepEqual(direct.s,reference.s,`match with identifier ${revision} equals the frozen controller`);assert.deepEqual(direct.c.world.clubs,reference.c.world.clubs,'books, form and development equal the frozen controller');assert.deepEqual(direct.f.matchRecord,reference.f.matchRecord);
 assert.equal(direct.s.compactStats,undefined,'old matches get no new statistics');assert.equal(direct.f.matchRecord.teamStats,undefined);
 checks.push('full match with identifier '+String(revision)+' equals the frozen controller and resumes exactly');
}

// 6. Marker 183: stored snapshot owns the continuation, JSON resume exact, booking idempotent, statistics consistent.
{
 const a=initial('si6-resume',183),checkpoint=finish(a,27),saved=JSON.stringify(checkpoint),before=JSON.stringify(checkpoint.s.playerPerformance);
 h.call('v155Initialize',checkpoint.c,checkpoint.s);assert.equal(JSON.stringify(checkpoint.s.playerPerformance),before);
 const shotsAt27=checkpoint.s.compactStats.shots.slice(),quiet=JSON.parse(saved),running=JSON.parse(saved);quiet.s.playerPerformance.compactBalance.shotBase=0;
 finish(quiet);finish(running);
 assert.deepEqual(quiet.s.compactStats.shots,shotsAt27,'the stored shot rate is the one that counts: rate 0 gives no further shots');
 assert(running.s.compactStats.shots[0]+running.s.compactStats.shots[1]>shotsAt27[0]+shotsAt27[1],'unchanged snapshot continues with shots');
 const direct=finish(checkpoint),loaded=finish(JSON.parse(saved));assert.equal(JSON.stringify(direct),JSON.stringify(loaded),'JSON continuation exact');
 const record=direct.f.matchRecord,books=JSON.stringify(direct.c.world.clubs);assert.equal(h.call('v64FinishFixture',direct.c,direct.f,direct.s),record);assert.equal(JSON.stringify(direct.c.world.clubs),books,'idempotent booking');
 checks.push('marker 183: stored snapshot owns the continuation; JSON resume exact; booking idempotent');
}

// 7. Statistics are consistent with the events and the player lines; no result is forced.
{
 const scores=new Set();let withFouls=0,withCorners=0,crossesAboveHeaders=true;
 for(const [index,options] of [[0,undefined],[1,LARGE],[2,undefined],[3,LARGE],[4,undefined],[5,LARGE]]){
  const x=finish(initial('si6-stats-'+index,183,options)),s=x.s,cs=s.compactStats,record=x.f.matchRecord;scores.add(s.score.join(':'));
  assert.deepEqual(record.teamStats,cs);assert.notEqual(record.teamStats,cs,'record gets a copy');
  const players=side=>record.players.filter(p=>p.side===side);
  for(const side of [0,1]){
   assert.equal(players(side).reduce((n,p)=>n+p.shots,0),cs.shots[side]);assert.equal(players(side).reduce((n,p)=>n+p.goals,0),s.score[side]);
   assert.equal(players(side).reduce((n,p)=>n+p.fouls,0),cs.fouls[side],'fouls booked on the fouling team');
   assert(cs.onTarget[side]<=cs.shots[side]&&s.score[side]<=cs.onTarget[side]);
   assert.equal(Object.values(cs.sources).reduce((n,v)=>n+v[side],0),cs.shots[side],'every shot has a source');
   assert.equal(Object.values(cs.sourceGoals).reduce((n,v)=>n+v[side],0),s.score[side],'every goal has a source');
   assert(cs.freeKicks[side]>=cs.fouls[1-side],'free kicks include the opponent fouls');
  }
  const goals=s.events.filter(e=>e.type==='goal');assert.equal(goals.length,s.score[0]+s.score[1]);
  assert(goals.every(e=>e.source&&(e.assistPid===null||e.assistPid!==e.scorerPid)),'goal events carry the source; no self assist');
  assert(record.players.reduce((n,p)=>n+p.assists,0)<=goals.length);
  assert(cs.crosses[0]+cs.crosses[1]>=(cs.sources['header-volley']||[0,0]).reduce((a,b)=>a+b,0),'every header chance has its cross');
  withFouls+=cs.fouls[0]+cs.fouls[1];withCorners+=cs.corners[0]+cs.corners[1];
  for(const p of record.players)assert(Number.isFinite(p.rating),'rated lines');
 }
 assert(scores.size>=3,'results are drawn, not set');assert(withFouls>0&&withCorners>0,'fouls and corners are produced');
 checks.push('team statistics, sources and player lines agree with the events; results vary');
}

// 8. Role tables cover every outfield role of the role catalogue; goals/assists use the played-out roles.
{
 const constants=h.evaluate('v183CompactBalance'),roles=h.evaluate('D6PlayerRoles.ROLE_CATALOG').filter(role=>!role.positions.includes('gk')).map(role=>role.id);
 assert(roles.length>=11);
 for(const group of ['open','long','head','rebound','fk'])for(const role of roles)assert(constants.shooters[group].roles[role]>0,`${group} weight for ${role}`);
 for(const source of Object.keys(constants.sizes.standard.on))assert(constants.groups[source]&&Number.isFinite(constants.sizes.standard.goal[source])&&Number.isFinite(constants.sizes.large.on[source]));
 const total=name=>constants.sizes[name].mix.reduce((n,[,rate])=>n+rate,0);assert(Math.abs(total('standard')-12.26)<.1&&Math.abs(total('large')-11.47)<.1,'source mix sums to the reference shots (sb2-f)');
 checks.push('role and source tables are complete');
}

// 9. Load: the new running work lies in the band of the played-out reference; keeper and old states unchanged.
{
 const x=finish(initial('si6-load',183)),load=x.s.playerLoad,fresh=pid=>x.s.playerLoad.players[pid].freshness;
 const field=[...x.s.active,...x.s.awayActive].filter(pid=>x.s.roles[pid]!=='gk'&&x.s.minutes[pid]>=90).map(pid=>100-fresh(pid)),keepers=[...x.s.active,...x.s.awayActive].filter(pid=>x.s.roles[pid]==='gk').map(pid=>100-fresh(pid));
 const mean=a=>a.reduce((n,v)=>n+v,0)/a.length;
 assert(field.length>=6&&mean(field)>40&&mean(field)<68,'field consumption '+mean(field));assert(mean(keepers)>10&&mean(keepers)<26,'keeper consumption '+mean(keepers));
 assert(Object.hasOwn(x.s.playerPerformance.compactBalance.load.background,'att'));
 checks.push('freshness use of full-match players lies in the band of the played-out reference');
}

console.log('PASS '+checks.join('\nPASS '));
