'use strict';

// Additive facts for newly created careers only. Readers never generate history.
function v170Active(career){return v167Active(career)&&career.world.storyLog?.version===170;}
function v170Record(career,id,type,facts,day=career.world.calendarCursor){
 if(!v170Active(career))return;const log=career.world.storyLog;
 if(log.events.some(e=>e.id===id))return;
 const event={id,type,sequence:log.events.length+1,season:career.world.season,day:Math.max(0,day),...structuredClone(facts)};log.events.push(event);return event;
}
function v170Milestone(career,type,clubId,cup,fixture=null){
 return v170Record(career,`${type}:${clubId}${type==='europe-entry'?'':':'+cup.format}`,type,{clubId,competitionId:cup.id,...(fixture?{fixtureId:fixture.id}:{})},fixture?.day||0);
}
function v170SeasonEntry(career){
 if(!v170Active(career))return;for(const cup of v62Current(career).filter(c=>c.type==='europe'))for(const id of cup.entrants)v170Milestone(career,'europe-entry',id,cup);
}
function v170Fixture(career,fixture){
 if(!v170Active(career)||!fixture.result)return;const world=career.world,cup=world.competitions.find(c=>c.id===fixture.competitionId),own=career.manager.managedClubId;
 const ownSide=fixture.homeId===own?0:fixture.awayId===own?1:null;
 if(ownSide!==null){
  const opponent=ownSide===0?fixture.awayId:fixture.homeId;
  const former=career.manager.stationHistory?.find(s=>s.clubId===opponent&&s.fromSeason<=world.season&&s.toSeason<world.season);
  const previous=cup.type==='europe'?world.competitions.filter(c=>c.season<world.season&&c.type==='europe').flatMap(c=>c.fixtures).find(f=>['SF','F'].includes(f.round)&&[f.homeId,f.awayId].includes(own)&&[f.homeId,f.awayId].includes(opponent)&&f.result):null;
  if(former||previous)v170Record(career,`reunion:S${world.season}:${own}:${opponent}`,'reunion',{clubId:own,otherClubId:opponent,competitionId:cup.id,fixtureId:fixture.id,reason:former?'former-club':'previous-semifinal',...(previous&&!former?{previousFixtureId:previous.id}:{})},fixture.day);
 }
 // A decisive youth goal is claimed only for a one-goal final win without penalties.
 const r=fixture.result;if(fixture.round!=='F'||!r.winnerId||r.penalties||Math.abs(r.homeGoals-r.awayGoals)!==1)return;
 const side=r.winnerId===fixture.homeId?0:1,goals=(fixture.matchRecord?.events||[]).filter(e=>e.type==='goal'&&e.side===side),needed=(side===0?r.awayGoals:r.homeGoals)+1,goal=goals[needed-1];
 if(!goal?.scorerPid)return;
 const origin=world.careerEvents?.events.find(e=>e.type==='youth-promotion'&&e.pid===goal.scorerPid&&e.clubId===r.winnerId&&e.pid.startsWith(`${world.seed}:${r.winnerId}:Y`));
 if(origin)v170Record(career,`youth-final:${fixture.id}:${goal.scorerPid}`,'youth-final',{clubId:r.winnerId,competitionId:cup.id,fixtureId:fixture.id,pid:goal.scorerPid,playerName:origin.playerName,originEventId:origin.id,goal:structuredClone(goal)},fixture.day);
}
function v170Progress(career){
 if(!v170Active(career))return;
 for(const cup of v62Current(career).filter(c=>c.type==='europe')){
  for(const round of ['SF','F'])for(const id of new Set(cup.fixtures.filter(f=>f.round===round).flatMap(f=>[f.homeId,f.awayId]))){
   const source=cup.fixtures.find(f=>f.result?.winnerId===id&&f.round===(round==='SF'?'QF':'SF')&&f.leg===2);
   if(source)v170Milestone(career,round==='SF'?'semifinal':'final',id,cup,source);
  }
  if(cup.winnerId)v170Milestone(career,'title',cup.winnerId,cup,cup.fixtures.find(f=>f.round==='F'));
 }
}
function v170CountryPlaces(career){
 if(!v170Active(career))return;const w=career.world,record=w.countrySeasonValues.find(r=>r.season===w.season);if(!record)return;
 for(const country of w.countryRanking.slice(0,8).filter(id=>record.orderBefore.indexOf(id)>=8)){
  const row=record.countries.find(r=>r.country===country);
  for(const contribution of row.contributions.filter(c=>c.points>0))v170Record(career,`country-place:S${w.season}:${contribution.clubId}`,'country-place',{clubId:contribution.clubId,country,points:contribution.points,participants:row.participants,competitionId:contribution.competitionId,nextSeason:w.season+1},224);
 }
}
function v170History(career,{clubId,season}={}){
 const events=career.world.storyLog?.events||[];
 return structuredClone(events.filter(e=>(!clubId||e.clubId===clubId)&&(!season||e.season===season)).sort((a,b)=>b.season-a.season||b.day-a.day||b.sequence-a.sequence));
}
function v170OfficeEvents(career){
 const own=v66Club(career,career.manager.managedClubId),opponents=new Set(v62Current(career).filter(c=>c.type==='europe').flatMap(c=>c.fixtures.filter(f=>[f.homeId,f.awayId].includes(own.id)).flatMap(f=>[f.homeId,f.awayId])));
 const news=(career.world.eventLog.visibleNews||[]).filter(e=>e.season===career.world.season&&(v66Club(career,e.clubId)?.countryId===own.countryId||opponents.has(e.clubId))).slice(-5).map(e=>({...structuredClone(e),type:'coach-news',sequence:0}));
 return [...v170History(career,{clubId:own.id}),...news].sort((a,b)=>b.season-a.season||b.day-a.day||b.sequence-a.sequence);
}
function v170Read(career,id){if(!v170Active(career)||!v170OfficeEvents(career).some(e=>e.id===id))return false;const read=career.world.storyLog.readIds;if(!read.includes(id))read.push(id);return true;}
function v170Validate(career){
 try{
 const log=career.world.storyLog;if(log===undefined)return true;
 if(!v167Active(career)||!log||log.version!==170||!Array.isArray(log.events)||!Array.isArray(log.readIds)||new Set(log.readIds).size!==log.readIds.length)return false;
 const ids=new Set();for(const [i,e]of log.events.entries()){
  if(!e||typeof e.id!=='string'||ids.has(e.id)||e.sequence!==i+1||!Number.isInteger(e.season)||e.season<1||e.season>career.world.season||!Number.isInteger(e.day)||e.day<0||e.day>224||!v66Club(career,e.clubId))return false;ids.add(e.id);
  const cup=career.world.competitions.find(c=>c.id===e.competitionId&&c.season===e.season),f=cup?.fixtures.find(f=>f.id===e.fixtureId);if(!cup)return false;
  if(e.type==='europe-entry'){if(cup.type!=='europe'||!cup.entrants.includes(e.clubId)||e.id!==`europe-entry:${e.clubId}`||e.day!==0)return false;}
  else if(['semifinal','final','title'].includes(e.type)){
   const round={semifinal:'QF',final:'SF',title:'F'}[e.type];if(cup.type!=='europe'||!f||f.round!==round||f.result?.winnerId!==e.clubId||e.day!==f.day||e.id!==`${e.type}:${e.clubId}:${cup.format}`||(e.type==='title'&&cup.winnerId!==e.clubId))return false;
  }else if(e.type==='country-place'){
   const r=career.world.countrySeasonValues.find(r=>r.season===e.season),row=r?.countries.find(c=>c.country===e.country),part=row?.contributions.find(c=>c.clubId===e.clubId);
   const order=r&&v167Ranking(career.world.countrySeasonValues.filter(r=>r.season<=e.season),r.orderBefore).map(r=>r.country);
   if(!part||part.points<=0||part.competitionId!==cup.id||part.points!==e.points||row.participants!==e.participants||e.nextSeason!==e.season+1||r.orderBefore.indexOf(e.country)<8||order.indexOf(e.country)>=8||e.id!==`country-place:S${e.season}:${e.clubId}`||e.day!==224)return false;
  }else if(e.type==='reunion'){
   if(!f?.result||![f.homeId,f.awayId].includes(e.clubId)||![f.homeId,f.awayId].includes(e.otherClubId)||e.clubId===e.otherClubId||e.day!==f.day||e.id!==`reunion:S${e.season}:${e.clubId}:${e.otherClubId}`)return false;
   if(e.reason==='former-club'){if(!career.manager.stationHistory?.some(s=>s.clubId===e.otherClubId&&s.toSeason<e.season&&s.fromSeason<=e.season))return false;}
   else if(e.reason==='previous-semifinal'){if(cup.type!=='europe')return false;const p=career.world.competitions.filter(c=>c.season<e.season&&c.type==='europe').flatMap(c=>c.fixtures).find(f=>f.id===e.previousFixtureId);if(!p?.result||!['SF','F'].includes(p.round)||![p.homeId,p.awayId].includes(e.clubId)||![p.homeId,p.awayId].includes(e.otherClubId))return false;}else return false;
  }else if(e.type==='youth-final'){
   const origin=career.world.careerEvents?.events.find(o=>o.id===e.originEventId),r=f?.result,side=f?.homeId===e.clubId?0:1;
   if(!origin||origin.type!=='youth-promotion'||origin.pid!==e.pid||origin.clubId!==e.clubId||origin.playerName!==e.playerName||!e.pid.startsWith(`${career.world.seed}:${e.clubId}:Y`)||f.round!=='F'||r?.winnerId!==e.clubId||r.penalties||Math.abs(r.homeGoals-r.awayGoals)!==1||e.goal?.type!=='goal'||e.goal.side!==side||e.goal.scorerPid!==e.pid||!Number.isFinite(e.goal.minute)||e.goal.minute<0||e.goal.minute>130||origin.season>e.season||(origin.season===e.season&&origin.day>e.day)||e.day!==f.day||e.id!==`youth-final:${f.id}:${e.pid}`)return false;
   if(f.matchRecord?.events){const goals=f.matchRecord.events.filter(g=>g.type==='goal'&&g.side===side);if(!v161SameData(goals[(side===0?r.awayGoals:r.homeGoals)],e.goal))return false;}
  }else return false;
 }
 return log.readIds.every(id=>ids.has(id)||(career.world.eventLog.visibleNews||[]).some(e=>e.id===id));
 }catch{return false;}
}
const v170BaseCreate=v167CreateCareer;
v167CreateCareer=function(...args){const c=v170BaseCreate(...args);c.world.storyLog={version:170,events:[],readIds:[]};v170SeasonEntry(c);return c;};
const v170BaseAfter=v66AfterFixture;
v66AfterFixture=function(c,f){const result=v170BaseAfter(c,f);v170Fixture(c,f);return result;};
const v170BaseAdvance=v62AdvanceDay;
v62AdvanceDay=function(c){const result=v170BaseAdvance(c);v170Progress(c);return result;};
const v170BaseClose=v67SeasonEnd;
v67SeasonEnd=function(c){const result=v170BaseClose(c);v170CountryPlaces(c);return result;};
const v170BaseNext=v62NextSeason;
v62NextSeason=function(c){const result=v170BaseNext(c);v170SeasonEntry(c);return result;};
const v170BaseValidate=v161ValidateRules;
v161ValidateRules=function(c){return v170Validate(c)&&v170BaseValidate(c);};
if(typeof window==='object')Object.assign(window.D6Expansion,{createCareer:v167CreateCareer,advanceDay:v62AdvanceDay,nextSeason:v62NextSeason,storyHistory:v170History,readStory:v170Read});
