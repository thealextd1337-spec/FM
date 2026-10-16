'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {harness}=require('./youth-native-harness-v176.cjs');
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
function suite(){
 const h=harness();h.run('world-expansion-stories-v170.js');h.run('world-youth-legacy-v176.js');
 let source=fs.readFileSync('dist/world-player-performance-v155.js','utf8'),original=h.evaluate('v155Event'),observation=null;
 globalThis.v178ObserveShot=(state,pid,context)=>{
  if(!observation)return;
  const side=state.active.includes(pid)?0:1,point=h.call('v155CompactPoint',state,pid,side),width=state.geometry?.width||44,length=state.geometry?.length||68;
  const distance=Math.hypot(point.x-width/2,point.y-(side?length:0)),role=state.roles[pid];
  observation.push({side,role,difficulty:context.difficulty,pressure:context.pressure,distanceMetres:distance,angleTerm:Math.abs(point.x-width/2)/22});
 };
 h.evaluate('const v178ObservedEventBase=v155Event;v155Event=function(state,pid,type,success,context={}){if(type===\'shot\')v178ObserveShot(state,pid,context);return v178ObservedEventBase(state,pid,type,success,context);};');
 function play(snapshot,descriptor,balance,options={}){
  const c=JSON.parse(snapshot);globalThis.v61CurrentCareer=c;
  const f={id:descriptor.fixtureId||descriptor.id,competitionId:'QA-START-LEAGUE',day:options.day,homeId:descriptor.homeId,awayId:descriptor.awayId,neutral:options.neutral??descriptor.neutral??false,result:null};
  const s=h.call('v64MakeState',c,f);
  // New matches carry marker 183 since SI-6; the v178 reproduction restores the frozen 178 marker and parameters.
  const downgrade=()=>{s.playerPerformance.shotBalanceRevision=178;s.playerPerformance.compactBalance=h.evaluate('({...v178CompactBalance})');};
  if(balance===null){s.playerPerformance.shotBalanceRevision=119;delete s.playerPerformance.compactBalance;}
  else if(balance){downgrade();s.playerPerformance.compactBalance={version:178,...balance};}
  else if(options.revision===178)downgrade();
  assert(s.roleAssignments&&s.playerLoad&&s.playerPerformance);assert(f.plan.home.coachId&&f.plan.away.coachId);assert(Object.values(s.fresh).every(x=>x===100));
  observation=options.observe?[]:null;let ticks=0,checkpoint=null;
  while(s.phase!=='finished'&&ticks++<110){h.call('v64Step',c,f,s);if(options.checkpoint&&s.minute===27)checkpoint=JSON.stringify({career:c,fixture:f,state:s});}
  const shotSamples=observation;observation=null;assert.equal(s.phase,'finished');assert.equal(s.minute,s.fullTimeEnd);
  const selected={score:s.score,events:s.events,stats:s.stats,fresh:s.fresh,minutes:s.minutes,tactics:s.tactics,tacticChanges:s.tacticChanges,substitutions:s.substitutions,performance:s.playerPerformance,roles:s.roleAssignments};
  const nativeHash=sha(JSON.stringify(selected)),eventHash=sha(JSON.stringify(s.events)),fullHash=sha(JSON.stringify({fixture:f,state:s}));
  const shots=s.playerPerformance.events.filter(e=>e.type==='shot'),stats=side=>{const club=c.world.clubs.find(club=>club.id===(side===0?f.homeId:f.awayId)),ids=new Set(club.roster.map(p=>p.pid));const events=shots.filter(e=>ids.has(e.playerId)),count=Object.entries(s.stats).filter(([id])=>ids.has(id)).reduce((n,[,p])=>n+p.shots,0);assert.equal(events.length,count);return{goals:s.score[side],shots:count,onTarget:events.filter(e=>e.success).length};};
  const home=stats(0),away=stats(1);assert(home.goals<=home.onTarget&&away.goals<=away.onTarget);
  const recordedShots=options.observe?s.playerPerformance.events.filter(e=>e.type==='shot').map(e=>({difficulty:e.context.difficulty,pressure:e.context.pressure})):null;
  const record=h.call('v64FinishFixture',c,f,s);assert.deepEqual(record.score,s.score);assert.equal(h.call('v64FinishFixture',c,f,s),record,'No double booking');
  for(const side of [0,1]){const rows=record.players.filter(p=>p.side===side);assert.equal(rows.reduce((n,p)=>n+p.goals,0),s.score[side]);assert.equal(rows.reduce((n,p)=>n+p.shots,0),side===0?home.shots:away.shots);assert(rows.every(p=>p.rating!==undefined));}
  return{home,away,nativeHash,eventHash,fullHash,minute:s.minute,checkpoint,recordedShots,shotSamples,career:c,fixture:f,state:s};
 }
 return{...h,play,sha,get source(){return source;},takeObservation(){return null;}};
}
function summary(rows){const sum=(s,k)=>rows.reduce((n,r)=>n+r[s][k],0);const games=rows.length,aGoals=sum('a','goals'),bGoals=sum('b','goals'),aShots=sum('a','shots'),bShots=sum('b','shots');return{games,aWins:rows.filter(r=>r.a.goals>r.b.goals).length,draws:rows.filter(r=>r.a.goals===r.b.goals).length,bWins:rows.filter(r=>r.a.goals<r.b.goals).length,aGoals,bGoals,aShots,bShots,aOnTarget:sum('a','onTarget'),bOnTarget:sum('b','onTarget'),goalsPerGame:(aGoals+bGoals)/games,shotsPerGame:(aShots+bShots)/games,zeroZero:rows.filter(r=>r.a.goals+r.b.goals===0).length,aConversion:aGoals/aShots,bConversion:bGoals/bShots};}
module.exports={suite,summary,sha};
