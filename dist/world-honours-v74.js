'use strict';

// Erfolge der neuen Vereinswelt werden nur aus abgeschlossenen Partien vergeben.
function v74HonourFactor(player){
 let personal=0,titles=0,bonus=0;
 for(const honour of player.honours||[]){
  if(honour.kind==='man-of-the-match')continue;
  if(honour.kind==='title')bonus+=.06*Math.pow(.7,titles++);
  else bonus+=.08*Math.pow(.7,personal++);
 }
 return 1+Math.min(.3,bonus);
}
function v74AllPlayers(career){return [...career.world.clubs.flatMap(club=>club.roster),...career.world.market.freePlayers]}
function v74GiveHonour(player,season,competition,kind,clubId){
 const id=`${competition.id}:${kind}:${player.pid}`;
 if(player.honours.some(item=>item.id===id))return;
 player.honours.push({id,season,competitionId:competition.id,kind,clubId});
}
function v74MatchWinner(record){
 return record.players.filter(item=>Number.isFinite(item.rating)&&item.minutes>=20).sort((a,b)=>b.rating-a.rating||b.goals-a.goals||b.assists-a.assists||b.minutes-a.minutes||a.pid.localeCompare(b.pid))[0]||null;
}
function v74LeagueRankings(career,competition){
 const candidates=v74AllPlayers(career).map(player=>{
  const games=player.history.filter(item=>item.season===competition.season&&item.competitionId===competition.id);
  return{player,games,goals:games.reduce((sum,item)=>sum+item.goals,0),assists:games.reduce((sum,item)=>sum+item.assists,0),minutes:games.reduce((sum,item)=>sum+item.minutes,0),ratings:games.filter(item=>Number.isFinite(item.rating)).map(item=>item.rating)};
 }).filter(item=>item.games.length);
 const scorers=candidates.filter(item=>item.goals>0).sort((a,b)=>b.goals-a.goals||b.assists-a.assists||a.minutes-b.minutes||a.player.pid.localeCompare(b.player.pid));
 const best=candidates.filter(item=>item.games.length>=3&&item.minutes>=135&&item.ratings.length>=3)
  .map(item=>({...item,score:item.ratings.reduce((sum,rating)=>sum+rating,0)/item.ratings.length+item.goals*.1+item.assists*.06}))
  .sort((a,b)=>b.score-a.score||b.minutes-a.minutes||a.player.pid.localeCompare(b.player.pid));
 return{scorers,best};
}
const v74BaseFinishFixture=v64FinishFixture;
v64FinishFixture=function(career,fixture,state){
 const existing=Boolean(fixture.matchRecord);
 const record=v74BaseFinishFixture(career,fixture,state);
 if(existing||Object.hasOwn(record,'manOfMatchPid'))return record;
 const winner=v74MatchWinner(record);
 record.manOfMatchPid=winner?.pid||null;
 if(winner){
  const player=v74AllPlayers(career).find(item=>item.pid===winner.pid),clubId=winner.side===0?fixture.homeId:fixture.awayId,id=`${fixture.id}:man-of-the-match:${winner.pid}`;
  if(player&&!player.honours.some(item=>item.id===id))player.honours.push({id,season:career.world.season,competitionId:fixture.competitionId,fixtureId:fixture.id,kind:'man-of-the-match',clubId});
 }
 return record;
};
function v74CloseSeason(career){
 const world=career.world,season=world.season;
 if(world.honoursClosedSeason===season)return;
 const players=v74AllPlayers(career),competitions=v62Current(career);
 for(const competition of competitions){
  if(!competition.winnerId)continue;
  for(const player of players){
   if(player.history.some(item=>item.season===season&&item.competitionId===competition.id&&item.clubId===competition.winnerId&&item.minutes>0))
    v74GiveHonour(player,season,competition,'title',competition.winnerId);
  }
  if(competition.type!=='league')continue;
  const rankings=v74LeagueRankings(career,competition),scorer=rankings.scorers[0];
  if(scorer)v74GiveHonour(scorer.player,season,competition,'top-scorer',scorer.games.at(-1).clubId);
  const best=rankings.best[0];
  if(best)v74GiveHonour(best.player,season,competition,'player-of-season',best.games.at(-1).clubId);
 }
 world.honoursClosedSeason=season;
}
function v74HonourLabel(honour){
 if(honour.kind==='man-of-the-match')return'Man of the Match';
 if(honour.kind==='top-scorer')return'Torschützenkönig';
 if(honour.kind==='player-of-season')return'Spieler der Saison';
 return honour.competitionId.endsWith(':LEAGUE')?'Meister':honour.competitionId.endsWith(':CUP')?'Pokalsieger':'Europacupsieger';
}
